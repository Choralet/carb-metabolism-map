import type { QuizKind } from '../quiz';
import { Rich } from '../rich';
import { EyeIcon, ResetIcon } from './icons';

const kindChips: { id: QuizKind; label: string; hint: string }[] = [
  { id: 'enz', label: 'Enzymes', hint: 'Hide every enzyme name' },
  { id: 'met', label: 'Metabolites', hint: 'Hide every metabolite name (substrates and products)' },
  { id: 'tag', label: 'Cofactors', hint: 'Hide the cofactor labels on the arrows, such as ATP → ADP or − H₂O' },
];

/** What the quiz covers: everything in the scope, one plate, or the deck of items missed before. */
export type Where = { kind: 'scope' } | { kind: 'plate'; plate: string; title: string; no: number } | { kind: 'missed' };

interface Props {
  kinds: Set<QuizKind>; onKind: (k: QuizKind) => void;
  where: Where; onWhere: (w: 'scope' | 'plate' | 'missed') => void;
  counts: { ok: number; miss: number; seen: number; total: number };
  missedDeck: number;
  scopeNote: string;
  onRevealAll: () => void; onReset: () => void;
}

export default function QuizBar({ kinds, onKind, where, onWhere, counts, missedDeck, scopeNote, onRevealAll, onReset }: Props) {
  const done = counts.ok + counts.miss + counts.seen;
  const left = counts.total - done;
  const pct = (n: number) => `${counts.total ? (n / counts.total) * 100 : 0}%`;
  return (
    <div className="quizbar" role="group" aria-label="Quiz controls">
      <span className="qb-label">Hide</span>
      {kindChips.map((k) => (
        <button key={k.id} className={`qchip-btn${kinds.has(k.id) ? ' on' : ''}`} onClick={() => onKind(k.id)} title={k.hint} aria-pressed={kinds.has(k.id)}>{k.label}</button>
      ))}
      <span className="qb-label">On</span>
      <span className="qb-seg" role="radiogroup" aria-label="What to quiz">
        <button role="radio" aria-checked={where.kind === 'scope'} className={where.kind === 'scope' ? 'on' : ''} onClick={() => onWhere('scope')} title={`Everything on the ${scopeNote}`}>All</button>
        <button role="radio" aria-checked={where.kind === 'plate'} className={where.kind === 'plate' ? 'on' : ''} onClick={() => onWhere('plate')} title="Only the plate in the middle of the screen">
          {where.kind === 'plate' ? <>Plate {where.no}</> : 'This plate'}
        </button>
        <button role="radio" aria-checked={where.kind === 'missed'} className={where.kind === 'missed' ? 'on' : ''} onClick={() => onWhere('missed')} disabled={!missedDeck && where.kind !== 'missed'}
          title="Everything you answered wrong last time; a right answer takes it out of the deck">Missed <b>{missedDeck}</b></button>
      </span>
      <span className="qb-progress" aria-live="polite">
        <span className="qb-n ok" title="Right">✓ {counts.ok}</span>
        <span className="qb-n miss" title="Missed">✗ {counts.miss}</span>
        <span className="qb-n" title="Still hidden">{left} left</span>
        <span className="qb-bar" aria-hidden="true"><i className="ok" style={{ width: pct(counts.ok) }} /><i className="miss" style={{ width: pct(counts.miss) }} /><i style={{ width: pct(counts.seen) }} /></span>
      </span>
      {where.kind === 'plate' && <span className="qb-scope"><Rich s={where.title} /></span>}
      <button className="qb-btn" onClick={onRevealAll}><EyeIcon /> Reveal all</button>
      <button className="qb-btn" onClick={onReset} title="Hide these again (the missed deck is kept)"><ResetIcon /> Reset</button>
    </div>
  );
}
