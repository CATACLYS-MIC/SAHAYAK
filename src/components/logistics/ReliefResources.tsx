import React, { useEffect, useMemo, useState } from 'react';
import { Card, CardHeader, Badge } from '@/components/ui';
import { useAppState } from '@/lib/store';
import { evaluateResourceStatus } from '@/lib/calculations';
import { Package, RefreshCw, AlertTriangle, MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';
import { BaseMap } from '@/components/Map';
import { Circle, Popup } from 'react-leaflet';

interface DrrReliefArea {
  area: string;
  district: string;
  received: number;
  required: number;
  coveragePercent: number;
  lat?: number;
  lng?: number;
  sourceUrl: string;
}

export function ReliefResources() {
  const { supplies, locations } = useAppState();
  const [areas, setAreas] = useState<DrrReliefArea[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastRetrieved, setLastRetrieved] = useState<string | null>(null);
  const [sourceState, setSourceState] = useState<'LIVE' | 'UNAVAILABLE'>('UNAVAILABLE');

  const loadReliefData = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/drr-relief-resources');
      const data = await response.json();
      setAreas(Array.isArray(data.areas) ? data.areas : []);
      setSourceState(data.dataSource === 'LIVE' ? 'LIVE' : 'UNAVAILABLE');
      setLastRetrieved(data.retrievedAt || null);
    } catch {
      setAreas([]);
      setSourceState('UNAVAILABLE');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadReliefData();
    const interval = window.setInterval(loadReliefData, 5 * 60 * 1000);
    return () => window.clearInterval(interval);
  }, []);

  const mappedAreas = useMemo(() => areas.map(area => {
    const location = locations.find(candidate => {
      const name = `${candidate.name} ${candidate.region}`.toLowerCase();
      return name.includes(area.district.toLowerCase()) || area.district.toLowerCase().includes(candidate.name.toLowerCase());
    });
    return { ...area, location: area.lat && area.lng ? { lat: area.lat, lng: area.lng } : location };
  }), [areas, locations]);

  const getCoverageColor = (coverage: number) => coverage < 40 ? '#dc2626' : coverage < 70 ? '#f59e0b' : '#16a34a';

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
        <h3 className="text-xl font-bold flex items-center text-slate-900 dark:text-slate-100">
          <Package className="mr-2 h-5 w-5 text-blue-600 dark:text-blue-400" />
          Relief Resources Dashboard
        </h3>
        <div className="flex items-center gap-2">
          <Badge variant={sourceState === 'LIVE' ? 'success' : 'warning'} className="text-[10px]">
            {sourceState === 'LIVE' ? 'DRR PORTAL LIVE' : 'PORTAL UNAVAILABLE'}
          </Badge>
          <button onClick={loadReliefData} disabled={isLoading} className="p-1.5 rounded-md text-slate-500 hover:text-blue-600 hover:bg-slate-100 dark:hover:bg-slate-800" title="Refresh DRR relief data">
            <RefreshCw className={cn('h-4 w-4', isLoading && 'animate-spin')} />
          </button>
        </div>
      </div>

      {sourceState === 'UNAVAILABLE' ? (
        <Card className="border-amber-200 bg-amber-50/60 dark:bg-amber-950/20 dark:border-amber-900/50">
          <div className="p-5 flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-amber-900 dark:text-amber-200">Live DRR relief data is currently unavailable</h4>
              <p className="text-sm text-amber-800 dark:text-amber-300 mt-1">The Nepal DRR Portal relief pages are not returning data right now. Demo inventory is intentionally hidden so this dashboard does not present simulated ration totals as official information.</p>
              <a className="inline-block mt-3 text-xs font-semibold text-blue-700 dark:text-blue-300 underline" href="http://drrportal.gov.np/obtained" target="_blank" rel="noreferrer">Open DRR Portal relief records</a>
            </div>
          </div>
        </Card>
      ) : (
      <>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
        {areas.map(area => (
          <Card key={`${area.area}-${area.received}`} className="shadow-sm hover:shadow-md transition-shadow">
            <div className="p-4">
              <div className="flex justify-between items-start gap-2">
                <div><h4 className="font-bold text-slate-800 dark:text-slate-200">{area.area}</h4><p className="text-xs text-slate-500">{area.district}</p></div>
                <Badge variant={area.coveragePercent < 40 ? 'critical' : area.coveragePercent < 70 ? 'warning' : 'success'}>{area.coveragePercent}% covered</Badge>
              </div>
              <div className="mt-4 h-2 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden"><div className="h-full rounded-full" style={{ width: `${area.coveragePercent}%`, backgroundColor: getCoverageColor(area.coveragePercent) }} /></div>
              <div className="mt-3 grid grid-cols-2 gap-2 text-xs"><div><span className="text-slate-500 block">Received</span><strong>{area.received.toLocaleString()}</strong></div><div><span className="text-slate-500 block">Required</span><strong>{area.required.toLocaleString()}</strong></div></div>
            </div>
          </Card>
        ))}
      </div>
      <Card className="h-[460px] overflow-hidden" noPadding>
        <div className="p-3 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between"><h4 className="font-bold flex items-center gap-2"><MapPin className="h-4 w-4 text-blue-600" />Ration coverage by area</h4><span className="text-xs text-slate-500">Red: least received • Green: most received</span></div>
        <div className="h-[410px]"><BaseMap center={[27.7172, 85.3240]} zoom={7} className="h-full w-full">{mappedAreas.filter(area => area.location?.lat && area.location?.lng).map(area => <Circle key={area.area} center={[area.location!.lat!, area.location!.lng!]} radius={18000} pathOptions={{ color: getCoverageColor(area.coveragePercent), fillColor: getCoverageColor(area.coveragePercent), fillOpacity: 0.5, weight: 2 }}><Popup><strong>{area.area}</strong><br />{area.coveragePercent}% received<br />{area.received.toLocaleString()} / {area.required.toLocaleString()}</Popup></Circle>)}</BaseMap></div>
      </Card>
      </>
      )}

      {sourceState === 'LIVE' && lastRetrieved && <p className="text-[10px] text-slate-400">Source: Nepal DRR Portal • Retrieved {new Date(lastRetrieved).toLocaleString()}</p>}

      {/* Keep the existing local inventory view available only below a live source. */}
      {false && <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
        {supplies.map(supply => {
          const evalStatus = evaluateResourceStatus(supply.available, supply.required, supply.incoming);
          return (
            <Card key={supply.id} className="flex flex-col h-full shadow-sm hover:shadow-md transition-shadow">
              <div className="p-4 flex-1">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-bold text-slate-800 dark:text-slate-200">{supply.name}</h4>
                  <Badge variant={evalStatus.badgeVariant}>{evalStatus.label}</Badge>
                </div>
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-4">{supply.category} • {supply.warehouseName}</p>
                
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="bg-slate-50 dark:bg-slate-900 rounded p-2 text-center">
                    <p className="text-[10px] font-bold uppercase text-slate-500 mb-1">Available</p>
                    <p className="font-bold text-slate-700 dark:text-slate-300 text-lg">
                      {supply.available.toLocaleString()}
                    </p>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-900 rounded p-2 text-center">
                    <p className="text-[10px] font-bold uppercase text-slate-500 mb-1">Required</p>
                    <p className="font-bold text-slate-700 dark:text-slate-300 text-lg">
                      {supply.required.toLocaleString()}
                    </p>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-900 rounded p-2 text-center">
                    <p className="text-[10px] font-bold uppercase text-slate-500 mb-1">Incoming</p>
                    <p className="font-bold text-slate-700 dark:text-slate-300">
                      {supply.incoming.toLocaleString()}
                    </p>
                  </div>
                  <div className={cn("rounded p-2 text-center border", 
                      evalStatus.shortageAmount > 0 ? "bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-900/50" : "bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-900/50"
                  )}>
                    <p className={cn("text-[10px] font-bold uppercase mb-1",
                       evalStatus.shortageAmount > 0 ? "text-red-600 dark:text-red-400" : "text-emerald-600 dark:text-emerald-400"
                    )}>
                      {evalStatus.shortageAmount > 0 ? 'Shortage' : 'Surplus'}
                    </p>
                    <p className={cn("font-bold",
                       evalStatus.shortageAmount > 0 ? "text-red-700 dark:text-red-300" : "text-emerald-700 dark:text-emerald-300"
                    )}>
                      {evalStatus.shortageAmount > 0 ? evalStatus.shortageAmount.toLocaleString() : evalStatus.surplusAmount.toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
              <div className="px-4 py-2 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-800 text-[10px] text-slate-500 flex justify-between rounded-b-lg">
                <span>Updated: {supply.lastUpdated}</span>
                <span className="font-medium text-blue-600 dark:text-blue-400">{supply.dataSourceType}</span>
              </div>
            </Card>
          );
        })}
      </div>}
    </section>
  );
}
