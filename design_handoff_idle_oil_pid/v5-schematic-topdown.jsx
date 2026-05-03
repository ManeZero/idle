// V5 — Schematic Top-Down (desktop, 1280×820)
// Изометрическая/top-down схема нефтяного поля как технической схемы P&ID
// с трубопроводами, узлами, и боковой панелью research-tree (vertical, full).

function V5SchematicTopDown() {
  const [selected, setSelected] = React.useState(null);
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
        fontFamily: "var(--font-ui)",
        color: "var(--blue-line)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Header strip */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 56,
          borderBottom: "1px solid var(--blue-line)",
          background: "rgba(14,42,58,0.7)",
          display: "flex",
          alignItems: "center",
          padding: "0 24px",
          gap: 24,
        }}
      >
        <div
          style={{
            fontFamily: "var(--font-display)",
            fontSize: 20,
            fontWeight: 600,
            letterSpacing: "0.04em",
          }}
        >
          СХЕМА — МЕСТОРОЖДЕНИЕ «BLACKWELL»
        </div>
        <div
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 10,
            letterSpacing: "0.16em",
            color: "rgba(110,195,230,0.6)",
          }}
        >
          ЧЕРТЁЖ 7204 · РЕВ. 03 · ОПЕРАТИВНЫЙ ВИД
        </div>
        <div
          style={{
            marginLeft: "auto",
            display: "flex",
            gap: 18,
            fontFamily: "var(--font-mono)",
            fontSize: 11,
          }}
        >
          <Stat l="$" v="2 840" />
          <Stat l="НЕФТЬ" v="1 206" sub="барр" />
          <Stat l="ОПЫТ" v="412" />
          <Stat l="МВт" v="40/50" warn />
          <Stat l="T−" v="00:48" warn />
        </div>
      </div>

      {/* MAIN — schematic field */}
      <div style={{ position: "absolute", top: 56, left: 0, right: 440, bottom: 160 }}>
        <SchematicField stationsData={stationsData} selected={selected} onSelect={setSelected} />
        {sel && <StationInspector station={sel} onClose={() => setSelected(null)} />}
      </div>

      {/* SIDEBAR — full vertical research tree */}
      <div
        style={{
          position: "absolute",
          top: 56,
          right: 0,
          width: 440,
          bottom: 0,
          borderLeft: "1px solid var(--blue-line)",
          background: "rgba(14,42,58,0.55)",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div
          style={{
            padding: "12px 18px",
            borderBottom: "1px solid var(--blue-line)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "baseline",
          }}
        >
          <div>
            <div
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: 9,
                letterSpacing: "0.18em",
                opacity: 0.7,
              }}
            >
              ПРОГРАММА ИССЛЕДОВАНИЙ
            </div>
            <div
              style={{
                fontFamily: "var(--font-display)",
                fontSize: 16,
                fontWeight: 600,
                marginTop: 2,
              }}
            >
              Дерево R&amp;D
            </div>
          </div>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: 12 }}>2 / 8</div>
        </div>
        <div style={{ flex: 1, position: "relative", padding: "24px 12px 14px", overflow: "auto" }}>
          <ResearchTreeFullVertical />
        </div>
      </div>

      {/* BOTTOM BAR — controls */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 440,
          height: 160,
          borderTop: "1px solid var(--blue-line)",
          background: "rgba(14,42,58,0.7)",
          padding: 16,
          display: "grid",
          gridTemplateColumns: "1fr 1fr 1fr",
          gap: 12,
        }}
      >
        <BPanel title="ЭНЕРГОКОНТРАКТ" sub="40/50 МВт · −$1.75/с">
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              fontFamily: "var(--font-mono)",
              fontSize: 10,
              marginBottom: 4,
            }}
          >
            <span>T−00:48 / 80с</span>
            <span>$140 · 80с</span>
          </div>
          <ProgressBar
            value={0.6}
            segments={32}
            height={10}
            accent="var(--blue-line)"
            color="var(--blue-line)"
          />
          <div style={{ display: "flex", gap: 6, marginTop: 8 }}>
            <BBtn primary>ПРОДЛИТЬ $140</BBtn>
            <BBtn title="Расширить лимит мощности на 10 МВт">+10 МВт $80</BBtn>
          </div>
        </BPanel>

        <BPanel title="БИРЖА" sub="$1.50 / барр">
          <div
            className="tnum"
            style={{ fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 600 }}
          >
            1 206 барр <span style={{ fontSize: 12, opacity: 0.7 }}>= $1 809</span>
          </div>
          <div style={{ display: "flex", gap: 6, marginTop: 6 }}>
            <BBtn>10%</BBtn>
            <BBtn>50%</BBtn>
            <BBtn primary>ПРОДАТЬ ВСЁ</BBtn>
          </div>
        </BPanel>

        <BPanel
          title="СТАНЦИИ"
          sub={`${stationsData.filter((s) => s.on).length}/${stationsData.length} активно · клик → инспектор`}
        >
          <div style={{ display: "grid", gridTemplateColumns: "repeat(6,1fr)", gap: 4 }}>
            {stationsData.map((st) => {
              const isSel = selected === st.id;
              return (
                <button
                  key={st.id}
                  onClick={() => setSelected(isSel ? null : st.id)}
                  style={{
                    aspectRatio: "1 / 1",
                    border: isSel ? "1.5px solid #f4b454" : "1px solid var(--blue-line)",
                    background: st.on ? "rgba(110,195,230,0.18)" : "transparent",
                    fontFamily: "var(--font-mono)",
                    fontSize: 10,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: st.on ? "var(--blue-line)" : "rgba(110,195,230,0.5)",
                    cursor: "pointer",
                    padding: 0,
                  }}
                >{`0${st.id}`}</button>
              );
            })}
            <div
              style={{
                aspectRatio: "1 / 1",
                border: "1px dashed rgba(110,195,230,0.5)",
                fontFamily: "var(--font-mono)",
                fontSize: 10,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "rgba(110,195,230,0.5)",
              }}
            >
              R6
            </div>
          </div>
          <div style={{ display: "flex", gap: 6, marginTop: 8 }}>
            <BBtn primary>＋ КУПИТЬ $300</BBtn>
            <BBtn>⏸ ПАУЗА ВСЕХ</BBtn>
          </div>
        </BPanel>
      </div>
    </div>
  );
}

