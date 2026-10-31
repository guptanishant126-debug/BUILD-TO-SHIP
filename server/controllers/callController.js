import db from '../config/db.js';
import geminiService from '../services/geminiService.js';
import alertNotificationService from '../services/alertNotificationService.js';

export const startSession = async (req, res) => {
  try {
    const { caller_identifier, matched_contact_id } = req.body;

    const sessionResult = await db.query(
      `INSERT INTO call_sessions (user_id, matched_contact_id, caller_identifier)
       VALUES ($1, $2, $3) RETURNING *`,
      [req.user.id, matched_contact_id || null, caller_identifier]
    );

    return res.status(201).json({
      success: true,
      message: 'Call monitoring session initialized',
      session: sessionResult.rows[0]
    });
  } catch (err) {
    console.error('Start call session error:', err);
    return res.status(500).json({ success: false, message: 'Failed to start call session' });
  }
};

export const streamChunk = async (req, res) => {
  const startTime = Date.now();
  try {
    const { id } = req.params;
    const {
      chunk_index,
      transcript_segment,
      acoustic_features,
      duration_ms = 2500
    } = req.body;

    // Verify session
    const sessionRes = await db.query(
      'SELECT * FROM call_sessions WHERE id = $1 AND user_id = $2',
      [id, req.user.id]
    );
    if (sessionRes.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Call session not found' });
    }
    const session = sessionRes.rows[0];

    // Fetch user settings for language preference
    const userRes = await db.query('SELECT * FROM users WHERE id = $1', [req.user.id]);
    const user = userRes.rows[0] || {};
    const userLanguage = user.preferred_language || 'en';

    // Fetch contact baseline if session has matched contact
    let matchedContactName = null;
    let enrolledBaseline = null;
    if (session.matched_contact_id) {
      const contactRes = await db.query('SELECT * FROM trusted_contacts WHERE id = $1', [session.matched_contact_id]);
      if (contactRes.rows.length > 0) {
        matchedContactName = contactRes.rows[0].full_name;
        const baselineRes = await db.query('SELECT * FROM voice_enclave_profiles WHERE contact_id = $1', [session.matched_contact_id]);
        if (baselineRes.rows.length > 0) {
          enrolledBaseline = baselineRes.rows[0];
        }
      }
    }

    // Fetch last 3 chunks context
    const previousChunksRes = await db.query(
      `SELECT transcript_segment FROM audio_chunks_telemetry 
       WHERE call_session_id = $1 
       ORDER BY chunk_index DESC LIMIT 3`,
      [id]
    );
    const recentTranscriptContext = previousChunksRes.rows
      .reverse()
      .map(c => c.transcript_segment)
      .join(' | ');

    // Call Gemini 2.5 Flash analysis
    const aiAnalysis = await geminiService.analyzeStreamChunk({
      caller_identifier: session.caller_identifier,
      matched_contact_name: matchedContactName,
      enrolled_baseline: enrolledBaseline,
      acoustic_metrics: acoustic_features,
      recent_transcript_context: recentTranscriptContext,
      current_chunk_transcript: transcript_segment,
      user_language: userLanguage
    });

    const latencyMs = Date.now() - startTime;

    // Save chunk telemetry to DB
    const chunkInsert = await db.query(
      `INSERT INTO audio_chunks_telemetry (
         call_session_id, chunk_index, transcript_segment, chunk_risk_score,
         synthetic_confidence, urgency_coercion_score, identity_discrepancy_score,
         detected_threat_cues, acoustic_features, latency_ms
       ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *`,
      [
        id,
        chunk_index,
        transcript_segment,
        aiAnalysis.risk_score,
        aiAnalysis.voice_synthetic_confidence,
        aiAnalysis.urgency_coercion_score,
        aiAnalysis.identity_discrepancy_score,
        [...(aiAnalysis.acoustic_anomalies_detected || []), ...(aiAnalysis.coercion_tactics_detected || [])],
        acoustic_features,
        latencyMs
      ]
    );

    // Update session peak risk score and threat category
    const newPeak = Math.max(session.peak_risk_score || 0, aiAnalysis.risk_score);
    await db.query(
      `UPDATE call_sessions 
       SET peak_risk_score = $1, final_threat_category = $2, duration_seconds = duration_seconds + $3
       WHERE id = $4`,
      [newPeak, aiAnalysis.threat_category, Math.round(duration_ms / 1000), id]
    );

    // Check autonomous intervention thresholds
    const autoTerminateThreshold = user.auto_terminate_threshold || 85;
    let autonomousActionTriggered = null;

    if (aiAnalysis.risk_score >= autoTerminateThreshold) {
      autonomousActionTriggered = 'AUTONOMOUS_BLOCKED';
      await db.query(
        `UPDATE call_sessions SET was_autonomous_action_taken = TRUE, status = 'AUTONOMOUSLY_BLOCKED' WHERE id = $1`,
        [id]
      );
      // Auto dispatch guardian alert
      await alertNotificationService.dispatchGuardianAlert({
        call_session_id: id,
        user,
        reason: `Autonomous block executed: Risk Score reached ${aiAnalysis.risk_score}% (${aiAnalysis.threat_category})`,
        current_risk_score: aiAnalysis.risk_score,
        transcript_snippet: transcript_segment
      });
    }

    return res.json({
      success: true,
      session_id: id,
      chunk_index,
      latency_ms: latencyMs,
      telemetry: chunkInsert.rows[0],
      analysis: aiAnalysis,
      autonomous_action: autonomousActionTriggered
    });
  } catch (err) {
    console.error('Stream chunk error:', err);
    return res.status(500).json({ success: false, message: 'Failed to process audio chunk telemetry', error: err.message });
  }
};

