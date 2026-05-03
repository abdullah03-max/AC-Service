import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Navbar from '../components/common/Navbar';
import { bookingsAPI } from '../services/api';
import { StatusBadge } from '../components/common';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

const BookingDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    bookingsAPI.getOne(id)
      .then(r => setBooking(r.data.data))
      .catch(() => toast.error('Booking not found'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleCancel = async () => {
    if (!window.confirm('Cancel this booking?')) return;
    setCancelling(true);
    try {
      await bookingsAPI.cancel(id);
      toast.success('Booking cancelled');
      setBooking(p => ({ ...p, status: 'cancelled' }));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    } finally { setCancelling(false); }
  };

  if (loading) return (
    <div className="min-h-screen mesh-bg flex items-center justify-center">
      <Navbar />
      <div className="w-8 h-8 border-2 border-[#00d4ff] border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!booking) return (
    <div className="min-h-screen mesh-bg flex items-center justify-center">
      <Navbar />
      <p className="text-white/40">Booking not found</p>
    </div>
  );

  const steps = ['pending','confirmed','assigned','in_progress','completed'];
  const currentIdx = booking.status === 'cancelled' ? -1 : steps.indexOf(booking.status);

  return (
    <div className="min-h-screen mesh-bg pt-16">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 py-10">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate(-1)} className="p-2 hover:bg-white/5 rounded-xl transition-colors text-white/40 hover:text-white">
              ← Back
            </button>
            <div>
              <h1 className="font-display text-2xl font-bold text-white">Booking #{booking.bookingNumber}</h1>
              <p className="text-white/40 text-sm">{new Date(booking.createdAt).toLocaleDateString('en-PK', { dateStyle:'long' })}</p>
            </div>
          </div>
          <StatusBadge status={booking.status} />
        </div>

        {/* Progress tracker */}
        {booking.status !== 'cancelled' && (
          <div className="glass-card p-5 mb-6">
            <h3 className="font-display font-semibold text-white text-sm mb-5">Service Progress</h3>
            <div className="flex items-center">
              {steps.map((step, i) => (
                <React.Fragment key={step}>
                  <div className="flex flex-col items-center">
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold transition-all border ${i <= currentIdx ? 'border-[#00d4ff] bg-[#00d4ff]/20 text-[#00d4ff]' : 'border-white/10 text-white/20'}`}>
                      {i < currentIdx ? '✓' : i + 1}
                    </div>
                    <p className={`text-[10px] mt-1.5 capitalize text-center w-14 leading-tight ${i <= currentIdx ? 'text-[#00d4ff]' : 'text-white/20'}`}>
                      {step.replace('_',' ')}
                    </p>
                  </div>
                  {i < steps.length - 1 && (
                    <div className={`flex-1 h-px mx-1 transition-all ${i < currentIdx ? 'bg-[#00d4ff]/50' : 'bg-white/5'}`} />
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Service details */}
          <div className="glass-card p-5">
            <h3 className="font-display font-semibold text-white mb-4">Service Details</h3>
            <div className="p-3 bg-[#00d4ff]/5 border border-[#00d4ff]/20 rounded-xl mb-4">
              <p className="font-bold text-white">{booking.service?.name}</p>
              <p className="text-xs text-[#00d4ff] mt-0.5">{booking.service?.category}</p>
            </div>
            <div className="space-y-2.5 text-sm">
              <div className="flex items-center gap-2 text-white/60">
                <span className="text-white/30">📅</span>
                {new Date(booking.scheduledDate).toLocaleDateString('en-PK', { dateStyle:'long' })}
              </div>
              <div className="flex items-center gap-2 text-white/60">
                <span className="text-white/30">⏰</span> {booking.scheduledTime}
              </div>
              <div className="flex items-start gap-2 text-white/60">
                <span className="text-white/30">📍</span>
                <span>{booking.address}, {booking.city}</span>
              </div>
              {booking.acType && (
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {[booking.acType && `${booking.acType} AC`, booking.acBrand, booking.acTons && `${booking.acTons}`].filter(Boolean).map(tag => (
                    <span key={tag} className="text-xs glass-card px-2.5 py-1 rounded-full text-white/50">{tag}</span>
                  ))}
                </div>
              )}
            </div>
            {booking.notes && (
              <div className="mt-4 p-3 bg-amber-500/5 border border-amber-500/15 rounded-xl text-xs text-amber-400/70">
                <p className="font-semibold mb-1">📝 Notes</p>
                <p>{booking.notes}</p>
              </div>
            )}
          </div>

          {/* Payment + Technician */}
          <div className="space-y-4">
            <div className="glass-card p-5">
              <h3 className="font-display font-semibold text-white mb-4">💳 Payment</h3>
              <div className="space-y-2.5 text-sm">
                <div className="flex justify-between">
                  <span className="text-white/40">Method</span>
                  <span className="text-white capitalize font-medium">{booking.paymentMethod}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/40">Status</span>
                  <span className={`font-medium ${booking.paymentStatus === 'paid' ? 'text-emerald-400' : 'text-amber-400'}`}>
                    {booking.paymentStatus}
                  </span>
                </div>
                <div className="flex justify-between pt-2 border-t border-white/10">
                  <span className="font-semibold text-white">Total</span>
                  <span className="font-display font-bold text-xl text-[#00d4ff]">Rs. {booking.totalAmount?.toLocaleString()}</span>
                </div>
              </div>
              {booking.status === 'completed' && (
                <Link to={`/invoice/${booking._id}`} className="btn-ghost w-full text-center mt-4 text-sm block py-2">
                  🧾 View Invoice
                </Link>
              )}
            </div>

            {booking.technician && (
              <div className="glass-card p-5">
                <h3 className="font-display font-semibold text-white mb-4">👨‍🔧 Your Technician</h3>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-[#00d4ff]/10 border border-[#00d4ff]/20 flex items-center justify-center text-[#00d4ff] font-bold text-xl">
                    {booking.technician?.user?.name?.charAt(0)}
                  </div>
                  <div>
                    <p className="font-bold text-white">{booking.technician?.user?.name}</p>
                    <p className="text-sm text-white/40">📞 {booking.technician?.user?.phone}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Status history */}
        <div className="glass-card p-5 mt-5">
          <h3 className="font-display font-semibold text-white mb-4">Activity Log</h3>
          <div className="space-y-3">
            {booking.statusHistory?.map((h, i) => (
              <div key={i} className="flex items-start gap-3 text-sm">
                <div className="w-2 h-2 rounded-full bg-[#00d4ff]/60 mt-1.5 flex-shrink-0" />
                <div>
                  <p className="font-medium text-white/80 capitalize">{h.status?.replace('_',' ')}</p>
                  {h.note && <p className="text-white/40 text-xs">{h.note}</p>}
                  <p className="text-white/20 text-xs">{new Date(h.updatedAt).toLocaleString('en-PK')}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Cancel button */}
        {['pending','confirmed'].includes(booking.status) && ['user','admin'].includes(user?.role) && (
          <div className="mt-6 flex justify-end">
            <button onClick={handleCancel} disabled={cancelling} className="btn-danger">
              {cancelling ? 'Cancelling...' : '✕ Cancel Booking'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default BookingDetailPage;
