import { CloseIcon } from './icons';

/** Shown over the big-picture page: what it is, how to use it, and the way back to the detailed map. */
export default function OverviewBar({ phone, onClose }: { phone: boolean; onClose: () => void }) {
  return (
    <div className="ov-bar" role="region" aria-label="The big picture">
      <div className="ov-text">
        <b>The big picture</b>
        <span>{phone ? 'Final exam. Tap a compound to open it on the detailed map.' : 'Final exam: lipids and nitrogen compounds. Click a compound to see it on the detailed map.'}</span>
      </div>
      <button className="sb-btn primary" onClick={onClose}>Detailed map</button>
      <button className="icon-btn" onClick={onClose} aria-label="Close the big picture"><CloseIcon /></button>
    </div>
  );
}
