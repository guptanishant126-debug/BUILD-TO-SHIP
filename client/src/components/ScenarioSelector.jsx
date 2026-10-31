import React from 'react';
import { Play, Sparkles, AlertTriangle, ShieldCheck } from 'lucide-react';
import ThreatCategoryBadge from './ThreatCategoryBadge';

const ScenarioSelector = ({ scenarios = [], onSelectScenario, activeScenarioId, isRunning = false }) => {
  return (
    <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4 sm:p-5 shadow-lg">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <Sparkles className="w-4 h-4 text-cyan-400" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
            Scam Call Sandbox Simulator
          </h3>
        </div>
        <span className="text-[11px] font-mono text-cyan-400">
          4 Preloaded AI Deepfake Datasets
        </span>
      </div>
      <p className="text-xs text-slate-400 mb-4">
        Inject pre-recorded multi-chunk call streams into the Guardian audio engine to test real-time cloned voice detection and autonomous safeguards.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {scenarios.map((sc) => {
          const isActive = activeScenarioId === sc.id;
          const isHighRisk = sc.expected_risk >= 70;

          return (
            <div
              key={sc.id}
              onClick={() => !isRunning && onSelectScenario(sc)}
              className={`p-3.5 rounded-xl border transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between ${
                isActive
                  ? 'bg-cyan-950/30 border-cyan-500 shadow-md shadow-cyan-500/20 ring-1 ring-cyan-500/40'
                  : 'bg-slate-850/60 border-slate-800/90 hover:border-slate-700 hover:bg-slate-800/50'
              } ${isRunning && !isActive ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <ThreatCategoryBadge category={sc.category} size="sm" />
                  <span className={`text-xs font-mono font-bold ${
                    isHighRisk ? 'text-rose-400' : 'text-emerald-400'
                  }`}>
                    Exp. Risk: {sc.expected_risk}%
                  </span>
                </div>

                <h4 className="font-semibold text-slate-100 text-sm mb-1 leading-snug">
                  {sc.title}
                </h4>

                <p className="text-slate-400 text-xs line-clamp-2 mb-3">
                  {sc.description}
                </p>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-800/60 text-[11px]">
                <span className="text-slate-500 font-mono">
                  {sc.chunks?.length || 4} audio chunks
                </span>
                <button
                  type="button"
                  disabled={isRunning}
                  className={`flex items-center space-x-1 px-2.5 py-1 rounded-lg font-semibold transition-colors ${
                    isActive
                      ? 'bg-cyan-500 text-slate-950 font-bold'
                      : 'bg-slate-800 text-cyan-300 hover:bg-cyan-500/20'
                  }`}
                >
                  <Play className="w-3 h-3 fill-current" />
                  <span>{isActive && isRunning ? 'Simulating...' : 'Run Scenario'}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ScenarioSelector;

