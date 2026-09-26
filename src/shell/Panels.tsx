import { useEffect, useRef } from 'react';
import { cardById } from '../data/cards';
import { classes } from '../data/enzymes';
import { cofactors } from '../data/cofactors';
import { inExam, type CoKey, type EnzClass, type Part, type Region, type Scene, type Scope } from '../data/types';
import type { Selection, View } from '../Diagram';
import { bestPlace, placesOf, regionView, viewAround } from '../locate';
import { InfoGlyph, markPath, MarkIcon, RegIcon } from '../map/glyphs';
import { Rich } from '../rich';
import { CloseIcon } from './icons';

export const PART_TITLE: Record<Part, string> = {
  I: 'Glycolysis, gluconeogenesis, PPP & glycogen',
  II: 'Citric acid cycle & oxidative phosphorylation',
  III: 'Lipid metabolism',
  IV: 'Metabolism of N-containing compounds',
};
const isFinal = (p: Part) => p === 'III' || p === 'IV';

/** Closes on Escape or a click outside (but not on the button that opened it). */
function usePanelDismiss(onClose: () => void, ref: React.RefObject<HTMLElement | null>) {
  useEffect(() => {
    const key = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    const down = (e: PointerEvent) => {
      const t = e.target as HTMLElement;
      if (ref.current && !ref.current.contains(t) && !t.closest('[data-panel-toggle]')) onClose();
    };
    window.addEventListener('keydown', key);
    window.addEventListener('pointerdown', down);
    return () => { window.removeEventListener('keydown', key); window.removeEventListener('pointerdown', down); };
  }, [onClose, ref]);
}

interface PlatesProps { scene: Scene; scope: Scope; onGo: (v: View) => void; onPick: (s: Selection, v: View) => void; onClose: () => void }

export function PlatesPanel({ scene, scope, onGo, onPick, onClose }: PlatesProps) {
  const ref = useRef<HTMLDivElement>(null);
  usePanelDismiss(onClose, ref);
  const parts = (['I', 'II', 'III', 'IV'] as Part[]).filter((p) => scene.regions.some((r) => r.part === p));
  const byPart = (p: Part) => scene.regions.filter((r) => r.part === p).sort((a, b) => a.plate - b.plate);
  const views = (r: Region) => scene.jumps.filter((j) => j.plate === r.id);
  // study tables, each listed once (a table can be pinned on more than one plate), in plate order
  const tables = [...new Set(scene.nodes.filter((n) => n.card && cardById[n.card]?.table).map((n) => n.card!))]
    .map((id) => ({ id, card: cardById[id], place: bestPlace(placesOf({ kind: 'card', id }, scene), scope) }))
    .filter((t) => t.place && inExam(t.place.exam, scope))
    .sort((a, b) => (a.place.plate?.plate ?? 0) - (b.place.plate?.plate ?? 0));
  return (
    <div className="panel plates-panel" ref={ref} role="dialog" aria-label="Plates">
      <div className="panel-head"><h2>Plates</h2><button className="icon-btn" onClick={onClose} aria-label="Close"><CloseIcon /></button></div>
      <div className="panel-body">
        {parts.map((p) => {
          const dim = scope !== 'both' && (scope === 'final') !== isFinal(p);
          return (
            <section key={p} className={`toc-part ${isFinal(p) ? 'fin' : 'mid'}${dim ? ' dim' : ''}`}>
              <h3><span className="toc-tag">{isFinal(p) ? 'FINAL' : 'MIDTERM'}</span> Part {p} · {PART_TITLE[p]}</h3>
              <ol>
                {byPart(p).map((r) => (
                  <li key={r.id}>
                    <button className="toc-plate" onClick={() => onGo(regionView(r))}>
                      <span className="toc-no">{r.plate}</span>
                      <span className="toc-t"><Rich s={r.title} />{r.sub && <em> — <Rich s={r.sub} /></em>}</span>
                    </button>
                    {views(r).length > 0 && (
                      <div className="toc-views">
                        {views(r).map((j) => <button key={j.id} onClick={() => onGo(j)}>{j.label}</button>)}
                      </div>
                    )}
                  </li>
                ))}
              </ol>
            </section>
          );
        })}
        {tables.length > 0 && (
          <section className="toc-part tables">
            <h3>Study tables</h3>
            <ol>
              {tables.map((t) => (
                <li key={t.id}>
                  <button className="toc-plate" onClick={() => onPick({ kind: 'card', id: t.id }, viewAround(t.place))}>
                    <span className="toc-no"><svg width="18" height="18" viewBox="-9 -9 18 18" aria-hidden="true"><InfoGlyph x={0} y={0} table /></svg></span>
                    <span className="toc-t"><Rich s={t.card.title} /><em> — Plate {t.place.plate?.plate}</em></span>
                  </button>
                </li>
              ))}
            </ol>
          </section>
        )}
      </div>
    </div>
  );
}

interface LayersProps {
  counts: Record<string, number>;
  coCounts: Record<string, number>;
  filter: Set<EnzClass>; onToggle: (c: EnzClass) => void;
  co: Set<CoKey>; onToggleCo: (c: CoKey) => void;
  showReg: boolean; onReg: (v: boolean) => void;
  onClear: () => void; onClose: () => void;
}

