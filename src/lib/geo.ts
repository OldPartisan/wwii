import { geoNaturalEarth1, geoPath, geoGraticule10 } from 'd3-geo';
import type { BBox, LatLng } from '../types';

export const VIEW_W = 1600;
export const VIEW_H = 900;

/** Screen area kept free of the (overlaying) left panel and timeline. */
export const CONTENT = { x: 436, y: 34, w: 1128, h: 792 };
export const WORLD_W = 1580;

/** На узких экранах панель уезжает наверх, карта занимает всю ширину. */
export function contentArea() {
  if (typeof window === 'undefined' || window.innerWidth >= 760) return CONTENT;
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const scale = Math.max(vw / VIEW_W, vh / VIEW_H);
  const w = Math.min(VIEW_W, vw / scale);
  const h = Math.min(680, vh / scale);
  return { x: (VIEW_W - w) / 2, y: 110 + (680 - h) / 2, w, h };
}

export const projection = geoNaturalEarth1().fitExtent(
  [
    [10, 10],
    [VIEW_W - 10, VIEW_H - 10],
  ],
  { type: 'Sphere' } as never,
);

export const pathGen = geoPath(projection);

export const graticulePath = pathGen(geoGraticule10()) ?? '';

export function project(p: LatLng): [number, number] {
  const r = projection([p.lng, p.lat]);
  return r ? [r[0], r[1]] : [0, 0];
}

export function projectLngLat(lng: number, lat: number): [number, number] {
  const r = projection([lng, lat]);
  return r ? [r[0], r[1]] : [0, 0];
}

export interface ZoomTransform {
  x: number;
  y: number;
  k: number;
}

export function pacificTransform(area = CONTENT): ZoomTransform {
  const k = 1.55;
  const cx = area.x + area.w / 2;
  const cy = area.y + area.h / 2;
  return { x: cx - WORLD_W * k, y: cy - 450 * k, k };
}

export function focusTransform(bbox: BBox, area = CONTENT, pad = 26, maxK = 9): ZoomTransform {
  const [x1, y1] = project({ lng: bbox.west, lat: bbox.north });
  const [x2, y2] = project({ lng: bbox.east, lat: bbox.south });
  const w = Math.max(1, Math.abs(x2 - x1));
  const h = Math.max(1, Math.abs(y2 - y1));
  const aw = Math.max(80, area.w - pad * 2);
  const ah = Math.max(80, area.h - pad * 2);
  const k = Math.max(1, Math.min(maxK, Math.min(aw / w, ah / h)));
  const x = area.x + (area.w - w * k) / 2 - Math.min(x1, x2) * k;
  const y = area.y + (area.h - h * k) / 2 - Math.min(y1, y2) * k;
  return { x, y, k };
}

export function bboxAround(p: LatLng, dLng = 9, dLat = 6): BBox {
  return {
    west: p.lng - dLng,
    south: p.lat - dLat,
    east: p.lng + dLng,
    north: p.lat + dLat,
  };
}

/** Resample a projected polyline to exactly `n` equally spaced points. */
export function resample(points: [number, number][], n: number): [number, number][] {
  if (points.length < 2) {
    return Array.from({ length: n }, () => points[0] ?? [0, 0]);
  }
  const cum: number[] = [0];
  for (let i = 1; i < points.length; i++) {
    cum.push(cum[i - 1] + Math.hypot(points[i][0] - points[i - 1][0], points[i][1] - points[i - 1][1]));
  }
  const total = cum[cum.length - 1] || 1;
  const out: [number, number][] = [];
  let seg = 0;
  for (let i = 0; i < n; i++) {
    const target = (i / (n - 1)) * total;
    while (seg < cum.length - 2 && cum[seg + 1] < target) seg++;
    const t = (target - cum[seg]) / (cum[seg + 1] - cum[seg] || 1);
    out.push([
      points[seg][0] + (points[seg + 1][0] - points[seg][0]) * t,
      points[seg][1] + (points[seg + 1][1] - points[seg][1]) * t,
    ]);
  }
  return out;
}

export function lerpPoints(a: [number, number][], b: [number, number][], t: number): [number, number][] {
  const n = Math.min(a.length, b.length);
  const out: [number, number][] = new Array(n);
  for (let i = 0; i < n; i++) {
    out[i] = [a[i][0] + (b[i][0] - a[i][0]) * t, a[i][1] + (b[i][1] - a[i][1]) * t];
  }
  return out;
}

export function polylinePath(points: [number, number][]): string {
  if (!points.length) return '';
  let d = `M${points[0][0].toFixed(1)},${points[0][1].toFixed(1)}`;
  for (let i = 1; i < points.length; i++) {
    d += `L${points[i][0].toFixed(1)},${points[i][1].toFixed(1)}`;
  }
  return d;
}

export interface Quad {
  ax: number;
  ay: number;
  cx: number;
  cy: number;
  bx: number;
  by: number;
}

export function quadFrom(a: LatLng, b: LatLng, bend = 0.16): Quad {
  const [ax, ay] = project(a);
  const [bx, by] = project(b);
  const dx = bx - ax;
  const dy = by - ay;
  const len = Math.hypot(dx, dy) || 1;
  const nx = -dy / len;
  const ny = dx / len;
  return {
    ax,
    ay,
    cx: (ax + bx) / 2 + nx * len * bend,
    cy: (ay + by) / 2 + ny * len * bend,
    bx,
    by,
  };
}

export function quadPath(q: Quad): string {
  return `M${q.ax.toFixed(1)},${q.ay.toFixed(1)}Q${q.cx.toFixed(1)},${q.cy.toFixed(1)} ${q.bx.toFixed(1)},${q.by.toFixed(1)}`;
}

export function quadPoint(q: Quad, t: number): [number, number] {
  const u = 1 - t;
  return [
    u * u * q.ax + 2 * u * t * q.cx + t * t * q.bx,
    u * u * q.ay + 2 * u * t * q.cy + t * t * q.by,
  ];
}

export function quadAngle(q: Quad, t: number): number {
  const u = 1 - t;
  const dx = 2 * u * (q.cx - q.ax) + 2 * t * (q.bx - q.cx);
  const dy = 2 * u * (q.cy - q.ay) + 2 * t * (q.by - q.cy);
  return (Math.atan2(dy, dx) * 180) / Math.PI;
}
