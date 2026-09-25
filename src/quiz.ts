import { enzById } from './data/enzymes';
import { molById } from './data/molecules';
import type { Edge, Exam, MapNode, Scene, Scope } from './data/types';
import { geometryOf, labelOf } from './map/geometry';
import { grade as gradeText } from './grade';

/** What can be hidden: an enzyme name, a metabolite name, or a reaction label (the cofactors and products written on an arrow). */
export type QuizKind = 'enz' | 'met' | 'tag';
/** How a hidden item was answered: typed or self-graded right, missed, or just revealed without grading. */
export type Answer = 'ok' | 'miss' | 'seen';
/** `pool` is every key currently in play (chosen kinds, scope and plate); only those are hidden until answered. */
export interface QuizState { on: boolean; kinds: Set<QuizKind>; pool: Set<string>; answers: Record<string, Answer> }

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
export const kindOfKey = (key: string, scene: Scene): QuizKind =>
  key.startsWith('tag:') ? 'tag' : geometryOf(scene).nodeMap[key] && nodeQuizKind(geometryOf(scene).nodeMap[key]) === 'met' ? 'met' : 'enz';

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

/** The plates each key appears on (an enzyme can be drawn on several). */
export function keyPlates(scene: Scene): Map<string, Set<string>> {
  const { plateOf } = geometryOf(scene);
  const out = new Map<string, Set<string>>();
  const add = (key: string, nodeId: string) => {
    const r = plateOf.get(nodeId);
    if (!r) return;
    if (!out.has(key)) out.set(key, new Set());
    out.get(key)!.add(r.id);
  };
  scene.edges.forEach((e) => { if (e.enz) add(e.enz, e.from); if (e.tags) add(tagKey(e), e.from); });
  scene.nodes.forEach((n) => { const k = nodeQuizKind(n); if (k === 'enz') add(n.enz!, n.id); else if (k === 'met') add(n.id, n.id); });
  return out;
}

/** True when this block's text should currently be replaced by a "?" placeholder. */
export function isHidden(q: QuizState, kind: QuizKind, key: string): boolean {
  return q.on && q.kinds.has(kind) && q.pool.has(key) && !q.answers[key];
}

/** After answering, the map marks right and missed items (only while the quiz is on). */
export function resultClass(q: QuizState, key: string): string {
  if (!q.on) return '';
  const a = q.answers[key];
  return a === 'ok' ? ' q-ok' : a === 'miss' ? ' q-miss' : '';
}

// ── questions and grading ───────────────────────────────────────────
export interface Question { kind: QuizKind; prompt: string; answer: string; accept: string[]; typed: boolean }

const withoutParens = (s: string) => s.replace(/\s*\([^)]*\)/g, '').trim();
const parens = (s: string) => [...s.matchAll(/\(([^)]*)\)/g)].map((m) => m[1]);

/** The question behind a key: what to show, the canonical answer, and every spelling accepted. */
export function questionOf(key: string, scene: Scene): Question {
  if (key.startsWith('tag:')) {
    const e = scene.edges.find((x) => tagKey(x) === key)!;
    return { kind: 'tag', prompt: 'What is written on this arrow?', answer: e.tags!, accept: [], typed: false };
  }
  const n = geometryOf(scene).nodeMap[key];
  if (n && nodeQuizKind(n) === 'met') {
    const label = labelOf(n);
    const names = n.mols ?? (n.mol ? [n.mol] : []);
    const accept = [label, withoutParens(label), ...names.map((m) => molById[m].name), ...names.map((m) => withoutParens(molById[m].name))];
    return { kind: 'met', prompt: 'Name this molecule', answer: label, accept, typed: true };
  }
  const z = enzById[key];
  const accept = [z.name, z.full ?? '', z.short, withoutParens(z.name), ...parens(z.name)].filter(Boolean);
  return { kind: 'enz', prompt: 'Name this enzyme', answer: z.full ?? z.name, accept, typed: true };
}

/** Right or wrong, for a typed answer to a question (see grade.ts for what counts as right). */
export const grade = (input: string, q: Question) => gradeText(input, q.accept);

// ── persistence ─────────────────────────────────────────────────────
/** Answers of the current round, and the missed deck (items whose latest graded answer was wrong). */
export interface QuizSave { answers: Record<string, Answer>; missed: string[] }
const SAVE_KEY = 'atlas-quiz';
export function loadQuiz(): QuizSave {
  try {
    const s = JSON.parse(localStorage.getItem(SAVE_KEY) ?? 'null');
    if (s && typeof s.answers === 'object' && Array.isArray(s.missed)) return s;
  } catch { /* fall through */ }
  return { answers: {}, missed: [] };
}
export function saveQuiz(s: QuizSave) {
  try { localStorage.setItem(SAVE_KEY, JSON.stringify(s)); } catch { /* a blocked store just means no persistence */ }
}
