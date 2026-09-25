import type { Molecule } from '../types';
import { cx } from '../chem.ts';

/**
 * Part III (lipid metabolism) molecules. Generic lipids use pseudo-atoms (R, CoA, ACP) the way the slides draw them;
 * named compounds are drawn in full. Molecules shared with the carbohydrate map (acetyl-CoA, oxaloacetate, DHAP, …)
 * are not repeated here.
 */
const FA = (tail: string) => `${tail}C(=O)O`;

export const lipidMolecules: Molecule[] = [
  // ── storage lipids and their pieces ──
  { id: 'tag', name: 'Triacylglycerol', smiles: cx('*C(=O)OCC(COC(*)=O)OC(*)=O', 'R1', 'R3', 'R2'), note: 'Glycerol esterified with three fatty acids (R¹, R², R³). About 95% of its available energy is in the fatty acids, 5% in the glycerol.' },
  { id: 'dag', name: '1,2-Diacylglycerol', smiles: cx('*C(=O)OCC(CO)OC(*)=O', 'R1', 'R2') },
  { id: 'mag', name: 'Monoacylglycerol', smiles: cx('*C(=O)OC(CO)CO', 'R'), note: 'Drawn as the 2-monoacylglycerol.' },
  { id: 'glycerol', name: 'Glycerol', smiles: 'OCC(O)CO' },
  { id: 'fa', name: 'Fatty acid', smiles: cx('*CC(=O)O', 'R'), note: 'A long hydrocarbon chain (R) ending in a carboxyl group.' },
  { id: 'pa', name: 'Phosphatidic acid', smiles: cx('*C(=O)OCC(COP(=O)(O)O)OC(*)=O', 'R1', 'R2'), note: 'Diacylglycerol 3-phosphate: the branch point to triacylglycerols or glycerophospholipids.' },
  { id: 'gpl', name: 'Glycerophospholipid', smiles: cx('*C(=O)OCC(COP(=O)(O)O*)OC(*)=O', 'R1', 'X', 'R2'), note: 'X is the head group: serine, choline, ethanolamine, etc.' },

  // ── activation and transport ──
  { id: 'facoa', name: 'Fatty acyl-CoA', smiles: cx('*CC(=O)S*', 'R', 'CoA'), note: 'The activated fatty acid (a thioester with coenzyme A), made in the cytosol.' },
  { id: 'carnitine', name: 'Carnitine', smiles: 'C[N+](C)(C)C[C@@H](CC(=O)[O-])O', note: 'L-Carnitine. Its hydroxyl group carries the fatty acyl group across the inner mitochondrial membrane.' },
  { id: 'facar', name: 'Fatty acyl-carnitine', smiles: cx('*C(=O)O[C@H](CC(=O)[O-])C[N+](C)(C)C', 'R') },

  // ── β-oxidation (generic chain) ──
  { id: 'enoylcoa', name: 'trans-Δ²-Enoyl-CoA', smiles: cx('*C/C=C/C(=O)S*', 'R', 'CoA'), note: 'Double bond between the α and β carbons (C-2, C-3), in the trans configuration.' },
  { id: 'hacoa', name: 'L-β-Hydroxyacyl-CoA', smiles: cx('*CC(O)CC(=O)S*', 'R', 'CoA') },
  { id: 'kacoa', name: 'β-Ketoacyl-CoA', smiles: cx('*CC(=O)CC(=O)S*', 'R', 'CoA') },
  { id: 'palmcoa', name: 'Palmitoyl-CoA', smiles: cx('CCCCCCCCCCCCCCCC(=O)S*', 'CoA'), note: 'C16:0. Seven passes of β-oxidation give 8 acetyl-CoA.' },

  // ── odd-chain fatty acids ──
  { id: 'propcoa', name: 'Propionyl-CoA', smiles: cx('CCC(=O)S*', 'CoA'), note: 'C3:0, left over from the last round of β-oxidation of an odd-numbered fatty acid.' },
  { id: 'dmmcoa', name: 'D-Methylmalonyl-CoA', smiles: cx('C[C@@H](C(=O)O)C(=O)S*', 'CoA') },
  { id: 'lmmcoa', name: 'L-Methylmalonyl-CoA', smiles: cx('C[C@H](C(=O)O)C(=O)S*', 'CoA') },

  // ── unsaturated fatty acids ──
  { id: 'oleoylcoa', name: 'Oleoyl-CoA', smiles: cx('CCCCCCCC/C=C\\CCCCCCCC(=O)S*', 'CoA'), note: 'cis-9-C18:1: 18 carbons with a cis double bond between C-9 and C-10.' },
  { id: 'c3dodec', name: 'cis-Δ³-Dodecenoyl-CoA', smiles: cx('CCCCCCCC/C=C\\CC(=O)S*', 'CoA') },
  { id: 't2dodec', name: 'trans-Δ²-Dodecenoyl-CoA', smiles: cx('CCCCCCCCC/C=C/C(=O)S*', 'CoA') },
  { id: 'linoleoylcoa', name: 'Linoleoyl-CoA', smiles: cx('CCCCC/C=C\\C/C=C\\CCCCCCCC(=O)S*', 'CoA'), note: 'cis-Δ⁹,cis-Δ¹² (C18:2).' },
  { id: 'c3c6', name: 'cis-Δ³,cis-Δ⁶-Dodecadienoyl-CoA', smiles: cx('CCCCC/C=C\\C/C=C\\CC(=O)S*', 'CoA'), note: 'The slide labels it by its double bonds only (cis-Δ³,cis-Δ⁶); the chain has 12 carbons.' },
  { id: 't2c6', name: 'trans-Δ²,cis-Δ⁶-Dodecadienoyl-CoA', smiles: cx('CCCCC/C=C\\CC/C=C/C(=O)S*', 'CoA') },
  { id: 't2c4', name: 'trans-Δ²,cis-Δ⁴-Decadienoyl-CoA', smiles: cx('CCCCC/C=C\\C=C\\C(=O)S*', 'CoA'), note: 'The trans-Δ², cis-Δ⁴-dienoyl intermediate that needs 2,4-dienoyl-CoA reductase.' },
  { id: 't3dec', name: 'trans-Δ³-Decenoyl-CoA', smiles: cx('CCCCCC/C=C/CC(=O)S*', 'CoA') },
  { id: 't2dec', name: 'trans-Δ²-Decenoyl-CoA', smiles: cx('CCCCCCC/C=C/C(=O)S*', 'CoA') },

  // ── ketone bodies ──
  { id: 'aca', name: 'Acetoacetate', smiles: 'CC(=O)CC(=O)O', note: 'Exported from the liver; converted back to acetyl-CoA in extrahepatic tissues.' },
  { id: 'bhb', name: 'D-β-Hydroxybutyrate', smiles: 'C[C@@H](O)CC(=O)O', note: 'Exported from the liver with acetoacetate. The brain can adapt to use it during starvation.' },
  { id: 'acetone', name: 'Acetone', smiles: 'CC(C)=O', note: 'Made in smaller quantities than the other two ketone bodies; people in severe ketosis smell of it.' },

  // ── fatty acid synthesis ──
  { id: 'malcoa', name: 'Malonyl-CoA', smiles: cx('OC(=O)CC(=O)S*', 'CoA'), note: 'The first intermediate of fatty acid synthesis. It also inhibits carnitine acyltransferase I, so a cell making fatty acids does not oxidize them at the same time.' },
  { id: 'malacp', name: 'Malonyl-ACP', smiles: cx('OC(=O)CC(=O)S*', 'ACP') },
  { id: 'acylacp', name: 'Acyl-ACP', smiles: cx('*CC(=O)S*', 'R', 'ACP'), note: 'The growing chain on the acyl carrier protein. In the first round it is acetyl-ACP (R = H).' },
  { id: 'kacp', name: 'β-Ketoacyl-ACP', smiles: cx('*CC(=O)CC(=O)S*', 'R', 'ACP'), note: 'In the first round: acetoacetyl-ACP.' },
  { id: 'hacp', name: 'β-Hydroxyacyl-ACP', smiles: cx('*CC(O)CC(=O)S*', 'R', 'ACP') },
  { id: 'eacp', name: 'trans-Δ²-Enoyl-ACP', smiles: cx('*C/C=C/C(=O)S*', 'R', 'ACP') },
  { id: 'palmitate', name: 'Palmitate', isA: 'fa', smiles: FA('C'.repeat(15)), note: '16:0. The main product of fatty acid synthase, released when the chain reaches 16 carbons.' },

  // ── elongation and desaturation ──
  { id: 'stearate', name: 'Stearate', isA: 'fa', smiles: FA('C'.repeat(17)), note: '18:0.' },
  { id: 'palmitoleate', name: 'Palmitoleate', smiles: FA('CCCCCC/C=C\\CCCCCCC'), note: '16:1(Δ⁹), cis double bond between C-9 and C-10.' },
  { id: 'oleate', name: 'Oleate', smiles: FA('CCCCCCCC/C=C\\CCCCCCC'), note: '18:1(Δ⁹), cis.' },
  { id: 'linoleate', name: 'Linoleate', smiles: FA('CCCCC/C=C\\C/C=C\\CCCCCCC'), note: '18:2(Δ⁹,¹²). Essential: animals cannot make it from oleate, so it must come from food (ω-6).' },
  { id: 'alinolenate', name: 'α-Linolenate', smiles: FA('CC/C=C\\C/C=C\\C/C=C\\CCCCCCC'), note: '18:3(Δ⁹,¹²,¹⁵). Essential (ω-3).' },
  { id: 'glinolenate', name: 'γ-Linolenate', smiles: FA('CCCCC/C=C\\C/C=C\\C/C=C\\CCCC'), note: '18:3(Δ⁶,⁹,¹²).' },
  { id: 'eicosatrienoate', name: 'Eicosatrienoate', smiles: FA('CCCCC/C=C\\C/C=C\\C/C=C\\CCCCCC'), note: '20:3(Δ⁸,¹¹,¹⁴).' },
  { id: 'arachidonate', name: 'Arachidonate', smiles: FA('CCCCC/C=C\\C/C=C\\C/C=C\\C/C=C\\CCC'), note: '20:4(Δ⁵,⁸,¹¹,¹⁴).' },
  { id: 'pcole', name: 'Phosphatidylcholine (oleate)', smiles: cx('*C(=O)OCC(COP(=O)([O-])OCC[N+](C)(C)C)OC(=O)CCCCCCC/C=C\\CCCCCCCC', 'R1'), note: 'Phosphatidylcholine with oleate, 18:1(Δ⁹), at C-2.' },
  { id: 'pclin', name: 'Phosphatidylcholine (linoleate)', smiles: cx('*C(=O)OCC(COP(=O)([O-])OCC[N+](C)(C)C)OC(=O)CCCCCCC/C=C\\C/C=C\\CCCCC', 'R1'), note: 'After desaturation: linoleate, 18:2(Δ⁹,¹²), at C-2.' },

  // ── cholesterol and steroid hormones ──
  { id: 'mevalonate', name: 'Mevalonate', smiles: 'CC(O)(CCO)CC(=O)O', note: 'Six-carbon intermediate made from three acetate units.' },
  { id: 'ipp', name: 'Δ³-Isopentenyl pyrophosphate', smiles: 'CC(=C)CCOP(=O)(O)OP(=O)(O)O', note: 'The activated isoprene unit: precursor of cholesterol and of a huge range of other isoprenoids.' },
  { id: 'squalene', name: 'Squalene', smiles: 'CC(C)=CCC/C(C)=C/CC/C(C)=C/CC/C=C(\\C)CC/C=C(\\C)CCC=C(C)C', note: 'C30, linear: six isoprene units joined together.' },
  { id: 'cholesterol', name: 'Cholesterol', smiles: 'C[C@H](CCCC(C)C)[C@H]1CC[C@@H]2[C@@]1(CC[C@H]3[C@H]2CC=C4[C@@]3(CC[C@@H](C4)O)C)C', note: 'All 27 carbons come from acetate. Precursor of steroid hormones, bile acids and vitamin D.' },
  { id: 'pregnenolone', name: 'Pregnenolone', smiles: 'CC(=O)[C@H]1CC[C@@H]2[C@@]1(CC[C@H]3[C@H]2CC=C4[C@@]3(CC[C@@H](C4)O)C)C' },
  { id: 'progesterone', name: 'Progesterone', smiles: 'CC(=O)[C@H]1CC[C@@H]2[C@@]1(CC[C@H]3[C@H]2CCC4=CC(=O)CC[C@]34C)C' },
  { id: 'cortisol', name: 'Cortisol', smiles: 'C[C@]12CCC(=O)C=C1CC[C@@H]3[C@@H]2[C@H](C[C@]4([C@H]3CC[C@@]4(C(=O)CO)O)C)O', note: 'Glucocorticoid: affects protein and carbohydrate metabolism; suppresses immune response, inflammation and allergic responses.' },
  { id: 'corticosterone', name: 'Corticosterone', smiles: 'C[C@]12CCC(=O)C=C1CC[C@@H]3[C@@H]2[C@H](C[C@]4([C@H]3CC[C@@H]4C(=O)CO)C)O', note: 'Mineralocorticoid.' },
  { id: 'aldosterone', name: 'Aldosterone', smiles: 'C[C@]12CCC(=O)C=C1CC[C@@H]3[C@@H]2[C@H](C[C@]4([C@H]3CC[C@@H]4C(=O)CO)C=O)O', note: 'Mineralocorticoid: regulates reabsorption of Na⁺, Cl⁻ and HCO₃⁻ in the kidney.' },
  { id: 'testosterone', name: 'Testosterone', smiles: 'C[C@]12CC[C@H]3[C@H]([C@@H]1CC[C@@H]2O)CCC4=CC(=O)CC[C@]34C', note: 'Male sex hormone.' },
  { id: 'estradiol', name: 'Estradiol', smiles: 'C[C@]12CC[C@H]3[C@H]([C@@H]1CC[C@@H]2O)CCC4=C3C=CC(=C4)O', note: 'Female sex hormone; regulates the reproductive cycle.' },
];
