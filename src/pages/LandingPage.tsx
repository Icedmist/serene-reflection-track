import { useRef, Suspense, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Stars, Float, MeshDistortMaterial } from '@react-three/drei';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Moon, BookOpen, Flame, Calendar, Share2, Bell,
  ChevronDown, Sparkles, Heart, Star, ArrowRight,
  Users, Shield, Smartphone
} from 'lucide-react';
import * as THREE from 'three';

/* ─── 3D Scene Components ─── */
function GlowingSphere() {
  const meshRef = useRef<THREE.Mesh>(null);
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.15;
      meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.1) * 0.1;
    }
  });
  return (
    <Float speed={1.5} rotationIntensity={0.3} floatIntensity={0.8}>
      <mesh ref={meshRef}>
        <sphereGeometry args={[1.8, 64, 64]} />
        <MeshDistortMaterial
          color="#d4a843"
          emissive="#b8942f"
          emissiveIntensity={0.4}
          roughness={0.3}
          metalness={0.8}
          distort={0.25}
          speed={1.5}
        />
      </mesh>
    </Float>
  );
}

function CrescentMoon3D() {
  const groupRef = useRef<THREE.Group>(null);
  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.3) * 0.05;
      groupRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.1;
    }
  });
  return (
    <Float speed={2} rotationIntensity={0.2} floatIntensity={0.5}>
      <group ref={groupRef}>
        <mesh position={[0, 0, 0]}>
          <torusGeometry args={[1.2, 0.35, 32, 64, Math.PI * 1.4]} />
          <meshStandardMaterial color="#d4a843" emissive="#b8942f" emissiveIntensity={0.6} metalness={0.9} roughness={0.2} />
        </mesh>
        <mesh position={[0.6, 0.8, 0]} scale={0.15}>
          <octahedronGeometry args={[1, 0]} />
          <meshStandardMaterial color="#d4a843" emissive="#ffd700" emissiveIntensity={1} />
        </mesh>
      </group>
    </Float>
  );
}

function Scene3D() {
  return (
    <Canvas camera={{ position: [0, 0, 5], fov: 50 }} className="!absolute inset-0">
      <ambientLight intensity={0.3} />
      <pointLight position={[5, 5, 5]} intensity={1} color="#d4a843" />
      <pointLight position={[-5, -3, 3]} intensity={0.5} color="#4a9e7e" />
      <Suspense fallback={null}>
        <CrescentMoon3D />
        <Stars radius={50} depth={50} count={1500} factor={3} saturation={0.2} fade speed={0.5} />
      </Suspense>
    </Canvas>
  );
}

function SmallScene() {
  return (
    <Canvas camera={{ position: [0, 0, 4], fov: 45 }} className="!absolute inset-0">
      <ambientLight intensity={0.4} />
      <pointLight position={[3, 3, 3]} intensity={0.8} color="#d4a843" />
      <Suspense fallback={null}>
        <GlowingSphere />
      </Suspense>
    </Canvas>
  );
}

/* ─── SVG Components ─── */
function IslamicPattern({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="hsl(45, 72%, 52%)" stopOpacity="0.3" />
          <stop offset="100%" stopColor="hsl(45, 72%, 52%)" stopOpacity="0.05" />
        </linearGradient>
      </defs>
      {/* Geometric star pattern */}
      <polygon points="100,10 120,75 190,75 135,115 155,180 100,140 45,180 65,115 10,75 80,75" fill="url(#goldGrad)" />
      <polygon points="100,30 115,75 170,75 125,105 140,160 100,130 60,160 75,105 30,75 85,75" fill="none" stroke="hsl(45, 72%, 52%)" strokeWidth="0.5" strokeOpacity="0.2" />
      <circle cx="100" cy="100" r="60" fill="none" stroke="hsl(45, 72%, 52%)" strokeWidth="0.3" strokeOpacity="0.15" />
      <circle cx="100" cy="100" r="80" fill="none" stroke="hsl(45, 72%, 52%)" strokeWidth="0.3" strokeOpacity="0.1" />
    </svg>
  );
}

