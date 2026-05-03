"""
Симулятор idle-игры про нефть.

Воспроизводит математику из src/game/mechanics/* и src/stores/gameStore.ts.
Содержит "AI-игрока", который принимает решения по стратегии.
"""

from dataclasses import dataclass, field
from typing import Optional


# =============================================================================
# КОНСТАНТЫ — копия src/constants/game.ts. Можно переопределить через Config.
# =============================================================================
@dataclass
class Config:
    starting_currency: float = 1_000
    station_price: float = 500
    station_capacity: float = 10_000
    station_max_production_rate: float = 10
    station_energy_consumption: float = 10
    station_sell_percent: float = 0.6

    oil_sell_price: float = 1.0

    contract_energy: float = 10
    contract_duration: float = 100
    contract_base_cost: float = 100
    contract_cost_per_station: float = 40

    max_station_slots: int = 5
    max_contract_slots: int = 1

    experience_per_barrel: float = 0.1
    autosell_interval: float = 30
    autosell_percent: float = 0.08

    # Исследования: id -> (название, стоимость в XP, требуемые id)
    # Эффекты считаем напрямую в strategy/симуляторе (см. modifiers ниже).
    research_costs: dict = field(default_factory=lambda: {
        1: 100,   # +25% скорость добычи
        2: 120,   # -20% стоимость контракта
        3: 300,   # +50% емкость станции
        4: 350,   # +60% длительность контракта
        5: 600,   # min 1.5 барр/сек
        6: 800,   # +1 слот станции
        7: 900,   # автопродление контракта
        8: 1500,  # автопродажа 8% / 30s
    })
    research_requires: dict = field(default_factory=lambda: {
        1: [], 2: [], 3: [1], 4: [2], 5: [3], 6: [3], 7: [4], 8: [5, 6],
    })


# =============================================================================
# СОСТОЯНИЕ ИГРЫ
# =============================================================================
@dataclass
class Station:
    id: int
    oil_remaining: float
    capacity: float
    energy_consumption: float
    enabled: bool
    purchase_price: float


@dataclass
class Contract:
    id: int
    energy_provided: float
    time_remaining: float


@dataclass
class GameState:
    currency: float = 0
    oil: float = 0
    stations: list = field(default_factory=list)
    contracts: list = field(default_factory=list)
    next_id: int = 1
    experience: float = 0
    completed_research: list = field(default_factory=list)
    autosell_timer: float = 0
    # Метрики для отчётов
    total_oil_sold: float = 0
    total_currency_earned: float = 0
    time_elapsed: float = 0


# =============================================================================
# МОДИФИКАТОРЫ ОТ ИССЛЕДОВАНИЙ (зеркало research.ts)
# =============================================================================
def get_modifiers(completed: list, cfg: Config) -> dict:
    m = {
        "production_rate_multiplier": 1.0,
        "station_capacity_multiplier": 1.0,
        "contract_duration_multiplier": 1.0,
        "contract_cost_multiplier": 1.0,
        "min_production_floor": 0.0,
        "max_station_slots": cfg.max_station_slots,
        "max_contract_slots": cfg.max_contract_slots,
        "autorenew_enabled": False,
        "autosell_enabled": False,
    }
    if 1 in completed: m["production_rate_multiplier"] = 1.25
    if 2 in completed: m["contract_cost_multiplier"] = 0.8
    if 3 in completed: m["station_capacity_multiplier"] = 1.5
    if 4 in completed: m["contract_duration_multiplier"] = 1.6
    if 5 in completed: m["min_production_floor"] = 1.5
    if 6 in completed: m["max_station_slots"] = cfg.max_station_slots + 1
    if 7 in completed: m["autorenew_enabled"] = True
    if 8 in completed: m["autosell_enabled"] = True
    return m


# =============================================================================
# МЕХАНИКА (зеркало oil.ts / energy.ts / contracts.ts)
# =============================================================================
def calc_production_rate(s: Station, mods: dict, cfg: Config) -> float:
    base = (s.oil_remaining / s.capacity) * cfg.station_max_production_rate
    return max(mods["min_production_floor"], base * mods["production_rate_multiplier"])


def calc_contract_cost(enabled_count: int, mods: dict, cfg: Config) -> float:
    raw = cfg.contract_base_cost + max(0, enabled_count - 1) * cfg.contract_cost_per_station
    return int(raw * mods["contract_cost_multiplier"])


def energy_supply(contracts: list) -> float:
    return sum(c.energy_provided for c in contracts)


def energy_demand(stations: list) -> float:
    return sum(s.energy_consumption for s in stations if s.enabled)


def has_enough_energy(contracts: list, stations: list) -> bool:
    return energy_supply(contracts) >= energy_demand(stations)


