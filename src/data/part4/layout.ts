import type { MapNode } from '../types';
import { combine, place, type PlateDef } from '../plate.ts';

/**
 * Part IV (metabolism of N-containing compounds) plates 20–35, to the right of Part III: amino acid breakdown and
 * nitrogen disposal, amino acid synthesis and derived molecules, then nucleotides.
 */

// ───────── Plate 20 · digesting protein (slides 4–6) ─────────
const p20: PlateDef = {
  id: 'r_n20', plate: 20, part: 'IV', title: 'Digesting protein', sub: 'stomach → small intestine → liver', w: 1000, h: 1320,
  nodes: [
    { id: 'nd_prot', x: 300, y: 160, kind: 'proc', label: 'Dietary protein' },
    { id: 'nd_pep', x: 300, y: 400, kind: 'proc', label: 'Peptides' },
    { id: 'nd_pep2', x: 300, y: 640, kind: 'proc', label: 'Shorter peptides' },
    { id: 'nd_aa', x: 300, y: 880, mol: 'aa', label: 'Free amino acids' },
    { id: 'nd_liver', x: 300, y: 1120, kind: 'proc', label: 'Blood capillaries → liver' },
    { id: 'nz_pgn', x: 760, y: 200, kind: 'small', label: 'Pepsinogen' },
    { id: 'nz_pep', x: 760, y: 390, kind: 'small', label: 'Pepsin' },
    { id: 'nz_tgn', x: 760, y: 560, kind: 'small', label: 'Trypsinogen' },
    { id: 'nz_try', x: 760, y: 790, kind: 'small', label: 'Trypsin' },
    { id: 'nz_zym', x: 760, y: 960, kind: 'small', label: 'Chymotrypsinogen · procarboxypeptidases · proelastase' },
    { id: 'nz_act', x: 760, y: 1150, kind: 'small', label: 'Chymotrypsin · carboxypeptidases · elastase' },
    { id: 'n_c_digest', x: 150, y: 1250, kind: 'card', card: 'n_c_digest', label: 'Hormones, acid & zymogens' },
    { id: 'nd_x1', x: 470, y: 1196, kind: 'xref', link: 'nd_liver', target: 'nt_aa', label: 'amino groups removed in the liver' },
  ],
  edges: [
    { id: 'e_nd1', from: 'nd_prot', to: 'nd_pep', enz: 'n_pepsin', tags: 'stomach, pH 1.0–2.5', tagPos: 'r', plainTag: true },
    { id: 'e_nd2', from: 'nd_pep', to: 'nd_pep2', enz: 'n_trypsin', via: [[215, 480], [215, 560]] },
    { id: 'e_nd3', from: 'nd_pep', to: 'nd_pep2', enz: 'n_chymo', via: [[395, 480], [395, 560]] },
    { id: 'e_nd4', from: 'nd_pep2', to: 'nd_aa', enz: 'n_cpab', via: [[205, 720], [205, 800]] },
    { id: 'e_nd5', from: 'nd_pep2', to: 'nd_aa', enz: 'n_amnp', via: [[405, 720], [405, 800]] },
    { id: 'e_nd6', from: 'nd_aa', to: 'nd_liver', style: 'plain', tags: 'into intestinal epithelial cells, then the blood', tagPos: 'r', plainTag: true },
    { id: 'e_nz1', from: 'nz_pgn', to: 'nz_pep', enz: 'n_pepsin', tags: 'autocatalytic, only at low pH', tagPos: 'r', plainTag: true },
    { id: 'e_nz2', from: 'nz_tgn', to: 'nz_try', enz: 'n_entero', via: [[680, 640], [680, 710]] },
    { id: 'e_nz3', from: 'nz_tgn', to: 'nz_try', enz: 'n_trypsin', via: [[850, 640], [850, 710]] },
    { id: 'e_nz4', from: 'nz_zym', to: 'nz_act', enz: 'n_trypsin' },
  ],
  labels: [
    { x: 40, y: 250, kind: 'phase', text: 'Stomach' },
    { x: 40, y: 520, kind: 'phase', text: 'Small intestine' },
    { x: 760, y: 120, kind: 'phase', text: 'Zymogen activation', anchor: 'middle' },
  ],
};

// ───────── Plate 21 · removing the amino group (slides 7–11) ─────────
const p21: PlateDef = {
  id: 'r_n21', plate: 21, part: 'IV', title: 'Removing the amino group', sub: 'transamination · deamination', w: 1000, h: 1120,
  nodes: [
    { id: 'nt_aa', x: 250, y: 190, mol: 'aa' },
    { id: 'nt_ak', x: 250, y: 470, mol: 'aketo' },
    { id: 'nt_glu', x: 640, y: 470, mol: 'glu', label: 'L-Glutamate' },
    { id: 'nt_akg', x: 640, y: 790, mol: 'akg' },
    { id: 'nt_nh4', x: 330, y: 790, mol: 'nh4', label: 'NH₄⁺' },
    { id: 'n_c_circum', x: 840, y: 150, kind: 'card', card: 'n_c_circum', label: 'Three circumstances' },
    { id: 'n_c_overview', x: 840, y: 210, kind: 'card', card: 'n_c_overview', label: 'Overview' },
    { id: 'n_c_collect', x: 840, y: 270, kind: 'card', card: 'n_c_collect', label: 'Collection points' },
    { id: 'n_c_excrete', x: 330, y: 1040, kind: 'card', card: 'n_c_excrete', label: 'Ammonia, urea or uric acid' },
    { id: 'nt_x0', x: 480, y: 186, kind: 'xref', link: 'nt_aa', target: 'nd_aa', label: 'from digested protein' },
    { id: 'nt_x1', x: 250, y: 556, kind: 'xref', link: 'nt_ak', target: 'ns_cit', label: 'fate of the carbon skeletons' },
    { id: 'nt_x2', x: 330, y: 876, kind: 'xref', link: 'nt_nh4', target: 'nu_nh4', label: 'into the urea cycle' },
    { id: 'nt_x3', x: 640, y: 876, kind: 'xref', link: 'nt_akg', target: 'akg', label: 'citric acid cycle' },
  ],
  edges: [
    { id: 'e_nt1', from: 'nt_aa', to: 'nt_ak', enz: 'n_at', dir: 'both', tags: '+ α-Ketoglutarate', tagPos: 'l', out: 'nt_glu', co: ['PLP'] },
    { id: 'e_nt2', from: 'nt_glu', to: 'nt_akg', enz: 'n_gdh', dir: 'both', tags: 'NAD(P)⁺ → NAD(P)H', tagPos: 'r', out: 'nt_nh4', co: ['NADH', 'NADPH'] },
  ],
  labels: [
    { x: 40, y: 110, kind: 'phase', text: 'Cytosol', sub: ['hepatocyte'] },
    { x: 470, y: 380, kind: 'phase', text: 'Liver mitochondria' },
  ],
};

