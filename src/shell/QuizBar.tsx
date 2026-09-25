import type { QuizKind } from '../quiz';
import { EyeIcon, ResetIcon } from './icons';

const kindChips: { id: QuizKind; label: string; hint: string }[] = [
  { id: 'enz', label: 'Enzymes', hint: 'Hide every enzyme name' },
  { id: 'met', label: 'Metabolites', hint: 'Hide every metabolite name (substrates and products)' },
  { id: 'tag', label: 'Cofactors', hint: 'Hide the cofactor labels on the arrows, such as ATP → ADP or − H₂O' },
];

interface Props {
  kinds: Set<QuizKind>; onKind: (k: QuizKind) => void;
  done: number; total: number;
  onRevealAll: () => void; onReset: () => void;
  scopeNote: string;
}

export default function QuizBar({ kinds, onKind, done, total, onRevealAll, onReset, scopeNote }: Props) {
  return (
    <div className="quizbar" role="group" aria-label="Quiz controls">
      <span className="qb-label">Hide</span>
      {kindChips.map((k) => (
        <button key={k.id} className={`qchip-btn${kinds.has(k.id) ? ' on' : ''}`} onClick={() => onKind(k.id)} title={k.hint} aria-pressed={kinds.has(k.id)}>{k.label}</button>
      ))}
      <span className="qb-progress" aria-live="polite">
        <b>{done}</b>/<b>{total}</b> revealed
        <span className="qb-bar"><i style={{ width: `${total ? (done / total) * 100 : 0}%` }} /></span>
      </span>
      <span className="qb-scope">{scopeNote}</span>
      <button className="qb-btn" onClick={onRevealAll}><EyeIcon /> Reveal all</button>
      <button className="qb-btn" onClick={onReset}><ResetIcon /> Reset</button>
    </div>
  );
}
