import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Sliders,
  Globe,
  BellRing,
  ShieldAlert,
  Building,
  Save,
  CheckCircle2,
  Lock,
  Volume2
} from 'lucide-react';

const SettingsPage = () => {
  const { user, updateSettings } = useAuth();

  const [formData, setFormData] = useState({
    preferred_language: user?.preferred_language || 'en',
    alert_sensitivity: user?.alert_sensitivity || 'BALANCED',
    auto_terminate_threshold: user?.auto_terminate_threshold || 85,
    guardian_contact_phone: user?.guardian_contact_phone || '+1 (555) 987-6543',
    guardian_contact_email: user?.guardian_contact_email || 'marcus.vance@example.com',
    bank_fraud_webhook_url: 'https://sentinel-bank.internal/api/v1/fraud-telemetry'
  });

  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSaved(false);
    try {
      await updateSettings(formData);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      console.error('Failed to update settings:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header */}
      <div className="pb-6 border-b border-slate-800">
        <div className="flex items-center space-x-2 mb-2">
          <Sliders className="w-5 h-5 text-cyan-400" />
          <h1 className="text-2xl font-extrabold text-white tracking-tight">
            Security, Multilingual & Escalation Policies
          </h1>
        </div>
        <p className="text-slate-400 text-xs sm:text-sm">
          Configure autonomous risk thresholds, multilingual synthesized heads-up alerts, and guardian dispatch webhooks.
        </p>
      </div>

      {saved && (
        <div className="p-4 rounded-2xl bg-emerald-950/20 border border-emerald-500/40 text-emerald-300 flex items-center space-x-2 text-xs font-semibold animate-fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          <span>Protection policies and threshold parameters updated successfully across the cluster.</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Multilingual Advisories */}
        <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800/80 space-y-4 shadow-lg">
          <div className="flex items-center space-x-2">
            <Globe className="w-5 h-5 text-cyan-400" />
            <h2 className="text-sm font-bold uppercase tracking-wider text-white">
              Native Language Spoken & Visual Alerts
            </h2>
          </div>
          <p className="text-xs text-slate-400">
            When high threat is detected, warning HUD banners and emergency mode speech synthesis will be delivered in this language.
          </p>

          <div className="max-w-xs">
            <select
              value={formData.preferred_language}
              onChange={(e) => setFormData({ ...formData, preferred_language: e.target.value })}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
            >
              <option value="en">English (United States / Global)</option>
              <option value="es">Español (Spanish)</option>
              <option value="hi">हिन्दी (Hindi)</option>
              <option value="zh">中文 (Mandarin)</option>
              <option value="tl">Tagalog (Filipino)</option>
            </select>
          </div>
        </div>

        {/* Autonomous Intervention Threshold Sliders */}
        <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800/80 space-y-5 shadow-lg">
          <div className="flex items-center space-x-2">
            <ShieldAlert className="w-5 h-5 text-rose-400" />
            <h2 className="text-sm font-bold uppercase tracking-wider text-white">
              Autonomous Intervention Thresholds
            </h2>
          </div>
          <p className="text-xs text-slate-400">
            Define exact risk score cutoffs that autonomously trigger verification challenges, SMS notifications, and telecom kill-switch terminations.
          </p>

          <div className="space-y-6">
            
            {/* Auto Terminate Threshold Slider */}
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="font-semibold text-slate-200">Autonomous Call Kill-Switch Threshold:</span>
                <span className="font-mono text-rose-400 font-bold">{formData.auto_terminate_threshold}% Threat</span>
              </div>
              <input
                type="range"
                min="50"
                max="100"
                step="5"
                value={formData.auto_terminate_threshold}
                onChange={(e) => setFormData({ ...formData, auto_terminate_threshold: parseInt(e.target.value, 10) })}
                className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-rose-500"
              />
              <span className="text-[11px] text-slate-500 block mt-1">
                When a call reaches or exceeds {formData.auto_terminate_threshold}%, the call stream is forcefully severed.
              </span>
            </div>

            {/* Alert Sensitivity */}
            <div>
              <label className="block text-xs font-semibold text-slate-200 mb-2">
                Acoustic Anomaly Sensitivity Policy
              </label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { id: 'BALANCED', label: 'Balanced', desc: 'Optimal for family & daily calls' },
                  { id: 'STRICT', label: 'Strict', desc: 'Heightened sensitivity for seniors' },
                  { id: 'AGGRESSIVE', label: 'Aggressive', desc: 'Zero tolerance for any vocoder jitter' }
                ].map((s) => (
                  <button
                    type="button"
                    key={s.id}
                    onClick={() => setFormData({ ...formData, alert_sensitivity: s.id })}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      formData.alert_sensitivity === s.id
                        ? 'bg-cyan-500/20 border-cyan-500 text-cyan-300 font-bold shadow-md shadow-cyan-500/10'
                        : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <span className="block text-xs">{s.label}</span>
                    <span className="block text-[10px] text-slate-500 font-normal">{s.desc}</span>
                  </button>
                ))}
              </div>
            </div>

          </div>
        </div>

        {/* Emergency Guardian Notification Settings */}
        <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800/80 space-y-4 shadow-lg">
          <div className="flex items-center space-x-2">
            <BellRing className="w-5 h-5 text-amber-400" />
            <h2 className="text-sm font-bold uppercase tracking-wider text-white">
              Emergency Guardian Dispatch Targets
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Guardian Emergency Mobile (SMS)
              </label>
              <input
                type="text"
                value={formData.guardian_contact_phone}
                onChange={(e) => setFormData({ ...formData, guardian_contact_phone: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Guardian Email (Full Audit Dossier Link)
              </label>
              <input
                type="email"
                value={formData.guardian_contact_email}
                onChange={(e) => setFormData({ ...formData, guardian_contact_email: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>
        </div>

        {/* Bank Fraud SOC Webhook */}
        <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800/80 space-y-4 shadow-lg">
          <div className="flex items-center space-x-2">
            <Building className="w-5 h-5 text-violet-400" />
            <h2 className="text-sm font-bold uppercase tracking-wider text-white">
              Financial Institution Webhook Gateway
            </h2>
          </div>
          <p className="text-xs text-slate-400">
            Automatically dispatches signed HMAC-SHA256 telemetry payloads to your bank's fraud interception desk when wire coercion is detected.
          </p>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Bank Fraud Webhook Endpoint URL
            </label>
            <input
              type="url"
              value={formData.bank_fraud_webhook_url}
              onChange={(e) => setFormData({ ...formData, bank_fraud_webhook_url: e.target.value })}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 font-mono"
            />
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="flex items-center space-x-2 px-6 py-3 rounded-2xl font-bold text-xs bg-cyan-500 hover:bg-cyan-400 text-slate-950 transition-colors shadow-lg shadow-cyan-500/25 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{loading ? 'Saving Policies...' : 'Save Escalation Policies'}</span>
          </button>
        </div>

      </form>

    </div>
  );
};

export default SettingsPage;

