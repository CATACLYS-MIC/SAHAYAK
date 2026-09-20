import React, { useState, useMemo } from 'react';
import { Card, Badge } from '@/components/ui';
import { 
  Shield, ShieldAlert, ShieldCheck, ShieldQuestion, AlertTriangle, 
  Info, Clock, CheckCircle2, ChevronDown, ChevronRight, Check, 
  FileWarning, HelpCircle, ExternalLink, Search, Sparkles,
  CheckCheck, Newspaper
} from 'lucide-react';
import { useAppState } from '@/lib/store';
import { ClaimAnalysis, MisinfoVerdict } from '@/types';

function getVerdictIcon(verdict: MisinfoVerdict) {
  switch (verdict) {
    case 'VERIFIED': return <ShieldCheck className="h-6 w-6 text-emerald-500" />;
    case 'LIKELY TRUE': return <CheckCircle2 className="h-6 w-6 text-emerald-500" />;
    case 'MISLEADING': return <ShieldAlert className="h-6 w-6 text-orange-500" />;
    case 'CONFLICTING': return <AlertTriangle className="h-6 w-6 text-yellow-500" />;
    case 'LIKELY FALSE': return <FileWarning className="h-6 w-6 text-red-500" />;
    case 'OUTDATED': return <Clock className="h-6 w-6 text-slate-500" />;
    case 'UNVERIFIED':
    default: return <ShieldQuestion className="h-6 w-6 text-slate-400" />;
  }
}

function getVerdictColor(verdict: MisinfoVerdict) {
  switch (verdict) {
    case 'VERIFIED': return 'text-emerald-700 bg-emerald-50 border-emerald-200 dark:text-emerald-400 dark:bg-emerald-950/30 dark:border-emerald-800';
    case 'LIKELY TRUE': return 'text-emerald-600 bg-emerald-50 border-emerald-100 dark:text-emerald-400 dark:bg-emerald-950/20 dark:border-emerald-900';
    case 'MISLEADING': return 'text-orange-700 bg-orange-50 border-orange-200 dark:text-orange-400 dark:bg-orange-950/30 dark:border-orange-800';
    case 'CONFLICTING': return 'text-yellow-700 bg-yellow-50 border-yellow-200 dark:text-yellow-400 dark:bg-yellow-950/30 dark:border-yellow-800';
    case 'LIKELY FALSE': return 'text-red-700 bg-red-50 border-red-200 dark:text-red-400 dark:bg-red-950/30 dark:border-red-800';
    case 'OUTDATED': return 'text-slate-700 bg-slate-50 border-slate-200 dark:text-slate-300 dark:bg-slate-800/50 dark:border-slate-700';
    case 'UNVERIFIED':
    default: return 'text-slate-600 bg-slate-50 border-slate-200 dark:text-slate-400 dark:bg-slate-800/50 dark:border-slate-700';
  }
}

const PRESET_RUMORS = [
  { label: 'NASA 8.5 Earthquake', query: 'NASA predicted an 8.5 magnitude mega-earthquake will hit Kathmandu, Nepal tonight at 2:00 AM. Sleep outside!' },
  { label: 'Koshi Barrage Dam Burst', query: 'Emergency alert: The Koshi Barrage dam structure has collapsed under record floods. Immediate evacuation ordered for all downstream districts!' },
  { label: 'TIA Runway Submerged', query: 'Tribhuvan International Airport (TIA) runway is submerged under 4 feet of river water. All domestic and international flights canceled indefinitely!!' },
  { label: 'Red Cross Blood Scam', query: 'Emergency blood shortage at Central Red Cross Blood Bank: Call 98XXXXXXXX immediately to donate or send money for victims.' },
  { label: 'Melamchi Tunnel Burst', query: 'Melamchi drinking water tunnel burst open inside Shivapuri, impending flash tsunami heading towards Sundarijal and Bouddha!' },
  { label: 'Helicopter Spray Hoax', query: 'Nepal Army helicopters will spray chemical anti-disaster disinfectant over Kathmandu Valley tonight at 11:30 PM. Keep all windows shut!' },
];

