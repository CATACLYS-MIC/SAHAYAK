import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Card, CardHeader, Badge, Button } from '@/components/ui';
import { ReliefResources } from '@/components/logistics/ReliefResources';
import { LocationResourceDemands } from '@/components/logistics/LocationResourceDemands';
import { AIDistributionPlanner } from '@/components/logistics/AIDistributionPlanner';
import { DeliveryRoutes } from '@/components/logistics/DeliveryRoutes';
import { FutureShortagePrediction } from '@/components/logistics/FutureShortagePrediction';
import { TeamCoordination } from '@/components/logistics/TeamCoordination';
import { TeamAllocation } from '@/components/logistics/TeamAllocation';
import { CoverageGapAnalysis } from '@/components/logistics/CoverageGapAnalysis';
import { Package, Users } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/lib/i18n';

export function LogisticsTeam() {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = searchParams.get('tab') === 'resources' ? 'resources' : 'teams';
  const [activeTab, setActiveTab] = useState<'resources' | 'teams'>(initialTab);

  const handleTabChange = (tab: 'resources' | 'teams') => {
    setActiveTab(tab);
    setSearchParams({ tab });
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8 max-w-[1600px] mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            {t('teams.title', 'Logistics & Team Command')}
          </h2>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            {t('teams.subtitle', 'Coordinate relief supplies, distribution routes, and volunteer teams.')}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="border-blue-200 bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:border-blue-800 dark:text-blue-300">
            {t('common.demo_mode', 'DEMO MODE')}
          </Badge>
        </div>
      </div>

      <div className="flex space-x-1 rounded-lg bg-slate-100 dark:bg-slate-900 p-1 w-full max-w-md">
        <button
          onClick={() => handleTabChange('resources')}
          className={cn("flex-1 flex items-center justify-center py-2.5 text-sm font-bold rounded-md transition-all",
            activeTab === 'resources' 
              ? "bg-white dark:bg-slate-800 text-blue-700 dark:text-blue-400 shadow-sm" 
              : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-800/50"
          )}
        >
          <Package className="w-4 h-4 mr-2" /> 
          {t('teams.resources_routes', 'Resources & Routes')}
        </button>
        <button
          onClick={() => handleTabChange('teams')}
          className={cn("flex-1 flex items-center justify-center py-2.5 text-sm font-bold rounded-md transition-all",
            activeTab === 'teams' 
              ? "bg-white dark:bg-slate-800 text-emerald-700 dark:text-emerald-400 shadow-sm" 
              : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-800/50"
          )}
        >
          <Users className="w-4 h-4 mr-2" /> 
          {t('teams.teams_coverage', 'Volunteer Teams & Coverage')}
        </button>
      </div>

      <div className="space-y-12">
        {activeTab === 'resources' ? (
          <>
            <ReliefResources />
            <LocationResourceDemands />
            <AIDistributionPlanner />
            <DeliveryRoutes />
            <FutureShortagePrediction />
          </>
        ) : (
          <>
            <CoverageGapAnalysis />
            <TeamCoordination />
            <TeamAllocation />
          </>
        )}
      </div>
    </div>
  );
}
