import { useEffect, useMemo, useRef } from 'react';
import { clock } from '../lib/clock';
import { lerpPoints, polylinePath, projectLngLat, resample } from '../lib/geo';
import { toDay } from '../lib/date';
import { fronts } from '../data/fronts';

const N = 110;

interface PreparedFront {
  id: string;
  name: string;
  frames: { day: number; pts: [number, number][] }[];
}

const prepared: PreparedFront[] = fronts.map((f) => ({
  id: f.id,
  name: f.name,
  frames: f.keyframes
    .slice()
    .sort((a, b) => toDay(a.date) - toDay(b.date))
    .map((k) => ({
      day: toDay(k.date),
      pts: resample(
        k.points.map(([lng, lat]) => projectLngLat(lng, lat)),
        N,
      ),
    })),
}));

function sample(frames: { day: number; pts: [number, number][] }[], day: number) {
  if (day < frames[0].day) return null;
  if (day >= frames[frames.length - 1].day) return frames[frames.length - 1].pts;
  let i = 0;
  while (i < frames.length - 1 && day >= frames[i + 1].day) i++;
  const a = frames[i];
  const b = frames[i + 1];
  const raw = (day - a.day) / (b.day - a.day || 1);
  const t = Math.max(0, Math.min(1, raw));
  const eased = t * t * (3 - 2 * t);
  return lerpPoints(a.pts, b.pts, eased);
}

export function FrontLayer({ enabled }: { enabled: boolean }) {
  const coreRefs = useRef<Record<string, SVGPathElement | null>>({});
  const glowRefs = useRef<Record<string, SVGPathElement | null>>({});

  const last = useRef<Record<string, string>>({});

  useEffect(() => {
    return clock.subscribeFrame((day) => {
      for (const f of prepared) {
        const core = coreRefs.current[f.id];
        const glow = glowRefs.current[f.id];
        if (!core || !glow) continue;
        const pts = enabled ? sample(f.frames, day) : null;
        if (!pts) {
          core.style.opacity = '0';
          glow.style.opacity = '0';
          continue;
        }
        const d = polylinePath(pts);
        if (last.current[f.id] !== d) {
          core.setAttribute('d', d);
          glow.setAttribute('d', d);
          last.current[f.id] = d;
        }
        core.style.opacity = '0.9';
        glow.style.opacity = '0.22';
      }
    });
  }, [enabled]);

  const paths = useMemo(() => prepared, []);

  return (
    <g className="fronts">
      {paths.map((f) => (
        <g key={f.id}>
          <path
            ref={(el) => {
              glowRefs.current[f.id] = el;
            }}
            className="front-glow"
          />
          <path
            ref={(el) => {
              coreRefs.current[f.id] = el;
            }}
            className="front-core"
          />
        </g>
      ))}
    </g>
  );
}
