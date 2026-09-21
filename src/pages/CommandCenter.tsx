import React, { useState, useEffect, useMemo } from 'react';
import { Card, Badge, Button, BaseMap } from '@/components/ui';
import { 
  RadioTower, Users, ShieldAlert, Activity, Eye, Maximize2, Stethoscope, 
  Navigation, Package, Bot, Sparkles, Send, CheckCircle2, AlertTriangle, 
  XCircle, Flame, Truck, Tent, Layers, Search, Filter, ExternalLink, 
  RefreshCw, Phone, MapPin, SlidersHorizontal, ChevronRight, Info, Plane,
  Volume2, Compass, AlertCircle
} from 'lucide-react';
import { useAppState } from '@/lib/store';
import { calculatePriorityScore } from '@/lib/calculations';
import { cn } from '@/lib/utils';
import { Marker, Popup, Polyline, Circle } from 'react-leaflet';
import L from 'leaflet';
import { 
  BipadHelipad, 
  BipadEvacuationCenter, 
  BipadCommunicationChannel, 
  BipadWarehouse, 
  BipadFireApparatus, 
  CommandCenterDataPayload, 
  CommandCenterAIGuidance 
} from '@/types';
import { fetchCommandCenterResources, requestCommandCenterAiGuidance } from '@/lib/bipadCapacityService';

// PROVINCE CENTROIDS FOR QUICK FOCUS
const PROVINCE_VIEWPORTS: Record<string, { center: [number, number]; zoom: number; label: string }> = {
  ALL: { center: [28.2000, 84.1240], zoom: 7, label: 'All Nepal (National)' },
  Koshi: { center: [27.0500, 87.3500], zoom: 8, label: 'Koshi Province' },
  Madhesh: { center: [26.8500, 85.9000], zoom: 8, label: 'Madhesh Province' },
  Bagmati: { center: [27.7500, 85.3500], zoom: 9, label: 'Bagmati Province' },
  Gandaki: { center: [28.3000, 84.1000], zoom: 8, label: 'Gandaki Province' },
  Lumbini: { center: [27.8000, 83.2000], zoom: 8, label: 'Lumbini Province' },
  Karnali: { center: [29.1000, 82.2000], zoom: 8, label: 'Karnali Province' },
  Sudurpashchim: { center: [29.2000, 80.8000], zoom: 8, label: 'Sudurpashchim' },
};

// TACTICAL MARKER ICONS
const createHelipadIcon = (status: string) => {
  const bg = status === 'OPERATIONAL' ? '#10b981' : status === 'WEATHER_ALERT' ? '#f59e0b' : '#ef4444';
  const glow = status === 'OPERATIONAL' ? 'rgba(16, 185, 129, 0.5)' : status === 'WEATHER_ALERT' ? 'rgba(245, 158, 11, 0.5)' : 'rgba(239, 68, 68, 0.6)';
  return L.divIcon({
    className: 'bg-transparent border-0',
    html: `<div style="background-color: ${bg}; width: 28px; height: 28px; border-radius: 8px; border: 2px solid white; display: flex; align-items: center; justify-content: center; font-size: 14px; box-shadow: 0 0 10px ${glow}; font-weight: bold; color: white;">🚁</div>`,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
  });
};

const createEvacuationIcon = (status: string, isOpenspace: boolean) => {
  const bg = isOpenspace ? '#8b5cf6' : status === 'AVAILABLE' ? '#10b981' : status === 'NEAR_CAPACITY' ? '#f59e0b' : '#dc2626';
  const symbol = isOpenspace ? '🏕️' : '⛺';
  return L.divIcon({
    className: 'bg-transparent border-0',
    html: `<div style="background-color: ${bg}; width: 28px; height: 28px; border-radius: 8px; border: 2px solid white; display: flex; align-items: center; justify-content: center; font-size: 14px; box-shadow: 0 2px 8px rgba(0,0,0,0.6); color: white;">${symbol}</div>`,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
  });
};

const createCommunicationIcon = (status: string) => {
  const bg = status === 'WORKING' ? '#059669' : status === 'DEGRADED' ? '#d97706' : '#b91c1c';
  const pulse = status === 'DOWN' ? 'animation: pulse 1.5s infinite;' : '';
  return L.divIcon({
    className: 'bg-transparent border-0',
    html: `<div style="background-color: ${bg}; width: 26px; height: 26px; border-radius: 50%; border: 2px solid white; display: flex; align-items: center; justify-content: center; font-size: 13px; box-shadow: 0 0 10px ${bg}; ${pulse} color: white;">📡</div>`,
    iconSize: [26, 26],
    iconAnchor: [13, 13],
  });
};

const createWarehouseIcon = () => {
  return L.divIcon({
    className: 'bg-transparent border-0',
    html: `<div style="background-color: #ea580c; width: 24px; height: 24px; border-radius: 6px; border: 2px solid white; display: flex; align-items: center; justify-content: center; font-size: 12px; box-shadow: 0 2px 6px rgba(0,0,0,0.6); color: white;">📦</div>`,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  });
};

const createMachineryIcon = () => {
  return L.divIcon({
    className: 'bg-transparent border-0',
    html: `<div style="background-color: #2563eb; width: 24px; height: 24px; border-radius: 6px; border: 2px solid white; display: flex; align-items: center; justify-content: center; font-size: 12px; box-shadow: 0 2px 6px rgba(0,0,0,0.6); color: white;">🚜</div>`,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  });
};

const createDorHazardIcon = (status: string) => {
  const bg = status === 'BLOCKED' ? '#dc2626' : '#ea580c';
  return L.divIcon({
    className: 'bg-transparent border-0',
    html: `<div style="background-color: ${bg}; width: 24px; height: 24px; border-radius: 6px; border: 2px solid white; display: flex; align-items: center; justify-content: center; font-size: 12px; box-shadow: 0 2px 6px rgba(0,0,0,0.5);">${status === 'BLOCKED' ? '⛔' : '⚠️'}</div>`,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  });
};

const createIncidentIcon = (score: number) => {
  const color = score >= 75 ? '#ef4444' : '#f97316';
  return L.divIcon({
    className: 'bg-transparent border-0',
    html: `<div style="background-color: ${color}; width: 18px; height: 18px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 10px ${color}; animation: pulse 2s infinite;"></div>`,
    iconSize: [18, 18],
    iconAnchor: [9, 9],
  });
};

