// Consistency checks for the hand-written map data. Run with `npm run check` (also part of `npm run build`).
// Errors (broken references, missing slide citations, stale structure drawings) fail the build; warnings are
// printed for things that are probably, but not certainly, mistakes.
import { readFileSync } from 'node:fs';
import { desktopScene, phoneScene } from '../src/data/scene.ts';
import { enzymes, classes } from '../src/data/enzymes.ts';
import { molecules } from '../src/data/molecules.ts';
import { cards } from '../src/data/cards.ts';
import { regBlocks } from '../src/data/regulation.ts';
import { cofactors } from '../src/data/cofactors.ts';

const errors = [];
const warnings = [];
const err = (m) => errors.push(m);
const warn = (m) => warnings.push(m);

const byId = (list, what) => {
  const m = new Map();
  for (const x of list) {
    if (m.has(x.id)) err(`duplicate ${what} id "${x.id}"`);
    m.set(x.id, x);
  }
  return m;
};

const enz = byId(enzymes, 'enzyme');
const mol = byId(molecules, 'molecule');
const card = byId(cards, 'card');
byId(regBlocks, 'regulation block');
const classIds = new Set(classes.map((c) => c.id));
const coIds = new Set(cofactors.map((c) => c.id));

for (const e of enzymes) {
  if (!e.slide?.trim()) err(`enzyme ${e.id}: no slide citation`);
  if (!e.text?.length) err(`enzyme ${e.id}: no description`);
  for (const c of e.cls) if (!classIds.has(c)) err(`enzyme ${e.id}: unknown class "${c}"`);
  for (const m of [...(e.subs ?? []), ...(e.prods ?? [])]) if (!mol.has(m)) err(`enzyme ${e.id}: unknown molecule "${m}"`);
}
for (const c of cards) {
  if (!c.slide?.trim()) err(`card ${c.id}: no slide citation`);
  for (const m of c.mols ?? []) if (!mol.has(m)) err(`card ${c.id}: unknown molecule "${m}"`);
}
for (const r of regBlocks) if (!r.slide?.trim()) err(`regulation ${r.id}: no slide citation`);

