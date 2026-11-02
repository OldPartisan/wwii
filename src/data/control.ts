import type { ControlChange, ControlStatus } from '../types';

const c = (date: string, status: ControlStatus): ControlChange => ({ date, status });

export const controlStart = '1939-09-01';

/**
 * Упрощённая историческая модель контроля территорий.
 * Границы взяты по современной политической карте, поэтому
 * карта остаётся схематичной, а не кадастровой.
 */
export const countryControl: Record<string, ControlChange[]> = {
  Germany: [c('1939-09-01', 'axis'), c('1945-05-08', 'allies')],
  Austria: [c('1939-09-01', 'axis'), c('1945-04-27', 'allies')],
  Czechia: [c('1939-09-01', 'axis-occupied'), c('1945-05-09', 'allies')],
  Slovakia: [c('1939-09-01', 'axis'), c('1945-04-04', 'allies')],
  Poland: [c('1939-09-01', 'allies'), c('1939-09-17', 'axis-occupied'), c('1945-01-17', 'allies')],
  Denmark: [c('1940-04-09', 'axis'), c('1945-05-05', 'allies')],
  Norway: [c('1940-06-10', 'axis'), c('1945-05-08', 'allies')],
  Netherlands: [c('1940-05-15', 'axis'), c('1945-05-05', 'allies')],
  Belgium: [c('1940-05-28', 'axis'), c('1944-09-03', 'allies')],
  Luxembourg: [c('1940-05-10', 'axis'), c('1944-09-10', 'allies')],
  France: [c('1939-09-01', 'allies'), c('1940-06-22', 'axis-occupied'), c('1944-08-25', 'allies')],
  Italy: [c('1940-06-10', 'axis'), c('1943-09-08', 'axis-occupied'), c('1945-05-02', 'allies')],
  Albania: [c('1939-09-01', 'axis'), c('1944-11-29', 'allies')],
  Greece: [c('1941-06-01', 'axis'), c('1944-10-14', 'allies')],
  Serbia: [c('1941-04-17', 'axis-occupied'), c('1944-10-20', 'allies')],
  Croatia: [c('1941-04-10', 'axis'), c('1945-05-08', 'allies')],
  'Bosnia and Herz.': [c('1941-04-17', 'axis'), c('1945-04-06', 'allies')],
  Slovenia: [c('1941-04-17', 'axis'), c('1945-05-05', 'allies')],
  Montenegro: [c('1941-04-17', 'axis'), c('1944-12-15', 'allies')],
  'North Macedonia': [c('1941-04-17', 'axis'), c('1944-11-13', 'allies')],
  Kosovo: [c('1941-04-17', 'axis'), c('1944-11-20', 'allies')],
  Hungary: [c('1940-11-20', 'axis'), c('1945-04-04', 'allies')],
  Romania: [c('1940-11-23', 'axis'), c('1944-08-23', 'allies')],
  Bulgaria: [c('1941-03-01', 'axis'), c('1944-09-09', 'allies')],
  Finland: [c('1941-06-25', 'axis'), c('1944-09-19', 'neutral')],
  Russia: [c('1941-06-22', 'allies')],
  Ukraine: [
    c('1941-06-22', 'allies'),
    c('1941-09-19', 'axis-occupied'),
    c('1944-04-17', 'allies'),
  ],
  Belarus: [
    c('1941-06-22', 'allies'),
    c('1941-07-10', 'axis-occupied'),
    c('1944-07-03', 'allies'),
  ],
  Estonia: [c('1940-06-17', 'allies'), c('1941-08-28', 'axis'), c('1944-09-22', 'allies')],
  Latvia: [c('1940-06-17', 'allies'), c('1941-07-10', 'axis'), c('1944-10-13', 'allies')],
  Lithuania: [c('1940-06-15', 'allies'), c('1941-06-24', 'axis'), c('1944-07-13', 'allies')],
  Moldova: [c('1941-06-22', 'allies'), c('1941-07-26', 'axis'), c('1944-08-24', 'allies')],
  'United Kingdom': [c('1939-09-03', 'allies')],
  'United States of America': [c('1941-12-07', 'allies')],
  Canada: [c('1939-09-10', 'allies')],
  Australia: [c('1939-09-03', 'allies')],
  'New Zealand': [c('1939-09-03', 'allies')],
  'South Africa': [c('1939-09-06', 'allies')],
  India: [c('1939-09-03', 'allies')],
  Brazil: [c('1942-08-22', 'allies')],
  Mexico: [c('1942-05-22', 'allies')],
  Japan: [c('1940-09-27', 'axis'), c('1945-09-02', 'allies')],
  China: [c('1939-09-01', 'allies')],
  Thailand: [c('1941-12-08', 'axis'), c('1945-08-16', 'allies')],
  Philippines: [
    c('1941-12-08', 'allies'),
    c('1942-05-06', 'axis-occupied'),
    c('1944-10-20', 'allies'),
  ],
  Indonesia: [c('1942-03-09', 'axis'), c('1945-08-17', 'allies')],
  Malaysia: [c('1942-02-15', 'axis'), c('1945-09-02', 'allies')],
  Myanmar: [c('1942-05-20', 'axis'), c('1945-05-03', 'allies')],
  Vietnam: [c('1940-09-22', 'axis'), c('1945-08-15', 'allies')],
  Laos: [c('1941-08-01', 'axis'), c('1945-09-02', 'allies')],
  Cambodia: [c('1941-07-01', 'axis'), c('1945-08-15', 'allies')],
  Libya: [c('1939-09-01', 'axis'), c('1943-01-23', 'allies')],
  Tunisia: [c('1942-11-11', 'axis'), c('1943-05-13', 'allies')],
  Algeria: [c('1942-11-08', 'allies')],
  Morocco: [c('1942-11-08', 'allies')],
  Syria: [c('1941-07-14', 'allies')],
  Lebanon: [c('1941-07-14', 'allies')],
  Iraq: [c('1941-05-31', 'allies')],
  Iran: [c('1941-08-25', 'allies')],
  Ethiopia: [c('1939-09-01', 'axis'), c('1941-05-05', 'allies')],
  Eritrea: [c('1939-09-01', 'axis'), c('1941-04-08', 'allies')],
  Somalia: [c('1939-09-01', 'axis'), c('1941-02-25', 'allies')],
  Iceland: [c('1940-05-10', 'allies')],
  Greenland: [c('1940-04-09', 'allies')],
  Cyprus: [c('1939-09-01', 'allies')],
  Taiwan: [c('1939-09-01', 'axis'), c('1945-09-02', 'allies')],
  'North Korea': [c('1939-09-01', 'axis'), c('1945-09-02', 'allies')],
  'South Korea': [c('1939-09-01', 'axis'), c('1945-09-02', 'allies')],
  Georgia: [c('1941-06-22', 'allies')],
  Armenia: [c('1941-06-22', 'allies')],
  Azerbaijan: [c('1941-06-22', 'allies')],
  Kazakhstan: [c('1941-06-22', 'allies')],
  Uzbekistan: [c('1941-06-22', 'allies')],
  Turkmenistan: [c('1941-06-22', 'allies')],
  Tajikistan: [c('1941-06-22', 'allies')],
  Kyrgyzstan: [c('1941-06-22', 'allies')],
};

export const statusColors: Record<ControlStatus, string> = {
  axis: '#A23A2E',
  'axis-occupied': '#C27F6D',
  allies: '#2F5E7C',
  'allies-occupied': '#7EA1B4',
  neutral: '#D8CFBA',
};

export const statusNames: Record<ControlStatus, string> = {
  axis: 'Страны Оси',
  'axis-occupied': 'Оккупировано Осью',
  allies: 'Союзники',
  'allies-occupied': 'Занято союзниками',
  neutral: 'Нейтральные',
};

export const statusAt = (changes: ControlChange[], day: number, toDay: (iso: string) => number): ControlStatus => {
  let current: ControlStatus = 'neutral';
  for (const ch of changes) {
    if (day >= toDay(ch.date)) current = ch.status;
  }
  return current;
};
