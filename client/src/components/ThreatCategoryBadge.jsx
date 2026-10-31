import React from 'react';
import { getCategoryLabel } from '../utils/formatters';
import {
  UserX,
  Building,
  AlertOctagon,
  Briefcase,
  Landmark,
  ShieldCheck,
  HelpCircle
} from 'lucide-react';

const ThreatCategoryBadge = ({ category = 'UNKNOWN_SUSPICIOUS', size = 'md' }) => {
  const getBadgeConfig = () => {
    switch (category) {
      case 'GRANDCHILD_EMERGENCY':
        return {
          icon: UserX,
          bg: 'bg-rose-500/15',
          border: 'border-rose-500/40',
          text: 'text-rose-300',
          iconColor: 'text-rose-400'
        };
      case 'BANK_FRAUD_IMPOSTER':
        return {
          icon: Building,
          bg: 'bg-amber-500/15',
          border: 'border-amber-500/40',
          text: 'text-amber-300',
          iconColor: 'text-amber-400'
        };
      case 'KIDNAPPING_RANSOM':
        return {
          icon: AlertOctagon,
          bg: 'bg-red-600/20',
          border: 'border-red-500/60',
          text: 'text-red-200',
          iconColor: 'text-red-400'
        };
      case 'EXECUTIVE_CEO_FRAUD':
        return {
          icon: Briefcase,
          bg: 'bg-violet-500/15',
          border: 'border-violet-500/40',
          text: 'text-violet-300',
          iconColor: 'text-violet-400'
        };
      case 'GOVERNMENT_LEGAL_EXTORTION':
        return {
          icon: Landmark,
          bg: 'bg-fuchsia-500/15',
          border: 'border-fuchsia-500/40',
          text: 'text-fuchsia-300',
          iconColor: 'text-fuchsia-400'
        };
      case 'AUTHENTIC_COMMUNICATION':
        return {
          icon: ShieldCheck,
          bg: 'bg-emerald-500/15',
          border: 'border-emerald-500/40',
          text: 'text-emerald-300',
          iconColor: 'text-emerald-400'
        };
      default:
        return {
          icon: HelpCircle,
          bg: 'bg-slate-700/20',
          border: 'border-slate-600/40',
          text: 'text-slate-300',
          iconColor: 'text-slate-400'
        };
    }
  };

  const config = getBadgeConfig();
  const Icon = config.icon;
  const label = getCategoryLabel(category);

  return (
    <span className={`inline-flex items-center space-x-1.5 rounded-full font-semibold border ${config.bg} ${config.border} ${config.text} ${
      size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-3 py-1 text-xs'
    }`}>
      <Icon className={`${size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5'} ${config.iconColor}`} />
      <span>{label}</span>
    </span>
  );
};

export default ThreatCategoryBadge;

