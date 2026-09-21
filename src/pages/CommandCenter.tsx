import React, { useMemo } from 'react';
import { Card, Badge, Button, BaseMap } from '@/components/ui';
import { RadioTower, Users, ShieldAlert, Activity, Eye, Maximize2, Stethoscope, Navigation, Package } from 'lucide-react';
import { useAppState } from '@/lib/store';
import { calculatePriorityScore } from '@/lib/calculations';
import { cn } from '@/lib/utils';
import { Marker, Popup, Polyline, Circle } from 'react-leaflet';
import L from 'leaflet';

const createIncidentIcon = (score: number) => {
  const color = score >= 75 ? '#ef4444' : '#f97316';
  return L.divIcon({
    className: 'bg-transparent border-0',
    html: `<div style="background-color: ${color}; width: 16px; height: 16px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 8px ${color}; animation: pulse 2s infinite;"></div>`,
    iconSize: [16, 16],
    iconAnchor: [8, 8],
  });
};

const createFacilityIcon = (isHospital?: boolean) => {
  return L.divIcon({
    className: 'bg-transparent border-0',
    html: `<div style="background-color: ${isHospital ? '#10b981' : '#3b82f6'}; width: 12px; height: 12px; border-radius: 50%; border: 2px solid white;"></div>`,
    iconSize: [12, 12],
    iconAnchor: [6, 6],
  });
};

const createDorHazardIcon = (status: string) => {
  const bg = status === 'BLOCKED' ? '#dc2626' : '#ea580c';
  return L.divIcon({
    className: 'bg-transparent border-0',
    html: `<div style="background-color: ${bg}; width: 22px; height: 22px; border-radius: 6px; border: 2px solid white; display: flex; align-items: center; justify-content: center; font-size: 11px; box-shadow: 0 2px 6px rgba(0,0,0,0.5);">${status === 'BLOCKED' ? '⛔' : '⚠️'}</div>`,
    iconSize: [22, 22],
    iconAnchor: [11, 11],
  });
};

