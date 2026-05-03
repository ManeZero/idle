import { useState } from "react";
import { useGameStore } from "@/stores/gameStore";
import { ContractPanel } from "./ContractPanel";
import { MarketPanel } from "./MarketPanel";
import { ResearchTree } from "./ResearchTree";
import { SchematicField } from "./SchematicField";
import { StationInspector } from "./StationInspector";
import { StationsBar } from "./StationsBar";
import { StatusBar } from "./StatusBar";

export function DesktopApp() {
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const stations = useGameStore((s) => s.stations);
  const selected = stations.find((s) => s.id === selectedId) ?? null;

  return (
    <div className="bp-blueprint bp-desktop">
      <StatusBar />
      <div className="bp-desktop__main">
        <div className="bp-desktop__field">
          <SchematicField selectedId={selectedId} onSelect={setSelectedId} />
          {selected && <StationInspector station={selected} onClose={() => setSelectedId(null)} />}
        </div>
        <aside className="bp-desktop__sidebar">
          <ResearchTree />
        </aside>
      </div>
      <div className="bp-desktop__bottom">
        <ContractPanel />
        <MarketPanel />
        <StationsBar selectedId={selectedId} onSelect={setSelectedId} />
      </div>
    </div>
  );
}
