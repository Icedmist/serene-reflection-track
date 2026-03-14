import { useStore } from '@/lib/store';
import { motion } from 'framer-motion';
import { Plus, Minus, RotateCcw, Heart, Trash2, Sparkles, Send, Loader2 } from 'lucide-react';
import { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import { toast } from 'sonner';

const SUGGEST_DUA_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/suggest-dua`;

export default function DhikrPage() {
  const { todayLog, updateDhikr, state, addDua, toggleDuaAnswered, removeDua } = useStore();
  const [animatingId, setAnimatingId] = useState<string | null>(null);
  const [tab, setTab] = useState<'adhkar' | 'dhikr' | 'dua'>('adhkar');
  const [newDua, setNewDua] = useState('');

  // AI Dua state
  const [aiIntent, setAiIntent] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [showAi, setShowAi] = useState(false);

  const handleIncrement = (id: string) => {
    updateDhikr(id, 1);
    setAnimatingId(id);
    setTimeout(() => setAnimatingId(null), 150);
  };

  const totalCount = todayLog.dhikr.reduce((s, d) => s + d.count, 0);
  const totalTarget = todayLog.dhikr.reduce((s, d) => s + d.target, 0);

  const morningDone = (todayLog.morningAdhkar || []).filter(a => a.completed).length;
  const morningTotal = (todayLog.morningAdhkar || []).length;
  const eveningDone = (todayLog.eveningAdhkar || []).filter(a => a.completed).length;
  const eveningTotal = (todayLog.eveningAdhkar || []).length;

  const handleAiSuggest = async () => {
    if (!aiIntent.trim()) return;
    setAiLoading(true);
    setAiResponse('');

    try {
      const resp = await fetch(SUGGEST_DUA_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ intent: aiIntent }),
      });

      if (!resp.ok || !resp.body) {
        const errData = await resp.json().catch(() => ({}));
        toast.error(errData.error || 'Failed to get suggestion');
        setAiLoading(false);
        return;
      }

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let textBuffer = '';
      let fullText = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        textBuffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = textBuffer.indexOf('\n')) !== -1) {
          let line = textBuffer.slice(0, newlineIndex);
          textBuffer = textBuffer.slice(newlineIndex + 1);

          if (line.endsWith('\r')) line = line.slice(0, -1);
          if (line.startsWith(':') || line.trim() === '') continue;
          if (!line.startsWith('data: ')) continue;

          const jsonStr = line.slice(6).trim();
          if (jsonStr === '[DONE]') break;

          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) {
              fullText += content;
              setAiResponse(fullText);
            }
          } catch {
            textBuffer = line + '\n' + textBuffer;
            break;
          }
        }
      }
    } catch (e) {
      toast.error('Failed to connect to AI service');
    }
    setAiLoading(false);
  };

  const handleSaveAiDua = () => {
    if (aiResponse) {
      // Extract first meaningful line as the dua text
      const lines = aiResponse.split('\n').filter(l => l.trim());
      const duaText = aiIntent + ' — ' + (lines[0] || '').substring(0, 200);
      addDua(duaText);
      toast.success("Du'a saved to your list");
    }
  };

  return (
    <div className="px-4 pt-6 space-y-4 pb-6">
      <h1 className="text-lg font-bold gold-text">Adhkar & Du'a</h1>

      {/* Tabs */}
      <div className="flex gap-1 bg-secondary/50 rounded-xl p-1">
        {(['adhkar', 'dhikr', 'dua'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)} className={`flex-1 py-2 rounded-lg text-xs font-medium transition-all ${tab === t ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground'}`}>
            {t === 'adhkar' ? '📿 Adhkar' : t === 'dhikr' ? '🔢 Counters' : '🤲 Du\'a'}
          </button>
        ))}
      </div>

      {tab === 'adhkar' && (
        <div className="space-y-3">
          <Link to="/guided/morning" className="glass-card p-4 flex items-center justify-between hover:border-primary/30 transition-colors">
            <div className="flex items-center gap-3">
              <span className="text-2xl">🌅</span>
              <div>
                <p className="text-sm font-semibold">Morning Adhkar</p>
                <p className="text-[10px] text-muted-foreground">{morningDone}/{morningTotal} completed</p>
              </div>
            </div>
            <div className="h-1.5 w-20 bg-secondary rounded-full overflow-hidden">
              <div className="h-full bg-primary rounded-full" style={{ width: morningTotal ? `${(morningDone / morningTotal) * 100}%` : '0%' }} />
            </div>
          </Link>

          <Link to="/guided/evening" className="glass-card p-4 flex items-center justify-between hover:border-primary/30 transition-colors">
            <div className="flex items-center gap-3">
              <span className="text-2xl">🌇</span>
              <div>
                <p className="text-sm font-semibold">Evening Adhkar</p>
                <p className="text-[10px] text-muted-foreground">{eveningDone}/{eveningTotal} completed</p>
              </div>
            </div>
            <div className="h-1.5 w-20 bg-secondary rounded-full overflow-hidden">
              <div className="h-full bg-accent rounded-full" style={{ width: eveningTotal ? `${(eveningDone / eveningTotal) * 100}%` : '0%' }} />
            </div>
          </Link>

          <Link to="/salatul-tasbeeh" className="glass-card p-4 flex items-center gap-3 hover:border-primary/30 transition-colors">
            <span className="text-2xl">🙏</span>
            <div>
              <p className="text-sm font-semibold">Salatul Tasbeeh Guide</p>
              <p className="text-[10px] text-muted-foreground">Step-by-step prayer guide</p>
            </div>
          </Link>
        </div>
      )}

      {tab === 'dhikr' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground">{totalCount} of {totalTarget} total</p>
          </div>
          <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
            <motion.div className="h-full bg-gradient-to-r from-primary to-accent rounded-full" animate={{ width: `${Math.min(100, (totalCount / totalTarget) * 100)}%` }} />
          </div>
          {todayLog.dhikr.map(d => {
            const percent = Math.min(100, (d.count / d.target) * 100);
            const isComplete = d.count >= d.target;
            return (
              <div key={d.id} className={`glass-card p-3.5 ${isComplete ? 'border-accent/30' : ''}`}>
                <div className="flex items-center justify-between mb-1.5">
                  <div>
                    <p className="text-xs font-semibold">{d.name}</p>
                    {d.nameAr && <p className="text-base font-arabic text-muted-foreground">{d.nameAr}</p>}
                  </div>
                  <div className="text-right">
                    <motion.p className={`text-xl font-bold tabular-nums ${isComplete ? 'text-accent' : 'gold-text'}`} animate={animatingId === d.id ? { scale: [1, 1.15, 1] } : {}} transition={{ duration: 0.15 }}>
                      {d.count}
                    </motion.p>
                    <p className="text-[9px] text-muted-foreground">/ {d.target}</p>
                  </div>
                </div>
                <div className="h-1 bg-secondary rounded-full overflow-hidden mb-2.5">
                  <div className={`h-full rounded-full transition-all ${isComplete ? 'bg-accent' : 'bg-primary'}`} style={{ width: `${percent}%` }} />
                </div>
                <div className="flex items-center justify-center gap-2.5">
                  <button onClick={() => updateDhikr(d.id, -1)} className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center">
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => handleIncrement(d.id)} className="w-14 h-14 rounded-full bg-primary text-primary-foreground flex items-center justify-center active:scale-95 shadow-lg transition-transform">
                    <Plus className="w-5 h-5" />
                  </button>
                  <button onClick={() => updateDhikr(d.id, -d.count)} className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center">
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {tab === 'dua' && (
        <div className="space-y-3">
          {/* AI Du'a Suggestion */}
          <div className="glass-card p-3 space-y-2.5 border-primary/20">
            <button
              onClick={() => setShowAi(!showAi)}
              className="w-full flex items-center gap-2 text-left"
            >
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-primary" />
              </div>
              <div className="flex-1">
                <p className="text-xs font-semibold">AI Du'a Assistant</p>
                <p className="text-[10px] text-muted-foreground">Get personalized du'a suggestions</p>
              </div>
            </button>

            {showAi && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                className="space-y-2.5 pt-1"
              >
                <div className="flex gap-2">
                  <input
                    value={aiIntent}
                    onChange={e => setAiIntent(e.target.value)}
                    placeholder="What do you want to make du'a for? e.g. guidance, healing, family..."
                    className="flex-1 bg-secondary/50 rounded-lg px-3 py-2.5 text-xs outline-none placeholder:text-muted-foreground/50 focus:ring-1 focus:ring-primary/30"
                    onKeyDown={e => e.key === 'Enter' && handleAiSuggest()}
                  />
                  <button
                    onClick={handleAiSuggest}
                    disabled={aiLoading || !aiIntent.trim()}
                    className="px-3 bg-primary text-primary-foreground rounded-lg flex items-center justify-center disabled:opacity-50"
                  >
                    {aiLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  </button>
                </div>

                {aiResponse && (
                  <div className="bg-secondary/30 rounded-lg p-3 space-y-2">
                    <div className="prose prose-sm max-w-none text-xs text-foreground [&_p]:my-1 [&_h1]:text-sm [&_h2]:text-xs [&_h3]:text-xs [&_strong]:text-primary">
                      <ReactMarkdown>{aiResponse}</ReactMarkdown>
                    </div>
                    <button
                      onClick={handleSaveAiDua}
                      className="w-full py-2 bg-accent/10 text-accent rounded-lg text-xs font-medium hover:bg-accent/20 transition-colors"
                    >
                      💾 Save to My Du'a List
                    </button>
                  </div>
                )}
              </motion.div>
            )}
          </div>

          {/* Manual Du'a Input */}
          <div className="glass-card p-3 flex gap-2">
            <input
              value={newDua}
              onChange={e => setNewDua(e.target.value)}
              placeholder="Write your du'a..."
              className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground/50"
              onKeyDown={e => {
                if (e.key === 'Enter' && newDua.trim()) {
                  addDua(newDua.trim());
                  setNewDua('');
                }
              }}
            />
            <button
              onClick={() => { if (newDua.trim()) { addDua(newDua.trim()); setNewDua(''); } }}
              className="px-3 py-1.5 bg-primary text-primary-foreground rounded-lg text-xs font-medium"
            >Add</button>
          </div>

          {state.duas.length === 0 && (
            <div className="text-center py-8 text-xs text-muted-foreground">
              <Heart className="w-6 h-6 mx-auto mb-2 text-muted-foreground/30" />
              <p>Your personal du'a list is empty.</p>
              <p>Add your hopes and prayers above.</p>
            </div>
          )}

          {state.duas.map(d => (
            <div key={d.id} className={`glass-card p-3.5 transition-all ${d.answered ? 'border-accent/30 opacity-70' : ''}`}>
              <div className="flex items-start gap-2.5">
                <button onClick={() => toggleDuaAnswered(d.id)} className="mt-0.5 flex-shrink-0">
                  {d.answered ? <Heart className="w-4 h-4 text-accent fill-accent" /> : <Heart className="w-4 h-4 text-muted-foreground" />}
                </button>
                <div className="flex-1 min-w-0">
                  <p className={`text-xs ${d.answered ? 'line-through text-muted-foreground' : ''}`}>{d.text}</p>
                  <p className="text-[9px] text-muted-foreground mt-0.5">{new Date(d.createdAt).toLocaleDateString()}</p>
                </div>
                <button onClick={() => removeDua(d.id)} className="text-muted-foreground/50 hover:text-destructive">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
