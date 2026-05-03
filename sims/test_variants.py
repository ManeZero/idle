"""Прогон всех вариантов и сравнение."""
from simulator import Config
from strategy import StrategyParams
from run_sim import run
from metrics import report
from variants import variant_A_tempo, variant_B_depth, variant_C_refined


# Текущий
print("\n##### ТЕКУЩИЙ БАЛАНС (для сравнения) #####")
result_cur = run(Config(), StrategyParams(), max_seconds=60*60, verbose=True)
report("CURRENT (как сейчас в коде)", result_cur)

# Вариант A
print("\n\n##### ВАРИАНТ A: ТЕМПОВЫЙ #####")
result_A = run(variant_A_tempo(), StrategyParams(), max_seconds=60*60, verbose=True)
report("A: ТЕМПОВЫЙ", result_A)

# Вариант B
print("\n\n##### ВАРИАНТ B: ГЛУБИННЫЙ #####")
result_B = run(variant_B_depth(), StrategyParams(), max_seconds=60*60, verbose=True)
report("B: ГЛУБИННЫЙ", result_B)

# Вариант C
print("\n\n##### ВАРИАНТ C: ПЕРЕСМОТРЕННЫЙ #####")
result_C = run(variant_C_refined(), StrategyParams(), max_seconds=60*60, verbose=True)
report("C: ПЕРЕСМОТРЕННЫЙ", result_C)

# Сводная таблица
print("\n\n" + "="*70)
print("СВОДНАЯ ТАБЛИЦА")
print("="*70)
print(f"{'вариант':<20} {'мин':>6} {'won':>5} {'event':>6} {'maxgap':>7} {'idle_end':>9}")
for name, r in [("CURRENT", result_cur), ("A_tempo", result_A),
                ("B_depth", result_B), ("C_refined", result_C)]:
    times = [t for t, _ in r.decision_log]
    gaps = [times[i+1]-times[i] for i in range(len(times)-1)] if len(times) > 1 else [0]
    research_ts = [t for t, a in r.decision_log if "research(" in a]
    idle_after_last = (r.time_to_win - max(research_ts))/60 if research_ts else 0
    print(f"{name:<20} {r.time_to_win/60:>6.1f} {str(r.won):>5} "
          f"{len(times):>6} {max(gaps):>7.0f} {idle_after_last:>9.1f}")
