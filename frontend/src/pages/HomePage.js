import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import { servicesAPI } from '../services/api';

const CATEGORY_ICONS = {
  Cleaning: '🧹', Repair: '🔧', Installation: '⚡', 'Gas Charging': '❄️', Maintenance: '🛠', Inspection: '🔍'
};

const HomePage = () => {
  const [services, setServices] = useState([]);

  useEffect(() => {
    servicesAPI.getAll({ active: true }).then(r => setServices(r.data.data.slice(0, 6))).catch(() => {});
  }, []);

  const stats = [{ v: '5,000+', l: 'Customers Served' }, { v: '50+', l: 'Expert Technicians' }, { v: '8+', l: 'Years Experience' }, { v: '4.9★', l: 'Average Rating' }];
  const features = [
    { icon: '🛡️', title: 'Certified Experts', desc: 'All technicians are trained, certified, and background-checked professionals.' },
    { icon: '⚡', title: 'Same Day Service', desc: 'Emergency and same-day bookings available across Karachi.' },
    { icon: '💎', title: 'Quality Guaranteed', desc: '30-day service warranty on all AC jobs. Not satisfied? We come back free.' },
    { icon: '📊', title: 'Transparent Pricing', desc: 'Fixed prices shown upfront. No hidden charges, ever.' },
  ];

  return (
    <div className="min-h-screen mesh-bg flex flex-col">
      <Navbar />

      {/* Hero */}
      <section className="relative min-h-screen flex items-center pt-16 overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#00d4ff]/5 rounded-full filter blur-3xl animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-indigo-500/5 rounded-full filter blur-3xl animate-pulse" style={{animationDelay:'1s'}} />
          {/* Grid pattern */}
          <div className="absolute inset-0 opacity-5" style={{backgroundImage:'linear-gradient(rgba(0,212,255,0.5) 1px, transparent 1px),linear-gradient(90deg, rgba(0,212,255,0.5) 1px, transparent 1px)', backgroundSize:'60px 60px'}} />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 py-24 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-flex items-center gap-2 bg-[#00d4ff]/10 border border-[#00d4ff]/20 rounded-full px-4 py-1.5 text-sm text-[#00d4ff] mb-6">
              <span className="w-1.5 h-1.5 bg-[#00d4ff] rounded-full animate-pulse" />
              Karachi's #1 AC Service Provider
            </div>
            <h1 className="font-display text-5xl sm:text-6xl font-bold leading-[1.05] mb-6">
              <span className="text-white">Expert AC</span><br/>
              <span className="glow-text" style={{color:'#00d4ff'}}>Care & Repair</span><br/>
              <span className="text-white">At Your Door</span>
            </h1>
            <p className="text-white/50 text-lg leading-relaxed mb-8 max-w-md">
              Professional AC cleaning, repair, gas charging, and installation. Book in 60 seconds, get service today.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link to="/services" className="btn-primary px-8 py-3 text-base">
                Book a Service
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
              </Link>
              <Link to="/register" className="btn-ghost px-8 py-3 text-base">Create Account</Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-12">
              {stats.map(s => (
                <div key={s.l}>
                  <p className="font-display text-2xl font-bold text-[#00d4ff]">{s.v}</p>
                  <p className="text-xs text-white/40 mt-0.5">{s.l}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Decorative AC unit illustration */}
          <div className="hidden lg:flex justify-center items-center">
            <div className="relative w-80 h-80">
              <div className="absolute inset-0 bg-[#00d4ff]/5 rounded-full animate-pulse-glow" />
              <div className="absolute inset-8 glass-card rounded-3xl flex items-center justify-center animate-float">
                <div className="text-center">
                  <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="#00d4ff" strokeWidth="1.5" className="mx-auto mb-4 opacity-80">
                    <rect x="2" y="7" width="20" height="10" rx="3"/>
                    <path d="M12 7V3M8 7V5M16 7V5"/>
                    <circle cx="12" cy="12" r="2.5" fill="#00d4ff20"/>
                    <path d="M5 12h2M17 12h2"/>
                    <path d="M6 17c0 2 1.5 3 3 3s3-1 3-1 1.5 1 3 1 3-1 3-3"/>
                  </svg>
                  <p className="font-display font-bold text-white/80">Smart AC Care</p>
                  <p className="text-xs text-white/30 mt-1">Book in 60 seconds</p>
                  <div className="flex gap-2 justify-center mt-4">
                    {['❄️', '🔧', '⚡'].map(e => (
                      <span key={e} className="w-8 h-8 glass-card rounded-lg flex items-center justify-center text-sm">{e}</span>
                    ))}
                  </div>
                </div>
              </div>
              {/* Orbit dots */}
              <div className="absolute inset-0 animate-spin-slow">
                {[0,90,180,270].map(deg => (
                  <div key={deg} className="absolute w-3 h-3 bg-[#00d4ff] rounded-full opacity-60"
                    style={{top:'50%',left:'50%',transform:`rotate(${deg}deg) translateX(150px) translateY(-50%)`}} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-[#00d4ff] text-sm font-semibold uppercase tracking-widest mb-3">What We Offer</p>
            <h2 className="font-display text-4xl font-bold text-white mb-4">Our Services</h2>
            <p className="text-white/40 max-w-md mx-auto">Comprehensive AC solutions delivered by expert technicians</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {services.length > 0 ? services.map((service, i) => (
              <div key={service._id} className="glass-card-hover p-6 group" style={{animationDelay:`${i*0.1}s`}}>
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-[#00d4ff]/10 border border-[#00d4ff]/20 flex items-center justify-center text-2xl">
                    {CATEGORY_ICONS[service.category] || '🔧'}
                  </div>
                  <span className="text-xs text-[#00d4ff]/70 bg-[#00d4ff]/10 border border-[#00d4ff]/20 px-2.5 py-1 rounded-full">{service.category}</span>
                </div>
                <h3 className="font-display font-bold text-white text-lg mb-2">{service.name}</h3>
                <p className="text-sm text-white/40 leading-relaxed mb-5 line-clamp-2">{service.description}</p>
                <div className="flex items-center gap-3 text-xs text-white/30 mb-5">
                  <span>⏱ {service.duration} min</span>
                  <span>⭐ {service.rating}</span>
                  <span>📊 {service.bookingCount} booked</span>
                </div>
                <div className="flex items-center justify-between pt-4 border-t border-white/5">
                  <p className="font-display text-xl font-bold text-[#00d4ff]">Rs. {service.price?.toLocaleString()}</p>
                  <Link to={`/book/${service._id}`} className="btn-primary text-sm py-2 px-4">Book Now</Link>
                </div>
              </div>
            )) : (
              [...Array(6)].map((_, i) => (
                <div key={i} className="glass-card p-6 animate-pulse">
                  <div className="w-12 h-12 bg-white/5 rounded-xl mb-4" />
                  <div className="h-5 bg-white/5 rounded mb-2 w-3/4" />
                  <div className="h-4 bg-white/5 rounded w-full mb-1" />
                  <div className="h-4 bg-white/5 rounded w-2/3" />
                </div>
              ))
            )}
          </div>

          <div className="text-center mt-10">
            <Link to="/services" className="btn-ghost px-8 py-3">
              View All Services
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-4 border-t border-white/5">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-[#00d4ff] text-sm font-semibold uppercase tracking-widest mb-3">Why Choose Us</p>
            <h2 className="font-display text-4xl font-bold text-white mb-4">Built Different</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {features.map(f => (
              <div key={f.title} className="glass-card-hover p-6">
                <div className="text-3xl mb-4">{f.icon}</div>
                <h3 className="font-display font-bold text-white mb-2">{f.title}</h3>
                <p className="text-sm text-white/40 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4">
        <div className="max-w-3xl mx-auto text-center glass-card p-12 neon-border">
          <div className="text-5xl mb-6">🌬️</div>
          <h2 className="font-display text-4xl font-bold text-white mb-4">
            Ready to Book?
          </h2>
          <p className="text-white/40 mb-8 max-w-md mx-auto">Create your free account and get your AC serviced by certified professionals today.</p>
          <Link to="/register" className="btn-primary px-10 py-3.5 text-base">
            Get Started Free
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default HomePage;
