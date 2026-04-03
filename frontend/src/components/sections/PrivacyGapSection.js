import React from 'react';
import { Lock, EyeOff, AlertOctagon } from 'lucide-react';

const gaps = [
  {
    icon: Lock,
    title: 'Legal Obfuscation',
    stat: '91%',
    statLabel: 'of users accept TOS without reading',
    color: '#ff2d55',
    desc: 'Privacy policies are intentionally engineered to be unreadable — wall-of-text legalese masking the true extent of data collection. DataShield strips the veil.',
  },
  {
    icon: EyeOff,
    title: 'Hidden Permissions',
    stat: '6+',
    statLabel: 'background access vectors per average app',
    color: '#ff6b00',
    desc: 'Modern apps silently access cameras, microphones, location, clipboard, contacts, and storage — all while running in background with zero user awareness.',
  },
  {
    icon: AlertOctagon,
    title: 'Zero Transparency',
    stat: '0',
    statLabel: 'unified tools existed before DataShield',
    color: '#7c3aed',
    desc: 'No single tool existed to quantify app risk before installation or use. DataShield is the first platform to give users a proactive, pre-install safety rating.',
  },
];

export default function PrivacyGapSection() {
  return (
    <section className="relative py-24 bg-shield-800 border-y border-[rgba(0,245,255,0.08)]">
      {/* Hex texture overlay */}
      <div className="absolute inset-0 hex-bg opacity-30 pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <p className="font-mono text-xs text-[var(--red)] tracking-widest uppercase mb-4">// THE CRISIS</p>
          <h2 className="font-display font-bold text-4xl md:text-5xl text-white">
            THE <span className="text-[var(--red)]" style={{ textShadow: '0 0 20px rgba(255,45,85,0.4)' }}>PRIVACY GAP</span>
          </h2>
          <p className="text-slate-500 mt-4 font-body max-w-xl mx-auto">
            Hidden data harvesting is systemic. Three forces combine to strip your digital rights.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {gaps.map(({ icon: Icon, title, stat, statLabel, color, desc }) => (
            <div
              key={title}
              className="relative overflow-hidden rounded-sm p-8 border transition-all duration-500 hover:scale-[1.02] group"
              style={{
                borderColor: `${color}20`,
                background: `linear-gradient(135deg, ${color}08 0%, rgba(10,15,30,0.6) 100%)`,
              }}
            >
              {/* Top accent line */}
              <div className="absolute top-0 left-0 right-0 h-0.5" style={{ background: `linear-gradient(90deg, transparent, ${color}, transparent)` }} />

              <div
                className="w-12 h-12 flex items-center justify-center rounded-sm mb-6"
                style={{ background: `${color}15`, border: `1px solid ${color}40` }}
              >
                <Icon size={22} style={{ color }} />
              </div>

              <p className="font-mono text-xs tracking-widest uppercase mb-2" style={{ color }}>
                0{gaps.findIndex(g => g.title === title) + 1} / CRISIS
              </p>
              <h3 className="font-display font-bold text-xl text-white mb-4">{title}</h3>

              {/* Stat */}
              <div className="flex items-baseline gap-2 mb-4">
                <span className="font-display font-black text-4xl" style={{ color, textShadow: `0 0 15px ${color}60` }}>
                  {stat}
                </span>
                <span className="font-mono text-xs text-slate-500 max-w-[120px] leading-tight">{statLabel}</span>
              </div>

              <p className="text-slate-500 text-sm leading-relaxed font-body">{desc}</p>

              {/* Hover glow */}
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                style={{ background: `radial-gradient(ellipse at center, ${color}06 0%, transparent 70%)` }}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
