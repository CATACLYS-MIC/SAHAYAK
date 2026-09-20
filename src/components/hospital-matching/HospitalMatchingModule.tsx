import React, { useState } from 'react';
import { Card, Badge, Button } from '@/components/ui';
import { 
  Stethoscope, ShieldAlert, Sparkles, Building2, UserCheck, 
  CheckCircle2, XCircle, HelpCircle, Eye, Search, Filter, 
  Layers, FileText, Lock, RefreshCw, AlertTriangle, ArrowUpRight, Scale, Info
} from 'lucide-react';
import { useAppState } from '@/lib/store';
import { HospitalMatchResult, HospitalPatientRecord, MissingPerson } from '@/types';
import { HospitalSideBySideReviewModal } from './HospitalSideBySideReviewModal';
import { HospitalSingleSubmissionForm } from './HospitalSingleSubmissionForm';
import { HospitalBatchProcessor } from './HospitalBatchProcessor';
import { cn } from '@/lib/utils';

export function HospitalMatchingModule() {
  const { 
    hospitalPatients, 
    hospitalMatches, 
    hospitalAuditLogs, 
    hospitalMatchingStats,
    hospitalAccessRole,
    setHospitalAccessRole,
    missingPersons,
    reviewHospitalMatch,
    resetHospitalDemoData
  } = useAppState();

  const [activeMainTab, setActiveMainTab] = useState<'MATCHES' | 'SUBMIT' | 'REGISTRY' | 'AUDIT'>('MATCHES');
  const [submissionSubTab, setSubmissionSubTab] = useState<'SINGLE' | 'BATCH'>('SINGLE');
  const [confidenceFilter, setConfidenceFilter] = useState<'ALL' | 'HIGH' | 'PENDING' | 'CONFIRMED'>('ALL');
  const [selectedMatchForReview, setSelectedMatchForReview] = useState<HospitalMatchResult | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Find match pair details for the active modal
  const activePatient = selectedMatchForReview 
    ? hospitalPatients.find(p => p.id === selectedMatchForReview.patientId) || {
        id: selectedMatchForReview.patientId,
        mrn: selectedMatchForReview.patientMrn,
        hospitalName: selectedMatchForReview.hospitalName,
        ward: 'Trauma Unit',
        admissionDateTime: '2026-09-11',
        foundLocation: selectedMatchForReview.foundLocation,
        approximateAge: 'Unknown',
        sex: 'UNKNOWN',
        clothingAppearance: 'Cataloged at hospital',
        submittedAt: 'Recent',
        status: 'ANALYZED',
        potentialMatchesCount: 1,
        isSimulated: true,
      } as unknown as HospitalPatientRecord
    : null;

  const activeMissingPerson = selectedMatchForReview
    ? missingPersons.find(p => p.id === selectedMatchForReview.missingPersonId) || {
        id: selectedMatchForReview.missingPersonId,
        name: selectedMatchForReview.missingPersonName,
        age: 30,
        gender: 'Unknown',
        lastSeen: 'Disaster zone',
        lastKnownLocation: 'Disaster area',
        status: 'MISSING',
        priority: 'MEDIUM',
        timeline: [],
      } as unknown as MissingPerson
    : null;

  // Filter matches
  const filteredMatches = hospitalMatches.filter(m => {
    if (confidenceFilter === 'HIGH' && m.matchConfidence < 75) return false;
    if (confidenceFilter === 'PENDING' && m.status !== 'PENDING_HUMAN_REVIEW') return false;
    if (confidenceFilter === 'CONFIRMED' && m.status !== 'CONFIRMED_POSSIBLE_MATCH') return false;
    
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchText = `${m.patientMrn} ${m.hospitalName} ${m.missingPersonName} ${m.foundLocation}`.toLowerCase();
      return matchText.includes(q);
    }
    return true;
  });

  return (
    <div className="space-y-6">
      
      {/* 1. TOP AUTHORIZATION & PRIVACY FRAMEWORK HEADER */}
      <div className="bg-slate-900 text-white rounded-2xl p-5 sm:p-6 shadow-xl border border-slate-800 relative overflow-hidden">
        <div className="absolute -right-16 -top-16 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1.5 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="p-1.5 rounded-lg bg-teal-500/20 text-teal-400 border border-teal-500/30">
                <Stethoscope className="h-5 w-5" />
              </span>
              <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white">
                Hospital Missing-Person Matching Network
              </h1>
              <Badge variant="outline" className="text-[10px] font-bold bg-amber-500/20 text-amber-300 border-amber-500/40">
                SIMULATED DATA
              </Badge>
            </div>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Secure trauma clinical workflow enabling authorized Nepal hospitals to correlate unidentified disaster victims against national missing-person reports via AI multi-signal vector matching.
            </p>
          </div>

          {/* RBAC ROLE SWITCHER */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 bg-slate-800/80 p-3 rounded-xl border border-slate-700/80">
            <div className="text-xs">
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Authorized Access Level:</span>
              <select
                value={hospitalAccessRole}
                onChange={(e) => setHospitalAccessRole(e.target.value as any)}
                className="mt-0.5 bg-slate-900 border border-slate-700 text-teal-300 font-bold text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-teal-500"
              >
                <option value="HOSPITAL_STAFF">Authorized Hospital Staff (Trauma Desk)</option>
                <option value="AUTHORITY_RESPONDER">Disaster Verification Authority (Nepal Police / NDRRMA)</option>
                <option value="PUBLIC">Public Overview (Restricted Redaction)</option>
              </select>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={resetHospitalDemoData}
              className="text-slate-300 hover:text-white border-slate-700 hover:bg-slate-700 text-[11px] h-8 flex items-center gap-1 shrink-0"
            >
              <RefreshCw className="h-3 w-3" />
              Reset Demo
            </Button>
          </div>
        </div>

        {/* PRIVACY MANDATE BANNER */}
        <div className="mt-4 pt-4 border-t border-slate-800/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs text-slate-300">
          <div className="flex items-center gap-2">
            <Lock className="h-4 w-4 text-teal-400 shrink-0" />
            <span>
              <strong className="text-white">Privacy Protected:</strong> Clinical intake records are restricted to verified medical desks. Unnecessary medical diagnostics are redacted from correlation algorithms.
            </span>
          </div>
          <span className="text-[11px] font-mono text-teal-400/90">
            Protocol: MOHP-DISASTER-MIND-v2.6
          </span>
        </div>
      </div>

      {/* 2. STATS STRIP */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Patients Submitted
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-slate-100">
              {hospitalMatchingStats.patientsSubmitted}
            </span>
            <span className="text-xs text-slate-400">unidentified victims</span>
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-teal-200/80 dark:border-teal-900/60 shadow-xs">
          <span className="text-[11px] font-bold text-teal-700 dark:text-teal-400 uppercase tracking-wider">
            AI Matches Flagged
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl sm:text-3xl font-black text-teal-700 dark:text-teal-300">
              {hospitalMatchingStats.aiMatchesFlagged}
            </span>
            <span className="text-xs text-teal-600 dark:text-teal-400">similarity candidates</span>
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-amber-200/80 dark:border-amber-900/60 shadow-xs">
          <span className="text-[11px] font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider">
            Awaiting Verification
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl sm:text-3xl font-black text-amber-700 dark:text-amber-300">
              {hospitalMatchingStats.awaitingVerification}
            </span>
            <span className="text-xs text-amber-600 dark:text-amber-400">human review</span>
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-emerald-200/80 dark:border-emerald-900/60 shadow-xs">
          <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">
            Confirmed Matches
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl sm:text-3xl font-black text-emerald-700 dark:text-emerald-300">
              {hospitalMatchingStats.potentialMatchesConfirmed}
            </span>
            <span className="text-xs text-emerald-600 dark:text-emerald-400">reunited / treated</span>
          </div>
        </div>
      </div>

      {/* 3. ETHICAL GUARDRAIL CALLOUT */}
      <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 flex items-start gap-3">
        <Scale className="h-5 w-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
        <div className="text-xs text-amber-900 dark:text-amber-200 leading-relaxed">
          <strong className="font-bold">Human-in-the-Loop Operational Guardrail:</strong> The SAHAYAK AI system operates exclusively as an advisory decision-support instrument. The matching score indicates multi-variable feature correlation and never automatically declares identity. Verification and case resolution strictly require authorized clinician or authority confirmation.
        </div>
      </div>

      {/* 4. MAIN NAVIGATION TABS */}
      <div className="border-b border-slate-200 dark:border-slate-800 flex flex-wrap gap-2">
        <button
          onClick={() => setActiveMainTab('MATCHES')}
          className={cn(
            "px-4 py-2.5 text-xs font-bold border-b-2 flex items-center gap-2 transition-all",
            activeMainTab === 'MATCHES'
              ? "border-teal-600 text-teal-700 dark:text-teal-400 dark:border-teal-400 bg-teal-50/50 dark:bg-teal-950/20 rounded-t-lg"
              : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
          )}
        >
          <Sparkles className="h-4 w-4" />
          AI Match Center
          <Badge variant="primary" className="text-[10px] py-0 px-1.5 bg-teal-600 text-white">
            {hospitalMatches.length}
          </Badge>
        </button>

        <button
          onClick={() => setActiveMainTab('SUBMIT')}
          className={cn(
            "px-4 py-2.5 text-xs font-bold border-b-2 flex items-center gap-2 transition-all",
            activeMainTab === 'SUBMIT'
              ? "border-teal-600 text-teal-700 dark:text-teal-400 dark:border-teal-400 bg-teal-50/50 dark:bg-teal-950/20 rounded-t-lg"
              : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
          )}
        >
          <Building2 className="h-4 w-4" />
          Submit Unidentified Patients
        </button>

        <button
          onClick={() => setActiveMainTab('REGISTRY')}
          className={cn(
            "px-4 py-2.5 text-xs font-bold border-b-2 flex items-center gap-2 transition-all",
            activeMainTab === 'REGISTRY'
              ? "border-teal-600 text-teal-700 dark:text-teal-400 dark:border-teal-400 bg-teal-50/50 dark:bg-teal-950/20 rounded-t-lg"
              : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
          )}
        >
          <FileText className="h-4 w-4" />
          Patient Intake Registry
          <span className="text-[10px] text-slate-400 font-mono">({hospitalPatients.length})</span>
        </button>

        <button
          onClick={() => setActiveMainTab('AUDIT')}
          className={cn(
            "px-4 py-2.5 text-xs font-bold border-b-2 flex items-center gap-2 transition-all",
            activeMainTab === 'AUDIT'
              ? "border-teal-600 text-teal-700 dark:text-teal-400 dark:border-teal-400 bg-teal-50/50 dark:bg-teal-950/20 rounded-t-lg"
              : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
          )}
        >
          <UserCheck className="h-4 w-4" />
          Audit Trail & Governance
          <span className="text-[10px] text-slate-400 font-mono">({hospitalAuditLogs.length})</span>
        </button>
      </div>

      {/* 5. TAB CONTENT */}

      {/* TAB 1: AI MATCH CENTER */}
      {activeMainTab === 'MATCHES' && (
        <div className="space-y-4">
          
          {/* SEARCH & FILTER CONTROLS */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <div className="relative flex-1">
              <Search className="h-4 w-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Filter by patient MRN, missing person name, hospital, or recovery location..."
                className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-teal-500"
              />
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto text-xs">
              <span className="text-[11px] text-slate-500 font-bold uppercase shrink-0">Filter:</span>
              <button
                onClick={() => setConfidenceFilter('ALL')}
                className={cn(
                  "px-2.5 py-1 rounded-md text-[11px] font-bold transition-colors whitespace-nowrap",
                  confidenceFilter === 'ALL' 
                    ? "bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900" 
                    : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300"
                )}
              >
                All Matches ({hospitalMatches.length})
              </button>

              <button
                onClick={() => setConfidenceFilter('HIGH')}
                className={cn(
                  "px-2.5 py-1 rounded-md text-[11px] font-bold transition-colors whitespace-nowrap",
                  confidenceFilter === 'HIGH' 
                    ? "bg-teal-600 text-white" 
                    : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300"
                )}
              >
                High Confidence (75%+)
              </button>

              <button
                onClick={() => setConfidenceFilter('PENDING')}
                className={cn(
                  "px-2.5 py-1 rounded-md text-[11px] font-bold transition-colors whitespace-nowrap",
                  confidenceFilter === 'PENDING' 
                    ? "bg-amber-600 text-white" 
                    : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300"
                )}
              >
                Pending Review
              </button>

              <button
                onClick={() => setConfidenceFilter('CONFIRMED')}
                className={cn(
                  "px-2.5 py-1 rounded-md text-[11px] font-bold transition-colors whitespace-nowrap",
                  confidenceFilter === 'CONFIRMED' 
                    ? "bg-emerald-600 text-white" 
                    : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300"
                )}
              >
                Confirmed
              </button>
            </div>
          </div>

          {/* MATCHES LIST */}
          {filteredMatches.length > 0 ? (
            <div className="grid grid-cols-1 gap-4">
              {filteredMatches.map((match) => {
                const pat = hospitalPatients.find(p => p.id === match.patientId);
                const mis = missingPersons.find(p => p.id === match.missingPersonId);

                return (
                  <Card 
                    key={match.id}
                    className="p-4 sm:p-5 border-slate-200 dark:border-slate-800 hover:border-teal-400 dark:hover:border-teal-600 transition-colors"
                  >
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
                      
                      {/* SCORE & STATUS */}
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "w-14 h-14 rounded-xl flex flex-col items-center justify-center border font-black shrink-0",
                          match.matchConfidence >= 80 
                            ? "bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800"
                            : match.matchConfidence >= 60 
                            ? "bg-blue-50 text-blue-700 border-blue-300 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800"
                            : "bg-amber-50 text-amber-700 border-amber-300 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800"
                        )}>
                          <span className="text-xl leading-none">{match.matchConfidence}%</span>
                          <span className="text-[8px] uppercase tracking-wider font-bold mt-0.5">Match</span>
                        </div>

                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-mono font-bold text-teal-700 dark:text-teal-400">
                              MRN: {match.patientMrn}
                            </span>
                            <span className="text-slate-400">↔</span>
                            <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
                              Missing: {match.missingPersonName}
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                            {match.hospitalName} • Found: {match.foundLocation}
                          </p>
                        </div>
                      </div>

                      {/* STATUS BADGE & DOSSIER BUTTON */}
                      <div className="flex items-center gap-2">
                        <Badge 
                          variant={
                            match.status === 'CONFIRMED_POSSIBLE_MATCH' ? 'success' :
                            match.status === 'REJECTED' ? 'danger' :
                            match.status === 'NEEDS_FURTHER_VERIFICATION' ? 'warning' : 'outline'
                          }
                          className="text-[11px] font-bold"
                        >
                          {match.status === 'CONFIRMED_POSSIBLE_MATCH' && <CheckCircle2 className="h-3 w-3 mr-1" />}
                          {match.status === 'REJECTED' && <XCircle className="h-3 w-3 mr-1" />}
                          {match.status === 'NEEDS_FURTHER_VERIFICATION' && <HelpCircle className="h-3 w-3 mr-1" />}
                          {(match.status || '').replace(/_/g, ' ')}
                        </Badge>

                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => setSelectedMatchForReview(match)}
                          className="text-xs font-bold bg-teal-600 hover:bg-teal-700 text-white flex items-center gap-1.5 shadow-xs"
                        >
                          <Eye className="h-3.5 w-3.5" />
                          Review Side-by-Side Dossier
                        </Button>
                      </div>
                    </div>

                    {/* CORRELATION SUMMARY PREVIEW */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 text-xs">
                      
                      {/* Left: Why Flagged */}
                      <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800">
                        <span className="font-bold text-slate-700 dark:text-slate-300 block mb-1 flex items-center gap-1">
                          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                          Supporting Match Reasons:
                        </span>
                        <ul className="space-y-1 text-slate-600 dark:text-slate-400">
                          {match.whyFlagged.slice(0, 2).map((reason, i) => (
                            <li key={i} className="truncate">• {reason}</li>
                          ))}
                        </ul>
                      </div>

                      {/* Right: Contradictions or Verification Notes */}
                      <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800">
                        <span className="font-bold text-slate-700 dark:text-slate-300 block mb-1 flex items-center gap-1">
                          <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />
                          Contradictions / Verification Context:
                        </span>
                        {match.reviewedBy ? (
                          <div className="text-slate-600 dark:text-slate-400">
                            <strong>Reviewed by:</strong> {match.reviewedBy} on {match.reviewedAt}
                            <div className="text-[11px] text-slate-500 italic mt-0.5 truncate">"{match.reviewNotes}"</div>
                          </div>
                        ) : match.contradictions && match.contradictions.length > 0 ? (
                          <ul className="space-y-1 text-slate-600 dark:text-slate-400">
                            {match.contradictions.map((c, i) => (
                              <li key={i} className="truncate">• {c}</li>
                            ))}
                          </ul>
                        ) : (
                          <span className="text-slate-500 italic">No contradictions identified. Awaiting authorized clinical sign-off.</span>
                        )}
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          ) : (
            /* MANDATED EMPTY STATE */
            <div className="p-8 text-center rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
              <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto text-slate-400">
                <Search className="h-6 w-6" />
              </div>
              <div className="max-w-md mx-auto space-y-1">
                <h4 className="font-bold text-slate-800 dark:text-slate-200 text-sm">
                  No strong potential match found.
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  <strong>Note:</strong> This does not constitute proof that the person is not in the missing-person database; missing-person reports may still be pending or under investigation.
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => { setConfidenceFilter('ALL'); setSearchQuery(''); }}
                className="text-xs font-medium"
              >
                Clear Filters
              </Button>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: SUBMIT PATIENT RECORDS */}
      {activeMainTab === 'SUBMIT' && (
        <div className="space-y-4">
          <div className="flex items-center gap-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg w-fit">
            <button
              onClick={() => setSubmissionSubTab('SINGLE')}
              className={cn(
                "px-3 py-1.5 rounded-md text-xs font-bold transition-colors",
                submissionSubTab === 'SINGLE'
                  ? "bg-white dark:bg-slate-900 text-teal-700 dark:text-teal-400 shadow-xs"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
              )}
            >
              Single Patient Intake
            </button>
            <button
              onClick={() => setSubmissionSubTab('BATCH')}
              className={cn(
                "px-3 py-1.5 rounded-md text-xs font-bold transition-colors",
                submissionSubTab === 'BATCH'
                  ? "bg-white dark:bg-slate-900 text-teal-700 dark:text-teal-400 shadow-xs"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
              )}
            >
              Disaster Mass-Casualty Batch Upload
            </button>
          </div>

          {submissionSubTab === 'SINGLE' ? (
            <HospitalSingleSubmissionForm 
              onSubmitted={() => {
                setActiveMainTab('MATCHES');
              }}
            />
          ) : (
            <HospitalBatchProcessor 
              onBatchComplete={() => {
                setActiveMainTab('MATCHES');
              }}
            />
          )}
        </div>
      )}

      {/* TAB 3: PATIENT INTAKE REGISTRY */}
      {activeMainTab === 'REGISTRY' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
            <div>
              <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm">
                Unidentified Hospital Admissions Registry
              </h3>
              <p className="text-xs text-slate-500">
                Consolidated clinical log across Bir Hospital, Kanti Children's, TUTH, and field trauma centers
              </p>
            </div>
            <span className="text-xs font-mono text-slate-500">
              Total Records: {hospitalPatients.length}
            </span>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
            <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
              <thead className="bg-slate-50 dark:bg-slate-950 text-[11px] uppercase tracking-wider text-slate-600 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="py-3 px-4">MRN</th>
                  <th className="py-3 px-4">Hospital & Ward</th>
                  <th className="py-3 px-4">Found Location</th>
                  <th className="py-3 px-4">Demographics</th>
                  <th className="py-3 px-4">Clothing & Characteristics</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Potential Matches</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {hospitalPatients.map((pat) => (
                  <tr key={pat.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-950/40">
                    <td className="py-3 px-4 font-mono font-bold text-teal-700 dark:text-teal-400 whitespace-nowrap">
                      {pat.mrn}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900 dark:text-slate-100">{pat.hospitalName}</div>
                      <div className="text-[11px] text-slate-500">{pat.ward} • Adm: {pat.admissionDateTime}</div>
                    </td>
                    <td className="py-3 px-4 text-slate-600 dark:text-slate-400">
                      {pat.foundLocation}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      {pat.approximateAge} yrs • {pat.sex}
                    </td>
                    <td className="py-3 px-4 max-w-xs truncate text-slate-600 dark:text-slate-400" title={pat.clothingAppearance}>
                      {pat.clothingAppearance}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <Badge 
                        variant={
                          pat.status === 'MATCH_CONFIRMED' ? 'success' :
                          pat.status === 'ANALYZED' ? 'primary' : 'outline'
                        }
                        className="text-[10px]"
                      >
                        {(pat.status || '').replace(/_/g, ' ')}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-right font-bold font-mono">
                      {pat.potentialMatchesCount > 0 ? (
                        <span className="text-teal-600 dark:text-teal-400">
                          {pat.potentialMatchesCount} candidates
                        </span>
                      ) : (
                        <span className="text-slate-400">0</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: AUDIT TRAIL & GOVERNANCE */}
      {activeMainTab === 'AUDIT' && (
        <div className="space-y-4">
          <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
            <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm flex items-center gap-2">
              <ShieldAlert className="h-4 w-4 text-teal-600" />
              Immutable Verification Audit Trail
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Cryptographically signed timestamp record tracking patient intake, AI vector correlation scans, authorized human verification actions, and status updates.
            </p>
          </div>

          <div className="space-y-2">
            {hospitalAuditLogs.map((log) => (
              <div 
                key={log.id} 
                className="p-3 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
              >
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="font-mono text-[10px] text-teal-700 border-teal-300 dark:text-teal-300 dark:border-teal-700">
                      {log.action}
                    </Badge>
                    <span className="font-bold text-slate-900 dark:text-slate-100">
                      {log.actor}
                    </span>
                    <span className="text-slate-400 text-[11px]">({log.role})</span>
                  </div>
                  <p className="text-slate-600 dark:text-slate-400 text-[11px] leading-relaxed">
                    {log.details}
                  </p>
                </div>
                <div className="text-[11px] font-mono text-slate-400 shrink-0">
                  {log.timestamp}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SIDE-BY-SIDE REVIEW MODAL */}
      {selectedMatchForReview && activePatient && activeMissingPerson && (
        <HospitalSideBySideReviewModal
          match={selectedMatchForReview}
          patient={activePatient}
          missingPerson={activeMissingPerson}
          onClose={() => setSelectedMatchForReview(null)}
          onConfirm={(notes, reviewer) => {
            reviewHospitalMatch(selectedMatchForReview.id, 'CONFIRMED_POSSIBLE_MATCH', notes, reviewer);
          }}
          onReject={(notes, reviewer) => {
            reviewHospitalMatch(selectedMatchForReview.id, 'REJECTED', notes, reviewer);
          }}
          onRequestMoreInfo={(notes, reviewer) => {
            reviewHospitalMatch(selectedMatchForReview.id, 'NEEDS_FURTHER_VERIFICATION', notes, reviewer);
          }}
        />
      )}
    </div>
  );
}
