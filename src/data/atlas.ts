import { midScene } from './layout.ts';
import { lipidPlates, p16 } from './part3/layout.ts';
import {
  p20, p21, p22, p23, p24, p25, p26, p27, p28, p29, p30, p31, p32, p33, p34, skeletonEdges, skeletonNodes,
} from './part4/layout.ts';
import { combine, place, type PlateDef } from './plate.ts';
import type { Band, Caption, Compartment, Exam, Scene } from './types';

/**
 * The whole map as one cell. Carbohydrates run down the middle (glycolysis at x = 5600); lipids sit to the left,
 * nitrogen metabolism to the right, then amino acid synthesis and nucleotides. The mitochondrion takes the lower
 * left: β-oxidation, the citric acid cycle and the urea cycle's matrix steps inside it, with its double membrane
 * along the top (y 2560–2850: outer membrane, intermembrane space, inner membrane) and down the right side
 * (x 7500–7790). Everything that crosses a membrane crosses one of those two edges. Side panels outside the cell
 * hold what happens in other organs: digestion, ketone bodies as fuel, the glucose–alanine cycle.
 */

/** Plates whose contents are in their own coordinates, and where they go. */
const placed: [PlateDef, number, number][] = [
  // side panels outside the cell
  [p16, 0, 870],
  [p22, 7000, 6850],
  [p20, 8300, 6850],
  // amino acid synthesis: serine → cysteine across the top, glycine and cysteine down into heme, glutathione, creatine
  [p25, 9580, 60],
  [p26, 10520, 60],
  [p24, 11810, 60],
  [p27, 9580, 1430],
  [p28, 10870, 1430],
  // nucleotides: purines along one row (synthesis → AMP and GMP → breakdown), pyrimidines along the next
  [p29, 9060, 2780],
  [p30, 10300, 2780],
  [p33, 11590, 2780],
  [p31, 9060, 4500],
  [p32, 10000, 4500],
  [p34, 11290, 4500],
];

/** Plates written in map coordinates. */
const fixed: PlateDef[] = [...lipidPlates, p21, p23];

const CELL = { x: 2880, y: 20, w: 10290, h: 6740 };
const MITO = { x: 2920, y: 2560, w: 4870, h: 2860 };

const compartments: Compartment[] = [
  { id: 'cell', kind: 'cell', ...CELL, label: 'CELL (HEPATOCYTE, MUSCLE OR ADIPOCYTE)' },
  { id: 'mito', kind: 'mito', ...MITO, label: 'MITOCHONDRION' },
];

/** The mitochondrion's membranes along the two edges things cross. */
const bands: Band[] = [
  { id: 'b_mo_top', x: MITO.x + 20, y: 2560, w: MITO.w - 20, h: 50 },
  { id: 'b_mi_top', x: MITO.x + 20, y: 2790, w: 7560 - MITO.x - 20, h: 60 },
  { id: 'b_mi_right', x: 7500, y: 2790, w: 60, h: MITO.y + MITO.h - 20 - 2790 },
  { id: 'b_mo_right', x: 7740, y: 2560, w: 50, h: MITO.h - 20 },
];

const captions: Caption[] = [
  ...[3000, 4700].flatMap((x) => [
    { x, y: 2545, text: 'CYTOSOL' },
    { x, y: 2640, text: 'OUTER MEMBRANE · INTERMEMBRANE SPACE' },
    { x, y: 2885, text: 'INNER MEMBRANE · MATRIX' },
  ]),
  { x: 7815, y: 5400, text: 'CYTOSOL', anchor: 'start' },
  { x: 7475, y: 5400, text: 'MATRIX', anchor: 'end' },
];

function tagged(s: Scene, exam: Exam): Scene {
  return { ...s, nodes: s.nodes.map((n) => ({ ...n, exam })), edges: s.edges.map((e) => ({ ...e, exam })) };
}

const finalScene = tagged(combine([
  ...fixed.map((p) => place(p)),
  ...placed.map(([p, x, y]) => place(p, x, y)),
  { canvas: { w: 0, h: 0 }, nodes: skeletonNodes, edges: skeletonEdges, regions: [], bands: [], captions: [], labels: [], jumps: [], decor: [] },
]), 'final');

/**
 * Steps drawn once that belong to both exams: triose phosphate isomerase takes glycerol's carbon into glycolysis
 * (Part III slide 8), and citrate synthase makes the citrate the shuttle exports (Part III slide 25).
 */
const BOTH = new Set(['e_tpi', 'e_cs']);
const mid: Scene = { ...midScene, edges: midScene.edges.map((e) => (BOTH.has(e.id) ? { ...e, exam: 'both' } : e)) };

export const atlas: Scene = {
  ...combine([mid, finalScene]),
  canvas: { w: CELL.x + CELL.w + 200, h: 8300 },
  bands: [...mid.bands, ...bands, ...finalScene.bands],
  captions: [...mid.captions, ...captions, ...finalScene.captions],
  compartments,
};
