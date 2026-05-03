import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const RegisterPage = () => {
  const { register, loading } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name:'', email:'', password:'', phone:'', address:'' });
  const [showPass, setShowPass] = useState(false);
  const u = (k, v) => setForm(p => ({...p, [k]: v}));

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await register(form);
    if (result.success) {
      if (result.role) {
        navigate(result.role === 'admin' ? '/admin' : result.role === 'technician' ? '/technician' : '/dashboard');
      } else {
        // OTP flow — navigate to verify page with delivery details
        navigate(`/verify?email=${encodeURIComponent(form.email)}`, {
          state: {
            deliveredViaEmail: result.deliveredViaEmail,
            message: result.message,
          },
        });
      }
    }
  };

  return (
    <div className="min-h-screen mesh-bg flex">
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12 border-r border-white/10 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{backgroundImage:'linear-gradient(rgba(0,212,255,0.5) 1px, transparent 1px),linear-gradient(90deg, rgba(0,212,255,0.5) 1px, transparent 1px)',backgroundSize:'50px 50px'}} />
        <div className="relative flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-[#00d4ff]/10 border border-[#00d4ff]/30 flex items-center justify-center text-[#00d4ff]">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="7" width="20" height="10" rx="2"/><path d="M12 7V4"/><circle cx="12" cy="12" r="2"/></svg>
          </div>
          <span className="font-display font-bold text-white">Cool Care AC Tech</span>
        </div>
        <div className="relative">
          <h2 className="font-display text-5xl font-bold text-white leading-tight mb-5">Join thousands of<br/><span style={{color:'#00d4ff'}}>satisfied customers</span></h2>
          <ul className="space-y-3">
            {['Book AC services in minutes','Track your technician live','Get digital invoices instantly','30-day service warranty'].map(item => (
              <li key={item} className="flex items-center gap-2 text-sm text-white/50">
                <span className="text-[#00d4ff]">✓</span> {item}
              </li>
            ))}
          </ul>
        </div>
        <p className="relative text-white/20 text-xs">Free account · No credit card required</p>
      </div>

      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <h1 className="font-display text-3xl font-bold text-white mb-1">Create account</h1>
          <p className="text-white/40 mb-8">Start managing your AC services today</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {[
              ['name','Full Name','text','Ahmed Khan'],
              ['email','Email','email','you@example.com'],
              ['phone','Phone Number','tel','0300-1234567'],
              ['address','Address (optional)','text','Block 5, Gulshan'],
            ].map(([key, label, type, placeholder]) => (
              <div key={key}>
                <label className="block text-sm font-medium text-white/60 mb-1.5">{label}</label>
                <input type={type} value={form[key]} onChange={e => u(key, e.target.value)}
                  className="input-field" placeholder={placeholder} required={key !== 'address' && key !== 'phone'} />
              </div>
            ))}
            <div>
              <label className="block text-sm font-medium text-white/60 mb-1.5">Password</label>
              <div className="relative">
                <input type={showPass ? 'text' : 'password'} value={form.password}
                  onChange={e => u('password', e.target.value)}
                  className="input-field pr-10" placeholder="At least 6 characters" required minLength={6} />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60">
                  {showPass ? '🙈' : '👁'}
                </button>
              </div>
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full py-3">
              {loading ? <><div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" /> Creating...</> : 'Create Account →'}
            </button>
          </form>

          <p className="text-center text-sm text-white/40 mt-6">
            Already have an account? <Link to="/login" className="text-[#00d4ff] hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
