ALTER TABLE public.staff_members 
  ALTER COLUMN publication_link TYPE text[] USING CASE WHEN publication_link IS NOT NULL THEN ARRAY[publication_link] ELSE NULL END;