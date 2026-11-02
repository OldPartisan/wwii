import { useContext, useMemo } from 'react';
import { CameraContext } from './MapStage';
import { useDay } from '../lib/clock';
import { useUI } from '../lib/store';
import { project } from '../lib/geo';
import { bboxAround } from '../lib/geo';
import { toDay } from '../lib/date';
import { events } from '../data/events';
import type { EventType } from '../types';

const GLYPHS: Record<EventType, string> = {
  battle: 'M-4,-4 L4,4 M4,-4 L-4,4',
  city: 'M-3.5,-4 L3.5,-4 L3.5,4 L-3.5,4 Z',
  landing: 'M-4,-3 L4,-3 L0,4 Z',
  air: 'M0,-5 L1.6,-1 L5.2,1.2 L1.8,2 L0,5.4 L-1.8,2 L-5.2,1.2 L-1.6,-1 Z',
  naval: 'M-5,-1 L5,-1 L3,3 L-3,3 Z',
  treaty: 'M-4,-4 L4,-4 L4,4 L-4,4 Z M-2,-1 L2,-1 M-2,1 L2,1',
  surrender: 'M-3.5,-5 L-3.5,5 M-3.5,-5 L4,-3.5 L-3.5,-1',
  politics: 'M0,-5 L5,0 L0,5 L-5,0 Z',
};

function Glyph({ type }: { type: EventType }) {
  return <path d={GLYPHS[type]} className="marker-glyph" />;
}

export function MarkerLayer() {
  const day = useDay();
  const openEvent = useUI((s) => s.openEvent);
  const { focus } = useContext(CameraContext);

  const visible = useMemo(() => {
    return events.filter((e) => day >= toDay(e.date) - 1);
  }, [Math.floor(day)]);

  return (
    <g className="markers">
      {visible.map((e) => {
        const [x, y] = project(e.location);
        const start = toDay(e.date);
        const end = e.endDate ? toDay(e.endDate) : start;
        const active = day <= end + 10;
        return (
          <g
            key={e.id}
            className={`marker type-${e.type} side-${e.side ?? 'neutral'} ${active ? 'is-active' : ''} ${
              e.scale === 3 ? 'is-major' : ''
            }`}
            transform={`translate(${x.toFixed(1)} ${y.toFixed(1)})`}
            onClick={(ev) => {
              ev.stopPropagation();
              openEvent(e.id);
              focus(bboxAround(e.location, 11, 7), 1.5, 6.5);
            }}
          >
            <g style={{ transform: 'scale(var(--inv))' }}>
              {active ? <circle r={e.scale === 3 ? 11 : 9} className="marker-pulse" /> : null}
              <circle r={e.scale === 3 ? 11 : 9.2} className="marker-ring" />
              <circle r={e.scale === 3 ? 8.8 : 7.2} className="marker-fill" />
              <Glyph type={e.type} />
            </g>
            <title>{`${e.title} · ${e.place}`}</title>
          </g>
        );
      })}
    </g>
  );
}
