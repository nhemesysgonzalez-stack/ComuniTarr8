-- ==========================================
-- FIX STORAGE PERMISSIONS (RESET SCRIPT)
-- Run this in your Supabase SQL Editor
-- ==========================================

-- 1. Create the 'incidents' bucket if it doesn't exist
insert into storage.buckets (id, name, public)
values ('incidents', 'incidents', true)
on conflict (id) do nothing;

-- 2. RESET POLICIES (Drop first to avoid "already exists" errors)
-- We wrap in a DO block to ignore errors if they don't exist
DO $$
BEGIN
    BEGIN
        DROP POLICY "Public Access Incidents" ON storage.objects;
    EXCEPTION
        WHEN undefined_object THEN null;
    END;

    BEGIN
        DROP POLICY "Authenticated Users Upload Incidents" ON storage.objects;
    EXCEPTION
        WHEN undefined_object THEN null;
    END;

     BEGIN
        DROP POLICY "Users Update Own Incidents Photos" ON storage.objects;
    EXCEPTION
        WHEN undefined_object THEN null;
    END;
END $$;

-- 3. RE-CREATE POLICIES (Correct permissions)

-- Allow PUBLIC read access (Essential for viewing images app-wide)
create policy "Public Access Incidents"
  on storage.objects for select
  using ( bucket_id = 'incidents' );

-- Allow AUTHENTICATED users to upload photos (This was likely the missing/broken part)
create policy "Authenticated Users Upload Incidents"
  on storage.objects for insert
  with check ( bucket_id = 'incidents' AND auth.role() = 'authenticated' );

-- Allow users to update/delete their own
create policy "Users Update Own Incidents Photos"
  on storage.objects for update
  using ( bucket_id = 'incidents' AND auth.uid() = owner );
