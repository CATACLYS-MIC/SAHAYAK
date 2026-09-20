import React from 'react';
import { Card, Badge } from '@/components/ui';
import { useAppState } from '@/lib/store';
import { estimateTimeUntilShortage } from '@/lib/calculations';
import { Clock } from 'lucide-react';

export function FutureShortagePrediction() {
  const { supplies } = useAppState();

  // For demo, we will create some synthetic consumption rates based on demands
  // and map them over the existing supplies.
  
  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
        <h3 className="text-xl font-bold flex items-center text-slate-900 dark:text-slate-100">
          <Clock className="mr-2 h-5 w-5 text-indigo-600 dark:text-indigo-400" />
          Future Shortage Prediction
        </h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {supplies.map(supply => {
          // Synthetic daily consumption for demo purposes: assume demand is a 3-day supply
          const dailyConsumption = Math.round(supply.required / 3);
          const estimation = estimateTimeUntilShortage(supply.available, dailyConsumption, supply.incoming);
          
          return (
            <Card key={supply.id} className="p-4 sm:p-5">
              <div className="flex justify-between items-start mb-4 border-b border-slate-100 dark:border-slate-800 pb-3">
                <div>
                  <h4 className="font-bold text-slate-800 dark:text-slate-200">{supply.name}</h4>
                  <p className="text-xs text-slate-500">{supply.category}</p>
                </div>
                {estimation.isDataSufficient ? (
                   <Badge variant={estimation.estimatedHours !== null && estimation.estimatedHours < 48 ? 'critical' : 'info'}>
                     {estimation.estimatedDaysLabel}
                   </Badge>
                ) : (
                  <Badge variant="default">No Data</Badge>
                )}
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm mb-3">
                <div>
                  <span className="block text-xs font-medium text-slate-500">Current Stock</span>
                  <span className="font-bold text-slate-700 dark:text-slate-300">{supply.available.toLocaleString()}</span>
                </div>
                <div>
                  <span className="block text-xs font-medium text-slate-500">Incoming Supply</span>
                  <span className="font-bold text-slate-700 dark:text-slate-300">{supply.incoming.toLocaleString()}</span>
                </div>
                <div>
                  <span className="block text-xs font-medium text-slate-500">Daily Consumption</span>
                  <span className="font-bold text-slate-700 dark:text-slate-300">{dailyConsumption.toLocaleString()}/day</span>
                </div>
              </div>
              
              <p className="text-xs text-slate-500 italic border-t border-slate-100 dark:border-slate-800 pt-3">
                {estimation.explanation}
              </p>
            </Card>
          )
        })}
      </div>
    </section>
  );
}
