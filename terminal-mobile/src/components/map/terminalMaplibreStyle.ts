import type { StyleSpecification } from '@maplibre/maplibre-react-native';

/**
 * Dark raster basemap from CARTO (OSM data). No API key; respect CARTO/OSM attribution (shown via Map ornaments).
 */
export const TERMINAL_MAPLIBRE_STYLE: StyleSpecification = {
  version: 8,
  name: 'terminal-dark',
  sources: {
    'carto-dark': {
      type: 'raster',
      tiles: [
        'https://a.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png',
        'https://b.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png',
        'https://c.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png',
      ],
      tileSize: 256,
      attribution: '© OpenStreetMap contributors © CARTO',
      maxzoom: 19,
    },
  },
  layers: [
    {
      id: 'carto-dark-layer',
      type: 'raster',
      source: 'carto-dark',
    },
  ],
};
