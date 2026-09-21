export interface EmergencyHospital {
  id: string;
  name: string;
  district: string;
  address: string;
  lat: number;
  lng: number;
  totalBeds: number;
  availableBeds: number;
  contact: string;
  traumaCenter: boolean;
  status: 'Operational' | 'Compromised' | 'Full';
  type: string;
}

export interface EmergencyShelter {
  id: string;
  name: string;
  district: string;
  address: string;
  lat: number;
  lng: number;
  capacity: number;
  currentOccupancy: number;
  availableSpots: number;
  contact: string;
  services: string[];
  status: 'Operational' | 'Full' | 'Standby';
  type: 'Shelter' | 'Emergency Center' | 'Evacuation Camp' | 'Relief Hub';
}

// Haversine formula to compute great-circle distance in kilometers
export function calculateDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

// Curated comprehensive official hospitals across Nepal
export const ALL_EMERGENCY_HOSPITALS: EmergencyHospital[] = [
  // Kathmandu Valley
  {
    id: 'hosp-bir',
    name: 'Bir Hospital (National Trauma Center Hub)',
    district: 'Kathmandu',
    address: 'Kanti Path / Mahakal, Kathmandu',
    lat: 27.7061,
    lng: 85.3148,
    totalBeds: 535,
    availableBeds: 48,
    contact: '+977-1-4221119',
    traumaCenter: true,
    status: 'Operational',
    type: 'Government Apex Trauma Hub'
  },
  {
    id: 'hosp-tuth',
    name: 'Tribhuvan University Teaching Hospital (TUTH)',
    district: 'Kathmandu',
    address: 'Maharajgunj, Kathmandu',
    lat: 27.7348,
    lng: 85.3312,
    totalBeds: 700,
    availableBeds: 62,
    contact: '+977-1-4412303',
    traumaCenter: true,
    status: 'Operational',
    type: 'Government University Hospital'
  },
  {
    id: 'hosp-patan',
    name: 'Patan Hospital',
    district: 'Lalitpur',
    address: 'Lagankhel, Lalitpur',
    lat: 27.6681,
    lng: 85.3206,
    totalBeds: 450,
    availableBeds: 34,
    contact: '+977-1-5522295',
    traumaCenter: true,
    status: 'Operational',
    type: 'Public Charitable Hospital'
  },
  {
    id: 'hosp-civil',
    name: 'Civil Service Hospital',
    district: 'Kathmandu',
    address: 'Minbhawan, New Baneshwor, Kathmandu',
    lat: 27.6853,
    lng: 85.3378,
    totalBeds: 300,
    availableBeds: 28,
    contact: '+977-1-4107000',
    traumaCenter: false,
    status: 'Operational',
    type: 'Autonomous Government Hospital'
  },
  {
    id: 'hosp-bhaktapur',
    name: 'Bhaktapur Hospital',
    district: 'Bhaktapur',
    address: 'Dudhpati, Bhaktapur',
    lat: 27.6710,
    lng: 85.4298,
    totalBeds: 150,
    availableBeds: 22,
    contact: '+977-1-6610798',
    traumaCenter: false,
    status: 'Operational',
    type: 'District Government Hospital'
  },
  {
    id: 'hosp-gangalal',
    name: 'Shahid Gangalal National Heart Centre',
    district: 'Kathmandu',
    address: 'Bansbari, Kathmandu',
    lat: 27.7371,
    lng: 85.3402,
    totalBeds: 250,
    availableBeds: 18,
    contact: '+977-1-4371322',
    traumaCenter: false,
    status: 'Operational',
    type: 'Specialized National Hub'
  },
  // Gandaki / Pokhara
  {
    id: 'hosp-western-regional',
    name: 'Western Regional Hospital (Gandaki Hospital)',
    district: 'Kaski',
    address: 'Ramghat, Pokhara',
    lat: 28.2167,
    lng: 83.9933,
    totalBeds: 500,
    availableBeds: 56,
    contact: '+977-61-520067',
    traumaCenter: true,
    status: 'Operational',
    type: 'Provincial Referral Hub'
  },
  {
    id: 'hosp-manipal',
    name: 'Manipal Teaching Hospital',
    district: 'Kaski',
    address: 'Phulbari, Pokhara',
    lat: 28.2310,
    lng: 84.0040,
    totalBeds: 750,
    availableBeds: 85,
    contact: '+977-61-526416',
    traumaCenter: true,
    status: 'Operational',
    type: 'Tertiary Teaching Hospital'
  },
  // Chitwan / Bagmati Lowlands
  {
    id: 'hosp-chitwan-cmc',
    name: 'Chitwan Medical College Teaching Hospital',
    district: 'Chitwan',
    address: 'Kailashnagar, Bharatpur-10',
    lat: 27.6766,
    lng: 84.4285,
    totalBeds: 750,
    availableBeds: 92,
    contact: '+977-56-532933',
    traumaCenter: true,
    status: 'Operational',
    type: 'Tertiary Medical Center'
  },
  {
    id: 'hosp-bharatpur',
    name: 'Bharatpur Hospital (Central Government Hub)',
    district: 'Chitwan',
    address: 'Hospital Road, Bharatpur',
    lat: 27.6800,
    lng: 84.4310,
    totalBeds: 600,
    availableBeds: 45,
    contact: '+977-56-524021',
    traumaCenter: true,
    status: 'Operational',
    type: 'Federal Referral Hospital'
  },
  // Highway Corridor Hospitals (Dhading, Nuwakot, Gorkha)
  {
    id: 'hosp-dhading',
    name: 'Dhading District Hospital',
    district: 'Dhading',
    address: 'Dhading Besi, Neelakantha',
    lat: 27.8667,
    lng: 84.9000,
    totalBeds: 100,
    availableBeds: 24,
    contact: '+977-10-520133',
    traumaCenter: false,
    status: 'Operational',
    type: 'District Government Hospital'
  },
  {
    id: 'hosp-trishuli',
    name: 'Trishuli Hospital',
    district: 'Nuwakot',
    address: 'Bidur Municipality, Nuwakot',
    lat: 27.9167,
    lng: 85.1667,
    totalBeds: 100,
    availableBeds: 31,
    contact: '+977-10-560124',
    traumaCenter: false,
    status: 'Operational',
    type: 'District Government Hospital'
  },
  {
    id: 'hosp-gorkha',
    name: 'Gorkha District Hospital',
    district: 'Gorkha',
    address: 'Gorkha Municipality',
    lat: 28.0000,
    lng: 84.6333,
    totalBeds: 80,
    availableBeds: 19,
    contact: '+977-64-420133',
    traumaCenter: false,
    status: 'Operational',
    type: 'District Government Hospital'
  },
  // Sindhupalchok
  {
    id: 'hosp-melamchi',
    name: 'Melamchi Primary Health Centre & Relief Hospital',
    district: 'Sindhupalchok',
    address: 'Melamchi Bazaar, Sindhupalchok',
    lat: 27.8310,
    lng: 85.5820,
    totalBeds: 40,
    availableBeds: 14,
    contact: '+977-11-400022',
    traumaCenter: false,
    status: 'Operational',
    type: 'Emergency Field Health Hub'
  },
  // Hetauda / Makwanpur
  {
    id: 'hosp-hetauda',
    name: 'Hetauda Hospital',
    district: 'Makwanpur',
    address: 'Hetauda-1, Makwanpur',
    lat: 27.4287,
    lng: 85.0322,
    totalBeds: 200,
    availableBeds: 38,
    contact: '+977-57-520133',
    traumaCenter: true,
    status: 'Operational',
    type: 'Provincial Hospital'
  },
  // Lumbini / Butwal
  {
    id: 'hosp-lumbini-prov',
    name: 'Lumbini Provincial Hospital',
    district: 'Rupandehi',
    address: 'Hospital Line, Butwal',
    lat: 27.7000,
    lng: 83.4500,
    totalBeds: 500,
    availableBeds: 52,
    contact: '+977-71-540133',
    traumaCenter: true,
    status: 'Operational',
    type: 'Provincial Apex Hospital'
  },
  // Koshi / Biratnagar & Dharan
  {
    id: 'hosp-koshi',
    name: 'Koshi Hospital',
    district: 'Morang',
    address: 'Biratnagar, Morang',
    lat: 26.4525,
    lng: 87.2718,
    totalBeds: 450,
    availableBeds: 41,
    contact: '+977-21-522133',
    traumaCenter: true,
    status: 'Operational',
    type: 'Federal Hospital'
  },
  {
    id: 'hosp-bpkihs',
    name: 'B.P. Koirala Institute of Health Sciences (BPKIHS)',
    district: 'Sunsari',
    address: 'Dharan-18, Sunsari',
    lat: 26.8124,
    lng: 87.2834,
    totalBeds: 800,
    availableBeds: 70,
    contact: '+977-25-525555',
    traumaCenter: true,
    status: 'Operational',
    type: 'National Autonomous University'
  }
];

