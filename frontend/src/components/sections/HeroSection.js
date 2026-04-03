import React, { useRef, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Shield, Zap, Eye } from 'lucide-react';
import TypeWriter from '../ui/TypeWriter';

// Particle canvas background
function ParticleField() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animId;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles = Array.from({ length: 120 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      r: Math.random() * 1.5 + 0.3,
      opacity: Math.random() * 0.5 + 0.1,
    }));

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw connections
      particles.forEach((p, i) => {
        particles.slice(i + 1).forEach((p2) => {
          const dx = p.x - p2.x;
          const dy = p.y - p2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 120) {
            ctx.strokeStyle = `rgba(0,245,255,${0.08 * (1 - dist / 120)})`;
            ctx.lineWidth = 0.5;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
          }
        });
      });

      // Draw particles
      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(0,245,255,${p.opacity})`;
        ctx.fill();
      });

      animId = requestAnimationFrame(draw);
    };

    draw();

    const onResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', onResize);
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', onResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none"
      style={{ opacity: 0.7 }}
    />
  );
}

// 3D-like rotating shield orb (CSS + SVG)
function ShieldOrb() {
  return (
    <div className="relative w-72 h-72 md:w-96 md:h-96 flex items-center justify-center animate-float">
      {/* Outer rings */}
      {[1, 0.85, 0.7].map((scale, i) => (
        <div
          key={i}
          className="absolute rounded-full border border-[rgba(0,245,255,0.15)]"
          style={{
            width: `${scale * 100}%`,
            height: `${scale * 100}%`,
            animation: `spin ${8 + i * 3}s linear infinite ${i % 2 ? 'reverse' : ''}`,
            borderStyle: i === 1 ? 'dashed' : 'solid',
          }}
        />
      ))}

      {/* Glow orb */}
      <div
        className="absolute w-48 h-48 md:w-64 md:h-64 rounded-full"
        style={{
          background: 'radial-gradient(ellipse at center, rgba(0,245,255,0.15) 0%, rgba(0,245,255,0.05) 50%, transparent 70%)',
          boxShadow: '0 0 60px rgba(0,245,255,0.2), inset 0 0 60px rgba(0,245,255,0.05)',
        }}
      />

      {/* Central shield icon */}
      <div className="relative z-10 flex items-center justify-center">
        <div
          className="w-24 h-24 md:w-32 md:h-32 flex items-center justify-center rounded-sm"
          style={{
            background: 'linear-gradient(135deg, rgba(0,245,255,0.15) 0%, rgba(0,245,255,0.02) 100%)',
            border: '1px solid rgba(0,245,255,0.4)',
            boxShadow: '0 0 30px rgba(0,245,255,0.3)',
          }}
        >
          <Shield size={52} className="text-[var(--accent)] drop-shadow-[0_0_15px_#00f5ff]" />
        </div>
      </div>

      {/* Orbiting dots */}
      {[0, 72, 144, 216, 288].map((deg, i) => (
        <div
          key={i}
          className="absolute"
          style={{
            width: '100%',
            height: '100%',
            animation: `spin 10s linear infinite`,
            animationDelay: `${-i * 2}s`,
          }}
        >
          <div
            className="absolute w-2 h-2 rounded-full bg-[var(--accent)]"
            style={{
              top: '4%',
              left: '50%',
              transform: `rotate(${deg}deg) translateY(-50%)`,
              boxShadow: '0 0 6px #00f5ff',
            }}
          />
        </div>
      ))}
    </div>
  );
}

// Live alert ticker
const alerts = [
  { msg: 'VoiceAssistant → MICROPHONE ACCESS DETECTED', color: '#ff2d55' },
  { msg: 'SocialShare → CAMERA BLOCKED', color: '#00ff88' },
  { msg: 'MapsApp → BACKGROUND LOCATION REQUEST', color: '#ff6b00' },
  { msg: 'Messenger → CONTACTS READ', color: '#ff6b00' },
  { msg: 'Analytics.js → CLIPBOARD ACCESSED', color: '#ff2d55' },
];

function LiveAlertTicker() {
  const [idx, setIdx] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setIdx(i => (i + 1) % alerts.length);
        setVisible(true);
      }, 300);
    }, 2800);
    return () => clearInterval(interval);
  }, []);

  const alert = alerts[idx];

  return (
    <div className="flex items-center gap-3 px-4 py-2 border border-[rgba(255,45,85,0.2)] bg-[rgba(255,45,85,0.05)] rounded-sm">
      <div className="w-1.5 h-1.5 rounded-full bg-[var(--red)] animate-ping flex-shrink-0" />
      <span
        className="font-mono text-xs transition-opacity duration-300"
        style={{ color: alert.color, opacity: visible ? 1 : 0 }}
      >
        LIVE: {alert.msg}
      </span>
    </div>
  );
}

export default function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
      <ParticleField />

      {/* Radial glow center */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse 80% 60% at 50% 50%, rgba(0,245,255,0.04) 0%, transparent 70%)',
        }}
      />

      <div className="relative z-10 max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center py-20">
        {/* Left content */}
        <div className="flex flex-col gap-8">
          {/* Status badge */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 border border-[rgba(0,255,136,0.3)] bg-[rgba(0,255,136,0.05)] rounded-sm">
              <div className="w-1.5 h-1.5 rounded-full bg-[var(--green)] animate-pulse" />
              <span className="font-mono text-xs text-[var(--green)] tracking-widest uppercase">System Active</span>
            </div>
            <div className="h-px flex-1 bg-gradient-to-r from-[rgba(0,255,136,0.3)] to-transparent" />
          </div>

          {/* Headline */}
          <div>
            <h1 className="font-display font-black leading-none text-5xl md:text-7xl text-white mb-4">
              RECLAIM
              <br />
              YOUR<br />
              <span
                className="text-[var(--accent)] animate-glow"
                style={{ textShadow: '0 0 30px rgba(0,245,255,0.5)' }}
              >
                DIGITAL
              </span>
              <br />
              IDENTITY
            </h1>
            <div className="font-mono text-[var(--accent)] text-lg mt-2">
              <TypeWriter
                texts={[
                  'Scanning privacy policies in real-time...',
                  'Detecting hidden permissions...',
                  'Generating your risk score...',
                  'Protecting your data 24/7...',
                ]}
              />
            </div>
          </div>

          <p className="text-slate-400 text-lg leading-relaxed font-body max-w-lg">
            DataShield uses high-performance NLP to scan thousands of lines of legal text in seconds — exposing the red-flag clauses you'd never find on your own.
          </p>

          {/* Stats row */}
          <div className="grid grid-cols-3 gap-6">
            {[
              { val: '91%', label: 'Users skip TOS' },
              { val: '<2s', label: 'Scan time' },
              { val: '0–100', label: 'Risk metric' },
            ].map(({ val, label }) => (
              <div key={label} className="border-l border-[rgba(0,245,255,0.2)] pl-4">
                <div className="font-display font-bold text-2xl text-[var(--accent)]">{val}</div>
                <div className="font-mono text-xs text-slate-500 mt-1">{label}</div>
              </div>
            ))}
          </div>

          {/* CTAs */}
          <div className="flex flex-wrap gap-4">
            <Link to="/scanner" className="btn-primary">
              <span className="flex items-center gap-2">
                <Zap size={15} />
                Scan a Website
              </span>
            </Link>
            <Link
              to="/monitor"
              className="flex items-center gap-2 px-8 py-3 font-mono text-sm text-slate-400 hover:text-white border border-[rgba(255,255,255,0.1)] hover:border-[rgba(255,255,255,0.3)] rounded-sm transition-all duration-300"
            >
              <Eye size={15} />
              Live Monitor
            </Link>
          </div>

          {/* Live alert */}
          <LiveAlertTicker />
        </div>

        {/* Right — 3D orb */}
        <div className="flex justify-center items-center">
          <ShieldOrb />
        </div>
      </div>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-shield-900 to-transparent pointer-events-none" />
    </section>
  );
}
