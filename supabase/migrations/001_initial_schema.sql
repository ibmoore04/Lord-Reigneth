-- ============================================================
-- Migration 001: Initial Schema — Lord Reigneth Foods
-- Creates all tables, enums, indexes, and constraints.
-- Run: supabase db push  (or paste into SQL editor)
-- ============================================================

-- ── Extensions ────────────────────────────────────────────
create extension if not exists "uuid-ossp";
create extension if not exists "pg_trgm"; -- for text search

-- ── Enums ─────────────────────────────────────────────────
do $$ begin
  create type user_role as enum ('customer', 'staff', 'admin');
exception when duplicate_object then null; end $$;

do $$ begin
  create type order_type as enum ('pickup', 'delivery');
exception when duplicate_object then null; end $$;

do $$ begin
  create type order_status as enum (
    'pending', 'confirmed', 'preparing', 'ready',
    'out_for_delivery', 'completed', 'cancelled'
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create type payment_status as enum (
    'unpaid', 'pending', 'paid', 'failed', 'refunded'
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create type catering_status as enum (
    'new', 'contacted', 'quoted', 'confirmed', 'completed', 'cancelled'
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create type contact_status as enum (
    'unread', 'read', 'replied', 'archived'
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create type gallery_category as enum (
    'food', 'restaurant', 'catering', 'events', 'behind_the_scenes'
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create type notification_type as enum (
    'order_created', 'order_confirmed', 'order_preparing',
    'order_ready', 'order_completed', 'catering_update', 'system'
  );
exception when duplicate_object then null; end $$;

-- ── profiles ──────────────────────────────────────────────
create table if not exists profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  full_name   text,
  email       text not null,
  phone       text,
  avatar_url  text,
  role        user_role not null default 'customer',
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- Prevent email duplicates in profiles
create unique index if not exists profiles_email_idx on profiles(email);

-- ── menu_categories ───────────────────────────────────────
create table if not exists menu_categories (
  id            uuid primary key default uuid_generate_v4(),
  name          text not null,
  slug          text not null unique,
  description   text,
  image_url     text,
  display_order int  not null default 0,
  is_active     boolean not null default true,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- ── menu_items ────────────────────────────────────────────
create table if not exists menu_items (
  id               uuid primary key default uuid_generate_v4(),
  category_id      uuid not null references menu_categories(id) on delete restrict,
  name             text not null,
  slug             text not null unique,
  description      text,
  price            numeric(10, 2) check (price is null or price >= 0),
  image_url        text,
  is_available     boolean not null default true,
  is_featured      boolean not null default false,
  preparation_time int,  -- minutes
  display_order    int  not null default 0,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

create index if not exists menu_items_category_idx    on menu_items(category_id);
create index if not exists menu_items_featured_idx    on menu_items(is_featured) where is_featured = true;
create index if not exists menu_items_available_idx   on menu_items(is_available) where is_available = true;

-- ── locations ─────────────────────────────────────────────
create table if not exists locations (
  id            uuid primary key default uuid_generate_v4(),
  name          text not null,
  slug          text not null unique,
  address       text,
  description   text,
  phone         text,
  latitude      numeric(10, 7),
  longitude     numeric(10, 7),
  opening_time  time,
  closing_time  time,
  is_open       boolean not null default true,
  display_order int  not null default 0,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- ── business_hours ────────────────────────────────────────
create table if not exists business_hours (
  id            uuid primary key default uuid_generate_v4(),
  location_id   uuid not null references locations(id) on delete cascade,
  day_of_week   smallint not null check (day_of_week between 0 and 6),
  opening_time  time,
  closing_time  time,
  is_closed     boolean not null default false,
  unique (location_id, day_of_week)
);

-- ── orders ────────────────────────────────────────────────
create table if not exists orders (
  id                 uuid primary key default uuid_generate_v4(),
  customer_id        uuid references profiles(id) on delete set null,
  location_id        uuid references locations(id) on delete set null,
  order_number       text not null unique,
  order_type         order_type not null default 'pickup',
  status             order_status not null default 'pending',
  subtotal           numeric(12, 2) not null check (subtotal >= 0),
  delivery_fee       numeric(12, 2) not null default 0 check (delivery_fee >= 0),
  discount           numeric(12, 2) not null default 0 check (discount >= 0),
  total              numeric(12, 2) not null check (total >= 0),
  customer_name      text not null,
  customer_phone     text not null,
  delivery_address   text,
  customer_notes     text,
  payment_status     payment_status not null default 'unpaid',
  payment_reference  text,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);

create index if not exists orders_customer_idx   on orders(customer_id);
create index if not exists orders_status_idx     on orders(status);
create index if not exists orders_created_at_idx on orders(created_at desc);
create index if not exists orders_number_idx     on orders(order_number);

-- ── order_items ───────────────────────────────────────────
create table if not exists order_items (
  id              uuid primary key default uuid_generate_v4(),
  order_id        uuid not null references orders(id) on delete cascade,
  menu_item_id    uuid references menu_items(id) on delete set null,
  item_name       text not null,    -- snapshot
  unit_price      numeric(10, 2) not null check (unit_price >= 0), -- snapshot
  quantity        int  not null check (quantity > 0),
  subtotal        numeric(12, 2) not null check (subtotal >= 0),
  special_request text,
  created_at      timestamptz not null default now()
);

create index if not exists order_items_order_idx on order_items(order_id);

-- ── payment_transactions ──────────────────────────────────
create table if not exists payment_transactions (
  id               uuid primary key default uuid_generate_v4(),
  order_id         uuid not null references orders(id) on delete restrict,
  customer_id      uuid references profiles(id) on delete set null,
  reference        text not null unique,
  amount           numeric(12, 2) not null check (amount > 0),
  currency         text not null default 'NGN',
  status           payment_status not null default 'pending',
  gateway          text not null default 'paystack',
  gateway_response jsonb,
  paid_at          timestamptz,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

create index if not exists payment_tx_order_idx     on payment_transactions(order_id);
create index if not exists payment_tx_reference_idx on payment_transactions(reference);

-- ── catering_requests ─────────────────────────────────────
create table if not exists catering_requests (
  id             uuid primary key default uuid_generate_v4(),
  name           text not null,
  phone          text not null,
  email          text not null,
  event_type     text not null,
  event_date     date not null,
  guest_count    int  not null check (guest_count > 0),
  event_location text not null,
  message        text,
  status         catering_status not null default 'new',
  admin_notes    text,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

create index if not exists catering_status_idx    on catering_requests(status);
create index if not exists catering_created_idx   on catering_requests(created_at desc);

-- ── contact_messages ──────────────────────────────────────
create table if not exists contact_messages (
  id         uuid primary key default uuid_generate_v4(),
  name       text not null,
  email      text not null,
  phone      text,
  subject    text not null,
  message    text not null,
  status     contact_status not null default 'unread',
  created_at timestamptz not null default now()
);

create index if not exists contact_status_idx  on contact_messages(status);
create index if not exists contact_created_idx on contact_messages(created_at desc);

-- ── newsletter_subscribers ────────────────────────────────
create table if not exists newsletter_subscribers (
  id            uuid primary key default uuid_generate_v4(),
  email         text not null unique,
  subscribed_at timestamptz not null default now(),
  is_active     boolean not null default true,
  source        text
);

-- ── gallery_items ─────────────────────────────────────────
create table if not exists gallery_items (
  id            uuid primary key default uuid_generate_v4(),
  title         text,
  description   text,
  image_url     text not null,
  category      gallery_category not null default 'food',
  display_order int  not null default 0,
  is_featured   boolean not null default false,
  is_active     boolean not null default true,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index if not exists gallery_category_idx on gallery_items(category);
create index if not exists gallery_active_idx   on gallery_items(is_active) where is_active = true;

-- ── testimonials ──────────────────────────────────────────
create table if not exists testimonials (
  id             uuid primary key default uuid_generate_v4(),
  customer_name  text not null,
  content        text not null,
  rating         smallint check (rating between 1 and 5),
  image_url      text,
  is_featured    boolean not null default false,
  is_published   boolean not null default false,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

-- ── site_settings ─────────────────────────────────────────
create table if not exists site_settings (
  id          uuid primary key default uuid_generate_v4(),
  key         text not null unique,
  value       text,
  description text,
  updated_at  timestamptz not null default now()
);

-- ── notifications ─────────────────────────────────────────
create table if not exists notifications (
  id         uuid primary key default uuid_generate_v4(),
  user_id    uuid not null references profiles(id) on delete cascade,
  title      text not null,
  message    text not null,
  type       notification_type not null,
  is_read    boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists notifications_user_idx    on notifications(user_id);
create index if not exists notifications_unread_idx  on notifications(user_id, is_read) where is_read = false;

-- ── audit_logs ────────────────────────────────────────────
create table if not exists audit_logs (
  id          uuid primary key default uuid_generate_v4(),
  user_id     uuid references auth.users(id) on delete set null,
  action      text not null,
  entity_type text not null,
  entity_id   uuid,
  metadata    jsonb,
  created_at  timestamptz not null default now()
);

create index if not exists audit_entity_idx  on audit_logs(entity_type, entity_id);
create index if not exists audit_user_idx    on audit_logs(user_id);
create index if not exists audit_created_idx on audit_logs(created_at desc);
