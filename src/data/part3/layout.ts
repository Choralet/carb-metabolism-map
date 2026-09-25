import type { Band, Caption, Edge, JumpView, Label, MapNode, Part, Region, Scene } from '../types';

/**
 * Part III (lipid metabolism) plates, in the final-exam wing to the right of the carbohydrate map.
 * Each plate is written in its own coordinates (0,0 = the plate's top-left corner) and dropped into place by
 * `place()`, so a plate can be moved without touching its contents. Plates are kept ≤ ~1250 units wide so they
 * read on a phone without a separate layout.
 */
interface PlateDef {
  id: string; plate: number; part: Part; title: string; sub?: string; w: number; h: number;
  nodes: MapNode[]; edges: Edge[]; bands?: Band[]; captions?: Caption[]; labels?: Label[]; jumps?: JumpView[];
}

function place(p: PlateDef, x: number, y: number): Scene {
  const region: Region = { id: p.id, plate: p.plate, part: p.part, title: p.title, sub: p.sub, x, y, w: p.w, h: p.h };
  return {
    canvas: { w: x + p.w, h: y + p.h },
    regions: [region],
    nodes: p.nodes.map((n) => ({ ...n, x: n.x + x, y: n.y + y })),
    edges: p.edges.map((e) => (e.via ? { ...e, via: e.via.map(([a, b]) => [a + x, b + y] as [number, number]) } : e)),
    bands: (p.bands ?? []).map((b) => ({ ...b, x: b.x + x, y: b.y + y })),
    captions: (p.captions ?? []).map((c) => ({ ...c, x: c.x + x, y: c.y + y })),
    labels: (p.labels ?? []).map((l) => ({ ...l, x: l.x + x, y: l.y + y })),
    jumps: (p.jumps ?? []).map((j) => ({ ...j, x: j.x + x, y: j.y + y, plate: p.id })),
    decor: [],
  };
}

// ───────── Plate 9 · dietary fat to the tissues (slides 4–7) ─────────
const p9: PlateDef = {
  id: 'r_l9', plate: 9, part: 'III', title: 'Dietary fat to the tissues', sub: 'intestine → lymph → blood', w: 800, h: 1450,
  nodes: [
    { id: 'ld_tag0', x: 260, y: 130, mol: 'tag', label: 'Dietary triacylglycerols' },
    { id: 'ld_mic', x: 260, y: 300, kind: 'proc', label: 'Mixed micelles (bile salts + fat)' },
    { id: 'ld_prod', x: 260, y: 480, mols: ['mag', 'dag', 'fa', 'glycerol'], label: 'Monoacylglycerols · diacylglycerols · fatty acids · glycerol' },
    { id: 'ld_tag1', x: 260, y: 660, mol: 'tag', label: 'Triacylglycerols (intestinal mucosa)' },
    { id: 'ld_chylo', x: 260, y: 830, kind: 'proc', label: 'Chylomicrons (100–500 nm)' },
    { id: 'ld_tag2', x: 260, y: 1000, mol: 'tag', label: 'Triacylglycerols (capillary)' },
    { id: 'ld_fa', x: 260, y: 1170, mols: ['fa', 'mag'], label: 'Fatty acids + monoacylglycerols' },
    { id: 'ld_ox', x: 140, y: 1320, kind: 'proc', label: 'Muscle: oxidized for energy' },
    { id: 'ld_store', x: 460, y: 1320, kind: 'proc', label: 'Adipose: stored as fat' },
    { id: 'l_c_diet', x: 640, y: 130, kind: 'card', card: 'l_c_diet', label: 'The 8 steps' },
    { id: 'l_c_fuel', x: 640, y: 190, kind: 'card', card: 'l_c_fuel', label: 'Fatty acids as fuel' },
    { id: 'ld_x1', x: 560, y: 476, kind: 'xref', link: 'ld_prod', target: 'lg_gly', label: 'glycerol → glycolysis' },
    { id: 'ld_x2', x: 140, y: 1386, kind: 'xref', link: 'ld_ox', target: 'lc_fa', label: 'into the carnitine shuttle' },
    { id: 'ld_x3', x: 460, y: 1386, kind: 'xref', link: 'ld_store', target: 'lt_tag', label: 'triacylglycerol synthesis' },
  ],
  edges: [
    { id: 'e_ld1', from: 'ld_tag0', to: 'ld_mic', style: 'plain', tags: 'bile salts emulsify the fat', tagPos: 'r', plainTag: true },
    { id: 'e_ld2', from: 'ld_mic', to: 'ld_prod', enz: 'l_ilip' },
    { id: 'e_ld3', from: 'ld_prod', to: 'ld_tag1', style: 'plain', tags: 'taken up by the mucosa, re-esterified', tagPos: 'r', plainTag: true },
    { id: 'e_ld4', from: 'ld_tag1', to: 'ld_chylo', style: 'plain', tags: '+ cholesterol, apolipoproteins', tagPos: 'r', plainTag: true },
    { id: 'e_ld5', from: 'ld_chylo', to: 'ld_tag2', style: 'plain', tags: 'lymph → blood → muscle, adipose', tagPos: 'r', plainTag: true },
    { id: 'e_ld6', from: 'ld_tag2', to: 'ld_fa', enz: 'l_lpl', tags: 'activated by apoC-II', tagPos: 'r', plainTag: true },
    { id: 'e_ld7', from: 'ld_fa', to: 'ld_ox', style: 'plain' },
    { id: 'e_ld8', from: 'ld_fa', to: 'ld_store', style: 'plain' },
  ],
};

