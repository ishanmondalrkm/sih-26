import React, { useState } from 'react';
import { MapPin, Navigation, Compass } from 'lucide-react';

export default function MapPicker({ location, onChange }) {
  const [lat, setLat] = useState(location?.latitude || 12.9784);
  const [lng, setLng] = useState(location?.longitude || 77.6408);
  const [address, setAddress] = useState(location?.address || '12th Main Road, Indiranagar');
  const [ward, setWard] = useState(location?.ward || 'Ward 12 - Indiranagar');
  const [isLocating, setIsLocating] = useState(false);

  const predefinedWards = [
    { name: 'Ward 12 - Indiranagar', lat: 12.9784, lng: 77.6408, address: '100 Feet Rd / 12th Main, Indiranagar' },
    { name: 'Ward 15 - Koramangala', lat: 12.9352, lng: 77.6245, address: '80 Feet Rd, 5th Block, Koramangala' },
    { name: 'Ward 08 - Malleshwaram', lat: 13.0031, lng: 77.5643, address: '4th Cross Sampige Rd, Malleshwaram' },
    { name: 'Ward 22 - Whitefield', lat: 12.9698, lng: 77.7500, address: 'ITPL Main Rd, Whitefield' },
    { name: 'Ward 05 - Jayanagar', lat: 12.9308, lng: 77.5838, address: '4th Block Complex, Jayanagar' },
    { name: 'Ward 19 - HSR Layout', lat: 12.9121, lng: 77.6446, address: 'Sector 2, HSR Ring Road' }
  ];

  const handleUseMyLocation = () => {
    setIsLocating(true);
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const newLat = Number(pos.coords.latitude.toFixed(4));
          const newLng = Number(pos.coords.longitude.toFixed(4));
          setLat(newLat);
          setLng(newLng);
          const autoAddress = `GPS Location: Lat ${newLat}, Lng ${newLng}`;
          setAddress(autoAddress);
          setIsLocating(false);
          onChange({
            latitude: newLat,
            longitude: newLng,
            address: autoAddress,
            ward: ward
          });
        },
        () => {
          const fallback = predefinedWards[0];
          setLat(fallback.lat);
          setLng(fallback.lng);
          setAddress(fallback.address);
          setWard(fallback.name);
          setIsLocating(false);
          onChange({
            latitude: fallback.lat,
            longitude: fallback.lng,
            address: fallback.address,
            ward: fallback.name
          });
        },
        { timeout: 5000 }
      );
    } else {
      setIsLocating(false);
    }
  };

  const handleWardSelect = (e) => {
    const selected = predefinedWards.find((w) => w.name === e.target.value);
    if (selected) {
      setWard(selected.name);
      setLat(selected.lat);
      setLng(selected.lng);
      setAddress(selected.address);
      onChange({
        latitude: selected.lat,
        longitude: selected.lng,
        address: selected.address,
        ward: selected.name
      });
    }
  };

  const handleMapClick = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;

    const newLat = Number((13.04 - y * 0.16).toFixed(4));
    const newLng = Number((77.52 + x * 0.25).toFixed(4));
    setLat(newLat);
    setLng(newLng);
    const pinAddress = `Pinned on Map (${newLat}° N, ${newLng}° E)`;
    setAddress(pinAddress);
    onChange({
      latitude: newLat,
      longitude: newLng,
      address: pinAddress,
      ward: ward
    });
  };

  return (
    <div className="space-y-3" data-testid="map-picker-component">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <MapPin className="h-4 w-4 text-blue-600" />
          <span className="text-sm font-semibold text-slate-800">Location Details</span>
        </div>
        <button
          type="button"
          onClick={handleUseMyLocation}
          disabled={isLocating}
          data-testid="use-current-location-btn"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-colors"
        >
          <Navigation className={`h-3.5 w-3.5 ${isLocating ? 'animate-spin' : ''}`} />
          {isLocating ? 'Detecting GPS...' : 'Use My Current Location'}
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">Select Municipal Ward</label>
          <select
            value={ward}
            onChange={handleWardSelect}
            data-testid="ward-selector-dropdown"
            className="w-full text-xs bg-white border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {predefinedWards.map((w) => (
              <option key={w.name} value={w.name}>
                {w.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">Street / Landmark Address</label>
          <input
            type="text"
            value={address}
            onChange={(e) => {
              setAddress(e.target.value);
              onChange({ latitude: lat, longitude: lng, address: e.target.value, ward });
            }}
            placeholder="e.g. Near Community Center, 2nd Cross"
            data-testid="street-address-input"
            className="w-full text-xs bg-white border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div
        onClick={handleMapClick}
        data-testid="interactive-map-canvas"
        className="relative w-full h-40 bg-slate-100 border border-slate-200 rounded-xl overflow-hidden cursor-crosshair shadow-inner group"
        style={{
          backgroundImage: 'radial-gradient(#cbd5e1 1.2px, transparent 1.2px), radial-gradient(#e2e8f0 1.2px, #f8fafc 1.2px)',
          backgroundSize: '24px 24px',
          backgroundPosition: '0 0, 12px 12px'
        }}
      >
        <div className="absolute inset-0 opacity-20 pointer-events-none">
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <line x1="10%" y1="0" x2="10%" y2="100%" stroke="#2563EB" strokeWidth="2" strokeDasharray="4 4" />
            <line x1="50%" y1="0" x2="50%" y2="100%" stroke="#64748B" strokeWidth="3" />
            <line x1="85%" y1="0" x2="85%" y2="100%" stroke="#2563EB" strokeWidth="2" strokeDasharray="4 4" />
            <line x1="0" y1="35%" x2="100%" y2="35%" stroke="#64748B" strokeWidth="3" />
            <line x1="0" y1="75%" x2="100%" y2="75%" stroke="#2563EB" strokeWidth="2" />
          </svg>
        </div>

        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="flex flex-col items-center animate-bounce">
            <div className="bg-red-600 text-white p-2 rounded-full shadow-lg border-2 border-white">
              <MapPin className="h-4 w-4" />
            </div>
            <div className="w-2.5 h-1 bg-black/30 rounded-full mt-0.5 filter blur-[0.5px]"></div>
          </div>
        </div>

        <div className="absolute bottom-2 left-2 bg-white/90 backdrop-blur-sm border border-slate-200/80 px-2.5 py-1 rounded-md text-[11px] font-mono text-slate-700 shadow-sm flex items-center gap-1.5">
          <Compass className="h-3 w-3 text-blue-600" />
          <span>Lat: {lat} | Lng: {lng}</span>
        </div>

        <div className="absolute top-2 right-2 bg-blue-600 text-white text-[10px] font-medium px-2 py-0.5 rounded shadow-sm opacity-90 group-hover:opacity-100 transition-opacity">
          Click anywhere to drop pin
        </div>
      </div>
    </div>
  );
}