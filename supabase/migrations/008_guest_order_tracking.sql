-- ============================================================
-- Migration 008: Guest Order Tracking
-- Allows unauthenticated users to look up their own order
-- using order_number + phone (verified server-side).
-- Adds a public RLS policy scoped to matching customer_phone.
-- ============================================================

-- ── Public order tracking function ───────────────────────
-- Returns order + items only when phone matches.
-- This is called anonymously — never exposes other orders.
create or replace function track_order_by_number(
  p_order_number text,
  p_phone        text
)
returns jsonb language plpgsql security definer
set search_path = public
as $$
declare
  v_order   orders%rowtype;
  v_items   jsonb;
begin
  -- Normalise phone: strip spaces, dashes, leading +
  select * into v_order
    from orders
   where order_number = p_order_number
     and replace(replace(replace(customer_phone, ' ', ''), '-', ''), '+', '')
       = replace(replace(replace(p_phone, ' ', ''), '-', ''), '+', '');

  if not found then
    -- Generic message — don't reveal whether the order or phone is wrong
    raise exception 'Order not found or phone number does not match.';
  end if;

  select jsonb_agg(
    jsonb_build_object(
      'id',              oi.id,
      'item_name',       oi.item_name,
      'unit_price',      oi.unit_price,
      'quantity',        oi.quantity,
      'subtotal',        oi.subtotal,
      'special_request', oi.special_request
    )
  )
  into v_items
  from order_items oi
  where oi.order_id = v_order.id;

  return jsonb_build_object(
    'id',               v_order.id,
    'order_number',     v_order.order_number,
    'status',           v_order.status,
    'order_type',       v_order.order_type,
    'order_source',     v_order.order_source,
    'subtotal',         v_order.subtotal,
    'delivery_fee',     v_order.delivery_fee,
    'total',            v_order.total,
    'payment_status',   v_order.payment_status,
    'customer_name',    v_order.customer_name,
    'customer_phone',   v_order.customer_phone,
    'delivery_address', v_order.delivery_address,
    'delivery_landmark',v_order.delivery_landmark,
    'customer_notes',   v_order.customer_notes,
    'created_at',       v_order.created_at,
    'updated_at',       v_order.updated_at,
    'order_items',      coalesce(v_items, '[]'::jsonb)
  );
end;
$$;

-- Allow anon + authenticated users to call this function
grant execute on function track_order_by_number(text, text) to anon, authenticated;

-- ── RLS: allow customers to read own order by phone match ──
-- This policy lets the getOrderByNumber() call work for logged-in customers.
-- For guests, the track_order_by_number() function is used instead.
drop policy if exists "orders: customer can read own orders" on orders;

create policy "orders: customer can read own orders"
  on orders for select
  using (customer_id = auth.uid());

-- Allow reading by phone for order tracking (authenticated sessions)
create policy "orders: user can track by phone"
  on orders for select
  using (
    auth.uid() is not null
    and customer_phone = (select phone from profiles where id = auth.uid())
  );