// ───────── Plate 10 · glycerol into glycolysis (slide 8) ─────────
const p10: PlateDef = {
  id: 'r_l10', plate: 10, part: 'III', title: 'Glycerol into glycolysis', sub: '5% of a fat’s energy', w: 700, h: 900,
  nodes: [
    { id: 'lg_gly', x: 240, y: 130, mol: 'glycerol' },
    { id: 'lg_g3p', x: 240, y: 330, mol: 'g3pgly', label: 'L-Glycerol 3-phosphate' },
    { id: 'lg_dhap', x: 240, y: 530, mol: 'dhap' },
    { id: 'lg_gap', x: 240, y: 730, mol: 'g3p', label: 'D-Glyceraldehyde 3-phosphate' },
    { id: 'l_c_glycerol', x: 520, y: 300, kind: 'card', card: 'l_c_glycerol', label: 'Glycerol vs fatty acids' },
    { id: 'lg_x1', x: 240, y: 816, kind: 'xref', link: 'lg_gap', target: 'g3p', label: 'oxidized in glycolysis' },
    { id: 'lg_x2', x: 460, y: 126, kind: 'xref', link: 'lg_gly', target: 'ld_prod', label: 'released by lipases' },
  ],
  edges: [
    { id: 'e_lg1', from: 'lg_gly', to: 'lg_g3p', enz: 'l_glk', tags: 'ATP → ADP', tagPos: 'r', co: ['ATP'] },
    { id: 'e_lg2', from: 'lg_g3p', to: 'lg_dhap', enz: 'gpdhc', dir: 'both', tags: 'NAD⁺ → NADH', tagPos: 'r', co: ['NADH'] },
    { id: 'e_lg3', from: 'lg_dhap', to: 'lg_gap', enz: 'tpi', dir: 'both' },
  ],
};

// ───────── Plate 11 · activation and the carnitine shuttle (slides 9–11) ─────────
const p11: PlateDef = {
  id: 'r_l11', plate: 11, part: 'III', title: 'Fatty acid activation & carnitine shuttle', sub: 'cytosol → matrix', w: 900, h: 1180,
  nodes: [
    { id: 'lc_fa', x: 260, y: 150, mol: 'fa' },
    { id: 'lc_facoa', x: 260, y: 340, mol: 'facoa' },
    { id: 'lc_facar_i', x: 260, y: 565, mol: 'facar' },
    { id: 'lc_car_i', x: 650, y: 565, mol: 'carnitine' },
    { id: 'lc_facar_m', x: 260, y: 800, mol: 'facar' },
    { id: 'lc_car_m', x: 650, y: 850, mol: 'carnitine' },
    { id: 'lc_facoa_m', x: 260, y: 1030, mol: 'facoa' },
    { id: 'l_c_shuttle', x: 660, y: 150, kind: 'card', card: 'l_c_shuttle', label: 'Why a shuttle?' },
    { id: 'lc_x1', x: 520, y: 1026, kind: 'xref', link: 'lc_facoa_m', target: 'lb_facoa', label: 'enters β-oxidation' },
    { id: 'lc_x2', x: 460, y: 104, kind: 'xref', link: 'lc_fa', target: 'ld_fa', label: 'from lipoprotein lipase' },
  ],
  edges: [
    { id: 'e_lc1', from: 'lc_fa', to: 'lc_facoa', enz: 'l_acs', dir: 'both', tags: 'ATP + CoA → AMP + PPi', tagPos: 'r', co: ['ATP', 'CoA'] },
    { id: 'e_lc2', from: 'lc_facoa', to: 'lc_facar_i', enz: 'l_cat1', feed: 'lc_car_i', tags: '− CoA-SH', tagPos: 'l', co: ['CoA'] },
    { id: 'e_lc3', from: 'lc_facar_i', to: 'lc_facar_m', enz: 'l_cact' },
    { id: 'e_lc4', from: 'lc_facar_m', to: 'lc_facoa_m', enz: 'l_cat2', tags: '+ CoA-SH', tagPos: 'l', out: 'lc_car_m', co: ['CoA'] },
    { id: 'e_lc5', from: 'lc_car_m', to: 'lc_car_i', enz: 'l_cact', t: 0.56 },
  ],
  bands: [
    { id: 'b_lc_out', x: 20, y: 420, w: 860, h: 50 },
    { id: 'b_lc_in', x: 20, y: 650, w: 860, h: 60 },
  ],
  captions: [
    { x: 30, y: 92, text: 'CYTOSOL' },
    { x: 870, y: 450, text: 'OUTER MEMBRANE', anchor: 'end' },
    { x: 30, y: 498, text: 'INTERMEMBRANE SPACE' },
    { x: 870, y: 685, text: 'INNER MEMBRANE', anchor: 'end' },
    { x: 30, y: 740, text: 'MATRIX' },
  ],
};

