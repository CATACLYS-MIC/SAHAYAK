import React, { useState } from 'react';
import { BaseMap } from '@/components/Map';
import { Marker, Popup, Polyline, Tooltip } from 'react-leaflet';
import L from 'leaflet';
import { MissingPerson, Sighting, Facility, CandidateMatch, Location } from '@/types';
import { Badge, Button } from '@/components/ui';
import { MapPin, Eye, Sparkles, Building2, User, Phone, CheckCircle2 } from 'lucide-react';

interface MapProps {
  missingPersons: MissingPerson[];
  sightings: Sighting[];
  facilities: Facility[];
  candidateMatches: CandidateMatch[];
  locations: Location[];
  onSelectPerson: (person: MissingPerson) => void;
  onReviewMatch: (match: CandidateMatch) => void;
}

// Custom Leaflet DivIcons with SVG symbols
const createCustomIcon = (type: 'person' | 'sighting' | 'shelter' | 'hospital' | 'match', label?: string) => {
  let color = '#ef4444'; // red
  let bgColor = 'bg-red-500';
  let symbol = '👤';

  if (type === 'person') {
    color = '#dc2626';
    bgColor = 'bg-red-600 text-white';
    symbol = '🚨';
  } else if (type === 'sighting') {
    color = '#2563eb';
    bgColor = 'bg-blue-600 text-white';
    symbol = '👁️';
  } else if (type === 'shelter') {
    color = '#059669';
    bgColor = 'bg-emerald-600 text-white';
    symbol = '⛺';
  } else if (type === 'hospital') {
    color = '#7c3aed';
    bgColor = 'bg-purple-600 text-white';
    symbol = '🏥';
  } else if (type === 'match') {
    color = '#d97706';
    bgColor = 'bg-amber-500 text-white animate-pulse';
    symbol = '⚡';
  }

  return L.divIcon({
    className: 'custom-div-icon',
    html: `
      <div style="
        background: ${color}; 
        color: white; 
        width: 32px; 
        height: 32px; 
        border-radius: 50%; 
        display: flex; 
        align-items: center; 
        justify-content: center; 
        font-size: 14px; 
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -1px rgba(0, 0, 0, 0.2); 
        border: 2px solid white;
        font-weight: bold;
      ">
        ${symbol}
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -18]
  });
};

export function MissingPersonMap({
  missingPersons,
  sightings,
  facilities,
  candidateMatches,
  locations,
  onSelectPerson,
  onReviewMatch
}: MapProps) {
  const [showShelters, setShowShelters] = useState(true);
  const [showHospitals, setShowHospitals] = useState(true);
  const [showSightings, setShowSightings] = useState(true);
  const [showConnections, setShowConnections] = useState(true);

  // Derive coordinates for sightings based on facility or district
  const getSightingCoords = (s: Sighting): [number, number] => {
    if (s.facilityName) {
      const fac = facilities.find(f => f.name === s.facilityName);
      if (fac) return [fac.lat, fac.lng];
    }
    const loc = locations.find(l => l.id === s.locationId);
    if (loc?.lat && loc?.lng) {
      // Slightly jitter to prevent exact overlapping markers
      const offset = (parseInt(s.id.replace(/\D/g, '')) % 10) * 0.003 - 0.015;
      return [loc.lat + offset, loc.lng + offset];
    }
    return [27.7172, 85.3240];
  };

  // Get person coords
  const getPersonCoords = (p: MissingPerson): [number, number] => {
    if (p.lat && p.lng) return [p.lat, p.lng];
    const loc = locations.find(l => l.id === p.locationId);
    if (loc?.lat && loc?.lng) {
      const offset = (parseInt(p.id.replace(/\D/g, '')) % 10) * 0.004 - 0.02;
      return [loc.lat + offset, loc.lng + offset];
    }
    return [27.7172, 85.3240];
  };

  // Find matches with valid points to draw connecting lines
  const matchLines = candidateMatches
    .filter(m => m.status === 'PENDING_REVIEW' || m.status === 'VERIFIED_MATCH')
    .map(match => {
      const person = missingPersons.find(p => p.id === match.missingPersonId);
      const sighting = sightings.find(s => s.id === match.sightingId);
      if (!person || !sighting) return null;

      const pCoords = getPersonCoords(person);
      const sCoords = getSightingCoords(sighting);

      return {
        match,
        person,
        sighting,
        positions: [pCoords, sCoords] as [[number, number], [number, number]]
      };
    })
    .filter((item): item is NonNullable<typeof item> => item !== null);

  return (
    <div className="relative w-full h-[620px] rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-sm">
      {/* MAP CONTROLS OVERLAY */}
      <div className="absolute top-3 left-3 z-[1000] bg-white/95 dark:bg-slate-900/95 backdrop-blur-md p-3 rounded-xl border border-slate-200 dark:border-slate-800 shadow-lg text-xs space-y-2 max-w-xs">
        <h4 className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[11px] flex items-center gap-1.5">
          <MapPin className="h-4 w-4 text-blue-600" />
          Galli Maps Tactical Tracking
        </h4>
        <div className="grid grid-cols-2 gap-2 text-[11px]">
          <label className="flex items-center gap-1.5 cursor-pointer font-medium text-slate-700 dark:text-slate-300">
            <input 
              type="checkbox" 
              checked={showSightings} 
              onChange={e => setShowSightings(e.target.checked)}
              className="rounded text-blue-600 focus:ring-0" 
            />
            <span className="w-2.5 h-2.5 rounded-full bg-blue-600 inline-block shrink-0"></span>
            Sightings ({sightings.length})
          </label>

          <label className="flex items-center gap-1.5 cursor-pointer font-medium text-slate-700 dark:text-slate-300">
            <input 
              type="checkbox" 
              checked={showConnections} 
              onChange={e => setShowConnections(e.target.checked)}
              className="rounded text-amber-500 focus:ring-0" 
            />
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block shrink-0"></span>
            AI Links ({matchLines.length})
          </label>

          <label className="flex items-center gap-1.5 cursor-pointer font-medium text-slate-700 dark:text-slate-300">
            <input 
              type="checkbox" 
              checked={showShelters} 
              onChange={e => setShowShelters(e.target.checked)}
              className="rounded text-emerald-600 focus:ring-0" 
            />
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 inline-block shrink-0"></span>
            Shelters
          </label>

          <label className="flex items-center gap-1.5 cursor-pointer font-medium text-slate-700 dark:text-slate-300">
            <input 
              type="checkbox" 
              checked={showHospitals} 
              onChange={e => setShowHospitals(e.target.checked)}
              className="rounded text-purple-600 focus:ring-0" 
            />
            <span className="w-2.5 h-2.5 rounded-full bg-purple-600 inline-block shrink-0"></span>
            Hospitals
          </label>
        </div>
      </div>

      <BaseMap className="h-full w-full">
        
        {/* MISSING PERSONS MARKERS */}
        {missingPersons.map(person => {
          const coords = getPersonCoords(person);
          const hasPendingMatch = candidateMatches.some(m => m.missingPersonId === person.id && m.status === 'PENDING_REVIEW');
          
          return (
            <Marker 
              key={`person-${person.id}`}
              position={coords}
              icon={createCustomIcon(hasPendingMatch ? 'match' : 'person', person.name)}
            >
              <Popup className="custom-popup" maxWidth={300}>
                <div className="p-1 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <Badge variant={person.status === 'FOUND' ? 'success' : person.urgency === 'CRITICAL' ? 'critical' : 'warning'}>
                      {person.status}
                    </Badge>
                    <span className="text-[10px] font-bold text-slate-400">ID: {person.id}</span>
                  </div>

                  <div className="flex gap-2 items-center">
                    {person.photo && (
                      <img src={person.photo} alt={person.name} className="w-10 h-10 rounded-lg object-cover" />
                    )}
                    <div>
                      <h5 className="font-bold text-slate-900 text-sm leading-tight">{person.name}</h5>
                      <p className="text-[11px] text-slate-500">Age: {person.age} • {person.gender}</p>
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-600">
                    <strong>Last Seen:</strong> {person.lastKnownLocation} ({person.lastSeen})
                  </p>

                  {person.clothing && (
                    <p className="text-[11px] text-slate-600">
                      <strong>Attire:</strong> {person.clothing}
                    </p>
                  )}

                  <Button 
                    size="sm" 
                    variant="primary" 
                    className="w-full text-xs py-1 h-7 mt-1"
                    onClick={() => onSelectPerson(person)}
                  >
                    Open Case File
                  </Button>
                </div>
              </Popup>
            </Marker>
          );
        })}

        {/* FIELD SIGHTINGS MARKERS */}
        {showSightings && sightings.map(s => {
          const coords = getSightingCoords(s);
          return (
            <Marker 
              key={`sighting-${s.id}`}
              position={coords}
              icon={createCustomIcon('sighting', s.reporter)}
            >
              <Popup maxWidth={300}>
                <div className="p-1 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <Badge variant="info">FIELD SIGHTING</Badge>
                    <span className="text-[10px] text-slate-400">{s.timestamp}</span>
                  </div>

                  <h5 className="font-bold text-slate-900 text-sm">{s.location}</h5>
                  <p className="text-[11px] text-slate-600">
                    <strong>Reporter:</strong> {s.reporter} ({s.source})
                  </p>
                  <p className="text-[11px] text-slate-600">
                    <strong>Description:</strong> {s.description}
                  </p>
                  {s.clothing && (
                    <p className="text-[11px] text-slate-600">
                      <strong>Attire:</strong> {s.clothing}
                    </p>
                  )}
                </div>
              </Popup>
            </Marker>
          );
        })}

        {/* SHELTER MARKERS */}
        {showShelters && facilities.filter(f => f.type === 'Shelter').map(f => (
          <Marker 
            key={`shelter-${f.id}`}
            position={[f.lat, f.lng]}
            icon={createCustomIcon('shelter', f.name)}
          >
            <Popup maxWidth={260}>
              <div className="p-1 text-xs space-y-1">
                <Badge variant="success">RELIEF SHELTER</Badge>
                <h5 className="font-bold text-slate-900 text-sm">{f.name}</h5>
                <p className="text-slate-600">Capacity: {f.capacity} beds • {f.status}</p>
                <p className="text-slate-500 text-[11px]">{f.address}</p>
              </div>
            </Popup>
          </Marker>
        ))}

        {/* HOSPITAL MARKERS */}
        {showHospitals && facilities.filter(f => f.type === 'Hospital').map(f => (
          <Marker 
            key={`hospital-${f.id}`}
            position={[f.lat, f.lng]}
            icon={createCustomIcon('hospital', f.name)}
          >
            <Popup maxWidth={260}>
              <div className="p-1 text-xs space-y-1">
                <Badge variant="info">HOSPITAL / CLINIC</Badge>
                <h5 className="font-bold text-slate-900 text-sm">{f.name}</h5>
                <p className="text-slate-600">Beds: {f.capacity} • {f.status}</p>
                <p className="text-slate-500 text-[11px]">{f.address}</p>
              </div>
            </Popup>
          </Marker>
        ))}

        {/* CANDIDATE MATCH CONNECTING POLYLINES */}
        {showConnections && matchLines.map(({ match, person, sighting, positions }) => (
          <Polyline 
            key={`line-${match.id}`}
            positions={positions}
            pathOptions={{
              color: match.status === 'VERIFIED_MATCH' ? '#10b981' : '#a855f7',
              weight: match.status === 'VERIFIED_MATCH' ? 4 : 3,
              dashArray: match.status === 'VERIFIED_MATCH' ? undefined : '6, 8',
              opacity: 0.85
            }}
          >
            <Tooltip sticky>
              <div className="text-xs p-1">
                <p className="font-bold text-purple-700">
                  ⚡ AI Match Candidate ({match.similarityScore}%)
                </p>
                <p className="text-[11px]">{person.name} ⟷ {sighting.location}</p>
                <p className="text-[10px] text-slate-500">Click to inspect correlation</p>
              </div>
            </Tooltip>
          </Polyline>
        ))}

      </BaseMap>
    </div>
  );
}
