import { calcOilProductionRate } from "@/game/mechanics/oil";
import { getResearchModifiers } from "@/game/mechanics/research";
import { useGameStore } from "@/stores/gameStore";
import type { OilStation } from "@/types/game";
import { Pumpjack } from "../Pumpjack";

// Фиксированные позиции 6 слотов на чертеже 880×632.
// Заполняются по id станции (1..6); пустые показываются как "СЛОТ N".
const SLOT_POSITIONS = [
  { x: 180, y: 270 },
  { x: 360, y: 200 },
  { x: 280, y: 450 },
  { x: 530, y: 480 },
  { x: 600, y: 150 },
  { x: 700, y: 510 },
];
const HUB = { x: 400, y: 340 };
const TANK = { x: 740, y: 340 };

interface Props {
  selectedId: number | null;
  onSelect: (id: number | null) => void;
}

export function SchematicField({ selectedId, onSelect }: Props) {
  const stations = useGameStore((s) => s.stations);
  const oil = useGameStore((s) => s.oil);
  const completedResearch = useGameStore((s) => s.completedResearch);
  const mods = getResearchModifiers(completedResearch);
  const tankCapacity = 10_000;
  const fallback = { x: 0, y: 0 };
  const fillStations = stations.map((s, i) => ({
    station: s,
    slot: i,
    pos: SLOT_POSITIONS[i] ?? fallback,
    rate: calcOilProductionRate(s, mods),
  }));

  return (
    <svg
      viewBox="0 0 880 632"
      preserveAspectRatio="xMidYMid meet"
      width="100%"
      height="100%"
      style={{ overflow: "visible" }}
      role="img"
    >
      <title>Схема нефтяного поля Blackwell</title>
      <ReservoirContours />
      {fillStations
        .filter((f) => f.station.enabled)
        .map((f) => (
          <PipeStationToHub key={`pipe-${f.station.id}`} x={f.pos.x} y={f.pos.y} />
        ))}
      <PipeHubToTank />
      <Hub />
      <Tank oil={oil} capacity={tankCapacity} />
      {SLOT_POSITIONS.flatMap((pos, i) => {
        if (i < stations.length || i >= mods.maxStationSlots) return [];
        const slotIndex = i + 1;
        return (
          <EmptySlot
            key={`slot-${slotIndex}`}
            x={pos.x}
            y={pos.y}
            index={slotIndex}
            locked={slotIndex === 6 && !completedResearch.includes(6)}
          />
        );
      })}
      {fillStations.map((f) => (
        <StationNode
          key={f.station.id}
          station={f.station}
          rate={f.rate}
          x={f.pos.x}
          y={f.pos.y}
          selected={selectedId === f.station.id}
          onSelect={() => onSelect(selectedId === f.station.id ? null : f.station.id)}
        />
      ))}
    </svg>
  );
}

function ReservoirContours() {
  return (
    <>
      <ellipse
        cx={HUB.x}
        cy={HUB.y}
        rx="320"
        ry="260"
        fill="none"
        stroke="rgba(244,180,84,0.25)"
        strokeWidth="0.6"
        strokeDasharray="3 3"
      />
      <ellipse
        cx={HUB.x}
        cy={HUB.y}
        rx="220"
        ry="180"
        fill="none"
        stroke="rgba(244,180,84,0.3)"
        strokeWidth="0.6"
        strokeDasharray="3 3"
      />
      <ellipse
        cx={HUB.x}
        cy={HUB.y}
        rx="120"
        ry="100"
        fill="none"
        stroke="rgba(244,180,84,0.5)"
        strokeWidth="0.6"
        strokeDasharray="3 3"
      />
    </>
  );
}

function PipeStationToHub({ x, y }: { x: number; y: number }) {
  const dx = HUB.x - x;
  const dy = HUB.y - y;
  const d = Math.hypot(dx, dy);
  const ux = dx / d;
  const uy = dy / d;
  const x1 = x + ux * 28;
  const y1 = y + uy * 28;
  const x2 = HUB.x - ux * 26;
  const y2 = HUB.y - uy * 26;
  return (
    <g>
      <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="rgba(110,195,230,0.55)" strokeWidth="2.5" />
      <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="var(--bp-bg)" strokeWidth="1" />
      <line
        className="flow-line"
        x1={x1}
        y1={y1}
        x2={x2}
        y2={y2}
        stroke="var(--bp-amber)"
        strokeWidth="1.4"
      />
    </g>
  );
}

