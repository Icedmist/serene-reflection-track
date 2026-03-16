import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/auth-context';
import { Mail, Send, UserPlus, Check, Users, Copy } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

export default function InviteSection() {
  const { user } = useAuth();
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState<string[]>([]);

  const inviteLink = `${window.location.origin}?ref=${user?.id?.slice(0, 8) || 'friend'}`;

  const handleInvite = async () => {
    if (!email.trim() || !user) return;
    setSending(true);

    try {
      // Save invitation record
      await supabase.from('invitations').insert({
        invited_by: user.id,
        email: email.trim(),
        name: name.trim(),
      });

      // Also add to subscribers
      await supabase.from('subscribers').insert({
        email: email.trim(),
        name: name.trim(),
        source: 'user_invite',
        referred_by: user.id,
      }).then(() => {}); // ignore duplicate errors

      setSent(prev => [...prev, email.trim()]);
      toast.success(`Invitation sent to ${name || email}!`);
      setEmail('');
      setName('');
    } catch (e) {
      toast.error('Failed to send invitation');
    }

    setSending(false);
  };

  const copyLink = () => {
    navigator.clipboard.writeText(inviteLink);
    toast.success('Invite link copied!');
  };

  return (
    <div className="glass-card p-4 space-y-3 border-primary/20">
      <h3 className="text-sm font-semibold flex items-center gap-2">
        <UserPlus className="w-4 h-4 text-primary" /> Invite Friends
      </h3>
      <p className="text-[10px] text-muted-foreground">
        Share the reward! Invite friends & family to join IbadahTrack.
      </p>

      {/* Quick copy link */}
      <button
        onClick={copyLink}
        className="w-full flex items-center gap-2 bg-secondary/50 rounded-lg px-3 py-2.5 text-left hover:bg-secondary/70 transition-colors"
      >
        <Copy className="w-3.5 h-3.5 text-primary flex-shrink-0" />
        <span className="text-[10px] text-muted-foreground truncate flex-1">{inviteLink}</span>
        <span className="text-[10px] text-primary font-medium">Copy</span>
      </button>

      {/* Email invite form */}
      <div className="space-y-2">
        <input
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="Friend's name (optional)"
          className="w-full bg-secondary/50 rounded-lg px-3 py-2 text-xs outline-none focus:ring-1 focus:ring-primary/30"
        />
        <div className="flex gap-2">
          <input
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="Friend's email"
            type="email"
            className="flex-1 bg-secondary/50 rounded-lg px-3 py-2 text-xs outline-none focus:ring-1 focus:ring-primary/30"
            onKeyDown={e => e.key === 'Enter' && handleInvite()}
          />
          <button
            onClick={handleInvite}
            disabled={sending || !email.trim()}
            className="px-4 bg-primary text-primary-foreground rounded-lg text-xs font-medium disabled:opacity-50 flex items-center gap-1"
          >
            {sending ? '...' : <><Send className="w-3 h-3" /> Invite</>}
          </button>
        </div>
      </div>

      {/* Sent invites */}
      <AnimatePresence>
        {sent.length > 0 && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            className="space-y-1"
          >
            <p className="text-[10px] text-muted-foreground flex items-center gap-1">
              <Users className="w-3 h-3" /> Invited this session:
            </p>
            {sent.map(s => (
              <div key={s} className="flex items-center gap-1.5 text-[10px] text-accent">
                <Check className="w-3 h-3" /> {s}
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Social share */}
      <div className="flex gap-2">
        <a
          href={`https://wa.me/?text=${encodeURIComponent(`Join me on IbadahTrack! 🌙 Track your worship this Ramadan. ${inviteLink}`)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 py-2 bg-accent/10 text-accent rounded-lg text-[10px] font-medium text-center"
        >
          WhatsApp
        </a>
        <a
          href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(`Join me on IbadahTrack! 🌙 ${inviteLink} #IbadahTrack #Ramadan`)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 py-2 bg-primary/10 text-primary rounded-lg text-[10px] font-medium text-center"
        >
          Twitter/X
        </a>
      </div>
    </div>
  );
}
