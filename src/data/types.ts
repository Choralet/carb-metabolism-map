export type CoKey = 'ATP' | 'NADH' | 'NADPH' | 'FADH2' | 'GTP' | 'CO2' | 'Pi' | 'CoA' | 'UTP' | 'Biotin' | 'B12';
export interface CoInfo { id: CoKey; label: string; hint: string }

export type EnzClass =
  | 'kinase' | 'isomerase' | 'dehydrogenase' | 'lyase'
  | 'hydrolase' | 'transferase' | 'ligase' | 'other';

export interface ClassInfo { id: EnzClass; label: string; hint: string }

/** Lecture decks: I–II are the midterm, III (lipids) and IV (N-containing compounds) the final. */
export type Part = 'I' | 'II' | 'III' | 'IV';
export type Exam = 'mid' | 'final';
/** What the scope switch shows: one exam's material, or both. */
export type Scope = Exam | 'both';
export const examOf = (p: Part): Exam => (p === 'III' || p === 'IV' ? 'final' : 'mid');

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

export type NodeKind = 'met' | 'card' | 'proc' | 'cx' | 'etag' | 'small' | 'xref';
export interface MapNode {
  /** `label` is optional for molecule nodes: they take the full name from `molecules.ts`. */
  id: string; label?: string; x: number; y: number; kind?: NodeKind;
  mol?: string; mols?: string[]; card?: string; enz?: string; link?: string; badge?: string; w?: number;
  /** Cross-reference (kind 'xref'): the node elsewhere on the map that this note points to. `link` is the local anchor. */
  target?: string;
  /** Set when the scene is assembled; undefined = midterm. */
  exam?: Exam;
}

export interface Edge {
  id: string; from: string; to: string; enz?: string;
  dir?: 'f' | 'both';
  off?: number; via?: [number, number][]; t?: number;
  /** Reaction label. "A → B" is drawn as a cofactor arc (A in, B out); "+ A" in only; "− B" out only; anything else as text. */
  tags?: string; tagPos?: 'r' | 'l' | 'below' | 'above';
  /** Draw `tags` as a plain note beside the arrow instead of a cofactor arc. */
  plainTag?: boolean;
  /** Put the enzyme label beside the arrow instead of on it (for arrows too short to carry it). */
  lab?: 'above' | 'below' | 'l' | 'r';
  style?: 'gng' | 'feed' | 'link' | 'plain'; noPill?: boolean; feed?: string;
  /** Co-product node: an arrow from the enzyme label to this node (mirror of `feed`, which points into the label). */
  out?: string;
  /** Cofactors this step consumes or produces, for the cofactor filter. */
  co?: CoKey[];
  exam?: Exam;
}

/** A numbered plate: a framed panel of the map belonging to one lecture deck. */
export interface Region { id: string; plate: number; part: Part; title: string; sub?: string; x: number; y: number; w: number; h: number; right?: boolean }
export interface Decor { x: number; y: number; label: string; dir: 'down' | 'up' }
/** A camera preset inside a plate (e.g. "Glycolysis 1–5"). */
export interface JumpView { id: string; label: string; x: number; y: number; w: number; h: number; plate?: string }

/** A membrane strip drawn behind nodes. */
export interface Band { id: string; x: number; y: number; w: number; h: number }
/** Free-standing small caption, e.g. "MATRIX (N side)". */
export interface Caption { x: number; y: number; text: string; anchor?: 'start' | 'middle' | 'end' }
/** Section heading or side note inside a plate ("Citric acid cycle", "Preparatory phase"). */
export interface Label { x: number; y: number; text: string; kind: 'section' | 'phase'; sub?: string[]; anchor?: 'start' | 'middle' | 'end' }

/** Everything that has a position on the map. There is a desktop scene and a portrait-phone scene; ids are identical in both. */
export interface Scene {
  canvas: { w: number; h: number };
  nodes: MapNode[]; edges: Edge[]; regions: Region[]; bands: Band[]; captions: Caption[]; labels: Label[]; jumps: JumpView[]; decor: Decor[];
}
