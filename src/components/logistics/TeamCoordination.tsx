import React, { useState, useMemo } from 'react';
import { Card, CardHeader, Badge, Button } from '@/components/ui';
import { 
  Users, MapPin, Phone, Shield, Sparkles, CheckCircle2, 
  AlertTriangle, Crosshair, Plus, ArrowRight, RefreshCw, 
  Compass, Wrench, Search, Filter, Layers, Navigation, Calendar,
  Check, X
} from 'lucide-react';
import { useAppState } from '@/lib/store';
import { cn } from '@/lib/utils';
import { VOLUNTEER_SKILL_CATEGORIES } from '@/data/logisticsData';
import { NEPAL_VOLUNTEER_AREAS, recommendAreaForTeam, VolunteerArea } from '@/data/volunteerAreas';
import { TeamAllocationMap } from './TeamAllocationMap';
import { VolunteerTeam, VolunteerStatus } from '@/types';
import { useTranslation } from '@/lib/i18n';

const COMMON_EQUIPMENT = [
  'Inflatable Rafts & Oars',
  'Heavy Rescue Ropes & Harnesses',
  'Advanced Trauma First Aid Kits',
  'High-Clearance 4WD Vehicle',
  'Satellite Radios / VHF Repeaters',
  'Water Filtration Units',
  'Thermal Drone with Spare Batteries',
  'Emergency Tents & Tarpaulins',
  'Generator & Floodlights',
  'Megaphones & Siren PAs'
];

const SPECIALIZATIONS = [
  'Search & Rescue (SAR)',
  'Medical Triage',
  'Logistics & Supply Convoy',
  'Field Camp & Shelter',
  'Communications & Drone',
  'Water & Sanitation (WASH)',
  'Food & Relief Distribution'
];

