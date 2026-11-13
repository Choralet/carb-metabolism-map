import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { CloseIcon } from './icons';

/** The final-exam decks shipped with the site (public/slides): slide 1 of each, the title slide, is left out. */
export const DECKS = { III: { dir: 'p3', first: 2, last: 47 }, IV: { dir: 'p4', first: 2, last: 38 } } as const;
export type Deck = keyof typeof DECKS;
export interface SlideRef { part: Deck; n: number }

/** "Part III · slide 26–27" → Part III, slide 26 (the first slide a citation names). */
export function slideOf(cite: string): SlideRef | null {
  const m = cite.match(/Part (IV|III) · slides? (\d+)/);
  if (!m) return null;
  const part = m[1] as Deck, n = +m[2];
  return n >= DECKS[part].first && n <= DECKS[part].last ? { part, n } : null;
}
const srcOf = (s: SlideRef) => `slides/${DECKS[s.part].dir}/${s.n}.webp`;

const HEAD = 38, ASPECT = 9 / 16, MIN_W = 220;
interface Win { x: number; y: number; w: number }

/** Window position and size per kind of screen, kept per viewer (a convenience: losing it restores the default). */
const KEY = 'atlas-slides';
function loadWin(phone: boolean): Win | null {
  try { const v = JSON.parse(localStorage.getItem(KEY) ?? '{}')[phone ? 'phone' : 'desk']; return v && [v.x, v.y, v.w].every(Number.isFinite) ? v : null; } catch { return null; }
}
function saveWin(phone: boolean, w: Win) {
  try { const all = JSON.parse(localStorage.getItem(KEY) ?? '{}'); all[phone ? 'phone' : 'desk'] = w; localStorage.setItem(KEY, JSON.stringify(all)); } catch { /* ignore */ }
}

interface Props {
  /** The slide the current step cites. The viewer follows it, until the reader browses away. */
  slide: SlideRef;
  phone: boolean;
  onClose: () => void;
  /** The window moved or changed size (the camera keeps the step clear of it). */
  onMoved?: () => void;
}

/**
 * The lecture slide beside the map: a floating window that can be dragged by its header, resized from its corner,
 * and zoomed (wheel, pinch, double-click or the buttons) and panned inside. It follows the study step's slide;
 * ◀ ▶ browse the deck, and "Back to step" returns.
 */
