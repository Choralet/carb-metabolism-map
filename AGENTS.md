# Metabolism Atlas — guide for coding agents

An interactive study map for **2310380 Biochemistry for Bioengineers**. It is built with React 18, TypeScript and Vite, is installable as a PWA, and is deployed to GitHub Pages. There is no backend: all content is hand-written data in `src/data/`.

The lecture decks are called **Parts**, and each Part is drawn as numbered **plates**:

| Part | Covers | Exam | Plates |
|------|--------|------|--------|
| I | glycolysis, gluconeogenesis, pentose phosphate pathway, glycogen | midterm | 1–8 (I and II together) |
| II | citric acid cycle, oxidative phosphorylation | midterm | |
| III | lipid metabolism | final | 9–19 |
| IV | metabolism of N-containing compounds | final | 20–35 |

## Commands
- `npm run dev` — dev server.
- `npm run build` — data check, then `tsc --noEmit`, then `vite build`. CI runs exactly this; it must pass before you commit.
- `npm run check` — the data validator on its own. It is fast; run it after every data edit.
- `npm run structures` — re-renders the molecule drawings into `src/data/structures.json` (using indigo-ketcher).
  - **Run it after adding or changing any SMILES.** A missing drawing fails the check.
- `npm run preview` — serves `dist/`, for looking at a built site in a browser.
- `npm test` — unit tests (Node's built-in runner; `tests/*.test.mjs`, currently the quiz grader).
- `npm run test:e2e` — browser tests against the build (run `npm run build` first). `tests/e2e/run.mjs` serves `dist/` with `vite preview` and runs each suite (`smoke.mjs`, `links.mjs`) in one Chromium.
  - **Browser choice:** `CHROMIUM_PATH` if set, else an installed Google Chrome, else Playwright's own build (`npx playwright-core install chromium`).
  - `HEADED=1` shows the window.

**Deploy:** a push to `main` runs `.github/workflows/pages.yml` (`npm ci`, then `npm run build`, then publish to Pages). Work on a branch; the live site changes only after merge.

## Where things live
```
src/data/        all content (below); scene.ts assembles the map
src/map/         geometry.ts (text-measured boxes, arrow routing, cofactor arcs; cached per scene) · glyphs.tsx
src/Diagram.tsx  the SVG map: camera, detail by zoom level, rendering, quiz / route / highlight states
src/Drawer.tsx   details panel (enzyme, molecule, card, regulation), structure drawings, study tables
src/App.tsx      app state: scope, selection and deep links, quiz, route tracer, panels
src/shell/       TopBar, Search (also the molecule picker), Panels (Plates, Layers, Key), QuizBar, QuizAsk, RouteBar
src/text.ts      sub/superscript runs, text measuring and wrapping, search normalisation
src/rich.tsx     <Rich> (HTML) and <Tspans> (SVG) for text containing ₂ ⁺ ⁻ …
src/quiz.ts · grade.ts · route.ts · links.ts · locate.ts
scripts/         check-data.mjs (validator) · gen-structures.mjs
tests/           grade.test.mjs (unit) · e2e/ (browser suites and their runner)
```

Data (`src/data/`):
- `types.ts` — every data type. Read it first.
- **Registries:** `molecules.ts`, `enzymes.ts`, `cards.ts`, `regulation.ts`, `cofactors.ts`. The Part III and IV entries live in `part3/` and `part4/` and are spread into these.
- `layout.ts` — midterm plates 1–8, placed by hand in absolute coordinates. It also exports a **phone scene** that re-lays out only plates 7–8 (the NADH shuttles).
- `part3/layout.ts`, `part4/layout.ts` — the final plates. Each is a `PlateDef` written in local coordinates and positioned with `place(p, x, y)` from `plate.ts`.
- `scene.ts` — merges the midterm and final parts, and tags final content with `exam: 'final'`. Never set `exam` by hand.
- `pools.ts` — the route tracer's compartment splits (see Recipes).
- `chem.ts` — `cx()`, which builds SMILES with labelled pseudo-atoms (R, CoA, ACP).
- `structures.json` — generated. Don't edit it by hand.

## Content rules (this is study material)
- **Include only what the slides show.**
- **Cite every source.** Every enzyme, card and regulation block carries `slide`, e.g. `'Part III · slide 12'`. Use the prefix constants (`S`, `P1`, `P2`, `P3`) at the top of each file. The validator rejects a missing citation.
- **Figure beats bullet.** Where a slide's bullet and its figure disagree, follow the figure and say so in the item's text. Known cases, not to be "fixed":
  - Part III: slide 7 (lipoprotein lipase products), slide 8 (TPI acts on DHAP), slide 13 ("enol-" vs "enoyl-CoA hydratase"), slide 18 ("trans-Δ³" should be trans-Δ²), slide 22 ("90 mg/mL"), slide 35 (the polyunsaturated fatty acid bullet vs the figure).
  - Part IV: slide 31 (N¹⁰-formyl-THF is the formyl donor), slide 36 (adenine, not adenosine).
- **Unnamed enzymes become summary arrows.** Either an enzyme entry with `cls: ['other']` (e.g. "Ketone body formation"), or a `style: 'plain'` edge whose note is `tags` with `plainTag: true`.
- **`cls` follows the EC number.** It is the enzyme type and drives the colour/shape highlight. When the name suggests another class, keep the EC class and explain it in `text`. Precedents: PEPCK, citrate lyase, cystathionine β-synthase, IMP synthase, FGAR and XMP amidotransferases, O-acetylserine lyase.
- **`rev`:** `true` = reversible, `false` = irreversible in cells, `null` = the slides don't say.
- **Write chemistry in Unicode:** CO₂, NAD⁺, HCO₃⁻, Δ⁹,¹², N⁵,N¹⁰. The fonts have no ⁺ ⁻ ₂ glyphs, so the renderer draws them as shifted regular characters.
- **Never upper-case Greek letters,** with `toUpperCase()` or with CSS `text-transform: uppercase`, on any text that can contain β. A capital beta renders as "B" ("Β-OXIDATION").
- **Ids are permanent.** Quiz progress (`localStorage 'atlas-quiz'`), deep links (`#enz/cs`) and route pools all key on them.

## Recipes

### Molecule
1. Add it to the right registry with its `smiles`.
2. For generic acyl groups, use CXSMILES via `cx('*CC(=O)S*', 'R', 'CoA')`.
3. Check the formula and stereocentres (RDKit works well for this).
4. Run `npm run structures && npm run check`.

### Enzyme
- Shape: `{ id, name, full?, short, cls, ec?, rev, cofactors?, subs?, prods?, text, reg?, slide }`.
- `full` is the label drawn on the map when `name` carries a parenthetical.
- `subs` and `prods` fill the drawer's reaction strip and its "Enzymes acting on it" list.

### Arrow (edge)
```ts
{ id: 'e_lb1', from: 'lb_facoa', to: 'lb_enoyl', enz: 'l_acd', tags: 'FAD → FADH₂', tagPos: 'l', co: ['FADH2'] }
```
- **`tags`** is the reaction label:
  - `"A → B"` draws a cofactor arc (A in, B out); `"+ A"` is in only; `"− B"` is out only; anything else is plain text.
  - `plainTag: true` forces a plain note.
- **Label placement:**
  - `tagPos` is `'l' | 'r' | 'above' | 'below'`.
  - `lab` moves the enzyme label beside a short arrow.
  - `noPill` hides the enzyme label.
- **`dir: 'both'`** marks the step reversible: it is drawn as harpoons, and the route tracer may run it backwards.
- **Side arrows and routing:**
  - `feed` is a co-substrate curving into the label; `out` is a co-product leaving it.
  - `via` lists waypoints (plate-local inside a `PlateDef`).
  - `t` sets where along the path the label sits.
  - `off` offsets the arrow sideways, for two arrows between the same pair of nodes.
- **`style`:** `'gng'` is dashed (gluconeogenesis), `'plain'` is a summary or transport arrow, `'link'` is a dotted connector.
- **`co`** lists `CoKey`s for the cofactor highlight. New keys go in `types.ts` and `cofactors.ts`.

### Node
- `kind` values:
  - `'met'` (default): a molecule label, from `mol` or `mols`.
  - `'small'` and `'proc'`: labelled boxes.
  - `'card'`: an overview card, set with `card`.
  - `'cx'` and `'etag'`: enzyme boxes.
  - `'xref'`: a cross-reference. `link` is the local anchor and `target` is the node elsewhere; the "▸ PLATE n · FINAL" line is computed.
- `badge` adds a small note after the label.

### Plate (final exam)
1. Write a `PlateDef` in `part3/` or `part4/layout.ts`, in local coordinates (0,0 = top-left corner).
2. Add it to `placed` with `place(p, x, y)`.
3. Keep plates at most ~1300 units wide, so they fit a phone screen.
4. Keep plate numbers unique. Final plates must sit at least 60 units right of the midterm area. Current columns: Part III at x ≈ 2600–6940, Part IV at x ≈ 7100–15960.
5. Draw membranes as `bands`, compartment names as `captions`, and side headings as `labels` (`kind: 'phase'`).

### Cross-reference drawn on another plate
Examples include a midterm molecule pointing into Part IV. These go in the part's `midXrefs` / `outsideXrefs`, in **absolute** coordinates. Midterm plates 1–6 sit in the same place in the phone scene; plates 7–8 do not, so don't anchor there.

### Regulation box
- Goes in the part's `regulation.ts`, with `id: 'r_' + enzymeId`. The drawer finds it by that id.
- Anchored to an `edge`, offset by `dx`/`dy`.
- Fields: one-line `act` / `inh`, a `detail[]` list, and `slide`.

### Card and study table
- Shape: `{ id, title, sub?, bullets, mols?, table?: StudyTable[], slide }`.
- To show it, add a `kind: 'card'` node on a plate.
- Cards with a table get a table glyph and are listed under "Study tables" in the Plates panel.

### Route-tracer pools
When you add a node for a molecule that exists in both the matrix and the cytosol, list the node in `pools.ts`. Examples: acetyl-CoA, fatty acyl-CoA, oxaloacetate, malate, citrate, aspartate, glutamate. Otherwise routes jump straight across membranes.

## Implementation notes (things that caused bugs before)
- **Node runs the `.ts` data files directly** (type stripping). A value import between data modules therefore needs the `.ts` extension, e.g. `import { cx } from '../chem.ts'`. Type-only imports may leave it off.
- **Rich text:**
  - Any text that may contain sub- or superscripts must go through `<Rich>` (HTML) or `<Tspans>` (SVG).
  - Inside a flex or grid container, wrap `<Rich>` in a `<span>`; otherwise each fragment becomes a separate item and the name breaks apart.
- **Label boxes are measured** with canvas text metrics once the fonts have loaded (`fontsReady()` in `main.tsx`). `geometryOf(scene)` caches all geometry per scene.
- **The camera is the SVG `viewBox`**, driven outside React, and hover highlighting toggles a DOM class. Keep both out of React state; otherwise every frame re-renders the whole map.
- **Detail by zoom:** `svg[data-lod]` is `far` (below 0.36 px per map unit), `mid` (below 0.6) or `near`. Show and hide elements with the classes `lod-mid`, `lod-near` and `far-only`.
- **Colours** are CSS tokens in `styles.css`, with a dark set under `:root[data-theme="dark"]`. Enzyme types use `--k-<class>`; the exams use `--mid` and `--fin`.
- **Structure drawings:**
  - Bonds are drawn in a coordinate system scaled ×100, so `gen-structures.mjs` keeps three decimals there. Rounding harder erases the bonds.
  - The drawings are one ~1.8 MB chunk, cached for offline use. The PWA cache limit is 3 MiB, set in `vite.config.ts`.
- **Phones:** `PHONE_QUERY` (max-width 720px) switches to the phone scene. Jumping to a plate opens it at reading size (`regionView`).
- **Deep links:**
  - Formats: `#enz/<id>`, `#mol/<node>`, `#card/<id>`, `#reg/<id>`, `#plate/<n>`, with an optional view `@cx,cy,width`.
  - Opening the drawer pushes one history entry and switching selections replaces it, so Back closes the drawer. Keep that behaviour.
- **localStorage** holds per-viewer conveniences only: `atlas-scope`, `atlas-theme`, `atlas-key`, `atlas-quiz`. Wrap every access in try/catch.
- **`package-lock.json`:** don't regenerate it wholesale, because some npm versions drop platform `libc` fields. Make minimal changes and confirm with `npm ci`.

## Before you push
1. `npm run build` passes with 0 errors. Treat any new validator warning as a bug.
2. `npm test` and `npm run test:e2e` pass. When you change behaviour, update or add checks in `tests/e2e/`.
   - Suites read expected counts from the data (e.g. how many final plates exist), so adding content shouldn't break them.
   - When you rename or move something a check names, update that check.
3. Look at what you changed in a browser, at reading zoom:
   - on desktop and on a phone-sized (~390 px) window;
   - in light and dark mode;
   - checking that labels don't collide with arrows, cofactor arcs or membranes.
4. Write commit messages with an imperative subject line, then a short body saying what changed and why.
