export function getOccupancyStatus(current: number, capacity: number): 'LOW' | 'MODERATE' | 'HIGH' | 'FULL' {
  if (capacity <= 0) return 'FULL';
  const percentage = (current / capacity) * 100;
  
  if (percentage <= 50) return 'LOW';
  if (percentage <= 75) return 'MODERATE';
  if (percentage <= 90) return 'HIGH';
  return 'FULL';
}

export function getOccupancyPercentage(occupied: number, capacity: number): number {
  if (capacity <= 0) return 0;
  const pct = Math.round((occupied / capacity) * 100);
  return Math.min(100, Math.max(0, pct));
}

/**
 * Calculates geographic distance in kilometers using the Haversine formula
 * ONLY call when reliable, verified coordinates are available.
 */
export function calculateDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  return Math.round(distance * 10) / 10; // 1 decimal place
}

export function getOccupancyColor(status: 'LOW' | 'MODERATE' | 'HIGH' | 'FULL'): {
  bg: string;
  text: string;
  border: string;
  badgeVariant: 'success' | 'warning' | 'danger' | 'critical';
  fillColor: string;
} {
  switch (status) {
    case 'LOW':
      return {
        bg: 'bg-emerald-50 dark:bg-emerald-950/30',
        text: 'text-emerald-700 dark:text-emerald-400',
        border: 'border-emerald-200 dark:border-emerald-800',
        badgeVariant: 'success',
        fillColor: '#10b981',
      };
    case 'MODERATE':
      return {
        bg: 'bg-yellow-50 dark:bg-yellow-950/30',
        text: 'text-yellow-700 dark:text-yellow-400',
        border: 'border-yellow-200 dark:border-yellow-800',
        badgeVariant: 'warning',
        fillColor: '#eab308',
      };
    case 'HIGH':
      return {
        bg: 'bg-orange-50 dark:bg-orange-950/30',
        text: 'text-orange-700 dark:text-orange-400',
        border: 'border-orange-200 dark:border-orange-800',
        badgeVariant: 'danger',
        fillColor: '#f97316',
      };
    case 'FULL':
    default:
      return {
        bg: 'bg-red-50 dark:bg-red-950/30',
        text: 'text-red-700 dark:text-red-400',
        border: 'border-red-200 dark:border-red-800',
        badgeVariant: 'critical',
        fillColor: '#ef4444',
      };
  }
}

export function getShortageStatus(available: number, required: number): 'SURPLUS' | 'STABLE' | 'SHORTAGE' {
  if (required === 0) return 'SURPLUS';
  const ratio = available / required;
  
  // Within 10% is considered stable
  if (ratio >= 0.9 && ratio <= 1.1) return 'STABLE';
  if (ratio > 1.1) return 'SURPLUS';
  return 'SHORTAGE';
}

/**
 * DETERMINISTIC LOGISTICS ARITHMETIC
 * As mandated: Never use AI for simple arithmetic.
 * SHORTAGE = Math.max(0, Required - Available - Incoming)
 * SURPLUS = Math.max(0, Available - Required)
 */
export function calculateShortage(required: number, available: number, incoming: number = 0): number {
  return Math.max(0, Math.round(required - available - incoming));
}

export function calculateSurplus(available: number, required: number): number {
  return Math.max(0, Math.round(available - required));
}

export interface ResourceThresholds {
  sufficientRatio: number; // default 1.0 (100% met)
  lowRatio: number;        // default 0.75 (75% met)
  shortageRatio: number;   // default 0.40 (40% met)
}

export const DEFAULT_THRESHOLDS: ResourceThresholds = {
  sufficientRatio: 1.0,
  lowRatio: 0.75,
  shortageRatio: 0.40,
};

