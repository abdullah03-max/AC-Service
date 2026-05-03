import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/common/Navbar';
import { bookingsAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { StatusBadge, EmptyState } from '../components/common';
import toast from 'react-hot-toast';

const UserDashboard = () => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [recs, setRecs] = useState({ recommendations:[], message:'', daysSinceLastService: null });
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('all');

  useEffect(() => {
    Promise.all([bookingsAPI.getAll(), bookingsAPI.getRecommendations()])
      .then(([b, r]) => { setBookings(b.data.data); setRecs(r.data.data); })
      .catch(() => toast.error('Failed to load'))
      .finally(() => setLoading(false));
  }, []);

  const active = bookings.filter(b => !['completed','cancelled'].includes(b.status));
  const completed = bookings.filter(b => b.status === 'completed');

  const stats = [
    { label: 'Total Bookings', value: bookings.length, color: '#00d4ff' },
    { label: 'Active', value: active.length, color: '#f59e0b' },
    { label: 'Completed', value: completed.length, color: '#10b981' },
    { label: 'Days Since Service', value: recs.daysSinceLastService ?? '—', color: '#8b5cf6' },
  ];

  const shown = tab === 'active' ? active : tab === 'completed' ? completed : bookings;

  return (
    <div className="min-h-screen mesh-bg pt-16">
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 py-10">
        {/* Header */}
        <div className="mb-8">
          <p className="text-[#00d4ff] text-sm font-semibold uppercase tracking-widest mb-1">Dashboard</p>
          <h1 className="font-display text-3xl font-bold text-white">Welcome back, {user?.name?.split(' ')[0]} 👋</h1>
          <p className="text-white/40 mt-1">Manage your AC services and bookings</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {stats.map(s => (
            <div key={s.label} className="glass-card p-5 text-center">
              <p className="font-display text-3xl font-bold mb-1" style={{color: s.color}}>{s.value}</p>
              <p className="text-xs text-white/40">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Alert */}
        {recs.daysSinceLastService > 90 && (
          <div className="mb-6 p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-start gap-3">
            <span className="text-2xl">⚠️</span>
            <div>
              <p className="font-semibold text-amber-300">{recs.message}</p>
              <p className="text-sm text-amber-400/60">Last service was {recs.daysSinceLastService} days ago</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            {/* Tabs */}
            <div className="flex gap-1 glass-card p-1 rounded-xl mb-5 w-fit">
              {[['all','All Bookings'],['active','Active'],['completed','Completed']].map(([id, label]) => (
                <button key={id} onClick={() => setTab(id)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${tab === id ? 'bg-[#00d4ff] text-[#0a0f1e]' : 'text-white/50 hover:text-white'}`}>
                  {label}
                </button>
              ))}
            </div>

            {loading ? (
              <div className="space-y-3">{[...Array(3)].map((_,i)=><div key={i} className="glass-card h-20 animate-pulse" />)}</div>
            ) : shown.length === 0 ? (
              <div className="glass-card p-6">
                <EmptyState icon="📋" title="No bookings yet" description="Book your first AC service today"
                  action={<Link to="/services" className="btn-primary">Browse Services</Link>} />
              </div>
            ) : (
              <div className="space-y-3">
                {shown.map(b => (
                  <Link key={b._id} to={`/booking/${b._id}`} className="glass-card-hover p-4 flex items-center justify-between cursor-pointer group block">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-[#00d4ff]/10 border border-[#00d4ff]/20 flex items-center justify-center text-lg flex-shrink-0">
                        ❄️
                      </div>
                      <div>
                        <p className="font-semibold text-white">{b.service?.name}</p>
                        <p className="text-xs text-white/40">#{b.bookingNumber} · {new Date(b.scheduledDate).toLocaleDateString('en-PK',{dateStyle:'medium'})} · {b.scheduledTime}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0">
                      <div className="text-right hidden sm:block">
                        <p className="text-sm font-bold text-white">Rs. {b.totalAmount?.toLocaleString()}</p>
                        <StatusBadge status={b.status} />
                      </div>
                      <span className="text-white/20 group-hover:text-white/60 transition-colors">→</span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            <div className="glass-card p-5">
              <h3 className="font-display font-semibold text-white mb-1 flex items-center gap-2">✨ Recommended</h3>
              <p className="text-xs text-white/30 mb-4">{recs.message || 'Based on your history'}</p>
              <div className="space-y-2">
                {recs.recommendations?.slice(0,4).map(s => (
                  <div key={s._id} className="flex items-center justify-between p-3 bg-white/5 border border-white/5 rounded-xl hover:bg-white/5 transition-colors">
                    <div>
                      <p className="text-sm font-medium text-white">{s.name}</p>
                      <p className="text-xs text-white/30">Rs. {s.price?.toLocaleString()}</p>
                    </div>
                    <Link to={`/book/${s._id}`} className="text-xs bg-[#00d4ff]/10 text-[#00d4ff] border border-[#00d4ff]/20 px-3 py-1.5 rounded-lg hover:bg-[#00d4ff]/20 transition-colors">
                      Book
                    </Link>
                  </div>
                ))}
              </div>
              <Link to="/services" className="btn-ghost w-full text-center mt-4 text-sm block py-2">All Services →</Link>
            </div>

            <div className="glass-card p-5">
              <h3 className="font-display font-semibold text-white mb-4">Quick Book</h3>
              {[['🧹','AC Cleaning'],['❄️','Gas Charging'],['🔧','AC Repair']].map(([e,n]) => (
                <Link key={n} to="/services" className="flex items-center gap-3 py-2.5 text-sm text-white/60 hover:text-white border-b border-white/5 last:border-0 transition-colors">
                  {e} {n} <span className="ml-auto text-white/20">→</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;
