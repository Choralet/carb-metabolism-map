import { atlas } from './atlas.ts';
import type { Exam, ExamTag, Scene } from './types.ts';

/**
 * The map is one scene (atlas.ts). Final-exam plates are tagged `exam: 'final'` there and a few shared steps
 * `'both'`; untagged means midterm. Here each molecule also learns which exams use it: a molecule that a midterm
 * and a final pathway both touch (acetyl-CoA, DHAP, α-ketoglutarate…) is 'both', so the exam switch keeps it lit
 * whichever exam is highlighted.
 */
function withNodeExams(s: Scene): Scene {
  const uses = new Map<string, Set<Exam>>();
  const add = (id: string | undefined, tag: ExamTag | undefined) => {
    if (!id) return;
    if (!uses.has(id)) uses.set(id, new Set());
    const set = uses.get(id)!;
    if (tag === 'both') { set.add('mid'); set.add('final'); } else set.add(tag ?? 'mid');
  };
  for (const e of s.edges) {
    if (e.style === 'link') continue;
    for (const id of [e.from, e.to, e.feed, e.out]) add(id, e.exam);
  }
  return {
    ...s,
    nodes: s.nodes.map((n) => {
      if (n.kind === 'card' || n.kind === 'xref') return n;
      const set = new Set(uses.get(n.id) ?? []);
      set.add(n.exam === 'both' ? 'mid' : n.exam ?? 'mid');
      if (n.exam === 'both') set.add('final');
      const exam: ExamTag = set.size > 1 ? 'both' : [...set][0];
      return exam === (n.exam ?? 'mid') ? n : { ...n, exam };
    }),
  };
}

export const desktopScene = withNodeExams(atlas);
/** One layout serves phones too: plates are at most ~1300 units wide, and jumping to a plate frames it at reading size. */
export const phoneScene = desktopScene;
