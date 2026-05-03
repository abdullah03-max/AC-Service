import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/common/Navbar';
import TechnicianLiveMap from '../components/admin/TechnicianLiveMap';
import { analyticsAPI, bookingsAPI, techniciansAPI, servicesAPI, inventoryAPI } from '../services/api';
import { StatusBadge, StatCard, Modal, Spinner, EmptyState } from '../components/common';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import toast from 'react-hot-toast';

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const COLORS = ['#00d4ff','#10b981','#f59e0b','#ef4444','#8b5cf6','#06b6d4'];
const TABS = ['Overview','Bookings','Technicians','Users','Live Location','Services','Inventory'];

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass-card px-3 py-2 text-sm">
      <p className="text-white/60 mb-1">{label}</p>
      {payload.map(p => <p key={p.name} style={{color:p.fill || '#00d4ff'}} className="font-semibold">{p.name}: {p.value}</p>)}
    </div>
  );
};

// Technician Detail Modal Component
const TechnicianDetailModal = ({ isOpen, tech, onClose }) => {
  if (!isOpen || !tech) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-[#0a0f1e] border border-white/10 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 p-6 border-b border-white/10 bg-[#0a0f1e] flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-xl bg-[#00d4ff]/10 border border-[#00d4ff]/20 flex items-center justify-center text-[#00d4ff] text-2xl font-bold">
              {tech.user?.name?.charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 className="font-display font-bold text-2xl text-white">{tech.user?.name}</h2>
              <p className="text-sm text-white/40">{tech.employeeId}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-white/60 hover:text-white text-3xl">✕</button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Status Section */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-white/5 rounded-lg border border-white/10">
              <p className="text-white/40 text-xs uppercase tracking-wide mb-2">Current Status</p>
              <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${
                tech.currentStatus === 'on_job' ? 'bg-blue-500/20 text-blue-400' :
                tech.currentStatus === 'available' ? 'bg-emerald-500/20 text-emerald-400' :
                tech.currentStatus === 'break' ? 'bg-amber-500/20 text-amber-400' :
                'bg-white/5 text-white/50'
              }`}>
                {tech.currentStatus === 'on_job' ? '🔵' : tech.currentStatus === 'available' ? '🟢' : tech.currentStatus === 'break' ? '🟡' : '⚪'}
                {tech.currentStatus}
              </span>
            </div>

            <div className="p-4 bg-white/5 rounded-lg border border-white/10">
              <p className="text-white/40 text-xs uppercase tracking-wide mb-2">Employee ID</p>
              <p className="text-white font-mono text-sm font-bold">{tech.employeeId}</p>
            </div>
          </div>

          {/* Contact Information */}
          <div className="p-4 bg-[#00d4ff]/10 border border-[#00d4ff]/20 rounded-lg">
            <p className="text-white/40 text-xs uppercase tracking-wide mb-3">Contact Information</p>
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <span className="text-[#00d4ff]">✉️</span>
                <div>
                  <p className="text-white/40 text-xs">Email</p>
                  <p className="text-white font-medium">{tech.user?.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-[#00d4ff]">📞</span>
                <div>
                  <p className="text-white/40 text-xs">Phone</p>
                  <p className="text-white font-medium">{tech.user?.phone}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Professional Details */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-white/5 rounded-lg border border-white/10">
              <p className="text-white/40 text-xs uppercase tracking-wide mb-2">Experience</p>
              <p className="text-white font-bold text-lg">{tech.experience || 0} <span className="text-sm font-normal text-white/60">years</span></p>
            </div>

            <div className="p-4 bg-white/5 rounded-lg border border-white/10">
              <p className="text-white/40 text-xs uppercase tracking-wide mb-2">Monthly Salary</p>
              <p className="text-white font-bold text-lg">Rs. {tech.salary?.toLocaleString() || 'N/A'}</p>
            </div>

            <div className="p-4 bg-white/5 rounded-lg border border-white/10">
              <p className="text-white/40 text-xs uppercase tracking-wide mb-2">Completed Jobs</p>
              <p className="text-white font-bold text-lg">{tech.completedJobs || 0}</p>
            </div>

            <div className="p-4 bg-white/5 rounded-lg border border-white/10">
              <p className="text-white/40 text-xs uppercase tracking-wide mb-2">Rating</p>
              <div className="flex items-center gap-1">
                <span className="text-white font-bold text-lg">{tech.rating?.toFixed(1) || 'N/A'}</span>
                <span className="text-amber-400">⭐</span>
                <span className="text-white/40 text-sm">(from {tech.totalReviews || 0} reviews)</span>
              </div>
            </div>
          </div>

          {/* Specializations */}
          <div className="p-4 bg-white/5 rounded-lg border border-white/10">
            <p className="text-white/40 text-xs uppercase tracking-wide mb-3">Specializations</p>
            <div className="flex flex-wrap gap-2">
              {tech.specializations && tech.specializations.length > 0 ? (
                tech.specializations.map(spec => (
                  <span key={spec} className="px-3 py-1.5 bg-[#00d4ff]/20 text-[#00d4ff] border border-[#00d4ff]/30 rounded-lg text-xs font-medium">
                    🔧 {spec}
                  </span>
                ))
              ) : (
                <p className="text-white/40 text-sm">No specializations added</p>
              )}
            </div>
          </div>

          {/* Working Hours */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-white/5 rounded-lg border border-white/10">
              <p className="text-white/40 text-xs uppercase tracking-wide mb-2">Working Hours</p>
              <p className="text-white font-medium">
                {tech.workingHours?.start || 'N/A'} - {tech.workingHours?.end || 'N/A'}
              </p>
            </div>

            <div className="p-4 bg-white/5 rounded-lg border border-white/10">
              <p className="text-white/40 text-xs uppercase tracking-wide mb-2">Joining Date</p>
              <p className="text-white font-medium">
                {tech.joiningDate ? new Date(tech.joiningDate).toLocaleDateString('en-PK') : 'N/A'}
              </p>
            </div>
          </div>

          {/* Days Off */}
          {tech.daysOff && tech.daysOff.length > 0 && (
            <div className="p-4 bg-white/5 rounded-lg border border-white/10">
              <p className="text-white/40 text-xs uppercase tracking-wide mb-3">Days Off</p>
              <div className="flex flex-wrap gap-2">
                {tech.daysOff.map(day => (
                  <span key={day} className="px-3 py-1.5 bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-lg text-xs font-medium">
                    📅 {day}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Location Info */}
          {tech.currentLocation && (
            <div className="p-4 bg-purple-500/10 border border-purple-500/20 rounded-lg">
              <p className="text-white/40 text-xs uppercase tracking-wide mb-3">Current Location</p>
              <div className="space-y-2 text-sm">
                <p className="text-white">
                  📍 <span className="font-mono">Lat: {tech.currentLocation.lat.toFixed(6)}</span>
                </p>
                <p className="text-white">
                  📍 <span className="font-mono">Lng: {tech.currentLocation.lng.toFixed(6)}</span>
                </p>
                <p className="text-white/40 text-xs">
                  Last updated: {new Date(tech.currentLocation.lastUpdated).toLocaleString()}
                </p>
              </div>
            </div>
          )}

          {/* Availability Status */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-white/5 rounded-lg border border-white/10">
              <p className="text-white/40 text-xs uppercase tracking-wide mb-2">Available for Jobs</p>
              <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${
                tech.isAvailable ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'
              }`}>
                {tech.isAvailable ? '✅ Yes' : '❌ No'}
              </span>
            </div>

            <div className="p-4 bg-white/5 rounded-lg border border-white/10">
              <p className="text-white/40 text-xs uppercase tracking-wide mb-2">Account Status</p>
              <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${
                tech.isActive ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'
              }`}>
                {tech.isActive ? '✅ Active' : '❌ Inactive'}
              </span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 p-6 border-t border-white/10 bg-[#0a0f1e] flex gap-3">
          <button onClick={onClose} className="btn-primary flex-1">
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
// User Detail Modal Component
const UserDetailModal = ({ isOpen, user, onClose, onToggleStatus, onDelete }) => {
  if (!isOpen || !user) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-[#0a0f1e] border border-white/10 rounded-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="sticky top-0 p-6 border-b border-white/10 bg-[#0a0f1e] flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-[#00d4ff]/10 border border-[#00d4ff]/20 flex items-center justify-center text-[#00d4ff] text-xl font-bold">
              {user.name?.charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 className="font-display font-bold text-xl text-white">{user.name}</h2>
              <span className="text-xs bg-[#00d4ff]/10 text-[#00d4ff] border border-[#00d4ff]/20 px-2 py-0.5 rounded-full capitalize">{user.role}</span>
            </div>
          </div>
          <button onClick={onClose} className="text-white/60 hover:text-white text-2xl">✕</button>
        </div>

        <div className="p-6 space-y-6">
          <div className="space-y-4">
            <div className="p-4 bg-white/5 rounded-xl border border-white/10">
              <p className="text-white/40 text-xs uppercase tracking-wide mb-3">Contact Details</p>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <span className="text-lg">📧</span>
                  <div>
                    <p className="text-xs text-white/30">Email Address</p>
                    <p className="text-sm text-white font-medium">{user.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-lg">📱</span>
                  <div>
                    <p className="text-xs text-white/30">Phone Number</p>
                    <p className="text-sm text-white font-medium">{user.phone || 'Not provided'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-lg">📍</span>
                  <div>
                    <p className="text-xs text-white/30">Address</p>
                    <p className="text-sm text-white font-medium">{user.address || 'Not provided'}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 bg-white/5 rounded-xl border border-white/10">
              <p className="text-white/40 text-xs uppercase tracking-wide mb-3">Account Information</p>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-xs text-white/30 mb-1">Status</p>
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${user.isActive ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${user.isActive ? 'bg-emerald-400' : 'bg-red-400'}`} />
                    {user.isActive ? 'Active' : 'Blocked'}
                  </span>
                </div>
                <div>
                  <p className="text-xs text-white/30 mb-1">Joined Date</p>
                  <p className="text-white">{new Date(user.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="sticky bottom-0 p-6 border-t border-white/10 bg-[#0a0f1e] flex flex-wrap gap-3">
          <button onClick={() => onToggleStatus(user._id)} className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all border ${user.isActive ? 'border-amber-500/30 text-amber-500 hover:bg-amber-500/10' : 'border-emerald-500/30 text-emerald-500 hover:bg-emerald-500/10'}`}>
            {user.isActive ? 'Block User' : 'Unblock User'}
          </button>
          <button onClick={() => onDelete(user._id)} className="flex-1 py-2.5 rounded-xl text-sm font-bold border border-red-500/30 text-red-500 hover:bg-red-500/10 transition-all">
            Delete User
          </button>
          <button onClick={onClose} className="w-full py-2.5 rounded-xl text-sm font-bold glass-card hover:bg-white/5 transition-all text-white/70">
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

const AdminDashboard = () => {
  const [tab, setTab] = useState('Overview');
  const [analytics, setAnalytics] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [technicians, setTechnicians] = useState([]);
  const [users, setUsers] = useState([]);
  const [services, setServices] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);

  const [serviceModal, setServiceModal] = useState(false);
  const [techModal, setTechModal] = useState(false);
  const [inventoryModal, setInventoryModal] = useState(false);
  const [assignModal, setAssignModal] = useState({ open:false, bookingId:null });
  const [restockModal, setRestockModal] = useState({ open:false, itemId:null });
  const [viewTechModal, setViewTechModal] = useState({ open: false, tech: null });
  const [viewUserModal, setViewUserModal] = useState({ open: false, user: null });
  const [editingService, setEditingService] = useState(null);
  const [editingInventory, setEditingInventory] = useState(null);

  const blankSvc = { name:'', category:'Cleaning', description:'', price:'', duration:'', tags:'' };
  const blankTech = { name:'', email:'', password:'', phone:'', specializations:[], experience:'', salary:'' };
  const blankInv = { name:'', category:'Filter', description:'', quantity:'', unit:'piece', minStockLevel:5, costPrice:'', sellingPrice:'', supplier:'' };
  const [svcForm, setSvcForm] = useState(blankSvc);
  const [techForm, setTechForm] = useState(blankTech);
  const [invForm, setInvForm] = useState(blankInv);
  const [restockForm, setRestockForm] = useState({ quantity:'', supplier:'', cost:'' });

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [ana, bk, tech, usr, svc, inv] = await Promise.all([
        analyticsAPI.getDashboard(), 
        bookingsAPI.getAll(), 
        techniciansAPI.getLiveTracking(), 
        authAPI.getUsers(),
        servicesAPI.getAll(), 
        inventoryAPI.getAll()
      ]);
      setAnalytics(ana.data.data); 
      setBookings(bk.data.data); 
      setTechnicians(tech.data.data); 
      setUsers(usr.data.data);
      setServices(svc.data.data); 
      setInventory(inv.data.data);
    } catch { toast.error('Failed to load'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const res = await techniciansAPI.getLiveTracking();
        setTechnicians(res.data.data);
      } catch {
        // keep the last known live snapshot
      }
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!viewTechModal.open || !viewTechModal.tech) return;
    const refreshedTech = technicians.find(t => t._id === viewTechModal.tech._id);
    if (refreshedTech && refreshedTech !== viewTechModal.tech) {
      setViewTechModal({ open: true, tech: refreshedTech });
    }
  }, [technicians, viewTechModal]);

  const chartData = MONTHS.map((m, i) => {
    const found = analytics?.monthlyBookings?.find(x => x._id.month === i + 1);
    return { name: m, bookings: found?.count || 0, revenue: found?.revenue || 0 };
  });
  const statusData = analytics?.bookingsByStatus?.map(s => ({ name: s._id, value: s.count })) || [];

  const handleSaveSvc = async () => {
    try {
      const p = {...svcForm, price:Number(svcForm.price), duration:Number(svcForm.duration), tags: svcForm.tags ? svcForm.tags.split(',').map(t=>t.trim()) : []};
      if (editingService) { await servicesAPI.update(editingService._id, p); toast.success('Updated'); }
      else { await servicesAPI.create(p); toast.success('Created'); }
      setServiceModal(false); setEditingService(null); setSvcForm(blankSvc); loadData();
    } catch (e) { toast.error(e.response?.data?.message || 'Failed'); }
  };

  const handleDeleteSvc = async (id) => {
    if (!window.confirm('Delete?')) return;
    try { await servicesAPI.delete(id); toast.success('Deleted'); loadData(); } catch { toast.error('Failed'); }
  };

  const handleCreateTech = async () => {
    try {
      await techniciansAPI.create({...techForm, experience:Number(techForm.experience), salary:Number(techForm.salary)});
      toast.success('Technician created'); setTechModal(false); setTechForm(blankTech); loadData();
    } catch (e) { toast.error(e.response?.data?.message || 'Failed'); }
  };

  const handleAssign = async (techId) => {
    try { await bookingsAPI.assign(assignModal.bookingId, { technicianId:techId }); toast.success('Assigned'); setAssignModal({open:false,bookingId:null}); loadData(); }
    catch { toast.error('Failed'); }
  };

  const handleStatusUpdate = async (id, status) => {
    try { await bookingsAPI.updateStatus(id, { status }); toast.success('Updated'); loadData(); } catch { toast.error('Failed'); }
  };

  const handleSaveInv = async () => {
    try {
      const p = {...invForm, quantity:Number(invForm.quantity), minStockLevel:Number(invForm.minStockLevel), costPrice:Number(invForm.costPrice), sellingPrice:Number(invForm.sellingPrice)};
      if (editingInventory) { await inventoryAPI.update(editingInventory._id, p); toast.success('Updated'); }
      else { await inventoryAPI.create(p); toast.success('Added'); }
      setInventoryModal(false); setEditingInventory(null); setInvForm(blankInv); loadData();
    } catch { toast.error('Failed'); }
  };

  const handleRestock = async () => {
    try {
      await inventoryAPI.restock(restockModal.itemId, { quantity:Number(restockForm.quantity), supplier:restockForm.supplier, cost:Number(restockForm.cost)});
      toast.success('Restocked'); setRestockModal({open:false,itemId:null}); setRestockForm({quantity:'',supplier:'',cost:''}); loadData();
    } catch { toast.error('Failed'); }
  };

  const handleDeleteUser = async (id) => {
    if (!window.confirm('Are you sure you want to permanently delete this user?')) return;
    try {
      await authAPI.deleteUser(id);
      toast.success('User deleted');
      if (viewUserModal.open) setViewUserModal({ open: false, user: null });
      loadData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete');
    }
  };

  const handleToggleUserStatus = async (id) => {
    try {
      const res = await authAPI.toggleUserStatus(id);
      toast.success(res.data.message);
      if (viewUserModal.open && viewUserModal.user?._id === id) {
        setViewUserModal({ open: true, user: res.data.data });
      }
      loadData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update status');
    }
  };

  if (loading) return <div className="min-h-screen mesh-bg flex items-center justify-center pt-16"><Navbar /><Spinner size="lg" /></div>;

  return (
    <div className="min-h-screen mesh-bg pt-16">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-[#00d4ff] text-sm font-semibold uppercase tracking-widest mb-1">Admin Panel</p>
            <h1 className="font-display text-3xl font-bold text-white">Dashboard</h1>
          </div>
          <button onClick={loadData} className="btn-ghost text-sm px-4 py-2">⟳ Refresh</button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 glass-card p-1 rounded-xl mb-8 overflow-x-auto">
          {TABS.map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-5 py-2.5 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${tab === t ? 'bg-[#00d4ff] text-[#0a0f1e]' : 'text-white/50 hover:text-white'}`}>
              {t}
            </button>
          ))}
        </div>

        {/* OVERVIEW */}
        {tab === 'Overview' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard label="Total Bookings" value={analytics?.summary?.totalBookings || 0} icon="📋" />
              <StatCard label="Total Users" value={analytics?.summary?.totalUsers || 0} icon="👥" accent="#10b981" />
              <StatCard label="Technicians" value={analytics?.summary?.totalTechnicians || 0} icon="🔧" accent="#8b5cf6" />
              <StatCard label="Monthly Revenue" value={`Rs. ${((analytics?.summary?.revenueThisMonth||0)/1000).toFixed(0)}K`} icon="💰" accent="#f59e0b" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
              <div className="glass-card p-5 lg:col-span-2">
                <h3 className="font-display font-semibold text-white mb-5">Monthly Bookings</h3>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="name" tick={{fill:'rgba(255,255,255,0.4)',fontSize:11}} axisLine={false} tickLine={false} />
                    <YAxis tick={{fill:'rgba(255,255,255,0.4)',fontSize:11}} axisLine={false} tickLine={false} />
                    <Tooltip cursor={{ fill: 'transparent' }} content={<CustomTooltip />} />
                    <Bar dataKey="bookings" fill="#00d4ff" radius={[4,4,0,0]} opacity={0.8} name="Bookings" maxBarSize={60} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="glass-card p-5">
                <h3 className="font-display font-semibold text-white mb-5">Booking Status</h3>
                <ResponsiveContainer width="100%" height={180}>
                  <PieChart>
                    <Pie data={statusData} cx="50%" cy="50%" innerRadius={45} outerRadius={75} paddingAngle={3} dataKey="value">
                      {statusData.map((_,i) => <Cell key={i} fill={COLORS[i%COLORS.length]} />)}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-1.5 mt-2">
                  {statusData.map((s,i) => (
                    <div key={s.name} className="flex items-center gap-2 text-xs text-white/50">
                      <div className="w-2 h-2 rounded-full flex-shrink-0" style={{background:COLORS[i%COLORS.length]}} />
                      <span className="capitalize flex-1">{s.name?.replace('_',' ')}</span>
                      <span className="font-semibold text-white">{s.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="glass-card p-5">
              <h3 className="font-display font-semibold text-white mb-4">🔥 Popular Services</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead><tr className="text-left text-xs text-white/30 border-b border-white/5">
                    {['Service','Category','Bookings','Price'].map(h=><th key={h} className="pb-3 font-semibold pr-4">{h}</th>)}
                  </tr></thead>
                  <tbody>
                    {analytics?.popularServices?.map(s => (
                      <tr key={s._id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                        <td className="py-3 font-medium text-white pr-4">{s.name}</td>
                        <td className="py-3 pr-4"><span className="text-xs bg-[#00d4ff]/10 text-[#00d4ff] border border-[#00d4ff]/20 px-2 py-0.5 rounded-full">{s.category}</span></td>
                        <td className="py-3 font-bold text-[#00d4ff] pr-4">{s.bookingCount}</td>
                        <td className="py-3 text-white/60">Rs. {s.price?.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {analytics?.lowStockItems?.length > 0 && (
              <div className="glass-card p-5 border-amber-500/20 bg-amber-500/5">
                <h3 className="font-display font-semibold text-amber-300 mb-3">⚠️ Low Stock Alert</h3>
                {analytics.lowStockItems.map(item => (
                  <div key={item._id} className="flex items-center justify-between text-sm py-1.5">
                    <span className="text-amber-200">{item.name}</span>
                    <span className="text-amber-400/60">{item.quantity} {item.unit} left (min: {item.minStockLevel})</span>
                  </div>
                ))}
                <button onClick={() => setTab('Inventory')} className="text-sm text-amber-400 hover:underline mt-2">Manage Inventory →</button>
              </div>
            )}
          </div>
        )}

        {/* BOOKINGS */}
        {tab === 'Bookings' && (
          <div>
            <h2 className="font-display font-bold text-xl text-white mb-5">All Bookings ({bookings.length})</h2>
            <div className="glass-card overflow-x-auto p-0 rounded-2xl">
              <table className="w-full text-sm">
                <thead className="border-b border-white/10">
                  <tr className="text-left text-xs text-white/30 font-semibold uppercase tracking-wide">
                    {['Booking #','Customer','Service','Date','Status','Amount','Actions'].map(h => <th key={h} className="px-4 py-4 whitespace-nowrap">{h}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {bookings.map(b => (
                    <tr key={b._id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                      <td className="px-4 py-3 font-mono text-xs text-white/30">{b.bookingNumber}</td>
                      <td className="px-4 py-3">
                        <p className="font-medium text-white">{b.user?.name}</p>
                        <p className="text-xs text-white/30">{b.user?.phone}</p>
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-medium text-white/80">{b.service?.name}</p>
                        <span className="text-xs text-[#00d4ff]/60">{b.service?.category}</span>
                      </td>
                      <td className="px-4 py-3 text-white/40 text-xs">
                        <p>{new Date(b.scheduledDate).toLocaleDateString('en-PK')}</p>
                        <p>{b.scheduledTime}</p>
                      </td>
                      <td className="px-4 py-3"><StatusBadge status={b.status} /></td>
                      <td className="px-4 py-3 font-bold text-white">Rs. {b.totalAmount?.toLocaleString()}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <Link to={`/booking/${b._id}`} className="text-xs text-[#00d4ff] hover:underline">View</Link>
                          {b.status === 'confirmed' && (
                            <button onClick={() => setAssignModal({open:true, bookingId:b._id})}
                              className="text-xs bg-purple-500/20 text-purple-300 border border-purple-500/20 px-2 py-1 rounded-lg hover:bg-purple-500/30 transition-colors">
                              Assign
                            </button>
                          )}
                          {['pending','assigned','in_progress'].includes(b.status) && (
                            <select onChange={e => e.target.value && handleStatusUpdate(b._id, e.target.value)} defaultValue="" className="text-xs bg-white/5 border border-white/10 text-white/60 rounded-lg px-2 py-1">
                              <option value="">Update</option>
                              <option value="confirmed">Confirm</option>
                              <option value="in_progress">In Progress</option>
                              <option value="completed">Complete</option>
                              <option value="cancelled">Cancel</option>
                            </select>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {bookings.length === 0 && <EmptyState icon="📋" title="No bookings yet" description="Bookings will appear here" />}
            </div>
          </div>
        )}

        {/* TECHNICIANS */}
        {tab === 'Technicians' && (
          <div>
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-display font-bold text-xl text-white">Technicians ({technicians.length})</h2>
              <button onClick={() => setTechModal(true)} className="btn-primary text-sm px-4 py-2">+ Add Technician</button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {technicians.map(tech => (
                <div key={tech._id} className="glass-card-hover p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-xl bg-[#00d4ff]/10 border border-[#00d4ff]/20 flex items-center justify-center text-[#00d4ff] font-bold text-lg">
                        {tech.user?.name?.charAt(0)}
                      </div>
                      <div>
                        <p className="font-semibold text-white">{tech.user?.name}</p>
                        <p className="text-xs text-white/30">{tech.employeeId}</p>
                      </div>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full font-medium border ${tech.currentStatus==='available'?'bg-emerald-500/20 text-emerald-400 border-emerald-500/20':tech.currentStatus==='on_job'?'bg-blue-500/20 text-blue-400 border-blue-500/20':'bg-white/5 text-white/30 border-white/10'}`}>
                      {tech.currentStatus}
                    </span>
                  </div>
                  <div className="space-y-1 text-xs text-white/40 mb-3">
                    <p>✉️ {tech.user?.email}</p>
                    <p>📞 {tech.user?.phone}</p>
                    <p>⭐ {tech.rating}/5 · {tech.completedJobs} jobs completed</p>
                    <p>🔧 {tech.specializations?.join(', ')}</p>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => setViewTechModal({ open: true, tech })}
                      className="flex-1 text-xs bg-[#00d4ff]/10 text-[#00d4ff] border border-[#00d4ff]/20 py-1.5 rounded-lg hover:bg-[#00d4ff]/20 transition-colors font-medium">
                      👁️ View Details
                    </button>
                    <button 
                      onClick={async () => { if (!window.confirm('Deactivate?')) return; await techniciansAPI.delete(tech._id); toast.success('Deactivated'); loadData(); }}
                      className="flex-1 text-xs text-red-400 border border-red-500/20 py-1.5 rounded-lg hover:bg-red-500/10 transition-colors">
                      Deactivate
                    </button>
                  </div>
                </div>
              ))}
            </div>
            {technicians.length === 0 && <div className="glass-card p-6"><EmptyState icon="👨‍🔧" title="No technicians" description="Add your first technician" action={<button onClick={() => setTechModal(true)} className="btn-primary">Add Technician</button>} /></div>}
          </div>
        )}

        {/* USERS */}
        {tab === 'Users' && (
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <h2 className="font-display font-bold text-xl text-white">Registered Users ({users.length})</h2>
                <p className="text-sm text-white/40">Manage user accounts and status</p>
              </div>
            </div>
            
            <div className="glass-card overflow-hidden p-0 rounded-2xl border border-white/10">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-white/5 border-b border-white/10">
                    <tr className="text-left text-xs text-white/30 font-semibold uppercase tracking-wider">
                      <th className="px-6 py-4">User</th>
                      <th className="px-6 py-4">Role</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4">Joined</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {users.map(u => (
                      <tr key={u._id} className="hover:bg-white/5 transition-colors group">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-lg bg-white/5 flex items-center justify-center text-white/40 font-bold group-hover:bg-[#00d4ff]/10 group-hover:text-[#00d4ff] transition-all">
                              {u.name?.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="font-medium text-white">{u.name}</p>
                              <p className="text-xs text-white/30">{u.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${u.role === 'admin' ? 'border-purple-500/30 text-purple-400 bg-purple-500/5' : u.role === 'technician' ? 'border-blue-500/30 text-blue-400 bg-blue-500/5' : 'border-white/10 text-white/40'}`}>
                            {u.role}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center gap-1.5 text-xs font-medium ${u.isActive ? 'text-emerald-400' : 'text-red-400'}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${u.isActive ? 'bg-emerald-400' : 'bg-red-400'}`} />
                            {u.isActive ? 'Active' : 'Blocked'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-white/30 text-xs font-mono">
                          {new Date(u.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button onClick={() => setViewUserModal({ open: true, user: u })} className="p-2 text-white/30 hover:text-[#00d4ff] hover:bg-[#00d4ff]/10 rounded-lg transition-all" title="View Details">
                              👁️
                            </button>
                            <button onClick={() => handleToggleUserStatus(u._id)} className={`p-2 rounded-lg transition-all ${u.isActive ? 'text-amber-500/40 hover:text-amber-500 hover:bg-amber-500/10' : 'text-emerald-500/40 hover:text-emerald-500 hover:bg-emerald-500/10'}`} title={u.isActive ? 'Block' : 'Unblock'}>
                              {u.isActive ? '🚫' : '✅'}
                            </button>
                            <button onClick={() => handleDeleteUser(u._id)} className="p-2 text-red-500/30 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all" title="Delete">
                              🗑️
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {users.length === 0 && <EmptyState icon="👥" title="No users found" description="Users will appear here after registration" />}
            </div>
          </div>
        )}

        {/* LIVE LOCATION */}
        {tab === 'Live Location' && (
          <div>
            <TechnicianLiveMap />
          </div>
        )}

        {/* SERVICES */}
        {tab === 'Services' && (
          <div>
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-display font-bold text-xl text-white">Services ({services.length})</h2>
              <button onClick={() => { setEditingService(null); setSvcForm(blankSvc); setServiceModal(true); }} className="btn-primary text-sm px-4 py-2">+ Add Service</button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {services.map(s => (
                <div key={s._id} className="glass-card-hover p-5">
                  <div className="flex items-start justify-between mb-3">
                    <span className="text-xs bg-[#00d4ff]/10 text-[#00d4ff] border border-[#00d4ff]/20 px-2.5 py-1 rounded-full">{s.category}</span>
                    <div className="flex gap-1.5">
                      <span className={`w-2 h-2 rounded-full mt-1.5 ${s.isActive?'bg-emerald-400':'bg-white/50'}`} />
                    </div>
                  </div>
                  <h3 className="font-display font-bold text-white mb-1">{s.name}</h3>
                  <p className="text-xs text-white/40 line-clamp-2 mb-3">{s.description}</p>
                  <div className="flex gap-3 text-xs text-white/30 mb-3">
                    <span>⏱ {s.duration}m</span><span>⭐ {s.rating}</span><span>📊 {s.bookingCount}</span>
                  </div>
                  <div className="flex items-center justify-between pt-3 border-t border-white/5">
                    <p className="font-display font-bold text-[#00d4ff]">Rs. {s.price?.toLocaleString()}</p>
                    <div className="flex gap-2">
                      <button onClick={() => { setEditingService(s); setSvcForm({name:s.name, category:s.category, description:s.description, price:s.price, duration:s.duration, tags:s.tags?.join(', ')||''}); setServiceModal(true); }}
                        className="p-1.5 text-white/30 hover:text-[#00d4ff] hover:bg-[#00d4ff]/10 rounded-lg transition-colors text-sm">✎</button>
                      <button onClick={() => handleDeleteSvc(s._id)} className="p-1.5 text-white/30 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors text-sm">✕</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* INVENTORY */}
        {tab === 'Inventory' && (
          <div>
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-display font-bold text-xl text-white">Inventory ({inventory.length} items)</h2>
              <button onClick={() => { setEditingInventory(null); setInvForm(blankInv); setInventoryModal(true); }} className="btn-primary text-sm px-4 py-2">+ Add Item</button>
            </div>
            <div className="glass-card overflow-x-auto p-0 rounded-2xl">
              <table className="w-full text-sm">
                <thead className="border-b border-white/10">
                  <tr className="text-left text-xs text-white/30 font-semibold uppercase tracking-wide">
                    {['SKU','Item','Stock','Status','Cost Price','Sell Price','Actions'].map(h => <th key={h} className="px-4 py-4 whitespace-nowrap">{h}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {inventory.map(item => {
                    const low = item.quantity <= item.minStockLevel;
                    return (
                      <tr key={item._id} className={`border-b border-white/5 transition-colors ${low ? 'bg-amber-500/5' : 'hover:bg-white/5'}`}>
                        <td className="px-4 py-3 font-mono text-xs text-white/20">{item.sku}</td>
                        <td className="px-4 py-3">
                          <p className="font-medium text-white">{item.name}</p>
                          <p className="text-xs text-white/30">{item.category} · {item.supplier}</p>
                        </td>
                        <td className="px-4 py-3 font-bold text-white">{item.quantity} <span className="text-white/30 font-normal text-xs">{item.unit}</span></td>
                        <td className="px-4 py-3">{low ? <span className="text-xs bg-red-500/20 text-red-400 border border-red-500/20 px-2 py-0.5 rounded-full">⚠ Low</span> : <span className="text-xs bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full">OK</span>}</td>
                        <td className="px-4 py-3 text-white/40">Rs. {item.costPrice?.toLocaleString()}</td>
                        <td className="px-4 py-3 font-semibold text-white">Rs. {item.sellingPrice?.toLocaleString()}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <button onClick={() => setRestockModal({open:true, itemId:item._id})} className="text-xs bg-[#00d4ff]/10 text-[#00d4ff] border border-[#00d4ff]/20 px-2.5 py-1 rounded-lg hover:bg-[#00d4ff]/20 transition-colors">Restock</button>
                            <button onClick={() => { setEditingInventory(item); setInvForm({name:item.name, category:item.category, description:item.description||'', quantity:item.quantity, unit:item.unit, minStockLevel:item.minStockLevel, costPrice:item.costPrice, sellingPrice:item.sellingPrice, supplier:item.supplier||''}); setInventoryModal(true); }} className="p-1.5 text-white/20 hover:text-[#00d4ff] hover:bg-[#00d4ff]/10 rounded-lg transition-colors text-sm">✎</button>
                            <button onClick={async () => { if (!window.confirm('Remove?')) return; await inventoryAPI.delete(item._id); toast.success('Removed'); loadData(); }} className="p-1.5 text-white/20 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors text-sm">✕</button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {inventory.length === 0 && <EmptyState icon="📦" title="No inventory items" description="Add parts and supplies" />}
            </div>
          </div>
        )}
      </div>

      {/* SERVICE MODAL */}
      <Modal isOpen={serviceModal} onClose={() => setServiceModal(false)} title={editingService ? 'Edit Service' : 'Add New Service'}>
        <div className="space-y-4">
          {[['name','Service Name','text'],['price','Price (Rs.)','number'],['duration','Duration (minutes)','number']].map(([k,l,t]) => (
            <div key={k}>
              <label className="block text-sm text-white/60 mb-1.5">{l}</label>
              <input type={t} value={svcForm[k]} onChange={e => setSvcForm(p=>({...p,[k]:e.target.value}))} className="input-field" />
            </div>
          ))}
          <div>
            <label className="block text-sm text-white/60 mb-1.5">Category</label>
            <select value={svcForm.category} onChange={e => setSvcForm(p=>({...p,category:e.target.value}))} className="input-field">
              {['Cleaning','Repair','Installation','Gas Charging','Maintenance','Inspection'].map(c=><option key={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm text-white/60 mb-1.5">Description</label>
            <textarea value={svcForm.description} onChange={e => setSvcForm(p=>({...p,description:e.target.value}))} rows={3} className="input-field resize-none" />
          </div>
          <div>
            <label className="block text-sm text-white/60 mb-1.5">Tags (comma-separated)</label>
            <input value={svcForm.tags} onChange={e => setSvcForm(p=>({...p,tags:e.target.value}))} className="input-field" placeholder="popular, recommended" />
          </div>
          <div className="flex gap-3 pt-2">
            <button onClick={() => setServiceModal(false)} className="btn-ghost flex-1">Cancel</button>
            <button onClick={handleSaveSvc} className="btn-primary flex-1">{editingService ? 'Update' : 'Create'}</button>
          </div>
        </div>
      </Modal>

      {/* TECH MODAL */}
      <Modal isOpen={techModal} onClose={() => setTechModal(false)} title="Add Technician" size="lg">
        <div className="grid grid-cols-2 gap-4">
          {[['name','Full Name','text'],['email','Email','email'],['password','Password','password'],['phone','Phone','tel'],['experience','Experience (yrs)','number'],['salary','Monthly Salary','number']].map(([k,l,t]) => (
            <div key={k}>
              <label className="block text-sm text-white/60 mb-1.5">{l}</label>
              <input type={t} value={techForm[k]} onChange={e => setTechForm(p=>({...p,[k]:e.target.value}))} className="input-field" />
            </div>
          ))}
          <div className="col-span-2">
            <label className="block text-sm text-white/60 mb-2">Specializations</label>
            <div className="flex flex-wrap gap-2">
              {['Cleaning','Repair','Installation','Gas Charging','Maintenance'].map(s => (
                <label key={s} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-sm cursor-pointer transition-all ${techForm.specializations.includes(s)?'border-[#00d4ff] bg-[#00d4ff]/10 text-[#00d4ff]':'border-white/10 text-white/50 hover:border-white/20'}`}>
                  <input type="checkbox" className="hidden" checked={techForm.specializations.includes(s)}
                    onChange={e => setTechForm(p=>({...p, specializations: e.target.checked?[...p.specializations,s]:p.specializations.filter(x=>x!==s)}))} />
                  {s}
                </label>
              ))}
            </div>
          </div>
        </div>
        <div className="flex gap-3 pt-4">
          <button onClick={() => setTechModal(false)} className="btn-ghost flex-1">Cancel</button>
          <button onClick={handleCreateTech} className="btn-primary flex-1">Create Technician</button>
        </div>
      </Modal>

      {/* ASSIGN MODAL */}
      <Modal isOpen={assignModal.open} onClose={() => setAssignModal({open:false,bookingId:null})} title="Assign Technician">
        <div className="space-y-3">
          {technicians.filter(t => t.currentStatus === 'available').map(tech => (
            <div key={tech._id} className="flex items-center justify-between p-3 glass-card-hover rounded-xl">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-[#00d4ff]/10 flex items-center justify-center text-[#00d4ff] font-bold">{tech.user?.name?.charAt(0)}</div>
                <div>
                  <p className="font-medium text-white">{tech.user?.name}</p>
                  <p className="text-xs text-white/40">⭐ {tech.rating} · {tech.completedJobs} jobs</p>
                </div>
              </div>
              <button onClick={() => handleAssign(tech._id)} className="btn-primary text-sm py-1.5 px-4">Assign</button>
            </div>
          ))}
          {technicians.filter(t=>t.currentStatus==='available').length === 0 && <p className="text-center text-white/40 py-8">No available technicians</p>}
        </div>
      </Modal>

      {/* INVENTORY MODAL */}
      <Modal isOpen={inventoryModal} onClose={() => setInventoryModal(false)} title={editingInventory ? 'Edit Item' : 'Add Item'} size="lg">
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <label className="block text-sm text-white/60 mb-1.5">Item Name</label>
            <input value={invForm.name} onChange={e => setInvForm(p=>({...p,name:e.target.value}))} className="input-field" />
          </div>
          <div>
            <label className="block text-sm text-white/60 mb-1.5">Category</label>
            <select value={invForm.category} onChange={e => setInvForm(p=>({...p,category:e.target.value}))} className="input-field">
              {['Filter','Gas','Refrigerant','Compressor','Motor','Capacitor','PCB','Pipe','Wire','Other'].map(c=><option key={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm text-white/60 mb-1.5">Unit</label>
            <select value={invForm.unit} onChange={e => setInvForm(p=>({...p,unit:e.target.value}))} className="input-field">
              {['piece','kg','liter','meter','set'].map(u=><option key={u}>{u}</option>)}
            </select>
          </div>
          {[['quantity','Quantity'],['minStockLevel','Min Stock'],['costPrice','Cost Price (Rs.)'],['sellingPrice','Sell Price (Rs.)']].map(([k,l]) => (
            <div key={k}>
              <label className="block text-sm text-white/60 mb-1.5">{l}</label>
              <input type="number" value={invForm[k]} onChange={e => setInvForm(p=>({...p,[k]:e.target.value}))} className="input-field" />
            </div>
          ))}
          <div className="col-span-2">
            <label className="block text-sm text-white/60 mb-1.5">Supplier</label>
            <input value={invForm.supplier} onChange={e => setInvForm(p=>({...p,supplier:e.target.value}))} className="input-field" />
          </div>
        </div>
        <div className="flex gap-3 pt-4">
          <button onClick={() => setInventoryModal(false)} className="btn-ghost flex-1">Cancel</button>
          <button onClick={handleSaveInv} className="btn-primary flex-1">{editingInventory ? 'Update' : 'Add'}</button>
        </div>
      </Modal>

      {/* RESTOCK MODAL */}
      <Modal isOpen={restockModal.open} onClose={() => setRestockModal({open:false,itemId:null})} title="Restock Item" size="sm">
        <div className="space-y-4">
          {[['quantity','Quantity to Add','number'],['supplier','Supplier','text'],['cost','Total Cost (Rs.)','number']].map(([k,l,t]) => (
            <div key={k}>
              <label className="block text-sm text-white/60 mb-1.5">{l}</label>
              <input type={t} value={restockForm[k]} onChange={e => setRestockForm(p=>({...p,[k]:e.target.value}))} className="input-field" />
            </div>
          ))}
          <div className="flex gap-3">
            <button onClick={() => setRestockModal({open:false,itemId:null})} className="btn-ghost flex-1">Cancel</button>
            <button onClick={handleRestock} className="btn-primary flex-1">Restock</button>
          </div>
        </div>
      </Modal>

      {/* VIEW TECHNICIAN DETAILS MODAL */}
      <TechnicianDetailModal 
        isOpen={viewTechModal.open} 
        tech={viewTechModal.tech} 
        onClose={() => setViewTechModal({ open: false, tech: null })} 
      />

      {/* VIEW USER DETAILS MODAL */}
      <UserDetailModal
        isOpen={viewUserModal.open}
        user={viewUserModal.user}
        onClose={() => setViewUserModal({ open: false, user: null })}
        onToggleStatus={handleToggleUserStatus}
        onDelete={handleDeleteUser}
      />
    </div>
  );
};

export default AdminDashboard;
