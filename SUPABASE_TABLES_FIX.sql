-- ==========================================
-- FIX INCIDENTS TABLE RLS (Essential)
-- Run this in your Supabase SQL Editor
-- ==========================================

-- 1. Ensure RLS is enabled on the incidents table
alter table public.incidents enable row level security;

-- 2. Drop existing policies to avoid conflicts
DO $$
BEGIN
    BEGIN
        DROP POLICY "Allow public select" ON public.incidents;
    EXCEPTION
        WHEN undefined_object THEN null;
    END;

    BEGIN
        DROP POLICY "Allow authenticated insert" ON public.incidents;
    EXCEPTION
        WHEN undefined_object THEN null;
    END;

    BEGIN
        DROP POLICY "Allow users to see all incidents" ON public.incidents;
    EXCEPTION
        WHEN undefined_object THEN null;
    END;

    BEGIN
        DROP POLICY "Allow users to insert their own incidents" ON public.incidents;
    EXCEPTION
        WHEN undefined_object THEN null;
    END;
END $$;

-- 3. Create clean policies for the table

-- Policy: Anyone logged in can see all incidents (Public content for the neighborhood)
CREATE POLICY "Allow users to see all incidents"
ON public.incidents
FOR SELECT
TO authenticated
USING (true);

-- Policy: Anyone logged in can insert an incident
CREATE POLICY "Allow users to insert their own incidents"
ON public.incidents
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Policy: Allow users to update their own incidents (optional but good)
CREATE POLICY "Allow users to update own incidents"
ON public.incidents
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

-- 4. Enable RLS on profiles table just in case (needed for the join)
alter table public.profiles enable row level security;

-- Ensure everyone can see profiles (to see names in incidents)
DO $$
BEGIN
    BEGIN
        DROP POLICY "Public profiles are viewable by everyone" ON public.profiles;
    EXCEPTION
        WHEN undefined_object THEN null;
    END;
END $$;

CREATE POLICY "Public profiles are viewable by everyone"
ON public.profiles
FOR SELECT
USING (true);
