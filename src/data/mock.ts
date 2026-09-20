import { 
  Location, Weather, Facility, Route, News, MissingPerson, Sighting, CandidateMatch,
  Supply, Volunteer, Assessment, Incident, Funding, AppNotification,
  WeatherSource, HistoricalEvent, HourlyForecast, EnvironmentalSensor,
  WarehouseDepot, LocationNeed, DistributionPlan, DeliveryRecord, ShortagePrediction,
  VolunteerTeam, VolunteerAllocationRecommendation, RecoveryPriority, AIPriorityItem
} from '../types';

export const MOCK_ENVIRONMENTAL_SENSORS: Record<number, EnvironmentalSensor[]> = {
  0: [
    { id: 'sens-1', type: 'River Level', value: '2.1m', status: 'NORMAL', trend: 'STABLE' },
    { id: 'sens-2', type: 'Soil Moisture', value: '45%', status: 'NORMAL', trend: 'STABLE' },
  ],
  1: [
    { id: 'sens-1', type: 'River Level', value: '4.5m', status: 'WARNING', trend: 'RISING' },
    { id: 'sens-2', type: 'Soil Moisture', value: '65%', status: 'WARNING', trend: 'RISING' },
  ],
  2: [
    { id: 'sens-1', type: 'River Level', value: '6.8m', status: 'CRITICAL', trend: 'RISING' },
    { id: 'sens-2', type: 'Soil Moisture', value: '85%', status: 'CRITICAL', trend: 'STABLE' },
  ],
  3: [
    { id: 'sens-1', type: 'River Level', value: '8.2m', status: 'CRITICAL', trend: 'RISING' },
    { id: 'sens-2', type: 'Soil Moisture', value: '95%', status: 'CRITICAL', trend: 'STABLE' },
  ],
};

export const MOCK_HOURLY_FORECAST: Record<number, HourlyForecast[]> = {
  // Generate some realistic looking mocked worsening data
  0: Array.from({length: 24}).map((_, i) => ({ time: `${String((new Date().getHours() + i) % 24).padStart(2, '0')}:00`, temp: 24 - Math.sin(i * 0.5) * 5, rainProb: 10 + Math.random() * 10 })),
  1: Array.from({length: 24}).map((_, i) => ({ time: `${String((new Date().getHours() + i) % 24).padStart(2, '0')}:00`, temp: 22 - Math.sin(i * 0.5) * 4, rainProb: 30 + (i * 2) + Math.random() * 20 })),
  2: Array.from({length: 24}).map((_, i) => ({ time: `${String((new Date().getHours() + i) % 24).padStart(2, '0')}:00`, temp: 20 - Math.sin(i * 0.5) * 3, rainProb: 60 + (i * 1.5) + Math.random() * 10 })),
  3: Array.from({length: 24}).map((_, i) => ({ time: `${String((new Date().getHours() + i) % 24).padStart(2, '0')}:00`, temp: 19 - Math.sin(i * 0.5) * 2, rainProb: 90 + Math.random() * 10 })),
};

export const MOCK_WEATHER_SOURCES: Record<number, WeatherSource[]> = {
  // Key represents the Demo Scenario Step (0: Normal, 1: Worsening, 2: High Risk, 3: Critical)
  0: [
    { id: 'ws1', name: 'DHM Nepal (Hydrology & Meteorology)', type: 'Official', status: 'AVAILABLE', timestamp: new Date().toISOString(), temp: 28, rainProb: 10, humidity: 45, windSpeed: 8, pressure: 1012, precipitationMm: 0, precipitation24hMm: 1.5, weatherCode: 1, reliability: 0.95, url: 'https://hydrology.gov.np/', description: 'Nepal Department of Hydrology & Meteorology (DHM) national ground observation network' },
    { id: 'ws2', name: 'Satellite Radar (Himawari-9 / INSAT)', type: 'Satellite', status: 'AVAILABLE', timestamp: new Date().toISOString(), temp: 27, rainProb: 12, humidity: 48, windSpeed: 10, precipitationMm: 0, precipitation24hMm: 1.5, weatherCode: 1, reliability: 0.9, url: 'https://www.data.jma.go.jp/mscweb/data/himawari/', description: 'Japan Meteorological Agency (JMA) Geostationary Himawari-9 multispectral radar' },
    { id: 'ws3', name: 'River Basin Telemetry (GL Water Gauges)', type: 'Commercial', status: 'AVAILABLE', timestamp: new Date(Date.now() - 600000).toISOString(), temp: 28, rainProb: 10, humidity: 44, windSpeed: 7, precipitationMm: 0, precipitation24hMm: 1.5, weatherCode: 1, reliability: 0.88, url: 'https://hydrology.gov.np/#/river_watch', description: 'Real-time river level stages and basin automated hydrological sensors' },
    { id: 'ws4', name: 'Soil Moisture & Slope Sensors (ICIMOD)', type: 'IoT', status: 'AVAILABLE', timestamp: new Date().toISOString(), temp: 26, rainProb: 14, humidity: 50, windSpeed: 8, precipitationMm: 0, precipitation24hMm: 1.5, weatherCode: 1, reliability: 0.85, url: 'https://www.icimod.org/', description: 'International Centre for Integrated Mountain Development regional hazard telemetry' },
  ],
  1: [
    { id: 'ws1', name: 'DHM Nepal (Hydrology & Meteorology)', type: 'Official', status: 'AVAILABLE', timestamp: new Date().toISOString(), temp: 26, rainProb: 55, humidity: 65, windSpeed: 14, pressure: 1008, precipitationMm: 8.5, precipitation24hMm: 58.0, weatherCode: 61, reliability: 0.95, url: 'https://hydrology.gov.np/', description: 'Nepal Department of Hydrology & Meteorology (DHM) national ground observation network' },
    { id: 'ws2', name: 'Satellite Radar (Himawari-9 / INSAT)', type: 'Satellite', status: 'AVAILABLE', timestamp: new Date().toISOString(), temp: 25, rainProb: 58, humidity: 70, windSpeed: 16, precipitationMm: 8.5, precipitation24hMm: 58.0, weatherCode: 61, reliability: 0.9, url: 'https://www.data.jma.go.jp/mscweb/data/himawari/', description: 'Japan Meteorological Agency (JMA) Geostationary Himawari-9 multispectral radar' },
    { id: 'ws3', name: 'River Basin Telemetry (GL Water Gauges)', type: 'Commercial', status: 'AVAILABLE', timestamp: new Date().toISOString(), temp: 26, rainProb: 50, humidity: 60, windSpeed: 12, precipitationMm: 8.5, precipitation24hMm: 58.0, weatherCode: 61, reliability: 0.88, url: 'https://hydrology.gov.np/#/river_watch', description: 'Real-time river level stages and basin automated hydrological sensors' },
    { id: 'ws4', name: 'Soil Moisture & Slope Sensors (ICIMOD)', type: 'IoT', status: 'AVAILABLE', timestamp: new Date().toISOString(), temp: 25, rainProb: 54, humidity: 68, windSpeed: 15, precipitationMm: 8.5, precipitation24hMm: 58.0, weatherCode: 61, reliability: 0.85, url: 'https://www.icimod.org/', description: 'International Centre for Integrated Mountain Development regional hazard telemetry' },
  ],
  2: [
    { id: 'ws1', name: 'DHM Nepal (Hydrology & Meteorology)', type: 'Official', status: 'AVAILABLE', timestamp: new Date().toISOString(), temp: 24, rainProb: 82, humidity: 85, windSpeed: 25, pressure: 1002, precipitationMm: 24.0, precipitation24hMm: 115.0, weatherCode: 65, reliability: 0.95, url: 'https://hydrology.gov.np/', description: 'Nepal Department of Hydrology & Meteorology (DHM) national ground observation network' },
    { id: 'ws2', name: 'Satellite Radar (Himawari-9 / INSAT)', type: 'Satellite', status: 'AVAILABLE', timestamp: new Date().toISOString(), temp: 23, rainProb: 85, humidity: 90, windSpeed: 28, precipitationMm: 24.0, precipitation24hMm: 115.0, weatherCode: 65, reliability: 0.9, url: 'https://www.data.jma.go.jp/mscweb/data/himawari/', description: 'Japan Meteorological Agency (JMA) Geostationary Himawari-9 multispectral radar' },
    { id: 'ws3', name: 'River Basin Telemetry (GL Water Gauges)', type: 'Commercial', status: 'AVAILABLE', timestamp: new Date().toISOString(), temp: 24, rainProb: 80, humidity: 80, windSpeed: 22, precipitationMm: 24.0, precipitation24hMm: 115.0, weatherCode: 65, reliability: 0.88, url: 'https://hydrology.gov.np/#/river_watch', description: 'Real-time river level stages and basin automated hydrological sensors' },
    { id: 'ws4', name: 'Soil Moisture & Slope Sensors (ICIMOD)', type: 'IoT', status: 'DELAYED', timestamp: new Date(Date.now() - 3600000).toISOString(), temp: 22, rainProb: 88, humidity: 92, windSpeed: 30, precipitationMm: 24.0, precipitation24hMm: 115.0, weatherCode: 65, reliability: 0.85, url: 'https://www.icimod.org/', description: 'International Centre for Integrated Mountain Development regional hazard telemetry' },
  ],
  3: [
    { id: 'ws1', name: 'DHM Nepal (Hydrology & Meteorology)', type: 'Official', status: 'AVAILABLE', timestamp: new Date().toISOString(), temp: 23, rainProb: 98, humidity: 95, windSpeed: 45, pressure: 996, precipitationMm: 48.0, precipitation24hMm: 185.0, weatherCode: 95, reliability: 0.95, url: 'https://hydrology.gov.np/', description: 'Nepal Department of Hydrology & Meteorology (DHM) national ground observation network' },
    { id: 'ws2', name: 'Satellite Radar (Himawari-9 / INSAT)', type: 'Satellite', status: 'AVAILABLE', timestamp: new Date().toISOString(), temp: 22, rainProb: 95, humidity: 98, windSpeed: 50, precipitationMm: 48.0, precipitation24hMm: 185.0, weatherCode: 95, reliability: 0.9, url: 'https://www.data.jma.go.jp/mscweb/data/himawari/', description: 'Japan Meteorological Agency (JMA) Geostationary Himawari-9 multispectral radar' },
    { id: 'ws3', name: 'River Basin Telemetry (GL Water Gauges)', type: 'Commercial', status: 'AVAILABLE', timestamp: new Date().toISOString(), temp: 21, rainProb: 96, humidity: 97, windSpeed: 42, precipitationMm: 48.0, precipitation24hMm: 185.0, weatherCode: 95, reliability: 0.88, url: 'https://hydrology.gov.np/#/river_watch', description: 'Real-time river level stages and basin automated hydrological sensors' },
    { id: 'ws4', name: 'Soil Moisture & Slope Sensors (ICIMOD)', type: 'IoT', status: 'AVAILABLE', timestamp: new Date().toISOString(), temp: 20, rainProb: 99, humidity: 99, windSpeed: 38, precipitationMm: 48.0, precipitation24hMm: 185.0, weatherCode: 95, reliability: 0.85, url: 'https://www.icimod.org/', description: 'International Centre for Integrated Mountain Development regional hazard telemetry' },
  ]
};

export const MOCK_HISTORICAL_EVENTS: HistoricalEvent[] = [
  {
    id: 'he-001',
    name: '2021 Melamchi Flood & Debris Flow',
    locationId: 'loc-2', // Sindhupalchok
    date: '2021-06-15',
    actualOutcome: 'Massive glacial lake burst and upstream landslide dam collapse triggering severe debris torrent.',
    actualAffectedRegion: 'Melamchi Bazaar, Helambu, and Sindhupalchok',
    timeline: [
      { timeOffset: 'T - 48 HOURS', sourceState: 'Scattered monsoon rain predicted by global models.', aiRiskLevel: 'LOW', aiPrediction: 'Normal seasonal precipitation expected in mid-hills.' },
      { timeOffset: 'T - 24 HOURS', sourceState: 'High-altitude satellite radar detected cloudburst anomaly at Bhemathang.', aiRiskLevel: 'HIGH', aiPrediction: 'Substantial debris-flow threat. Upstream settlement alerts indicated.' },
      { timeOffset: 'T - 6 HOURS', sourceState: 'GL water gauges recorded sudden river drop followed by surge.', aiRiskLevel: 'CRITICAL', aiPrediction: 'Imminent dam breach wave. Evacuate river corridors immediately.' },
      { timeOffset: 'T - 0 HOURS', sourceState: 'Downstream river gauge destroyed at Melamchi bridge.', aiRiskLevel: 'CRITICAL', aiPrediction: 'Catastrophic debris flood in active progression.' }
    ]
  },
  {
    id: 'he-002',
    name: '2015 Gorkha Earthquake (Mw 7.8)',
    locationId: 'loc-1', // Kathmandu / Central Nepal
    date: '2015-04-25',
    actualOutcome: 'Devastating Mw 7.8 earthquake followed by secondary landslides and structural collapse.',
    actualAffectedRegion: 'Gorkha, Kathmandu Valley, Sindhupalchok, Rasuwa',
    timeline: [
      { timeOffset: 'T - 72 HOURS', sourceState: 'Geodetic strain buildup recorded along Main Himalayan Thrust.', aiRiskLevel: 'ELEVATED', aiPrediction: 'Ongoing regional tectonic stress accumulation.' },
      { timeOffset: 'T - 0 HOURS', sourceState: 'Mw 7.8 mainshock epicenter recorded at Barpak, Gorkha (11:56 AM).', aiRiskLevel: 'CRITICAL', aiPrediction: 'Mass casualty structural collapse. Urgent SAR mobilization needed.' },
      { timeOffset: 'T + 2 HOURS', sourceState: 'Hundreds of aftershocks; Prithvi & Araniko highways blocked by rockfalls.', aiRiskLevel: 'CRITICAL', aiPrediction: 'Secondary road severed. Helicopter air-bridge required for remote valleys.' },
      { timeOffset: 'T + 24 HOURS', sourceState: 'Hospital surge across Bir, TUTH, and Patan hospitals reaches 350% capacity.', aiRiskLevel: 'CRITICAL', aiPrediction: 'Establish field triage and blood logistics corridor.' }
    ]
  },
  {
    id: 'he-003',
    name: '2023 Jajarkot Earthquake (Mw 5.7)',
    locationId: 'loc-7', // Karnali / Jajarkot
    date: '2023-11-03',
    actualOutcome: 'Shallow night earthquake causing mud-and-stone masonry collapse across Jajarkot and Rukum West.',
    actualAffectedRegion: 'Bheri Municipality, Barekot, and Rukum West',
    timeline: [
      { timeOffset: 'T - 24 HOURS', sourceState: 'Normal seasonal night temperature drop to 8°C in western mid-hills.', aiRiskLevel: 'LOW', aiPrediction: 'Standard winter logistics readiness.' },
      { timeOffset: 'T - 0 HOURS', sourceState: '23:47 NPT: Shallow 12 km focal depth earthquake strikes Ramidanda.', aiRiskLevel: 'CRITICAL', aiPrediction: 'Traditional masonry homes vulnerable to immediate collapse.' },
      { timeOffset: 'T + 3 HOURS', sourceState: 'Jajarkot District Hospital overwhelmed; cold exposure risk begins.', aiRiskLevel: 'CRITICAL', aiPrediction: 'Immediate need for warm blankets, tarpaulins, and trauma surgical teams.' },
      { timeOffset: 'T + 12 HOURS', sourceState: 'Chaurjahari airport mobilized for emergency medical evacuation to Nepalgunj.', aiRiskLevel: 'HIGH', aiPrediction: 'Medical air-bridge to Bheri Hospital and Nepalgunj Medical College active.' }
    ]
  },
  {
    id: 'he-004',
    name: '2024 Late Monsoon Kathmandu Floods',
    locationId: 'loc-1', // Kathmandu Valley
    date: '2024-09-28',
    actualOutcome: 'Record 240mm 24-hour rainfall causing Bagmati, Bishnumati, and Hanumante rivers to breach banks.',
    actualAffectedRegion: 'Balkhu, Kuleshwor, Nakkhu, Balkumari, and Kathmandu Valley entry highways',
    timeline: [
      { timeOffset: 'T - 36 HOURS', sourceState: 'DHM Nepal issues high alert for Bengal low-pressure confluence.', aiRiskLevel: 'ELEVATED', aiPrediction: 'Exceptional moisture influx into central Mahabharat range.' },
      { timeOffset: 'T - 12 HOURS', sourceState: 'Continuous heavy rainfall reaches 150mm; soil saturation hits 92%.', aiRiskLevel: 'HIGH', aiPrediction: 'Urban stormwater runoff capacity exceeded; low-lying banks vulnerable.' },
      { timeOffset: 'T - 2 HOURS', sourceState: 'Bagmati river level at Balkhu reaches 4.8m (1.2m above danger mark).', aiRiskLevel: 'CRITICAL', aiPrediction: 'Direct inundation of ground floors; suspend traffic on Ring Road bridges.' },
      { timeOffset: 'T - 0 HOURS', sourceState: 'Major landslides block Nagdhunga and Naubise highway corridors.', aiRiskLevel: 'CRITICAL', aiPrediction: 'Capital road access severed; focus on rooftop rescue and shelter food dispatch.' }
    ]
  }
];

