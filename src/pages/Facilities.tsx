import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Badge, Button, BaseMap } from '@/components/ui';
import { 
  Phone, Bed, Map as MapIcon, List, LayoutGrid, Search, Filter, 
  Stethoscope, RefreshCw, ExternalLink, ShieldCheck, AlertTriangle, 
  Clock, MapPin, Building2, ChevronRight, Activity, ArrowRight
} from 'lucide-react';
import { useAppState } from '@/lib/store';
import { getOccupancyColor, calculateDistanceKm } from '@/lib/calculations';
import { cn } from '@/lib/utils';
import { Marker, Popup, Circle } from 'react-leaflet';
import L from 'leaflet';
import { GovernmentHospital, Facility } from '@/types';
import { HospitalDetailModal } from '@/components/HospitalDetailModal';

// Create colored marker icons according to occupancy status
const createOccupancyMarkerIcon = (occupancyStatus: 'LOW' | 'MODERATE' | 'HIGH' | 'FULL') => {
  const color = 
    occupancyStatus === 'LOW' ? '#10b981' :
    occupancyStatus === 'MODERATE' ? '#3b82f6' :
    occupancyStatus === 'HIGH' ? '#f59e0b' : '#ef4444';

  return L.divIcon({
    className: 'bg-transparent border-0',
    html: `<div style="background-color: ${color}; width: 26px; height: 26px; border-radius: 50%; border: 3px solid white; box-shadow: 0 3px 6px rgba(0,0,0,0.35); display: flex; align-items: center; justify-content: center;">
      <div style="background-color: white; width: 6px; height: 6px; border-radius: 50%;"></div>
    </div>`,
    iconSize: [26, 26],
    iconAnchor: [13, 13],
  });
};

const createNonHospitalMarkerIcon = (type: string) => {
  const color = type.toLowerCase().includes('shelter') ? '#a855f7' : '#0ea5e9';
  return L.divIcon({
    className: 'bg-transparent border-0',
    html: `<div style="background-color: ${color}; width: 22px; height: 22px; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>`,
    iconSize: [22, 22],
    iconAnchor: [11, 11],
  });
};

const PROVINCES = [
  'All',
  'Bagmati Province',
  'Gandaki Province',
  'Koshi Province',
  'Madhesh Province',
  'Lumbini Province',
  'Karnali Province',
  'Sudurpashchim Province'
];

interface BipadResourceSummary {
  resourceType: string;
  label: string;
  count: number;
}

interface BipadResourcePoint {
  id: number;
  title: string;
  resourceType: string;
  label: string;
  lat: number;
  lng: number;
}

interface DrrDistributionSummary {
  areaCount: number;
  received: number;
  required: number;
  coveragePercent: number;
  sourceState: 'LIVE' | 'UNAVAILABLE';
}

