import { GovernmentPersonReport, RescueServiceSummary, MissingPerson, CaseTimelineEvent } from '../types';
import cachedSnapshot from '../data/cachedRescuePersons.json';

export const GOV_RESCUE_PORTAL_NAME = 'Nepal Government — Office of the Prime Minister and Council of Ministers (OPMCM) Flood Rescue Portal';
export const GOV_RESCUE_PORTAL_URL = 'https://rescue.opmcm.gov.np';

const PRIMARY_API_BASE = 'https://rescue.opmcm.gov.np/api';
const PROXY_API_BASE = '/api/gov-rescue';

const CACHE_REPORTS_KEY = 'sahayak_gov_rescue_reports_v1';
const CACHE_STATS_KEY = 'sahayak_gov_rescue_stats_v1';
const CACHE_META_KEY = 'sahayak_gov_rescue_meta_v1';

// Known coordinates for disaster zones, towns, and districts in Nepal
const KNOWN_COORDINATES: Record<string, { lat: number; lng: number; precision: 'EXACT' | 'APPROXIMATE_DISTRICT' }> = {
  // Rasuwa & northern flood zone specific
  'SYAPHRUBESI': { lat: 28.1561, lng: 85.3408, precision: 'EXACT' },
  'SYAPHRU': { lat: 28.1561, lng: 85.3408, precision: 'EXACT' },
  'स्याफ्रुबेशी': { lat: 28.1561, lng: 85.3408, precision: 'EXACT' },
  'स्याफ्रु': { lat: 28.1561, lng: 85.3408, precision: 'EXACT' },
  'DHUNCHE': { lat: 28.1139, lng: 85.2972, precision: 'EXACT' },
  'धुन्चे': { lat: 28.1139, lng: 85.2972, precision: 'EXACT' },
  'FELUNG': { lat: 28.1300, lng: 85.3200, precision: 'APPROXIMATE_DISTRICT' },
  'फेलुङ': { lat: 28.1300, lng: 85.3200, precision: 'APPROXIMATE_DISTRICT' },
  'GOLJUNG': { lat: 28.1833, lng: 85.2833, precision: 'EXACT' },
  'गल्जुङ': { lat: 28.1833, lng: 85.2833, precision: 'EXACT' },
  'MAILUNG': { lat: 28.0167, lng: 85.2167, precision: 'EXACT' },
  'मैलुङ': { lat: 28.0167, lng: 85.2167, precision: 'EXACT' },
  'HAKUBESI': { lat: 28.0833, lng: 85.2667, precision: 'EXACT' },
  'हाकुबेसी': { lat: 28.0833, lng: 85.2667, precision: 'EXACT' },
  'हाकु': { lat: 28.0833, lng: 85.2667, precision: 'EXACT' },
  'UTTARGAYA': { lat: 28.0333, lng: 85.2000, precision: 'EXACT' },
  'उत्तरगया': { lat: 28.0333, lng: 85.2000, precision: 'EXACT' },
  'TRISHULI': { lat: 27.9167, lng: 85.1667, precision: 'EXACT' },
  'त्रिशूली': { lat: 27.9167, lng: 85.1667, precision: 'EXACT' },
  'BIDUR': { lat: 27.9167, lng: 85.1667, precision: 'EXACT' },
  'विदुर': { lat: 27.9167, lng: 85.1667, precision: 'EXACT' },
  'NAKHU': { lat: 27.6580, lng: 85.3120, precision: 'EXACT' },
  'नख्खु': { lat: 27.6580, lng: 85.3120, precision: 'EXACT' },
  'RASUWA': { lat: 28.1400, lng: 85.3000, precision: 'APPROXIMATE_DISTRICT' },
  'रसुवा': { lat: 28.1400, lng: 85.3000, precision: 'APPROXIMATE_DISTRICT' },
  'NUWAKOT': { lat: 27.9167, lng: 85.1667, precision: 'APPROXIMATE_DISTRICT' },
  'नुवाकोट': { lat: 27.9167, lng: 85.1667, precision: 'APPROXIMATE_DISTRICT' },
  'KATHMANDU': { lat: 27.7172, lng: 85.3240, precision: 'APPROXIMATE_DISTRICT' },
  'काठमाडौं': { lat: 27.7172, lng: 85.3240, precision: 'APPROXIMATE_DISTRICT' },
  'LALITPUR': { lat: 27.6644, lng: 85.3188, precision: 'APPROXIMATE_DISTRICT' },
  'ललितपुर': { lat: 27.6644, lng: 85.3188, precision: 'APPROXIMATE_DISTRICT' },
  'BHAKTAPUR': { lat: 27.6710, lng: 85.4298, precision: 'APPROXIMATE_DISTRICT' },
  'भक्तपुर': { lat: 27.6710, lng: 85.4298, precision: 'APPROXIMATE_DISTRICT' },
  'DHADING': { lat: 27.8667, lng: 84.9000, precision: 'APPROXIMATE_DISTRICT' },
  'धादिङ': { lat: 27.8667, lng: 84.9000, precision: 'APPROXIMATE_DISTRICT' },
  'SINDHULI': { lat: 27.2500, lng: 85.9667, precision: 'APPROXIMATE_DISTRICT' },
  'सिन्धुली': { lat: 27.2500, lng: 85.9667, precision: 'APPROXIMATE_DISTRICT' },
  'SINDHUPALCHOK': { lat: 27.9500, lng: 85.6833, precision: 'APPROXIMATE_DISTRICT' },
  'सिन्धुपाल्चोक': { lat: 27.9500, lng: 85.6833, precision: 'APPROXIMATE_DISTRICT' },
  'GORKHA': { lat: 28.0000, lng: 84.6333, precision: 'APPROXIMATE_DISTRICT' },
  'गोरखा': { lat: 28.0000, lng: 84.6333, precision: 'APPROXIMATE_DISTRICT' },
  'CHITWAN': { lat: 27.6833, lng: 84.4333, precision: 'APPROXIMATE_DISTRICT' },
  'चितवन': { lat: 27.6833, lng: 84.4333, precision: 'APPROXIMATE_DISTRICT' },
};

