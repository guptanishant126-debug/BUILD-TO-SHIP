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
  Zap
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
    <div className={`rounded-2xl p-4 sm:p-5 border transition-all duration-500 shadow-xl ${
      emergencyMode
        ? isSevere
          ? 'bg-rose-950/70 border-rose-500 ring-2 ring-rose-500/50'
          : 'bg-slate-900 border-cyan-500/50'
        : isSevere
          ? 'bg-rose-950/40 border-rose-700/60'
          : 'bg-slate-900/80 border-slate-800'
    }`}>
      
      {/* Alert Banner */}
      <div className="flex items-start space-x-3 mb-4">
        <div className={`p-2.5 rounded-xl ${
          isSevere
            ? 'bg-rose-500 text-slate-950 animate-pulse'
            : 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
        }`}>
          {isSevere ? <AlertTriangle className="w-6 h-6 font-bold" /> : <ShieldCheck className="w-6 h-6" />}
        </div>
        
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <span className={`text-xs font-mono font-bold tracking-widest uppercase ${
              isSevere ? 'text-rose-400' : 'text-cyan-400'
            }`}>
              {isSevere ? t.scam_detected : t.hud_armed}
            </span>
            <span className="text-[11px] font-mono text-slate-400">
              Risk: <strong className={isSevere ? 'text-rose-400' : 'text-emerald-400'}>{riskScore}%</strong>
            </span>
          </div>

          {/* Primary heads up warning */}
          <h3 className={`font-bold mt-1 leading-snug ${
            emergencyMode ? 'text-lg sm:text-xl text-white' : 'text-base sm:text-lg text-slate-100'
          }`}>
            {warningText || (isSevere ? 'High Threat Detected: Voice Cloning & Coercion Suspicion' : 'Guardian Monitoring Active')}
          </h3>

          {/* Localized translation if user language != en */}
          {warningLocalized && warningLocalized !== warningText && (
            <p className={`mt-1.5 font-medium ${
              emergencyMode ? 'text-sm sm:text-base text-amber-300' : 'text-xs sm:text-sm text-cyan-300'
            }`}>
              {warningLocalized}
            </p>
          )}
        </div>
      </div>

      {/* Autonomous Action Buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-3 border-t border-slate-800/80">
        
        {/* Button 1: Ask Challenge Question */}
        <button
          onClick={onTriggerChallenge}
          disabled={isTerminated}
          className={`flex items-center justify-center space-x-2 px-3 py-2.5 rounded-xl font-semibold text-xs border transition-all ${
            emergencyMode ? 'py-3 text-sm' : ''
          } bg-cyan-500/15 border-cyan-500/40 text-cyan-300 hover:bg-cyan-500/25 hover:border-cyan-400 disabled:opacity-50`}
        >
          <HelpCircle className="w-4 h-4 text-cyan-400" />
          <span>{t.trigger_challenge_btn}</span>
        </button>

        {/* Button 2: Alert Guardian */}
        <button
          onClick={onAlertGuardian}
          disabled={guardianAlertSent || isTerminated}
          className={`flex items-center justify-center space-x-2 px-3 py-2.5 rounded-xl font-semibold text-xs border transition-all ${
            emergencyMode ? 'py-3 text-sm' : ''
          } ${
            guardianAlertSent
              ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300'
              : 'bg-amber-500/15 border-amber-500/40 text-amber-300 hover:bg-amber-500/25 hover:border-amber-400'
          } disabled:opacity-60`}
        >
          {guardianAlertSent ? (
            <>
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Guardian Alert Dispatched</span>
            </>
          ) : (
            <>
              <BellRing className="w-4 h-4 text-amber-400" />
              <span>{t.alert_guardian_btn}</span>
            </>
          )}
        </button>

        {/* Button 3: Autonomous / Instant Kill-Switch */}
        <button
          onClick={onTerminateCall}
          disabled={isTerminated}
          className={`flex items-center justify-center space-x-2 px-3 py-2.5 rounded-xl font-bold text-xs shadow-lg transition-all ${
            emergencyMode ? 'py-3 text-sm font-extrabold' : ''
          } bg-gradient-to-r from-rose-600 via-rose-500 to-red-600 text-white hover:from-rose-500 hover:to-red-500 shadow-rose-600/30 active:scale-98 disabled:opacity-50`}
        >
          <PhoneOff className="w-4 h-4" />
          <span>{isTerminated ? 'Call Neutralized' : t.kill_switch_btn}</span>
        </button>

      </div>

    </div>
  );
};

export default AutonomousActionHUD;

