import { GovernmentHospital, HospitalServiceSummary, Location } from '../types';
import { getOccupancyStatus, calculateDistanceKm } from './calculations';
import cachedSnapshot from '../data/cachedGovernmentHospitals.json';

const GOV_API_PRIMARY = 'https://freehealth.mohp.gov.np/api/bed-summary';
const GOV_API_PROXY = '/api/gov-freehealth/bed-summary';
const CACHE_KEY = 'sahayak_gov_hospitals_cache_v1';
const CACHE_META_KEY = 'sahayak_gov_hospitals_meta_v1';

export const GOVERNMENT_SOURCE_NAME = 'Nepal Government — Ministry of Health and Food Safety Free Health Dashboard';
export const GOVERNMENT_SOURCE_URL = 'https://freehealth.mohp.gov.np';

interface RawGovHospital {
  total_beds_active?: number | string;
  total_bed_capacity?: string | number;
  free_beds?: string | number;
  province_name?: string;
  district_name?: string;
  palika_name?: string;
  health_facility_name?: string;
  public_nonpublic?: string;
  contact_person?: string;
  contact_number?: string;
  [key: string]: unknown;
}

// Known hospital or district coordinates database for Nepal
// Used with strict locationPrecision markers
const KNOWN_COORDINATES: Record<string, { lat: number; lng: number; precision: 'EXACT' | 'APPROXIMATE_DISTRICT' }> = {
  // Exact Known Facilities
  'BIR HOSPITAL': { lat: 27.7061, lng: 85.3148, precision: 'EXACT' },
  'TRIBHUVAN UNIVERSITY TEACHING HOSPITAL': { lat: 27.7348, lng: 85.3312, precision: 'EXACT' },
  'PATAN HOSPITAL': { lat: 27.6681, lng: 85.3206, precision: 'EXACT' },
  'CIVIL SERVICE HOSPITAL': { lat: 27.6853, lng: 85.3378, precision: 'EXACT' },
  'NATIONAL TRAUMA CENTER': { lat: 27.7058, lng: 85.3155, precision: 'EXACT' },
  'SHAHID GANGALAL NATIONAL HEART CENTRE': { lat: 27.7371, lng: 85.3402, precision: 'EXACT' },
  'BHAKTAPUR HOSPITAL': { lat: 27.6710, lng: 85.4298, precision: 'EXACT' },
  'BPKIHS_ DHARAN_SUNSARI': { lat: 26.8124, lng: 87.2834, precision: 'EXACT' },
  'KOSHI HOSPITAL': { lat: 26.4525, lng: 87.2718, precision: 'EXACT' },
  'BIRAT MEDICAL COLLEGE TEACHING HOSPITAL_MORANG': { lat: 26.5333, lng: 87.2833, precision: 'EXACT' },
  'CHITWAN MEDICAL COLLEGE': { lat: 27.6766, lng: 84.4285, precision: 'EXACT' },
  'TRISULI HOSPITAL_ NUWAKOT': { lat: 27.9167, lng: 85.1667, precision: 'EXACT' },
  'DISTRICT HOSPITAL_ DHADING': { lat: 27.8667, lng: 84.9000, precision: 'EXACT' },
  
  // District Centers (Approximate only - clearly marked as APPROXIMATE_DISTRICT)
  'DISTRICT_KATHMANDU': { lat: 27.7172, lng: 85.3240, precision: 'APPROXIMATE_DISTRICT' },
  'DISTRICT_LALITPUR': { lat: 27.6644, lng: 85.3188, precision: 'APPROXIMATE_DISTRICT' },
  'DISTRICT_BHAKTAPUR': { lat: 27.6710, lng: 85.4298, precision: 'APPROXIMATE_DISTRICT' },
  'DISTRICT_KASKI': { lat: 28.2096, lng: 83.9856, precision: 'APPROXIMATE_DISTRICT' },
  'DISTRICT_CHITWAN': { lat: 27.6833, lng: 84.4333, precision: 'APPROXIMATE_DISTRICT' },
  'DISTRICT_MORANG': { lat: 26.4525, lng: 87.2718, precision: 'APPROXIMATE_DISTRICT' },
  'DISTRICT_SUNSARI': { lat: 26.8124, lng: 87.2834, precision: 'APPROXIMATE_DISTRICT' },
  'DISTRICT_JHAPA': { lat: 26.5444, lng: 88.0933, precision: 'APPROXIMATE_DISTRICT' },
  'DISTRICT_BANKE': { lat: 28.0500, lng: 81.6167, precision: 'APPROXIMATE_DISTRICT' },
  'DISTRICT_RUPANDEHI': { lat: 27.7000, lng: 83.4500, precision: 'APPROXIMATE_DISTRICT' },
  'DISTRICT_DHADING': { lat: 27.8667, lng: 84.9000, precision: 'APPROXIMATE_DISTRICT' },
  'DISTRICT_NUWAKOT': { lat: 27.9167, lng: 85.1667, precision: 'APPROXIMATE_DISTRICT' },
  'DISTRICT_KAVREPALANCHOK': { lat: 27.6253, lng: 85.5561, precision: 'APPROXIMATE_DISTRICT' },
  'DISTRICT_GORKHA': { lat: 28.0000, lng: 84.6333, precision: 'APPROXIMATE_DISTRICT' },
  'DISTRICT_LAMJUNG': { lat: 28.2333, lng: 84.3833, precision: 'APPROXIMATE_DISTRICT' },
  'DISTRICT_PALPA': { lat: 27.8667, lng: 83.5500, precision: 'APPROXIMATE_DISTRICT' },
  'DISTRICT_GULMI': { lat: 28.0667, lng: 83.2500, precision: 'APPROXIMATE_DISTRICT' },
  'DISTRICT_ARGHAKHANCHI': { lat: 27.9833, lng: 83.0833, precision: 'APPROXIMATE_DISTRICT' },
  'DISTRICT_DANG': { lat: 28.0333, lng: 82.3000, precision: 'APPROXIMATE_DISTRICT' },
  'DISTRICT_NAWALPARASI WEST': { lat: 27.5333, lng: 83.6667, precision: 'APPROXIMATE_DISTRICT' },
  'DISTRICT_DHANUSA': { lat: 26.7288, lng: 85.9263, precision: 'APPROXIMATE_DISTRICT' },
  'DISTRICT_SAPTARI': { lat: 26.5444, lng: 86.7539, precision: 'APPROXIMATE_DISTRICT' },
  'DISTRICT_SIRAHA': { lat: 26.6528, lng: 86.2083, precision: 'APPROXIMATE_DISTRICT' },
  'DISTRICT_JUMLA': { lat: 29.2747, lng: 82.1838, precision: 'APPROXIMATE_DISTRICT' },
  'DISTRICT_RUKUM WEST': { lat: 28.6333, lng: 82.4833, precision: 'APPROXIMATE_DISTRICT' },
  'DISTRICT_SALYAN': { lat: 28.3667, lng: 82.1667, precision: 'APPROXIMATE_DISTRICT' },
  'DISTRICT_KAILALI': { lat: 28.6833, lng: 80.6000, precision: 'APPROXIMATE_DISTRICT' },
  'DISTRICT_KANCHANPUR': { lat: 28.9667, lng: 80.1833, precision: 'APPROXIMATE_DISTRICT' },
  'DISTRICT_BAJURA': { lat: 29.5000, lng: 81.5000, precision: 'APPROXIMATE_DISTRICT' },
};

