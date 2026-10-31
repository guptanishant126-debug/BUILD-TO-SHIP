import React from 'react';
import { Link } from 'react-router-dom';
import { formatCurrency, formatRelativeTime, getRiskTier } from '../utils/formatters';
import ThreatCategoryBadge from './ThreatCategoryBadge';
import { ArrowRight, Phone, Clock, DollarSign } from 'lucide-react';

const IncidentCard = ({ incident }) => {
  const tier = getRiskTier(incident.overall_risk_score);

  return (
    <div className="bg-slate-900/60 border border-slate-800/80 hover:border-slate-700/80 rounded-2xl p-4 sm:p-5 transition-all shadow-md hover:shadow-cyan-500/5 group flex flex-col justify-between">
      <div>
        
        {/* Top Badges */}
        <div className="flex items-center justify-between mb-3">
          <ThreatCategoryBadge category={incident.primary_threat_category} size="sm" />
          <div className="flex items-center space-x-2">
            <span className={`px-2 py-0.5 rounded text-[11px] font-mono font-bold border ${tier.badgeClass}`}>
              Risk {incident.overall_risk_score}%
            </span>
          </div>
        </div>

        {/* Caller & Time */}
        <div className="space-y-1 mb-3">
          <div className="flex items-center space-x-1.5 text-xs text-slate-300 font-semibold truncate">
            <Phone className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
            <span className="truncate">{incident.caller_identifier || 'Unknown Inbound Line'}</span>
          </div>
          <div className="flex items-center space-x-1.5 text-[11px] text-slate-500 font-mono">
            <Clock className="w-3.5 h-3.5 shrink-0" />
            <span>{formatRelativeTime(incident.created_at)}</span>
            <span>•</span>
            <span>{incident.duration_seconds || 45}s call</span>
          </div>
        </div>

        {/* Executive Summary */}
        <p className="text-slate-400 text-xs line-clamp-2 leading-relaxed mb-4">
          {incident.executive_summary}
        </p>

      </div>

      {/* Footer info & CTA */}
      <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
        <div>
          {incident.money_demanded_cents > 0 ? (
            <span className="flex items-center space-x-1 font-mono text-rose-400 font-semibold">
              <DollarSign className="w-3.5 h-3.5" />
              <span>{formatCurrency(incident.money_demanded_cents, incident.money_demanded_currency)} Demanded</span>
            </span>
          ) : (
            <span className="font-mono text-slate-500">Biometric Intercept</span>
          )}
        </div>

        <Link
          to={`/incidents/${incident.id}`}
          className="flex items-center space-x-1 font-semibold text-cyan-400 hover:text-cyan-300 group-hover:translate-x-0.5 transition-transform"
        >
          <span>Forensic Report</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

    </div>
  );
};

export default IncidentCard;

