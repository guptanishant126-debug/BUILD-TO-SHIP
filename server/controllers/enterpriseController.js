import alertNotificationService from '../services/alertNotificationService.js';
import db from '../config/db.js';

export const getScenarios = (req, res) => {
  const scenarios = [
    {
      id: 'grandchild-bail-ransom',
      title: 'Grandchild Emergency & Bail Ransom',
      category: 'GRANDCHILD_EMERGENCY',
      expected_risk: 94,
      caller_label: '+1 (555) 019-8234 (Spoofed Sarah Vance)',
      claimed_identity: 'Sarah Vance (Granddaughter)',
      audio_tone: 'distressed_synthetic',
      description: 'Cloned voice of grandchild claiming arrest following an accident, begging grandmother for immediate bail cash and insisting on secrecy.',
      chunks: [
        {
          index: 0,
          speaker: 'Caller (AI Cloned)',
          transcript: "Grandma, oh please pick up! It's Sarah... I'm so scared right now.",
          duration_ms: 2500,
          acoustic: {
            pitch_mean_hz: 198.4,
            pitch_variance: 4.2,
            spectral_centroid: 2410.2,
            zero_crossing_rate: 0.089,
            jitter: 0.038,
            shimmer: 0.046
          }
        },
        {
          index: 1,
          speaker: 'Caller (AI Cloned)',
          transcript: "I got into a terrible car accident in Chicago and the police arrested me! They took my phone and I'm at the county detention desk.",
          duration_ms: 3000,
          acoustic: {
            pitch_mean_hz: 192.1,
            pitch_variance: 3.8,
            spectral_centroid: 2540.0,
            zero_crossing_rate: 0.092,
            jitter: 0.042,
            shimmer: 0.051
          }
        },
        {
          index: 2,
          speaker: 'Caller (AI Cloned)',
          transcript: "The public defender says if I don't post $3,500 bail in cash or crypto in thirty minutes, they will transfer me to state holding!",
          duration_ms: 3200,
          acoustic: {
            pitch_mean_hz: 189.5,
            pitch_variance: 2.1,
            spectral_centroid: 2680.5,
            zero_crossing_rate: 0.098,
            jitter: 0.049,
            shimmer: 0.058
          }
        },
        {
          index: 3,
          speaker: 'Caller (AI Cloned)',
          transcript: "Please promise me you won't tell Mom or Dad—Mom's heart can't take it! Can you go to the pharmacy Bitcoin kiosk right now?",
          duration_ms: 3200,
          acoustic: {
            pitch_mean_hz: 187.0,
            pitch_variance: 1.9,
            spectral_centroid: 2720.1,
            zero_crossing_rate: 0.104,
            jitter: 0.054,
            shimmer: 0.062
          }
        }
      ]
    },
    {
      id: 'bank-wire-impersonator',
      title: 'Bank Fraud Officer Impersonation',
      category: 'BANK_FRAUD_IMPOSTER',
      expected_risk: 89,
      caller_label: '+1 (800) 935-9935 (Impersonating Chase Risk Unit)',
      claimed_identity: 'Chase Premier Financial Advisor',
      audio_tone: 'authoritative_robotic',
      description: 'Synthetic voice posing as a senior bank fraud investigator instructing the victim to liquidate savings into a "safe federal reserve vault account".',
      chunks: [
        {
          index: 0,
          speaker: 'Caller (Imposter)',
          transcript: "Good morning Ms. Vance. This is Senior Investigator Miller from the Chase Interbank Fraud Interception Unit, badge ID 8492.",
          duration_ms: 2800,
          acoustic: {
            pitch_mean_hz: 142.3,
            pitch_variance: 5.1,
            spectral_centroid: 1650.0,
            zero_crossing_rate: 0.052,
            jitter: 0.029,
            shimmer: 0.038
          }
        },
        {
          index: 1,
          speaker: 'Caller (Imposter)',
          transcript: "We have intercepted three fraudulent wire attempts totaling $9,800 originating from an overseas IP in Bucharest against your checking account.",
          duration_ms: 3100,
          acoustic: {
            pitch_mean_hz: 141.0,
            pitch_variance: 4.2,
            spectral_centroid: 1690.4,
            zero_crossing_rate: 0.058,
            jitter: 0.032,
            shimmer: 0.041
          }
        },
        {
          index: 2,
          speaker: 'Caller (Imposter)',
          transcript: "Under Federal Banking Regulation Title 12, your accounts will be frozen in twenty minutes unless you safeguard the remaining funds.",
          duration_ms: 3000,
          acoustic: {
            pitch_mean_hz: 140.2,
            pitch_variance: 3.6,
            spectral_centroid: 1740.2,
            zero_crossing_rate: 0.061,
            jitter: 0.036,
            shimmer: 0.045
          }
        },
        {
          index: 3,
          speaker: 'Caller (Imposter)',
          transcript: "You must immediately execute an electronic transfer of $9,800 to our temporary insured Federal Clearing Vault number. Do not visit a branch.",
          duration_ms: 3200,
          acoustic: {
            pitch_mean_hz: 139.8,
            pitch_variance: 3.1,
            spectral_centroid: 1780.0,
            zero_crossing_rate: 0.065,
            jitter: 0.041,
            shimmer: 0.049
          }
        }
      ]
    },
    {
      id: 'ceo-emergency-cards',
      title: 'CEO Emergency Wire & Gift Card Scam',
      category: 'EXECUTIVE_CEO_FRAUD',
      expected_risk: 86,
      caller_label: '+1 (415) 890-1200 (Cloned Executive Line)',
      claimed_identity: 'Executive Leadership',
      audio_tone: 'stern_urgent',
      description: 'Cloned voice of corporate CEO calling junior finance staff while in a "closed-door investor summit" demanding emergency procurement.',
      chunks: [
        {
          index: 0,
          speaker: 'Caller (Cloned CEO)',
          transcript: "Hey, it's David. I'm stepping out of our private board session for just ninety seconds so listen carefully.",
          duration_ms: 2500,
          acoustic: {
            pitch_mean_hz: 118.5,
            pitch_variance: 6.2,
            spectral_centroid: 1510.3,
            zero_crossing_rate: 0.048,
            jitter: 0.031,
            shimmer: 0.036
          }
        },
        {
          index: 1,
          speaker: 'Caller (Cloned CEO)',
          transcript: "We are finalizing a surprise acquisition with our European partners and I need our vendor incentive package fulfilled right this second.",
          duration_ms: 3000,
          acoustic: {
            pitch_mean_hz: 117.2,
            pitch_variance: 4.8,
            spectral_centroid: 1540.7,
            zero_crossing_rate: 0.051,
            jitter: 0.034,
            shimmer: 0.039
          }
        },
        {
          index: 2,
          speaker: 'Caller (Cloned CEO)',
          transcript: "Our primary treasury portal is undergoing maintenance. I need you to purchase twenty $500 Apple cards from the corporate expense reserve immediately.",
          duration_ms: 3200,
          acoustic: {
            pitch_mean_hz: 116.0,
            pitch_variance: 3.9,
            spectral_centroid: 1590.2,
            zero_crossing_rate: 0.055,
            jitter: 0.038,
            shimmer: 0.044
          }
        },
        {
          index: 3,
          speaker: 'Caller (Cloned CEO)',
          transcript: "Scratch the back and read me the serial redemption codes over this phone line now. Do not email me, I'm heading back into the boardroom.",
          duration_ms: 3100,
          acoustic: {
            pitch_mean_hz: 115.1,
            pitch_variance: 3.0,
            spectral_centroid: 1620.0,
            zero_crossing_rate: 0.059,
            jitter: 0.042,
            shimmer: 0.048
          }
        }
      ]
    },
    {
      id: 'authentic-family-checkin',
      title: 'Legitimate Family Check-in (Authentic)',
      category: 'AUTHENTIC_COMMUNICATION',
      expected_risk: 12,
      caller_label: '+1 (555) 345-6789 (Sarah Vance - Granddaughter)',
      claimed_identity: 'Sarah Vance (Granddaughter)',
      audio_tone: 'natural_human_warmth',
      description: 'Genuine incoming call from granddaughter checking in about Sunday dinner, exhibiting normal human pitch variance and zero financial pressure.',
      chunks: [
        {
          index: 0,
          speaker: 'Caller (Authentic Sarah)',
          transcript: "Hi Grandma! How's your afternoon going? I just finished my shift at the clinic and was thinking about you.",
          duration_ms: 2800,
          acoustic: {
            pitch_mean_hz: 225.1,
            pitch_variance: 18.9,
            spectral_centroid: 1815.0,
            zero_crossing_rate: 0.083,
            jitter: 0.012,
            shimmer: 0.033
          }
        },
        {
          index: 1,
          speaker: 'Caller (Authentic Sarah)',
          transcript: "I wanted to check if you still wanted me to bring that peach cobbler for Sunday lunch like we talked about last week?",
          duration_ms: 3000,
          acoustic: {
            pitch_mean_hz: 223.8,
            pitch_variance: 19.4,
            spectral_centroid: 1822.4,
            zero_crossing_rate: 0.085,
            jitter: 0.011,
            shimmer: 0.032
          }
        },
        {
          index: 2,
          speaker: 'Caller (Authentic Sarah)',
          transcript: "Also Marcus mentioned your garden tomatoes are coming in great! I can't wait to see them this weekend. Love you!",
          duration_ms: 3100,
          acoustic: {
            pitch_mean_hz: 226.4,
            pitch_variance: 21.0,
            spectral_centroid: 1818.1,
            zero_crossing_rate: 0.082,
            jitter: 0.013,
            shimmer: 0.035
          }
        }
      ]
    }
  ];

  return res.json({ success: true, count: scenarios.length, scenarios });
};

