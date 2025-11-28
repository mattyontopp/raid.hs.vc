import { supabase } from '@/integrations/supabase/client';
import { User, Session } from '@supabase/supabase-js';

export const signUp = async (email: string, password: string, username: string) => {
  const redirectUrl = `${window.location.origin}/`;
  
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: redirectUrl,
      data: {
        username,
      },
    },
  });

  if (error) return { error };

  // Create profile after signup
  if (data.user) {
    const { error: profileError } = await supabase.from('profiles').insert({
      id: data.user.id,
      username,
      display_name: username,
    });

    if (profileError) return { error: profileError };
  }

  return { data, error: null };
};

export const signIn = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  return { data, error };
};

export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  return { error };
};

export const getCurrentUser = async (): Promise<{ user: User | null; session: Session | null }> => {
  const { data: { session } } = await supabase.auth.getSession();
  return { user: session?.user ?? null, session };
};
