import { Road, Bridge, RouteAlternative, RouteRiskLevel } from '../types';

function getDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371; // km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

function calculatePathDistance(geometry: { lat: number; lng: number }[]) {
  let dist = 0;
  for (let i = 0; i < geometry.length - 1; i++) {
    dist += getDistance(geometry[i].lat, geometry[i].lng, geometry[i+1].lat, geometry[i+1].lng);
  }
  return dist;
}

export function calculateRoutes(
  startNode: string, 
  endNode: string, 
  roads: Road[], 
  bridges: Bridge[]
): RouteAlternative[] {
  // Graph representation
  const graph: Record<string, { node: string; roadId: string; distance: number; road: Road }[]> = {};
  
  roads.forEach(r => {
    if (!graph[r.startLocation]) graph[r.startLocation] = [];
    if (!graph[r.endLocation]) graph[r.endLocation] = [];
    const dist = calculatePathDistance(r.geometry);
    
    // Bidirectional
    graph[r.startLocation].push({ node: r.endLocation, roadId: r.id, distance: dist, road: r });
    graph[r.endLocation].push({ node: r.startLocation, roadId: r.id, distance: dist, road: r });
  });

  // Simple DFS to find all acyclic paths between startNode and endNode (since graph is very small)
  const paths: { nodes: string[], roads: Road[], distance: number }[] = [];
  
  function dfs(current: string, target: string, visited: Set<string>, currentPathNodes: string[], currentPathRoads: Road[], currentDist: number) {
    if (current === target) {
      paths.push({ nodes: [...currentPathNodes], roads: [...currentPathRoads], distance: currentDist });
      return;
    }
    
    if (!graph[current]) return;
    
    for (const neighbor of graph[current]) {
      if (!visited.has(neighbor.node)) {
        visited.add(neighbor.node);
        currentPathNodes.push(neighbor.node);
        currentPathRoads.push(neighbor.road);
        
        dfs(neighbor.node, target, visited, currentPathNodes, currentPathRoads, currentDist + neighbor.distance);
        
        currentPathRoads.pop();
        currentPathNodes.pop();
        visited.delete(neighbor.node);
      }
    }
  }

  const startSet = new Set<string>();
  startSet.add(startNode);
  dfs(startNode, endNode, startSet, [startNode], [], 0);

  // Evaluate each path for safety and risk
  const alternatives = paths.map((path, idx) => {
    let riskScore = 0; // 0 is best
    let hasBlocked = false;
    let maxRiskLevel: RouteRiskLevel = 'LOW';
    const blockedSegments: string[] = [];
    const hazards = new Set<string>();
    let totalConfidence = 0;

    const pathGeometry: { lat: number; lng: number }[] = [];
    
    for (const road of path.roads) {
      if (pathGeometry.length === 0) {
         pathGeometry.push(...road.geometry);
      } else {
         // rough joining
         pathGeometry.push(...road.geometry);
      }

      totalConfidence += road.confidence;
      if (road.hazards.length > 0) road.hazards.forEach(h => hazards.add(h));
      
      // Check bridges on this road
      const roadBridges = bridges.filter(b => b.roadId === road.id);
      let bridgeBlocked = false;
      let bridgeRestricted = false;
      roadBridges.forEach(b => {
         if (b.status === 'BLOCKED') bridgeBlocked = true;
         if (b.status === 'RESTRICTED' || b.threatLevel === 'HIGH' || b.threatLevel === 'ELEVATED') bridgeRestricted = true;
         if (b.hazards.length > 0) b.hazards.forEach(h => hazards.add(h));
      });

      if (road.status === 'BLOCKED' || bridgeBlocked) {
        hasBlocked = true;
        maxRiskLevel = 'CRITICAL';
        blockedSegments.push(road.name);
        // Massively penalize so router NEVER recommends a route through blocked road or bridge
        riskScore += 100000;
      } else if (road.status === 'RESTRICTED' || bridgeRestricted) {
        riskScore += 500;
        if (maxRiskLevel !== 'CRITICAL') maxRiskLevel = 'HIGH';
      } else if (road.status === 'CAUTION') {
        riskScore += 150;
        if (maxRiskLevel === 'LOW') maxRiskLevel = 'MODERATE';
      }

      // factor in weather / hazards from existing system (simulated via hazards array for now)
      riskScore += road.hazards.length * 50;
      if (road.hazards.length > 0 && maxRiskLevel === 'LOW') maxRiskLevel = 'MODERATE';
    }

    if (hasBlocked) maxRiskLevel = 'CRITICAL';
    
    // Time heuristic: assume avg 40km/h on these roads
    const estimatedTime = (path.distance / 40) * 60; 

    // Score for ranking: combine distance and risk.
    // Safety matters far more than distance!
    const rankingScore = path.distance + riskScore;
    
    const avgConfidence = path.roads.length > 0 ? totalConfidence / path.roads.length : 100;

    return {
      id: `route-${idx}`,
      name: `Via ${path.roads.map(r => r.name.split(' ')[0]).join(', ')}`,
      distance: path.distance,
      estimatedTime,
      riskLevel: maxRiskLevel,
      riskScore: rankingScore,
      blockedSegments,
      hazards: Array.from(hazards),
      confidence: avgConfidence,
      path: pathGeometry,
      isRecommended: false,
      explanation: ''
    };
  });

  // Sort by ranking score (lowest is best)
  alternatives.sort((a, b) => a.riskScore - b.riskScore);

  if (alternatives.length > 0) {
    alternatives[0].isRecommended = true;
    
    if (alternatives[0].blockedSegments.length > 0) {
      alternatives[0].explanation = "No safe route identified. The best available path still contains blocked segments.";
    } else {
      if (alternatives.length > 1 && alternatives[1].distance < alternatives[0].distance) {
         alternatives[0].explanation = `Although this route is ${(alternatives[0].distance - alternatives[1].distance).toFixed(1)} km longer, it avoids high-risk areas.`;
      } else {
         alternatives[0].explanation = "This is the safest and most direct route currently available.";
      }
    }
  }

  return alternatives;
}
