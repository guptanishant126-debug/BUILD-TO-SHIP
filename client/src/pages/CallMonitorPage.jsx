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
  FileText
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
  const [finalReport, setFinalReport] = useState(null);

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
        setCallDuration(prev => prev + 1);
      }, 1000);
    } else {
      if (callTimerRef.current) clearInterval(callTimerRef.current);
    }
    return () => {
      if (callTimerRef.current) clearInterval(callTimerRef.current);
    };
  }, [isMonitoring]);

  // Clean up timers on unmount
  useEffect(() => {
    return () => {
      if (simulationIntervalRef.current) clearInterval(simulationIntervalRef.current);
      if (micIntervalRef.current) clearInterval(micIntervalRef.current);
      audioProcessor.stopMic();
    };
  }, []);

  // 1. Scenario Simulation Runner
  const runScenarioSimulation = async (scenario) => {
    resetCallSession();
    setSelectedScenario(scenario);
    setCallDuration(0);
    setFinalReport(null);

    try {
      const session = await startCallSession(scenario.caller_label, null, scenario);
      setIsSimulating(true);

      let currentChunkIdx = 0;
      const chunks = scenario.chunks || [];

      // Send first chunk immediately
      if (chunks.length > 0) {
        await processChunk(
          0,
          chunks[0].transcript,
          chunks[0].acoustic,
          chunks[0].duration_ms
        );
        currentChunkIdx = 1;
      }

      // Stream subsequent chunks sequentially every 2.8s
      simulationIntervalRef.current = setInterval(async () => {
        if (currentChunkIdx < chunks.length) {
          const chunkData = chunks[currentChunkIdx];
          await processChunk(
            currentChunkIdx,
            chunkData.transcript,
            chunkData.acoustic,
            chunkData.duration_ms
          );
          currentChunkIdx++;
        } else {
          // Finished all chunks in scenario
          clearInterval(simulationIntervalRef.current);
          setIsSimulating(false);
        }
      }, 2800);

    } catch (err) {
      console.error('Scenario simulation start error:', err);
      setIsSimulating(false);
    }
  };

  // 2. Real Microphone Streaming Toggle
  const toggleLiveMicStream = async () => {
    if (isMicLive) {
      // Stop live mic
      audioProcessor.stopMic();
      setIsMicLive(false);
      if (micIntervalRef.current) clearInterval(micIntervalRef.current);
      await terminateCall('TERMINATED_BY_USER');
    } else {
      // Start live mic session
      try {
        resetCallSession();
        setCallDuration(0);
        setFinalReport(null);

        await audioProcessor.initMic();
        setIsMicLive(true);
        await startCallSession('Live Telecom Inbound Channel (Mic Test)');

        let chunkCounter = 0;
        // Ingest audio chunk every 2.5 seconds
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
    setIsSimulating(false);
    if (isMicLive) {
      audioProcessor.stopMic();
      setIsMicLive(false);
    }
    await terminateCall('TERMINATED_BY_USER');
  };

  const handleCompileForensicReport = async () => {
    const report = await finalizeCall();
    if (report) {
      setFinalReport(report);
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-2xl bg-slate-900/80 border border-slate-800 gap-4">
        <div className="flex items-center space-x-3">
          <div className={`p-2.5 rounded-xl ${
            isMonitoring
              ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40 animate-pulse'
              : 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'
          }`}>
            <Radio className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-base font-bold text-white tracking-tight">Real-Time Call Guardian HUD</h1>
              <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold uppercase ${
                isMonitoring ? 'bg-rose-500 text-white' : 'bg-slate-800 text-slate-400'
              }`}>
                {isMonitoring ? 'STREAM INGEST ACTIVE' : 'STANDBY'}
              </span>
            </div>
            <p className="text-xs text-slate-400 font-mono">
              Inbound Caller: <strong className="text-cyan-300">{currentCaller || 'Awaiting Connection...'}</strong>
            </p>
          </div>
        </div>

        {/* Stopwatch & Action Buttons */}
        <div className="flex items-center space-x-3">
          <div className="px-3 py-1.5 rounded-xl bg-slate-950/70 border border-slate-800 font-mono text-xs text-slate-300 flex items-center space-x-1.5">
            <span className={`w-2 h-2 rounded-full ${isMonitoring ? 'bg-rose-500 animate-ping' : 'bg-slate-600'}`} />
            <span>DURATION: {formatTimer(callDuration)}</span>
          </div>

          {/* Live Mic Button */}
          <button
            onClick={toggleLiveMicStream}
            className={`flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition-all ${
              isMicLive
                ? 'bg-rose-500/20 border-rose-500 text-rose-300 shadow-md shadow-rose-500/30'
                : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-300'
            }`}
          >
            {isMicLive ? <MicOff className="w-4 h-4 text-rose-400" /> : <Mic className="w-4 h-4 text-cyan-400" />}
            <span>{isMicLive ? 'Stop Live Mic' : 'Live Mic Stream'}</span>
          </button>

          {/* Reset / Finalize */}
          {callStatus !== 'IDLE' && (
            <button
              onClick={handleCompileForensicReport}
              className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-cyan-500 hover:bg-cyan-400 text-slate-950 transition-colors shadow-lg shadow-cyan-500/20"
            >
              <FileText className="w-4 h-4" />
              <span>Compile Audit Report</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Split-Screen Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column (5 cols): Audio Stream Ingestion & Acoustic Telemetry */}
        <div className="lg:col-span-5 space-y-5">
          
          {/* Waveform & Oscilloscope Box */}
          <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4 shadow-lg space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center space-x-1.5">
                <Activity className="w-4 h-4 text-cyan-400" />
                <span>Acoustic Oscilloscope</span>
              </span>
              <div className="flex items-center space-x-1 bg-slate-950 rounded-lg p-0.5 border border-slate-800 text-[10px]">
                <button
                  onClick={() => setVisualizerMode('waveform')}
                  className={`px-2 py-0.5 rounded font-mono ${
                    visualizerMode === 'waveform' ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-400'
                  }`}
                >
                  Wave
                </button>
                <button
                  onClick={() => setVisualizerMode('bars')}
                  className={`px-2 py-0.5 rounded font-mono ${
                    visualizerMode === 'bars' ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-400'
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
              height={110}
            />

            {/* Instantaneous Acoustic Metrics Readout */}
            <div className="grid grid-cols-3 gap-2 text-center text-xs font-mono pt-2 border-t border-slate-800/80">
              <div className="p-2 rounded-xl bg-slate-950/60 border border-slate-800">
                <span className="text-[10px] text-slate-500 block">PITCH MEAN</span>
                <span className="text-cyan-300 font-bold">{activeAcousticMetrics.pitch_mean_hz} Hz</span>
              </div>
              <div className="p-2 rounded-xl bg-slate-950/60 border border-slate-800">
                <span className="text-[10px] text-slate-500 block">PITCH VAR</span>
                <span className={`font-bold ${activeAcousticMetrics.pitch_variance < 5 ? 'text-rose-400' : 'text-emerald-400'}`}>
                  {activeAcousticMetrics.pitch_variance}
                </span>
              </div>
              <div className="p-2 rounded-xl bg-slate-950/60 border border-slate-800">
                <span className="text-[10px] text-slate-500 block">JITTER</span>
                <span className={`font-bold ${activeAcousticMetrics.jitter > 0.03 ? 'text-rose-400' : 'text-slate-300'}`}>
                  {activeAcousticMetrics.jitter}
                </span>
              </div>
            </div>
          </div>

          {/* Scenario Sandbox Simulator Controls */}
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

          {/* Radial Risk Gauge + Real-Time Telemetry Breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            <RiskGauge
              riskScore={peakRiskScore}
              syntheticConfidence={latestAnalysis?.voice_synthetic_confidence || 0}
              urgencyScore={latestAnalysis?.urgency_coercion_score || 0}
              identityDiscrepancy={latestAnalysis?.identity_discrepancy_score || 0}
            />

            {/* Real-time Explainable Forensic Insights */}
            <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 shadow-lg flex flex-col justify-between">
              <div>
                <div className="flex items-center space-x-2 mb-3">
                  <ShieldAlert className="w-4 h-4 text-cyan-400" />
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                    Why this call is evaluated as risky:
                  </span>
                </div>

                {latestAnalysis?.acoustic_anomalies_detected?.length > 0 ? (
                  <ul className="space-y-2 text-xs">
                    {latestAnalysis.acoustic_anomalies_detected.map((anomaly, idx) => (
                      <li key={idx} className="flex items-start space-x-2 text-slate-300">
                        <span className="text-cyan-400 font-bold shrink-0 mt-0.5">•</span>
                        <span>{anomaly}</span>
                      </li>
                    ))}
                    {latestAnalysis.coercion_tactics_detected?.map((coercion, idx) => (
                      <li key={`c-${idx}`} className="flex items-start space-x-2 text-rose-300">
                        <span className="text-rose-400 font-bold shrink-0 mt-0.5">⚠</span>
                        <span>{coercion}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-xs text-slate-500 italic">
                    Awaiting audio stream inference from Gemini 2.5 Flash...
                  </p>
                )}
              </div>

              {latestAnalysis?.suggested_challenge_strategy && (
                <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] text-slate-400">
                  <strong className="text-cyan-400 block mb-0.5">Recommended Countermeasure:</strong>
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

