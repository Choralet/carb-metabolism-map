import { useEffect, useState } from 'react';
import { cardById } from './data/cards';
import { classById, enzById, enzymes } from './data/enzymes';
import { otherAgents, regById, regForEnzyme } from './data/regulation';
import { molById } from './data/molecules';
import type { Exam, Scene, Scope, StudyTable } from './data/types';
import type { Selection, View } from './Diagram';
import { molPlaces, placesOf, viewAround, type Place } from './locate';
import { geometryOf } from './map/geometry';
import { MarkIcon, RegIcon } from './map/glyphs';
import { Rich } from './rich';
import { CheckIcon, CloseIcon, LinkIcon, RouteIcon } from './shell/icons';
import { loadStructures } from './structures';

interface Props {
  selection: NonNullable<Selection>;
  scene: Scene;
  scope: Scope;
  onClose: () => void;
  onSelect: (s: Selection) => void;
  onGo: (v: View) => void;
  onEdit: (title: string, smiles: string) => void;
  /** Copies a link to this selection (and the current view); resolves true when the clipboard took it. */
  onCopyLink: () => Promise<boolean>;
  /** Start tracing a route from (or to) this molecule; the other end is picked next. */
  onRoute: (mol: string, end: 'from' | 'to') => void;
}

function Structure({ molId, onEdit }: { molId: string; onEdit: Props['onEdit'] }) {
  const m = molById[molId];
  const [svg, setSvg] = useState<string | null>(null);
  const [err, setErr] = useState(false);
  useEffect(() => {
    let live = true;
    setSvg(null); setErr(false);
    if (m?.smiles) loadStructures().then((all) => live && (all[molId] ? setSvg(all[molId]) : setErr(true))).catch(() => live && setErr(true));
    return () => { live = false; };
  }, [molId, m?.smiles]);
  if (!m?.smiles) return null;
  return (
    <figure className="struct">
      <div className="struct-img" data-mol={molId}>
        {svg ? <div dangerouslySetInnerHTML={{ __html: svg }} /> : <span className="muted">{err ? 'Could not draw' : 'Drawing…'}</span>}
      </div>
      <figcaption>
        <span><Rich s={m.name} /></span>
        <button className="link" onClick={() => onEdit(m.name, m.smiles!)}>Edit in Ketcher</button>
      </figcaption>
    </figure>
  );
}

function joinPlus(ids: string[], onEdit: Props['onEdit']) {
  return ids.flatMap((m, i) => [i > 0 ? <span key={m + '+'} className="plus">+</span> : null, <Structure key={m} molId={m} onEdit={onEdit} />]);
}

/** A study table: the first cell of each row is its heading. Wide tables scroll sideways on a phone. */
function Table({ t }: { t: StudyTable }) {
  return (
    <figure className="study">
      <div className="study-scroll">
        <table>
          {t.caption && <caption><Rich s={t.caption} /></caption>}
          <thead><tr>{t.head.map((h, i) => <th key={i} scope="col"><Rich s={h} /></th>)}</tr></thead>
          <tbody>
            {t.rows.map((r, i) => (
              <tr key={i}>{r.map((cell, j) => (j === 0 ? <th key={j} scope="row"><Rich s={cell} /></th> : <td key={j}><Rich s={cell} /></td>))}</tr>
            ))}
          </tbody>
        </table>
      </div>
      {t.foot && <figcaption className="foot"><Rich s={t.foot} /></figcaption>}
    </figure>
  );
}

/** "Plate 6 · Mitochondrion" chips that fly the map to each place something is drawn. */
function Places({ places, onGo, label }: { places: Place[]; onGo: Props['onGo']; label: string }) {
  const seen = new Set<number>();
  const uniq = places.filter((p) => p.plate && !seen.has(p.plate.plate) && seen.add(p.plate.plate));
  if (uniq.length < 2) return null;
  return (
    <section>
      <h3>{label}</h3>
      <div className="place-row">
        {uniq.map((p) => (
          <button key={p.plate!.plate} className={`place ${p.exam}`} onClick={() => onGo(viewAround(p))}>
            <span className="place-no">{p.plate!.plate}</span> <span><Rich s={p.plate!.title} /></span>
          </button>
        ))}
      </div>
    </section>
  );
}

/** Capitals for Latin letters only: an upper-case β is a capital beta, which reads as B ("Β-OXIDATION"). */
const latinUpper = (s: string) => s.replace(/[a-z]+/g, (w) => w.toUpperCase());