export const LOCATIONS: Location[] = [
  { id: 'loc-current', name: 'Current Location', region: 'Auto-detected' },
  { id: 'loc-1', name: 'Kathmandu', region: 'Bagmati', lat: 27.7172, lng: 85.3240 },
  { id: 'loc-2', name: 'Sindhupalchok', region: 'Bagmati', lat: 27.9500, lng: 85.6800 },
  { id: 'loc-3', name: 'Pokhara', region: 'Gandaki', lat: 28.2096, lng: 83.9856 },
  { id: 'loc-4', name: 'Biratnagar', region: 'Koshi', lat: 26.4525, lng: 87.2718 },
  { id: 'loc-5', name: 'Chitwan', region: 'Bagmati', lat: 27.5291, lng: 84.3542 },
];

export const MOCK_WEATHER: Record<string, Weather> = {
  'loc-current': {
    locationId: 'loc-current', temp: 24, condition: 'Detecting...', rainProb: 0, humidity: 0, windSpeed: 0,
    hourly: [ { time: '10:00', temp: 24, rainProb: 0 }, { time: '11:00', temp: 24, rainProb: 0 } ],
    daily: [ { day: 'Mon', high: 26, low: 20, condition: 'Clear' }, { day: 'Tue', high: 26, low: 20, condition: 'Clear' } ]
  },
  'loc-1': {
    locationId: 'loc-1', temp: 24, condition: 'Heavy Rain', rainProb: 85, humidity: 90, windSpeed: 15,
    hourly: [ { time: '10:00', temp: 24, rainProb: 80 }, { time: '11:00', temp: 23, rainProb: 90 } ],
    daily: [ { day: 'Mon', high: 26, low: 20, condition: 'Rain' }, { day: 'Tue', high: 28, low: 22, condition: 'Cloudy' } ]
  },
  'loc-2': {
    locationId: 'loc-2', temp: 18, condition: 'Thunderstorm', rainProb: 95, humidity: 95, windSpeed: 25,
    hourly: [ { time: '10:00', temp: 18, rainProb: 95 }, { time: '11:00', temp: 17, rainProb: 100 } ],
    daily: [ { day: 'Mon', high: 20, low: 15, condition: 'Storm' }, { day: 'Tue', high: 22, low: 16, condition: 'Rain' } ]
  },
  'loc-3': {
    locationId: 'loc-3', temp: 28, condition: 'Cloudy', rainProb: 40, humidity: 70, windSpeed: 10,
    hourly: [ { time: '10:00', temp: 28, rainProb: 40 }, { time: '11:00', temp: 29, rainProb: 30 } ],
    daily: [ { day: 'Mon', high: 30, low: 22, condition: 'Cloudy' }, { day: 'Tue', high: 32, low: 24, condition: 'Clear' } ]
  }
};

export const MOCK_FACILITIES: Facility[] = [
  { id: 'fac-1', name: 'Bir Hospital', type: 'Hospital', locationId: 'loc-1', address: 'Kanti Path, Kathmandu', lat: 27.7061, lng: 85.3148, capacity: 500, currentOccupancy: 480, status: 'Operational', services: ['Trauma', 'Surgery'], contact: '111-222-333' },
  { id: 'fac-2', name: 'Melamchi Relief Center', type: 'Relief Center', locationId: 'loc-2', address: 'Melamchi Bazaar', lat: 27.8300, lng: 85.5800, capacity: 1000, currentOccupancy: 850, status: 'Operational', services: ['Food', 'Shelter'], contact: '999-888-777' },
  { id: 'fac-3', name: 'Chitwan Medical College', type: 'Hospital', locationId: 'loc-5', address: 'Bharatpur', lat: 27.6766, lng: 84.4285, capacity: 300, currentOccupancy: 150, status: 'Operational', services: ['ICU', 'General'], contact: '444-555-666' },
  { id: 'fac-4', name: 'KTM Ward 4 Shelter', type: 'Shelter', locationId: 'loc-1', address: 'Ward 4 Community Hall', lat: 27.7122, lng: 85.3200, capacity: 200, currentOccupancy: 50, status: 'Operational', services: ['Beds', 'Water'], contact: '000-000-000' }
];

export const MOCK_INCIDENTS: Incident[] = [
  { id: 'inc-1', title: 'Flash Flood Risk: Melamchi', desc: 'Water levels rising rapidly due to upstream dam release.', locationId: 'loc-2', type: 'Flood', lat: 27.8300, lng: 85.5800, severity: 9, peopleAffected: 500, urgency: 10, timeSensitivity: 10, status: 'ACTIVE' },
  { id: 'inc-2', title: 'Power Grid Failure', desc: 'Central Kathmandu grid offline due to transformer explosion.', locationId: 'loc-1', type: 'Infrastructure', lat: 27.7172, lng: 85.3240, severity: 7, peopleAffected: 10000, urgency: 6, timeSensitivity: 8, status: 'ACTIVE' },
  { id: 'inc-3', title: 'Landslide blocking Prithvi Hwy', desc: 'Major landslide. Highway completely blocked.', locationId: 'loc-5', type: 'Landslide', lat: 27.6521, lng: 84.5512, severity: 8, peopleAffected: 200, urgency: 8, timeSensitivity: 7, status: 'ACTIVE' },
];

export const MOCK_ROUTES: Route[] = [
  { id: 'rt-1', name: 'Prithvi Highway', locationId: 'loc-5', status: 'BLOCKED', condition: 'Major landslide at km 45', risk: 'HIGH', affectedBy: 'Landslide', lastUpdated: '10 mins ago', alternative: 'Tribhuvan Highway', path: [{lat: 27.7, lng: 84.8}, {lat: 27.65, lng: 84.5}] },
  { id: 'rt-2', name: 'Araniko Highway', locationId: 'loc-2', status: 'CAUTION', condition: 'Waterlogging in patches', risk: 'MODERATE', affectedBy: 'Heavy Rain', lastUpdated: '1 hour ago', path: [{lat: 27.8, lng: 85.5}, {lat: 27.85, lng: 85.6}] },
  { id: 'rt-3', name: 'Ring Road', locationId: 'loc-1', status: 'OPEN', condition: 'Clear', risk: 'LOW', affectedBy: 'None', lastUpdated: '5 mins ago', path: [{lat: 27.72, lng: 85.31}, {lat: 27.73, lng: 85.33}, {lat: 27.71, lng: 85.34}] }
];

export const MOCK_NEWS: News[] = [
  { 
    id: 'nw-1', 
    title: 'DHM issues High Alert for Narayani & Koshi Basins; River Discharges Approach Danger Thresholds', 
    source: 'Department of Hydrology & Meteorology (DHM Nepal)', 
    officialAgency: 'Ministry of Energy, Water Resources and Irrigation',
    sourceUrl: 'https://hydrology.gov.np',
    timestamp: '25 mins ago', 
    locationId: 'loc-1', 
    district: 'Chitwan, Nawalpur & Sunsari',
    category: 'Hydrology & Flood', 
    severity: 'CRITICAL', 
    verified: true, 
    isRealBulletin: true,
    verificationStatus: 'VERIFIED',
    verificationExplanation: 'Verified via DHM National Hydrological Network automated telemetry stations at Devghat and Chatara.',
    summary: 'DHM telemetry stations report surging discharge rates following heavy catchment precipitation. All riverside settlements along Narayani and Koshi lowlands advised to maintain strict night vigilance and halt gravel extraction.' 
  },
  { 
    id: 'nw-2', 
    title: 'NDRRMA BIPAD Portal: Monsoon Mudslide Warning Issued for 14 High-Slope Municipalities', 
    source: 'NDRRMA BIPAD Portal', 
    officialAgency: 'National Disaster Risk Reduction & Management Authority (MoHA)',
    sourceUrl: 'https://bipadportal.gov.np',
    timestamp: '1 hour ago', 
    locationId: 'loc-2', 
    district: 'Sindhupalchok, Kaski & Myagdi',
    category: 'Official Alert', 
    severity: 'WARNING', 
    verified: true, 
    isRealBulletin: true,
    verificationStatus: 'VERIFIED',
    verificationExplanation: 'Official NDRRMA early-warning bulletin. District Disaster Management Committees (DDMC) activated with heavy excavators prepositioned.',
    summary: 'Automated slope stability models flag 14 vulnerable municipal wards across Bagmati and Gandaki provinces following 72-hour soil water saturation. Emergency contact focal points placed on high standby.' 
  },
  { 
    id: 'nw-3', 
    title: 'DOR Navigate: Prithvi Highway Clearance Update – One-Way Corridor Restored at Jogimara', 
    source: 'Department of Roads (DOR Nepal)', 
    officialAgency: 'Ministry of Physical Infrastructure and Transport',
    sourceUrl: 'https://dor.gov.np',
    timestamp: '2 hours ago', 
    locationId: 'loc-1', 
    district: 'Dhading',
    category: 'Infrastructure', 
    severity: 'WARNING', 
    verified: true, 
    isRealBulletin: true,
    verificationStatus: 'VERIFIED',
    verificationExplanation: 'Department of Roads heavy machinery Division deployed at km 72 to clear scree and rockfall.',
    summary: 'Debris clearance teams opened alternating one-way traffic at Jogimara (km 72). Heavy multi-axle freight trucks held at Malekhu checkpoint to prioritize emergency ambulances, relief logistics, and passenger buses.' 
  },
  { 
    id: 'nw-4', 
    title: 'Nepal Red Cross Central Blood Transfusion Service Deploys Emergency Relief Consignments', 
    source: 'Nepal Red Cross Society (NRCS)', 
    officialAgency: 'Red Cross Disaster Operations',
    sourceUrl: 'https://nrcs.org',
    timestamp: '3 hours ago', 
    locationId: 'loc-1', 
    district: 'Kathmandu & Lalitpur',
    category: 'Relief Logistics', 
    severity: 'INFO', 
    verified: true, 
    isRealBulletin: true,
    verificationStatus: 'VERIFIED',
    summary: 'NRCS has dispatched 1,200 heavy-duty tarpaulins, 800 water filtration packs, and dry ration cartons to regional logistics warehouses in Itahari and Pokhara. Blood reserves remain fully stocked across all blood groups.' 
  },
  { 
    id: 'nw-5', 
    title: 'Armed Police Force Disaster Battalions Station Motorized Water Rescue at Kurintar & Dolalghat', 
    source: 'Armed Police Force (APF) Nepal', 
    officialAgency: 'Disaster Management Training Institute',
    sourceUrl: 'https://apf.gov.np',
    timestamp: '4 hours ago', 
    locationId: 'loc-2', 
    district: 'Sindhupalchok & Chitwan',
    category: 'Search & Rescue', 
    severity: 'INFO', 
    verified: true, 
    isRealBulletin: true,
    verificationStatus: 'VERIFIED',
    summary: 'Specialized deep-water diving and inflatable boat rescue squads stationed along Trishuli, Sunkoshi, and Bhotekoshi riverbanks to execute rapid evacuation if sudden flash floods surge.' 
  },
  { 
    id: 'nw-6', 
    title: 'Nepal Police Traffic Advisory: Night Movement Curtailed on Soft-Slope BP Highway Sections', 
    source: 'Nepal Police NEOC', 
    officialAgency: 'Nepal Police Headquarters Highway Safety Division',
    sourceUrl: 'https://nepalpolice.gov.np',
    timestamp: '5 hours ago', 
    locationId: 'loc-2', 
    district: 'Kavrepalanchok & Sindhuli',
    category: 'Road Safety', 
    severity: 'WARNING', 
    verified: true, 
    isRealBulletin: true,
    verificationStatus: 'VERIFIED',
    summary: 'Precautionary curfew on passenger vehicles between 7:00 PM and 5:00 AM on vulnerable soft-cliff sections of BP Highway (Dhulikhel-Nepalthok) due to high risk of sudden mud debris flows.' 
  }
];