// ───────── Plate 22 · ammonia to the liver (slides 12–13, 20) ─────────
const p22: PlateDef = {
  id: 'r_n22', plate: 22, part: 'IV', title: 'Ammonia to the liver', sub: 'glutamine · glucose-alanine cycle', w: 1240, h: 1380,
  nodes: [
    { id: 'ng_glu', x: 220, y: 180, mol: 'glu', label: 'Glutamate' },
    { id: 'ng_ggp', x: 220, y: 410, mol: 'ggp' },
    { id: 'ng_gln', x: 220, y: 640, mol: 'gln' },
    { id: 'ng_gln2', x: 220, y: 900, mol: 'gln', label: 'Glutamine (liver mitochondria)' },
    { id: 'ng_glu2', x: 220, y: 1150, mol: 'glu', label: 'Glutamate' },
    { id: 'ng_mglc', x: 760, y: 220, mol: 'glc' },
    { id: 'ng_mpyr', x: 1070, y: 220, mol: 'pyr' },
    { id: 'ng_mala', x: 1070, y: 470, mol: 'ala' },
    { id: 'ng_lala', x: 1070, y: 760, mol: 'ala' },
    { id: 'ng_lpyr', x: 1070, y: 1010, mol: 'pyr' },
    { id: 'ng_lglc', x: 760, y: 1010, mol: 'glc' },
    { id: 'n_c_glnt', x: 220, y: 1320, kind: 'card', card: 'n_c_glnt', label: 'Glutamine carries ammonia' },
    { id: 'n_c_gac', x: 900, y: 1320, kind: 'card', card: 'n_c_gac', label: 'Glucose-alanine cycle' },
    { id: 'ng_x1', x: 220, y: 1236, kind: 'xref', link: 'ng_glu2', target: 'nu_nh4', label: 'NH₄⁺ → urea cycle' },
    { id: 'ng_x2', x: 1070, y: 1096, kind: 'xref', link: 'ng_lpyr', target: 'nu_glu', label: 'glutamate → urea cycle' },
    { id: 'ng_x3', x: 1070, y: 134, kind: 'xref', link: 'ng_mpyr', target: 'pyr', label: 'glycolysis' },
  ],
  edges: [
    { id: 'e_ng1', from: 'ng_glu', to: 'ng_ggp', enz: 'n_gs', tags: 'ATP → ADP', tagPos: 'l', co: ['ATP'] },
    { id: 'e_ng2', from: 'ng_ggp', to: 'ng_gln', enz: 'n_gs', tags: 'NH₄⁺ → Pi', tagPos: 'l', co: ['Pi'] },
    { id: 'e_ng3', from: 'ng_gln', to: 'ng_gln2', style: 'plain', tags: 'in the bloodstream', tagPos: 'r', plainTag: true },
    { id: 'e_ng4', from: 'ng_gln2', to: 'ng_glu2', enz: 'n_glnase', tags: 'H₂O → NH₄⁺', tagPos: 'r' },
    { id: 'e_ng5', from: 'ng_mglc', to: 'ng_mpyr', style: 'plain', tags: 'glycolysis', tagPos: 'above', plainTag: true },
    { id: 'e_ng6', from: 'ng_mpyr', to: 'ng_mala', enz: 'n_alt', dir: 'both', tags: 'Glutamate → α-Ketoglutarate', tagPos: 'l' },
    { id: 'e_ng7', from: 'ng_mala', to: 'ng_lala', style: 'plain', tags: 'blood alanine', tagPos: 'r', plainTag: true },
    { id: 'e_ng8', from: 'ng_lala', to: 'ng_lpyr', enz: 'n_alt', dir: 'both', tags: 'α-Ketoglutarate → Glutamate', tagPos: 'l' },
    { id: 'e_ng9', from: 'ng_lpyr', to: 'ng_lglc', style: 'plain', tags: 'gluconeogenesis', tagPos: 'below', plainTag: true },
    { id: 'e_ng10', from: 'ng_lglc', to: 'ng_mglc', style: 'plain', tags: 'blood glucose', tagPos: 'l', plainTag: true },
  ],
  labels: [
    { x: 40, y: 110, kind: 'phase', text: 'Extrahepatic tissues' },
    { x: 40, y: 800, kind: 'phase', text: 'Liver' },
    { x: 620, y: 140, kind: 'phase', text: 'Muscle' },
    { x: 620, y: 880, kind: 'phase', text: 'Liver' },
  ],
};

// ───────── Plate 23 · the urea cycle (slides 14–18) ─────────
const p23: PlateDef = {
  id: 'r_n23', plate: 23, part: 'IV', title: 'Urea cycle', sub: 'liver: mitochondria and cytosol', w: 1250, h: 1800,
  nodes: [
    // matrix
    { id: 'nu_gln', x: 210, y: 180, mol: 'gln' },
    { id: 'nu_glu', x: 560, y: 180, mol: 'glu', label: 'Glutamate' },
    { id: 'nu_oaa', x: 1010, y: 180, mol: 'oaa' },
    { id: 'nu_nh4', x: 300, y: 410, mol: 'nh4', label: 'NH₄⁺' },
    { id: 'nu_akg', x: 640, y: 410, mol: 'akg' },
    { id: 'nu_asp_m', x: 1010, y: 410, mol: 'asp' },
    { id: 'nu_cp', x: 300, y: 600, mol: 'carbp' },
    { id: 'nu_orn_m', x: 150, y: 730, mol: 'orn' },
    { id: 'nu_cit_m', x: 700, y: 730, mol: 'citr' },
    // cytosol
    { id: 'nu_cit_c', x: 1000, y: 960, mol: 'citr' },
    { id: 'nu_camp', x: 1000, y: 1190, mol: 'citamp' },
    { id: 'nu_asp_c', x: 1190, y: 1330, mol: 'asp' },
    { id: 'nu_asuc', x: 790, y: 1430, mol: 'asuc' },
    { id: 'nu_arg', x: 380, y: 1430, mol: 'arg' },
    { id: 'nu_orn_c', x: 150, y: 1190, mol: 'orn' },
    { id: 'nu_urea', x: 90, y: 1430, mol: 'urea' },
    { id: 'nu_fum', x: 580, y: 1620, mol: 'fum' },
    { id: 'nu_mal', x: 850, y: 1620, mol: 'mal', label: 'Malate' },
    { id: 'nu_oaa_c', x: 1110, y: 1620, mol: 'oaa' },
    { id: 'n_c_urea', x: 200, y: 1740, kind: 'card', card: 'n_c_urea', label: 'The urea cycle' },
    { id: 'n_c_shunt', x: 480, y: 1740, kind: 'card', card: 'n_c_shunt', label: 'Aspartate-argininosuccinate shunt' },
    { id: 'nu_x1', x: 850, y: 1706, kind: 'xref', link: 'nu_mal', target: 'mal', label: 'or into the citric acid cycle' },
    { id: 'nu_x2', x: 640, y: 496, kind: 'xref', link: 'nu_akg', target: 'akg', label: 'citric acid cycle' },
  ],
  edges: [
    { id: 'e_nu1', from: 'nu_gln', to: 'nu_glu', enz: 'n_glnase', out: 'nu_nh4' },
    { id: 'e_nu2', from: 'nu_glu', to: 'nu_akg', enz: 'n_gdh', dir: 'both', out: 'nu_nh4', co: ['NADH', 'NADPH'] },
    { id: 'e_nu3', from: 'nu_oaa', to: 'nu_asp_m', enz: 'aat', tags: 'Glutamate → α-Ketoglutarate', tagPos: 'l' },
    { id: 'e_nu4', from: 'nu_nh4', to: 'nu_cp', enz: 'n_cps1', tags: 'HCO₃⁻ + 2 ATP → 2 ADP + Pi', tagPos: 'l', co: ['ATP', 'Pi'] },
    { id: 'e_nu5', from: 'nu_orn_m', to: 'nu_cit_m', enz: 'n_otc', feed: 'nu_cp', tags: '− Pi', tagPos: 'below', co: ['Pi'] },
    { id: 'e_nu6', from: 'nu_cit_m', to: 'nu_cit_c', style: 'plain' },
    { id: 'e_nu7', from: 'nu_cit_c', to: 'nu_camp', enz: 'n_ass', tags: 'ATP → PPi', tagPos: 'l', co: ['ATP'] },
    { id: 'e_nu8', from: 'nu_camp', to: 'nu_asuc', enz: 'n_ass', feed: 'nu_asp_c', tags: '− AMP', tagPos: 'l' },
    { id: 'e_nu9', from: 'nu_asuc', to: 'nu_arg', enz: 'n_asl', out: 'nu_fum' },
    { id: 'e_nu10', from: 'nu_arg', to: 'nu_orn_c', enz: 'n_arginase', tags: '+ H₂O', tagPos: 'r', out: 'nu_urea' },
    { id: 'e_nu11', from: 'nu_orn_c', to: 'nu_orn_m', style: 'plain' },
    { id: 'e_nu12', from: 'nu_asp_m', to: 'nu_asp_c', style: 'plain', via: [[1190, 410]], tags: 'to the cytosol', tagPos: 'l', plainTag: true },
    { id: 'e_nu13', from: 'nu_fum', to: 'nu_mal', style: 'plain' },
    { id: 'e_nu14', from: 'nu_mal', to: 'nu_oaa_c', style: 'plain', tags: 'NAD⁺ → NADH', tagPos: 'above', co: ['NADH'] },
    { id: 'e_nu15', from: 'nu_oaa_c', to: 'nu_asp_c', enz: 'aat', tags: 'Glutamate → α-Ketoglutarate', tagPos: 'l' },
  ],
  bands: [{ id: 'b_nu', x: 20, y: 810, w: 1210, h: 60 }],
  captions: [
    { x: 40, y: 110, text: 'MITOCHONDRIAL MATRIX' },
    { x: 1230, y: 845, text: 'INNER MEMBRANE', anchor: 'end' },
    { x: 40, y: 910, text: 'CYTOSOL' },
  ],
  labels: [
    { x: 560, y: 1070, kind: 'phase', text: 'Urea cycle', anchor: 'middle', sub: ['steps 2–4 in the cytosol'] },
  ],
};

