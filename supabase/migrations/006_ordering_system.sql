-- ============================================================
-- Migration 006: Ordering System Enhancements
-- Adds order_source, payment_method, customer_email,
-- delivery_landmark, and indexes to the orders table.
-- ============================================================

-- ── Add order_source enum ─────────────────────────────────
do $$ begin
  create type order_source as enum (
    'website', 'whatsapp', 'phone', 'walk_in', 'admin'
  );
exception when duplicate_object then null; end $$;
-- ── Add payment_method enum ───────────────────────────────
do $$ begin
  create type payment_method as enum (
    'paystack', 'cash_on_pickup', 'cash_on_delivery', 'whatsapp', 'unpaid'
  );
exception when duplicate_object then null; end $$;

-- ── Add new columns to orders (idempotent) ────────────────
alter table orders
  add column if not exists order_source    order_source    not null default 'website',
  add column if not exists payment_method  payment_method  not null default 'unpaid',
  add column if not exists customer_email  text,
  add column if not exists delivery_landmark text;

-- ── Add missing indexes ───────────────────────────────────
create index if not exists orders_source_idx     on orders(order_source);
create index if not exists orders_payment_idx    on orders(payment_status);
create index if not exists orders_location_idx   on orders(location_id);

-- ── Update create_order() to accept new fields ────────────
create or replace function create_order(
  p_customer_id       uuid,
  p_location_id       uuid,
  p_order_type        order_type,
  p_order_source      order_source,
  p_payment_method    payment_method,
  p_customer_name     text,
  p_customer_phone    text,
  p_customer_email    text,
  p_delivery_address  text,
  p_delivery_landmark text,
  p_customer_notes    text,
  p_items             jsonb  -- [{menu_item_id, quantity, special_request?}]
)
returns jsonb language plpgsql security definer
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
  v_min_order   numeric := 0;
begin
  -- Validate at least one item
  if jsonb_array_length(p_items) = 0 then
    raise exception 'Order must contain at least one item';
  end if;

  -- Minimum order check
  select coalesce(value::numeric, 0)
    into v_min_order
    from site_settings
   where key = 'min_order_amount';

  -- Calculate subtotal using REAL prices from database
  for v_item in select * from jsonb_array_elements(p_items) loop
    select * into v_menu_item
      from menu_items
     where id = (v_item->>'menu_item_id')::uuid
       and is_available = true;

    if not found then
      raise exception 'Menu item % is not available', v_item->>'menu_item_id';
    end if;

    if v_menu_item.price is null then
      raise exception 'Price not set for item: %', v_menu_item.name;
    end if;

    v_item_sub := v_menu_item.price * (v_item->>'quantity')::int;
    v_subtotal := v_subtotal + v_item_sub;
  end loop;

  -- Enforce minimum order
  if v_subtotal < v_min_order then
    raise exception 'Order total ₦% is below the minimum order amount of ₦%',
      v_subtotal::text, v_min_order::text;
  end if;

  -- Delivery fee (only for delivery orders)
  if p_order_type = 'delivery' then
    select coalesce(value::numeric, 0)
      into v_delivery
      from site_settings
     where key = 'delivery_fee';
  end if;

  v_total    := v_subtotal + v_delivery;
  v_order_num := generate_order_number();

  -- Insert order
  insert into orders (
    customer_id, location_id, order_number, order_type,
    order_source, payment_method,
    subtotal, delivery_fee, discount, total,
    customer_name, customer_phone, customer_email,
    delivery_address, delivery_landmark, customer_notes
  ) values (
    p_customer_id, p_location_id, v_order_num, p_order_type,
    p_order_source, p_payment_method,
    v_subtotal, v_delivery, 0, v_total,
    p_customer_name, p_customer_phone, p_customer_email,
    p_delivery_address, p_delivery_landmark, p_customer_notes
  ) returning id into v_order_id;

  -- Insert order items with price snapshots
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

  -- Return order id + number so frontend can navigate
  return jsonb_build_object(
    'order_id',     v_order_id,
    'order_number', v_order_num,
    'total',        v_total,
    'subtotal',     v_subtotal,
    'delivery_fee', v_delivery
  );
end;
$$;
