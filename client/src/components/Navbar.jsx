import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  ShieldAlert,
  ShieldCheck,
  Radio,
  Users,
  FileText,
  Sliders,
  Building2,
  LogOut,
  Globe,
  BellRing,
  Volume2
} from 'lucide-react';

const Navbar = () => {
  const { user, isAuthenticated, logout, setLanguage, emergencyMode, toggleEmergencyMode } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const currentLang = user?.preferred_language || 'en';

  const navLinks = [
    { to: '/dashboard', label: 'Dashboard', icon: ShieldCheck },
    { to: '/guardian/call-monitor', label: 'Call Guardian HUD', icon: Radio, highlight: true },
    { to: '/contacts/enclave', label: 'Voice Enclave', icon: Users },
    { to: '/incidents', label: 'Forensic Audit', icon: FileText },
    { to: '/enterprise/telemetry', label: 'Enterprise SOC', icon: Building2 },
    { to: '/settings', label: 'Settings', icon: Sliders }
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-40 bg-[#070b14]/90 backdrop-blur-md border-b border-slate-800/80 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand Logo */}
        <Link to="/" className="flex items-center space-x-3 group">
          <div className="relative">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 via-cyan-500 to-emerald-400 flex items-center justify-center shadow-lg shadow-cyan-500/20 group-hover:scale-105 transition-transform">
              <ShieldAlert className="w-5 h-5 text-slate-950 font-bold" />
            </div>
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full border-2 border-[#070b14] animate-pulse" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center space-x-1.5">
              <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-white via-slate-100 to-cyan-300 bg-clip-text text-transparent">
                AegisVoice
              </span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                AI Guardian
              </span>
            </div>
            <span className="text-[11px] text-slate-400 font-mono tracking-tight -mt-0.5">
              Zero-Trust Voice Biometrics
            </span>
          </div>
        </Link>

        {/* Navigation Links */}
        {isAuthenticated && (
          <nav className="hidden lg:flex items-center space-x-1">
            {navLinks.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname.startsWith(item.to);
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
                  } ${item.highlight ? 'relative font-semibold text-cyan-300' : ''}`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                  {item.highlight && (
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
                  )}
                </Link>
              );
            })}
          </nav>
        )}

        {/* Right Action Bar */}
        <div className="flex items-center space-x-3">
          
          {/* Emergency Mode Switch (Elderly accessibility) */}
          <button
            onClick={toggleEmergencyMode}
            title="Toggle High-Contrast Elderly Emergency Protection Mode"
            className={`flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
              emergencyMode
                ? 'bg-rose-500/20 border-rose-500/60 text-rose-300 shadow-sm shadow-rose-500/30 ring-1 ring-rose-500/50'
                : 'bg-slate-800/60 border-slate-700 text-slate-400 hover:text-slate-200'
            }`}
          >
            <BellRing className={`w-3.5 h-3.5 ${emergencyMode ? 'text-rose-400 animate-bounce' : ''}`} />
            <span className="hidden sm:inline">Emergency Mode</span>
            <span className={`text-[10px] px-1 rounded ${emergencyMode ? 'bg-rose-500 text-white font-bold' : 'bg-slate-700 text-slate-300'}`}>
              {emergencyMode ? 'ON' : 'OFF'}
            </span>
          </button>

          {/* Language Selector */}
          <div className="relative flex items-center bg-slate-800/60 border border-slate-700/80 rounded-lg px-2 py-1 text-xs text-slate-300">
            <Globe className="w-3.5 h-3.5 mr-1.5 text-cyan-400" />
            <select
              value={currentLang}
              onChange={(e) => setLanguage(e.target.value)}
              className="bg-transparent text-xs font-medium focus:outline-none cursor-pointer text-slate-200"
            >
              <option value="en" className="bg-slate-900 text-slate-200">English (EN)</option>
              <option value="es" className="bg-slate-900 text-slate-200">Español (ES)</option>
              <option value="hi" className="bg-slate-900 text-slate-200">हिन्दी (HI)</option>
              <option value="zh" className="bg-slate-900 text-slate-200">中文 (ZH)</option>
              <option value="tl" className="bg-slate-900 text-slate-200">Tagalog (TL)</option>
            </select>
          </div>

          {/* User profile / Auth buttons */}
          {isAuthenticated ? (
            <div className="flex items-center space-x-2 pl-2 border-l border-slate-800">
              <div className="hidden md:flex flex-col text-right">
                <span className="text-xs font-semibold text-slate-200">{user?.full_name}</span>
                <span className="text-[10px] text-cyan-400/90 font-mono tracking-tight">
                  {user?.role === 'PROTECTED_USER' ? 'Protected User' : user?.role === 'FAMILY_GUARDIAN' ? 'Family Guardian' : 'SOC Analyst'}
                </span>
              </div>
              <button
                onClick={handleLogout}
                title="Sign out of AegisVoice"
                className="p-1.5 rounded-lg bg-slate-800/80 text-slate-400 hover:text-rose-400 hover:bg-slate-700/60 transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <Link
                to="/login"
                className="px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white transition-colors"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-cyan-500 hover:bg-cyan-400 text-slate-950 transition-colors shadow-sm shadow-cyan-500/30"
              >
                Get Protected
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;

