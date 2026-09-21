import React, { createContext, useContext, useState, ReactNode, useMemo, useEffect, useCallback } from 'react';
import { 
  Location, Weather, Facility, Route, News, MissingPerson, Sighting, CandidateMatch, CaseTimelineEvent,
  Supply, Volunteer, Assessment, Incident, AppNotification, VolunteerTeam, VolunteerStatus, CoverageGap, DistributionAuditLog, DetailedLocationResourceDemand, AIDistributionPlanProposal, LogisticsDeliveryRoutePlan,
  WeatherSource, FusedWeather, HazardRisk, HistoricalEvent, HourlyForecast, EnvironmentalSensor,
  GovernmentHospital, HospitalServiceSummary,
  GovernmentPersonReport, RescueServiceSummary,
  Road, Bridge, RoadReport,
  HospitalPatientRecord, HospitalMatchResult, HospitalMatchAuditLog, HospitalMatchingNetworkStats,
  DhmRiverStation, DhmHydrologySummary,
  DorRoadClosure, DorBridge, DorRoadLink, DorRoadSummary, DisasterAwareRouteEvaluation, RoutingProfileMode, CommunityRoadReport
} from '../types';
import * as mockData from '../data/mock';
import { 
  MOCK_HOSPITAL_PATIENTS, 
  MOCK_HOSPITAL_MATCHES, 
  MOCK_HOSPITAL_AUDIT_LOGS 
} from '../data/mockHospitalPatients';
import { 
  INITIAL_DOR_ROAD_LINKS, 
  INITIAL_DOR_CLOSURES, 
  INITIAL_DOR_BRIDGES, 
  INITIAL_DOR_SUMMARY, 
  INITIAL_COMMUNITY_REPORTS 
} from '../data/mockDorData';
import { fetchDorRoadData, fetchDorBridges } from './dorRoadService';
import { searchMissingPersonDatabase } from './hospitalMatchingEngine';
import { fuseWeatherSources, calculateHazardRisks } from './intelligence';
import { fetchLiveWeatherSources, fetchLiveForecast } from './weatherApi';
import { calculateBaselineCasePriority } from './casePriorityService';
import { performAiAssistedMatch } from './aiMatchingService';
import { fetchGovernmentHospitals } from './hospitalDataService';
import { fetchRescueReports, FetchRescueOptions } from './rescueDataService';
import { DhmHydrologyService } from './dhmHydrologyService';
import { useAuth } from './auth';

import { 
  MOCK_LOGISTICS_SUPPLIES, MOCK_EXTENDED_TEAMS, MOCK_COVERAGE_GAPS,
  MOCK_LOCATION_RESOURCE_DEMANDS, MOCK_AI_DISTRIBUTION_PLANS, MOCK_LOGISTICS_DELIVERY_ROUTES,
  MOCK_DISTRIBUTION_AUDIT_LOGS
} from '../data/logisticsData';

interface AppState {
  currentLocationId: string;
  currentLocation: Location;
  userGeolocation: { lat: number; lng: number } | null;
  locations: Location[];
  weather: Record<string, Weather>;
  facilities: Facility[];
  governmentHospitals: GovernmentHospital[];
  hospitalSummary: HospitalServiceSummary | null;
  hospitalLoading: boolean;
  hospitalError: string | null;
  hospitalLastRetrieved: string | null;
  hospitalIsCached: boolean;
  hospitalSourceStatus: 'LIVE' | 'CACHED' | 'UNAVAILABLE';
  refreshGovernmentHospitals: () => Promise<void>;
  
  // Real Government Missing & Rescued Person Intelligence (OPMCM / NDRRMA)
  governmentRescueReports: GovernmentPersonReport[];
  rescueSummary: RescueServiceSummary | null;
  rescueLoading: boolean;
  rescueError: string | null;
  rescueLastRetrieved: string | null;
  rescueIsCached: boolean;
  rescueSourceStatus: 'LIVE' | 'CACHED' | 'UNAVAILABLE';
  refreshGovernmentRescueReports: (options?: FetchRescueOptions) => Promise<void>;

  routes: Route[];
  roads: Road[];
  bridges: Bridge[];
  roadReports: RoadReport[];
  setRoads: (roads: Road[]) => void;
  setBridges: (bridges: Bridge[]) => void;
  updateRoad: (id: string, updates: Partial<Road>) => void;
  updateBridge: (id: string, updates: Partial<Bridge>) => void;
  addRoadReport: (report: RoadReport) => void;
  news: News[];
  liveNews: News[];
  liveNewsLoading: boolean;
  liveNewsError: string | null;
  liveNewsLastSynced: string | null;
  refreshLiveNews: (category?: string, query?: string) => Promise<void>;
  supplies: Supply[];
  teams: VolunteerTeam[];
  coverageGaps: CoverageGap[];
  resourceDemands: DetailedLocationResourceDemand[];
  distributionPlans: AIDistributionPlanProposal[];
  addDistributionPlan: (plan: AIDistributionPlanProposal) => void;
  updateDistributionPlan: (id: string, updates: Partial<AIDistributionPlanProposal>) => void;
  deliveryRoutes: LogisticsDeliveryRoutePlan[];
  distributionAuditLogs: DistributionAuditLog[];
  missingPersons: MissingPerson[];
  sightings: Sighting[];
  candidateMatches: CandidateMatch[];
  userRole: 'PUBLIC' | 'RESPONDER';
  volunteers: Volunteer[];
  assessments: Assessment[];
  incidents: Incident[];
  notifications: AppNotification[];
  
  // Intelligent Weather Fields
  demoScenarioStep: number;
  weatherSources: WeatherSource[];
  fusedWeather: FusedWeather;
  hazardRisks: HazardRisk[];
  hourlyForecast: HourlyForecast[];
  environmentalSensors: EnvironmentalSensor[];
  
  setCurrentLocationId: (id: string) => void;
  setUserRole: (role: 'PUBLIC' | 'RESPONDER') => void;
  setDemoScenarioStep: (step: number) => void;
  addMissingPerson: (person: Omit<MissingPerson, 'id' | 'createdAt' | 'updatedAt' | 'timeline'>) => MissingPerson;
  addSighting: (sighting: Omit<Sighting, 'id'>) => Promise<CandidateMatch | null>;
  confirmMatch: (matchId: string, notes?: string, verifiedStatus?: 'FOUND' | 'SAFE' | 'HOSPITALIZED' | 'IN SHELTER') => void;
  rejectMatch: (matchId: string, reason?: string) => void;
  requestMoreInfo: (matchId: string, notes?: string) => void;
  triggerMatchAnalysis: (personId: string, sightingId: string) => Promise<CandidateMatch>;
  addVolunteer: (volunteer: Volunteer) => void;
  addAssessment: (assessment: Assessment) => void;
  markNotificationRead: (id: string) => void;
  registerTeam: (team: Omit<VolunteerTeam, 'id'> | Partial<VolunteerTeam>) => VolunteerTeam;
  assignTeamArea: (teamId: string, areaId: string, areaName: string, task?: string, coords?: { lat: number; lng: number }) => void;
  updateTeamStatus: (teamId: string, status: VolunteerStatus | 'STANDBY') => void;
  resetTeamsToDefault: () => void;

