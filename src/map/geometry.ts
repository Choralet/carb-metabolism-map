import { enzById } from '../data/enzymes';
import { molById } from '../data/molecules';
import { regBlocks, type RegBlock } from '../data/regulation';
import type { Edge, Exam, MapNode, Region, Scene } from '../data/types';
import { measure, onTextReset, wrap } from '../text';

export type P = { x: number; y: number };
export interface Box { c: P; hw: number; hh: number }
export type Anchor = 'start' | 'middle' | 'end';

/** Type sizes on the map, in map units (1 unit = 1 CSS px at 100% zoom). Measuring and drawing both read these. */
export const TY = {
  met: 16, small: 13, proc: 14, card: 13, cx: 15,
  enz: 12.5, enzLine: 15, enzMax: 150,
  tag: 12, xref: 12.5, xrefSub: 10,
  reg: 12, regLine: 13.5, regMax: 196,
};
/** Clearance between a box and the arrow that stops at it. */
export const GAP = 4;

export const labelOf = (n: MapNode): string => n.label ?? (n.mol ? molById[n.mol].name : n.id);
/** Enzymes show their full name on the map; `full` drops the parenthetical in `name`. */
export const enzLabel = (id: string): string => enzById[id].full ?? enzById[id].name;

/** Enzyme label: a type marker plus the wrapped name, on a paper-coloured knockout that interrupts the arrow. */
export interface LabelBox { lines: string[]; w: number; h: number }
export function enzBox(id: string): LabelBox {
  const lines = wrap(enzLabel(id), TY.enz, 500, 'sans', TY.enzMax);
  const tw = Math.max(...lines.map((l) => measure(l, TY.enz, 500, 'sans')));
  return { lines, w: tw + 27, h: lines.length * TY.enzLine + 7 };
}
export const HIDDEN_BOX: LabelBox = { lines: ['?'], w: 40, h: 24 };

export function nodeBox(n: MapNode): Box {
  const label = labelOf(n);
  switch (n.kind ?? 'met') {
    case 'cx': return { c: n, hw: (n.w ?? 84) / 2 + GAP, hh: 45 + GAP };
    case 'card': return { c: n, hw: (measure(label, TY.card, 500, 'serif', true) + 36) / 2 + GAP, hh: 12 + GAP };
    case 'proc': return { c: n, hw: (measure(label, TY.proc, 500, 'serif', true) + 30) / 2 + GAP, hh: 16 + GAP };
    case 'small': return { c: n, hw: Math.max(24, measure(label, TY.small, 600, 'sans') / 2 + 11) + GAP, hh: 12 + GAP };
    case 'etag': { const b = enzBox(n.enz!); return { c: n, hw: b.w / 2 + GAP, hh: b.h / 2 + GAP }; }
    case 'xref': return { c: n, hw: measure(label, TY.xref, 500, 'serif', true) / 2 + GAP, hh: 16 + GAP };
    default: return { c: n, hw: Math.max(34, measure(label, TY.met, 600, 'serif') / 2 + 10) + GAP, hh: 14 + GAP };
  }
}

/** Where the segment from `s` toward `toward` leaves box `b`. */
export function clip(b: Box, s: P, toward: P): P {
  const dx = toward.x - s.x, dy = toward.y - s.y;
  let t = Infinity;
  if (dx > 0) t = Math.min(t, (b.c.x + b.hw - s.x) / dx); else if (dx < 0) t = Math.min(t, (b.c.x - b.hw - s.x) / dx);
  if (dy > 0) t = Math.min(t, (b.c.y + b.hh - s.y) / dy); else if (dy < 0) t = Math.min(t, (b.c.y - b.hh - s.y) / dy);
  if (!isFinite(t) || t < 0) t = 0;
  return { x: s.x + dx * t, y: s.y + dy * t };
}

/** Point at fraction t of a polyline's length, and the unit direction of the segment it lies on. */
function along(pts: P[], t: number): { p: P; d: P } {
  const segs = pts.slice(1).map((p, i) => Math.hypot(p.x - pts[i].x, p.y - pts[i].y));
  let target = segs.reduce((a, b) => a + b, 0) * t;
  for (let i = 0; i < segs.length; i++) {
    if (target <= segs[i] || i === segs.length - 1) {
      const f = segs[i] === 0 ? 0 : Math.min(1, target / segs[i]);
      const L = segs[i] || 1;
      return {
        p: { x: pts[i].x + (pts[i + 1].x - pts[i].x) * f, y: pts[i].y + (pts[i + 1].y - pts[i].y) * f },
        d: { x: (pts[i + 1].x - pts[i].x) / L, y: (pts[i + 1].y - pts[i].y) / L },
      };
    }
    target -= segs[i];
  }
  return { p: pts[0], d: { x: 1, y: 0 } };
}

export interface Routed { pts: P[]; mid: P; dir: P }
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
  const { p, d } = along(pts, e.t ?? 0.5);
  return { pts, mid: p, dir: d };
}

