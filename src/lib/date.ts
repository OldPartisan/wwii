export const START_ISO = '1939-09-01';
export const END_ISO = '1945-09-02';

export const MS_DAY = 86_400_000;
export const START_MS = Date.UTC(1939, 8, 1);
export const END_MS = Date.UTC(1945, 8, 2);
export const TOTAL_DAYS = Math.round((END_MS - START_MS) / MS_DAY);

const MONTHS = [
  'января',
  'февраля',
  'марта',
  'апреля',
  'мая',
  'июня',
  'июля',
  'августа',
  'сентября',
  'октября',
  'ноября',
  'декабря',
];

const MONTHS_SHORT = [
  'янв',
  'фев',
  'мар',
  'апр',
  'май',
  'июн',
  'июл',
  'авг',
  'сен',
  'окт',
  'ноя',
  'дек',
];

export function toDay(iso: string): number {
  const [y, m, d] = iso.split('-').map(Number);
  return (Date.UTC(y, m - 1, d) - START_MS) / MS_DAY;
}

export function fromDay(day: number): Date {
  return new Date(START_MS + day * MS_DAY);
}


export function clampDay(day: number): number {
  return Math.max(0, Math.min(TOTAL_DAYS, day));
}

export function formatDate(day: number, opts: { year?: boolean; short?: boolean } = {}): string {
  const d = fromDay(day);
  const showYear = opts.year !== false;
  const month = opts.short ? MONTHS_SHORT[d.getUTCMonth()] : MONTHS[d.getUTCMonth()];
  return `${d.getUTCDate()} ${month}${showYear ? ` ${d.getUTCFullYear()}` : ''}`;
}

export function formatDateShort(day: number): string {
  const d = fromDay(day);
  return `${String(d.getUTCDate()).padStart(2, '0')}.${String(d.getUTCMonth() + 1).padStart(2, '0')}.${d.getUTCFullYear()}`;
}

export function formatRange(from: number, to: number): string {
  const a = fromDay(from);
  const b = fromDay(to);
  if (a.getUTCFullYear() === b.getUTCFullYear() && a.getUTCMonth() === b.getUTCMonth()) {
    return `${a.getUTCDate()}–${b.getUTCDate()} ${MONTHS[a.getUTCMonth()]} ${a.getUTCFullYear()}`;
  }
  if (a.getUTCFullYear() === b.getUTCFullYear()) {
    return `${a.getUTCDate()} ${MONTHS[a.getUTCMonth()]} — ${b.getUTCDate()} ${MONTHS[b.getUTCMonth()]} ${a.getUTCFullYear()}`;
  }
  return `${formatDate(from)} — ${formatDate(to)}`;
}

export function weekdayName(day: number): string {
  const names = ['воскресенье', 'понедельник', 'вторник', 'среда', 'четверг', 'пятница', 'суббота'];
  return names[fromDay(day).getUTCDay()];
}

export function yearOf(day: number): number {
  return fromDay(day).getUTCFullYear();
}
