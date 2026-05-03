// V5 Mobile — single-screen blueprint UI for phones (no device frame, 390x844)
// Layout: top stat strip + contract banner + schematic + sell card + station list / R&D tabs

const { useState: useStateM, useRef: useRefM, useEffect: useEffectM } = React;

function V5Mobile() {
  const [tab, setTab] = useStateM("field");
  const [selected, setSelected] = useStateM(null);

  const stationsData = [
    { id: 1, name: "W-01", fill: 0.72, rate: 6.8, on: true, power: 8 },
    { id: 2, name: "W-02", fill: 0.34, rate: 4.2, on: true, power: 6 },
    { id: 3, name: "W-03", fill: 0.91, rate: 8.5, on: true, power: 10 },
    { id: 4, name: "W-04", fill: 0.12, rate: 1.8, on: true, power: 6 },
    { id: 5, name: "W-05", fill: 0, rate: 0, on: false, power: 0 },
  ];
  const sel = stationsData.find((s) => s.id === selected);

  return (
    <div
      className="bp-blueprint"
      style={{
        width: "100%",
        height: "100%",
        position: "relative",
        fontFamily: "var(--font-ui)",
        color: "var(--blue-line)",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      {/* status bar — slim, full width */}
      <div
        style={{
          height: 44,
          padding: "0 14px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          borderBottom: "1px solid var(--blue-line)",
          background: "rgba(14,42,58,0.85)",
          fontFamily: "var(--font-mono)",
          fontSize: 10,
          letterSpacing: "0.1em",
          flexShrink: 0,
        }}
      >
        <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
          <span style={{ fontSize: 8, opacity: 0.6 }}>BLACKWELL</span>
          <span style={{ fontFamily: "var(--font-display)", fontSize: 12, fontWeight: 700 }}>
            $2 840
          </span>
        </div>
        <div style={{ display: "flex", gap: 12 }}>
          <span>
            <span style={{ opacity: 0.6 }}>НФТ </span>
            <span className="tnum" style={{ fontWeight: 700 }}>
              1 206
            </span>
          </span>
          <span>
            <span style={{ opacity: 0.6 }}>XP </span>
            <span className="tnum" style={{ fontWeight: 700 }}>
              412
            </span>
          </span>
          <span style={{ color: "#f4b454" }}>40/50</span>
        </div>
      </div>

      {/* contract banner */}
      <div
        style={{
          height: 38,
          padding: "0 14px",
          display: "flex",
          alignItems: "center",
          gap: 10,
          borderBottom: "1px solid rgba(110,195,230,0.25)",
          background: "rgba(244,180,84,0.06)",
          flexShrink: 0,
        }}
      >
        <span
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 9,
            letterSpacing: "0.16em",
            color: "#f4b454",
          }}
        >
          ЭНЕРГИЯ
        </span>
        <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, fontWeight: 600 }}>
          T−00:48
        </span>
        <div
          style={{
            flex: 1,
            height: 6,
            border: "1px solid rgba(110,195,230,0.35)",
            display: "flex",
            gap: 1,
            padding: 1,
          }}
        >
          {Array.from({ length: 24 }).map((_, i) => (
            <div key={i} style={{ flex: 1, background: i < 14 ? "#f4b454" : "transparent" }} />
          ))}
        </div>
        <button
          style={{
            border: "1px solid #f4b454",
            background: "#f4b454",
            color: "var(--blue-0)",
            fontFamily: "var(--font-mono)",
            fontSize: 10,
            fontWeight: 700,
            padding: "4px 10px",
            letterSpacing: "0.06em",
            cursor: "pointer",
          }}
        >
          +$140
        </button>
      </div>

      {/* SCHEMATIC — always visible, fixed height */}
      <div
        style={{
          height: 420,
          position: "relative",
          borderBottom: "1px solid var(--blue-line)",
          flexShrink: 0,
          padding: "8px 6px",
        }}
      >
        <MobileSchematic stationsData={stationsData} selected={selected} onSelect={setSelected} />
      </div>

      {/* SELL CARD — always visible */}
      <SellStrip />

      {/* tab content */}
      <div style={{ flex: 1, overflow: "auto", position: "relative" }}>
        {tab === "field" && (
          <PanelField stationsData={stationsData} selected={selected} onSelect={setSelected} />
        )}
        {tab === "rnd" && <PanelRnd />}
      </div>

      {/* bottom tab bar */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(2,1fr)",
          borderTop: "1px solid var(--blue-line)",
          background: "rgba(14,42,58,0.92)",
          flexShrink: 0,
        }}
      >
        {[
          { id: "field", label: "СТАНЦИИ", sub: "4 / 5 активно" },
          { id: "rnd", label: "R&D", sub: "2 / 8 · 412 XP" },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            style={{
              background: "none",
              border: "none",
              padding: "10px 6px 14px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 2,
              color: tab === t.id ? "var(--blue-line)" : "rgba(110,195,230,0.5)",
              borderTop: tab === t.id ? "2px solid #f4b454" : "2px solid transparent",
              fontFamily: "var(--font-mono)",
              cursor: "pointer",
            }}
          >
            <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em" }}>{t.label}</span>
            <span style={{ fontSize: 8, opacity: 0.7 }}>{t.sub}</span>
          </button>
        ))}
      </div>

      {/* bottom-sheet inspector */}
      {sel && <MobileInspector station={sel} onClose={() => setSelected(null)} />}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Mobile schematic — vertical / portrait orientation