export const MOCK_SUPPLIES: Supply[] = [
  { 
    id: 'sup-1', 
    name: 'Purified Water', 
    category: 'Water', 
    available: 12000, 
    required: 45000, 
    allocated: 6500, 
    remaining: 5500, 
    unit: 'Liters',
    leadTimeHours: 6,
    criticalThreshold: 8000
  },
  { 
    id: 'sup-2', 
    name: 'Food Rations & Dry Meals', 
    category: 'Food', 
    available: 6500, 
    required: 8000, 
    allocated: 3500, 
    remaining: 3000, 
    unit: 'Packs',
    leadTimeHours: 12,
    criticalThreshold: 2000
  },
  { 
    id: 'sup-3', 
    name: 'Emergency Medical & Trauma Kits', 
    category: 'Medicine', 
    available: 1200, 
    required: 2400, 
    allocated: 850, 
    remaining: 350, 
    unit: 'Kits',
    leadTimeHours: 8,
    criticalThreshold: 500
  },
  { 
    id: 'sup-4', 
    name: 'Thermal Blankets', 
    category: 'Blankets', 
    available: 1800, 
    required: 4500, 
    allocated: 1200, 
    remaining: 600, 
    unit: 'Units',
    leadTimeHours: 18,
    criticalThreshold: 1000
  },
  { 
    id: 'sup-5', 
    name: 'Emergency Tarpaulins & Tents', 
    category: 'Shelter', 
    available: 950, 
    required: 2200, 
    allocated: 600, 
    remaining: 350, 
    unit: 'Sets',
    leadTimeHours: 14,
    criticalThreshold: 400
  },
  { 
    id: 'sup-6', 
    name: 'Diesel & Generator Fuel', 
    category: 'Fuel', 
    available: 4200, 
    required: 7500, 
    allocated: 2800, 
    remaining: 1400, 
    unit: 'Liters',
    leadTimeHours: 10,
    criticalThreshold: 2000
  },
  { 
    id: 'sup-7', 
    name: 'Chlorine & Water Purification Tablets', 
    category: 'Water', 
    available: 35000, 
    required: 60000, 
    allocated: 20000, 
    remaining: 15000, 
    unit: 'Tabs',
    leadTimeHours: 4,
    criticalThreshold: 10000
  }
];

export const MOCK_WAREHOUSES: WarehouseDepot[] = [
  {
    id: 'wh-1',
    name: 'Kathmandu Central Humanitarian Staging Area (HSA)',
    location: 'Tribhuvan International Airport Cargo Area, Kathmandu',
    address: 'Sinamangal, Kathmandu',
    lat: 27.6980,
    lng: 85.3580,
    status: 'OPERATIONAL',
    contactPerson: 'Col. Bikram Adhikari (Logistics Cluster)',
    contactPhone: '+977-1-4113000',
    suppliesInStock: [
      { supplyId: 'sup-1', name: 'Purified Water', quantity: 7000, unit: 'Liters' },
      { supplyId: 'sup-2', name: 'Food Rations & Dry Meals', quantity: 3800, unit: 'Packs' },
      { supplyId: 'sup-3', name: 'Emergency Medical & Trauma Kits', quantity: 750, unit: 'Kits' },
      { supplyId: 'sup-4', name: 'Thermal Blankets', quantity: 1100, unit: 'Units' },
      { supplyId: 'sup-6', name: 'Diesel & Generator Fuel', quantity: 2500, unit: 'Liters' }
    ]
  },
  {
    id: 'wh-2',
    name: 'Bharatpur Regional Disaster Staging Warehouse',
    location: 'Bharatpur Airport Logistics Zone, Chitwan',
    address: 'Bharatpur-10, Chitwan',
    lat: 27.6780,
    lng: 84.4310,
    status: 'OPERATIONAL',
    contactPerson: 'Rita Gautam (Nepal Red Cross)',
    contactPhone: '+977-56-521100',
    suppliesInStock: [
      { supplyId: 'sup-1', name: 'Purified Water', quantity: 3500, unit: 'Liters' },
      { supplyId: 'sup-2', name: 'Food Rations & Dry Meals', quantity: 1700, unit: 'Packs' },
      { supplyId: 'sup-3', name: 'Emergency Medical & Trauma Kits', quantity: 300, unit: 'Kits' },
      { supplyId: 'sup-5', name: 'Emergency Tarpaulins & Tents', quantity: 500, unit: 'Sets' }
    ]
  },
  {
    id: 'wh-3',
    name: 'Pokhara Western Forward Staging Base',
    location: 'Pokhara Old Airport Depot, Gandaki',
    address: 'Nagdhunga, Pokhara',
    lat: 28.2000,
    lng: 83.9800,
    status: 'CONGESTED',
    contactPerson: 'Suresh Gurung (Armed Police Force)',
    contactPhone: '+977-61-532244',
    suppliesInStock: [
      { supplyId: 'sup-1', name: 'Purified Water', quantity: 1500, unit: 'Liters' },
      { supplyId: 'sup-2', name: 'Food Rations & Dry Meals', quantity: 1000, unit: 'Packs' },
      { supplyId: 'sup-4', name: 'Thermal Blankets', quantity: 700, unit: 'Units' },
      { supplyId: 'sup-6', name: 'Diesel & Generator Fuel', quantity: 1700, unit: 'Liters' }
    ]
  }
];

export const MOCK_LOCATION_NEEDS: LocationNeed[] = [
  {
    locationId: 'loc-2',
    locationName: 'Melamchi & Helambu Valley',
    district: 'Sindhupalchok',
    affectedPopulation: 4200,
    urgency: 'CRITICAL',
    demands: [
      { supplyName: 'Purified Water', required: 15000, delivered: 4500, unit: 'Liters' },
      { supplyName: 'Emergency Medical & Trauma Kits', required: 800, delivered: 250, unit: 'Kits' },
      { supplyName: 'Emergency Tarpaulins & Tents', required: 900, delivered: 300, unit: 'Sets' },
      { supplyName: 'Thermal Blankets', required: 1500, delivered: 600, unit: 'Units' }
    ]
  },
  {
    locationId: 'loc-1',
    locationName: 'Kathmandu Valley Riverside Wards',
    district: 'Kathmandu / Lalitpur',
    affectedPopulation: 8500,
    urgency: 'HIGH',
    demands: [
      { supplyName: 'Purified Water', required: 20000, delivered: 5500, unit: 'Liters' },
      { supplyName: 'Food Rations & Dry Meals', required: 5000, delivered: 2800, unit: 'Packs' },
      { supplyName: 'Chlorine & Water Purification Tablets', required: 30000, delivered: 12000, unit: 'Tabs' }
    ]
  },
  {
    locationId: 'loc-5',
    locationName: 'Narayangarh & Bharatpur Inundation Camps',
    district: 'Chitwan',
    affectedPopulation: 2800,
    urgency: 'HIGH',
    demands: [
      { supplyName: 'Emergency Medical & Trauma Kits', required: 600, delivered: 200, unit: 'Kits' },
      { supplyName: 'Thermal Blankets', required: 1200, delivered: 400, unit: 'Units' },
      { supplyName: 'Diesel & Generator Fuel', required: 2500, delivered: 900, unit: 'Liters' }
    ]
  }
];

export const MOCK_DISTRIBUTION_PLANS: DistributionPlan[] = [
  {
    id: 'plan-1',
    destinationLocationId: 'loc-2',
    destinationName: 'Melamchi Relief Center (Sindhupalchok)',
    items: [
      { supplyId: 'sup-1', supplyName: 'Purified Water', quantity: 3000, unit: 'Liters' },
      { supplyId: 'sup-3', supplyName: 'Emergency Medical & Trauma Kits', quantity: 200, unit: 'Kits' },
      { supplyId: 'sup-5', supplyName: 'Emergency Tarpaulins & Tents', quantity: 150, unit: 'Sets' }
    ],
    urgency: 'CRITICAL',
    transportMethod: '4WD High-Clearance Truck',
    routeSafety: 'CAUTION_ALERT',
    roadRisk: 'Araniko Hwy passable with caution; river crossing single-lane controlled by traffic police.',
    estimatedTransitTime: '3 hrs 45 mins',
    reasoning: 'Critical flood zone with riverbank isolation and high contamination risk. Road open with escort.',
    confidence: 91,
    status: 'RECOMMENDED',
    timestamp: 'Today, 08:30 AM'
  },
  {
    id: 'plan-2',
    destinationLocationId: 'loc-5',
    destinationName: 'Chitwan Medical College Field Hub',
    items: [
      { supplyId: 'sup-3', supplyName: 'Emergency Medical & Trauma Kits', quantity: 350, unit: 'Kits' },
      { supplyId: 'sup-6', supplyName: 'Diesel & Generator Fuel', quantity: 1200, unit: 'Liters' }
    ],
    urgency: 'HIGH',
    transportMethod: 'Heavy Freight Truck',
    routeSafety: 'BLOCKED_BYPASS_REQUIRED',
    roadRisk: 'Prithvi Highway Km 45 landslide block. Re-routed via Tribhuvan Highway (Hetauda corridor).',
    estimatedTransitTime: '5 hrs 20 mins',
    reasoning: 'Hospital backup power generator and trauma supply replenishment required before nightfall.',
    confidence: 88,
    status: 'APPROVED',
    timestamp: 'Today, 07:15 AM',
    approvedBy: 'Logistics Officer P. Adhikari',
    approvedAt: 'Today, 07:45 AM'
  }
];

export const MOCK_DELIVERY_RECORDS: DeliveryRecord[] = [
  {
    id: 'del-101',
    planId: 'plan-2',
    destination: 'Chitwan Medical College Field Hub',
    itemsSummary: '350 Medical Kits, 1,200L Diesel',
    vehicleType: 'Heavy 10-Ton Truck (Ba 2 Kha 4491)',
    dispatchedFrom: 'Tribhuvan HSA Kathmandu',
    driverOrLeader: 'Driver Shyam Tamang / Escort APF',
    contact: '+977-9841-889900',
    departureTime: '08:15 AM',
    eta: '01:35 PM (Delayed 40m near Kulekhani)',
    status: 'IN_TRANSIT'
  },
  {
    id: 'del-102',
    planId: 'plan-prev-1',
    destination: 'KTM Ward 4 Community Hall Shelter',
    itemsSummary: '1,500L Water, 500 Blankets',
    vehicleType: '4WD Light Truck (Ba 1 Ja 7812)',
    dispatchedFrom: 'Tribhuvan HSA Kathmandu',
    driverOrLeader: 'Volunteer Lead Nabin Shrestha',
    contact: '+977-9811-223344',
    departureTime: '06:30 AM',
    eta: '07:45 AM',
    status: 'DELIVERED'
  }
];

export const MOCK_SHORTAGE_PREDICTIONS: ShortagePrediction[] = [
  {
    id: 'short-1',
    resource: 'Emergency Medical Kits & Insulin Supplies',
    affectedLocations: ['Sindhupalchok (Melamchi)', 'Chitwan (Bharatpur)'],
    currentAvailable: 350,
    burnRatePerDay: 480,
    predictedShortageHours: 18,
    predictedDepletionDate: 'Tomorrow, 02:00 AM',
    confidence: 87,
    factors: [
      'Disaster surge in flood-related lacerations and waterborne triage',
      'Araniko Highway traffic delays slowing replenishment',
      'Hospital quota utilization spike exceeding 92%'
    ],
    recommendedPreparation: 'Pre-position 500 trauma kits from Nepalgunj reserve or request emergency air-drop for Helambu upper health post.',
    status: 'CRITICAL_FUTURE'
  },
  {
    id: 'short-2',
    resource: 'Purified Bottled Drinking Water',
    affectedLocations: ['Sindhupalchok', 'Kathmandu Ward 4 Riverside'],
    currentAvailable: 5500,
    burnRatePerDay: 7200,
    predictedShortageHours: 28,
    predictedDepletionDate: 'Tomorrow, 12:00 PM',
    confidence: 84,
    factors: [
      'Municipal water mains ruptured along Bagmati and Melamchi rivers',
      'Evacuee intake into temporary shelters tripled overnight'
    ],
    recommendedPreparation: 'Deploy mobile water filtration units (WASH cluster) and release 15,000 chlorine tablets immediately.',
    status: 'WARNING'
  },
  {
    id: 'short-3',
    resource: 'Generator Diesel Fuel',
    affectedLocations: ['Bharatpur Central Hospital Hub'],
    currentAvailable: 1400,
    burnRatePerDay: 1800,
    predictedShortageHours: 34,
    predictedDepletionDate: 'Tomorrow, 06:00 PM',
    confidence: 82,
    factors: [
      'Grid outage expected to persist 48h while substation repairs proceed',
      'Continuous operation of neonatal ICUs and surgical lights'
    ],
    recommendedPreparation: 'Re-route 2 fuel bowsers from Amlekhgunj petroleum depot via Hetauda bypass.',
    status: 'WARNING'
  }
];