// Curated comprehensive official emergency shelters & relief hubs across Nepal
export const ALL_EMERGENCY_SHELTERS: EmergencyShelter[] = [
  // Kathmandu Valley
  {
    id: 'sh-ktm-ward4',
    name: 'Kathmandu Ward 4 Disaster Emergency Shelter',
    district: 'Kathmandu',
    address: 'Ward 4 Community Hall, Baluwatar / Dhobi Khola',
    lat: 27.7122,
    lng: 85.3200,
    capacity: 250,
    currentOccupancy: 65,
    availableSpots: 185,
    contact: '+977-1-4411122',
    services: ['Emergency Beds', 'Clean Water', 'First Aid', 'Dry Rations', 'Generator Power'],
    status: 'Operational',
    type: 'Emergency Center'
  },
  {
    id: 'sh-dasharath-stadium',
    name: 'Dasharath Stadium Central Evacuation Camp',
    district: 'Kathmandu',
    address: 'Tripureshwor, Kathmandu',
    lat: 27.6945,
    lng: 85.3142,
    capacity: 2500,
    currentOccupancy: 420,
    availableSpots: 2080,
    contact: '+977-1-4261888',
    services: ['Large Open Ground', 'WASH Sanitation', 'Medical Post', 'Red Cross Tents', 'Helipad Access'],
    status: 'Operational',
    type: 'Evacuation Camp'
  },
  {
    id: 'sh-bhaktapur-camp',
    name: 'Bhaktapur Community Disaster Evacuation Ground',
    district: 'Bhaktapur',
    address: 'Sallaghari Open Grounds, Bhaktapur',
    lat: 27.6720,
    lng: 85.4280,
    capacity: 800,
    currentOccupancy: 190,
    availableSpots: 610,
    contact: '+977-1-6612345',
    services: ['Tents', 'Water Tankers', 'Police Security Post', 'Child Safe Space'],
    status: 'Operational',
    type: 'Relief Hub'
  },
  {
    id: 'sh-lalitpur-jawalakhel',
    name: 'Lalitpur Red Cross Emergency Shelter Hub',
    district: 'Lalitpur',
    address: 'Jawalakhel Open Ground, Lalitpur',
    lat: 27.6690,
    lng: 85.3160,
    capacity: 1200,
    currentOccupancy: 280,
    availableSpots: 920,
    contact: '+977-1-5521999',
    services: ['Water Filtration Units', 'Bedding Packs', 'Ambulance Standby', 'Food Distribution'],
    status: 'Operational',
    type: 'Emergency Center'
  },
  // Sindhupalchok / Melamchi
  {
    id: 'sh-melamchi-relief',
    name: 'Melamchi Flood Disaster Relief Center',
    district: 'Sindhupalchok',
    address: 'Melamchi Bazaar Upper Terrace',
    lat: 27.8300,
    lng: 85.5800,
    capacity: 600,
    currentOccupancy: 380,
    availableSpots: 220,
    contact: '+977-11-400111',
    services: ['Temporary Tents', 'High-Ground Safe Zone', 'Food & Milk Supplies', 'Satellite Comm'],
    status: 'Operational',
    type: 'Relief Hub'
  },
  // Pokhara / Kaski
  {
    id: 'sh-pokhara-exhibition',
    name: 'Pokhara Disaster Relief & Evacuation Hub',
    district: 'Kaski',
    address: 'Exhibition Ground, Nayabazar, Pokhara',
    lat: 28.2180,
    lng: 83.9910,
    capacity: 1500,
    currentOccupancy: 210,
    availableSpots: 1290,
    contact: '+977-61-532222',
    services: ['Dry Shelters', 'Field Kitchen', 'Emergency Medical Team', 'Clean Drinking Water'],
    status: 'Operational',
    type: 'Emergency Center'
  },
  // Chitwan / Bharatpur
  {
    id: 'sh-chitwan-redcross',
    name: 'Chitwan Red Cross Emergency Relief Center',
    district: 'Chitwan',
    address: 'Bharatpur-10, near Central Bus Terminal',
    lat: 27.6820,
    lng: 84.4350,
    capacity: 900,
    currentOccupancy: 150,
    availableSpots: 750,
    contact: '+977-56-521122',
    services: ['Flood Evacuee Quarters', 'Boats & Lifejackets', 'Medical First Aid', 'Dry Rations'],
    status: 'Operational',
    type: 'Relief Hub'
  },
  // Dhading
  {
    id: 'sh-dhading-camp',
    name: 'Dhading Disaster Evacuation Camp',
    district: 'Dhading',
    address: 'Dhading Besi Sports Ground, Neelakantha',
    lat: 27.8650,
    lng: 84.8980,
    capacity: 500,
    currentOccupancy: 95,
    availableSpots: 405,
    contact: '+977-10-520999',
    services: ['Landslide Evacuee Shelters', 'Hot Meals', 'Blankets', 'Health Post'],
    status: 'Operational',
    type: 'Shelter'
  },
  // Nuwakot
  {
    id: 'sh-nuwakot-relief',
    name: 'Nuwakot Community Relief Shelter',
    district: 'Nuwakot',
    address: 'Bidur City Hall, Nuwakot',
    lat: 27.9150,
    lng: 85.1650,
    capacity: 400,
    currentOccupancy: 70,
    availableSpots: 330,
    contact: '+977-10-560333',
    services: ['Emergency Cots', 'Water Dispensers', 'First Aid Responder Unit'],
    status: 'Operational',
    type: 'Shelter'
  },
  // Gorkha
  {
    id: 'sh-gorkha-redcross',
    name: 'Gorkha Red Cross Relief Shelter',
    district: 'Gorkha',
    address: 'Gorkha Bazaar Community Field',
    lat: 28.0020,
    lng: 84.6310,
    capacity: 450,
    currentOccupancy: 60,
    availableSpots: 390,
    contact: '+977-64-420333',
    services: ['Earthquake & Landslide Safe Camp', 'Trauma Counseling', 'Emergency Tents'],
    status: 'Operational',
    type: 'Relief Hub'
  },
  // Hetauda / Makwanpur
  {
    id: 'sh-hetauda-shelter',
    name: 'Hetauda Industrial Area Evacuation Shelter',
    district: 'Makwanpur',
    address: 'Hetauda Industrial Zone Complex',
    lat: 27.4250,
    lng: 85.0300,
    capacity: 700,
    currentOccupancy: 110,
    availableSpots: 590,
    contact: '+977-57-521999',
    services: ['High Capacity Warehouse Shelters', 'Generators', 'Logistics Supply Storage'],
    status: 'Operational',
    type: 'Emergency Center'
  },
  // Butwal / Lumbini
  {
    id: 'sh-butwal-shelter',
    name: 'Butwal Red Cross Emergency Relief Camp',
    district: 'Rupandehi',
    address: 'Mani Mukunda Open Grounds, Butwal',
    lat: 27.6980,
    lng: 83.4520,
    capacity: 850,
    currentOccupancy: 120,
    availableSpots: 730,
    contact: '+977-71-542111',
    services: ['Medical Camp', 'Food Distribution', 'Tarpaulin Packs', 'Potable Water'],
    status: 'Operational',
    type: 'Evacuation Camp'
  }
];

