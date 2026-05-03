import { OIL_TANK_CAPACITY } from "@/constants/game";
import { calcOilProductionRate } from "@/game/mechanics/oil";
import { getResearchModifiers } from "@/game/mechanics/research";
import { useGameStore } from "@/stores/gameStore";
import type { OilStation } from "@/types/game";
import { wellCode } from "@/utils/stationFormat";
import { Pumpjack } from "../Pumpjack";

const SLOT_POSITIONS = [
  { x: 60, y: 250 },
  { x: 80, y: 110 },
  { x: 185, y: 380 },
  { x: 310, y: 320 },
  { x: 310, y: 110 },
  { x: 60, y: 380 },
];
const HUB = { x: 185, y: 220 };
const TANK = { x: 185, y: 60 };

interface Props {
  selectedId: number | null;
  onSelect: (id: number | null) => void;
}

export function MobileSchematic({ selectedId, onSelect }: Props) {
  const stations = useGameStore((s) => s.stations);
  const oil = useGameStore((s) => s.oil);
  const completedResearch = useGameStore((s) => s.completedResearch);
  const mods = getResearchModifiers(completedResearch);
  const fallback = { x: 0, y: 0 };
  const placed = stations.map((s, i) => ({
    station: s,
    pos: SLOT_POSITIONS[i] ?? fallback,
    rate: calcOilProductionRate(s, mods),
  }));

  return (
    <svg
      viewBox="0 0 380 460"
      preserveAspectRatio="xMidYMid meet"
      width="100%"
      height="100%"
      style={{ overflow: "visible" }}
      role="img"
    >
      <title>Схема нефтяного поля</title>
      <Reservoir />
      {placed
        .filter((p) => p.station.enabled)
        .map((p) => (
          <Pipe key={`pipe-${p.station.id}`} x={p.pos.x} y={p.pos.y} />
        ))}
      <PipeHubToTank />
      <Tank oil={oil} />
      <Hub />
      {SLOT_POSITIONS.flatMap((pos, i) => {
        if (i < stations.length || i >= mods.maxStationSlots) return [];
        const slotIndex = i + 1;
        return <EmptySlot key={`empty-${slotIndex}`} x={pos.x} y={pos.y} index={slotIndex} />;
      })}
      {placed.map((p) => (
        <StationNode
          key={p.station.id}
          station={p.station}
          rate={p.rate}
          x={p.pos.x}
          y={p.pos.y}
          selected={selectedId === p.station.id}
          onSelect={() => onSelect(selectedId === p.station.id ? null : p.station.id)}
        />
      ))}
    </svg>
  );
}

function Reservoir() {
  return (
    <>
      <ellipse
        cx={HUB.x}
        cy={HUB.y}
        rx="160"
        ry="180"
        fill="none"
        stroke="rgba(244,180,84,0.22)"
        strokeWidth="0.6"
        strokeDasharray="3 3"
      />
      <ellipse
        cx={HUB.x}
        cy={HUB.y}
        rx="105"
        ry="120"
        fill="none"
        stroke="rgba(244,180,84,0.32)"
        strokeWidth="0.6"
        strokeDasharray="3 3"
      />
      <ellipse
        cx={HUB.x}
        cy={HUB.y}
        rx="55"
        ry="65"
        fill="none"
        stroke="rgba(244,180,84,0.5)"
        strokeWidth="0.6"
        strokeDasharray="3 3"
      />
    </>
  );
}

function Pipe({ x, y }: { x: number; y: number }) {
  const dx = HUB.x - x;
  const dy = HUB.y - y;
  const d = Math.hypot(dx, dy);
  const ux = dx / d;
  const uy = dy / d;
  const x1 = x + ux * 22;
  const y1 = y + uy * 22;
  const x2 = HUB.x - ux * 22;
  const y2 = HUB.y - uy * 22;
  return (
    <g>
      <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="rgba(110,195,230,0.55)" strokeWidth="2.2" />
      <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="var(--bp-bg)" strokeWidth="0.8" />
      <line
        className="flow-line"
        x1={x1}
        y1={y1}
        x2={x2}
        y2={y2}
        stroke="var(--bp-amber)"
        strokeWidth="1.2"
      />
    </g>
  );
}

function PipeHubToTank() {
  return (
    <g>
      <line
        x1={HUB.x}
        y1={HUB.y - 22}
        x2={TANK.x}
        y2={TANK.y + 28}
        stroke="rgba(110,195,230,0.7)"
        strokeWidth="3"
      />
      <line
        x1={HUB.x}
        y1={HUB.y - 22}
        x2={TANK.x}
        y2={TANK.y + 28}
        stroke="var(--bp-bg)"
        strokeWidth="1"
      />
      <line
        className="flow-line"
        x1={HUB.x}
        y1={HUB.y - 22}
        x2={TANK.x}
        y2={TANK.y + 28}
        stroke="var(--bp-amber)"
        strokeWidth="1.4"
      />
    </g>
  );
}

