
-- Create staff_members table
CREATE TABLE public.staff_members (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  faculty TEXT NOT NULL,
  department TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  rank TEXT,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.staff_members ENABLE ROW LEVEL SECURITY;

-- Public read access (staff directory is public info)
CREATE POLICY "Staff members are publicly viewable"
  ON public.staff_members
  FOR SELECT
  USING (true);

-- Only authenticated admins can modify (we'll add admin role later if needed)
CREATE POLICY "Authenticated users can insert staff"
  ON public.staff_members
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update staff"
  ON public.staff_members
  FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can delete staff"
  ON public.staff_members
  FOR DELETE
  TO authenticated
  USING (true);

-- Timestamp trigger
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_staff_members_updated_at
  BEFORE UPDATE ON public.staff_members
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for common queries
CREATE INDEX idx_staff_faculty ON public.staff_members(faculty);
CREATE INDEX idx_staff_department ON public.staff_members(department);
CREATE INDEX idx_staff_rank ON public.staff_members(rank);
CREATE INDEX idx_staff_name ON public.staff_members USING gin(to_tsvector('english', name));