// ───────── Plate 24 · fates of the carbon skeletons (slide 19) ─────────
const p24: PlateDef = {
  id: 'r_n24', plate: 24, part: 'IV', title: 'Fates of the carbon skeletons', sub: 'glucogenic · ketogenic', w: 1260, h: 1300,
  nodes: [
    // citric acid cycle, drawn as on the slide
    { id: 'ns_cit', x: 540, y: 560, mol: 'cit' },
    { id: 'ns_icit', x: 580, y: 360, mol: 'icit' },
    { id: 'ns_akg', x: 910, y: 330, mol: 'akg' },
    { id: 'ns_succoa', x: 1000, y: 540, mol: 'succoa' },
    { id: 'ns_suc', x: 1000, y: 720, mol: 'suc' },
    { id: 'ns_fum', x: 910, y: 880, mol: 'fum' },
    { id: 'ns_mal', x: 720, y: 960, mol: 'mal', label: 'Malate' },
    { id: 'ns_oaa', x: 530, y: 820, mol: 'oaa' },
    // hubs
    { id: 'ns_kb', x: 420, y: 160, kind: 'small', label: 'Ketone bodies' },
    { id: 'ns_acac', x: 200, y: 330, mol: 'acacoa' },
    { id: 'ns_accoa', x: 270, y: 560, mol: 'accoa' },
    { id: 'ns_pyr', x: 300, y: 1010, mol: 'pyr' },
    { id: 'ns_glu', x: 910, y: 160, mol: 'glu', label: 'Glutamate' },
    { id: 'ns_glc', x: 760, y: 1180, kind: 'small', label: 'Glucose' },
    // amino acid groups (slide 19 colours: glucogenic / ketogenic)
    { id: 'ns_k1', x: 200, y: 160, kind: 'proc', label: 'Leu · Lys · Phe · Trp · Tyr', badge: 'ketogenic' },
    { id: 'ns_k2', x: 110, y: 760, kind: 'proc', label: 'Ile · Leu · Thr · Trp', badge: 'ketogenic' },
    { id: 'ns_g1', x: 300, y: 1180, kind: 'proc', label: 'Ala · Cys · Gly · Ser · Thr · Trp', badge: 'glucogenic' },
    { id: 'ns_g2', x: 1110, y: 160, kind: 'proc', label: 'Arg · Gln · His · Pro', badge: 'glucogenic' },
    { id: 'ns_g3', x: 1140, y: 430, kind: 'proc', label: 'Ile · Met · Thr · Val', badge: 'glucogenic' },
    { id: 'ns_g4', x: 1110, y: 880, kind: 'proc', label: 'Phe · Tyr', badge: 'glucogenic' },
    { id: 'ns_g5', x: 560, y: 1060, kind: 'proc', label: 'Asn · Asp', badge: 'glucogenic' },
    { id: 'n_c_gluco', x: 1100, y: 1180, kind: 'card', card: 'n_c_gluco', label: 'Glucogenic or ketogenic?' },
    { id: 'ns_x1', x: 420, y: 90, kind: 'xref', link: 'ns_kb', target: 'lk_kb', label: 'ketone bodies' },
  ],
  edges: [
    { id: 'e_ns1', from: 'ns_cit', to: 'ns_icit', style: 'plain' },
    { id: 'e_ns2', from: 'ns_icit', to: 'ns_akg', style: 'plain' },
    { id: 'e_ns3', from: 'ns_akg', to: 'ns_succoa', style: 'plain' },
    { id: 'e_ns4', from: 'ns_succoa', to: 'ns_suc', style: 'plain' },
    { id: 'e_ns5', from: 'ns_suc', to: 'ns_fum', style: 'plain' },
    { id: 'e_ns6', from: 'ns_fum', to: 'ns_mal', style: 'plain' },
    { id: 'e_ns7', from: 'ns_mal', to: 'ns_oaa', style: 'plain' },
    { id: 'e_ns8', from: 'ns_oaa', to: 'ns_cit', style: 'plain' },
    { id: 'e_ns9', from: 'ns_accoa', to: 'ns_cit', style: 'plain' },
    { id: 'e_ns10', from: 'ns_acac', to: 'ns_accoa', style: 'plain' },
    { id: 'e_ns11', from: 'ns_acac', to: 'ns_kb', style: 'plain' },
    { id: 'e_ns12', from: 'ns_accoa', to: 'ns_kb', style: 'plain' },
    { id: 'e_ns13', from: 'ns_pyr', to: 'ns_accoa', style: 'plain' },
    { id: 'e_ns14', from: 'ns_pyr', to: 'ns_oaa', style: 'plain', tags: '+ CO₂', tagPos: 'r', plainTag: true },
    { id: 'e_ns15', from: 'ns_oaa', to: 'ns_glc', style: 'plain', tags: 'gluconeogenesis', tagPos: 'r', plainTag: true },
    { id: 'e_ns16', from: 'ns_glu', to: 'ns_akg', style: 'plain' },
    { id: 'e_ns17', from: 'ns_k1', to: 'ns_acac', style: 'plain' },
    { id: 'e_ns18', from: 'ns_k2', to: 'ns_accoa', style: 'plain' },
    { id: 'e_ns19', from: 'ns_g1', to: 'ns_pyr', style: 'plain' },
    { id: 'e_ns20', from: 'ns_g2', to: 'ns_glu', style: 'plain' },
    { id: 'e_ns21', from: 'ns_g3', to: 'ns_succoa', style: 'plain' },
    { id: 'e_ns22', from: 'ns_g4', to: 'ns_fum', style: 'plain' },
    { id: 'e_ns23', from: 'ns_g5', to: 'ns_oaa', style: 'plain' },
  ],
  labels: [{ x: 770, y: 650, kind: 'phase', text: 'Citric acid cycle', anchor: 'middle' }],
};

