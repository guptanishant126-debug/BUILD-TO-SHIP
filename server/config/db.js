import pg from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const { Pool } = pg;

let pool = null;
let isPostgresConnected = false;

// In-Memory Storage Adapter for resilient zero-dependency execution
class InMemoryStore {
  constructor() {
    this.users = [];
    this.trusted_contacts = [];
    this.voice_enclave_profiles = [];
    this.verification_challenges = [];
    this.call_sessions = [];
    this.audio_chunks_telemetry = [];
    this.incident_reports = [];
    this.guardian_alert_logs = [];
    this.enterprise_api_keys = [];
    this.seedInitialData();
  }

  async seedInitialData() {
    const salt = await bcrypt.genSalt(12);
    const demoPasswordHash = await bcrypt.hash('AegisPass123!', salt);

    const demoUserId = '11111111-1111-4111-a111-111111111111';
    const demoGuardianId = '22222222-2222-4222-a222-222222222222';
    const demoAnalystId = '33333333-3333-4333-a333-333333333333';

    // 1. Demo Users
    this.users.push(
      {
        id: demoUserId,
        email: 'eleanor.vance@example.com',
        password_hash: demoPasswordHash,
        full_name: 'Eleanor Vance',
        phone_number: '+1 (555) 234-5678',
        role: 'PROTECTED_USER',
        preferred_language: 'en',
        alert_sensitivity: 'BALANCED',
        auto_terminate_threshold: 85,
        guardian_contact_phone: '+1 (555) 987-6543',
        guardian_contact_email: 'marcus.vance@example.com',
        created_at: new Date(Date.now() - 30 * 86400000).toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: demoGuardianId,
        email: 'marcus.vance@example.com',
        password_hash: demoPasswordHash,
        full_name: 'Marcus Vance (Guardian)',
        phone_number: '+1 (555) 987-6543',
        role: 'FAMILY_GUARDIAN',
        preferred_language: 'en',
        alert_sensitivity: 'STRICT',
        auto_terminate_threshold: 80,
        guardian_contact_phone: null,
        guardian_contact_email: null,
        created_at: new Date(Date.now() - 30 * 86400000).toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: demoAnalystId,
        email: 'analyst@sentinelbank.com',
        password_hash: demoPasswordHash,
        full_name: 'Dana Sterling',
        phone_number: '+1 (555) 444-9900',
        role: 'ENTERPRISE_ANALYST',
        preferred_language: 'en',
        alert_sensitivity: 'AGGRESSIVE',
        auto_terminate_threshold: 75,
        guardian_contact_phone: null,
        guardian_contact_email: null,
        created_at: new Date(Date.now() - 60 * 86400000).toISOString(),
        updated_at: new Date().toISOString()
      }
    );

    // 2. Trusted Contacts
    const contactSarahId = '44444444-4444-4444-a444-444444444444';
    const contactChaseId = '55555555-5555-4555-a555-555555555555';
    const contactMarcusId = '66666666-6666-4666-a666-666666666666';

    this.trusted_contacts.push(
      {
        id: contactSarahId,
        user_id: demoUserId,
        full_name: 'Sarah Vance (Granddaughter)',
        relationship: 'CHILD',
        phone_number: '+1 (555) 345-6789',
        is_voice_enrolled: true,
        enrolled_at: new Date(Date.now() - 14 * 86400000).toISOString(),
        created_at: new Date(Date.now() - 14 * 86400000).toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: contactChaseId,
        user_id: demoUserId,
        full_name: 'Chase Premier Financial Advisor',
        relationship: 'BANK_OFFICIAL',
        phone_number: '+1 (800) 935-9935',
        is_voice_enrolled: true,
        enrolled_at: new Date(Date.now() - 20 * 86400000).toISOString(),
        created_at: new Date(Date.now() - 20 * 86400000).toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: contactMarcusId,
        user_id: demoUserId,
        full_name: 'Marcus Vance (Son)',
        relationship: 'CHILD',
        phone_number: '+1 (555) 987-6543',
        is_voice_enrolled: false,
        enrolled_at: null,
        created_at: new Date(Date.now() - 10 * 86400000).toISOString(),
        updated_at: new Date().toISOString()
      }
    );

    // 3. Voice Enclave Biometric Baselines
    this.voice_enclave_profiles.push(
      {
        id: uuidv4(),
        contact_id: contactSarahId,
        pitch_mean_hz: 224.50,
        pitch_variance: 18.20,
        spectral_centroid_mean: 1820.45,
        zero_crossing_rate_mean: 0.0842,
        jitter_baseline: 0.0125,
        shimmer_baseline: 0.0340,
        feature_hash: 'a4b82d978cf4c8996fb92427ae41e4649b934ca495991b7852b855e3b0c44298',
        sample_duration_seconds: 15.0,
        created_at: new Date(Date.now() - 14 * 86400000).toISOString()
      },
      {
        id: uuidv4(),
        contact_id: contactChaseId,
        pitch_mean_hz: 135.10,
        pitch_variance: 8.40,
        spectral_centroid_mean: 1410.80,
        zero_crossing_rate_mean: 0.0610,
        jitter_baseline: 0.0090,
        shimmer_baseline: 0.0210,
        feature_hash: 'f69e9b89b88c42878cefb89a912e3f5b721e90861abf71b905ecba7589d8f61a',
        sample_duration_seconds: 15.0,
        created_at: new Date(Date.now() - 20 * 86400000).toISOString()
      }
    );

    // 4. Verification Shared Secrets
    const answerSarahHash = await bcrypt.hash('Lake Tahoe cabin trip', 10);
    const answerChaseHash = await bcrypt.hash('Branch 402 North Oak Street', 10);

    this.verification_challenges.push(
      {
        id: uuidv4(),
        contact_id: contactSarahId,
        question_prompt: 'Where did we take the rowboat during our family summer vacation in 2023?',
        secret_answer_hash: answerSarahHash,
        hint: 'Lake Tahoe cabin trip with golden retriever',
        created_at: new Date(Date.now() - 14 * 86400000).toISOString()
      },
      {
        id: uuidv4(),
        contact_id: contactChaseId,
        question_prompt: 'What was the street name of our primary branch where Eleanor opened her savings certificate?',
        secret_answer_hash: answerChaseHash,
        hint: 'Branch 402 North Oak Street',
        created_at: new Date(Date.now() - 20 * 86400000).toISOString()
      }
    );

    // 5. Historical Incident Reports
    const session1Id = '77777777-7777-4777-a777-777777777777';
    const session2Id = '88888888-8888-4888-a888-888888888888';
    const session3Id = '99999999-9999-4999-a999-999999999999';

    this.call_sessions.push(
      {
        id: session1Id,
        user_id: demoUserId,
        matched_contact_id: contactSarahId,
        caller_identifier: '+1 (555) 019-8234 (Spoofed Sarah Vance)',
        status: 'AUTONOMOUSLY_BLOCKED',
        started_at: new Date(Date.now() - 2 * 86400000).toISOString(),
        ended_at: new Date(Date.now() - 2 * 86400000 + 45000).toISOString(),
        duration_seconds: 45,
        peak_risk_score: 94,
        final_threat_category: 'GRANDCHILD_EMERGENCY',
        was_autonomous_action_taken: true,
        created_at: new Date(Date.now() - 2 * 86400000).toISOString()
      },
      {
        id: session2Id,
        user_id: demoUserId,
        matched_contact_id: contactChaseId,
        caller_identifier: '+1 (800) 935-9935 (Impersonating Chase Risk Unit)',
        status: 'TERMINATED_BY_USER',
        started_at: new Date(Date.now() - 5 * 86400000).toISOString(),
        ended_at: new Date(Date.now() - 5 * 86400000 + 82000).toISOString(),
        duration_seconds: 82,
        peak_risk_score: 88,
        final_threat_category: 'BANK_FRAUD_IMPOSTER',
        was_autonomous_action_taken: true,
        created_at: new Date(Date.now() - 5 * 86400000).toISOString()
      },
      {
        id: session3Id,
        user_id: demoUserId,
        matched_contact_id: contactSarahId,
        caller_identifier: '+1 (555) 345-6789 (Authentic Sarah Vance)',
        status: 'COMPLETED',
        started_at: new Date(Date.now() - 7 * 86400000).toISOString(),
        ended_at: new Date(Date.now() - 7 * 86400000 + 120000).toISOString(),
        duration_seconds: 120,
        peak_risk_score: 12,
        final_threat_category: 'AUTHENTIC_COMMUNICATION',
        was_autonomous_action_taken: false,
        created_at: new Date(Date.now() - 7 * 86400000).toISOString()
      }
    );

    this.incident_reports.push(
      {
        id: uuidv4(),
        call_session_id: session1Id,
        user_id: demoUserId,
        overall_risk_score: 94,
        primary_threat_category: 'GRANDCHILD_EMERGENCY',
        executive_summary: 'Cloned voice impersonation targeting Eleanor Vance purporting to be granddaughter Sarah Vance in urgent distress following an alleged car crash in Chicago.',
        forensic_explanation: {
          acoustic_evidence: 'Deepfake vocoder phase discontinuities detected in 1.4-2.8kHz bands. Unnatural pitch regularity (variance < 2.1Hz) characteristic of real-time diffusion voice models.',
          linguistic_evidence: 'Extreme coercive panic induction ("Grandma don\'t tell Mom! I need $3,500 cash sent via Bitcoin ATM within 30 minutes or they will hold me in jail").',
          identity_evidence: 'Pitch mean (189Hz) diverged significantly from enrolled baseline (224.5Hz). Biometric cosine similarity failed at 0.41.'
        },
        full_transcript: '[Caller - Cloned]: Grandma, oh god please help me! I was in an accident and they arrested me. I need $3,500 bail bond right now or they will keep me overnight. Please don\'t call mom, she\'ll kill me! Can you go to the supermarket right now and get wire codes?\n[AegisVoice Guardian Alert]: Synthetic clone detected. Risk 94%. Autonomous challenge engaged.',
        money_demanded_cents: 350000,
        money_demanded_currency: 'USD',
        action_taken: 'AUTONOMOUSLY_BLOCKED',
        guardian_notified: true,
        bank_webhook_dispatched: true,
        report_language: 'en',
        created_at: new Date(Date.now() - 2 * 86400000 + 46000).toISOString()
      },
      {
        id: uuidv4(),
        call_session_id: session2Id,
        user_id: demoUserId,
        overall_risk_score: 88,
        primary_threat_category: 'BANK_FRAUD_IMPOSTER',
        executive_summary: 'Inbound call impersonating Chase Fraud Department demanding urgent liquidation of savings account into a "federal custodial holding account" due to compromised wire routing numbers.',
        forensic_explanation: {
          acoustic_evidence: 'Harmonic jitter anomaly (0.048 vs baseline 0.009). Speech exhibits synthetic concatenative boundary artifacts.',
          linguistic_evidence: 'Scripted banking urgency, instructions to ignore banking teller warnings, refusal to allow callback through official branch line.',
          identity_evidence: 'Number spoofing verified via SIP header anomaly; acoustic profile failed biometric match with verified bank rep.'
        },
        full_transcript: '[Caller - Imposter]: This is Agent Bradley from Chase Fraud Interception Unit. We have detected unauthorized wire transfers from your checking account. You must immediately move $9,800 to our safe federal clearing account.\n[AegisVoice Guardian Alert]: Bank fraud coercion detected. Dispatched guardian alert.',
        money_demanded_cents: 980000,
        money_demanded_currency: 'USD',
        action_taken: 'TERMINATED_BY_USER',
        guardian_notified: true,
        bank_webhook_dispatched: true,
        report_language: 'en',
        created_at: new Date(Date.now() - 5 * 86400000 + 83000).toISOString()
      }
    );

    // 6. Enterprise API Keys
    this.enterprise_api_keys.push({
      id: uuidv4(),
      user_id: demoAnalystId,
      organization_name: 'Sentinel Financial Group',
      api_key_hash: '$2a$10$e8wE2U0tQ8Zk51R2P8T1ee8eGZ4z.M5gBq7y2L4p0o6x7y8z9a0b1',
      key_prefix: 'ag_live_sentinel',
      is_active: true,
      rate_limit_per_minute: 240,
      created_at: new Date(Date.now() - 60 * 86400000).toISOString()
    });
  }
}

