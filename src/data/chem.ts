/**
 * CXSMILES with labelled pseudo-atoms: cx('*CCC(=O)S*', 'R', 'CoA') → '*CCC(=O)S* |$R;;;;;;CoA$|'.
 * Labels go to the `*` atoms in order of appearance, so a generic acyl-CoA is drawn the way the slides draw it
 * (R–CH₂–CH₂–C(=O)–S–CoA) instead of as a 50-atom coenzyme A skeleton.
 */
export function cx(smiles: string, ...labels: string[]): string {
  const pseudo: boolean[] = [];
  for (let i = 0; i < smiles.length; i++) {
    const c = smiles[i];
    if (c === '[') { const j = smiles.indexOf(']', i); pseudo.push(smiles.slice(i + 1, j) === '*'); i = j; }
    else if (c === '*') pseudo.push(true);
    else if (c === '%') i += 2; // two-digit ring closure
    else if (/[A-Z]/.test(c)) { if (c === 'C' && smiles[i + 1] === 'l') i++; else if (c === 'B' && smiles[i + 1] === 'r') i++; pseudo.push(false); }
    else if (/[bcnops]/.test(c)) pseudo.push(false);
  }
  let k = 0;
  const lab = pseudo.map((p) => (p ? labels[k++] ?? '' : ''));
  if (k !== labels.length) throw new Error(`cx(): ${labels.length} labels for ${k} pseudo-atoms in ${smiles}`);
  return `${smiles} |$${lab.join(';')}$|`;
}

/** The plain SMILES part of a (CX)SMILES string. */
export const bareSmiles = (s: string) => s.split(' |')[0];
