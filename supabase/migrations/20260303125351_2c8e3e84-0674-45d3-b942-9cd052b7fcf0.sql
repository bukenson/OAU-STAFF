
ALTER TABLE public.staff_members
  ADD COLUMN bio TEXT,
  ADD COLUMN publications TEXT[],
  ADD COLUMN research_interests TEXT[],
  ADD COLUMN office_location TEXT,
  ADD COLUMN qualifications TEXT[];
