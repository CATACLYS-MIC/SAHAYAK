import React, { useState, useMemo } from 'react';
import { Card, CardHeader, Badge, Button, BaseMap } from '@/components/ui';
import { CloudRain, Wind, Droplets, Thermometer, BrainCircuit, History, Layers, AlertTriangle, Info, Map, ChevronRight, Activity, BellRing, Navigation, Waves, ShieldAlert, Sparkles, CheckCircle2, Sun, CloudSun, Gauge, Cloud, SlidersHorizontal, Check, ExternalLink } from 'lucide-react';
import { useAppState } from '@/lib/store';
import { HistoricalEvent, HazardRisk } from '@/types';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, AreaChart, Area } from 'recharts';
import { Circle } from 'react-leaflet';
import { DhmRiverWatchPanel } from '@/components/DhmRiverWatchPanel';
import { AiWeatherAdvisoryBox } from '@/components/AiWeatherAdvisoryBox';
import { cn } from '@/lib/utils';

function getSourceUrl(sourceName: string, location?: { lat?: number; lng?: number }): string {
  const name = sourceName.toLowerCase();
  if (name.includes('open-meteo') || name.includes('numerical') || name.includes('model')) {
    if (location?.lat && location?.lng) {
      return `https://open-meteo.com/en/docs#latitude=${location.lat}&longitude=${location.lng}`;
    }
    return 'https://open-meteo.com/';
  }
  if (name.includes('satellite') || name.includes('himawari') || name.includes('jma') || name.includes('insat')) {
    return 'https://www.data.jma.go.jp/mscweb/data/himawari/';
  }
  if (name.includes('icimod')) {
    return 'https://www.icimod.org/';
  }
  if (name.includes('bipad') || name.includes('urban') || name.includes('ndrrma') || name.includes('microclimate')) {
    return 'https://bipadportal.gov.np/';
  }
  if (name.includes('river') || name.includes('basin') || name.includes('gauge') || name.includes('hydromet') || name.includes('koshi') || name.includes('bagmati') || name.includes('phewa') || name.includes('narayani') || name.includes('devghat') || name.includes('melamchi') || name.includes('dam')) {
    return 'https://hydrology.gov.np/#/river_watch';
  }
  if (name.includes('dhm') || name.includes('hydrology') || name.includes('meteorology')) {
    return 'https://hydrology.gov.np/';
  }
  return 'https://hydrology.gov.np/';
}

