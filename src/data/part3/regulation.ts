import type { RegBlock } from '../regulation';

const S = 'Part III · slides ';

/**
 * The two enzymes that coordinate fatty acid synthesis with β-oxidation (slides 36–39). Anchored to their arrows on
 * Plates 16 and 11; ids follow `'r_' + enzyme id` so the enzyme drawer finds them.
 */
export const lipidReg: RegBlock[] = [
  {
    id: 'r_l_acc', kind: 'enzyme', anchor: { edge: 'e_lf1' }, dx: 250, dy: -40,
    title: 'Acetyl-CoA carboxylase',
    act: 'Citrate · insulin (dephosphorylation)', inh: 'Palmitoyl-CoA · glucagon, epinephrine (phosphorylation)',
    detail: ['The rate-limiting step of fatty acid synthesis. In vertebrate cells, both allosteric regulation and hormone-dependent covalent modification control the flow of precursors into malonyl-CoA.',
      'Allosteric: citrate activates it; palmitoyl-CoA, the end product of the pathway, inhibits it.',
      'High blood glucose → insulin → a phosphatase dephosphorylates ACC, activating it.',
      'Low blood glucose → glucagon → cAMP-dependent protein kinase (PKA) phosphorylates ACC, inactivating it. Epinephrine also triggers its phosphorylation.'],
    slide: S + '36, 38–39',
  },
  {
    id: 'r_l_cat1', kind: 'enzyme', anchor: { edge: 'e_lc2' }, dx: 260, dy: -80,
    title: 'Carnitine acyltransferase I',
    inh: 'Malonyl-CoA',
    detail: ['Limits the transport of fatty acids into the mitochondrial matrix for β-oxidation.',
      'Malonyl-CoA, the first intermediate of fatty acid synthesis, inhibits it: while ACC is active (after a carbohydrate meal), fatty acids stay out of the matrix and are not oxidized.',
      'Between meals ACC is phosphorylated and inactive, malonyl-CoA falls, the inhibition is relieved, and fatty acids enter the matrix for β-oxidation.'],
    slide: S + '37–39',
  },
];
