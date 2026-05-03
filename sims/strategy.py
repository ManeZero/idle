"""
Стратегия "идеального игрока" v2.

Главное улучшение: ROTATE — продаём истощённые станции даже при наличии
min_production_floor, если новая станция даст больший прирост и хватает валюты.

Каждую секунду игрок принимает решения:
  - продать ли истощающиеся станции (порог по производительности или ротация)
  - купить ли станцию (если есть энергия и валюта, и есть слот)
  - купить/обновить ли контракт
  - продать ли нефть (если нет автопродажи)
  - купить ли исследование
"""

from dataclasses import dataclass, field
from simulator import (
    Config, GameState, get_modifiers, calc_production_rate, calc_contract_cost,
    energy_supply, buy_station, buy_contract, sell_station,
    sell_oil, buy_research,
)


@dataclass
class StrategyParams:
    # Если фактическая добыча станции ниже этого, и она <X% полна — продать
    sell_station_threshold: float = 1.0
    # Ротация: если станция выдаёт меньше N% от max_rate новой станции — продать
    rotate_ratio: float = 0.25
    contract_buy_ahead_seconds: float = 5.0
    manual_sell_threshold: float = 50.0
    currency_reserve_for_contract: float = 1.0
    # Приоритет исследований
    research_priority: list = field(default_factory=lambda: [1, 2, 4, 3, 7, 6, 5, 8])


def _new_station_rate(cfg: Config, mods: dict) -> float:
    """Стартовая добыча новой станции после всех модификаторов."""
    return cfg.station_max_production_rate * mods["production_rate_multiplier"]


def _consider_sell_or_rotate(state: GameState, cfg: Config, p: StrategyParams,
                             mods: dict, actions: list) -> None:
    """Продажа станций: если истощены и не работают эффективно."""
    new_rate = _new_station_rate(cfg, mods)
    rotate_target = new_rate * p.rotate_ratio

    for s in list(state.stations):
        rate = calc_production_rate(s, mods, cfg)
        # Случай 1: сильно истощена и ниже порога
        if rate < p.sell_station_threshold and s.oil_remaining < s.capacity * 0.10:
            # При наличии floor — всё равно продаём, если меньше 5% полна
            if mods["min_production_floor"] > 0 and s.oil_remaining > s.capacity * 0.05:
                continue
            sell_station(state, s.id, cfg)
            actions.append(f"sell_station({s.id})")
            continue
        # Случай 2: РОТАЦИЯ — даже при наличии floor, если можем позволить замену
        if rate < rotate_target and s.oil_remaining < s.capacity * 0.30:
            # Хватает ли валюты на покупку новой?
            if state.currency >= cfg.station_price * 1.2:
                sell_station(state, s.id, cfg)
                actions.append(f"rotate_station({s.id})")


def _maintain_contract(state: GameState, cfg: Config, p: StrategyParams,
                       mods: dict, actions: list) -> None:
    """Поддерживаем активный контракт под все включённые станции."""
    enabled_count = sum(1 for s in state.stations if s.enabled)
    if enabled_count == 0: return
    needed_energy = enabled_count * cfg.contract_energy
    current_energy = energy_supply(state.contracts)

    # A: контракт скоро истечёт (без автопродления)
    if not mods["autorenew_enabled"]:
        needs_renewal = (
            len(state.contracts) == 0
            or min((c.time_remaining for c in state.contracts), default=0)
               < p.contract_buy_ahead_seconds
        )
        if needs_renewal:
            cost = calc_contract_cost(enabled_count, mods, cfg)
            if state.currency >= cost and buy_contract(state, cfg):
                actions.append(f"buy_contract(${cost})")

    # B: контракт не покрывает энергию — апгрейд
    if current_energy < needed_energy:
        cost = calc_contract_cost(enabled_count, mods, cfg)
        if state.currency >= cost and buy_contract(state, cfg):
            actions.append(f"upgrade_contract(${cost})")


def _buy_more_stations(state: GameState, cfg: Config, p: StrategyParams,
                       mods: dict, actions: list) -> None:
    """Покупка новых станций пока есть слоты, валюта и энергия."""
    while len(state.stations) < mods["max_station_slots"]:
        future_enabled = sum(1 for s in state.stations if s.enabled) + 1
        future_contract_cost = calc_contract_cost(future_enabled, mods, cfg)
        reserve = future_contract_cost * p.currency_reserve_for_contract
        if state.currency < cfg.station_price + reserve: break
        if not buy_station(state, cfg): break
        actions.append("buy_station")
        # Сразу апгрейдим контракт под новую станцию
        new_enabled = sum(1 for s in state.stations if s.enabled)
        new_needed = new_enabled * cfg.contract_energy
        if energy_supply(state.contracts) < new_needed:
            cost = calc_contract_cost(new_enabled, mods, cfg)
            if state.currency >= cost and buy_contract(state, cfg):
                actions.append(f"upgrade_after_buy(${cost})")


def _research_buys(state: GameState, cfg: Config, p: StrategyParams,
                   actions: list) -> None:
    """Покупаем исследования по приоритету."""
    for rid in p.research_priority:
        if rid in state.completed_research: continue
        if not all(r in state.completed_research for r in cfg.research_requires[rid]):
            continue
        if state.experience >= cfg.research_costs[rid]:
            buy_research(state, rid, cfg)
            actions.append(f"research({rid})")


def decide(state: GameState, cfg: Config, p: StrategyParams) -> list:
    """Главная функция решений. Возвращает список выполненных действий."""
    actions = []
    mods = get_modifiers(state.completed_research, cfg)

    _consider_sell_or_rotate(state, cfg, p, mods, actions)
    _maintain_contract(state, cfg, p, mods, actions)
    _buy_more_stations(state, cfg, p, mods, actions)

    if not mods["autosell_enabled"] and state.oil >= p.manual_sell_threshold:
        sell_oil(state, 1.0, cfg)
        actions.append("sell_oil")

    _research_buys(state, cfg, p, actions)
    return actions
