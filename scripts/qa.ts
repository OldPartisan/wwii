import { events } from '../src/data/events';
import { commanders } from '../src/data/commanders';
import { captures } from '../src/data/captures';
import { arrows } from '../src/data/arrows';
import { fronts } from '../src/data/fronts';
import { chapters } from '../src/data/chapters';
import { toDay, START_ISO, END_ISO, TOTAL_DAYS } from '../src/lib/date';
import fs from 'node:fs';

const problems: string[] = [];
const ok = (c: boolean, m: string) => { if (!c) problems.push(m); };
const uniq = (arr: string[], label: string) => {
  const seen = new Set<string>();
  for (const id of arr) { if (seen.has(id)) problems.push(`${label}: duplicate id ${id}`); seen.add(id); }
};

uniq(events.map(e => e.id), 'events');
uniq(commanders.map(c => c.id), 'commanders');
uniq(captures.map(c => c.id), 'captures');
uniq(arrows.map(a => a.id), 'arrows');

const cIds = new Set(commanders.map(c => c.id));
for (const e of events) {
  const s = toDay(e.date);
  ok(Number.isFinite(s) && s >= 0 && s <= TOTAL_DAYS, `event ${e.id}: bad date ${e.date}`);
  if (e.endDate) {
    const en = toDay(e.endDate);
    ok(Number.isFinite(en) && en >= s, `event ${e.id}: endDate before date`);
    ok(en <= TOTAL_DAYS, `event ${e.id}: endDate after war`);
  }
  ok(e.title.trim().length > 0, `event ${e.id}: empty title`);
  ok(e.summary.trim().length > 20, `event ${e.id}: short summary`);
  ok(e.place.trim().length > 0, `event ${e.id}: empty place`);
  ok(Number.isFinite(e.location.lat) && Math.abs(e.location.lat) <= 90, `event ${e.id}: bad lat`);
  ok(Number.isFinite(e.location.lng) && Math.abs(e.location.lng) <= 180, `event ${e.id}: bad lng`);
  for (const id of e.commanders ?? []) ok(cIds.has(id), `event ${e.id}: unknown commander ${id}`);
  if (e.photo) ok(fs.existsSync(`public${e.photo}`), `event ${e.id}: missing photo ${e.photo}`);
  if (e.casualties) {
    for (const v of [e.casualties.axis, e.casualties.allies, e.casualties.civilian]) {
      if (v !== undefined) ok(v >= 0, `event ${e.id}: negative casualties`);
    }
  }
}

for (const c of commanders) {
  const a = toDay(c.from), b = toDay(c.to);
  ok(Number.isFinite(a) && Number.isFinite(b) && a <= b, `commander ${c.id}: bad period`);
  ok(c.name.trim().length > 0 && c.role.trim().length > 0, `commander ${c.id}: empty name/role`);
  if (c.portrait) ok(fs.existsSync(`public${c.portrait}`), `commander ${c.id}: missing portrait ${c.portrait}`);
  if (c.hq) {
    ok(Math.abs(c.hq.lat) <= 90 && Math.abs(c.hq.lng) <= 180, `commander ${c.id}: bad hq`);
  }
}

for (const c of captures) {
  const d = toDay(c.date);
  ok(Number.isFinite(d) && d >= 0 && d <= TOTAL_DAYS, `capture ${c.id}: bad date`);
  ok(['axis','allies'].includes(c.side), `capture ${c.id}: bad side`);
  ok(Math.abs(c.location.lat) <= 90 && Math.abs(c.location.lng) <= 180, `capture ${c.id}: bad location`);
}

for (const a of arrows) {
  const s = toDay(a.fromDate), e = toDay(a.toDate);
  ok(Number.isFinite(s) && Number.isFinite(e) && s <= e, `arrow ${a.id}: bad interval`);
  ok(s >= 0 && e <= TOTAL_DAYS, `arrow ${a.id}: outside war`);
  ok(Math.abs(a.from.lat) <= 90 && Math.abs(a.to.lat) <= 90, `arrow ${a.id}: bad lat`);
  ok(Math.abs(a.from.lng) <= 180 && Math.abs(a.to.lng) <= 180, `arrow ${a.id}: bad lng`);
  ok(['axis','allies'].includes(a.side), `arrow ${a.id}: bad side`);
}

for (const f of fronts) {
  ok(f.keyframes.length >= 2, `front ${f.id}: <2 keyframes`);
  let prev = -Infinity;
  for (const k of f.keyframes) {
    const d = toDay(k.date);
    ok(Number.isFinite(d) && d > prev, `front ${f.id}: unsorted keyframe ${k.date}`);
    prev = d;
    ok(k.points.length >= 2, `front ${f.id}: short keyframe`);
    for (const [lng, lat] of k.points) {
      ok(Math.abs(lat) <= 90 && Math.abs(lng) <= 180, `front ${f.id}: bad point`);
    }
  }
}

for (let i = 0; i < chapters.length; i++) {
  const ch = chapters[i];
  ok(toDay(ch.from) < toDay(ch.to), `chapter ${ch.id}: bad interval`);
  if (i > 0) {
    const prev = chapters[i - 1];
    ok(toDay(ch.from) === toDay(prev.to) + 1, `chapter ${ch.id}: gap/overlap with previous`);
  }
}

ok(toDay(START_ISO) === 0, 'start day');
ok(toDay(END_ISO) === TOTAL_DAYS, 'end day');

console.log(JSON.stringify({
  events: events.length,
  commanders: commanders.length,
  captures: captures.length,
  arrows: arrows.length,
  fronts: fronts.length,
  chapters: chapters.length,
  problems,
}, null, 2));
