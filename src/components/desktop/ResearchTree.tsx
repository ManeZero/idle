import { RESEARCH_DEFS } from "@/game/mechanics/research";
import { useGameStore } from "@/stores/gameStore";

const POSITIONS: Record<number, { x: number; y: number }> = {
  1: { x: 105, y: 70 },
  2: { x: 315, y: 70 },
  3: { x: 105, y: 220 },
  4: { x: 315, y: 220 },
  5: { x: 70, y: 390 },
  6: { x: 210, y: 390 },
  7: { x: 350, y: 390 },
  8: { x: 210, y: 580 },
};

const W = 420;
const H = 760;

type NodeStatus = "done" | "available" | "locked";

function nodeStatus(id: number, completed: number[], experience: number): NodeStatus {
  if (completed.includes(id)) return "done";
  const def = RESEARCH_DEFS.find((r) => r.id === id);
  if (!def) return "locked";
  const prereqs = def.requires.every((r) => completed.includes(r));
  if (!prereqs) return "locked";
  return experience >= def.cost ? "available" : "available";
}

export function ResearchTree() {
  const experience = useGameStore((s) => s.experience);
  const completedResearch = useGameStore((s) => s.completedResearch);
  const buyResearch = useGameStore((s) => s.buyResearch);

  return (
    <div className="bp-rd">
      <div className="bp-rd__head">
        <div>
          <div className="bp-rd__sub">ПРОГРАММА ИССЛЕДОВАНИЙ</div>
          <div className="bp-rd__title">Дерево R&amp;D</div>
        </div>
        <div className="bp-rd__count tnum">{completedResearch.length} / 8</div>
      </div>
      <div className="bp-rd__body">
        <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H} className="bp-rd__svg" role="img">
          <title>Дерево исследований</title>
          {RESEARCH_DEFS.flatMap((r) =>
            r.requires.map((req) => {
              const a = POSITIONS[req];
              const b = POSITIONS[r.id];
              if (!a || !b) return null;
              const linked = completedResearch.includes(req);
              return (
                <line
                  key={`${req}-${r.id}`}
                  x1={a.x}
                  y1={a.y + 42}
                  x2={b.x}
                  y2={b.y - 42}
                  stroke={linked ? "var(--bp-line)" : "rgba(110,195,230,0.3)"}
                  strokeWidth={linked ? 1.2 : 0.6}
                  strokeDasharray={linked ? "0" : "3 3"}
                />
              );
            }),
          )}
          {RESEARCH_DEFS.map((r) => {
            const status = nodeStatus(r.id, completedResearch, experience);
            const p = POSITIONS[r.id];
            if (!p) return null;
            return (
              <ResearchCard
                key={r.id}
                id={r.id}
                name={r.name}
                effect={r.description}
                cost={r.cost}
                requires={r.requires}
                status={status}
                affordable={experience >= r.cost}
                x={p.x}
                y={p.y}
                onBuy={() => buyResearch(r.id)}
              />
            );
          })}
        </svg>
      </div>
    </div>
  );
}

interface CardProps {
  id: number;
  name: string;
  effect: string;
  cost: number;
  requires: number[];
  status: NodeStatus;
  affordable: boolean;
  x: number;
  y: number;
  onBuy: () => void;
}

function ResearchCard({
  id,
  name,
  effect,
  cost,
  requires,
  status,
  affordable,
  x,
  y,
  onBuy,
}: CardProps) {
  const done = status === "done";
  const avail = status === "available";
  const cssClass = `bp-rd-card${done ? " bp-rd-card--done" : ""}${avail ? " bp-rd-card--avail" : ""}`;
  const handle = avail && affordable ? onBuy : undefined;
  return (
    <g transform={`translate(${x} ${y})`}>
      {avail && (
        <rect
          x="-65"
          y="-42"
          width="130"
          height="84"
          fill="none"
          stroke="var(--bp-amber)"
          strokeWidth="0.6"
          strokeDasharray="3 3"
          className="march"
        />
      )}
      <foreignObject x="-65" y="-42" width="130" height="84">
        <div className={cssClass}>
          <button
            type="button"
            className="bp-rd-card__btn"
            disabled={!avail || !affordable}
            onClick={handle}
            aria-label={`Купить ${name}`}
          >
            <div className="bp-rd-card__top">
              <span className="bp-rd-card__id">R{id}</span>
              <span className="bp-rd-card__cost">{done ? "✓ ГОТОВО" : `${cost} XP`}</span>
            </div>
            <div className="bp-rd-card__name">{name}</div>
            <div className="bp-rd-card__effect">{effect}</div>
            <div className="bp-rd-card__req">
              {requires.length
                ? `требует: ${requires.map((r) => `R${r}`).join(" + ")}`
                : "без требований"}
            </div>
          </button>
        </div>
      </foreignObject>
    </g>
  );
}