// ───────── Plate 25 · amino acid biosynthesis, by family (slides 22, 28) ─────────
const p25: PlateDef = {
  id: 'r_n25', plate: 25, part: 'IV', title: 'Making amino acids', sub: 'six families, by precursor', w: 1300, h: 1160,
  nodes: [
    { id: 'nb_akg', x: 220, y: 170, mol: 'akg' },
    { id: 'nb_glu', x: 220, y: 350, mol: 'glu', label: 'Glutamate' },
    { id: 'nb_gln', x: 90, y: 530, mol: 'gln' },
    { id: 'nb_pro', x: 220, y: 530, mol: 'pro' },
    { id: 'nb_arg', x: 350, y: 530, mol: 'arg' },
    { id: 'nb_pg3', x: 650, y: 170, mol: 'pg3' },
    { id: 'nb_ser', x: 650, y: 350, mol: 'ser' },
    { id: 'nb_gly', x: 560, y: 530, mol: 'gly' },
    { id: 'nb_cys', x: 740, y: 530, mol: 'cys' },
    { id: 'nb_oaa', x: 1070, y: 170, mol: 'oaa' },
    { id: 'nb_asp', x: 1070, y: 350, mol: 'asp' },
    { id: 'nb_asn', x: 880, y: 530, mol: 'asn' },
    { id: 'nb_met', x: 1005, y: 530, mol: 'met', label: 'Methionine*' },
    { id: 'nb_lys', x: 1120, y: 530, mol: 'lys', label: 'Lysine*' },
    { id: 'nb_thr', x: 1230, y: 530, mol: 'thr', label: 'Threonine*' },
    { id: 'nb_r5p', x: 130, y: 740, mol: 'r5p' },
    { id: 'nb_his', x: 130, y: 920, mol: 'his', label: 'Histidine*' },
    { id: 'nb_pe', x: 480, y: 740, mols: ['pep', 'e4p'], label: 'Phosphoenolpyruvate + erythrose 4-phosphate' },
    { id: 'nb_phe', x: 340, y: 920, mol: 'phe', label: 'Phenylalanine*' },
    { id: 'nb_tyr', x: 480, y: 920, mol: 'tyr' },
    { id: 'nb_trp', x: 620, y: 920, mol: 'trp', label: 'Tryptophan*' },
    { id: 'nb_tyr2', x: 340, y: 1080, mol: 'tyr', label: 'Tyrosine†' },
    { id: 'nb_pyr', x: 960, y: 740, mol: 'pyr' },
    { id: 'nb_ala', x: 790, y: 920, mol: 'ala' },
    { id: 'nb_val', x: 910, y: 920, mol: 'val', label: 'Valine*' },
    { id: 'nb_leu', x: 1030, y: 920, mol: 'leu', label: 'Leucine*' },
    { id: 'nb_ile', x: 1170, y: 920, mol: 'ile', label: 'Isoleucine*' },
    { id: 'n_c_biosyn', x: 1100, y: 1080, kind: 'card', card: 'n_c_biosyn', label: 'Essential amino acids' },
    { id: 'nb_x1', x: 380, y: 166, kind: 'xref', link: 'nb_akg', target: 'akg', label: 'citric acid cycle' },
    { id: 'nb_x2', x: 810, y: 166, kind: 'xref', link: 'nb_pg3', target: 'pg3', label: 'glycolysis' },
    { id: 'nb_x3', x: 1110, y: 736, kind: 'xref', link: 'nb_pyr', target: 'pyr', label: 'glycolysis' },
    { id: 'nb_x4', x: 130, y: 650, kind: 'xref', link: 'nb_r5p', target: 'r5p', label: 'pentose phosphate pathway' },
    { id: 'nb_x5', x: 800, y: 346, kind: 'xref', link: 'nb_ser', target: 'nsg_ser', label: 'serine & glycine' },
    { id: 'nb_x6', x: 740, y: 616, kind: 'xref', link: 'nb_cys', target: 'nc_cys', label: 'cysteine' },
  ],
  edges: [
    { id: 'e_nb1', from: 'nb_akg', to: 'nb_glu', style: 'plain' },
    { id: 'e_nb2', from: 'nb_glu', to: 'nb_gln', style: 'plain' },
    { id: 'e_nb3', from: 'nb_glu', to: 'nb_pro', style: 'plain' },
    { id: 'e_nb4', from: 'nb_glu', to: 'nb_arg', style: 'plain' },
    { id: 'e_nb5', from: 'nb_pg3', to: 'nb_ser', style: 'plain' },
    { id: 'e_nb6', from: 'nb_ser', to: 'nb_gly', style: 'plain' },
    { id: 'e_nb7', from: 'nb_ser', to: 'nb_cys', style: 'plain' },
    { id: 'e_nb8', from: 'nb_oaa', to: 'nb_asp', style: 'plain' },
    { id: 'e_nb9', from: 'nb_asp', to: 'nb_asn', style: 'plain' },
    { id: 'e_nb10', from: 'nb_asp', to: 'nb_met', style: 'plain' },
    { id: 'e_nb11', from: 'nb_asp', to: 'nb_lys', style: 'plain' },
    { id: 'e_nb12', from: 'nb_asp', to: 'nb_thr', style: 'plain' },
    { id: 'e_nb13', from: 'nb_thr', to: 'nb_ile', style: 'plain' },
    { id: 'e_nb14', from: 'nb_r5p', to: 'nb_his', style: 'plain' },
    { id: 'e_nb15', from: 'nb_pe', to: 'nb_phe', style: 'plain' },
    { id: 'e_nb16', from: 'nb_pe', to: 'nb_tyr', style: 'plain' },
    { id: 'e_nb17', from: 'nb_pe', to: 'nb_trp', style: 'plain' },
    { id: 'e_nb18', from: 'nb_phe', to: 'nb_tyr2', style: 'plain', tags: 'in mammals', tagPos: 'r', plainTag: true },
    { id: 'e_nb19', from: 'nb_pyr', to: 'nb_ala', style: 'plain' },
    { id: 'e_nb20', from: 'nb_pyr', to: 'nb_val', style: 'plain' },
    { id: 'e_nb21', from: 'nb_pyr', to: 'nb_leu', style: 'plain' },
    { id: 'e_nb22', from: 'nb_pyr', to: 'nb_ile', style: 'plain' },
  ],
  captions: [
    { x: 40, y: 1140, text: '* ESSENTIAL IN MAMMALS   † MADE FROM PHENYLALANINE IN MAMMALS' },
  ],
};

// ───────── Plate 26 · serine and glycine (slide 23) ─────────
const p26: PlateDef = {
  id: 'r_n26', plate: 26, part: 'IV', title: 'Serine & glycine', sub: 'from 3-phosphoglycerate', w: 900, h: 1330,
  nodes: [
    { id: 'nsg_pg3', x: 260, y: 160, mol: 'pg3' },
    { id: 'nsg_php', x: 260, y: 390, mol: 'phpyr' },
    { id: 'nsg_pser', x: 260, y: 620, mol: 'pser' },
    { id: 'nsg_ser', x: 260, y: 850, mol: 'ser' },
    { id: 'nsg_gly', x: 260, y: 1100, mol: 'gly' },
    { id: 'nsg_co2', x: 720, y: 1100, kind: 'small', label: 'CO₂ + NH₄⁺' },
    { id: 'nsg_x1', x: 500, y: 156, kind: 'xref', link: 'nsg_pg3', target: 'pg3', label: 'from glycolysis' },
    { id: 'nsg_x2', x: 580, y: 846, kind: 'xref', link: 'nsg_ser', target: 'nc_ser', label: '→ cysteine' },
    { id: 'nsg_x3', x: 260, y: 1190, kind: 'xref', link: 'nsg_gly', target: 'nh_gly', label: '→ porphyrins, creatine, glutathione' },
    { id: 'nsg_x4', x: 260, y: 1236, kind: 'xref', target: 'np_gar', label: '→ purine ring (C-4, C-5, N-7)' },
  ],
  edges: [
    { id: 'e_nsg1', from: 'nsg_pg3', to: 'nsg_php', enz: 'n_phgdh', tags: 'NAD⁺ → NADH + H⁺', tagPos: 'r', co: ['NADH'] },
    { id: 'e_nsg2', from: 'nsg_php', to: 'nsg_pser', enz: 'n_psat', tags: 'Glutamate → α-Ketoglutarate', tagPos: 'r' },
    { id: 'e_nsg3', from: 'nsg_pser', to: 'nsg_ser', enz: 'n_psp', tags: 'H₂O → Pi', tagPos: 'r', co: ['Pi'] },
    { id: 'e_nsg4', from: 'nsg_ser', to: 'nsg_gly', enz: 'n_shmt', tags: 'H₄ folate → N⁵,N¹⁰-methylene-H₄ folate + H₂O', tagPos: 'r', co: ['PLP', 'THF'] },
    { id: 'e_nsg5', from: 'nsg_co2', to: 'nsg_gly', enz: 'n_glysyn', tags: 'N⁵,N¹⁰-methylene-H₄ folate → H₄ folate', tagPos: 'below', co: ['THF', 'NADH', 'CO2'] },
  ],
};