export default function SlideViewer({ slide, phone, onClose, onMoved }: Props) {
  const root = useRef<HTMLDivElement>(null);
  const body = useRef<HTMLDivElement>(null);
  const img = useRef<HTMLImageElement>(null);
  const [cur, setCur] = useState<SlideRef>(slide);
  useEffect(() => setCur(slide), [slide.part, slide.n]); // eslint-disable-line react-hooks/exhaustive-deps
  const away = cur.part !== slide.part || cur.n !== slide.n;

  // ── window: position and size ─────────────────────────────────────
  const bounds = () => root.current?.parentElement?.getBoundingClientRect() ?? { width: 1200, height: 800 };
  const clampWin = useCallback((w: Win): Win => {
    const b = bounds();
    const width = Math.min(Math.max(w.w, MIN_W), b.width - 16);
    const height = width * ASPECT + HEAD;
    return { w: width, x: Math.min(Math.max(w.x, 8), b.width - width - 8), y: Math.min(Math.max(w.y, 8), Math.max(8, b.height - height - 8)) };
  }, []);
  const [win, setWin] = useState<Win>(() => {
    const saved = loadWin(phone);
    if (saved) return saved;
    const W = window.innerWidth;
    return phone ? { x: W * 0.36, y: 8, w: W * 0.64 - 8 } : { x: 16, y: 16, w: Math.min(480, W * 0.34) };
  });
  useLayoutEffect(() => {
    setWin((w) => clampWin(w));
    const on = () => setWin((w) => clampWin(w));
    window.addEventListener('resize', on);
    return () => window.removeEventListener('resize', on);
  }, [clampWin]);
  const winRef = useRef(win);
  winRef.current = win;
  const done = useRef<number>(0);
  useEffect(() => {
    clearTimeout(done.current);
    done.current = window.setTimeout(() => { saveWin(phone, winRef.current); onMoved?.(); }, 250);
  }, [win, phone, onMoved]);

  const dragWin = (mode: 'move' | 'size') => (ev: React.PointerEvent) => {
    if ((ev.target as HTMLElement).closest('button') && mode === 'move') return;
    ev.preventDefault();
    const start = { px: ev.clientX, py: ev.clientY, ...winRef.current };
    const el = ev.currentTarget as HTMLElement;
    el.setPointerCapture(ev.pointerId);
    const move = (m: PointerEvent) => {
      const dx = m.clientX - start.px, dy = m.clientY - start.py;
      setWin(clampWin(mode === 'move' ? { ...start, x: start.x + dx, y: start.y + dy } : { ...start, w: start.w + Math.max(dx, dy / ASPECT) }));
    };
    const up = () => { el.removeEventListener('pointermove', move); el.removeEventListener('pointerup', up); el.removeEventListener('pointercancel', up); };
    el.addEventListener('pointermove', move);
    el.addEventListener('pointerup', up);
    el.addEventListener('pointercancel', up);
  };

  // ── zoom and pan inside the slide ─────────────────────────────────
  // Applied straight to the image's transform (like the map's camera), so zooming never re-renders.
  const z = useRef({ k: 1, x: 0, y: 0 });
  const [zoomed, setZoomed] = useState(false);
  const apply = useCallback((k: number, x: number, y: number) => {
    const b = body.current;
    if (!b) return;
    const W = b.clientWidth, H = b.clientHeight;
    k = Math.min(Math.max(k, 1), 6);
    x = Math.min(0, Math.max(W - W * k, x));
    y = Math.min(0, Math.max(H - H * k, y));
    z.current = { k, x, y };
    if (img.current) img.current.style.transform = `translate(${x}px, ${y}px) scale(${k})`;
    setZoomed(k > 1.01);
  }, []);
  const zoomAt = useCallback((f: number, cx: number, cy: number) => {
    const { k, x, y } = z.current;
    const nk = Math.min(Math.max(k * f, 1), 6), r = nk / k;
    apply(nk, cx - (cx - x) * r, cy - (cy - y) * r);
  }, [apply]);
  const centre = () => { const b = body.current!; return [b.clientWidth / 2, b.clientHeight / 2] as const; };
  useEffect(() => { apply(1, 0, 0); }, [cur.part, cur.n, win.w, apply]);

  useEffect(() => {
    const b = body.current!;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const r = b.getBoundingClientRect();
      zoomAt(Math.exp(-e.deltaY * (e.ctrlKey ? 0.01 : 0.0018)), e.clientX - r.left, e.clientY - r.top);
    };
    b.addEventListener('wheel', onWheel, { passive: false });
    return () => b.removeEventListener('wheel', onWheel);
  }, [zoomAt]);

  const ptrs = useRef(new Map<number, { x: number; y: number }>());
  const gesture = useRef<{ d: number; k: number; x: number; y: number; cx: number; cy: number; px: number; py: number } | null>(null);
  const onBodyDown = (ev: React.PointerEvent) => {
    const b = body.current!;
    b.setPointerCapture(ev.pointerId);
    const r = b.getBoundingClientRect();
    ptrs.current.set(ev.pointerId, { x: ev.clientX - r.left, y: ev.clientY - r.top });
    const pts = [...ptrs.current.values()];
    const [a, c] = [pts[0], pts[1] ?? pts[0]];
    gesture.current = { d: Math.hypot(a.x - c.x, a.y - c.y) || 1, ...z.current, cx: (a.x + c.x) / 2, cy: (a.y + c.y) / 2, px: a.x, py: a.y };
  };
  const onBodyMove = (ev: React.PointerEvent) => {
    if (!ptrs.current.has(ev.pointerId) || !gesture.current) return;
    const r = body.current!.getBoundingClientRect();
    ptrs.current.set(ev.pointerId, { x: ev.clientX - r.left, y: ev.clientY - r.top });
    const g = gesture.current, pts = [...ptrs.current.values()];
    if (pts.length >= 2) {
      const [a, c] = pts;
      const k = g.k * (Math.hypot(a.x - c.x, a.y - c.y) / g.d), f = k / g.k;
      const mx = (a.x + c.x) / 2, my = (a.y + c.y) / 2;
      apply(k, mx - (g.cx - g.x) * f, my - (g.cy - g.y) * f);
    } else {
      apply(g.k, g.x + pts[0].x - g.px, g.y + pts[0].y - g.py);
    }
  };
  const onBodyUp = (ev: React.PointerEvent) => {
    ptrs.current.delete(ev.pointerId);
    const pts = [...ptrs.current.values()];
    gesture.current = pts.length ? { d: 1, ...z.current, cx: pts[0].x, cy: pts[0].y, px: pts[0].x, py: pts[0].y } : null;
  };
  const onDouble = (ev: React.MouseEvent) => {
    const r = body.current!.getBoundingClientRect();
    if (z.current.k > 1.01) apply(1, 0, 0); else zoomAt(2.5, ev.clientX - r.left, ev.clientY - r.top);
  };

  // the neighbours are fetched ahead, so browsing is instant
  useEffect(() => {
    const d = DECKS[cur.part];
    [cur.n - 1, cur.n + 1].filter((n) => n >= d.first && n <= d.last).forEach((n) => { const i = new Image(); i.src = srcOf({ part: cur.part, n }); });
  }, [cur.part, cur.n]);

  const deck = DECKS[cur.part];
  const h = win.w * ASPECT;
  return (
    <div ref={root} className="slide-viewer" style={{ left: win.x, top: win.y, width: win.w }} role="dialog" aria-label={`Lecture slide: Part ${cur.part}, slide ${cur.n}`}>
      <div className="sv-head" onPointerDown={dragWin('move')} title="Drag to move">
        <span className="sv-grip" aria-hidden="true">⠿</span>
        <span className="sv-title">{phone ? <>Slide {cur.n}</> : <><b>Part {cur.part}</b> · slide {cur.n}</>}</span>
        <span className="sv-tools">
          {away && <button className="sv-back" onClick={() => setCur(slide)} title="Back to this step's slide">Back to step</button>}
          <button className="sv-btn" onClick={() => setCur({ part: cur.part, n: cur.n - 1 })} disabled={cur.n <= deck.first} aria-label="Previous slide">‹</button>
          <button className="sv-btn" onClick={() => setCur({ part: cur.part, n: cur.n + 1 })} disabled={cur.n >= deck.last} aria-label="Next slide">›</button>
          {!phone && (
            <>
              <button className="sv-btn" onClick={() => zoomAt(1 / 1.5, ...centre())} disabled={!zoomed} aria-label="Zoom out">−</button>
              <button className="sv-btn" onClick={() => zoomAt(1.5, ...centre())} aria-label="Zoom in">+</button>
            </>
          )}
          <button className="sv-btn" onClick={onClose} aria-label="Hide the slide"><CloseIcon /></button>
        </span>
      </div>
      <div ref={body} className={`sv-body${zoomed ? ' zoomed' : ''}`} style={{ height: h }}
        onPointerDown={onBodyDown} onPointerMove={onBodyMove} onPointerUp={onBodyUp} onPointerCancel={onBodyUp} onDoubleClick={onDouble}>
        <img ref={img} key={`${cur.part}-${cur.n}`} src={srcOf(cur)} alt={`Part ${cur.part}, slide ${cur.n}`} draggable={false} width={1920} height={1080} />
        {!zoomed && <span className="sv-hint" aria-hidden="true">{phone ? 'Pinch to zoom' : 'Scroll or double-click to zoom'}</span>}
      </div>
      <div className="sv-resize" onPointerDown={dragWin('size')} title="Drag to resize" aria-hidden="true" />
    </div>
  );
}
