import type { PlateDef } from '../plate.ts';

/**
 * Part III (lipid metabolism), drawn into the one-cell map (see atlas.ts). Coordinates are map coordinates.
 * Plates refer to molecules drawn on other plates by id, e.g. β-oxidation hands its acetyl-CoA to the citric acid
 * cycle's `accoa` and glycerol 3-phosphate is made from glycolysis's `dhap`, so the pathways join into one map.
 *
 * Membranes (see atlas.ts): the mitochondrion's outer membrane at y 2560–2610, inner membrane at y 2790–2850 along
 * its top edge; along its right edge the inner membrane is at x 7500–7560 and the outer at x 7740–7790.
 */

// ───────── Plate 9 · dietary fat to the tissues (slides 4–7), a side panel outside the cell ─────────
export const p9: PlateDef = {
  id: 'r_l9', plate: 9, part: 'III', title: 'Dietary fat to the tissues', sub: 'intestine → lymph → blood', x: 1860, y: 60, w: 820, h: 1480, outside: true,
  nodes: [
    { id: 'ld_tag0', x: 2120, y: 190, mol: 'tag', label: 'Dietary triacylglycerols' },
    { id: 'ld_mic', x: 2120, y: 360, kind: 'proc', label: 'Mixed micelles (bile salts + fat)' },
    { id: 'ld_prod', x: 2120, y: 540, mols: ['mag', 'dag', 'fa', 'glycerol'], label: 'Monoacylglycerols · diacylglycerols · fatty acids · glycerol' },
    { id: 'ld_tag1', x: 2120, y: 720, mol: 'tag', label: 'Triacylglycerols (intestinal mucosa)' },
    { id: 'ld_chylo', x: 2120, y: 890, kind: 'proc', label: 'Chylomicrons (100–500 nm)' },
    { id: 'ld_tag2', x: 2120, y: 1060, mol: 'tag', label: 'Triacylglycerols (capillary)' },
    { id: 'ld_fa', x: 2120, y: 1230, mols: ['fa', 'mag'], label: 'Fatty acids + monoacylglycerols' },
    { id: 'l_c_diet', x: 2500, y: 1400, kind: 'card', card: 'l_c_diet', label: 'The 8 steps' },
    { id: 'l_c_fuel', x: 2500, y: 1460, kind: 'card', card: 'l_c_fuel', label: 'Fatty acids as fuel' },
  ],
  edges: [
    { id: 'e_ld1', from: 'ld_tag0', to: 'ld_mic', style: 'plain', tags: 'bile salts emulsify the fat', tagPos: 'r', plainTag: true },
    { id: 'e_ld2', from: 'ld_mic', to: 'ld_prod', enz: 'l_ilip' },
    { id: 'e_ld3', from: 'ld_prod', to: 'ld_tag1', style: 'plain', tags: 'taken up by the mucosa, re-esterified', tagPos: 'r', plainTag: true },
    { id: 'e_ld4', from: 'ld_tag1', to: 'ld_chylo', style: 'plain', tags: '+ cholesterol, apolipoproteins', tagPos: 'r', plainTag: true },
    { id: 'e_ld5', from: 'ld_chylo', to: 'ld_tag2', style: 'plain', tags: 'lymph → blood → muscle, adipose', tagPos: 'r', plainTag: true },
    { id: 'e_ld6', from: 'ld_tag2', to: 'ld_fa', enz: 'l_lpl', tags: 'activated by apoC-II', tagPos: 'r', plainTag: true },
    // into the cell: muscle oxidizes the fatty acids, adipose tissue stores them again (slide 7)
    { id: 'e_ld7', from: 'ld_fa', to: 'lt_fa', style: 'plain', via: [[2120, 1830]], t: 0.62, tags: 'into muscle (oxidized) or adipose (stored)', tagPos: 'above', plainTag: true },
    { id: 'e_ld8', from: 'ld_prod', to: 'lt_gly', style: 'plain', via: [[2760, 540], [2760, 1200]], t: 0.8, tags: 'glycerol, released by lipases', tagPos: 'above', plainTag: true },
  ],
};

