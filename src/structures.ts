/**
 * Molecule drawings are rendered ahead of time (`npm run structures` → data/structures.json), so showing one never
 * needs Ketcher. The JSON is a separate chunk, fetched the first time a drawer needs a structure.
 */
let all: Promise<Record<string, string>> | null = null;

export const loadStructures = () => (all ??= import('./data/structures.json').then((m) => m.default as Record<string, string>));
