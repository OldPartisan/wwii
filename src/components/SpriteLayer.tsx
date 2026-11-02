import { useEffect, useRef } from 'react';
import { clock } from '../lib/clock';
import { toDay } from '../lib/date';
import { quadAngle, quadFrom, quadPoint } from '../lib/geo';
import { arrows } from '../data/arrows';
import type { Side } from '../types';

const prepared = arrows.map((a) => ({
  ...a,
  q: quadFrom(a.from, a.to, a.bend ?? 0.12),
  start: toDay(a.fromDate),
  end: toDay(a.toDate),
}));

function latest(day: number, side: Side) {
  return prepared
    .filter(
      (a) =>
        a.side === side &&
        day >= a.start - 1 &&
        day <= a.end + 6 &&
        (a.kind === 'air' || a.kind === 'land'),
    )
    .sort((a, b) => a.start - b.start)
    .pop();
}

/** Светящийся маркер наступления: точка с хвостом, идущая по активной стрелке. */
export function SpriteLayer({ enabled }: { enabled: boolean }) {
  const axisRef = useRef<SVGGElement | null>(null);
  const alliesRef = useRef<SVGGElement | null>(null);

  useEffect(() => {
    return clock.subscribeFrame((day) => {
      const groups: [Side, SVGGElement | null][] = [
        ['axis', axisRef.current],
        ['allies', alliesRef.current],
      ];
      if (!enabled) {
        groups.forEach(([, g]) => {
          if (g) g.style.opacity = '0';
        });
        return;
      }

      for (const [side, g] of groups) {
        if (!g) continue;
        const a = latest(day, side);
        if (!a) {
          g.style.opacity = '0';
          continue;
        }
        const span = Math.max(1, a.end - a.start);
        const raw = Math.min(0.94, Math.max(0.08, (day - a.start) / span));
        const t = raw * raw * (3 - 2 * raw);
        const [x, y] = quadPoint(a.q, t);
        const angle = quadAngle(a.q, t);
        g.setAttribute(
          'transform',
          `translate(${x.toFixed(1)} ${y.toFixed(1)}) rotate(${angle.toFixed(1)})`,
        );
        g.style.opacity = '0.95';
      }
    });
  }, [enabled]);

  return (
    <g className="sprites" pointerEvents="none">
      <g ref={axisRef} className="advance side-axis" style={{ opacity: 0 }}>
        <g style={{ transform: 'scale(var(--inv))' }}>
          <circle cx={-15} r={1.2} className="advance-tail t3" />
          <circle cx={-10.5} r={1.7} className="advance-tail t2" />
          <circle cx={-6} r={2.2} className="advance-tail t1" />
          <circle r={7.5} className="advance-glow" />
          <circle r={3.1} className="advance-core" />
          <circle r={4.8} className="advance-ring" />
        </g>
      </g>
      <g ref={alliesRef} className="advance side-allies" style={{ opacity: 0 }}>
        <g style={{ transform: 'scale(var(--inv))' }}>
          <circle cx={-15} r={1.2} className="advance-tail t3" />
          <circle cx={-10.5} r={1.7} className="advance-tail t2" />
          <circle cx={-6} r={2.2} className="advance-tail t1" />
          <circle r={7.5} className="advance-glow" />
          <circle r={3.1} className="advance-core" />
          <circle r={4.8} className="advance-ring" />
        </g>
      </g>
    </g>
  );
}
