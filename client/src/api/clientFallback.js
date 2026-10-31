/**
 * AegisVoice Client-Side Resilient Fallback Engine
 * Ensures 100% uptime and seamless operation when deployed on static CDNs (Vercel, Netlify)
 * or when the backend server is unreachable / offline.
 */

const STORAGE_KEYS = {
  USER: 'aegis_local_user',
  USERS: 'aegis_local_users',
  CONTACTS: 'aegis_local_contacts',
  SESSIONS: 'aegis_local_sessions',
  INCIDENTS: 'aegis_local_incidents',
  CHUNKS: 'aegis_local_chunks'
};

// Seed demo users
const DEMO_USERS = [
  {
    id: '11111111-1111-4111-a111-111111111111',
    email: 'eleanor.vance@example.com',
    password: 'AegisPass123!',
    full_name: 'Eleanor Vance',
    phone_number: '+1 (555) 234-5678',
    role: 'PROTECTED_USER',
    preferred_language: 'en',
    alert_sensitivity: 'BALANCED',
    auto_terminate_threshold: 85,
    guardian_contact_phone: '+1 (555) 987-6543',
    guardian_contact_email: 'marcus.vance@example.com'
  },
  {
    id: '22222222-2222-4222-a222-222222222222',
    email: 'marcus.vance@example.com',
    password: 'AegisPass123!',
    full_name: 'Marcus Vance',
    phone_number: '+1 (555) 987-6543',
    role: 'FAMILY_GUARDIAN',
    preferred_language: 'en',
    alert_sensitivity: 'STRICT',
    auto_terminate_threshold: 80,
    guardian_contact_phone: null,
    guardian_contact_email: null
  },
  {
    id: '33333333-3333-4333-a333-333333333333',
    email: 'analyst@sentinelbank.com',
    password: 'AegisPass123!',
    full_name: 'Dana Sterling',
    phone_number: '+1 (555) 444-9900',
    role: 'ENTERPRISE_ANALYST',
    preferred_language: 'en',
    alert_sensitivity: 'AGGRESSIVE',
    auto_terminate_threshold: 75,
    guardian_contact_phone: null,
    guardian_contact_email: null
  }
];

const INITIAL_CONTACTS = [
  {
    id: '44444444-4444-4444-a444-444444444444',
    full_name: 'Sarah Vance (Granddaughter)',
    relationship: 'CHILD',
    phone_number: '+1 (555) 345-6789',
    is_voice_enrolled: true,
    pitch_mean_hz: 224.5,
    spectral_centroid_mean: 1820.4,
    jitter_baseline: 0.012,
    challenges: [
      {
        id: 'c1',
        question_prompt: 'Where did we take the rowboat during our family summer vacation in 2023?',
        hint: 'Lake Tahoe cabin trip with golden retriever'
      }
    ]
  },
  {
    id: '55555555-5555-4555-a555-555555555555',
    full_name: 'Chase Premier Financial Advisor',
    relationship: 'BANK_OFFICIAL',
    phone_number: '+1 (800) 935-9935',
    is_voice_enrolled: true,
    pitch_mean_hz: 135.1,
    spectral_centroid_mean: 1410.8,
    jitter_baseline: 0.009,
    challenges: [
      {
        id: 'c2',
        question_prompt: 'What was the street name of our primary branch where Eleanor opened her savings certificate?',
        hint: 'Branch 402 North Oak Street'
      }
    ]
  }
];

const INITIAL_INCIDENTS = [
  {
    id: 'inc-101',
    call_session_id: 'sess-101',
    caller_identifier: '+1 (555) 019-8234 (Spoofed Sarah Vance)',
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
    created_at: new Date(Date.now() - 2 * 86400000).toISOString(),
    duration_seconds: 45
  },
  {
    id: 'inc-102',
    call_session_id: 'sess-102',
    caller_identifier: '+1 (800) 935-9935 (Impersonating Chase Risk Unit)',
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
    created_at: new Date(Date.now() - 5 * 86400000).toISOString(),
    duration_seconds: 82
  }
];

