import type { Edge, Exam, MapNode, Scene, Scope } from './data/types';

/** What can be hidden: an enzyme name, a metabolite name, or a reaction label (the cofactors and products written on an arrow). */
export type QuizKind = 'enz' | 'met' | 'tag';
/** `pool` is every key currently in play (the chosen kinds, within the chosen scope); only those are hidden. */
export interface QuizState { on: boolean; kinds: Set<QuizKind>; revealed: Set<string>; pool: Set<string> }

export const allKinds: QuizKind[] = ['enz', 'met', 'tag'];

/** What a node is worth quizzing on: an enzyme name, a metabolite name, or nothing. */
export function nodeQuizKind(n: MapNode): 'enz' | 'met' | null {
  if (n.card) return null;
  const kind = n.kind ?? 'met';
  if (kind === 'xref') return null;
  if (kind === 'etag' || kind === 'cx' || (kind === 'proc' && n.enz)) return 'enz';
  if (kind === 'met' || kind === 'small') return 'met';
  return null;
}

/** Each reaction label reveals on its own, keyed by its edge. */
export const tagKey = (e: Edge) => `tag:${e.id}`;

const inScope = (x: { exam?: Exam }, scope: Scope) => scope === 'both' || (x.exam ?? 'mid') === scope;

/**
 * Quiz keys per kind, for one scope. Enzyme keys are shared per enzyme, so an enzyme named in several places
 * reveals everywhere at once.
 */
export function quizKeys(scene: Scene, scope: Scope): Record<QuizKind, string[]> {
  const edges = scene.edges.filter((e) => inScope(e, scope));
  const nodes = scene.nodes.filter((n) => inScope(n, scope));
  return {
    enz: [...new Set([
      ...edges.filter((e) => e.enz && !e.noPill && e.style !== 'link').map((e) => e.enz!),
      ...nodes.filter((n) => nodeQuizKind(n) === 'enz').map((n) => n.enz!),
    ])],
    met: nodes.filter((n) => nodeQuizKind(n) === 'met').map((n) => n.id),
    tag: edges.filter((e) => e.tags).map(tagKey),
  };
}

export const keysFor = (keys: Record<QuizKind, string[]>, kinds: Set<QuizKind>) => allKinds.flatMap((k) => (kinds.has(k) ? keys[k] : []));

/** True when this block's text should currently be replaced by a "?" placeholder. */
export function isHidden(q: QuizState, kind: QuizKind, key: string): boolean {
  return q.on && q.kinds.has(kind) && q.pool.has(key) && !q.revealed.has(key);
}
