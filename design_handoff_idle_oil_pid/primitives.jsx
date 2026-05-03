// Shared primitives for the oil idle game blueprints
// Exposes: Pumpjack, BarrelTank, ProgressBar, ResearchNode, LineLabel, OilDrops

const { useState, useEffect, useRef } = React;

// ─────────────────────────────────────────────────────────────
// Pumpjack — animated SVG of a horsehead pump
// props: size, color, running (bool), small (bool, simplified)
// ─────────────────────────────────────────────────────────────
function Pumpjack({
  size = 96,
  color = "var(--ink-0)",
  running = true,
  opacity = 1,
  accent = "var(--amber)",
}) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" style={{ overflow: "visible", opacity }}>
      {/* ground line */}
      <line x1="2" y1="86" x2="98" y2="86" stroke={color} strokeWidth="1" />
      {/* derrick truss base */}
      <polygon points="38,86 62,86 56,52 44,52" fill="none" stroke={color} strokeWidth="1.2" />
      <line x1="44" y1="52" x2="62" y2="86" stroke={color} strokeWidth="0.6" />
      <line x1="56" y1="52" x2="38" y2="86" stroke={color} strokeWidth="0.6" />
      <line x1="41" y1="69" x2="59" y2="69" stroke={color} strokeWidth="0.6" />
      {/* pivot */}
      <circle cx="50" cy="52" r="2" fill={color} />
      {/* walking beam (the arm) — rotates ±. Polished rod is NOT inside this group, it's a separate element so its bottom stays anchored at the wellhead. */}
      <g className={running ? "pump-arm" : ""} style={{ transformOrigin: "50px 52px" }}>
        <rect x="14" y="50" width="72" height="4" fill={color} />
        {/* horsehead */}
        <path d="M 14 50 L 8 46 L 4 50 L 8 54 L 14 54 Z" fill={color} />
        {/* counterweight */}
        <circle cx="84" cy="52" r="6" fill={color} />
      </g>
      {/* polished rod — vertical, top y oscillates synchronously with horsehead height, bottom stays planted at wellhead (y=84) */}
      <line
        className={running ? "pump-rod" : ""}
        x1="10"
        y1="40"
        x2="10"
        y2="84"
        stroke={color}
        strokeWidth="1.4"
        style={{ transformOrigin: "10px 84px" }}
      />
      {/* wellhead box */}
      <rect
        x="6"
        y="76"
        width="10"
        height="10"
        fill={color === "var(--ink-0)" ? "var(--paper-0)" : "var(--blue-0)"}
        stroke={color}
        strokeWidth="1"
      />
      <line x1="11" y1="76" x2="11" y2="86" stroke={color} strokeWidth="0.5" />
    </svg>
  );
}

// ─────────────────────────────────────────────────────────────
// BarrelTank — vertical tank with fill level
// ─────────────────────────────────────────────────────────────
function BarrelTank({
  width = 60,
  height = 80,
  fill = 0.5,
  color = "var(--ink-0)",
  accent = "var(--amber)",
}) {
  const fillH = (height - 8) * Math.max(0, Math.min(1, fill));
  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      style={{ overflow: "visible" }}
    >
      {/* tank body */}
      <rect
        x="2"
        y="6"
        width={width - 4}
        height={height - 8}
        fill="none"
        stroke={color}
        strokeWidth="1"
      />
      {/* fill */}
      <rect
        x="3"
        y={height - 2 - fillH}
        width={width - 6}
        height={fillH}
        fill={accent}
        opacity="0.5"
      />
      <rect
        x="3"
        y={height - 2 - fillH}
        width={width - 6}
        height={fillH}
        className="hatch-amber"
        opacity="0.7"
      />
      {/* top cap */}
      <ellipse
        cx={width / 2}
        cy="6"
        rx={(width - 4) / 2}
        ry="3"
        fill="var(--paper-0)"
        stroke={color}
        strokeWidth="1"
      />
      {/* level ticks */}
      {[0.25, 0.5, 0.75].map((t) => (
        <line
          key={t}
          x1={width - 5}
          y1={6 + (height - 8) * (1 - t)}
          x2={width - 2}
          y2={6 + (height - 8) * (1 - t)}
          stroke={color}
          strokeWidth="0.5"
        />
      ))}
    </svg>
  );
}