function Tank({ oil }: { oil: number }) {
  const fill = Math.min(1, oil / OIL_TANK_CAPACITY);
  const fillH = 56 * fill;
  return (
    <g transform={`translate(${TANK.x} ${TANK.y})`}>
      <defs>
        <pattern
          id="m-tank-hatch"
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
      <rect x="-46" y="-26" width="92" height="56" fill="var(--bp-bg)" />
      <rect x="-46" y={30 - fillH} width="92" height={fillH} fill="rgba(244,180,84,0.45)" />
      <rect x="-46" y={30 - fillH} width="92" height={fillH} fill="url(#m-tank-hatch)" />
      <line
        x1="-46"
        y1={30 - fillH}
        x2="46"
        y2={30 - fillH}
        stroke="var(--bp-amber)"
        strokeWidth="0.8"
      />
      <rect
        x="-46"
        y="-26"
        width="92"
        height="56"
        fill="none"
        stroke="var(--bp-line)"
        strokeWidth="1.2"
      />
      <text
        x="0"
        y="-32"
        textAnchor="middle"
        fontFamily="var(--font-mono)"
        fontSize="9"
        fontWeight="600"
        fill="var(--bp-line)"
      >
        РЕЗЕРВУАР
      </text>
      <text
        x="0"
        y="2"
        textAnchor="middle"
        fontFamily="var(--font-mono)"
        fontSize="13"
        fontWeight="700"
        fill="var(--bp-line)"
      >
        {Math.round(oil).toLocaleString("ru-RU")}
      </text>
      <text
        x="0"
        y="14"
        textAnchor="middle"
        fontFamily="var(--font-mono)"
        fontSize="8"
        fill="rgba(110,195,230,0.7)"
      >
        / {OIL_TANK_CAPACITY.toLocaleString("ru-RU")} барр
      </text>
    </g>
  );
}

function Hub() {
  return (
    <g transform={`translate(${HUB.x} ${HUB.y})`}>
      <rect
        x="-22"
        y="-22"
        width="44"
        height="44"
        fill="var(--bp-bg)"
        stroke="var(--bp-line)"
        strokeWidth="1.2"
      />
      <rect
        x="-18"
        y="-18"
        width="36"
        height="36"
        fill="none"
        stroke="var(--bp-line)"
        strokeWidth="0.5"
      />
      <circle r="7" fill="none" stroke="var(--bp-line)" strokeWidth="1" />
      <line x1="-7" y1="0" x2="7" y2="0" stroke="var(--bp-line)" strokeWidth="0.6" />
      <line x1="0" y1="-7" x2="0" y2="7" stroke="var(--bp-line)" strokeWidth="0.6" />
    </g>
  );
}

function EmptySlot({ x, y, index }: { x: number; y: number; index: number }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <circle
        r="20"
        fill="var(--bp-bg)"
        stroke="rgba(110,195,230,0.4)"
        strokeWidth="1"
        strokeDasharray="3 3"
      />
      <line x1="-7" y1="0" x2="7" y2="0" stroke="rgba(110,195,230,0.6)" strokeWidth="1" />
      <line x1="0" y1="-7" x2="0" y2="7" stroke="rgba(110,195,230,0.6)" strokeWidth="1" />
      <text
        x="0"
        y="34"
        textAnchor="middle"
        fontFamily="var(--font-mono)"
        fontSize="7"
        fill="rgba(110,195,230,0.55)"
        letterSpacing="1"
      >
        СЛОТ {index}
      </text>
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
  const arcLen = fill * 113;
  return (
    // biome-ignore lint/a11y/useSemanticElements: <button> нельзя положить в SVG-дерево
    <g
      transform={`translate(${x} ${y})`}
      opacity={station.enabled ? 1 : 0.45}
      onClick={onSelect}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onSelect();
        }
      }}
      role="button"
      tabIndex={0}
      aria-label={wellCode(station.id)}
      style={{ cursor: "pointer" }}
    >
      {selected && (
        <circle
          r="30"
          fill="none"
          stroke="var(--bp-amber)"
          strokeWidth="1.4"
          strokeDasharray="4 3"
          className="march"
        />
      )}
      <circle r="24" fill="var(--bp-bg)" />
      <circle r="22" fill="var(--bp-bg)" stroke="var(--bp-line)" strokeWidth="1.2" />
      <circle
        r="22"
        fill="none"
        stroke={station.enabled ? "var(--bp-amber)" : "rgba(110,195,230,0.3)"}
        strokeWidth="0.6"
        strokeDasharray={station.enabled ? "0" : "2 2"}
      />
      <g transform="translate(-12 -12) scale(0.24)">
        <Pumpjack size={100} running={station.enabled} color="var(--bp-line)" />
      </g>
      <circle r="18" fill="none" stroke="rgba(244,180,84,0.18)" strokeWidth="2.5" />
      <circle
        r="18"
        fill="none"
        stroke="var(--bp-amber)"
        strokeWidth="2.5"
        strokeDasharray={`${arcLen} 113`}
        transform="rotate(-90)"
      />
      <circle
        cx="17"
        cy="-17"
        r="3.5"
        fill={station.enabled ? "var(--bp-green)" : "var(--bp-rust)"}
        stroke="var(--bp-bg)"
        strokeWidth="1"
      />
      <rect
        x="-22"
        y="-44"
        width="44"
        height="14"
        fill="var(--bp-bg)"
        stroke="var(--bp-line)"
        strokeWidth="0.5"
      />
      <text
        x="0"
        y="-34"
        textAnchor="middle"
        fontFamily="var(--font-mono)"
        fontSize="8"
        fontWeight="700"
        fill="var(--bp-line)"
      >
        {wellCode(station.id)}
      </text>
      <text
        x="0"
        y="36"
        textAnchor="middle"
        fontFamily="var(--font-mono)"
        fontSize="8"
        fontWeight="600"
        fill="var(--bp-line)"
      >
        {rate.toFixed(1)} б/с
      </text>
    </g>
  );
}
