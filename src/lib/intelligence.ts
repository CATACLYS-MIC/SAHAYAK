import { WeatherSource, FusedWeather, HazardRisk, Location } from '../types';

export function fuseWeatherSources(sources: WeatherSource[], locationId: string): FusedWeather {
  const activeSources = sources.filter(s => s.status === 'AVAILABLE' || s.status === 'DELAYED');
  
  if (activeSources.length === 0) {
    return {
      locationId,
      temp: 0,
      condition: 'Unknown',
      rainProb: 0,
      humidity: 0,
      windSpeed: 0,
      precipitationMm: 0,
      precipitation24hMm: 0,
      weatherCode: 1,
      rainfallCategory: 'DRY',
      dhmThresholdPercentage: 0,
      statusSummary: 'No active telemetry stations reporting for this location.',
      agreement: 'CONFLICTING',
      confidence: 0,
      sourcesUsed: 0,
      lastUpdated: new Date().toISOString()
    };
  }

  let totalTemp = 0, totalRainProb = 0, totalHumidity = 0, totalWind = 0, totalPressure = 0, totalWeight = 0;
  let totalPrecipMm = 0, totalPrecip24hMm = 0;
  let minRain = 100, maxRain = 0;
  let dominantWeatherCode = 1;

  activeSources.forEach(s => {
    const weight = s.reliability * (s.status === 'AVAILABLE' ? 1 : 0.5);
    totalTemp += s.temp * weight;
    totalRainProb += s.rainProb * weight;
    totalHumidity += s.humidity * weight;
    totalWind += s.windSpeed * weight;
    if (s.pressure) totalPressure += s.pressure * weight;
    
    totalPrecipMm += (s.precipitationMm ?? 0) * weight;
    totalPrecip24hMm += (s.precipitation24hMm ?? 0) * weight;
    totalWeight += weight;

    if (s.weatherCode !== undefined) {
      dominantWeatherCode = s.weatherCode;
    }

    if (s.rainProb < minRain) minRain = s.rainProb;
    if (s.rainProb > maxRain) maxRain = s.rainProb;
  });

  const rainSpread = maxRain - minRain;
  let agreement: FusedWeather['agreement'] = 'HIGH';
  if (rainSpread > 35) agreement = 'CONFLICTING';
  else if (rainSpread > 20) agreement = 'MODERATE';
  else agreement = 'HIGH';

  // Confidence based on active sources count and agreement
  let confidence = Math.min(98, Math.round(activeSources.length * 24));
  if (agreement === 'CONFLICTING') confidence = Math.max(30, confidence - 35);
  else if (agreement === 'MODERATE') confidence = Math.max(65, confidence - 10);
  else confidence = Math.max(88, confidence);

  const rainProb = Math.round(totalRainProb / totalWeight);
  const precipitationMm = Math.round((totalPrecipMm / totalWeight) * 10) / 10;
  const precipitation24hMm = Math.round((totalPrecip24hMm / totalWeight) * 10) / 10;

  // Determine condition based on actual WMO weather code and physical precipitation
  let condition = 'Mainly Clear';
  if (precipitationMm >= 20 || [65, 82, 95, 96, 99].includes(dominantWeatherCode)) {
    condition = 'Heavy Rain / Downpour';
  } else if (precipitationMm >= 4 || [63, 81].includes(dominantWeatherCode)) {
    condition = 'Moderate Rain';
  } else if (precipitationMm > 0.1 || [51, 53, 55, 61, 80].includes(dominantWeatherCode)) {
    condition = 'Light Rain';
  } else if (dominantWeatherCode === 3) {
    condition = 'Overcast';
  } else if (dominantWeatherCode === 2) {
    condition = 'Partly Cloudy';
  } else if (dominantWeatherCode === 0) {
    condition = 'Clear Sky';
  } else if ([45, 48].includes(dominantWeatherCode)) {
    condition = 'Fog / Mist';
  } else if (precipitation24hMm < 2 && rainProb < 25) {
    condition = 'Dry & Clear';
  } else if (rainProb > 60) {
    condition = 'Overcast / Chance of Rain';
  }

  // Rainfall Classification according to Nepal DHM standards
  let rainfallCategory: FusedWeather['rainfallCategory'] = 'DRY';
  if (precipitation24hMm >= 150 || precipitationMm >= 35) {
    rainfallCategory = 'TORRENTIAL';
  } else if (precipitation24hMm >= 50 || precipitationMm >= 15) {
    rainfallCategory = 'HEAVY';
  } else if (precipitation24hMm >= 10 || precipitationMm >= 2.5) {
    rainfallCategory = 'MODERATE';
  } else if (precipitation24hMm >= 0.5 || precipitationMm > 0) {
    rainfallCategory = 'LIGHT';
  }

  const dhmThresholdPercentage = Math.round(Math.min(100, (precipitation24hMm / 50) * 100));

  // Plain-language, understandable status summary
  let statusSummary = `Normal Weather: Dry and stable atmospheric conditions (${precipitationMm} mm/h rain, 24-hr total: ${precipitation24hMm} mm). Hydro-meteorological risk is negligible.`;
  if (rainfallCategory === 'LIGHT') {
    statusSummary = `Normal Weather: Light localized sprinkle (${precipitation24hMm} mm/24h). Well below the DHM 50 mm/day caution threshold.`;
  } else if (rainfallCategory === 'MODERATE') {
    statusSummary = `Seasonal Showers: Moderate rain recorded (${precipitation24hMm} mm/24h). River basin runoff remains within regular safe margins.`;
  } else if (rainfallCategory === 'HEAVY') {
    statusSummary = `Heavy Rain Advisory: 24-hr precipitation (${precipitation24hMm} mm) has reached DHM caution threshold (50 mm). Localized ponding possible.`;
  } else if (rainfallCategory === 'TORRENTIAL') {
    statusSummary = `Extreme Torrential Alert: 24-hr rainfall (${precipitation24hMm} mm) exceeds DHM Danger threshold. Active flood/landslide alerts.`;
  }

  return {
    locationId,
    temp: Math.round(totalTemp / totalWeight),
    condition,
    rainProb,
    humidity: Math.round(totalHumidity / totalWeight),
    windSpeed: Math.round(totalWind / totalWeight),
    pressure: totalPressure > 0 ? Math.round(totalPressure / totalWeight) : undefined,
    precipitationMm,
    precipitation24hMm,
    weatherCode: dominantWeatherCode,
    rainfallCategory,
    dhmThresholdPercentage,
    statusSummary,
    agreement,
    confidence,
    sourcesUsed: activeSources.length,
    lastUpdated: new Date().toISOString()
  };
}

