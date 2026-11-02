export type Side = 'axis' | 'allies' | 'neutral';

export type ControlStatus =
  | 'axis'
  | 'axis-occupied'
  | 'allies'
  | 'allies-occupied'
  | 'neutral';

export interface LatLng {
  lat: number;
  lng: number;
}

export interface BBox {
  west: number;
  south: number;
  east: number;
  north: number;
}

export type Theater = 'world' | 'europe' | 'africa' | 'pacific' | 'east';

export interface OpArrow {
  from: LatLng;
  to: LatLng;
  bend?: number;
  side: Side;
  label?: string;
}

export type EventType =
  | 'battle'
  | 'city'
  | 'landing'
  | 'treaty'
  | 'surrender'
  | 'air'
  | 'naval'
  | 'politics';

export interface WarEvent {
  id: string;
  title: string;
  type: EventType;
  date: string;
  endDate?: string;
  location: LatLng;
  place: string;
  side?: Side;
  theater: 'europe' | 'africa' | 'pacific' | 'global';
  summary: string;
  detail?: string;
  commanders?: string[];
  casualties?: {
    axis?: number;
    allies?: number;
    civilian?: number;
    note?: string;
  };
  result?: string;
  photo?: string;
  photoCaption?: string;
  ops?: OpArrow[];
  scale?: 1 | 2 | 3;
}

export interface Commander {
  id: string;
  name: string;
  role: string;
  country: string;
  side: Side;
  from: string;
  to: string;
  portrait?: string;
  bio?: string;
  hq?: LatLng;
  pin?: boolean;
}

export interface Chapter {
  id: string;
  index: number;
  from: string;
  to: string;
  title: string;
  subtitle: string;
  summary: string;
  focus: BBox;
}

export interface FrontKeyframe {
  date: string;
  points: [number, number][];
}

export interface Front {
  id: string;
  name: string;
  side: Side;
  keyframes: FrontKeyframe[];
}

export interface AttackArrow {
  id: string;
  label: string;
  side: Side;
  from: LatLng;
  to: LatLng;
  bend?: number;
  fromDate: string;
  toDate: string;
  kind: 'land' | 'air' | 'sea';
  weight?: number;
}

export interface ControlChange {
  date: string;
  status: ControlStatus;
}

export interface MapLabel {
  name: string;
  lat: number;
  lng: number;
  tier: 1 | 2 | 3;
  kind: 'country' | 'city' | 'sea' | 'region';
  /** Для региональных подписей: интервал, когда подпись уместна. */
  from?: string;
  to?: string;
}
