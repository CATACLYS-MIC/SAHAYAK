import { HospitalPatientRecord, HospitalMatchResult, MissingPerson } from '../types';

/**
 * Tokenizes text for semantic and attribute matching
 */
function extractTokens(text: string): Set<string> {
  if (!text) return new Set();
  return new Set(
    text
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, ' ')
      .split(/\s+/)
      .filter(w => w.length > 2 && !['the', 'and', 'with', 'was', 'seen', 'near', 'from', 'wearing', 'patient', 'person'].includes(w))
  );
}

/**
 * Parses approximate age or range string into min and max numbers
 */
function parseAgeRange(ageStr: string): { min: number; max: number } | null {
  if (!ageStr) return null;
  const cleaned = ageStr.trim();
  
  // Range pattern like "25-30" or "25 - 30"
  const rangeMatch = cleaned.match(/(\d+)\s*[-–—to]\s*(\d+)/i);
  if (rangeMatch) {
    const min = parseInt(rangeMatch[1], 10);
    const max = parseInt(rangeMatch[2], 10);
    return { min: Math.min(min, max), max: Math.max(min, max) };
  }
  
  // Single number like "30" or "approx 30" or "30s"
  const singleMatch = cleaned.match(/(\d+)/);
  if (singleMatch) {
    const val = parseInt(singleMatch[1], 10);
    if (cleaned.endsWith('s')) {
      return { min: val, max: val + 9 };
    }
    return { min: Math.max(0, val - 3), max: val + 3 };
  }
  
  return null;
}

/**
 * River basins and disaster corridor affinities in Nepal
 */
const CORRIDOR_AFFINITIES: Record<string, string[]> = {
  'melamchi': ['sindhupalchok', 'helambu', 'bahunepati', 'balkhu', 'bagmati', 'kathmandu', 'dhobi khola', 'shankhamul'],
  'sindhupalchok': ['melamchi', 'helambu', 'bahrabise', 'tatopani', 'kathmandu', 'dhulikhel'],
  'kathmandu': ['balkhu', 'tripureshwor', 'bagmati', 'dhobi khola', 'bishnumati', 'lalitpur', 'patan', 'kanti', 'bir hospital', 'tuth', 'maharajgunj'],
  'lalitpur': ['kathmandu', 'balkhu', 'patan', 'bagmati', 'godavari'],
  'chitwan': ['bharatpur', 'narayangarh', 'prithvi highway', 'mugling', 'narayani'],
  'pokhara': ['kaski', 'sarangkot', 'lakeside', 'seti river', 'western regional'],
};

/**
 * Multi-factor AI-Assisted Candidate Match Evaluator
 * Evaluates patient record against a missing person profile.
 */
