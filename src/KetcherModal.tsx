import { useEffect, useRef, useState } from 'react';
import { Editor } from 'ketcher-react';
import 'ketcher-react/dist/index.css';
import { StandaloneStructServiceProvider } from 'ketcher-standalone';

const provider = new StandaloneStructServiceProvider();

/**
 * Full Ketcher editor in a modal. This whole file (Ketcher + the Indigo engine, ~29 MB) is code-split and only loaded
 * when someone presses "Edit in Ketcher". Once mounted it is kept mounted (hidden): unmounting a Ketcher editor
 * clears its global editor reference, which breaks its own key handlers.
 */
export default function KetcherModal({ target, onClose }: { target: { title: string; smiles: string } | null; onClose: () => void }) {
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
