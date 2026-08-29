-- ============================================================
-- Migration 009: Housekeeping
-- 1. Drop the old 8-parameter create_order() if it still exists
--    (it was defined in 002 but superseded by 006).
-- 2. Grant anon+authenticated access to track_order_by_number().
-- 3. Update site_settings with correct WhatsApp number.
-- 4. Add anon RLS policy for order tracking via RPC.
-- ============================================================

-- ── 1. Remove the old create_order overload if it exists ──
-- The new 12-param version (migration 006) is the only valid one.
-- PostgreSQL identifies functions by name + argument types.
-- The old signature was: (uuid, uuid, order_type, text, text, text, text, jsonb)
do $$ begin
  drop function if exists create_order(
    uuid, uuid, order_type, text, text, text, text, jsonb
  );
exception when others then null; end $$;

-- ── 2. Grant track_order_by_number to anon ───────────────
-- Needed for guest order tracking without logging in.
-- The function already enforces phone verification internally.
do $$ begin
  grant execute on function track_order_by_number(text, text)
    to anon, authenticated;
exception when others then null; end $$;

-- ── 3. Update WhatsApp number in site_settings ────────────
insert into site_settings (key, value, description) values
  ('whatsapp', '2347053357203', 'WhatsApp number for orders (no + prefix, for wa.me links)')
on conflict (key) do update set value = excluded.value;

-- Also update phone to match
insert into site_settings (key, value, description) values
  ('phone', '+234 705 335 7203', 'Primary contact phone number')
on conflict (key) do update set value = excluded.value;

-- ── 4. Allow anon users to read their own order via RPC ──
-- The orders table RLS blocks anon reads, but the
-- track_order_by_number() function is SECURITY DEFINER,
-- so it bypasses RLS internally. No additional table policy needed.
-- Confirm: the function already has SECURITY DEFINER + proper verify logic.

-- ── 5. Ensure create_order is callable by authenticated users ─
grant execute on function create_order(
  uuid, uuid, order_type, order_source, payment_method,
  text, text, text, text, text, text, jsonb
) to authenticated;

-- Allow anon to call create_order for guest checkout
grant execute on function create_order(
  uuid, uuid, order_type, order_source, payment_method,
  text, text, text, text, text, text, jsonb
) to anon;

-- ── 6. Add guest order insert policy ─────────────────────
-- The existing create_order() is SECURITY DEFINER, so it can
-- insert orders even without a customer_id. We need to make
-- sure anon users can CALL the function (granted above) but
-- cannot directly INSERT into orders (RLS still blocks that).
-- This is the correct architecture — no changes to RLS needed.

-- ── 7. Realtime publication for orders ───────────────────
-- Ensure orders table is in the realtime publication
-- (may already be there; alter is idempotent if already added)
do $$ begin
  alter publication supabase_realtime add table orders;
exception when duplicate_object then null;
         when undefined_object   then null; -- publication may not exist yet
end $$;