function Stat({ l, v, sub, warn }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", minWidth: 60 }}>
      <span style={{ fontSize: 9, letterSpacing: "0.12em", opacity: 0.6 }}>{l}</span>
      <span
        className="tnum"
        style={{ fontSize: 14, fontWeight: 600, color: warn ? "#f4b454" : "var(--blue-line)" }}
      >
        {v} {sub && <span style={{ fontSize: 9, opacity: 0.6 }}>{sub}</span>}
      </span>
    </div>
  );
}

function BPanel({ title, sub, children }) {
  return (
    <div
      style={{
        border: "1px solid var(--blue-line)",
        padding: "8px 12px",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "baseline",
          borderBottom: "1px solid rgba(110,195,230,0.3)",
          paddingBottom: 4,
          marginBottom: 8,
          gap: 8,
        }}
      >
        <span
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 10,
            letterSpacing: "0.14em",
            whiteSpace: "nowrap",
          }}
        >
          {title}
        </span>
        <span
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 9,
            opacity: 0.6,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
            textAlign: "right",
          }}
        >
          {sub}
        </span>
      </div>
      {children}
    </div>
  );
}

function BBtn({ children, primary, title, danger, onClick }) {
  const color = danger ? "#f4b454" : "var(--blue-line)";
  return (
    <button
      onClick={onClick}
      title={title}
      style={{
        flex: 1,
        border: `1px solid ${color}`,
        background: primary ? color : "transparent",
        color: primary ? "var(--blue-0)" : color,
        fontFamily: "var(--font-mono)",
        fontSize: 10,
        letterSpacing: "0.08em",
        padding: "6px 8px",
        cursor: "pointer",
        whiteSpace: "nowrap",
      }}
    >
      {children}
    </button>
  );
}

