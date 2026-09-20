import React, { useState } from 'react';
import { Marker, Popup, Circle } from 'react-leaflet';
import L from 'leaflet';
import { BaseMap } from '../Map';
import { VolunteerTeam } from '../../types';
import { NEPAL_VOLUNTEER_AREAS } from '../../data/volunteerAreas';
import { 
  Users, MapPin, Phone, Shield, Crosshair, 
  Activity, Wrench, CheckCircle2, Clock, AlertTriangle, ExternalLink
} from 'lucide-react';
import { Badge, Button } from '../ui';

interface TeamAllocationMapProps {
  teams: VolunteerTeam[];
  selectedTeamId?: string | null;
  onSelectTeam?: (team: VolunteerTeam) => void;
  onReassignTeam?: (team: VolunteerTeam) => void;
}

const getSpecializationColor = (specialization?: string): { bg: string; border: string; text: string; pin: string } => {
  const spec = (specialization || '').toLowerCase();
  if (spec.includes('medical') || spec.includes('health') || spec.includes('triage')) {
    return { bg: '#10b981', border: '#059669', text: 'text-emerald-700 dark:text-emerald-300', pin: '#10b981' };
  }
  if (spec.includes('rescue') || spec.includes('sar') || spec.includes('swiftwater')) {
    return { bg: '#3b82f6', border: '#1d4ed8', text: 'text-blue-700 dark:text-blue-300', pin: '#3b82f6' };
  }
  if (spec.includes('logistics') || spec.includes('supply') || spec.includes('convoy')) {
    return { bg: '#f59e0b', border: '#d97706', text: 'text-amber-700 dark:text-amber-300', pin: '#f59e0b' };
  }
  if (spec.includes('drone') || spec.includes('comm') || spec.includes('telecom')) {
    return { bg: '#8b5cf6', border: '#7c3aed', text: 'text-purple-700 dark:text-purple-300', pin: '#8b5cf6' };
  }
  if (spec.includes('camp') || spec.includes('shelter') || spec.includes('wash')) {
    return { bg: '#ec4899', border: '#db2777', text: 'text-pink-700 dark:text-pink-300', pin: '#ec4899' };
  }
  return { bg: '#0284c7', border: '#0369a1', text: 'text-sky-700 dark:text-sky-300', pin: '#0284c7' };
};

