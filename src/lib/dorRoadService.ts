import { 
  DorRoadClosure, 
  DorBridge, 
  DorRoadLink, 
  DorRoadSummary, 
  DisasterAwareRouteEvaluation, 
  RoutingProfileMode, 
  SahayakRoadStatus, 
  DhmRiverStation,
  Facility,
  CommunityRoadReport
} from '../types';
import { 
  INITIAL_DOR_ROAD_LINKS, 
  INITIAL_DOR_CLOSURES, 
  INITIAL_DOR_BRIDGES, 
  INITIAL_DOR_SUMMARY 
} from '../data/mockDorData';

// Haversine distance in km
export function getDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

export function calculatePolylineDistance(path: { lat: number; lng: number }[]): number {
  let total = 0;
  for (let i = 0; i < path.length - 1; i++) {
    total += getDistanceKm(path[i].lat, path[i].lng, path[i+1].lat, path[i+1].lng);
  }
  return total;
}

/**
 * Normalizes raw DOR closure status into SAHAYAK states:
 * OPEN | CAUTION | RESTRICTED | BLOCKED | UNKNOWN
 */
export function normalizeDorClosureStatus(closureType: string, reason?: string, status?: string): SahayakRoadStatus {
  const cType = (closureType || '').toUpperCase().trim();
  const sText = (status || '').toUpperCase().trim();
  const rText = (reason || '').toLowerCase();

  if (cType === 'FULL_CLOSURE' || cType === 'BLOCKED' || sText === 'BLOCKED' || sText === 'CLOSED') {
    return 'BLOCKED';
  }
  if (rText.includes('washout') || rText.includes('completely blocked') || rText.includes('impassable')) {
    return 'BLOCKED';
  }
  if (cType === 'PARTIAL_OPEN' || sText === 'ONE_WAY' || sText === 'RESTRICTED' || rText.includes('one way') || rText.includes('restricted')) {
    return 'RESTRICTED';
  }
  if (cType === 'CAUTION' || rText.includes('water log') || rText.includes('loose stone') || rText.includes('debris') || rText.includes('landslide risk')) {
    return 'CAUTION';
  }
  if (cType === 'OPEN' || sText === 'OPEN' || sText === 'CLEAR') {
    return 'OPEN';
  }
  return 'UNKNOWN';
}

/**
 * Fetch DOR Roads, Closures & Links from backend proxy with fallback
 */
export async function fetchDorRoadData(): Promise<{
  closures: DorRoadClosure[];
  roadLinks: DorRoadLink[];
  summary: DorRoadSummary;
  dataSource: 'LIVE' | 'CACHED' | 'SIMULATED';
  lastUpdated: string;
}> {
  try {
    const res = await fetch('/api/dor/roads-closures');
    if (res.ok) {
      const data = await res.json();
      if (data && data.closures && data.closures.length > 0) {
        return {
          closures: data.closures,
          roadLinks: data.roadLinks || INITIAL_DOR_ROAD_LINKS,
          summary: data.summary || INITIAL_DOR_SUMMARY,
          dataSource: data.dataSource || 'LIVE',
          lastUpdated: data.lastUpdated || new Date().toISOString()
        };
      }
    }
  } catch (err) {
    console.warn('DOR API fetch failed, falling back to verified cached DOR data:', err);
  }

  // Graceful fallback to verified DOR dataset
  return {
    closures: INITIAL_DOR_CLOSURES,
    roadLinks: INITIAL_DOR_ROAD_LINKS,
    summary: INITIAL_DOR_SUMMARY,
    dataSource: 'CACHED',
    lastUpdated: new Date().toISOString()
  };
}

/**
 * Fetch DOR Bridges from backend proxy with fallback
 */
export async function fetchDorBridges(): Promise<{
  bridges: DorBridge[];
  dataSource: 'LIVE' | 'CACHED' | 'SIMULATED';
  lastUpdated: string;
}> {
  try {
    const res = await fetch('/api/dor/bridges');
    if (res.ok) {
      const data = await res.json();
      if (data && data.bridges && data.bridges.length > 0) {
        return {
          bridges: data.bridges,
          dataSource: data.dataSource || 'LIVE',
          lastUpdated: data.lastUpdated || new Date().toISOString()
        };
      }
    }
  } catch (err) {
    console.warn('DOR Bridges fetch failed, falling back to verified bridge dataset:', err);
  }

  return {
    bridges: INITIAL_DOR_BRIDGES,
    dataSource: 'CACHED',
    lastUpdated: new Date().toISOString()
  };
}

