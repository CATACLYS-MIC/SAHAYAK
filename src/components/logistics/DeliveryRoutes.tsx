import React from 'react';
import { Card, Badge } from '@/components/ui';
import { useAppState } from '@/lib/store';
import { Route as RouteIcon, MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';

export function DeliveryRoutes() {
  const { deliveryRoutes } = useAppState();

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
        <h3 className="text-xl font-bold flex items-center text-slate-900 dark:text-slate-100">
          <RouteIcon className="mr-2 h-5 w-5 text-indigo-600 dark:text-indigo-400" />
          Disaster-Aware Logistics Routes
        </h3>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {deliveryRoutes.map(plan => (
          <Card key={plan.id} className="overflow-hidden">
            <div className="p-4 sm:p-5 bg-slate-50 dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800">
              <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold">W</div>
                  <div>
                    <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Source</p>
                    <p className="font-bold text-slate-900 dark:text-slate-100">{plan.sourceWarehouseName}</p>
                  </div>
                </div>
                <div className="hidden sm:block text-slate-300 dark:text-slate-700">→</div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center text-emerald-600 dark:text-emerald-400 font-bold">
                    <MapPin className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Destination</p>
                    <p className="font-bold text-slate-900 dark:text-slate-100">{plan.destinationLocationName}</p>
                  </div>
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-800">
                <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Payload: <span className="font-normal text-slate-600 dark:text-slate-400">{plan.resourcePayload}</span></p>
              </div>
            </div>

            <div className="p-0">
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {plan.routes.map((route) => (
                  <div key={route.id} className={cn("p-4 sm:p-5", route.isRecommended ? "bg-blue-50/50 dark:bg-blue-900/10" : "")}>
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-slate-900 dark:text-slate-100">{route.name}</h4>
                        {route.isRecommended && <Badge variant="success">Recommended</Badge>}
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-slate-800 dark:text-slate-200">{route.distanceKm} km</p>
                        <p className="text-xs text-slate-500">{Math.round(route.estimatedMinutes / 60)}h {route.estimatedMinutes % 60}m</p>
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap gap-2 mb-3 mt-3">
                      <Badge variant={route.dorRoadStatus === 'BLOCKED' ? 'critical' : route.dorRoadStatus === 'OPEN' ? 'success' : 'warning'}>
                        Road: {route.dorRoadStatus}
                      </Badge>
                      <Badge variant={route.floodExposure === 'HIGH' || route.floodExposure === 'CRITICAL' ? 'critical' : route.floodExposure === 'MODERATE' ? 'warning' : 'default'}>
                        Flood Risk: {route.floodExposure}
                      </Badge>
                      <Badge variant={route.landslideRisk === 'HIGH' || route.landslideRisk === 'CRITICAL' ? 'critical' : route.landslideRisk === 'MODERATE' ? 'warning' : 'default'}>
                        Landslide: {route.landslideRisk}
                      </Badge>
                    </div>

                    <p className="text-sm text-slate-600 dark:text-slate-400 italic">"{route.recommendationReason}"</p>
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
