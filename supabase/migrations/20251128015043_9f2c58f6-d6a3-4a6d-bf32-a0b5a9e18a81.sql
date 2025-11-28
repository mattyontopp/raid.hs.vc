-- Create profiles table for user information
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE NOT NULL,
  display_name TEXT,
  bio TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  CONSTRAINT username_length CHECK (char_length(username) >= 3 AND char_length(username) <= 20),
  CONSTRAINT username_format CHECK (username ~ '^[a-z0-9_]+$')
);

-- Create user_pages table for page customization
CREATE TABLE public.user_pages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL UNIQUE,
  background_type TEXT DEFAULT 'gradient' NOT NULL,
  background_value TEXT DEFAULT '{"from": "180 100% 10%", "to": "280 100% 20%"}',
  primary_color TEXT DEFAULT '180 100% 50%',
  secondary_color TEXT DEFAULT '280 100% 70%',
  text_color TEXT DEFAULT '180 100% 90%',
  font_family TEXT DEFAULT 'JetBrains Mono',
  music_embed TEXT,
  status TEXT DEFAULT 'online',
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Create user_links table for social/custom links
CREATE TABLE public.user_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  url TEXT NOT NULL,
  icon TEXT DEFAULT 'link',
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  CONSTRAINT url_format CHECK (url ~ '^https?://')
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_links ENABLE ROW LEVEL SECURITY;

-- Profiles policies (public read, owner write)
CREATE POLICY "Profiles are viewable by everyone"
  ON public.profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- User pages policies
CREATE POLICY "User pages are viewable by everyone"
  ON public.user_pages FOR SELECT
  USING (true);

CREATE POLICY "Users can insert their own page"
  ON public.user_pages FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own page"
  ON public.user_pages FOR UPDATE
  USING (auth.uid() = user_id);

-- User links policies
CREATE POLICY "User links are viewable by everyone"
  ON public.user_links FOR SELECT
  USING (true);

CREATE POLICY "Users can insert their own links"
  ON public.user_links FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own links"
  ON public.user_links FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own links"
  ON public.user_links FOR DELETE
  USING (auth.uid() = user_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Triggers for updated_at
CREATE TRIGGER set_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_user_pages_updated_at
  BEFORE UPDATE ON public.user_pages
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Function to create default page when profile is created
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.user_pages (user_id)
  VALUES (NEW.id);
  RETURN NEW;
END;
$$;

-- Trigger to create page on profile creation
CREATE TRIGGER on_profile_created
  AFTER INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Index for faster username lookups
CREATE INDEX idx_profiles_username ON public.profiles(username);
CREATE INDEX idx_user_links_user_id ON public.user_links(user_id, display_order);