// ───────── Plate 12 · β-oxidation (slides 12–15) ─────────
const p12: PlateDef = {
  id: 'r_l12', plate: 12, part: 'III', title: 'β-Oxidation', sub: 'mitochondrial matrix', w: 940, h: 1180,
  nodes: [
    { id: 'lb_facoa', x: 500, y: 140, mol: 'facoa', label: 'Fatty acyl-CoA (Cₙ)' },
    { id: 'lb_enoyl', x: 500, y: 340, mol: 'enoylcoa' },
    { id: 'lb_hyd', x: 500, y: 540, mol: 'hacoa' },
    { id: 'lb_keto', x: 500, y: 740, mol: 'kacoa' },
    { id: 'lb_short', x: 500, y: 940, mol: 'facoa', label: 'Fatty acyl-CoA (Cₙ₋₂)' },
    { id: 'lb_accoa', x: 800, y: 940, mol: 'accoa' },
    { id: 'l_c_stages', x: 790, y: 340, kind: 'card', card: 'l_c_stages', label: 'Three stages' },
    { id: 'l_c_yield', x: 790, y: 540, kind: 'card', card: 'l_c_yield', label: 'ATP yield' },
    { id: 'lb_x1', x: 800, y: 1022, kind: 'xref', link: 'lb_accoa', target: 'accoa', label: 'enters the citric acid cycle' },
    { id: 'lb_x2', x: 700, y: 106, kind: 'xref', link: 'lb_facoa', target: 'lc_facoa_m', label: 'from the carnitine shuttle' },
    { id: 'lb_x3', x: 270, y: 1090, kind: 'xref', target: 'cx1', label: 'NADH, FADH₂ → respiratory chain' },
  ],
  edges: [
    { id: 'e_lb1', from: 'lb_facoa', to: 'lb_enoyl', enz: 'l_acd', tags: 'FAD → FADH₂', tagPos: 'l', co: ['FADH2'] },
    { id: 'e_lb2', from: 'lb_enoyl', to: 'lb_hyd', enz: 'l_ech', tags: '+ H₂O', tagPos: 'l' },
    { id: 'e_lb3', from: 'lb_hyd', to: 'lb_keto', enz: 'l_hadh', tags: 'NAD⁺ → NADH', tagPos: 'l', co: ['NADH'] },
    { id: 'e_lb4', from: 'lb_keto', to: 'lb_short', enz: 'l_thio', tags: '+ CoA-SH', tagPos: 'l', out: 'lb_accoa', co: ['CoA'] },
    { id: 'e_lb5', from: 'lb_short', to: 'lb_facoa', style: 'plain', via: [[130, 940], [130, 140]] },
  ],
  labels: [{ x: 150, y: 560, kind: 'phase', text: 'Repeat', sub: ['palmitoyl-CoA (C₁₆):', '7 passes → 8 acetyl-CoA'] }],
};

// ───────── Plate 13 · unsaturated and odd-chain fatty acids (slides 16–19) ─────────
const p13: PlateDef = {
  id: 'r_l13', plate: 13, part: 'III', title: 'Unsaturated & odd-chain fatty acids', sub: 'extra enzymes', w: 1240, h: 1320,
  nodes: [
    // monounsaturated: oleate
    { id: 'lo_ole', x: 210, y: 150, mol: 'oleoylcoa', label: 'Oleoyl-CoA (cis-9-C18:1)' },
    { id: 'lo_c3', x: 210, y: 380, mol: 'c3dodec' },
    { id: 'lo_t2', x: 210, y: 610, mol: 't2dodec' },
    { id: 'lo_out', x: 210, y: 840, kind: 'small', label: '6 acetyl-CoA' },
    { id: 'lo_x', x: 210, y: 908, kind: 'xref', link: 'lo_out', target: 'lb_enoyl', label: 'same steps as β-oxidation' },
    // polyunsaturated: linoleate
    { id: 'ln_lin', x: 630, y: 150, mol: 'linoleoylcoa', label: 'Linoleoyl-CoA (cis-Δ⁹,cis-Δ¹²)' },
    { id: 'ln_c3c6', x: 630, y: 330, mol: 'c3c6' },
    { id: 'ln_t2c6', x: 630, y: 510, mol: 't2c6' },
    { id: 'ln_t2c4', x: 630, y: 690, mol: 't2c4' },
    { id: 'ln_t3', x: 630, y: 870, mol: 't3dec' },
    { id: 'ln_t2', x: 630, y: 1050, mol: 't2dec' },
    { id: 'ln_out', x: 630, y: 1230, kind: 'small', label: '5 acetyl-CoA' },
    // odd-numbered chains
    { id: 'lp_odd', x: 1040, y: 150, kind: 'small', label: 'Odd-chain fatty acyl-CoA' },
    { id: 'lp_prop', x: 1040, y: 350, mol: 'propcoa' },
    { id: 'lp_dmm', x: 1040, y: 580, mol: 'dmmcoa' },
    { id: 'lp_lmm', x: 1040, y: 810, mol: 'lmmcoa' },
    { id: 'lp_suc', x: 1040, y: 1040, mol: 'succoa' },
    { id: 'lp_x', x: 1040, y: 1122, kind: 'xref', link: 'lp_suc', target: 'succoa', label: 'enters the citric acid cycle' },
    { id: 'l_c_unsat', x: 1040, y: 1230, kind: 'card', card: 'l_c_unsat', label: 'Why extra enzymes?' },
  ],
  edges: [
    { id: 'e_lo1', from: 'lo_ole', to: 'lo_c3', enz: 'l_box', tags: '3 rounds · 3 acetyl-CoA', tagPos: 'r', plainTag: true },
    { id: 'e_lo2', from: 'lo_c3', to: 'lo_t2', enz: 'l_eci', dir: 'both' },
    { id: 'e_lo3', from: 'lo_t2', to: 'lo_out', enz: 'l_box', tags: '5 rounds', tagPos: 'r', plainTag: true },
    { id: 'e_ln1', from: 'ln_lin', to: 'ln_c3c6', enz: 'l_box', tags: '3 rounds · 3 acetyl-CoA', tagPos: 'r', plainTag: true },
    { id: 'e_ln2', from: 'ln_c3c6', to: 'ln_t2c6', enz: 'l_eci', dir: 'both' },
    { id: 'e_ln3', from: 'ln_t2c6', to: 'ln_t2c4', enz: 'l_box', tags: '1 round + first oxidation · 1 acetyl-CoA', tagPos: 'r', plainTag: true },
    { id: 'e_ln4', from: 'ln_t2c4', to: 'ln_t3', enz: 'l_decr', tags: 'NADPH → NADP⁺', tagPos: 'r', co: ['NADPH'] },
    { id: 'e_ln5', from: 'ln_t3', to: 'ln_t2', enz: 'l_eci' },
    { id: 'e_ln6', from: 'ln_t2', to: 'ln_out', enz: 'l_box', tags: '4 rounds', tagPos: 'r', plainTag: true },
    { id: 'e_lp0', from: 'lp_odd', to: 'lp_prop', style: 'plain', tags: 'last round of β-oxidation', tagPos: 'l', plainTag: true },
    { id: 'e_lp1', from: 'lp_prop', to: 'lp_dmm', enz: 'l_pcc', tags: 'HCO₃⁻ + ATP → ADP + Pi', tagPos: 'l', co: ['ATP', 'Pi', 'Biotin'] },
    { id: 'e_lp2', from: 'lp_dmm', to: 'lp_lmm', enz: 'l_mme', dir: 'both' },
    { id: 'e_lp3', from: 'lp_lmm', to: 'lp_suc', enz: 'l_mut', dir: 'both', tags: 'coenzyme B₁₂', tagPos: 'l', plainTag: true, co: ['B12'] },
  ],
  labels: [
    { x: 210, y: 92, kind: 'phase', text: 'Monounsaturated', anchor: 'middle' },
    { x: 630, y: 92, kind: 'phase', text: 'Polyunsaturated', anchor: 'middle' },
    { x: 1040, y: 92, kind: 'phase', text: 'Odd-numbered chain', anchor: 'middle' },
  ],
};