export function MisinfoProtector({ initialClaimText }: { initialClaimText?: string } = {}) {
  const { analyzeClaim, claimAnalyses, updateHumanReviewStatus, userRole } = useAppState();
  const [inputText, setInputText] = useState(initialClaimText || '');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  React.useEffect(() => {
    if (initialClaimText) {
      setInputText(initialClaimText);
    }
  }, [initialClaimText]);
  const [currentAnalysis, setCurrentAnalysis] = useState<ClaimAnalysis | null>(null);
  const [expandedSection, setExpandedSection] = useState<'SUPPORTING' | 'CONTRADICTING' | 'UNKNOWN' | null>('CONTRADICTING');
  
  // Debunked Registry Search & Filters
  const [registrySearch, setRegistrySearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');

  const filteredRumors = useMemo(() => {
    return claimAnalyses.filter(item => {
      if (categoryFilter !== 'ALL' && item.category !== categoryFilter) {
        return false;
      }
      if (registrySearch.trim()) {
        const q = registrySearch.toLowerCase();
        const matchesText = item.originalText.toLowerCase().includes(q);
        const matchesExpl = item.explanation.toLowerCase().includes(q);
        const matchesDebunk = (item.debunkedBy || '').toLowerCase().includes(q);
        const matchesViral = (item.viralContext || '').toLowerCase().includes(q);
        return matchesText || matchesExpl || matchesDebunk || matchesViral;
      }
      return true;
    });
  }, [claimAnalyses, categoryFilter, registrySearch]);

  const handleAnalyze = async (textToAnalyze?: string) => {
    const text = textToAnalyze || inputText;
    if (!text.trim()) return;
    setIsAnalyzing(true);
    setCurrentAnalysis(null);
    try {
      const result = await analyzeClaim(text, []);
      setCurrentAnalysis(result);
    } catch (e) {
      console.error(e);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleClear = () => {
    setInputText('');
    setCurrentAnalysis(null);
  };

  const handleSelectPreset = (presetText: string) => {
    setInputText(presetText);
    handleAnalyze(presetText);
  };

  return (
    <div className="space-y-6">
      {/* Live Analysis Input Card */}
      <Card noPadding className="border-indigo-100 dark:border-indigo-900/30 overflow-hidden shadow-sm">
        <div className="bg-indigo-50/70 dark:bg-indigo-950/30 px-6 py-4 border-b border-indigo-100 dark:border-indigo-900/30 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-100 dark:bg-indigo-900/50 rounded-lg text-indigo-600 dark:text-indigo-400">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                Misinformation Protector & Rumor Debunker
                <Badge variant="outline" className="text-[10px] uppercase font-mono tracking-wider border-indigo-200 text-indigo-700 dark:text-indigo-300">
                  Live Web Grounded
                </Badge>
              </h3>
              <p className="text-xs text-slate-500">Cross-reference emergency claims against official Nepal agencies and certified fact-checkers</p>
            </div>
          </div>
        </div>
        
        <div className="p-6">
          <div className="space-y-4">
            <textarea
              className="w-full min-h-[110px] p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all resize-none text-sm placeholder:text-slate-400 text-slate-800 dark:text-slate-100"
              placeholder="Paste a viral disaster post, forward, or rumor to verify (e.g., dam breach, predicted earthquake, airport flood)..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
            />

            {/* Quick Presets */}
            <div>
              <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                Click to Test Documented Nepal Disaster Rumors:
              </div>
              <div className="flex flex-wrap gap-2">
                {PRESET_RUMORS.map(preset => (
                  <button
                    key={preset.label}
                    type="button"
                    onClick={() => handleSelectPreset(preset.query)}
                    className="text-xs font-medium px-2.5 py-1.5 rounded-md bg-slate-100 dark:bg-slate-800 hover:bg-indigo-100 dark:hover:bg-indigo-950/60 text-slate-700 dark:text-slate-300 hover:text-indigo-700 dark:hover:text-indigo-300 border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => handleAnalyze()}
                disabled={!inputText.trim() || isAnalyzing}
                className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-sm cursor-pointer"
              >
                {isAnalyzing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Searching Live Web & Fact Checkers...
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    Fact-Check Claim
                  </>
                )}
              </button>
              <button
                onClick={handleClear}
                disabled={isAnalyzing || (!inputText && !currentAnalysis)}
                className="px-4 py-2.5 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg font-medium text-sm transition-colors cursor-pointer"
              >
                Clear
              </button>
            </div>
          </div>
        </div>
      </Card>

      {/* Active Analysis Result */}
      {currentAnalysis && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {/* Verdict Banner */}
          <div className={`rounded-xl border p-5 flex items-start gap-4 ${getVerdictColor(currentAnalysis.verdict)}`}>
            <div className="shrink-0 mt-1 bg-white/60 dark:bg-black/20 p-2 rounded-full shadow-xs">
              {getVerdictIcon(currentAnalysis.verdict)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center justify-between gap-4 mb-2">
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-lg tracking-tight">{currentAnalysis.verdict}</h4>
                  {currentAnalysis.isRealDebunk && (
                    <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-600 text-white dark:bg-emerald-500/20 dark:text-emerald-300 border border-emerald-500/30">
                      Authoritative Debunk
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 bg-white/60 dark:bg-black/20 px-3 py-1 rounded-full text-xs font-semibold">
                  <span>Confidence:</span>
                  <span className={currentAnalysis.confidence > 80 ? 'text-emerald-700 dark:text-emerald-400 font-bold' : currentAnalysis.confidence > 50 ? 'text-yellow-700 dark:text-yellow-400 font-bold' : 'text-slate-700 dark:text-slate-400 font-bold'}>
                    {currentAnalysis.confidence}%
                  </span>
                </div>
              </div>

              {/* Debunked By / Official Citation */}
              {(currentAnalysis.debunkedBy || currentAnalysis.factCheckUrl) && (
                <div className="mb-3 p-2.5 rounded-lg bg-white/70 dark:bg-black/30 border border-current/10 flex flex-wrap items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-1.5 font-medium">
                    <CheckCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <span>Fact-Checked By:</span>
                    <strong className="font-semibold">{currentAnalysis.debunkedBy || 'Certified Fact-Checkers'}</strong>
                  </div>
                  {currentAnalysis.factCheckUrl && (
                    <a 
                      href={currentAnalysis.factCheckUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 font-semibold text-indigo-700 dark:text-indigo-300 hover:underline"
                    >
                      Official Fact-Check Record <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>
              )}

              <p className="text-sm opacity-95 leading-relaxed mb-4 font-normal">
                {currentAnalysis.explanation}
              </p>
              
              <div className="bg-white/50 dark:bg-black/20 rounded-lg p-3 text-sm flex items-start gap-2">
                <Info className="w-4 h-4 shrink-0 mt-0.5" />
                <div>
                  <span className="font-medium">Recommended Civil Action: </span>
                  {(currentAnalysis.recommendedAction || '').replace(/_/g, ' ')}
                </div>
              </div>
            </div>
          </div>

          {/* Evidence Breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Contradicting */}
            <Card noPadding className={`border-red-100 dark:border-red-900/30 overflow-hidden ${expandedSection === 'CONTRADICTING' ? 'ring-2 ring-red-500/20' : ''}`}>
              <button 
                onClick={() => setExpandedSection(expandedSection === 'CONTRADICTING' ? null : 'CONTRADICTING')}
                className="w-full bg-red-50/60 dark:bg-red-950/20 px-4 py-3 flex items-center justify-between hover:bg-red-50 dark:hover:bg-red-900/40 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <FileWarning className="w-4 h-4 text-red-600 dark:text-red-400" />
                  <span className="text-sm font-semibold text-red-900 dark:text-red-300">Refuting Evidence</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300 px-2 py-0.5 rounded-full font-medium">
                    {currentAnalysis.contradictingEvidence.length}
                  </span>
                  {expandedSection === 'CONTRADICTING' ? <ChevronDown className="w-4 h-4 text-red-500" /> : <ChevronRight className="w-4 h-4 text-red-500" />}
                </div>
              </button>
              {expandedSection === 'CONTRADICTING' && (
                <div className="p-4 space-y-2.5">
                  {currentAnalysis.contradictingEvidence.length === 0 ? (
                    <p className="text-xs text-slate-500 italic">No refuting evidence found.</p>
                  ) : (
                    currentAnalysis.contradictingEvidence.map((evidence, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-xs text-slate-700 dark:text-slate-300">
                        <span className="text-red-500 font-bold shrink-0">•</span>
                        <span>{evidence}</span>
                      </div>
                    ))
                  )}
                </div>
              )}
            </Card>

            {/* Supporting */}
            <Card noPadding className={`border-emerald-100 dark:border-emerald-900/30 overflow-hidden ${expandedSection === 'SUPPORTING' ? 'ring-2 ring-emerald-500/20' : ''}`}>
              <button 
                onClick={() => setExpandedSection(expandedSection === 'SUPPORTING' ? null : 'SUPPORTING')}
                className="w-full bg-emerald-50/60 dark:bg-emerald-950/20 px-4 py-3 flex items-center justify-between hover:bg-emerald-50 dark:hover:bg-emerald-900/40 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span className="text-sm font-semibold text-emerald-900 dark:text-emerald-300">Supporting Context</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 px-2 py-0.5 rounded-full font-medium">
                    {currentAnalysis.supportingEvidence.length}
                  </span>
                  {expandedSection === 'SUPPORTING' ? <ChevronDown className="w-4 h-4 text-emerald-500" /> : <ChevronRight className="w-4 h-4 text-emerald-500" />}
                </div>
              </button>
              {expandedSection === 'SUPPORTING' && (
                <div className="p-4 space-y-2.5">
                  {currentAnalysis.supportingEvidence.length === 0 ? (
                    <p className="text-xs text-slate-500 italic">No supporting evidence identified.</p>
                  ) : (
                    currentAnalysis.supportingEvidence.map((evidence, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-xs text-slate-700 dark:text-slate-300">
                        <span className="text-emerald-500 font-bold shrink-0">•</span>
                        <span>{evidence}</span>
                      </div>
                    ))
                  )}
                </div>
              )}
            </Card>

            {/* Unknowns */}
            <Card noPadding className={`border-slate-200 dark:border-slate-800 overflow-hidden ${expandedSection === 'UNKNOWN' ? 'ring-2 ring-slate-400/20' : ''}`}>
              <button 
                onClick={() => setExpandedSection(expandedSection === 'UNKNOWN' ? null : 'UNKNOWN')}
                className="w-full bg-slate-50 dark:bg-slate-900 px-4 py-3 flex items-center justify-between hover:bg-slate-100 dark:hover:bg-slate-800/40 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <HelpCircle className="w-4 h-4 text-slate-500" />
                  <span className="text-sm font-semibold text-slate-900 dark:text-slate-300">Gaps / Unknowns</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-2 py-0.5 rounded-full font-medium">
                    {currentAnalysis.unknowns.length}
                  </span>
                  {expandedSection === 'UNKNOWN' ? <ChevronDown className="w-4 h-4 text-slate-500" /> : <ChevronRight className="w-4 h-4 text-slate-500" />}
                </div>
              </button>
              {expandedSection === 'UNKNOWN' && (
                <div className="p-4 space-y-2.5">
                  {currentAnalysis.unknowns.length === 0 ? (
                    <p className="text-xs text-slate-500 italic">No data gaps flagged.</p>
                  ) : (
                    currentAnalysis.unknowns.map((unknown, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-xs text-slate-700 dark:text-slate-300">
                        <span className="text-slate-400 font-bold shrink-0">•</span>
                        <span>{unknown}</span>
                      </div>
                    ))
                  )}
                </div>
              )}
            </Card>
          </div>

          {/* Sources Used */}
          {currentAnalysis.sources && currentAnalysis.sources.length > 0 && (
            <Card noPadding className="border-slate-200 dark:border-slate-800 overflow-hidden">
              <div className="px-6 py-3.5 bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 flex items-center gap-2">
                  <Newspaper className="w-3.5 h-3.5" />
                  Investigated Sources & Authorities ({currentAnalysis.sources.length})
                </span>
              </div>
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {currentAnalysis.sources.map(source => (
                  <div key={source.id} className="p-4 flex flex-col sm:flex-row items-start justify-between gap-4">
                    <div className="sm:w-1/3">
                      <div className="font-semibold text-sm text-slate-800 dark:text-slate-200">
                        {source.name}
                      </div>
                      <div className="text-xs text-slate-500 mt-0.5">
                        {source.publisher}
                      </div>
                      <div className="mt-2 inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                        Reliability: {source.reliabilityLevel}
                      </div>
                    </div>
                    <div className="sm:w-2/3">
                      <div className="text-xs text-slate-600 dark:text-slate-300 mb-2 leading-relaxed">
                        {source.contentSummary}
                      </div>
                      <div className="text-[11px] flex items-center gap-4 text-slate-500">
                        <span>Relationship: 
                          <span className={`ml-1 font-semibold ${
                            source.relationship === 'SUPPORTING' ? 'text-emerald-600 dark:text-emerald-400' :
                            source.relationship === 'CONTRADICTING' ? 'text-red-600 dark:text-red-400' : 'text-slate-600'
                          }`}>
                            {source.relationship}
                          </span>
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Human Review Actions */}
          {userRole === 'RESPONDER' && currentAnalysis.humanReviewStatus !== 'REVIEWED' && (
            <div className="flex justify-end pt-2">
              <button 
                onClick={() => {
                  updateHumanReviewStatus(currentAnalysis.id, 'REVIEWED');
                  setCurrentAnalysis({ ...currentAnalysis, humanReviewStatus: 'REVIEWED' });
                }}
                className="text-xs font-medium text-indigo-600 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-md transition-colors cursor-pointer"
              >
                Mark as Human Reviewed
              </button>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* AUTHENTIC DEBUNKED RUMORS REGISTRY (REAL DOCUMENTED CASES IN NEPAL)      */}
      {/* ========================================================================= */}
      <div className="mt-8 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-red-500" />
              Verified Debunked Rumors Registry
              <Badge variant="critical" className="text-[10px] font-mono uppercase">
                Real Nepal Hoaxes
              </Badge>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Documented disaster hoaxes investigated and refuted by certified fact-checkers and government agencies
            </p>
          </div>

          {/* Search bar */}
          <div className="relative w-full md:w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search rumors, sources..."
              value={registrySearch}
              onChange={(e) => setRegistrySearch(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex flex-wrap items-center gap-2">
          {['ALL', 'EARTHQUAKE', 'FLOOD', 'AVIATION', 'MEDICAL_RELIEF', 'INFRASTRUCTURE', 'GENERAL'].map(cat => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`text-xs px-3 py-1 rounded-full font-medium transition-colors cursor-pointer ${
                categoryFilter === cat 
                  ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900' 
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {cat.replace(/_/g, ' ')}
            </button>
          ))}
        </div>

        {/* Rumor Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredRumors.map(rumor => (
            <Card 
              key={rumor.id} 
              className="hover:border-indigo-300 dark:hover:border-indigo-800 transition-all flex flex-col justify-between"
            >
              <div className="space-y-3">
                {/* Header row */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className={`text-[11px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
                      rumor.verdict === 'LIKELY FALSE' ? 'bg-red-100 text-red-800 dark:bg-red-950/50 dark:text-red-300' :
                      rumor.verdict === 'MISLEADING' ? 'bg-orange-100 text-orange-800 dark:bg-orange-950/50 dark:text-orange-300' :
                      'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300'
                    }`}>
                      {rumor.verdict}
                    </span>
                    {rumor.category && (
                      <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                        {rumor.category}
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] text-slate-400 font-mono">
                    {rumor.confidence}% Confidence
                  </span>
                </div>

                {/* Rumor statement */}
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 leading-snug">
                    "{rumor.originalText}"
                  </h4>
                  {rumor.viralContext && (
                    <div className="mt-1 text-[11px] text-amber-700 dark:text-amber-400 font-medium">
                      Viral Context: {rumor.viralContext}
                    </div>
                  )}
                </div>

                {/* Fact check explanation */}
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed line-clamp-3">
                  {rumor.explanation}
                </p>

                {/* Debunked by agency */}
                <div className="p-2.5 rounded-md bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 text-[11px] space-y-1">
                  <div className="flex items-center justify-between gap-1 text-slate-600 dark:text-slate-400">
                    <span className="font-semibold flex items-center gap-1">
                      <CheckCheck className="w-3.5 h-3.5 text-emerald-500" />
                      Refuted By:
                    </span>
                    <span className="font-medium text-slate-800 dark:text-slate-200">
                      {rumor.debunkedBy || 'Official Authorities'}
                    </span>
                  </div>
                  {rumor.factCheckUrl && (
                    <div className="text-right">
                      <a 
                        href={rumor.factCheckUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-[10px] font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
                      >
                        Visit Fact-Check Agency <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  )}
                </div>
              </div>

              {/* Action footer */}
              <div className="pt-3 mt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <span className="text-[11px] text-slate-400">
                  Action: {(rumor.recommendedAction || '').replace(/_/g, ' ')}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setInputText(rumor.originalText);
                    setCurrentAnalysis(rumor);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 flex items-center gap-1 cursor-pointer"
                >
                  Inspect Analysis <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
