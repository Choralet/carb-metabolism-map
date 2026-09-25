import { regById } from './data/regulation';
import { inExam, type ExamTag, type Region, type Scene, type Scope } from './data/types';
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
      out.push({ x: m.x, y: m.y, plate: g.plateOf.get(e.from) ?? g.plateOf.get(e.to), exam: exam(e) });
    });
    scene.nodes.forEach((n) => { if (n.enz === sel.id) out.push({ x: n.x, y: n.y, plate: g.plateOf.get(n.id), exam: exam(n), nodeId: n.id }); });
  } else if (sel.kind === 'node') {
    const n = g.nodeMap[sel.id];
    if (n) out.push({ x: n.x, y: n.y, plate: g.plateOf.get(n.id), exam: exam(n), nodeId: n.id });
  } else if (sel.kind === 'card') {
    scene.nodes.forEach((n) => { if (n.card === sel.id) out.push({ x: n.x, y: n.y, plate: g.plateOf.get(n.id), exam: exam(n), nodeId: n.id }); });
  } else {
    const r = regById[sel.id];
    if (r) {
      if ('edge' in r.anchor) {
        const e = scene.edges.find((x) => x.id === (r.anchor as { edge: string }).edge);
        const m = e && g.routed.get(e.id)?.mid;
        if (e && m) out.push({ x: m.x, y: m.y, plate: g.plateOf.get(e.from), exam: exam(e) });
      } else {
        const n = g.nodeMap[r.anchor.node];
        if (n) out.push({ x: n.x, y: n.y, plate: g.plateOf.get(n.id), exam: exam(n), nodeId: n.id });
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
 * How to frame a plate: all of it, or on a phone the top of it at reading size (a whole plate on a phone is too small
 * to read, and the labels switch off).
 */
export const regionView = (r: Region, phone = window.matchMedia(PHONE_QUERY).matches): View =>
  phone ? { x: r.x, y: r.y - 24, w: Math.min(r.w, 620), h: 1160 } : { x: r.x - 30, y: r.y - 40, w: r.w + 60, h: r.h + 70 };