const createTeamMarkerIcon = (team: VolunteerTeam, isSelected: boolean) => {
  const { bg, border } = getSpecializationColor(team.specialization);
  const size = isSelected ? 38 : 32;
  const isDeployed = team.status === 'DEPLOYED';

  return L.divIcon({
    className: 'bg-transparent border-0',
    html: `
      <div style="position: relative; width: ${size}px; height: ${size}px; display: flex; align-items: center; justify-content: center;">
        ${isDeployed ? `<div style="position: absolute; inset: -4px; border-radius: 50%; background: ${bg}; opacity: 0.35; animation: ping 2s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>` : ''}
        <div style="
          width: ${size}px; 
          height: ${size}px; 
          border-radius: 50%; 
          background-color: ${bg}; 
          border: ${isSelected ? '3px solid #ffffff' : '2px solid #ffffff'}; 
          box-shadow: 0 4px 10px rgba(0,0,0,0.4); 
          display: flex; 
          align-items: center; 
          justify-content: center;
          color: white;
          font-weight: bold;
          font-size: ${isSelected ? '14px' : '12px'};
        ">
          ${team.memberCount || 5}
        </div>
        <div style="
          position: absolute; 
          bottom: -4px; 
          right: -4px; 
          width: 12px; 
          height: 12px; 
          border-radius: 50%; 
          background-color: ${isDeployed ? '#22c55e' : '#eab308'}; 
          border: 2px solid white;
        "></div>
      </div>
    `,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -size / 2],
  });
};

export function TeamAllocationMap({
  teams,
  selectedTeamId,
  onSelectTeam,
  onReassignTeam,
}: TeamAllocationMapProps) {
  const [activeDistrictFilter, setActiveDistrictFilter] = useState<string>('ALL');

  // Filter teams with valid coordinates
  const mappedTeams = teams.filter(t => typeof t.lat === 'number' && typeof t.lng === 'number');

  const filteredTeams = mappedTeams.filter(t => {
    if (activeDistrictFilter === 'ALL') return true;
    return (t.assignedLocationName || t.operatingArea || '').toLowerCase().includes(activeDistrictFilter.toLowerCase());
  });

  // Calculate center based on selected team or default
  const selectedTeam = teams.find(t => t.id === selectedTeamId);
  const mapCenter: [number, number] = selectedTeam?.lat && selectedTeam?.lng 
    ? [selectedTeam.lat, selectedTeam.lng]
    : [27.7172, 85.3240];

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col">
      {/* Top Map Control Bar */}
      <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 bg-slate-50/75 dark:bg-slate-900/75">
        <div>
          <div className="flex items-center gap-2">
            <Crosshair className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            <h3 className="font-semibold text-slate-900 dark:text-white text-base">
              National Volunteer Team Allocation Map
            </h3>
            <Badge variant="outline" className="text-xs bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800">
              {filteredTeams.length} Teams Located on Ground
            </Badge>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Geographic deployment coordinates showing active team assignments across Nepal disaster zones
          </p>
        </div>

        {/* District Filter Chips */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-xs font-medium text-slate-600 dark:text-slate-400 mr-1">Sector:</span>
          {['ALL', 'Sindhupalchok', 'Kathmandu', 'Chitwan', 'Rasuwa', 'Pokhara'].map(dist => (
            <button
              key={dist}
              onClick={() => setActiveDistrictFilter(dist)}
              className={`px-2.5 py-1 text-xs rounded-md font-medium transition-all ${
                activeDistrictFilter === dist
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
              }`}
            >
              {dist}
            </button>
          ))}
        </div>
      </div>

      {/* Main Map Canvas */}
      <div className="relative w-full h-[450px]">
        <BaseMap center={mapCenter} zoom={selectedTeam ? 12 : 9} className="h-full w-full">
          {/* Disaster Hotspot Area Circles for Context */}
          {NEPAL_VOLUNTEER_AREAS.map(area => (
            <Circle
              key={`zone-${area.id}`}
              center={[area.lat, area.lng]}
              radius={area.severity === 'CRITICAL' ? 6500 : 4500}
              pathOptions={{
                color: area.severity === 'CRITICAL' ? '#ef4444' : '#f59e0b',
                fillColor: area.severity === 'CRITICAL' ? '#ef4444' : '#f59e0b',
                fillOpacity: 0.12,
                weight: 1.5,
                dashArray: '4, 6'
              }}
            />
          ))}

          {/* Team Location Markers */}
          {filteredTeams.map(team => {
            if (!team.lat || !team.lng) return null;
            const isSelected = team.id === selectedTeamId;
            const specColors = getSpecializationColor(team.specialization);

            return (
              <Marker
                key={team.id}
                position={[team.lat, team.lng]}
                icon={createTeamMarkerIcon(team, isSelected)}
                eventHandlers={{
                  click: () => onSelectTeam && onSelectTeam(team)
                }}
              >
                <Popup className="custom-popup" minWidth={280}>
                  <div className="p-1 space-y-2 text-slate-900 dark:text-slate-100 font-sans">
                    <div className="flex items-start justify-between gap-2 border-b border-slate-200 dark:border-slate-700 pb-2">
                      <div>
                        <h4 className="font-bold text-sm leading-tight text-slate-900 dark:text-white">
                          {team.name}
                        </h4>
                        <span className={`text-[11px] font-semibold ${specColors.text}`}>
                          {team.specialization || 'Volunteer Rescue Team'}
                        </span>
                      </div>
                      <Badge 
                        variant={team.status === 'DEPLOYED' ? 'default' : 'secondary'}
                        className={`text-[10px] uppercase font-bold shrink-0 ${
                          team.status === 'DEPLOYED' 
                            ? 'bg-emerald-600 text-white' 
                            : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                        }`}
                      >
                        {team.status}
                      </Badge>
                    </div>

                    <div className="space-y-1.5 text-xs">
                      {/* Allocated Area */}
                      <div className="flex items-start gap-1.5 bg-blue-50/80 dark:bg-blue-950/60 p-2 rounded border border-blue-200/60 dark:border-blue-800/60">
                        <MapPin className="h-4 w-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                        <div>
                          <span className="font-semibold text-blue-900 dark:text-blue-200 block">
                            Allocated Area:
                          </span>
                          <span className="text-slate-700 dark:text-slate-300">
                            {team.assignedLocationName || team.operatingArea || 'Standby Zone'}
                          </span>
                        </div>
                      </div>

                      {/* Current Mission / Task */}
                      {team.currentTask && (
                        <div className="text-slate-600 dark:text-slate-300 text-[11px] leading-relaxed">
                          <span className="font-semibold text-slate-800 dark:text-slate-200">Mission: </span>
                          {team.currentTask}
                        </div>
                      )}

                      {/* Leader & Size */}
                      <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-100 dark:border-slate-800">
                        <div>
                          <span className="text-[10px] text-slate-400 block uppercase">Leader</span>
                          <span className="font-medium text-slate-800 dark:text-slate-200 text-xs">
                            {team.leaderName}
                          </span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-400 block uppercase">Team Strength</span>
                          <span className="font-medium text-slate-800 dark:text-slate-200 text-xs flex items-center gap-1">
                            <Users className="h-3 w-3 text-blue-500" /> {team.memberCount} Members
                          </span>
                        </div>
                      </div>

                      {/* Contact */}
                      {team.contact && (
                        <div className="flex items-center justify-between text-xs pt-1">
                          <a 
                            href={`tel:${team.contact}`} 
                            className="text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 font-mono font-medium"
                          >
                            <Phone className="h-3 w-3" /> {team.contact}
                          </a>
                          {onReassignTeam && (
                            <Button 
                              size="sm" 
                              variant="outline" 
                              className="h-6 text-[11px] px-2"
                              onClick={() => onReassignTeam(team)}
                            >
                              Reassign
                            </Button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </Popup>
              </Marker>
            );
          })}
        </BaseMap>

        {/* Map Legend Overlay */}
        <div className="absolute bottom-3 left-3 z-[1000] bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm p-3 rounded-lg border border-slate-200 dark:border-slate-800 shadow-md text-xs space-y-1.5 max-w-[260px]">
          <span className="font-semibold text-slate-800 dark:text-slate-200 block text-[11px] uppercase tracking-wider">
            Specialization Pins
          </span>
          <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-[11px] text-slate-600 dark:text-slate-400">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block"></span>
              <span>Medical / Triage</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block"></span>
              <span>Search & Rescue</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block"></span>
              <span>Logistics Convoy</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-purple-500 inline-block"></span>
              <span>Drone & Comms</span>
            </div>
          </div>
          <div className="pt-1.5 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-[10px] text-slate-500">
            <span>• Marker number = Volunteers</span>
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span> Active on Ground
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
