import type { EnzClass } from '../data/types';

/**
 * Enzyme-type marker. Each type has its own shape as well as its own colour, so the key still works in greyscale
 * and for colour-blind readers. Drawn centred on (x, y); `s` is roughly the half-size.
 */
export function markPath(cls: EnzClass, s = 4.3): string {
  const f = (n: number) => +n.toFixed(2);
  switch (cls) {
    case 'kinase': return `M${f(-s)},0 a${f(s)},${f(s)} 0 1,0 ${f(2 * s)},0 a${f(s)},${f(s)} 0 1,0 ${f(-2 * s)},0z`;
    case 'isomerase': { const k = s * 1.3; return `M0,${f(-k)} L${f(k)},0 L0,${f(k)} L${f(-k)},0z`; }
    case 'dehydrogenase': return `M${f(-s)},${f(-s)} h${f(2 * s)} v${f(2 * s)} h${f(-2 * s)}z`;
    case 'lyase': return `M0,${f(-s * 1.25)} L${f(s * 1.2)},${f(s * 0.9)} L${f(-s * 1.2)},${f(s * 0.9)}z`;
    case 'hydrolase': return `M0,${f(s * 1.25)} L${f(s * 1.2)},${f(-s * 0.9)} L${f(-s * 1.2)},${f(-s * 0.9)}z`;
    case 'transferase': { const a = s * 0.42, b = s * 1.2; return `M${f(-a)},${f(-b)} h${f(2 * a)} v${f(b - a)} h${f(b - a)} v${f(2 * a)} h${f(a - b)} v${f(b - a)} h${f(-2 * a)} v${f(a - b)} h${f(a - b)} v${f(-2 * a)} h${f(b - a)}z`; }
    case 'ligase': {
      const pts: string[] = [];
      for (let i = 0; i < 10; i++) {
        const r = i % 2 ? s * 0.55 : s * 1.35, t = -Math.PI / 2 + (i * Math.PI) / 5;
        pts.push(`${f(r * Math.cos(t))},${f(r * Math.sin(t))}`);
      }
      return `M${pts.join(' L')}z`;
    }
    default: return `M${f(-s)},0 a${f(s)},${f(s)} 0 1,0 ${f(2 * s)},0 a${f(s)},${f(s)} 0 1,0 ${f(-2 * s)},0z`;
  }
}

export function ClassMark({ cls, x = 0, y = 0, s }: { cls: EnzClass; x?: number; y?: number; s?: number }) {
  return <path className={`mk mk-${cls}`} d={markPath(cls, s)} transform={x || y ? `translate(${x},${y})` : undefined} />;
}

/** Same marker as a standalone inline SVG, for the HTML panels. */
export function MarkIcon({ cls, size = 12 }: { cls: EnzClass; size?: number }) {
  return (
    <svg className="mk-icon" width={size} height={size} viewBox="-6 -6 12 12" aria-hidden="true">
      <path className={`mk mk-${cls}`} d={markPath(cls, 4.3)} />
    </svg>
  );
}

/** ⊕ / ⊖ drawn as shapes, so they never depend on font coverage. */
export function RegSym({ kind, x, y, r = 5.2 }: { kind: 'act' | 'inh'; x: number; y: number; r?: number }) {
  const k = r * 0.55;
  return (
    <g className={`rsym ${kind}`} transform={`translate(${x},${y})`}>
      <circle r={r} />
      <path d={kind === 'act' ? `M${-k},0 H${k} M0,${-k} V${k}` : `M${-k},0 H${k}`} />
    </g>
  );
}

export function RegIcon({ kind }: { kind: 'act' | 'inh' }) {
  return (
    <svg className="rsym-icon" width="13" height="13" viewBox="-7 -7 14 14" aria-hidden="true">
      <RegSym kind={kind} x={0} y={0} r={5.6} />
    </svg>
  );
}

/** The "i" of an overview note: a small serif italic i in a circle. */
export function InfoGlyph({ x, y, table }: { x: number; y: number; table?: boolean }) {
  return (
    <g className="iglyph" transform={`translate(${x},${y})`}>
      <circle r={7.5} />
      {table
        ? <path className="tglyph" d="M-4,-3.5 H4 V3.5 H-4 Z M-4,-0.6 H4 M-0.8,-3.5 V3.5" />
        : <text y={4.2} textAnchor="middle">i</text>}
    </g>
  );
}
