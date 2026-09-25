/**
 * Text utilities shared by the map (SVG) and the panels (HTML).
 *
 * Data strings are written with Unicode sub/superscripts (CO₂, NAD⁺, Ca²⁺, Cₙ₋₂) because they are easy to author and
 * to search. None of the self-hosted font subsets contain those glyphs, so for display every string is split into
 * runs and the sub/superscripts are drawn as smaller, shifted *regular* characters. That keeps a formula in one
 * typeface on every device instead of mixing in whatever fallback font the OS has.
 */

export type RunKind = 'n' | 'sub' | 'sup';
export interface Run { t: string; k: RunKind }

const SUB: Record<string, string> = {
  '₀': '0', '₁': '1', '₂': '2', '₃': '3', '₄': '4', '₅': '5', '₆': '6', '₇': '7', '₈': '8', '₉': '9',
  '₊': '+', '₋': '−', '₌': '=', '₍': '(', '₎': ')', 'ₐ': 'a', 'ₑ': 'e', 'ₒ': 'o', 'ₓ': 'x', 'ₕ': 'h', 'ₖ': 'k',
  'ₗ': 'l', 'ₘ': 'm', 'ₙ': 'n', 'ₚ': 'p', 'ₛ': 's', 'ₜ': 't', 'ᵢ': 'i', 'ⱼ': 'j',
};
const SUP: Record<string, string> = {
  '⁰': '0', '¹': '1', '²': '2', '³': '3', '⁴': '4', '⁵': '5', '⁶': '6', '⁷': '7', '⁸': '8', '⁹': '9',
  '⁺': '+', '⁻': '−', '⁼': '=', '⁽': '(', '⁾': ')', 'ⁿ': 'n', 'ⁱ': 'i',
};

const rcache = new Map<string, Run[]>();
/** Splits a string into normal / subscript / superscript runs. */
export function runs(s: string): Run[] {
  const hit = rcache.get(s);
  if (hit) return hit;
  const out: Run[] = [];
  for (const ch of s) {
    const k: RunKind = ch in SUB ? 'sub' : ch in SUP ? 'sup' : 'n';
    const t = k === 'sub' ? SUB[ch] : k === 'sup' ? SUP[ch] : ch;
    const last = out[out.length - 1];
    if (last && last.k === k) last.t += t; else out.push({ t, k });
  }
  rcache.set(s, out);
  return out;
}

/** Size of a sub/superscript relative to its text, and how far the baseline moves (fractions of the font size). */
export const SCRIPT_SCALE = 0.72;
export const SUB_SHIFT = 0.26;
export const SUP_SHIFT = -0.4;

// ── measuring ───────────────────────────────────────────────────────
export type Fam = 'serif' | 'sans' | 'mono' | 'display';
export const FAMILY: Record<Fam, string> = {
  serif: '"Atlas Serif", Georgia, serif',
  sans: '"Atlas Sans", system-ui, sans-serif',
  mono: '"Atlas Mono", ui-monospace, monospace',
  display: '"Atlas Display", "Atlas Serif", Georgia, serif',
};

let ctx: CanvasRenderingContext2D | null = null;
const mcache = new Map<string, number>();
function measurePlain(t: string, size: number, weight: number, fam: Fam, italic: boolean): number {
  const key = `${fam}|${italic ? 'i' : ''}${weight}|${size}|${t}`;
  const hit = mcache.get(key);
  if (hit !== undefined) return hit;
  ctx ??= document.createElement('canvas').getContext('2d');
  let w = t.length * size * 0.55;
  if (ctx) { ctx.font = `${italic ? 'italic ' : ''}${weight} ${size}px ${FAMILY[fam]}`; w = ctx.measureText(t).width; }
  mcache.set(key, w);
  return w;
}

/** Rendered width of a (rich) string. */
export function measure(s: string, size: number, weight = 500, fam: Fam = 'sans', italic = false): number {
  let w = 0;
  for (const r of runs(s)) w += measurePlain(r.t, r.k === 'n' ? size : size * SCRIPT_SCALE, weight, fam, italic);
  return w;
}

const wcache = new Map<string, string[]>();
/** Greedy word wrap to a maximum width. */
export function wrap(s: string, size: number, weight: number, fam: Fam, max: number, italic = false): string[] {
  const key = `${fam}|${italic ? 'i' : ''}${weight}|${size}|${max}|${s}`;
  const hit = wcache.get(key);
  if (hit) return hit;
  const lines: string[] = [];
  let cur = '';
  for (const word of s.split(' ')) {
    const next = cur ? `${cur} ${word}` : word;
    if (cur && measure(next, size, weight, fam, italic) > max) { lines.push(cur); cur = word; } else cur = next;
  }
  if (cur) lines.push(cur);
  wcache.set(key, lines);
  return lines;
}

/** Widths depend on the web fonts, so everything cached before they finished loading has to be thrown away. */
const listeners = new Set<() => void>();
export function onTextReset(fn: () => void) { listeners.add(fn); return () => { listeners.delete(fn); }; }
function resetText() { mcache.clear(); wcache.clear(); listeners.forEach((fn) => fn()); }

/** Faces the map measures with. `document.fonts.load` pulls in the latin + greek (+ symbol) files for the sample. */
const FACES = [
  `600 16px ${FAMILY.serif}`, `italic 500 13px ${FAMILY.serif}`, `500 12.5px ${FAMILY.sans}`, `400 12px ${FAMILY.sans}`,
  `600 13px ${FAMILY.sans}`, `600 20px ${FAMILY.display}`, `500 11px ${FAMILY.mono}`,
];

/** Resolves when the fonts are in (or after `ms`, so a slow network never blocks the app); re-measures on late arrival. */
export function fontsReady(ms = 2500): Promise<void> {
  if (!('fonts' in document)) return Promise.resolve();
  const all = Promise.all(FACES.map((f) => document.fonts.load(f, 'Aaβ→'))).then(() => undefined, () => undefined);
  let late = false;
  all.then(() => { if (late) resetText(); });
  return Promise.race([all, new Promise<void>((r) => setTimeout(() => { late = true; r(); }, ms))]);
}

// ── search ──────────────────────────────────────────────────────────
const GREEK: Record<string, string> = { α: 'alpha', β: 'beta', γ: 'gamma', δ: 'delta', Δ: 'delta', ε: 'epsilon', ω: 'omega', ψ: 'psi', µ: 'mu', μ: 'mu' };

/** Lower-case, script digits to plain, Greek letters spelled out, punctuation dropped: "NAD⁺" ≈ "nad+", "β-ox" ≈ "beta ox". */
export function normalize(s: string): string {
  let out = '';
  for (const ch of s.normalize('NFKD')) {
    if (ch in GREEK) out += ` ${GREEK[ch]} `;
    else if (ch in SUB) out += SUB[ch];
    else if (ch in SUP) out += SUP[ch];
    else out += ch;
  }
  return out.toLowerCase().replace(/[̀-ͯ]/g, '').replace(/[−–—]/g, '-').replace(/[^a-z0-9+]+/g, ' ').trim();
}

/** `normalize` without spaces, for matching "glucose6phosphate" against "Glucose 6-phosphate". */
export const compact = (s: string) => normalize(s).replace(/ /g, '');
