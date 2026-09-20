import fs from 'fs';

const file = 'src/pages/CommandCenter.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  /hospitalSourceStatus,\n/,
  `hospitalSourceStatus,\n    claimAnalyses,\n    updateHumanReviewStatus,\n`
);

const misinfoBlock = `
        {/* Misinformation Review Queue */}
        {claimAnalyses.filter(c => c.humanReviewStatus === 'PENDING' && ['LIKELY FALSE', 'MISLEADING', 'CONFLICTING'].includes(c.verdict)).length > 0 && (
          <Card className="border-purple-200 dark:border-purple-900/50 bg-gradient-to-br from-purple-50/50 to-white dark:from-purple-950/20 dark:to-slate-900">
            <CardHeader className="py-3 px-4 border-b border-purple-100 dark:border-purple-900/30 flex flex-row items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldAlert className="h-5 w-5 text-purple-600" />
                <CardTitle className="text-sm">Misinformation Review Queue</CardTitle>
              </div>
              <Badge variant="outline" className="bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300">
                {claimAnalyses.filter(c => c.humanReviewStatus === 'PENDING' && ['LIKELY FALSE', 'MISLEADING', 'CONFLICTING'].includes(c.verdict)).length} Pending
              </Badge>
            </CardHeader>
            <div className="divide-y divide-purple-100 dark:divide-purple-900/30">
              {claimAnalyses
                .filter(c => c.humanReviewStatus === 'PENDING' && ['LIKELY FALSE', 'MISLEADING', 'CONFLICTING'].includes(c.verdict))
                .slice(0, 3)
                .map(claim => (
                  <div key={claim.id} className="p-4 flex flex-col gap-3">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className={\`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider \${
                            claim.verdict === 'CONFLICTING' 
                              ? 'bg-yellow-100 text-yellow-700' 
                              : 'bg-red-100 text-red-700'
                          }\`}>
                            {claim.verdict}
                          </span>
                          <span className="text-xs text-slate-500">{new Date(claim.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                        </div>
                        <p className="text-sm font-medium text-slate-900 dark:text-slate-100 mb-1">"{claim.originalText}"</p>
                        <p className="text-xs text-slate-600 dark:text-slate-400">{claim.explanation}</p>
                      </div>
                      <button 
                        onClick={() => updateHumanReviewStatus(claim.id, 'REVIEWED')}
                        className="shrink-0 px-3 py-1.5 bg-purple-100 hover:bg-purple-200 dark:bg-purple-900/50 dark:hover:bg-purple-900 text-purple-700 dark:text-purple-300 text-xs font-medium rounded-md transition-colors"
                      >
                        Mark Reviewed
                      </button>
                    </div>
                  </div>
              ))}
            </div>
          </Card>
        )}
`;

content = content.replace(
  /        \{\/\* Communications Log \*\/\}/,
  misinfoBlock + '\n        {/* Communications Log */}'
);

content = content.replace(
  /import \{ [^}]+ \} from 'lucide-react';/,
  (match) => {
    if (!match.includes('ShieldAlert')) match = match.replace('}', ', ShieldAlert }');
    return match;
  }
);

fs.writeFileSync(file, content);
console.log('Updated CommandCenter.tsx');
