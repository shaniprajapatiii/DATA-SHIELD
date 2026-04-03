import React, { useState, useEffect, useContext } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { Shield, Menu, X, ChevronRight, LogOut, User } from 'lucide-react';

const navLinks = [
  { label: 'Scanner', path: '/scanner' },
  { label: 'Monitor', path: '/monitor' },
  { label: 'Dashboard', path: '/dashboard' },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const { user, logout } = useContext(AuthContext);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? 'bg-shield-800/95 backdrop-blur-xl border-b border-[rgba(0,245,255,0.15)] py-3'
          : 'bg-transparent py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className="relative">
            <Shield size={28} className="text-[var(--accent)] group-hover:drop-shadow-[0_0_8px_#00f5ff] transition-all duration-300" />
            <div className="absolute inset-0 bg-[var(--accent)] opacity-0 group-hover:opacity-20 blur-lg transition-all duration-300 rounded-full" />
          </div>
          <span className="font-display font-bold text-xl tracking-wider text-white group-hover:text-[var(--accent)] transition-colors duration-300">
            DATA<span className="text-[var(--accent)]">SHIELD</span>
          </span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`font-mono text-sm tracking-widest uppercase transition-all duration-300 relative group ${
                location.pathname === link.path
                  ? 'text-[var(--accent)]'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {link.label}
              <span className={`absolute -bottom-1 left-0 h-px bg-[var(--accent)] transition-all duration-300 ${
                location.pathname === link.path ? 'w-full' : 'w-0 group-hover:w-full'
              }`} />
            </Link>
          ))}
        </div>

        {/* Auth Controls */}
        <div className="hidden md:flex items-center gap-4">
          {user ? (
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-4 py-2 border border-[rgba(0,245,255,0.2)] rounded-sm">
                <User size={14} className="text-[var(--accent)]" />
                <span className="font-mono text-xs text-slate-300">{user.email}</span>
              </div>
              <button
                onClick={() => { logout(); navigate('/'); }}
                className="flex items-center gap-2 px-4 py-2 border border-[rgba(255,45,85,0.4)] text-[var(--red)] font-mono text-xs rounded-sm hover:bg-[rgba(255,45,85,0.1)] transition-all duration-300"
              >
                <LogOut size={13} />
                Logout
              </button>
            </div>
          ) : (
            <>
              <Link
                to="/login"
                className="font-mono text-sm text-slate-400 hover:text-white transition-colors duration-300"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="btn-primary text-sm px-6 py-2"
              >
                <span className="flex items-center gap-2">
                  Get Shield <ChevronRight size={14} />
                </span>
              </Link>
            </>
          )}
        </div>

        {/* Mobile toggle */}
        <button className="md:hidden text-slate-400 hover:text-[var(--accent)] transition-colors" onClick={() => setOpen(!open)}>
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {open && (
        <div className="md:hidden bg-shield-800/98 backdrop-blur-xl border-t border-[rgba(0,245,255,0.1)] px-6 py-6 flex flex-col gap-5">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              onClick={() => setOpen(false)}
              className={`font-mono text-sm uppercase tracking-widest ${
                location.pathname === link.path ? 'text-[var(--accent)]' : 'text-slate-400'
              }`}
            >
              {'> '}{link.label}
            </Link>
          ))}
          <div className="pt-4 border-t border-[rgba(0,245,255,0.1)] flex flex-col gap-3">
            {user ? (
              <button onClick={() => { logout(); navigate('/'); setOpen(false); }} className="text-[var(--red)] font-mono text-sm text-left">
                {'>'} Logout
              </button>
            ) : (
              <>
                <Link to="/login" onClick={() => setOpen(false)} className="text-slate-400 font-mono text-sm">{'>'} Login</Link>
                <Link to="/register" onClick={() => setOpen(false)} className="text-[var(--accent)] font-mono text-sm">{'>'} Get Shield</Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
