import fs from 'fs';
let serverFile = 'server.ts';
let serverData = fs.readFileSync(serverFile, 'utf8');

serverData = serverData.replace(
  /server: \{\s*middlewareMode: true,\s*hmr: false,\s*appType: 'spa',/g,
  "server: { \n        middlewareMode: true,\n        hmr: false\n      },\n      appType: 'spa',"
);

fs.writeFileSync(serverFile, serverData);
