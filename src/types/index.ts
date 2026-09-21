export interface Location {
  id: string;
  name: string;
  region: string;
  lat?: number;
  lng?: number;
}

export interface HourlyForecast {
  time: string;
  temp: number;
  rainProb: number;
}

export interface EnvironmentalSensor {
  id: string;
  type: 'River Level' | 'Soil Moisture' | 'Seismic Activity' | 'Rainfall (24h)' | 'Barometric Pressure' | string;
  value: string;
  status: 'NORMAL' | 'WARNING' | 'CRITICAL';
  trend: 'RISING' | 'FALLING' | 'STABLE';
}

export interface Weather {
  locationId: string;
  temp: number;
  condition: string;
  rainProb: number;
  humidity: number;
  windSpeed: number;
  hourly: { time: string; temp: number; rainProb: number }[];
  daily: { day: string; high: number; low: number; condition: string }[];
}

export interface WeatherSource {
  id: string;
  name: string;
  type: string;
  status: 'AVAILABLE' | 'DELAYED' | 'UNAVAILABLE' | 'CONFLICTING';
  timestamp: string;
  temp: number;
  rainProb: number;
  humidity: number;
  windSpeed: number;
  pressure?: number;
  precipitationMm?: number;
  precipitation24hMm?: number;
  weatherCode?: number;
  reliability: number; // 0 to 1
  url?: string;
  description?: string;
}

export interface FusedWeather {
  locationId: string;
  temp: number;
  condition: string;
  rainProb: number;
  humidity: number;
  windSpeed: number;
  pressure?: number;
  precipitationMm?: number;
  precipitation24hMm?: number;
  weatherCode?: number;
  rainfallCategory?: 'DRY' | 'LIGHT' | 'MODERATE' | 'HEAVY' | 'TORRENTIAL';
  dhmThresholdPercentage?: number;
  statusSummary?: string;
  agreement: 'HIGH' | 'MODERATE' | 'LOW' | 'CONFLICTING';
  confidence: number;
  sourcesUsed: number;
  lastUpdated: string;
}

export interface HazardRisk {
  id: string;
  locationId: string;
  hazard: 'Flood' | 'Landslide' | 'Extreme Rain' | 'Overall';
  score: number; // 0-100
  level: 'LOW' | 'MODERATE' | 'ELEVATED' | 'HIGH' | 'CRITICAL';
  confidence: number;
  factors: string[];
  explanation: string;
  recommendedMonitoring: string[];
}

export interface HistoricalEvent {
  id: string;
  name: string;
  locationId: string;
  date: string;
  actualOutcome: string;
  actualAffectedRegion: string;
  timeline: {
    timeOffset: string; // e.g., "T - 24 HOURS"
    sourceState: string;
    aiRiskLevel: string;
    aiPrediction: string;
  }[];
}

export interface Facility {
  id: string;
  name: string;
  type: 'Hospital' | 'Shelter' | 'Emergency Center' | 'Pharmacy' | 'Relief Center' | 'Blood Bank' | string;
  locationId: string;
  address: string;
  lat: number;
  lng: number;
  capacity: number;
  currentOccupancy: number;
  status: 'Operational' | 'Compromised' | 'Closed';
  services: string[];
  contact: string;
  // Extended fields for government hospital integration
  isRealSourceData?: boolean;
  isCached?: boolean;
  province?: string;
  district?: string;
  municipality?: string;
  allocatedBeds?: number;
  availableBeds?: number;
  occupancyPercentage?: number;
  source?: string;
  sourceUrl?: string;
  lastUpdated?: string | null;
  retrievedAt?: string;
  contactPerson?: string | null;
  hospitalType?: string; // 'Government (PUBLIC)' | 'Non-Government (NON-PUBLIC)'
  dataQuality?: 'GOOD' | 'PARTIAL' | 'STALE' | 'UNAVAILABLE';
  locationPrecision?: 'EXACT' | 'APPROXIMATE_DISTRICT' | 'UNAVAILABLE';
}

export interface GovernmentHospital {
  id: string;
  name: string;
  type: string; // 'Government (PUBLIC)' | 'Non-Government (NON-PUBLIC)'
  province: string; // e.g. "KOSHI PROVINCE", "BAGMATI PROVINCE"
  district: string; // e.g. "JHAPA", "KATHMANDU"
  municipality: string; // e.g. "BHADRAPUR MUNICIPALITY"
  address: string;
  totalBeds: number; // sanction/total bed capacity
  allocatedBeds: number; // free_beds under the Free Health program
  occupiedBeds: number; // total_beds_active
  availableBeds: number; // available free beds = Math.max(allocatedBeds - occupiedBeds, 0)
  totalAvailableBeds?: number; // totalBeds - occupiedBeds
  occupancyPercentage: number; // calculated occupancy percentage
  occupancyStatus: 'LOW' | 'MODERATE' | 'HIGH' | 'FULL';
  contactPerson: string | null;
  contactNumber: string | null;
  source: string; // 'Nepal Government — Ministry of Health and Food Safety Free Health Dashboard'
  sourceUrl: string; // 'https://freehealth.mohp.gov.np'
  lastUpdated: string | null;
  retrievedAt: string;
  isRealSourceData: boolean;
  isCached: boolean;
  dataQuality: 'GOOD' | 'PARTIAL' | 'STALE' | 'UNAVAILABLE';
  hasDiscrepancy: boolean;
  discrepancyNote?: string;
  lat?: number;
  lng?: number;
  locationPrecision: 'EXACT' | 'APPROXIMATE_DISTRICT' | 'UNAVAILABLE';
  distanceKm?: number | null;
}

export interface HospitalServiceSummary {
  totalHospitals: number;
  totalBeds: number;
  totalAllocatedFreeBeds: number;
  totalOccupiedBeds: number;
  totalAvailableBeds: number;
  averageOccupancy: number;
  hospitalsNearCapacity: number; // Occupancy >= 90% or status FULL
  publicCount: number;
  nonPublicCount: number;
  provincesCount: number;
  districtsCount: number;
  sourceStatus: 'LIVE' | 'CACHED' | 'UNAVAILABLE';
  sourceRetrievedAt: string;
}

