import { atlas } from './atlas.ts';
import type { Exam, ExamTag, Scene } from './types.ts';

/**
 * The map is one scene (atlas.ts). Final-exam plates are tagged `exam: 'final'` there, a few shared steps `'both'`
 * and a few shared arrows `lineExam: 'both'`; untagged means midterm. Here each molecule also learns which exams use
 * it: a molecule that a midterm and a final pathway both touch (acetyl-CoA, DHAP, α-ketoglutarate…) is 'both', so the
 * exam switch keeps it lit whichever exam is highlighted. A cross-reference note takes its molecule's exam; a card
 * keeps its own.
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
    // a drawn arrow shared by both exams (lineExam) makes its molecules shared too, even when its labels are not
    for (const id of [e.from, e.to, e.feed, e.out]) add(id, e.lineExam ?? e.exam);
  }
  const nodes = s.nodes.map((n) => {
    if (n.kind === 'card' || n.kind === 'xref') return n;
    const set = new Set(uses.get(n.id) ?? []);
    set.add(n.exam === 'both' ? 'mid' : n.exam ?? 'mid');
    if (n.exam === 'both') set.add('final');
    const exam: ExamTag = set.size > 1 ? 'both' : [...set][0];
    return exam === (n.exam ?? 'mid') ? n : { ...n, exam };
  });
  // a cross-reference note is as relevant as the molecule it sits beside
  const byId = new Map(nodes.map((n) => [n.id, n]));
  return {
    ...s,
    nodes: nodes.map((n) => {
      const anchor = n.kind === 'xref' && n.link ? byId.get(n.link) : undefined;
      return anchor && (anchor.exam ?? 'mid') !== (n.exam ?? 'mid') ? { ...n, exam: anchor.exam } : n;
    }),
  };
}

export const desktopScene = withNodeExams(atlas);
/** One layout serves phones too: plates are at most ~1300 units wide, and jumping to a plate frames it at reading size. */
export const phoneScene = desktopScene;
