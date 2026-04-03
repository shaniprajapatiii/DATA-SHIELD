import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, ArrowRight } from 'lucide-react';

export default function CTASection() {
  return (
    <section className="py-24 relative overflow-hidden">
      {/* Background glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse 60% 60% at 50% 50%, rgba(0,245,255,0.06) 0%, transparent 70%)',
        }}
      />
      <div className="absolute inset-0 grid-bg opacity-20 pointer-events-none" />

      <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
        <div className="flex justify-center mb-8">
          <div
            className="w-20 h-20 flex items-center justify-center rounded-sm"
            style={{
              background: 'rgba(0,245,255,0.08)',
              border: '1px solid rgba(0,245,255,0.3)',
              boxShadow: '0 0 40px rgba(0,245,255,0.15)',
            }}
          >
            <Shield size={40} className="text-[var(--accent)]" style={{ filter: 'drop-shadow(0 0 10px #00f5ff)' }} />
          </div>
        </div>

        <h2 className="font-display font-black text-4xl md:text-6xl text-white leading-tight mb-6">
          YOUR PRIVACY IS<br />
          <span className="text-[var(--accent)]" style={{ textShadow: '0 0 30px rgba(0,245,255,0.4)' }}>
            NOT NEGOTIABLE
          </span>
        </h2>

        <p className="text-slate-400 text-xl font-body mb-10 max-w-2xl mx-auto leading-relaxed">
          Join thousands who've taken back control. DataShield turns the black box of data harvesting into a glass house of transparency.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/register" className="btn-primary text-base px-10 py-4">
            <span className="flex items-center gap-3">
              Start Free Scan <ArrowRight size={16} />
            </span>
          </Link>
          <Link
            to="/scanner"
            className="px-10 py-4 font-mono text-sm text-slate-400 border border-[rgba(255,255,255,0.1)] hover:border-[rgba(0,245,255,0.3)] hover:text-[var(--accent)] rounded-sm transition-all duration-300"
          >
            Try Scanner →
          </Link>
        </div>

        {/* Trust indicators */}
        <div className="flex flex-wrap justify-center gap-8 mt-14">
          {[
            { val: '50K+', label: 'Scans completed' },
            { val: 'GDPR', label: 'Compliant' },
            { val: 'Free', label: 'No credit card' },
          ].map(({ val, label }) => (
            <div key={label} className="text-center">
              <div className="font-display font-bold text-2xl text-[var(--accent)]">{val}</div>
              <div className="font-mono text-xs text-slate-600 mt-1 uppercase tracking-wider">{label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
