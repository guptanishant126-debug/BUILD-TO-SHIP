import React from 'react';
import { getRiskTier } from '../utils/formatters';
import { AlertTriangle, ShieldCheck, Activity, Zap, Radio } from 'lucide-react';

const RiskGauge = ({
  riskScore = 0,
  syntheticConfidence = 0,
  urgencyScore = 0,
  identityDiscrepancy = 0
}) => {
  const tierInfo = getRiskTier(riskScore);

  // SVG Gauge calculations (Semi-circle arc 180 degrees)
  const radius = 88;
  const strokeWidth = 14;
  const circumference = Math.PI * radius;
  const strokeDashoffset = circumference - (riskScore / 100) * circumference;

  // Needle angle (-90 deg at 0 to +90 deg at 100)
  const needleAngle = -90 + (riskScore / 100) * 180;

  return (
    <div className="flex flex-col items-center bg-[#070b14]/90 border border-slate-800/90 rounded-2xl p-5 shadow-2xl relative overflow-hidden backdrop-blur-md">
      
      {/* Background threat aura beacon */}
      <div 
        className={`absolute -top-16 -right-16 w-48 h-48 rounded-full blur-3xl opacity-25 pointer-events-none transition-colors duration-700 ${
          riskScore >= 85 ? 'bg-rose-500 animate-pulse' : riskScore >= 60 ? 'bg-orange-500' : riskScore >= 30 ? 'bg-amber-500' : 'bg-emerald-500'
        }`} 
      />

      {/* Header Bar */}
      <div className="w-full flex items-center justify-between mb-2">
        <div className="flex items-center space-x-2">
          <div className="p-1 rounded-lg bg-cyan-500/10 text-cyan-400">
            <Activity className="w-4 h-4" />
          </div>
          <span className="text-xs font-bold tracking-wider uppercase text-slate-200">
            Explainable Threat Gauge
          </span>
        </div>
        <div className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border tracking-wide uppercase transition-all duration-300 shadow-sm ${tierInfo.badgeClass}`}>
          {tierInfo.tier}
        </div>
      </div>

      {/* Arc Gauge Graphic */}
      <div className="relative flex items-center justify-center my-2">
        <svg width="240" height="140" viewBox="0 0 240 140" className="overflow-visible">
          <defs>
            <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#10b981" />
              <stop offset="35%" stopColor="#f59e0b" />
              <stop offset="70%" stopColor="#f97316" />
              <stop offset="100%" stopColor="#f43f5e" />
            </linearGradient>
            <filter id="needleGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#ffffff" floodOpacity="0.4" />
            </filter>
          </defs>

          {/* Background Track Arc */}
          <path
            d="M 25 130 A 88 88 0 0 1 215 130"
            fill="none"
            stroke="#1e293b"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
          />

          {/* Active Dynamic Progress Arc */}
          <path
            d="M 25 130 A 88 88 0 0 1 215 130"
            fill="none"
            stroke="url(#gaugeGradient)"
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-700 ease-out"
          />

          {/* Calibrated Tick Marks */}
          {[0, 25, 50, 75, 100].map((tick) => {
            const angle = -Math.PI + (tick / 100) * Math.PI;
            const x1 = 120 + 72 * Math.cos(angle);
            const y1 = 130 + 72 * Math.sin(angle);
            const x2 = 120 + 78 * Math.cos(angle);
            const y2 = 130 + 78 * Math.sin(angle);
            return (
              <line
                key={tick}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke="#64748b"
                strokeWidth="1.5"
              />
            );
          })}

          {/* Needle & Center Pivot */}
          <g transform="translate(120, 130)">
            <line
              x1="0"
              y1="0"
              x2="0"
              y2="-76"
              stroke="#ffffff"
              strokeWidth="3.5"
              strokeLinecap="round"
              filter="url(#needleGlow)"
              transform={`rotate(${needleAngle})`}
              className="transition-transform duration-700 ease-out"
            />
            <circle cx="0" cy="0" r="8" fill="#ffffff" />
            <circle cx="0" cy="0" r="3.5" fill="#0f172a" />
          </g>
        </svg>

        {/* Digital Numeric Score Display */}
        <div className="absolute bottom-1 flex flex-col items-center">
          <span className={`text-4xl font-black font-mono tracking-tight transition-colors duration-500 drop-shadow-sm ${tierInfo.textColor}`}>
            {riskScore}
          </span>
          <span className="text-[10px] text-slate-400 font-mono uppercase tracking-widest -mt-1 font-semibold">
            Threat Index (0-100)
          </span>
        </div>
      </div>

      {/* Granular Breakdown Meters Deck */}
      <div className="w-full mt-3 space-y-2.5 pt-3 border-t border-slate-800/80">
        
        {/* Metric 1: Acoustic Spoof */}
        <div>
          <div className="flex justify-between text-xs mb-1">
            <span className="text-slate-400 flex items-center space-x-1.5 font-medium">
              <Zap className="w-3.5 h-3.5 text-cyan-400" />
              <span>Acoustic Spoof Probability</span>
            </span>
            <span className="font-mono font-bold text-slate-200">{syntheticConfidence}%</span>
          </div>
          <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-800">
            <div 
              className="bg-cyan-500 h-2 rounded-full transition-all duration-500 shadow-sm shadow-cyan-500/50" 
              style={{ width: `${syntheticConfidence}%` }} 
            />
          </div>
        </div>

        {/* Metric 2: Linguistic Urgency & Coercion */}
        <div>
          <div className="flex justify-between text-xs mb-1">
            <span className="text-slate-400 flex items-center space-x-1.5 font-medium">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
              <span>Semantic Urgency & Coercion</span>
            </span>
            <span className="font-mono font-bold text-slate-200">{urgencyScore}%</span>
          </div>
          <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-800">
            <div 
              className="bg-amber-500 h-2 rounded-full transition-all duration-500 shadow-sm shadow-amber-500/50" 
              style={{ width: `${urgencyScore}%` }} 
            />
          </div>
        </div>

        {/* Metric 3: Identity Match Discrepancy */}
        <div>
          <div className="flex justify-between text-xs mb-1">
            <span className="text-slate-400 flex items-center space-x-1.5 font-medium">
              <ShieldCheck className="w-3.5 h-3.5 text-rose-400" />
              <span>Identity Discrepancy Index</span>
            </span>
            <span className="font-mono font-bold text-slate-200">{identityDiscrepancy}%</span>
          </div>
          <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-800">
            <div 
              className="bg-rose-500 h-2 rounded-full transition-all duration-500 shadow-sm shadow-rose-500/50" 
              style={{ width: `${identityDiscrepancy}%` }} 
            />
          </div>
        </div>

      </div>

    </div>
  );
};

export default RiskGauge;
