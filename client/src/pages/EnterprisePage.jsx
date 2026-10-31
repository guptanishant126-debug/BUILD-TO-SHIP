import React, { useState, useEffect } from 'react';
import axiosInstance from '../api/axiosInstance';
import {
  Building2,
  Key,
  Webhook,
  Activity,
  Send,
  CheckCircle2,
  AlertTriangle,
  Copy,
  Layers,
  Sparkles,
  BarChart3
} from 'lucide-react';

const EnterprisePage = () => {
  const [telemetry, setTelemetry] = useState(null);
  const [testUrl, setTestUrl] = useState('https://sentinel-bank.internal/api/v1/fraud-telemetry');
  const [testResult, setTestResult] = useState(null);
  const [testing, setTesting] = useState(false);
  const [copiedKey, setCopiedKey] = useState(false);

  useEffect(() => {
    const fetchTelemetry = async () => {
      try {
        const res = await axiosInstance.get('/enterprise/telemetry');
        if (res.data.success) {
          setTelemetry(res.data.metrics);
        }
      } catch (err) {
        console.error('Failed to load enterprise telemetry:', err);
      }
    };
    fetchTelemetry();
  }, []);

  const handleTestWebhook = async (e) => {
    e.preventDefault();
    setTesting(true);
    setTestResult(null);
    try {
      const res = await axiosInstance.post('/enterprise/webhook-test', {
        target_url: testUrl,
        test_payload: {
          event: 'SIMULATED_WIRE_FRAUD_INTERCEPT',
          account_routing_compromised: '121000358',
          threat_score: 91,
          claimed_officer: 'Miller (Imposter)',
          vocoder_spectral_divergence: 0.88,
          timestamp: new Date().toISOString()
        }
      });
      if (res.data.success) {
        setTestResult(res.data);
      }
    } catch (err) {
      setTestResult({
        success: false,
        message: err.response?.data?.message || err.message
      });
    } finally {
      setTesting(false);
    }
  };

  const copyApiKey = () => {
    navigator.clipboard.writeText('ag_live_sentinel_9a8f4c2e1b0d7a6e5f8c3b2a');
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-800 gap-4">
        <div>
          <div className="flex items-center space-x-2 mb-2">
            <Building2 className="w-5 h-5 text-violet-400" />
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-violet-400">
              Enterprise SOC Fraud Intelligence Hub
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">
            Financial Institution Gateway & B2B Telemetry
          </h1>
          <p className="text-slate-400 text-xs sm:text-sm mt-1 max-w-xl">
            In-band API telemetry pipeline for banks, telecom carriers, and enterprise customer service centers.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <span className="px-3 py-1.5 rounded-xl bg-violet-500/15 border border-violet-500/30 text-violet-300 font-mono text-xs font-bold">
            SOC CLUSTER: US-EAST-1
          </span>
        </div>
      </div>

      {/* Attack Distribution Heatmap & Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left (7 cols): Fraud Attack Distribution Breakdown */}
        <div className="lg:col-span-7 bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6 shadow-lg space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <BarChart3 className="w-4 h-4 text-cyan-400" />
              <h2 className="text-sm font-bold uppercase tracking-wider text-white">
                Scam Attack Vector Distribution (Worldwide)
              </h2>
            </div>
            <span className="text-xs font-mono text-slate-400">Past 30 Days</span>
          </div>

          <div className="space-y-4 pt-2">
            {(telemetry?.category_distribution || [
              { category: 'Grandchild Bail Ransom', count: 48, percentage: 34, riskColor: '#f43f5e' },
              { category: 'Bank Officer Wire Fraud', count: 39, percentage: 28, riskColor: '#f59e0b' },
              { category: 'Executive CEO Extortion', count: 24, percentage: 17, riskColor: '#8b5cf6' },
              { category: 'Gov / IRS Warrant Scam', count: 18, percentage: 13, riskColor: '#ec4899' },
              { category: 'Kidnapping Extortion', count: 11, percentage: 8, riskColor: '#e11d48' }
            ]).map((item, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="font-semibold text-slate-300">{item.category}</span>
                  <span className="font-mono text-slate-400">{item.percentage}% ({item.count} attacks)</span>
                </div>
                <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-800">
                  <div
                    className="h-2 rounded-full transition-all duration-700"
                    style={{ width: `${item.percentage}%`, backgroundColor: item.riskColor }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-3 pt-4 border-t border-slate-800/80 text-xs font-mono">
            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
              <span className="text-slate-500 block text-[10px]">BIOMETRIC PRECISION</span>
              <span className="text-emerald-400 font-bold text-base">98.4%</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
              <span className="text-slate-500 block text-[10px]">AVG RESPONSE SPEED</span>
              <span className="text-cyan-400 font-bold text-base">840ms</span>
            </div>
          </div>
        </div>

        {/* Right (5 cols): API Key Management */}
        <div className="lg:col-span-5 bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6 shadow-lg space-y-4">
          <div className="flex items-center space-x-2">
            <Key className="w-4 h-4 text-violet-400" />
            <h2 className="text-sm font-bold uppercase tracking-wider text-white">
              B2B Enterprise Ingestion API Key
            </h2>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Use this key in SIP trunk headers or banking IVR gateways to stream in-call audio packets directly to AegisVoice Guardian.
          </p>

          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs flex items-center justify-between">
            <span className="text-cyan-300 truncate mr-2">ag_live_sentinel_••••••••••••</span>
            <button
              onClick={copyApiKey}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs flex items-center space-x-1 shrink-0"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>{copiedKey ? 'Copied' : 'Copy'}</span>
            </button>
          </div>

          <div className="p-4 rounded-xl bg-violet-950/20 border border-violet-500/30 text-xs text-slate-300 space-y-2">
            <strong className="text-violet-300 block">Curl Integration Example:</strong>
            <pre className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 overflow-x-auto text-[11px] text-slate-400">
              {`curl -X POST http://localhost:5000/api/call/session/:id/stream-chunk \\
  -H "Authorization: Bearer <JWT_TOKEN>" \\
  -H "Content-Type: application/json" \\
  -d '{"chunk_index": 0, "transcript_segment": "..."}'`}
            </pre>
          </div>
        </div>

      </div>

      {/* Webhook Testing Simulator */}
      <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6 shadow-lg space-y-4">
        <div className="flex items-center space-x-2">
          <Webhook className="w-4 h-4 text-cyan-400" />
          <h2 className="text-sm font-bold uppercase tracking-wider text-white">
            Banking Webhook Dispatch Simulator
          </h2>
        </div>
        <p className="text-xs text-slate-400">
          Simulate a high-severity fraudulent wire attempt and verify that signed HMAC-SHA256 packets arrive at your mock endpoint.
        </p>

        <form onSubmit={handleTestWebhook} className="flex flex-col sm:flex-row gap-3">
          <input
            type="url"
            required
            value={testUrl}
            onChange={(e) => setTestUrl(e.target.value)}
            className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 font-mono"
            placeholder="https://your-bank.com/webhooks/fraud"
          />
          <button
            type="submit"
            disabled={testing}
            className="flex items-center justify-center space-x-2 px-5 py-2.5 rounded-xl font-bold text-xs bg-cyan-500 hover:bg-cyan-400 text-slate-950 transition-colors shadow-lg shadow-cyan-500/20 disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
            <span>{testing ? 'Transmitting...' : 'Dispatch Test Payload'}</span>
          </button>
        </form>

        {testResult && (
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs text-slate-300 space-y-2 animate-fade-in">
            <div className="flex items-center space-x-2 text-emerald-400 font-bold">
              <CheckCircle2 className="w-4 h-4" />
              <span>Packet Signed & Transmitted Successfully</span>
            </div>
            <pre className="text-[11px] text-slate-400 overflow-x-auto">
              {JSON.stringify(testResult, null, 2)}
            </pre>
          </div>
        )}
      </div>

    </div>
  );
};

export default EnterprisePage;

