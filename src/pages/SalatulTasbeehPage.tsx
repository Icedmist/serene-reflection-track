import { Link } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import { motion } from 'framer-motion';

const STEPS = [
  { step: 1, title: 'Make Intention (Niyyah)', desc: 'Intend to pray 4 raka\'at of Salatul Tasbeeh.' },
  { step: 2, title: 'After Thana (Sanaa)', desc: 'Recite the Tasbeeh 15 times:\n"SubhanAllah, walhamdulillah, wa la ilaha illallah, wallahu Akbar"' },
  { step: 3, title: 'After Qira\'ah (Recitation)', desc: 'Recite the Tasbeeh 10 times after Surah Al-Fatihah and another Surah.' },
  { step: 4, title: 'In Ruku\' (Bowing)', desc: 'After the regular dhikr of ruku\', recite the Tasbeeh 10 times.' },
  { step: 5, title: 'Standing from Ruku\'', desc: 'After standing from ruku\' and saying "Sami\'Allahu liman hamidah, Rabbana lakal hamd", recite the Tasbeeh 10 times.' },
  { step: 6, title: 'In First Sujood', desc: 'After the regular dhikr of sujood, recite the Tasbeeh 10 times.' },
  { step: 7, title: 'Sitting Between Sujood', desc: 'While sitting between the two sujood, recite the Tasbeeh 10 times.' },
  { step: 8, title: 'In Second Sujood', desc: 'After the regular dhikr of sujood, recite the Tasbeeh 10 times.' },
  { step: 9, title: 'Repeat', desc: 'Repeat steps 2–8 for each of the remaining 3 raka\'at. Total: 75 per rak\'ah × 4 = 300 Tasbeeh.' },
];

export default function SalatulTasbeehPage() {
  return (
    <div className="px-4 pt-6 space-y-4 pb-8">
      <div className="flex items-center gap-3">
        <Link to="/" className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
          <ChevronLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-lg font-bold gold-text">🙏 Salatul Tasbeeh</h1>
          <p className="text-[10px] text-muted-foreground">Step-by-step guide</p>
        </div>
      </div>

      <div className="glass-card p-3 text-xs text-muted-foreground">
        <p>A special prayer consisting of 4 raka'at with 300 Tasbeeh (glorifications). It is recommended to pray it at least once in a lifetime, or daily if possible.</p>
      </div>

      <div className="space-y-2">
        {STEPS.map((s, i) => (
          <motion.div
            key={s.step}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04 }}
            className="glass-card p-3.5"
          >
            <div className="flex gap-3">
              <div className="w-7 h-7 rounded-full bg-primary/15 flex items-center justify-center flex-shrink-0">
                <span className="text-xs font-bold text-primary">{s.step}</span>
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold">{s.title}</p>
                <p className="text-xs text-muted-foreground mt-0.5 whitespace-pre-line">{s.desc}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="glass-card p-3 text-center">
        <p className="text-lg font-arabic text-muted-foreground">سبحان الله والحمد لله ولا إله إلا الله والله أكبر</p>
        <p className="text-[10px] text-muted-foreground mt-1">SubhanAllah, walhamdulillah, wa la ilaha illallah, wallahu Akbar</p>
      </div>
    </div>
  );
}
