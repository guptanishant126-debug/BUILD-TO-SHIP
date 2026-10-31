import React from 'react';
import { getRiskTier } from '../utils/formatters';
import { AlertTriangle, ShieldCheck, Activity, Zap } from 'lucide-react';

const RiskGauge = ({
  riskScore = 0,
  syntheticConfidence = 0,
  urgencyScore = 0,
  identityDiscrepancy = 0
}) => {
  const tierInfo = getRiskTier(riskScore);

  // SVG Gauge calculations (Semi-circle arc)
  const radius = 80;
  const strokeWidth = 14;
  const circumference = Math.PI * radius; // 180 deg arc
  const strokeDashoffset = circumference - (riskScore / 100) * circumference;

  // Needle angle (-90 deg at 0 to +90 deg at 100)
  const needleAngle = -90 + (riskScore / 100) * 180;

  return (
    <div className="flex flex-col items-center bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 shadow-lg relative overflow-hidden backdrop-blur-sm">
      
      {/* Background ambient glow based on threat level */}
      <div 
        className={`absolute -top-16 -right-16 w-44 h-44 rounded-full blur-3xl opacity-20 pointer-events-none transition-colors duration-700 ${
          riskScore >= 85 ? 'bg-rose-500' : riskScore >= 60 ? 'bg-orange-500' : riskScore >= 30 ? 'bg-amber-500' : 'bg-emerald-500'
        }`} 
      />

      {/* Header */}
      <div className="w-full flex items-center justify-between mb-2">
        <div className="flex items-center space-x-2">
          <Activity className="w-4 h-4 text-cyan-400" />
          <span className="text-xs font-bold tracking-wider uppercase text-slate-300">
            Real-Time Threat Scorecard
          </span>
        </div>
        <div className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border tracking-wide uppercase transition-all duration-300 ${tierInfo.badgeClass}`}>
          {tierInfo.tier}
        </div>
      </div>

      {/* Radial Arc Gauge */}
      <div className="relative flex items-center justify-center my-3">
        <svg width="220" height="130" viewBox="0 0 220 130" className="overflow-visible">
          <defs>
            <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#10b981" />
              <stop offset="35%" stopColor="#f59e0b" />
              <stop offset="70%" stopColor="#f97316" />
              <stop offset="100%" stopColor="#f43f5e" />
            </linearGradient>
          </defs>

          {/* Background Arc */}
          <path
            d="M 20 120 A 80 80 0 0 1 200 120"
            fill="none"
            stroke="#1e293b"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
          />

          {/* Active Progress Arc */}
          <path
            d="M 20 120 A 80 80 0 0 1 200 120"
            fill="none"
            stroke="url(#gaugeGradient)"
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-700 ease-out"
          />

          {/* Center Pivot & Needle */}
          <g transform="translate(110, 120)">
            <line
              x1="0"
              y1="0"
              x2="0"
              y2="-68"
              stroke="#ffffff"
              strokeWidth="3.5"
              strokeLinecap="round"
              transform={`rotate(${needleAngle})`}
              className="transition-transform duration-700 ease-out drop-shadow-md"
            />
            <circle cx="0" cy="0" r="7" fill="#ffffff" />
            <circle cx="0" cy="0" r="3" fill="#0f172a" />
          </g>
        </svg>

        {/* Score Readout Overlay */}
        <div className="absolute bottom-0 flex flex-col items-center">
          <span className={`text-4xl font-extrabold tracking-tight transition-colors duration-500 ${tierInfo.textColor}`}>
            {riskScore}
          </span>
          <span className="text-[10px] text-slate-400 font-mono uppercase tracking-widest -mt-1">
            Out of 100
          </span>
        </div>
      </div>

      {/* Granular Breakdown Meters */}
      <div className="w-full mt-4 space-y-2.5 pt-3 border-t border-slate-800/80">
        
        {/* Metric 1: Acoustic Spoof */}
        <div>
          <div className="flex justify-between text-xs mb-1">
            <span className="text-slate-400 flex items-center space-x-1">
              <Zap className="w-3 h-3 text-cyan-400" />
              <span>Acoustic Spoof Probability</span>
            </span>
            <span className="font-mono font-semibold text-slate-200">{syntheticConfidence}%</span>
          </div>
          <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
            <div 
              className="bg-cyan-500 h-1.5 rounded-full transition-all duration-500" 
              style={{ width: `${syntheticConfidence}%` }} 
            />
          </div>
        </div>

        {/* Metric 2: Linguistic Urgency & Coercion */}
        <div>
          <div className="flex justify-between text-xs mb-1">
            <span className="text-slate-400 flex items-center space-x-1">
              <AlertTriangle className="w-3 h-3 text-amber-400" />
              <span>Semantic Urgency & Coercion</span>
            </span>
            <span className="font-mono font-semibold text-slate-200">{urgencyScore}%</span>
          </div>
          <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
            <div 
              className="bg-amber-500 h-1.5 rounded-full transition-all duration-500" 
              style={{ width: `${urgencyScore}%` }} 
            />
          </div>
        </div>

        {/* Metric 3: Identity Match Discrepancy */}
        <div>
          <div className="flex justify-between text-xs mb-1">
            <span className="text-slate-400 flex items-center space-x-1">
              <ShieldCheck className="w-3 h-3 text-rose-400" />
              <span>Identity Discrepancy Index</span>
            </span>
            <span className="font-mono font-semibold text-slate-200">{identityDiscrepancy}%</span>
          </div>
          <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
            <div 
              className="bg-rose-500 h-1.5 rounded-full transition-all duration-500" 
              style={{ width: `${identityDiscrepancy}%` }} 
            />
          </div>
        </div>

      </div>

    </div>
  );
};

export default RiskGauge;

