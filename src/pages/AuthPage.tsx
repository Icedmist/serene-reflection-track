import { useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { Moon, Mail, Lock, User, Eye, EyeOff } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

export default function AuthPage() {
  const { signIn, signUp, enterGuestMode } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [signupSuccess, setSignupSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (isLogin) {
      const { error } = await signIn(email, password);
      if (error) setError(error.message);
    } else {
      if (!name.trim()) { setError('Please enter your name'); setLoading(false); return; }
      const { error } = await signUp(email, password, name);
      if (error) {
        setError(error.message);
      } else {
        setSignupSuccess(true);
        toast.success('Account created! Check your email to verify.');
      }
    }
    setLoading(false);
  };

  if (signupSuccess) {
    return (
      <div className="min-h-screen bg-background pattern-overlay flex flex-col items-center justify-center px-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-sm space-y-6 text-center">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-accent/10 flex items-center justify-center">
            <Mail className="w-8 h-8 text-accent" />
          </div>
          <h1 className="text-xl font-bold gold-text">Check Your Email</h1>
          <p className="text-sm text-muted-foreground">We've sent a verification link to <strong>{email}</strong>. Click the link to activate your account.</p>
          <button
            onClick={() => { setSignupSuccess(false); setIsLogin(true); }}
            className="w-full py-3 bg-primary text-primary-foreground rounded-xl font-semibold text-sm"
          >
            Back to Sign In
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pattern-overlay flex flex-col items-center justify-center px-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm space-y-8"
      >
        {/* Logo */}
        <div className="text-center space-y-2">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-primary/10 flex items-center justify-center">
            <Moon className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-2xl font-bold gold-text gold-glow">IbadahTrack</h1>
          <p className="text-sm text-muted-foreground">Your worship companion</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Your name"
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-card border border-border rounded-xl text-sm focus:ring-2 focus:ring-primary/30 outline-none"
              />
            </div>
          )}
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="email"
              placeholder="Email address"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              className="w-full pl-10 pr-4 py-3 bg-card border border-border rounded-xl text-sm focus:ring-2 focus:ring-primary/30 outline-none"
            />
          </div>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="Password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              minLength={6}
              className="w-full pl-10 pr-10 py-3 bg-card border border-border rounded-xl text-sm focus:ring-2 focus:ring-primary/30 outline-none"
            />
            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          {error && <p className="text-xs text-destructive text-center">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-primary text-primary-foreground rounded-xl font-semibold text-sm hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {loading ? 'Please wait...' : isLogin ? 'Sign In' : 'Create Account'}
          </button>
        </form>

        <div className="text-center space-y-3">
          <button
            onClick={() => { setIsLogin(!isLogin); setError(''); }}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            {isLogin ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
          </button>

          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-border" />
            <span className="text-xs text-muted-foreground">or</span>
            <div className="flex-1 h-px bg-border" />
          </div>

          <button
            onClick={enterGuestMode}
            className="w-full py-3 bg-secondary text-secondary-foreground rounded-xl font-medium text-sm hover:opacity-90 transition-opacity"
          >
            Continue as Guest (Demo)
          </button>
        </div>

        <p className="text-[10px] text-center text-muted-foreground">
          بسم الله الرحمن الرحيم
        </p>
      </motion.div>
    </div>
  );
}
