import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import MatrixRain from '@/components/MatrixRain';
import GlitchText from '@/components/GlitchText';
import StatusBadge from '@/components/StatusBadge';
import { Card } from '@/components/ui/card';
import { ExternalLink, MapPin, Briefcase, Play, Pause } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface ProfileData {
  id: string;
  username: string;
  display_name: string | null;
  bio: string | null;
  avatar_url: string | null;
  avatar_shape: string;
  banner_url: string | null;
  occupation: string | null;
  location: string | null;
  tags: string[];
}

interface PageData {
  primary_color: string;
  secondary_color: string;
  text_color: string;
  font_family: string;
  music_embed: string | null;
  status: string;
  bg_type: string;
  bg_media_url: string | null;
  card_template: string;
  card_radius: number;
  layout_floating_avatar: boolean;
  layout_stacked: boolean;
  layout_compact_row: boolean;
  layout_showcase: boolean;
  tracks_layout: string;
  tracks_banner_style: string;
  premium_starry_bg: boolean;
  premium_name_effect: boolean;
  premium_bio_effect: boolean;
}

interface LinkData {
  id: string;
  title: string;
  url: string;
}

interface TrackData {
  id: string;
  title: string;
  artist: string | null;
  audio_url: string;
  cover_url: string | null;
}

const PublicProfile = () => {
  const { username } = useParams();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [page, setPage] = useState<PageData | null>(null);
  const [links, setLinks] = useState<LinkData[]>([]);
  const [tracks, setTracks] = useState<TrackData[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [currentTrack, setCurrentTrack] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    loadProfile();
  }, [username]);

  const loadProfile = async () => {
    if (!username) return;

    try {
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('username', username.toLowerCase())
        .single();

      if (profileError || !profileData) {
        setNotFound(true);
        setLoading(false);
        return;
      }

      const { data: pageData } = await supabase
        .from('user_pages')
        .select('*')
        .eq('user_id', profileData.id)
        .single();

      const { data: linksData } = await supabase
        .from('user_links')
        .select('*')
        .eq('user_id', profileData.id)
        .order('display_order');

      const { data: tracksData } = await supabase
        .from('tracks')
        .select('*')
        .eq('user_id', profileData.id)
        .order('display_order');

      setProfile(profileData);
      setPage(pageData);
      setLinks(linksData || []);
      setTracks(tracksData || []);
    } catch (error) {
      setNotFound(true);
    } finally {
      setLoading(false);
    }
  };

  const playTrack = (trackUrl: string) => {
    if (currentTrack === trackUrl && isPlaying) {
      setIsPlaying(false);
    } else {
      setCurrentTrack(trackUrl);
      setIsPlaying(true);
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

  const avatarShapeClass = {
    circle: 'rounded-full',
    rounded: 'rounded-2xl',
    soft: 'rounded-lg',
    square: 'rounded-none'
  }[profile.avatar_shape || 'circle'];

  const backgroundStyle = page?.bg_type === 'media' && page?.bg_media_url
    ? { backgroundImage: `url(${page.bg_media_url})`, backgroundSize: 'cover', backgroundPosition: 'center' }
    : {};

  return (
    <div 
      className="min-h-screen relative overflow-hidden" 
      style={{ 
        fontFamily: page?.font_family || 'JetBrains Mono',
        ...backgroundStyle
      }}
    >
      {page?.bg_type !== 'media' && <MatrixRain />}
      
      {page?.bg_type === 'media' && page?.bg_media_url && (
        <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" />
      )}
      
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4 py-12">
        <div className="w-full max-w-2xl space-y-8">
          
          {/* Banner */}
          {profile.banner_url && (
            <div className="w-full h-48 rounded-lg overflow-hidden border-2 border-primary/20">
              <img src={profile.banner_url} alt="Banner" className="w-full h-full object-cover" />
            </div>
          )}
          
          {/* Profile Section */}
          <div className="text-center space-y-6">
            {profile.avatar_url && (
              <div className="relative inline-block">
                <div className={`w-32 h-32 overflow-hidden border-4 border-primary/50 animate-float box-glow-purple ${avatarShapeClass}`}>
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
                {page?.premium_name_effect ? (
                  <GlitchText text={profile.display_name || profile.username} className="text-primary" />
                ) : (
                  <span className="text-primary">{profile.display_name || profile.username}</span>
                )}
              </h1>
              <p className="text-sm text-muted-foreground font-mono">
                @{profile.username}
              </p>
            </div>

            {profile.bio && (
              <div className="max-w-md mx-auto">
                <p className={`text-foreground/80 text-sm leading-relaxed font-mono ${page?.premium_bio_effect ? 'text-glow' : ''}`}>
                  {profile.bio}
                </p>
              </div>
            )}

            {(profile.occupation || profile.location) && (
              <div className="flex flex-wrap items-center justify-center gap-3 text-sm text-muted-foreground">
                {profile.occupation && (
                  <div className="flex items-center gap-1">
                    <Briefcase className="w-4 h-4" />
                    <span>{profile.occupation}</span>
                  </div>
                )}
                {profile.location && (
                  <div className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    <span>{profile.location}</span>
                  </div>
                )}
              </div>
            )}

            {profile.tags && profile.tags.length > 0 && (
              <div className="flex flex-wrap justify-center gap-2">
                {profile.tags.map((tag, index) => (
                  <Badge key={index} variant="outline" className="border-primary/30 text-primary">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Links */}
          {links.length > 0 && (
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
          )}

          {/* Tracks */}
          {tracks.length > 0 && (
            <Card className="bg-card/50 backdrop-blur-sm border-primary/20 p-6">
              <h3 className="text-lg font-semibold text-primary mb-4 font-mono">Tracks</h3>
              <div className="space-y-2">
                {tracks.map((track) => (
                  <div
                    key={track.id}
                    className="flex items-center gap-3 p-3 bg-background/30 rounded-lg border border-primary/20 hover:border-primary/40 transition-colors"
                  >
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => playTrack(track.audio_url)}
                      className="shrink-0"
                    >
                      {currentTrack === track.audio_url && isPlaying ? (
                        <Pause className="h-4 w-4" />
                      ) : (
                        <Play className="h-4 w-4" />
                      )}
                    </Button>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold font-mono truncate">{track.title}</p>
                      {track.artist && (
                        <p className="text-sm text-muted-foreground font-mono truncate">{track.artist}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              {currentTrack && (
                <audio
                  src={currentTrack}
                  autoPlay={isPlaying}
                  onEnded={() => setIsPlaying(false)}
                  className="hidden"
                />
              )}
            </Card>
          )}

          {/* Music Embed */}
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
              Create your own @ raid.hs.vc // All rights reserved // powered by void™
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
