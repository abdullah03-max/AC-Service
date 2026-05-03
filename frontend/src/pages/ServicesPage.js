import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import { servicesAPI } from '../services/api';

const CATS = ['All', 'Cleaning', 'Repair', 'Installation', 'Gas Charging', 'Maintenance', 'Inspection'];
const ICONS = { Cleaning:'🧹', Repair:'🔧', Installation:'⚡', 'Gas Charging':'❄️', Maintenance:'🛠', Inspection:'🔍' };

const ServicesPage = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cat, setCat] = useState('All');
  const [search, setSearch] = useState('');

  useEffect(() => {
    servicesAPI.getAll({ active: true }).then(r => setServices(r.data.data)).catch(()=>{}).finally(()=>setLoading(false));
  }, []);

  const filtered = services.filter(s =>
    (cat === 'All' || s.category === cat) &&
    (s.name.toLowerCase().includes(search.toLowerCase()) || s.description.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="min-h-screen mesh-bg flex flex-col">
      <Navbar />
      <div className="pt-20">
        {/* Header */}
        <div className="text-center py-16 px-4 border-b border-white/10">
          <p className="text-[#00d4ff] text-sm font-semibold uppercase tracking-widest mb-3">What We Offer</p>
          <h1 className="font-display text-5xl font-bold text-white mb-4">Our Services</h1>
          <p className="text-white/40 mb-8">Professional AC services at transparent prices</p>
          <div className="max-w-md mx-auto relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30">🔍</span>
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search services..." className="input-field pl-11" />
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 py-10">
          {/* Category pills */}
          <div className="flex gap-2 overflow-x-auto pb-3 mb-8 no-scrollbar scroll-smooth">
            {CATS.map(c => (
              <button key={c} onClick={() => setCat(c)}
                className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all border ${cat === c ? 'bg-[#00d4ff] text-[#0a0f1e] border-[#00d4ff] font-bold' : 'glass-card text-white/60 hover:text-white hover:border-white/20'}`}>
                {c}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {[...Array(6)].map((_,i) => <div key={i} className="glass-card p-6 animate-pulse h-64" />)}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-24">
              <div className="text-6xl mb-4">❄️</div>
              <h3 className="font-display text-xl font-bold text-white/60 mb-2">No services found</h3>
              <p className="text-white/30">Try a different search or category</p>
            </div>
          ) : (
            <>
              <p className="text-sm text-white/30 mb-6">{filtered.length} service{filtered.length !== 1 ? 's' : ''} available</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {filtered.map(s => (
                  <div key={s._id} className="glass-card-hover p-6 group flex flex-col">
                    <div className="flex items-start justify-between mb-4">
                      <div className="w-12 h-12 rounded-xl bg-[#00d4ff]/10 border border-[#00d4ff]/20 flex items-center justify-center text-2xl">
                        {ICONS[s.category] || '🔧'}
                      </div>
                      <div className="flex gap-1.5">
                        {s.tags?.includes('popular') && <span className="text-[10px] bg-amber-500/20 text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded-full font-semibold">🔥 HOT</span>}
                        {s.tags?.includes('recommended') && <span className="text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full font-semibold">✓ TOP</span>}
                      </div>
                    </div>
                    <span className="text-[10px] text-[#00d4ff]/60 bg-[#00d4ff]/5 border border-[#00d4ff]/10 px-2.5 py-1 rounded-full w-fit mb-2">{s.category}</span>
                    <h3 className="font-display font-bold text-white text-lg mb-2">{s.name}</h3>
                    <p className="text-sm text-white/40 leading-relaxed flex-1 mb-4">{s.description}</p>
                    <div className="flex items-center gap-3 text-xs text-white/30 mb-4">
                      <span>⏱ {s.duration} min</span>
                      <span>⭐ {s.rating} ({s.totalReviews})</span>
                      <span>📊 {s.bookingCount}</span>
                    </div>
                    <div className="flex items-center justify-between pt-4 border-t border-white/5">
                      <p className="font-display text-2xl font-bold" style={{color:'#00d4ff'}}>Rs. {s.price?.toLocaleString()}</p>
                      <Link to={`/book/${s._id}`} className="btn-primary text-sm py-2 px-5">Book Now</Link>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default ServicesPage;
