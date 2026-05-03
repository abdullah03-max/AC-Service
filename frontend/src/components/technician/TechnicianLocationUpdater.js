import React, { useState, useEffect, useCallback } from 'react';
import { techniciansAPI } from '../../services/api';
import toast from 'react-hot-toast';

const TechnicianLocationUpdater = () => {
  const [loading, setLoading] = useState(false);
  const [currentLoc, setCurrentLoc] = useState(null);
  const [autoUpdate, setAutoUpdate] = useState(false);
  const [lastUpdateTime, setLastUpdateTime] = useState(null);

  const getBestCurrentLocation = () => new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation not supported on this device'));
      return;
    }

    let bestPosition = null;
    let watchId = null;

    const finish = () => {
      if (watchId !== null) navigator.geolocation.clearWatch(watchId);

      if (bestPosition) {
        resolve(bestPosition);
      } else {
        reject(new Error('Could not get location'));
      }
    };

    watchId = navigator.geolocation.watchPosition(
      (pos) => {
        if (!bestPosition || pos.coords.accuracy < bestPosition.coords.accuracy) {
          bestPosition = pos;
        }

        if (pos.coords.accuracy <= 30) {
          finish();
        }
      },
      (err) => {
        if (bestPosition) {
          finish();
          return;
        }
        reject(err);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );

    setTimeout(finish, 12000);
  });

  const updateLocation = useCallback(async () => {
    setLoading(true);
    try {
      const pos = await getBestCurrentLocation();
      const { latitude, longitude, accuracy } = pos.coords;

      setCurrentLoc({
        lat: latitude,
        lng: longitude,
        accuracy,
      });

      await techniciansAPI.updateLocation({
        lat: latitude,
        lng: longitude,
      });

      setLastUpdateTime(new Date());

      if (accuracy > 100) {
        toast.error(`Location found, but accuracy is low (${accuracy.toFixed(0)}m). Move to an open area and try again.`);
      } else {
        toast.success('✅ Current location selected and sent to admin.');
      }
    } catch (err) {
      if (err.code === 1) {
        toast.error('Location permission denied. Enable it in browser settings.');
      } else if (err.code === 2) {
        toast.error('Position unavailable. Try again or move to an open area.');
      } else if (err.code === 3) {
        toast.error('Location request timed out. Try again.');
      } else {
        toast.error('Could not get location. Try again.');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  // Auto-update location every 60 seconds if enabled
  useEffect(() => {
    if (!autoUpdate) return;

    // Initial update
    updateLocation();

    const interval = setInterval(updateLocation, 60000);
    return () => clearInterval(interval);
  }, [autoUpdate, updateLocation]);

  const getAccuracyColor = (accuracy) => {
    if (accuracy < 10) return 'text-emerald-400';
    if (accuracy < 50) return 'text-green-400';
    if (accuracy < 100) return 'text-yellow-400';
    return 'text-red-400';
  };

  return (
    <div className="glass-card p-6 rounded-xl border border-white/10">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-bold text-white text-lg">📍 Live Location Tracking</h3>
          <p className="text-xs text-white/50 mt-1">Share your real GPS location with admin for job assignments</p>
        </div>
        <span className={`text-xs px-3 py-1 rounded-full font-medium ${currentLoc ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/20' : 'bg-white/5 text-white/40 border border-white/10'}`}>
          {currentLoc ? '📍 Location Ready' : 'No Location'}
        </span>
      </div>

      {/* Current Location Display */}
      {currentLoc && (
        <div className="p-3 bg-[#00d4ff]/10 border border-[#00d4ff]/20 rounded-lg mb-4">
          <p className="text-white/40 text-xs uppercase tracking-wide mb-2">Current Location</p>
          <div className="space-y-1 text-sm">
            <p className="font-mono text-white">Lat: <span className="text-[#00d4ff] font-bold">{currentLoc.lat.toFixed(6)}</span></p>
            <p className="font-mono text-white">Lng: <span className="text-[#00d4ff] font-bold">{currentLoc.lng.toFixed(6)}</span></p>
            <p className={`text-xs mt-2 ${getAccuracyColor(currentLoc.accuracy)}`}>
              📡 Accuracy: {currentLoc.accuracy.toFixed(1)}m
            </p>
            {lastUpdateTime && (
              <p className="text-white/50 text-xs mt-2">
                Last updated: {lastUpdateTime.toLocaleTimeString()}
              </p>
            )}
          </div>
        </div>
      )}

      <div className="space-y-3">
        <button
          onClick={updateLocation}
          disabled={loading}
          className={`w-full py-3 px-4 rounded-lg font-medium transition-all ${
            loading
              ? 'bg-[#00d4ff]/20 text-[#00d4ff] cursor-not-allowed opacity-60'
              : 'bg-[#00d4ff] text-[#0a0f1e] hover:bg-[#00d4ff]/90 active:scale-95'
          }`}
        >
          {loading ? '🔄 Getting Current Location...' : '🎯 Use Current Location'}
        </button>

        <div className="flex items-center gap-3 p-3 bg-white/5 rounded-lg border border-white/10 hover:bg-white/10 transition-all cursor-pointer">
          <input
            type="checkbox"
            id="autoUpdate"
            checked={autoUpdate}
            onChange={(e) => setAutoUpdate(e.target.checked)}
            className="w-4 h-4 cursor-pointer"
          />
          <label htmlFor="autoUpdate" className="flex-1 text-sm text-white/70 cursor-pointer">
            ✨ Auto-update every 60 seconds
          </label>
        </div>

        {autoUpdate && (
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-xs text-emerald-300 space-y-1">
            <div>✅ Auto-update ENABLED</div>
            <div>Your location will be sent to admin every minute while you're on a job.</div>
          </div>
        )}

        <div className="p-3 bg-[#00d4ff]/10 border border-[#00d4ff]/20 rounded-lg text-xs text-[#00d4ff] space-y-1">
          <div>💡 Pro Tip:</div>
          <ul className="list-disc list-inside space-y-0.5 text-white/70">
            <li>Click "Use Current Location" before taking a job</li>
            <li>Enable "Auto-update" to share live location while traveling</li>
            <li>Admin will see you on their tracking map in real-time</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default TechnicianLocationUpdater;