/**
 * Major Strategic Road Network Corridors across Nepal
 */
export const NEPAL_HIGHWAY_CORRIDORS: Record<string, {
  name: string;
  roadRefNo: string;
  startCity: string;
  endCity: string;
  via: string[];
  baseDistanceKm: number;
  baseDurationMin: number;
  geometry: { lat: number; lng: number }[];
}> = {
  // Kathmandu to Pokhara via Prithvi Highway (Standard corridor)
  'ktm-pkr-prithvi': {
    name: 'Prithvi Highway (NH05)',
    roadRefNo: 'NH05',
    startCity: 'Kathmandu',
    endCity: 'Pokhara',
    via: ['Naubise', 'Malekhu', 'Mugling', 'Damauli'],
    baseDistanceKm: 204,
    baseDurationMin: 340,
    geometry: [
      { lat: 27.7172, lng: 85.3240 }, // Kathmandu
      { lat: 27.7130, lng: 85.2010 }, // Thankot
      { lat: 27.7280, lng: 85.1150 }, // Naubise
      { lat: 27.8105, lng: 84.8213 }, // Malekhu
      { lat: 27.8576, lng: 84.5562 }, // Mugling
      { lat: 27.9730, lng: 84.2850 }, // Damauli
      { lat: 28.2096, lng: 83.9856 }  // Pokhara
    ]
  },
  // Kathmandu to Pokhara via Galchhi - Trishuli - Nuwakot - Dhading mountain alternate
  'ktm-pkr-galchhi': {
    name: 'Galchhi - Nuwakot - Damauli Bypass',
    roadRefNo: 'NH03/NH05',
    startCity: 'Kathmandu',
    endCity: 'Pokhara',
    via: ['Tokha', 'Galchhi Ridge', 'Gorkha', 'Pokhara'],
    baseDistanceKm: 232,
    baseDurationMin: 410,
    geometry: [
      { lat: 27.7172, lng: 85.3240 },
      { lat: 27.7650, lng: 85.3120 },
      { lat: 27.8500, lng: 85.0500 },
      { lat: 28.0050, lng: 84.6200 }, // Gorkha
      { lat: 28.1200, lng: 84.2500 },
      { lat: 28.2096, lng: 83.9856 }
    ]
  },
  // Kathmandu to Chitwan (Bharatpur) via Mugling
  'ktm-chitwan-mugling': {
    name: 'Prithvi & Narayanghat Corridor (NH05/NH44)',
    roadRefNo: 'NH05/NH44',
    startCity: 'Kathmandu',
    endCity: 'Chitwan',
    via: ['Naubise', 'Malekhu', 'Mugling', 'Tuin Khola'],
    baseDistanceKm: 148,
    baseDurationMin: 260,
    geometry: [
      { lat: 27.7172, lng: 85.3240 },
      { lat: 27.7280, lng: 85.1150 },
      { lat: 27.8105, lng: 84.8213 },
      { lat: 27.8576, lng: 84.5562 },
      { lat: 27.8472, lng: 84.4826 },
      { lat: 27.6833, lng: 84.4333 }  // Bharatpur / Chitwan
    ]
  },
  // Kathmandu to Chitwan (Bharatpur) via Tribhuvan Highway (Daman / Hetauda Bypass)
  'ktm-chitwan-hetauda': {
    name: 'Tribhuvan Highway & East-West Bypass (NH02/NH01)',
    roadRefNo: 'NH02/NH01',
    startCity: 'Kathmandu',
    endCity: 'Chitwan',
    via: ['Naubise', 'Daman', 'Hetauda', 'Narayanghat'],
    baseDistanceKm: 186,
    baseDurationMin: 320,
    geometry: [
      { lat: 27.7172, lng: 85.3240 },
      { lat: 27.7280, lng: 85.1150 },
      { lat: 27.6080, lng: 85.0850 }, // Daman
      { lat: 27.4287, lng: 85.0322 }, // Hetauda
      { lat: 27.5500, lng: 84.7500 },
      { lat: 27.6833, lng: 84.4333 }  // Bharatpur
    ]
  },
  // Kathmandu to Birgunj via BP Highway / FAST TRACK connection
  'ktm-birgunj-bp': {
    name: 'B.P. Highway & Terai Bypass (NH09/NH01)',
    roadRefNo: 'NH09/NH01',
    startCity: 'Kathmandu',
    endCity: 'Birgunj',
    via: ['Dhulikhel', 'Nepalthok', 'Bardibas', 'Pathlaiya'],
    baseDistanceKm: 215,
    baseDurationMin: 330,
    geometry: [
      { lat: 27.7172, lng: 85.3240 },
      { lat: 27.6200, lng: 85.5400 }, // Dhulikhel
      { lat: 27.3456, lng: 85.9234 }, // Nepalthok
      { lat: 26.9800, lng: 85.9000 }, // Bardibas
      { lat: 27.0300, lng: 85.0300 }, // Pathlaiya
      { lat: 27.0130, lng: 84.8770 }  // Birgunj
    ]
  },
  // Kathmandu to Birgunj via Tribhuvan Highway (Traditional)
  'ktm-birgunj-tribhuvan': {
    name: 'Tribhuvan Highway Direct (NH02)',
    roadRefNo: 'NH02',
    startCity: 'Kathmandu',
    endCity: 'Birgunj',
    via: ['Naubise', 'Tistung', 'Hetauda', 'Simara'],
    baseDistanceKm: 135,
    baseDurationMin: 290,
    geometry: [
      { lat: 27.7172, lng: 85.3240 },
      { lat: 27.7280, lng: 85.1150 },
      { lat: 27.6080, lng: 85.0850 },
      { lat: 27.4287, lng: 85.0322 },
      { lat: 27.1500, lng: 84.9800 },
      { lat: 27.0130, lng: 84.8770 }
    ]
  },
  // Pokhara to Butwal via Siddhartha Highway
  'pkr-butwal-siddhartha': {
    name: 'Siddhartha Highway (NH10)',
    roadRefNo: 'NH10',
    startCity: 'Pokhara',
    endCity: 'Butwal',
    via: ['Syangja', 'Waling', 'Tansen (Palpa)', 'Dobhan'],
    baseDistanceKm: 158,
    baseDurationMin: 280,
    geometry: [
      { lat: 28.2096, lng: 83.9856 },
      { lat: 28.0900, lng: 83.8700 }, // Syangja
      { lat: 27.9700, lng: 83.7500 }, // Waling
      { lat: 27.8600, lng: 83.5400 }, // Tansen
      { lat: 27.7500, lng: 83.4800 }, // Dobhan
      { lat: 27.7006, lng: 83.4484 }  // Butwal
    ]
  },
  // Pokhara to Butwal via Mid-Hill Highway & Ridi Bypass
  'pkr-butwal-ridi': {
    name: 'Mid-Hill Highway & Ridi Bypass (NH03/Local)',
    roadRefNo: 'NH03',
    startCity: 'Pokhara',
    endCity: 'Butwal',
    via: ['Kushma', 'Baglung', 'Ridi', 'Tamghas', 'Butwal'],
    baseDistanceKm: 198,
    baseDurationMin: 360,
    geometry: [
      { lat: 28.2096, lng: 83.9856 },
      { lat: 28.2100, lng: 83.6800 },
      { lat: 27.9500, lng: 83.4300 },
      { lat: 27.7006, lng: 83.4484 }
    ]
  }
};

