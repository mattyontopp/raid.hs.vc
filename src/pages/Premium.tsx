import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Check, Crown, Sparkles, Zap } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const Premium = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [isPremium, setIsPremium] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    checkPremiumStatus();
  }, []);

  const checkPremiumStatus = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        navigate('/auth');
        return;
      }

      setUserId(user.id);

      const { data: roles } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id);
      
      setIsPremium(roles?.some(r => r.role === 'premium') || false);
    } catch (error) {
      toast.error('Failed to check premium status');
    } finally {
      setLoading(false);
    }
  };

  const handleUpgrade = async () => {
    if (!userId) return;

    // In a real app, this would integrate with a payment processor
    // For now, we'll simulate upgrading to premium
    const { error } = await supabase
      .from('user_roles')
      .insert({
        user_id: userId,
        role: 'premium'
      });

    if (error) {
      if (error.code === '23505') {
        toast.info('You already have premium!');
      } else {
        toast.error('Failed to upgrade to premium');
      }
    } else {
      toast.success('Upgraded to Premium! 🎉');
      setTimeout(() => window.location.reload(), 1500);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-primary font-mono animate-pulse">Loading...</p>
      </div>
    );
  }

  const features = [
    { name: 'Starry Backgrounds', icon: Sparkles },
    { name: 'Name & Bio Effects', icon: Zap },
    { name: 'Page Overlays', icon: Crown },
    { name: 'Cursor Trails', icon: Sparkles },
    { name: 'Background Effects', icon: Zap },
    { name: 'Animated Views', icon: Crown },
    { name: 'Tilting Card', icon: Sparkles },
    { name: 'Glowing Icons', icon: Zap },
    { name: 'Audio Visualizer', icon: Crown },
    { name: 'Premium Card Templates', icon: Sparkles },
    { name: 'Advanced Customization', icon: Zap },
    { name: 'Priority Support', icon: Crown },
  ];

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Crown className="w-12 h-12 text-primary" />
            <h1 className="text-4xl font-bold text-primary font-mono">Premium</h1>
          </div>
          <p className="text-muted-foreground font-mono text-lg">
            Unlock the full power of raid.hs.vc
          </p>
        </div>

        {isPremium ? (
          <Card className="bg-card/50 backdrop-blur-sm border-primary/20 p-8 text-center">
            <Crown className="w-16 h-16 mx-auto mb-4 text-primary" />
            <h2 className="text-2xl font-bold text-primary mb-2 font-mono">You're Premium! 🎉</h2>
            <p className="text-muted-foreground font-mono mb-6">
              You have access to all premium features
            </p>
            <Button onClick={() => navigate('/dashboard')} className="bg-primary">
              Go to Dashboard
            </Button>
          </Card>
        ) : (
          <>
            <Card className="bg-card/50 backdrop-blur-sm border-primary/20 p-8 mb-8">
              <div className="text-center mb-8">
                <div className="text-5xl font-bold text-primary mb-2 font-mono">
                  $4.99<span className="text-2xl text-muted-foreground">/month</span>
                </div>
                <p className="text-muted-foreground font-mono">
                  Cancel anytime • No hidden fees
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-4 mb-8">
                {features.map((feature, i) => {
                  const Icon = feature.icon;
                  return (
                    <div key={i} className="flex items-center gap-3 p-3 bg-background/30 rounded-lg border border-primary/20">
                      <Icon className="w-5 h-5 text-primary shrink-0" />
                      <span className="font-mono text-foreground">{feature.name}</span>
                    </div>
                  );
                })}
              </div>

              <Button onClick={handleUpgrade} className="w-full bg-primary text-lg py-6">
                <Crown className="w-5 h-5 mr-2" />
                Upgrade to Premium
              </Button>

              <p className="text-center text-xs text-muted-foreground font-mono mt-4">
                This is a demo upgrade. In production, this would integrate with Stripe or similar payment processor.
              </p>
            </Card>

            <div className="text-center">
              <Button variant="ghost" onClick={() => navigate('/dashboard')} className="font-mono">
                Back to Dashboard
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Premium;