export interface Route {
  id: string;
  name: string;
  locationId: string;
  status: 'OPEN' | 'CAUTION' | 'RESTRICTED' | 'BLOCKED' | 'UNKNOWN';
  condition: string;
  risk: 'LOW' | 'MODERATE' | 'HIGH';
  affectedBy: string;
  path: { lat: number; lng: number }[];
  lastUpdated: string;
  alternative?: string;
}

export type SourceCategory = 'OFFICIAL GOVERNMENT' | 'OFFICIAL EMERGENCY AGENCY' | 'WEATHER / ENVIRONMENTAL' | 'RECOGNIZED NEWS' | 'HUMANITARIAN ORGANIZATION' | 'LOCAL REPORT' | 'SOCIAL MEDIA' | 'UNKNOWN';

export type MisinfoVerdict = 'VERIFIED' | 'LIKELY TRUE' | 'UNVERIFIED' | 'CONFLICTING' | 'MISLEADING' | 'LIKELY FALSE' | 'OUTDATED';

export interface EvidenceSource {
  id: string;
  name: string;
  url?: string;
  publisher: string;
  publishedAt: string;
  retrievedAt: string;
  sourceType: SourceCategory;
  reliabilityLevel: 'HIGH' | 'MEDIUM' | 'LOW' | 'UNKNOWN';
  contentSummary: string;
  location?: string;
  relatedClaim: string;
  relationship: 'SUPPORTING' | 'CONTRADICTING' | 'NEUTRAL';
}

export interface ClaimAnalysis {
  id: string;
  originalText: string;
  extractedClaims: string[];
  sources: EvidenceSource[];
  verdict: MisinfoVerdict;
  confidence: number;
  explanation: string;
  supportingEvidence: string[];
  contradictingEvidence: string[];
  unknowns: string[];
  recommendedAction: string;
  humanReviewStatus: 'PENDING' | 'REVIEWED' | 'NOT_REQUIRED';
  createdAt: string;
  impactLevel?: 'HIGH' | 'MEDIUM' | 'LOW';
  spreadLevel?: 'HIGH' | 'MEDIUM' | 'LOW';
  affectedRegion?: string;
  responseRelevance?: 'CRITICAL' | 'RELEVANT' | 'LOW';
  debunkedBy?: string;
  factCheckUrl?: string;
  debunkDate?: string;
  viralContext?: string;
  isRealDebunk?: boolean;
  category?: 'EARTHQUAKE' | 'FLOOD' | 'AVIATION' | 'MEDICAL_RELIEF' | 'INFRASTRUCTURE' | 'GENERAL' | string;
}

export interface News {
  id: string;
  title: string;
  source: string;
  timestamp: string;
  locationId: string;
  category: string;
  severity: 'INFO' | 'WARNING' | 'CRITICAL';
  verified: boolean;
  verificationStatus?: MisinfoVerdict;
  verificationExplanation?: string;
  verificationLastUpdated?: string;
  summary: string;
  sourceUrl?: string;
  officialAgency?: string;
  district?: string;
  isRealBulletin?: boolean;
  isLiveWire?: boolean;
  link?: string;
  pubDate?: string;
  publisherLogo?: string;
  detectedTopics?: string[];
  latitude?: number;
  longitude?: number;
}

export interface CaseTimelineEvent {
  id: string;
  timestamp: string;
  action: string;
  description: string;
  actor: string;
  type: 'REPORT' | 'SIGHTING' | 'AI_ANALYSIS' | 'HUMAN_REVIEW' | 'STATUS_CHANGE' | 'NOTE';
}

export interface BaselinePriorityBreakdown {
  score: number; // 0 - 100
  tier: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  factors: string[];
  vulnerabilityScore: number;
  timeElapsedScore: number;
  hazardExposureScore: number;
  leadsScore: number;
}

export interface MissingPerson {
  id: string;
  name: string;
  age: number;
  gender: string;
  photo?: string;
  lastLocation: string; // kept for compatibility
  lastKnownLocation: string;
  locationId: string;
  lat?: number;
  lng?: number;
  lastSeen: string; // relative string e.g. "5 hours ago"
  lastSeenDateTime: string; // ISO or human readable timestamp
  description: string;
  clothing: string;
  physicalDescription?: string;
  reportedBy: string;
  reportSource: string;
  contactInfo: string;
  contactInformation: string;
  status: 'MISSING' | 'POSSIBLE MATCH' | 'FOUND' | 'SAFE' | 'HOSPITALIZED' | 'IN SHELTER' | 'DECEASED';
  urgency: 'HIGH' | 'MEDIUM' | 'LOW' | 'CRITICAL';
  baselinePriorityScore?: number;
  baselinePriorityBreakdown?: BaselinePriorityBreakdown;
  createdAt: string;
  updatedAt: string;
  disasterContext?: {
    incidentId?: string;
    incidentName?: string;
    affectedRegion?: string;
    hazardType?: string;
  };
  timeline: CaseTimelineEvent[];
  potentialMatchIds?: string[];
  verifiedMatchSightingId?: string;
  verificationDetails?: {
    verifiedBy: string;
    verifiedAt: string;
    notes: string;
    status: 'VERIFIED' | 'REJECTED';
  };
  // Extended fields for government rescue portal (OPMCM / NDRRMA) integration
  isRealSourceData?: boolean;
  isCached?: boolean;
  ndrrmaId?: number;
  importRef?: string;
  sourcePortal?: string;
  sourceUrl?: string;
  retrievedAt?: string;
  dataQuality?: 'GOOD' | 'PARTIAL' | 'STALE' | 'UNAVAILABLE';
  locationPrecision?: 'EXACT' | 'APPROXIMATE_DISTRICT' | 'UNAVAILABLE';
  rawType?: 'lost' | 'found';
  rawStatus?: string;
}

