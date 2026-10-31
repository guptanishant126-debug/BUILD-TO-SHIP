import React, { useRef, useEffect } from 'react';

const AudioWaveformVisualizer = ({
  isStreaming = false,
  riskScore = 0,
  mode = 'waveform', // 'waveform' or 'bars'
  height = 120
}) => {
  const canvasRef = useRef(null);
  const animationFrameRef = useRef(null);
  const phaseRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const render = () => {
      const width = canvas.width;
      const h = canvas.height;
      ctx.clearRect(0, 0, width, h);

      // Determine palette based on risk
      let strokeGradient;
      if (riskScore >= 75) {
        strokeGradient = ctx.createLinearGradient(0, 0, width, 0);
        strokeGradient.addColorStop(0, '#f43f5e');
        strokeGradient.addColorStop(0.5, '#fb7185');
        strokeGradient.addColorStop(1, '#e11d48');
      } else if (riskScore >= 45) {
        strokeGradient = ctx.createLinearGradient(0, 0, width, 0);
        strokeGradient.addColorStop(0, '#f59e0b');
        strokeGradient.addColorStop(0.5, '#fbbf24');
        strokeGradient.addColorStop(1, '#d97706');
      } else {
        strokeGradient = ctx.createLinearGradient(0, 0, width, 0);
        strokeGradient.addColorStop(0, '#06b6d4');
        strokeGradient.addColorStop(0.5, '#22d3ee');
        strokeGradient.addColorStop(1, '#10b981');
      }

      // Background subtle grid lines
      ctx.strokeStyle = 'rgba(30, 41, 59, 0.4)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, h / 2);
      ctx.lineTo(width, h / 2);
      ctx.stroke();

      if (!isStreaming) {
        // Idle flat-line with subtle organic breathing wave
        ctx.strokeStyle = 'rgba(71, 85, 105, 0.4)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        for (let x = 0; x < width; x += 4) {
          const y = h / 2 + Math.sin((x * 0.02) + phaseRef.current) * 2;
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
        phaseRef.current += 0.02;
        animationFrameRef.current = requestAnimationFrame(render);
        return;
      }

      // Active streaming visualization
      const speed = riskScore > 60 ? 0.14 : 0.08;
      phaseRef.current += speed;

      if (mode === 'bars') {
        const barWidth = 4;
        const gap = 3;
        const totalBars = Math.floor(width / (barWidth + gap));
        for (let i = 0; i < totalBars; i++) {
          const x = i * (barWidth + gap);
          // Pseudo-frequency harmonic distribution
          const harmonic = Math.sin((i * 0.18) + phaseRef.current) * Math.cos((i * 0.05) - phaseRef.current * 0.5);
          const barHeight = Math.max(6, Math.abs(harmonic) * (h * 0.75));
          
          ctx.fillStyle = strokeGradient;
          ctx.beginPath();
          ctx.roundRect(x, (h - barHeight) / 2, barWidth, barHeight, 2);
          ctx.fill();
        }
      } else {
        // Smooth Multi-layered Oscilloscope Waves
        const layers = [
          { amplitude: riskScore > 60 ? 28 : 18, freq: 0.03, alpha: 0.85, width: 2.5 },
          { amplitude: riskScore > 60 ? 16 : 10, freq: 0.06, alpha: 0.4, width: 1.5 },
          { amplitude: riskScore > 60 ? 34 : 22, freq: 0.015, alpha: 0.25, width: 1 }
        ];

        layers.forEach((layer) => {
          ctx.strokeStyle = strokeGradient;
          ctx.globalAlpha = layer.alpha;
          ctx.lineWidth = layer.width;
          ctx.beginPath();

          for (let x = 0; x < width; x += 2) {
            // Harmonics + jitter spikes if risk is elevated
            const jitterFactor = riskScore > 60 ? (Math.random() - 0.5) * 6 : 0;
            const y = (h / 2) + Math.sin((x * layer.freq) + phaseRef.current) * layer.amplitude + jitterFactor;
            if (x === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
          }
          ctx.stroke();
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
    <div className="relative w-full rounded-xl bg-slate-950/70 border border-slate-800/80 p-3 overflow-hidden shadow-inner">
      <div className="flex items-center justify-between text-xs mb-2">
        <div className="flex items-center space-x-2">
          <span className={`w-2 h-2 rounded-full ${isStreaming ? 'bg-cyan-400 animate-pulse' : 'bg-slate-600'}`} />
          <span className="font-mono text-slate-400 uppercase text-[10px] tracking-wider">
            {isStreaming ? 'Audio Stream Ingest Active (24-bit / 48kHz)' : 'Stream Idle / Standby'}
          </span>
        </div>
        <div className="flex items-center space-x-2 text-[10px] font-mono text-slate-500">
          <span>LATENCY: {isStreaming ? '< 1.1s' : '0ms'}</span>
          <span>•</span>
          <span>VOCODER SENSING: ACTIVE</span>
        </div>
      </div>
      <canvas
        ref={canvasRef}
        width={600}
        height={height}
        className="w-full rounded-lg bg-slate-900/40"
      />
    </div>
  );
};

export default AudioWaveformVisualizer;