export const MOCK_MISSING: MissingPerson[] = [
  {
    id: 'mp-1',
    name: 'Aarav Thapa',
    age: 34,
    gender: 'Male',
    photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80',
    lastLocation: 'Melamchi Bazaar, Sindhupalchok',
    lastKnownLocation: 'Melamchi Bazaar, Sindhupalchok',
    locationId: 'loc-2',
    lat: 27.8300,
    lng: 85.5800,
    lastSeen: '24 hours ago',
    lastSeenDateTime: '2026-09-10 10:30 AM',
    clothing: 'Navy blue waterproof hooded jacket, dark jeans, brown hiking boots',
    description: 'Last seen helping shopkeepers secure goods near riverbank during the flood warning. Carrying a dark grey backpack.',
    physicalDescription: 'Height ~5ft 9in, athletic build, short black hair, slight stubble',
    reportedBy: 'Sunil Thapa (Brother)',
    reportSource: 'Direct Family Report via Melamchi Helpline',
    contactInfo: '+977-9841-234567',
    contactInformation: '+977-9841-234567',
    status: 'POSSIBLE MATCH',
    urgency: 'HIGH',
    baselinePriorityScore: 78,
    baselinePriorityBreakdown: {
      score: 78,
      tier: 'HIGH',
      factors: [
        'Prolonged exposure window: Missing > 24 hours',
        'High hazard zone: Region under active Flood alert',
        '1 potential sighting lead(s) currently being investigated'
      ],
      vulnerabilityScore: 10,
      timeElapsedScore: 25,
      hazardExposureScore: 25,
      leadsScore: 18
    },
    createdAt: '2026-09-10 11:15 AM',
    updatedAt: '2026-09-11 08:30 AM',
    disasterContext: {
      incidentId: 'inc-1',
      incidentName: 'Flash Flood Risk: Melamchi',
      affectedRegion: 'Sindhupalchok (Bagmati)',
      hazardType: 'Flash Flood'
    },
    potentialMatchIds: ['sight-1'],
    timeline: [
      {
        id: 'tl-1',
        timestamp: '10:30 AM Yesterday',
        action: 'Last Confirmed Contact',
        description: 'Last witnessed near Melamchi Bridge securing supplies before dam surge warning.',
        actor: 'Eyewitness / Local Shopkeeper',
        type: 'REPORT'
      },
      {
        id: 'tl-2',
        timestamp: '11:15 AM Yesterday',
        action: 'Missing Person Case Registered',
        description: 'Case registered in SAHAYAK with priority HIGH (Score: 78).',
        actor: 'Disaster Coordination Desk',
        type: 'REPORT'
      },
      {
        id: 'tl-3',
        timestamp: '07:45 AM Today',
        action: 'Field Sighting S-201 Logged',
        description: 'Shelter medical staff reported registration of an individual matching appearance at Melamchi Relief Center.',
        actor: 'Melamchi Shelter Triage Unit',
        type: 'SIGHTING'
      },
      {
        id: 'tl-4',
        timestamp: '08:00 AM Today',
        action: 'AI Candidate Comparison Generated',
        description: 'AI detected 82% similarity across apparel (blue jacket, boots) and spatial sector. Flagged as POTENTIAL MATCH.',
        actor: 'SAHAYAK AI Matching Engine',
        type: 'AI_ANALYSIS'
      },
      {
        id: 'tl-5',
        timestamp: '08:15 AM Today',
        action: 'Human Verification Requested',
        description: 'Case elevated to command desk for family photo & officer verification.',
        actor: 'System Automation',
        type: 'HUMAN_REVIEW'
      }
    ]
  },
  {
    id: 'mp-2',
    name: 'Sita Sharma',
    age: 8,
    gender: 'Female',
    photo: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=300&auto=format&fit=crop&q=80',
    lastLocation: 'Kathmandu Ward 4 (Near Dhobi Khola)',
    lastKnownLocation: 'Kathmandu Ward 4 (Near Dhobi Khola)',
    locationId: 'loc-1',
    lat: 27.7122,
    lng: 85.3200,
    lastSeen: '5 hours ago',
    lastSeenDateTime: '2026-09-11 05:45 AM',
    clothing: 'White shirt with navy blue pleated skirt (School Uniform), red hair ribbons, black school shoes',
    description: 'Separated from mother while evacuating ground floor during early morning water surge along Dhobi Khola corridor. Carrying red school backpack.',
    physicalDescription: 'Height ~3ft 10in, slim, long braided hair with ribbons',
    reportedBy: 'Geeta Sharma (Mother)',
    reportSource: 'Emergency Ward 4 Police Post',
    contactInfo: '+977-9812-998877',
    contactInformation: '+977-9812-998877',
    status: 'MISSING',
    urgency: 'CRITICAL',
    baselinePriorityScore: 92,
    baselinePriorityBreakdown: {
      score: 92,
      tier: 'CRITICAL',
      factors: [
        'Extreme vulnerability: Child under 10 (Age 8)',
        'Active alert window: Missing 4-12 hours',
        'High hazard zone: Region under active Flood alert',
        'Unresolved trail: No confirmed leads or potential sightings yet'
      ],
      vulnerabilityScore: 35,
      timeElapsedScore: 22,
      hazardExposureScore: 25,
      leadsScore: 10
    },
    createdAt: '2026-09-11 06:15 AM',
    updatedAt: '2026-09-11 07:00 AM',
    disasterContext: {
      incidentId: 'inc-2',
      incidentName: 'Urban Inundation: Kathmandu Corridor',
      affectedRegion: 'Kathmandu (Bagmati)',
      hazardType: 'Flash Flood & Grid Collapse'
    },
    potentialMatchIds: ['sight-2'],
    timeline: [
      {
        id: 'tl-21',
        timestamp: '05:45 AM Today',
        action: 'Separation Occurred',
        description: 'Family separated during rapid basement water level rise in Ward 4.',
        actor: 'Family Report',
        type: 'REPORT'
      },
      {
        id: 'tl-22',
        timestamp: '06:15 AM Today',
        action: 'Critical Missing Child Alert Issued',
        description: 'Baseline priority calculated at 92 (CRITICAL). Search units alerted.',
        actor: 'Emergency Police Ward 4',
        type: 'STATUS_CHANGE'
      },
      {
        id: 'tl-23',
        timestamp: '08:30 AM Today',
        action: 'Field Sighting S-202 Logged',
        description: 'Volunteer team at KTM Ward 4 Community Hall reported a young girl brought in by neighbors.',
        actor: 'Community Response Team',
        type: 'SIGHTING'
      }
    ]
  },
  {
    id: 'mp-3',
    name: 'Bikram Gurung',
    age: 62,
    gender: 'Male',
    photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&auto=format&fit=crop&q=80',
    lastLocation: 'Bharatpur Ring Area, Chitwan',
    lastKnownLocation: 'Bharatpur Ring Area, Chitwan',
    locationId: 'loc-5',
    lat: 27.6766,
    lng: 84.4285,
    lastSeen: '18 hours ago',
    lastSeenDateTime: '2026-09-10 04:00 PM',
    clothing: 'Grey woolen buttoned sweater, black trousers, traditional Dhaka Topi',
    description: 'Diabetic individual requiring daily insulin medication. Walks with a lightweight carved wooden cane. Wandered from residence during highway landslide gridlock.',
    physicalDescription: 'Height ~5ft 6in, silver hair, spectacles with dark rim',
    reportedBy: 'Kiran Gurung (Son)',
    reportSource: 'Chitwan Red Cross Chapter',
    contactInfo: '+977-9856-443322',
    contactInformation: '+977-9856-443322',
    status: 'MISSING',
    urgency: 'HIGH',
    baselinePriorityScore: 81,
    baselinePriorityBreakdown: {
      score: 81,
      tier: 'HIGH',
      factors: [
        'Elevated vulnerability: Older adult (Age 62)',
        'Medical dependency or health risk noted in profile (Insulin)',
        'Prolonged exposure window: Missing > 12 hours',
        'Elevated regional weather/landslide risk'
      ],
      vulnerabilityScore: 30,
      timeElapsedScore: 23,
      hazardExposureScore: 18,
      leadsScore: 10
    },
    createdAt: '2026-09-10 06:00 PM',
    updatedAt: '2026-09-11 06:30 AM',
    disasterContext: {
      incidentId: 'inc-3',
      incidentName: 'Landslide blocking Prithvi Hwy',
      affectedRegion: 'Chitwan (Bagmati)',
      hazardType: 'Landslide & Road Severance'
    },
    potentialMatchIds: ['sight-3'],
    timeline: [
      {
        id: 'tl-31',
        timestamp: '04:00 PM Yesterday',
        action: 'Last Sighting by Family',
        description: 'Observed near local bus stop looking for transportation toward Narayangarh.',
        actor: 'Family Member',
        type: 'REPORT'
      },
      {
        id: 'tl-32',
        timestamp: '06:00 PM Yesterday',
        action: 'Missing Senior Report Logged',
        description: 'Reported with urgent medical insulin dependency note.',
        actor: 'Chitwan Red Cross',
        type: 'STATUS_CHANGE'
      },
      {
        id: 'tl-33',
        timestamp: '09:10 AM Today',
        action: 'Sighting S-203 Received',
        description: 'OPD staff at Chitwan Medical College reported unidentified senior.',
        actor: 'Chitwan Medical College OPD',
        type: 'SIGHTING'
      }
    ]
  },
  {
    id: 'mp-4',
    name: 'Dawa Sherpa',
    age: 28,
    gender: 'Male',
    photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80',
    lastLocation: 'Pokhara Lakeside / Sarangkot Trail',
    lastKnownLocation: 'Pokhara Lakeside / Sarangkot Trail',
    locationId: 'loc-3',
    lat: 28.2096,
    lng: 83.9856,
    lastSeen: '12 hours ago',
    lastSeenDateTime: '2026-09-10 10:00 PM',
    clothing: 'Bright orange trekking windbreaker, black cargo pants, beige hiking boots',
    description: 'Trekking guide returning from upper ridge. Phone signal lost during heavy cloudburst. Carrying black waterproof pack.',
    physicalDescription: 'Height ~5ft 8in, muscular build, ear piercing on left ear',
    reportedBy: 'Pokhara Trekking Association',
    reportSource: 'Guide Union Dispatch',
    contactInfo: '+977-9803-112233',
    contactInformation: '+977-9803-112233',
    status: 'MISSING',
    urgency: 'MEDIUM',
    baselinePriorityScore: 64,
    createdAt: '2026-09-11 02:00 AM',
    updatedAt: '2026-09-11 07:00 AM',
    disasterContext: {
      affectedRegion: 'Pokhara (Gandaki)',
      hazardType: 'Flash Flood & Trail Washout'
    },
    potentialMatchIds: ['sight-4'],
    timeline: [
      {
        id: 'tl-41',
        timestamp: '10:00 PM Yesterday',
        action: 'GPS Check-in Failed',
        description: 'Expected arrival check-in at Lakeside lodge failed.',
        actor: 'Lodge Reception',
        type: 'REPORT'
      }
    ]
  },
  {
    id: 'mp-5',
    name: 'Sunita Rai',
    age: 21,
    gender: 'Female',
    photo: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=300&auto=format&fit=crop&q=80',
    lastLocation: 'Biratnagar Mills Sector',
    lastKnownLocation: 'Biratnagar Mills Sector',
    locationId: 'loc-4',
    lat: 26.4525,
    lng: 87.2718,
    lastSeen: '36 hours ago',
    lastSeenDateTime: '2026-09-09 08:00 PM',
    clothing: 'Yellow cotton Kurti, white embroidered shawl, flat sandals',
    description: 'University student who was walking home during initial street flooding.',
    physicalDescription: 'Height ~5ft 3in, slim, glasses with gold frame',
    reportedBy: 'Bishnu Rai (Father)',
    reportSource: 'Biratnagar Municipal Disaster Center',
    contactInfo: '+977-9821-334455',
    contactInformation: '+977-9821-334455',
    status: 'FOUND',
    urgency: 'LOW',
    baselinePriorityScore: 35,
    createdAt: '2026-09-10 09:00 AM',
    updatedAt: '2026-09-11 08:00 AM',
    disasterContext: {
      affectedRegion: 'Biratnagar (Koshi)',
      hazardType: 'Inundation'
    },
    verifiedMatchSightingId: 'sight-verified-1',
    verificationDetails: {
      verifiedBy: 'Officer K. Sharma (Biratnagar Police)',
      verifiedAt: '2026-09-11 08:00 AM',
      notes: 'Confirmed in person at Koshi Zonal Hospital Relief Shelter. Reunited with father.',
      status: 'VERIFIED'
    },
    timeline: [
      {
        id: 'tl-51',
        timestamp: 'Sep 9, 08:00 PM',
        action: 'Reported Missing',
        description: 'Reported missing by family after floodwaters rose along route.',
        actor: 'Family',
        type: 'REPORT'
      },
      {
        id: 'tl-52',
        timestamp: 'Sep 10, 04:00 PM',
        action: 'Registered at Relief Shelter',
        description: 'Admitted to Koshi Relief Shelter with dry clothes and shelter support.',
        actor: 'Shelter Staff',
        type: 'SIGHTING'
      },
      {
        id: 'tl-53',
        timestamp: '08:00 AM Today',
        action: 'Officer In-Person Verification: Confirmed',
        description: 'Identity confirmed by Officer K. Sharma via student ID card. Status changed to FOUND.',
        actor: 'Officer K. Sharma',
        type: 'STATUS_CHANGE'
      }
    ]
  }
];

export const MOCK_SIGHTINGS: Sighting[] = [
  {
    id: 'sight-1',
    location: 'Melamchi Relief Center (Shelter Medical Tent)',
    locationId: 'loc-2',
    lat: 27.8300,
    lng: 85.5800,
    timestamp: 'Today, 07:45 AM',
    description: 'Adult male, mid-30s, registered at triage with mild ankle sprain. Wearing navy blue hooded rain jacket and muddy brown hiking boots. Spoke Nepali, mentioned he evacuated from riverbank shops.',
    clothing: 'Navy blue hooded rain jacket, dark trousers, brown hiking boots',
    photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80',
    source: 'Melamchi Relief Center Staff',
    reporter: 'Dr. Anita Joshi (Medical Volunteer)',
    contactInfo: '+977-1-112233 (Triage Desk)',
    relatedPersonCandidate: 'mp-1',
    status: 'POTENTIAL_MATCH',
    confidence: 82,
    facilityType: 'Shelter',
    facilityName: 'Melamchi Relief Center'
  },
  {
    id: 'sight-2',
    location: 'KTM Ward 4 Community Hall Shelter',
    locationId: 'loc-1',
    lat: 27.7122,
    lng: 85.3200,
    timestamp: 'Today, 08:30 AM',
    description: 'Young girl, estimated age 7-9, brought in by volunteer from Dhobi Khola neighborhood. Wearing blue windbreaker over white tee, carrying red water bottle. Appears shaken but unharmed.',
    clothing: 'Blue windbreaker, white tee, dark pants (No uniform visible, but red accessories)',
    photo: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=300&auto=format&fit=crop&q=80',
    source: 'Community Response Volunteer',
    reporter: 'Ramesh Poudel (Ward 4 Volunteer)',
    contactInfo: '+977-9841-887766',
    relatedPersonCandidate: 'mp-2',
    status: 'POTENTIAL_MATCH',
    confidence: 68,
    facilityType: 'Shelter',
    facilityName: 'KTM Ward 4 Shelter'
  },
  {
    id: 'sight-3',
    location: 'Chitwan Medical College OPD Triage',
    locationId: 'loc-5',
    lat: 27.6766,
    lng: 84.4285,
    timestamp: 'Today, 09:10 AM',
    description: 'Elderly man arrived at OPD triage without national ID. Wearing heavy black zipped jacket, green trousers. No walking stick present. Speaking Bhojpuri dialect.',
    clothing: 'Black winter jacket, green trousers, no Dhaka Topi',
    source: 'Hospital Security & OPD Desk',
    reporter: 'Nurse Pratima (OPD Staff)',
    contactInfo: '+977-56-556677',
    relatedPersonCandidate: 'mp-3',
    status: 'POTENTIAL_MATCH',
    confidence: 38,
    facilityType: 'Hospital',
    facilityName: 'Chitwan Medical College'
  },
  {
    id: 'sight-4',
    location: 'Pokhara Lakeside Emergency Transit Point',
    locationId: 'loc-3',
    lat: 28.2096,
    lng: 83.9856,
    timestamp: 'Today, 06:15 AM',
    description: 'Trekker resting at municipal transit tent with orange gear. Asked directions toward tourist police booth.',
    clothing: 'Orange jacket, cargo pants, mud-spattered boots',
    source: 'Transit Point Monitor',
    reporter: 'Bikash Karki',
    relatedPersonCandidate: 'mp-4',
    status: 'UNREVIEWED',
    confidence: 72,
    facilityType: 'Transit',
    facilityName: 'Lakeside Transit Post'
  }
];

export const MOCK_CANDIDATE_MATCHES: CandidateMatch[] = [
  {
    id: 'match-mp-1-sight-1',
    missingPersonId: 'mp-1',
    sightingId: 'sight-1',
    similarityScore: 82,
    status: 'PENDING_REVIEW',
    matchAssessment: 'POTENTIAL_MATCH',
    supportingEvidence: [
      'Identical geographic municipality: Melamchi Bazaar evacuees directed to Melamchi Relief Center',
      'Strong attire correlation: Navy blue hooded rain jacket and hiking boots match reported clothing',
      'Demographic match: Male in his mid-30s with similar stature',
      'Timing alignment: Sighting logged 07:45 AM today after yesterday\'s flooding evacuation'
    ],
    contradictingEvidence: [
      'No formal national identity card produced at triage desk (provisional registration only)'
    ],
    locationRelationship: 'Direct vicinity: 1.2 km from reported missing point at Melamchi Bazaar to Relief Center',
    timeRelationship: 'Sighting logged 21 hours post-disaster surge; fits evacuation timeline',
    recommendation: 'HUMAN VERIFICATION REQUIRED - Officer should cross-reference family contact Sunil Thapa',
    analyzedAt: '08:00 AM Today',
    analyzedBy: 'GEMINI_AI'
  },
  {
    id: 'match-mp-3-sight-3',
    missingPersonId: 'mp-3',
    sightingId: 'sight-3',
    similarityScore: 38,
    status: 'PENDING_REVIEW',
    matchAssessment: 'UNLIKELY_MATCH',
    supportingEvidence: [
      'Senior citizen male in the Chitwan district vicinity',
      'Presence in medical facility consistent with elder needing healthcare'
    ],
    contradictingEvidence: [
      'Attire conflict: Reported wearing grey buttoned sweater vs sighted in heavy black jacket',
      'Physical item missing: Walking stick/cane was not present with the individual',
      'Linguistic divergence: Sighted individual predominantly speaking Bhojpuri, family reported Nepali speaker'
    ],
    locationRelationship: 'Same municipality (Bharatpur), but distinct sector from last known home route',
    timeRelationship: 'Plausible time window (17 hours elapsed)',
    recommendation: 'HUMAN VERIFICATION REQUIRED - High probability of false match due to conflicting attire and language',
    analyzedAt: '09:20 AM Today',
    analyzedBy: 'GEMINI_AI'
  }
];


