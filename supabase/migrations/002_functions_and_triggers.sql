-- ============================================================
-- Migration 002: Functions, Triggers, and Stored Procedures
-- ============================================================

-- ── Auto-update updated_at ────────────────────────────────
create or replace function update_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- Apply to every table with updated_at
do $$ declare
  t text;
begin
  foreach t in array array[
    'profiles', 'menu_categories', 'menu_items', 'locations',
    'orders', 'payment_transactions', 'catering_requests',
    'gallery_items', 'testimonials', 'site_settings'
  ] loop
    execute format(
      'drop trigger if exists trg_%1$s_updated_at on %1$s;
       create trigger trg_%1$s_updated_at
         before update on %1$s
         for each row execute function update_updated_at();',
      t
    );
  end loop;
end $$;

-- ── Auto-create profile after signup ──────────────────────
create or replace function handle_new_user()
returns trigger language plpgsql security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    'customer'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- ── Generate human-friendly order number ──────────────────
-- Format: LRF-YYYYMMDD-NNN  (NNN resets per day)
create or replace function generate_order_number()
returns text language plpgsql as $$
declare
  v_date   text := to_char(now(), 'YYYYMMDD');
  v_count  int;
  v_number text;
begin
  select count(*) + 1
    into v_count
    from orders
   where created_at::date = current_date;

  v_number := 'LRF-' || v_date || '-' || lpad(v_count::text, 3, '0');
  return v_number;
end;
$$;

-- ── Safe order creation function ──────────────────────────
-- The server fetches REAL prices from menu_items — never trusts the client.
create or replace function create_order(
  p_customer_id      uuid,
  p_location_id      uuid,
  p_order_type       order_type,
  p_customer_name    text,
  p_customer_phone   text,
  p_delivery_address text,
  p_customer_notes   text,
  p_items            jsonb  -- [{menu_item_id, quantity, special_request?}]
)
returns uuid language plpgsql security definer
set search_path = public
as $$
declare
  v_order_id    uuid;
  v_order_num   text;
  v_subtotal    numeric := 0;
  v_delivery    numeric := 0;
  v_total       numeric;
  v_item        jsonb;
  v_menu_item   menu_items%rowtype;
  v_item_sub    numeric;
begin
  -- Validate at least one item
  if jsonb_array_length(p_items) = 0 then
    raise exception 'Order must contain at least one item';
  end if;

  -- Calculate subtotal by fetching REAL prices from database
  for v_item in select * from jsonb_array_elements(p_items) loop
    select * into v_menu_item
      from menu_items
     where id = (v_item->>'menu_item_id')::uuid
       and is_available = true;

    if not found then
      raise exception 'Menu item % is not available', v_item->>'menu_item_id';
    end if;

    if v_menu_item.price is null then
      raise exception 'Price not set for item %', v_menu_item.name;
    end if;

    v_item_sub := v_menu_item.price * (v_item->>'quantity')::int;
    v_subtotal := v_subtotal + v_item_sub;
  end loop;

  -- Delivery fee (configurable; default 0 for pickup)
  if p_order_type = 'delivery' then
    select coalesce(value::numeric, 0)
      into v_delivery
      from site_settings
     where key = 'delivery_fee';
  end if;

  v_total := v_subtotal + v_delivery;
  v_order_num := generate_order_number();

  -- Insert order
  insert into orders (
    customer_id, location_id, order_number, order_type,
    subtotal, delivery_fee, discount, total,
    customer_name, customer_phone, delivery_address, customer_notes
  ) values (
    p_customer_id, p_location_id, v_order_num, p_order_type,
    v_subtotal, v_delivery, 0, v_total,
    p_customer_name, p_customer_phone, p_delivery_address, p_customer_notes
  ) returning id into v_order_id;

  -- Insert order items (price snapshot)
  for v_item in select * from jsonb_array_elements(p_items) loop
    select * into v_menu_item
      from menu_items
     where id = (v_item->>'menu_item_id')::uuid;

    insert into order_items (
      order_id, menu_item_id, item_name, unit_price,
      quantity, subtotal, special_request
    ) values (
      v_order_id,
      v_menu_item.id,
      v_menu_item.name,
      v_menu_item.price,
      (v_item->>'quantity')::int,
      v_menu_item.price * (v_item->>'quantity')::int,
      v_item->>'special_request'
    );
  end loop;

  return v_order_id;
end;
$$;

-- ── Check if location is currently open ───────────────────
create or replace function is_location_open(p_location_id uuid)
returns boolean language plpgsql stable as $$
declare
  v_day     smallint := extract(dow from now())::smallint;
  v_time    time     := localtime;
  v_hours   business_hours%rowtype;
begin
  select * into v_hours
    from business_hours
   where location_id = p_location_id
     and day_of_week = v_day;

  if not found then return false; end if;
  if v_hours.is_closed then return false; end if;

  return v_time between v_hours.opening_time and v_hours.closing_time;
end;
$$;

-- ── Get user role safely ──────────────────────────────────
create or replace function get_user_role(p_user_id uuid)
returns user_role language plpgsql stable security definer
set search_path = public
as $$
declare
  v_role user_role;
begin
  select role into v_role from profiles where id = p_user_id;
  return coalesce(v_role, 'customer');
end;
$$;

-- ── Validate order status transition ─────────────────────
-- Prevent invalid jumps (e.g., completed → pending)
create or replace function validate_order_status_transition()
returns trigger language plpgsql as $$
begin
  if old.status = new.status then return new; end if;

  -- cancelled is terminal
  if old.status = 'cancelled' then
    raise exception 'Cannot change status of a cancelled order';
  end if;

  -- completed is terminal
  if old.status = 'completed' then
    raise exception 'Cannot change status of a completed order';
  end if;

  -- out_for_delivery only valid for delivery orders
  if new.status = 'out_for_delivery' and new.order_type = 'pickup' then
    raise exception 'Pickup orders cannot have out_for_delivery status';
  end if;

  return new;
end;
$$;

drop trigger if exists trg_order_status_transition on orders;
create trigger trg_order_status_transition
  before update of status on orders
  for each row execute function validate_order_status_transition();