// ───────── Plate 14 · ketone bodies (slides 20–22) ─────────
const p14: PlateDef = {
  id: 'r_l14', plate: 14, part: 'III', title: 'Ketone bodies', sub: 'made in the liver, burned elsewhere', w: 860, h: 1120,
  nodes: [
    { id: 'lk_fa', x: 220, y: 150, kind: 'small', label: 'Fatty acids' },
    { id: 'lk_accoa', x: 220, y: 340, mol: 'accoa', label: 'Acetyl-CoA (liver)' },
    { id: 'lk_oaa', x: 600, y: 340, mol: 'oaa' },
    { id: 'lk_kb', x: 220, y: 570, mols: ['aca', 'bhb', 'acetone'], label: 'Acetoacetate · D-β-hydroxybutyrate · acetone' },
    { id: 'lk_glc', x: 600, y: 570, mol: 'glc', label: 'Glucose (exported)' },
    { id: 'lk_tis', x: 220, y: 790, kind: 'proc', label: 'Heart, skeletal muscle, kidney, brain' },
    { id: 'lk_accoa2', x: 220, y: 990, mol: 'accoa', label: 'Acetyl-CoA (extrahepatic)' },
    { id: 'l_c_ketone', x: 640, y: 790, kind: 'card', card: 'l_c_ketone', label: 'Ketone bodies' },
    { id: 'l_c_ketosis', x: 640, y: 850, kind: 'card', card: 'l_c_ketosis', label: 'Starvation & diabetes' },
    { id: 'lk_x0', x: 490, y: 146, kind: 'xref', link: 'lk_fa', target: 'lb_accoa', label: 'acetyl-CoA from β-oxidation' },
    { id: 'lk_x1', x: 600, y: 262, kind: 'xref', link: 'lk_oaa', target: 'oaag', label: 'drained into gluconeogenesis' },
    { id: 'lk_x2', x: 220, y: 1074, kind: 'xref', link: 'lk_accoa2', target: 'accoa', label: 'oxidized in the citric acid cycle' },
  ],
  edges: [
    { id: 'e_lk0', from: 'lk_fa', to: 'lk_accoa', style: 'plain', tags: 'β-oxidation', tagPos: 'r', plainTag: true },
    { id: 'e_lk1', from: 'lk_accoa', to: 'lk_kb', enz: 'l_kbf', tags: '→ CoA', tagPos: 'r', co: ['CoA'] },
    { id: 'e_lk2', from: 'lk_kb', to: 'lk_tis', style: 'plain', tags: 'exported in the blood', tagPos: 'r', plainTag: true },
    { id: 'e_lk3', from: 'lk_tis', to: 'lk_accoa2', enz: 'l_kbu' },
    { id: 'e_lk4', from: 'lk_oaa', to: 'lk_glc', style: 'plain', tags: 'gluconeogenesis', tagPos: 'r', plainTag: true },
  ],
  labels: [{ x: 40, y: 92, kind: 'phase', text: 'Hepatocyte' }, { x: 40, y: 700, kind: 'phase', text: 'Other tissues' }],
};