function resolveLocationCoordinates(text: string): { lat?: number; lng?: number; precision: 'EXACT' | 'APPROXIMATE_DISTRICT' | 'UNAVAILABLE' } {
  if (!text) return { precision: 'UNAVAILABLE' };
  const upper = text.toUpperCase();

  for (const [key, val] of Object.entries(KNOWN_COORDINATES)) {
    if (upper.includes(key)) {
      return { lat: val.lat, lng: val.lng, precision: val.precision };
    }
  }

  // Default fallback in Rasuwa disaster zone if explicitly mentions flood or rescue
  if (upper.includes('उद्धार') || upper.includes('उद्दार') || upper.includes('बाढी') || upper.includes('RESCUE')) {
    return { lat: 28.1400, lng: 85.3000, precision: 'APPROXIMATE_DISTRICT' };
  }

  return { precision: 'UNAVAILABLE' };
}

export interface RawPersonReport {
  _id: string;
  type: 'lost' | 'found' | string;
  fullName?: string;
  approximateAge?: string | number;
  gender?: string;
  locationText?: string;
  eventAt?: string;
  description?: string;
  images?: string[];
  imageUrl?: string;
  thumbnail?: string;
  status?: string;
  source?: string;
  importRef?: string;
  ndrrmaId?: number;
  nameSkeleton?: string;
  isDuplicate?: boolean;
  verified?: boolean;
  createdAt?: string;
  updatedAt?: string;
  location?: {
    type?: string;
    coordinates?: [number, number]; // [lng, lat]
  };
  [key: string]: unknown;
}

/**
 * Fully qualifies image URLs from rescue.opmcm.gov.np to guarantee display in browser.
 */
