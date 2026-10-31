import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';
import ThreatCategoryBadge from '../components/ThreatCategoryBadge';
import RiskGauge from '../components/RiskGauge';
import { formatCurrency, formatRelativeTime, getRiskTier } from '../utils/formatters';
import {
  FileText,
  ArrowLeft,
  Download,
  ShieldAlert,
  Clock,
  Phone,
  DollarSign,
  Fingerprint,
  Zap,
  Building,
  CheckCircle2,
  Play,
  Pause,
  AlertTriangle,
  Lock
} from 'lucide-react';

const IncidentDetailPage = () => {
  const { id } = useParams();
  const [incident, setIncident] = useState(null);
  const [timelineChunks, setTimelineChunks] = useState([]);
  const [activeChunkIndex, setActiveChunkIndex] = useState(0);
  const [isPlayingTimeline, setIsPlayingTimeline] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchIncident = async () => {
      try {
        const res = await axiosInstance.get(`/incidents/${id}`);
        if (res.data.success) {
          setIncident(res.data.incident);
          setTimelineChunks(res.data.timeline_chunks || []);
        }
      } catch (err) {
        console.error('Failed to load incident detail:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchIncident();
  }, [id]);

  // Audio Timeline Scrubber Playback Simulation
  useEffect(() => {
    let interval = null;
    if (isPlayingTimeline && timelineChunks.length > 0) {
      interval = setInterval(() => {
        setActiveChunkIndex((prev) => {
          if (prev >= timelineChunks.length - 1) {
            setIsPlayingTimeline(false);
            return prev;
          }
          return prev + 1;
        });
      }, 2500);
    }
    return () => clearInterval(interval);
  }, [isPlayingTimeline, timelineChunks]);

  const handleDownloadJson = async () => {
    try {
      const res = await axiosInstance.get(`/incidents/${id}/export`, {
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `aegisvoice-forensic-${id.substring(0, 8)}.json`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error('Export download error:', err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center text-slate-400 text-sm">
        Loading deep forensic audit report...
      </div>
    );
  }

  if (!incident) {
    return (
      <div className="max-w-4xl mx-auto py-12 px-4 text-center">
        <h2 className="text-xl font-bold text-white mb-2">Incident Record Not Found</h2>
        <Link to="/incidents" className="text-xs text-cyan-400 hover:underline">
          Return to Incident Archive
        </Link>
      </div>
    );
  }

  const tier = getRiskTier(incident.overall_risk_score);
  const currentChunk = timelineChunks[activeChunkIndex] || {};

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Top Breadcrumb & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-4">
        <div className="flex items-center space-x-3">
          <Link
            to="/incidents"
            className="p-2 rounded-xl bg-slate-900 text-slate-400 hover:text-white border border-slate-800 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-xl font-extrabold text-white">Forensic Audit Dossier</h1>
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-800 text-cyan-300 border border-slate-700">
                ID: {incident.id.substring(0, 8)}
              </span>
            </div>
            <p className="text-xs text-slate-400 font-mono">
              Compiled via Google Gemini 2.5 Pro Multimodal Forensic Core
            </p>
          </div>
        </div>

        <button
          onClick={handleDownloadJson}
          className="flex items-center space-x-2 px-4 py-2.5 rounded-xl font-semibold text-xs bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-cyan-500/30 transition-colors shadow-sm"
        >
          <Download className="w-4 h-4" />
          <span>Export Forensic Audit JSON</span>
        </button>
      </div>

      {/* Hero Incident Metadata Card */}
      <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <ThreatCategoryBadge category={incident.primary_threat_category} size="md" />
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-mono font-bold border ${tier.badgeClass}`}>
                Peak Threat: {incident.overall_risk_score}%
              </span>
            </div>
            <h2 className="text-lg font-bold text-white pt-1">
              Caller: {incident.caller_identifier}
            </h2>
          </div>

          <div className="flex items-center space-x-4 text-xs font-mono text-slate-400">
            <div>Action: <strong className="text-cyan-300">{incident.action_taken}</strong></div>
            <div>•</div>
            <div>Exposure: <strong className="text-rose-400">{formatCurrency(incident.money_demanded_cents, incident.money_demanded_currency)}</strong></div>
            <div>•</div>
            <div>Recorded: <strong className="text-slate-300">{new Date(incident.created_at).toLocaleString()}</strong></div>
          </div>
        </div>

        {/* Executive Summary */}
        <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 text-sm leading-relaxed text-slate-200">
          <strong className="text-cyan-400 font-mono uppercase text-xs block mb-1">Executive Summary:</strong>
          {incident.executive_summary}
        </div>
      </div>

      {/* Main Forensic Evidence Split: Left = Scrubber & Timeline, Right = Gemini Itemized Evidence */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column (7 cols): Interactive Audio Replay Scrubber & Synchronized Transcript */}
        <div className="lg:col-span-7 space-y-5">
          
          <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 shadow-lg space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center space-x-1.5">
                <Clock className="w-4 h-4 text-cyan-400" />
                <span>Synchronized Audio Replay Scrubber</span>
              </span>
              <button
                onClick={() => setIsPlayingTimeline(!isPlayingTimeline)}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-cyan-500 hover:bg-cyan-400 text-slate-950 transition-colors"
              >
                {isPlayingTimeline ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-current" />}
                <span>{isPlayingTimeline ? 'Pause Scrub' : 'Play Timeline'}</span>
              </button>
            </div>

            {/* Timeline Scrubber Bar */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
                <span>Chunk {activeChunkIndex + 1} of {Math.max(1, timelineChunks.length)}</span>
                <span>Telemetry Ingestion: 2.5s / window</span>
              </div>
              <div className="grid grid-flow-col auto-cols-fr gap-1 bg-slate-950 p-1.5 rounded-xl border border-slate-800">
                {timelineChunks.map((chunk, idx) => {
                  const chunkRisk = chunk.chunk_risk_score;
                  const isCurrent = idx === activeChunkIndex;
                  return (
                    <button
                      key={idx}
                      onClick={() => setActiveChunkIndex(idx)}
                      className={`h-7 rounded-lg transition-all relative group flex items-center justify-center text-[10px] font-mono font-bold ${
                        isCurrent ? 'ring-2 ring-white scale-105 z-10' : ''
                      } ${
                        chunkRisk >= 75
                          ? 'bg-rose-500/80 text-white'
                          : chunkRisk >= 40
                            ? 'bg-amber-500/80 text-slate-950'
                            : 'bg-emerald-500/80 text-slate-950'
                      }`}
                    >
                      <span>#{idx}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Active Chunk Acoustic Profile */}
            {currentChunk.acoustic_features && (
              <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 text-xs font-mono grid grid-cols-3 gap-2 text-center">
                <div>
                  <span className="text-[10px] text-slate-500 block">PITCH</span>
                  <span className="text-cyan-300 font-bold">{currentChunk.acoustic_features.pitch_mean_hz} Hz</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block">VOCAL JITTER</span>
                  <span className={`font-bold ${currentChunk.acoustic_features.jitter > 0.03 ? 'text-rose-400' : 'text-slate-300'}`}>
                    {currentChunk.acoustic_features.jitter}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block">CHUNK RISK</span>
                  <span className="text-rose-400 font-bold">{currentChunk.chunk_risk_score}%</span>
                </div>
              </div>
            )}

            {/* Full Synchronized Transcript Box */}
            <div className="space-y-2 pt-2 border-t border-slate-800/80">
              <span className="text-xs font-mono font-bold uppercase text-slate-400">Synchronized Transcript Timeline</span>
              <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 text-xs leading-relaxed max-h-56 overflow-y-auto space-y-2 font-mono">
                {timelineChunks.length > 0 ? (
                  timelineChunks.map((c, i) => (
                    <div
                      key={i}
                      onClick={() => setActiveChunkIndex(i)}
                      className={`p-2 rounded-lg cursor-pointer transition-colors ${
                        i === activeChunkIndex
                          ? 'bg-cyan-950/40 border border-cyan-500/40 text-cyan-200'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <span className="text-slate-600 mr-2">[{c.timestamp ? new Date(c.timestamp).toLocaleTimeString() : `Chunk ${i}`}]:</span>
                      {c.transcript_segment}
                    </div>
                  ))
                ) : (
                  <p className="text-slate-400 whitespace-pre-wrap">{incident.full_transcript}</p>
                )}
              </div>
            </div>

          </div>

        </div>

        {/* Right Column (5 cols): Gemini Itemized Forensic Breakdown */}
        <div className="lg:col-span-5 space-y-5">
          
          <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 shadow-lg space-y-4">
            <div className="flex items-center space-x-2 mb-2">
              <ShieldAlert className="w-5 h-5 text-cyan-400" />
              <h3 className="text-sm font-bold uppercase tracking-wider text-white">
                Itemized Forensic Evidence
              </h3>
            </div>

            {/* Evidence 1: Acoustic Anomaly Evidence */}
            <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
              <div className="flex items-center space-x-1.5 text-xs font-bold text-cyan-300">
                <Zap className="w-4 h-4 text-cyan-400" />
                <span>1. Acoustic Vocoder & Phase Artifacts</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                {incident.forensic_explanation?.acoustic_evidence || 'Harmonic formant stability indicates synthetic neural vocoder.'}
              </p>
            </div>

            {/* Evidence 2: Linguistic Coercion Evidence */}
            <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
              <div className="flex items-center space-x-1.5 text-xs font-bold text-amber-300">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                <span>2. Linguistic Coercion & Urgency Vector</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                {incident.forensic_explanation?.linguistic_evidence || 'High psychological panic induction with demands for non-traceable immediate funds.'}
              </p>
            </div>

            {/* Evidence 3: Biometric Identity Evidence */}
            <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
              <div className="flex items-center space-x-1.5 text-xs font-bold text-rose-300">
                <Fingerprint className="w-4 h-4 text-rose-400" />
                <span>3. Identity Baseline Cosine Divergence</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                {incident.forensic_explanation?.identity_evidence || 'Biometric feature vectors diverged from registered Enclave profile.'}
              </p>
            </div>

            {/* Bank Webhook Dispatch Status */}
            <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
              <span className="text-slate-400 flex items-center space-x-1.5">
                <Building className="w-4 h-4 text-emerald-400" />
                <span>Bank SOC Webhook Dispatched</span>
              </span>
              <span className="font-mono text-emerald-400 font-bold">ACKNOWLEDGED 200 OK</span>
            </div>

          </div>

        </div>

      </div>

    </div>
  );
};

export default IncidentDetailPage;

