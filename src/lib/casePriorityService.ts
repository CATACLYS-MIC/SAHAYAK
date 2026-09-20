import { MissingPerson, BaselinePriorityBreakdown, HazardRisk } from '../types';

/**
 * Deterministic Baseline Case Priority Calculation
 * Evaluates urgency objectively based on standard emergency response protocols:
 * - Vulnerability (age < 12 or > 65, medical conditions) [Max 35 pts]
 * - Time Elapsed since last contact [Max 25 pts]
 * - Location Hazard Exposure (active flood, landslide alert level) [Max 25 pts]
 * - Availability of Leads / Sightings (inverted: lack of leads increases urgency) [Max 15 pts]
 */
export function calculateBaselineCasePriority(
  person: Partial<MissingPerson>,
  hazardRisks?: HazardRisk[]
): BaselinePriorityBreakdown {
  const factors: string[] = [];
  let vulnerabilityScore = 0;
  let timeElapsedScore = 0;
  let hazardExposureScore = 0;
  let leadsScore = 0;

  // 1. Age and Vulnerability (Max 35)
  const age = person.age ?? 30;
  if (age < 10) {
    vulnerabilityScore += 35;
    factors.push(`Extreme vulnerability: Child under 10 (Age ${age})`);
  } else if (age < 18) {
    vulnerabilityScore += 25;
    factors.push(`Elevated vulnerability: Minor (Age ${age})`);
  } else if (age >= 70) {
    vulnerabilityScore += 30;
    factors.push(`Elevated vulnerability: Senior citizen (Age ${age})`);
  } else if (age >= 60) {
    vulnerabilityScore += 20;
    factors.push(`Moderate vulnerability: Older adult (Age ${age})`);
  } else {
    vulnerabilityScore += 10;
  }

  // Check description for medical / emergency vulnerability clues
  const desc = (person.description || '').toLowerCase();
  if (desc.includes('medical') || desc.includes('diabetic') || desc.includes('insulin') || desc.includes('asthma') || desc.includes('injured')) {
    vulnerabilityScore = Math.min(35, vulnerabilityScore + 10);
    factors.push('Medical dependency or health risk noted in profile');
  }

  // 2. Time Elapsed (Max 25)
  const lastSeenStr = (person.lastSeen || person.lastSeenDateTime || '').toLowerCase();
  if (lastSeenStr.includes('just now') || lastSeenStr.includes('1 hour') || lastSeenStr.includes('2 hour') || lastSeenStr.includes('3 hour')) {
    timeElapsedScore = 20; // Critical golden window for search
    factors.push('Immediate response window: Missing < 4 hours');
  } else if (lastSeenStr.includes('24 hour') || lastSeenStr.includes('1 day') || lastSeenStr.includes('day')) {
    timeElapsedScore = 25; // Extended exposure without contact
    factors.push('Prolonged exposure window: Missing > 24 hours');
  } else if (lastSeenStr.includes('5 hour') || lastSeenStr.includes('6 hour') || lastSeenStr.includes('12 hour')) {
    timeElapsedScore = 22;
    factors.push('Active alert window: Missing 4-12 hours');
  } else {
    timeElapsedScore = 15;
  }

  // 3. Location Danger & Hazard Exposure (Max 25)
  const overallRisk = hazardRisks?.find(h => h.hazard === 'Overall')?.level;
  const locationHazard = person.disasterContext?.hazardType || '';
  
  if (overallRisk === 'CRITICAL' || locationHazard.toLowerCase().includes('flood') || locationHazard.toLowerCase().includes('landslide')) {
    hazardExposureScore = 25;
    factors.push(`High hazard zone: Region under active ${locationHazard || 'Critical'} alert`);
  } else if (overallRisk === 'HIGH' || overallRisk === 'ELEVATED') {
    hazardExposureScore = 18;
    factors.push('Elevated regional weather/landslide risk');
  } else {
    hazardExposureScore = 10;
  }

  // 4. Leads & Information Availability (Max 15)
  const leadsCount = (person.potentialMatchIds?.length || 0);
  if (leadsCount === 0) {
    leadsScore = 15; // Zero leads warrants higher active search priority
    factors.push('Unresolved trail: No confirmed leads or potential sightings yet');
  } else {
    leadsScore = 8;
    factors.push(`${leadsCount} potential sighting lead(s) currently being investigated`);
  }

  const rawTotal = vulnerabilityScore + timeElapsedScore + hazardExposureScore + leadsScore;
  const score = Math.max(15, Math.min(99, rawTotal));

  let tier: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' = 'LOW';
  if (score >= 80) tier = 'CRITICAL';
  else if (score >= 65) tier = 'HIGH';
  else if (score >= 40) tier = 'MEDIUM';

  return {
    score,
    tier,
    factors,
    vulnerabilityScore,
    timeElapsedScore,
    hazardExposureScore,
    leadsScore
  };
}
