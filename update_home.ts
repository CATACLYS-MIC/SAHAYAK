import fs from 'fs';

const file = 'src/pages/Home.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  /hospitalSourceStatus\n  \} = useAppState\(\);/,
  `hospitalSourceStatus,\n    claimAnalyses\n  } = useAppState();`
);

const misinfoBlock = `
        {/* Misinformation & Rumor Alerts */}
        {claimAnalyses.filter(c => ['LIKELY FALSE', 'MISLEADING', 'CONFLICTING'].includes(c.verdict)).length > 0 && (
          <div className="grid grid-cols-1 gap-4">
            <Card className="border-red-200 dark:border-red-900/50 bg-red-50/30 dark:bg-red-950/20">
              <div className="px-4 py-3 border-b border-red-100 dark:border-red-900/30 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShieldAlert className="w-5 h-5 text-red-500" />
                  <h3 className="font-semibold text-red-900 dark:text-red-300">Active Rumors & Misinformation Alerts</h3>
                </div>
              </div>
              <div className="p-4 space-y-3">
                {claimAnalyses.filter(c => ['LIKELY FALSE', 'MISLEADING', 'CONFLICTING'].includes(c.verdict)).slice(0, 2).map((claim, idx) => (
                  <div key={idx} className="flex gap-3 items-start bg-white dark:bg-slate-900 p-3 rounded-lg border border-red-100 dark:border-red-900/30 shadow-sm">
                    {claim.verdict === 'CONFLICTING' ? (
                      <AlertTriangle className="w-5 h-5 text-yellow-500 shrink-0 mt-0.5" />
                    ) : (
                      <FileWarning className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                    )}
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className={\`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider \${
                          claim.verdict === 'CONFLICTING' 
                            ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/50 dark:text-yellow-400' 
                            : 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-400'
                        }\`}>
                          {claim.verdict}
                        </span>
                        <span className="text-xs text-slate-500">{new Date(claim.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                      </div>
                      <p className="text-sm font-medium text-slate-900 dark:text-slate-100 mb-1">"{claim.originalText}"</p>
                      <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2">{claim.explanation}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )}
`;

content = content.replace(
  /        \{\/\* Main Grid \*\/\}/,
  misinfoBlock + '\n        {/* Main Grid */}'
);

content = content.replace(
  /import \{ [^}]+ \} from 'lucide-react';/,
  (match) => {
    if (!match.includes('ShieldAlert')) match = match.replace('}', ', ShieldAlert }');
    if (!match.includes('FileWarning')) match = match.replace('}', ', FileWarning }');
    return match;
  }
);

fs.writeFileSync(file, content);
console.log('Updated Home.tsx');