// ───────── Plate 15 · export of acetyl-CoA: the citrate shuttle (slides 24–26) ─────────
const p15: PlateDef = {
  id: 'r_l15', plate: 15, part: 'III', title: 'Citrate shuttle', sub: 'acetyl groups out of the mitochondrion', w: 1020, h: 1150,
  nodes: [
    { id: 'ls_cit_m', x: 270, y: 210, mol: 'cit' },
    { id: 'ls_accoa_m', x: 100, y: 345, mol: 'accoa' },
    { id: 'ls_oaa_m', x: 270, y: 480, mol: 'oaa' },
    { id: 'ls_mal_m', x: 340, y: 720, mol: 'mal' },
    { id: 'ls_pyr_m', x: 110, y: 960, mol: 'pyr' },
    { id: 'ls_cit_c', x: 770, y: 210, mol: 'cit' },
    { id: 'ls_oaa_c', x: 770, y: 480, mol: 'oaa' },
    { id: 'ls_accoa_c', x: 930, y: 345, mol: 'accoa' },
    { id: 'ls_mal_c', x: 770, y: 720, mol: 'mal' },
    { id: 'ls_pyr_c', x: 770, y: 960, mol: 'pyr' },
    { id: 'l_c_export', x: 770, y: 1090, kind: 'card', card: 'l_c_export', label: 'Why a shuttle? Cost: 2 ATP' },
    { id: 'ls_x1', x: 100, y: 268, kind: 'xref', link: 'ls_accoa_m', target: 'accoa', label: 'multiple sources' },
    { id: 'ls_x2', x: 930, y: 426, kind: 'xref', link: 'ls_accoa_c', target: 'lf_accoa', label: 'fatty acid synthesis' },
    { id: 'ls_x3', x: 900, y: 892, kind: 'xref', target: 'lf_kacp', label: 'NADPH for fatty acid synthesis' },
  ],
  edges: [
    { id: 'e_ls1', from: 'ls_oaa_m', to: 'ls_cit_m', enz: 'cs', feed: 'ls_accoa_m', tags: '− CoA-SH', tagPos: 'r', co: ['CoA'] },
    { id: 'e_ls2', from: 'ls_cit_m', to: 'ls_cit_c', enz: 'l_citt' },
    { id: 'e_ls3', from: 'ls_cit_c', to: 'ls_oaa_c', enz: 'l_acl', tags: 'ATP + CoA-SH → ADP + Pi', tagPos: 'l', out: 'ls_accoa_c', co: ['ATP', 'CoA', 'Pi'] },
    { id: 'e_ls4', from: 'ls_oaa_c', to: 'ls_mal_c', enz: 'mdh', tags: 'NADH → NAD⁺', tagPos: 'l', co: ['NADH'] },
    { id: 'e_ls5', from: 'ls_mal_c', to: 'ls_pyr_c', enz: 'l_me', tags: 'NADP⁺ → NADPH + CO₂', tagPos: 'r', co: ['NADPH', 'CO2'] },
    { id: 'e_ls6', from: 'ls_pyr_c', to: 'ls_pyr_m', enz: 'l_pyrt', t: 0.38 },
    { id: 'e_ls7', from: 'ls_pyr_m', to: 'ls_oaa_m', enz: 'pc', tags: 'ATP + CO₂ → ADP + Pi', tagPos: 'l', co: ['ATP', 'CO2', 'Pi'] },
    { id: 'e_ls8', from: 'ls_mal_c', to: 'ls_mal_m', enz: 'mkt', t: 0.6 },
    { id: 'e_ls9', from: 'ls_mal_m', to: 'ls_oaa_m', enz: 'mdh', tags: 'NAD⁺ → NADH', tagPos: 'r', co: ['NADH'] },
  ],
  bands: [{ id: 'b_ls', x: 470, y: 150, w: 80, h: 880 }],
  captions: [
    { x: 40, y: 110, text: 'MITOCHONDRIAL MATRIX' },
    { x: 590, y: 110, text: 'CYTOSOL' },
    { x: 510, y: 1058, text: 'INNER MEMBRANE', anchor: 'middle' },
  ],
};