/** Which exams a selection is drawn for: shared steps (citrate synthase, acetyl-CoA…) carry both badges. */
const examsOf = (ps: Place[]): Exam[] => (['mid', 'final'] as const).filter((x) => ps.some((p) => p.exam === x));

function Kicker({ exams, plate, what }: { exams: Exam[]; plate?: { plate: number; title: string }; what: string }) {
  return (
    <div className="kicker">
      {exams.map((x) => <b key={x} className={`part-badge ${x}`}>{x === 'final' ? 'FINAL' : 'MIDTERM'}</b>)}
      <span>{what}{plate ? <> · PLATE {plate.plate} · <Rich s={latinUpper(plate.title)} /></> : null}</span>
    </div>
  );
}

function EnzymeView({ id, places, onEdit, onGo }: { id: string; places: Place[]; onEdit: Props['onEdit']; onGo: Props['onGo'] }) {
  const e = enzById[id];
  const subs = (e.subs ?? []).filter((m) => molById[m]?.smiles);
  const prods = (e.prods ?? []).filter((m) => molById[m]?.smiles);
  const r = regForEnzyme(id)[0];
  return (
    <>
      <div className="cls-line">
        {e.cls.map((c) => <span key={c}><MarkIcon cls={c} /> {classById[c].label}</span>)}
      </div>
      <h2><Rich s={e.name} /></h2>
      <dl className="facts">
        {e.short !== (e.full ?? e.name) && <><dt>Short form</dt><dd><Rich s={e.short} /></dd></>}
        {e.ec && <><dt>EC</dt><dd className="mono">{e.ec}</dd></>}
        <dt>Direction</dt>
        <dd>{e.rev === true ? 'Reversible (also used in the other direction)' : e.rev === false ? 'Irreversible in cells' : 'Not stated in the notes'}</dd>
        {e.cofactors && <><dt>Cofactors</dt><dd><Rich s={e.cofactors} /></dd></>}
      </dl>
      {(subs.length > 0 || prods.length > 0) && (
        <section>
          <h3>Reaction</h3>
          <div className="rxn">
            <div className="rxn-side">{joinPlus(subs, onEdit)}</div>
            {prods.length > 0 && <div className="rxn-arrow" aria-label={e.rev ? 'reversible' : 'yields'}>{e.rev ? <Harpoons /> : '→'}</div>}
            <div className="rxn-side">{joinPlus(prods, onEdit)}</div>
          </div>
        </section>
      )}
      <section>
        <h3>What it does</h3>
        {e.text.map((t, i) => <p key={i}><Rich s={t} /></p>)}
      </section>
      {(e.reg || r) && (
        <section>
          <h3>Regulation</h3>
          {r && <RegFacts act={r.act} inh={r.inh} />}
          {e.reg && <p><Rich s={e.reg} /></p>}
          {r?.detail.map((t, i) => <p key={i}><Rich s={t} /></p>)}
        </section>
      )}
      <Places places={places} onGo={onGo} label="Drawn on" />
      <p className="slide">Lecture notes · <Rich s={e.slide} /></p>
    </>
  );
}

function RegFacts({ act, inh }: { act?: string; inh?: string }) {
  return (
    <div className="reg-facts">
      {act && <div className="reg-fact act"><span><RegIcon kind="act" /> Activated by</span> <Rich s={act} /></div>}
      {inh && <div className="reg-fact inh"><span><RegIcon kind="inh" /> Inhibited by</span> <Rich s={inh} /></div>}
    </div>
  );
}

