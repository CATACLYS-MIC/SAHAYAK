export interface VolunteerArea {
  id: string;
  name: string;
  district: string;
  province: string;
  lat: number;
  lng: number;
  severity: 'CRITICAL' | 'HIGH' | 'MODERATE' | 'MONITORING';
  primaryNeed: string;
  neededSpecializations: string[];
  suggestedTasks: string[];
  description: string;
}

export const NEPAL_VOLUNTEER_AREAS: VolunteerArea[] = [
  {
    id: 'loc-2',
    name: 'Melamchi & Helambu Valley Upper Outposts',
    district: 'Sindhupalchok',
    province: 'Bagmati',
    lat: 27.8450,
    lng: 85.5900,
    severity: 'CRITICAL',
    primaryNeed: 'Emergency Medical & Trauma Triage Team',
    neededSpecializations: ['Medical Triage', 'Search & Rescue (SAR)', 'Field Camp & Shelter'],
    suggestedTasks: [
      'Flash flood trauma care, patient screening, and first aid tent setup',
      'Waterborne illness screening and oral rehydration distribution',
      'High-water evacuation assistance for elderly and children'
    ],
    description: 'Severely impacted by mountain river swelling and mudslides. Limited road access through Zero Point.'
  },
  {
    id: 'loc-1',
    name: 'Kathmandu Valley Riverside (Balkhu & Kuleshwor)',
    district: 'Kathmandu',
    province: 'Bagmati',
    lat: 27.6950,
    lng: 85.2950,
    severity: 'HIGH',
    primaryNeed: 'Swiftwater SAR, Evacuation & Inundation Aid',
    neededSpecializations: ['Search & Rescue (SAR)', 'Logistics & Supply Convoy', 'Field Camp & Shelter'],
    suggestedTasks: [
      'Inundation evacuation and raft rescue along Balkhu river corridor',
      'Emergency food pack and clean drinking water distribution at temporary shelters',
      'Urban mud clearing and secondary electrical hazard cordoning'
    ],
    description: 'Bagmati and Bishnumati tributary overflow with waterlogging across low-lying informal settlements.'
  },
  {
    id: 'loc-5',
    name: 'Narayangarh Floodplain Riverside Ward 2',
    district: 'Chitwan',
    province: 'Bagmati',
    lat: 27.6850,
    lng: 84.4250,
    severity: 'HIGH',
    primaryNeed: 'Logistics Convoy, Food Distribution & Boat SAR',
    neededSpecializations: ['Logistics & Supply Convoy', 'Search & Rescue (SAR)', 'Water & Sanitation (WASH)'],
    suggestedTasks: [
      'Operating 4WD supply convoy unloading and warehouse ration packaging',
      'Shallow boat patrol along inundated lowlands for isolated households',
      'Water purification tablet distribution and community health notices'
    ],
    description: 'Narayani river surge threatening low-lying bank settlements. High-clearance transport required.'
  },
  {
    id: 'loc-4',
    name: 'Rasuwa Highland Outpost (Ramche Cutoff)',
    district: 'Rasuwa',
    province: 'Bagmati',
    lat: 28.1150,
    lng: 85.2950,
    severity: 'HIGH',
    primaryNeed: 'Alpine SAR, Aerial Recon & Satellite Comms',
    neededSpecializations: ['Communications & Drone', 'Search & Rescue (SAR)', 'Field Camp & Shelter'],
    suggestedTasks: [
      'Drone thermal aerial reconnaissance over severed mountain highway sections',
      'Operating emergency satellite communication bridge for isolated villages',
      'High-altitude trail search and thermal blanket delivery'
    ],
    description: 'Highway severed by heavy rockfall. Accessible only via mountain trail foot trek or air-bridge.'
  },
  {
    id: 'loc-3',
    name: 'Pokhara & Sarangkot Foothills Staging Base',
    district: 'Kaski',
    province: 'Gandaki',
    lat: 28.2300,
    lng: 83.9600,
    severity: 'MODERATE',
    primaryNeed: 'Regional Supply Staging & Landslide Watch',
    neededSpecializations: ['Logistics & Supply Convoy', 'Communications & Drone', 'Medical Triage'],
    suggestedTasks: [
      'Coordinating western regional relief supply storage and convoy staging',
      'Monitoring hillside mudslide warning sensors and rainfall gauges',
      'Mobile first aid clinic for displaced families at stadium staging ground'
    ],
    description: 'Key logistics transfer hub connecting western hill districts and transit corridors.'
  },
  {
    id: 'loc-6',
    name: 'Dhulikhel & Panauti Emergency Corridor',
    district: 'Kavrepalanchok',
    province: 'Bagmati',
    lat: 27.6200,
    lng: 85.5500,
    severity: 'MODERATE',
    primaryNeed: 'Hospital Patient Coordination & Shelter Care',
    neededSpecializations: ['Medical Triage', 'Field Camp & Shelter', 'General Relief'],
    suggestedTasks: [
      'Ambulance reception and patient triage staging outside Dhulikhel Hospital',
      'Temporary family shelter management and dry meal distribution',
      'Community psychosocial first aid and missing persons intake desk'
    ],
    description: 'Secondary medical buffer zone receiving transfer patients from upper hill districts.'
  },
  {
    id: 'loc-7',
    name: 'Butwal & Tinau River Basin',
    district: 'Rupandehi',
    province: 'Lumbini',
    lat: 27.7000,
    lng: 83.4500,
    severity: 'MODERATE',
    primaryNeed: 'River Stage Monitoring & Evacuation Warning',
    neededSpecializations: ['Search & Rescue (SAR)', 'Field Camp & Shelter', 'Communications & Drone'],
    suggestedTasks: [
      'Patrolling Tinau suspension bridge banks and flood alert megaphones',
      'Assisting municipality ward disaster committee in shelter registration',
      'Setting up temporary clean drinking water filtration points'
    ],
    description: 'Flash river swells during torrential hill downpours. High population density along riverbanks.'
  },
  {
    id: 'loc-8',
    name: 'Biratnagar Koshi Basin Depot',
    district: 'Morang',
    province: 'Koshi',
    lat: 26.4800,
    lng: 87.2800,
    severity: 'MONITORING',
    primaryNeed: 'Eastern Flood Relief Logistics & Water Purification',
    neededSpecializations: ['Logistics & Supply Convoy', 'Water & Sanitation (WASH)', 'Food Distribution'],
    suggestedTasks: [
      'Stockpiling life vests, tarpaulins, and halogen lights for eastern river basin',
      'Water testing and chlorine distribution in flood-prone wards',
      'Standby logistics convoy for Koshi barrage perimeter'
    ],
    description: 'Eastern staging warehouse coordinating supplies along Koshi river corridor.'
  }
];

