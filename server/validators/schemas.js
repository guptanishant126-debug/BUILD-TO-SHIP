import { z } from 'zod';

// Registration Schema
export const RegisterUserSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  full_name: z.string().min(2, 'Full name must be at least 2 characters'),
  phone_number: z.string().optional(),
  role: z.enum(['PROTECTED_USER', 'FAMILY_GUARDIAN', 'ENTERPRISE_ANALYST']).default('PROTECTED_USER'),
  preferred_language: z.enum(['en', 'es', 'hi', 'zh', 'tl']).default('en'),
  guardian_contact_phone: z.string().optional(),
  guardian_contact_email: z.string().email().optional().or(z.literal(''))
});

// Login Schema
export const LoginUserSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1, 'Password is required')
});

// Settings Update Schema
export const UpdateSettingsSchema = z.object({
  full_name: z.string().min(2).optional(),
  phone_number: z.string().optional(),
  preferred_language: z.enum(['en', 'es', 'hi', 'zh', 'tl']).optional(),
  alert_sensitivity: z.enum(['BALANCED', 'STRICT', 'AGGRESSIVE']).optional(),
  auto_terminate_threshold: z.number().int().min(50).max(100).optional(),
  guardian_contact_phone: z.string().optional(),
  guardian_contact_email: z.string().email().optional().or(z.literal('')),
  bank_fraud_webhook_url: z.string().url().optional().or(z.literal(''))
});

// Stream Chunk Ingestion Schema
export const StreamChunkSchema = z.object({
  chunk_index: z.number().int().nonnegative(),
  transcript_segment: z.string().min(1),
  acoustic_features: z.object({
    pitch_mean_hz: z.number(),
    pitch_variance: z.number(),
    spectral_centroid: z.number(),
    zero_crossing_rate: z.number(),
    jitter: z.number(),
    shimmer: z.number()
  }),
  duration_ms: z.number().positive(),
  client_timestamp: z.string()
});

// Contact Creation Schema
export const CreateContactSchema = z.object({
  full_name: z.string().min(2),
  relationship: z.enum(['CHILD', 'PARENT', 'SPOUSE', 'SIBLING', 'FRIEND', 'BANK_OFFICIAL', 'COLLEAGUE', 'OTHER']),
  phone_number: z.string().optional()
});

// Voice Enrollment Schema
export const EnrollVoiceSchema = z.object({
  pitch_mean_hz: z.number(),
  pitch_variance: z.number(),
  spectral_centroid_mean: z.number(),
  zero_crossing_rate_mean: z.number(),
  jitter_baseline: z.number(),
  shimmer_baseline: z.number(),
  feature_hash: z.string().optional(),
  sample_duration_seconds: z.number().positive()
});

// Challenge Creation Schema
export const CreateChallengeSchema = z.object({
  question_prompt: z.string().min(5),
  secret_answer: z.string().min(1),
  hint: z.string().optional()
});

// Call Session Start Schema
export const StartCallSessionSchema = z.object({
  caller_identifier: z.string().min(1),
  matched_contact_id: z.string().uuid().optional().nullable(),
  simulated_scenario_id: z.string().optional()
});

// Alert Dispatch Schema
export const AlertGuardianSchema = z.object({
  reason: z.string(),
  current_risk_score: z.number().min(0).max(100),
  transcript_snippet: z.string()
});

// Terminate Session Schema
export const TerminateCallSchema = z.object({
  action_type: z.enum(['TERMINATED_BY_USER', 'TERMINATED_BY_GUARDIAN', 'AUTONOMOUSLY_BLOCKED']).default('TERMINATED_BY_USER'),
  final_reason: z.string().optional()
});

// Enterprise Webhook Test Schema
export const WebhookTestSchema = z.object({
  target_url: z.string().url(),
  test_payload: z.record(z.any()).optional()
});

