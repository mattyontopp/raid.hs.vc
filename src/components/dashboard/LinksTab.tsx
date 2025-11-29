import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Plus, Trash2, ExternalLink, GripVertical } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface UserLink {
  id: string;
  title: string;
  url: string;
  icon: string;
  display_order: number;
}

interface LinksTabProps {
  userId: string;
}

export const LinksTab = ({ userId }: LinksTabProps) => {
  const [links, setLinks] = useState<UserLink[]>([]);
  const [newLink, setNewLink] = useState({ title: '', url: '' });

  useEffect(() => {
    loadLinks();
  }, []);

  const loadLinks = async () => {
    const { data } = await supabase
      .from('user_links')
      .select('*')
      .eq('user_id', userId)
      .order('display_order');
    
    if (data) setLinks(data);
  };

  const addLink = async () => {
    if (!newLink.title || !newLink.url) {
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
        user_id: userId,
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

  return (
    <div className="space-y-6">
      <Card className="bg-card/50 backdrop-blur-sm border-primary/20 p-6">
        <h3 className="text-lg font-semibold text-primary mb-4 font-mono">Add New Link</h3>
        <div className="flex gap-2">
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
      </Card>

      <Card className="bg-card/50 backdrop-blur-sm border-primary/20 p-6">
        <h3 className="text-lg font-semibold text-primary mb-4 font-mono">Your Links</h3>
        <div className="space-y-2">
          {links.length === 0 ? (
            <p className="text-center text-muted-foreground font-mono text-sm py-8">
              No links yet. Add your first link above!
            </p>
          ) : (
            links.map((link) => (
              <div
                key={link.id}
                className="flex items-center gap-2 p-3 bg-background/30 rounded-lg border border-primary/20"
              >
                <GripVertical className="h-4 w-4 text-muted-foreground shrink-0 cursor-move" />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-foreground font-mono truncate">{link.title}</p>
                  <p className="text-xs text-muted-foreground font-mono truncate">{link.url}</p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => window.open(link.url, '_blank')}
                  className="shrink-0"
                >
                  <ExternalLink className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => deleteLink(link.id)}
                  className="shrink-0"
                >
                  <Trash2 className="w-4 h-4 text-destructive" />
                </Button>
              </div>
            ))
          )}
        </div>
      </Card>
    </div>
  );
};
