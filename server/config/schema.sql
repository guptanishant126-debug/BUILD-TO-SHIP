-- AegisVoice AI Production PostgreSQL Schema
-- Section 10 Specification

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enum Types
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('PROTECTED_USER', 'FAMILY_GUARDIAN', 'ENTERPRISE_ANALYST');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE relationship_enum AS ENUM ('CHILD', 'PARENT', 'SPOUSE', 'SIBLING', 'FRIEND', 'BANK_OFFICIAL', 'COLLEAGUE', 'OTHER');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE threat_category_enum AS ENUM (
        'AUTHENTIC_COMMUNICATION',
        'GRANDCHILD_EMERGENCY',
        'BANK_FRAUD_IMPOSTER',
        'KIDNAPPING_RANSOM',
        'EXECUTIVE_CEO_FRAUD',
        'GOVERNMENT_LEGAL_EXTORTION',
        'UNKNOWN_SUSPICIOUS'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE call_status_enum AS ENUM ('ACTIVE', 'COMPLETED', 'TERMINATED_BY_USER', 'TERMINATED_BY_GUARDIAN', 'AUTONOMOUSLY_BLOCKED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE alert_channel_enum AS ENUM ('IN_APP_HUD', 'VOICE_SYNTHESIS', 'SMS_GUARDIAN', 'BANK_WEBHOOK', 'EMAIL');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Users Table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(150) NOT NULL,
    phone_number VARCHAR(30),
    role VARCHAR(30) DEFAULT 'PROTECTED_USER' NOT NULL,
    preferred_language VARCHAR(10) DEFAULT 'en' NOT NULL,
    alert_sensitivity VARCHAR(20) DEFAULT 'BALANCED' NOT NULL,
    auto_terminate_threshold INT DEFAULT 85 CHECK (auto_terminate_threshold BETWEEN 50 AND 100),
    guardian_contact_phone VARCHAR(30),
    guardian_contact_email VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Trusted Contacts Enclave
CREATE TABLE IF NOT EXISTS trusted_contacts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    full_name VARCHAR(150) NOT NULL,
    relationship VARCHAR(30) DEFAULT 'OTHER' NOT NULL,
    phone_number VARCHAR(30),
    is_voice_enrolled BOOLEAN DEFAULT FALSE NOT NULL,
    enrolled_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Voice Enclave Acoustic Baselines (Privacy-Preserving Feature Vectors)
CREATE TABLE IF NOT EXISTS voice_enclave_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    contact_id UUID UNIQUE REFERENCES trusted_contacts(id) ON DELETE CASCADE NOT NULL,
    pitch_mean_hz NUMERIC(6, 2) NOT NULL,
    pitch_variance NUMERIC(6, 2) NOT NULL,
    spectral_centroid_mean NUMERIC(8, 2) NOT NULL,
    zero_crossing_rate_mean NUMERIC(6, 4) NOT NULL,
    jitter_baseline NUMERIC(5, 4) NOT NULL,
    shimmer_baseline NUMERIC(5, 4) NOT NULL,
    feature_hash VARCHAR(64) NOT NULL, -- SHA-256 hash of extracted MFCC baseline
    sample_duration_seconds NUMERIC(4, 2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Secret Challenge Knowledge (Zero-Trust Shared Secrets)
CREATE TABLE IF NOT EXISTS verification_challenges (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    contact_id UUID REFERENCES trusted_contacts(id) ON DELETE CASCADE NOT NULL,
    question_prompt TEXT NOT NULL,
    secret_answer_hash VARCHAR(255) NOT NULL, -- Salted hash of expected answer
    hint TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Call Sessions Table
CREATE TABLE IF NOT EXISTS call_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    matched_contact_id UUID REFERENCES trusted_contacts(id) ON DELETE SET NULL,
    caller_identifier VARCHAR(100) NOT NULL, -- Phone number or simulated scenario title
    status VARCHAR(30) DEFAULT 'ACTIVE' NOT NULL,
    started_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    ended_at TIMESTAMP WITH TIME ZONE,
    duration_seconds INT DEFAULT 0,
    peak_risk_score INT DEFAULT 0 CHECK (peak_risk_score BETWEEN 0 AND 100),
    final_threat_category VARCHAR(40) DEFAULT 'UNKNOWN_SUSPICIOUS' NOT NULL,
    was_autonomous_action_taken BOOLEAN DEFAULT FALSE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Real-Time Audio Chunks Telemetry (Ephemeral Stream Logs)
CREATE TABLE IF NOT EXISTS audio_chunks_telemetry (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    call_session_id UUID REFERENCES call_sessions(id) ON DELETE CASCADE NOT NULL,
    chunk_index INT NOT NULL,
    transcript_segment TEXT NOT NULL,
    chunk_risk_score INT NOT NULL CHECK (chunk_risk_score BETWEEN 0 AND 100),
    synthetic_confidence INT NOT NULL CHECK (synthetic_confidence BETWEEN 0 AND 100),
    urgency_coercion_score INT NOT NULL CHECK (urgency_coercion_score BETWEEN 0 AND 100),
    identity_discrepancy_score INT NOT NULL CHECK (identity_discrepancy_score BETWEEN 0 AND 100),
    detected_threat_cues TEXT[] DEFAULT '{}',
    acoustic_features JSONB NOT NULL,
    latency_ms INT NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Forensic Incident Reports (Full Auditable Post-Call Records)
CREATE TABLE IF NOT EXISTS incident_reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    call_session_id UUID UNIQUE REFERENCES call_sessions(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    overall_risk_score INT NOT NULL CHECK (overall_risk_score BETWEEN 0 AND 100),
    primary_threat_category VARCHAR(40) NOT NULL,
    executive_summary TEXT NOT NULL,
    forensic_explanation JSONB NOT NULL, -- Structured reasoning, evidence points, anomalies
    full_transcript TEXT NOT NULL,
    money_demanded_cents BIGINT DEFAULT 0,
    money_demanded_currency VARCHAR(10) DEFAULT 'USD',
    action_taken VARCHAR(30) NOT NULL,
    guardian_notified BOOLEAN DEFAULT FALSE NOT NULL,
    bank_webhook_dispatched BOOLEAN DEFAULT FALSE NOT NULL,
    report_language VARCHAR(10) DEFAULT 'en' NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Guardian Alerts & Webhook Logs
CREATE TABLE IF NOT EXISTS guardian_alert_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    call_session_id UUID REFERENCES call_sessions(id) ON DELETE CASCADE NOT NULL,
    channel VARCHAR(30) NOT NULL,
    recipient_destination VARCHAR(255) NOT NULL,
    payload_snapshot JSONB NOT NULL,
    is_success BOOLEAN DEFAULT TRUE NOT NULL,
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Enterprise B2B API Keys
CREATE TABLE IF NOT EXISTS enterprise_api_keys (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    organization_name VARCHAR(150) NOT NULL,
    api_key_hash VARCHAR(255) NOT NULL,
    key_prefix VARCHAR(16) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    rate_limit_per_minute INT DEFAULT 120 NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Indexes for Optimal Query Performance
CREATE INDEX IF NOT EXISTS idx_trusted_contacts_user ON trusted_contacts(user_id);
CREATE INDEX IF NOT EXISTS idx_call_sessions_user ON call_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_call_sessions_status ON call_sessions(status);
CREATE INDEX IF NOT EXISTS idx_audio_chunks_session ON audio_chunks_telemetry(call_session_id);
CREATE INDEX IF NOT EXISTS idx_incident_reports_user ON incident_reports(user_id);
CREATE INDEX IF NOT EXISTS idx_incident_reports_threat ON incident_reports(primary_threat_category);

