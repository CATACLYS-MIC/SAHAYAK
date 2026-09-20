import React, { useState } from 'react';
import { Card, Badge, Button } from '@/components/ui';
import { MissingPerson, Sighting, CandidateMatch } from '@/types';
import { 
  CheckCircle2, XCircle, HelpCircle, Sparkles, MapPin, Clock, 
  ArrowRight, ShieldAlert, ArrowLeftRight, User, AlertTriangle, FileText
} from 'lucide-react';

interface MatchReviewPanelProps {
  match: CandidateMatch;
  person: MissingPerson;
  sighting: Sighting;
  onConfirm: (matchId: string, notes?: string, verifiedStatus?: 'FOUND' | 'SAFE' | 'HOSPITALIZED' | 'IN SHELTER') => void;
  onReject: (matchId: string, reason?: string) => void;
  onRequestMoreInfo: (matchId: string, notes?: string) => void;
  onClose: () => void;
  userRole: 'PUBLIC' | 'RESPONDER';
}

export function MatchReviewPanel({
  match,
  person,
  sighting,
  onConfirm,
  onReject,
  onRequestMoreInfo,
  onClose,
  userRole
}: MatchReviewPanelProps) {
  const [officerNotes, setOfficerNotes] = useState('');
  const [targetStatus, setTargetStatus] = useState<'FOUND' | 'SAFE' | 'HOSPITALIZED' | 'IN SHELTER'>('FOUND');
  const [actionInProgress, setActionInProgress] = useState(false);

  const handleConfirm = () => {
    setActionInProgress(true);
    onConfirm(match.id, officerNotes, targetStatus);
    onClose();
  };

  const handleReject = () => {
    setActionInProgress(true);
    onReject(match.id, officerNotes || 'Physical and apparel features contradict reported case file upon officer inspection.');
    onClose();
  };

  const handleRequestInfo = () => {
    setActionInProgress(true);
    onRequestMoreInfo(match.id, officerNotes || 'Field verification unit requested family cross-reference and photo corroboration.');
    onClose();
  };

  const isResolved = match.status === 'VERIFIED_MATCH' || match.status === 'REJECTED';

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-6xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[94vh]">
        
        {/* HEADER */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-950/70 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-400">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  Human Verification Desk: Candidate Sighting Evaluation
                </h3>
                <Badge variant="outline" className="text-[10px]">
                  Match ID: {match.id}
                </Badge>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Role: Human-in-the-Loop decision enforcement. AI provides analytical reasoning; human officer confirms or rejects.
              </p>
            </div>
          </div>

          <Button variant="ghost" size="sm" onClick={onClose}>
            ✕ Close
          </Button>
        </div>

        {/* 3-COLUMN SIDE-BY-SIDE REVIEW BODY */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* LEFT COLUMN: MISSING PERSON PROFILE */}
            <div className="lg:col-span-4 bg-slate-50 dark:bg-slate-950/50 p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Missing Person Record
                </span>
                <Badge variant={person.urgency === 'CRITICAL' ? 'critical' : 'warning'}>
                  {person.status}
                </Badge>
              </div>

              <div className="aspect-[4/3] rounded-lg bg-slate-200 dark:bg-slate-800 overflow-hidden relative">
                {person.photo ? (
                  <img src={person.photo} alt={person.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-400">
                    <User className="h-12 w-12 stroke-[1.5]" />
                  </div>
                )}
              </div>

              <div>
                <h4 className="font-bold text-base text-slate-900 dark:text-white">{person.name}</h4>
                <p className="text-xs text-slate-500">Age {person.age} • {person.gender}</p>
              </div>

              <div className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
                <p>
                  <strong className="text-slate-900 dark:text-slate-100 block mb-0.5">Last Known Coordinate:</strong>
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5 text-red-500" /> {person.lastKnownLocation}
                  </span>
                </p>

                <p>
                  <strong className="text-slate-900 dark:text-slate-100 block mb-0.5">Reported Attire:</strong>
                  <span className="p-2 bg-white dark:bg-slate-900 rounded border border-slate-200 dark:border-slate-800 block">
                    {person.clothing}
                  </span>
                </p>

                <p>
                  <strong className="text-slate-900 dark:text-slate-100 block mb-0.5">Key Description:</strong>
                  <span>{person.description}</span>
                </p>
              </div>
            </div>

            {/* CENTER COLUMN: AI SIMILARITY & REASONING */}
            <div className="lg:col-span-4 bg-purple-50/40 dark:bg-purple-950/20 p-5 rounded-xl border border-purple-200 dark:border-purple-800/60 space-y-4">
              <div className="flex items-center justify-between border-b border-purple-200 dark:border-purple-800/40 pb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-purple-700 dark:text-purple-400 flex items-center gap-1.5">
                  <Sparkles className="h-4 w-4" /> AI Comparative Analysis
                </span>
                <span className="text-[10px] text-slate-500 font-mono">
                  Engine: {match.analyzedBy}
                </span>
              </div>

              {/* SIMILARITY METER */}
              <div className="text-center py-2 bg-white dark:bg-slate-900 rounded-xl border border-purple-200 dark:border-purple-900/50 shadow-sm">
                <span className="text-[11px] uppercase font-bold text-slate-500 tracking-wider">
                  Similarity Confidence
                </span>
                <div className="text-4xl font-black text-purple-600 dark:text-purple-400 my-1">
                  {match.similarityScore}%
                </div>
                <Badge variant={match.similarityScore >= 75 ? 'warning' : 'outline'} className="text-[10px]">
                  {match.matchAssessment}
                </Badge>
              </div>

              {/* SUPPORTING EVIDENCE */}
              <div className="space-y-1.5 text-xs">
                <span className="font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="h-3.5 w-3.5" /> Supporting Factors:
                </span>
                <ul className="space-y-1 pl-1">
                  {match.supportingEvidence.map((factor, idx) => (
                    <li key={idx} className="text-emerald-900 dark:text-emerald-200 text-[11px] flex items-start gap-1.5 bg-emerald-50/60 dark:bg-emerald-950/30 p-1.5 rounded border border-emerald-100 dark:border-emerald-900/40">
                      <span className="text-emerald-600 font-bold">•</span>
                      <span>{factor}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* CONTRADICTING EVIDENCE */}
              <div className="space-y-1.5 text-xs">
                <span className="font-bold text-amber-700 dark:text-amber-400 flex items-center gap-1">
                  <AlertTriangle className="h-3.5 w-3.5" /> Contradicting / Gaps:
                </span>
                <ul className="space-y-1 pl-1">
                  {match.contradictingEvidence.map((gap, idx) => (
                    <li key={idx} className="text-amber-900 dark:text-amber-200 text-[11px] flex items-start gap-1.5 bg-amber-50/60 dark:bg-amber-950/30 p-1.5 rounded border border-amber-100 dark:border-amber-900/40">
                      <span className="text-amber-600 font-bold">•</span>
                      <span>{gap}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* SPATIAL & TEMPORAL RELATIONSHIPS */}
              <div className="p-2.5 bg-white dark:bg-slate-900 rounded-lg border border-purple-100 dark:border-purple-900/40 text-[11px] space-y-1">
                <p>
                  <strong className="text-slate-800 dark:text-slate-200">Location Relation:</strong> {match.locationRelationship}
                </p>
                <p>
                  <strong className="text-slate-800 dark:text-slate-200">Time Sequence:</strong> {match.timeRelationship}
                </p>
              </div>

              <div className="text-[11px] font-semibold text-purple-800 dark:text-purple-300 text-center bg-purple-100/50 dark:bg-purple-900/30 p-2 rounded">
                ⚠️ {match.recommendation}
              </div>
            </div>

            {/* RIGHT COLUMN: SIGHTING RECORD */}
            <div className="lg:col-span-4 bg-slate-50 dark:bg-slate-950/50 p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Field Sighting Report
                </span>
                <Badge variant={sighting.status === 'VERIFIED' ? 'success' : sighting.status === 'REJECTED' ? 'danger' : 'info'}>
                  {sighting.status}
                </Badge>
              </div>

              <div className="aspect-[4/3] rounded-lg bg-slate-200 dark:bg-slate-800 overflow-hidden relative">
                {sighting.photo ? (
                  <img src={sighting.photo} alt="Sighting photo" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-slate-400">
                    <User className="h-12 w-12 stroke-[1.5]" />
                    <span className="text-[10px] mt-1 uppercase font-semibold">Field Photo / Observed</span>
                  </div>
                )}
              </div>

              <div>
                <h4 className="font-bold text-base text-slate-900 dark:text-white">
                  {sighting.facilityName || sighting.location}
                </h4>
                <p className="text-xs text-slate-500">
                  Logged: {sighting.timestamp} • By {sighting.reporter}
                </p>
              </div>

              <div className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
                <p>
                  <strong className="text-slate-900 dark:text-slate-100 block mb-0.5">Sighting Facility / Point:</strong>
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5 text-blue-500" /> {sighting.location}
                  </span>
                </p>

                <p>
                  <strong className="text-slate-900 dark:text-slate-100 block mb-0.5">Observed Attire:</strong>
                  <span className="p-2 bg-white dark:bg-slate-900 rounded border border-slate-200 dark:border-slate-800 block">
                    {sighting.clothing || 'Clothing not detailed in field report'}
                  </span>
                </p>

                <p>
                  <strong className="text-slate-900 dark:text-slate-100 block mb-0.5">Witness / Triage Notes:</strong>
                  <span>{sighting.description}</span>
                </p>
              </div>
            </div>

          </div>

          {/* OFFICER VERIFICATION ACTION CONSOLE */}
          <div className="p-5 bg-slate-100 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h4 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                  <ShieldAlert className="h-4 w-4 text-blue-600" />
                  Officer Decision Console & Audit Record
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  Confirming a match updates the central missing-person registry, notifies field rescue teams, and establishes an immutable verification trail.
                </p>
              </div>

              {/* OUTCOME TARGET SELECTION */}
              {!isResolved && (
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">Target Status:</span>
                  <select 
                    value={targetStatus} 
                    onChange={(e) => setTargetStatus(e.target.value as any)}
                    className="text-xs font-semibold bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded px-2.5 py-1 text-slate-900 dark:text-slate-100"
                  >
                    <option value="FOUND">FOUND (Safe / General)</option>
                    <option value="IN SHELTER">IN SHELTER (Relief Camp)</option>
                    <option value="HOSPITALIZED">HOSPITALIZED (Medical Care)</option>
                    <option value="SAFE">SAFE (Reunited)</option>
                  </select>
                </div>
              )}
            </div>

            {/* OFFICER VERIFICATION NOTES INPUT */}
            {!isResolved ? (
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500 block">
                  Mandatory Verification Notes / Justification:
                </label>
                <textarea
                  value={officerNotes}
                  onChange={(e) => setOfficerNotes(e.target.value)}
                  placeholder="Record officer observations, family contact confirmation, or specific reasons for confirming / rejecting this lead..."
                  className="w-full text-xs p-3 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 min-h-[65px] placeholder:text-slate-400"
                />
              </div>
            ) : (
              <div className="p-3 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 text-xs">
                <p><strong>Review Status:</strong> <Badge variant={match.status === 'VERIFIED_MATCH' ? 'success' : 'danger'}>{match.status}</Badge></p>
                <p className="mt-1"><strong>Reviewed By:</strong> {match.reviewedBy} at {match.reviewedAt}</p>
                <p className="mt-1 text-slate-600 dark:text-slate-400"><strong>Notes:</strong> {match.reviewNotes}</p>
              </div>
            )}

            {/* ACTION BUTTONS */}
            {!isResolved && (
              <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-1">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleRequestInfo}
                  disabled={actionInProgress}
                  className="w-full sm:w-auto text-xs"
                >
                  <HelpCircle className="h-4 w-4 mr-1.5 text-blue-500" />
                  Request More Info
                </Button>

                <Button 
                  variant="danger" 
                  size="sm"
                  onClick={handleReject}
                  disabled={actionInProgress}
                  className="w-full sm:w-auto text-xs bg-red-600 hover:bg-red-700 text-white"
                >
                  <XCircle className="h-4 w-4 mr-1.5" />
                  Reject Match (Contradicting Lead)
                </Button>

                <Button 
                  variant="primary" 
                  size="sm"
                  onClick={handleConfirm}
                  disabled={actionInProgress}
                  className="w-full sm:w-auto text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
                >
                  <CheckCircle2 className="h-4 w-4 mr-1.5" />
                  Confirm Match & Update Case File
                </Button>
              </div>
            )}

          </div>

        </div>

      </div>
    </div>
  );
}