// ───────── Plate 10 · glycerol, triacylglycerols and phospholipids (slides 8, 40–44) ─────────
// Glycerol 3-phosphate sits next to glycolysis's DHAP: made from it for fat synthesis, or from glycerol and fed back into it.
export const p10: PlateDef = {
  id: 'r_l10', plate: 10, part: 'III', title: 'Glycerol & fat synthesis', sub: 'triacylglycerols · phospholipids', x: 3180, y: 1060, w: 1860, h: 960,
  nodes: [
    { id: 'lt_gly', x: 4430, y: 1200, mol: 'glycerol' },
    { id: 'lt_g3p', x: 4920, y: 1200, mol: 'g3pgly', label: 'L-Glycerol 3-phosphate' },
    { id: 'lt_pa', x: 4920, y: 1440, mol: 'pa' },
    { id: 'lt_dag', x: 4920, y: 1680, mol: 'dag' },
    { id: 'lt_tag', x: 4920, y: 1930, mol: 'tag' },
    { id: 'lt_fa', x: 3800, y: 1830, mol: 'fa', label: 'Fatty acids' },
    { id: 'lt_facoa', x: 4350, y: 1830, mol: 'facoa' },
    { id: 'lt_gpl', x: 4330, y: 1440, mol: 'gpl' },
    { id: 'lt_pco', x: 3700, y: 1440, mol: 'pcole', label: 'Phosphatidylcholine (oleate, 18:1Δ⁹)' },
    { id: 'lt_pcl', x: 3700, y: 1640, mol: 'pclin', label: 'Phosphatidylcholine (linoleate, 18:2Δ⁹,¹²)' },
    { id: 'l_c_glycerol', x: 3420, y: 1130, kind: 'card', card: 'l_c_glycerol', label: 'Glycerol vs fatty acids' },
    { id: 'l_c_tag', x: 3420, y: 1270, kind: 'card', card: 'l_c_tag', label: 'Two fates' },
    { id: 'l_c_insulin', x: 3420, y: 1330, kind: 'card', card: 'l_c_insulin', label: 'Insulin' },
    { id: 'lt_x2', x: 3800, y: 1906, kind: 'xref', link: 'lt_fa', target: 'lf_palm', label: 'also made by fatty acid synthase' },
  ],
  edges: [
    { id: 'e_lt1', from: 'dhap', to: 'lt_g3p', enz: 'gpdhc', dir: 'both', tags: 'NADH → NAD⁺', tagPos: 'l', co: ['NADH'] },
    { id: 'e_lt2', from: 'lt_gly', to: 'lt_g3p', enz: 'l_glk', tags: 'ATP → ADP', tagPos: 'above', co: ['ATP'] },
    { id: 'e_lt3', from: 'lt_fa', to: 'lt_facoa', enz: 'l_acs', dir: 'both', tags: 'ATP + CoA → AMP + PPi', tagPos: 'below', co: ['ATP', 'CoA'] },
    { id: 'e_lt4', from: 'lt_g3p', to: 'lt_pa', enz: 'l_gpat', feed: 'lt_facoa', tags: '− 2 CoA-SH', tagPos: 'r', co: ['CoA'] },
    { id: 'e_lt5', from: 'lt_pa', to: 'lt_dag', enz: 'l_pap' },
    { id: 'e_lt6', from: 'lt_dag', to: 'lt_tag', enz: 'l_dgat', feed: 'lt_facoa', tags: '− CoA-SH', tagPos: 'r', co: ['CoA'] },
    { id: 'e_lt7', from: 'lt_pa', to: 'lt_gpl', enz: 'l_head', tags: 'serine, choline, ethanolamine…', tagPos: 'below', plainTag: true },
    { id: 'e_lt8', from: 'lt_gpl', to: 'lt_pco', style: 'plain', tags: 'e.g. phosphatidylcholine', tagPos: 'above', plainTag: true },
    { id: 'e_lt9', from: 'lt_pco', to: 'lt_pcl', enz: 'l_pldes' },
  ],
};

