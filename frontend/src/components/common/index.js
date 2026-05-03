import React from 'react';

export const StatusBadge = ({ status }) => {
  const map = { pending:'badge-pending', confirmed:'badge-confirmed', assigned:'badge-assigned', in_progress:'badge-in_progress', completed:'badge-completed', cancelled:'badge-cancelled' };
  const labels = { pending:'Pending', confirmed:'Confirmed', assigned:'Assigned', in_progress:'In Progress', completed:'Completed', cancelled:'Cancelled' };
  return <span className={map[status] || 'badge-pending'}>{labels[status] || status}</span>;
};

export const Spinner = ({ size = 'md' }) => {
  const s = { sm: 'w-4 h-4 border-2', md: 'w-8 h-8 border-2', lg: 'w-12 h-12 border-2' }[size];
  return <div className={`${s} border-[#00d4ff] border-t-transparent rounded-full animate-spin`} />;
};

export const LoadingScreen = () => (
  <div className="min-h-screen mesh-bg flex items-center justify-center">
    <div className="text-center">
      <Spinner size="lg" />
      <p className="mt-4 text-white/40 text-sm">Loading...</p>
    </div>
  </div>
);

export const EmptyState = ({ icon, title, description, action }) => (
  <div className="text-center py-16">
    <div className="text-5xl mb-4">{icon || '📭'}</div>
    <h3 className="font-display text-lg font-semibold text-white mb-2">{title}</h3>
    <p className="text-white/40 text-sm mb-6">{description}</p>
    {action}
  </div>
);

export const StatCard = ({ label, value, icon, accent = '#00d4ff', sub }) => (
  <div className="glass-card p-5 hover:border-white/20 transition-all">
    <div className="flex items-start justify-between">
      <div>
        <p className="text-xs text-white/40 mb-1 font-medium uppercase tracking-wider">{label}</p>
        <p className="font-display text-2xl font-bold text-white">{value}</p>
        {sub && <p className="text-xs mt-1" style={{color: accent}}>{sub}</p>}
      </div>
      <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
        style={{ background: `${accent}15`, border: `1px solid ${accent}30`, color: accent }}>
        {icon}
      </div>
    </div>
  </div>
);

export const Modal = ({ isOpen, onClose, title, children, size = 'md' }) => {
  if (!isOpen) return null;
  const sizes = { sm: 'max-w-md', md: 'max-w-lg', lg: 'max-w-2xl', xl: 'max-w-4xl' };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div className={`relative bg-[#111827] border border-white/10 rounded-2xl shadow-2xl w-full ${sizes[size]} max-h-[90vh] overflow-y-auto`}
        onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <h3 className="font-display font-bold text-lg text-white">{title}</h3>
          <button onClick={onClose} className="p-1.5 hover:bg-white/10 rounded-lg transition-colors text-white/40 hover:text-white text-xl leading-none">×</button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
};