export const triggerChallenge = async (req, res) => {
  try {
    const { id } = req.params;

    const sessionRes = await db.query('SELECT * FROM call_sessions WHERE id = $1 AND user_id = $2', [id, req.user.id]);
    if (sessionRes.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Session not found' });
    }
    const session = sessionRes.rows[0];

    // Fetch user language
    const userRes = await db.query('SELECT * FROM users WHERE id = $1', [req.user.id]);
    const userLanguage = userRes.rows[0]?.preferred_language || 'en';

    // Fetch enrolled challenges for matched contact if available
    let enrolledChallenges = [];
    let claimedIdentity = session.caller_identifier;
    if (session.matched_contact_id) {
      const contactRes = await db.query('SELECT * FROM trusted_contacts WHERE id = $1', [session.matched_contact_id]);
      if (contactRes.rows.length > 0) {
        claimedIdentity = contactRes.rows[0].full_name;
      }
      const challengesRes = await db.query('SELECT * FROM verification_challenges WHERE contact_id = $1', [session.matched_contact_id]);
      enrolledChallenges = challengesRes.rows;
    }

    // Recent transcript
    const lastChunk = await db.query(
      `SELECT transcript_segment FROM audio_chunks_telemetry WHERE call_session_id = $1 ORDER BY chunk_index DESC LIMIT 1`,
      [id]
    );
    const transcriptSnippet = lastChunk.rows[0]?.transcript_segment || 'Caller claims urgent emergency.';

    const challenge = await geminiService.generateVerificationChallenge({
      risk_score: session.peak_risk_score || 75,
      claimed_identity: claimedIdentity,
      enrolled_challenges: enrolledChallenges,
      transcript_snippet: transcriptSnippet,
      user_language: userLanguage
    });

    return res.json({
      success: true,
      challenge
    });
  } catch (err) {
    console.error('Trigger challenge error:', err);
    return res.status(500).json({ success: false, message: 'Failed to generate verification challenge' });
  }
};

