const fs = require('fs');
const file = 'src/components/logistics/TeamAllocation.tsx';
let content = fs.readFileSync(file, 'utf8');

const approveLogic = `
  const [approvedIds, setApprovedIds] = React.useState<Set<string>>(new Set());

  const handleApprove = (id: string) => {
    setApprovedIds(prev => new Set(prev).add(id));
  };
`;

content = content.replace(/const handleGenerate = async \(\) => {/, approveLogic + '\n  const handleGenerate = async () => {');

content = content.replace(/<Card key=\{rec.id\} className="overflow-hidden border-l-4 border-l-fuchsia-500">/, 
  `<Card key={rec.id} className={cn("overflow-hidden border-l-4", approvedIds.has(rec.id) ? "border-l-emerald-500" : "border-l-fuchsia-500")}>`);

content = content.replace(/<div className="p-3 sm:p-4 bg-slate-50 dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3">/,
  `<div className="p-3 sm:p-4 bg-slate-50 dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center gap-3">
              {approvedIds.has(rec.id) ? (
                <p className="text-emerald-700 dark:text-emerald-400 font-bold flex items-center text-sm"><CheckCircle className="h-4 w-4 mr-1"/> Approved</p>
              ) : (
                <div />
              )}
              <div className="flex gap-3">`
);

content = content.replace(/<Button variant="outline" size="sm">Reject<\/Button>\s+<Button variant="secondary" size="sm" className="bg-fuchsia-600 hover:bg-fuchsia-700 text-white border-0">Approve Allocation<\/Button>\s+<\/div>/,
  `{!approvedIds.has(rec.id) && (
                <>
                  <Button variant="outline" size="sm">Reject</Button>
                  <Button variant="secondary" size="sm" onClick={() => handleApprove(rec.id)} className="bg-fuchsia-600 hover:bg-fuchsia-700 text-white border-0">Approve Allocation</Button>
                </>
              )}
              </div>
            </div>`
);

content = content.replace(/import \{ Card, Badge, Button \} from '@\/components\/ui';/, `import { Card, Badge, Button } from '@/components/ui';\nimport { cn } from '@/lib/utils';`);

fs.writeFileSync(file, content);
