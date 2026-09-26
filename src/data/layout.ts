import type { Band, Caption, Decor, Edge, JumpView, Label, MapNode, Region, Scene } from './types';

/**
 * Parts I–II (the midterm): carbohydrates, the citric acid cycle and oxidative phosphorylation, in map coordinates.
 * Coordinates are hand-placed so the reading order stays clean; nothing is auto-laid-out.
 * Spacing is sized for the full enzyme names, which wrap to two lines inside their pills.
 * Glycolysis runs down the spine at x = 5600; glycolytic arrows are offset −70, gluconeogenic +70.
 * The NADH shuttles are close-ups of the inner membrane (insets, dashed frames) below the mitochondrion, not drawn in
 * place. They are tall and narrow with a horizontal membrane (P side above, N side below), so they read on
 * a phone too. Molecule nodes take their label from `molecules.ts`; `label` here is only for overrides.
 */
export const nodes: MapNode[] = [
  // ───────── Glycolysis (spine x = 5600) ─────────
  { id: 'glc', x: 5600, y: 130, mol: 'glc' },
  { id: 'g6p', x: 5600, y: 340, mol: 'g6p' },
  { id: 'f6p', x: 5600, y: 550, mol: 'f6p' },
  { id: 'f16bp', x: 5600, y: 760, mol: 'f16bp' },
  { id: 'dhap', x: 5220, y: 970, mol: 'dhap' },
  { id: 'g3p', x: 5600, y: 970, mol: 'g3p', badge: '×2' },
  { id: 'bpg13', x: 5600, y: 1180, mol: 'bpg13', badge: '×2' },
  { id: 'pg3', x: 5600, y: 1370, mol: 'pg3', badge: '×2' },
  { id: 'pg2', x: 5600, y: 1550, mol: 'pg2', badge: '×2' },
  { id: 'pep', x: 5600, y: 1730, mol: 'pep', badge: '×2' },
  { id: 'pyr', x: 5600, y: 1930, mol: 'pyr', badge: '×2' },
  { id: 'c_gly_bal', label: 'Net balance & ΔG', x: 5830, y: 98, kind: 'card', card: 'c_gly_bal' },
  { id: 'c_gly_reg', label: 'Regulation of glycolysis', x: 5800, y: 152, kind: 'card', card: 'c_gly_reg' },

  // ───────── Gluconeogenesis ─────────
  // Bypass 1 runs through the mitochondrion: pyruvate carboxylase works in the matrix. Of the two routes the notes
  // give (Part I slides 28–29, see `pc`), this is the one from pyruvate or alanine: the oxaloacetate leaves as malate
  // and PEP carboxykinase acts in the cytosol.
  { id: 'oaag', x: 5990, y: 1830, mol: 'oaa' },
  { id: 'oaag_m', x: 5900, y: 3060, mol: 'oaa' },
  { id: 'oaag_x', x: 5900, y: 3112, kind: 'xref', link: 'oaag_m', target: 'oaa', label: 'the cycle’s oxaloacetate' },
  { id: 'c_gng', label: 'Gluconeogenesis: why & energetics', x: 5790, y: 1480, kind: 'card', card: 'c_gng' },

  // ───────── Pyruvate fates ─────────
  { id: 'lac', x: 4880, y: 2180, mol: 'lac' },
  { id: 'acald', x: 4950, y: 2400, mol: 'acald' },
  { id: 'etoh', x: 4690, y: 2460, mol: 'etoh' },

  // ───────── Glycogen ─────────
  { id: 'glycogen', label: 'Glycogen', x: 4660, y: 130, mol: 'glycogen' },
  { id: 'g1p', x: 4660, y: 380, mol: 'g1p' },
  { id: 'udpglc', x: 4660, y: 630, mol: 'udpglc' },
  { id: 'gbe', x: 4890, y: 190, kind: 'etag', enz: 'gbe', link: 'glycogen' },
  { id: 'c_glycogen', label: 'Why glycogen?', x: 4890, y: 700, kind: 'card', card: 'c_glycogen' },

  // ───────── Feeder pathways ─────────
  { id: 'poly', label: 'Polysaccharides / disaccharides', x: 4730, y: 840, kind: 'small' },
  { id: 'mono', label: 'Fructose · Galactose · Mannose', x: 4730, y: 980, mols: ['fru', 'gal', 'man'] },

  // ───────── Pentose phosphate pathway ─────────
  { id: 'lactone', x: 6240, y: 340, mol: 'lactone' },
  { id: 'pg6', x: 6640, y: 340, mol: 'pg6' },
  { id: 'ru5p', x: 6640, y: 600, mol: 'ru5p' },
  { id: 'r5p', x: 6240, y: 600, mol: 'r5p' },
  { id: 'nonox', label: 'Non-oxidative phase: 6 pentose phosphates → 5 hexose phosphates', x: 6360, y: 800, kind: 'proc', enz: 'nonox' },
  { id: 'c_ppp', label: 'PPP: purpose & products', x: 6610, y: 245, kind: 'card', card: 'c_ppp' },
  { id: 'c_ppp_reg', label: 'G6P: glycolysis or PPP?', x: 6610, y: 930, kind: 'card', card: 'c_ppp_reg' },

  // ───────── Mitochondrion: PDH + citric acid cycle (ring centre 6020, 3900) ─────────
  { id: 'accoa', x: 5600, y: 3200, mol: 'accoa' },
  { id: 'oaa', x: 5690, y: 3600, mol: 'oaa' },
  { id: 'cit', x: 6020, y: 3480, mol: 'cit' },
  { id: 'icit', x: 6350, y: 3600, mol: 'icit' },
  { id: 'akg', x: 6490, y: 3900, mol: 'akg' },
  { id: 'succoa', x: 6350, y: 4200, mol: 'succoa' },
  { id: 'suc', x: 6020, y: 4320, mol: 'suc' },
  { id: 'fum', x: 5690, y: 4200, mol: 'fum' },
  { id: 'mal', x: 5550, y: 3900, mol: 'mal' },
  { id: 'c_tca', label: 'Cycle overview', x: 6020, y: 3920, kind: 'card', card: 'c_tca' },
  { id: 'c_tca_reg', label: 'PDH & cycle regulation', x: 6020, y: 3978, kind: 'card', card: 'c_tca_reg' },
  { id: 'c_ox_reg', label: 'Regulation of ATP pathways', x: 6020, y: 4036, kind: 'card', card: 'c_ox_reg' },

  // ───────── Respiratory chain ─────────
  { id: 'nadh', label: 'NADH', x: 5360, y: 4840, kind: 'small' },
  { id: 'cx1', label: 'Complex I', x: 5360, y: 4970, kind: 'cx', enz: 'cx1', w: 150 },
  { id: 'cx2', label: 'Complex II', x: 5540, y: 4970, kind: 'cx', enz: 'sdh', w: 150 },
  { id: 'q', label: 'Ubiquinone (Q)', x: 5725, y: 4970, kind: 'small' },
  { id: 'cx3', label: 'Complex III', x: 5910, y: 4970, kind: 'cx', enz: 'cx3', w: 150 },
  { id: 'cytc', label: 'Cytochrome c', x: 6090, y: 5065, kind: 'small' },
  { id: 'cx4', label: 'Complex IV', x: 6270, y: 4970, kind: 'cx', enz: 'cx4', w: 150 },
  { id: 'o2', label: '½ O₂ → H₂O', x: 6270, y: 4840, kind: 'small' },
  { id: 'cx5', label: 'ATP synthase', x: 6580, y: 4970, kind: 'cx', enz: 'atps', w: 190 },
  { id: 'atp', label: 'ATP', x: 6580, y: 4840, kind: 'small' },
  { id: 'sh_ma', label: 'Malate–aspartate shuttle', x: 5420, y: 5280, kind: 'proc', card: 'sh_ma' },
  { id: 'sh_g3p', label: 'Glycerol 3-phosphate shuttle', x: 5820, y: 5280, kind: 'proc', card: 'sh_g3p' },
  { id: 'c_inhib', label: 'Inhibitors & uncouplers', x: 6200, y: 5280, kind: 'card', card: 'c_inhib' },
  { id: 'c_yield', label: 'ATP yield per glucose', x: 6530, y: 5280, kind: 'card', card: 'c_yield' },
  { id: 'c_mito', label: 'Electron transport chain', x: 5910, y: 4840, kind: 'card', card: 'c_mito' },
  // ───────── NADH shuttles (below the mitochondrion), membrane horizontal: P side above, N side below ─────────
  // Malate–aspartate: columns Mal x = 5190 · Glu 5330 · α-KG 5460 · OAA/Asp 5650; membrane band at y ≈ 6040.
  { id: 'ma_mal_p', x: 5190, y: 5630, mol: 'mal' },
  { id: 'ma_oaa_p', x: 5650, y: 5630, mol: 'oaa' },
  { id: 'ma_asp_p', x: 5650, y: 5925, mol: 'asp' },
  { id: 'ma_glu_p', x: 5330, y: 5735, mol: 'glu' },
  { id: 'ma_akg_p', x: 5460, y: 5825, mol: 'akg' },
  { id: 'ma_mal_n', x: 5190, y: 6450, mol: 'mal' },
  { id: 'ma_oaa_n', x: 5650, y: 6450, mol: 'oaa' },
  { id: 'ma_asp_n', x: 5650, y: 6155, mol: 'asp' },
  { id: 'ma_glu_n', x: 5330, y: 6345, mol: 'glu' },
  { id: 'ma_akg_n', x: 5460, y: 6255, mol: 'akg' },
  { id: 'ma_nadh', label: 'NADH', x: 5420, y: 6540, kind: 'small' },
  { id: 'ma_net', label: 'Net: cytosolic NADH → matrix NADH (enters at Complex I)', x: 5420, y: 6620, kind: 'proc' },
  // Glycerol 3-phosphate shuttle: spine x = 6170, membrane band at y ≈ 6030.
  { id: 'g3_dhap', x: 6170, y: 5630, mol: 'dhap' },
  { id: 'g3_g3p', x: 6170, y: 5890, mol: 'g3pgly' },
  { id: 'g3_qh2', label: 'QH₂', x: 6390, y: 6030, kind: 'small' },
  { id: 'g3_net', label: 'Net: cytosolic NADH → QH₂ (enters at Complex III)', x: 6170, y: 6130, kind: 'proc' },
];

