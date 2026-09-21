export default function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Content-Type', 'application/json');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const galliKey = (
    process.env.VITE_GALLI_MAPS_API_KEY ||
    process.env.GALLI_MAPS_API_KEY ||
    process.env.VITE_GALLIMAPS_API_KEY ||
    process.env.GALLIMAPS_API_KEY ||
    ''
  ).trim();

  res.status(200).json({
    galliMapsApiKey: galliKey
  });
}
