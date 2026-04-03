import React, { useState } from 'react';
import { Shield, Zap, Eye, FileText, BarChart3, GitCompare } from 'lucide-react';

const features = [
  {
    icon: BarChart3,
    title: 'Risk Score Engine',
    tag: '0 — 100 METRIC',
    color: '#00f5ff',
    desc: 'Our proprietary algorithm aggregates permission requests, background behaviors, and policy sentiment into a single actionable safety score — updated in real-time as apps change.',
    bullets: ['Aggregated from 40+ risk signals', 'Dynamic — updates on policy change', 'Actionable recommendations included'],
  },
  {
    icon: Eye,
    title: 'Live Permission Monitor',
    tag: 'REAL-TIME',
    color: '#ff2d55',
    desc: "DataShield's Live Permission Analyzer surfaces every moment an app accesses your camera, microphone, clipboard, or location — even in background — and lets you kill the access instantly.",
    bullets: ['Camera & microphone detection', 'Background location tracking', 'Kill-switch for every permission'],
  },
  {
    icon: FileText,
    title: 'Policy Summarizer',
    tag: 'NLP-POWERED',
    color: '#00ff88',
    desc: "Our NLP engine converts 50-page privacy policies into 3 core bullets: what data is collected, who it's shared with, and how long it's retained. Hostile/Neutral/Protective sentiment tagging included.",
    bullets: ['AI extracts "Big Three" data points', 'Sentiment: Hostile / Neutral / Protective', 'Side-by-side comparison of 2 apps'],
  },
  {
    icon: Zap,
    title: 'Instant Scanner',
    tag: 'ANY WEBSITE',
    color: '#ff6b00',
    desc: 'Paste any URL and DataShield crawls the site\'s permissions, TOS, and network calls in under 2 seconds — revealing hidden trackers, third-party data sharing, and red-flag clauses.',
    bullets: ['Analyzes TOS + permissions + trackers', 'Detects hidden third-party sharing', 'Full report with fix recommendations'],
  },
  {
    icon: GitCompare,
    title: 'App Comparison',
    tag: 'SIDE-BY-SIDE',
    color: '#7c3aed',
    desc: 'Compare the privacy posture of two competing apps or websites head-to-head. Instantly see which platform respects your data more — empowering you to vote with your clicks.',
    bullets: ['Compare any two apps/sites', 'Privacy score differential', 'Drives market demand for better privacy'],
  },
  {
    icon: Shield,
    title: 'Enterprise API',
    tag: 'DEVELOPER-READY',
    color: '#00f5ff',
    desc: 'Integrate DataShield risk scores directly into your product ecosystem via our public REST API. Ship privacy-first features without building the analysis layer yourself.',
    bullets: ['REST API with JSON responses', 'Embed risk scores in your app', 'Webhook alerts on policy change'],
  },
];

export default function FeaturesSection() {
  const [active, setActive] = useState(0);
  const feat = features[active];
  const Icon = feat.icon;

  return (
    <section className="relative py-32 max-w-7xl mx-auto px-6">
      {/* Section header */}
      <div className="text-center mb-20">
        <p className="font-mono text-xs text-[var(--accent)] tracking-widest uppercase mb-4">// CAPABILITIES</p>
        <h2 className="font-display font-bold text-4xl md:text-5xl text-white leading-tight">
          THE FULL<br />
          <span className="text-[var(--accent)]">INTELLIGENCE STACK</span>
        </h2>
        <div className="h-px w-24 bg-[var(--accent)] mx-auto mt-6 opacity-50" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* Feature list */}
        <div className="lg:col-span-2 flex flex-col gap-2">
          {features.map((f, i) => {
            const FIcon = f.icon;
            return (
              <button
                key={i}
                onClick={() => setActive(i)}
                className={`flex items-center gap-4 px-5 py-4 rounded-sm border text-left transition-all duration-300 ${
                  active === i
                    ? 'border-[rgba(0,245,255,0.4)] bg-[rgba(0,245,255,0.05)]'
                    : 'border-transparent hover:border-[rgba(0,245,255,0.1)] hover:bg-[rgba(0,245,255,0.02)]'
                }`}
              >
                <FIcon size={18} style={{ color: active === i ? f.color : '#475569' }} />
                <div>
                  <p className={`font-mono text-sm font-semibold transition-colors duration-300 ${active === i ? 'text-white' : 'text-slate-500'}`}>
                    {f.title}
                  </p>
                  <p className="font-mono text-xs" style={{ color: active === i ? f.color : 'transparent' }}>
                    {f.tag}
                  </p>
                </div>
                {active === i && (
                  <div className="ml-auto w-1 h-8 rounded-full" style={{ background: f.color }} />
                )}
              </button>
            );
          })}
        </div>

        {/* Feature detail */}
        <div
          key={active}
          className="lg:col-span-3 card-glass rounded-sm p-8 flex flex-col gap-6"
          style={{
            borderColor: `${feat.color}25`,
            boxShadow: `0 0 40px ${feat.color}10`,
          }}
        >
          <div className="flex items-start gap-4">
            <div
              className="w-14 h-14 flex items-center justify-center rounded-sm flex-shrink-0"
              style={{ background: `${feat.color}15`, border: `1px solid ${feat.color}40` }}
            >
              <Icon size={26} style={{ color: feat.color }} />
            </div>
            <div>
              <span className="font-mono text-xs tracking-widest" style={{ color: feat.color }}>{feat.tag}</span>
              <h3 className="font-display font-bold text-2xl text-white mt-1">{feat.title}</h3>
            </div>
          </div>

          <p className="text-slate-400 leading-relaxed font-body">{feat.desc}</p>

          <div className="flex flex-col gap-3">
            {feat.bullets.map((b, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: feat.color }} />
                <span className="font-mono text-sm text-slate-300">{b}</span>
              </div>
            ))}
          </div>

          {/* Terminal preview */}
          <div className="bg-shield-900 border border-[rgba(0,245,255,0.1)] rounded-sm p-4 font-mono text-xs mt-2">
            <div className="flex items-center gap-2 mb-3">
              {['#ff5f56','#ffbd2e','#27c93f'].map(c => (
                <div key={c} className="w-2.5 h-2.5 rounded-full" style={{ background: c }} />
              ))}
              <span className="text-slate-600 ml-2">datashield ~ analyzer</span>
            </div>
            <p className="text-slate-500">{'>'} datashield scan --feature <span style={{ color: feat.color }}>{feat.title.toLowerCase().replace(/ /g, '-')}</span></p>
            <p className="text-[var(--green)] mt-1">{'✓'} Analysis complete — {feat.bullets[0]}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
