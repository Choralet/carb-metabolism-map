import { regById } from './data/regulation';
import { examOfSlide, inExam, type ExamTag, type Region, type Scene, type Scope } from './data/types';
import type { Selection, View } from './Diagram';
import { geometryOf } from './map/geometry';

/** One spot on the map where something is drawn. */
export interface Place { x: number; y: number; plate?: Region; exam: ExamTag; nodeId?: string }

const exam = (x: { exam?: ExamTag }): ExamTag => x.exam ?? 'mid';

/** Every place a selection appears (an enzyme can label several arrows; a molecule can be drawn on several plates). */
export function placesOf(sel: NonNullable<Selection>, scene: Scene): Place[] {
  const g = geometryOf(scene);
  const out: Place[] = [];
  if (sel.kind === 'enz') {
    scene.edges.forEach((e) => {
      if (e.enz !== sel.id || e.style === 'link') return;
      const m = g.routed.get(e.id)!.mid;
      out.push({ x: m.x, y: m.y, plate: g.edgePlate.get(e.id), exam: exam(e) });
    });
    scene.nodes.forEach((n) => { if (n.enz === sel.id) out.push({ x: n.x, y: n.y, plate: g.plateOf.get(n.id), exam: exam(n), nodeId: n.id }); });
  } else if (sel.kind === 'node') {
    const n = g.nodeMap[sel.id];
    if (n) out.push({ x: n.x, y: n.y, plate: g.plateOf.get(n.id), exam: exam(n), nodeId: n.id });
  } else if (sel.kind === 'card') {
    scene.nodes.forEach((n) => { if (n.card === sel.id) out.push({ x: n.x, y: n.y, plate: g.plateOf.get(n.id), exam: exam(n), nodeId: n.id }); });
  } else {
    // a regulation box belongs to the slides it cites, whatever exam its arrow is shared with
    const r = regById[sel.id];
    if (r) {
      if ('edge' in r.anchor) {
        const e = scene.edges.find((x) => x.id === (r.anchor as { edge: string }).edge);
        const m = e && g.routed.get(e.id)?.mid;
        if (e && m) out.push({ x: m.x, y: m.y, plate: g.edgePlate.get(e.id), exam: examOfSlide(r.slide) });
      } else {
        const n = g.nodeMap[r.anchor.node];
        if (n) out.push({ x: n.x, y: n.y, plate: g.plateOf.get(n.id), exam: examOfSlide(r.slide), nodeId: n.id });
      }
    }
  }
  return out;
}

/** Nodes drawing a given molecule (e.g. oxaloacetate appears in gluconeogenesis, the cycle and both shuttles). */
export function molPlaces(molId: string, scene: Scene): Place[] {
  const g = geometryOf(scene);
  return scene.nodes
    .filter((n) => n.mol === molId || n.mols?.includes(molId))
    .map((n) => ({ x: n.x, y: n.y, plate: g.plateOf.get(n.id), exam: exam(n), nodeId: n.id }));
}

/** Prefer a place the exam switch highlights. */
export const bestPlace = (ps: Place[], scope: Scope) => ps.find((p) => inExam(p.exam, scope)) ?? ps[0];

export const viewAround = (p: { x: number; y: number }, w = 900, h = 620): View => ({ x: p.x - w / 2, y: p.y - h / 2, w, h });

/** Portrait phones get their own layout and camera framing. */
export const PHONE_QUERY = '(max-width: 720px)';

/**
 * How to frame a plate: all of it (every rectangle of an L-shaped plate), or on a phone the top of it at reading size,
 * on the side its title is (a whole plate on a phone is too small to read, and the labels switch off).
 */
export function regionView(r: Region, phone = window.matchMedia(PHONE_QUERY).matches): View {
  if (phone) { const w = Math.min(r.w, 620); return { x: r.right ? r.x + r.w - w : r.x, y: r.y - 24, w, h: 1160 }; }
  const all = [r, ...(r.more ?? [])];
  const x0 = Math.min(...all.map((q) => q.x)), y0 = Math.min(...all.map((q) => q.y));
  const x1 = Math.max(...all.map((q) => q.x + q.w)), y1 = Math.max(...all.map((q) => q.y + q.h));
  return { x: x0 - 30, y: y0 - 40, w: x1 - x0 + 60, h: y1 - y0 + 70 };
}
