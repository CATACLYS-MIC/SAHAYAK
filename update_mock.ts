import fs from 'fs';

const mockFile = 'src/data/mock.ts';
let mockData = fs.readFileSync(mockFile, 'utf8');

const newMockData = `
import { ClaimAnalysis } from '../types';

export const MOCK_CLAIM_ANALYSES: ClaimAnalysis[] = [
  {
    id: 'ca-1',
    originalText: "Melamchi highway bridge collapsed due to flash floods, completely cutting off the region. Government ordering immediate evacuation of surrounding areas.",
    extractedClaims: [
      "Melamchi highway bridge has collapsed.",
      "Flash floods are the cause of the collapse.",
      "The region is completely cut off.",
      "Government ordered immediate evacuation of surrounding areas."
    ],
    sources: [
      {
        id: 'src-1',
        name: 'Ministry of Home Affairs (NEOC)',
        publisher: 'NEOC Official Portal',
        publishedAt: '2026-09-12T19:30:00Z',
        retrievedAt: '2026-09-12T19:45:00Z',
        sourceType: 'OFFICIAL EMERGENCY AGENCY',
        reliabilityLevel: 'HIGH',
        contentSummary: 'Confirmation of Melamchi highway bridge structural failure due to severe water levels. Road closed. Evacuation orders issued for Ward 4 and 5 riverside communities.',
        relatedClaim: 'Bridge collapse and evacuation orders.',
        relationship: 'SUPPORTING'
      },
      {
        id: 'src-2',
        name: 'Kathmandu Post',
        publisher: 'Kathmandu Post',
        publishedAt: '2026-09-12T19:35:00Z',
        retrievedAt: '2026-09-12T19:45:00Z',
        sourceType: 'RECOGNIZED NEWS',
        reliabilityLevel: 'HIGH',
        contentSummary: 'Melamchi bridge swept away by sudden flash flood. Local authorities coordinating evacuation.',
        relatedClaim: 'Flash floods cause, bridge collapse, evacuation.',
        relationship: 'SUPPORTING'
      }
    ],
    verdict: 'VERIFIED',
    confidence: 94,
    explanation: 'Multiple high-reliability official and journalistic sources corroborate both the bridge collapse and the government evacuation orders. The event is current and confirmed.',
    supportingEvidence: [
      'NEOC official situation report confirms structural failure and evacuation of Wards 4 and 5.',
      'Major news outlets reporting identical facts with field correspondents.'
    ],
    contradictingEvidence: [],
    unknowns: [
      'Exact time of complete structural failure.',
      'Full extent of the population successfully evacuated so far.'
    ],
    recommendedAction: 'FOLLOW_EVACUATION_ORDERS',
    humanReviewStatus: 'NOT_REQUIRED',
    createdAt: '2026-09-12T19:46:00Z',
    impactLevel: 'CRITICAL',
    spreadLevel: 'HIGH',
    responseRelevance: 'CRITICAL'
  },
  {
    id: 'ca-2',
    originalText: "Tribhuvan International Airport runways are completely flooded. All flights canceled for the next 48 hours!!",
    extractedClaims: [
      "Tribhuvan International Airport runways are completely flooded.",
      "All flights are canceled for the next 48 hours."
    ],
    sources: [
      {
        id: 'src-3',
        name: 'Civil Aviation Authority of Nepal',
        publisher: 'CAAN Official Twitter',
        publishedAt: '2026-09-12T19:00:00Z',
        retrievedAt: '2026-09-12T19:15:00Z',
        sourceType: 'OFFICIAL GOVERNMENT',
        reliabilityLevel: 'HIGH',
        contentSummary: 'Runway is clear and operational. Some domestic flights delayed due to visibility, but international flights are operating normally. No closure issued.',
        relatedClaim: 'Runway flooding and total cancellation.',
        relationship: 'CONTRADICTING'
      },
      {
        id: 'src-4',
        name: 'Viral Social Media Post',
        publisher: 'Unknown User',
        publishedAt: '2026-09-12T18:30:00Z',
        retrievedAt: '2026-09-12T19:15:00Z',
        sourceType: 'SOCIAL MEDIA',
        reliabilityLevel: 'LOW',
        contentSummary: 'Image of a flooded runway with text claiming it is TIA today.',
        relatedClaim: 'Runway flooded.',
        relationship: 'SUPPORTING'
      }
    ],
    verdict: 'LIKELY FALSE',
    confidence: 88,
    explanation: 'Official aviation authorities have directly refuted the claim, confirming runways are operational. The supporting evidence is limited to unverified social media posts likely using recycled imagery.',
    supportingEvidence: [
      'Unverified social media posts claiming flooding.'
    ],
    contradictingEvidence: [
      'Official statement from Civil Aviation Authority confirming operations.'
    ],
    unknowns: [
      'The origin of the fake image circulating.'
    ],
    recommendedAction: 'IGNORE_AND_WARN_OTHERS',
    humanReviewStatus: 'REVIEWED',
    createdAt: '2026-09-12T19:16:00Z',
    impactLevel: 'HIGH',
    spreadLevel: 'HIGH',
    responseRelevance: 'RELEVANT'
  },
  {
    id: 'ca-3',
    originalText: "Emergency alert: The Koshi Barrage has breached. Evacuate immediately!",
    extractedClaims: [
      "The Koshi Barrage has breached.",
      "Immediate evacuation is required."
    ],
    sources: [
      {
        id: 'src-5',
        name: 'Water Resources Department',
        publisher: 'Gov Portal',
        publishedAt: '2026-09-12T20:00:00Z',
        retrievedAt: '2026-09-12T20:10:00Z',
        sourceType: 'OFFICIAL GOVERNMENT',
        reliabilityLevel: 'HIGH',
        contentSummary: 'Water levels at Koshi Barrage are high (52 gates open), but structural integrity is completely intact. No breach has occurred.',
        relatedClaim: 'Barrage breached.',
        relationship: 'CONTRADICTING'
      },
      {
        id: 'src-6',
        name: 'Local Telegram Group',
        publisher: 'Forwarded Message',
        publishedAt: '2026-09-12T19:50:00Z',
        retrievedAt: '2026-09-12T20:10:00Z',
        sourceType: 'SOCIAL MEDIA',
        reliabilityLevel: 'LOW',
        contentSummary: 'Frantic messages claiming a breach and telling people to run.',
        relatedClaim: 'Barrage breached.',
        relationship: 'SUPPORTING'
      }
    ],
    verdict: 'MISLEADING',
    confidence: 95,
    explanation: 'While the water levels are genuinely dangerous (52 gates open), the claim of a structural breach is demonstrably false according to direct engineering reports. The warning induces unnecessary panic.',
    supportingEvidence: [
      'Rumors in local messaging apps.'
    ],
    contradictingEvidence: [
      'Direct engineering reports from the Water Resources Department.'
    ],
    unknowns: [],
    recommendedAction: 'CORRECT_MISINFORMATION',
    humanReviewStatus: 'NOT_REQUIRED',
    createdAt: '2026-09-12T20:11:00Z',
    impactLevel: 'CRITICAL',
    spreadLevel: 'MEDIUM',
    responseRelevance: 'CRITICAL'
  }
];
`;

mockData += newMockData;
fs.writeFileSync(mockFile, mockData);
console.log('Updated mockData.ts');
