import React, { useState, useMemo } from 'react';
import { Card, Badge, Button } from '@/components/ui';
import { 
  AlertTriangle, ShieldAlert, Waves, Flame, CloudRain, 
  Zap, Wind, Skull, ExternalLink, RefreshCw, MapPin, 
  Clock, ShieldCheck, Search, Filter, Activity, TrendingUp,
  TrendingDown, Minus, CheckCircle, ArrowUpRight, HelpCircle
} from 'lucide-react';
import { BipadAlert } from '@/types';
import { cn } from '@/lib/utils';

interface BipadAlertsViewProps {
  alerts: BipadAlert[];
  isLoading: boolean;
  error: string | null;
  lastSynced: number | null;
  onRefresh: (force?: boolean) => void;
  onFactCheck?: (claimText: string) => void;
}

function getHazardIcon(hazardName: string, className = "w-5 h-5") {
  const name = (hazardName || '').toLowerCase();
  if (name.includes('flood') || name.includes('बाढी')) return <Waves className={className} />;
  if (name.includes('fire') || name.includes('आगलागी')) return <Flame className={className} />;
  if (name.includes('rain') || name.includes('वर्षा')) return <CloudRain className={className} />;
  if (name.includes('thunder') || name.includes('चट्याङ्ग')) return <Zap className={className} />;
  if (name.includes('wind') || name.includes('हावाहुरी') || name.includes('storm')) return <Wind className={className} />;
  if (name.includes('snake') || name.includes('सर्पदंश')) return <Skull className={className} />;
  if (name.includes('landslide') || name.includes('पहिरो')) return <AlertTriangle className={className} />;
  return <AlertTriangle className={className} />;
}