// ───────── Plate 11 · the carnitine shuttle (slides 9–11), across both mitochondrial membranes ─────────
// Carnitine acyltransferase I sits on the outer membrane, the translocase in the inner one, CAT II in the matrix.
export const p11: PlateDef = {
  id: 'r_l11', plate: 11, part: 'III', title: 'Carnitine shuttle', sub: 'into the matrix', x: 3900, y: 2040, w: 700, h: 1060,
  nodes: [
    { id: 'lc_car_i', x: 3995, y: 2700, mol: 'carnitine' },
    { id: 'lc_facar_i', x: 4350, y: 2700, mol: 'facar' },
    { id: 'lc_facar_m', x: 4350, y: 2950, mol: 'facar' },
    { id: 'lc_car_m', x: 3995, y: 2990, mol: 'carnitine' },
    { id: 'l_c_shuttle', x: 4130, y: 2150, kind: 'card', card: 'l_c_shuttle', label: 'Why a shuttle?' },
  ],
  edges: [
    { id: 'e_lc2', from: 'lt_facoa', to: 'lc_facar_i', enz: 'l_cat1', feed: 'lc_car_i', t: 0.884, tags: '− CoA-SH', tagPos: 'r', co: ['CoA'] },
    { id: 'e_lc3', from: 'lc_facar_i', to: 'lc_facar_m', enz: 'l_cact' },
    { id: 'e_lc4', from: 'lc_facar_m', to: 'lb_facoa', enz: 'l_cat2', tags: '+ CoA-SH', tagPos: 'r', out: 'lc_car_m', co: ['CoA'] },
    { id: 'e_lc5', from: 'lc_car_m', to: 'lc_car_i', enz: 'l_cact', t: 0.5 },
  ],
};

// ───────── Plate 12 · β-oxidation (slides 12–15), drawn as the loop it is ─────────
// Each turn hands one acetyl-CoA straight to the citric acid cycle's acetyl-CoA.
export const p12: PlateDef = {
  id: 'r_l12', plate: 12, part: 'III', title: 'β-Oxidation', sub: 'mitochondrial matrix', x: 3960, y: 3120, w: 1090, h: 920,
  nodes: [
    { id: 'lb_facoa', x: 4350, y: 3230, mol: 'facoa', label: 'Fatty acyl-CoA (Cₙ)' },
    { id: 'lb_enoyl', x: 4130, y: 3520, mol: 'enoylcoa' },
    { id: 'lb_hyd', x: 4380, y: 3840, mol: 'hacoa' },
    { id: 'lb_keto', x: 4800, y: 3740, mol: 'kacoa' },
    { id: 'lb_short', x: 4800, y: 3340, mol: 'facoa', label: 'Fatty acyl-CoA (Cₙ₋₂)' },
    { id: 'l_c_stages', x: 4150, y: 3990, kind: 'card', card: 'l_c_stages', label: 'Three stages' },
    { id: 'l_c_yield', x: 4390, y: 3990, kind: 'card', card: 'l_c_yield', label: 'ATP yield' },
    { id: 'l_c_vs2', x: 4660, y: 3990, kind: 'card', card: 'l_c_vs', label: 'Compare with synthesis' },
  ],
  edges: [
    { id: 'e_lb1', from: 'lb_facoa', to: 'lb_enoyl', enz: 'l_acd', tags: 'FAD → FADH₂', tagPos: 'l', co: ['FADH2'] },
    { id: 'e_lb2', from: 'lb_enoyl', to: 'lb_hyd', enz: 'l_ech', tags: '+ H₂O', tagPos: 'l' },
    { id: 'e_lb3', from: 'lb_hyd', to: 'lb_keto', enz: 'l_hadh', tags: 'NAD⁺ → NADH', tagPos: 'below', co: ['NADH'] },
    { id: 'e_lb4', from: 'lb_keto', to: 'lb_short', enz: 'l_thio', tags: '+ CoA-SH', tagPos: 'r', out: 'accoa', co: ['CoA'] },
    { id: 'e_lb5', from: 'lb_short', to: 'lb_facoa', style: 'plain' },
  ],
  labels: [{ x: 4520, y: 3530, kind: 'phase', text: 'Repeat', anchor: 'middle', sub: ['palmitoyl-CoA (C₁₆):', '7 passes → 8 acetyl-CoA'] }],
};

