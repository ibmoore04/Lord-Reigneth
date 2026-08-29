-- ============================================================
-- Migration 003: Row Level Security Policies
-- Every sensitive table gets RLS enabled.
-- Policies are explicit and minimal — never "allow all".
-- ============================================================

-- ── Helper: current user role ────────────────────────────
-- Wraps get_user_role() to avoid repetition in policies.
create or replace function auth_user_role()
returns user_role language sql stable security definer
set search_path = public
as $$
  select get_user_role(auth.uid());
$$;

-- ══════════════════════════════════════════════════════════
-- profiles
-- ══════════════════════════════════════════════════════════
alter table profiles enable row level security;

create policy "profiles: owner can read own profile"
  on profiles for select
  using (id = auth.uid());

create policy "profiles: owner can update own profile"
  on profiles for update
  using (id = auth.uid())
  with check (
    id = auth.uid()
    -- prevent self-promotion to admin/staff
    and role = (select role from profiles where id = auth.uid())
  );

create policy "profiles: admin can read all profiles"
  on profiles for select
  using (auth_user_role() = 'admin');

create policy "profiles: admin can update any profile"
  on profiles for update
  using (auth_user_role() = 'admin');

-- ══════════════════════════════════════════════════════════
-- menu_categories
-- ══════════════════════════════════════════════════════════
alter table menu_categories enable row level security;

create policy "menu_categories: public can read active"
  on menu_categories for select
  using (is_active = true);

create policy "menu_categories: admin/staff can read all"
  on menu_categories for select
  using (auth_user_role() in ('admin', 'staff'));

create policy "menu_categories: admin/staff can insert"
  on menu_categories for insert
  with check (auth_user_role() in ('admin', 'staff'));

create policy "menu_categories: admin/staff can update"
  on menu_categories for update
  using (auth_user_role() in ('admin', 'staff'));

create policy "menu_categories: admin can delete"
  on menu_categories for delete
  using (auth_user_role() = 'admin');

-- ══════════════════════════════════════════════════════════
-- menu_items
-- ══════════════════════════════════════════════════════════
alter table menu_items enable row level security;

create policy "menu_items: public can read available items"
  on menu_items for select
  using (is_available = true);

create policy "menu_items: admin/staff can read all"
  on menu_items for select
  using (auth_user_role() in ('admin', 'staff'));

create policy "menu_items: admin/staff can insert"
  on menu_items for insert
  with check (auth_user_role() in ('admin', 'staff'));

create policy "menu_items: admin/staff can update"
  on menu_items for update
  using (auth_user_role() in ('admin', 'staff'));

create policy "menu_items: admin can delete"
  on menu_items for delete
  using (auth_user_role() = 'admin');

-- ══════════════════════════════════════════════════════════
-- locations
-- ══════════════════════════════════════════════════════════
alter table locations enable row level security;

create policy "locations: public can read open locations"
  on locations for select
  using (is_open = true);

create policy "locations: admin/staff can read all"
  on locations for select
  using (auth_user_role() in ('admin', 'staff'));

create policy "locations: admin can manage"
  on locations for all
  using (auth_user_role() = 'admin');

-- ══════════════════════════════════════════════════════════
-- business_hours
-- ══════════════════════════════════════════════════════════
alter table business_hours enable row level security;

create policy "business_hours: public can read"
  on business_hours for select
  using (true);

create policy "business_hours: admin can manage"
  on business_hours for all
  using (auth_user_role() = 'admin');

-- ══════════════════════════════════════════════════════════
-- orders
-- ══════════════════════════════════════════════════════════
alter table orders enable row level security;

create policy "orders: customer can read own orders"
  on orders for select
  using (customer_id = auth.uid());

create policy "orders: admin/staff can read all orders"
  on orders for select
  using (auth_user_role() in ('admin', 'staff'));

create policy "orders: admin/staff can update order status"
  on orders for update
  using (auth_user_role() in ('admin', 'staff'));

-- Order creation is handled by the create_order() function (security definer)
-- No direct INSERT policy for customers to prevent price manipulation.

-- ══════════════════════════════════════════════════════════
-- order_items
-- ══════════════════════════════════════════════════════════
alter table order_items enable row level security;

create policy "order_items: customer can read own order items"
  on order_items for select
  using (
    exists (
      select 1 from orders
       where orders.id = order_items.order_id
         and orders.customer_id = auth.uid()
    )
  );

