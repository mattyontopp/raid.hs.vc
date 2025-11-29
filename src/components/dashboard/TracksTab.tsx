import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Play, Trash2, Upload, Music } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { uploadFile, deleteFile } from '@/lib/storage';

interface Track {
  id: string;
  title: string;
  artist: string | null;
  audio_url: string;
  cover_url: string | null;
  duration: number | null;
  display_order: number;
}

interface TracksTabProps {
  userId: string;
  layout: string;
  bannerStyle: string;
  onUpdate: () => void;
}

export const TracksTab = ({ userId, layout, bannerStyle, onUpdate }: TracksTabProps) => {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [newTrack, setNewTrack] = useState({ title: '', artist: '' });
  const [uploading, setUploading] = useState(false);
  const [localLayout, setLocalLayout] = useState(layout);
  const [localBannerStyle, setLocalBannerStyle] = useState(bannerStyle);

  useEffect(() => {
    loadTracks();
  }, []);

  const loadTracks = async () => {
    const { data } = await supabase
      .from('tracks')
      .select('*')
      .eq('user_id', userId)
      .order('display_order');
    
    if (data) setTracks(data);
  };

  const handleAudioUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !newTrack.title) {
      toast.error('Please enter a title first');
      return;
    }

    setUploading(true);
    const { url, error } = await uploadFile('music', file, userId);
    
    if (error) {
      toast.error('Failed to upload audio');
      setUploading(false);
      return;
    }

    const { data, error: insertError } = await supabase
      .from('tracks')
      .insert({
        user_id: userId,
        title: newTrack.title,
        artist: newTrack.artist || null,
        audio_url: url!,
        display_order: tracks.length,
      })
      .select()
      .single();

    if (insertError) {
      toast.error('Failed to add track');
    } else {
      setTracks([...tracks, data]);
      setNewTrack({ title: '', artist: '' });
      toast.success('Track added!');
    }
    
    setUploading(false);
  };

  const deleteTrack = async (track: Track) => {
    await deleteFile('music', track.audio_url);
    if (track.cover_url) {
      await deleteFile('music', track.cover_url);
    }

    const { error } = await supabase
      .from('tracks')
      .delete()
      .eq('id', track.id);

    if (error) {
      toast.error('Failed to delete track');
    } else {
      setTracks(tracks.filter(t => t.id !== track.id));
      toast.success('Track deleted!');
    }
  };

  const saveSettings = async () => {
    const { error } = await supabase
      .from('user_pages')
      .update({
        tracks_layout: localLayout,
        tracks_banner_style: localBannerStyle,
      })
      .eq('user_id', userId);

    if (error) {
      toast.error('Failed to save settings');
    } else {
      toast.success('Settings saved!');
      onUpdate();
    }
  };

  return (
    <div className="space-y-6">
      <Card className="bg-card/50 backdrop-blur-sm border-primary/20 p-6">
        <h3 className="text-lg font-semibold text-primary mb-4 font-mono">Track Settings</h3>
        <div className="space-y-4">
          <div>
            <Label className="font-mono">Layout</Label>
            <Select
              value={localLayout}
              onValueChange={setLocalLayout}
            >
              <SelectTrigger className="bg-background/50 border-primary/30 font-mono">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="default">Default</SelectItem>
                <SelectItem value="compact">Compact</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="font-mono">Banner Style</Label>
            <Select
              value={localBannerStyle}
              onValueChange={setLocalBannerStyle}
            >
              <SelectTrigger className="bg-background/50 border-primary/30 font-mono">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="vinyl">Vinyl</SelectItem>
                <SelectItem value="cover_vinyl">Cover Vinyl</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button onClick={saveSettings} className="w-full bg-primary">
            Save Settings
          </Button>
        </div>
      </Card>

      <Card className="bg-card/50 backdrop-blur-sm border-primary/20 p-6">
        <h3 className="text-lg font-semibold text-primary mb-4 font-mono">Add New Track</h3>
        <div className="space-y-4">
          <div>
            <Label className="font-mono">Title *</Label>
            <Input
              value={newTrack.title}
              onChange={(e) => setNewTrack({ ...newTrack, title: e.target.value })}
              placeholder="Track title"
              className="bg-background/50 border-primary/30 font-mono"
            />
          </div>
          <div>
            <Label className="font-mono">Artist</Label>
            <Input
              value={newTrack.artist}
              onChange={(e) => setNewTrack({ ...newTrack, artist: e.target.value })}
              placeholder="Artist name"
              className="bg-background/50 border-primary/30 font-mono"
            />
          </div>
          <div>
            <Label className="font-mono">Audio File</Label>
            <Input
              type="file"
              accept="audio/*"
              onChange={handleAudioUpload}
              disabled={uploading || !newTrack.title}
              className="bg-background/50 border-primary/30 font-mono"
            />
          </div>
        </div>
      </Card>

      <Card className="bg-card/50 backdrop-blur-sm border-primary/20 p-6">
        <h3 className="text-lg font-semibold text-primary mb-4 font-mono">Your Tracks</h3>
        <div className="space-y-2">
          {tracks.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Music className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="font-mono">No Tracks Found</p>
              <p className="text-sm font-mono mt-2">Upload your first track above</p>
            </div>
          ) : (
            tracks.map((track) => (
              <div
                key={track.id}
                className="flex items-center gap-4 p-4 bg-background/30 rounded-lg border border-primary/20"
              >
                <Button size="icon" variant="ghost" className="shrink-0">
                  <Play className="h-4 w-4" />
                </Button>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold font-mono truncate">{track.title}</p>
                  {track.artist && (
                    <p className="text-sm text-muted-foreground font-mono truncate">{track.artist}</p>
                  )}
                </div>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => deleteTrack(track)}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            ))
          )}
        </div>
      </Card>
    </div>
  );
};
