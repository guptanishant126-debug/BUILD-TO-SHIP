import React from 'react';
import { useAuth } from '../context/AuthContext';
import { getLocalizedUIText } from '../utils/formatters';
import {
  AlertTriangle,
  HelpCircle,
  BellRing,
  PhoneOff,
  CheckCircle2,
  ShieldCheck,
  Zap,
  Radio
} from 'lucide-react';

const AutonomousActionHUD = ({
  riskScore = 0,
  threatCategory = '',
  warningText = '',
  warningLocalized = '',
  onTriggerChallenge,
  onAlertGuardian,
  onTerminateCall,
  guardianAlertSent = false,
  callStatus = 'ACTIVE'
}) => {
  const { user, emergencyMode } = useAuth();
  const lang = user?.preferred_language || 'en';
  const t = getLocalizedUIText(lang);

  const isSevere = riskScore >= 70;
  const isTerminated = callStatus === 'TERMINATED' || callStatus === 'BLOCKED';

  return (
    <div className={`rounded-3xl p-5 sm:p-6 border transition-all duration-500 shadow-2xl relative overflow-hidden backdrop-blur-xl ${
      emergencyMode
        ? isSevere
          ? 'bg-rose-950/80 border-rose-500 ring-4 ring-rose-500/50'
          : 'bg-[#0b1120] border-cyan-400/80 ring-2 ring-cyan-500/30'
        : isSevere
          ? 'bg-rose-950/40 border-rose-600/70 shadow-rose-900/20'
          : 'bg-[#0b1120]/90 border-slate-800/90'
    }`}>
      
      {/* Top Animated Beacon Bar if High Threat */}
      {isSevere && (
        <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-rose-600 via-red-400 to-rose-600 animate-pulse" />
      )}

      {/* Alert Banner Header */}
      <div className="flex items-start space-x-3.5 mb-4">
        <div className={`p-3 rounded-2xl shrink-0 transition-transform ${
          isSevere
            ? 'bg-rose-500 text-slate-950 animate-bounce shadow-lg shadow-rose-500/50'
            : 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30'
        }`}>
          {isSevere ? <AlertTriangle className="w-6 h-6 stroke-[2.5]" /> : <ShieldCheck className="w-6 h-6" />}
        </div>
        
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <span className={`text-[11px] font-mono font-black tracking-widest uppercase flex items-center space-x-1.5 ${
              isSevere ? 'text-rose-400 animate-pulse' : 'text-cyan-400'
            }`}>
              <Radio className="w-3.5 h-3.5" />
              <span>{isSevere ? t.scam_detected : t.hud_armed}</span>
            </span>
            <span className="text-xs font-mono text-slate-300">
              Live Threat: <strong className={`text-sm ${isSevere ? 'text-rose-400 font-extrabold' : 'text-emerald-400'}`}>{riskScore}%</strong>
            </span>
          </div>

          {/* Primary heads up warning text */}
          <h3 className={`font-extrabold mt-1 leading-snug tracking-tight ${
            emergencyMode ? 'text-xl sm:text-2xl text-white' : 'text-base sm:text-lg text-slate-100'
          }`}>
            {warningText || (isSevere ? 'High Threat Detected: Voice Cloning & Coercion Suspicion' : 'AegisVoice Sentinel Active • Zero Anomaly Detected')}
          </h3>

          {/* Localized translation if user language != en */}
          {warningLocalized && warningLocalized !== warningText && (
            <p className={`mt-1.5 font-semibold ${
              emergencyMode ? 'text-base sm:text-lg text-amber-300' : 'text-xs sm:text-sm text-cyan-300'
            }`}>
              {warningLocalized}
            </p>
          )}
        </div>
      </div>

      {/* Autonomous Action Buttons Deck */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3.5 border-t border-slate-800/80">
        
        {/* Button 1: Ask Challenge Question */}
        <button
          onClick={onTriggerChallenge}
          disabled={isTerminated}
          className={`flex items-center justify-center space-x-2 px-3.5 py-3 rounded-2xl font-bold text-xs border transition-all ${
            emergencyMode ? 'py-4 text-sm font-extrabold' : ''
          } bg-cyan-500/15 border-cyan-500/40 text-cyan-300 hover:bg-cyan-500/25 hover:border-cyan-300 hover:scale-102 active:scale-98 disabled:opacity-40 shadow-sm`}
        >
          <HelpCircle className="w-4 h-4 text-cyan-400" />
          <span>{t.trigger_challenge_btn}</span>
        </button>

        {/* Button 2: Alert Emergency Guardian */}
        <button
          onClick={onAlertGuardian}
          disabled={guardianAlertSent || isTerminated}
          className={`flex items-center justify-center space-x-2 px-3.5 py-3 rounded-2xl font-bold text-xs border transition-all ${
            emergencyMode ? 'py-4 text-sm font-extrabold' : ''
          } ${
            guardianAlertSent
              ? 'bg-emerald-500/20 border-emerald-500/60 text-emerald-300 shadow-md shadow-emerald-500/20'
              : 'bg-amber-500/15 border-amber-500/40 text-amber-300 hover:bg-amber-500/25 hover:border-amber-300 hover:scale-102 active:scale-98'
          } disabled:opacity-60 shadow-sm`}
        >
          {guardianAlertSent ? (
            <>
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Guardian Alert Sent</span>
            </>
          ) : (
            <>
              <BellRing className="w-4 h-4 text-amber-400" />
              <span>{t.alert_guardian_btn}</span>
            </>
          )}
        </button>

        {/* Button 3: Autonomous Call Kill-Switch */}
        <button
          onClick={onTerminateCall}
          disabled={isTerminated}
          className={`flex items-center justify-center space-x-2 px-3.5 py-3 rounded-2xl font-black text-xs shadow-xl transition-all ${
            emergencyMode ? 'py-4 text-sm font-black ring-2 ring-white/50' : ''
          } bg-gradient-to-r from-rose-600 via-rose-500 to-red-600 text-white hover:from-rose-500 hover:to-red-500 hover:scale-102 active:scale-98 shadow-rose-600/30 disabled:opacity-40`}
        >
          <PhoneOff className="w-4 h-4" />
          <span>{isTerminated ? 'Call Neutralized' : t.kill_switch_btn}</span>
        </button>

      </div>

    </div>
  );
};

export default AutonomousActionHUD;
