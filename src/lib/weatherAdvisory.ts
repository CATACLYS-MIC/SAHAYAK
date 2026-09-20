import { FusedWeather } from '../types';

export interface WeatherAdvisoryRecommendation {
  icon: 'umbrella' | 'stay_indoor' | 'lightning' | 'driving' | 'hydration' | 'riverbank' | 'general';
  title: string;
  detail: string;
}

export interface WeatherAdvisoryData {
  headline: string;
  shortBriefing: string;
  severity: 'NORMAL' | 'CAUTION' | 'ALERT' | 'CRITICAL';
  actionRecommendations: WeatherAdvisoryRecommendation[];
  generatedBy: 'GEMINI_AI' | 'LOCAL_AI_SYNTHESIS';
  timestamp: string;
}

/**
 * Generates an instant, highly accurate contextual weather advisory based on
 * meteorological conditions, WMO codes, DHM thresholds, and civil safety rules.
 */
export function generateLocalWeatherAdvisory(
  fused: FusedWeather | null | undefined,
  locationName: string = 'Current Area'
): WeatherAdvisoryData {
  const temp = fused?.temp ?? 22;
  const rainProb = fused?.rainProb ?? 10;
  const precipRate = fused?.precipitationMm ?? 0;
  const precip24h = fused?.precipitation24hMm ?? 0;
  const windSpeed = fused?.windSpeed ?? 8;
  const code = fused?.weatherCode ?? 1;
  const condition = (fused?.condition || '').toLowerCase();

  const isThunderstorm = [95, 96, 99].includes(code) || condition.includes('thunder') || condition.includes('storm');
  const isTorrential = precip24h >= 100 || precipRate >= 25 || [65, 82].includes(code) || condition.includes('torrential') || condition.includes('heavy');
  const isModerateRain = precipRate >= 2 || precip24h >= 15 || [61, 63, 80, 81].includes(code) || condition.includes('rain');
  const isLightRainOrUpcoming = rainProb >= 45 || precipRate > 0 || [51, 53, 55].includes(code) || condition.includes('drizzle');
  const isFog = [45, 48].includes(code) || condition.includes('fog') || condition.includes('mist');
  const isHighWind = windSpeed >= 28;
  const isHot = temp >= 32;

  const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  // 1. CRITICAL / EXTREME WEATHER (Torrential Downpour / Severe Flood Risk)
  if (isTorrential || (isThunderstorm && precip24h >= 50)) {
    return {
      headline: `Severe Monsoon Alert in ${locationName}`,
      shortBriefing: `Torrential rainfall detected (${precipRate.toFixed(1)} mm/h rate, 24h total: ${precip24h.toFixed(1)} mm). Waterlogging and sudden flash floods in low-lying river corridors are imminent.`,
      severity: 'CRITICAL',
      actionRecommendations: [
        {
          icon: 'stay_indoor',
          title: 'Avoid Non-Essential Travel',
          detail: 'Do not go outside unless strictly necessary. Stay indoors on elevated, structurally stable floors.'
        },
        {
          icon: 'riverbank',
          title: 'Stay Far From River Corridors',
          detail: 'Avoid walking or parking near active riverbanks (Bagmati, Bishnumati, Hanumante) due to sudden surge water.'
        },
        {
          icon: 'driving',
          title: 'Halt Mountain Road Transit',
          detail: 'Steep hill cuts and highway passes are at immediate risk of debris flows and mudslides.'
        },
        {
          icon: 'umbrella',
          title: 'Heavy Waterproof Protection',
          detail: 'Standard umbrellas may invert in heavy winds; use heavy-duty raincoats if emergency transit is required.'
        }
      ],
      generatedBy: 'LOCAL_AI_SYNTHESIS',
      timestamp: now
    };
  }

  // 2. THUNDERSTORM DETECTED OR IMMINENT
  if (isThunderstorm) {
    return {
      headline: `Thunderstorm & Active Lightning Warning for ${locationName}`,
      shortBriefing: `Atmospheric telemetry indicates convective instability with lightning and gusty winds up to ${windSpeed} km/h. Showers are expected to intensify rapidly.`,
      severity: 'ALERT',
      actionRecommendations: [
        {
          icon: 'lightning',
          title: 'Seek Substantial Shelter',
          detail: 'Avoid open hilltops, rooftop terraces, and standing beneath tall isolated trees or metallic poles.'
        },
        {
          icon: 'umbrella',
          title: 'Carry an Umbrella & Rain Gear',
          detail: 'Strong squalls and sudden downpours are likely. Keep rainwear ready before stepping outdoors.'
        },
        {
          icon: 'driving',
          title: 'Drive with Hazard Caution',
          detail: 'Wet bitumen reduces tire traction and sudden puddles increase hydroplaning risk on arterial roads.'
        }
      ],
      generatedBy: 'LOCAL_AI_SYNTHESIS',
      timestamp: now
    };
  }

  // 3. MODERATE RAIN OR HIGH RAIN PROBABILITY (About to rain)
  if (isModerateRain || isLightRainOrUpcoming) {
    const aboutToRain = precipRate === 0 && rainProb >= 50;
    return {
      headline: aboutToRain 
        ? `Rain Expected Soon in ${locationName} (~${rainProb}% Chance)` 
        : `Rain Showers Active in ${locationName}`,
      shortBriefing: aboutToRain
        ? `Atmospheric moisture is high (${fused?.humidity ?? 70}%) with a ${rainProb}% likelihood of precipitation. Weather fronts indicate incoming showers within the hour.`
        : `Active precipitation recorded at ${precipRate.toFixed(1)} mm/h (${precip24h.toFixed(1)} mm today). Road surfaces are damp with reduced visibility.`,
      severity: 'CAUTION',
      actionRecommendations: [
        {
          icon: 'umbrella',
          title: 'Make Sure to Grab an Umbrella',
          detail: 'Carry a folding umbrella or light waterproof jacket so you are not caught off-guard by shifting showers.'
        },
        {
          icon: 'driving',
          title: 'Watch for Wet Roads & Traffic Delays',
          detail: 'Braking distances increase on damp urban tarmac; allow extra buffer time for city travel.'
        },
        {
          icon: 'stay_indoor',
          title: 'Plan Outdoor Chores Early',
          detail: 'Wrap up outdoor errands before cloud build-up thickens in the afternoon or evening.'
        }
      ],
      generatedBy: 'LOCAL_AI_SYNTHESIS',
      timestamp: now
    };
  }

  // 4. LOW VISIBILITY / FOG
  if (isFog) {
    return {
      headline: `Low Visibility & Morning Mist in ${locationName}`,
      shortBriefing: `Dense fog and atmospheric mist have lowered horizontal visibility. Air temperature is cool at ${temp}°C with high relative humidity (${fused?.humidity ?? 85}%).`,
      severity: 'CAUTION',
      actionRecommendations: [
        {
          icon: 'driving',
          title: 'Use Low-Beam Headlights',
          detail: 'High beams reflect off water droplets in fog, worsening glare. Maintain generous following distance.'
        },
        {
          icon: 'general',
          title: 'Wear Warm Layering',
          detail: 'Damp cold air lowers body temperature quickly; light thermal windbreakers recommended.'
        }
      ],
      generatedBy: 'LOCAL_AI_SYNTHESIS',
      timestamp: now
    };
  }

  // 5. WINDY / GUSTS
  if (isHighWind) {
    return {
      headline: `Brisk Wind Advisory in ${locationName} (${windSpeed} km/h)`,
      shortBriefing: `Gusty wind patterns detected across the valley rim. Outdoor air is dry and rapidly moving loose dust.`,
      severity: 'CAUTION',
      actionRecommendations: [
        {
          icon: 'general',
          title: 'Secure Outdoor Items',
          detail: 'Fasten balcony awnings, loose clotheslines, and outdoor signs from blowing over.'
        },
        {
          icon: 'general',
          title: 'Wear Dust & Eye Protection',
          detail: 'Roadside particulate matter is elevated during sustained gusty periods.'
        }
      ],
      generatedBy: 'LOCAL_AI_SYNTHESIS',
      timestamp: now
    };
  }

  // 6. CLEAR / MILD / NORMAL CONDITIONS
  return {
    headline: isHot 
      ? `Sunny & Warm Conditions in ${locationName} (${temp}°C)` 
      : `Pleasant, Stable Weather in ${locationName} (${temp}°C)`,
    shortBriefing: `Current conditions are stable with minimal rain probability (${rainProb}%) and calm winds (${windSpeed} km/h). No hydro-meteorological threats detected today.`,
    severity: 'NORMAL',
    actionRecommendations: [
      {
        icon: isHot ? 'hydration' : 'general',
        title: isHot ? 'Stay Hydrated in the Sun' : 'Favorable for Outdoor Activities',
        detail: isHot 
          ? 'Carry a water bottle and wear UV sunglasses during midday peak hours.'
          : 'Ideal conditions for travel, commuting, construction, and outdoor recreation.'
      },
      {
        icon: 'umbrella',
        title: 'Umbrella Not Required',
        detail: 'Precipitation chance is negligible for the coming daytime hours.'
      }
    ],
    generatedBy: 'LOCAL_AI_SYNTHESIS',
    timestamp: now
  };
}

