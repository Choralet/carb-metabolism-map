import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { grade, type Answer, type Question } from '../quiz';
import { Rich } from '../rich';
import { CloseIcon } from './icons';

interface Props {
  q: Question;
  plate?: number;
  /** Screen rectangle of the "?" that was clicked; the card opens beside it (a bottom sheet on phones). */
  at: DOMRect;
  phone: boolean;
  onAnswer: (a: Answer) => void;
  onClose: () => void;
}

type Phase = 'ask' | 'right' | 'wrong' | 'shown';

/**
 * One quiz question. Names are typed and graded (see grade.ts); a reaction label, which is awkward to type, is
 * answered in your head and then revealed. After a wrong or revealed answer you grade yourself, and "I was right"
 * overrides the grader when it is too strict.
 */
export default function QuizAsk({ q, plate, at, phone, onAnswer, onClose }: Props) {
  const [typed, setTyped] = useState('');
  const [phase, setPhase] = useState<Phase>('ask');
  const card = useRef<HTMLDivElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const primary = useRef<HTMLButtonElement>(null);
  const [pos, setPos] = useState<{ left: number; top: number } | null>(null);

  useEffect(() => { (q.typed ? input.current : primary.current)?.focus(); }, [q]);
  useEffect(() => { if (phase !== 'ask') primary.current?.focus(); }, [phase]);
  // a right answer moves on by itself after a beat
  useEffect(() => {
    if (phase !== 'right') return;
    const t = setTimeout(() => onAnswer('ok'), 900);
    return () => clearTimeout(t);
  }, [phase, onAnswer]);

  // below the "?" when there is room, otherwise above; always inside the window
  useLayoutEffect(() => {
    if (phone || !card.current) return;
    const r = card.current.getBoundingClientRect();
    const left = Math.min(Math.max(12, at.left + at.width / 2 - r.width / 2), window.innerWidth - r.width - 12);
    const below = at.bottom + 10;
    const top = below + r.height < window.innerHeight - 12 ? below : Math.max(12, at.top - 10 - r.height);
    setPos({ left, top });
  }, [at, phone, phase]);

  const check = () => {
    if (!typed.trim()) { setPhase('shown'); return; }
    setPhase(grade(typed, q) ? 'right' : 'wrong');
  };

  const kindLabel = q.kind === 'enz' ? 'Enzyme' : q.kind === 'met' ? 'Molecule' : 'Reaction label';
  return (
    <div className={`quiz-ask${phone ? ' sheet' : ''}`} ref={card} role="dialog" aria-label={q.prompt}
      style={phone ? undefined : pos ? { left: pos.left, top: pos.top } : { visibility: 'hidden' }}
      onKeyDown={(ev) => { if (ev.key === 'Escape') { ev.stopPropagation(); onClose(); } }}>
      <div className="qa-head">
        <span className="qa-kind">{kindLabel}{plate !== undefined && <> · Plate {plate}</>}</span>
        <button className="icon-btn" onClick={onClose} aria-label="Close without answering"><CloseIcon /></button>
      </div>
      <p className="qa-prompt">{q.prompt}</p>

      {phase === 'ask' && (q.typed ? (
        <form className="qa-form" onSubmit={(ev) => { ev.preventDefault(); check(); }}>
          <input ref={input} value={typed} onChange={(ev) => setTyped(ev.target.value)} placeholder="Type the name…"
            aria-label="Your answer" autoComplete="off" autoCapitalize="off" spellCheck={false} />
          <button type="submit" className="qa-btn primary">Check</button>
          <button type="button" className="qa-link" onClick={() => setPhase('shown')}>Show answer</button>
        </form>
      ) : (
        <div className="qa-actions">
          <span className="qa-hint">Say it to yourself first.</span>
          <button ref={primary} className="qa-btn primary" onClick={() => setPhase('shown')}>Show answer</button>
        </div>
      ))}

      {phase === 'right' && (
        <div className="qa-result ok" role="status">
          <b>Right</b> <span><Rich s={q.answer} /></span>
          <button ref={primary} className="qa-btn" onClick={() => onAnswer('ok')}>Next</button>
        </div>
      )}

      {(phase === 'wrong' || phase === 'shown') && (
        <div className={`qa-result ${phase === 'wrong' ? 'miss' : 'shown'}`} role="status">
          {phase === 'wrong' && <p className="qa-you">You wrote <q>{typed}</q></p>}
          <p className="qa-answer"><span>Answer</span> <Rich s={q.answer} /></p>
          <div className="qa-actions">
            {phase === 'wrong'
              ? <button className="qa-btn" onClick={() => onAnswer('ok')}>I was right</button>
              : <button className="qa-btn" onClick={() => onAnswer('ok')}>Got it</button>}
            <button ref={primary} className="qa-btn primary" onClick={() => onAnswer('miss')}>Missed it</button>
          </div>
        </div>
      )}
    </div>
  );
}
