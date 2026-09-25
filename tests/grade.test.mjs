// Unit tests for the quiz grader (src/grade.ts). Run with `npm test`.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { grade } from '../src/grade.ts';

// [answer, other accepted spellings, typed answers that must pass, typed answers that must fail]
const cases = [
  ['Phosphofructokinase-1', ['PFK-1'], ['pfk1', 'PFK-1', 'phosphofructokinase 1', 'phosphofructokinase-1', 'phosphofrucotkinase-1'], ['phosphofructokinase', 'pfk2', 'hexokinase']],
  ['Carnitine acyltransferase I', ['CAT I'], ['carnitine acyltransferase I', 'carnitine acyltransferase 1', 'CAT 1', 'carnitin acyltransferase i'], ['carnitine acyltransferase', 'carnitine acyltransferase II']],
  ['α-Ketoglutarate', [], ['alpha-ketoglutarate', 'a-ketoglutarate', 'α ketoglutarate', 'alpha ketoglutarte'], ['ketoglutarate', 'glutarate']],
  ['Fructose 1,6-bisphosphate', [], ['fructose 1,6-bisphosphate', 'fructose-1,6-bisphosphate', 'fructose 1 6 bisphosphate'], ['fructose 2,6-bisphosphate', 'fructose bisphosphate']],
  ['N⁵,N¹⁰-Methylenetetrahydrofolate', [], ['N5,N10-methylenetetrahydrofolate', 'n5 n10 methylene tetrahydrofolate'], ['methylenetetrahydrofolate']],
  ['L-Malate', ['Malate'], ['malate', 'L-malate', 'l malate'], ['maleate x', 'fumarate']],
  ['ATP', [], ['atp', 'ATP'], ['adp', 'amp']],
  ['D-β-Hydroxybutyrate', [], ['beta-hydroxybutyrate', 'b-hydroxybutyrate', 'D-beta-hydroxybutyrate', 'β hydroxybutyrate'], ['hydroxybutyrate', 'alpha-hydroxybutyrate']],
  ['Glucose', [], ['glucose', 'D-glucose', 'glucos'], ['galactose', 'fructose']],
  ['Complex III', [], ['complex III', 'complex 3', 'Complex iii'], ['complex I', 'complex II', 'complex']],
  ['γ-Aminobutyrate (GABA)', ['GABA', 'γ-Aminobutyrate'], ['GABA', 'gamma-aminobutyrate', 'g-aminobutyrate', 'gamma aminobutyric'], ['aminobutyrate', 'gaba 2']],
];

for (const [answer, others, right, wrong] of cases) {
  test(answer, () => {
    const accept = [answer, ...others];
    for (const t of right) assert.ok(grade(t, accept), `should accept "${t}"`);
    for (const t of wrong) assert.ok(!grade(t, accept), `should reject "${t}"`);
  });
}

test('an empty answer is never right', () => {
  assert.equal(grade('', ['ATP']), false);
  assert.equal(grade('  - ', ['ATP']), false);
});