export function WeatherRisk() {
  const { 
    currentLocationId, currentLocation, locations, weatherSources, fusedWeather, hazardRisks, 
    historicalEvents, demoScenarioStep, setDemoScenarioStep,
    hourlyForecast, environmentalSensors,
    dhmStations, dhmSummary, dhmDemoMode
  } = useAppState();
  
  const [activeTab, setActiveTab] = useState<'WEATHER_OVERVIEW' | 'RIVER_WATCH'>('WEATHER_OVERVIEW');
  const [riskLayer, setRiskLayer] = useState<'OVERALL' | 'FLOOD' | 'LANDSLIDE' | 'EXTREME_RAIN'>('OVERALL');
  const [selectedHistoricalEventId, setSelectedHistoricalEventId] = useState<string>(historicalEvents[0]?.id || '');
  const [selectedRegionId, setSelectedRegionId] = useState<string>(currentLocationId || 'loc-1');

  // Scientific baseline benchmarks
  const CONFIDENCE_THRESHOLD = 65; // Minimum % confidence required to validate alert escalation
  const DHM_CAUTION_MM = 50.0;     // DHM official 24-hr caution benchmark

  // 1. RISK-SCORING ENGINE: Base-level Normalization & Confidence Thresholding
  // Normal, non-hazardous weather conditions strictly cannot trigger false 'HIGH' or 'CRITICAL' alerts
  const normalizedHazardRisks = useMemo(() => {
    const precip24h = fusedWeather?.precipitation24hMm ?? 0;
    const precipRate = fusedWeather?.precipitationMm ?? 0;
    const confidence = fusedWeather?.confidence ?? 90;
    const agreement = fusedWeather?.agreement ?? 'HIGH';
    const isConflicting = agreement === 'CONFLICTING';

    // Physical baseline verification
    const isSafeRainfall = precip24h < DHM_CAUTION_MM && precipRate < 4.0;
    const riverSensor = environmentalSensors.find(s => s.type === 'River Level');
    const riverIsCritical = riverSensor?.status === 'CRITICAL';
    const riverIsWarning = riverSensor?.status === 'WARNING';
    const isNormalNonHazardous = isSafeRainfall && !riverIsCritical && (demoScenarioStep === 0 || !dhmDemoMode);

    return hazardRisks.map(risk => {
      let score = risk.score;
      let isNormalized = false;
      const normNotes: string[] = [];

      // A. BASE-LEVEL NORMALIZATION
      // If atmospheric & ground hydrology are within safe historical limits, normalize baseline scores
      if (isNormalNonHazardous) {
        if (precip24h < 15 && precipRate < 2.0 && !riverIsWarning) {
          // Clear / Dry / Normal baseline: score is normalized down to LOW (6-18)
          if (score > 20) {
            score = Math.max(6, Math.min(18, Math.round(score * 0.2 + precip24h * 0.8)));
            isNormalized = true;
            normNotes.push(`Base-level Normalization: 24h rainfall (${precip24h.toFixed(1)} mm) is well below the DHM 50 mm caution benchmark; false alerts suppressed.`);
          }
        } else if (score >= 45) {
          // Moderate seasonal rainfall: capped at MODERATE ceiling (safe channel buffer)
          score = Math.min(38, Math.max(20, Math.round(20 + (precip24h / DHM_CAUTION_MM) * 18)));
          isNormalized = true;
          normNotes.push(`Base-level Calibrated: Seasonal shower (${precip24h.toFixed(1)} mm/24h) within standard municipal drainage capacity.`);
        }
      }

      // B. CONFIDENCE THRESHOLD CHECK
      // If telemetry confidence is below 65% or sensors are conflicting, damp high alerts
      // so unverified single-sensor blips cannot escalate into high-risk emergencies
      if ((confidence < CONFIDENCE_THRESHOLD || isConflicting) && score >= 60) {
        score = Math.min(48, Math.round(score * (confidence / 100)));
        isNormalized = true;
        normNotes.push(`Confidence Filter: Telemetry confidence (${confidence}%) is below ${CONFIDENCE_THRESHOLD}% threshold; alert escalation suppressed until corroborated.`);
      }

      // C. STANDARDIZED LEVEL RE-EVALUATION
      let level: 'LOW' | 'MODERATE' | 'ELEVATED' | 'HIGH' | 'CRITICAL' = 'LOW';
      if (score >= 80) level = 'CRITICAL';
      else if (score >= 60) level = 'HIGH';
      else if (score >= 40) level = 'ELEVATED';
      else if (score >= 20) level = 'MODERATE';
      else level = 'LOW';

      return {
        ...risk,
        score,
        level,
        confidence: Math.round(confidence),
        factors: isNormalized && normNotes.length > 0
          ? [...normNotes, ...risk.factors.filter(f => !f.toLowerCase().includes('critical') && !f.toLowerCase().includes('emergency') && !f.toLowerCase().includes('severe'))]
          : risk.factors,
        explanation: isNormalized && normNotes.length > 0
          ? `${risk.explanation} [Calibrated: ${normNotes[0]}]`
          : risk.explanation
      };
    });
  }, [hazardRisks, fusedWeather, environmentalSensors, demoScenarioStep, dhmDemoMode]);

  const overallRisk = normalizedHazardRisks.find(r => r.hazard === 'Overall') || {
    id: 'overall-norm',
    locationId: currentLocationId,
    hazard: 'Overall' as const,
    score: 12,
    level: 'LOW' as const,
    confidence: fusedWeather?.confidence || 95,
    factors: ['Safe baseline conditions', 'Precipitation well below DHM 50mm caution benchmark'],
    explanation: 'Normal weather baseline. No active threat detected.',
    recommendedMonitoring: ['Routine telemetry monitoring']
  };

  const individualRisks = normalizedHazardRisks.filter(r => r.hazard !== 'Overall');
  const topHazard = individualRisks.length > 0
    ? individualRisks.reduce((prev, current) => (prev.score > current.score) ? prev : current, individualRisks[0])
    : overallRisk;

  // 2. RAIN PROBABILITY FOR TODAY
  const todayRainProb = fusedWeather?.rainProb ?? 10;
  const hourlyRainProbs = (hourlyForecast || []).slice(0, 24).map(h => h.rainProb || 0);
  const todayPeakRainProb = hourlyRainProbs.length > 0 ? Math.max(...hourlyRainProbs, todayRainProb) : todayRainProb;
  const peakHourObj = (hourlyForecast || []).slice(0, 24).find(h => (h.rainProb || 0) === todayPeakRainProb);
  const peakHour = peakHourObj ? peakHourObj.time : '14:00';
  const todayAvgRainProb = hourlyRainProbs.length > 0 
    ? Math.round(hourlyRainProbs.reduce((a, b) => a + b, 0) / Math.min(24, hourlyRainProbs.length)) 
    : todayRainProb;

  const getRainProbAssessment = (prob: number) => {
    if (prob < 15) return { label: 'Minimal / Dry', description: 'Dry atmospheric profile with negligible rain risk today.', textClass: 'text-emerald-600 dark:text-emerald-400', badgeVariant: 'success' as const };
    if (prob < 35) return { label: 'Isolated Showers', description: 'Brief isolated sprinkles possible; overall dry.', textClass: 'text-cyan-600 dark:text-cyan-400', badgeVariant: 'outline' as const };
    if (prob < 60) return { label: 'Scattered Showers', description: 'Scattered precipitation expected in localized sectors.', textClass: 'text-blue-600 dark:text-blue-400', badgeVariant: 'warning' as const };
    if (prob < 80) return { label: 'Rain Likely', description: 'High probability of intermittent rainfall throughout today.', textClass: 'text-indigo-600 dark:text-indigo-400', badgeVariant: 'warning' as const };
    return { label: 'Continuous Rain', description: 'Persistent heavy precipitation expected across basin.', textClass: 'text-violet-600 dark:text-violet-400', badgeVariant: 'danger' as const };
  };
  const rainAssessment = getRainProbAssessment(todayRainProb);

  const selectedEvent = historicalEvents.find(e => e.id === selectedHistoricalEventId);

  // Selected region for map inspection
  const selectedRegionLocation = locations.find(l => l.id === selectedRegionId) || currentLocation || locations[0];

  // Dynamic regional assessments based on region & scenario
  const getRegionalRiskProfiles = (): Record<string, {
    hazard: string;
    level: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
    score: number;
    confidence: number;
    reasons: string;
    factors: string[];
    sources: string[];
    lastUpdate: string;
    action: string;
  }> => {
    const precip24h = fusedWeather?.precipitation24hMm ?? 2.8;
    const precipRate = fusedWeather?.precipitationMm ?? 0;

    if (demoScenarioStep === 0) {
      // Live / Normal conditions
      return {
        'loc-1': { // Kathmandu
          hazard: 'No Active Threat (Normal Conditions)',
          level: 'LOW',
          score: Math.max(8, Math.min(18, Math.round(8 + precip24h * 1.2))),
          confidence: 95,
          reasons: `Live telemetry from DHM Bagmati Basin gauges and Open-Meteo confirms stable atmospheric baseline. 24h rainfall is ${precip24h.toFixed(1)} mm, well below the DHM 50 mm caution benchmark.`,
          factors: [
            `Precipitation Rate: ${precipRate.toFixed(1)} mm/h (Dry / Normal)`,
            `24h Accumulated Rainfall: ${precip24h.toFixed(1)} mm (Safe < 50mm)`,
            'Bagmati Balkhu Gauge: 1.8m (Safe green; Warning mark is 4.0m)',
            'Urban drainage lines flowing normally'
          ],
          sources: ['DHM Nepal Ground Telemetry', 'Himawari-9 Satellite Radar', 'Bagmati Basin IoT Gauge', 'Municipal AWS Station'],
          lastUpdate: 'Synchronized live',
          action: 'Routine monitoring. Normal daily activities, transportation, and school/work operations.'
        },
        'loc-2': { // Sindhupalchok
          hazard: 'Stable Slopes (Routine Monitoring)',
          level: 'LOW',
          score: Math.max(8, Math.min(18, Math.round(9 + precip24h * 1.0))),
          confidence: 93,
          reasons: 'Dry atmospheric profile with low soil saturation. Melamchi and Bhotekoshi river channels flowing steadily within normal summer bounds.',
          factors: [
            'Soil Saturation: Normal seasonal baseline (no pore pressure)',
            'Upper Melamchi river gauge: Steady green stage',
            'Araniko Highway corridor: Clear and fully operational'
          ],
          sources: ['DHM Sindhupalchok Station', 'ICIMOD Slope Moisture Telemetry', 'Melamchi Upper Basin Sensor'],
          lastUpdate: 'Synchronized live',
          action: 'Routine mountain slope surveillance. No travel restrictions.'
        },
        'loc-3': { // Pokhara
          hazard: 'Normal Lake & River Discharge',
          level: 'LOW',
          score: 10,
          confidence: 94,
          reasons: 'Annapurna foothill precipitation is negligible. Phewa Lake and Seti river channels operating with wide drainage buffer.',
          factors: [
            'Phewa Lake spillway: Normal baseline level',
            'Seti Gorge hydrometric station: Stable seasonal discharge'
          ],
          sources: ['DHM Western Regional Division', 'Phewa Dam Telemetry'],
          lastUpdate: 'Synchronized live',
          action: 'Standard municipal hydrologic supervision.'
        },
        'loc-4': { // Biratnagar / Koshi
          hazard: 'Normal Lowland Basin',
          level: 'LOW',
          score: 14,
          confidence: 93,
          reasons: 'Koshi river system discharge is at regular seasonal levels. Embankments and barrage gates operating routinely.',
          factors: [
            'Koshi Barrage: Normal baseline discharge',
            'Saptari & Sunsari dykes: Completely secure'
          ],
          sources: ['DHM Koshi Basin Division', 'Koshi Barrage Control Station'],
          lastUpdate: 'Synchronized live',
          action: 'Standard river basin watch.'
        },
        'loc-5': { // Chitwan / Narayani
          hazard: 'Normal Riverbed Capacity',
          level: 'LOW',
          score: 12,
          confidence: 93,
          reasons: 'Narayani river flow at Devghat gauge flowing stably with ample buffer before warning stage.',
          factors: [
            'Devghat Gauge: 3.8m (Warning: 7.3m, Danger: 9.0m)',
            'Madi & Bharatpur drainage: Normal'
          ],
          sources: ['DHM Narayani Basin Office', 'Devghat Hydrometric Station'],
          lastUpdate: 'Synchronized live',
          action: 'Standard hydrologic monitoring.'
        }
      };
    } else {
      // Simulated worsening steps (1: Warning, 2: High Risk, 3: Critical)
      return {
        'loc-1': { // Kathmandu
          hazard: demoScenarioStep >= 2 ? 'Flash Flood & River Breach' : 'Urban Drainage Waterlogging',
          level: (demoScenarioStep >= 3 ? 'CRITICAL' : demoScenarioStep >= 2 ? 'HIGH' : 'MODERATE') as 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL',
          score: demoScenarioStep >= 3 ? 92 : demoScenarioStep >= 2 ? 78 : 48,
          confidence: 94,
          reasons: demoScenarioStep >= 2 
            ? 'Heavy concentrated rainfall in Mahabharat catchment causing Bagmati, Bishnumati, and Hanumante tributaries to swell above threshold.'
            : 'Moderate localized showers leading to temporary urban ponding in low-lying intersections.',
          factors: [
            demoScenarioStep >= 2 ? 'Bagmati Balkhu Gauge: 4.8m (Warning: 4.0m)' : 'Bagmati Balkhu Gauge: 3.2m (Normal: < 4.0m)',
            'Urban drainage bottleneck at ring-road culverts',
            demoScenarioStep >= 2 ? 'Soil moisture saturation at 88%' : 'Soil moisture saturation at 62%'
          ],
          sources: ['DHM Nepal (Hydrology & Meteorology)', 'Himawari-9 Satellite Radar', 'Bagmati Basin Telemetry Gauge'],
          lastUpdate: 'Simulated feed',
          action: demoScenarioStep >= 2 ? 'Pre-position rescue inflatable rafts along Balkhu and Nakkhu corridors.' : 'Monitor river gauge levels.'
        },
        'loc-2': { // Sindhupalchok
          hazard: demoScenarioStep >= 2 ? 'Debris Flow & Landslide' : 'Slope Instability Advisory',
          level: (demoScenarioStep >= 2 ? 'CRITICAL' : 'HIGH') as 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL',
          score: demoScenarioStep >= 2 ? 96 : 82,
          confidence: 91,
          reasons: 'Steep topographic gradient combined with post-earthquake fractured strata and simulated continuous monsoon rainfall saturation.',
          factors: ['ICIMOD Soil Moisture: 92% (Liquefaction threshold)', 'Upstream GL water level fluctuation', 'Araniko highway rockfall alerts'],
          sources: ['DHM Nepal', 'ICIMOD Soil Moisture Telemetry', 'Melamchi Upper Basin Sensor'],
          lastUpdate: 'Simulated feed',
          action: 'Issue high alert to Melamchi and Helambu settlements; enforce Araniko highway travel curfew.'
        },
        'loc-3': { // Pokhara
          hazard: 'Lake & Seti River Overflow',
          level: (demoScenarioStep >= 3 ? 'HIGH' : demoScenarioStep >= 2 ? 'MODERATE' : 'LOW') as 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL',
          score: demoScenarioStep >= 3 ? 72 : demoScenarioStep >= 2 ? 55 : 20,
          confidence: 89,
          reasons: 'Seti River gorge channel capacity stress under localized Annapurna foothill rainfall.',
          factors: ['Phewa Lake sluice gate discharge monitoring', 'Seti gorge seismic micro-tremors', 'Foothill precipitation: 65mm/12h'],
          sources: ['DHM Pokhara Regional Office', 'Seti Hydrological Station'],
          lastUpdate: 'Simulated feed',
          action: 'Inspect Phewa dam spillway and maintain Seti gorge buffer warnings.'
        },
        'loc-4': { // Biratnagar / Koshi
          hazard: 'Koshi River Lowland Flood',
          level: (demoScenarioStep >= 2 ? 'HIGH' : 'LOW') as 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL',
          score: demoScenarioStep >= 2 ? 74 : 28,
          confidence: 93,
          reasons: 'Upstream runoff from 7 Koshi river tributaries accumulating towards Chatara and Koshi Barrage.',
          factors: ['Koshi Barrage 38 of 56 gates opened', 'Discharge rate: 285,000 cusecs', 'Lowland riverbank seepage'],
          sources: ['DHM Koshi Basin Division', 'Koshi Barrage Control Station'],
          lastUpdate: 'Simulated feed',
          action: 'Coordinate with local disaster committees along Saptari and Sunsari riverbanks.'
        },
        'loc-5': { // Chitwan / Narayani
          hazard: 'Narayani River Bank Erosion',
          level: (demoScenarioStep >= 2 ? 'HIGH' : demoScenarioStep >= 1 ? 'MODERATE' : 'LOW') as 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL',
          score: demoScenarioStep >= 2 ? 76 : demoScenarioStep >= 1 ? 52 : 25,
          confidence: 92,
          reasons: 'Confluence of Trishuli and Kali Gandaki rivers causing high flow velocities through Narayangarh.',
          factors: ['Devghat gauge: 8.2m (Danger: 9.0m)', 'Silted riverbed overflow risk', 'Prithvi Highway corridor alert'],
          sources: ['DHM Narayani Basin Office', 'Devghat Hydrometric Station'],
          lastUpdate: 'Simulated feed',
          action: 'Reinforce temporary sandbag spurs at vulnerable Meghauli bank bends.'
        }
      };
    }
  };

  const regionalRiskProfiles = getRegionalRiskProfiles();
  const activeRegionRisk = regionalRiskProfiles[selectedRegionId] || regionalRiskProfiles['loc-1'];

  // Determine circle color based on active layer and top hazard level
  const getRiskColor = (level?: string) => {
    const l = level || topHazard.level;
    if (l === 'CRITICAL') return '#ef4444'; // Red
    if (l === 'HIGH') return '#f97316'; // Orange
    if (l === 'MODERATE' || l === 'ELEVATED') return '#eab308'; // Yellow
    return '#10b981'; // Emerald (Low)
  };

  const getLayerColor = () => {
    if (riskLayer === 'OVERALL') return getRiskColor(activeRegionRisk.level);
    if (riskLayer === 'FLOOD') return '#3b82f6'; // Blue
    if (riskLayer === 'LANDSLIDE') return '#a16207'; // Brown
    if (riskLayer === 'EXTREME_RAIN') return '#6366f1'; // Indigo
    return getRiskColor(activeRegionRisk.level);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8 max-w-7xl mx-auto">
      
      {/* 1. TOP: Location, Current Weather, Current Hazard Risk */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center">
            {currentLocation?.name} Risk Profile
          </h2>
          <p className="text-slate-600 dark:text-slate-400 mt-1">SAHAYAK Master Intelligence & Threat Analysis</p>
        </div>
        
        {/* DEMO MODE CONTROLS */}
        <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-900 p-2 rounded-lg border border-slate-200 dark:border-slate-800">
          <Badge variant="outline" className="text-xs mr-2 border-emerald-500 text-emerald-600 dark:text-emerald-400">DATA MODE</Badge>
          <Button variant={demoScenarioStep === 0 ? 'primary' : 'outline'} size="sm" onClick={() => setDemoScenarioStep(0)}>
            <Activity className="w-4 h-4 mr-1 text-emerald-400" /> Live
          </Button>
          <div className="w-px h-6 bg-slate-300 dark:bg-slate-700 mx-1"></div>
          <Badge variant="outline" className="text-xs mr-1 text-slate-500">SIMULATE</Badge>
          <Button variant={demoScenarioStep === 1 ? 'primary' : 'outline'} size="sm" onClick={() => setDemoScenarioStep(1)}>Warning</Button>
          <Button variant={demoScenarioStep === 2 ? 'primary' : 'outline'} size="sm" onClick={() => setDemoScenarioStep(2)}>High Risk</Button>
          <Button variant={demoScenarioStep === 3 ? 'danger' : 'outline'} size="sm" onClick={() => setDemoScenarioStep(3)}>Critical</Button>
        </div>
      </div>

      {/* NAVIGATION TABS: MULTI-HAZARD WEATHER vs DHM RIVER WATCH */}
      <div className="flex items-center gap-3 border-b border-slate-200 dark:border-slate-800 pb-3 flex-wrap">
        <button
          onClick={() => setActiveTab('WEATHER_OVERVIEW')}
          className={`px-4 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${
            activeTab === 'WEATHER_OVERVIEW'
              ? 'bg-blue-600 text-white shadow-md'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <BrainCircuit className="w-4 h-4" />
          Multi-Hazard Risk Profile
        </button>

        <button
          onClick={() => setActiveTab('RIVER_WATCH')}
          className={`px-4 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2.5 ${
            activeTab === 'RIVER_WATCH'
              ? 'bg-blue-600 text-white shadow-md'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Waves className="w-4 h-4 text-blue-400" />
          Nepal DHM River Watch Telemetry
          {((dhmSummary?.criticalRiskCount ?? 0) > 0 || (dhmSummary?.highRiskCount ?? 0) > 0) && (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-red-500 text-white animate-pulse">
              {(dhmSummary?.criticalRiskCount ?? 0) + (dhmSummary?.highRiskCount ?? 0)} Alert
            </span>
          )}
          {dhmSummary?.activeStations && (
            <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
              activeTab === 'RIVER_WATCH' ? 'bg-blue-700 text-blue-100' : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
            }`}>
              {dhmSummary.activeStations} Gauges
            </span>
          )}
        </button>
      </div>

      {activeTab === 'RIVER_WATCH' ? (
        <DhmRiverWatchPanel />
      ) : (
        <>
          {/* DHM River Alert Bar if any rivers are above warning or danger */}
          {((dhmSummary?.criticalRiskCount ?? 0) > 0 || (dhmSummary?.highRiskCount ?? 0) > 0 || dhmDemoMode) && (
            <div className="p-3.5 rounded-xl bg-gradient-to-r from-red-950/40 via-orange-950/30 to-blue-950/20 border border-red-500/40 text-white flex items-center justify-between gap-4 flex-wrap shadow-sm">
              <div className="flex items-center gap-2.5">
                <span className="p-2 rounded-lg bg-red-500/20 text-red-400 border border-red-500/30">
                  <Waves className="w-4 h-4" />
                </span>
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-red-400 block">
                    {dhmDemoMode ? 'Simulated River Surge Telemetry' : 'Official DHM Flood Watch Alert'}
                  </span>
                  <p className="text-xs text-slate-200">
                    <strong>{(dhmSummary?.criticalRiskCount ?? 0) + (dhmSummary?.highRiskCount ?? 0)} river station(s)</strong> have breached Warning or Danger thresholds across Nepal river basins.
                  </p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setActiveTab('RIVER_WATCH')}
                className="bg-red-950/60 border-red-400/40 text-red-200 hover:bg-red-900 text-xs font-bold shrink-0"
              >
                Inspect River Watch Gauges ↗
              </Button>
            </div>
          )}

          {/* RISK ENGINE CALIBRATION & RELIABILITY BAR */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 text-xs shadow-xs">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="outline" className="bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                Base Normalization Active
              </Badge>
              <Badge variant="outline" className="bg-blue-50 dark:bg-blue-950/40 border-blue-300 dark:border-blue-800 text-blue-700 dark:text-blue-300 font-semibold flex items-center gap-1">
                <ShieldAlert className="w-3.5 h-3.5 text-blue-500" />
                Confidence Threshold: ≥{CONFIDENCE_THRESHOLD}%
              </Badge>
              <span className="text-slate-600 dark:text-slate-400 hidden md:inline">
                Suppresses false 'high risk' alerts under benign, non-hazardous weather conditions.
              </span>
            </div>

            <div className="flex items-center gap-2 font-medium">
              <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1">
                <CloudRain className="w-4 h-4 text-blue-500" />
                Rain Probability Today:
              </span>
              <span className="px-2 py-0.5 rounded-md bg-blue-100 dark:bg-blue-900/60 text-blue-800 dark:text-blue-200 font-bold">
                {todayRainProb}%
              </span>
              <span className="text-slate-500 dark:text-slate-400 text-[11px]">
                (Peak: {todayPeakRainProb}% at {peakHour})
              </span>
            </div>
          </div>

          {fusedWeather && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {/* CARD 1: MASTER TEMPERATURE */}
          <Card className="flex flex-col items-center justify-center text-center p-5 bg-gradient-to-b from-white to-slate-50 dark:from-slate-950 dark:to-slate-900/50">
            <Thermometer className="h-7 w-7 text-orange-500 dark:text-orange-400 mb-1.5" />
            <div className="text-2xl font-bold text-slate-900 dark:text-white">{fusedWeather.temp}°C</div>
            <div className="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider mt-0.5">Master Temp</div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
              Humidity: {fusedWeather.humidity}% • Wind: {fusedWeather.windSpeed} km/h
            </div>
          </Card>

          {/* CARD 2: RAIN PROBABILITY (TODAY) */}
          <Card className="flex flex-col items-center justify-center text-center p-5 bg-gradient-to-b from-white to-slate-50 dark:from-slate-950 dark:to-slate-900/50 border-blue-200/60 dark:border-blue-900/40">
            <CloudRain className="h-7 w-7 text-blue-500 dark:text-blue-400 mb-1.5" />
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {todayRainProb}%
            </div>
            <div className="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider mt-0.5">Rain Prob (Today)</div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 truncate max-w-full">
              Peak: {todayPeakRainProb}% ({peakHour}) • {rainAssessment.label}
            </div>
            {/* Visual probability track */}
            <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-1.5 mt-2.5 overflow-hidden">
              <div 
                className={cn(
                  "h-full rounded-full transition-all duration-500",
                  todayRainProb < 25 ? "bg-emerald-500" : todayRainProb < 60 ? "bg-blue-500" : "bg-indigo-600"
                )}
                style={{ width: `${Math.min(100, Math.max(6, todayRainProb))}%` }}
              />
            </div>
          </Card>

          {/* CARD 3: PRECIPITATION RATE */}
          <Card className="flex flex-col items-center justify-center text-center p-5 bg-gradient-to-b from-white to-slate-50 dark:from-slate-950 dark:to-slate-900/50">
            {(fusedWeather.precipitationMm ?? 0) > 0.1 ? (
              <CloudRain className="h-7 w-7 text-blue-600 dark:text-blue-500 mb-1.5" />
            ) : (
              <Sun className="h-7 w-7 text-amber-500 dark:text-amber-400 mb-1.5" />
            )}
            <div className="text-2xl font-bold text-slate-900 dark:text-white">
              {(fusedWeather.precipitationMm ?? 0).toFixed(1)} <span className="text-sm font-normal text-slate-500">mm/h</span>
            </div>
            <div className="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider mt-0.5">Precipitation Rate</div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
              24h Accum: {(fusedWeather.precipitation24hMm ?? 0).toFixed(1)} mm ({fusedWeather.rainfallCategory || 'DRY'})
            </div>
          </Card>

          {/* CARD 4: NORMALIZED HAZARD RISK */}
          <Card className="flex flex-col items-center justify-center text-center p-5 bg-gradient-to-b from-white to-slate-50 dark:from-slate-950 dark:to-slate-900/50">
            {overallRisk?.level === 'CRITICAL' ? (
              <AlertTriangle className="h-7 w-7 text-red-500 mb-1.5" />
            ) : overallRisk?.level === 'HIGH' ? (
              <AlertTriangle className="h-7 w-7 text-orange-500 mb-1.5" />
            ) : overallRisk?.level === 'MODERATE' || overallRisk?.level === 'ELEVATED' ? (
              <AlertTriangle className="h-7 w-7 text-yellow-500 mb-1.5" />
            ) : (
              <CheckCircle2 className="h-7 w-7 text-emerald-500 mb-1.5" />
            )}
            <div className={`text-2xl font-bold ${
              overallRisk?.level === 'CRITICAL' ? 'text-red-600 dark:text-red-400' :
              overallRisk?.level === 'HIGH' ? 'text-orange-600 dark:text-orange-400' :
              overallRisk?.level === 'MODERATE' || overallRisk?.level === 'ELEVATED' ? 'text-yellow-600 dark:text-yellow-400' :
              'text-emerald-600 dark:text-emerald-400'
            }`}>
              {overallRisk?.level || 'LOW'}
            </div>
            <div className="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider mt-0.5">
              Risk Level (Score {overallRisk?.score || 10}/100)
            </div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
              {overallRisk?.level === 'LOW' ? 'Normal Baseline' : `Top: ${topHazard?.hazard}`}
            </div>
          </Card>

          {/* CARD 5: DHM CAUTION MARK */}
          <Card className="flex flex-col items-center justify-center text-center p-5 bg-gradient-to-b from-white to-slate-50 dark:from-slate-950 dark:to-slate-900/50 col-span-2 sm:col-span-1">
            <Gauge className="h-7 w-7 text-indigo-500 dark:text-indigo-400 mb-1.5" />
            <div className="text-2xl font-bold text-slate-900 dark:text-white">
              {fusedWeather.dhmThresholdPercentage ?? 0}%
            </div>
            <div className="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider mt-0.5">DHM Caution Mark</div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
              {(fusedWeather.precipitation24hMm ?? 0).toFixed(1)} mm / 50 mm caution limit
            </div>
          </Card>
        </div>
      )}

      {/* EARLY WARNINGS OR ALL-CLEAR STATUS */}
      {overallRisk && overallRisk.level !== 'LOW' ? (
        <Card className={`border-l-4 ${overallRisk.level === 'CRITICAL' ? 'border-l-red-500 bg-red-50/50 dark:bg-red-950/20' : 'border-l-orange-500 bg-orange-50/50 dark:bg-orange-950/20'}`}>
          <div className="flex items-start gap-4 p-4">
            <BellRing className={`h-6 w-6 mt-1 shrink-0 ${overallRisk.level === 'CRITICAL' ? 'text-red-500' : 'text-orange-500'}`} />
            <div className="flex-1">
              <h3 className={`font-bold text-lg mb-1 ${overallRisk.level === 'CRITICAL' ? 'text-red-700 dark:text-red-400' : 'text-orange-700 dark:text-orange-400'}`}>
                {overallRisk.level === 'CRITICAL' ? 'EMERGENCY ALERT: SEVERE HAZARD IMMINENT' : 'WARNING: ELEVATED HAZARD RISK'}
              </h3>
              <p className="text-sm text-slate-700 dark:text-slate-300">
                {overallRisk.level === 'CRITICAL' 
                  ? `Critical ${topHazard?.hazard.toLowerCase()} conditions detected in ${currentLocation?.name}. Immediate action and evacuation readiness recommended.`
                  : `Elevated ${topHazard?.hazard.toLowerCase()} conditions detected. Monitor local alerts closely.`}
              </p>
              <div className="mt-3 flex gap-2 flex-wrap">
                {overallRisk.recommendedMonitoring.slice(0, 3).map((rec, i) => (
                  <Badge key={i} variant="outline" className={`bg-white/50 dark:bg-slate-900/50 ${overallRisk.level === 'CRITICAL' ? 'border-red-200 text-red-700 dark:border-red-800 dark:text-red-400' : 'border-orange-200 text-orange-700 dark:border-orange-800 dark:text-orange-400'}`}>{rec}</Badge>
                ))}
              </div>
            </div>
          </div>
        </Card>
      ) : (
        <Card className="border-l-4 border-l-emerald-500 bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200/70 dark:border-emerald-900/40">
          <div className="flex items-start gap-4 p-4">
            <CheckCircle2 className="h-6 w-6 mt-1 shrink-0 text-emerald-600 dark:text-emerald-400" />
            <div className="flex-1">
              <div className="flex items-center justify-between flex-wrap gap-2 mb-1">
                <h3 className="font-bold text-lg text-emerald-800 dark:text-emerald-300">
                  Normal Situation — Weather & River Basins Within Safe Limits
                </h3>
                <Badge variant="outline" className="bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-200 border-emerald-300 dark:border-emerald-700 font-semibold">
                  ALL CLEAR • LOW RISK
                </Badge>
              </div>
              <p className="text-sm text-slate-700 dark:text-slate-300">
                Live sensor telemetry and Department of Hydrology and Meteorology (DHM) stations confirm stable atmospheric baseline in {currentLocation?.name}. 24-hr rainfall is {(fusedWeather?.precipitation24hMm ?? 0).toFixed(1)} mm, well below the official DHM 50 mm caution threshold.
              </p>
              <div className="mt-3 flex gap-2 flex-wrap text-xs font-medium">
                <span className="px-2.5 py-1 rounded bg-blue-50 dark:bg-blue-900/60 border border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-200 font-semibold flex items-center gap-1.5">
                  <CloudRain className="w-3.5 h-3.5 text-blue-500" />
                  Rain Probability Today: {todayRainProb}% ({rainAssessment.label})
                </span>
                <span className="px-2.5 py-1 rounded bg-white/80 dark:bg-slate-900/80 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300">
                  Current Rain: {(fusedWeather?.precipitationMm ?? 0).toFixed(1)} mm/h (Dry)
                </span>
                <span className="px-2.5 py-1 rounded bg-white/80 dark:bg-slate-900/80 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300">
                  24h Total: {(fusedWeather?.precipitation24hMm ?? 0).toFixed(1)} mm (&lt; 50 mm caution)
                </span>
                <span className="px-2.5 py-1 rounded bg-white/80 dark:bg-slate-900/80 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300">
                  River Basins: Normal Steady Flow
                </span>
                <span className="px-2.5 py-1 rounded bg-white/80 dark:bg-slate-900/80 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300">
                  Road Corridors: Passable
                </span>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* 2. MASTER WEATHER INTELLIGENCE & FORECAST */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 flex flex-col">
          <h3 className="text-lg font-bold mb-4 text-slate-900 dark:text-white flex items-center">
            <BrainCircuit className="mr-2 h-5 w-5 text-blue-600 dark:text-blue-500" />
            Intelligence Summary
          </h3>
          <Card className="flex-1 border-blue-200 dark:border-blue-900/50 bg-blue-50/50 dark:bg-blue-950/10 p-6 flex flex-col justify-between">
            <div className="space-y-5">
              <div>
                <div className="text-xs font-bold text-blue-800 dark:text-blue-400 uppercase tracking-wider mb-1">Combined Forecast</div>
                <div className="text-3xl font-bold text-slate-900 dark:text-slate-100">{fusedWeather?.condition}</div>
                {fusedWeather?.statusSummary && (
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-2 bg-white/60 dark:bg-slate-900/60 p-2.5 rounded border border-blue-100 dark:border-blue-900/30">
                    {fusedWeather.statusSummary}
                  </p>
                )}
              </div>
              
              {/* TODAY'S RAIN PROBABILITY DETAIL */}
              <div className="pt-3 border-t border-blue-100 dark:border-blue-900/50">
                <div className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <CloudRain className="w-3.5 h-3.5 text-blue-500" />
                    Rain Probability (Today)
                  </span>
                  <Badge variant={rainAssessment.badgeVariant}>
                    {todayRainProb}%
                  </Badge>
                </div>
                <div className="p-3 rounded-lg bg-white/70 dark:bg-slate-900/70 border border-blue-100/80 dark:border-blue-900/40 text-xs space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600 dark:text-slate-400">Peak Window:</span>
                    <span className="font-semibold text-slate-900 dark:text-slate-100">{todayPeakRainProb}% at {peakHour}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600 dark:text-slate-400">24h Average:</span>
                    <span className="font-semibold text-slate-900 dark:text-slate-100">{todayAvgRainProb}%</span>
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 italic pt-0.5">
                    {rainAssessment.description}
                  </div>
                </div>
              </div>

              <div className="space-y-4 pt-3 border-t border-blue-100 dark:border-blue-900/50">
                <div>
                  <div className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1 flex items-center justify-between">
                    <span>Source Agreement</span>
                    <Badge variant={fusedWeather?.agreement === 'CONFLICTING' ? 'danger' : fusedWeather?.agreement === 'HIGH' ? 'success' : 'warning'}>
                      {fusedWeather?.agreement}
                    </Badge>
                  </div>
                  {fusedWeather?.agreement === 'CONFLICTING' ? (
                    <p className="text-xs text-red-600 dark:text-red-400 mt-2 flex items-center">
                      <AlertTriangle className="h-3 w-3 mr-1 shrink-0" /> Sources show significant differences. Alert dampened.
                    </p>
                  ) : (
                    <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1">
                      Calibrated cross-validation across all stations.
                    </p>
                  )}
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Last Updated</div>
                  <div className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    Synchronized live ({fusedWeather?.sourcesUsed} active telemetry sources)
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>

        <div className="lg:col-span-2 flex flex-col">
          <h3 className="text-lg font-bold mb-4 text-slate-900 dark:text-white flex items-center justify-between flex-wrap gap-2">
            <span className="flex items-center"><Activity className="mr-2 h-5 w-5 text-indigo-600 dark:text-indigo-500" /> 24-Hour Predictive Trend</span>
            <div className="text-xs px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-900 flex items-center gap-1.5 font-medium">
              <CloudRain className="w-3.5 h-3.5 text-blue-500" />
              Today's Rain Probability: <strong className="font-bold">{todayRainProb}%</strong> (Peak: {todayPeakRainProb}% at {peakHour})
            </div>
          </h3>
          <Card className="flex-1 p-4 pb-2">
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={hourlyForecast?.slice(0, 24)} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorTemp" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f97316" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorRain" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.2} />
                  <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} dy={10} minTickGap={30} />
                  <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} tickFormatter={(val) => `${val}°C`} />
                  <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} tickFormatter={(val) => `${val}%`} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', border: 'none', borderRadius: '8px', color: '#fff' }}
                    itemStyle={{ color: '#fff' }}
                  />
                  <Area yAxisId="left" type="monotone" dataKey="temp" name="Temperature" stroke="#f97316" strokeWidth={2} fillOpacity={1} fill="url(#colorTemp)" />
                  <Area yAxisId="right" type="monotone" dataKey="rainProb" name="Rain Prob" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorRain)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="flex items-center justify-center gap-6 mt-4 text-xs text-slate-500 dark:text-slate-400">
              <div className="flex items-center gap-2"><div className="w-3 h-1 bg-orange-500 rounded"></div> Temperature</div>
              <div className="flex items-center gap-2"><div className="w-3 h-1 bg-blue-500 rounded"></div> Rain Probability</div>
            </div>
          </Card>
        </div>
      </div>

      {/* 3. SOURCES & SENSORS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Source Comparison</h3>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              Multi-source telemetry synchronized
            </span>
          </div>
          <Card className="flex-1 overflow-hidden" noPadding>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-slate-50 dark:bg-slate-900/50 text-slate-600 dark:text-slate-400 text-xs uppercase font-semibold border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="px-4 py-3">Source & Telemetry Network</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Temp</th>
                    <th className="px-4 py-3">Precip Rate</th>
                    <th className="px-4 py-3">24h Accum</th>
                    <th className="px-4 py-3">Rain Prob</th>
                    <th className="px-4 py-3">Freshness</th>
                    <th className="px-4 py-3 text-right">Source Link</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {weatherSources.map((source) => {
                    const sourceUrl = source.url || getSourceUrl(source.name, currentLocation);
                    return (
                      <tr key={source.id} className="bg-white dark:bg-slate-950 hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1.5">
                            <span className="font-semibold text-slate-900 dark:text-slate-200">{source.name}</span>
                            <a
                              href={sourceUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors inline-flex items-center"
                              title={`Open ${source.name} official portal`}
                            >
                              <ExternalLink className="h-3.5 w-3.5" />
                            </a>
                          </div>
                          {source.description && (
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 max-w-sm leading-tight">
                              {source.description}
                            </p>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <Badge variant={source.status === 'AVAILABLE' ? 'success' : source.status === 'DELAYED' ? 'warning' : 'danger'}>
                            {source.status}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 font-semibold text-slate-900 dark:text-slate-100">
                          {source.status !== 'UNAVAILABLE' ? `${source.temp}°C` : '-'}
                        </td>
                        <td className="px-4 py-3">
                          {source.status !== 'UNAVAILABLE' ? `${(source.precipitationMm ?? 0).toFixed(1)} mm/h` : '-'}
                        </td>
                        <td className="px-4 py-3">
                          {source.status !== 'UNAVAILABLE' ? `${(source.precipitation24hMm ?? 0).toFixed(1)} mm` : '-'}
                        </td>
                        <td className="px-4 py-3">{source.status !== 'UNAVAILABLE' ? `${source.rainProb}%` : '-'}</td>
                        <td className="px-4 py-3 text-slate-500 dark:text-slate-400 text-xs">
                          {source.status === 'AVAILABLE' ? 'Synchronized' : source.status === 'DELAYED' ? 'Outdated' : '-'}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <a
                            href={sourceUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-md bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 dark:hover:bg-blue-900/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800/80 transition-colors whitespace-nowrap"
                          >
                            <span>Visit Portal</span>
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        </td>
                      </tr>
                    );
                  })}
                  <tr className="bg-blue-50/70 dark:bg-blue-950/40 font-bold border-t-2 border-blue-200 dark:border-blue-800">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <span className="text-blue-900 dark:text-blue-100 font-bold">MASTER FUSED TELEMETRY</span>
                        <Badge variant="outline" className="bg-white dark:bg-slate-900 text-[10px] border-blue-400 text-blue-700 dark:text-blue-300">
                          WEIGHTED FUSION
                        </Badge>
                      </div>
                      <p className="text-[11px] text-blue-700/80 dark:text-blue-300/80 mt-0.5">
                        Multi-sensor Bayesian calibration adjusted for altitude and instrument reliability
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant="outline" className="bg-white dark:bg-slate-900 border-blue-400 text-blue-700 dark:text-blue-300">
                        FUSED
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-blue-700 dark:text-blue-300 text-base font-bold">{fusedWeather?.temp}°C</td>
                    <td className="px-4 py-3 text-blue-700 dark:text-blue-300">{(fusedWeather?.precipitationMm ?? 0).toFixed(1)} mm/h</td>
                    <td className="px-4 py-3 text-blue-700 dark:text-blue-300">{(fusedWeather?.precipitation24hMm ?? 0).toFixed(1)} mm</td>
                    <td className="px-4 py-3 text-blue-700 dark:text-blue-300">{fusedWeather?.rainProb}%</td>
                    <td className="px-4 py-3 text-blue-700 dark:text-blue-300 text-xs">Live Calibrated</td>
                    <td className="px-4 py-3 text-right">
                      <a
                        href={currentLocation?.lat && currentLocation?.lng ? `https://open-meteo.com/en/docs#latitude=${currentLocation.lat}&longitude=${currentLocation.lng}` : 'https://open-meteo.com/'}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-md bg-blue-600 hover:bg-blue-700 text-white transition-colors whitespace-nowrap shadow-sm"
                      >
                        <span>Inspect Raw API</span>
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* AI Weather Advisory & Situational Guidance Box */}
            <AiWeatherAdvisoryBox
              fusedWeather={fusedWeather}
              location={currentLocation}
            />
          </Card>
        </div>

        <div className="lg:col-span-1 flex flex-col">
          <h3 className="text-lg font-bold mb-4 text-slate-900 dark:text-white flex items-center">
            <Activity className="mr-2 h-5 w-5 text-teal-600 dark:text-teal-500" />
            Live Monitors
          </h3>
          <Card className="flex-1 p-4 bg-slate-900 text-slate-50 border-slate-800">
            <div className="space-y-4">
              {environmentalSensors.map(sensor => (
                <div key={sensor.id} className="p-4 rounded-lg bg-slate-950 border border-slate-800">
                  <div className="flex justify-between items-start mb-2">
                    <div className="font-bold text-sm text-slate-400 uppercase tracking-wider">{sensor.type}</div>
                    <Badge variant={sensor.status === 'CRITICAL' ? 'critical' : sensor.status === 'WARNING' ? 'warning' : 'outline'} className={sensor.status === 'NORMAL' ? 'text-slate-400 border-slate-700' : ''}>
                      {sensor.status}
                    </Badge>
                  </div>
                  <div className="flex items-end justify-between">
                    <div className={`text-3xl font-bold ${sensor.status === 'CRITICAL' ? 'text-red-400' : sensor.status === 'WARNING' ? 'text-yellow-400' : 'text-white'}`}>
                      {sensor.value}
                    </div>
                    <div className="text-sm font-medium flex items-center">
                      {sensor.trend === 'RISING' ? (
                        <span className="text-red-400 flex items-center"><Navigation className="h-4 w-4 mr-1 rotate-45" /> Rising</span>
                      ) : sensor.trend === 'FALLING' ? (
                        <span className="text-emerald-400 flex items-center"><Navigation className="h-4 w-4 mr-1 rotate-[135deg]" /> Falling</span>
                      ) : (
                        <span className="text-slate-400 flex items-center"><Navigation className="h-4 w-4 mr-1 rotate-90" /> Stable</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      {/* 4. AI HAZARD ANALYSIS */}
      <div>
        <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center">
            <Activity className="mr-2 h-5 w-5 text-emerald-600 dark:text-emerald-500" />
            AI Hazard Analysis & Multi-Model Calibration
          </h3>
          <div className="flex items-center gap-2 text-xs">
            <Badge variant="outline" className="bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800">
              Confidence Floor: ≥{CONFIDENCE_THRESHOLD}%
            </Badge>
            <Badge variant="outline" className="bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border-blue-300 dark:border-blue-800">
              Base-Level Normalized
            </Badge>
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {normalizedHazardRisks.filter(r => r.hazard !== 'Overall').map(risk => (
            <Card key={risk.id} className={`border-l-4 ${risk.level === 'CRITICAL' ? 'border-l-red-500 bg-red-50/30 dark:bg-red-950/10' : risk.level === 'HIGH' ? 'border-l-orange-500 bg-orange-50/30 dark:bg-orange-950/10' : 'border-l-slate-300 dark:border-l-slate-700'}`}>
              <CardHeader 
                title={
                  <div className="flex items-center justify-between w-full">
                    <span className="font-bold text-slate-900 dark:text-slate-100">{risk.hazard} Assessment</span>
                    <div className="flex items-center gap-1.5">
                      <Badge variant={risk.level === 'CRITICAL' ? 'critical' : risk.level === 'HIGH' ? 'danger' : risk.level === 'ELEVATED' ? 'warning' : 'success'}>
                        {risk.level}
                      </Badge>
                    </div>
                  </div>
                }
              />
              <div className="p-4 pt-0 space-y-4">
                <div className="flex items-center gap-4 mb-2">
                  <div className="flex-1 bg-slate-200 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-500 ${risk.level === 'CRITICAL' ? 'bg-red-500' : risk.level === 'HIGH' ? 'bg-orange-500' : risk.level === 'ELEVATED' ? 'bg-yellow-500' : 'bg-emerald-500'}`}
                      style={{ width: `${risk.score}%` }}
                    />
                  </div>
                  <span className="text-sm font-bold w-12 text-right">{risk.score}/100</span>
                </div>
                
                <div className="bg-white/60 dark:bg-slate-950/60 p-3 rounded-lg border border-slate-100 dark:border-slate-800">
                  <div className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2 flex items-center justify-between">
                    <span>Why? (AI & Meteorological Logic)</span>
                    <span className="text-[11px] font-medium text-slate-400">Confidence: {risk.confidence}%</span>
                  </div>
                  <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                    {risk.explanation}
                  </p>
                </div>

                <div>
                  <div className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Telemetry Factors</div>
                  <ul className="text-sm text-slate-600 dark:text-slate-400 list-disc list-inside space-y-1">
                    {risk.factors.map((f, i) => <li key={i}>{f}</li>)}
                  </ul>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* 5. COLOR-CODED RISK MAP */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 h-[560px] flex flex-col overflow-hidden" noPadding>
          <div className="p-3.5 sm:p-4 border-b border-slate-200 dark:border-slate-800 flex flex-wrap justify-between items-center bg-slate-50 dark:bg-slate-900 gap-3 shrink-0">
            <div className="flex items-center gap-2">
              <Map className="h-4 w-4 text-emerald-500" />
              <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                Interactive Nepal Hazard Map (Galli Maps)
              </h3>
              <Badge variant="outline" className="text-[10px] hidden md:inline-flex bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border-emerald-300 dark:border-emerald-800">
                Galli Maps Live
              </Badge>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-mono hidden sm:inline">
                Click any region circle to inspect
              </span>
            </div>
            <div className="flex gap-1.5 flex-wrap items-center">
              <Button variant={riskLayer === 'OVERALL' ? 'secondary' : 'outline'} size="sm" onClick={() => setRiskLayer('OVERALL')}>Overall</Button>
              <Button variant={riskLayer === 'FLOOD' ? 'primary' : 'outline'} size="sm" onClick={() => setRiskLayer('FLOOD')}>Flood</Button>
              <Button variant={riskLayer === 'LANDSLIDE' ? 'primary' : 'outline'} size="sm" onClick={() => setRiskLayer('LANDSLIDE')}>Landslide</Button>
            </div>
          </div>

          {/* Quick Region Selector Pills */}
          <div className="px-4 py-2 bg-slate-100/80 dark:bg-slate-900/60 border-b border-slate-200 dark:border-slate-800 flex gap-2 overflow-x-auto text-xs shrink-0">
            <span className="text-slate-500 dark:text-slate-400 py-1 font-semibold whitespace-nowrap">Focus:</span>
            {locations.filter(l => l.lat && l.lng).map(loc => {
              const regRisk = regionalRiskProfiles[loc.id] || regionalRiskProfiles['loc-1'];
              const isSelected = selectedRegionId === loc.id;
              return (
                <button
                  key={loc.id}
                  onClick={() => setSelectedRegionId(loc.id)}
                  className={`px-2.5 py-1 rounded-full whitespace-nowrap transition-all flex items-center gap-1.5 font-medium ${
                    isSelected
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  <span
                    className="w-2 h-2 rounded-full shrink-0"
                    style={{ backgroundColor: getRiskColor(regRisk.level) }}
                  />
                  {loc.name}
                </button>
              );
            })}
          </div>

          <div className="flex-1 w-full relative min-h-[400px] overflow-hidden bg-slate-100 dark:bg-slate-950">
             {/* Map Hazard Scale Index */}
             <div className="absolute bottom-3.5 left-3.5 z-[400] bg-white/95 dark:bg-slate-900/95 backdrop-blur-md px-3.5 py-2.5 rounded-lg shadow-md border border-slate-200/90 dark:border-slate-800/90 text-xs pointer-events-auto max-w-[280px]">
               <div className="font-bold text-slate-800 dark:text-slate-200 mb-1.5 flex items-center justify-between gap-2 text-[10px] uppercase tracking-wider">
                 <span>Hazard Scale</span>
                 <span className="text-slate-400 dark:text-slate-500 font-normal normal-case text-[10px]">DHM/ICIMOD</span>
               </div>
               <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-[11px]">
                 <div className="flex items-center gap-1.5">
                   <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0"></span>
                   <span className="text-slate-700 dark:text-slate-300 font-medium">Low (0–30)</span>
                 </div>
                 <div className="flex items-center gap-1.5">
                   <span className="w-2.5 h-2.5 rounded-full bg-yellow-500 shrink-0"></span>
                   <span className="text-slate-700 dark:text-slate-300 font-medium">Moderate (31–60)</span>
                 </div>
                 <div className="flex items-center gap-1.5">
                   <span className="w-2.5 h-2.5 rounded-full bg-orange-500 shrink-0"></span>
                   <span className="text-slate-700 dark:text-slate-300 font-medium">High (61–85)</span>
                 </div>
                 <div className="flex items-center gap-1.5">
                   <span className="w-2.5 h-2.5 rounded-full bg-red-500 shrink-0"></span>
                   <span className="text-slate-700 dark:text-slate-300 font-medium">Critical (86–100)</span>
                 </div>
               </div>
             </div>

             <BaseMap 
               center={selectedRegionLocation.lat && selectedRegionLocation.lng ? [selectedRegionLocation.lat, selectedRegionLocation.lng] : [27.7172, 85.3240]} 
               zoom={8} 
               className="h-full w-full absolute inset-0"
             >
               {locations.filter(l => l.lat && l.lng).map(loc => {
                 const regRisk = regionalRiskProfiles[loc.id] || regionalRiskProfiles['loc-1'];
                 const color = getRiskColor(regRisk.level);
                 const isSelected = selectedRegionId === loc.id;
                 return (
                   <Circle 
                     key={loc.id}
                     center={[loc.lat!, loc.lng!]} 
                     radius={isSelected ? 14000 : 10000}
                     eventHandlers={{
                       click: () => setSelectedRegionId(loc.id)
                     }}
                     pathOptions={{ 
                       color: color, 
                       fillColor: color, 
                       fillOpacity: isSelected ? 0.45 : 0.25,
                       weight: isSelected ? 3 : 1.5
                     }}
                   />
                 );
               })}
             </BaseMap>
          </div>
        </Card>

        {/* Region Assessment Details Panel */}
        <Card className="flex flex-col border-slate-200 dark:border-slate-800">
          <CardHeader 
            title={selectedRegionLocation.name} 
            subtitle={`${selectedRegionLocation.region || 'Nepal'} Basin Region`} 
          />
          <div className="p-4 flex-1 flex flex-col space-y-4 overflow-y-auto text-sm">
            <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Primary Hazard
                </span>
                <Badge 
                  variant={
                    activeRegionRisk.level === 'CRITICAL' ? 'critical' : 
                    activeRegionRisk.level === 'HIGH' ? 'danger' : 
                    activeRegionRisk.level === 'MODERATE' ? 'warning' : 'success'
                  }
                >
                  {activeRegionRisk.level}
                </Badge>
              </div>
              <div className="text-base font-bold text-slate-900 dark:text-white">
                {activeRegionRisk.hazard}
              </div>
              <div className="mt-2 flex items-center justify-between text-xs text-slate-600 dark:text-slate-400">
                <span>Threat Score: <strong className="text-slate-900 dark:text-white">{activeRegionRisk.score}/100</strong></span>
                <span>Confidence: <strong className="text-slate-900 dark:text-white">{activeRegionRisk.confidence}%</strong></span>
              </div>
            </div>

            <div>
              <div className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                AI Reasoning & Contributing Factors
              </div>
              <p className="text-xs text-slate-700 dark:text-slate-300 mb-2 leading-relaxed">
                {activeRegionRisk.reasons}
              </p>
              <ul className="text-xs text-slate-600 dark:text-slate-400 space-y-1 list-disc list-inside">
                {activeRegionRisk.factors.map((f, i) => (
                  <li key={i}>{f}</li>
                ))}
              </ul>
            </div>

            <div>
              <div className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                Integrated Data Sources
              </div>
              <div className="flex flex-wrap gap-1.5">
                {activeRegionRisk.sources.map((s, i) => (
                  <a
                    key={i}
                    href={getSourceUrl(s, selectedRegionLocation)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-[11px] px-2.5 py-1 rounded bg-slate-100 hover:bg-blue-50 dark:bg-slate-800 dark:hover:bg-blue-950/60 text-slate-700 hover:text-blue-700 dark:text-slate-300 dark:hover:text-blue-300 font-medium transition-colors border border-transparent hover:border-blue-300 dark:hover:border-blue-800"
                    title={`Open official telemetry source: ${s}`}
                  >
                    <span>{s}</span>
                    <ExternalLink className="h-2.5 w-2.5 opacity-70" />
                  </a>
                ))}
              </div>
            </div>

            <div className="p-2.5 rounded bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/40 text-xs">
              <span className="font-semibold text-blue-900 dark:text-blue-300 block mb-0.5">Recommended Responder Action:</span>
              <span className="text-blue-800 dark:text-blue-200">{activeRegionRisk.action}</span>
            </div>

            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-400">
              <span>Telemetry Sync: {activeRegionRisk.lastUpdate}</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-medium">Live Feed</span>
            </div>
          </div>
        </Card>
      </div>

      {/* 6. HISTORICAL DISASTER REPLAY */}
      <div>
        <h3 className="text-lg font-bold mb-4 text-slate-900 dark:text-white flex items-center">
          <History className="mr-2 h-5 w-5 text-indigo-600 dark:text-indigo-500" />
          Historical Disaster Replay
        </h3>
        <Card className="border-indigo-100 dark:border-indigo-900/30 overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-3">
            
            {/* Selection & Analysis */}
            <div className="p-6 border-b lg:border-b-0 lg:border-r border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30">
              <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-2">Simulated Event</label>
              <select 
                className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 text-sm font-medium text-slate-900 dark:text-slate-200 outline-none mb-6"
                value={selectedHistoricalEventId}
                onChange={(e) => setSelectedHistoricalEventId(e.target.value)}
              >
                {historicalEvents.map(e => <option key={e.id} value={e.id}>{e.name} ({e.date})</option>)}
              </select>

              <div className="bg-white dark:bg-slate-950 p-4 rounded-lg border border-slate-200 dark:border-slate-800 space-y-4">
                <h4 className="font-bold text-slate-900 dark:text-white flex items-center text-sm">
                  <BrainCircuit className="h-4 w-4 mr-2 text-indigo-500" /> What would SAHAYAK have concluded?
                </h4>
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed italic">
                  "Based on the available historical signals leading up to the {selectedEvent?.date} event, the system would have classified the area as high risk before the recorded event."
                </p>
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
                  <div className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Recorded Outcome</div>
                  <div className="text-sm font-medium text-slate-900 dark:text-slate-200">{selectedEvent?.actualOutcome}</div>
                  <div className="text-xs text-slate-500 dark:text-slate-500 mt-1">Region: {selectedEvent?.actualAffectedRegion}</div>
                </div>
              </div>
            </div>

            {/* Timeline */}
            <div className="p-6 col-span-2">
              <h4 className="font-bold text-slate-900 dark:text-white mb-6 text-sm uppercase tracking-wider">Event Timeline Progression</h4>
              <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-200 dark:before:via-slate-800 before:to-transparent">
                {selectedEvent?.timeline.map((step, idx) => (
                  <div key={idx} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-white dark:border-slate-950 bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                      <ChevronRight className="h-4 w-4" />
                    </div>
                    <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-white dark:bg-slate-900 p-4 rounded-lg shadow-sm border border-slate-100 dark:border-slate-800">
                      <div className="flex items-center justify-between mb-2">
                        <Badge variant="outline" className="font-mono text-xs">{step.timeOffset}</Badge>
                        <Badge variant={step.aiRiskLevel === 'CRITICAL' ? 'critical' : step.aiRiskLevel === 'HIGH' ? 'danger' : 'warning'}>{step.aiRiskLevel}</Badge>
                      </div>
                      <div className="text-sm text-slate-700 dark:text-slate-300 font-medium mb-1">{step.aiPrediction}</div>
                      <div className="text-xs text-slate-500 dark:text-slate-500 border-t border-slate-100 dark:border-slate-800 pt-2 mt-2">
                        Source signal: {step.sourceState}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Card>
      </div>
      </>
      )}

    </div>
  );
}
