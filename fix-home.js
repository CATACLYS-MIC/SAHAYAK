import fs from 'fs';
let file = 'src/pages/Home.tsx';
let data = fs.readFileSync(file, 'utf8');

data = data.replace(/routes,/g, 'roads, bridges,');
data = data.replace(/const localRoutes = routes\.filter.*?;\n/g, '');
data = data.replace(/const openRoutes = localRoutes\.filter.*?;\n/g, '');
data = data.replace(/const routeOpenPercentage = .*?;\n/g, '');

const newLogic = `
  const blockedRoads = roads.filter(r => r.status === 'BLOCKED').length;
  const blockedBridges = bridges.filter(r => r.status === 'BLOCKED').length;
  const totalDisruptions = blockedRoads + blockedBridges;
  const routeOpenPercentage = roads.length > 0 ? Math.round(((roads.length - blockedRoads) / roads.length) * 100) : 100;
`;

data = data.replace(/const recentNews =/g, newLogic + '\n  const recentNews =');

data = data.replace(/\{localRoutes\.length - openRoutes\} route\(s\) affected/g, '{totalDisruptions} major disruption(s)');

fs.writeFileSync(file, data);