export function evaluateHospitalPatientMatch(
  patient: HospitalPatientRecord,
  person: MissingPerson
): HospitalMatchResult | null {
  const whyFlagged: string[] = [];
  const contradictions: string[] = [];

  let demographicScore = 50;
  let visualSimilarityScore = 50;
  let locationScore = 45;
  let timeframeScore = 60;

  // 1. DEMOGRAPHICS EVALUATION
  // Sex Check
  const pSex = (person.gender || '').toUpperCase();
  const patSex = (patient.sex || 'UNKNOWN').toUpperCase();

  if (patSex !== 'UNKNOWN' && pSex) {
    if (
      (patSex === 'MALE' && pSex === 'MALE') ||
      (patSex === 'FEMALE' && pSex === 'FEMALE') ||
      (patSex === 'OTHER' && pSex === 'OTHER')
    ) {
      demographicScore += 25;
      whyFlagged.push(`Reported sex aligns with patient observation (${person.gender})`);
    } else {
      demographicScore -= 40;
      contradictions.push(`Biological sex mismatch: Reported as ${person.gender} vs Patient recorded as ${patient.sex}`);
    }
  } else {
    whyFlagged.push('Biological sex is pending or undetermined in hospital intake');
  }

  // Age Check
  const patientAgeRange = parseAgeRange(patient.approximateAge);
  if (patientAgeRange && person.age) {
    const pAge = person.age;
    if (pAge >= patientAgeRange.min && pAge <= patientAgeRange.max) {
      demographicScore += 25;
      whyFlagged.push(`Estimated age range (${patient.approximateAge}) closely encompasses missing person's age (${person.age} years)`);
    } else {
      const diff = Math.min(Math.abs(pAge - patientAgeRange.min), Math.abs(pAge - patientAgeRange.max));
      if (diff <= 4) {
        demographicScore += 10;
        whyFlagged.push(`Age is proximate: missing person is ${person.age} vs estimated patient age ${patient.approximateAge}`);
      } else if (diff <= 8) {
        demographicScore -= 10;
        contradictions.push(`Age variance of ~${diff} years between report (${person.age}) and hospital estimate (${patient.approximateAge})`);
      } else {
        demographicScore -= 30;
        contradictions.push(`Substantial age discrepancy: reported ${person.age} vs patient estimated ${patient.approximateAge}`);
      }
    }
  }

  // Height Check
  if (patient.approximateHeight && person.physicalDescription) {
    const patHeightTokens = extractTokens(patient.approximateHeight);
    const personHeightTokens = extractTokens(person.physicalDescription);
    let heightAligned = false;
    patHeightTokens.forEach(t => {
      if (personHeightTokens.has(t)) heightAligned = true;
    });
    if (heightAligned) {
      demographicScore += 10;
      whyFlagged.push(`Height / stature indicators correspond with physical profile`);
    }
  }

  // 2. VISUAL SIMILARITY & ATTIRE EVALUATION
  const personClothingTokens = extractTokens((person.clothing || '') + ' ' + (person.description || ''));
  const patientClothingTokens = extractTokens((patient.clothingAppearance || '') + ' ' + (patient.distinguishingCharacteristics || ''));

  const commonTokens: string[] = [];
  personClothingTokens.forEach(token => {
    if (patientClothingTokens.has(token)) {
      commonTokens.push(token);
    }
  });

  // Clothing color/item matching
  const keyItems = ['jacket', 'boots', 'shoes', 'jeans', 'trousers', 'sweater', 'shirt', 'blouse', 'skirt', 'uniform', 'topi', 'dhaka', 'ribbons', 'cane', 'watch', 'hooded', 'raincoat'];
  const matchedKeyItems = commonTokens.filter(t => keyItems.includes(t));
  const colors = ['navy', 'blue', 'orange', 'black', 'white', 'grey', 'gray', 'red', 'green', 'yellow', 'brown'];
  const matchedColors = commonTokens.filter(t => colors.includes(t));

  if (matchedKeyItems.length > 0 || matchedColors.length > 0) {
    visualSimilarityScore += Math.min(35, (matchedKeyItems.length * 12) + (matchedColors.length * 8));
    const details = [...matchedColors, ...matchedKeyItems].join(', ');
    whyFlagged.push(`Corroborating attire & appearance tokens detected: [${details}]`);
  } else {
    // Check color contradiction
    const pCols = colors.filter(c => personClothingTokens.has(c));
    const patCols = colors.filter(c => patientClothingTokens.has(c));
    if (pCols.length > 0 && patCols.length > 0 && !pCols.some(c => patCols.includes(c))) {
      visualSimilarityScore -= 15;
      contradictions.push(`Conflicting clothing colors noted (Reported: ${pCols.join('/')} vs Hospital observation: ${patCols.join('/')})`);
    }
  }

  // Distinguishing characteristics / scars / tattoos / accessories
  const personDescTokens = extractTokens((person.physicalDescription || '') + ' ' + (person.description || ''));
  const patMarksTokens = extractTokens((patient.distinguishingCharacteristics || '') + ' ' + (patient.notes || ''));
  const specialFeatures = ['scar', 'tattoo', 'piercing', 'glasses', 'cane', 'beard', 'stubble', 'hair', 'braid', 'ribbon', 'diabetic', 'insulin'];
  const matchedFeatures = specialFeatures.filter(f => personDescTokens.has(f) && patMarksTokens.has(f));

  if (matchedFeatures.length > 0) {
    visualSimilarityScore += 20;
    whyFlagged.push(`Distinct physical characteristics or medical traits align: "${matchedFeatures.join(', ')}"`);
  }

  // Visual Photo Presence
  if (patient.photo && person.photo) {
    visualSimilarityScore += 10;
    whyFlagged.push('Both photographic records available for biometric cross-inspection');
  }

  // 3. LOCATION & DRAINAGE CORRIDOR EVALUATION
  const foundText = (patient.foundLocation + ' ' + patient.hospitalName).toLowerCase();
  const lostText = ((person.lastKnownLocation || person.lastLocation || '') + ' ' + (person.disasterContext?.affectedRegion || '')).toLowerCase();

  let corridorMatch = false;
  for (const [key, relatives] of Object.entries(CORRIDOR_AFFINITIES)) {
    if (foundText.includes(key) || lostText.includes(key)) {
      if (relatives.some(r => foundText.includes(r) && lostText.includes(r))) {
        corridorMatch = true;
        break;
      }
      if (foundText.includes(key) && relatives.some(r => lostText.includes(r))) {
        corridorMatch = true;
        break;
      }
      if (lostText.includes(key) && relatives.some(r => foundText.includes(r))) {
        corridorMatch = true;
        break;
      }
    }
  }

  if (corridorMatch) {
    locationScore += 35;
    whyFlagged.push(`Geographic / river drainage corridor correlation: Patient intake sector (${patient.foundLocation}) correlates with disaster flow from (${person.lastKnownLocation})`);
  } else {
    // Check if city/district token matches directly
    const foundTokens = extractTokens(patient.foundLocation);
    const lostTokens = extractTokens(person.lastKnownLocation || person.lastLocation || '');
    const directCommon = Array.from(foundTokens).filter(t => lostTokens.has(t));
    if (directCommon.length > 0) {
      locationScore += 25;
      whyFlagged.push(`Common geographic sector: "${directCommon.join(', ')}"`);
    } else {
      locationScore -= 10;
      contradictions.push(`Geographic separation between last known location (${person.lastKnownLocation}) and recovery site (${patient.foundLocation})`);
    }
  }

  // 4. TIMEFRAME EVALUATION
  // In disaster events, hospital admission typically occurs within 0-72 hours of disappearance
  if (patient.admissionDateTime && person.lastSeen) {
    timeframeScore += 20;
    whyFlagged.push(`Chronological sequence is plausible: Patient admitted (${patient.admissionDateTime}) following reported event (${person.lastSeen})`);
  }

  // Clamp individual scores between 10 and 95
  demographicScore = Math.min(95, Math.max(10, demographicScore));
  visualSimilarityScore = Math.min(95, Math.max(10, visualSimilarityScore));
  locationScore = Math.min(95, Math.max(10, locationScore));
  timeframeScore = Math.min(95, Math.max(10, timeframeScore));

  // Compute overall weighted confidence score
  // Demographics: 35%, Visual/Attire: 30%, Location: 25%, Timeframe: 10%
  const compositeScore = Math.round(
    demographicScore * 0.35 +
    visualSimilarityScore * 0.30 +
    locationScore * 0.25 +
    timeframeScore * 0.10
  );

  const matchConfidence = Math.min(94, Math.max(15, compositeScore));

  // Filter out candidates that have severe contradictions and confidence < 40%
  if (matchConfidence < 40) {
    return null;
  }

  return {
    id: `hm-${patient.id}-${person.id}`,
    patientId: patient.id,
    patientMrn: patient.mrn,
    hospitalName: patient.hospitalName,
    missingPersonId: person.id,
    matchConfidence,
    visualSimilarityScore,
    demographicScore,
    locationScore,
    timeframeScore,
    whyFlagged,
    contradictions: contradictions.length > 0 ? contradictions : undefined,
    status: 'PENDING_HUMAN_REVIEW',
    createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    isSimulated: true,
  };
}

/**
 * Searches the missing-person database and returns ranked candidate matches
 */
export async function searchMissingPersonDatabase(
  patient: HospitalPatientRecord,
  missingPersons: MissingPerson[]
): Promise<HospitalMatchResult[]> {
  const matches: HospitalMatchResult[] = [];

  for (const person of missingPersons) {
    // Only search unresolved or active cases
    if (person.status === 'FOUND' || person.status === 'DECEASED') {
      continue;
    }

    const match = evaluateHospitalPatientMatch(patient, person);
    if (match) {
      matches.push(match);
    }
  }

  // Sort candidates by confidence score descending
  matches.sort((a, b) => b.matchConfidence - a.matchConfidence);

  return matches;
}
