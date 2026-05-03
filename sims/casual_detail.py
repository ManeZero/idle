"""Детальный разбор: где застревает casual игрок?"""
from strategy import StrategyParams
from run_sim import run
from variants_v3 import variant_C3_refined

cfg = variant_C3_refined()
casual = StrategyParams(
    rotate_ratio=0.0, sell_station_threshold=0.05,
    manual_sell_threshold=200.0,
    research_priority=[1, 2, 3, 4, 5, 6, 7, 8],
)

r = run(cfg, casual, max_seconds=60*60, verbose=True)
print(f"Время: {r.time_to_win/60:.1f}мин, won={r.won}")
print(f"Финал: {r.final_state.currency:.0f}$, oil={r.final_state.oil:.0f}, XP={r.final_state.experience:.0f}")
print(f"Исследования куплены: {sorted(r.final_state.completed_research)}")
print(f"Всего нефти продано: {r.final_state.total_oil_sold:.0f}")

print("\n--- Темп набора XP по 5-мин окнам ---")
prev_xp_total = 0
for h in r.history:
    if int(h["t"]) % 300 == 0 and h["t"] > 0:
        # Сколько XP реально было за окно
        # XP = (oil sold * 0.12) — но XP в state это текущий запас, не накопленный
        print(f"  {h['t']/60:5.1f} мин: $={h['currency']:>7.0f}  oil={h['oil']:>5.0f} "
              f"  XP={h['xp']:>6.0f}  ст={h['stations']}  иссл={h['research_done']}/8")

print("\n--- Тайминг исследований ---")
for t, action in r.decision_log:
    for part in action.split(","):
        if "research(" in part:
            rid = part.replace("research(", "").replace(")", "")
            print(f"  {t/60:5.1f} мин -> R{rid}")
