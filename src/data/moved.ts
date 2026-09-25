/**
 * Node ids that no longer exist, and the node that took each one's place. Joining the plates into one map drew each
 * shared molecule once per compartment, so the copies that the separate plates had (their own acetyl-CoA, their own
 * cycle) were removed. Old deep links (#mol/<id>) and saved quiz answers still use the old ids; this sends them to
 * the molecule that replaced them. Ids are otherwise permanent: add a line here whenever a node is removed.
 */
export const MOVED_NODES = new Map<string, string>(Object.entries({
  // dietary fat, glycerol, fatty acid activation and β-oxidation's own copies (Part III)
  ld_ox: 'lt_fa', ld_store: 'lt_tag',
  lg_gly: 'lt_gly', lg_g3p: 'lt_g3p', lg_dhap: 'dhap', lg_gap: 'g3p', lt_dhap: 'dhap',
  lc_fa: 'lt_fa', lk_fa: 'lt_fa', lc_facoa: 'lt_facoa', lt_facoa2: 'lt_facoa', lc_facoa_m: 'lb_facoa',
  lb_accoa: 'accoa', lk_accoa: 'accoa', ls_accoa_m: 'accoa', ls_accoa_c: 'lf_accoa',
  lk_oaa: 'oaa', lk_glc: 'glc', lp_suc: 'succoa', ls_cit_m: 'cit', le_pal: 'lf_palm',
  // transamination and the urea cycle (Part IV)
  nt_akg: 'akg', nt_nh4: 'nu_nh4', nu_oaa: 'oaa', nu_akg: 'akg',
  // the carbon-skeleton plate's own citric acid cycle (Part IV slide 19), now the real one
  ns_cit: 'cit', ns_icit: 'icit', ns_akg: 'akg', ns_succoa: 'succoa', ns_suc: 'suc', ns_fum: 'fum', ns_mal: 'mal',
  ns_oaa: 'oaa', ns_accoa: 'accoa', ns_pyr: 'pyr', ns_glu: 'nu_glu', ns_glc: 'glc', ns_kb: 'lk_kb',
  // amino acid and nucleotide synthesis: one serine, one glycine, one IMP
  nc_ser: 'nsg_ser', nh_gly: 'nsg_gly', nx_imp: 'np_imp',
}));