export const MOCK_VOLUNTEERS: Volunteer[] = [
  { 
    id: 'vol-1', 
    name: 'Nabin Shrestha', 
    locationId: 'loc-1', 
    skills: ['First Aid', 'Search & Rescue', 'Convoy Driving'], 
    experience: '5 years NGO & Red Cross emergency responder', 
    availability: 'Immediate (24/7)', 
    preferredArea: 'Kathmandu Valley / Sindhupalchok', 
    teamLeader: true, 
    phone: '+977-9841-112233',
    currentAssignment: 'Deployed to Kathmandu Ward 4 Riverside Shelter',
    assignedTeamId: 'team-1',
    status: 'DEPLOYED', 
    capabilities: { leadership: 'High', medical: 'High', logistics: 'Medium', field: 'High' } 
  },
  { 
    id: 'vol-2', 
    name: 'Dr. Anita Joshi', 
    locationId: 'loc-2', 
    skills: ['Emergency Triage', 'Trauma Surgery', 'Pediatric Care'], 
    experience: '8 years Senior Medical Officer at Dhulikhel Hospital', 
    availability: 'Immediate', 
    preferredArea: 'Sindhupalchok (Melamchi)', 
    teamLeader: true, 
    phone: '+977-9851-223344',
    currentAssignment: 'Lead Triage Officer at Melamchi Relief Center Tent',
    assignedTeamId: 'team-2',
    status: 'DEPLOYED', 
    capabilities: { leadership: 'High', medical: 'High', logistics: 'Low', field: 'High' } 
  },
  { 
    id: 'vol-3', 
    name: 'Suman Gurung', 
    locationId: 'loc-3', 
    skills: ['Alpine Rescue', 'Drone Operator', 'Satellite Comms'], 
    experience: '6 years Himalayan Mountain Guides Association SAR Lead', 
    availability: 'Immediate', 
    preferredArea: 'Pokhara / Sarangkot Trail', 
    teamLeader: true, 
    phone: '+977-9803-445566',
    currentAssignment: 'Coordinating aerial search for missing guide Dawa Sherpa',
    assignedTeamId: 'team-3',
    status: 'DEPLOYED', 
    capabilities: { leadership: 'High', medical: 'Medium', logistics: 'Medium', field: 'High' } 
  },
  { 
    id: 'vol-4', 
    name: 'Pooja Chaudhary', 
    locationId: 'loc-5', 
    skills: ['Supply Chain', 'Heavy Vehicle Transport', 'Food Distribution'], 
    experience: '3 years WFP logistics contractor in Terai corridors', 
    availability: 'Immediate', 
    preferredArea: 'Chitwan / Narayangarh', 
    teamLeader: false, 
    phone: '+977-9821-778899',
    currentAssignment: 'Staging depot intake at Bharatpur Airport Warehouse',
    assignedTeamId: 'team-4',
    status: 'ASSIGNED', 
    capabilities: { leadership: 'Medium', medical: 'Low', logistics: 'High', field: 'High' } 
  },
  { 
    id: 'vol-5', 
    name: 'Bikash Karki', 
    locationId: 'loc-1', 
    skills: ['HAM Radio Operator', 'IT & Telecoms', 'Mapping'], 
    experience: '4 years Amateur Radio Society of Nepal emergency net', 
    availability: 'Evenings & Weekends', 
    preferredArea: 'Kathmandu HQ', 
    teamLeader: false, 
    phone: '+977-9861-334455',
    currentAssignment: 'Unassigned reserve',
    status: 'AVAILABLE', 
    capabilities: { leadership: 'Medium', medical: 'Low', logistics: 'Medium', field: 'Low' } 
  },
  { 
    id: 'vol-6', 
    name: 'Srijana Magar', 
    locationId: 'loc-2', 
    skills: ['Nursing', 'WASH Sanitation', 'Community Counseling'], 
    experience: '2 years community clinic health worker', 
    availability: 'Immediate', 
    preferredArea: 'Sindhupalchok', 
    teamLeader: false, 
    phone: '+977-9818-667788',
    currentAssignment: 'Water purification instruction at Helambu camp',
    assignedTeamId: 'team-2',
    status: 'DEPLOYED', 
    capabilities: { leadership: 'Medium', medical: 'High', logistics: 'Medium', field: 'High' } 
  }
];

export const MOCK_VOLUNTEER_TEAMS: VolunteerTeam[] = [
  {
    id: 'team-1',
    name: 'Bagmati Rapid Response Unit (Alpha)',
    leaderId: 'vol-1',
    leaderName: 'Nabin Shrestha',
    contact: '+977-9841-112233',
    memberCount: 8,
    specialization: 'Search & Rescue (SAR)',
    status: 'DEPLOYED',
    assignedLocationId: 'loc-1',
    assignedLocationName: 'Kathmandu Valley Riverside',
    currentTask: 'Inundation evacuation and raft rescue in Balkhu/Kuleshwor river corridor',
    lat: 27.6950,
    lng: 85.2950
  },
  {
    id: 'team-2',
    name: 'Himalayan Medical Triage Flying Squad (Bravo)',
    leaderId: 'vol-2',
    leaderName: 'Dr. Anita Joshi',
    contact: '+977-9851-223344',
    memberCount: 6,
    specialization: 'Medical Triage',
    status: 'DEPLOYED',
    assignedLocationId: 'loc-2',
    assignedLocationName: 'Melamchi Relief Center Tent',
    currentTask: 'Treating flash flood injuries, trauma care, and screening for waterborne outbreaks',
    lat: 27.8300,
    lng: 85.5800
  },
  {
    id: 'team-3',
    name: 'Gandaki Alpine Trail Recon (Charlie)',
    leaderId: 'vol-3',
    leaderName: 'Suman Gurung',
    contact: '+977-9803-445566',
    memberCount: 5,
    specialization: 'Communications & Drone',
    status: 'DEPLOYED',
    assignedLocationId: 'loc-3',
    assignedLocationName: 'Pokhara / Sarangkot Ridge',
    currentTask: 'Drone reconnaissance along washed-out trail sections for missing guide Dawa Sherpa',
    lat: 28.2300,
    lng: 83.9600
  },
  {
    id: 'team-4',
    name: 'Central Terai Logistics Convoy (Delta)',
    leaderId: 'vol-4',
    leaderName: 'Pooja Chaudhary',
    contact: '+977-9821-778899',
    memberCount: 10,
    specialization: 'Logistics & Supply Convoy',
    status: 'ASSIGNED',
    assignedLocationId: 'loc-5',
    assignedLocationName: 'Bharatpur Staging Depot',
    currentTask: 'Unloading 4WD supply trucks and organizing food rations for river settlements',
    lat: 27.6800,
    lng: 84.4300
  },
  {
    id: 'team-5',
    name: 'Emergency Telecoms & Radio Net (Echo)',
    leaderId: 'vol-5',
    leaderName: 'Bikash Karki',
    contact: '+977-9861-334455',
    memberCount: 4,
    specialization: 'Communications & Drone',
    status: 'STANDBY',
    assignedLocationId: 'loc-1',
    assignedLocationName: 'Kathmandu NEOC Staging Hub',
    currentTask: 'Standby for VHF repeater deployment if cell towers fail',
    lat: 27.7172,
    lng: 85.3240
  }
];

export const MOCK_VOLUNTEER_RECOMMENDATIONS: VolunteerAllocationRecommendation[] = [
  {
    id: 'rec-1',
    candidateId: 'team-5',
    candidateName: 'Emergency Telecoms & Radio Net (Echo)',
    isTeam: true,
    currentStatus: 'STANDBY (Kathmandu)',
    suggestedLocationId: 'loc-2',
    suggestedLocationName: 'Sindhupalchok (Melamchi Upper Gorge)',
    targetRole: 'Deploy Portable VHF Emergency Repeater',
    requiredSkills: ["General", "Field"],
    matchRationale: 'Severe cell tower outage reported at Melamchi; team Echo has solar HAM transceivers and mountain radio experience.',
    confidence: 94,
    status: 'RECOMMENDED'
  },
  {
    id: 'rec-2',
    candidateId: 'vol-5',
    candidateName: 'Bikash Karki',
    isTeam: false,
    currentStatus: 'AVAILABLE (Kathmandu)',
    suggestedLocationId: 'loc-5',
    suggestedLocationName: 'Chitwan Relief Operations Center',
    targetRole: 'Logistics Inventory Data Specialist',
    requiredSkills: ["General", "Field"],
    matchRationale: 'Bharatpur warehouse reports critical bottleneck in barcode logging of medical dispatches; volunteer possesses database and tracking experience.',
    confidence: 89,
    status: 'RECOMMENDED'
  }
];

export const MOCK_ASSESSMENTS: Assessment[] = [
  { 
    id: 'asm-1', 
    locationId: 'loc-2', 
    locationName: 'Melamchi Bazaar & Indrawati Confluence',
    type: 'Bridge Structural Washout', 
    assetCategory: 'Bridge',
    severity: 'CRITICAL', 
    damageLevel: 'DESTROYED',
    impact: 'Main highway span severed by high-velocity debris flood; cuts off 500+ households in Helambu upper wards and hampers ambulance transit.', 
    status: 'VERIFIED', 
    source: 'Nepal Army Drone Reconnaissance', 
    timestamp: '2 hours ago',
    confidenceScore: 96,
    lat: 27.8320,
    lng: 85.5820,
    beforeImageUrl: 'https://images.unsplash.com/photo-1545558014-8692077e9b5c?w=600&auto=format&fit=crop&q=80',
    afterImageUrl: 'https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?w=600&auto=format&fit=crop&q=80',
    droneImageUrl: 'https://images.unsplash.com/photo-1473448912268-2022ce9509d8?w=600&auto=format&fit=crop&q=80',
    aiAnalysis: {
      detectedDamage: 'Central pier foundation completely undermined; 42m pre-stressed concrete deck displaced downstream.',
      confidence: 95,
      structuralIntegrity: 'COLLAPSED',
      hazardRisk: 'Immediate drowning hazard; unstable embankment subject to secondary river scour.',
      evidenceNotes: [
        'Visible abutment shear fracture on left bank',
        'River velocity exceeding 4.2 m/s carrying heavy boulders',
        'Pedestrian suspension footbridge 200m upstream also compromised'
      ]
    },
    humanReview: {
      status: 'CONFIRMED',
      reviewedBy: 'Chief Engineer K. R. Bhattarai (Dept of Roads)',
      reviewedAt: 'Today, 08:15 AM',
      notes: 'Structural collapse confirmed. Bailey bridge mobilization requested from Hetauda Army Base.'
    }
  },
  { 
    id: 'asm-2', 
    locationId: 'loc-5', 
    locationName: 'Prithvi Highway Km 45 (Charkilo Sector)',
    type: 'Debris Flow Road Obstruction', 
    assetCategory: 'Road',
    severity: 'HIGH', 
    damageLevel: 'SEVERE',
    impact: '4,000 cubic meters of mud, rockfall, and pine trees blocking both lanes; 150+ freight and passenger vehicles stranded.', 
    status: 'VERIFIED', 
    source: 'District Traffic Police Chitwan', 
    timestamp: '3 hours ago',
    confidenceScore: 92,
    lat: 27.6521,
    lng: 84.5512,
    beforeImageUrl: 'https://images.unsplash.com/photo-1517649763962-0c623266ddc0?w=600&auto=format&fit=crop&q=80',
    afterImageUrl: 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?w=600&auto=format&fit=crop&q=80',
    aiAnalysis: {
      detectedDamage: 'Slope failure extending 75m up hillside; culvert beneath highway clogged causing road surface ponding.',
      confidence: 91,
      structuralIntegrity: 'UNSAFE',
      hazardRisk: 'Active secondary slide triggered by ongoing rainfall.',
      evidenceNotes: [
        'Two heavy excavators operating on site',
        'Single lane clearing estimated in 6 hours if weather holds',
        'Rock netting required before full commercial reopening'
      ]
    },
    humanReview: {
      status: 'CONFIRMED',
      reviewedBy: 'Superintendent R. Thapa (APF Traffic)',
      reviewedAt: 'Today, 07:30 AM',
      notes: 'Heavy machinery actively working. Diverting emergency light ambulances via Tribhuvan Highway.'
    }
  },
  { 
    id: 'asm-3', 
    locationId: 'loc-1', 
    locationName: 'Balkhu Substation (Kathmandu 66kV Transformer)',
    type: 'Transformer Flooding & Electrical Arc', 
    assetCategory: 'Power',
    severity: 'HIGH', 
    damageLevel: 'MODERATE',
    impact: 'Substation ground yard inundated by 1.1m Bagmati floodwaters; circuit breakers tripped affecting 12,000 customers and municipal pumps.', 
    status: 'PENDING', 
    source: 'Nepal Electricity Authority (NEA) Field Crew', 
    timestamp: '1 hour ago',
    confidenceScore: 88,
    lat: 27.6850,
    lng: 85.2950,
    aiAnalysis: {
      detectedDamage: 'Control building basement waterlogged; secondary oil containment tank flooded with silty river water.',
      confidence: 86,
      structuralIntegrity: 'STABLE',
      hazardRisk: 'Electrocution hazard if re-energized before thorough drying.',
      evidenceNotes: [
        'Transformers de-energized safely prior to submergence',
        'Water receded 20cm in past hour',
        'Industrial pumps deployed for de-watering'
      ]
    },
    humanReview: {
      status: 'PENDING'
    }
  },
  { 
    id: 'asm-4', 
    locationId: 'loc-2', 
    locationName: 'Sindhupalchok Primary Sub-Health Post',
    type: 'Clinic Foundation Scour & Wall Cracking', 
    assetCategory: 'Hospital',
    severity: 'HIGH', 
    damageLevel: 'SEVERE',
    impact: 'Western retaining wall collapsed; medicine cold storage compromised due to power cut and structural shift.', 
    status: 'VERIFIED', 
    source: 'Ward 3 Health Volunteer Report', 
    timestamp: '4 hours ago',
    confidenceScore: 90,
    lat: 27.8450,
    lng: 85.5920,
    aiAnalysis: {
      detectedDamage: 'Load-bearing masonry cracked at 45-degree angle; foundation toe eroded by hillside drainage rush.',
      confidence: 89,
      structuralIntegrity: 'UNSAFE',
      hazardRisk: 'Unsafe for indoor patient admission; relocate triage to field tents immediately.',
      evidenceNotes: [
        'Vaccine cold chain transferred to solar backup in nearby school',
        'Staff evacuated to open sports ground'
      ]
    },
    humanReview: {
      status: 'CONFIRMED',
      reviewedBy: 'District Health Officer Dr. M. Poudel',
      reviewedAt: 'Today, 06:45 AM',
      notes: 'Facility condemned for indoor use. Medical operations relocated to Melamchi Relief Center tent.'
    }
  },
  { 
    id: 'asm-5', 
    locationId: 'loc-1', 
    locationName: 'Sundarijal Water Treatment Main Aqueduct',
    type: 'Pipe Rupture & Silt Infiltration', 
    assetCategory: 'Water',
    severity: 'CRITICAL', 
    damageLevel: 'SEVERE',
    impact: 'Pressurized transmission pipe ruptured by rock dislodgement; cuts clean water supply to 45,000 Kathmandu residents.', 
    status: 'VERIFIED', 
    source: 'Kathmandu Upatyaka Khanepani Limited (KUKL)', 
    timestamp: '5 hours ago',
    confidenceScore: 94,
    lat: 27.7620,
    lng: 85.4250,
    aiAnalysis: {
      detectedDamage: '600mm ductile iron conduit split along seam over 4m length; turbid torrent entering municipal pipe.',
      confidence: 93,
      structuralIntegrity: 'COLLAPSED',
      hazardRisk: 'Contaminated water supply into urban reservoirs if valves not isolated.',
      evidenceNotes: [
        'Intake shutoff valve closed at 04:30 AM',
        'Welding teams mobilized on foot with generator equipment',
        'Repair duration estimated at 24-36 hours'
      ]
    },
    humanReview: {
      status: 'CONFIRMED',
      reviewedBy: 'Senior Engineer S. Shakya (KUKL)',
      reviewedAt: 'Today, 06:00 AM',
      notes: 'Isolation valves verified closed. Emergency water tanker distribution mobilized for affected wards.'
    }
  }
];

