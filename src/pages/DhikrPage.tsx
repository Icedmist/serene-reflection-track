import { useStore } from '@/lib/store';
import { motion } from 'framer-motion';
import { Plus, Minus, RotateCcw, Heart, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';

export default function DhikrPage() {
  const { todayLog, updateDhikr, state, addDua, toggleDuaAnswered, removeDua } = useStore();
  const [animatingId, setAnimatingId] = useState<string | null>(null);
  const [tab, setTab] = useState<'adhkar' | 'dhikr' | 'dua'>('adhkar');
  const [newDua, setNewDua] = useState('');

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

  return (
    <div className="px-4 pt-6 space-y-4">
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
