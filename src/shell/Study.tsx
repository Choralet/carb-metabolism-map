import { useEffect, useRef, useState } from 'react';
import { enzById } from '../data/enzymes';
import { tours, type Tour, type TourStep } from '../data/tours';
import type { Part, Scene } from '../data/types';
import type { Selection, View } from '../Diagram';
import { geometryOf, labelOf, nodeBox } from '../map/geometry';
import { Rich } from '../rich';
import { CheckIcon, CloseIcon } from './icons';
import { PART_TITLE, usePanelDismiss } from './Panels';

/** The arrows lit so far in a chapter (every step up to and including `upTo`) and the molecules they touch. */
export function tourTrail(tour: Tour, upTo: number, scene: Scene): { edges: Set<string>; nodes: Set<string> } {
  const edges = new Set<string>(), nodes = new Set<string>();
  const byId = new Map(scene.edges.map((e) => [e.id, e]));
  tour.steps.slice(0, upTo + 1).forEach((s) => {
    for (const id of [s.edge, ...(s.also ?? [])]) {
      const e = id ? byId.get(id) : undefined;
      if (e) { edges.add(e.id); nodes.add(e.from); nodes.add(e.to); if (e.feed) nodes.add(e.feed); if (e.out) nodes.add(e.out); }
    }
    if (s.node) nodes.add(s.node);
  });
  return { edges, nodes };
}

/** Parts of the screen covered by the study card and the slide window, as fractions of the map's width and height. */
export interface Reserve { l: number; r: number; t: number; b: number }

/**
 * What the study card and slide window cover right now, measured from the page. The slide window is avoided on
 * whichever side costs the least room (a window in a top corner reserves the top, a tall one at the left the left).
 */
export function measureReserve(phone: boolean): Reserve {
  const main = document.querySelector('main')?.getBoundingClientRect();
  const res: Reserve = { l: 0, r: 0, t: 0, b: phone ? 0.42 : 0.3 };
  if (!main) return res;
  const bar = document.querySelector('.study-bar')?.getBoundingClientRect();
  if (bar) res.b = Math.min(0.6, (main.bottom - bar.top + 8) / main.height);
  const sv = document.querySelector('.slide-viewer')?.getBoundingClientRect();
  if (sv) {
    const opts = {
      l: (sv.right - main.left + 8) / main.width, r: (main.right - sv.left + 8) / main.width,
      t: (sv.bottom - main.top + 8) / main.height, b: (main.bottom - sv.top + 8) / main.height,
    };
    const side = (Object.keys(opts) as (keyof Reserve)[]).sort((a, b) => opts[a] - opts[b])[0];
    res[side] = Math.max(res[side], Math.min(0.5, opts[side]));
  }
  if (res.t + res.b > 0.8) res.t = 0.8 - res.b;
  return res;
}

/**
 * Where the camera goes for a step: the arrow with both its molecules, at reading size, placed in the part of the
 * screen the study card and slide window leave free. Phones are capped at ~620 map units across, the widest view at
 * which the reaction labels (cofactors) are still drawn on a 390 px screen.
 */
export function stepView(step: TourStep, scene: Scene, phone: boolean, res: Reserve): View {
  const { nodeMap, routed } = geometryOf(scene);
  const pts: { x: number; y: number }[] = [];
  const boxAt = (id: string) => { const b = nodeBox(nodeMap[id]); pts.push({ x: b.c.x - b.hw, y: b.c.y - b.hh }, { x: b.c.x + b.hw, y: b.c.y + b.hh }); };
  let focus: { x: number; y: number };
  if (step.edge) {
    const e = scene.edges.find((x) => x.id === step.edge)!;
    const r = routed.get(e.id)!;
    pts.push(...r.pts);
    boxAt(e.from); boxAt(e.to);
    // a long arrow that does not fit: show its enzyme label, or for a bare summary arrow, where it arrives
    focus = e.enz && !e.noPill ? r.mid : nodeMap[step.back ? e.from : e.to];
    for (const id of step.also ?? []) { const a = scene.edges.find((x) => x.id === id); if (a) { boxAt(a.from); boxAt(a.to); } }
  } else {
    boxAt(step.node!);
    focus = nodeMap[step.node!];
  }
  const x0 = Math.min(...pts.map((p) => p.x)) - 230, x1 = Math.max(...pts.map((p) => p.x)) + 230;
  const y0 = Math.min(...pts.map((p) => p.y)) - 120, y1 = Math.max(...pts.map((p) => p.y)) + 120;
  const maxW = phone ? 620 : 1500, minW = phone ? 460 : 900;
  let w = Math.max(x1 - x0, minW), h = y1 - y0, x = (x0 + x1) / 2 - w / 2, y = y0;
  // too big to show whole at reading size: centre on the arrow's label, where the reaction is written
  if (w > maxW || h > (phone ? 900 : 1000)) {
    w = phone ? 600 : 1300; h = phone ? 520 : 640;
    x = focus.x - w / 2; y = focus.y - h / 2;
  }
  // grow the view so the step lands in the free part of the screen
  const W = w / (1 - res.l - res.r), H = h / (1 - res.t - res.b);
  return { x: x - res.l * W, y: y - res.t * H, w: W, h: H };
}