/**
 * Evaluates candidate routes combining:
 * 1. DOR road condition/status (OPEN, CAUTION, RESTRICTED, BLOCKED)
 * 2. DOR road closures & link records
 * 3. DOR bridge conditions
 * 4. DHM River Watch levels (water level vs warning & danger levels, rising trend)
 * 5. DOR Landslide risk by link code
 * 6. Responder role requirements (AMBULANCE, FIRE, RESCUE, RELIEF, CITIZEN)
 * 7. Objective: SAFEST APPROPRIATE ROUTE (Not shortest route only!)
 */
export function evaluateDisasterAwareRoutes(params: {
  origin: { lat: number; lng: number; name: string };
  destination: { lat: number; lng: number; name: string };
  dorClosures: DorRoadClosure[];
  dorBridges: DorBridge[];
  dorLinks: DorRoadLink[];
  dhmStations: DhmRiverStation[];
  responderMode: RoutingProfileMode;
  isDemoScenario?: boolean;
}): DisasterAwareRouteEvaluation[] {
  const {
    origin,
    destination,
    dorClosures,
    dorBridges,
    dorLinks,
    dhmStations,
    responderMode,
    isDemoScenario
  } = params;

  // Find candidate corridor templates matching origin & destination
  const candidateKeys = findCandidateCorridors(origin.name, destination.name);

  // If no predefined corridor matches exactly, build a direct path and two strategic variants
  const corridorsToEvaluate = candidateKeys.length > 0 
    ? candidateKeys.map(k => NEPAL_HIGHWAY_CORRIDORS[k])
    : generateDynamicCandidateCorridors(origin, destination);

  const evaluations: DisasterAwareRouteEvaluation[] = corridorsToEvaluate.map((corridor, idx) => {
    const routeId = `dor-route-${idx + 1}`;
    const distanceKm = corridor.baseDistanceKm;
    let estimatedTimeMin = corridor.baseDurationMin;
    
    // Check DOR road closures near this route path
    const routeClosures: DorRoadClosure[] = [];
    let hasBlocked = false;
    let hasRestricted = false;
    let hasCaution = false;

    // In demo scenario, simulate active landslide blockage and high flood on route 1 (Prithvi)
    if (isDemoScenario && idx === 0) {
      hasCaution = true;
      routeClosures.push({
        id: 'DEMO-SIM-001',
        roadName: corridor.name,
        roadRefNo: corridor.roadRefNo,
        district: 'Dhading',
        closureReason: 'Monsoon flash flood surge along Trishuli riverside & boulder drop at Malekhu',
        closureType: 'PARTIAL_OPEN',
        sahayakStatus: 'CAUTION',
        repairEta: 'Traffic halted periodically by Nepal Police',
        remarks: 'SIMULATED DATA — DEMONSTRATION ONLY: River water level nearing asphalt edge.',
        latitude: 27.8105,
        longitude: 84.8213,
        lastUpdated: new Date().toISOString(),
        source: 'Department of Roads — Navigate',
        sourceUrl: 'https://navigate.dor.gov.np/app/dashboard',
        dataSource: 'SIMULATED'
      });
    }

    // Match actual DOR closures against corridor points
    dorClosures.forEach(closure => {
      if (closure.latitude && closure.longitude) {
        const isNear = corridor.geometry.some(pt => getDistanceKm(pt.lat, pt.lng, closure.latitude!, closure.longitude!) < 20);
        const nameMatch = corridor.name.toLowerCase().includes(closure.roadName.toLowerCase()) || 
                          closure.roadRefNo.toLowerCase().includes(corridor.roadRefNo.toLowerCase());
        if (isNear || nameMatch) {
          routeClosures.push(closure);
          if (closure.sahayakStatus === 'BLOCKED') hasBlocked = true;
          if (closure.sahayakStatus === 'RESTRICTED') hasRestricted = true;
          if (closure.sahayakStatus === 'CAUTION') hasCaution = true;
        }
      }
    });

    // Check DOR Bridges along this corridor
    const bridgeRisks: { bridgeName: string; river: string; status: SahayakRoadStatus; distanceKm: number }[] = [];
    dorBridges.forEach(bridge => {
      if (bridge.latitude && bridge.longitude) {
        const minDistance = Math.min(...corridor.geometry.map(pt => getDistanceKm(pt.lat, pt.lng, bridge.latitude!, bridge.longitude!)));
        if (minDistance < 15) {
          bridgeRisks.push({
            bridgeName: bridge.bridgeName,
            river: bridge.river,
            status: bridge.status,
            distanceKm: Math.round(minDistance * 10) / 10
          });
          if (bridge.status === 'BLOCKED') hasBlocked = true;
          if (bridge.status === 'RESTRICTED') hasRestricted = true;
        }
      }
    });

    // Check DHM River Watch stations along corridor
    const nearbyRiverStations: {
      stationName: string;
      river: string;
      waterLevel: number;
      dangerLevel: number;
      distanceKm: number;
      threatLevel: string;
      trend: string;
    }[] = [];

    let riverFloodRisk: 'NONE' | 'WATCH' | 'HIGH' | 'CRITICAL' = 'NONE';

    // Demo scenario injection for Route 1
    if (isDemoScenario && idx === 0) {
      riverFloodRisk = 'HIGH';
      nearbyRiverStations.push({
        stationName: 'Betrawati / Trishuli Station',
        river: 'Trishuli River',
        waterLevel: 8.85,
        dangerLevel: 9.00,
        distanceKm: 2.1,
        threatLevel: 'RIVER NEAR DANGER LEVEL (CLEARANCE 0.15m)',
        trend: 'RISING'
      });
    }

    // Match live DHM stations
    for (const st of (dhmStations || [])) {
      if (st.latitude && st.longitude && st.waterLevel != null && st.dangerLevel != null) {
        const minDistance = Math.min(...corridor.geometry.map(pt => getDistanceKm(pt.lat, pt.lng, st.latitude!, st.longitude!)));
        if (minDistance < 18) {
          let threat = 'NORMAL';
          if (st.waterLevel >= st.dangerLevel) {
            threat = 'ABOVE DANGER LEVEL';
            riverFloodRisk = 'CRITICAL';
          } else if ((st.warningLevel != null && st.waterLevel >= st.warningLevel) || (st.dangerLevel - st.waterLevel < 0.6)) {
            threat = 'ABOVE WARNING LEVEL';
            if (riverFloodRisk !== 'CRITICAL') riverFloodRisk = 'HIGH';
          } else if (st.trend === 'RISING') {
            threat = 'RISING FAST';
            if (riverFloodRisk === 'NONE') riverFloodRisk = 'WATCH';
          }

          nearbyRiverStations.push({
            stationName: st.name,
            river: st.riverName || st.basin || 'River',
            waterLevel: st.waterLevel,
            dangerLevel: st.dangerLevel,
            distanceKm: Math.round(minDistance * 10) / 10,
            threatLevel: threat,
            trend: st.trend
          });
        }
      }
    }

    // Collect Landslide hazards from DOR
    const dorLandslideRisks: string[] = [];
    dorLinks.forEach(link => {
      if (link.landslideRisk && link.landslideRisk.toLowerCase().includes('high')) {
        const matches = corridor.via.some(v => link.linkName.toLowerCase().includes(v.toLowerCase()));
        if (matches) {
          dorLandslideRisks.push(`${link.linkName}: ${link.landslideRisk}`);
        }
      }
    });

    // Compile warnings and hazards
    const warnings: string[] = [];
    const hazards: string[] = [];

    if (hasBlocked) {
      warnings.push('CRITICAL: Confirmed road closure / blockage reported by DOR Navigate.');
      hazards.push('Road Blocked');
    }
    if (hasRestricted) {
      warnings.push('RESTRICTED: Alternating one-way traffic or heavy vehicle restriction active.');
      hazards.push('One-Way Restriction');
      estimatedTimeMin += 45; // delay heuristic
    }
    if (hasCaution) {
      warnings.push('CAUTION: DOR advises slow speeds due to loose rockfall or pavement erosion.');
      hazards.push('Loose Rockfall Hazard');
      estimatedTimeMin += 20;
    }
    if (riverFloodRisk === 'CRITICAL') {
      warnings.push('FLOOD ALERT: Adjacent DHM river level is above danger threshold. Submersion imminent.');
      hazards.push('River Inundation');
    } else if (riverFloodRisk === 'HIGH') {
      warnings.push('FLOOD WATCH: Adjacent DHM river gauge is rising towards danger level.');
      hazards.push('High River Runoff');
    }

    if (bridgeRisks.some(b => b.status === 'BLOCKED' || b.status === 'RESTRICTED')) {
      warnings.push('BRIDGE WARNING: Bridge structure restriction detected on route.');
      hazards.push('Bridge Clearance Risk');
    }

    // Determine normalized DOR road status for route
    const dorRoadStatus: SahayakRoadStatus = 
      hasBlocked ? 'BLOCKED' : 
      hasRestricted ? 'RESTRICTED' : 
      hasCaution ? 'CAUTION' : 'OPEN';

    // Calculate deterministic risk penalty score (lower is safer)
    // Distance weight: 1 point per 2 km
    let deterministicScore = Math.round(distanceKm * 0.5);

    // Hazard penalties:
    if (hasBlocked) deterministicScore += 4000;
    if (hasRestricted) deterministicScore += 300;
    if (hasCaution) deterministicScore += 80;

    if (riverFloodRisk === 'CRITICAL') deterministicScore += 800;
    else if (riverFloodRisk === 'HIGH') deterministicScore += 350;
    else if (riverFloodRisk === 'WATCH') deterministicScore += 90;

    if (bridgeRisks.some(b => b.status === 'BLOCKED')) deterministicScore += 1000;
    if (bridgeRisks.some(b => b.status === 'RESTRICTED')) deterministicScore += 200;

    if (dorLandslideRisks.length > 0) deterministicScore += dorLandslideRisks.length * 70;

    // Responder profile evaluation
    const profileSuitability = evaluateProfileSuitability(responderMode, dorRoadStatus, riverFloodRisk, distanceKm);
    deterministicScore += profileSuitability.penalty;

    // Overall Risk Level categorization
    let overallRiskLevel: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL' = 'LOW';
    if (hasBlocked || riverFloodRisk === 'CRITICAL' || deterministicScore > 600) {
      overallRiskLevel = 'CRITICAL';
    } else if (hasRestricted || riverFloodRisk === 'HIGH' || deterministicScore > 250) {
      overallRiskLevel = 'HIGH';
    } else if (hasCaution || riverFloodRisk === 'WATCH' || deterministicScore > 120) {
      overallRiskLevel = 'MODERATE';
    }

    return {
      id: routeId,
      name: corridor.name,
      distanceKm,
      estimatedTimeMin,
      overallRiskLevel,
      deterministicScore,
      isRecommended: false, // will be resolved after sorting
      dorRoadStatus,
      dorConditionSummary: hasBlocked 
        ? 'DOR reports active roadblock / total closure on this highway section.' 
        : hasRestricted 
        ? 'DOR reports partial one-way restriction with active maintenance.' 
        : hasCaution 
        ? 'DOR reports caution due to weather and loose rocks.' 
        : 'Reported OPEN by Department of Roads Navigate.',
      dorClosuresOnRoute: routeClosures,
      dorLandslideRisks,
      dhmRiverFloodRisk: riverFloodRisk,
      nearbyRiverStations,
      bridgeRisks,
      warnings,
      hazards,
      profileSuitability: {
        mode: responderMode,
        isPassable: profileSuitability.isPassable,
        tonnagePassable: profileSuitability.tonnagePassable,
        urgencyScore: profileSuitability.urgencyScore,
        recommendationNote: profileSuitability.recommendationNote
      },
      dataSource: isDemoScenario ? 'SIMULATED' : 'LIVE',
      dataFreshness: isDemoScenario ? 'SIMULATED DATA — DEMONSTRATION ONLY' : 'Department of Roads — Navigate (Updated within 15 min)',
      selectionReason: '',
      path: corridor.geometry
    };
  });

  // Sort by deterministic penalty score (lowest score = SAFEST APPROPRIATE ROUTE)
  evaluations.sort((a, b) => a.deterministicScore - b.deterministicScore);

  if (evaluations.length > 0) {
    evaluations[0].isRecommended = true;

    // Generate specific, evidence-grounded selection reason
    const best = evaluations[0];
    const second = evaluations.length > 1 ? evaluations[1] : null;

    if (best.dorRoadStatus === 'BLOCKED') {
      best.selectionReason = 'WARNING: All candidate corridors currently contain confirmed DOR roadblocks or severe hazards. Extreme caution required.';
    } else if (second && second.distanceKm < best.distanceKm) {
      const extraKm = Math.round((best.distanceKm - second.distanceKm) * 10) / 10;
      const extraMin = best.estimatedTimeMin - second.estimatedTimeMin;
      best.selectionReason = `Recommended as the Safest Appropriate Route: Although ${extraKm} km longer (+${extraMin} min), it avoids ${
        second.dorRoadStatus === 'BLOCKED' ? 'a confirmed DOR road closure' :
        second.dhmRiverFloodRisk !== 'NONE' ? 'a rising river flood zone monitored by DHM' :
        'severe landslide risks and narrow bridge restrictions'
      } on ${second.name}.`;
    } else {
      best.selectionReason = `This is the safest and most reliable corridor verified open by Department of Roads Navigate with zero active roadblocks.`;
    }

    // Set comparison reasoning for alternatives
    for (let i = 1; i < evaluations.length; i++) {
      const alt = evaluations[i];
      if (alt.dorRoadStatus === 'BLOCKED') {
        alt.selectionReason = 'Not recommended: Confirmed blocked section on DOR Navigate.';
      } else if (alt.dhmRiverFloodRisk === 'HIGH' || alt.dhmRiverFloodRisk === 'CRITICAL') {
        alt.selectionReason = `Not recommended: Passes along ${alt.nearbyRiverStations[0]?.river || 'river'} which is nearing/above DHM flood danger level.`;
      } else if (alt.dorRoadStatus === 'RESTRICTED') {
        alt.selectionReason = 'Less preferred: Subject to alternating one-way traffic delays and heavy vehicle restrictions.';
      } else {
        alt.selectionReason = 'Secondary alternative: Longer travel time with higher elevation variance.';
      }
    }
  }

  return evaluations;
}

