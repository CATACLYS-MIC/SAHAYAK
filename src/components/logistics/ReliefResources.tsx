import React from 'react';
import { Card, CardHeader, Badge } from '@/components/ui';
import { useAppState } from '@/lib/store';
import { evaluateResourceStatus } from '@/lib/calculations';
import { Package } from 'lucide-react';
import { cn } from '@/lib/utils';

export function ReliefResources() {
  const { supplies } = useAppState();

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
        <h3 className="text-xl font-bold flex items-center text-slate-900 dark:text-slate-100">
          <Package className="mr-2 h-5 w-5 text-blue-600 dark:text-blue-400" />
          Relief Resources Dashboard
        </h3>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
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
      </div>
    </section>
  );
}
