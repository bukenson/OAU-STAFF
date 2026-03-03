
-- Add user_id column to staff_members to link profiles to auth accounts
ALTER TABLE public.staff_members ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Create unique index so one user = one profile
CREATE UNIQUE INDEX idx_staff_members_user_id ON public.staff_members(user_id);

-- Drop existing restrictive policies and replace with proper ones
DROP POLICY IF EXISTS "Authenticated users can delete staff" ON public.staff_members;
DROP POLICY IF EXISTS "Authenticated users can insert staff" ON public.staff_members;
DROP POLICY IF EXISTS "Authenticated users can update staff" ON public.staff_members;
DROP POLICY IF EXISTS "Staff members are publicly viewable" ON public.staff_members;

-- Anyone can view staff
CREATE POLICY "Staff members are publicly viewable"
ON public.staff_members FOR SELECT
USING (true);

-- Authenticated users can insert their own profile
CREATE POLICY "Users can insert their own profile"
ON public.staff_members FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Authenticated users can update their own profile
CREATE POLICY "Users can update their own profile"
ON public.staff_members FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

-- Authenticated users can delete their own profile
CREATE POLICY "Users can delete their own profile"
ON public.staff_members FOR DELETE
TO authenticated
USING (auth.uid() = user_id);