export const MOCK_RECOVERY_PRIORITIES: RecoveryPriority[] = [
  {
    id: 'recov-1',
    assetName: 'Melamchi Motor Bridge & Bailey Bridge Erection',
    assetType: 'Bridge',
    location: 'Melamchi Bazaar, Sindhupalchok',
    locationId: 'loc-2',
    priorityRank: 1,
    affectedPopulation: 6500,
    dependencyScore: 98,
    urgency: 'CRITICAL',
    accessibility: 'Impassable / Severed',
    strategicImportance: 'Sole vehicular link connecting upper Helambu communities, relief supplies, and sub-health medical evacuations.',
    estimatedCostNPR: 'NPR 42,000,000',
    status: 'CREW_DISPATCHED'
  },
  {
    id: 'recov-2',
    assetName: 'Sundarijal Water Treatment Transmission Main',
    assetType: 'Water',
    location: 'Sundarijal Aqueduct Corridor, Kathmandu',
    locationId: 'loc-1',
    priorityRank: 1,
    affectedPopulation: 45000,
    dependencyScore: 95,
    urgency: 'CRITICAL',
    accessibility: 'Single Lane / Caution',
    strategicImportance: 'Primary potable water pipeline for eastern Kathmandu; failure risks mass waterborne disease outbreak within 36 hours.',
    estimatedCostNPR: 'NPR 18,500,000',
    status: 'PLANNING'
  },
  {
    id: 'recov-3',
    assetName: 'Prithvi Highway Km 45 (Charkilo Debris Clearance)',
    assetType: 'Road',
    location: 'Charkilo, Chitwan',
    locationId: 'loc-5',
    priorityRank: 2,
    affectedPopulation: 120000,
    dependencyScore: 92,
    urgency: 'HIGH',
    accessibility: 'Single Lane / Caution',
    strategicImportance: 'National economic and humanitarian supply lifeline connecting capital to Terai food surplus and fuel depots.',
    estimatedCostNPR: 'NPR 8,200,000',
    status: 'CREW_DISPATCHED'
  },
  {
    id: 'recov-4',
    assetName: 'Balkhu 66kV Electrical Substation De-watering',
    assetType: 'Power',
    location: 'Balkhu, Kathmandu',
    locationId: 'loc-1',
    priorityRank: 2,
    affectedPopulation: 25000,
    dependencyScore: 88,
    urgency: 'HIGH',
    accessibility: 'Accessible',
    strategicImportance: 'Powers municipal drainage pump stations and central hospital auxiliary feeders.',
    estimatedCostNPR: 'NPR 5,500,000',
    status: 'PLANNING'
  },
  {
    id: 'recov-5',
    assetName: 'Sindhupalchok Primary Sub-Health Post Reconstruction',
    assetType: 'Hospital',
    location: 'Helambu Road, Sindhupalchok',
    locationId: 'loc-2',
    priorityRank: 3,
    affectedPopulation: 3200,
    dependencyScore: 82,
    urgency: 'MEDIUM',
    accessibility: 'Single Lane / Caution',
    strategicImportance: 'Local maternal, neonatal, and primary care clinic; temporary tent clinic currently stabilizing caseload.',
    estimatedCostNPR: 'NPR 14,000,000',
    status: 'ASSESSED'
  }
];

export const MOCK_FUNDINGS: Funding[] = [
  {
    id: 'fnd-1',
    source: "Prime Minister's Disaster Relief Fund (PMDRF Nepal)",
    amount: 150000000,
    distributed: 62000000,
    verified: true,
    date: '2026-09-12',
    totalPledgedNPR: 200000000,
    totalReceivedNPR: 150000000,
    remainingNPR: 88000000,
    verificationStatus: 'VERIFIED_OFFICIAL',
    designatedUse: 'Immediate cash grants to displaced families, emergency road clearing, and Bailey bridge deployment.',
    transparencyUrl: 'https://pmrelief.gov.np'
  },
  {
    id: 'fnd-2',
    source: 'Nepal Red Cross Society (NRCS Emergency Appeal)',
    amount: 35000000,
    distributed: 21500000,
    verified: true,
    date: '2026-09-11',
    totalPledgedNPR: 40000000,
    totalReceivedNPR: 35000000,
    remainingNPR: 13500000,
    verificationStatus: 'AUDITED',
    designatedUse: 'Tarpaulins, emergency water filtration units, blankets, and volunteer field stipends.',
    transparencyUrl: 'https://nrcs.org/emergency-fund'
  },
  {
    id: 'fnd-3',
    source: 'UN OCHA Central Emergency Response Fund (CERF)',
    amount: 85000000,
    distributed: 30000000,
    verified: true,
    date: '2026-09-10',
    totalPledgedNPR: 100000000,
    totalReceivedNPR: 85000000,
    remainingNPR: 55000000,
    verificationStatus: 'VERIFIED_OFFICIAL',
    designatedUse: 'WASH cluster sanitation, trauma medicine supplies, and emergency helicopter reconnaissance.',
    transparencyUrl: 'https://cerf.un.org'
  },
  {
    id: 'fnd-4',
    source: 'Bagmati Provincial Disaster Emergency Allocation',
    amount: 25000000,
    distributed: 18000000,
    verified: true,
    date: '2026-09-11',
    totalPledgedNPR: 25000000,
    totalReceivedNPR: 25000000,
    remainingNPR: 7000000,
    verificationStatus: 'AUDITED',
    designatedUse: 'District administration emergency response funds for Sindhupalchok and Chitwan.',
    transparencyUrl: 'https://bagmati.gov.np/disaster'
  }
];

export const MOCK_AI_PRIORITIES: AIPriorityItem[] = [
  {
    id: 'aip-1',
    rank: 1,
    rankTier: 'CRITICAL',
    title: 'Melamchi Bridge Collapse & Helambu Valley Medical Isolation',
    locationId: 'loc-2',
    locationName: 'Melamchi, Sindhupalchok',
    problem: 'Debris flood swept away main motor bridge; cuts off 500+ households. Nearest hospital (Bir/Dhulikhel) is 3+ hours away over compromised roads, local sub-health post has wall collapse, and 34-year-old missing resident Aarav Thapa was reported near riverbank.',
    severity: 'CRITICAL',
    urgency: 'IMMEDIATE',
    affectedPeople: 4200,
    confidence: 96,
    whyIsThisRank: 'Flood risk continues to escalate, 4,200 people face physical isolation, local health clinic is structurally unsafe, free bed capacity in adjacent regional hospitals is tightening above 85%, and primary evacuation corridor is severed.',
    recommendedAction: '1) Dispatch Army engineering battalion for Bailey bridge erection. 2) Deploy Team Echo for VHF radio repeater on ridge. 3) Pre-position 200 trauma kits via 4WD convoy. 4) Expedite officer verification for missing Aarav Thapa.',
    dataSources: ['DHM River Gauges', 'Nepal Army Drone Recon', 'MoHP Free Health Portal', 'Rescue Registry (OPMCM)'],
    status: 'ACTIVE_RECOMMENDATION'
  },
  {
    id: 'aip-2',
    rank: 2,
    rankTier: 'HIGH',
    title: 'Prithvi Highway Km 45 Blockade & Hospital Fuel Shortage Risk',
    locationId: 'loc-5',
    locationName: 'Chitwan / Narayangarh Corridor',
    problem: 'Major landslide at Charkilo completely severed Prithvi Highway. Chitwan Medical College generator diesel reserve down to 34 hours of continuous backup operation while electrical substations undergo storm repairs.',
    severity: 'HIGH',
    urgency: 'IMMEDIATE',
    affectedPeople: 2800,
    confidence: 91,
    whyIsThisRank: 'Chitwan Medical College is treating regional surge casualties. Landslide isolates the capital from Terai supply corridor. Without re-routing fuel, hospital ICUs face blackout risk.',
    recommendedAction: '1) Authorize emergency fuel convoy via Tribhuvan Highway bypass. 2) Expedite excavator rock removal at Km 45. 3) Verify hospital bed availability in Bharatpur district.',
    dataSources: ['District Traffic Police', 'MoHP Hospital Occupancy', 'Logistics HSA Fuel Stocks'],
    status: 'ACTIVE_RECOMMENDATION'
  },
  {
    id: 'aip-3',
    rank: 3,
    rankTier: 'HIGH',
    title: 'Sundarijal Water Aqueduct Rupture & Urban Contamination Threat',
    locationId: 'loc-1',
    locationName: 'Kathmandu Valley (Eastern Wards)',
    problem: 'Main 600mm drinking water aqueduct ruptured by boulder strike. 45,000 residents lose piped tap supply; high risk of secondary waterborne illness within 48 hours as floodwaters contaminate local shallow wells.',
    severity: 'HIGH',
    urgency: 'HIGH',
    affectedPeople: 45000,
    confidence: 89,
    whyIsThisRank: 'High population exposure in urban valley setting. While physical life threat is lower than active floods, delay in clean water distribution will cause severe hospital outpatient surge from diarrheal diseases.',
    recommendedAction: '1) Dispatch KUKL pipe welding team with Army escort. 2) Release 30,000 water purification chlorine tabs to municipal ward centers. 3) Deploy 15 water bowser trucks to Balkhu and Kuleshwor shelters.',
    dataSources: ['KUKL Engineering', 'WASH Cluster Reports', 'Kathmandu Metropolitan City'],
    status: 'ACTIVE_RECOMMENDATION'
  },
  {
    id: 'aip-4',
    rank: 4,
    rankTier: 'MODERATE',
    title: 'Pokhara Sarangkot Trail Washout & Search for Dawa Sherpa',
    locationId: 'loc-3',
    locationName: 'Pokhara (Gandaki)',
    problem: 'Flash flood and mudslides washed out sections of Sarangkot trekking trail; 28-year-old registered guide Dawa Sherpa missing 12+ hours with lost GPS check-in.',
    severity: 'MODERATE',
    urgency: 'HIGH',
    affectedPeople: 50,
    confidence: 85,
    whyIsThisRank: 'Targeted single-case high vulnerability. Weather window in Gandaki is opening, making immediate aerial drone search highly viable before next cloudburst.',
    recommendedAction: '1) Authorize Team Charlie alpine recon with thermal drone sweep. 2) Cross-reference sighting reports at Lakeside transit shelter. 3) Issue caution notice to all Annapurna trail operators.',
    dataSources: ['Pokhara Trekking Association', 'Trek Union Dispatch', 'District Police Gandaki'],
    status: 'ACTIVE_RECOMMENDATION'
  }
];

export const MOCK_NOTIFICATIONS: AppNotification[] = [
  { 
    id: 'notif-1', 
    title: 'Severe Flash Flood Warning (Code Red)', 
    desc: 'DHM Nepal: Melamchi and Indrawati rivers crossed danger mark (6.8m). Immediate river corridor evacuation ordered.', 
    type: 'critical', 
    read: false, 
    timestamp: '10 mins ago',
    category: 'WEATHER',
    actionUrl: '/weather-risk'
  },
  { 
    id: 'notif-2', 
    title: 'Bridge Structural Failure: Melamchi', 
    desc: 'Main motor bridge span swept away by debris torrent. Helambu road corridor completely severed.', 
    type: 'critical', 
    read: false, 
    timestamp: '25 mins ago',
    category: 'BRIDGE',
    actionUrl: '/routes'
  },
  { 
    id: 'notif-3', 
    title: 'Hospital Capacity Alert (Bir Hospital)', 
    desc: 'MoHP Real Source: Bir Hospital free emergency beds at 96% occupancy (20 available). Triage redirect recommended.', 
    type: 'warning', 
    read: false, 
    timestamp: '45 mins ago',
    category: 'HOSPITAL',
    actionUrl: '/facilities'
  },
  { 
    id: 'notif-4', 
    title: 'Potential Sighting Match Identified (82%)', 
    desc: 'Candidate Match: Sighting S-1 at Melamchi Relief Center correlated to missing person Aarav Thapa. Officer review required.', 
    type: 'warning', 
    read: false, 
    timestamp: '1 hour ago',
    category: 'MISSING_PERSON',
    actionUrl: '/news-safety'
  },
  { 
    id: 'notif-5', 
    title: 'Relief Shortage Prediction: Medicine in 18h', 
    desc: 'Assessment engine predicts emergency trauma kits & insulin will deplete in Sindhupalchok within 18 hours. Advance prepositioning needed.', 
    type: 'warning', 
    read: true, 
    timestamp: '2 hours ago',
    category: 'LOGISTICS',
    actionUrl: '/logistics'
  },
  { 
    id: 'notif-6', 
    title: 'Highway Closure: Prithvi Highway Km 45', 
    desc: 'Major landslide at Charkilo blocks both lanes. Alternative route via Tribhuvan Highway (Hetauda) active.', 
    type: 'warning', 
    read: true, 
    timestamp: '3 hours ago',
    category: 'ROAD',
    actionUrl: '/routes'
  },
  { 
    id: 'notif-7', 
    title: 'Misinformation Debunked: Airport Operational', 
    desc: 'Verified False: Viral claims of Kathmandu Airport runway flooding refuted with CAAN official confirmation.', 
    type: 'info', 
    read: true, 
    timestamp: '4 hours ago',
    category: 'MISINFO',
    actionUrl: '/news-safety'
  }
];

