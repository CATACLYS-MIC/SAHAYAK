import React, { useEffect } from 'react';
import { GovernmentHospital } from '@/types';
import { Badge, Button } from '@/components/ui';
import { getOccupancyColor, calculateDistanceKm } from '@/lib/calculations';
import { useAppState } from '@/lib/store';
import { 
  X, Stethoscope, Phone, User, ExternalLink, 
  CheckCircle2, AlertTriangle, ShieldCheck, 
  MapPin, Clock, Info, Activity
} from 'lucide-react';

interface HospitalDetailModalProps {
  hospital: GovernmentHospital | null;
  onClose: () => void;
}

export function HospitalDetailModal({ hospital, onClose }: HospitalDetailModalProps) {
  const { userGeolocation, currentLocation } = useAppState();

  const getFacilityDistance = (lat?: number, lng?: number) => {
    if (!lat || !lng) return null;
    if (userGeolocation) return Math.round(calculateDistanceKm(userGeolocation.lat, userGeolocation.lng, lat, lng) * 10) / 10;
    if (currentLocation?.lat && currentLocation?.lng) return Math.round(calculateDistanceKm(currentLocation.lat, currentLocation.lng, lat, lng) * 10) / 10;
    return null;
  };

  // Escape key closes modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!hospital) return null;

  const occupancyStyle = getOccupancyColor(hospital.occupancyStatus);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm overflow-y-auto">
      <div 
        className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden my-8"
        role="dialog"
        aria-modal="true"
        aria-labelledby="hospital-detail-title"
      >
        {/* Header Strip */}
        <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-start justify-between bg-slate-50 dark:bg-slate-900/80">
          <div className="flex items-start gap-3.5 pr-6">
            <div className="p-3 bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 rounded-xl border border-blue-200 dark:border-blue-800/60 shadow-sm shrink-0 mt-0.5">
              <Stethoscope className="h-6 w-6" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1.5">
                <Badge variant="success" className="bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700">
                  <ShieldCheck className="h-3 w-3 mr-1 inline" /> REAL SOURCE DATA
                </Badge>
                {hospital.isCached && (
                  <Badge variant="warning">CACHED DATA</Badge>
                )}
                <Badge variant={hospital.type.includes('PUBLIC') ? 'info' : 'outline'}>
                  {hospital.type}
                </Badge>
              </div>
              <h2 id="hospital-detail-title" className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white leading-tight">
                {hospital.name}
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 flex items-center gap-1.5">
                <MapPin className="h-4 w-4 shrink-0 text-slate-400" />
                {hospital.address}
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            aria-label="Close dialog"
            className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6 space-y-6 max-h-[calc(85vh-120px)] overflow-y-auto">
          {/* Capacity Overview Bar */}
          <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-3">
            <div className="flex justify-between items-center">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Capacity & Occupancy State
                </span>
                <p className="text-xs text-slate-500 mt-0.5">Under Nepal MoHP Free Health Treatment Quota</p>
              </div>
              <Badge variant={occupancyStyle.badgeVariant} className="text-xs font-bold px-2.5 py-1">
                STATUS: {hospital.occupancyStatus}
              </Badge>
            </div>

            {/* Visual Occupancy Bar */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-sm font-semibold">
                <span className="text-slate-700 dark:text-slate-300">Free Beds Occupancy</span>
                <span className={occupancyStyle.text}>{hospital.occupancyPercentage}%</span>
              </div>
              <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-3.5 overflow-hidden shadow-inner p-0.5">
                <div 
                  className="h-2.5 rounded-full transition-all duration-500"
                  style={{ 
                    width: `${hospital.occupancyPercentage}%`,
                    backgroundColor: occupancyStyle.fillColor
                  }}
                />
              </div>
            </div>

            {/* Capacity Numbers Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
              <div className="bg-white dark:bg-slate-900 p-3 rounded-lg border border-slate-200 dark:border-slate-800 text-center shadow-xs">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wide block mb-1">
                  Total Sanction
                </span>
                <span className="text-2xl font-bold text-slate-900 dark:text-white">
                  {hospital.totalBeds > 0 ? hospital.totalBeds : 'N/A'}
                </span>
                <span className="block text-[10px] text-slate-400 mt-0.5">Total beds</span>
              </div>

              <div className="bg-white dark:bg-slate-900 p-3 rounded-lg border border-slate-200 dark:border-slate-800 text-center shadow-xs">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wide block mb-1">
                  Allocated Free
                </span>
                <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {hospital.allocatedBeds}
                </span>
                <span className="block text-[10px] text-slate-400 mt-0.5">Quota beds</span>
              </div>

              <div className="bg-white dark:bg-slate-900 p-3 rounded-lg border border-slate-200 dark:border-slate-800 text-center shadow-xs">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wide block mb-1">
                  Occupied
                </span>
                <span className="text-2xl font-bold text-amber-600 dark:text-amber-400">
                  {hospital.occupiedBeds}
                </span>
                <span className="block text-[10px] text-slate-400 mt-0.5">Active patients</span>
              </div>

              <div className="bg-white dark:bg-slate-900 p-3 rounded-lg border border-slate-200 dark:border-slate-800 text-center shadow-xs">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wide block mb-1">
                  Available Free
                </span>
                <span className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                  {hospital.availableBeds}
                </span>
                <span className="block text-[10px] text-slate-400 mt-0.5">Beds open</span>
              </div>
            </div>
          </div>

          {/* Discrepancy Note (if detected in government source without modifying numbers) */}
          {hospital.hasDiscrepancy && (
            <div className="p-3.5 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/80 rounded-xl flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
              <div className="text-xs text-amber-900 dark:text-amber-200 space-y-1">
                <p className="font-bold">Source Data Note:</p>
                <p>{hospital.discrepancyNote}</p>
                <p className="text-[11px] text-amber-700 dark:text-amber-300 italic">
                  SAHAYAK preserves official government values exactly as published without artificial alterations.
                </p>
              </div>
            </div>
          )}

          {/* Location & Geographic Information */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <MapPin className="h-4 w-4 text-blue-500" /> Administrative Location
              </h4>
              <div className="text-sm space-y-1 pt-1">
                <div className="flex justify-between">
                  <span className="text-slate-500">Province:</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{hospital.province}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">District:</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{hospital.district}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Palika / Muni:</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{hospital.municipality || 'Unspecified'}</span>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <Activity className="h-4 w-4 text-emerald-500" /> Geographic Coordinates
              </h4>
              <div className="text-sm space-y-1 pt-1">
                <div className="flex justify-between">
                  <span className="text-slate-500">Precision:</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    {hospital.locationPrecision === 'EXACT' ? 'Exact Hospital Coordinates' :
                     hospital.locationPrecision === 'APPROXIMATE_DISTRICT' ? 'District Center (Approximate)' :
                     'Coordinates Unavailable'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Distance:</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    {getFacilityDistance(hospital.lat, hospital.lng) != null ? `${getFacilityDistance(hospital.lat, hospital.lng)} km away` : 'Distance unavailable'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">GPS Marker:</span>
                  <span className="font-mono text-xs text-slate-600 dark:text-slate-400">
                    {hospital.lat && hospital.lng ? `${hospital.lat.toFixed(4)}, ${hospital.lng.toFixed(4)}` : 'Address only'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Details */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3 flex items-center gap-1.5">
              <Phone className="h-4 w-4 text-emerald-500" /> Public Contact Information
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="flex items-center gap-2.5">
                <User className="h-4 w-4 text-slate-400 shrink-0" />
                <div className="text-sm">
                  <span className="block text-xs text-slate-500">Contact Official</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    {hospital.contactPerson || 'Official desk / Public contact not listed'}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <Phone className="h-4 w-4 text-slate-400 shrink-0" />
                <div className="text-sm">
                  <span className="block text-xs text-slate-500">Emergency Phone</span>
                  {hospital.contactNumber ? (
                    <a 
                      href={`tel:${hospital.contactNumber}`} 
                      className="font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                    >
                      {hospital.contactNumber}
                    </a>
                  ) : (
                    <span className="text-slate-500 italic">Not publicly listed</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Source Transparency & Provenance Card */}
          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100/60 dark:bg-slate-900/60 space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Info className="h-4 w-4 text-blue-500" /> Government Source Transparency
              </h4>
              <Badge variant="outline" className="text-[10px]">
                DATA QUALITY: {hospital.dataQuality}
              </Badge>
            </div>
            
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Data originates from the Nepal Government Ministry of Health and Population (MoHP) Free Health Dashboard (लक्ष्यित वर्ग निःशुल्क उपचार पोर्टल).
            </p>

            <div className="pt-2 border-t border-slate-200 dark:border-slate-800 text-xs text-slate-500 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-1">
                <Clock className="h-3.5 w-3.5 text-slate-400" />
                <span>SAHAYAK RETRIEVED: {new Date(hospital.retrievedAt).toLocaleTimeString()} ({new Date(hospital.retrievedAt).toLocaleDateString()})</span>
              </div>
              <a 
                href={hospital.sourceUrl} 
                target="_blank" 
                rel="noreferrer noopener"
                className="inline-flex items-center gap-1 text-blue-600 dark:text-blue-400 hover:underline font-semibold"
              >
                Inspect Official Portal <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-3 bg-slate-50 dark:bg-slate-900">
          {hospital.contactNumber && (
            <a 
              href={`tel:${hospital.contactNumber}`} 
              className="inline-flex items-center justify-center font-medium transition-colors px-4 py-2 text-sm rounded-lg bg-emerald-600 text-white hover:bg-emerald-700"
            >
              <Phone className="h-4 w-4 mr-2" /> Call Facility
            </a>
          )}
          <Button variant="secondary" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}
