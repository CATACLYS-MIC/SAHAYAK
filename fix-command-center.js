import fs from 'fs';
let file = 'src/pages/CommandCenter.tsx';
let data = fs.readFileSync(file, 'utf8');

// Replace routes with roads and bridges
data = data.replace(/routes,/g, 'roads, bridges,');
data = data.replace(/const localRoutes = routes\.filter.*?;\n/g, '');

// Fix the map rendering part
const routeRenderRegex = /\{\/\* Render routes \*\/\}.*?\{\/\* Risk Overlay \*\/\}/s;

const newRouteRender = `{/* Render Roads */}
             {roads.filter(road => road.geometry && road.geometry.length > 0).map(road => (
                <Polyline 
                  key={\`road-\${road.id}\`}
                  positions={road.geometry.map(p => [p.lat, p.lng] as [number, number])}
                  pathOptions={{ 
                    color: road.status === 'BLOCKED' ? '#ef4444' : road.status === 'OPEN' ? '#10b981' : '#f97316',
                    weight: road.status === 'BLOCKED' ? 4 : 3,
                    dashArray: road.status === 'CAUTION' || road.status === 'RESTRICTED' ? '5, 5' : undefined,
                    opacity: 0.8
                  }}
                />
             ))}
             
             {/* Render Bridges */}
             {bridges.map(bridge => (
                <Marker 
                  key={\`bridge-\${bridge.id}\`}
                  position={[bridge.location.lat, bridge.location.lng]}
                >
                  <Popup>
                    <div className="font-bold text-slate-900">{bridge.name}</div>
                    <div className="text-xs text-red-600 font-bold">{bridge.status}</div>
                  </Popup>
                </Marker>
             ))}

             {/* Risk Overlay */}`;

data = data.replace(routeRenderRegex, newRouteRender);

fs.writeFileSync(file, data);
