import React, { useState } from 'react';
import { Badge, Button } from '@/components/ui';
import { 
  X, ShieldAlert, CheckCircle2, XCircle, HelpCircle, 
  Sparkles, AlertTriangle, Building2, MapPin, Calendar, 
  User, Eye, FileText, ChevronRight, Scale, Info, Check, Clock
} from 'lucide-react';
import { HospitalMatchResult, HospitalPatientRecord, MissingPerson } from '@/types';
import { useAppState } from '@/lib/store';
import { cn } from '@/lib/utils';

interface HospitalSideBySideReviewModalProps {
  match: HospitalMatchResult;
  patient: HospitalPatientRecord;
  missingPerson: MissingPerson;
  onClose: () => void;
  onConfirm: (notes: string, reviewerName: string) => void;
  onReject: (notes: string, reviewerName: string) => void;
  onRequestMoreInfo: (notes: string, reviewerName: string) => void;
}

export function HospitalSideBySideReviewModal({
  match,
  patient,
  missingPerson,
  onClose,
  onConfirm,
  onReject,
  onRequestMoreInfo
}: HospitalSideBySideReviewModalProps) {
  const { hospitalAccessRole } = useAppState();
  const [reviewerName, setReviewerName] = useState(
    hospitalAccessRole === 'HOSPITAL_STAFF' 
      ? 'Dr. S. Koirala (Trauma Registrar)' 
      : 'Inspector D. Thapa (Disaster Verification Specialist)'
  );
  const [reviewNotes, setReviewNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'EVIDENCE' | 'AUDIT'>('OVERVIEW');

  const handleAction = (action: 'CONFIRM' | 'REJECT' | 'REQUEST') => {
    setIsSubmitting(true);
    setTimeout(() => {
      if (action === 'CONFIRM') {
        onConfirm(reviewNotes, reviewerName);
      } else if (action === 'REJECT') {
        onReject(reviewNotes, reviewerName);
      } else {
        onRequestMoreInfo(reviewNotes, reviewerName);
      }
      setIsSubmitting(false);
      onClose();
    }, 400);
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-700';
    if (score >= 60) return 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 border-blue-300 dark:border-blue-700';
    return 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 border-amber-300 dark:border-amber-700';
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-6xl max-h-[92vh] flex flex-col overflow-hidden">
        
        {/* MODAL HEADER */}
        <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/80 dark:bg-slate-950/50">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-teal-100 dark:bg-teal-900/50 text-teal-700 dark:text-teal-300">
              <Scale className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                  Side-by-Side Match Verification Dossier
                </h2>
                <Badge variant="outline" className="text-[10px] bg-amber-50 text-amber-800 border-amber-300 dark:bg-amber-950/40 dark:text-amber-300">
                  SIMULATED DATA
                </Badge>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Hospital MRN: <strong className="text-slate-800 dark:text-slate-200">{patient.mrn}</strong> ↔ Missing Case: <strong className="text-slate-800 dark:text-slate-200">{missingPerson.name} ({missingPerson.id})</strong>
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

        {/* MANDATORY ETHICAL PRINCIPLE BANNER */}
        <div className="px-5 py-2.5 bg-amber-50 dark:bg-amber-950/40 border-b border-amber-200/80 dark:border-amber-800/60 flex items-start gap-2.5">
          <ShieldAlert className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          <div className="text-xs text-amber-900 dark:text-amber-200 leading-snug">
            <span className="font-bold">MANDATORY HUMAN-IN-THE-LOOP ETHICAL STANDARD:</span> The AI engine does NOT declare or confirm legal identity. The AI matching score is an indicator of multi-signal feature similarity, not proof. Final verification must always be performed and signed off by authorized hospital staff, designated law enforcement, or verified family liaisons.
          </div>
        </div>

        {/* MODAL BODY (SCROLLABLE) */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          
          {/* AI MATCH CONFIDENCE BANNER */}
          <div className="p-4 rounded-xl bg-gradient-to-r from-teal-50 via-blue-50 to-indigo-50 dark:from-teal-950/30 dark:via-blue-950/20 dark:to-indigo-950/30 border border-teal-200/80 dark:border-teal-800/60">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className={cn("px-4 py-3 rounded-xl border text-center font-black shrink-0", getScoreColor(match.matchConfidence))}>
                  <div className="text-3xl tracking-tight">{match.matchConfidence}%</div>
                  <div className="text-[10px] font-bold uppercase tracking-wider">AI Match Indicator</div>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-teal-600 dark:text-teal-400" />
                    <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base">
                      Autonomous Multimodal Match Assessment
                    </h3>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 max-w-xl">
                    Engine evaluated physical tokens, age bracket compatibility, clothing remnants, and river drainage corridor flow from <strong className="text-slate-800 dark:text-slate-200">{missingPerson.lastKnownLocation}</strong> to <strong className="text-slate-800 dark:text-slate-200">{patient.hospitalName}</strong>.
                  </p>
                </div>
              </div>

              {/* SIGNAL SCORES */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
                <div className="p-2 bg-white/80 dark:bg-slate-900/80 rounded-lg border border-slate-200/60 dark:border-slate-800/60">
                  <div className="text-slate-500 dark:text-slate-400 text-[10px] font-semibold">Visual / Attire</div>
                  <div className="font-bold text-slate-900 dark:text-slate-100 text-sm mt-0.5">{match.visualSimilarityScore}%</div>
                </div>
                <div className="p-2 bg-white/80 dark:bg-slate-900/80 rounded-lg border border-slate-200/60 dark:border-slate-800/60">
                  <div className="text-slate-500 dark:text-slate-400 text-[10px] font-semibold">Demographics</div>
                  <div className="font-bold text-slate-900 dark:text-slate-100 text-sm mt-0.5">{match.demographicScore}%</div>
                </div>
                <div className="p-2 bg-white/80 dark:bg-slate-900/80 rounded-lg border border-slate-200/60 dark:border-slate-800/60">
                  <div className="text-slate-500 dark:text-slate-400 text-[10px] font-semibold">Corridor / Flow</div>
                  <div className="font-bold text-slate-900 dark:text-slate-100 text-sm mt-0.5">{match.locationScore}%</div>
                </div>
                <div className="p-2 bg-white/80 dark:bg-slate-900/80 rounded-lg border border-slate-200/60 dark:border-slate-800/60">
                  <div className="text-slate-500 dark:text-slate-400 text-[10px] font-semibold">Chronology</div>
                  <div className="font-bold text-slate-900 dark:text-slate-100 text-sm mt-0.5">{match.timeframeScore}%</div>
                </div>
              </div>
            </div>
          </div>

          {/* SIDE-BY-SIDE COMPARISON COLUMNS */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* LEFT: MISSING PERSON PROFILE */}
            <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 p-4 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800 text-[10px] font-bold">
                    MISSING PERSON RECORD
                  </Badge>
                  <span className="text-xs font-mono text-slate-500">ID: {missingPerson.id}</span>
                </div>
                <Badge variant={missingPerson.status === 'FOUND' ? 'success' : 'danger'} className="text-[10px]">
                  {missingPerson.status}
                </Badge>
              </div>

              {/* Photo & Name */}
              <div className="flex gap-4 items-start">
                <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-xl overflow-hidden bg-slate-200 dark:bg-slate-800 shrink-0 border-2 border-white dark:border-slate-800 shadow-sm">
                  {missingPerson.photo ? (
                    <img 
                      src={missingPerson.photo} 
                      alt={missingPerson.name} 
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover" 
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-400">
                      <User className="h-10 w-10" />
                    </div>
                  )}
                </div>

                <div className="flex-1 space-y-1">
                  <h4 className="text-lg font-bold text-slate-900 dark:text-slate-100 leading-tight">
                    {missingPerson.name}
                  </h4>
                  <p className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                    {missingPerson.age} years old • {missingPerson.gender}
                  </p>
                  <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-1">
                    <Clock className="h-3.5 w-3.5 text-slate-400" />
                    Last seen: {missingPerson.lastSeen} ({missingPerson.lastSeenDateTime || 'Reported'})
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5 text-slate-400" />
                    {missingPerson.lastKnownLocation}
                  </div>
                </div>
              </div>

              {/* Physical & Attire Details */}
              <div className="space-y-2 text-xs">
                <div className="p-2.5 bg-white dark:bg-slate-900 rounded-lg border border-slate-200/80 dark:border-slate-800/80">
                  <span className="font-bold text-slate-700 dark:text-slate-300 block mb-0.5">Reported Clothing:</span>
                  <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                    {missingPerson.clothing || 'Not specified in initial report'}
                  </p>
                </div>

                <div className="p-2.5 bg-white dark:bg-slate-900 rounded-lg border border-slate-200/80 dark:border-slate-800/80">
                  <span className="font-bold text-slate-700 dark:text-slate-300 block mb-0.5">Physical Traits & Context:</span>
                  <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                    {missingPerson.physicalDescription || missingPerson.description || 'Standard profile recorded.'}
                  </p>
                </div>

                <div className="p-2.5 bg-white dark:bg-slate-900 rounded-lg border border-slate-200/80 dark:border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500">
                  <span>Reported By: {missingPerson.reportedBy || 'Authorized Registry'}</span>
                  <span>Contact: {missingPerson.contactInfo || 'Authority Desk'}</span>
                </div>
              </div>
            </div>

            {/* RIGHT: HOSPITAL PATIENT RECORD */}
            <div className="rounded-xl border border-teal-200 dark:border-teal-900/60 bg-teal-50/30 dark:bg-teal-950/20 p-4 space-y-4">
              <div className="flex items-center justify-between border-b border-teal-200/60 dark:border-teal-800/40 pb-3">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="bg-teal-100 text-teal-800 border-teal-300 dark:bg-teal-950 dark:text-teal-300 dark:border-teal-700 text-[10px] font-bold">
                    HOSPITAL PATIENT RECORD
                  </Badge>
                  <span className="text-xs font-mono text-slate-500">MRN: {patient.mrn}</span>
                </div>
                <Badge variant="outline" className="bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950 dark:text-amber-300 text-[10px]">
                  {patient.status}
                </Badge>
              </div>

              {/* Photo & Hospital Intake */}
              <div className="flex gap-4 items-start">
                <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-xl overflow-hidden bg-slate-200 dark:bg-slate-800 shrink-0 border-2 border-white dark:border-slate-800 shadow-sm relative">
                  {patient.photo ? (
                    <img 
                      src={patient.photo} 
                      alt={`Unidentified patient ${patient.mrn}`}
                      referrerPolicy="no-referrer" 
                      className="w-full h-full object-cover" 
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-400">
                      <User className="h-10 w-10" />
                    </div>
                  )}
                  <div className="absolute bottom-0 inset-x-0 bg-slate-900/70 text-white text-[9px] text-center py-0.5 font-bold">
                    Intake Photo
                  </div>
                </div>

                <div className="flex-1 space-y-1">
                  <h4 className="text-base font-bold text-slate-900 dark:text-slate-100 leading-tight">
                    Unidentified Patient ({patient.mrn})
                  </h4>
                  <p className="text-xs font-semibold text-teal-700 dark:text-teal-400">
                    Est. Age: {patient.approximateAge} • Sex: {patient.sex} {patient.approximateHeight ? `• ${patient.approximateHeight}` : ''}
                  </p>
                  <div className="text-xs text-slate-600 dark:text-slate-400 flex items-center gap-1 mt-1">
                    <Building2 className="h-3.5 w-3.5 text-teal-600 dark:text-teal-400 shrink-0" />
                    <span className="truncate">{patient.hospitalName} ({patient.ward})</span>
                  </div>
                  <div className="text-xs text-slate-600 dark:text-slate-400 flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5 text-teal-600 dark:text-teal-400 shrink-0" />
                    <span className="truncate">Found: {patient.foundLocation}</span>
                  </div>
                </div>
              </div>

              {/* Physical & Hospital Details */}
              <div className="space-y-2 text-xs">
                <div className="p-2.5 bg-white dark:bg-slate-900 rounded-lg border border-teal-200/70 dark:border-teal-900/60">
                  <span className="font-bold text-slate-700 dark:text-slate-300 block mb-0.5">Observed Clothing on Intake:</span>
                  <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                    {patient.clothingAppearance}
                  </p>
                </div>

                <div className="p-2.5 bg-white dark:bg-slate-900 rounded-lg border border-teal-200/70 dark:border-teal-900/60">
                  <span className="font-bold text-slate-700 dark:text-slate-300 block mb-0.5">Distinguishing Characteristics & Belongings:</span>
                  <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                    {patient.distinguishingCharacteristics || 'None cataloged'}
                    {patient.otherIdentifyingInfo ? ` • ${patient.otherIdentifyingInfo}` : ''}
                  </p>
                </div>

                <div className="p-2.5 bg-white dark:bg-slate-900 rounded-lg border border-teal-200/70 dark:border-teal-900/60 flex items-center justify-between text-[11px] text-slate-500">
                  <span>Admitted: {patient.admissionDateTime}</span>
                  <span>Submitted by: {patient.submittedBy}</span>
                </div>
              </div>
            </div>
          </div>

          {/* AI REASONS & CONTRADICTIONS BREAKDOWN */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Supporting Reasons */}
            <div className="p-4 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/40 space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                Supporting Reasons for Match (Why Flagged)
              </h4>
              <ul className="space-y-1.5 text-xs text-slate-700 dark:text-slate-300">
                {match.whyFlagged.map((reason, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold shrink-0 mt-0.5">•</span>
                    <span>{reason}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contradictions / Differences */}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800 space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <AlertTriangle className="h-4 w-4 text-amber-500" />
                Observations & Potential Contradictions
              </h4>
              {match.contradictions && match.contradictions.length > 0 ? (
                <ul className="space-y-1.5 text-xs text-slate-700 dark:text-slate-300">
                  {match.contradictions.map((contra, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-amber-500 font-bold shrink-0 mt-0.5">•</span>
                      <span>{contra}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-xs text-slate-500 dark:text-slate-400 italic">
                  No material physical or geographical contradictions detected across analyzed fields.
                </p>
              )}
            </div>
          </div>

          {/* HUMAN VERIFICATION CONTROLS PANEL */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <User className="h-4 w-4 text-teal-600 dark:text-teal-400" />
                  Authorized Human Verification Sign-Off
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Your verification action will be recorded permanently in the official audit trail.
                </p>
              </div>
              <div className="text-xs font-mono text-slate-500 dark:text-slate-400">
                Timestamp: {new Date().toLocaleTimeString()}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Verifier Name & Clinical / Authority Role
                </label>
                <input 
                  type="text" 
                  value={reviewerName}
                  onChange={(e) => setReviewerName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg text-xs bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  placeholder="e.g. Dr. S. Koirala, Senior Trauma Registrar"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Verification Notes / Evidence Summary
                </label>
                <input 
                  type="text" 
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg text-xs bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  placeholder="e.g. Physical scar and family photograph confirmed bedside by attending staff."
                />
              </div>
            </div>

            {/* THREE MANDATED ACTION BUTTONS */}
            <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-2">
              <Button
                variant="outline"
                onClick={() => handleAction('REJECT')}
                disabled={isSubmitting}
                className="w-full sm:w-auto text-xs font-bold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/50 border-red-200 dark:border-red-900 flex items-center justify-center gap-1.5"
              >
                <XCircle className="h-4 w-4" />
                Reject Match
              </Button>

              <Button
                variant="outline"
                onClick={() => handleAction('REQUEST')}
                disabled={isSubmitting}
                className="w-full sm:w-auto text-xs font-bold text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/50 border-amber-200 dark:border-amber-900 flex items-center justify-center gap-1.5"
              >
                <HelpCircle className="h-4 w-4" />
                Request Further Verification (DNA / Relative)
              </Button>

              <Button
                variant="primary"
                onClick={() => handleAction('CONFIRM')}
                disabled={isSubmitting}
                className="w-full sm:w-auto text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm flex items-center justify-center gap-1.5"
              >
                <CheckCircle2 className="h-4 w-4" />
                Confirm Potential Match
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
