import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const LoginPage = () => {
  const { login, loading } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPass, setShowPass] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await login(form.email, form.password);
    if (result.success) {
      navigate(result.role === 'admin' ? '/admin' : result.role === 'technician' ? '/technician' : '/dashboard');
    }
  };


  const demos = [
    { label: 'Admin', email: 'admin@fullcareac.com', password: 'admin123', color: '#f59e0b' },
    { label: 'User', email: 'user@test.com', password: 'user1234', color: '#00d4ff' },
    { label: 'Tech', email: 'bilal@tech.com', password: 'tech1234', color: '#10b981' },
  ];

  return (
    <div className="min-h-screen mesh-bg flex">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12 border-r border-white/10 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10"
          style={{backgroundImage:'linear-gradient(rgba(0,212,255,0.5) 1px, transparent 1px),linear-gradient(90deg, rgba(0,212,255,0.5) 1px, transparent 1px)',backgroundSize:'50px 50px'}} />
        <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-[#00d4ff]/5 to-transparent" />
        <div className="relative flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-[#00d4ff]/10 border border-[#00d4ff]/30 flex items-center justify-center text-[#00d4ff]">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="7" width="20" height="10" rx="2"/><path d="M12 7V4"/><circle cx="12" cy="12" r="2"/></svg>
          </div>
          <span className="font-display font-bold text-white">Cool Care AC Tech</span>
        </div>
        <div className="relative">
          <h2 className="font-display text-5xl font-bold text-white leading-tight mb-5">
            Your AC.<br/>
            <span style={{color:'#00d4ff'}}>Our Expertise.</span>
          </h2>
          <p className="text-white/40 leading-relaxed max-w-xs">Trusted by thousands of homes and businesses across Pakistan for professional AC care.</p>
          <div className="grid grid-cols-2 gap-3 mt-8">
            {['5,000+ Customers','50+ Technicians','8+ Years','4.9★ Rating'].map(s => (
              <div key={s} className="glass-card px-4 py-3 text-sm text-white/60">{s}</div>
            ))}
          </div>
        </div>
        <p className="relative text-white/20 text-xs">© 2024 Cool Care AC Tech</p>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <h1 className="font-display text-3xl font-bold text-white mb-1">Welcome back</h1>
          <p className="text-white/40 mb-6">Sign in to manage your AC services</p>

          {/* Demo buttons */}
          <div className="mb-6">
            <p className="text-xs text-white/30 uppercase tracking-widest mb-2 font-semibold">Quick Demo Login</p>
            <div className="flex gap-2">
              {demos.map(d => (
                <button key={d.label} onClick={() => setForm({ email: d.email, password: d.password })}
                  className="flex-1 py-2 text-xs font-semibold rounded-xl border transition-all"
                  style={{ borderColor: `${d.color}30`, color: d.color, background: `${d.color}10` }}>
                  {d.label}
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-white/60 mb-1.5">Email</label>
              <input type="email" value={form.email} onChange={e => setForm(p => ({...p, email: e.target.value}))}
                className="input-field" placeholder="you@example.com" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-white/60 mb-1.5">Password</label>
              <div className="relative">
                <input type={showPass ? 'text' : 'password'} value={form.password}
                  onChange={e => setForm(p => ({...p, password: e.target.value}))}
                  className="input-field pr-10" placeholder="••••••••" required />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors">
                  {showPass ? '🙈' : '👁'}
                </button>
              </div>
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full py-3">
              {loading ? <><div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" /> Signing in...</> : 'Sign In →'}
            </button>
          </form>

          

          <p className="text-center text-sm text-white/40 mt-6">
            Don't have an account? <Link to="/register" className="text-[#00d4ff] hover:underline">Create one free</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