export interface GovernmentPersonReport {
  id: string;
  originalId: string;
  type: 'lost' | 'found';
  fullName: string;
  approximateAge?: string | number;
  gender: string; // 'MALE' | 'FEMALE' | 'UNKNOWN'
  locationText: string;
  eventAt?: string;
  description: string;
  images: string[];
  imageUrl?: string;
  thumbnail?: string;
  status: 'open' | 'resolved' | 'pending';
  source: string; // e.g. "ndrrma-rescued" or citizen
  sourcePortal: string; // "OPMCM Rasuwa Flood Rescue Portal"
  sourceUrl: string; // "https://rescue.opmcm.gov.np"
  importRef?: string;
  ndrrmaId?: number;
  isDuplicate?: boolean;
  verified?: boolean;
  createdAt: string;
  updatedAt: string;
  lat?: number;
  lng?: number;
  locationPrecision: 'EXACT' | 'APPROXIMATE_DISTRICT' | 'UNAVAILABLE';
  isRealSourceData: boolean;
  isCached: boolean;
  dataQuality: 'GOOD' | 'PARTIAL' | 'STALE' | 'UNAVAILABLE';
  retrievedAt: string;
}

export interface RescueServiceSummary {
  totalPersons: number;
  lostPersons: number;
  foundPersons: number;
  rescuedPersons: number;
  openPersons: number;
  resolvedPersons: number;
  pinnedPersons?: number;
  last24h: number;
  childrenMissing: number;
  elderlyMissing: number;
  openOver48h?: number;
  withoutContact?: number;
  resolutionRate: number;
  avgResolveHours?: number;
  topLocation?: { name: string; count: number };
  sourceStatus: 'LIVE' | 'CACHED' | 'UNAVAILABLE';
  sourceRetrievedAt: string;
  requestsTotal?: number;
  requestsOpen?: number;
  requestsCritical?: number;
  offersTotal?: number;
}

export interface Sighting {
  id: string;
  location: string;
  locationId?: string;
  lat?: number;
  lng?: number;
  timestamp: string;
  description: string;
  clothing?: string;
  photo?: string;
  source: string; // e.g., 'Citizen App', 'Shelter Staff', 'Rescue Unit 4'
  reporter: string;
  contactInfo?: string;
  relatedPersonCandidate?: string; // MissingPerson ID candidate
  status: 'UNREVIEWED' | 'UNDER_REVIEW' | 'POTENTIAL_MATCH' | 'VERIFIED' | 'REJECTED';
  confidence?: number;
  facilityType?: 'Hospital' | 'Shelter' | 'Field Camp' | 'Transit';
  facilityName?: string;
}

export interface CandidateMatch {
  id: string;
  missingPersonId: string;
  sightingId: string;
  similarityScore: number; // 0 - 100
  status: 'PENDING_REVIEW' | 'VERIFIED_MATCH' | 'REJECTED' | 'MORE_INFO_REQUESTED';
  matchAssessment: 'POTENTIAL_MATCH' | 'UNLIKELY_MATCH' | 'INCONCLUSIVE';
  supportingEvidence: string[];
  contradictingEvidence: string[];
  locationRelationship: string;
  timeRelationship: string;
  recommendation: string; // e.g., "HUMAN VERIFICATION REQUIRED"
  analyzedAt: string;
  analyzedBy: 'GEMINI_AI' | 'DETERMINISTIC_RULES';
  reviewedAt?: string;
  reviewedBy?: string;
  reviewNotes?: string;
}

export type SupplyCategory = 
  | 'Drinking Water' 
  | 'Food' 
  | 'Medicine' 
  | 'Blankets' 
  | 'Emergency Kits' 
  | 'Clothing' 
  | 'Hygiene Supplies' 
  | 'Rescue Equipment' 
  | 'Fuel' 
  | 'Shelter' 
  | 'Water' 
  | 'Other';

export type ResourceStatus = 'SUFFICIENT' | 'LOW' | 'SHORTAGE' | 'CRITICAL_SHORTAGE';

export interface ResourceThresholdConfig {
  sufficientRatio: number; // default 1.0 (>= 100% of demand)
  lowRatio: number;        // default 0.75 (>= 75% of demand)
  shortageRatio: number;   // default 0.40 (>= 40% of demand)
  criticalShortageRatio: number; // < 40% of demand
}

export interface Supply {
  id: string;
  name: string;
  category: SupplyCategory;
  available: number;
  required: number;
  allocated: number;
  remaining: number;
  incoming?: number;
  unit: string;
  leadTimeHours?: number;
  criticalThreshold?: number;
  locationId?: string;
  locationName?: string;
  warehouseId?: string;
  warehouseName?: string;
  lastUpdated?: string;
  source?: string;
  dataSourceType?: 'LIVE' | 'CACHED' | 'SIMULATED';
  status?: ResourceStatus;
}

export interface WarehouseDepot {
  id: string;
  name: string;
  location: string;
  address: string;
  lat: number;
  lng: number;
  status: 'OPERATIONAL' | 'CONGESTED' | 'ISOLATED';
  suppliesInStock: { supplyId: string; name: string; quantity: number; unit: string }[];
  contactPerson: string;
  contactPhone: string;
}

export interface LocationNeed {
  locationId: string;
  locationName: string;
  district: string;
  affectedPopulation: number;
  urgency: 'CRITICAL' | 'HIGH' | 'MODERATE';
  demands: {
    supplyName: string;
    required: number;
    delivered: number;
    unit: string;
  }[];
}