/**
 * DETERMINISTIC STATUS EVALUATOR
 * Evaluates resource availability against configurable threshold ratios:
 * 🟢 SUFFICIENT: Supply comfortably meets demand (available >= required)
 * 🟡 LOW: Supply is approaching required level (available+incoming >= 75% required)
 * 🟠 SHORTAGE: Demand exceeds supply (available+incoming < 75% required)
 * 🔴 CRITICAL SHORTAGE: Severe deficit relative to demand (< 40% required)
 */
export function evaluateResourceStatus(
  available: number,
  required: number,
  incoming: number = 0,
  thresholds: ResourceThresholds = DEFAULT_THRESHOLDS
): {
  status: 'SUFFICIENT' | 'LOW' | 'SHORTAGE' | 'CRITICAL_SHORTAGE';
  label: string;
  badgeVariant: 'success' | 'warning' | 'danger' | 'critical';
  colorHex: string;
  shortageAmount: number;
  surplusAmount: number;
  fulfillmentPct: number;
} {
  const shortage = calculateShortage(required, available, incoming);
  const surplus = calculateSurplus(available, required);
  const totalSupply = available + incoming;
  const fulfillmentPct = required > 0 ? Math.min(100, Math.round((totalSupply / required) * 100)) : 100;

  if (required <= 0 || available >= required * thresholds.sufficientRatio) {
    return {
      status: 'SUFFICIENT',
      label: 'Sufficient',
      badgeVariant: 'success',
      colorHex: '#10b981',
      shortageAmount: shortage,
      surplusAmount: surplus,
      fulfillmentPct
    };
  }

  if (totalSupply >= required * thresholds.lowRatio) {
    return {
      status: 'LOW',
      label: 'Low Supply',
      badgeVariant: 'warning',
      colorHex: '#eab308',
      shortageAmount: shortage,
      surplusAmount: surplus,
      fulfillmentPct
    };
  }

  if (totalSupply >= required * thresholds.shortageRatio) {
    return {
      status: 'SHORTAGE',
      label: 'Shortage',
      badgeVariant: 'danger',
      colorHex: '#f97316',
      shortageAmount: shortage,
      surplusAmount: surplus,
      fulfillmentPct
    };
  }

  return {
    status: 'CRITICAL_SHORTAGE',
    label: 'Critical Shortage',
    badgeVariant: 'critical',
    colorHex: '#ef4444',
    shortageAmount: shortage,
    surplusAmount: surplus,
    fulfillmentPct
  };
}

/**
 * DETERMINISTIC FUTURE SHORTAGE ESTIMATOR
 * Connects stock, burn-rate, and incoming deliveries
 * States "Insufficient data for reliable shortage prediction" when rates are invalid
 */
export function estimateTimeUntilShortage(
  currentStock: number,
  dailyConsumption: number,
  incomingSupply: number = 0
): {
  estimatedHours: number | null;
  estimatedDaysLabel: string;
  isDataSufficient: boolean;
  explanation: string;
} {
  if (dailyConsumption <= 0 || currentStock < 0) {
    return {
      estimatedHours: null,
      estimatedDaysLabel: 'Insufficient data for reliable shortage prediction.',
      isDataSufficient: false,
      explanation: 'Consumption rate or baseline inventory is non-positive or unverified.'
    };
  }

  const effectiveSupply = currentStock + incomingSupply;
  const daysRemaining = effectiveSupply / dailyConsumption;
  const hoursRemaining = Math.round(daysRemaining * 24);

  let label: string;
  if (daysRemaining < 1) {
    label = `${hoursRemaining} hours remaining`;
  } else if (daysRemaining < 2) {
    label = `1–2 days`;
  } else if (daysRemaining < 4) {
    label = `${Math.floor(daysRemaining)}–${Math.ceil(daysRemaining)} days`;
  } else {
    label = `~${Math.round(daysRemaining)} days`;
  }

  return {
    estimatedHours: hoursRemaining,
    estimatedDaysLabel: label,
    isDataSufficient: true,
    explanation: `Calculated from ${effectiveSupply.toLocaleString()} effective units at ${dailyConsumption.toLocaleString()}/day burn rate.`
  };
}

