import { edges, nodes } from './data/layout';
import type { Edge, MapNode } from './data/types';

/** What can be hidden: an enzyme name, a metabolite name, or a reaction label (the cofactors and products written on an arrow). */
export type QuizKind = 'enz' | 'met' | 'tag';
export interface QuizState { on: boolean; kinds: Set<QuizKind>; revealed: Set<string> }

export const allKinds: QuizKind[] = ['enz', 'met', 'tag'];

/** What a node is worth quizzing on: an enzyme name, a metabolite name, or nothing. */
export function nodeQuizKind(n: MapNode): 'enz' | 'met' | null {
  if (n.card) return null;
  const kind = n.kind ?? 'met';
  if (kind === 'etag' || kind === 'cx' || (kind === 'proc' && n.enz)) return 'enz';
  if (kind === 'met' || kind === 'small') return 'met';
  return null;
}

/** Reveal keys are shared per enzyme, so one enzyme named twice on the map reveals together. */
export const enzKeys: string[] = [
  ...new Set([
    ...edges.filter((e) => e.enz && !e.noPill && e.style !== 'link').map((e) => e.enz!),
    ...nodes.filter((n) => nodeQuizKind(n) === 'enz').map((n) => n.enz!),
  ]),
];

export const metKeys: string[] = nodes.filter((n) => nodeQuizKind(n) === 'met').map((n) => n.id);

/** Each reaction label reveals on its own, keyed by its edge. */
export const tagKey = (e: Edge) => `tag:${e.id}`;
export const tagKeys: string[] = edges.filter((e) => e.tags).map(tagKey);

export const keysFor = (kinds: Set<QuizKind>) => [
  ...(kinds.has('enz') ? enzKeys : []),
  ...(kinds.has('met') ? metKeys : []),
  ...(kinds.has('tag') ? tagKeys : []),
];

/** True when this block's text should currently be replaced by a "?" placeholder. */
export function isHidden(q: QuizState, kind: QuizKind, key: string): boolean {
  return q.on && q.kinds.has(kind) && !q.revealed.has(key);
}
