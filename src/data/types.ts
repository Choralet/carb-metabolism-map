export type CoKey = 'ATP' | 'NADH' | 'NADPH' | 'FADH2' | 'GTP' | 'CO2' | 'Pi' | 'CoA' | 'UTP';
export interface CoInfo { id: CoKey; label: string; hint: string }

export type EnzClass =
  | 'kinase' | 'isomerase' | 'dehydrogenase' | 'lyase'
  | 'hydrolase' | 'transferase' | 'ligase' | 'other';

export interface ClassInfo { id: EnzClass; label: string; color: string; hint: string }

export interface Molecule { id: string; name: string; smiles?: string; note?: string }

export interface Enzyme {
  id: string;
  name: string;
  /** Name shown on the map: `name` without its parenthetical, when that differs. */
  full?: string;
  short: string;
  cls: EnzClass[];
  ec?: string;
  /** true = reversible, false = irreversible in cells, null = not stated in notes */
  rev: boolean | null;
  cofactors?: string;
  subs?: string[];
  prods?: string[];
  text: string[];
  reg?: string;
  slide: string;
}

export interface Card { id: string; title: string; sub?: string; bullets: string[]; mols?: string[]; slide: string }

export type NodeKind = 'met' | 'card' | 'proc' | 'cx' | 'etag' | 'small';
export interface MapNode {
  /** `label` is optional for molecule nodes: they take the full name from `molecules.ts`. */
  id: string; label?: string; x: number; y: number; kind?: NodeKind;
  mol?: string; mols?: string[]; card?: string; enz?: string; link?: string; badge?: string; w?: number;
}

export interface Edge {
  id: string; from: string; to: string; enz?: string;
  dir?: 'f' | 'both';
  off?: number; via?: [number, number][]; t?: number;
  tags?: string; tagPos?: 'r' | 'l' | 'below' | 'above';
  style?: 'gng' | 'feed' | 'link' | 'plain'; noPill?: boolean; feed?: string;
  /** Co-product node: a dotted arrow from the pill to this node (mirror of `feed`, which points into the pill). */
  out?: string;
  /** Cofactors this step consumes or produces, for the cofactor filter. */
  co?: CoKey[];
}

export interface Region { id: string; title: string; x: number; y: number; w: number; h: number; tone: string; right?: boolean }
export interface Decor { x: number; y: number; label: string; dir: 'down' | 'up' }
export interface JumpView { id: string; label: string; x: number; y: number; w: number; h: number }

/** A membrane strip drawn behind nodes (the shuttle diagrams need vertical/horizontal bilayers of their own). */
export interface Band { id: string; x: number; y: number; w: number; h: number }
/** Free-standing small caption, e.g. "MATRIX (N side)". */
export interface Caption { x: number; y: number; text: string; anchor?: 'start' | 'middle' | 'end' }