import { ClaimAnalysis } from '../types';

export const MOCK_CLAIM_ANALYSES: ClaimAnalysis[] = [
  {
    id: 'ca-1',
    originalText: "NASA predicted an 8.5 magnitude mega-earthquake will hit Kathmandu, Nepal tonight at 2:00 AM. Sleep outside!",
    extractedClaims: [
      "NASA predicted an 8.5 magnitude earthquake.",
      "The earthquake will specifically strike Kathmandu tonight at 2:00 AM.",
      "Citizens must urgently evacuate and sleep in open fields."
    ],
    sources: [
      {
        id: 'src-1',
        name: 'National Earthquake Monitoring and Research Centre (NEMRC Nepal)',
        publisher: 'Department of Mines and Geology (DMG)',
        publishedAt: '2026-09-15T08:00:00Z',
        retrievedAt: '2026-09-15T08:15:00Z',
        sourceType: 'OFFICIAL EMERGENCY AGENCY',
        reliabilityLevel: 'HIGH',
        contentSummary: 'Scientific consensus confirms earthquakes cannot be predicted by exact hour, date, or precise magnitude anywhere in the world. NEMRC urges public to disregard fabricated audio warnings.',
        relatedClaim: 'Earthquake time and magnitude prediction.',
        relationship: 'CONTRADICTING'
      },
      {
        id: 'src-2',
        name: 'Nepal Fact Check',
        publisher: 'nepalfactcheck.org',
        publishedAt: '2026-09-15T09:30:00Z',
        retrievedAt: '2026-09-15T09:45:00Z',
        sourceType: 'RECOGNIZED NEWS',
        reliabilityLevel: 'HIGH',
        contentSummary: 'Investigation into viral audio clips spreading across TikTok and WhatsApp confirmed the claims were a recurring copycat hoax with zero scientific affiliation to NASA or USGS.',
        relatedClaim: 'NASA warning audio message.',
        relationship: 'CONTRADICTING'
      }
    ],
    verdict: 'LIKELY FALSE',
    confidence: 99,
    explanation: 'Global seismological authorities (NEMRC Nepal and USGS) confirm that earthquake prediction down to a specific time or hour is scientifically impossible. NASA does not forecast earthquakes or issue evacuation orders for sovereign states. The circulating viral audio note is a recurring hoax.',
    supportingEvidence: [
      'Anonymous voice notes forwarded on TikTok and WhatsApp.'
    ],
    contradictingEvidence: [
      'Official NEMRC statement refuting any possibility of date/time earthquake forecasts.',
      'USGS & NASA Earth Science verified policy stating they never issue localized earthquake alerts.'
    ],
    unknowns: [],
    recommendedAction: 'CORRECT_MISINFORMATION',
    humanReviewStatus: 'REVIEWED',
    createdAt: '2026-09-15T09:46:00Z',
    impactLevel: 'HIGH',
    spreadLevel: 'HIGH',
    responseRelevance: 'CRITICAL',
    debunkedBy: 'National Earthquake Monitoring Centre & Nepal Fact Check',
    factCheckUrl: 'https://nepalfactcheck.org',
    debunkDate: 'Verified Fact-Check',
    viralContext: 'Viral WhatsApp voice note claiming secret NASA disaster forecast',
    isRealDebunk: true,
    category: 'EARTHQUAKE'
  },
  {
    id: 'ca-2',
    originalText: "Emergency alert: The Koshi Barrage dam structure has collapsed under record floods. Immediate evacuation ordered for all downstream districts!",
    extractedClaims: [
      "The Koshi Barrage dam structure has broken and collapsed.",
      "Massive catastrophic dam-burst wave is currently inundating Terai districts.",
      "Emergency evacuation ordered due to structural collapse."
    ],
    sources: [
      {
        id: 'src-3',
        name: 'Sunsari District Administration Office (DAO)',
        publisher: 'Government of Nepal MoHA',
        publishedAt: '2026-09-16T14:00:00Z',
        retrievedAt: '2026-09-16T14:20:00Z',
        sourceType: 'OFFICIAL GOVERNMENT',
        reliabilityLevel: 'HIGH',
        contentSummary: 'All 56 sluice gates were systematically opened to safely discharge monsoon crest waters exceeding 450,000 cusecs. Barrage structure is completely sound and undamaged.',
        relatedClaim: 'Barrage collapse and dam burst.',
        relationship: 'CONTRADICTING'
      },
      {
        id: 'src-4',
        name: 'Nepal Fact Check',
        publisher: 'nepalfactcheck.org',
        publishedAt: '2026-09-16T15:00:00Z',
        retrievedAt: '2026-09-16T15:15:00Z',
        sourceType: 'RECOGNIZED NEWS',
        reliabilityLevel: 'HIGH',
        contentSummary: 'Fact check proved viral claims conflated opening of floodgates with a dam rupture. On-site inspection by water resources engineers confirmed zero structural damage.',
        relatedClaim: 'Dam breach rumor.',
        relationship: 'CONTRADICTING'
      }
    ],
    verdict: 'MISLEADING',
    confidence: 96,
    explanation: 'While river water discharge was genuinely high (over 450,000 cusecs) prompting engineers to open all 56 gates as standard operating procedure to release hydraulic pressure safely, the physical concrete barrage suffered no collapse or breach. The panic-inducing claims of a dam break are fabricated.',
    supportingEvidence: [
      'Photos of roaring floodwaters passing through open sluice gates with false captions.'
    ],
    contradictingEvidence: [
      'Chief District Officer (CDO) of Sunsari official bulletin verifying structural integrity.',
      'Department of Water Resources on-site engineering team verified all 56 gates operational.'
    ],
    unknowns: [],
    recommendedAction: 'CORRECT_MISINFORMATION',
    humanReviewStatus: 'REVIEWED',
    createdAt: '2026-09-16T15:20:00Z',
    impactLevel: 'HIGH',
    spreadLevel: 'HIGH',
    responseRelevance: 'CRITICAL',
    debunkedBy: 'Sunsari DAO & Nepal Fact Check',
    factCheckUrl: 'https://nepalfactcheck.org',
    debunkDate: 'Verified Fact-Check',
    viralContext: 'Photos of open barrage gates posted with sensationalist claim of dam break',
    isRealDebunk: true,
    category: 'FLOOD'
  },
  {
    id: 'ca-3',
    originalText: "Tribhuvan International Airport (TIA) runway is submerged under 4 feet of river water. All domestic and international flights canceled indefinitely!!",
    extractedClaims: [
      "Kathmandu TIA runway is flooded under 4 feet of water.",
      "All international and domestic flights are canceled indefinitely."
    ],
    sources: [
      {
        id: 'src-5',
        name: 'Civil Aviation Authority of Nepal (CAAN)',
        publisher: 'CAAN Flight Operations Directorate',
        publishedAt: '2026-09-17T11:00:00Z',
        retrievedAt: '2026-09-17T11:15:00Z',
        sourceType: 'OFFICIAL GOVERNMENT',
        reliabilityLevel: 'HIGH',
        contentSummary: 'Runway is dry and fully functional. Flight schedules experienced minor weather-holding patterns due to cloud base visibility, but airport tarmac never experienced inundation.',
        relatedClaim: 'Runway submerged under water.',
        relationship: 'CONTRADICTING'
      },
      {
        id: 'src-6',
        name: 'South Asia Check',
        publisher: 'southasiacheck.org',
        publishedAt: '2026-09-17T12:00:00Z',
        retrievedAt: '2026-09-17T12:15:00Z',
        sourceType: 'RECOGNIZED NEWS',
        reliabilityLevel: 'HIGH',
        contentSummary: 'Reverse image and video frame analysis confirmed the viral video showing submerged aircraft was recorded at Chennai Airport in India during the 2015 floods, not Nepal.',
        relatedClaim: 'Video evidence of flooded TIA runway.',
        relationship: 'CONTRADICTING'
      }
    ],
    verdict: 'LIKELY FALSE',
    confidence: 98,
    explanation: 'Civil Aviation Authority of Nepal confirmed TIA runway 02/20 was completely clear and operational. Investigation by South Asia Check proved the viral video was recycled archive footage of the 2015 Chennai Airport flooding in India.',
    supportingEvidence: [
      'Recycled video showing submerged planes circulated with Nepali audio overlay.'
    ],
    contradictingEvidence: [
      'CAAN live operations log confirming uninterrupted international flight departures.',
      'Video forensic analysis identifying Chennai Airport livery from December 2015.'
    ],
    unknowns: [],
    recommendedAction: 'DO_NOT_AMPLIFY',
    humanReviewStatus: 'REVIEWED',
    createdAt: '2026-09-17T12:20:00Z',
    impactLevel: 'HIGH',
    spreadLevel: 'HIGH',
    responseRelevance: 'RELEVANT',
    debunkedBy: 'CAAN & South Asia Check',
    factCheckUrl: 'https://southasiacheck.org',
    debunkDate: 'Verified Fact-Check',
    viralContext: '2015 Chennai airport flood video passed off as Kathmandu TIA airport',
    isRealDebunk: true,
    category: 'AVIATION'
  },
  {
    id: 'ca-4',
    originalText: "Emergency blood shortage at Central Red Cross Blood Bank: Call 98XXXXXXXX immediately to donate or send money for victims.",
    extractedClaims: [
      "Central Red Cross has totally exhausted emergency blood units for disaster patients.",
      "Citizens should call private mobile number 98XXXXXXXX for blood and donations."
    ],
    sources: [
      {
        id: 'src-7',
        name: 'Nepal Red Cross Society (NRCS) Central Blood Transfusion Service',
        publisher: 'NRCS Blood Transfusion Centre Exhibition Road',
        publishedAt: '2026-09-17T16:00:00Z',
        retrievedAt: '2026-09-17T16:20:00Z',
        sourceType: 'OFFICIAL EMERGENCY AGENCY',
        reliabilityLevel: 'HIGH',
        contentSummary: 'Blood stocks for trauma and disaster surgery are stable across all major blood types. NRCS warns public that private personal numbers circulating in forwards are phishing scams.',
        relatedClaim: 'Blood exhaustion and private phone contact.',
        relationship: 'CONTRADICTING'
      },
      {
        id: 'src-8',
        name: 'Nepal Police Cyber Bureau',
        publisher: 'Nepal Police Headquarters',
        publishedAt: '2026-09-17T17:00:00Z',
        retrievedAt: '2026-09-17T17:15:00Z',
        sourceType: 'OFFICIAL GOVERNMENT',
        reliabilityLevel: 'HIGH',
        contentSummary: 'Advisory alerting citizens against unauthorized mobile wallet requests disguised as disaster blood and victim relief funds.',
        relatedClaim: 'Private mobile donation requests.',
        relationship: 'CONTRADICTING'
      }
    ],
    verdict: 'LIKELY FALSE',
    confidence: 97,
    explanation: 'The Nepal Red Cross Society Central Blood Transfusion Service confirmed adequate blood reserves are maintained for emergency relief. The private mobile numbers circulated are unverified numbers or phishing scams aimed at exploiting public goodwill.',
    supportingEvidence: [
      'Copy-paste text message spreading on WhatsApp groups asking to call private mobile lines.'
    ],
    contradictingEvidence: [
      'Official NRCS Central Blood Transfusion Service release confirming stable inventory.',
      'Nepal Police Cyber Bureau advisory warning against fraudulent disaster donation numbers.'
    ],
    unknowns: [],
    recommendedAction: 'DO_NOT_AMPLIFY',
    humanReviewStatus: 'REVIEWED',
    createdAt: '2026-09-17T17:25:00Z',
    impactLevel: 'MEDIUM',
    spreadLevel: 'HIGH',
    responseRelevance: 'CRITICAL',
    debunkedBy: 'Nepal Red Cross CBTS & Cyber Bureau',
    factCheckUrl: 'https://nrcs.org',
    debunkDate: 'Verified Fact-Check',
    viralContext: 'Phishing chain message urging calls to private cell phone numbers for blood',
    isRealDebunk: true,
    category: 'MEDICAL_RELIEF'
  },
  {
    id: 'ca-5',
    originalText: "Melamchi drinking water tunnel burst open inside Shivapuri, impending flash tsunami heading towards Sundarijal and Bouddha!",
    extractedClaims: [
      "Melamchi 27km water supply tunnel has ruptured.",
      "Imminent flash flood tsunami approaching Sundarijal and Bouddha."
    ],
    sources: [
      {
        id: 'src-9',
        name: 'Melamchi Water Supply Development Board',
        publisher: 'Ministry of Water Supply',
        publishedAt: '2026-09-18T10:00:00Z',
        retrievedAt: '2026-09-18T10:20:00Z',
        sourceType: 'OFFICIAL GOVERNMENT',
        reliabilityLevel: 'HIGH',
        contentSummary: 'Intake gates at Ambathan were safely shut down and flushed as standard procedure during heavy sediment monsoon flows. The underground tunnel is completely safe with zero structural breach.',
        relatedClaim: 'Tunnel burst and flash tsunami.',
        relationship: 'CONTRADICTING'
      },
      {
        id: 'src-10',
        name: 'Nepal Fact Check',
        publisher: 'nepalfactcheck.org',
        publishedAt: '2026-09-18T11:00:00Z',
        retrievedAt: '2026-09-18T11:20:00Z',
        sourceType: 'RECOGNIZED NEWS',
        reliabilityLevel: 'HIGH',
        contentSummary: 'Photos of routine sediment-flushing channel release at the intake were circulated with false rumors claiming the tunnel had exploded.',
        relatedClaim: 'Tunnel explosion rumor.',
        relationship: 'CONTRADICTING'
      }
    ],
    verdict: 'MISLEADING',
    confidence: 96,
    explanation: 'The Melamchi Water Supply Development Board routinely closes intake gates during heavy monsoon rains to protect the water treatment facility from silt and boulders. Normal water release during sediment flushing was misrepresented as a catastrophic tunnel burst.',
    supportingEvidence: [
      'Photos of planned intake water discharge shared with panic-inducing captions.'
    ],
    contradictingEvidence: [
      'Melamchi Board official confirmation of planned intake maintenance.',
      'Sundarijal reservoir water level sensors confirmed normal seasonal discharge.'
    ],
    unknowns: [],
    recommendedAction: 'CORRECT_MISINFORMATION',
    humanReviewStatus: 'REVIEWED',
    createdAt: '2026-09-18T11:30:00Z',
    impactLevel: 'HIGH',
    spreadLevel: 'MEDIUM',
    responseRelevance: 'RELEVANT',
    debunkedBy: 'Melamchi Water Board & Nepal Fact Check',
    factCheckUrl: 'https://nepalfactcheck.org',
    debunkDate: 'Verified Fact-Check',
    viralContext: 'Photos of routine gate sediment flushing spread as a tunnel explosion',
    isRealDebunk: true,
    category: 'INFRASTRUCTURE'
  },
  {
    id: 'ca-6',
    originalText: "Nepal Army helicopters will spray chemical anti-disaster disinfectant over Kathmandu Valley tonight at 11:30 PM. Keep all windows shut!",
    extractedClaims: [
      "Nepal Army helicopters will spray chemical disinfectant over Kathmandu.",
      "The aerial spraying will happen tonight at 11:30 PM.",
      "Citizens must shut all windows to avoid toxic chemical exposure."
    ],
    sources: [
      {
        id: 'src-11',
        name: 'Nepal Army Public Relations Directorate',
        publisher: 'Nepali Army Headquarters',
        publishedAt: '2026-09-18T14:00:00Z',
        retrievedAt: '2026-09-18T14:15:00Z',
        sourceType: 'OFFICIAL GOVERNMENT',
        reliabilityLevel: 'HIGH',
        contentSummary: 'Nepal Army helicopters are deployed exclusively for search, rescue, and delivering food rations. No aerial spraying operations were planned or conducted.',
        relatedClaim: 'Helicopter chemical disinfectant spraying.',
        relationship: 'CONTRADICTING'
      },
      {
        id: 'src-12',
        name: 'South Asia Check',
        publisher: 'southasiacheck.org',
        publishedAt: '2026-09-18T14:45:00Z',
        retrievedAt: '2026-09-18T15:00:00Z',
        sourceType: 'RECOGNIZED NEWS',
        reliabilityLevel: 'HIGH',
        contentSummary: 'This is a translation of a notorious hoax that previously circulated in India, the Philippines, and Latin America, falsely attributed to local military helicopters.',
        relatedClaim: 'Nocturnal chemical spraying alert.',
        relationship: 'CONTRADICTING'
      }
    ],
    verdict: 'LIKELY FALSE',
    confidence: 99,
    explanation: 'The Ministry of Health and Population and the Nepal Army confirmed that no aerial disinfectant spraying takes place. The rumor is a recycled global hoax translated into Nepali and spread through community messaging apps.',
    supportingEvidence: [
      'Chain message forwarded on Facebook Messenger and WhatsApp.'
    ],
    contradictingEvidence: [
      'Nepal Army official denial confirming helicopters only carry search-and-rescue gear and rations.',
      'MoHP statement confirming aerial disinfectant spraying is hazardous and prohibited.'
    ],
    unknowns: [],
    recommendedAction: 'DO_NOT_AMPLIFY',
    humanReviewStatus: 'REVIEWED',
    createdAt: '2026-09-18T15:05:00Z',
    impactLevel: 'HIGH',
    spreadLevel: 'HIGH',
    responseRelevance: 'RELEVANT',
    debunkedBy: 'Nepal Army & South Asia Check',
    factCheckUrl: 'https://southasiacheck.org',
    debunkDate: 'Verified Fact-Check',
    viralContext: 'Global recycled hoax claiming nighttime military chemical spraying',
    isRealDebunk: true,
    category: 'GENERAL'
  }
];


