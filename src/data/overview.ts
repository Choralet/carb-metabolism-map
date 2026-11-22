import type { Compartment, Edge, Label, MapNode, Scene } from './types';

/**
 * The big picture: one simplified page of the final exam (Parts III and IV) showing only the hub compounds and where
 * each goes, with every arrow named after its pathway rather than its enzymes. The carbohydrate hubs (glucose, DHAP,
 * pyruvate, the citric acid cycle) appear only as the connection points the final material plugs into.
 *
 * It is drawn by the same renderer as the main map, on its own small scene, laid out like the main map: lipids left,
 * carbohydrate hubs in the middle, nitrogen compounds right, the mitochondrion along the bottom, and what comes from or
 * goes to the rest of the body outside the cell. Every compound is a link: `OVERVIEW_TARGET` names its node (or card)
 * on the detailed map. Only what the slides show; each arrow's pathway is the one a final plate draws in full.
 */

const CELL = { x: 0, y: 0, w: 1540, h: 920 };
const MITO = { x: 30, y: 480, w: 1480, h: 410 };

const compartments: Compartment[] = [
  { id: 'cell', kind: 'cell', ...CELL },
  { id: 'mito', kind: 'mito', ...MITO },
];

const nodes: MapNode[] = [
  // outside the cell: diet, blood, other tissues
  { id: 'o_dfat', x: 110, y: -110, kind: 'proc', label: 'Dietary fat' },
  { id: 'o_dprot', x: 1020, y: -110, kind: 'proc', label: 'Dietary protein' },
  { id: 'o_kbt', x: -250, y: 640, kind: 'proc', label: 'Heart, muscle, brain' },
  { id: 'o_urine', x: 1790, y: 330, kind: 'proc', label: 'Kidneys → urine' },
  { id: 'o_oth', x: 1790, y: 800, kind: 'proc', label: 'Muscle, other tissues' },

  // cytosol · lipids
  { id: 'o_fa', x: 110, y: 70, mol: 'fa', label: 'Fatty acids' },
  { id: 'o_tag', x: 330, y: 70, mol: 'tag', label: 'Triacylglycerols (fat)' },
  { id: 'o_gly', x: 215, y: 140, mol: 'glycerol', label: 'Glycerol' },
  { id: 'o_facoa', x: 110, y: 215, mol: 'facoa', label: 'Fatty acyl-CoA' },
  { id: 'o_g3p', x: 330, y: 215, mol: 'g3pgly', label: 'Glycerol 3-phosphate' },
  { id: 'o_pl', x: 330, y: 300, mol: 'gpl', label: 'Membrane phospholipids' },
  { id: 'o_chol', x: 330, y: 375, mol: 'cholesterol', label: 'Cholesterol' },
  { id: 'o_ster', x: 300, y: 445, kind: 'proc', label: 'Steroid hormones · bile salts' },
  { id: 'o_long', x: 590, y: 130, kind: 'proc', label: 'Longer, unsaturated fatty acids' },
  { id: 'o_palm', x: 560, y: 270, mol: 'palmitate', label: 'Palmitate' },
  { id: 'o_malcoa', x: 560, y: 360, mol: 'malcoa', label: 'Malonyl-CoA' },
  { id: 'o_accoac', x: 560, y: 440, mol: 'accoa', label: 'Acetyl-CoA (cytosol)' },

  // cytosol · carbohydrate hubs
  { id: 'o_glc', x: 790, y: 70, mol: 'glc', label: 'Glucose' },
  { id: 'o_dhap', x: 790, y: 215, mol: 'dhap', label: 'DHAP' },
  { id: 'o_pyr', x: 790, y: 360, mol: 'pyr', label: 'Pyruvate' },

  // cytosol · nitrogen
  { id: 'o_aa', x: 1020, y: 70, kind: 'proc', label: 'Amino acids' },
  { id: 'o_der', x: 1320, y: 70, kind: 'proc', label: 'Heme · glutathione · amines · NO' },
  { id: 'o_ak', x: 960, y: 270, kind: 'proc', label: 'Carbon skeletons' },
  { id: 'o_gluc', x: 1110, y: 200, mol: 'glu', label: 'Glutamate' },
  { id: 'o_aspc', x: 1230, y: 370, mol: 'asp', label: 'Aspartate' },
  { id: 'o_uric', x: 1250, y: 170, mol: 'uric', label: 'Uric acid' },
  { id: 'o_nuc', x: 1420, y: 170, kind: 'proc', label: 'Nucleotides' },
  { id: 'o_urea', x: 1420, y: 330, mol: 'urea', label: 'Urea' },
  { id: 'o_ucyc', x: 1420, y: 440, kind: 'proc', label: 'Urea cycle' },

  // mitochondrion
  { id: 'o_facoam', x: 110, y: 560, mol: 'facoa', label: 'Fatty acyl-CoA' },
  { id: 'o_accoa', x: 790, y: 560, mol: 'accoa', label: 'Acetyl-CoA' },
  { id: 'o_kb', x: 300, y: 640, mol: 'aca', label: 'Ketone bodies' },
  { id: 'o_cit', x: 650, y: 660, mol: 'cit', label: 'Citrate' },
  { id: 'o_oaa', x: 930, y: 660, mol: 'oaa', label: 'Oxaloacetate' },
  { id: 'o_akg', x: 590, y: 760, mol: 'akg', label: 'α-Ketoglutarate' },
  { id: 'o_mal', x: 990, y: 760, mol: 'mal', label: 'Malate' },
  { id: 'o_succoa', x: 670, y: 850, mol: 'succoa', label: 'Succinyl-CoA' },
  { id: 'o_fum', x: 910, y: 850, mol: 'fum', label: 'Fumarate' },
  { id: 'o_glum', x: 1110, y: 570, mol: 'glu', label: 'Glutamate' },
  { id: 'o_nh4', x: 1260, y: 650, mol: 'nh4', label: 'NH₄⁺' },
  { id: 'o_carbp', x: 1420, y: 650, mol: 'carbp', label: 'Carbamoyl phosphate' },
];