export function CommandCenter() {
  const { 
    incidents, 
    locations, 
    currentLocation,
    fusedWeather, 
    roads, 
    bridges,
    dorClosures,
    liveNews,
    governmentHospitals
  } = useAppState();

  // BIPAD Portal Capacity & Resources state
  const [bipadData, setBipadData] = useState<CommandCenterDataPayload | null>(null);
  const [bipadLoading, setBipadLoading] = useState<boolean>(true);
  const [selectedProvince, setSelectedProvince] = useState<string>('ALL');
  const [selectedDistrict, setSelectedDistrict] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  // Tactical Map Layers
  const [activeLayers, setActiveLayers] = useState({
    helipads: true,
    evacuation: true,
    communications: true,
    warehouses: true,
    machinery: true,
    dorRoads: true,
    incidents: true,
  });

  // Map Viewport state
  const [mapCenter, setMapCenter] = useState<[number, number]>([28.2000, 84.1240]);
  const [mapZoom, setMapZoom] = useState<number>(7);

  // Selected Resource for detail inspector modal/drawer
  const [inspectedResource, setInspectedResource] = useState<{
    type: 'helipad' | 'evac' | 'comm' | 'warehouse' | 'machinery';
    data: any;
  } | null>(null);

  // Active Center Console Tab
  const [activeTab, setActiveTab] = useState<'ai' | 'comms' | 'helipads' | 'evacuation' | 'warehouses'>('ai');

  // AI Tactical Commander state
  const [aiGuidance, setAiGuidance] = useState<CommandCenterAIGuidance | null>(null);
  const [aiLoading, setAiLoading] = useState<boolean>(false);
  const [userAiQuestion, setUserAiQuestion] = useState<string>('');
  const [aiChatHistory, setAiChatHistory] = useState<Array<{ role: 'user' | 'assistant'; text: string; time: string }>>([]);

  // Fetch BIPAD Resources on mount
  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      setBipadLoading(true);
      const data = await fetchCommandCenterResources();
      if (isMounted) {
        setBipadData(data);
        setBipadLoading(false);
      }
    }
    loadData();
    return () => { isMounted = false; };
  }, []);

  // Filtered resources based on province and search
  const filteredHelipads = useMemo(() => {
    if (!bipadData) return [];
    return bipadData.helipads.filter(h => {
      const matchProv = selectedProvince === 'ALL' || h.province === selectedProvince;
      const matchDist = selectedDistrict === 'ALL' || h.district === selectedDistrict;
      const matchQ = !searchQuery || h.title.toLowerCase().includes(searchQuery.toLowerCase()) || h.district.toLowerCase().includes(searchQuery.toLowerCase());
      return matchProv && matchDist && matchQ;
    });
  }, [bipadData, selectedProvince, selectedDistrict, searchQuery]);

  const filteredEvacuation = useMemo(() => {
    if (!bipadData) return [];
    return bipadData.evacuationCenters.filter(e => {
      const matchProv = selectedProvince === 'ALL' || e.province === selectedProvince;
      const matchDist = selectedDistrict === 'ALL' || e.district === selectedDistrict;
      const matchQ = !searchQuery || e.title.toLowerCase().includes(searchQuery.toLowerCase()) || e.district.toLowerCase().includes(searchQuery.toLowerCase());
      return matchProv && matchDist && matchQ;
    });
  }, [bipadData, selectedProvince, selectedDistrict, searchQuery]);

  const filteredCommunications = useMemo(() => {
    if (!bipadData) return [];
    return bipadData.communications.filter(c => {
      const matchProv = selectedProvince === 'ALL' || c.province === selectedProvince;
      const matchDist = selectedDistrict === 'ALL' || c.district === selectedDistrict;
      const matchQ = !searchQuery || c.title.toLowerCase().includes(searchQuery.toLowerCase()) || c.operator.toLowerCase().includes(searchQuery.toLowerCase()) || c.district.toLowerCase().includes(searchQuery.toLowerCase());
      return matchProv && matchDist && matchQ;
    });
  }, [bipadData, selectedProvince, selectedDistrict, searchQuery]);

  const filteredWarehouses = useMemo(() => {
    if (!bipadData) return [];
    return bipadData.warehouses.filter(w => {
      const matchProv = selectedProvince === 'ALL' || w.province === selectedProvince;
      const matchDist = selectedDistrict === 'ALL' || w.district === selectedDistrict;
      const matchQ = !searchQuery || w.title.toLowerCase().includes(searchQuery.toLowerCase()) || w.district.toLowerCase().includes(searchQuery.toLowerCase());
      return matchProv && matchDist && matchQ;
    });
  }, [bipadData, selectedProvince, selectedDistrict, searchQuery]);

  const filteredMachinery = useMemo(() => {
    if (!bipadData) return [];
    return bipadData.fireApparatus.filter(m => {
      const matchProv = selectedProvince === 'ALL' || m.province === selectedProvince;
      const matchDist = selectedDistrict === 'ALL' || m.district === selectedDistrict;
      const matchQ = !searchQuery || m.title.toLowerCase().includes(searchQuery.toLowerCase()) || m.equipmentType.toLowerCase().includes(searchQuery.toLowerCase());
      return matchProv && matchDist && matchQ;
    });
  }, [bipadData, selectedProvince, selectedDistrict, searchQuery]);

  // Communications Sub-filters
  const [commStatusFilter, setCommStatusFilter] = useState<'ALL' | 'WORKING' | 'DOWN' | 'DEGRADED'>('ALL');
  const visibleCommunications = useMemo(() => {
    if (commStatusFilter === 'ALL') return filteredCommunications;
    return filteredCommunications.filter(c => c.status === commStatusFilter);
  }, [filteredCommunications, commStatusFilter]);

  // Helipads Sub-filters
  const [helipadStatusFilter, setHelipadStatusFilter] = useState<'ALL' | 'OPERATIONAL' | 'WEATHER_ALERT' | 'RESTRICTED'>('ALL');
  const visibleHelipads = useMemo(() => {
    if (helipadStatusFilter === 'ALL') return filteredHelipads;
    return filteredHelipads.filter(h => h.status === helipadStatusFilter);
  }, [filteredHelipads, helipadStatusFilter]);

  // Evacuation Sub-filters
  const [evacTypeFilter, setEvacTypeFilter] = useState<'ALL' | 'OPEN_SPACE' | 'SHELTER'>('ALL');
  const visibleEvacuation = useMemo(() => {
    if (evacTypeFilter === 'OPEN_SPACE') return filteredEvacuation.filter(e => e.type === 'HUMANITARIAN_OPEN_SPACE');
    if (evacTypeFilter === 'SHELTER') return filteredEvacuation.filter(e => e.type === 'EVACUATION_CENTRE');
    return filteredEvacuation;
  }, [filteredEvacuation, evacTypeFilter]);

  // Handler to trigger AI Guidance analysis
  const handleTriggerAiAnalysis = async (queryText?: string) => {
    const question = queryText || userAiQuestion || 'Generate strategic operational SitRep and immediate tactical directives';
    setAiLoading(true);

    const blocked = (dorClosures || []).filter(c => c.sahayakStatus === 'BLOCKED').map(c => `${c.roadName}: ${c.closureReason}`);
    const downCommsList = (bipadData?.communications || []).filter(c => c.status === 'DOWN').map(c => `${c.operator} in ${c.district} (${c.outageReason || 'outage'})`);
    const critIncidents = incidents.filter(i => calculatePriorityScore(i) >= 75).map(i => i.title);

    const guidance = await requestCommandCenterAiGuidance(question, {
      selectedProvince: selectedProvince !== 'ALL' ? selectedProvince : undefined,
      selectedDistrict: selectedDistrict !== 'ALL' ? selectedDistrict : undefined,
      activeIncidentsCount: incidents.length,
      criticalIncidents: critIncidents,
      blockedRoads: blocked,
      downCommunications: downCommsList,
      operationalHelipadsCount: filteredHelipads.filter(h => h.status === 'OPERATIONAL').length,
      availableEvacuationCapacity: filteredEvacuation.reduce((sum, e) => sum + e.availableCapacity, 0),
      totalShelteredCount: filteredEvacuation.reduce((sum, e) => sum + e.currentOccupancy, 0),
    });

    setAiGuidance(guidance);
    setAiLoading(false);

    if (queryText || userAiQuestion) {
      setAiChatHistory(prev => [
        ...prev,
        { role: 'user', text: question, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) },
        { role: 'assistant', text: guidance.sitrep, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }
      ]);
      setUserAiQuestion('');
    }
  };

  // Trigger initial AI SitRep once data is ready
  useEffect(() => {
    if (bipadData && !aiGuidance) {
      handleTriggerAiAnalysis('Generate initial strategic SitRep and immediate prioritized directives');
    }
  }, [bipadData]);

  // Handle Province quick focus
  const handleProvinceSelect = (prov: string) => {
    setSelectedProvince(prov);
    setSelectedDistrict('ALL');
    const viewport = PROVINCE_VIEWPORTS[prov] || PROVINCE_VIEWPORTS.ALL;
    setMapCenter(viewport.center);
    setMapZoom(viewport.zoom);
  };

  // Fly to specific coordinates on map
  const handleFocusResource = (lat: number, lng: number, zoomLevel = 13) => {
    setMapCenter([lat, lng]);
    setMapZoom(zoomLevel);
  };

  const toggleLayer = (layer: keyof typeof activeLayers) => {
    setActiveLayers(prev => ({ ...prev, [layer]: !prev[layer] }));
  };

  const totals = bipadData?.totals || {
    helipads: 60,
    operationalHelipads: 43,
    evacuationCenters: 120,
    totalEvacuationCapacity: 301050,
    currentEvacueesSheltered: 118538,
    availableEvacuationSlots: 182512,
    communicationChannels: 60,
    workingCommunications: 36,
    downCommunications: 12,
    degradedCommunications: 12,
    warehouses: 60,
    fireApparatusAndMachinery: 60
  };

  return (
    <div id="command-center-root" className="h-[calc(100vh-4rem)] flex flex-col bg-slate-950 text-slate-100 overflow-hidden select-none">
      
      {/* COMMAND CENTER MASTER HEADER */}
      <header id="command-center-header" className="h-16 bg-slate-900 border-b border-slate-800 flex items-center justify-between px-4 sm:px-6 shrink-0 shadow-xl z-20">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-red-600/20 border border-red-500/40 flex items-center justify-center">
            <RadioTower className="h-5 w-5 text-red-500 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-black tracking-wider uppercase text-white flex items-center gap-2">
                Nepal Strategic Command Center
              </h1>
              <Badge variant="critical" className="bg-red-600/90 text-[10px] text-white px-2 py-0.5 border-transparent uppercase font-bold tracking-widest shadow-sm">
                RESTRICTED EOC
              </Badge>
            </div>
            <p className="text-[11px] text-slate-400 flex items-center gap-1.5">
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Live Telemetry: <span className="text-slate-300 font-semibold">NDRRMA BIPAD Portal</span>
              <a 
                href="https://bipadportal.gov.np/risk-info/#/capacity-and-resources" 
                target="_blank" 
                rel="noreferrer"
                className="text-blue-400 hover:text-blue-300 inline-flex items-center ml-1"
                title="Open Official BIPAD Portal Capacity & Resources in new tab"
              >
                bipadportal.gov.np <ExternalLink className="h-2.5 w-2.5 ml-0.5" />
              </a>
            </p>
          </div>
        </div>

        {/* PROVINCE SWITCHER & STATS TICKER */}
        <div className="hidden lg:flex items-center gap-2">
          <div className="bg-slate-950 border border-slate-800 rounded-lg p-1 flex items-center gap-1 text-xs">
            {Object.keys(PROVINCE_VIEWPORTS).map(prov => (
              <button
                key={prov}
                id={`prov-btn-${prov}`}
                onClick={() => handleProvinceSelect(prov)}
                className={cn(
                  "px-2.5 py-1 rounded text-xs font-semibold transition-all",
                  selectedProvince === prov 
                    ? "bg-blue-600 text-white shadow-sm" 
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-800"
                )}
              >
                {prov === 'ALL' ? '🇳🇵 All Nepal' : prov}
              </button>
            ))}
          </div>

          <Button
            size="sm"
            onClick={() => handleTriggerAiAnalysis()}
            className="bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs gap-1.5 shadow-lg shadow-purple-900/30"
          >
            <Bot className="h-4 w-4" /> AI Tactical Briefing
          </Button>
        </div>
      </header>

      {/* STRATEGIC NATIONAL METRICS BANNER */}
      <div id="command-center-metrics-banner" className="bg-slate-900/80 border-b border-slate-800/80 px-4 py-2 flex items-center justify-between overflow-x-auto gap-4 text-xs shrink-0">
        <div className="flex items-center gap-6 min-w-max">
          {/* Communications Metric */}
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-blue-900/40 border border-blue-700/50 flex items-center justify-center text-blue-400">
              <RadioTower className="h-3.5 w-3.5" />
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-semibold">Communications Grid</span>
              <div className="flex items-center gap-1.5 font-bold">
                <span className="text-emerald-400">{totals.workingCommunications} Working</span>
                <span className="text-slate-600">/</span>
                <span className="text-red-400">{totals.downCommunications} Down</span>
                <span className="text-slate-600">/</span>
                <span className="text-amber-400">{totals.degradedCommunications} Degraded</span>
              </div>
            </div>
          </div>

          <div className="h-6 w-px bg-slate-800"></div>

          {/* Helipads Metric */}
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-emerald-900/40 border border-emerald-700/50 flex items-center justify-center text-emerald-400">
              <Plane className="h-3.5 w-3.5" />
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-semibold">Air Assets & Helipads</span>
              <div className="flex items-center gap-1.5 font-bold">
                <span className="text-emerald-400">{totals.operationalHelipads} Ready</span>
                <span className="text-slate-600">/</span>
                <span className="text-amber-400">{totals.helipads - totals.operationalHelipads} Weather Watch</span>
                <span className="text-slate-500 font-normal">({totals.helipads} Total)</span>
              </div>
            </div>
          </div>

          <div className="h-6 w-px bg-slate-800"></div>

          {/* Evacuation Centers Metric */}
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-purple-900/40 border border-purple-700/50 flex items-center justify-center text-purple-400">
              <Tent className="h-3.5 w-3.5" />
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-semibold">Evacuation & Open Spaces</span>
              <div className="flex items-center gap-1.5 font-bold">
                <span className="text-emerald-400">{totals.availableEvacuationSlots.toLocaleString()} Slots Ready</span>
                <span className="text-slate-600">/</span>
                <span className="text-slate-400">{totals.currentEvacueesSheltered.toLocaleString()} Sheltered</span>
              </div>
            </div>
          </div>

          <div className="h-6 w-px bg-slate-800"></div>

          {/* Emergency Warehouses & Machinery */}
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-amber-900/40 border border-amber-700/50 flex items-center justify-center text-amber-400">
              <Package className="h-3.5 w-3.5" />
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-semibold">Prepositioned Logistics</span>
              <div className="flex items-center gap-1.5 font-bold">
                <span className="text-amber-400">{totals.warehouses} DAO Warehouses</span>
                <span className="text-slate-600">/</span>
                <span className="text-blue-400">{totals.fireApparatusAndMachinery} Heavy Machines</span>
              </div>
            </div>
          </div>

          <div className="h-6 w-px bg-slate-800"></div>

          {/* Road Closures */}
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-red-900/40 border border-red-700/50 flex items-center justify-center text-red-400">
              <Navigation className="h-3.5 w-3.5" />
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-semibold">DOR Highway Closures</span>
              <div className="flex items-center gap-1.5 font-bold">
                <span className="text-red-400">
                  {(dorClosures || []).filter(c => c.sahayakStatus === 'BLOCKED').length} Arterial Blocks
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="text-[11px] text-slate-400 flex items-center gap-2">
          <span>Scope: <b>{PROVINCE_VIEWPORTS[selectedProvince]?.label || 'Nepal'}</b></span>
        </div>
      </div>

      {/* MAIN TWO-COLUMN STRATEGIC INTERFACE */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden relative">
        
        {/* LEFT COLUMN: TACTICAL INTERACTIVE MAP */}
        <div id="command-center-map-container" className="flex-1 relative h-[50vh] lg:h-full bg-slate-950 border-b lg:border-b-0 lg:border-r border-slate-800">
          
          {/* FLOATING TACTICAL LAYER SELECTOR (TOP-RIGHT) */}
          <div className="absolute top-3 right-3 z-[400] bg-slate-900/95 backdrop-blur-md p-2.5 rounded-xl border border-slate-800 shadow-2xl text-xs flex flex-col gap-1.5 max-w-[210px]">
            <div className="font-bold text-slate-300 uppercase tracking-wider text-[10px] flex items-center justify-between pb-1 border-b border-slate-800">
              <span className="flex items-center gap-1"><Layers className="h-3 w-3 text-blue-400" /> Tactical Layers</span>
              <span className="text-[9px] text-slate-500 font-mono">BIPAD</span>
            </div>
            
            <label className="flex items-center justify-between gap-2 cursor-pointer hover:text-white transition-colors">
              <span className="flex items-center gap-1.5"><span>🚁</span> Helipads ({filteredHelipads.length})</span>
              <input 
                type="checkbox" 
                checked={activeLayers.helipads} 
                onChange={() => toggleLayer('helipads')} 
                className="rounded accent-emerald-500"
              />
            </label>

            <label className="flex items-center justify-between gap-2 cursor-pointer hover:text-white transition-colors">
              <span className="flex items-center gap-1.5"><span>⛺</span> Evac Centers ({filteredEvacuation.length})</span>
              <input 
                type="checkbox" 
                checked={activeLayers.evacuation} 
                onChange={() => toggleLayer('evacuation')} 
                className="rounded accent-purple-500"
              />
            </label>

            <label className="flex items-center justify-between gap-2 cursor-pointer hover:text-white transition-colors">
              <span className="flex items-center gap-1.5"><span>📡</span> Comms Grid ({filteredCommunications.length})</span>
              <input 
                type="checkbox" 
                checked={activeLayers.communications} 
                onChange={() => toggleLayer('communications')} 
                className="rounded accent-blue-500"
              />
            </label>

            <label className="flex items-center justify-between gap-2 cursor-pointer hover:text-white transition-colors">
              <span className="flex items-center gap-1.5"><span>📦</span> Warehouses ({filteredWarehouses.length})</span>
              <input 
                type="checkbox" 
                checked={activeLayers.warehouses} 
                onChange={() => toggleLayer('warehouses')} 
                className="rounded accent-orange-500"
              />
            </label>

            <label className="flex items-center justify-between gap-2 cursor-pointer hover:text-white transition-colors">
              <span className="flex items-center gap-1.5"><span>🚜</span> Heavy Machinery ({filteredMachinery.length})</span>
              <input 
                type="checkbox" 
                checked={activeLayers.machinery} 
                onChange={() => toggleLayer('machinery')} 
                className="rounded accent-blue-600"
              />
            </label>

            <label className="flex items-center justify-between gap-2 cursor-pointer hover:text-white transition-colors">
              <span className="flex items-center gap-1.5"><span>⛔</span> DOR Roadblocks ({(dorClosures || []).length})</span>
              <input 
                type="checkbox" 
                checked={activeLayers.dorRoads} 
                onChange={() => toggleLayer('dorRoads')} 
                className="rounded accent-red-500"
              />
            </label>

            <label className="flex items-center justify-between gap-2 cursor-pointer hover:text-white transition-colors">
              <span className="flex items-center gap-1.5"><span>🚨</span> Active Incidents ({incidents.length})</span>
              <input 
                type="checkbox" 
                checked={activeLayers.incidents} 
                onChange={() => toggleLayer('incidents')} 
                className="rounded accent-red-600"
              />
            </label>
          </div>

          {/* FLOATING MAP LEGEND (BOTTOM-LEFT) */}
          <div className="absolute bottom-4 left-4 z-[400] bg-slate-900/95 backdrop-blur-md px-3.5 py-2.5 rounded-xl border border-slate-800 shadow-2xl text-[11px] pointer-events-auto max-w-xs text-slate-300">
            <div className="font-bold uppercase tracking-wider text-[10px] text-slate-400 mb-1 flex items-center justify-between">
              <span>Map Key & Signals</span>
              <span className="text-emerald-400 text-[9px] font-mono">BIPAD LIVE</span>
            </div>
            <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-slate-400">
              <div className="flex items-center gap-1.5">
                <span className="text-sm">🚁</span>
                <span>Helipad (Green=Ready, Red=Alert)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-sm">⛺</span>
                <span>Evacuation / Open Space</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-sm">📡</span>
                <span>Comms (Green=Live, Red=Cut)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-sm">📦</span>
                <span>Emergency Warehouse</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-sm">🚜</span>
                <span>Heavy Excavators / APF</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-sm">⛔</span>
                <span>DOR Highway Block</span>
              </div>
            </div>
          </div>

          {/* THE LEAFLET MAP */}
          <BaseMap 
            center={mapCenter} 
            zoom={mapZoom}
            className="rounded-none border-0 bg-slate-950 h-full w-full absolute inset-0 z-0"
          >
            {/* 1. HELIPADS LAYER */}
            {activeLayers.helipads && filteredHelipads.map(h => (
              <Marker
                key={h.id}
                position={[h.lat, h.lng]}
                icon={createHelipadIcon(h.status)}
              >
                <Popup className="rounded-xl overflow-hidden shadow-2xl border-0">
                  <div className="p-1 min-w-[220px] text-slate-900 text-xs">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-black text-sm text-slate-900">🚁 {h.title}</span>
                      <span className={cn(
                        "px-1.5 py-0.5 rounded text-[10px] font-bold text-white",
                        h.status === 'OPERATIONAL' ? 'bg-emerald-600' : h.status === 'WEATHER_ALERT' ? 'bg-amber-600' : 'bg-red-600'
                      )}>
                        {h.status}
                      </span>
                    </div>
                    {h.titleNe && <div className="text-[11px] text-slate-500 font-nepali mb-1">{h.titleNe}</div>}
                    <div className="space-y-1 text-[11px] text-slate-700 pt-1 border-t border-slate-200">
                      <div><b>Elevation:</b> {h.altitudeM} m MSL</div>
                      <div><b>Surface:</b> {h.surfaceType}</div>
                      <div><b>Flight Conditions:</b> <span className="font-semibold text-emerald-700">{h.weatherFlightStatus}</span></div>
                      <div><b>Helicopter Suitability:</b> {h.helicopterSuitability}</div>
                      <div><b>Fuel on site:</b> {h.fuelAvailable ? 'Yes (Jet A-1)' : 'No Fuel'}</div>
                      <div><b>Night Lights:</b> {h.nightLighting ? 'Equipped' : 'Day VFR Only'}</div>
                      <div><b>Agency:</b> {h.operatingAgency}</div>
                      <div><b>Contact:</b> {h.focalPerson} ({h.contactPhone})</div>
                    </div>
                    <div className="mt-2 pt-1 border-t border-slate-200 flex justify-between items-center text-[10px]">
                      <span className="text-slate-500">Source: BIPAD Portal</span>
                      <button 
                        onClick={() => handleTriggerAiAnalysis(`Assess helicopter medical evacuation flight clearance and capacity for ${h.title} in ${h.district}`)}
                        className="bg-purple-700 text-white px-2 py-1 rounded font-bold hover:bg-purple-800"
                      >
                        Ask AI About Site
                      </button>
                    </div>
                  </div>
                </Popup>
              </Marker>
            ))}

            {/* 2. EVACUATION CENTERS & OPEN SPACES LAYER */}
            {activeLayers.evacuation && filteredEvacuation.map(e => (
              <Marker
                key={e.id}
                position={[e.lat, e.lng]}
                icon={createEvacuationIcon(e.status, e.type === 'HUMANITARIAN_OPEN_SPACE')}
              >
                <Popup className="rounded-xl overflow-hidden shadow-2xl border-0">
                  <div className="p-1 min-w-[240px] text-slate-900 text-xs">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-black text-sm text-slate-900">{e.type === 'HUMANITARIAN_OPEN_SPACE' ? '🏕️' : '⛺'} {e.title}</span>
                      <span className={cn(
                        "px-1.5 py-0.5 rounded text-[10px] font-bold text-white",
                        e.status === 'AVAILABLE' ? 'bg-emerald-600' : e.status === 'NEAR_CAPACITY' ? 'bg-amber-600' : 'bg-red-600'
                      )}>
                        {e.status.replace('_', ' ')}
                      </span>
                    </div>
                    {e.titleNe && <div className="text-[11px] text-slate-500 font-nepali mb-1">{e.titleNe}</div>}
                    
                    {/* Capacity Meter */}
                    <div className="my-1.5 bg-slate-100 p-2 rounded border border-slate-200">
                      <div className="flex justify-between font-bold text-[11px] mb-1">
                        <span>Capacity: {e.totalCapacity.toLocaleString()} persons</span>
                        <span className="text-emerald-700">{e.availableCapacity.toLocaleString()} Free</span>
                      </div>
                      <div className="w-full bg-slate-300 h-2 rounded-full overflow-hidden">
                        <div 
                          className={cn("h-full", e.occupancyRate > 80 ? "bg-amber-500" : "bg-emerald-500")}
                          style={{ width: `${Math.min(100, e.occupancyRate)}%` }}
                        />
                      </div>
                      <div className="text-[10px] text-slate-500 mt-1 flex justify-between">
                        <span>Sheltered: {e.currentOccupancy.toLocaleString()}</span>
                        <span>Occupancy: {e.occupancyRate}%</span>
                      </div>
                    </div>

                    <div className="space-y-1 text-[11px] text-slate-700">
                      <div><b>Structure:</b> {e.structureType}</div>
                      <div><b>WASH Drinking Water:</b> {e.hasDrinkingWater ? '✓ Potable Supply Tested' : '⚠️ Tanker Required'}</div>
                      <div><b>Toilets:</b> {e.hasToilet ? `✓ ${e.toiletCount} Units` : 'None'}</div>
                      <div><b>Solar / Power Backup:</b> {e.hasSolarBackup ? '✓ Solar Equipped' : 'Grid Dependent'}</div>
                      <div><b>Disability Access:</b> {e.hasDisableFriendly ? '✓ Ramp Installed' : 'No Ramp'}</div>
                      <div><b>Managed By:</b> {e.managedBy}</div>
                      <div><b>Contact:</b> {e.contactPhone}</div>
                    </div>

                    <div className="mt-2 pt-1 border-t border-slate-200 flex justify-between items-center text-[10px]">
                      <span className="text-slate-500">Source: BIPAD Portal</span>
                      <button 
                        onClick={() => handleTriggerAiAnalysis(`Direct displaced flood evacuees to ${e.title} (${e.totalCapacity} capacity, ${e.availableCapacity} available)`)}
                        className="bg-purple-700 text-white px-2 py-1 rounded font-bold hover:bg-purple-800"
                      >
                        Ask AI Triage
                      </button>
                    </div>
                  </div>
                </Popup>
              </Marker>
            ))}

            {/* 3. COMMUNICATIONS CHANNELS LAYER */}
            {activeLayers.communications && filteredCommunications.map(c => (
              <Marker
                key={c.id}
                position={[c.lat, c.lng]}
                icon={createCommunicationIcon(c.status)}
              >
                <Popup className="rounded-xl overflow-hidden shadow-2xl border-0">
                  <div className="p-1 min-w-[220px] text-slate-900 text-xs">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-black text-sm text-slate-900">📡 {c.title}</span>
                      <span className={cn(
                        "px-1.5 py-0.5 rounded text-[10px] font-bold text-white",
                        c.status === 'WORKING' ? 'bg-emerald-600' : c.status === 'DEGRADED' ? 'bg-amber-600' : 'bg-red-600'
                      )}>
                        {c.status}
                      </span>
                    </div>
                    {c.titleNe && <div className="text-[11px] text-slate-500 font-nepali mb-1">{c.titleNe}</div>}
                    
                    <div className="space-y-1 text-[11px] text-slate-700 pt-1 border-t border-slate-200">
                      <div><b>Operator:</b> {c.operator}</div>
                      <div><b>Type:</b> {c.type.replace('_', ' ')}</div>
                      <div><b>Frequency / Band:</b> {c.frequency || 'Standard LTE'}</div>
                      <div><b>Coverage Radius:</b> {c.coverageRadiusKm} km</div>
                      {c.outageReason && (
                        <div className="p-1.5 bg-red-50 text-red-900 rounded border border-red-200 font-semibold text-[10px]">
                          ⚠️ Outage Reason: {c.outageReason}
                        </div>
                      )}
                      <div className="p-1.5 bg-blue-50 text-blue-950 rounded border border-blue-200 text-[10px]">
                        <b>Emergency Fallback:</b> {c.backupChannel}
                      </div>
                    </div>

                    <div className="mt-2 pt-1 border-t border-slate-200 flex justify-between items-center text-[10px]">
                      <span className="text-slate-500">Source: BIPAD Portal</span>
                      <button 
                        onClick={() => handleTriggerAiAnalysis(`Formulate emergency communication restoration plan for ${c.title} in ${c.district}`)}
                        className="bg-purple-700 text-white px-2 py-1 rounded font-bold hover:bg-purple-800"
                      >
                        Restore Comms
                      </button>
                    </div>
                  </div>
                </Popup>
              </Marker>
            ))}

            {/* 4. EMERGENCY WAREHOUSES LAYER */}
            {activeLayers.warehouses && filteredWarehouses.map(w => (
              <Marker
                key={w.id}
                position={[w.lat, w.lng]}
                icon={createWarehouseIcon()}
              >
                <Popup className="rounded-xl overflow-hidden shadow-2xl border-0">
                  <div className="p-1 min-w-[220px] text-slate-900 text-xs">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-black text-sm text-slate-900">📦 {w.title}</span>
                      <Badge variant="outline" className="text-[9px] border-amber-600 text-amber-800">
                        {w.status}
                      </Badge>
                    </div>
                    {w.titleNe && <div className="text-[11px] text-slate-500 font-nepali mb-1">{w.titleNe}</div>}
                    <div className="space-y-1 text-[11px] text-slate-700 pt-1 border-t border-slate-200">
                      <div><b>Managing Agency:</b> {w.agency}</div>
                      <div><b>District:</b> {w.district} ({w.province})</div>
                      <div className="bg-amber-50 p-2 rounded border border-amber-200 my-1 space-y-0.5">
                        <div className="font-bold text-amber-950">Prepositioned Stock:</div>
                        <div className="flex justify-between"><span>Tarpaulins (त्रिपाल):</span> <b>{w.supplies.tarpaulins} units</b></div>
                        <div className="flex justify-between"><span>Family Rations:</span> <b>{w.supplies.familyRations} kits</b></div>
                        <div className="flex justify-between"><span>Tents:</span> <b>{w.supplies.tents}</b></div>
                        <div className="flex justify-between"><span>Blankets:</span> <b>{w.supplies.blankets}</b></div>
                        <div className="flex justify-between"><span>Rescue Boats:</span> <b>{w.supplies.rescueBoats} zodiacs</b></div>
                      </div>
                      <div><b>Focal Officer:</b> {w.focalPerson} ({w.contactPhone})</div>
                    </div>
                  </div>
                </Popup>
              </Marker>
            ))}

            {/* 5. HEAVY MACHINERY & RESCUE APPARATUS */}
            {activeLayers.machinery && filteredMachinery.map(m => (
              <Marker
                key={m.id}
                position={[m.lat, m.lng]}
                icon={createMachineryIcon()}
              >
                <Popup className="rounded-xl overflow-hidden shadow-2xl border-0">
                  <div className="p-1 min-w-[200px] text-slate-900 text-xs">
                    <div className="font-bold text-sm text-slate-900 mb-1">🚜 {m.title}</div>
                    <div className="text-[11px] text-slate-700 space-y-1">
                      <div><b>Equipment:</b> {m.equipmentType}</div>
                      <div><b>Operator:</b> {m.operator}</div>
                      <div><b>District:</b> {m.district}</div>
                      <div><b>Status:</b> <span className="font-bold text-blue-700">{m.status}</span></div>
                      <div><b>Direct Dispatch:</b> {m.contact}</div>
                    </div>
                  </div>
                </Popup>
              </Marker>
            ))}

            {/* 6. DOR ROAD CLOSURES */}
            {activeLayers.dorRoads && (dorClosures || []).filter(c => c.latitude && c.longitude).map((closure, idx) => (
              <Marker
                key={`dor-cmd-${closure.id || idx}`}
                position={[closure.latitude, closure.longitude]}
                icon={createDorHazardIcon(closure.sahayakStatus)}
              >
                <Popup>
                  <div className="p-1 min-w-[200px] text-xs text-slate-900">
                    <div className="font-bold flex justify-between items-center mb-1">
                      <span>⛔ {closure.roadName}</span>
                      <span className="bg-red-100 text-red-800 text-[10px] font-bold px-1.5 py-0.5 rounded">
                        {closure.sahayakStatus}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600 mb-1"><b>Reason:</b> {closure.closureReason}</p>
                    <p className="text-[10px] text-slate-500"><b>Repair ETA:</b> {closure.repairEta}</p>
                    <p className="text-emerald-700 text-[9px] font-bold mt-1">DOR Navigate Verified</p>
                  </div>
                </Popup>
              </Marker>
            ))}

            {/* 7. ACTIVE DISASTER INCIDENTS */}
            {activeLayers.incidents && incidents.filter(i => i.lat && i.lng).map(inc => (
              <Marker
                key={`inc-cmd-${inc.id}`}
                position={[inc.lat, inc.lng]}
                icon={createIncidentIcon(calculatePriorityScore(inc))}
              >
                <Popup>
                  <div className="p-1 min-w-[180px] text-slate-900 text-xs">
                    <h4 className="font-bold text-red-600 mb-1">🚨 {inc.title}</h4>
                    <p className="text-[11px] text-slate-600 mb-1">{inc.description}</p>
                    <p className="text-[10px] text-slate-500 font-bold">Priority Score: {calculatePriorityScore(inc)}</p>
                  </div>
                </Popup>
              </Marker>
            ))}
          </BaseMap>
        </div>

        {/* RIGHT COLUMN: STRATEGIC COMMAND CONSOLE & AI ADVISOR */}
        <div id="command-center-console" className="w-full lg:w-[460px] xl:w-[500px] bg-slate-900 flex flex-col h-[50vh] lg:h-full border-t lg:border-t-0 border-slate-800 shrink-0">
          
          {/* CONSOLE TABS */}
          <div className="bg-slate-950 border-b border-slate-800 flex items-center justify-between px-2 pt-1 shrink-0 overflow-x-auto">
            <div className="flex gap-1 text-xs">
              <button
                id="tab-ai-commander"
                onClick={() => setActiveTab('ai')}
                className={cn(
                  "px-3 py-2 font-bold flex items-center gap-1.5 border-b-2 transition-all",
                  activeTab === 'ai' 
                    ? "border-purple-500 text-purple-400 bg-purple-950/20" 
                    : "border-transparent text-slate-400 hover:text-slate-200"
                )}
              >
                <Bot className="h-3.5 w-3.5" /> AI Commander
              </button>

              <button
                id="tab-comms"
                onClick={() => setActiveTab('comms')}
                className={cn(
                  "px-3 py-2 font-bold flex items-center gap-1.5 border-b-2 transition-all",
                  activeTab === 'comms' 
                    ? "border-blue-500 text-blue-400 bg-blue-950/20" 
                    : "border-transparent text-slate-400 hover:text-slate-200"
                )}
              >
                <RadioTower className="h-3.5 w-3.5" /> Comms ({filteredCommunications.length})
              </button>

              <button
                id="tab-helipads"
                onClick={() => setActiveTab('helipads')}
                className={cn(
                  "px-3 py-2 font-bold flex items-center gap-1.5 border-b-2 transition-all",
                  activeTab === 'helipads' 
                    ? "border-emerald-500 text-emerald-400 bg-emerald-950/20" 
                    : "border-transparent text-slate-400 hover:text-slate-200"
                )}
              >
                <Plane className="h-3.5 w-3.5" /> Helipads ({filteredHelipads.length})
              </button>

              <button
                id="tab-evacuation"
                onClick={() => setActiveTab('evacuation')}
                className={cn(
                  "px-3 py-2 font-bold flex items-center gap-1.5 border-b-2 transition-all",
                  activeTab === 'evacuation' 
                    ? "border-amber-500 text-amber-400 bg-amber-950/20" 
                    : "border-transparent text-slate-400 hover:text-slate-200"
                )}
              >
                <Tent className="h-3.5 w-3.5" /> Evacuation ({filteredEvacuation.length})
              </button>

              <button
                id="tab-warehouses"
                onClick={() => setActiveTab('warehouses')}
                className={cn(
                  "px-3 py-2 font-bold flex items-center gap-1.5 border-b-2 transition-all",
                  activeTab === 'warehouses' 
                    ? "border-orange-500 text-orange-400 bg-orange-950/20" 
                    : "border-transparent text-slate-400 hover:text-slate-200"
                )}
              >
                <Package className="h-3.5 w-3.5" /> Logistics
              </button>
            </div>
          </div>

          {/* TAB 1: AI TACTICAL COMMANDER (PRIMARY INTERACTION) */}
          {activeTab === 'ai' && (
            <div className="flex-1 flex flex-col overflow-hidden bg-slate-900">
              
              {/* TOP SITREP BANNER */}
              <div className="p-3 border-b border-slate-800 bg-slate-950/60 shrink-0">
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-purple-400 animate-spin" style={{ animationDuration: '4s' }} />
                    <span className="text-xs font-black tracking-wider uppercase text-purple-300">
                      National AI Tactical Advisor
                    </span>
                  </div>
                  <Badge 
                    variant={aiGuidance?.threatLevel === 'CRITICAL' ? 'critical' : 'warning'} 
                    className="text-[10px] px-2 py-0.5 font-bold"
                  >
                    THREAT: {aiGuidance?.threatLevel || 'EVALUATING'}
                  </Badge>
                </div>
                
                {aiLoading ? (
                  <div className="py-4 text-center text-xs text-purple-300 flex items-center justify-center gap-2">
                    <RefreshCw className="h-4 w-4 animate-spin text-purple-400" />
                    <span>Synthesizing nationwide BIPAD telemetry & operational directives...</span>
                  </div>
                ) : aiGuidance ? (
                  <p className="text-xs text-slate-300 leading-relaxed bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                    {aiGuidance.sitrep}
                  </p>
                ) : (
                  <div className="text-xs text-slate-400">Press briefing to synthesize recommendations.</div>
                )}
              </div>

              {/* ACTIONABLE DIRECTIVES & TACTICAL ADVICE SCROLLER */}
              <div className="flex-1 overflow-y-auto p-3 space-y-3">
                
                {/* PRIMARY OPERATIONAL DIRECTIVES */}
                {aiGuidance && aiGuidance.primaryDirectives && (
                  <div>
                    <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center justify-between">
                      <span>Prioritized Immediate Directives</span>
                      <span className="text-red-400 text-[10px]">EXECUTE FIRST</span>
                    </h4>
                    <div className="space-y-2">
                      {aiGuidance.primaryDirectives.map(directive => (
                        <div 
                          key={directive.id}
                          className="bg-slate-950 border border-slate-800 hover:border-purple-800/60 rounded-lg p-2.5 transition-all text-xs"
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-bold text-purple-300 flex items-center gap-1.5">
                              <span className="w-4 h-4 rounded-full bg-purple-900/80 text-purple-200 text-[10px] flex items-center justify-center font-black">
                                {directive.id}
                              </span>
                              {directive.department}
                            </span>
                            <span className={cn(
                              "text-[9px] font-bold px-1.5 py-0.5 rounded",
                              directive.priority === 'IMMEDIATE' ? 'bg-red-900/60 text-red-300' : 'bg-amber-900/60 text-amber-300'
                            )}>
                              {directive.priority}
                            </span>
                          </div>
                          <p className="text-slate-200 font-medium leading-snug">{directive.action}</p>
                          <div className="mt-1.5 text-[10px] text-slate-400 flex items-center justify-between pt-1 border-t border-slate-800/80">
                            <span>Target: <b className="text-slate-300">{directive.targetResource}</b></span>
                            <button 
                              onClick={() => handleTriggerAiAnalysis(`Action protocol details for: ${directive.action}`)}
                              className="text-purple-400 hover:text-purple-300 font-bold"
                            >
                              Details →
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* EVACUATION & AIRLIFT QUICK CARDS */}
                {aiGuidance && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    {/* Evacuation Guidance */}
                    <div className="bg-slate-950 border border-slate-800 rounded-lg p-2.5">
                      <div className="font-bold text-amber-400 text-[11px] mb-1 flex items-center gap-1">
                        <Tent className="h-3.5 w-3.5" /> Evacuation Triage
                      </div>
                      <div className="text-[11px] text-slate-300 space-y-1">
                        <div><b>Ready Slots:</b> {aiGuidance.evacuationGuidance.totalCapacityReady.toLocaleString()}</div>
                        <div><b>Key Shelters:</b> {aiGuidance.evacuationGuidance.recommendedCenters[0] || 'Tundikhel Open Space'}</div>
                        <div className="text-[10px] text-amber-300/80">⚠️ {aiGuidance.evacuationGuidance.warnings[0] || 'Observe river water levels'}</div>
                      </div>
                    </div>

                    {/* Helipad & Air-Bridge Guidance */}
                    <div className="bg-slate-950 border border-slate-800 rounded-lg p-2.5">
                      <div className="font-bold text-emerald-400 text-[11px] mb-1 flex items-center gap-1">
                        <Plane className="h-3.5 w-3.5" /> Rotary Air-Bridge
                      </div>
                      <div className="text-[11px] text-slate-300 space-y-1">
                        <div><b>Flight Status:</b> <span className="text-emerald-400 font-bold">{aiGuidance.helipadGuidance.airliftViability}</span></div>
                        <div><b>Recommended:</b> {aiGuidance.helipadGuidance.recommendedAircraft}</div>
                        <div className="text-[10px] text-slate-400">Ceiling: {aiGuidance.helipadGuidance.weatherLimitations[0] || 'VFR open'}</div>
                      </div>
                    </div>
                  </div>
                )}

                {/* COMMUNICATIONS RESTORATION PLAN */}
                {aiGuidance && aiGuidance.communicationsGuidance && (
                  <div className="bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs">
                    <div className="font-bold text-blue-400 text-[11px] mb-1 flex items-center justify-between">
                      <span className="flex items-center gap-1"><RadioTower className="h-3.5 w-3.5" /> Redundant Communications Plan</span>
                      <span className="text-[9px] text-slate-400">VHF / HF / SAT</span>
                    </div>
                    <div className="space-y-1 text-[11px] text-slate-300">
                      <div><b>Primary Emergency Frequency:</b> <span className="font-mono text-emerald-400">156.800 MHz (Police VHF)</span></div>
                      <div><b>Army Tactical HF:</b> <span className="font-mono text-emerald-400">7.100 MHz LSB</span></div>
                      <div className="text-[10px] text-slate-400 pt-1 border-t border-slate-800">
                        Urgent Restoration: {aiGuidance.communicationsGuidance.urgentRestorationTargets[0] || 'Fiber splice along highway'}
                      </div>
                    </div>
                  </div>
                )}

                {/* TACTICAL QUICK ACTION PROMPT BUTTONS */}
                <div>
                  <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                    Tactical Commander Quick Queries
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {(aiGuidance?.suggestedQuestions || [
                      'Which evacuation center near Kathmandu has water?',
                      'Which helipads can receive heavy Mi-17 helicopters?',
                      'How to restore communications in Dhading?',
                      'Where are the nearest heavy excavators prepositioned?'
                    ]).map((q, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleTriggerAiAnalysis(q)}
                        className="text-[11px] bg-slate-950 border border-slate-800 hover:border-purple-600 text-slate-300 hover:text-white px-2.5 py-1 rounded-full text-left transition-all"
                      >
                        💬 {q}
                      </button>
                    ))}
                  </div>
                </div>

                {/* RECENT CHAT LOG */}
                {aiChatHistory.length > 0 && (
                  <div className="pt-2 border-t border-slate-800 space-y-2">
                    <h5 className="text-[10px] font-bold text-slate-500 uppercase">Command Dialogue History</h5>
                    {aiChatHistory.map((item, idx) => (
                      <div 
                        key={idx} 
                        className={cn(
                          "p-2 rounded text-xs leading-relaxed",
                          item.role === 'user' ? 'bg-purple-950/40 border border-purple-800/40 ml-4' : 'bg-slate-950 border border-slate-800 mr-4'
                        )}
                      >
                        <div className="flex justify-between text-[9px] text-slate-500 mb-0.5">
                          <b>{item.role === 'user' ? 'Incident Commander' : 'SAHAYAK Tactical AI'}</b>
                          <span>{item.time}</span>
                        </div>
                        <p className="text-slate-200">{item.text}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* INTERACTIVE INPUT BAR */}
              <div className="p-2.5 border-t border-slate-800 bg-slate-950 flex gap-2 shrink-0">
                <input
                  type="text"
                  id="ai-tactical-input"
                  value={userAiQuestion}
                  onChange={e => setUserAiQuestion(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') handleTriggerAiAnalysis(); }}
                  placeholder="Ask Commander AI (e.g., 'What evacuation centers are open in Koshi?')..."
                  className="flex-1 bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
                />
                <Button 
                  size="sm" 
                  onClick={() => handleTriggerAiAnalysis()}
                  disabled={aiLoading}
                  className="bg-purple-600 hover:bg-purple-500 text-white shrink-0 px-3"
                >
                  <Send className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          )}

          {/* TAB 2: COMMUNICATIONS GRID (WORKING VS NOT WORKING) */}
          {activeTab === 'comms' && (
            <div className="flex-1 flex flex-col overflow-hidden p-3 bg-slate-900">
              
              {/* FILTERS HEADER */}
              <div className="mb-3 space-y-2 shrink-0">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                    <RadioTower className="h-4 w-4 text-blue-400" /> Communications Channels
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono">BIPAD Registry</span>
                </div>

                {/* Status Tabs */}
                <div className="grid grid-cols-4 gap-1 text-[11px]">
                  <button
                    onClick={() => setCommStatusFilter('ALL')}
                    className={cn(
                      "p-1.5 rounded font-bold transition-all text-center",
                      commStatusFilter === 'ALL' ? 'bg-slate-800 text-white' : 'bg-slate-950 text-slate-400 hover:text-white'
                    )}
                  >
                    All ({filteredCommunications.length})
                  </button>
                  <button
                    onClick={() => setCommStatusFilter('WORKING')}
                    className={cn(
                      "p-1.5 rounded font-bold transition-all text-center",
                      commStatusFilter === 'WORKING' ? 'bg-emerald-900/60 text-emerald-300 border border-emerald-700' : 'bg-slate-950 text-slate-400 hover:text-emerald-400'
                    )}
                  >
                    Working ({filteredCommunications.filter(c => c.status === 'WORKING').length})
                  </button>
                  <button
                    onClick={() => setCommStatusFilter('DOWN')}
                    className={cn(
                      "p-1.5 rounded font-bold transition-all text-center",
                      commStatusFilter === 'DOWN' ? 'bg-red-900/60 text-red-300 border border-red-700' : 'bg-slate-950 text-slate-400 hover:text-red-400'
                    )}
                  >
                    Down ({filteredCommunications.filter(c => c.status === 'DOWN').length})
                  </button>
                  <button
                    onClick={() => setCommStatusFilter('DEGRADED')}
                    className={cn(
                      "p-1.5 rounded font-bold transition-all text-center",
                      commStatusFilter === 'DEGRADED' ? 'bg-amber-900/60 text-amber-300 border border-amber-700' : 'bg-slate-950 text-slate-400 hover:text-amber-400'
                    )}
                  >
                    Alert ({filteredCommunications.filter(c => c.status === 'DEGRADED').length})
                  </button>
                </div>
              </div>

              {/* COMMUNICATIONS CARDS LIST */}
              <div className="flex-1 overflow-y-auto space-y-2 pr-1">
                {visibleCommunications.length === 0 ? (
                  <div className="p-6 text-center text-xs text-slate-500">
                    No communication channels match the selected filter.
                  </div>
                ) : (
                  visibleCommunications.map(c => (
                    <div 
                      key={c.id} 
                      className={cn(
                        "p-3 rounded-lg border text-xs transition-all",
                        c.status === 'WORKING' 
                          ? "bg-slate-950 border-slate-800 hover:border-slate-700" 
                          : c.status === 'DEGRADED' 
                            ? "bg-amber-950/20 border-amber-800/60" 
                            : "bg-red-950/20 border-red-800/60"
                      )}
                    >
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <div>
                          <div className="font-bold text-white text-xs">{c.title}</div>
                          {c.titleNe && <div className="text-[10px] text-slate-500 font-nepali">{c.titleNe}</div>}
                        </div>
                        <span className={cn(
                          "px-2 py-0.5 rounded text-[10px] font-bold shrink-0",
                          c.status === 'WORKING' 
                            ? "bg-emerald-900/80 text-emerald-300" 
                            : c.status === 'DEGRADED' 
                              ? "bg-amber-900/80 text-amber-300" 
                              : "bg-red-900/80 text-red-300 animate-pulse"
                        )}>
                          {c.status}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-1 text-[11px] text-slate-400 mb-2">
                        <div>Operator: <b className="text-slate-300">{c.operator}</b></div>
                        <div>District: <b className="text-slate-300">{c.district}</b></div>
                        <div>Type: <b className="text-slate-300">{c.type.replace('_', ' ')}</b></div>
                        <div>Freq: <b className="text-slate-300">{c.frequency || 'N/A'}</b></div>
                      </div>

                      {c.outageReason && (
                        <div className="p-2 bg-red-950/50 border border-red-800/60 rounded text-[11px] text-red-200 mb-2">
                          <b>Outage Cause:</b> {c.outageReason}
                        </div>
                      )}

                      <div className="p-1.5 bg-slate-900 rounded border border-slate-800 text-[10px] text-blue-300 flex items-center justify-between">
                        <span>Fallback: <b>{c.backupChannel}</b></span>
                        <button 
                          onClick={() => handleFocusResource(c.lat, c.lng, 14)}
                          className="text-white hover:text-blue-400 font-bold ml-2 underline"
                        >
                          Show on Map →
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* TAB 3: HELIPADS & AIR ASSETS */}
          {activeTab === 'helipads' && (
            <div className="flex-1 flex flex-col overflow-hidden p-3 bg-slate-900">
              <div className="mb-3 space-y-2 shrink-0">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                    <Plane className="h-4 w-4 text-emerald-400" /> Air Operations & Helipads
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono">BIPAD Real Registry</span>
                </div>

                {/* Sub-filter */}
                <div className="grid grid-cols-3 gap-1 text-[11px]">
                  <button
                    onClick={() => setHelipadStatusFilter('ALL')}
                    className={cn(
                      "p-1.5 rounded font-bold transition-all text-center",
                      helipadStatusFilter === 'ALL' ? 'bg-slate-800 text-white' : 'bg-slate-950 text-slate-400 hover:text-white'
                    )}
                  >
                    All ({filteredHelipads.length})
                  </button>
                  <button
                    onClick={() => setHelipadStatusFilter('OPERATIONAL')}
                    className={cn(
                      "p-1.5 rounded font-bold transition-all text-center",
                      helipadStatusFilter === 'OPERATIONAL' ? 'bg-emerald-900/60 text-emerald-300 border border-emerald-700' : 'bg-slate-950 text-slate-400 hover:text-emerald-400'
                    )}
                  >
                    Operational ({filteredHelipads.filter(h => h.status === 'OPERATIONAL').length})
                  </button>
                  <button
                    onClick={() => setHelipadStatusFilter('WEATHER_ALERT')}
                    className={cn(
                      "p-1.5 rounded font-bold transition-all text-center",
                      helipadStatusFilter === 'WEATHER_ALERT' ? 'bg-amber-900/60 text-amber-300 border border-amber-700' : 'bg-slate-950 text-slate-400 hover:text-amber-400'
                    )}
                  >
                    Weather Alert ({filteredHelipads.filter(h => h.status === 'WEATHER_ALERT').length})
                  </button>
                </div>
              </div>

              {/* HELIPADS LIST */}
              <div className="flex-1 overflow-y-auto space-y-2 pr-1">
                {visibleHelipads.map(h => (
                  <div 
                    key={h.id}
                    className="p-3 bg-slate-950 border border-slate-800 hover:border-emerald-800/60 rounded-lg text-xs transition-all"
                  >
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <div>
                        <div className="font-bold text-white text-xs">🚁 {h.title}</div>
                        <div className="text-[10px] text-slate-400">{h.district} • {h.province}</div>
                      </div>
                      <span className={cn(
                        "px-2 py-0.5 rounded text-[10px] font-bold shrink-0",
                        h.status === 'OPERATIONAL' ? 'bg-emerald-900/80 text-emerald-300' : 'bg-amber-900/80 text-amber-300'
                      )}>
                        {h.status}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-1 text-[11px] text-slate-400 mb-2">
                      <div>Elevation: <b className="text-slate-300">{h.altitudeM} m MSL</b></div>
                      <div>Surface: <b className="text-slate-300">{h.surfaceType}</b></div>
                      <div>VFR Flight: <b className="text-emerald-400">{h.weatherFlightStatus}</b></div>
                      <div>Fuel: <b className="text-slate-300">{h.fuelAvailable ? 'Available' : 'None'}</b></div>
                    </div>

                    <div className="text-[10px] text-slate-400 mb-2">
                      Suitability: <b className="text-slate-200">{h.helicopterSuitability}</b>
                    </div>

                    <div className="flex justify-between items-center text-[10px] pt-1.5 border-t border-slate-800">
                      <span className="text-slate-500">{h.focalPerson}</span>
                      <button 
                        onClick={() => handleFocusResource(h.lat, h.lng, 14)}
                        className="text-emerald-400 hover:text-emerald-300 font-bold"
                      >
                        Center on Map →
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: EVACUATION CENTERS & OPEN SPACES */}
          {activeTab === 'evacuation' && (
            <div className="flex-1 flex flex-col overflow-hidden p-3 bg-slate-900">
              <div className="mb-3 space-y-2 shrink-0">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                    <Tent className="h-4 w-4 text-purple-400" /> Evacuation Shelters & Open Spaces
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono">BIPAD Registry</span>
                </div>

                <div className="grid grid-cols-3 gap-1 text-[11px]">
                  <button
                    onClick={() => setEvacTypeFilter('ALL')}
                    className={cn(
                      "p-1.5 rounded font-bold transition-all text-center",
                      evacTypeFilter === 'ALL' ? 'bg-slate-800 text-white' : 'bg-slate-950 text-slate-400 hover:text-white'
                    )}
                  >
                    All ({filteredEvacuation.length})
                  </button>
                  <button
                    onClick={() => setEvacTypeFilter('OPEN_SPACE')}
                    className={cn(
                      "p-1.5 rounded font-bold transition-all text-center",
                      evacTypeFilter === 'OPEN_SPACE' ? 'bg-purple-900/60 text-purple-300 border border-purple-700' : 'bg-slate-950 text-slate-400 hover:text-purple-400'
                    )}
                  >
                    Open Spaces ({filteredEvacuation.filter(e => e.type === 'HUMANITARIAN_OPEN_SPACE').length})
                  </button>
                  <button
                    onClick={() => setEvacTypeFilter('SHELTER')}
                    className={cn(
                      "p-1.5 rounded font-bold transition-all text-center",
                      evacTypeFilter === 'SHELTER' ? 'bg-blue-900/60 text-blue-300 border border-blue-700' : 'bg-slate-950 text-slate-400 hover:text-blue-400'
                    )}
                  >
                    Centres ({filteredEvacuation.filter(e => e.type === 'EVACUATION_CENTRE').length})
                  </button>
                </div>
              </div>

              {/* EVACUATION CARDS */}
              <div className="flex-1 overflow-y-auto space-y-2 pr-1">
                {visibleEvacuation.map(e => (
                  <div 
                    key={e.id}
                    className="p-3 bg-slate-950 border border-slate-800 hover:border-purple-800/60 rounded-lg text-xs transition-all"
                  >
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <div>
                        <div className="font-bold text-white text-xs">{e.type === 'HUMANITARIAN_OPEN_SPACE' ? '🏕️' : '⛺'} {e.title}</div>
                        <div className="text-[10px] text-slate-400">{e.district} • {e.province}</div>
                      </div>
                      <span className={cn(
                        "px-2 py-0.5 rounded text-[10px] font-bold shrink-0",
                        e.status === 'AVAILABLE' ? 'bg-emerald-900/80 text-emerald-300' : 'bg-amber-900/80 text-amber-300'
                      )}>
                        {e.status.replace('_', ' ')}
                      </span>
                    </div>

                    {/* Capacity Progress Bar */}
                    <div className="my-2 bg-slate-900 p-2 rounded border border-slate-800">
                      <div className="flex justify-between font-bold text-[11px] mb-1">
                        <span>Total Capacity: {e.totalCapacity.toLocaleString()}</span>
                        <span className="text-emerald-400">{e.availableCapacity.toLocaleString()} Free</span>
                      </div>
                      <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                        <div 
                          className={cn("h-full", e.occupancyRate > 80 ? "bg-amber-500" : "bg-emerald-500")}
                          style={{ width: `${Math.min(100, e.occupancyRate)}%` }}
                        />
                      </div>
                      <div className="text-[10px] text-slate-400 mt-1 flex justify-between">
                        <span>Occupants: {e.currentOccupancy.toLocaleString()}</span>
                        <span>{e.occupancyRate}% Full</span>
                      </div>
                    </div>

                    {/* Amenities Badges */}
                    <div className="flex flex-wrap gap-1 text-[10px] mb-2">
                      <span className={cn("px-1.5 py-0.5 rounded", e.hasDrinkingWater ? "bg-emerald-950 text-emerald-300 border border-emerald-800" : "bg-red-950 text-red-300")}>
                        {e.hasDrinkingWater ? '✓ Potable Water' : '✗ No Water'}
                      </span>
                      <span className="px-1.5 py-0.5 rounded bg-slate-900 text-slate-300 border border-slate-800">
                        🚻 {e.toiletCount} Toilets
                      </span>
                      {e.hasSolarBackup && (
                        <span className="px-1.5 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-800">
                          ☀️ Solar Power
                        </span>
                      )}
                      {e.hasDisableFriendly && (
                        <span className="px-1.5 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-800">
                          ♿ Ramp Access
                        </span>
                      )}
                    </div>

                    <div className="flex justify-between items-center text-[10px] pt-1.5 border-t border-slate-800">
                      <span className="text-slate-400 truncate max-w-[200px]">{e.managedBy}</span>
                      <button 
                        onClick={() => handleFocusResource(e.lat, e.lng, 14)}
                        className="text-purple-400 hover:text-purple-300 font-bold"
                      >
                        Center on Map →
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: WAREHOUSES & HEAVY MACHINERY */}
          {activeTab === 'warehouses' && (
            <div className="flex-1 flex flex-col overflow-hidden p-3 bg-slate-900">
              <div className="mb-3 space-y-1 shrink-0">
                <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                  <Package className="h-4 w-4 text-orange-400" /> Prepositioned Emergency Logistics
                </span>
                <p className="text-[11px] text-slate-400">DAO & DEOC Emergency Depots and Heavy Earthmoving Machinery</p>
              </div>

              <div className="flex-1 overflow-y-auto space-y-2 pr-1">
                <div className="font-bold text-[11px] text-amber-400 uppercase tracking-wider">
                  Emergency Warehouses ({filteredWarehouses.length})
                </div>
                {filteredWarehouses.slice(0, 8).map(w => (
                  <div key={w.id} className="p-2.5 bg-slate-950 border border-slate-800 rounded-lg text-xs">
                    <div className="font-bold text-white mb-1">📦 {w.title}</div>
                    <div className="text-[11px] text-slate-400 mb-1">{w.agency} • {w.district}</div>
                    <div className="grid grid-cols-3 gap-1 text-[10px] bg-slate-900 p-1.5 rounded border border-slate-800 mb-1">
                      <div>Tarps: <b>{w.supplies.tarpaulins}</b></div>
                      <div>Rations: <b>{w.supplies.familyRations}</b></div>
                      <div>Boats: <b>{w.supplies.rescueBoats}</b></div>
                    </div>
                    <div className="flex justify-between text-[10px] text-slate-500">
                      <span>Focal: {w.focalPerson}</span>
                      <button onClick={() => handleFocusResource(w.lat, w.lng, 14)} className="text-orange-400 font-bold">Map →</button>
                    </div>
                  </div>
                ))}

                <div className="font-bold text-[11px] text-blue-400 uppercase tracking-wider pt-2">
                  Heavy Machinery & Responders ({filteredMachinery.length})
                </div>
                {filteredMachinery.slice(0, 8).map(m => (
                  <div key={m.id} className="p-2.5 bg-slate-950 border border-slate-800 rounded-lg text-xs">
                    <div className="font-bold text-white mb-0.5">🚜 {m.title}</div>
                    <div className="text-[11px] text-slate-400 mb-1">{m.operator} • {m.district}</div>
                    <div className="flex justify-between text-[10px] text-slate-500">
                      <span className="text-blue-400 font-bold">{m.equipmentType}</span>
                      <button onClick={() => handleFocusResource(m.lat, m.lng, 14)} className="text-blue-400 font-bold">Map →</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
