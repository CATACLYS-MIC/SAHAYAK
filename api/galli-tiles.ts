export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { style = 'light', z, x, y } = req.query || {};
  const validStyle = style === 'dark' ? 'dark' : 'light';

  if (!z || !x || !y) {
    return res.status(400).send('Missing z, x, or y coordinates');
  }

  const cleanY = String(y).replace('.png', '');
  const galliKey = (
    process.env.VITE_GALLI_MAPS_API_KEY ||
    process.env.GALLI_MAPS_API_KEY ||
    process.env.VITE_GALLIMAPS_API_KEY ||
    process.env.GALLIMAPS_API_KEY ||
    ''
  ).trim();

  // Try Galli Maps API directly from server (no browser CORS or Referer restriction)
  if (galliKey) {
    try {
      const galliUrl = `https://map-init.gallimap.com/styles/${validStyle}/${z}/${x}/${cleanY}.png?accessToken=${encodeURIComponent(galliKey)}`;
      const response = await fetch(galliUrl);
      if (response.ok) {
        const buffer = await response.arrayBuffer();
        res.setHeader('Content-Type', 'image/png');
        res.setHeader('Cache-Control', 'public, max-age=86400, stale-while-revalidate=604800');
        return res.status(200).send(Buffer.from(buffer));
      }
    } catch {
      // Fall through
    }
  }

  // Fallback to high-reliability CartoDB / OSM tiles
  try {
    const subdomains = ['a', 'b', 'c', 'd'];
    const s = subdomains[Math.abs(Number(x) + Number(cleanY)) % subdomains.length];
    const fallbackUrl = validStyle === 'dark'
      ? `https://${s}.basemaps.cartocdn.com/dark_all/${z}/${x}/${cleanY}.png`
      : `https://${s}.basemaps.cartocdn.com/rastertiles/voyager/${z}/${x}/${cleanY}.png`;

    const fallbackRes = await fetch(fallbackUrl, {
      headers: { 'User-Agent': 'Sahayak-Nepal-Disaster-App/1.0' }
    });

    if (fallbackRes.ok) {
      const buffer = await fallbackRes.arrayBuffer();
      res.setHeader('Content-Type', 'image/png');
      res.setHeader('Cache-Control', 'public, max-age=86400, stale-while-revalidate=604800');
      return res.status(200).send(Buffer.from(buffer));
    }
  } catch {
    // Fall through
  }

  res.status(404).send('Tile not found');
}
