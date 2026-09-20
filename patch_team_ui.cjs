const fs = require('fs');
const file = 'src/components/logistics/TeamAllocation.tsx';
let content = fs.readFileSync(file, 'utf8');

const newHookContent = `
  const { teams, coverageGaps } = useAppState();
  const [recommendations, setRecommendations] = React.useState<any[]>(MOCK_VOLUNTEER_ALLOCATION_RECOMMENDATIONS);
  const [isGenerating, setIsGenerating] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

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
`;

content = content.replace(/const recommendations = MOCK_VOLUNTEER_ALLOCATION_RECOMMENDATIONS;/, newHookContent);

content = content.replace(/<Target className="mr-2 h-5 w-5 text-fuchsia-600 dark:text-fuchsia-400" \/>\s+AI Team Allocation\s+<\/h3>/, 
  `<Target className="mr-2 h-5 w-5 text-fuchsia-600 dark:text-fuchsia-400" />
          AI Team Allocation
        </h3>
        <div className="flex items-center">
          {error && <span className="text-red-500 text-sm mr-4">{error}</span>}
          <Button size="sm" variant="outline" onClick={handleGenerate} disabled={isGenerating}>
            <Target className={isGenerating ? "h-4 w-4 mr-2 animate-pulse" : "h-4 w-4 mr-2"} /> 
            {isGenerating ? "Analyzing Gaps..." : "Auto-Allocate Teams"}
          </Button>
        </div>`);

fs.writeFileSync(file, content);
