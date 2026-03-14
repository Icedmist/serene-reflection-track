import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useStore } from '@/lib/store';
import { supabase } from '@/integrations/supabase/client';
import { Trophy, Users, Send, Crown, Medal, Award, MessageCircle, ArrowLeft, Flame } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

interface LeaderboardEntry {
  user_id: string;
  display_name: string;
  total_xp: number;
  sharing_enabled: boolean;
}

interface CommunityMessage {
  id: string;
  user_id: string;
  display_name: string;
  message: string;
  message_type: string;
  created_at: string;
}

const RANK_ICONS = [
  <Crown className="w-5 h-5 text-primary" />,
  <Medal className="w-5 h-5 text-muted-foreground" />,
  <Award className="w-5 h-5 text-accent" />,
];

const ENCOURAGEMENTS = [
  'ما شاء الله! Keep going! 💪',
  'بارك الله فيك — May Allah bless your efforts!',
  'Consistency is key, you\'re doing amazing!',
  'اللهم بارك — Your dedication inspires!',
  'Every step counts in this blessed journey 🌙',
];

export default function CommunityPage() {
  const { user, isGuest } = useAuth();
  const { state } = useStore();
  const navigate = useNavigate();
  const [tab, setTab] = useState<'leaderboard' | 'chat'>('leaderboard');
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [messages, setMessages] = useState<CommunityMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchLeaderboard();
    fetchMessages();

    // Realtime subscription for messages
    const channel = supabase
      .channel('community-messages')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'community_messages' }, (payload) => {
        const msg = payload.new as CommunityMessage;
        setMessages(prev => [...prev, msg]);
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchLeaderboard = async () => {
    const { data } = await supabase
      .from('profiles')
      .select('user_id, display_name, total_xp, sharing_enabled')
      .eq('sharing_enabled', true)
      .order('total_xp', { ascending: false })
      .limit(50);
    if (data) setLeaderboard(data);
    setLoading(false);
  };

  const fetchMessages = async () => {
    const { data } = await supabase
      .from('community_messages')
      .select('*')
      .order('created_at', { ascending: true })
      .limit(100);
    if (data) setMessages(data);
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !user || isGuest) {
      if (isGuest) toast.error('Sign in to join the community chat');
      return;
    }
    setSending(true);
    const { error } = await supabase.from('community_messages').insert([{
      user_id: String(user.id),
      display_name: state.userName || 'Anonymous',
      message: newMessage.trim(),
      message_type: 'chat',
    }]);
    if (error) {
      toast.error('Failed to send message');
    } else {
      setNewMessage('');
    }
    setSending(false);
  };

  const handleQuickEncourage = async () => {
    if (!user || isGuest) {
      toast.error('Sign in to send encouragements');
      return;
    }
    const msg = ENCOURAGEMENTS[Math.floor(Math.random() * ENCOURAGEMENTS.length)];
    await supabase.from('community_messages').insert([{
      user_id: String(user.id),
      display_name: state.userName || 'Anonymous',
      message: msg,
      message_type: 'encouragement',
    }]);
  };

  const userRank = leaderboard.findIndex(e => e.user_id === String(user?.id)) + 1;

  const getInitials = (name: string) => {
    return name.split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase();
  };

  const formatTime = (dateStr: string) => {
    const d = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return 'now';
    if (diffMins < 60) return `${diffMins}m`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h`;
    return `${Math.floor(diffHours / 24)}d`;
  };

  return (
    <div className="px-4 pt-6 pb-6 space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button onClick={() => navigate('/streaks')} className="p-2 -ml-2 text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-lg font-bold gold-text flex items-center gap-2">
          <Users className="w-5 h-5" /> Community
        </h1>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-secondary/50 rounded-lg p-1">
        <button
          onClick={() => setTab('leaderboard')}
          className={`flex-1 py-2 rounded-md text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${
            tab === 'leaderboard' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground'
          }`}
        >
          <Trophy className="w-3.5 h-3.5" /> Leaderboard
        </button>
        <button
          onClick={() => setTab('chat')}
          className={`flex-1 py-2 rounded-md text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${
            tab === 'chat' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground'
          }`}
        >
          <MessageCircle className="w-3.5 h-3.5" /> Community Chat
        </button>
      </div>

      <AnimatePresence mode="wait">
        {tab === 'leaderboard' ? (
          <motion.div
            key="leaderboard"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            className="space-y-3"
          >
            {/* User's own rank */}
            {userRank > 0 && (
              <div className="glass-card p-3 flex items-center gap-3 border-primary/30">
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary">
                  #{userRank}
                </div>
                <div className="flex-1">
                  <p className="text-xs font-semibold">Your Rank</p>
                  <p className="text-[10px] text-muted-foreground">{state.totalXp} XP</p>
                </div>
                <Flame className="w-4 h-4 streak-fire" />
              </div>
            )}

            {!userRank && !isGuest && (
              <div className="glass-card p-3 text-center">
                <p className="text-xs text-muted-foreground">Enable sharing in settings to appear on the leaderboard</p>
              </div>
            )}

            {loading ? (
              <div className="flex justify-center py-8">
                <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              </div>
            ) : leaderboard.length === 0 ? (
              <div className="glass-card p-6 text-center space-y-2">
                <Trophy className="w-8 h-8 mx-auto text-muted-foreground" />
                <p className="text-sm text-muted-foreground">No users on the leaderboard yet</p>
                <p className="text-[10px] text-muted-foreground">Be the first — enable sharing in your profile!</p>
              </div>
            ) : (
              <div className="space-y-2">
                {leaderboard.map((entry, i) => {
                  const isCurrentUser = entry.user_id === String(user?.id);
                  return (
                    <motion.div
                      key={entry.user_id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.03 }}
                      className={`glass-card p-3 flex items-center gap-3 ${isCurrentUser ? 'ring-1 ring-primary/40' : ''}`}
                    >
                      {/* Rank */}
                      <div className="w-8 flex-shrink-0 text-center">
                        {i < 3 ? RANK_ICONS[i] : (
                          <span className="text-xs font-bold text-muted-foreground">#{i + 1}</span>
                        )}
                      </div>

                      {/* Avatar */}
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0 ${
                        i === 0 ? 'bg-primary/20 text-primary' :
                        i === 1 ? 'bg-muted text-muted-foreground' :
                        i === 2 ? 'bg-accent/20 text-accent' :
                        'bg-secondary text-secondary-foreground'
                      }`}>
                        {getInitials(entry.display_name || 'U')}
                      </div>

                      {/* Name & XP */}
                      <div className="flex-1 min-w-0">
                        <p className={`text-xs font-semibold truncate ${isCurrentUser ? 'gold-text' : ''}`}>
                          {entry.display_name || 'Anonymous'}
                          {isCurrentUser && <span className="text-[9px] text-muted-foreground ml-1">(you)</span>}
                        </p>
                      </div>

                      {/* XP */}
                      <div className="text-right flex-shrink-0">
                        <p className={`text-sm font-bold ${i === 0 ? 'gold-text gold-glow' : ''}`}>{entry.total_xp}</p>
                        <p className="text-[8px] text-muted-foreground">XP</p>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </motion.div>
        ) : (
          <motion.div
            key="chat"
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            className="space-y-3"
          >
            {/* Messages */}
            <div className="glass-card p-3 space-y-3 max-h-[400px] overflow-y-auto hide-scrollbar">
              {messages.length === 0 ? (
                <div className="text-center py-8 space-y-2">
                  <MessageCircle className="w-8 h-8 mx-auto text-muted-foreground" />
                  <p className="text-xs text-muted-foreground">No messages yet — be the first to encourage!</p>
                </div>
              ) : (
                messages.map((msg, i) => {
                  const isOwn = msg.user_id === String(user?.id);
                  return (
                    <motion.div
                      key={msg.id}
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex gap-2 ${isOwn ? 'flex-row-reverse' : ''}`}
                    >
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[9px] font-bold flex-shrink-0 ${
                        isOwn ? 'bg-primary/20 text-primary' : 'bg-secondary text-secondary-foreground'
                      }`}>
                        {getInitials(msg.display_name || 'U')}
                      </div>
                      <div className={`max-w-[75%] ${isOwn ? 'text-right' : ''}`}>
                        <div className="flex items-baseline gap-1.5 mb-0.5" style={{ flexDirection: isOwn ? 'row-reverse' : 'row' }}>
                          <span className="text-[10px] font-semibold">{msg.display_name}</span>
                          <span className="text-[8px] text-muted-foreground">{formatTime(msg.created_at)}</span>
                        </div>
                        <div className={`px-3 py-2 rounded-xl text-xs ${
                          isOwn
                            ? 'bg-primary/15 text-foreground rounded-tr-sm'
                            : msg.message_type === 'encouragement'
                              ? 'bg-accent/10 text-foreground rounded-tl-sm'
                              : 'bg-secondary text-foreground rounded-tl-sm'
                        }`}>
                          {msg.message}
                        </div>
                      </div>
                    </motion.div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Encourage */}
            <button
              onClick={handleQuickEncourage}
              className="w-full py-2.5 bg-accent/10 text-accent rounded-xl text-xs font-medium hover:bg-accent/20 transition-colors"
            >
              ✨ Send Quick Encouragement
            </button>

            {/* Message Input */}
            <div className="flex gap-2">
              <input
                type="text"
                value={newMessage}
                onChange={e => setNewMessage(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSendMessage()}
                placeholder={isGuest ? 'Sign in to chat...' : 'Type a message...'}
                disabled={isGuest}
                className="flex-1 bg-secondary/50 border border-border rounded-xl px-3 py-2.5 text-xs placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary disabled:opacity-50"
              />
              <button
                onClick={handleSendMessage}
                disabled={sending || !newMessage.trim() || isGuest}
                className="px-4 bg-primary text-primary-foreground rounded-xl flex items-center justify-center hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