// ───────── Plate 27 · cysteine (slides 24–25) ─────────
const p27: PlateDef = {
  id: 'r_n27', plate: 27, part: 'IV', title: 'Cysteine', sub: 'bacteria & plants · mammals', w: 1250, h: 1300,
  nodes: [
    { id: 'nc_ser', x: 230, y: 180, mol: 'ser' },
    { id: 'nc_oas', x: 230, y: 470, mol: 'oas' },
    { id: 'nc_cys', x: 230, y: 780, mol: 'cys' },
    { id: 'nc_so4', x: 640, y: 180, mol: 'so4' },
    { id: 'nc_aps', x: 640, y: 400, mol: 'aps' },
    { id: 'nc_paps', x: 640, y: 620, mol: 'paps' },
    { id: 'nc_so3', x: 640, y: 840, mol: 'so3' },
    { id: 'nc_s2', x: 640, y: 1060, mol: 's2' },
    { id: 'nc_met', x: 1050, y: 180, mol: 'met' },
    { id: 'nc_hcy', x: 1050, y: 430, mol: 'hcy' },
    { id: 'nc_ser2', x: 1190, y: 300, mol: 'ser' },
    { id: 'nc_cysta', x: 1050, y: 720, mol: 'cysta' },
    { id: 'nc_cys2', x: 1050, y: 1000, mol: 'cys' },
    { id: 'nc_akb', x: 850, y: 1000, mol: 'akb' },
    { id: 'nc_x1', x: 230, y: 94, kind: 'xref', link: 'nc_ser', target: 'nsg_ser', label: 'from 3-phosphoglycerate' },
  ],
  edges: [
    { id: 'e_nc1', from: 'nc_ser', to: 'nc_oas', enz: 'n_sat', tags: 'Acetyl-CoA → CoA-SH', tagPos: 'r', co: ['CoA'] },
    { id: 'e_nc2', from: 'nc_oas', to: 'nc_cys', enz: 'n_oasl', feed: 'nc_s2', tags: '− acetate', tagPos: 'l' },
    { id: 'e_nc3', from: 'nc_so4', to: 'nc_aps', enz: 'n_atps', tags: 'ATP + H⁺ → PPi', tagPos: 'r', co: ['ATP'] },
    { id: 'e_nc4', from: 'nc_aps', to: 'nc_paps', enz: 'n_apsk', tags: 'ATP → ADP', tagPos: 'r', co: ['ATP'] },
    { id: 'e_nc5', from: 'nc_paps', to: 'nc_so3', enz: 'n_papsr', tags: 'NADPH → NADP⁺ + PAP', tagPos: 'r', co: ['NADPH'] },
    { id: 'e_nc6', from: 'nc_so3', to: 'nc_s2', enz: 'n_sir', tags: '3 NADPH → 3 NADP⁺', tagPos: 'r', co: ['NADPH'] },
    { id: 'e_nc7', from: 'nc_met', to: 'nc_hcy', style: 'plain', tags: 'several steps', tagPos: 'r', plainTag: true },
    { id: 'e_nc8', from: 'nc_hcy', to: 'nc_cysta', enz: 'n_cbs', feed: 'nc_ser2', tags: '− H₂O', tagPos: 'l', co: ['PLP'] },
    { id: 'e_nc9', from: 'nc_cysta', to: 'nc_cys2', enz: 'n_cgl', tags: 'H₂O → NH₄⁺', tagPos: 'r', out: 'nc_akb', co: ['PLP'] },
  ],
  labels: [
    { x: 40, y: 1180, kind: 'phase', text: 'Bacteria and plants', sub: ['sulfur from environmental sulfate'] },
    { x: 860, y: 1180, kind: 'phase', text: 'Mammals', sub: ['sulfur from methionine'] },
  ],
};

// ───────── Plate 28 · heme, glutathione and creatine (slide 26) ─────────
const p28: PlateDef = {
  id: 'r_n28', plate: 28, part: 'IV', title: 'Heme, glutathione & creatine', sub: 'molecules made from amino acids', w: 1250, h: 1300,
  nodes: [
    { id: 'nh_gly', x: 240, y: 170, mol: 'gly' },
    { id: 'nh_heme', x: 240, y: 410, mol: 'heme' },
    { id: 'nh_bv', x: 240, y: 670, mol: 'biliverdin' },
    { id: 'nh_br', x: 240, y: 930, mol: 'bilirubin' },
    { id: 'nh_bile', x: 240, y: 1160, kind: 'proc', label: 'Bile pigments' },
    { id: 'nh_gc', x: 690, y: 170, mols: ['glu', 'cys'], label: 'Glutamate + cysteine' },
    { id: 'nh_ggc', x: 690, y: 430, mol: 'ggc' },
    { id: 'nh_gsh', x: 690, y: 710, mol: 'gsh' },
    { id: 'nh_gly2', x: 880, y: 570, mol: 'gly' },
    { id: 'nh_ga', x: 1080, y: 170, mols: ['gly', 'arg'], label: 'Glycine + arginine' },
    { id: 'nh_cre', x: 1080, y: 430, mol: 'creatine' },
    { id: 'nh_pcr', x: 1080, y: 690, mol: 'pcr', badge: 'energy buffer' },
    { id: 'n_c_derived', x: 1060, y: 940, kind: 'card', card: 'n_c_derived', label: 'Made from amino acids' },
    { id: 'nh_x1', x: 420, y: 166, kind: 'xref', link: 'nh_gly', target: 'nsg_gly', label: 'from serine' },
  ],
  edges: [
    { id: 'e_nh1', from: 'nh_gly', to: 'nh_heme', style: 'plain', tags: 'precursor of porphyrins', tagPos: 'r', plainTag: true },
    { id: 'e_nh2', from: 'nh_heme', to: 'nh_bv', enz: 'n_ho', tags: 'NADPH + O₂ → CO + Fe³⁺ + NADP⁺', tagPos: 'r', co: ['NADPH'] },
    { id: 'e_nh3', from: 'nh_bv', to: 'nh_br', enz: 'n_bvr', tags: 'NADPH → NADP⁺', tagPos: 'r', co: ['NADPH'] },
    { id: 'e_nh4', from: 'nh_br', to: 'nh_bile', style: 'plain' },
    { id: 'e_nh5', from: 'nh_gc', to: 'nh_ggc', enz: 'n_gcs', tags: 'ATP → ADP', tagPos: 'r', co: ['ATP'] },
    { id: 'e_nh6', from: 'nh_ggc', to: 'nh_gsh', enz: 'n_gss', feed: 'nh_gly2', tags: 'ATP → ADP', tagPos: 'l', co: ['ATP'] },
    { id: 'e_nh7', from: 'nh_ga', to: 'nh_cre', style: 'plain' },
    { id: 'e_nh8', from: 'nh_cre', to: 'nh_pcr', style: 'plain' },
  ],
};

// ───────── Plate 29 · biological amines and NO (slide 27) ─────────
const p29: PlateDef = {
  id: 'r_n29', plate: 29, part: 'IV', title: 'Biological amines & nitric oxide', sub: 'PLP-dependent decarboxylations', w: 1300, h: 1300,
  nodes: [
    { id: 'na_dopa', x: 200, y: 170, mol: 'dopa' },
    { id: 'na_da', x: 200, y: 430, mol: 'dopamine' },
    { id: 'na_ne', x: 200, y: 710, mol: 'noradr' },
    { id: 'na_epi', x: 200, y: 990, mol: 'adr' },
    { id: 'na_glu', x: 590, y: 170, mol: 'glu', label: 'Glutamate' },
    { id: 'na_gaba', x: 590, y: 430, mol: 'gaba' },
    { id: 'na_his', x: 590, y: 710, mol: 'his' },
    { id: 'na_hist', x: 590, y: 990, mol: 'histamine' },
    { id: 'na_trp', x: 990, y: 170, mol: 'trp' },
    { id: 'na_htp', x: 990, y: 430, mol: 'htp' },
    { id: 'na_ser', x: 990, y: 710, mol: 'serotonin' },
    { id: 'na_arg', x: 990, y: 990, mol: 'arg' },
    { id: 'na_no', x: 990, y: 1200, mol: 'no' },
  ],
  edges: [
    { id: 'e_na1', from: 'na_dopa', to: 'na_da', enz: 'n_aadc', tags: '− CO₂', tagPos: 'r', co: ['CO2', 'PLP'] },
    { id: 'e_na2', from: 'na_da', to: 'na_ne', enz: 'n_dbh', tags: 'Ascorbate + O₂ → H₂O + dehydroascorbate', tagPos: 'r' },
    { id: 'e_na3', from: 'na_ne', to: 'na_epi', enz: 'n_pnmt', tags: 'adoMet → adoHcy', tagPos: 'r' },
    { id: 'e_na4', from: 'na_glu', to: 'na_gaba', enz: 'n_gad', tags: '− CO₂', tagPos: 'r', co: ['CO2', 'PLP'] },
    { id: 'e_na5', from: 'na_his', to: 'na_hist', enz: 'n_hdc', tags: '− CO₂', tagPos: 'r', co: ['CO2', 'PLP'] },
    { id: 'e_na6', from: 'na_trp', to: 'na_htp', enz: 'n_tph', tags: 'Tetrahydrobiopterin + O₂ → H₂O + dihydrobiopterin', tagPos: 'r' },
    { id: 'e_na7', from: 'na_htp', to: 'na_ser', enz: 'n_aadc', tags: '− CO₂', tagPos: 'r', co: ['CO2', 'PLP'] },
    { id: 'e_na8', from: 'na_arg', to: 'na_no', style: 'plain', tags: 'precursor of nitric oxide', tagPos: 'r', plainTag: true },
  ],
  labels: [
    { x: 200, y: 100, kind: 'phase', text: 'Catecholamines', anchor: 'middle' },
    { x: 590, y: 100, kind: 'phase', text: 'GABA · histamine', anchor: 'middle' },
    { x: 990, y: 100, kind: 'phase', text: 'Serotonin · NO', anchor: 'middle' },
  ],
};

