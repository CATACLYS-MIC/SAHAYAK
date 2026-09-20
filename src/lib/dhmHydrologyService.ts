import { DhmRiverStation, DhmHydrologySummary, RiverFloodPredictionInsight, SahayakRiverRiskLevel } from '../types';

export interface NearbyRiverRisk {
  station: DhmRiverStation;
  distanceKm: number;
  threatLevel: SahayakRiverRiskLevel;
  warningNote: string;
}

/**
 * Calculates Haversine distance in kilometers between two GPS coordinates
 */
export function calculateHaversineDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

/**
 * Service to fetch, filter, and analyze Nepal DHM River Watch data
 */
export class DhmHydrologyService {
  private static cachedStations: DhmRiverStation[] = [];
  private static cachedSummary: DhmHydrologySummary | null = null;
  private static lastFetched: number = 0;

  /**
   * Fetches river stations from the backend DHM service
   */
  static async fetchStations(options?: { demo?: boolean; refresh?: boolean }): Promise<{
    stations: DhmRiverStation[];
    summary: DhmHydrologySummary;
    dataSource: 'LIVE' | 'CACHED' | 'SIMULATED';
    lastUpdated: string;
  }> {
    const isDemo = options?.demo ?? false;
    const isRefresh = options?.refresh ?? false;

    const url = `/api/dhm/river-watch?demo=${isDemo}&refresh=${isRefresh}`;
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`DHM Hydrology API responded with status ${response.status}`);
    }

    const json = await response.json();
    if (!json.success || !Array.isArray(json.stations)) {
      throw new Error('Invalid DHM API response structure');
    }

    DhmHydrologyService.cachedStations = json.stations;
    DhmHydrologyService.cachedSummary = json.summary;
    DhmHydrologyService.lastFetched = Date.now();

    return {
      stations: json.stations,
      summary: json.summary,
      dataSource: json.dataSource,
      lastUpdated: json.lastUpdated
    };
  }

  /**
   * Finds river stations located within a given radius (km) of a coordinate
   */
  static findNearbyStations(
    lat: number, 
    lng: number, 
    stations: DhmRiverStation[], 
    radiusKm: number = 25
  ): NearbyRiverRisk[] {
    const results: NearbyRiverRisk[] = [];

    for (const st of stations) {
      if (st.latitude === null || st.longitude === null) continue;
      const dist = calculateHaversineDistanceKm(lat, lng, st.latitude, st.longitude);
      
      if (dist <= radiusKm) {
        let warningNote = `River station ${st.name} is ${dist} km away (${st.dhmOfficialStatus}).`;
        if (st.sahayakRisk === 'CRITICAL') {
          warningNote = `CRITICAL FLOOD THREAT: Station ${st.name} (${dist} km away) is above Danger Level (${st.waterLevel}m, ${st.trend.toLowerCase()}). High inundation potential.`;
        } else if (st.sahayakRisk === 'HIGH') {
          warningNote = `HIGH FLOOD THREAT: Station ${st.name} (${dist} km away) is above Warning Level (${st.waterLevel}m, ${st.trend.toLowerCase()}). Adjacent corridors at risk.`;
        } else if (st.sahayakRisk === 'WATCH') {
          warningNote = `FLOOD WATCH: Station ${st.name} (${dist} km away) is approaching warning threshold and ${st.trend.toLowerCase()}.`;
        }

        results.push({
          station: st,
          distanceKm: dist,
          threatLevel: st.sahayakRisk,
          warningNote
        });
      }
    }

    return results.sort((a, b) => {
      // Prioritize CRITICAL, then HIGH, then WATCH, then closest
      const riskOrder: Record<SahayakRiverRiskLevel, number> = {
        CRITICAL: 4,
        HIGH: 3,
        WATCH: 2,
        LOW: 1
      };
      if (riskOrder[b.threatLevel] !== riskOrder[a.threatLevel]) {
        return riskOrder[b.threatLevel] - riskOrder[a.threatLevel];
      }
      return a.distanceKm - b.distanceKm;
    });
  }

  /**
   * Assesses river risks for a route path (array of lat/lng coordinates)
   */
  static assessRouteRiverRisks(
    pathCoords: { lat: number; lng: number }[],
    stations: DhmRiverStation[],
    proximityThresholdKm: number = 10
  ): {
    maxThreatLevel: SahayakRiverRiskLevel;
    affectedStations: NearbyRiverRisk[];
    hasFloodedCrossing: boolean;
    routeWarningMessage: string | null;
  } {
    if (!pathCoords || pathCoords.length === 0) {
      return { maxThreatLevel: 'LOW', affectedStations: [], hasFloodedCrossing: false, routeWarningMessage: null };
    }

    const matchedStationIds = new Set<number>();
    const affectedStations: NearbyRiverRisk[] = [];

    for (const point of pathCoords) {
      for (const st of stations) {
        if (st.latitude === null || st.longitude === null) continue;
        if (matchedStationIds.has(st.id)) continue;

        const dist = calculateHaversineDistanceKm(point.lat, point.lng, st.latitude, st.longitude);
        if (dist <= proximityThresholdKm && (st.sahayakRisk === 'HIGH' || st.sahayakRisk === 'CRITICAL' || (st.sahayakRisk === 'WATCH' && st.trend === 'RISING'))) {
          matchedStationIds.add(st.id);
          affectedStations.push({
            station: st,
            distanceKm: dist,
            threatLevel: st.sahayakRisk,
            warningNote: `Route passes within ${dist} km of ${st.name} (${st.waterLevel}m, ${st.dhmOfficialStatus}).`
          });
        }
      }
    }

    // Determine highest threat
    let maxThreat: SahayakRiverRiskLevel = 'LOW';
    if (affectedStations.some(s => s.threatLevel === 'CRITICAL')) maxThreat = 'CRITICAL';
    else if (affectedStations.some(s => s.threatLevel === 'HIGH')) maxThreat = 'HIGH';
    else if (affectedStations.some(s => s.threatLevel === 'WATCH')) maxThreat = 'WATCH';

    const hasFloodedCrossing = affectedStations.some(s => s.distanceKm <= 3.5 && (s.threatLevel === 'HIGH' || s.threatLevel === 'CRITICAL'));

    let routeWarningMessage: string | null = null;
    if (affectedStations.length > 0) {
      const top = affectedStations[0];
      routeWarningMessage = `Passes near ${top.station.riverName || top.station.name} (${top.distanceKm} km). Water level is ${top.station.waterLevel}m (${top.station.dhmOfficialStatus}).`;
    }

    return {
      maxThreatLevel: maxThreat,
      affectedStations,
      hasFloodedCrossing,
      routeWarningMessage
    };
  }

  /**
   * Calls AI Flood Assessment endpoint for deep multi-signal reasoning
   */
  static async getAiFloodAssessment(
    station: DhmRiverStation,
    recentRainfallMm: number = 45,
    forecastRainfallMm: number = 65
  ): Promise<RiverFloodPredictionInsight> {
    const response = await fetch('/api/dhm/ai-flood-assessment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        station,
        recentRainfallMm,
        forecastRainfallMm
      })
    });

    if (!response.ok) {
      throw new Error(`AI assessment error: status ${response.status}`);
    }

    return response.json();
  }
}