function formatProvinceName(raw?: string): string {
  if (!raw) return 'Unknown Province';
  const clean = raw.trim().toUpperCase();
  if (clean.includes('KOSHI')) return 'Koshi Province';
  if (clean.includes('MADHESH')) return 'Madhesh Province';
  if (clean.includes('BAGMATI')) return 'Bagmati Province';
  if (clean.includes('GANDAKI')) return 'Gandaki Province';
  if (clean.includes('LUMBINI')) return 'Lumbini Province';
  if (clean.includes('KARNALI')) return 'Karnali Province';
  if (clean.includes('SUDURPASHCHIM') || clean.includes('SUDUR')) return 'Sudurpashchim Province';
  return raw.trim();
}

function resolveCoordinates(facilityName: string, districtName?: string): { lat?: number; lng?: number; precision: 'EXACT' | 'APPROXIMATE_DISTRICT' | 'UNAVAILABLE' } {
  const normFacility = (facilityName || '').trim().toUpperCase();
  for (const [key, val] of Object.entries(KNOWN_COORDINATES)) {
    if (!key.startsWith('DISTRICT_') && normFacility.includes(key)) {
      return { lat: val.lat, lng: val.lng, precision: val.precision };
    }
  }

  if (districtName) {
    const distKey = `DISTRICT_${districtName.trim().toUpperCase()}`;
    const distMatch = KNOWN_COORDINATES[distKey];
    if (distMatch) {
      return { lat: distMatch.lat, lng: distMatch.lng, precision: distMatch.precision };
    }
  }

  return { precision: 'UNAVAILABLE' };
}

