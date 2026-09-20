import React from 'react';
import { Card, Badge, Button } from '@/components/ui';
import { Target, Zap, Clock, Cpu } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAppState } from '@/lib/store';
import { calculatePriorityScore } from '@/lib/calculations';

export function AIPriority() {
  const { incidents, currentLocationId, currentLocation, locations } = useAppState();
   
  
  // Filter and sort active incidents by calculated baseline priority
  const localIncidents = incidents
    .filter(i => i.locationId === currentLocationId && i.status === 'ACTIVE')
    .map(incident => ({
      ...incident,
      score: calculatePriorityScore(incident)
    }))
    .sort((a, b) => b.score - a.score);

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-6 gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Baseline Priority Ranking</h2>
          <p className="text-slate-600 dark:text-slate-400 mt-1">Deterministic ranking of emergency responses for <strong className="text-slate-900 dark:text-slate-200">{currentLocation?.name}</strong>.</p>
        </div>
        <div className="bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 px-3 py-1.5 rounded-lg flex items-center shadow-sm">
          <Cpu className="h-4 w-4 text-emerald-600 dark:text-emerald-400 mr-2" />
          <span className="text-sm font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">BASELINE ENGINE ACTIVE</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* EXPLANATION PANEL */}
        <div className="lg:col-span-1 space-y-4">
          <Card className="bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800">
            <h3 className="font-bold text-slate-900 dark:text-slate-100 mb-2">How it works</h3>
            <p className="text-sm font-medium text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
              Currently using a <strong className="text-slate-900 dark:text-slate-200">Baseline Priority Engine</strong>. It calculates a Score (1-100) based on severity, people affected, urgency, and time sensitivity. <br/><br/>
              *Note: Advanced AI-powered prioritization will replace this formula in future updates.*
            </p>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded bg-red-100 dark:bg-red-500/20 flex items-center justify-center shrink-0 border border-red-200 dark:border-red-500/30">
                  <span className="text-xs font-bold text-red-600 dark:text-red-400">75+</span>
                </div>
                <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Critical Priority</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded bg-orange-100 dark:bg-orange-500/20 flex items-center justify-center shrink-0 border border-orange-200 dark:border-orange-500/30">
                  <span className="text-xs font-bold text-orange-600 dark:text-orange-400">50+</span>
                </div>
                <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">High Priority</span>
              </div>
            </div>
          </Card>
          
          <Button className="w-full font-bold shadow-sm" variant="outline">
            <Zap className="mr-2 h-4 w-4" /> Force Recalculation
          </Button>
        </div>

        {/* PRIORITY QUEUE */}
        <div className="lg:col-span-3 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">Live Action Queue</h3>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Sorted by Baseline Score</span>
          </div>

          {localIncidents.length === 0 ? (
            <div className="p-8 text-center text-slate-500">No active incidents to prioritize in this region.</div>
          ) : (
            localIncidents.map((item, i) => {
              const isCritical = item.score >= 75;
              const isHigh = item.score >= 50 && item.score < 75;
              
              return (
                <Card key={item.id} className={cn(
                  "relative overflow-hidden transition-all hover:shadow-md",
                  isCritical ? 'border-red-200 dark:border-red-500/30 bg-red-50/30 dark:bg-red-500/5' : 
                  isHigh ? 'border-orange-200 dark:border-orange-500/30 bg-orange-50/30 dark:bg-orange-500/5' : 
                  'border-amber-200 dark:border-amber-500/30 bg-amber-50/30 dark:bg-amber-500/5'
                )}>
                  <div className="absolute top-0 left-0 bottom-0 w-2" style={{ backgroundColor: isCritical ? '#ef4444' : isHigh ? '#f97316' : '#f59e0b' }}></div>
                  <div className="pl-6 flex flex-col sm:flex-row gap-4 sm:items-center">
                    
                    {/* Score */}
                    <div className="shrink-0 flex flex-col items-center justify-center p-3 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm w-20 h-20">
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Score</span>
                      <span className={cn(
                        "text-3xl font-black",
                        isCritical ? 'text-red-600 dark:text-red-500' : 
                        isHigh ? 'text-orange-600 dark:text-orange-500' : 
                        'text-amber-600 dark:text-amber-500'
                      )}>{item.score}</span>
                    </div>
                    
                    {/* Content */}
                    <div className="flex-1 space-y-1.5">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-[10px] py-0 border-slate-300 dark:border-slate-700">#{i + 1}</Badge>
                        <h4 className="text-lg font-bold text-slate-900 dark:text-slate-100">{item.title}</h4>
                      </div>
                      <p className="text-sm font-medium text-slate-700 dark:text-slate-300">{item.desc}</p>
                      <div className="flex items-center gap-4 pt-1">
                        <span className="text-xs font-bold text-slate-500 flex items-center">
                          <Clock className="h-3 w-3 mr-1" /> Auto-updated
                        </span>
                      </div>
                    </div>
                    
                    {/* Action */}
                    <div className="shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 sm:border-l border-slate-200 dark:border-slate-800/50 sm:pl-4 mt-2 sm:mt-0 flex flex-col gap-2">
                      <Button variant="primary" className={cn(
                        "font-bold shadow-sm whitespace-nowrap",
                        isCritical ? 'bg-red-600 hover:bg-red-700' : ''
                      )}>
                        Dispatch Teams
                      </Button>
                      <Button variant="outline" className="bg-white dark:bg-transparent text-xs py-1">Delegate</Button>
                    </div>
                    
                  </div>
                </Card>
              )
            })
          )}
          
        </div>
      </div>
    </div>
  );
}
