export type CoKey = 'ATP' | 'NADH' | 'NADPH' | 'FADH2' | 'GTP' | 'CO2' | 'Pi' | 'CoA' | 'UTP' | 'Biotin' | 'B12' | 'PLP' | 'THF';
export interface CoInfo { id: CoKey; label: string; hint: string }

export type EnzClass =
  | 'kinase' | 'isomerase' | 'dehydrogenase' | 'lyase'
  | 'hydrolase' | 'transferase' | 'ligase' | 'other';

export interface ClassInfo { id: EnzClass; label: string; hint: string }

/** Lecture decks: I–II are the midterm, III (lipids) and IV (N-containing compounds) the final. */
export type Part = 'I' | 'II' | 'III' | 'IV';
export type Exam = 'mid' | 'final';
/** What the exam switch highlights: one exam's material, or both. */
export type Scope = Exam | 'both';
/** Which exam an item belongs to; 'both' when both exams use it (a molecule joining a midterm and a final pathway). */
export type ExamTag = Exam | 'both';
/** Whether the exam switch highlights an item: its exam is the one chosen, or both exams use it, or 'both' is chosen. */
export const inExam = (tag: ExamTag | undefined, scope: Scope) => scope === 'both' || (tag ?? 'mid') === 'both' || (tag ?? 'mid') === scope;
export const examOf = (p: Part): Exam => (p === 'III' || p === 'IV' ? 'final' : 'mid');
/** The exams a citation ("Part II · slide 8 · Part III · slide 25") points into. */
export function examOfSlide(slide: string): ExamTag {
  const exams = new Set([...slide.matchAll(/Part (IV|III|II|I) ·/g)].map((m) => examOf(m[1] as Part)));
  return exams.size > 1 ? 'both' : exams.has('final') ? 'final' : 'mid';
}

export interface Molecule {
  id: string; name: string; smiles?: string; note?: string;
  /**
   * The general kind a specific molecule belongs to, when the map draws that kind's pathway (palmitate is a fatty
   * acid): a route from the molecule may follow it. Only for molecules the kind's pathway fits exactly.
   */
  isA?: string;
}

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

/** A study table inside a card: a header row, body rows (first cell is the row heading) and an optional footnote. */
export interface StudyTable { caption?: string; head: string[]; rows: string[][]; foot?: string }
export interface Card { id: string; title: string; sub?: string; bullets: string[]; mols?: string[]; table?: StudyTable[]; slide: string }

export type NodeKind = 'met' | 'card' | 'proc' | 'cx' | 'etag' | 'small' | 'xref';
export interface MapNode {
  /** `label` is optional for molecule nodes: they take the full name from `molecules.ts`. */
  id: string; label?: string; x: number; y: number; kind?: NodeKind;
  mol?: string; mols?: string[]; card?: string; enz?: string; link?: string; badge?: string; w?: number;
  /** Cross-reference (kind 'xref'): the node elsewhere on the map that this note points to. `link` is the local anchor. */
  target?: string;
  /** Set when the scene is assembled; undefined = midterm. */
  exam?: ExamTag;
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
  /** Undefined = midterm; final sections are tagged when the scene is assembled; 'both' is set by hand on a step both exams use. */
  exam?: ExamTag;
  /**
   * The plate (region id) the step belongs to. Set by `place()` for every step a PlateDef defines, and by hand where
   * a midterm step's label sits on another plate; otherwise the plate under the label counts.
   */
  plate?: string;
  /**
   * The exams that draw the arrow itself, when that is more than `exam`: Part IV slide 19 draws the citric acid
   * cycle without naming its enzymes, so those arrows stay lit in Final while their labels stay midterm.
   */
  lineExam?: ExamTag;
}

export interface Rect { x: number; y: number; w: number; h: number }
/**
 * A numbered plate: a framed panel of the map belonging to one lecture deck. x/y/w/h is its main rectangle (title,
 * camera framing); `more` adds rectangles for an L-shaped plate, drawn with one outline. `outside` marks a side panel
 * outside the cell; `inset` an enlarged close-up that is not drawn in place (the NADH shuttles' stretch of inner
 * membrane). Both get a dashed frame.
 */
export interface Region extends Rect {
  id: string; plate: number; part: Part; title: string; sub?: string; more?: Rect[]; right?: boolean; outside?: boolean; inset?: boolean;
  /** Where the title starts, from the plate's left edge (default 24), to keep it clear of arrows entering from above. */
  titleX?: number;
}
export interface Decor { x: number; y: number; label: string; dir: 'down' | 'up' }
/** A camera preset inside a plate (e.g. "Glycolysis 1–5"). */
export interface JumpView { id: string; label: string; x: number; y: number; w: number; h: number; plate?: string }

/** A membrane strip drawn behind nodes. */
export interface Band { id: string; x: number; y: number; w: number; h: number }
/** Free-standing small caption, e.g. "MATRIX (N side)". */
export interface Caption { x: number; y: number; text: string; anchor?: 'start' | 'middle' | 'end' }
/** Section heading or side note inside a plate ("Citric acid cycle", "Preparatory phase"). */
export interface Label { x: number; y: number; text: string; kind: 'section' | 'phase'; sub?: string[]; anchor?: 'start' | 'middle' | 'end' }

/** The cell and its mitochondrion, drawn behind the plates. The mitochondrion's membranes where things cross are bands. */
export interface Compartment { id: string; kind: 'cell' | 'mito'; x: number; y: number; w: number; h: number; label?: string }

/** Everything that has a position on the map. There is a desktop scene and a portrait-phone scene; ids are identical in both. */
export interface Scene {
  canvas: { w: number; h: number };
  nodes: MapNode[]; edges: Edge[]; regions: Region[]; bands: Band[]; captions: Caption[]; labels: Label[]; jumps: JumpView[]; decor: Decor[];
  compartments?: Compartment[];
}
