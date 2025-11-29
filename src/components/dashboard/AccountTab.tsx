import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';

interface AccountTabProps {
  username: string;
  email: string;
}

export const AccountTab = ({ username, email }: AccountTabProps) => {
  const navigate = useNavigate();
  const [newUsername, setNewUsername] = useState('');
  const [changingUsername, setChangingUsername] = useState(false);

  const checkUsernameReserved = async (username: string) => {
    const { data, error } = await supabase
      .rpc('is_username_reserved', { _username: username.toLowerCase() });
    
    return data === true;
  };

  const changeUsername = async () => {
    if (!newUsername.trim()) {
      toast.error('Please enter a new username');
      return;
    }

    if (newUsername.length < 3) {
      toast.error('Username must be at least 3 characters');
      return;
    }

    const isReserved = await checkUsernameReserved(newUsername);
    if (isReserved) {
      toast.error('This username is reserved and cannot be used');
      return;
    }

    setChangingUsername(true);
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from('profiles')
      .update({ username: newUsername.toLowerCase() })
      .eq('id', user.id);

    if (error) {
      if (error.code === '23505') {
        toast.error('Username already taken');
      } else {
        toast.error('Failed to change username');
      }
    } else {
      toast.success('Username changed successfully!');
      setNewUsername('');
      setTimeout(() => window.location.reload(), 1000);
    }
    
    setChangingUsername(false);
  };

  const sendPasswordReset = async () => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth`,
    });

    if (error) {
      toast.error('Failed to send reset email');
    } else {
      toast.success('Password reset email sent!');
    }
  };

  const deleteAccount = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Delete user data
    await supabase.from('profiles').delete().eq('id', user.id);
    await supabase.auth.signOut();
    
    toast.success('Account deleted');
    navigate('/');
  };

  return (
    <div className="space-y-6">
      <Card className="bg-card/50 backdrop-blur-sm border-primary/20 p-6">
        <h3 className="text-lg font-semibold text-primary mb-4 font-mono">Account Information</h3>
        <div className="space-y-4">
          <div>
            <Label className="font-mono">Current Username</Label>
            <Input
              value={username}
              disabled
              className="bg-background/50 border-primary/30 font-mono"
            />
          </div>
          <div>
            <Label className="font-mono">Email</Label>
            <Input
              value={email}
              disabled
              className="bg-background/50 border-primary/30 font-mono"
            />
          </div>
        </div>
      </Card>

      <Card className="bg-card/50 backdrop-blur-sm border-primary/20 p-6">
        <h3 className="text-lg font-semibold text-primary mb-4 font-mono">Change Username</h3>
        <div className="space-y-4">
          <div>
            <Label className="font-mono">New Username</Label>
            <Input
              value={newUsername}
              onChange={(e) => setNewUsername(e.target.value)}
              placeholder="Enter new username"
              className="bg-background/50 border-primary/30 font-mono"
            />
          </div>
          <Button 
            onClick={changeUsername} 
            disabled={changingUsername}
            className="w-full bg-primary"
          >
            {changingUsername ? 'Changing...' : 'Change Username'}
          </Button>
        </div>
      </Card>

      <Card className="bg-card/50 backdrop-blur-sm border-primary/20 p-6">
        <h3 className="text-lg font-semibold text-primary mb-4 font-mono">Password</h3>
        <Button onClick={sendPasswordReset} variant="outline" className="w-full border-primary/30">
          Send Password Reset Email
        </Button>
      </Card>

      <Card className="bg-card/50 backdrop-blur-sm border-destructive/20 p-6">
        <h3 className="text-lg font-semibold text-destructive mb-4 font-mono">Danger Zone</h3>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" className="w-full">
              Delete Account
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent className="bg-background border-destructive/20">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-destructive font-mono">Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription className="font-mono">
                This action cannot be undone. This will permanently delete your account
                and remove all your data from our servers.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="font-mono">Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={deleteAccount} className="bg-destructive font-mono">
                Delete Account
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </Card>
    </div>
  );
};
