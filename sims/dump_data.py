"""
Прогоняем все варианты, собираем подробные истории, складываем в JSON
для использования в HTML-отчёте.
"""
import json
from dataclasses import asdict
from simulator import Config, GameState, get_modifiers, tick, buy_station, buy_contract
from strategy import StrategyParams, decide
from variants_v3 import variant_A3_tempo, variant_B3_depth, variant_C3_refined


def run_detailed(cfg: Config, params: StrategyParams,
                 max_seconds: int = 60*60, dt: float = 1.0,
                 sample_every: int = 2):
    """Прогон с записью истории каждые sample_every секунд (для уменьшения размера)."""
    state = GameState(currency=cfg.starting_currency)
    if cfg.starting_currency >= cfg.station_price:
        buy_station(state, cfg)
        buy_contract(state, cfg)

    history = []
    decision_log = []
    research_times = {}
    t = 0.0

    while t < max_seconds:
        tick(state, cfg, dt)
        t += dt
        actions = decide(state, cfg, params)
        if actions:
            decision_log.append({"t": round(t, 1), "actions": actions})
            for a in actions:
                if a.startswith("research("):
                    rid = int(a.replace("research(", "").replace(")", ""))
                    if rid not in research_times:
                        research_times[rid] = t

        if int(t) % sample_every == 0:
            mods = get_modifiers(state.completed_research, cfg)
            # Индивидуальный fill для каждой станции (упорядочены по id для стабильности)
            stations_sorted = sorted(state.stations, key=lambda s: s.id)
            fills = [round(s.oil_remaining / s.capacity * 100, 1)
                     for s in stations_sorted]
            history.append({
                "t": int(t),
                "c": round(state.currency),
                "o": round(state.oil),
                "x": round(state.experience),
                "s": len(state.stations),
                "k": len(state.contracts),
                "r": len(state.completed_research),
                "es": int(sum(c.energy_provided for c in state.contracts)),
                "ed": int(sum(s.energy_consumption for s in state.stations if s.enabled)),
                "fills": fills,  # массив fill каждой станции, %
            })

        if len(state.completed_research) == 8:
            break

    return {
        "history": history,
        "decision_log": decision_log,
        "research_times": {str(k): round(v, 1) for k, v in research_times.items()},
        "time_to_win": round(t, 1),
        "won": len(state.completed_research) == 8,
        "final_currency": round(state.currency),
        "total_oil_sold": round(state.total_oil_sold),
    }


def cfg_to_dict(cfg: Config) -> dict:
    """Чистый dict без research_costs/requires (они в отдельном поле)."""
    d = {k: v for k, v in asdict(cfg).items() if not k.startswith("research_")}
    d["research_costs"] = cfg.research_costs
    return d


def run_current_baseline():
    """Текущий баланс — для сравнения."""
    return Config()


PARAMS = StrategyParams()
data = {}

for name, cfg_fn in [
    ("current", run_current_baseline),
    ("A", variant_A3_tempo),
    ("B", variant_B3_depth),
    ("C", variant_C3_refined),
]:
    cfg = cfg_fn()
    print(f"Прогон {name}...")
    result = run_detailed(cfg, PARAMS)
    data[name] = {
        "config": cfg_to_dict(cfg),
        **result,
    }
    print(f"  -> {result['time_to_win']/60:.1f}мин, won={result['won']}, "
          f"history len={len(result['history'])}, decisions={len(result['decision_log'])}")

# Также сохраним устойчивость (профили игрока)
PROFILES = {
    "casual": StrategyParams(rotate_ratio=0.0, sell_station_threshold=0.05,
                              manual_sell_threshold=200.0,
                              research_priority=[1, 2, 3, 4, 5, 6, 7, 8]),
    "average": StrategyParams(rotate_ratio=0.20, sell_station_threshold=1.0),
    "optimal": StrategyParams(rotate_ratio=0.35, sell_station_threshold=0.5),
}
robustness = {}
for vname, cfg_fn in [("A", variant_A3_tempo), ("B", variant_B3_depth), ("C", variant_C3_refined)]:
    robustness[vname] = {}
    cfg = cfg_fn()
    for pname, params in PROFILES.items():
        r = run_detailed(cfg, params, max_seconds=90*60)
        robustness[vname][pname] = {
            "time_to_win": r["time_to_win"],
            "won": r["won"],
            "research_count": 8 if r["won"] else (r["history"][-1]["r"] if r["history"] else 0),
        }

data["robustness"] = robustness

# Имена исследований
data["research_names"] = {
    "1": "Опытный бурильщик (+25% добыча)",
    "2": "Дешёвые контракты (-20%)",
    "3": "Расширенный резервуар (+50% ёмкость)",
    "4": "Долгосрочные контракты (+60% длительность)",
    "5": "Вторичная добыча (мин. 1.5 барр/с)",
    "6": "6-й слот станции",
    "7": "Автопродление контракта",
    "8": "Нефтепровод (автопродажа)",
}

with open("/home/mane/Projects/Idle1/sims/data.json", "w") as f:
    json.dump(data, f, separators=(",", ":"))

import os
size = os.path.getsize("/home/mane/Projects/Idle1/sims/data.json")
print(f"\nЗаписано в data.json: {size/1024:.1f} KB")
