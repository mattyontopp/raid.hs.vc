import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { signOut } from '@/lib/auth';
import { LogOut, Eye, Shield } from 'lucide-react';
import { ProfileTab } from '@/components/dashboard/ProfileTab';
import { AppearanceTab } from '@/components/dashboard/AppearanceTab';
import { LinksTab } from '@/components/dashboard/LinksTab';
import { BadgesTab } from '@/components/dashboard/BadgesTab';
import { WidgetsTab } from '@/components/dashboard/WidgetsTab';
import { TracksTab } from '@/components/dashboard/TracksTab';
import { AccountTab } from '@/components/dashboard/AccountTab';

interface Profile {
  id: string;
  username: string;
  display_name: string | null;
  bio: string | null;
  avatar_url: string | null;
  avatar_shape: string;
  decoration: string | null;
  banner_url: string | null;
  occupation: string | null;
  location: string | null;
  tags: string[];
}

interface UserPage {
  user_id: string;
  layout_floating_avatar: boolean;
  layout_stacked: boolean;
  layout_compact_row: boolean;
  layout_showcase: boolean;
  card_template: string;
  card_radius: number;
  card_advanced: boolean;
  bg_type: string;
  bg_media_url: string | null;
  primary_color: string;
  secondary_color: string;
  text_color: string;
  font_family: string;
  tracks_layout: string;
  tracks_banner_style: string;
  music_embed: string | null;
  status: string;
  premium_starry_bg: boolean;
  premium_name_effect: boolean;
  premium_bio_effect: boolean;
}

const Dashboard = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [page, setPage] = useState<UserPage | null>(null);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState('');
  const [isPremium, setIsPremium] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        navigate('/auth');
        return;
      }

      setEmail(user.email || '');

      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      const { data: pageData } = await supabase
        .from('user_pages')
        .select('*')
        .eq('user_id', user.id)
        .single();

      const { data: roles } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id);
      
      setIsPremium(roles?.some(r => r.role === 'premium') || false);
      setIsAdmin(roles?.some(r => r.role === 'admin') || false);

      setProfile(profileData);
      setPage(pageData);
    } catch (error) {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  if (loading || !profile || !page) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-primary font-mono animate-pulse">Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-primary font-mono">Dashboard</h1>
            <p className="text-muted-foreground font-mono text-sm">@{profile.username}</p>
          </div>
          <div className="flex gap-2">
            {isAdmin && (
              <Button
                variant="outline"
                onClick={() => navigate('/admin')}
                className="border-primary/30 hover:border-primary"
              >
                <Shield className="w-4 h-4 mr-2" />
                Admin
              </Button>
            )}
            <Button
              variant="outline"
              onClick={() => window.open(`/${profile.username}`, '_blank')}
              className="border-primary/30 hover:border-primary"
            >
              <Eye className="w-4 h-4 mr-2" />
              Preview
            </Button>
            <Button
              variant="outline"
              onClick={handleSignOut}
              className="border-destructive/30 hover:border-destructive"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>

        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="grid w-full grid-cols-7 mb-6 bg-card/50 border border-primary/20">
            <TabsTrigger value="profile" className="font-mono">Profile</TabsTrigger>
            <TabsTrigger value="appearance" className="font-mono">Appearance</TabsTrigger>
            <TabsTrigger value="links" className="font-mono">Links</TabsTrigger>
            <TabsTrigger value="badges" className="font-mono">Badges</TabsTrigger>
            <TabsTrigger value="widgets" className="font-mono">Widgets</TabsTrigger>
            <TabsTrigger value="tracks" className="font-mono">Tracks</TabsTrigger>
            <TabsTrigger value="account" className="font-mono">Account</TabsTrigger>
          </TabsList>

          <TabsContent value="profile">
            <ProfileTab profile={profile} onUpdate={loadUserData} />
          </TabsContent>

          <TabsContent value="appearance">
            <AppearanceTab page={page} isPremium={isPremium} onUpdate={loadUserData} />
          </TabsContent>

          <TabsContent value="links">
            <LinksTab userId={profile.id} />
          </TabsContent>

          <TabsContent value="badges">
            <BadgesTab />
          </TabsContent>

          <TabsContent value="widgets">
            <WidgetsTab />
          </TabsContent>

          <TabsContent value="tracks">
            <TracksTab 
              userId={profile.id}
              layout={page.tracks_layout}
              bannerStyle={page.tracks_banner_style}
              onUpdate={loadUserData}
            />
          </TabsContent>

          <TabsContent value="account">
            <AccountTab username={profile.username} email={email} />
          </TabsContent>
        </Tabs>

        <div className="bg-card/50 backdrop-blur-sm border border-primary/20 rounded-lg p-4 mt-6 text-center">
          <p className="text-muted-foreground font-mono text-sm mb-2">Your public page:</p>
          <a
            href={`/${profile.username}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline font-mono font-semibold"
          >
            {window.location.origin}/{profile.username}
          </a>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