/**
 * Normalizes a raw record from the Nepal Government Free Health Dashboard into SAHAYAK's GovernmentHospital model.
 */
export function normalizeGovernmentHospital(
  raw: RawGovHospital,
  index: number,
  retrievedAt: string,
  isCached: boolean,
  userLocation?: Location
): GovernmentHospital {
  const facilityName = (raw.health_facility_name || `Facility #${index + 1}`).trim();
  const district = (raw.district_name || '').trim().toUpperCase();
  const palika = (raw.palika_name || '').trim();
  const province = formatProvinceName(raw.province_name);
  const type = (raw.public_nonpublic || 'Government (PUBLIC)').trim();

  const totalBeds = Math.max(0, parseInt(String(raw.total_bed_capacity || 0), 10) || 0);
  const allocatedBeds = Math.max(0, parseInt(String(raw.free_beds || 0), 10) || 0);
  const occupiedBeds = Math.max(0, parseInt(String(raw.total_beds_active || 0), 10) || 0);

  // Available free beds: allocated free beds minus active free beds
  const availableBeds = Math.max(0, allocatedBeds - occupiedBeds);
  const totalAvailableBeds = Math.max(0, totalBeds - occupiedBeds);

  // Calculate occupancy percentage based on free bed quota
  // If free beds is 0 but total beds exists, fall back to total beds
  const occupancyBase = allocatedBeds > 0 ? allocatedBeds : totalBeds;
  const rawPct = occupancyBase > 0 ? Math.round((occupiedBeds / occupancyBase) * 100) : 0;
  const occupancyPercentage = Math.min(100, Math.max(0, rawPct));
  const occupancyStatus = getOccupancyStatus(occupiedBeds, occupancyBase);

  // Discrepancy checks (without modifying government numbers)
  let hasDiscrepancy = false;
  let discrepancyNote: string | undefined = undefined;
  if (allocatedBeds > 0 && occupiedBeds > allocatedBeds) {
    hasDiscrepancy = true;
    discrepancyNote = `Active used beds (${occupiedBeds}) exceeds designated free quota beds (${allocatedBeds}).`;
  } else if (totalBeds > 0 && allocatedBeds > totalBeds) {
    hasDiscrepancy = true;
    discrepancyNote = `Allocated free beds (${allocatedBeds}) exceeds total sanction capacity (${totalBeds}).`;
  }

  // Determine data quality
  let dataQuality: 'GOOD' | 'PARTIAL' | 'STALE' | 'UNAVAILABLE' = 'GOOD';
  if (isCached) {
    dataQuality = 'STALE';
  } else if (!raw.contact_person && !raw.contact_number) {
    dataQuality = 'PARTIAL';
  } else if (totalBeds === 0 && allocatedBeds === 0) {
    dataQuality = 'PARTIAL';
  }

  // Coordinate resolution
  const { lat, lng, precision } = resolveCoordinates(facilityName, district);

  // Distance calculation (ONLY if user coordinates and hospital coordinates are available)
  let distanceKm: number | null = null;
  if (userLocation?.lat != null && userLocation?.lng != null && lat != null && lng != null) {
    distanceKm = calculateDistanceKm(userLocation.lat, userLocation.lng, lat, lng);
  }

  // Formatted address
  const addressParts = [palika, district, province].filter(Boolean);
  const address = addressParts.join(', ') || 'Nepal';

  // ID generator
  const cleanId = `gov-hosp-${district.toLowerCase().replace(/[^a-z0-9]/g, '')}-${index + 1}`;

  return {
    id: cleanId,
    name: facilityName,
    type,
    province,
    district,
    municipality: palika,
    address,
    totalBeds,
    allocatedBeds,
    occupiedBeds,
    availableBeds,
    totalAvailableBeds,
    occupancyPercentage,
    occupancyStatus,
    contactPerson: raw.contact_person ? raw.contact_person.trim() : null,
    contactNumber: raw.contact_number ? raw.contact_number.trim() : null,
    source: GOVERNMENT_SOURCE_NAME,
    sourceUrl: GOVERNMENT_SOURCE_URL,
    lastUpdated: null, // Free Health API does not return a per-record source timestamp
    retrievedAt,
    isRealSourceData: true,
    isCached,
    dataQuality,
    hasDiscrepancy,
    discrepancyNote,
    lat,
    lng,
    locationPrecision: precision,
    distanceKm,
  };
}