/** How long autoplay stays on a step: enough to read it. */
const dwell = (s: TourStep) => 3200 + s.say.length * 38;

interface BarProps {
  scene: Scene;
  tour: Tour;
  step: number;
  done: boolean;
  /** The details drawer is open: on a wide screen the card moves aside so it stays usable. */
  beside: boolean;
  slideHidden: boolean;
  onShowSlide: () => void;
  onSelect: (s: Selection) => void;
  onStep: (i: number) => void;
  onFinish: () => void;
  onReplay: () => void;
  onNext: (() => void) | null;
  onQuiz: () => void;
  onExit: () => void;
}

/** The narration card: one step at a time, with Back / Next, autoplay and the chapter's progress. */
export function StudyBar({ scene, tour, step, done, beside, slideHidden, onShowSlide, onSelect, onStep, onFinish, onReplay, onNext, onQuiz, onExit }: BarProps) {
  const [playing, setPlaying] = useState(false);
  const s = tour.steps[step];
  const last = step === tour.steps.length - 1;
  const next = () => (last ? onFinish() : onStep(step + 1));
  const nextRef = useRef(next);
  nextRef.current = next;

  useEffect(() => {
    if (!playing || done) return;
    const t = setTimeout(() => nextRef.current(), dwell(s));
    return () => clearTimeout(t);
  }, [playing, done, step, s]);
  useEffect(() => { if (done) setPlaying(false); }, [done]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null;
      if (t?.closest('input, textarea, select, [contenteditable="true"], .modal, .drawer, .panel') || e.metaKey || e.ctrlKey || e.altKey) return;
      if (e.key === 'ArrowRight') { e.preventDefault(); setPlaying(false); if (!done) nextRef.current(); }
      else if (e.key === 'ArrowLeft') { e.preventDefault(); setPlaying(false); if (done) onStep(tour.steps.length - 1); else if (step > 0) onStep(step - 1); }
      // Escape closes the drawer or a panel first; only with nothing else open does it leave study mode
      else if (e.key === 'Escape' && !document.querySelector('.drawer, .panel, .modal-back:not(.hidden), .palette-back')) onExit();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [step, done, tour, onStep, onExit]);

  // the chips open the details drawer, as a click on the map does
  const { nodeMap } = geometryOf(scene);
  const edge = s.edge ? scene.edges.find((e) => e.id === s.edge) : undefined;
  const mols = edge ? (s.back ? [edge.to, edge.from] : [edge.from, edge.to]) : s.node ? [s.node] : [];
  const enz = edge?.enz ? enzById[edge.enz] : null;
  const molChip = (id: string) => (
    <button key={id} className="sb-chip mol" onClick={() => onSelect({ kind: 'node', id })} title="Details">
      <Rich s={labelOf(nodeMap[id])} />
    </button>
  );
  return (
    <div className={`study-bar${beside ? ' beside' : ''}`} role="region" aria-label="Study mode" aria-live="polite">
      {playing && !done && <div key={step} className="sb-timer" style={{ animationDuration: `${dwell(s)}ms` }} />}
      <div className="sb-head">
        <span className="sb-chapter"><b>Part {tour.part}</b> · {tour.title}</span>
        <button className="icon-btn" onClick={onExit} aria-label="Leave study mode" title="Leave study mode (Esc)"><CloseIcon /></button>
      </div>
      {done ? (
        <div className="sb-done sb-body enter">
          <h3><span className="sb-burst" aria-hidden="true"><CheckIcon /></span>Chapter complete</h3>
          <p>You walked all {tour.steps.length} steps of <Rich s={tour.title} />. Try the quiz on this plate to see what stuck.</p>
        </div>
      ) : (
        <div key={step} className="sb-body enter">
          <div className="sb-title"><span className="sb-num">{step + 1}</span><span><Rich s={s.title} /></span></div>
          <p className="sb-say"><Rich s={s.say} /></p>
          <div className="sb-meta">
            {mols.length === 2 ? <>{molChip(mols[0])}<span className="sb-arrow" aria-hidden="true">→</span>{molChip(mols[1])}</> : mols.map(molChip)}
            {enz && (
              <button className="sb-chip enz" onClick={() => onSelect({ kind: 'enz', id: enz.id })} title="Details">
                <Rich s={enz.full ?? enz.name} />
              </button>
            )}
            <button className="sb-chip" onClick={onShowSlide} title={slideHidden ? 'Show the slide' : 'Show this step’s slide'}>
              {s.slide.replace(/^Part [IV]+ · /, '')}
            </button>
          </div>
        </div>
      )}
      <div className="sb-foot">
        <div className="sb-dots" role="group" aria-label="Steps">
          {tour.steps.map((x, i) => (
            <button key={x.id} className={`sb-dot${!done && i === step ? ' cur' : ''}${done || i < step ? ' done' : ''}`}
              onClick={() => { setPlaying(false); onStep(i); }} aria-label={`Step ${i + 1}: ${x.title}`} aria-current={!done && i === step ? 'step' : undefined} />
          ))}
        </div>
        {done ? (
          <>
            <button className="sb-btn" onClick={onReplay}>Replay</button>
            <button className="sb-btn" onClick={onQuiz}>Quiz this plate</button>
            {onNext && <button className="sb-btn primary" onClick={onNext}>Next chapter</button>}
          </>
        ) : (
          <>
            <button className={`sb-btn play${playing ? ' on' : ''}`} onClick={() => setPlaying((p) => !p)} aria-pressed={playing} title="Play the steps automatically">
              {playing ? '❚❚' : '▶'}<span className="sr-only">{playing ? 'Pause' : 'Autoplay'}</span>
            </button>
            <button className="sb-btn" onClick={() => { setPlaying(false); onStep(step - 1); }} disabled={step === 0}>Back</button>
            <button className="sb-btn primary" onClick={() => { setPlaying(false); next(); }}>{last ? 'Finish' : 'Next'}</button>
          </>
        )}
      </div>
    </div>
  );
}

