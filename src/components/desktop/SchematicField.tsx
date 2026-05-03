import { calcOilProductionRate } from "@/game/mechanics/oil";
import { getResearchModifiers } from "@/game/mechanics/research";
import { useGameStore } from "@/stores/gameStore";
import type { OilStation } from "@/types/game";
import { Pumpjack } from "../Pumpjack";

// Размер чертежа: уменьшил viewBox чтобы внутренние объекты автоматически
// масштабировались крупнее в реальном контейнере. Aspect ~1.4 — близко
// к bp-desktop__field, минимум "letterbox" пустоты по бокам.
const VIEW_W = 700;
const VIEW_H = 500;

// Геометрия станции
const ST_R = 42; // радиус основного круга станции (был 28)
const ST_RING_R = 50; // selection ring (выделение)
const ST_EMPTY_R = ST_R + 4; // empty-pulse — ближе к станции, чтобы не задевать текст «ИССЯКЛА»
const ST_PROG_R = 34; // радиус progress-arc
const ST_PROG_C = 2 * Math.PI * ST_PROG_R; // длина окружности

// Узел сбора и резервуар
const HUB_HALF = 32; // полуширина квадрата hub'а (была 26)
const TANK_HALF_W = 44; // полуширина резервуара
const TANK_HALF_H = 56; // полувысота
const TANK_W = TANK_HALF_W * 2;
const TANK_H = TANK_HALF_H * 2;

