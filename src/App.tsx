import { AutoBuyButton } from "@/components/AutoBuyButton";
import { GeneratorButton } from "@/components/GeneratorButton";
import { PointsDisplay } from "@/components/PointsDisplay";
import { useGameTick } from "@/hooks/useGameTick";
import "./App.css";

function App() {
  useGameTick();

  return (
    <div className="game">
      <PointsDisplay />
      <section className="shop">
        <h2 className="shop-title">Магазин</h2>
        <GeneratorButton />
        <AutoBuyButton />
      </section>
    </div>
  );
}

export default App;
