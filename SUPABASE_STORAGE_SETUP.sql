-- ==========================================
-- SETUP SCRIPT FOR COMUNITARR STORAGE
-- Run this in your Supabase SQL Editor
-- ==========================================

-- 1. Enable Storage Extension (usually enabled by default)
-- create extension if not exists "storage";

-- 2. Create the 'incidents' bucket if it doesn't exist
insert into storage.buckets (id, name, public)
values ('incidents', 'incidents', true)
on conflict (id) do nothing;

-- 3. Create RLS Policies for 'incidents'

-- Allow PUBLIC read access (anyone can see incident photos)
create policy "Public Access Incidents"
  on storage.objects for select
  using ( bucket_id = 'incidents' );

-- Allow AUTHENTICATED users to upload photos
create policy "Authenticated Users Upload Incidents"
  on storage.objects for insert
  with check ( bucket_id = 'incidents' AND auth.role() = 'authenticated' );

-- Allow AUTHENTICATED users to update their own photos
create policy "Users Update Own Incidents Photos"
  on storage.objects for update
  using ( bucket_id = 'incidents' AND auth.uid() = owner );

-- Allow AUTHENTICATED users to delete their own photos
create policy "Users Delete Own Incidents Photos"
  on storage.objects for delete
  using ( bucket_id = 'incidents' AND auth.uid() = owner );

-- ==========================================
-- OPTIONAL: Create 'avatars' bucket if missing (referenced in AuthContext)
-- ==========================================
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

create policy "Public Access Avatars"
  on storage.objects for select
  using ( bucket_id = 'avatars' );

create policy "Authenticated Users Upload Avatars"
  on storage.objects for insert
  with check ( bucket_id = 'avatars' AND auth.role() = 'authenticated' );

create policy "Users Update Own Avatars"
  on storage.objects for update
  using ( bucket_id = 'avatars' AND auth.uid() = owner );
