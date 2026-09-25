import { molById } from './data/molecules';
import { POOL, POOL_LABEL } from './data/pools';
import type { Edge, MapNode, Scene } from './data/types';
import { geometryOf, labelOf } from './map/geometry';

/**
 * Route tracing. The map is read as a graph whose vertices are molecule *identities* rather than drawn nodes, so
 * the citric acid cycle's oxaloacetate and the urea cycle's matrix oxaloacetate are one vertex, and a route may
 * change plates wherever the same molecule is drawn twice. Identities are split by pool where merging would be
 * wrong (matrix vs cytosol, a chain before and after a round; see data/pools.ts): "accoa@mit" ≠ "accoa@cyt".
 * A node that is not a single named molecule ("Fatty acids", "Chylomicrons") is its own identity.
 */
export function identitiesOf(n: MapNode): string[] {
  const ids = n.mol ? [n.mol] : n.mols?.length ? n.mols : [`node:${n.id}`];
  const pool = POOL[n.id];
  return pool ? ids.map((m) => `${m}@${pool}`) : ids;
}

/** The molecule an identity belongs to, without its pool. */
export const baseOf = (id: string) => id.split('@')[0];

export function identityName(id: string, scene: Scene): string {
  const [base, pool] = id.split('@');
  const name = base.startsWith('node:') ? labelOf(geometryOf(scene).nodeMap[base.slice(5)]) : molById[base]?.name ?? base;
  return pool ? `${name} (${POOL_LABEL[pool]})` : name;
}

export interface Step { from: string; to: string; edge: Edge; fromNode: string; toNode: string }
export interface Route { steps: Step[]; edges: Set<string>; nodes: Set<string>; plates: number[] }

interface Arc { to: string; edge: Edge; fromNode: string; toNode: string; cost: number }

/**
 * A named step costs 1. So does a plain arrow that only carries a molecule somewhere else (across a membrane,
 * into the blood). Any other plain arrow is a summary of steps drawn elsewhere, so it costs more than a dozen
 * named ones: a route then shows the enzymes whenever the map draws them, and falls back to summaries only when
 * nothing more detailed connects.
 */
const SUMMARY = 12;
const costOf = (e: Edge, a: string, b: string) => (e.enz || baseOf(a) === baseOf(b) ? 1 : SUMMARY);

const graphs = new WeakMap<Scene, Map<string, Arc[]>>();

/**
 * Arcs follow the arrows as drawn: forward, backward too when the arrow is drawn reversible, plus the side
 * arrows (a co-substrate feeding in, a co-product leaving). Routes use the whole map whatever the exam switch shows.
 */
function graphOf(scene: Scene): Map<string, Arc[]> {
  const hit = graphs.get(scene);
  if (hit) return hit;
  const { nodeMap } = geometryOf(scene);
  const g = new Map<string, Arc[]>();
  const add = (a: MapNode, b: MapNode, edge: Edge) => {
    if (a.kind === 'card' || a.kind === 'xref' || b.kind === 'card' || b.kind === 'xref') return;
    for (const x of identitiesOf(a)) for (const y of identitiesOf(b)) {
      if (x === y) continue;
      if (!g.has(x)) g.set(x, []);
      g.get(x)!.push({ to: y, edge, fromNode: a.id, toNode: b.id, cost: costOf(edge, x, y) });
    }
  };
  for (const e of scene.edges) {
    const A = nodeMap[e.from], B = nodeMap[e.to];
    if (!A || !B) continue;
    add(A, B, e);
    if (e.dir === 'both') add(B, A, e);
    if (e.feed && nodeMap[e.feed]) add(nodeMap[e.feed], B, e);
    if (e.out && nodeMap[e.out]) add(A, nodeMap[e.out], e);
  }
  graphs.set(scene, g);
  return g;
}

/** Changing plates costs a little, so of two equally short routes the one that stays on a plate wins. */
const PLATE_CHANGE = 0.3;

/**
 * The best drawn route from one molecule to another (fewest steps, preferring named steps over summaries and
 * staying on a plate), starting from any pool of the first and ending in any pool of the second; or null.
 */
export function traceRoute(scene: Scene, from: string, to: string): Route | null {
  if (from === to) return null;
  const g = graphOf(scene);
  const { plateOf } = geometryOf(scene);
  const plate = (nodeId: string) => plateOf.get(nodeId)?.plate ?? -1;
  // Dijkstra over (identity, plate) states; the graph has a few hundred arcs, so a sorted array is plenty
  type State = { id: string; plate: number; cost: number; prev: State | null; arc: Arc | null };
  const best = new Map<string, number>();
  const open: State[] = [...g.keys()].filter((id) => baseOf(id) === from).map((id) => ({ id, plate: -1, cost: 0, prev: null, arc: null }));
  while (open.length) {
    open.sort((a, b) => a.cost - b.cost);
    const s = open.shift()!;
    if (baseOf(s.id) === to) return build(s);
    for (const arc of g.get(s.id) ?? []) {
      const p = plate(arc.fromNode);
      const cost = s.cost + arc.cost + (s.plate !== -1 && p !== s.plate ? PLATE_CHANGE : 0);
      const k = `${arc.to}|${plate(arc.toNode)}`;
      if ((best.get(k) ?? Infinity) <= cost) continue;
      best.set(k, cost);
      open.push({ id: arc.to, plate: plate(arc.toNode), cost, prev: s, arc });
    }
  }
  return null;

  function build(end: State): Route {
    const steps: Step[] = [];
    for (let s: State | null = end; s?.arc; s = s.prev) steps.unshift({ from: s.prev!.id, to: s.id, edge: s.arc.edge, fromNode: s.arc.fromNode, toNode: s.arc.toNode });
    const edges = new Set(steps.map((x) => x.edge.id));
    const nodes = new Set(steps.flatMap((x) => [x.fromNode, x.toNode]));
    const plates = [...new Set(steps.map((x) => plate(x.toNode)).filter((p) => p >= 0))];
    return { steps, edges, nodes, plates };
  }
}
