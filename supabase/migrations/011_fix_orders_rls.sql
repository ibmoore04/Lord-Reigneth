-- ============================================================
-- Migration 011: Fix Orders RLS — Strict Isolation
--
-- Root cause of the "My Orders" cross-contamination bug:
-- The original orders SELECT policy for customers was
-- "customer_id = auth.uid()" but migration 007 dropped and
-- replaced the staff/admin policies without preserving
-- proper isolation — and getMyOrders() had no explicit
-- customer_id filter in the query itself.
--
-- This migration:
--   1. Drops ALL existing orders/order_items policies cleanly
--   2. Re-creates them with correct, strict isolation:
--        customer  → only their own rows (customer_id = auth.uid())
--        staff     → only their assigned outlet + must be active
--        admin     → all rows
--   3. The markOrderPaid RLS is also corrected so staff can
--      update payment_status on their outlet's orders.
-- ============================================================

-- ── Drop every existing policy on orders ─────────────────
do $$ declare
  r record;
begin
  for r in
    select policyname
      from pg_policies
     where schemaname = 'public' and tablename = 'orders'
  loop
    execute format('drop policy if exists %I on orders', r.policyname);
  end loop;
end $$;

-- ── Drop every existing policy on order_items ────────────
do $$ declare
  r record;
begin
  for r in
    select policyname
      from pg_policies
     where schemaname = 'public' and tablename = 'order_items'
  loop
    execute format('drop policy if exists %I on order_items', r.policyname);
  end loop;
end $$;

-- ══════════════════════════════════════════════════════════
-- ORDERS — clean policies
-- ══════════════════════════════════════════════════════════
alter table orders enable row level security;

-- 1. Customers: read only their own orders (strict — no leaking)
create policy "orders: customer read own"
  on orders for select
  using (
    auth.uid() is not null
    and customer_id = auth.uid()
    and auth_user_role() = 'customer'
  );

-- 2. Staff: read only orders for their assigned outlet
--    Staff must be active. Cannot see other outlets.
create policy "orders: staff read own outlet"
  on orders for select
  using (
    auth_user_role() = 'staff'
    and (select is_active from profiles where id = auth.uid())
    and location_id = (select location_id from profiles where id = auth.uid())
  );

-- 3. Admin: read all orders
create policy "orders: admin read all"
  on orders for select
  using (auth_user_role() = 'admin');

-- 4. Staff: update status + payment_status for their outlet only
create policy "orders: staff update own outlet"
  on orders for update
  using (
    auth_user_role() = 'staff'
    and (select is_active from profiles where id = auth.uid())
    and location_id = (select location_id from profiles where id = auth.uid())
  );

-- 5. Admin: update any order
create policy "orders: admin update all"
  on orders for update
  using (auth_user_role() = 'admin');

-- ══════════════════════════════════════════════════════════
-- ORDER_ITEMS — clean policies
-- ══════════════════════════════════════════════════════════
alter table order_items enable row level security;

-- 1. Customers: read only items belonging to their own orders
create policy "order_items: customer read own"
  on order_items for select
  using (
    auth.uid() is not null
    and auth_user_role() = 'customer'
    and exists (
      select 1 from orders o
       where o.id = order_items.order_id
         and o.customer_id = auth.uid()
    )
  );

-- 2. Staff: read order items for their outlet only
create policy "order_items: staff read own outlet"
  on order_items for select
  using (
    auth_user_role() = 'staff'
    and (select is_active from profiles where id = auth.uid())
    and exists (
      select 1 from orders o
       where o.id = order_items.order_id
         and o.location_id = (select location_id from profiles where id = auth.uid())
    )
  );

-- 3. Admin: read all
create policy "order_items: admin read all"
  on order_items for select
  using (auth_user_role() = 'admin');