/**
 * DETERMINISTIC DISASTER-AWARE ROUTE SAFETY SCORER
 * Evaluates transport paths considering DOR highway road status, DHM river surge, and landslide exposure
 */
export function scoreDeliveryRouteSafety(
  distanceKm: number,
  dorStatus: 'OPEN' | 'CAUTION' | 'RESTRICTED' | 'BLOCKED',
  floodExposure: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL',
  landslideRisk: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL'
): {
  safetyPenaltyScore: number;
  isSafe: boolean;
  recommendationReason: string;
} {
  let penalty = 0;
  
  // DOR road status weight
  if (dorStatus === 'BLOCKED') penalty += 1000;
  else if (dorStatus === 'RESTRICTED') penalty += 80;
  else if (dorStatus === 'CAUTION') penalty += 30;

  // DHM flood exposure weight
  if (floodExposure === 'CRITICAL') penalty += 150;
  else if (floodExposure === 'HIGH') penalty += 60;
  else if (floodExposure === 'MODERATE') penalty += 25;

  // Landslide hazard weight
  if (landslideRisk === 'CRITICAL') penalty += 150;
  else if (landslideRisk === 'HIGH') penalty += 60;
  else if (landslideRisk === 'MODERATE') penalty += 25;

  const isSafe = penalty < 100 && dorStatus !== 'BLOCKED';

  let reason = '';
  if (dorStatus === 'BLOCKED') {
    reason = 'Passes through confirmed DOR road block; prohibited for heavy logistics convoy.';
  } else if (floodExposure === 'HIGH' || floodExposure === 'CRITICAL') {
    reason = 'Exposes convoy to high river surge / inundation risk despite shorter travel distance.';
  } else if (isSafe) {
    reason = 'Maintains low disaster exposure along verified open DOR highway corridors.';
  } else {
    reason = 'Moderate hazards present; requires high-clearance 4WD vehicle and escort.';
  }

  return {
    safetyPenaltyScore: penalty,
    isSafe,
    recommendationReason: reason
  };
}

/**
 * BASELINE PRIORITY ENGINE
 * Deterministic formula: severity (1-10) + peopleAffected (scaled) + urgency (1-10) + timeSensitivity (1-10)
 */
export function calculatePriorityScore(incident: { severity: number, peopleAffected: number, urgency: number, timeSensitivity: number }): number {
  // Normalize people affected to a 0-20 scale roughly
  const peopleScore = Math.min(20, (incident.peopleAffected / 500));
  
  // Base weights
  const severityWeight = incident.severity * 3; // Max 30
  const urgencyWeight = incident.urgency * 2.5; // Max 25
  const timeWeight = incident.timeSensitivity * 2.5; // Max 25
  
  const total = severityWeight + peopleScore + urgencyWeight + timeWeight;
  return Math.min(100, Math.round(total)); // Cap at 100
}

export function evaluateVolunteerQuiz(answers: Record<string, string>): {
  leadership: 'High' | 'Medium' | 'Low';
  medical: 'High' | 'Medium' | 'Low';
  logistics: 'High' | 'Medium' | 'Low';
  field: 'High' | 'Medium' | 'Low';
} {
  // Simple deterministic evaluation for demo purposes
  const score = { lead: 0, med: 0, log: 0, fld: 0 };
  
  if (answers.q1 === 'yes') score.lead += 2;
  if (answers.q2 === 'medical') score.med += 3;
  if (answers.q2 === 'logistics') score.log += 3;
  if (answers.q3 === 'yes') score.fld += 2;
  
  const mapScore = (s: number) => s >= 2 ? 'High' : s === 1 ? 'Medium' : 'Low';
  
  return {
    leadership: mapScore(score.lead),
    medical: mapScore(score.med),
    logistics: mapScore(score.log),
    field: mapScore(score.fld)
  };
}