// ───────── Plate 13 · odd-chain fatty acids (slide 16): propionyl-CoA up into the cycle's succinyl-CoA ─────────
export const p13: PlateDef = {
  id: 'r_l13', plate: 13, part: 'III', title: 'Odd-chain fatty acids', sub: 'to succinyl-CoA', x: 6720, y: 4430, w: 760, h: 970, right: true,
  nodes: [
    { id: 'lp_odd', x: 7200, y: 5300, kind: 'small', label: 'Odd-chain fatty acyl-CoA' },
    { id: 'lp_prop', x: 7200, y: 5080, mol: 'propcoa' },
    { id: 'lp_dmm', x: 7200, y: 4840, mol: 'dmmcoa' },
    { id: 'lp_lmm', x: 6960, y: 4600, mol: 'lmmcoa' },
  ],
  edges: [
    { id: 'e_lp0', from: 'lp_odd', to: 'lp_prop', style: 'plain', tags: 'last round of β-oxidation', tagPos: 'l', plainTag: true },
    { id: 'e_lp1', from: 'lp_prop', to: 'lp_dmm', enz: 'l_pcc', tags: 'HCO₃⁻ + ATP → ADP + Pi', tagPos: 'l', co: ['ATP', 'Pi', 'Biotin'] },
    { id: 'e_lp2', from: 'lp_dmm', to: 'lp_lmm', enz: 'l_mme', dir: 'both' },
    { id: 'e_lp3', from: 'lp_lmm', to: 'succoa', enz: 'l_mut', dir: 'both', t: 0.22, tags: 'coenzyme B₁₂', tagPos: 'r', plainTag: true, co: ['B12'] },
  ],
};

// ───────── Plate 14 · unsaturated fatty acids (slides 17–19), beside β-oxidation ─────────
export const p14: PlateDef = {
  id: 'r_l14', plate: 14, part: 'III', title: 'Unsaturated fatty acids', sub: 'two extra enzymes', x: 2960, y: 2890, w: 930, h: 1340,
  nodes: [
    { id: 'lo_ole', x: 3180, y: 3010, mol: 'oleoylcoa', label: 'Oleoyl-CoA (cis-9-C18:1)' },
    { id: 'lo_c3', x: 3180, y: 3240, mol: 'c3dodec' },
    { id: 'lo_t2', x: 3180, y: 3470, mol: 't2dodec' },
    { id: 'lo_out', x: 3180, y: 3700, kind: 'small', label: '6 acetyl-CoA' },
    { id: 'lo_x', x: 3180, y: 3768, kind: 'xref', link: 'lo_out', target: 'lb_enoyl', label: 'same steps as β-oxidation' },
    { id: 'ln_lin', x: 3650, y: 3010, mol: 'linoleoylcoa', label: 'Linoleoyl-CoA (cis-Δ⁹,cis-Δ¹²)' },
    { id: 'ln_c3c6', x: 3650, y: 3190, mol: 'c3c6' },
    { id: 'ln_t2c6', x: 3650, y: 3370, mol: 't2c6' },
    { id: 'ln_t2c4', x: 3650, y: 3550, mol: 't2c4' },
    { id: 'ln_t3', x: 3650, y: 3730, mol: 't3dec' },
    { id: 'ln_t2', x: 3650, y: 3910, mol: 't2dec' },
    { id: 'ln_out', x: 3650, y: 4090, kind: 'small', label: '5 acetyl-CoA' },
    { id: 'l_c_unsat', x: 3180, y: 4000, kind: 'card', card: 'l_c_unsat', label: 'Why extra enzymes?' },
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
  ],
  labels: [
    { x: 3180, y: 2952, kind: 'phase', text: 'Monounsaturated', anchor: 'middle' },
    { x: 3650, y: 2952, kind: 'phase', text: 'Polyunsaturated', anchor: 'middle' },
  ],
};