// ───────── Plate 30 · de novo purine synthesis (slides 30–32) ─────────
// Down the left column to AIR (the first ring), then up the right column to IMP, as on the slide.
const p30: PlateDef = {
  id: 'r_n30', plate: 30, part: 'IV', title: 'Purine synthesis', sub: 'PRPP → IMP in eleven steps', w: 1200, h: 1680,
  nodes: [
    { id: 'np_r5p', x: 300, y: 160, mol: 'r5p' },
    { id: 'np_prpp', x: 300, y: 350, mol: 'prpp', label: 'PRPP' },
    { id: 'np_pra', x: 300, y: 570, mol: 'pra' },
    { id: 'np_gar', x: 300, y: 800, mol: 'gar', label: 'GAR' },
    { id: 'np_fgar', x: 300, y: 1030, mol: 'fgar', label: 'FGAR' },
    { id: 'np_fgam', x: 300, y: 1260, mol: 'fgam', label: 'FGAM' },
    { id: 'np_air', x: 300, y: 1500, mol: 'air', label: 'AIR' },
    { id: 'np_n5c', x: 860, y: 1500, mol: 'n5cair', label: 'N⁵-CAIR' },
    { id: 'np_cair', x: 860, y: 1270, mol: 'cair', label: 'CAIR' },
    { id: 'np_saicar', x: 860, y: 1040, mol: 'saicar', label: 'SAICAR' },
    { id: 'np_aicar', x: 860, y: 810, mol: 'aicar', label: 'AICAR' },
    { id: 'np_fum', x: 1090, y: 925, mol: 'fum' },
    { id: 'np_faicar', x: 860, y: 580, mol: 'faicar', label: 'FAICAR' },
    { id: 'np_imp', x: 860, y: 350, mol: 'imp' },
    { id: 'n_c_nucfun', x: 1060, y: 150, kind: 'card', card: 'n_c_nucfun', label: 'Why nucleotides' },
    { id: 'n_c_purring', x: 1060, y: 210, kind: 'card', card: 'n_c_purring', label: 'Ring atoms' },
    { id: 'n_c_purine', x: 1060, y: 270, kind: 'card', card: 'n_c_purine', label: 'The 11 steps' },
    { id: 'np_x1', x: 520, y: 156, kind: 'xref', link: 'np_r5p', target: 'r5p', label: 'pentose phosphate pathway' },
    { id: 'np_x2', x: 860, y: 264, kind: 'xref', link: 'np_imp', target: 'nx_imp', label: '→ AMP and GMP' },
  ],
  edges: [
    { id: 'e_np0', from: 'np_r5p', to: 'np_prpp', style: 'plain', tags: 'PRPP is derived from ribose 5-phosphate', tagPos: 'r', plainTag: true },
    { id: 'e_np1', from: 'np_prpp', to: 'np_pra', enz: 'n_pur1', tags: 'Glutamine → Glutamate + PPi', tagPos: 'r' },
    { id: 'e_np2', from: 'np_pra', to: 'np_gar', enz: 'n_pur2', tags: 'Glycine + ATP → ADP + Pi', tagPos: 'r', co: ['ATP', 'Pi'] },
    { id: 'e_np3', from: 'np_gar', to: 'np_fgar', enz: 'n_pur3', tags: 'N¹⁰-Formyl-H₄ folate → H₄ folate', tagPos: 'r', co: ['THF'] },
    { id: 'e_np4', from: 'np_fgar', to: 'np_fgam', enz: 'n_pur4', tags: 'Glutamine + ATP → Glutamate + ADP + Pi', tagPos: 'r', co: ['ATP', 'Pi'] },
    { id: 'e_np5', from: 'np_fgam', to: 'np_air', enz: 'n_pur5', tags: 'ATP → ADP + Pi + H₂O', tagPos: 'r', co: ['ATP', 'Pi'] },
    { id: 'e_np6', from: 'np_air', to: 'np_n5c', enz: 'n_pur6', tags: 'HCO₃⁻ + ATP → ADP + Pi', tagPos: 'below', co: ['ATP', 'Pi'] },
    { id: 'e_np6a', from: 'np_air', to: 'np_cair', enz: 'n_pur6a', tags: '+ CO₂', tagPos: 'above', co: ['CO2'] },
    { id: 'e_np7', from: 'np_n5c', to: 'np_cair', enz: 'n_pur7' },
    { id: 'e_np8', from: 'np_cair', to: 'np_saicar', enz: 'n_pur8', tags: 'Aspartate + ATP → ADP + Pi', tagPos: 'r', co: ['ATP', 'Pi'] },
    { id: 'e_np9', from: 'np_saicar', to: 'np_aicar', enz: 'n_pur9', out: 'np_fum' },
    { id: 'e_np10', from: 'np_aicar', to: 'np_faicar', enz: 'n_pur10', tags: 'N¹⁰-Formyl-H₄ folate → H₄ folate', tagPos: 'r', co: ['THF'] },
    { id: 'e_np11', from: 'np_faicar', to: 'np_imp', enz: 'n_pur11', tags: '− H₂O', tagPos: 'r' },
  ],
  labels: [
    { x: 580, y: 760, kind: 'phase', text: 'Second ring', anchor: 'middle', sub: ['steps 6–11, read upward'] },
  ],
};

// ───────── Plate 31 · AMP and GMP; salvage (slides 33, 36) ─────────
const p31: PlateDef = {
  id: 'r_n31', plate: 31, part: 'IV', title: 'AMP & GMP, and salvage', sub: 'from IMP · recycling free bases', w: 1250, h: 1290,
  nodes: [
    { id: 'nx_imp', x: 170, y: 430, mol: 'imp' },
    { id: 'nx_adsuc', x: 640, y: 200, mol: 'adsuc' },
    { id: 'nx_amp', x: 1070, y: 200, mol: 'amp' },
    { id: 'nx_xmp', x: 640, y: 660, mol: 'xmp' },
    { id: 'nx_gmp', x: 1070, y: 660, mol: 'gmp' },
    { id: 'nx_ade', x: 170, y: 930, mol: 'adenine' },
    { id: 'nx_amp2', x: 640, y: 930, mol: 'amp' },
    { id: 'nx_hyp', x: 170, y: 1080, mol: 'hypoxanthine' },
    { id: 'nx_imp2', x: 640, y: 1080, mol: 'imp' },
    { id: 'nx_gua', x: 170, y: 1230, mol: 'guanine' },
    { id: 'nx_gmp2', x: 640, y: 1230, mol: 'gmp' },
    { id: 'n_c_ampgmp', x: 1070, y: 430, kind: 'card', card: 'n_c_ampgmp', label: 'GTP for AMP, ATP for GMP' },
    { id: 'n_c_salvage', x: 1030, y: 1080, kind: 'card', card: 'n_c_salvage', label: 'Salvage pathways' },
    { id: 'nx_x1', x: 330, y: 426, kind: 'xref', link: 'nx_imp', target: 'np_imp', label: 'made de novo' },
  ],
  edges: [
    { id: 'e_nx1', from: 'nx_imp', to: 'nx_adsuc', enz: 'n_adss', via: [[170, 200]], t: 0.66, tags: 'Aspartate + GTP → GDP + Pi', tagPos: 'below', co: ['GTP', 'Pi'] },
    { id: 'e_nx2', from: 'nx_adsuc', to: 'nx_amp', enz: 'n_adsl', tags: '− Fumarate', tagPos: 'below' },
    { id: 'e_nx3', from: 'nx_imp', to: 'nx_xmp', enz: 'n_impdh', via: [[170, 660]], t: 0.66, tags: 'H₂O + NAD⁺ → NADH + H⁺', tagPos: 'above', co: ['NADH'] },
    { id: 'e_nx4', from: 'nx_xmp', to: 'nx_gmp', enz: 'n_gmps', tags: 'Glutamine + ATP + H₂O → Glutamate + AMP + PPi', tagPos: 'below', co: ['ATP'] },
    { id: 'e_nx5', from: 'nx_ade', to: 'nx_amp2', enz: 'n_aprt', tags: 'PRPP → PPi', tagPos: 'above' },
    { id: 'e_nx6', from: 'nx_hyp', to: 'nx_imp2', enz: 'n_hgprt', tags: 'PRPP → PPi', tagPos: 'above' },
    { id: 'e_nx7', from: 'nx_gua', to: 'nx_gmp2', enz: 'n_hgprt', tags: 'PRPP → PPi', tagPos: 'above' },
  ],
  labels: [
    { x: 40, y: 110, kind: 'phase', text: 'From IMP' },
    { x: 40, y: 830, kind: 'phase', text: 'Salvage', sub: ['free base + PRPP'] },
  ],
};

