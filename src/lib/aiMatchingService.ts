import { MissingPerson, Sighting, CandidateMatch } from '../types';
import { evaluateCandidateMatch } from './matchingService';

/**
 * AI-Assisted Candidate Match Service
 * Integrates with Google Gemini via server-side API proxy for nuanced qualitative reasoning
 * between disaster field sightings and missing-person profiles.
 *
 * NOTE: Strictly adheres to ethical AI principles:
 * - Never claims autonomous identification
 * - Always marks requiresHumanVerification: true
 * - Gracefully falls back to deterministic rule matching if API quota or key is not active
 */
export async function performAiAssistedMatch(
  person: MissingPerson,
  sighting: Sighting
): Promise<CandidateMatch> {
  const fallback = evaluateCandidateMatch(person, sighting);

  try {
    const res = await fetch('/api/missing-persons/ai-match', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ person, sighting })
    });

    if (!res.ok) {
      return {
        ...fallback,
        analyzedBy: 'DETERMINISTIC_RULES'
      };
    }

    const data = await res.json();
    if (!data?.success || !data.result) {
      return {
        ...fallback,
        analyzedBy: 'DETERMINISTIC_RULES'
      };
    }

    const parsed = data.result;

    // Validate structured output
    const confidence = typeof parsed.confidence === 'number' ? Math.min(94, Math.max(10, parsed.confidence)) : fallback.similarityScore;
    const supportingFactors = Array.isArray(parsed.supportingFactors) && parsed.supportingFactors.length > 0 
      ? parsed.supportingFactors 
      : fallback.supportingEvidence;
    const contradictingFactors = Array.isArray(parsed.contradictingFactors)
      ? parsed.contradictingFactors
      : fallback.contradictingEvidence;

    return {
      id: `match-${person.id}-${sighting.id}`,
      missingPersonId: person.id,
      sightingId: sighting.id,
      similarityScore: confidence,
      status: 'PENDING_REVIEW',
      matchAssessment: parsed.matchAssessment || fallback.matchAssessment,
      supportingEvidence: supportingFactors,
      contradictingEvidence: contradictingFactors,
      locationRelationship: parsed.locationRelationship || fallback.locationRelationship,
      timeRelationship: parsed.timeRelationship || fallback.timeRelationship,
      recommendation: 'HUMAN VERIFICATION REQUIRED',
      analyzedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      analyzedBy: 'GEMINI_AI'
    };
  } catch {
    return {
      ...fallback,
      analyzedBy: 'DETERMINISTIC_RULES'
    };
  }
}

