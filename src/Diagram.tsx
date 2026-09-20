import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { decor } from './data/layout';
import { classById, enzById } from './data/enzymes';
import { molById } from './data/molecules';
import { regBlocks } from './data/regulation';
import type { RegBlock } from './data/regulation';
import { isHidden, nodeQuizKind, tagKey, type QuizState } from './quiz';
import type { CoKey, EnzClass, Edge, MapNode, Scene } from './data/types';

export type Selection = { kind: 'enz' | 'node' | 'card' | 'reg'; id: string } | null;
export interface View { x: number; y: number; w: number; h: number }

// ── labels ────────────────────────────────────────────────────────
/** Molecule nodes inherit the full name from molecules.ts; `label` is only an override. */
const labelOf = (n: MapNode): string => n.label ?? (n.mol ? molById[n.mol].name : n.id);
/** Enzymes show their full name on the map; `full` drops the parenthetical in `name`. */
const enzLabel = (id: string): string => enzById[id].full ?? enzById[id].name;

// ── text measuring & wrapping ─────────────────────────────────────
let ctx: CanvasRenderingContext2D | null = null;
const mcache = new Map<string, number>();
function measure(text: string, size: number, weight = 500): number {
  const key = `${weight}|${size}|${text}`;
  const hit = mcache.get(key);
  if (hit !== undefined) return hit;
  ctx ??= document.createElement('canvas').getContext('2d');
  let w = text.length * size * 0.58;
  if (ctx) { ctx.font = `${weight} ${size}px system-ui, -apple-system, "Segoe UI", sans-serif`; w = ctx.measureText(text).width; }
  mcache.set(key, w);
  return w;
}

const PILL_MAX = 152;
const TAGQ_W = 34, TAGQ_H = 24; // the "?" that stands in for a hidden reaction label
const LINE_H = 14;
const wcache = new Map<string, string[]>();

/** Greedy wrap so a full enzyme name fits its pill in at most a few lines. */
function wrapText(text: string, size: number, weight: number, max: number): string[] {
  const key = `${weight}|${size}|${max}|${text}`;
  const hit = wcache.get(key);
  if (hit) return hit;
  const lines: string[] = [];
  let cur = '';
  for (const word of text.split(' ')) {
    const next = cur ? `${cur} ${word}` : word;
    if (cur && measure(next, size, weight) > max) { lines.push(cur); cur = word; } else cur = next;
  }
  if (cur) lines.push(cur);
  wcache.set(key, lines);
  return lines;
}

interface PillBox { lines: string[]; w: number; h: number }
function pillBox(text: string): PillBox {
  const lines = wrapText(text, 12, 700, PILL_MAX);
  return { lines, w: Math.max(...lines.map((l) => measure(l, 12, 700))) + 18, h: lines.length * LINE_H + 8 };
}

/** Multi-line pill text, vertically centred on the pill. */
function PillText({ lines }: { lines: string[] }) {
  const top = -((lines.length - 1) * LINE_H) / 2 + 4.2;
  return (
    <text textAnchor="middle">
      {lines.map((l, i) => <tspan key={i} x={0} y={top + i * LINE_H}>{l}</tspan>)}
    </text>
  );
}

// ── geometry ──────────────────────────────────────────────────────
type P = { x: number; y: number };
interface Box { c: P; hw: number; hh: number }
const GAP = 4;

function nodeBox(n: MapNode): Box {
  const label = labelOf(n);
  switch (n.kind ?? 'met') {
    case 'cx': return { c: n, hw: (n.w ?? 84) / 2 + GAP, hh: 45 + GAP };
    case 'card': return { c: n, hw: (measure(label, 12.5, 600) + 44) / 2 + GAP, hh: 14 + GAP };
    case 'proc': return { c: n, hw: (measure(label, 13, 600) + 28) / 2 + GAP, hh: 18 + GAP };
    case 'small': return { c: n, hw: Math.max(44, measure(label, 13, 600) + 22) / 2 + GAP, hh: 13 + GAP };
    case 'etag': { const b = pillBox(enzLabel(n.enz!)); return { c: n, hw: b.w / 2 + GAP, hh: b.h / 2 + GAP }; }
    default: return { c: n, hw: Math.max(90, measure(label, 15, 600) + 28) / 2 + GAP, hh: 17 + GAP };
  }
}