/** ⇌ drawn, since the glyph is missing from the text fonts. */
function Harpoons() {
  return (
    <svg width="30" height="18" viewBox="0 0 30 18" aria-hidden="true">
      <path d="M2,6 H28 L21,1.5 M28,12 H2 L9,16.5" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
}

export default function Drawer({ selection, scene, scope, onClose, onSelect, onGo, onEdit, onCopyLink, onRoute }: Props) {
  const [copied, setCopied] = useState(false);
  useEffect(() => setCopied(false), [selection]);
  useEffect(() => {
    const h = (ev: KeyboardEvent) => { if (ev.key === 'Escape' && !document.querySelector('.modal-back:not(.hidden), .palette-back, .panel')) onClose(); };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [onClose]);

  const places = placesOf(selection, scene);
  const here = places.find((p) => scope === 'both' || p.exam === scope) ?? places[0];

  let body: React.JSX.Element;
  if (selection.kind === 'reg') {
    const r = regById[selection.id];
    body = (
      <>
        <Kicker exams={examsOf(places)} plate={here?.plate} what={r.kind === 'agent' ? 'INHIBITORS' : 'REGULATION'} />
        <h2><Rich s={r.title} /></h2>
        <RegFacts act={r.act} inh={r.inh} />
        {r.detail.map((t, i) => <p key={i}><Rich s={t} /></p>)}
        <p className="slide">Lecture notes · <Rich s={r.slide} /></p>
      </>
    );
  } else if (selection.kind === 'enz') {
    body = (
      <>
        <Kicker exams={examsOf(places)} plate={here?.plate} what="ENZYME" />
        <EnzymeView id={selection.id} places={places} onEdit={onEdit} onGo={onGo} />
      </>
    );
  } else if (selection.kind === 'card') {
    const c = cardById[selection.id];
    body = (
      <>
        <Kicker exams={examsOf(places)} plate={here?.plate} what="OVERVIEW" />
        <h2><Rich s={c.title} /></h2>
        {c.sub && <p className="sub"><Rich s={c.sub} /></p>}
        {c.table?.map((t, i) => <Table key={i} t={t} />)}
        {c.bullets.length > 0 && <ul>{c.bullets.map((b, i) => <li key={i}><Rich s={b} /></li>)}</ul>}
        {c.id === 'c_inhib' && (
          <section>
            <h3>No drawn target on this map</h3>
            {otherAgents.map((a) => <p key={a.name}><strong>{a.name}</strong> — <Rich s={a.mode} /></p>)}
          </section>
        )}
        {c.mols && <div className={`rxn-side wrap${c.mols.length > 1 ? ' multi' : ''}`}>{c.mols.map((m) => <Structure key={m} molId={m} onEdit={onEdit} />)}</div>}
        <p className="slide">Lecture notes · <Rich s={c.slide} /></p>
      </>
    );
  } else {
    const n = geometryOf(scene).nodeMap[selection.id];
    const mids = n.mols ?? (n.mol ? [n.mol] : []);
    const related = enzymes.filter((e) => mids.some((m) => e.subs?.includes(m) || e.prods?.includes(m)));
    const drawn = mids.length === 1 ? molPlaces(mids[0], scene) : [];
    body = (
      <>
        <Kicker exams={examsOf(drawn.length ? drawn : places)} plate={here?.plate} what="MOLECULE" />
        <h2><Rich s={mids.length === 1 ? molById[mids[0]].name : n.label ?? ''} /></h2>
        <div className={`rxn-side wrap${mids.length > 1 ? ' multi' : ''}`}>{mids.map((m) => <Structure key={m} molId={m} onEdit={onEdit} />)}</div>
        {mids.map((m) => molById[m].note && <p key={m}>{mids.length > 1 && <strong><Rich s={molById[m].name} />: </strong>}<Rich s={molById[m].note!} /></p>)}
        {related.length > 0 && (
          <section>
            <h3>Enzymes acting on it</h3>
            <div className="chips-row">
              {related.map((e) => (
                <button key={e.id} className="enz-link" onClick={() => onSelect({ kind: 'enz', id: e.id })}>
                  <MarkIcon cls={e.cls[0]} /> <span><Rich s={e.short} /></span>
                </button>
              ))}
            </div>
          </section>
        )}
        <Places places={drawn} onGo={onGo} label="Drawn on" />
        {mids.length === 1 && (
          <section>
            <h3>Trace a route</h3>
            <div className="chips-row">
              <button className="enz-link" onClick={() => onRoute(mids[0], 'to')}><RouteIcon /> <span>From here to…</span></button>
              <button className="enz-link" onClick={() => onRoute(mids[0], 'from')}><RouteIcon /> <span>To here from…</span></button>
            </div>
          </section>
        )}
      </>
    );
  }

  return (
    <aside className={`drawer ${here?.exam ?? 'mid'}`} aria-live="polite">
      <div className="drawer-tools">
        <button className={`icon-btn${copied ? ' done' : ''}`} onClick={() => onCopyLink().then((ok) => setCopied(ok))}
          aria-label={copied ? 'Link copied' : 'Copy a link to this'} title={copied ? 'Link copied' : 'Copy a link to this (opens here, at this view)'}>
          {copied ? <CheckIcon /> : <LinkIcon />}
        </button>
        <button className="icon-btn" onClick={onClose} aria-label="Close details"><CloseIcon /></button>
      </div>
      {body}
    </aside>
  );
}
