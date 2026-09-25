import type { Band, Caption, Edge, JumpView, Label, MapNode, Part, Rect, Region, Scene } from './types';

/**
 * A section of the map (a numbered plate). Its contents are written in map coordinates, with `x`, `y` the top-left
 * corner of its frame; `place(p, dx, dy)` shifts the whole plate, so a plate can be moved without editing its
 * contents. Nodes and edges may refer to nodes on other plates by id: that is how the plates join into one map.
 */
export interface PlateDef {
  id: string; plate: number; part: Part; title: string; sub?: string; x?: number; y?: number; w: number; h: number; right?: boolean; outside?: boolean; titleX?: number;
  /** Extra rectangles (map coordinates) for an L-shaped plate. */
  more?: Rect[];
  nodes: MapNode[]; edges: Edge[]; bands?: Band[]; captions?: Caption[]; labels?: Label[]; jumps?: JumpView[];
}

export function place(p: PlateDef, dx = 0, dy = 0): Scene {
  const x = (p.x ?? 0) + dx, y = (p.y ?? 0) + dy;
  const region: Region = {
    id: p.id, plate: p.plate, part: p.part, title: p.title, sub: p.sub, x, y, w: p.w, h: p.h, right: p.right, outside: p.outside, titleX: p.titleX,
    more: p.more?.map((r) => ({ ...r, x: r.x + dx, y: r.y + dy })),
  };
  return {
    canvas: { w: x + p.w, h: y + p.h },
    regions: [region],
    nodes: p.nodes.map((n) => ({ ...n, x: n.x + dx, y: n.y + dy })),
    edges: p.edges.map((e) => (e.via ? { ...e, via: e.via.map(([a, b]) => [a + dx, b + dy] as [number, number]) } : e)),
    bands: (p.bands ?? []).map((b) => ({ ...b, x: b.x + dx, y: b.y + dy })),
    captions: (p.captions ?? []).map((c) => ({ ...c, x: c.x + dx, y: c.y + dy })),
    labels: (p.labels ?? []).map((l) => ({ ...l, x: l.x + dx, y: l.y + dy })),
    jumps: (p.jumps ?? []).map((j) => ({ ...j, x: j.x + dx, y: j.y + dy, plate: p.id })),
    decor: [],
  };
}

/** Several scenes as one. */
export function combine(parts: Scene[], extra: MapNode[] = []): Scene {
  return {
    canvas: { w: Math.max(...parts.map((s) => s.canvas.w)), h: Math.max(...parts.map((s) => s.canvas.h)) },
    nodes: [...parts.flatMap((s) => s.nodes), ...extra],
    edges: parts.flatMap((s) => s.edges),
    regions: parts.flatMap((s) => s.regions),
    bands: parts.flatMap((s) => s.bands),
    captions: parts.flatMap((s) => s.captions),
    labels: parts.flatMap((s) => s.labels),
    jumps: parts.flatMap((s) => s.jumps),
    decor: parts.flatMap((s) => s.decor),
    compartments: parts.flatMap((s) => s.compartments ?? []),
  };
}

/** Whether a point lies on a plate (any of its rectangles). */
export const onPlate = (r: Region, x: number, y: number) =>
  [r, ...(r.more ?? [])].some((q) => x >= q.x && x <= q.x + q.w && y >= q.y && y <= q.y + q.h);
