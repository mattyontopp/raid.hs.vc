import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { X, Upload, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { uploadFile, deleteFile } from '@/lib/storage';

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

interface ProfileTabProps {
  profile: Profile;
  onUpdate: () => void;
}

export const ProfileTab = ({ profile, onUpdate }: ProfileTabProps) => {
  const [localProfile, setLocalProfile] = useState(profile);
  const [newTag, setNewTag] = useState('');
  const [uploading, setUploading] = useState(false);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const { url, error } = await uploadFile('avatars', file, profile.id);
    
    if (error) {
      toast.error('Failed to upload avatar');
      setUploading(false);
      return;
    }

    setLocalProfile({ ...localProfile, avatar_url: url });
    setUploading(false);
    toast.success('Avatar uploaded!');
  };

  const handleBannerUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const { url, error } = await uploadFile('banners', file, profile.id);
    
    if (error) {
      toast.error('Failed to upload banner');
      setUploading(false);
      return;
    }

    setLocalProfile({ ...localProfile, banner_url: url });
    setUploading(false);
    toast.success('Banner uploaded!');
  };

  const removeAvatar = async () => {
    if (localProfile.avatar_url) {
      await deleteFile('avatars', localProfile.avatar_url);
    }
    setLocalProfile({ ...localProfile, avatar_url: null });
  };

  const addTag = () => {
    if (!newTag.trim()) return;
    const tags = [...(localProfile.tags || []), newTag.trim()];
    setLocalProfile({ ...localProfile, tags });
    setNewTag('');
  };

  const removeTag = (index: number) => {
    const tags = localProfile.tags.filter((_, i) => i !== index);
    setLocalProfile({ ...localProfile, tags });
  };

  const saveProfile = async () => {
    const { error } = await supabase
      .from('profiles')
      .update({
        display_name: localProfile.display_name,
        bio: localProfile.bio,
        avatar_url: localProfile.avatar_url,
        avatar_shape: localProfile.avatar_shape,
        decoration: localProfile.decoration,
        banner_url: localProfile.banner_url,
        occupation: localProfile.occupation,
        location: localProfile.location,
        tags: localProfile.tags,
      })
      .eq('id', profile.id);

    if (error) {
      toast.error('Failed to save profile');
    } else {
      toast.success('Profile saved!');
      onUpdate();
    }
  };

  return (
    <div className="space-y-6">
      <Card className="bg-card/50 backdrop-blur-sm border-primary/20 p-6">
        <h3 className="text-lg font-semibold text-primary mb-4 font-mono">Avatar Settings</h3>
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            {localProfile.avatar_url ? (
              <div className="relative">
                <img
                  src={localProfile.avatar_url}
                  alt="Avatar"
                  className={`w-20 h-20 object-cover ${
                    localProfile.avatar_shape === 'circle' ? 'rounded-full' :
                    localProfile.avatar_shape === 'rounded' ? 'rounded-2xl' :
                    localProfile.avatar_shape === 'soft' ? 'rounded-lg' :
                    'rounded-none'
                  }`}
                />
                <Button
                  size="icon"
                  variant="destructive"
                  className="absolute -top-2 -right-2 h-6 w-6"
                  onClick={removeAvatar}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            ) : (
              <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center">
                <Upload className="h-8 w-8 text-muted-foreground" />
              </div>
            )}
            <div className="flex-1">
              <Input
                type="file"
                accept="image/*"
                onChange={handleAvatarUpload}
                disabled={uploading}
                className="bg-background/50 border-primary/30 font-mono"
              />
            </div>
          </div>

          <div>
            <Label className="font-mono">Avatar Shape</Label>
            <Select
              value={localProfile.avatar_shape}
              onValueChange={(value) => setLocalProfile({ ...localProfile, avatar_shape: value })}
            >
              <SelectTrigger className="bg-background/50 border-primary/30 font-mono">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="circle">Circle</SelectItem>
                <SelectItem value="rounded">Rounded</SelectItem>
                <SelectItem value="soft">Soft</SelectItem>
                <SelectItem value="square">Square</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </Card>

      <Card className="bg-card/50 backdrop-blur-sm border-primary/20 p-6">
        <h3 className="text-lg font-semibold text-primary mb-4 font-mono">Banner</h3>
        <div className="space-y-4">
          {localProfile.banner_url && (
            <img
              src={localProfile.banner_url}
              alt="Banner"
              className="w-full h-32 object-cover rounded-lg"
            />
          )}
          <Input
            type="file"
            accept="image/*"
            onChange={handleBannerUpload}
            disabled={uploading}
            className="bg-background/50 border-primary/30 font-mono"
          />
        </div>
      </Card>

      <Card className="bg-card/50 backdrop-blur-sm border-primary/20 p-6">
        <h3 className="text-lg font-semibold text-primary mb-4 font-mono">Profile Info</h3>
        <div className="space-y-4">
          <div>
            <Label className="font-mono">Display Name</Label>
            <Input
              value={localProfile.display_name || ''}
              onChange={(e) => setLocalProfile({ ...localProfile, display_name: e.target.value })}
              className="bg-background/50 border-primary/30 font-mono"
            />
          </div>
          <div>
            <Label className="font-mono">Bio</Label>
            <Textarea
              value={localProfile.bio || ''}
              onChange={(e) => setLocalProfile({ ...localProfile, bio: e.target.value })}
              className="bg-background/50 border-primary/30 font-mono"
              rows={3}
            />
          </div>
          <div>
            <Label className="font-mono">Occupation</Label>
            <Input
              value={localProfile.occupation || ''}
              onChange={(e) => setLocalProfile({ ...localProfile, occupation: e.target.value })}
              className="bg-background/50 border-primary/30 font-mono"
            />
          </div>
          <div>
            <Label className="font-mono">Location</Label>
            <Input
              value={localProfile.location || ''}
              onChange={(e) => setLocalProfile({ ...localProfile, location: e.target.value })}
              className="bg-background/50 border-primary/30 font-mono"
            />
          </div>
          <div>
            <Label className="font-mono">Tags</Label>
            <div className="flex gap-2 mb-2">
              <Input
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addTag()}
                placeholder="Add a tag..."
                className="bg-background/50 border-primary/30 font-mono"
              />
              <Button onClick={addTag} className="bg-primary">Add</Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {localProfile.tags?.map((tag, i) => (
                <div key={i} className="bg-primary/20 px-3 py-1 rounded-full flex items-center gap-2 font-mono text-sm">
                  {tag}
                  <X className="h-3 w-3 cursor-pointer" onClick={() => removeTag(i)} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </Card>

      <Button onClick={saveProfile} className="w-full bg-primary">
        Save Profile
      </Button>
    </div>
  );
};
