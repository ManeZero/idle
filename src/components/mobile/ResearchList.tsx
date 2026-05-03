import { RESEARCH_DEFS } from "@/game/mechanics/research";
import { useGameStore } from "@/stores/gameStore";

type Status = "done" | "available" | "locked";

function status(id: number, completed: number[]): Status {
  if (completed.includes(id)) return "done";
  const def = RESEARCH_DEFS.find((r) => r.id === id);
  if (!def) return "locked";
  return def.requires.every((r) => completed.includes(r)) ? "available" : "locked";
}

export function ResearchList() {
  const experience = useGameStore((s) => s.experience);
  const completedResearch = useGameStore((s) => s.completedResearch);
  const buyResearch = useGameStore((s) => s.buyResearch);

  return (
    <div className="bp-mrnd">
      <div className="bp-mrnd__head">
        <span>R&amp;D · ИССЛЕДОВАНИЯ</span>
        <span>
          {completedResearch.length} / 8 · {Math.round(experience).toLocaleString("ru-RU")} XP
        </span>
      </div>
      <div className="bp-mrnd__list">
        {RESEARCH_DEFS.map((r) => {
          const st = status(r.id, completedResearch);
          const canBuy = st === "available" && experience >= r.cost;
          return (
            <div key={r.id} className={`bp-mrnd__row bp-mrnd__row--${st}`}>
              <div className="bp-mrnd__info">
                <div className="bp-mrnd__title">
                  <span className="bp-mrnd__id">R{r.id}</span>
                  <span className="bp-mrnd__name">{r.name}</span>
                </div>
                <div className="bp-mrnd__effect">{r.description}</div>
                {r.requires.length > 0 && (
                  <div className="bp-mrnd__req">
                    требует: {r.requires.map((x) => `R${x}`).join(" + ")}
                  </div>
                )}
              </div>
              <div className="bp-mrnd__action">
                <div className="bp-mrnd__cost">{st === "done" ? "✓" : `${r.cost} XP`}</div>
                {st !== "done" && (
                  <button
                    type="button"
                    className="bp-mrnd__btn"
                    disabled={!canBuy}
                    onClick={() => buyResearch(r.id)}
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
