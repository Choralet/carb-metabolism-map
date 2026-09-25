import type { Band, Caption, Edge, JumpView, Label, MapNode, Part, Region, Scene } from './types';

/**
 * A plate of the final-exam wing, written in its own coordinates (0,0 = the plate's top-left corner) and dropped into
 * place by `place()`, so a plate can be moved without touching its contents. Plates are kept ≤ ~1300 units wide so
 * they read on a phone without a separate layout.
 */
export interface PlateDef {
  id: string; plate: number; part: Part; title: string; sub?: string; w: number; h: number;
  nodes: MapNode[]; edges: Edge[]; bands?: Band[]; captions?: Caption[]; labels?: Label[]; jumps?: JumpView[];
}

export function place(p: PlateDef, x: number, y: number): Scene {
  const region: Region = { id: p.id, plate: p.plate, part: p.part, title: p.title, sub: p.sub, x, y, w: p.w, h: p.h };
  return {
    canvas: { w: x + p.w, h: y + p.h },
    regions: [region],
    nodes: p.nodes.map((n) => ({ ...n, x: n.x + x, y: n.y + y })),
    edges: p.edges.map((e) => (e.via ? { ...e, via: e.via.map(([a, b]) => [a + x, b + y] as [number, number]) } : e)),
    bands: (p.bands ?? []).map((b) => ({ ...b, x: b.x + x, y: b.y + y })),
    captions: (p.captions ?? []).map((c) => ({ ...c, x: c.x + x, y: c.y + y })),
    labels: (p.labels ?? []).map((l) => ({ ...l, x: l.x + x, y: l.y + y })),
    jumps: (p.jumps ?? []).map((j) => ({ ...j, x: j.x + x, y: j.y + y, plate: p.id })),
    decor: [],
  };
}

/** Several placed plates (plus loose nodes, e.g. cross-references drawn on other plates) as one scene. */
export function combine(placed: Scene[], extra: MapNode[] = []): Scene {
  return {
    canvas: { w: Math.max(...placed.map((s) => s.canvas.w)) + 40, h: Math.max(...placed.map((s) => s.canvas.h)) + 40 },
    nodes: [...placed.flatMap((s) => s.nodes), ...extra],
    edges: placed.flatMap((s) => s.edges),
    regions: placed.flatMap((s) => s.regions),
    bands: placed.flatMap((s) => s.bands),
    captions: placed.flatMap((s) => s.captions),
    labels: placed.flatMap((s) => s.labels),
    jumps: placed.flatMap((s) => s.jumps),
    decor: [],
  };
}