// Hub centered, stations radiate around. Tank on top.
// ─────────────────────────────────────────────────────────────
function MobileSchematic({ stationsData, selected, onSelect }) {
  // 360 wide × 440 tall portrait layout
  const stations = [
    { id: 1, x: 60, y: 250 }, // W-01 W
    { id: 2, x: 80, y: 110 }, // W-02 NW
    { id: 3, x: 185, y: 380 }, // W-03 S
    { id: 4, x: 310, y: 320 }, // W-04 SE
    { id: 5, x: 310, y: 110 }, // W-05 NE (off)
  ].map((s) => ({ ...s, ...stationsData.find((d) => d.id === s.id) }));

  const hub = { x: 185, y: 220 };
  const tank = { x: 185, y: 60 };

  return (
    <svg
      viewBox="0 0 380 460"
      preserveAspectRatio="xMidYMid meet"
      width="100%"
      height="100%"
      style={{ overflow: "visible" }}
    >
      {/* reservoir contours */}
      <ellipse
        cx={hub.x}
        cy={hub.y}
        rx="160"
        ry="180"
        fill="none"
        stroke="rgba(244,180,84,0.22)"
        strokeWidth="0.6"
        strokeDasharray="3 3"
      />
      <ellipse
        cx={hub.x}
        cy={hub.y}
        rx="105"
        ry="120"
        fill="none"
        stroke="rgba(244,180,84,0.32)"
        strokeWidth="0.6"
        strokeDasharray="3 3"
      />
      <ellipse
        cx={hub.x}
        cy={hub.y}
        rx="55"
        ry="65"
        fill="none"
        stroke="rgba(244,180,84,0.5)"
        strokeWidth="0.6"
        strokeDasharray="3 3"
      />

      {/* pipes station → hub */}
      {stations
        .filter((s) => s.on)
        .map((s) => {
          const dx = hub.x - s.x,
            dy = hub.y - s.y;
          const d = Math.hypot(dx, dy);
          const ux = dx / d,
            uy = dy / d;
          const x1 = s.x + ux * 22,
            y1 = s.y + uy * 22;
          const x2 = hub.x - ux * 22,
            y2 = hub.y - uy * 22;
          return (
            <g key={`p-${s.id}`}>
              <line
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke="rgba(110,195,230,0.55)"
                strokeWidth="2.2"
              />
              <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="var(--blue-0)" strokeWidth="0.8" />
              <line
                className="flow-line"
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke="#f4b454"
                strokeWidth="1.2"
              />
            </g>
          );
        })}

      {/* hub → tank pipe */}
      {(() => {
        const x1 = hub.x,
          y1 = hub.y - 22;
        const x2 = tank.x,
          y2 = tank.y + 28;
        return (
          <g>
            <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="rgba(110,195,230,0.7)" strokeWidth="3" />
            <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="var(--blue-0)" strokeWidth="1" />
            <line
              className="flow-line"
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke="#f4b454"
              strokeWidth="1.4"
            />
          </g>
        );
      })()}

      {/* central tank — top */}
      <g transform={`translate(${tank.x} ${tank.y})`}>
        <defs>
          <pattern
            id="m-tank-hatch"
            patternUnits="userSpaceOnUse"
            width="6"
            height="6"
            patternTransform="rotate(45)"
          >
            <line x1="0" y1="0" x2="0" y2="6" stroke="#f4b454" strokeWidth="1.2" opacity="0.55" />
          </pattern>
        </defs>
        <rect x="-46" y="-26" width="92" height="56" fill="var(--blue-0)" stroke="none" />
        <rect x="-46" y="20" width="92" height="10" fill="rgba(244,180,84,0.45)" />
        <rect x="-46" y="20" width="92" height="10" fill="url(#m-tank-hatch)" />
        <line x1="-46" y1="20" x2="46" y2="20" stroke="#f4b454" strokeWidth="0.8" />
        <rect
          x="-46"
          y="-26"
          width="92"
          height="56"
          fill="none"
          stroke="var(--blue-line)"
          strokeWidth="1.2"
        />
        <text
          x="0"
          y="-32"
          textAnchor="middle"
          fontFamily="var(--font-mono)"
          fontSize="9"
          fontWeight="600"
          fill="var(--blue-line)"
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
          fill="var(--blue-line)"
        >
          1 206
        </text>
        <text
          x="0"
          y="14"
          textAnchor="middle"
          fontFamily="var(--font-mono)"
          fontSize="8"
          fill="rgba(110,195,230,0.7)"
        >
          / 8 400 барр
        </text>
      </g>

      {/* hub */}
      <g transform={`translate(${hub.x} ${hub.y})`}>
        <rect
          x="-22"
          y="-22"
          width="44"
          height="44"
          fill="var(--blue-0)"
          stroke="var(--blue-line)"
          strokeWidth="1.2"
        />
        <rect
          x="-18"
          y="-18"
          width="36"
          height="36"
          fill="none"
          stroke="var(--blue-line)"
          strokeWidth="0.5"
        />
        <circle r="7" fill="none" stroke="var(--blue-line)" strokeWidth="1" />
        <line x1="-7" y1="0" x2="7" y2="0" stroke="var(--blue-line)" strokeWidth="0.6" />
        <line x1="0" y1="-7" x2="0" y2="7" stroke="var(--blue-line)" strokeWidth="0.6" />
      </g>

      {/* stations */}
      {/* placeholder 6th slot */}
      {(() => {
        const sx = 60,
          sy = 380;
        return (
          <g transform={`translate(${sx} ${sy})`} style={{ cursor: "pointer" }}>
            <circle
              r="20"
              fill="var(--blue-0)"
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
              СЛОТ 6
            </text>
          </g>
        );
      })()}
      {stations.map((s) => (
        <g
          key={s.id}
          transform={`translate(${s.x} ${s.y})`}
          opacity={s.on ? 1 : 0.45}
          onClick={() => onSelect(selected === s.id ? null : s.id)}
          style={{ cursor: "pointer" }}
        >
          {selected === s.id && (
            <circle
              r="30"
              fill="none"
              stroke="#f4b454"
              strokeWidth="1.4"
              strokeDasharray="4 3"
              className="march"
            />
          )}
          <circle r="24" fill="var(--blue-0)" stroke="none" />
          <circle r="22" fill="var(--blue-0)" stroke="var(--blue-line)" strokeWidth="1.2" />
          <circle
            r="22"
            fill="none"
            stroke={s.on ? "#f4b454" : "rgba(110,195,230,0.3)"}
            strokeWidth="0.6"
            strokeDasharray={s.on ? "0" : "2 2"}
          />
          {/* mini pumpjack inside */}
          <g transform="translate(-12 -12) scale(0.24)">
            <Pumpjack size={100} running={s.on} color="var(--blue-line)" />
          </g>
          {/* fill arc */}
          <circle r="18" fill="none" stroke="rgba(244,180,84,0.18)" strokeWidth="2.5" />
          <circle
            r="18"
            fill="none"
            stroke="#f4b454"
            strokeWidth="2.5"
            strokeDasharray={`${s.fill * 113} 113`}
            transform="rotate(-90)"
          />
          {/* status dot */}
          <circle
            cx="17"
            cy="-17"
            r="3.5"
            fill={s.on ? "#79d399" : "#9c9485"}
            stroke="var(--blue-0)"
            strokeWidth="1"
          />
          {/* name */}
          <rect
            x="-22"
            y="-44"
            width="44"
            height="14"
            fill="var(--blue-0)"
            stroke="var(--blue-line)"
            strokeWidth="0.5"
          />
          <text
            x="0"
            y="-34"
            textAnchor="middle"
            fontFamily="var(--font-mono)"
            fontSize="8"
            fontWeight="700"
            fill="var(--blue-line)"
          >
            {s.name}
          </text>
          {/* rate */}
          <text
            x="0"
            y="36"
            textAnchor="middle"
            fontFamily="var(--font-mono)"
            fontSize="8"
            fontWeight="600"
            fill="var(--blue-line)"
          >
            {s.rate.toFixed(1)} б/с
          </text>
        </g>
      ))}
    </svg>
  );
}

