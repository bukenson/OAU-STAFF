
-- Add domain restriction to INSERT policy
DROP POLICY IF EXISTS "Users can insert their own profile or admins can insert any" ON public.staff_members;
CREATE POLICY "Users can insert their own profile or admins can insert any"
ON public.staff_members
FOR INSERT
TO authenticated
WITH CHECK (
  (
    (auth.uid() = user_id)
    AND ((auth.jwt() ->> 'email') LIKE '%@oauife.edu.ng')
  )
  OR has_role(auth.uid(), 'admin'::app_role)
);

-- Add domain restriction to UPDATE policy
DROP POLICY IF EXISTS "Users can update their own profile or admins can update any" ON public.staff_members;
CREATE POLICY "Users can update their own profile or admins can update any"
ON public.staff_members
FOR UPDATE
TO authenticated
USING (
  (
    (auth.uid() = user_id)
    AND ((auth.jwt() ->> 'email') LIKE '%@oauife.edu.ng')
  )
  OR has_role(auth.uid(), 'admin'::app_role)
);
