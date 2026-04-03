import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { Shield, Zap, Activity, BarChart3, Globe, ArrowRight, Lock } from 'lucide-react';
import RiskScore from '../components/ui/RiskScore';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const mockHistory = [
  { date: 'Mon', score: 72 }, { date: 'Tue', score: 65 }, { date: 'Wed', score: 80 },
  { date: 'Thu', score: 45 }, { date: 'Fri', score: 60 }, { date: 'Sat', score: 38 }, { date: 'Sun', score: 52 },
];

const recentScans = [
  { url: 'facebook.com', score: 84, date: '2h ago' },
  { url: 'notion.so', score: 32, date: '5h ago' },
  { url: 'spotify.com', score: 58, date: '1d ago' },
  { url: 'github.com', score: 21, date: '2d ago' },
];

export default function Dashboard() {
  const { user } = useContext(AuthContext);

  if (!user) {
    return (
      <main className="min-h-screen pt-28 flex items-center justify-center px-6">
        <div className="text-center max-w-md">
          <Lock size={48} className="text-slate-700 mx-auto mb-4" />
          <h2 className="font-display font-bold text-2xl text-white mb-3">Authentication Required</h2>
          <p className="text-slate-500 font-body mb-6">Sign in to access your dashboard and scan history.</p>
          <Link to="/login" className="btn-primary inline-block">
            <span>Sign In</span>
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen pt-28 pb-20 max-w-7xl mx-auto px-6">
      {/* Header */}
      <div className="mb-10">
        <p className="font-mono text-xs text-[var(--accent)] tracking-widest uppercase mb-2">// Dashboard</p>
        <h1 className="font-display font-bold text-3xl text-white">
          Welcome back, <span className="text-[var(--accent)]">{user.name}</span>
        </h1>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total Scans', val: '24', icon: Globe, color: '#00f5ff' },
          { label: 'Avg Risk Score', val: '61', icon: BarChart3, color: '#ff6b00' },
          { label: 'Alerts Today', val: '8', icon: Activity, color: '#ff2d55' },
          { label: 'Protected', val: '3', icon: Shield, color: '#00ff88' },
        ].map(({ label, val, icon: Icon, color }) => (
          <div key={label} className="card-glass rounded-sm p-5">
            <div className="flex items-center justify-between mb-3">
              <Icon size={16} style={{ color }} />
              <span className="font-mono text-xs text-slate-600 uppercase tracking-wider">{label}</span>
            </div>
            <p className="font-display font-bold text-3xl" style={{ color }}>{val}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Chart */}
        <div className="lg:col-span-2 card-glass rounded-sm p-6">
          <p className="font-mono text-xs text-slate-500 uppercase tracking-widest mb-6">Risk Score Trend (7 days)</p>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={mockHistory}>
              <XAxis dataKey="date" tick={{ fontFamily: 'JetBrains Mono', fontSize: 11, fill: '#475569' }} axisLine={false} tickLine={false} />
              <YAxis domain={[0, 100]} tick={{ fontFamily: 'JetBrains Mono', fontSize: 11, fill: '#475569' }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ background: '#0a0f1e', border: '1px solid rgba(0,245,255,0.2)', borderRadius: 2, fontFamily: 'JetBrains Mono', fontSize: 12 }}
                labelStyle={{ color: '#00f5ff' }}
                itemStyle={{ color: '#e2e8f0' }}
              />
              <Line type="monotone" dataKey="score" stroke="#00f5ff" strokeWidth={2} dot={{ fill: '#00f5ff', r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Current score */}
        <div className="card-glass rounded-sm p-6 flex flex-col items-center justify-center gap-4">
          <p className="font-mono text-xs text-slate-500 uppercase tracking-widest">Overall Risk</p>
          <RiskScore score={61} animate />
          <p className="font-mono text-xs text-slate-600 text-center">Based on your last 24 scans</p>
        </div>
      </div>

      {/* Recent scans */}
      <div className="mt-8 card-glass rounded-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <p className="font-mono text-xs text-slate-500 uppercase tracking-widest">Recent Scans</p>
          <Link to="/scanner" className="flex items-center gap-1.5 font-mono text-xs text-[var(--accent)] hover:underline">
            New Scan <ArrowRight size={12} />
          </Link>
        </div>
        <div className="space-y-3">
          {recentScans.map(({ url, score, date }) => {
            const color = score > 65 ? '#ff2d55' : score > 35 ? '#ff6b00' : '#00ff88';
            return (
              <div key={url} className="flex items-center justify-between py-3 border-b border-[rgba(255,255,255,0.04)]">
                <div className="flex items-center gap-3">
                  <Globe size={14} className="text-slate-600" />
                  <span className="font-mono text-sm text-white">{url}</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="font-mono text-xs text-slate-600">{date}</span>
                  <span className="font-display font-bold text-lg" style={{ color }}>{score}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
        <Link to="/scanner" className="card-glass rounded-sm p-5 flex items-center gap-4 hover:border-[rgba(0,245,255,0.3)] transition-all group">
          <div className="w-10 h-10 flex items-center justify-center rounded-sm bg-[rgba(0,245,255,0.1)] border border-[rgba(0,245,255,0.2)]">
            <Zap size={18} className="text-[var(--accent)]" />
          </div>
          <div>
            <p className="font-mono text-sm text-white font-semibold">Scan Website</p>
            <p className="font-mono text-xs text-slate-500">Analyze any URL instantly</p>
          </div>
          <ArrowRight size={14} className="text-slate-600 ml-auto group-hover:text-[var(--accent)] transition-colors" />
        </Link>
        <Link to="/monitor" className="card-glass rounded-sm p-5 flex items-center gap-4 hover:border-[rgba(255,45,85,0.3)] transition-all group">
          <div className="w-10 h-10 flex items-center justify-center rounded-sm bg-[rgba(255,45,85,0.1)] border border-[rgba(255,45,85,0.2)]">
            <Activity size={18} className="text-[var(--red)]" />
          </div>
          <div>
            <p className="font-mono text-sm text-white font-semibold">Live Monitor</p>
            <p className="font-mono text-xs text-slate-500">Watch permission activity</p>
          </div>
          <ArrowRight size={14} className="text-slate-600 ml-auto group-hover:text-[var(--red)] transition-colors" />
        </Link>
      </div>
    </main>
  );
}
