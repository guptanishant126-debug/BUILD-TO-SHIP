import crypto from 'crypto';
import db from '../config/db.js';

export const listIncidents = async (req, res) => {
  try {
    const { category, min_risk } = req.query;

    let sql = `SELECT ir.*, cs.caller_identifier, cs.started_at, cs.ended_at, cs.duration_seconds
               FROM incident_reports ir
               JOIN call_sessions cs ON ir.call_session_id = cs.id
               WHERE ir.user_id = $1`;
    const params = [req.user.id];

    if (category) {
      params.push(category);
      sql += ` AND ir.primary_threat_category = $${params.length}`;
    }

    if (min_risk) {
      params.push(parseInt(min_risk, 10));
      sql += ` AND ir.overall_risk_score >= $${params.length}`;
    }

    sql += ` ORDER BY ir.created_at DESC`;

    const result = await db.query(sql, params);
    return res.json({ success: true, count: result.rows.length, incidents: result.rows });
  } catch (err) {
    console.error('List incidents error:', err);
    return res.status(500).json({ success: false, message: 'Failed to retrieve incident audit logs' });
  }
};

export const getIncidentDetail = async (req, res) => {
  try {
    const { id } = req.params;

    // Fetch incident
    const reportRes = await db.query(
      `SELECT ir.*, cs.caller_identifier, cs.started_at, cs.ended_at, cs.duration_seconds, cs.matched_contact_id
       FROM incident_reports ir
       JOIN call_sessions cs ON ir.call_session_id = cs.id
       WHERE ir.id = $1 AND (ir.user_id = $2 OR $3 = 'FAMILY_GUARDIAN' OR $3 = 'ENTERPRISE_ANALYST')`,
      [id, req.user.id, req.user.role]
    );

    if (reportRes.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Incident record not found or access denied' });
    }
    const report = reportRes.rows[0];

    // Fetch all audio chunks telemetry for timeline scrubber
    const chunksRes = await db.query(
      `SELECT * FROM audio_chunks_telemetry 
       WHERE call_session_id = $1 
       ORDER BY chunk_index ASC`,
      [report.call_session_id]
    );

    // Fetch matched contact details if any
    let matchedContact = null;
    if (report.matched_contact_id) {
      const contactRes = await db.query('SELECT id, full_name, relationship, phone_number FROM trusted_contacts WHERE id = $1', [report.matched_contact_id]);
      if (contactRes.rows.length > 0) {
        matchedContact = contactRes.rows[0];
      }
    }

    return res.json({
      success: true,
      incident: report,
      timeline_chunks: chunksRes.rows,
      matched_contact: matchedContact
    });
  } catch (err) {
    console.error('Get incident detail error:', err);
    return res.status(500).json({ success: false, message: 'Failed to retrieve incident details' });
  }
};

export const exportIncidentJson = async (req, res) => {
  try {
    const { id } = req.params;

    const reportRes = await db.query(
      `SELECT ir.*, cs.caller_identifier, cs.started_at, cs.ended_at, cs.duration_seconds
       FROM incident_reports ir
       JOIN call_sessions cs ON ir.call_session_id = cs.id
       WHERE ir.id = $1 AND ir.user_id = $2`,
      [id, req.user.id]
    );

    if (reportRes.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Incident not found' });
    }
    const report = reportRes.rows[0];

    const chunksRes = await db.query(
      `SELECT chunk_index, chunk_risk_score, synthetic_confidence, urgency_coercion_score, transcript_segment, acoustic_features, latency_ms
       FROM audio_chunks_telemetry WHERE call_session_id = $1 ORDER BY chunk_index ASC`,
      [report.call_session_id]
    );

    const exportBundle = {
      spec_version: 'AegisVoice-Forensic-v1.0',
      exported_at: new Date().toISOString(),
      incident_id: report.id,
      session_id: report.call_session_id,
      threat_assessment: {
        peak_risk: report.overall_risk_score,
        category: report.primary_threat_category,
        action_taken: report.action_taken,
        money_demanded: {
          cents: report.money_demanded_cents,
          currency: report.money_demanded_currency
        }
      },
      forensic_explanation: report.forensic_explanation,
      transcript_evidence: report.full_transcript,
      telemetry_stream: chunksRes.rows
    };

    const cryptographicSignature = crypto
      .createHash('sha256')
      .update(JSON.stringify(exportBundle))
      .digest('hex');

    exportBundle.audit_integrity_sha256 = cryptographicSignature;

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="aegisvoice-incident-${id.substring(0, 8)}.json"`);
    return res.send(JSON.stringify(exportBundle, null, 2));
  } catch (err) {
    console.error('Export incident error:', err);
    return res.status(500).json({ success: false, message: 'Failed to export forensic bundle' });
  }
};

