/** Small stroke icons drawn inline (no icon font, no emoji), sized by the surrounding font. */
const S = { width: '1.15em', height: '1.15em', viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.9, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const, 'aria-hidden': true };

export const SearchIcon = () => <svg {...S}><circle cx="10.5" cy="10.5" r="6.5" /><path d="M15.5 15.5 21 21" /></svg>;
export const BookIcon = () => <svg {...S}><path d="M12 6C9.5 4.2 6.5 4 3 4.5v14c3.5-.5 6.5-.3 9 1.5 2.5-1.8 5.5-2 9-1.5v-14C17.5 4 14.5 4.2 12 6z" /><path d="M12 6v14" /></svg>;
export const LayersIcon = () => <svg {...S}><path d="M12 3 2.5 8 12 13l9.5-5z" /><path d="m2.5 12.5 9.5 5 9.5-5" /><path d="m2.5 17 9.5 5 9.5-5" opacity=".55" /></svg>;
export const QuizIcon = () => <svg {...S}><rect x="3" y="3" width="18" height="18" rx="3" /><path d="M9.2 9.3a3 3 0 1 1 4.3 2.7c-.9.5-1.5 1.2-1.5 2.2v.6" /><circle cx="12" cy="18.2" r=".6" fill="currentColor" /></svg>;
export const SunIcon = () => <svg {...S}><circle cx="12" cy="12" r="4" /><path d="M12 2.5v2M12 19.5v2M4.6 4.6 6 6M18 18l1.4 1.4M2.5 12h2M19.5 12h2M4.6 19.4 6 18M18 6l1.4-1.4" /></svg>;
export const MoonIcon = () => <svg {...S}><path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z" /></svg>;
export const CloseIcon = () => <svg {...S}><path d="M6 6l12 12M18 6 6 18" /></svg>;
export const KeyIcon = () => <svg {...S}><path d="M4 7h16M4 12h16M4 17h10" /></svg>;
export const ChevronIcon = ({ up }: { up?: boolean }) => <svg {...S}><path d={up ? 'm6 15 6-6 6 6' : 'm6 9 6 6 6-6'} /></svg>;
export const ArrowIcon = () => <svg {...S}><path d="M5 12h14M13 6l6 6-6 6" /></svg>;
export const RegIcon = () => <svg {...S}><path d="M4 12h9" /><path d="M16 7v10" /><circle cx="19.5" cy="12" r="1.6" fill="currentColor" /></svg>;
export const EyeIcon = () => <svg {...S}><path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z" /><circle cx="12" cy="12" r="3" /></svg>;
export const LinkIcon = () => <svg {...S}><path d="M10 14a4.5 4.5 0 0 0 6.4 0l3.2-3.2a4.5 4.5 0 0 0-6.4-6.4L12 5.6" /><path d="M14 10a4.5 4.5 0 0 0-6.4 0l-3.2 3.2a4.5 4.5 0 0 0 6.4 6.4l1.2-1.2" /></svg>;
export const CheckIcon = () => <svg {...S}><path d="m5 12.5 4.5 4.5L19 7.5" /></svg>;
export const SwapIcon = () => <svg {...S}><path d="M7 4 3.5 7.5 7 11" /><path d="M3.5 7.5H17" /><path d="m17 13 3.5 3.5L17 20" /><path d="M20.5 16.5H7" /></svg>;
export const RouteIcon = () => <svg {...S}><circle cx="5.5" cy="18.5" r="2" /><circle cx="18.5" cy="5.5" r="2" /><path d="M7.5 18.5h6a3.5 3.5 0 0 0 0-7h-3a3.5 3.5 0 0 1 0-7h6" /></svg>;
export const ResetIcon = () => <svg {...S}><path d="M4 12a8 8 0 1 0 2.3-5.6" /><path d="M4 4v4.5h4.5" /></svg>;