export interface DistributionPlan {
  id: string;
  destinationLocationId: string;
  destinationName: string;
  items: {
    supplyId: string;
    supplyName: string;
    quantity: number;
    unit: string;
  }[];
  urgency: 'CRITICAL' | 'HIGH' | 'MODERATE';
  transportMethod: '4WD High-Clearance Truck' | 'Heavy Freight Truck' | 'Helicopter Air-Bridge' | 'Foot Trekker / Pack Mule';
  routeSafety: 'CLEAR' | 'CAUTION_ALERT' | 'BLOCKED_BYPASS_REQUIRED';
  roadRisk: string;
  estimatedTransitTime: string;
  reasoning: string;
  confidence: number;
  status: 'RECOMMENDED' | 'APPROVED' | 'MODIFIED' | 'REJECTED' | 'IN_TRANSIT' | 'DELIVERED';
  timestamp: string;
  approvedBy?: string;
  approvedAt?: string;
}

export interface DeliveryRecord {
  id: string;
  planId: string;
  destination: string;
  itemsSummary: string;
  vehicleType: string;
  dispatchedFrom: string;
  driverOrLeader: string;
  contact: string;
  departureTime: string;
  eta: string;
  status: 'IN_TRANSIT' | 'DELIVERED' | 'DELAYED_ROAD_BLOCK';
}

export interface ShortagePrediction {
  id: string;
  resource: string;
  affectedLocations: string[];
  currentAvailable: number;
  burnRatePerDay: number;
  predictedShortageHours: number;
  predictedDepletionDate: string;
  confidence: number;
  factors: string[];
  recommendedPreparation: string;
  status: 'STABLE' | 'WARNING' | 'CRITICAL_FUTURE';
}

export type VolunteerStatus = 'AVAILABLE' | 'ASSIGNED' | 'DEPLOYED' | 'ON TASK' | 'RETURNING' | 'UNAVAILABLE' | 'STANDBY';
export type VerificationStatus = 'VERIFIED' | 'PENDING_VERIFICATION';

export interface Volunteer {
  id: string;
  name: string;
  locationId: string;
  skills: string[];
  training?: string;
  experience: string;
  availability: string;
  preferredArea: string;
  teamLeader: boolean;
  phone?: string;
  currentAssignment?: string;
  assignedTeamId?: string;
  teamSize?: number;
  equipment?: string[];
  status: VolunteerStatus;
  verificationStatus?: VerificationStatus;
  capabilities: {
    leadership: 'High' | 'Medium' | 'Low';
    medical: 'High' | 'Medium' | 'Low';
    logistics: 'High' | 'Medium' | 'Low';
    field: 'High' | 'Medium' | 'Low';
  };
}

export interface VolunteerTeam {
  id: string;
  name: string;
  leaderId: string;
  leaderName: string;
  contact: string;
  memberCount: number;
  skills?: string[];
  specialization: 'Medical Triage' | 'Search & Rescue (SAR)' | 'Logistics & Supply Convoy' | 'Field Camp & Shelter' | 'Communications & Drone' | string;
  equipment?: string[];
  operatingArea?: string;
  availability?: string;
  status: VolunteerStatus | 'STANDBY';
  verificationStatus?: VerificationStatus;
  experienceScore?: number;
  experienceSummary?: string;
  assignedLocationId?: string;
  assignedLocationName?: string;
  currentTask?: string;
  lat?: number;
  lng?: number;
}

export interface VolunteerAllocationRecommendation {
  id: string;
  candidateId: string;
  candidateName: string;
  isTeam: boolean;
  currentStatus: string;
  suggestedLocationId: string;
  suggestedLocationName: string;
  targetRole: string;
  requiredSkills?: string[];
  matchRationale: string;
  confidence: number;
  status: 'RECOMMENDED' | 'CONFIRMED' | 'REJECTED';
  reviewedBy?: string;
  reviewedAt?: string;
}

export interface CoverageGap {
  id: string;
  locationId: string;
  locationName: string;
  district: string;
  severity: 'CRITICAL' | 'HIGH' | 'MODERATE';
  needType: string;
  type?: string;
  requiredVolunteers: number;
  requiredPersonnel?: number;
  assignedVolunteers: number;
  assignedPersonnel?: number;
  gapCount: number;
  missingCriticalSkills: string[];
  missingSkillOrResource?: string;
  resourceShortageSummary: string;
  accessCondition: string;
  recommendedAction: string;
  lat?: number;
  lng?: number;
}

export interface DisasterAwareRouteOption {
  id: string;
  name: string;
  distanceKm: number;
  estimatedMinutes: number;
  dorRoadStatus: 'OPEN' | 'CAUTION' | 'RESTRICTED' | 'BLOCKED';
  floodExposure: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
  landslideRisk: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
  safetyPenaltyScore: number;
  isRecommended: boolean;
  recommendationReason: string;
  keyCheckpoints: string[];
}

export interface LogisticsDeliveryRoutePlan {
  id: string;
  sourceWarehouseId: string;
  sourceWarehouseName: string;
  destinationLocationId: string;
  destinationLocationName: string;
  resourcePayload: string;
  recommendedRouteId: string;
  routes: DisasterAwareRouteOption[];
}

export interface DistributionAuditLog {
  id: string;
  planId: string;
  timestamp: string;
  decisionMaker: string;
  action: 'APPROVED' | 'MODIFIED' | 'REJECTED';
  resourceName: string;
  originalRecommendation: string;
  humanModifications?: string;
  finalAllocation: string;
  status: string;
  notes?: string;
}

export interface Assessment {
  id: string;
  locationId: string;
  locationName?: string;
  type: string;
  assetCategory?: 'Building' | 'Road' | 'Bridge' | 'Power' | 'Water' | 'Hospital' | 'School' | 'Critical Infrastructure';
  severity: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
  damageLevel?: 'LOW' | 'MODERATE' | 'SEVERE' | 'DESTROYED';
  impact: string;
  status: 'PENDING' | 'VERIFIED' | 'RESOLVED';
  source: string;
  timestamp: string;
  confidenceScore?: number;
  lat?: number;
  lng?: number;
  beforeImageUrl?: string;
  afterImageUrl?: string;
  droneImageUrl?: string;
  aiAnalysis?: {
    detectedDamage: string;
    confidence: number;
    structuralIntegrity: 'STABLE' | 'UNSAFE' | 'COLLAPSED';
    hazardRisk: string;
    evidenceNotes: string[];
  };
  humanReview?: {
    status: 'PENDING' | 'CONFIRMED' | 'REJECTED' | 'MODIFIED';
    reviewedBy?: string;
    reviewedAt?: string;
    notes?: string;
  };
}

