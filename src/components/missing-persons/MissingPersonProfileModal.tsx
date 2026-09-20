import React from 'react';
import { Card, Badge, Button } from '@/components/ui';
import { MissingPerson, CandidateMatch, Sighting } from '@/types';
import { 
  X, MapPin, Clock, ShieldCheck, AlertTriangle, Sparkles, 
  Phone, User, Calendar, FileText, CheckCircle2, ChevronRight, Activity, Lock, ExternalLink
} from 'lucide-react';

interface ProfileModalProps {
  person: MissingPerson;
  candidateMatches: CandidateMatch[];
  sightings: Sighting[];
  onClose: () => void;
  onReviewMatch?: (match: CandidateMatch) => void;
  userRole: 'PUBLIC' | 'RESPONDER';
}

export function MissingPersonProfileModal({
  person,
  candidateMatches,
  sightings,
  onClose,
  onReviewMatch,
  userRole
}: ProfileModalProps) {
  const personMatches = candidateMatches.filter(m => m.missingPersonId === person.id);
  const pendingMatch = personMatches.find(m => m.status === 'PENDING_REVIEW');
  const relatedSightings = sightings.filter(s => 
    s.relatedPersonCandidate === person.id || (person.potentialMatchIds || []).includes(s.id)
  );

  // Mask sensitive contact details for public mode
  const getMaskedContact = (contact: string) => {
    if (userRole === 'RESPONDER') return contact;
    if (!contact) return 'Unavailable';
    if (contact.length <= 6) return '***-***';
    return contact.substring(0, 6) + '-***-*** [Protected in Public View]';
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-4xl w-full shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col">
        
        {/* MODAL HEADER */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-950/60 shrink-0">
          <div className="flex items-center gap-3">
            <Badge variant={person.status === 'FOUND' ? 'success' : person.urgency === 'CRITICAL' ? 'critical' : 'warning'}>
              {person.status}
            </Badge>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
              Case File: {person.name}
            </h3>
            <span className="text-xs text-slate-500 font-mono">({person.id})</span>
          </div>

          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* MODAL BODY */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-slate-700 dark:text-slate-300">
          
          {/* TOP SECTION: PHOTO & KEY DATA */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
            
            {/* PHOTO */}
            <div className="md:col-span-4 space-y-3">
              <div className="aspect-[4/5] rounded-xl bg-slate-100 dark:bg-slate-800 overflow-hidden border border-slate-200 dark:border-slate-700 relative flex items-center justify-center">
                {person.photo ? (
                  <img 
                    src={person.photo} 
                    alt={person.name}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center text-slate-400">
                    <User className="h-16 w-16 stroke-[1.5]" />
                    <span className="text-xs font-semibold mt-2">NO PHOTO FILED</span>
                  </div>
                )}

                <div className="absolute bottom-2 left-2 right-2 bg-slate-950/80 backdrop-blur-md rounded-lg p-2 text-white text-[11px] border border-slate-800/80">
                  <div className="flex justify-between items-center font-bold">
                    <span>Baseline Priority:</span>
                    <span className={person.baselinePriorityScore && person.baselinePriorityScore >= 80 ? 'text-red-400' : 'text-amber-400'}>
                      {person.baselinePriorityScore || 75}/100 ({person.urgency})
                    </span>
                  </div>
                </div>
              </div>

              {/* PRIVACY BADGE */}
              <div className="p-2.5 bg-slate-50 dark:bg-slate-950/40 rounded-lg border border-slate-200 dark:border-slate-800 text-[11px] text-slate-500 flex items-center justify-between">
                <span className="flex items-center gap-1.5 font-medium">
                  <Lock className="h-3.5 w-3.5 text-blue-500" /> Mode: {userRole}
                </span>
                <span className="text-[10px] uppercase font-bold text-slate-400">
                  {userRole === 'RESPONDER' ? 'Unrestricted' : 'Redacted Phone/PII'}
                </span>
              </div>
            </div>

            {/* CASE SUMMARY DETAILS */}
            <div className="md:col-span-8 space-y-4">
              <div>
                <h4 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                  {person.name}
                </h4>
                <p className="text-sm text-slate-500 mt-0.5">
                  Age: <strong className="text-slate-800 dark:text-slate-200">{person.age}</strong> • Gender: <strong className="text-slate-800 dark:text-slate-200">{person.gender}</strong>
                </p>
              </div>

              {/* OFFICIAL GOVERNMENT RESCUE PORTAL PROVENANCE */}
              {person.isRealSourceData && (
                <div className="p-3 bg-red-50/70 dark:bg-red-950/40 rounded-xl border border-red-200 dark:border-red-900/60 text-xs">
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-2 pb-2 border-b border-red-200/80 dark:border-red-900/50">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="h-4 w-4 text-red-600 dark:text-red-400" />
                      <span className="font-bold text-red-950 dark:text-red-200 uppercase tracking-wide">
                        Official Nepal Government Record
                      </span>
                    </div>
                    <Badge variant={person.status === 'FOUND' ? 'success' : 'critical'} className="text-[10px] uppercase font-bold">
                      {person.rawType === 'found' || person.status === 'FOUND' ? 'RESCUED / FOUND' : 'LOST / MISSING'}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] mb-2">
                    <div>
                      <span className="text-slate-500 dark:text-slate-400 block">Registry:</span>
                      <span className="font-semibold text-slate-800 dark:text-slate-200">OPMCM / NDRRMA</span>
                    </div>
                    <div>
                      <span className="text-slate-500 dark:text-slate-400 block">NDRRMA Ref:</span>
                      <span className="font-semibold text-slate-800 dark:text-slate-200 font-mono">
                        {person.ndrrmaId ? `#${person.ndrrmaId}` : 'Registered'}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500 dark:text-slate-400 block">Precision:</span>
                      <span className="font-semibold text-slate-800 dark:text-slate-200">
                        {person.locationPrecision === 'EXACT' ? 'Exact Coordinate' : person.locationPrecision === 'APPROXIMATE_DISTRICT' ? 'District Level' : 'Pending Survey'}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500 dark:text-slate-400 block">Data Quality:</span>
                      <span className={`font-semibold ${person.dataQuality === 'GOOD' ? 'text-emerald-600' : 'text-amber-600'}`}>
                        {person.dataQuality || 'VERIFIED'}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-red-200/60 dark:border-red-900/40 text-[11px]">
                    <span className="text-slate-600 dark:text-slate-400">
                      National Portal: <strong className="text-slate-800 dark:text-slate-200 font-mono">rescue.opmcm.gov.np</strong>
                    </span>
                    <a 
                      href="https://rescue.opmcm.gov.np/person-reports"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 font-bold text-red-600 dark:text-red-400 hover:underline"
                    >
                      <span>Verify on Official Portal</span>
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                </div>
              )}

              {/* GRID ATTRIBUTES */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                <div className="p-3 bg-slate-50 dark:bg-slate-950/50 rounded-xl border border-slate-200 dark:border-slate-800">
                  <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block mb-1">
                    Last Known Location
                  </span>
                  <div className="font-semibold text-slate-900 dark:text-slate-100 flex items-start gap-1.5">
                    <MapPin className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
                    <span>{person.lastKnownLocation || person.lastLocation}</span>
                  </div>
                </div>

                <div className="p-3 bg-slate-50 dark:bg-slate-950/50 rounded-xl border border-slate-200 dark:border-slate-800">
                  <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block mb-1">
                    Time Since Last Contact
                  </span>
                  <div className="font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                    <Clock className="h-4 w-4 text-blue-500 shrink-0" />
                    <span>{person.lastSeen} ({person.lastSeenDateTime})</span>
                  </div>
                </div>

                <div className="p-3 bg-slate-50 dark:bg-slate-950/50 rounded-xl border border-slate-200 dark:border-slate-800">
                  <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block mb-1">
                    Reported By & Intake Source
                  </span>
                  <p className="font-medium text-slate-900 dark:text-slate-200 text-xs">
                    {person.reportedBy} • {person.reportSource}
                  </p>
                </div>

                <div className="p-3 bg-slate-50 dark:bg-slate-950/50 rounded-xl border border-slate-200 dark:border-slate-800">
                  <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block mb-1">
                    Emergency Contact
                  </span>
                  <div className="font-mono text-xs font-semibold text-blue-600 dark:text-blue-400 flex items-center gap-1.5">
                    <Phone className="h-3.5 w-3.5" />
                    <span>{getMaskedContact(person.contactInformation || person.contactInfo)}</span>
                  </div>
                </div>
              </div>

              {/* ATTIRE & PHYSICAL DETAILS */}
              <div className="space-y-2 text-sm bg-slate-50 dark:bg-slate-950/40 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
                <p>
                  <strong className="text-slate-900 dark:text-slate-100">Clothing / Attire:</strong>{' '}
                  <span className="text-slate-700 dark:text-slate-300">{person.clothing || 'Not specified'}</span>
                </p>
                <p>
                  <strong className="text-slate-900 dark:text-slate-100">Circumstances:</strong>{' '}
                  <span className="text-slate-700 dark:text-slate-300">{person.description}</span>
                </p>
                {person.physicalDescription && (
                  <p>
                    <strong className="text-slate-900 dark:text-slate-100">Physical Identifiers:</strong>{' '}
                    <span className="text-slate-700 dark:text-slate-300">{person.physicalDescription}</span>
                  </p>
                )}
                {person.disasterContext && (
                  <p className="text-xs text-amber-700 dark:text-amber-400 pt-1">
                    <strong>Disaster Link:</strong> {person.disasterContext.hazardType} in {person.disasterContext.affectedRegion} ({person.disasterContext.incidentName || 'Regional Alert'})
                  </p>
                )}
              </div>

              {/* DETERMINISTIC BASELINE PRIORITY EXPLANATION */}
              {person.baselinePriorityBreakdown && (
                <div className="p-3 bg-blue-50/50 dark:bg-blue-950/30 rounded-xl border border-blue-200 dark:border-blue-900/50 text-xs">
                  <div className="flex items-center justify-between font-bold text-blue-900 dark:text-blue-300 mb-1.5">
                    <span className="flex items-center gap-1">
                      <Activity className="h-3.5 w-3.5 text-blue-600" />
                      Baseline Priority Calculation Breakdown ({person.baselinePriorityBreakdown.score}/100)
                    </span>
                    <Badge variant="outline" className="text-[10px] border-blue-300 text-blue-800 dark:text-blue-300">
                      Standard Formula
                    </Badge>
                  </div>
                  <ul className="list-disc list-inside space-y-0.5 text-[11px] text-blue-800 dark:text-blue-300">
                    {person.baselinePriorityBreakdown.factors.map((f, idx) => (
                      <li key={idx}>{f}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>

          {/* ACTIVE AI POTENTIAL MATCH BANNER IF PENDING */}
          {pendingMatch && (
            <div className="p-4 bg-purple-50 dark:bg-purple-950/40 rounded-xl border border-purple-200 dark:border-purple-800/60 space-y-2">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-purple-600 animate-spin" />
                  <h5 className="font-bold text-sm text-purple-950 dark:text-purple-100">
                    Potential Field Sighting Match ({pendingMatch.similarityScore}% Similarity)
                  </h5>
                  <Badge variant="warning" className="text-[10px]">
                    Human Verification Required
                  </Badge>
                </div>
                {onReviewMatch && (
                  <Button 
                    size="sm" 
                    variant="primary" 
                    className="bg-purple-600 hover:bg-purple-700 text-white text-xs shrink-0"
                    onClick={() => onReviewMatch(pendingMatch)}
                  >
                    Open Side-by-Side Review Panel <ChevronRight className="h-3.5 w-3.5 ml-1" />
                  </Button>
                )}
              </div>
              <p className="text-xs text-purple-900 dark:text-purple-200">
                AI comparison identified strong attire and spatial correlation with Sighting #{pendingMatch.sightingId}. Awaiting human officer confirmation.
              </p>
            </div>
          )}

          {/* VERIFICATION DETAILS IF RESOLVED */}
          {person.verificationDetails && (
            <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl border border-emerald-200 dark:border-emerald-800/60 text-xs text-emerald-900 dark:text-emerald-200 space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-emerald-700 dark:text-emerald-400">
                <CheckCircle2 className="h-4 w-4" /> Official Officer Verification Confirmed
              </div>
              <p><strong>Verified By:</strong> {person.verificationDetails.verifiedBy} on {person.verificationDetails.verifiedAt}</p>
              <p><strong>Verification Notes:</strong> {person.verificationDetails.notes}</p>
            </div>
          )}

          {/* CASE TIMELINE */}
          <div>
            <h5 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-slate-100 flex items-center gap-2 mb-3">
              <Clock className="h-4 w-4 text-slate-500" />
              Case Timeline & Audit Trail
            </h5>

            <div className="relative border-l-2 border-slate-200 dark:border-slate-800 ml-3 pl-4 space-y-4">
              {person.timeline && person.timeline.length > 0 ? (
                person.timeline.map((evt) => (
                  <div key={evt.id} className="relative group">
                    {/* TIMELINE ICON DOT */}
                    <div className={`absolute -left-[23px] top-1 h-3.5 w-3.5 rounded-full border-2 border-white dark:border-slate-900 ${
                      evt.type === 'STATUS_CHANGE'
                        ? 'bg-emerald-500'
                        : evt.type === 'AI_ANALYSIS'
                        ? 'bg-purple-500'
                        : evt.type === 'SIGHTING'
                        ? 'bg-blue-500'
                        : evt.type === 'HUMAN_REVIEW'
                        ? 'bg-amber-500'
                        : 'bg-slate-400'
                    }`} />
                    
                    <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1 mb-0.5">
                      <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
                        {evt.action}
                      </span>
                      <span className="text-[11px] text-slate-400 font-mono">
                        {evt.timestamp} • By {evt.actor}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-400">
                      {evt.description}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-400">No events logged yet.</p>
              )}
            </div>
          </div>

        </div>

        {/* MODAL FOOTER */}
        <div className="px-6 py-3 border-t border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-950/60 shrink-0">
          <span className="text-xs text-slate-500 font-medium">
            SAHAYAK Mission Protocol • Confidentiality Grade II
          </span>
          <Button variant="outline" size="sm" onClick={onClose}>
            Close Case File
          </Button>
        </div>

      </div>
    </div>
  );
}
