import { useEffect, useMemo, useRef, useState } from 'react';
import { cardById } from '../data/cards';
import { classById, enzById } from '../data/enzymes';
import { molById } from '../data/molecules';
import { regBlocks } from '../data/regulation';
import type { EnzClass, Exam, Scene, Scope } from '../data/types';
import type { Selection, View } from '../Diagram';
import { bestPlace, molPlaces, placesOf, regionView, viewAround, type Place } from '../locate';
import { MarkIcon } from '../map/glyphs';
import { Rich } from '../rich';
import { compact, normalize } from '../text';
import { CloseIcon, SearchIcon } from './icons';

type Kind = 'enzyme' | 'molecule' | 'overview' | 'plate' | 'regulation';
interface Entry { key: string; kind: Kind; label: string; alts: string[]; sub: string; cls?: EnzClass; places: Place[]; select: Selection; view?: View; mol?: string }

const plural = (n: number, w: string) => `${n} ${w}${n === 1 ? '' : 's'}`;
const where = (ps: Place[]) => {
  const plates = [...new Set(ps.map((p) => p.plate?.plate).filter((x): x is number => x !== undefined))];
  return plates.length ? `Plate ${plates.join(', ')}` : '';
};

/** Everything findable on the current map. */
function buildIndex(scene: Scene): Entry[] {
  const out: Entry[] = [];
  const enzIds = new Set<string>();
  scene.edges.forEach((e) => { if (e.enz && e.style !== 'link') enzIds.add(e.enz); });
  scene.nodes.forEach((n) => { if (n.enz) enzIds.add(n.enz); });
  enzIds.forEach((id) => {
    const z = enzById[id];
    const places = placesOf({ kind: 'enz', id }, scene);
    out.push({ key: `e:${id}`, kind: 'enzyme', label: z.full ?? z.name, alts: [z.name, z.short, z.ec ?? ''], sub: `${classById[z.cls[0]].label} · ${where(places)}`, cls: z.cls[0], places, select: { kind: 'enz', id } });
  });
  const molIds = new Set<string>();
  scene.nodes.forEach((n) => { if (n.mol) molIds.add(n.mol); n.mols?.forEach((m) => molIds.add(m)); });
  molIds.forEach((id) => {
    const places = molPlaces(id, scene);
    if (!places.length) return;
    const extra = places.length > 1 ? ` · drawn ${plural(places.length, 'time')}` : '';
    out.push({ key: `m:${id}`, kind: 'molecule', label: molById[id].name, alts: [], sub: `Molecule · ${where(places)}${extra}`, places, select: { kind: 'node', id: places[0].nodeId! }, mol: id });
  });
  scene.nodes.forEach((n) => {
    if (!n.card) return;
    const c = cardById[n.card];
    const places = placesOf({ kind: 'card', id: n.card }, scene);
    out.push({ key: `c:${n.card}`, kind: 'overview', label: c.title, alts: [n.label ?? '', c.sub ?? ''], sub: `Overview · ${where(places)}`, places, select: { kind: 'card', id: n.card } });
  });
  scene.regions.forEach((r) => {
    out.push({ key: `p:${r.id}`, kind: 'plate', label: r.title, alts: [r.sub ?? '', `plate ${r.plate}`], sub: `Plate ${r.plate} · Part ${r.part}`, places: [{ x: r.x + r.w / 2, y: r.y + r.h / 2, plate: r, exam: r.part === 'III' || r.part === 'IV' ? 'final' : 'mid' }], select: null, view: regionView(r) });
  });
  regBlocks.forEach((r) => {
    const places = placesOf({ kind: 'reg', id: r.id }, scene);
    if (!places.length) return;
    out.push({ key: `r:${r.id}`, kind: 'regulation', label: `${r.title} — regulation`, alts: [r.act ?? '', r.inh ?? ''], sub: `${r.kind === 'agent' ? 'Inhibitors' : 'Allosteric regulation'} · ${where(places)}`, places, select: { kind: 'reg', id: r.id } });
  });
  return out;
}

const KIND_RANK: Record<Kind, number> = { plate: 0, enzyme: 1, molecule: 2, overview: 3, regulation: 4 };

/** Crude but predictable ranking: whole-name matches, then prefixes, then word starts, then substrings. */
function score(e: Entry, q: string, qc: string): number {
  let best = 0;
  for (const text of [e.label, ...e.alts]) {
    if (!text) continue;
    const n = normalize(text), c = n.replace(/ /g, '');
    let s = 0;
    if (c === qc) s = 100;
    else if (c.startsWith(qc)) s = 80;
    else if (n.split(' ').some((w) => w.startsWith(q))) s = 60;
    else if (c.includes(qc)) s = 40;
    else if (q.split(' ').every((w) => n.includes(w))) s = 30;
    if (text !== e.label) s -= e.kind === 'regulation' ? 25 : 5;
    best = Math.max(best, s);
  }
  return best;
}