// ───────── Plate 15 · ketone bodies (slides 20–22): made from the matrix acetyl-CoA of liver mitochondria ─────────
export const p15: PlateDef = {
  id: 'r_l15', plate: 15, part: 'III', title: 'Ketone bodies', sub: 'made in liver mitochondria', x: 3960, y: 4060, w: 1090, h: 700,
  nodes: [
    { id: 'lk_kb', x: 4650, y: 4250, mols: ['aca', 'bhb', 'acetone'], label: 'Acetoacetate · D-β-hydroxybutyrate · acetone' },
    { id: 'l_c_ketone', x: 4250, y: 4450, kind: 'card', card: 'l_c_ketone', label: 'Ketone bodies' },
    { id: 'l_c_ketosis', x: 4290, y: 4510, kind: 'card', card: 'l_c_ketosis', label: 'Starvation & diabetes' },
  ],
  edges: [
    { id: 'e_lk1', from: 'accoa', to: 'lk_kb', enz: 'l_kbf', t: 0.9, tags: '→ CoA', tagPos: 'r', co: ['CoA'] },
    { id: 'e_lk2', from: 'lk_kb', to: 'lk_tis', style: 'plain', tags: 'exported in the blood', tagPos: 'r', plainTag: true },
  ],
};

// ───────── Plate 16 · ketone bodies in other tissues (slides 20–21), a side panel outside the cell ─────────
export const p16: PlateDef = {
  id: 'r_l16', plate: 16, part: 'III', title: 'Ketone bodies as fuel', sub: 'heart, muscle, kidney, brain', x: 3960, y: 5980, w: 1090, h: 560, outside: true,
  nodes: [
    { id: 'lk_tis', x: 4650, y: 6120, kind: 'proc', label: 'Heart, skeletal muscle, kidney, brain' },
    { id: 'lk_accoa2', x: 4650, y: 6360, mol: 'accoa', label: 'Acetyl-CoA (extrahepatic)' },
    { id: 'lk_x2', x: 4650, y: 6444, kind: 'xref', link: 'lk_accoa2', target: 'accoa', label: 'oxidized in the citric acid cycle' },
  ],
  edges: [
    { id: 'e_lk3', from: 'lk_tis', to: 'lk_accoa2', enz: 'l_kbu' },
  ],
};

