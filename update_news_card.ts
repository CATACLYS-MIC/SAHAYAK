import fs from 'fs';

const file = 'src/pages/NewsSafety.tsx';
let content = fs.readFileSync(file, 'utf8');

// Imports
content = content.replace(
  /import \{ FileText, ShieldCheck, MapPin, Users, Activity, Eye, AlertTriangle, CheckCircle2, ChevronDown, Filter, ChevronRight, ListFilter, ArrowRight, X, Clock, Unlock \} from 'lucide-react';/,
  `import { FileText, ShieldCheck, MapPin, Users, Activity, Eye, AlertTriangle, CheckCircle2, ChevronDown, Filter, ChevronRight, ListFilter, ArrowRight, X, Clock, Unlock, ShieldQuestion, FileWarning, ShieldAlert } from 'lucide-react';`
);

// Helper function
const helperFunc = `
// Helper for Misinfo Status in News
function getMisinfoNewsBadge(status?: string, verified?: boolean) {
  if (status === 'VERIFIED') return <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center bg-emerald-50 dark:bg-emerald-950/30 px-2 py-0.5 rounded-md border border-emerald-200 dark:border-emerald-800"><ShieldCheck className="h-3.5 w-3.5 mr-1" /> Verified</span>;
  if (status === 'LIKELY TRUE') return <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center bg-emerald-50 dark:bg-emerald-950/30 px-2 py-0.5 rounded-md border border-emerald-100 dark:border-emerald-900"><CheckCircle2 className="h-3.5 w-3.5 mr-1" /> Likely True</span>;
  if (status === 'MISLEADING') return <span className="text-xs font-semibold text-orange-600 dark:text-orange-400 flex items-center bg-orange-50 dark:bg-orange-950/30 px-2 py-0.5 rounded-md border border-orange-200 dark:border-orange-800"><ShieldAlert className="h-3.5 w-3.5 mr-1" /> Misleading</span>;
  if (status === 'CONFLICTING') return <span className="text-xs font-semibold text-yellow-600 dark:text-yellow-400 flex items-center bg-yellow-50 dark:bg-yellow-950/30 px-2 py-0.5 rounded-md border border-yellow-200 dark:border-yellow-800"><AlertTriangle className="h-3.5 w-3.5 mr-1" /> Conflicting Reports</span>;
  if (status === 'LIKELY FALSE') return <span className="text-xs font-semibold text-red-600 dark:text-red-400 flex items-center bg-red-50 dark:bg-red-950/30 px-2 py-0.5 rounded-md border border-red-200 dark:border-red-800"><FileWarning className="h-3.5 w-3.5 mr-1" /> Likely False</span>;
  if (status === 'OUTDATED') return <span className="text-xs font-semibold text-slate-600 dark:text-slate-400 flex items-center bg-slate-50 dark:bg-slate-800/50 px-2 py-0.5 rounded-md border border-slate-200 dark:border-slate-700"><Clock className="h-3.5 w-3.5 mr-1" /> Outdated</span>;
  if (status === 'UNVERIFIED') return <span className="text-xs font-semibold text-slate-500 flex items-center bg-slate-50 dark:bg-slate-800/50 px-2 py-0.5 rounded-md border border-slate-200 dark:border-slate-700"><ShieldQuestion className="h-3.5 w-3.5 mr-1" /> Unverified Claim</span>;
  
  if (verified) return <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center"><ShieldCheck className="h-3.5 w-3.5 mr-1" /> Official Dispatch</span>;
  
  return null;
}
`;

content = content.replace(
  /export function NewsSafety/,
  helperFunc + '\nexport function NewsSafety'
);

// Render badge
content = content.replace(
  /\{article\.verified && \(\s*<span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center">\s*<ShieldCheck className="h-3\.5 w-3\.5 mr-1" \/> Official Dispatch\s*<\/span>\s*\)\}/,
  `{getMisinfoNewsBadge(article.verificationStatus, article.verified)}`
);

// Add explanation toggle
content = content.replace(
  /<p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-3 leading-relaxed">\{article\.summary\}<\/p>/,
  `<p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-3 leading-relaxed">{article.summary}</p>
                  {article.verificationExplanation && (
                    <div className="mt-2 p-2.5 bg-slate-50 dark:bg-slate-900 rounded-lg text-xs text-slate-600 dark:text-slate-400 border border-slate-100 dark:border-slate-800">
                      <span className="font-semibold block mb-1">AI Verification Note:</span>
                      {article.verificationExplanation}
                    </div>
                  )}`
);

fs.writeFileSync(file, content);
console.log('Updated News rendering');