function MosqueMinaret({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 120 160" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="minaretGrad" x1="50%" y1="0%" x2="50%" y2="100%">
          <stop offset="0%" stopColor="hsl(45, 72%, 52%)" stopOpacity="0.4" />
          <stop offset="100%" stopColor="hsl(45, 72%, 52%)" stopOpacity="0.05" />
        </linearGradient>
      </defs>
      {/* Dome */}
      <path d="M30 80 Q60 20 90 80" fill="url(#minaretGrad)" />
      {/* Body */}
      <rect x="35" y="80" width="50" height="70" fill="url(#minaretGrad)" rx="2" />
      {/* Windows */}
      <path d="M50 95 Q60 85 70 95 L70 110 L50 110 Z" fill="hsl(45, 72%, 52%)" fillOpacity="0.15" />
      <path d="M50 120 Q60 112 70 120 L70 135 L50 135 Z" fill="hsl(45, 72%, 52%)" fillOpacity="0.1" />
      {/* Crescent on top */}
      <circle cx="60" cy="25" r="6" fill="none" stroke="hsl(45, 72%, 52%)" strokeWidth="1.5" strokeOpacity="0.5" />
      <circle cx="63" cy="24" r="5" fill="hsl(225, 20%, 7%)" />
    </svg>
  );
}

/* ─── Feature Data ─── */
const features = [
  { icon: BookOpen, title: 'Quran Tracker', desc: 'Track your recitation by surah, juz, page, or ayah with session persistence.', arabic: 'تلاوة القرآن' },
  { icon: Sparkles, title: 'Guided Adhkar', desc: 'Step-by-step morning & evening remembrance with progress tracking.', arabic: 'أذكار الصباح والمساء' },
  { icon: Flame, title: 'Streak System', desc: 'Build consistency with daily streaks, XP rewards, and milestone badges.', arabic: 'المداومة' },
  { icon: Calendar, title: 'Worship Calendar', desc: 'Visual monthly view with day-by-day completion and night markers.', arabic: 'التقويم' },
  { icon: Share2, title: 'Share Progress', desc: 'Generate beautiful share cards as Sadaqah Jariyah to inspire others.', arabic: 'صدقة جارية' },
  { icon: Bell, title: 'Smart Reminders', desc: 'Gentle reminders for Fajr, Tahajjud, Quran, and Dhikr sessions.', arabic: 'التذكير' },
];

const highlights = [
  { icon: Shield, label: 'Privacy First', desc: 'Your worship data stays yours. Share only what you choose.' },
  { icon: Smartphone, label: 'Mobile Native', desc: 'Designed for one-handed use during worship and reflection.' },
  { icon: Users, label: 'Community', desc: 'Inspire the Ummah by sharing your journey of consistency.' },
];