const P = { style: 'plain' as const, plainTag: true };
const edges: Edge[] = [
  // lipids in and out of storage (Part III slides 5–8, 41–43)
  { id: 'oe1', from: 'o_dfat', to: 'o_fa', ...P, tags: 'digestion, chylomicrons', tagPos: 'r', t: 0.3 },
  { id: 'oe2', from: 'o_tag', to: 'o_fa', ...P, tags: 'lipases', tagPos: 'above', out: 'o_gly' },
  { id: 'oe3', from: 'o_gly', to: 'o_g3p', ...P },
  { id: 'oe4', from: 'o_g3p', to: 'o_dhap', ...P, dir: 'both', tags: 'into or out of glycolysis', tagPos: 'above', t: 0.8 },
  { id: 'oe5', from: 'o_g3p', to: 'o_tag', ...P, feed: 'o_facoa', tags: 'fat synthesis', tagPos: 'r', t: 0.25 },
  { id: 'oe6', from: 'o_g3p', to: 'o_pl', ...P },
  // fatty acids burned (slides 9–15)
  { id: 'oe7', from: 'o_fa', to: 'o_facoa', ...P, tags: 'activation', tagPos: 'l' },
  { id: 'oe8', from: 'o_facoa', to: 'o_facoam', ...P, tags: 'carnitine shuttle', tagPos: 'r', t: 0.47 },
  { id: 'oe9', from: 'o_facoam', to: 'o_accoa', ...P, tags: 'β-oxidation', tagPos: 'above', t: 0.3 },
  // ketone bodies (slides 20–22)
  { id: 'oe10', from: 'o_accoa', to: 'o_kb', ...P, tags: 'ketone bodies (liver)', tagPos: 'below', t: 0.55 },
  { id: 'oe11', from: 'o_kb', to: 'o_kbt', ...P, tags: 'in the blood', tagPos: 'above', t: 0.45 },
  // fatty acids made (slides 24–35)
  { id: 'oe12', from: 'o_cit', to: 'o_accoac', ...P, tags: 'citrate shuttle', tagPos: 'r', t: 0.78 },
  { id: 'oe13', from: 'o_accoac', to: 'o_malcoa', ...P },
  { id: 'oe14', from: 'o_malcoa', to: 'o_palm', ...P, tags: 'fatty acid synthesis', tagPos: 'r' },
  { id: 'oe15', from: 'o_palm', to: 'o_long', ...P, tags: 'elongation, desaturation', tagPos: 'r', t: 0.78 },
  { id: 'oe16', from: 'o_palm', to: 'o_tag', ...P, tags: 'stored', tagPos: 'r', t: 0.45 },
  // cholesterol (slides 45–47)
  { id: 'oe17', from: 'o_accoac', to: 'o_chol', ...P, tags: 'cholesterol synthesis', tagPos: 'above', t: 0.45 },
  { id: 'oe18', from: 'o_chol', to: 'o_ster', ...P },
  // carbohydrate hubs (the midterm pathways, shown as connections)
  { id: 'oe19', from: 'o_glc', to: 'o_dhap', ...P, tags: 'glycolysis', tagPos: 'r' },
  { id: 'oe20', from: 'o_dhap', to: 'o_pyr', ...P },
  { id: 'oe21', from: 'o_pyr', to: 'o_accoa', ...P },
  { id: 'oe22', from: 'o_pyr', to: 'o_oaa', ...P },
  // the citric acid cycle
  { id: 'oe23', from: 'o_oaa', to: 'o_cit', ...P, feed: 'o_accoa' },
  { id: 'oe24', from: 'o_cit', to: 'o_akg', ...P },
  { id: 'oe25', from: 'o_akg', to: 'o_succoa', ...P },
  { id: 'oe26', from: 'o_succoa', to: 'o_fum', ...P },
  { id: 'oe27', from: 'o_fum', to: 'o_mal', ...P },
  { id: 'oe28', from: 'o_mal', to: 'o_oaa', ...P },
  // amino acids: in, apart, and where their parts go (Part IV slides 4–13, 19, 22–28)
  { id: 'oe29', from: 'o_dprot', to: 'o_aa', ...P, tags: 'digestion', tagPos: 'r', t: 0.3 },
  { id: 'oe30', from: 'o_aa', to: 'o_ak', ...P, tags: 'transamination', tagPos: 'l', out: 'o_gluc' },
  { id: 'oe31', from: 'o_ak', to: 'o_pyr', ...P, tags: 'glucogenic', tagPos: 'above', t: 0.55 },
  { id: 'oe32', from: 'o_ak', to: 'o_accoa', ...P, tags: 'ketogenic', tagPos: 'r', t: 0.4 },
  { id: 'oe33', from: 'o_aa', to: 'o_der', ...P },
  { id: 'oe34', from: 'o_gluc', to: 'o_glum', ...P },
  { id: 'oe35', from: 'o_glum', to: 'o_nh4', ...P, tags: 'deamination', tagPos: 'below', t: 0.25 },
  { id: 'oe36', from: 'o_oth', to: 'o_nh4', ...P, tags: 'as glutamine, alanine', tagPos: 'below', t: 0.35 },
  // urea (slides 14–18)
  { id: 'oe37', from: 'o_nh4', to: 'o_carbp', ...P },
  { id: 'oe38', from: 'o_carbp', to: 'o_ucyc', ...P },
  { id: 'oe39', from: 'o_oaa', to: 'o_aspc', ...P, tags: 'transamination', tagPos: 'r', t: 0.8 },
  { id: 'oe40', from: 'o_aspc', to: 'o_ucyc', ...P },
  { id: 'oe41', from: 'o_ucyc', to: 'o_urea', ...P },
  { id: 'oe42', from: 'o_urea', to: 'o_urine', ...P, tags: 'in the blood', tagPos: 'above' },
  { id: 'oe43', from: 'o_ucyc', to: 'o_fum', ...P, via: [[1212, 470], [1212, 800]], tags: 'fumarate', tagPos: 'below', t: 0.1 },
  // nucleotides (slides 30–38)
  { id: 'oe44', from: 'o_aspc', to: 'o_nuc', ...P, tags: 'nucleotide synthesis', tagPos: 'r', t: 0.45 },
  { id: 'oe45', from: 'o_nuc', to: 'o_uric', ...P },
];

