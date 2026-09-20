import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Card, Badge, Button } from '@/components/ui';
import { 
  Navigation, AlertTriangle, MapPin, Search, FilePlus, 
  Crosshair, ArrowUpDown, ShieldAlert, CheckCircle2, 
  Layers, Clock, AlertCircle, RefreshCw, Compass, Waves,
  ExternalLink, Building2, Siren, Truck, Shield, Sparkles,
  Check, Info, ChevronRight
} from 'lucide-react';
import { useAppState } from '@/lib/store';
import { cn } from '@/lib/utils';
import { calculateRoutes } from '@/lib/routingService';
import { evaluateDisasterAwareRoutes } from '@/lib/dorRoadService';
import { RouteAlternative, RoutingProfileMode, DisasterAwareRouteEvaluation } from '@/types';
import { DhmHydrologyService } from '@/lib/dhmHydrologyService';
import { ReportRoadModal } from '@/components/routes/ReportRoadModal';
import { MOCK_ROADS, MOCK_BRIDGES } from '@/data/mock';
import { MapContainer, TileLayer, Polyline, Marker, Popup, Tooltip, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useTheme } from '@/lib/theme';

// Fix default Leaflet icon assets
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const getRoadStatusColor = (status: string) => {
  switch (status?.toUpperCase()) {
    case 'OPEN': return '#10b981'; // Green
    case 'CAUTION': return '#eab308'; // Yellow
    case 'RESTRICTED': return '#f97316'; // Orange
    case 'BLOCKED': return '#ef4444'; // Red
    case 'UNKNOWN':
    default: return '#94a3b8'; // Gray
  }
};

const formatDuration = (seconds: number) => {
  const totalMins = Math.round(seconds / 60);
  if (totalMins < 60) return `${totalMins} min`;
  const hours = Math.floor(totalMins / 60);
  const mins = totalMins % 60;
  return mins > 0 ? `${hours}h ${mins}m` : `${hours} hrs`;
};

const CITIES: Record<string, { lat: number; lng: number; region: string }> = {
  Kathmandu: { lat: 27.7172, lng: 85.3240, region: 'Bagmati' },
  Pokhara: { lat: 28.2096, lng: 83.9856, region: 'Gandaki' },
  Narayanghat: { lat: 27.6833, lng: 84.4333, region: 'Bagmati' },
  Hetauda: { lat: 27.4287, lng: 85.0326, region: 'Bagmati' },
  Chitwan: { lat: 27.5291, lng: 84.3542, region: 'Bagmati' },
  Bardibas: { lat: 26.9800, lng: 85.9000, region: 'Madhesh' },
  Janakpur: { lat: 26.7288, lng: 85.9244, region: 'Madhesh' },
  Sindhupalchok: { lat: 27.9500, lng: 85.6800, region: 'Bagmati' },
  Biratnagar: { lat: 26.4525, lng: 87.2718, region: 'Koshi' },
  Dharan: { lat: 26.8124, lng: 87.2834, region: 'Koshi' },
  Butwal: { lat: 27.7006, lng: 83.4484, region: 'Lumbini' },
  Nepalgunj: { lat: 28.0500, lng: 81.6167, region: 'Lumbini' }
};

