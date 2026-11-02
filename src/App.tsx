import { useCallback, useEffect, useState } from 'react';
import { MapStage, type CameraApi } from './components/MapStage';
import { EventWindows } from './components/EventWindows';
import { SidePanel } from './components/SidePanel';
import { Timeline } from './components/Timeline';
import { EventModal } from './components/EventModal';
import { CommanderModal } from './components/CommanderModal';
import { AboutModal } from './components/AboutModal';
import { useCountries } from './lib/useCountries';
import { clock } from './lib/clock';
import { TOTAL_DAYS } from './lib/date';
import { useUI } from './lib/store';

function Splash() {
  return (
    <div className="splash">
      <div className="splash-inner">
        <div className="splash-eyebrow">Интерактивная хроника</div>
        <h1>Вторая мировая</h1>
        <div className="splash-years">1939 — 1945</div>
        <div className="splash-bar">
          <span />
        </div>
        <div className="splash-note">Загружаем карту Европы и театров войны…</div>
      </div>
    </div>
  );
}

export default function App() {
  const sets = useCountries();
  const [camera, setCamera] = useState<CameraApi | null>(null);
  const [panelOpen, setPanelOpen] = useState(false);
  const closeEvent = useUI((s) => s.closeEvent);
  const closeCommander = useUI((s) => s.closeCommander);
  const setAbout = useUI((s) => s.setAbout);

  useEffect(() => {
    clock.start();
    const timer = window.setTimeout(() => clock.setPlaying(true), 3500);
    return () => {
      window.clearTimeout(timer);
      clock.stop();
    };
  }, []);

  const onCamera = useCallback((api: CameraApi) => setCamera(api), []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (target && ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName)) return;

      if (e.code === 'Space') {
        e.preventDefault();
        clock.toggle();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        clock.setDay(clock.day + (e.shiftKey ? 30 : 7));
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        clock.setDay(clock.day - (e.shiftKey ? 30 : 7));
      } else if (e.key === 'Home') {
        clock.setDay(0);
      } else if (e.key === 'End') {
        clock.setDay(TOTAL_DAYS);
      } else if (e.key === 'Escape') {
        closeEvent();
        closeCommander();
        setAbout(false);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [closeEvent, closeCommander, setAbout]);

  return (
    <div className={`app ${panelOpen ? 'panel-open' : ''}`}>
      <MapStage sets={sets ?? { y1938: [], y1939: [], y1940: [], y1945: [] }} onCamera={onCamera} />
      <EventWindows camera={camera} />
      <SidePanel camera={camera} />
      <button
        className="mobile-panel-toggle"
        onClick={() => setPanelOpen((v) => !v)}
        aria-label={panelOpen ? 'Закрыть хронику' : 'Открыть хронику'}
      >
        {panelOpen ? 'Закрыть' : 'Хроника'}
      </button>
      {panelOpen ? (
        <button
          className="mobile-backdrop"
          onClick={() => setPanelOpen(false)}
          aria-label="Закрыть панель"
        />
      ) : null}
      <Timeline />
      <EventModal sets={sets ?? { y1938: [], y1939: [], y1940: [], y1945: [] }} />
      <CommanderModal />
      <AboutModal />
      {!sets ? <Splash /> : null}
    </div>
  );
}
