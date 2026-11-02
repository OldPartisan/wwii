import { useEffect, useMemo, useRef, useState } from 'react';
import { clock, useDay, usePlayback } from '../lib/clock';
import { formatDate, toDay, TOTAL_DAYS, yearOf } from '../lib/date';
import { chapters } from '../data/chapters';

const YEARS = [1939, 1940, 1941, 1942, 1943, 1944, 1945];
const SPEEDS = [
  { value: 1, label: 'день' },
  { value: 7, label: 'неделя' },
  { value: 30, label: 'месяц' },
];

export function Timeline() {
  const day = useDay();
  const { playing, speed } = usePlayback();
  const trackRef = useRef<HTMLDivElement | null>(null);
  const fillRef = useRef<HTMLDivElement | null>(null);
  const knobRef = useRef<HTMLDivElement | null>(null);
  const [hover, setHover] = useState<number | null>(null);
  const dragging = useRef(false);

  useEffect(() => {
    return clock.subscribeFrame((d) => {
      const p = (d / TOTAL_DAYS) * 100;
      if (fillRef.current) fillRef.current.style.width = `${p}%`;
      if (knobRef.current) knobRef.current.style.left = `${p}%`;
    });
  }, []);

  const chapterSegments = useMemo(
    () =>
      chapters.map((c) => {
        const a = toDay(c.from);
        const b = Math.min(toDay(c.to), TOTAL_DAYS);
        return { ...c, left: (a / TOTAL_DAYS) * 100, width: ((b - a) / TOTAL_DAYS) * 100 };
      }),
    [],
  );

  const dayFromEvent = (e: React.PointerEvent<HTMLDivElement>) => {
    const el = trackRef.current;
    if (!el) return 0;
    const rect = el.getBoundingClientRect();
    const p = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    return p * TOTAL_DAYS;
  };

  const onDown = (e: React.PointerEvent<HTMLDivElement>) => {
    dragging.current = true;
    clock.setPlaying(false);
    clock.setDay(dayFromEvent(e));
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };

  const onMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const d = dayFromEvent(e);
    setHover(d);
    if (dragging.current) clock.setDay(d);
  };

  const onUp = (e: React.PointerEvent<HTMLDivElement>) => {
    dragging.current = false;
    (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
  };

  const hoverPct = hover !== null ? (hover / TOTAL_DAYS) * 100 : 0;

  return (
    <div className="timeline">
      <button
        className={`play-btn ${playing ? 'is-playing' : ''}`}
        onClick={() => clock.toggle()}
        title={playing ? 'Пауза (Space)' : 'Воспроизвести (Space)'}
        aria-label={playing ? 'Пауза' : 'Воспроизвести'}
      >
        {playing ? (
          <span className="pause-icon">
            <i />
            <i />
          </span>
        ) : (
          <span className="play-icon" />
        )}
      </button>

      <div className="time-meta">
        <div className="time-date">{formatDate(day)}</div>
        <div className="time-year">{yearOf(day)}</div>
      </div>

      <div className="track-zone">
        <div
          className="track"
          ref={trackRef}
          onPointerDown={onDown}
          onPointerMove={onMove}
          onPointerUp={onUp}
          onPointerLeave={() => setHover(null)}
        >
          <div className="track-rail" />
          <div className="track-chapters">
            {chapterSegments.map((c) => (
              <div
                key={c.id}
                className={`chapter-seg seg-${c.index}`}
                style={{ left: `${c.left}%`, width: `${c.width}%` }}
                title={`${c.title} · ${formatDate(toDay(c.from), { short: true })}`}
              />
            ))}
          </div>
          <div className="track-progress" ref={fillRef} />
          <div className="track-ticks">
            {YEARS.map((y) => {
              const d = y === 1939 ? 0 : toDay(`${y}-01-01`);
              return (
                <span key={y} className="year-tick" style={{ left: `${(d / TOTAL_DAYS) * 100}%` }}>
                  {y}
                </span>
              );
            })}
          </div>
          <div className="track-knob" ref={knobRef}>
            <span />
          </div>
          {hover !== null ? (
            <div className="track-hover" style={{ left: `${hoverPct}%` }}>
              {formatDate(hover)}
            </div>
          ) : null}
        </div>
      </div>

      <div className="speed-switch" role="group" aria-label="Скорость">
        {SPEEDS.map((s) => (
          <button
            key={s.value}
            className={speed === s.value ? 'is-active' : ''}
            onClick={() => clock.setSpeed(s.value)}
            title={`1 секунда = 1 ${s.label}`}
          >
            {s.label}
          </button>
        ))}
      </div>
    </div>
  );
}
