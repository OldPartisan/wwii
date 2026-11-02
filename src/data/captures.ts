import type { LatLng, Side } from '../types';

export interface CityCapture {
  id: string;
  city: string;
  date: string;
  side: Side;
  location: LatLng;
}

/** Ключевые взятия и освобождения городов — для анимации на карте. */
export const captures: CityCapture[] = [
  { id: 'warsaw-1939', city: 'Варшава', date: '1939-09-28', side: 'axis', location: { lat: 52.23, lng: 21.01 } },
  { id: 'kyiv-1941', city: 'Киев', date: '1941-09-19', side: 'axis', location: { lat: 50.45, lng: 30.52 } },
  { id: 'odessa-1941', city: 'Одесса', date: '1941-10-16', side: 'axis', location: { lat: 46.48, lng: 30.73 } },
  { id: 'sevastopol-1942', city: 'Севастополь', date: '1942-07-04', side: 'axis', location: { lat: 44.6, lng: 33.5 } },
  { id: 'stalingrad-1943', city: 'Сталинград', date: '1943-02-02', side: 'allies', location: { lat: 48.71, lng: 44.51 } },
  { id: 'kyiv-1943', city: 'Киев', date: '1943-11-06', side: 'allies', location: { lat: 50.45, lng: 30.52 } },
  { id: 'rome-1944', city: 'Рим', date: '1944-06-04', side: 'allies', location: { lat: 41.9, lng: 12.5 } },
  { id: 'minsk-1944', city: 'Минск', date: '1944-07-03', side: 'allies', location: { lat: 53.9, lng: 27.56 } },
  { id: 'vilnius-1944', city: 'Вильнюс', date: '1944-07-13', side: 'allies', location: { lat: 54.69, lng: 25.28 } },
  { id: 'paris-1944', city: 'Париж', date: '1944-08-25', side: 'allies', location: { lat: 48.85, lng: 2.35 } },
  { id: 'bucharest-1944', city: 'Бухарест', date: '1944-08-31', side: 'allies', location: { lat: 44.43, lng: 26.1 } },
  { id: 'athens-1944', city: 'Афины', date: '1944-10-12', side: 'allies', location: { lat: 37.98, lng: 23.73 } },
  { id: 'belgrade-1944', city: 'Белград', date: '1944-10-20', side: 'allies', location: { lat: 44.8, lng: 20.46 } },
  { id: 'warsaw-1945', city: 'Варшава', date: '1945-01-17', side: 'allies', location: { lat: 52.23, lng: 21.01 } },
  { id: 'budapest-1945', city: 'Будапешт', date: '1945-02-13', side: 'allies', location: { lat: 47.5, lng: 19.04 } },
  { id: 'konigsberg-1945', city: 'Кёнигсберг', date: '1945-04-09', side: 'allies', location: { lat: 54.71, lng: 20.51 } },
  { id: 'vienna-1945', city: 'Вена', date: '1945-04-13', side: 'allies', location: { lat: 48.21, lng: 16.37 } },
  { id: 'berlin-1945', city: 'Берлин', date: '1945-05-02', side: 'allies', location: { lat: 52.52, lng: 13.4 } },
  { id: 'prague-1945', city: 'Прага', date: '1945-05-09', side: 'allies', location: { lat: 50.08, lng: 14.44 } },
];