/* ─── Main Landing Page ─── */
export default function LandingPage() {
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: containerRef });
  const heroOpacity = useTransform(scrollYProgress, [0, 0.15], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 0.15], [1, 0.95]);

  return (
    <div ref={containerRef} className="min-h-screen bg-background text-foreground overflow-x-hidden">
      {/* ═══ Hero Section ═══ */}
      <motion.section
        style={{ opacity: heroOpacity, scale: heroScale }}
        className="relative min-h-screen flex flex-col items-center justify-center px-6 overflow-hidden"
      >
        {/* 3D Background */}
        <div className="absolute inset-0 z-0">
          <Scene3D />
        </div>

        {/* Decorative SVGs */}
        <IslamicPattern className="absolute top-10 left-4 w-24 opacity-30 animate-pulse-gold" />
        <IslamicPattern className="absolute bottom-20 right-4 w-32 opacity-20 rotate-45" />
        <MosqueMinaret className="absolute bottom-0 left-8 w-16 opacity-15" />
        <MosqueMinaret className="absolute bottom-0 right-12 w-12 opacity-10 scale-x-[-1]" />

        {/* Content */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="relative z-10 text-center space-y-6 max-w-lg"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, delay: 0.5 }}
            className="w-20 h-20 mx-auto rounded-3xl bg-primary/15 backdrop-blur-md border border-primary/20 flex items-center justify-center"
          >
            <Moon className="w-10 h-10 text-primary" />
          </motion.div>

          <div className="space-y-3">
            <p className="text-lg font-arabic text-primary/80">بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ</p>
            <h1 className="text-4xl md:text-5xl font-bold gold-text gold-glow tracking-tight">
              IbadahTrack
            </h1>
            <p className="text-base text-muted-foreground max-w-xs mx-auto leading-relaxed">
              Your spiritual companion for Ramadan, I'tikaf, and daily worship
            </p>
          </div>

          <p className="font-arabic text-xl text-primary/60">
            ﴿ وَمَا خَلَقْتُ الْجِنَّ وَالْإِنسَ إِلَّا لِيَعْبُدُونِ ﴾
          </p>
          <p className="text-xs text-muted-foreground -mt-3">Adh-Dhariyat 51:56</p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/auth')}
              className="px-8 py-3.5 bg-primary text-primary-foreground rounded-2xl font-semibold text-sm shadow-lg shadow-primary/25 flex items-center gap-2 justify-center"
            >
              Get Started <ArrowRight className="w-4 h-4" />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/auth?guest=true')}
              className="px-8 py-3.5 bg-card/60 backdrop-blur-sm border border-border/50 text-foreground rounded-2xl font-medium text-sm"
            >
              Try as Guest
            </motion.button>
          </div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="absolute bottom-8 z-10"
        >
          <ChevronDown className="w-6 h-6 text-muted-foreground/50" />
        </motion.div>
      </motion.section>

      {/* ═══ Features Grid ═══ */}
      <section className="relative py-20 px-6">
        <IslamicPattern className="absolute top-0 right-0 w-40 opacity-10" />
        <div className="max-w-lg mx-auto space-y-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center space-y-3"
          >
            <p className="text-sm font-semibold text-primary uppercase tracking-widest">Features</p>
            <h2 className="text-2xl md:text-3xl font-bold">Everything for your worship journey</h2>
            <p className="font-arabic text-primary/50 text-lg">عبادتك في مكان واحد</p>
          </motion.div>

          <div className="grid grid-cols-1 gap-4">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, x: i % 2 === 0 ? -20 : 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                whileHover={{ scale: 1.02 }}
                className="group relative bg-card/40 backdrop-blur-md border border-border/30 rounded-2xl p-5 flex gap-4 items-start hover:border-primary/30 transition-all duration-300"
              >
                <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors">
                  <f.icon className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-sm">{f.title}</h3>
                    <span className="font-arabic text-xs text-primary/40">{f.arabic}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{f.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ 3D Interactive Section ═══ */}
      <section className="relative py-20 px-6 overflow-hidden">
        <div className="max-w-lg mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center space-y-3 mb-8"
          >
            <p className="text-sm font-semibold text-accent uppercase tracking-widest">Experience</p>
            <h2 className="text-2xl md:text-3xl font-bold">Built for spiritual focus</h2>
          </motion.div>

          <div className="relative h-64 rounded-3xl overflow-hidden border border-border/20">
            <SmallScene />
            <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent z-10" />
            <div className="absolute bottom-6 left-6 right-6 z-20">
              <p className="font-arabic text-xl text-primary gold-glow text-center">
                ﴿ أَلَا بِذِكْرِ اللَّهِ تَطْمَئِنُّ الْقُلُوبُ ﴾
              </p>
              <p className="text-xs text-muted-foreground text-center mt-2">Ar-Ra'd 13:28</p>
            </div>
          </div>

          {/* Highlights */}
          <div className="grid grid-cols-3 gap-3 mt-6">
            {highlights.map((h, i) => (
              <motion.div
                key={h.label}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-card/30 backdrop-blur-sm border border-border/20 rounded-xl p-3 text-center space-y-2"
              >
                <h.icon className="w-5 h-5 text-primary mx-auto" />
                <p className="text-xs font-semibold">{h.label}</p>
                <p className="text-[10px] text-muted-foreground leading-relaxed">{h.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ App Mockup ═══ */}
      <section className="relative py-20 px-6">
        <div className="max-w-lg mx-auto space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center space-y-3"
          >
            <p className="text-sm font-semibold text-primary uppercase tracking-widest">Preview</p>
            <h2 className="text-2xl font-bold">Calm. Focused. Beautiful.</h2>
          </motion.div>

          {/* Mock phone frame */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="mx-auto w-64 relative"
          >
            <div className="rounded-[2rem] border-4 border-border/40 bg-card/60 backdrop-blur-md overflow-hidden shadow-2xl shadow-primary/5">
              {/* Status bar */}
              <div className="h-6 bg-card/80 flex items-center justify-center">
                <div className="w-16 h-1.5 bg-border/50 rounded-full" />
              </div>
              {/* Mock dashboard content */}
              <div className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[10px] text-muted-foreground">Ramadan Day 15</p>
                    <p className="text-sm font-bold gold-text">Assalamu Alaykum</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <Flame className="w-3 h-3 text-primary" />
                    <span className="text-xs font-bold">12</span>
                  </div>
                </div>
                {/* Progress bar */}
                <div className="bg-secondary/50 rounded-full h-2">
                  <div className="bg-primary rounded-full h-2 w-3/5" />
                </div>
                <p className="text-[9px] text-muted-foreground">60% of today's worship completed</p>
                {/* Mock cards */}
                {['🌅 Fajr Prayer', '📖 Quran – Surah Al-Kahf', '📿 Morning Adhkar'].map(item => (
                  <div key={item} className="bg-secondary/30 rounded-lg p-2 flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full border border-primary/40" />
                    <span className="text-[10px]">{item}</span>
                  </div>
                ))}
                <div className="bg-primary/10 rounded-lg p-2 text-center">
                  <p className="font-arabic text-xs text-primary">سُبْحَانَ اللَّهِ</p>
                  <p className="text-[9px] text-muted-foreground mt-0.5">33/33</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ═══ About Section ═══ */}
      <section className="relative py-20 px-6">
        <IslamicPattern className="absolute bottom-0 left-0 w-36 opacity-10 rotate-180" />
        <div className="max-w-lg mx-auto space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center space-y-3"
          >
            <p className="text-sm font-semibold text-accent uppercase tracking-widest">About</p>
            <h2 className="text-2xl font-bold">Built with ❤️ for the Ummah</h2>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-card/40 backdrop-blur-md border border-border/30 rounded-2xl p-6 space-y-4"
          >
            <div className="text-center space-y-3">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-primary/10 flex items-center justify-center">
                <Moon className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-bold gold-text">IbadahTrack</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                IbadahTrack is a worship companion designed to help Muslims maintain consistency
                during Ramadan, I'tikaf, and everyday worship. Track your prayers, Quran recitation,
                dhikr, and build meaningful spiritual habits.
              </p>
              <p className="font-arabic text-primary/60">
                ﴿ وَاعْبُدْ رَبَّكَ حَتَّىٰ يَأْتِيَكَ الْيَقِينُ ﴾
              </p>
              <p className="text-[10px] text-muted-foreground">Al-Hijr 15:99</p>
            </div>
          </motion.div>

          {/* Team */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-center text-muted-foreground uppercase tracking-wider">Team</h3>
            <div className="grid gap-4">
              {/* Developer */}
              <motion.div
                initial={{ opacity: 0, x: -15 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="bg-card/40 backdrop-blur-md border border-border/30 rounded-2xl p-5 flex items-center gap-4"
              >
                <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                  <Star className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="font-bold text-sm">Abdulrasheed Mahmud Bello</p>
                  <p className="text-xs text-primary font-medium">Lead Developer</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">CEO, NEXA Digital Solutions</p>
                </div>
              </motion.div>

              {/* Contributor */}
              <motion.div
                initial={{ opacity: 0, x: 15 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="bg-card/40 backdrop-blur-md border border-border/30 rounded-2xl p-5 flex items-center gap-4"
              >
                <div className="w-14 h-14 rounded-xl bg-accent/10 flex items-center justify-center shrink-0">
                  <Heart className="w-6 h-6 text-accent" />
                </div>
                <div>
                  <p className="font-bold text-sm">Nasir Ibrahim Iman</p>
                  <p className="text-xs text-accent font-medium">Contributor</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">Design & Content Guidance</p>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ CTA Section ═══ */}
      <section className="relative py-20 px-6 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/5 to-transparent" />
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative max-w-lg mx-auto text-center space-y-6"
        >
          <p className="font-arabic text-2xl text-primary gold-glow">
            ﴿ فَاذْكُرُونِي أَذْكُرْكُمْ ﴾
          </p>
          <p className="text-xs text-muted-foreground">Al-Baqarah 2:152 — "So remember Me; I will remember you."</p>
          <h2 className="text-2xl font-bold">Begin your journey today</h2>
          <p className="text-sm text-muted-foreground">
            Join thousands of Muslims tracking their worship with intention and consistency.
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/auth')}
            className="px-10 py-4 bg-primary text-primary-foreground rounded-2xl font-semibold shadow-lg shadow-primary/25 inline-flex items-center gap-2"
          >
            Start Now <ArrowRight className="w-4 h-4" />
          </motion.button>
        </motion.div>
      </section>

      {/* ═══ Footer ═══ */}
      <footer className="py-10 px-6 border-t border-border/20">
        <div className="max-w-lg mx-auto text-center space-y-3">
          <p className="font-arabic text-lg text-muted-foreground/60">بسم الله الرحمن الرحيم</p>
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} IbadahTrack by NEXA Digital Solutions
          </p>
          <p className="text-[10px] text-muted-foreground/50">Version 1.0.0</p>
        </div>
      </footer>
    </div>
  );
}
