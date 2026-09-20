import React, { useState } from 'react';
import { Card, Button, Badge } from '@/components/ui';
import { Sighting, MissingPerson, Facility, Location } from '@/types';
import { X, Eye, Sparkles, MapPin, Building2, User, AlertCircle } from 'lucide-react';

interface SightingModalProps {
  onClose: () => void;
  onSubmit: (sightingData: Omit<Sighting, 'id'>) => Promise<any>;
  missingPersons: MissingPerson[];
  facilities: Facility[];
  locations: Location[];
  currentLocationId: string;
  preselectedPersonId?: string;
}

export function ReportSightingModal({
  onClose,
  onSubmit,
  missingPersons,
  facilities,
  locations,
  currentLocationId,
  preselectedPersonId
}: SightingModalProps) {
  const [location, setLocation] = useState('');
  const [facilityId, setFacilityId] = useState('');
  const [clothing, setClothing] = useState('');
  const [description, setDescription] = useState('');
  const [source, setSource] = useState('Relief Camp Volunteer');
  const [reporter, setReporter] = useState('');
  const [contactInfo, setContactInfo] = useState('');
  const [relatedPersonCandidate, setRelatedPersonCandidate] = useState(preselectedPersonId || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const activePersons = missingPersons.filter(p => p.status === 'MISSING' || p.status === 'POSSIBLE MATCH');

  const handleFacilityChange = (facId: string) => {
    setFacilityId(facId);
    const fac = facilities.find(f => f.id === facId);
    if (fac) {
      setLocation(`${fac.name} (${fac.type})`);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!location.trim() || !description.trim() || !reporter.trim()) {
      setErrorMsg('Please specify location, description, and reporter identity.');
      return;
    }

    setIsSubmitting(true);
    const selectedFacility = facilities.find(f => f.id === facilityId);

    try {
      await onSubmit({
        location: location.trim(),
        locationId: selectedFacility?.locationId || currentLocationId,
        timestamp: 'Today, ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        description: description.trim(),
        clothing: clothing.trim(),
        source,
        reporter: reporter.trim(),
        contactInfo: contactInfo.trim(),
        relatedPersonCandidate: relatedPersonCandidate || undefined,
        status: 'UNREVIEWED',
        facilityType: selectedFacility?.type as any,
        facilityName: selectedFacility?.name
      });
      onClose();
    } catch (err) {
      console.error(err);
      setErrorMsg('Error submitting sighting lead.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-xl w-full shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col">
        
        {/* HEADER */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-950/60 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400">
              <Eye className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-slate-900 dark:text-white">
                Submit Field Sighting Lead
              </h3>
              <p className="text-xs text-slate-500">
                Log a person observed at a shelter, hospital, or field transit point
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

          {/* SIGHTING FACILITY SELECTION (SHELTER OR HOSPITAL) */}
          <div>
            <label className="font-bold uppercase tracking-wider text-slate-500 block mb-1">
              Select Shelter / Hospital Facility (Optional Shortcut)
            </label>
            <select 
              value={facilityId} 
              onChange={e => handleFacilityChange(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg p-2.5 text-slate-900 dark:text-slate-100 text-sm"
            >
              <option value="">-- Custom Location or Street Encounter --</option>
              {facilities.map(f => (
                <option key={f.id} value={f.id}>
                  {f.name} ({f.type} - {f.address})
                </option>
              ))}
            </select>
          </div>

          {/* SIGHTING LOCATION */}
          <div>
            <label className="font-bold uppercase tracking-wider text-slate-500 block mb-1">
              Exact Sighting Location / Facility Name *
            </label>
            <input 
              required
              type="text" 
              value={location} 
              onChange={e => setLocation(e.target.value)} 
              placeholder="e.g., Melamchi Relief Shelter - Medical Tent B"
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg p-2.5 text-slate-900 dark:text-slate-100 text-sm" 
            />
          </div>

          {/* TARGET CANDIDATE MATCHING SELECTOR */}
          <div className="p-3 bg-purple-50/50 dark:bg-purple-950/30 rounded-xl border border-purple-200 dark:border-purple-800/50 space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="font-bold uppercase tracking-wider text-purple-900 dark:text-purple-300 flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-purple-600" />
                Target Active Missing Person to Compare
              </label>
              <span className="text-[10px] text-purple-600 dark:text-purple-400 font-semibold">
                Auto-Evaluated by AI
              </span>
            </div>
            <select 
              value={relatedPersonCandidate} 
              onChange={e => setRelatedPersonCandidate(e.target.value)}
              className="w-full bg-white dark:bg-slate-900 border border-purple-200 dark:border-purple-800 rounded-lg p-2 text-slate-900 dark:text-slate-100 text-sm"
            >
              <option value="">-- Auto-detect across all active missing reports --</option>
              {activePersons.map(p => (
                <option key={p.id} value={p.id}>
                  {p.name} (Age {p.age} - Last seen: {p.lastKnownLocation})
                </option>
              ))}
            </select>
          </div>

          {/* OBSERVED CLOTHING */}
          <div>
            <label className="font-bold uppercase tracking-wider text-slate-500 block mb-1">
              Observed Clothing / Footwear / Gear
            </label>
            <input 
              type="text" 
              value={clothing} 
              onChange={e => setClothing(e.target.value)} 
              placeholder="e.g., Blue rain jacket with hood, dark muddy jeans, brown boots"
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg p-2.5 text-slate-900 dark:text-slate-100 text-sm" 
            />
          </div>

          {/* DESCRIPTION / CONDITION */}
          <div>
            <label className="font-bold uppercase tracking-wider text-slate-500 block mb-1">
              Physical Description & Apparent Condition *
            </label>
            <textarea 
              required
              rows={3}
              value={description} 
              onChange={e => setDescription(e.target.value)} 
              placeholder="Describe age estimate, build, physical state, injuries, speech, who they were with, or what they mentioned..."
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg p-2.5 text-slate-900 dark:text-slate-100 text-sm" 
            />
          </div>

          {/* REPORTER INFO */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-bold uppercase tracking-wider text-slate-500 block mb-1">
                Reporter Identity *
              </label>
              <input 
                required
                type="text" 
                value={reporter} 
                onChange={e => setReporter(e.target.value)} 
                placeholder="e.g., Dr. Anita Joshi (Triage Volunteer)"
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg p-2.5 text-slate-900 dark:text-slate-100 text-sm" 
              />
            </div>

            <div>
              <label className="font-bold uppercase tracking-wider text-slate-500 block mb-1">
                Source Type
              </label>
              <select 
                value={source} 
                onChange={e => setSource(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg p-2.5 text-slate-900 dark:text-slate-100 text-sm"
              >
                <option>Relief Camp Volunteer</option>
                <option>Hospital OPD Staff</option>
                <option>Community Search Team</option>
                <option>Local Resident / Citizen</option>
                <option>Police / Armed Police Force</option>
              </select>
            </div>
          </div>

          {/* FOOTER */}
          <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" disabled={isSubmitting}>
              {isSubmitting ? 'Analyzing with AI Engine...' : 'Submit Sighting & Run AI Match'}
            </Button>
          </div>
        </form>

      </div>
    </div>
  );
}
