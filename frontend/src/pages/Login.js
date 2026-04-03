import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Shield, Eye, EyeOff, LogIn } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) return;
    setLoading(true);
    try {
      await login(email, password);
      toast.success('Access granted. Welcome back.');
      navigate('/dashboard');
    } catch {
      toast.error('Authentication failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen pt-24 flex items-center justify-center px-6 relative">
      {/* Background */}
      <div className="absolute inset-0 grid-bg opacity-20 pointer-events-none" />
      <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse 60% 60% at 50% 50%, rgba(0,245,255,0.04) 0%, transparent 70%)' }} />

      <div className="relative z-10 w-full max-w-md">
        {/* Card */}
        <div className="card-glass rounded-sm p-8 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-[var(--accent)] to-transparent" />

          {/* Logo */}
          <div className="flex items-center gap-3 mb-8">
            <Shield size={24} className="text-[var(--accent)]" />
            <span className="font-display font-bold text-lg tracking-wider">DATA<span className="text-[var(--accent)]">SHIELD</span></span>
          </div>

          <h1 className="font-display font-bold text-2xl text-white mb-2">AUTHENTICATE</h1>
          <p className="font-mono text-xs text-slate-500 mb-8">Enter your credentials to access the platform</p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="font-mono text-xs text-slate-500 uppercase tracking-wider block mb-2">Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full bg-shield-900 border border-[rgba(0,245,255,0.15)] rounded-sm px-4 py-3 font-mono text-sm text-white placeholder-slate-600 focus:outline-none focus:border-[rgba(0,245,255,0.5)] transition-colors"
                required
              />
            </div>

            <div>
              <label className="font-mono text-xs text-slate-500 uppercase tracking-wider block mb-2">Password</label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-shield-900 border border-[rgba(0,245,255,0.15)] rounded-sm px-4 py-3 font-mono text-sm text-white placeholder-slate-600 focus:outline-none focus:border-[rgba(0,245,255,0.5)] transition-colors pr-12"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPass(s => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                >
                  {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-[var(--accent)] text-shield-900 font-display font-bold text-sm rounded-sm hover:bg-white transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <LogIn size={16} />
              {loading ? 'AUTHENTICATING...' : 'ACCESS DATASHIELD'}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-[rgba(255,255,255,0.05)] flex items-center justify-between">
            <span className="font-mono text-xs text-slate-600">No account?</span>
            <Link to="/register" className="font-mono text-xs text-[var(--accent)] hover:underline">
              Create one →
            </Link>
          </div>
        </div>

        {/* Terminal decoration */}
        <div className="mt-4 px-4 py-3 bg-shield-800 border border-[rgba(0,245,255,0.08)] rounded-sm">
          <p className="font-mono text-xs text-slate-600">
            <span className="text-[var(--green)]">$</span> datashield --auth --secure --encrypted
            <span className="cursor-blink text-[var(--accent)]"> |</span>
          </p>
        </div>
      </div>
    </main>
  );
}
