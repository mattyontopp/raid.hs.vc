import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface AdminRequest {
  password: string;
  action: string;
  payload?: any;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      {
        status: 405,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    );
  }

  try {
    const { password, action, payload } = (await req.json()) as AdminRequest;

    const validPassword = 'aP$92!mT37^rKq#ZxL0@wF';
    if (password !== validPassword) {
      return new Response(
        JSON.stringify({ error: 'Invalid admin password' }),
        {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        },
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !serviceRoleKey) {
      return new Response(
        JSON.stringify({ error: 'Server configuration error' }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        },
      );
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey);

    switch (action) {
      case 'load-dashboard': {
        const [{ data: profiles, error: profilesError }, { data: roles, error: rolesError }, { data: reserved, error: reservedError }, { data: authUsers, error: authError }] =
          await Promise.all([
            supabase.from('profiles').select('id, username, created_at'),
            supabase.from('user_roles').select('user_id, role'),
            supabase.from('reserved_usernames').select('*').order('username'),
            supabase.auth.admin.listUsers(),
          ] as const);

        if (profilesError) throw profilesError;
        if (rolesError) throw rolesError;
        if (reservedError) throw reservedError;
        if (authError) throw authError;

        const rolesByUser: Record<string, string[]> = {};
        (roles ?? []).forEach((r) => {
          if (!rolesByUser[r.user_id]) rolesByUser[r.user_id] = [];
          rolesByUser[r.user_id].push(r.role as string);
        });

        const authById = new Map<string, { email?: string }>();
        (authUsers?.users ?? []).forEach((u) => {
          authById.set(u.id, { email: u.email ?? undefined });
        });

        const users = (profiles ?? []).map((p) => {
          const authUser = authById.get(p.id);
          return {
            id: p.id,
            username: p.username,
            email: authUser?.email ?? '',
            created_at: p.created_at,
            roles: rolesByUser[p.id] ?? [],
          };
        });

        const analytics = {
          totalUsers: profiles?.length ?? 0,
          reservedCount: reserved?.length ?? 0,
          premiumCount: (roles ?? []).filter((r) => r.role === 'premium').length,
          adminCount: (roles ?? []).filter((r) => r.role === 'admin').length,
        };

        return new Response(
          JSON.stringify({ users, reservedUsernames: reserved ?? [], analytics }),
          {
            status: 200,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          },
        );
      }

      case 'delete-user': {
        const { userId } = payload as { userId?: string };
        if (!userId) {
          return new Response(
            JSON.stringify({ error: 'Missing userId' }),
            {
              status: 400,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            },
          );
        }

        // Delete dependent data first to satisfy foreign key constraints
        await Promise.all([
          supabase.from('badges').delete().eq('user_id', userId),
          supabase.from('widgets').delete().eq('user_id', userId),
          supabase.from('user_links').delete().eq('user_id', userId),
          supabase.from('tracks').delete().eq('user_id', userId),
          supabase.from('user_pages').delete().eq('user_id', userId),
          supabase.from('user_roles').delete().eq('user_id', userId),
        ]);

        await supabase.from('profiles').delete().eq('id', userId);

        const { error: authDeleteError } = await supabase.auth.admin.deleteUser(userId);
        if (authDeleteError) {
          console.error('Failed to delete auth user', authDeleteError.message);
        }

        return new Response(
          JSON.stringify({ success: true }),
          {
            status: 200,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          },
        );
      }

      case 'toggle-role': {
        const { userId, role, hasRole } = payload as {
          userId?: string;
          role?: string;
          hasRole?: boolean;
        };

        if (!userId || !role || !['admin', 'premium'].includes(role)) {
          return new Response(
            JSON.stringify({ error: 'Invalid payload' }),
            {
              status: 400,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            },
          );
        }

        if (hasRole) {
          const { error } = await supabase
            .from('user_roles')
            .delete()
            .eq('user_id', userId)
            .eq('role', role as any);

          if (error) throw error;
        } else {
          const { error } = await supabase
            .from('user_roles')
            .insert({ user_id: userId, role: role as any });

          if (error) throw error;
        }

        return new Response(
          JSON.stringify({ success: true }),
          {
            status: 200,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          },
        );
      }

      case 'add-reserved-username': {
        const { username, reason } = payload as {
          username?: string;
          reason?: string | null;
        };

        const normalized = (username ?? '').trim().toLowerCase();
        if (!normalized) {
          return new Response(
            JSON.stringify({ error: 'Username cannot be empty' }),
            {
              status: 400,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            },
          );
        }

        const { error } = await supabase.from('reserved_usernames').insert({
          username: normalized,
          reason: reason || null,
        });

        if (error) throw error;

        return new Response(
          JSON.stringify({ success: true }),
          {
            status: 200,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          },
        );
      }

      case 'delete-reserved-username': {
        const { id } = payload as { id?: string };
        if (!id) {
          return new Response(
            JSON.stringify({ error: 'Missing id' }),
            {
              status: 400,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            },
          );
        }

        const { error } = await supabase
          .from('reserved_usernames')
          .delete()
          .eq('id', id);

        if (error) throw error;

        return new Response(
          JSON.stringify({ success: true }),
          {
            status: 200,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          },
        );
      }

      case 'update-user': {
        const { userId, username } = payload as {
          userId?: string;
          username?: string;
        };

        if (!userId) {
          return new Response(
            JSON.stringify({ error: 'Missing userId' }),
            {
              status: 400,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            },
          );
        }

        const updates: Record<string, any> = {};

        if (username && username.trim() !== '') {
          const normalized = username.trim().toLowerCase();

          const { data: isReserved, error: reservedError } = await supabase.rpc(
            'is_username_reserved',
            { _username: normalized },
          );

          if (reservedError) throw reservedError;
          if (isReserved) {
            return new Response(
              JSON.stringify({ error: 'This username is reserved and cannot be used' }),
              {
                status: 400,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
              },
            );
          }

          updates.username = normalized;
        }

        if (Object.keys(updates).length === 0) {
          return new Response(
            JSON.stringify({ error: 'No updates provided' }),
            {
              status: 400,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            },
          );
        }

        const { error } = await supabase
          .from('profiles')
          .update(updates)
          .eq('id', userId);

        if (error) throw error;

        return new Response(
          JSON.stringify({ success: true }),
          {
            status: 200,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          },
        );
      }

      default:
        return new Response(
          JSON.stringify({ error: 'Unknown action' }),
          {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          },
        );
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('Admin panel error', message);

    return new Response(
      JSON.stringify({ error: message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    );
  }
});
