import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShieldAlert, Lock, Mail, ArrowRight, Sparkles, CheckCircle2 } from 'lucide-react';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [largeText, setLargeText] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Login failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  const fillDemoAccount = (demoEmail) => {
    setEmail(demoEmail);
    setPassword('AegisPass123!');
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 radar-grid">
      <div className={`w-full max-w-md bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl transition-all ${
        largeText ? 'text-lg' : 'text-sm'
      }`}>
        
        {/* Top Accessibility & Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <div className="w-9 h-9 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center border border-cyan-500/30">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <span className="font-extrabold text-white text-lg">AegisVoice</span>
          </div>

          <button
            type="button"
            onClick={() => setLargeText(!largeText)}
            className="text-xs px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 border border-slate-700 hover:text-cyan-300"
          >
            {largeText ? 'Normal Font' : 'Large Text Mode'}
          </button>
        </div>

        <h2 className="text-2xl font-bold text-white tracking-tight">Sign In to Guardian</h2>
        <p className="text-slate-400 text-xs mt-1 mb-6">
          Access your Zero-Trust Voice Biometrics & Call Defense Command Center.
        </p>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-500/15 border border-rose-500/40 text-rose-300 text-xs">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full bg-slate-950/80 border border-slate-700/80 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Security Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full bg-slate-950/80 border border-slate-700/80 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl font-bold text-sm bg-cyan-500 hover:bg-cyan-400 text-slate-950 transition-colors shadow-lg shadow-cyan-500/20 flex items-center justify-center space-x-2 disabled:opacity-50"
          >
            <span>{loading ? 'Authenticating...' : 'Sign In'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Demo Fast-Login Pill Triggers */}
        <div className="mt-6 pt-5 border-t border-slate-800">
          <span className="text-[11px] font-mono uppercase text-slate-500 tracking-wider block mb-2">
            Instant Demo Logins:
          </span>
          <div className="grid grid-cols-1 gap-2">
            <button
              type="button"
              onClick={() => fillDemoAccount('eleanor.vance@example.com')}
              className="text-left px-3 py-2 rounded-xl bg-slate-950/60 border border-slate-800 hover:border-cyan-500/50 text-xs text-slate-300 transition-colors flex items-center justify-between"
            >
              <div>
                <strong className="text-cyan-300">Eleanor Vance</strong>
                <span className="text-slate-500 block text-[10px]">Protected Individual (Elderly demographic)</span>
              </div>
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            </button>

            <button
              type="button"
              onClick={() => fillDemoAccount('marcus.vance@example.com')}
              className="text-left px-3 py-2 rounded-xl bg-slate-950/60 border border-slate-800 hover:border-amber-500/50 text-xs text-slate-300 transition-colors flex items-center justify-between"
            >
              <div>
                <strong className="text-amber-300">Marcus Vance</strong>
                <span className="text-slate-500 block text-[10px]">Designated Family Guardian</span>
              </div>
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            </button>

            <button
              type="button"
              onClick={() => fillDemoAccount('analyst@sentinelbank.com')}
              className="text-left px-3 py-2 rounded-xl bg-slate-950/60 border border-slate-800 hover:border-violet-500/50 text-xs text-slate-300 transition-colors flex items-center justify-between"
            >
              <div>
                <strong className="text-violet-300">Dana Sterling</strong>
                <span className="text-slate-500 block text-[10px]">Enterprise B2B SOC Fraud Analyst</span>
              </div>
              <Sparkles className="w-3.5 h-3.5 text-violet-400" />
            </button>
          </div>
        </div>

        <p className="mt-6 text-center text-xs text-slate-400">
          Don't have a protected profile yet?{' '}
          <Link to="/register" className="text-cyan-400 hover:underline font-semibold">
            Create an account
          </Link>
        </p>

      </div>
    </div>
  );
};

export default LoginPage;