function StationInspector({ station, onClose }) {
  const canSell = station.fill < 0.15;
  return (
    <div
      style={{
        position: "absolute",
        left: 16,
        bottom: 16,
        width: 300,
        border: "1px solid #f4b454",
        background: "rgba(14,42,58,0.94)",
        fontFamily: "var(--font-ui)",
        color: "var(--blue-line)",
        boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "8px 12px",
          borderBottom: "1px solid rgba(244,180,84,0.5)",
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
              fontSize: 18,
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
            background: "none",
            border: "1px solid var(--blue-line)",
            color: "var(--blue-line)",
            width: 22,
            height: 22,
            fontFamily: "var(--font-mono)",
            cursor: "pointer",
          }}
        >
          ×
        </button>
      </div>
      <div
        style={{
          padding: 12,
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 10,
          fontFamily: "var(--font-mono)",
          fontSize: 11,
        }}
      >
        <div>
          <div style={{ fontSize: 9, opacity: 0.6, letterSpacing: "0.12em" }}>СТАТУС</div>
          <div style={{ fontWeight: 700, color: station.on ? "#79d399" : "#9c9485" }}>
            {station.on ? "● РАБОТАЕТ" : "○ ВЫКЛЮЧЕНА"}
          </div>
        </div>
        <div>
          <div style={{ fontSize: 9, opacity: 0.6, letterSpacing: "0.12em" }}>ДОБЫЧА</div>
          <div style={{ fontWeight: 700 }}>{station.rate.toFixed(1)} барр/с</div>
        </div>
        <div>
          <div style={{ fontSize: 9, opacity: 0.6, letterSpacing: "0.12em" }}>ПЛАСТ</div>
          <div style={{ fontWeight: 700, color: canSell ? "#f4b454" : "inherit" }}>
            {Math.round(station.fill * 100)}% {canSell && "(иссякает)"}
          </div>
        </div>
        <div>
          <div style={{ fontSize: 9, opacity: 0.6, letterSpacing: "0.12em" }}>ПОТРЕБЛ.</div>
          <div style={{ fontWeight: 700 }}>{station.power} МВт</div>
        </div>
      </div>
      <div style={{ display: "flex", gap: 6, padding: "0 12px 12px" }}>
        <BBtn primary>{station.on ? "⏸ ВЫКЛЮЧИТЬ" : "▶ ВКЛЮЧИТЬ"}</BBtn>
        <BBtn
          danger
          title={
            canSell
              ? "Месторождение почти иссякло — можно продать"
              : "Доступно только когда пласт <15%"
          }
        >
          {canSell ? `ПРОДАТЬ +$${Math.round(80 + station.fill * 200)}` : "ПРОДАТЬ ✕"}
        </BBtn>
      </div>
    </div>
  );
}

