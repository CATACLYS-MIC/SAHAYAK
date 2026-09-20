import React from 'react';
import { Card, Badge } from '@/components/ui';
import { useAppState } from '@/lib/store';
import { MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';

export function LocationResourceDemands() {
  const { resourceDemands } = useAppState();

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
        <h3 className="text-xl font-bold flex items-center text-slate-900 dark:text-slate-100">
          <MapPin className="mr-2 h-5 w-5 text-indigo-600 dark:text-indigo-400" />
          Location-Based Resource Demand
        </h3>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {resourceDemands.map(location => (
          <Card key={location.locationId} className="shadow-sm">
            <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex justify-between items-start">
              <div>
                <h4 className="font-bold text-lg text-slate-900 dark:text-slate-100">{location.locationName}</h4>
                <p className="text-sm font-medium text-slate-500">{location.district}</p>
              </div>
              <Badge variant={
                location.priority === 'CRITICAL' ? 'critical' : 
                location.priority === 'HIGH' ? 'danger' : 
                location.priority === 'MODERATE' ? 'warning' : 'info'
              }>
                {location.priority} PRIORITY
              </Badge>
            </div>
            
            <div className="p-4 sm:p-5 grid grid-cols-2 gap-4 mb-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/30">
              <div>
                <p className="text-[10px] font-bold uppercase text-slate-500 mb-1">Affected Population</p>
                {location.affectedPopulation !== null ? (
                  <>
                    <p className="font-bold text-slate-800 dark:text-slate-200 text-lg">{location.affectedPopulation.toLocaleString()}</p>
                    <p className="text-[10px] text-slate-400 mt-1">{location.populationSource}</p>
                  </>
                ) : (
                  <p className="text-sm italic text-slate-400">Population data unavailable.</p>
                )}
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase text-slate-500 mb-1">Road Access</p>
                <div className="flex items-center gap-2">
                  <Badge variant={
                    location.roadAccessibility === 'OPEN' ? 'success' :
                    location.roadAccessibility === 'CAUTION' ? 'warning' :
                    location.roadAccessibility === 'RESTRICTED' ? 'danger' : 'critical'
                  }>{location.roadAccessibility}</Badge>
                </div>
                <p className="text-xs text-slate-500 mt-1 line-clamp-2">{location.dorRoadCondition}</p>
              </div>
            </div>

            <div className="p-4 sm:p-5">
              <h5 className="text-xs font-bold uppercase text-slate-500 mb-3 tracking-wider">Verified Resource Shortages</h5>
              <div className="space-y-3">
                {location.demands.map((demand, idx) => (
                  <div key={idx} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded">
                    <div className="flex-1">
                      <p className="font-medium text-slate-800 dark:text-slate-200 text-sm">{demand.resourceName}</p>
                      <div className="flex gap-4 mt-1 text-xs text-slate-500">
                        <span>Req: {demand.required.toLocaleString()}</span>
                        <span>Avail: {demand.available.toLocaleString()}</span>
                      </div>
                    </div>
                    <div className={cn("text-right font-bold px-3 py-1 rounded bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border border-red-100 dark:border-red-900/30",
                      demand.shortage <= 0 ? "bg-emerald-50 text-emerald-700 border-emerald-100" : ""
                    )}>
                      {demand.shortage > 0 ? `Short: ${demand.shortage.toLocaleString()} ${demand.unit}` : 'Met'}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </section>
  );
}
