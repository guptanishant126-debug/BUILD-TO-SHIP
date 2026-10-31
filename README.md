# AegisVoice AI 🛡️

### Real-Time Multimodal AI Guardian for Cloned Voice Detection, Explainable Risk Scoring, and Autonomous Scam Defense

> **Powered by Google Gemini 2.5 Flash & Gemini 2.5 Pro via the official `@google/genai` SDK.**

---

## 📌 Executive Summary

**AegisVoice AI** is an enterprise-grade, real-time multimodal AI defense platform designed to protect individuals, vulnerable elderly family members, and corporate finance personnel from extortion, kidnappings, wire fraud, and imposter scams executed with synthetic voice clones (e.g., ElevenLabs, Tortoise, diffusion models).

AegisVoice operates in-band or side-by-side with incoming calls:
1. **Audio Ingestion & Acoustic Feature Extraction**: Real-time Web Audio API pipeline computing pitch constancy, vocal tract frequency harmonics, Mel-Frequency Cepstral Coefficients (MFCC), spectral centroid, and robotic vocoder phase glitches.
2. **Zero-Knowledge Biometric Enclave**: Stores mathematical acoustic baselines and encrypted shared secrets for trusted contacts (family members, bankers, doctors). Raw voice recordings are discarded immediately after analysis.
3. **Sub-Second Explainable Threat Scoring (0–100)**: Evaluates acoustic synthesis confidence, semantic urgency, and identity discrepancy in under 1.2 seconds using **Gemini 2.5 Flash**.
4. **Autonomous Safeguards**: Multilingual spoken and visual heads-up warnings, dynamically generated un-spoofable verification challenge questions, automated guardian SMS/webhook dispatch, and carrier-level call kill-switches.
5. **Auditable Forensic Archive**: Compiles post-call audit dossiers with timeline scrubbers, itemized evidence, and signed JSON exports using **Gemini 2.5 Pro**.

---

## 🚀 Key Features

* **Real-Time Call Guardian HUD (`/guardian/call-monitor`)**:
  * Dual-mode Canvas Oscilloscope (Waveform & FFT Frequency Spectrum bars).
  * Radial SVG Risk Scorecard with dynamic color gradients (Green: Safe, Amber: Guarded, Orange: High Risk, Red: Critical Block).
  * Diarized transcript feed with live suspicious keyword highlights.
  * Instantaneous kill-switch and SMS dispatch to designated emergency guardians.
* **Preloaded Scam Call Sandbox Simulator**:
  * **Grandchild Bail Ransom**: Cloned grandchild begging for bail money after a car accident, demanding secrecy.
  * **Bank Fraud Officer Impersonation**: Imposter claiming wire compromise, directing liquidation to a "safe federal vault".
  * **CEO Emergency Wire & Gift Card Scam**: Cloned corporate executive demanding urgent gift card serial codes.
  * **Authentic Family Check-in**: Genuine granddaughter checking in, demonstrating normal human pitch variance.
* **Personalized Trusted Contacts Enclave (`/contacts/enclave`)**:
  * 3-Step Voice Enrollment Wizard with 10-second calibration countdown.
  * Configurable private challenge-response knowledge (shared secrets that public scrapers cannot guess).
* **Forensic Incident Audit Archive (`/incidents` & `/incidents/:id`)**:
  * Interactive audio replay timeline synchronized with chunk acoustic anomaly peaks.
  * Detailed evidence breakdown: Acoustic vocoder artifacts, linguistic coercion analysis, and biometric divergence.
  * Cryptographic SHA-256 exportable audit report.
* **Elderly Accessibility & Multilingual HUD**:
  * High-contrast large text toggle.
  * Spoken voice warnings (Web Speech Synthesis API).
  * Native languages supported: **English (EN)**, **Español (ES)**, **हिन्दी (HI)**, **中文 (ZH)**, **Tagalog (TL)**.
* **Enterprise B2B SOC Telemetry (`/enterprise/telemetry`)**:
  * B2B Ingestion API Keys.
  * Global scam attack vector distribution heatmaps.
  * Signed HMAC-SHA256 banking webhook test dispatcher.

---

## 🛠️ Technology Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 18, Vite, React Router v6, Tailwind CSS, Lucide React, HTML5 Canvas API |
| **Backend** | Node.js (v20+ LTS), Express.js (ES Modules), Zod, bcryptjs, jsonwebtoken |
| **AI Models** | Official `@google/genai` SDK (`gemini-2.5-flash` for streaming chunks, `gemini-2.5-pro` for forensic compilation) |
| **Database** | PostgreSQL (compatible with Neon, Supabase, local PostgreSQL) with resilient fallback adapter |
| **Audio Pipeline** | Web Audio API (`AudioContext`, `AnalyserNode`, autocorrelation pitch detection) |

---

## 📂 Project Structure

