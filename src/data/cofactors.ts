import type { CoInfo } from './types';

/** Cofactor filter chips. Each one highlights the steps that consume or produce it. */
export const cofactors: CoInfo[] = [
  { id: 'ATP', label: 'ATP / ADP', hint: 'Steps that spend or make ATP (or ADP)' },
  { id: 'NADH', label: 'NADH / NAD⁺', hint: 'Steps that reduce NAD⁺ or re-oxidize NADH' },
  { id: 'NADPH', label: 'NADPH / NADP⁺', hint: 'Steps that make NADPH — the oxidative phase of the pentose phosphate pathway' },
  { id: 'FADH2', label: 'FADH₂ / FAD', hint: 'Succinate dehydrogenase, which is also Complex II' },
  { id: 'GTP', label: 'GTP / GDP', hint: 'Succinyl-CoA synthetase and PEP carboxykinase' },
  { id: 'CO2', label: 'CO₂', hint: 'Decarboxylation steps that release CO₂' },
  { id: 'Pi', label: 'Pi', hint: 'Steps using or releasing inorganic phosphate' },
  { id: 'CoA', label: 'CoA', hint: 'Steps that attach or release coenzyme A' },
  { id: 'UTP', label: 'UTP / UDP', hint: 'Sugar-nucleotide steps of glycogen synthesis' },
];
