import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { Trash2, Plus, Shield, Users, Hash, Lock } from 'lucide-react';

interface User {
  id: string;
  username: string;
  email: string;
  created_at: string;
  roles?: string[];
}

interface ReservedUsername {
  id: string;
  username: string;
  reason: string | null;
}

const Admin = () => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(false);
  const [password, setPassword] = useState('');
  const [users, setUsers] = useState<User[]>([]);
  const [reservedUsernames, setReservedUsernames] = useState<ReservedUsername[]>([]);
  const [newUsername, setNewUsername] = useState('');
  const [newReason, setNewReason] = useState('');

  const validatePassword = async () => {
    if (!password) {
      toast.error('Please enter a password');
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('validate-admin-password', {
        body: { password }
      });

      if (error) throw error;

      if (data.valid) {
        setIsAuthenticated(true);
        sessionStorage.setItem('admin_authenticated', 'true');
        loadData();
        toast.success('Access granted');
      } else {
        toast.error('Invalid password');
        setPassword('');
      }
    } catch (error) {
      toast.error('Authentication failed');
      setPassword('');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const isAuth = sessionStorage.getItem('admin_authenticated') === 'true';
    if (isAuth) {
      setIsAuthenticated(true);
      loadData();
    }
  }, []);

  const loadData = async () => {
    // Load users with their roles
    const { data: profilesData } = await supabase
      .from('profiles')
      .select('id, username, created_at')
      .order('created_at', { ascending: false });

    if (profilesData) {
      // Load roles for each user
      const usersWithRoles = await Promise.all(
        profilesData.map(async (profile) => {
          const { data: rolesData } = await supabase
            .from('user_roles')
            .select('role')
            .eq('user_id', profile.id);
          
          return {
            ...profile,
            email: '',
            roles: rolesData?.map(r => r.role) || []
          };
        })
      );
      setUsers(usersWithRoles);
    }

    // Load reserved usernames
    const { data: reservedData } = await supabase
      .from('reserved_usernames')
      .select('*')
      .order('username');

    if (reservedData) {
      setReservedUsernames(reservedData);
    }
  };

  const deleteUser = async (userId: string) => {
    const { error } = await supabase
      .from('profiles')
      .delete()
      .eq('id', userId);

    if (error) {
      toast.error('Failed to delete user');
    } else {
      toast.success('User deleted');
      loadData();
    }
  };

  const addReservedUsername = async () => {
    if (!newUsername.trim()) {
      toast.error('Username cannot be empty');
      return;
    }

    const { error } = await supabase
      .from('reserved_usernames')
      .insert({
        username: newUsername.toLowerCase(),
        reason: newReason || null
      });

    if (error) {
      toast.error('Failed to reserve username');
    } else {
      toast.success('Username reserved');
      setNewUsername('');
      setNewReason('');
      loadData();
    }
  };

  const deleteReservedUsername = async (id: string) => {
    const { error } = await supabase
      .from('reserved_usernames')
      .delete()
      .eq('id', id);

    if (error) {
      toast.error('Failed to delete reserved username');
    } else {
      toast.success('Reserved username removed');
      loadData();
    }
  };

  const toggleUserRole = async (userId: string, role: 'premium' | 'admin', currentRoles: string[]) => {
    const hasRole = currentRoles.includes(role);
    
    if (hasRole) {
      // Remove role
      const { error } = await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', userId)
        .eq('role', role);

      if (error) {
        toast.error(`Failed to remove ${role} role`);
      } else {
        toast.success(`${role} role removed`);
        loadData();
      }
    } else {
      // Add role
      const { error } = await supabase
        .from('user_roles')
        .insert({ user_id: userId, role });

      if (error) {
        toast.error(`Failed to add ${role} role`);
      } else {
        toast.success(`${role} role added`);
        loadData();
      }
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-card/50 backdrop-blur-sm border-primary/20 p-8">
          <div className="flex items-center gap-3 mb-6">
            <Lock className="w-8 h-8 text-primary" />
            <div>
              <h1 className="text-2xl font-bold text-primary font-mono">Admin Access</h1>
              <p className="text-muted-foreground font-mono text-sm">Enter password to continue</p>
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <Label className="font-mono">Password</Label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && validatePassword()}
                placeholder="Enter admin password"
                className="bg-background/50 border-primary/30 font-mono"
                disabled={loading}
              />
            </div>
            <Button 
              onClick={validatePassword} 
              className="w-full bg-primary"
              disabled={loading}
            >
              {loading ? 'Verifying...' : 'Access Admin Panel'}
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate('/dashboard')}
              className="w-full border-primary/30"
            >
              Back to Dashboard
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Shield className="w-8 h-8 text-primary" />
            <div>
              <h1 className="text-3xl font-bold text-primary font-mono">Admin Panel</h1>
              <p className="text-muted-foreground font-mono text-sm">Manage users and system settings</p>
            </div>
          </div>
          <Button
            variant="outline"
            onClick={() => navigate('/dashboard')}
            className="border-primary/30"
          >
            Back to Dashboard
          </Button>
        </div>

        <Tabs defaultValue="users" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6 bg-card/50 border border-primary/20">
            <TabsTrigger value="users" className="font-mono">
              <Users className="w-4 h-4 mr-2" />
              Users
            </TabsTrigger>
            <TabsTrigger value="reserved" className="font-mono">
              <Hash className="w-4 h-4 mr-2" />
              Reserved Names
            </TabsTrigger>
            <TabsTrigger value="analytics" className="font-mono">
              Analytics
            </TabsTrigger>
          </TabsList>

          <TabsContent value="users">
            <Card className="bg-card/50 backdrop-blur-sm border-primary/20 p-6">
              <h3 className="text-lg font-semibold text-primary mb-4 font-mono">User Management</h3>
              <div className="space-y-2">
                {users.length === 0 ? (
                  <p className="text-center text-muted-foreground font-mono py-8">No users found</p>
                ) : (
                  users.map((user) => (
                    <div
                      key={user.id}
                      className="flex items-center justify-between gap-4 p-4 bg-background/30 rounded-lg border border-primary/20"
                    >
                      <div className="flex-1">
                        <p className="font-semibold font-mono">@{user.username}</p>
                        <p className="text-xs text-muted-foreground font-mono">
                          Joined {new Date(user.created_at).toLocaleDateString()}
                        </p>
                        {user.roles && user.roles.length > 0 && (
                          <div className="flex gap-1 mt-2">
                            {user.roles.map((role) => (
                              <span
                                key={role}
                                className="text-xs px-2 py-1 rounded-full bg-primary/20 text-primary font-mono"
                              >
                                {role}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => toggleUserRole(user.id, 'premium', user.roles || [])}
                          title={user.roles?.includes('premium') ? 'Remove Premium' : 'Add Premium'}
                        >
                          <Shield className={`h-4 w-4 ${user.roles?.includes('premium') ? 'text-primary' : 'text-muted-foreground'}`} />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => {
                            if (confirm(`Delete user @${user.username}?`)) {
                              deleteUser(user.id);
                            }
                          }}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="reserved">
            <Card className="bg-card/50 backdrop-blur-sm border-primary/20 p-6 mb-4">
              <h3 className="text-lg font-semibold text-primary mb-4 font-mono">Add Reserved Username</h3>
              <div className="space-y-4">
                <div>
                  <Label className="font-mono">Username</Label>
                  <Input
                    value={newUsername}
                    onChange={(e) => setNewUsername(e.target.value)}
                    placeholder="username"
                    className="bg-background/50 border-primary/30 font-mono"
                  />
                </div>
                <div>
                  <Label className="font-mono">Reason (optional)</Label>
                  <Input
                    value={newReason}
                    onChange={(e) => setNewReason(e.target.value)}
                    placeholder="System reserved"
                    className="bg-background/50 border-primary/30 font-mono"
                  />
                </div>
                <Button onClick={addReservedUsername} className="w-full bg-primary">
                  <Plus className="w-4 h-4 mr-2" />
                  Reserve Username
                </Button>
              </div>
            </Card>

            <Card className="bg-card/50 backdrop-blur-sm border-primary/20 p-6">
              <h3 className="text-lg font-semibold text-primary mb-4 font-mono">Reserved Usernames</h3>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {reservedUsernames.length === 0 ? (
                  <p className="text-center text-muted-foreground font-mono py-8">No reserved usernames</p>
                ) : (
                  reservedUsernames.map((reserved) => (
                    <div
                      key={reserved.id}
                      className="flex items-center justify-between p-3 bg-background/30 rounded-lg border border-primary/20"
                    >
                      <div>
                        <p className="font-semibold font-mono">{reserved.username}</p>
                        {reserved.reason && (
                          <p className="text-xs text-muted-foreground font-mono">{reserved.reason}</p>
                        )}
                      </div>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => deleteReservedUsername(reserved.id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  ))
                )}
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="analytics">
            <Card className="bg-card/50 backdrop-blur-sm border-primary/20 p-6">
              <h3 className="text-lg font-semibold text-primary mb-4 font-mono">Analytics</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-background/30 rounded-lg border border-primary/20">
                  <p className="text-sm text-muted-foreground font-mono">Total Users</p>
                  <p className="text-3xl font-bold text-primary font-mono">{users.length}</p>
                </div>
                <div className="p-4 bg-background/30 rounded-lg border border-primary/20">
                  <p className="text-sm text-muted-foreground font-mono">Reserved Names</p>
                  <p className="text-3xl font-bold text-primary font-mono">{reservedUsernames.length}</p>
                </div>
                <div className="p-4 bg-background/30 rounded-lg border border-primary/20">
                  <p className="text-sm text-muted-foreground font-mono">Active Today</p>
                  <p className="text-3xl font-bold text-primary font-mono">-</p>
                </div>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Admin;
