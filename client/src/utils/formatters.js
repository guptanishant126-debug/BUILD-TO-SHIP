export const formatCurrency = (cents = 0, currency = 'USD') => {
  const dollars = cents / 100;
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    maximumFractionDigits: 0
  }).format(dollars);
};

export const formatRelativeTime = (isoString) => {
  if (!isoString) return '';
  const date = new Date(isoString);
  const now = new Date();
  const diffSec = Math.floor((now - date) / 1000);

  if (diffSec < 60) return 'Just now';
  if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;
  if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h ago`;
  return `${Math.floor(diffSec / 86400)}d ago`;
};

export const getRiskTier = (score = 0) => {
  if (score < 30) {
    return {
      tier: 'Safe / Verified',
      color: 'emerald',
      bgColor: 'bg-emerald-500/10',
      borderColor: 'border-emerald-500/30',
      textColor: 'text-emerald-400',
      badgeClass: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
    };
  }
  if (score < 60) {
    return {
      tier: 'Suspicious / Guarded',
      color: 'amber',
      bgColor: 'bg-amber-500/10',
      borderColor: 'border-amber-500/30',
      textColor: 'text-amber-400',
      badgeClass: 'bg-amber-500/20 text-amber-300 border-amber-500/40'
    };
  }
  if (score < 85) {
    return {
      tier: 'High Risk',
      color: 'orange',
      bgColor: 'bg-orange-500/10',
      borderColor: 'border-orange-500/30',
      textColor: 'text-orange-400',
      badgeClass: 'bg-orange-500/20 text-orange-300 border-orange-500/40'
    };
  }
  return {
    tier: 'Critical / Block Action',
    color: 'rose',
    bgColor: 'bg-rose-500/10',
    borderColor: 'border-rose-500/30',
    textColor: 'text-rose-400',
    badgeClass: 'bg-rose-500/20 text-rose-300 border-rose-500/40'
  };
};

export const getCategoryLabel = (category = '') => {
  const map = {
    GRANDCHILD_EMERGENCY: 'Grandchild Bail Ransom',
    BANK_FRAUD_IMPOSTER: 'Bank Fraud Officer Imposter',
    KIDNAPPING_RANSOM: 'Kidnapping Extortion',
    EXECUTIVE_CEO_FRAUD: 'Executive CEO Wire Fraud',
    GOVERNMENT_LEGAL_EXTORTION: 'Government / Police Extortion',
    AUTHENTIC_COMMUNICATION: 'Authentic Family Communication',
    UNKNOWN_SUSPICIOUS: 'Suspicious Telephony Pattern'
  };
  return map[category] || category.replace(/_/g, ' ');
};

export const getLocalizedUIText = (lang = 'en') => {
  const dictionary = {
    en: {
      hud_armed: 'GUARDIAN ARMED & LISTENING',
      risk_score_label: 'Threat Risk Score',
      emergency_mode: 'Emergency Mode (Elderly)',
      trigger_challenge_btn: 'Ask Verification Challenge',
      alert_guardian_btn: 'Alert Emergency Guardian',
      kill_switch_btn: 'Terminate Call Immediately',
      scam_detected: 'SCAM CALL DETECTED',
      safe_verified: 'CALLER IDENTIFIED & SAFE',
      ask_caller: 'Ask caller aloud now:'
    },
    es: {
      hud_armed: 'GUARDIÁN ARMADO Y ESCUCHANDO',
      risk_score_label: 'Puntaje de Riesgo de Amenaza',
      emergency_mode: 'Modo de Emergencia (Adulto Mayor)',
      trigger_challenge_btn: 'Hacer Pregunta de Verificación',
      alert_guardian_btn: 'Alertar a Guardián Familiar',
      kill_switch_btn: 'Cortar Llamada Inmediatamente',
      scam_detected: 'LLAMADA FRAUDULENTA DETECTADA',
      safe_verified: 'LLAMANTE IDENTIFICADO Y SEGURO',
      ask_caller: 'Pregúntele al llamante en voz alta ahora:'
    },
    hi: {
      hud_armed: 'एजिस सुरक्षा कवच सक्रिय एवं सतर्क',
      risk_score_label: 'खतरा जोखिम स्कोर',
      emergency_mode: 'आपातकालीन मोड (वरिष्ठ नागरिक)',
      trigger_challenge_btn: 'सत्यापन प्रश्न पूछें',
      alert_guardian_btn: 'परिवार के अभिभावक को सूचित करें',
      kill_switch_btn: 'कॉल तुरंत काटें',
      scam_detected: 'फर्जी कॉल का पता चला',
      safe_verified: 'कॉलर सत्यापित एवं सुरक्षित',
      ask_caller: 'कॉलर से अभी जोर से पूछें:'
    },
    zh: {
      hud_armed: '守护系统已武装并正在监听',
      risk_score_label: '威胁风险评分',
      emergency_mode: '长者紧急模式',
      trigger_challenge_btn: '发起动态验证提问',
      alert_guardian_btn: '向指定守护人报警',
      kill_switch_btn: '立即强行挂断电话',
      scam_detected: '检测到AI克隆诈骗通话',
      safe_verified: '对方身份已验证且安全',
      ask_caller: '请立即向对方大声提问：'
    },
    tl: {
      hud_armed: 'GUARDIAN NAKABANTAY AT NAKIKINIG',
      risk_score_label: 'Panganib Risk Score',
      emergency_mode: 'Emergency Mode (Pang-matanda)',
      trigger_challenge_btn: 'Magtanong ng Verification Challenge',
      alert_guardian_btn: 'Alertuhin ang Guardian',
      kill_switch_btn: 'I-baba ang Tawag Kaagad',
      scam_detected: 'NA-DETECT ANG SCAM CALL',
      safe_verified: 'TUMATAWAG KUMPIRMADO AT LIGTAS',
      ask_caller: 'Itanong sa tumatawag ngayon:'
    }
  };

  return dictionary[lang] || dictionary.en;
};