export function TeamCoordination() {
  const { teams, registerTeam, assignTeamArea, updateTeamStatus, resetTeamsToDefault } = useAppState();
  const { t } = useTranslation();

  // Navigation & view states
  const [viewMode, setViewMode] = useState<'split' | 'map' | 'cards'>('split');
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [areaFilter, setAreaFilter] = useState('ALL');
  const [specFilter, setSpecFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Modals
  const [showRegModal, setShowRegModal] = useState(false);
  const [reassignTeam, setReassignTeam] = useState<VolunteerTeam | null>(null);
  const [successBanner, setSuccessBanner] = useState<string | null>(null);

  // Registration form fields
  const [leaderName, setLeaderName] = useState('');
  const [contact, setContact] = useState('+977-98');
  const [teamName, setTeamName] = useState('');
  const [memberCount, setMemberCount] = useState<number>(6);
  const [specialization, setSpecialization] = useState<string>(SPECIALIZATIONS[0]);
  const [selectedSkills, setSelectedSkills] = useState<string[]>(['First Aid', 'Search & Rescue']);
  const [selectedEquipment, setSelectedEquipment] = useState<string[]>(['Advanced Trauma First Aid Kits']);
  const [experienceSummary, setExperienceSummary] = useState('');

  // Area assignment form fields
  const [selectedAreaId, setSelectedAreaId] = useState<string>(NEPAL_VOLUNTEER_AREAS[0].id);
  const [customAreaName, setCustomAreaName] = useState('');
  const [assignedTask, setAssignedTask] = useState(NEPAL_VOLUNTEER_AREAS[0].suggestedTasks[0] || '');
  const [deploymentStatus, setDeploymentStatus] = useState<VolunteerStatus>('DEPLOYED');
  const [aiRationale, setAiRationale] = useState<string | null>(null);

  // Re-assign form fields
  const [reassignAreaId, setReassignAreaId] = useState<string>(NEPAL_VOLUNTEER_AREAS[0].id);
  const [reassignTask, setReassignTask] = useState('');

  // Selected area object
  const currentSelectedArea = NEPAL_VOLUNTEER_AREAS.find(a => a.id === selectedAreaId) || NEPAL_VOLUNTEER_AREAS[0];

  // Handle skill toggle
  const toggleSkill = (skill: string) => {
    setSelectedSkills(prev => 
      prev.includes(skill) ? prev.filter(s => s !== skill) : [...prev, skill]
    );
  };

  // Handle equipment toggle
  const toggleEquipment = (eq: string) => {
    setSelectedEquipment(prev => 
      prev.includes(eq) ? prev.filter(e => e !== eq) : [...prev, eq]
    );
  };

  // Area change handler in registration form
  const handleAreaChange = (areaId: string) => {
    setSelectedAreaId(areaId);
    if (areaId !== 'CUSTOM') {
      const area = NEPAL_VOLUNTEER_AREAS.find(a => a.id === areaId);
      if (area) {
        setAssignedTask(area.suggestedTasks[0] || `Relief operations in ${area.name}`);
      }
    }
  };

  // Smart AI recommendation for team area
  const handleSmartAreaRecommendation = () => {
    const recommendation = recommendAreaForTeam(selectedSkills, specialization);
    setSelectedAreaId(recommendation.recommendedArea.id);
    setAssignedTask(recommendation.task);
    setAiRationale(
      `AI Recommendation (${recommendation.confidence}% match): ${recommendation.reason}`
    );
  };

  // Submit registration form
  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!leaderName.trim() || !teamName.trim()) return;

    let finalAreaName = currentSelectedArea.name;
    let lat = currentSelectedArea.lat;
    let lng = currentSelectedArea.lng;

    if (selectedAreaId === 'CUSTOM') {
      finalAreaName = customAreaName.trim() || 'Custom Field Sector';
      lat = 27.7172; // default kathmandu coords
      lng = 85.3240;
    }

    const newTeam = registerTeam({
      name: teamName.trim(),
      leaderName: leaderName.trim(),
      contact: contact.trim(),
      memberCount: Number(memberCount) || 5,
      specialization,
      skills: selectedSkills,
      equipment: selectedEquipment,
      operatingArea: finalAreaName,
      assignedLocationId: selectedAreaId,
      assignedLocationName: finalAreaName,
      currentTask: assignedTask.trim() || `Disaster operations at ${finalAreaName}`,
      lat,
      lng,
      status: deploymentStatus,
      verificationStatus: 'VERIFIED',
      experienceSummary: experienceSummary.trim() || 'Registered team leader in national relief grid.'
    });

    // Close modal & notify
    setShowRegModal(false);
    setSelectedTeamId(newTeam.id);
    setSuccessBanner(
      `✓ Team "${newTeam.name}" successfully registered! Leader ${newTeam.leaderName} and ${newTeam.memberCount} volunteers allocated to ${finalAreaName}.`
    );

    // Reset form fields
    setLeaderName('');
    setTeamName('');
    setContact('+977-98');
    setMemberCount(6);
    setAiRationale(null);

    // Auto-clear banner after 8s
    setTimeout(() => {
      setSuccessBanner(null);
    }, 8000);
  };

  // Submit reassign
  const handleReassignSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reassignTeam) return;

    const targetArea = NEPAL_VOLUNTEER_AREAS.find(a => a.id === reassignAreaId) || NEPAL_VOLUNTEER_AREAS[0];
    assignTeamArea(
      reassignTeam.id,
      targetArea.id,
      targetArea.name,
      reassignTask.trim() || targetArea.suggestedTasks[0] || `Relief operations at ${targetArea.name}`,
      { lat: targetArea.lat, lng: targetArea.lng }
    );

    setSuccessBanner(
      `✓ Reassigned "${reassignTeam.name}" to ${targetArea.name} (${targetArea.district})`
    );
    setReassignTeam(null);
    setSelectedTeamId(reassignTeam.id);

    setTimeout(() => {
      setSuccessBanner(null);
    }, 6000);
  };

  // Quick reassign opener
  const openReassign = (team: VolunteerTeam) => {
    setReassignTeam(team);
    const existingArea = NEPAL_VOLUNTEER_AREAS.find(a => a.id === team.assignedLocationId);
    if (existingArea) {
      setReassignAreaId(existingArea.id);
      setReassignTask(team.currentTask || existingArea.suggestedTasks[0] || '');
    } else {
      setReassignAreaId(NEPAL_VOLUNTEER_AREAS[0].id);
      setReassignTask(team.currentTask || NEPAL_VOLUNTEER_AREAS[0].suggestedTasks[0] || '');
    }
  };

  // Filtered teams list
  const filteredTeams = useMemo(() => {
    return teams.filter(t => {
      const matchesSearch = 
        !searchQuery.trim() ||
        t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.leaderName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (t.assignedLocationName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (t.currentTask || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (t.skills || []).some(s => s.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesArea = 
        areaFilter === 'ALL' ||
        (t.assignedLocationName || t.operatingArea || '').toLowerCase().includes(areaFilter.toLowerCase());

      const matchesSpec = 
        specFilter === 'ALL' ||
        (t.specialization || '').toLowerCase().includes(specFilter.toLowerCase());

      const matchesStatus = 
        statusFilter === 'ALL' ||
        t.status === statusFilter;

      return matchesSearch && matchesArea && matchesSpec && matchesStatus;
    });
  }, [teams, searchQuery, areaFilter, specFilter, statusFilter]);

  // High-level statistics
  const totalVolunteers = useMemo(() => {
    return teams.reduce((acc, t) => acc + (t.memberCount || 0), 0);
  }, [teams]);

  const deployedTeamsCount = useMemo(() => {
    return teams.filter(t => t.status === 'DEPLOYED').length;
  }, [teams]);

  const uniqueAllocatedAreasCount = useMemo(() => {
    const set = new Set(teams.map(t => t.assignedLocationName || t.operatingArea).filter(Boolean));
    return set.size;
  }, [teams]);

  return (
    <section className="space-y-6">
      {/* Top Header & Metrics Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <div className="p-2 bg-emerald-100 dark:bg-emerald-950/80 rounded-lg text-emerald-700 dark:text-emerald-400">
                <Users className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                  {t('teams.title', 'Volunteer Team Allocation & Leader Registry')}
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  {t('teams.subtitle', 'Register volunteer team leaders, assign emergency disaster response areas, and track active field allocations across Nepal.')}
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <Button 
              size="default" 
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium shadow-sm flex items-center gap-2"
              onClick={() => {
                setShowRegModal(true);
                // Pre-evaluate optimal recommendation on open
                const rec = recommendAreaForTeam(selectedSkills, specialization);
                setSelectedAreaId(rec.recommendedArea.id);
                setAssignedTask(rec.task);
              }}
            >
              <Plus className="h-4 w-4" />
              {t('teams.register_leader', 'Register Team Leader')}
            </Button>
          </div>
        </div>

        {/* 4 Summary Metric Indicators */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4">
          <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-lg border border-slate-200/70 dark:border-slate-700/60">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
              {t('teams.registered_teams', 'Registered Teams')}
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-bold text-slate-900 dark:text-white">
                {teams.length}
              </span>
              <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                Active in registry
              </span>
            </div>
          </div>

          <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-lg border border-slate-200/70 dark:border-slate-700/60">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
              {t('teams.mobilized_responders', 'Mobilized Responders')}
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-bold text-slate-900 dark:text-white">
                {totalVolunteers}
              </span>
              <span className="text-xs text-slate-500 font-medium">
                Total volunteers
              </span>
            </div>
          </div>

          <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-lg border border-slate-200/70 dark:border-slate-700/60">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
              {t('teams.sectors_covered', 'Disaster Sectors Covered')}
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {uniqueAllocatedAreasCount}
              </span>
              <span className="text-xs text-slate-500 font-medium">
                Distinct zones
              </span>
            </div>
          </div>

          <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-lg border border-slate-200/70 dark:border-slate-700/60">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
              {t('teams.deployment_status', 'Deployment Status')}
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                {deployedTeamsCount}
              </span>
              <span className="text-xs text-slate-500 font-medium">
                /{teams.length} on ground
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Success Notification Banner */}
      {successBanner && (
        <div className="bg-emerald-50 dark:bg-emerald-950/70 border border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200 p-4 rounded-xl flex items-center justify-between shadow-sm animate-fade-in">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span className="text-sm font-medium">{successBanner}</span>
          </div>
          <button 
            onClick={() => setSuccessBanner(null)}
            className="text-emerald-700 dark:text-emerald-300 hover:text-emerald-900 text-sm font-bold ml-3"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* View Mode & Filter Controls */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder={t('teams.search_placeholder', 'Search by team, leader, allocated area, or skill...')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-1.5 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {/* View Mode Switcher */}
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg self-start md:self-auto">
            <button
              onClick={() => setViewMode('split')}
              className={cn(
                "px-3 py-1.5 text-xs font-medium rounded-md transition-all flex items-center gap-1.5",
                viewMode === 'split' 
                  ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm" 
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              )}
            >
              <Layers className="h-3.5 w-3.5" />
              Map & Cards
            </button>
            <button
              onClick={() => setViewMode('map')}
              className={cn(
                "px-3 py-1.5 text-xs font-medium rounded-md transition-all flex items-center gap-1.5",
                viewMode === 'map' 
                  ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm" 
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              )}
            >
              <Compass className="h-3.5 w-3.5" />
              Map Only
            </button>
            <button
              onClick={() => setViewMode('cards')}
              className={cn(
                "px-3 py-1.5 text-xs font-medium rounded-md transition-all flex items-center gap-1.5",
                viewMode === 'cards' 
                  ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm" 
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              )}
            >
              <Users className="h-3.5 w-3.5" />
              Team Cards ({filteredTeams.length})
            </button>
          </div>
        </div>

        {/* Secondary Filter Selectors */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
          <span className="font-semibold text-slate-500 dark:text-slate-400 mr-1 flex items-center gap-1">
            <Filter className="h-3.5 w-3.5" /> Filters:
          </span>

          {/* Area Filter */}
          <select
            value={areaFilter}
            onChange={(e) => setAreaFilter(e.target.value)}
            className="border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-200 rounded-md px-2.5 py-1 text-xs focus:outline-none"
          >
            <option value="ALL">All Allocated Areas</option>
            <option value="Melamchi">Melamchi & Helambu (Sindhupalchok)</option>
            <option value="Kathmandu">Kathmandu Valley Corridor</option>
            <option value="Chitwan">Narayangarh & Bharatpur (Chitwan)</option>
            <option value="Rasuwa">Rasuwa Highland Outpost</option>
            <option value="Pokhara">Pokhara Staging Base</option>
            <option value="Dhulikhel">Dhulikhel Corridor</option>
          </select>

          {/* Specialization Filter */}
          <select
            value={specFilter}
            onChange={(e) => setSpecFilter(e.target.value)}
            className="border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-200 rounded-md px-2.5 py-1 text-xs focus:outline-none"
          >
            <option value="ALL">All Specializations</option>
            {SPECIALIZATIONS.map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-200 rounded-md px-2.5 py-1 text-xs focus:outline-none"
          >
            <option value="ALL">All Statuses</option>
            <option value="DEPLOYED">DEPLOYED (Active on-site)</option>
            <option value="STANDBY">STANDBY</option>
            <option value="AVAILABLE">AVAILABLE</option>
          </select>

          {(areaFilter !== 'ALL' || specFilter !== 'ALL' || statusFilter !== 'ALL' || searchQuery) && (
            <button
              onClick={() => {
                setAreaFilter('ALL');
                setSpecFilter('ALL');
                setStatusFilter('ALL');
                setSearchQuery('');
              }}
              className="text-blue-600 dark:text-blue-400 hover:underline text-xs ml-auto font-medium"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Main Content Layout based on viewMode */}
      <div className="space-y-6">
        {/* Interactive Allocation Map Component (shown in 'split' or 'map' modes) */}
        {(viewMode === 'split' || viewMode === 'map') && (
          <TeamAllocationMap
            teams={filteredTeams}
            selectedTeamId={selectedTeamId}
            onSelectTeam={(t) => setSelectedTeamId(t.id)}
            onReassignTeam={openReassign}
          />
        )}

        {/* Allocated Teams Cards Directory (shown in 'split' or 'cards' modes) */}
        {(viewMode === 'split' || viewMode === 'cards') && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-slate-900 dark:text-white text-lg flex items-center gap-2">
                <MapPin className="h-5 w-5 text-red-500" />
                Allocated Volunteer Teams & Mission Stations ({filteredTeams.length})
              </h4>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                Click any team card to highlight their deployment position
              </span>
            </div>

            {filteredTeams.length === 0 ? (
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-8 text-center text-slate-500">
                <Users className="h-10 w-10 mx-auto text-slate-300 dark:text-slate-700 mb-2" />
                <p className="font-semibold text-slate-700 dark:text-slate-300">No teams matched current search/filter criteria.</p>
                <p className="text-xs mt-1">Try clearing filters or register a new team leader above.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredTeams.map(team => {
                  const isSelected = team.id === selectedTeamId;
                  const isDeployed = team.status === 'DEPLOYED';

                  return (
                    <Card
                      key={team.id}
                      className={cn(
                        "transition-all cursor-pointer border hover:shadow-md flex flex-col justify-between",
                        isSelected 
                          ? "ring-2 ring-blue-500 dark:ring-blue-400 border-blue-400 bg-blue-50/20 dark:bg-blue-950/20" 
                          : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700"
                      )}
                      onClick={() => setSelectedTeamId(team.id)}
                    >
                      <div>
                        {/* Team Card Header */}
                        <div className="flex justify-between items-start mb-3 gap-2">
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <h4 className="font-bold text-base text-slate-900 dark:text-white">
                                {team.name}
                              </h4>
                              {team.verificationStatus === 'VERIFIED' && (
                                <Badge variant="success" className="text-[10px] py-0 px-1.5">
                                  VERIFIED
                                </Badge>
                              )}
                            </div>
                            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-0.5">
                              Leader: <strong className="text-slate-800 dark:text-slate-200">{team.leaderName}</strong> • {team.memberCount} Responders
                            </p>
                          </div>

                          <div className="flex items-center gap-1 shrink-0">
                            <span className={cn(
                              "inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border",
                              isDeployed 
                                ? "bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800"
                                : "bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-800"
                            )}>
                              {team.status}
                            </span>
                          </div>
                        </div>

                        {/* Specialization & Skills */}
                        <div className="mb-3 space-y-1.5">
                          <div className="flex items-center gap-1.5 text-xs">
                            <span className="font-semibold text-slate-600 dark:text-slate-400">Specialization:</span>
                            <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-medium">
                              {team.specialization || 'General Relief'}
                            </span>
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {(team.skills || []).map(skill => (
                              <span 
                                key={skill} 
                                className="text-[11px] px-2 py-0.5 rounded bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400"
                              >
                                {skill}
                              </span>
                            ))}
                          </div>
                        </div>

                        {/* Allocated Volunteer Area Callout (Core Requirement) */}
                        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-slate-800/70 dark:to-slate-800/40 p-3 rounded-lg border border-blue-200/80 dark:border-slate-700 mb-3">
                          <div className="flex items-start gap-2">
                            <MapPin className="h-4 w-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                            <div className="flex-1">
                              <span className="text-[10px] font-bold uppercase text-blue-800 dark:text-blue-300 tracking-wider block">
                                Allocated Volunteer Operating Area
                              </span>
                              <p className="font-semibold text-slate-900 dark:text-white text-xs mt-0.5">
                                {team.assignedLocationName || team.operatingArea || 'Standby Relief Base'}
                              </p>
                              {team.currentTask && (
                                <p className="text-xs text-slate-600 dark:text-slate-300 mt-1.5 leading-relaxed bg-white/70 dark:bg-slate-900/60 p-2 rounded border border-blue-100 dark:border-slate-800">
                                  <strong className="text-slate-800 dark:text-slate-200 font-medium">Active Mission: </strong>
                                  {team.currentTask}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Equipment List */}
                        {team.equipment && team.equipment.length > 0 && (
                          <div className="text-xs text-slate-500 mb-3">
                            <span className="font-medium text-slate-600 dark:text-slate-400 flex items-center gap-1 mb-1">
                              <Wrench className="h-3 w-3 text-slate-400" /> Equipment Gear:
                            </span>
                            <div className="flex flex-wrap gap-1">
                              {team.equipment.slice(0, 3).map(eq => (
                                <span key={eq} className="text-[10px] bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-slate-700 dark:text-slate-300">
                                  {eq}
                                </span>
                              ))}
                              {team.equipment.length > 3 && (
                                <span className="text-[10px] text-slate-400">
                                  +{team.equipment.length - 3} more
                                </span>
                              )}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Card Footer Actions */}
                      <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2 mt-2">
                        {team.contact ? (
                          <a
                            href={`tel:${team.contact}`}
                            onClick={(e) => e.stopPropagation()}
                            className="text-xs font-mono font-medium text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                          >
                            <Phone className="h-3.5 w-3.5" />
                            {team.contact}
                          </a>
                        ) : (
                          <span className="text-xs text-slate-400 italic">No phone logged</span>
                        )}

                        <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 text-xs px-2"
                            onClick={() => openReassign(team)}
                          >
                            <RefreshCw className="h-3 w-3 mr-1" />
                            Reassign Area
                          </Button>
                          <Button
                            size="sm"
                            variant={isDeployed ? "ghost" : "secondary"}
                            className="h-7 text-xs px-2"
                            onClick={() => updateTeamStatus(team.id, isDeployed ? 'STANDBY' : 'DEPLOYED')}
                          >
                            {isDeployed ? 'Set Standby' : 'Set Deployed'}
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
      {/* MODAL 1: TEAM LEADER REGISTRATION & AREA ALLOCATION                       */}
      {/* ========================================================================= */}
      {showRegModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 dark:bg-slate-950/85 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-emerald-600 to-teal-700 text-white p-5 flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-emerald-200" />
                  <h3 className="font-bold text-lg leading-tight">
                    Register Volunteer Team Leader
                  </h3>
                </div>
                <p className="text-xs text-emerald-100 mt-1">
                  National Disaster Response Volunteer Network • Immediate Area Deployment
                </p>
              </div>
              <button
                onClick={() => setShowRegModal(false)}
                className="text-emerald-100 hover:text-white p-1 rounded-md"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleRegisterSubmit} className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
              {/* SECTION 1: Team & Leader Profile */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
                  <span className="w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 font-bold text-xs flex items-center justify-center">
                    1
                  </span>
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                    Team Leader & Crew Identity
                  </h4>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold uppercase text-slate-500 mb-1 block">
                      Team Leader Full Name *
                    </label>
                    <input
                      required
                      type="text"
                      placeholder="e.g. Ramesh Karki"
                      value={leaderName}
                      onChange={(e) => setLeaderName(e.target.value)}
                      className="w-full border border-slate-300 dark:border-slate-700 rounded-lg p-2.5 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold uppercase text-slate-500 mb-1 block">
                      Leader Contact Phone / Mobile *
                    </label>
                    <input
                      required
                      type="tel"
                      placeholder="+977-9841-XXXXXX"
                      value={contact}
                      onChange={(e) => setContact(e.target.value)}
                      className="w-full border border-slate-300 dark:border-slate-700 rounded-lg p-2.5 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold uppercase text-slate-500 mb-1 block">
                      Team Unit Name *
                    </label>
                    <input
                      required
                      type="text"
                      placeholder="e.g. Kavre Alpine Swiftwater Corps"
                      value={teamName}
                      onChange={(e) => setTeamName(e.target.value)}
                      className="w-full border border-slate-300 dark:border-slate-700 rounded-lg p-2.5 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold uppercase text-slate-500 mb-1 block">
                      Number of Active Responders / Volunteers *
                    </label>
                    <input
                      required
                      type="number"
                      min="1"
                      max="50"
                      value={memberCount}
                      onChange={(e) => setMemberCount(parseInt(e.target.value) || 1)}
                      className="w-full border border-slate-300 dark:border-slate-700 rounded-lg p-2.5 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold uppercase text-slate-500 mb-1 block">
                    Core Specialization *
                  </label>
                  <select
                    value={specialization}
                    onChange={(e) => setSpecialization(e.target.value)}
                    className="w-full border border-slate-300 dark:border-slate-700 rounded-lg p-2.5 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    {SPECIALIZATIONS.map(spec => (
                      <option key={spec} value={spec}>{spec}</option>
                    ))}
                  </select>
                </div>

                {/* Skills Toggle Chips */}
                <div>
                  <label className="text-xs font-semibold uppercase text-slate-500 mb-1.5 block">
                    Team Skills & Certifications
                  </label>
                  <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto p-2 bg-slate-50 dark:bg-slate-950/60 rounded-lg border border-slate-200 dark:border-slate-800">
                    {VOLUNTEER_SKILL_CATEGORIES.map(skill => {
                      const active = selectedSkills.includes(skill);
                      return (
                        <button
                          key={skill}
                          type="button"
                          onClick={() => toggleSkill(skill)}
                          className={cn(
                            "px-2.5 py-1 rounded-md text-xs font-medium transition-all flex items-center gap-1",
                            active 
                              ? "bg-emerald-600 text-white shadow-sm" 
                              : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700"
                          )}
                        >
                          {active && <Check className="h-3 w-3" />}
                          {skill}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Equipment Inventory */}
                <div>
                  <label className="text-xs font-semibold uppercase text-slate-500 mb-1.5 block">
                    Available Response Equipment
                  </label>
                  <div className="flex flex-wrap gap-1.5 p-2 bg-slate-50 dark:bg-slate-950/60 rounded-lg border border-slate-200 dark:border-slate-800">
                    {COMMON_EQUIPMENT.map(eq => {
                      const active = selectedEquipment.includes(eq);
                      return (
                        <button
                          key={eq}
                          type="button"
                          onClick={() => toggleEquipment(eq)}
                          className={cn(
                            "px-2.5 py-1 rounded-md text-xs font-medium transition-all flex items-center gap-1",
                            active 
                              ? "bg-blue-600 text-white shadow-sm" 
                              : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700"
                          )}
                        >
                          {active && <Check className="h-3 w-3" />}
                          {eq}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* SECTION 2: AREA ALLOCATION (CORE USER REQUIREMENT) */}
              <div className="space-y-4 pt-2 border-t border-slate-200 dark:border-slate-800">
                <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-400 font-bold text-xs flex items-center justify-center">
                      2
                    </span>
                    <h4 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-1.5">
                      <MapPin className="h-4 w-4 text-blue-600" />
                      Area Allocation & Operational Mission
                    </h4>
                  </div>

                  {/* AI Smart Match Trigger */}
                  <button
                    type="button"
                    onClick={handleSmartAreaRecommendation}
                    className="text-xs font-bold text-fuchsia-600 dark:text-fuchsia-400 bg-fuchsia-50 dark:bg-fuchsia-950/70 border border-fuchsia-200 dark:border-fuchsia-900 px-2.5 py-1 rounded-md hover:bg-fuchsia-100 flex items-center gap-1.5 transition-colors"
                  >
                    <Sparkles className="h-3.5 w-3.5" />
                    Auto-Recommend Optimal Area
                  </button>
                </div>

                {/* AI Rationale banner if triggered */}
                {aiRationale && (
                  <div className="bg-fuchsia-50 dark:bg-fuchsia-950/60 border border-fuchsia-200 dark:border-fuchsia-900 p-3 rounded-lg text-xs text-fuchsia-900 dark:text-fuchsia-200 flex items-start gap-2 animate-fade-in">
                    <Sparkles className="h-4 w-4 text-fuchsia-600 shrink-0 mt-0.5" />
                    <span className="leading-relaxed">{aiRationale}</span>
                  </div>
                )}

                {/* Area Dropdown Selector */}
                <div>
                  <label className="text-xs font-semibold uppercase text-slate-500 mb-1 block">
                    Assigned Disaster Operating Area *
                  </label>
                  <select
                    value={selectedAreaId}
                    onChange={(e) => handleAreaChange(e.target.value)}
                    className="w-full border border-slate-300 dark:border-slate-700 rounded-lg p-2.5 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {NEPAL_VOLUNTEER_AREAS.map(area => (
                      <option key={area.id} value={area.id}>
                        {area.name} ({area.district}) — [{area.severity} NEED: {area.primaryNeed}]
                      </option>
                    ))}
                    <option value="CUSTOM">+ Specify Custom Operating Area / Ward</option>
                  </select>
                </div>

                {/* Custom area text input if selected */}
                {selectedAreaId === 'CUSTOM' && (
                  <div>
                    <label className="text-xs font-semibold uppercase text-slate-500 mb-1 block">
                      Custom Location Name & District
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Ward 3 Riverside Outpost, Makwanpur"
                      value={customAreaName}
                      onChange={(e) => setCustomAreaName(e.target.value)}
                      className="w-full border border-slate-300 dark:border-slate-700 rounded-lg p-2.5 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-sm focus:outline-none"
                    />
                  </div>
                )}

                {/* Area Info Snapshot */}
                {selectedAreaId !== 'CUSTOM' && (
                  <div className="bg-slate-50 dark:bg-slate-950 p-3 rounded-lg border border-slate-200 dark:border-slate-800 text-xs space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-500">District: <strong className="text-slate-800 dark:text-slate-200">{currentSelectedArea.district}, {currentSelectedArea.province}</strong></span>
                      <Badge 
                        variant={currentSelectedArea.severity === 'CRITICAL' ? 'critical' : 'warning'} 
                        className="text-[10px]"
                      >
                        {currentSelectedArea.severity} PRIORITY
                      </Badge>
                    </div>
                    <p className="text-slate-600 dark:text-slate-400 mt-1">
                      {currentSelectedArea.description}
                    </p>
                  </div>
                )}

                {/* Mission / Operational Task */}
                <div>
                  <label className="text-xs font-semibold uppercase text-slate-500 mb-1 block">
                    Specific Assigned Mission / Task *
                  </label>
                  <textarea
                    required
                    rows={2}
                    placeholder="Describe the operational mission allocated to this team..."
                    value={assignedTask}
                    onChange={(e) => setAssignedTask(e.target.value)}
                    className="w-full border border-slate-300 dark:border-slate-700 rounded-lg p-2.5 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {selectedAreaId !== 'CUSTOM' && currentSelectedArea.suggestedTasks.length > 1 && (
                    <div className="mt-1.5 flex flex-wrap gap-1.5">
                      <span className="text-[10px] text-slate-400">Quick task presets:</span>
                      {currentSelectedArea.suggestedTasks.map((t, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setAssignedTask(t)}
                          className="text-[10px] text-blue-600 dark:text-blue-400 hover:underline bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 rounded border border-blue-200/50"
                        >
                          Preset {idx + 1}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Initial Deployment Status */}
                <div>
                  <label className="text-xs font-semibold uppercase text-slate-500 mb-1 block">
                    Deployment Readiness
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <label className={cn(
                      "p-3 rounded-lg border cursor-pointer flex items-center gap-2 text-xs font-medium transition-all",
                      deploymentStatus === 'DEPLOYED'
                        ? "bg-emerald-50 dark:bg-emerald-950/50 border-emerald-400 text-emerald-800 dark:text-emerald-200"
                        : "bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400"
                    )}>
                      <input
                        type="radio"
                        name="deploymentStatus"
                        value="DEPLOYED"
                        checked={deploymentStatus === 'DEPLOYED'}
                        onChange={() => setDeploymentStatus('DEPLOYED')}
                        className="text-emerald-600"
                      />
                      <span><strong>DEPLOYED</strong> (Deploy Immediately on-site)</span>
                    </label>

                    <label className={cn(
                      "p-3 rounded-lg border cursor-pointer flex items-center gap-2 text-xs font-medium transition-all",
                      deploymentStatus === 'STANDBY'
                        ? "bg-amber-50 dark:bg-amber-950/50 border-amber-400 text-amber-800 dark:text-amber-200"
                        : "bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400"
                    )}>
                      <input
                        type="radio"
                        name="deploymentStatus"
                        value="STANDBY"
                        checked={deploymentStatus === 'STANDBY'}
                        onChange={() => setDeploymentStatus('STANDBY')}
                        className="text-amber-600"
                      />
                      <span><strong>STANDBY</strong> (Allocated & on call)</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-3">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setShowRegModal(false)}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium flex items-center gap-2"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  Register Team & Confirm Area Allocation
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: QUICK REASSIGN TEAM AREA                                         */}
      {/* ========================================================================= */}
      {reassignTeam && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 dark:bg-slate-950/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden animate-in fade-in zoom-in-95">
            <div className="bg-blue-600 text-white p-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Compass className="h-5 w-5" />
                <h4 className="font-bold text-base">
                  Reassign Operating Area for {reassignTeam.name}
                </h4>
              </div>
              <button
                onClick={() => setReassignTeam(null)}
                className="text-blue-200 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleReassignSubmit} className="p-5 space-y-4">
              <div className="text-xs text-slate-500 bg-slate-50 dark:bg-slate-950 p-3 rounded-lg border border-slate-200 dark:border-slate-800">
                <span>Currently operating at: </span>
                <strong className="text-slate-800 dark:text-slate-200 block mt-0.5">
                  {reassignTeam.assignedLocationName || reassignTeam.operatingArea}
                </strong>
              </div>

              <div>
                <label className="text-xs font-semibold uppercase text-slate-500 mb-1 block">
                  Select New Disaster Operating Sector
                </label>
                <select
                  value={reassignAreaId}
                  onChange={(e) => {
                    setReassignAreaId(e.target.value);
                    const area = NEPAL_VOLUNTEER_AREAS.find(a => a.id === e.target.value);
                    if (area) {
                      setReassignTask(area.suggestedTasks[0] || '');
                    }
                  }}
                  className="w-full border border-slate-300 dark:border-slate-700 rounded-lg p-2.5 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-sm focus:outline-none"
                >
                  {NEPAL_VOLUNTEER_AREAS.map(area => (
                    <option key={area.id} value={area.id}>
                      {area.name} ({area.district}) — [{area.severity}]
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold uppercase text-slate-500 mb-1 block">
                  Updated Mission / Operational Directive
                </label>
                <textarea
                  required
                  rows={2}
                  value={reassignTask}
                  onChange={(e) => setReassignTask(e.target.value)}
                  className="w-full border border-slate-300 dark:border-slate-700 rounded-lg p-2.5 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-sm focus:outline-none"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setReassignTeam(null)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  className="bg-blue-600 hover:bg-blue-700 text-white font-medium"
                >
                  Update Area Allocation
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}