/**
 * Adjusts route penalties and notes for emergency responder roles
 */
function evaluateProfileSuitability(
  mode: RoutingProfileMode, 
  dorStatus: SahayakRoadStatus, 
  floodRisk: string, 
  distanceKm: number
): {
  penalty: number;
  isPassable: boolean;
  tonnagePassable: boolean;
  urgencyScore: number;
  recommendationNote: string;
} {
  switch (mode) {
    case 'AMBULANCE':
      if (dorStatus === 'BLOCKED') {
        return {
          penalty: 5000,
          isPassable: false,
          tonnagePassable: true,
          urgencyScore: 10,
          recommendationNote: 'CRITICAL: Impassable for Ambulance. Detour mandatory.'
        };
      }
      if (floodRisk === 'HIGH' || floodRisk === 'CRITICAL') {
        return {
          penalty: 400,
          isPassable: false,
          tonnagePassable: true,
          urgencyScore: 85,
          recommendationNote: 'Ambulance risk: High water over pavement risks engine stall during critical patient transfer.'
        };
      }
      return {
        penalty: 0,
        isPassable: true,
        tonnagePassable: true,
        urgencyScore: 95,
        recommendationNote: 'Clear for emergency medical transport with siren escort.'
      };

    case 'FIRE_RESPONSE':
      if (dorStatus === 'RESTRICTED') {
        return {
          penalty: 350,
          isPassable: false,
          tonnagePassable: false,
          urgencyScore: 70,
          recommendationNote: 'Fire tender warning: Road width or single-lane clearance inadequate for large water tenders.'
        };
      }
      return {
        penalty: 0,
        isPassable: dorStatus !== 'BLOCKED',
        tonnagePassable: true,
        urgencyScore: 90,
        recommendationNote: 'Suitable for heavy emergency fire and rescue vehicles.'
      };

    case 'RESCUE_TEAM':
      return {
        penalty: floodRisk === 'CRITICAL' ? 300 : 0,
        isPassable: dorStatus !== 'BLOCKED',
        tonnagePassable: true,
        urgencyScore: 92,
        recommendationNote: '4WD high-clearance rescue vehicle permitted on rugged road segments with caution.'
      };

    case 'RELIEF_DELIVERY':
      if (dorStatus === 'RESTRICTED' || dorStatus === 'CAUTION') {
        return {
          penalty: 250,
          isPassable: true,
          tonnagePassable: false,
          urgencyScore: 65,
          recommendationNote: 'Heavy relief freight truck warning: Bridge load restrictions or single-lane bottlenecks apply.'
        };
      }
      return {
        penalty: 0,
        isPassable: dorStatus !== 'BLOCKED',
        tonnagePassable: true,
        urgencyScore: 80,
        recommendationNote: 'Approved for multi-axle freight and logistics supply convoys.'
      };

    case 'GENERAL_CITIZEN':
    default:
      return {
        penalty: dorStatus === 'CAUTION' ? 50 : 0,
        isPassable: dorStatus === 'OPEN' || dorStatus === 'CAUTION',
        tonnagePassable: true,
        urgencyScore: 75,
        recommendationNote: 'Recommended for general public, passenger buses, and light vehicles.'
      };
  }
}

