import { useState, type FC, type FormEvent } from 'react';
import { useAuthStore } from '../../store/useAuthStore';
import { Shield, Lock, Mail, X, CheckCircle2, LogOut, KeyRound, UserCheck } from 'lucide-react';

interface AuthModalProps {
  onClose: () => void;
}

export const AuthModal: FC<AuthModalProps> = ({ onClose }) => {
  const user = useAuthStore((s) => s.user);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const login = useAuthStore((s) => s.login);
  const register = useAuthStore((s) => s.register);
  const logout = useAuthStore((s) => s.logout);

  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !password.trim()) {
      setError('Please provide both identification email and access key.');
      return;
    }

    if (password.length < 6) {
      setError('Access key must be at least 6 characters.');
      return;
    }

    setIsLoading(true);
    try {
      if (mode === 'login') {
        await login(email, password);
      } else {
        await register(email, password);
      }
      onClose();
    } catch {
      setError('Authentication failed. Check credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickLogin = async (demoEmail: string) => {
    setIsLoading(true);
    await login(demoEmail, 'SecurePass123!');
    setIsLoading(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl animate-in fade-in duration-200 select-none">
      <div className="relative w-full max-w-md bg-slate-950/95 border border-cyan-500/40 rounded-2xl p-6 shadow-[0_0_50px_rgba(0,0,0,0.95)]">
        {/* Tactical Corner Brackets */}
        <div className="absolute top-3 left-3 w-4 h-4 border-t-2 border-l-2 border-cyan-400" />
        <div className="absolute top-3 right-3 w-4 h-4 border-t-2 border-r-2 border-cyan-400" />
        <div className="absolute bottom-3 left-3 w-4 h-4 border-b-2 border-l-2 border-cyan-400" />
        <div className="absolute bottom-3 right-3 w-4 h-4 border-b-2 border-r-2 border-cyan-400" />

        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3.5 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cyan-950 border border-cyan-500/40">
              <Shield className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <h2 className="text-sm font-mono font-bold tracking-widest text-slate-100 uppercase">
                {isAuthenticated ? 'OPERATIVE PROFILE' : 'ACCESS GATEWAY'}
              </h2>
              <span className="text-[10px] font-mono text-cyan-400/80">
                JWT ENCRYPTED RBAC CONTROL
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-900 border border-transparent hover:border-slate-800 transition-all cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* If Authenticated: Display Profile Screen */}
        {isAuthenticated && user ? (
          <div className="mt-5 space-y-4 font-mono">
            <div className="p-4 rounded-xl bg-slate-900/60 border border-cyan-500/30 flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500 to-indigo-600 flex items-center justify-center text-slate-950 font-bold text-lg">
                {user.email.slice(0, 2).toUpperCase()}
              </div>
              <div className="flex-1 truncate">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-100 truncate">{user.email}</span>
                  <span
                    className={`text-[9px] px-2 py-0.5 rounded font-bold uppercase ${
                      user.role === 'ADMIN'
                        ? 'bg-rose-950 text-rose-300 border border-rose-800'
                        : 'bg-cyan-950 text-cyan-300 border border-cyan-800'
                    }`}
                  >
                    {user.role}
                  </span>
                </div>
                <div className="text-[10px] text-slate-500 mt-1">ID: {user.id}</div>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900/40 border border-slate-800 text-xs text-slate-300 space-y-1.5">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-slate-500">CLEARANCE:</span>
                <span className="text-cyan-300 font-bold">LEVEL-5 HIGH TELEMETRY</span>
              </div>
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-slate-500">SESSION AUTH:</span>
                <span className="text-emerald-400 font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> ACTIVE JWT
                </span>
              </div>
            </div>

            <button
              onClick={() => {
                logout();
                onClose();
              }}
              className="w-full py-2.5 rounded-xl bg-rose-950/40 hover:bg-rose-900/60 border border-rose-700/60 text-rose-300 text-xs font-mono font-bold flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span>TERMINATE SESSION</span>
            </button>
          </div>
        ) : (
          /* Not Authenticated: Login / Register Form */
          <div className="mt-5">
            {/* Mode Switcher */}
            <div className="flex p-1 rounded-xl bg-slate-900 border border-slate-800 mb-4 font-mono text-xs">
              <button
                type="button"
                onClick={() => setMode('login')}
                className={`flex-1 py-1.5 rounded-lg transition-all cursor-pointer font-bold ${
                  mode === 'login'
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                SIGN IN
              </button>
              <button
                type="button"
                onClick={() => setMode('register')}
                className={`flex-1 py-1.5 rounded-lg transition-all cursor-pointer font-bold ${
                  mode === 'register'
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                REGISTER
              </button>
            </div>

            {error && (
              <div className="mb-3 p-2.5 rounded-xl bg-rose-950/60 border border-rose-800 text-rose-300 text-xs font-mono">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3 font-mono">
              <div>
                <label className="text-[10px] uppercase text-slate-400 tracking-wider block mb-1">
                  Operative Email ID
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    placeholder="agent@worldpulse.dev"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-cyan-400 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] uppercase text-slate-400 tracking-wider block mb-1">
                  Access Key (Password)
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    placeholder="••••••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-cyan-400 transition-all"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full mt-2 py-2.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-400 text-cyan-200 text-xs font-bold tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer shadow-[0_0_15px_rgba(56,189,248,0.25)]"
              >
                <KeyRound className="w-4 h-4 text-cyan-300" />
                <span>{isLoading ? 'AUTHENTICATING...' : mode === 'login' ? 'AUTHORIZE ACCESS' : 'ENROLL AGENT'}</span>
              </button>
            </form>

            {/* Quick Demo Credentials */}
            <div className="mt-4 pt-3.5 border-t border-slate-800/80 font-mono">
              <span className="text-[9px] uppercase tracking-widest text-slate-500 block mb-2">
                1-CLICK DEMO CLEARANCE (TEST MODE)
              </span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => handleQuickLogin('admin@worldpulse.dev')}
                  className="flex-1 py-1.5 px-2.5 rounded-lg bg-slate-900 hover:bg-cyan-950/60 border border-slate-800 hover:border-cyan-600/60 text-[10px] text-cyan-300 transition-all cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <UserCheck className="w-3 h-3 text-cyan-400" />
                  <span>Admin Clearance</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickLogin('analyst@worldpulse.dev')}
                  className="flex-1 py-1.5 px-2.5 rounded-lg bg-slate-900 hover:bg-cyan-950/60 border border-slate-800 hover:border-cyan-600/60 text-[10px] text-slate-300 hover:text-cyan-300 transition-all cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <UserCheck className="w-3 h-3 text-slate-400" />
                  <span>Analyst Operative</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
