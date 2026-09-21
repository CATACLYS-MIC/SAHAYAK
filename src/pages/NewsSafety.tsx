import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, Badge, Button } from '@/components/ui';
import { 
  ShieldCheck, UserPlus, Search, 
  Map, LayoutGrid, CheckCircle2, 
  AlertTriangle, Filter, RotateCcw, Lock, Unlock, Users, ChevronRight,
  Clock, MapPin, User, Stethoscope,
  RefreshCw, ExternalLink, Eye, List, Sparkles, HelpCircle
} from 'lucide-react';
import { useAppState } from '@/lib/store';
import { cn } from '@/lib/utils';
import { MissingPerson, CandidateMatch, Sighting } from '@/types';
import { MissingPersonDashboard } from '@/components/missing-persons/MissingPersonDashboard';
import { MissingPersonCard } from '@/components/missing-persons/MissingPersonCard';
import { MissingPersonProfileModal } from '@/components/missing-persons/MissingPersonProfileModal';
import { MatchReviewPanel } from '@/components/missing-persons/MatchReviewPanel';
import { ReportMissingPersonModal } from '@/components/missing-persons/ReportMissingPersonModal';
import { ReportSightingModal } from '@/components/missing-persons/ReportSightingModal';
import { MissingPersonMap } from '@/components/missing-persons/MissingPersonMap';
import { useTranslation } from '@/lib/i18n';

type ViewMode = 'TABLE' | 'GRID' | 'MAP' | 'REVIEW_QUEUE';

