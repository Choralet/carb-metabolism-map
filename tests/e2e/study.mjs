// Study mode: the chapter picker, stepping, the slide window following the step, details from the study card, and
// finishing a chapter. Run through run.mjs (`npm run test:e2e`). Counts and titles are read from the data.
import { tours } from '../../src/data/tours.ts';

const first = tours[0];
const slideNo = (cite) => +cite.match(/slides? (\d+)/)[1];

export default async function study({ browser, base, check: ok }) {
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const p = await ctx.newPage();
  const errors = [];
  p.on('pageerror', (e) => errors.push(e.message));
  p.on('console', (m) => { if (m.type() === 'error') errors.push('console: ' + m.text()); });
  const title = () => p.locator('.sb-title').innerText();
  const slideSrc = () => p.locator('.slide-viewer img').getAttribute('src');

  await p.goto(base, { waitUntil: 'networkidle' });
  await p.waitForSelector('svg[data-lod]');

  // the picker lists every chapter
  await p.click('button.study-btn');
  ok(await p.locator('.study-panel').isVisible(), 'Study opens the chapter list');
  ok((await p.locator('.st-chapter').count()) === tours.length, `it lists all ${tours.length} chapters`);

  // start the first chapter: card, highlighted arrow and the step's slide
  await p.locator('.st-chapter').first().click();
  await p.waitForTimeout(800);
  ok(!(await p.locator('.study-panel').count()), 'starting a chapter closes the list');
  ok((await title()).includes(first.steps[0].title), `step 1 is "${first.steps[0].title}"`);
  ok((await p.locator(`g.eline.now[data-edge="${first.steps[0].edge}"]`).count()) === 1, 'its arrow is the one animated');
  ok((await p.locator('.sb-dot').count()) === first.steps.length, `${first.steps.length} progress dots`);
  ok((await slideSrc())?.endsWith(`/${slideNo(first.steps[0].slide)}.webp`), `the slide window shows slide ${slideNo(first.steps[0].slide)}`);
  ok(await p.locator('.slide-viewer img').evaluate((i) => i.complete && i.naturalWidth > 0), 'the slide image loads');

  // stepping with the button and the arrow keys; the slide follows
  await p.locator('.sb-btn.primary').click();
  await p.waitForTimeout(300);
  ok((await title()).includes(first.steps[1].title), 'Next goes to step 2');
  await p.keyboard.press('ArrowRight');
  await p.waitForTimeout(300);
  ok((await title()).includes(first.steps[2].title), '→ goes to step 3');
  ok((await slideSrc())?.endsWith(`/${slideNo(first.steps[2].slide)}.webp`), `the slide follows the step (slide ${slideNo(first.steps[2].slide)})`);
  await p.keyboard.press('ArrowLeft');
  await p.waitForTimeout(300);
  ok((await title()).includes(first.steps[1].title), '← goes back');

  // the slide window: browse, zoom, move, resize, hide and show again
  const n0 = slideNo(first.steps[1].slide);
  await p.click('.slide-viewer [aria-label="Next slide"]');
  ok((await slideSrc())?.endsWith(`/${n0 + 1}.webp`) && (await p.locator('.sv-back').count()) === 1, 'the slide window browses the deck, with "Back to step"');
  await p.click('.sv-back');
  ok((await slideSrc())?.endsWith(`/${n0}.webp`), '"Back to step" returns to the step’s slide');
  const body = await p.locator('.sv-body').boundingBox();
  await p.mouse.move(body.x + body.width / 2, body.y + body.height / 2);
  await p.mouse.wheel(0, -400);
  await p.waitForTimeout(100);
  ok(/scale\((?!1\))/.test(await p.locator('.slide-viewer img').getAttribute('style') ?? ''), 'the wheel zooms the slide');
  const box0 = await p.locator('.slide-viewer').boundingBox();
  const head = await p.locator('.sv-title').boundingBox();
  await p.mouse.move(head.x + 10, head.y + 8);
  await p.mouse.down();
  await p.mouse.move(head.x + 310, head.y + 108, { steps: 6 });
  await p.mouse.up();
  const box1 = await p.locator('.slide-viewer').boundingBox();
  ok(Math.abs(box1.x - box0.x - 300) < 4 && Math.abs(box1.y - box0.y - 100) < 4, 'dragging the header moves the window');
  const grip = await p.locator('.sv-resize').boundingBox();
  await p.mouse.move(grip.x + grip.width / 2, grip.y + grip.height / 2);
  await p.mouse.down();
  await p.mouse.move(grip.x + 120, grip.y + 70, { steps: 6 });
  await p.mouse.up();
  const box2 = await p.locator('.slide-viewer').boundingBox();
  ok(box2.width > box1.width + 100, `dragging the corner resizes it (${Math.round(box1.width)} → ${Math.round(box2.width)} px)`);
  await p.click('.slide-viewer [aria-label="Hide the slide"]');
  ok(!(await p.locator('.slide-viewer').count()), '✕ hides the slide');
  await p.locator('.sb-meta .sb-chip').last().click();
  ok(await p.locator('.slide-viewer').isVisible(), 'the slide chip shows it again');

  // details still open from the study card, and Escape closes them before it leaves study mode
  const enzChip = p.locator('.sb-chip.enz');
  if (!(await enzChip.count())) await p.locator('.sb-btn.primary').click();
  await p.waitForTimeout(200);
  await p.locator('.sb-chip.enz').click();
  await p.waitForTimeout(300);
  ok(await p.locator('.drawer').isVisible(), 'the enzyme chip opens its details');
  ok(await p.locator('.study-bar.beside').isVisible(), 'the study card moves beside the drawer');
  await p.keyboard.press('Escape');
  await p.waitForTimeout(200);
  ok(!(await p.locator('.drawer').count()) && (await p.locator('.study-bar').count()) === 1, 'Escape closes the drawer and keeps study mode');

  // finish: complete screen, remembered as done
  for (let i = 0; i < first.steps.length + 1 && !(await p.locator('.sb-done').count()); i++) {
    await p.locator('.sb-btn.primary').click();
    await p.waitForTimeout(120);
  }
  ok(await p.locator('.sb-done').isVisible(), 'finishing shows "Chapter complete"');
  ok((await p.evaluate(() => localStorage.getItem('atlas-study')))?.includes(first.id), 'the chapter is remembered as done');
  await p.keyboard.press('Escape');
  await p.waitForTimeout(200);
  ok(!(await p.locator('.study-bar').count()), 'Escape leaves study mode');
  await p.click('button.study-btn');
  ok((await p.locator('.st-chapter').first().locator('.tick').count()) === 1, 'the list ticks the finished chapter');

  ok(errors.length === 0, `no page errors${errors.length ? ': ' + errors.join(' | ') : ''}`);
  await ctx.close();
}
