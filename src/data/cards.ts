import type { Card } from './types';
import { lipidCards } from './part3/cards.ts';

export const cards: Card[] = [
  { id: 'c_gly_bal', title: 'Glycolysis: balance sheet', sub: 'Glucose (6C) → 2 pyruvate (3C), 10 steps, all in the cytosol',
    bullets: [
      'All ten enzymes are in the cytosol and all ten intermediates are phosphorylated 3C or 6C compounds.',
      'Preparatory phase (steps 1–5) spends 2 ATP. Payoff phase (steps 6–10) makes 4 ATP and 2 NADH.',
      'Net: Glucose + 2 NAD⁺ + 2 ADP + 2 Pi → 2 pyruvate + 2 NADH + 2 H⁺ + 2 ATP + 2 H₂O',
      'ΔG°′ of glucose → pyruvate = −146 kJ/mol; making 2 ATP costs +61 kJ/mol; overall −85 kJ/mol. Glycolysis is essentially irreversible.',
      'Under aerobic conditions the 2 NADH pass electrons to O₂ in mitochondria, driving respiration-linked phosphorylation.',
    ], slide: 'Part I · slides 5–7, 18' },
  { id: 'c_gly_reg', title: 'Regulation of glycolysis', sub: 'Keeps ATP nearly constant',
    bullets: [
      'Rate is set by ATP consumption, NADH regeneration, and allosteric control of hexokinase, PFK-1 and pyruvate kinase (the rate-limiting steps).',
      'Longer term: the hormones glucagon, epinephrine and insulin, and changes in gene expression of glycolytic enzymes.',
      'Cancer: tumors of nearly all types run glycolysis at a much higher rate than normal tissue (Warburg effect).',
    ], slide: 'Part I · slide 19' },
  { id: 'c_gng', title: 'Gluconeogenesis', sub: 'Glucose from non-carbohydrate precursors (mainly liver)',
    bullets: [
      'Why: brain, erythrocytes, testes, renal medulla and embryonic tissue rely on blood glucose (brain needs ~120 g/day). Glycogen runs out between meals, in long fasts and after vigorous exercise.',
      'Precursors: lactate, pyruvate, glycerol, certain amino acids (3C and 4C compounds).',
      'Mostly in liver, also renal cortex and small-intestine epithelium. The Cori cycle returns muscle lactate to the liver as glucose.',
      '7 glycolytic steps are reversible and shared. 3 irreversible steps are bypassed (dashed arrows): pyruvate → PEP via OAA, FBPase-1, glucose 6-phosphatase.',
      'Energetics: gluconeogenesis ΔG = −16 kJ/mol; glycolysis ΔG = −63 kJ/mol. It is expensive and not simply glycolysis in reverse.',
    ], slide: 'Part I · slides 26–32' },
  { id: 'c_ppp', title: 'Pentose phosphate pathway (PPP)', sub: 'Also called the phosphogluconate pathway',
    bullets: [
      'Oxidative phase: G6P → pentose phosphate, producing 2 NADPH per G6P (overall: 2 NADPH + ribose 5-P).',
      'Non-oxidative phase: recycles pentose phosphates (C3–C7 intermediates) back to G6P.',
      'Ribose 5-P feeds RNA, DNA and coenzymes (ATP, NADH, FADH₂, CoA) in rapidly dividing cells: bone marrow, skin, intestinal mucosa, tumors.',
      'NADPH drives reductive biosynthesis (fatty acids, cholesterol, steroid hormones) and counters oxidative damage from oxygen radicals.',
    ], slide: 'Part I · slides 34–36' },
  { id: 'c_ppp_reg', title: 'G6P: glycolysis or PPP?', sub: 'Decided by cell needs and [NADP⁺]',
    bullets: [
      'G6PD needs NADP⁺ as electron acceptor. When NADPH is being consumed quickly, NADP⁺ rises and allosterically stimulates G6PD, increasing flux through the PPP.',
      'When NADPH forms faster than it is used, [NADPH] rises and inhibits G6PD, so more G6P is available for glycolysis.',
    ], slide: 'Part I · slide 37' },
  { id: 'c_glycogen', title: 'Why glycogen?', sub: 'Storage form of glucose in animals (starch in plants)',
    bullets: [
      'Stored mainly in liver and skeletal muscle, in large cytosolic granules.',
      'Storing 10% of cell weight as free glucose would give ~0.4 M; as glycogen the same mass is only ~0.01 µM, so osmotic pressure stays low.',
      'Muscle glycogen: quick energy for aerobic or anaerobic metabolism; can be exhausted in under an hour of vigorous exercise.',
      'Liver glycogen: glucose reservoir for other tissues, vital for neurons (which cannot use fatty acids); depleted in 12–24 h.',
      'Fat stores far more energy, but fats cannot be converted to glucose in mammals nor catabolized anaerobically.',
    ], slide: 'Part I · slides 39–40' },
  { id: 'c_tca', title: 'Citric acid cycle (TCA / Krebs cycle)', sub: 'Matrix of mitochondria (cytosol in prokaryotes)',
    bullets: [
      'Oxidizes each acetyl unit to 2 CO₂ and conserves the energy as 3 NADH + 1 FADH₂ + 1 ATP or GTP per turn.',
      'The carbons released as CO₂ are not the same two carbons that entered as the acetyl group.',
      'Amphibolic: also supplies precursors. α-KG and OAA → glutamate and aspartate (transamination); OAA → glucose via PEP; succinyl-CoA → heme.',
      'Any compound giving rise to a 4C or 5C cycle intermediate (e.g. many amino acid breakdown products) can be oxidized by the cycle.',
    ], slide: 'Part II · slides 6–13' },
  { id: 'c_tca_reg', title: 'Regulation of PDH and the cycle', sub: 'Two control points',
    bullets: [
      'Control points: the PDH complex (pyruvate → acetyl-CoA) and citrate synthase (entry of acetyl-CoA).',
      'PDH is inhibited when [ATP]/[ADP], [NADH]/[NAD⁺] and [acetyl-CoA]/[CoA] are high.',
      'Cycle flux is limited by OAA and acetyl-CoA availability and by NAD⁺ depletion. Succinyl-CoA, citrate and ATP feedback-inhibit early steps.',
      'In muscle, Ca²⁺ from contraction stimulates isocitrate DH, α-KG DH and the PDH complex to replace consumed ATP.',
    ], slide: 'Part II · slides 14–15' },
  { id: 'c_ox_reg', title: 'Regulation of ATP-producing pathways', sub: 'Glycolysis, pyruvate oxidation, TCA, oxidative phosphorylation',
    bullets: [
      'High [ATP] (or low [ADP], [AMP]) slows all four pathways; all are accelerated when ATP use and ADP/AMP/Pi formation increase.',
      'Citrate inhibits glycolysis, interlocking glycolysis with the citric acid cycle.',
      'High NADH and acetyl-CoA inhibit pyruvate oxidation; a high [NADH]/[NAD⁺] ratio inhibits the cycle\'s dehydrogenases.',
    ], slide: 'Part II · slide 28' },
  { id: 'sh_ma', title: 'Malate–aspartate shuttle', sub: 'Heart, liver, kidney. NADH equivalents enter at Complex I',
    bullets: [
      'Neither NADH nor NADPH can cross the inner mitochondrial membrane; only the electrons they carry are shuttled across.',
      '1) Cytosolic NADH passes 2 reducing equivalents to oxaloacetate, producing malate.',
      '2) Malate crosses the inner membrane via the malate-α-ketoglutarate transporter.',
      '3) In the matrix, malate passes 2 reducing equivalents to NAD⁺; the NADH is oxidized by the respiratory chain.',
      '4) Oxaloacetate is transaminated to aspartate. 5) Aspartate leaves via the glutamate-aspartate transporter. 6) Oxaloacetate is regenerated in the cytosol.',
      'Yield ≈ 2.5 ATP per NADH, giving 32 ATP per glucose.',
    ], mols: ['mal', 'oaa', 'asp', 'glu', 'akg'], slide: 'Part II · slides 18–19, 26' },
  { id: 'sh_g3p', title: 'Glycerol 3-phosphate shuttle', sub: 'Muscle and brain. Electrons enter at ubiquinone (Complex III)',
    bullets: [
      'In the cytosol, DHAP accepts 2 reducing equivalents from NADH via cytosolic glycerol 3-phosphate dehydrogenase.',
      'An isozyme bound to the outer face of the inner membrane transfers 2 reducing equivalents from glycerol 3-phosphate to ubiquinone, so electrons go on through Complex III, not Complex I.',
      'Yield ≈ 1.5 ATP per NADH, giving 30 ATP per glucose.',
    ], mols: ['dhap', 'g3pgly'], slide: 'Part II · slides 18, 20, 26' },
  { id: 'c_inhib', title: 'Inhibitors and uncouplers', sub: 'Table 19-4: agents that interfere with oxidative phosphorylation',
    bullets: [
      'Inhibition of electron transfer — Cyanide and carbon monoxide inhibit cytochrome oxidase (Complex IV). Antimycin A blocks electron transfer from cytochrome b to cytochrome c₁. Myxothiazol, rotenone, amytal and piericidin A prevent electron transfer from the Fe-S center to ubiquinone. DCMU competes with Q_B for its binding site in photosystem II.',
      'Inhibition of ATP synthase — Aurovertin inhibits F₁. Oligomycin and venturicidin inhibit F₀ and CF₀. DCCD blocks proton flow through F₀ and CF₀.',
      'Uncoupling of phosphorylation from electron transfer — FCCP and DNP act as hydrophobic proton carriers; 2,4-DNP reduces the pH difference across the membrane. Valinomycin is a K⁺ ionophore. Thermogenin, in brown adipose tissue, forms proton-conducting pores in the inner mitochondrial membrane.',
      'Inhibition of ATP-ADP exchange — Atractyloside inhibits the adenine nucleotide translocase.',
      'The lecture bullets single out three groups: agents on ATP synthase (oligomycin, DCCD), the uncoupler 2,4-DNP, and chemicals targeting the chain itself (CN⁻, sodium azide, antimycin A).',
    ], slide: 'Part II · slide 25' },
  { id: 'c_yield', title: 'ATP yield per glucose', sub: 'Depends on the shuttle and on oxygen',
    bullets: [
      'Malate–aspartate shuttle (heart, kidney, liver): NADH enters at Complex I, ≈ 2.5 ATP each → net 32 ATP.',
      'Glycerol 3-phosphate shuttle (muscle, brain): enters at Complex III, ≈ 1.5 ATP each → net 30 ATP.',
      'Anaerobic glycolysis (lactate fermentation): only 2 ATP per glucose.',
    ], slide: 'Part II · slide 26' },
  { id: 'c_mito', title: 'Electron transport chain', sub: 'Inner mitochondrial membrane (~10,000 sets per mitochondrion)',
    bullets: [
      'Complexes I and II pass electrons to ubiquinone (Q) from NADH and succinate; Complex III passes them to cytochrome c; Complex IV passes them to O₂.',
      'Electron flow through I, III and IV pumps protons from the matrix to the intermembrane space, building the proton-motive force (ΔpH + Δψ).',
      'The inner membrane is impermeable to protons; they return only through F₀ of ATP synthase, driving F₁ to make ATP.',
    ], slide: 'Part II · slides 17, 21–24' },
  ...lipidCards,
];

export const cardById = Object.fromEntries(cards.map((c) => [c.id, c])) as Record<string, Card>;
