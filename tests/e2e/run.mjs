// Browser tests against the production build: serves dist/ with `vite preview`, runs every suite in one Chromium,
// prints PASS/FAIL per check and exits non-zero if anything failed.
//   npm run build && npm run test:e2e        HEADED=1 to watch · CHROMIUM_PATH=/path/to/chrome to pick a browser
import { existsSync } from 'node:fs';
import { preview } from 'vite';
import { launch } from './browser.mjs';
import smoke from './smoke.mjs';
import links from './links.mjs';

const suites = [['smoke', smoke], ['deep links', links]];

if (!existsSync(new URL('../../dist/index.html', import.meta.url))) {
  console.error('No build found: run "npm run build" first.');
  process.exit(1);
}

const server = await preview({ preview: { port: 4173, strictPort: false }, logLevel: 'warn' });
const base = server.resolvedUrls.local[0];
let browser;
let failed = 0;
try {
  browser = await launch();
  for (const [name, suite] of suites) {
    console.log(`\n${name}`);
    const check = (cond, what) => { console.log(`  ${cond ? 'PASS' : 'FAIL'}  ${what}`); if (!cond) failed++; };
    try {
      await suite({ browser, base, check });
    } catch (e) {
      failed++;
      console.log(`  FAIL  stopped early: ${String(e.message).split('\n')[0]}`);
    }
  }
} finally {
  await browser?.close();
  await new Promise((done) => server.httpServer.close(done));
}
console.log(failed ? `\n${failed} FAILED` : '\nALL PASS');
process.exit(failed ? 1 : 0);
