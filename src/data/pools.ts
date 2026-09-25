/**
 * Route-tracer pools. The tracer treats every drawing of a molecule as the same molecule, so a route may jump
 * between drawings wherever a molecule is drawn twice. That is wrong in two cases, and these nodes are split off:
 *
 *  - compartments: the same molecule in the mitochondrial matrix and in the cytosol is not one pool. Acetyl-CoA
 *    cannot cross the inner membrane (the reason the citrate shuttle exists, Part III slide 25), fatty acyl-CoA
 *    needs the carnitine shuttle, and the urea cycle and the NADH shuttles move their intermediates across.
 *    Only molecules the slides move across a membrane are split; the intermembrane space counts as cytosol
 *    (small metabolites pass the outer membrane through porin, Part III slide 10).
 *  - chain length: the acyl chain before and after one round of β-oxidation or fatty acid synthesis.
 *
 * A node not listed here joins its molecule's unsplit pool, which connects to the others only through drawn arrows.
 */
export const POOL: Record<string, 'mit' | 'cyt' | 'shorter' | 'longer'> = {
  // acetyl-CoA: the matrix hub (PDH, β-oxidation, ketone bodies, the cycle) and the cytosolic pool for synthesis
  accoa: 'mit', lk_accoa2: 'mit',
  lf_accoa: 'cyt', lh_ac: 'cyt',
  // fatty acyl-CoA and the carnitine shuttle (the intermembrane-space acylcarnitine counts as cytosol)
  lt_facoa: 'cyt', lb_facoa: 'mit', lb_short: 'shorter',
  lc_facar_i: 'cyt', lc_car_i: 'cyt', lc_facar_m: 'mit', lc_car_m: 'mit',
  // acyl-ACP before and after a round of synthesis
  lf_acyl2: 'longer',
  // citric acid cycle intermediates and their shuttles
  oaa: 'mit', ma_oaa_n: 'mit', ls_oaa_m: 'mit',
  ma_oaa_p: 'cyt', ls_oaa_c: 'cyt', nu_oaa_c: 'cyt',
  mal: 'mit', ma_mal_n: 'mit', ls_mal_m: 'mit',
  ma_mal_p: 'cyt', ls_mal_c: 'cyt', nu_mal: 'cyt',
  cit: 'mit', ls_cit_c: 'cyt',
  akg: 'mit', ma_akg_n: 'mit', ma_akg_p: 'cyt',
  fum: 'mit', nu_fum: 'cyt',
  succoa: 'mit',
  // pyruvate: made in the cytosol, carried into the matrix
  pyr: 'cyt', ng_mpyr: 'cyt', ng_lpyr: 'cyt', ls_pyr_c: 'cyt', ls_pyr_m: 'mit',
  // amino acids moved by the shuttles and the urea cycle
  ma_asp_n: 'mit', nu_asp_m: 'mit', ma_asp_p: 'cyt', nu_asp_c: 'cyt',
  ma_glu_n: 'mit', ng_glu2: 'mit', nu_glu: 'mit', ma_glu_p: 'cyt', nt_glu: 'cyt',
  ng_gln2: 'mit', nu_gln: 'mit', nu_nh4: 'mit',
  nu_orn_m: 'mit', nu_orn_c: 'cyt', nu_cit_m: 'mit', nu_cit_c: 'cyt',
};

export const POOL_LABEL: Record<string, string> = { mit: 'matrix', cyt: 'cytosol', shorter: 'Cₙ₋₂', longer: 'Cₙ₊₂' };
