import { useDay } from '../lib/clock';
import { project } from '../lib/geo';
import { formatDate, toDay } from '../lib/date';
import { captures } from '../data/captures';

const WINDOW = 8;

function verb(city: string, side: string): string {
  if (side === 'axis') return /[ая]$/.test(city) ? 'ВЗЯТА' : 'ВЗЯТ';
  if (/(ы|и)$/.test(city)) return 'ОСВОБОЖДЕНЫ';
  return /[ая]$/.test(city) ? 'ОСВОБОЖДЕНА' : 'ОСВОБОЖДЁН';
}

export function CaptureLayer() {
  const day = useDay();

  const active = captures.filter((c) => {
    const d = toDay(c.date);
    return day >= d - 0.5 && day <= d + WINDOW;
  });

  return (
    <g className="captures" pointerEvents="none">
      {active.map((c) => {
        const [x, y] = project(c.location);
        const label = verb(c.city, c.side);
        const text = `${label} · ${c.city.toUpperCase()}`;
        const w = Math.max(100, text.length * 7.1 + 20);
        return (
          <g
            key={c.id}
            className={`capture side-${c.side}`}
            transform={`translate(${x.toFixed(1)} ${y.toFixed(1)})`}
          >
            <g style={{ transform: 'scale(var(--inv))' }}>
              <circle r={13} className="capture-halo" />
              <circle r={5.5} className="capture-core" />
              <circle r={12} className="capture-ring" />
              <circle r={12} className="capture-ring d1" />
              <circle r={12} className="capture-ring d2" />

              <g className="capture-rays">
                {Array.from({ length: 8 }).map((_, i) => (
                  <rect
                    key={i}
                    x={-0.9}
                    y={-27}
                    width={1.8}
                    height={10}
                    rx={0.9}
                    transform={`rotate(${i * 45})`}
                  />
                ))}
              </g>

              <g className="capture-flag">
                <path d="M0,8 L0,-15" className="capture-pole" />
                <path d="M0,-15 L15,-10.5 L0,-6 Z" className="capture-cloth" />
              </g>

              <g transform="translate(0 28)">
                <g className="capture-badge">
                  <rect x={-w / 2} y={-13} width={w} height={26} rx={2} className="capture-badge-bg" />
                  <rect x={-w / 2} y={-13} width={3} height={26} className="capture-badge-bar" />
                  <text textAnchor="middle" y={4} className="capture-text">
                    {text}
                  </text>
                </g>
              </g>
            </g>
            <title>{`${c.city} · ${formatDate(toDay(c.date))}`}</title>
          </g>
        );
      })}
    </g>
  );
}
