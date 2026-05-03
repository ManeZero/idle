"""Финальный прогон v3."""
from strategy import StrategyParams
from run_sim import run
from metrics import report
from variants_v3 import variant_A3_tempo, variant_B3_depth, variant_C3_refined

variants = [
    ("A3: ТЕМПОВЫЙ", variant_A3_tempo()),
    ("B3: ГЛУБИННЫЙ", variant_B3_depth()),
    ("C3: ПЕРЕСМОТРЕННЫЙ", variant_C3_refined()),
]

results = []
for name, cfg in variants:
    r = run(cfg, StrategyParams(), max_seconds=60*60, verbose=True)
    report(name, r)
    results.append((name, r, cfg))

print("\n\n" + "="*70)
print("СВОДНАЯ ТАБЛИЦА v3")
print("="*70)
print(f"{'вариант':<25} {'мин':>6} {'won':>5} {'event':>6} {'maxgap':>7}")
for name, r, _ in results:
    times = [t for t, _ in r.decision_log]
    gaps = [times[i+1]-times[i] for i in range(len(times)-1)] if len(times) > 1 else [0]
    print(f"{name:<25} {r.time_to_win/60:>6.1f} {str(r.won):>5} "
          f"{len(times):>6} {max(gaps):>7.0f}")
