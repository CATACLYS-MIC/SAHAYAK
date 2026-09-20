import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, Badge, Button, BaseMap } from '@/components/ui';
import { AlertTriangle, CloudRain, MapPin, Activity, ArrowRight, ShieldAlert, Stethoscope, FileWarning, Sun, CheckCircle2, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAppState } from '@/lib/store';
import { getShortageStatus, calculateDistanceKm } from '@/lib/calculations';
import { HospitalMatchingNetworkCard } from '@/components/hospital-matching/HospitalMatchingNetworkCard';
import { Marker, Popup } from 'react-leaflet';
import L from 'leaflet';

const createIncidentIcon = (severity: number) => {
  const color = severity >= 8 ? '#ef4444' : '#f97316';
  return L.divIcon({
    className: 'bg-transparent border-0',
    html: `<div style="background-color: ${color}; width: 14px; height: 14px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 6px ${color};"></div>`,
    iconSize: [14, 14],
    iconAnchor: [7, 7],
  });
};

export function Home() {
  const { 
    currentLocationId, currentLocation, userGeolocation,
    locations, 
    weather, 
    incidents, 
    roads, bridges, 
    news, 
    missingPersons, 
    supplies, 
    fusedWeather, 
    hazardRisks,
    governmentHospitals,
    hospitalSourceStatus,
    claimAnalyses,
    dorSummary,
    dorClosures,
    dorDataSource
  } = useAppState();
  
   
  const currentWeather = weather[currentLocationId];
  const navigate = useNavigate();
  
  const overallRisk = hazardRisks.find(r => r.hazard === 'Overall');
  const topHazard = hazardRisks.reduce((prev, current) => (prev.score > current.score) ? prev : current, hazardRisks[0]);
  
  // Filter data by current location
  const localIncidents = incidents.filter(i => i.locationId === currentLocationId && i.status === 'ACTIVE');
  const criticalIncidents = localIncidents.filter(i => i.severity >= 8);
  
  const blockedRoads = dorSummary 
    ? dorSummary.blockedRoads 
    : (roads || []).filter(r => r.status === 'BLOCKED').length;
  const blockedBridges = (bridges || []).filter(r => r.status === 'BLOCKED').length;
  const totalDisruptions = dorSummary 
    ? (dorSummary.blockedRoads + dorSummary.partiallyBlockedRoads) 
    : (blockedRoads + blockedBridges);
  const routeOpenPercentage = dorSummary 
    ? dorSummary.passablePercentage 
    : ((roads && roads.length > 0) ? Math.round(((roads.length - blockedRoads) / roads.length) * 100) : 100);

  const recentNews = [...news].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).slice(0, 3);
  const missingActive = missingPersons.filter(m => m.status === 'MISSING').length;
  const missingFound = missingPersons.filter(m => m.status === 'FOUND').length;

  const getFacilityDistance = (lat?: number, lng?: number) => {
    if (!lat || !lng) return null;
    if (userGeolocation) return Math.round(calculateDistanceKm(userGeolocation.lat, userGeolocation.lng, lat, lng) * 10) / 10;
    if (currentLocation?.lat && currentLocation?.lng) return Math.round(calculateDistanceKm(currentLocation.lat, currentLocation.lng, lat, lng) * 10) / 10;
    return null;
  };

  // Nearby Hospitals from authoritative Nepal Government MoHP source
  const nearbyHospitals = useMemo(() => {
    if (!governmentHospitals || governmentHospitals.length === 0) return [];
    
    // Check for hospitals matching current location's district
    const locName = (currentLocation?.name || '').toLowerCase();
    const districtMatches = governmentHospitals.filter(h => 
      locName.includes(h.district.toLowerCase()) || h.district.toLowerCase().includes(locName)
    );

    if (districtMatches.length > 0) {
      return districtMatches.slice(0, 3);
    }

    // If hospitals have calculated distance, sort by closest distance
    const withDistance = governmentHospitals.filter(h => getFacilityDistance(h.lat, h.lng) != null);
    if (withDistance.length > 0) {
      return [...withDistance].sort((a, b) => (getFacilityDistance(a.lat, a.lng) || 0) - (getFacilityDistance(b.lat, b.lng) || 0)).slice(0, 3);
    }

    // Fallback: sort by available free beds
    return [...governmentHospitals].sort((a, b) => b.availableBeds - a.availableBeds).slice(0, 3);
  }, [governmentHospitals, currentLocation, userGeolocation]);

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-6 gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Dashboard</h2>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            Situation Overview for <strong className="text-slate-900 dark:text-slate-200">{currentLocation?.name}</strong> 
            <Badge variant="outline" className="ml-2 text-[10px] border-emerald-500 text-emerald-700 dark:text-emerald-400 bg-emerald-50/50 dark:bg-emerald-950/30">
              REAL TELEMETRY
            </Badge>
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-slate-600 dark:text-slate-400 flex items-center font-medium">
            <span className="relative flex h-3 w-3 mr-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </span>
            Live Telemetry Feed
          </span>
          <Badge variant={overallRisk?.level === 'CRITICAL' ? 'critical' : overallRisk?.level === 'HIGH' ? 'danger' : 'success'}>
            {overallRisk?.level === 'CRITICAL' ? 'ALERT LEVEL 3' : overallRisk?.level === 'HIGH' ? 'ALERT LEVEL 2' : 'NORMAL'}
          </Badge>
        </div>
      </div>

      {/* CURRENT SITUATION */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className={cn(
          "relative overflow-hidden transition-colors",
          overallRisk?.level === 'CRITICAL' ? "border-red-200 dark:border-red-500/30 bg-red-50 dark:bg-red-500/5" : 
          overallRisk?.level === 'HIGH' ? "border-orange-200 dark:border-orange-500/30 bg-orange-50 dark:bg-orange-500/5" : 
          overallRisk?.level === 'MODERATE' || overallRisk?.level === 'ELEVATED' ? "border-yellow-200 dark:border-yellow-500/30 bg-yellow-50 dark:bg-yellow-500/5" : ""
        )}>
          <div className="absolute top-0 right-0 p-4 opacity-5 dark:opacity-10 text-red-900 dark:text-red-500"><AlertTriangle size={64} /></div>
          <p className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Overall Hazard Risk</p>
          <div className="mt-2 flex items-baseline gap-2">
            <span className={cn(
              "text-3xl font-bold",
              overallRisk?.level === 'CRITICAL' ? "text-red-600 dark:text-red-500" : 
              overallRisk?.level === 'HIGH' ? "text-orange-600 dark:text-orange-500" : 
              overallRisk?.level === 'MODERATE' || overallRisk?.level === 'ELEVATED' ? "text-yellow-600 dark:text-yellow-500" : 
              "text-emerald-600 dark:text-emerald-500"
            )}>
              {overallRisk?.level || 'LOW'}
            </span>
          </div>
          <p className={cn(
            "text-sm mt-2 font-medium",
            overallRisk?.level === 'CRITICAL' ? "text-red-700/70 dark:text-slate-400" : "text-slate-600 dark:text-slate-400"
          )}>
            {overallRisk?.level === 'LOW' 
              ? 'Normal baseline • Safe rivers & slopes' 
              : `Top Threat: ${topHazard?.hazard} (${topHazard?.score || 0}/100)`}
          </p>
        </Card>
        
        <Card>
          <div className="flex items-center justify-between mb-1">
            <p className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Live Weather</p>
            <a 
              href={currentLocation?.lat && currentLocation?.lng ? `https://open-meteo.com/en/docs#latitude=${currentLocation.lat}&longitude=${currentLocation.lng}` : 'https://open-meteo.com/'} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-[10px] text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-0.5 font-semibold"
              title="Inspect real-time meteorological source"
            >
              <span>Telemetry</span>
              <ExternalLink className="h-2.5 w-2.5" />
            </a>
          </div>
          <div className="mt-2 flex items-center gap-3">
            {(fusedWeather?.precipitationMm ?? 0) > 0.1 ? (
              <CloudRain className="h-8 w-8 text-blue-500 dark:text-blue-400 shrink-0" />
            ) : (
              <Sun className="h-8 w-8 text-amber-500 dark:text-amber-400 shrink-0" />
            )}
            <div>
              <span className="text-2xl font-bold text-slate-900 dark:text-white">{fusedWeather?.condition || 'Clear Sky'}</span>
            </div>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 font-medium">
            {fusedWeather?.temp || '--'}°C • {(fusedWeather?.precipitationMm ?? 0).toFixed(1)} mm/h (24h: {(fusedWeather?.precipitation24hMm ?? 0).toFixed(1)} mm)
          </p>
        </Card>

        <Card>
          <p className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Active Incidents</p>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-slate-900 dark:text-white">{localIncidents.length}</span>
            <span className="text-sm font-bold text-slate-500 dark:text-slate-400">in {currentLocation?.name}</span>
          </div>
          <div className="mt-2 flex gap-2">
            {criticalIncidents.length > 0 && <Badge variant="danger">{criticalIncidents.length} CRITICAL</Badge>}
            {localIncidents.length === 0 && <Badge variant="success">ALL CLEAR</Badge>}
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between mb-1">
            <p className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Road Status</p>
            <button 
              onClick={() => navigate('/routes')} 
              className="text-[10px] text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-0.5 font-semibold"
            >
              <span>DoR Live</span>
              <ArrowRight className="h-2.5 w-2.5" />
            </button>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className={cn(
              "text-3xl font-bold",
              routeOpenPercentage < 50 ? "text-red-600 dark:text-red-400" :
              routeOpenPercentage < 80 ? "text-orange-600 dark:text-orange-400" : "text-emerald-600 dark:text-emerald-400"
            )}>{routeOpenPercentage}%</span>
            <span className="text-sm font-bold text-slate-500 dark:text-slate-400">Passable</span>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 font-medium">
            {dorSummary ? `${totalDisruptions} active DoR closures • ${dorSummary.totalRoadsMonitored} highways monitored` : `${totalDisruptions} major disruption(s)`}
          </p>
        </Card>
      </div>

      {/* HOSPITAL MISSING-PERSON MATCHING NETWORK */}
      <HospitalMatchingNetworkCard 
        onOpenPortal={() => navigate('/hospital-matching')} 
        className="mt-8" 
      />

      {/* AI PRIORITY SECTION (BASELINE ACTIVE) */}
      <div className="mt-8">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold flex items-center text-blue-700 dark:text-blue-400">
            <Activity className="mr-2 h-5 w-5" />
            Baseline Priority Recommendations <Badge variant="outline" className="ml-2 text-[10px] border-blue-400 text-blue-700 dark:text-blue-300">LIVE</Badge>
          </h3>
          <Button variant="ghost" size="sm" onClick={() => navigate('/ai-priority')} className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300">
            View All Priorities <ArrowRight className="ml-1 h-4 w-4" />
          </Button>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {criticalIncidents.slice(0, 2).map((inc, i) => (
            <Card key={inc.id} className="border-orange-200 dark:border-orange-500/30">
              <CardHeader 
                title="Immediate Attention Required"
                action={<Badge variant="critical">PRIORITY</Badge>}
              />
              <div className="space-y-4">
                <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-lg border border-slate-200 dark:border-slate-800">
                  <p className="text-orange-700 dark:text-orange-400 font-bold mb-1">{inc.title}</p>
                  <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{inc.desc}</p>
                  <div className="mt-3 flex items-center justify-between">
                    <span className="text-[10px] font-bold bg-slate-200 dark:bg-slate-800 px-2 py-1 rounded text-slate-700 dark:text-slate-300">EST. {inc.peopleAffected} PEOPLE</span>
                    <Button variant="outline" size="sm" onClick={() => navigate('/routes')}>Review Action Plan</Button>
                  </div>
                </div>
              </div>
            </Card>
          ))}
          {criticalIncidents.length === 0 && (
            <Card className="col-span-2 py-8 text-center text-slate-500 dark:text-slate-400">
              No critical priorities identified in this region currently. Real-time monitoring active.
            </Card>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
        {/* MAP SECTION */}
        <div className="lg:col-span-2">
          <Card className="h-full min-h-[440px] flex flex-col overflow-hidden" noPadding>
            <div className="p-3.5 sm:p-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-900/50 shrink-0">
              <h3 className="font-bold flex items-center text-slate-900 dark:text-slate-100 text-sm">
                <MapPin className="mr-2 h-4 w-4 text-emerald-500 shrink-0" />
                Live Incident Map (Galli Maps)
              </h3>
              <div className="flex gap-2">
                <Badge variant="outline" className="bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border-emerald-300 dark:border-emerald-800 text-[10px]">
                  Galli Maps Live
                </Badge>
                <Badge variant="outline" className="text-[10px]">Incidents</Badge>
                <Badge variant="outline" className="text-[10px]">Weather</Badge>
              </div>
            </div>
            <div className="flex-1 relative w-full h-[400px] bg-slate-100/50 dark:bg-slate-950/50 overflow-hidden">
              {/* Incident Severity Map Index */}
              <div className="absolute bottom-3 left-3 z-[400] bg-white/95 dark:bg-slate-900/95 backdrop-blur-md px-3 py-2 rounded-lg border border-slate-200/90 dark:border-slate-800/90 shadow-md text-xs pointer-events-auto flex items-center gap-2.5">
                <span className="font-bold text-slate-800 dark:text-slate-200 text-[10px] uppercase tracking-wider">Severity:</span>
                <span className="flex items-center gap-1 text-[11px] text-slate-700 dark:text-slate-300 font-medium">
                  <span className="w-2 h-2 rounded-full bg-red-500 shrink-0"></span> High (8–10)
                </span>
                <span className="flex items-center gap-1 text-[11px] text-slate-700 dark:text-slate-300 font-medium">
                  <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0"></span> Mod (5–7)
                </span>
                <span className="flex items-center gap-1 text-[11px] text-slate-700 dark:text-slate-300 font-medium">
                  <span className="w-2 h-2 rounded-full bg-blue-500 shrink-0"></span> Low (1–4)
                </span>
              </div>

              <BaseMap className="h-full w-full absolute inset-0">
                {localIncidents.filter(inc => inc.lat && inc.lng).map(inc => (
                  <Marker 
                    key={`inc-${inc.id}`} 
                    position={[inc.lat, inc.lng]}
                    icon={createIncidentIcon(inc.severity)}
                  >
                    <Popup className="rounded-xl overflow-hidden shadow-xl border-0">
                      <div className="p-1">
                        <h4 className="font-bold text-slate-900 mb-1">{inc.title}</h4>
                        <p className="text-xs text-slate-600">Severity: {inc.severity}/10</p>
                      </div>
                    </Popup>
                  </Marker>
                ))}
              </BaseMap>
            </div>
          </Card>
        </div>

        {/* SUMMARY SECTION */}
        <div className="space-y-4">
          <Card>
            <CardHeader title="Latest Alerts" />
            <div className="space-y-3">
              {recentNews.length > 0 ? recentNews.map((alert, i) => (
                <div key={i} className="flex gap-3 pb-3 border-b border-slate-100 dark:border-slate-800 last:border-0 last:pb-0">
                  <ShieldAlert className={cn(
                    "h-5 w-5 shrink-0 mt-0.5",
                    alert.severity === 'CRITICAL' ? 'text-red-500' :
                    alert.severity === 'WARNING' ? 'text-orange-500' : 'text-blue-500'
                  )} />
                  <div>
                    <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{alert.title}</p>
                    <p className="text-xs font-medium text-slate-500 dark:text-slate-500 mt-0.5">{alert.timestamp}</p>
                  </div>
                </div>
              )) : (
                <p className="text-sm text-slate-500">No recent news.</p>
              )}
              <Button variant="ghost" size="sm" className="w-full mt-2 text-xs font-semibold">View all alerts</Button>
            </div>
          </Card>
          
          <Card>
            <CardHeader title="Missing Persons" />
            <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-950 rounded-lg border border-slate-200 dark:border-slate-800 mb-3">
              <div>
                <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{missingActive}</p>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Active Reports</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{missingFound}</p>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Found/Safe</p>
              </div>
            </div>
            <Button variant="outline" className="w-full">Access Registry</Button>
          </Card>

          {/* NEARBY HOSPITALS (NEPAL GOV MOHP REAL DATA) */}
          <Card>
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="font-semibold text-slate-900 dark:text-slate-100 tracking-tight flex items-center gap-1.5">
                  <Stethoscope className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  Nearby Hospitals
                </h3>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">
                  Nepal MoHP Free Health Portal
                </p>
              </div>
              <Badge variant={hospitalSourceStatus === 'LIVE' ? 'success' : 'outline'} className="text-[9px]">
                {hospitalSourceStatus === 'LIVE' ? 'REAL DATA' : 'CACHED'}
              </Badge>
            </div>

            <div className="space-y-2.5">
              {nearbyHospitals.length > 0 ? (
                nearbyHospitals.map(h => (
                  <div key={h.id} className="p-2.5 bg-slate-50 dark:bg-slate-950 rounded-lg border border-slate-200/80 dark:border-slate-800/80">
                    <div className="flex justify-between items-start gap-1">
                      <h4 className="font-semibold text-xs text-slate-900 dark:text-slate-100 leading-snug line-clamp-1">
                        {h.name}
                      </h4>
                      <span className={cn(
                        "text-[9px] font-bold px-1.5 py-0.5 rounded shrink-0",
                        h.occupancyStatus === 'FULL' || h.occupancyStatus === 'HIGH' ? "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400" :
                        h.occupancyStatus === 'MODERATE' ? "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400" :
                        "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400"
                      )}>
                        {h.occupancyStatus}
                      </span>
                    </div>

                    <div className="mt-1.5 flex items-center justify-between text-xs">
                      <span className="font-bold text-emerald-600 dark:text-emerald-400">
                        {h.availableBeds} beds available
                      </span>
                      <span className="text-slate-500 font-medium">
                        {h.occupancyPercentage}% occupied
                      </span>
                    </div>

                    <div className="mt-1 flex items-center justify-between text-[10px] text-slate-400">
                      <span>{h.district}</span>
                      {getFacilityDistance(h.lat, h.lng) != null ? (
                        <span>~{getFacilityDistance(h.lat, h.lng)} km</span>
                      ) : (
                        <span>Coords unverified</span>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-500 py-3 text-center">Loading hospital capacity data...</p>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