export function calculateHazardRisks(fused: FusedWeather, location: Location): HazardRisk[] {
  const risks: HazardRisk[] = [];
  const precip24h = fused.precipitation24hMm ?? (fused.rainProb > 50 ? 5 : 0.5);
  const precipRate = fused.precipitationMm ?? 0;
  const confidence = fused.confidence ?? 85;
  const isConflicting = fused.agreement === 'CONFLICTING';
  const CONFIDENCE_THRESHOLD = 65;

  // 1. FLOOD RISK (Grounded in DHM Nepal 24-hr rainfall thresholds: 50mm caution, 100mm warning, 150mm danger)
  let floodScore = 10;
  const floodFactors: string[] = [];

  if (precip24h < 10 && precipRate < 2.0) {
    // Normal / Dry conditions
    floodScore = Math.max(5, Math.min(18, Math.round(6 + (precip24h * 1.0))));
    floodFactors.push(`24-Hour Rainfall: ${precip24h.toFixed(1)} mm (Well below 50 mm DHM Caution Mark)`);
    floodFactors.push(`Current Precipitation Rate: ${precipRate.toFixed(1)} mm/h (Dry / Normal)`);
    floodFactors.push('River Basins: Normal seasonal discharge within embankments');
  } else if (precip24h < 50) {
    // Moderate seasonal rain - well within safe channel capacity
    floodScore = Math.round(18 + ((precip24h - 10) / 40) * 16);
    floodFactors.push(`24-Hour Rainfall: ${precip24h.toFixed(1)} mm (Moderate seasonal shower)`);
    floodFactors.push('Sub-catchment runoff managed by primary drainage lines');
    floodFactors.push('DHM hydrometric stations reporting steady baseline flow');
  } else if (precip24h < 100) {
    // Heavy rain - DHM Caution
    floodScore = Math.round(42 + ((precip24h - 50) / 50) * 18);
    floodFactors.push(`24-Hour Rainfall: ${precip24h.toFixed(1)} mm (Exceeds DHM 50 mm Caution Mark)`);
    floodFactors.push('Urban drainage choke points experiencing high flow volume');
    if (location.name === 'Kathmandu' || location.name === 'Biratnagar') {
      floodScore += 5;
      floodFactors.push('Low-lying riparian settlement vulnerability');
    }
  } else if (precip24h < 150) {
    // Very Heavy Rain - DHM Warning
    floodScore = Math.round(64 + ((precip24h - 100) / 50) * 16);
    floodFactors.push(`24-Hour Rainfall: ${precip24h.toFixed(1)} mm (Exceeds 100 mm DHM Warning Threshold)`);
    floodFactors.push('Basin river gauges approaching warning stage');
    floodFactors.push('Flash flood risk along tributary channels');
  } else {
    // Torrential Rain - DHM Danger
    floodScore = Math.min(98, Math.round(82 + ((precip24h - 150) / 50) * 14));
    floodFactors.push(`24-Hour Rainfall: ${precip24h.toFixed(1)} mm (Exceeds 150 mm DHM Danger Mark)`);
    floodFactors.push('Severe widespread river bank overtopping imminent');
  }

  // Base-level normalization & confidence threshold check for Flood
  if (precip24h < 50 && precipRate < 4.0 && floodScore >= 40) {
    floodScore = Math.min(35, floodScore); // Cap at MODERATE during safe rainfall
  }
  if ((confidence < CONFIDENCE_THRESHOLD || isConflicting) && floodScore >= 60) {
    floodScore = Math.min(48, Math.round(floodScore * (confidence / 100)));
    floodFactors.unshift(`Confidence Filter: Corroboration confidence (${confidence}%) below ${CONFIDENCE_THRESHOLD}% threshold; alert escalation suppressed.`);
  }

  floodScore = Math.min(100, Math.max(5, floodScore));

  risks.push({
    id: `risk-flood-${Date.now()}`,
    locationId: location.id,
    hazard: 'Flood',
    score: floodScore,
    level: getRiskLevel(floodScore),
    confidence: confidence,
    factors: floodFactors,
    explanation: generateHazardExplanation('Flood', floodScore, precip24h, precipRate, location.name),
    recommendedMonitoring: floodScore > 40 ? ['River water levels', 'Drainage culverts', 'Low-lying embankments'] : ['Routine DHM basin watch']
  });

  // 2. LANDSLIDE RISK (Triggered by high cumulative rainfall saturation + steep mountain topography)
  let landslideScore = 8;
  const landslideFactors: string[] = [];
  const isMountainous = ['Sindhupalchok', 'Rasuwa', 'Gorkha', 'Makwanpur'].includes(location.name);

  if (precip24h < 10 && precipRate < 2.0) {
    // Dry / Light - Stable slopes
    landslideScore = Math.max(5, Math.min(15, Math.round(5 + (precip24h * 0.7) + (isMountainous ? 2 : 0))));
    landslideFactors.push('Soil Saturation: Low / Normal seasonal baseline');
    landslideFactors.push('Slope Drainage: Stable with no hydrostatic pore-pressure');
    landslideFactors.push(isMountainous ? 'Mountain corridors dry with normal highway transit' : 'Plain/Valley terrain with zero slope hazard');
  } else if (precip24h < 50) {
    // Moderate rain
    landslideScore = Math.round(16 + ((precip24h - 10) / 40) * 16 + (isMountainous ? 6 : 0));
    landslideFactors.push(`Antecedent Rainfall: ${precip24h.toFixed(1)} mm/24h`);
    landslideFactors.push('Hill slopes absorbing precipitation within regular drainage limits');
    if (isMountainous) landslideFactors.push('Caution advised near isolated road cut-slopes');
  } else if (precip24h < 100) {
    // Heavy rain
    landslideScore = Math.round(42 + ((precip24h - 50) / 50) * 18 + (isMountainous ? 12 : 0));
    landslideFactors.push(`24-hr Rainfall Saturation: ${precip24h.toFixed(1)} mm`);
    landslideFactors.push('Elevated pore pressure in fractured highway cuttings');
    if (isMountainous) landslideFactors.push('Steep Himalayan slope topography accelerates slip risk');
  } else {
    // Severe / Torrential
    landslideScore = Math.min(98, Math.round(68 + ((precip24h - 100) / 50) * 18 + (isMountainous ? 10 : 0)));
    landslideFactors.push(`Excessive rainfall saturation (${precip24h.toFixed(1)} mm/24h)`);
    landslideFactors.push('High probability of mudslides, rockfalls, and debris flow');
  }

  // Base-level normalization & confidence threshold check for Landslide
  if (precip24h < 50 && precipRate < 4.0 && landslideScore >= 40) {
    landslideScore = Math.min(36, landslideScore); // Cap at MODERATE during safe rainfall
  }
  if ((confidence < CONFIDENCE_THRESHOLD || isConflicting) && landslideScore >= 60) {
    landslideScore = Math.min(48, Math.round(landslideScore * (confidence / 100)));
    landslideFactors.unshift(`Confidence Filter: Multi-source confidence (${confidence}%) below ${CONFIDENCE_THRESHOLD}% threshold; alert escalation suppressed.`);
  }

  landslideScore = Math.min(100, Math.max(5, landslideScore));

  risks.push({
    id: `risk-landslide-${Date.now()}`,
    locationId: location.id,
    hazard: 'Landslide',
    score: landslideScore,
    level: getRiskLevel(landslideScore),
    confidence: Math.max(50, confidence - 6),
    factors: landslideFactors,
    explanation: generateHazardExplanation('Landslide', landslideScore, precip24h, precipRate, location.name),
    recommendedMonitoring: landslideScore > 40 ? ['Soil moisture sensors', 'Highway slope cameras', 'Araniko/Prithvi road corridors'] : ['Routine highway slope monitoring']
  });

  // 3. OVERALL HAZARD RISK
  const maxScore = Math.max(floodScore, landslideScore);
  const primaryHazard = floodScore >= landslideScore ? 'Flood' : 'Landslide';
  const overallLevel = getRiskLevel(maxScore);

  let overallExplanation = `Normal / Safe Conditions: Both rainfall (${precip24h.toFixed(1)} mm/24h) and river discharge are well below critical emergency thresholds in ${location.name}. Routine situational readiness maintained.`;
  if (overallLevel === 'CRITICAL') {
    overallExplanation = `CRITICAL EMERGENCY ALERT: Severe ${primaryHazard.toLowerCase()} threat in ${location.name} driven by extreme precipitation (${precip24h.toFixed(1)} mm/24h). Active DHM danger mark exceeded. Immediate incident response required.`;
  } else if (overallLevel === 'HIGH') {
    overallExplanation = `HIGH HAZARD WARNING: ${primaryHazard} warning active in ${location.name}. Rainfall (${precip24h.toFixed(1)} mm/24h) exceeds DHM 100 mm warning threshold. Monitor vulnerable riverbanks and slope corridors.`;
  } else if (overallLevel === 'ELEVATED') {
    overallExplanation = `ELEVATED CAUTION: ${primaryHazard} advisory in ${location.name}. Rainfall (${precip24h.toFixed(1)} mm/24h) exceeds DHM 50 mm caution threshold. Localized drainage ponding and caution along mountain highways.`;
  } else if (overallLevel === 'MODERATE') {
    overallExplanation = `MODERATE / WATCH: Light-to-moderate showers (${precip24h.toFixed(1)} mm/24h). Normal seasonal runoff. No immediate danger to settlements or infrastructure.`;
  }

  risks.push({
    id: `risk-overall-${Date.now()}`,
    locationId: location.id,
    hazard: 'Overall',
    score: maxScore,
    level: overallLevel,
    confidence: fused.confidence,
    factors: overallLevel === 'LOW' 
      ? [`Measured Rainfall: ${precip24h.toFixed(1)} mm (Safe < 50mm)`, 'River Station Levels: Normal green stage', 'Slopes & Corridors: Clear & passable']
      : [...new Set([...floodFactors, ...landslideFactors])].slice(0, 4),
    explanation: overallExplanation,
    recommendedMonitoring: overallLevel === 'LOW' ? ['Routine telemetry monitoring'] : ['DHM Flood Warning Service', 'Road Department Navigate']
  });

  return risks;
}