interface PanelProps { done: Set<string>; onStart: (id: string) => void; onClose: () => void }

/** Chapter picker, in lecture order. */
export function StudyPanel({ done, onStart, onClose }: PanelProps) {
  const ref = useRef<HTMLDivElement>(null);
  usePanelDismiss(onClose, ref);
  const parts = (['I', 'II', 'III', 'IV'] as Part[]).filter((p) => tours.some((t) => t.part === p));
  const resume = tours.find((t) => !done.has(t.id));
  return (
    <div className="panel study-panel" ref={ref} role="dialog" aria-label="Study mode">
      <div className="panel-head"><h2>Study</h2><button className="icon-btn" onClick={onClose} aria-label="Close"><CloseIcon /></button></div>
      <div className="panel-body">
        <p className="st-note first">Walk each pathway one step at a time, in slide order, with the slide beside the map. Use ← → to move, or ▶ to play.</p>
        {resume && done.size > 0 && (
          <button className="sb-btn primary st-resume" onClick={() => onStart(resume.id)}><span>Continue: <Rich s={resume.title} /></span></button>
        )}
        {parts.map((p) => {
          const list = tours.filter((t) => t.part === p);
          const n = list.filter((t) => done.has(t.id)).length;
          return (
            <section key={p}>
              <h3>Part {p} · {PART_TITLE[p]} <span className="st-count">{n}/{list.length}</span></h3>
              {list.map((t) => (
                <button key={t.id} className="st-chapter" onClick={() => onStart(t.id)}>
                  <span className="st-t"><Rich s={t.title} /></span>
                  <span className="st-s">{/[–,]/.test(t.slides) ? 'Slides' : 'Slide'} {t.slides} · <Rich s={t.sub} /></span>
                  <span className="st-n">{done.has(t.id) && <span className="tick" aria-label="completed"><CheckIcon /></span>}{t.steps.length} steps</span>
                </button>
              ))}
            </section>
          );
        })}
      </div>
    </div>
  );
}
