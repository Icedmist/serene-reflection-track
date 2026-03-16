import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Sparkles, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';

interface Motivation {
  quote: string;
  quote_ar: string;
  source: string;
  reflection: string;
}

const MOTIVATION_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/daily-motivation`;

export default function DailyMotivation() {
  const [motivation, setMotivation] = useState<Motivation | null>(null);
  const [loading, setLoading] = useState(true);
  const dateKey = new Date().toISOString().split('T')[0];

  useEffect(() => {
    fetchMotivation();
  }, []);

  async function fetchMotivation() {
    setLoading(true);
    // Check cache first
    const { data: cached } = await supabase
      .from('daily_motivations')
      .select('content, content_ar')
      .eq('date_key', dateKey)
      .maybeSingle();

    if (cached?.content) {
      try {
        setMotivation(JSON.parse(cached.content));
        setLoading(false);
        return;
      } catch {}
    }

    // Fetch from AI
    try {
      const resp = await fetch(MOTIVATION_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ date_key: dateKey }),
      });

      if (resp.ok) {
        const data = await resp.json();
        setMotivation(data);
        // Cache it
        await supabase.from('daily_motivations').upsert({
          date_key: dateKey,
          content: JSON.stringify(data),
          content_ar: data.quote_ar || '',
        }, { onConflict: 'date_key' });
      } else {
        // Fallback
        setMotivation({
          quote: "Indeed, with hardship comes ease.",
          quote_ar: "فَإِنَّ مَعَ الْعُسْرِ يُسْرًا",
          source: "Ash-Sharh 94:5-6",
          reflection: "Every challenge you face today is paired with relief from Allah. Trust in His plan and keep striving.",
        });
      }
    } catch {
      setMotivation({
        quote: "And whoever puts their trust in Allah, He will be enough for them.",
        quote_ar: "وَمَن يَتَوَكَّلْ عَلَى اللَّهِ فَهُوَ حَسْبُهُ",
        source: "At-Talaq 65:3",
        reflection: "Place your trust in Allah today. He is sufficient for you in every matter.",
      });
    }
    setLoading(false);
  }

  if (loading) {
    return (
      <div className="glass-card p-4 flex items-center justify-center gap-2">
        <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        <span className="text-[10px] text-muted-foreground">Loading daily inspiration...</span>
      </div>
    );
  }

  if (!motivation) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card p-4 space-y-2.5 border-primary/20"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-primary" />
          <span className="text-[10px] font-semibold text-primary uppercase tracking-wider">Daily Inspiration</span>
        </div>
        <button onClick={fetchMotivation} className="p-1 text-muted-foreground hover:text-foreground">
          <RefreshCw className="w-3 h-3" />
        </button>
      </div>

      {/* Arabic quote */}
      <p className="font-arabic text-base text-center leading-loose text-primary/90">
        {motivation.quote_ar}
      </p>

      {/* English translation */}
      <p className="text-xs text-center text-foreground italic">
        "{motivation.quote}"
      </p>

      {/* Source */}
      <p className="text-[10px] text-center text-primary font-medium">
        — {motivation.source}
      </p>

      {/* Reflection */}
      <p className="text-[10px] text-muted-foreground leading-relaxed text-center">
        {motivation.reflection}
      </p>
    </motion.div>
  );
}
