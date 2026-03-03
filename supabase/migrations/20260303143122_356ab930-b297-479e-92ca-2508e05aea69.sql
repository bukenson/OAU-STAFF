
-- Create role enum
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');

-- Create user_roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

-- Enable RLS
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer function to check roles (avoids recursive RLS)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- RLS policies for user_roles
CREATE POLICY "Users can view their own roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Only admins can manage roles"
ON public.user_roles
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Update staff_members policies: allow admins to insert/update/delete any profile
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.staff_members;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.staff_members;
DROP POLICY IF EXISTS "Users can delete their own profile" ON public.staff_members;

CREATE POLICY "Users can insert their own profile or admins can insert any"
ON public.staff_members
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = user_id OR public.has_role(auth.uid(), 'admin')
);

CREATE POLICY "Users can update their own profile or admins can update any"
ON public.staff_members
FOR UPDATE
TO authenticated
USING (
  auth.uid() = user_id OR public.has_role(auth.uid(), 'admin')
);

CREATE POLICY "Users can delete their own profile or admins can delete any"
ON public.staff_members
FOR DELETE
TO authenticated
USING (
  auth.uid() = user_id OR public.has_role(auth.uid(), 'admin')
);
