import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';
import ThreatCategoryBadge from '../components/ThreatCategoryBadge';
import { formatCurrency, formatRelativeTime, getRiskTier } from '../utils/formatters';
import {
  FileText,
  Filter,
  Search,
  ArrowRight,
  ShieldAlert,
  Clock,
  Phone,
  DollarSign
} from 'lucide-react';

const IncidentsPage = () => {
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState('');
  const [minRiskFilter, setMinRiskFilter] = useState(0);

  const fetchIncidents = async () => {
    setLoading(true);
    try {
      let url = '/incidents';
      const params = new URLSearchParams();
      if (categoryFilter) params.append('category', categoryFilter);
      if (minRiskFilter > 0) params.append('min_risk', minRiskFilter.toString());
      if (params.toString()) url += `?${params.toString()}`;

      const res = await axiosInstance.get(url);
      if (res.data.success) {
        setIncidents(res.data.incidents);
      }
    } catch (err) {
      console.error('Failed to load incident audit archive:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIncidents();
  }, [categoryFilter, minRiskFilter]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-800 gap-4">
        <div>
          <div className="flex items-center space-x-2 mb-1.5">
            <FileText className="w-5 h-5 text-cyan-400" />
            <h1 className="text-2xl font-extrabold text-white tracking-tight">Forensic Incident Audit Archive</h1>
          </div>
          <p className="text-slate-400 text-xs sm:text-sm">
            Auditable repository of intercepted calls with Gemini 2.5 forensic reasoning, acoustic timelines, and cryptographic proofs.
          </p>
        </div>

        {/* Filters */}
        <div className="flex items-center space-x-3">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
          >
            <option value="">All Threat Categories</option>
            <option value="GRANDCHILD_EMERGENCY">Grandchild Emergency</option>
            <option value="BANK_FRAUD_IMPOSTER">Bank Fraud Imposter</option>
            <option value="KIDNAPPING_RANSOM">Kidnapping Ransom</option>
            <option value="EXECUTIVE_CEO_FRAUD">Executive CEO Fraud</option>
            <option value="AUTHENTIC_COMMUNICATION">Authentic Calls</option>
          </select>

          <select
            value={minRiskFilter}
            onChange={(e) => setMinRiskFilter(parseInt(e.target.value, 10))}
            className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
          >
            <option value="0">All Risk Scores</option>
            <option value="60">Risk &gt;= 60% (High Risk)</option>
            <option value="80">Risk &gt;= 80% (Critical)</option>
          </select>
        </div>
      </div>

      {/* Incidents Table / Cards */}
      <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 border-b border-slate-800 text-slate-400 font-mono uppercase text-[10px]">
              <tr>
                <th className="px-5 py-3.5">Threat Category</th>
                <th className="px-5 py-3.5">Inbound Caller Line</th>
                <th className="px-5 py-3.5">Peak Risk Score</th>
                <th className="px-5 py-3.5">Action Taken</th>
                <th className="px-5 py-3.5">Demanded Exposure</th>
                <th className="px-5 py-3.5">Timestamp</th>
                <th className="px-5 py-3.5 text-right">Forensic Audit</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/70 text-slate-300">
              {incidents.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-12 text-slate-500 text-xs">
                    No matching incidents found for the selected filter parameters.
                  </td>
                </tr>
              ) : (
                incidents.map((inc) => {
                  const tier = getRiskTier(inc.overall_risk_score);
                  return (
                    <tr key={inc.id} className="hover:bg-slate-850/60 transition-colors">
                      <td className="px-5 py-4 whitespace-nowrap">
                        <ThreatCategoryBadge category={inc.primary_threat_category} size="sm" />
                      </td>
                      <td className="px-5 py-4 font-semibold text-slate-200 whitespace-nowrap">
                        <div className="flex items-center space-x-1.5">
                          <Phone className="w-3.5 h-3.5 text-cyan-400" />
                          <span className="truncate max-w-[200px]">{inc.caller_identifier || 'Unknown'}</span>
                        </div>
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap">
                        <span className={`px-2 py-0.5 rounded font-mono font-bold text-xs border ${tier.badgeClass}`}>
                          {inc.overall_risk_score}%
                        </span>
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap font-mono text-[11px]">
                        <span className={`px-2 py-0.5 rounded ${
                          inc.action_taken === 'AUTONOMOUSLY_BLOCKED'
                            ? 'bg-rose-500/20 text-rose-300'
                            : 'bg-slate-800 text-slate-300'
                        }`}>
                          {inc.action_taken}
                        </span>
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap font-mono text-slate-200">
                        {inc.money_demanded_cents > 0 ? (
                          <span className="text-rose-400 font-semibold">
                            {formatCurrency(inc.money_demanded_cents, inc.money_demanded_currency)}
                          </span>
                        ) : (
                          <span className="text-slate-500">$0 (Biometric)</span>
                        )}
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap text-slate-400 font-mono text-[11px]">
                        {formatRelativeTime(inc.created_at)}
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap text-right">
                        <Link
                          to={`/incidents/${inc.id}`}
                          className="inline-flex items-center space-x-1 text-cyan-400 hover:text-cyan-300 font-semibold"
                        >
                          <span>Deep Report</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};

export default IncidentsPage;