export function LayersPanel({ counts, coCounts, filter, onToggle, co, onToggleCo, showReg, onReg, onClear, onClose }: LayersProps) {
  const ref = useRef<HTMLDivElement>(null);
  usePanelDismiss(onClose, ref);
  return (
    <div className="panel layers-panel" ref={ref} role="dialog" aria-label="Layers and highlights">
      <div className="panel-head"><h2>Layers</h2><button className="icon-btn" onClick={onClose} aria-label="Close"><CloseIcon /></button></div>
      <div className="panel-body">
        <label className="switch-row">
          <span><b>Regulation</b><small>Activators and inhibitors next to the enzymes they act on</small></span>
          <input type="checkbox" role="switch" checked={showReg} onChange={(e) => onReg(e.target.checked)} />
          <i aria-hidden="true" />
        </label>
        <h3>Highlight enzyme type</h3>
        <div className="chip-grid">
          {classes.map((c) => (
            <button key={c.id} className={`fchip${filter.has(c.id) ? ' on' : ''}`} style={{ '--c': `var(--k-${c.id})` } as React.CSSProperties}
              onClick={() => onToggle(c.id)} title={c.hint} aria-pressed={filter.has(c.id)}>
              <MarkIcon cls={c.id} /> <span>{c.label}</span> <b>{counts[c.id] ?? 0}</b>
            </button>
          ))}
        </div>
        <h3>Highlight cofactor</h3>
        <div className="chip-row">
          {cofactors.filter((c) => (coCounts[c.id] ?? 0) > 0 || co.has(c.id)).map((c) => (
            <button key={c.id} className={`fchip co${co.has(c.id) ? ' on' : ''}`} onClick={() => onToggleCo(c.id)} title={c.hint} aria-pressed={co.has(c.id)}>
              <span><Rich s={c.label} /></span> <b>{coCounts[c.id] ?? 0}</b>
            </button>
          ))}
        </div>
        {(filter.size > 0 || co.size > 0) && <button className="text-btn" onClick={onClear}>Clear highlights</button>}
      </div>
    </div>
  );
}

/** The key to the map's drawing conventions. */
export function Key({ open, onToggle, showReg }: { open: boolean; onToggle: () => void; showReg: boolean }) {
  return (
    <div className={`key${open ? ' open' : ''}`}>
      <button className="key-toggle" onClick={onToggle} aria-expanded={open}>Key</button>
      {open && (
        <div className="key-body">
          <div className="key-row">
            <svg width="46" height="14" aria-hidden="true"><path className="k-ink" d="M2,7 H36" strokeWidth="2.7" /><path className="k-inkf" d="M34,2.5 L45,7 L34,11.5 L37,7z" /></svg>
            <span>irreversible</span>
          </div>
          <div className="key-row">
            <svg width="46" height="14" aria-hidden="true"><path className="k-ink" d="M2,4 H44 L35,-1 M44,10 H2 L11,15" strokeWidth="1.6" fill="none" transform="translate(0,1)" /></svg>
            <span>reversible</span>
          </div>
          <div className="key-row">
            <svg width="46" height="14" aria-hidden="true"><path className="k-ink" d="M2,7 H36" strokeWidth="1.8" strokeDasharray="7 5" /><path className="k-inkf" d="M34,2.5 L45,7 L34,11.5 L37,7z" /></svg>
            <span>gluconeogenic bypass</span>
          </div>
          <div className="key-row">
            <svg width="46" height="22" aria-hidden="true"><path className="k-soft" d="M30,2 Q4,11 30,20" strokeWidth="1.3" fill="none" /><path className="k-softf" d="M26,17 L33,21 L25,22z" /><path className="k-ink" d="M40,0 V22" strokeWidth="1.7" /></svg>
            <span>cofactor in / out</span>
          </div>
          <div className="key-row">
            <span className="k-xref">▸ PLATE n</span>
            <span>same molecule on another plate</span>
          </div>
          <div className="key-row">
            <svg width="46" height="14" aria-hidden="true"><path className="k-dot" d="M2,7 H44" /></svg>
            <span>same molecule, drawn twice</span>
          </div>
          <div className="key-row">
            <svg width="46" height="14" aria-hidden="true"><rect className="k-frame" x="2" y="1" width="42" height="12" rx="1.5" /></svg>
            <span>another organ, or a close-up</span>
          </div>
          <div className="key-types">
            {(['kinase', 'isomerase', 'dehydrogenase', 'lyase', 'hydrolase', 'transferase', 'ligase', 'other'] as EnzClass[]).map((c) => (
              <span key={c} className="key-type"><svg width="12" height="12" viewBox="-6 -6 12 12" aria-hidden="true"><path className={`mk mk-${c}`} d={markPath(c)} /></svg>{shortClass[c]}</span>
            ))}
          </div>
          <p className="key-note">Blue names are enzymes; the mark before each one shows its type.</p>
          {showReg && (
            <div className="key-reg">
              <span><RegIcon kind="act" /> activates</span>
              <span><RegIcon kind="inh" /> inhibits</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

const shortClass: Record<EnzClass, string> = {
  kinase: 'kinase', isomerase: 'isomerase', dehydrogenase: 'dehydrogenase', lyase: 'lyase',
  hydrolase: 'hydrolase', transferase: 'transferase', ligase: 'ligase', other: 'other',
};
