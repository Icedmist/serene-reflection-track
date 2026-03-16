import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/auth-context';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, BookOpen, Star } from 'lucide-react';

interface AdhkarItem {
  id: string;
  title: string;
  title_ar: string | null;
  full_text: string | null;
  full_text_ar: string | null;
  category: string;
  source: string | null;
  target_count: number;
  sort_order: number;
}

export default function AdhkarBrowser() {
  const [items, setItems] = useState<AdhkarItem[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'morning' | 'evening' | 'general'>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAdhkar();
  }, []);

  async function loadAdhkar() {
    const { data } = await supabase
      .from('adhkar_collection')
      .select('*')
      .order('sort_order', { ascending: true });
    if (data) setItems(data as AdhkarItem[]);
    setLoading(false);
  }

  const filtered = items.filter(
    i => filter === 'all' || i.category === filter || i.category === 'both'
  );

  return (
    <div className="space-y-3">
      {/* Filter pills */}
      <div className="flex gap-1.5 overflow-x-auto hide-scrollbar">
        {(['all', 'morning', 'evening', 'general'] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-full text-[10px] font-medium whitespace-nowrap transition-all ${
              filter === f
                ? 'bg-primary text-primary-foreground'
                : 'bg-secondary text-muted-foreground'
            }`}
          >
            {f === 'all' ? '📖 All' : f === 'morning' ? '🌅 Morning' : f === 'evening' ? '🌇 Evening' : '🤲 General'}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-8">
          <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((item) => {
            const isExpanded = expandedId === item.id;
            return (
              <motion.div
                key={item.id}
                layout
                className="glass-card overflow-hidden"
              >
                <button
                  onClick={() => setExpandedId(isExpanded ? null : item.id)}
                  className="w-full p-3.5 flex items-center gap-3 text-left"
                >
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <BookOpen className="w-4 h-4 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold truncate">{item.title}</p>
                    {item.title_ar && (
                      <p className="text-sm font-arabic text-muted-foreground truncate">{item.title_ar}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    {item.source && (
                      <span className="text-[9px] text-muted-foreground bg-secondary px-1.5 py-0.5 rounded-full hidden sm:inline">
                        {item.source}
                      </span>
                    )}
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
                      <div className="px-3.5 pb-3.5 space-y-3 border-t border-border/50 pt-3">
                        {/* Arabic text */}
                        {item.full_text_ar && (
                          <div className="bg-primary/5 rounded-lg p-3">
                            <p className="font-arabic text-base leading-loose text-right text-foreground">
                              {item.full_text_ar}
                            </p>
                          </div>
                        )}

                        {/* English translation */}
                        {item.full_text && (
                          <p className="text-xs text-muted-foreground leading-relaxed">
                            {item.full_text}
                          </p>
                        )}

                        {/* Source & count */}
                        <div className="flex items-center justify-between">
                          {item.source && (
                            <span className="text-[10px] text-primary font-medium flex items-center gap-1">
                              <Star className="w-3 h-3" /> {item.source}
                            </span>
                          )}
                          {item.target_count > 1 && (
                            <span className="text-[10px] text-muted-foreground">
                              Repeat {item.target_count}×
                            </span>
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
    </div>
  );
}