export interface RecoveryPriority {
  id: string;
  assetName: string;
  assetType: 'Road' | 'Bridge' | 'Hospital' | 'Power' | 'Water' | 'School' | 'Critical Infrastructure';
  location: string;
  locationId: string;
  priorityRank: 1 | 2 | 3;
  affectedPopulation: number;
  dependencyScore: number; // 1-100
  urgency: 'CRITICAL' | 'HIGH' | 'MEDIUM';
  accessibility: 'Accessible' | 'Single Lane / Caution' | 'Impassable / Severed';
  strategicImportance: string;
  estimatedCostNPR: string;
  status: 'ASSESSED' | 'PLANNING' | 'CREW_DISPATCHED' | 'RECONSTRUCTION';
}

export interface Incident {
  id: string;
  title: string;
  desc: string;
  description?: string;
  locationId: string;
  type: string;
  lat: number;
  lng: number;
  severity: number;
  peopleAffected: number;
  urgency: number;
  timeSensitivity: number;
  status: 'ACTIVE' | 'RESOLVED';
}

export interface Funding {
  id: string;
  source: string;
  amount: number;
  distributed: number;
  verified: boolean;
  date: string;
  totalPledgedNPR?: number;
  totalReceivedNPR?: number;
  remainingNPR?: number;
  verificationStatus?: 'VERIFIED_OFFICIAL' | 'AUDITED' | 'DEMO_DATA';
  designatedUse?: string;
  transparencyUrl?: string;
}

export interface AIPriorityItem {
  id: string;
  rank: 1 | 2 | 3 | 4;
  rankTier: 'CRITICAL' | 'HIGH' | 'MODERATE';
  title: string;
  locationId: string;
  locationName: string;
  problem: string;
  severity: 'CRITICAL' | 'HIGH' | 'MODERATE';
  urgency: 'IMMEDIATE' | 'HIGH' | 'MONITOR';
  affectedPeople?: number;
  confidence: number;
  whyIsThisRank: string;
  recommendedAction: string;
  dataSources: string[];
  status: 'ACTIVE_RECOMMENDATION' | 'APPROVED_DISPATCHED' | 'MODIFIED' | 'DISMISSED';
}

export interface AppNotification {
  id: string;
  title: string;
  desc: string;
  type: 'info' | 'warning' | 'critical';
  read: boolean;
  timestamp: string;
  category?: 'WEATHER' | 'HAZARD' | 'ROAD' | 'BRIDGE' | 'HOSPITAL' | 'MISSING_PERSON' | 'MISINFO' | 'LOGISTICS' | 'ASSESSMENT' | 'AI_PRIORITY';
  actionUrl?: string;
}

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
  condition: RoadCondition | string;
  hazards: string[];
  lastUpdated: string;
  source: string;
  sourceUrl?: string;
  confidence: number;
  closureReason?: string;
}

export interface Bridge {
  id: string;
  name: string;
  location: { lat: number; lng: number };
  roadId: string;
  status: RoadStatus;
  condition: RoadCondition | string;
  hazards: string[];
  lastUpdated: string;
  source: string;
  sourceUrl?: string;
  confidence: number;
  threatLevel?: string;
  river?: string;
  latitude?: number;
  longitude?: number;
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

// ==========================================
// HOSPITAL MISSING-PERSON MATCHING TYPES
// ==========================================

export type HospitalSex = 'MALE' | 'FEMALE' | 'OTHER' | 'UNKNOWN';

export type HospitalPatientStatus = 
  | 'UNPROCESSED' 
  | 'ANALYZED' 
  | 'MATCH_CONFIRMED' 
  | 'RESOLVED' 
  | 'NO_STRONG_MATCH';

export type HospitalMatchStatus = 
  | 'PENDING_HUMAN_REVIEW' 
  | 'CONFIRMED_POSSIBLE_MATCH' 
  | 'REJECTED' 
  | 'NEEDS_FURTHER_VERIFICATION';

export interface HospitalPatientRecord {
  id: string;
  mrn: string; // Medical Record / Reference Number
  hospitalName: string;
  hospitalId?: string;
  ward: string;
  admissionDateTime: string;
  foundLocation: string;
  approximateAge: string; // e.g. "25-30" or "32"
  sex: HospitalSex;
  approximateHeight?: string; // e.g. "5'9\" / 175 cm"
  clothingAppearance: string;
  distinguishingCharacteristics?: string;
  photo?: string;
  notes?: string;
  otherIdentifyingInfo?: string;
  submittedBy: string; // Staff member name & role
  submittedAt: string;
  status: HospitalPatientStatus;
  potentialMatchesCount: number;
  isSimulated: boolean;
}

export interface HospitalMatchResult {
  id: string;
  patientId: string;
  patientMrn: string;
  hospitalName: string;
  missingPersonId: string;
  missingPersonName?: string;
  foundLocation?: string;
  matchConfidence: number; // 0-100 (AI matching score / indicator)
  visualSimilarityScore: number; // 0-100
  demographicScore: number; // 0-100
  locationScore: number; // 0-100
  timeframeScore: number; // 0-100
  whyFlagged: string[]; // Explanatory reasons for the match
  contradictions?: string[]; // Potential contradictions/differences noted
  status: HospitalMatchStatus;
  reviewedBy?: string;
  reviewedAt?: string;
  reviewNotes?: string;
  createdAt: string;
  isSimulated: boolean;
}

export interface HospitalMatchAuditLog {
  id: string;
  timestamp: string;
  actor: string;
  role: string;
  action: 
    | 'PATIENT_SUBMITTED' 
    | 'BATCH_SUBMITTED' 
    | 'MATCH_ANALYZED' 
    | 'RECORD_VIEWED' 
    | 'MATCH_CONFIRMED' 
    | 'MATCH_REJECTED' 
    | 'FURTHER_VERIFICATION_REQUESTED';
  patientId: string;
  patientMrn: string;
  missingPersonId?: string;
  matchId?: string;
  details: string;
}

export interface HospitalMatchingNetworkStats {
  patientsSubmitted: number;
  aiMatchesFlagged: number;
  awaitingVerification: number;
  potentialMatchesConfirmed: number;
  isSimulated: boolean;
}

// ==========================================
// DHM RIVER WATCH & HYDROLOGY INTELLIGENCE
// ==========================================

export type DhmTrend = 'STEADY' | 'RISING' | 'FALLING' | 'UNKNOWN';

export type DhmOfficialStatus = 
  | 'Below Warning Level + Steady'
  | 'Below Warning Level + Rising'
  | 'Below Warning Level + Falling'
  | 'Above Warning Level + Steady'
  | 'Above Warning Level + Rising'
  | 'Above Warning Level + Falling'
  | 'Above Danger Level + Steady'
  | 'Above Danger Level + Rising'
  | 'Above Danger Level + Falling'
  | 'Normal'
  | 'Warning'
  | 'Danger'
  | 'Offline';

export type SahayakRiverRiskLevel = 'LOW' | 'WATCH' | 'HIGH' | 'CRITICAL';

export interface DhmHistoricalObservation {
  time: string;
  level: number;
}

export interface DhmRiverStation {
  id: number;
  stationIndex: string; // e.g. "591.8"
  name: string;
  riverName: string;
  basin: string;
  district: string;
  waterLevel: number | null; // in meters
  warningLevel: number | null; // in meters
  dangerLevel: number | null; // in meters
  trend: DhmTrend;
  dhmStatusRaw: string;
  dhmOfficialStatus: DhmOfficialStatus;
  latitude: number | null;
  longitude: number | null;
  elevation?: number | null;
  timestamp: string; // last measurement or poll time
  seriesId?: number;
  description?: string;
  
