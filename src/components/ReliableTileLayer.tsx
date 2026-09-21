import React, { useEffect, useRef } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import { MapTileConfig, getFallbackTileUrl } from '@/lib/mapTiles';

interface ReliableTileLayerProps {
  tileConfig: MapTileConfig;
  theme: 'light' | 'dark';
}

/**
 * Bulletproof Map Tile Layer for Vercel and production deployments.
 * Eliminates blank/grey map squares.
 * If primary Galli Maps tile request fails (HTTP 401/403, domain origin restrictions on Vercel,
 * token invalidity, or CORS), each tile DOM element immediately loads the high-speed Nepal CDN fallback tile.
 */
export function ReliableTileLayer({ tileConfig, theme }: ReliableTileLayerProps) {
  const map = useMap();
  const layerRef = useRef<L.TileLayer | null>(null);

  useEffect(() => {
    if (!map) return;

    // Custom resilient Leaflet TileLayer class
    const ResilientTileLayer = L.TileLayer.extend({
      createTile: function (coords: any, done: any) {
        const tile = document.createElement('img');
        tile.alt = '';
        tile.setAttribute('role', 'presentation');

        const primaryUrl = this.getTileUrl(coords);
        const fallbackUrl = getFallbackTileUrl(coords, theme);

        tile.onload = () => {
          done(null, tile);
        };

        tile.onerror = () => {
          // If primary URL fails (e.g. Galli Maps 401/403 unauthorized domain on Vercel),
          // instantly swap to Nepal CartoDB / OSM basemap tile so map NEVER stays grey!
          if (tile.src !== fallbackUrl) {
            tile.src = fallbackUrl;
          } else {
            done(new Error('Tile failed'), tile);
          }
        };

        tile.crossOrigin = '';
        tile.src = primaryUrl;
        return tile;
      }
    });

    const layer = new (ResilientTileLayer as any)(tileConfig.url, {
      attribution: tileConfig.attribution,
      maxZoom: tileConfig.maxZoom || 19,
      subdomains: tileConfig.subdomains || ['a', 'b', 'c', 'd'],
    });

    layer.addTo(map);
    layerRef.current = layer;

    return () => {
      if (layerRef.current && map) {
        try {
          map.removeLayer(layerRef.current);
        } catch {
          // Ignore
        }
        layerRef.current = null;
      }
    };
  }, [map, tileConfig.url, tileConfig.attribution, tileConfig.maxZoom, theme]);

  return null;
}