# =============================================================================
# ШАГ ИГРЫ (один тик ~dt секунд)
# =============================================================================
def tick(state: GameState, cfg: Config, dt: float) -> None:
    mods = get_modifiers(state.completed_research, cfg)

    # 1) Контракты тикают и истекают
    for c in state.contracts:
        c.time_remaining -= dt
    state.contracts = [c for c in state.contracts if c.time_remaining > 0]

    # 2) Автопродление (если нет контракта и есть включённые станции)
    if mods["autorenew_enabled"] and not state.contracts:
        enabled_count = sum(1 for s in state.stations if s.enabled)
        if enabled_count > 0:
            cost = calc_contract_cost(enabled_count, mods, cfg)
            if state.currency >= cost:
                state.currency -= cost
                duration = round(cfg.contract_duration * mods["contract_duration_multiplier"])
                state.contracts.append(Contract(
                    id=state.next_id,
                    energy_provided=enabled_count * cfg.contract_energy,
                    time_remaining=duration,
                ))
                state.next_id += 1

    # 3) Добыча нефти (только если хватает энергии)
    if has_enough_energy(state.contracts, state.stations):
        for s in state.stations:
            if not s.enabled: continue
            rate = calc_production_rate(s, mods, cfg)
            amount = min(rate * dt, s.oil_remaining)
            s.oil_remaining -= amount
            state.oil += amount

    # 4) Автопродажа
    if mods["autosell_enabled"]:
        state.autosell_timer += dt
        if state.autosell_timer >= cfg.autosell_interval:
            state.autosell_timer -= cfg.autosell_interval
            sold = state.oil * cfg.autosell_percent
            state.oil -= sold
            revenue = int(sold * cfg.oil_sell_price)
            state.currency += revenue
            state.experience += sold * cfg.experience_per_barrel
            state.total_oil_sold += sold
            state.total_currency_earned += revenue

    state.time_elapsed += dt


# =============================================================================
# ДЕЙСТВИЯ ИГРОКА (зеркало actions из gameStore.ts)
# =============================================================================
def buy_station(state: GameState, cfg: Config) -> bool:
    mods = get_modifiers(state.completed_research, cfg)
    if state.currency < cfg.station_price: return False
    if len(state.stations) >= mods["max_station_slots"]: return False
    capacity = int(cfg.station_capacity * mods["station_capacity_multiplier"])
    state.currency -= cfg.station_price
    state.stations.append(Station(
        id=state.next_id, oil_remaining=capacity, capacity=capacity,
        energy_consumption=cfg.station_energy_consumption, enabled=True,
        purchase_price=cfg.station_price,
    ))
    state.next_id += 1
    return True


def sell_station(state: GameState, station_id: int, cfg: Config) -> bool:
    s = next((s for s in state.stations if s.id == station_id), None)
    if not s: return False
    state.currency += int(s.purchase_price * cfg.station_sell_percent)
    state.stations = [x for x in state.stations if x.id != station_id]
    return True


def buy_contract(state: GameState, cfg: Config) -> bool:
    mods = get_modifiers(state.completed_research, cfg)
    enabled_count = sum(1 for s in state.stations if s.enabled)
    if enabled_count == 0: return False
    cost = calc_contract_cost(enabled_count, mods, cfg)
    if state.currency < cost: return False
    needed_energy = enabled_count * cfg.contract_energy
    current_energy = sum(c.energy_provided for c in state.contracts)
    is_upgrade = len(state.contracts) > 0 and current_energy < needed_energy
    if len(state.contracts) >= mods["max_contract_slots"] and not is_upgrade: return False
    duration = round(cfg.contract_duration * mods["contract_duration_multiplier"])
    state.currency -= cost
    if is_upgrade:
        state.contracts = [Contract(id=state.next_id, energy_provided=needed_energy,
                                     time_remaining=duration)]
    else:
        state.contracts.append(Contract(id=state.next_id, energy_provided=needed_energy,
                                         time_remaining=duration))
    state.next_id += 1
    return True


def sell_oil(state: GameState, fraction: float, cfg: Config) -> None:
    amount = state.oil * fraction
    state.oil -= amount
    revenue = amount * cfg.oil_sell_price
    state.currency += revenue
    state.experience += amount * cfg.experience_per_barrel
    state.total_oil_sold += amount
    state.total_currency_earned += revenue


def buy_research(state: GameState, rid: int, cfg: Config) -> bool:
    if rid in state.completed_research: return False
    if not all(r in state.completed_research for r in cfg.research_requires[rid]): return False
    cost = cfg.research_costs[rid]
    if state.experience < cost: return False
    state.experience -= cost
    state.completed_research.append(rid)
    # Эффект id=3: пересчитать capacity действующих станций
    if rid == 3:
        new_cap = int(cfg.station_capacity * 1.5)
        for s in state.stations:
            s.capacity = new_cap
    return True


# =============================================================================
# УСЛОВИЕ ПОБЕДЫ
# =============================================================================
def is_won(state: GameState, cfg: Config) -> bool:
    return all(rid in state.completed_research for rid in cfg.research_costs)
