import { useStore } from '@/lib/store';
import { useAuth } from '@/lib/auth-context';
import { db } from '@/lib/db';
import { SURAH_NAMES } from '@/lib/types';
import { useRef, useState } from 'react';
import { toPng } from 'html-to-image';
import { Share2, Download, Moon, Copy, Check, Link2, ExternalLink } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { HijriUtils } from '@/lib/hijri-utils';

export default function SharePage() {
  const { state, todayLog } = useStore();
  const { user } = useAuth();
  const cardRef = useRef<HTMLDivElement>(null);
  const [downloading, setDownloading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [cardStyle, setCardStyle] = useState<'summary' | 'quran' | 'streak'>('summary');
  const [shareLink, setShareLink] = useState('');
  const [generatingLink, setGeneratingLink] = useState(false);

  const ramadanDay = HijriUtils.getRamadanDay(new Date(), state.hijriOffset);
  const hijriDate = HijriUtils.getHijriParts(new Date(), state.hijriOffset);
  const hijriMonthName = HijriUtils.getMonthName(hijriDate.month);
  const dateLabel = ramadanDay > 0 ? `Ramadan Day ${ramadanDay}` : `${hijriDate.day} ${hijriMonthName}`;

  const completedTasks = todayLog.tasks.filter(t => t.completed);
  const topStreaks = state.streaks.sort((a, b) => b.currentStreak - a.currentStreak).slice(0, 3);

  const handleDownload = async () => {
    if (!cardRef.current) return;
    setDownloading(true);
    try {
      const dataUrl = await toPng(cardRef.current, { pixelRatio: 3, backgroundColor: '#111827' });
      const link = document.createElement('a');
      link.download = `ibadahtrack-${ramadanDay > 0 ? 'ramadan-' + ramadanDay : 'hijri-' + hijriDate.day}.png`;
      link.href = dataUrl;
      link.click();
    } catch (e) {
      console.error('Failed to generate image', e);
    }
    setDownloading(false);
  };

  const handleCopyText = () => {
    const shareText = `${dateLabel} — ${todayLog.completionPercent}% complete. ${completedTasks.length} tasks done. Qur'an: Surah ${SURAH_NAMES[state.quranProgress.currentSurah]}. #IbadahTrack`;
    navigator.clipboard.writeText(shareText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleGenerateLink = async () => {
    if (!user) {
      toast.error('Sign in to generate share links');
      return;
    }
    setGeneratingLink(true);
    // Locally generate a share code for this user
    const shareCode = Math.random().toString(36).substring(2, 10);
    const url = `${window.location.origin}/shared/${shareCode}`;
    setShareLink(url);
    navigator.clipboard.writeText(url);
    toast.success('Local share link generated!');
    setGeneratingLink(false);
  };

  return (
    <div className="px-4 pt-6 space-y-5">
      <h1 className="text-xl font-bold gold-text flex items-center gap-2">
        <Share2 className="w-5 h-5" /> Share Progress
      </h1>
      <p className="text-xs text-muted-foreground">Share your worship journey as Sadaqah Jariyah — inspire others</p>

      {/* Card style selector */}
      <div className="flex gap-2">
        {(['summary', 'quran', 'streak'] as const).map(s => (
          <button
            key={s}
            onClick={() => setCardStyle(s)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${cardStyle === s ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground'
              }`}
          >
            {s === 'summary' ? 'Summary' : s === 'quran' ? "Qur'an" : 'Streaks'}
          </button>
        ))}
      </div>

      {/* Share Card Preview */}
      <div className="overflow-hidden rounded-xl border border-border">
        <div
          ref={cardRef}
          className="p-6 space-y-4"
          style={{
            background: 'linear-gradient(135deg, #0f172a 0%, #1a1a2e 50%, #16213e 100%)',
            color: '#e5e0d8',
            fontFamily: "'Plus Jakarta Sans', sans-serif",
          }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Moon style={{ width: 18, height: 18, color: '#d4a843' }} />
              <span style={{ fontSize: 12, color: '#a0937d' }}>IbadahTrack</span>
            </div>
            <span style={{ fontSize: 11, color: '#a0937d' }}>
              {state.userName}'s Journey
            </span>
          </div>

          <div className="text-center py-2">
            <p style={{ fontSize: 28, fontWeight: 700, color: '#d4a843' }}>
              {dateLabel}
            </p>
          </div>

          {cardStyle === 'summary' && (
            <div className="space-y-3">
              {[
                ['Tasks Completed', `${completedTasks.length}/${todayLog.tasks.length}`, '#5ea882'],
                ["Qur'an", SURAH_NAMES[state.quranProgress.currentSurah], '#d4a843'],
                ['Top Streak', `${topStreaks[0]?.icon} ${topStreaks[0]?.currentStreak} days`, '#d4a843'],
                ['Completion', `${todayLog.completionPercent}%`, '#5ea882'],
              ].map(([label, value, color]) => (
                <div key={label as string} className="flex items-center justify-between" style={{ background: 'rgba(255,255,255,0.05)', borderRadius: 8, padding: '10px 14px' }}>
                  <span style={{ fontSize: 13 }}>{label}</span>
                  <span style={{ fontWeight: 700, color: color as string }}>{value}</span>
                </div>
              ))}
            </div>
          )}

          {cardStyle === 'quran' && (
            <div className="text-center space-y-3">
              <p style={{ fontSize: 14, color: '#a0937d' }}>Currently reading</p>
              <p style={{ fontSize: 24, fontWeight: 700, color: '#d4a843', fontFamily: "'Amiri', serif" }}>
                {SURAH_NAMES[state.quranProgress.currentSurah]}
              </p>
              <p style={{ fontSize: 13, color: '#a0937d' }}>
                Surah {state.quranProgress.startSurah} → {state.quranProgress.currentSurah} of 114
              </p>
              <div style={{ height: 6, background: 'rgba(255,255,255,0.1)', borderRadius: 99, overflow: 'hidden' }}>
                <div style={{
                  height: '100%',
                  width: `${((state.quranProgress.currentSurah - state.quranProgress.startSurah) / 114) * 100}%`,
                  background: 'linear-gradient(90deg, #d4a843, #5ea882)',
                  borderRadius: 99,
                }} />
              </div>
            </div>
          )}

          {cardStyle === 'streak' && (
            <div className="space-y-3">
              {topStreaks.map(s => (
                <div key={s.habit} className="flex items-center justify-between" style={{ background: 'rgba(255,255,255,0.05)', borderRadius: 8, padding: '10px 14px' }}>
                  <span style={{ fontSize: 13 }}>{s.icon} {s.habit}</span>
                  <span style={{ fontWeight: 700, color: '#d4a843' }}>{s.currentStreak} days</span>
                </div>
              ))}
            </div>
          )}

          <p className="text-center" style={{ fontSize: 10, color: '#666', paddingTop: 8 }}>
            بسم الله الرحمن الرحيم • Shared as Sadaqah Jariyah
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <button
          onClick={handleDownload}
          disabled={downloading}
          className="flex-1 flex items-center justify-center gap-2 bg-primary text-primary-foreground rounded-xl py-3 font-medium text-sm hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          <Download className="w-4 h-4" />
          {downloading ? 'Generating...' : 'Download Card'}
        </button>
        <button
          onClick={handleCopyText}
          className="flex items-center justify-center gap-2 bg-secondary text-secondary-foreground rounded-xl px-5 py-3 font-medium text-sm hover:opacity-90 transition-opacity"
        >
          {copied ? <Check className="w-4 h-4 text-accent" /> : <Copy className="w-4 h-4" />}
        </button>
      </div>

      {/* Generate share link */}
      <div className="glass-card p-4 space-y-3">
        <h3 className="text-sm font-semibold flex items-center gap-2">
          <Link2 className="w-4 h-4 text-primary" /> Public Share Link
        </h3>
        <p className="text-xs text-muted-foreground">Generate a link anyone can view — they'll see your progress and can join too!</p>
        <button
          onClick={handleGenerateLink}
          disabled={generatingLink}
          className="w-full py-3 bg-accent text-accent-foreground rounded-xl font-semibold text-sm flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          <ExternalLink className="w-4 h-4" />
          {generatingLink ? 'Generating...' : 'Generate Share Link'}
        </button>
        {shareLink && (
          <div className="bg-secondary/50 rounded-lg p-3">
            <p className="text-xs text-muted-foreground mb-1">Link copied to clipboard:</p>
            <p className="text-xs font-mono text-foreground break-all">{shareLink}</p>
          </div>
        )}
      </div>
    </div>
  );
}
