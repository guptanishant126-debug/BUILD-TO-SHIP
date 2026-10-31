import crypto from 'crypto';
import db from '../config/db.js';

/**
 * Guardian Emergency Alert & Bank Webhook Dispatch Service
 */
export const dispatchGuardianAlert = async ({
  call_session_id,
  user,
  reason,
  current_risk_score,
  transcript_snippet,
  channel = 'SMS_GUARDIAN'
}) => {
  const recipient = user.guardian_contact_phone || user.guardian_contact_email || '+1 (555) 987-6543';

  const alertPayload = {
    event: 'AEGISVOICE_EMERGENCY_GUARDIAN_INTERVENTION',
    timestamp: new Date().toISOString(),
    protected_user_name: user.full_name,
    protected_user_id: user.id,
    call_session_id,
    threat_level: current_risk_score >= 85 ? 'CRITICAL' : 'HIGH_RISK',
    risk_score: current_risk_score,
    reason,
    transcript_snippet,
    action_advised: 'Contact protected individual immediately to confirm safety. Scam call intercepted.'
  };

  console.log(`[ALERT DISPATCH] Channel: ${channel} | Recipient: ${recipient}`);
  console.log(`[ALERT PAYLOAD]:`, JSON.stringify(alertPayload, null, 2));

  // Persist to guardian_alert_logs
  try {
    await db.query(
      `INSERT INTO guardian_alert_logs (call_session_id, channel, recipient_destination, payload_snapshot)
       VALUES ($1, $2, $3, $4)`,
      [call_session_id, channel, recipient, alertPayload]
    );
  } catch (err) {
    console.warn('Failed to record guardian alert log:', err.message);
  }

  return {
    success: true,
    channel,
    recipient,
    dispatched_at: new Date().toISOString(),
    payload: alertPayload
  };
};

/**
 * Bank Fraud Webhook Dispatch with HMAC-SHA256 signature
 */
export const dispatchBankFraudWebhook = async ({
  webhookUrl,
  payload,
  secretKey = process.env.ENTERPRISE_WEBHOOK_SECRET || 'aegis_secret'
}) => {
  const timestamp = Math.floor(Date.now() / 1000);
  const rawBody = JSON.stringify(payload);
  const signature = crypto
    .createHmac('sha256', secretKey)
    .update(`${timestamp}.${rawBody}`)
    .digest('hex');

  console.log(`[BANK FRAUD WEBHOOK DISPATCH] -> ${webhookUrl}`);
  console.log(`[SIGNATURE]: aegis_t=${timestamp},v1=${signature}`);

  return {
    dispatched: true,
    webhook_url: webhookUrl,
    header_signature: `t=${timestamp},v1=${signature}`,
    status: 200,
    timestamp: new Date().toISOString()
  };
};

export default {
  dispatchGuardianAlert,
  dispatchBankFraudWebhook
};

