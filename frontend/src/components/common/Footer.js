import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => (
  <footer className="border-t border-white/10 bg-[#0a0f1e] mt-auto">
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
        <div className="md:col-span-2">
          <div className="flex items-center gap-2.5 mb-4">
            <div className="w-8 h-8 rounded-lg bg-[#00d4ff]/10 border border-[#00d4ff]/30 flex items-center justify-center text-[#00d4ff]">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="7" width="20" height="10" rx="2"/><path d="M12 7V4M8 7V5M16 7V5"/><circle cx="12" cy="12" r="2"/></svg>
            </div>
            <span className="font-display font-bold text-white">Cool Care AC Tech</span>
          </div>
          <p className="text-sm text-white/40 max-w-xs leading-relaxed">Professional AC services and maintenance across Pakistan. Trusted by thousands of homes and businesses.</p>
          <div className="mt-4 space-y-1.5 text-sm text-white/40">
            <p>📞 0300-FULLCARE</p>
            <p>✉️ info@fullcareac.com</p>
            <p>📍 Pakistan</p>
          </div>
        </div>
        <div>
          <h4 className="font-display font-semibold text-white mb-4 text-sm">Services</h4>
          <ul className="space-y-2">
            {['AC Cleaning', 'Gas Charging', 'AC Repair', 'Installation', 'Maintenance'].map(s => (
              <li key={s}><Link to="/services" className="text-sm text-white/40 hover:text-[#00d4ff] transition-colors">{s}</Link></li>
            ))}
          </ul>
        </div>
        <div>
          <h4 className="font-display font-semibold text-white mb-4 text-sm">Links</h4>
          <ul className="space-y-2">
            {[['Home', '/'], ['Services', '/services'], ['Login', '/login'], ['Register', '/register']].map(([l, t]) => (
              <li key={l}><Link to={t} className="text-sm text-white/40 hover:text-[#00d4ff] transition-colors">{l}</Link></li>
            ))}
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10 pt-6 flex flex-col sm:flex-row justify-between items-center text-xs text-white/20">
        <p>© 2024 Cool Care AC Tech. All rights reserved.</p>
        <p className="mt-2 sm:mt-0">Built for reliable AC services in Pakistan</p>
      </div>
    </div>
  </footer>
);

export default Footer;
