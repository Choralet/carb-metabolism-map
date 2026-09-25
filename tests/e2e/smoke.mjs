// Smoke test of the main features on a desktop-sized window. Run through run.mjs (`npm run test:e2e`).
import { desktopScene } from '../../src/data/scene.ts';

const finalPlates = desktopScene.regions.filter((r) => r.part === 'III' || r.part === 'IV').length;

export default async function smoke({ browser, base, check: ok }) {
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const p = await ctx.newPage();
  const errors = [];
  p.on('pageerror', (e) => errors.push(e.message));
  p.on('console', (m) => { if (m.type() === 'error') errors.push('console: ' + m.text()); });

  await p.goto(base, { waitUntil: 'networkidle' });
  await p.waitForSelector('svg[data-lod]');
  ok((await p.title()) === 'Metabolism Atlas', 'title');
  const [, , vw0] = (await p.locator('svg[data-lod]').getAttribute('viewBox')).split(' ').map(Number);
  ok(vw0 > 9000, `a desktop opens on the whole cell (view ${Math.round(vw0)} units wide)`);
  ok(await p.locator('text=Metabolism').first().isVisible(), 'brand visible');

  // search → drawer
  await p.keyboard.press('/');
  ok(await p.locator('.palette').isVisible(), '"/" opens search');
  await p.keyboard.type('pfk');
  await p.waitForTimeout(150);
  const first = await p.locator('.palette-list li[role=option]').first().innerText();
  ok(/Phosphofructokinase/.test(first), `first hit for "pfk" is PFK-1 (${first.split('\n')[0]})`);
  await p.keyboard.press('Enter');
  await p.waitForTimeout(600);
  ok(!(await p.locator('.palette').count()), 'Enter closes search');
  ok(/Phosphofructokinase-1/.test(await p.locator('.drawer h2').innerText()), 'drawer shows PFK-1');
  await p.keyboard.press('Escape');
  await p.waitForTimeout(200);
  ok(!(await p.locator('.drawer').count()), 'Escape closes drawer');

  // search by Greek / script-free spelling
  await p.keyboard.press('/');
  await p.keyboard.type('alpha keto');
  await p.waitForTimeout(150);
  ok(/α-Ketoglutarate/.test(await p.locator('.palette-list li[role=option]').first().innerText()), '"alpha keto" finds α-ketoglutarate');
  await p.keyboard.press('Escape');

  // H hides the toolbar
  await p.keyboard.press('h');
  ok(!(await p.locator('.topbar').count()), 'H hides the toolbar');
  await p.click('.chrome-back');
  ok(await p.locator('.topbar').isVisible(), 'toolbar comes back');

  // layers: regulation + highlight
  await p.click('button[data-panel-toggle][title^="Layers"]');
  await p.locator('.switch-row').click();
  await p.waitForTimeout(200);
  ok((await p.locator('g.reg').count()) > 5, `regulation layer draws blocks (${await p.locator('g.reg').count()})`);
  await p.locator('.fchip').first().click();
  ok((await p.locator('.elabel.hl').count()) > 0, 'kinase highlight marks labels');
  ok(await p.locator('.hl-bar').isVisible(), 'highlight bar appears');
  await p.keyboard.press('Escape');
  await p.locator('.hl-bar .text-btn').click();
  ok(!(await p.locator('.hl-bar').count()), 'Clear removes highlights');

  // the exam switch only highlights: nothing leaves the map, the other exam fades, and the camera stays put
  const vb0 = await p.locator('svg[data-lod]').getAttribute('viewBox');
  await p.locator('.scope button', { hasText: 'Final' }).click();
  await p.waitForTimeout(300);
  const midPlates = await p.locator('g.plate:not(.final)').count(), midOut = await p.locator('g.plate.out:not(.final)').count();
  const finPlates = await p.locator('g.plate.final').count(), finOut = await p.locator('g.plate.final.out').count();
  ok(midOut === midPlates && midPlates > 0, `Final fades every midterm plate (${midOut}/${midPlates})`);
  ok(finPlates === finalPlates && finOut === 0, `Final keeps every final plate at full strength (${finPlates}/${finalPlates})`);
  ok(!(await p.locator('[data-node="accoa"].out').count()), 'a molecule both exams use (acetyl-CoA) stays lit in Final');
  ok((await p.locator('[data-edge="e_hk"].out').count()) > 0, 'a midterm-only step (hexokinase) fades in Final');
  ok(!(await p.locator('[data-edge="e_pc"].out').count()), 'a step both exams name (pyruvate carboxylase, Part III slide 41) stays lit in Final');
  // Part IV slide 19 draws the citric acid cycle without naming its enzymes
  ok(!(await p.locator('g.eline[data-edge="e_idh"].out').count()) && (await p.locator('g.elabel-g[data-edge="e_idh"].out').count()) === 1,
    'Final keeps the citric acid cycle\'s arrows lit but fades their midterm enzyme names');
  ok((await p.locator('g.reg.out[aria-label="Regulation of Citrate synthase"]').count()) === 1, 'a shared step\'s regulation (Part II) fades in Final');
  ok((await p.locator('svg[data-lod]').getAttribute('viewBox')) === vb0, 'switching exams does not move the camera');
  await p.locator('.scope button', { hasText: 'Midterm' }).click();
  await p.waitForTimeout(300);
  ok((await p.locator('g.plate.final').count()) === finalPlates, 'Midterm keeps the final plates on the map');
  ok((await p.locator('g.plate.final.out').count()) === finalPlates && !(await p.locator('g.plate.out:not(.final)').count()), 'Midterm fades the final plates only');
  await p.locator('.scope button', { hasText: 'Both' }).click();
  await p.waitForTimeout(300);
  ok(!(await p.locator('g.plate.out').count()), 'Both: nothing faded');

  // the pathways join: β-oxidation hands acetyl-CoA to the cycle, glycerol 3-phosphate is made from glycolysis's DHAP
  ok((await p.locator('[data-edge="e_lb4"]').count()) === 2 && !!(await p.evaluate(() => document.querySelector('[data-edge="e_lb4"] path.feedline'))), 'thiolase hands acetyl-CoA to the citric acid cycle');

  // cross-references fly to their target
  const viewXY = async () => { const [x, y, w, h] = (await p.locator('svg[data-lod]').getAttribute('viewBox')).split(' ').map(Number); return [x + w / 2, y + h / 2]; };
  await p.locator('g.kind-xref', { hasText: 'same steps as β-oxidation' }).first().dispatchEvent('click');
  await p.waitForTimeout(900);
  const [bx, by] = await viewXY();
  ok(Math.abs(bx - 4130) < 60 && Math.abs(by - 3520) < 60, `note "same steps as β-oxidation" flies to the β-oxidation loop (${Math.round(bx)}, ${Math.round(by)})`);
  await p.locator('g.kind-xref', { hasText: 'or into the citric acid cycle' }).first().dispatchEvent('click');
  await p.waitForTimeout(900);
  const [mx, my] = await viewXY();
  ok(Math.abs(mx - 5550) < 60 && Math.abs(my - 3900) < 60, `note on the urea cycle's malate flies to the cycle's malate (${Math.round(mx)}, ${Math.round(my)})`);

  // search reaches Parts III and IV
  for (const [q, want, part] of [['carnitine acyl', /Carnitine acyltransferase/, 'III'], ['argininosuccinate synth', /Argininosuccinate synthetase/, 'IV']]) {
    await p.keyboard.press('/');
    await p.keyboard.type(q);
    await p.waitForTimeout(200);
    const hit = await p.locator('.palette [role="option"]').first().innerText();
    ok(want.test(hit), `search finds Part ${part} enzymes (${hit.split('\n')[0]})`);
    await p.keyboard.press('Escape');
  }

  // route tracer: glucose → palmitate must take the citrate shuttle (acetyl-CoA cannot cross the inner membrane)
  await p.keyboard.press('/'); await p.keyboard.type('glucose'); await p.waitForTimeout(150);
  await p.locator('.palette [role="option"]', { hasText: 'Molecule' }).first().click();
  await p.waitForTimeout(400);
  await p.getByRole('button', { name: /From here to/ }).click();
  await p.keyboard.type('palmitate'); await p.waitForTimeout(150); await p.keyboard.press('Enter');
  await p.waitForTimeout(700);
  const steps = await p.locator('.rb-steps li').allInnerTexts();
  ok(steps.some((t) => /Citrate lyase/.test(t)) && steps.length > 10, `route glucose → palmitate uses the citrate shuttle (${steps.length} steps)`);
  ok((await p.locator('.route-glow').count()) === steps.length, 'route arrows are highlighted');
  await p.getByRole('button', { name: 'Clear the route' }).click();
  ok(!(await p.locator('.route-bar').count()), 'clearing removes the route');

  // quiz
  await p.click('.tool.quiz');
  await p.waitForTimeout(300);
  const hidden0 = await p.locator('.elabel.hidden').count();
  ok(hidden0 > 20, `quiz hides enzyme labels (${hidden0})`);
  const firstEnz = await p.locator('.elabel.hidden').first().evaluate((el) => el.closest('[data-enz]')?.getAttribute('data-enz'));
  const clickHidden = async (id) => { await p.locator(`[data-enz="${id}"] .elabel.hidden`).first().dispatchEvent('click'); await p.waitForTimeout(200); };
  await clickHidden(firstEnz);
  ok(await p.locator('.quiz-ask').isVisible(), 'clicking a ? opens a question card');
  ok(/Name this enzyme/.test(await p.locator('.quiz-ask').innerText()), 'the card asks for the enzyme');
  // reveal and self-grade right
  await p.getByRole('button', { name: 'Show answer' }).click();
  const answerText = (await p.locator('.qa-answer').innerText()).replace(/^ANSWER\s*/i, '').trim();
  await p.getByRole('button', { name: 'Got it' }).click();
  await p.waitForTimeout(200);
  ok((await p.locator('.qb-n.ok').innerText()).includes('1'), `self-graded right counts (${answerText})`);
  // reset, then type the answer
  await p.getByRole('button', { name: /Reset/ }).click();
  await p.waitForTimeout(200);
  await clickHidden(firstEnz);
  await p.locator('.quiz-ask input').fill(answerText.toLowerCase());
  await p.keyboard.press('Enter');
  await p.waitForTimeout(200);
  ok(await p.locator('.qa-result.ok').isVisible(), 'typing the name is graded right');
  await p.waitForTimeout(1100);
  ok(!(await p.locator('.quiz-ask').count()), 'a right answer moves on by itself');
  ok((await p.locator(`[data-enz="${firstEnz}"] .elabel.q-ok`).count()) > 0, 'a right answer is marked on the map');
  // a wrong answer goes to the missed deck
  const second = await p.locator('.elabel.hidden').first().evaluate((el) => el.closest('[data-enz]')?.getAttribute('data-enz'));
  await clickHidden(second);
  await p.locator('.quiz-ask input').fill('zzzz');
  await p.keyboard.press('Enter');
  await p.waitForTimeout(200);
  ok(await p.locator('.qa-result.miss').isVisible(), 'a wrong name is caught');
  await p.getByRole('button', { name: 'Missed it' }).click();
  await p.waitForTimeout(200);
  ok((await p.locator(`[data-enz="${second}"] .elabel.q-miss`).count()) > 0, 'a miss is marked on the map');
  ok(/Missed 1/.test(await p.locator('.qb-seg').innerText()), 'the missed deck has it');
  await p.getByRole('radio', { name: /Missed/ }).click();
  await p.waitForTimeout(200);
  ok((await p.locator('.elabel.hidden').count()) === 0, 'missed-deck mode quizzes only the deck (its one item is answered)');
  await p.getByRole('radio', { name: /^All/ }).click();
  // progress survives a reload
  await p.reload({ waitUntil: 'networkidle' }); await p.waitForSelector('svg[data-lod]');
  await p.click('.tool.quiz'); await p.waitForTimeout(300);
  ok((await p.locator('.qb-n.ok').innerText()).includes('1') && (await p.locator('.qb-n.miss').innerText()).includes('1'), 'progress survives a reload');
  // this plate only
  const left = async () => +(await p.locator('.qb-progress .qb-n').nth(2).innerText()).split(' ')[0];
  const allLeft = await left();
  await p.getByRole('radio', { name: /This plate/ }).click();
  await p.waitForTimeout(200);
  const plateLeft = await left();
  ok(plateLeft > 0 && plateLeft < allLeft, `"This plate" narrows the quiz (${plateLeft} of ${allLeft})`);
  await p.getByRole('radio', { name: /^All/ }).click();
  await p.getByRole('button', { name: /Reset/ }).click();
  await p.click('.tool.quiz');

  // theme
  const t0 = await p.evaluate(() => document.documentElement.dataset.theme);
  await p.click('.tool.icon-only');
  const t1 = await p.evaluate(() => document.documentElement.dataset.theme);
  ok(t0 !== t1, `theme toggles (${t0} → ${t1})`);

  // keyboard access to a map label (zoom in first: the whole-map view shows plate titles, not labels)
  await p.click('button[data-panel-toggle][title^="Plates"]');
  await p.locator('.toc-views button', { hasText: 'Glycolysis 1–5' }).click();
  await p.waitForTimeout(700);
  await p.locator('g.elabel[aria-label="Hexokinase"]').first().focus();
  await p.keyboard.press('Enter');
  await p.waitForTimeout(300);
  ok(/Hexokinase/.test(await p.locator('.drawer h2').innerText()), 'Enter on a focused label opens it');

  ok(errors.length === 0, `no page errors${errors.length ? ': ' + errors.join(' | ') : ''}`);
  await ctx.close();
}
