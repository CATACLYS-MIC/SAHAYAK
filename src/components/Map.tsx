import React, { useEffect } from 'react';
import { MapContainer, Circle, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { cn } from '../lib/utils';
import { useAppState } from '../lib/store';
import { useTheme } from '../lib/theme';
import { getMapTileConfig } from '../lib/mapTiles';
import { ReliableTileLayer } from './ReliableTileLayer';

// Fix for default marker icon in react-leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface BaseMapProps {
  className?: string;
  children?: React.ReactNode;
  center?: [number, number];
  zoom?: number;
  showGalliBadge?: boolean;
}

function MapUpdater({ center, zoom }: { center: [number, number]; zoom?: number }) {
  const map = useMap();
  useEffect(() => {
    map.invalidateSize();
    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 150);
    map.setView(center, zoom ?? map.getZoom());
    return () => clearTimeout(timer);
  }, [center, zoom, map]);
  return null;
}

export function BaseMap({ className, children, center: customCenter, zoom = 11, showGalliBadge = true }: BaseMapProps) {
  const { currentLocation } = useAppState();
  const { theme } = useTheme();
  
  // Default to Nepal (Kathmandu) or custom passed center
  const defaultCenter: [number, number] = [27.7172, 85.3240];
  const center: [number, number] = customCenter 
    ? customCenter
    : currentLocation?.lat && currentLocation?.lng 
      ? [currentLocation.lat, currentLocation.lng] 
      : defaultCenter;

  const tileConfig = getMapTileConfig(theme);

  return (
    <div className={cn("w-full h-full min-h-[300px] relative overflow-hidden", className)}>
      <MapContainer 
        center={center} 
        zoom={zoom} 
        scrollWheelZoom={true} 
        style={{ height: '100%', width: '100%', position: 'absolute', inset: 0 }}
      >
        <ReliableTileLayer tileConfig={tileConfig} theme={theme} />
        <MapUpdater center={center} zoom={zoom} />
        
        {/* Draw a subtle circle around the current region */}
        {currentLocation?.lat && currentLocation?.lng && (
           <Circle 
             center={[currentLocation.lat, currentLocation.lng]}
             radius={15000} // 15km radius
             pathOptions={{ 
               color: theme === 'dark' ? '#3b82f6' : '#2563eb', 
               fillColor: theme === 'dark' ? '#3b82f6' : '#2563eb', 
               fillOpacity: 0.05,
               weight: 2,
               dashArray: '5, 10'
             }}
           />
        )}
        
        {children}
      </MapContainer>

      {/* Official Galli Maps Nepal Live Indicator Overlay */}
      {showGalliBadge && (
        <div className="absolute top-2.5 right-2.5 z-[400] pointer-events-none flex items-center gap-1.5 px-2.5 py-1 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md rounded-md border border-slate-200/90 dark:border-slate-800/90 shadow-xs text-[11px] font-semibold text-slate-700 dark:text-slate-200">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>Galli Maps Nepal</span>
        </div>
      )}
    </div>
  );
}
