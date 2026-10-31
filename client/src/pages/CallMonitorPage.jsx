import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCallSession } from '../context/CallSessionContext';
import axiosInstance from '../api/axiosInstance';
import AudioWaveformVisualizer from '../components/AudioWaveformVisualizer';
import RiskGauge from '../components/RiskGauge';
import LiveTranscriptFeed from '../components/LiveTranscriptFeed';
import AutonomousActionHUD from '../components/AutonomousActionHUD';
import ChallengeModal from '../components/ChallengeModal';
import ScenarioSelector from '../components/ScenarioSelector';
import audioProcessor from '../utils/audioProcessor';
import sfx from '../utils/soundEffects';
import {
  Radio,
  Mic,
  MicOff,
  PhoneCall,
  PhoneOff,
  Play,
  RotateCcw,
  Sparkles,
  Zap,
  Activity,
  ShieldAlert,
  HelpCircle,
  FileText,
  Volume2,
  VolumeX,
  Lock,
  Signal,
  CheckCircle2
} from 'lucide-react';

const CallMonitorPage = () => {
  const { user, emergencyMode } = useAuth();
  const navigate = useNavigate();

  const {
    activeSession,
    isMonitoring,
    currentCaller,
    peakRiskScore,
    latestAnalysis,
    chunksHistory,
    activeAcousticMetrics,
    isChallengeModalOpen,
    setIsChallengeModalOpen,
    currentChallenge,
    guardianAlertSent,
    callStatus,
    startCallSession,
    processChunk,
    triggerVerificationChallenge,
    alertGuardian,
    terminateCall,
    finalizeCall,
    resetCallSession,
    speakWarning
  } = useCallSession();

  const [scenarios, setScenarios] = useState([]);
  const [selectedScenario, setSelectedScenario] = useState(null);
  const [isSimulating, setIsSimulating] = useState(false);
  const [isMicLive, setIsMicLive] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [visualizerMode, setVisualizerMode] = useState('waveform');
  const [audioEnabled, setAudioEnabled] = useState(true);

  const simulationIntervalRef = useRef(null);
  const callTimerRef = useRef(null);
  const micIntervalRef = useRef(null);

  // Fetch scenarios on mount
  useEffect(() => {
    const fetchScenarios = async () => {
      try {
        const res = await axiosInstance.get('/enterprise/scenarios');
        if (res.data.success) {
          setScenarios(res.data.scenarios);
          if (res.data.scenarios.length > 0) {
            setSelectedScenario(res.data.scenarios[0]);
          }
        }
      } catch (err) {
        console.error('Failed to load scenarios:', err);
      }
    };
    fetchScenarios();
  }, []);

  // Call duration stopwatch
  useEffect(() => {
    if (isMonitoring) {
      callTimerRef.current = setInterval(() => {
        setCallDuration((prev) => prev + 1);
      }, 1000);
    } else {
      if (callTimerRef.current) clearInterval(callTimerRef.current);
    }
    return () => {
      if (callTimerRef.current) clearInterval(callTimerRef.current);
    };
  }, [isMonitoring]);

  // Clean up timers & speech on unmount
  useEffect(() => {
    return () => {
      if (simulationIntervalRef.current) clearInterval(simulationIntervalRef.current);
      if (micIntervalRef.current) clearInterval(micIntervalRef.current);
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
      audioProcessor.stopMic();
    };
  }, []);

  // Voice synthesizer for spoken scenario audio
  const speakDialogue = (text, isFake = true) => {
    if (!audioEnabled || typeof window === 'undefined' || !window.speechSynthesis) return;
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.05;
      utterance.pitch = isFake ? 1.25 : 1.0; // Artificial pitch lift for cloned voice
      utterance.volume = 0.9;
      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.warn('Speech synthesis error:', e);
    }
  };

  // 1. Scenario Simulation Runner
  const runScenarioSimulation = async (scenario) => {
    resetCallSession();
    setSelectedScenario(scenario);
    setCallDuration(0);

    // Audio SFX Sonar ping
    sfx.playSonar();

    try {
      const session = await startCallSession(scenario.caller_label, null, scenario);
      setIsSimulating(true);

      let currentChunkIdx = 0;
      const chunks = scenario.chunks || [];

      // Send first chunk immediately
      if (chunks.length > 0) {
        speakDialogue(chunks[0].transcript, scenario.expected_risk > 50);
        await processChunk(
          0,
          chunks[0].transcript,
          chunks[0].acoustic,
          chunks[0].duration_ms
        );
        currentChunkIdx = 1;
      }

      // Stream subsequent chunks sequentially
      simulationIntervalRef.current = setInterval(async () => {
        if (currentChunkIdx < chunks.length) {
          const chunkData = chunks[currentChunkIdx];
          speakDialogue(chunkData.transcript, scenario.expected_risk > 50);

          const analysis = await processChunk(
            currentChunkIdx,
            chunkData.transcript,
            chunkData.acoustic,
            chunkData.duration_ms
          );

          // Audio Warning Siren on elevated threat
          if (analysis?.risk_score >= 75) {
            sfx.playWarningAlert();
          }

          currentChunkIdx++;
        } else {
          // Finished all chunks
          clearInterval(simulationIntervalRef.current);
          setIsSimulating(false);
        }
      }, 3000);

    } catch (err) {
      console.error('Scenario simulation start error:', err);
      setIsSimulating(false);
    }
  };

  // 2. Real Microphone Streaming Toggle
  const toggleLiveMicStream = async () => {
    if (isMicLive) {
      audioProcessor.stopMic();
      setIsMicLive(false);
      sfx.playDisconnect();
      if (micIntervalRef.current) clearInterval(micIntervalRef.current);
      await terminateCall('TERMINATED_BY_USER');
    } else {
      try {
        resetCallSession();
        setCallDuration(0);
        sfx.playSonar();

        await audioProcessor.initMic();
        setIsMicLive(true);
        await startCallSession('Live Telecom Inbound Channel (Microphone Feed)');

        let chunkCounter = 0;
        micIntervalRef.current = setInterval(async () => {
          const features = audioProcessor.getAcousticFeatures();
          const demoTranscripts = [
            "Hello? Yes, I'm calling regarding your account security status.",
            "We detected unauthorized transactions and need you to verify your identity.",
            "Please confirm your security routing numbers immediately before access is locked."
          ];
          const transcriptSegment = demoTranscripts[chunkCounter % demoTranscripts.length];

          await processChunk(chunkCounter, transcriptSegment, features, 2500);
          chunkCounter++;
        }, 2500);

      } catch (err) {
        console.error('Mic stream error:', err);
        setIsMicLive(false);
      }
    }
  };

  const handleManualTerminate = async () => {
    if (simulationIntervalRef.current) clearInterval(simulationIntervalRef.current);
    if (micIntervalRef.current) clearInterval(micIntervalRef.current);
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    setIsSimulating(false);
    if (isMicLive) {
      audioProcessor.stopMic();
      setIsMicLive(false);
    }
    sfx.playDisconnect();
    await terminateCall('TERMINATED_BY_USER');
  };

  const handleCompileForensicReport = async () => {
    const report = await finalizeCall();
    if (report) {
      navigate(`/incidents/${report.id}`);
    }
  };

  const formatTimer = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      
      {/* Top HUD Control Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-3xl bg-[#0b1120]/90 border border-slate-800/90 shadow-2xl backdrop-blur-xl gap-4">
        
        {/* Left Inbound Call Info */}
        <div className="flex items-center space-x-3.5">
          <div className={`p-3 rounded-2xl relative transition-all ${
            isMonitoring
              ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40 ring-2 ring-rose-500/30'
              : 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'
          }`}>
            <Radio className="w-5 h-5" />
            {isMonitoring && (
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-rose-500 rounded-full animate-ping" />
            )}
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-base font-extrabold text-white tracking-tight">Real-Time Call Guardian HUD</h1>
              <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold uppercase ${
                isMonitoring ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40' : 'bg-slate-800 text-slate-400'
              }`}>
                {isMonitoring ? '● INGESTION ACTIVE' : 'STANDBY'}
              </span>
            </div>
            
            {/* Live Carrier Network Meta */}
            <div className="flex items-center space-x-2 text-xs text-slate-400 font-mono mt-0.5">
              <span className="flex items-center space-x-1 text-emerald-400">
                <Signal className="w-3 h-3" />
                <span>5G VoLTE</span>
              </span>
              <span>•</span>
              <span className="text-slate-300 truncate max-w-[240px]">
                {currentCaller || 'Awaiting incoming telecom line...'}
              </span>
            </div>
          </div>
        </div>

        {/* Stopwatch & Action Controls */}
        <div className="flex items-center space-x-3">
          
          {/* Audio Chimes Toggle */}
          <button
            onClick={() => {
              const next = sfx.toggleSound();
              setAudioEnabled(next);
            }}
            title="Toggle synthesized voice & audio chimes"
            className={`p-2 rounded-xl border text-xs transition-colors ${
              audioEnabled ? 'bg-slate-800 text-cyan-400 border-slate-700' : 'bg-slate-900 text-slate-500 border-slate-800'
            }`}
          >
            {audioEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {/* Stopwatch */}
          <div className="px-3.5 py-1.5 rounded-xl bg-slate-950/80 border border-slate-800 font-mono text-xs text-slate-300 flex items-center space-x-1.5 shadow-inner">
            <span className={`w-2 h-2 rounded-full ${isMonitoring ? 'bg-rose-500 animate-pulse' : 'bg-slate-600'}`} />
            <span>DURATION: <strong className="text-white">{formatTimer(callDuration)}</strong></span>
          </div>

          {/* Live Mic Button */}
          <button
            onClick={toggleLiveMicStream}
            className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-bold border transition-all ${
              isMicLive
                ? 'bg-rose-500/20 border-rose-500 text-rose-300 shadow-md shadow-rose-500/30 ring-1 ring-rose-500/50'
                : 'bg-slate-800/80 hover:bg-slate-700 border-slate-700 text-slate-200'
            }`}
          >
            {isMicLive ? <MicOff className="w-4 h-4 text-rose-400" /> : <Mic className="w-4 h-4 text-cyan-400" />}
            <span>{isMicLive ? 'Stop Mic' : 'Live Mic Stream'}</span>
          </button>

          {/* Compile Audit Report Button */}
          {callStatus !== 'IDLE' && (
            <button
              onClick={handleCompileForensicReport}
              className="flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-cyan-500 to-teal-400 text-slate-950 transition-all shadow-lg shadow-cyan-500/20 hover:scale-102 active:scale-98"
            >
              <FileText className="w-4 h-4" />
              <span>Compile Audit Report</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Split-Screen Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column (5 cols): Audio Stream Ingestion & Telemetry */}
        <div className="lg:col-span-5 space-y-5">
          
          {/* Oscilloscope Container */}
          <div className="space-y-2">
            <div className="flex items-center justify-between px-1">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center space-x-1.5">
                <Activity className="w-4 h-4 text-cyan-400" />
                <span>Audio Waveform & Spectral Analyzer</span>
              </span>
              <div className="flex items-center space-x-1 bg-slate-950 rounded-lg p-0.5 border border-slate-800 text-[10px]">
                <button
                  onClick={() => setVisualizerMode('waveform')}
                  className={`px-2.5 py-0.5 rounded font-mono transition-colors ${
                    visualizerMode === 'waveform' ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Wave
                </button>
                <button
                  onClick={() => setVisualizerMode('bars')}
                  className={`px-2.5 py-0.5 rounded font-mono transition-colors ${
                    visualizerMode === 'bars' ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  FFT
                </button>
              </div>
            </div>

            <AudioWaveformVisualizer
              isStreaming={isMonitoring}
              riskScore={peakRiskScore}
              mode={visualizerMode}
              height={125}
            />

            {/* Instantaneous Acoustic Metrics Readout Cards */}
            <div className="grid grid-cols-3 gap-2.5 text-center text-xs font-mono pt-1">
              <div className="p-2.5 rounded-2xl bg-slate-900/70 border border-slate-800 shadow-sm">
                <span className="text-[10px] text-slate-400 block font-sans">PITCH MEAN</span>
                <span className="text-cyan-300 font-extrabold text-sm">{activeAcousticMetrics.pitch_mean_hz} Hz</span>
              </div>
              <div className="p-2.5 rounded-2xl bg-slate-900/70 border border-slate-800 shadow-sm">
                <span className="text-[10px] text-slate-400 block font-sans">PITCH VARIANCE</span>
                <span className={`font-extrabold text-sm ${
                  activeAcousticMetrics.pitch_variance < 5 ? 'text-rose-400' : 'text-emerald-400'
                }`}>
                  {activeAcousticMetrics.pitch_variance}
                </span>
              </div>
              <div className="p-2.5 rounded-2xl bg-slate-900/70 border border-slate-800 shadow-sm">
                <span className="text-[10px] text-slate-400 block font-sans">HARMONIC JITTER</span>
                <span className={`font-extrabold text-sm ${
                  activeAcousticMetrics.jitter > 0.03 ? 'text-rose-400' : 'text-slate-300'
                }`}>
                  {activeAcousticMetrics.jitter}
                </span>
              </div>
            </div>
          </div>

          {/* Sandbox Scenarios Controller */}
          <ScenarioSelector
            scenarios={scenarios}
            onSelectScenario={runScenarioSimulation}
            activeScenarioId={selectedScenario?.id}
            isRunning={isSimulating}
          />

        </div>

        {/* Right Column (7 cols): Real-Time Guardian Intelligence Engine */}
        <div className="lg:col-span-7 space-y-5">
          
          {/* Autonomous Action HUD Banner */}
          <AutonomousActionHUD
            riskScore={peakRiskScore}
            threatCategory={latestAnalysis?.threat_category || 'UNKNOWN_SUSPICIOUS'}
            warningText={latestAnalysis?.heads_up_warning_text}
            warningLocalized={latestAnalysis?.heads_up_warning_localized}
            onTriggerChallenge={triggerVerificationChallenge}
            onAlertGuardian={alertGuardian}
            onTerminateCall={handleManualTerminate}
            guardianAlertSent={guardianAlertSent}
            callStatus={callStatus}
          />

          {/* Radial Risk Scorecard + Explainable Rationale */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            <RiskGauge
              riskScore={peakRiskScore}
              syntheticConfidence={latestAnalysis?.voice_synthetic_confidence || 0}
              urgencyScore={latestAnalysis?.urgency_coercion_score || 0}
              identityDiscrepancy={latestAnalysis?.identity_discrepancy_score || 0}
            />

            {/* Explainable Rationale Deck */}
            <div className="bg-[#0b1120]/90 border border-slate-800/90 rounded-2xl p-5 shadow-2xl flex flex-col justify-between backdrop-blur-md">
              <div>
                <div className="flex items-center space-x-2 mb-3">
                  <ShieldAlert className="w-4 h-4 text-cyan-400" />
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-200">
                    Live Explainable Rationale:
                  </span>
                </div>

                {latestAnalysis?.acoustic_anomalies_detected?.length > 0 ? (
                  <ul className="space-y-2 text-xs">
                    {latestAnalysis.acoustic_anomalies_detected.map((anomaly, idx) => (
                      <li key={idx} className="flex items-start space-x-2 text-slate-200">
                        <span className="text-cyan-400 font-bold shrink-0 mt-0.5">•</span>
                        <span>{anomaly}</span>
                      </li>
                    ))}
                    {latestAnalysis.coercion_tactics_detected?.map((coercion, idx) => (
                      <li key={`c-${idx}`} className="flex items-start space-x-2 text-rose-300 font-medium">
                        <span className="text-rose-400 font-bold shrink-0 mt-0.5">⚠</span>
                        <span>{coercion}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="py-6 text-center text-slate-500 text-xs italic space-y-1">
                    <p>Awaiting live audio stream chunk inference...</p>
                    <p className="text-[11px] text-slate-600">Click a scenario on the left or toggle microphone.</p>
                  </div>
                )}
              </div>

              {latestAnalysis?.suggested_challenge_strategy && (
                <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] text-slate-400">
                  <strong className="text-cyan-400 block mb-0.5 font-semibold">Recommended Countermeasure:</strong>
                  {latestAnalysis.suggested_challenge_strategy}
                </div>
              )}
            </div>

          </div>

          {/* Diarized Real-Time Transcript Stream */}
          <LiveTranscriptFeed
            chunks={chunksHistory}
            isStreaming={isMonitoring}
          />

        </div>

      </div>

      {/* Dynamic Verification Challenge Modal */}
      <ChallengeModal
        isOpen={isChallengeModalOpen}
        onClose={() => setIsChallengeModalOpen(false)}
        challenge={currentChallenge}
        onCallerPassed={() => {
          setIsChallengeModalOpen(false);
          sfx.playSuccess();
          speakWarning("Caller verification challenge passed. Monitoring resumed.");
        }}
        onCallerFailed={() => {
          setIsChallengeModalOpen(false);
          handleManualTerminate();
          speakWarning("Verification challenge failed. Call terminated autonomously.");
        }}
      />

    </div>
  );
};

export default CallMonitorPage;
