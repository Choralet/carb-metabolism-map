import { lazy, Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Diagram, { type Selection, type View } from './Diagram';
import Drawer from './Drawer';
import { classById, enzById } from './data/enzymes';
import { onPlate } from './data/plate';
import { desktopScene, phoneScene } from './data/scene';
import { inExam, type CoKey, type EnzClass, type ExamTag, type Scene, type Scope } from './data/types';
import { allKinds, keyPlates, keysFor, loadQuiz, questionOf, quizKeys, saveQuiz, type Answer, type QuizKind, type QuizSave, type QuizState } from './quiz';
import QuizAsk from './shell/QuizAsk';
import type { Where } from './shell/QuizBar';
import { CloseIcon } from './shell/icons';
import { Key, LayersPanel, PlatesPanel } from './shell/Panels';
import QuizBar from './shell/QuizBar';
import RouteBar from './shell/RouteBar';
import { identityName, traceRoute } from './route';
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

const inScope = (x: { exam?: ExamTag }, s: Scope) => inExam(x.exam, s);

/**
 * Where the camera starts: on a desktop the whole cell, the big picture; on a phone the top of glycolysis at reading
 * size (tall, so the fit keeps the top edge near the top of the plate instead of centring on empty desk).
 */
function startView(scene: Scene, phone: boolean): View {
  const glc = geometryOf(scene).nodeMap.glc;
  if (phone) return { x: glc.x - 290, y: glc.y - 110, w: 600, h: 1160 };
  const b = geometryOf(scene).bounds.both;
  return { x: b.x - 40, y: b.y - 40, w: b.w + 80, h: b.h + 80 };
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

/** A link into material the stored exam switch fades widens it to Both, so the link never lands on faded ink. */
function scopeFor(l: Link | null, scene: Scene, scope: Scope): Scope {
  if (!l || scope === 'both') return scope;
  const exams: ExamTag[] = l.sel ? placesOf(l.sel, scene).map((p) => p.exam)
    : l.plate ? scene.regions.filter((r) => r.plate === l.plate).map((r) => (r.part === 'III' || r.part === 'IV' ? 'final' : 'mid'))
      : [];
  return exams.length && !exams.some((x) => inExam(x, scope)) ? 'both' : scope;
}

/** A drawn node for a quiz key: the node itself, an enzyme's first arrow, or a label's arrow. */
function firstNodeOf(key: string, scene: Scene): string {
  if (key.startsWith('tag:')) return scene.edges.find((e) => `tag:${e.id}` === key)?.from ?? '';
  if (geometryOf(scene).nodeMap[key]) return key;
  return scene.edges.find((e) => e.enz === key)?.from ?? scene.nodes.find((n) => n.enz === key)?.id ?? '';
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
  const [start] = useState(() => (link && linkView(link, scene, scope)) || startView(scene, phone));
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

  // ── route tracer ──────────────────────────────────────────────────
  const [routeEnds, setRouteEnds] = useState<{ from: string; to: string } | null>(null);
  const [routePick, setRoutePick] = useState<{ fixed: string; end: 'from' | 'to' } | null>(null);
  const traced = useMemo(() => (routeEnds ? traceRoute(scene, routeEnds.from, routeEnds.to) : null), [routeEnds, scene]);
  const routeHi = useMemo(() => (traced ? { edges: traced.edges, nodes: traced.nodes } : null), [traced]);
  /** Show a new route whole when it fits on screen, else start at its first step (the step list walks the rest). */
  const showRoute = (from: string, to: string) => {
    setRouteEnds({ from, to });
    const r = traceRoute(scene, from, to);
    if (!r) return;
    const { nodeMap, routed } = geometryOf(scene);
    const pts = [...r.nodes].map((id) => nodeMap[id]);
    const x0 = Math.min(...pts.map((p) => p.x)), x1 = Math.max(...pts.map((p) => p.x));
    const y0 = Math.min(...pts.map((p) => p.y)), y1 = Math.max(...pts.map((p) => p.y));
    if (x1 - x0 < 2600 && y1 - y0 < 2600) go({ x: x0 - 180, y: y0 - 120, w: x1 - x0 + 360, h: y1 - y0 + 240 });
    else go(viewAround(routed.get(r.steps[0].edge.id)!.mid, 1000, 640));
  };
  const startRoutePick = (mol: string, end: 'from' | 'to') => { closeDrawer(); setRoutePick({ fixed: mol, end }); };

  /** The exam switch only changes what is highlighted; the camera stays where it is. */
  const changeScope = (s: Scope) => {
    setScope(s);
    store.set('atlas-scope', s);
  };

  // ── quiz ──────────────────────────────────────────────────────────
  // Answers persist (progress survives a reload), and so does the deck of missed items, which a later right
  // answer empties again. Reset only clears the answers in play; the deck is kept.
  const [quizOn, setQuizOn] = useState(false);
  const [kinds, setKinds] = useState<Set<QuizKind>>(new Set(allKinds));
  const [where, setWhere] = useState<Where>({ kind: 'scope' });
  const [save, setSave] = useState<QuizSave>(loadQuiz);
  useEffect(() => saveQuiz(save), [save]);
  const [ask, setAsk] = useState<{ key: string; at: DOMRect } | null>(null);
  const keys = useMemo(() => quizKeys(scene, scope), [scene, scope]);
  const plates = useMemo(() => keyPlates(scene), [scene]);
  const missedSet = useMemo(() => new Set(save.missed), [save.missed]);
  const inPlay = useMemo(() => keysFor(keys, kinds).filter((k) =>
    where.kind === 'plate' ? plates.get(k)?.has(where.plate) : where.kind === 'missed' ? missedSet.has(k) : true), [keys, kinds, where, plates, missedSet]);
  const quiz: QuizState = useMemo(() => ({ on: quizOn, kinds, pool: new Set(inPlay), answers: save.answers }), [quizOn, kinds, inPlay, save.answers]);
  const quizCounts = useMemo(() => {
    const c = { ok: 0, miss: 0, seen: 0, total: inPlay.length };
    inPlay.forEach((k) => { const a = save.answers[k]; if (a) c[a]++; });
    return c;
  }, [inPlay, save.answers]);
  const missedInScope = useMemo(() => keysFor(keys, kinds).filter((k) => missedSet.has(k)).length, [keys, kinds, missedSet]);
  const reveal = useCallback((key: string, at: DOMRect) => setAsk({ key, at }), []);
  const answer = (key: string, a: Answer) => {
    setSave((s) => ({
      answers: { ...s.answers, [key]: a },
      missed: a === 'miss' ? [...new Set([...s.missed, key])] : a === 'ok' ? s.missed.filter((k) => k !== key) : s.missed,
    }));
    setAsk(null);
  };
  const setAnswers = (keysToSet: string[], a: Answer | null) => setSave((s) => {
    const answers = { ...s.answers };
    keysToSet.forEach((k) => { if (a) { if (!answers[k]) answers[k] = a; } else delete answers[k]; });
    return { ...s, answers };
  });
  /** "This plate" takes the plate in the middle of the screen at the moment it is chosen. */
  const chooseWhere = (w: 'scope' | 'plate' | 'missed') => {
    if (w !== 'plate') { setWhere({ kind: w }); return; }
    const v = currentView();
    const cx = v ? v.x + v.w / 2 : 0, cy = v ? v.y + v.h / 2 : 0;
    const r = scene.regions.find((x) => onPlate(x, cx, cy))
      ?? [...scene.regions].sort((a, b) => Math.hypot(a.x + a.w / 2 - cx, a.y + a.h / 2 - cy) - Math.hypot(b.x + b.w / 2 - cx, b.y + b.h / 2 - cy))[0];
    if (r) setWhere({ kind: 'plate', plate: r.id, title: r.title, no: r.plate });
  };
  // any combination, but never none: with nothing hidden there is nothing to quiz
  const toggleKind = (k: QuizKind) => setKinds((prev) => {
    const next = new Set(prev);
    if (next.has(k)) { if (next.size > 1) next.delete(k); } else next.add(k);
    return next;
  });
  const toggleQuiz = () => { setQuizOn((v) => !v); setAsk(null); closeDrawer(); setRouteEnds(null); };

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

  const scopeNote = scope === 'both' ? 'whole map' : scope === 'final' ? 'final-exam material' : 'midterm material';
  const highlights = filter.size + co.size;

  return (
    <div className={`app${chrome ? '' : ' bare'}`}>
      {chrome && (
        <TopBar scope={scope} onScope={changeScope} onSearch={() => setSearching(true)} panel={panel} onPanel={setPanel}
          quizOn={quizOn} onQuiz={toggleQuiz} dark={dark} onTheme={() => { setDark((d) => { store.set('atlas-theme', d ? 'light' : 'dark'); return !d; }); }}
          highlights={highlights} />
      )}
      {chrome && quizOn && (
        <QuizBar kinds={kinds} onKind={toggleKind} where={where} onWhere={chooseWhere} counts={quizCounts} missedDeck={missedInScope} scopeNote={scopeNote}
          onRevealAll={() => setAnswers(inPlay, 'seen')} onReset={() => setAnswers(inPlay, null)} />
      )}

      <main>
        <Diagram scene={scene} scope={scope} filter={filter} co={co} showReg={showReg} selection={selection} onSelect={select}
          focus={focus} start={start} quiz={quiz} onReveal={reveal} route={routeHi} />

        {routeEnds && (
          <RouteBar scene={scene} from={routeEnds.from} to={routeEnds.to} route={traced} onGo={go}
            onSwap={() => showRoute(routeEnds.to, routeEnds.from)} onClear={() => setRouteEnds(null)} />
        )}
        {!routeEnds && highlights > 0 && (
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

        {panel === 'plates' && <PlatesPanel scene={scene} scope={scope} onGo={(v) => { go(v); if (phone) setPanel(null); }} onPick={pick} onClose={() => setPanel(null)} />}
        {panel === 'layers' && (
          <LayersPanel counts={counts} coCounts={coCounts} filter={filter} onToggle={toggle} co={co} onToggleCo={toggleCo}
            showReg={showReg} onReg={setShowReg} onClear={clearHighlights} onClose={() => setPanel(null)} />
        )}

        {selection && (
          <Drawer selection={selection} scene={scene} scope={scope} onClose={closeDrawer} onSelect={select} onGo={go} onCopyLink={copyLink}
            onEdit={(title, smiles) => { setEverEdited(true); setEditing({ title, smiles }); }} onRoute={startRoutePick} />
        )}

        {!chrome && (
          <button className="chrome-back" onClick={() => setChrome(true)} title="Show the toolbar (H)">Show toolbar</button>
        )}
      </main>

      {searching && <Search scene={scene} scope={scope} onClose={() => setSearching(false)} onPick={pick} />}
      {ask && quizOn && (
        <QuizAsk key={ask.key} q={questionOf(ask.key, scene)} plate={geometryOf(scene).plateOf.get(firstNodeOf(ask.key, scene))?.plate} at={ask.at} phone={phone}
          onAnswer={(a) => answer(ask.key, a)} onClose={() => setAsk(null)} />
      )}
      {routePick && (
        <Search scene={scene} scope={scope} onClose={() => setRoutePick(null)} onPick={pick}
          pickMolecule={{
            prompt: routePick.end === 'to' ? `Route from ${identityName(routePick.fixed, scene)} to…` : `Route to ${identityName(routePick.fixed, scene)}, starting from…`,
            onPick: (m) => { setRoutePick(null); if (routePick.end === 'to') showRoute(routePick.fixed, m); else showRoute(m, routePick.fixed); },
          }} />
      )}

      {/* once opened, the editor stays mounted (hidden) — see KetcherModal */}
      {everEdited && (
        <Suspense fallback={editing && <div className="modal-back"><div className="loading-card">Loading editor…</div></div>}>
          <KetcherModal target={editing} onClose={() => setEditing(null)} />
        </Suspense>
      )}
    </div>
  );
}
