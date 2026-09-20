import fs from 'fs';
let serverFile = 'server.ts';
let serverData = fs.readFileSync(serverFile, 'utf8');

serverData = serverData.replace(
  /hmr: process.env.DISABLE_HMR === 'true' \? false : undefined/,
  "hmr: process.env.DISABLE_HMR === 'true' ? false : { overlay: false }"
);

fs.writeFileSync(serverFile, serverData);
