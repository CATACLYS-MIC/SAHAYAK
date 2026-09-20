import { ClaimAnalysis, EvidenceSource } from '../types';

export async function submitClaimForAnalysis(
  text: string, 
  providedSources: EvidenceSource[] = [],
  mode: 'both' | 'nepalfactcheck' | 'web' = 'both'
): Promise<ClaimAnalysis> {
  try {
    const response = await fetch('/api/analyze-claim', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ text, providedSources, mode })
    });

    if (!response.ok) {
      throw new Error(`API returned status ${response.status}`);
    }

    const result = await response.json();

    if (result.error) {
       throw new Error(result.error);
    }

    return {
      id: result.id || `ca-${Date.now()}`,
      originalText: text,
      extractedClaims: result.extractedClaims || [text],
      sources: (result.sourcesUsed || result.sources || []).map((s: any, i: number) => ({
        id: `src-${Date.now()}-${i}`,
        name: s.name || 'Web Source',
        url: s.url,
        publisher: s.name || 'Web',
        publishedAt: new Date().toISOString(),
        retrievedAt: new Date().toISOString(),
        sourceType: s.reliabilityLevel === 'HIGH' ? 'OFFICIAL GOVERNMENT' : 'LOCAL REPORT',
        reliabilityLevel: s.reliabilityLevel || 'MEDIUM',
        contentSummary: s.contentSummary || '',
        relatedClaim: text.substring(0, 50),
        relationship: s.relationship || 'NEUTRAL'
      })),
      verdict: result.verdict || 'UNVERIFIED',
      confidence: result.confidence || 0,
      explanation: result.explanation || 'Unable to generate an explanation.',
      supportingEvidence: result.supportingEvidence || [],
      contradictingEvidence: result.contradictingEvidence || [],
      unknowns: result.unknowns || [],
      recommendedAction: result.recommendedAction || 'WAIT_FOR_OFFICIAL_CONFIRMATION',
      debunkedBy: result.debunkedBy,
      factCheckUrl: result.factCheckUrl,
      isRealDebunk: result.isRealDebunk,
      searchMode: result.searchMode || mode,
      searchSourcesCount: result.searchSourcesCount,
      sourcesUsed: result.sourcesUsed,
      humanReviewStatus: result.humanReviewStatus || 'REVIEWED',
      createdAt: result.createdAt || new Date().toISOString()
    };
  } catch (error) {
    console.error("Misinfo Analysis Error:", error);
    return {
      id: `ca-fallback-${Date.now()}`,
      originalText: text,
      extractedClaims: [text],
      sources: providedSources,
      verdict: 'UNVERIFIED',
      confidence: 0,
      explanation: 'Could not connect to live fact-checking sources. Please verify with official portals (bipadportal.gov.np, nepalfactcheck.org).',
      supportingEvidence: [],
      contradictingEvidence: [],
      unknowns: ['Network connection to verification service interrupted.'],
      recommendedAction: 'WAIT_FOR_OFFICIAL_CONFIRMATION',
      humanReviewStatus: 'PENDING',
      createdAt: new Date().toISOString()
    };
  }
}

function generateDeterministicFallback(text: string, sources: EvidenceSource[]): ClaimAnalysis {
  let verdict: ClaimAnalysis['verdict'] = 'UNVERIFIED';
  let explanation = 'No evidence has been analyzed yet. Please provide sources or wait for official confirmation.';
  
  const supporting = sources.filter(s => s.relationship === 'SUPPORTING');
  const contradicting = sources.filter(s => s.relationship === 'CONTRADICTING');
  
  if (supporting.length > 0 && contradicting.length === 0) {
    verdict = 'LIKELY TRUE';
    explanation = 'Supporting evidence exists, but has not been deeply analyzed by AI.';
  } else if (contradicting.length > 0 && supporting.length === 0) {
    verdict = 'LIKELY FALSE';
    explanation = 'Contradicting evidence exists. This claim appears false.';
  } else if (contradicting.length > 0 && supporting.length > 0) {
    verdict = 'CONFLICTING';
    explanation = 'There are conflicting reports regarding this claim.';
  }
  
  return {
    id: `ca-fallback-${Date.now()}`,
    originalText: text,
    extractedClaims: [text],
    sources,
    verdict,
    confidence: 50,
    explanation,
    supportingEvidence: supporting.map(s => s.contentSummary),
    contradictingEvidence: contradicting.map(s => s.contentSummary),
    unknowns: ['Detailed AI analysis unavailable.'],
    recommendedAction: 'WAIT_FOR_OFFICIAL_CONFIRMATION',
    humanReviewStatus: 'PENDING',
    createdAt: new Date().toISOString()
  };
}
