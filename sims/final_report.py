"""
Финальный отчёт: ASCII-график активности и тайминга для всех вариантов.
"""
from strategy import StrategyParams
from run_sim import run
from variants_v3 import variant_A3_tempo, variant_B3_depth, variant_C3_refined


def ascii_bar(value: float, max_val: float, width: int = 30) -> str:
    n = int(round(value / max_val * width)) if max_val > 0 else 0
    return "█" * n + "·" * (width - n)


def render(name: str, cfg, params: StrategyParams) -> None:
    r = run(cfg, params, max_seconds=60*60, verbose=True)
    print(f"\n{'='*78}\n{name}\n{'='*78}")
    print(f"Время прохождения: {r.time_to_win/60:.2f} мин")
    print(f"Финал: ${r.final_state.currency:.0f}, нефти продано: {r.final_state.total_oil_sold:.0f}")

    # События по 1-мин окнам
    minutes = int(r.time_to_win / 60) + 1
    counts = [0] * minutes
    for t, _ in r.decision_log:
        m = int(t / 60)
        if m < minutes:
            counts[m] += 1
    max_c = max(counts) if counts else 1

    print("\n  АКТИВНОСТЬ ПО МИНУТАМ (количество решений):")
    for i, c in enumerate(counts):
        marker = ""
        for t, action in r.decision_log:
            if int(t/60) == i and "research(" in action:
                rid = next((p.replace("research(", "").replace(")", "")
                           for p in action.split(",") if "research(" in p), "")
                marker += f" R{rid}"
        print(f"  {i:2}:{i+1:2}мин |{ascii_bar(c, max_c, 25)}| {c:3} {marker}")


PARAMS = StrategyParams()  # default optimal-ish

for name, cfg in [
    ("A3: ТЕМПОВЫЙ — мелкие станции, постоянная ротация", variant_A3_tempo()),
    ("B3: ГЛУБИННЫЙ — менеджмент энергии, дорогие апгрейды", variant_B3_depth()),
    ("C3: ПЕРЕСМОТРЕННЫЙ — близко к текущему коду", variant_C3_refined()),
]:
    render(name, cfg, PARAMS)
