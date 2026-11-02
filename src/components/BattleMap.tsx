import { useMemo } from 'react';
import { geoBounds, geoGraticule, geoMercator, geoPath } from 'd3-geo';
import type { CountrySets } from '../lib/useCountries';
import type { WarEvent } from '../types';
import { fronts } from '../data/fronts';
import { toDay } from '../lib/date';
import { cityLabels } from '../data/labels';

const W = 540;
const H = 320;

export function BattleMap({ event, sets }: { event: WarEvent; sets: CountrySets }) {
  const eventDay = toDay(event.date);
  const eraKey =
    eventDay >= toDay('1945-05-08')
      ? 'y1945'
      : eventDay >= toDay('1940-06-15')
        ? 'y1940'
        : eventDay >= toDay('1939-09-17')
          ? 'y1939'
          : 'y1938';
  const shapes = sets[eraKey];
  const projection = useMemo(() => {
    const lats = [event.location.lat, ...(event.ops ?? []).flatMap((o) => [o.from.lat, o.to.lat])];
    const lngs = [event.location.lng, ...(event.ops ?? []).flatMap((o) => [o.from.lng, o.to.lng])];
    const padLat = Math.max(2.0, (Math.max(...lats) - Math.min(...lats)) * 0.9);
    const padLng = Math.max(2.8, (Math.max(...lngs) - Math.min(...lngs)) * 0.9);
    const west = Math.min(...lngs) - padLng;
    const east = Math.max(...lngs) + padLng;
    const south = Math.min(...lats) - padLat;
    const north = Math.max(...lats) + padLat;
    const bbox = {
      type: 'Polygon' as const,
      coordinates: [
        [
          [west, north],
          [east, north],
          [east, south],
          [west, south],
          [west, north],
        ],
      ],
    };
    return geoMercator().fitExtent(
      [
        [4, 4],
        [W - 4, H - 4],
      ],
      bbox as never,
    );
  }, [event.id]);

  const pathGen = useMemo(() => geoPath(projection), [projection]);
  const graticule = useMemo(() => pathGen(geoGraticule().step([2, 2])()) ?? '', [pathGen]);

  const visible = useMemo(() => {
    const tl = projection.invert?.([0, 0]);
    const br = projection.invert?.([W, H]);
    if (!tl || !br) return shapes;
    const west = tl[0] - 1;
    const north = tl[1] + 1;
    const east = br[0] + 1;
    const south = br[1] - 1;
    return shapes.filter((s) => {
      try {
        const [[w, so], [e, n]] = geoBounds(s.feature as never);
        return !(e < west || w > east || n < south || so > north);
      } catch {
        return false;
      }
    });
  }, [shapes, projection]);

  const [cx, cy] = projection([event.location.lng, event.location.lat]) ?? [W / 2, H / 2];

  const nearby = useMemo(() => {
    const list = cityLabels
      .map((c) => {
        const p = projection([c.lng, c.lat]);
        if (!p) return null;
        const [x, y] = p;
        if (x < 8 || x > W - 8 || y < 8 || y > H - 8) return null;
        return { name: c.name, x, y, d: Math.hypot(x - cx, y - cy) };
      })
      .filter((v): v is { name: string; x: number; y: number; d: number } => Boolean(v))
      .sort((a, b) => a.d - b.d)
      .slice(0, 7);
    return list;
  }, [projection, cx, cy]);

  const frontPaths = useMemo(() => {
    const day = toDay(event.date);
    const paths: string[] = [];
    for (const f of fronts) {
      const ready = f.keyframes.filter((k) => toDay(k.date) <= day);
      if (!ready.length) continue;
      const kf = ready[ready.length - 1];
      const pts = kf.points
        .map(([lng, lat]) => projection([lng, lat]))
        .filter((p): p is [number, number] => Boolean(p));
      if (pts.length < 2) continue;
      paths.push(pts.map((p, i) => `${i ? 'L' : 'M'}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(''));
    }
    return paths;
  }, [event.id, projection]);

  return (
    <div className="battle-map">
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`Схема: ${event.title}`}>
        <defs>
          <clipPath id="bm-clip">
            <rect width={W} height={H} />
          </clipPath>
        </defs>
        <rect width={W} height={H} fill="#b7c9c6" />
        <path d={graticule} fill="none" stroke="rgba(40,60,58,0.12)" strokeWidth={0.6} />

        <g>
          {visible.map((s) => {
            const d = pathGen(s.feature as never);
            return d ? (
              <path key={s.name} d={d} fill="#e0d6c0" stroke="#8d8168" strokeWidth={0.7} />
            ) : null;
          })}
        </g>

        {(event.ops ?? []).map((op, i) => {
          const a = projection([op.from.lng, op.from.lat]);
          const b = projection([op.to.lng, op.to.lat]);
          if (!a || !b) return null;
          const mx = (a[0] + b[0]) / 2;
          const my = (a[1] + b[1]) / 2;
          const dx = b[0] - a[0];
          const dy = b[1] - a[1];
          const len = Math.hypot(dx, dy) || 1;
          const nx = -dy / len;
          const ny = dx / len;
          const bend = (op.bend ?? 0.18) * len;
          const cxx = mx + nx * bend;
          const cyy = my + ny * bend;
          const color = op.side === 'axis' ? '#a23a2e' : '#2f5e7c';
          const angle = (Math.atan2(b[1] - cyy, b[0] - cxx) * 180) / Math.PI;
          return (
            <g key={i}>
              <path
                d={`M${a[0]},${a[1]} Q${cxx},${cyy} ${b[0]},${b[1]}`}
                fill="none"
                stroke="rgba(246,240,228,0.6)"
                strokeWidth={7}
                strokeLinecap="round"
              />
              <path
                d={`M${a[0]},${a[1]} Q${cxx},${cyy} ${b[0]},${b[1]}`}
                fill="none"
                stroke={color}
                strokeWidth={3.2}
                strokeLinecap="round"
              />
              <path
                d="M0,0 L-10,-4.5 L-7.5,0 L-10,4.5 Z"
                fill={color}
                transform={`translate(${b[0]} ${b[1]}) rotate(${angle})`}
              />
            </g>
          );
        })}

        <g clipPath="url(#bm-clip)">
          {frontPaths.map((d, i) => (
            <path key={i} d={d} fill="none" stroke="#2a241c" strokeWidth={1.6} opacity={0.7} />
          ))}
        </g>

        {nearby.map((c) => (
          <g key={c.name} transform={`translate(${c.x.toFixed(1)} ${c.y.toFixed(1)})`}>
            <circle r={1.8} fill="#3a3328" />
            <text x={4.5} y={2.8} className="bm-city">
              {c.name}
            </text>
          </g>
        ))}

        <g transform={`translate(${cx} ${cy})`}>
          <circle r={13} fill="none" stroke="#a23a2e" strokeWidth={1} opacity={0.3} />
          <circle r={8} fill="none" stroke="#a23a2e" strokeWidth={1.2} opacity={0.6} />
          <circle r={4} fill="#a23a2e" stroke="#f4eee0" strokeWidth={1.2} />
        </g>

        <g transform={`translate(${W - 26} 30)`} opacity={0.65}>
          <path d="M0,-12 L3.6,6 L0,2.4 L-3.6,6 Z" fill="#3a3328" />
          <text x={0} y={-16} textAnchor="middle" className="battle-north">
            С
          </text>
        </g>

        <g transform={`translate(10 ${H - 10})`}>
          <rect
            x={0}
            y={-15}
            width={Math.min(340, event.place.length * 6.2 + 16)}
            height={19}
            fill="rgba(240,233,218,0.8)"
          />
          <text x={7} y={-2} className="battle-caption">
            {event.place}
          </text>
        </g>
      </svg>
      <div className="battle-map-tag">Схема сражения</div>
    </div>
  );
}
