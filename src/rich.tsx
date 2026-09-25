import { Fragment } from 'react';
import { runs, SCRIPT_SCALE, SUB_SHIFT, SUP_SHIFT } from './text';

/**
 * One line of rich text inside an SVG <text> (or positioned <tspan>). Sub/superscripts become smaller tspans shifted
 * with `dy`; `size` must be the font size of the enclosing text so the shifts land right.
 * Nothing may follow it inside the same text chunk, because a trailing subscript leaves the baseline shifted.
 */
export function Tspans({ s, size }: { s: string; size: number }) {
  const rs = runs(s);
  if (rs.length === 1 && rs[0].k === 'n') return <>{rs[0].t}</>;
  let at = 0;
  return (
    <>
      {rs.map((r, i) => {
        const to = r.k === 'sub' ? SUB_SHIFT * size : r.k === 'sup' ? SUP_SHIFT * size : 0;
        const dy = to - at;
        at = to;
        return (
          <tspan key={i} dy={dy ? +dy.toFixed(2) : undefined} fontSize={r.k === 'n' ? undefined : +(size * SCRIPT_SCALE).toFixed(2)}>
            {r.t}
          </tspan>
        );
      })}
    </>
  );
}

/** Stacked lines, vertically centred on y (each line starts a new text chunk, so each keeps its own anchor). */
export function SvgLines({ lines, x, y, size, lineH }: { lines: string[]; x: number; y: number; size: number; lineH: number }) {
  const top = y - ((lines.length - 1) * lineH) / 2 + size * 0.34;
  return (
    <>
      {lines.map((l, i) => (
        <tspan key={i} x={x} y={+(top + i * lineH).toFixed(2)}><Tspans s={l} size={size} /></tspan>
      ))}
    </>
  );
}

/** HTML counterpart: <sub>/<sup> with regular glyphs. */
export function Rich({ s }: { s: string }) {
  const rs = runs(s);
  if (rs.length === 1 && rs[0].k === 'n') return <>{rs[0].t}</>;
  return (
    <>
      {rs.map((r, i) => (r.k === 'n' ? <Fragment key={i}>{r.t}</Fragment> : r.k === 'sub' ? <sub key={i}>{r.t}</sub> : <sup key={i}>{r.t}</sup>))}
    </>
  );
}
