import type { CameraApi } from './MapStage';
import { useUI } from '../lib/store';
import type { Theater } from '../types';

const THEATER_LABELS: { id: Theater; label: string }[] = [
  { id: 'world', label: 'Мир' },
  { id: 'europe', label: 'Европа' },
  { id: 'africa', label: 'Африка' },
  { id: 'pacific', label: 'Тихий океан' },
];

export function TopControls({ camera }: { camera: CameraApi }) {
  const theater = useUI((s) => s.theater);
  const setTheater = useUI((s) => s.setTheater);
  const setAbout = useUI((s) => s.setAbout);

  return (
    <div className="top-controls">
      <div className="theaters" role="group" aria-label="Театр военных действий">
        {THEATER_LABELS.map((t) => (
          <button
            key={t.id}
            className={`theater-chip ${theater === t.id ? 'is-active' : ''}`}
            onClick={() => setTheater(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="side-controls">
        <div className="zoom-cluster">
          <button className="icon-btn" onClick={() => camera.zoomBy(1.5)} title="Приблизить">
            +
          </button>
          <button className="icon-btn" onClick={() => camera.zoomBy(0.66)} title="Отдалить">
            −
          </button>
          <button className="icon-btn" onClick={camera.reset} title="Сбросить вид">
            ⌂
          </button>
        </div>
        <button
          className="icon-btn about-btn"
          onClick={() => setAbout(true)}
          title="О проекте"
          aria-label="О проекте"
        >
          i
        </button>
      </div>
    </div>
  );
}