function PipeHubToTank() {
  const dx = TANK.x - HUB.x;
  const dy = TANK.y - HUB.y;
  const d = Math.hypot(dx, dy);
  const ux = dx / d;
  const uy = dy / d;
  const x1 = HUB.x + ux * 26;
  const y1 = HUB.y + uy * 26;
  const x2 = TANK.x - ux * 32;
  const y2 = TANK.y - uy * 32;
  return (
    <g>
      <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="rgba(110,195,230,0.7)" strokeWidth="3.5" />
      <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="var(--bp-bg)" strokeWidth="1.2" />
      <line
        className="flow-line"
        x1={x1}
        y1={y1}
        x2={x2}
        y2={y2}
        stroke="var(--bp-amber)"
        strokeWidth="1.6"
      />
    </g>
  );
}

function Hub() {
  return (
    <g transform={`translate(${HUB.x} ${HUB.y})`}>
      <rect
        x="-26"
        y="-26"
        width="52"
        height="52"
        fill="var(--bp-bg)"
        stroke="var(--bp-line)"
        strokeWidth="1.2"
      />
      <rect
        x="-22"
        y="-22"
        width="44"
        height="44"
        fill="none"
        stroke="var(--bp-line)"
        strokeWidth="0.5"
      />
      <circle r="8" fill="none" stroke="var(--bp-line)" strokeWidth="1" />
      <line x1="-8" y1="0" x2="8" y2="0" stroke="var(--bp-line)" strokeWidth="0.6" />
      <line x1="0" y1="-8" x2="0" y2="8" stroke="var(--bp-line)" strokeWidth="0.6" />
      <rect
        x="-44"
        y="-50"
        width="88"
        height="22"
        fill="var(--bp-bg)"
        stroke="var(--bp-line)"
        strokeWidth="0.6"
      />
      <text
        x="0"
        y="-37"
        textAnchor="middle"
        fontFamily="var(--font-mono)"
        fontSize="10"
        fontWeight="600"
        fill="var(--bp-line)"
      >
        УЗЕЛ СБОРА
      </text>
      <text
        x="0"
        y="40"
        textAnchor="middle"
        fontFamily="var(--font-mono)"
        fontSize="8"
        fill="rgba(110,195,230,0.6)"
      >
        M-01
      </text>
    </g>
  );
}

function Tank({ oil, capacity }: { oil: number; capacity: number }) {
  const fill = Math.min(1, oil / capacity);
  const fillH = 80 * fill;
  return (
    <g transform={`translate(${TANK.x} ${TANK.y})`}>
      <defs>
        <pattern
          id="tank-hatch"
          patternUnits="userSpaceOnUse"
          width="6"
          height="6"
          patternTransform="rotate(45)"
        >
          <line
            x1="0"
            y1="0"
            x2="0"
            y2="6"
            stroke="var(--bp-amber)"
            strokeWidth="1.2"
            opacity="0.55"
          />
        </pattern>
      </defs>
      <rect x="-32" y="-40" width="64" height="80" fill="var(--bp-bg)" />
      <rect x="-32" y={40 - fillH} width="64" height={fillH} fill="rgba(244,180,84,0.45)" />
      <rect x="-32" y={40 - fillH} width="64" height={fillH} fill="url(#tank-hatch)" />
      <line
        x1="-32"
        y1={40 - fillH}
        x2="32"
        y2={40 - fillH}
        stroke="var(--bp-amber)"
        strokeWidth="1"
      />
      <rect
        x="-32"
        y="-40"
        width="64"
        height="80"
        fill="none"
        stroke="var(--bp-line)"
        strokeWidth="1.2"
      />
      {[0.25, 0.5, 0.75].map((t) => (
        <line
          key={t}
          x1="-32"
          y1={-40 + 80 * t}
          x2="-36"
          y2={-40 + 80 * t}
          stroke="var(--bp-line)"
          strokeWidth="0.5"
        />
      ))}
      <text
        x="0"
        y="-46"
        textAnchor="middle"
        fontFamily="var(--font-mono)"
        fontSize="10"
        fontWeight="600"
        fill="var(--bp-line)"
      >
        РЕЗЕРВУАР
      </text>
      <text
        x="0"
        y="0"
        textAnchor="middle"
        fontFamily="var(--font-mono)"
        fontSize="11"
        fontWeight="700"
        fill="var(--bp-line)"
      >
        {Math.round(oil).toLocaleString("ru-RU")}
      </text>
      <text
        x="0"
        y="11"
        textAnchor="middle"
        fontFamily="var(--font-mono)"
        fontSize="7"
        fill="rgba(110,195,230,0.7)"
      >
        / {capacity.toLocaleString("ru-RU")} барр
      </text>
    </g>
  );
}

