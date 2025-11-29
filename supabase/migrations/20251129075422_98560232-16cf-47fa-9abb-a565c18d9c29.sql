-- Create app_role enum for user roles
CREATE TYPE public.app_role AS ENUM ('admin', 'premium', 'user');

-- Create user_roles table for role management
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  role app_role NOT NULL DEFAULT 'user',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer function to check user roles (MUST be defined before policies use it)
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

-- RLS policies for user_roles (NOW that has_role exists)
CREATE POLICY "Users can view their own roles"
  ON public.user_roles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all roles"
  ON public.user_roles FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage roles"
  ON public.user_roles FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- Create reserved_usernames table
CREATE TABLE public.reserved_usernames (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username TEXT NOT NULL UNIQUE,
  reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.reserved_usernames ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Reserved usernames are viewable by everyone"
  ON public.reserved_usernames FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage reserved usernames"
  ON public.reserved_usernames FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- Insert reserved usernames
INSERT INTO public.reserved_usernames (username, reason) VALUES
  ('dashboard', 'system'), ('auth', 'system'), ('login', 'system'), ('logout', 'system'),
  ('register', 'system'), ('signup', 'system'), ('settings', 'system'), ('profile', 'system'),
  ('admin', 'system'), ('root', 'system'), ('system', 'system'), ('api', 'system'),
  ('help', 'system'), ('support', 'system'), ('terms', 'system'), ('privacy', 'system'),
  ('about', 'system'), ('contact', 'system'), ('home', 'system'), ('www', 'system'),
  ('app', 'system'), ('status', 'system'), ('blog', 'system'), ('news', 'system'),
  ('null', 'system'), ('undefined', 'system'), ('true', 'system'), ('false', 'system'),
  ('nan', 'system'), ('adminpanel', 'system'), ('superuser', 'system'), ('owner', 'system'),
  ('mod', 'system'), ('moderator', 'system'), ('systemuser', 'system'), ('guest', 'system'),
  ('test', 'system'), ('example', 'system');

-- Insert HTTP status codes as reserved
INSERT INTO public.reserved_usernames (username, reason)
SELECT code::text, 'http_code'
FROM unnest(ARRAY[
  100, 101, 102, 103, 200, 201, 202, 203, 204, 205, 206, 207, 208, 226,
  300, 301, 302, 303, 304, 305, 306, 307, 308,
  400, 401, 402, 403, 404, 405, 406, 407, 408, 409, 410, 411, 412, 413, 414, 415, 416, 417, 418, 421, 422, 423, 424, 425, 426, 428, 429, 431, 451,
  500, 501, 502, 503, 504, 505, 506, 507, 508, 510, 511
]) AS code;

-- Extend profiles table
ALTER TABLE public.profiles ADD COLUMN occupation TEXT;
ALTER TABLE public.profiles ADD COLUMN location TEXT;
ALTER TABLE public.profiles ADD COLUMN tags TEXT[] DEFAULT '{}';
ALTER TABLE public.profiles ADD COLUMN avatar_shape TEXT DEFAULT 'circle' CHECK (avatar_shape IN ('square', 'soft', 'rounded', 'circle'));
ALTER TABLE public.profiles ADD COLUMN decoration TEXT;
ALTER TABLE public.profiles ADD COLUMN banner_url TEXT;

-- Extend user_pages table with appearance settings
ALTER TABLE public.user_pages ADD COLUMN layout_floating_avatar BOOLEAN DEFAULT false;
ALTER TABLE public.user_pages ADD COLUMN layout_stacked BOOLEAN DEFAULT false;
ALTER TABLE public.user_pages ADD COLUMN layout_compact_row BOOLEAN DEFAULT false;
ALTER TABLE public.user_pages ADD COLUMN layout_showcase BOOLEAN DEFAULT false;
ALTER TABLE public.user_pages ADD COLUMN card_template TEXT DEFAULT 'classic' CHECK (card_template IN ('classic', 'frosted_square', 'frosted_soft', 'outlined', 'aurora', 'transparent'));
ALTER TABLE public.user_pages ADD COLUMN card_radius INTEGER DEFAULT 16;
ALTER TABLE public.user_pages ADD COLUMN card_advanced BOOLEAN DEFAULT false;
ALTER TABLE public.user_pages ADD COLUMN bg_type TEXT DEFAULT 'gradient' CHECK (bg_type IN ('solid', 'gradient', 'media'));
ALTER TABLE public.user_pages ADD COLUMN bg_media_url TEXT;
ALTER TABLE public.user_pages ADD COLUMN premium_starry_bg BOOLEAN DEFAULT false;
ALTER TABLE public.user_pages ADD COLUMN premium_name_effect BOOLEAN DEFAULT false;
ALTER TABLE public.user_pages ADD COLUMN premium_bio_effect BOOLEAN DEFAULT false;
ALTER TABLE public.user_pages ADD COLUMN premium_page_overlay BOOLEAN DEFAULT false;
ALTER TABLE public.user_pages ADD COLUMN premium_cursor_trail BOOLEAN DEFAULT false;
ALTER TABLE public.user_pages ADD COLUMN premium_bg_effects BOOLEAN DEFAULT false;
ALTER TABLE public.user_pages ADD COLUMN premium_animate_views BOOLEAN DEFAULT false;
ALTER TABLE public.user_pages ADD COLUMN premium_tilting_card BOOLEAN DEFAULT false;
ALTER TABLE public.user_pages ADD COLUMN premium_glowing_icons BOOLEAN DEFAULT false;
ALTER TABLE public.user_pages ADD COLUMN premium_audio_visualizer BOOLEAN DEFAULT false;

-- Create tracks table for music uploads
CREATE TABLE public.tracks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  artist TEXT,
  audio_url TEXT NOT NULL,
  cover_url TEXT,
  duration INTEGER,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.tracks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Tracks are viewable by everyone"
  ON public.tracks FOR SELECT
  USING (true);

CREATE POLICY "Users can manage their own tracks"
  ON public.tracks FOR ALL
  USING (auth.uid() = user_id);

CREATE TRIGGER update_tracks_updated_at
  BEFORE UPDATE ON public.tracks
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Add track layout preferences to user_pages
ALTER TABLE public.user_pages ADD COLUMN tracks_layout TEXT DEFAULT 'default' CHECK (tracks_layout IN ('default', 'compact'));
ALTER TABLE public.user_pages ADD COLUMN tracks_banner_style TEXT DEFAULT 'vinyl' CHECK (tracks_banner_style IN ('vinyl', 'cover_vinyl'));

-- Create badges table (placeholder)
CREATE TABLE public.badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  badge_type TEXT NOT NULL,
  badge_data JSONB,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.badges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Badges are viewable by everyone"
  ON public.badges FOR SELECT
  USING (true);

CREATE POLICY "Users can manage their own badges"
  ON public.badges FOR ALL
  USING (auth.uid() = user_id);

-- Create widgets table (placeholder)
CREATE TABLE public.widgets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  widget_type TEXT NOT NULL,
  widget_data JSONB,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.widgets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Widgets are viewable by everyone"
  ON public.widgets FOR SELECT
  USING (true);

CREATE POLICY "Users can manage their own widgets"
  ON public.widgets FOR ALL
  USING (auth.uid() = user_id);

-- Create storage buckets
INSERT INTO storage.buckets (id, name, public) VALUES 
  ('avatars', 'avatars', true),
  ('banners', 'banners', true),
  ('backgrounds', 'backgrounds', true),
  ('music', 'music', true);

-- Storage policies for avatars
CREATE POLICY "Avatar images are publicly accessible"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload their own avatar"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own avatar"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own avatar"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Storage policies for banners
CREATE POLICY "Banner images are publicly accessible"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'banners');

CREATE POLICY "Users can upload their own banner"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'banners' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own banner"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'banners' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own banner"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'banners' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Storage policies for backgrounds
CREATE POLICY "Background media is publicly accessible"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'backgrounds');

CREATE POLICY "Users can upload their own background"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'backgrounds' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own background"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'backgrounds' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own background"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'backgrounds' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Storage policies for music
CREATE POLICY "Music files are publicly accessible"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'music');

CREATE POLICY "Users can upload their own music"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'music' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own music"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'music' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own music"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'music' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Function to check if username is reserved
CREATE OR REPLACE FUNCTION public.is_username_reserved(_username TEXT)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.reserved_usernames
    WHERE LOWER(username) = LOWER(_username)
  )
$$;

-- Add trigger to assign default user role on profile creation
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

CREATE TRIGGER on_profile_created_assign_role
  AFTER INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.assign_default_role();