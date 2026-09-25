// Pre-renders every molecule in src/data/molecules.ts to an SVG string with the same Indigo engine Ketcher
// uses, so the browser never has to load Ketcher just to *show* a structure.
//   node scripts/gen-structures.mjs      (or: npm run structures)
// Output: src/data/structures.json  { [moleculeId]: "<svg …>" }  — re-run after editing a SMILES.
import { createRequire } from 'node:module';
import { writeFileSync } from 'node:fs';
import { molecules } from '../src/data/molecules.ts';

const require = createRequire(import.meta.url);
const indigo = await require('indigo-ketcher').default();

const opts = (o) => { const m = new indigo.MapStringString(); for (const [k, v] of Object.entries(o)) m.set(k, v); return m; };

/**
 * Set the SVG's intrinsic size. Indigo draws every molecule at one scale (atom labels ~28 units tall), and CSS only
 * ever shrinks a drawing to fit its card. At 0.5 a label is at most ~14 px, so a lone ion such as NH₄⁺ is not blown
 * up to fill the card while larger molecules still shrink to fit.
 */
function enlarge(svg, factor = 0.5) {
  return svg.replace(/<svg\b[^>]*>/, (tag) =>
    tag.replace(/\b(width|height)="([\d.]+)(px)?"/g, (_, k, v) => `${k}="${+(parseFloat(v) * factor).toFixed(2)}"`));
}

/**
 * Indigo writes numbers to six decimals and pretty-prints; trimming them shrinks the file (it is precached for
 * offline use, which has a size cap). The glyph outlines in <defs> are in plain units, where one decimal is far below
 * a pixel. Bonds are drawn in a ×100 scaled system (`transform="matrix(100, …)"`): their 0.03 stroke widths and
 * coordinates keep three decimals, since one would zero the strokes and shift bonds by several units.
 */
const round = (s, places) => s.replace(new RegExp(`(\\d+\\.\\d{${places}})\\d+`, 'g'), '$1');
const compact = (svg) => {
  const i = svg.indexOf('</defs>');
  return (i < 0 ? round(svg, 3) : round(svg.slice(0, i), 1) + round(svg.slice(i), 3))
  .replace(/>\s+</g, '><')
  .replaceAll('rgb(0%, 0%, 0%)', '#000')
  // every glyph is wrapped in its own <g fill=… fill-opacity="1">; the colour can sit on the <use> itself
  .replace(/<g fill="([^"]+)" fill-opacity="1">(<use )([^>]*\/>)<\/g>/g, '$2fill="$1" $3');
};

/**
 * Indigo returns the SVG base64-encoded. Its text is drawn from glyph <symbol>/<clipPath> ids that repeat in every
 * file, so several inlined structures in one drawer would pick up each other's glyphs; prefix every id per molecule.
 */
function decode(b64, prefix) {
  let svg = Buffer.from(b64, 'base64').toString('utf8').replace(/^<\?xml[^>]*\?>\s*/, '');
  const ids = [...svg.matchAll(/\bid="([^"]+)"/g)].map((x) => x[1]);
  for (const id of new Set(ids)) {
    svg = svg.replaceAll(`id="${id}"`, `id="${prefix}-${id}"`).replaceAll(`#${id}"`, `#${prefix}-${id}"`).replaceAll(`#${id})`, `#${prefix}-${id})`);
  }
  return svg;
}

const out = {};
for (const m of molecules) {
  if (!m.smiles) continue;
  // Render the SMILES directly: Indigo lays it out itself and keeps the wedge/hash stereo bonds. Going through a
  // molfile loses them (no coordinates to hang them on). 'render-stereo-style: none' only drops the "Chiral" caption.
  const svg = indigo.render(m.smiles, opts({ 'render-output-format': 'svg', 'render-stereo-style': 'none' }));
  out[m.id] = compact(enlarge(decode(String(svg), m.id)));
}

writeFileSync(new URL('../src/data/structures.json', import.meta.url), JSON.stringify(out));
const kb = (JSON.stringify(out).length / 1024).toFixed(0);
console.log(`Rendered ${Object.keys(out).length} structures → src/data/structures.json (${kb} KB)`);