export const edges: Edge[] = [
  // Glycolysis spine (down), with the gluconeogenic bypasses running back up alongside
  { id: 'e_hk', from: 'glc', to: 'g6p', enz: 'hk', off: -70, t: 0.3, tags: 'ATP → ADP', tagPos: 'l', co: ['ATP'] },
  { id: 'e_g6pase', from: 'g6p', to: 'glc', enz: 'g6pase', off: 70, t: 0.32, tags: 'H₂O → Pi', style: 'gng', tagPos: 'r', co: ['Pi'] },
  { id: 'e_pgi', from: 'g6p', to: 'f6p', enz: 'pgi', dir: 'both', t: 0.5 },
  { id: 'e_pfk', from: 'f6p', to: 'f16bp', enz: 'pfk1', off: -70, t: 0.3, tags: 'ATP → ADP', tagPos: 'l', co: ['ATP'] },
  { id: 'e_fbp', from: 'f16bp', to: 'f6p', enz: 'fbp', off: 70, t: 0.32, tags: 'H₂O → Pi', style: 'gng', tagPos: 'r', co: ['Pi'] },
  { id: 'e_ald', from: 'f16bp', to: 'g3p', enz: 'ald', dir: 'both', t: 0.5 },
  { id: 'e_ald2', from: 'f16bp', to: 'dhap', enz: 'ald', dir: 'both', noPill: true },
  { id: 'e_tpi', from: 'dhap', to: 'g3p', enz: 'tpi', dir: 'both', t: 0.5, lab: 'below' },
  { id: 'e_gapdh', from: 'g3p', to: 'bpg13', enz: 'gapdh', dir: 'both', t: 0.5, tags: 'NAD⁺ + Pi → NADH', tagPos: 'r', co: ['NADH', 'Pi'] },
  { id: 'e_pgk', from: 'bpg13', to: 'pg3', enz: 'pgk', dir: 'both', t: 0.5, tags: 'ADP → ATP', tagPos: 'r', co: ['ATP'] },
  { id: 'e_pgm', from: 'pg3', to: 'pg2', enz: 'pgm', dir: 'both', t: 0.5 },
  { id: 'e_eno', from: 'pg2', to: 'pep', enz: 'eno', dir: 'both', t: 0.5, tags: '− H₂O', tagPos: 'r' },
  { id: 'e_pk', from: 'pep', to: 'pyr', enz: 'pk', off: -70, t: 0.5, tags: 'ADP → ATP', tagPos: 'l', co: ['ATP'] },

  // Gluconeogenic bypass of pyruvate kinase, via oxaloacetate made in the matrix and carried out as malate
  { id: 'e_pc', from: 'pyr', to: 'oaag_m', enz: 'pc', style: 'gng', plate: 'r_gly', t: 0.89, tags: 'ATP + HCO₃⁻ → ADP + Pi', tagPos: 'l', co: ['ATP'] },
  { id: 'e_gng_mal', from: 'oaag_m', to: 'oaag', style: 'plain', via: [[5990, 3060]], t: 0.56, tags: 'as malate', tagPos: 'l', plainTag: true },
  { id: 'e_pepck', from: 'oaag', to: 'pep', enz: 'pepck', style: 'gng', t: 0.45, tags: 'GTP → GDP + CO₂', tagPos: 'above', co: ['GTP', 'CO2'] },

  // Fermentation & entry to the mitochondrion
  { id: 'e_ldh', from: 'pyr', to: 'lac', enz: 'ldh', dir: 'both', t: 0.55, tags: 'NADH → NAD⁺', tagPos: 'below', co: ['NADH'] },
  { id: 'e_pdc', from: 'pyr', to: 'acald', enz: 'pdc', t: 0.55, tags: '− CO₂', tagPos: 'above', co: ['CO2'] },
  { id: 'e_adh', from: 'acald', to: 'etoh', enz: 'adh', tags: 'NADH → NAD⁺', tagPos: 'below', co: ['NADH'] },
  { id: 'e_pdh', from: 'pyr', to: 'accoa', enz: 'pdh', t: 0.925, tags: 'NAD⁺ + CoA → NADH + CO₂', tagPos: 'r', co: ['NADH', 'CO2', 'CoA'] },

  // Glycogen
  { id: 'e_gp', from: 'glycogen', to: 'g1p', enz: 'gp', t: 0.5, tags: '+ Pi', tagPos: 'r', co: ['Pi'] },
  { id: 'e_ugp', from: 'g1p', to: 'udpglc', enz: 'ugp', t: 0.5, tags: 'UTP → PPi', tagPos: 'r', co: ['UTP'] },
  { id: 'e_gs', from: 'udpglc', to: 'glycogen', enz: 'gs', via: [[4520, 630], [4520, 130]], t: 0.75, tags: '− UDP', tagPos: 'r', co: ['UTP'] },
  { id: 'e_pglm', from: 'g1p', to: 'g6p', enz: 'pglm', dir: 'both', t: 0.62 },
  { id: 'e_gde', from: 'glycogen', to: 'glc', enz: 'gde', t: 0.5, tags: '→ free glucose', tagPos: 'below', plainTag: true },
  { id: 'e_gbe', from: 'gbe', to: 'glycogen', style: 'link' },

  // Feeder pathways
  { id: 'e_hyd', from: 'poly', to: 'mono', enz: 'hyd', t: 0.5 },
  { id: 'e_feed', from: 'mono', to: 'f6p', enz: 'feedk', via: [[5060, 980], [5060, 550]], t: 0.1, tags: '→ G6P or F6P', tagPos: 'above', plainTag: true },

  // Pentose phosphate pathway
  { id: 'e_g6pd', from: 'g6p', to: 'lactone', enz: 'g6pd', tags: 'NADP⁺ → NADPH', tagPos: 'below', co: ['NADPH'] },
  { id: 'e_lac', from: 'lactone', to: 'pg6', enz: 'lacton', tags: '+ H₂O', tagPos: 'below', lab: 'above' },
  { id: 'e_pgdh', from: 'pg6', to: 'ru5p', enz: 'pgdh', tags: 'NADP⁺ → NADPH + CO₂', tagPos: 'l', co: ['NADPH', 'CO2'] },
  { id: 'e_ppi', from: 'ru5p', to: 'r5p', enz: 'ppi', tagPos: 'below' },
  { id: 'e_nonox', from: 'r5p', to: 'nonox', enz: 'nonox', noPill: true },
  { id: 'e_ret', from: 'nonox', to: 'g6p', enz: 'nonox', via: [[5880, 800], [5880, 420]], noPill: true, style: 'plain' },

  // Citric acid cycle
  // acetyl-CoA already enters on its own feed arrow, so no separate label
  { id: 'e_cs', from: 'oaa', to: 'cit', enz: 'cs', feed: 'accoa', co: ['CoA'] },
  { id: 'e_aco', from: 'cit', to: 'icit', enz: 'aco', dir: 'both' },
  { id: 'e_idh', from: 'icit', to: 'akg', enz: 'idh', tags: 'NAD⁺ → NADH + CO₂', tagPos: 'r', co: ['NADH', 'CO2'] },
  { id: 'e_akgdh', from: 'akg', to: 'succoa', enz: 'akgdh', tags: 'NAD⁺ + CoA → NADH + CO₂', tagPos: 'r', co: ['NADH', 'CO2', 'CoA'] },
  { id: 'e_scs', from: 'succoa', to: 'suc', enz: 'scs', tags: 'GDP (ADP) → GTP (ATP)', tagPos: 'below', co: ['GTP', 'ATP'] },
  { id: 'e_sdh', from: 'suc', to: 'fum', enz: 'sdh', tags: 'FAD → FADH₂ (= Complex II)', tagPos: 'below', co: ['FADH2'] },
  { id: 'e_fum', from: 'fum', to: 'mal', enz: 'fumase', dir: 'both', tags: '+ H₂O', tagPos: 'l' },
  { id: 'e_mdh', from: 'mal', to: 'oaa', enz: 'mdh', dir: 'both', tags: 'NAD⁺ → NADH', tagPos: 'l', co: ['NADH'] },

  // Respiratory chain
  { id: 'e_nadh', from: 'nadh', to: 'cx1', enz: 'cx1', noPill: true, co: ['NADH'] },
  { id: 'e_1q', from: 'cx1', to: 'q', enz: 'cx1', noPill: true, via: [[5360, 4900], [5725, 4900]] },
  { id: 'e_2q', from: 'cx2', to: 'q', enz: 'sdh', noPill: true },
  { id: 'e_q3', from: 'q', to: 'cx3', enz: 'cx3', noPill: true },
  { id: 'e_3c', from: 'cx3', to: 'cytc', enz: 'cx3', noPill: true },
  { id: 'e_c4', from: 'cytc', to: 'cx4', enz: 'cx4', noPill: true },
  { id: 'e_4o', from: 'cx4', to: 'o2', enz: 'cx4', noPill: true },
  { id: 'e_5a', from: 'cx5', to: 'atp', enz: 'atps', noPill: true, tags: 'ADP + Pi →', tagPos: 'l', co: ['ATP', 'Pi'] },
  { id: 'e_ma', from: 'sh_ma', to: 'cx1', style: 'plain', tags: '≈ 2.5 ATP / NADH', tagPos: 'l', co: ['ATP', 'NADH'] },
  { id: 'e_g3', from: 'sh_g3p', to: 'q', style: 'plain', tags: '≈ 1.5 ATP / NADH', tagPos: 'r', co: ['ATP', 'NADH'] },
  // Malate–aspartate shuttle: cytosolic side (P) → across → matrix side (N) → back
  { id: 'e_ma_mdh_p', from: 'ma_oaa_p', to: 'ma_mal_p', enz: 'mdh', tags: 'NADH → NAD⁺', tagPos: 'above', co: ['NADH'] },
  { id: 'e_ma_mkt', from: 'ma_mal_p', to: 'ma_mal_n', enz: 'mkt', t: 0.5 },
  { id: 'e_ma_mdh_n', from: 'ma_mal_n', to: 'ma_oaa_n', enz: 'mdh', tags: '+ NAD⁺', tagPos: 'above', out: 'ma_nadh', co: ['NADH'] },
  { id: 'e_ma_aat_n', from: 'ma_oaa_n', to: 'ma_asp_n', enz: 'aat', feed: 'ma_glu_n', out: 'ma_akg_n' },
  { id: 'e_ma_gat', from: 'ma_asp_n', to: 'ma_asp_p', enz: 'gat', t: 0.5 },
  { id: 'e_ma_aat_p', from: 'ma_asp_p', to: 'ma_oaa_p', enz: 'aat', feed: 'ma_akg_p', out: 'ma_glu_p' },
  // the other two legs of the transamination loop cross the membrane on the same two transporters
  { id: 'e_ma_glu_x', from: 'ma_glu_p', to: 'ma_glu_n', enz: 'gat', noPill: true },
  { id: 'e_ma_akg_x', from: 'ma_akg_n', to: 'ma_akg_p', enz: 'mkt', noPill: true },
  // hand-off to the respiratory chain: the close-up's NADH is the NADH the summary node above hands to Complex I
  { id: 'e_ma_out', from: 'ma_nadh', to: 'sh_ma', style: 'link', via: [[5800, 6540], [5800, 5345], [5420, 5345]], co: ['NADH'] },

  // Glycerol 3-phosphate shuttle
  { id: 'e_g3_cyt', from: 'g3_dhap', to: 'g3_g3p', enz: 'gpdhc', off: -80, t: 0.45, tags: 'NADH → NAD⁺', tagPos: 'l', co: ['NADH'] },
  { id: 'e_g3_mit', from: 'g3_g3p', to: 'g3_dhap', enz: 'gpdhm', off: 80, t: 0.55, tags: 'FAD → FADH₂', tagPos: 'r', out: 'g3_qh2', co: ['FADH2'] },
  { id: 'e_g3_out', from: 'g3_qh2', to: 'sh_g3p', style: 'link', via: [[6560, 6030], [6560, 5345], [5820, 5345]], co: ['FADH2'] },
];

