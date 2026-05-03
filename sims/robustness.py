"""
Тест устойчивости: как поведёт себя игра при разных уровнях мастерства игрока?

- "Casual": не делает ротацию станций, лениво апгрейдит контракты
- "Default": базовая стратегия
- "Optimal": лучшая найденная
"""
from strategy import StrategyParams
from run_sim import run
from variants_v3 import variant_A3_tempo, variant_B3_depth, variant_C3_refined


PROFILES = {
    "Casual (новичок)": StrategyParams(
        rotate_ratio=0.0,                # вообще не ротирует
        sell_station_threshold=0.1,      # почти никогда не продаёт станции
        contract_buy_ahead_seconds=1.0,  # покупает контракт впритык
        manual_sell_threshold=200.0,     # копит нефть долго
        research_priority=[1, 2, 3, 4, 5, 6, 7, 8],  # просто по порядку
    ),
    "Average (средний)": StrategyParams(
        rotate_ratio=0.20,
        sell_station_threshold=1.0,
        manual_sell_threshold=100.0,
    ),
    "Optimal (читер)": StrategyParams(
        rotate_ratio=0.35,
        sell_station_threshold=0.5,
        manual_sell_threshold=50.0,
    ),
}

variants = [
    ("A3 ТЕМПОВЫЙ", variant_A3_tempo()),
    ("B3 ГЛУБИННЫЙ", variant_B3_depth()),
    ("C3 ПЕРЕСМОТРЕННЫЙ", variant_C3_refined()),
]

print(f"\n{'='*78}")
print(f"{'Вариант':<22} {'Casual':>14} {'Average':>14} {'Optimal':>14} {'Δ':>10}")
print(f"{'='*78}")
for vname, cfg in variants:
    times = {}
    for pname, params in PROFILES.items():
        r = run(cfg, params, max_seconds=90*60, verbose=False)
        times[pname] = (r.won, r.time_to_win/60)

    cas_w, cas_t = times["Casual (новичок)"]
    avg_w, avg_t = times["Average (средний)"]
    opt_w, opt_t = times["Optimal (читер)"]

    cas_str = f"{cas_t:5.1f}мин" + ("✓" if cas_w else "✗")
    avg_str = f"{avg_t:5.1f}мин" + ("✓" if avg_w else "✗")
    opt_str = f"{opt_t:5.1f}мин" + ("✓" if opt_w else "✗")
    delta = (cas_t - opt_t) / opt_t * 100 if opt_w and cas_w else 0
    print(f"{vname:<22} {cas_str:>14} {avg_str:>14} {opt_str:>14} {delta:>9.0f}%")

print(f"{'='*78}")
print("Δ — насколько casual медленнее optimal в %")
print("✓ = победа, ✗ = не дошёл за 90 мин")
