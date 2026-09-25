import { lazy, Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Diagram, { type Selection, type View } from './Diagram';
import Drawer from './Drawer';
import { classById, enzById } from './data/enzymes';
import { desktopScene, phoneScene } from './data/scene';
import type { CoKey, EnzClass, Exam, Scene, Scope } from './data/types';
import { allKinds, keysFor, quizKeys, type QuizKind, type QuizState } from './quiz';
import { CloseIcon } from './shell/icons';
import { Key, LayersPanel, PlatesPanel } from './shell/Panels';
import QuizBar from './shell/QuizBar';
import Search from './shell/Search';
import TopBar, { type Panel } from './shell/TopBar';
import { cofactors } from './data/cofactors';
import { bestPlace, PHONE_QUERY, placesOf, regionView, viewAround } from './locate';
import { copyText, currentView, parseHash, toHash, type Link } from './links';
import { cardById } from './data/cards';
import { regById } from './data/regulation';
import { geometryOf, labelOf } from './map/geometry';
import { MarkIcon } from './map/glyphs';
import { Rich } from './rich';

// Ketcher (+ the Indigo engine) is ~29 MB, so it is only fetched when someone presses "Edit in Ketcher"
const KetcherModal = lazy(() => import('./KetcherModal'));

/** Portrait phones get their own, narrower layout of the shuttle diagrams. */

/** Per-viewer conveniences only, so a blocked or cleared store just falls back to defaults. */
const store = {
  get: (k: string) => { try { return localStorage.getItem(k); } catch { return null; } },
  set: (k: string, v: string) => { try { localStorage.setItem(k, v); } catch { /* ignore */ } },
};

const inScope = (x: { exam?: Exam }, s: Scope) => s === 'both' || (x.exam ?? 'mid') === s;

/** Where the camera starts for a scope: the top of glycolysis, or the first final plate. */
function startView(scene: Scene, scope: Scope, phone: boolean): View {
  if (scope === 'final') {
    const first = scene.regions.filter((r) => r.part === 'III' || r.part === 'IV').sort((a, b) => a.plate - b.plate)[0];
    // the top of the first plate at reading size (a whole plate is too tall to read at once)
    if (first) return phone ? regionView(first, true) : { x: first.x - 40, y: first.y - 20, w: 1800, h: 1100 };
  }
  // tall on phones, so the fit keeps the top edge near the top of the plate instead of centring on empty desk
  return phone ? { x: 850, y: -24, w: 600, h: 1160 } : { x: 560, y: 0, w: 1020, h: 1120 };
}

/** A linked selection that no longer exists (renamed id, typo) is ignored rather than crashing the drawer. */
function valid(sel: NonNullable<Selection>, scene: Scene): boolean {
  if (sel.kind === 'enz') return !!enzById[sel.id] && placesOf(sel, scene).length > 0;
  if (sel.kind === 'node') return !!geometryOf(scene).nodeMap[sel.id];
  if (sel.kind === 'card') return !!cardById[sel.id] && placesOf(sel, scene).length > 0;
  return !!regById[sel.id] && placesOf(sel, scene).length > 0;
}

/** Where a link points: its own view, else its plate, else the best place of its selection. */
function linkView(l: Link, scene: Scene, scope: Scope): View | null {
  if (l.view) return l.view;
  if (l.plate) { const r = scene.regions.find((x) => x.plate === l.plate); return r ? regionView(r) : null; }
  const p = l.sel && bestPlace(placesOf(l.sel, scene), scope);
  return p ? viewAround(p) : null;
}

/** A link into material the stored scope hides widens the scope, so the link never lands on an empty desk. */
function scopeFor(l: Link | null, scene: Scene, scope: Scope): Scope {
  if (!l || scope === 'both') return scope;
  const exams = l.sel ? placesOf(l.sel, scene).map((p) => p.exam)
    : l.plate ? scene.regions.filter((r) => r.plate === l.plate).map((r) => (r.part === 'III' || r.part === 'IV' ? 'final' : 'mid'))
      : [];
  return exams.length && !exams.includes(scope) ? 'both' : scope;
}

function titleOf(sel: NonNullable<Selection>, scene: Scene): string {
  if (sel.kind === 'enz') return enzById[sel.id].name;
  if (sel.kind === 'card') return cardById[sel.id].title;
  if (sel.kind === 'reg') return regById[sel.id].title;
  return labelOf(geometryOf(scene).nodeMap[sel.id]);
}

export default function App() {
  const [phone, setPhone] = useState(() => window.matchMedia(PHONE_QUERY).matches);
  useEffect(() => {
    const m = window.matchMedia(PHONE_QUERY);
    const on = () => setPhone(m.matches);
    m.addEventListener('change', on);
    return () => m.removeEventListener('change', on);
  }, []);
  const scene = phone ? phoneScene : desktopScene;

  // a deep link in the URL decides the first selection and camera
  const [link] = useState<Link | null>(() => {
    const l = parseHash(location.hash);
    return l && (!l.sel || valid(l.sel, scene)) ? l : null;
  });
  const [scope, setScope] = useState<Scope>(() => {
    const s = store.get('atlas-scope');
    return scopeFor(link, scene, s === 'mid' || s === 'final' || s === 'both' ? s : 'both');
  });
  const [dark, setDark] = useState(() => document.documentElement.dataset.theme === 'dark');
  useEffect(() => {
    document.documentElement.dataset.theme = dark ? 'dark' : 'light';
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', dark ? '#1c1916' : '#fcf9f3');
  }, [dark]);

  const [filter, setFilter] = useState<Set<EnzClass>>(new Set());
  const [co, setCo] = useState<Set<CoKey>>(new Set());
  const [showReg, setShowReg] = useState(false);
  const [selection, setSelection] = useState<Selection>(() => link?.sel ?? null);
  const [start] = useState(() => (link && linkView(link, scene, scope)) || startView(scene, scope, phone));
  const [focus, setFocus] = useState<{ view: View; n: number }>({ view: start, n: 0 });
  const [panel, setPanel] = useState<Panel>(null);
  const [searching, setSearching] = useState(false);
  const [keyOpen, setKeyOpen] = useState(() => store.get('atlas-key') === '1');
  const [chrome, setChrome] = useState(true);
  const [editing, setEditing] = useState<{ title: string; smiles: string } | null>(null);
  const [everEdited, setEverEdited] = useState(false);

  const go = useCallback((view: View) => setFocus((f) => ({ view, n: f.n + 1 })), []);

  // ── deep links ────────────────────────────────────────────────────
  // Opening the drawer from the bare map pushes one history entry; moving between selections replaces it, so Back
  // always closes the drawer rather than stepping through everything clicked. Closing pops that entry when this app
  // pushed it, and otherwise (a link opened directly) just clears the hash.
  const selRef = useRef<Selection>(selection);
  selRef.current = selection;
  const closeDrawer = useCallback(() => {
    if (!selRef.current) return;
    setSelection(null);
    if (history.state?.atlas === 'open') history.back();
    else if (location.hash) history.replaceState(null, '', location.pathname + location.search);
  }, []);
  /** Every selection goes through here (null = a click on the bare map, which closes the drawer). */
  const select = useCallback((sel: Selection) => {
    if (!sel) return closeDrawer();
    const url = toHash(sel);
    if (selRef.current) history.replaceState(history.state, '', url);
    else history.pushState({ atlas: 'open' }, '', url);
    setSelection(sel);
  }, [closeDrawer]);
  useEffect(() => {
    const onPop = () => {
      const l = parseHash(location.hash);
      const sel = l?.sel && valid(l.sel, scene) ? l.sel : null;
      setSelection(sel);
      const v = sel && l && linkView(l, scene, scope);
      if (v) go(v);
    };
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, [scene, scope, go]);
  useEffect(() => {
    document.title = selection ? `${titleOf(selection, scene)} · Metabolism Atlas` : 'Metabolism Atlas';
  }, [selection, scene]);
  const copyLink = () => copyText(location.origin + location.pathname + toHash(selection, currentView()));

  const changeScope = (s: Scope) => {
    setScope(s);
    store.set('atlas-scope', s);
    // follow the material: Final flies to the final wing, Midterm back to the carbohydrate map
    if (s !== 'both') go(startView(scene, s, phone));
  };

  // ── quiz ──────────────────────────────────────────────────────────
  const [quizOn, setQuizOn] = useState(false);
  const [kinds, setKinds] = useState<Set<QuizKind>>(new Set(allKinds));
  const [revealed, setRevealed] = useState<Set<string>>(new Set());
  const keys = useMemo(() => quizKeys(scene, scope), [scene, scope]);
  const inPlay = useMemo(() => keysFor(keys, kinds), [keys, kinds]);
  const quiz: QuizState = useMemo(() => ({ on: quizOn, kinds, revealed, pool: new Set(inPlay) }), [quizOn, kinds, revealed, inPlay]);
  const done = inPlay.filter((k) => revealed.has(k)).length;
  const reveal = useCallback((key: string) => setRevealed((r) => new Set(r).add(key)), []);
  // any combination, but never none: with nothing hidden there is nothing to quiz
  const toggleKind = (k: QuizKind) => setKinds((prev) => {
    const next = new Set(prev);
    if (next.has(k)) { if (next.size > 1) next.delete(k); } else next.add(k);
    return next;
  });
  const toggleQuiz = () => { setQuizOn((v) => !v); setRevealed(new Set()); closeDrawer(); };

  // ── highlight counts (within scope) ───────────────────────────────
  const counts = useMemo(() => {
    const m: Record<string, number> = {};
    const seen = new Set<string>();
    scene.edges.forEach((e) => {
      if (!e.enz || seen.has(e.enz) || !inScope(e, scope)) return;
      seen.add(e.enz);
      enzById[e.enz].cls.forEach((c) => { m[c] = (m[c] ?? 0) + 1; });
    });
    return m;
  }, [scene, scope]);
  const coCounts = useMemo(() => {
    const m: Record<string, number> = {};
    scene.edges.forEach((e) => { if (inScope(e, scope)) e.co?.forEach((c) => { m[c] = (m[c] ?? 0) + 1; }); });
    return m;
  }, [scene, scope]);
  const toggle = (c: EnzClass) => setFilter((f) => { const n = new Set(f); if (n.has(c)) n.delete(c); else n.add(c); return n; });
  const toggleCo = (c: CoKey) => setCo((f) => { const n = new Set(f); if (n.has(c)) n.delete(c); else n.add(c); return n; });
  const clearHighlights = () => { setFilter(new Set()); setCo(new Set()); };

  // ── keyboard: / or Ctrl-K search, H hides the chrome ──────────────
  // Capture phase: Ketcher binds global single-letter shortcuts and stops propagation, so a bubble-phase listener
  // would miss them. We never stop propagation ourselves, so Ketcher keeps working inside its modal.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null;
      if (t?.closest('.modal')) return;
      const typing = !!t?.closest('input, textarea, select, [contenteditable="true"]');
      if ((e.key === 'k' || e.key === 'K') && (e.metaKey || e.ctrlKey)) { e.preventDefault(); setSearching(true); return; }
      if (typing || e.metaKey || e.ctrlKey || e.altKey) return;
      if (e.key === '/') { e.preventDefault(); setSearching(true); }
      else if (e.key === 'h' || e.key === 'H') setChrome((v) => !v);
    };
    window.addEventListener('keydown', onKey, true);
    return () => window.removeEventListener('keydown', onKey, true);
  }, []);

  const pick = (sel: Selection, view: View) => {
    setSearching(false);
    setPanel(null);
    go(view);
    if (sel) select(sel);
  };

  const scopeNote = scope === 'both' ? 'all plates' : scope === 'final' ? 'final plates only' : 'midterm plates only';
  const highlights = filter.size + co.size;

  return (
    <div className={`app${chrome ? '' : ' bare'}`}>
      {chrome && (
        <TopBar scope={scope} onScope={changeScope} onSearch={() => setSearching(true)} panel={panel} onPanel={setPanel}
          quizOn={quizOn} onQuiz={toggleQuiz} dark={dark} onTheme={() => { setDark((d) => { store.set('atlas-theme', d ? 'light' : 'dark'); return !d; }); }}
          highlights={highlights} />
      )}
      {chrome && quizOn && (
        <QuizBar kinds={kinds} onKind={toggleKind} done={done} total={inPlay.length} scopeNote={scopeNote}
          onRevealAll={() => setRevealed(new Set(inPlay))} onReset={() => setRevealed(new Set())} />
      )}

      <main>
        <Diagram scene={scene} scope={scope} filter={filter} co={co} showReg={showReg} selection={selection} onSelect={select}
          focus={focus} start={start} quiz={quiz} onReveal={reveal} />

        {highlights > 0 && (
          <div className="hl-bar" role="status">
            <span className="hl-label">Highlighting</span>
            {[...filter].map((c) => (
              <button key={c} className="hl-chip" style={{ '--c': `var(--k-${c})` } as React.CSSProperties} onClick={() => toggle(c)} aria-label={`Stop highlighting ${classById[c].label}`}>
                <MarkIcon cls={c} /> {classById[c].label} <CloseIcon />
              </button>
            ))}
            {[...co].map((c) => (
              <button key={c} className="hl-chip co" onClick={() => toggleCo(c)} aria-label={`Stop highlighting ${c}`}>
                <span><Rich s={cofactors.find((x) => x.id === c)!.label} /></span> <CloseIcon />
              </button>
            ))}
            <button className="text-btn" onClick={clearHighlights}>Clear</button>
          </div>
        )}

        <Key open={keyOpen} onToggle={() => setKeyOpen((v) => { store.set('atlas-key', v ? '0' : '1'); return !v; })} showReg={showReg} />

        {panel === 'plates' && <PlatesPanel scene={scene} scope={scope} onGo={(v) => { go(v); if (phone) setPanel(null); }} onClose={() => setPanel(null)} />}
        {panel === 'layers' && (
          <LayersPanel counts={counts} coCounts={coCounts} filter={filter} onToggle={toggle} co={co} onToggleCo={toggleCo}
            showReg={showReg} onReg={setShowReg} onClear={clearHighlights} onClose={() => setPanel(null)} />
        )}

        {selection && (
          <Drawer selection={selection} scene={scene} scope={scope} onClose={closeDrawer} onSelect={select} onGo={go} onCopyLink={copyLink}
            onEdit={(title, smiles) => { setEverEdited(true); setEditing({ title, smiles }); }} />
        )}

        {!chrome && (
          <button className="chrome-back" onClick={() => setChrome(true)} title="Show the toolbar (H)">Show toolbar</button>
        )}
      </main>

      {searching && <Search scene={scene} scope={scope} onClose={() => setSearching(false)} onPick={pick} />}

      {/* once opened, the editor stays mounted (hidden) — see KetcherModal */}
      {everEdited && (
        <Suspense fallback={editing && <div className="modal-back"><div className="loading-card">Loading editor…</div></div>}>
          <KetcherModal target={editing} onClose={() => setEditing(null)} />
        </Suspense>
      )}
    </div>
  );
}