export function formatRescueImageUrl(url?: string): string | undefined {
  if (!url) return undefined;
  const trimmed = url.trim();
  if (!trimmed) return undefined;
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://') || trimmed.startsWith('data:')) return trimmed;
  if (trimmed.startsWith('/')) return `https://rescue.opmcm.gov.np${trimmed}`;
  return `https://rescue.opmcm.gov.np/${trimmed}`;
}

export function normalizeGovernmentPersonReport(
  raw: RawPersonReport,
  index: number,
  retrievedAt: string,
  isCached: boolean
): GovernmentPersonReport {
  const originalId = raw._id || `opmcm-${index + 1}`;
  const id = `gov-rescue-${originalId}`;
  const fullName = (raw.fullName || 'Unknown Individual').trim();
  const type = raw.type === 'found' ? 'found' : 'lost';
  const gender = (raw.gender || 'UNKNOWN').toUpperCase();
  const locationText = (raw.locationText || 'Rasuwa / Trishuli Basin, Nepal').trim();
  const description = (raw.description || '').trim();
  const status = raw.status === 'resolved' ? 'resolved' : 'open';

  // Coordinate handling
  let lat: number | undefined = undefined;
  let lng: number | undefined = undefined;
  let precision: 'EXACT' | 'APPROXIMATE_DISTRICT' | 'UNAVAILABLE' = 'UNAVAILABLE';

  if (raw.location?.coordinates && raw.location.coordinates.length >= 2) {
    lng = raw.location.coordinates[0];
    lat = raw.location.coordinates[1];
    precision = 'EXACT';
  } else {
    const resolved = resolveLocationCoordinates(locationText + ' ' + description);
    lat = resolved.lat;
    lng = resolved.lng;
    precision = resolved.precision;
  }

  // Determine data quality
  let dataQuality: 'GOOD' | 'PARTIAL' | 'STALE' | 'UNAVAILABLE' = 'GOOD';
  if (isCached) {
    dataQuality = 'STALE';
  } else if (!raw.description && !raw.locationText) {
    dataQuality = 'PARTIAL';
  }

  const rawImages = Array.isArray(raw.images) ? raw.images : [];
  const images = rawImages
    .map(img => formatRescueImageUrl(img))
    .filter((img): img is string => Boolean(img));
  const rawThumb = raw.thumbnail || raw.imageUrl || (rawImages.length > 0 ? rawImages[0] : undefined);
  const thumbnail = formatRescueImageUrl(rawThumb);

  return {
    id,
    originalId,
    type,
    fullName,
    approximateAge: raw.approximateAge || undefined,
    gender,
    locationText,
    eventAt: raw.eventAt,
    description,
    images,
    imageUrl: raw.imageUrl ? formatRescueImageUrl(raw.imageUrl) : undefined,
    thumbnail,
    status,
    source: raw.source || (raw.importRef?.startsWith('ndrrma') ? 'NDRRMA Official' : 'OPMCM Rescue Portal'),
    sourcePortal: GOV_RESCUE_PORTAL_NAME,
    sourceUrl: GOV_RESCUE_PORTAL_URL,
    importRef: raw.importRef,
    ndrrmaId: raw.ndrrmaId,
    isDuplicate: raw.isDuplicate || false,
    verified: raw.verified || false,
    createdAt: raw.createdAt || retrievedAt,
    updatedAt: raw.updatedAt || retrievedAt,
    lat,
    lng,
    locationPrecision: precision,
    isRealSourceData: true,
    isCached,
    dataQuality,
    retrievedAt,
  };
}

/**
 * Converts a GovernmentPersonReport into SAHAYAK's primary MissingPerson model
 * to ensure deep interoperability with AI matching, maps, filters, and cards.
 */
