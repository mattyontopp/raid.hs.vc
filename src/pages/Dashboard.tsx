import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { signOut } from '@/lib/auth';
import { LogOut, Plus, Trash2, ExternalLink, Save, Eye } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Profile {
  id: string;
  username: string;
  display_name: string | null;
  bio: string | null;
  avatar_url: string | null;
}

interface UserPage {
  background_type: string;
  background_value: string;
  primary_color: string;
  secondary_color: string;
  text_color: string;
  font_family: string;
  music_embed: string | null;
  status: string;
}

interface UserLink {
  id: string;
  title: string;
  url: string;
  icon: string;
  display_order: number;
}

const Dashboard = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [page, setPage] = useState<UserPage | null>(null);
  const [links, setLinks] = useState<UserLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [newLink, setNewLink] = useState({ title: '', url: '' });

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

      const { data: linksData } = await supabase
        .from('user_links')
        .select('*')
        .eq('user_id', user.id)
        .order('display_order');

      setProfile(profileData);
      setPage(pageData);
      setLinks(linksData || []);
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

  const saveProfile = async () => {
    if (!profile) return;
    
    const { error } = await supabase
      .from('profiles')
      .update({
        display_name: profile.display_name,
        bio: profile.bio,
        avatar_url: profile.avatar_url,
      })
      .eq('id', profile.id);

    if (error) {
      toast.error('Failed to save profile');
    } else {
      toast.success('Profile saved!');
    }
  };

  const savePage = async () => {
    if (!page || !profile) return;
    
    const { error } = await supabase
      .from('user_pages')
      .update(page)
      .eq('user_id', profile.id);

    if (error) {
      toast.error('Failed to save page settings');
    } else {
      toast.success('Page settings saved!');
    }
  };

  const addLink = async () => {
    if (!profile || !newLink.title || !newLink.url) {
      toast.error('Please fill in all fields');
      return;
    }

    if (!newLink.url.startsWith('http://') && !newLink.url.startsWith('https://')) {
      toast.error('URL must start with http:// or https://');
      return;
    }

    const { data, error } = await supabase
      .from('user_links')
      .insert({
        user_id: profile.id,
        title: newLink.title,
        url: newLink.url,
        display_order: links.length,
      })
      .select()
      .single();

    if (error) {
      toast.error('Failed to add link');
    } else {
      setLinks([...links, data]);
      setNewLink({ title: '', url: '' });
      toast.success('Link added!');
    }
  };

  const deleteLink = async (id: string) => {
    const { error } = await supabase
      .from('user_links')
      .delete()
      .eq('id', id);

    if (error) {
      toast.error('Failed to delete link');
    } else {
      setLinks(links.filter(link => link.id !== id));
      toast.success('Link deleted!');
    }
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
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-primary font-mono">Dashboard</h1>
            <p className="text-muted-foreground font-mono text-sm">@{profile.username}</p>
          </div>
          <div className="flex gap-2">
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

        <div className="grid md:grid-cols-2 gap-6">
          {/* Profile Settings */}
          <Card className="bg-card/50 backdrop-blur-sm border-primary/20 p-6">
            <h2 className="text-xl font-semibold mb-4 text-primary font-mono">Profile</h2>
            <div className="space-y-4">
              <div>
                <Label className="font-mono">Display Name</Label>
                <Input
                  value={profile.display_name || ''}
                  onChange={(e) => setProfile({ ...profile, display_name: e.target.value })}
                  className="bg-background/50 border-primary/30 font-mono"
                />
              </div>
              <div>
                <Label className="font-mono">Bio</Label>
                <Textarea
                  value={profile.bio || ''}
                  onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                  className="bg-background/50 border-primary/30 font-mono"
                  rows={3}
                />
              </div>
              <div>
                <Label className="font-mono">Avatar URL</Label>
                <Input
                  value={profile.avatar_url || ''}
                  onChange={(e) => setProfile({ ...profile, avatar_url: e.target.value })}
                  placeholder="https://..."
                  className="bg-background/50 border-primary/30 font-mono"
                />
              </div>
              <Button onClick={saveProfile} className="w-full bg-primary">
                <Save className="w-4 h-4 mr-2" />
                Save Profile
              </Button>
            </div>
          </Card>

          {/* Page Customization */}
          <Card className="bg-card/50 backdrop-blur-sm border-primary/20 p-6">
            <h2 className="text-xl font-semibold mb-4 text-primary font-mono">Page Style</h2>
            <div className="space-y-4">
              <div>
                <Label className="font-mono">Font</Label>
                <Select
                  value={page.font_family}
                  onValueChange={(value) => setPage({ ...page, font_family: value })}
                >
                  <SelectTrigger className="bg-background/50 border-primary/30 font-mono">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="JetBrains Mono">JetBrains Mono</SelectItem>
                    <SelectItem value="Fira Code">Fira Code</SelectItem>
                    <SelectItem value="Source Code Pro">Source Code Pro</SelectItem>
                    <SelectItem value="Inter">Inter</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="font-mono">Primary Color (HSL)</Label>
                <Input
                  value={page.primary_color}
                  onChange={(e) => setPage({ ...page, primary_color: e.target.value })}
                  placeholder="180 100% 50%"
                  className="bg-background/50 border-primary/30 font-mono"
                />
              </div>
              <div>
                <Label className="font-mono">Status</Label>
                <Select
                  value={page.status}
                  onValueChange={(value) => setPage({ ...page, status: value })}
                >
                  <SelectTrigger className="bg-background/50 border-primary/30 font-mono">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="online">Online</SelectItem>
                    <SelectItem value="busy">Busy</SelectItem>
                    <SelectItem value="offline">Offline</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="font-mono">Music Embed (Spotify URL)</Label>
                <Input
                  value={page.music_embed || ''}
                  onChange={(e) => setPage({ ...page, music_embed: e.target.value })}
                  placeholder="https://open.spotify.com/..."
                  className="bg-background/50 border-primary/30 font-mono"
                />
              </div>
              <Button onClick={savePage} className="w-full bg-primary">
                <Save className="w-4 h-4 mr-2" />
                Save Style
              </Button>
            </div>
          </Card>

          {/* Links Management */}
          <Card className="bg-card/50 backdrop-blur-sm border-primary/20 p-6 md:col-span-2">
            <h2 className="text-xl font-semibold mb-4 text-primary font-mono">Links</h2>
            
            {/* Add New Link */}
            <div className="flex gap-2 mb-4">
              <Input
                placeholder="Title"
                value={newLink.title}
                onChange={(e) => setNewLink({ ...newLink, title: e.target.value })}
                className="bg-background/50 border-primary/30 font-mono"
              />
              <Input
                placeholder="https://..."
                value={newLink.url}
                onChange={(e) => setNewLink({ ...newLink, url: e.target.value })}
                className="bg-background/50 border-primary/30 font-mono"
              />
              <Button onClick={addLink} className="bg-primary">
                <Plus className="w-4 h-4" />
              </Button>
            </div>

            {/* Links List */}
            <div className="space-y-2">
              {links.map((link) => (
                <div
                  key={link.id}
                  className="flex items-center gap-2 p-3 bg-background/30 rounded-lg border border-primary/20"
                >
                  <div className="flex-1">
                    <p className="font-semibold text-foreground font-mono">{link.title}</p>
                    <p className="text-xs text-muted-foreground font-mono truncate">{link.url}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => window.open(link.url, '_blank')}
                  >
                    <ExternalLink className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => deleteLink(link.id)}
                  >
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                </div>
              ))}
              {links.length === 0 && (
                <p className="text-center text-muted-foreground font-mono text-sm py-8">
                  No links yet. Add your first link above!
                </p>
              )}
            </div>
          </Card>
        </div>

        {/* Public URL */}
        <Card className="bg-card/50 backdrop-blur-sm border-primary/20 p-4 mt-6 text-center">
          <p className="text-muted-foreground font-mono text-sm mb-2">Your public page:</p>
          <a
            href={`/${profile.username}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline font-mono font-semibold"
          >
            {window.location.origin}/{profile.username}
          </a>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
