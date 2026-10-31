import React from 'react';
import { useAuth } from '../context/AuthContext';
import { getLocalizedUIText } from '../utils/formatters';
import {
  HelpCircle,
  X,
  CheckCircle,
  PhoneOff,
  ShieldCheck,
  AlertOctagon,
  Sparkles
} from 'lucide-react';

const ChallengeModal = ({
  isOpen,
  onClose,
  challenge,
  onCallerPassed,
  onCallerFailed
}) => {
  const { user, emergencyMode } = useAuth();
  const lang = user?.preferred_language || 'en';
  const t = getLocalizedUIText(lang);

  if (!isOpen || !challenge) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className={`w-full max-w-lg rounded-2xl border shadow-2xl p-6 transition-all ${
        emergencyMode 
          ? 'bg-slate-900 border-cyan-400 text-white' 
          : 'bg-slate-900/95 border-slate-700/80 text-slate-100'
      }`}>
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center space-x-2">
            <div className="p-2 rounded-lg bg-cyan-500/20 text-cyan-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">Dynamic AI Verification Challenge</h3>
              <p className="text-xs text-slate-400 font-mono">Zero-Knowledge Shared Secret Verification</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Challenge Prompt Box */}
        <div className="my-5 space-y-3">
          <p className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider">
            {t.ask_caller}
          </p>

          <div className="p-4 rounded-xl bg-cyan-950/30 border border-cyan-500/40 text-cyan-100 font-medium text-base sm:text-lg leading-relaxed shadow-inner">
            "{challenge.spoken_challenge_prompt}"
          </div>

          {/* Localized prompt if applicable */}
          {challenge.localized_challenge_prompt && challenge.localized_challenge_prompt !== challenge.spoken_challenge_prompt && (
            <div className="p-3 rounded-lg bg-slate-800/60 border border-slate-700 text-amber-200 text-sm font-medium">
              "{challenge.localized_challenge_prompt}"
            </div>
          )}

          {/* Expected Reference / Secret Hint */}
          {challenge.expected_secret_reference && (
            <div className="flex items-center space-x-2 text-xs text-slate-400 px-1">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Expected Secret Answer: <strong className="text-emerald-300">{challenge.expected_secret_reference}</strong></span>
            </div>
          )}

          {/* Guidance */}
          <div className="p-3 rounded-xl bg-rose-950/20 border border-rose-900/40 text-rose-300 text-xs flex items-start space-x-2">
            <AlertOctagon className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <span>{challenge.guidance_for_user || 'If they hesitate, guess incorrectly, or make an excuse, immediately hang up.'}</span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-800">
          
          <button
            onClick={onCallerPassed}
            className="flex items-center justify-center space-x-2 py-3 px-4 rounded-xl font-bold text-xs bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/30 transition-colors"
          >
            <CheckCircle className="w-4 h-4" />
            <span>Caller Answered Correctly</span>
          </button>

          <button
            onClick={onCallerFailed}
            className="flex items-center justify-center space-x-2 py-3 px-4 rounded-xl font-bold text-xs bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-600/30 transition-colors"
          >
            <PhoneOff className="w-4 h-4" />
            <span>Caller Failed (Kill Call)</span>
          </button>

        </div>

      </div>
    </div>
  );
};

export default ChallengeModal;