const memoryStore = new InMemoryStore();

// Attempt PostgreSQL connection
export const initDb = async () => {
  const databaseUrl = process.env.DATABASE_URL;

  if (databaseUrl && !databaseUrl.includes('localhost:5432/aegisvoice_db_unconfigured')) {
    try {
      pool = new Pool({
        connectionString: databaseUrl,
        ssl: databaseUrl.includes('neon.tech') || databaseUrl.includes('supabase') 
          ? { rejectUnauthorized: false } 
          : false,
        connectionTimeoutMillis: 3500
      });

      const client = await pool.connect();
      console.log('✓ Connected to PostgreSQL Database');
      isPostgresConnected = true;

      // Apply schema
      const schemaPath = path.join(__dirname, 'schema.sql');
      if (fs.existsSync(schemaPath)) {
        const schemaSql = fs.readFileSync(schemaPath, 'utf8');
        await client.query(schemaSql);
        console.log('✓ Applied PostgreSQL Schema & RLS policies successfully');
      }

      client.release();
      return;
    } catch (err) {
      console.warn(`! PostgreSQL connection attempt failed (${err.message}). Falling back to AegisVoice In-Memory Storage Adapter.`);
      isPostgresConnected = false;
    }
  } else {
    console.log('ℹ AegisVoice In-Memory & Resilient Local Storage initialized (Seed data active).');
  }
};