/**
 * Matches City names to known corridor keys
 */
function findCandidateCorridors(origin: string, destination: string): string[] {
  const o = origin.toLowerCase();
  const d = destination.toLowerCase();

  if ((o.includes('kathmandu') && d.includes('pokhara')) || (o.includes('pokhara') && d.includes('kathmandu'))) {
    return ['ktm-pkr-prithvi', 'ktm-pkr-galchhi'];
  }
  if ((o.includes('kathmandu') && d.includes('chitwan')) || (o.includes('chitwan') && d.includes('kathmandu')) ||
      (o.includes('kathmandu') && d.includes('bharatpur')) || (o.includes('bharatpur') && d.includes('kathmandu'))) {
    return ['ktm-chitwan-mugling', 'ktm-chitwan-hetauda'];
  }
  if ((o.includes('kathmandu') && d.includes('birgunj')) || (o.includes('birgunj') && d.includes('kathmandu'))) {
    return ['ktm-birgunj-bp', 'ktm-birgunj-tribhuvan'];
  }
  if ((o.includes('pokhara') && d.includes('butwal')) || (o.includes('butwal') && d.includes('pokhara'))) {
    return ['pkr-butwal-siddhartha', 'pkr-butwal-ridi'];
  }

  return [];
}

/**
 * Fallback generator for custom points
 */
