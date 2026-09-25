import type { RegBlock } from '../regulation';

const S = 'Part IV · slide ';

/** Glutamine synthetase (slide 20) and aspartate transcarbamoylase (slide 34). Ids follow `'r_' + enzyme id`. */
export const aminoReg: RegBlock[] = [
  {
    id: 'r_n_gs', kind: 'enzyme', anchor: { edge: 'e_ng2' }, dx: 300, dy: -30,
    title: 'Glutamine synthetase',
    inh: 'Glycine · alanine · AMP · CTP · tryptophan · histidine · carbamoyl phosphate · glucosamine 6-phosphate',
    detail: ['Regulated in virtually all organisms: it is the entry point for reduced nitrogen.',
      'Alanine, glycine and at least six end products of glutamine metabolism (AMP, CTP, tryptophan, histidine, carbamoyl phosphate and glucosamine 6-phosphate) are allosteric inhibitors.',
      'Each inhibitor alone gives only partial inhibition, but together their effects are more than additive: all eight virtually shut the enzyme down. This constantly adjusts glutamine levels to immediate needs.'],
    slide: S + '20',
  },
  {
    id: 'r_n_atc', kind: 'enzyme', anchor: { edge: 'e_ny1' }, dx: 250, dy: 40,
    title: 'Aspartate transcarbamoylase',
    inh: 'CTP',
    detail: ['CTP, the end product of pyrimidine synthesis, feeds back to inhibit the first step (the dashed line on the slide).'],
    slide: S + '34',
  },
];