interface Props {
  scene: Scene;
  scope: Scope;
  onClose: () => void;
  onPick: (select: Selection, view: View) => void;
  /** Molecule-picking mode (for the route tracer): only molecules are listed, and picking one calls this. */
  pickMolecule?: { prompt: string; onPick: (molId: string) => void };
}

export default function Search({ scene, scope, onClose, onPick, pickMolecule }: Props) {
  const all = useMemo(() => buildIndex(scene), [scene]);
  const index = useMemo(() => (pickMolecule ? all.filter((e) => e.mol) : all), [all, pickMolecule]);
  const [q, setQ] = useState('');
  const [at, setAt] = useState(0);
  const input = useRef<HTMLInputElement>(null);
  const list = useRef<HTMLUListElement>(null);
  useEffect(() => { input.current?.focus(); }, []);

  const results = useMemo(() => {
    const nq = normalize(q), qc = compact(q);
    const inScope = (e: Entry) => e.places.some((p) => scope === 'both' || p.exam === scope);
    if (!nq) return pickMolecule ? [] : index.filter((e) => e.kind === 'plate' && inScope(e)).sort((a, b) => a.places[0].plate!.plate - b.places[0].plate!.plate);
    return index
      .map((e) => ({ e, s: score(e, nq, qc) + (inScope(e) ? 8 : 0) }))
      .filter((x) => x.s > 8)
      .sort((a, b) => b.s - a.s || KIND_RANK[a.e.kind] - KIND_RANK[b.e.kind] || a.e.label.length - b.e.label.length)
      .slice(0, 40)
      .map((x) => x.e);
  }, [q, index, scope]);

  useEffect(() => { setAt(0); }, [q]);
  useEffect(() => { list.current?.querySelector('[aria-selected="true"]')?.scrollIntoView({ block: 'nearest' }); }, [at]);

  const pick = (e: Entry) => {
    if (pickMolecule) { if (e.mol) pickMolecule.onPick(e.mol); return; }
    const p = bestPlace(e.places, scope);
    onPick(e.select, e.view ?? viewAround(p));
  };

  const onKey = (ev: React.KeyboardEvent) => {
    if (ev.key === 'ArrowDown') { ev.preventDefault(); setAt((i) => Math.min(results.length - 1, i + 1)); }
    else if (ev.key === 'ArrowUp') { ev.preventDefault(); setAt((i) => Math.max(0, i - 1)); }
    else if (ev.key === 'Enter') { ev.preventDefault(); if (results[at]) pick(results[at]); }
    else if (ev.key === 'Escape') { ev.preventDefault(); onClose(); }
  };

  const outOfScope = (e: Entry): Exam | null => (scope !== 'both' && !e.places.some((p) => p.exam === scope) ? e.places[0]?.exam ?? null : null);

  return (
    <div className="palette-back" onClick={onClose}>
      <div className="palette" role="dialog" aria-label={pickMolecule ? pickMolecule.prompt : 'Search the map'} onClick={(ev) => ev.stopPropagation()}>
        {pickMolecule && <div className="palette-prompt"><Rich s={pickMolecule.prompt} /></div>}
        <div className="palette-in">
          <SearchIcon />
          <input ref={input} value={q} onChange={(ev) => setQ(ev.target.value)} onKeyDown={onKey}
            placeholder={pickMolecule ? 'Type a molecule (try “palmitate”, “urea”)' : 'Enzyme, molecule, plate… (try “pfk”, “beta”, “nad+”)'} aria-label="Search"
            role="combobox" aria-expanded="true" aria-controls="palette-list" aria-activedescendant={results[at] ? `pal-${results[at].key}` : undefined} />
          <button className="icon-btn" onClick={onClose} aria-label="Close search"><CloseIcon /></button>
        </div>
        <ul className="palette-list" id="palette-list" role="listbox" ref={list}>
          {!q && !pickMolecule && <li className="palette-head" role="presentation">Plates</li>}
          {results.map((e, i) => {
            const oos = outOfScope(e);
            return (
              <li key={e.key} id={`pal-${e.key}`} role="option" aria-selected={i === at} className={i === at ? 'on' : ''}
                onMouseEnter={() => setAt(i)} onClick={() => pick(e)}>
                <span className={`pk pk-${e.kind}`}>
                  {e.kind === 'enzyme' && e.cls ? <MarkIcon cls={e.cls} /> : e.kind === 'plate' ? <span className="pk-no">{e.places[0].plate?.plate}</span> : null}
                </span>
                <span className="pl"><Rich s={e.label} /></span>
                <span className="ps"><Rich s={e.sub} />{oos && <em className="oos">{oos === 'final' ? 'Final' : 'Midterm'}</em>}</span>
              </li>
            );
          })}
          {q && !results.length && <li className="palette-empty">Nothing matches “{q}”.</li>}
        </ul>
        <div className="palette-foot"><kbd>↑</kbd><kbd>↓</kbd> move · <kbd>Enter</kbd> open · <kbd>Esc</kbd> close</div>
      </div>
    </div>
  );
}
