import React, { useState } from 'react';
import { Activity, Shield, AlertTriangle, Ban } from 'lucide-react';
import { useMonitor } from '../hooks/useMonitor';
import PermissionBadge from '../components/ui/PermissionBadge';

export default function Monitor() {
  const [active, setActive] = useState(true);
  const { permissions, alerts, blockPermission } = useMonitor(active);

  return (
    <main className="min-h-screen pt-28 pb-20 max-w-7xl mx-auto px-6">
      {/* Header */}
      <div className="flex items-start justify-between mb-12 flex-wrap gap-4">
        <div>
          <div className="flex items-center gap-3 mb-3">
            <Activity size={16} className="text-[var(--red)]" />
            <p className="font-mono text-xs text-[var(--red)] tracking-widest uppercase">Live Monitor</p>
          </div>
          <h1 className="font-display font-bold text-4xl text-white">
            PERMISSION <span className="text-[var(--accent)]">FEED</span>
          </h1>
          <p className="text-slate-500 font-body mt-2 max-w-md">
            Real-time detection of every app accessing your device hardware and data.
          </p>
        </div>
        <button
          onClick={() => setActive(a => !a)}
          className={`flex items-center gap-2 px-6 py-3 rounded-sm border font-mono text-sm transition-all duration-300 ${
            active
              ? 'border-[rgba(0,255,136,0.4)] bg-[rgba(0,255,136,0.08)] text-[var(--green)]'
              : 'border-[rgba(255,255,255,0.1)] text-slate-500 hover:text-white'
          }`}
        >
          <div className={`w-2 h-2 rounded-full ${active ? 'bg-[var(--green)] animate-pulse' : 'bg-slate-600'}`} />
          {active ? 'MONITORING ACTIVE' : 'MONITORING PAUSED'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Live feed */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between mb-2">
            <p className="font-mono text-xs text-slate-500 uppercase tracking-widest">Live Permission Feed</p>
            <span className="font-mono text-xs text-slate-600">{permissions.length} events</span>
          </div>
          <div className="space-y-2">
            {permissions.map((p) => (
              <div key={p.id} className="flex items-center gap-3">
                <div className="flex-1">
                  <PermissionBadge {...p} />
                </div>
                {p.status === 'active' && (
                  <button
                    onClick={() => blockPermission(p.id)}
                    className="flex items-center gap-1.5 px-3 py-2 border border-[rgba(255,45,85,0.3)] text-[var(--red)] font-mono text-xs rounded-sm hover:bg-[rgba(255,45,85,0.1)] transition-all flex-shrink-0"
                  >
                    <Ban size={11} />
                    Block
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Alerts panel */}
        <div className="space-y-4">
          <p className="font-mono text-xs text-slate-500 uppercase tracking-widest">Active Alerts</p>
          {alerts.length === 0 ? (
            <div className="card-glass rounded-sm p-8 text-center">
              <Shield size={32} className="text-slate-700 mx-auto mb-3" />
              <p className="font-mono text-xs text-slate-600">No active alerts</p>
            </div>
          ) : (
            <div className="space-y-3">
              {alerts.map((a, i) => (
                <div
                  key={a.id}
                  className="p-4 rounded-sm border border-[rgba(255,45,85,0.2)] bg-[rgba(255,45,85,0.05)] relative overflow-hidden"
                >
                  <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-[var(--red)] to-transparent" />
                  <div className="flex items-start gap-3">
                    <AlertTriangle size={14} className="text-[var(--red)] mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-mono text-xs text-white">{a.message}</p>
                      <p className="font-mono text-xs text-slate-600 mt-1">{a.timestamp}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Stats */}
          <div className="card-glass rounded-sm p-5 space-y-4 mt-6">
            <p className="font-mono text-xs text-slate-500 uppercase tracking-widest">Session Stats</p>
            {[
              { label: 'Active permissions', val: permissions.filter(p => p.status === 'active').length, color: 'var(--red)' },
              { label: 'Blocked', val: permissions.filter(p => p.status === 'blocked').length, color: 'var(--green)' },
              { label: 'Requested', val: permissions.filter(p => p.status === 'requested').length, color: 'var(--orange)' },
            ].map(({ label, val, color }) => (
              <div key={label} className="flex items-center justify-between">
                <span className="font-mono text-xs text-slate-500">{label}</span>
                <span className="font-display font-bold text-lg" style={{ color }}>{val}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
