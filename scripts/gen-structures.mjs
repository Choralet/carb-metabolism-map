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

/** Scale the SVG's intrinsic size so thumbnails read well; CSS caps it at the card width. */
function enlarge(svg, factor = 1.6) {
  return svg.replace(/<svg\b[^>]*>/, (tag) =>
    tag.replace(/\b(width|height)="([\d.]+)(px)?"/g, (_, k, v) => `${k}="${+(parseFloat(v) * factor).toFixed(2)}"`));
}

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
  out[m.id] = enlarge(decode(String(svg), m.id));
}

writeFileSync(new URL('../src/data/structures.json', import.meta.url), JSON.stringify(out));
const kb = (JSON.stringify(out).length / 1024).toFixed(0);
console.log(`Rendered ${Object.keys(out).length} structures → src/data/structures.json (${kb} KB)`);
