import React, { useState } from 'react';
import { Card, Button, Badge } from '@/components/ui';
import { MissingPerson, Location, Incident } from '@/types';
import { X, UserPlus, AlertCircle, Camera, Check } from 'lucide-react';

interface ReportModalProps {
  onClose: () => void;
  onSubmit: (personData: Omit<MissingPerson, 'id' | 'createdAt' | 'updatedAt' | 'timeline'>) => void;
  locations: Location[];
  incidents: Incident[];
  currentLocationId: string;
}

const SAMPLE_AVATARS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1544717305-2782549b5136?w=300&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=300&auto=format&fit=crop&q=80',
];

export function ReportMissingPersonModal({
  onClose,
  onSubmit,
  locations,
  incidents,
  currentLocationId
}: ReportModalProps) {
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('Male');
  const [lastKnownLocation, setLastKnownLocation] = useState('');
  const [locationId, setLocationId] = useState(currentLocationId);
  const [lastSeen, setLastSeen] = useState('2 hours ago');
  const [clothing, setClothing] = useState('');
  const [description, setDescription] = useState('');
  const [physicalDescription, setPhysicalDescription] = useState('');
  const [reportedBy, setReportedBy] = useState('');
  const [reportSource, setReportSource] = useState('Family Intake');
  const [contactInfo, setContactInfo] = useState('');
  const [photo, setPhoto] = useState(SAMPLE_AVATARS[0]);
  const [incidentId, setIncidentId] = useState(incidents[0]?.id || '');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !lastKnownLocation.trim() || !clothing.trim() || !contactInfo.trim()) {
      setErrorMsg('Please fill in all mandatory fields (Name, Location, Clothing, and Contact Information).');
      return;
    }

    const selectedIncident = incidents.find(i => i.id === incidentId);
    const selectedLoc = locations.find(l => l.id === locationId);

    onSubmit({
      name: name.trim(),
      age: parseInt(age) || 25,
      gender,
      lastLocation: lastKnownLocation.trim(),
      lastKnownLocation: lastKnownLocation.trim(),
      locationId,
      lat: selectedLoc?.lat || 27.7172,
      lng: selectedLoc?.lng || 85.3240,
      lastSeen,
      lastSeenDateTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' Today',
      clothing: clothing.trim(),
      description: description.trim(),
      physicalDescription: physicalDescription.trim(),
      reportedBy: reportedBy.trim() || 'Direct Helpline Intake',
      reportSource,
      contactInfo: contactInfo.trim(),
      contactInformation: contactInfo.trim(),
      status: 'MISSING',
      urgency: parseInt(age) < 12 || parseInt(age) > 65 ? 'CRITICAL' : 'HIGH',
      photo,
      disasterContext: selectedIncident ? {
        incidentId: selectedIncident.id,
        incidentName: selectedIncident.title,
        hazardType: selectedIncident.type,
        affectedRegion: selectedLoc?.name
      } : undefined
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col">
        
        {/* HEADER */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-950/60 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-red-100 dark:bg-red-950 text-red-600 dark:text-red-400">
              <UserPlus className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-slate-900 dark:text-white">
                Register Missing Person File
              </h3>
              <p className="text-xs text-slate-500">
                Official intake protocol • Generates automated baseline priority score
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* FORM */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 flex-1 text-xs">
          {errorMsg && (
            <div className="p-3 bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-400 rounded-lg flex items-center gap-2 border border-red-200 dark:border-red-900">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* BASIC IDENTITY */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="font-bold uppercase tracking-wider text-slate-500 block mb-1">
                Full Name *
              </label>
              <input 
                required 
                type="text" 
                value={name} 
                onChange={e => setName(e.target.value)} 
                placeholder="e.g., Rajesh Tamang"
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg p-2.5 text-slate-900 dark:text-slate-100 text-sm" 
              />
            </div>

            <div>
              <label className="font-bold uppercase tracking-wider text-slate-500 block mb-1">
                Age *
              </label>
              <input 
                required 
                type="number" 
                value={age} 
                onChange={e => setAge(e.target.value)} 
                placeholder="Age in years"
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg p-2.5 text-slate-900 dark:text-slate-100 text-sm" 
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-bold uppercase tracking-wider text-slate-500 block mb-1">
                Gender
              </label>
              <select 
                value={gender} 
                onChange={e => setGender(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg p-2.5 text-slate-900 dark:text-slate-100 text-sm"
              >
                <option>Male</option>
                <option>Female</option>
                <option>Other</option>
              </select>
            </div>

            <div>
              <label className="font-bold uppercase tracking-wider text-slate-500 block mb-1">
                Intake Source
              </label>
              <select 
                value={reportSource} 
                onChange={e => setReportSource(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg p-2.5 text-slate-900 dark:text-slate-100 text-sm"
              >
                <option>Family Intake Helpline</option>
                <option>Police Post / Emergency Desk</option>
                <option>Red Cross Volunteer</option>
                <option>Shelter Registrar</option>
                <option>Citizen Web Form</option>
              </select>
            </div>
          </div>

          {/* LAST KNOWN LOCATION & DISASTER LINK */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-bold uppercase tracking-wider text-slate-500 block mb-1">
                Last Known Coordinate / Area *
              </label>
              <input 
                required 
                type="text" 
                value={lastKnownLocation} 
                onChange={e => setLastKnownLocation(e.target.value)} 
                placeholder="e.g., Near Melamchi Bridge, Ward 3"
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg p-2.5 text-slate-900 dark:text-slate-100 text-sm" 
              />
            </div>

            <div>
              <label className="font-bold uppercase tracking-wider text-slate-500 block mb-1">
                Disaster District / Sector
              </label>
              <select 
                value={locationId} 
                onChange={e => setLocationId(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg p-2.5 text-slate-900 dark:text-slate-100 text-sm"
              >
                {locations.map(loc => (
                  <option key={loc.id} value={loc.id}>{loc.name} ({loc.region})</option>
                ))}
              </select>
            </div>
          </div>

          {/* CLOTHING & ATTIRE (CRITICAL FOR AI MATCHING) */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="font-bold uppercase tracking-wider text-slate-500">
                Clothing & Attire Worn When Last Seen *
              </label>
              <span className="text-[10px] text-purple-600 dark:text-purple-400 font-semibold">
                Crucial for AI Sighting Matching
              </span>
            </div>
            <input 
              required
              type="text" 
              value={clothing} 
              onChange={e => setClothing(e.target.value)} 
              placeholder="e.g., Dark blue raincoat, grey cargo pants, black boots, red cap"
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg p-2.5 text-slate-900 dark:text-slate-100 text-sm" 
            />
          </div>

          {/* DESCRIPTION & CIRCUMSTANCES */}
          <div>
            <label className="font-bold uppercase tracking-wider text-slate-500 block mb-1">
              Circumstances / Medical Needs / Distinguishing Details
            </label>
            <textarea 
              rows={2}
              value={description} 
              onChange={e => setDescription(e.target.value)} 
              placeholder="e.g., Was helping neighbors evacuate when flood wall broke. Diabetic requiring insulin, wears spectacles."
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg p-2.5 text-slate-900 dark:text-slate-100 text-sm" 
            />
          </div>

          {/* CONTACT DETAILS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-bold uppercase tracking-wider text-slate-500 block mb-1">
                Reporter Name & Relationship
              </label>
              <input 
                type="text" 
                value={reportedBy} 
                onChange={e => setReportedBy(e.target.value)} 
                placeholder="e.g., Suman Tamang (Brother)"
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg p-2.5 text-slate-900 dark:text-slate-100 text-sm" 
              />
            </div>

            <div>
              <label className="font-bold uppercase tracking-wider text-slate-500 block mb-1">
                Emergency Contact Phone *
              </label>
              <input 
                required
                type="text" 
                value={contactInfo} 
                onChange={e => setContactInfo(e.target.value)} 
                placeholder="+977-9841-XXXXXX"
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg p-2.5 text-slate-900 dark:text-slate-100 text-sm" 
              />
            </div>
          </div>

          {/* PHOTO SELECTION FOR DEMO */}
          <div>
            <label className="font-bold uppercase tracking-wider text-slate-500 block mb-1">
              Select Sample Reference Photo
            </label>
            <div className="flex gap-2 items-center overflow-x-auto pb-1">
              {SAMPLE_AVATARS.map((av, idx) => (
                <button
                  type="button"
                  key={idx}
                  onClick={() => setPhoto(av)}
                  className={`relative w-12 h-12 rounded-lg overflow-hidden border-2 shrink-0 transition-all ${
                    photo === av ? 'border-blue-600 ring-2 ring-blue-500/40' : 'border-slate-300 opacity-60 hover:opacity-100'
                  }`}
                >
                  <img src={av} alt="sample avatar" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  {photo === av && (
                    <div className="absolute inset-0 bg-blue-600/30 flex items-center justify-center text-white">
                      <Check className="h-4 w-4 stroke-[3]" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* FOOTER */}
          <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Submit & Activate Active Case File
            </Button>
          </div>
        </form>

      </div>
    </div>
  );
}
