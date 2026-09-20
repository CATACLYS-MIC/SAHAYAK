import fs from 'fs';
let file = 'src/components/misinfo/MisinfoProtector.tsx';
let data = fs.readFileSync(file, 'utf8');

// Import ExternalLink
if (!data.includes('ExternalLink')) {
  data = data.replace('HelpCircle } from', 'HelpCircle, ExternalLink } from');
}

// Add URLs to simulated sources
data = data.replace(
  /id: 'src-sim-1'.+?relationship: 'CONTRADICTING'/g,
  "url: 'https://wrc.gov.np/updates/koshi', $&"
);

data = data.replace(
  /id: 'src-sim-2'.+?relationship: 'CONTRADICTING'/g,
  "url: 'https://caanepal.gov.np/news/airport-status', $&"
);

data = data.replace(
  /id: 'src-sim-3'.+?relationship: 'SUPPORTING'/g,
  "url: 'https://neoc.gov.np/en/rescue-updates', $&"
);

data = data.replace(
  /id: 'src-sim-4'.+?relationship: 'SUPPORTING'/g,
  "url: 'https://kantipurtv.com/news/local-rescue', $&"
);

// Render the URL in the source list
data = data.replace(
  /<div className="font-medium text-sm">\{source.name\}<\/div>/g,
  `<div className="font-medium text-sm flex items-center gap-1.5">\n                        {source.name}\n                        {source.url && (\n                          <a href={source.url} target="_blank" rel="noopener noreferrer" className="text-indigo-500 hover:text-indigo-600 dark:text-indigo-400 dark:hover:text-indigo-300" title="View Source">\n                            <ExternalLink className="w-3.5 h-3.5" />\n                          </a>\n                        )}\n                      </div>`
);

fs.writeFileSync(file, data);