  // SAHAYAK Deterministic Risk Analysis Layer
  sahayakRisk: SahayakRiverRiskLevel;
  waterToWarningRatio: number | null; // waterLevel / warningLevel
  waterToDangerRatio: number | null; // waterLevel / dangerLevel
  clearanceToWarning: number | null; // warningLevel - waterLevel in meters
  clearanceToDanger: number | null; // dangerLevel - waterLevel in meters
  rateOfChangePerHour?: number | null;
  historicalLevels?: DhmHistoricalObservation[];
  
  // Contextual associations
  nearbyRoads?: string[];
  nearbyBridges?: string[];
  nearbyFacilities?: string[];
  riskExplanation?: string;
}

export interface DhmHydrologySummary {
  totalStations: number;
  activeStations: number;
  highOrCriticalCount: number;
  aboveWarningCount: number;
  aboveDangerCount: number;
  risingCount: number;
  steadyCount: number;
  fallingCount: number;
  lowRiskCount: number;
  watchRiskCount: number;
  highRiskCount: number;
  criticalRiskCount: number;
  dataSource: 'LIVE' | 'CACHED' | 'SIMULATED';
  lastUpdated: string;
  sourceAttribution: string;
  sourceUrl: string;
}

export interface RiverFloodPredictionInsight {
  stationId: number;
  stationName: string;
  riverName: string;
  basin: string;
  district: string;
  riskLevel: SahayakRiverRiskLevel;
  dhmOfficialStatus: DhmOfficialStatus;
  currentWaterLevel: number;
  warningLevel: number;
  dangerLevel: number;
  trend: DhmTrend;
  waterToWarningRatio: number;
  factors: string[];
  aiExplanation: string;
  recommendedActions: string[];
  affectedInfrastructure: {
    roads: string[];
    bridges: string[];
    facilities: string[];
  };
}

// ==========================================
// DEPARTMENT OF ROADS (DOR) NAVIGATE TYPES
// ==========================================

export type SahayakRoadStatus = 'OPEN' | 'CAUTION' | 'RESTRICTED' | 'BLOCKED' | 'UNKNOWN';

export type RoutingProfileMode = 
  | 'GENERAL_CITIZEN'
  | 'AMBULANCE'
  | 'FIRE_RESPONSE'
  | 'FIRE_TRUCK'
  | 'RESCUE_TEAM'
  | 'RESCUE_4X4'
  | 'RELIEF_DELIVERY'
  | 'RELIEF_CARGO';

export type RoadDataSourceType = 
  | 'DOR_DATA' 
  | 'VERIFIED_REPORT' 
  | 'VERIFIED_RESPONDER'
  | 'USER_REPORT' 
  | 'CITIZEN_REPORT'
  | 'AI_INFERENCE' 
  | 'SIMULATED_DATA';

export interface DorRoadClosure {
  id: string;
  roadName: string;
  roadRefNo: string; // e.g. "NH01", "NH03", "NH05"
  linkCode?: string; // e.g. "NH03-085"
  district: string;
  division?: string;
  closureReason: string; // e.g. "Landslide", "Flood", "Pavement Damage"
  closureType: string; // DOR raw: "FULL_CLOSURE", "PARTIAL_OPEN", "BLOCKED", "OPEN"
  sahayakStatus: SahayakRoadStatus;
  repairEta?: string; // e.g. "6 hours", "2 days"
  remarks?: string;
  contactPerson?: string;
  dateRoadblockStart?: string;
  dateRoadblockEndEstimated?: string;
  latitude: number | null;
  longitude: number | null;
  chainage?: string;
  images?: string[];
  lastUpdated: string;
  source: string; // "Department of Roads — Navigate"
  sourceUrl: string; // "https://navigate.dor.gov.np/app/dashboard"
  dataSource: 'LIVE' | 'CACHED' | 'SIMULATED';
  rawDorData?: any;
}

export interface DorBridge {
  id: string;
  bridgeIdCode: string; // e.g. "04-H001-017"
  bridgeName: string;
  roadName: string;
  district: string;
  river: string;
  chainageKm: number | null;
  lengthMeters: number | null;
  widthMeters?: string;
  spanLengthMeters: number | null;
  latitude: number | null;
  longitude: number | null;
  status: SahayakRoadStatus; // e.g. OPEN, CAUTION, BLOCKED
  conditionDescription?: string;
  closureReason?: string;
  lastUpdated?: string;
  source: string;
  dataSource: 'LIVE' | 'CACHED' | 'SIMULATED';
}

export interface DorRoadLink {
  roadRefNo: string; // e.g. "NH01"
  roadName: string; // e.g. "Existing East-West Highway"
  linkCode: string; // e.g. "NH01-034"
  linkName: string; // e.g. "Lothar-Tikauli (Gondrang)"
  district: string;
  division: string;
  status: SahayakRoadStatus;
  landslideRisk?: string; // "Very high risk", "High risk", "Moderate risk", "Low risk"
  flashFloodAdvisory?: string;
  geometry?: { lat: number; lng: number }[];
}

export interface DorLandslideRiskRecord {
  linkName: string;
  linkCode: string;
  totalRoadArea: number;
  highestRiskClass: string; // "Very high risk" | "High risk" | "Moderate risk" | "No risk"
  risks: {
    risk_class: string;
    risk_road_area: number;
  }[];
}

export interface DorRoadSummary {
  totalRoadLinks: number;
  totalRoadsMonitored?: number;
  totalClosures: number;
  activeRoadblocks: number; // BLOCKED / FULL_CLOSURE
  blockedRoads?: number;
  partialRestrictions: number; // RESTRICTED / CAUTION
  partiallyBlockedRoads?: number;
  openRoadsCount: number;
  passablePercentage?: number;
  totalBridges: number;
  bridgesWithRestrictions: number;
  highLandslideRiskLinks: number;
  flashFloodHighwayCount: number;
  dataSource: 'LIVE' | 'CACHED' | 'SIMULATED';
  lastUpdated: string;
  sourceAttribution: string;
  sourceUrl: string;
}

export interface DisasterAwareRouteEvaluation {
  id: string;
  name: string;
  distanceKm: number;
  estimatedTimeMin: number;
  overallRiskLevel: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
  deterministicScore: number; // composite penalty score
  isRecommended: boolean;
  
