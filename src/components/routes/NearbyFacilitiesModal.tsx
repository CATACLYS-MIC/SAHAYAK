import React, { useState, useMemo } from 'react';
import { Card, Badge, Button } from '@/components/ui';
import { 
  Building2, Home, MapPin, Phone, Search, X, 
  Navigation, ShieldCheck, AlertCircle, Bed, Activity
} from 'lucide-react';
import { HospitalWithDistance, ShelterWithDistance } from '@/data/emergencyFacilities';

interface NearbyFacilitiesModalProps {
  isOpen: boolean;
  onClose: () => void;
  hospitals: HospitalWithDistance[];
  shelters: ShelterWithDistance[];
  originName: string;
  onSelectFacility: (facility: {
    id: string;
    name: string;
    type: 'Hospital' | 'Shelter';
    lat: number;
    lng: number;
    address: string;
    distanceKm: number;
    availableSpotsOrBeds: number;
    totalCapacityOrBeds: number;
    contact: string;
  }) => void;
}

export function NearbyFacilitiesModal({
  isOpen,
  onClose,
  hospitals,
  shelters,
  originName,
  onSelectFacility
}: NearbyFacilitiesModalProps) {
  const [activeTab, setActiveTab] = useState<'all' | 'hospitals' | 'shelters'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Merge and normalize all facilities
  const allFacilities = useMemo(() => {
    const hospItems = hospitals.map(h => ({
      id: h.id,
      name: h.name,
      type: 'Hospital' as const,
      lat: h.lat,
      lng: h.lng,
      address: h.address,
      district: h.district,
      distanceKm: h.distanceKm,
      availableSpotsOrBeds: h.availableBeds,
      totalCapacityOrBeds: h.totalBeds,
      contact: h.contact,
      status: h.status,
      extraInfo: h.traumaCenter ? 'Trauma Center Hub' : h.type
    }));

    const shelterItems = shelters.map(s => ({
      id: s.id,
      name: s.name,
      type: 'Shelter' as const,
      lat: s.lat,
      lng: s.lng,
      address: s.address,
      district: s.district,
      distanceKm: s.distanceKm,
      availableSpotsOrBeds: s.availableSpots,
      totalCapacityOrBeds: s.capacity,
      contact: s.contact,
      status: s.status,
      extraInfo: s.services?.join(', ') || s.type
    }));

    const combined = [...hospItems, ...shelterItems];
    return combined.sort((a, b) => a.distanceKm - b.distanceKm);
  }, [hospitals, shelters]);

  // Filter based on active tab and search query
  const filteredFacilities = useMemo(() => {
    return allFacilities.filter(f => {
      const matchesTab = 
        activeTab === 'all' || 
        (activeTab === 'hospitals' && f.type === 'Hospital') || 
        (activeTab === 'shelters' && f.type === 'Shelter');

      const matchesSearch = 
        !searchQuery.trim() ||
        f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        f.district.toLowerCase().includes(searchQuery.toLowerCase()) ||
        f.address.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesTab && matchesSearch;
    });
  }, [allFacilities, activeTab, searchQuery]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in">
      <div 
        className="relative w-full max-w-2xl max-h-[90vh] bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3 shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
                <Building2 className="w-5 h-5" />
              </span>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100">
                Emergency Facilities in Area
              </h2>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Sorted by nearest distance from <span className="font-semibold text-slate-700 dark:text-slate-200">{originName}</span>. Direct safest route will bypass any blocked roads.
            </p>
          </div>

          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search & Tabs */}
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 space-y-3 shrink-0">
          {/* Search bar */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              type="text"
              placeholder="Search by facility name, district, or address..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-800 dark:text-slate-200 placeholder-slate-400"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xs"
              >
                Clear
              </button>
            )}
          </div>

          {/* Filter Tabs */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                activeTab === 'all'
                  ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900'
                  : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100'
              }`}
            >
              <span>All Facilities</span>
              <span className="px-1.5 py-0.2 bg-slate-700 text-white dark:bg-slate-300 dark:text-slate-900 rounded-full text-[10px]">
                {allFacilities.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('hospitals')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                activeTab === 'hospitals'
                  ? 'bg-red-600 text-white'
                  : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100'
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>Hospitals</span>
              <span className="px-1.5 py-0.2 bg-red-800 text-white rounded-full text-[10px]">
                {hospitals.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('shelters')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                activeTab === 'shelters'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100'
              }`}
            >
              <Home className="w-3.5 h-3.5" />
              <span>Emergency Shelters</span>
              <span className="px-1.5 py-0.2 bg-blue-800 text-white rounded-full text-[10px]">
                {shelters.length}
              </span>
            </button>
          </div>
        </div>

        {/* Facilities List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2.5 divide-y divide-slate-100 dark:divide-slate-800">
          {filteredFacilities.length === 0 ? (
            <div className="text-center py-10 text-slate-500 dark:text-slate-400 text-xs">
              No emergency facilities match your search query.
            </div>
          ) : (
            filteredFacilities.map((facility, idx) => {
              const isHosp = facility.type === 'Hospital';
              const isNearest = idx === 0 && !searchQuery;

              return (
                <div 
                  key={`facility-${facility.id}-${idx}`}
                  className="pt-2.5 first:pt-0 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50 dark:hover:bg-slate-800/40 p-2.5 rounded-xl transition-colors"
                >
                  <div className="flex items-start gap-3 min-w-0 flex-1">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 shadow-xs ${
                      isHosp 
                        ? 'bg-red-50 dark:bg-red-950/60 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900/60' 
                        : 'bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-900/60'
                    }`}>
                      {isHosp ? <Building2 className="w-5 h-5" /> : <Home className="w-5 h-5" />}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-bold text-xs sm:text-sm text-slate-900 dark:text-slate-100">
                          {facility.name}
                        </span>

                        {isNearest && (
                          <span className="px-1.5 py-0.5 rounded-md bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-extrabold text-[10px] tracking-wide uppercase border border-emerald-300 dark:border-emerald-800">
                            Nearest
                          </span>
                        )}

                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                          facility.status === 'Operational'
                            ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                            : 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300'
                        }`}>
                          {facility.status}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400 mt-1 flex-wrap">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-slate-400" />
                          <span>{facility.address}</span>
                        </span>
                        <span>•</span>
                        <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                          {facility.distanceKm} km away
                        </span>
                        {facility.contact && (
                          <>
                            <span>•</span>
                            <a 
                              href={`tel:${facility.contact.split(' ')[0]}`}
                              className="text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
                              onClick={e => e.stopPropagation()}
                            >
                              <Phone className="w-2.5 h-2.5" />
                              <span>{facility.contact}</span>
                            </a>
                          </>
                        )}
                      </div>

                      <div className="mt-1.5 flex items-center gap-2 flex-wrap">
                        {isHosp ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800">
                            <Bed className="w-3 h-3" />
                            <strong>{facility.availableSpotsOrBeds}</strong> free beds ({facility.totalCapacityOrBeds} total)
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/50 px-2 py-0.5 rounded border border-blue-200 dark:border-blue-800">
                            <Activity className="w-3 h-3" />
                            <strong>{facility.availableSpotsOrBeds}</strong> available capacity of {facility.totalCapacityOrBeds}
                          </span>
                        )}

                        {facility.extraInfo && (
                          <span className="text-[10px] text-slate-400">
                            {facility.extraInfo}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                    <Button
                      size="sm"
                      onClick={() => {
                        onSelectFacility({
                          id: facility.id,
                          name: facility.name,
                          type: facility.type,
                          lat: facility.lat,
                          lng: facility.lng,
                          address: facility.address,
                          distanceKm: facility.distanceKm,
                          availableSpotsOrBeds: facility.availableSpotsOrBeds,
                          totalCapacityOrBeds: facility.totalCapacityOrBeds,
                          contact: facility.contact
                        });
                        onClose();
                      }}
                      className="h-8 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs gap-1.5 shadow-xs"
                    >
                      <Navigation className="w-3 h-3" />
                      <span>Route Here (Safest Path)</span>
                    </Button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-50 dark:bg-slate-900/80 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-500">
          <span>Showing {filteredFacilities.length} operational facilities</span>
          <Button variant="ghost" size="sm" onClick={onClose} className="h-7 text-xs">
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}
