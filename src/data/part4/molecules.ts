import type { Molecule } from '../types';
import { cx } from '../chem.ts';

/**
 * Part IV (metabolism of N-containing compounds) molecules. Purine intermediates between PRPP and IMP use the
 * slide's own shorthand, R = ribose 5-phosphate; folates use R for the p-aminobenzoyl-glutamate tail, as on
 * slide 35. Nucleotides and everything else are drawn in full. Molecules already on the map (glutamate,
 * aspartate, pyruvate, the citric acid cycle intermediates, propionyl- and methylmalonyl-CoA…) are not repeated.
 */

// β-D-ribofuranosyl and 2′-deoxy-β-D-ribofuranosyl, written from C-1′ (after the base N); `p` goes on O-5′.
const rib = (p = '') => `[C@@H]9O[C@H](CO${p})[C@@H](O)[C@H]9O`;
const drib = (p = '') => `[C@H]9C[C@H](O)[C@@H](CO${p})O9`;
const P1 = 'P(=O)(O)O';
const P2 = 'P(=O)(O)OP(=O)(O)O';
const P3 = 'P(=O)(O)OP(=O)(O)OP(=O)(O)O';
const adenosine = (s: string) => `Nc1ncnc2c1ncn2${s}`;
const guanosine = (s: string) => `Nc1nc2c(ncn2${s})c(=O)[nH]1`;
const inosine = (s: string) => `O=c1[nH]cnc2c1ncn2${s}`;
const uridine = (s: string) => `O=c1ccn(${s})c(=O)[nH]1`;
const cytidine = (s: string) => `Nc1ccn(${s})c(=O)n1`;