// ─────────────────────────────────────────────────────────────
// Tab content panels
// ─────────────────────────────────────────────────────────────
function PanelField({ stationsData, selected, onSelect }) {
  return (
    <div style={{ padding: 14, display: "flex", flexDirection: "column", gap: 8 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
        <div
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 9,
            letterSpacing: "0.16em",
            opacity: 0.7,
          }}
        >
          СТАНЦИИ
        </div>
        <div style={{ fontFamily: "var(--font-mono)", fontSize: 9, opacity: 0.6 }}>
          {stationsData.filter((s) => s.on).length}/{stationsData.length} активно
        </div>
      </div>
      {stationsData.map((s) => (
        <button
          key={s.id}
          onClick={() => onSelect(s.id)}
          style={{
            width: "100%",
            textAlign: "left",
            border: selected === s.id ? "1px solid #f4b454" : "1px solid var(--blue-line)",
            background: "rgba(14,42,58,0.6)",
            padding: "10px 12px",
            cursor: "pointer",
            color: "var(--blue-line)",
            display: "flex",
            alignItems: "center",
            gap: 12,
          }}
        >
          <div
            style={{
              width: 8,
              height: 8,
              borderRadius: 0,
              background: s.on ? "#79d399" : "#9c9485",
              flexShrink: 0,
            }}
          />
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: "var(--font-display)", fontSize: 14, fontWeight: 700 }}>
              {s.name}
            </div>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: 9, opacity: 0.6 }}>
              PIT-{String(s.id).padStart(3, "0")} · {s.power} МВт
            </div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div
              className="tnum"
              style={{ fontFamily: "var(--font-mono)", fontSize: 13, fontWeight: 700 }}
            >
              {s.rate.toFixed(1)}
            </div>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: 9, opacity: 0.6 }}>барр/с</div>
          </div>
          <div style={{ width: 64 }} title="Запас нефти в скважине">
            <div
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: 9,
                opacity: 0.6,
                textAlign: "right",
              }}
            >
              запас
            </div>
            <div style={{ height: 6, border: "1px solid rgba(110,195,230,0.4)", marginTop: 2 }}>
              <div
                style={{
                  height: "100%",
                  width: `${s.fill * 100}%`,
                  background: s.fill < 0.15 ? "#f4b454" : "var(--blue-line)",
                }}
              />
            </div>
            <div
              className="tnum"
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: 9,
                fontWeight: 700,
                textAlign: "right",
                marginTop: 2,
              }}
            >
              {Math.round(s.fill * 100)}%
            </div>
          </div>
        </button>
      ))}
      <button
        style={{
          marginTop: 4,
          border: "1px dashed rgba(110,195,230,0.5)",
          background: "rgba(14,42,58,0.4)",
          padding: "14px 12px",
          cursor: "pointer",
          color: "rgba(110,195,230,0.7)",
          display: "flex",
          alignItems: "center",
          gap: 12,
          fontFamily: "var(--font-mono)",
        }}
      >
        <div
          style={{ width: 8, height: 8, border: "1px solid rgba(110,195,230,0.5)", flexShrink: 0 }}
        />
        <div style={{ flex: 1, textAlign: "left" }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.08em" }}>СЛОТ 6</div>
          <div style={{ fontSize: 9, opacity: 0.7, marginTop: 1 }}>
            требует R6 · Параллельная установка
          </div>
        </div>
        <div style={{ fontSize: 11, fontWeight: 700, color: "#f4b454" }}>＋ $300</div>
      </button>
    </div>
  );
}