function clip(b: Box, s: P, toward: P): P {
  const dx = toward.x - s.x, dy = toward.y - s.y;
  let t = Infinity;
  if (dx > 0) t = Math.min(t, (b.c.x + b.hw - s.x) / dx); else if (dx < 0) t = Math.min(t, (b.c.x - b.hw - s.x) / dx);
  if (dy > 0) t = Math.min(t, (b.c.y + b.hh - s.y) / dy); else if (dy < 0) t = Math.min(t, (b.c.y - b.hh - s.y) / dy);
  if (!isFinite(t) || t < 0) t = 0;
  return { x: s.x + dx * t, y: s.y + dy * t };
}

interface Routed { pts: P[]; mid: P }

function along(pts: P[], t: number): P {
  const segs = pts.slice(1).map((p, i) => Math.hypot(p.x - pts[i].x, p.y - pts[i].y));
  let target = segs.reduce((a, b) => a + b, 0) * t;
  for (let i = 0; i < segs.length; i++) {
    if (target <= segs[i] || i === segs.length - 1) {
      const f = segs[i] === 0 ? 0 : Math.min(1, target / segs[i]);
      return { x: pts[i].x + (pts[i + 1].x - pts[i].x) * f, y: pts[i].y + (pts[i + 1].y - pts[i].y) * f };
    }
    target -= segs[i];
  }
  return pts[0];
}

type NodeMap = Record<string, MapNode>;

function route(e: Edge, nodeMap: NodeMap): Routed {
  const A = nodeBox(nodeMap[e.from]), B = nodeBox(nodeMap[e.to]);
  let pts: P[];
  if (e.via) pts = [A.c, ...e.via.map(([x, y]) => ({ x, y })), B.c];
  else {
    let s = { ...A.c }, t = { ...B.c };
    if (e.off) {
      const dx = t.x - s.x, dy = t.y - s.y, L = Math.hypot(dx, dy) || 1;
      let nx = dy / L, ny = -dx / L;
      if (nx < -1e-6 || (Math.abs(nx) < 1e-6 && ny < 0)) { nx = -nx; ny = -ny; }
      s = { x: s.x + nx * e.off, y: s.y + ny * e.off }; t = { x: t.x + nx * e.off, y: t.y + ny * e.off };
    }
    pts = [s, t];
  }
  pts = pts.slice();
  pts[0] = clip(A, pts[0], pts[1]);
  pts[pts.length - 1] = clip(B, pts[pts.length - 1], pts[pts.length - 2]);
  return { pts, mid: along(pts, e.t ?? 0.5) };
}


// ── regulation blocks ─────────────────────────────────────────────
interface RegRow { sym: string; lines: string[]; w: number; h: number; kind: 'act' | 'inh' }
interface RegGeom { rows: RegRow[]; w: number; h: number; c: P; anchor: P }

const REG_MAX = 196;

function regGeom(r: RegBlock, nodeMap: NodeMap, routed: Map<string, Routed>): RegGeom {
  const rows: RegRow[] = [];
  const add = (kind: 'act' | 'inh', text: string) => {
    const lines = wrapText(text, 12, 600, REG_MAX);
    rows.push({ sym: kind === 'act' ? '\u2295' : '\u2296', lines, kind,
      w: Math.max(...lines.map((l) => measure(l, 12, 600))) + 42, h: lines.length * 13 + 11 });
  };
  if (r.act) add('act', r.act);
  if (r.inh) add('inh', r.inh);
  const anchor: P = 'edge' in r.anchor ? routed.get(r.anchor.edge)!.mid : { x: nodeMap[r.anchor.node].x, y: nodeMap[r.anchor.node].y };
  return {
    rows,
    w: Math.max(...rows.map((x) => x.w)),
    h: rows.reduce((a, b) => a + b.h, 0) + (rows.length - 1) * 5,
    c: { x: anchor.x + r.dx, y: anchor.y + r.dy },
    anchor,
  };
}

