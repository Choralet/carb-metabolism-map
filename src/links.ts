import type { Selection, View } from './Diagram';

/**
 * Deep links live in the URL hash, so they work on static hosting and survive the offline cache:
 *   #enz/cs · #mol/lb_facoa · #card/l_c_yield · #reg/r_l_acc · #plate/23
 * with an optional camera view appended: #enz/cs@1650,2400,900 (centre x, centre y, width in map units). The
 * centre, not the corner, so the link frames the same spot on a screen of any shape.
 */
const WORD = { enz: 'enz', node: 'mol', card: 'card', reg: 'reg' } as const;
const KIND: Record<string, NonNullable<Selection>['kind']> = { enz: 'enz', mol: 'node', card: 'card', reg: 'reg' };

export interface Link { sel: Selection; plate?: number; view?: View }

export function toHash(sel: Selection, view?: View): string {
  const at = view ? `@${Math.round(view.x + view.w / 2)},${Math.round(view.y + view.h / 2)},${Math.round(view.w)}` : '';
  return sel ? `#${WORD[sel.kind]}/${encodeURIComponent(sel.id)}${at}` : at ? `#${at}` : '';
}

export function parseHash(hash: string): Link | null {
  const m = /^#?([a-z]+)?\/?([^@]*)(?:@(-?\d+),(-?\d+),(\d+))?$/.exec(hash);
  if (!m || (!m[1] && !m[3])) return null;
  // a flat 1-unit height: the camera grows a view to the screen's shape, so this keeps the width exactly
  const w = +(m[5] ?? 0), h = 1;
  const view = m[3] ? { x: +m[3] - w / 2, y: +m[4] - h / 2, w, h } : undefined;
  if (m[1] === 'plate') return { sel: null, plate: +m[2], view };
  if (m[1] && KIND[m[1]] && m[2]) return { sel: { kind: KIND[m[1]], id: decodeURIComponent(m[2]) }, view };
  return view ? { sel: null, view } : null;
}

/** The camera as the map currently shows it (the SVG's viewBox is the single source of truth). */
export function currentView(): View | undefined {
  const vb = document.querySelector('svg[data-lod]')?.getAttribute('viewBox')?.split(' ').map(Number);
  return vb && vb.length === 4 ? { x: vb[0], y: vb[1], w: vb[2], h: vb[3] } : undefined;
}

/** Copy text, falling back to a prompt where the clipboard API is unavailable (non-secure origins, old browsers). */
export async function copyText(text: string): Promise<boolean> {
  try { await navigator.clipboard.writeText(text); return true; } catch { window.prompt('Copy this link:', text); return false; }
}
