import { createContext, useCallback, useEffect, useMemo, useRef } from 'react';
import { select } from 'd3-selection';
import { zoom, zoomIdentity, type ZoomBehavior, type ZoomTransform as D3Transform } from 'd3-zoom';
import gsap from 'gsap';
import type { BBox, Theater } from '../types';
import { WORLD_W, contentArea, focusTransform, graticulePath, pacificTransform } from '../lib/geo';
import { useUI } from '../lib/store';
import type { CountrySets } from '../lib/useCountries';
import { CountryLayer } from './CountryLayer';
import { FrontLayer } from './FrontLayer';
import { ArrowLayer } from './ArrowLayer';
import { LabelLayer } from './LabelLayer';
import { CaptureLayer } from './CaptureLayer';
import { MarkerLayer } from './MarkerLayer';
import { CommanderLayer } from './CommanderLayer';
import { SpriteLayer } from './SpriteLayer';
import { TopControls } from './TopControls';

export const THEATERS: Record<Theater, BBox> = {
  world: { west: -172, south: -58, east: 179, north: 80 },
  europe: { west: -12, south: 31, east: 46, north: 70.5 },
  africa: { west: -19, south: 11, east: 42, north: 38 },
  pacific: { west: 92, south: -20, east: 180, north: 52 },
  east: { west: 15, south: 40, east: 50, north: 62 },
};

export interface CameraApi {
  focus: (bbox: BBox, duration?: number, maxK?: number) => void;
  zoomBy: (factor: number) => void;
  reset: () => void;
}

export const CameraContext = createContext<CameraApi>({
  focus: () => undefined,
  zoomBy: () => undefined,
  reset: () => undefined,
});

