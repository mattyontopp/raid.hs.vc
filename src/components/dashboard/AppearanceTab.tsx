import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Card } from '@/components/ui/card';
import { Lock, Upload } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { uploadFile } from '@/lib/storage';

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
  premium_starry_bg: boolean;
  premium_name_effect: boolean;
  premium_bio_effect: boolean;
}

interface AppearanceTabProps {
  page: UserPage;
  isPremium: boolean;
  onUpdate: () => void;
}

export const AppearanceTab = ({ page, isPremium, onUpdate }: AppearanceTabProps) => {
  const [localPage, setLocalPage] = useState(page);
  const [uploading, setUploading] = useState(false);

  const handleBackgroundUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const { url, error } = await uploadFile('backgrounds', file, page.user_id);
    
    if (error) {
      toast.error('Failed to upload background');
      setUploading(false);
      return;
    }

    setLocalPage({ ...localPage, bg_type: 'media', bg_media_url: url });
    setUploading(false);
    toast.success('Background uploaded!');
  };

  const savePage = async () => {
    const { error } = await supabase
      .from('user_pages')
      .update(localPage)
      .eq('user_id', page.user_id);

    if (error) {
      toast.error('Failed to save appearance');
    } else {
      toast.success('Appearance saved!');
      onUpdate();
    }
  };

  const PremiumFeature = ({ children, enabled }: { children: React.ReactNode; enabled: boolean }) => (
    <div className={`relative ${!isPremium ? 'opacity-50' : ''}`}>
      {children}
      {!isPremium && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/80 rounded-lg">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Lock className="h-4 w-4" />
            <span className="text-sm font-mono">Premium</span>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      <Card className="bg-card/50 backdrop-blur-sm border-primary/20 p-6">
        <h3 className="text-lg font-semibold text-primary mb-4 font-mono">Layout Options</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label className="font-mono">Floating Avatar</Label>
            <Switch
              checked={localPage.layout_floating_avatar}
              onCheckedChange={(checked) => setLocalPage({ ...localPage, layout_floating_avatar: checked })}
            />
          </div>
          <div className="flex items-center justify-between">
            <Label className="font-mono">Stacked</Label>
            <Switch
              checked={localPage.layout_stacked}
              onCheckedChange={(checked) => setLocalPage({ ...localPage, layout_stacked: checked })}
            />
          </div>
          <div className="flex items-center justify-between">
            <Label className="font-mono">Compact Row</Label>
            <Switch
              checked={localPage.layout_compact_row}
              onCheckedChange={(checked) => setLocalPage({ ...localPage, layout_compact_row: checked })}
            />
          </div>
          <div className="flex items-center justify-between">
            <Label className="font-mono">Showcase Mode</Label>
            <Switch
              checked={localPage.layout_showcase}
              onCheckedChange={(checked) => setLocalPage({ ...localPage, layout_showcase: checked })}
            />
          </div>
        </div>
      </Card>

      <Card className="bg-card/50 backdrop-blur-sm border-primary/20 p-6">
        <h3 className="text-lg font-semibold text-primary mb-4 font-mono">Profile Card</h3>
        <div className="space-y-4">
          <div>
            <Label className="font-mono">Card Template</Label>
            <Select
              value={localPage.card_template}
              onValueChange={(value) => setLocalPage({ ...localPage, card_template: value })}
            >
              <SelectTrigger className="bg-background/50 border-primary/30 font-mono">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="classic">Classic</SelectItem>
                <SelectItem value="frosted_square">Frosted Square</SelectItem>
                <SelectItem value="frosted_soft">Frosted Soft</SelectItem>
                <SelectItem value="outlined">Outlined</SelectItem>
                <SelectItem value="aurora">Aurora</SelectItem>
                <SelectItem value="transparent">Transparent</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="font-mono">Card Radius: {localPage.card_radius}px</Label>
            <Input
              type="range"
              min="0"
              max="32"
              value={localPage.card_radius}
              onChange={(e) => setLocalPage({ ...localPage, card_radius: parseInt(e.target.value) })}
              className="bg-background/50 border-primary/30"
            />
          </div>
        </div>
      </Card>

      <Card className="bg-card/50 backdrop-blur-sm border-primary/20 p-6">
        <h3 className="text-lg font-semibold text-primary mb-4 font-mono">Background</h3>
        <div className="space-y-4">
          <div>
            <Label className="font-mono">Background Type</Label>
            <Select
              value={localPage.bg_type}
              onValueChange={(value) => setLocalPage({ ...localPage, bg_type: value })}
            >
              <SelectTrigger className="bg-background/50 border-primary/30 font-mono">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="solid">Solid Color</SelectItem>
                <SelectItem value="gradient">Gradient</SelectItem>
                <SelectItem value="media">Media (Image/Video)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {localPage.bg_type === 'media' && (
            <div>
              {localPage.bg_media_url && (
                <img src={localPage.bg_media_url} alt="Background" className="w-full h-32 object-cover rounded-lg mb-2" />
              )}
              <Input
                type="file"
                accept="image/*,video/*"
                onChange={handleBackgroundUpload}
                disabled={uploading}
                className="bg-background/50 border-primary/30 font-mono"
              />
            </div>
          )}
        </div>
      </Card>

      <Card className="bg-card/50 backdrop-blur-sm border-primary/20 p-6">
        <h3 className="text-lg font-semibold text-primary mb-4 font-mono">Colors & Fonts</h3>
        <div className="space-y-4">
          <div>
            <Label className="font-mono">Primary Color (HSL)</Label>
            <Input
              value={localPage.primary_color}
              onChange={(e) => setLocalPage({ ...localPage, primary_color: e.target.value })}
              placeholder="180 100% 50%"
              className="bg-background/50 border-primary/30 font-mono"
            />
          </div>
          <div>
            <Label className="font-mono">Font Family</Label>
            <Select
              value={localPage.font_family}
              onValueChange={(value) => setLocalPage({ ...localPage, font_family: value })}
            >
              <SelectTrigger className="bg-background/50 border-primary/30 font-mono">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="JetBrains Mono">JetBrains Mono</SelectItem>
                <SelectItem value="Fira Code">Fira Code</SelectItem>
                <SelectItem value="Inter">Inter</SelectItem>
                <SelectItem value="Cinzel">Cinzel</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </Card>

      <Card className="bg-card/50 backdrop-blur-sm border-primary/20 p-6">
        <h3 className="text-lg font-semibold text-primary mb-4 font-mono flex items-center gap-2">
          Premium Features {!isPremium && <Lock className="h-4 w-4" />}
        </h3>
        <div className="space-y-4">
          <PremiumFeature enabled={isPremium}>
            <div className="flex items-center justify-between">
              <Label className="font-mono">Starry Background</Label>
              <Switch
                checked={localPage.premium_starry_bg}
                onCheckedChange={(checked) => setLocalPage({ ...localPage, premium_starry_bg: checked })}
                disabled={!isPremium}
              />
            </div>
          </PremiumFeature>
          <PremiumFeature enabled={isPremium}>
            <div className="flex items-center justify-between">
              <Label className="font-mono">Name Effect</Label>
              <Switch
                checked={localPage.premium_name_effect}
                onCheckedChange={(checked) => setLocalPage({ ...localPage, premium_name_effect: checked })}
                disabled={!isPremium}
              />
            </div>
          </PremiumFeature>
          <PremiumFeature enabled={isPremium}>
            <div className="flex items-center justify-between">
              <Label className="font-mono">Bio Effect</Label>
              <Switch
                checked={localPage.premium_bio_effect}
                onCheckedChange={(checked) => setLocalPage({ ...localPage, premium_bio_effect: checked })}
                disabled={!isPremium}
              />
            </div>
          </PremiumFeature>
        </div>
      </Card>

      <Button onClick={savePage} className="w-full bg-primary">
        Save Appearance
      </Button>
    </div>
  );
};
