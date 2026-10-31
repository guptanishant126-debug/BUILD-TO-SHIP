import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck, Lock, Mail, User, Phone, ArrowRight, Globe } from 'lucide-react';

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    full_name: '',
    phone_number: '',
    role: 'PROTECTED_USER',
    preferred_language: 'en',
    guardian_contact_phone: '',
    guardian_contact_email: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [largeText, setLargeText] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register(formData);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 radar-grid my-6">
      <div className={`w-full max-w-lg bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl transition-all ${
        largeText ? 'text-lg' : 'text-sm'
      }`}>
        
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <div className="w-9 h-9 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center border border-cyan-500/30">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <span className="font-extrabold text-white text-lg">AegisVoice AI</span>
          </div>

          <button
            type="button"
            onClick={() => setLargeText(!largeText)}
            className="text-xs px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 border border-slate-700 hover:text-cyan-300"
          >
            {largeText ? 'Normal Font' : 'Large Text'}
          </button>
        </div>

        <h2 className="text-2xl font-bold text-white tracking-tight">Create Guardian Profile</h2>
        <p className="text-slate-400 text-xs mt-1 mb-6">
          Set up Zero-Trust voice cloning defense for yourself or an elderly family member.
        </p>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-500/15 border border-rose-500/40 text-rose-300 text-xs">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Role Selection */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Select Your Role
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {[
                { id: 'PROTECTED_USER', label: 'Protected User', desc: 'Receives calls' },
                { id: 'FAMILY_GUARDIAN', label: 'Family Guardian', desc: 'Monitors loved one' },
                { id: 'ENTERPRISE_ANALYST', label: 'SOC Analyst', desc: 'Bank fraud center' }
              ].map((r) => (
                <button
                  type="button"
                  key={r.id}
                  onClick={() => setFormData({ ...formData, role: r.id })}
                  className={`p-2.5 rounded-xl border text-left transition-all ${
                    formData.role === r.id
                      ? 'bg-cyan-500/20 border-cyan-500 text-cyan-300 font-bold'
                      : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <span className="block text-xs">{r.label}</span>
                  <span className="block text-[10px] text-slate-500 font-normal">{r.desc}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Full Name
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  required
                  name="full_name"
                  value={formData.full_name}
                  onChange={handleChange}
                  placeholder="Eleanor Vance"
                  className="w-full bg-slate-950/80 border border-slate-700/80 rounded-xl pl-10 pr-3 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Preferred Advisory Language
              </label>
              <div className="relative">
                <Globe className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                <select
                  name="preferred_language"
                  value={formData.preferred_language}
                  onChange={handleChange}
                  className="w-full bg-slate-950/80 border border-slate-700/80 rounded-xl pl-10 pr-3 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                >
                  <option value="en">English (US/UK)</option>
                  <option value="es">Español (Spanish)</option>
                  <option value="hi">हिन्दी (Hindi)</option>
                  <option value="zh">中文 (Mandarin)</option>
                  <option value="tl">Tagalog (Filipino)</option>
                </select>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                <input
                  type="email"
                  required
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="name@example.com"
                  className="w-full bg-slate-950/80 border border-slate-700/80 rounded-xl pl-10 pr-3 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Security Password (min 8)
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                <input
                  type="password"
                  required
                  minLength={8}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••••••"
                  className="w-full bg-slate-950/80 border border-slate-700/80 rounded-xl pl-10 pr-3 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>
          </div>

          {/* Emergency Guardian Pairing */}
          <div className="p-3.5 rounded-2xl bg-slate-950/50 border border-slate-800 space-y-3">
            <span className="text-[11px] font-mono font-bold uppercase text-amber-400 tracking-wider block">
              Emergency Guardian Pairing
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Guardian Phone (SMS Alerts)</label>
                <input
                  type="text"
                  name="guardian_contact_phone"
                  value={formData.guardian_contact_phone}
                  onChange={handleChange}
                  placeholder="+1 (555) 987-6543"
                  className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Guardian Email</label>
                <input
                  type="email"
                  name="guardian_contact_email"
                  value={formData.guardian_contact_email}
                  onChange={handleChange}
                  placeholder="guardian@example.com"
                  className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl font-bold text-sm bg-cyan-500 hover:bg-cyan-400 text-slate-950 transition-colors shadow-lg shadow-cyan-500/20 flex items-center justify-center space-x-2 disabled:opacity-50 mt-4"
          >
            <span>{loading ? 'Creating Biometric Vault...' : 'Activate AegisVoice Protection'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <p className="mt-5 text-center text-xs text-slate-400">
          Already registered?{' '}
          <Link to="/login" className="text-cyan-400 hover:underline font-semibold">
            Sign in
          </Link>
        </p>

      </div>
    </div>
  );
};

export default RegisterPage;

