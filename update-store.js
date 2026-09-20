import fs from 'fs';
let file = 'src/lib/store.tsx';
let data = fs.readFileSync(file, 'utf8');

if (!data.includes('roads: Road[]')) {
  // Add to AppState interface
  data = data.replace(
    /export interface AppState \{/,
    `export interface AppState {
  roads: any[];
  bridges: any[];
  roadReports: any[];`
  );
  
  // Add to AppAction interface
  data = data.replace(
    /export interface AppAction \{/,
    `export interface AppAction {
  setRoads: (roads: any[]) => void;
  updateRoad: (id: string, updates: Partial<any>) => void;
  setBridges: (bridges: any[]) => void;
  updateBridge: (id: string, updates: Partial<any>) => void;
  addRoadReport: (report: any) => void;`
  );
  
  // Add default state
  data = data.replace(
    /facilities: MOCK_FACILITIES,/,
    `facilities: MOCK_FACILITIES,
  roads: [],
  bridges: [],
  roadReports: [],`
  );
  
  // Add actions
  data = data.replace(
    /setFacilities: \(facilities\) => set\(\{ facilities \}\),/,
    `setFacilities: (facilities) => set({ facilities }),
  setRoads: (roads) => set({ roads }),
  updateRoad: (id, updates) => set((state) => ({ roads: state.roads.map(r => r.id === id ? { ...r, ...updates } : r) })),
  setBridges: (bridges) => set({ bridges }),
  updateBridge: (id, updates) => set((state) => ({ bridges: state.bridges.map(b => b.id === id ? { ...b, ...updates } : b) })),
  addRoadReport: (report) => set((state) => ({ roadReports: [...state.roadReports, report] })),`
  );
  
  fs.writeFileSync(file, data);
}
