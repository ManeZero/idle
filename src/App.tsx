import { useState } from "react";
import { EnergyPanel } from "@/components/EnergyPanel";
import { OilStationCard } from "@/components/OilStationCard";
import { ResearchPanel } from "@/components/ResearchPanel";
import { ResourceDisplay } from "@/components/ResourceDisplay";
import { ShopPanel } from "@/components/ShopPanel";
import { useGameTick } from "@/hooks/useGameTick";
import { useGameStore } from "@/stores/gameStore";
import "./App.css";

type Tab = "game" | "research";

function App() {
  useGameTick();
  const [tab, setTab] = useState<Tab>("game");
  const stations = useGameStore((state) => state.stations);
  const paused = useGameStore((state) => state.paused);
  const togglePause = useGameStore((state) => state.togglePause);

  return (
    <div className="game">
      <button
        className={`pause-button${paused ? " pause-button--paused" : ""}`}
        onClick={togglePause}
        type="button"
      >
        {paused ? "Продолжить" : "Пауза"}
      </button>
      <ResourceDisplay />
      <div className="tabs">
        <button
          className={`tab${tab === "game" ? " tab--active" : ""}`}
          onClick={() => setTab("game")}
          type="button"
        >
          Игра
        </button>
        <button
          className={`tab${tab === "research" ? " tab--active" : ""}`}
          onClick={() => setTab("research")}
          type="button"
        >
          Исследования
        </button>
      </div>
      {tab === "game" && (
        <div className="game-columns">
          <section className="panel">
            <h2 className="panel-title">Магазин</h2>
            <ShopPanel />
          </section>
          {stations.length > 0 && (
            <section className="panel">
              <h2 className="panel-title">Станции</h2>
              {stations.map((s) => (
                <OilStationCard key={s.id} station={s} />
              ))}
            </section>
          )}
          <section className="panel">
            <h2 className="panel-title">Энергия</h2>
            <EnergyPanel />
          </section>
        </div>
      )}
      {tab === "research" && (
        <div className="game-columns">
          <section className="panel panel--wide">
            <ResearchPanel />
          </section>
        </div>
      )}
    </div>
  );
}

export default App;
