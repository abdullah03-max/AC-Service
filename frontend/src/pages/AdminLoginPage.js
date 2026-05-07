import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const AdminLoginPage = () => {
  const { login, loading } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPass, setShowPass] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await login(form.email, form.password);
    if (result.success) {
      // Only allow admin role
      if (result.role === 'admin') {
        navigate('/admin');
      } else {
        // If not admin, show error and clear form
        navigate('/admin/login');
        setForm({ email: '', password: '' });
      }
    }
  };

  return (
    <div className="min-h-screen mesh-bg flex">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12 border-r border-white/10 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10"
          style={{backgroundImage:'linear-gradient(rgba(245,158,11,0.5) 1px, transparent 1px),linear-gradient(90deg, rgba(245,158,11,0.5) 1px, transparent 1px)',backgroundSize:'50px 50px'}} />
        <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-[#f59e0b]/5 to-transparent" />
        <div className="relative flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-[#f59e0b]/10 border border-[#f59e0b]/30 flex items-center justify-center text-[#f59e0b]">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="7" width="20" height="10" rx="2"/><path d="M12 7V4"/><circle cx="12" cy="12" r="2"/></svg>
          </div>
          <span className="font-display font-bold text-white">Cool Care AC Tech</span>
        </div>
        <div className="relative">
          <h2 className="font-display text-5xl font-bold text-white leading-tight mb-5">
            Admin<br/>
            <span style={{color:'#f59e0b'}}>Control Center</span>
          </h2>
          <p className="text-white/40 leading-relaxed max-w-xs">Secure administration portal for managing services, technicians, and customers.</p>
          <div className="grid grid-cols-2 gap-3 mt-8">
            {['Real-time Analytics','Team Management','Service Control','Security First'].map(s => (
              <div key={s} className="glass-card px-4 py-3 text-sm text-white/60">{s}</div>
            ))}
          </div>
        </div>
        <p className="relative text-white/20 text-xs">© 2024 Cool Care AC Tech - Admin Access Only</p>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="mb-8 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#f59e0b]/10 border border-[#f59e0b]/30 flex items-center justify-center text-[#f59e0b]">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z"/></svg>
            </div>
            <div>
              <h1 className="font-display text-2xl font-bold text-white">Admin Access</h1>
              <p className="text-xs text-[#f59e0b]">Secure Administration Portal</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-white/60 mb-1.5">Admin Email</label>
              <input type="email" value={form.email} onChange={e => setForm(p => ({...p, email: e.target.value}))}
                className="input-field" placeholder="admin@fullcareac.com" required />
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
            <button type="submit" disabled={loading} className="btn-primary w-full py-3"
              style={{background: loading ? '#f59e0b80' : '#f59e0b', borderColor: '#f59e0b'}}>
              {loading ? <><div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" /> Signing in...</> : 'Access Admin Panel →'}
            </button>
          </form>

          <div className="mt-6 p-4 rounded-lg bg-[#f59e0b]/5 border border-[#f59e0b]/20">
            <p className="text-xs text-white/60">
              <span className="text-[#f59e0b] font-semibold">⚠️ Security Notice:</span> This portal is restricted to authorized administrators only. All access is logged and monitored.
            </p>
          </div>

          <p className="text-center text-sm text-white/40 mt-6">
            Not an admin? <a href="/" className="text-[#f59e0b] hover:underline">Return to home</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminLoginPage;