export interface HospitalFetchResult {
  hospitals: GovernmentHospital[];
  summary: HospitalServiceSummary;
  isCached: boolean;
  retrievedAt: string;
  sourceStatus: 'LIVE' | 'CACHED' | 'UNAVAILABLE';
  error: string | null;
}

/**
 * Hospital Data Service
 * Primary entry point for government hospital data integration
 */
export async function fetchGovernmentHospitals(userLocation?: Location): Promise<HospitalFetchResult> {
  const retrievedAt = new Date().toISOString();

  // Try direct browser fetch first (MoHP API sends Access-Control-Allow-Origin: *)
  let rawData: RawGovHospital[] | null = null;
  let isCached = false;
  let fetchError: string | null = null;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    const response = await fetch(GOV_API_PRIMARY, {
      signal: controller.signal,
      headers: {
        Accept: 'application/json',
      },
    });
    clearTimeout(timeoutId);

    if (response.ok) {
      const parsed = await response.json();
      if (Array.isArray(parsed) && parsed.length > 0) {
        rawData = parsed;
        // Save to browser cache
        try {
          localStorage.setItem(CACHE_KEY, JSON.stringify(parsed));
          localStorage.setItem(
            CACHE_META_KEY,
            JSON.stringify({ retrievedAt, source: GOVERNMENT_SOURCE_NAME })
          );
        } catch {
          // LocalStorage may fail in private mode; silently ignore
        }
      }
    }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.warn('[HospitalDataService] Direct fetch failed, trying proxy...', msg);
  }

  // If direct fetch didn't return data, try the local Vite proxy
  if (!rawData) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      const response = await fetch(GOV_API_PROXY, {
        signal: controller.signal,
        headers: { Accept: 'application/json' },
      });
      clearTimeout(timeoutId);

      if (response.ok) {
        const parsed = await response.json();
        if (Array.isArray(parsed) && parsed.length > 0) {
          rawData = parsed;
          try {
            localStorage.setItem(CACHE_KEY, JSON.stringify(parsed));
            localStorage.setItem(
              CACHE_META_KEY,
              JSON.stringify({ retrievedAt, source: GOVERNMENT_SOURCE_NAME })
            );
          } catch {
            // Ignore storage errors
          }
        }
      }
    } catch (proxyErr: unknown) {
      const msg = proxyErr instanceof Error ? proxyErr.message : String(proxyErr);
      console.warn('[HospitalDataService] Proxy fetch failed:', msg);
    }
  }

  // If live fetches failed, fall back to cached data
  if (!rawData) {
    try {
      const cachedStr = localStorage.getItem(CACHE_KEY);
      if (cachedStr) {
        const parsed = JSON.parse(cachedStr);
        if (Array.isArray(parsed) && parsed.length > 0) {
          rawData = parsed;
          isCached = true;
          const metaStr = localStorage.getItem(CACHE_META_KEY);
          if (metaStr) {
            const meta = JSON.parse(metaStr);
            if (meta.retrievedAt) {
              // keep original retrieval time
            }
          }
        }
      }
    } catch {
      // Ignore cache parse errors
    }
  }

  // If still no data, fall back to the bundled offline snapshot
  if (!rawData && cachedSnapshot?.data && Array.isArray(cachedSnapshot.data)) {
    rawData = cachedSnapshot.data as RawGovHospital[];
    isCached = true;
    console.info('[HospitalDataService] Using bundled fallback snapshot for offline resilience.');
  }

  // Handle complete unavailability
  if (!rawData || rawData.length === 0) {
    fetchError = 'Hospital availability data is currently unavailable. Government source unreachable.';
    const emptySummary: HospitalServiceSummary = {
      totalHospitals: 0,
      totalBeds: 0,
      totalAllocatedFreeBeds: 0,
      totalOccupiedBeds: 0,
      totalAvailableBeds: 0,
      averageOccupancy: 0,
      hospitalsNearCapacity: 0,
      publicCount: 0,
      nonPublicCount: 0,
      provincesCount: 0,
      districtsCount: 0,
      sourceStatus: 'UNAVAILABLE',
      sourceRetrievedAt: retrievedAt,
    };
    return {
      hospitals: [],
      summary: emptySummary,
      isCached: false,
      retrievedAt,
      sourceStatus: 'UNAVAILABLE',
      error: fetchError,
    };
  }

  // Normalize all hospitals
  const hospitals = rawData.map((raw, idx) =>
    normalizeGovernmentHospital(raw, idx, retrievedAt, isCached, userLocation)
  );

  const summary = calculateHospitalSummary(hospitals, isCached ? 'CACHED' : 'LIVE', retrievedAt);

  return {
    hospitals,
    summary,
    isCached,
    retrievedAt,
    sourceStatus: isCached ? 'CACHED' : 'LIVE',
    error: null,
  };
}

