import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { supabase } from '@/integrations/supabase/client';
import {
  Users, Search, Trash2, Edit, ArrowLeft, Save, X, ShieldAlert, Crown,
  RefreshCw, Activity, Eye, ChevronDown, Mail, UserPlus, Send, Download
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
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
  current_ramadan_day: number;
  reminder_fajr: boolean;
  reminder_quran: boolean;
  reminder_dhikr: boolean;
  reminder_tahajjud: boolean;
  created_at: string;
  updated_at: string;
}

interface Subscriber {
  id: string;
  email: string;
  name: string;
  source: string;
  created_at: string;
}

type AdminTab = 'users' | 'subscribers' | 'invitations';

export default function AdminPage() {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState<AdminTab>('users');
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [invitations, setInvitations] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editXp, setEditXp] = useState(0);
  const [loading, setLoading] = useState(true);
  const [expandedUser, setExpandedUser] = useState<string | null>(null);
  const [stats, setStats] = useState({ total: 0, active: 0, totalXp: 0, sharing: 0, subscribers: 0, invites: 0 });
  const [roles, setRoles] = useState<Record<string, string[]>>({});
  const [bulkEmails, setBulkEmails] = useState('');
  const [bulkMessage, setBulkMessage] = useState('');

  useEffect(() => {
    if (!isAdmin) { navigate('/'); return; }
    loadAll();
  }, [isAdmin]);

  async function loadAll() {
    setLoading(true);
    await Promise.all([loadUsers(), loadRoles(), loadSubscribers(), loadInvitations()]);
    setLoading(false);
  }

  async function loadUsers() {
    const { data } = await supabase.from('profiles').select('*').order('total_xp', { ascending: false });
    if (data) {
      setUsers(data as AdminUser[]);
      setStats(prev => ({
        ...prev,
        total: data.length,
        active: data.filter(u => u.onboarded).length,
        totalXp: data.reduce((s, u) => s + (u.total_xp || 0), 0),
        sharing: data.filter(u => u.sharing_enabled).length,
      }));
    }
  }

  async function loadRoles() {
    const { data } = await supabase.from('user_roles').select('*');
    if (data) {
      const map: Record<string, string[]> = {};
      data.forEach((r: any) => { if (!map[r.user_id]) map[r.user_id] = []; map[r.user_id].push(r.role); });
      setRoles(map);
    }
  }

  async function loadSubscribers() {
    const { data } = await supabase.from('subscribers').select('*').order('created_at', { ascending: false });
    if (data) {
      setSubscribers(data as Subscriber[]);
      setStats(prev => ({ ...prev, subscribers: data.length }));
    }
  }

  async function loadInvitations() {
    const { data } = await supabase.from('invitations').select('*').order('created_at', { ascending: false });
    if (data) {
      setInvitations(data);
      setStats(prev => ({ ...prev, invites: data.length }));
    }
  }

  const filteredUsers = users.filter(u =>
    u.display_name?.toLowerCase().includes(search.toLowerCase()) || u.user_id?.toLowerCase().includes(search.toLowerCase())
  );

  const filteredSubscribers = subscribers.filter(s =>
    s.email?.toLowerCase().includes(search.toLowerCase()) || s.name?.toLowerCase().includes(search.toLowerCase())
  );

  async function handleDelete(userId: string) {
    if (userId === user?.id) { toast.error("Cannot delete yourself!"); return; }
    if (!confirm("Delete this user's profile?")) return;
    await supabase.from('profiles').delete().eq('user_id', userId);
    toast.success('Profile deleted');
    loadUsers();
  }

  async function handleGrantAdmin(userId: string) {
    const { error } = await supabase.from('user_roles').insert([{ user_id: userId, role: 'admin' }]);
    if (error) toast.error(error.message?.includes('duplicate') ? 'Already admin' : 'Failed');
    else { toast.success('Admin granted'); loadRoles(); }
  }

  async function handleRevokeAdmin(userId: string) {
    if (userId === user?.id) { toast.error("Can't revoke your own admin!"); return; }
    await supabase.from('user_roles').delete().eq('user_id', userId).eq('role', 'admin');
    toast.success('Admin revoked');
    loadRoles();
  }

  async function handleSaveEdit() {
    if (!editingId) return;
    await supabase.from('profiles').update({ display_name: editName, total_xp: editXp }).eq('user_id', editingId);
    toast.success('Updated');
    setEditingId(null);
    loadUsers();
  }

  async function handleDeleteSubscriber(id: string) {
    await supabase.from('subscribers').delete().eq('id', id);
    toast.success('Subscriber removed');
    loadSubscribers();
  }

  async function handleBulkAdd() {
    const emails = bulkEmails.split(/[,\n]/).map(e => e.trim()).filter(e => e && e.includes('@'));
    if (emails.length === 0) { toast.error('No valid emails found'); return; }
    
    const inserts = emails.map(email => ({ email, source: 'admin_bulk', name: '' }));
    const { error } = await supabase.from('subscribers').upsert(inserts, { onConflict: 'email', ignoreDuplicates: true });
    if (error) toast.error('Some emails failed to add');
    else toast.success(`${emails.length} emails added to subscribers`);
    setBulkEmails('');
    loadSubscribers();
  }

  function exportSubscribers() {
    const csv = 'Email,Name,Source,Date\n' + subscribers.map(s =>
      `${s.email},${s.name || ''},${s.source},${new Date(s.created_at).toLocaleDateString()}`
    ).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'ibadahtrack-subscribers.csv';
    a.click();
    toast.success('Exported!');
  }

  const getUserRole = (userId: string) => {
    const r = roles[userId] || [];
    return r.includes('admin') ? 'Admin' : r.includes('moderator') ? 'Mod' : 'User';
  };

  return (
    <div className="min-h-screen bg-background px-4 pt-6 pb-20">
      <div className="max-w-lg mx-auto space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate('/')} className="p-2 -ml-2 text-muted-foreground hover:text-foreground"><ArrowLeft className="w-5 h-5" /></button>
            <h1 className="text-lg font-bold gold-text">Admin Panel</h1>
          </div>
          <button onClick={loadAll} className="p-2 text-muted-foreground hover:text-foreground"><RefreshCw className="w-4 h-4" /></button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-2">
          {[
            { icon: Users, label: 'Users', value: stats.total, color: 'text-primary' },
            { icon: Mail, label: 'Subscribers', value: stats.subscribers, color: 'text-accent' },
            { icon: UserPlus, label: 'Invites', value: stats.invites, color: 'text-primary' },
          ].map(({ icon: Icon, label, value, color }) => (
            <div key={label} className="glass-card p-2.5 text-center">
              <Icon className={`w-3.5 h-3.5 mx-auto ${color} mb-0.5`} />
              <p className="text-sm font-bold">{value}</p>
              <p className="text-[9px] text-muted-foreground">{label}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-secondary/50 rounded-xl p-1">
          {(['users', 'subscribers', 'invitations'] as const).map(t => (
            <button key={t} onClick={() => setTab(t)} className={`flex-1 py-2 rounded-lg text-[10px] font-medium transition-all ${tab === t ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground'}`}>
              {t === 'users' ? '👥 Users' : t === 'subscribers' ? '📧 Subscribers' : '💌 Invites'}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder={`Search ${tab}...`}
            className="w-full pl-10 pr-4 py-2.5 bg-card border border-border rounded-xl text-xs outline-none focus:ring-1 focus:ring-primary/30"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <>
            {/* USERS TAB */}
            {tab === 'users' && (
              <div className="space-y-2">
                <p className="text-[10px] text-muted-foreground">{filteredUsers.length} users • {stats.active} onboarded • {stats.totalXp} total XP</p>
                {filteredUsers.map((u, i) => {
                  const role = getUserRole(u.user_id);
                  const isExpanded = expandedUser === u.user_id;
                  return (
                    <motion.div key={u.user_id} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.02 }}
                      className={`glass-card overflow-hidden ${u.user_id === user?.id ? 'ring-1 ring-primary/30' : ''}`}>
                      <div className="p-3">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary flex-shrink-0">
                            {(u.display_name || 'U').substring(0, 2).toUpperCase()}
                          </div>
                          <div className="flex-1 min-w-0">
                            {editingId === u.user_id ? (
                              <div className="space-y-1.5">
                                <input value={editName} onChange={e => setEditName(e.target.value)} className="w-full bg-secondary/50 rounded px-2 py-1 text-xs outline-none" autoFocus />
                                <div className="flex items-center gap-2">
                                  <span className="text-[10px] text-muted-foreground">XP:</span>
                                  <input type="number" value={editXp} onChange={e => setEditXp(Number(e.target.value))} className="w-20 bg-secondary/50 rounded px-2 py-1 text-xs outline-none" />
                                  <button onClick={handleSaveEdit} className="p-1 text-accent"><Save className="w-3.5 h-3.5" /></button>
                                  <button onClick={() => setEditingId(null)} className="p-1 text-muted-foreground"><X className="w-3.5 h-3.5" /></button>
                                </div>
                              </div>
                            ) : (
                              <>
                                <div className="flex items-center gap-1.5">
                                  <p className="text-xs font-semibold truncate">{u.display_name || 'Anonymous'}</p>
                                  {role === 'Admin' && <ShieldAlert className="w-3 h-3 text-primary flex-shrink-0" />}
                                  {u.user_id === user?.id && <span className="text-[9px] text-primary">(you)</span>}
                                </div>
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  <span className="text-[10px] text-muted-foreground">{u.total_xp} XP</span>
                                  <span className="text-[10px] text-muted-foreground">·</span>
                                  <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-medium ${role === 'Admin' ? 'bg-primary/15 text-primary' : 'bg-secondary text-muted-foreground'}`}>{role}</span>
                                </div>
                              </>
                            )}
                          </div>
                          {editingId !== u.user_id && (
                            <div className="flex items-center gap-0.5 flex-shrink-0">
                              <button onClick={() => setExpandedUser(isExpanded ? null : u.user_id)} className="p-1.5 text-muted-foreground hover:text-foreground">
                                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                              </button>
                              <button onClick={() => { setEditingId(u.user_id); setEditName(u.display_name); setEditXp(u.total_xp); }} className="p-1.5 text-muted-foreground hover:text-foreground">
                                <Edit className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                      <AnimatePresence>
                        {isExpanded && editingId !== u.user_id && (
                          <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden">
                            <div className="px-3 pb-3 border-t border-border/50 pt-2 space-y-2">
                              <div className="grid grid-cols-2 gap-2 text-[10px]">
                                <div><span className="text-muted-foreground">Joined:</span> {new Date(u.created_at).toLocaleDateString()}</div>
                                <div><span className="text-muted-foreground">Mode:</span> {u.mode}</div>
                                <div><span className="text-muted-foreground">Day:</span> R{u.current_ramadan_day}</div>
                                <div><span className="text-muted-foreground">Sharing:</span> {u.sharing_enabled ? '✅' : '❌'}</div>
                                <div><span className="text-muted-foreground">Onboarded:</span> {u.onboarded ? '✅' : '❌'}</div>
                                <div><span className="text-muted-foreground">Reminders:</span> {[u.reminder_fajr && 'F', u.reminder_quran && 'Q', u.reminder_dhikr && 'D', u.reminder_tahajjud && 'T'].filter(Boolean).join(',') || 'None'}</div>
                              </div>
                              <div className="flex gap-1.5 pt-1">
                                {role !== 'Admin' ? (
                                  <button onClick={() => handleGrantAdmin(u.user_id)} className="flex-1 py-1.5 bg-primary/10 text-primary rounded-lg text-[10px] font-medium hover:bg-primary/20">Grant Admin</button>
                                ) : u.user_id !== user?.id ? (
                                  <button onClick={() => handleRevokeAdmin(u.user_id)} className="flex-1 py-1.5 bg-destructive/10 text-destructive rounded-lg text-[10px] font-medium hover:bg-destructive/20">Revoke Admin</button>
                                ) : null}
                                {u.user_id !== user?.id && (
                                  <button onClick={() => handleDelete(u.user_id)} className="px-3 py-1.5 bg-destructive/10 text-destructive rounded-lg text-[10px] font-medium hover:bg-destructive/20">
                                    <Trash2 className="w-3 h-3" />
                                  </button>
                                )}
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  );
                })}
              </div>
            )}

            {/* SUBSCRIBERS TAB */}
            {tab === 'subscribers' && (
              <div className="space-y-3">
                {/* Bulk add emails */}
                <div className="glass-card p-3 space-y-2.5 border-primary/20">
                  <p className="text-xs font-semibold flex items-center gap-1.5"><Mail className="w-3.5 h-3.5 text-primary" /> Add Emails in Bulk</p>
                  <textarea
                    value={bulkEmails}
                    onChange={e => setBulkEmails(e.target.value)}
                    placeholder="Paste emails separated by commas or new lines...&#10;user1@email.com, user2@email.com"
                    rows={3}
                    className="w-full bg-secondary/50 rounded-lg p-2.5 text-xs resize-none outline-none focus:ring-1 focus:ring-primary/30 placeholder:text-muted-foreground/50"
                  />
                  <div className="flex gap-2">
                    <button onClick={handleBulkAdd} className="flex-1 py-2 bg-primary text-primary-foreground rounded-lg text-xs font-medium flex items-center justify-center gap-1">
                      <UserPlus className="w-3 h-3" /> Add to List
                    </button>
                    <button onClick={exportSubscribers} className="px-4 py-2 bg-secondary text-secondary-foreground rounded-lg text-xs font-medium flex items-center gap-1">
                      <Download className="w-3 h-3" /> Export CSV
                    </button>
                  </div>
                </div>

                <p className="text-[10px] text-muted-foreground">{filteredSubscribers.length} subscribers</p>

                {filteredSubscribers.map(s => (
                  <div key={s.id} className="glass-card p-3 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center">
                      <Mail className="w-3.5 h-3.5 text-accent" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium truncate">{s.email}</p>
                      <div className="flex items-center gap-1.5">
                        {s.name && <span className="text-[10px] text-muted-foreground">{s.name}</span>}
                        <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-secondary text-muted-foreground">{s.source}</span>
                        <span className="text-[10px] text-muted-foreground">{new Date(s.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <button onClick={() => handleDeleteSubscriber(s.id)} className="p-1.5 text-muted-foreground hover:text-destructive">
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* INVITATIONS TAB */}
            {tab === 'invitations' && (
              <div className="space-y-2">
                <p className="text-[10px] text-muted-foreground">{invitations.length} invitations sent by users</p>
                {invitations.map(inv => (
                  <div key={inv.id} className="glass-card p-3 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <Send className="w-3.5 h-3.5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium truncate">{inv.email}</p>
                      <div className="flex items-center gap-1.5">
                        {inv.name && <span className="text-[10px] text-muted-foreground">{inv.name}</span>}
                        <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-medium ${inv.status === 'pending' ? 'bg-primary/10 text-primary' : 'bg-accent/10 text-accent'}`}>{inv.status}</span>
                        <span className="text-[10px] text-muted-foreground">{new Date(inv.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                ))}
                {invitations.length === 0 && (
                  <div className="text-center py-8 text-xs text-muted-foreground">No invitations yet</div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