/**
 * Calls the backend Gemini API route for an advanced AI briefing,
 * with instantaneous fallback to local synthesis.
 */
export async function fetchAiWeatherAdvisory(
  fused: FusedWeather | null | undefined,
  locationName: string = 'Current Area'
): Promise<WeatherAdvisoryData> {
  const localFallback = generateLocalWeatherAdvisory(fused, locationName);
  
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    const response = await fetch('/api/weather-advisory', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: controller.signal,
      body: JSON.stringify({
        locationName,
        temp: fused?.temp ?? 22,
        condition: fused?.condition ?? 'Mainly Clear',
        rainProb: fused?.rainProb ?? 10,
        precipitationMm: fused?.precipitationMm ?? 0,
        precipitation24hMm: fused?.precipitation24hMm ?? 0,
        windSpeed: fused?.windSpeed ?? 8,
        humidity: fused?.humidity ?? 60,
        weatherCode: fused?.weatherCode ?? 1
      })
    });

    clearTimeout(timeoutId);

    if (response.ok) {
      const data = await response.json();
      if (data.headline && data.shortBriefing && Array.isArray(data.actionRecommendations)) {
        return {
          ...data,
          generatedBy: 'GEMINI_AI',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
      }
    }
  } catch (_err) {
    // Graceful fallback to rich local synthesis
  }

  return localFallback;
}