export function BipadAlertsView({
  alerts,
  isLoading,
  error,
  lastSynced,
  onRefresh,
  onFactCheck
}: BipadAlertsViewProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [hazardFilter, setHazardFilter] = useState<string>('ALL');
  const [severityFilter, setSeverityFilter] = useState<'ALL' | 'CRITICAL' | 'WARNING' | 'ADVISORY'>('ALL');
  const [typeFilter, setTypeFilter] = useState<'ALL' | 'ALERT' | 'INCIDENT'>('ALL');

  // Compute hazard counts
  const hazardCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const a of alerts) {
      const h = a.hazardName || 'Other';
      counts[h] = (counts[h] || 0) + 1;
    }
    return counts;
  }, [alerts]);

  const uniqueHazards = useMemo(() => {
    return Object.keys(hazardCounts).sort((a, b) => hazardCounts[b] - hazardCounts[a]);
  }, [hazardCounts]);

  // Filtered alerts
  const filteredAlerts = useMemo(() => {
    return alerts.filter(a => {
      if (hazardFilter !== 'ALL' && a.hazardName !== hazardFilter) {
        return false;
      }
      if (severityFilter !== 'ALL' && a.severity !== severityFilter) {
        return false;
      }
      if (typeFilter !== 'ALL' && a.type !== typeFilter) {
        return false;
      }
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        const matchesTitle = (a.title || '').toLowerCase().includes(q);
        const matchesTitleNe = (a.titleNe || '').toLowerCase().includes(q);
        const matchesDistrict = (a.district || '').toLowerCase().includes(q);
        const matchesMuni = (a.municipality || '').toLowerCase().includes(q);
        const matchesBasin = (a.riverBasin || '').toLowerCase().includes(q);
        const matchesHazard = (a.hazardName || '').toLowerCase().includes(q);
        const matchesDesc = (a.description || '').toLowerCase().includes(q);
        if (!matchesTitle && !matchesTitleNe && !matchesDistrict && !matchesMuni && !matchesBasin && !matchesHazard && !matchesDesc) {
          return false;
        }
      }
      return true;
    });
  }, [alerts, hazardFilter, severityFilter, typeFilter, searchTerm]);

  const criticalCount = alerts.filter(a => a.severity === 'CRITICAL').length;
  const warningCount = alerts.filter(a => a.severity === 'WARNING').length;

  return (
    <div className="space-y-6">
      {/* Real-time Connection Banner */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-red-950 via-slate-900 to-indigo-950 text-white border border-red-900/40 shadow-md">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500" />
              </span>
              <span className="text-xs font-black uppercase tracking-wider text-red-400 font-mono">
                BIPAD Portal Live Disasters Feed
              </span>
              <span className="text-xs text-slate-500">•</span>
              <Badge variant="outline" className="text-[11px] font-semibold border-red-500/30 text-red-300 bg-red-950/40">
                MoHA & NDRRMA Verified
              </Badge>
              {criticalCount > 0 && (
                <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-red-600 text-white animate-pulse">
                  {criticalCount} Critical Emergencies
                </span>
              )}
            </div>

            <h3 className="text-lg sm:text-xl font-bold tracking-tight text-white flex items-center gap-2">
              National Disaster Risk Reduction & Management Authority
            </h3>
            
            <p className="text-xs sm:text-sm text-slate-300 max-w-3xl leading-relaxed">
              Real-time disaster incidents, early warning telemetry, river basin water levels, and hazard alerts synced directly from Government of Nepal&apos;s national disaster portal (<a href="https://bipadportal.gov.np" target="_blank" rel="noopener noreferrer" className="text-red-400 underline hover:text-red-300 font-semibold">bipadportal.gov.np</a>).
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 shrink-0">
            <div className="text-right text-xs text-slate-400 font-mono hidden sm:block">
              <div>{alerts.length} Real-Time Reports</div>
              <div>{lastSynced ? `Synced ${new Date(lastSynced).toLocaleTimeString()}` : 'Live Synchronized'}</div>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onRefresh(true)}
                disabled={isLoading}
                className="bg-white/10 hover:bg-white/20 border-white/20 text-white text-xs h-9 px-4 rounded-xl flex-1 sm:flex-none justify-center"
              >
                <RefreshCw className={cn("w-3.5 h-3.5 mr-2", isLoading && "animate-spin")} />
                {isLoading ? 'Syncing Portal...' : 'Sync Live BIPAD'}
              </Button>

              <a
                href="https://bipadportal.gov.np"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-semibold transition-colors shadow-sm"
              >
                <span>bipadportal.gov.np</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 text-red-700 dark:text-red-300 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>Notice: {error} (Displaying latest verified snapshot)</span>
          </div>
          <Button size="sm" variant="ghost" onClick={() => onRefresh(true)} className="text-xs text-red-700 dark:text-red-300">
            Retry Connection
          </Button>
        </div>
      )}

      {/* Filters & Search Toolbar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
        <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
          {/* Search bar */}
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search district, municipality, hazard, basin..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            )}
          </div>

          {/* Severity and Type Selectors */}
          <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
            <div className="inline-flex p-1 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs font-semibold shrink-0">
              <button
                type="button"
                onClick={() => setTypeFilter('ALL')}
                className={cn(
                  "px-3 py-1.5 rounded-lg transition-all",
                  typeFilter === 'ALL'
                    ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
                )}
              >
                All ({alerts.length})
              </button>
              <button
                type="button"
                onClick={() => setTypeFilter('ALERT')}
                className={cn(
                  "px-3 py-1.5 rounded-lg transition-all flex items-center gap-1",
                  typeFilter === 'ALERT'
                    ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
                )}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 inline-block" />
                Alerts ({alerts.filter(a => a.type === 'ALERT').length})
              </button>
              <button
                type="button"
                onClick={() => setTypeFilter('INCIDENT')}
                className={cn(
                  "px-3 py-1.5 rounded-lg transition-all flex items-center gap-1",
                  typeFilter === 'INCIDENT'
                    ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
                )}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 inline-block" />
                Incidents ({alerts.filter(a => a.type === 'INCIDENT').length})
              </button>
            </div>

            <div className="inline-flex p-1 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs font-semibold shrink-0">
              <button
                type="button"
                onClick={() => setSeverityFilter('ALL')}
                className={cn(
                  "px-2.5 py-1.5 rounded-lg transition-all",
                  severityFilter === 'ALL'
                    ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs"
                    : "text-slate-600 dark:text-slate-400"
                )}
              >
                All Severities
              </button>
              <button
                type="button"
                onClick={() => setSeverityFilter('CRITICAL')}
                className={cn(
                  "px-2.5 py-1.5 rounded-lg transition-all text-red-600 dark:text-red-400",
                  severityFilter === 'CRITICAL'
                    ? "bg-white dark:bg-slate-700 font-bold shadow-xs"
                    : "opacity-80"
                )}
              >
                Critical ({criticalCount})
              </button>
              <button
                type="button"
                onClick={() => setSeverityFilter('WARNING')}
                className={cn(
                  "px-2.5 py-1.5 rounded-lg transition-all text-amber-600 dark:text-amber-400",
                  severityFilter === 'WARNING'
                    ? "bg-white dark:bg-slate-700 font-bold shadow-xs"
                    : "opacity-80"
                )}
              >
                Warning ({warningCount})
              </button>
            </div>
          </div>
        </div>

        {/* Hazard Quick Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-1 scrollbar-none">
          <button
            type="button"
            onClick={() => setHazardFilter('ALL')}
            className={cn(
              "px-3 py-1 rounded-full text-xs font-semibold shrink-0 transition-colors cursor-pointer border",
              hazardFilter === 'ALL'
                ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 border-transparent shadow-xs"
                : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-200"
            )}
          >
            All Hazards ({alerts.length})
          </button>
          {uniqueHazards.map(hazard => {
            const count = hazardCounts[hazard];
            const isSelected = hazardFilter === hazard;
            return (
              <button
                key={hazard}
                type="button"
                onClick={() => setHazardFilter(hazard)}
                className={cn(
                  "px-3 py-1 rounded-full text-xs font-semibold shrink-0 transition-colors flex items-center gap-1.5 cursor-pointer border",
                  isSelected
                    ? "bg-red-600 text-white border-red-600 shadow-xs"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700"
                )}
              >
                {getHazardIcon(hazard, "w-3.5 h-3.5")}
                <span>{hazard}</span>
                <span className={cn("text-[10px] px-1.5 py-0.2 rounded-full", isSelected ? "bg-red-700 text-white" : "bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300")}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Alerts Count & Results Summary */}
      <div className="flex items-center justify-between text-xs text-slate-500 px-1">
        <span>Showing {filteredAlerts.length} of {alerts.length} BIPAD Portal live disaster records</span>
        {(hazardFilter !== 'ALL' || severityFilter !== 'ALL' || typeFilter !== 'ALL' || searchTerm) && (
          <button
            onClick={() => {
              setHazardFilter('ALL');
              setSeverityFilter('ALL');
              setTypeFilter('ALL');
              setSearchTerm('');
            }}
            className="text-red-600 dark:text-red-400 hover:underline font-semibold"
          >
            Reset Filters
          </button>
        )}
      </div>

      {/* Alerts Grid */}
      {filteredAlerts.length === 0 ? (
        <Card className="p-12 text-center text-slate-500 space-y-3">
          <AlertTriangle className="w-10 h-10 text-slate-400 mx-auto" />
          <div className="font-semibold text-base text-slate-700 dark:text-slate-300">
            No matching BIPAD alerts found
          </div>
          <p className="text-xs max-w-sm mx-auto">
            Try adjusting your search terms or hazard filter to view active Government of Nepal disaster reports.
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredAlerts.map(alert => {
            const isCritical = alert.severity === 'CRITICAL';
            const isWarning = alert.severity === 'WARNING';
            const isFlood = alert.hazardName?.toLowerCase().includes('flood') || alert.hazardName?.toLowerCase().includes('बाढी');
            const hasTelemetry = alert.waterLevel !== undefined;

            return (
              <Card
                key={alert.id}
                noPadding
                className={cn(
                  "overflow-hidden border transition-all flex flex-col justify-between hover:shadow-md",
                  isCritical 
                    ? "border-red-300 dark:border-red-900/60 bg-red-50/20 dark:bg-red-950/10" 
                    : isWarning 
                    ? "border-amber-200 dark:border-amber-900/40 bg-amber-50/10 dark:bg-amber-950/10"
                    : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900"
                )}
              >
                <div>
                  {/* Card Header Bar */}
                  <div className="px-5 py-3.5 border-b border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-3 bg-slate-50/60 dark:bg-slate-800/40">
                    <div className="flex items-center gap-2 min-w-0">
                      <div 
                        className="p-1.5 rounded-lg shrink-0 text-white"
                        style={{ backgroundColor: alert.hazardColor || (isCritical ? '#dc2626' : isWarning ? '#d97706' : '#2563eb') }}
                      >
                        {getHazardIcon(alert.hazardName, "w-4 h-4")}
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                          {alert.hazardNameNe ? `${alert.hazardNameNe} / ${alert.hazardName}` : alert.hazardName}
                        </div>
                        <div className="text-[10px] text-slate-500 uppercase tracking-wider font-mono">
                          {alert.type === 'ALERT' ? 'Early Warning Alert' : 'Disaster Field Incident'}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className={cn(
                        "text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md border",
                        isCritical 
                          ? "bg-red-100 text-red-700 border-red-300 dark:bg-red-950/80 dark:text-red-300 dark:border-red-800 animate-pulse" 
                          : isWarning
                          ? "bg-amber-100 text-amber-700 border-amber-300 dark:bg-amber-950/80 dark:text-amber-300 dark:border-amber-800"
                          : "bg-blue-100 text-blue-700 border-blue-300 dark:bg-blue-950/80 dark:text-blue-300 dark:border-blue-800"
                      )}>
                        {alert.severity}
                      </span>
                    </div>
                  </div>

                  {/* Content Area */}
                  <div className="p-5 space-y-3">
                    {/* Bilingual Title */}
                    <div>
                      {alert.titleNe && (
                        <h4 className="font-semibold text-sm text-slate-900 dark:text-white leading-snug">
                          {alert.titleNe}
                        </h4>
                      )}
                      <div className="text-xs font-medium text-slate-700 dark:text-slate-300 mt-0.5">
                        {alert.title}
                      </div>
                    </div>

                    {/* Location & Time metadata */}
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-slate-600 dark:text-slate-400">
                      <div className="flex items-center gap-1 font-medium text-slate-800 dark:text-slate-200">
                        <MapPin className="w-3.5 h-3.5 text-red-500 shrink-0" />
                        <span>
                          {[alert.ward ? `Ward ${alert.ward}` : null, alert.municipality, alert.district].filter(Boolean).join(', ') || alert.location || 'Nepal'}
                        </span>
                      </div>

                      {alert.formattedDate && (
                        <div className="flex items-center gap-1 font-mono text-[11px]">
                          <Clock className="w-3 h-3 text-slate-400 shrink-0" />
                          <span>{alert.formattedDate}</span>
                        </div>
                      )}
                    </div>

                    {/* Hydrological Telemetry Meter (if River Basin alert) */}
                    {hasTelemetry && (
                      <div className="p-3 rounded-xl bg-blue-50/80 dark:bg-blue-950/30 border border-blue-200/80 dark:border-blue-900/50 space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-blue-900 dark:text-blue-300 flex items-center gap-1.5">
                            <Waves className="w-3.5 h-3.5" />
                            {alert.riverBasin ? `${alert.riverBasin} Basin` : 'River Station'}
                            {alert.riverStation ? ` (${alert.riverStation})` : ''}
                          </span>
                          {alert.waterTrend && (
                            <span className={cn(
                              "text-[10px] font-bold px-1.5 py-0.5 rounded flex items-center gap-0.5",
                              alert.waterTrend === 'RISING' ? "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300" :
                              alert.waterTrend === 'FALLING' ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300" :
                              "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300"
                            )}>
                              {alert.waterTrend === 'RISING' && <TrendingUp className="w-3 h-3" />}
                              {alert.waterTrend === 'FALLING' && <TrendingDown className="w-3 h-3" />}
                              {alert.waterTrend === 'STEADY' && <Minus className="w-3 h-3" />}
                              {alert.waterTrend}
                            </span>
                          )}
                        </div>

                        <div className="grid grid-cols-3 gap-2 text-center text-[11px]">
                          <div className="p-1.5 bg-white dark:bg-slate-900 rounded-lg border border-blue-100 dark:border-blue-900">
                            <div className="text-slate-500 text-[10px]">Water Level</div>
                            <div className="font-bold text-blue-700 dark:text-blue-300">{alert.waterLevel} m</div>
                          </div>
                          <div className="p-1.5 bg-white dark:bg-slate-900 rounded-lg border border-amber-100 dark:border-amber-900">
                            <div className="text-slate-500 text-[10px]">Warning Level</div>
                            <div className="font-bold text-amber-700 dark:text-amber-300">{alert.warningLevel ?? '—'} m</div>
                          </div>
                          <div className="p-1.5 bg-white dark:bg-slate-900 rounded-lg border border-red-100 dark:border-red-900">
                            <div className="text-slate-500 text-[10px]">Danger Level</div>
                            <div className="font-bold text-red-700 dark:text-red-300">{alert.dangerLevel ?? '—'} m</div>
                          </div>
                        </div>

                        {alert.dangerLevel && alert.waterLevel !== undefined && (
                          <div>
                            <div className="w-full bg-blue-200 dark:bg-blue-900 rounded-full h-1.5 overflow-hidden">
                              <div 
                                className={cn(
                                  "h-full transition-all",
                                  alert.waterLevel >= alert.dangerLevel ? "bg-red-600" :
                                  alert.warningLevel && alert.waterLevel >= alert.warningLevel ? "bg-amber-500" :
                                  "bg-blue-600"
                                )}
                                style={{ width: `${Math.min(100, (alert.waterLevel / alert.dangerLevel) * 100)}%` }}
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Casualty / Damage Stats if incident */}
                    {alert.casualties && (alert.casualties.deathCount > 0 || alert.casualties.injuredCount > 0 || alert.casualties.missingCount > 0 || alert.casualties.affectedCount > 0 || alert.casualties.estimatedLoss) && (
                      <div className="flex flex-wrap gap-1.5">
                        {alert.casualties.deathCount > 0 && (
                          <span className="px-2 py-0.5 bg-red-100 text-red-800 dark:bg-red-950/80 dark:text-red-300 rounded text-[11px] font-bold border border-red-200 dark:border-red-800">
                            {alert.casualties.deathCount} Fatalities
                          </span>
                        )}
                        {alert.casualties.missingCount > 0 && (
                          <span className="px-2 py-0.5 bg-purple-100 text-purple-800 dark:bg-purple-950/80 dark:text-purple-300 rounded text-[11px] font-bold border border-purple-200 dark:border-purple-800">
                            {alert.casualties.missingCount} Missing
                          </span>
                        )}
                        {alert.casualties.injuredCount > 0 && (
                          <span className="px-2 py-0.5 bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300 rounded text-[11px] font-bold border border-amber-200 dark:border-amber-800">
                            {alert.casualties.injuredCount} Injured
                          </span>
                        )}
                        {alert.casualties.affectedCount > 0 && (
                          <span className="px-2 py-0.5 bg-blue-100 text-blue-800 dark:bg-blue-950/80 dark:text-blue-300 rounded text-[11px] font-bold border border-blue-200 dark:border-blue-800">
                            {alert.casualties.affectedCount} Families Affected
                          </span>
                        )}
                        {alert.casualties.estimatedLoss && alert.casualties.estimatedLoss > 0 && (
                          <span className="px-2 py-0.5 bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300 rounded text-[11px] font-semibold border border-slate-200 dark:border-slate-700">
                            NPR {alert.casualties.estimatedLoss.toLocaleString()} Loss
                          </span>
                        )}
                      </div>
                    )}

                    {/* Description text */}
                    {alert.description && (
                      <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed line-clamp-3">
                        {alert.description}
                      </p>
                    )}
                  </div>
                </div>

                {/* Card Action Footer */}
                <div className="px-5 py-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex items-center justify-between gap-2">
                  <span className="text-[11px] font-medium text-slate-500 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    NDRRMA MoHA
                  </span>

                  <div className="flex items-center gap-2">
                    {onFactCheck && (
                      <button
                        type="button"
                        onClick={() => onFactCheck(`${alert.hazardName} in ${alert.district || alert.location || 'Nepal'}: ${alert.title}`)}
                        className="text-[11px] font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 px-2 py-1 rounded hover:bg-indigo-50 dark:hover:bg-indigo-950/50 transition-colors flex items-center gap-1 cursor-pointer"
                        title="Cross-reference with Fact-Checker"
                      >
                        <HelpCircle className="w-3 h-3" />
                        Fact-Check
                      </button>
                    )}

                    <a
                      href={alert.sourceUrl || "https://bipadportal.gov.np"}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs font-semibold text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 px-2.5 py-1 rounded-md hover:bg-red-50 dark:hover:bg-red-950/50 transition-colors"
                    >
                      <span>BIPAD Portal</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
