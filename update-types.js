import fs from 'fs';
let file = 'src/types/index.ts';
let data = fs.readFileSync(file, 'utf8');

if (!data.includes('export interface Road {')) {
  data += `
// Disaster-Aware Roads & Routing
export type RoadStatus = 'OPEN' | 'CAUTION' | 'RESTRICTED' | 'BLOCKED' | 'UNKNOWN';
export type RoadCondition = 'GOOD' | 'DAMAGED' | 'SEVERELY_DAMAGED' | 'UNKNOWN';
export type RouteRiskLevel = 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL' | 'UNKNOWN';

export interface Road {
  id: string;
  name: string;
  startLocation: string; // e.g. Node ID or name
  endLocation: string; // e.g. Node ID or name
  geometry: { lat: number; lng: number }[]; // Path coordinates
  status: RoadStatus;
  condition: RoadCondition;
  hazards: string[];
  lastUpdated: string;
  source: string;
  sourceUrl?: string;
  confidence: number;
}

export interface Bridge {
  id: string;
  name: string;
  location: { lat: number; lng: number };
  roadId: string;
  status: RoadStatus;
  condition: RoadCondition;
  hazards: string[];
  lastUpdated: string;
  source: string;
  sourceUrl?: string;
  confidence: number;
}

export interface RouteAlternative {
  id: string;
  name: string;
  distance: number; // in km
  estimatedTime: number; // in minutes
  riskLevel: RouteRiskLevel;
  riskScore: number; // 0 - 100
  blockedSegments: string[];
  hazards: string[];
  confidence: number;
  path: { lat: number; lng: number }[];
  isRecommended: boolean;
  explanation: string;
}

export interface RoadReport {
  id: string;
  roadId?: string;
  bridgeId?: string;
  location: { lat: number; lng: number };
  locationName: string;
  issueType: 'FLOOD' | 'LANDSLIDE' | 'BRIDGE DAMAGE' | 'ROAD DAMAGE' | 'ACCIDENT' | 'BLOCKAGE' | 'OTHER';
  description: string;
  photo?: string;
  timestamp: string;
  status: 'UNVERIFIED' | 'VERIFIED' | 'CONFLICTING';
  reportedBy: string;
  isResponder: boolean;
}
`;
  fs.writeFileSync(file, data);
}