// Unified Query Interface
export const query = async (text, params = []) => {
  if (isPostgresConnected && pool) {
    return pool.query(text, params);
  }

  // Emulate SQL operations on in-memory store
  const cleanSql = text.trim();
  const lowerSql = cleanSql.toLowerCase();

  // 1. SELECT users WHERE email = $1
  if (lowerSql.startsWith('select * from users where email =')) {
    const email = params[0]?.toLowerCase();
    const user = memoryStore.users.find(u => u.email.toLowerCase() === email);
    return { rows: user ? [user] : [], rowCount: user ? 1 : 0 };
  }

  // 2. SELECT users WHERE id = $1
  if (lowerSql.startsWith('select * from users where id =')) {
    const id = params[0];
    const user = memoryStore.users.find(u => u.id === id);
    return { rows: user ? [user] : [], rowCount: user ? 1 : 0 };
  }

  // 3. INSERT INTO users
  if (lowerSql.startsWith('insert into users')) {
    const id = uuidv4();
    const now = new Date().toISOString();
    const newUser = {
      id,
      email: params[0],
      password_hash: params[1],
      full_name: params[2],
      phone_number: params[3] || null,
      role: params[4] || 'PROTECTED_USER',
      preferred_language: params[5] || 'en',
      alert_sensitivity: 'BALANCED',
      auto_terminate_threshold: 85,
      guardian_contact_phone: params[6] || null,
      guardian_contact_email: params[7] || null,
      created_at: now,
      updated_at: now
    };
    memoryStore.users.push(newUser);
    return { rows: [newUser], rowCount: 1 };
  }

  // 4. UPDATE users SET ... WHERE id = ...
  if (lowerSql.startsWith('update users set')) {
    const userId = params[params.length - 1];
    const user = memoryStore.users.find(u => u.id === userId);
    if (user) {
      // Dynamic mapper based on params count
      if (params.length >= 6) {
        user.preferred_language = params[0] || user.preferred_language;
        user.alert_sensitivity = params[1] || user.alert_sensitivity;
        user.auto_terminate_threshold = params[2] ?? user.auto_terminate_threshold;
        user.guardian_contact_phone = params[3] || user.guardian_contact_phone;
        user.guardian_contact_email = params[4] || user.guardian_contact_email;
      }
      user.updated_at = new Date().toISOString();
      return { rows: [user], rowCount: 1 };
    }
    return { rows: [], rowCount: 0 };
  }

  // 5. SELECT trusted_contacts WHERE user_id = $1
  if (lowerSql.includes('from trusted_contacts') && lowerSql.includes('where user_id =')) {
    const userId = params[0];
    const contacts = memoryStore.trusted_contacts.filter(c => c.user_id === userId);
    return { rows: contacts, rowCount: contacts.length };
  }

  // 6. SELECT trusted_contacts WHERE id = $1
  if (lowerSql.includes('from trusted_contacts') && lowerSql.includes('where id =')) {
    const id = params[0];
    const contact = memoryStore.trusted_contacts.find(c => c.id === id);
    return { rows: contact ? [contact] : [], rowCount: contact ? 1 : 0 };
  }

  // 7. INSERT INTO trusted_contacts
  if (lowerSql.startsWith('insert into trusted_contacts')) {
    const id = uuidv4();
    const now = new Date().toISOString();
    const contact = {
      id,
      user_id: params[0],
      full_name: params[1],
      relationship: params[2],
      phone_number: params[3] || null,
      is_voice_enrolled: false,
      enrolled_at: null,
      created_at: now,
      updated_at: now
    };
    memoryStore.trusted_contacts.push(contact);
    return { rows: [contact], rowCount: 1 };
  }

  // 8. DELETE FROM trusted_contacts WHERE id = $1
  if (lowerSql.startsWith('delete from trusted_contacts where id =')) {
    const id = params[0];
    const idx = memoryStore.trusted_contacts.findIndex(c => c.id === id);
    if (idx !== -1) {
      memoryStore.trusted_contacts.splice(idx, 1);
      memoryStore.voice_enclave_profiles = memoryStore.voice_enclave_profiles.filter(p => p.contact_id !== id);
      memoryStore.verification_challenges = memoryStore.verification_challenges.filter(c => c.contact_id !== id);
      return { rowCount: 1 };
    }
    return { rowCount: 0 };
  }

  // 9. INSERT/UPDATE voice_enclave_profiles
  if (lowerSql.includes('voice_enclave_profiles')) {
    if (lowerSql.startsWith('insert') || lowerSql.startsWith('insert into voice_enclave_profiles')) {
      const id = uuidv4();
      const profile = {
        id,
        contact_id: params[0],
        pitch_mean_hz: params[1],
        pitch_variance: params[2],
        spectral_centroid_mean: params[3],
        zero_crossing_rate_mean: params[4],
        jitter_baseline: params[5],
        shimmer_baseline: params[6],
        feature_hash: params[7] || 'hash_' + Date.now(),
        sample_duration_seconds: params[8] || 15.0,
        created_at: new Date().toISOString()
      };
      // Upsert
      const existingIdx = memoryStore.voice_enclave_profiles.findIndex(p => p.contact_id === params[0]);
      if (existingIdx !== -1) {
        memoryStore.voice_enclave_profiles[existingIdx] = profile;
      } else {
        memoryStore.voice_enclave_profiles.push(profile);
      }
      // Update contact status
      const contact = memoryStore.trusted_contacts.find(c => c.id === params[0]);
      if (contact) {
        contact.is_voice_enrolled = true;
        contact.enrolled_at = new Date().toISOString();
      }
      return { rows: [profile], rowCount: 1 };
    }
    if (lowerSql.includes('where contact_id =')) {
      const contactId = params[0];
      const profile = memoryStore.voice_enclave_profiles.find(p => p.contact_id === contactId);
      return { rows: profile ? [profile] : [], rowCount: profile ? 1 : 0 };
    }
  }

  // 10. Verification challenges
  if (lowerSql.includes('verification_challenges')) {
    if (lowerSql.startsWith('select') && lowerSql.includes('where contact_id =')) {
      const contactId = params[0];
      const challenges = memoryStore.verification_challenges.filter(c => c.contact_id === contactId);
      return { rows: challenges, rowCount: challenges.length };
    }
    if (lowerSql.startsWith('insert')) {
      const id = uuidv4();
      const challenge = {
        id,
        contact_id: params[0],
        question_prompt: params[1],
        secret_answer_hash: params[2],
        hint: params[3] || null,
        created_at: new Date().toISOString()
      };
      memoryStore.verification_challenges.push(challenge);
      return { rows: [challenge], rowCount: 1 };
    }
  }

  // 11. Call Sessions
  if (lowerSql.includes('call_sessions')) {
    if (lowerSql.startsWith('insert into call_sessions')) {
      const id = uuidv4();
      const session = {
        id,
        user_id: params[0],
        matched_contact_id: params[1] || null,
        caller_identifier: params[2],
        status: 'ACTIVE',
        started_at: new Date().toISOString(),
        ended_at: null,
        duration_seconds: 0,
        peak_risk_score: 0,
        final_threat_category: 'UNKNOWN_SUSPICIOUS',
        was_autonomous_action_taken: false,
        created_at: new Date().toISOString()
      };
      memoryStore.call_sessions.push(session);
      return { rows: [session], rowCount: 1 };
    }
    if (lowerSql.startsWith('select * from call_sessions where id =')) {
      const id = params[0];
      const session = memoryStore.call_sessions.find(s => s.id === id);
      return { rows: session ? [session] : [], rowCount: session ? 1 : 0 };
    }
    if (lowerSql.startsWith('update call_sessions set')) {
      const id = params[params.length - 1];
      const session = memoryStore.call_sessions.find(s => s.id === id);
      if (session) {
        if (params.length === 3) {
          session.status = params[0];
          session.ended_at = new Date().toISOString();
        } else if (params.length >= 4) {
          session.peak_risk_score = Math.max(session.peak_risk_score, params[0] || 0);
          session.final_threat_category = params[1] || session.final_threat_category;
          session.duration_seconds = params[2] || session.duration_seconds;
        }
        return { rows: [session], rowCount: 1 };
      }
    }
  }

  // 12. Audio Chunks Telemetry
  if (lowerSql.includes('audio_chunks_telemetry')) {
    if (lowerSql.startsWith('insert into audio_chunks_telemetry')) {
      const id = uuidv4();
      const chunk = {
        id,
        call_session_id: params[0],
        chunk_index: params[1],
        transcript_segment: params[2],
        chunk_risk_score: params[3],
        synthetic_confidence: params[4],
        urgency_coercion_score: params[5],
        identity_discrepancy_score: params[6],
        detected_threat_cues: params[7] || [],
        acoustic_features: params[8] || {},
        latency_ms: params[9] || 450,
        timestamp: new Date().toISOString()
      };
      memoryStore.audio_chunks_telemetry.push(chunk);
      return { rows: [chunk], rowCount: 1 };
    }
    if (lowerSql.startsWith('select') && lowerSql.includes('where call_session_id =')) {
      const sessionId = params[0];
      const chunks = memoryStore.audio_chunks_telemetry.filter(c => c.call_session_id === sessionId);
      return { rows: chunks, rowCount: chunks.length };
    }
  }

  // 13. Incident Reports
  if (lowerSql.includes('incident_reports')) {
    if (lowerSql.startsWith('insert into incident_reports')) {
      const id = uuidv4();
      const report = {
        id,
        call_session_id: params[0],
        user_id: params[1],
        overall_risk_score: params[2],
        primary_threat_category: params[3],
        executive_summary: params[4],
        forensic_explanation: params[5],
        full_transcript: params[6],
        money_demanded_cents: params[7] || 0,
        money_demanded_currency: params[8] || 'USD',
        action_taken: params[9],
        guardian_notified: params[10] ?? false,
        bank_webhook_dispatched: params[11] ?? false,
        report_language: params[12] || 'en',
        created_at: new Date().toISOString()
      };
      memoryStore.incident_reports.push(report);
      return { rows: [report], rowCount: 1 };
    }
    if (lowerSql.startsWith('select') && lowerSql.includes('where id =')) {
      const id = params[0];
      const report = memoryStore.incident_reports.find(r => r.id === id);
      return { rows: report ? [report] : [], rowCount: report ? 1 : 0 };
    }
    if (lowerSql.startsWith('select') && lowerSql.includes('where user_id =')) {
      const userId = params[0];
      const reports = memoryStore.incident_reports.filter(r => r.user_id === userId);
      return { rows: reports, rowCount: reports.length };
    }
    if (lowerSql.startsWith('select') && !lowerSql.includes('where')) {
      return { rows: memoryStore.incident_reports, rowCount: memoryStore.incident_reports.length };
    }
  }

  // 14. Guardian alert logs
  if (lowerSql.startsWith('insert into guardian_alert_logs')) {
    const id = uuidv4();
    const log = {
      id,
      call_session_id: params[0],
      channel: params[1],
      recipient_destination: params[2],
      payload_snapshot: params[3],
      is_success: true,
      created_at: new Date().toISOString()
    };
    memoryStore.guardian_alert_logs.push(log);
    return { rows: [log], rowCount: 1 };
  }

  // 15. Enterprise API keys
  if (lowerSql.includes('enterprise_api_keys')) {
    return { rows: memoryStore.enterprise_api_keys, rowCount: memoryStore.enterprise_api_keys.length };
  }

  // Default fallback
  return { rows: [], rowCount: 0 };
};

export const getStore = () => memoryStore;
export default { query, initDb, getStore };

