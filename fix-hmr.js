import fs from 'fs';
let serverFile = 'server.ts';
let serverData = fs.readFileSync(serverFile, 'utf8');

serverData = serverData.replace(
  /server: \{ middlewareMode: true \},/,
  "server: { \n        middlewareMode: true,\n        hmr: process.env.DISABLE_HMR === 'true' ? false : undefined\n      },"
);

fs.writeFileSync(serverFile, serverData);