create policy "order_items: admin/staff can read all"
  on order_items for select
  using (auth_user_role() in ('admin', 'staff'));

-- ══════════════════════════════════════════════════════════
-- payment_transactions
-- ══════════════════════════════════════════════════════════
alter table payment_transactions enable row level security;

create policy "payment_tx: customer can read own transactions"
  on payment_transactions for select
  using (customer_id = auth.uid());

create policy "payment_tx: admin can read all"
  on payment_transactions for select
  using (auth_user_role() = 'admin');

-- Updates to payment_transactions are done via service-role only (Edge Functions).
-- No direct client update policy.

-- ══════════════════════════════════════════════════════════
-- catering_requests
-- ══════════════════════════════════════════════════════════
alter table catering_requests enable row level security;

create policy "catering: anyone can insert"
  on catering_requests for insert
  with check (true);

create policy "catering: admin/staff can read all"
  on catering_requests for select
  using (auth_user_role() in ('admin', 'staff'));

create policy "catering: admin/staff can update"
  on catering_requests for update
  using (auth_user_role() in ('admin', 'staff'));

-- ══════════════════════════════════════════════════════════
-- contact_messages
-- ══════════════════════════════════════════════════════════
alter table contact_messages enable row level security;

create policy "contact: anyone can insert"
  on contact_messages for insert
  with check (true);

create policy "contact: admin/staff can read all"
  on contact_messages for select
  using (auth_user_role() in ('admin', 'staff'));

create policy "contact: admin/staff can update status"
  on contact_messages for update
  using (auth_user_role() in ('admin', 'staff'));

-- ══════════════════════════════════════════════════════════
-- newsletter_subscribers
-- ══════════════════════════════════════════════════════════
alter table newsletter_subscribers enable row level security;

create policy "newsletter: anyone can subscribe"
  on newsletter_subscribers for insert
  with check (true);

create policy "newsletter: subscriber can unsubscribe themselves"
  on newsletter_subscribers for update
  using (email = (select email from profiles where id = auth.uid()))
  with check (is_active = false);

create policy "newsletter: admin can read all"
  on newsletter_subscribers for select
  using (auth_user_role() = 'admin');

-- ══════════════════════════════════════════════════════════
-- gallery_items
-- ══════════════════════════════════════════════════════════
alter table gallery_items enable row level security;

create policy "gallery: public can read active items"
  on gallery_items for select
  using (is_active = true);

create policy "gallery: admin/staff can read all"
  on gallery_items for select
  using (auth_user_role() in ('admin', 'staff'));

create policy "gallery: admin/staff can insert"
  on gallery_items for insert
  with check (auth_user_role() in ('admin', 'staff'));

create policy "gallery: admin/staff can update"
  on gallery_items for update
  using (auth_user_role() in ('admin', 'staff'));

create policy "gallery: admin can delete"
  on gallery_items for delete
  using (auth_user_role() = 'admin');

-- ══════════════════════════════════════════════════════════
-- testimonials
-- ══════════════════════════════════════════════════════════
alter table testimonials enable row level security;

create policy "testimonials: public can read published"
  on testimonials for select
  using (is_published = true);

create policy "testimonials: admin can manage all"
  on testimonials for all
  using (auth_user_role() = 'admin');

-- ══════════════════════════════════════════════════════════
-- site_settings
-- ══════════════════════════════════════════════════════════
alter table site_settings enable row level security;

create policy "site_settings: public can read"
  on site_settings for select
  using (true);

create policy "site_settings: admin can manage"
  on site_settings for all
  using (auth_user_role() = 'admin');

-- ══════════════════════════════════════════════════════════
-- notifications
-- ══════════════════════════════════════════════════════════
alter table notifications enable row level security;

create policy "notifications: user can read own"
  on notifications for select
  using (user_id = auth.uid());

create policy "notifications: user can mark own as read"
  on notifications for update
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "notifications: admin can read all"
  on notifications for select
  using (auth_user_role() = 'admin');

-- ══════════════════════════════════════════════════════════
-- audit_logs
-- ══════════════════════════════════════════════════════════
alter table audit_logs enable row level security;

-- Only admins can read audit logs; no one can insert/update/delete directly
create policy "audit_logs: admin can read"
  on audit_logs for select
  using (auth_user_role() = 'admin');
