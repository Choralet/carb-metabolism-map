import { useCallback, useEffect, useLayoutEffect, useMemo, useRef } from 'react';
import { cardById } from './data/cards';
import { enzById } from './data/enzymes';
import { regBlocks } from './data/regulation';
import { isHidden, nodeQuizKind, resultClass, tagKey, type QuizState } from './quiz';
import type { CoKey, EnzClass, Edge, Exam, ExamTag, MapNode, Region, Scene, Scope } from './data/types';
import { onPlate } from './data/plate';
import {
  arcGeom, clip, enzBox, geometryOf, GAP, harpoonPath, HIDDEN_BOX, labelCenter, labelOf, nodeBox, spaced, tagParts, TY,
  type Anchor, type Box, type P,
} from './map/geometry';
import { ClassMark, InfoGlyph, RegSym } from './map/glyphs';
import { SvgLines, Tspans } from './rich';
import { measure } from './text';

export type Selection = { kind: 'enz' | 'node' | 'card' | 'reg'; id: string } | null;
export interface View { x: number; y: number; w: number; h: number }

const clsOf = (enz?: string): EnzClass[] => (enz ? enzById[enz].cls : []);
const exOf = (x: { exam?: ExamTag }): ExamTag => x.exam ?? 'mid';
const regionExam = (r: Region): Exam => (r.part === 'III' || r.part === 'IV' ? 'final' : 'mid');
const PART_LABEL: Record<string, string> = { I: 'PART I · MIDTERM', II: 'PART II · MIDTERM', III: 'PART III · FINAL', IV: 'PART IV · FINAL' };

/** Below this many screen px per map unit labels are too small to read, so they are hidden (see styles.css). */
const LOD_FAR = 0.36, LOD_MID = 0.6;
const lodFor = (pxPerUnit: number) => (pxPerUnit < LOD_FAR ? 'far' : pxPerUnit < LOD_MID ? 'mid' : 'near');
const MIN_W = 300;

interface Props {
  scene: Scene;
  scope: Scope;
  filter: Set<EnzClass>;
  co: Set<CoKey>;
  showReg: boolean;
  selection: Selection;
  onSelect: (s: Selection) => void;
  /** Fly the camera here whenever `n` changes. */
  focus: { view: View; n: number };
  /** First view when the map mounts. */
  start: View;
  quiz: QuizState;
  /** A hidden item was clicked: ask about it (the rectangle places the question card). */
  onReveal: (key: string, at: DOMRect) => void;
  /** A traced route: only its arrows and molecules stay lit, and its arrows are marked like a highlighter pen. */
  route: { edges: Set<string>; nodes: Set<string> } | null;
}