export function MapStage({
  sets,
  onCamera,
}: {
  sets: CountrySets;
  onCamera?: (api: CameraApi) => void;
}) {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const mapRef = useRef<SVGGElement | null>(null);
  const zbRef = useRef<ZoomBehavior<SVGSVGElement, unknown> | null>(null);
  const camRef = useRef({ x: 0, y: 0, k: 1 });
  const tweenRef = useRef<gsap.core.Tween | null>(null);
  const layers = useUI((s) => s.layers);
  const theater = useUI((s) => s.theater);
  const firstTheater = useRef(true);

  const apply = useCallback((t: D3Transform) => {
    camRef.current = { x: t.x, y: t.y, k: t.k };
    mapRef.current?.setAttribute(
      'transform',
      `translate(${t.x.toFixed(2)} ${t.y.toFixed(2)}) scale(${t.k.toFixed(4)})`,
    );
    const svg = svgRef.current;
    if (svg) {
      svg.style.setProperty('--inv', (1 / t.k).toFixed(4));
      const zoom = t.k < 2.0 ? 'far' : t.k < 4.5 ? 'mid' : 'near';
      if (svg.dataset.zoom !== zoom) {
        svg.dataset.zoom = zoom;
        document.documentElement.dataset.zoom = zoom;
      }
    }
  }, []);

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;
    const sel = select(svg);
    const zb = zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.85, 14])
      .clickDistance(6)
      .on('zoom', (ev) => apply(ev.transform));
    sel.call(zb).on('dblclick.zoom', null);
    zbRef.current = zb;

    const t =
      useUI.getState().theater === 'pacific'
        ? pacificTransform(contentArea())
        : focusTransform(THEATERS[useUI.getState().theater], contentArea());
    sel.call(zb.transform, zoomIdentity.translate(t.x, t.y).scale(t.k));

    return () => {
      sel.on('.zoom', null);
    };
  }, [apply]);

  const focus = useCallback((bbox: BBox, duration = 1.5, maxK = 9) => {
    const svg = svgRef.current;
    const zb = zbRef.current;
    if (!svg || !zb) return;
    const target =
      bbox === THEATERS.pacific
        ? pacificTransform(contentArea())
        : focusTransform(bbox, contentArea(), 26, maxK);
    const proxy = { ...camRef.current };
    tweenRef.current?.kill();
    tweenRef.current = gsap.to(proxy, {
      x: target.x,
      y: target.y,
      k: target.k,
      duration,
      ease: 'power3.inOut',
      onUpdate: () => {
        select(svg).call(zb.transform, zoomIdentity.translate(proxy.x, proxy.y).scale(proxy.k));
      },
    });
  }, []);

  const zoomBy = useCallback((factor: number) => {
    const svg = svgRef.current;
    const zb = zbRef.current;
    if (!svg || !zb) return;
    select(svg).call(zb.scaleBy, factor);
  }, []);

  const reset = useCallback(() => {
    focus(THEATERS[useUI.getState().theater], 0.9);
  }, [focus]);

  useEffect(() => {
    if (firstTheater.current) {
      firstTheater.current = false;
      return;
    }
    focus(THEATERS[theater], 1.2);
  }, [theater, focus]);

  const worldLayers = (
    <>
      <path d={graticulePath} className="graticule" />
      <CountryLayer sets={sets} enabled={layers.territories} />
      <FrontLayer enabled={layers.fronts} />
      <ArrowLayer enabled={layers.arrows} />
      {layers.places ? <MarkerLayer /> : null}
      <LabelLayer />
      <CaptureLayer />
      {layers.commanders ? <CommanderLayer /> : null}
      <SpriteLayer enabled={layers.sprites} />
    </>
  );

  const worldLayersCopy = (
    <>
      <path d={graticulePath} className="graticule" />
      <CountryLayer sets={sets} enabled={layers.territories} />
      <FrontLayer enabled={layers.fronts} />
      <ArrowLayer enabled={layers.arrows} />
      {layers.places ? <MarkerLayer /> : null}
      <LabelLayer showSeas={false} />
      <CaptureLayer />
      {layers.commanders ? <CommanderLayer /> : null}
      <SpriteLayer enabled={layers.sprites} />
    </>
  );

  const api = useMemo(() => ({ focus, zoomBy, reset }), [focus, zoomBy, reset]);

  useEffect(() => {
    onCamera?.(api);
  }, [api, onCamera]);

  return (
    <CameraContext.Provider value={api}>
      <div className="map-shell">
        <div className="sea-bg" />
      <svg
        ref={svgRef}
        className="map-svg"
        viewBox="0 0 1600 900"
        preserveAspectRatio="xMidYMid slice"
      >
        <defs>
          <radialGradient id="seaVignette" cx="50%" cy="45%" r="75%">
            <stop offset="0%" stopColor="#b8c9c6" />
            <stop offset="70%" stopColor="#a9bcba" />
            <stop offset="100%" stopColor="#93a8a8" />
          </radialGradient>
          <filter id="softGlow" x="-40%" y="-40%" width="180%" height="180%">
            <feGaussianBlur stdDeviation="3.2" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <g ref={mapRef}>
          {worldLayers}
          {theater === 'pacific' ? (
            <g transform={`translate(${WORLD_W} 0)`}>{worldLayersCopy}</g>
          ) : null}
        </g>
      </svg>
        <div className="grain" />
        <div className="compass" aria-hidden="true">
          <svg viewBox="0 0 76 76">
            <circle cx="38" cy="38" r="30" fill="none" stroke="rgba(38,33,26,0.35)" strokeWidth="0.8" />
            <circle cx="38" cy="38" r="22" fill="none" stroke="rgba(38,33,26,0.18)" strokeWidth="0.6" />
            <path d="M38 10 L43 38 L38 33 L33 38 Z" fill="#2a241c" />
            <path d="M38 66 L43 38 L38 43 L33 38 Z" fill="rgba(42,36,28,0.35)" />
            <text x="38" y="7" textAnchor="middle" className="compass-n">С</text>
          </svg>
        </div>
        <TopControls camera={api} />
      </div>
    </CameraContext.Provider>
  );
}

