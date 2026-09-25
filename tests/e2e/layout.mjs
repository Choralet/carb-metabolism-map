// Layout check: no text on the map may overlap other text, or cross an arrow it does not belong to. Run through
// run.mjs (`npm run test:e2e`). Everything is measured at reading zoom ('near'), in map units, from the browser's
// own text layout, so it catches what a screenshot would show. A failure names both parties and where.
export default async function layout({ browser, base, check: ok }) {
  const ctx = await browser.newContext({ viewport: { width: 1600, height: 1000 } });
  await ctx.addInitScript(() => localStorage.setItem('atlas-scope', 'both'));
  const p = await ctx.newPage();
  await p.goto(base, { waitUntil: 'networkidle' });
  await p.waitForSelector('svg[data-lod]');
  await p.waitForTimeout(300);

  const found = await p.evaluate(() => {
    const svg = document.querySelector('svg[data-lod]');
    svg.setAttribute('data-lod', 'near');
    const inv = svg.getScreenCTM().inverse();
    /** An element's box in map units. */
    const box = (el) => {
      const bb = el.getBBox(), m = inv.multiply(el.getScreenCTM());
      const xs = [bb.x, bb.x + bb.width].flatMap((x) => [bb.y, bb.y + bb.height].map((y) => m.a * x + m.c * y + m.e));
      const ys = [bb.x, bb.x + bb.width].flatMap((x) => [bb.y, bb.y + bb.height].map((y) => m.b * x + m.d * y + m.f));
      return { x0: Math.min(...xs), y0: Math.min(...ys), x1: Math.max(...xs), y1: Math.max(...ys) };
    };
    /** What a piece of text belongs to: an arrow, a node, or another drawn group. */
    const owner = (el) => {
      const e = el.closest('[data-edge]'); if (e) return `arrow ${e.getAttribute('data-edge')}`;
      const n = el.closest('[data-node]'); if (n) return `node ${n.getAttribute('data-node')}`;
      return (el.closest('g')?.getAttribute('class') ?? '').split(' ')[0];
    };
    const texts = [];
    svg.querySelectorAll('text').forEach((t) => {
      if (!t.textContent.trim() || t.closest('.far-only, .far-title, .plate-tabt')) return;
      if (getComputedStyle(t).display === 'none') return;
      const b = box(t);
      if (b.x1 - b.x0 >= 1) texts.push({ ...b, text: t.textContent.slice(0, 36), own: owner(t) });
    });
    const segs = [];
    svg.querySelectorAll('[data-edge] path.shaft, [data-edge] path.feedline').forEach((path) => {
      const own = `arrow ${path.closest('[data-edge]').getAttribute('data-edge')}`;
      const d = path.getAttribute('d');
      const pts = [...d.matchAll(/(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/g)].map((m) => [+m[1], +m[2]]);
      if (d.includes('Q')) { // a curved side arrow: sample the quadratic
        const [a, c, e] = pts;
        const q = (t) => [0, 1].map((k) => (1 - t) ** 2 * a[k] + 2 * (1 - t) * t * c[k] + t * t * e[k]);
        for (let i = 0; i < 8; i++) segs.push({ a: q(i / 8), b: q((i + 1) / 8), own });
      } else for (let i = 1; i < pts.length; i++) segs.push({ a: pts[i - 1], b: pts[i], own });
    });
    const overlap = (a, b, m) => a.x0 + m < b.x1 && b.x0 + m < a.x1 && a.y0 + m < b.y1 && b.y0 + m < a.y1;
    /** Liang–Barsky: does the segment enter the box? */
    const crosses = (s, b) => {
      const [x1, y1] = s.a, dx = s.b[0] - x1, dy = s.b[1] - y1;
      let t0 = 0, t1 = 1;
      for (const [pp, qq] of [[-dx, x1 - b.x0], [dx, b.x1 - x1], [-dy, y1 - b.y0], [dy, b.y1 - y1]]) {
        if (pp === 0) { if (qq < 0) return false; continue; }
        const r = qq / pp;
        if (pp < 0) { if (r > t1) return false; t0 = Math.max(t0, r); } else { if (r < t0) return false; t1 = Math.min(t1, r); }
      }
      return t0 <= t1;
    };
    const out = [];
    texts.forEach((a, i) => {
      for (const b of texts.slice(i + 1)) if (a.own !== b.own && overlap(a, b, 1.5)) out.push(`"${a.text}" (${a.own}) overlaps "${b.text}" (${b.own}) at ${Math.round(a.x0)},${Math.round(a.y0)}`);
      const inner = { x0: a.x0 + 1.5, y0: a.y0 + 2, x1: a.x1 - 1.5, y1: a.y1 - 2 };
      for (const s of segs) if (s.own !== a.own && crosses(s, inner)) out.push(`"${a.text}" (${a.own}) is crossed by ${s.own} at ${Math.round(a.x0)},${Math.round(a.y0)}`);
    });
    return { texts: texts.length, segs: segs.length, out: [...new Set(out)] };
  });

  ok(found.texts > 800 && found.segs > 400, `measured ${found.texts} labels and ${found.segs} arrow segments`);
  ok(found.out.length === 0, found.out.length ? `no label collides with another label or an arrow:\n      ${found.out.slice(0, 20).join('\n      ')}` : 'no label collides with another label or an arrow');
  await ctx.close();
}
