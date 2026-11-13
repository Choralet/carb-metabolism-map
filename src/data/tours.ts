import type { Part } from './types';

/**
 * Study mode: guided walkthroughs that step through a pathway in lecture order, one arrow at a time.
 *
 * A chapter follows its slides: each step points at one arrow (`edge`) or, for a step with no arrow of its own, a
 * molecule node (`node`), says in a sentence or two what happens there, and cites its slide. Only what the slides
 * show, as everywhere else. Chapter and step ids are permanent: progress (`localStorage 'atlas-study'`) keys on them.
 */
export interface TourStep {
  id: string;
  /** The arrow this step animates. */
  edge?: string;
  /** A molecule to show instead, for a step that is about where something ends up rather than an arrow. */
  node?: string;
  /** Short heading: what happens, in a few words. */
  title: string;
  /** The narration: one or two sentences. */
  say: string;
  slide: string;
}

export interface Tour { id: string; part: Part; title: string; sub: string; slides: string; steps: TourStep[] }

const S = 'Part III · slide ';

export const tours: Tour[] = [
  {
    id: 't_l_diet', part: 'III', title: 'Dietary fat, from meal to muscle', sub: 'Processing of dietary lipids in vertebrates', slides: '5–7',
    steps: [
      { id: 's1', edge: 'e_ld1', title: 'Bile salts emulsify the fat', slide: S + '5',
        say: 'Ingested triacylglycerols are insoluble fat particles. Bile salts, made from cholesterol in the liver and kept in the gallbladder, turn them into mixed micelles of bile salts and triacylglycerol.' },
      { id: 's2', edge: 'e_ld2', title: 'Intestinal lipases cut them up', slide: S + '5',
        say: 'Micelles make more of the fat reachable by the water-soluble lipases of the intestine, which convert triacylglycerols to monoacylglycerols, diacylglycerols, free fatty acids and glycerol.' },
      { id: 's3', edge: 'e_ld3', title: 'Taken up and rebuilt', slide: S + '6',
        say: 'These products diffuse into the epithelial cells lining the intestinal surface (the intestinal mucosa), where they are reconverted to triacylglycerols.' },
      { id: 's4', edge: 'e_ld4', title: 'Packed into chylomicrons', slide: S + '6',
        say: 'The triacylglycerols are packaged with dietary cholesterol and specific proteins (apolipoproteins) into lipoprotein aggregates called chylomicrons, 100–500 nm across.' },
      { id: 's5', edge: 'e_ld5', title: 'Lymph, then blood', slide: S + '7',
        say: 'Chylomicrons move from the intestinal mucosa into the lymphatic system and then into the blood, which carries them to muscle and adipose tissue.' },
      { id: 's6', edge: 'e_ld6', title: 'Lipoprotein lipase', slide: S + '7',
        say: 'In the capillaries, lipoprotein lipase, activated by apoC-II, hydrolyzes the triacylglycerols to fatty acids and glycerol.' },
      { id: 's7', edge: 'e_ld7', title: 'Fatty acids enter cells', slide: S + '7',
        say: 'The fatty acids enter the cells: myocytes in muscle, adipocytes in adipose tissue.' },
      { id: 's8', node: 'lt_fa', title: 'Burned or stored', slide: S + '7',
        say: 'In muscle, fatty acids are oxidized for energy. In adipose tissue, they are re-esterified and stored as triacylglycerols.' },
    ],
  },
  {
    id: 't_l_box', part: 'III', title: 'β-Oxidation: one round', sub: 'Four steps in the mitochondrial matrix', slides: '12–14',
    steps: [
      { id: 's1', edge: 'e_lb1', title: 'Dehydrogenation (FAD)', slide: S + '13',
        say: 'Acyl-CoA dehydrogenase makes a double bond between the α and β carbons (C-2, C-3), giving a trans-Δ²-enoyl-CoA. FAD accepts the electrons and becomes FADH₂.' },
      { id: 's2', edge: 'e_lb2', title: 'Hydration', slide: S + '13',
        say: 'Enoyl-CoA hydratase adds H₂O across the double bond of trans-Δ²-enoyl-CoA, forming L-β-hydroxyacyl-CoA.' },
      { id: 's3', edge: 'e_lb3', title: 'Dehydrogenation (NAD⁺)', slide: S + '14',
        say: 'β-Hydroxyacyl-CoA dehydrogenase oxidizes L-β-hydroxyacyl-CoA to β-ketoacyl-CoA. NAD⁺ is the electron acceptor; the NADH passes its electrons to NADH dehydrogenase in the respiratory chain.' },
      { id: 's4', edge: 'e_lb4', title: 'Thiolysis', slide: S + '14',
        say: 'β-Ketoacyl-CoA reacts with free CoA. Thiolase splits off the two carbons at the carboxyl end as acetyl-CoA, leaving a fatty acyl-CoA two carbons shorter.' },
      { id: 's5', edge: 'e_lb5', title: 'Round and round', slide: S + '12',
        say: 'The shortened acyl-CoA goes through the same four steps again. Palmitate (16 C) makes 7 passes, losing 2 carbons each time, and ends as 8 acetyl-CoA for the citric acid cycle.' },
    ],
  },
];

export const tourById: Record<string, Tour> = Object.fromEntries(tours.map((t) => [t.id, t]));