export function Facilities() {
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<'table' | 'card' | 'map'>('card');
  const [categoryFilter, setCategoryFilter] = useState<string>('Hospitals');
  const [provinceFilter, setProvinceFilter] = useState<string>('All');
  const [districtFilter, setDistrictFilter] = useState<string>('All');
  const [typeFilter, setTypeFilter] = useState<string>('All');
  const [occupancyFilter, setOccupancyFilter] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<'name' | 'available' | 'occupancy' | 'distance'>('available');
  const [selectedHospital, setSelectedHospital] = useState<GovernmentHospital | null>(null);
  const [bipadResourceSummaries, setBipadResourceSummaries] = useState<BipadResourceSummary[]>([]);
  const [bipadResourcePoints, setBipadResourcePoints] = useState<BipadResourcePoint[]>([]);
  const [bipadResourceSource, setBipadResourceSource] = useState<'LIVE' | 'UNAVAILABLE'>('UNAVAILABLE');
  const [bipadResourceRetrievedAt, setBipadResourceRetrievedAt] = useState<string | null>(null);
  const [drrDistribution, setDrrDistribution] = useState<DrrDistributionSummary>({ areaCount: 0, received: 0, required: 0, coveragePercent: 0, sourceState: 'UNAVAILABLE' });

  const { 
    facilities, 
    governmentHospitals, 
    hospitalSummary, 
    hospitalLoading, 
    hospitalError, 
    hospitalLastRetrieved,
    hospitalIsCached,
    hospitalSourceStatus,
    refreshGovernmentHospitals,
    demoScenarioStep,
    currentLocationId, currentLocation, userGeolocation,
    locations 
  } = useAppState();

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      fetch('/api/bipad-capacity-resources').then(response => response.json()),
      fetch('/api/drr-relief-resources').then(response => response.json())
    ]).then(([data, drrData]) => {
        if (cancelled) return;
        setBipadResourceSummaries(Array.isArray(data.summaries) ? data.summaries : []);
        setBipadResourcePoints(Array.isArray(data.points) ? data.points : []);
        setBipadResourceSource(data.dataSource === 'LIVE' ? 'LIVE' : 'UNAVAILABLE');
        setBipadResourceRetrievedAt(data.retrievedAt || null);
        const drrAreas = Array.isArray(drrData.areas) ? drrData.areas : [];
        const received = drrAreas.reduce((sum: number, area: { received?: number }) => sum + (Number(area.received) || 0), 0);
        const required = drrAreas.reduce((sum: number, area: { required?: number }) => sum + (Number(area.required) || 0), 0);
        setDrrDistribution({
          areaCount: drrAreas.length,
          received,
          required,
          coveragePercent: required > 0 ? Math.round((received / required) * 100) : 0,
          sourceState: drrData.dataSource === 'LIVE' ? 'LIVE' : 'UNAVAILABLE'
        });
      })
      .catch(() => {
        if (!cancelled) setBipadResourceSource('UNAVAILABLE');
      });
    return () => { cancelled = true; };
  }, []);

   

  // Extract all distinct districts from hospitals for district dropdown
  const distinctDistricts = useMemo(() => {
    const set = new Set<string>();
    governmentHospitals.forEach(h => {
      if (h.district) set.add(h.district);
    });
    return Array.from(set).sort();
  }, [governmentHospitals]);

  // Helper to get real distance
  const getFacilityDistance = (lat?: number, lng?: number) => {
    if (!lat || !lng) return null;
    if (userGeolocation) return Math.round(calculateDistanceKm(userGeolocation.lat, userGeolocation.lng, lat, lng) * 10) / 10;
    if (currentLocation?.lat && currentLocation?.lng) return Math.round(calculateDistanceKm(currentLocation.lat, currentLocation.lng, lat, lng) * 10) / 10;
    return null;
  };

  // Filtered government hospitals
  const filteredHospitals = useMemo(() => {
    return governmentHospitals.filter(h => {
      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const match = 
          h.name.toLowerCase().includes(q) ||
          h.district.toLowerCase().includes(q) ||
          h.municipality.toLowerCase().includes(q) ||
          h.province.toLowerCase().includes(q);
        if (!match) return false;
      }

      // Province
      if (provinceFilter !== 'All') {
        if (!h.province.toLowerCase().includes(provinceFilter.toLowerCase().replace(' province', ''))) {
          return false;
        }
      }

      // District
      if (districtFilter !== 'All') {
        if (h.district !== districtFilter) return false;
      }

      // Hospital Type (Government vs Non-Government)
      if (typeFilter !== 'All') {
        if (typeFilter === 'PUBLIC' && !h.type.toUpperCase().includes('PUBLIC')) return false;
        if (typeFilter === 'NON-PUBLIC' && !h.type.toUpperCase().includes('NON-PUBLIC')) return false;
      }

      // Occupancy status
      if (occupancyFilter !== 'All') {
        if (h.occupancyStatus !== occupancyFilter) return false;
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      if (sortBy === 'available') return b.availableBeds - a.availableBeds;
      if (sortBy === 'occupancy') return b.occupancyPercentage - a.occupancyPercentage;
      if (sortBy === 'distance') {
        const distA = getFacilityDistance(a.lat, a.lng) ?? 999999;
        const distB = getFacilityDistance(b.lat, b.lng) ?? 999999;
        return distA - distB;
      }
      return 0;
    });
  }, [governmentHospitals, searchQuery, provinceFilter, districtFilter, typeFilter, occupancyFilter, sortBy, userGeolocation, currentLocation]);

  // Filtered non-hospital facilities (shelters, relief centers, pharmacies, etc.)
  const nonHospitalFacilities = useMemo(() => {
    return facilities.filter(f => f.type !== 'Hospital').filter(f => {
      if (categoryFilter === 'All') return true;
      if (categoryFilter === 'Shelters') return f.type.toLowerCase().includes('shelter');
      if (categoryFilter === 'Emergency Centers') return f.type.toLowerCase().includes('emergency');
      if (categoryFilter === 'Pharmacies') return f.type.toLowerCase().includes('pharmacy');
      if (categoryFilter === 'Blood Banks') return f.type.toLowerCase().includes('blood');
      if (categoryFilter === 'Relief Centers') return f.type.toLowerCase().includes('relief');
      return false;
    });
  }, [facilities, categoryFilter]);

  // Map markers: combine hospitals with coordinates and other facilities
  const mapHospitalMarkers = useMemo(() => {
    return filteredHospitals.filter(h => h.lat != null && h.lng != null);
  }, [filteredHospitals]);

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* HEADER STRIP */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
              Emergency Facilities & Hospitals
            </h1>
          </div>
          <p className="text-slate-600 dark:text-slate-400 text-sm">
            Authoritative Nepal medical bed availability, free health quota capacities, and shelter networks.
          </p>
        </div>

        {/* Global Controls & Status Badges */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Real data vs demo data badge */}
          {hospitalLoading ? (
            <Badge variant="outline" className="animate-pulse flex items-center gap-1.5">
              <RefreshCw className="h-3 w-3 animate-spin" /> FETCHING GOVERNMENT HOSPITAL DATA...
            </Badge>
          ) : demoScenarioStep > 0 ? (
            <Badge variant="outline" className="bg-amber-50 text-amber-800 border-amber-300">
              SIMULATED DATA (DEMO MODE)
            </Badge>
          ) : hospitalSourceStatus === 'LIVE' ? (
            <Badge variant="success" className="bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700 flex items-center gap-1">
              <ShieldCheck className="h-3.5 w-3.5" /> REAL SOURCE DATA
            </Badge>
          ) : hospitalIsCached ? (
            <Badge variant="warning" className="flex items-center gap-1">
              <Clock className="h-3 w-3" /> CACHED DATA
            </Badge>
          ) : (
            <Badge variant="danger">
              DEMO DATA — GOVERNMENT SOURCE TEMPORARILY UNAVAILABLE
            </Badge>
          )}

          {/* Patient Matching Portal Link */}
          <Button 
            variant="primary" 
            size="sm" 
            onClick={() => navigate('/hospital-matching')}
            className="flex items-center gap-1.5 bg-teal-600 hover:bg-teal-700 text-white font-bold shadow-xs text-xs"
          >
            <Stethoscope className="h-3.5 w-3.5" />
            Patient Matching Portal
          </Button>

          {/* Refresh Button */}
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => refreshGovernmentHospitals()}
            disabled={hospitalLoading}
            className="flex items-center gap-1.5 bg-white dark:bg-slate-900 shadow-xs"
          >
            <RefreshCw className={cn("h-3.5 w-3.5", hospitalLoading && "animate-spin text-blue-600")} />
            REFRESH HOSPITAL DATA
          </Button>

          {/* View Mode Toggle */}
          <div className="flex bg-slate-100 dark:bg-slate-900 rounded-lg p-1 border border-slate-200 dark:border-slate-800 shadow-xs">
            <button 
              className={cn(
                "px-3 py-1 text-xs font-semibold rounded-md flex items-center gap-1.5 transition-all",
                viewMode === 'card' ? "bg-white text-slate-900 shadow-xs dark:bg-slate-800 dark:text-slate-100" : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
              )}
              onClick={() => setViewMode('card')}
              title="Cards View"
            >
              <LayoutGrid className="h-3.5 w-3.5" /> Cards
            </button>
            <button 
              className={cn(
                "px-3 py-1 text-xs font-semibold rounded-md flex items-center gap-1.5 transition-all",
                viewMode === 'table' ? "bg-white text-slate-900 shadow-xs dark:bg-slate-800 dark:text-slate-100" : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
              )}
              onClick={() => setViewMode('table')}
              title="Table View"
            >
              <List className="h-3.5 w-3.5" /> Table
            </button>
            <button 
              className={cn(
                "px-3 py-1 text-xs font-semibold rounded-md flex items-center gap-1.5 transition-all",
                viewMode === 'map' ? "bg-white text-slate-900 shadow-xs dark:bg-slate-800 dark:text-slate-100" : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
              )}
              onClick={() => setViewMode('map')}
              title="Province Map View (Galli Maps)"
            >
              <MapIcon className="h-3.5 w-3.5" /> Galli Map
            </button>
          </div>
        </div>
      </div>

      {/* GOVERNMENT SOURCE PROVENANCE CALLOUT */}
      <div className="bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 rounded-lg shrink-0 mt-0.5">
              <Building2 className="h-5 w-5" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wide">
                  Data Source: Nepal Government — Free Health Dashboard
                </span>
                <span className="text-[11px] font-mono text-slate-500">(लक्ष्यित वर्ग निःशुल्क उपचार पोर्टल)</span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                Authoritative bed allocation data directly sourced from the Nepal Ministry of Health and Population (MoHP).
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 pl-11 md:pl-0">
            <div>
              <span className="font-semibold text-slate-700 dark:text-slate-300">SOURCE UPDATED:</span>{' '}
              <span>Source update time unavailable</span>
            </div>
            <div className="hidden sm:inline text-slate-300 dark:text-slate-700">•</div>
            <div>
              <span className="font-semibold text-slate-700 dark:text-slate-300">SAHAYAK RETRIEVED:</span>{' '}
              <span>
                {hospitalLastRetrieved ? new Date(hospitalLastRetrieved).toLocaleTimeString() : 'Pending'}
              </span>
            </div>
            <a 
              href="https://freehealth.mohp.gov.np" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-blue-600 dark:text-blue-400 font-semibold hover:underline"
            >
              Verify freehealth.mohp.gov.np <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        </div>
      </div>

      <div className="bg-blue-50/40 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900/50 rounded-xl p-4 shadow-xs">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div>
            <h3 className="font-bold text-slate-900 dark:text-slate-100">BIPAD Capacity &amp; Resources</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">Official Nepal disaster resource inventory across health, roads, water, shelters, warehouses, and critical infrastructure.</p>
          </div>
          <Badge variant={bipadResourceSource === 'LIVE' ? 'success' : 'warning'}>{bipadResourceSource === 'LIVE' ? 'BIPAD LIVE' : 'BIPAD UNAVAILABLE'}</Badge>
        </div>
        {bipadResourceSource === 'LIVE' && (
          <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
            {bipadResourceSummaries.filter(item => item.count > 0).slice(0, 10).map(item => (
              <div key={item.resourceType} className="shrink-0 rounded-lg border border-blue-200 dark:border-blue-900 bg-white/70 dark:bg-slate-900/70 px-3 py-2 text-xs">
                <span className="block text-slate-500 dark:text-slate-400">{item.label}</span>
                <strong className="text-blue-700 dark:text-blue-300">{item.count.toLocaleString()}</strong>
              </div>
            ))}
          </div>
        )}
        <div className="mt-3 flex items-center gap-3 flex-wrap text-xs">
          <Badge variant={drrDistribution.sourceState === 'LIVE' ? 'success' : 'warning'}>{drrDistribution.sourceState === 'LIVE' ? 'DRR DISTRIBUTION LIVE' : 'DRR DISTRIBUTION UNAVAILABLE'}</Badge>
          {drrDistribution.sourceState === 'LIVE' && <span className="text-slate-600 dark:text-slate-400">{drrDistribution.areaCount} areas • {drrDistribution.received.toLocaleString()} received / {drrDistribution.required.toLocaleString()} required • {drrDistribution.coveragePercent}% coverage</span>}
        </div>
        {bipadResourceRetrievedAt && <p className="mt-2 text-[10px] text-slate-400">Source: BIPAD Portal • Retrieved {new Date(bipadResourceRetrievedAt).toLocaleString()}</p>}
      </div>

      {/* SUMMARY CAPACITY STRIP */}
      {hospitalSummary && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <Card className="p-3.5 text-center">
            <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-0.5">
              Hospitals Tracked
            </span>
            <span className="text-2xl font-bold text-slate-900 dark:text-white">
              {hospitalSummary.totalHospitals}
            </span>
            <span className="block text-[10px] text-slate-400 mt-0.5">
              {hospitalSummary.districtsCount} Districts
            </span>
          </Card>

          <Card className="p-3.5 text-center">
            <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-0.5">
              Total Sanction Beds
            </span>
            <span className="text-2xl font-bold text-slate-900 dark:text-white">
              {hospitalSummary.totalBeds.toLocaleString()}
            </span>
            <span className="block text-[10px] text-slate-400 mt-0.5">Gross capacity</span>
          </Card>

          <Card className="p-3.5 text-center">
            <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-0.5">
              Allocated Free Beds
            </span>
            <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {hospitalSummary.totalAllocatedFreeBeds.toLocaleString()}
            </span>
            <span className="block text-[10px] text-slate-400 mt-0.5">Gov Free Quota</span>
          </Card>

          <Card className="p-3.5 text-center">
            <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-0.5">
              Occupied Free Beds
            </span>
            <span className="text-2xl font-bold text-amber-600 dark:text-amber-400">
              {hospitalSummary.totalOccupiedBeds.toLocaleString()}
            </span>
            <span className="block text-[10px] text-slate-400 mt-0.5">Active patients</span>
          </Card>

          <Card className="p-3.5 text-center">
            <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-0.5">
              Available Free Beds
            </span>
            <span className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
              {hospitalSummary.totalAvailableBeds.toLocaleString()}
            </span>
            <span className="block text-[10px] text-slate-400 mt-0.5">Open for intake</span>
          </Card>

          <Card className="p-3.5 text-center">
            <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-0.5">
              Near Capacity
            </span>
            <span className={cn(
              "text-2xl font-bold",
              hospitalSummary.hospitalsNearCapacity > 0 ? "text-red-600 dark:text-red-400" : "text-emerald-600 dark:text-emerald-400"
            )}>
              {hospitalSummary.hospitalsNearCapacity}
            </span>
            <span className="block text-[10px] text-slate-400 mt-0.5">≥ 90% Occupied</span>
          </Card>
        </div>
      )}

      {/* CATEGORY SELECTOR CHIPS */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {[
          { id: 'Hospitals', label: 'Hospitals (MoHP Live)', count: governmentHospitals.length },
          { id: 'Shelters', label: 'Shelters', count: facilities.filter(f => f.type.toLowerCase().includes('shelter')).length },
          { id: 'Emergency Centers', label: 'Emergency Centers', count: facilities.filter(f => f.type.toLowerCase().includes('emergency')).length },
          { id: 'Pharmacies', label: 'Pharmacies', count: facilities.filter(f => f.type.toLowerCase().includes('pharmacy')).length },
          { id: 'Blood Banks', label: 'Blood Banks', count: facilities.filter(f => f.type.toLowerCase().includes('blood')).length },
          { id: 'Relief Centers', label: 'Relief Centers', count: facilities.filter(f => f.type.toLowerCase().includes('relief')).length },
          { id: 'All', label: 'All Facilities', count: facilities.length },
        ].map(cat => (
          <button
            key={cat.id}
            onClick={() => setCategoryFilter(cat.id)}
            className={cn(
              "px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all border",
              categoryFilter === cat.id
                ? "bg-blue-600 text-white border-blue-600 shadow-xs"
                : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800"
            )}
          >
            {cat.label} <span className="opacity-70 text-[10px] ml-1">({cat.count})</span>
          </button>
        ))}
      </div>

      {/* SEARCH AND ADVANCED FILTERS (For Hospitals) */}
      {categoryFilter === 'Hospitals' && (
        <Card className="p-4 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
            {/* Search Input */}
            <div className="lg:col-span-2 relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search hospital, district, municipality..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-slate-100"
              />
            </div>

            {/* Province Filter */}
            <div>
              <select
                value={provinceFilter}
                onChange={(e) => setProvinceFilter(e.target.value)}
                className="w-full py-2 px-3 text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-slate-100"
              >
                {PROVINCES.map(p => (
                  <option key={p} value={p}>{p === 'All' ? 'All Provinces' : p}</option>
                ))}
              </select>
            </div>

            {/* District Filter */}
            <div>
              <select
                value={districtFilter}
                onChange={(e) => setDistrictFilter(e.target.value)}
                className="w-full py-2 px-3 text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-slate-100"
              >
                <option value="All">All Districts ({distinctDistricts.length})</option>
                {distinctDistricts.map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>

            {/* Hospital Type Filter */}
            <div>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="w-full py-2 px-3 text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-slate-100"
              >
                <option value="All">All Hospital Types</option>
                <option value="PUBLIC">Government (PUBLIC)</option>
                <option value="NON-PUBLIC">Non-Government (NON-PUBLIC)</option>
              </select>
            </div>

            {/* Occupancy Status Filter */}
            <div>
              <select
                value={occupancyFilter}
                onChange={(e) => setOccupancyFilter(e.target.value)}
                className="w-full py-2 px-3 text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-slate-100"
              >
                <option value="All">All Occupancy Levels</option>
                <option value="LOW">LOW (0–50%)</option>
                <option value="MODERATE">MODERATE (51–75%)</option>
                <option value="HIGH">HIGH (76–90%)</option>
                <option value="FULL">NEAR FULL / FULL (91–100%)</option>
              </select>
            </div>
          </div>

          {/* Sort & Quick Results Indicator */}
          <div className="flex flex-wrap items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100 dark:border-slate-800/80 gap-2">
            <div>
              Showing <span className="font-bold text-slate-800 dark:text-slate-200">{filteredHospitals.length}</span> of{' '}
              <span>{governmentHospitals.length} government hospitals</span>
              {provinceFilter !== 'All' && <span> in {provinceFilter}</span>}
              {districtFilter !== 'All' && <span> • District: {districtFilter}</span>}
            </div>

            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-700 dark:text-slate-300">Sort by:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="py-1 px-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-md focus:outline-none text-slate-800 dark:text-slate-200 text-xs font-medium"
              >
                <option value="available">Available Free Beds (High to Low)</option>
                <option value="occupancy">Occupancy % (High to Low)</option>
                <option value="name">Hospital Name (A–Z)</option>
                <option value="distance">Distance from {currentLocation?.name || 'Selected'}</option>
              </select>
            </div>
          </div>
        </Card>
      )}

      {/* ERROR BANNER IF SOURCE FAILED */}
      {hospitalError && (
        <div className="p-4 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 rounded-xl flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
          <div className="text-sm">
            <h4 className="font-bold text-red-900 dark:text-red-200">
              Hospital availability data is currently unavailable
            </h4>
            <p className="text-red-700 dark:text-red-300 text-xs mt-0.5">
              {hospitalError}
            </p>
            {hospitalIsCached && (
              <p className="text-xs text-slate-500 mt-1">
                Displaying last successfully retrieved cached dataset from {new Date(hospitalLastRetrieved || '').toLocaleString()}.
              </p>
            )}
          </div>
        </div>
      )}

      {/* MAIN VIEW CONTENT */}
      {viewMode === 'map' ? (
        /* PROVINCE & REGIONAL MAP VIEW */
        <Card className="h-[650px] border-slate-200 dark:border-slate-800 relative overflow-hidden" noPadding>
          {/* Hospital Status Map Index */}
          <div className="absolute bottom-4 left-4 z-[400] bg-white/95 dark:bg-slate-900/95 backdrop-blur-md px-3.5 py-2.5 rounded-lg border border-slate-200/90 dark:border-slate-800/90 shadow-md flex flex-wrap items-center gap-3 text-xs pointer-events-auto">
            <span className="font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider text-[10px]">Hospital Status:</span>
            <span className="flex items-center gap-1.5 font-medium text-slate-700 dark:text-slate-300 text-[11px]"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0"></span> 0–50% Low</span>
            <span className="flex items-center gap-1.5 font-medium text-slate-700 dark:text-slate-300 text-[11px]"><span className="w-2.5 h-2.5 rounded-full bg-blue-500 shrink-0"></span> 51–75% Mod</span>
            <span className="flex items-center gap-1.5 font-medium text-slate-700 dark:text-slate-300 text-[11px]"><span className="w-2.5 h-2.5 rounded-full bg-amber-500 shrink-0"></span> 76–90% High</span>
            <span className="flex items-center gap-1.5 font-medium text-slate-700 dark:text-slate-300 text-[11px]"><span className="w-2.5 h-2.5 rounded-full bg-red-500 shrink-0"></span> 91–100% Full</span>
          </div>

          <BaseMap className="h-full rounded-none border-0 bg-slate-50 dark:bg-slate-950/50 absolute inset-0 z-0">
            {/* Render Government Hospitals with known coordinates */}
            {mapHospitalMarkers.map(hosp => (
              <Marker
                key={hosp.id}
                position={[hosp.lat!, hosp.lng!]}
                icon={createOccupancyMarkerIcon(hosp.occupancyStatus)}
              >
                <Popup className="rounded-xl overflow-hidden shadow-xl border-0">
                  <div className="p-1 space-y-1.5 min-w-[220px]">
                    <div className="flex items-center gap-1.5">
                      <Badge variant="success" className="text-[9px] px-1 py-0">REAL DATA</Badge>
                      <span className="text-[10px] font-bold text-slate-500 uppercase">{hosp.district}</span>
                    </div>
                    <h4 className="font-bold text-slate-900 text-sm leading-snug">{hosp.name}</h4>
                    <p className="text-[11px] text-slate-500">{hosp.address}</p>
                    
                    <div className="bg-slate-100 p-2 rounded-md text-xs space-y-1 mt-2">
                      <div className="flex justify-between font-semibold">
                        <span>Free Available:</span>
                        <span className="text-emerald-700 font-bold">{hosp.availableBeds} beds</span>
                      </div>
                      <div className="flex justify-between font-semibold">
                        <span>Occupancy:</span>
                        <span className={cn(
                          hosp.occupancyStatus === 'FULL' || hosp.occupancyStatus === 'HIGH' ? 'text-red-600' : 'text-slate-700'
                        )}>{hosp.occupancyPercentage}% ({hosp.occupancyStatus})</span>
                      </div>
                      <div className="flex justify-between text-[10px] text-slate-500 pt-0.5 border-t border-slate-200">
                        <span>Precision:</span>
                        <span>{hosp.locationPrecision === 'EXACT' ? 'Exact Facility' : 'District Level'}</span>
                      </div>
                    </div>

                    <button
                      onClick={() => setSelectedHospital(hosp)}
                      className="w-full mt-2 py-1.5 px-3 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-xs font-semibold text-center transition-colors block"
                    >
                      View Full Details
                    </button>
                  </div>
                </Popup>
              </Marker>
            ))}

            {/* Non-hospital facilities */}
            {nonHospitalFacilities.filter(f => f.lat && f.lng).map(fac => (
              <Marker
                key={fac.id}
                position={[fac.lat, fac.lng]}
                icon={createNonHospitalMarkerIcon(fac.type)}
              >
                <Popup className="rounded-xl overflow-hidden shadow-xl border-0">
                  <div className="p-1">
                    <span className="text-[10px] font-bold text-purple-600 uppercase">{fac.type}</span>
                    <h4 className="font-bold text-slate-900 text-sm">{fac.name}</h4>
                    <p className="text-xs text-slate-500">{fac.address}</p>
                    <div className="text-xs mt-1 font-semibold">Capacity: {fac.currentOccupancy} / {fac.capacity}</div>
                  </div>
                </Popup>
              </Marker>
            ))}

            {bipadResourcePoints.map(resource => (
              <Circle
                key={`bipad-resource-${resource.id}`}
                center={[resource.lat, resource.lng]}
                radius={1800}
                pathOptions={{ color: '#0ea5e9', fillColor: '#38bdf8', fillOpacity: 0.28, weight: 1 }}
              >
                <Popup>
                  <strong>{resource.title}</strong><br />
                  {resource.label}<br />
                  <span>Official BIPAD capacity/resource record</span>
                </Popup>
              </Circle>
            ))}
          </BaseMap>
        </Card>
      ) : viewMode === 'table' ? (
        /* RESPONSIVE TABLE VIEW */
        <Card className="overflow-hidden p-0" noPadding>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 dark:bg-slate-950/80 border-b border-slate-200 dark:border-slate-800 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                <tr>
                  <th className="py-3.5 px-4">Hospital Name & Category</th>
                  <th className="py-3.5 px-4">Location (District / Province)</th>
                  <th className="py-3.5 px-4 text-center">Sanction Beds</th>
                  <th className="py-3.5 px-4 text-center">Allocated Free</th>
                  <th className="py-3.5 px-4 text-center">Active Occupied</th>
                  <th className="py-3.5 px-4 text-center">Available Free</th>
                  <th className="py-3.5 px-4">Occupancy %</th>
                  <th className="py-3.5 px-4 text-center">Status</th>
                  <th className="py-3.5 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {categoryFilter === 'Hospitals' || categoryFilter === 'All' ? (
                  filteredHospitals.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="py-12 text-center text-slate-500 dark:text-slate-400">
                        No government hospitals match the selected filters.
                      </td>
                    </tr>
                  ) : (
                    filteredHospitals.map(hosp => {
                      const colorStyle = getOccupancyColor(hosp.occupancyStatus);
                      return (
                        <tr 
                          key={hosp.id}
                          className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors cursor-pointer"
                          onClick={() => setSelectedHospital(hosp)}
                        >
                          {/* Name & Type */}
                          <td className="py-3.5 px-4">
                            <div className="font-semibold text-slate-900 dark:text-slate-100 leading-tight">
                              {hosp.name}
                            </div>
                            <div className="flex items-center gap-1.5 mt-1">
                              <span className={cn(
                                "text-[10px] font-bold uppercase px-1.5 py-0.5 rounded",
                                hosp.type.includes('PUBLIC') 
                                  ? "bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300"
                                  : "bg-purple-50 dark:bg-purple-950 text-purple-700 dark:text-purple-300"
                              )}>
                                {hosp.type.includes('PUBLIC') ? 'Gov Public' : 'Non-Public'}
                              </span>
                              {hosp.hasDiscrepancy && (
                                <span title={hosp.discrepancyNote} className="text-amber-500">
                                  <AlertTriangle className="h-3.5 w-3.5" />
                                </span>
                              )}
                            </div>
                          </td>

                          {/* Location */}
                          <td className="py-3.5 px-4">
                            <div className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                              {hosp.district}
                            </div>
                            <div className="text-[11px] text-slate-500">
                              {hosp.province}
                            </div>
                            {getFacilityDistance(hosp.lat, hosp.lng) != null && (
                              <div className="text-[10px] text-blue-600 dark:text-blue-400 font-medium">
                                ~{getFacilityDistance(hosp.lat, hosp.lng)} km away
                              </div>
                            )}
                          </td>

                          {/* Total Sanction Beds */}
                          <td className="py-3.5 px-4 text-center font-mono text-slate-600 dark:text-slate-400">
                            {hosp.totalBeds > 0 ? hosp.totalBeds : '—'}
                          </td>

                          {/* Allocated Free Beds */}
                          <td className="py-3.5 px-4 text-center font-mono font-semibold text-blue-600 dark:text-blue-400">
                            {hosp.allocatedBeds}
                          </td>

                          {/* Occupied Beds */}
                          <td className="py-3.5 px-4 text-center font-mono font-semibold text-amber-600 dark:text-amber-400">
                            {hosp.occupiedBeds}
                          </td>

                          {/* Available Free Beds */}
                          <td className="py-3.5 px-4 text-center">
                            <span className="inline-block py-1 px-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 font-bold font-mono text-sm border border-emerald-200 dark:border-emerald-800/80">
                              {hosp.availableBeds}
                            </span>
                          </td>

                          {/* Occupancy % & Mini Bar */}
                          <td className="py-3.5 px-4 min-w-[130px]">
                            <div className="flex justify-between items-center text-xs mb-1">
                              <span className={cn("font-bold", colorStyle.text)}>
                                {hosp.occupancyPercentage}%
                              </span>
                            </div>
                            <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
                              <div 
                                className="h-1.5 rounded-full"
                                style={{ 
                                  width: `${hosp.occupancyPercentage}%`,
                                  backgroundColor: colorStyle.fillColor 
                                }}
                              />
                            </div>
                          </td>

                          {/* Status Badge */}
                          <td className="py-3.5 px-4 text-center">
                            <Badge variant={colorStyle.badgeVariant} className="text-[10px] font-bold">
                              {hosp.occupancyStatus}
                            </Badge>
                          </td>

                          {/* Action Button */}
                          <td className="py-3.5 px-4 text-right">
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedHospital(hosp);
                              }}
                              className="text-xs font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400 p-1"
                            >
                              Details <ChevronRight className="h-4 w-4 ml-0.5 inline" />
                            </Button>
                          </td>
                        </tr>
                      );
                    })
                  )
                ) : null}

                {/* Other non-hospital facilities if selected */}
                {categoryFilter !== 'Hospitals' && nonHospitalFacilities.map(fac => (
                  <tr key={fac.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-900 dark:text-slate-100">{fac.name}</div>
                      <Badge variant="outline" className="text-[10px] mt-1">{fac.type}</Badge>
                    </td>
                    <td className="py-3.5 px-4 text-xs text-slate-600 dark:text-slate-400">
                      {fac.address}
                    </td>
                    <td className="py-3.5 px-4 text-center font-mono">{fac.capacity}</td>
                    <td className="py-3.5 px-4 text-center font-mono text-slate-400">—</td>
                    <td className="py-3.5 px-4 text-center font-mono text-amber-600">{fac.currentOccupancy}</td>
                    <td className="py-3.5 px-4 text-center font-mono font-bold text-emerald-600">
                      {Math.max(0, fac.capacity - fac.currentOccupancy)}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="text-xs font-semibold text-slate-700">
                        {fac.capacity > 0 ? Math.round((fac.currentOccupancy / fac.capacity) * 100) : 0}%
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <Badge variant={fac.status === 'Operational' ? 'success' : 'danger'}>
                        {fac.status}
                      </Badge>
                    </td>
                    <td className="py-3.5 px-4 text-right text-xs text-slate-500">
                      {fac.contact}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      ) : (
        /* CARD GRID VIEW */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {categoryFilter === 'Hospitals' || categoryFilter === 'All' ? (
            filteredHospitals.length === 0 ? (
              <div className="col-span-full p-12 text-center text-slate-500 dark:text-slate-400">
                No hospitals match the selected criteria.
              </div>
            ) : (
              filteredHospitals.map(hosp => {
                const colorStyle = getOccupancyColor(hosp.occupancyStatus);
                return (
                  <Card 
                    key={hosp.id} 
                    className="flex flex-col justify-between hover:shadow-md transition-shadow cursor-pointer border-slate-200 dark:border-slate-800"
                    onClick={() => setSelectedHospital(hosp)}
                  >
                    <div>
                      {/* Top Bar */}
                      <div className="flex justify-between items-start mb-3 gap-2">
                        <div className="flex items-center gap-2.5">
                          <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-900/60 shadow-xs">
                            <Stethoscope className="h-5 w-5" />
                          </div>
                          <div>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                              {hosp.district} • {(hosp.province || '').replace(' Province', '')}
                            </span>
                            <Badge variant={hosp.type.includes('PUBLIC') ? 'info' : 'outline'} className="text-[9px] px-1.5 py-0">
                              {hosp.type.includes('PUBLIC') ? 'Government (PUBLIC)' : 'Non-Government'}
                            </Badge>
                          </div>
                        </div>
                        <Badge variant={colorStyle.badgeVariant} className="text-[10px] font-bold shrink-0">
                          {hosp.occupancyStatus}
                        </Badge>
                      </div>

                      {/* Hospital Name */}
                      <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base leading-snug mb-1">
                        {hosp.name}
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1 mb-4">
                        {hosp.address}
                      </p>

                      {/* Occupancy Progress Bar */}
                      <div className="space-y-1.5 mb-4">
                        <div className="flex justify-between text-xs font-bold">
                          <span className="text-slate-500 uppercase tracking-wider text-[10px]">Free Bed Occupancy</span>
                          <span className={colorStyle.text}>{hosp.occupancyPercentage}%</span>
                        </div>
                        <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                          <div 
                            className="h-2 rounded-full transition-all"
                            style={{ 
                              width: `${hosp.occupancyPercentage}%`,
                              backgroundColor: colorStyle.fillColor 
                            }}
                          />
                        </div>
                      </div>

                      {/* Key Numbers 3-column pill */}
                      <div className="grid grid-cols-3 gap-2 bg-slate-50 dark:bg-slate-950 p-2.5 rounded-lg border border-slate-200/80 dark:border-slate-800/80 text-center mb-3">
                        <div>
                          <span className="block text-[9px] uppercase font-bold text-slate-400">Total Sanction</span>
                          <span className="font-mono text-sm font-bold text-slate-700 dark:text-slate-300">
                            {hosp.totalBeds > 0 ? hosp.totalBeds : 'N/A'}
                          </span>
                        </div>
                        <div>
                          <span className="block text-[9px] uppercase font-bold text-slate-400">Occupied</span>
                          <span className="font-mono text-sm font-bold text-amber-600 dark:text-amber-400">
                            {hosp.occupiedBeds}
                          </span>
                        </div>
                        <div>
                          <span className="block text-[9px] uppercase font-bold text-slate-400">Available</span>
                          <span className="font-mono text-sm font-bold text-emerald-600 dark:text-emerald-400">
                            {hosp.availableBeds}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2 mt-2">
                      <span className="text-[11px] text-slate-400">
                        {getFacilityDistance(hosp.lat, hosp.lng) != null ? `~${getFacilityDistance(hosp.lat, hosp.lng)} km away` : 'Coords unverified'}
                      </span>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedHospital(hosp);
                        }}
                        className="text-xs"
                      >
                        Inspect Details
                      </Button>
                    </div>
                  </Card>
                );
              })
            )
          ) : null}

          {/* Non-hospital cards if selected */}
          {categoryFilter !== 'Hospitals' && nonHospitalFacilities.map(fac => (
            <Card key={fac.id} className="flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start mb-3">
                  <Badge variant="outline">{fac.type}</Badge>
                  <Badge variant={fac.status === 'Operational' ? 'success' : 'danger'}>{fac.status}</Badge>
                </div>
                <h3 className="font-bold text-slate-900 dark:text-slate-100 mb-1">{fac.name}</h3>
                <p className="text-xs text-slate-500 mb-4">{fac.address}</p>
                <div className="text-sm font-semibold mb-2">
                  Occupancy: {fac.currentOccupancy} / {fac.capacity}
                </div>
              </div>
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500">
                Contact: {fac.contact}
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* DETAILED HOSPITAL DRAWER / MODAL */}
      <HospitalDetailModal 
        hospital={selectedHospital}
        onClose={() => setSelectedHospital(null)}
      />
    </div>
  );
}
