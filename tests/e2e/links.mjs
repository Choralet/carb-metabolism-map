// Deep links and browser history. Run through run.mjs (`npm run test:e2e`).
import { desktopScene } from '../../src/data/scene.ts';

const plate22 = desktopScene.regions.find((r) => r.plate === 22);

export default async function links({ browser, base, check: ok }) {
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, permissions: ['clipboard-read', 'clipboard-write'] });
  await ctx.addInitScript(() => localStorage.setItem('atlas-scope', 'mid'));
  const p = await ctx.newPage();
  const errors = [];
  p.on('pageerror', (e) => errors.push(e.message));
  const view = async (page = p) => (await page.locator('svg[data-lod]').getAttribute('viewBox')).split(' ').map(Number);
  const drawerTitle = () => p.locator('.drawer h2').innerText().catch(() => '');

  // a link to a final-exam enzyme, opened while the stored scope is Midterm
  await p.goto(`${base}#enz/n_gs`, { waitUntil: 'networkidle' });
  await p.waitForSelector('svg[data-lod]');
  ok((await drawerTitle()) === 'Glutamine synthetase', 'a link opens the drawer on its enzyme');
  ok(/Both/.test(await p.locator('.scope [aria-checked="true"]').innerText()), 'a link into a faded exam widens the scope to Both');
  const [x, y, w, h] = await view();
  const cx = x + w / 2, cy = y + h / 2;
  ok(cx > plate22.x && cx < plate22.x + plate22.w && cy > plate22.y && cy < plate22.y + plate22.h, `the camera centres on Plate 22 (${Math.round(cx)}, ${Math.round(cy)})`);
  ok(/Glutamine synthetase · Metabolism Atlas/.test(await p.title()), 'the page title names the selection');

  // closing a directly opened link clears the hash (no history entry was pushed for it)
  await p.getByRole('button', { name: 'Close details' }).click();
  await p.waitForTimeout(200);
  ok(!(await p.locator('.drawer').count()) && !new URL(p.url()).hash, `closing clears the hash (${p.url()})`);

  // opening from the bare map pushes one entry: Back closes, Forward reopens
  await p.keyboard.press('/'); await p.keyboard.type('arginase'); await p.waitForTimeout(150); await p.keyboard.press('Enter');
  await p.waitForTimeout(700);
  ok(new URL(p.url()).hash === '#enz/n_arginase', `selecting updates the URL (${new URL(p.url()).hash})`);
  await p.goBack(); await p.waitForTimeout(300);
  ok(!(await p.locator('.drawer').count()), 'Back closes the drawer');
  await p.goForward(); await p.waitForTimeout(700);
  ok((await drawerTitle()) === 'Arginase', 'Forward reopens it');

  // moving to another selection replaces that entry, so one Back still closes the drawer
  await p.keyboard.press('/'); await p.keyboard.type('ornithine transcarb'); await p.waitForTimeout(150); await p.keyboard.press('Enter');
  await p.waitForTimeout(500);
  await p.goBack(); await p.waitForTimeout(300);
  ok(!(await p.locator('.drawer').count()), 'after moving between selections, one Back closes the drawer');

  // copy link: selection plus the current view, and opening it frames the same view
  await p.goForward(); await p.waitForTimeout(600);
  await p.getByRole('button', { name: /Copy a link/ }).click();
  await p.waitForTimeout(200);
  const copied = await p.evaluate(() => navigator.clipboard.readText());
  ok(/#enz\/n_otc@-?\d+,-?\d+,\d+$/.test(copied), `the copied link has the selection and the view (${new URL(copied).hash})`);
  const p2 = await ctx.newPage();
  await p2.goto(copied, { waitUntil: 'networkidle' }); await p2.waitForSelector('svg[data-lod]');
  const a = await view(), b = await view(p2);
  ok(Math.abs(a[0] + a[2] / 2 - (b[0] + b[2] / 2)) < 3 && Math.abs(a[2] - b[2]) < 3, 'opening the copied link frames the same view');

  // an unknown id just opens the map
  const p3 = await ctx.newPage();
  await p3.goto(`${base}#enz/does_not_exist`, { waitUntil: 'networkidle' }); await p3.waitForSelector('svg[data-lod]');
  ok(!(await p3.locator('.drawer').count()), 'an unknown id is ignored');

  ok(errors.length === 0, `no page errors${errors.length ? ': ' + errors.join(' | ') : ''}`);
  await ctx.close();
}
