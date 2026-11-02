import { countryControl, statusAt } from './control';
import { toDay } from '../lib/date';
import type { ControlStatus } from '../types';

const D = toDay;

/** Исторические названия из базовой карты 1938/1945 → ключи правил контроля. */
const aliases: Record<string, string> = {
  USSR: 'Russia',
  'Empire of Japan': 'Japan',
  'United States': 'United States of America',
  'Union of South Africa': 'South Africa',
  'Dominion of Newfoundland': 'Canada',
  'British Raj': 'India',
  Siam: 'Thailand',
  Rumania: 'Romania',
  Czechoslovakia: 'Czechia',
  Yugoslavia: 'Serbia',
  'Mesopotamia (GB)': 'Iraq',
  Persia: 'Iran',
  'Dutch East Indies': 'Indonesia',
  'Dutch Guinea': 'Indonesia',
  'French Indo-China': 'Vietnam',
  Annam: 'Vietnam',
  Tonkin: 'Vietnam',
  'Cochin China': 'Vietnam',
  Burma: 'Myanmar',
  'Italian Somaliland': 'Somalia',
  'Eritrea (Italy)': 'Eritrea',
  Ethiopia: 'Ethiopia',
  'Ethiopia (Italy)': 'Ethiopia',
  'Libya': 'Libya',
  'Tripolitana (UK Lybia)': 'Libya',
  'Cyraneica (UK Lybia)': 'Libya',
  'Fezzan (Frech Lybia)': 'Libya',
  'Syria (France)': 'Syria',
  'Morocco (France)': 'Morocco',
  'Algeria (France)': 'Algeria',
  'Tunisia': 'Tunisia',
  'Korea (USA)': 'Korea',
  'Korea (USSR)': 'Korea',
  'Japan (USA)': 'Japan',
  Manchuria: 'Manchuria',
  Taiwan: 'Taiwan',
};

const BRITISH = [
  'United Kingdom',
  'Canada',
  'Australia',
  'New Zealand',
  'Union of South Africa',
  'South Africa',
  'India',
  'British Raj',
  'Ceylon',
  'Kenya',
  'Nigeria',
  'Gold Coast',
  'Sierra Leone',
  'Gambia, The',
  'Sudan',
  'Uganda',
  'Tanzania, United Republic of',
  'Northern Rhodesia',
  'Southern Rhodesia',
  'Rhodesia',
  'Nyasaland',
  'Malawi',
  'Zambia',
  'Zimbabwe (Rhodesia)',
  'Malaysia',
  'Singapore',
  'Hong Kong',
  'Jamaica',
  'Trinidad',
  'Fiji',
  'Tonga',
  'Solomon Islands',
  'Gilbert and Ellice Islands',
  'New Hebrides',
  'Falkland Is.',
  'Bahamas',
  'Barbados',
  'Bermuda',
  'Aden',
  'Cyprus',
  'Malta',
  'Mandatory Palestine (GB)',
  'Mesopotamia (GB)',
  'Yemen (UK)',
  'Trucial Oman',
  'Kuwait',
  'Qatar',
  'Brunei',
  'Sarawak',
  'North Borneo',
  'British Somaliland',
  'British Cameroons',
  'British Togoland',
  'Belize',
  'Guyana',
  'Newfoundland',
];

const FRENCH = [
  'French West Africa',
  'French Equatorial Africa',
  'French Cameroons',
  'Congo (France)',
  'Madagascar (France)',
  'French Somaliland',
  'French Guiana',
  'Martinique',
  'Guadeloupe',
  'Saint Barthelemy',
  'Saint Martin',
  'Saint Pierre and Miquelon',
  'New Caledonia',
  'French Polynesia',
  'Wallis and Futuna Islands',
  'Laos',
  'Cambodia',
];

export function isBritish(name: string): boolean {
  return name.startsWith('British') || BRITISH.includes(name);
}

export function isFrenchColony(name: string): boolean {
  return name.startsWith('French') || name.endsWith('(France)') || FRENCH.includes(name);
}

function frenchColonyStatus(day: number): ControlStatus {
  if (day < D('1940-06-22')) return 'allies';
  if (day < D('1942-11-08')) return 'neutral';
  return 'allies';
}

function italianColonyStatus(name: string, day: number): ControlStatus {
  if (name === 'Libya' || name.startsWith('Tripolitana') || name.startsWith('Cyraneica') || name.startsWith('Fezzan')) {
    if (day < D('1943-01-23')) return 'axis';
    return 'allies';
  }
  if (name === 'Eritrea (Italy)' || name === 'Eritrea') {
    if (day < D('1941-04-08')) return 'axis';
    return 'allies';
  }
  if (name === 'Italian Somaliland' || name === 'Somalia') {
    if (day < D('1941-02-25')) return 'axis';
    return 'allies';
  }
  if (name === 'Ethiopia (Italy)' || name === 'Ethiopia') {
    if (day < D('1941-05-05')) return 'axis';
    return 'allies';
  }
  return 'axis';
}

export function statusForFeature(name: string, day: number): ControlStatus {
  // Оккупационные зоны Германии и Кореи в базе 1945 года
  if (name.startsWith('Germany (')) return 'allies-occupied';
  if (name.startsWith('Korea (')) return day >= D('1945-08-15') ? 'allies-occupied' : 'axis';
  if (name === 'Manchuria') return day >= D('1945-08-09') ? 'allies-occupied' : 'axis';
  if (name === 'Taiwan') return day >= D('1945-09-02') ? 'allies-occupied' : 'axis';
  if (name === 'Austria' && day >= D('1945-05-08')) return 'allies-occupied';

  // Япония до капитуляции остаётся воюющей стороной
  if (name === 'Japan (USA)') return day >= D('1945-09-02') ? 'allies-occupied' : 'axis';

  const key = aliases[name] ?? name;
  const changes = countryControl[key];
  if (changes) return statusAt(changes, day, toDay);

  if (isBritish(name)) return day >= D('1939-09-03') ? 'allies' : 'neutral';
  if (isFrenchColony(name)) return frenchColonyStatus(day);

  if (
    name === 'Libya' ||
    name.startsWith('Tripolitana') ||
    name.startsWith('Cyraneica') ||
    name.startsWith('Fezzan') ||
    name === 'Eritrea (Italy)' ||
    name === 'Eritrea' ||
    name === 'Italian Somaliland' ||
    name === 'Somalia' ||
    name === 'Ethiopia (Italy)' ||
    name === 'Ethiopia'
  ) {
    return italianColonyStatus(name, day);
  }

  if (name === 'Netherlands Antilles' || name === 'Suriname' || name === 'Aruba') {
    return day >= D('1940-05-10') ? 'allies' : 'neutral';
  }

  if (name === 'Angola (Portugal)' || name === 'Mozambique (Portugal)' || name === 'Guinea-Bissau (Portugal)') {
    return 'neutral';
  }
  if (name.startsWith('Spanish') || name === 'Rio De Oro' || name === 'Western Sahara') return 'neutral';

  if (name === 'Puerto Rico' || name === 'Guam' || name === 'American Samoa' || name === 'United States Virgin Islands') {
    return day >= D('1941-12-07') ? 'allies' : 'neutral';
  }

  if (name === 'Korea' || name === 'Manchukuo') {
    return day >= D('1945-09-02') ? 'allies-occupied' : 'axis';
  }

  return 'neutral';
}