```
aegisvoice-ai/
├── client/
│   ├── .env                      # Client API base configuration
│   ├── index.html                # Entry HTML with custom fonts & shield icon
│   ├── vite.config.js            # Vite configuration
│   ├── tailwind.config.js        # Aegis custom dark theme palette
│   └── src/
│       ├── main.jsx              # React DOM entry
│       ├── App.jsx               # Route tree & ProtectedRoute guards
│       ├── api/axiosInstance.js  # Axios with JWT Bearer interceptor
│       ├── components/
│       │   ├── Navbar.jsx
│       │   ├── AudioWaveformVisualizer.jsx
│       │   ├── RiskGauge.jsx
│       │   ├── ThreatCategoryBadge.jsx
│       │   ├── LiveTranscriptFeed.jsx
│       │   ├── AutonomousActionHUD.jsx
│       │   ├── ChallengeModal.jsx
│       │   ├── ScenarioSelector.jsx
│       │   ├── VoiceEnrollmentWizard.jsx
│       │   └── IncidentCard.jsx
│       ├── context/
│       │   ├── AuthContext.jsx
│       │   └── CallSessionContext.jsx
│       ├── pages/
│       │   ├── LandingPage.jsx
│       │   ├── LoginPage.jsx
│       │   ├── RegisterPage.jsx
│       │   ├── DashboardPage.jsx
│       │   ├── CallMonitorPage.jsx
│       │   ├── ContactsEnclavePage.jsx
│       │   ├── IncidentsPage.jsx
│       │   ├── IncidentDetailPage.jsx
│       │   ├── SettingsPage.jsx
│       │   └── EnterprisePage.jsx
│       └── utils/
│           ├── audioProcessor.js # Web Audio API analyser & pitch detector
│           └── formatters.js     # Currency, relative time, localized strings
├── server/
│   ├── .env                      # Server credentials & Gemini API key
│   ├── server.js                 # Express entry, rate limiters, error boundaries
│   ├── test-api.js               # Automated integration test runner
│   ├── config/
│   │   ├── db.js                 # Dual-mode PostgreSQL connection pool & resilient store
│   │   └── schema.sql            # Production SQL DDL with UUID, Enums, Indexes, RLS
│   ├── middleware/
│   │   ├── authMiddleware.js     # JWT verification & role authorization
│   │   └── validateMiddleware.js # Zod body validation middleware
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── contactsController.js
│   │   ├── callController.js
│   │   ├── incidentController.js
│   │   └── enterpriseController.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── contactsRoutes.js
│   │   ├── callRoutes.js
│   │   ├── incidentRoutes.js
│   │   └── enterpriseRoutes.js
│   ├── services/
│   │   ├── geminiService.js      # Official @google/genai implementation & Prompts 1-3
│   │   ├── audioAnalysisService.js
│   │   └── alertNotificationService.js
│   └── validators/
│       └── schemas.js            # Zod validation schemas
└── README.md
```

---

## ⚙️ Environment Variables

### 1. Server (`server/.env`)
```ini
# Server Configuration
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173

# Database Connection (PostgreSQL / Neon / Supabase)
DATABASE_URL=postgresql://postgres:password@localhost:5432/aegisvoice_db

# JWT Security
JWT_SECRET=super_secure_jwt_secret_key_change_in_production_min_32_chars_aegisvoice_2026
JWT_EXPIRES_IN=24h

# Google Gemini API Key
GEMINI_API_KEY=AIzaSyYourActualGoogleGeminiApiKeyHere

# External Guardian Notification (Simulated or Real Twilio/SendGrid)
TWILIO_ACCOUNT_SID=AC_optional_twilio_sid
TWILIO_AUTH_TOKEN=optional_twilio_auth_token
TWILIO_PHONE_NUMBER=+15551234567

# Enterprise Webhook Secret
ENTERPRISE_WEBHOOK_SECRET=whsec_aegis_enterprise_shared_secret
```

### 2. Client (`client/.env`)
```ini
VITE_API_BASE_URL=http://localhost:5000/api
```

---

## 🏃 Quick Start Guide

### Step 1: Clone / Navigate to project
```bash
cd "c:\Users\Nishant Gupta\BUILD TO SHIP"
```

### Step 2: Install Dependencies
```bash
# Backend
cd server
npm install

# Frontend
cd ../client
npm install
```

### Step 3: Start the Backend Server
```bash
cd server
node server.js
```
*The server will start on `http://localhost:5000` with the Zero-Knowledge Biometric Enclave online.*

### Step 4: Start the Frontend Application
In a new terminal:
```bash
cd client
npm run dev
```
*Open your browser at `http://localhost:5173`.*

---

## 🔑 Pre-Seeded Demo Accounts (One-Click Login)

On `/login`, click any demo card for instant authentication:

| Profile | Email | Password | Role |
|---|---|---|---|
| **Eleanor Vance** | `eleanor.vance@example.com` | `AegisPass123!` | Protected Individual (Elderly) |
| **Marcus Vance** | `marcus.vance@example.com` | `AegisPass123!` | Designated Family Guardian |
| **Dana Sterling** | `analyst@sentinelbank.com` | `AegisPass123!` | Enterprise SOC Analyst |

---

## 🧪 Testing the Simulator

1. Log in as **Eleanor Vance**.
2. Navigate to **Call Guardian HUD** (`/guardian/call-monitor`).
3. Under the **Scam Call Sandbox Simulator**, click **Run Scenario** on **Grandchild Emergency & Bail Ransom**.
4. Observe the live stream:
   * Waveform oscilloscope reacts to the distressed audio.
   * Radial threat gauge rapidly climbs into the **High Risk (94%)** tier.
   * Diarized transcript streams with automated keyword alerts (`bail`, `arrest`, `Bitcoin kiosk`).
   * Heads-Up Warning Banner updates in real-time.
   * Click **Ask Verification Challenge** to display the dynamically generated secret memory question.
   * Click **Terminate Call Immediately** to neutralize the threat.
5. Click **Compile Audit Report** to view the post-call forensic dossier on `/incidents/:id` with timeline scrubbing and JSON export.

---

## 🛡️ Zero-Knowledge Biometric Security Guarantee

* **Raw Audio Is Ephemeral**: Raw audio buffers in RAM are destroyed immediately after acoustic feature extraction and Gemini scoring.
* **Vectorized Protection**: Stored biometric profiles consist solely of mathematical frequency moments (pitch mean, pitch variance, spectral centroid, zero-crossing rate, jitter, shimmer) and SHA-256 baseline hashes.
* **Row-Level Security**: Multi-tenant database isolation ensures users only access their personal enclave and designated guardian feeds.

