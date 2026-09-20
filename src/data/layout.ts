import type { Decor, Edge, JumpView, MapNode, Region } from './types';

export const CANVAS = { w: 2500, h: 3950 };

/**
 * Coordinates are hand-placed so the reading order stays clean; nothing is auto-laid-out.
 * Spacing is sized for the full enzyme names, which wrap to two lines inside their pills.
 * Glycolysis runs down the spine at x = 1140; glycolytic arrows are offset −70, gluconeogenic +70.
 * Molecule nodes take their label from `molecules.ts`; `label` here is only for overrides.
 */
export const nodes: MapNode[] = [
  // ───────── Glycolysis (spine x = 1140) ─────────
  { id: 'glc', x: 1140, y: 90, mol: 'glc' },
  { id: 'g6p', x: 1140, y: 300, mol: 'g6p' },
  { id: 'f6p', x: 1140, y: 510, mol: 'f6p' },
  { id: 'f16bp', x: 1140, y: 720, mol: 'f16bp' },
  { id: 'dhap', x: 760, y: 930, mol: 'dhap' },
  { id: 'g3p', x: 1140, y: 930, mol: 'g3p', badge: '×2' },
  { id: 'bpg13', x: 1140, y: 1140, mol: 'bpg13', badge: '×2' },
  { id: 'pg3', x: 1140, y: 1330, mol: 'pg3', badge: '×2' },
  { id: 'pg2', x: 1140, y: 1510, mol: 'pg2', badge: '×2' },
  { id: 'pep', x: 1140, y: 1690, mol: 'pep', badge: '×2' },
  { id: 'pyr', x: 1140, y: 1890, mol: 'pyr', badge: '×2' },
  { id: 'c_gly_bal', label: 'Net balance & ΔG', x: 1370, y: 58, kind: 'card', card: 'c_gly_bal' },
  { id: 'c_gly_reg', label: 'Regulation of glycolysis', x: 1340, y: 112, kind: 'card', card: 'c_gly_reg' },

  // ───────── Gluconeogenesis ─────────
  { id: 'oaag', x: 1520, y: 1790, mol: 'oaa' },
  { id: 'c_gng', label: 'Gluconeogenesis: why & energetics', x: 1860, y: 1600, kind: 'card', card: 'c_gng' },

  // ───────── Pyruvate fates ─────────
  { id: 'lac', x: 300, y: 1890, mol: 'lac' },
  { id: 'acald', x: 420, y: 2080, mol: 'acald' },
  { id: 'etoh', x: 110, y: 2080, mol: 'etoh' },

  // ───────── Glycogen ─────────
  { id: 'glycogen', label: 'Glycogen', x: 200, y: 90, mol: 'glycogen' },
  { id: 'g1p', x: 200, y: 340, mol: 'g1p' },
  { id: 'udpglc', x: 200, y: 590, mol: 'udpglc' },
  { id: 'gbe', x: 430, y: 150, kind: 'etag', enz: 'gbe', link: 'glycogen' },
  { id: 'c_glycogen', label: 'Why glycogen?', x: 430, y: 660, kind: 'card', card: 'c_glycogen' },

  // ───────── Feeder pathways ─────────
  { id: 'poly', label: 'Polysaccharides / disaccharides', x: 270, y: 800, kind: 'small' },
  { id: 'mono', label: 'Fructose · Galactose · Mannose', x: 270, y: 940, mols: ['fru', 'gal', 'man'] },

  // ───────── Pentose phosphate pathway ─────────
  { id: 'lactone', x: 1780, y: 300, mol: 'lactone' },
  { id: 'pg6', x: 2180, y: 300, mol: 'pg6' },
  { id: 'ru5p', x: 2180, y: 560, mol: 'ru5p' },
  { id: 'r5p', x: 1780, y: 560, mol: 'r5p' },
  { id: 'nonox', label: 'Non-oxidative phase: 6 pentose phosphates → 5 hexose phosphates', x: 1900, y: 760, kind: 'proc', enz: 'nonox' },
  { id: 'c_ppp', label: 'PPP: purpose & products', x: 2150, y: 205, kind: 'card', card: 'c_ppp' },
  { id: 'c_ppp_reg', label: 'G6P: glycolysis or PPP?', x: 2150, y: 890, kind: 'card', card: 'c_ppp_reg' },

  // ───────── Mitochondrion: PDH + citric acid cycle (ring centre 1560, 2680) ─────────
  { id: 'accoa', x: 1140, y: 2160, mol: 'accoa' },
  { id: 'oaa', x: 1230, y: 2380, mol: 'oaa' },
  { id: 'cit', x: 1560, y: 2260, mol: 'cit' },
  { id: 'icit', x: 1890, y: 2380, mol: 'icit' },
  { id: 'akg', x: 2030, y: 2680, mol: 'akg' },
  { id: 'succoa', x: 1890, y: 2980, mol: 'succoa' },
  { id: 'suc', x: 1560, y: 3100, mol: 'suc' },
  { id: 'fum', x: 1230, y: 2980, mol: 'fum' },
  { id: 'mal', x: 1090, y: 2680, mol: 'mal' },
  { id: 'c_tca', label: 'Cycle overview', x: 1560, y: 2700, kind: 'card', card: 'c_tca' },
  { id: 'c_tca_reg', label: 'PDH & cycle regulation', x: 2230, y: 2180, kind: 'card', card: 'c_tca_reg' },
  { id: 'c_ox_reg', label: 'Regulation of ATP pathways', x: 2215, y: 2245, kind: 'card', card: 'c_ox_reg' },

  // ───────── Respiratory chain ─────────
  { id: 'nadh', label: 'NADH', x: 900, y: 3320, kind: 'small' },
  { id: 'cx1', label: 'Complex I', x: 900, y: 3450, kind: 'cx', enz: 'cx1', w: 150 },
  { id: 'cx2', label: 'Complex II', x: 1080, y: 3450, kind: 'cx', enz: 'sdh', w: 150 },
  { id: 'q', label: 'Ubiquinone (Q)', x: 1265, y: 3450, kind: 'small' },
  { id: 'cx3', label: 'Complex III', x: 1450, y: 3450, kind: 'cx', enz: 'cx3', w: 150 },
  { id: 'cytc', label: 'Cytochrome c', x: 1630, y: 3545, kind: 'small' },
  { id: 'cx4', label: 'Complex IV', x: 1810, y: 3450, kind: 'cx', enz: 'cx4', w: 150 },
  { id: 'o2', label: '½ O₂ → H₂O', x: 1810, y: 3320, kind: 'small' },
  { id: 'cx5', label: 'ATP synthase', x: 2120, y: 3450, kind: 'cx', enz: 'atps', w: 190 },
  { id: 'atp', label: 'ATP', x: 2120, y: 3320, kind: 'small' },
  { id: 'sh_ma', label: 'Malate–aspartate shuttle', x: 960, y: 3760, kind: 'proc', card: 'sh_ma' },
  { id: 'sh_g3p', label: 'Glycerol 3-phosphate shuttle', x: 1360, y: 3760, kind: 'proc', card: 'sh_g3p' },
  { id: 'c_inhib', label: 'Inhibitors & uncouplers', x: 1850, y: 3760, kind: 'card', card: 'c_inhib' },
  { id: 'c_yield', label: 'ATP yield per glucose', x: 2200, y: 3760, kind: 'card', card: 'c_yield' },
  { id: 'c_mito', label: 'Electron transport chain', x: 1450, y: 3320, kind: 'card', card: 'c_mito' },
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
  { id: 'e_tpi', from: 'dhap', to: 'g3p', enz: 'tpi', dir: 'both', t: 0.5 },
  { id: 'e_gapdh', from: 'g3p', to: 'bpg13', enz: 'gapdh', dir: 'both', t: 0.5, tags: 'NAD⁺ + Pi → NADH', tagPos: 'r', co: ['NADH', 'Pi'] },
  { id: 'e_pgk', from: 'bpg13', to: 'pg3', enz: 'pgk', dir: 'both', t: 0.5, tags: 'ADP → ATP', tagPos: 'r', co: ['ATP'] },
  { id: 'e_pgm', from: 'pg3', to: 'pg2', enz: 'pgm', dir: 'both', t: 0.5 },
  { id: 'e_eno', from: 'pg2', to: 'pep', enz: 'eno', dir: 'both', t: 0.5, tags: '− H₂O', tagPos: 'r' },
  { id: 'e_pk', from: 'pep', to: 'pyr', enz: 'pk', off: -70, t: 0.5, tags: 'ADP → ATP', tagPos: 'l', co: ['ATP'] },

  // Gluconeogenic bypass of pyruvate kinase, via oxaloacetate
  { id: 'e_pc', from: 'pyr', to: 'oaag', enz: 'pc', style: 'gng', t: 0.55, tags: 'ATP + HCO₃⁻', tagPos: 'below', co: ['ATP'] },
  { id: 'e_pepck', from: 'oaag', to: 'pep', enz: 'pepck', style: 'gng', t: 0.45, tags: 'GTP → GDP + CO₂', tagPos: 'above', co: ['GTP', 'CO2'] },

  // Fermentation & entry to the mitochondrion
  { id: 'e_ldh', from: 'pyr', to: 'lac', enz: 'ldh', dir: 'both', t: 0.55, tags: 'NADH → NAD⁺', tagPos: 'below', co: ['NADH'] },
  { id: 'e_pdc', from: 'pyr', to: 'acald', enz: 'pdc', t: 0.55, tags: '− CO₂', tagPos: 'above', co: ['CO2'] },
  { id: 'e_adh', from: 'acald', to: 'etoh', enz: 'adh', tags: 'NADH → NAD⁺', tagPos: 'below', co: ['NADH'] },
  { id: 'e_pdh', from: 'pyr', to: 'accoa', enz: 'pdh', t: 0.45, tags: 'NAD⁺ + CoA → NADH + CO₂', tagPos: 'r', co: ['NADH', 'CO2', 'CoA'] },

  // Glycogen
  { id: 'e_gp', from: 'glycogen', to: 'g1p', enz: 'gp', t: 0.5, tags: '+ Pi', tagPos: 'r', co: ['Pi'] },
  { id: 'e_ugp', from: 'g1p', to: 'udpglc', enz: 'ugp', t: 0.5, tags: 'UTP → PPi', tagPos: 'r', co: ['UTP'] },
  { id: 'e_gs', from: 'udpglc', to: 'glycogen', enz: 'gs', via: [[60, 590], [60, 90]], t: 0.75, tags: '− UDP', tagPos: 'r', co: ['UTP'] },
  { id: 'e_pglm', from: 'g1p', to: 'g6p', enz: 'pglm', dir: 'both', t: 0.62 },
  { id: 'e_gde', from: 'glycogen', to: 'glc', enz: 'gde', t: 0.5, tags: '→ free glucose', tagPos: 'above' },
  { id: 'e_gbe', from: 'gbe', to: 'glycogen', style: 'link' },

  // Feeder pathways
  { id: 'e_hyd', from: 'poly', to: 'mono', enz: 'hyd', t: 0.5 },
  { id: 'e_feed', from: 'mono', to: 'f6p', enz: 'feedk', via: [[600, 940], [600, 510]], t: 0.1, tags: '→ G6P or F6P', tagPos: 'above' },

  // Pentose phosphate pathway
  { id: 'e_g6pd', from: 'g6p', to: 'lactone', enz: 'g6pd', tags: 'NADP⁺ → NADPH', tagPos: 'below', co: ['NADPH'] },
  { id: 'e_lac', from: 'lactone', to: 'pg6', enz: 'lacton', tags: '+ H₂O', tagPos: 'below' },
  { id: 'e_pgdh', from: 'pg6', to: 'ru5p', enz: 'pgdh', tags: 'NADP⁺ → NADPH + CO₂', tagPos: 'r', co: ['NADPH', 'CO2'] },
  { id: 'e_ppi', from: 'ru5p', to: 'r5p', enz: 'ppi', tagPos: 'below' },
  { id: 'e_nonox', from: 'r5p', to: 'nonox', enz: 'nonox', noPill: true },
  { id: 'e_ret', from: 'nonox', to: 'g6p', enz: 'nonox', via: [[1420, 760], [1420, 380]], noPill: true, style: 'plain' },

  // Citric acid cycle
  { id: 'e_cs', from: 'oaa', to: 'cit', enz: 'cs', feed: 'accoa', tags: '+ Acetyl-CoA', tagPos: 'l', co: ['CoA'] },
  { id: 'e_aco', from: 'cit', to: 'icit', enz: 'aco', dir: 'both' },
  { id: 'e_idh', from: 'icit', to: 'akg', enz: 'idh', tags: 'NAD⁺ → NADH + CO₂', tagPos: 'r', co: ['NADH', 'CO2'] },
  { id: 'e_akgdh', from: 'akg', to: 'succoa', enz: 'akgdh', tags: 'NAD⁺ + CoA → NADH + CO₂', tagPos: 'r', co: ['NADH', 'CO2', 'CoA'] },
  { id: 'e_scs', from: 'succoa', to: 'suc', enz: 'scs', tags: 'GDP → GTP (or ADP → ATP)', tagPos: 'below', co: ['GTP', 'ATP'] },
  { id: 'e_sdh', from: 'suc', to: 'fum', enz: 'sdh', tags: 'FAD → FADH₂ (= Complex II)', tagPos: 'below', co: ['FADH2'] },
  { id: 'e_fum', from: 'fum', to: 'mal', enz: 'fumase', dir: 'both', tags: '+ H₂O', tagPos: 'l' },
  { id: 'e_mdh', from: 'mal', to: 'oaa', enz: 'mdh', dir: 'both', tags: 'NAD⁺ → NADH', tagPos: 'l', co: ['NADH'] },

  // Respiratory chain
  { id: 'e_nadh', from: 'nadh', to: 'cx1', enz: 'cx1', noPill: true, co: ['NADH'] },
  { id: 'e_1q', from: 'cx1', to: 'q', enz: 'cx1', noPill: true, via: [[900, 3380], [1265, 3380]] },
  { id: 'e_2q', from: 'cx2', to: 'q', enz: 'sdh', noPill: true },
  { id: 'e_q3', from: 'q', to: 'cx3', enz: 'cx3', noPill: true },
  { id: 'e_3c', from: 'cx3', to: 'cytc', enz: 'cx3', noPill: true },
  { id: 'e_c4', from: 'cytc', to: 'cx4', enz: 'cx4', noPill: true },
  { id: 'e_4o', from: 'cx4', to: 'o2', enz: 'cx4', noPill: true },
  { id: 'e_5a', from: 'cx5', to: 'atp', enz: 'atps', noPill: true, tags: 'ADP + Pi →', tagPos: 'l', co: ['ATP', 'Pi'] },
  { id: 'e_ma', from: 'sh_ma', to: 'cx1', style: 'plain', tags: '≈ 2.5 ATP / NADH', tagPos: 'l', co: ['ATP', 'NADH'] },
  { id: 'e_g3', from: 'sh_g3p', to: 'q', style: 'plain', tags: '≈ 1.5 ATP / NADH', tagPos: 'r', co: ['ATP', 'NADH'] },
];

