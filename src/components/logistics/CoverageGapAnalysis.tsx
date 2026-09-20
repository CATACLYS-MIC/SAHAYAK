import React from 'react';
import { Card, Badge, Button } from '@/components/ui';
import { useAppState } from '@/lib/store';
import { AlertTriangle, Users } from 'lucide-react';
import { cn } from '@/lib/utils';

export function CoverageGapAnalysis() {
  const { coverageGaps } = useAppState();

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
        <h3 className="text-xl font-bold flex items-center text-slate-900 dark:text-slate-100">
          <AlertTriangle className="mr-2 h-5 w-5 text-red-600 dark:text-red-400" />
          Coverage Gap Analysis
        </h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {coverageGaps.map(gap => (
          <Card key={gap.id} className={cn("border-t-4", 
            gap.severity === 'CRITICAL' ? 'border-t-red-600 dark:border-t-red-500' :
            gap.severity === 'HIGH' ? 'border-t-orange-500 dark:border-t-orange-400' : 'border-t-yellow-400'
          )}>
            <div className="p-4 sm:p-5 flex flex-col h-full">
              <div className="flex justify-between items-start mb-3">
                <Badge variant={gap.severity === 'CRITICAL' ? 'critical' : gap.severity === 'HIGH' ? 'danger' : 'warning'}>
                  {gap.severity} GAP
                </Badge>
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{gap.type}</span>
              </div>
              
              <h4 className="font-bold text-lg text-slate-900 dark:text-slate-100 mb-1">{gap.locationName}</h4>
              <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-4">{gap.missingSkillOrResource}</p>
              
              {gap.type === 'PERSONNEL' && (
                <div className="bg-slate-50 dark:bg-slate-900 rounded p-3 mb-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs font-bold text-slate-500 uppercase">Requirement</span>
                    <span className="text-sm font-bold text-slate-800 dark:text-slate-200">{gap.requiredPersonnel} volunteers</span>
                  </div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs font-bold text-slate-500 uppercase">Currently Assigned</span>
                    <span className="text-sm font-bold text-slate-800 dark:text-slate-200">{gap.assignedPersonnel} volunteers</span>
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t border-slate-200 dark:border-slate-800">
                    <span className="text-xs font-bold text-red-500 uppercase">Gap</span>
                    <span className="text-sm font-bold text-red-600 dark:text-red-400">{(gap.requiredPersonnel || 0) - (gap.assignedPersonnel || 0)} volunteers</span>
                  </div>
                </div>
              )}
              
              <div className="mt-auto pt-4">
                <p className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-2">Recommended Action</p>
                <p className="text-sm text-slate-600 dark:text-slate-400 italic mb-4">"{gap.recommendedAction}"</p>
                <Button variant="outline" size="sm" className="w-full"><Users className="h-4 w-4 mr-2" /> Find Matching Teams</Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </section>
  );
}