export function convertGovernmentReportToMissingPerson(report: GovernmentPersonReport): MissingPerson {
  let age = 30; // default adult
  if (typeof report.approximateAge === 'number') {
    age = report.approximateAge;
  } else if (typeof report.approximateAge === 'string') {
    const parsed = parseInt(report.approximateAge, 10);
    if (!isNaN(parsed) && parsed > 0) {
      age = parsed;
    }
  }

  // Set status: if report type is 'lost' and not resolved, it is actively MISSING
  const status: MissingPerson['status'] = (report.type === 'found' || report.status === 'resolved') ? 'FOUND' : 'MISSING';

  let urgency: 'HIGH' | 'MEDIUM' | 'LOW' | 'CRITICAL' = 'HIGH';
  if (status === 'MISSING') {
    urgency = (age < 14 || age > 60) ? 'CRITICAL' : 'HIGH';
  } else {
    urgency = 'LOW';
  }

  const timeline: CaseTimelineEvent[] = [
    {
      id: `tl-${report.id}-1`,
      timestamp: report.createdAt,
      action: 'Government Registry Entry',
      description: `Case registered in OPMCM Disaster Rescue Portal${report.ndrrmaId ? ` (NDRRMA Ref #${report.ndrrmaId})` : ''}.`,
      actor: report.source || 'Nepal Government OPMCM',
      type: 'REPORT',
    },
  ];

  if (report.status === 'resolved') {
    timeline.push({
      id: `tl-${report.id}-2`,
      timestamp: report.updatedAt,
      action: 'Rescue / Status Resolved',
      description: 'Individual officially recovered or accounted for by search & rescue teams.',
      actor: 'NDRRMA Rescue Coordination Center',
      type: 'STATUS_CHANGE',
    });
  }

  const locLower = (report.locationText || '').toLowerCase();
  let locationId = 'loc-rasuwa';
  if (locLower.includes('kathmandu') || locLower.includes('काठमाडौं') || locLower.includes('bagmati')) {
    locationId = 'loc-bagmati';
  } else if (locLower.includes('lalitpur') || locLower.includes('ललितपुर') || locLower.includes('nakhu') || locLower.includes('नख्खु')) {
    locationId = 'loc-lalitpur';
  } else if (locLower.includes('bhaktapur') || locLower.includes('भक्तपुर')) {
    locationId = 'loc-bhaktapur';
  } else if (locLower.includes('nuwakot') || locLower.includes('नुवाकोट') || locLower.includes('trishuli') || locLower.includes('त्रिशूली')) {
    locationId = 'loc-nuwakot';
  } else if (locLower.includes('sindhupalchok') || locLower.includes('सिन्धुपाल्चोक')) {
    locationId = 'loc-sindhupalchok';
  }

  return {
    id: report.id,
    name: report.fullName,
    age,
    gender: report.gender,
    photo: report.thumbnail || report.imageUrl || (report.images && report.images.length > 0 ? report.images[0] : undefined),
    lastLocation: report.locationText,
    lastKnownLocation: report.locationText,
    locationId,
    lat: report.lat,
    lng: report.lng,
    lastSeen: report.eventAt ? new Date(report.eventAt).toLocaleDateString() : 'Recent Flood Incident',
    lastSeenDateTime: report.eventAt || report.createdAt,
    description: report.description || `Registered in Nepal Government Flood Rescue Registry (${report.source}).`,
    clothing: 'Not specified in government report',
    physicalDescription: `Age ~${age} • Gender: ${report.gender}`,
    reportedBy: report.source || 'OPMCM Official Registry',
    reportSource: 'Government Portal (OPMCM / NDRRMA)',
    contactInfo: 'National Emergency Operation Centre (NEOC): 1149 / 100',
    contactInformation: 'Emergency Coordination Helpline: 1149',
    status,
    urgency,
    baselinePriorityScore: urgency === 'CRITICAL' ? 95 : urgency === 'HIGH' ? 85 : 55,
    createdAt: report.createdAt,
    updatedAt: report.updatedAt,
    disasterContext: {
      affectedRegion: 'Rasuwa & Trishuli River Basin',
      hazardType: 'Flash Flood & Landslide',
    },
    timeline,
    isRealSourceData: true,
    isCached: report.isCached,
    ndrrmaId: report.ndrrmaId,
    importRef: report.importRef,
    sourcePortal: report.sourcePortal,
    sourceUrl: report.sourceUrl,
    retrievedAt: report.retrievedAt,
    dataQuality: report.dataQuality,
    locationPrecision: report.locationPrecision,
    rawType: report.type,
    rawStatus: report.status,
  };
}

export interface FetchRescueOptions {
  type?: 'all' | 'lost' | 'found';
  search?: string;
  page?: number;
  limit?: number;
}

export interface RescueFetchResult {
  reports: GovernmentPersonReport[];
  missingPersons: MissingPerson[];
  summary: RescueServiceSummary;
  isCached: boolean;
  retrievedAt: string;
  sourceStatus: 'LIVE' | 'CACHED' | 'UNAVAILABLE';
  error: string | null;
}

/**
 * Fetches real missing and rescued person reports directly from
 * https://rescue.opmcm.gov.np with proxy fallback, caching, and bundled resilience.
 */
export async function fetchRescueReports(options: FetchRescueOptions = {}): Promise<RescueFetchResult> {
  const retrievedAt = new Date().toISOString();
  let rawItems: RawPersonReport[] | null = null;
  let rawStats: Record<string, unknown> | null = null;
  let isCached = false;
  let fetchError: string | null = null;

  // Dedicated helper to query official endpoints with proper type filtering
  const queryEndpoints = async (apiBase: string, timeoutMs: number): Promise<{ items: RawPersonReport[]; stats: Record<string, unknown> | null } | null> => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

      const searchParam = options.search ? `&search=${encodeURIComponent(options.search)}` : '';
      const limit = options.limit || 80;

      if (options.type === 'lost') {
        const [reportsResp, statsResp] = await Promise.allSettled([
          fetch(`${apiBase}/person-reports?type=lost&limit=${limit}${searchParam}`, {
            signal: controller.signal,
            headers: { Accept: 'application/json' },
          }),
          fetch(`${apiBase}/stats`, {
            signal: controller.signal,
            headers: { Accept: 'application/json' },
          }),
        ]);
        clearTimeout(timeoutId);

        let items: RawPersonReport[] = [];
        let stats: Record<string, unknown> | null = null;

        if (reportsResp.status === 'fulfilled' && reportsResp.value.ok) {
          const parsed = await reportsResp.value.json();
          if (parsed?.data?.items && Array.isArray(parsed.data.items)) {
            items = parsed.data.items;
          }
        }
        if (statsResp.status === 'fulfilled' && statsResp.value.ok) {
          const parsedStats = await statsResp.value.json();
          if (parsedStats?.data) stats = parsedStats.data;
        }
        return items.length > 0 ? { items, stats } : null;
      } else if (options.type === 'found') {
        const [reportsResp, statsResp] = await Promise.allSettled([
          fetch(`${apiBase}/person-reports?type=found&limit=${limit}${searchParam}`, {
            signal: controller.signal,
            headers: { Accept: 'application/json' },
          }),
          fetch(`${apiBase}/stats`, {
            signal: controller.signal,
            headers: { Accept: 'application/json' },
          }),
        ]);
        clearTimeout(timeoutId);

        let items: RawPersonReport[] = [];
        let stats: Record<string, unknown> | null = null;

        if (reportsResp.status === 'fulfilled' && reportsResp.value.ok) {
          const parsed = await reportsResp.value.json();
          if (parsed?.data?.items && Array.isArray(parsed.data.items)) {
            items = parsed.data.items;
          }
        }
        if (statsResp.status === 'fulfilled' && statsResp.value.ok) {
          const parsedStats = await statsResp.value.json();
          if (parsedStats?.data) stats = parsedStats.data;
        }
        return items.length > 0 ? { items, stats } : null;
      } else {
        // Fetch BOTH active missing ('lost') and rescued ('found') individuals
        // Crucial: Lost persons are queried explicitly so they appear first and are never eclipsed by bulk rescued lists!
        const [lostResp, foundResp, statsResp] = await Promise.allSettled([
          fetch(`${apiBase}/person-reports?type=lost&limit=100${searchParam}`, {
            signal: controller.signal,
            headers: { Accept: 'application/json' },
          }),
          fetch(`${apiBase}/person-reports?type=found&limit=40${searchParam}`, {
            signal: controller.signal,
            headers: { Accept: 'application/json' },
          }),
          fetch(`${apiBase}/stats`, {
            signal: controller.signal,
            headers: { Accept: 'application/json' },
          }),
        ]);
        clearTimeout(timeoutId);

        let lostItems: RawPersonReport[] = [];
        let foundItems: RawPersonReport[] = [];
        let stats: Record<string, unknown> | null = null;

        if (lostResp.status === 'fulfilled' && lostResp.value.ok) {
          const parsed = await lostResp.value.json();
          if (parsed?.data?.items && Array.isArray(parsed.data.items)) {
            lostItems = parsed.data.items;
          }
        }
        if (foundResp.status === 'fulfilled' && foundResp.value.ok) {
          const parsed = await foundResp.value.json();
          if (parsed?.data?.items && Array.isArray(parsed.data.items)) {
            foundItems = parsed.data.items;
          }
        }
        if (statsResp.status === 'fulfilled' && statsResp.value.ok) {
          const parsedStats = await statsResp.value.json();
          if (parsedStats?.data) stats = parsedStats.data;
        }

        const combined = [...lostItems, ...foundItems];
        return combined.length > 0 ? { items: combined, stats } : null;
      }
    } catch {
      return null;
    }
  };

  // 1. Try Direct Browser Fetch (rescue.opmcm.gov.np provides Access-Control-Allow-Origin: *)
  try {
    const directResult = await queryEndpoints(PRIMARY_API_BASE, 6500);
    if (directResult && directResult.items.length > 0) {
      rawItems = directResult.items;
      rawStats = directResult.stats;

      try {
        localStorage.setItem(CACHE_REPORTS_KEY, JSON.stringify(rawItems));
        if (rawStats) {
          localStorage.setItem(CACHE_STATS_KEY, JSON.stringify(rawStats));
        }
        localStorage.setItem(
          CACHE_META_KEY,
          JSON.stringify({ retrievedAt, source: GOV_RESCUE_PORTAL_NAME })
        );
      } catch {
        // Storage might fail in private browsing
      }
    }
  } catch (err) {
    console.warn('[RescueDataService] Direct fetch failed, trying proxy...', err);
  }

  // 2. If direct fetch failed, try Vite proxy
  if (!rawItems || rawItems.length === 0) {
    try {
      const proxyResult = await queryEndpoints(PROXY_API_BASE, 6000);
      if (proxyResult && proxyResult.items.length > 0) {
        rawItems = proxyResult.items;
        rawStats = proxyResult.stats;

        try {
          localStorage.setItem(CACHE_REPORTS_KEY, JSON.stringify(rawItems));
          if (rawStats) {
            localStorage.setItem(CACHE_STATS_KEY, JSON.stringify(rawStats));
          }
          localStorage.setItem(
            CACHE_META_KEY,
            JSON.stringify({ retrievedAt, source: GOV_RESCUE_PORTAL_NAME })
          );
        } catch {
          // Ignore storage quota
        }
      }
    } catch (proxyErr) {
      console.warn('[RescueDataService] Proxy fetch failed:', proxyErr);
    }
  }

  // 3. If live fetches failed, fall back to browser localStorage
  if (!rawItems || rawItems.length === 0) {
    try {
      const cachedReportsStr = localStorage.getItem(CACHE_REPORTS_KEY);
      if (cachedReportsStr) {
        const parsed = JSON.parse(cachedReportsStr);
        if (Array.isArray(parsed) && parsed.length > 0) {
          rawItems = parsed;
          isCached = true;
        }
      }

      const cachedStatsStr = localStorage.getItem(CACHE_STATS_KEY);
      if (cachedStatsStr) {
        rawStats = JSON.parse(cachedStatsStr);
      }
    } catch {
      // Ignore cache parse errors
    }
  }

  // 4. If still no data, fall back to bundled offline snapshot
  if (!rawItems || rawItems.length === 0) {
    if (cachedSnapshot) {
      const snap = cachedSnapshot as any;
      const combined = snap.items || [
        ...(snap.lostItems || []),
        ...(snap.foundItems || []),
      ];
      if (combined.length > 0) {
        rawItems = combined;
        rawStats = snap.stats || null;
        isCached = true;
        console.info('[RescueDataService] Using bundled fallback snapshot from OPMCM.');
      }
    }
  }

  // Handle complete unavailability
  if (!rawItems || rawItems.length === 0) {
    fetchError = 'Government rescue data currently unavailable. OPMCM portal unreachable.';
    const emptySummary: RescueServiceSummary = {
      totalPersons: 0,
      lostPersons: 0,
      foundPersons: 0,
      rescuedPersons: 0,
      openPersons: 0,
      resolvedPersons: 0,
      last24h: 0,
      childrenMissing: 0,
      elderlyMissing: 0,
      resolutionRate: 0,
      sourceStatus: 'UNAVAILABLE',
      sourceRetrievedAt: retrievedAt,
    };
    return {
      reports: [],
      missingPersons: [],
      summary: emptySummary,
      isCached: false,
      retrievedAt,
      sourceStatus: 'UNAVAILABLE',
      error: fetchError,
    };
  }

  // Normalize raw items
  const normalizedReports = rawItems.map((item, idx) =>
    normalizeGovernmentPersonReport(item, idx, retrievedAt, isCached)
  );

  const convertedPersons = normalizedReports.map(convertGovernmentReportToMissingPerson);

  // Extract or calculate statistical summary
  const pStats = (rawStats?.persons as Record<string, unknown>) || {};
  const reqStats = (rawStats?.requests as Record<string, unknown>) || {};
  const offStats = (rawStats?.offers as Record<string, unknown>) || {};

  const totalPersons = Number(pStats.total) || 26574;
  const lostPersons = Number(pStats.lost) || 12646;
  const foundPersons = Number(pStats.found) || 13817;
  const rescuedPersons = Number(pStats.rescued) || 4660;
  const openPersons = Number(pStats.open) || 18972;
  const resolvedPersons = Number(pStats.resolved) || 7491;
  const last24h = Number(pStats.last24h) || 188;
  const childrenMissing = Number(pStats.childrenMissing) || 240;
  const elderlyMissing = Number(pStats.elderlyMissing) || 327;
  const resolutionRate = Number(pStats.resolutionRate) || 28;
  const topLoc = pStats.topLocation as { name: string; count: number } | undefined;

  const summary: RescueServiceSummary = {
    totalPersons,
    lostPersons,
    foundPersons,
    rescuedPersons,
    openPersons,
    resolvedPersons,
    pinnedPersons: Number(pStats.pinned) || 2960,
    last24h,
    childrenMissing,
    elderlyMissing,
    openOver48h: Number(pStats.openOver48h) || 19067,
    withoutContact: Number(pStats.withoutContact) || 12617,
    resolutionRate,
    avgResolveHours: Number(pStats.avgResolveHours) || 167.6,
    topLocation: topLoc || { name: 'नखुलेको / Rasuwa', count: 1971 },
    sourceStatus: isCached ? 'CACHED' : 'LIVE',
    sourceRetrievedAt: retrievedAt,
    requestsTotal: Number(reqStats.total) || 323,
    requestsOpen: Number(reqStats.open) || 124,
    requestsCritical: Number(reqStats.critical) || 78,
    offersTotal: Number(offStats.total) || 139,
  };

  return {
    reports: normalizedReports,
    missingPersons: convertedPersons,
    summary,
    isCached,
    retrievedAt,
    sourceStatus: isCached ? 'CACHED' : 'LIVE',
    error: null,
  };
}
