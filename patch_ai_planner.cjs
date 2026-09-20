const fs = require('fs');
const file = 'src/components/logistics/AIDistributionPlanner.tsx';
let content = fs.readFileSync(file, 'utf8');

const newHookContent = `
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
          id: \`dist-plan-\${Date.now()}\`,
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
    updateDistributionPlan(planId, 'APPROVED', 'Command Center Ops');
  };
`;

content = content.replace(/const { distributionPlans, distributionAuditLogs } = useAppState\(\);\s+const handleApprove = \(planId: string\) => {\s+\/\/ Demo implementation\s+console.log\(`Approving plan \${planId}`\);\s+};/, newHookContent);

content = content.replace(/<Button size="sm" variant="outline"><Play className="h-4 w-4 mr-2" \/> Generate New Plan<\/Button>/, 
  `{error && <span className="text-red-500 text-sm mr-4">{error}</span>}
        <Button size="sm" variant="outline" onClick={handleGeneratePlan} disabled={isGenerating}>
          <Play className={cn("h-4 w-4 mr-2", isGenerating && "animate-pulse")} /> 
          {isGenerating ? "Generating..." : "Generate New Plan"}
        </Button>`);

fs.writeFileSync(file, content);