/** Node lookup, routed edges and regulation blocks for one scene; computed once per scene. */
interface Geometry { nodeMap: NodeMap; routed: Map<string, Routed>; regGeoms: Map<string, RegGeom> }
const geometries = new WeakMap<Scene, Geometry>();
function geometryOf(scene: Scene): Geometry {
  let g = geometries.get(scene);
  if (!g) {
    const nodeMap: NodeMap = Object.fromEntries(scene.nodes.map((n) => [n.id, n]));
    const routed = new Map(scene.edges.map((e) => [e.id, route(e, nodeMap)]));
    g = { nodeMap, routed, regGeoms: new Map(regBlocks.map((r) => [r.id, regGeom(r, nodeMap, routed)])) };
    geometries.set(scene, g);
  }
  return g;
}

// ── helpers ───────────────────────────────────────────────────────
const clsOf = (enz?: string): EnzClass[] => (enz ? enzById[enz].cls : []);
const colorOf = (enz?: string) => (enz ? classById[enzById[enz].cls[0]].color : '#94a3b8');

interface Props {
  scene: Scene;
  filter: Set<EnzClass>;
  co: Set<CoKey>;
  showReg: boolean;
  selection: Selection;
  onSelect: (s: Selection) => void;
  focus: { view: View; n: number };
  quiz: QuizState;
  onReveal: (key: string) => void;
}