export const regions: Region[] = [
  { id: 'r_gly', title: 'GLYCOLYSIS · cytosol', x: 620, y: 20, w: 860, h: 1940, tone: '#eff6ff' },
  { id: 'r_glyc', title: 'GLYCOGEN METABOLISM', x: 20, y: 20, w: 560, h: 700, tone: '#f0fdfa' },
  { id: 'r_feed', title: 'FEEDER PATHWAYS', x: 20, y: 740, w: 560, h: 260, tone: '#fefce8' },
  { id: 'r_ppp', title: 'PENTOSE PHOSPHATE PATHWAY', x: 1520, y: 170, w: 840, h: 790, tone: '#fdf2f8' },
  { id: 'r_ferm', title: 'FERMENTATION (no O₂)', x: 20, y: 1780, w: 560, h: 380, tone: '#fff7ed' },
  { id: 'r_mito', title: 'MITOCHONDRION · matrix', x: 620, y: 2060, w: 1800, h: 1800, tone: '#f5f3ff', right: true },
];

export const decor: Decor[] = [
  { x: 900, y: 3512, label: '4 H⁺', dir: 'down' },
  { x: 1450, y: 3512, label: '4 H⁺', dir: 'down' },
  { x: 1810, y: 3512, label: '2 H⁺', dir: 'down' },
  { x: 2120, y: 3522, label: 'H⁺', dir: 'up' },
];

export const jumps: JumpView[] = [
  { id: 'j_gly1', label: 'Glycolysis 1–5', x: 600, y: 0, w: 900, h: 1050 },
  { id: 'j_gly2', label: 'Glycolysis 6–10', x: 600, y: 840, w: 900, h: 1160 },
  { id: 'j_glyc', label: 'Glycogen & feeders', x: 0, y: 0, w: 1300, h: 1040 },
  { id: 'j_ppp', label: 'Pentose phosphate', x: 1080, y: 150, w: 1320, h: 840 },
  { id: 'j_gng', label: 'Gluconeogenesis', x: 600, y: 0, w: 1320, h: 1980 },
  { id: 'j_ferm', label: 'Fermentation', x: 0, y: 1740, w: 1300, h: 460 },
  { id: 'j_tca', label: 'Citric acid cycle', x: 620, y: 2080, w: 1800, h: 1180 },
  { id: 'j_oxp', label: 'Oxidative phosphorylation', x: 700, y: 3200, w: 1780, h: 680 },
];
