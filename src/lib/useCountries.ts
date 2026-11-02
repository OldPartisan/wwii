import { useEffect, useState } from 'react';
import { geoArea } from 'd3-geo';
import { pathGen } from './geo';

export interface CountryFeature {
  type: 'Feature';
  properties: { name: string; id: string };
  geometry: unknown;
}

export interface CountryShape {
  id: string;
  name: string;
  d: string;
  feature: CountryFeature;
}

export interface CountrySets {
  y1938: CountryShape[];
  y1939: CountryShape[];
  y1940: CountryShape[];
  y1945: CountryShape[];
}

let cache: CountrySets | null = null;

/**
 * historical-basemaps содержит полигоны с разной намоткой колец.
 * d3-geo трактует «вывернутый» полигон как весь мир, поэтому
 * приводим ориентацию каждого отдельного полигона к меньшей площади.
 */
function normalizePolygon(poly: number[][][]): number[][][] {
  const probe = {
    type: 'Feature',
    properties: {},
    geometry: { type: 'Polygon', coordinates: poly },
  };
  try {
    if (geoArea(probe as never) > Math.PI * 2) {
      return poly.map((ring) => [...ring].reverse());
    }
  } catch {
    /* ignore malformed geometry */
  }
  return poly;
}

function normalize(f: CountryFeature): CountryFeature {
  const g = f.geometry as { type: string; coordinates: unknown };
  if (g.type === 'Polygon') {
    g.coordinates = normalizePolygon(g.coordinates as number[][][]);
  } else if (g.type === 'MultiPolygon') {
    g.coordinates = (g.coordinates as number[][][][]).map(normalizePolygon);
  }
  return f;
}

function build(geo: { features: CountryFeature[] }): CountryShape[] {
  return geo.features
    .filter((f) => f.properties.name)
    .map((raw) => {
      const f = normalize(raw);
      return {
        id: f.properties.id,
        name: f.properties.name,
        d: pathGen(f as never) ?? '',
        feature: f,
      };
    })
    .filter((s) => s.d.length > 0);
}

export function useCountries(): CountrySets | null {
  const [sets, setSets] = useState<CountrySets | null>(cache);

  useEffect(() => {
    if (cache) return;
    let alive = true;
    Promise.all([
      fetch('/data/borders_1938.geojson').then((r) => r.json()),
      fetch('/data/borders_1939.geojson').then((r) => r.json()),
      fetch('/data/borders_1940.geojson').then((r) => r.json()),
      fetch('/data/borders_1945.geojson').then((r) => r.json()),
    ])
      .then(([a, b, c, d]) => {
        if (!alive) return;
        cache = {
          y1938: build(a),
          y1939: build(b),
          y1940: build(c),
          y1945: build(d),
        };
        setSets(cache);
      })
      .catch((err) => console.error('borders load failed', err));
    return () => {
      alive = false;
    };
  }, []);

  return sets;
}
