import { useState, useEffect } from 'react';
import { db, type LocalUser } from '@/lib/db';
import { useAuth } from '@/lib/auth-context';
import { supabase } from '@/integrations/supabase/client';
import {
    Users,
    Search,
    Trash2,
    Edit,
    ArrowLeft,
    Save,
    X,
    ShieldAlert,
    MessageSquare,
    Trophy,
    RefreshCw
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

export default function AdminPage() {
    const { user, isAdmin } = useAuth();
    const navigate = useNavigate();
    const [users, setUsers] = useState<LocalUser[]>([]);
    const [search, setSearch] = useState('');
    const [editingId, setEditingId] = useState<number | null>(null);
    const [editName, setEditName] = useState('');
    const [editRole, setEditRole] = useState<'user' | 'admin'>('user');

    const [activeTab, setActiveTab] = useState<'users' | 'messages' | 'profiles'>('users');
    const [messages, setMessages] = useState<any[]>([]);
    const [profiles, setProfiles] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!isAdmin) {
            navigate('/');
            return;
        }
        loadData();
    }, [isAdmin, activeTab]);

    async function loadData() {
        setLoading(true);
        if (activeTab === 'users') await loadUsers();
        else if (activeTab === 'messages') await loadMessages();
        else if (activeTab === 'profiles') await loadProfiles();
        setLoading(false);
    }

    async function loadUsers() {
        const allUsers = await db.users.toArray();
        setUsers(allUsers);
    }

    async function loadMessages() {
        const { data } = await supabase.from('community_messages').select('*').order('created_at', { ascending: false });
        if (data) setMessages(data);
    }

    async function loadProfiles() {
        const { data } = await supabase.from('profiles').select('*').order('total_xp', { ascending: false });
        if (data) setProfiles(data);
    }

    const filteredUsers = users.filter(u =>
        u.name.toLowerCase().includes(search.toLowerCase()) ||
        u.email.toLowerCase().includes(search.toLowerCase())
    );

    async function handleDelete(id: number) {
        if (id === user?.id) {
            alert("You cannot delete yourself!");
            return;
        }
        if (confirm("Are you sure you want to delete this user? All their data will be removed.")) {
            await db.users.delete(id);
            await db.dhikr_logs.where('userId').equals(id).delete();
            await db.quran_progress.where('userId').equals(id).delete();
            await db.streaks.where('userId').equals(id).delete();
            loadUsers();
        }
    }

    function startEdit(u: LocalUser) {
        setEditingId(u.id!);
        setEditName(u.name);
        setEditRole(u.role);
    }

    async function handleSaveEdit() {
        if (editingId) {
            await db.users.update(editingId, {
                name: editName,
                role: editRole,
                updated_at: new Date()
            });
            setEditingId(null);
            loadUsers();
        }
    }

    return (
        <div className="min-h-screen bg-background p-6">
            <div className="max-w-5xl mx-auto space-y-8">
                <header className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => navigate('/')}
                            className="p-2 hover:bg-accent rounded-full transition-colors"
                        >
                            <ArrowLeft className="w-6 h-6" />
                        </button>
                        <h1 className="text-3xl font-bold gold-text">Admin Panel</h1>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={loadData}
                            className={`p-2 hover:bg-accent rounded-lg transition-colors ${loading ? 'animate-spin' : ''}`}
                        >
                            <RefreshCw className="w-5 h-5 text-muted-foreground" />
                        </button>
                        <div className="bg-primary/10 px-4 py-2 rounded-full flex items-center gap-2">
                            <ShieldAlert className="w-4 h-4 text-primary" />
                            <span className="text-sm font-medium text-primary">System Administrator</span>
                        </div>
                    </div>
                </header>

                <div className="flex gap-2 bg-muted/30 p-1 rounded-xl w-fit">
                    <button
                        onClick={() => setActiveTab('users')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'users' ? 'bg-background shadow-md text-foreground' : 'text-muted-foreground hover:bg-muted'}`}
                    >
                        <div className="flex items-center gap-2">
                            <Users className="w-4 h-4" /> Local Users
                        </div>
                    </button>
                    <button
                        onClick={() => setActiveTab('messages')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'messages' ? 'bg-background shadow-md text-foreground' : 'text-muted-foreground hover:bg-muted'}`}
                    >
                        <div className="flex items-center gap-2">
                            <MessageSquare className="w-4 h-4" /> Community Chat
                        </div>
                    </button>
                    <button
                        onClick={() => setActiveTab('profiles')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'profiles' ? 'bg-background shadow-md text-foreground' : 'text-muted-foreground hover:bg-muted'}`}
                    >
                        <div className="flex items-center gap-2">
                            <Trophy className="w-4 h-4" /> Public Profiles
                        </div>
                    </button>
                </div>

                <section className="bg-card border border-border rounded-2xl overflow-hidden">
                    {activeTab === 'users' && (
                        <>
                            <div className="p-4 border-b border-border bg-muted/30">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                    <input
                                        type="text"
                                        placeholder="Search local users..."
                                        className="w-full pl-10 pr-4 py-2 bg-background border border-border rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/20"
                                        value={search}
                                        onChange={e => setSearch(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead>
                                        <tr className="bg-muted/50 text-muted-foreground text-xs font-semibold uppercase tracking-wider">
                                            <th className="px-6 py-4">User</th>
                                            <th className="px-6 py-4">Role</th>
                                            <th className="px-6 py-4">Signed Up</th>
                                            <th className="px-6 py-4 text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border">
                                        {filteredUsers.map(u => (
                                            <tr key={u.id} className="hover:bg-accent/50 transition-colors">
                                                <td className="px-6 py-4">
                                                    {editingId === u.id ? (
                                                        <input
                                                            type="text"
                                                            className="bg-background border border-border rounded px-2 py-1 text-sm w-full"
                                                            value={editName}
                                                            onChange={e => setEditName(e.target.value)}
                                                        />
                                                    ) : (
                                                        <div>
                                                            <p className="font-medium">{u.name}</p>
                                                            <p className="text-xs text-muted-foreground">{u.email}</p>
                                                        </div>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4">
                                                    {editingId === u.id ? (
                                                        <select
                                                            className="bg-background border border-border rounded px-2 py-1 text-sm"
                                                            value={editRole}
                                                            onChange={e => setEditRole(e.target.value as any)}
                                                        >
                                                            <option value="user">User</option>
                                                            <option value="admin">Admin</option>
                                                        </select>
                                                    ) : (
                                                        <span className={`px-2 py-1 rounded-md text-[10px] uppercase font-bold ${u.role === 'admin' ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground'
                                                            }`}>
                                                            {u.role}
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 text-sm text-muted-foreground">
                                                    {new Date(u.created_at).toLocaleDateString()}
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <div className="flex items-center justify-end gap-2">
                                                        {editingId === u.id ? (
                                                            <>
                                                                <button
                                                                    onClick={handleSaveEdit}
                                                                    className="p-2 text-green-500 hover:bg-green-500/10 rounded-lg"
                                                                >
                                                                    <Save className="w-4 h-4" />
                                                                </button>
                                                                <button
                                                                    onClick={() => setEditingId(null)}
                                                                    className="p-2 text-destructive hover:bg-destructive/10 rounded-lg"
                                                                >
                                                                    <X className="w-4 h-4" />
                                                                </button>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <button
                                                                    onClick={() => startEdit(u)}
                                                                    className="p-2 text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg"
                                                                >
                                                                    <Edit className="w-4 h-4" />
                                                                </button>
                                                                <button
                                                                    onClick={() => handleDelete(u.id!)}
                                                                    className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg"
                                                                >
                                                                    <Trash2 className="w-4 h-4" />
                                                                </button>
                                                            </>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </>
                    )}

                    {activeTab === 'messages' && (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="bg-muted/50 text-muted-foreground text-xs font-semibold uppercase tracking-wider">
                                        <th className="px-6 py-4">User</th>
                                        <th className="px-6 py-4">Message</th>
                                        <th className="px-6 py-4">Date</th>
                                        <th className="px-6 py-4 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border">
                                    {messages.map(m => (
                                        <tr key={m.id} className="hover:bg-accent/50 transition-colors">
                                            <td className="px-6 py-4">
                                                <p className="font-medium text-sm">{m.display_name}</p>
                                                <p className="text-[10px] text-muted-foreground">UID: {m.user_id}</p>
                                            </td>
                                            <td className="px-6 py-4">
                                                <p className="text-sm max-w-md truncate">{m.message}</p>
                                                <span className="text-[10px] bg-secondary px-1.5 py-0.5 rounded uppercase font-bold text-muted-foreground">{m.message_type}</span>
                                            </td>
                                            <td className="px-6 py-4 text-xs text-muted-foreground">
                                                {new Date(m.created_at).toLocaleString()}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <button
                                                    onClick={async () => {
                                                        if (confirm("Delete this message?")) {
                                                            await supabase.from('community_messages').delete().eq('id', m.id);
                                                            loadMessages();
                                                            toast.success("Message deleted");
                                                        }
                                                    }}
                                                    className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {activeTab === 'profiles' && (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="bg-muted/50 text-muted-foreground text-xs font-semibold uppercase tracking-wider">
                                        <th className="px-6 py-4">Display Name</th>
                                        <th className="px-6 py-4">XP</th>
                                        <th className="px-6 py-4">Status</th>
                                        <th className="px-6 py-4 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border">
                                    {profiles.map(p => (
                                        <tr key={p.user_id} className="hover:bg-accent/50 transition-colors">
                                            <td className="px-6 py-4">
                                                <p className="font-medium text-sm">{p.display_name}</p>
                                                <p className="text-[10px] text-muted-foreground">ID: {p.user_id}</p>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-1.5">
                                                    <Trophy className="w-3.5 h-3.5 text-primary" />
                                                    <span className="text-sm font-bold gold-text">{p.total_xp}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                {p.sharing_enabled ? (
                                                    <span className="px-2 py-1 rounded-full text-[10px] bg-green-500/10 text-green-500 font-bold">PUBLIC</span>
                                                ) : (
                                                    <span className="px-2 py-1 rounded-full text-[10px] bg-muted text-muted-foreground font-bold">PRIVATE</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <button
                                                    onClick={async () => {
                                                        if (confirm("Delete this public profile? It will remove them from the leaderboard.")) {
                                                            await supabase.from('profiles').delete().eq('user_id', p.user_id);
                                                            loadProfiles();
                                                            toast.success("Profile removed from leaderboard");
                                                        }
                                                    }}
                                                    className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </section>
            </div>
        </div>
    );
}
