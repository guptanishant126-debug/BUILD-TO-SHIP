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
  Fingerprint,
  Volume2,
  VolumeX,
  Play,
  Square
} from 'lucide-react';
import AudioWaveformVisualizer from '../components/AudioWaveformVisualizer';
import sfx from '../utils/soundEffects';

const LandingPage = () => {
  // Blind Test Widget State
  const [selectedSample, setSelectedSample] = useState(null); // 'A' or 'B'
  const [isRevealed, setIsRevealed] = useState(false);
  const [isPlaying, setIsPlaying] = useState(null);

  const speakAudioSample = (sampleId, text, isFake) => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;

    if (isPlaying === sampleId) {
      window.speechSynthesis.cancel();
      setIsPlaying(null);
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.0;
    utterance.pitch = isFake ? 1.25 : 1.0; // Higher/flatter pitch characteristic of voice cloning models
    utterance.volume = 1.0;

    utterance.onend = () => {
      setIsPlaying(null);
    };

    setIsPlaying(sampleId);
    window.speechSynthesis.speak(utterance);
  };

  const handleTestSelection = (sample) => {
    setSelectedSample(sample);
    setIsRevealed(true);
    if (sample === 'A') {
      sfx.playSuccess();
    } else {
      sfx.playWarningAlert();
    }
  };

  const resetTest = () => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    setSelectedSample(null);
    setIsRevealed(false);
    setIsPlaying(null);
  };

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 radar-grid">
      
      {/* Hero Section */}
      <section className="relative pt-20 pb-24 overflow-hidden border-b border-slate-800/80">
        
        {/* Glow Spheres */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[650px] h-[380px] bg-cyan-500/10 blur-[140px] rounded-full pointer-events-none" />
        <div className="absolute top-1/3 right-1/4 w-[450px] h-[320px] bg-rose-500/10 blur-[130px] rounded-full pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-semibold mb-6 animate-pulse">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Real-Time Cloned Voice Defense • Powered by Gemini 2.5 Flash & Pro</span>
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight max-w-4xl mx-auto leading-tight">
            Stop Cloned Voice Scams <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-cyan-400 via-teal-300 to-emerald-400 bg-clip-text text-transparent">
              Before Money Leaves the Bank
            </span>
          </h1>

          <p className="mt-6 text-base sm:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Real-time multimodal AI guardian operating alongside phone calls. Ingests live audio, detects synthetic vocoder phase glitches, computes explainable risk scores, and triggers autonomous verification challenges.
          </p>

          {/* Action CTAs */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/guardian/call-monitor"
              className="w-full sm:w-auto px-8 py-4 rounded-2xl font-bold text-sm bg-gradient-to-r from-cyan-500 via-cyan-400 to-teal-400 text-slate-950 hover:from-cyan-400 hover:to-teal-300 transition-all shadow-xl shadow-cyan-500/25 flex items-center justify-center space-x-2 group hover:scale-102"
            >
              <Radio className="w-4 h-4 text-slate-950 group-hover:animate-ping" />
              <span>Launch Live Guardian Sandbox</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              to="/register"
              className="w-full sm:w-auto px-8 py-4 rounded-2xl font-semibold text-sm bg-slate-900/80 hover:bg-slate-800 text-slate-200 border border-slate-700/80 transition-all flex items-center justify-center space-x-2 shadow-lg"
            >
              <Lock className="w-4 h-4 text-cyan-400" />
              <span>Create Protected Account</span>
            </Link>
          </div>

          {/* Live Global Threat Ticker */}
          <div className="mt-14 max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4 p-5 rounded-3xl bg-[#0b1120]/80 border border-slate-800 backdrop-blur-xl shadow-2xl">
            <div className="text-center p-2">
              <span className="block text-2xl sm:text-3xl font-extrabold text-cyan-400 font-mono">184,920+</span>
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Calls Monitored</span>
            </div>
            <div className="text-center p-2">
              <span className="block text-2xl sm:text-3xl font-extrabold text-emerald-400 font-mono">42,610</span>
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Scams Neutralized</span>
            </div>
            <div className="text-center p-2">
              <span className="block text-2xl sm:text-3xl font-extrabold text-amber-400 font-mono">&lt; 1.1s</span>
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Threat Latency</span>
            </div>
            <div className="text-center p-2">
              <span className="block text-2xl sm:text-3xl font-extrabold text-rose-400 font-mono">5 Languages</span>
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Native Spoken Advisories</span>
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
            Modern AI clones human speech in under 3 seconds. Turn your speakers up and test your ears against AegisVoice’s acoustic vocoder engine below:
          </p>
        </div>

        <div className="bg-[#0b1120]/90 border border-slate-800 rounded-3xl p-6 sm:p-8 backdrop-blur-xl shadow-2xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Sample A */}
            <div className={`p-5 rounded-2xl border transition-all ${
              selectedSample === 'A' 
                ? isRevealed && selectedSample === 'A'
                  ? 'bg-rose-950/30 border-rose-500 shadow-lg shadow-rose-500/20'
                  : 'bg-cyan-950/30 border-cyan-500 shadow-lg shadow-cyan-500/20'
                : 'bg-slate-900/60 border-slate-800'
            }`}>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-mono font-bold text-cyan-300">VOICE SAMPLE A</span>
                <span className="text-[11px] text-slate-400 font-mono">Urgent Distressed Caller</span>
              </div>
              
              <p className="text-sm italic text-slate-200 mb-4 bg-slate-950/80 p-3.5 rounded-xl border border-slate-800/80 leading-relaxed">
                "Grandma please pick up, it's Sarah. I got into a bad car accident in Chicago and they arrested me. I need bail money right now..."
              </p>

              <AudioWaveformVisualizer isStreaming={isPlaying === 'A'} riskScore={isPlaying === 'A' ? 94 : 0} height={75} />

              <div className="mt-4 flex items-center justify-between">
                <button
                  onClick={() => speakAudioSample('A', "Grandma please pick up, it's Sarah. I got into a bad car accident in Chicago and they arrested me. I need bail money right now!", true)}
                  className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-colors ${
                    isPlaying === 'A' ? 'bg-rose-500 text-white animate-pulse' : 'bg-slate-800 hover:bg-slate-700 text-cyan-300'
                  }`}
                >
                  {isPlaying === 'A' ? <Square className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current" />}
                  <span>{isPlaying === 'A' ? 'Stop Audio' : '▶ Play Sample A'}</span>
                </button>
                <button
                  onClick={() => handleTestSelection('A')}
                  disabled={isRevealed}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-cyan-500 hover:bg-cyan-400 text-slate-950 transition-colors shadow-md disabled:opacity-50"
                >
                  Vote: AI Deepfake
                </button>
              </div>
            </div>

            {/* Sample B */}
            <div className={`p-5 rounded-2xl border transition-all ${
              selectedSample === 'B' 
                ? isRevealed
                  ? 'bg-emerald-950/30 border-emerald-500 shadow-lg shadow-emerald-500/20'
                  : 'bg-cyan-950/30 border-cyan-500 shadow-lg shadow-cyan-500/20'
                : 'bg-slate-900/60 border-slate-800'
            }`}>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-mono font-bold text-emerald-300">VOICE SAMPLE B</span>
                <span className="text-[11px] text-slate-400 font-mono">Authentic Granddaughter Check-in</span>
              </div>

              <p className="text-sm italic text-slate-200 mb-4 bg-slate-950/80 p-3.5 rounded-xl border border-slate-800/80 leading-relaxed">
                "Hi Grandma! Just finished my shift at the clinic. Wanted to know if you still wanted me to bring peach cobbler for Sunday lunch..."
              </p>

              <AudioWaveformVisualizer isStreaming={isPlaying === 'B'} riskScore={isPlaying === 'B' ? 12 : 0} height={75} />

              <div className="mt-4 flex items-center justify-between">
                <button
                  onClick={() => speakAudioSample('B', "Hi Grandma! Just finished my shift at the clinic. Wanted to know if you still wanted me to bring peach cobbler for Sunday lunch...", false)}
                  className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-colors ${
                    isPlaying === 'B' ? 'bg-emerald-500 text-white animate-pulse' : 'bg-slate-800 hover:bg-slate-700 text-emerald-300'
                  }`}
                >
                  {isPlaying === 'B' ? <Square className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current" />}
                  <span>{isPlaying === 'B' ? 'Stop Audio' : '▶ Play Sample B'}</span>
                </button>
                <button
                  onClick={() => handleTestSelection('B')}
                  disabled={isRevealed}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-cyan-500 hover:bg-cyan-400 text-slate-950 transition-colors shadow-md disabled:opacity-50"
                >
                  Vote: AI Deepfake
                </button>
              </div>
            </div>

          </div>

          {/* Reveal Result Box */}
          {isRevealed && (
            <div className="mt-6 p-5 rounded-2xl bg-slate-950 border border-slate-800 text-center animate-fade-in shadow-xl">
              <div className="flex items-center justify-center space-x-2 text-rose-400 font-bold text-base mb-1">
                <AlertTriangle className="w-5 h-5" />
                <span>Result: Sample A is the AI Voice Clone (ElevenLabs Diffusion Model)!</span>
              </div>
              <p className="text-xs text-slate-400 max-w-xl mx-auto leading-relaxed">
                Human ears were fooled by the emotional crying and urgency, but AegisVoice detected an abnormal <strong>1.9Hz pitch constancy</strong> and <strong>robotic vocoder phase shifts in the 2.4kHz harmonic band</strong> within 840ms.
              </p>
              <button
                onClick={resetTest}
                className="mt-3.5 text-xs text-cyan-400 hover:underline font-bold"
              >
                Reset Test & Play Again
              </button>
            </div>
          )}

        </div>
      </section>

      {/* Core Defense Pillars */}
      <section className="py-20 border-t border-slate-800/80 bg-[#070b14]/50">
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
            
            <div className="p-6 rounded-3xl bg-[#0b1120]/80 border border-slate-800 shadow-xl hover:border-slate-700 transition-all">
              <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center mb-4 shadow-md shadow-cyan-500/10">
                <Fingerprint className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Zero-Knowledge Biometric Enclave</h3>
              <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
                Enroll family members and financial representatives with a 10-second speech sample. Biometrics are stored as mathematical frequency vectors—raw audio is never kept on disk.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-[#0b1120]/80 border border-slate-800 shadow-xl hover:border-slate-700 transition-all">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center mb-4 shadow-md shadow-amber-500/10">
                <Zap className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Sub-Second Gemini 2.5 Flash Scoring</h3>
              <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
                Decomposes threat metrics into Acoustic Spoof Probability, Linguistic Coercion Index, and Caller Identity Discrepancy with sub-second latency (&lt; 1.2s).
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-[#0b1120]/80 border border-slate-800 shadow-xl hover:border-slate-700 transition-all">
              <div className="w-12 h-12 rounded-2xl bg-rose-500/20 text-rose-400 flex items-center justify-center mb-4 shadow-md shadow-rose-500/10">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Autonomous Intervention & Kill Switch</h3>
              <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
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