// ───────── Plate 32 · pyrimidine nucleotides (slide 34) ─────────
const p32: PlateDef = {
  id: 'r_n32', plate: 32, part: 'IV', title: 'Pyrimidine synthesis', sub: 'UTP and CTP via orotidylate', w: 900, h: 1880,
  nodes: [
    { id: 'ny_asp', x: 300, y: 170, mol: 'asp' },
    { id: 'ny_cp', x: 640, y: 250, mol: 'carbp' },
    { id: 'ny_carbasp', x: 300, y: 400, mol: 'carbasp' },
    { id: 'ny_dho', x: 300, y: 630, mol: 'dho' },
    { id: 'ny_oro', x: 300, y: 860, mol: 'orotate' },
    { id: 'ny_omp', x: 300, y: 1090, mol: 'omp' },
    { id: 'ny_ump', x: 300, y: 1320, mol: 'ump' },
    { id: 'ny_utp', x: 300, y: 1550, mol: 'utp', label: 'UTP' },
    { id: 'ny_ctp', x: 300, y: 1780, mol: 'ctp', label: 'CTP' },
    { id: 'n_c_pyr', x: 700, y: 860, kind: 'card', card: 'n_c_pyr', label: 'Ring first, then ribose' },
    { id: 'ny_x1', x: 560, y: 1086, kind: 'xref', link: 'ny_omp', target: 'np_prpp', label: 'PRPP, as for purines' },
  ],
  edges: [
    { id: 'e_ny1', from: 'ny_asp', to: 'ny_carbasp', enz: 'n_atc', feed: 'ny_cp', tags: '− Pi', tagPos: 'l', co: ['Pi'] },
    { id: 'e_ny2', from: 'ny_carbasp', to: 'ny_dho', enz: 'n_dhoase', tags: '− H₂O', tagPos: 'l' },
    { id: 'e_ny3', from: 'ny_dho', to: 'ny_oro', enz: 'n_dhodh', tags: 'NAD⁺ → NADH + H⁺', tagPos: 'r', co: ['NADH'] },
    { id: 'e_ny4', from: 'ny_oro', to: 'ny_omp', enz: 'n_oprt', tags: 'PRPP → PPi', tagPos: 'r' },
    { id: 'e_ny5', from: 'ny_omp', to: 'ny_ump', enz: 'n_ompdc', tags: '− CO₂', tagPos: 'r', co: ['CO2'] },
    { id: 'e_ny6', from: 'ny_ump', to: 'ny_utp', enz: 'n_ukin', tags: '2 ATP → 2 ADP', tagPos: 'r', co: ['ATP'] },
    { id: 'e_ny7', from: 'ny_utp', to: 'ny_ctp', enz: 'n_ctps', tags: 'Glutamine + ATP → Glutamate + ADP + Pi', tagPos: 'r', co: ['ATP', 'Pi'] },
  ],
};

// ───────── Plate 33 · deoxyribonucleotides and thymidylate (slide 35) ─────────
const p33: PlateDef = {
  id: 'r_n33', plate: 33, part: 'IV', title: 'Deoxyribonucleotides & thymidylate', sub: 'dTMP from dUMP', w: 1250, h: 1220,
  nodes: [
    { id: 'nd_cdp', x: 170, y: 170, mol: 'cdp' },
    { id: 'nd_dcdp', x: 580, y: 170, mol: 'dcdp' },
    { id: 'nd_dctp', x: 990, y: 170, mol: 'dctp' },
    { id: 'nd_udp', x: 170, y: 420, mol: 'udp' },
    { id: 'nd_dudp', x: 580, y: 420, mol: 'dudp' },
    { id: 'nd_dutp', x: 990, y: 420, mol: 'dutp' },
    { id: 'nd_dump', x: 990, y: 670, mol: 'dump' },
    { id: 'nd_dtmp', x: 990, y: 940, mol: 'dtmp' },
    { id: 'nd_mthf', x: 660, y: 700, mol: 'mthf' },
    { id: 'nd_dhf', x: 660, y: 1010, mol: 'dhf' },
    { id: 'nd_thf', x: 170, y: 1010, mol: 'thf' },
    { id: 'n_c_dtmp', x: 1090, y: 1140, kind: 'card', card: 'n_c_dtmp', label: 'Thymidylate' },
  ],
  edges: [
    { id: 'e_ndd1', from: 'nd_cdp', to: 'nd_dcdp', enz: 'n_rnr' },
    { id: 'e_ndd2', from: 'nd_dcdp', to: 'nd_dctp', enz: 'n_ndpk' },
    { id: 'e_ndd3', from: 'nd_udp', to: 'nd_dudp', enz: 'n_rnr' },
    { id: 'e_ndd4', from: 'nd_dudp', to: 'nd_dutp', enz: 'n_ndpk' },
    { id: 'e_ndd5', from: 'nd_dctp', to: 'nd_dutp', enz: 'n_dcd' },
    { id: 'e_ndd6', from: 'nd_dutp', to: 'nd_dump', enz: 'n_dutpase' },
    { id: 'e_ndd7', from: 'nd_dump', to: 'nd_dtmp', enz: 'n_ts' },
    { id: 'e_ndd8', from: 'nd_mthf', to: 'nd_dhf', enz: 'n_ts', co: ['THF'] },
    { id: 'e_ndd9', from: 'nd_dhf', to: 'nd_thf', enz: 'n_dhfr', tags: 'NADPH + H⁺ → NADP⁺', tagPos: 'below', co: ['NADPH', 'THF'] },
    { id: 'e_ndd10', from: 'nd_thf', to: 'nd_mthf', enz: 'n_shmt', tags: 'Serine → Glycine', tagPos: 'l', co: ['PLP', 'THF'] },
  ],
  labels: [
    { x: 420, y: 1130, kind: 'phase', text: 'Folate cycle', anchor: 'middle', sub: ['regenerates the one-carbon donor'] },
  ],
};

// ───────── Plate 34 · purine breakdown (slide 37) ─────────
const p34: PlateDef = {
  id: 'r_n34', plate: 34, part: 'IV', title: 'Purine breakdown', sub: 'to uric acid, and beyond', w: 1250, h: 1480,
  nodes: [
    { id: 'nq_gmp', x: 230, y: 170, mol: 'gmp' },
    { id: 'nq_guo', x: 230, y: 400, mol: 'guanosine' },
    { id: 'nq_gua', x: 230, y: 630, mol: 'guanine' },
    { id: 'nq_amp', x: 620, y: 170, mol: 'amp' },
    { id: 'nq_ado', x: 620, y: 400, mol: 'adenosine' },
    { id: 'nq_ino', x: 620, y: 630, mol: 'inosine' },
    { id: 'nq_hyp', x: 620, y: 860, mol: 'hypoxanthine' },
    { id: 'nq_xan', x: 620, y: 1110, mol: 'xanthine' },
    { id: 'nq_uric', x: 620, y: 1370, mol: 'uric' },
    { id: 'nq_uric2', x: 920, y: 170, mol: 'uric', badge: 'primates, birds, reptiles, insects' },
    { id: 'nq_allo', x: 920, y: 420, mol: 'allantoin', badge: 'most mammals' },
    { id: 'nq_allt', x: 920, y: 670, mol: 'allantoate', badge: 'bony fishes' },
    { id: 'nq_urea', x: 920, y: 920, mol: 'urea', badge: 'amphibians, cartilaginous fishes' },
    { id: 'nq_nh4', x: 920, y: 1170, mol: 'nh4', label: 'NH₄⁺', badge: 'marine invertebrates' },
    { id: 'n_c_purcat', x: 230, y: 1370, kind: 'card', card: 'n_c_purcat', label: 'Who excretes what' },
  ],
  edges: [
    { id: 'e_nq1', from: 'nq_gmp', to: 'nq_guo', enz: 'n_5nt', tags: 'H₂O → Pi', tagPos: 'l', co: ['Pi'] },
    { id: 'e_nq2', from: 'nq_guo', to: 'nq_gua', enz: 'n_nsd', tags: 'H₂O → ribose', tagPos: 'l' },
    { id: 'e_nq3', from: 'nq_gua', to: 'nq_xan', enz: 'n_gda', via: [[230, 1110]], t: 0.4, tags: 'H₂O → NH₃', tagPos: 'l' },
    { id: 'e_nq4', from: 'nq_amp', to: 'nq_ado', enz: 'n_5nt', tags: 'H₂O → Pi', tagPos: 'l', co: ['Pi'] },
    { id: 'e_nq5', from: 'nq_ado', to: 'nq_ino', enz: 'n_ada', tags: 'H₂O → NH₃', tagPos: 'l' },
    { id: 'e_nq6', from: 'nq_ino', to: 'nq_hyp', enz: 'n_nsd', tags: 'H₂O → ribose', tagPos: 'l' },
    { id: 'e_nq7', from: 'nq_hyp', to: 'nq_xan', enz: 'n_xo', tags: 'H₂O + O₂ → H₂O₂', tagPos: 'l' },
    { id: 'e_nq8', from: 'nq_xan', to: 'nq_uric', enz: 'n_xo', tags: 'H₂O + O₂ → H₂O₂', tagPos: 'l' },
    { id: 'e_nq9', from: 'nq_uric2', to: 'nq_allo', enz: 'n_uox', tags: '½O₂ + H₂O → CO₂', tagPos: 'r', co: ['CO2'] },
    { id: 'e_nq10', from: 'nq_allo', to: 'nq_allt', enz: 'n_alln', tags: '+ H₂O', tagPos: 'r' },
    { id: 'e_nq11', from: 'nq_allt', to: 'nq_urea', enz: 'n_allc', tags: 'H₂O → glyoxylate', tagPos: 'r' },
    { id: 'e_nq12', from: 'nq_urea', to: 'nq_nh4', enz: 'n_urease', tags: '2 H₂O → 2 CO₂', tagPos: 'r', co: ['CO2'] },
  ],
  captions: [{ x: 920, y: 100, text: 'EXCRETED BY', anchor: 'middle' }],
};

