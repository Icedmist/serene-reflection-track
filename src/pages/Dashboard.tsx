import { useStore } from '@/lib/store';
import { useAuth } from '@/lib/auth-context';
import { SURAH_NAMES, TIME_BLOCK_LABELS, TIME_BLOCK_ORDER } from '@/lib/types';
import { HijriUtils } from '@/lib/hijri-utils';
import { motion, AnimatePresence } from 'framer-motion';
import { Moon, Flame, BookOpen, CheckCircle2, Circle, PenLine, ChevronDown, Trophy, Plus, X, Edit3, Save, Calendar } from 'lucide-react';
import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';

const categoryColors: Record<string, string> = {
  salah: 'bg-primary/20 text-primary',
  quran: 'bg-accent/20 text-accent',
  dhikr: 'bg-primary/15 text-primary',
  dua: 'bg-accent/15 text-accent',
  meal: 'bg-secondary text-secondary-foreground',
  rest: 'bg-secondary text-muted-foreground',
  custom: 'bg-secondary text-secondary-foreground',
};

export default function Dashboard() {
  const { state, todayLog, todayKey, toggleTask, updateReflection, addCustomTask, removeTask, editTask } = useStore();
  const { user, profile } = useAuth();
  const [reflection, setReflection] = useState(todayLog.reflectionNote || '');
  const [expandedBlocks, setExpandedBlocks] = useState<Record<string, boolean>>({ dawn: true, morning: true, afternoon: true, evening: true, night: true });
  const [showAddTask, setShowAddTask] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskCategory, setNewTaskCategory] = useState<'salah' | 'quran' | 'dhikr' | 'dua' | 'custom'>('custom');
  const [newTaskBlock, setNewTaskBlock] = useState<'dawn' | 'morning' | 'afternoon' | 'evening' | 'night'>('morning');
  const [newTaskTime, setNewTaskTime] = useState('');
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');

  const completedCount = todayLog.tasks.filter(t => t.completed).length;
  const totalCount = todayLog.tasks.length;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const topStreak = state.streaks.length > 0
    ? state.streaks.reduce((a, b) => a.currentStreak > b.currentStreak ? a : b, state.streaks[0])
    : { habit: 'None', currentStreak: 0, longestStreak: 0, icon: '🔥' };

  const isItikaf = state.mode.includes('itikaf');
  const modeLabel = state.mode.map(m => m === 'itikaf' ? "I'tikaf" : m === 'ramadan' ? 'Ramadan' : 'General').join(' + ');

  // Get current dates
  const now = new Date();
  const gregorianDate = now.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
  const hijriParts = HijriUtils.getHijriParts(now, state.hijriOffset);
  const hijriDate = `${hijriParts.day} ${HijriUtils.getMonthName(hijriParts.month)} ${hijriParts.year} AH`;

  const displayName = profile?.display_name || state.userName || 'User';

  const groupedTasks = useMemo(() => {
    const groups: Record<string, typeof todayLog.tasks> = {};
    for (const task of todayLog.tasks) {
      const block = task.timeBlock || 'morning';
      if (!groups[block]) groups[block] = [];
      groups[block].push(task);
    }
    return Object.entries(groups).sort(([a], [b]) => (TIME_BLOCK_ORDER[a] || 0) - (TIME_BLOCK_ORDER[b] || 0));
  }, [todayLog.tasks]);

  const nextTask = todayLog.tasks.find(t => !t.completed);

  const toggleBlock = (block: string) => {
    setExpandedBlocks(prev => ({ ...prev, [block]: !prev[block] }));
  };

  const handleAddTask = () => {
    if (!newTaskTitle.trim()) return;
    addCustomTask({
      id: `custom-${Date.now()}`,
      title: newTaskTitle.trim(),
      category: newTaskCategory,
      timeBlock: newTaskBlock,
      timeSlot: newTaskTime || undefined,
    });
    setNewTaskTitle('');
    setNewTaskTime('');
    setShowAddTask(false);
  };

  const handleStartEdit = (taskId: string, title: string) => {
    setEditingTaskId(taskId);
    setEditTitle(title);
  };

  const handleSaveEdit = (taskId: string) => {
    if (editTitle.trim()) {
      editTask(taskId, { title: editTitle.trim() });
    }
    setEditingTaskId(null);
  };

  return (
    <div className="px-4 pt-6 space-y-4 pb-6">
      {/* Header with Dates */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-muted-foreground text-[10px]">السلام عليكم</p>
          <h1 className="text-xl font-bold gold-text gold-glow">{displayName}</h1>
        </div>
        <div className="text-right space-y-0.5">
          <div className="flex items-center gap-1.5 justify-end text-primary">
            <Moon className="w-3.5 h-3.5" />
            <span className="text-[10px] font-semibold">{modeLabel}</span>
          </div>
          <p className="text-[10px] text-muted-foreground">{gregorianDate}</p>
          <p className="text-[10px] font-arabic text-primary/80">{hijriDate}</p>
        </div>
      </div>

      {/* Progress Card */}
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="glass-card p-4 flex items-center gap-4"
      >
        <div className="relative w-16 h-16 flex-shrink-0">
          <svg className="w-16 h-16 -rotate-90" viewBox="0 0 80 80">
            <circle cx="40" cy="40" r="34" fill="none" strokeWidth="5" className="stroke-secondary" />
            <circle
              cx="40" cy="40" r="34" fill="none" strokeWidth="5"
              className="stroke-primary"
              strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 34}`}
              strokeDashoffset={`${2 * Math.PI * 34 * (1 - progressPercent / 100)}`}
              style={{ transition: 'stroke-dashoffset 0.6s ease' }}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-sm font-bold gold-text">{progressPercent}%</span>
          </div>
        </div>
        <div className="flex-1 space-y-1 min-w-0">
          <p className="text-xs font-medium">{completedCount}/{totalCount} tasks completed</p>
          {totalCount - completedCount === 0 ? (
            <p className="text-[10px] text-accent font-medium">ما شاء الله! All done today! ✨</p>
          ) : nextTask ? (
            <div>
              <p className="text-[10px] text-muted-foreground">Next up:</p>
              <p className="text-xs font-medium truncate">{nextTask.title}{nextTask.timeSlot ? ` · ${nextTask.timeSlot}` : ''}</p>
            </div>
          ) : null}
          <div className="flex items-center gap-2 pt-0.5">
            <div className="flex items-center gap-1">
              <Flame className="w-3.5 h-3.5 streak-fire" />
              <span className="text-[10px] font-medium">{topStreak.currentStreak}d</span>
            </div>
            <div className="flex items-center gap-1">
              <Trophy className="w-3 h-3 text-primary" />
              <span className="text-[10px] font-medium gold-text">{state.totalXp} XP</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Quick Stats */}
      <div className="grid grid-cols-4 gap-2">
        <Link to="/quran" className="glass-card p-2.5 text-center hover:border-primary/30 transition-colors">
          <BookOpen className="w-3.5 h-3.5 mx-auto text-accent mb-0.5" />
          <p className="text-[10px] text-muted-foreground">Qur'an</p>
          <p className="text-[10px] font-semibold truncate">{SURAH_NAMES[state.quranProgress.currentSurah]}</p>
        </Link>
        <Link to="/dhikr" className="glass-card p-2.5 text-center hover:border-primary/30 transition-colors">
          <span className="text-sm">📿</span>
          <p className="text-[10px] text-muted-foreground">Dhikr</p>
          <p className="text-xs font-semibold">{todayLog.dhikr.reduce((s, d) => s + d.count, 0)}</p>
        </Link>
        <Link to="/streaks" className="glass-card p-2.5 text-center hover:border-primary/30 transition-colors">
          <Flame className="w-3.5 h-3.5 mx-auto streak-fire mb-0.5" />
          <p className="text-[10px] text-muted-foreground">Streak</p>
          <p className="text-xs font-semibold">{topStreak.currentStreak}d</p>
        </Link>
        <Link to="/calendar" className="glass-card p-2.5 text-center hover:border-primary/30 transition-colors">
          <Calendar className="w-3.5 h-3.5 mx-auto text-primary mb-0.5" />
          <p className="text-[10px] text-muted-foreground">Calendar</p>
          <p className="text-[10px] font-semibold">{hijriParts.day}/{hijriParts.month}</p>
        </Link>
      </div>

      {/* Add Task Button */}
      <div className="flex justify-end">
        <button
          onClick={() => setShowAddTask(!showAddTask)}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 text-primary rounded-lg text-xs font-medium hover:bg-primary/20 transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          Add Task
        </button>
      </div>

      {/* Add Task Form */}
      <AnimatePresence>
        {showAddTask && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="glass-card p-3 space-y-2.5">
              <input
                value={newTaskTitle}
                onChange={e => setNewTaskTitle(e.target.value)}
                placeholder="Task name..."
                className="w-full bg-secondary/50 rounded-lg px-3 py-2 text-xs outline-none focus:ring-1 focus:ring-primary/30"
                onKeyDown={e => e.key === 'Enter' && handleAddTask()}
              />
              <div className="flex gap-2">
                <select
                  value={newTaskCategory}
                  onChange={e => setNewTaskCategory(e.target.value as any)}
                  className="flex-1 bg-secondary/50 rounded-lg px-2 py-1.5 text-[10px] outline-none"
                >
                  <option value="salah">Salah</option>
                  <option value="quran">Qur'an</option>
                  <option value="dhikr">Dhikr</option>
                  <option value="dua">Du'a</option>
                  <option value="custom">Custom</option>
                </select>
                <select
                  value={newTaskBlock}
                  onChange={e => setNewTaskBlock(e.target.value as any)}
                  className="flex-1 bg-secondary/50 rounded-lg px-2 py-1.5 text-[10px] outline-none"
                >
                  <option value="dawn">Dawn</option>
                  <option value="morning">Morning</option>
                  <option value="afternoon">Afternoon</option>
                  <option value="evening">Evening</option>
                  <option value="night">Night</option>
                </select>
                <input
                  value={newTaskTime}
                  onChange={e => setNewTaskTime(e.target.value)}
                  placeholder="Time"
                  className="w-20 bg-secondary/50 rounded-lg px-2 py-1.5 text-[10px] outline-none"
                />
              </div>
              <div className="flex gap-2">
                <button onClick={handleAddTask} className="flex-1 py-2 bg-primary text-primary-foreground rounded-lg text-xs font-medium">
                  Add Task
                </button>
                <button onClick={() => setShowAddTask(false)} className="px-4 py-2 bg-secondary text-secondary-foreground rounded-lg text-xs">
                  Cancel
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Grouped Tasks */}
      <div className="space-y-2">
        {groupedTasks.map(([block, tasks]) => {
          const info = TIME_BLOCK_LABELS[block];
          const blockCompleted = tasks.filter(t => t.completed).length;
          const isExpanded = expandedBlocks[block];

          return (
            <div key={block} className="glass-card overflow-hidden">
              <button
                onClick={() => toggleBlock(block)}
                className="w-full flex items-center justify-between p-3 text-left"
              >
                <div className="flex items-center gap-2">
                  <span className="text-sm">{info?.icon}</span>
                  <div>
                    <p className="text-xs font-semibold">{info?.label}</p>
                    <p className="text-[10px] text-muted-foreground">{info?.timeRange}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-muted-foreground">{blockCompleted}/{tasks.length}</span>
                  <ChevronDown className={`w-3.5 h-3.5 text-muted-foreground transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                </div>
              </button>

              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="px-3 pb-2 space-y-1">
                      {tasks.map(task => (
                        <div key={task.id} className={`flex items-center gap-2 px-2 py-2 rounded-lg transition-all ${task.completed ? 'opacity-50' : ''}`}>
                          <button onClick={() => toggleTask(task.id)} className="flex-shrink-0">
                            {task.completed ? (
                              <CheckCircle2 className="w-4 h-4 text-accent" />
                            ) : (
                              <Circle className="w-4 h-4 text-muted-foreground" />
                            )}
                          </button>
                          <div className="flex-1 min-w-0">
                            {editingTaskId === task.id ? (
                              <div className="flex items-center gap-1">
                                <input
                                  value={editTitle}
                                  onChange={e => setEditTitle(e.target.value)}
                                  className="flex-1 bg-secondary/50 rounded px-2 py-0.5 text-xs outline-none"
                                  onKeyDown={e => e.key === 'Enter' && handleSaveEdit(task.id)}
                                  autoFocus
                                />
                                <button onClick={() => handleSaveEdit(task.id)} className="p-1 text-accent">
                                  <Save className="w-3 h-3" />
                                </button>
                                <button onClick={() => setEditingTaskId(null)} className="p-1 text-muted-foreground">
                                  <X className="w-3 h-3" />
                                </button>
                              </div>
                            ) : (
                              <>
                                <p className={`text-xs font-medium ${task.completed ? 'line-through text-muted-foreground' : ''}`}>
                                  {task.title}
                                </p>
                                {task.timeSlot && (
                                  <p className="text-[10px] text-muted-foreground">{task.timeSlot}</p>
                                )}
                              </>
                            )}
                          </div>
                          {editingTaskId !== task.id && (
                            <div className="flex items-center gap-0.5 flex-shrink-0">
                              {task.streakEnabled && <Flame className="w-3 h-3 text-primary/40" />}
                              <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-medium ${categoryColors[task.category] || ''}`}>
                                {task.category}
                              </span>
                              <button onClick={() => handleStartEdit(task.id, task.title)} className="p-1 text-muted-foreground/50 hover:text-foreground">
                                <Edit3 className="w-2.5 h-2.5" />
                              </button>
                              {task.id.startsWith('custom-') && (
                                <button onClick={() => removeTask(task.id)} className="p-1 text-muted-foreground/50 hover:text-destructive">
                                  <X className="w-2.5 h-2.5" />
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-2 gap-2">
        <Link to="/guided/morning" className="glass-card p-3 flex items-center gap-2 hover:border-primary/30 transition-colors">
          <span className="text-lg">🌅</span>
          <div>
            <p className="text-xs font-semibold">Morning Adhkar</p>
            <p className="text-[10px] text-muted-foreground">Guided session</p>
          </div>
        </Link>
        <Link to="/guided/evening" className="glass-card p-3 flex items-center gap-2 hover:border-primary/30 transition-colors">
          <span className="text-lg">🌇</span>
          <div>
            <p className="text-xs font-semibold">Evening Adhkar</p>
            <p className="text-[10px] text-muted-foreground">Guided session</p>
          </div>
        </Link>
      </div>

      {/* Reflection */}
      {!isItikaf || reflection ? (
        <div className="glass-card p-3 space-y-2">
          <h2 className="text-xs font-semibold flex items-center gap-1.5">
            <PenLine className="w-3.5 h-3.5 text-primary" /> Reflection
          </h2>
          <textarea
            value={reflection}
            onChange={e => {
              setReflection(e.target.value);
              updateReflection(e.target.value);
            }}
            placeholder="What touched your heart today?"
            rows={2}
            className="w-full bg-secondary/50 rounded-lg p-2.5 text-xs resize-none border-none outline-none focus:ring-1 focus:ring-primary/30 placeholder:text-muted-foreground/50"
          />
        </div>
      ) : null}
    </div>
  );
}
