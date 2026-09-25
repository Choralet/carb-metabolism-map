import type { Card } from '../types';

const S = 'Part IV · slides ';

export const aminoCards: Card[] = [
  // ── digestion and the fate of amino acids ──
  { id: 'n_c_digest', title: 'Digesting protein', sub: 'Hormones, acid and zymogens',
    bullets: [
      'Protein entering the stomach makes the gastric mucosa secrete the hormone gastrin, which stimulates HCl secretion by the parietal cells and pepsinogen secretion by the chief cells.',
      'The acidic gastric juice (pH 1.0–2.5) is an antiseptic that kills most bacteria, and a denaturing agent that unfolds globular proteins so their internal peptide bonds are easier to hydrolyze.',
      'When the acidic contents reach the small intestine, the low pH triggers secretion of the hormone secretin, which makes the pancreas secrete bicarbonate to neutralize the HCl.',
      'The pancreas secretes trypsinogen, chymotrypsinogen and procarboxypeptidases A and B. Making the proteases as inactive zymogens protects the exocrine cells from being digested themselves.',
    ], slide: S + '4–6' },
  { id: 'n_c_circum', title: 'When amino acids are oxidized', sub: 'Three metabolic circumstances',
    bullets: [
      'During the normal synthesis and degradation of cellular proteins: amino acids released from protein breakdown and not needed for new protein are degraded.',
      'On a protein-rich diet, when the amino acids eaten exceed the needs of protein synthesis. Amino acids cannot be stored, so the surplus is catabolized.',
      'During starvation or in uncontrolled diabetes mellitus, when carbohydrates are unavailable or not properly used: cellular proteins are used as fuel.',
    ], slide: S + '7' },
  { id: 'n_c_overview', title: 'Amino groups and carbon skeletons', sub: 'Overview of amino acid catabolism',
    bullets: [
      'The key step in degrading any amino acid is separating the α-amino group from the carbon skeleton.',
      'The amino group goes to amino-group metabolism and nitrogen excretion through the urea cycle (or into the biosynthesis of amino acids, nucleotides and biological amines).',
      'The carbon skeletons become α-keto acids and are converted to intermediates of glycolysis and the citric acid cycle, and used as fuel or for gluconeogenesis.',
    ], slide: S + '8' },
  { id: 'n_c_collect', title: 'Glutamate and glutamine collect the nitrogen', sub: 'General collection points for amino groups',
    bullets: [
      'Glutamate and glutamine, or both, are present at higher concentrations than other amino acids in most tissues.',
      'In the cytosol of hepatocytes, amino groups from most amino acids are transferred to α-ketoglutarate, forming glutamate (transamination).',
      'Excess ammonia made in most other tissues is converted to glutamine, which passes to the mitochondria of the liver.',
      'In skeletal muscle, excess amino groups are generally transferred to pyruvate, forming alanine.',
    ], slide: S + '9' },
  { id: 'n_c_excrete', title: 'Excreting nitrogen', sub: 'NH₃ is toxic',
    bullets: [
      'Ammonotelic animals excrete ammonia (NH₄⁺): most aquatic vertebrates, such as bony fishes and the larvae of amphibia.',
      'Ureotelic animals excrete urea: most terrestrial vertebrates, and also sharks.',
      'Uricotelic animals excrete uric acid: birds and reptiles.',
    ], mols: ['nh4', 'urea', 'uric'], slide: S + '9, 11' },
  { id: 'n_c_glnt', title: 'Glutamine carries ammonia', sub: 'Non-toxic transport in the bloodstream',
    bullets: [
      'Ammonia is quite toxic to animal tissues, and its level in blood is regulated. Most animals convert free ammonia to a non-toxic compound before exporting it from extrahepatic tissues to the liver or kidneys.',
      'Glutamine is that transport form. It is normally present in blood at much higher concentration than other amino acids, and is also an amino-group donor in many biosynthetic reactions.',
      'In the liver, glutaminase releases the NH₄⁺ in the mitochondria, and ammonia from all sources is disposed of by urea synthesis.',
    ], slide: S + '12' },
  { id: 'n_c_gac', title: 'Glucose-alanine cycle', sub: 'Muscle → liver → muscle',
    bullets: [
      'In tissues that degrade amino acids for fuel, amino groups are collected as glutamate. Glutamate can become glutamine, or pass its amino group to pyruvate (from glycolysis) to form alanine.',
      'Alanine travels in the blood to the liver, where alanine aminotransferase gives pyruvate and glutamate.',
      'In the mitochondria, glutamate either releases NH₄⁺ (glutamate dehydrogenase) or transaminates oxaloacetate to aspartate, the other nitrogen donor of the urea cycle.',
      'The pyruvate is made into glucose by gluconeogenesis and returned to the muscle.',
    ], slide: S + '13' },
  { id: 'n_c_urea', title: 'The urea cycle', sub: 'Liver: mitochondria and cytosol',
    bullets: [
      'Urea is made almost exclusively in the liver, then carried in the blood to the kidneys and excreted in the urine.',
      'The cycle begins inside liver mitochondria; the three following steps take place in the cytosol.',
      'Amino groups enter at two places: in the mitochondria as carbamoyl phosphate (step 1), and in the cytosol as aspartate (step 2b).',
      'Four steps: (1) ornithine transcarbamoylase, (2) argininosuccinate synthetase, (3) argininosuccinase, (4) arginase.',
    ], slide: S + '14–16' },
  { id: 'n_c_shunt', title: 'Aspartate-argininosuccinate shunt', sub: 'Linking the urea and citric acid cycles',
    bullets: [
      'Fumarate from the urea cycle can be converted to malate and oxaloacetate in the cytosol, and used there or carried into the mitochondria for the citric acid cycle.',
      'The shunt makes aspartate by transamination between oxaloacetate and glutamate. Aspartate then donates nitrogen to the urea cycle in the argininosuccinate synthetase reaction.',
    ], slide: S + '18' },
  { id: 'n_c_gluco', title: 'Glucogenic and ketogenic', sub: 'Grouped by the end product of their carbon skeleton',
    bullets: [
      'Glucogenic amino acids are degraded to pyruvate, α-ketoglutarate, succinyl-CoA, fumarate and/or oxaloacetate, which can be converted to glucose.',
      'Ketogenic amino acids are degraded to acetoacetyl-CoA and/or acetyl-CoA, which can be converted to ketone bodies in the liver.',
      'Several amino acids appear in both groups (for example phenylalanine, tyrosine, tryptophan, isoleucine and threonine), because different parts of their skeleton end up in different places.',
    ], slide: S + '19' },

  // ── biosynthesis ──
  { id: 'n_c_biosyn', title: 'Making amino acids', sub: 'Six families, grouped by precursor',
    bullets: [
      'All amino acids are made from intermediates of glycolysis, the citric acid cycle or the pentose phosphate pathway. Nitrogen enters as glutamate and glutamine.',
      'Some pathways are simple; others (such as those for the aromatic amino acids) are not.',
      'Plants and bacteria make all 20 common amino acids; mammals make about half. The essential amino acids are the ones animals cannot make and must get from food.',
      'Essential in mammals (Table 22-1): methionine, threonine, lysine, valine, leucine, isoleucine, tryptophan, phenylalanine and histidine. Tyrosine is made from phenylalanine in mammals.',
    ], slide: S + '22, 28' },
  { id: 'n_c_derived', title: 'Molecules made from amino acids', sub: 'Porphyrins, creatine, glutathione, amines, NO',
    bullets: [
      'Glycine is a precursor of porphyrins. Breakdown of iron-porphyrin (heme) gives bilirubin, which is converted to the bile pigments.',
      'Glycine and arginine give rise to creatine and phosphocreatine, an energy buffer.',
      'Glutathione, made from three amino acids, is an important cellular reducing agent.',
      'The aromatic amino acids give rise to many plant substances. PLP-dependent decarboxylation of some amino acids yields important biological amines, including neurotransmitters.',
      'Arginine is the precursor of nitric oxide, a biological messenger.',
    ], slide: S + '26–27' },

  // ── nucleotides ──
  { id: 'n_c_nucfun', title: 'Why nucleotides', sub: 'De novo and salvage pathways',
    bullets: [
      'Nucleotides are precursors of DNA and RNA, carriers of chemical energy (ATP, GTP), components of the cofactors NAD, FAD and coenzyme A, and second messengers (cAMP, cGMP).',
      'De novo pathways start from metabolic precursors: amino acids, ribose 5-phosphate, CO₂ and NH₃.',
      'Salvage pathways recycle the free bases and nucleosides released when nucleic acids are broken down.',
    ], slide: S + '30' },
  { id: 'n_c_purring', title: 'Where the purine atoms come from', sub: 'Isotope tracer experiments in birds (John M. Buchanan)',
    bullets: [
      'N-1: aspartate.',
      'C-2 and C-8: formate (as N¹⁰-formyltetrahydrofolate).',
      'N-3 and N-9: the amide nitrogen of glutamine.',
      'C-4, C-5 and N-7: glycine.',
      'C-6: CO₂.',
    ], slide: S + '30' },
  { id: 'n_c_purine', title: 'Building the purine ring', sub: 'Eleven steps from PRPP to IMP',
    bullets: [
      'The ring is built on the ribose phosphate: step 1 attaches an amino group from glutamine to C-1 of PRPP.',
      'Steps 2–5 build and close the five-membered imidazole ring (AIR is the first intermediate with a complete ring).',
      'Steps 6–11 build the second ring: a carboxyl group from bicarbonate, an amino group from aspartate (released as fumarate) and a final carbon from N¹⁰-formyltetrahydrofolate, then ring closure.',
      'Inosinate (IMP) is the first intermediate with a complete purine ring.',
    ], slide: S + '31–32' },
  { id: 'n_c_ampgmp', title: 'IMP to AMP and GMP', sub: 'Each branch uses the other’s nucleotide',
    bullets: [
      'IMP → AMP inserts an amino group from aspartate in two reactions like steps 8 and 9 of purine synthesis, but GTP (not ATP) supplies the high-energy phosphate.',
      'IMP → GMP: NAD⁺-requiring oxidation at C-2, then an amino group from glutamine, with ATP.',
    ], slide: S + '33' },
  { id: 'n_c_pyr', title: 'Pyrimidines: ring first', sub: 'UTP and CTP via orotidylate',
    bullets: [
      'The six-membered pyrimidine ring is made first, from carbamoyl phosphate and aspartate, and then attached to ribose 5-phosphate.',
      'The ribose 5-phosphate comes from PRPP, added by orotate phosphoribosyltransferase.',
      'Orotidylate is decarboxylated to UMP, which is phosphorylated to UTP; cytidylate synthetase forms CTP from UTP.',
      'CTP, the end product, feeds back to inhibit aspartate transcarbamoylase.',
    ], slide: S + '34' },
  { id: 'n_c_dtmp', title: 'Thymidylate', sub: 'dTMP from dUMP',
    bullets: [
      'The immediate precursor of thymidylate (dTMP) is dUMP.',
      'In bacteria, dUTP is made either by deaminating dCTP or by phosphorylating dUDP; dUTPase then converts dUTP to dUMP, keeping dUTP low so uridylate is not built into DNA.',
      'Thymidylate synthase moves a one-carbon unit from N⁵,N¹⁰-methylenetetrahydrofolate to dUMP and reduces it to a methyl group, leaving dihydrofolate.',
      'Dihydrofolate reductase (NADPH) and serine hydroxymethyltransferase (serine → glycine) regenerate the methylene-tetrahydrofolate.',
    ], slide: S + '35' },
  { id: 'n_c_salvage', title: 'Salvage pathways', sub: 'Reusing free bases',
    bullets: [
      'Free purine and pyrimidine bases are released all the time as nucleotides are broken down.',
      'Free purines are largely salvaged and reused, by a pathway much simpler than de novo synthesis: one reaction with PRPP.',
      'Adenine phosphoribosyltransferase: adenine + PRPP → AMP + PPi. Hypoxanthine-guanine phosphoribosyltransferase does the same for hypoxanthine and guanine.',
      'A similar salvage pathway exists for pyrimidine bases in microorganisms, and possibly in mammals.',
    ], slide: S + '36' },
  { id: 'n_c_purcat', title: 'Purine breakdown and who excretes what', sub: 'Uric acid onward',
    bullets: [
      'Purine nucleotides first lose their phosphate (5′-nucleotidase). AMP → adenosine → inosine → hypoxanthine → xanthine → uric acid; GMP → guanosine → guanine → xanthine.',
      'Uric acid is excreted by primates, birds, reptiles and insects.',
      'Other animals go further: allantoin (most mammals), allantoate (bony fishes), urea (amphibians, cartilaginous fishes) or NH₄⁺ (marine invertebrates).',
    ], slide: S + '37' },
  { id: 'n_c_pyrcat', title: 'Pyrimidine breakdown', sub: 'Leads to NH₄⁺ and urea',
    bullets: [
      'The degradation of pyrimidines generally releases NH₄⁺, and so leads to urea synthesis.',
      'Thymine is degraded to methylmalonyl-semialdehyde (an intermediate of valine catabolism), and on through propionyl-CoA and methylmalonyl-CoA to succinyl-CoA.',
      'Cytosine loses its amino group (as NH₃) to become uracil; uracil is degraded to acetyl-CoA.',
    ], slide: S + '38' },
];
