import { useEffect } from 'react';
import { commanderById } from '../data/commanders';
import { useUI } from '../lib/store';
import { formatDate, toDay } from '../lib/date';
import { commanderWikiUrl } from '../data/wiki';

const SIDE_LABEL: Record<string, string> = {
  axis: 'Страны Оси',
  allies: 'Союзники',
  neutral: 'Нейтрал',
};

export function CommanderModal() {
  const selected = useUI((s) => s.selectedCommander);
  const close = useUI((s) => s.closeCommander);
  const commander = selected ? commanderById.get(selected) : undefined;

  useEffect(() => {
    if (!commander) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [commander, close]);

  if (!commander) return null;

  return (
    <div className="modal-backdrop" onClick={close}>
      <article className="commander-modal" role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={close} aria-label="Закрыть">
          ×
        </button>
        <div className="commander-portrait">
          {commander.portrait ? (
            <img src={commander.portrait} alt={commander.name} />
          ) : (
            <div className="portrait-fallback">{commander.name.slice(0, 1)}</div>
          )}
          <span className={`side-flag side-${commander.side}`}>{SIDE_LABEL[commander.side]}</span>
          <span className="portrait-credit">Wikimedia Commons</span>
        </div>
        <div className="commander-content">
          <div className="modal-kicker">{commander.country}</div>
          <h2>{commander.name}</h2>
          <div className="commander-role">{commander.role}</div>
          <div className="commander-years">
            {formatDate(toDay(commander.from))} — {formatDate(toDay(commander.to))}
          </div>
          {commander.bio ? <p>{commander.bio}</p> : null}
          <div className="commander-actions">
            <a
              className="wiki-link"
              href={commanderWikiUrl(commander)}
              target="_blank"
              rel="noopener noreferrer"
            >
              Википедия ↗
            </a>
            <button className="ghost-btn" onClick={close}>
              Закрыть
            </button>
          </div>
        </div>
      </article>
    </div>
  );
}
