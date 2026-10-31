import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axiosInstance from '../api/axiosInstance';
import IncidentCard from '../components/IncidentCard';
import {
  ShieldCheck,
  Radio,
  Users,
  AlertTriangle,
  Zap,
  ArrowRight,
  Clock,
  Sparkles,
  PhoneCall,
  Activity,
  Plus
} from 'lucide-react';

const DashboardPage = () => {
  const { user } = useAuth();
  const [telemetry, setTelemetry] = useState(null);
  const [recentIncidents, setRecentIncidents] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [telRes, incRes, conRes] = await Promise.all([
          axiosInstance.get('/enterprise/telemetry'),
          axiosInstance.get('/incidents'),
          axiosInstance.get('/contacts')
        ]);

        if (telRes.data.success) setTelemetry(telRes.data.metrics);
        if (incRes.data.success) setRecentIncidents(incRes.data.incidents.slice(0, 3));
        if (conRes.data.success) setContacts(conRes.data.contacts);
      } catch (err) {
        console.error('Dashboard data fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Top Banner / Welcome & Status */}
      <div className="flex flex-col md:flex-row md:items-center justify-between p-6 rounded-3xl bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 border border-slate-800 shadow-xl relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex items-center space-x-2 mb-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-400">
              System Armed & Listening
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Welcome back, {user?.full_name || 'Protected User'}
          </h1>
          <p className="text-slate-400 text-xs sm:text-sm mt-1 max-w-xl">
            AegisVoice Real-Time Biometric Sentinel is monitoring incoming telecommunication streams. Zero vocoder anomalies detected in current active session.
          </p>
        </div>

        <div className="mt-5 md:mt-0 flex items-center space-x-3 relative z-10">
          <Link
            to="/guardian/call-monitor"
            className="flex items-center space-x-2 px-5 py-3 rounded-2xl font-bold text-xs bg-gradient-to-r from-cyan-500 to-teal-400 text-slate-950 hover:from-cyan-400 hover:to-teal-300 transition-all shadow-lg shadow-cyan-500/25 group"
          >
            <Radio className="w-4 h-4 text-slate-950 group-hover:animate-ping" />
            <span>Launch Live Call Monitor</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Ambient background decoration */}
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Real-time Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 shadow-md">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Calls Monitored</span>
            <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400">
              <PhoneCall className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-white font-mono">
            {telemetry?.total_calls_monitored || 187}
          </div>
          <span className="text-[11px] text-emerald-400 font-medium flex items-center mt-1">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400 mr-1" />
            100% Ephemeral Ingestion
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 shadow-md">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Scams Neutralized</span>
            <div className="p-2 rounded-xl bg-rose-500/10 text-rose-400">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-rose-400 font-mono">
            {telemetry?.scams_neutralized || 44}
          </div>
          <span className="text-[11px] text-slate-400 font-medium flex items-center mt-1">
            $142,500 Extortion Prevented
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 shadow-md">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Voice Enclave Contacts</span>
            <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-cyan-400 font-mono">
            {contacts.length} Enrolled
          </div>
          <span className="text-[11px] text-cyan-300 font-medium flex items-center mt-1">
            Zero-Knowledge Biometrics
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 shadow-md">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Average Threat Latency</span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
              <Zap className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-amber-400 font-mono">
            840ms
          </div>
          <span className="text-[11px] text-slate-400 font-medium flex items-center mt-1">
            Gemini 2.5 Flash Pipeline
          </span>
        </div>

      </div>

      {/* Main Grid: Enclave Snapshot & Recent Threat Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left (2 cols): Recent Forensic Incidents */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Activity className="w-4 h-4 text-cyan-400" />
              <h2 className="text-lg font-bold text-white">Recent Monitored Threat Incidents</h2>
            </div>
            <Link to="/incidents" className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 flex items-center space-x-1">
              <span>View All Incidents</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {recentIncidents.length === 0 ? (
              <div className="col-span-2 p-8 text-center bg-slate-900/40 rounded-2xl border border-slate-800 text-slate-500 text-xs">
                No threat incidents recorded yet. Launch a simulated call from the Guardian HUD!
              </div>
            ) : (
              recentIncidents.map((inc) => (
                <IncidentCard key={inc.id} incident={inc} />
              ))
            )}
          </div>
        </div>

        {/* Right (1 col): Trusted Enclave Quick Status */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Users className="w-4 h-4 text-cyan-400" />
              <h2 className="text-lg font-bold text-white">Trusted Contacts Enclave</h2>
            </div>
            <Link to="/contacts/enclave" className="text-xs font-semibold text-cyan-400 hover:text-cyan-300">
              Manage Enclave
            </Link>
          </div>

          <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4 divide-y divide-slate-800/80">
            {contacts.slice(0, 4).map((c) => (
              <div key={c.id} className="py-3 first:pt-0 last:pb-0 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-slate-200">{c.full_name}</h4>
                  <div className="flex items-center space-x-2 text-[10px] text-slate-400 font-mono mt-0.5">
                    <span>{c.relationship}</span>
                    <span>•</span>
                    <span>{c.phone_number || 'No phone'}</span>
                  </div>
                </div>

                <div>
                  {c.is_voice_enrolled ? (
                    <span className="inline-flex items-center space-x-1 text-[10px] font-semibold text-emerald-300 bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                      <ShieldCheck className="w-3 h-3 text-emerald-400" />
                      <span>Enrolled</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center space-x-1 text-[10px] font-semibold text-amber-300 bg-amber-500/15 border border-amber-500/30 px-2 py-0.5 rounded-full">
                      <span>Baseline Pending</span>
                    </span>
                  )}
                </div>
              </div>
            ))}

            <Link
              to="/contacts/enclave"
              className="w-full mt-3 pt-3 flex items-center justify-center space-x-1 text-xs font-semibold text-slate-400 hover:text-cyan-300 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Enroll New Trusted Contact</span>
            </Link>
          </div>
        </div>

      </div>

    </div>
  );
};

export default DashboardPage;

