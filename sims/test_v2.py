"""Прогон v2 вариантов."""
from strategy import StrategyParams
from run_sim import run
from metrics import report
from variants_v2 import variant_A2_tempo, variant_B2_depth, variant_C2_refined

variants = [
    ("A2: ТЕМПОВЫЙ", variant_A2_tempo()),
    ("B2: ГЛУБИННЫЙ", variant_B2_depth()),
    ("C2: ПЕРЕСМОТРЕННЫЙ", variant_C2_refined()),
]

results = []
for name, cfg in variants:
    r = run(cfg, StrategyParams(), max_seconds=60*60, verbose=True)
    report(name, r)
    results.append((name, r))

print("\n\n" + "="*70)
print("СВОДНАЯ ТАБЛИЦА v2")
print("="*70)
print(f"{'вариант':<25} {'мин':>6} {'won':>5} {'event':>6} {'maxgap':>7} {'idle_end':>9}")
for name, r in results:
    times = [t for t, _ in r.decision_log]
    gaps = [times[i+1]-times[i] for i in range(len(times)-1)] if len(times) > 1 else [0]
    research_ts = [t for t, a in r.decision_log if "research(" in a]
    idle_after_last = (r.time_to_win - max(research_ts))/60 if research_ts else 0
    print(f"{name:<25} {r.time_to_win/60:>6.1f} {str(r.won):>5} "
          f"{len(times):>6} {max(gaps):>7.0f} {idle_after_last:>9.1f}")
