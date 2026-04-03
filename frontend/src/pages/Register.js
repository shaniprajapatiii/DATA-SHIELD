import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Shield, Eye, EyeOff, UserPlus, Check } from 'lucide-react';
import toast from 'react-hot-toast';

const perks = [
  'Unlimited website scans',
  'Real-time permission monitoring',
  'Full policy summarization',
  'Risk score history & trends',
];

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const { register } = useContext(AuthContext);
  const navigate = useNavigate();

  const update = (field) => (e) => setForm(f => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password) return;
    setLoading(true);
    try {
      await register(form.email, form.password, form.name);
      toast.success('Account created. Shield activated.');
      navigate('/dashboard');
    } catch {
      toast.error('Registration failed. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen pt-24 flex items-center justify-center px-6 relative">
      <div className="absolute inset-0 grid-bg opacity-20 pointer-events-none" />

      <div className="relative z-10 w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Left: perks */}
        <div className="flex flex-col justify-center gap-8">
          <div>
            <div className="flex items-center gap-3 mb-6">
              <Shield size={24} className="text-[var(--accent)]" />
              <span className="font-display font-bold text-lg tracking-wider">DATA<span className="text-[var(--accent)]">SHIELD</span></span>
            </div>
            <h2 className="font-display font-bold text-3xl text-white leading-tight mb-4">
              ACTIVATE YOUR<br />
              <span className="text-[var(--accent)]">SHIELD</span>
            </h2>
            <p className="text-slate-500 font-body text-sm leading-relaxed">
              Join thousands reclaiming digital privacy. Free forever — no credit card required.
            </p>
          </div>

          <div className="space-y-3">
            {perks.map((p, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-sm bg-[rgba(0,255,136,0.1)] border border-[rgba(0,255,136,0.3)] flex items-center justify-center flex-shrink-0">
                  <Check size={11} className="text-[var(--green)]" />
                </div>
                <span className="font-mono text-sm text-slate-300">{p}</span>
              </div>
            ))}
          </div>

          <div className="p-4 border border-[rgba(0,245,255,0.1)] bg-[rgba(0,245,255,0.03)] rounded-sm">
            <p className="font-mono text-xs text-slate-500 leading-relaxed">
              <span className="text-[var(--accent)]">■</span> DataShield never stores your browsing data. Scans are processed and discarded. Your privacy is our architecture.
            </p>
          </div>
        </div>

        {/* Right: form */}
        <div className="card-glass rounded-sm p-8 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-[var(--accent)] to-transparent" />

          <h3 className="font-display font-bold text-xl text-white mb-6">CREATE ACCOUNT</h3>

          <form onSubmit={handleSubmit} className="space-y-5">
            {[
              { label: 'Full Name', field: 'name', type: 'text', placeholder: 'John Doe' },
              { label: 'Email', field: 'email', type: 'email', placeholder: 'you@example.com' },
            ].map(({ label, field, type, placeholder }) => (
              <div key={field}>
                <label className="font-mono text-xs text-slate-500 uppercase tracking-wider block mb-2">{label}</label>
                <input
                  type={type}
                  value={form[field]}
                  onChange={update(field)}
                  placeholder={placeholder}
                  className="w-full bg-shield-900 border border-[rgba(0,245,255,0.15)] rounded-sm px-4 py-3 font-mono text-sm text-white placeholder-slate-600 focus:outline-none focus:border-[rgba(0,245,255,0.5)] transition-colors"
                  required
                />
              </div>
            ))}

            <div>
              <label className="font-mono text-xs text-slate-500 uppercase tracking-wider block mb-2">Password</label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  value={form.password}
                  onChange={update('password')}
                  placeholder="Min 8 characters"
                  className="w-full bg-shield-900 border border-[rgba(0,245,255,0.15)] rounded-sm px-4 py-3 font-mono text-sm text-white placeholder-slate-600 focus:outline-none focus:border-[rgba(0,245,255,0.5)] transition-colors pr-12"
                  required
                  minLength={8}
                />
                <button type="button" onClick={() => setShowPass(s => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300">
                  {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-[var(--accent)] text-shield-900 font-display font-bold text-sm rounded-sm hover:bg-white transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <UserPlus size={16} />
              {loading ? 'ACTIVATING...' : 'ACTIVATE SHIELD'}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-[rgba(255,255,255,0.05)] text-center">
            <span className="font-mono text-xs text-slate-600">Already have an account? </span>
            <Link to="/login" className="font-mono text-xs text-[var(--accent)] hover:underline">Sign in →</Link>
          </div>
        </div>
      </div>
    </main>
  );
}
