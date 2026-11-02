import { useContext, useMemo } from 'react';
import { CameraContext } from './MapStage';
import { useDay } from '../lib/clock';
import { useUI } from '../lib/store';
import { bboxAround, project } from '../lib/geo';
import { toDay } from '../lib/date';
import { commanders } from '../data/commanders';

const OFFSETS: [number, number][] = [
  [-18, -31],
  [18, -31],
  [-18, -54],
  [18, -54],
  [0, -70],
  [38, -31],
];

export function CommanderLayer() {
  const day = useDay();
  const openCommander = useUI((s) => s.openCommander);
  const { focus } = useContext(CameraContext);

  const active = useMemo(() => {
    return commanders.filter(
      (c) => c.pin && c.hq && day >= toDay(c.from) && day <= toDay(c.to),
    );
  }, [Math.floor(day)]);

  const byPlace = new Map<string, number>();

  return (
    <g className="commanders">
      {active.map((c) => {
        if (!c.hq) return null;
        const key = `${c.hq.lat},${c.hq.lng}`;
        const idx = byPlace.get(key) ?? 0;
        byPlace.set(key, idx + 1);
        const [ox, oy] = OFFSETS[idx % OFFSETS.length];
        const [x, y] = project(c.hq);
        return (
          <g
            key={c.id}
            className={`commander side-${c.side}`}
            transform={`translate(${(x + ox).toFixed(1)} ${(y + oy).toFixed(1)})`}
            onClick={(ev) => {
              ev.stopPropagation();
              openCommander(c.id);
              if (c.hq) focus(bboxAround(c.hq, 10, 6), 1.2, 6);
            }}
          >
            <g style={{ transform: 'scale(var(--inv))' }}>
              <line
                x1={-ox}
                y1={-oy}
                x2={0}
                y2={0}
                className="commander-leader"
              />
              <circle r={10.5} className="commander-ring" />
              {c.portrait ? (
                <image
                  href={c.portrait}
                  x={-9}
                  y={-9}
                  width={18}
                  height={18}
                  clipPath="circle(11px at 11px 11px)"
                  preserveAspectRatio="xMidYMid slice"
                />
              ) : (
                <text className="commander-initials" textAnchor="middle" y={4}>
                  {c.name.slice(0, 1)}
                </text>
              )}
            </g>
            <title>{`${c.name} · ${c.role}`}</title>
          </g>
        );
      })}
    </g>
  );
}