// ───────── Plate 35 · pyrimidine breakdown (slide 38) ─────────
const p35: PlateDef = {
  id: 'r_n35', plate: 35, part: 'IV', title: 'Pyrimidine breakdown', sub: 'NH₄⁺ → urea; thymine → succinyl-CoA', w: 1250, h: 1480,
  nodes: [
    { id: 'nr_thy', x: 300, y: 170, mol: 'thymine' },
    { id: 'nr_dht', x: 300, y: 400, mol: 'dht' },
    { id: 'nr_bui', x: 300, y: 630, mol: 'bui' },
    { id: 'nr_baib', x: 300, y: 860, mol: 'baib' },
    { id: 'nr_mmsa', x: 300, y: 1090, mol: 'mmsa' },
    { id: 'nr_prop', x: 300, y: 1320, mol: 'propcoa' },
    { id: 'nr_cyt', x: 950, y: 170, mol: 'cytosine' },
    { id: 'nr_ura', x: 770, y: 420, mol: 'uracil' },
    { id: 'nr_thy2', x: 1130, y: 420, mol: 'thymine' },
    { id: 'nr_nh3', x: 950, y: 660, kind: 'small', label: 'NH₃ + CO₂' },
    { id: 'nr_accoa', x: 770, y: 900, mol: 'accoa' },
    { id: 'nr_urea', x: 950, y: 900, mol: 'urea' },
    { id: 'nr_succoa', x: 1130, y: 900, mol: 'succoa' },
    { id: 'n_c_pyrcat', x: 950, y: 1100, kind: 'card', card: 'n_c_pyrcat', label: 'Pyrimidine breakdown' },
    { id: 'nr_x1', x: 300, y: 1410, kind: 'xref', link: 'nr_prop', target: 'lp_prop', label: '→ methylmalonyl-CoA → succinyl-CoA' },
    { id: 'nr_x2', x: 950, y: 986, kind: 'xref', link: 'nr_urea', target: 'nu_urea', label: 'the urea cycle' },
  ],
  edges: [
    { id: 'e_nr1', from: 'nr_thy', to: 'nr_dht', enz: 'n_dpd', tags: 'NADPH + H⁺ → NADP⁺', tagPos: 'r', co: ['NADPH'] },
    { id: 'e_nr2', from: 'nr_dht', to: 'nr_bui', enz: 'n_dhp', tags: '+ H₂O', tagPos: 'r' },
    { id: 'e_nr3', from: 'nr_bui', to: 'nr_baib', enz: 'n_bup', tags: 'H₂O → NH₄⁺ + HCO₃⁻', tagPos: 'r' },
    { id: 'e_nr4', from: 'nr_baib', to: 'nr_mmsa', enz: 'n_bat', tags: 'α-Ketoglutarate → Glutamate', tagPos: 'r' },
    { id: 'e_nr5', from: 'nr_mmsa', to: 'nr_prop', style: 'plain', tags: 'further degraded', tagPos: 'r', plainTag: true },
    { id: 'e_nr6', from: 'nr_cyt', to: 'nr_ura', style: 'plain' },
    { id: 'e_nr7', from: 'nr_cyt', to: 'nr_nh3', style: 'plain' },
    { id: 'e_nr8', from: 'nr_ura', to: 'nr_nh3', style: 'plain' },
    { id: 'e_nr9', from: 'nr_thy2', to: 'nr_nh3', style: 'plain' },
    { id: 'e_nr10', from: 'nr_ura', to: 'nr_accoa', style: 'plain', tags: 'several steps', tagPos: 'l', plainTag: true },
    { id: 'e_nr11', from: 'nr_nh3', to: 'nr_urea', style: 'plain' },
    { id: 'e_nr12', from: 'nr_thy2', to: 'nr_succoa', style: 'plain', tags: 'several steps', tagPos: 'r', plainTag: true },
  ],
  labels: [
    { x: 40, y: 100, kind: 'phase', text: 'Thymine, step by step' },
    { x: 700, y: 100, kind: 'phase', text: 'Overview' },
  ],
};

/**
 * Cross-references drawn on the midterm and Part III plates, pointing into Part IV. Absolute coordinates; the midterm
 * ones sit on plates that are placed the same in the desktop and phone scenes.
 */
const outsideXrefs: MapNode[] = [
  { id: 'px_akg', x: 2110, y: 2676, kind: 'xref', link: 'akg', target: 'nt_akg', label: 'amino-group acceptor in transamination' },
  { id: 'px_fum', x: 1150, y: 2976, kind: 'xref', link: 'fum', target: 'nu_fum', label: 'also from the urea cycle' },
  { id: 'px_oaa', x: 1330, y: 2446, kind: 'xref', link: 'oaa', target: 'nu_oaa', label: '→ aspartate for the urea cycle' },
  { id: 'px_succoa', x: 2010, y: 3022, kind: 'xref', target: 'ns_succoa', label: 'also from Ile, Met, Thr, Val and thymine' },
  { id: 'px_pg3', x: 1330, y: 1326, kind: 'xref', link: 'pg3', target: 'nsg_pg3', label: '→ serine, glycine, cysteine' },
  { id: 'px_pyr', x: 1250, y: 1928, kind: 'xref', link: 'pyr', target: 'ng_mpyr', label: '↔ alanine (glucose-alanine cycle)' },
  { id: 'px_r5p', x: 1780, y: 516, kind: 'xref', link: 'r5p', target: 'np_r5p', label: '→ PRPP for nucleotides' },
  { id: 'px_prop', x: 4600, y: 2880, kind: 'xref', link: 'lp_prop', target: 'nr_prop', label: 'also from thymine' },
];

// six columns to the right of Part III (which ends at x ≈ 6940)
const C1 = 7100, C2 = 8400, C3 = 9720, C4 = 11080, C5 = 12440, C6 = 13750;
const placed = [
  place(p20, C1, 20), place(p21, C1, 1400), place(p22, C1, 2580),
  place(p23, C2, 20), place(p24, C2, 1880),
  place(p25, C3, 20), place(p26, C3, 1240), place(p27, C3, 2630),
  place(p28, C4, 20), place(p29, C4, 1380),
  place(p30, C5, 20), place(p31, C5, 1760),
  place(p32, C6, 20), place(p33, C6 + 960, 20), place(p34, C6 + 960, 1300), place(p35, C6 + 960, 2840),
];

export const aminoScene = combine(placed, outsideXrefs);
