import { Card } from '@/components/ui/card';
import { Award } from 'lucide-react';

export const BadgesTab = () => {
  return (
    <Card className="bg-card/50 backdrop-blur-sm border-primary/20 p-6">
      <div className="text-center py-12">
        <Award className="h-16 w-16 mx-auto mb-4 text-primary opacity-50" />
        <h3 className="text-xl font-semibold text-primary mb-2 font-mono">Badges</h3>
        <p className="text-muted-foreground font-mono">Coming Soon</p>
        <p className="text-sm text-muted-foreground font-mono mt-2">
          Showcase your achievements and badges on your profile
        </p>
      </div>
    </Card>
  );
};
