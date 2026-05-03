import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { notificationsAPI } from '../../services/api';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => { setUserMenuOpen(false); setMobileOpen(false); setNotifOpen(false); }, [location]);

  useEffect(() => {
    if (user) {
      const fetchNotifs = async () => {
        try {
          const res = await notificationsAPI.getAll();
          setNotifications(res.data.data);
        } catch (e) {}
      };
      fetchNotifs();
      const interval = setInterval(fetchNotifs, 15000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleMarkRead = async (id) => {
    try {
      await notificationsAPI.markRead(id);
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, read: true } : n));
    } catch (e) {}
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationsAPI.markAllRead();
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    } catch (e) {}
  };

  const getDashboardLink = () => {
    if (!user) return '/login';
    return user.role === 'admin' ? '/admin' : user.role === 'technician' ? '/technician' : '/dashboard';
  };

  const handleLogout = () => { logout(); navigate('/'); };
  const isActive = (p) => location.pathname === p;

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-[#0a0f1e]/95 border-b border-white/10 backdrop-blur-xl' : 'bg-transparent'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-[#00d4ff]/10 border border-[#00d4ff]/30 flex items-center justify-center text-[#00d4ff] group-hover:bg-[#00d4ff]/20 transition-all">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="7" width="20" height="10" rx="2"/><path d="M12 7V4M8 7V5M16 7V5"/><circle cx="12" cy="12" r="2"/><path d="M6 12h2M16 12h2"/></svg>
            </div>
            <div>
              <span className="font-display font-bold text-white text-base leading-none block">Cool Care</span>
              <span className="text-[10px] text-[#00d4ff] font-bold tracking-widest uppercase leading-none">AC Tech</span>
            </div>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            {[['/', 'Home'], ['/services', 'Services']].map(([to, label]) => (
              <Link key={to} to={to} className={`text-sm font-medium transition-colors relative pb-0.5 ${isActive(to) ? 'text-[#00d4ff]' : 'text-white/60 hover:text-white'}`}>
                {label}
                {isActive(to) && <span className="absolute -bottom-0.5 left-0 right-0 h-px bg-[#00d4ff] rounded-full" />}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-3">
            {user ? (
              <>
                <div className="relative">
                  <button onClick={() => { setNotifOpen(!notifOpen); setUserMenuOpen(false); }} className="relative p-2 text-white/70 hover:text-white transition-colors">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>
                    {unreadCount > 0 && <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-[#0a0f1e]"></span>}
                  </button>
                  {notifOpen && (
                    <div className="absolute right-0 mt-2 w-80 bg-[#111827] border border-white/10 rounded-2xl shadow-2xl py-2 z-50 max-h-[80vh] flex flex-col">
                      <div className="px-4 py-3 border-b border-white/10 flex justify-between items-center bg-[#0a0f1e]">
                        <h3 className="text-white font-bold text-sm">Notifications</h3>
                        {unreadCount > 0 && <button onClick={handleMarkAllRead} className="text-xs text-[#00d4ff] hover:underline">Mark all read</button>}
                      </div>
                      <div className="overflow-y-auto flex-1">
                        {notifications.length === 0 ? (
                          <p className="text-center text-white/40 text-sm py-6">No notifications yet.</p>
                        ) : (
                          notifications.map(n => (
                            <div key={n._id} onClick={() => !n.read && handleMarkRead(n._id)} className={`px-4 py-3 border-b border-white/5 cursor-pointer transition-colors ${n.read ? 'opacity-60' : 'bg-[#00d4ff]/5 hover:bg-[#00d4ff]/10'}`}>
                              <p className="text-sm text-white">{n.message}</p>
                              <p className="text-xs text-white/40 mt-1">{new Date(n.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <div className="relative">
                  <button onClick={() => { setUserMenuOpen(!userMenuOpen); setNotifOpen(false); }}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition-all">
                  <div className="w-7 h-7 rounded-lg bg-[#00d4ff]/20 flex items-center justify-center text-[#00d4ff] text-xs font-bold">
                    {user.name?.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-sm text-white/80 hidden sm:block max-w-20 truncate">{user.name?.split(' ')[0]}</span>
                  <span className="hidden sm:block text-xs bg-[#00d4ff]/10 text-[#00d4ff] border border-[#00d4ff]/20 px-1.5 py-0.5 rounded-md capitalize">{user.role}</span>
                </button>

                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-52 bg-[#111827] border border-white/10 rounded-2xl shadow-2xl py-2 z-50">
                    <div className="px-4 py-2.5 border-b border-white/10">
                      <p className="text-sm font-semibold text-white">{user.name}</p>
                      <p className="text-xs text-white/40">{user.email}</p>
                    </div>
                    <Link to={getDashboardLink()} className="flex items-center gap-2 px-4 py-2.5 text-sm text-white/70 hover:text-white hover:bg-white/5 transition-colors">
                      Dashboard
                    </Link>
                    <button onClick={handleLogout}
                      className="flex items-center gap-2 px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 w-full text-left transition-colors">
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login" className="text-sm text-white/60 hover:text-white px-3 py-2 transition-colors hidden sm:block">Login</Link>
                <Link to="/register" className="btn-primary text-sm py-2 px-4">Get Started</Link>
              </div>
            )}
            <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden p-2 text-white/60 hover:text-white">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                {mobileOpen ? <path d="M18 6L6 18M6 6l12 12"/> : <path d="M3 12h18M3 6h18M3 18h18"/>}
              </svg>
            </button>
          </div>
        </div>

        {mobileOpen && (
          <div className="md:hidden py-4 border-t border-white/10 flex flex-col gap-1">
            {[['/', 'Home'], ['/services', 'Services']].map(([to, label]) => (
              <Link key={to} to={to} className={`px-4 py-3 text-sm font-medium rounded-xl transition-all ${isActive(to) ? 'bg-[#00d4ff]/10 text-[#00d4ff]' : 'text-white/60 hover:text-white hover:bg-white/5'}`}>{label}</Link>
            ))}
            {user ? (
              <div className="mt-2 pt-4 border-t border-white/5 px-4 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#00d4ff]/20 flex items-center justify-center text-[#00d4ff] font-bold">
                    {user.name?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white">{user.name}</p>
                    <p className="text-xs text-white/40">{user.email}</p>
                  </div>
                </div>
                <div className="flex flex-col gap-1">
                  <Link to={getDashboardLink()} className="py-2.5 text-sm text-white/70 hover:text-white transition-colors">Dashboard</Link>
                  <button onClick={handleLogout} className="py-2.5 text-sm text-red-400 text-left transition-colors">Logout</button>
                </div>
              </div>
            ) : (
              <div className="mt-4 flex flex-col gap-2 px-2">
                <Link to="/login" className="btn-ghost w-full py-3">Login</Link>
                <Link to="/register" className="btn-primary w-full py-3">Get Started</Link>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