// ───────── Plate 16 · fatty acid synthesis (slides 27–32) ─────────
const p16: PlateDef = {
  id: 'r_l16', plate: 16, part: 'III', title: 'Fatty acid synthesis', sub: 'cytosol · fatty acid synthase I', w: 1060, h: 1620,
  nodes: [
    { id: 'lf_accoa', x: 220, y: 150, mol: 'accoa', label: 'Acetyl-CoA (cytosol)' },
    { id: 'lf_malcoa', x: 220, y: 400, mol: 'malcoa' },
    { id: 'lf_malacp', x: 220, y: 650, mol: 'malacp' },
    { id: 'lf_acyl', x: 640, y: 650, mol: 'acylacp', label: 'Acyl-ACP (Cₙ)' },
    { id: 'lf_kacp', x: 640, y: 860, mol: 'kacp' },
    { id: 'lf_hacp', x: 640, y: 1070, mol: 'hacp' },
    { id: 'lf_eacp', x: 640, y: 1280, mol: 'eacp' },
    { id: 'lf_acyl2', x: 640, y: 1490, mol: 'acylacp', label: 'Acyl-ACP (Cₙ₊₂)' },
    { id: 'lf_palm', x: 230, y: 1490, mol: 'palmitate', label: 'Palmitate (16:0)' },
    { id: 'l_c_fas', x: 880, y: 150, kind: 'card', card: 'l_c_fas', label: 'Fatty acid synthase' },
    { id: 'l_c_fasnet', x: 880, y: 210, kind: 'card', card: 'l_c_fasnet', label: 'Overall reaction' },
    { id: 'l_c_reg', x: 820, y: 270, kind: 'card', card: 'l_c_reg', label: 'Synthesis vs breakdown' },
    { id: 'lf_x1', x: 220, y: 80, kind: 'xref', link: 'lf_accoa', target: 'ls_accoa_c', label: 'from the citrate shuttle' },
    { id: 'lf_x2', x: 230, y: 1574, kind: 'xref', link: 'lf_palm', target: 'le_pal', label: 'elongation & desaturation' },
    { id: 'lf_x3', x: 330, y: 880, kind: 'xref', target: 'lactone', label: 'NADPH from the pentose phosphate pathway' },
    { id: 'lf_x4', x: 330, y: 930, kind: 'xref', target: 'ls_mal_c', label: 'NADPH from malic enzyme' },
  ],
  edges: [
    { id: 'e_lf1', from: 'lf_accoa', to: 'lf_malcoa', enz: 'l_acc', tags: 'HCO₃⁻ + ATP → ADP + Pi', tagPos: 'l', co: ['ATP', 'Pi', 'Biotin'] },
    { id: 'e_lf2', from: 'lf_malcoa', to: 'lf_malacp', enz: 'l_mat', tags: '− CoA', tagPos: 'r', co: ['CoA'] },
    { id: 'e_lf3', from: 'lf_accoa', to: 'lf_acyl', enz: 'l_mat', via: [[640, 150]], t: 0.7, tags: 'first acyl group: acetyl', tagPos: 'r', plainTag: true },
    { id: 'e_lf4', from: 'lf_acyl', to: 'lf_kacp', enz: 'l_ks', feed: 'lf_malacp', tags: '− CO₂', tagPos: 'r', co: ['CO2'] },
    { id: 'e_lf5', from: 'lf_kacp', to: 'lf_hacp', enz: 'l_kr', tags: 'NADPH → NADP⁺', tagPos: 'r', co: ['NADPH'] },
    { id: 'e_lf6', from: 'lf_hacp', to: 'lf_eacp', enz: 'l_dh', tags: '− H₂O', tagPos: 'r' },
    { id: 'e_lf7', from: 'lf_eacp', to: 'lf_acyl2', enz: 'l_er', tags: 'NADPH → NADP⁺', tagPos: 'r', co: ['NADPH'] },
    { id: 'e_lf8', from: 'lf_acyl2', to: 'lf_acyl', style: 'plain', via: [[980, 1490], [980, 650]] },
    { id: 'e_lf9', from: 'lf_acyl2', to: 'lf_palm', style: 'plain', tags: 'released after 7 rounds', tagPos: 'above', plainTag: true },
  ],
  labels: [{ x: 330, y: 1080, kind: 'phase', text: 'Repeat', sub: ['7 rounds: C₄ → C₆ → … → C₁₆', 'no intermediate is released'] }],
};

// ───────── Plate 17 · elongation and desaturation (slides 33–35) ─────────
const p17: PlateDef = {
  id: 'r_l17', plate: 17, part: 'III', title: 'Elongation & desaturation', sub: 'smooth ER & mitochondria', w: 1060, h: 1430,
  nodes: [
    { id: 'le_pal', x: 320, y: 140, mol: 'palmitate', label: 'Palmitate 16:0' },
    { id: 'le_pol', x: 780, y: 270, mol: 'palmitoleate', label: 'Palmitoleate 16:1(Δ⁹)' },
    { id: 'le_ste', x: 320, y: 350, mol: 'stearate', label: 'Stearate 18:0' },
    { id: 'le_long', x: 780, y: 480, kind: 'small', label: 'Longer saturated fatty acids' },
    { id: 'le_ole', x: 320, y: 560, mol: 'oleate', label: 'Oleate 18:1(Δ⁹)' },
    { id: 'le_lin', x: 320, y: 790, mol: 'linoleate', label: 'Linoleate 18:2(Δ⁹,¹²)', badge: 'essential' },
    { id: 'le_ala', x: 170, y: 1040, mol: 'alinolenate', label: 'α-Linolenate 18:3(Δ⁹,¹²,¹⁵)', badge: 'essential' },
    { id: 'le_oth', x: 170, y: 1240, kind: 'small', label: 'Other polyunsaturated fatty acids' },
    { id: 'le_gla', x: 640, y: 1040, mol: 'glinolenate', label: 'γ-Linolenate 18:3(Δ⁶,⁹,¹²)' },
    { id: 'le_eic', x: 640, y: 1190, mol: 'eicosatrienoate', label: 'Eicosatrienoate 20:3(Δ⁸,¹¹,¹⁴)' },
    { id: 'le_ara', x: 640, y: 1340, mol: 'arachidonate', label: 'Arachidonate 20:4(Δ⁵,⁸,¹¹,¹⁴)' },
    { id: 'l_c_elong', x: 860, y: 640, kind: 'card', card: 'l_c_elong', label: 'After palmitate' },
    { id: 'l_c_essential', x: 860, y: 790, kind: 'card', card: 'l_c_essential', label: 'Essential fatty acids' },
    { id: 'le_x1', x: 620, y: 136, kind: 'xref', link: 'le_pal', target: 'lf_palm', label: 'from fatty acid synthase' },
  ],
  edges: [
    { id: 'e_le1', from: 'le_pal', to: 'le_ste', enz: 'l_elong' },
    { id: 'e_le2', from: 'le_pal', to: 'le_pol', enz: 'l_desat' },
    { id: 'e_le3', from: 'le_ste', to: 'le_ole', enz: 'l_desat', tags: 'O₂ + NADPH → 2 H₂O + NADP⁺', tagPos: 'r', co: ['NADPH'] },
    { id: 'e_le4', from: 'le_ste', to: 'le_long', enz: 'l_elong' },
    { id: 'e_le5', from: 'le_ole', to: 'le_lin', enz: 'l_desat2', tags: 'in plants only', tagPos: 'r', plainTag: true },
    { id: 'e_le6', from: 'le_lin', to: 'le_ala', enz: 'l_desat2', tags: 'in plants only', tagPos: 'l', plainTag: true },
    { id: 'e_le7', from: 'le_ala', to: 'le_oth', style: 'plain' },
    { id: 'e_le8', from: 'le_lin', to: 'le_gla', enz: 'l_desat2' },
    { id: 'e_le9', from: 'le_gla', to: 'le_eic', enz: 'l_elong' },
    { id: 'e_le10', from: 'le_eic', to: 'le_ara', enz: 'l_desat2' },
  ],
};