const labels: Label[] = [
  { x: 110, y: 30, kind: 'phase', text: 'Cytosol · lipids' },
  { x: 700, y: 30, kind: 'phase', text: 'Carbohydrate hubs' },
  { x: 1090, y: 30, kind: 'phase', text: 'Nitrogen compounds' },
  { x: 110, y: 512, kind: 'phase', text: 'Mitochondrion (matrix)' },
  { x: 790, y: 762, kind: 'phase', text: 'Citric acid cycle', anchor: 'middle' },
];

export const overviewScene: Scene = {
  canvas: { w: 2100, h: 1100 },
  nodes, edges, regions: [], bands: [], captions: [], labels, jumps: [], decor: [], compartments,
};

/** Where each overview item lives on the detailed map: a drawn node, or an overview card. */
export const OVERVIEW_TARGET: Record<string, { kind: 'node' | 'card'; id: string }> = {
  o_dfat: { kind: 'node', id: 'ld_tag0' }, o_dprot: { kind: 'node', id: 'nd_prot' }, o_kbt: { kind: 'node', id: 'lk_tis' },
  o_urine: { kind: 'node', id: 'nu_urea' }, o_oth: { kind: 'node', id: 'ng_gln' },
  o_fa: { kind: 'node', id: 'lt_fa' }, o_tag: { kind: 'node', id: 'lt_tag' }, o_gly: { kind: 'node', id: 'lt_gly' },
  o_facoa: { kind: 'node', id: 'lt_facoa' }, o_g3p: { kind: 'node', id: 'lt_g3p' }, o_pl: { kind: 'node', id: 'lt_gpl' },
  o_chol: { kind: 'node', id: 'lh_chol' }, o_ster: { kind: 'card', id: 'l_c_steroid' }, o_long: { kind: 'node', id: 'le_long' },
  o_palm: { kind: 'node', id: 'lf_palm' }, o_malcoa: { kind: 'node', id: 'lf_malcoa' }, o_accoac: { kind: 'node', id: 'lf_accoa' },
  o_glc: { kind: 'node', id: 'glc' }, o_dhap: { kind: 'node', id: 'dhap' }, o_pyr: { kind: 'node', id: 'pyr' },
  o_aa: { kind: 'node', id: 'nt_aa' }, o_der: { kind: 'card', id: 'n_c_derived' }, o_ak: { kind: 'node', id: 'nt_ak' },
  o_gluc: { kind: 'node', id: 'nt_glu' }, o_aspc: { kind: 'node', id: 'nu_asp_c' }, o_nuc: { kind: 'node', id: 'np_imp' },
  o_uric: { kind: 'node', id: 'nq_uric' }, o_urea: { kind: 'node', id: 'nu_urea' }, o_ucyc: { kind: 'card', id: 'n_c_urea' },
  o_facoam: { kind: 'node', id: 'lb_facoa' }, o_accoa: { kind: 'node', id: 'accoa' }, o_kb: { kind: 'node', id: 'lk_kb' },
  o_cit: { kind: 'node', id: 'cit' }, o_oaa: { kind: 'node', id: 'oaa' }, o_akg: { kind: 'node', id: 'akg' },
  o_mal: { kind: 'node', id: 'mal' }, o_succoa: { kind: 'node', id: 'succoa' }, o_fum: { kind: 'node', id: 'fum' },
  o_glum: { kind: 'node', id: 'nu_glu' }, o_nh4: { kind: 'node', id: 'nu_nh4' }, o_carbp: { kind: 'node', id: 'nu_cp' },
};
