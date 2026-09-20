import { useEffect, useState } from 'react';
import { cardById } from './data/cards';
import { classById, enzById, enzymes } from './data/enzymes';
import { nodes } from './data/layout';
import { otherAgents, regById, regForEnzyme } from './data/regulation';
import { molById } from './data/molecules';
import type { Selection } from './Diagram';
import { loadStructures } from './structures';

interface Props {
  selection: NonNullable<Selection>;
  onClose: () => void;
  onSelect: (s: Selection) => void;
  onEdit: (title: string, smiles: string) => void;
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
        {m.name}
        <button className="link" onClick={() => onEdit(m.name, m.smiles!)}>Edit in Ketcher</button>
      </figcaption>
    </figure>
  );
}

function Chips({ ids }: { ids: string[] }) {
  return (
    <div className="chips-row">
      {ids.map((c) => (
        <span key={c} className="cls-chip" style={{ background: classById[c].color }}>{classById[c].label}</span>
      ))}
    </div>
  );
}

function joinPlus(ids: string[], onEdit: Props['onEdit']) {
  return ids.flatMap((m, i) => [i > 0 ? <span key={m + '+'} className="plus">+</span> : null, <Structure key={m} molId={m} onEdit={onEdit} />]);
}

function EnzymeView({ id, onEdit }: { id: string; onEdit: Props['onEdit'] }) {
  const e = enzById[id];
  const subs = (e.subs ?? []).filter((m) => molById[m]?.smiles);
  const prods = (e.prods ?? []).filter((m) => molById[m]?.smiles);
  return (
    <>
      <Chips ids={e.cls} />
      <h2>{e.name}</h2>
      <dl className="facts">
        {e.short !== (e.full ?? e.name) && <><dt>Short form</dt><dd>{e.short}</dd></>}
        {e.ec && <><dt>EC</dt><dd>{e.ec}</dd></>}
        <dt>Direction</dt>
        <dd>{e.rev === true ? 'Reversible (also used in gluconeogenesis / other direction)' : e.rev === false ? 'Irreversible in cells' : 'Not stated in the notes'}</dd>
        {e.cofactors && <><dt>Cofactors</dt><dd>{e.cofactors}</dd></>}
      </dl>
      {(subs.length > 0 || prods.length > 0) && (
        <section>
          <h3>Reaction</h3>
          <div className="rxn">
            <div className="rxn-side">{joinPlus(subs, onEdit)}</div>
            {prods.length > 0 && <div className="rxn-arrow">{e.rev ? '⇌' : '→'}</div>}
            <div className="rxn-side">{joinPlus(prods, onEdit)}</div>
          </div>
        </section>
      )}
      <section>
        <h3>What it does</h3>
        {e.text.map((t, i) => <p key={i}>{t}</p>)}
      </section>
      {(() => {
        const r = regForEnzyme(id)[0];
        return (e.reg || r) && (
          <section>
            <h3>Regulation</h3>
            {r && (
              <div className="reg-facts">
                {r.act && <div className="reg-line act"><span>⊕ Activated by</span> {r.act}</div>}
                {r.inh && <div className="reg-line inh"><span>⊖ Inhibited by</span> {r.inh}</div>}
              </div>
            )}
            {e.reg && <p>{e.reg}</p>}
            {r?.detail.map((t, i) => <p key={i}>{t}</p>)}
          </section>
        );
      })()}
      <p className="slide">Lecture notes · {e.slide}</p>
    </>
  );
}

export default function Drawer({ selection, onClose, onSelect, onEdit }: Props) {
  useEffect(() => {
    const h = (ev: KeyboardEvent) => { if (ev.key === 'Escape' && !document.querySelector('.modal-back:not(.hidden)')) onClose(); };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [onClose]);

  let body: React.JSX.Element;
  if (selection.kind === 'reg') {
    const r = regById[selection.id];
    body = (
      <>
        <div className="kicker">{r.kind === 'agent' ? 'Inhibitor' : 'Allosteric regulation'}</div>
        <h2>{r.title}</h2>
        <div className="reg-facts">
          {r.act && <div className="reg-line act"><span>⊕ Activated by</span> {r.act}</div>}
          {r.inh && <div className="reg-line inh"><span>⊖ Inhibited by</span> {r.inh}</div>}
        </div>
        {r.detail.map((t, i) => <p key={i}>{t}</p>)}
        <p className="slide">Lecture notes · {r.slide}</p>
      </>
    );
  } else if (selection.kind === 'enz') body = <EnzymeView id={selection.id} onEdit={onEdit} />;
  else if (selection.kind === 'card') {
    const c = cardById[selection.id];
    body = (
      <>
        <div className="kicker">Overview</div>
        <h2>{c.title}</h2>
        {c.sub && <p className="sub">{c.sub}</p>}
        <ul>{c.bullets.map((b, i) => <li key={i}>{b}</li>)}</ul>
        {c.id === 'c_inhib' && (
          <section>
            <h3>No drawn target on this map</h3>
            {otherAgents.map((a) => <p key={a.name}><strong>{a.name}</strong> — {a.mode}</p>)}
          </section>
        )}
        {c.mols && <div className={`rxn-side wrap${c.mols.length > 1 ? ' multi' : ''}`}>{c.mols.map((m) => <Structure key={m} molId={m} onEdit={onEdit} />)}</div>}
        <p className="slide">Lecture notes · {c.slide}</p>
      </>
    );
  } else {
    const n = nodes.find((x) => x.id === selection.id)!;
    const mids = n.mols ?? (n.mol ? [n.mol] : []);
    const related = enzymes.filter((e) => mids.some((m) => e.subs?.includes(m) || e.prods?.includes(m)));
    body = (
      <>
        <div className="kicker">Molecule</div>
        <h2>{mids.length === 1 ? molById[mids[0]].name : n.label}</h2>
        <div className={`rxn-side wrap${mids.length > 1 ? ' multi' : ''}`}>{mids.map((m) => <Structure key={m} molId={m} onEdit={onEdit} />)}</div>
        {mids.map((m) => molById[m].note && <p key={m}>{mids.length > 1 && <strong>{molById[m].name}: </strong>}{molById[m].note}</p>)}
        {related.length > 0 && (
          <section>
            <h3>Enzymes acting on it</h3>
            <div className="chips-row">
              {related.map((e) => (
                <button key={e.id} className="enz-link" style={{ borderColor: classById[e.cls[0]].color, color: classById[e.cls[0]].color }} onClick={() => onSelect({ kind: 'enz', id: e.id })}>
                  {e.short}
                </button>
              ))}
            </div>
          </section>
        )}
      </>
    );
  }

  return (
    <aside className="drawer" aria-live="polite">
      <button className="icon-btn close" onClick={onClose} aria-label="Close details">✕</button>
      {body}
    </aside>
  );
}