import { NEPAL_REAL_ROAD_GEOMETRIES } from './nepalRoadGeometries';

// --- ROUTING MOCK DATA ---
export const MOCK_ROADS: any[] = [
  {
    id: 'rd-1',
    name: 'Tribhuvan Highway (KTM - Naubise)',
    startLocation: 'Kathmandu',
    endLocation: 'Naubise',
    geometry: NEPAL_REAL_ROAD_GEOMETRIES.ktm_naubise?.geometry || [
      { lat: 27.7175, lng: 85.3241 },
      { lat: 27.7253, lng: 85.3055 },
      { lat: 27.7181, lng: 85.2840 },
      { lat: 27.7166, lng: 85.2710 },
      { lat: 27.7216, lng: 85.2508 },
      { lat: 27.7408, lng: 85.2279 },
      { lat: 27.7348, lng: 85.1764 },
      { lat: 27.7172, lng: 85.1240 }
    ],
    status: 'OPEN',
    condition: 'GOOD - Clear road surface, all lanes operational',
    hazards: [],
    lastUpdated: new Date().toISOString(),
    source: 'Department of Roads Navigate',
    confidence: 95
  },
  {
    id: 'rd-2',
    name: 'Prithvi Highway (Naubise - Mugling)',
    startLocation: 'Naubise',
    endLocation: 'Mugling',
    geometry: NEPAL_REAL_ROAD_GEOMETRIES.naubise_mugling?.geometry || [
      { lat: 27.7172, lng: 85.1240 },
      { lat: 27.7500, lng: 84.9000 },
      { lat: 27.8184, lng: 84.5516 }
    ],
    status: 'OPEN',
    condition: 'GOOD - Normal transit conditions along Trishuli valley',
    hazards: [],
    lastUpdated: new Date().toISOString(),
    source: 'Highway Traffic Police',
    confidence: 92
  },
  {
    id: 'rd-3',
    name: 'Prithvi Highway (Mugling - Pokhara)',
    startLocation: 'Mugling',
    endLocation: 'Pokhara',
    geometry: NEPAL_REAL_ROAD_GEOMETRIES.mugling_pokhara?.geometry || [
      { lat: 27.8184, lng: 84.5516 },
      { lat: 28.0000, lng: 84.2000 },
      { lat: 28.2096, lng: 83.9856 }
    ],
    status: 'OPEN',
    condition: 'GOOD - Clear 2-lane asphalt highway',
    hazards: [],
    lastUpdated: new Date().toISOString(),
    source: 'Department of Roads',
    confidence: 90
  },
  {
    id: 'rd-4',
    name: 'Madan Ashrit Hwy (Mugling - Narayanghat)',
    startLocation: 'Mugling',
    endLocation: 'Narayanghat',
    geometry: NEPAL_REAL_ROAD_GEOMETRIES.mugling_narayanghat?.geometry || [
      { lat: 27.8184, lng: 84.5516 },
      { lat: 27.7500, lng: 84.5000 },
      { lat: 27.7001, lng: 84.4285 }
    ],
    status: 'OPEN',
    condition: 'GOOD - Operational road corridor',
    hazards: [],
    lastUpdated: new Date().toISOString(),
    source: 'Department of Roads',
    confidence: 92
  },
  {
    id: 'rd-5',
    name: 'Tribhuvan Highway (KTM - Hetauda via Daman)',
    startLocation: 'Kathmandu',
    endLocation: 'Hetauda',
    geometry: NEPAL_REAL_ROAD_GEOMETRIES.tribhuvan_ktm_hetauda?.geometry || [
      { lat: 27.7172, lng: 85.3240 },
      { lat: 27.6000, lng: 85.2000 },
      { lat: 27.4285, lng: 85.0326 }
    ],
    status: 'OPEN',
    condition: 'GOOD - Clear hill route',
    hazards: [],
    lastUpdated: new Date().toISOString(),
    source: 'Traffic Police Directorate',
    confidence: 88
  },
  {
    id: 'rd-6',
    name: 'East-West Hwy (Hetauda - Narayanghat)',
    startLocation: 'Hetauda',
    endLocation: 'Narayanghat',
    geometry: NEPAL_REAL_ROAD_GEOMETRIES.hetauda_narayanghat?.geometry || [
      { lat: 27.4285, lng: 85.0326 },
      { lat: 27.5000, lng: 84.7000 },
      { lat: 27.7001, lng: 84.4285 }
    ],
    status: 'OPEN',
    condition: 'GOOD - Wide 4-lane Asian Highway section',
    hazards: [],
    lastUpdated: new Date().toISOString(),
    source: 'Department of Roads',
    confidence: 94
  },
  {
    id: 'rd-7',
    name: 'BP Highway (Kathmandu - Sindhuli - Bardibas)',
    startLocation: 'Kathmandu',
    endLocation: 'Bardibas',
    geometry: NEPAL_REAL_ROAD_GEOMETRIES.bp_ktm_bardibas?.geometry || [
      { lat: 27.7172, lng: 85.3240 },
      { lat: 27.2000, lng: 85.9000 },
      { lat: 26.9800, lng: 85.9000 }
    ],
    status: 'OPEN',
    condition: 'GOOD - Japan grant engineered winding road',
    hazards: [],
    lastUpdated: new Date().toISOString(),
    source: 'Department of Roads',
    confidence: 90
  },
  {
    id: 'rd-8',
    name: 'East-West Mahendra Hwy (Bardibas - Biratnagar via Koshi)',
    startLocation: 'Bardibas',
    endLocation: 'Biratnagar',
    geometry: NEPAL_REAL_ROAD_GEOMETRIES.mahendra_bardibas_biratnagar?.geometry || [
      { lat: 26.9800, lng: 85.9000 },
      { lat: 26.5222, lng: 86.9217 },
      { lat: 26.4525, lng: 87.2718 }
    ],
    status: 'OPEN',
    condition: 'GOOD - Flat Terai corridor',
    hazards: [],
    lastUpdated: new Date().toISOString(),
    source: 'Highway Traffic Directorate',
    confidence: 92
  },
  {
    id: 'rd-9',
    name: 'East-West Hwy (Hetauda - Bardibas)',
    startLocation: 'Hetauda',
    endLocation: 'Bardibas',
    geometry: NEPAL_REAL_ROAD_GEOMETRIES.mahendra_hetauda_bardibas?.geometry || [
      { lat: 27.4285, lng: 85.0326 },
      { lat: 27.0500, lng: 85.4000 },
      { lat: 26.9800, lng: 85.9000 }
    ],
    status: 'OPEN',
    condition: 'GOOD - Clear highway',
    hazards: [],
    lastUpdated: new Date().toISOString(),
    source: 'Department of Roads',
    confidence: 90
  },
  {
    id: 'rd-10',
    name: 'Araniko Highway (Kathmandu - Sindhupalchok)',
    startLocation: 'Kathmandu',
    endLocation: 'Sindhupalchok',
    geometry: NEPAL_REAL_ROAD_GEOMETRIES.araniko_ktm_sindhupalchok?.geometry || [
      { lat: 27.7172, lng: 85.3240 },
      { lat: 27.7700, lng: 85.5300 },
      { lat: 27.9500, lng: 85.6800 }
    ],
    status: 'RESTRICTED',
    condition: 'Caution: Debris flow risk and single-lane passage near Melamchi',
    hazards: ['Debris Flow', 'Rockfall Warning'],
    lastUpdated: new Date().toISOString(),
    source: 'District Traffic Police / Citizen Reports',
    confidence: 85,
    reportsConflict: true
  },
  {
    id: 'rd-11',
    name: 'Galchhi - Nuwakot - Gorkha Safe Bypass Corridor',
    startLocation: 'Kathmandu',
    endLocation: 'Pokhara',
    geometry: NEPAL_REAL_ROAD_GEOMETRIES.bypass_nuwakot_gorkha?.geometry || [],
    status: 'OPEN',
    condition: 'GOOD - Verified emergency bypass avoiding landslide prone river sectors',
    hazards: [],
    lastUpdated: new Date().toISOString(),
    source: 'Armed Police Force / DOR Bypass Division',
    confidence: 94
  },
  {
    id: 'rd-12',
    name: 'Siddhartha Highway (Pokhara - Butwal)',
    startLocation: 'Pokhara',
    endLocation: 'Butwal',
    geometry: NEPAL_REAL_ROAD_GEOMETRIES.siddhartha_pkr_butwal?.geometry || [],
    status: 'OPEN',
    condition: 'GOOD - Open for all traffic',
    hazards: [],
    lastUpdated: new Date().toISOString(),
    source: 'District Traffic Police',
    confidence: 91
  }
];

export const MOCK_BRIDGES: any[] = [
  {
    id: 'br-1',
    name: 'Trishuli Bridge (Mugling Junction)',
    location: { lat: 27.8184, lng: 84.5516 },
    roadId: 'rd-2',
    status: 'OPEN',
    threatLevel: 'LOW',
    river: 'Trishuli River',
    condition: 'Normal structural clearance, water level below caution gauge',
    hazards: [],
    lastUpdated: new Date().toISOString(),
    source: 'Department of Roads Bridge Directorate',
    confidence: 95
  },
  {
    id: 'br-2',
    name: 'Narayani River Bridge (Bharatpur)',
    location: { lat: 27.7001, lng: 84.4285 },
    roadId: 'rd-4',
    status: 'OPEN',
    threatLevel: 'LOW',
    river: 'Narayani River',
    condition: 'Operational multi-span steel bridge with clear drainage',
    hazards: [],
    lastUpdated: new Date().toISOString(),
    source: 'Department of Roads',
    confidence: 95
  },
  {
    id: 'br-3',
    name: 'Koshi Barrage Bridge',
    location: { lat: 26.5222, lng: 86.9217 },
    roadId: 'rd-8',
    status: 'RESTRICTED',
    threatLevel: 'ELEVATED',
    river: 'Saptakoshi River',
    condition: 'Restricted: High river discharge (315,000 cusecs). 10-ton axle limit enforced',
    hazards: ['High Discharge Warning', 'Single Lane Heavy Transit'],
    lastUpdated: new Date().toISOString(),
    source: 'Department of Hydrology and Meteorology / Armed Police',
    confidence: 95
  },
  {
    id: 'br-4',
    name: 'Malekhu Trishuli Bridge',
    location: { lat: 27.8115, lng: 84.8250 },
    roadId: 'rd-2',
    status: 'OPEN',
    threatLevel: 'LOW',
    river: 'Malekhu Khola / Trishuli',
    condition: 'All lanes open with secure abutments',
    hazards: [],
    lastUpdated: new Date().toISOString(),
    source: 'Traffic Police Malekhu',
    confidence: 90
  },
  {
    id: 'br-5',
    name: 'Seti River Gorge Bridge (Pokhara)',
    location: { lat: 28.2160, lng: 83.9890 },
    roadId: 'rd-3',
    status: 'OPEN',
    threatLevel: 'LOW',
    river: 'Seti River',
    condition: 'Completely normal structural condition',
    hazards: [],
    lastUpdated: new Date().toISOString(),
    source: 'Pokhara Infrastructure Division',
    confidence: 96
  },
  {
    id: 'br-6',
    name: 'Devghat Trishuli Suspension Bridge',
    location: { lat: 27.7200, lng: 84.4250 },
    roadId: 'rd-4',
    status: 'RESTRICTED',
    threatLevel: 'HIGH',
    river: 'Trishuli / Kali Gandaki Confluence',
    condition: 'Restricted & Risky: High scour risk near western pier. Light vehicles and pedestrians only',
    hazards: ['Pier Scour Hazard', 'Overload Restriction'],
    lastUpdated: new Date().toISOString(),
    source: 'Armed Police Force River Rescue Unit',
    confidence: 88
  },
  {
    id: 'br-7',
    name: 'Roshi Khola BP Bridge (Kavre/Sindhuli)',
    location: { lat: 27.5250, lng: 85.6500 },
    roadId: 'rd-7',
    status: 'OPEN',
    threatLevel: 'LOW',
    river: 'Roshi Khola',
    condition: 'Clear, reinforced approach roads open',
    hazards: [],
    lastUpdated: new Date().toISOString(),
    source: 'BP Highway Division Office',
    confidence: 92
  }
];

export const MOCK_ROAD_REPORTS: any[] = [];
