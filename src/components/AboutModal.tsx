import { useEffect } from 'react';
import { useUI } from '../lib/store';

export function AboutModal() {
  const open = useUI((s) => s.aboutOpen);
  const setAbout = useUI((s) => s.setAbout);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setAbout(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, setAbout]);

  if (!open) return null;

  return (
    <div className="modal-backdrop" onClick={() => setAbout(false)}>
      <article className="about-modal" role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={() => setAbout(false)} aria-label="Закрыть">
          ×
        </button>
        <div className="modal-kicker">О проекте</div>
        <h2>Интерактивная хроника Второй мировой</h2>
        <p className="lead">
          Шесть лет войны на одной карте: исторические границы 1938 и 1945 годов, линии фронта,
          наступления и ключевые сражения синхронизированы с единым таймлайном.
        </p>

        <div className="about-grid">
          <div>
            <h3>Управление</h3>
            <ul>
              <li>
                <kbd>Space</kbd> — пуск / пауза
              </li>
              <li>
                <kbd>←</kbd> <kbd>→</kbd> — ±7 дней, <kbd>Shift</kbd> — ±30 дней
              </li>
              <li>
                <kbd>Home</kbd> / <kbd>End</kbd> — начало и конец войны
              </li>
              <li>колесо — масштаб, перетаскивание — панорама</li>
            </ul>
          </div>
          <div>
            <h3>Что внутри</h3>
            <ul>
              <li>территории Оси, Союзников и оккупации</li>
              <li>линии фронта с интерполяцией по датам</li>
              <li>стрелки наступлений и спрайты техники</li>
              <li>сражения, командующие, потери</li>
              <li>анимация взятия городов</li>
              <li>окна событий на карте</li>
            </ul>
          </div>
        </div>

        <p className="about-note">
          Границы взяты из исторических базисов 1938 и 1945 годов; оккупационные зоны показаны
          цветом, а линии фронта схематизированы.
        </p>
        <p className="about-credit">
          Границы: historical-basemaps (CC BY-SA 4.0). Фотографии и портреты: Wikimedia Commons.{' '}
          <a className="about-credit-link" href="/data/image-credits.json" target="_blank" rel="noopener noreferrer">
            Авторы и лицензии
          </a>
        </p>

        <button className="ghost-btn" onClick={() => setAbout(false)}>
          Понятно
        </button>
      </article>
    </div>
  );
}
