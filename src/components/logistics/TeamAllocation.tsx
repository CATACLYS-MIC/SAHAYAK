import React from 'react';
import { Card, Badge, Button } from '@/components/ui';
import { cn } from '@/lib/utils';
import { useAppState } from '@/lib/store';
import { Target, CheckCircle, Users } from 'lucide-react';
import { MOCK_VOLUNTEER_ALLOCATION_RECOMMENDATIONS } from '@/data/logisticsData';

export function TeamAllocation() {
  
  const { teams, coverageGaps, assignTeamArea } = useAppState();
  const [recommendations, setRecommendations] = React.useState<any[]>(MOCK_VOLUNTEER_ALLOCATION_RECOMMENDATIONS);
  const [isGenerating, setIsGenerating] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  
  const [approvedIds, setApprovedIds] = React.useState<Set<string>>(new Set());

  const handleApprove = (rec: any) => {
    setApprovedIds(prev => new Set(prev).add(rec.id));
    if (assignTeamArea && rec.candidateId) {
      assignTeamArea(
        rec.candidateId,
        rec.targetLocationId || 'loc-2',
        rec.suggestedLocationName,
        `AI Optimized Deployment: ${rec.targetRole}`
      );
    }
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    setError(null);
    try {
      const response = await fetch('/api/logistics/team-recommendations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          teams: teams.filter(t => t.status === 'AVAILABLE' || t.status === 'STANDBY'),
          coverageGaps: coverageGaps
        })
      });
      const data = await response.json();
      
      if (data.success && data.recommendations) {
        setRecommendations(data.recommendations);
      } else {
        throw new Error('Failed to generate plan');
      }
    } catch (err) {
      console.error("AI Gen Error:", err);
      setError('Could not connect to AI Engine. Please check your API key.');
    } finally {
      setIsGenerating(false);
    }
  };


  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
        <h3 className="text-xl font-bold flex items-center text-slate-900 dark:text-slate-100">
          <Target className="mr-2 h-5 w-5 text-fuchsia-600 dark:text-fuchsia-400" />
          AI Team Allocation
        </h3>
        <div className="flex items-center">
          {error && <span className="text-red-500 text-sm mr-4">{error}</span>}
          <Button size="sm" variant="outline" onClick={handleGenerate} disabled={isGenerating}>
            <Target className={isGenerating ? "h-4 w-4 mr-2 animate-pulse" : "h-4 w-4 mr-2"} /> 
            {isGenerating ? "Analyzing Gaps..." : "Auto-Allocate Teams"}
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        {recommendations.map(rec => (
          <Card key={rec.id} className={cn("overflow-hidden border-l-4", approvedIds.has(rec.id) ? "border-l-emerald-500" : "border-l-fuchsia-500")}>
            <div className="p-4 sm:p-5 flex flex-col md:flex-row gap-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/30">
              <div className="flex-1">
                <p className="text-[10px] font-bold uppercase text-slate-500 mb-1">Incident Location</p>
                <h4 className="font-bold text-slate-900 dark:text-slate-100 text-lg">{rec.suggestedLocationName}</h4>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mt-1">Target Role: {rec.targetRole}</p>
              </div>
              <div className="md:w-1/3">
                <p className="text-[10px] font-bold uppercase text-slate-500 mb-1">Recommended Team</p>
                <p className="font-bold text-fuchsia-700 dark:text-fuchsia-400 flex items-center gap-2">
                  <Users className="h-4 w-4" /> {rec.candidateName}
                </p>
                <p className="text-xs text-slate-500 mt-1">{rec.currentStatus}</p>
              </div>
              <div className="md:w-32 text-right">
                <span className="text-xs font-bold text-slate-500 uppercase block mb-1">Confidence</span>
                <span className="text-xl font-bold text-slate-800 dark:text-slate-200">{rec.confidence}%</span>
              </div>
            </div>
            
            <div className="p-4 sm:p-5">
              <h5 className="text-xs font-bold uppercase text-slate-500 mb-2">Required Skills</h5>
              <div className="flex flex-wrap gap-2 mb-4">
                {rec.requiredSkills.map(skill => (
                  <Badge key={skill} variant="outline" className="text-xs font-normal bg-fuchsia-50 dark:bg-fuchsia-900/10 text-fuchsia-700 dark:text-fuchsia-300 border-fuchsia-200 dark:border-fuchsia-900/30">{skill}</Badge>
                ))}
              </div>
              
              <h5 className="text-xs font-bold uppercase text-slate-500 mb-2">AI Reasoning</h5>
              <p className="text-sm text-slate-700 dark:text-slate-300 italic">"{rec.matchRationale}"</p>
            </div>
            
            <div className="p-3 sm:p-4 bg-slate-50 dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center gap-3">
              {approvedIds.has(rec.id) ? (
                <p className="text-emerald-700 dark:text-emerald-400 font-bold flex items-center text-sm"><CheckCircle className="h-4 w-4 mr-1"/> Approved</p>
              ) : (
                <div />
              )}
              <div className="flex gap-3">
              {!approvedIds.has(rec.id) && (
                <>
                  <Button variant="outline" size="sm">Reject</Button>
                  <Button variant="secondary" size="sm" onClick={() => handleApprove(rec)} className="bg-fuchsia-600 hover:bg-fuchsia-700 text-white border-0">Approve Allocation</Button>
                </>
              )}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </section>
  );
}
