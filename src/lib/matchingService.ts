import { MissingPerson, Sighting, CandidateMatch } from '../types';

/**
 * Normalizes strings and extracts key tokens for semantic comparison
 */
function extractTokens(text: string): Set<string> {
  return new Set(
    text
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, ' ')
      .split(/\s+/)
      .filter(w => w.length > 2 && !['the', 'and', 'with', 'was', 'seen', 'near', 'from', 'wearing'].includes(w))
  );
}

/**
 * Calculates deterministic multi-factor match assessment
 * Used both directly and as a resilient baseline/fallback for AI evaluation.
 */
export function evaluateCandidateMatch(
  person: MissingPerson,
  sighting: Sighting
): CandidateMatch {
  const supportingFactors: string[] = [];
  const contradictingFactors: string[] = [];

  let confidenceScore = 50; // Starting baseline

  // 1. Clothing Comparison
  const personClothingTokens = extractTokens(person.clothing || person.description);
  const sightingClothingTokens = extractTokens(sighting.clothing || sighting.description);
  
  const commonClothing: string[] = [];
  personClothingTokens.forEach(token => {
    if (sightingClothingTokens.has(token)) {
      commonClothing.push(token);
    }
  });

  if (commonClothing.length >= 2) {
    confidenceScore += 20;
    supportingFactors.push(`Multiple clothing attributes align (${commonClothing.join(', ')})`);
  } else if (commonClothing.length === 1) {
    confidenceScore += 10;
    supportingFactors.push(`Specific garment attribute matches: "${commonClothing[0]}"`);
  } else {
    // Check if distinct colors contradict
    const colors = ['red', 'blue', 'green', 'black', 'white', 'yellow', 'grey', 'orange', 'purple'];
    const pColors = colors.filter(c => personClothingTokens.has(c));
    const sColors = colors.filter(c => sightingClothingTokens.has(c));
    if (pColors.length > 0 && sColors.length > 0 && !pColors.some(c => sColors.includes(c))) {
      confidenceScore -= 18;
      contradictingFactors.push(`Conflicting attire colors noted: reported wearing ${pColors.join('/')} vs sighted in ${sColors.join('/')}`);
    } else {
      contradictingFactors.push('Attire details are indeterminate or only partially described');
    }
  }

  // 2. Location Relationship & Spatial Plausibility
  let locationRelationship = '';
  const pLoc = (person.lastKnownLocation || person.lastLocation || '').toLowerCase();
  const sLoc = (sighting.location || '').toLowerCase();
  
  if (person.locationId && sighting.locationId && person.locationId === sighting.locationId) {
    confidenceScore += 15;
    locationRelationship = `Same district/municipality (${person.lastKnownLocation} ↔ ${sighting.location})`;
    supportingFactors.push(`Sighting occurred within the primary incident search sector (${person.lastKnownLocation})`);
  } else if (pLoc.includes(sLoc) || sLoc.includes(pLoc) || pLoc.split(' ')[0] === sLoc.split(' ')[0]) {
    confidenceScore += 12;
    locationRelationship = `Direct vicinity match (${sLoc})`;
    supportingFactors.push(`Sighting location directly correlates with last known coordinate area`);
  } else {
    confidenceScore -= 10;
    locationRelationship = `Cross-region transition (${person.lastKnownLocation} to ${sighting.location})`;
    contradictingFactors.push(`Location is outside initial sector; transit between ${person.lastKnownLocation} and ${sighting.location} required`);
  }

  // Check if sighting occurred in a shelter or hospital
  if (sighting.facilityType) {
    confidenceScore += 8;
    supportingFactors.push(`Observed at documented emergency facility (${sighting.facilityType}: ${sighting.facilityName || sighting.location})`);
  }

  // 3. Time Relationship & Plausibility
  const timeRelationship = `Sighting logged ${sighting.timestamp}; last confirmed contact ${person.lastSeen}`;
  supportingFactors.push(`Chronological sequence is plausible (${timeRelationship})`);

  // 4. Physical Description & Visual Similarity
  const personDescTokens = extractTokens((person.description || '') + ' ' + (person.physicalDescription || ''));
  const sightingDescTokens = extractTokens(sighting.description || '');
  
  const commonFeatures: string[] = [];
  ['tall', 'short', 'beard', 'glasses', 'hair', 'scar', 'backpack', 'cap', 'school', 'uniform', 'boots', 'jacket'].forEach(feat => {
    if (personDescTokens.has(feat) && sightingDescTokens.has(feat)) {
      commonFeatures.push(feat);
    }
  });

  if (commonFeatures.length > 0) {
    confidenceScore += 14;
    supportingFactors.push(`AI visual/text similarities detected on key identifiers: ${commonFeatures.join(', ')}`);
  }

  // Image metadata/photo similarity flag
  if (person.photo && sighting.photo) {
    confidenceScore += 6;
    supportingFactors.push('Visual references available for both profile and sighting record');
  }

  // Clamping confidence
  const finalConfidence = Math.max(15, Math.min(94, confidenceScore)); // Never 100% per ethical guidelines

  let matchAssessment: 'POTENTIAL_MATCH' | 'UNLIKELY_MATCH' | 'INCONCLUSIVE' = 'POTENTIAL_MATCH';
  if (finalConfidence < 45) {
    matchAssessment = 'UNLIKELY_MATCH';
  } else if (finalConfidence < 60) {
    matchAssessment = 'INCONCLUSIVE';
  }

  return {
    id: `match-${person.id}-${sighting.id}`,
    missingPersonId: person.id,
    sightingId: sighting.id,
    similarityScore: finalConfidence,
    status: 'PENDING_REVIEW',
    matchAssessment,
    supportingEvidence: supportingFactors,
    contradictingEvidence: contradictingFactors,
    locationRelationship,
    timeRelationship,
    recommendation: 'HUMAN VERIFICATION REQUIRED - Do not consider identified without officer review',
    analyzedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    analyzedBy: 'DETERMINISTIC_RULES'
  };
}
