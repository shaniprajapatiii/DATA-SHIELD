import React, { useState } from 'react';
import RiskScore from '../ui/RiskScore';
import PermissionBadge from '../ui/PermissionBadge';
import { Search, ExternalLink } from 'lucide-react';

const demoSites = [
  {
    name: 'Social Media App',
    url: 'example-social.com',
    score: 82,
    permissions: [
      { type: 'microphone', status: 'active', app: 'Social Media' },
      { type: 'camera', status: 'active', app: 'Social Media' },
      { type: 'location', status: 'active', app: 'Social Media' },
      { type: 'contacts', status: 'requested', app: 'Social Media' },
    ],
    findings: ['Sells data to 47 third parties', 'Retains data indefinitely', 'Hostile policy tone detected'],
  },
  {
    name: 'Banking App',
    url: 'securebank.com',
    score: 18,
    permissions: [
      { type: 'camera', status: 'idle', app: 'BankApp' },
      { type: 'location', status: 'idle', app: 'BankApp' },
      { type: 'notifications', status: 'requested', app: 'BankApp' },
    ],
    findings: ['Data encrypted end-to-end', '90-day retention policy', 'Protective tone detected'],
  },
  {
    name: 'News Website',
    url: 'news-media.com',
    score: 55,
    permissions: [
      { type: 'location', status: 'requested', app: 'NewsApp' },
      { type: 'clipboard', status: 'active', app: 'NewsApp' },
      { type: 'storage', status: 'requested', app: 'NewsApp' },
    ],
    findings: ['Shares with ad partners', '12-month retention', 'Neutral tone detected'],
  },
];

export default function RiskDemoSection() {
  const [selected, setSelected] = useState(0);
  const site = demoSites[selected];

  return (
    <section className="py-24 max-w-7xl mx-auto px-6">
      <div className="text-center mb-16">
        <p className="font-mono text-xs text-[var(--accent)] tracking-widest uppercase mb-4">// LIVE DEMO</p>
        <h2 className="font-display font-bold text-4xl text-white">
          SEE THE <span className="text-[var(--accent)]">SCORE IN ACTION</span>
        </h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-8">
        {demoSites.map((s, i) => (
          <button
            key={i}
            onClick={() => setSelected(i)}
            className={`px-5 py-4 rounded-sm border text-left transition-all duration-300 ${
              selected === i
                ? 'border-[rgba(0,245,255,0.4)] bg-[rgba(0,245,255,0.05)]'
                : 'border-[rgba(255,255,255,0.06)] hover:border-[rgba(0,245,255,0.2)]'
            }`}
          >
            <div className="flex items-center gap-2 mb-1">
              <Search size={13} className="text-[var(--accent)]" />
              <span className="font-mono text-xs text-[var(--accent)]">{s.url}</span>
            </div>
            <p className="font-display font-semibold text-white text-sm">{s.name}</p>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Score */}
        <div className="card-glass rounded-sm p-8 flex flex-col items-center gap-6">
          <p className="font-mono text-xs text-slate-500 tracking-widest uppercase">RISK SCORE</p>
          <RiskScore score={site.score} key={selected} />
          <div className="w-full">
            <div className="h-px bg-[rgba(0,245,255,0.1)] mb-4" />
            <p className="font-mono text-xs text-slate-500 text-center">{site.url}</p>
          </div>
        </div>

        {/* Permissions */}
        <div className="card-glass rounded-sm p-6 flex flex-col gap-4">
          <p className="font-mono text-xs text-slate-500 tracking-widest uppercase mb-2">LIVE PERMISSIONS</p>
          {site.permissions.map((p, i) => (
            <PermissionBadge key={i} {...p} pulse={p.status === 'active'} />
          ))}
        </div>

        {/* Findings */}
        <div className="card-glass rounded-sm p-6 flex flex-col gap-4">
          <p className="font-mono text-xs text-slate-500 tracking-widest uppercase mb-2">KEY FINDINGS</p>
          {site.findings.map((f, i) => {
            const isGood = f.toLowerCase().includes('encrypt') || f.toLowerCase().includes('protective') || f.toLowerCase().includes('90-day');
            return (
              <div key={i} className="flex items-start gap-3 p-3 rounded-sm border border-[rgba(255,255,255,0.05)] bg-[rgba(255,255,255,0.02)]">
                <div className={`w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0 ${isGood ? 'bg-[var(--green)]' : 'bg-[var(--red)]'}`} />
                <span className="font-mono text-xs text-slate-300 leading-relaxed">{f}</span>
              </div>
            );
          })}
          <button className="mt-2 flex items-center gap-2 font-mono text-xs text-[var(--accent)] hover:underline transition-all">
            <ExternalLink size={12} />
            View full report
          </button>
        </div>
      </div>
    </section>
  );
}
