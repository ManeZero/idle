"""
Уточнённый тест: что если casual всё же продаёт пустые станции (oil=0)?
Это очевидное действие — станция показывает 0/N, кнопка "продать" видна.
"""
from strategy import StrategyParams
from run_sim import run
from variants_v3 import variant_A3_tempo, variant_B3_depth, variant_C3_refined


PROFILES = {
    "Совсем новичок": StrategyParams(
        rotate_ratio=0.0, sell_station_threshold=0.05,  # продаёт только если ≈0
        manual_sell_threshold=200.0,
        research_priority=[1, 2, 3, 4, 5, 6, 7, 8],
    ),
    "Видит подсказки UI": StrategyParams(
        rotate_ratio=0.10,                   # продаёт ОЧЕНЬ медленные
        sell_station_threshold=0.5,
        manual_sell_threshold=100.0,
    ),
    "Опытный": StrategyParams(
        rotate_ratio=0.25, sell_station_threshold=1.0,
    ),
    "Оптимальный": StrategyParams(
        rotate_ratio=0.35, sell_station_threshold=0.5,
    ),
}

variants = [
    ("A3 ТЕМПОВЫЙ", variant_A3_tempo()),
    ("B3 ГЛУБИННЫЙ", variant_B3_depth()),
    ("C3 ПЕРЕСМОТРЕННЫЙ", variant_C3_refined()),
]

print(f"\n{'='*86}")
print(f"{'Вариант':<22} " + " ".join(f"{p:>14}" for p in PROFILES))
print(f"{'='*86}")
for vname, cfg in variants:
    cells = []
    for pname, params in PROFILES.items():
        r = run(cfg, params, max_seconds=90*60, verbose=False)
        marker = "✓" if r.won else "✗"
        cells.append(f"{r.time_to_win/60:5.1f}мин{marker}")
    print(f"{vname:<22} " + " ".join(f"{c:>14}" for c in cells))