// ───────── Plate 18 · triacylglycerols and phospholipids (slides 40–44) ─────────
const p18: PlateDef = {
  id: 'r_l18', plate: 18, part: 'III', title: 'Triacylglycerols & phospholipids', sub: 'storage fat and membranes', w: 1060, h: 1440,
  nodes: [
    { id: 'lt_dhap', x: 240, y: 170, mol: 'dhap' },
    { id: 'lt_gly', x: 580, y: 170, mol: 'glycerol' },
    { id: 'lt_g3p', x: 410, y: 380, mol: 'g3pgly', label: 'L-Glycerol 3-phosphate' },
    { id: 'lt_fa', x: 870, y: 380, mol: 'fa' },
    { id: 'lt_facoa', x: 870, y: 620, mol: 'facoa' },
    { id: 'lt_pa', x: 410, y: 640, mol: 'pa' },
    { id: 'lt_dag', x: 230, y: 900, mol: 'dag' },
    { id: 'lt_facoa2', x: 520, y: 1025, mol: 'facoa' },
    { id: 'lt_tag', x: 230, y: 1150, mol: 'tag' },
    { id: 'lt_gpl', x: 680, y: 900, mol: 'gpl' },
    { id: 'lt_pco', x: 680, y: 1130, mol: 'pcole', label: 'Phosphatidylcholine (oleate, 18:1Δ⁹)' },
    { id: 'lt_pcl', x: 680, y: 1350, mol: 'pclin', label: 'Phosphatidylcholine (linoleate, 18:2Δ⁹,¹²)' },
    { id: 'l_c_tag', x: 870, y: 170, kind: 'card', card: 'l_c_tag', label: 'Two fates' },
    { id: 'l_c_insulin', x: 230, y: 1350, kind: 'card', card: 'l_c_insulin', label: 'Insulin' },
    { id: 'lt_x1', x: 240, y: 88, kind: 'xref', link: 'lt_dhap', target: 'dhap', label: 'from glycolysis, or from pyruvate by a short gluconeogenesis' },
    { id: 'lt_x2', x: 870, y: 300, kind: 'xref', link: 'lt_fa', target: 'lf_palm', label: 'made by fatty acid synthase' },
  ],
  edges: [
    { id: 'e_lt1', from: 'lt_dhap', to: 'lt_g3p', enz: 'gpdhc', tags: 'NADH → NAD⁺', tagPos: 'l', co: ['NADH'] },
    { id: 'e_lt2', from: 'lt_gly', to: 'lt_g3p', enz: 'l_glk', tags: 'ATP → ADP', tagPos: 'r', co: ['ATP'] },
    { id: 'e_lt3', from: 'lt_fa', to: 'lt_facoa', enz: 'l_acs', dir: 'both', tags: 'ATP + CoA → AMP + PPi', tagPos: 'l', co: ['ATP', 'CoA'] },
    { id: 'e_lt4', from: 'lt_g3p', to: 'lt_pa', enz: 'l_gpat', feed: 'lt_facoa', tags: '− 2 CoA-SH', tagPos: 'l', co: ['CoA'] },
    { id: 'e_lt5', from: 'lt_pa', to: 'lt_dag', enz: 'l_pap' },
    { id: 'e_lt6', from: 'lt_dag', to: 'lt_tag', enz: 'l_dgat', feed: 'lt_facoa2', tags: '− CoA-SH', tagPos: 'l', co: ['CoA'] },
    { id: 'e_lt7', from: 'lt_pa', to: 'lt_gpl', enz: 'l_head', tags: 'serine, choline, ethanolamine…', tagPos: 'r', plainTag: true },
    { id: 'e_lt8', from: 'lt_gpl', to: 'lt_pco', style: 'plain', tags: 'e.g. phosphatidylcholine', tagPos: 'r', plainTag: true },
    { id: 'e_lt9', from: 'lt_pco', to: 'lt_pcl', enz: 'l_pldes' },
  ],
};

