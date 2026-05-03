"""
Движок прогона симуляции.

Запускает игру с заданным конфигом и стратегией, собирает метрики,
возвращает время прохождения и историю состояний.
"""

from dataclasses import dataclass, field
from simulator import (
    Config, GameState, tick, buy_station, buy_contract, sell_oil, is_won,
    get_modifiers,
)
from strategy import StrategyParams, decide


@dataclass
class SimResult:
    won: bool
    time_to_win: float  # секунды
    final_state: GameState
    history: list = field(default_factory=list)  # снэпшоты раз в 10 сек
    decision_log: list = field(default_factory=list)  # (time, action)
    bottleneck: str = ""

    def summary(self) -> str:
        s = self.final_state
        m = self.time_to_win / 60
        return (
            f"Won={self.won}  Time={m:.1f}min  "
            f"Currency={s.currency:.0f}  Oil={s.oil:.0f}  XP={s.experience:.0f}  "
            f"Research={len(s.completed_research)}/8  "
            f"OilSold={s.total_oil_sold:.0f}"
        )


def run(cfg: Config, params: StrategyParams,
        max_seconds: int = 60 * 60, dt: float = 1.0,
        log_every: int = 10, verbose: bool = False) -> SimResult:
    """Запуск симуляции до победы или таймаута. dt = 1 сек/тик."""
    state = GameState(currency=cfg.starting_currency)
    history = []
    decision_log = []

    t = 0.0
    won = False

    # Начальное действие: купить станцию + контракт (как делает реальный игрок)
    if cfg.starting_currency >= cfg.station_price:
        buy_station(state, cfg)
        buy_contract(state, cfg)
        decision_log.append((0.0, "init_buy"))

    last_progress_t = 0.0
    last_currency = state.currency
    last_oil_sold = 0

    while t < max_seconds:
        tick(state, cfg, dt)
        t += dt

        # Решения раз в секунду
        actions = decide(state, cfg, params)
        if actions and verbose:
            decision_log.append((t, ",".join(actions)))

        # Снэпшот для истории
        if int(t) % log_every == 0:
            mods = get_modifiers(state.completed_research, cfg)
            history.append({
                "t": t,
                "currency": state.currency,
                "oil": state.oil,
                "xp": state.experience,
                "stations": len(state.stations),
                "contracts": len(state.contracts),
                "research_done": len(state.completed_research),
                "energy_supply": sum(c.energy_provided for c in state.contracts),
                "energy_demand": sum(s.energy_consumption for s in state.stations if s.enabled),
            })

        # Прогресс?
        if (state.total_currency_earned > last_currency * 1.1
            or state.total_oil_sold > last_oil_sold * 1.1
            or len(state.completed_research) > 0):
            last_progress_t = t
            last_currency = max(last_currency, state.total_currency_earned)
            last_oil_sold = max(last_oil_sold, state.total_oil_sold)

        if is_won(state, cfg):
            won = True
            break

        # Стопор: если 5 минут нет прогресса — игра застряла
        if t - last_progress_t > 300:
            break

    bottleneck = ""
    if not won:
        s = state
        if s.experience < min(cfg.research_costs.values()):
            bottleneck = "не накопить XP даже на первое исследование"
        elif len(s.completed_research) < 8:
            missing = [r for r in cfg.research_costs if r not in s.completed_research]
            bottleneck = f"не куплены исследования {missing}, XP={s.experience:.0f}"

    return SimResult(
        won=won, time_to_win=t, final_state=state,
        history=history, decision_log=decision_log, bottleneck=bottleneck,
    )