export const aminoMolecules: Molecule[] = [
  // ── amino acids (L) and their generic forms ──
  { id: 'aa', name: 'L-Amino acid', smiles: cx('N[C@@H](*)C(=O)O', 'R'), note: 'Every amino acid has an α-amino group, a carboxyl group and a side chain R on the α carbon.' },
  { id: 'aketo', name: 'α-Keto acid', smiles: cx('*C(=O)C(=O)O', 'R'), note: 'What is left of an amino acid after transamination: the carbon skeleton, with a keto group where the α-amino group was.' },
  { id: 'gln', name: 'Glutamine', smiles: 'N[C@@H](CCC(N)=O)C(=O)O', note: 'Non-toxic transport form of ammonia, present in blood at much higher concentration than other amino acids; also an amino-group donor in many biosyntheses.' },
  { id: 'ala', name: 'Alanine', smiles: 'C[C@H](N)C(=O)O', note: 'Carries amino groups from muscle to the liver in the glucose-alanine cycle.' },
  { id: 'ser', name: 'Serine', smiles: 'N[C@@H](CO)C(=O)O' },
  { id: 'gly', name: 'Glycine', smiles: 'NCC(=O)O' },
  { id: 'cys', name: 'Cysteine', smiles: 'N[C@@H](CS)C(=O)O' },
  { id: 'asn', name: 'Asparagine', smiles: 'N[C@@H](CC(N)=O)C(=O)O' },
  { id: 'met', name: 'Methionine', smiles: 'CSCC[C@H](N)C(=O)O' },
  { id: 'lys', name: 'Lysine', smiles: 'NCCCC[C@H](N)C(=O)O' },
  { id: 'thr', name: 'Threonine', smiles: 'C[C@@H](O)[C@H](N)C(=O)O' },
  { id: 'val', name: 'Valine', smiles: 'CC(C)[C@H](N)C(=O)O' },
  { id: 'leu', name: 'Leucine', smiles: 'CC(C)C[C@H](N)C(=O)O' },
  { id: 'ile', name: 'Isoleucine', smiles: 'CC[C@H](C)[C@H](N)C(=O)O' },
  { id: 'phe', name: 'Phenylalanine', smiles: 'N[C@@H](Cc1ccccc1)C(=O)O' },
  { id: 'tyr', name: 'Tyrosine', smiles: 'N[C@@H](Cc1ccc(O)cc1)C(=O)O', note: 'Made from phenylalanine in mammals, so it is not essential as long as the diet has phenylalanine.' },
  { id: 'trp', name: 'Tryptophan', smiles: 'N[C@@H](Cc1c[nH]c2ccccc12)C(=O)O' },
  { id: 'his', name: 'Histidine', smiles: 'N[C@@H](Cc1c[nH]cn1)C(=O)O' },
  { id: 'pro', name: 'Proline', smiles: 'OC(=O)[C@@H]1CCCN1' },
  { id: 'arg', name: 'Arginine', smiles: 'N[C@@H](CCCNC(=N)N)C(=O)O' },

  // ── nitrogen handling and the urea cycle ──
  { id: 'nh4', name: 'Ammonium (NH₄⁺)', smiles: '[NH4+]', note: 'Toxic to cells, so it is carried as glutamine (or alanine) and disposed of as urea in the liver.' },
  { id: 'ggp', name: 'γ-Glutamyl phosphate', smiles: 'N[C@@H](CCC(=O)OP(=O)(O)O)C(=O)O', note: 'Enzyme-bound intermediate of glutamine synthetase.' },
  { id: 'carbp', name: 'Carbamoyl phosphate', smiles: 'NC(=O)OP(=O)(O)O', note: 'The mitochondrial entry point of amino nitrogen into the urea cycle (step 1). Also the start of pyrimidine synthesis.' },
  { id: 'orn', name: 'Ornithine', smiles: 'NCCC[C@H](N)C(=O)O' },
  { id: 'citr', name: 'Citrulline', smiles: 'NC(=O)NCCC[C@H](N)C(=O)O' },
  { id: 'citamp', name: 'Citrullyl-AMP', smiles: adenosine(rib('P(=O)(O)OC(=N)NCCC[C@H](N)C(=O)O')), note: 'Intermediate of argininosuccinate synthetase (step 2a), formed from citrulline and ATP.' },
  { id: 'asuc', name: 'Argininosuccinate', smiles: 'OC(=O)C[C@H](NC(=N)NCCC[C@H](N)C(=O)O)C(=O)O' },
  { id: 'urea', name: 'Urea', smiles: 'NC(N)=O', note: 'The nitrogen excretion product of ureotelic animals (many terrestrial vertebrates, and sharks). Made almost only in the liver, carried in the blood to the kidneys.' },
  { id: 'uric', name: 'Uric acid', smiles: 'O=c1[nH]c(=O)c2[nH]c(=O)[nH]c2[nH]1', note: 'Nitrogen excretion product of uricotelic animals (birds, reptiles), and the end product of purine breakdown in primates.' },

  // ── carbon skeletons and biosynthetic precursors ──
  { id: 'acacoa', name: 'Acetoacetyl-CoA', smiles: cx('CC(=O)CC(=O)S*', 'CoA') },
  { id: 'e4p', name: 'Erythrose 4-phosphate', smiles: 'O=C[C@H](O)[C@H](O)COP(=O)(O)O', note: 'From the pentose phosphate pathway; with PEP, the precursor of the aromatic amino acids.' },

  // ── serine, glycine and one-carbon carriers ──
  { id: 'phpyr', name: '3-Phosphohydroxypyruvate', smiles: 'O=C(COP(=O)(O)O)C(=O)O' },
  { id: 'pser', name: '3-Phosphoserine', smiles: 'N[C@@H](COP(=O)(O)O)C(=O)O' },
  { id: 'thf', name: 'Tetrahydrofolate (H₄ folate)', smiles: cx('Nc1nc2NCC(CN*)Nc2c(=O)[nH]1', 'R'), note: 'Carrier of one-carbon units. R is the p-aminobenzoyl-glutamate part of the molecule.' },
  { id: 'mthf', name: 'N⁵,N¹⁰-Methylenetetrahydrofolate', smiles: cx('Nc1nc2NCC3CN(*)CN3c2c(=O)[nH]1', 'R'), note: 'Carries a one-carbon unit (–CH₂–) bridging N-5 and N-10. Made by serine hydroxymethyltransferase; used by glycine synthase and thymidylate synthase.' },
  { id: 'dhf', name: '7,8-Dihydrofolate', smiles: cx('Nc1nc2NCC(CN*)=Nc2c(=O)[nH]1', 'R'), note: 'Left by thymidylate synthase, which uses the methylene group’s electrons to reduce it to a methyl group; dihydrofolate reductase regenerates tetrahydrofolate.' },

  // ── cysteine ──
  { id: 'oas', name: 'O-Acetylserine', smiles: 'N[C@@H](COC(C)=O)C(=O)O' },
  { id: 'so4', name: 'Sulfate (SO₄²⁻)', smiles: '[O-]S([O-])(=O)=O' },
  { id: 'aps', name: 'Adenosine 5′-phosphosulfate (APS)', smiles: adenosine(rib('P(=O)(O)OS(=O)(=O)O')) },
  { id: 'paps', name: '3′-Phosphoadenosine 5′-phosphosulfate (PAPS)', smiles: adenosine('[C@@H]9O[C@H](COP(=O)(O)OS(=O)(=O)O)[C@@H](OP(=O)(O)O)[C@H]9O') },
  { id: 'so3', name: 'Sulfite (SO₃²⁻)', smiles: '[O-]S([O-])=O' },
  { id: 's2', name: 'Sulfide (S²⁻)', smiles: '[S-2]' },
  { id: 'hcy', name: 'Homocysteine', smiles: 'N[C@@H](CCS)C(=O)O', note: 'Made from methionine; supplies the sulfur atom of cysteine in mammals.' },
  { id: 'cysta', name: 'Cystathionine', smiles: 'N[C@@H](CCSC[C@H](N)C(=O)O)C(=O)O' },
  { id: 'akb', name: 'α-Ketobutyrate', smiles: 'CCC(=O)C(=O)O' },

  // ── molecules derived from amino acids ──
  { id: 'heme', name: 'Heme', smiles: 'CC1=C(C2=CC3=C(C(=C([N-]3)C=C4C(=C(C(=N4)C=C5C(=C(C(=N5)C=C1[N-]2)C)C=C)C)C=C)C)CCC(=O)O)CCC(=O)O.[Fe+2]', note: 'Iron-porphyrin. Glycine is a precursor of the porphyrin ring.' },
  { id: 'biliverdin', name: 'Biliverdin', smiles: 'CC1=C(C(=O)NC1=CC2=C(C(=C(N2)C=C3C(=C(C(=CC4=NC(=O)C(=C4C)C=C)N3)C)CCC(=O)O)CCC(=O)O)C)C=C' },
  { id: 'bilirubin', name: 'Bilirubin', smiles: 'CC1=C(NC(=C1CCC(=O)O)CC2=C(C(=C(N2)C=C3C(=C(C(=O)N3)C=C)C)C)CCC(=O)O)C=C4C(=C(C(=O)N4)C)C=C', note: 'Converted to the bile pigments.' },
  { id: 'ggc', name: 'γ-Glutamylcysteine', smiles: 'N[C@@H](CCC(=O)N[C@@H](CS)C(=O)O)C(=O)O' },
  { id: 'gsh', name: 'Glutathione (GSH)', smiles: 'N[C@@H](CCC(=O)N[C@@H](CS)C(=O)NCC(=O)O)C(=O)O', note: 'γ-Glutamylcysteinylglycine: an important cellular reducing agent (oxidized form GSSG).' },
  { id: 'creatine', name: 'Creatine', smiles: 'CN(CC(=O)O)C(=N)N' },
  { id: 'pcr', name: 'Phosphocreatine', smiles: 'CN(CC(=O)O)C(=N)NP(=O)(O)O', note: 'An energy buffer (in muscle, it regenerates ATP from ADP).' },
  { id: 'dopa', name: 'Dopa', smiles: 'N[C@@H](Cc1ccc(O)c(O)c1)C(=O)O', note: 'L-3,4-Dihydroxyphenylalanine.' },
  { id: 'dopamine', name: 'Dopamine', smiles: 'NCCc1ccc(O)c(O)c1' },
  { id: 'noradr', name: 'Norepinephrine', smiles: 'NC[C@H](O)c1ccc(O)c(O)c1' },
  { id: 'adr', name: 'Epinephrine', smiles: 'CNC[C@H](O)c1ccc(O)c(O)c1' },
  { id: 'gaba', name: 'γ-Aminobutyrate (GABA)', smiles: 'NCCCC(=O)O' },
  { id: 'histamine', name: 'Histamine', smiles: 'NCCc1c[nH]cn1' },
  { id: 'htp', name: '5-Hydroxytryptophan', smiles: 'N[C@@H](Cc1c[nH]c2ccc(O)cc12)C(=O)O' },
  { id: 'serotonin', name: 'Serotonin', smiles: 'NCCc1c[nH]c2ccc(O)cc12' },
  { id: 'no', name: 'Nitric oxide (NO)', smiles: '[N]=O', note: 'A biological messenger, made from arginine.' },

  // ── purine synthesis ──
  { id: 'prpp', name: '5-Phosphoribosyl 1-pyrophosphate (PRPP)', smiles: 'O=P(O)(O)OC[C@H]1O[C@H](OP(=O)(O)OP(=O)(O)O)[C@H](O)[C@@H]1O', note: 'Derived from ribose 5-phosphate. Supplies the ribose phosphate of nucleotides in de novo and salvage pathways.' },
  { id: 'pra', name: '5-Phospho-β-D-ribosylamine', smiles: 'N[C@@H]1O[C@H](COP(=O)(O)O)[C@@H](O)[C@H]1O', note: 'Highly unstable.' },
  { id: 'gar', name: 'Glycinamide ribonucleotide (GAR)', smiles: cx('NCC(=O)N*', 'R'), note: 'R = ribose 5-phosphate.' },
  { id: 'fgar', name: 'Formylglycinamide ribonucleotide (FGAR)', smiles: cx('O=CNCC(=O)N*', 'R'), note: 'R = ribose 5-phosphate.' },
  { id: 'fgam', name: 'Formylglycinamidine ribonucleotide (FGAM)', smiles: cx('O=CNCC(=N)N*', 'R'), note: 'R = ribose 5-phosphate.' },
  { id: 'air', name: '5-Aminoimidazole ribonucleotide (AIR)', smiles: cx('Nc1cncn1*', 'R'), note: 'The first ring (imidazole) of the purine is complete. R = ribose 5-phosphate.' },
  { id: 'n5cair', name: 'N⁵-Carboxyaminoimidazole ribonucleotide (N⁵-CAIR)', smiles: cx('OC(=O)Nc1cncn1*', 'R'), note: 'R = ribose 5-phosphate.' },
  { id: 'cair', name: 'Carboxyaminoimidazole ribonucleotide (CAIR)', smiles: cx('Nc1c(C(=O)O)ncn1*', 'R'), note: 'R = ribose 5-phosphate.' },
  { id: 'saicar', name: 'N-Succinyl-5-aminoimidazole-4-carboxamide ribonucleotide (SAICAR)', smiles: cx('Nc1c(C(=O)N[C@@H](CC(=O)O)C(=O)O)ncn1*', 'R'), note: 'R = ribose 5-phosphate.' },
  { id: 'aicar', name: '5-Aminoimidazole-4-carboxamide ribonucleotide (AICAR)', smiles: cx('Nc1c(C(N)=O)ncn1*', 'R'), note: 'R = ribose 5-phosphate.' },
  { id: 'faicar', name: 'N-Formylaminoimidazole-4-carboxamide ribonucleotide (FAICAR)', smiles: cx('O=CNc1c(C(N)=O)ncn1*', 'R'), note: 'R = ribose 5-phosphate.' },
  { id: 'imp', name: 'Inosinate (IMP)', smiles: inosine(rib(P1)), note: 'The first intermediate with a complete purine ring; the branch point to AMP and GMP.' },
  { id: 'adsuc', name: 'Adenylosuccinate', smiles: `OC(=O)C[C@H](Nc1ncnc2c1ncn2${rib(P1)})C(=O)O` },
  { id: 'amp', name: 'Adenylate (AMP)', smiles: adenosine(rib(P1)) },
  { id: 'xmp', name: 'Xanthylate (XMP)', smiles: `O=c1[nH]c(=O)c2ncn(${rib(P1)})c2[nH]1` },
  { id: 'gmp', name: 'Guanylate (GMP)', smiles: guanosine(rib(P1)) },
  { id: 'adenine', name: 'Adenine', smiles: 'Nc1ncnc2[nH]cnc12' },
  { id: 'hypoxanthine', name: 'Hypoxanthine', smiles: 'O=c1[nH]cnc2[nH]cnc12' },
  { id: 'guanine', name: 'Guanine', smiles: 'Nc1nc2[nH]cnc2c(=O)[nH]1' },

  // ── pyrimidine synthesis ──
  { id: 'carbasp', name: 'N-Carbamoylaspartate', smiles: 'NC(=O)N[C@@H](CC(=O)O)C(=O)O' },
  { id: 'dho', name: 'L-Dihydroorotate', smiles: 'O=C1C[C@@H](C(=O)O)NC(=O)N1' },
  { id: 'orotate', name: 'Orotate', smiles: 'O=C(O)c1cc(=O)[nH]c(=O)[nH]1', note: 'The completed pyrimidine ring, before ribose 5-phosphate is attached.' },
  { id: 'omp', name: 'Orotidylate (OMP)', smiles: `O=C(O)c1cc(=O)[nH]c(=O)n1${rib(P1)}` },
  { id: 'ump', name: 'Uridylate (UMP)', smiles: uridine(rib(P1)) },
  { id: 'utp', name: 'Uridine 5′-triphosphate (UTP)', smiles: uridine(rib(P3)) },
  { id: 'ctp', name: 'Cytidine 5′-triphosphate (CTP)', smiles: cytidine(rib(P3)), note: 'End product of the pathway: it inhibits aspartate transcarbamoylase, the first step.' },

  // ── deoxyribonucleotides and thymidylate ──
  { id: 'cdp', name: 'CDP', smiles: cytidine(rib(P2)) },
  { id: 'dcdp', name: 'dCDP', smiles: cytidine(drib(P2)) },
  { id: 'dctp', name: 'dCTP', smiles: cytidine(drib(P3)) },
  { id: 'udp', name: 'UDP', smiles: uridine(rib(P2)) },
  { id: 'dudp', name: 'dUDP', smiles: uridine(drib(P2)) },
  { id: 'dutp', name: 'dUTP', smiles: uridine(drib(P3)), note: 'Kept at a low level by dUTPase, so that uridylate is not built into DNA.' },
  { id: 'dump', name: 'dUMP', smiles: uridine(drib(P1)), note: 'The immediate precursor of thymidylate.' },
  { id: 'dtmp', name: 'Thymidylate (dTMP)', smiles: `Cc1cn(${drib(P1)})c(=O)[nH]c1=O` },

  // ── purine breakdown ──
  { id: 'adenosine', name: 'Adenosine', smiles: adenosine(rib()) },
  { id: 'inosine', name: 'Inosine', smiles: inosine(rib()) },
  { id: 'guanosine', name: 'Guanosine', smiles: guanosine(rib()) },
  { id: 'xanthine', name: 'Xanthine', smiles: 'O=c1[nH]c(=O)c2[nH]cnc2[nH]1' },
  { id: 'allantoin', name: 'Allantoin', smiles: 'NC(=O)NC1NC(=O)NC1=O', note: 'Excreted by most mammals (which oxidize uric acid further).' },
  { id: 'allantoate', name: 'Allantoate', smiles: 'NC(=O)NC(NC(N)=O)C(=O)O', note: 'Excreted by bony fishes.' },
  { id: 'glyox', name: 'Glyoxylate', smiles: 'O=CC(=O)O' },

  // ── pyrimidine breakdown ──
  { id: 'thymine', name: 'Thymine', smiles: 'Cc1c[nH]c(=O)[nH]c1=O' },
  { id: 'dht', name: 'Dihydrothymine', smiles: 'CC1CNC(=O)NC1=O' },
  { id: 'bui', name: 'β-Ureidoisobutyrate', smiles: 'CC(CNC(N)=O)C(=O)O' },
  { id: 'baib', name: 'β-Aminoisobutyrate', smiles: 'CC(CN)C(=O)O' },
  { id: 'mmsa', name: 'Methylmalonyl-semialdehyde', smiles: 'CC(C=O)C(=O)O', note: 'Also an intermediate of valine breakdown.' },
  { id: 'uracil', name: 'Uracil', smiles: 'O=c1cc[nH]c(=O)[nH]1' },
  { id: 'cytosine', name: 'Cytosine', smiles: 'Nc1cc[nH]c(=O)n1' },
];
