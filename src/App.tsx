import { AutoBuyButton } from "@/components/AutoBuyButton";
import { AutoBuyUpgradeButton } from "@/components/AutoBuyUpgradeButton";
import { GeneratorButton } from "@/components/GeneratorButton";
import { PauseButton } from "@/components/PauseButton";
import { PointsDisplay } from "@/components/PointsDisplay";
import { useGameTick } from "@/hooks/useGameTick";
import "./App.css";

function App() {
  useGameTick();

  return (
    <div className="game">
      <PauseButton />
      <PointsDisplay />
      <section className="shop">
        <h2 className="shop-title">Магазин</h2>
        <GeneratorButton />
        <AutoBuyButton />
        <AutoBuyUpgradeButton />
      </section>
    </div>
  );
}

export default App;
