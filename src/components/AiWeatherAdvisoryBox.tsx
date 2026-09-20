import React, { useEffect, useState, useCallback } from 'react';
import { Sparkles, Umbrella, Zap, Home, Car, Droplets, Waves, AlertTriangle, RefreshCw, CheckCircle2, ShieldAlert } from 'lucide-react';
import { FusedWeather, Location } from '../types';
import { WeatherAdvisoryData, generateLocalWeatherAdvisory, fetchAiWeatherAdvisory, WeatherAdvisoryRecommendation } from '../lib/weatherAdvisory';
import { Badge } from './ui';
import { cn } from '../lib/utils';

interface AiWeatherAdvisoryBoxProps {
  fusedWeather: FusedWeather | null | undefined;
  location: Location | null | undefined;
}

function getRecommendationIcon(iconKey: WeatherAdvisoryRecommendation['icon']) {
  switch (iconKey) {
    case 'umbrella':
      return <Umbrella className="h-4 w-4 text-sky-500 shrink-0 mt-0.5" />;
    case 'lightning':
      return <Zap className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />;
    case 'stay_indoor':
      return <Home className="h-4 w-4 text-rose-500 shrink-0 mt-0.5" />;
    case 'riverbank':
      return <Waves className="h-4 w-4 text-blue-500 shrink-0 mt-0.5" />;
    case 'driving':
      return <Car className="h-4 w-4 text-indigo-500 shrink-0 mt-0.5" />;
    case 'hydration':
      return <Droplets className="h-4 w-4 text-teal-500 shrink-0 mt-0.5" />;
    case 'general':
    default:
      return <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />;
  }
}

export const AiWeatherAdvisoryBox: React.FC<AiWeatherAdvisoryBoxProps> = ({
  fusedWeather,
  location
}) => {
  const locationName = location?.name || 'Current Location';

  const [advisory, setAdvisory] = useState<WeatherAdvisoryData>(() =>
    generateLocalWeatherAdvisory(fusedWeather, locationName)
  );
  const [isLoading, setIsLoading] = useState(false);

  const loadAdvisory = useCallback(async (forceAi = false) => {
    // Generate instant local advisory first so there's zero UI latency
    const local = generateLocalWeatherAdvisory(fusedWeather, locationName);
    setAdvisory(local);

    if (forceAi || fusedWeather) {
      setIsLoading(true);
      try {
        const aiData = await fetchAiWeatherAdvisory(fusedWeather, locationName);
        setAdvisory(aiData);
      } catch (_err) {
        // Local synthesis remains intact
      } finally {
        setIsLoading(false);
      }
    }
  }, [fusedWeather, locationName]);

  // Update whenever weather or location changes
  useEffect(() => {
    loadAdvisory(false);
  }, [loadAdvisory]);

  const isCritical = advisory.severity === 'CRITICAL';
  const isAlert = advisory.severity === 'ALERT';
  const isCaution = advisory.severity === 'CAUTION';

  const containerTheme = isCritical
    ? 'bg-rose-50/90 dark:bg-rose-950/30 border-rose-200 dark:border-rose-900/60'
    : isAlert
    ? 'bg-amber-50/90 dark:bg-amber-950/30 border-amber-200 dark:border-amber-900/60'
    : isCaution
    ? 'bg-sky-50/90 dark:bg-sky-950/30 border-sky-200 dark:border-sky-900/60'
    : 'bg-slate-50/90 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800';

  const titleColor = isCritical
    ? 'text-rose-900 dark:text-rose-200'
    : isAlert
    ? 'text-amber-900 dark:text-amber-200'
    : isCaution
    ? 'text-sky-900 dark:text-sky-200'
    : 'text-slate-900 dark:text-slate-100';

  return (
    <div className={cn('p-4 border-t transition-colors', containerTheme)}>
      {/* Top bar: AI Title, Tag, and Refresh Button */}
      <div className="flex items-center justify-between gap-3 mb-2 flex-wrap">
        <div className="flex items-center gap-2">
          <div className={cn(
            'p-1.5 rounded-md flex items-center justify-center',
            isCritical
              ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
              : isAlert
              ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
              : 'bg-blue-500/10 text-blue-600 dark:text-blue-400'
          )}>
            {isCritical ? (
              <ShieldAlert className="h-4 w-4 animate-pulse" />
            ) : isAlert ? (
              <AlertTriangle className="h-4 w-4" />
            ) : (
              <Sparkles className="h-4 w-4" />
            )}
          </div>
          <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
            AI Weather Advisory
            <span className="text-slate-400 dark:text-slate-500">•</span>
            <span className="text-slate-500 dark:text-slate-400 font-medium normal-case">{locationName}</span>
          </span>
          <Badge
            variant="outline"
            className={cn(
              'text-[10px] px-1.5 py-0 font-medium uppercase',
              isCritical
                ? 'border-rose-300 text-rose-700 dark:text-rose-300 bg-rose-100/50 dark:bg-rose-900/30'
                : isAlert
                ? 'border-amber-300 text-amber-700 dark:text-amber-300 bg-amber-100/50 dark:bg-amber-900/30'
                : isCaution
                ? 'border-sky-300 text-sky-700 dark:text-sky-300 bg-sky-100/50 dark:bg-sky-900/30'
                : 'border-slate-300 text-slate-600 dark:text-slate-400'
            )}
          >
            {advisory.severity}
          </Badge>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[11px] text-slate-500 dark:text-slate-400 hidden sm:inline">
            Updated {advisory.timestamp}
          </span>
          <button
            onClick={() => loadAdvisory(true)}
            disabled={isLoading}
            className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-600 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-300 px-2 py-1 rounded hover:bg-black/5 dark:hover:bg-white/5 transition-colors disabled:opacity-50"
            title="Refresh AI Weather Advisory"
          >
            <RefreshCw className={cn('h-3 w-3', isLoading && 'animate-spin text-blue-500')} />
            <span>{isLoading ? 'Synthesizing...' : 'Refresh AI'}</span>
          </button>
        </div>
      </div>

      {/* Main Headline and Briefing */}
      <div className="mb-3">
        <h4 className={cn('text-sm font-bold', titleColor)}>
          {advisory.headline}
        </h4>
        <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
          {advisory.shortBriefing}
        </p>
      </div>

      {/* Actionable Recommendations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5 pt-1">
        {advisory.actionRecommendations.map((rec, idx) => (
          <div
            key={idx}
            className={cn(
              'p-2.5 rounded-lg border text-xs flex items-start gap-2.5 transition-all',
              'bg-white/90 dark:bg-slate-950/70 shadow-xs',
              isCritical
                ? 'border-rose-200/70 dark:border-rose-900/40'
                : isAlert
                ? 'border-amber-200/70 dark:border-amber-900/40'
                : 'border-slate-200/80 dark:border-slate-800/80'
            )}
          >
            {getRecommendationIcon(rec.icon)}
            <div className="space-y-0.5 min-w-0">
              <p className="font-semibold text-slate-900 dark:text-slate-100 text-[12px] leading-snug">
                {rec.title}
              </p>
              <p className="text-slate-600 dark:text-slate-400 text-[11px] leading-relaxed">
                {rec.detail}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
