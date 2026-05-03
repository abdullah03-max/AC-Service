import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/common/Navbar';
import { servicesAPI, bookingsAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';
import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

const SLOTS = ['09:00 AM','10:00 AM','11:00 AM','12:00 PM','02:00 PM','03:00 PM','04:00 PM','05:00 PM'];
const AC_TYPES = ['Split','Window','Cassette','Portable','Central'];
const AC_BRANDS = ['Dawlance', 'PEL', 'Haier', 'Orient', 'Gree', 'Samsung', 'LG', 'Kenwood', 'Panasonic', 'Mitsubishi', 'Daikin', 'Changhong Ruba', 'TCL', 'Midea', 'EcoStar', 'Electrolux', 'Acson', 'Hitachi', 'Carrier', 'Sharp', 'Toshiba', 'Voltas', 'Hisense', 'General', 'O General', 'Homage', 'Inverex', 'Other'];
const PAY_METHODS = [
  { id:'cash', label:'Cash on Delivery', icon:'💵', desc:'Pay when technician arrives' },
  { id:'jazzcash', label:'JazzCash', icon:'📱', desc:'Mobile payment (sandbox)' },
  { id:'easypaisa', label:'EasyPaisa', icon:'💳', desc:'Mobile payment (sandbox)' },
];

const PAKISTAN_CITIES = ['Abbottabad', 'Attock', 'Awaran', 'Badin', 'Bagh', 'Bahawalnagar', 'Bahawalpur', 'Bajaur', 'Bannu', 'Barkhan', 'Battagram', 'Bhakkar', 'Bhimber', 'Buner', 'Chagai', 'Chakwal', 'Chaman', 'Charsadda', 'Chiniot', 'Chitral', 'Dadu', 'Dera Bugti', 'Dera Ghazi Khan', 'Dera Ismail Khan', 'Dir', 'Faisalabad', 'Ghotki', 'Gilgit', 'Gujranwala', 'Gujrat', 'Gwadar', 'Hafizabad', 'Hangu', 'Haripur', 'Harnai', 'Hyderabad', 'Islamabad', 'Jacobabad', 'Jafarabad', 'Jamshoro', 'Jhal Magsi', 'Jhang', 'Jhelum', 'Kalat', 'Kambar Shahdadkot', 'Karachi', 'Karak', 'Kashmore', 'Kasur', 'Kech', 'Khairpur', 'Khanewal', 'Kharan', 'Khushab', 'Khuzdar', 'Khyber', 'Killa Abdullah', 'Killa Saifullah', 'Kohat', 'Kohistan', 'Kohlu', 'Kotli', 'Kurram', 'Lahore', 'Larkana', 'Lasbela', 'Layyah', 'Lodhran', 'Loralai', 'Malakand', 'Mandi Bahauddin', 'Mansehra', 'Mardan', 'Mastung', 'Matiari', 'Mianwali', 'Mirpur', 'Mirpur Khas', 'Mohmand', 'Multan', 'Musakhel', 'Muzaffarabad', 'Muzaffargarh', 'Nankana Sahib', 'Nasirabad', 'Nawabshah', 'Neelum', 'Nowshera', 'Nushki', 'Okara', 'Orakzai', 'Pakpattan', 'Panjgur', 'Peshawar', 'Pishin', 'Quetta', 'Rahim Yar Khan', 'Rajanpur', 'Rawalakot', 'Rawalpindi', 'Sahiwal', 'Sanghar', 'Sargodha', 'Sherani', 'Shikarpur', 'Sialkot', 'Skardu', 'Sohbatpur', 'South Waziristan', 'Sujawal', 'Sukkur', 'Swabi', 'Swat', 'Tando Allahyar', 'Tando Muhammad Khan', 'Tank', 'Tharparkar', 'Thatta', 'Toba Tek Singh', 'Turbat', 'Umerkot', 'Vehari', 'Washuk', 'Zhob', 'Ziarat'];

const SearchableSelect = ({ value, onChange, options, placeholder }) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const filtered = options.filter(o => o.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="relative">
      <input
        type="text"
        className="input-field cursor-pointer"
        placeholder={placeholder}
        value={open ? search : value}
        onChange={e => { setSearch(e.target.value); setOpen(true); }}
        onFocus={() => { setOpen(true); setSearch(''); }}
        onBlur={() => setTimeout(() => setOpen(false), 200)}
      />
      {open && (
        <div className="absolute z-50 w-full mt-1 bg-[#0a0f1e] border border-white/10 rounded-xl shadow-xl max-h-60 overflow-y-auto">
          {filtered.map(opt => (
            <div
              key={opt}
              onClick={() => { onChange(opt); setSearch(''); setOpen(false); }}
              className="px-4 py-2 hover:bg-[#00d4ff]/10 cursor-pointer text-white text-sm"
            >
              {opt}
            </div>
          ))}
          {filtered.length === 0 && <div className="px-4 py-2 text-white/40 text-sm">No cities found</div>}
        </div>
      )}
    </div>
  );
};

