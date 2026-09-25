import { createRoot } from 'react-dom/client';
import App from './App';
import { fontsReady } from './text';
import './fonts.css';
import './styles.css';

// Label boxes are sized from measured text, so the first render waits (briefly) for the web fonts; if they arrive
// later, text.ts drops its measurements and the map re-lays itself out.
fontsReady().then(() => createRoot(document.getElementById('root')!).render(<App />));