export default function Diagram({ scene, scope, filter, co, showReg, selection, onSelect, focus, start, quiz, onReveal, route }: Props) {
  const { nodeMap, routed, regGeoms, plateOf, bounds } = geometryOf(scene);
  /** Widest view (map units): enough to see the whole map at once, whichever parts it has. */
  const MAX_W = Math.max(9000, bounds.both.w + 800);
  const { nodes, edges, regions, bands, captions, labels, decor } = scene;
  const compartments = scene.compartments ?? [];
  const wrap = useRef<HTMLDivElement>(null);
  const svg = useRef<SVGSVGElement>(null);
  const drag = useRef<{ x: number; y: number; vx: number; vy: number; moved: boolean } | null>(null);
  const raf = useRef(0);
  const size = useRef({ w: 1200, h: 800 });
  const lod = useRef('');
  // The camera lives outside React: pan, pinch, wheel and animations only rewrite the SVG's viewBox attribute, so a
  // gesture never re-renders the hundreds of elements on the map.
  const vbRef = useRef<View>({ x: 0, y: 0, w: 2300, h: 1400 });
  const setVb = useCallback((v: View) => {
    vbRef.current = v;
    const el = svg.current;
    if (!el) return;
    el.setAttribute('viewBox', `${v.x} ${v.y} ${v.w} ${v.h}`);
    const next = lodFor(size.current.w / v.w);
    if (next !== lod.current) { lod.current = next; el.setAttribute('data-lod', next); }
  }, []);

  /** Grow a rectangle to the viewport's aspect ratio, keeping its centre. */
  const fit = useCallback((v: View, s = size.current): View => {
    const asp = s.w / s.h;
    let w = v.w, h = v.h;
    if (w / h < asp) w = h * asp; else h = w / asp;
    return { x: v.x + v.w / 2 - w / 2, y: v.y + v.h / 2 - h / 2, w, h };
  }, []);

  const animate = useCallback((target: View) => {
    cancelAnimationFrame(raf.current);
    const from = vbRef.current, t0 = performance.now(), D = 450;
    const step = (now: number) => {
      const k = Math.min(1, (now - t0) / D), e = 1 - Math.pow(1 - k, 3);
      setVb({ x: from.x + (target.x - from.x) * e, y: from.y + (target.y - from.y) * e, w: from.w + (target.w - from.w) * e, h: from.h + (target.h - from.h) * e });
      if (k < 1) raf.current = requestAnimationFrame(step);
    };
    raf.current = requestAnimationFrame(step);
  }, [setVb]);

  useLayoutEffect(() => {
    const el = wrap.current!;
    const ro = new ResizeObserver(() => {
      size.current = { w: el.clientWidth, h: el.clientHeight };
      setVb(fit(vbRef.current));
    });
    ro.observe(el);
    size.current = { w: el.clientWidth, h: el.clientHeight };
    setVb(fit(start));
    return () => ro.disconnect();
    // the start view only applies to the first mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fit, setVb]);

  useEffect(() => { if (focus.n > 0) animate(fit(focus.view)); }, [focus, animate, fit]);

  // wheel zoom around the cursor
  useEffect(() => {
    const el = svg.current!;
    const onWheel = (ev: WheelEvent) => {
      ev.preventDefault();
      cancelAnimationFrame(raf.current);
      const r = el.getBoundingClientRect();
      const v = vbRef.current;
      const f = Math.exp(ev.deltaY * (ev.ctrlKey ? 0.01 : 0.0012));
      const w = Math.min(Math.max(v.w * f, MIN_W), MAX_W), k = w / v.w;
      const px = (ev.clientX - r.left) / r.width, py = (ev.clientY - r.top) / r.height;
      const cx = v.x + px * v.w, cy = v.y + py * v.h;
      setVb({ x: cx - px * v.w * k, y: cy - py * v.h * k, w, h: v.h * k });
    };
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, [setVb]);

  /**
   * Pointer gestures: one pointer pans, two pinch-zoom. Touch, pen and mouse all arrive as pointer events, so there
   * is a single code path. `drag.moved` suppresses the click that would otherwise follow a pan or pinch.
   */
  const ptrs = useRef(new Map<number, { x: number; y: number }>());
  const pinch = useRef<{ d: number; cx: number; cy: number; vb: View } | null>(null);

  const startPinch = useCallback(() => {
    const pts = [...ptrs.current.values()];
    if (pts.length < 2) { pinch.current = null; return; }
    const [a, b] = pts;
    pinch.current = { d: Math.hypot(a.x - b.x, a.y - b.y) || 1, cx: (a.x + b.x) / 2, cy: (a.y + b.y) / 2, vb: vbRef.current };
  }, []);

  const onPointerDown = (ev: React.PointerEvent) => {
    if (ev.pointerType === 'mouse' && ev.button !== 0) return;
    cancelAnimationFrame(raf.current);
    ptrs.current.set(ev.pointerId, { x: ev.clientX, y: ev.clientY });
    if (ptrs.current.size === 1) {
      drag.current = { x: ev.clientX, y: ev.clientY, vx: vbRef.current.x, vy: vbRef.current.y, moved: false };
    } else if (ptrs.current.size === 2) {
      if (drag.current) drag.current.moved = true; // a two-finger gesture is never a tap
      startPinch();
    }
  };

  const gestureFrame = useRef(0);
  /** Applies the current finger positions to the camera; runs at most once per animation frame. */
  const applyGesture = useCallback(() => {
    gestureFrame.current = 0;
    const el = svg.current;
    if (!el) return;
    const g = pinch.current;
    if (g && ptrs.current.size >= 2) {
      const [a, b] = [...ptrs.current.values()];
      const dist = Math.hypot(a.x - b.x, a.y - b.y) || 1;
      const r = el.getBoundingClientRect();
      const w = Math.min(Math.max(g.vb.w * (g.d / dist), MIN_W), MAX_W);
      const h = g.vb.h * (w / g.vb.w);
      // hold the document point under the pinch midpoint still
      const px = (g.cx - r.left) / r.width, py = (g.cy - r.top) / r.height;
      const docX = g.vb.x + px * g.vb.w, docY = g.vb.y + py * g.vb.h;
      const nx = ((a.x + b.x) / 2 - r.left) / r.width, ny = ((a.y + b.y) / 2 - r.top) / r.height;
      setVb({ x: docX - nx * w, y: docY - ny * h, w, h });
      return;
    }
    const d = drag.current;
    if (!d || !d.moved || ptrs.current.size !== 1) return;
    const [p] = [...ptrs.current.values()];
    const v = vbRef.current, s = size.current;
    setVb({ ...v, x: d.vx - ((p.x - d.x) * v.w) / s.w, y: d.vy - ((p.y - d.y) * v.h) / s.h });
  }, [setVb]);

  useEffect(() => {
    const onMove = (m: PointerEvent) => {
      if (!ptrs.current.has(m.pointerId)) return;
      ptrs.current.set(m.pointerId, { x: m.clientX, y: m.clientY });
      const d = drag.current;
      if (d && !d.moved && ptrs.current.size === 1 && Math.abs(m.clientX - d.x) + Math.abs(m.clientY - d.y) > 4) d.moved = true;
      if (!gestureFrame.current) gestureFrame.current = requestAnimationFrame(applyGesture);
    };
    const onUp = (u: PointerEvent) => {
      if (!ptrs.current.delete(u.pointerId)) return;
      if (ptrs.current.size >= 2) { startPinch(); return; }
      pinch.current = null;
      if (ptrs.current.size === 1) {
        // a finger lifted out of a pinch: carry on panning with the one that is left
        const [p] = [...ptrs.current.values()];
        drag.current = { x: p.x, y: p.y, vx: vbRef.current.x, vy: vbRef.current.y, moved: true };
        return;
      }
      setTimeout(() => { drag.current = null; }, 0);
    };
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    window.addEventListener('pointercancel', onUp);
    return () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      window.removeEventListener('pointercancel', onUp);
      cancelAnimationFrame(gestureFrame.current);
    };
  }, [startPinch, applyGesture]);

  /** In quiz mode a hidden block reveals its name first; a second click opens its details. */
  const activate = (s: Selection, hiddenKey: string | null) => (ev: React.MouseEvent | React.KeyboardEvent) => {
    ev.stopPropagation();
    if (drag.current?.moved) return;
    if (hiddenKey) onReveal(hiddenKey, (ev.currentTarget as Element).getBoundingClientRect()); else onSelect(s);
  };
  const onKey = (s: Selection, hiddenKey: string | null) => (ev: React.KeyboardEvent) => {
    if (ev.key === 'Enter' || ev.key === ' ') { ev.preventDefault(); activate(s, hiddenKey)(ev); }
  };

  const zoomBy = (f: number) => {
    const v = vbRef.current, w = Math.min(Math.max(v.w * f, MIN_W), MAX_W), k = w / v.w;
    animate({ x: v.x + (v.w - v.w * k) / 2, y: v.y + (v.h - v.h * k) / 2, w, h: v.h * k });
  };

  /** Cross-references fly to their target and flash it. */
  const flyTo = (id: string) => {
    const t = nodeMap[id];
    if (!t) return;
    animate(fit({ x: t.x - 420, y: t.y - 280, w: 840, h: 560 }));
    const el = svg.current?.querySelector(`[data-node="${id}"]`);
    if (el) { el.classList.remove('flash'); void el.getBoundingClientRect(); el.classList.add('flash'); setTimeout(() => el.classList.remove('flash'), 2400); }
  };

  // Hovering an enzyme lights up every place it is drawn. Done on the DOM, not in React state, so hovering never
  // re-renders the map.
  const hot = useRef<string | null>(null);
  const setHot = (id: string | null) => {
    if (hot.current === id) return;
    const el = svg.current;
    if (!el) return;
    if (hot.current) el.querySelectorAll(`[data-enz="${hot.current}"]`).forEach((n) => n.classList.remove('hot'));
    hot.current = id;
    if (id) el.querySelectorAll(`[data-enz="${id}"]`).forEach((n) => n.classList.add('hot'));
  };

  // ── exam highlight + filters ────────────────────────────────────
  /** The exam switch only highlights: the other exam's material fades, and what both exams use stays lit. */
  const inScope = (x: { exam?: ExamTag }) => scope === 'both' || exOf(x) === 'both' || exOf(x) === scope;
  const filtering = !!route || filter.size > 0 || co.size > 0;
  const clsOk = (e: Edge) => filter.size === 0 || clsOf(e.enz).some((c) => filter.has(c));
  const coOk = (e: Edge) => co.size === 0 || !!e.co?.some((c) => co.has(c));
  const edgeOn = (e: Edge) => (route ? route.edges.has(e.id) : clsOk(e) && coOk(e));
  const activeNodes = useMemo(() => {
    const s = new Set<string>();
    if (!filtering) return s;
    if (route) return route.nodes;
    edges.forEach((e) => { if (edgeOn(e)) { s.add(e.from); s.add(e.to); if (e.feed) s.add(e.feed); if (e.out) s.add(e.out); } });
    return s;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter, co, scene, route]);
  const nodeOn = (n: MapNode) => {
    if (!filtering) return true;
    if (route) return route.nodes.has(n.id);
    if (n.kind === 'card' || n.kind === 'xref') return true;
    if (n.enz && co.size === 0) return clsOf(n.enz).some((c) => filter.has(c));
    return activeNodes.has(n.id);
  };

  const selEnz = selection?.kind === 'enz' ? selection.id : null;
  /** Knockouts behind text take the colour of the plate underneath (final plates are tinted). */
  const paperAt = (x: number, y: number) => (regions.some((r) => regionExam(r) === 'final' && onPlate(r, x, y)) ? 'fin' : 'mid');
  const paper = (n: { x: number; y: number }) => paperAt(n.x, n.y);
  /** Reaction notes are haloed in paper colour, which is not enough over a membrane's dots: there they get a knockout. */
  const tagText = (t: string, x: number, y: number, anchor: Anchor, extra = '') => {
    const w = measure(t, TY.tag, 400, 'sans');
    const x0 = anchor === 'start' ? x : anchor === 'end' ? x - w : x - w / 2;
    const k = { x: x0 - 3, y: y - TY.tag + 1, w: w + 6, h: TY.tag + 4 };
    const onBand = bands.some((b) => k.x < b.x + b.w && k.x + k.w > b.x && k.y < b.y + b.h && k.y + k.h > b.y);
    return (
      <>
        {onBand && <rect className={`tag-ko${extra}`} x={k.x} y={k.y} width={k.w} height={k.h} rx={2} />}
        <text className={`tag${extra}`} x={x} y={y} textAnchor={anchor}><Tspans s={t} size={TY.tag} /></text>
      </>
    );
  };
  const visEdges = edges;
  const visNodes = nodes;
  const visRegions = regions;

  // ── plates ──────────────────────────────────────────────────────
  const renderPlate = (r: Region) => {
    const ex = regionExam(r);
    const no = `PLATE ${r.plate}`;
    const wNo = spaced(no, 10.5, 500, 'mono', 0.14) + 10;
    const wTitle = measure(r.title, 20, 600, 'display');
    const wSub = r.sub ? measure(r.sub, 13, 500, 'serif', true) + 10 : 0;
    const total = wNo + wTitle + wSub;
    const x0 = r.right ? r.x + r.w - 24 - total : r.x + (r.titleX ?? 24);
    const tab = PART_LABEL[r.part];
    const tabW = spaced(tab, 9.5, 500, 'mono', 0.12) + 20;
    const rects = [r, ...(r.more ?? [])];
    return (
      <g key={r.id} className={`plate ${ex}${r.outside ? ' outside' : ''}${inScope({ exam: ex }) ? '' : ' out'}`}>
        <path className="plate-tab" d={`M${r.x},${r.y} v-16 h${tabW} l9,16 z`} />
        <text className="plate-tabt" x={r.x + 10} y={r.y - 4.5}>{tab}</text>
        {rects.map((q, i) => <rect key={`s${i}`} className="plate-bg edge" x={q.x} y={q.y} width={q.w} height={q.h} rx={3} />)}
        {rects.map((q, i) => <rect key={`f${i}`} className="plate-bg fill" x={q.x} y={q.y} width={q.w} height={q.h} rx={3} />)}
        {rects.map((q, i) => <rect key={`i${i}`} className="plate-in edge" x={q.x + 6} y={q.y + 6} width={q.w - 12} height={q.h - 12} rx={2} />)}
        {rects.length > 1 && rects.map((q, i) => <rect key={`c${i}`} className="plate-bg fill inner" x={q.x + 7} y={q.y + 7} width={q.w - 14} height={q.h - 14} rx={2} />)}
        <g className="plate-head lod-mid">
          <text className="plate-no" x={x0} y={r.y + 36}>{no}</text>
          <text className="plate-title" x={x0 + wNo} y={r.y + 37}><Tspans s={r.title} size={20} /></text>
          {r.sub && <text className="plate-sub" x={x0 + wNo + wTitle + 10} y={r.y + 37}><Tspans s={r.sub} size={13} /></text>}
        </g>
      </g>
    );
  };

  /** Zoomed far out, each plate shows just its number and a big title. */
  const renderFarTitle = (r: Region) => {
    const size = Math.max(40, Math.min(92, r.w / 9, r.h / 4));
    const lines = r.title.length > 20 && r.w / r.title.length < size * 0.62 ? splitTitle(r.title) : [r.title];
    return (
      <g key={r.id} className={`far-title far-only${inScope({ exam: regionExam(r) }) ? '' : ' out'}`}>
        <text x={r.x + r.w / 2} y={r.y + r.h / 2 - (lines.length * size * 1.05) / 2 - size * 0.25} textAnchor="middle" className="far-no" fontSize={size * 0.42}>
          {`PLATE ${r.plate}`}
        </text>
        <text x={r.x + r.w / 2} textAnchor="middle" className="far-t" fontSize={size}>
          {lines.map((l, i) => (
            <tspan key={i} x={r.x + r.w / 2} y={r.y + r.h / 2 - ((lines.length - 1) * size * 1.05) / 2 + i * size * 1.05 + size * 0.35}>
              <Tspans s={l} size={size} />
            </tspan>
          ))}
        </text>
      </g>
    );
  };

  // ── edges: lines first, then labels (so no arrow crosses a label) ─
  const renderLine = (e: Edge) => {
    const r = routed.get(e.id)!;
    const enz = e.enz ? enzById[e.enz] : undefined;
    const style = e.style ?? (enz ? 'main' : 'plain');
    const irrev = enz?.rev === false;
    const on = edgeOn(e);
    const sel = !!enz && selEnz === enz.id;
    const d = r.pts.map((p, i) => `${i ? 'L' : 'M'}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');
    const both = e.dir === 'both';
    const harpoon = both && r.pts.length === 2 && style !== 'link' && style !== 'plain';
    const marker = style === 'link' ? undefined : `url(#${sel ? 'ah-sel' : style === 'plain' ? 'ah-soft' : 'ah'})`;
    const clickable = !!enz && style !== 'link';
    const selTarget: Selection = enz ? { kind: 'enz', id: enz.id } : null;
    const onRoute = !!route?.edges.has(e.id);
    const cls = `eline ${style}${irrev ? ' irrev' : ''}${on ? '' : ' off'}${inScope(e) ? '' : ' out'}${sel ? ' sel' : ''}${onRoute ? ' route' : ''}`;

    // co-substrate curving into the label / co-product curving out of it
    const box = enz && !e.noPill && style !== 'link' ? enzBox(enz.id) : { w: 0, h: 0 };
    const P = labelCenter(e, r.mid, box);
    const labelBox: Box = { c: P, hw: box.w / 2 + 2, hh: box.h / 2 + 2 };
    const curve = (a: P, b: P) => {
      const mx = (a.x + b.x) / 2, my = (a.y + b.y) / 2;
      const k = 0.18, qx = mx - (b.y - a.y) * k, qy = my + (b.x - a.x) * k;
      return `M${a.x.toFixed(1)},${a.y.toFixed(1)} Q${qx.toFixed(1)},${qy.toFixed(1)} ${b.x.toFixed(1)},${b.y.toFixed(1)}`;
    };
    let feed: React.JSX.Element | null = null;
    if (e.feed && nodeMap[e.feed]) {
      const F = nodeBox(nodeMap[e.feed]);
      feed = <path className="feedline" d={curve(clip(F, F.c, P), clip(labelBox, P, F.c))} markerEnd="url(#ah-soft)" />;
    }
    let outLine: React.JSX.Element | null = null;
    if (e.out && nodeMap[e.out]) {
      const O = nodeBox(nodeMap[e.out]);
      outLine = <path className="feedline" d={curve(clip(labelBox, P, O.c), clip(O, O.c, P))} markerEnd="url(#ah-soft)" />;
    }

    return (
      <g key={e.id} className={cls} data-enz={enz?.id} data-edge={e.id}>
        {onRoute && <path className="route-glow" d={d} />}
        {feed}
        {outLine}
        {harpoon
          ? <path className="shaft harp" d={harpoonPath(r.pts[0], r.pts[1])} />
          : <path className="shaft" d={d} markerEnd={marker} markerStart={both ? marker : undefined} />}
        {clickable && <path d={d} className="edge-hit" onClick={activate(selTarget, null)} />}
      </g>
    );
  };

  const renderLabel = (e: Edge) => {
    const r = routed.get(e.id)!;
    const enz = e.enz ? enzById[e.enz] : undefined;
    const style = e.style ?? (enz ? 'main' : 'plain');
    const on = edgeOn(e);
    const showLabel = !!enz && !e.noPill && style !== 'link';
    if (!showLabel && !e.tags) return null;
    const hidden = showLabel && isHidden(quiz, 'enz', enz!.id);
    const box = !showLabel ? { lines: [] as string[], w: 0, h: 0 } : hidden ? HIDDEN_BOX : enzBox(enz!.id);
    const L = labelCenter(e, r.mid, box);
    // a label moved beside the arrow no longer sits on it, so arcs and notes attach to the bare arrow
    const onLine = e.lab ? { w: 0, h: 0 } : box;
    const P = r.mid;
    const sel = !!enz && selEnz === enz.id;
    const selTarget: Selection = enz ? { kind: 'enz', id: enz.id } : null;
    const cls0 = enz ? enz.cls[0] : 'other';
    const hl = on && filter.size > 0 && clsOk(e);
    const pp = paperAt(L.x, L.y);
    const cls = `elabel-g ${pp}${on ? '' : ' off'}${inScope(e) ? '' : ' out'}`;

    let tag: React.JSX.Element | null = null;
    if (e.tags) {
      const tagHidden = isHidden(quiz, 'tag', tagKey(e));
      const parts = e.plainTag ? { plain: e.tags } : tagParts(e.tags);
      const side = e.tagPos ?? 'r';
      if (parts.plain !== undefined) {
        let tx = P.x, ty = P.y + 4, anchor: Anchor = 'middle';
        if (side === 'r') { tx = P.x + onLine.w / 2 + 9; anchor = 'start'; }
        else if (side === 'l') { tx = P.x - onLine.w / 2 - 9; anchor = 'end'; }
        else if (side === 'below') ty = P.y + onLine.h / 2 + 15;
        else ty = P.y - onLine.h / 2 - 8;
        tag = tagHidden
          ? <QMark key="q" x={anchor === 'start' ? tx + 17 : anchor === 'end' ? tx - 17 : tx} y={ty - 4} k={tagKey(e)} activate={activate} onKey={onKey} />
          : tagText(parts.plain, tx, ty, anchor, ` lod-near${resultClass(quiz, tagKey(e))}`);
      } else {
        const a = arcGeom(P, onLine, side, r.dir, { inn: !!parts.inn, out: !!parts.out });
        tag = (
          <g className={`arc lod-near${resultClass(quiz, tagKey(e))}`}>
            <path className="arc-line" d={a.d} markerEnd="url(#ah-arc)" />
            {tagHidden
              ? <QMark x={a.qAnchor === 'start' ? a.q.x + 17 : a.qAnchor === 'end' ? a.q.x - 17 : a.q.x} y={a.q.y - 4} k={tagKey(e)} activate={activate} onKey={onKey} />
              : (
                <>
                  {parts.inn && tagText(parts.inn, a.inAt.x, a.inAt.y, a.inAnchor)}
                  {parts.out && tagText(parts.out, a.outAt.x, a.outAt.y, a.outAnchor)}
                </>
              )}
          </g>
        );
      }
    }

    return (
      <g key={e.id} className={cls} data-enz={enz?.id} data-edge={e.id}>
        {tag}
        {showLabel && (
          <g className={`elabel ${pp}${hidden ? ' hidden' : ''}${sel ? ' sel' : ''}${hl ? ' hl' : ''}${resultClass(quiz, enz!.id)} lod-mid`}
            style={{ '--c': `var(--k-${cls0})` } as React.CSSProperties}
            transform={`translate(${L.x.toFixed(1)},${L.y.toFixed(1)})`}
            onClick={activate(selTarget, hidden ? enz!.id : null)} onKeyDown={onKey(selTarget, hidden ? enz!.id : null)}
            tabIndex={0} role="button" aria-label={hidden ? 'Hidden enzyme name, click to reveal' : enz!.name}>
            <rect className="ko" x={-box.w / 2} y={-box.h / 2} width={box.w} height={box.h} rx={3} />
            {hidden
              ? <text className="qtext" y={5} textAnchor="middle">?</text>
              : (
                <>
                  <ClassMark cls={cls0} x={-box.w / 2 + 10} y={-box.h / 2 + 3.5 + TY.enzLine / 2} />
                  <text className="etext" textAnchor="start">
                    <SvgLines lines={box.lines} x={-box.w / 2 + 19} y={0} size={TY.enz} lineH={TY.enzLine} />
                  </text>
                </>
              )}
          </g>
        )}
      </g>
    );
  };

  // ── nodes ───────────────────────────────────────────────────────
  const renderNode = (n: MapNode) => {
    const kind = n.kind ?? 'met';
    const on = nodeOn(n);
    const b = nodeBox(n);
    const qk = nodeQuizKind(n);
    const qKey = qk === 'enz' ? n.enz! : n.id;
    const hidden = qk !== null && isHidden(quiz, qk, qKey);
    const label = hidden ? '?' : labelOf(n);
    const sel: Selection | null =
      n.card ? { kind: 'card', id: n.card } : n.enz && kind !== 'etag' ? { kind: 'enz', id: n.enz } : n.mol || n.mols ? { kind: 'node', id: n.id } : null;
    const isSel = !!selection && ((selection.kind === 'node' && selection.id === n.id) || (selection.kind === 'card' && selection.id === n.card) || (selection.kind === 'enz' && selection.id === n.enz));
    const interactive = !!sel || kind === 'etag';
    const target: Selection = sel ?? (n.enz ? { kind: 'enz', id: n.enz } : null);
    const hiddenKey = hidden ? qKey : null;
    const props = interactive
      ? { onClick: activate(target, hiddenKey), onKeyDown: onKey(target, hiddenKey), tabIndex: 0, role: 'button' as const, 'aria-label': hidden ? 'Hidden name, click to reveal' : label }
      : {};
    const hw = b.hw - GAP, hh = b.hh - GAP;
    const cls = `node kind-${kind} ${paper(n)}${on ? '' : ' off'}${inScope(n) ? '' : ' out'}${isSel ? ' selected' : ''}${interactive ? ' clickable' : ''}${hidden ? ' hidden' : ''}${qk ? resultClass(quiz, qKey) : ''}`;

    if (kind === 'xref') {
      const t = n.target ? nodeMap[n.target] : undefined;
      const tp = n.target ? plateOf.get(n.target) : undefined;
      const link = n.link ? nodeMap[n.link] : undefined;
      const dx = link ? n.x - link.x : 0;
      const anchor: Anchor = Math.abs(dx) < 40 ? 'middle' : dx < 0 ? 'end' : 'start';
      const sub = tp ? `▸ PLATE ${tp.plate} · ${regionExam(tp) === 'final' ? 'FINAL' : 'MIDTERM'}` : '▸';
      const w = Math.max(measure(labelOf(n), TY.xref, 500, 'serif', true), measure(sub, TY.xrefSub, 500, 'mono'));
      const left = anchor === 'start' ? n.x : anchor === 'end' ? n.x - w : n.x - w / 2;
      const me: Box = { c: { x: left + w / 2, y: n.y + 3 }, hw: w / 2 + 6, hh: 17 };
      const lp = link ? clip(nodeBox(link), link, me.c) : null;
      const sp = link ? clip(me, me.c, link) : null;
      return (
        <g key={n.id} className={`node kind-xref ${t ? paper(t) : 'mid'}${inScope(n) ? '' : ' out'} lod-mid`} data-node={n.id}
          onClick={(ev) => { ev.stopPropagation(); if (!drag.current?.moved && n.target) flyTo(n.target); }}
          onKeyDown={(ev) => { if ((ev.key === 'Enter' || ev.key === ' ') && n.target) { ev.preventDefault(); flyTo(n.target); } }}
          tabIndex={0} role="link" aria-label={`${labelOf(n)}: go to plate ${tp?.plate ?? ''}`}>
          {lp && sp && <path className="xref-lead" d={`M${sp.x.toFixed(1)},${sp.y.toFixed(1)} L${lp.x.toFixed(1)},${lp.y.toFixed(1)}`} />}
          <rect className="xref-hit" x={left - 6} y={n.y - 14} width={w + 12} height={34} rx={4} />
          <text className="xref-t" x={n.x} y={n.y} textAnchor={anchor}><Tspans s={labelOf(n)} size={TY.xref} /></text>
          <text className="xref-s" x={n.x} y={n.y + 15} textAnchor={anchor}>{sub}</text>
        </g>
      );
    }
    if (kind === 'etag') {
      const cls0 = enzById[n.enz!].cls[0];
      const box = hidden ? HIDDEN_BOX : enzBox(n.enz!);
      const link = n.link ? nodeMap[n.link] : null;
      const lp = link ? clip(nodeBox(link), link, n) : null;
      const sp = link ? clip(b, n, link) : null;
      return (
        <g key={n.id} className={`${cls} lod-mid`} data-enz={n.enz} data-node={n.id} {...props}>
          {lp && sp && <path className="xref-lead" d={`M${sp.x},${sp.y} L${lp.x},${lp.y}`} />}
          <g transform={`translate(${n.x},${n.y})`} className={`elabel ${paper(n)}${hidden ? ' hidden' : ''}${isSel ? ' sel' : ''}${resultClass(quiz, n.enz!)}`}
            style={{ '--c': `var(--k-${cls0})` } as React.CSSProperties}>
            <rect className="ko framed" x={-box.w / 2} y={-box.h / 2} width={box.w} height={box.h} rx={3} />
            {hidden
              ? <text className="qtext" y={5} textAnchor="middle">?</text>
              : (
                <>
                  <ClassMark cls={cls0} x={-box.w / 2 + 10} y={-box.h / 2 + 3.5 + TY.enzLine / 2} />
                  <text className="etext" textAnchor="start"><SvgLines lines={box.lines} x={-box.w / 2 + 19} y={0} size={TY.enz} lineH={TY.enzLine} /></text>
                </>
              )}
          </g>
        </g>
      );
    }
    if (kind === 'cx') {
      const cls0 = enzById[n.enz!].cls[0];
      return (
        <g key={n.id} className={cls} data-enz={n.enz} data-node={n.id} {...props} transform={`translate(${n.x},${n.y})`}
          style={{ '--c': `var(--k-${cls0})` } as React.CSSProperties}>
          <rect className="cxbox" x={-hw} y={-hh} width={hw * 2} height={hh * 2} rx={6} />
          <text y={6} textAnchor="middle" className="cx-label"><Tspans s={label} size={TY.cx} /></text>
          {!hidden && <ClassMark cls={cls0} x={0} y={-hh + 14} s={3.6} />}
        </g>
      );
    }
    if (kind === 'card') {
      return (
        <g key={n.id} className={`${cls} lod-mid`} data-node={n.id} {...props} transform={`translate(${n.x},${n.y})`}>
          <rect className="cardbox" x={-hw} y={-hh} width={hw * 2} height={hh * 2} rx={hh} />
          <InfoGlyph x={-hw + 13} y={0} table={!!cardById[n.card!]?.table} />
          <text x={-hw + 26} y={4.4} className="card-label"><Tspans s={label} size={TY.card} /></text>
        </g>
      );
    }
    const fam = kind === 'small' ? 'small' : kind === 'proc' ? 'proc' : 'met';
    const size = fam === 'small' ? TY.small : fam === 'proc' ? TY.proc : TY.met;
    return (
      <g key={n.id} className={cls} data-node={n.id} {...props} transform={`translate(${n.x},${n.y})`}>
        <rect className="nbox" x={-hw} y={-hh} width={hw * 2} height={hh * 2} rx={kind === 'met' ? hh : 6} />
        {kind === 'met' && <circle className="far-dot far-only" r={7} />}
        <text y={kind === 'met' ? 5.6 : 4.6} textAnchor="middle" className="node-label lod-mid"><Tspans s={label} size={size} /></text>
        {n.badge && !hidden && <text x={hw + 5} y={4.5} className="badge lod-near">{n.badge}</text>}
      </g>
    );
  };

  // ── regulation layer ────────────────────────────────────────────
  const renderReg = () => regBlocks.map((r) => {
    const g = regGeoms.get(r.id);
    if (!g) return null;
    const anchorExam: ExamTag = 'edge' in r.anchor
      ? exOf(edges.find((e) => e.id === (r.anchor as { edge: string }).edge) ?? {})
      : exOf(nodeMap[(r.anchor as { node: string }).node] ?? {});
    const box: Box = { c: g.c, hw: g.w / 2 + 6, hh: g.h / 2 + 6 };
    const from = clip(box, g.c, g.anchor);
    let to: P;
    if ('edge' in r.anchor) {
      const e = edges.find((x) => x.id === (r.anchor as { edge: string }).edge)!;
      const eb = e.enz && !e.noPill ? enzBox(e.enz) : { w: 0, h: 0 };
      const c = labelCenter(e, g.anchor, eb);
      to = clip({ c, hw: eb.w / 2 + 3, hh: eb.h / 2 + 3 }, c, g.c);
    } else to = clip(nodeBox(nodeMap[r.anchor.node]), g.anchor, g.c);
    // an inhibitor-only block ends in the ⊣ bar that means "inhibits"
    const bar = !r.act;
    const dx = to.x - from.x, dy = to.y - from.y, L = Math.hypot(dx, dy) || 1;
    const ex = to.x - (dx / L) * 5, ey = to.y - (dy / L) * 5;
    const nx = (-dy / L) * 9, ny = (dx / L) * 9;
    let top = -g.h / 2;
    return (
      <g key={r.id} className={`reg lod-mid${r.act ? '' : ' inh-only'}${anchorExam === 'final' ? ' fin' : ''}${inScope({ exam: anchorExam }) ? '' : ' out'}`}
        onClick={activate({ kind: 'reg', id: r.id }, null)} onKeyDown={onKey({ kind: 'reg', id: r.id }, null)} tabIndex={0} role="button" aria-label={`Regulation of ${r.title}`}>
        <path className="reg-line" d={`M${from.x.toFixed(1)},${from.y.toFixed(1)} L${ex.toFixed(1)},${ey.toFixed(1)}`} />
        {bar
          ? <path className="reg-bar" d={`M${(ex - nx).toFixed(1)},${(ey - ny).toFixed(1)} L${(ex + nx).toFixed(1)},${(ey + ny).toFixed(1)}`} />
          : <circle className="reg-dot" cx={ex} cy={ey} r={4} />}
        {g.rows.map((row, i) => {
          const y = top + row.h / 2; top += row.h + 5;
          return (
            <g key={i} className={`reg-row ${row.kind}`} transform={`translate(${g.c.x.toFixed(1)},${(g.c.y + y).toFixed(1)})`}>
              <rect x={-g.w / 2} y={-row.h / 2} width={g.w} height={row.h} rx={4} />
              <RegSym kind={row.kind} x={-g.w / 2 + 13} y={0} />
              <text className="reg-text" textAnchor="start">
                <SvgLines lines={row.lines} x={-g.w / 2 + 25} y={0} size={TY.reg} lineH={TY.regLine} />
              </text>
            </g>
          );
        })}
      </g>
    );
  });

  return (
    <div className="canvas" ref={wrap}>
      <svg ref={svg} onPointerDown={onPointerDown} onClick={() => { if (!drag.current?.moved) onSelect(null); }}
        onMouseOver={(ev) => { if (ptrs.current.size) return; const t = (ev.target as Element).closest('[data-enz]'); setHot(t ? t.getAttribute('data-enz') : null); }}
        onMouseLeave={() => setHot(null)}
        role="img" aria-label="Metabolism map">
        <defs>
          <marker id="ah" viewBox="0 0 12 10" refX="10.5" refY="5" markerWidth="12" markerHeight="10" markerUnits="userSpaceOnUse" orient="auto-start-reverse">
            <path className="ah" d="M0,0.8 L12,5 L0,9.2 L3,5z" />
          </marker>
          <marker id="ah-sel" viewBox="0 0 12 10" refX="10.5" refY="5" markerWidth="13" markerHeight="11" markerUnits="userSpaceOnUse" orient="auto-start-reverse">
            <path className="ah sel" d="M0,0.8 L12,5 L0,9.2 L3,5z" />
          </marker>
          <marker id="ah-soft" viewBox="0 0 10 8" refX="9" refY="4" markerWidth="9" markerHeight="7.5" markerUnits="userSpaceOnUse" orient="auto-start-reverse">
            <path className="ah soft" d="M0,0.5 L10,4 L0,7.5 L2.4,4z" />
          </marker>
          <marker id="ah-arc" viewBox="0 0 10 8" refX="9" refY="4" markerWidth="8" markerHeight="6.5" markerUnits="userSpaceOnUse" orient="auto">
            <path className="ah soft" d="M0,0.5 L10,4 L0,7.5 L2.4,4z" />
          </marker>
          <pattern id="grain" width="5" height="5" patternUnits="userSpaceOnUse">
            <rect className="desk" width="5" height="5" />
            <circle className="grain" cx="1.2" cy="1.3" r=".55" />
            <circle className="grain" cx="3.7" cy="3.6" r=".45" />
          </pattern>
          <pattern id="mem-v" width="6" height="6" patternUnits="userSpaceOnUse"><rect className="mem-bg" width="6" height="6" /><path className="mem-hatch" d="M3,0 V6" /></pattern>
          <pattern id="mem-h" width="6" height="6" patternUnits="userSpaceOnUse"><rect className="mem-bg" width="6" height="6" /><path className="mem-hatch" d="M0,3 H6" /></pattern>
        </defs>

        <rect x={-20000} y={-20000} width={60000} height={60000} fill="url(#grain)" />

        {compartments.map((c) => (
          <g key={c.id} className={`compartment ${c.kind}`}>
            <rect className="cmp-body" x={c.x} y={c.y} width={c.w} height={c.h} rx={c.kind === 'cell' ? 90 : 60} />
            <rect className="cmp-line" x={c.x + 9} y={c.y + 9} width={c.w - 18} height={c.h - 18} rx={c.kind === 'cell' ? 82 : 52} />
            {c.label && <text className="cmp-label lod-mid" x={c.x + (c.kind === 'cell' ? 80 : 60)} y={c.y + (c.kind === 'cell' ? -14 : c.h + 34)}>{c.label}</text>}
          </g>
        ))}

        {visRegions.map(renderPlate)}

        {labels.map((l, i) => (
          <g key={i} className={`label ${l.kind} ${l.kind === 'phase' ? 'lod-near' : 'lod-mid'}`}>
            <text x={l.x} y={l.y} textAnchor={l.anchor ?? 'start'} className="lt"><Tspans s={l.text} size={l.kind === 'section' ? 18 : 11} /></text>
            {l.sub?.map((s, k) => <text key={k} x={l.x} y={l.y + (l.kind === 'section' ? 20 : 16) + k * 15} textAnchor={l.anchor ?? 'start'} className="ls"><Tspans s={s} size={12.5} /></text>)}
          </g>
        ))}

        <g className="membranes">
          {bands.map((b) => {
            const horiz = b.w >= b.h;
            return (
              <g key={b.id} className="membrane">
                <rect x={b.x} y={b.y} width={b.w} height={b.h} rx={8} className="mem-body" fill={`url(#mem-${horiz ? 'v' : 'h'})`} />
                {horiz
                  ? <><path className="mem-heads" d={`M${b.x + 8},${b.y + 5} H${b.x + b.w - 8}`} /><path className="mem-heads" d={`M${b.x + 8},${b.y + b.h - 5} H${b.x + b.w - 8}`} /></>
                  : <><path className="mem-heads" d={`M${b.x + 5},${b.y + 8} V${b.y + b.h - 8}`} /><path className="mem-heads" d={`M${b.x + b.w - 5},${b.y + 8} V${b.y + b.h - 8}`} /></>}
              </g>
            );
          })}
          {captions.map((c, i) => <text key={i} className="caption lod-near" x={c.x} y={c.y} textAnchor={c.anchor ?? 'start'}><Tspans s={c.text} size={11} /></text>)}
        </g>

        {visEdges.map(renderLine)}
        {visEdges.map(renderLabel)}

        {showReg && renderReg()}

        {decor.map((d, i) => (
          <g key={i} className="proton lod-near" transform={`translate(${d.x},${d.y})`}>
            <path d={d.dir === 'down' ? 'M0,0 L0,26 M-6,20 L0,27 L6,20' : 'M0,26 L0,0 M-6,7 L0,0 L6,7'} />
            <text x={12} y={17}><Tspans s={d.label} size={12.5} /></text>
          </g>
        ))}

        {visNodes.map(renderNode)}

        {visRegions.map(renderFarTitle)}
      </svg>

      <div className="zoom" role="group" aria-label="Zoom">
        <button onClick={() => zoomBy(0.7)} aria-label="Zoom in" title="Zoom in">
          <svg width="16" height="16" viewBox="0 0 16 16"><path d="M8 3v10M3 8h10" /></svg>
        </button>
        <button onClick={() => zoomBy(1.4)} aria-label="Zoom out" title="Zoom out">
          <svg width="16" height="16" viewBox="0 0 16 16"><path d="M3 8h10" /></svg>
        </button>
        <button onClick={() => { const b = bounds.both; animate(fit({ x: b.x - 40, y: b.y - 40, w: b.w + 80, h: b.h + 80 })); }} aria-label="Fit the whole map" title="Whole map">
          <svg width="16" height="16" viewBox="0 0 16 16"><path d="M2.5 6V2.5H6M10 2.5h3.5V6M13.5 10v3.5H10M6 13.5H2.5V10" /></svg>
        </button>
      </div>
    </div>
  );
}

/** "?" chip standing in for a hidden reaction label. */
function QMark({ x, y, k, activate, onKey }: {
  x: number; y: number; k: string;
  activate: (s: Selection, h: string | null) => (ev: React.MouseEvent | React.KeyboardEvent) => void;
  onKey: (s: Selection, h: string | null) => (ev: React.KeyboardEvent) => void;
}) {
  return (
    <g className="qchip" transform={`translate(${x.toFixed(1)},${y.toFixed(1)})`} onClick={activate(null, k)} onKeyDown={onKey(null, k)}
      tabIndex={0} role="button" aria-label="Hidden label, click to reveal">
      <rect x={-17} y={-12} width={34} height={24} rx={4} />
      <text y={5} textAnchor="middle">?</text>
    </g>
  );
}

/** Two roughly equal lines for a long far-zoom title. */
function splitTitle(t: string): string[] {
  const words = t.split(' ');
  let best = [t], score = Infinity;
  for (let i = 1; i < words.length; i++) {
    const a = words.slice(0, i).join(' '), b = words.slice(i).join(' ');
    const s = Math.abs(a.length - b.length);
    if (s < score) { score = s; best = [a, b]; }
  }
  return best;
}
