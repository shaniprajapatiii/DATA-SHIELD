import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, Github, Twitter, Linkedin, Mail } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-shield-800 border-t border-[rgba(0,245,255,0.1)] mt-20">
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <Shield size={24} className="text-[var(--accent)]" />
              <span className="font-display font-bold text-lg tracking-wider">
                DATA<span className="text-[var(--accent)]">SHIELD</span>
              </span>
            </div>
            <p className="text-slate-500 text-sm leading-relaxed font-body max-w-xs">
              Making privacy simple, transparent, and actionable. Reclaim your digital identity in a world of hidden data harvesting.
            </p>
            <div className="flex gap-4 mt-6">
              {[Github, Twitter, Linkedin, Mail].map((Icon, i) => (
                <a key={i} href="#" className="text-slate-600 hover:text-[var(--accent)] transition-colors duration-300">
                  <Icon size={18} />
                </a>
              ))}
            </div>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-mono text-xs uppercase tracking-widest text-[var(--accent)] mb-5">Platform</h4>
            <div className="flex flex-col gap-3">
              {['Scanner', 'Monitor', 'Dashboard', 'API Docs'].map((item) => (
                <Link key={item} to="#" className="text-slate-500 hover:text-slate-200 text-sm font-body transition-colors duration-300">
                  {item}
                </Link>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-mono text-xs uppercase tracking-widest text-[var(--accent)] mb-5">Legal</h4>
            <div className="flex flex-col gap-3">
              {['Privacy Policy', 'Terms of Service', 'GDPR', 'Cookie Policy'].map((item) => (
                <Link key={item} to="#" className="text-slate-500 hover:text-slate-200 text-sm font-body transition-colors duration-300">
                  {item}
                </Link>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-[rgba(0,245,255,0.07)] flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="font-mono text-xs text-slate-600">
            © {new Date().getFullYear()} DATASHIELD. All rights reserved.
          </p>
          <p className="font-mono text-xs text-slate-700">
            <span className="text-[var(--accent)]">■</span> SYSTEM ACTIVE — MONITORING ENABLED
          </p>
        </div>
      </div>
    </footer>
  );
}