function SchematicField({ stationsData, selected, onSelect }) {
  // Positions for stations (data passed in)
  const positions = {
    1: { x: 180, y: 270 },
    2: { x: 360, y: 200 },
    3: { x: 280, y: 450 },
    4: { x: 530, y: 480 },
    5: { x: 600, y: 150 },
  };
  const stations = stationsData.map((s) => ({ ...s, ...positions[s.id] }));
  const hub = { x: 400, y: 340 };
  const tank = { x: 740, y: 340 };

  return (
    <svg
      viewBox="0 0 880 632"
      preserveAspectRatio="xMidYMid meet"
      width="100%"
      height="100%"
      style={{ overflow: "visible" }}
    >
      <defs>{/* SVG grid removed — outer .bp-blueprint provides the grid */}</defs>

      {/* axes labels */}
      {Array.from({ length: 5 }).map((_, i) => (
        <text
          key={`xa-${i}`}
          x={i * 160 + 4}
          y="14"
          fontFamily="var(--font-mono)"
          fontSize="8"
          fill="rgba(110,195,230,0.5)"
        >{`X${i}`}</text>
      ))}

      {/* reservoir contours */}
      <ellipse
        cx="400"
        cy="340"
        rx="320"
        ry="260"
        fill="none"
        stroke="rgba(244,180,84,0.25)"
        strokeWidth="0.6"
        strokeDasharray="3 3"
      />
      <ellipse
        cx="400"
        cy="340"
        rx="220"
        ry="180"
        fill="none"
        stroke="rgba(244,180,84,0.3)"
        strokeWidth="0.6"
        strokeDasharray="3 3"
      />
      <ellipse
        cx="400"
        cy="340"
        rx="120"
        ry="100"
        fill="none"
        stroke="rgba(244,180,84,0.5)"
        strokeWidth="0.6"
        strokeDasharray="3 3"
      />

      {/* pipes station → hub. Start at edge of station body (r=28) and end at edge of hub (rect ~26) so the line emerges FROM the station, not through it. */}
      {stations
        .filter((s) => s.on)
        .map((s) => {
          const dx = hub.x - s.x,
            dy = hub.y - s.y;
          const d = Math.hypot(dx, dy);
          const ux = dx / d,
            uy = dy / d;
          const stationR = 28;
          const hubR = 26;
          const x1 = s.x + ux * stationR;
          const y1 = s.y + uy * stationR;
          const x2 = hub.x - ux * hubR;
          const y2 = hub.y - uy * hubR;
          return (
            <g key={`pipe-${s.id}`}>
              <line
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke="rgba(110,195,230,0.55)"
                strokeWidth="2.5"
              />
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
        })}
      {/* pipe hub → tank: start at hub edge, end at tank edge (rect halfwidth=32) */}
      {(() => {
        const dx = tank.x - hub.x,
          dy = tank.y - hub.y;
        const d = Math.hypot(dx, dy);
        const ux = dx / d,
          uy = dy / d;
        const x1 = hub.x + ux * 26,
          y1 = hub.y + uy * 26;
        const x2 = tank.x - ux * 32,
          y2 = tank.y - uy * 32;
        return (
          <g>
            <line
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke="rgba(110,195,230,0.7)"
              strokeWidth="3.5"
            />
            <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="var(--blue-0)" strokeWidth="1.2" />
            <line
              className="flow-line"
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke="#f4b454"
              strokeWidth="1.6"
            />
          </g>
        );
      })()}

      {/* hub */}
      <g transform={`translate(${hub.x} ${hub.y})`}>
        <rect
          x="-26"
          y="-26"
          width="52"
          height="52"
          fill="var(--blue-0)"
          stroke="var(--blue-line)"
          strokeWidth="1.2"
        />
        <rect
          x="-22"
          y="-22"
          width="44"
          height="44"
          fill="none"
          stroke="var(--blue-line)"
          strokeWidth="0.5"
        />
        <circle r="8" fill="none" stroke="var(--blue-line)" strokeWidth="1" />
        <line x1="-8" y1="0" x2="8" y2="0" stroke="var(--blue-line)" strokeWidth="0.6" />
        <line x1="0" y1="-8" x2="0" y2="8" stroke="var(--blue-line)" strokeWidth="0.6" />
        {/* hub label — above hub */}
        <rect
          x="-44"
          y="-50"
          width="88"
          height="22"
          fill="var(--blue-0)"
          stroke="var(--blue-line)"
          strokeWidth="0.6"
        />
        <text
          x="0"
          y="-37"
          textAnchor="middle"
          fontFamily="var(--font-mono)"
          fontSize="10"
          fontWeight="600"
          fill="var(--blue-line)"
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

      {/* central storage tank */}
      <g transform={`translate(${tank.x} ${tank.y})`}>
        <defs>
          <pattern
            id="tank-oil-hatch"
            patternUnits="userSpaceOnUse"
            width="6"
            height="6"
            patternTransform="rotate(45)"
          >
            <line x1="0" y1="0" x2="0" y2="6" stroke="#f4b454" strokeWidth="1.2" opacity="0.55" />
          </pattern>
        </defs>
        {/* tank body — drawn AFTER fill so its stroke sits on top and crisply masks everything */}
        <rect x="-32" y="-40" width="64" height="80" fill="var(--blue-0)" stroke="none" />
        {/* oil fill — clipped to the tank rect by being drawn over var(--blue-0) bg, then the body stroke is drawn last */}
        <rect x="-32" y="24" width="64" height="16" fill="rgba(244,180,84,0.45)" />
        <rect x="-32" y="24" width="64" height="16" fill="url(#tank-oil-hatch)" />
        <line x1="-32" y1="24" x2="32" y2="24" stroke="#f4b454" strokeWidth="1" />
        {/* tank outline — drawn last to cover any sub-pixel bleed */}
        <rect
          x="-32"
          y="-40"
          width="64"
          height="80"
          fill="none"
          stroke="var(--blue-line)"
          strokeWidth="1.2"
        />
        {/* level ticks on the right (away from incoming pipe which connects to left edge) */}
        {[0.25, 0.5, 0.75].map((t) => (
          <line
            key={t}
            x1="-32"
            y1={-40 + 80 * t}
            x2="-36"
            y2={-40 + 80 * t}
            stroke="var(--blue-line)"
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
          fill="var(--blue-line)"
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
          fill="var(--blue-line)"
        >
          1 206
        </text>
        <text
          x="0"
          y="11"
          textAnchor="middle"
          fontFamily="var(--font-mono)"
          fontSize="7"
          fill="rgba(110,195,230,0.7)"
        >
          / 8 400 барр
        </text>
      </g>

      {/* placeholder slot for future 6th station */}
      {(() => {
        const sx = 700,
          sy = 510;
        return (
          <g transform={`translate(${sx} ${sy})`} style={{ cursor: "pointer" }}>
            <circle
              r="28"
              fill="var(--blue-0)"
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
              СЛОТ 6
            </text>
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
          </g>
        );
      })()}

      {/* stations */}
      {stations.map((s) => (
        <g
          key={s.id}
          transform={`translate(${s.x} ${s.y})`}
          opacity={s.on ? 1 : 0.45}
          onClick={() => onSelect(selected === s.id ? null : s.id)}
          style={{ cursor: "pointer" }}
        >
          {/* selection ring */}
          {selected === s.id && (
            <circle
              r="36"
              fill="none"
              stroke="#f4b454"
              strokeWidth="1.4"
              strokeDasharray="4 3"
              className="march"
            />
          )}
          {/* mask pipe behind station body so it looks like an inline P&ID symbol */}
          <circle r="30" fill="var(--blue-0)" stroke="none" />
          {/* tag bubble — two stacked rows: PIT id (small) on top, well code (large) below */}
          <line x1="0" y1="-30" x2="0" y2="-58" stroke="var(--blue-line)" strokeWidth="0.5" />
          <rect
            x="-32"
            y="-86"
            width="64"
            height="28"
            fill="var(--blue-0)"
            stroke="var(--blue-line)"
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
            PIT-{s.id.toString().padStart(3, "0")}
          </text>
          <text
            x="0"
            y="-63"
            textAnchor="middle"
            fontFamily="var(--font-mono)"
            fontSize="10"
            fontWeight="700"
            fill="var(--blue-line)"
          >
            {s.name}
          </text>

          {/* station body — circle with cross (P&ID symbol) + pumpjack */}
          <circle r="28" fill="var(--blue-0)" stroke="var(--blue-line)" strokeWidth="1.2" />
          <circle
            r="28"
            fill="none"
            stroke={s.on ? "#f4b454" : "rgba(110,195,230,0.3)"}
            strokeWidth="0.6"
            strokeDasharray={s.on ? "0" : "2 2"}
          />
          {/* mini pumpjack */}
          <g transform="translate(-15 -15) scale(0.30)">
            <Pumpjack size={100} running={s.on} color="var(--blue-line)" />
          </g>
          {/* fill arc */}
          <circle r="23" fill="none" stroke="rgba(244,180,84,0.18)" strokeWidth="3" />
          <circle
            r="23"
            fill="none"
            stroke="#f4b454"
            strokeWidth="3"
            strokeDasharray={`${s.fill * 144.5} 144.5`}
            transform="rotate(-90)"
          />
          {/* status dot */}
          <circle
            cx="22"
            cy="-22"
            r="4"
            fill={s.on ? "#79d399" : "#9c9485"}
            stroke="var(--blue-0)"
            strokeWidth="1"
          />

          {/* below: rate readout */}
          <text
            x="0"
            y="44"
            textAnchor="middle"
            fontFamily="var(--font-mono)"
            fontSize="9"
            fontWeight="600"
            fill="var(--blue-line)"
          >
            {s.rate.toFixed(1)} барр/с
          </text>
          <text
            x="0"
            y="54"
            textAnchor="middle"
            fontFamily="var(--font-mono)"
            fontSize="7"
            fill="rgba(110,195,230,0.6)"
          >
            бак {Math.round(s.fill * 100)}%
          </text>

          {/* gain bubble (animated) */}
          {s.on && s.rate > 0 && (
            <text
              x="32"
              y="-2"
              fontFamily="var(--font-mono)"
              fontSize="8"
              fill="#f4b454"
              className="gain-float"
              style={{ animationDelay: `${s.id * 0.4}s` }}
            >
              +{s.rate.toFixed(1)}
            </text>
          )}
        </g>
      ))}

      {/* legend — bottom left, inside frame */}
      <g transform="translate(24 612)">
        <text
          fontFamily="var(--font-mono)"
          fontSize="8"
          fill="rgba(110,195,230,0.6)"
          letterSpacing="2"
        >
          УСЛ. ОБОЗН.
        </text>
        <g transform="translate(96 0)">
          <line x1="0" y1="-3" x2="20" y2="-3" stroke="var(--blue-line)" strokeWidth="1" />
          <line
            x1="0"
            y1="-3"
            x2="20"
            y2="-3"
            className="flow-line"
            stroke="#f4b454"
            strokeWidth="1"
          />
          <text x="26" y="0" fontFamily="var(--font-mono)" fontSize="8" fill="var(--blue-line)">
            ПОТОК
          </text>
        </g>
        <g transform="translate(170 0)">
          <circle cx="6" cy="-3" r="6" fill="none" stroke="var(--blue-line)" strokeWidth="0.8" />
          <text x="18" y="0" fontFamily="var(--font-mono)" fontSize="8" fill="var(--blue-line)">
            НАСОС
          </text>
        </g>
        <g transform="translate(240 0)">
          <rect
            x="0"
            y="-9"
            width="12"
            height="12"
            fill="none"
            stroke="var(--blue-line)"
            strokeWidth="0.8"
          />
          <text x="18" y="0" fontFamily="var(--font-mono)" fontSize="8" fill="var(--blue-line)">
            БАК
          </text>
        </g>
      </g>
    </svg>
  );
}

function ResearchTreeFullVertical() {
  // 4 rows, full positioning in pixel coords
  // Wider cards (130px) with line wrap so all Russian text fits at readable size
  const W = 420,
    H = 760;
  const positions = {
    R1: { x: 105, y: 70 },
    R2: { x: 315, y: 70 },
    R3: { x: 105, y: 220 },
    R4: { x: 315, y: 220 },
    R5: { x: 70, y: 390 },
    R6: { x: 210, y: 390 },
    R7: { x: 350, y: 390 },
    R8: { x: 210, y: 580 },
  };
  const states = RESEARCH_STATE;

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      width={W}
      height={H}
      style={{ overflow: "visible", display: "block", margin: "0 auto" }}
    >
      {RESEARCH.flatMap((r) =>
        r.req.map((req) => {
          const a = positions[req],
            b = positions[r.id];
          const linked = states[req] === "done";
          return (
            <line
              key={`${req}-${r.id}`}
              x1={a.x}
              y1={a.y + 42}
              x2={b.x}
              y2={b.y - 42}
              stroke={linked ? "var(--blue-line)" : "rgba(110,195,230,0.3)"}
              strokeWidth={linked ? 1.2 : 0.6}
              strokeDasharray={linked ? "0" : "3 3"}
            />
          );
        }),
      )}
      {RESEARCH.map((r) => {
        const p = positions[r.id];
        const s = states[r.id];
        const done = s === "done",
          avail = s === "available";
        const c = done ? "var(--blue-line)" : avail ? "#f4b454" : "rgba(110,195,230,0.4)";
        return (
          <g key={r.id} transform={`translate(${p.x} ${p.y})`}>
            <rect
              x="-65"
              y="-42"
              width="130"
              height="84"
              fill={
                done
                  ? "rgba(110,195,230,0.18)"
                  : avail
                    ? "rgba(244,180,84,0.10)"
                    : "rgba(14,42,58,0.6)"
              }
              stroke={c}
              strokeWidth={avail ? 1.5 : 1}
            />
            {avail && (
              <rect
                x="-65"
                y="-42"
                width="130"
                height="84"
                fill="none"
                stroke={c}
                strokeWidth="0.6"
                strokeDasharray="3 3"
                className="march"
              />
            )}
            <foreignObject x="-65" y="-42" width="130" height="84" style={{ overflow: "hidden" }}>
              <div
                xmlns="http://www.w3.org/1999/xhtml"
                style={{
                  width: "100%",
                  height: "100%",
                  padding: "7px 9px",
                  boxSizing: "border-box",
                  fontFamily: "var(--font-mono)",
                  color: "var(--blue-line)",
                  display: "flex",
                  flexDirection: "column",
                  gap: 2,
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "baseline",
                    fontSize: 11,
                    fontWeight: 700,
                    color: c,
                    letterSpacing: "0.04em",
                  }}
                >
                  <span>{r.id}</span>
                  <span style={{ fontSize: 9 }}>{done ? "✓ ГОТОВО" : `${r.xp} ОПЫТ`}</span>
                </div>
                <div
                  style={{
                    fontFamily: "var(--font-ui)",
                    fontSize: 11,
                    fontWeight: 600,
                    lineHeight: 1.15,
                    color: done ? "var(--blue-line)" : avail ? "#f4b454" : "rgba(110,195,230,0.6)",
                    marginTop: 1,
                  }}
                >
                  {r.name}
                </div>
                <div
                  style={{
                    fontSize: 9,
                    color: "rgba(110,195,230,0.7)",
                    lineHeight: 1.15,
                  }}
                >
                  {r.effect}
                </div>
                <div
                  style={{
                    fontSize: 8,
                    color: "rgba(110,195,230,0.5)",
                    lineHeight: 1.1,
                    marginTop: "auto",
                  }}
                >
                  {r.req.length ? `требует: ${r.req.join(" + ")}` : "без требований"}
                </div>
              </div>
            </foreignObject>
          </g>
        );
      })}
    </svg>
  );
}

window.V5SchematicTopDown = V5SchematicTopDown;