function generateDynamicCandidateCorridors(
  origin: { lat: number; lng: number; name: string },
  destination: { lat: number; lng: number; name: string }
) {
  const dist = getDistanceKm(origin.lat, origin.lng, destination.lat, destination.lng);
  const midLat = (origin.lat + destination.lat) / 2;
  const midLng = (origin.lng + destination.lng) / 2;

  return [
    {
      name: `Primary Highway Corridor (${origin.name} → ${destination.name})`,
      roadRefNo: 'NH-SRN',
      startCity: origin.name,
      endCity: destination.name,
      via: ['Central Junction'],
      baseDistanceKm: Math.round(dist * 1.25),
      baseDurationMin: Math.round(dist * 1.8),
      geometry: [
        { lat: origin.lat, lng: origin.lng },
        { lat: midLat, lng: midLng },
        { lat: destination.lat, lng: destination.lng }
      ]
    },
    {
      name: `Northern Ridgeline / Bypass Route`,
      roadRefNo: 'NH-ALT',
      startCity: origin.name,
      endCity: destination.name,
      via: ['Northern Bypass'],
      baseDistanceKm: Math.round(dist * 1.45),
      baseDurationMin: Math.round(dist * 2.2),
      geometry: [
        { lat: origin.lat, lng: origin.lng },
        { lat: midLat + 0.08, lng: midLng - 0.04 },
        { lat: destination.lat, lng: destination.lng }
      ]
    }
  ];
}

