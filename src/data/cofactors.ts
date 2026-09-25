import type { CoInfo } from './types';

/** Cofactor filter chips. Each one highlights the steps that consume or produce it. */
export const cofactors: CoInfo[] = [
  { id: 'ATP', label: 'ATP / ADP', hint: 'Steps that spend or make ATP (or ADP)' },
  { id: 'NADH', label: 'NADH / NAD⁺', hint: 'Steps that reduce NAD⁺ or re-oxidize NADH' },
  { id: 'NADPH', label: 'NADPH / NADP⁺', hint: 'Steps that make NADPH (pentose phosphate pathway, malic enzyme) or spend it (fatty acid synthesis, desaturation)' },
  { id: 'FADH2', label: 'FADH₂ / FAD', hint: 'Succinate dehydrogenase (Complex II), mitochondrial glycerol 3-phosphate dehydrogenase and acyl-CoA dehydrogenase (β-oxidation)' },
  { id: 'GTP', label: 'GTP / GDP', hint: 'Succinyl-CoA synthetase and PEP carboxykinase' },
  { id: 'CO2', label: 'CO₂', hint: 'Decarboxylation steps that release CO₂' },
  { id: 'Pi', label: 'Pi', hint: 'Steps using or releasing inorganic phosphate' },
  { id: 'CoA', label: 'CoA', hint: 'Steps that attach or release coenzyme A' },
  { id: 'UTP', label: 'UTP / UDP', hint: 'Sugar-nucleotide steps of glycogen synthesis' },
  { id: 'Biotin', label: 'Biotin', hint: 'Carboxylases the slides name with a biotin prosthetic group: acetyl-CoA carboxylase and propionyl-CoA carboxylase' },
  { id: 'B12', label: 'Coenzyme B₁₂', hint: 'Methylmalonyl-CoA mutase (odd-chain fatty acids)' },
  { id: 'PLP', label: 'PLP', hint: 'Pyridoxal phosphate: aminotransferases, serine hydroxymethyltransferase, the cystathionine enzymes and the amino acid decarboxylases' },
  { id: 'THF', label: 'Folate (H₄ folate)', hint: 'Steps that load or use one-carbon units on tetrahydrofolate: purine and thymidylate synthesis, serine → glycine' },
];
