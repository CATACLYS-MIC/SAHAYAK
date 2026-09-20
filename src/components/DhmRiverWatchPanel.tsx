import React, { useState, useMemo } from 'react';
import { 
  Waves, AlertTriangle, TrendingUp, TrendingDown, Minus, RefreshCw, 
  Search, SlidersHorizontal, ShieldAlert, CheckCircle2, Info, 
  ExternalLink, BrainCircuit, Sparkles, MapPin, Building2, 
  ArrowUpRight, AlertCircle, Eye, ShieldCheck, X
} from 'lucide-react';
import { Card, CardHeader, Badge, Button } from '@/components/ui';
import { useAppState } from '@/lib/store';
import { DhmRiverStation, RiverFloodPredictionInsight, SahayakRiverRiskLevel } from '@/types';
import { DhmHydrologyService } from '@/lib/dhmHydrologyService';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

export function DhmRiverWatchPanel() {
  const { 
    dhmStations, dhmSummary, dhmLoading, dhmError, 
    dhmDemoMode, setDhmDemoMode, refreshDhmStations 
  } = useAppState();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBasin, setSelectedBasin] = useState<string>('ALL');
  const [selectedRiskFilter, setSelectedRiskFilter] = useState<string>('ALL');
  const [selectedTrendFilter, setSelectedTrendFilter] = useState<string>('ALL');
  const [selectedStation, setSelectedStation] = useState<DhmRiverStation | null>(null);
  const [aiInsight, setAiInsight] = useState<RiverFloodPredictionInsight | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Basins list
  const basins = useMemo(() => {
    const set = new Set<string>();
    dhmStations.forEach(s => {
      if (s.basin && s.basin.trim() !== '') set.add(s.basin.trim());
    });
    return Array.from(set).sort();
  }, [dhmStations]);

  // Filtered stations
  const filteredStations = useMemo(() => {
    return dhmStations.filter(st => {
      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = st.name.toLowerCase().includes(q);
        const matchesRiver = (st.riverName || '').toLowerCase().includes(q);
        const matchesDistrict = (st.district || '').toLowerCase().includes(q);
        const matchesBasin = (st.basin || '').toLowerCase().includes(q);
        if (!matchesName && !matchesRiver && !matchesDistrict && !matchesBasin) return false;
      }

      // Basin
      if (selectedBasin !== 'ALL' && st.basin !== selectedBasin) {
        return false;
      }

      // Risk filter
      if (selectedRiskFilter !== 'ALL') {
        if (selectedRiskFilter === 'CRITICAL' && st.sahayakRisk !== 'CRITICAL') return false;
        if (selectedRiskFilter === 'HIGH' && st.sahayakRisk !== 'HIGH') return false;
        if (selectedRiskFilter === 'WATCH' && st.sahayakRisk !== 'WATCH') return false;
        if (selectedRiskFilter === 'LOW' && st.sahayakRisk !== 'LOW') return false;
        if (selectedRiskFilter === 'WARNING_OR_DANGER' && st.sahayakRisk !== 'CRITICAL' && st.sahayakRisk !== 'HIGH') return false;
      }

      // Trend filter
      if (selectedTrendFilter !== 'ALL') {
        if (st.trend !== selectedTrendFilter) return false;
      }

      return true;
    }).sort((a, b) => {
      // Priority sorting: CRITICAL first, then HIGH, then WATCH, then LOW
      const riskScores: Record<SahayakRiverRiskLevel, number> = {
        CRITICAL: 4,
        HIGH: 3,
        WATCH: 2,
        LOW: 1
      };
      if (riskScores[b.sahayakRisk] !== riskScores[a.sahayakRisk]) {
        return riskScores[b.sahayakRisk] - riskScores[a.sahayakRisk];
      }
      // Then if same risk, sort by waterToWarningRatio descending
      const aRatio = a.waterToWarningRatio || 0;
      const bRatio = b.waterToWarningRatio || 0;
      return bRatio - aRatio;
    });
  }, [dhmStations, searchQuery, selectedBasin, selectedRiskFilter, selectedTrendFilter]);

  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refreshDhmStations({ force: true });
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleToggleDemoMode = async () => {
    const nextDemo = !dhmDemoMode;
    setDhmDemoMode(nextDemo);
    setIsRefreshing(true);
    try {
      await refreshDhmStations({ demo: nextDemo, force: true });
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleOpenStationDetail = async (station: DhmRiverStation) => {
    setSelectedStation(station);
    setAiInsight(null);
    setAiError(null);
    setAiLoading(true);

    try {
      const insight = await DhmHydrologyService.getAiFloodAssessment(station);
      setAiInsight(insight);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setAiError(msg || 'AI analysis temporarily offline.');
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. HEADER & INTEGRATION STATUS BANNER */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-950 to-slate-900 text-white p-6 rounded-2xl border border-blue-800/40 shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="p-2 rounded-lg bg-blue-500/20 text-blue-300 border border-blue-400/30">
                <Waves className="w-5 h-5" />
              </span>
              <h2 className="text-xl sm:text-2xl font-black tracking-tight">
                Nepal DHM River Watch Hydrology Intelligence
              </h2>
              {dhmSummary?.dataSource === 'LIVE' && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 animate-pulse">
                  <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                  OFFICIAL LIVE FEED
                </span>
              )}
              {dhmSummary?.dataSource === 'CACHED' && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                  <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                  CACHED TELEMETRY
                </span>
              )}
              {dhmDemoMode && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-500/20 text-purple-300 border border-purple-500/40">
                  <Sparkles className="w-3.5 h-3.5" />
                  SIMULATED SURGE (DEMO)
                </span>
              )}
            </div>
            <p className="text-sm text-blue-200/80 max-w-3xl leading-relaxed">
              Official hydrological monitoring of Nepal river basins (Koshi, Gandaki, Narayani, Bagmati, Karnali, West Rapti, and tributaries) from the Department of Hydrology and Meteorology. Coupled with SAHAYAK deterministic threshold clearance and AI flood-threat synthesis.
            </p>
            <div className="flex items-center gap-3 text-xs text-blue-300/60 pt-1 flex-wrap">
              <span>Attribution: <strong>DHM, Government of Nepal</strong></span>
              <span>•</span>
              <span>Telemetry sync: {dhmSummary?.lastUpdated ? new Date(dhmSummary.lastUpdated).toLocaleTimeString() : 'Just now'}</span>
              <span>•</span>
              <a 
                href="https://dhm.gov.np/hydrology/river-watch" 
                target="_blank" 
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-blue-300 hover:text-white underline underline-offset-2 transition-colors"
              >
                Official Portal <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-3 shrink-0 flex-wrap">
            <Button
              variant={dhmDemoMode ? 'warning' : 'outline'}
              size="sm"
              onClick={handleToggleDemoMode}
              className={`border-blue-400/40 text-xs font-semibold ${dhmDemoMode ? 'bg-amber-500 text-slate-950 hover:bg-amber-400' : 'bg-blue-950/60 text-blue-200 hover:bg-blue-900'}`}
              title="Toggle simulated monsoon flood surge demonstration"
            >
              <Sparkles className="w-3.5 h-3.5 mr-1.5" />
              {dhmDemoMode ? 'Exit Demo Surge' : 'Simulate Flood Surge'}
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={handleManualRefresh}
              disabled={isRefreshing || dhmLoading}
              className="bg-blue-950/60 border-blue-400/40 text-blue-200 hover:bg-blue-900 text-xs font-semibold"
            >
              <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${isRefreshing || dhmLoading ? 'animate-spin' : ''}`} />
              {isRefreshing ? 'Refreshing...' : 'Poll DHM Now'}
            </Button>
          </div>
        </div>

        {/* DEMO NOTICE BANNER (if demo active) */}
        {dhmDemoMode && (
          <div className="mt-4 p-3 rounded-xl bg-amber-950/60 border border-amber-500/40 text-amber-200 text-xs flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
              <span>
                <strong>SIMULATED MONSOON SURGE ACTIVE:</strong> Critical gauges (Lal Bakiya Khola, West Rapti, Bagmati Khokana, Narayani Devghat, Saptakoshi Chatara) are currently rendering high-water overflow scenarios for responder emergency drills.
              </span>
            </div>
            <button 
              onClick={handleToggleDemoMode}
              className="underline font-bold text-amber-300 hover:text-white shrink-0 text-xs"
            >
              Revert to Live Feed
            </button>
          </div>
        )}
      </div>

      {/* 2. SUMMARY METRIC CARDS */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <Card className="p-4 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col justify-between">
          <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Total Stations</div>
          <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">
            {dhmSummary?.totalStations ?? dhmStations.length}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Monitored Nationwide</div>
        </Card>

        <Card className="p-4 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col justify-between">
          <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Active Telemetry</div>
          <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
            {dhmSummary?.activeStations ?? dhmStations.filter(s => s.waterLevel !== null).length}
          </div>
          <div className="text-[11px] text-emerald-600 dark:text-emerald-400/80 mt-1">Reporting Gauges</div>
        </Card>

        <Card className={`p-4 border-slate-200 dark:border-slate-800 flex flex-col justify-between ${(dhmSummary?.criticalRiskCount ?? 0) > 0 ? 'bg-red-50/80 dark:bg-red-950/30 border-red-300 dark:border-red-900/60' : 'bg-white dark:bg-slate-900'}`}>
          <div className="text-xs font-semibold text-red-600 dark:text-red-400 uppercase tracking-wider flex items-center justify-between">
            <span>Danger Breached</span>
            <ShieldAlert className="w-3.5 h-3.5" />
          </div>
          <div className="text-2xl font-black text-red-600 dark:text-red-400 mt-1">
            {dhmSummary?.criticalRiskCount ?? 0}
          </div>
          <div className="text-[11px] text-red-700 dark:text-red-400/80 mt-1">Above Danger Level</div>
        </Card>

        <Card className={`p-4 border-slate-200 dark:border-slate-800 flex flex-col justify-between ${(dhmSummary?.highRiskCount ?? 0) > 0 ? 'bg-orange-50/80 dark:bg-orange-950/30 border-orange-300 dark:border-orange-900/60' : 'bg-white dark:bg-slate-900'}`}>
          <div className="text-xs font-semibold text-orange-600 dark:text-orange-400 uppercase tracking-wider flex items-center justify-between">
            <span>Warning Level</span>
            <AlertTriangle className="w-3.5 h-3.5" />
          </div>
          <div className="text-2xl font-black text-orange-600 dark:text-orange-400 mt-1">
            {dhmSummary?.highRiskCount ?? 0}
          </div>
          <div className="text-[11px] text-orange-700 dark:text-orange-400/80 mt-1">Above Warning Level</div>
        </Card>

        <Card className={`p-4 border-slate-200 dark:border-slate-800 flex flex-col justify-between ${(dhmSummary?.risingCount ?? 0) > 0 ? 'bg-blue-50/80 dark:bg-blue-950/30' : 'bg-white dark:bg-slate-900'}`}>
          <div className="text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider flex items-center justify-between">
            <span>Rising Rivers</span>
            <TrendingUp className="w-3.5 h-3.5" />
          </div>
          <div className="text-2xl font-black text-blue-600 dark:text-blue-400 mt-1">
            {dhmSummary?.risingCount ?? 0}
          </div>
          <div className="text-[11px] text-blue-700 dark:text-blue-400/80 mt-1">Hydro Surge Velocity</div>
        </Card>

        <Card className="p-4 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col justify-between">
          <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center justify-between">
            <span>Steady / Receding</span>
            <Minus className="w-3.5 h-3.5" />
          </div>
          <div className="text-2xl font-black text-slate-700 dark:text-slate-300 mt-1">
            {(dhmSummary?.steadyCount ?? 0) + (dhmSummary?.fallingCount ?? 0)}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            {dhmSummary?.fallingCount ?? 0} falling • {dhmSummary?.steadyCount ?? 0} steady
          </div>
        </Card>
      </div>

      {/* 3. SEARCH & BASIN FILTERS */}
      <Card className="p-4 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
          {/* Search box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search river, station name, basin, or district (e.g. Bagmati, Lal Bakiya, Narayani, Banke)..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-white text-xs"
              >
                Clear
              </button>
            )}
          </div>

          {/* Basin selector */}
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-slate-400 shrink-0" />
            <select
              value={selectedBasin}
              onChange={e => setSelectedBasin(e.target.value)}
              className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="ALL">All Basins ({dhmStations.length})</option>
              {basins.map(b => (
                <option key={b} value={b}>{b}</option>
              ))}
            </select>

            {/* Risk filter */}
            <select
              value={selectedRiskFilter}
              onChange={e => setSelectedRiskFilter(e.target.value)}
              className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="ALL">All Threat Levels</option>
              <option value="WARNING_OR_DANGER">Alert Only (Warning/Danger)</option>
              <option value="CRITICAL">Critical (Above Danger)</option>
              <option value="HIGH">High (Above Warning)</option>
              <option value="WATCH">Watch (Approaching)</option>
              <option value="LOW">Low Risk</option>
            </select>

            {/* Trend filter */}
            <select
              value={selectedTrendFilter}
              onChange={e => setSelectedTrendFilter(e.target.value)}
              className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="ALL">All Trends</option>
              <option value="RISING">Rising Only ↗</option>
              <option value="STEADY">Steady Only →</option>
              <option value="FALLING">Falling Only ↘</option>
            </select>
          </div>
        </div>

        {/* Active filter count and tags */}
        <div className="mt-3 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800/60">
          <span>Showing <strong>{filteredStations.length}</strong> of <strong>{dhmStations.length}</strong> monitored DHM stations</span>
          {(selectedBasin !== 'ALL' || selectedRiskFilter !== 'ALL' || selectedTrendFilter !== 'ALL' || searchQuery) && (
            <button
              onClick={() => {
                setSelectedBasin('ALL');
                setSelectedRiskFilter('ALL');
                setSelectedTrendFilter('ALL');
                setSearchQuery('');
              }}
              className="text-blue-600 dark:text-blue-400 hover:underline font-semibold"
            >
              Reset all filters
            </button>
          )}
        </div>
      </Card>

      {/* 4. STATIONS GRID / CARDS */}
      {dhmLoading && dhmStations.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
          <RefreshCw className="w-8 h-8 mx-auto text-blue-500 animate-spin mb-3" />
          <p className="text-base font-semibold text-slate-700 dark:text-slate-200">Connecting to Nepal DHM Hydrology Network...</p>
          <p className="text-xs text-slate-500 mt-1">Retrieving official river water levels across Nepal river basins</p>
        </div>
      ) : filteredStations.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
          <Waves className="w-10 h-10 mx-auto text-slate-400 mb-3" />
          <p className="text-base font-semibold text-slate-700 dark:text-slate-200">No river stations match your search filters.</p>
          <p className="text-xs text-slate-500 mt-1">Try clearing your search terms or selecting "All Threat Levels".</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredStations.map(station => {
            const isCritical = station.sahayakRisk === 'CRITICAL';
            const isHigh = station.sahayakRisk === 'HIGH';
            const isWatch = station.sahayakRisk === 'WATCH';
            
            // Percentage of water level relative to danger or warning
            const dangerLevel = station.dangerLevel || 0;
            const warningLevel = station.warningLevel || 0;
            const waterLevel = station.waterLevel || 0;
            
            // Calculate progress bar relative to danger
            let percentFill = 0;
            if (dangerLevel > 0) {
              percentFill = Math.min(Math.round((waterLevel / dangerLevel) * 100), 100);
            } else if (warningLevel > 0) {
              percentFill = Math.min(Math.round((waterLevel / warningLevel) * 100), 100);
            }

            return (
              <Card 
                key={station.id}
                className={`p-5 transition-all hover:shadow-lg border flex flex-col justify-between ${
                  isCritical 
                    ? 'border-red-400/80 dark:border-red-800 bg-red-50/40 dark:bg-red-950/20' 
                    : isHigh 
                    ? 'border-orange-400/80 dark:border-orange-800 bg-orange-50/40 dark:bg-orange-950/20' 
                    : isWatch 
                    ? 'border-amber-300 dark:border-amber-900/60 bg-amber-50/20 dark:bg-amber-950/10' 
                    : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900'
                }`}
              >
                <div>
                  {/* Top: Station name & Risk badge */}
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                          {station.basin} Basin
                        </span>
                        <span className="text-xs text-slate-400">•</span>
                        <span className="text-xs text-slate-600 dark:text-slate-300 font-medium">
                          {station.district}
                        </span>
                      </div>
                      <h3 className="text-base font-bold text-slate-900 dark:text-white mt-0.5 leading-snug">
                        {station.name}
                      </h3>
                    </div>

                    {/* Threat level badge */}
                    <div className="shrink-0">
                      {isCritical && (
                        <Badge variant="critical" className="font-bold flex items-center gap-1 text-[11px]">
                          <ShieldAlert className="w-3 h-3" /> CRITICAL
                        </Badge>
                      )}
                      {isHigh && (
                        <Badge variant="danger" className="font-bold flex items-center gap-1 text-[11px]">
                          <AlertTriangle className="w-3 h-3" /> HIGH
                        </Badge>
                      )}
                      {isWatch && (
                        <Badge variant="warning" className="font-bold flex items-center gap-1 text-[11px]">
                          <AlertCircle className="w-3 h-3" /> WATCH
                        </Badge>
                      )}
                      {!isCritical && !isHigh && !isWatch && (
                        <Badge variant="success" className="font-semibold text-[11px]">
                          NORMAL
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Water level vs thresholds */}
                  <div className="mt-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 space-y-2">
                    <div className="flex items-baseline justify-between">
                      <div>
                        <span className="text-xs text-slate-500 dark:text-slate-400 block">Water Level</span>
                        <span className="text-2xl font-black text-slate-900 dark:text-white">
                          {station.waterLevel !== null ? `${station.waterLevel.toFixed(2)} m` : 'N/A'}
                        </span>
                      </div>
                      
                      {/* Trend indicator */}
                      <div className="text-right">
                        <span className="text-xs text-slate-500 dark:text-slate-400 block">Trend</span>
                        <span className={`inline-flex items-center gap-1 text-xs font-bold ${
                          station.trend === 'RISING' 
                            ? 'text-red-600 dark:text-red-400' 
                            : station.trend === 'FALLING' 
                            ? 'text-emerald-600 dark:text-emerald-400' 
                            : 'text-slate-600 dark:text-slate-300'
                        }`}>
                          {station.trend === 'RISING' && <TrendingUp className="w-3.5 h-3.5 text-red-500" />}
                          {station.trend === 'FALLING' && <TrendingDown className="w-3.5 h-3.5 text-emerald-500" />}
                          {station.trend === 'STEADY' && <Minus className="w-3.5 h-3.5 text-slate-400" />}
                          {station.trend}
                        </span>
                      </div>
                    </div>

                    {/* Progress Bar towards Warning / Danger */}
                    {dangerLevel > 0 && (
                      <div className="space-y-1 pt-1">
                        <div className="h-2 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden flex">
                          <div 
                            className={`h-full transition-all rounded-full ${
                              isCritical ? 'bg-red-500' : isHigh ? 'bg-orange-500' : isWatch ? 'bg-amber-400' : 'bg-blue-500'
                            }`}
                            style={{ width: `${percentFill}%` }}
                          />
                        </div>
                        <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 pt-0.5">
                          <span>Warning: <strong>{station.warningLevel} m</strong></span>
                          <span>Danger: <strong>{station.dangerLevel} m</strong></span>
                        </div>
                      </div>
                    )}

                    {/* Clearance or Breach indicator */}
                    <div className="pt-1 text-xs flex items-center justify-between">
                      <span className="text-slate-500 dark:text-slate-400">Buffer to Danger:</span>
                      {station.clearanceToDanger !== null && (
                        <span className={`font-semibold ${
                          station.clearanceToDanger < 0 
                            ? 'text-red-600 dark:text-red-400 font-bold' 
                            : station.clearanceToDanger <= 0.5 
                            ? 'text-orange-600 dark:text-orange-400 font-bold' 
                            : 'text-emerald-600 dark:text-emerald-400'
                        }`}>
                          {station.clearanceToDanger < 0 
                            ? `${Math.abs(station.clearanceToDanger).toFixed(2)} m ABOVE DANGER` 
                            : `${station.clearanceToDanger.toFixed(2)} m clearance`}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* DHM Official Status & Explanation */}
                  <div className="mt-3">
                    <div className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Official: <span className="font-normal text-slate-600 dark:text-slate-400">{station.dhmOfficialStatus}</span>
                    </div>
                    {station.riskExplanation && (
                      <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed line-clamp-2">
                        {station.riskExplanation}
                      </p>
                    )}
                  </div>
                </div>

                {/* Footer: Infrastructure tags and Detail action */}
                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                  <div className="text-[11px] text-slate-400 truncate">
                    {station.nearbyRoads?.[0] || `${station.district} corridor`}
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleOpenStationDetail(station)}
                    className="text-xs font-semibold shrink-0 gap-1 hover:border-blue-500 hover:text-blue-600"
                  >
                    <BrainCircuit className="w-3.5 h-3.5 text-blue-500" />
                    AI Flood Insights
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* 5. STATION DEEP-DIVE & AI SYNTHESIS MODAL */}
      {selectedStation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm overflow-y-auto animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-3xl shadow-2xl overflow-hidden my-8">
            {/* Modal Header */}
            <div className="p-6 bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <Badge variant="outline" className="text-xs">Station #{selectedStation.id}</Badge>
                  <span className="text-xs font-semibold text-blue-600 dark:text-blue-400">
                    {selectedStation.basin} Basin
                  </span>
                  <span className="text-xs text-slate-400">•</span>
                  <span className="text-xs text-slate-600 dark:text-slate-300">
                    {selectedStation.district} District
                  </span>
                  {selectedStation.elevation && (
                    <span className="text-xs text-slate-400">
                      • Elev: {selectedStation.elevation}m
                    </span>
                  )}
                </div>
                <h3 className="text-xl font-black text-slate-900 dark:text-white">
                  {selectedStation.name}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Official DHM Gauge • Coordinates: {selectedStation.latitude?.toFixed(4)}, {selectedStation.longitude?.toFixed(4)}
                </p>
              </div>

              <button
                onClick={() => setSelectedStation(null)}
                className="p-2 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
              
              {/* Telemetry row */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                  <span className="text-xs text-slate-500 block">Water Level</span>
                  <span className="text-xl font-black text-slate-900 dark:text-white">
                    {selectedStation.waterLevel !== null ? `${selectedStation.waterLevel.toFixed(2)} m` : 'N/A'}
                  </span>
                  <span className="text-[11px] text-slate-400 block mt-0.5">Current reading</span>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                  <span className="text-xs text-slate-500 block">Warning Threshold</span>
                  <span className="text-xl font-black text-orange-600 dark:text-orange-400">
                    {selectedStation.warningLevel !== null ? `${selectedStation.warningLevel} m` : 'N/A'}
                  </span>
                  <span className="text-[11px] text-slate-400 block mt-0.5">DHM Alert Level</span>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                  <span className="text-xs text-slate-500 block">Danger Threshold</span>
                  <span className="text-xl font-black text-red-600 dark:text-red-400">
                    {selectedStation.dangerLevel !== null ? `${selectedStation.dangerLevel} m` : 'N/A'}
                  </span>
                  <span className="text-[11px] text-slate-400 block mt-0.5">DHM Inundation Level</span>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                  <span className="text-xs text-slate-500 block">Trend & Rate</span>
                  <span className={`text-xl font-black ${
                    selectedStation.trend === 'RISING' ? 'text-red-600 dark:text-red-400' : 'text-slate-900 dark:text-white'
                  }`}>
                    {selectedStation.trend}
                  </span>
                  <span className="text-[11px] text-slate-400 block mt-0.5">
                    {selectedStation.rateOfChangePerHour ? `${selectedStation.rateOfChangePerHour > 0 ? '+' : ''}${selectedStation.rateOfChangePerHour} m/hr` : 'Stable'}
                  </span>
                </div>
              </div>

              {/* Historical Trend Chart */}
              {selectedStation.historicalLevels && selectedStation.historicalLevels.length > 0 && (
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                      Recent 6-Hour Water Level Telemetry (Meters)
                    </span>
                    <span className="text-xs text-slate-400">DHM Sensor Telemetry</span>
                  </div>

                  <div className="h-44 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={selectedStation.historicalLevels}>
                        <defs>
                          <linearGradient id="waterLevelGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4}/>
                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.15} />
                        <XAxis dataKey="time" tick={{ fontSize: 11 }} />
                        <YAxis 
                          domain={['auto', 'auto']} 
                          tick={{ fontSize: 11 }} 
                          tickFormatter={v => `${v}m`} 
                        />
                        <Tooltip 
                          formatter={(v: any) => [`${v} m`, 'Water Level']}
                          contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#fff', borderRadius: '8px', fontSize: '12px' }}
                        />
                        <Area 
                          type="monotone" 
                          dataKey="level" 
                          stroke="#2563eb" 
                          strokeWidth={2.5} 
                          fillOpacity={1} 
                          fill="url(#waterLevelGrad)" 
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}

              {/* AI Multi-Signal Synthesis Card */}
              <div className="p-5 rounded-2xl bg-gradient-to-br from-indigo-950/40 via-blue-950/30 to-slate-900 border border-indigo-500/30">
                <div className="flex items-center gap-2 mb-3">
                  <span className="p-1.5 rounded-lg bg-indigo-500/20 text-indigo-400 border border-indigo-400/30">
                    <BrainCircuit className="w-4 h-4" />
                  </span>
                  <h4 className="text-sm font-bold text-white uppercase tracking-wider">
                    AI Hydrological Multi-Signal Synthesis
                  </h4>
                  {aiLoading && (
                    <span className="text-xs text-indigo-300 animate-pulse ml-auto flex items-center gap-1">
                      <RefreshCw className="w-3 h-3 animate-spin" /> Synthesizing Catchment Signals...
                    </span>
                  )}
                </div>

                {aiLoading ? (
                  <div className="py-6 text-center space-y-2">
                    <p className="text-xs text-indigo-200">
                      Correlating DHM river water level, upstream catchment rainfall, soil moisture, and river gradient...
                    </p>
                  </div>
                ) : aiInsight ? (
                  <div className="space-y-4">
                    <p className="text-xs sm:text-sm text-slate-200 leading-relaxed bg-black/20 p-3 rounded-xl border border-indigo-500/20">
                      {aiInsight.aiExplanation}
                    </p>

                    {/* Evidence factors */}
                    <div>
                      <span className="text-xs font-bold text-indigo-300 uppercase tracking-wider block mb-2">
                        Contributing Hydrological & Terrain Factors
                      </span>
                      <ul className="space-y-1 text-xs text-slate-300">
                        {aiInsight.factors.map((f, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <span className="text-indigo-400 mt-0.5">•</span>
                            <span>{f}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Recommended Actions */}
                    <div>
                      <span className="text-xs font-bold text-emerald-300 uppercase tracking-wider block mb-2">
                        Recommended Operational Actions
                      </span>
                      <ul className="space-y-1.5 text-xs text-slate-200">
                        {aiInsight.recommendedActions.map((a, i) => (
                          <li key={i} className="flex items-start gap-2 bg-emerald-950/30 p-2 rounded-lg border border-emerald-500/20">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                            <span>{a}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ) : aiError ? (
                  <p className="text-xs text-amber-300">
                    Analytical fallback applied: {selectedStation.riskExplanation}
                  </p>
                ) : (
                  <p className="text-xs text-slate-300">
                    {selectedStation.riskExplanation}
                  </p>
                )}
              </div>

              {/* Associated Critical Infrastructure */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-3">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block">
                  Associated Corridor & Critical Infrastructure
                </span>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div>
                    <span className="text-slate-400 block mb-1 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-blue-500" /> Corridors / Highways
                    </span>
                    <ul className="space-y-1 font-medium text-slate-700 dark:text-slate-200">
                      {selectedStation.nearbyRoads?.map((r, i) => (
                        <li key={i}>• {r}</li>
                      )) || <li>• Feeder Road</li>}
                    </ul>
                  </div>

                  <div>
                    <span className="text-slate-400 block mb-1 flex items-center gap-1">
                      <Waves className="w-3.5 h-3.5 text-cyan-500" /> River Crossings & Bridges
                    </span>
                    <ul className="space-y-1 font-medium text-slate-700 dark:text-slate-200">
                      {selectedStation.nearbyBridges?.map((b, i) => (
                        <li key={i}>• {b}</li>
                      )) || <li>• Local Bridge Span</li>}
                    </ul>
                  </div>

                  <div>
                    <span className="text-slate-400 block mb-1 flex items-center gap-1">
                      <Building2 className="w-3.5 h-3.5 text-emerald-500" /> Nearby Emergency Facilities
                    </span>
                    <ul className="space-y-1 font-medium text-slate-700 dark:text-slate-200">
                      {selectedStation.nearbyFacilities?.map((f, i) => (
                        <li key={i}>• {f}</li>
                      )) || <li>• District Hospital</li>}
                    </ul>
                  </div>
                </div>
              </div>

            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <span className="text-xs text-slate-500">
                Official source: Department of Hydrology and Meteorology, Nepal
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedStation(null)}
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