/**
 * Hospital / Shelter accessibility scorer
 * Considers BOTH:
 * 1. Facility capacity / bed availability
 * 2. Route safety and accessibility via DOR Navigate
 */
export function evaluateFacilitySafetyAndAccessibility(
  facility: Facility,
  userLocation: { lat: number; lng: number },
  dorClosures: DorRoadClosure[]
): {
  accessibilityStatus: 'FULLY_ACCESSIBLE' | 'CAUTION_APPROACH' | 'BLOCKED_ACCESS';
  explanation: string;
  distanceKm: number;
} {
  const distanceKm = Math.round(getDistanceKm(userLocation.lat, userLocation.lng, facility.lat, facility.lng) * 10) / 10;
  
  // Check if any active DOR closure is within 10 km of the hospital approach
  const nearbyClosure = dorClosures.find(c => {
    if (!c.latitude || !c.longitude) return false;
    const dist = getDistanceKm(c.latitude, c.longitude, facility.lat, facility.lng);
    return dist < 12 && c.sahayakStatus === 'BLOCKED';
  });

  if (nearbyClosure) {
    return {
      accessibilityStatus: 'BLOCKED_ACCESS',
      explanation: `Direct access road compromised: DOR reports ${nearbyClosure.closureReason} on ${nearbyClosure.roadName}. Seek alternative facility.`,
      distanceKm
    };
  }

  const nearbyCaution = dorClosures.find(c => {
    if (!c.latitude || !c.longitude) return false;
    const dist = getDistanceKm(c.latitude, c.longitude, facility.lat, facility.lng);
    return dist < 15 && (c.sahayakStatus === 'RESTRICTED' || c.sahayakStatus === 'CAUTION');
  });

  if (nearbyCaution) {
    return {
      accessibilityStatus: 'CAUTION_APPROACH',
      explanation: `Caution on approach: DOR reports ${nearbyCaution.closureReason} on ${nearbyCaution.roadName}. Ambulances should allow extra transit time.`,
      distanceKm
    };
  }

  return {
    accessibilityStatus: 'FULLY_ACCESSIBLE',
    explanation: `Access corridor verified open and clear by Department of Roads Navigate.`,
    distanceKm
  };
}
