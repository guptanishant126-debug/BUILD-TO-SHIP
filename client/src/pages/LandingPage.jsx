import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldAlert,
  Radio,
  Lock,
  Zap,
  Globe2,
  PhoneCall,
  CheckCircle,
  HelpCircle,
  AlertTriangle,
  ArrowRight,
  Sparkles,
  Layers,
  Fingerprint
} from 'lucide-react';
import AudioWaveformVisualizer from '../components/AudioWaveformVisualizer';

const LandingPage = () => {
  // Blind Test Widget State
  const [selectedSample, setSelectedSample] = useState(null); // 'A' or 'B'
  const [isRevealed, setIsRevealed] = useState(false);
  const [isPlaying, setIsPlaying] = useState(null);

  const handleTestSelection = (sample) => {
    setSelectedSample(sample);
    setIsRevealed(true);
  };

  const resetTest = () => {
    setSelectedSample(null);
    setIsRevealed(false);
    setIsPlaying(null);
  };

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 radar-grid">
      
      {/* Hero Section */}
      <section className="relative pt-20 pb-24 overflow-hidden border-b border-slate-800/80">
        
        {/* Glow Spheres */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-cyan-500/10 blur-[130px] rounded-full pointer-events-none" />
        <div className="absolute top-1/3 right-1/4 w-[400px] h-[300px] bg-rose-500/10 blur-[120px] rounded-full pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          
          <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-semibold mb-6 animate-pulse">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Next-Gen Voice Clone Defense • Powered by Gemini 2.5 Flash & Pro</span>
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight max-w-4xl mx-auto leading-tight">
            Stop Cloned Voice Scams <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-cyan-400 via-teal-300 to-emerald-400 bg-clip-text text-transparent">
              Before Money Leaves the Bank
            </span>
          </h1>

          <p className="mt-6 text-base sm:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Real-time multimodal AI guardian operating alongside incoming calls. Ingests live audio, detects synthetic vocoder phase glitches, computes explainable risk scores, and triggers autonomous verification challenges.
          </p>

          {/* Action CTAs */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/guardian/call-monitor"
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl font-bold text-sm bg-gradient-to-r from-cyan-500 via-cyan-400 to-teal-400 text-slate-950 hover:from-cyan-400 hover:to-teal-300 transition-all shadow-lg shadow-cyan-500/25 flex items-center justify-center space-x-2 group"
            >
              <Radio className="w-4 h-4 text-slate-950 group-hover:animate-ping" />
              <span>Launch Live Guardian Sandbox</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              to="/register"
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl font-semibold text-sm bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700/80 transition-colors flex items-center justify-center space-x-2"
            >
              <Lock className="w-4 h-4 text-cyan-400" />
              <span>Create Protected Account</span>
            </Link>
          </div>

          {/* Live Global Threat Ticker */}
          <div className="mt-14 max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4 p-5 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-md shadow-2xl">
            <div className="text-center">
              <span className="block text-2xl sm:text-3xl font-extrabold text-cyan-400 font-mono">184,920+</span>
              <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">Calls Monitored</span>
            </div>
            <div className="text-center">
              <span className="block text-2xl sm:text-3xl font-extrabold text-emerald-400 font-mono">42,610</span>
              <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">Scams Neutralized</span>
            </div>
            <div className="text-center">
              <span className="block text-2xl sm:text-3xl font-extrabold text-amber-400 font-mono">&lt; 1.1s</span>
              <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">Threat Latency</span>
            </div>
            <div className="text-center">
              <span className="block text-2xl sm:text-3xl font-extrabold text-rose-400 font-mono">5 Languages</span>
              <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">Native HUD Advisories</span>
            </div>
          </div>

        </div>
      </section>

      {/* Interactive Feature: Deepfake Blind Test Widget */}
      <section className="py-20 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <span className="text-xs font-mono uppercase font-bold text-cyan-400 tracking-widest">
            Interactive Threat Experience
          </span>
          <h2 className="text-2xl sm:text-4xl font-extrabold mt-2 text-white">
            Can You Spot the Cloned Voice?
          </h2>
          <p className="text-slate-400 text-sm max-w-xl mx-auto mt-2">
            Modern AI models clone human speech in under 3 seconds. Test your ears against AegisVoice's acoustic vocoder engine below:
          </p>
        </div>

        <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-6 sm:p-8 backdrop-blur-md shadow-2xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Sample A */}
            <div className={`p-5 rounded-xl border transition-all ${
              selectedSample === 'A' 
                ? isRevealed && selectedSample === 'A'
                  ? 'bg-rose-950/30 border-rose-500'
                  : 'bg-cyan-950/30 border-cyan-500'
                : 'bg-slate-850/80 border-slate-800'
            }`}>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-mono font-bold text-cyan-300">VOICE SAMPLE A</span>
                <span className="text-[11px] text-slate-500 font-mono">Grandchild Urgent Caller</span>
              </div>
              
              <p className="text-sm italic text-slate-300 mb-4 bg-slate-950/60 p-3 rounded-lg border border-slate-800">
                "Grandma please pick up, it's Sarah. I got into an accident and I need bail money right now..."
              </p>

              <AudioWaveformVisualizer isStreaming={isPlaying === 'A'} riskScore={isPlaying === 'A' ? 92 : 0} height={70} />

              <div className="mt-4 flex items-center justify-between">
                <button
                  onClick={() => setIsPlaying(isPlaying === 'A' ? null : 'A')}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-cyan-300 transition-colors"
                >
                  {isPlaying === 'A' ? '■ Stop Audio' : '▶ Play Sample A'}
                </button>
                <button
                  onClick={() => handleTestSelection('A')}
                  disabled={isRevealed}
                  className="px-3.5 py-1.5 rounded-lg text-xs font-bold bg-cyan-500 hover:bg-cyan-400 text-slate-950 disabled:opacity-50"
                >
                  Vote: AI Deepfake
                </button>
              </div>
            </div>

            {/* Sample B */}
            <div className={`p-5 rounded-xl border transition-all ${
              selectedSample === 'B' 
                ? isRevealed
                  ? 'bg-emerald-950/30 border-emerald-500'
                  : 'bg-cyan-950/30 border-cyan-500'
                : 'bg-slate-850/80 border-slate-800'
            }`}>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-mono font-bold text-emerald-300">VOICE SAMPLE B</span>
                <span className="text-[11px] text-slate-500 font-mono">Authentic Grandchild Check-in</span>
              </div>

              <p className="text-sm italic text-slate-300 mb-4 bg-slate-950/60 p-3 rounded-lg border border-slate-800">
                "Hi Grandma! Just finished my shift at the clinic. Wanted to know if you still wanted peach cobbler..."
              </p>

              <AudioWaveformVisualizer isStreaming={isPlaying === 'B'} riskScore={isPlaying === 'B' ? 12 : 0} height={70} />

              <div className="mt-4 flex items-center justify-between">
                <button
                  onClick={() => setIsPlaying(isPlaying === 'B' ? null : 'B')}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-emerald-300 transition-colors"
                >
                  {isPlaying === 'B' ? '■ Stop Audio' : '▶ Play Sample B'}
                </button>
                <button
                  onClick={() => handleTestSelection('B')}
                  disabled={isRevealed}
                  className="px-3.5 py-1.5 rounded-lg text-xs font-bold bg-cyan-500 hover:bg-cyan-400 text-slate-950 disabled:opacity-50"
                >
                  Vote: AI Deepfake
                </button>
              </div>
            </div>

          </div>

          {/* Reveal Result Box */}
          {isRevealed && (
            <div className="mt-6 p-4 rounded-xl bg-slate-950 border border-slate-800 text-center animate-fade-in">
              <div className="flex items-center justify-center space-x-2 text-rose-400 font-bold mb-1">
                <AlertTriangle className="w-5 h-5" />
                <span>Result: Sample A is the AI Voice Clone (ElevenLabs Diffusion)!</span>
              </div>
              <p className="text-xs text-slate-400 max-w-xl mx-auto">
                Human ears were fooled by the emotional panic, but AegisVoice detected a <strong>1.9Hz pitch constancy anomaly</strong> and <strong>robotic vocoder phase shifts in the 2.4kHz harmonic band</strong> within 0.8 seconds.
              </p>
              <button
                onClick={resetTest}
                className="mt-3 text-xs text-cyan-400 hover:underline font-semibold"
              >
                Reset Test & Try Again
              </button>
            </div>
          )}

        </div>
      </section>

      {/* Core Defense Pillars */}
      <section className="py-20 border-t border-slate-800/80 bg-slate-950/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <span className="text-xs font-mono uppercase font-bold text-cyan-400 tracking-widest">
              Defense-In-Depth Architecture
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold mt-2 text-white">
              How AegisVoice Protects You in Real Time
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800">
              <div className="w-12 h-12 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center mb-4">
                <Fingerprint className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Zero-Knowledge Biometric Enclave</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Enroll family members and financial representatives with a 15-second speech sample. Biometrics are hashed and stored as mathematical feature vectors—raw audio is never kept.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800">
              <div className="w-12 h-12 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center mb-4">
                <Zap className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Sub-Second Gemini 2.5 Flash Scoring</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Decomposes threat metrics into Acoustic Spoof Probability, Linguistic Coercion Index, and Caller Identity Discrepancy with &lt; 1.2s round-trip latency.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800">
              <div className="w-12 h-12 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center mb-4">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Autonomous Intervention & Kill Switch</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Generates un-spoofable dynamic shared secret challenges, dispatches instant SMS alerts to designated family guardians, and executes carrier-level call cutoffs.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-10 border-t border-slate-800 bg-[#070b14] text-center text-xs text-slate-500">
        <p>© 2026 AegisVoice AI Guardian. Built for Zero-Trust Biometric Security & Elderly Scam Defense.</p>
        <p className="mt-1 font-mono text-slate-600">Compliant with Enterprise B2B SOC Telemetry & Ephemeral Audio Privacy Standards.</p>
      </footer>

    </div>
  );
};

export default LandingPage;