// Custom Leaflet Div Icons
const createPinIcon = (color: string, label: string, isPulse = false) => {
  return L.divIcon({
    className: 'custom-marker-icon',
    html: `
      <div style="position: relative; display: flex; align-items: center; justify-content: center; width: 34px; height: 34px;">
        ${isPulse ? `<div style="position: absolute; width: 34px; height: 34px; border-radius: 50%; background-color: ${color}; opacity: 0.35; animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>` : ''}
        <div style="width: 30px; height: 30px; border-radius: 50%; background: ${color}; color: white; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 13px; border: 2.5px solid white; box-shadow: 0 4px 10px rgba(0,0,0,0.35); text-shadow: 0 1px 2px rgba(0,0,0,0.4);">
          ${label}
        </div>
      </div>
    `,
    iconSize: [34, 34],
    iconAnchor: [17, 17],
    popupAnchor: [0, -18]
  });
};

const createDorClosureIcon = (status: string) => {
  const bg = status === 'BLOCKED' ? '#dc2626' : status === 'RESTRICTED' ? '#ea580c' : '#eab308';
  return L.divIcon({
    className: 'custom-dor-closure-icon',
    html: `
      <div style="background: ${bg}; width: 28px; height: 28px; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 14px; border: 2px solid white; box-shadow: 0 3px 8px rgba(0,0,0,0.35); color: white;">
        ${status === 'BLOCKED' ? '⛔' : '⚠️'}
      </div>
    `,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
    popupAnchor: [0, -16]
  });
};

const createBridgeIcon = (status: string) => {
  const bg = status === 'BLOCKED' ? '#dc2626' : '#2563eb';
  return L.divIcon({
    className: 'custom-bridge-icon',
    html: `
      <div style="background: ${bg}; width: 26px; height: 26px; border-radius: 6px; display: flex; align-items: center; justify-content: center; font-size: 13px; border: 2px solid white; box-shadow: 0 2px 6px rgba(0,0,0,0.3); color: white;">
        🌉
      </div>
    `,
    iconSize: [26, 26],
    iconAnchor: [13, 13],
    popupAnchor: [0, -14]
  });
};

const createRiverMarkerIcon = (threat: string) => {
  const bg = threat === 'CRITICAL' ? '#ef4444' : threat === 'HIGH' ? '#f97316' : '#3b82f6';
  return L.divIcon({
    className: 'custom-river-icon',
    html: `
      <div style="background: ${bg}; width: 26px; height: 26px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 12px; border: 2px solid white; box-shadow: 0 2px 6px rgba(0,0,0,0.3); color: white;">
        🌊
      </div>
    `,
    iconSize: [26, 26],
    iconAnchor: [13, 13],
    popupAnchor: [0, -14]
  });
};

function MapBoundsController({ 
  routeCoords, 
  startCoords, 
  endCoords 
}: { 
  routeCoords?: [number, number][]; 
  startCoords?: [number, number]; 
  endCoords?: [number, number]; 
}) {
  const map = useMap();

  useEffect(() => {
    map.invalidateSize();
    const t = setTimeout(() => {
      map.invalidateSize();
    }, 200);
    return () => clearTimeout(t);
  }, [map]);

  useEffect(() => {
    map.invalidateSize();
    if (routeCoords && routeCoords.length > 1) {
      const bounds = L.latLngBounds(routeCoords);
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 14 });
    } else if (startCoords && endCoords) {
      const bounds = L.latLngBounds([startCoords, endCoords]);
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 14 });
    } else if (startCoords) {
      map.setView(startCoords, 11);
    }
  }, [routeCoords, startCoords, endCoords, map]);
  return null;
}

const RESPONDER_MODES: { id: RoutingProfileMode; label: string; icon: any; desc: string }[] = [
  { id: 'GENERAL_CITIZEN', label: 'Citizen / Light', icon: Navigation, desc: 'Standard civilian transit prioritizing highest overall road safety' },
  { id: 'AMBULANCE', label: 'Ambulance', icon: Siren, desc: 'High urgency, bypasses rough unpaved mountain tracks' },
  { id: 'FIRE_TRUCK', label: 'Fire Engine', icon: Shield, desc: 'Heavy weight & axle limits, requires verified structural bridges' },
  { id: 'RESCUE_4X4', label: 'Rescue 4x4', icon: ShieldAlert, desc: 'Swift-water & rough terrain passable for disaster search' },
  { id: 'RELIEF_CARGO', label: 'Relief Cargo', icon: Truck, desc: 'High tonnage supply distribution, avoids narrow single-lane bypasses' },
];

export function Routes() {
  const { 
    roads = [], 
    bridges = [], 
    setRoads, 
    setBridges, 
    userGeolocation, 
    dhmStations,
    dorClosures,
    dorBridges,
    dorSummary,
    dorLoading,
    dorDataSource,
    dorDemoMode,
    setDorDemoMode,
    responderProfile,
    setResponderProfile,
    communityRoadReports,
    refreshDorRoads,
    governmentHospitals,
    facilities
  } = useAppState();
  
  const { theme } = useTheme();
  
  // Starting location defaults to "Current Location"
  const [startLoc, setStartLoc] = useState('Current Location');
  const [endLoc, setEndLoc] = useState('Pokhara');
  
  const [calculatedRoutes, setCalculatedRoutes] = useState<RouteAlternative[]>([]);
  const [disasterEvaluations, setDisasterEvaluations] = useState<DisasterAwareRouteEvaluation[]>([]);
  const [aiExplanation, setAiExplanation] = useState<string>('');
  const [isExplaining, setIsExplaining] = useState(false);
  const [routesList, setRoutesList] = useState<any[]>([]);
  const [isFetchingRoute, setIsFetchingRoute] = useState(false);
  const [activeRouteIndex, setActiveRouteIndex] = useState(0);
  const [routingProvider, setRoutingProvider] = useState<string>('Nepal Highway Network & DOR Intelligence');
  const [mapLayer, setMapLayer] = useState<'streets' | 'topo'>('streets');
  
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [demoScenario, setDemoScenario] = useState(0);
  const [gpsAcquired, setGpsAcquired] = useState(false);
  const [selectedDorClosure, setSelectedDorClosure] = useState<any | null>(null);

  // Initialize mock data if store is empty
  useEffect(() => {
    if (roads.length === 0) setRoads(MOCK_ROADS);
    if (bridges.length === 0) setBridges(MOCK_BRIDGES);
  }, [roads.length, bridges.length, setRoads, setBridges]);

  // Track geolocation state
  useEffect(() => {
    if (userGeolocation?.lat && userGeolocation?.lng) {
      setGpsAcquired(true);
    }
  }, [userGeolocation]);

  // Resolve actual coordinates for start & end
  const startCoordinates = useMemo((): { lat: number; lng: number } => {
    if (startLoc === 'Current Location') {
      if (userGeolocation?.lat && userGeolocation?.lng) {
        return { lat: userGeolocation.lat, lng: userGeolocation.lng };
      }
      return { lat: 27.7172, lng: 85.3240 };
    }
    return CITIES[startLoc] || { lat: 27.7172, lng: 85.3240 };
  }, [startLoc, userGeolocation]);

  const endCoordinates = useMemo((): { lat: number; lng: number } => {
    if (endLoc === 'Current Location') {
      if (userGeolocation?.lat && userGeolocation?.lng) {
        return { lat: userGeolocation.lat, lng: userGeolocation.lng };
      }
      return { lat: 28.2096, lng: 83.9856 };
    }
    return CITIES[endLoc] || { lat: 28.2096, lng: 83.9856 };
  }, [endLoc, userGeolocation]);

  // Find closest city name for graph matching
  const getClosestCity = (lat: number, lng: number): string => {
    let closest = 'Kathmandu';
    let minDist = Infinity;
    Object.entries(CITIES).forEach(([name, c]) => {
      const dist = Math.hypot(c.lat - lat, c.lng - lng);
      if (dist < minDist) {
        minDist = dist;
        closest = name;
      }
    });
    return closest;
  };

  // Perform Disaster-Aware Route Evaluation combining DOR, DHM, Weather, and Community reports
  const runRouteAnalysis = useCallback(async () => {
    const startCity = startLoc === 'Current Location' ? getClosestCity(startCoordinates.lat, startCoordinates.lng) : startLoc;
    const endCity = endLoc === 'Current Location' ? getClosestCity(endCoordinates.lat, endCoordinates.lng) : endLoc;

    // 1. Core DOR Disaster-Aware Multi-Factor Evaluation
    const evals = evaluateDisasterAwareRoutes({
      origin: { lat: startCoordinates.lat, lng: startCoordinates.lng, name: startCity },
      destination: { lat: endCoordinates.lat, lng: endCoordinates.lng, name: endCity },
      dorClosures,
      dorBridges,
      dorLinks: [],
      dhmStations: dhmStations || [],
      responderMode: responderProfile,
      isDemoScenario: dorDemoMode
    });
    setDisasterEvaluations(evals);

    // 2. Classical route alternative fallback
    const alts = calculateRoutes(startCity, endCity, roads, bridges);
    setCalculatedRoutes(alts);

    // 3. Fetch turn-by-turn routing coordinates
    setIsFetchingRoute(true);
    try {
      const res = await fetch('/api/routes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          origin: startCoordinates, 
          destination: endCoordinates 
        })
      });
      
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.data && data.data.length > 0) {
          setRoutesList(data.data);
          setActiveRouteIndex(0);
          if (data.data[0]?.provider) {
            setRoutingProvider(data.data[0].provider);
          }
        }
      }
    } catch (e) {
      console.error('Failed to calculate turn-by-turn routes:', e);
    } finally {
      setIsFetchingRoute(false);
    }

    // 4. Generate AI explanation based strictly on retrieved DOR & DHM facts
    if (evals.length > 0) {
      setIsExplaining(true);
      try {
        const rec = evals[0];
        const others = evals.slice(1);
        const expRes = await fetch('/api/dor/ai-route-explanation', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            recommendedRoute: rec,
            alternativeRoutes: others,
            responderMode: responderProfile,
            originName: startCity,
            destinationName: endCity
          })
        });
        if (expRes.ok) {
          const expData = await expRes.json();
          if (expData.aiExplanation) {
            setAiExplanation(expData.aiExplanation);
          }
        }
      } catch (err) {
        console.warn('AI explanation request failed:', err);
      } finally {
        setIsExplaining(false);
      }
    }
  }, [
    startLoc, 
    endLoc, 
    startCoordinates, 
    endCoordinates, 
    dorClosures, 
    dorBridges, 
    dhmStations, 
    communityRoadReports, 
    responderProfile, 
    roads, 
    bridges
  ]);

  useEffect(() => {
    runRouteAnalysis();
  }, [runRouteAnalysis]);

  const requestGps = () => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        () => {
          setGpsAcquired(true);
          setStartLoc('Current Location');
        },
        (err) => {
          console.warn('GPS prompt error:', err);
        },
        { enableHighAccuracy: true, timeout: 8000 }
      );
    }
  };

  const swapLocations = () => {
    const temp = startLoc;
    setStartLoc(endLoc);
    setEndLoc(temp);
  };

  // Route to Nearest Safe Hospital
  const routeToNearestHospital = () => {
    const operationalHosp = governmentHospitals.find(h => (h.availableBeds || 0) > 5) || facilities.find(f => f.type === 'Hospital');
    if (operationalHosp) {
      const cityName = operationalHosp.district || operationalHosp.location?.split(',')[0] || 'Kathmandu';
      if (CITIES[cityName]) {
        setEndLoc(cityName);
      } else {
        setEndLoc('Kathmandu');
      }
    } else {
      setEndLoc('Kathmandu');
    }
  };

  // Route to Nearest Emergency Shelter
  const routeToNearestShelter = () => {
    const shelter = facilities.find(f => f.type === 'Shelter');
    if (shelter) {
      const cityName = shelter.location?.split(',')[0] || 'Chitwan';
      if (CITIES[cityName]) {
        setEndLoc(cityName);
      } else {
        setEndLoc('Chitwan');
      }
    } else {
      setEndLoc('Chitwan');
    }
  };

  // Scenario Simulation
  const applyDemoScenario = (scenario: number) => {
    setDemoScenario(scenario);
    if (scenario === 0) {
      setDorDemoMode(false);
      refreshDorRoads();
    } else if (scenario === 1) {
      // Mugling-Narayanghat Landslide
      setDorDemoMode(true);
      let newRoads = roads.map(r => 
        r.name.includes('Prithvi') || r.id === 'rd-3'
          ? { ...r, status: 'BLOCKED' as const, condition: 'Debris Flow & Massive Landslide at Chainage 18+200', hazards: ['Active Rockfall', 'Total Blockage'] }
          : r
      );
      setRoads(newRoads);
    } else if (scenario === 2) {
      // Narayani & Trishuli Flood Surge
      setDorDemoMode(true);
      let newBridges = bridges.map(b => 
        b.name.includes('Narayani') || b.id === 'br-1'
          ? { ...b, status: 'BLOCKED' as const, condition: 'Flood Surge Above Danger Level - Structural Threat', hazards: ['Water 1.8m Above Deck', 'Pier Scour'] }
          : b
      );
      setBridges(newBridges);
    }
  };

  const activeRoute = routesList[activeRouteIndex];

  const pathLatLngs = useMemo((): { lat: number; lng: number }[] => {
    if (!activeRoute?.coordinates) return [];
    return activeRoute.coordinates.map((c: any) => {
      if (Array.isArray(c)) return { lat: c[0], lng: c[1] };
      return { lat: c.lat, lng: c.lng };
    });
  }, [activeRoute?.coordinates]);

  // Assess River Flood Hazards along route using DHM river station network
  const routeRiverAssessment = useMemo(() => {
    if (pathLatLngs.length === 0 || !dhmStations || dhmStations.length === 0) return null;
    return DhmHydrologyService.assessRouteRiverRisks(pathLatLngs, dhmStations, 12);
  }, [pathLatLngs, dhmStations]);

  const activeRouteCoords = activeRoute?.latlngs as [number, number][] | undefined;

  const tileUrl = mapLayer === 'topo'
    ? 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png'
    : (theme === 'dark' ? '/api/galli-tiles/dark/{z}/{x}/{y}.png' : '/api/galli-tiles/light/{z}/{x}/{y}.png');

  const recommendedDisasterRoute = disasterEvaluations[0];

  return (
    <div className="p-3 sm:p-5 lg:p-6 space-y-4 max-w-[1700px] mx-auto min-h-[calc(100vh-4rem)] flex flex-col">
      
      {/* 1. TOP INTELLIGENCE BAR: DEPARTMENT OF ROADS (DOR) NAVIGATE INTEGRATION */}
      <div className="bg-slate-900 text-white rounded-xl p-3.5 shadow-md border border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0 font-bold text-xs">
            DOR
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                Department of Roads (DOR) Navigate Integration
              </span>
              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-950 text-emerald-300 border border-emerald-800">
                ● Live 718 SRN Links
              </span>
              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-blue-950 text-blue-300 border border-blue-800">
                2,135 Bridges Monitored
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-0.5">
              Primary road condition feed cross-fused with DHM River Watch flood sensors and citizen road reports.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <div className="flex items-center gap-2 text-xs bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700">
            <span className="text-red-400 font-bold">{dorSummary?.activeRoadblocks || dorClosures.filter(c => c.sahayakStatus === 'BLOCKED').length}</span>
            <span className="text-slate-400">Active Blockages</span>
            <span className="text-slate-600">|</span>
            <span className="text-amber-400 font-bold">{dorSummary?.partialRestrictions || dorClosures.filter(c => c.sahayakStatus === 'RESTRICTED').length}</span>
            <span className="text-slate-400">Restrictions</span>
          </div>

          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => refreshDorRoads()} 
            disabled={dorLoading}
            className="h-8 text-xs gap-1.5 text-slate-200 border-slate-700 hover:bg-slate-800"
          >
            <RefreshCw className={cn("w-3.5 h-3.5", dorLoading && "animate-spin")} />
            <span>Sync DOR</span>
          </Button>

          <a 
            href="https://navigate.dor.gov.np/app/dashboard" 
            target="_blank" 
            rel="noreferrer" 
            className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center gap-1 font-medium bg-emerald-950/50 hover:bg-emerald-900/50 px-2.5 py-1.5 rounded-lg border border-emerald-800/60 transition-colors"
          >
            <span>DOR Portal</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>

      {/* 2. MAIN NAVIGATION CONTAINER */}
      <div className="flex-1 flex flex-col lg:flex-row gap-5 min-h-0">
        
        {/* LEFT PANEL: PLANNER, RESPONDER MODE, EVALUATIONS */}
        <div className="lg:w-[480px] shrink-0 flex flex-col h-auto lg:h-[calc(100vh-12.5rem)] space-y-3.5 overflow-hidden">
          
          {/* Planner Controls Card */}
          <Card className="shrink-0 p-4 shadow-sm border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
            
            {/* Responder Routing Profile Selector */}
            <div className="mb-3.5 pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                  <ShieldAlert className="w-3.5 h-3.5 text-indigo-500" />
                  Routing Priority Profile
                </span>
                <span className="text-[11px] text-slate-400">
                  {RESPONDER_MODES.find(m => m.id === responderProfile)?.label}
                </span>
              </div>
              <div className="grid grid-cols-5 gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
                {RESPONDER_MODES.map(mode => {
                  const IconComponent = mode.icon;
                  const isSelected = responderProfile === mode.id;
                  return (
                    <button
                      key={mode.id}
                      onClick={() => setResponderProfile(mode.id)}
                      title={mode.desc}
                      className={cn(
                        "flex flex-col items-center justify-center p-1.5 rounded-md text-[10px] font-medium transition-all text-center",
                        isSelected 
                          ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs font-bold"
                          : "text-slate-600 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-700/50"
                      )}
                    >
                      <IconComponent className="w-3.5 h-3.5 mb-0.5" />
                      <span className="truncate w-full">{mode.label.split(' ')[0]}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Quick Destination Routing (Hospital / Shelter) */}
            <div className="flex items-center gap-2 mb-3">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={routeToNearestHospital}
                className="flex-1 h-7 text-xs gap-1 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300"
              >
                <Building2 className="w-3 h-3 text-red-500" />
                <span>To Safe Hospital</span>
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={routeToNearestShelter}
                className="flex-1 h-7 text-xs gap-1 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300"
              >
                <Building2 className="w-3 h-3 text-blue-500" />
                <span>To Relief Shelter</span>
              </Button>
            </div>

            {/* Origin & Destination Inputs */}
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-6 flex flex-col items-center gap-1">
                  <div className="w-3 h-3 rounded-full border-2 border-emerald-500 bg-emerald-500/20 animate-pulse"></div>
                  <div className="w-0.5 h-8 bg-slate-200 dark:bg-slate-700"></div>
                  <MapPin className="w-4 h-4 text-red-500" />
                </div>
                
                <div className="flex-1 space-y-2">
                  {/* Origin */}
                  <div>
                    <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block mb-0.5">
                      Starting Corridor
                    </label>
                    <select 
                      className="w-full p-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-medium text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500" 
                      value={startLoc} 
                      onChange={e => setStartLoc(e.target.value)}
                    >
                      <option value="Current Location">
                        📍 Current Location {gpsAcquired ? `(GPS ${startCoordinates.lat.toFixed(2)}°, ${startCoordinates.lng.toFixed(2)}°)` : '(Detecting GPS...)'}
                      </option>
                      <option disabled>──────────</option>
                      {Object.keys(CITIES).map(city => (
                        <option key={`start-${city}`} value={city}>
                          {city} ({CITIES[city].region})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Destination */}
                  <div>
                    <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block mb-0.5">
                      Destination Corridor
                    </label>
                    <select 
                      className="w-full p-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-medium text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500" 
                      value={endLoc} 
                      onChange={e => setEndLoc(e.target.value)}
                    >
                      {Object.keys(CITIES).map(city => (
                        <option key={`end-${city}`} value={city}>
                          {city} ({CITIES[city].region})
                        </option>
                      ))}
                      <option value="Current Location">
                        📍 Current Location {gpsAcquired ? `(GPS ${endCoordinates.lat.toFixed(2)}°, ${endCoordinates.lng.toFixed(2)}°)` : ''}
                      </option>
                    </select>
                  </div>
                </div>

                <div className="flex flex-col justify-center">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={swapLocations} 
                    className="p-2 h-8 w-8 rounded-lg border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800"
                    title="Swap Origin and Destination"
                  >
                    <ArrowUpDown className="w-4 h-4 text-slate-600 dark:text-slate-300" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Demo Scenarios */}
            <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
              <span className="text-[11px] font-semibold text-slate-500">Test Scenarios:</span>
              <div className="flex gap-1">
                <Button 
                  size="sm" 
                  variant={demoScenario === 0 ? 'default' : 'ghost'} 
                  className="h-6 text-[11px] px-2"
                  onClick={() => applyDemoScenario(0)}
                >
                  Baseline
                </Button>
                <Button 
                  size="sm" 
                  variant={demoScenario === 1 ? 'default' : 'ghost'} 
                  className="h-6 text-[11px] px-2 text-amber-600 dark:text-amber-400"
                  onClick={() => applyDemoScenario(1)}
                >
                  Landslide
                </Button>
                <Button 
                  size="sm" 
                  variant={demoScenario === 2 ? 'default' : 'ghost'} 
                  className="h-6 text-[11px] px-2 text-blue-600 dark:text-blue-400"
                  onClick={() => applyDemoScenario(2)}
                >
                  River Flood
                </Button>
              </div>
            </div>
          </Card>

          {/* Route Alternatives & Evidence-Based AI Explanation */}
          <div className="flex-1 overflow-y-auto pr-1 space-y-3 pb-6">
            
            {/* SAFEST APPROPRIATE ROUTE AI RATIONALE */}
            {aiExplanation && (
              <div className="p-3.5 rounded-xl bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-indigo-950/40 dark:to-blue-950/40 border border-indigo-200 dark:border-indigo-800/70 shadow-xs">
                <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-700 dark:text-indigo-300 mb-1">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                  <span>Why This Route is Recommended:</span>
                </div>
                <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-normal">
                  {aiExplanation}
                </p>
                <div className="mt-2 text-[10px] text-indigo-600/80 dark:text-indigo-400/80 flex items-center gap-1 font-medium">
                  <Check className="w-3 h-3 text-emerald-500" />
                  <span>Cites live Department of Roads (DOR) and DHM River Watch hydrology</span>
                </div>
              </div>
            )}

            {/* ROUTE COMPARISON CARDS */}
            {disasterEvaluations.length > 0 ? (
              <div className="space-y-2.5">
                <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300 px-1">
                  <span>Evaluated Highway Corridors ({disasterEvaluations.length})</span>
                  <span className="text-[10px] font-medium text-slate-400">Ranked by Safety Index</span>
                </div>

                {disasterEvaluations.map((routeEval, idx) => {
                  const isSafest = routeEval.isRecommended;
                  const isBlocked = routeEval.dorRoadStatus === 'BLOCKED' || routeEval.overallRiskLevel === 'CRITICAL';
                  const isSelected = activeRouteIndex === idx;

                  return (
                    <div
                      key={routeEval.id || idx}
                      onClick={() => setActiveRouteIndex(idx)}
                      className={cn(
                        "p-3 rounded-xl border transition-all cursor-pointer text-xs",
                        isSelected
                          ? "ring-2 ring-indigo-500 border-indigo-400 bg-white dark:bg-slate-900 shadow-md"
                          : "border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/60 hover:border-slate-300 dark:hover:border-slate-700",
                        isSafest && "border-emerald-500/70 dark:border-emerald-700/70 bg-emerald-50/30 dark:bg-emerald-950/20"
                      )}
                    >
                      <div className="flex items-start justify-between gap-2 mb-1.5">
                        <div className="flex items-center gap-1.5">
                          {isSafest ? (
                            <Badge className="bg-emerald-600 text-white text-[10px] font-bold px-1.5 py-0.5">
                              SAFEST APPROPRIATE ROUTE
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-[10px]">
                              Alternative #{idx + 1}
                            </Badge>
                          )}
                          <span className="font-bold text-slate-900 dark:text-white">
                            {routeEval.name}
                          </span>
                        </div>
                        <Badge variant={isBlocked ? 'destructive' : routeEval.overallRiskLevel === 'HIGH' ? 'warning' : 'default'} className="text-[10px]">
                          {routeEval.overallRiskLevel} RISK
                        </Badge>
                      </div>

                      <div className="grid grid-cols-3 gap-2 py-1.5 my-1.5 border-y border-slate-100 dark:border-slate-800 text-[11px]">
                        <div>
                          <span className="text-slate-400 block text-[9px] uppercase">Distance</span>
                          <span className="font-semibold text-slate-700 dark:text-slate-300">{routeEval.distanceKm} km</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[9px] uppercase">Travel Time</span>
                          <span className="font-semibold text-slate-700 dark:text-slate-300">{routeEval.estimatedTimeMin} min</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[9px] uppercase">DOR Road Status</span>
                          <span className={cn(
                            "font-bold",
                            routeEval.dorRoadStatus === 'OPEN' ? "text-emerald-600" :
                            routeEval.dorRoadStatus === 'RESTRICTED' ? "text-orange-500" : "text-red-500"
                          )}>
                            {routeEval.dorRoadStatus}
                          </span>
                        </div>
                      </div>

                      <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-snug">
                        {routeEval.selectionReason}
                      </p>

                      {routeEval.warnings.length > 0 && (
                        <div className="mt-2 space-y-1">
                          {routeEval.warnings.map((w, wIdx) => (
                            <div key={wIdx} className="text-[10px] text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 p-1 rounded border border-amber-200 dark:border-amber-800/50 flex items-center gap-1">
                              <AlertCircle className="w-3 h-3 shrink-0 text-amber-500" />
                              <span>{w}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : null}

            {/* Turn-by-Turn Guidance Steps */}
            {activeRoute && (
              <Card className="p-3 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                <div className="flex items-center justify-between mb-2">
                  <h5 className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
                    <Compass className="w-3.5 h-3.5 text-indigo-500" />
                    Turn-by-Turn Waypoints
                  </h5>
                  <span className="text-[10px] text-slate-400">{formatDuration(activeRoute.duration)} • {(activeRoute.distance / 1000).toFixed(1)} km</span>
                </div>

                <div className="space-y-1.5 max-h-[160px] overflow-y-auto pr-1">
                  {activeRoute.steps && activeRoute.steps.length > 0 ? (
                    activeRoute.steps.slice(0, 8).map((step: any, sIdx: number) => (
                      <div key={sIdx} className="flex items-start gap-2 text-xs text-slate-700 dark:text-slate-300 py-1 border-b border-slate-100 dark:border-slate-800/60 last:border-0">
                        <span className="w-4 h-4 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 flex items-center justify-center font-bold text-[9px] shrink-0 mt-0.5">
                          {sIdx + 1}
                        </span>
                        <div className="flex-1">
                          <p className="font-medium text-[11px]">{step.instruction || step.name}</p>
                          {step.distance > 0 && (
                            <p className="text-[9px] text-slate-400">
                              {(step.distance / 1000).toFixed(1)} km ({Math.round(step.duration / 60)} min)
                            </p>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-xs text-slate-500 py-2 flex items-center gap-2">
                      <Navigation className="w-4 h-4 text-indigo-500 shrink-0" />
                      <span>Follow highlighted green highway corridor on the map.</span>
                    </div>
                  )}
                </div>
              </Card>
            )}

            {/* Community Road Reports Section */}
            <div className="pt-2">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Community & Responder Road Intel ({communityRoadReports.length})
                </span>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setIsReportModalOpen(true)}
                  className="h-6 text-[11px] gap-1 text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800"
                >
                  <FilePlus className="w-3 h-3" /> Report Condition
                </Button>
              </div>

              <div className="space-y-1.5 max-h-[160px] overflow-y-auto pr-1">
                {communityRoadReports.map(rep => (
                  <div key={rep.id} className="p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900 dark:text-slate-100">{rep.locationName}</span>
                      <span className={cn(
                        "text-[9px] font-bold px-1.5 py-0.5 rounded",
                        rep.sourceType === 'VERIFIED_RESPONDER' 
                          ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                          : "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
                      )}>
                        {rep.sourceType === 'VERIFIED_RESPONDER' ? 'VERIFIED RESPONDER' : 'CITIZEN REPORT'}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-1">
                      {rep.description}
                    </p>
                    <div className="text-[9px] text-slate-400 mt-1 flex justify-between">
                      <span>Passable: {rep.passableFor ? rep.passableFor.replace(/_/g, ' ') : (rep.issueType === 'ROAD_BLOCKED' ? 'None (Blocked)' : 'Caution Advised')}</span>
                      <span>By {rep.reporterName}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT PANEL: INTERACTIVE MAP VISUALIZATION */}
        <Card className="flex-1 flex flex-col h-[520px] lg:h-[calc(100vh-12.5rem)] min-h-[480px] p-0 overflow-hidden border-slate-200 dark:border-slate-800 shadow-md relative" noPadding>
          
          {/* Map Header Controls */}
          <div className="p-3 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-wrap gap-3 items-center justify-between shrink-0 z-10">
            <div className="flex items-center gap-3">
              <span className="flex items-center text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                <Navigation className="w-4 h-4 mr-1.5 text-indigo-500" /> DOR Highway Network & Disaster Awareness
              </span>
              <span className="text-xs text-slate-400 hidden sm:inline">|</span>
              <span className="text-xs text-slate-600 dark:text-slate-400 hidden sm:flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                {startLoc} → {endLoc}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <div className="bg-slate-100 dark:bg-slate-800 rounded-lg p-0.5 flex gap-1 text-xs">
                <button 
                  onClick={() => setMapLayer('streets')}
                  className={cn(
                    "px-2.5 py-1 rounded-md text-xs font-medium transition-all flex items-center gap-1",
                    mapLayer === 'streets' 
                      ? "bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-xs" 
                      : "text-slate-600 dark:text-slate-400"
                  )}
                >
                  <Layers className="w-3 h-3" /> Galli Map
                </button>
                <button 
                  onClick={() => setMapLayer('topo')}
                  className={cn(
                    "px-2.5 py-1 rounded-md text-xs font-medium transition-all flex items-center gap-1",
                    mapLayer === 'topo' 
                      ? "bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-xs" 
                      : "text-slate-600 dark:text-slate-400"
                  )}
                >
                  Terrain
                </button>
              </div>

              <Button 
                variant="outline" 
                size="sm" 
                onClick={requestGps} 
                className="h-7 text-xs px-2.5 gap-1 border-slate-200 dark:border-slate-800"
              >
                <Crosshair className="w-3.5 h-3.5 text-emerald-500" /> GPS
              </Button>
            </div>
          </div>

          {/* Leaflet Map Area */}
          <div className="flex-1 relative w-full h-full min-h-[450px] bg-slate-100 dark:bg-slate-950 overflow-hidden z-0">
            <MapContainer
              center={[startCoordinates.lat, startCoordinates.lng]}
              zoom={10}
              scrollWheelZoom={true}
              style={{ height: '100%', width: '100%', position: 'absolute', inset: 0 }}
              className="w-full h-full"
            >
              <TileLayer
                attribution='&copy; <a href="https://gallimaps.com" target="_blank" rel="noreferrer">Galli Maps</a> (Nepal) &copy; <a href="https://navigate.dor.gov.np">DOR Navigate</a>'
                url={tileUrl}
                maxZoom={18}
              />

              {/* View Controller */}
              <MapBoundsController 
                routeCoords={activeRouteCoords} 
                startCoords={[startCoordinates.lat, startCoordinates.lng]}
                endCoords={[endCoordinates.lat, endCoordinates.lng]}
              />

              {/* Highway Network Polylines */}
              {roads.map(road => {
                if (!road.geometry || road.geometry.length < 2) return null;
                const positions = road.geometry.map((g: any) => [g.lat, g.lng]);
                const statusColor = getRoadStatusColor(road.status);
                return (
                  <Polyline
                    key={`network-${road.id}`}
                    positions={positions}
                    pathOptions={{
                      color: statusColor,
                      weight: 5,
                      opacity: 0.7,
                      dashArray: road.status === 'RESTRICTED' ? '6, 6' : undefined
                    }}
                  >
                    <Tooltip sticky>
                      <div className="text-xs font-semibold">
                        {road.name} • <span style={{ color: statusColor }}>{road.status}</span>
                      </div>
                    </Tooltip>
                  </Polyline>
                );
              })}

              {/* Active Recommended Route Highlight */}
              {activeRouteCoords && activeRouteCoords.length > 0 && (
                <>
                  <Polyline
                    positions={activeRouteCoords}
                    pathOptions={{
                      color: '#065f46',
                      weight: 8,
                      opacity: 0.4
                    }}
                  />
                  <Polyline
                    positions={activeRouteCoords}
                    pathOptions={{
                      color: '#059669',
                      weight: 5,
                      opacity: 0.95
                    }}
                  >
                    <Tooltip sticky>
                      <div className="text-xs font-bold text-emerald-700">
                        Recommended Safest Route ({formatDuration(activeRoute.duration)})
                      </div>
                    </Tooltip>
                  </Polyline>
                </>
              )}

              {/* DOR Road Closures Markers */}
              {dorClosures.map((closure, idx) => {
                if (!closure.latitude || !closure.longitude) return null;
                return (
                  <Marker
                    key={`dor-closure-${closure.id || idx}`}
                    position={[closure.latitude, closure.longitude]}
                    icon={createDorClosureIcon(closure.sahayakStatus)}
                  >
                    <Popup>
                      <div className="p-1.5 text-xs max-w-xs space-y-1.5">
                        <div className="flex items-center justify-between gap-2 border-b pb-1">
                          <span className="font-bold text-slate-900">{closure.roadName}</span>
                          <span className={cn(
                            "px-1.5 py-0.2 rounded text-[10px] font-bold",
                            closure.sahayakStatus === 'BLOCKED' ? "bg-red-100 text-red-800" : "bg-orange-100 text-orange-800"
                          )}>
                            {closure.sahayakStatus}
                          </span>
                        </div>
                        <div className="text-slate-600 text-[11px]">
                          <strong>Reason:</strong> {closure.closureReason}
                        </div>
                        {closure.chainage && (
                          <div className="text-slate-500 text-[10px]">
                            <strong>Chainage:</strong> {closure.chainage} km
                          </div>
                        )}
                        <div className="text-slate-500 text-[10px]">
                          <strong>Repair ETA:</strong> {closure.repairEta}
                        </div>
                        {closure.contactPerson && (
                          <div className="text-slate-500 text-[10px]">
                            <strong>Contact:</strong> {closure.contactPerson}
                          </div>
                        )}
                        <div className="pt-1 text-[9px] text-emerald-700 font-semibold border-t">
                          Source: {closure.source} (DOR Navigate)
                        </div>
                      </div>
                    </Popup>
                  </Marker>
                );
              })}

              {/* DOR Bridges Markers */}
              {dorBridges.map((bridge, idx) => {
                if (!bridge.latitude || !bridge.longitude) return null;
                return (
                  <Marker
                    key={`dor-bridge-${bridge.id || idx}`}
                    position={[bridge.latitude, bridge.longitude]}
                    icon={createBridgeIcon(bridge.status)}
                  >
                    <Popup>
                      <div className="p-1.5 text-xs max-w-xs space-y-1">
                        <div className="font-bold text-slate-900">{bridge.bridgeName}</div>
                        <p className="text-slate-600 text-[11px]">River: {bridge.river} • {bridge.district}</p>
                        <p className="text-slate-500 text-[10px]">Length: {bridge.lengthMeters}m | Span: {bridge.spanLengthMeters}m</p>
                        <p className="text-[9px] text-blue-600 font-medium">Department of Roads Bridge Database</p>
                      </div>
                    </Popup>
                  </Marker>
                );
              })}

              {/* DHM River Flood Stations along Route */}
              {routeRiverAssessment?.affectedStations?.map((aff, idx) => {
                if (aff.station.latitude === null || aff.station.longitude === null) return null;
                return (
                  <Marker
                    key={`river-hazard-${aff.station.id}-${idx}`}
                    position={[aff.station.latitude, aff.station.longitude]}
                    icon={createRiverMarkerIcon(aff.threatLevel)}
                  >
                    <Popup>
                      <div className="p-1.5 text-xs max-w-xs">
                        <div className="font-bold text-slate-900 flex items-center gap-1.5">
                          <Waves className="w-3.5 h-3.5 text-blue-600" />
                          <span>{aff.station.name} (DHM Gauge)</span>
                        </div>
                        <div className="mt-1 text-[11px]">
                          Water: <strong>{aff.station.waterLevel}m</strong> (Danger: {aff.station.dangerLevel}m) • {aff.station.trend}
                        </div>
                        <p className="text-[10px] text-amber-800 bg-amber-50 p-1 rounded mt-1">
                          {aff.warningNote}
                        </p>
                      </div>
                    </Popup>
                  </Marker>
                );
              })}

              {/* Start & End Pins */}
              <Marker
                position={[startCoordinates.lat, startCoordinates.lng]}
                icon={createPinIcon('#10b981', 'A', startLoc === 'Current Location')}
              >
                <Popup>
                  <div className="p-1 text-xs">
                    <p className="font-bold text-emerald-700">Origin: {startLoc}</p>
                  </div>
                </Popup>
              </Marker>

              <Marker
                position={[endCoordinates.lat, endCoordinates.lng]}
                icon={createPinIcon('#ef4444', 'B')}
              >
                <Popup>
                  <div className="p-1 text-xs">
                    <p className="font-bold text-red-700">Destination: {endLoc}</p>
                  </div>
                </Popup>
              </Marker>
            </MapContainer>

            {/* Map Legend Overlay */}
            <div className="absolute bottom-3.5 left-3.5 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md px-3.5 py-2.5 rounded-lg border border-slate-200/90 dark:border-slate-800/90 shadow-lg text-[11px] space-y-1.5 z-[400] pointer-events-auto max-w-[260px]">
              <div className="font-bold text-slate-800 dark:text-slate-200 mb-1 text-[10px] uppercase tracking-wider">
                DOR & Disaster Route Legend
              </div>
              <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-[11px]">
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-1.5 rounded-full bg-emerald-500 shrink-0"></span>
                  <span className="text-slate-700 dark:text-slate-300">Open Highway</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-1.5 rounded-full bg-orange-500 shrink-0"></span>
                  <span className="text-slate-700 dark:text-slate-300">Restricted</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-1.5 rounded-full bg-red-500 shrink-0"></span>
                  <span className="text-slate-700 dark:text-slate-300">Blocked</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs">🌊</span>
                  <span className="text-slate-700 dark:text-slate-300">River Gauge</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs">🌉</span>
                  <span className="text-slate-700 dark:text-slate-300">DOR Bridge</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3.5 h-1 bg-emerald-600 rounded shrink-0"></span>
                  <span className="text-slate-700 dark:text-slate-300">Safest Route</span>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* REPORT MODAL */}
      <ReportRoadModal 
        isOpen={isReportModalOpen} 
        onClose={() => setIsReportModalOpen(false)} 
      />
    </div>
  );
}
