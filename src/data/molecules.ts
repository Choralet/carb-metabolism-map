import type { Molecule } from './types';
import { lipidMolecules } from './part3/molecules.ts';
import { aminoMolecules } from './part4/molecules.ts';

const ACOA = 'CC(C)(COP(=O)(O)OP(=O)(O)OC[C@@H]1[C@H]([C@H]([C@@H](O1)N2C=NC3=C(N=CN=C32)N)O)OP(=O)(O)O)[C@H](C(=O)NCCC(=O)NCCS';

export const molecules: Molecule[] = [
  { id: 'glc', name: 'Glucose', smiles: 'C([C@@H]1[C@H]([C@@H]([C@H]([C@H](O1)O)O)O)O)O', note: 'Aldohexose (6C). Complete oxidation to CO₂ + H₂O has ΔG°′ = −2,840 kJ/mol.' },
  { id: 'g6p', name: 'Glucose 6-phosphate', smiles: 'C([C@@H]1[C@H]([C@@H]([C@H](C(O1)O)O)O)O)OP(=O)(O)O', note: 'Aldose. Branch point: glycolysis, pentose phosphate pathway, glycogen synthesis.' },
  { id: 'f6p', name: 'Fructose 6-phosphate', smiles: 'C([C@@H]1[C@H]([C@@H]([C@](O1)(CO)O)O)O)OP(=O)(O)O', note: 'Ketose.' },
  { id: 'f16bp', name: 'Fructose 1,6-bisphosphate', smiles: 'C([C@@H]1[C@H]([C@@H]([C@](O1)(COP(=O)(O)O)O)O)O)OP(=O)(O)O', note: 'Committed intermediate of glycolysis (6C).' },
  { id: 'dhap', name: 'Dihydroxyacetone phosphate', smiles: 'C(C(=O)COP(=O)(O)O)O', note: 'Ketose (3C). Isomerized to G3P.' },
  { id: 'g3p', name: 'Glyceraldehyde 3-phosphate', smiles: 'C([C@H](C=O)O)OP(=O)(O)O', note: 'Aldose (3C). Two molecules are formed per glucose.' },
  { id: 'bpg13', name: '1,3-Bisphosphoglycerate', smiles: 'C([C@H](C(=O)OP(=O)(O)O)O)OP(=O)(O)O', note: 'High-energy compound: ΔG′° hydrolysis = −49.3 kJ/mol.' },
  { id: 'pg3', name: '3-Phosphoglycerate', smiles: 'C([C@H](C(=O)O)O)OP(=O)(O)O' },
  { id: 'pg2', name: '2-Phosphoglycerate', smiles: 'C([C@H](C(=O)O)OP(=O)(O)O)O' },
  { id: 'pep', name: 'Phosphoenolpyruvate', smiles: 'C=C(C(=O)O)OP(=O)(O)O', note: 'Second compound with high phosphoryl-transfer potential.' },
  { id: 'pyr', name: 'Pyruvate', smiles: 'CC(=O)C(=O)O', note: 'End product of glycolysis (3C). Fate depends on oxygen and organism.' },
  { id: 'lac', name: 'L-Lactate', smiles: 'C[C@@H](C(=O)O)O' },
  { id: 'acald', name: 'Acetaldehyde', smiles: 'CC=O' },
  { id: 'etoh', name: 'Ethanol', smiles: 'CCO' },
  { id: 'accoa', name: 'Acetyl-CoA', smiles: ACOA + 'C(=O)C)O', note: 'Two-carbon acetyl unit carried on coenzyme A.' },
  { id: 'oaa', name: 'Oxaloacetate', smiles: 'C(C(=O)C(=O)O)C(=O)O', note: '4C. Regenerated each turn of the cycle; also a gluconeogenic precursor via PEP.' },
  { id: 'cit', name: 'Citrate', smiles: 'C(C(=O)O)C(CC(=O)O)(C(=O)O)O' },
  { id: 'icit', name: 'Isocitrate', smiles: 'C(C(C(C(=O)O)O)C(=O)O)C(=O)O' },
  { id: 'akg', name: 'α-Ketoglutarate', smiles: 'C(CC(=O)O)C(=O)C(=O)O', note: 'Precursor of glutamate (transamination).' },
  { id: 'succoa', name: 'Succinyl-CoA', smiles: ACOA + 'C(=O)CCC(=O)O)O', note: 'Thioester; also a precursor for heme (porphyrin ring).' },
  { id: 'suc', name: 'Succinate', smiles: 'C(CC(=O)O)C(=O)O' },
  { id: 'fum', name: 'Fumarate', smiles: 'C(=C/C(=O)O)\\C(=O)O' },
  { id: 'mal', name: 'L-Malate', smiles: 'C([C@@H](C(=O)O)O)C(=O)O' },
  { id: 'g1p', name: 'Glucose 1-phosphate', smiles: 'C([C@@H]1[C@H]([C@@H]([C@H]([C@H](O1)OP(=O)(O)O)O)O)O)O' },
  { id: 'udpglc', name: 'UDP-glucose', smiles: 'C1=CN(C(=O)NC1=O)[C@H]2[C@@H]([C@@H]([C@H](O2)COP(=O)(O)OP(=O)(O)O[C@@H]3[C@@H]([C@H]([C@@H]([C@H](O3)CO)O)O)O)O)O', note: 'Sugar nucleotide: the immediate glucose donor for glycogen synthesis.' },
  { id: 'glycogen', name: 'Glycogen (α1→4 repeat)', smiles: 'C([C@@H]1[C@H]([C@@H]([C@H]([C@H](O1)O[C@@H]2[C@H](O[C@@H]([C@@H]([C@H]2O)O)O)CO)O)O)O)O', note: 'Shown as the maltose unit (two Glc, α1→4). Real glycogen is a huge branched polymer with α1→6 branch points.' },
  { id: 'lactone', name: '6-Phosphoglucono-δ-lactone', smiles: 'C([C@@H]1[C@H]([C@@H]([C@H](C(=O)O1)O)O)O)OP(=O)(O)O' },
  { id: 'pg6', name: '6-Phosphogluconate', smiles: 'C([C@H]([C@H]([C@@H]([C@H](C(=O)O)O)O)O)O)OP(=O)(O)O' },
  { id: 'ru5p', name: 'Ribulose 5-phosphate', smiles: 'C([C@H]([C@H](C(=O)CO)O)O)OP(=O)(O)O', note: 'Ketopentose.' },
  { id: 'r5p', name: 'Ribose 5-phosphate', smiles: 'C([C@H]([C@H]([C@H](C=O)O)O)O)OP(=O)(O)O', note: 'Aldopentose. Used for RNA, DNA and coenzymes (ATP, NADH, FADH₂, CoA).' },
  { id: 'fru', name: 'Fructose', smiles: 'C1[C@H]([C@@H]([C@@H](C(O1)(CO)O)O)O)O' },
  { id: 'gal', name: 'Galactose', smiles: 'C([C@@H]1[C@@H]([C@@H]([C@H](C(O1)O)O)O)O)O' },
  { id: 'man', name: 'Mannose', smiles: 'C([C@@H]1[C@H]([C@@H]([C@@H](C(O1)O)O)O)O)O' },
  { id: 'glu', name: 'Glutamate', smiles: 'C(CC(=O)O)[C@@H](C(=O)O)N', note: 'Amino-group donor/acceptor in the malate–aspartate shuttle: made from α-ketoglutarate by transamination.' },
  { id: 'asp', name: 'Aspartate', smiles: 'C([C@@H](C(=O)O)N)C(=O)O' },
  { id: 'g3pgly', name: 'Glycerol 3-phosphate', smiles: 'C([C@@H](COP(=O)(O)O)O)O' },
  ...lipidMolecules,
  ...aminoMolecules,
];

export const molById = Object.fromEntries(molecules.map((m) => [m.id, m])) as Record<string, Molecule>;
