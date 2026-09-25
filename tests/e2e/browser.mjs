import { chromium } from 'playwright-core';

/**
 * Starts Chromium for the browser tests: $CHROMIUM_PATH when set, otherwise the installed Google Chrome, otherwise
 * Playwright's own build (install it once with `npx playwright-core install chromium`). HEADED=1 shows the window.
 */
export async function launch() {
  const headless = !process.env.HEADED;
  const tries = [
    ...(process.env.CHROMIUM_PATH ? [{ executablePath: process.env.CHROMIUM_PATH }] : []),
    { channel: 'chrome' },
    {},
  ];
  const errors = [];
  for (const opts of tries) {
    try { return await chromium.launch({ headless, ...opts }); } catch (e) { errors.push(String(e.message).split('\n')[0]); }
  }
  throw new Error(['No browser could be started. Install Google Chrome, run "npx playwright-core install chromium", or set CHROMIUM_PATH.', ...errors].join('\n  '));
}