function PanelRnd() {
  return (
    <div style={{ padding: 14 }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "baseline",
          marginBottom: 10,
        }}
      >
        <div
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 9,
            letterSpacing: "0.16em",
            opacity: 0.7,
          }}
        >
          R&amp;D · ИССЛЕДОВАНИЯ
        </div>
        <div style={{ fontFamily: "var(--font-mono)", fontSize: 9, opacity: 0.6 }}>
          2 / 8 · 412 XP
        </div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {RESEARCH.map((r) => {
          const s = RESEARCH_STATE[r.id];
          const done = s === "done",
            avail = s === "available";
          const c = done ? "var(--blue-line)" : avail ? "#f4b454" : "rgba(110,195,230,0.4)";
          return (
            <div
              key={r.id}
              style={{
                border: `1px solid ${c}`,
                borderWidth: avail ? 1.5 : 1,
                background: done
                  ? "rgba(110,195,230,0.16)"
                  : avail
                    ? "rgba(244,180,84,0.08)"
                    : "transparent",
                padding: "10px 12px",
                display: "grid",
                gridTemplateColumns: "1fr auto",
                gap: 4,
              }}
            >
              <div>
                <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
                  <span
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: 11,
                      fontWeight: 700,
                      color: c,
                    }}
                  >
                    {r.id}
                  </span>
                  <span
                    style={{
                      fontFamily: "var(--font-ui)",
                      fontSize: 12,
                      fontWeight: 600,
                      color: done
                        ? "var(--blue-line)"
                        : avail
                          ? "#f4b454"
                          : "rgba(110,195,230,0.6)",
                    }}
                  >
                    {r.name}
                  </span>
                </div>
                <div
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: 9,
                    opacity: 0.7,
                    marginTop: 2,
                  }}
                >
                  {r.effect}
                </div>
                {r.req.length > 0 && (
                  <div
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: 8,
                      opacity: 0.5,
                      marginTop: 2,
                    }}
                  >
                    требует: {r.req.join(" + ")}
                  </div>
                )}
              </div>
              <div style={{ alignSelf: "center", textAlign: "right" }}>
                <div
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: 10,
                    fontWeight: 700,
                    color: c,
                  }}
                >
                  {done ? "✓" : `${r.xp} XP`}
                </div>
                {avail && (
                  <button
                    style={{
                      marginTop: 4,
                      border: "1px solid #f4b454",
                      background: "#f4b454",
                      color: "var(--blue-0)",
                      fontFamily: "var(--font-mono)",
                      fontSize: 9,
                      fontWeight: 700,
                      letterSpacing: "0.06em",
                      padding: "4px 8px",
                      cursor: "pointer",
                    }}
                  >
                    КУПИТЬ
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Compact sell strip — always visible above tabs
function SellStrip() {
  return (
    <div
      style={{
        padding: "10px 14px",
        borderBottom: "1px solid var(--blue-line)",
        background: "rgba(14,42,58,0.7)",
        display: "flex",
        alignItems: "center",
        gap: 10,
        flexShrink: 0,
      }}
    >
      <div style={{ flex: 1 }}>
        <div
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 9,
            letterSpacing: "0.14em",
            opacity: 0.65,
          }}
        >
          БИРЖА · $1.50 / барр
        </div>
        <div
          className="tnum"
          style={{ fontFamily: "var(--font-display)", fontSize: 16, fontWeight: 700, marginTop: 1 }}
        >
          1 206 барр <span style={{ fontSize: 11, opacity: 0.7, fontWeight: 500 }}>= $1 809</span>
        </div>
      </div>
      <button
        style={{
          border: "1px solid var(--blue-line)",
          background: "transparent",
          color: "var(--blue-line)",
          fontFamily: "var(--font-mono)",
          fontSize: 10,
          fontWeight: 700,
          letterSpacing: "0.08em",
          padding: "8px 8px",
          cursor: "pointer",
        }}
      >
        10%
      </button>
      <button
        style={{
          border: "1px solid var(--blue-line)",
          background: "transparent",
          color: "var(--blue-line)",
          fontFamily: "var(--font-mono)",
          fontSize: 10,
          fontWeight: 700,
          letterSpacing: "0.08em",
          padding: "8px 8px",
          cursor: "pointer",
        }}
      >
        50%
      </button>
      <button
        style={{
          border: "1px solid var(--blue-line)",
          background: "var(--blue-line)",
          color: "var(--blue-0)",
          fontFamily: "var(--font-mono)",
          fontSize: 10,
          fontWeight: 700,
          letterSpacing: "0.08em",
          padding: "8px 10px",
          cursor: "pointer",
        }}
      >
        ВСЁ
      </button>
    </div>
  );
}