export const regions: Region[] = [
  { id: 'r_gly', plate: 1, part: 'I', title: 'Glycolysis & gluconeogenesis', sub: 'cytosol', x: 5080, y: 60, w: 960, h: 2470 },
  { id: 'r_feed', plate: 2, part: 'I', title: 'Feeder pathways', sub: 'into glycolysis', x: 4480, y: 780, w: 560, h: 260 },
  { id: 'r_ferm', plate: 3, part: 'I', title: 'Fermentation', sub: 'no O₂', x: 4610, y: 2030, w: 460, h: 480 },
  { id: 'r_ppp', plate: 4, part: 'I', title: 'Pentose phosphate pathway', sub: 'cytosol', x: 6080, y: 210, w: 740, h: 790 },
  { id: 'r_glyc', plate: 5, part: 'I', title: 'Glycogen metabolism', sub: 'liver & muscle', x: 4480, y: 60, w: 560, h: 700 },
  // the strip under the inner membrane holds pyruvate dehydrogenase and the matrix half of gluconeogenic bypass 1
  { id: 'r_mito', plate: 6, part: 'II', title: 'Citric acid cycle & respiratory chain', sub: 'matrix & inner membrane', x: 5080, y: 3150, w: 1620, h: 2250, right: true,
    more: [{ x: 5080, y: 2870, w: 960, h: 300 }] },
  // the two shuttles are close-ups of a stretch of inner membrane, drawn below the mitochondrion rather than in place
  { id: 'r_ma', plate: 7, part: 'II', title: 'Malate–aspartate shuttle', sub: 'heart, liver, kidney', x: 5080, y: 5430, w: 700, h: 1240, inset: true },
  { id: 'r_g3', plate: 8, part: 'II', title: 'Glycerol 3-P shuttle', sub: 'muscle, brain', x: 5820, y: 5430, w: 700, h: 740, inset: true },
];

