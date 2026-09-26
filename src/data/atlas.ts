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
 * left: β-oxidation, the citric acid cycle and the urea cycle's matrix steps inside it. Its double membrane is drawn
 * wide along the top (y 2560–2850: outer membrane, intermembrane space, inner membrane) and down the right side
 * (x 7500–7790), and every step with a named transporter crosses one of those two edges; elsewhere it is the thin
 * double outline. Side panels outside the cell hold what happens in other organs: digestion, ketone bodies as fuel,
 * the glucose–alanine cycle. The two NADH shuttles are close-ups (insets) below the mitochondrion.
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
  ...[3180, 4700].flatMap((x) => [
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
 * Midterm steps that final slides show too, names included: triose phosphate isomerase takes glycerol's carbon into
 * glycolysis (Part III slide 8); citrate synthase makes the citrate the shuttle exports (Part III slide 25); pyruvate
 * carboxylase and PEP carboxykinase begin the short gluconeogenesis that makes glycerol 3-phosphate (Part III
 * slide 41); and the oxaloacetate leaving the matrix is the drain to gluconeogenesis (Part III slide 21, Part IV
 * slide 19). Each enzyme named here cites a Part III slide; the validator checks that.
 */
export const SHARED = new Set(['e_tpi', 'e_cs', 'e_pc', 'e_pepck', 'e_gng_mal']);
/**
 * Midterm arrows a final slide draws without naming their enzymes: Part IV slide 19 draws the whole citric acid cycle,
 * and pyruvate → acetyl-CoA, as the hub the amino acids' carbon skeletons feed. The arrows stay lit in Final; their
 * enzyme names and cofactors stay midterm (they are not in the Final quiz).
 */
export const SHARED_LINES = new Set(['e_pdh', 'e_aco', 'e_idh', 'e_akgdh', 'e_scs', 'e_sdh', 'e_fum', 'e_mdh']);
const mid: Scene = {
  ...midScene,
  edges: midScene.edges.map((e) => (SHARED.has(e.id) ? { ...e, exam: 'both' } : SHARED_LINES.has(e.id) ? { ...e, lineExam: 'both' } : e)),
};

export const atlas: Scene = {
  ...combine([mid, finalScene]),
  canvas: { w: CELL.x + CELL.w + 200, h: 8300 },
  bands: [...mid.bands, ...bands, ...finalScene.bands],
  captions: [...mid.captions, ...captions, ...finalScene.captions],
  compartments,
};
