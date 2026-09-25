import type { Scope } from '../data/types';
import { BookIcon, LayersIcon, MoonIcon, QuizIcon, SearchIcon, SunIcon } from './icons';

export type Panel = 'plates' | 'layers' | null;

const SCOPES: { id: Scope; label: string; parts: string; hint: string }[] = [
  { id: 'mid', label: 'Midterm', parts: 'I–II', hint: 'Parts I–II only: the carbohydrate map' },
  { id: 'final', label: 'Final', parts: 'III–IV', hint: 'Parts III–IV (lipids, N-compounds); the midterm plates stay as dimmed context' },
  { id: 'both', label: 'Both', parts: '', hint: 'Everything, at full strength' },
];

interface Props {
  scope: Scope; onScope: (s: Scope) => void;
  onSearch: () => void;
  panel: Panel; onPanel: (p: Panel) => void;
  quizOn: boolean; onQuiz: () => void;
  dark: boolean; onTheme: () => void;
  highlights: number;
}

export default function TopBar({ scope, onScope, onSearch, panel, onPanel, quizOn, onQuiz, dark, onTheme, highlights }: Props) {
  const toggle = (p: Panel) => onPanel(panel === p ? null : p);
  return (
    <header className="topbar">
      <div className="brand">
        <span className="wordmark">Metabolism <i>Atlas</i></span>
        <span className="course">2310380 · Biochemistry for Bioengineers</span>
      </div>
      <div className="scope" role="radiogroup" aria-label="Exam scope">
        {SCOPES.map((s) => (
          <button key={s.id} role="radio" aria-checked={scope === s.id} className={`${s.id}${scope === s.id ? ' on' : ''}`} onClick={() => onScope(s.id)} title={s.hint}>
            {s.label}{s.parts && <small>{s.parts}</small>}
          </button>
        ))}
      </div>
      <button className="search-trigger" onClick={onSearch} aria-label="Search (press /)">
        <SearchIcon /><span className="st-text">Search enzymes, molecules, plates…</span><kbd>/</kbd>
      </button>
      <nav className="tools" aria-label="Tools">
        <button className={`tool${panel === 'plates' ? ' on' : ''}`} data-panel-toggle onClick={() => toggle('plates')} aria-expanded={panel === 'plates'} title="Plates (table of contents)">
          <BookIcon /><span>Plates</span>
        </button>
        <button className={`tool${panel === 'layers' ? ' on' : ''}`} data-panel-toggle onClick={() => toggle('layers')} aria-expanded={panel === 'layers'} title="Layers & highlights">
          <LayersIcon /><span>Layers</span>{highlights > 0 && <b className="badge-dot">{highlights}</b>}
        </button>
        <button className={`tool quiz${quizOn ? ' on' : ''}`} onClick={onQuiz} aria-pressed={quizOn} title="Quiz mode">
          <QuizIcon /><span>{quizOn ? 'Quizzing' : 'Quiz'}</span>
        </button>
        <button className="tool icon-only" onClick={onTheme} aria-label={dark ? 'Light theme' : 'Dark theme'} title={dark ? 'Light theme' : 'Dark theme'}>
          {dark ? <SunIcon /> : <MoonIcon />}
        </button>
      </nav>
    </header>
  );
}
