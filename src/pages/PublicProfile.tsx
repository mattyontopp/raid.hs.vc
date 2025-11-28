import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import MatrixRain from '@/components/MatrixRain';
import GlitchText from '@/components/GlitchText';
import StatusBadge from '@/components/StatusBadge';
import { Card } from '@/components/ui/card';
import { ExternalLink } from 'lucide-react';

interface ProfileData {
  username: string;
  display_name: string | null;
  bio: string | null;
  avatar_url: string | null;
}

interface PageData {
  primary_color: string;
  secondary_color: string;
  font_family: string;
  music_embed: string | null;
  status: string;
}

interface LinkData {
  id: string;
  title: string;
  url: string;
}

const PublicProfile = () => {
  const { username } = useParams();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [page, setPage] = useState<PageData | null>(null);
  const [links, setLinks] = useState<LinkData[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    loadProfile();
  }, [username]);

  const loadProfile = async () => {
    if (!username) return;

    try {
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('username, display_name, bio, avatar_url')
        .eq('username', username.toLowerCase())
        .single();

      if (profileError || !profileData) {
        setNotFound(true);
        setLoading(false);
        return;
      }

      const { data: pageData } = await supabase
        .from('user_pages')
        .select('primary_color, secondary_color, font_family, music_embed, status')
        .eq('user_id', (await supabase.from('profiles').select('id').eq('username', username.toLowerCase()).single()).data?.id)
        .single();

      const { data: linksData } = await supabase
        .from('user_links')
        .select('id, title, url')
        .eq('user_id', (await supabase.from('profiles').select('id').eq('username', username.toLowerCase()).single()).data?.id)
        .order('display_order');

      setProfile(profileData);
      setPage(pageData);
      setLinks(linksData || []);
    } catch (error) {
      setNotFound(true);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-primary font-mono animate-pulse">Loading...</p>
      </div>
    );
  }

  if (notFound || !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-primary mb-4">404</h1>
          <p className="text-muted-foreground font-mono">User not found</p>
          <a href="/" className="text-primary hover:underline font-mono text-sm mt-4 inline-block">
            ← Back to home
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden" style={{ fontFamily: page?.font_family || 'JetBrains Mono' }}>
      <MatrixRain />
      
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4 py-12">
        <div className="w-full max-w-2xl space-y-8">
          
          {/* Profile Section */}
          <div className="text-center space-y-6">
            {profile.avatar_url && (
              <div className="relative inline-block">
                <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-primary/50 animate-float box-glow-purple">
                  <img
                    src={profile.avatar_url}
                    alt={profile.display_name || profile.username}
                    className="w-full h-full object-cover"
                  />
                </div>
                {page && (
                  <div className="absolute -bottom-2 left-1/2 -translate-x-1/2">
                    <StatusBadge status={page.status as 'online' | 'busy' | 'offline'} />
                  </div>
                )}
              </div>
            )}

            <div className="space-y-2">
              <h1 className="text-5xl md:text-6xl font-bold">
                <GlitchText text={profile.display_name || profile.username} className="text-primary" />
              </h1>
              <p className="text-sm text-muted-foreground font-mono">
                @{profile.username}
              </p>
            </div>

            {profile.bio && (
              <div className="max-w-md mx-auto">
                <p className="text-foreground/80 text-sm leading-relaxed font-mono">
                  {profile.bio}
                </p>
              </div>
            )}
          </div>

          {/* Links */}
          <div className="space-y-3">
            {links.map((link) => (
              <a
                key={link.id}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block group"
              >
                <Card className="bg-card/50 backdrop-blur-sm border-primary/20 hover:border-primary/60 hover:bg-card/70 transition-all duration-300 p-4 hover:scale-105 hover:box-glow">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-foreground group-hover:text-primary transition-colors font-mono">
                      {link.title}
                    </span>
                    <ExternalLink className="w-4 h-4 text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </Card>
              </a>
            ))}
          </div>

          {/* Music Player */}
          {page?.music_embed && (
            <Card className="bg-card/50 backdrop-blur-sm border-primary/20 p-6">
              <div className="aspect-[4/1] w-full rounded-lg overflow-hidden">
                <iframe
                  className="w-full h-full"
                  src={page.music_embed.replace('open.spotify.com', 'open.spotify.com/embed')}
                  allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                  loading="lazy"
                />
              </div>
            </Card>
          )}

          {/* Footer */}
          <div className="text-center pt-8">
            <a
              href="/"
              className="text-xs text-muted-foreground hover:text-primary transition-colors font-mono"
            >
              Create your own @ raid.hs.vc
            </a>
          </div>
        </div>
      </div>

      <div className="fixed top-0 right-0 w-64 h-64 bg-gradient-to-bl from-primary/10 via-transparent to-transparent pointer-events-none blur-3xl" />
      <div className="fixed bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-secondary/10 via-transparent to-transparent pointer-events-none blur-3xl" />
    </div>
  );
};

export default PublicProfile;
