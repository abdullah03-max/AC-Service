import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { techniciansAPI } from '../../services/api';
import toast from 'react-hot-toast';

// Fix Leaflet marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const StatusIcon = (status) => {
  const iconMap = {
    available: '🟢',
    on_job: '🔵',
    offline: '⚪',
    break: '🟡',
  };
  return iconMap[status] || '⚪';
};

const TechnicianDetailModal = ({ tech, onClose }) => {
  if (!tech) return null;

  const lat = Number(tech.currentLocation?.lat);
  const lng = Number(tech.currentLocation?.lng);
  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
  const lastUpdated = tech.currentLocation?.lastUpdated ? new Date(tech.currentLocation.lastUpdated).toLocaleTimeString() : 'N/A';
  const lastUpdatedDate = tech.currentLocation?.lastUpdated ? new Date(tech.currentLocation.lastUpdated).toLocaleDateString() : 'N/A';

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-[#0a0f1e] border border-white/10 rounded-2xl w-full max-w-lg shadow-2xl">
        <div className="p-6 border-b border-white/10">
          <div className="flex items-start justify-between mb-3">
            <div>
              <h2 className="font-display font-bold text-xl text-white">{tech.user.name}</h2>
              <p className="text-sm text-white/40 mt-1">{tech.employeeId}</p>
            </div>
            <button onClick={onClose} className="text-white/60 hover:text-white text-2xl">✕</button>
          </div>
        </div>

        <div className="p-6 space-y-4">
          {/* Status */}
          <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
            <span className="text-white/60 text-sm">Status</span>
            <span className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${
              tech.currentStatus === 'on_job' ? 'bg-blue-500/20 text-blue-400' :
              tech.currentStatus === 'available' ? 'bg-emerald-500/20 text-emerald-400' :
              tech.currentStatus === 'break' ? 'bg-amber-500/20 text-amber-400' :
              'bg-white/5 text-white/50'
            }`}>
              {StatusIcon(tech.currentStatus)} {tech.currentStatus}
            </span>
          </div>

          {/* Contact */}
          <div className="p-3 bg-white/5 rounded-lg space-y-1">
            <p className="text-white/40 text-xs uppercase tracking-wide mb-2">Contact</p>
            <p className="text-white text-sm">✉️ {tech.user.email}</p>
            <p className="text-white text-sm">📞 {tech.user.phone}</p>
          </div>

          {/* Location Details */}
          <div className="p-3 bg-[#00d4ff]/10 border border-[#00d4ff]/20 rounded-lg">
            <p className="text-white/40 text-xs uppercase tracking-wide mb-2">📍 Real Location</p>
            <div className="space-y-1 text-sm">
              <p className="font-mono text-white">Latitude: <span className="text-[#00d4ff] font-bold">{lat.toFixed(6)}</span></p>
              <p className="font-mono text-white">Longitude: <span className="text-[#00d4ff] font-bold">{lng.toFixed(6)}</span></p>
              <p className="text-white/50 text-xs mt-2">Last updated: {lastUpdated} ({lastUpdatedDate})</p>
            </div>
          </div>

          {/* Rating */}
          <div className="p-3 bg-white/5 rounded-lg">
            <p className="text-white/60 text-sm">⭐ Rating: <span className="text-white font-bold">{tech.rating.toFixed(1)}/5</span></p>
          </div>

          {/* Action buttons */}
          <div className="flex gap-3 pt-2">
            <a href={googleMapsUrl} target="_blank" rel="noopener noreferrer" className="flex-1 btn-primary text-center py-3">
              📍 Open in Google Maps
            </a>
            <button onClick={onClose} className="flex-1 btn-ghost py-3">
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const TechnicianLiveMap = () => {
  const [technicians, setTechnicians] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTech, setSelectedTech] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    const loadTechnicians = async () => {
      try {
        const res = await techniciansAPI.getLiveTracking();
        setTechnicians(res.data.data || []);
      } catch (err) {
        toast.error('Failed to load technician locations');
      } finally {
        setLoading(false);
      }
    };

    loadTechnicians();

    // Refresh every 10 seconds for real-time updates
    const interval = setInterval(loadTechnicians, 10000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!selectedTech) return;
    const refreshedTech = technicians.find(t => t._id === selectedTech._id);
    if (refreshedTech && refreshedTech !== selectedTech) {
      setSelectedTech(refreshedTech);
    }
  }, [technicians, selectedTech]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="w-12 h-12 border-3 border-[#00d4ff] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-white/60">Loading technician locations...</p>
        </div>
      </div>
    );
  }

  const filteredTechs = filterStatus === 'all' 
    ? technicians 
    : technicians.filter(t => t.currentStatus === filterStatus);

  const center = filteredTechs.length > 0
    ? [Number(filteredTechs[0].currentLocation.lat), Number(filteredTechs[0].currentLocation.lng)]
    : [24.8607, 67.0011];

  return (
    <div className="space-y-4">
      {/* Filter & Stats */}
      <div className="glass-card p-4 rounded-xl">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-white font-bold">📍 Live Technician Tracking</h3>
          <span className="text-xs bg-[#00d4ff]/20 text-[#00d4ff] px-2 py-1 rounded-full">
            {filteredTechs.length} technician{filteredTechs.length !== 1 ? 's' : ''}
          </span>
        </div>

        {/* Filter buttons */}
        <div className="flex gap-2 flex-wrap">
          {[
            { id: 'all', label: 'All', icon: '📍' },
            { id: 'on_job', label: 'On Job', icon: '🔵' },
            { id: 'available', label: 'Available', icon: '🟢' },
            { id: 'break', label: 'Break', icon: '🟡' },
            { id: 'offline', label: 'Offline', icon: '⚪' },
          ].map(f => (
            <button
              key={f.id}
              onClick={() => setFilterStatus(f.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                filterStatus === f.id
                  ? 'bg-[#00d4ff] text-[#0a0f1e]'
                  : 'bg-white/5 text-white/60 hover:bg-white/10'
              }`}
            >
              {f.icon} {f.label}
            </button>
          ))}
        </div>

        {/* Status breakdown */}
        <div className="grid grid-cols-4 gap-3 text-sm mt-3">
          <div className="flex items-center gap-2">
            <span>🔵</span>
            <span className="text-white/70">On Job: {technicians.filter(t => t.currentStatus === 'on_job').length}</span>
          </div>
          <div className="flex items-center gap-2">
            <span>🟢</span>
            <span className="text-white/70">Available: {technicians.filter(t => t.currentStatus === 'available').length}</span>
          </div>
          <div className="flex items-center gap-2">
            <span>🟡</span>
            <span className="text-white/70">Break: {technicians.filter(t => t.currentStatus === 'break').length}</span>
          </div>
          <div className="flex items-center gap-2">
            <span>⚪</span>
            <span className="text-white/70">Offline: {technicians.filter(t => t.currentStatus === 'offline').length}</span>
          </div>
        </div>
      </div>

      {/* Map */}
      <div className="glass-card rounded-xl overflow-hidden" style={{ height: '500px' }}>
        {filteredTechs.length > 0 ? (
          <MapContainer center={center} zoom={14} style={{ height: '100%', width: '100%' }}>
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            {filteredTechs.map((tech) => (
              <Marker
                key={tech._id}
                position={[Number(tech.currentLocation.lat), Number(tech.currentLocation.lng)]}
                eventHandlers={{
                  click: () => setSelectedTech(tech),
                }}
              >
                <Popup>
                  <div className="text-sm">
                    <div className="font-bold text-[#0a0f1e]">{tech.user.name}</div>
                    <div className="text-xs text-gray-600">ID: {tech.employeeId}</div>
                    <div className="text-xs text-gray-600">Status: {tech.currentStatus}</div>
                    <div className="text-xs text-gray-600">⭐ {tech.rating.toFixed(1)}</div>
                    <button
                      onClick={() => setSelectedTech(tech)}
                      className="mt-2 text-xs bg-blue-500 text-white px-2 py-1 rounded"
                    >
                      View Details
                    </button>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        ) : (
          <div className="h-full flex items-center justify-center bg-white/5">
            <p className="text-white/40">No technicians with selected status</p>
          </div>
        )}
      </div>

      {/* Technician List */}
      <div className="glass-card p-4 rounded-xl">
        <h4 className="text-white font-bold mb-3">Technicians ({filteredTechs.length})</h4>
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {filteredTechs.map((tech) => (
            <div
              key={tech._id}
              onClick={() => setSelectedTech(tech)}
              className="flex items-center justify-between p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-all cursor-pointer"
            >
              <div className="flex items-center gap-3 flex-1">
                <span className="text-lg">{StatusIcon(tech.currentStatus)}</span>
                <div className="flex-1 min-w-0">
                  <div className="text-white font-medium truncate">{tech.user.name}</div>
                  <div className="text-xs text-white/40">{tech.employeeId} • ⭐ {tech.rating.toFixed(1)}</div>
                </div>
              </div>
              <div className="text-xs text-white/60 text-right ml-2">
                <div className="font-mono">{Number(tech.currentLocation.lat).toFixed(4)}</div>
                <div className="font-mono">{Number(tech.currentLocation.lng).toFixed(4)}</div>
              </div>
            </div>
          ))}
          {filteredTechs.length === 0 && (
            <div className="text-center py-8 text-white/40">No technicians online</div>
          )}
        </div>
      </div>

      {/* Detail Modal */}
      <TechnicianDetailModal tech={selectedTech} onClose={() => setSelectedTech(null)} />
    </div>
  );
};

export default TechnicianLiveMap;
