import type { Commander, WarEvent } from '../types';

const TITLES: Record<string, string> = {
  'poland-1939': 'Польская кампания (1939)',
  'warsaw-1939': 'Оборона Варшавы (1939)',
  barbarossa: 'Операция «Барбаросса»',
  'moscow-1941': 'Битва за Москву',
  stalingrad: 'Сталинградская битва',
  'stalingrad-surrender': 'Сталинградская битва',
  kursk: 'Курская битва',
  'kyiv-1941': 'Киевская операция (1941)',
  'kyiv-1943': 'Киевская наступательная операция',
  leningrad: 'Блокада Ленинграда',
  'leningrad-lift': 'Ленинградско-Новгородская операция',
  normandy: 'Высадка в Нормандии',
  bagration: 'Операция «Багратион»',
  berlin: 'Берлинская наступательная операция',
  'germany-surrender': 'Акт о безоговорочной капитуляции Германии',
  'pearl-harbor': 'Нападение на Пёрл-Харбор',
  midway: 'Сражение у атолла Мидуэй',
  'el-alamein': 'Вторая битва при Эль-Аламейне',
  torch: 'Операция «Факел»',
  sicily: 'Высадка союзников на Сицилии',
  'italy-armistice': 'Перемирие между Италией и Союзниками',
  paris: 'Освобождение Парижа',
  ardennes: 'Арденнская операция (1944—1945)',
  'vistula-oder': 'Висло-Одерская операция',
  'crimea-1944': 'Крымская операция (1944)',
  'marketgarden': 'Операция «Маркет-Гарден»',
  montecassino: 'Битва при Монте-Кассино',
  hiroshima: 'Атомные бомбардировки Хиросимы и Нагасаки',
  'japan-surrender': 'Акт о капитуляции Японии',
  yalta: 'Ялтинская конференция',
  potsdam: 'Потсдамская конференция',
  tehran: 'Тегеранская конференция',
  dunkirk: 'Дюнкеркская операция',
  britain: 'Битва за Британию',
  'france-1940': 'Французская кампания',
  crete: 'Критская операция',
  'korsun': 'Корсунь-Шевченковская операция',
};

export function eventWikiUrl(event: WarEvent): string {
  const title = TITLES[event.id];
  if (title) {
    return `https://ru.wikipedia.org/wiki/${encodeURIComponent(title.replace(/ /g, '_'))}`;
  }
  return `https://ru.wikipedia.org/w/index.php?search=${encodeURIComponent(event.title)}`;
}

export function commanderWikiUrl(commander: Commander): string {
  return `https://ru.wikipedia.org/wiki/${encodeURIComponent(commander.name.replace(/ /g, '_'))}`;
}
