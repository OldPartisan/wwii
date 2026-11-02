import { memo, useMemo } from 'react';
import { statusColors } from '../data/control';
import { statusForFeature } from '../data/historicalControl';
import { toDay } from '../lib/date';
import { useDay } from '../lib/clock';
import type { ControlStatus } from '../types';
import type { CountrySets } from '../lib/useCountries';

const CountryPath = memo(
  function CountryPath({ d, status, name }: { d: string; status: ControlStatus; name: string }) {
    return (
      <path
        data-name={name}
        d={d}
        fill={statusColors[status]}
        stroke="rgba(58,48,34,0.42)"
        strokeWidth={0.55}
        vectorEffect="non-scaling-stroke"
      />
    );
  },
  (a, b) => a.d === b.d && a.status === b.status,
);

export function CountryLayer({ sets, enabled }: { sets: CountrySets; enabled: boolean }) {
  const day = Math.floor(useDay());
  const eraKey =
    day >= toDay('1945-05-08')
      ? 'y1945'
      : day >= toDay('1940-06-15')
        ? 'y1940'
        : day >= toDay('1939-09-17')
          ? 'y1939'
          : 'y1938';
  const era = sets[eraKey];

  const statuses = useMemo(() => {
    const map = new Map<string, ControlStatus>();
    for (const s of era) {
      map.set(s.id, enabled ? statusForFeature(s.name, day) : 'neutral');
    }
    return map;
  }, [era, day, enabled]);

  return (
    <g className="countries" key={eraKey}>
      {era.map((s) => (
        <CountryPath
          key={s.id}
          name={s.name}
          d={s.d}
          status={statuses.get(s.id) ?? 'neutral'}
        />
      ))}
    </g>
  );
}