export function NewsSafety() {
  const { t, translateDynamic } = useTranslation();
  const { 
    missingPersons, 
    sightings, 
    candidateMatches, 
    governmentRescueReports,
    rescueSummary,
    rescueLoading,
    rescueError,
    rescueLastRetrieved,
    rescueIsCached,
    rescueSourceStatus,
    refreshGovernmentRescueReports,
    addMissingPerson, 
    addSighting,
    confirmMatch,
    rejectMatch,
    requestMoreInfo,
    currentLocationId, currentLocation, 
    locations, 
    incidents,
    facilities,
    userRole,
    setUserRole,
    hospitalMatches
    ,liveNews, liveNewsLoading, liveNewsLastSynced
  } = useAppState();

  const navigate = useNavigate();
  const pendingHospitalMatchesCount = (hospitalMatches || []).filter(m => m.status === 'PENDING_HUMAN_REVIEW').length;

  // Missing Persons View Mode
  const [viewMode, setViewMode] = useState<ViewMode>('GRID');
  
  // Search and Filtering State
  const [searchTerm, setSearchTerm] = useState('');
  const [sourceFilter, setSourceFilter] = useState<'ALL' | 'GOV_ONLY' | 'LOCAL_ONLY'>('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [urgencyFilter, setUrgencyFilter] = useState('ALL');
  const [ageFilter, setAgeFilter] = useState('ALL');
  const [districtFilter, setDistrictFilter] = useState('ALL');

  // Modal / Selection State
  const [selectedPerson, setSelectedPerson] = useState<MissingPerson | null>(null);
  const [selectedMatch, setSelectedMatch] = useState<CandidateMatch | null>(null);
  const [showReportPersonModal, setShowReportPersonModal] = useState(false);
  const [showReportSightingModal, setShowReportSightingModal] = useState(false);
  const [preselectedTargetPersonId, setPreselectedTargetPersonId] = useState<string | undefined>();

  // Filtered Missing Persons
  const filteredPersons = useMemo(() => {
    return missingPersons.filter(person => {
      // Search query matches name, clothing, last known location, ID, or description
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        const matchesName = person.name.toLowerCase().includes(q);
        const matchesId = person.id.toLowerCase().includes(q);
        const matchesLoc = (person.lastKnownLocation || person.lastLocation || '').toLowerCase().includes(q);
        const matchesClothing = (person.clothing || '').toLowerCase().includes(q);
        const matchesDesc = (person.description || '').toLowerCase().includes(q);
        if (!matchesName && !matchesId && !matchesLoc && !matchesClothing && !matchesDesc) {
          return false;
        }
      }

      // Source registry filter
      if (sourceFilter === 'GOV_ONLY' && !person.isRealSourceData) return false;
      if (sourceFilter === 'LOCAL_ONLY' && person.isRealSourceData) return false;

      // Status filter
      if (statusFilter !== 'ALL') {
        if (statusFilter === 'CRITICAL' && person.urgency !== 'CRITICAL') return false;
        if (statusFilter === 'MATCHES' && person.status !== 'POSSIBLE MATCH' && !candidateMatches.some(m => m.missingPersonId === person.id && m.status === 'PENDING_REVIEW')) return false;
        if (statusFilter === 'FOUND' && person.status !== 'FOUND' && person.status !== 'SAFE') return false;
        if (statusFilter === 'MISSING' && person.status !== 'MISSING' && person.status !== 'POSSIBLE MATCH') return false;
        if (statusFilter === 'SHELTER_HOSPITAL' && person.status !== 'IN SHELTER' && person.status !== 'HOSPITALIZED') return false;
      }

      // Urgency filter
      if (urgencyFilter !== 'ALL' && person.urgency !== urgencyFilter) {
        return false;
      }

      // Age filter
      if (ageFilter === 'CHILDREN' && person.age >= 18) return false;
      if (ageFilter === 'ADULTS' && (person.age < 18 || person.age > 60)) return false;
      if (ageFilter === 'ELDERLY' && person.age <= 60) return false;

      // District filter
      if (districtFilter !== 'ALL' && person.locationId !== districtFilter) {
        return false;
      }

      return true;
    });
  }, [missingPersons, candidateMatches, searchTerm, sourceFilter, statusFilter, urgencyFilter, ageFilter, districtFilter]);

  // Pending candidate matches
  const pendingMatches = useMemo(() => {
    return candidateMatches.filter(m => m.status === 'PENDING_REVIEW');
  }, [candidateMatches]);

  // Open review panel helper
  const handleOpenReview = (match: CandidateMatch) => {
    setSelectedMatch(match);
  };

  // Find match pair objects
  const activeMatchPerson = selectedMatch 
    ? missingPersons.find(p => p.id === selectedMatch.missingPersonId) 
    : null;
  const activeMatchSighting = selectedMatch 
    ? sightings.find(s => s.id === selectedMatch.sightingId) 
    : null;

  const resetFilters = () => {
    setSearchTerm('');
    setSourceFilter('ALL');
    setStatusFilter('ALL');
    setUrgencyFilter('ALL');
    setAgeFilter('ALL');
    setDistrictFilter('ALL');
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      
      {/* PAGE HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
              Missing Persons & Citizen Safety
            </h2>
            <Badge variant="outline" className="text-[10px] font-mono">
              SEARCH & RESCUE
            </Badge>
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            AI-assisted missing-person tracing, field sighting correlation, human-verified matching, and NDRRMA / OPMCM Search & Rescue registry.
          </p>
        </div>

        {/* ACCESS ROLE TOGGLE */}
        <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800/80 p-1.5 rounded-xl border border-slate-200 dark:border-slate-700/80 self-stretch sm:self-auto">
          <span className="text-xs font-semibold text-slate-500 pl-2 hidden sm:inline">Role:</span>
          <button
            onClick={() => setUserRole('PUBLIC')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              userRole === 'PUBLIC'
                ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <Lock className="h-3.5 w-3.5" /> Public Citizen
          </button>
          <button
            onClick={() => setUserRole('RESPONDER')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              userRole === 'RESPONDER'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <Unlock className="h-3.5 w-3.5" /> Authorized Officer
          </button>
        </div>
      </div>

      <Card className="border-blue-200 dark:border-blue-900/50 bg-blue-50/40 dark:bg-blue-950/20">
        <div className="flex items-start justify-between gap-3 mb-3 flex-wrap">
          <div>
            <CardHeader title={t('Live BIPAD Portal Alerts')} subtitle={t('Realtime alerts from the Government of Nepal disaster information portal.')} />
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="success" className="text-[10px]">{t('BIPAD LIVE')}</Badge>
            <Button size="sm" variant="outline" onClick={() => window.location.reload()} disabled={liveNewsLoading} className="text-xs">
              <RefreshCw className={cn('h-3.5 w-3.5 mr-1', liveNewsLoading && 'animate-spin')} /> {t('Refresh')}
            </Button>
          </div>
        </div>
        {liveNews.filter(item => item.id.startsWith('bipad-')).length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
            {liveNews.filter(item => item.id.startsWith('bipad-')).slice(0, 8).map(alert => (
              <div key={alert.id} className="p-3 rounded-lg bg-white dark:bg-slate-900 border border-blue-100 dark:border-slate-800 flex gap-3">
                <AlertTriangle className={cn('h-4 w-4 shrink-0 mt-0.5', alert.severity === 'CRITICAL' ? 'text-red-500' : alert.severity === 'WARNING' ? 'text-amber-500' : 'text-blue-500')} />
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{translateDynamic(alert.title)}</p>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">{translateDynamic(alert.summary)}</p>
                  <p className="text-[10px] text-slate-400 mt-1">{alert.source} • {alert.timestamp}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-slate-500">{liveNewsLoading ? t('Synchronizing BIPAD alerts...') : t('No BIPAD alerts available.')}</p>
        )}
        {liveNewsLastSynced && <p className="text-[10px] text-slate-400 mt-3">{t('Last synced:')} {new Date(liveNewsLastSynced).toLocaleString()}</p>}
      </Card>

      {/* MISSING PERSON INTELLIGENCE SYSTEM */}
      <div className="space-y-6">
          
          {/* ===================================================================== */}
          {/* NEPAL GOVERNMENT OPMCM FLOOD RESCUE PORTAL OFFICIAL BANNER             */}
          {/* ===================================================================== */}
          <div className="bg-gradient-to-r from-red-950/30 via-slate-900 to-slate-900/90 border border-red-900/40 rounded-2xl p-4 sm:p-5 relative overflow-hidden shadow-sm">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold bg-red-600 text-white shadow-sm tracking-wide uppercase">
                    <ShieldCheck className="h-3.5 w-3.5" />
                    Government of Nepal • OPMCM
                  </span>
                  <span className="text-xs text-slate-400 font-medium">
                    National Disaster Search & Rescue Registry (NDRRMA)
                  </span>
                  <Badge variant={rescueSourceStatus === 'LIVE' ? 'success' : 'warning'} className="text-[10px]">
                    {rescueSourceStatus === 'LIVE' ? 'PORTAL LIVE SYNC' : 'OFFLINE CACHED'}
                  </Badge>
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                  National Flood & Landslide Missing Persons Registry
                </h3>
                <p className="text-xs text-slate-300 max-w-3xl">
                  Real-time synchronization with the Office of the Prime Minister and Council of Ministers (OPMCM) Disaster Rescue Portal (<span className="font-mono text-red-400">rescue.opmcm.gov.np</span>). Cross-correlated with field sighting intelligence and tactical AI matching.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2.5 shrink-0 self-stretch sm:self-auto justify-end">
                <div className="text-right hidden sm:block text-[11px] text-slate-400">
                  <span>Last synchronized:</span>
                  <p className="font-medium text-slate-200">
                    {rescueLastRetrieved ? new Date(rescueLastRetrieved).toLocaleTimeString() : 'Just now'}
                  </p>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => refreshGovernmentRescueReports()}
                  disabled={rescueLoading}
                  className="text-xs font-semibold border-slate-700 bg-slate-800/80 hover:bg-slate-700 text-white"
                >
                  <RefreshCw className={cn("h-3.5 w-3.5 mr-1.5", rescueLoading && "animate-spin")} />
                  {rescueLoading ? 'Syncing...' : 'Sync Registry'}
                </Button>

                <a
                  href="https://rescue.opmcm.gov.np/person-reports"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-red-600/20 hover:bg-red-600/30 text-red-300 border border-red-500/30 transition-colors"
                >
                  <span>rescue.opmcm.gov.np</span>
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              </div>
            </div>

            {/* OFFICIAL GOV PORTAL SUMMARY STRIP */}
            {rescueSummary && (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 mt-4 pt-4 border-t border-slate-800">
                <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Total Tracked</span>
                  <p className="text-xl font-bold text-white mt-0.5">{rescueSummary.totalPersons.toLocaleString()}</p>
                  <span className="text-[10px] text-slate-400">Official portal cases</span>
                </div>
                <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800">
                  <span className="text-[10px] uppercase font-bold text-red-400 block tracking-wider">Active Missing</span>
                  <p className="text-xl font-bold text-red-400 mt-0.5">{rescueSummary.lostPersons.toLocaleString()}</p>
                  <span className="text-[10px] text-slate-400">Unresolved searches</span>
                </div>
                <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800">
                  <span className="text-[10px] uppercase font-bold text-emerald-400 block tracking-wider">Rescued Safe</span>
                  <p className="text-xl font-bold text-emerald-400 mt-0.5">{rescueSummary.rescuedPersons.toLocaleString()}</p>
                  <span className="text-[10px] text-slate-400">NDRRMA extractions</span>
                </div>
                <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800">
                  <span className="text-[10px] uppercase font-bold text-blue-400 block tracking-wider">Found / Sheltered</span>
                  <p className="text-xl font-bold text-blue-400 mt-0.5">{rescueSummary.foundPersons.toLocaleString()}</p>
                  <span className="text-[10px] text-slate-400">Located in camps</span>
                </div>
                <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800">
                  <span className="text-[10px] uppercase font-bold text-amber-400 block tracking-wider">Past 24 Hours</span>
                  <p className="text-xl font-bold text-amber-400 mt-0.5">+{rescueSummary.last24h.toLocaleString()}</p>
                  <span className="text-[10px] text-slate-400">Recent disaster intake</span>
                </div>
                <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800">
                  <span className="text-[10px] uppercase font-bold text-purple-400 block tracking-wider">Resolution Rate</span>
                  <p className="text-xl font-bold text-purple-400 mt-0.5">{rescueSummary.resolutionRate}%</p>
                  <span className="text-[10px] text-slate-400">{rescueSummary.resolvedPersons.toLocaleString()} cases resolved</span>
                </div>
              </div>
            )}
          </div>
          
          {/* ACTION BUTTONS & VIEW SWITCHER BAR */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex flex-wrap items-center gap-2">
              <Button 
                variant="primary" 
                size="sm"
                onClick={() => setShowReportPersonModal(true)}
                className="bg-red-600 hover:bg-red-700 text-white text-xs font-bold"
              >
                <UserPlus className="h-4 w-4 mr-1.5" />
                Report Missing Person
              </Button>

              <Button 
                variant="outline" 
                size="sm"
                onClick={() => {
                  setPreselectedTargetPersonId(undefined);
                  setShowReportSightingModal(true);
                }}
                className="text-xs font-bold border-blue-200 text-blue-700 dark:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-950/40"
              >
                <Eye className="h-4 w-4 mr-1.5 text-blue-600" />
                Submit Field Sighting Lead
              </Button>

              <Button 
                variant="outline" 
                size="sm"
                onClick={() => navigate('/hospital-matching')}
                className="text-xs font-bold border-teal-300 text-teal-700 dark:text-teal-300 hover:bg-teal-50 dark:hover:bg-teal-950/40 flex items-center"
              >
                <Stethoscope className="h-4 w-4 mr-1.5 text-teal-600 dark:text-teal-400" />
                Hospital Patient Matching
                {pendingHospitalMatchesCount > 0 && (
                  <span className="ml-1.5 px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-teal-600 text-white animate-pulse">
                    {pendingHospitalMatchesCount}
                  </span>
                )}
              </Button>
            </div>

            {/* VIEW MODE TOGGLE */}
            <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700 w-full sm:w-auto justify-center sm:justify-start">
              <button
                onClick={() => setViewMode('GRID')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  viewMode === 'GRID'
                    ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                <LayoutGrid className="h-3.5 w-3.5" /> Cards Dossier
              </button>

              <button
                onClick={() => setViewMode('TABLE')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  viewMode === 'TABLE'
                    ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                <List className="h-3.5 w-3.5" /> Table Dossier
              </button>

              <button
                onClick={() => setViewMode('MAP')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  viewMode === 'MAP'
                    ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                <Map className="h-3.5 w-3.5" /> Galli Map
              </button>

              <button
                onClick={() => setViewMode('REVIEW_QUEUE')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  viewMode === 'REVIEW_QUEUE'
                    ? 'bg-white dark:bg-slate-900 text-purple-600 dark:text-purple-400 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                <Sparkles className="h-3.5 w-3.5 text-purple-500" /> 
                Verification Desk ({pendingMatches.length})
              </button>
            </div>
          </div>

          {/* DASHBOARD METRICS SUMMARY */}
          <MissingPersonDashboard 
            missingPersons={missingPersons}
            sightings={sightings}
            candidateMatches={candidateMatches}
            rescueSummary={rescueSummary}
            activeFilter={statusFilter}
            onSelectFilter={(filter) => {
              if (filter === 'MATCHES') {
                setViewMode('REVIEW_QUEUE');

              } else {
                setStatusFilter(filter);
              }
            }}
          />

          {/* SEARCH & ADVANCED FILTER BAR */}
          <Card className="bg-slate-50/50 dark:bg-slate-950/40 p-4 border-slate-200 dark:border-slate-800">
            <div className="space-y-3">
              <div className="flex flex-col md:flex-row items-center gap-3">
                {/* SEARCH INPUT */}
                <div className="relative flex-1 w-full">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input 
                    type="text"
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    placeholder="Search by name, NDRRMA ID, location, clothing, or description..."
                    className="w-full pl-10 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                  {searchTerm && (
                    <button 
                      onClick={() => setSearchTerm('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 font-bold"
                    >
                      Clear
                    </button>
                  )}
                </div>

                {/* REGISTRY SOURCE FILTER */}
                <select
                  value={sourceFilter}
                  onChange={e => setSourceFilter(e.target.value as any)}
                  className="w-full md:w-52 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 dark:text-slate-200"
                >
                  <option value="ALL">All Sources ({missingPersons.length})</option>
                  <option value="GOV_ONLY">Government OPMCM Official ({missingPersons.filter(p => p.isRealSourceData).length})</option>
                  <option value="LOCAL_ONLY">Local Field Submissions ({missingPersons.filter(p => !p.isRealSourceData).length})</option>
                </select>

                {/* STATUS FILTER */}
                <select
                  value={statusFilter}
                  onChange={e => setStatusFilter(e.target.value)}
                  className="w-full md:w-40 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 dark:text-slate-200"
                >
                  <option value="ALL">All Statuses</option>
                  <option value="MISSING">Active Missing</option>
                  <option value="MATCHES">Potential Match Leads</option>
                  <option value="FOUND">Verified Found / Safe</option>
                  <option value="SHELTER_HOSPITAL">In Shelter / Hospital</option>
                  <option value="CRITICAL">Critical Urgency Only</option>
                </select>

                {/* URGENCY FILTER */}
                <select
                  value={urgencyFilter}
                  onChange={e => setUrgencyFilter(e.target.value)}
                  className="w-full md:w-36 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 dark:text-slate-200"
                >
                  <option value="ALL">All Urgencies</option>
                  <option value="CRITICAL">Critical</option>
                  <option value="HIGH">High</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="LOW">Low</option>
                </select>

                {/* DISTRICT FILTER */}
                <select
                  value={districtFilter}
                  onChange={e => setDistrictFilter(e.target.value)}
                  className="w-full md:w-40 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 dark:text-slate-200"
                >
                  <option value="ALL">All Districts</option>
                  {locations.map(l => (
                    <option key={l.id} value={l.id}>{l.name}</option>
                  ))}
                </select>

                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={resetFilters}
                  className="shrink-0 text-xs py-2 h-9 border-slate-300 dark:border-slate-700"
                >
                  <RotateCcw className="h-3.5 w-3.5 mr-1" /> Reset
                </Button>
              </div>

              {/* SEARCH RESULTS TALLY */}
              <div className="flex flex-wrap justify-between items-center gap-2 text-xs text-slate-500 pt-1">
                <span className="flex flex-col sm:flex-row sm:items-center gap-1.5">
                  <span>
                    Showing <strong className="text-slate-800 dark:text-slate-200">{filteredPersons.length}</strong> 
                    {rescueSummary ? ` out of ${rescueSummary.totalPersons.toLocaleString()} total` : ''} case records
                  </span>
                  {rescueSummary && (
                    <span className="text-[10px] italic text-slate-400">
                      (Loaded partial set of reports with confirmed photos/locations for optimal browser performance)
                    </span>
                  )}
                  {sourceFilter === 'GOV_ONLY' && (
                    <span className="text-[10px] font-bold text-red-600 bg-red-100 dark:bg-red-950/60 px-2 py-0.5 rounded-full mt-1 sm:mt-0 w-fit">
                      Filtered to Official Government Portal
                    </span>
                  )}
                </span>
                <span className="text-[11px] font-medium text-slate-400">
                  Privacy Safeguard: Personal contact phone numbers redacted in citizen view
                </span>
              </div>

            </div>
          </Card>

          {/* ===================================================================== */}
          {/* VIEW MODE 1: COMPACT RESPONSIVE TABLE VIEW                            */}
          {/* ===================================================================== */}
          {viewMode === 'TABLE' && (
            <Card className="overflow-hidden p-0" noPadding>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 dark:bg-slate-950/80 border-b border-slate-200 dark:border-slate-800 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    <tr>
                      <th className="py-3.5 px-4">Case Profile & Name</th>
                      <th className="py-3.5 px-4">Intake Registry / NDRRMA</th>
                      <th className="py-3.5 px-4 text-center">Type</th>
                      <th className="py-3.5 px-4 text-center">Demographics</th>
                      <th className="py-3.5 px-4">Last Reported Location</th>
                      <th className="py-3.5 px-4">Incident / Filing Date</th>
                      <th className="py-3.5 px-4 text-center">Priority</th>
                      <th className="py-3.5 px-4 text-center">Status</th>
                      <th className="py-3.5 px-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                    {filteredPersons.length === 0 ? (
                      <tr>
                        <td colSpan={9} className="py-12 text-center text-slate-500 dark:text-slate-400">
                          <HelpCircle className="h-8 w-8 text-slate-400 mx-auto mb-2" />
                          No missing person records match the selected filters.
                        </td>
                      </tr>
                    ) : (
                      filteredPersons.map(person => {
                        const pendingMatch = candidateMatches.find(
                          m => m.missingPersonId === person.id && m.status === 'PENDING_REVIEW'
                        );
                        const isFound = person.status === 'FOUND' || person.status === 'SAFE';

                        return (
                          <tr
                            key={person.id}
                            className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors cursor-pointer group"
                            onClick={() => setSelectedPerson(person)}
                          >
                            {/* Photo & Name */}
                            <td className="py-3.5 px-4">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-800 overflow-hidden border border-slate-200 dark:border-slate-700 shrink-0 flex items-center justify-center">
                                  {person.photo ? (
                                    <img src={person.photo} alt={person.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                                  ) : (
                                    <User className="h-5 w-5 text-slate-400" />
                                  )}
                                </div>
                                <div>
                                  <div className="font-bold text-slate-900 dark:text-slate-100 group-hover:text-blue-600 transition-colors">
                                    {person.name}
                                  </div>
                                  <div className="text-[11px] text-slate-500 font-mono">
                                    ID: {person.id}
                                  </div>
                                </div>
                              </div>
                            </td>

                            {/* Registry / NDRRMA */}
                            <td className="py-3.5 px-4">
                              {person.isRealSourceData ? (
                                <div className="space-y-0.5">
                                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-red-100 dark:bg-red-950/60 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-900/50">
                                    <ShieldCheck className="h-3 w-3 text-red-600" />
                                    OPMCM Gov
                                  </span>
                                  <p className="text-[11px] text-slate-500 font-mono">
                                    {person.ndrrmaId ? `NDRRMA #${person.ndrrmaId}` : 'NDRRMA Flood Registry'}
                                  </p>
                                </div>
                              ) : (
                                <div className="space-y-0.5">
                                  <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                                    Field Sighting
                                  </span>
                                  <p className="text-[11px] text-slate-500">Local Citizen Intake</p>
                                </div>
                              )}
                            </td>

                            {/* Type */}
                            <td className="py-3.5 px-4 text-center">
                              <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                person.rawType === 'found' || isFound
                                  ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800'
                                  : 'bg-red-100 dark:bg-red-950/60 text-red-800 dark:text-red-300 border border-red-300 dark:border-red-800'
                              }`}>
                                {person.rawType === 'found' || isFound ? 'FOUND / RESCUED' : 'LOST / MISSING'}
                              </span>
                            </td>

                            {/* Demographics */}
                            <td className="py-3.5 px-4 text-center">
                              <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                                {person.age > 0 ? `${person.age} yrs` : 'Unknown'}
                              </span>
                              <span className="text-[11px] text-slate-500 block">
                                {person.gender}
                              </span>
                            </td>

                            {/* Last Known Location */}
                            <td className="py-3.5 px-4">
                              <div className="flex items-start gap-1 text-xs">
                                <MapPin className="h-3.5 w-3.5 text-red-500 shrink-0 mt-0.5" />
                                <div>
                                  <span className="font-semibold text-slate-800 dark:text-slate-200 line-clamp-1">
                                    {person.lastKnownLocation || person.lastLocation}
                                  </span>
                                  <span className="text-[10px] text-slate-500 block">
                                    Precision: {person.locationPrecision === 'EXACT' ? 'Exact Coordinate' : person.locationPrecision === 'APPROXIMATE_DISTRICT' ? 'District Zone' : 'Approximate'}
                                  </span>
                                </div>
                              </div>
                            </td>

                            {/* Date Reported */}
                            <td className="py-3.5 px-4 text-xs text-slate-600 dark:text-slate-300">
                              <div className="flex items-center gap-1 font-medium">
                                <Clock className="h-3 w-3 text-slate-400 shrink-0" />
                                <span>{person.lastSeen}</span>
                              </div>
                              <span className="text-[10px] text-slate-400 block font-mono">
                                {person.createdAt ? new Date(person.createdAt).toLocaleDateString() : 'Active'}
                              </span>
                            </td>

                            {/* Priority Score */}
                            <td className="py-3.5 px-4 text-center">
                              <span className={`inline-block px-2 py-0.5 rounded text-[11px] font-bold font-mono ${
                                person.urgency === 'CRITICAL' 
                                  ? 'bg-red-500/10 text-red-600 border border-red-200 dark:border-red-900/50' 
                                  : person.urgency === 'HIGH'
                                  ? 'bg-amber-500/10 text-amber-600 border border-amber-200 dark:border-amber-900/50'
                                  : 'bg-slate-500/10 text-slate-600'
                              }`}>
                                {person.baselinePriorityScore || 75}/100
                              </span>
                            </td>

                            {/* Status */}
                            <td className="py-3.5 px-4 text-center">
                              <Badge variant={isFound ? 'success' : person.urgency === 'CRITICAL' ? 'critical' : 'warning'} className="text-[10px]">
                                {person.status}
                              </Badge>
                              {pendingMatch && (
                                <span className="block text-[9px] font-bold text-purple-600 dark:text-purple-400 mt-0.5 animate-pulse">
                                  AI Lead {pendingMatch.similarityScore}%
                                </span>
                              )}
                            </td>

                            {/* Action */}
                            <td className="py-3.5 px-4 text-right">
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-xs py-1 h-7 border-slate-200 dark:border-slate-700 hover:bg-blue-50 dark:hover:bg-blue-950/40 text-blue-600 dark:text-blue-400"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedPerson(person);
                                }}
                              >
                                <Eye className="h-3 w-3 mr-1" /> Dossier
                              </Button>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </Card>
          )}

          {/* ===================================================================== */}
          {/* VIEW MODE 2: GRID CARDS                                               */}
          {/* ===================================================================== */}
          {viewMode === 'GRID' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredPersons.length === 0 ? (
                <div className="col-span-full p-12 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
                  <HelpCircle className="h-10 w-10 text-slate-400 mx-auto" />
                  <h4 className="font-bold text-slate-800 dark:text-slate-200">No Missing Person Files Match Query</h4>
                  <p className="text-xs text-slate-500 max-w-md mx-auto">
                    Try relaxing your search terms, changing urgency filters, or submit a new emergency missing person intake report.
                  </p>
                  <Button variant="outline" size="sm" onClick={resetFilters}>
                    Clear All Filters
                  </Button>
                </div>
              ) : (
                filteredPersons.map(person => (
                  <MissingPersonCard 
                    key={person.id}
                    person={person}
                    candidateMatches={candidateMatches}
                    onSelect={p => setSelectedPerson(p)}
                    onReviewMatch={m => handleOpenReview(m)}
                    userRole={userRole}
                  />
                ))
              )}
            </div>
          )}

          {/* ===================================================================== */}
          {/* VIEW MODE 2: TACTICAL MAP VIEW                                        */}
          {/* ===================================================================== */}
          {viewMode === 'MAP' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500">
                  Geographic correlation map showing last seen coordinates, reported sightings, and emergency facilities.
                </span>
                <Badge variant="info" className="text-[10px]">
                  Interactive Tactical GIS
                </Badge>
              </div>

              <MissingPersonMap 
                missingPersons={filteredPersons}
                sightings={sightings}
                facilities={facilities}
                candidateMatches={candidateMatches}
                locations={locations}
                onSelectPerson={p => setSelectedPerson(p)}
                onReviewMatch={m => handleOpenReview(m)}
              />
            </div>
          )}

          {/* ===================================================================== */}
          {/* VIEW MODE 3: HUMAN VERIFICATION DESK / REVIEW QUEUE                   */}
          {/* ===================================================================== */}
          {viewMode === 'REVIEW_QUEUE' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-lg text-slate-900 dark:text-white flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-purple-600" />
                    AI Candidate Sighting Verification Desk
                  </h3>
                  <p className="text-xs text-slate-500">
                    AI highlights prospective correlations between missing persons and field sightings. Human officers make the final call.
                  </p>
                </div>
                <Badge variant="outline" className="text-xs">
                  {pendingMatches.length} Pending Verification
                </Badge>
              </div>

              {pendingMatches.length === 0 ? (
                <Card className="p-12 text-center text-slate-500">
                  <CheckCircle2 className="h-10 w-10 text-emerald-500 mx-auto mb-2" />
                  <h4 className="font-bold text-slate-800 dark:text-slate-200">Review Queue Cleared</h4>
                  <p className="text-xs mt-1">All potential sighting matches have been reviewed by response officers.</p>
                </Card>
              ) : (
                <div className="space-y-3">
                  {pendingMatches.map(match => {
                    const person = missingPersons.find(p => p.id === match.missingPersonId);
                    const sighting = sightings.find(s => s.id === match.sightingId);
                    if (!person || !sighting) return null;

                    return (
                      <Card key={match.id} className="border-purple-200 dark:border-purple-900/60 bg-purple-50/20 dark:bg-purple-950/10 hover:border-purple-300 transition-all p-4">
                        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
                          
                          {/* PERSON SUMMARY */}
                          <div className="flex items-center gap-3 w-full lg:w-1/3">
                            <div className="w-14 h-14 rounded-lg bg-slate-200 dark:bg-slate-800 overflow-hidden shrink-0">
                              {person.photo ? (
                                <img src={person.photo} alt={person.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-slate-400">👤</div>
                              )}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <h5 className="font-bold text-slate-900 dark:text-white text-sm">{person.name}</h5>
                                <Badge variant={person.urgency === 'CRITICAL' ? 'critical' : 'warning'} className="text-[10px]">
                                  {person.status}
                                </Badge>
                              </div>
                              <p className="text-xs text-slate-500">Age: {person.age} • Attire: {person.clothing}</p>
                              <p className="text-[11px] text-slate-400">Last seen: {person.lastKnownLocation}</p>
                            </div>
                          </div>

                          {/* AI SIMILARITY METRICS */}
                          <div className="flex-1 text-xs space-y-1 bg-white dark:bg-slate-900 p-3 rounded-xl border border-purple-100 dark:border-purple-900/40 w-full lg:w-auto">
                            <div className="flex items-center justify-between font-bold">
                              <span className="text-purple-700 dark:text-purple-400 flex items-center gap-1">
                                <Sparkles className="h-3.5 w-3.5" /> Similarity: {match.similarityScore}% ({match.matchAssessment})
                              </span>
                              <span className="text-[10px] text-slate-400">Engine: {match.analyzedBy}</span>
                            </div>
                            <p className="text-[11px] text-slate-600 dark:text-slate-300 line-clamp-1">
                              <strong>Supporting:</strong> {match.supportingEvidence.join(', ')}
                            </p>
                            <p className="text-[11px] text-slate-500 line-clamp-1">
                              <strong>Spatial/Temporal:</strong> {match.locationRelationship} • {match.timeRelationship}
                            </p>
                          </div>

                          {/* SIGHTING SUMMARY & ACTION BUTTON */}
                          <div className="flex flex-col sm:flex-row lg:flex-col items-end gap-2 w-full lg:w-auto shrink-0">
                            <div className="text-right text-xs">
                              <span className="font-semibold text-slate-800 dark:text-slate-200">Sighted at: {sighting.location}</span>
                              <p className="text-[11px] text-slate-400">Reporter: {sighting.reporter}</p>
                            </div>

                            <Button 
                              variant="primary" 
                              size="sm"
                              className="bg-purple-600 hover:bg-purple-700 text-white text-xs w-full sm:w-auto"
                              onClick={() => handleOpenReview(match)}
                            >
                              Inspect Full Comparison <ChevronRight className="h-3.5 w-3.5 ml-1" />
                            </Button>
                          </div>

                        </div>
                      </Card>
                    );
                  })}
                </div>
              )}
            </div>
          )}

        </div>



      {/* ========================================================================= */}
      {/* MODALS                                                                    */}
      {/* ========================================================================= */}
      
      {/* PROFILE MODAL */}
      {selectedPerson && (
        <MissingPersonProfileModal 
          person={selectedPerson}
          candidateMatches={candidateMatches}
          sightings={sightings}
          onClose={() => setSelectedPerson(null)}
          onReviewMatch={(m) => {
            setSelectedPerson(null);
            setSelectedMatch(m);
          }}
          userRole={userRole}
        />
      )}

      {/* MATCH REVIEW PANEL */}
      {selectedMatch && activeMatchPerson && activeMatchSighting && (
        <MatchReviewPanel 
          match={selectedMatch}
          person={activeMatchPerson}
          sighting={activeMatchSighting}
          onConfirm={(matchId, notes, targetStatus) => confirmMatch(matchId, notes, targetStatus)}
          onReject={(matchId, reason) => rejectMatch(matchId, reason)}
          onRequestMoreInfo={(matchId, notes) => requestMoreInfo(matchId, notes)}
          onClose={() => setSelectedMatch(null)}
          userRole={userRole}
        />
      )}

      {/* REPORT PERSON MODAL */}
      {showReportPersonModal && (
        <ReportMissingPersonModal 
          onClose={() => setShowReportPersonModal(false)}
          onSubmit={(data) => {
            const added = addMissingPerson(data);
            setSelectedPerson(added);
          }}
          locations={locations}
          incidents={incidents}
          currentLocationId={currentLocationId}
        />
      )}

      {/* REPORT SIGHTING MODAL */}
      {showReportSightingModal && (
        <ReportSightingModal 
          onClose={() => setShowReportSightingModal(false)}
          onSubmit={async (data) => {
            const newMatch = await addSighting(data);
            if (newMatch) {
              setSelectedMatch(newMatch);
            }
          }}
          missingPersons={missingPersons}
          facilities={facilities}
          locations={locations}
          currentLocationId={currentLocationId}
          preselectedPersonId={preselectedTargetPersonId}
        />
      )}

    </div>
  );
}
