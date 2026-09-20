import { lazy, Suspense, useCallback, useEffect, useMemo, useState } from 'react';
import Diagram, { type Selection, type View } from './Diagram';
import Drawer from './Drawer';
import { classes, enzymes } from './data/enzymes';
import { cofactors } from './data/cofactors';
import { desktopScene, edges, phoneScene } from './data/layout';
import { allKinds, keysFor, type QuizKind, type QuizState } from './quiz';
import type { CoKey, EnzClass } from './data/types';

// Ketcher (+ the Indigo engine) is ~29 MB, so it is only fetched when someone presses "Edit in Ketcher"
const KetcherModal = lazy(() => import('./KetcherModal'));

const start: View = { x: 560, y: 0, w: 1020, h: 1120 };

const kindChips: { id: QuizKind; label: string; hint: string }[] = [
  { id: 'enz', label: 'Enzymes', hint: 'Hide every enzyme name' },
  { id: 'met', label: 'Metabolites', hint: 'Hide every metabolite name (substrates and products)' },
  { id: 'tag', label: 'Cofactors & products', hint: 'Hide the labels on the arrows, such as ATP → ADP or − H₂O' },
];

/** Portrait phones get their own, narrower layout of the shuttle diagrams. */
const phoneQuery = '(max-width: 720px)';

