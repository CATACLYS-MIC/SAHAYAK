import React, { useState } from 'react';
import { Card, CardHeader, Badge, Button } from '@/components/ui';
import { useAppState } from '@/lib/store';
import { Activity, Target, CheckCircle, AlertTriangle, Play } from 'lucide-react';
import { cn } from '@/lib/utils';
import { AIDistributionPlanProposal } from '@/types';

export function AIDistributionPlanner() {
  
  const { distributionPlans, updateDistributionPlan, supplies, resourceDemands, addDistributionPlan } = useAppState();
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGeneratePlan = async () => {
    setIsGenerating(true);
    setError(null);
    try {
      const waterSupply = supplies.find(s => s.name.includes('Water')) || supplies[0];
      const demands = resourceDemands.flatMap(d => d.demands.filter(md => md.category === waterSupply?.category).map(md => ({
        locationId: d.locationId,
        locationName: d.locationName,
        required: md.required,
        shortage: md.shortage
      })));
      
      const response = await fetch('/api/logistics/ai-recommendations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          resourceName: waterSupply?.name || 'Water',
          availableQuantity: waterSupply?.available || 0,
          demands: demands,
          dorRoadConditions: []
        })
      });
      const data = await response.json();
      
      if (data.success && data.plan) {
        const newPlan: AIDistributionPlanProposal = {
          id: `dist-plan-${Date.now()}`,
          resourceName: waterSupply?.name || 'Water',
          category: waterSupply?.category || 'General',
          totalAvailable: data.plan.totalAvailable || waterSupply?.available || 0,
          emergencyReserve: data.plan.emergencyReserve || 0,
          unit: waterSupply?.unit || 'Units',
          allocations: data.plan.recommendedAllocations?.map((a: any) => ({
            ...a,
            recommendedQuantity: a.quantity,
            approvedQuantity: a.quantity,
            verifiedShortage: a.quantity,
            roadStatus: 'OPEN',
            deliveryRoute: a.routeNotes || 'Standard route'
          })) || [],
          reasoning: data.plan.reasoning || 'AI reasoning unavailable.',
          factors: data.plan.factorsConsidered || [],
          confidence: data.plan.confidenceScore || 85,
          status: 'PENDING_REVIEW'
        };
        addDistributionPlan(newPlan);
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

  const handleApprove = (planId: string) => {
    updateDistributionPlan(planId, {
      status: 'APPROVED',
      reviewedBy: 'Command Center Ops',
      reviewedAt: new Date().toISOString(),
      reviewNotes: 'Approved by field command'
    });
  };


  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
        <h3 className="text-xl font-bold flex items-center text-slate-900 dark:text-slate-100">
          <Activity className="mr-2 h-5 w-5 text-purple-600 dark:text-purple-400" />
          AI Relief Distribution Planner
        </h3>
        {error && <span className="text-red-500 text-sm mr-4">{error}</span>}
        <Button size="sm" variant="outline" onClick={handleGeneratePlan} disabled={isGenerating}>
          <Play className={cn("h-4 w-4 mr-2", isGenerating && "animate-pulse")} /> 
          {isGenerating ? "Generating..." : "Generate New Plan"}
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {distributionPlans.map(plan => (
          <Card key={plan.id} className={cn("border-l-4", 
            plan.status === 'PENDING_REVIEW' ? 'border-l-yellow-500' : 
            plan.status === 'APPROVED' ? 'border-l-emerald-500' : 'border-l-slate-400'
          )}>
            <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h4 className="font-bold text-lg text-slate-900 dark:text-slate-100 flex items-center">
                    {plan.resourceName}
                    <Badge variant={
                      plan.status === 'PENDING_REVIEW' ? 'warning' :
                      plan.status === 'APPROVED' ? 'success' : 'default'
                    } className="ml-3">
                      {plan.status.replace('_', ' ')}
                    </Badge>
                  </h4>
                  <p className="text-sm text-slate-500">Available: {plan.totalAvailable.toLocaleString()} {plan.unit} | Emergency Reserve: {plan.emergencyReserve.toLocaleString()} {plan.unit}</p>
                </div>
                <div className="flex flex-col text-right">
                  <span className="text-sm font-bold text-slate-700 dark:text-slate-300">Confidence: {plan.confidence}%</span>
                </div>
              </div>
            </div>

            <div className="p-4 sm:p-5 bg-slate-50/50 dark:bg-slate-900/20">
              <h5 className="text-xs font-bold uppercase text-slate-500 mb-3 tracking-wider">AI Recommendation</h5>
              <div className="space-y-3">
                {plan.allocations.map((alloc, idx) => (
                  <div key={idx} className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-3 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded">
                    <div className="flex-1">
                      <p className="font-bold text-slate-800 dark:text-slate-200">{alloc.locationName}</p>
                      <p className="text-xs text-slate-500 mt-1 line-clamp-1">{alloc.deliveryRoute}</p>
                    </div>
                    <div className="flex gap-4 items-center">
                      <div className="text-center bg-red-50 dark:bg-red-950/30 px-3 py-1 rounded">
                        <span className="text-[10px] uppercase text-red-600 block">Shortage</span>
                        <span className="font-bold text-red-700 dark:text-red-400">{alloc.verifiedShortage.toLocaleString()}</span>
                      </div>
                      <div className="text-center bg-blue-50 dark:bg-blue-950/30 px-3 py-1 rounded border border-blue-100 dark:border-blue-900/50">
                        <span className="text-[10px] uppercase text-blue-600 block">Allocate</span>
                        <span className="font-bold text-blue-700 dark:text-blue-400">{alloc.recommendedQuantity.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-4 sm:p-5 border-t border-slate-100 dark:border-slate-800">
              <h5 className="text-xs font-bold uppercase text-slate-500 mb-2 tracking-wider">AI Reasoning</h5>
              <p className="text-sm text-slate-700 dark:text-slate-300 italic">"{plan.reasoning}"</p>
              
              <div className="mt-4 flex flex-wrap gap-2">
                {plan.factors.map((f, i) => (
                  <Badge key={i} variant="outline" className="text-xs font-normal" title={f.description}>{f.name}</Badge>
                ))}
              </div>
            </div>

            <div className="p-4 sm:p-5 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900">
              <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                {plan.status === 'APPROVED' && plan.reviewedBy ? (
                  <div className="text-sm">
                    <p className="text-emerald-700 dark:text-emerald-400 font-bold flex items-center"><CheckCircle className="h-4 w-4 mr-1"/> Approved by {plan.reviewedBy}</p>
                    <p className="text-xs text-slate-500 mt-1">{plan.reviewedAt} - {plan.reviewNotes}</p>
                  </div>
                ) : (
                  <p className="text-sm text-slate-500 flex items-center">
                    <AlertTriangle className="h-4 w-4 mr-2 text-yellow-500"/>
                    Requires human authorization
                  </p>
                )}
                
                {plan.status === 'PENDING_REVIEW' && (
                  <div className="flex gap-2 w-full sm:w-auto">
                    <Button variant="outline" className="flex-1 sm:flex-none">Reject</Button>
                    <Button variant="secondary" className="flex-1 sm:flex-none">Modify</Button>
                    <Button onClick={() => handleApprove(plan.id)} className="flex-1 sm:flex-none bg-emerald-600 hover:bg-emerald-700 text-white">Approve Plan</Button>
                  </div>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </section>
  );
}
