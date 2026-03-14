import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { supabase } from '@/integrations/supabase/client';
import {
  Users, Search, Trash2, Edit, ArrowLeft, Save, X, ShieldAlert, Shield, Crown, UserX
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

interface AdminUser {
  id: string;
  user_id: string;
  display_name: string;
  mode: string;
  total_xp: number;
  sharing_enabled: boolean;
  onboarded: boolean;
  created_at: string;
  updated_at: string;
}

export default function AdminPage() {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [search, setSearch] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0, active: 0, totalXp: 0 });

  useEffect(() => {
    if (!isAdmin) {
      navigate('/');
      return;
    }
    loadUsers();
  }, [isAdmin]);

  async function loadUsers() {
    setLoading(true);
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      toast.error('Failed to load users');
      console.error(error);
    } else if (data) {
      setUsers(data as AdminUser[]);
      setStats({
        total: data.length,
        active: data.filter(u => u.onboarded).length,
        totalXp: data.reduce((s, u) => s + (u.total_xp || 0), 0),
      });
    }
    setLoading(false);
  }

  const filteredUsers = users.filter(u =>
    u.display_name?.toLowerCase().includes(search.toLowerCase()) ||
    u.user_id?.toLowerCase().includes(search.toLowerCase())
  );

  async function handleDelete(userId: string) {
    if (userId === user?.id) {
      toast.error("You cannot delete yourself!");
      return;
    }
    if (!confirm("Delete this user's profile and all data?")) return;

    const { error } = await supabase.from('profiles').delete().eq('user_id', userId);
    if (error) {
      toast.error('Failed to delete');
    } else {
      toast.success('User profile deleted');
      loadUsers();
    }
  }

  async function handleGrantAdmin(userId: string) {
    const { error } = await supabase.from('user_roles' as any).insert([{ user_id: userId, role: 'admin' }]);
    if (error) {
      toast.error('Failed to grant admin');
    } else {
      toast.success('Admin role granted');
    }
  }

  function startEdit(u: AdminUser) {
    setEditingId(u.user_id);
    setEditName(u.display_name);
  }

  async function handleSaveEdit() {
    if (editingId) {
      const { error } = await supabase.from('profiles').update({ display_name: editName }).eq('user_id', editingId);
      if (error) {
        toast.error('Failed to update');
      } else {
        toast.success('Updated');
        setEditingId(null);
        loadUsers();
      }
    }
  }

  return (
    <div className="min-h-screen bg-background px-4 pt-6 pb-20">
      <div className="max-w-lg mx-auto space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate('/')} className="p-2 -ml-2 text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-lg font-bold gold-text">Admin Panel</h1>
          </div>
          <div className="bg-primary/10 px-3 py-1.5 rounded-full flex items-center gap-1.5">
            <ShieldAlert className="w-3.5 h-3.5 text-primary" />
            <span className="text-[10px] font-semibold text-primary">Admin</span>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-2">
          <div className="glass-card p-3 text-center">
            <Users className="w-4 h-4 mx-auto text-primary mb-1" />
            <p className="text-lg font-bold gold-text">{stats.total}</p>
            <p className="text-[10px] text-muted-foreground">Total Users</p>
          </div>
          <div className="glass-card p-3 text-center">
            <Shield className="w-4 h-4 mx-auto text-accent mb-1" />
            <p className="text-lg font-bold text-accent">{stats.active}</p>
            <p className="text-[10px] text-muted-foreground">Onboarded</p>
          </div>
          <div className="glass-card p-3 text-center">
            <Crown className="w-4 h-4 mx-auto text-primary mb-1" />
            <p className="text-lg font-bold gold-text">{stats.totalXp}</p>
            <p className="text-[10px] text-muted-foreground">Total XP</p>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search users..."
            className="w-full pl-10 pr-4 py-2.5 bg-card border border-border rounded-xl text-xs outline-none focus:ring-1 focus:ring-primary/30"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        {/* Users List */}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="space-y-2">
            {filteredUsers.map((u, i) => (
              <motion.div
                key={u.user_id}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.02 }}
                className={`glass-card p-3 ${u.user_id === user?.id ? 'ring-1 ring-primary/30' : ''}`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary flex-shrink-0">
                    {(u.display_name || 'U').substring(0, 2).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    {editingId === u.user_id ? (
                      <div className="flex items-center gap-1">
                        <input
                          value={editName}
                          onChange={e => setEditName(e.target.value)}
                          className="flex-1 bg-secondary/50 rounded px-2 py-1 text-xs outline-none"
                          onKeyDown={e => e.key === 'Enter' && handleSaveEdit()}
                          autoFocus
                        />
                        <button onClick={handleSaveEdit} className="p-1.5 text-accent"><Save className="w-3.5 h-3.5" /></button>
                        <button onClick={() => setEditingId(null)} className="p-1.5 text-muted-foreground"><X className="w-3.5 h-3.5" /></button>
                      </div>
                    ) : (
                      <>
                        <p className="text-xs font-semibold truncate">
                          {u.display_name || 'Anonymous'}
                          {u.user_id === user?.id && <span className="text-[9px] text-muted-foreground ml-1">(you)</span>}
                        </p>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-muted-foreground">{u.total_xp} XP</span>
                          <span className="text-[10px] text-muted-foreground">·</span>
                          <span className="text-[10px] text-muted-foreground">{u.mode}</span>
                          <span className="text-[10px] text-muted-foreground">·</span>
                          <span className="text-[10px] text-muted-foreground">{new Date(u.created_at).toLocaleDateString()}</span>
                        </div>
                      </>
                    )}
                  </div>
                  {editingId !== u.user_id && (
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <button onClick={() => startEdit(u)} className="p-1.5 text-muted-foreground hover:text-foreground transition-colors">
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      {u.user_id !== user?.id && (
                        <>
                          <button onClick={() => handleGrantAdmin(u.user_id)} className="p-1.5 text-muted-foreground hover:text-primary transition-colors" title="Grant admin">
                            <Crown className="w-3.5 h-3.5" />
                          </button>
                          <button onClick={() => handleDelete(u.user_id)} className="p-1.5 text-muted-foreground hover:text-destructive transition-colors">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </>
                      )}
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
            {filteredUsers.length === 0 && (
              <div className="text-center py-8">
                <UserX className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
                <p className="text-xs text-muted-foreground">No users found</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