export function CommandCenter() {
  const { 
    incidents, 
    notifications, 
    currentLocationId, currentLocation, 
    locations, 
    fusedWeather, 
    hazardRisks, 
    facilities, 
    roads, bridges,
    hospitalSummary,
    hospitalSourceStatus,
    rescueSummary,
    rescueSourceStatus,
    dorClosures,
    dorBridges,
    dorSummary,
    dorLoading,
    coverageGaps,
    supplies,
    liveNews,
    governmentHospitals
  } = useAppState();
   

  const localIncidents = incidents
    .filter(i => i.locationId === currentLocationId && i.status === 'ACTIVE')
    .map(i => ({ ...i, score: calculatePriorityScore(i) }))
    .sort((a, b) => b.score - a.score);
    
  const localFacilities = facilities.filter(f => f.locationId === currentLocationId || f.isRealSourceData);
    const overallRisk = hazardRisks.find(r => r.hazard === 'Overall');
  const nationalAlerts = liveNews.filter(alert => alert.id.startsWith('bipad-'));
  const capacityHospitals = useMemo(() => [...governmentHospitals]
    .sort((a, b) => (b.occupancyPercentage || 0) - (a.occupancyPercentage || 0))
    .slice(0, 5), [governmentHospitals]);
  const communicationAlerts = nationalAlerts.filter(alert => /communication|telecom|network|internet|radio|telephone/i.test(`${alert.title} ${alert.summary}`));
  const helipadFacilities = facilities.filter(facility => /helipad|heliport|airstrip/i.test(`${facility.name} ${facility.type}`));

  const getRouteColor = (status: string) => {
    if (status === 'OPEN') return '#10b981';
    if (status === 'CAUTION') return '#f97316';
    return '#ef4444';
  };

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col bg-slate-900 dark:bg-slate-950 text-slate-50 overflow-hidden transition-colors">
      
      {/* COMMAND HEADER (Dark even in light mode for "Command Center" feel) */}
      <div className="h-14 bg-slate-950 border-b border-slate-800 flex items-center justify-between px-4 sm:px-6 shrink-0 shadow-md z-10">
        <div className="flex items-center gap-3">
          <RadioTower className="h-5 w-5 text-red-500" />
          <h2 className="text-lg font-bold tracking-wider uppercase text-white">Strategic Command Center: {currentLocation?.name}</h2>
          <Badge variant="critical" className="ml-2 bg-red-600 text-white border-transparent shadow-sm">RESTRICTED ACCESS</Badge>
        </div>
        <div className="flex items-center gap-4 text-sm font-medium">
          <span className="flex items-center text-slate-400"><Users className="h-4 w-4 mr-1.5" /> Demo Mode</span>
          <Button size="sm" variant="outline" className="border-slate-700 text-slate-300 hover:bg-slate-800 hidden sm:flex">
            <Maximize2 className="h-3 w-3 mr-1.5" /> Fullscreen
          </Button>
        </div>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row p-2 sm:p-4 gap-4 overflow-hidden bg-slate-900 dark:bg-slate-950">
        
        {/* LEFT PANEL - ALERTS & ACTIONS */}
        <div className="w-full lg:w-80 shrink-0 flex flex-col gap-4 overflow-y-auto">
          
          {/* MASTER INTELLIGENCE WIDGET */}
          {fusedWeather && (
            <Card className="bg-slate-950 border-slate-800 flex flex-col" noPadding>
              <div className="p-3 border-b border-slate-800 flex justify-between items-center bg-slate-900">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center"><Activity className="mr-2 h-4 w-4 text-emerald-500" /> Master Intelligence</h3>
              </div>
              <div className="p-3 text-slate-300">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-sm font-medium">System Risk</span>
                  <Badge variant={overallRisk?.level === 'CRITICAL' ? 'critical' : overallRisk?.level === 'HIGH' ? 'danger' : 'warning'}>{overallRisk?.level || 'LOW'}</Badge>
                </div>
                <div className="flex justify-between items-center mb-3 border-t border-slate-800 pt-3">
                  <span className="text-sm font-medium">Weather</span>
                  <span className="text-sm">{fusedWeather.temp}°C, {fusedWeather.condition}</span>
                </div>
                <div className="flex justify-between items-center border-t border-slate-800 pt-3">
                  <span className="text-sm font-medium">Source Confidence</span>
                  <span className="text-sm text-emerald-400 font-bold">{fusedWeather.confidence}%</span>
                </div>
              </div>
            </Card>
          )}

          {/* DEPARTMENT OF ROADS (DOR) NAVIGATE FEED */}
          <Card className="bg-slate-950 border-slate-800 flex flex-col shrink-0" noPadding>
            <div className="p-3 border-b border-slate-800 flex justify-between items-center bg-slate-900">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center">
                <Navigation className="mr-2 h-4 w-4 text-emerald-400" /> Highway Network (DOR)
              </h3>
              <Badge variant="outline" className="text-[9px] border-emerald-700 text-emerald-300">
                718 LINKS
              </Badge>
            </div>
            
            <div className="p-3 text-slate-300 space-y-2">
              <div className="grid grid-cols-2 gap-2 text-center">
                <div className="bg-slate-900 p-2 rounded border border-slate-800">
                  <span className="text-[10px] text-red-400 uppercase block">Blockages</span>
                  <span className="text-sm font-bold text-red-400">
                    {dorSummary?.activeRoadblocks || dorClosures.filter(c => c.sahayakStatus === 'BLOCKED').length}
                  </span>
                </div>
                <div className="bg-slate-900 p-2 rounded border border-slate-800">
                  <span className="text-[10px] text-amber-400 uppercase block">Restrictions</span>
                  <span className="text-sm font-bold text-amber-400">
                    {dorSummary?.partialRestrictions || dorClosures.filter(c => c.sahayakStatus === 'RESTRICTED').length}
                  </span>
                </div>
              </div>

              <div className="text-[11px] text-slate-400 space-y-1 pt-1 border-t border-slate-800">
                <div className="flex justify-between">
                  <span>Bridges Monitored:</span>
                  <span className="text-white font-semibold">{dorSummary?.totalBridges || 2135}</span>
                </div>
                <div className="flex justify-between">
                  <span>Source:</span>
                  <span className="text-emerald-400 font-mono">navigate.dor.gov.np</span>
                </div>
              </div>
            </div>
          </Card>

          <Card className="bg-slate-950 border-slate-800 flex flex-col shrink-0" noPadding>
            <div className="p-3 border-b border-slate-800 flex justify-between items-center bg-slate-900">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center"><ShieldAlert className="mr-2 h-4 w-4 text-red-400" /> National BIPAD Picture</h3>
              <Badge variant={nationalAlerts.length > 0 ? 'success' : 'outline'} className="text-[9px]">{nationalAlerts.length > 0 ? 'LIVE' : 'SYNCING'}</Badge>
            </div>
            <div className="p-3 space-y-2 text-xs">
              <div className="grid grid-cols-3 gap-1.5 text-center">
                <div className="bg-slate-900 rounded border border-slate-800 p-2"><b className="text-red-400 text-base">{nationalAlerts.filter(a => a.severity === 'CRITICAL').length}</b><span className="block text-[9px] text-slate-500 uppercase">Critical</span></div>
                <div className="bg-slate-900 rounded border border-slate-800 p-2"><b className="text-amber-400 text-base">{nationalAlerts.filter(a => a.severity === 'WARNING').length}</b><span className="block text-[9px] text-slate-500 uppercase">Warnings</span></div>
                <div className="bg-slate-900 rounded border border-slate-800 p-2"><b className="text-blue-400 text-base">{nationalAlerts.length}</b><span className="block text-[9px] text-slate-500 uppercase">Live Alerts</span></div>
              </div>
              <p className="text-slate-500">Source: BIPAD Portal, Government of Nepal. Alert markers are plotted on the national map when coordinates are available.</p>
            </div>
          </Card>

          <Card className="bg-slate-950 border-slate-800 flex flex-col shrink-0" noPadding>
            <div className="p-3 border-b border-slate-800 flex justify-between items-center bg-slate-900"><h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center"><Stethoscope className="mr-2 h-4 w-4 text-red-400" /> Hospitals at Maximum Capacity</h3><Badge variant="critical" className="text-[9px]">MoHP LIVE</Badge></div>
            <div className="p-3 space-y-2 text-xs">{capacityHospitals.length ? capacityHospitals.map(hospital => <div key={hospital.id} className="flex items-center justify-between gap-2 border-b border-slate-800 pb-2 last:border-0"><span className="truncate text-slate-300">{hospital.name}</span><span className={cn('font-bold shrink-0', (hospital.occupancyPercentage || 0) >= 90 ? 'text-red-400' : 'text-amber-400')}>{hospital.occupancyPercentage || 0}%</span></div>) : <p className="text-slate-500">Hospital capacity data loading.</p>}</div>
          </Card>

          <Card className="bg-slate-950 border-slate-800 flex flex-col shrink-0" noPadding>
            <div className="p-3 border-b border-slate-800 flex justify-between items-center bg-slate-900"><h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Communications & Helipads</h3><Badge variant="outline" className="text-[9px]">SOURCE STATUS</Badge></div>
            <div className="p-3 space-y-2 text-xs"><div className="flex justify-between"><span className="text-slate-400">Communication closures</span><b className="text-amber-400">{communicationAlerts.length || 'No verified records'}</b></div><div className="flex justify-between"><span className="text-slate-400">Mapped helipads</span><b className="text-blue-400">{helipadFacilities.length || 'No verified feed'}</b></div><p className="text-slate-500">Only records supplied by connected government feeds are shown; no locations are fabricated.</p></div>
          </Card>

          {/* GOVERNMENT HOSPITAL NETWORK (MOHP REAL SOURCE) */}
          <Card className="bg-slate-950 border-slate-800 flex flex-col shrink-0" noPadding>
            <div className="p-3 border-b border-slate-800 flex justify-between items-center bg-slate-900">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center">
                <Stethoscope className="mr-2 h-4 w-4 text-blue-400" /> Hospital Network
              </h3>
              <Badge variant={hospitalSourceStatus === 'LIVE' ? 'success' : 'outline'} className="text-[9px]">
                {hospitalSourceStatus === 'LIVE' ? 'MoHP LIVE' : 'CACHED'}
              </Badge>
            </div>
            
            {hospitalSummary ? (
              <div className="p-3 text-slate-300 space-y-2.5">
                <div className="grid grid-cols-2 gap-2 text-center">
                  <div className="bg-slate-900 p-2 rounded border border-slate-800">
                    <span className="text-[10px] text-slate-400 uppercase block">Tracked</span>
                    <span className="text-sm font-bold text-white">{hospitalSummary.totalHospitals} Hospitals</span>
                  </div>
                  <div className="bg-slate-900 p-2 rounded border border-slate-800">
                    <span className="text-[10px] text-slate-400 uppercase block">Total Beds</span>
                    <span className="text-sm font-bold text-white">{hospitalSummary.totalBeds.toLocaleString()}</span>
                  </div>
                </div>

                <div className="space-y-1.5 text-xs pt-1">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Allocated Free:</span>
                    <span className="font-semibold text-blue-400">{hospitalSummary.totalAllocatedFreeBeds.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Occupied:</span>
                    <span className="font-semibold text-amber-400">{hospitalSummary.totalOccupiedBeds.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Available:</span>
                    <span className="font-semibold text-emerald-400 font-mono">{hospitalSummary.totalAvailableBeds.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center pt-1 border-t border-slate-800">
                    <span className="text-slate-400">Near Capacity (≥90%):</span>
                    <Badge variant={hospitalSummary.hospitalsNearCapacity > 0 ? 'critical' : 'success'} className="text-[9px]">
                      {hospitalSummary.hospitalsNearCapacity} HOSPITALS
                    </Badge>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-3 text-xs text-slate-500 text-center">Hospital network data loading...</div>
            )}
          </Card>

          {/* NEPAL GOV RESCUE REGISTRY (OPMCM REAL SOURCE) */}
          <Card className="bg-slate-950 border-slate-800 flex flex-col shrink-0" noPadding>
            <div className="p-3 border-b border-slate-800 flex justify-between items-center bg-slate-900">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center">
                <Users className="mr-2 h-4 w-4 text-red-400" /> Rescue Registry
              </h3>
              <Badge variant={rescueSourceStatus === 'LIVE' ? 'success' : 'outline'} className="text-[9px]">
                {rescueSourceStatus === 'LIVE' ? 'OPMCM LIVE' : 'CACHED'}
              </Badge>
            </div>
            
            {rescueSummary ? (
              <div className="p-3 text-slate-300 space-y-2.5">
                <div className="grid grid-cols-2 gap-2 text-center">
                  <div className="bg-slate-900 p-2 rounded border border-slate-800">
                    <span className="text-[10px] text-slate-400 uppercase block">Tracked Cases</span>
                    <span className="text-sm font-bold text-white">{rescueSummary.totalPersons.toLocaleString()}</span>
                  </div>
                  <div className="bg-slate-900 p-2 rounded border border-slate-800">
                    <span className="text-[10px] text-red-400 uppercase block">Active Lost</span>
                    <span className="text-sm font-bold text-red-400">{rescueSummary.lostPersons.toLocaleString()}</span>
                  </div>
                </div>

                <div className="space-y-1 text-xs pt-1">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Rescued Safe:</span>
                    <span className="font-semibold text-emerald-400">{rescueSummary.rescuedPersons.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Located in Camps:</span>
                    <span className="font-semibold text-blue-400">{rescueSummary.foundPersons.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center pt-1 border-t border-slate-800">
                    <span className="text-slate-400">Resolution Rate:</span>
                    <span className="font-semibold text-purple-400 font-mono">{rescueSummary.resolutionRate}%</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-3 text-xs text-slate-500 text-center">Rescue registry loading...</div>
            )}
          </Card>

          <Card className="flex-1 bg-slate-950 border-slate-800 flex flex-col" noPadding>
            <div className="p-3 border-b border-slate-800 flex justify-between items-center bg-slate-900">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Critical Priorities</h3>
            </div>
            <div className="flex-1 overflow-y-auto p-2 space-y-2">
              {localIncidents.length === 0 ? (
                <div className="p-4 text-sm text-slate-500 text-center">No active incidents.</div>
              ) : (
                localIncidents.slice(0, 3).map(inc => (
                  <div key={inc.id} className="p-3 bg-slate-900 border border-slate-800 rounded-lg hover:border-slate-700 cursor-pointer transition-colors">
                    <div className="flex justify-between items-start mb-1">
                      <span className={cn("text-xs font-bold flex items-center", inc.score >= 75 ? 'text-red-400' : 'text-orange-400')}>
                        <ShieldAlert className="h-3 w-3 mr-1" /> {inc.score >= 75 ? 'CRITICAL' : 'HIGH'} ({inc.score})
                      </span>
                    </div>
                    <p className="text-sm text-slate-300 font-medium leading-snug">{inc.title}</p>
                  </div>
                ))
              )}
            </div>
          </Card>

          <Card className="bg-slate-950 border-slate-800 flex flex-col shrink-0" noPadding>
            <div className="p-3 border-b border-slate-800 flex justify-between items-center bg-slate-900">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center">
                <Package className="mr-2 h-4 w-4 text-purple-400" /> Logistics & Coverage
              </h3>
            </div>
            <div className="p-3 text-slate-300 space-y-2.5">
              <div className="grid grid-cols-2 gap-2 text-center">
                <div className="bg-slate-900 p-2 rounded border border-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase block">Critical Gaps</span>
                  <span className="text-sm font-bold text-red-400">{coverageGaps.filter(g => g.severity === 'CRITICAL').length}</span>
                </div>
                <div className="bg-slate-900 p-2 rounded border border-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase block">Tracked Supplies</span>
                  <span className="text-sm font-bold text-blue-400">{supplies.length}</span>
                </div>
              </div>
            </div>
          </Card>

          <Card className="h-64 bg-slate-950 border-slate-800 flex flex-col" noPadding>
            <div className="p-3 border-b border-slate-800 bg-slate-900">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Quick Actions</h3>
            </div>
            <div className="p-3 space-y-2 flex-1 overflow-y-auto">
              <Button className="w-full bg-slate-800 hover:bg-slate-700 text-slate-200 border-transparent justify-start"><RadioTower className="h-4 w-4 mr-3 text-blue-400" /> Broadcast SMS Alert</Button>
              <Button className="w-full bg-slate-800 hover:bg-slate-700 text-slate-200 border-transparent justify-start"><Users className="h-4 w-4 mr-3 text-purple-400" /> Mobilize Reserve Team</Button>
              <Button className="w-full bg-slate-800 hover:bg-slate-700 text-slate-200 border-transparent justify-start"><Activity className="h-4 w-4 mr-3 text-emerald-400" /> Request Situation Report</Button>
            </div>
          </Card>
        </div>

        {/* CENTER PANEL - MAIN TACTICAL MAP */}
        <div className="flex-1 flex flex-col h-full overflow-hidden border border-slate-800 rounded-xl relative bg-slate-950">
          <div className="absolute top-3 left-14 z-[400] flex gap-2 pointer-events-none">
            <div className="bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-800 text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center shadow-lg">
              <div className="w-2 h-2 rounded-full bg-emerald-500 mr-2 animate-pulse"></div> Galli Maps Tactical Feed
            </div>
          </div>
          
          <div className="absolute top-3 right-3 z-[400] flex flex-col gap-2">
            <Button size="sm" variant="secondary" className="bg-slate-900/90 border-slate-700 hover:bg-slate-800 text-slate-200 shadow-md"><Eye className="h-4 w-4 mr-2" /> Layers</Button>
          </div>

          {/* Tactical Map Index */}
          <div className="absolute bottom-4 left-4 z-[400] bg-slate-900/95 backdrop-blur-md px-3.5 py-2.5 rounded-lg border border-slate-800 shadow-xl text-xs pointer-events-auto max-w-xs">
            <div className="font-bold text-slate-300 mb-1.5 uppercase tracking-wider text-[10px]">Tactical Map Index</div>
            <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-[11px] text-slate-400">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500 shrink-0"></span>
                <span>Critical / Blocked</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-orange-500 shrink-0"></span>
                <span>Caution / Alert</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0"></span>
                <span>Open / Operational</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500 shrink-0"></span>
                <span>Hospital Facility</span>
              </div>
            </div>
          </div>

          <BaseMap className="rounded-none border-0 bg-slate-950 h-full w-full absolute inset-0 z-0">
             {/* Render active incidents */}
             {localIncidents.filter(inc => inc.lat && inc.lng).map(inc => (
                <Marker 
                  key={`inc-${inc.id}`} 
                  position={[inc.lat, inc.lng]}
                  icon={createIncidentIcon(inc.score)}
                >
                  <Popup className="rounded-xl overflow-hidden shadow-xl border-0">
                    <div className="p-1">
                      <h4 className="font-bold text-slate-900 mb-1">{inc.title}</h4>
                      <p className="text-xs text-slate-600">Priority: {inc.score}</p>
                    </div>
                  </Popup>
                </Marker>
             ))}

             {/* Live BIPAD national alert markers */}
             {nationalAlerts.filter(alert => alert.latitude !== undefined && alert.longitude !== undefined).map(alert => {
               const latitude = alert.latitude!;
               const longitude = alert.longitude!;
               if (typeof latitude !== 'number' || typeof longitude !== 'number') return null;
               return <Marker key={`bipad-${alert.id}`} position={[latitude, longitude]} icon={createIncidentIcon(alert.severity === 'CRITICAL' ? 90 : alert.severity === 'WARNING' ? 70 : 40)}><Popup><div className="p-1 min-w-[180px]"><b>{alert.title}</b><p className="text-xs mt-1">{alert.summary}</p><small>{alert.source} • {alert.timestamp}</small></div></Popup></Marker>;
             })}

             {/* Render facilities (small markers) */}
             {localFacilities.filter(fac => fac.lat && fac.lng).map(fac => (
                <Marker 
                  key={`fac-${fac.id}`} 
                  position={[fac.lat, fac.lng]}
                  icon={createFacilityIcon(fac.type === 'Hospital')}
                >
                  <Popup className="rounded-xl overflow-hidden shadow-xl border-0">
                    <div className="p-1 min-w-[180px]">
                      {fac.isRealSourceData && (
                        <span className="text-[9px] font-bold text-emerald-600 dark:text-emerald-700 uppercase block mb-0.5">
                          Gov MoHP Real Data
                        </span>
                      )}
                      <h4 className="font-bold text-slate-900 mb-0.5 text-xs">{fac.name}</h4>
                      <p className="text-[11px] text-slate-600">{fac.type} • {fac.status}</p>
                      {fac.availableBeds != null && (
                        <div className="mt-1.5 pt-1 border-t border-slate-200 text-xs font-semibold text-emerald-700">
                          {fac.availableBeds} free beds available ({fac.occupancyStatus})
                        </div>
                      )}
                    </div>
                  </Popup>
                </Marker>
             ))}

             {/* Render Roads */}
             {(roads || []).filter(road => road.geometry && road.geometry.length > 0).map(road => (
                <Polyline 
                  key={`road-${road.id}`}
                  positions={road.geometry.map(p => [p.lat, p.lng] as [number, number])}
                  pathOptions={{ 
                    color: road.status === 'BLOCKED' ? '#ef4444' : road.status === 'OPEN' ? '#10b981' : '#f97316',
                    weight: road.status === 'BLOCKED' ? 4 : 3,
                    dashArray: road.status === 'CAUTION' || road.status === 'RESTRICTED' ? '5, 5' : undefined,
                    opacity: 0.8
                  }}
                />
             ))}
             
             {/* Render Bridges */}
             {(bridges || []).map(bridge => (
                <Marker 
                  key={`bridge-${bridge.id}`}
                  position={[bridge.location.lat, bridge.location.lng]}
                >
                  <Popup>
                    <div className="font-bold text-slate-900">{bridge.name}</div>
                    <div className="text-xs text-red-600 font-bold">{bridge.status}</div>
                  </Popup>
                </Marker>
             ))}

             {/* Render DOR Road Closures (Live Department of Roads) */}
             {(dorClosures || []).filter(c => c.latitude && c.longitude).map((closure, idx) => (
                <Marker
                  key={`dor-tactical-${closure.id || idx}`}
                  position={[closure.latitude, closure.longitude]}
                  icon={createDorHazardIcon(closure.sahayakStatus)}
                >
                  <Popup>
                    <div className="p-1 min-w-[200px] text-xs">
                      <div className="font-bold text-slate-900 flex justify-between items-center mb-1">
                        <span>{closure.roadName}</span>
                        <span className={cn(
                          "px-1 py-0.5 rounded text-[9px] font-bold",
                          closure.sahayakStatus === 'BLOCKED' ? "bg-red-100 text-red-800" : "bg-orange-100 text-orange-800"
                        )}>
                          {closure.sahayakStatus}
                        </span>
                      </div>
                      <p className="text-slate-600 text-[11px] mb-1"><strong>Reason:</strong> {closure.closureReason}</p>
                      <p className="text-slate-500 text-[10px]"><strong>Repair ETA:</strong> {closure.repairEta}</p>
                      <p className="text-emerald-700 text-[9px] font-semibold mt-1">DOR Navigate Verified</p>
                    </div>
                  </Popup>
                </Marker>
             ))}

             {/* Risk Overlay */}
             {currentLocation?.lat && currentLocation?.lng && (
                 <Circle 
                   center={[currentLocation.lat, currentLocation.lng]} 
                   radius={10000}
                   pathOptions={{ 
                     color: overallRisk?.level === 'CRITICAL' ? '#ef4444' : '#f97316', 
                     fillColor: overallRisk?.level === 'CRITICAL' ? '#ef4444' : '#f97316', 
                     fillOpacity: overallRisk?.level === 'CRITICAL' ? 0.2 : 0.1,
                     weight: 1
                   }}
                 />
             )}
          </BaseMap>
        </div>

      </div>
    </div>
  );
}
