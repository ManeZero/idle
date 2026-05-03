import { useState } from "react";
import { useGameStore } from "@/stores/gameStore";
import { MobileInspector } from "./MobileInspector";
import { MobileSchematic } from "./MobileSchematic";
import { MobileTopBar } from "./MobileTopBar";
import { ResearchList } from "./ResearchList";
import { SellStrip } from "./SellStrip";
import { StationsList } from "./StationsList";

type Tab = "field" | "rnd";

export function MobileApp() {
  const [tab, setTab] = useState<Tab>("field");
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const stations = useGameStore((s) => s.stations);
  const completedResearch = useGameStore((s) => s.completedResearch);
  const experience = useGameStore((s) => s.experience);
  const enabled = stations.filter((s) => s.enabled).length;
  const selected = stations.find((s) => s.id === selectedId) ?? null;

  return (
    <div className="bp-blueprint bp-mobile">
      <MobileTopBar />
      <div className="bp-mobile__schematic">
        <MobileSchematic selectedId={selectedId} onSelect={setSelectedId} />
      </div>
      <SellStrip />
      <div className="bp-mobile__content">
        {tab === "field" ? (
          <StationsList selectedId={selectedId} onSelect={setSelectedId} />
        ) : (
          <ResearchList />
        )}
      </div>
      <div className="bp-mobile__tabs">
        <TabBtn
          active={tab === "field"}
          onClick={() => setTab("field")}
          label="СТАНЦИИ"
          sub={`${enabled} / ${stations.length} активно`}
        />
        <TabBtn
          active={tab === "rnd"}
          onClick={() => setTab("rnd")}
          label="R&D"
          sub={`${completedResearch.length} / 8 · ${Math.round(experience)} XP`}
        />
      </div>
      {selected && <MobileInspector station={selected} onClose={() => setSelectedId(null)} />}
    </div>
  );
}

function TabBtn({
  active,
  onClick,
  label,
  sub,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  sub: string;
}) {
  return (
    <button
      type="button"
      className={`bp-mobile__tab${active ? " bp-mobile__tab--on" : ""}`}
      onClick={onClick}
    >
      <span className="bp-mobile__tab-l">{label}</span>
      <span className="bp-mobile__tab-s">{sub}</span>
    </button>
  );
}
