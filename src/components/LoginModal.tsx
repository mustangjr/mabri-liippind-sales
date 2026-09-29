import React, { useState } from 'react';
import { X, Lock, ShieldCheck, UserCheck, AlertCircle, ArrowRight } from 'lucide-react';
import { User } from '../types';
import { useTheme } from '../context/ThemeContext';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: User) => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
}) => {
  const { isDarkGlass } = useTheme();
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin123');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleLogin = async (u: string, p: string) => {
    setError(null);
    try {
      setSubmitting(true);
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: u, password: p }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Authentication failed');
      }

      onLoginSuccess(data.user);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleLogin(username, password);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className={`rounded-2xl max-w-sm w-full overflow-hidden transition-all duration-200 ${
        isDarkGlass
          ? 'glass-panel bg-slate-900/90 border border-white/20 text-white shadow-[0_25px_60px_rgba(0,0,0,0.7)]'
          : 'bg-white rounded-2xl shadow-2xl border border-slate-200'
      }`}>
        {/* Header */}
        <div className={`p-5 flex items-center justify-between border-b ${
          isDarkGlass ? 'bg-slate-950/70 border-white/10 text-white' : 'bg-slate-900 text-white border-slate-800'
        }`}>
          <div className="flex items-center space-x-3">
            <div className="bg-white/95 p-1 rounded-lg border border-slate-200">
              <img src="/mabri-logo.svg" alt="Mabri Logo" className="h-6 w-auto object-contain" />
            </div>
            <div>
              <h2 className="text-lg font-bold font-heading">Mabri Staff Sign In</h2>
              <p className="text-xs text-slate-400">Select role or enter your credentials</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className={`p-1 rounded-lg transition cursor-pointer ${
              isDarkGlass ? 'text-slate-400 hover:text-white hover:bg-white/[0.08]' : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-rose-500/15 border border-rose-500/30 rounded-lg flex items-start space-x-2 text-xs text-rose-300">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Quick 1-Click Role Login Shortcuts */}
          <div className="space-y-1.5">
            <span className={`text-[11px] font-bold uppercase tracking-wider block ${
              isDarkGlass ? 'text-slate-400' : 'text-slate-500'
            }`}>
              Quick Role Sign-In:
            </span>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  setUsername('admin');
                  setPassword('admin123');
                  handleLogin('admin', 'admin123');
                }}
                className={`p-3 rounded-xl text-left transition cursor-pointer flex flex-col justify-between border ${
                  isDarkGlass
                    ? 'glass-card border-amber-500/40 hover:border-amber-500 hover:bg-amber-500/10'
                    : 'bg-amber-50 hover:bg-amber-100/80 border-amber-200'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <ShieldCheck className="w-4 h-4 text-amber-400" />
                  <span className={`text-[10px] font-bold uppercase px-1 py-0.2 rounded ${
                    isDarkGlass ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'bg-amber-200/60 text-amber-900'
                  }`}>
                    Admin
                  </span>
                </div>
                <div className={`text-xs font-bold ${isDarkGlass ? 'text-white' : 'text-slate-900'}`}>Administrator</div>
                <div className={`text-[10px] ${isDarkGlass ? 'text-slate-400' : 'text-slate-500'}`}>Full control & edits</div>
              </button>

              <button
                type="button"
                onClick={() => {
                  setUsername('staff');
                  setPassword('staff123');
                  handleLogin('staff', 'staff123');
                }}
                className={`p-3 rounded-xl text-left transition cursor-pointer flex flex-col justify-between border ${
                  isDarkGlass
                    ? 'glass-card border-blue-500/40 hover:border-blue-500 hover:bg-blue-500/10'
                    : 'bg-blue-50 hover:bg-blue-100/80 border-blue-200'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <UserCheck className="w-4 h-4 text-blue-400" />
                  <span className={`text-[10px] font-bold uppercase px-1 py-0.2 rounded ${
                    isDarkGlass ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30' : 'bg-blue-200/60 text-blue-900'
                  }`}>
                    Staff
                  </span>
                </div>
                <div className={`text-xs font-bold ${isDarkGlass ? 'text-white' : 'text-slate-900'}`}>Store Staff</div>
                <div className={`text-[10px] ${isDarkGlass ? 'text-slate-400' : 'text-slate-500'}`}>Sales & daily logs</div>
              </button>
            </div>
          </div>

          <div className="relative flex py-1 items-center">
            <div className={`flex-grow border-t ${isDarkGlass ? 'border-white/10' : 'border-slate-200'}`}></div>
            <span className={`flex-shrink mx-2 text-[10px] font-bold uppercase ${
              isDarkGlass ? 'text-slate-500' : 'text-slate-400'
            }`}>or manual login</span>
            <div className={`flex-grow border-t ${isDarkGlass ? 'border-white/10' : 'border-slate-200'}`}></div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className={`text-xs font-bold uppercase ${isDarkGlass ? 'text-slate-300' : 'text-slate-700'}`}>Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className={`w-full p-2.5 rounded-lg text-sm focus:outline-none ${
                  isDarkGlass ? 'glass-input' : 'border border-slate-300 bg-white text-slate-900'
                }`}
                required
              />
            </div>

            <div>
              <label className={`text-xs font-bold uppercase ${isDarkGlass ? 'text-slate-300' : 'text-slate-700'}`}>Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`w-full p-2.5 rounded-lg text-sm focus:outline-none ${
                  isDarkGlass ? 'glass-input' : 'border border-slate-300 bg-white text-slate-900'
                }`}
                required
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className={`w-full py-2.5 font-bold rounded-lg text-sm transition active:scale-95 cursor-pointer disabled:opacity-60 flex items-center justify-center space-x-1.5 ${
                isDarkGlass
                  ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-[0_0_20px_rgba(245,158,11,0.4)]'
                  : 'bg-slate-900 hover:bg-slate-800 text-white'
              }`}
            >
              <span>{submitting ? 'Authenticating...' : 'Sign In'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
