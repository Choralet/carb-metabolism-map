import { desktopScene as midDesktop, phoneScene as midPhone } from './layout.ts';
import { lipidScene } from './part3/layout.ts';
import { aminoScene } from './part4/layout.ts';
import type { Exam, Scene } from './types.ts';

/**
 * The map is assembled from the midterm scene (Parts I–II, hand-placed in layout.ts) and the final-exam plates
 * (Parts III–IV), which sit in their own wing to the right. Everything from a final part is tagged `exam: 'final'`
 * here, so the scope switch, quiz and search can tell the two apart without every record repeating it.
 */
const finalParts: Scene[] = [lipidScene, aminoScene];

function tagged(s: Scene, exam: Exam): Scene {
  return {
    ...s,
    nodes: s.nodes.map((n) => ({ ...n, exam })),
    edges: s.edges.map((e) => ({ ...e, exam })),
  };
}

function merge(base: Scene, parts: Scene[]): Scene {
  const all = [base, ...parts.map((p) => tagged(p, 'final'))];
  return {
    canvas: { w: Math.max(...all.map((s) => s.canvas.w)), h: Math.max(...all.map((s) => s.canvas.h)) },
    nodes: all.flatMap((s) => s.nodes),
    edges: all.flatMap((s) => s.edges),
    regions: all.flatMap((s) => s.regions),
    bands: all.flatMap((s) => s.bands),
    captions: all.flatMap((s) => s.captions),
    labels: all.flatMap((s) => s.labels),
    jumps: all.flatMap((s) => s.jumps),
    decor: all.flatMap((s) => s.decor),
  };
}

export const desktopScene = merge(midDesktop, finalParts);
/** Final plates are laid out narrow enough to read on a phone, so they need no separate phone layout. */
export const phoneScene = merge(midPhone, finalParts);