function PanelEconUnused() {
  return (
    <div style={{ padding: 14, display: "flex", flexDirection: "column", gap: 12 }}>
      {/* market */}
      <div style={{ border: "1px solid var(--blue-line)", padding: "10px 12px" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "baseline",
            borderBottom: "1px solid rgba(110,195,230,0.3)",
            paddingBottom: 6,
            marginBottom: 8,
          }}
        >
          <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: "0.14em" }}>
            БИРЖА
          </span>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: 9, opacity: 0.6 }}>
            $1.50 / барр
          </span>
        </div>
        <div
          className="tnum"
          style={{ fontFamily: "var(--font-display)", fontSize: 24, fontWeight: 700 }}
        >
          1 206 барр <span style={{ fontSize: 13, opacity: 0.7, fontWeight: 500 }}>= $1 809</span>
        </div>
        <div style={{ display: "flex", gap: 6, marginTop: 10 }}>
          {[
            { l: "10%", primary: false },
            { l: "50%", primary: false },
            { l: "ПРОДАТЬ ВСЁ", primary: true },
          ].map((b, i) => (
            <button
              key={i}
              style={{
                flex: 1,
                border: "1px solid var(--blue-line)",
                background: b.primary ? "var(--blue-line)" : "transparent",
                color: b.primary ? "var(--blue-0)" : "var(--blue-line)",
                fontFamily: "var(--font-mono)",
                fontSize: 10,
                fontWeight: 700,
                letterSpacing: "0.08em",
                padding: "8px",
                cursor: "pointer",
              }}
            >
              {b.l}
            </button>
          ))}
        </div>
      </div>

      {/* contract */}
      <div style={{ border: "1px solid var(--blue-line)", padding: "10px 12px" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "baseline",
            borderBottom: "1px solid rgba(110,195,230,0.3)",
            paddingBottom: 6,
            marginBottom: 8,
          }}
        >
          <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: "0.14em" }}>
            ЭНЕРГОКОНТРАКТ
          </span>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: 9, opacity: 0.6 }}>
            40/50 МВт · −$1.75/с
          </span>
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            fontFamily: "var(--font-mono)",
            fontSize: 10,
            marginBottom: 6,
          }}
        >
          <span>T−00:48 / 80с</span>
          <span>$140 · 80с</span>
        </div>
        <div
          style={{
            height: 8,
            border: "1px solid var(--blue-line)",
            display: "flex",
            gap: 1,
            padding: 1,
          }}
        >
          {Array.from({ length: 32 }).map((_, i) => (
            <div
              key={i}
              style={{ flex: 1, background: i < 19 ? "var(--blue-line)" : "transparent" }}
            />
          ))}
        </div>
        <div style={{ display: "flex", gap: 6, marginTop: 10 }}>
          <button
            style={{
              flex: 1,
              border: "1px solid var(--blue-line)",
              background: "var(--blue-line)",
              color: "var(--blue-0)",
              fontFamily: "var(--font-mono)",
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: "0.08em",
              padding: "8px",
              cursor: "pointer",
            }}
          >
            ПРОДЛИТЬ $140
          </button>
          <button
            style={{
              flex: 1,
              border: "1px solid var(--blue-line)",
              background: "transparent",
              color: "var(--blue-line)",
              fontFamily: "var(--font-mono)",
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: "0.08em",
              padding: "8px",
              cursor: "pointer",
            }}
          >
            +10 МВт $80
          </button>
        </div>
      </div>

      {/* contract history mini-card */}
      <div style={{ border: "1px solid rgba(110,195,230,0.5)", padding: "10px 12px" }}>
        <div
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 9,
            letterSpacing: "0.14em",
            opacity: 0.7,
            marginBottom: 6,
          }}
        >
          ИСТОРИЯ
        </div>
        {[
          { t: "+$140", d: "ПРОДЛЕНИЕ КОНТРАКТА", s: "00:18" },
          { t: "+$1 209", d: "ПРОДАЖА 800 БАРР", s: "01:06" },
          { t: "−$300", d: "СТАНЦИЯ W-04", s: "02:44" },
        ].map((r, i) => (
          <div
            key={i}
            style={{
              display: "flex",
              justifyContent: "space-between",
              padding: "4px 0",
              borderTop: i ? "1px solid rgba(110,195,230,0.18)" : "none",
              fontFamily: "var(--font-mono)",
              fontSize: 10,
            }}
          >
            <span
              style={{
                color: r.t.startsWith("+") ? "#79d399" : "#f4b454",
                fontWeight: 700,
                width: 70,
              }}
            >
              {r.t}
            </span>
            <span style={{ flex: 1, opacity: 0.85 }}>{r.d}</span>
            <span style={{ opacity: 0.5 }}>−{r.s}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Bottom-sheet inspector
// ─────────────────────────────────────────────────────────────
function MobileInspector({ station, onClose }) {
  const canSell = station.fill < 0.15;
  return (
    <>
      {/* scrim */}
      <div
        onClick={onClose}
        style={{
          position: "absolute",
          inset: 0,
          background: "rgba(0,0,0,0.45)",
          zIndex: 10,
        }}
      />
      {/* sheet */}
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 11,
          background: "rgba(14,42,58,0.98)",
          borderTop: "1.5px solid #f4b454",
          boxShadow: "0 -8px 24px rgba(0,0,0,0.5)",
          animation: "sheet-up 0.22s ease-out",
        }}
      >
        <div style={{ display: "flex", justifyContent: "center", padding: "8px 0 4px" }}>
          <div style={{ width: 36, height: 4, background: "rgba(110,195,230,0.4)" }} />
        </div>
        <div style={{ padding: "6px 16px 14px" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              borderBottom: "1px solid rgba(244,180,84,0.4)",
              paddingBottom: 8,
              marginBottom: 12,
            }}
          >
            <div>
              <div
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: 9,
                  letterSpacing: "0.18em",
                  color: "#f4b454",
                }}
              >
                ИНСПЕКТОР · PIT-{String(station.id).padStart(3, "0")}
              </div>
              <div
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: 22,
                  fontWeight: 700,
                  marginTop: 2,
                }}
              >
                {station.name}
              </div>
            </div>
            <button
              onClick={onClose}
              style={{
                width: 30,
                height: 30,
                border: "1px solid var(--blue-line)",
                background: "none",
                color: "var(--blue-line)",
                fontFamily: "var(--font-mono)",
                fontSize: 16,
                cursor: "pointer",
              }}
            >
              ×
            </button>
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 12,
              fontFamily: "var(--font-mono)",
              fontSize: 11,
              marginBottom: 14,
            }}
          >
            <Cell
              l="СТАТУС"
              v={station.on ? "● РАБОТАЕТ" : "○ ВЫКЛЮЧЕНА"}
              c={station.on ? "#79d399" : "#9c9485"}
            />
            <Cell l="ДОБЫЧА" v={`${station.rate.toFixed(1)} барр/с`} />
            <Cell
              l="ЗАПАС"
              v={`${Math.round(station.fill * 100)}%${canSell ? " (иссякает)" : ""}`}
              c={canSell ? "#f4b454" : "inherit"}
            />
            <Cell l="ПОТРЕБЛ." v={`${station.power} МВт`} />
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button
              style={{
                flex: 1,
                border: "1px solid var(--blue-line)",
                background: "var(--blue-line)",
                color: "var(--blue-0)",
                fontFamily: "var(--font-mono)",
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: "0.08em",
                padding: "12px",
                cursor: "pointer",
              }}
            >
              {station.on ? "⏸ ВЫКЛЮЧИТЬ" : "▶ ВКЛЮЧИТЬ"}
            </button>
            <button
              title={canSell ? "Месторождение почти иссякло" : "Доступно только когда запас <15%"}
              style={{
                flex: 1,
                border: "1px solid #f4b454",
                background: "transparent",
                color: canSell ? "#f4b454" : "rgba(244,180,84,0.4)",
                fontFamily: "var(--font-mono)",
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: "0.08em",
                padding: "12px",
                cursor: canSell ? "pointer" : "not-allowed",
              }}
            >
              {canSell ? `ПРОДАТЬ +$${Math.round(80 + station.fill * 200)}` : "ПРОДАТЬ ✕"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

function Cell({ l, v, c }) {
  return (
    <div>
      <div style={{ fontSize: 9, opacity: 0.6, letterSpacing: "0.12em" }}>{l}</div>
      <div style={{ fontWeight: 700, color: c || "var(--blue-line)", marginTop: 2 }}>{v}</div>
    </div>
  );
}

window.V5Mobile = V5Mobile;
