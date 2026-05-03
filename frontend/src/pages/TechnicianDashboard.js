import React, { useState, useEffect, useCallback } from 'react';
import Navbar from '../components/common/Navbar';
import TechnicianLocationUpdater from '../components/technician/TechnicianLocationUpdater';
import { techniciansAPI, bookingsAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { StatusBadge, EmptyState } from '../components/common';
import toast from 'react-hot-toast';

const STATUS_OPTIONS = [
  { id:'available', label:'Available', color:'emerald', dot:'#10b981' },
  { id:'on_job', label:'On Job', color:'blue', dot:'#3b82f6' },
  { id:'break', label:'On Break', color:'amber', dot:'#f59e0b' },
  { id:'offline', label:'Offline', color:'slate', dot:'#64748b' },
];


const TechnicianDashboard = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [myStatus, setMyStatus] = useState('available');
  const [tab, setTab] = useState('assigned');
  const [updatingJob, setUpdatingJob] = useState(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [profileRes, bookingsRes] = await Promise.all([
        techniciansAPI.getMyProfile(),
        bookingsAPI.getAll(),
      ]);
      setProfile(profileRes.data.data);
      setMyStatus(profileRes.data.data.currentStatus);
      setBookings(bookingsRes.data.data);
    } catch {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const handleStatusChange = async (newStatus) => {
    setUpdatingStatus(true);
    try {
      await techniciansAPI.updateStatus({ status: newStatus });
      setMyStatus(newStatus);
      toast.success(`Status → ${newStatus.replace('_',' ')}`);
    } catch {
      toast.error('Failed to update status');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleUpdateJob = async (bookingId, status, note) => {
    setUpdatingJob(bookingId);
    try {
      await bookingsAPI.updateStatus(bookingId, { status, note });
      toast.success(status === 'in_progress' ? '🚀 Job started!' : '✅ Job completed!');
      loadData();
    } catch {
      toast.error('Failed to update');
    } finally {
      setUpdatingJob(null);
    }
  };


  const assigned = bookings.filter(b => ['assigned','in_progress'].includes(b.status));
  const completed = bookings.filter(b => b.status === 'completed');
  const shown = tab === 'assigned' ? assigned : completed;


  if (loading) return (
    <div className="min-h-screen mesh-bg flex items-center justify-center">
      <Navbar />
      <div className="w-10 h-10 border-2 border-[#00d4ff] border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen mesh-bg pt-16">
      <Navbar />
      <div className="max-w-5xl mx-auto px-4 py-10">

        {/* Header */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <p className="text-[#00d4ff] text-sm font-semibold uppercase tracking-widest mb-1">Technician Portal</p>
            <h1 className="font-display text-3xl font-bold text-white">
              Hey, {user?.name?.split(' ')[0]} 👋
            </h1>
            <p className="text-white/40 mt-1">{profile?.employeeId} · {profile?.specializations?.join(', ')}</p>
          </div>
          <button onClick={loadData} className="btn-ghost text-sm px-4 py-2">⟳ Refresh</button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* LEFT — Profile + Status + Location */}
          <div className="space-y-4">

            {/* Profile card */}
            <div className="glass-card p-5 text-center">
              <div className="w-16 h-16 rounded-2xl bg-[#00d4ff]/10 border border-[#00d4ff]/20 flex items-center justify-center text-[#00d4ff] text-2xl font-bold mx-auto mb-3">
                {user?.name?.charAt(0)}
              </div>
              <p className="font-display font-bold text-white text-lg">{user?.name}</p>
              <p className="text-sm text-white/40">{user?.email}</p>
              <p className="text-sm text-white/40 mt-0.5">📞 {user?.phone}</p>

              {/* Quick stats */}
              <div className="grid grid-cols-3 gap-2 mt-4">
                {[
                  { label:'Done', value: profile?.completedJobs || 0, color:'#00d4ff' },
                  { label:'Active', value: assigned.length, color:'#f59e0b' },
                  { label:'Rating', value: profile?.rating || 0, color:'#10b981' },
                ].map(s => (
                  <div key={s.label} className="glass-card p-2 rounded-xl">
                    <p className="font-display font-bold text-lg" style={{color: s.color}}>{s.value}</p>
                    <p className="text-xs text-white/30">{s.label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Status control */}
            <div className="glass-card p-5">
              <h3 className="font-display font-semibold text-white text-sm mb-3">My Status</h3>
              <div className="space-y-2">
                {STATUS_OPTIONS.map(opt => (
                  <button key={opt.id} onClick={() => handleStatusChange(opt.id)} disabled={updatingStatus}
                    className={`w-full py-2.5 px-4 rounded-xl border text-sm font-medium transition-all text-left flex items-center gap-3 ${myStatus === opt.id ? 'border-[#00d4ff]/40 bg-[#00d4ff]/5 text-white' : 'border-white/5 text-white/40 hover:border-white/15 hover:text-white/70'}`}>
                    <div className="w-2 h-2 rounded-full flex-shrink-0 transition-all" style={{ background: myStatus === opt.id ? opt.dot : '#ffffff20' }} />
                    {opt.label}
                    {myStatus === opt.id && <span className="ml-auto text-[#00d4ff] text-xs font-bold">ACTIVE</span>}
                  </button>
                ))}
              </div>
            </div>

            {/* Location Updater Component */}
            <TechnicianLocationUpdater />
          </div>

          {/* RIGHT — Jobs */}
          <div className="lg:col-span-2 space-y-4">

            {/* Tabs */}
            <div className="flex gap-1 glass-card p-1 rounded-xl w-fit">
              {[
                { id:'assigned', label:`Assigned (${assigned.length})` },
                { id:'completed', label:`Completed (${completed.length})` },
              ].map(t => (
                <button key={t.id} onClick={() => setTab(t.id)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${tab === t.id ? 'bg-[#00d4ff] text-[#0a0f1e]' : 'text-white/50 hover:text-white'}`}>
                  {t.label}
                </button>
              ))}
            </div>

            {/* Job cards */}
            {shown.length === 0 ? (
              <div className="glass-card p-8">
                <EmptyState
                  icon={tab === 'assigned' ? '📋' : '✅'}
                  title={tab === 'assigned' ? 'No active jobs' : 'No completed jobs'}
                  description={tab === 'assigned' ? 'You have no assigned jobs right now. Stay available!' : 'Completed jobs will appear here.'}
                />
              </div>
            ) : (
              <div className="space-y-4">
                {shown.map(booking => (
                  <div key={booking._id} className="glass-card-hover p-5">
                    {/* Job header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-xl bg-[#00d4ff]/10 border border-[#00d4ff]/20 flex items-center justify-center text-xl flex-shrink-0">
                          ❄️
                        </div>
                        <div>
                          <p className="font-display font-bold text-white">{booking.service?.name}</p>
                          <p className="text-xs text-white/30 mt-0.5">#{booking.bookingNumber}</p>
                        </div>
                      </div>
                      <StatusBadge status={booking.status} />
                    </div>

                    {/* Job details */}
                    <div className="grid grid-cols-2 gap-3 mb-4">
                      <div className="glass-card p-3 rounded-xl">
                        <p className="text-xs text-white/30 mb-0.5">Date</p>
                        <p className="text-sm font-medium text-white">
                          {new Date(booking.scheduledDate).toLocaleDateString('en-PK', { dateStyle:'medium' })}
                        </p>
                      </div>
                      <div className="glass-card p-3 rounded-xl">
                        <p className="text-xs text-white/30 mb-0.5">Time</p>
                        <p className="text-sm font-medium text-white">{booking.scheduledTime}</p>
                      </div>
                    </div>

                    <div className="glass-card p-3 rounded-xl mb-4">
                      <p className="text-xs text-white/30 mb-0.5">📍 Location</p>
                      <p className="text-sm text-white">{booking.address}, {booking.city}</p>
                    </div>

                    {/* Customer info */}
                    <div className="flex items-center gap-3 p-3 bg-white/5 border border-white/5 rounded-xl mb-4">
                      <div className="w-9 h-9 rounded-lg bg-white/5 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                        {booking.user?.name?.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white">{booking.user?.name}</p>
                        <p className="text-xs text-white/40">📞 {booking.user?.phone}</p>
                      </div>
                      {booking.acBrand && (
                        <div className="text-right text-xs text-white/30">
                          <p>{booking.acBrand}</p>
                          <p>{booking.acType} {booking.acTons && `· ${booking.acTons}`}</p>
                        </div>
                      )}
                    </div>

                    {/* Customer notes */}
                    {booking.notes && (
                      <div className="p-3 bg-amber-500/5 border border-amber-500/15 rounded-xl mb-4">
                        <p className="text-xs text-amber-400/70 font-semibold mb-1">📝 Customer Notes</p>
                        <p className="text-xs text-amber-300/70">{booking.notes}</p>
                      </div>
                    )}

                    {/* Action buttons for active jobs */}
                    {tab === 'assigned' && (
                      <div className="flex gap-3">
                        {booking.status === 'assigned' && (
                          <button
                            onClick={() => handleUpdateJob(booking._id, 'in_progress', 'Technician started the job')}
                            disabled={updatingJob === booking._id}
                            className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-xl text-sm font-medium hover:bg-amber-500/20 transition-all">
                            {updatingJob === booking._id
                              ? <div className="w-4 h-4 border border-current border-t-transparent rounded-full animate-spin" />
                              : '🚀'} Start Job
                          </button>
                        )}
                        {booking.status === 'in_progress' && (
                          <button
                            onClick={() => handleUpdateJob(booking._id, 'completed', 'Job completed by technician')}
                            disabled={updatingJob === booking._id}
                            className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-xl text-sm font-medium hover:bg-emerald-500/20 transition-all">
                            {updatingJob === booking._id
                              ? <div className="w-4 h-4 border border-current border-t-transparent rounded-full animate-spin" />
                              : '✅'} Mark Complete
                          </button>
                        )}
                      </div>
                    )}

                    {/* Completed job summary */}
                    {tab === 'completed' && (
                      <div className="flex items-center gap-2 p-3 bg-emerald-500/5 border border-emerald-500/15 rounded-xl">
                        <span className="text-emerald-400">✅</span>
                        <span className="text-sm text-emerald-400">Job completed</span>
                        <span className="ml-auto text-sm font-bold text-white">Rs. {booking.totalAmount?.toLocaleString()}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TechnicianDashboard;