// Позиции 6 слотов на чертеже VIEW_W × VIEW_H.
// Узел сбора — центр, резервуар — справа, станции вокруг по дуге.
const HUB = { x: 320, y: 260 };
const TANK = { x: 590, y: 260 };
const SLOT_POSITIONS = [
  { x: 130, y: 200 }, // 1: верх-лево
  { x: 280, y: 90 }, // 2: верх
  { x: 200, y: 380 }, // 3: низ-лево
  { x: 420, y: 410 }, // 4: низ
  { x: 470, y: 100 }, // 5: верх-право
  { x: 580, y: 410 }, // 6: низ-право (R6)
];

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
  const placed = stations.map((s, i) => ({
    station: s,
    pos: SLOT_POSITIONS[i] ?? fallback,
    rate: calcOilProductionRate(s, mods),
  }));

  return (
    <svg
      viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
      preserveAspectRatio="xMidYMid meet"
      width="100%"
      height="100%"
      style={{ overflow: "visible" }}
      role="img"
    >
      <title>Схема нефтяного поля Blackwell</title>
      <ReservoirContours />
      {placed
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
      {placed.map((f) => (
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
        rx="260"
        ry="200"
        fill="none"
        stroke="rgba(244,180,84,0.25)"
        strokeWidth="0.6"
        strokeDasharray="3 3"
      />
      <ellipse
        cx={HUB.x}
        cy={HUB.y}
        rx="180"
        ry="140"
        fill="none"
        stroke="rgba(244,180,84,0.3)"
        strokeWidth="0.6"
        strokeDasharray="3 3"
      />
      <ellipse
        cx={HUB.x}
        cy={HUB.y}
        rx="100"
        ry="80"
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
  const x1 = x + ux * ST_R;
  const y1 = y + uy * ST_R;
  const x2 = HUB.x - ux * HUB_HALF;
  const y2 = HUB.y - uy * HUB_HALF;
  return (
    <g>
      <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="rgba(110,195,230,0.55)" strokeWidth="3" />
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

function PipeHubToTank() {
  const dx = TANK.x - HUB.x;
  const dy = TANK.y - HUB.y;
  const d = Math.hypot(dx, dy);
  const ux = dx / d;
  const uy = dy / d;
  const x1 = HUB.x + ux * HUB_HALF;
  const y1 = HUB.y + uy * HUB_HALF;
  const x2 = TANK.x - ux * TANK_HALF_W;
  const y2 = TANK.y - uy * TANK_HALF_W;
  return (
    <g>
      <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="rgba(110,195,230,0.7)" strokeWidth="4" />
      <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="var(--bp-bg)" strokeWidth="1.4" />
      <line
        className="flow-line"
        x1={x1}
        y1={y1}
        x2={x2}
        y2={y2}
        stroke="var(--bp-amber)"
        strokeWidth="1.8"
      />
    </g>
  );
}

function Hub() {
  const inner = HUB_HALF - 4;
  return (
    <g transform={`translate(${HUB.x} ${HUB.y})`}>
      <rect
        x={-HUB_HALF}
        y={-HUB_HALF}
        width={HUB_HALF * 2}
        height={HUB_HALF * 2}
        fill="var(--bp-bg)"
        stroke="var(--bp-line)"
        strokeWidth="1.4"
      />
      <rect
        x={-inner}
        y={-inner}
        width={inner * 2}
        height={inner * 2}
        fill="none"
        stroke="var(--bp-line)"
        strokeWidth="0.5"
      />
      <circle r="11" fill="none" stroke="var(--bp-line)" strokeWidth="1.2" />
      <line x1="-11" y1="0" x2="11" y2="0" stroke="var(--bp-line)" strokeWidth="0.7" />
      <line x1="0" y1="-11" x2="0" y2="11" stroke="var(--bp-line)" strokeWidth="0.7" />
      <rect
        x="-58"
        y={-HUB_HALF - 26}
        width="116"
        height="22"
        fill="var(--bp-bg)"
        stroke="var(--bp-line)"
        strokeWidth="0.7"
      />
      <text
        x="0"
        y={-HUB_HALF - 11}
        textAnchor="middle"
        fontFamily="var(--font-mono)"
        fontSize="13"
        fontWeight="600"
        fill="var(--bp-line)"
      >
        УЗЕЛ СБОРА
      </text>
      <text
        x="0"
        y={HUB_HALF + 14}
        textAnchor="middle"
        fontFamily="var(--font-mono)"
        fontSize="10"
        fill="rgba(110,195,230,0.6)"
      >
        M-01
      </text>
    </g>
  );
}

function Tank({ oil, capacity }: { oil: number; capacity: number }) {
  const fill = Math.min(1, oil / capacity);
  const fillH = TANK_H * fill;
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
      <rect x={-TANK_HALF_W} y={-TANK_HALF_H} width={TANK_W} height={TANK_H} fill="var(--bp-bg)" />
      <rect
        x={-TANK_HALF_W}
        y={TANK_HALF_H - fillH}
        width={TANK_W}
        height={fillH}
        fill="rgba(244,180,84,0.45)"
      />
      <rect
        x={-TANK_HALF_W}
        y={TANK_HALF_H - fillH}
        width={TANK_W}
        height={fillH}
        fill="url(#tank-hatch)"
      />
      <line
        x1={-TANK_HALF_W}
        y1={TANK_HALF_H - fillH}
        x2={TANK_HALF_W}
        y2={TANK_HALF_H - fillH}
        stroke="var(--bp-amber)"
        strokeWidth="1.2"
      />
      <rect
        x={-TANK_HALF_W}
        y={-TANK_HALF_H}
        width={TANK_W}
        height={TANK_H}
        fill="none"
        stroke="var(--bp-line)"
        strokeWidth="1.4"
      />
      {[0.25, 0.5, 0.75].map((t) => (
        <line
          key={t}
          x1={-TANK_HALF_W}
          y1={-TANK_HALF_H + TANK_H * t}
          x2={-TANK_HALF_W - 5}
          y2={-TANK_HALF_H + TANK_H * t}
          stroke="var(--bp-line)"
          strokeWidth="0.6"
        />
      ))}
      <text
        x="0"
        y={-TANK_HALF_H - 14}
        textAnchor="middle"
        fontFamily="var(--font-mono)"
        fontSize="13"
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
        fontSize="14"
        fontWeight="700"
        fill="var(--bp-line)"
      >
        {Math.round(oil).toLocaleString("ru-RU")}
      </text>
      <text
        x="0"
        y="18"
        textAnchor="middle"
        fontFamily="var(--font-mono)"
        fontSize="10"
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
        r={ST_R}
        fill="var(--bp-bg)"
        stroke="rgba(110,195,230,0.4)"
        strokeWidth="1"
        strokeDasharray="3 3"
      />
      <line x1="-10" y1="0" x2="10" y2="0" stroke="rgba(110,195,230,0.6)" strokeWidth="1.4" />
      <line x1="0" y1="-10" x2="0" y2="10" stroke="rgba(110,195,230,0.6)" strokeWidth="1.4" />
      <text
        x="0"
        y={ST_R + 18}
        textAnchor="middle"
        fontFamily="var(--font-mono)"
        fontSize="11"
        fill="rgba(110,195,230,0.55)"
        letterSpacing="1.5"
      >
        СЛОТ {index}
      </text>
      {locked && (
        <text
          x="0"
          y={ST_R + 32}
          textAnchor="middle"
          fontFamily="var(--font-mono)"
          fontSize="10"
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
  const arcLen = fill * ST_PROG_C;
  // Tag bubble «PIT-XXX / W-XX» — отстоит от станции на TAG_GAP, между
  // ними рисуется тонкая линия-связь.
  const tagW = 90;
  const tagH = 36;
  const TAG_GAP = 12;
  const tagY = -ST_R - TAG_GAP - tagH;
  // Pumpjack центрируем по станции: размер = 100 × scale; translate = -size/2.
  // Scale 0.6 — pumpjack занимает ~60% диаметра станции, ground line чуть
  // не доходит до ободка снизу.
  const PUMP_SCALE = 0.6;
  const PUMP_OFFSET = -50 * PUMP_SCALE;
  // Статус-точка: чуть утоплена внутри ободка станции.
  const DOT_OFFSET = (ST_R - 4) * Math.SQRT1_2;
  // Истощённая станция: пульсирующее амбер-кольцо снаружи, статус-метка
  // переключается на «иссякла».
  const empty = fill < 0.05;
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
          r={ST_RING_R}
          fill="none"
          stroke="var(--bp-amber)"
          strokeWidth="1.6"
          strokeDasharray="4 3"
          className="march"
        />
      )}
      {empty && !selected && (
        <circle
          r={ST_EMPTY_R}
          fill="none"
          stroke="var(--bp-amber)"
          strokeWidth="2"
          className="empty-pulse"
        />
      )}
      <circle r={ST_R + 2} fill="var(--bp-bg)" />
      <line x1="0" y1={-ST_R} x2="0" y2={tagY + tagH} stroke="var(--bp-line)" strokeWidth="0.6" />
      <rect
        x={-tagW / 2}
        y={tagY}
        width={tagW}
        height={tagH}
        fill="var(--bp-bg)"
        stroke="var(--bp-line)"
        strokeWidth="0.9"
      />
      <text
        x="0"
        y={tagY + 13}
        textAnchor="middle"
        fontFamily="var(--font-mono)"
        fontSize="9"
        fill="rgba(110,195,230,0.6)"
        letterSpacing="1"
      >
        {pitCode}
      </text>
      <text
        x="0"
        y={tagY + 28}
        textAnchor="middle"
        fontFamily="var(--font-mono)"
        fontSize="13"
        fontWeight="700"
        fill="var(--bp-line)"
      >
        {wellCode}
      </text>
      <circle r={ST_R} fill="var(--bp-bg)" stroke="var(--bp-line)" strokeWidth="1.5" />
      <circle
        r={ST_R}
        fill="none"
        stroke={station.enabled ? "var(--bp-amber)" : "rgba(110,195,230,0.3)"}
        strokeWidth="0.8"
        strokeDasharray={station.enabled ? "0" : "2 2"}
      />
      <g transform={`translate(${PUMP_OFFSET} ${PUMP_OFFSET}) scale(${PUMP_SCALE})`}>
        <Pumpjack size={100} running={station.enabled} color="var(--bp-line)" />
      </g>
      <circle r={ST_PROG_R} fill="none" stroke="rgba(244,180,84,0.18)" strokeWidth="4" />
      <circle
        r={ST_PROG_R}
        fill="none"
        stroke="var(--bp-amber)"
        strokeWidth="4"
        strokeDasharray={`${arcLen} ${ST_PROG_C}`}
        transform="rotate(-90)"
      />
      <circle
        cx={DOT_OFFSET}
        cy={-DOT_OFFSET}
        r="5"
        fill={empty ? "var(--bp-amber)" : station.enabled ? "var(--bp-green)" : "var(--bp-rust)"}
        stroke="var(--bp-bg)"
        strokeWidth="1.4"
      />
      <text
        x="0"
        y={ST_R + 22}
        textAnchor="middle"
        fontFamily="var(--font-mono)"
        fontSize="13"
        fontWeight="700"
        fill={empty ? "var(--bp-amber)" : "var(--bp-line)"}
      >
        {empty ? "ИССЯКЛА" : `${rate.toFixed(1)} барр/с`}
      </text>
      <text
        x="0"
        y={ST_R + 36}
        textAnchor="middle"
        fontFamily="var(--font-mono)"
        fontSize="10"
        fill={empty ? "var(--bp-amber)" : "rgba(110,195,230,0.6)"}
      >
        бак {Math.round(fill * 100)}%
      </text>
    </g>
  );
}
