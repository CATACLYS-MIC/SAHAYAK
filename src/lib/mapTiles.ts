/**
 * Galli Maps & OpenStreetMap / CartoDB Tile Configuration
 * Provides rock-solid tile URLs and automatic fallback for Vercel, production, and local environments.
 */

export interface MapTileConfig {
  url: string;
  errorTileUrl: string;
  attribution: string;
  maxZoom: number;
  subdomains?: string[];
  fallbackTemplate?: string;
  isGalliDirect?: boolean;
}

export const BLANK_TILE_DATA_URL =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';

/**
 * Returns the exact fallback tile URL for a given tile coordinate (resolves {z}, {x}, {y})
 */
export function getFallbackTileUrl(
  coords: { z: number; x: number; y: number },
  theme: 'light' | 'dark'
): string {
  const isDark = theme === 'dark';
  const subdomains = ['a', 'b', 'c', 'd'];
  const s = subdomains[Math.abs(coords.x + coords.y) % subdomains.length];
  
  if (isDark) {
    return `https://${s}.basemaps.cartocdn.com/dark_all/${coords.z}/${coords.x}/${coords.y}.png`;
  }
  return `https://${s}.basemaps.cartocdn.com/rastertiles/voyager/${coords.z}/${coords.x}/${coords.y}.png`;
}

/**
 * Returns the best available tile URL and error fallback tile URL for Nepal maps
 */
export function getMapTileConfig(
  theme: 'light' | 'dark',
  mapLayer: 'street' | 'streets' | 'topo' = 'street'
): MapTileConfig {
  const isDark = theme === 'dark';
  const envObj = (import.meta as any).env || {};
  const galliKey = (
    (envObj.VITE_GALLI_MAPS_API_KEY as string) ||
    (envObj.GALLI_MAPS_API_KEY as string) ||
    (envObj.VITE_GALLIMAPS_API_KEY as string) ||
    (envObj.GALLIMAPS_API_KEY as string) ||
    ''
  ).trim();

  // High-reliability global & Nepal CDN tile layers with multi-subdomain support
  const cartoDarkTemplate = 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png';
  const cartoLightTemplate = 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png';

  const defaultTemplate = isDark ? cartoDarkTemplate : cartoLightTemplate;

  // 1. Topographic layer
  if (mapLayer === 'topo') {
    return {
      url: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
      errorTileUrl: BLANK_TILE_DATA_URL,
      fallbackTemplate: defaultTemplate,
      attribution: '&copy; <a href="https://opentopomap.org">OpenTopoMap</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 17,
      subdomains: ['a', 'b', 'c']
    };
  }

  // 2. Direct Galli Maps API access if user configured Galli Maps key
  if (galliKey) {
    const style = isDark ? 'dark' : 'light';
    return {
      url: `https://map-init.gallimap.com/styles/${style}/{z}/{x}/{y}.png?accessToken=${encodeURIComponent(galliKey)}`,
      errorTileUrl: BLANK_TILE_DATA_URL,
      fallbackTemplate: defaultTemplate,
      attribution: '&copy; <a href="https://gallimaps.com" target="_blank" rel="noreferrer">Galli Maps</a> (Nepal) &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 18,
      subdomains: ['a', 'b', 'c', 'd'],
      isGalliDirect: true
    };
  }

  // 3. Ultra-reliable Nepal base tiles (CartoDB / OpenStreetMap)
  return {
    url: defaultTemplate,
    errorTileUrl: BLANK_TILE_DATA_URL,
    fallbackTemplate: defaultTemplate,
    attribution: '&copy; <a href="https://gallimaps.com" target="_blank" rel="noreferrer">Galli Maps</a> (Nepal) &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    maxZoom: 19,
    subdomains: ['a', 'b', 'c', 'd'],
    isGalliDirect: false
  };
}