// ───────── Plate 17 · the citrate shuttle (slides 24–26) with fatty acid synthesis (slides 27–32) above it ─────────
// Citrate leaves the citric acid cycle through the inner membrane; its acetyl group becomes the cytosolic acetyl-CoA
// that fatty acid synthase starts from. NADPH comes from malic enzyme here and from the pentose phosphate pathway above.
export const p17: PlateDef = {
  id: 'r_l17', plate: 17, part: 'III', title: 'Citrate shuttle & fatty acid synthesis', sub: 'cytosol · FAS I', x: 6080, y: 1040, w: 910, h: 2100,
  nodes: [
    // citrate shuttle: cytosol row just above the outer membrane, the way back into the matrix below it
    { id: 'ls_cit_c', x: 6130, y: 2450, mol: 'cit' },
    { id: 'ls_oaa_c', x: 6400, y: 2450, mol: 'oaa' },
    { id: 'ls_mal_c', x: 6650, y: 2450, mol: 'mal' },
    { id: 'ls_pyr_c', x: 6900, y: 2450, mol: 'pyr' },
    { id: 'ls_mal_m', x: 6650, y: 2950, mol: 'mal' },
    { id: 'ls_pyr_m', x: 6900, y: 2950, mol: 'pyr' },
    { id: 'ls_oaa_m', x: 6775, y: 3115, mol: 'oaa' },
    { id: 'ls_x1', x: 6560, y: 3115, kind: 'xref', link: 'ls_oaa_m', target: 'oaa', label: 'the cycle’s oxaloacetate' },
    // fatty acid synthase: malonyl entry on the left, the four-step cycle up the middle, the loop back on the right
    { id: 'lf_accoa', x: 6380, y: 2250, mol: 'accoa', label: 'Acetyl-CoA (cytosol)' },
    { id: 'lf_malcoa', x: 6200, y: 2040, mol: 'malcoa' },
    { id: 'lf_malacp', x: 6200, y: 1830, mol: 'malacp' },
    { id: 'lf_acyl', x: 6560, y: 1830, mol: 'acylacp', label: 'Acyl-ACP (Cₙ)' },
    { id: 'lf_kacp', x: 6560, y: 1650, mol: 'kacp' },
    { id: 'lf_hacp', x: 6560, y: 1470, mol: 'hacp' },
    { id: 'lf_eacp', x: 6560, y: 1290, mol: 'eacp' },
    { id: 'lf_acyl2', x: 6880, y: 1290, mol: 'acylacp', label: 'Acyl-ACP (Cₙ₊₂)' },
    { id: 'lf_palm', x: 6880, y: 1110, mol: 'palmitate', label: 'Palmitate (16:0)' },
    { id: 'l_c_export', x: 6760, y: 2240, kind: 'card', card: 'l_c_export', label: 'Why a shuttle?' },
    { id: 'l_c_fas', x: 6250, y: 1110, kind: 'card', card: 'l_c_fas', label: 'Fatty acid synthase' },
    { id: 'l_c_fasnet', x: 6250, y: 1170, kind: 'card', card: 'l_c_fasnet', label: 'Overall reaction' },
    { id: 'l_c_reg', x: 6265, y: 1230, kind: 'card', card: 'l_c_reg', label: 'Synthesis vs breakdown' },
    { id: 'l_c_vs', x: 6270, y: 1290, kind: 'card', card: 'l_c_vs', label: 'Compare with β-oxidation' },
  ],
  edges: [
    { id: 'e_ls2', from: 'cit', to: 'ls_cit_c', enz: 'l_citt', t: 0.64 },
    { id: 'e_ls3', from: 'ls_cit_c', to: 'ls_oaa_c', enz: 'l_acl', tags: 'ATP + CoA-SH → ADP + Pi', tagPos: 'below', out: 'lf_accoa', co: ['ATP', 'CoA', 'Pi'] },
    { id: 'e_ls4', from: 'ls_oaa_c', to: 'ls_mal_c', enz: 'mdh', tags: 'NADH → NAD⁺', tagPos: 'below', co: ['NADH'] },
    { id: 'e_ls5', from: 'ls_mal_c', to: 'ls_pyr_c', enz: 'l_me', tags: 'NADP⁺ → NADPH + CO₂', tagPos: 'above', co: ['NADPH', 'CO2'] },
    { id: 'e_ls6', from: 'ls_pyr_c', to: 'ls_pyr_m', enz: 'l_pyrt', t: 0.72 },
    { id: 'e_ls8', from: 'ls_mal_c', to: 'ls_mal_m', enz: 'mkt', t: 0.72 },
    { id: 'e_ls7', from: 'ls_pyr_m', to: 'ls_oaa_m', enz: 'pc', lab: 'r', tags: 'ATP + CO₂ → ADP + Pi', tagPos: 'r', co: ['ATP', 'CO2', 'Pi'] },
    { id: 'e_ls9', from: 'ls_mal_m', to: 'ls_oaa_m', enz: 'mdh', lab: 'l', tags: 'NAD⁺ → NADH', tagPos: 'l', co: ['NADH'] },
    { id: 'e_lf1', from: 'lf_accoa', to: 'lf_malcoa', enz: 'l_acc', tags: 'HCO₃⁻ + ATP → ADP + Pi', tagPos: 'l', co: ['ATP', 'Pi', 'Biotin'] },
    { id: 'e_lf2', from: 'lf_malcoa', to: 'lf_malacp', enz: 'l_mat', tags: '− CoA', tagPos: 'l', co: ['CoA'] },
    { id: 'e_lf3', from: 'lf_accoa', to: 'lf_acyl', enz: 'l_mat', tags: 'first acyl group: acetyl', tagPos: 'r', plainTag: true },
    { id: 'e_lf4', from: 'lf_acyl', to: 'lf_kacp', enz: 'l_ks', feed: 'lf_malacp', tags: '− CO₂', tagPos: 'r', co: ['CO2'] },
    { id: 'e_lf5', from: 'lf_kacp', to: 'lf_hacp', enz: 'l_kr', tags: 'NADPH → NADP⁺', tagPos: 'l', co: ['NADPH'] },
    { id: 'e_lf6', from: 'lf_hacp', to: 'lf_eacp', enz: 'l_dh', tags: '− H₂O', tagPos: 'l' },
    { id: 'e_lf7', from: 'lf_eacp', to: 'lf_acyl2', enz: 'l_er', tags: 'NADPH → NADP⁺', tagPos: 'above', co: ['NADPH'] },
    { id: 'e_lf8', from: 'lf_acyl2', to: 'lf_acyl', style: 'plain', via: [[6880, 1830]] },
    { id: 'e_lf9', from: 'lf_acyl2', to: 'lf_palm', style: 'plain', tags: 'released after 7 rounds', tagPos: 'l', plainTag: true },
  ],
  labels: [{ x: 6720, y: 1530, kind: 'phase', text: 'Repeat', anchor: 'start', sub: ['7 rounds:', 'C₄ → … → C₁₆'] }],
};