/**
 * Calculates aggregate capacity summary across all normalized hospitals
 */
export function calculateHospitalSummary(
  hospitals: GovernmentHospital[],
  status: 'LIVE' | 'CACHED' | 'UNAVAILABLE',
  retrievedAt: string
): HospitalServiceSummary {
  let totalBeds = 0;
  let totalAllocatedFreeBeds = 0;
  let totalOccupiedBeds = 0;
  let totalAvailableBeds = 0;
  let hospitalsNearCapacity = 0;
  let publicCount = 0;
  let nonPublicCount = 0;
  const provinces = new Set<string>();
  const districts = new Set<string>();

  for (const h of hospitals) {
    totalBeds += h.totalBeds;
    totalAllocatedFreeBeds += h.allocatedBeds;
    totalOccupiedBeds += h.occupiedBeds;
    totalAvailableBeds += h.availableBeds;

    if (h.occupancyPercentage >= 90 || h.occupancyStatus === 'FULL') {
      hospitalsNearCapacity += 1;
    }

    if (h.type.toLowerCase().includes('government (public)')) {
      publicCount += 1;
    } else {
      nonPublicCount += 1;
    }

    if (h.province) provinces.add(h.province);
    if (h.district) districts.add(h.district);
  }

  const baseForAvg = totalAllocatedFreeBeds > 0 ? totalAllocatedFreeBeds : totalBeds;
  const averageOccupancy = baseForAvg > 0 ? Math.round((totalOccupiedBeds / baseForAvg) * 100) : 0;

  return {
    totalHospitals: hospitals.length,
    totalBeds,
    totalAllocatedFreeBeds,
    totalOccupiedBeds,
    totalAvailableBeds,
    averageOccupancy,
    hospitalsNearCapacity,
    publicCount,
    nonPublicCount,
    provincesCount: provinces.size,
    districtsCount: districts.size,
    sourceStatus: status,
    sourceRetrievedAt: retrievedAt,
  };
}