function EmptySlot({
  x,
  y,
  index,
  locked,
}: {
  x: number;
  y: number;
  index: number;
  locked: boolean;
}) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <circle
        r="28"
        fill="var(--bp-bg)"
        stroke="rgba(110,195,230,0.4)"
        strokeWidth="1"
        strokeDasharray="3 3"
      />
      <line x1="-7" y1="0" x2="7" y2="0" stroke="rgba(110,195,230,0.6)" strokeWidth="1.2" />
      <line x1="0" y1="-7" x2="0" y2="7" stroke="rgba(110,195,230,0.6)" strokeWidth="1.2" />
      <text
        x="0"
        y="44"
        textAnchor="middle"
        fontFamily="var(--font-mono)"
        fontSize="8"
        fill="rgba(110,195,230,0.55)"
        letterSpacing="1.5"
      >
        СЛОТ {index}
      </text>
      {locked && (
        <text
          x="0"
          y="54"
          textAnchor="middle"
          fontFamily="var(--font-mono)"
          fontSize="7"
          fill="rgba(110,195,230,0.4)"
        >
          требует R6
        </text>
      )}
    </g>
  );
}

interface NodeProps {
  station: OilStation;
  rate: number;
  x: number;
  y: number;
  selected: boolean;
  onSelect: () => void;
}

function StationNode({ station, rate, x, y, selected, onSelect }: NodeProps) {
  const fill = station.oilRemaining / station.capacity;
  const wellCode = `W-${station.id.toString().padStart(2, "0")}`;
  const pitCode = `PIT-${station.id.toString().padStart(3, "0")}`;
  const arcLen = fill * 144.5;
  return (
    // biome-ignore lint/a11y/useSemanticElements: <button> нельзя положить в SVG-дерево
    <g
      transform={`translate(${x} ${y})`}
      opacity={station.enabled ? 1 : 0.45}
      style={{ cursor: "pointer" }}
      role="button"
      tabIndex={0}
      aria-label={`Станция ${wellCode}`}
      onClick={onSelect}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onSelect();
        }
      }}
    >
      {selected && (
        <circle
          r="36"
          fill="none"
          stroke="var(--bp-amber)"
          strokeWidth="1.4"
          strokeDasharray="4 3"
          className="march"
        />
      )}
      <circle r="30" fill="var(--bp-bg)" />
      <line x1="0" y1="-30" x2="0" y2="-58" stroke="var(--bp-line)" strokeWidth="0.5" />
      <rect
        x="-32"
        y="-86"
        width="64"
        height="28"
        fill="var(--bp-bg)"
        stroke="var(--bp-line)"
        strokeWidth="0.8"
      />
      <text
        x="0"
        y="-75"
        textAnchor="middle"
        fontFamily="var(--font-mono)"
        fontSize="7"
        fill="rgba(110,195,230,0.6)"
        letterSpacing="1"
      >
        {pitCode}
      </text>
      <text
        x="0"
        y="-63"
        textAnchor="middle"
        fontFamily="var(--font-mono)"
        fontSize="10"
        fontWeight="700"
        fill="var(--bp-line)"
      >
        {wellCode}
      </text>
      <circle r="28" fill="var(--bp-bg)" stroke="var(--bp-line)" strokeWidth="1.2" />
      <circle
        r="28"
        fill="none"
        stroke={station.enabled ? "var(--bp-amber)" : "rgba(110,195,230,0.3)"}
        strokeWidth="0.6"
        strokeDasharray={station.enabled ? "0" : "2 2"}
      />
      <g transform="translate(-15 -15) scale(0.30)">
        <Pumpjack size={100} running={station.enabled} color="var(--bp-line)" />
      </g>
      <circle r="23" fill="none" stroke="rgba(244,180,84,0.18)" strokeWidth="3" />
      <circle
        r="23"
        fill="none"
        stroke="var(--bp-amber)"
        strokeWidth="3"
        strokeDasharray={`${arcLen} 144.5`}
        transform="rotate(-90)"
      />
      <circle
        cx="22"
        cy="-22"
        r="4"
        fill={station.enabled ? "var(--bp-green)" : "var(--bp-rust)"}
        stroke="var(--bp-bg)"
        strokeWidth="1"
      />
      <text
        x="0"
        y="44"
        textAnchor="middle"
        fontFamily="var(--font-mono)"
        fontSize="9"
        fontWeight="600"
        fill="var(--bp-line)"
      >
        {rate.toFixed(1)} барр/с
      </text>
      <text
        x="0"
        y="54"
        textAnchor="middle"
        fontFamily="var(--font-mono)"
        fontSize="7"
        fill="rgba(110,195,230,0.6)"
      >
        бак {Math.round(fill * 100)}%
      </text>
    </g>
  );
}
