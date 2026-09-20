import { useEffect, useRef, useState } from 'react';
import { Editor } from 'ketcher-react';
import 'ketcher-react/dist/index.css';
import { StandaloneStructServiceProvider } from 'ketcher-standalone';

const provider = new StandaloneStructServiceProvider();

let resolveKetcher: (k: any) => void = () => {};
const ketcherReady = new Promise<any>((r) => { resolveKetcher = r; });

/** Ketcher's Indigo engine is driven through one hidden Editor instance; images are rendered serially. */
export function KetcherHost() {
  const host = useRef<HTMLDivElement>(null);
  // the off-screen editor must never take focus, or it swallows the page's keyboard shortcuts
  useEffect(() => { host.current?.setAttribute('inert', ''); }, []);
  return (
    <div className="ketcher-host" ref={host} aria-hidden>
      <Editor
        staticResourcesUrl=""
        structServiceProvider={provider as any}
        errorHandler={() => {}}
        onInit={(k: any) => resolveKetcher(k)}
      />
    </div>
  );
}

const cache = new Map<string, Promise<string>>();
let chain: Promise<unknown> = Promise.resolve();

/** Ketcher prints a "Chiral" caption when the molfile chiral flag is set; drop it for cleaner thumbnails. */
function withoutChiralFlag(molfile: string): string {
  const lines = molfile.split('\n');
  if (lines[3]?.includes('V2000')) lines[3] = lines[3].slice(0, 12) + '  0' + lines[3].slice(15);
  return lines.join('\n').replace(/(M {2}V30 COUNTS \d+ \d+ \d+ \d+ )1/, '$10');
}

/** Scale the SVG's intrinsic size up so thumbnails read well; CSS caps it at the card width. */
function enlarge(svg: string, factor = 1.6): string {
  const el = new DOMParser().parseFromString(svg, 'image/svg+xml').documentElement;
  for (const a of ['width', 'height']) { const v = parseFloat(el.getAttribute(a) ?? ''); if (v) el.setAttribute(a, String(v * factor)); }
  return el.outerHTML;
}

/** Render a SMILES string to an SVG string with Ketcher (cached). */
export function renderSmiles(smiles: string): Promise<string> {
  const hit = cache.get(smiles);
  if (hit) return hit;
  const p = new Promise<string>((resolve, reject) => {
    chain = chain.then(async () => {
      try {
        const k = await ketcherReady;
        await k.setMolecule(smiles);
        const molfile = withoutChiralFlag(await k.getMolfile());
        const blob: Blob = await k.generateImage(molfile, { outputFormat: 'svg' });
        resolve(enlarge(await blob.text()));
      } catch (e) { cache.delete(smiles); reject(e); }
    });
  });
  cache.set(smiles, p);
  return p;
}

/**
 * Full Ketcher editor in a modal. Mounted lazily on first open and then kept mounted (hidden):
 * unmounting a Ketcher editor clears its global editor reference, which breaks its own key handlers.
 */
export function KetcherModal({ target, onClose }: { target: { title: string; smiles: string } | null; onClose: () => void }) {
  const kref = useRef<any>(null);
  const latest = useRef(target);
  latest.current = target;
  const [mounted, setMounted] = useState(false);

  useEffect(() => { if (target) setMounted(true); }, [target]);
  useEffect(() => { if (target && kref.current) kref.current.setMolecule(target.smiles); }, [target]);
  useEffect(() => {
    if (!target) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [target, onClose]);

  if (!mounted) return null;
  return (
    <div className={`modal-back${target ? '' : ' hidden'}`} onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()} role="dialog" aria-label="Edit molecule in Ketcher">
        <div className="modal-head">
          <strong>{target?.title}</strong><span className="muted"> · editable in Ketcher</span>
          <button className="icon-btn" onClick={onClose} aria-label="Close">✕</button>
        </div>
        <div className="modal-body">
          <Editor
            staticResourcesUrl=""
            structServiceProvider={provider as any}
            errorHandler={() => {}}
            onInit={(k: any) => { kref.current = k; if (latest.current) k.setMolecule(latest.current.smiles); }}
          />
        </div>
      </div>
    </div>
  );
}
