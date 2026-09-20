import fs from 'fs';
let viteFile = 'vite.config.ts';
let viteData = fs.readFileSync(viteFile, 'utf8');

viteData = viteData.replace(
  /hmr: [^,]+,/,
  "hmr: false,"
);

fs.writeFileSync(viteFile, viteData);

let serverFile = 'server.ts';
let serverData = fs.readFileSync(serverFile, 'utf8');

serverData = serverData.replace(
  /hmr: [^,]+/,
  "hmr: false"
);

fs.writeFileSync(serverFile, serverData);