const MapEvents = ({ onCenterChanged }) => {
  const map = useMap();
  useEffect(() => {
    const handleMove = () => {
      const center = map.getCenter();
      onCenterChanged([center.lat, center.lng]);
    };
    map.on('moveend', handleMove);
    return () => map.off('moveend', handleMove);
  }, [map, onCenterChanged]);
  return null;
};

const MapUpdater = ({ center }) => {
  const map = useMap();
  useEffect(() => {
    map.flyTo(center, map.getZoom());
  }, [center, map]);
  return null;
};

const LocationPickerModal = ({ open, onClose, onConfirm, initialCenter, geoPermission, onRetryGeolocation }) => {
  const [center, setCenter] = useState(initialCenter || [30.3753, 69.3451]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (initialCenter) setCenter(initialCenter);
  }, [initialCenter]);

  if (!open) return null;

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery) return;
    const tId = toast.loading('Searching...');
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}`);
      const data = await res.json();
      toast.dismiss(tId);
      if (data && data.length > 0) {
        setCenter([parseFloat(data[0].lat), parseFloat(data[0].lon)]);
      } else {
        toast.error('Location not found');
      }
    } catch (err) {
      toast.dismiss(tId);
      toast.error('Search failed');
    }
  };

  const locateMe = () => {
    if (!navigator.geolocation) return;
    const tId = toast.loading('Locating...');
    navigator.geolocation.getCurrentPosition(
      pos => {
        toast.dismiss(tId);
        setCenter([pos.coords.latitude, pos.coords.longitude]);
      },
      async (err) => {
        toast.dismiss(tId);
        // Better error messages depending on the error code
        if (err.code === 1) {
          toast.error('Location permission denied — allow location access in your browser');
        } else if (err.code === 2) {
          toast.error('Position unavailable — try again or pick manually');
        } else if (err.code === 3) {
          toast.error('Location request timed out — trying a fallback');
        } else {
          toast.error('Could not get precise location');
        }

        // Fallback: try IP-based geolocation for an approximate location
        try {
          const r = await fetch('https://ipapi.co/json/');
          const j = await r.json();
          if (j && j.latitude && j.longitude) {
            setCenter([parseFloat(j.latitude), parseFloat(j.longitude)]);
            toast.success('Approximate location found (IP-based). Move the pin to refine.');
            return;
          }
        } catch (e) {
          // ignore fallback errors
        }

        // final fallback: open modal so user can pick
        setCenter([30.3753, 69.3451]);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-[#0a0f1e] border border-white/10 rounded-2xl w-full max-w-lg flex flex-col h-[80vh] shadow-2xl overflow-hidden">
        <div className="p-4 border-b border-white/10 flex flex-col gap-3 bg-white/5">
          <div className="flex justify-between items-center">
            <h3 className="text-white font-bold font-display">📍 Pin Exact Location</h3>
            <button onClick={onClose} className="text-white/60 hover:text-white text-xl">✕</button>
          </div>
          {geoPermission === 'denied' && (
            <div className="bg-[#ffeef0] rounded-md p-3 text-sm text-[#881337] border border-[#ffd1da]">
              <div className="flex items-start justify-between">
                <div>
                  <div className="font-semibold">Location access blocked</div>
                  <div className="mt-1 text-xs text-[#6b2430]">Your browser is blocking location access for this site. Allow location in your browser settings, then click Retry.</div>
                  <div className="mt-2 text-xs text-[#475569]">Chrome: Settings → Privacy and security → Site Settings → Location → allow for this site.</div>
                </div>
                <div className="flex flex-col gap-2 ml-4">
                  <button onClick={onRetryGeolocation} className="px-3 py-1 bg-[#0b74ff] text-white rounded-md text-sm">Retry</button>
                  <button onClick={() => window.open('about:preferences', '_blank')} className="px-3 py-1 bg-white/5 text-white rounded-md text-sm">Browser Settings</button>
                </div>
              </div>
            </div>
          )}
          <form onSubmit={handleSearch} className="flex gap-2">
            <input 
              type="text" 
              value={searchQuery} 
              onChange={e => setSearchQuery(e.target.value)} 
              placeholder="Search city or area..." 
              className="flex-1 bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#00d4ff]/50" 
            />
            <button type="submit" className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg text-sm transition-all border border-white/20">Search</button>
            <button type="button" onClick={locateMe} className="bg-[#00d4ff]/10 text-[#00d4ff] hover:bg-[#00d4ff]/20 px-3 py-2 rounded-lg text-sm border border-[#00d4ff]/30 transition-all flex items-center" title="My Location">
              🎯
            </button>
          </form>
        </div>
        <div className="relative flex-1 bg-white/5">
          <MapContainer center={center} zoom={16} style={{ height: '100%', width: '100%' }}>
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            <MapUpdater center={center} />
            <MapEvents onCenterChanged={setCenter} />
          </MapContainer>
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center pb-10 z-[400]">
            <div className="text-4xl filter drop-shadow-xl animate-float">📍</div>
          </div>
        </div>
        <div className="p-4 border-t border-white/10 bg-[#0a0f1e]">
          <p className="text-xs text-white/60 mb-3 text-center">Drag the map to position the pin exactly on your house or building.</p>
          <button onClick={() => onConfirm(center)} className="btn-primary w-full py-3">Confirm Location</button>
        </div>
      </div>
    </div>
  );
};

const BookingPage = () => {
  const { serviceId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({ scheduledDate:'', scheduledTime:'', address: user?.address || '', city:'Karachi', acType:'Split', acBrand:'', acTons:'', paymentMethod:'cash', notes:'' });
  const [showMap, setShowMap] = useState(false);
  const [mapCenter, setMapCenter] = useState([30.3753, 69.3451]);
  const [geoPermission, setGeoPermission] = useState('unknown');
  const u = (k,v) => setForm(p => ({...p, [k]:v}));

  useEffect(() => {
    servicesAPI.getOne(serviceId).then(r => setService(r.data.data)).catch(() => toast.error('Service not found')).finally(() => setLoading(false));
    // check permission status for geolocation
    const updateGeoPermission = async () => {
      try {
        if (navigator.permissions && navigator.permissions.query) {
          const status = await navigator.permissions.query({ name: 'geolocation' });
          setGeoPermission(status.state);
          status.onchange = () => setGeoPermission(status.state);
        }
      } catch (e) {
        // ignore
      }
    };
    updateGeoPermission();
  }, [serviceId]);

  const minDate = () => { const d = new Date(); d.setDate(d.getDate()+1); return d.toISOString().split('T')[0]; };

  const openMapWithCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported');
      setShowMap(true);
      return;
    }
    const tId = toast.loading('Locating you...');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        toast.dismiss(tId);
        setMapCenter([pos.coords.latitude, pos.coords.longitude]);
        setShowMap(true);
      },
      async (err) => {
        toast.dismiss(tId);
        if (err.code === 1) {
          toast.error('Location permission denied — allow access and try again');
        } else if (err.code === 2) {
          toast.error('Position unavailable — pick location manually');
        } else if (err.code === 3) {
          toast.error('Location request timed out — using approximate location');
        } else {
          toast.error('Could not get exact location, pick manually.');
        }

        // Try IP fallback
        try {
          const r = await fetch('https://ipapi.co/json/');
          const j = await r.json();
          if (j && j.latitude && j.longitude) {
            setMapCenter([parseFloat(j.latitude), parseFloat(j.longitude)]);
            setShowMap(true);
            toast.success('Approximate location loaded (IP-based).');
            return;
          }
        } catch (e) {
          // ignore
        }

        setShowMap(true);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );
  };

  const retryGeolocation = async () => {
    if (!navigator.geolocation) return toast.error('Geolocation is not supported');
    const tId = toast.loading('Retrying location...');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        toast.dismiss(tId);
        setMapCenter([pos.coords.latitude, pos.coords.longitude]);
        setShowMap(true);
        toast.success('Location found');
      },
      (err) => {
        toast.dismiss(tId);
        if (err.code === 1) toast.error('Permission still denied — open browser settings to allow location for this site');
        else toast.error('Could not get location');
      },
      { enableHighAccuracy: true, timeout: 15000 }
    );
  };

  const handleConfirmMapLocation = async (centerPos) => {
    setShowMap(false);
    const [latitude, longitude] = centerPos;
    const url = `https://maps.google.com/?q=${latitude},${longitude}`;
    const tId = toast.loading('Fetching address...');
    
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
      const data = await res.json();
      toast.dismiss(tId);
      
      const addressName = data.display_name || 'Unknown Location';
      const locationString = `📍 Pinned Location: ${addressName}\n🗺️ Map: ${url}`;
      
      setForm(prev => {
        let newAddr = prev.address || '';
        const liveLocIndex = newAddr.indexOf('📍');
        if (liveLocIndex !== -1) newAddr = newAddr.substring(0, liveLocIndex).trim();
        return { ...prev, address: newAddr ? `${newAddr}\n\n${locationString}` : locationString };
      });
      toast.success('Exact location pinned!');
    } catch (err) {
      toast.dismiss(tId);
      const locationString = `📍 Pinned Location: ${url}`;
      setForm(prev => {
        let newAddr = prev.address || '';
        const liveLocIndex = newAddr.indexOf('📍');
        if (liveLocIndex !== -1) newAddr = newAddr.substring(0, liveLocIndex).trim();
        return { ...prev, address: newAddr ? `${newAddr}\n\n${locationString}` : locationString };
      });
      toast.success('Exact location link added!');
    }
  };

  const handleSubmit = async () => {
    if (!form.scheduledDate || !form.scheduledTime || !form.address) { toast.error('Fill all required fields'); return; }
    setSubmitting(true);
    try {
      const res = await bookingsAPI.create({ serviceId, ...form });
      toast.success('Booking confirmed! 🎉');
      navigate(`/booking/${res.data.data._id}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Booking failed');
    } finally { setSubmitting(false); }
  };

  if (loading) return <div className="min-h-screen mesh-bg flex items-center justify-center"><div className="w-8 h-8 border-2 border-[#00d4ff] border-t-transparent rounded-full animate-spin" /></div>;
  if (!service) return <div className="min-h-screen mesh-bg flex items-center justify-center text-white/40">Service not found</div>;

  const steps = ['Schedule', 'AC Details', 'Payment'];

  return (
    <div className="min-h-screen mesh-bg pt-16">
      <Navbar />
      <div className="max-w-5xl mx-auto px-4 py-10">
        <h1 className="font-display text-2xl font-bold text-white mb-2">Book Service</h1>
        <p className="text-white/40 mb-8">Complete your booking in 3 simple steps</p>

        {/* Step indicators */}
        <div className="flex items-center gap-3 mb-8">
          {steps.map((s, i) => (
            <React.Fragment key={s}>
              <div className={`flex items-center gap-2 transition-all ${step > i+1 ? 'opacity-60' : step === i+1 ? '' : 'opacity-30'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${step > i+1 ? 'bg-[#00d4ff]/30 text-[#00d4ff]' : step === i+1 ? 'bg-[#00d4ff] text-[#0a0f1e]' : 'glass-card text-white/40'}`}>
                  {step > i+1 ? '✓' : i+1}
                </div>
                <span className="text-sm font-medium hidden sm:block text-white/70">{s}</span>
              </div>
              {i < steps.length-1 && <div className={`flex-1 h-px ${step > i+1 ? 'bg-[#00d4ff]/40' : 'bg-white/10'}`} />}
            </React.Fragment>
          ))}
        </div>

        <div className="flex flex-col lg:grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            {/* Step 1 - Schedule */}
            {step === 1 && (
              <div className="glass-card p-6 space-y-5">
                <h2 className="font-display font-bold text-white text-lg">📅 Pick a Schedule</h2>
                <div>
                  <label className="block text-sm text-white/60 mb-1.5">Date *</label>
                  <input type="date" value={form.scheduledDate} min={minDate()} onChange={e => u('scheduledDate', e.target.value)} className="input-field" required />
                </div>
                <div>
                  <label className="block text-sm text-white/60 mb-2">Time Slot *</label>
                  <div className="grid grid-cols-4 gap-2">
                    {SLOTS.map(slot => (
                      <button key={slot} type="button" onClick={() => u('scheduledTime', slot)}
                        className={`py-2 text-xs rounded-xl border transition-all font-medium ${form.scheduledTime === slot ? 'border-[#00d4ff] bg-[#00d4ff]/10 text-[#00d4ff]' : 'border-white/10 text-white/50 hover:border-white/30 hover:text-white'}`}>
                        {slot}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm text-white/60 mb-1.5">Service Address *</label>
                  <textarea value={form.address} onChange={e => u('address', e.target.value)} rows={2} className="input-field resize-none" placeholder="Full address for service" required />
                </div>
                <div>
                  <label className="block text-sm text-white/60 mb-1.5">City</label>
                  <SearchableSelect 
                    value={form.city} 
                    onChange={v => u('city', v)} 
                    options={PAKISTAN_CITIES} 
                    placeholder="Search city..." 
                  />
                </div>
                <button type="button" onClick={openMapWithCurrentLocation} className="btn-ghost w-full py-3 text-[#00d4ff] border-dashed border-[#00d4ff]/40 hover:bg-[#00d4ff]/10">
                  📍 Pin Exact Location on Map
                </button>
                <button onClick={() => { if (!form.scheduledDate || !form.scheduledTime || !form.address) { toast.error('Fill required fields'); return; } setStep(2); }} className="btn-primary w-full py-3">
                  Continue →
                </button>
              </div>
            )}

            {/* Step 2 - AC Details */}
            {step === 2 && (
              <div className="glass-card p-6 space-y-5">
                <h2 className="font-display font-bold text-white text-lg">🌡️ AC Details</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-white/60 mb-1.5">AC Type</label>
                    <select value={form.acType} onChange={e => u('acType', e.target.value)} className="input-field">
                      {AC_TYPES.map(t => <option key={t}>{t}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm text-white/60 mb-1.5">Brand</label>
                    <select value={form.acBrand} onChange={e => u('acBrand', e.target.value)} className="input-field">
                      <option value="">Select brand</option>
                      {AC_BRANDS.map(b => <option key={b}>{b}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm text-white/60 mb-1.5">Capacity</label>
                    <select value={form.acTons} onChange={e => u('acTons', e.target.value)} className="input-field">
                      <option value="">Select tonnage</option>
                      {['0.75','1','1.5','2','2.5','3'].map(t => <option key={t} value={t}>{t} Ton</option>)}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm text-white/60 mb-1.5">Additional Notes</label>
                  <textarea value={form.notes} onChange={e => u('notes', e.target.value)} rows={3} className="input-field resize-none" placeholder="Describe the issue or special instructions..." />
                </div>
                <div className="flex gap-3">
                  <button onClick={() => setStep(1)} className="btn-ghost flex-1">← Back</button>
                  <button onClick={() => setStep(3)} className="btn-primary flex-1">Continue →</button>
                </div>
              </div>
            )}

            {/* Step 3 - Payment */}
            {step === 3 && (
              <div className="glass-card p-6 space-y-4">
                <h2 className="font-display font-bold text-white text-lg">💳 Payment Method</h2>
                {PAY_METHODS.map(m => (
                  <label key={m.id} className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${form.paymentMethod === m.id ? 'border-[#00d4ff] bg-[#00d4ff]/5' : 'border-white/10 hover:border-white/20'}`}>
                    <input type="radio" name="pay" value={m.id} checked={form.paymentMethod === m.id} onChange={e => u('paymentMethod', e.target.value)} className="hidden" />
                    <span className="text-2xl">{m.icon}</span>
                    <div className="flex-1">
                      <p className="font-medium text-white">{m.label}</p>
                      <p className="text-xs text-white/40">{m.desc}</p>
                    </div>
                    {form.paymentMethod === m.id && <span className="text-[#00d4ff] text-lg">✓</span>}
                  </label>
                ))}
                <div className="flex gap-3 pt-2">
                  <button onClick={() => setStep(2)} className="btn-ghost flex-1">← Back</button>
                  <button onClick={handleSubmit} disabled={submitting} className="btn-primary flex-1 py-3">
                    {submitting ? <><div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" /> Booking...</> : '✓ Confirm Booking'}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Summary */}
          <div className="lg:col-span-1 order-first lg:order-last">
            <div className="glass-card p-5 sticky top-24">
              <h3 className="font-display font-semibold text-white mb-4">Summary</h3>
              <div className="p-3 bg-[#00d4ff]/5 border border-[#00d4ff]/20 rounded-xl mb-4">
                <p className="font-bold text-white">{service.name}</p>
                <p className="text-xs text-[#00d4ff] mt-0.5">{service.category} · {service.duration} min</p>
              </div>
              <div className="space-y-2.5 text-sm">
                {form.scheduledDate && <div className="flex justify-between"><span className="text-white/40">Date</span><span className="text-white font-medium">{new Date(form.scheduledDate).toLocaleDateString('en-PK',{dateStyle:'medium'})}</span></div>}
                {form.scheduledTime && <div className="flex justify-between"><span className="text-white/40">Time</span><span className="text-white font-medium">{form.scheduledTime}</span></div>}
                {form.acType && <div className="flex justify-between"><span className="text-white/40">AC Type</span><span className="text-white font-medium">{form.acType}</span></div>}
                {form.paymentMethod && <div className="flex justify-between"><span className="text-white/40">Payment</span><span className="text-white font-medium capitalize">{form.paymentMethod}</span></div>}
              </div>
              <div className="border-t border-white/10 mt-4 pt-4 flex justify-between items-center">
                <span className="text-white/60 font-medium">Total</span>
                <span className="font-display text-2xl font-bold text-[#00d4ff]">Rs. {service.price?.toLocaleString()}</span>
              </div>
              <p className="text-xs text-white/20 text-center mt-2">All charges inclusive</p>
            </div>
          </div>
        </div>
      </div>
      <LocationPickerModal 
        open={showMap} 
        onClose={() => setShowMap(false)} 
        onConfirm={handleConfirmMapLocation} 
        initialCenter={mapCenter} 
        geoPermission={geoPermission}
        onRetryGeolocation={retryGeolocation}
      />
    </div>
  );
};

export default BookingPage;
