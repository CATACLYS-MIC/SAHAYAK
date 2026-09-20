import fs from 'fs';
let file = 'src/lib/routingService.ts';
let data = fs.readFileSync(file, 'utf8');
data = data.replace(/\\\`/g, '`');
data = data.replace(/\\\$/g, '$');
fs.writeFileSync(file, data);