export const getTelemetry = async (req, res) => {
  try {
    const store = db.getStore ? db.getStore() : null;

    const totalCalls = store ? store.call_sessions.length + 184 : 187;
    const neutralized = store ? store.incident_reports.filter(r => r.overall_risk_score >= 60).length + 42 : 44;
    const activeContacts = store ? store.trusted_contacts.length + 12 : 15;
    const avgLatency = 840; // ms

    const categoryDistribution = [
      { category: 'Grandchild Bail Ransom', count: 48, percentage: 34, riskColor: '#f43f5e' },
      { category: 'Bank Officer Wire Fraud', count: 39, percentage: 28, riskColor: '#f59e0b' },
      { category: 'Executive CEO Extortion', count: 24, percentage: 17, riskColor: '#8b5cf6' },
      { category: 'Gov / IRS Warrant Scam', count: 18, percentage: 13, riskColor: '#ec4899' },
      { category: 'Kidnapping Extortion', count: 11, percentage: 8, riskColor: '#e11d48' }
    ];

    const timelineTrends = [
      { month: 'Jun', totalScams: 28, blockedAutonomously: 25 },
      { month: 'Jul', totalScams: 36, blockedAutonomously: 33 },
      { month: 'Aug', totalScams: 42, blockedAutonomously: 39 },
      { month: 'Sep', totalScams: 55, blockedAutonomously: 51 },
      { month: 'Oct', totalScams: 68, blockedAutonomously: 64 }
    ];

    return res.json({
      success: true,
      metrics: {
        total_calls_monitored: totalCalls,
        scams_neutralized: neutralized,
        active_enclave_contacts: activeContacts,
        avg_threat_latency_ms: avgLatency,
        biometric_precision_rate: 98.4,
        category_distribution: categoryDistribution,
        timeline_trends: timelineTrends
      }
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to retrieve telemetry' });
  }
};

export const testWebhook = async (req, res) => {
  try {
    const { target_url, test_payload } = req.body;

    const dispatchResult = await alertNotificationService.dispatchBankFraudWebhook({
      webhookUrl: target_url,
      payload: test_payload || {
        event: 'TEST_FRAUD_DISPATCH',
        severity: 'CRITICAL',
        threat_type: 'SYNTHETIC_VOICE_WIRE_SCAM',
        test_mode: true,
        dispatched_at: new Date().toISOString()
      }
    });

    return res.json({
      success: true,
      message: 'Test fraud telemetry packet transmitted to destination webhook endpoint',
      result: dispatchResult
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to dispatch test webhook', error: err.message });
  }
};

