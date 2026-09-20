import { edges, nodes } from './data/layout';
import type { MapNode } from './data/types';

export type QuizScope = 'enz' | 'met' | 'both';
export interface QuizState { on: boolean; scope: QuizScope; revealed: Set<string> }

/** What a block is worth quizzing on: an enzyme name, a metabolite name, or nothing. */
export type QuizKind = 'enz' | 'met' | null;

export function nodeQuizKind(n: MapNode): QuizKind {
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

export const inScope = (scope: QuizScope, kind: QuizKind) => kind !== null && (scope === 'both' || scope === kind);

export const keysFor = (scope: QuizScope) =>
  scope === 'enz' ? enzKeys : scope === 'met' ? metKeys : [...enzKeys, ...metKeys];

/** True when this block's name should currently be replaced by a "?" placeholder. */
export function isHidden(q: QuizState, kind: QuizKind, key: string): boolean {
  return q.on && inScope(q.scope, kind) && !q.revealed.has(key);
}
