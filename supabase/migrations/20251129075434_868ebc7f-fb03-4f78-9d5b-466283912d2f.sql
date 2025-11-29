-- Fix search_path for is_username_reserved function
CREATE OR REPLACE FUNCTION public.is_username_reserved(_username TEXT)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.reserved_usernames
    WHERE LOWER(username) = LOWER(_username)
  )
$$;

-- Fix search_path for assign_default_role function  
CREATE OR REPLACE FUNCTION public.assign_default_role()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user');
  RETURN NEW;
END;
$$;