/**
 * ⇌ drawn the textbook way: two half-arrows side by side, the forward one on the left of the direction of travel.
 * Returns one path (both shafts and both barbs).
 */
export function harpoonPath(s: P, e: P, o = 3.2): string {
  const L = Math.hypot(e.x - s.x, e.y - s.y) || 1;
  const d = { x: (e.x - s.x) / L, y: (e.y - s.y) / L };
  const n = { x: d.y, y: -d.x };
  const f1 = { x: s.x + n.x * o, y: s.y + n.y * o }, f2 = { x: e.x + n.x * o, y: e.y + n.y * o };
  const b1 = { x: e.x - n.x * o, y: e.y - n.y * o }, b2 = { x: s.x - n.x * o, y: s.y - n.y * o };
  const barbF = { x: f2.x - d.x * 11 + n.x * 6, y: f2.y - d.y * 11 + n.y * 6 };
  const barbB = { x: b2.x + d.x * 11 - n.x * 6, y: b2.y + d.y * 11 - n.y * 6 };
  const f = (p: P) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`;
  return `M${f(f1)} L${f(f2)} L${f(barbF)} M${f(b1)} L${f(b2)} L${f(barbB)}`;
}

// ── cofactor arcs ───────────────────────────────────────────────────
/** "ATP → ADP" → in/out; "+ H₂O" → in only; "− CO₂" → out only; anything else stays a plain note. */
export function tagParts(s: string): { inn?: string; out?: string; plain?: string } {
  const i = s.indexOf('→');
  if (i >= 0) {
    const inn = s.slice(0, i).trim(), out = s.slice(i + 1).trim();
    return { inn: inn || undefined, out: out || undefined };
  }
  const t = s.trim();
  if (t.startsWith('+')) return { inn: t.slice(1).trim() };
  if (t.startsWith('−') || t.startsWith('-')) return { out: t.slice(1).trim() };
  return { plain: s };
}

export type Side = 'r' | 'l' | 'below' | 'above';
const NORMAL: Record<Side, P> = { r: { x: 1, y: 0 }, l: { x: -1, y: 0 }, below: { x: 0, y: 1 }, above: { x: 0, y: -1 } };

/** Centre of an edge's enzyme label: on the arrow, or beside it when `lab` says so. */
export function labelCenter(e: Edge, mid: P, box: { w: number; h: number }): P {
  if (!e.lab) return mid;
  const n = { r: { x: 1, y: 0 }, l: { x: -1, y: 0 }, below: { x: 0, y: 1 }, above: { x: 0, y: -1 } }[e.lab];
  const off = (n.x ? box.w / 2 : box.h / 2) + 6;
  return { x: mid.x + n.x * off, y: mid.y + n.y * off };
}

/** `measure` for text drawn with CSS letter-spacing (em), which canvas measuring does not include. */
export const spaced = (text: string, size: number, weight: number, fam: 'mono' | 'sans', em: number) =>
  measure(text, size, weight, fam) + [...text].length * size * em;

export interface Arc { d: string; head: boolean; inAt: P; outAt: P; inAnchor: Anchor; outAnchor: Anchor; q: P; qAnchor: Anchor }

/**
 * The curved side arrow of textbook figures: the co-substrate comes in upstream, touches the reaction at the enzyme
 * label, and the co-product leaves downstream. `box` is the enzyme label sitting on the arrow (0×0 when there is none).
 */
export function arcGeom(p: P, box: { w: number; h: number }, side: Side, dir: P, has: { inn: boolean; out: boolean }): Arc {
  const n = NORMAL[side];
  let a = { x: dir.x - (dir.x * n.x + dir.y * n.y) * n.x, y: dir.y - (dir.x * n.x + dir.y * n.y) * n.y };
  let L0 = Math.hypot(a.x, a.y);
  if (L0 < 0.2) { a = n.x ? { x: 0, y: 1 } : { x: 1, y: 0 }; L0 = 1; }
  a = { x: a.x / L0, y: a.y / L0 };
  const off = (n.x ? box.w / 2 : box.h / 2) + 3;
  const R = 24, L = 15;
  const at = (k: number, m: number): P => ({ x: p.x + n.x * k + a.x * m, y: p.y + n.y * k + a.y * m });
  const base = at(off, 0), S = at(off + R, -L), E = at(off + R, L);
  const f = (q: P) => `${q.x.toFixed(1)},${q.y.toFixed(1)}`;
  let d: string;
  if (has.inn && has.out) d = `M${f(S)} Q${f(at(off - R, 0))} ${f(E)}`;
  else if (has.inn) d = `M${f(S)} Q${f(at(off + R * 0.1, -L))} ${f(base)}`;
  else d = `M${f(base)} Q${f(at(off + R * 0.1, L))} ${f(E)}`;
  const vertical = Math.abs(n.x) > 0.5;
  const inAnchor: Anchor = vertical ? (n.x > 0 ? 'start' : 'end') : (a.x > 0 ? 'end' : 'start');
  const outAnchor: Anchor = vertical ? inAnchor : (a.x > 0 ? 'start' : 'end');
  const lab = (q: P, sign: number): P => vertical
    ? { x: q.x + n.x * 5, y: q.y + 4.2 }
    : { x: q.x + a.x * 5 * sign, y: q.y + (n.y > 0 ? 8 : 0) };
  return {
    d, head: true,
    inAt: lab(S, -1), outAt: lab(E, 1), inAnchor, outAnchor,
    q: vertical ? { x: base.x + n.x * (R + 8), y: base.y + 4 } : { x: base.x, y: base.y + n.y * (R + 10) + 4 },
    qAnchor: vertical ? inAnchor : 'middle',
  };
}

// ── regulation blocks ───────────────────────────────────────────────
export interface RegRow { lines: string[]; w: number; h: number; kind: 'act' | 'inh' }
export interface RegGeom { rows: RegRow[]; w: number; h: number; c: P; anchor: P }

function regGeom(r: RegBlock, nodeMap: NodeMap, routed: Map<string, Routed>): RegGeom | null {
  const anchorOk = 'edge' in r.anchor ? routed.has(r.anchor.edge) : !!nodeMap[r.anchor.node];
  if (!anchorOk) return null;
  const rows: RegRow[] = [];
  const add = (kind: 'act' | 'inh', text: string) => {
    const lines = wrap(text, TY.reg, 500, 'sans', TY.regMax);
    rows.push({ lines, kind, w: Math.max(...lines.map((l) => measure(l, TY.reg, 500, 'sans'))) + 38, h: lines.length * TY.regLine + 10 });
  };
  if (r.act) add('act', r.act);
  if (r.inh) add('inh', r.inh);
  const anchor: P = 'edge' in r.anchor ? routed.get(r.anchor.edge)!.mid : { x: nodeMap[r.anchor.node].x, y: nodeMap[r.anchor.node].y };
  return {
    rows,
    w: Math.max(...rows.map((x) => x.w)),
    h: rows.reduce((s, x) => s + x.h, 0) + (rows.length - 1) * 5,
    c: { x: anchor.x + r.dx, y: anchor.y + r.dy },
    anchor,
  };
}

// ── per-scene geometry ──────────────────────────────────────────────
export interface Bounds { x: number; y: number; w: number; h: number }
export interface Geometry {
  nodeMap: NodeMap;
  routed: Map<string, Routed>;
  regGeoms: Map<string, RegGeom>;
  /** The plate a node sits on (by position). */
  plateOf: Map<string, Region>;
  /** Bounding box of each exam's plates, for "fit" and the start view. */
  bounds: Record<Exam | 'both', Bounds>;
  /** Vertical strip between the midterm and final plates, if both exist. */
  seam: { x: number; w: number; y: number; h: number } | null;
}

let geometries = new WeakMap<Scene, Geometry>();
onTextReset(() => { geometries = new WeakMap(); });

const inRect = (r: Region, p: P) => p.x >= r.x && p.x <= r.x + r.w && p.y >= r.y && p.y <= r.y + r.h;
function union(rs: Region[]): Bounds {
  if (!rs.length) return { x: 0, y: 0, w: 1000, h: 1000 };
  const x = Math.min(...rs.map((r) => r.x)), y = Math.min(...rs.map((r) => r.y));
  return { x, y, w: Math.max(...rs.map((r) => r.x + r.w)) - x, h: Math.max(...rs.map((r) => r.y + r.h)) - y };
}

export function geometryOf(scene: Scene): Geometry {
  let g = geometries.get(scene);
  if (g) return g;
  const nodeMap: NodeMap = Object.fromEntries(scene.nodes.map((n) => [n.id, n]));
  const routed = new Map(scene.edges.map((e) => [e.id, route(e, nodeMap)]));
  const regGeoms = new Map<string, RegGeom>();
  regBlocks.forEach((r) => { const rg = regGeom(r, nodeMap, routed); if (rg) regGeoms.set(r.id, rg); });
  const plateOf = new Map<string, Region>();
  scene.nodes.forEach((n) => { const r = scene.regions.find((x) => inRect(x, n)); if (r) plateOf.set(n.id, r); });
  const mid = scene.regions.filter((r) => r.part === 'I' || r.part === 'II');
  const fin = scene.regions.filter((r) => r.part === 'III' || r.part === 'IV');
  const bounds = { mid: union(mid), final: union(fin.length ? fin : mid), both: union(scene.regions) };
  let seam: Geometry['seam'] = null;
  if (mid.length && fin.length) {
    const a = bounds.mid.x + bounds.mid.w, b = bounds.final.x;
    seam = { x: a, w: b - a, y: Math.min(bounds.mid.y, bounds.final.y) - 20, h: Math.max(bounds.mid.h, bounds.final.h) + 40 };
  }
  g = { nodeMap, routed, regGeoms, plateOf, bounds, seam };
  geometries.set(scene, g);
  return g;
}