// ───────── Plate 18 · elongation and desaturation (slides 33–35), from palmitate ─────────
export const p18: PlateDef = {
  id: 'r_l18', plate: 18, part: 'III', title: 'Elongation & desaturation', sub: 'smooth ER & mitochondria', x: 7220, y: 60, w: 1180, h: 1420,
  nodes: [
    { id: 'le_pol', x: 7700, y: 190, mol: 'palmitoleate', label: 'Palmitoleate 16:1(Δ⁹)' },
    { id: 'le_ste', x: 7420, y: 1120, mol: 'stearate', label: 'Stearate 18:0' },
    { id: 'le_long', x: 7420, y: 1360, kind: 'small', label: 'Longer saturated fatty acids' },
    { id: 'le_ole', x: 7820, y: 1120, mol: 'oleate', label: 'Oleate 18:1(Δ⁹)' },
    { id: 'le_lin', x: 7820, y: 900, mol: 'linoleate', label: 'Linoleate 18:2(Δ⁹,¹²)', badge: 'essential' },
    { id: 'le_ala', x: 8130, y: 690, mol: 'alinolenate', label: 'α-Linolenate 18:3(Δ⁹,¹²,¹⁵)', badge: 'essential' },
    { id: 'le_oth', x: 8130, y: 480, kind: 'small', label: 'Other polyunsaturated' },
    { id: 'le_gla', x: 7620, y: 690, mol: 'glinolenate', label: 'γ-Linolenate 18:3(Δ⁶,⁹,¹²)' },
    { id: 'le_eic', x: 7620, y: 530, mol: 'eicosatrienoate', label: 'Eicosatrienoate 20:3(Δ⁸,¹¹,¹⁴)' },
    { id: 'le_ara', x: 7620, y: 370, mol: 'arachidonate', label: 'Arachidonate 20:4(Δ⁵,⁸,¹¹,¹⁴)' },
    { id: 'l_c_elong', x: 8240, y: 1260, kind: 'card', card: 'l_c_elong', label: 'After palmitate' },
    { id: 'l_c_essential', x: 8240, y: 1320, kind: 'card', card: 'l_c_essential', label: 'Essential fatty acids' },
  ],
  edges: [
    { id: 'e_le1', from: 'lf_palm', to: 'le_ste', enz: 'l_elong' },
    { id: 'e_le2', from: 'lf_palm', to: 'le_pol', enz: 'l_desat', via: [[7300, 190]] },
    { id: 'e_le3', from: 'le_ste', to: 'le_ole', enz: 'l_desat', tags: 'O₂ + NADPH → 2 H₂O + NADP⁺', tagPos: 'below', co: ['NADPH'] },
    { id: 'e_le4', from: 'le_ste', to: 'le_long', enz: 'l_elong' },
    { id: 'e_le5', from: 'le_ole', to: 'le_lin', enz: 'l_desat2', tags: 'in plants only', tagPos: 'r', plainTag: true },
    { id: 'e_le6', from: 'le_lin', to: 'le_ala', enz: 'l_desat2', tags: 'in plants only', tagPos: 'r', plainTag: true },
    { id: 'e_le7', from: 'le_ala', to: 'le_oth', style: 'plain' },
    { id: 'e_le8', from: 'le_lin', to: 'le_gla', enz: 'l_desat2' },
    { id: 'e_le9', from: 'le_gla', to: 'le_eic', enz: 'l_elong' },
    { id: 'e_le10', from: 'le_eic', to: 'le_ara', enz: 'l_desat2' },
  ],
};

