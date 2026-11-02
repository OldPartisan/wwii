import { useMemo } from 'react';
import { useDay } from '../lib/clock';
import { statusColors } from '../data/control';
import { statusForFeature } from '../data/historicalControl';
import { cityTerritory } from '../data/cityTerritory';
import { toDay } from '../lib/date';
import { project } from '../lib/geo';
import { cityLabels, countryLabels, seaLabels } from '../data/labels';

interface Placed {
  name: string;
  x: number;
  y: number;
  tier: 1 | 2 | 3;
}

function luminance(hex: string): number {
  const n = parseInt(hex.slice(1), 16);
  return 0.299 * ((n >> 16) & 255) + 0.587 * ((n >> 8) & 255) + 0.114 * (n & 255);
}

function toneFor(name: string, day: number): 'light' | 'dark' {
  const rec = cityTerritory[name];
  const key =
    day >= toDay('1945-05-08')
      ? 'y1945'
      : day >= toDay('1940-06-15')
        ? 'y1940'
        : day >= toDay('1939-09-17')
          ? 'y1939'
          : 'y1938';
  const feature = rec?.[key] ?? rec?.y1938;
  if (!feature) return 'dark';
  const color = statusColors[statusForFeature(feature, day)];
  return luminance(color) < 140 ? 'light' : 'dark';
}

function place(list: { name: string; lat: number; lng: number; tier: 1 | 2 | 3 }[]): Placed[] {
  return list.map((l) => {
    const [x, y] = project({ lat: l.lat, lng: l.lng });
    return { name: l.name, x, y, tier: l.tier };
  });
}

const RENAMES: Record<string, string> = {
  Данциг: 'Гданьск',
  Кёнигсберг: 'Калининград',
  Бреслау: 'Вроцлав',
  Штеттин: 'Щецин',
};

export function LabelLayer({ showSeas = true }: { showSeas?: boolean }) {
  const day = Math.floor(useDay());
  const countries = useMemo(
    () =>
      place(countryLabels).filter((l) => {
        if (l.name === 'АВСТРИЯ' && day < toDay('1945-05-08')) return false;
        if (
          day >= toDay('1940-06-15') &&
          (l.name === 'ЛИТВА' || l.name === 'ЛАТВИЯ' || l.name === 'ЭСТОНИЯ')
        ) {
          return false;
        }
        return true;
      }),
    [day],
  );
  const cities = useMemo(() => {
    const base = place(cityLabels).map((c) => ({ ...c, tone: toneFor(c.name, day) }));
    if (day < toDay('1945-05-08')) return base;
    return base.map((c) => (RENAMES[c.name] ? { ...c, name: RENAMES[c.name] } : c));
  }, [day]);
  const seas = useMemo(() => place(seaLabels), []);

  return (
    <g className="labels" pointerEvents="none">
      {countries.map((l) => (
        <text
          key={`c-${l.name}-${l.tier}`}
          className={`lbl-country tier-${l.tier}`}
          x={l.x}
          y={l.y}
          textAnchor="middle"
        >
          {l.name}
        </text>
      ))}

      {showSeas ? seas.map((l, i) => (
        <text key={`s-${l.name}-${i}`} className="lbl-sea" x={l.x} y={l.y} textAnchor="middle">
          {l.name}
        </text>
      )) : null}


      {cities.map((l) => (
        <g key={`t-${l.name}`} transform={`translate(${l.x.toFixed(1)} ${l.y.toFixed(1)})`}>
          <g className={`city tier-${l.tier} tone-${l.tone}`} style={{ transform: 'scale(var(--inv))' }}>
            <circle r={2.7} className="city-dot" />
            <text className="lbl-city" x={15} y={3.6}>
              {l.name}
            </text>
          </g>
        </g>
      ))}
    </g>
  );
}