  // DOR Road conditions
  dorRoadStatus: SahayakRoadStatus;
  dorConditionSummary: string;
  dorClosuresOnRoute: DorRoadClosure[];
  dorLandslideRisks: string[];
  
  // DHM River Hydrology
  dhmRiverFloodRisk: 'NONE' | 'WATCH' | 'HIGH' | 'CRITICAL';
  nearbyRiverStations: {
    stationName: string;
    river: string;
    waterLevel: number;
    dangerLevel: number;
    distanceKm: number;
    threatLevel: string;
    trend: string;
  }[];
  
  // Bridge conditions
  bridgeRisks: {
    bridgeName: string;
    river: string;
    status: SahayakRoadStatus;
    distanceKm: number;
  }[];
  
  // Hazards & Warnings
  warnings: string[];
  hazards: string[];
  
  // Responder profile suitability
  profileSuitability: {
    mode: RoutingProfileMode;
    isPassable: boolean;
    tonnagePassable: boolean;
    urgencyScore: number;
    recommendationNote: string;
  };
  
  // Data Provenance
  dataSource: 'LIVE' | 'CACHED' | 'SIMULATED';
  dataFreshness: string;
  
  // Explanation
  selectionReason: string;
  aiExplanation?: string;
  
  // Geometry coordinates
  path: { lat: number; lng: number }[];
}

export interface CommunityRoadReport {
  id: string;
  locationName: string;
  district?: string;
  location?: { lat: number; lng: number };
  issueType: 'ROAD_BLOCKED' | 'LANDSLIDE' | 'FLOODED' | 'BRIDGE_DAMAGED' | 'TRAFFIC_OBSTRUCTION' | 'ROAD_REOPENED' | 'ROUGH_PASSABLE' | 'OTHER_HAZARD';
  passableFor?: string;
  description: string;
  sourceType: RoadDataSourceType;
  reporterName: string;
  reporterRole?: string; // e.g. "DOR Field Inspector", "Nepal Police Highway Patrol", "Red Cross Volunteer", "Citizen"
  contactInfo?: string;
  timestamp: string;
  photoUrl?: string;
  verifiedBy?: string;
  isConfirmed: boolean;
}


export interface DetailedLocationResourceDemand {
  locationId: string;
  locationName: string;
  district: string;
  lat: number;
  lng: number;
  affectedPopulation: number | null;
  populationSource: string;
  roadAccessibility: 'OPEN' | 'CAUTION' | 'RESTRICTED' | 'BLOCKED';
  dorRoadCondition: string;
  floodRisk: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
  landslideRisk: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
  priority: 'CRITICAL' | 'HIGH' | 'MODERATE' | 'LOW';
  shelterCount: number;
  hospitalCount: number;
  demands: {
    resourceName: string;
    category: string;
    required: number;
    available: number;
    incoming?: number;
    shortage: number;
    surplus: number;
    unit: string;
  }[];
}

export interface AIDistributionPlanProposal {
  id: string;
  resourceName: string;
  category: string;
  totalAvailable: number;
  emergencyReserve: number;
  unit: string;
  allocations: {
    locationId: string;
    locationName: string;
    recommendedQuantity: number;
    approvedQuantity: number;
    verifiedShortage: number;
    roadStatus: 'OPEN' | 'CAUTION' | 'RESTRICTED' | 'BLOCKED';
    priority: 'CRITICAL' | 'HIGH' | 'MODERATE';
    deliveryRoute: string;
  }[];
  reasoning: string;
  factors: {
    name: string;
    description: string;
  }[];
  confidence: number;
  status: 'PENDING_REVIEW' | 'APPROVED' | 'MODIFIED' | 'REJECTED';
  reviewedBy?: string;
  reviewedAt?: string;
  reviewNotes?: string;
}

// =========================================================================
// BIPAD CAPACITY & RESOURCES / COMMAND CENTER INTELLIGENCE
// Source: https://bipadportal.gov.np/risk-info/#/capacity-and-resources
// =========================================================================

export interface BipadHelipad {
  id: string;
  bipadId?: number;
  title: string;
  titleNe?: string | null;
  resourceType: 'helipad';
  district: string;
  province: string;
  lat: number;
  lng: number;
  altitudeM: number;
  surfaceType: string;
  status: 'OPERATIONAL' | 'WEATHER_ALERT' | 'RESTRICTED' | 'CLOSED';
  weatherFlightStatus: 'CLEAR_VFR' | 'MARGINAL' | 'BELOW_MINIMUMS';
  helicopterSuitability: string;
  fuelAvailable: boolean;
  nightLighting: boolean;
  windIndicator: boolean;
  emergencyLandingGrade: string;
  operatingAgency: string;
  focalPerson: string;
  contactPhone: string;
  sourceUrl: string;
}

export interface BipadEvacuationCenter {
  id: string;
  bipadId?: number;
  title: string;
  titleNe?: string | null;
  type: 'EVACUATION_CENTRE' | 'HUMANITARIAN_OPEN_SPACE';
  district: string;
  province: string;
  lat: number;
  lng: number;
  totalCapacity: number;
  currentOccupancy: number;
  availableCapacity: number;
  occupancyRate: number;
  status: 'AVAILABLE' | 'NEAR_CAPACITY' | 'AT_CAPACITY' | 'STANDBY';
  hasDrinkingWater: boolean;
  hasToilet: boolean;
  toiletCount: number;
  hasHandWashing: boolean;
  hasElectricity: boolean;
  hasSolarBackup: boolean;
  hasDisableFriendly: boolean;
  structureType: string;
  managedBy: string;
  description: string;
  contactPhone: string;
  sourceUrl: string;
}

export interface BipadCommunicationChannel {
  id: string;
  bipadId?: number;
  title: string;
  titleNe?: string | null;
  type: 'CELLULAR_TOWER' | 'VHF_RADIO' | 'HF_EMERGENCY_NET' | 'FM_BROADCAST' | 'SATELLITE_GATEWAY' | 'OPTICAL_FIBER';
  operator: 'NTC' | 'Ncell' | 'Nepal Police' | 'Armed Police Force' | 'Radio Nepal' | 'Emergency Satellite' | 'Government DEOC' | string;
  district: string;
  province: string;
  lat: number;
  lng: number;
  status: 'WORKING' | 'DEGRADED' | 'DOWN';
  outageReason: string | null;
  frequency: string | null;
  coverageRadiusKm: number;
  backupChannel: string;
  lastCheckIn: string;
  sourceUrl: string;
}

export interface BipadWarehouse {
  id: string;
  bipadId?: number;
  title: string;
  titleNe?: string | null;
  district: string;
  province: string;
  lat: number;
  lng: number;
  agency: string;
  supplies: {
    tarpaulins: number;
    familyRations: number;
    tents: number;
    blankets: number;
    waterPurificationKits: number;
    rescueBoats: number;
  };
  status: 'READY' | 'DEPLOYING' | 'LOW_STOCK';
  focalPerson: string;
  contactPhone: string;
  sourceUrl: string;
}

export interface BipadFireApparatus {
  id: string;
  bipadId?: number;
  title: string;
  titleNe?: string | null;
  district: string;
  province: string;
  lat: number;
  lng: number;
  equipmentType: string;
  operator: string;
  status: 'STANDBY' | 'DEPLOYED' | 'MAINTENANCE';
  contact: string;
  sourceUrl: string;
}

export interface CommandCenterDataPayload {
  source: string;
  sourceUrl: string;
  apiBase: string;
  lastUpdated: string;
  totals: {
    helipads: number;
    operationalHelipads: number;
    evacuationCenters: number;
    totalEvacuationCapacity: number;
    currentEvacueesSheltered: number;
    availableEvacuationSlots: number;
    communicationChannels: number;
    workingCommunications: number;
    downCommunications: number;
    degradedCommunications: number;
    warehouses: number;
    fireApparatusAndMachinery: number;
  };
  helipads: BipadHelipad[];
  evacuationCenters: BipadEvacuationCenter[];
  communications: BipadCommunicationChannel[];
  warehouses: BipadWarehouse[];
  fireApparatus: BipadFireApparatus[];
}

export interface CommandCenterAIGuidance {
  threatLevel: 'CRITICAL' | 'HIGH' | 'ELEVATED' | 'ROUTINE';
  sitrep: string;
  primaryDirectives: Array<{
    id: number;
    action: string;
    priority: 'IMMEDIATE' | 'HIGH' | 'ROUTINE';
    targetResource: string;
    department: string;
  }>;
  evacuationGuidance: {
    recommendedCenters: string[];
    totalCapacityReady: number;
    safeMovementCorridors: string[];
    warnings: string[];
  };
  helipadGuidance: {
    clearedHelipads: string[];
    weatherLimitations: string[];
    airliftViability: 'HIGH' | 'RESTRICTED' | 'GROUNDED';
    recommendedAircraft: string;
  };
  communicationsGuidance: {
    blackoutDistricts: string[];
    fallbackFrequencies: string[];
    urgentRestorationTargets: string[];
  };
  logisticsGuidance: {
    sourceWarehouses: string[];
    machineryDispatch: string[];
  };
  suggestedQuestions: string[];
}
