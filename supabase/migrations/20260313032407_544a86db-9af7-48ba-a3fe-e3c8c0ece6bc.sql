
ALTER TABLE public.staff_members 
  ADD COLUMN IF NOT EXISTS status_availability text DEFAULT 'Active',
  ADD COLUMN IF NOT EXISTS specializations text[] DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS conferences text[] DEFAULT NULL;
