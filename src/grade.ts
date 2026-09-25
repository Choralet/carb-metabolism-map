import { normalize } from './text.ts';

/**
 * Grading a typed quiz answer. Lenient about spelling (a few typos, more in longer names), case, spaces and
 * hyphens; strict about the parts of a name that carry meaning:
 *  - numbers: "carnitine acyltransferase" is not "carnitine acyltransferase I", nor fructose 1,6- a
 *    2,6-bisphosphate. Stand-alone Roman numerals count as digits ("Complex III" = "complex 3").
 *  - Greek letters: "ketoglutarate" is not "α-ketoglutarate". Either spelling is fine ("alpha-", "α-", "a-"),
 *    but a one-letter form is read as Greek only when the answer has that letter, so "D-glucose" stays D.
 */
const GREEK = ['alpha', 'beta', 'gamma', 'delta', 'epsilon', 'omega'];
const LONG_OF: Record<string, string> = { a: 'alpha', b: 'beta', g: 'gamma', d: 'delta', e: 'epsilon', w: 'omega' };
const ROMAN: Record<string, string> = { i: '1', ii: '2', iii: '3', iv: '4', v: '5', vi: '6' };

const tokens = (s: string) => normalize(s).split(' ').filter(Boolean).map((w) => ROMAN[w] ?? w);
const numbers = (ws: string[]) => ws.join(' ').match(/\d+/g)?.join(',') ?? '';
const greek = (ws: string[]) => ws.filter((w) => GREEK.includes(w)).join(',');

/** Optimal-string-alignment distance (Levenshtein plus adjacent swaps), with an early exit above `max`. */
function distance(a: string, b: string, max: number): number {
  if (Math.abs(a.length - b.length) > max) return max + 1;
  const d: number[][] = Array.from({ length: a.length + 1 }, (_, i) => [i, ...Array<number>(b.length).fill(0)]);
  for (let j = 1; j <= b.length; j++) d[0][j] = j;
  for (let i = 1; i <= a.length; i++) {
    let rowMin = Infinity;
    for (let j = 1; j <= b.length; j++) {
      const c = a[i - 1] === b[j - 1] ? 0 : 1;
      d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + c);
      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) d[i][j] = Math.min(d[i][j], d[i - 2][j - 2] + 1);
      rowMin = Math.min(rowMin, d[i][j]);
    }
    if (rowMin > max) return max + 1;
  }
  return d[a.length][b.length];
}

function matches(input: string, answer: string): boolean {
  const c = tokens(answer);
  const hasGreek = new Set(c.filter((w) => GREEK.includes(w)));
  const t = tokens(input).map((w, i, all) => (LONG_OF[w] && hasGreek.has(LONG_OF[w]) && i < all.length - 1 ? LONG_OF[w] : w));
  if (numbers(c) !== numbers(t) || greek(c) !== greek(t)) return false;
  const a = c.join(''), b = t.join('');
  const tol = a.length <= 4 ? 0 : a.length <= 8 ? 1 : a.length <= 14 ? 2 : 3;
  return distance(a, b, tol) <= tol;
}

/** True when the typed answer matches any accepted spelling. */
export function grade(input: string, accept: string[]): boolean {
  return !!normalize(input) && accept.some((a) => matches(input, a));
}