/** Membrane strips: the respiratory chain's stretch of inner membrane, and the membranes inside the two shuttle diagrams. */
export const bands: Band[] = [
  { id: 'b_etc', x: 5260, y: 4915, w: 1430, h: 110 },
  { id: 'b_ma', x: 5110, y: 6000, w: 650, h: 80 },
  { id: 'b_g3', x: 5850, y: 5980, w: 640, h: 100 },
];

export const captions: Caption[] = [
  { x: 6690, y: 4895, text: 'MATRIX ↑', anchor: 'end' },
  { x: 6690, y: 5080, text: '↓ INTERMEMBRANE SPACE', anchor: 'end' },
  { x: 5110, y: 5505, text: 'CLOSE-UP OF THE INNER MEMBRANE' },
  { x: 5110, y: 5540, text: 'INTERMEMBRANE SPACE (P side)' },
  { x: 5517, y: 6045, text: 'MEMBRANE', anchor: 'middle' },
  { x: 5110, y: 6582, text: 'MATRIX (N side)' },
  { x: 5850, y: 5505, text: 'CLOSE-UP OF THE INNER MEMBRANE' },
  { x: 5850, y: 5540, text: 'INTERMEMBRANE SPACE (P side)' },
  { x: 5865, y: 6035, text: 'INNER MEMBRANE' },
  { x: 6490, y: 6102, text: 'MATRIX (N side) ↓', anchor: 'end' },
];

