import { RESEARCH_DEFS } from "@/game/mechanics/research";
import { useGameStore } from "@/stores/gameStore";

// Координаты центров карточек на SVG-canvas (W×H).
// Карточки CARD_W × CARD_H с центром в (x, y).
// В третьем ряду 3 карточки: 3*130 + 2*15 = 420 — впритык под W.
const CARD_W = 130;
const CARD_H = 108;
const POSITIONS: Record<number, { x: number; y: number }> = {
  1: { x: 110, y: 80 },
  2: { x: 310, y: 80 },
  3: { x: 110, y: 240 },
  4: { x: 310, y: 240 },
  5: { x: 70, y: 410 },
  6: { x: 210, y: 410 },
  7: { x: 350, y: 410 },
  8: { x: 210, y: 600 },
};

const W = 420;
const H = 720;

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
                  y1={a.y + CARD_H / 2}
                  x2={b.x}
                  y2={b.y - CARD_H / 2}
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
  // Заливка фона рисуется через SVG <rect>, чтобы рамка была сплошной со
  // всех 4 сторон. CSS-border внутри <foreignObject> в некоторых браузерах
  // обрезается снизу — поэтому ушли на родной SVG-stroke.
  const fillBg = done
    ? "rgba(110, 195, 230, 0.18)"
    : avail
      ? "rgba(244, 180, 84, 0.10)"
      : "rgba(14, 42, 58, 0.6)";
  const strokeColor = done
    ? "var(--bp-line)"
    : avail
      ? "var(--bp-amber)"
      : "rgba(110, 195, 230, 0.4)";
  const strokeWidth = avail ? 1.5 : 1;
  return (
    <g transform={`translate(${x} ${y})`}>
      <rect
        x={-CARD_W / 2}
        y={-CARD_H / 2}
        width={CARD_W}
        height={CARD_H}
        fill={fillBg}
        stroke={strokeColor}
        strokeWidth={strokeWidth}
      />
      {avail && (
        <rect
          x={-CARD_W / 2}
          y={-CARD_H / 2}
          width={CARD_W}
          height={CARD_H}
          fill="none"
          stroke="var(--bp-amber)"
          strokeWidth="0.6"
          strokeDasharray="3 3"
          className="march"
        />
      )}
      <foreignObject x={-CARD_W / 2} y={-CARD_H / 2} width={CARD_W} height={CARD_H}>
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
