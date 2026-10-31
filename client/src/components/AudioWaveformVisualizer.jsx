import React, { useRef, useEffect, useState } from 'react';
import { Volume2, Activity, Zap, Radio } from 'lucide-react';

const AudioWaveformVisualizer = ({
  isStreaming = false,
  riskScore = 0,
  mode = 'waveform', // 'waveform' or 'bars'
  height = 140
}) => {
  const canvasRef = useRef(null);
  const animationFrameRef = useRef(null);
  const phaseRef = useRef(0);
  const [vuLeft, setVuLeft] = useState(0);
  const [vuRight, setVuRight] = useState(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const render = () => {
      const width = canvas.width;
      const h = canvas.height;
      ctx.clearRect(0, 0, width, h);

      // Subtle CRT / Radar Grid Lines
      ctx.strokeStyle = 'rgba(15, 23, 42, 0.8)';
      ctx.lineWidth = 1;
      const gridStep = 24;
      for (let x = 0; x < width; x += gridStep) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h);
        ctx.stroke();
      }
      for (let y = 0; y < h; y += gridStep) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // Center Reference Line
      ctx.strokeStyle = 'rgba(6, 182, 212, 0.2)';
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(0, h / 2);
      ctx.lineTo(width, h / 2);
      ctx.stroke();
      ctx.setLineDash([]);

      // Dynamic Color Theme
      let strokeColor, glowColor;
      if (riskScore >= 75) {
        strokeColor = '#f43f5e';
        glowColor = 'rgba(244, 63, 94, 0.6)';
      } else if (riskScore >= 45) {
        strokeColor = '#f59e0b';
        glowColor = 'rgba(245, 158, 11, 0.5)';
      } else {
        strokeColor = '#06b6d4';
        glowColor = 'rgba(6, 182, 212, 0.5)';
      }

      if (!isStreaming) {
        // Idle organic breath wave
        ctx.strokeStyle = 'rgba(71, 85, 105, 0.4)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        for (let x = 0; x < width; x += 4) {
          const y = h / 2 + Math.sin(x * 0.015 + phaseRef.current) * 3;
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
        phaseRef.current += 0.02;
        setVuLeft(Math.max(2, vuLeft * 0.9));
        setVuRight(Math.max(2, vuRight * 0.9));
        animationFrameRef.current = requestAnimationFrame(render);
        return;
      }

      // Active Streaming Visualization
      const speed = riskScore > 60 ? 0.16 : 0.09;
      phaseRef.current += speed;

      // Update VU levels
      const currentLevel = Math.min(100, Math.floor(40 + Math.random() * (riskScore > 60 ? 55 : 35)));
      setVuLeft(currentLevel);
      setVuRight(Math.max(10, currentLevel - Math.floor(Math.random() * 15)));

      if (mode === 'bars') {
        // Fast Fourier Transform (FFT) Frequency Spectrum
        const barWidth = 6;
        const gap = 3;
        const totalBars = Math.floor(width / (barWidth + gap));

        for (let i = 0; i < totalBars; i++) {
          const x = i * (barWidth + gap);
          // High-frequency harmonic distribution with vocoder jitter spikes
          const harmonic = Math.sin(i * 0.2 + phaseRef.current * 1.5) * Math.cos(i * 0.08 - phaseRef.current * 0.6);
          const jitterSpike = (riskScore > 60 && i > 12 && i < 24) ? Math.random() * 0.4 : 0;
          const barHeight = Math.max(8, (Math.abs(harmonic) + jitterSpike) * (h * 0.78));

          // Gradient for bar
          const barGrad = ctx.createLinearGradient(0, (h - barHeight) / 2, 0, (h + barHeight) / 2);
          barGrad.addColorStop(0, strokeColor);
          barGrad.addColorStop(1, '#070b14');

          ctx.fillStyle = barGrad;
          ctx.shadowBlur = 8;
          ctx.shadowColor = glowColor;
          ctx.beginPath();
          ctx.roundRect(x, (h - barHeight) / 2, barWidth, barHeight, 3);
          ctx.fill();
          ctx.shadowBlur = 0;
        }
      } else {
        // Multi-layered Oscilloscope with Glow Beam
        const layers = [
          { amplitude: riskScore > 60 ? 32 : 20, freq: 0.028, alpha: 0.95, width: 2.8 },
          { amplitude: riskScore > 60 ? 18 : 12, freq: 0.065, alpha: 0.45, width: 1.6 },
          { amplitude: riskScore > 60 ? 42 : 26, freq: 0.014, alpha: 0.25, width: 1 }
        ];

        layers.forEach((layer) => {
          ctx.strokeStyle = strokeColor;
          ctx.globalAlpha = layer.alpha;
          ctx.lineWidth = layer.width;
          ctx.shadowBlur = 12;
          ctx.shadowColor = glowColor;
          ctx.beginPath();

          for (let x = 0; x < width; x += 3) {
            // Neural Vocoder phase glitch artifact simulation
            const phaseGlitch = (riskScore > 60 && x > 180 && x < 320)
              ? (Math.random() - 0.5) * 14
              : 0;
            const y = h / 2 + Math.sin(x * layer.freq + phaseRef.current) * layer.amplitude + phaseGlitch;
            if (x === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
          }
          ctx.stroke();
          ctx.shadowBlur = 0;
        });
        ctx.globalAlpha = 1.0;
      }

      animationFrameRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isStreaming, riskScore, mode]);

  return (
    <div className="relative w-full rounded-2xl bg-[#070b14]/90 border border-slate-800/90 p-4 overflow-hidden shadow-2xl backdrop-blur-md">
      
      {/* Top Telemetry Status Header */}
      <div className="flex items-center justify-between text-xs mb-3">
        <div className="flex items-center space-x-2.5">
          <span className="relative flex h-2.5 w-2.5">
            <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
              isStreaming ? (riskScore > 60 ? 'bg-rose-400' : 'bg-cyan-400') : 'bg-slate-600'
            }`} />
            <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${
              isStreaming ? (riskScore > 60 ? 'bg-rose-500' : 'bg-cyan-500') : 'bg-slate-600'
            }`} />
          </span>
          <span className="font-mono text-slate-300 font-bold uppercase text-[11px] tracking-wider">
            {isStreaming ? 'Telecom Ingest (5G VoLTE • 48kHz)' : 'Acoustic Sensor Standby'}
          </span>
        </div>

        <div className="flex items-center space-x-3 text-[10px] font-mono">
          <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-400">
            LATENCY: <strong className={isStreaming ? 'text-emerald-400' : 'text-slate-500'}>{isStreaming ? '780ms' : '0ms'}</strong>
          </span>
          <span className={`px-2 py-0.5 rounded border font-semibold ${
            riskScore >= 75
              ? 'bg-rose-500/15 border-rose-500/40 text-rose-300 animate-pulse'
              : 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400'
          }`}>
            {riskScore >= 75 ? 'VOCODER PHASE GLITCH DETECTED' : 'SPECTRAL HARMONICS: NORMAL'}
          </span>
        </div>
      </div>

      {/* Main Canvas & Lateral VU Meter Deck */}
      <div className="flex items-center space-x-3">
        
        {/* Main Oscilloscope Screen */}
        <div className="relative flex-1 rounded-xl overflow-hidden bg-slate-950/90 border border-slate-800/80 shadow-inner">
          <canvas
            ref={canvasRef}
            width={640}
            height={height}
            className="w-full block"
          />
          
          {/* Frequency Band Watermarks */}
          <div className="absolute bottom-1 left-2 right-2 flex justify-between text-[9px] font-mono text-slate-600 pointer-events-none">
            <span>60Hz</span>
            <span>250Hz</span>
            <span>1kHz</span>
            <span className={riskScore > 60 ? 'text-rose-400 font-bold' : ''}>2.4kHz (Vocoder Band)</span>
            <span>8kHz</span>
            <span>16kHz</span>
          </div>
        </div>

        {/* Dual Stereo Decibel VU Meter Deck */}
        <div className="flex space-x-1.5 h-[140px] px-1 py-1 bg-slate-950 rounded-xl border border-slate-800 items-end">
          {/* L Channel */}
          <div className="w-2.5 h-full bg-slate-900 rounded-sm relative flex flex-col justify-end p-0.5 overflow-hidden">
            <div
              className={`w-full rounded-sm transition-all duration-100 ${
                vuLeft > 80 ? 'bg-rose-500' : vuLeft > 50 ? 'bg-amber-400' : 'bg-cyan-400'
              }`}
              style={{ height: `${vuLeft}%` }}
            />
            <span className="text-[7px] text-slate-500 font-mono text-center absolute bottom-0.5 inset-x-0">L</span>
          </div>

          {/* R Channel */}
          <div className="w-2.5 h-full bg-slate-900 rounded-sm relative flex flex-col justify-end p-0.5 overflow-hidden">
            <div
              className={`w-full rounded-sm transition-all duration-100 ${
                vuRight > 80 ? 'bg-rose-500' : vuRight > 50 ? 'bg-amber-400' : 'bg-cyan-400'
              }`}
              style={{ height: `${vuRight}%` }}
            />
            <span className="text-[7px] text-slate-500 font-mono text-center absolute bottom-0.5 inset-x-0">R</span>
          </div>
        </div>

      </div>

    </div>
  );
};

export default AudioWaveformVisualizer;
