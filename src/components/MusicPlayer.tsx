import { Card } from '@/components/ui/card';
import { Music } from 'lucide-react';

const MusicPlayer = () => {
  return (
    <Card className="bg-card/50 backdrop-blur-sm border-primary/20 p-6 overflow-hidden relative">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-secondary to-primary animate-pulse" />
      
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 rounded-lg bg-primary/10">
          <Music className="w-5 h-5 text-primary" />
        </div>
        <h3 className="font-semibold text-foreground">Now Playing</h3>
      </div>

      <div className="aspect-video w-full rounded-lg overflow-hidden bg-muted/30 border border-primary/20">
        <iframe
          className="w-full h-full"
          src="https://open.spotify.com/embed/playlist/37i9dQZF1DX4dyzvuaRJ0n?utm_source=generator&theme=0"
          allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
          loading="lazy"
        />
      </div>
      
      <p className="text-xs text-muted-foreground mt-3 text-center font-mono">
        cyberpunk vibes only
      </p>
    </Card>
  );
};

export default MusicPlayer;