  // Hospital Missing-Person Matching Network
  hospitalPatients: HospitalPatientRecord[];
  hospitalMatches: HospitalMatchResult[];
  hospitalAuditLogs: HospitalMatchAuditLog[];
  hospitalMatchingStats: HospitalMatchingNetworkStats;
  hospitalAccessRole: 'HOSPITAL_STAFF' | 'AUTHORITY_RESPONDER' | 'PUBLIC';
  setHospitalAccessRole: (role: 'HOSPITAL_STAFF' | 'AUTHORITY_RESPONDER' | 'PUBLIC') => void;
  submitHospitalPatient: (patient: Omit<HospitalPatientRecord, 'id' | 'status' | 'potentialMatchesCount' | 'isSimulated' | 'submittedAt'>) => Promise<{ patient: HospitalPatientRecord; matches: HospitalMatchResult[] }>;
  submitHospitalPatientBatch: (batch: Array<Omit<HospitalPatientRecord, 'id' | 'status' | 'potentialMatchesCount' | 'isSimulated' | 'submittedAt'>>, onProgress?: (step: string, percent: number) => void) => Promise<{ processedCount: number; matchesFound: number }>;
  reviewHospitalMatch: (matchId: string, decision: 'CONFIRMED_POSSIBLE_MATCH' | 'REJECTED' | 'NEEDS_FURTHER_VERIFICATION', notes?: string, reviewerName?: string) => void;
  resetHospitalDemoData: () => void;

  // Nepal DHM River Watch Hydrology Intelligence
  dhmStations: DhmRiverStation[];
  dhmSummary: DhmHydrologySummary | null;
  dhmLoading: boolean;
  dhmError: string | null;
  dhmDemoMode: boolean;
  setDhmDemoMode: (demo: boolean) => void;
  refreshDhmStations: (options?: { force?: boolean; demo?: boolean }) => Promise<void>;
  selectedDhmStation: DhmRiverStation | null;
  setSelectedDhmStation: (station: DhmRiverStation | null) => void;

  // Nepal Department of Roads (DOR) Navigate Intelligence
  dorRoadLinks: DorRoadLink[];
  dorClosures: DorRoadClosure[];
  dorBridges: DorBridge[];
  dorSummary: DorRoadSummary | null;
  dorLoading: boolean;
  dorError: string | null;
  dorLastUpdated: string | null;
  dorDataSource: 'LIVE' | 'CACHED' | 'SIMULATED';
  dorDemoMode: boolean;
  setDorDemoMode: (demo: boolean) => void;
  responderProfile: RoutingProfileMode;
  setResponderProfile: (profile: RoutingProfileMode) => void;
  communityRoadReports: CommunityRoadReport[];
  addCommunityRoadReport: (report: Omit<CommunityRoadReport, 'id' | 'timestamp'>) => void;
  refreshDorRoads: () => Promise<void>;
}

const AppStateContext = createContext<AppState | undefined>(undefined);

