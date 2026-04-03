import React, { useEffect, useRef, useState } from 'react';
import { AlertTriangle, CheckCircle, XCircle } from 'lucide-react';

function getRiskLevel(score) {
  if (score <= 30) return { label: 'LOW RISK', color: '#00ff88', icon: CheckCircle };
  if (score <= 65) return { label: 'MEDIUM RISK', color: '#ff6b00', icon: AlertTriangle };
  return { label: 'HIGH RISK', color: '#ff2d55', icon: XCircle };
}

export default function RiskScore({ score = 72, size = 'lg', animate = true }) {
  const [displayed, setDisplayed] = useState(0);
  const canvasRef = useRef(null);
  const animRef = useRef(null);
  const risk = getRiskLevel(score);
  const Icon = risk.icon;

  const radius = size === 'lg' ? 80 : 50;
  const strokeWidth = size === 'lg' ? 8 : 5;
  const svgSize = (radius + strokeWidth) * 2 + 8;
  const circumference = 2 * Math.PI * radius;

  useEffect(() => {
    if (!animate) { setDisplayed(score); return; }
    let start = null;
    const duration = 1800;
    const step = (ts) => {
      if (!start) start = ts;
      const progress = Math.min((ts - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayed(Math.round(eased * score));
      if (progress < 1) animRef.current = requestAnimationFrame(step);
    };
    animRef.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(animRef.current);
  }, [score, animate]);

  const dashOffset = circumference - (displayed / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative" style={{ width: svgSize, height: svgSize }}>
        <svg width={svgSize} height={svgSize} className="-rotate-90">
          {/* Track */}
          <circle
            cx={svgSize / 2}
            cy={svgSize / 2}
            r={radius}
            fill="none"
            stroke="rgba(255,255,255,0.05)"
            strokeWidth={strokeWidth}
          />
          {/* Progress */}
          <circle
            cx={svgSize / 2}
            cy={svgSize / 2}
            r={radius}
            fill="none"
            stroke={risk.color}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
            strokeLinecap="round"
            style={{
              filter: `drop-shadow(0 0 8px ${risk.color})`,
              transition: 'stroke-dashoffset 0.05s linear',
            }}
          />
        </svg>
        {/* Center text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span
            className="font-display font-bold"
            style={{
              fontSize: size === 'lg' ? '2.5rem' : '1.5rem',
              color: risk.color,
              textShadow: `0 0 20px ${risk.color}`,
            }}
          >
            {displayed}
          </span>
          <span className="font-mono text-xs text-slate-500">/ 100</span>
        </div>
      </div>

      {/* Label */}
      <div className="flex items-center gap-2 px-4 py-1.5 rounded-sm border" style={{ borderColor: `${risk.color}40`, background: `${risk.color}10` }}>
        <Icon size={13} style={{ color: risk.color }} />
        <span className="font-mono text-xs font-semibold" style={{ color: risk.color }}>
          {risk.label}
        </span>
      </div>
    </div>
  );
}
