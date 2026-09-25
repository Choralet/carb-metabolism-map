import { lipidReg } from './part3/regulation.ts';
import { aminoReg } from './part4/regulation.ts';

/**
 * Allosteric regulation and the inhibitor table, taken from the lecture slides.
 * Blocks are anchored to an enzyme pill (`edge`) or a map node, and offset by dx/dy.
 */
export interface RegBlock {
  id: string;
  kind: 'enzyme' | 'agent';
  anchor: { edge: string } | { node: string };
  dx: number;
  dy: number;
  title: string;
  /** Compact one-line lists rendered on the map. */
  act?: string;
  inh?: string;
  detail: string[];
  slide: string;
}

const P1 = 'Part I · slide ';
const P2 = 'Part II · slide ';

export const regBlocks: RegBlock[] = [
  // ───────── Allosteric regulation of glycolysis (Part II slide 28) ─────────
  {
    id: 'r_hk', kind: 'enzyme', anchor: { edge: 'e_hk' }, dx: -250, dy: 55,
    title: 'Hexokinase',
    act: 'Pi', inh: 'Glucose 6-phosphate',
    detail: ['Hexokinase is one of the three rate-limiting, allosterically regulated steps of glycolysis (with PFK-1 and pyruvate kinase).',
      'The regulation figure shows product inhibition by glucose 6-phosphate, and activation by inorganic phosphate.'],
    slide: P2 + '28 · ' + P1 + '19',
  },
  {
    id: 'r_pfk1', kind: 'enzyme', anchor: { edge: 'e_pfk' }, dx: -250, dy: 55,
    title: 'Phosphofructokinase-1',
    act: 'AMP, ADP', inh: 'ATP, Citrate',
    detail: ['Activity rises whenever the cell’s ATP supply is depleted or the breakdown products ADP and AMP accumulate.',
      'It is inhibited when the cell has ample ATP and is well supplied by other fuels such as fatty acids.',
      'Citrate inhibiting PFK-1 is what interlocks glycolysis with the citric acid cycle, supplementing the adenine nucleotide system.'],
    slide: P2 + '28 · ' + P1 + '10, 19',
  },
  {
    id: 'r_pk', kind: 'enzyme', anchor: { edge: 'e_pk' }, dx: -250, dy: 45,
    title: 'Pyruvate kinase',
    act: 'ADP', inh: 'ATP, NADH',
    detail: ['The third rate-limiting, allosterically regulated step of glycolysis.'],
    slide: P2 + '28 · ' + P1 + '19',
  },

  // ───────── Pentose phosphate pathway (Part I slide 37) ─────────
  {
    id: 'r_g6pd', kind: 'enzyme', anchor: { edge: 'e_g6pd' }, dx: -30, dy: -95,
    title: 'Glucose 6-phosphate dehydrogenase',
    act: 'NADP⁺', inh: 'NADPH',
    detail: ['G6PD needs NADP⁺ as its electron acceptor, so this one enzyme decides whether glucose 6-phosphate goes to the pentose phosphate pathway or to glycolysis.',
      'Rapid use of NADPH raises [NADP⁺], which allosterically stimulates G6PD and increases flux through the pathway.',
      'When NADPH forms faster than it is used, the rising [NADPH] inhibits G6PD and more glucose 6-phosphate is left for glycolysis.'],
    slide: P1 + '37',
  },

  // ───────── PDH complex and the citric acid cycle (Part II slides 15, 28) ─────────
  {
    id: 'r_pdh', kind: 'enzyme', anchor: { edge: 'e_pdh' }, dx: -330, dy: 190,
    title: 'Pyruvate dehydrogenase complex',
    act: 'AMP, ADP, NAD⁺, CoA, Ca²⁺', inh: 'ATP, Acetyl-CoA, NADH, Fatty acids',
    detail: ['The first of the two control points on the flow of carbon from pyruvate into the cycle.',
      'Allosterically inhibited (turned off) when the [ATP]/[ADP], [NADH]/[NAD⁺] and [acetyl-CoA]/[CoA] ratios are high, which signals an energy-sufficient state. When those ratios fall, the complex turns on.',
      'In muscle, Ca²⁺ released on contraction stimulates it, replacing the ATP that contraction consumed.'],
    slide: P2 + '15, 28',
  },
  {
    id: 'r_cs', kind: 'enzyme', anchor: { edge: 'e_cs' }, dx: 150, dy: -120,
    title: 'Citrate synthase',
    act: 'ADP', inh: 'ATP, NADH, Succinyl-CoA, Citrate',
    detail: ['The second control point: the entry of acetyl-CoA into the cycle.',
      'Feedback inhibition by succinyl-CoA, citrate and ATP slows the cycle by inhibiting its early steps.',
      'Flux is also limited simply by how much oxaloacetate and acetyl-CoA are available, since these are its substrates.'],
    slide: P2 + '15, 28',
  },
  {
    id: 'r_idh', kind: 'enzyme', anchor: { edge: 'e_idh' }, dx: -230, dy: 30,
    title: 'Isocitrate dehydrogenase',
    act: 'ADP, Ca²⁺', inh: 'ATP',
    detail: ['One of the three NAD-dependent oxidation steps, so it is slowed by a high [NADH]/[NAD⁺] ratio.',
      'Stimulated by Ca²⁺ in contracting muscle.'],
    slide: P2 + '15, 28',
  },
  {
    id: 'r_akgdh', kind: 'enzyme', anchor: { edge: 'e_akgdh' }, dx: -230, dy: 30,
    title: 'α-Ketoglutarate dehydrogenase complex',
    act: 'Ca²⁺', inh: 'Succinyl-CoA, NADH',
    detail: ['Inhibited by its own product succinyl-CoA, and by NADH.', 'Stimulated by Ca²⁺ in contracting muscle.'],
    slide: P2 + '15, 28',
  },

  // ───────── Inhibitors of oxidative phosphorylation (Part II slide 25, Table 19-4) ─────────
  {
    id: 'a_cx1', kind: 'agent', anchor: { node: 'cx1' }, dx: -70, dy: 170,
    title: 'Blocks electron transfer at Complex I',
    inh: 'Rotenone · Amytal · Piericidin A · Myxothiazol',
    detail: ['Table 19-4 groups these four agents together as preventing electron transfer from the Fe-S center to ubiquinone.',
      'Note: the table lists myxothiazol here, though it is usually described as acting on Complex III. Shown as the slide has it.'],
    slide: P2 + '25',
  },
  {
    id: 'a_cx3', kind: 'agent', anchor: { node: 'cx3' }, dx: 50, dy: 170,
    title: 'Blocks electron transfer at Complex III',
    inh: 'Antimycin A',
    detail: ['Blocks electron transfer from cytochrome b to cytochrome c₁.',
      'Also listed in the lecture bullets among the chemicals targeting enzymes and biomolecules in the electron transport chain.'],
    slide: P2 + '25',
  },
  {
    id: 'a_cx4', kind: 'agent', anchor: { node: 'cx4' }, dx: -70, dy: 170,
    title: 'Inhibits cytochrome oxidase (Complex IV)',
    inh: 'Cyanide (CN⁻) · Carbon monoxide · Sodium azide',
    detail: ['Cyanide and carbon monoxide inhibit cytochrome oxidase, the last carrier before O₂.',
      'Sodium azide is listed in the lecture bullets among the chemicals targeting the electron transport chain.'],
    slide: P2 + '25',
  },
  {
    id: 'a_cx5', kind: 'agent', anchor: { node: 'cx5' }, dx: -70, dy: 170,
    title: 'Inhibits ATP synthase',
    inh: 'Oligomycin · Venturicidin · Aurovertin · DCCD',
    detail: ['Oligomycin and venturicidin inhibit F₀ (and CF₀ in chloroplasts).',
      'Aurovertin inhibits F₁.',
      'DCCD (dicyclohexylcarbodiimide) blocks proton flow through F₀ and CF₀. The lecture bullet abbreviates it "DCDD"; the table footnote spells it DCCD.'],
    slide: P2 + '25',
  },
  {
    id: 'a_unc', kind: 'agent', anchor: { node: 'q' }, dx: -115, dy: 170,
    title: 'Uncouplers of phosphorylation from electron transfer',
    inh: '2,4-DNP · FCCP · Valinomycin · Thermogenin',
    detail: ['An uncoupler reduces the proton-motive force, so electron transfer no longer drives ATP synthesis.',
      'FCCP and 2,4-DNP (2,4-dinitrophenol) are hydrophobic proton carriers; 2,4-DNP reduces the pH difference across the membrane.',
      'Valinomycin is a K⁺ ionophore.',
      'Thermogenin, in brown adipose tissue, forms proton-conducting pores in the inner mitochondrial membrane.'],
    slide: P2 + '25',
  },

  // ───────── Part III: fatty acid synthesis vs breakdown ─────────
  ...lipidReg,

  // ───────── Part IV: glutamine synthetase and ATCase ─────────
  ...aminoReg,
];

export const regById = Object.fromEntries(regBlocks.map((r) => [r.id, r])) as Record<string, RegBlock>;

/** Agents from Table 19-4 that have no drawn target on this map. */
export const otherAgents = [
  { name: 'Atractyloside', mode: 'Inhibits the adenine nucleotide translocase, blocking ATP-ADP exchange across the inner membrane.' },
  { name: 'DCMU', mode: 'Competes with Q_B for its binding site in photosystem II — photophosphorylation, not the mitochondrial chain.' },
];

/** Regulation blocks attached to a given enzyme, for the details drawer. */
export const regForEnzyme = (enz: string) => regBlocks.filter((r) => r.kind === 'enzyme' && r.id === 'r_' + enz);