export interface HospitalWithDistance extends EmergencyHospital {
  distanceKm: number;
}

export interface ShelterWithDistance extends EmergencyShelter {
  distanceKm: number;
}

// Find all hospitals sorted by distance to user coordinates
export function findAllNearbyHospitals(
  userCoords: { lat: number; lng: number },
  extraHospitals: any[] = []
): HospitalWithDistance[] {
  const merged: EmergencyHospital[] = [...ALL_EMERGENCY_HOSPITALS];

  // Incorporate any extra hospitals from store/governmentHospitals
  extraHospitals.forEach(h => {
    const lat = h.lat || (h.location && typeof h.location.lat === 'number' ? h.location.lat : null);
    const lng = h.lng || (h.location && typeof h.location.lng === 'number' ? h.location.lng : null);
    if (lat && lng && !merged.some(m => m.name.toLowerCase() === h.name.toLowerCase())) {
      merged.push({
        id: h.id || `extra-hosp-${Math.random()}`,
        name: h.name,
        district: h.district || 'Nepal',
        address: h.address || h.district || 'Healthcare Facility',
        lat,
        lng,
        totalBeds: h.totalBeds || h.capacity || 50,
        availableBeds: h.availableBeds != null ? h.availableBeds : 10,
        contact: h.contact || h.contactNumber || '102 (Ambulance)',
        traumaCenter: false,
        status: h.status === 'Compromised' ? 'Compromised' : 'Operational',
        type: h.type || 'Hospital'
      });
    }
  });

  return merged
    .map(hosp => ({
      ...hosp,
      distanceKm: calculateDistanceKm(userCoords.lat, userCoords.lng, hosp.lat, hosp.lng)
    }))
    .sort((a, b) => a.distanceKm - b.distanceKm);
}