// ───────── Plate 19 · cholesterol and steroid hormones (slides 45–47) ─────────
export const p19: PlateDef = {
  id: 'r_l19', plate: 19, part: 'III', title: 'Cholesterol & steroid hormones', sub: 'isoprenoids', x: 8440, y: 60, w: 1100, h: 2460,
  nodes: [
    { id: 'lh_ac', x: 8700, y: 2380, mol: 'accoa', label: 'Acetyl-CoA (cytosol)' },
    { id: 'lh_mev', x: 8700, y: 2170, mol: 'mevalonate' },
    { id: 'lh_ipp', x: 8700, y: 1960, mol: 'ipp' },
    { id: 'lh_sq', x: 8700, y: 1750, mol: 'squalene', label: 'Squalene (C₃₀)' },
    { id: 'lh_chol', x: 8700, y: 1540, mol: 'cholesterol' },
    { id: 'lh_preg', x: 8700, y: 1360, mol: 'pregnenolone' },
    { id: 'lh_prog', x: 8700, y: 1180, mol: 'progesterone' },
    // progesterone branches three ways (slide 47): cortisol · corticosterone → aldosterone · testosterone → estradiol
    { id: 'lh_cort', x: 8560, y: 960, mol: 'cortisol', badge: 'glucocorticoid' },
    { id: 'lh_ccs', x: 8900, y: 960, mol: 'corticosterone', badge: 'mineralocorticoid' },
    { id: 'lh_ald', x: 8900, y: 720, mol: 'aldosterone', badge: 'mineralocorticoid' },
    { id: 'lh_test', x: 9320, y: 960, mol: 'testosterone' },
    { id: 'lh_est', x: 9320, y: 720, mol: 'estradiol' },
    { id: 'l_c_chol', x: 9250, y: 1680, kind: 'card', card: 'l_c_chol', label: 'Cholesterol & isoprenoids' },
    { id: 'l_c_steroid', x: 9230, y: 1360, kind: 'card', card: 'l_c_steroid', label: 'Steroid hormones' },
    { id: 'lh_x1', x: 9020, y: 2376, kind: 'xref', link: 'lh_ac', target: 'lf_accoa', label: 'from the citrate shuttle' },
    { id: 'lh_x2', x: 9030, y: 1956, kind: 'xref', link: 'lh_ipp', target: 'q', label: 'also ubiquinone (Q)' },
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
  labels: [{ x: 8850, y: 450, kind: 'phase', text: 'Steroid hormones', sub: ['enzymes not named on the slide'] }],
};

export const lipidPlates: PlateDef[] = [p9, p10, p11, p12, p13, p14, p15, p17, p18, p19];