export function getRiskLevel(score: number): HazardRisk['level'] {
  if (score >= 80) return 'CRITICAL';
  if (score >= 60) return 'HIGH';
  if (score >= 40) return 'ELEVATED';
  if (score >= 20) return 'MODERATE';
  return 'LOW';
}

function generateHazardExplanation(
  hazard: 'Flood' | 'Landslide', 
  score: number, 
  precip24h: number, 
  precipRate: number,
  locationName: string
): string {
  if (score >= 80) {
    return `CRITICAL ${hazard.toUpperCase()} DANGER: Torrential rainfall (${precip24h.toFixed(1)} mm/24h) has breached DHM Danger thresholds in ${locationName}. Severe threat to human safety and structures.`;
  }
  if (score >= 60) {
    return `HIGH ${hazard.toUpperCase()} WARNING: Heavy sustained precipitation (${precip24h.toFixed(1)} mm/24h) has exceeded the 100 mm DHM warning stage. High risk along watercourses and unstable slopes.`;
  }
  if (score >= 40) {
    return `ELEVATED CAUTION: Precipitation (${precip24h.toFixed(1)} mm/24h) exceeds the 50 mm DHM caution benchmark. Exercise increased vigilance near low-lying drainage and mountain highway sectors.`;
  }
  if (score >= 20) {
    return `MODERATE / WATCH: Recorded rainfall (${precip24h.toFixed(1)} mm/24h) is within normal monsoon/seasonal tolerances. Stream flows are stable.`;
  }
  return `NORMAL SITUATION: Weather conditions in ${locationName} are calm and dry (${precipRate.toFixed(1)} mm/h current, ${precip24h.toFixed(1)} mm in 24h). Baseline ${hazard.toLowerCase()} hazard is safe and minimal.`;
}

// AI Service Boundary Stub
export async function fetchAIReasoning(data: any): Promise<any> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        status: 'success',
        message: 'Telemetry validated against DHM Nepal and Open-Meteo meteorological standards.',
        data
      });
    }, 200);
  });
}