// Find nearest operational hospital with free beds
export function findNearestHospital(
  userCoords: { lat: number; lng: number },
  extraHospitals: any[] = []
): HospitalWithDistance | null {
  const list = findAllNearbyHospitals(userCoords, extraHospitals);
  // Prioritize operational hospital with free beds
  const withBeds = list.find(h => h.status === 'Operational' && h.availableBeds > 0);
  if (withBeds) return withBeds;
  const operational = list.find(h => h.status === 'Operational');
  return operational || list[0] || null;
}

// Find all emergency shelters sorted by distance to user coordinates
export function findAllNearbyShelters(
  userCoords: { lat: number; lng: number },
  extraFacilities: any[] = []
): ShelterWithDistance[] {
  const merged: EmergencyShelter[] = [...ALL_EMERGENCY_SHELTERS];

  extraFacilities.forEach(f => {
    if (f.type !== 'Hospital' && f.lat && f.lng) {
      if (!merged.some(m => m.name.toLowerCase() === f.name.toLowerCase())) {
        const capacity = f.capacity || 200;
        const currentOccupancy = f.currentOccupancy || 50;
        merged.push({
          id: f.id || `extra-sh-${Math.random()}`,
          name: f.name,
          district: f.district || 'Nepal',
          address: f.address || 'Emergency Center',
          lat: f.lat,
          lng: f.lng,
          capacity,
          currentOccupancy,
          availableSpots: Math.max(capacity - currentOccupancy, 0),
          contact: f.contact || '1149 (Emergency Operations)',
          services: f.services || ['Shelter', 'Relief'],
          status: f.status === 'Compromised' ? 'Full' : 'Operational',
          type: (f.type as any) || 'Shelter'
        });
      }
    }
  });

  return merged
    .map(shelter => ({
      ...shelter,
      distanceKm: calculateDistanceKm(userCoords.lat, userCoords.lng, shelter.lat, shelter.lng)
    }))
    .sort((a, b) => a.distanceKm - b.distanceKm);
}

// Find nearest operational emergency shelter
export function findNearestShelter(
  userCoords: { lat: number; lng: number },
  extraFacilities: any[] = []
): ShelterWithDistance | null {
  const list = findAllNearbyShelters(userCoords, extraFacilities);
  const withSpace = list.find(s => s.status === 'Operational' && s.availableSpots > 0);
  if (withSpace) return withSpace;
  const operational = list.find(s => s.status === 'Operational');
  return operational || list[0] || null;
}
