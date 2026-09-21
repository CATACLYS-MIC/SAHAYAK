import React, { useState } from 'react';
import { 
  AlertTriangle, MapPin, X, ShieldAlert, CheckCircle2, 
  Phone, User, Clock, Flame, Waves, Mountain, Car, HelpCircle, Navigation
} from 'lucide-react';
import { useAppState } from '@/lib/store';
import { useTranslation } from '@/lib/i18n';

interface CitizenReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialDisasterType?: 'flood' | 'landslide' | 'road_blockage' | 'trapped' | 'fire' | 'general';
}

export function CitizenReportModal({
  isOpen,
  onClose,
  initialDisasterType = 'general'
}: CitizenReportModalProps) {
  const { addRoadReport, addCommunityRoadReport, userGeolocation, userRole } = useAppState();
  const { t } = useTranslation();

  const [disasterType, setDisasterType] = useState<string>(() => {
    if (initialDisasterType === 'landslide') return 'LANDSLIDE';
    if (initialDisasterType === 'flood') return 'FLOOD';
    if (initialDisasterType === 'road_blockage') return 'ROAD_BLOCKAGE';
    if (initialDisasterType === 'fire') return 'FIRE';
    if (initialDisasterType === 'trapped') return 'TRAPPED_PERSONS';
    return 'LANDSLIDE';
  });

  const [locationName, setLocationName] = useState('');
  const [district, setDistrict] = useState('Chitwan');
  const [severity, setSeverity] = useState<'CRITICAL' | 'HIGH' | 'MODERATE' | 'LOW'>('HIGH');
  const [description, setDescription] = useState('');
  const [reporterName, setReporterName] = useState(userRole === 'RESPONDER' ? 'APF Officer / Traffic Police' : 'Local Citizen');
  const [contactNumber, setContactNumber] = useState('');
  const [isLocating, setIsLocating] = useState(false);
  const [gpsCoordinates, setGpsCoordinates] = useState<{ lat: number; lng: number } | null>(
    userGeolocation ? { lat: userGeolocation.lat, lng: userGeolocation.lng } : null
  );
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setGpsCoordinates({
          lat: Number(pos.coords.latitude.toFixed(5)),
          lng: Number(pos.coords.longitude.toFixed(5))
        });
        if (!locationName) {
          setLocationName(`GPS: ${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)}`);
        }
        setIsLocating(false);
      },
      (err) => {
        console.warn('Geolocation error:', err);
        setIsLocating(false);
      },
      { timeout: 8000 }
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!locationName.trim()) return;

    const isResp = userRole === 'RESPONDER';
    const reportId = `rep-cit-${Date.now()}`;
    const fullLoc = `${locationName.trim()}, ${district}`;

    // 1. Add to road report if road-related
    if (disasterType === 'LANDSLIDE' || disasterType === 'ROAD_BLOCKAGE' || disasterType === 'FLOOD') {
      addRoadReport({
        id: reportId,
        locationName: fullLoc,
        location: gpsCoordinates || { lat: 27.7, lng: 85.3 },
        issueType: disasterType === 'ROAD_BLOCKAGE' ? 'BLOCKAGE' : disasterType === 'FLOOD' ? 'FLOOD' : 'LANDSLIDE',
        description: `[${severity} SEVERITY] ${description} | Reporter: ${reporterName} ${contactNumber ? `(${contactNumber})` : ''}`,
        timestamp: new Date().toISOString(),
        status: isResp ? 'VERIFIED' : 'UNVERIFIED',
        reportedBy: reporterName,
        isResponder: isResp
      });

      addCommunityRoadReport({
        locationName: locationName.trim(),
        district,
        location: gpsCoordinates || { lat: 27.7, lng: 85.3 },
        issueType: disasterType === 'ROAD_BLOCKAGE' ? 'ROAD_BLOCKED' : disasterType === 'FLOOD' ? 'FLOODED' : 'LANDSLIDE',
        description,
        passableFor: severity === 'CRITICAL' ? 'NONE' : severity === 'HIGH' ? 'NONE' : 'LIGHT_VEHICLES_ONLY',
        sourceType: isResp ? 'VERIFIED_RESPONDER' : 'CITIZEN_REPORT',
        reporterName,
        contactInfo: contactNumber || undefined,
        isConfirmed: isResp
      });
    }

    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      onClose();
    }, 1800);
  };

  return (
    <div className="fixed inset-0 z-[2500] flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-red-100 dark:bg-red-950/60 text-red-600 dark:text-red-400">
              <ShieldAlert className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                {t('citizen.report_hazard', 'Citizen Disaster & Hazard Report')}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {t('citizen.report_desc', 'Dispatched directly to District Emergency Control Room (DEOC)')}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {submitted ? (
          <div className="p-8 text-center space-y-3">
            <div className="inline-flex p-3 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="h-8 w-8 animate-bounce" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              {t('citizen.report_logged', 'Incident Report Successfully Logged!')}
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 max-w-sm mx-auto">
              {t('citizen.report_forwarded', 'Telemetry has been broadcast to emergency responders and road monitoring units.')}
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
            
            {/* Hazard Type Selector */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                {t('citizen.hazard_type', 'Incident / Hazard Type')}
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'LANDSLIDE', label: 'Landslide (पहिरो)', icon: Mountain },
                  { id: 'FLOOD', label: 'Flood (बाढी/डुबान)', icon: Waves },
                  { id: 'ROAD_BLOCKAGE', label: 'Road Block (सडक बन्द)', icon: Car },
                  { id: 'FIRE', label: 'Fire (आगलागी)', icon: Flame },
                  { id: 'TRAPPED_PERSONS', label: 'Trapped / Rescue', icon: AlertTriangle },
                  { id: 'COLLAPSE', label: 'Structure Collapse', icon: ShieldAlert }
                ].map((item) => {
                  const Icon = item.icon;
                  const isSelected = disasterType === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setDisasterType(item.id)}
                      className={`flex flex-col items-center justify-center p-2.5 rounded-xl border text-xs font-semibold transition-all ${
                        isSelected
                          ? 'border-red-500 bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 shadow-xs'
                          : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700'
                      }`}
                    >
                      <Icon className={`h-4 w-4 mb-1 ${isSelected ? 'text-red-600 dark:text-red-400' : 'text-slate-400'}`} />
                      <span className="text-center line-clamp-1">{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Severity Level */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                {t('citizen.severity', 'Severity Level')}
              </label>
              <div className="grid grid-cols-4 gap-2">
                {[
                  { id: 'CRITICAL', label: 'Critical', desc: 'Life at risk', color: 'border-red-500 text-red-600 bg-red-50 dark:bg-red-950/40' },
                  { id: 'HIGH', label: 'High', desc: 'Major block', color: 'border-orange-500 text-orange-600 bg-orange-50 dark:bg-orange-950/40' },
                  { id: 'MODERATE', label: 'Moderate', desc: 'Passable w/ caution', color: 'border-amber-500 text-amber-600 bg-amber-50 dark:bg-amber-950/40' },
                  { id: 'LOW', label: 'Low', desc: 'Minor delay', color: 'border-blue-500 text-blue-600 bg-blue-50 dark:bg-blue-950/40' }
                ].map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setSeverity(s.id as any)}
                    className={`p-2 text-center rounded-xl border text-xs font-bold transition-all ${
                      severity === s.id ? s.color : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/40'
                    }`}
                  >
                    <div>{s.label}</div>
                    <div className="text-[10px] font-normal opacity-80">{s.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Location & District */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                  {t('citizen.district', 'District')}
                </label>
                <select
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  {['Chitwan', 'Kathmandu', 'Sindhupalchok', 'Lalitpur', 'Bhaktapur', 'Kaski', 'Dhading', 'Gorkha', 'Makwanpur', 'Sunsari', 'Kailali', 'Nawalparasi'].map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                  {t('citizen.location_landmark', 'Landmark / Highway')}
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    placeholder="e.g. Jogimara km 72, Prithvi Highway"
                    value={locationName}
                    onChange={(e) => setLocationName(e.target.value)}
                    className="w-full pl-8 pr-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                  <MapPin className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
                </div>
              </div>
            </div>

            {/* GPS Tagging Button */}
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800">
              <div className="text-xs text-slate-600 dark:text-slate-400 flex items-center space-x-2">
                <Navigation className="h-3.5 w-3.5 text-blue-500" />
                <span>
                  {gpsCoordinates
                    ? `Coordinates: ${gpsCoordinates.lat}, ${gpsCoordinates.lng}`
                    : 'Attach precise device GPS position'}
                </span>
              </div>
              <button
                type="button"
                onClick={handleUseCurrentLocation}
                disabled={isLocating}
                className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-colors disabled:opacity-50"
              >
                {isLocating ? 'Locating...' : 'Use My GPS'}
              </button>
            </div>

            {/* Situation Details */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                {t('citizen.description', 'Situation Details & Observations')}
              </label>
              <textarea
                rows={3}
                required
                placeholder="Describe the hazard, water depth, blocked lanes, or stranded passengers..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
              />
            </div>

            {/* Reporter Contact Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                  {t('citizen.reporter_name', 'Your Name / Affiliation')}
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={reporterName}
                    onChange={(e) => setReporterName(e.target.value)}
                    className="w-full pl-8 pr-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                  <User className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                  {t('citizen.contact_phone', 'Callback Contact Phone')}
                </label>
                <div className="relative">
                  <input
                    type="tel"
                    placeholder="98XXXXXXXX"
                    value={contactNumber}
                    onChange={(e) => setContactNumber(e.target.value)}
                    className="w-full pl-8 pr-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                  <Phone className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
              >
                {t('common.cancel', 'Cancel')}
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 text-xs font-bold rounded-xl bg-red-600 hover:bg-red-700 text-white shadow-md hover:shadow-lg transition-all"
              >
                {t('citizen.submit_report', 'Submit Emergency Hazard Report')}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