function checkScene(scene, name) {
  const nodes = byId(scene.nodes, `${name} node`);
  byId(scene.edges, `${name} edge`);
  const regions = byId(scene.regions, `${name} region`);
  const plates = new Map();
  for (const r of scene.regions) {
    if (plates.has(r.plate)) err(`${name}: plate number ${r.plate} used by ${plates.get(r.plate)} and ${r.id}`);
    plates.set(r.plate, r.id);
  }
  const inside = (p) => scene.regions.find((r) => p.x >= r.x && p.x <= r.x + r.w && p.y >= r.y && p.y <= r.y + r.h);
  for (const n of scene.nodes) {
    const at = `${name} node ${n.id}`;
    if (n.mol && !mol.has(n.mol)) err(`${at}: unknown molecule "${n.mol}"`);
    for (const m of n.mols ?? []) if (!mol.has(m)) err(`${at}: unknown molecule "${m}"`);
    if (n.card && !card.has(n.card)) err(`${at}: unknown card "${n.card}"`);
    if (n.enz && !enz.has(n.enz)) err(`${at}: unknown enzyme "${n.enz}"`);
    if (n.link && !nodes.has(n.link)) err(`${at}: link to unknown node "${n.link}"`);
    if (n.kind === 'xref') {
      if (!n.target || !nodes.has(n.target)) err(`${at}: cross-reference to unknown node "${n.target}"`);
      else if (n.target === n.link) err(`${at}: cross-reference points at its own anchor`);
    }
    if (!n.mol && !n.mols && !n.label && n.kind !== 'etag' && n.kind !== 'xref') err(`${at}: no label and no molecule`);
    if (!inside(n)) warn(`${at} (${n.x}, ${n.y}) is not on any plate`);
  }
  for (const e of scene.edges) {
    const at = `${name} edge ${e.id}`;
    if (!nodes.has(e.from)) err(`${at}: unknown from-node "${e.from}"`);
    if (!nodes.has(e.to)) err(`${at}: unknown to-node "${e.to}"`);
    if (e.enz && !enz.has(e.enz)) err(`${at}: unknown enzyme "${e.enz}"`);
    if (e.feed && !nodes.has(e.feed)) err(`${at}: unknown feed node "${e.feed}"`);
    if (e.out && !nodes.has(e.out)) err(`${at}: unknown out node "${e.out}"`);
    for (const c of e.co ?? []) if (!coIds.has(c)) err(`${at}: unknown cofactor "${c}"`);
    if (e.tags && e.tags.includes('→') && e.tags.replace('→', '').trim() === '') err(`${at}: empty reaction label`);
    if (e.from === e.to) err(`${at}: starts and ends at the same node`);
  }
  for (const j of scene.jumps) if (j.plate && !regions.has(j.plate)) err(`${name} view ${j.id}: unknown plate "${j.plate}"`);
  for (const r of regBlocks) {
    const ok = 'edge' in r.anchor ? scene.edges.some((e) => e.id === r.anchor.edge) : nodes.has(r.anchor.node);
    if (!ok) err(`${name}: regulation ${r.id} is anchored to something not on the map`);
  }
  // final plates live in their own wing to the right of the midterm map
  const mid = scene.regions.filter((r) => r.part === 'I' || r.part === 'II');
  const fin = scene.regions.filter((r) => r.part === 'III' || r.part === 'IV');
  if (mid.length && fin.length) {
    const edge = Math.max(...mid.map((r) => r.x + r.w));
    for (const r of fin) if (r.x < edge + 60) err(`${name}: final plate ${r.id} starts at x=${r.x}, inside the midterm area (ends at ${edge})`);
  }
  return nodes;
}

const deskNodes = checkScene(desktopScene, 'desktop');
checkScene(phoneScene, 'phone');

// everything defined should be drawn somewhere
const usedEnz = new Set([...desktopScene.edges.map((e) => e.enz), ...desktopScene.nodes.map((n) => n.enz)].filter(Boolean));
for (const e of enzymes) if (!usedEnz.has(e.id)) warn(`enzyme ${e.id} is not drawn on the map`);
const usedMol = new Set([
  ...desktopScene.nodes.flatMap((n) => [n.mol, ...(n.mols ?? [])]),
  ...enzymes.flatMap((e) => [...(e.subs ?? []), ...(e.prods ?? [])]),
  ...cards.flatMap((c) => c.mols ?? []),
].filter(Boolean));
for (const m of molecules) if (!usedMol.has(m.id)) warn(`molecule ${m.id} is never used`);
const usedCards = new Set(desktopScene.nodes.map((n) => n.card).filter(Boolean));
for (const c of cards) if (!usedCards.has(c.id)) warn(`card ${c.id} is not on the map`);
void deskNodes;

// pre-rendered structure drawings must be up to date
const structures = JSON.parse(readFileSync(new URL('../src/data/structures.json', import.meta.url), 'utf8'));
for (const m of molecules) if (m.smiles && !structures[m.id]) err(`molecule ${m.id} has SMILES but no drawing: run "npm run structures"`);
for (const id of Object.keys(structures)) if (!mol.has(id)) warn(`structures.json has a drawing for unknown molecule "${id}"`);

for (const w of warnings) console.log(`  warn  ${w}`);
for (const e of errors) console.log(`  ERROR ${e}`);
const n = (k, w) => `${k} ${w}${k === 1 ? '' : 's'}`;
console.log(`data check: ${enzymes.length} enzymes, ${molecules.length} molecules, ${cards.length} cards, ${desktopScene.nodes.length} nodes, ${desktopScene.edges.length} edges — ${n(errors.length, 'error')}, ${n(warnings.length, 'warning')}`);
if (errors.length) process.exit(1);
