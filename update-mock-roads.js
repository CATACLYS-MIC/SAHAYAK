import fs from 'fs';
let file = 'src/data/mock.ts';
let data = fs.readFileSync(file, 'utf8');

if (!data.includes('export const MOCK_ROADS: any[] =')) {
  data += `

// --- ROUTING MOCK DATA ---
export const MOCK_ROADS: any[] = [
  {
    id: 'rd-1',
    name: 'Tribhuvan Highway (KTM - Naubise)',
    startLocation: 'Kathmandu',
    endLocation: 'Naubise',
    geometry: [{ lat: 27.7172, lng: 85.3240 }, { lat: 27.7150, lng: 85.2500 }, { lat: 27.7172, lng: 85.1240 }],
    status: 'OPEN',
    condition: 'GOOD',
    hazards: [],
    lastUpdated: new Date().toISOString(),
    source: 'Department of Roads',
    confidence: 95
  },
  {
    id: 'rd-2',
    name: 'Prithvi Highway (Naubise - Mugling)',
    startLocation: 'Naubise',
    endLocation: 'Mugling',
    geometry: [{ lat: 27.7172, lng: 85.1240 }, { lat: 27.7500, lng: 84.9000 }, { lat: 27.8184, lng: 84.5516 }],
    status: 'OPEN',
    condition: 'GOOD',
    hazards: [],
    lastUpdated: new Date().toISOString(),
    source: 'Traffic Police',
    confidence: 90
  },
  {
    id: 'rd-3',
    name: 'Prithvi Highway (Mugling - Pokhara)',
    startLocation: 'Mugling',
    endLocation: 'Pokhara',
    geometry: [{ lat: 27.8184, lng: 84.5516 }, { lat: 28.0000, lng: 84.2000 }, { lat: 28.2096, lng: 83.9856 }],
    status: 'OPEN',
    condition: 'GOOD',
    hazards: [],
    lastUpdated: new Date().toISOString(),
    source: 'Traffic Police',
    confidence: 90
  },
  {
    id: 'rd-4',
    name: 'Madan Ashrit Hwy (Mugling - Narayanghat)',
    startLocation: 'Mugling',
    endLocation: 'Narayanghat',
    geometry: [{ lat: 27.8184, lng: 84.5516 }, { lat: 27.7500, lng: 84.5000 }, { lat: 27.7001, lng: 84.4285 }],
    status: 'OPEN',
    condition: 'GOOD',
    hazards: [],
    lastUpdated: new Date().toISOString(),
    source: 'Department of Roads',
    confidence: 92
  },
  {
    id: 'rd-5',
    name: 'Kanti Highway (KTM - Hetauda)',
    startLocation: 'Kathmandu',
    endLocation: 'Hetauda',
    geometry: [{ lat: 27.7172, lng: 85.3240 }, { lat: 27.6000, lng: 85.2000 }, { lat: 27.4285, lng: 85.0326 }],
    status: 'OPEN',
    condition: 'GOOD',
    hazards: [],
    lastUpdated: new Date().toISOString(),
    source: 'Citizen Report',
    confidence: 70
  },
  {
    id: 'rd-6',
    name: 'East-West Hwy (Hetauda - Narayanghat)',
    startLocation: 'Hetauda',
    endLocation: 'Narayanghat',
    geometry: [{ lat: 27.4285, lng: 85.0326 }, { lat: 27.5000, lng: 84.7000 }, { lat: 27.7001, lng: 84.4285 }],
    status: 'OPEN',
    condition: 'GOOD',
    hazards: [],
    lastUpdated: new Date().toISOString(),
    source: 'Department of Roads',
    confidence: 90
  }
];

export const MOCK_BRIDGES: any[] = [
  {
    id: 'br-1',
    name: 'Trishuli Bridge (Mugling)',
    location: { lat: 27.8184, lng: 84.5516 },
    roadId: 'rd-2',
    status: 'OPEN',
    condition: 'GOOD',
    hazards: [],
    lastUpdated: new Date().toISOString(),
    source: 'Traffic Police',
    confidence: 95
  },
  {
    id: 'br-2',
    name: 'Narayani Bridge',
    location: { lat: 27.7001, lng: 84.4285 },
    roadId: 'rd-4',
    status: 'OPEN',
    condition: 'GOOD',
    hazards: [],
    lastUpdated: new Date().toISOString(),
    source: 'Department of Roads',
    confidence: 95
  }
];

export const MOCK_ROAD_REPORTS: any[] = [];
`;
  fs.writeFileSync(file, data);
}
