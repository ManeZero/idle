"""
Поиск оптимальной стратегии для каждого варианта баланса.

Перебираем:
- Порядок исследований (несколько разумных)
- Порог продажи станций (sell_station_threshold)
- Ratio ротации (rotate_ratio)

Для каждой комбинации запускаем симуляцию, выбираем минимальное время до победы.
"""
from itertools import product
from strategy import StrategyParams
from run_sim import run
from variants_v3 import variant_A3_tempo, variant_B3_depth, variant_C3_refined


# Несколько разумных порядков исследований
ORDERS = {
    "default": [1, 2, 4, 3, 7, 6, 5, 8],            # ускорение, скидка, длительность, ёмкость, авто, слот, пол, авторпродажа
    "production_first": [1, 3, 5, 6, 2, 4, 7, 8],    # фокус на добычу
    "energy_first": [2, 4, 7, 1, 3, 5, 6, 8],        # фокус на контракты
    "balanced": [1, 2, 3, 4, 5, 6, 7, 8],            # просто по id
    "late_floor": [1, 2, 4, 3, 6, 7, 5, 8],          # пол добычи и автосейв позже
}

ROTATE_RATIOS = [0.15, 0.25, 0.35, 0.50]
SELL_THRESHOLDS = [0.5, 1.0, 1.5, 2.5]


def find_best(name: str, cfg) -> tuple:
    best = (float("inf"), None)
    tested = 0
    for order_name, order in ORDERS.items():
        for rr, st in product(ROTATE_RATIOS, SELL_THRESHOLDS):
            params = StrategyParams(
                research_priority=order, rotate_ratio=rr, sell_station_threshold=st,
            )
            r = run(cfg, params, max_seconds=60*60, verbose=False)
            tested += 1
            if r.won and r.time_to_win < best[0]:
                best = (r.time_to_win, (order_name, rr, st, r))
    return best, tested


for name, cfg in [
    ("A3 ТЕМПОВЫЙ", variant_A3_tempo()),
    ("B3 ГЛУБИННЫЙ", variant_B3_depth()),
    ("C3 ПЕРЕСМОТРЕННЫЙ", variant_C3_refined()),
]:
    print(f"\n{'='*70}\nОптимизация стратегии для {name}\n{'='*70}")
    (t, opt), tested = find_best(name, cfg)
    if opt is None:
        print(f"Перебрано {tested} комбинаций — победа не достигнута!")
        continue
    order_name, rr, st, result = opt
    print(f"Перебрано {tested} комбинаций.")
    print(f"Лучшее время: {t/60:.2f} мин")
    print(f"Порядок исследований: {order_name}")
    print(f"rotate_ratio = {rr}, sell_threshold = {st}")
    print(f"Финал: {result.summary()}")
