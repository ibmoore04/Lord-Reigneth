-- ============================================================
-- Migration 004: Supabase Storage Buckets & Policies
-- Run AFTER creating buckets in Supabase dashboard OR via CLI.
-- ============================================================

-- Create buckets (idempotent via Supabase Storage API)
-- These SQL statements configure policies for existing buckets.
-- Create the actual buckets via: supabase storage create <name>
-- Or via dashboard: Storage → New bucket

-- ── food-images bucket ────────────────────────────────────
-- Public bucket: menu item images can be read by anyone.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'food-images',
  'food-images',
  true,
  5242880, -- 5 MB
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
on conflict (id) do nothing;

-- ── gallery-images bucket ─────────────────────────────────
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'gallery-images',
  'gallery-images',
  true,
  10485760, -- 10 MB
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do nothing;

-- ── avatars bucket ────────────────────────────────────────
-- Public bucket: profile pictures.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'avatars',
  'avatars',
  true,
  2097152, -- 2 MB
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do nothing;

-- ── Storage Policies: food-images ─────────────────────────
create policy "food-images: public read"
  on storage.objects for select
  using (bucket_id = 'food-images');

create policy "food-images: admin/staff upload"
  on storage.objects for insert
  with check (
    bucket_id = 'food-images'
    and auth_user_role() in ('admin', 'staff')
  );

create policy "food-images: admin/staff update"
  on storage.objects for update
  using (
    bucket_id = 'food-images'
    and auth_user_role() in ('admin', 'staff')
  );

create policy "food-images: admin delete"
  on storage.objects for delete
  using (
    bucket_id = 'food-images'
    and auth_user_role() = 'admin'
  );

-- ── Storage Policies: gallery-images ──────────────────────
create policy "gallery-images: public read"
  on storage.objects for select
  using (bucket_id = 'gallery-images');

create policy "gallery-images: admin/staff upload"
  on storage.objects for insert
  with check (
    bucket_id = 'gallery-images'
    and auth_user_role() in ('admin', 'staff')
  );

create policy "gallery-images: admin/staff update"
  on storage.objects for update
  using (
    bucket_id = 'gallery-images'
    and auth_user_role() in ('admin', 'staff')
  );

create policy "gallery-images: admin delete"
  on storage.objects for delete
  using (
    bucket_id = 'gallery-images'
    and auth_user_role() = 'admin'
  );

-- ── Storage Policies: avatars ──────────────────────────────
create policy "avatars: public read"
  on storage.objects for select
  using (bucket_id = 'avatars');

create policy "avatars: authenticated user upload own"
  on storage.objects for insert
  with check (
    bucket_id = 'avatars'
    and auth.uid() is not null
    -- enforce path: avatars/{user_id}/...
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "avatars: user delete own"
  on storage.objects for delete
  using (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