// ───────── Plate 19 · cholesterol and steroid hormones (slides 45–47) ─────────
const p19: PlateDef = {
  id: 'r_l19', plate: 19, part: 'III', title: 'Cholesterol & steroid hormones', sub: 'isoprenoids', w: 1000, h: 1740,
  nodes: [
    { id: 'lh_ac', x: 360, y: 150, mol: 'accoa', label: 'Acetyl-CoA (3 acetate units)' },
    { id: 'lh_mev', x: 360, y: 360, mol: 'mevalonate' },
    { id: 'lh_ipp', x: 360, y: 570, mol: 'ipp' },
    { id: 'lh_sq', x: 360, y: 780, mol: 'squalene', label: 'Squalene (C₃₀)' },
    { id: 'lh_chol', x: 360, y: 990, mol: 'cholesterol' },
    { id: 'lh_preg', x: 360, y: 1160, mol: 'pregnenolone' },
    { id: 'lh_prog', x: 360, y: 1330, mol: 'progesterone' },
    { id: 'lh_cort', x: 110, y: 1510, mol: 'cortisol', badge: 'glucocorticoid' },
    { id: 'lh_ccs', x: 400, y: 1510, mol: 'corticosterone', badge: 'mineralocorticoid' },
    { id: 'lh_ald', x: 400, y: 1670, mol: 'aldosterone', badge: 'mineralocorticoid' },
    { id: 'lh_test', x: 760, y: 1510, mol: 'testosterone' },
    { id: 'lh_est', x: 760, y: 1670, mol: 'estradiol' },
    { id: 'l_c_chol', x: 780, y: 360, kind: 'card', card: 'l_c_chol', label: 'Cholesterol & isoprenoids' },
    { id: 'l_c_steroid', x: 780, y: 1250, kind: 'card', card: 'l_c_steroid', label: 'Steroid hormones' },
    { id: 'lh_x1', x: 660, y: 146, kind: 'xref', link: 'lh_ac', target: 'ls_accoa_c', label: 'cytosolic acetyl-CoA' },
    { id: 'lh_x2', x: 620, y: 566, kind: 'xref', link: 'lh_ipp', target: 'q', label: 'also ubiquinone (Q)' },
  ],
  edges: [
    { id: 'e_lh1', from: 'lh_ac', to: 'lh_mev', enz: 'l_ch1' },
    { id: 'e_lh2', from: 'lh_mev', to: 'lh_ipp', enz: 'l_ch2' },
    { id: 'e_lh3', from: 'lh_ipp', to: 'lh_sq', enz: 'l_ch3' },
    { id: 'e_lh4', from: 'lh_sq', to: 'lh_chol', enz: 'l_ch4' },
    { id: 'e_lh5', from: 'lh_chol', to: 'lh_preg', style: 'plain' },
    { id: 'e_lh6', from: 'lh_preg', to: 'lh_prog', style: 'plain' },
    { id: 'e_lh7', from: 'lh_prog', to: 'lh_cort', style: 'plain' },
    { id: 'e_lh8', from: 'lh_prog', to: 'lh_ccs', style: 'plain' },
    { id: 'e_lh9', from: 'lh_ccs', to: 'lh_ald', style: 'plain' },
    { id: 'e_lh10', from: 'lh_prog', to: 'lh_test', style: 'plain' },
    { id: 'e_lh11', from: 'lh_test', to: 'lh_est', style: 'plain' },
  ],
  labels: [{ x: 560, y: 1100, kind: 'phase', text: 'Steroid hormones', sub: ['enzymes not named on the slide'] }],
};

/**
 * Cross-references drawn on the midterm plates, pointing into Part III. They belong to the final exam, so they are
 * hidden in Midterm scope. Absolute coordinates.
 */
const midXrefs: MapNode[] = [
  { id: 'lx_accoa1', x: 1330, y: 2146, kind: 'xref', link: 'accoa', target: 'lb_accoa', label: 'also from β-oxidation' },
  { id: 'lx_accoa2', x: 1330, y: 2192, kind: 'xref', target: 'lk_accoa', label: 'or to ketone bodies (liver)' },
  { id: 'lx_cit', x: 1700, y: 2212, kind: 'xref', link: 'cit', target: 'ls_cit_m', label: 'exported for fatty acid synthesis' },
  { id: 'lx_succoa', x: 2010, y: 2976, kind: 'xref', link: 'succoa', target: 'lp_suc', label: 'also from odd-chain fatty acids' },
  { id: 'lx_dhap1', x: 760, y: 1008, kind: 'xref', link: 'dhap', target: 'lg_dhap', label: 'also from glycerol' },
  { id: 'lx_dhap2', x: 760, y: 1052, kind: 'xref', target: 'lt_g3p', label: '→ glycerol 3-phosphate for fat synthesis' },
  { id: 'lx_nadph', x: 2230, y: 694, kind: 'xref', target: 'lf_kacp', label: 'NADPH → fatty acid synthesis' },
];

// four columns, left to right: fat supply & ketone bodies · β-oxidation · synthesis · storage & sterols
const COL_A = 2600, COL_B = 3500, COL_C = 4780, COL_D = 5880;
const placed = [
  place(p9, COL_A, 20), place(p10, COL_A, 1510), place(p14, COL_A, 2450),
  place(p11, COL_B, 20), place(p12, COL_B, 1240), place(p13, COL_B, 2460),
  place(p15, COL_C, 20), place(p16, COL_C, 1210), place(p17, COL_C, 2870),
  place(p18, COL_D, 20), place(p19, COL_D, 1500),
];

export const lipidScene: Scene = {
  canvas: { w: Math.max(...placed.map((s) => s.canvas.w)) + 40, h: Math.max(...placed.map((s) => s.canvas.h)) + 40 },
  nodes: [...placed.flatMap((s) => s.nodes), ...midXrefs],
  edges: placed.flatMap((s) => s.edges),
  regions: placed.flatMap((s) => s.regions),
  bands: placed.flatMap((s) => s.bands),
  captions: placed.flatMap((s) => s.captions),
  labels: placed.flatMap((s) => s.labels),
  jumps: placed.flatMap((s) => s.jumps),
  decor: [],
};
