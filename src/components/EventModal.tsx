import { useEffect, useMemo } from 'react';
import { eventById } from '../data/events';
import { eventWikiUrl } from '../data/wiki';
import { commanderById } from '../data/commanders';
import { useUI } from '../lib/store';
import { formatDate, formatRange, toDay } from '../lib/date';
import { fmtNumber } from '../lib/format';
import type { CountrySets } from '../lib/useCountries';
import { BattleMap } from './BattleMap';

const TYPE_LABELS: Record<string, string> = {
  battle: 'Сражение',
  city: 'Город',
  landing: 'Десантная операция',
  treaty: 'Договор',
  surrender: 'Капитуляция',
  air: 'Война в воздухе',
  naval: 'Война на море',
  politics: 'Политика',
};

export function EventModal({ sets }: { sets: CountrySets }) {
  const selected = useUI((s) => s.selectedEvent);
  const close = useUI((s) => s.closeEvent);
  const openCommander = useUI((s) => s.openCommander);
  const event = selected ? eventById.get(selected) : undefined;

  useEffect(() => {
    if (!event) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [event, close]);

  const commanders = useMemo(
    () => (event?.commanders ?? []).map((id) => commanderById.get(id)).filter(Boolean),
    [event?.id],
  );

  if (!event) return null;

  const start = toDay(event.date);
  const end = event.endDate ? toDay(event.endDate) : null;
  const hasCasualties =
    event.casualties && (event.casualties.axis || event.casualties.allies || event.casualties.civilian);

  return (
    <div className="modal-backdrop" onClick={close}>
      <article className="event-modal" role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={close} aria-label="Закрыть">
          ×
        </button>

        <header className="modal-head">
          <div className="modal-kicker">
            <span className={`type-badge type-${event.type}`}>{TYPE_LABELS[event.type]}</span>
            <span className="modal-date">
              {end ? formatRange(start, end) : formatDate(start)}
            </span>
          </div>
          <h2>{event.title}</h2>
          <div className="modal-place">{event.place}</div>
        </header>

        <div className="modal-scroll">
          <div className="modal-grid">
            <div className="modal-media">
              {event.photo ? (
                <figure className="archive-photo">
                  <img src={event.photo} alt={event.photoCaption ?? event.title} loading="lazy" />
                  <figcaption>
                    {event.photoCaption}
                    {event.photoCaption ? ' · ' : ''}
                    <span className="photo-credit">Wikimedia Commons</span>
                  </figcaption>
                </figure>
              ) : null}
              <BattleMap event={event} sets={sets} />
            </div>

            <div className="modal-text">
              <p className="lead">{event.summary}</p>
              {event.detail ? <p>{event.detail}</p> : null}

              {event.result ? (
                <div className="result-box">
                  <span>Итог</span>
                  <strong>{event.result}</strong>
                </div>
              ) : null}

              {hasCasualties ? (
                <div className="casualties">
                  <div className="casualties-title">Потери</div>
                  <div className="casualties-grid">
                    {event.casualties?.axis ? (
                      <div>
                        <span>Ось</span>
                        <strong>{fmtNumber(event.casualties.axis)}</strong>
                      </div>
                    ) : null}
                    {event.casualties?.allies ? (
                      <div>
                        <span>Союзники</span>
                        <strong>{fmtNumber(event.casualties.allies)}</strong>
                      </div>
                    ) : null}
                    {event.casualties?.civilian ? (
                      <div>
                        <span>Мирные жители</span>
                        <strong>{fmtNumber(event.casualties.civilian)}</strong>
                      </div>
                    ) : null}
                  </div>
                  {event.casualties?.note ? (
                    <div className="casualties-note">{event.casualties.note}</div>
                  ) : null}
                </div>
              ) : null}

              {commanders.length ? (
                <div className="modal-commanders">
                  <div className="casualties-title">Командующие</div>
                  <div className="commander-list">
                    {commanders.map((c) => (
                      <button
                        key={c!.id}
                        className={`commander-line side-${c!.side}`}
                        onClick={() => openCommander(c!.id)}
                      >
                        <span className="commander-ava">
                          {c!.portrait ? <img src={c!.portrait} alt="" /> : c!.name.slice(0, 1)}
                        </span>
                        <span>
                          <strong>{c!.name}</strong>
                          <em>{c!.role}</em>
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </div>

        <footer className="modal-foot">
          <span>Хроника Второй мировой · 1939–1945</span>
          <div className="modal-foot-actions">
            <a
              className="wiki-link"
              href={eventWikiUrl(event)}
              target="_blank"
              rel="noopener noreferrer"
            >
              Википедия ↗
            </a>
            <button className="ghost-btn" onClick={close}>
              Закрыть
            </button>
          </div>
        </footer>
      </article>
    </div>
  );
}