export function AppStateProvider({ children }: { children: ReactNode }) {
  const { session } = useAuth();
  const [currentLocationId, setCurrentLocationId] = useState<string>(mockData.LOCATIONS[0].id);
  const [locations] = useState<Location[]>(mockData.LOCATIONS);
  const [weather] = useState<Record<string, Weather>>(mockData.MOCK_WEATHER);
  const [routes] = useState<Route[]>(mockData.MOCK_ROUTES);
  const [roads, setRoads] = useState<Road[]>((mockData as any).MOCK_ROADS || []);
  const [bridges, setBridges] = useState<Bridge[]>((mockData as any).MOCK_BRIDGES || []);
  const [roadReports, setRoadReports] = useState<RoadReport[]>((mockData as any).MOCK_ROAD_REPORTS || []);
  const [news, setNews] = useState<News[]>(mockData.MOCK_NEWS);
  const [liveNews, setLiveNews] = useState<News[]>([]);
  const [liveNewsLoading, setLiveNewsLoading] = useState<boolean>(false);
  const [liveNewsError, setLiveNewsError] = useState<string | null>(null);
  const [liveNewsLastSynced, setLiveNewsLastSynced] = useState<string | null>(null);
  const [supplies] = useState<Supply[]>(MOCK_LOGISTICS_SUPPLIES);
  const [teams, setTeams] = useState<VolunteerTeam[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('sahayak_volunteer_teams_v1');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            return parsed;
          }
        }
      } catch (e) {
        console.error('Failed to load cached volunteer teams', e);
      }
    }
    return MOCK_EXTENDED_TEAMS;
  });
  const [coverageGaps, setCoverageGaps] = useState<CoverageGap[]>(MOCK_COVERAGE_GAPS);
  const [resourceDemands] = useState<DetailedLocationResourceDemand[]>(MOCK_LOCATION_RESOURCE_DEMANDS);
  const [distributionPlans, setDistributionPlans] = useState<AIDistributionPlanProposal[]>(MOCK_AI_DISTRIBUTION_PLANS);
  const addDistributionPlan = useCallback((plan: AIDistributionPlanProposal) => {
    setDistributionPlans(prev => [plan, ...prev]);
  }, []);
  const updateDistributionPlan = useCallback((id: string, updates: Partial<AIDistributionPlanProposal>) => {
    setDistributionPlans(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
  }, []);
  const [deliveryRoutes] = useState<LogisticsDeliveryRoutePlan[]>(MOCK_LOGISTICS_DELIVERY_ROUTES);
  const [distributionAuditLogs] = useState<DistributionAuditLog[]>(MOCK_DISTRIBUTION_AUDIT_LOGS);
  const [missingPersons, setMissingPersons] = useState<MissingPerson[]>(mockData.MOCK_MISSING);
  const [sightings, setSightings] = useState<Sighting[]>(mockData.MOCK_SIGHTINGS);
  const [candidateMatches, setCandidateMatches] = useState<CandidateMatch[]>(mockData.MOCK_CANDIDATE_MATCHES);
  const [userRole, setUserRole] = useState<'PUBLIC' | 'RESPONDER'>('RESPONDER');
  const [volunteers, setVolunteers] = useState<Volunteer[]>(mockData.MOCK_VOLUNTEERS);
  const [assessments, setAssessments] = useState<Assessment[]>(mockData.MOCK_ASSESSMENTS);
  const [incidents] = useState<Incident[]>(mockData.MOCK_INCIDENTS);
  const [notifications, setNotifications] = useState<AppNotification[]>(mockData.MOCK_NOTIFICATIONS);

  // Nepal Department of Roads (DOR) Navigate State
  const [dorRoadLinks, setDorRoadLinks] = useState<DorRoadLink[]>(INITIAL_DOR_ROAD_LINKS);
  const [dorClosures, setDorClosures] = useState<DorRoadClosure[]>(INITIAL_DOR_CLOSURES);
  const [dorBridges, setDorBridges] = useState<DorBridge[]>(INITIAL_DOR_BRIDGES);
  const [dorSummary, setDorSummary] = useState<DorRoadSummary | null>(INITIAL_DOR_SUMMARY);
  const [dorLoading, setDorLoading] = useState<boolean>(false);
  const [dorError, setDorError] = useState<string | null>(null);
  const [dorLastUpdated, setDorLastUpdated] = useState<string | null>(new Date().toISOString());
  const [dorDataSource, setDorDataSource] = useState<'LIVE' | 'CACHED' | 'SIMULATED'>('LIVE');
  const [dorDemoMode, setDorDemoMode] = useState<boolean>(false);
  const [responderProfile, setResponderProfile] = useState<RoutingProfileMode>('GENERAL_CITIZEN');
  const [communityRoadReports, setCommunityRoadReports] = useState<CommunityRoadReport[]>(INITIAL_COMMUNITY_REPORTS);

  // Hospital Missing-Person Matching Network State
  const [hospitalPatients, setHospitalPatients] = useState<HospitalPatientRecord[]>(MOCK_HOSPITAL_PATIENTS);
  const [hospitalMatches, setHospitalMatches] = useState<HospitalMatchResult[]>(MOCK_HOSPITAL_MATCHES);
  const [hospitalAuditLogs, setHospitalAuditLogs] = useState<HospitalMatchAuditLog[]>(MOCK_HOSPITAL_AUDIT_LOGS);
  const [hospitalAccessRole, setHospitalAccessRole] = useState<'HOSPITAL_STAFF' | 'AUTHORITY_RESPONDER' | 'PUBLIC'>('HOSPITAL_STAFF');
  
  // Real Government Hospital Intelligence
  const [governmentHospitals, setGovernmentHospitals] = useState<GovernmentHospital[]>([]);
  const [hospitalSummary, setHospitalSummary] = useState<HospitalServiceSummary | null>(null);
  const [hospitalLoading, setHospitalLoading] = useState<boolean>(true);
  const [hospitalError, setHospitalError] = useState<string | null>(null);
  const [hospitalLastRetrieved, setHospitalLastRetrieved] = useState<string | null>(null);
  const [hospitalIsCached, setHospitalIsCached] = useState<boolean>(false);
  const [hospitalSourceStatus, setHospitalSourceStatus] = useState<'LIVE' | 'CACHED' | 'UNAVAILABLE'>('LIVE');

  // Real Government Missing & Rescued Person Intelligence (OPMCM / NDRRMA)
  const [governmentRescueReports, setGovernmentRescueReports] = useState<GovernmentPersonReport[]>([]);
  const [rescueSummary, setRescueSummary] = useState<RescueServiceSummary | null>(null);
  const [rescueLoading, setRescueLoading] = useState<boolean>(true);
  const [rescueError, setRescueError] = useState<string | null>(null);
  const [rescueLastRetrieved, setRescueLastRetrieved] = useState<string | null>(null);
  const [rescueIsCached, setRescueIsCached] = useState<boolean>(false);
  const [rescueSourceStatus, setRescueSourceStatus] = useState<'LIVE' | 'CACHED' | 'UNAVAILABLE'>('LIVE');

  // Nepal DHM River Watch Hydrology Intelligence State
  const [dhmStations, setDhmStations] = useState<DhmRiverStation[]>([]);
  const [dhmSummary, setDhmSummary] = useState<DhmHydrologySummary | null>(null);
  const [dhmLoading, setDhmLoading] = useState<boolean>(true);
  const [dhmError, setDhmError] = useState<string | null>(null);
  const [dhmDemoMode, setDhmDemoMode] = useState<boolean>(false);
  const [selectedDhmStation, setSelectedDhmStation] = useState<DhmRiverStation | null>(null);

  const [demoScenarioStep, setDemoScenarioStep] = useState<number>(0);
  const [liveWeatherSources, setLiveWeatherSources] = useState<WeatherSource[] | null>(null);
  const [liveHourlyForecast, setLiveHourlyForecast] = useState<HourlyForecast[] | null>(null);
  const [userGeolocation, setUserGeolocation] = useState<{ lat: number; lng: number } | null>(null);

  useEffect(() => {
    let watchId: number;
    if ('geolocation' in navigator) {
      watchId = navigator.geolocation.watchPosition(
        (position) => {
          setUserGeolocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          console.warn('Geolocation error:', error.message);
        },
        { enableHighAccuracy: true, maximumAge: 0, timeout: 5000 }
      );
    }
  

  return () => {
      if (watchId !== undefined) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, []);

  const currentLocation = useMemo(() => {
    const loc = locations.find(l => l.id === currentLocationId) || locations[0];
    if (userGeolocation && loc.id === 'loc-current') {
      return { ...loc, lat: userGeolocation.lat, lng: userGeolocation.lng };
    }
    if (loc.id === 'loc-current' && (!loc.lat || !loc.lng)) {
      return { ...loc, lat: 27.7172, lng: 85.3240 };
    }
    return loc;
  }, [locations, currentLocationId, userGeolocation]);

  const refreshGovernmentHospitals = async () => {
    setHospitalLoading(true);
    setHospitalError(null);
    try {
      const res = await fetchGovernmentHospitals(currentLocation);
      setGovernmentHospitals(res.hospitals);
      setHospitalSummary(res.summary);
      setHospitalIsCached(res.isCached);
      setHospitalLastRetrieved(res.retrievedAt);
      setHospitalSourceStatus(res.sourceStatus);
      setHospitalError(res.error);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setHospitalError(msg || 'Hospital availability data is currently unavailable.');
      setHospitalSourceStatus('UNAVAILABLE');
    } finally {
      setHospitalLoading(false);
    }
  };


  const refreshGovernmentRescueReports = async (options?: FetchRescueOptions) => {
    setRescueLoading(true);
    setRescueError(null);
    try {
      const res = await fetchRescueReports(options);
      setGovernmentRescueReports(res.reports);
      setRescueSummary(res.summary);
      setRescueIsCached(res.isCached);
      setRescueLastRetrieved(res.retrievedAt);
      setRescueSourceStatus(res.sourceStatus);
      setRescueError(res.error);

      if (res.missingPersons.length > 0) {
        setMissingPersons(prev => {
          const govIds = new Set(res.missingPersons.map(p => p.id));
          const nonGovExisting = prev.filter(p => !govIds.has(p.id) && !p.id.startsWith('gov-rescue-'));
          return [...res.missingPersons, ...nonGovExisting];
        });
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setRescueError(msg || 'Government rescue records are currently unreachable.');
      setRescueSourceStatus('UNAVAILABLE');
    } finally {
      setRescueLoading(false);
    }
  };

  const refreshDhmStations = async (options?: { force?: boolean; demo?: boolean }) => {
    setDhmLoading(true);
    setDhmError(null);
    try {
      const isDemo = options?.demo !== undefined ? options.demo : dhmDemoMode;
      const res = await DhmHydrologyService.fetchStations({
        demo: isDemo,
        refresh: options?.force ?? false
      });
      setDhmStations(res.stations);
      setDhmSummary(res.summary);
      setDhmError(null);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setDhmError(msg || 'Unable to fetch DHM River Watch hydrology telemetry.');
    } finally {
      setDhmLoading(false);
    }
  };

  useEffect(() => {
    refreshDhmStations({ demo: dhmDemoMode });
  }, [dhmDemoMode]);

  const refreshDorRoads = async () => {
    setDorLoading(true);
    setDorError(null);
    try {
      const [roadRes, bridgeRes] = await Promise.all([
        fetchDorRoadData(),
        fetchDorBridges()
      ]);
      setDorClosures(roadRes.closures);
      setDorRoadLinks(roadRes.roadLinks);
      setDorSummary(roadRes.summary);
      setDorBridges(bridgeRes.bridges);
      setDorDataSource(roadRes.dataSource);
      setDorLastUpdated(roadRes.lastUpdated);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setDorError(msg || 'Unable to retrieve live Department of Roads Navigate data.');
      setDorDataSource('CACHED');
    } finally {
      setDorLoading(false);
    }
  };

  const addCommunityRoadReport = (reportData: Omit<CommunityRoadReport, 'id' | 'timestamp'>) => {
    const newReport: CommunityRoadReport = {
      ...reportData,
      id: `REP-${Date.now()}`,
      timestamp: new Date().toISOString()
    };
    setCommunityRoadReports(prev => [newReport, ...prev]);

    if (newReport.issueType === 'ROAD_BLOCKED' || newReport.issueType === 'LANDSLIDE' || newReport.issueType === 'FLOODED') {
      setNotifications(prev => [
        {
          id: `notif-road-${Date.now()}`,
          title: `Road Alert: ${newReport.issueType.replace('_', ' ')} reported`,
          desc: `${newReport.locationName}: ${newReport.description} (${newReport.sourceType})`,
          type: newReport.isConfirmed ? 'critical' : 'warning',
          read: false,
          timestamp: 'Just now'
        },
        ...prev
      ]);
    }
  };

  const refreshLiveNews = async (category?: string, query?: string) => {
    setLiveNewsLoading(true);
    setLiveNewsError(null);
    try {
      const params = new URLSearchParams();
      if (category && category !== 'ALL') params.append('category', category);
      if (query) params.append('q', query);
      params.append('refresh', 'true');
      const res = await fetch(`/api/live-news?${params.toString()}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      if (data.news && Array.isArray(data.news)) {
        setLiveNews(prev => [
          ...prev.filter(item => item.id.startsWith('bipad-')),
          ...data.news.filter((item: News) => !item.id.startsWith('bipad-'))
        ]);
        setLiveNewsLastSynced(data.lastSynced || new Date().toISOString());
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error('Failed to load live news:', msg);
      setLiveNewsError(msg || 'Failed to fetch live feed');
    } finally {
      setLiveNewsLoading(false);
    }
  };

  useEffect(() => {
    fetch('/api/live-news')
      .then(r => r.json())
      .then(d => {
        if (d.news && Array.isArray(d.news)) {
          setLiveNews(prev => [
            ...prev.filter(item => item.id.startsWith('bipad-')),
            ...d.news.filter((item: News) => !item.id.startsWith('bipad-'))
          ]);
          setLiveNewsLastSynced(d.lastSynced || new Date().toISOString());
        }
      })
      .catch(e => console.warn('Initial live news fetch error:', e));
  }, []);

  useEffect(() => {
    const role = session?.role === 'ADMIN' ? 'ADMIN' : 'PUBLIC';
    let cancelled = false;
    const refreshBipadAlerts = async () => {
      try {
        const response = await fetch(`/api/bipad-alerts?role=${role}&refresh=true`);
        if (!response.ok) return;
        const data = await response.json();
        if (cancelled || !Array.isArray(data.alerts)) return;

        const bipadNews: News[] = data.alerts.map((alert: any) => ({
          id: alert.id,
          title: alert.title,
          source: alert.source,
          timestamp: alert.timestamp,
          locationId: 'loc-1',
          category: alert.category,
          severity: alert.severity,
          verified: alert.verified,
          verificationStatus: 'VERIFIED',
          verificationExplanation: 'Live alert received from the BIPAD Portal, Government of Nepal.',
          verificationLastUpdated: alert.startedOn,
          summary: alert.summary,
          sourceUrl: alert.sourceUrl,
          officialAgency: 'BIPAD Portal, Government of Nepal',
          district: alert.district,
          latitude: alert.latitude,
          longitude: alert.longitude,
          isRealBulletin: true,
          isLiveWire: true,
          link: alert.sourceUrl,
          pubDate: alert.startedOn
        }));
        setLiveNews(prev => [...bipadNews, ...prev.filter(item => !item.id.startsWith('bipad-'))]);

        const newNotifications = bipadNews
          .filter(item => item.severity !== 'INFO' || session?.role === 'ADMIN')
          .slice(0, 12)
          .map(item => ({
            id: `notif-${item.id}`,
            title: item.title,
            desc: item.summary,
            type: item.severity === 'CRITICAL' ? 'critical' as const : item.severity === 'WARNING' ? 'warning' as const : 'info' as const,
            read: false,
            timestamp: item.timestamp
          }));
        setNotifications(prev => {
          const existing = new Set(prev.map(notification => notification.id));
          return [...newNotifications.filter(notification => !existing.has(notification.id)), ...prev];
        });
      } catch (error) {
        console.warn('BIPAD alert sync unavailable:', error);
      }
    };
    refreshBipadAlerts();
    const interval = window.setInterval(refreshBipadAlerts, 60 * 1000);
    return () => {
      cancelled = true;
      window.clearInterval(interval);
    };
  }, [session?.role]);

  useEffect(() => {
    refreshDorRoads();
  }, []);

  useEffect(() => {
    refreshGovernmentHospitals();
  }, [currentLocation]);

  useEffect(() => {
    refreshGovernmentRescueReports();
  }, []);

  const facilities = useMemo<Facility[]>(() => {
    const nonHospitals = mockData.MOCK_FACILITIES.filter(f => f.type !== 'Hospital');

    if (governmentHospitals.length === 0) {
      return mockData.MOCK_FACILITIES;
    }

    const govFacilities: Facility[] = governmentHospitals.map(h => {
      const matchedLoc = locations.find(l => 
        l.name.toLowerCase().includes(h.district.toLowerCase()) || 
        h.district.toLowerCase().includes(l.name.toLowerCase())
      );

      return {
        id: h.id,
        name: h.name,
        type: 'Hospital',
        locationId: matchedLoc?.id || currentLocationId,
        address: h.address,
        lat: h.lat || 0,
        lng: h.lng || 0,
        capacity: h.allocatedBeds > 0 ? h.allocatedBeds : h.totalBeds,
        currentOccupancy: h.occupiedBeds,
        status: 'Operational',
        services: [
          h.type,
          `Free Beds: ${h.allocatedBeds}`,
          `Total Beds: ${h.totalBeds}`,
          `Available: ${h.availableBeds}`
        ],
        contact: h.contactNumber || h.contactPerson || 'Government Free Health Desk',
        isRealSourceData: h.isRealSourceData,
        isCached: h.isCached,
        province: h.province,
        district: h.district,
        municipality: h.municipality,
        allocatedBeds: h.allocatedBeds,
        availableBeds: h.availableBeds,
        occupancyPercentage: h.occupancyPercentage,
        source: h.source,
        sourceUrl: h.sourceUrl,
        lastUpdated: h.lastUpdated,
        retrievedAt: h.retrievedAt,
        contactPerson: h.contactPerson,
        hospitalType: h.type,
        dataQuality: h.dataQuality,
        locationPrecision: h.locationPrecision,
      };
    });

    return [...govFacilities, ...nonHospitals];
  }, [governmentHospitals, locations, currentLocationId]);

  useEffect(() => {
    if (demoScenarioStep === 0) {
      let isMounted = true;
      fetchLiveWeatherSources(currentLocation)
        .then(sources => {
          if (isMounted && sources) {
            setLiveWeatherSources(sources);
          }
        })
        .catch(() => {});

      fetchLiveForecast(currentLocation)
        .then(forecast => {
          if (isMounted && forecast) {
            setLiveHourlyForecast(forecast);
          }
        })
        .catch(() => {});
      return () => { isMounted = false; };
    }
  }, [demoScenarioStep, currentLocation]);

  const weatherSources = useMemo(() => {
    if (demoScenarioStep === 0 && liveWeatherSources) {
      return liveWeatherSources;
    }
    return mockData.MOCK_WEATHER_SOURCES[demoScenarioStep] || mockData.MOCK_WEATHER_SOURCES[0];
  }, [demoScenarioStep, liveWeatherSources]);

  const hourlyForecast = useMemo(() => {
    if (demoScenarioStep === 0 && liveHourlyForecast) {
      return liveHourlyForecast;
    }
    return mockData.MOCK_HOURLY_FORECAST[demoScenarioStep] || mockData.MOCK_HOURLY_FORECAST[0];
  }, [demoScenarioStep, liveHourlyForecast]);
  
  const environmentalSensors = useMemo(() => {
    return mockData.MOCK_ENVIRONMENTAL_SENSORS[demoScenarioStep] || mockData.MOCK_ENVIRONMENTAL_SENSORS[0];
  }, [demoScenarioStep]);

  const fusedWeather = useMemo(() => {
    return fuseWeatherSources(weatherSources, currentLocationId);
  }, [weatherSources, currentLocationId]);

  const hazardRisks = useMemo(() => {
    if (!fusedWeather) return [];
    return calculateHazardRisks(fusedWeather, currentLocation);
  }, [fusedWeather, currentLocation]);

  const addMissingPerson = (personData: Omit<MissingPerson, 'id' | 'createdAt' | 'updatedAt' | 'timeline'>): MissingPerson => {
    const newId = `mp-${Date.now()}`;
    const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' Today';
    
    // Calculate deterministic initial baseline priority
    const priorityBreakdown = calculateBaselineCasePriority(personData, hazardRisks);

    const initialTimelineEvent: CaseTimelineEvent = {
      id: `tl-${Date.now()}`,
      timestamp: nowStr,
      action: 'Report Registered',
      description: `Emergency missing person report registered. Initial Baseline Priority calculated as ${priorityBreakdown.tier} (${priorityBreakdown.score}/100).`,
      actor: personData.reportedBy || 'Emergency Intake Desk',
      type: 'REPORT'
    };

    const newPerson: MissingPerson = {
      ...personData,
      id: newId,
      lastLocation: personData.lastKnownLocation || personData.lastLocation,
      lastKnownLocation: personData.lastKnownLocation || personData.lastLocation,
      contactInfo: personData.contactInformation || personData.contactInfo,
      contactInformation: personData.contactInformation || personData.contactInfo,
      baselinePriorityScore: priorityBreakdown.score,
      baselinePriorityBreakdown: priorityBreakdown,
      urgency: priorityBreakdown.tier,
      createdAt: nowStr,
      updatedAt: nowStr,
      timeline: [initialTimelineEvent],
      potentialMatchIds: []
    };

    setMissingPersons(prev => [newPerson, ...prev]);

    // Add alert notification
    setNotifications(prev => [
      {
        id: `notif-${Date.now()}`,
        title: `New Missing Person Alert: ${newPerson.name}`,
        desc: `Urgent search activated in ${newPerson.lastKnownLocation}. Urgency: ${newPerson.urgency}`,
        type: newPerson.urgency === 'CRITICAL' ? 'critical' : 'warning',
        read: false,
        timestamp: 'Just now'
      },
      ...prev
    ]);

    return newPerson;
  };

  const addSighting = async (sightingData: Omit<Sighting, 'id'>): Promise<CandidateMatch | null> => {
    const sightingId = `sight-${Date.now()}`;
    const newSighting: Sighting = {
      ...sightingData,
      id: sightingId,
      status: sightingData.status || 'UNREVIEWED'
    };

    setSightings(prev => [newSighting, ...prev]);

    // If related person candidate was indicated, or if we can test against active missing persons
    const targetPerson = missingPersons.find(p => p.id === newSighting.relatedPersonCandidate) ||
      missingPersons.find(p => p.status === 'MISSING' && (p.locationId === newSighting.locationId || p.lastKnownLocation.includes(newSighting.location)));

    if (targetPerson) {
      // Analyze sighting against person
      const match = await performAiAssistedMatch(targetPerson, newSighting);
      
      setCandidateMatches(prev => {
        const filtered = prev.filter(m => !(m.missingPersonId === targetPerson.id && m.sightingId === newSighting.id));
        return [match, ...filtered];
      });

      // Update person's timeline and status if similarity is meaningful
      setMissingPersons(prev => prev.map(p => {
        if (p.id === targetPerson.id) {
          const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' Today';
          const newEvents: CaseTimelineEvent[] = [
            ...p.timeline,
            {
              id: `tl-${Date.now()}-s`,
              timestamp: nowStr,
              action: `Sighting ${newSighting.id} Reported`,
              description: `Reported at ${newSighting.location} by ${newSighting.reporter} (${newSighting.source}).`,
              actor: newSighting.reporter,
              type: 'SIGHTING'
            },
            {
              id: `tl-${Date.now()}-ai`,
              timestamp: nowStr,
              action: 'AI Candidate Evaluation Generated',
              description: `AI computed similarity: ${match.similarityScore}%. Assessment: ${match.matchAssessment}. ${match.recommendation}`,
              actor: 'SAHAYAK AI Matching Engine',
              type: 'AI_ANALYSIS'
            }
          ];

          return {
            ...p,
            status: match.similarityScore >= 60 ? 'POSSIBLE MATCH' : p.status,
            potentialMatchIds: Array.from(new Set([...(p.potentialMatchIds || []), newSighting.id])),
            timeline: newEvents,
            updatedAt: nowStr
          };
        }
        return p;
      }));

      // Notify commanders
      setNotifications(prev => [
        {
          id: `notif-${Date.now()}-match`,
          title: `Potential Sighting Match (${match.similarityScore}%)`,
          desc: `New lead for ${targetPerson.name} reported at ${newSighting.location}. Human verification required.`,
          type: match.similarityScore >= 75 ? 'critical' : 'warning',
          read: false,
          timestamp: 'Just now'
        },
        ...prev
      ]);

      return match;
    }

    return null;
  };

  const triggerMatchAnalysis = async (personId: string, sightingId: string): Promise<CandidateMatch> => {
    const person = missingPersons.find(p => p.id === personId);
    const sighting = sightings.find(s => s.id === sightingId);
    if (!person || !sighting) {
      throw new Error('Person or Sighting not found');
    }

    const match = await performAiAssistedMatch(person, sighting);
    setCandidateMatches(prev => {
      const filtered = prev.filter(m => !(m.missingPersonId === personId && m.sightingId === sightingId));
      return [match, ...filtered];
    });

    return match;
  };

  const confirmMatch = (matchId: string, notes?: string, verifiedStatus: 'FOUND' | 'SAFE' | 'HOSPITALIZED' | 'IN SHELTER' = 'FOUND') => {
    const match = candidateMatches.find(m => m.id === matchId);
    if (!match) return;

    const officerName = userRole === 'RESPONDER' ? 'Authorized Field Officer' : 'Verification Specialist';
    const nowStr = new Date().toLocaleString();

    // 1. Update Candidate Match
    setCandidateMatches(prev => prev.map(m => {
      if (m.id === matchId) {
        return {
          ...m,
          status: 'VERIFIED_MATCH',
          reviewedAt: nowStr,
          reviewedBy: officerName,
          reviewNotes: notes || 'Confirmed through direct officer verification and physical cross-referencing.'
        };
      }
      return m;
    }));

    // 2. Update Sighting
    setSightings(prev => prev.map(s => {
      if (s.id === match.sightingId) {
        return {
          ...s,
          status: 'VERIFIED'
        };
      }
      return s;
    }));

    // 3. Update Missing Person
    setMissingPersons(prev => prev.map(p => {
      if (p.id === match.missingPersonId) {
        const sighting = sightings.find(s => s.id === match.sightingId);
        const locationDesc = sighting?.facilityName || sighting?.location || p.lastKnownLocation;
        const timelineEvent: CaseTimelineEvent = {
          id: `tl-${Date.now()}-v`,
          timestamp: 'Just now',
          action: `Identity Verified (${verifiedStatus})`,
          description: `Human Officer confirmed match with Sighting ${match.sightingId}. Person confirmed safe at ${locationDesc}. ${notes ? `Officer Notes: "${notes}"` : ''}`,
          actor: officerName,
          type: 'STATUS_CHANGE'
        };

        return {
          ...p,
          status: verifiedStatus,
          verifiedMatchSightingId: match.sightingId,
          verificationDetails: {
            verifiedBy: officerName,
            verifiedAt: nowStr,
            notes: notes || 'Verified by field emergency officer.',
            status: 'VERIFIED'
          },
          timeline: [...p.timeline, timelineEvent],
          updatedAt: 'Just now'
        };
      }
      return p;
    }));

    // 4. Create Notification
    const person = missingPersons.find(p => p.id === match.missingPersonId);
    setNotifications(prev => [
      {
        id: `notif-${Date.now()}`,
        title: `Match Verified: ${person?.name || 'Individual'} Located`,
        desc: `Confirmed ${verifiedStatus} by ${officerName}. Family notified and registry updated.`,
        type: 'info',
        read: false,
        timestamp: 'Just now'
      },
      ...prev
    ]);
  };

  const rejectMatch = (matchId: string, reason?: string) => {
    const match = candidateMatches.find(m => m.id === matchId);
    if (!match) return;

    const officerName = userRole === 'RESPONDER' ? 'Authorized Field Officer' : 'Verification Specialist';
    const nowStr = new Date().toLocaleString();

    // 1. Update Candidate Match (Preserve record, do NOT delete)
    setCandidateMatches(prev => prev.map(m => {
      if (m.id === matchId) {
        return {
          ...m,
          status: 'REJECTED',
          reviewedAt: nowStr,
          reviewedBy: officerName,
          reviewNotes: reason || 'Rejected upon officer inspection: visual and physical evidence contradicts missing person record.'
        };
      }
      return m;
    }));

    // 2. Update Sighting
    setSightings(prev => prev.map(s => {
      if (s.id === match.sightingId) {
        return {
          ...s,
          status: 'REJECTED'
        };
      }
      return s;
    }));

    // 3. Update Person timeline (revert from POSSIBLE MATCH to MISSING if no other active potential matches)
    setMissingPersons(prev => prev.map(p => {
      if (p.id === match.missingPersonId) {
        const remainingCandidateSightings = (p.potentialMatchIds || []).filter(sid => sid !== match.sightingId);
        const timelineEvent: CaseTimelineEvent = {
          id: `tl-${Date.now()}-r`,
          timestamp: 'Just now',
          action: 'Candidate Match Rejected by Officer',
          description: `Officer reviewed Sighting ${match.sightingId} and determined it does not match. Reason: ${reason || 'Physical or circumstantial contradiction'}. Case remains active search.`,
          actor: officerName,
          type: 'HUMAN_REVIEW'
        };

        return {
          ...p,
          status: p.status === 'POSSIBLE MATCH' && remainingCandidateSightings.length === 0 ? 'MISSING' : p.status,
          potentialMatchIds: remainingCandidateSightings,
          timeline: [...p.timeline, timelineEvent],
          updatedAt: 'Just now'
        };
      }
      return p;
    }));
  };

  const requestMoreInfo = (matchId: string, notes?: string) => {
    const match = candidateMatches.find(m => m.id === matchId);
    if (!match) return;

    setCandidateMatches(prev => prev.map(m => {
      if (m.id === matchId) {
        return {
          ...m,
          status: 'MORE_INFO_REQUESTED',
          reviewNotes: notes || 'Field team requested higher resolution photograph and family confirmation.'
        };
      }
      return m;
    }));

    setMissingPersons(prev => prev.map(p => {
      if (p.id === match.missingPersonId) {
        return {
          ...p,
          timeline: [
            ...p.timeline,
            {
              id: `tl-${Date.now()}-info`,
              timestamp: 'Just now',
              action: 'Additional Information Requested',
              description: `Verification officer requested additional confirmation for Sighting ${match.sightingId}. ${notes ? `Note: ${notes}` : ''}`,
              actor: 'Field Officer',
              type: 'NOTE'
            }
          ]
        };
      }
      return p;
    }));
  };

  const addVolunteer = (volunteer: Volunteer) => {
    setVolunteers(prev => [volunteer, ...prev]);
  };

  const addAssessment = (assessment: Assessment) => {
    setAssessments(prev => [assessment, ...prev]);
  };

  const markNotificationRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const updateRoad = (id: string, updates: Partial<Road>) => {
    setRoads(prev => prev.map(r => r.id === id ? { ...r, ...updates } : r));
  };

  const updateBridge = (id: string, updates: Partial<Bridge>) => {
    setBridges(prev => prev.map(b => b.id === id ? { ...b, ...updates } : b));
  };

  const addRoadReport = (report: RoadReport) => {
    setRoadReports(prev => [report, ...prev]);
  };

  // ==========================================
  // VOLUNTEER TEAM & AREA ALLOCATION METHODS
  // ==========================================

  const registerTeam = (teamData: Omit<VolunteerTeam, 'id'> | Partial<VolunteerTeam>): VolunteerTeam => {
    const newTeam: VolunteerTeam = {
      id: `team-${Date.now()}`,
      name: teamData.name || 'Emergency Volunteer Unit',
      leaderId: teamData.leaderId || `vol-${Date.now()}`,
      leaderName: teamData.leaderName || 'Team Leader',
      contact: teamData.contact || '+977-9800-000000',
      memberCount: Number(teamData.memberCount) || 5,
      skills: teamData.skills || ['First Aid', 'Search & Rescue'],
      specialization: teamData.specialization || 'Search & Rescue (SAR)',
      equipment: teamData.equipment || [],
      operatingArea: teamData.assignedLocationName || teamData.operatingArea || 'Kathmandu Valley',
      availability: teamData.availability || 'Immediate (24/7)',
      status: teamData.status || (teamData.assignedLocationName ? 'DEPLOYED' : 'STANDBY'),
      verificationStatus: teamData.verificationStatus || 'VERIFIED',
      experienceScore: teamData.experienceScore || 90,
      experienceSummary: teamData.experienceSummary || 'Registered disaster response volunteer unit.',
      assignedLocationId: teamData.assignedLocationId,
      assignedLocationName: teamData.assignedLocationName,
      currentTask: teamData.currentTask || (teamData.assignedLocationName ? `Disaster response and relief operations at ${teamData.assignedLocationName}` : undefined),
      lat: teamData.lat,
      lng: teamData.lng,
    };

    setTeams(prev => {
      const updated = [newTeam, ...prev];
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem('sahayak_volunteer_teams_v1', JSON.stringify(updated));
        } catch (e) {
          console.error(e);
        }
      }
      return updated;
    });

    if (newTeam.assignedLocationId) {
      setCoverageGaps(prevGaps =>
        prevGaps.map(gap => {
          if (gap.locationId === newTeam.assignedLocationId || gap.id === newTeam.assignedLocationId) {
            const newAssigned = (gap.assignedVolunteers || 0) + newTeam.memberCount;
            return {
              ...gap,
              assignedVolunteers: newAssigned,
              gapCount: Math.max(0, (gap.requiredVolunteers || 0) - newAssigned)
            };
          }
          return gap;
        })
      );
    }

    const notif: AppNotification = {
      id: `notif-${Date.now()}`,
      title: 'New Volunteer Team Registered',
      desc: `${newTeam.name} led by ${newTeam.leaderName} (${newTeam.memberCount} members) registered and allocated to ${newTeam.assignedLocationName || 'Standby Base'}.`,
      timestamp: 'Just now',
      read: false,
      type: 'info',
      category: 'LOGISTICS',
    };
    setNotifications(prev => [notif, ...prev]);

    return newTeam;
  };

  const assignTeamArea = (
    teamId: string, 
    areaId: string, 
    areaName: string, 
    task?: string, 
    coords?: { lat: number; lng: number }
  ) => {
    setTeams(prev => {
      const updated = prev.map(t => {
        if (t.id === teamId) {
          return {
            ...t,
            assignedLocationId: areaId,
            assignedLocationName: areaName,
            operatingArea: areaName,
            currentTask: task || t.currentTask || `Disaster relief operations at ${areaName}`,
            status: 'DEPLOYED' as const,
            lat: coords?.lat ?? t.lat,
            lng: coords?.lng ?? t.lng,
          };
        }
        return t;
      });
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem('sahayak_volunteer_teams_v1', JSON.stringify(updated));
        } catch (e) {
          console.error(e);
        }
      }
      return updated;
    });

    setCoverageGaps(prevGaps =>
      prevGaps.map(gap => {
        if (gap.locationId === areaId || gap.id === areaId) {
          const team = teams.find(t => t.id === teamId);
          const count = team ? team.memberCount : 5;
          const newAssigned = (gap.assignedVolunteers || 0) + count;
          return {
            ...gap,
            assignedVolunteers: newAssigned,
            gapCount: Math.max(0, (gap.requiredVolunteers || 0) - newAssigned)
          };
        }
        return gap;
      })
    );
  };

  const updateTeamStatus = (teamId: string, status: VolunteerStatus | 'STANDBY') => {
    setTeams(prev => {
      const updated = prev.map(t => (t.id === teamId ? { ...t, status } : t));
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem('sahayak_volunteer_teams_v1', JSON.stringify(updated));
        } catch (e) {
          console.error(e);
        }
      }
      return updated;
    });
  };

  const resetTeamsToDefault = () => {
    setTeams(MOCK_EXTENDED_TEAMS);
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem('sahayak_volunteer_teams_v1');
      } catch (e) {
        console.error(e);
      }
    }
  };

  // ==========================================
  // HOSPITAL MATCHING NETWORK METHODS
  // ==========================================

  const hospitalMatchingStats = useMemo<HospitalMatchingNetworkStats>(() => {
    const patientsSubmitted = hospitalPatients.length;
    const aiMatchesFlagged = hospitalMatches.filter(m => m.matchConfidence >= 55).length;
    const awaitingVerification = hospitalMatches.filter(m => m.status === 'PENDING_HUMAN_REVIEW').length;
    const potentialMatchesConfirmed = hospitalMatches.filter(m => m.status === 'CONFIRMED_POSSIBLE_MATCH').length;
    return {
      patientsSubmitted,
      aiMatchesFlagged,
      awaitingVerification,
      potentialMatchesConfirmed,
      isSimulated: true,
    };
  }, [hospitalPatients, hospitalMatches]);

  const submitHospitalPatient = async (
    patientInput: Omit<HospitalPatientRecord, 'id' | 'status' | 'potentialMatchesCount' | 'isSimulated' | 'submittedAt'>
  ): Promise<{ patient: HospitalPatientRecord; matches: HospitalMatchResult[] }> => {
    const patientId = `pat-${Date.now()}`;
    const submittedAt = new Date().toLocaleString([], { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' });

    const tempPatient: HospitalPatientRecord = {
      ...patientInput,
      id: patientId,
      submittedAt,
      status: 'UNPROCESSED',
      potentialMatchesCount: 0,
      isSimulated: true,
    };

    // Evaluate against missing persons database
    const matchedResults = await searchMissingPersonDatabase(tempPatient, missingPersons);

    const finalStatus = matchedResults.length > 0 ? 'ANALYZED' : 'NO_STRONG_MATCH';
    const finalizedPatient: HospitalPatientRecord = {
      ...tempPatient,
      status: finalStatus,
      potentialMatchesCount: matchedResults.length,
    };

    setHospitalPatients(prev => [finalizedPatient, ...prev]);

    if (matchedResults.length > 0) {
      setHospitalMatches(prev => [...matchedResults, ...prev]);
    }

    // Append audit logs
    const submitLog: HospitalMatchAuditLog = {
      id: `hal-${Date.now()}-sub`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      actor: finalizedPatient.submittedBy || 'Authorized Hospital Staff',
      role: 'Hospital Emergency Registry',
      action: 'PATIENT_SUBMITTED',
      patientId: finalizedPatient.id,
      patientMrn: finalizedPatient.mrn,
      details: `Submitted unidentified patient: ${finalizedPatient.approximateAge} ${finalizedPatient.sex} at ${finalizedPatient.hospitalName}. Recovery site: ${finalizedPatient.foundLocation}.`,
    };

    const analyzeLog: HospitalMatchAuditLog = {
      id: `hal-${Date.now()}-ana`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      actor: 'SAHAYAK AI Matching Engine',
      role: 'Autonomous Decision-Support Agent',
      action: 'MATCH_ANALYZED',
      patientId: finalizedPatient.id,
      patientMrn: finalizedPatient.mrn,
      details: matchedResults.length > 0 
        ? `AI scanned missing-person database and identified ${matchedResults.length} potential match candidates. Top candidate score: ${matchedResults[0].matchConfidence}%.`
        : 'AI scanned missing-person database: No strong potential match found. Missing-person reports may still be pending intake.',
    };

    setHospitalAuditLogs(prev => [analyzeLog, submitLog, ...prev]);

    // Dispatch priority notification if strong candidate detected
    if (matchedResults.length > 0 && matchedResults[0].matchConfidence >= 75) {
      setNotifications(prev => [
        {
          id: `notif-${Date.now()}`,
          title: `Hospital Match Alert: ${matchedResults[0].matchConfidence}% Confidence`,
          desc: `Unidentified patient (${finalizedPatient.mrn}) at ${finalizedPatient.hospitalName} has a potential match requiring authorized human verification.`,
          type: 'warning',
          read: false,
          timestamp: 'Just now'
        },
        ...prev
      ]);
    }

    return { patient: finalizedPatient, matches: matchedResults };
  };

  const submitHospitalPatientBatch = async (
    batch: Array<Omit<HospitalPatientRecord, 'id' | 'status' | 'potentialMatchesCount' | 'isSimulated' | 'submittedAt'>>,
    onProgress?: (step: string, percent: number) => void
  ): Promise<{ processedCount: number; matchesFound: number }> => {
    onProgress?.('Uploading patient bundle & photographic assets...', 15);
    await new Promise(r => setTimeout(r, 600));

    onProgress?.('Processing image normalization & demographic extraction...', 40);
    await new Promise(r => setTimeout(r, 700));

    onProgress?.('Analyzing multi-signal feature vector alignment...', 65);
    await new Promise(r => setTimeout(r, 800));

    onProgress?.('Searching Missing-Person Database & River Drainage Corridors...', 85);
    await new Promise(r => setTimeout(r, 700));

    const newPatients: HospitalPatientRecord[] = [];
    const newMatches: HospitalMatchResult[] = [];
    const newLogs: HospitalMatchAuditLog[] = [];

    const nowStr = new Date().toLocaleString([], { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' });
    let totalMatchesFound = 0;

    for (let i = 0; i < batch.length; i++) {
      const item = batch[i];
      const pId = `pat-batch-${Date.now()}-${i}`;
      const tempPatient: HospitalPatientRecord = {
        ...item,
        id: pId,
        submittedAt: nowStr,
        status: 'UNPROCESSED',
        potentialMatchesCount: 0,
        isSimulated: true,
      };

      const candidates = await searchMissingPersonDatabase(tempPatient, missingPersons);
      totalMatchesFound += candidates.length;

      const finalized: HospitalPatientRecord = {
        ...tempPatient,
        status: candidates.length > 0 ? 'ANALYZED' : 'NO_STRONG_MATCH',
        potentialMatchesCount: candidates.length,
      };

      newPatients.push(finalized);
      newMatches.push(...candidates);
    }

    const batchLog: HospitalMatchAuditLog = {
      id: `hal-batch-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      actor: hospitalAccessRole === 'HOSPITAL_STAFF' ? 'Hospital Medical Intake Team' : 'Disaster Coordination Desk',
      role: 'Disaster Batch Intake Processor',
      action: 'BATCH_SUBMITTED',
      patientId: `batch-${batch.length}-records`,
      patientMrn: `BATCH-${Date.now().toString().slice(-6)}`,
      details: `Processed batch of ${batch.length} unidentified patient records. AI flagged ${totalMatchesFound} candidate matches across active missing-person registry.`,
    };
    newLogs.push(batchLog);

    setHospitalPatients(prev => [...newPatients, ...prev]);
    setHospitalMatches(prev => [...newMatches, ...prev]);
    setHospitalAuditLogs(prev => [batchLog, ...prev]);

    onProgress?.('Potential Matches Found & Ranked for Human Verification', 100);

    return { processedCount: batch.length, matchesFound: totalMatchesFound };
  };

  const reviewHospitalMatch = (
    matchId: string,
    decision: 'CONFIRMED_POSSIBLE_MATCH' | 'REJECTED' | 'NEEDS_FURTHER_VERIFICATION',
    notes?: string,
    reviewerName?: string
  ) => {
    const match = hospitalMatches.find(m => m.id === matchId);
    if (!match) return;

    const reviewer = reviewerName || (hospitalAccessRole === 'HOSPITAL_STAFF' ? 'Dr. S. Koirala (Bir Hospital Trauma Desk)' : 'Inspector D. Thapa (Verification Authority)');
    const nowTime = new Date().toLocaleString([], { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' });

    // 1. Update Match record
    setHospitalMatches(prev => prev.map(m => {
      if (m.id === matchId) {
        return {
          ...m,
          status: decision,
          reviewedBy: reviewer,
          reviewedAt: nowTime,
          reviewNotes: notes || (decision === 'CONFIRMED_POSSIBLE_MATCH' 
            ? 'Physically confirmed by authorized hospital staff and identity verified.' 
            : decision === 'REJECTED' 
            ? 'Contradicting physical evidence: record rejected.' 
            : 'Escalated for guardian / forensic DNA verification.'),
        };
      }
      return m;
    }));

    // 2. Update Patient status if confirmed
    if (decision === 'CONFIRMED_POSSIBLE_MATCH') {
      setHospitalPatients(prev => prev.map(p => {
        if (p.id === match.patientId) {
          return {
            ...p,
            status: 'MATCH_CONFIRMED',
          };
        }
        return p;
      }));

      // 3. Update Missing Person record
      setMissingPersons(prev => prev.map(p => {
        if (p.id === match.missingPersonId) {
          const timelineEvent: CaseTimelineEvent = {
            id: `tl-hosp-${Date.now()}`,
            timestamp: 'Just now',
            action: 'Hospitalized Identity Confirmed',
            description: `Authorized medical staff confirmed match with unidentified patient (${match.patientMrn}) at ${match.hospitalName}. ${notes ? `Verification Notes: "${notes}"` : ''}`,
            actor: reviewer,
            type: 'STATUS_CHANGE',
          };

          return {
            ...p,
            status: 'HOSPITALIZED',
            updatedAt: 'Just now',
            timeline: [...p.timeline, timelineEvent],
          };
        }
        return p;
      }));

      // 4. Create App Notification
      const person = missingPersons.find(p => p.id === match.missingPersonId);
      setNotifications(prev => [
        {
          id: `notif-hosp-${Date.now()}`,
          title: `Match Verified: ${person?.name || 'Individual'} Located at Hospital`,
          desc: `Confirmed by ${reviewer} at ${match.hospitalName}. Case status updated to HOSPITALIZED.`,
          type: 'info',
          read: false,
          timestamp: 'Just now',
        },
        ...prev,
      ]);
    }

    // 5. Add Audit Log
    const actionType: HospitalMatchAuditLog['action'] = 
      decision === 'CONFIRMED_POSSIBLE_MATCH' ? 'MATCH_CONFIRMED' :
      decision === 'REJECTED' ? 'MATCH_REJECTED' : 'FURTHER_VERIFICATION_REQUESTED';

    const auditLog: HospitalMatchAuditLog = {
      id: `hal-${Date.now()}-${decision}`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      actor: reviewer,
      role: hospitalAccessRole === 'HOSPITAL_STAFF' ? 'Authorized Hospital Clinician' : 'Disaster Verification Authority',
      action: actionType,
      patientId: match.patientId,
      patientMrn: match.patientMrn,
      missingPersonId: match.missingPersonId,
      matchId: match.id,
      details: `Action: ${decision}. Reviewer: ${reviewer}. Notes: ${notes || 'No custom notes provided.'}`,
    };

    setHospitalAuditLogs(prev => [auditLog, ...prev]);
  };

  const resetHospitalDemoData = () => {
    setHospitalPatients(MOCK_HOSPITAL_PATIENTS);
    setHospitalMatches(MOCK_HOSPITAL_MATCHES);
    setHospitalAuditLogs(MOCK_HOSPITAL_AUDIT_LOGS);
  };

  const value: AppState = {
    currentLocationId,
    currentLocation,
    userGeolocation,
    locations,
    weather,
    facilities,
    governmentHospitals,
    hospitalSummary,
    hospitalLoading,
    hospitalError,
    hospitalLastRetrieved,
    hospitalIsCached,
    hospitalSourceStatus,
    refreshGovernmentHospitals,
    governmentRescueReports,
    rescueSummary,
    rescueLoading,
    rescueError,
    rescueLastRetrieved,
    rescueIsCached,
    rescueSourceStatus,
    refreshGovernmentRescueReports,
    routes,
    roads,
    bridges,
    roadReports,
    setRoads,
    setBridges,
    updateRoad,
    updateBridge,
    addRoadReport,
    news,
    liveNews,
    liveNewsLoading,
    liveNewsError,
    liveNewsLastSynced,
    refreshLiveNews,
    supplies,
    teams,
    coverageGaps,
    resourceDemands,
    distributionPlans,
    addDistributionPlan,
    updateDistributionPlan,
    deliveryRoutes,
    distributionAuditLogs,
    missingPersons,
    sightings,
    candidateMatches,
    userRole,
    volunteers,
    assessments,
    incidents,
    notifications,
    
    demoScenarioStep,
    weatherSources,
    fusedWeather,
    hazardRisks,
    hourlyForecast,
    environmentalSensors,

    setCurrentLocationId,
    setUserRole,
    setDemoScenarioStep,
    addMissingPerson,
    addSighting,
    confirmMatch,
    rejectMatch,
    requestMoreInfo,
    triggerMatchAnalysis,
    addVolunteer,
    addAssessment,
    markNotificationRead,
    registerTeam,
    assignTeamArea,
    updateTeamStatus,
    resetTeamsToDefault,

    // Hospital Missing-Person Matching Network
    hospitalPatients,
    hospitalMatches,
    hospitalAuditLogs,
    hospitalMatchingStats,
    hospitalAccessRole,
    setHospitalAccessRole,
    submitHospitalPatient,
    submitHospitalPatientBatch,
    reviewHospitalMatch,
    resetHospitalDemoData,

    // Nepal DHM River Watch Hydrology Intelligence
    dhmStations,
    dhmSummary,
    dhmLoading,
    dhmError,
    dhmDemoMode,
    setDhmDemoMode,
    refreshDhmStations,
    selectedDhmStation,
    setSelectedDhmStation,

    // Nepal Department of Roads (DOR) Navigate Intelligence
    dorRoadLinks,
    dorClosures,
    dorBridges,
    dorSummary,
    dorLoading,
    dorError,
    dorLastUpdated,
    dorDataSource,
    dorDemoMode,
    setDorDemoMode,
    responderProfile,
    setResponderProfile,
    communityRoadReports,
    addCommunityRoadReport,
    refreshDorRoads,
  };

  return (
    <AppStateContext.Provider value={value}>
      {children}
    </AppStateContext.Provider>
  );
}

export function useAppState() {
  const context = useContext(AppStateContext);
  if (context === undefined) {
    throw new Error('useAppState must be used within an AppStateProvider');
  }
  return context;
}
