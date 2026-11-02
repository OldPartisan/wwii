import type { CameraApi } from './MapStage';
import { useDay } from '../lib/clock';
import { useUI } from '../lib/store';
import { bboxAround } from '../lib/geo';
import { events } from '../data/events';
import { captures } from '../data/captures';
import { formatDate, formatRange, toDay } from '../lib/date';
import { fmtNumber } from '../lib/format';
import { eventWikiUrl } from '../data/wiki';
import type { WarEvent } from '../types';

const TYPE_LABELS: Record<string, string> = {
  battle: 'Сражение',
  city: 'Город',
  landing: 'Десант',
  treaty: 'Договор',
  surrender: 'Капитуляция',
  air: 'Авиация',
  naval: 'Море',
  politics: 'Политика',
};

const MIN_DAYS = 5;

function windowEnd(e: WarEvent): number {
  const start = toDay(e.date);
  const end = e.endDate ? toDay(e.endDate) : start;
  return Math.max(end, start + MIN_DAYS);
}

export function EventWindows({ camera }: { camera: CameraApi | null }) {
  const day = useDay();
  const openEvent = useUI((s) => s.openEvent);
  const selected = useUI((s) => s.selectedEvent);

  if (selected) return null;

  const candidates = events
    .map((e) => {
      const start = toDay(e.date);
      const realEnd = e.endDate ? toDay(e.endDate) : start;
      return { e, start, end: windowEnd(e), duration: realEnd - start };
    })
    .filter(({ start, end }) => day >= start && day <= end)
    .filter(({ e, start }) => {
      const nearCapture = captures.some(
        (c) =>
          Math.abs(toDay(c.date) - start) < 1.5 &&
          Math.hypot(c.location.lat - e.location.lat, c.location.lng - e.location.lng) < 2,
      );
      return !nearCapture;
    });

  // Долгие стратегические события (Атлантика, Мальта) не должны занимать
  // карточку годами; они добавляются только как фон, если основных событий мало.
  const primary = candidates
    .filter(({ duration, e }) => duration <= 400 || (e.scale ?? 1) >= 3)
    .sort((a, b) => b.start - a.start);
  const primaryIds = new Set(primary.map((p) => p.e.id));
  const fillers = candidates
    .filter((c) => !primaryIds.has(c.e.id) && c.duration <= 800)
    .sort((a, b) => b.start - a.start)
    .slice(0, Math.max(0, 2 - primary.length));

  const active = [...primary, ...fillers]
    .sort(
      (a, b) =>
        b.start - a.start ||
        (b.e.scale ?? 1) - (a.e.scale ?? 1) ||
        b.end - a.end,
    )
    .slice(0, 3);

  if (!active.length) return null;

  const anchorLng = active[0].e.location.lng;
  const align = anchorLng > 10 ? 'align-left' : 'align-right';

  return (
    <div className={`event-windows ${align}`} aria-live="polite">
      {active.map(({ e, start, end }) => (
        <article
          key={e.id}
          className={`event-window side-${e.side ?? 'neutral'}`}
          onClick={() => {
            openEvent(e.id);
            camera?.focus(bboxAround(e.location, 10, 6.5), 1.5, 6.5);
          }}
        >
          <div className="ew-kicker">
            <span className="ew-type">{TYPE_LABELS[e.type]}</span>
            <span className="ew-dates">{e.endDate ? formatRange(start, toDay(e.endDate)) : formatDate(start)}</span>
          </div>
          <h3>{e.title}</h3>
          <p>{e.summary}</p>
          {e.casualties &&
          (e.casualties.axis != null ||
            e.casualties.allies != null ||
            e.casualties.civilian != null) ? (
            <div className="ew-losses">
              {e.casualties.axis != null ? (
                <span>
                  <em>Ось</em> {fmtNumber(e.casualties.axis)}
                </span>
              ) : null}
              {e.casualties.allies != null ? (
                <span>
                  <em>Союзники</em> {fmtNumber(e.casualties.allies)}
                </span>
              ) : null}
              {e.casualties.civilian != null ? (
                <span>
                  <em>Мирные</em> {fmtNumber(e.casualties.civilian)}
                </span>
              ) : null}
            </div>
          ) : null}
          <div className="ew-foot">
            <span className="ew-place">{e.place}</span>
            <span className="ew-foot-right">
              <a
                className="ew-wiki"
                href={eventWikiUrl(e)}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(ev) => ev.stopPropagation()}
              >
                Вики
              </a>
              <span className="ew-more">Подробнее →</span>
            </span>
          </div>
        </article>
      ))}
    </div>
  );
}
