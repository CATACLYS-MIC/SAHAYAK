import React from 'react';
import { Card, Badge } from '@/components/ui';
import { Users, AlertTriangle, Sparkles, CheckCircle2, Search, Clock } from 'lucide-react';
import { MissingPerson, CandidateMatch, Sighting } from '@/types';

interface DashboardProps {
  missingPersons: MissingPerson[];
  sightings: Sighting[];
  candidateMatches: CandidateMatch[];
  rescueSummary?: any;
  onSelectFilter?: (status: string) => void;
  activeFilter?: string;
}

export function MissingPersonDashboard({
  missingPersons,
  sightings,
  candidateMatches,
  rescueSummary,
  onSelectFilter,
  activeFilter = 'ALL'
}: DashboardProps) {
  const totalCases = rescueSummary ? rescueSummary.totalPersons : missingPersons.length;
  const criticalCases = rescueSummary ? (rescueSummary.childrenMissing + rescueSummary.elderlyMissing) : missingPersons.filter(p => p.urgency === 'CRITICAL' && p.status !== 'FOUND').length;
  const activeSearches = rescueSummary ? rescueSummary.lostOpen || rescueSummary.lostPersons : missingPersons.filter(p => p.status === 'MISSING' || p.status === 'POSSIBLE MATCH').length;
  const pendingReviewMatches = candidateMatches.filter(m => m.status === 'PENDING_REVIEW').length;
  const verifiedFound = rescueSummary ? rescueSummary.foundPersons : missingPersons.filter(p => p.status === 'FOUND' || p.status === 'SAFE').length;
  const unreviewedSightings = sightings.filter(s => s.status === 'UNREVIEWED').length;


  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
      {/* TOTAL CASES */}
      <Card 
        className={`cursor-pointer transition-all border ${activeFilter === 'ALL' ? 'ring-2 ring-blue-500 bg-blue-50/20 dark:bg-blue-950/20' : 'hover:border-slate-300 dark:hover:border-slate-700'}`}
        onClick={() => onSelectFilter && onSelectFilter('ALL')}
      >
        <div className="flex items-center justify-between mb-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Total Cases</span>
          <Users className="h-4 w-4 text-slate-400" />
        </div>
        <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{totalCases}</p>
        <p className="text-[11px] text-slate-500 mt-0.5">Recorded in database</p>
      </Card>

      {/* CRITICAL URGENCY */}
      <Card 
        className={`cursor-pointer transition-all border ${activeFilter === 'CRITICAL' ? 'ring-2 ring-red-500 bg-red-50/20 dark:bg-red-950/20' : 'hover:border-slate-300 dark:hover:border-slate-700'}`}
        onClick={() => onSelectFilter && onSelectFilter('CRITICAL')}
      >
        <div className="flex items-center justify-between mb-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-red-600 dark:text-red-400">Critical</span>
          <AlertTriangle className="h-4 w-4 text-red-500 animate-pulse" />
        </div>
        <p className="text-2xl font-bold text-red-600 dark:text-red-400">{criticalCases}</p>
        <p className="text-[11px] text-slate-500 mt-0.5">Minors & medical risk</p>
      </Card>

      {/* ACTIVE SEARCHES */}
      <Card 
        className={`cursor-pointer transition-all border ${activeFilter === 'MISSING' ? 'ring-2 ring-amber-500 bg-amber-50/20 dark:bg-amber-950/20' : 'hover:border-slate-300 dark:hover:border-slate-700'}`}
        onClick={() => onSelectFilter && onSelectFilter('MISSING')}
      >
        <div className="flex items-center justify-between mb-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">Active Search</span>
          <Search className="h-4 w-4 text-amber-500" />
        </div>
        <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">{activeSearches}</p>
        <p className="text-[11px] text-slate-500 mt-0.5">Unresolved cases</p>
      </Card>

      {/* POTENTIAL AI MATCHES */}
      <Card 
        className={`cursor-pointer transition-all border ${activeFilter === 'MATCHES' ? 'ring-2 ring-purple-500 bg-purple-50/20 dark:bg-purple-950/20' : 'hover:border-slate-300 dark:hover:border-slate-700'}`}
        onClick={() => onSelectFilter && onSelectFilter('MATCHES')}
      >
        <div className="flex items-center justify-between mb-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400">Potential Matches</span>
          <Sparkles className="h-4 w-4 text-purple-500" />
        </div>
        <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">{pendingReviewMatches}</p>
        <p className="text-[11px] text-purple-600 dark:text-purple-400 font-medium mt-0.5">Awaiting human review</p>
      </Card>

      {/* SIGHTING LEADS */}
      <Card 
        className={`cursor-pointer transition-all border ${activeFilter === 'SIGHTINGS' ? 'ring-2 ring-blue-500 bg-blue-50/20 dark:bg-blue-950/20' : 'hover:border-slate-300 dark:hover:border-slate-700'}`}
        onClick={() => onSelectFilter && onSelectFilter('SIGHTINGS')}
      >
        <div className="flex items-center justify-between mb-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">Field Sightings</span>
          <Clock className="h-4 w-4 text-blue-500" />
        </div>
        <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{sightings.length}</p>
        <p className="text-[11px] text-slate-500 mt-0.5">{unreviewedSightings} fresh leads</p>
      </Card>

      {/* VERIFIED / FOUND */}
      <Card 
        className={`cursor-pointer transition-all border ${activeFilter === 'FOUND' ? 'ring-2 ring-emerald-500 bg-emerald-50/20 dark:bg-emerald-950/20' : 'hover:border-slate-300 dark:hover:border-slate-700'}`}
        onClick={() => onSelectFilter && onSelectFilter('FOUND')}
      >
        <div className="flex items-center justify-between mb-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">Verified Found</span>
          <CheckCircle2 className="h-4 w-4 text-emerald-500" />
        </div>
        <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{verifiedFound}</p>
        <p className="text-[11px] text-slate-500 mt-0.5">Officer verified safe</p>
      </Card>
    </div>
  );
}