/**
 * Intelligent helper to recommend an area to volunteer at based on team skills,
 * specialization, and active coverage gaps.
 */
export function recommendAreaForTeam(
  skills: string[] = [],
  specialization: string = '',
  customAreas?: VolunteerArea[]
): {
  recommendedArea: VolunteerArea;
  task: string;
  reason: string;
  confidence: number;
} {
  const areas = customAreas || NEPAL_VOLUNTEER_AREAS;
  const specLower = specialization.toLowerCase();
  const skillsLower = skills.map(s => s.toLowerCase());

  // 1. If medical triage / doctor
  if (specLower.includes('medical') || skillsLower.some(s => s.includes('medical') || s.includes('triage') || s.includes('first aid'))) {
    const melamchi = areas.find(a => a.id === 'loc-2') || areas[0];
    return {
      recommendedArea: melamchi,
      task: melamchi.suggestedTasks[0] || 'Emergency trauma triage and medical clinic support',
      reason: 'Critical severity medical gap with urgent shortage of trauma doctors and first aid responders in Sindhupalchok.',
      confidence: 96
    };
  }

  // 2. If Search & Rescue or Swiftwater
  if (specLower.includes('rescue') || specLower.includes('sar') || skillsLower.some(s => s.includes('rescue') || s.includes('swiftwater') || s.includes('boat'))) {
    const kathmandu = areas.find(a => a.id === 'loc-1') || areas[0];
    return {
      recommendedArea: kathmandu,
      task: kathmandu.suggestedTasks[0] || 'Swiftwater raft search & rescue and riverside evacuation',
      reason: 'High-risk urban inundation along Bagmati riverbanks requiring immediate raft SAR teams and rescue lines.',
      confidence: 94
    };
  }

  // 3. If Drone / Communications
  if (specLower.includes('drone') || specLower.includes('communication') || skillsLower.some(s => s.includes('drone') || s.includes('comms') || s.includes('radio'))) {
    const rasuwa = areas.find(a => a.id === 'loc-4') || areas[0];
    return {
      recommendedArea: rasuwa,
      task: rasuwa.suggestedTasks[0] || 'Thermal drone reconnaissance and off-grid satellite radio net setup',
      reason: 'Severed mountain pass requires aerial thermal reconnaissance and off-grid telecommunication relay.',
      confidence: 92
    };
  }

  // 4. If Logistics / Heavy Convoy / Food
  if (specLower.includes('logistics') || specLower.includes('convoy') || specLower.includes('food') || skillsLower.some(s => s.includes('logistics') || s.includes('transport') || s.includes('food'))) {
    const chitwan = areas.find(a => a.id === 'loc-5') || areas[0];
    return {
      recommendedArea: chitwan,
      task: chitwan.suggestedTasks[0] || 'Relief truck cargo unloading and food ration packaging',
      reason: 'Critical logistics bottleneck requiring 4WD high-clearance supply transit and food staging in Narayangarh.',
      confidence: 90
    };
  }

  // Fallback to highest severity area
  const critical = areas.find(a => a.severity === 'CRITICAL') || areas[0];
  return {
    recommendedArea: critical,
    task: critical.suggestedTasks[0] || `General volunteer relief support at ${critical.name}`,
    reason: `Highest priority disaster sector in ${critical.district} requiring immediate general volunteer mobilization.`,
    confidence: 85
  };
}
