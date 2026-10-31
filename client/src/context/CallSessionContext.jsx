import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import axiosInstance from '../api/axiosInstance';
import { useAuth } from './AuthContext';

const CallSessionContext = createContext(null);

export const CallSessionProvider = ({ children }) => {
  const { user, emergencyMode } = useAuth();

  const [activeSession, setActiveSession] = useState(null);
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [currentCaller, setCurrentCaller] = useState('');
  const [matchedContact, setMatchedContact] = useState(null);
  const [currentScenario, setCurrentScenario] = useState(null);

  const [peakRiskScore, setPeakRiskScore] = useState(0);
  const [latestAnalysis, setLatestAnalysis] = useState(null);
  const [chunksHistory, setChunksHistory] = useState([]);
  const [activeAcousticMetrics, setActiveAcousticMetrics] = useState({
    pitch_mean_hz: 180,
    pitch_variance: 12,
    spectral_centroid: 1650,
    zero_crossing_rate: 0.07,
    jitter: 0.015,
    shimmer: 0.03
  });

  // Modal & Alerts
  const [isChallengeModalOpen, setIsChallengeModalOpen] = useState(false);
  const [currentChallenge, setCurrentChallenge] = useState(null);
  const [guardianAlertSent, setGuardianAlertSent] = useState(false);
  const [callStatus, setCallStatus] = useState('IDLE'); // IDLE, ACTIVE, BLOCKED, TERMINATED, FINALIZED

  const speechSynthRef = useRef(null);

  // Spoken voice warnings for elderly emergency mode
  const speakWarning = (text) => {
    if (!emergencyMode || !window.speechSynthesis) return;
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.95;
      utterance.pitch = 1.0;
      utterance.volume = 1.0;
      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.warn('Speech synthesis warning failed:', e);
    }
  };

  const startCallSession = async (callerIdentifier, contactId = null, scenario = null) => {
    try {
      const res = await axiosInstance.post('/call/session/start', {
        caller_identifier: callerIdentifier,
        matched_contact_id: contactId
      });

      if (res.data.success) {
        const session = res.data.session;
        setActiveSession(session);
        setCurrentCaller(callerIdentifier);
        setCurrentScenario(scenario);
        setIsMonitoring(true);
        setCallStatus('ACTIVE');
        setPeakRiskScore(0);
        setLatestAnalysis(null);
        setChunksHistory([]);
        setGuardianAlertSent(false);
        return session;
      }
    } catch (err) {
      console.error('Failed to start call session:', err);
      throw err;
    }
  };

  const processChunk = async (chunkIndex, transcript, acousticData, durationMs = 2500) => {
    if (!activeSession) return;

    setActiveAcousticMetrics(acousticData);

    try {
      const res = await axiosInstance.post(`/call/session/${activeSession.id}/stream-chunk`, {
        chunk_index: chunkIndex,
        transcript_segment: transcript,
        acoustic_features: acousticData,
        duration_ms: durationMs,
        client_timestamp: new Date().toISOString()
      });

      if (res.data.success) {
        const analysis = res.data.analysis;
        setLatestAnalysis(analysis);
        setPeakRiskScore(prev => Math.max(prev, analysis.risk_score));
        
        setChunksHistory(prev => [
          ...prev,
          {
            chunk_index: chunkIndex,
            transcript,
            acoustic: acousticData,
            analysis,
            timestamp: new Date()
          }
        ]);

        // Emergency Mode Spoken Audio Feedback
        if (emergencyMode && analysis.risk_score >= 70) {
          const warningSpoken = analysis.heads_up_warning_localized || analysis.heads_up_warning_text;
          speakWarning(warningSpoken);
        }

        // Autonomous termination triggered by backend threshold
        if (res.data.autonomous_action === 'AUTONOMOUS_BLOCKED') {
          setCallStatus('BLOCKED');
          setIsMonitoring(false);
          setGuardianAlertSent(true);
          speakWarning("Autonomous call shutdown initiated. Potential scam neutralized.");
        }

        return analysis;
      }
    } catch (err) {
      console.error('Failed to process chunk:', err);
    }
  };

  const triggerVerificationChallenge = async () => {
    if (!activeSession) return;
    try {
      const res = await axiosInstance.post(`/call/session/${activeSession.id}/trigger-challenge`);
      if (res.data.success) {
        setCurrentChallenge(res.data.challenge);
        setIsChallengeModalOpen(true);
        return res.data.challenge;
      }
    } catch (err) {
      console.error('Error generating challenge question:', err);
    }
  };

  const alertGuardian = async () => {
    if (!activeSession) return;
    try {
      const res = await axiosInstance.post(`/call/session/${activeSession.id}/alert-guardian`, {
        reason: `Manual or high-risk alert triggered by protected user. Risk: ${peakRiskScore}%`,
        current_risk_score: peakRiskScore,
        transcript_snippet: chunksHistory[chunksHistory.length - 1]?.transcript || 'Scam in progress'
      });
      if (res.data.success) {
        setGuardianAlertSent(true);
        return res.data;
      }
    } catch (err) {
      console.error('Failed to alert guardian:', err);
    }
  };

  const terminateCall = async (actionType = 'TERMINATED_BY_USER') => {
    if (!activeSession) return;
    try {
      const res = await axiosInstance.post(`/call/session/${activeSession.id}/terminate`, {
        action_type: actionType,
        final_reason: `Call ended with peak threat score: ${peakRiskScore}%`
      });
      if (res.data.success) {
        setIsMonitoring(false);
        setCallStatus(actionType === 'AUTONOMOUSLY_BLOCKED' ? 'BLOCKED' : 'TERMINATED');
        return res.data.session;
      }
    } catch (err) {
      console.error('Failed to terminate call:', err);
    }
  };

  const finalizeCall = async () => {
    if (!activeSession) return null;
    try {
      const res = await axiosInstance.post(`/call/session/${activeSession.id}/finalize`);
      if (res.data.success) {
        setCallStatus('FINALIZED');
        return res.data.report;
      }
    } catch (err) {
      console.error('Failed to finalize call report:', err);
    }
  };

  const resetCallSession = () => {
    setActiveSession(null);
    setIsMonitoring(false);
    setCurrentCaller('');
    setMatchedContact(null);
    setCurrentScenario(null);
    setPeakRiskScore(0);
    setLatestAnalysis(null);
    setChunksHistory([]);
    setIsChallengeModalOpen(false);
    setCurrentChallenge(null);
    setGuardianAlertSent(false);
    setCallStatus('IDLE');
  };

  return (
    <CallSessionContext.Provider value={{
      activeSession,
      isMonitoring,
      currentCaller,
      matchedContact,
      currentScenario,
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
    }}>
      {children}
    </CallSessionContext.Provider>
  );
};

export const useCallSession = () => useContext(CallSessionContext);
export default CallSessionContext;

