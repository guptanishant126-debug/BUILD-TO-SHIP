import React, { useEffect, useRef } from 'react';
import { User, ShieldAlert, Bot, Clock } from 'lucide-react';

const SUSPICIOUS_WORDS = [
  'bail', 'jail', 'arrest', 'wire', 'transfer', 'bitcoin', 'crypto',
  'gift card', 'secret', "don't tell", 'emergency', 'immediately',
  'safe account', 'clearing', 'routing', 'hostage', 'ransom', 'police',
  'detention', 'urgent'
];

const highlightKeywords = (text) => {
  if (!text) return text;
  const regex = new RegExp(`\\b(${SUSPICIOUS_WORDS.join('|')})\\b`, 'gi');
  const parts = text.split(regex);

  return parts.map((part, i) => {
    if (SUSPICIOUS_WORDS.some(w => w.toLowerCase() === part.toLowerCase())) {
      return (
        <span
          key={i}
          className="bg-rose-500/25 text-rose-300 font-semibold px-1 rounded border border-rose-500/40 inline-block animate-pulse"
        >
          {part}
        </span>
      );
    }
    return part;
  });
};

const LiveTranscriptFeed = ({ chunks = [], isStreaming = false }) => {
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [chunks]);

  return (
    <div className="flex flex-col h-full bg-slate-900/60 border border-slate-800/80 rounded-2xl overflow-hidden shadow-inner">
      
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-slate-950/60 border-b border-slate-800/80">
        <div className="flex items-center space-x-2">
          <Bot className="w-4 h-4 text-cyan-400" />
          <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
            Real-Time Diarized Transcript Stream
          </span>
        </div>
        <div className="flex items-center space-x-2 text-[11px] font-mono text-slate-400">
          <span className="flex items-center space-x-1">
            <span className={`w-1.5 h-1.5 rounded-full ${isStreaming ? 'bg-emerald-400 animate-ping' : 'bg-slate-600'}`} />
            <span>{isStreaming ? 'LIVE INGESTION' : 'STANDBY'}</span>
          </span>
          <span>•</span>
          <span>{chunks.length} segments</span>
        </div>
      </div>

      {/* Transcript Area */}
      <div
        ref={scrollRef}
        className="flex-1 p-4 overflow-y-auto space-y-3.5 max-h-[380px] text-sm"
      >
        {chunks.length === 0 ? (
          <div className="h-44 flex flex-col items-center justify-center text-slate-500 text-xs space-y-2">
            <Clock className="w-6 h-6 text-slate-600 animate-pulse" />
            <p>Awaiting incoming call audio stream or simulation start...</p>
            <p className="text-[11px] text-slate-600">Select a scenario below or toggle microphone to begin.</p>
          </div>
        ) : (
          chunks.map((item, index) => {
            const isCaller = !item.speaker || item.speaker.includes('Caller');
            const hasSuspiciousCues = item.analysis?.coercion_tactics_detected?.length > 0;

            return (
              <div
                key={index}
                className={`flex flex-col rounded-xl p-3 border transition-all ${
                  isCaller
                    ? hasSuspiciousCues
                      ? 'bg-rose-950/20 border-rose-900/40 text-slate-200'
                      : 'bg-slate-850/80 border-slate-800 text-slate-200'
                    : 'bg-cyan-950/20 border-cyan-900/40 text-slate-200 ml-6'
                }`}
              >
                <div className="flex items-center justify-between text-[11px] mb-1.5">
                  <div className="flex items-center space-x-1.5">
                    {isCaller ? (
                      <User className="w-3.5 h-3.5 text-rose-400" />
                    ) : (
                      <ShieldAlert className="w-3.5 h-3.5 text-cyan-400" />
                    )}
                    <span className="font-semibold text-slate-300">
                      {item.speaker || 'Caller'}
                    </span>
                    {item.analysis?.risk_score !== undefined && (
                      <span className={`text-[10px] font-mono px-1 rounded ${
                        item.analysis.risk_score >= 70 ? 'bg-rose-500/20 text-rose-300' : 'bg-emerald-500/20 text-emerald-300'
                      }`}>
                        Risk: {item.analysis.risk_score}%
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] font-mono text-slate-500">
                    Chunk #{item.chunk_index !== undefined ? item.chunk_index : index}
                  </span>
                </div>

                <p className="text-slate-200 leading-relaxed font-sans text-[13px]">
                  {highlightKeywords(item.transcript)}
                </p>

                {/* Real-time forensic flags if detected */}
                {item.analysis?.coercion_tactics_detected?.length > 0 && (
                  <div className="mt-2 pt-2 border-t border-rose-900/30 flex flex-wrap gap-1">
                    {item.analysis.coercion_tactics_detected.map((tactic, tIdx) => (
                      <span
                        key={tIdx}
                        className="text-[10px] bg-rose-500/10 text-rose-300 border border-rose-500/30 px-1.5 py-0.5 rounded"
                      >
                        ⚠ {tactic}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

    </div>
  );
};

export default LiveTranscriptFeed;