export const alertGuardian = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason, current_risk_score, transcript_snippet } = req.body;

    const userRes = await db.query('SELECT * FROM users WHERE id = $1', [req.user.id]);
    if (userRes.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    const user = userRes.rows[0];

    const dispatchResult = await alertNotificationService.dispatchGuardianAlert({
      call_session_id: id,
      user,
      reason,
      current_risk_score,
      transcript_snippet
    });

    return res.json({
      success: true,
      message: 'Guardian alert successfully dispatched across secure notification channels',
      dispatch: dispatchResult
    });
  } catch (err) {
    console.error('Alert guardian error:', err);
    return res.status(500).json({ success: false, message: 'Failed to dispatch guardian alert' });
  }
};

export const terminateCall = async (req, res) => {
  try {
    const { id } = req.params;
    const { action_type = 'TERMINATED_BY_USER' } = req.body;

    const result = await db.query(
      `UPDATE call_sessions 
       SET status = $1, ended_at = CURRENT_TIMESTAMP 
       WHERE id = $2 AND user_id = $3 RETURNING *`,
      [action_type, id, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Call session not found' });
    }

    return res.json({
      success: true,
      message: 'Call terminated successfully. Threat neutralized.',
      session: result.rows[0]
    });
  } catch (err) {
    console.error('Terminate call error:', err);
    return res.status(500).json({ success: false, message: 'Failed to terminate call' });
  }
};

export const finalizeCall = async (req, res) => {
  try {
    const { id } = req.params;

    const sessionRes = await db.query('SELECT * FROM call_sessions WHERE id = $1 AND user_id = $2', [id, req.user.id]);
    if (sessionRes.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Call session not found' });
    }
    const session = sessionRes.rows[0];

    // Fetch all chunks
    const chunksRes = await db.query(
      `SELECT * FROM audio_chunks_telemetry WHERE call_session_id = $1 ORDER BY chunk_index ASC`,
      [id]
    );
    const chunks = chunksRes.rows;

    const fullTranscript = chunks.map(c => `[Chunk ${c.chunk_index}]: ${c.transcript_segment}`).join('\n');

    // Fetch user language
    const userRes = await db.query('SELECT * FROM users WHERE id = $1', [req.user.id]);
    const userLanguage = userRes.rows[0]?.preferred_language || 'en';

    // Call Gemini 2.5 Pro forensic report compiler
    const forensicAnalysis = await geminiService.compileForensicIncidentReport({
      call_session_id: id,
      duration_seconds: session.duration_seconds || (chunks.length * 2.5),
      call_status: session.status,
      telemetry_chunks: chunks,
      full_transcript: fullTranscript || 'No speech recorded during session.',
      user_language: userLanguage
    });

    // Check if report already exists for this session
    const existingReport = await db.query('SELECT * FROM incident_reports WHERE call_session_id = $1', [id]);
    let report;

    if (existingReport.rows.length > 0) {
      report = existingReport.rows[0];
    } else {
      const reportRes = await db.query(
        `INSERT INTO incident_reports (
           call_session_id, user_id, overall_risk_score, primary_threat_category,
           executive_summary, forensic_explanation, full_transcript,
           money_demanded_cents, money_demanded_currency, action_taken,
           guardian_notified, bank_webhook_dispatched, report_language
         ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13) RETURNING *`,
        [
          id,
          req.user.id,
          forensicAnalysis.overall_risk_score,
          forensicAnalysis.primary_threat_category,
          forensicAnalysis.executive_summary,
          forensicAnalysis.forensic_breakdown,
          fullTranscript,
          forensicAnalysis.money_demanded_cents || 0,
          forensicAnalysis.money_demanded_currency || 'USD',
          session.status,
          true,
          forensicAnalysis.overall_risk_score >= 60,
          userLanguage
        ]
      );
      report = reportRes.rows[0];
    }

    return res.json({
      success: true,
      message: 'Forensic incident report compiled and archived',
      report,
      forensic_details: forensicAnalysis
    });
  } catch (err) {
    console.error('Finalize call error:', err);
    return res.status(500).json({ success: false, message: 'Failed to compile forensic report', error: err.message });
  }
};

