import { useState } from 'react';
import { enzById } from '../data/enzymes';
import type { Scene } from '../data/types';
import type { View } from '../Diagram';
import { viewAround } from '../locate';
import { geometryOf } from '../map/geometry';
import { Rich } from '../rich';
import { identityName, type Route, type Step } from '../route';
import { ChevronIcon, CloseIcon, SwapIcon } from './icons';

interface Props {
  scene: Scene;
  from: string; to: string;
  route: Route | null;
  onGo: (v: View) => void;
  onSwap: () => void;
  onClear: () => void;
}

/** What carries a step: its enzyme, or for a summary arrow the note written on it. */
function how(s: Step): string {
  const e = s.edge;
  if (e.enz) return enzById[e.enz].short;
  return e.plainTag && e.tags ? e.tags : 'summary arrow';
}

export default function RouteBar({ scene, from, to, route, onGo, onSwap, onClear }: Props) {
  const [open, setOpen] = useState(true);
  const name = (id: string) => identityName(id, scene);
  const { routed, plateOf } = geometryOf(scene);
  const n = route?.steps.length ?? 0;
  return (
    <div className="route-bar" role="region" aria-label="Traced route">
      <div className="rb-head">
        <span className="rb-label">Route</span>
        <span className="rb-ends"><b><Rich s={name(from)} /></b> <span aria-hidden="true">→</span><span className="sr-only">to</span> <b><Rich s={name(to)} /></b></span>
        {route
          ? <span className="rb-meta">{n} step{n === 1 ? '' : 's'} · Plate{route.plates.length === 1 ? '' : 's'} {route.plates.join(', ')}</span>
          : <span className="rb-meta none">No drawn route</span>}
        <span className="rb-tools">
          {route && (
            <button className="qb-btn" onClick={() => setOpen((v) => !v)} aria-expanded={open}>
              <ChevronIcon up={!open} /> Steps
            </button>
          )}
          <button className="qb-btn" onClick={onSwap} title="Trace the other way"><SwapIcon /> Reverse</button>
          <button className="icon-btn" onClick={onClear} aria-label="Clear the route"><CloseIcon /></button>
        </span>
      </div>
      {route && open && (
        <ol className="rb-steps">
          {route.steps.map((s, i) => {
            const plate = plateOf.get(s.toNode)?.plate;
            return (
              <li key={i}>
                <button onClick={() => onGo(viewAround(routed.get(s.edge.id)!.mid, 900, 560))}>
                  <span className="rb-n">{i + 1}</span>
                  <span className="rb-step"><Rich s={name(s.from)} /> → <Rich s={name(s.to)} /></span>
                  <span className="rb-how"><Rich s={how(s)} /></span>
                  {plate !== undefined && <span className="rb-plate">{plate}</span>}
                </button>
              </li>
            );
          })}
        </ol>
      )}
    </div>
  );
}
