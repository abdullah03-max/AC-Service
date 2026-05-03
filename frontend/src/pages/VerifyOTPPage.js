import React, { useState, useEffect } from 'react';
import { authAPI } from '../services/api';
import toast from 'react-hot-toast';
import { useLocation } from 'react-router-dom';

const VerifyOTPPage = () => {
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [sent, setSent] = useState(false);
  const [banner, setBanner] = useState('');
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const e = params.get('email');
    if (e) {
      setEmail(e);
      setSent(true);
    }

    const state = location.state || {};
    if (state.message) {
      setBanner(state.message);
    } else if (state.deliveredViaEmail === true) {
      setBanner('Check your email for the 4-digit verification code.');
    } else if (state.deliveredViaEmail === false) {
      setBanner('Check the backend console for the 4-digit verification code.');
    }
  }, [location.state]);

  const send = async () => {
    try {
      await authAPI.sendOtp({ email });
      toast.success('OTP sent to your email');
      setSent(true);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send OTP');
    }
  };

  const verify = async () => {
    try {
      const res = await authAPI.verifyOtp({ email, code });
      const { token, user } = res.data;
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      toast.success('Verified! Logged in.');
      window.location.href = '/dashboard';
    } catch (err) {
      toast.error(err.response?.data?.message || 'Verification failed');
    }
  };

  return (
    <div className="min-h-screen mesh-bg flex items-center justify-center p-8">
      <div className="w-full max-w-md bg-[#0b1220]/60 p-6 rounded-xl">
        <h2 className="text-xl font-bold text-white mb-4">Verify your account</h2>
        {banner && (
          <div className="mb-4 rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/70">
            {banner}
          </div>
        )}
        <div className="space-y-3">
          <div>
            <label className="block text-sm text-white/60 mb-1">Email</label>
            <input value={email} onChange={e => setEmail(e.target.value)} className="input-field" placeholder="you@example.com" />
          </div>
          <div className="flex gap-2">
            <button onClick={send} className="btn-primary flex-1">Send OTP</button>
            <button onClick={() => { setEmail(''); setCode(''); setSent(false); }} className="btn-outline">Reset</button>
          </div>
          {sent && (
            <>
              <div>
                <label className="block text-sm text-white/60 mb-1">Enter code</label>
                    <input value={code} onChange={e => setCode(e.target.value)} className="input-field" placeholder="4-digit code" />
              </div>
              <button onClick={verify} className="btn-primary w-full">Verify & Continue</button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default VerifyOTPPage;
