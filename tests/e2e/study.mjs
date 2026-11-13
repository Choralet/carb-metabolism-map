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
  ok(first.steps[0].edge ? (await p.locator(`g.eline.now[data-edge="${first.steps[0].edge}"]`).count()) === 1
    : (await p.locator('g.eline.now').count()) === 0, 'step 1 animates its own arrow, or none for a molecule step');
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

  // history: entering pushes one entry, a drawer stacks on top, Back closes it and then leaves study mode
  const box = tours.find((t) => t.id === 't_l_box');
  await p.goto(base, { waitUntil: 'networkidle' });
  await p.waitForSelector('svg[data-lod]');
  await p.click('button.study-btn');
  await p.locator('.st-chapter', { hasText: box.title }).click();
  await p.waitForTimeout(400);
  await p.keyboard.press('ArrowRight');
  await p.waitForTimeout(300);
  ok(new URL(p.url()).hash === `#study/${box.id}/${box.steps[1].id}`, `the URL names the chapter and step (${new URL(p.url()).hash})`);
  await p.locator('.sb-chip.enz').click();
  await p.waitForTimeout(300);
  await p.goBack(); await p.waitForTimeout(400);
  ok(!(await p.locator('.drawer').count()) && (await title()).includes(box.steps[1].title), 'Back closes a drawer opened from study mode and stays on the step');
  ok(new URL(p.url()).hash === `#study/${box.id}/${box.steps[1].id}`, 'the URL is back on the step');
  await p.goBack(); await p.waitForTimeout(400);
  ok(!(await p.locator('.study-bar').count()) && !new URL(p.url()).hash, 'Back again leaves study mode');

  // resume: the list offers the step the reader left at
  await p.click('button.study-btn');
  ok(/Continue: .* · step 2/.test(await p.locator('.st-resume').innerText()), 'the list offers "Continue" at the step left off');
  await p.click('.st-resume');
  await p.waitForTimeout(300);
  ok((await title()).includes(box.steps[1].title), '"Continue" reopens that step');
  await p.keyboard.press('Escape');
  await p.waitForTimeout(300);

  // a #study link opens its chapter at its step
  const p2 = await ctx.newPage();
  await p2.goto(`${base}#study/${box.id}/${box.steps[3].id}`, { waitUntil: 'networkidle' });
  await p2.waitForSelector('.study-bar');
  ok((await p2.locator('.sb-title').innerText()).includes(box.steps[3].title), `a #study link opens its step ("${box.steps[3].title}")`);
  ok(/β-Oxidation: one round · Study/.test(await p2.title()), 'the page title names the chapter');
  await p2.close();

  // outside study mode: a citation opens its slide, and the drawer and Plates panel lead into study mode
  await p.goto(`${base}#enz/l_acd`, { waitUntil: 'networkidle' });
  await p.waitForSelector('.drawer');
  await p.locator('.drawer .cite-slide').first().click();
  await p.waitForTimeout(300);
  ok((await slideSrc())?.endsWith('/13.webp'), 'a slide number in the details opens that slide');
  await p.locator('.drawer .study-link').click();
  await p.waitForTimeout(500);
  ok((await title()).includes(box.steps[0].title), '"Study this step" opens study mode at the enzyme’s step');
  await p.keyboard.press('Escape');
  await p.waitForTimeout(300);
  await p.click('button[title="Plates (table of contents)"]');
  await p.locator('.toc-study button', { hasText: 'Building palmitate' }).click();
  await p.waitForTimeout(500);
  ok(/Building palmitate/.test(await p.locator('.sb-chapter').innerText()), 'the Plates panel starts a plate’s chapter');

  ok(errors.length === 0, `no page errors${errors.length ? ': ' + errors.join(' | ') : ''}`);
  await ctx.close();

  // leaving study mode always leaves it, however the history got there
  const h = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const r = await h.newPage();
  r.on('pageerror', (e) => errors.push(e.message));
  const studying = async () => (await r.locator('.study-bar').count()) === 1;
  const leave = async (how) => { if (how === 'x') await r.click('.study-bar [aria-label="Leave study mode"]'); else await r.keyboard.press('Escape'); await r.waitForTimeout(400); };
  // 1. enter → Back → Forward → ✕
  await r.goto(base, { waitUntil: 'networkidle' });
  await r.click('button.study-btn');
  await r.locator('.st-chapter', { hasText: box.title }).click();
  await r.waitForTimeout(300);
  await r.goBack(); await r.waitForTimeout(300);
  ok(!(await studying()), 'Back leaves study mode');
  await r.goForward(); await r.waitForTimeout(500);
  ok(await studying(), 'Forward returns to it');
  await leave('x');
  ok(!(await studying()) && !new URL(r.url()).hash, '…and ✕ then leaves for good');
  // 2. in study, a drawer, then "Study this step" (no second study entry), then ✕
  await r.click('button.study-btn');
  await r.locator('.st-chapter', { hasText: box.title }).click();
  await r.waitForTimeout(300);
  await r.locator('.sb-chip.enz').click();
  await r.waitForTimeout(300);
  await r.locator('.drawer .study-link').click();
  await r.waitForTimeout(500);
  ok(await studying() && !(await r.locator('.drawer').count()), '"Study this step" from a drawer in study mode stays in study mode');
  await leave('x');
  ok(!(await studying()) && !new URL(r.url()).hash, '…and ✕ then leaves it');
  // 3. a #study link, a drawer from a chip, then ✕
  await r.goto(`${base}#study/${box.id}/${box.steps[1].id}`, { waitUntil: 'networkidle' });
  await r.waitForSelector('.study-bar');
  await r.locator('.sb-chip.enz').click();
  await r.waitForTimeout(300);
  await leave('x');
  ok(!(await studying()) && !(await r.locator('.drawer').count()) && !new URL(r.url()).hash, 'a #study link with a drawer open: ✕ leaves study mode');

  // a slide cited in the details is shown for that step only
  await r.goto(`${base}#study/${box.id}/${box.steps[0].id}`, { waitUntil: 'networkidle' });
  await r.waitForSelector('.study-bar');
  await r.locator('.sb-chip.enz').click();
  await r.waitForTimeout(300);
  await r.locator('.drawer .cite-slide').last().click();
  const cited = await r.locator('.slide-viewer img').getAttribute('src');
  await r.keyboard.press('Escape'); await r.waitForTimeout(200);
  await r.click('.slide-viewer [aria-label="Hide the slide"]');
  await r.keyboard.press('ArrowRight'); await r.waitForTimeout(300);
  await r.locator('.sb-meta .sb-chip').last().click(); await r.waitForTimeout(200);
  const src2 = await r.locator('.slide-viewer img').getAttribute('src');
  ok(src2.endsWith(`/${slideNo(box.steps[1].slide)}.webp`), `after moving on, the window shows the new step’s slide, not the cited one (${cited.split('/').pop()} → ${src2.split('/').pop()})`);

  // "Save all" really fills the offline cache
  await r.click('button.study-btn');
  await r.locator('.st-offline .sb-btn').click();
  await r.locator('.st-offline .ok').waitFor({ timeout: 30000 });
  const inCache = await r.evaluate(async () => (await (await caches.open('slides')).keys()).length);
  ok(inCache >= 83, `"Save all" puts every slide in the offline cache (${inCache})`);
  await h.close();

  // a phone: two fingers pinch-zoom the slide
  const ph = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  const q = await ph.newPage();
  await q.goto(`${base}#study/${first.id}/${first.steps[0].id}`, { waitUntil: 'networkidle' });
  await q.waitForSelector('.sv-body');
  const b = await q.locator('.sv-body').boundingBox();
  const cdp = await ph.newCDPSession(q);
  const cx = b.x + b.width / 2, cy = b.y + b.height / 2;
  const pts = (d) => [{ x: cx - d, y: cy, id: 1 }, { x: cx + d, y: cy, id: 2 }];
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: pts(10) });
  for (const d of [20, 35, 50, 65]) await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: pts(d) });
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  await q.waitForTimeout(150);
  const k = await q.locator('.slide-viewer img').evaluate((i) => new DOMMatrix(getComputedStyle(i).transform).a);
  ok(k > 2, `pinching zooms the slide on a phone (×${k.toFixed(1)})`);
  ok(await q.locator('.slide-viewer [aria-label="Zoom in"]').isVisible(), 'phones get zoom buttons too');
  await ph.close();
}
