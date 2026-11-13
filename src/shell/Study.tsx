import { useEffect, useRef, useState } from 'react';
import { enzById } from '../data/enzymes';
import { tours, type Tour, type TourStep } from '../data/tours';
import type { Part, Scene } from '../data/types';
import type { View } from '../Diagram';
import { geometryOf, nodeBox } from '../map/geometry';
import { Rich } from '../rich';
import { CheckIcon, CloseIcon } from './icons';
import { PART_TITLE, usePanelDismiss } from './Panels';

/** The arrows lit so far in a chapter (every step up to and including `upTo`) and the molecules they touch. */
export function tourTrail(tour: Tour, upTo: number, scene: Scene): { edges: Set<string>; nodes: Set<string> } {
  const edges = new Set<string>(), nodes = new Set<string>();
  const byId = new Map(scene.edges.map((e) => [e.id, e]));
  tour.steps.slice(0, upTo + 1).forEach((s) => {
    const e = s.edge ? byId.get(s.edge) : undefined;
    if (e) { edges.add(e.id); nodes.add(e.from); nodes.add(e.to); if (e.feed) nodes.add(e.feed); if (e.out) nodes.add(e.out); }
    if (s.node) nodes.add(s.node);
  });
  return { edges, nodes };
}

/**
 * Where the camera goes for a step: the arrow with both its molecules, at reading size, raised so the study card at
 * the bottom of the screen does not cover it. Phones are capped at ~620 map units across, the widest view at which
 * the reaction labels (cofactors) are still drawn on a 390 px screen.
 */
export function stepView(step: TourStep, scene: Scene, phone: boolean): View {
  const { nodeMap, routed } = geometryOf(scene);
  const pts: { x: number; y: number }[] = [];
  const boxAt = (id: string) => { const b = nodeBox(nodeMap[id]); pts.push({ x: b.c.x - b.hw, y: b.c.y - b.hh }, { x: b.c.x + b.hw, y: b.c.y + b.hh }); };
  let focus: { x: number; y: number };
  if (step.edge) {
    const e = scene.edges.find((x) => x.id === step.edge)!;
    const r = routed.get(e.id)!;
    pts.push(...r.pts);
    boxAt(e.from); boxAt(e.to);
    focus = r.mid;
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
  // keep the bottom of the screen for the study card
  const reserve = phone ? 0.42 : 0.3;
  return { x, y, w, h: h / (1 - reserve) };
}

/** How long autoplay stays on a step: enough to read it. */
const dwell = (s: TourStep) => 3200 + s.say.length * 38;

interface BarProps {
  scene: Scene;
  tour: Tour;
  step: number;
  done: boolean;
  onStep: (i: number) => void;
  onFinish: () => void;
  onReplay: () => void;
  onNext: (() => void) | null;
  onQuiz: () => void;
  onExit: () => void;
}

/** The narration card: one step at a time, with Back / Next, autoplay and the chapter's progress. */
export function StudyBar({ scene, tour, step, done, onStep, onFinish, onReplay, onNext, onQuiz, onExit }: BarProps) {
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
      if (t?.closest('input, textarea, select, [contenteditable="true"], .modal, .drawer') || e.metaKey || e.ctrlKey || e.altKey) return;
      if (e.key === 'ArrowRight') { e.preventDefault(); setPlaying(false); if (!done) nextRef.current(); }
      else if (e.key === 'ArrowLeft') { e.preventDefault(); setPlaying(false); if (done) onStep(tour.steps.length - 1); else if (step > 0) onStep(step - 1); }
      else if (e.key === 'Escape') onExit();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [step, done, tour, onStep, onExit]);

  // the chip names the enzyme on the step's arrow; summary arrows have none
  const edge = s.edge ? scene.edges.find((e) => e.id === s.edge) : undefined;
  const enz = edge?.enz ? enzById[edge.enz].name : null;
  return (
    <div className="study-bar" role="region" aria-label="Study mode" aria-live="polite">
      {playing && !done && <div key={step} className="sb-timer" style={{ animationDuration: `${dwell(s)}ms` }} />}
      <div className="sb-head">
        <span className="sb-chapter"><b>Part {tour.part}</b> · {tour.title} · slides {tour.slides}</span>
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
            {enz && <span className="sb-chip enz"><Rich s={enz} /></span>}
            <span className="sb-chip">{s.slide.replace(/^Part [IV]+ · /, '')}</span>
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
  return (
    <div className="panel study-panel" ref={ref} role="dialog" aria-label="Study mode">
      <div className="panel-head"><h2>Study</h2><button className="icon-btn" onClick={onClose} aria-label="Close"><CloseIcon /></button></div>
      <div className="panel-body">
        {parts.map((p) => (
          <section key={p}>
            <h3>Part {p} · {PART_TITLE[p]}</h3>
            {tours.filter((t) => t.part === p).map((t) => (
              <button key={t.id} className="st-chapter" onClick={() => onStart(t.id)}>
                <span className="st-t"><Rich s={t.title} /></span>
                <span className="st-s">Slides {t.slides} · <Rich s={t.sub} /></span>
                <span className="st-n">{done.has(t.id) && <span className="tick" aria-label="completed"><CheckIcon /></span>}{t.steps.length} steps</span>
              </button>
            ))}
          </section>
        ))}
        <p className="st-note">Each chapter walks one pathway a step at a time, in slide order. Use ← → to move, or ▶ to play.</p>
      </div>
    </div>
  );
}