export default function Diagram({ scene, filter, co, showReg, selection, onSelect, focus, quiz, onReveal }: Props) {
  const { nodeMap, routed, regGeoms } = geometryOf(scene);
  const { canvas, nodes, edges, regions, bands, captions } = scene;
  const wrap = useRef<HTMLDivElement>(null);
  const svg = useRef<SVGSVGElement>(null);
  const [size, setSize] = useState({ w: 1200, h: 800 });
  const [hoverEnz, setHoverEnz] = useState<string | null>(null);
  const drag = useRef<{ x: number; y: number; vx: number; vy: number; moved: boolean } | null>(null);
  const raf = useRef(0);
  const sizeRef = useRef(size); sizeRef.current = size;
  // The camera lives outside React: pan, pinch, wheel and animations only rewrite the SVG's viewBox attribute.
  // Going through state re-rendered every edge, pill and label (and re-measured their text) on each touch move,
  // which is what made panning lag on phones.
  const vbRef = useRef<View>({ x: 0, y: 0, w: 2300, h: 1400 });
  const setVb = useCallback((v: View) => {
    vbRef.current = v;
    svg.current?.setAttribute('viewBox', `${v.x} ${v.y} ${v.w} ${v.h}`);
  }, []);

  // fit a rectangle into the viewport aspect ratio
  const fit = useCallback((v: View, s = sizeRef.current): View => {
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
    const ro = new ResizeObserver(() => setSize({ w: el.clientWidth, h: el.clientHeight }));
    ro.observe(el);
    const s = { w: el.clientWidth, h: el.clientHeight };
    setSize(s);
    setVb(fit({ x: 560, y: 0, w: 1020, h: 1120 }, s));
    return () => ro.disconnect();
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
      const w = Math.min(Math.max(v.w * f, 350), 5200), k = w / v.w;
      const px = (ev.clientX - r.left) / r.width, py = (ev.clientY - r.top) / r.height;
      const cx = v.x + px * v.w, cy = v.y + py * v.h;
      setVb({ x: cx - px * v.w * k, y: cy - py * v.h * k, w, h: v.h * k });
    };
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, [setVb]);

  /**
   * Pointer gestures: one pointer pans, two pinch-zoom. Touch, pen and mouse all arrive as
   * pointer events, so there is a single code path. `drag.moved` suppresses the click that
   * would otherwise follow a pan or pinch.
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
      const w = Math.min(Math.max(g.vb.w * (g.d / dist), 350), 5200);
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
    const v = vbRef.current, s = sizeRef.current;
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
    if (hiddenKey) onReveal(hiddenKey); else onSelect(s);
  };
  const onKey = (s: Selection, hiddenKey: string | null) => (ev: React.KeyboardEvent) => {
    if (ev.key === 'Enter' || ev.key === ' ') { ev.preventDefault(); activate(s, hiddenKey)(ev); }
  };

  const zoomBy = (f: number) => {
    const v = vbRef.current, w = Math.min(Math.max(v.w * f, 350), 5200), k = w / v.w;
    animate({ x: v.x + (v.w - v.w * k) / 2, y: v.y + (v.h - v.h * k) / 2, w, h: v.h * k });
  };

  // ── filter state ────────────────────────────────────────────────
  const filtering = filter.size > 0 || co.size > 0;
  const clsOk = (e: Edge) => filter.size === 0 || clsOf(e.enz).some((c) => filter.has(c));
  const coOk = (e: Edge) => co.size === 0 || !!e.co?.some((c) => co.has(c));
  const edgeOn = (e: Edge) => clsOk(e) && coOk(e);
  const activeNodes = useMemo(() => {
    const s = new Set<string>();
    if (!filtering) return s;
    edges.forEach((e) => { if (edgeOn(e)) { s.add(e.from); s.add(e.to); if (e.feed) s.add(e.feed); if (e.out) s.add(e.out); } });
    return s;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter, co, scene]);
  const nodeOn = (n: MapNode) => {
    if (!filtering) return true;
    if (n.kind === 'card') return true;
    if (n.enz && co.size === 0) return clsOf(n.enz).some((c) => filter.has(c));
    return activeNodes.has(n.id);
  };

  const selEnz = selection?.kind === 'enz' ? selection.id : null;

  // ── renderers ───────────────────────────────────────────────────
  const renderEdge = (e: Edge) => {
    const r = routed.get(e.id)!;
    const color = e.style === 'link' || e.style === 'plain' || !e.enz ? '#94a3b8' : colorOf(e.enz);
    const enz = e.enz ? enzById[e.enz] : undefined;
    const irrev = enz?.rev === false;
    const on = edgeOn(e);
    const hot = !!enz && (hoverEnz === enz.id || selEnz === enz.id);
    const d = r.pts.map((p, i) => `${i ? 'L' : 'M'}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');
    const sw = e.style === 'link' ? 1.5 : irrev ? 4.5 : 2.6;
    const dash = e.style === 'gng' ? '10 6' : e.style === 'link' ? '4 4' : undefined;
    const marker = e.style === 'link' ? undefined : `url(#ah-${e.style === 'plain' || !e.enz ? 'grey' : enz!.cls[0]})`;
    const clickable = !!enz && e.style !== 'link';
    const sel: Selection = enz ? { kind: 'enz', id: enz.id } : null;

    const showPill = !!enz && !e.noPill && e.style !== 'link';
    const hidden = showPill && isHidden(quiz, 'enz', enz!.id);
    const tagHidden = !!e.tags && isHidden(quiz, 'tag', tagKey(e));
    const box = !showPill ? { lines: [] as string[], w: 0, h: 0 } : hidden ? { lines: ['?'], w: 42, h: 24 } : pillBox(enzLabel(enz!.id));
    const p = r.mid;
    let tx = p.x, ty = p.y, anchor: 'start' | 'end' | 'middle' = 'middle';
    const pos = e.tagPos ?? 'r';
    if (pos === 'r') { tx = p.x + box.w / 2 + 8; ty = p.y + 4; anchor = 'start'; }
    else if (pos === 'l') { tx = p.x - box.w / 2 - 8; ty = p.y + 4; anchor = 'end'; }
    else if (pos === 'below') { ty = p.y + box.h / 2 + 14; }
    else { ty = p.y - box.h / 2 - 7; }

    // dashed feed line from a co-substrate node into the arrow
    let feed: React.JSX.Element | null = null;
    if (e.feed) {
      const F = nodeBox(nodeMap[e.feed]);
      const s = clip(F, F.c, p);
      feed = <path d={`M${s.x},${s.y} L${p.x},${p.y}`} className="feedline" stroke={color} markerEnd={`url(#ah-${enz!.cls[0]})`} />;
    }

    // dotted arrow from the pill to a co-product node
    let outLine: React.JSX.Element | null = null;
    if (e.out) {
      const O = nodeBox(nodeMap[e.out]);
      const t = clip(O, O.c, p);
      outLine = <path d={`M${p.x},${p.y} L${t.x},${t.y}`} className="feedline" stroke={color} markerEnd={`url(#ah-${enz!.cls[0]})`} />;
    }

    return (
      <g key={e.id} className={`edge${on ? '' : ' off'}${hot ? ' hot' : ''}`}
        onMouseEnter={() => enz && setHoverEnz(enz.id)} onMouseLeave={() => setHoverEnz(null)}>
        {feed}
        {outLine}
        <path d={d} className="edge-line" stroke={color} strokeWidth={sw} strokeDasharray={dash} fill="none"
          markerEnd={marker} markerStart={e.dir === 'both' ? marker : undefined} />
        {clickable && <path d={d} className="edge-hit" onClick={activate(sel, null)} />}
        {e.tags && (tagHidden
          ? (
            // the label's text stays out of the DOM entirely; the "?" sits where the text would start
            <g className="pill hidden" transform={`translate(${anchor === 'start' ? tx + TAGQ_W / 2 : anchor === 'end' ? tx - TAGQ_W / 2 : tx},${ty - 4 + (pos === 'above' ? -6 : pos === 'below' ? 6 : 0)})`}
              onClick={activate(null, tagKey(e))} onKeyDown={onKey(null, tagKey(e))} tabIndex={0} role="button" aria-label="Hidden label, click to reveal">
              <rect x={-TAGQ_W / 2} y={-TAGQ_H / 2} width={TAGQ_W} height={TAGQ_H} rx={9} />
              <PillText lines={['?']} />
            </g>
          )
          : <text x={tx} y={ty} textAnchor={anchor} className="tag">{e.tags}</text>)}
        {showPill && (
          <g className={`pill${hidden ? ' hidden' : ''}`} transform={`translate(${p.x},${p.y})`}
            onClick={activate(sel, hidden ? enz!.id : null)} onKeyDown={onKey(sel, hidden ? enz!.id : null)}
            tabIndex={0} role="button" aria-label={hidden ? 'Hidden enzyme name, click to reveal' : enz!.name}>
            <rect x={-box.w / 2} y={-box.h / 2} width={box.w} height={box.h} rx={11} style={hidden ? undefined : { fill: color }} />
            <PillText lines={box.lines} />
          </g>
        )}
      </g>
    );
  };

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
    const cls = `node kind-${kind}${on ? '' : ' off'}${isSel ? ' selected' : ''}${interactive ? ' clickable' : ''}${hidden ? ' hidden' : ''}`;

    if (kind === 'etag') {
      const col = classById[enzById[n.enz!].cls[0]].color;
      const lines = hidden ? ['?'] : pillBox(enzLabel(n.enz!)).lines;
      const link = n.link ? nodeMap[n.link] : null;
      const lp = link ? clip(nodeBox(link), link, n) : null;
      const sp = link ? clip(b, n, link) : null;
      return (
        <g key={n.id} className={cls} {...props} onMouseEnter={() => setHoverEnz(n.enz!)} onMouseLeave={() => setHoverEnz(null)}>
          {lp && sp && <path d={`M${sp.x},${sp.y} L${lp.x},${lp.y}`} className="feedline" stroke={col} />}
          <g transform={`translate(${n.x},${n.y})`} className={`pill${hidden ? ' hidden' : ''}`}>
            <rect x={-hw} y={-hh} width={hw * 2} height={hh * 2} rx={11} style={hidden ? undefined : { fill: col }} />
            <PillText lines={lines} />
          </g>
        </g>
      );
    }
    if (kind === 'cx') {
      const col = classById[enzById[n.enz!].cls[0]].color;
      return (
        <g key={n.id} className={cls} {...props} transform={`translate(${n.x},${n.y})`}>
          <rect x={-hw} y={-hh} width={hw * 2} height={hh * 2} rx={12} fill={col} fillOpacity={0.14} stroke={col} strokeWidth={2.5} />
          <text y={7} textAnchor="middle" className="cx-label" fill={col}>{label}</text>
        </g>
      );
    }
    if (kind === 'card') {
      return (
        <g key={n.id} className={cls} {...props} transform={`translate(${n.x},${n.y})`}>
          <rect x={-hw} y={-hh} width={hw * 2} height={hh * 2} rx={hh} />
          <circle cx={-hw + 15} cy={0} r={7.5} className="i-dot" />
          <text x={-hw + 15} y={3.8} textAnchor="middle" className="i-mark">i</text>
          <text x={-hw + 28} y={4.2} className="card-label">{label}</text>
        </g>
      );
    }
    return (
      <g key={n.id} className={cls} {...props} transform={`translate(${n.x},${n.y})`}>
        <rect x={-hw} y={-hh} width={hw * 2} height={hh * 2} rx={kind === 'small' ? 8 : hh} />
        <text y={kind === 'small' ? 4.5 : 5.2} textAnchor="middle" className="node-label">{label}</text>
        {n.badge && !hidden && <text x={hw + 6} y={4} className="badge">{n.badge}</text>}
      </g>
    );
  };

  return (
    <div className="canvas" ref={wrap}>
      <svg ref={svg} onPointerDown={onPointerDown} onClick={() => { if (!drag.current?.moved) onSelect(null); }}
        role="img" aria-label="Carbohydrate metabolism pathway map">
        <defs>
          {[...Object.values(classById).map((c) => [c.id, c.color] as const), ['grey', '#94a3b8'] as const].map(([id, col]) => (
            <marker key={id} id={`ah-${id}`} viewBox="0 0 10 10" refX="8" refY="5" markerWidth="13" markerHeight="13" markerUnits="userSpaceOnUse" orient="auto-start-reverse">
              <path d="M0,0.5 L10,5 L0,9.5 z" fill={col} />
            </marker>
          ))}
        </defs>

        <rect x={-2000} y={-2000} width={canvas.w + 4000} height={canvas.h + 4000} className="bg" />

        {regions.map((r) => (
          <g key={r.id} className="region">
            <rect x={r.x} y={r.y} width={r.w} height={r.h} rx={22} fill={r.tone} />
            <text x={r.right ? r.x + r.w - 20 : r.x + 20} y={r.y + 30} textAnchor={r.right ? 'end' : 'start'} className="region-title">{r.title}</text>
          </g>
        ))}

        {/* glycolysis phase captions */}
        <g className="phase">
          <text x={650} y={430}>PREPARATORY PHASE</text><text x={650} y={446} className="s">steps 1–5 · spends 2 ATP</text>
          <text x={650} y={1180}>PAYOFF PHASE</text><text x={650} y={1196} className="s">steps 6–10 · makes</text><text x={650} y={1211} className="s">4 ATP + 2 NADH</text>
        </g>

        {/* inner membrane */}
        <g className="membrane">
          <rect x={800} y={3395} width={1430} height={110} rx={10} />
          <text x={790} y={3250} className="region-title sub">OXIDATIVE PHOSPHORYLATION · inner mitochondrial membrane</text>
          <text x={2380} y={3375} textAnchor="end">MATRIX ↑</text>
          <text x={2380} y={3560} textAnchor="end">↓ INTERMEMBRANE SPACE</text>
        </g>
        <text x={1560} y={2610} textAnchor="middle" className="region-title sub">CITRIC ACID CYCLE</text>

        {/* membrane strips + captions of the two NADH-shuttle diagrams */}
        <g className="membrane">
          {bands.map((b) => <rect key={b.id} x={b.x} y={b.y} width={b.w} height={b.h} rx={10} />)}
          {captions.map((c, i) => <text key={i} x={c.x} y={c.y} textAnchor={c.anchor ?? 'start'}>{c.text}</text>)}
        </g>

        {edges.map(renderEdge)}

        {showReg && regBlocks.map((r) => {
          const g = regGeoms.get(r.id)!;
          const box: Box = { c: g.c, hw: g.w / 2 + 6, hh: g.h / 2 + 6 };
          const from = clip(box, g.c, g.anchor);
          const to = 'edge' in r.anchor ? g.anchor : clip(nodeBox(nodeMap[r.anchor.node]), g.anchor, g.c);
          // an inhibitor-only block ends in the ⊣ bar that means "inhibits"
          const bar = !r.act;
          const dx = to.x - from.x, dy = to.y - from.y, L = Math.hypot(dx, dy) || 1;
          const ex = to.x - (dx / L) * 5, ey = to.y - (dy / L) * 5;
          const nx = (-dy / L) * 9, ny = (dx / L) * 9;
          let top = -g.h / 2;
          return (
            <g key={r.id} className={`reg${r.act ? '' : ' inh-only'}`} onClick={activate({ kind: 'reg', id: r.id }, null)}
              onKeyDown={onKey({ kind: 'reg', id: r.id }, null)} tabIndex={0} role="button" aria-label={`Regulation of ${r.title}`}>
              <path className="reg-line" d={`M${from.x},${from.y} L${ex},${ey}`} />
              {bar
                ? <path className="reg-bar" d={`M${ex - nx},${ey - ny} L${ex + nx},${ey + ny}`} />
                : <circle className="reg-dot" cx={ex} cy={ey} r={4} />}
              {g.rows.map((row, i) => {
                const y = top + row.h / 2; top += row.h + 5;
                return (
                  <g key={i} className={`reg-row ${row.kind}`} transform={`translate(${g.c.x},${g.c.y + y})`}>
                    <rect x={-g.w / 2} y={-row.h / 2} width={g.w} height={row.h} rx={7} />
                    <text className="reg-sym" x={-g.w / 2 + 14} y={4.5} textAnchor="middle">{row.sym}</text>
                    <text className="reg-text" x={-g.w / 2 + 27}>
                      {row.lines.map((l, k) => (
                        <tspan key={k} x={-g.w / 2 + 27} y={-((row.lines.length - 1) * 13) / 2 + k * 13 + 4.2}>{l}</tspan>
                      ))}
                    </text>
                  </g>
                );
              })}
            </g>
          );
        })}

        {decor.map((d, i) => (
          <g key={i} className="proton" transform={`translate(${d.x},${d.y})`}>
            <path d={d.dir === 'down' ? 'M0,0 L0,26 M-6,20 L0,27 L6,20' : 'M0,26 L0,0 M-6,7 L0,0 L6,7'} />
            <text x={12} y={17}>{d.label}</text>
          </g>
        ))}

        {nodes.map(renderNode)}
      </svg>

      <div className="zoom">
        <button onClick={() => zoomBy(0.7)} aria-label="Zoom in">+</button>
        <button onClick={() => zoomBy(1.4)} aria-label="Zoom out">−</button>
        <button onClick={() => animate(fit({ x: 0, y: 0, w: canvas.w, h: canvas.h }))} aria-label="Fit whole map" title="Whole map">⤢</button>
      </div>
    </div>
  );
}