// ─────────────────────────────────────────────────────────────
// ProgressBar — segmented technical bar
// ─────────────────────────────────────────────────────────────
function ProgressBar({
  value = 0.5,
  segments = 20,
  height = 8,
  color = "var(--ink-0)",
  accent = "var(--amber)",
  danger = false,
}) {
  const filled = Math.round(segments * Math.max(0, Math.min(1, value)));
  return (
    <div
      style={{
        display: "flex",
        gap: 1,
        height,
        border: `1px solid ${color}`,
        padding: 1,
        background: "transparent",
      }}
    >
      {Array.from({ length: segments }).map((_, i) => (
        <div
          key={i}
          style={{
            flex: 1,
            background: i < filled ? (danger ? "var(--rust)" : accent) : "transparent",
          }}
        />
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// LineLabel — engineering callout: dot + line + label
// ─────────────────────────────────────────────────────────────
function LineLabel({ children, x1, y1, x2, y2, side = "right", color = "var(--ink-0)" }) {
  return (
    <div style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
      <svg
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          overflow: "visible",
        }}
      >
        <circle cx={x1} cy={y1} r="2" fill={color} />
        <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={color} strokeWidth="0.6" />
        <line
          x1={x2}
          y1={y2}
          x2={x2 + (side === "right" ? 30 : -30)}
          y2={y2}
          stroke={color}
          strokeWidth="0.6"
        />
      </svg>
      <div
        style={{
          position: "absolute",
          left: side === "right" ? x2 + 32 : "auto",
          right: side === "left" ? `calc(100% - ${x2 - 32}px)` : "auto",
          top: y2 - 6,
          fontFamily: "var(--font-mono)",
          fontSize: 9,
          textTransform: "uppercase",
          letterSpacing: "0.08em",
          color,
        }}
      >
        {children}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// OilDrops — falling oil particle animation
// ─────────────────────────────────────────────────────────────
function OilDrops({ rate = 1, color = "var(--amber-deep)", x = 50, y = 50, count = 4 }) {
  const drops = Array.from({ length: count }).map((_, i) => i);
  return (
    <g>
      {drops.map((i) => (
        <circle
          key={i}
          cx={x}
          cy={y}
          r="1.4"
          fill={color}
          style={{
            animation: `oil-drop ${1.4 / rate}s ease-in ${i * 0.35}s infinite`,
            transformOrigin: `${x}px ${y}px`,
          }}
        />
      ))}
    </g>
  );
}

// ─────────────────────────────────────────────────────────────
// Research data — shared
// ─────────────────────────────────────────────────────────────
const RESEARCH = [
  {
    id: "R1",
    name: "Опытный бурильщик",
    name_en: "Skilled Driller",
    xp: 90,
    req: [],
    effect: "+25% добыча",
    effect_en: "+25% extraction",
  },
  {
    id: "R2",
    name: "Дешёвые контракты",
    name_en: "Cheap Contracts",
    xp: 140,
    req: [],
    effect: "−20% цена контракта",
    effect_en: "−20% contract cost",
  },
  {
    id: "R3",
    name: "Расширенный резервуар",
    name_en: "Expanded Tank",
    xp: 280,
    req: ["R1"],
    effect: "+50% ёмкость",
    effect_en: "+50% capacity",
  },
  {
    id: "R4",
    name: "Долгосрочные контракты",
    name_en: "Long Contracts",
    xp: 450,
    req: ["R2"],
    effect: "+60% длительность",
    effect_en: "+60% duration",
  },
  {
    id: "R5",
    name: "Вторичная добыча",
    name_en: "Secondary Recovery",
    xp: 750,
    req: ["R3"],
    effect: "мин. 1.5 барр/с",
    effect_en: "min 1.5 bbl/s",
  },
  {
    id: "R6",
    name: "6-й слот станции",
    name_en: "6th Station Slot",
    xp: 1150,
    req: ["R3"],
    effect: "+1 слот",
    effect_en: "+1 slot",
  },
  {
    id: "R7",
    name: "Автопродление",
    name_en: "Auto-Renew",
    xp: 1600,
    req: ["R4"],
    effect: "контракт продлевается",
    effect_en: "auto-renew contract",
  },
  {
    id: "R8",
    name: "Нефтепровод",
    name_en: "Pipeline",
    xp: 2200,
    req: ["R5", "R6"],
    effect: "автопродажа 10%/25с",
    effect_en: "auto-sell 10% / 25s",
  },
];

// Status of research nodes for demo
const RESEARCH_STATE = {
  R1: "done", // bought
  R2: "done",
  R3: "available", // can buy
  R4: "available",
  R5: "locked",
  R6: "locked",
  R7: "locked",
  R8: "locked",
};

Object.assign(window, {
  Pumpjack,
  BarrelTank,
  ProgressBar,
  LineLabel,
  OilDrops,
  RESEARCH,
  RESEARCH_STATE,
});