export default function App() {
  const [phone, setPhone] = useState(() => window.matchMedia(phoneQuery).matches);
  useEffect(() => {
    const m = window.matchMedia(phoneQuery);
    const on = () => setPhone(m.matches);
    m.addEventListener('change', on);
    return () => m.removeEventListener('change', on);
  }, []);
  const scene = phone ? phoneScene : desktopScene;
  const [filter, setFilter] = useState<Set<EnzClass>>(new Set());
  const [selection, setSelection] = useState<Selection>(null);
  const [focus, setFocus] = useState<{ view: View; n: number }>({ view: start, n: 0 });
  const [editing, setEditing] = useState<{ title: string; smiles: string } | null>(null);
  const [everEdited, setEverEdited] = useState(false);
  const [quiz, setQuiz] = useState<QuizState>({ on: false, kinds: new Set(allKinds), revealed: new Set() });
  const [co, setCo] = useState<Set<CoKey>>(new Set());
  const [showReg, setShowReg] = useState(false);
  // per-viewer convenience only, so a blocked/cleared store just falls back to open
  const [barOpen, setBarOpen] = useState(() => { try { return localStorage.getItem('carbmap-bar') !== '0'; } catch { return true; } });
  useEffect(() => { try { localStorage.setItem('carbmap-bar', barOpen ? '1' : '0'); } catch { /* ignore */ } }, [barOpen]);

  // H toggles the toolbar. Capture phase: Ketcher binds global single-letter shortcuts and
  // calls stopImmediatePropagation, so a bubble-phase listener would never see the key.
  // We never stop propagation ourselves, so Ketcher keeps working inside its modal.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'h' && e.key !== 'H') return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const t = e.target as HTMLElement | null;
      // the Ketcher editor owns its keys while it is open
      if (t?.closest('.modal')) return;
      if (t?.closest('input, textarea, [contenteditable="true"]')) return;
      setBarOpen((v) => !v);
    };
    window.addEventListener('keydown', onKey, true);
    return () => window.removeEventListener('keydown', onKey, true);
  }, []);

  const toggle = (c: EnzClass) => setFilter((f) => { const n = new Set(f); n.has(c) ? n.delete(c) : n.add(c); return n; });
  const toggleCo = (c: CoKey) => setCo((f) => { const n = new Set(f); n.has(c) ? n.delete(c) : n.add(c); return n; });

  const counts = useMemo(() => {
    const m: Record<string, number> = {};
    const seen = new Set<string>();
    edges.forEach((e) => { if (e.enz && !seen.has(e.enz)) { seen.add(e.enz); enzymes.find((z) => z.id === e.enz)!.cls.forEach((c) => { m[c] = (m[c] ?? 0) + 1; }); } });
    return m;
  }, []);

  const coCounts = useMemo(() => {
    const m: Record<string, number> = {};
    edges.forEach((e) => e.co?.forEach((c) => { m[c] = (m[c] ?? 0) + 1; }));
    return m;
  }, []);

  const inPlay = useMemo(() => keysFor(quiz.kinds), [quiz.kinds]);
  const done = inPlay.filter((k) => quiz.revealed.has(k)).length;

  const reveal = useCallback((key: string) => setQuiz((q) => ({ ...q, revealed: new Set(q.revealed).add(key) })), []);
  // any combination, but never none: with nothing hidden there is nothing to quiz
  const toggleKind = (k: QuizKind) => setQuiz((q) => {
    const kinds = new Set(q.kinds);
    if (kinds.has(k)) { if (kinds.size > 1) kinds.delete(k); } else kinds.add(k);
    return { ...q, kinds };
  });
  const startQuiz = (on: boolean) => { setQuiz((q) => ({ ...q, on, revealed: new Set() })); setSelection(null); };

  return (
    <div className="app">
      <header className={barOpen ? '' : 'slim'}>
        <div className="title">
          <h1>Carbohydrate metabolism map</h1>
          {barOpen && <p>Click any enzyme, molecule or <span className="i-inline">i</span> card for details. Scroll to zoom, drag to pan.</p>}
          <button className={`reg-toggle${showReg ? ' on' : ''}`} onClick={() => setShowReg((v) => !v)} aria-pressed={showReg}>
            Regulation {showReg ? 'on' : 'off'}
          </button>
          <button className={`quiz-toggle${quiz.on ? ' on' : ''}`} onClick={() => startQuiz(!quiz.on)} aria-pressed={quiz.on}>
            {quiz.on ? 'Exit quiz mode' : 'Quiz mode'}
          </button>
          <button className="bar-toggle" onClick={() => setBarOpen((v) => !v)} aria-expanded={barOpen}
            title={`${barOpen ? 'Hide' : 'Show'} the toolbar (H)`} aria-label={`${barOpen ? 'Hide' : 'Show'} the toolbar`}>
            {barOpen ? '⌃ Hide toolbar' : '⌄ Show toolbar'}
          </button>
        </div>

        {barOpen && (quiz.on ? (
          <div className="quizbar" role="group" aria-label="Quiz controls">
            <span className="label">Hide</span>
            {kindChips.map((k) => (
              <button key={k.id} className={`chip quiz${quiz.kinds.has(k.id) ? ' on' : ''}`} onClick={() => toggleKind(k.id)} title={k.hint} aria-pressed={quiz.kinds.has(k.id)}>
                {k.label}
              </button>
            ))}
            <span className="progress" aria-live="polite">
              <b>{done}</b> of <b>{inPlay.length}</b> revealed
              <span className="bar"><i style={{ width: `${inPlay.length ? (done / inPlay.length) * 100 : 0}%` }} /></span>
            </span>
            <button className="ghost" onClick={() => setQuiz((q) => ({ ...q, revealed: new Set(inPlay) }))}>Reveal all</button>
            <button className="ghost" onClick={() => setQuiz((q) => ({ ...q, revealed: new Set() }))}>Reset</button>
            <span className="hint">Click a <b>?</b> to reveal it; click again for details.</span>
          </div>
        ) : (
          <div className="filter" role="group" aria-label="Filter by enzyme type">
            <span className="label">Enzyme type</span>
            {classes.map((c) => (
              <button key={c.id} className={`chip${filter.has(c.id) ? ' on' : ''}`} style={{ '--c': c.color } as React.CSSProperties}
                onClick={() => toggle(c.id)} title={c.hint} aria-pressed={filter.has(c.id)}>
                <i /> {c.label} <b>{counts[c.id] ?? 0}</b>
              </button>
            ))}
            <span className="sep" />
            <span className="label">Cofactor</span>
            {cofactors.map((c) => (
              <button key={c.id} className={`chip co${co.has(c.id) ? ' on' : ''}`} onClick={() => toggleCo(c.id)} title={c.hint} aria-pressed={co.has(c.id)}>
                {c.label} <b>{coCounts[c.id] ?? 0}</b>
              </button>
            ))}
            {(filter.size > 0 || co.size > 0) && <button className="reset" onClick={() => { setFilter(new Set()); setCo(new Set()); }}>Clear</button>}
          </div>
        ))}

        {barOpen && (
          <nav className="jumps" aria-label="Jump to section">
            <span className="label">Go to</span>
            {scene.jumps.map((j) => (
              <button key={j.id} onClick={() => setFocus((f) => ({ view: j, n: f.n + 1 }))}>{j.label}</button>
            ))}
          </nav>
        )}
      </header>

      <main>
        <Diagram scene={scene} filter={filter} co={co} showReg={showReg} selection={selection} onSelect={setSelection} focus={focus} quiz={quiz} onReveal={reveal} />

        <div className="legend" aria-label="Legend">
          <div><svg width="46" height="12"><path d="M2,6 H38" stroke="#475569" strokeWidth="4.5" /><path d="M36,1 L45,6 L36,11z" fill="#475569" /></svg> irreversible</div>
          <div><svg width="46" height="12"><path d="M9,6 H37" stroke="#475569" strokeWidth="2.6" /><path d="M10,1 L1,6 L10,11z M36,1 L45,6 L36,11z" fill="#475569" /></svg> reversible</div>
          <div><svg width="46" height="12"><path d="M2,6 H38" stroke="#475569" strokeWidth="2.6" strokeDasharray="8 5" /><path d="M36,1 L45,6 L36,11z" fill="#475569" /></svg> gluconeogenic bypass</div>
          <div className="pill-key">enzyme colour = type</div>
          {showReg && (
            <>
              <div><svg width="46" height="12"><path d="M2,6 H36" stroke="#dc2626" strokeWidth="2" strokeDasharray="4 3" /><path d="M38,1 V11" stroke="#dc2626" strokeWidth="3" /></svg> inhibits</div>
              <div><svg width="46" height="12"><path d="M2,6 H34" stroke="#16a34a" strokeWidth="2" strokeDasharray="4 3" /><circle cx="38" cy="6" r="4" fill="#16a34a" /></svg> activates</div>
            </>
          )}
        </div>

        {selection && <Drawer selection={selection} onClose={() => setSelection(null)} onSelect={setSelection} onEdit={(title, smiles) => { setEverEdited(true); setEditing({ title, smiles }); }} />}
      </main>

      {/* once opened, the editor stays mounted (hidden) — see KetcherModal */}
      {everEdited && (
        <Suspense fallback={editing && <div className="modal-back"><div className="loading-card">Loading editor…</div></div>}>
          <KetcherModal target={editing} onClose={() => setEditing(null)} />
        </Suspense>
      )}
    </div>
  );
}
