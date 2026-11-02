import { useMemo } from 'react';
import type { CameraApi } from './MapStage';
import { useDay } from '../lib/clock';
import { useUI } from '../lib/store';
import { bboxAround } from '../lib/geo';
import { chapterAt, chapters } from '../data/chapters';
import { daysOfEvent, events } from '../data/events';
import { commanders } from '../data/commanders';
import { formatDate, toDay, weekdayName } from '../lib/date';
import { statusColors } from '../data/control';

const ROMAN = ['I', 'II', 'III', 'IV', 'V', 'VI'];

export function SidePanel({ camera }: { camera: CameraApi | null }) {
  const day = useDay();
  const openEvent = useUI((s) => s.openEvent);
  const openCommander = useUI((s) => s.openCommander);
  const layers = useUI((s) => s.layers);
  const toggleLayer = useUI((s) => s.toggleLayer);

  const chapter = useMemo(() => chapterAt(day, toDay), [Math.floor(day)]);
  const chapterIndex = chapters.findIndex((c) => c.id === chapter.id);

  const near = useMemo(() => {
    return events
      .map((e) => {
        const d = daysOfEvent(e);
        const end = e.endDate ? toDay(e.endDate) : d;
        return { e, d, end, active: day >= d && day <= end };
      })
      .filter(({ d, active }) => active || (d <= day + 4 && d >= day - 150))
      .sort((a, b) => Number(b.active) - Number(a.active) || b.d - a.d)
      .slice(0, 5);
  }, [Math.floor(day)]);

  const activeCommanders = useMemo(() => {
    return commanders.filter((c) => day >= toDay(c.from) && day <= toDay(c.to)).slice(0, 8);
  }, [Math.floor(day)]);

  return (
    <aside className="side-panel">
      <header className="brand">
        <div className="brand-eyebrow">Хроника войны</div>
        <h1>Вторая мировая</h1>
        <div className="brand-years">1939 — 1945</div>
      </header>

      <section className="date-block">
        <div className="date-value">{formatDate(day)}</div>
        <div className="date-sub">
          {weekdayName(day)} · день {Math.floor(day) + 1}
        </div>
      </section>

      <section className="chapter-block">
        <div className="chapter-label">
          <span className="chapter-dot" />
          Глава {ROMAN[Math.max(0, chapterIndex)]}
        </div>
        <h2>{chapter.title}</h2>
        <p>{chapter.summary}</p>
      </section>

      <section className="panel-section">
        <div className="section-title">
          <span>События</span>
          <span className="section-count">{near.length}</span>
        </div>
        <ul className="event-list">
          {near.map(({ e, d, end }) => {
            const start = d;
            const isNow = day >= start && day <= end + 3;
            return (
              <li key={e.id}>
                <button
                  className={`event-row ${isNow ? 'is-now' : ''}`}
                  onClick={() => {
                    openEvent(e.id);
                    camera?.focus(bboxAround(e.location, 11, 7), 1.5, 6.5);
                  }}
                >
                  <span className={`event-date ${d > day ? 'is-future' : ''}`}>
                    {formatDate(d, { short: true })}
                  </span>
                  <span className="event-body">
                    <span className="event-title">{e.title}</span>
                    <span className="event-place">{e.place}</span>
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </section>

      <section className="panel-section">
        <div className="section-title">
          <span>Командующие</span>
        </div>
        <div className="commander-strip">
          {activeCommanders.map((c) => (
            <button
              key={c.id}
              className={`commander-card side-${c.side}`}
              onClick={() => openCommander(c.id)}
              title={`${c.name} — ${c.role}`}
            >
              <span className="commander-photo">
                {c.portrait ? <img src={c.portrait} alt={c.name} loading="lazy" /> : c.name.slice(0, 1)}
              </span>
              <span className="commander-name">{c.name.split(' ').slice(-1)[0]}</span>
            </button>
          ))}
        </div>
      </section>

      <section className="panel-section">
        <div className="section-title">
          <span>Слои</span>
        </div>
        <div className="layer-chips">
          {(
            [
              ['territories', 'Территории'],
              ['fronts', 'Фронты'],
              ['arrows', 'Наступления'],
              ['places', 'Сражения'],
              ['commanders', 'Портреты'],
              ['sprites', 'Движение'],
            ] as const
          ).map(([key, label]) => (
            <button
              key={key}
              className={`layer-chip ${layers[key] ? 'is-on' : ''}`}
              onClick={() => toggleLayer(key)}
            >
              <span className="layer-dot" />
              {label}
            </button>
          ))}
        </div>
      </section>

      <footer className="panel-footer">
        <div className="legend">
          {(
            [
              ['axis', 'Ось'],
              ['axis-occupied', 'Оккупировано Осью'],
              ['allies', 'Союзники'],
              ['allies-occupied', 'Занято союзниками'],
              ['neutral', 'Нейтральные'],
            ] as const
          ).map(([k, label]) => (
            <span key={k} className="legend-item">
              <i style={{ background: statusColors[k] }} />
              {label}
            </span>
          ))}
        </div>
        <p className="disclaimer">
          Границы и линии фронта схематизированы. Проект — визуальная хроника, а не точная
          историческая картография.
        </p>
      </footer>
    </aside>
  );
}
