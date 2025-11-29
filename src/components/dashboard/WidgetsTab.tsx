import { Card } from '@/components/ui/card';
import { Grid3x3 } from 'lucide-react';

export const WidgetsTab = () => {
  return (
    <Card className="bg-card/50 backdrop-blur-sm border-primary/20 p-6">
      <div className="text-center py-12">
        <Grid3x3 className="h-16 w-16 mx-auto mb-4 text-primary opacity-50" />
        <h3 className="text-xl font-semibold text-primary mb-2 font-mono">Widgets</h3>
        <p className="text-muted-foreground font-mono">Coming Soon</p>
        <p className="text-sm text-muted-foreground font-mono mt-2">
          Add custom widgets to enhance your profile
        </p>
      </div>
    </Card>
  );
};
