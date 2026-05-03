interface Props {
  size?: number;
  color?: string;
  running?: boolean;
  opacity?: number;
}

/**
 * Анимированный SVG-насос (pumpjack) в стиле инженерного чертежа.
 * Walking beam качается ±15°; полированный шток — отдельный элемент,
 * чтобы его нижний край оставался прибит к устью скважины.
 */
export function Pumpjack({
  size = 96,
  color = "var(--bp-line)",
  running = true,
  opacity = 1,
}: Props) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      style={{ overflow: "visible", opacity }}
      aria-hidden="true"
    >
      {/* Линия земли */}
      <line x1="2" y1="86" x2="98" y2="86" stroke={color} strokeWidth="1" />
      {/* Каркас вышки */}
      <polygon points="38,86 62,86 56,52 44,52" fill="none" stroke={color} strokeWidth="1.2" />
      <line x1="44" y1="52" x2="62" y2="86" stroke={color} strokeWidth="0.6" />
      <line x1="56" y1="52" x2="38" y2="86" stroke={color} strokeWidth="0.6" />
      <line x1="41" y1="69" x2="59" y2="69" stroke={color} strokeWidth="0.6" />
      {/* Шарнир */}
      <circle cx="50" cy="52" r="2" fill={color} />
      {/* Walking beam с лошадиной головой и противовесом */}
      <g className={running ? "pump-arm" : ""}>
        <rect x="14" y="50" width="72" height="4" fill={color} />
        <path d="M 14 50 L 8 46 L 4 50 L 8 54 L 14 54 Z" fill={color} />
        <circle cx="84" cy="52" r="6" fill={color} />
      </g>
      {/* Полированный шток — отдельно от beam, чтобы низ оставался у устья */}
      <line
        className={running ? "pump-rod" : ""}
        x1="10"
        y1="40"
        x2="10"
        y2="84"
        stroke={color}
        strokeWidth="1.4"
      />
      {/* Устье скважины */}
      <rect
        x="6"
        y="76"
        width="10"
        height="10"
        fill="var(--bp-bg)"
        stroke={color}
        strokeWidth="1"
      />
      <line x1="11" y1="76" x2="11" y2="86" stroke={color} strokeWidth="0.5" />
    </svg>
  );
}