export const labels: Label[] = [
  { x: 5110, y: 470, kind: 'phase', text: 'Preparatory phase', sub: ['steps 1–5 · spends 2 ATP'] },
  { x: 5110, y: 1300, kind: 'phase', text: 'Payoff phase', sub: ['steps 6–10 · makes', '4 ATP + 2 NADH'] },
  { x: 6020, y: 3832, kind: 'section', text: 'Citric acid cycle', anchor: 'middle' },
  { x: 5250, y: 4770, kind: 'section', text: 'Oxidative phosphorylation', sub: ['inner mitochondrial membrane'] },
];

export const decor: Decor[] = [
  { x: 5300, y: 5032, label: '4 H⁺', dir: 'down' },
  { x: 5910, y: 5032, label: '4 H⁺', dir: 'down' },
  { x: 6270, y: 5032, label: '2 H⁺', dir: 'down' },
  { x: 6580, y: 5042, label: 'H⁺', dir: 'up' },
];

export const jumps: JumpView[] = [
  { id: 'j_gly1', label: 'Glycolysis 1–5', x: 5060, y: 40, w: 900, h: 1050, plate: 'r_gly' },
  { id: 'j_gly2', label: 'Glycolysis 6–10', x: 5060, y: 880, w: 900, h: 1160, plate: 'r_gly' },
  { id: 'j_glyc', label: 'Glycogen & feeders', x: 4460, y: 40, w: 1300, h: 1040, plate: 'r_glyc' },
  { id: 'j_ppp', label: 'Pentose phosphate', x: 5540, y: 190, w: 1320, h: 840, plate: 'r_ppp' },
  { id: 'j_gng', label: 'Gluconeogenesis', x: 5060, y: 40, w: 1320, h: 1980, plate: 'r_gly' },
  { id: 'j_ferm', label: 'Fermentation', x: 4580, y: 1880, w: 1100, h: 560, plate: 'r_ferm' },
  { id: 'j_tca', label: 'Citric acid cycle', x: 5080, y: 3120, w: 1620, h: 1300, plate: 'r_mito' },
  { id: 'j_oxp', label: 'Oxidative phosphorylation', x: 5160, y: 4720, w: 1600, h: 700, plate: 'r_mito' },
  { id: 'j_ma', label: 'Malate–aspartate', x: 4960, y: 5400, w: 830, h: 1300, plate: 'r_ma' },
  { id: 'j_g3', label: 'Glycerol 3-P shuttle', x: 5700, y: 5410, w: 830, h: 1360, plate: 'r_g3' },
];

/**
 * The carbohydrate and energy plates (Parts I–II) in map coordinates. atlas.ts adds the final-exam plates around them.
 */
export const midScene: Scene = { canvas: { w: 7000, h: 6700 }, nodes, edges, regions, bands, captions, labels, jumps, decor };
