import React, { useState } from 'react';
import { Search, Zap, AlertTriangle, CheckCircle, XCircle, Globe, Shield, ExternalLink } from 'lucide-react';
import { useScanner } from '../hooks/useScanner';
import RiskScore from '../components/ui/RiskScore';
import PermissionBadge from '../components/ui/PermissionBadge';

function ScanProgress({ progress }) {
  const steps = [
    { label: 'Connecting', threshold: 15 },
    { label: 'Fetching Policy', threshold: 35 },
    { label: 'NLP Analysis', threshold: 55 },
    { label: 'Permission Scan', threshold: 75 },
    { label: 'Risk Scoring', threshold: 90 },
    { label: 'Complete', threshold: 100 },
  ];

  return (
    <div className="space-y-4">
      <div className="relative h-1.5 bg-shield-700 rounded-full overflow-hidden">
        <div
          className="absolute left-0 top-0 h-full bg-[var(--accent)] rounded-full transition-all duration-500"
          style={{ width: `${progress}%`, boxShadow: '0 0 10px rgba(0,245,255,0.6)' }}
        />
      </div>
      <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
        {steps.map(({ label, threshold }) => (
          <div key={label} className="flex flex-col items-center gap-1">
            <div
              className={`w-2 h-2 rounded-full transition-all duration-500 ${
                progress >= threshold ? 'bg-[var(--accent)]' : 'bg-shield-600'
              }`}
              style={progress >= threshold ? { boxShadow: '0 0 6px #00f5ff' } : {}}
            />
            <span className={`font-mono text-[10px] text-center ${progress >= threshold ? 'text-[var(--accent)]' : 'text-slate-600'}`}>
              {label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function ScanResult({ result }) {
  const sentimentColors = { Hostile: '#ff2d55', Neutral: '#ff6b00', Protective: '#00ff88' };
  const sColor = sentimentColors[result.sentiment] || '#00f5ff';

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Score */}
        <div className="card-glass rounded-sm p-8 flex flex-col items-center gap-4">
          <p className="font-mono text-xs text-slate-500 uppercase tracking-widest">Risk Score</p>
          <RiskScore score={result.score} />
        </div>

        {/* Summary */}
        <div className="card-glass rounded-sm p-6 space-y-4">
          <p className="font-mono text-xs text-slate-500 uppercase tracking-widest">Policy Summary</p>
          {[
            { label: 'Data Collected', val: result.summary.collected },
            { label: 'Shared With', val: result.summary.sharedWith },
            { label: 'Retained For', val: result.summary.retainedFor },
          ].map(({ label, val }) => (
            <div key={label} className="border-b border-[rgba(255,255,255,0.05)] pb-3">
              <p className="font-mono text-xs text-slate-600 mb-1">{label}</p>
              <p className="font-mono text-xs text-slate-300">{val}</p>
            </div>
          ))}
        </div>

        {/* Meta */}
        <div className="card-glass rounded-sm p-6 space-y-4">
          <p className="font-mono text-xs text-slate-500 uppercase tracking-widest">Site Metadata</p>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs text-slate-500">Sentiment</span>
              <span className="font-mono text-xs font-bold" style={{ color: sColor }}>{result.sentiment}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs text-slate-500">SSL</span>
              <span className={`font-mono text-xs ${result.ssl ? 'text-[var(--green)]' : 'text-[var(--red)]'}`}>
                {result.ssl ? '✓ Valid' : '✗ Missing'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs text-slate-500">GDPR</span>
              <span className={`font-mono text-xs ${result.gdprCompliant ? 'text-[var(--green)]' : 'text-[var(--red)]'}`}>
                {result.gdprCompliant ? '✓ Compliant' : '✗ Issues found'}
              </span>
            </div>
            <div>
              <p className="font-mono text-xs text-slate-500 mb-2">Trackers Detected</p>
              <div className="flex flex-wrap gap-1">
                {result.trackers.map(t => (
                  <span key={t} className="px-2 py-0.5 bg-[rgba(255,45,85,0.1)] border border-[rgba(255,45,85,0.2)] rounded-sm font-mono text-xs text-[var(--red)]">{t}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Permissions */}
      <div className="card-glass rounded-sm p-6">
        <p className="font-mono text-xs text-slate-500 uppercase tracking-widest mb-4">Permission Analysis</p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {result.permissions.map((p, i) => (
            <PermissionBadge key={i} {...p} pulse={p.status === 'active'} />
          ))}
        </div>
      </div>

      {/* Red flags */}
      <div className="card-glass rounded-sm p-6">
        <p className="font-mono text-xs text-slate-500 uppercase tracking-widest mb-4">Key Findings</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {result.redFlags.map((f, i) => {
            const isGood = f.toLowerCase().includes('encry') || f.toLowerCase().includes('clear') || f.toLowerCase().includes('90');
            return (
              <div key={i} className="flex items-start gap-3 p-4 rounded-sm border border-[rgba(255,255,255,0.05)] bg-[rgba(255,255,255,0.02)]">
                {isGood
                  ? <CheckCircle size={14} className="text-[var(--green)] mt-0.5 flex-shrink-0" />
                  : <AlertTriangle size={14} className="text-[var(--red)] mt-0.5 flex-shrink-0" />
                }
                <span className="font-mono text-xs text-slate-300">{f}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default function Scanner() {
  const [url, setUrl] = useState('');
  const { loading, result, error, progress, scan, reset } = useScanner();

  const handleScan = () => {
    if (!url.trim()) return;
    let target = url.trim();
    if (!target.startsWith('http')) target = 'https://' + target;
    scan(target);
  };

  return (
    <main className="min-h-screen pt-28 pb-20 max-w-6xl mx-auto px-6">
      {/* Header */}
      <div className="mb-12">
        <div className="flex items-center gap-3 mb-3">
          <Globe size={16} className="text-[var(--accent)]" />
          <p className="font-mono text-xs text-[var(--accent)] tracking-widest uppercase">Privacy Scanner</p>
        </div>
        <h1 className="font-display font-bold text-4xl md:text-5xl text-white mb-4">
          SCAN ANY <span className="text-[var(--accent)]">WEBSITE</span>
        </h1>
        <p className="text-slate-500 font-body max-w-xl">
          Enter any URL to analyze its privacy policy, detect hidden permissions, uncover trackers, and get an instant 0–100 risk score.
        </p>
      </div>

      {/* Input */}
      <div className="card-glass rounded-sm p-6 mb-8">
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <Globe size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              value={url}
              onChange={e => setUrl(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleScan()}
              placeholder="https://example.com or paste any URL..."
              className="w-full bg-shield-900 border border-[rgba(0,245,255,0.15)] rounded-sm pl-10 pr-4 py-4 font-mono text-sm text-white placeholder-slate-600 focus:outline-none focus:border-[rgba(0,245,255,0.5)] transition-colors"
            />
          </div>
          <button
            onClick={handleScan}
            disabled={loading || !url.trim()}
            className="px-8 py-4 bg-[var(--accent)] text-shield-900 font-display font-bold text-sm rounded-sm hover:bg-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <Zap size={16} />
            {loading ? 'Scanning...' : 'Scan'}
          </button>
          {result && (
            <button onClick={reset} className="px-4 py-4 border border-[rgba(255,255,255,0.1)] text-slate-400 hover:text-white font-mono text-sm rounded-sm transition-colors">
              Clear
            </button>
          )}
        </div>

        {/* Progress */}
        {loading && (
          <div className="mt-6">
            <ScanProgress progress={progress} />
          </div>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-3 p-4 border border-[rgba(255,45,85,0.3)] bg-[rgba(255,45,85,0.05)] rounded-sm mb-6">
          <XCircle size={16} className="text-[var(--red)]" />
          <span className="font-mono text-sm text-[var(--red)]">{error}</span>
        </div>
      )}

      {/* Results */}
      {result && <ScanResult result={result} />}

      {/* Empty state */}
      {!loading && !result && !error && (
        <div className="text-center py-20">
          <Shield size={48} className="text-slate-700 mx-auto mb-4" />
          <p className="font-mono text-sm text-slate-600">Enter a URL above to begin your privacy scan</p>
          <div className="flex flex-wrap justify-center gap-2 mt-6">
            {['google.com', 'facebook.com', 'amazon.com', 'twitter.com'].map(site => (
              <button
                key={site}
                onClick={() => { setUrl(site); }}
                className="px-3 py-1.5 border border-[rgba(0,245,255,0.1)] hover:border-[rgba(0,245,255,0.3)] font-mono text-xs text-slate-500 hover:text-[var(--accent)] rounded-sm transition-all"
              >
                {site}
              </button>
            ))}
          </div>
        </div>
      )}
    </main>
  );
}