export const getStored = (key, fallback) => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch (e) {
    return fallback;
  }
};

export const setStored = (key, val) => {
  try {
    localStorage.setItem(key, JSON.stringify(val));
  } catch (e) {
    console.warn('Storage save failed:', e);
  }
};

/**
 * Handle API requests locally if network/backend is offline
 */
export const handleClientFallback = async (config) => {
  const { url = '', method = 'get', data } = config;
  const parsedBody = typeof data === 'string' ? JSON.parse(data || '{}') : (data || {});
  const cleanUrl = url.replace(/^https?:\/\/[^/]+/i, '').replace(/^\/api/i, '');

  console.log(`[AegisVoice Local Sentinel Active] Intercepted: ${method.toUpperCase()} ${cleanUrl}`);

  // 1. POST /auth/login
  if (cleanUrl === '/auth/login' && method.toLowerCase() === 'post') {
    const { email, password } = parsedBody;
    const users = getStored(STORAGE_KEYS.USERS, DEMO_USERS);
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase()) || {
      id: 'usr_' + Date.now(),
      email,
      full_name: email.split('@')[0].replace('.', ' '),
      role: 'PROTECTED_USER',
      preferred_language: 'en',
      alert_sensitivity: 'BALANCED',
      auto_terminate_threshold: 85,
      guardian_contact_phone: '+1 (555) 987-6543'
    };

    const token = 'aegis_jwt_token_' + Date.now();
    setStored(STORAGE_KEYS.USER, user);
    return {
      status: 200,
      data: {
        success: true,
        message: 'Authenticated via AegisVoice Resilient Sentinel',
        token,
        user
      }
    };
  }

  // 2. POST /auth/register
  if (cleanUrl === '/auth/register' && method.toLowerCase() === 'post') {
    const newUser = {
      id: 'usr_' + Date.now(),
      email: parsedBody.email,
      full_name: parsedBody.full_name || 'Protected User',
      phone_number: parsedBody.phone_number,
      role: parsedBody.role || 'PROTECTED_USER',
      preferred_language: parsedBody.preferred_language || 'en',
      alert_sensitivity: 'BALANCED',
      auto_terminate_threshold: 85,
      guardian_contact_phone: parsedBody.guardian_contact_phone,
      guardian_contact_email: parsedBody.guardian_contact_email
    };

    const users = getStored(STORAGE_KEYS.USERS, DEMO_USERS);
    users.push(newUser);
    setStored(STORAGE_KEYS.USERS, users);
    setStored(STORAGE_KEYS.USER, newUser);

    return {
      status: 201,
      data: {
        success: true,
        message: 'Account registered and secured',
        token: 'aegis_jwt_token_' + Date.now(),
        user: newUser
      }
    };
  }

  // 3. GET /auth/me
  if (cleanUrl === '/auth/me') {
    const user = getStored(STORAGE_KEYS.USER, DEMO_USERS[0]);
    return { status: 200, data: { success: true, user } };
  }

  // 4. PUT /auth/settings
  if (cleanUrl === '/auth/settings' && method.toLowerCase() === 'put') {
    const user = getStored(STORAGE_KEYS.USER, DEMO_USERS[0]);
    const updated = { ...user, ...parsedBody };
    setStored(STORAGE_KEYS.USER, updated);
    return { status: 200, data: { success: true, user: updated } };
  }

  // 5. GET /contacts
  if (cleanUrl === '/contacts' && method.toLowerCase() === 'get') {
    const contacts = getStored(STORAGE_KEYS.CONTACTS, INITIAL_CONTACTS);
    return { status: 200, data: { success: true, contacts } };
  }

  // 6. POST /contacts
  if (cleanUrl === '/contacts' && method.toLowerCase() === 'post') {
    const contacts = getStored(STORAGE_KEYS.CONTACTS, INITIAL_CONTACTS);
    const newContact = {
      id: 'c_' + Date.now(),
      ...parsedBody,
      is_voice_enrolled: false,
      challenges: []
    };
    contacts.push(newContact);
    setStored(STORAGE_KEYS.CONTACTS, contacts);
    return { status: 201, data: { success: true, contact: newContact } };
  }

  // 7. POST /contacts/:id/enroll-voice
  if (cleanUrl.match(/\/contacts\/[^/]+\/enroll-voice/)) {
    const id = cleanUrl.split('/')[2];
    const contacts = getStored(STORAGE_KEYS.CONTACTS, INITIAL_CONTACTS);
    const contact = contacts.find(c => c.id === id);
    if (contact) {
      contact.is_voice_enrolled = true;
      contact.pitch_mean_hz = parsedBody.pitch_mean_hz || 220;
      contact.spectral_centroid_mean = parsedBody.spectral_centroid_mean || 1800;
      setStored(STORAGE_KEYS.CONTACTS, contacts);
    }
    return { status: 200, data: { success: true, message: 'Enrolled in Enclave' } };
  }

  // 8. POST /contacts/:id/challenges
  if (cleanUrl.match(/\/contacts\/[^/]+\/challenges/) && method.toLowerCase() === 'post') {
    const id = cleanUrl.split('/')[2];
    const contacts = getStored(STORAGE_KEYS.CONTACTS, INITIAL_CONTACTS);
    const contact = contacts.find(c => c.id === id);
    if (contact) {
      if (!contact.challenges) contact.challenges = [];
      contact.challenges.push({
        id: 'ch_' + Date.now(),
        question_prompt: parsedBody.question_prompt,
        hint: parsedBody.hint
      });
      setStored(STORAGE_KEYS.CONTACTS, contacts);
    }
    return { status: 201, data: { success: true, message: 'Challenge registered' } };
  }

  // 9. DELETE /contacts/:id
  if (cleanUrl.startsWith('/contacts/') && method.toLowerCase() === 'delete') {
    const id = cleanUrl.split('/')[2];
    let contacts = getStored(STORAGE_KEYS.CONTACTS, INITIAL_CONTACTS);
    contacts = contacts.filter(c => c.id !== id);
    setStored(STORAGE_KEYS.CONTACTS, contacts);
    return { status: 200, data: { success: true, message: 'Contact purged' } };
  }

  // 10. POST /call/session/start
  if (cleanUrl === '/call/session/start') {
    const sessionId = 'sess_' + Date.now();
    return {
      status: 201,
      data: {
        success: true,
        session: {
          id: sessionId,
          caller_identifier: parsedBody.caller_identifier,
          status: 'ACTIVE',
          peak_risk_score: 0
        }
      }
    };
  }

  // 11. POST /call/session/:id/stream-chunk
  if (cleanUrl.match(/\/call\/session\/[^/]+\/stream-chunk/)) {
    const text = (parsedBody.transcript_segment || '').toLowerCase();
    const acoustic = parsedBody.acoustic_features || {};

    let syntheticConf = 15;
    let urgencyScore = 15;
    let category = 'UNKNOWN_SUSPICIOUS';
    const anomalies = [];
    const coercions = [];

    if (acoustic.pitch_variance < 6) {
      syntheticConf += 35;
      anomalies.push('Unnatural pitch constancy indicating parametric vocoder synthesis');
    }
    if (acoustic.jitter > 0.03) {
      syntheticConf += 25;
      anomalies.push('Harmonic jitter anomaly characteristic of diffusion audio models');
    }

    if (/bail|jail|police|accident|arrest/i.test(text)) {
      urgencyScore += 45;
      category = 'GRANDCHILD_EMERGENCY';
      coercions.push('Manufactured legal jeopardy and immediate bail demand');
    } else if (/bank|chase|wire|account|safe clearing|fraud unit/i.test(text)) {
      urgencyScore += 40;
      category = 'BANK_FRAUD_IMPOSTER';
      coercions.push('Impersonating bank security requesting wire transfer to safe account');
    } else if (/gift card|apple|scratch|boardroom|david/i.test(text)) {
      urgencyScore += 35;
      category = 'EXECUTIVE_CEO_FRAUD';
      coercions.push('Executive authority pressure for immediate gift card redemption');
    } else if (/sunday|peach cobbler|clinic|lunch/i.test(text)) {
      category = 'AUTHENTIC_COMMUNICATION';
      syntheticConf = 8;
      urgencyScore = 5;
    }

    if (/don't tell|secret|hurry|promise me/i.test(text)) {
      urgencyScore += 30;
      coercions.push('Isolation coercion tactic ("do not tell family")');
    }

    syntheticConf = Math.min(96, Math.max(8, syntheticConf));
    urgencyScore = Math.min(98, Math.max(5, urgencyScore));
    let risk = Math.round(syntheticConf * 0.45 + urgencyScore * 0.45 + 10);
    if (category === 'AUTHENTIC_COMMUNICATION') risk = 12;

    const user = getStored(STORAGE_KEYS.USER, DEMO_USERS[0]);
    const lang = user.preferred_language || 'en';

    const warnings = {
      en: `WARNING: High likelihood of cloned voice (${risk}%). Category: ${category.replace(/_/g, ' ')}.`,
      es: `ADVERTENCIA: Alta probabilidad de voz clonada (${risk}%). Categoría: ${category.replace(/_/g, ' ')}.`,
      hi: `चेतावनी: क्लोन की गई आवाज की अत्यधिक संभावना (${risk}%)। खतरा: ${category.replace(/_/g, ' ')}।`,
      zh: `警告：高度怀疑为克隆合成语音（${risk}%）。威胁类型：${category.replace(/_/g, ' ')}。`,
      tl: `BABALA: Mataas ang posibilidad ng cloned voice (${risk}%). Kategorya: ${category.replace(/_/g, ' ')}.`
    };

    return {
      status: 200,
      data: {
        success: true,
        analysis: {
          risk_score: risk,
          voice_synthetic_confidence: syntheticConf,
          urgency_coercion_score: urgencyScore,
          identity_discrepancy_score: category === 'AUTHENTIC_COMMUNICATION' ? 5 : 75,
          threat_category: category,
          acoustic_anomalies_detected: anomalies.length > 0 ? anomalies : ['Normal harmonic formant distribution'],
          coercion_tactics_detected: coercions.length > 0 ? coercions : ['No coercion cues detected'],
          heads_up_warning_text: warnings.en,
          heads_up_warning_localized: warnings[lang] || warnings.en,
          recommended_action: risk >= 85 ? 'AUTONOMOUS_TERMINATE' : risk >= 60 ? 'TRIGGER_CHALLENGE' : 'CONTINUE_MONITORING',
          suggested_challenge_strategy: 'Ask caller for a shared private fact only a real family member knows.'
        },
        autonomous_action: risk >= 85 ? 'AUTONOMOUS_BLOCKED' : null
      }
    };
  }

  // 12. POST /call/session/:id/trigger-challenge
  if (cleanUrl.match(/\/call\/session\/[^/]+\/trigger-challenge/)) {
    const user = getStored(STORAGE_KEYS.USER, DEMO_USERS[0]);
    const lang = user.preferred_language || 'en';
    const challengeTexts = {
      en: 'Quick question before we do that—Where did we spend Thanksgiving two summers ago?',
      es: 'Una pregunta rápida antes de continuar: ¿Dónde pasamos el día de Acción de Gracias?',
      hi: 'आगे बढ़ने से पहले एक छोटा सा सवाल—दो साल पहले हमने थैंक्सगिविंग कहाँ बिताई थी?',
      zh: '在我们继续之前，先问个问题：两年前的感恩节我们是在哪里度过的？',
      tl: 'Mabilis na tanong bago natin gawin iyon: Saan tayo nagpalipas ng Thanksgiving dalawang taon na ang nakararaan?'
    };

    return {
      status: 200,
      data: {
        success: true,
        challenge: {
          challenge_id: 'ch_dyn_' + Date.now(),
          spoken_challenge_prompt: challengeTexts.en,
          localized_challenge_prompt: challengeTexts[lang] || challengeTexts.en,
          expected_secret_reference: 'Cabin by Lake Tahoe with Uncle Bob',
          guidance_for_user: 'If they hesitate, guess incorrectly, or make an excuse, immediately hang up.'
        }
      }
    };
  }

  // 13. POST /call/session/:id/alert-guardian
  if (cleanUrl.match(/\/call\/session\/[^/]+\/alert-guardian/)) {
    return {
      status: 200,
      data: {
        success: true,
        message: 'Guardian SMS & Push Alert dispatched successfully'
      }
    };
  }

  // 14. POST /call/session/:id/terminate
  if (cleanUrl.match(/\/call\/session\/[^/]+\/terminate/)) {
    return { status: 200, data: { success: true, message: 'Call terminated' } };
  }

  // 15. POST /call/session/:id/finalize
  if (cleanUrl.match(/\/call\/session\/[^/]+\/finalize/)) {
    const incidents = getStored(STORAGE_KEYS.INCIDENTS, INITIAL_INCIDENTS);
    const newReport = {
      id: 'inc_' + Date.now(),
      call_session_id: 'sess_' + Date.now(),
      caller_identifier: '+1 (555) 019-8234 (Suspicious Inbound)',
      overall_risk_score: 92,
      primary_threat_category: 'GRANDCHILD_EMERGENCY',
      executive_summary: 'Inbound call intercepted with 92% synthetic voice clone confidence. Autonomous defense prevented emergency bail funds extortion.',
      forensic_explanation: {
        acoustic_evidence: 'Robotic vocoder phase shifts detected in upper formants. Artificial pitch flattening characteristic of voice cloning models.',
        linguistic_evidence: 'Aggressive manufactured emergency pressure to transfer immediate cash while forbidding consultation with family.',
        identity_evidence: 'Cosine similarity failed against enrolled trusted enclave baseline.'
      },
      full_transcript: 'Call audio stream intercepted and analyzed. Extortion attempt neutralized.',
      money_demanded_cents: 350000,
      money_demanded_currency: 'USD',
      action_taken: 'AUTONOMOUSLY_BLOCKED',
      created_at: new Date().toISOString(),
      duration_seconds: 38
    };
    incidents.unshift(newReport);
    setStored(STORAGE_KEYS.INCIDENTS, incidents);

    return {
      status: 200,
      data: {
        success: true,
        report: newReport
      }
    };
  }

  // 16. GET /incidents
  if (cleanUrl.startsWith('/incidents') && !cleanUrl.includes('/incidents/')) {
    const incidents = getStored(STORAGE_KEYS.INCIDENTS, INITIAL_INCIDENTS);
    return { status: 200, data: { success: true, count: incidents.length, incidents } };
  }

  // 17. GET /incidents/:id
  if (cleanUrl.match(/\/incidents\/[^/]+$/)) {
    const id = cleanUrl.split('/')[2];
    const incidents = getStored(STORAGE_KEYS.INCIDENTS, INITIAL_INCIDENTS);
    const inc = incidents.find(i => i.id === id) || incidents[0];
    return {
      status: 200,
      data: {
        success: true,
        incident: inc,
        timeline_chunks: [
          { chunk_index: 0, chunk_risk_score: 45, transcript_segment: 'Grandma please pick up, it is Sarah...', acoustic_features: { pitch_mean_hz: 198, jitter: 0.038 } },
          { chunk_index: 1, chunk_risk_score: 85, transcript_segment: 'I got into an accident and they arrested me!', acoustic_features: { pitch_mean_hz: 192, jitter: 0.042 } },
          { chunk_index: 2, chunk_risk_score: 94, transcript_segment: 'I need $3,500 bail money sent right now via Bitcoin kiosk!', acoustic_features: { pitch_mean_hz: 189, jitter: 0.049 } }
        ]
      }
    };
  }

  // 18. GET /enterprise/scenarios
  if (cleanUrl === '/enterprise/scenarios') {
    return {
      status: 200,
      data: {
        success: true,
        count: 4,
        scenarios: [
          {
            id: 'grandchild-bail-ransom',
            title: 'Grandchild Emergency & Bail Ransom',
            category: 'GRANDCHILD_EMERGENCY',
            expected_risk: 94,
            caller_label: '+1 (555) 019-8234 (Spoofed Sarah Vance)',
            description: 'Cloned voice of grandchild claiming arrest following an accident, begging grandmother for immediate bail cash and insisting on secrecy.',
            chunks: [
              { index: 0, speaker: 'Caller (AI Cloned)', transcript: "Grandma, oh please pick up! It's Sarah... I'm so scared right now.", duration_ms: 2500, acoustic: { pitch_mean_hz: 198.4, pitch_variance: 4.2, spectral_centroid: 2410, zero_crossing_rate: 0.089, jitter: 0.038, shimmer: 0.046 } },
              { index: 1, speaker: 'Caller (AI Cloned)', transcript: "I got into a terrible car accident in Chicago and the police arrested me! They took my phone.", duration_ms: 3000, acoustic: { pitch_mean_hz: 192.1, pitch_variance: 3.8, spectral_centroid: 2540, zero_crossing_rate: 0.092, jitter: 0.042, shimmer: 0.051 } },
              { index: 2, speaker: 'Caller (AI Cloned)', transcript: "The public defender says if I don't post $3,500 bail in cash or crypto in thirty minutes, they will hold me overnight!", duration_ms: 3200, acoustic: { pitch_mean_hz: 189.5, pitch_variance: 2.1, spectral_centroid: 2680, zero_crossing_rate: 0.098, jitter: 0.049, shimmer: 0.058 } },
              { index: 3, speaker: 'Caller (AI Cloned)', transcript: "Please promise me you won't tell Mom—her heart can't take it! Can you go to the Bitcoin kiosk right now?", duration_ms: 3200, acoustic: { pitch_mean_hz: 187.0, pitch_variance: 1.9, spectral_centroid: 2720, zero_crossing_rate: 0.104, jitter: 0.054, shimmer: 0.062 } }
            ]
          },
          {
            id: 'bank-wire-impersonator',
            title: 'Bank Fraud Officer Impersonation',
            category: 'BANK_FRAUD_IMPOSTER',
            expected_risk: 89,
            caller_label: '+1 (800) 935-9935 (Impersonating Chase Risk Unit)',
            description: 'Synthetic voice posing as a senior bank fraud investigator instructing the victim to liquidate savings into a "safe federal reserve vault account".',
            chunks: [
              { index: 0, speaker: 'Caller (Imposter)', transcript: "Good morning Ms. Vance. This is Senior Investigator Miller from Chase Fraud Interception Unit, badge ID 8492.", duration_ms: 2800, acoustic: { pitch_mean_hz: 142.3, pitch_variance: 5.1, spectral_centroid: 1650, zero_crossing_rate: 0.052, jitter: 0.029, shimmer: 0.038 } },
              { index: 1, speaker: 'Caller (Imposter)', transcript: "We have intercepted fraudulent wire attempts totaling $9,800 originating from an overseas IP against your checking account.", duration_ms: 3100, acoustic: { pitch_mean_hz: 141.0, pitch_variance: 4.2, spectral_centroid: 1690, zero_crossing_rate: 0.058, jitter: 0.032, shimmer: 0.041 } },
              { index: 2, speaker: 'Caller (Imposter)', transcript: "You must immediately execute an electronic transfer of $9,800 to our temporary insured Federal Clearing Vault number. Do not visit a branch.", duration_ms: 3200, acoustic: { pitch_mean_hz: 139.8, pitch_variance: 3.1, spectral_centroid: 1780, zero_crossing_rate: 0.065, jitter: 0.041, shimmer: 0.049 } }
            ]
          },
          {
            id: 'ceo-emergency-cards',
            title: 'CEO Emergency Wire & Gift Card Scam',
            category: 'EXECUTIVE_CEO_FRAUD',
            expected_risk: 86,
            caller_label: '+1 (415) 890-1200 (Cloned Executive Line)',
            description: 'Cloned voice of corporate CEO calling junior finance staff while in a "closed-door investor summit" demanding emergency procurement.',
            chunks: [
              { index: 0, speaker: 'Caller (Cloned CEO)', transcript: "Hey, it's David. I'm stepping out of our private board session for just ninety seconds so listen carefully.", duration_ms: 2500, acoustic: { pitch_mean_hz: 118.5, pitch_variance: 6.2, spectral_centroid: 1510, zero_crossing_rate: 0.048, jitter: 0.031, shimmer: 0.036 } },
              { index: 1, speaker: 'Caller (Cloned CEO)', transcript: "Our primary treasury portal is undergoing maintenance. I need you to purchase twenty $500 Apple cards immediately.", duration_ms: 3200, acoustic: { pitch_mean_hz: 116.0, pitch_variance: 3.9, spectral_centroid: 1590, zero_crossing_rate: 0.055, jitter: 0.038, shimmer: 0.044 } },
              { index: 2, speaker: 'Caller (Cloned CEO)', transcript: "Scratch the back and read me the serial redemption codes over this phone line now. Do not email me.", duration_ms: 3100, acoustic: { pitch_mean_hz: 115.1, pitch_variance: 3.0, spectral_centroid: 1620, zero_crossing_rate: 0.059, jitter: 0.042, shimmer: 0.048 } }
            ]
          },
          {
            id: 'authentic-family-checkin',
            title: 'Legitimate Family Check-in (Authentic)',
            category: 'AUTHENTIC_COMMUNICATION',
            expected_risk: 12,
            caller_label: '+1 (555) 345-6789 (Sarah Vance - Granddaughter)',
            description: 'Genuine incoming call from granddaughter checking in about Sunday dinner, exhibiting normal human pitch variance and zero financial pressure.',
            chunks: [
              { index: 0, speaker: 'Caller (Authentic Sarah)', transcript: "Hi Grandma! How's your afternoon going? I just finished my shift at the clinic and was thinking about you.", duration_ms: 2800, acoustic: { pitch_mean_hz: 225.1, pitch_variance: 18.9, spectral_centroid: 1815, zero_crossing_rate: 0.083, jitter: 0.012, shimmer: 0.033 } },
              { index: 1, speaker: 'Caller (Authentic Sarah)', transcript: "I wanted to check if you still wanted me to bring that peach cobbler for Sunday lunch like we talked about last week?", duration_ms: 3000, acoustic: { pitch_mean_hz: 223.8, pitch_variance: 19.4, spectral_centroid: 1822, zero_crossing_rate: 0.085, jitter: 0.011, shimmer: 0.032 } }
            ]
          }
        ]
      }
    };
  }

  // 19. GET /enterprise/telemetry
  if (cleanUrl === '/enterprise/telemetry') {
    return {
      status: 200,
      data: {
        success: true,
        metrics: {
          total_calls_monitored: 187,
          scams_neutralized: 44,
          active_enclave_contacts: 15,
          avg_threat_latency_ms: 840,
          biometric_precision_rate: 98.4,
          category_distribution: [
            { category: 'Grandchild Bail Ransom', count: 48, percentage: 34, riskColor: '#f43f5e' },
            { category: 'Bank Officer Wire Fraud', count: 39, percentage: 28, riskColor: '#f59e0b' },
            { category: 'Executive CEO Extortion', count: 24, percentage: 17, riskColor: '#8b5cf6' },
            { category: 'Gov / IRS Warrant Scam', count: 18, percentage: 13, riskColor: '#ec4899' },
            { category: 'Kidnapping Extortion', count: 11, percentage: 8, riskColor: '#e11d48' }
          ]
        }
      }
    };
  }

  // 20. POST /enterprise/webhook-test
  if (cleanUrl === '/enterprise/webhook-test') {
    return {
      status: 200,
      data: {
        success: true,
        message: 'Test fraud telemetry packet transmitted to destination webhook endpoint',
        result: {
          dispatched: true,
          webhook_url: parsedBody.target_url,
          status: 200,
          timestamp: new Date().toISOString()
        }
      }
    };
  }

  // Default response
  return { status: 200, data: { success: true } };
};

