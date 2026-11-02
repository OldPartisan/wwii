import { useEffect, useMemo, useRef } from 'react';
import gsap from 'gsap';
import { clock } from '../lib/clock';
import { TOTAL_DAYS } from '../lib/date';
import { toDay } from '../lib/date';
import { quadAngle, quadFrom, quadPath, quadPoint } from '../lib/geo';
import { arrows } from '../data/arrows';

const HEAD = 'M0,-8.5 L11,0 L0,8.5 Z';

const prepared = arrows.map((a) => {
  const q = quadFrom(a.from, a.to, a.bend ?? 0.12);
  return {
    ...a,
    q,
    path: quadPath(q),
    start: toDay(a.fromDate),
    end: toDay(a.toDate),
    weight: a.weight ?? 2,
  };
});

const HOLD_DAYS = 75;

/**
 * Стрелки рисуются GSAP-таймлайном, «прикрученным» к глобальному времени:
 * каждый твин занимает ровно тот интервал, в который наступление шло исторически.
 * Перемотка — это master.time(day), поэтому стрелка всегда соответствует дате.
 */
const arrowStates = new Map<string, { p: number }>();
const master = gsap.timeline({ paused: true });
for (const a of prepared) {
  const state = { p: 0 };
  arrowStates.set(a.id, state);
  master.fromTo(
    state,
    { p: 0 },
    { p: 1, duration: Math.max(0.01, a.end - a.start), ease: 'power1.inOut' },
    a.start,
  );
}
master.duration(Math.max(TOTAL_DAYS, 1));

export function ArrowLayer({ enabled }: { enabled: boolean }) {
  const groupRefs = useRef<Record<string, SVGGElement | null>>({});
  const coreRefs = useRef<Record<string, SVGPathElement | null>>({});
  const haloRefs = useRef<Record<string, SVGPathElement | null>>({});
  const glowRefs = useRef<Record<string, SVGPathElement | null>>({});
  const headRefs = useRef<Record<string, SVGGElement | null>>({});
  const labelRefs = useRef<Record<string, SVGTextElement | null>>({});
  const lengths = useRef<Record<string, number>>({});

  useEffect(() => {
    for (const a of prepared) {
      const el = coreRefs.current[a.id];
      if (el) lengths.current[a.id] = el.getTotalLength();
    }
  }, []);

  useEffect(() => {
    return clock.subscribeFrame((day) => {
      master.time(Math.max(0, Math.min(TOTAL_DAYS, day)));
      for (const a of prepared) {
        const g = groupRefs.current[a.id];
        const core = coreRefs.current[a.id];
        const halo = haloRefs.current[a.id];
        const glow = glowRefs.current[a.id];
        const head = headRefs.current[a.id];
        const label = labelRefs.current[a.id];
        if (!g || !core || !halo || !glow) continue;

        const visible = enabled && day >= a.start - 1 && day <= a.end + HOLD_DAYS;
        if (!visible) {
          g.style.opacity = '0';
          continue;
        }
        const t = Math.max(0, Math.min(1, arrowStates.get(a.id)?.p ?? 0));
        const fadeIn = Math.min(1, (day - a.start + 0.8) / 2.2);
        const fadeOut = day > a.end ? Math.max(0, 1 - (day - a.end) / HOLD_DAYS) : 1;
        g.style.opacity = String(Math.min(fadeIn, fadeOut));

        const len = lengths.current[a.id] ?? 100;
        const dash = `${len}`;
        core.style.strokeDasharray = dash;
        core.style.strokeDashoffset = String(len * (1 - t));
        halo.style.strokeDasharray = dash;
        halo.style.strokeDashoffset = String(len * (1 - t));
        glow.style.strokeDasharray = dash;
        glow.style.strokeDashoffset = String(len * (1 - t));

        const [hx, hy] = quadPoint(a.q, t);
        const angle = quadAngle(a.q, t);
        if (head) {
          head.setAttribute('transform', `translate(${hx.toFixed(1)} ${hy.toFixed(1)}) rotate(${angle.toFixed(1)})`);
          head.style.opacity = t > 0.03 ? '1' : '0';
        }
        if (label) {
          label.style.opacity = t > 0.32 ? String(Math.min(1, (t - 0.32) * 4)) : '0';
        }
      }
    });
  }, [enabled]);

  const items = useMemo(() => prepared, []);

  return (
    <g className="arrows">
      {items.map((a) => {
        const [lx, ly] = quadPoint(a.q, 0.55);
        return (
          <g
            key={a.id}
            data-arrow={a.id}
            ref={(el) => {
              groupRefs.current[a.id] = el;
            }}
            style={{ opacity: 0 }}
            className={`arrow w${a.weight} side-${a.side}`}
          >
            <path className="arrow-route" d={a.path} />
            <path
              ref={(el) => {
                glowRefs.current[a.id] = el;
              }}
              className="arrow-glow"
              d={a.path}
            />
            <path
              ref={(el) => {
                haloRefs.current[a.id] = el;
              }}
              className="arrow-halo"
              d={a.path}
            />
            <path
              ref={(el) => {
                coreRefs.current[a.id] = el;
              }}
              className="arrow-core"
              d={a.path}
            />
            <g
              ref={(el) => {
                headRefs.current[a.id] = el;
              }}
              className="arrow-head"
            >
              <g style={{ transform: 'scale(var(--inv))' }}>
                <path d={HEAD} className="arrow-tip" />
              </g>
            </g>
            {a.label ? (
              <text
                ref={(el) => {
                  labelRefs.current[a.id] = el;
                }}
                className="arrow-label"
                x={lx}
                y={ly - 8}
              >
                {a.label}
              </text>
            ) : null}
          </g>
        );
      })}
    </g>
  );
}
