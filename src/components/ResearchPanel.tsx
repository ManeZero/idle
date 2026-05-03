import { RESEARCH_DEFS } from "@/game/mechanics/research";
import { useGameStore } from "@/stores/gameStore";
import { formatNumber } from "@/utils/formatNumber";

const nameById = Object.fromEntries(RESEARCH_DEFS.map((r) => [r.id, r.name]));

export function ResearchPanel() {
  const experience = useGameStore((state) => state.experience);
  const completedResearch = useGameStore((state) => state.completedResearch);
  const buyResearch = useGameStore((state) => state.buyResearch);

  return (
    <div className="shop-panel">
      {RESEARCH_DEFS.map((def) => {
        const isCompleted = completedResearch.includes(def.id);
        const prereqsMet = def.requires.every((id) => completedResearch.includes(id));
        const missingNames = def.requires
          .filter((id) => !completedResearch.includes(id))
          .map((id) => nameById[id] ?? `#${id}`)
          .join(", ");

        return (
          <div
            key={def.id}
            className={`generator-card${isCompleted ? " generator-card--disabled" : ""}`}
          >
            <div className="generator-info">
              <span className="generator-name">{def.name}</span>
              <span className="generator-production">{def.description}</span>
              {!prereqsMet && <span className="generator-count">Нужно: {missingNames}</span>}
            </div>
            {isCompleted ? (
              <span className="generator-count">Изучено</span>
            ) : (
              <button
                className="buy-button"
                disabled={!prereqsMet || experience < def.cost}
                onClick={() => buyResearch(def.id)}
                type="button"
              >
                {formatNumber(def.cost, 0)} оп.
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
}
