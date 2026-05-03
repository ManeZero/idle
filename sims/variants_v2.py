"""
Версия 2 вариантов баланса — растянуты под ~30 мин с улучшенной AI.

Ключевые изменения:
- В A,B,C версии 1 игра проходилась за 10-15 мин из-за эффективной ротации станций.
- Теперь поднял стоимости исследований и снизил XP/баррель так, чтобы
  суммарной добычи хватало точно на 28-30 мин при оптимальной игре.
"""
from simulator import Config


# ============================================================================
# A2: ТЕМПОВЫЙ — много мелких станций, постоянная ротация
# Главная фишка: цикл "купи-добудь-продай-купи" 60-90 секунд.
# ============================================================================
def variant_A2_tempo():
    return Config(
        starting_currency=300,
        station_price=200,
        station_capacity=2_000,
        station_max_production_rate=8,
        station_energy_consumption=10,
        station_sell_percent=0.6,         # снижено: ротация менее тривиальна
        oil_sell_price=2.0,
        contract_energy=10,
        contract_duration=60,
        contract_base_cost=60,
        contract_cost_per_station=20,
        max_station_slots=4,
        max_contract_slots=1,
        experience_per_barrel=0.15,       # было 0.3 — растянули в 2x
        autosell_interval=20,
        autosell_percent=0.10,
        research_costs={
            1: 80, 2: 150, 3: 300, 4: 500,
            5: 800, 6: 1200, 7: 1700, 8: 2300,  # геом. рост ~1.4
        },
        research_requires={
            1: [], 2: [], 3: [1], 4: [2], 5: [3], 6: [3], 7: [4], 8: [5, 6],
        },
    )


# ============================================================================
# B2: ГЛУБИННЫЙ — энергия и контракты — основная сложность
# Большие дорогие станции, апгрейды контрактов важны.
# ============================================================================
def variant_B2_depth():
    return Config(
        starting_currency=600,
        station_price=400,
        station_capacity=5_000,
        station_max_production_rate=12,
        station_energy_consumption=15,
        station_sell_percent=0.5,
        oil_sell_price=1.5,
        contract_energy=15,
        contract_duration=90,
        contract_base_cost=90,
        contract_cost_per_station=40,
        max_station_slots=4,
        max_contract_slots=1,
        experience_per_barrel=0.10,       # было 0.2 — растянули
        autosell_interval=25,
        autosell_percent=0.10,
        research_costs={
            1: 100, 2: 180, 3: 350, 4: 550,
            5: 900, 6: 1400, 7: 1900, 8: 2600,
        },
        research_requires={
            1: [], 2: [], 3: [1], 4: [2], 5: [3], 6: [3], 7: [4], 8: [5, 6],
        },
    )


# ============================================================================
# C2: ПЕРЕСМОТРЕННЫЙ — близко к текущему, но без долгого ожидания в финале
# Нативный для текущей игры — минимальные изменения констант.
# ============================================================================
def variant_C2_refined():
    return Config(
        starting_currency=500,
        station_price=300,
        station_capacity=3_000,
        station_max_production_rate=10,
        station_energy_consumption=10,
        station_sell_percent=0.6,
        oil_sell_price=1.5,
        contract_energy=10,
        contract_duration=80,
        contract_base_cost=80,
        contract_cost_per_station=30,
        max_station_slots=5,
        max_contract_slots=1,
        experience_per_barrel=0.12,       # было 0.25 — растянули
        autosell_interval=25,
        autosell_percent=0.10,
        research_costs={
            1: 90, 2: 140, 3: 280, 4: 450,
            5: 750, 6: 1150, 7: 1600, 8: 2200,
        },
        research_requires={
            1: [], 2: [], 3: [1], 4: [2], 5: [3], 6: [3], 7: [4], 8: [5, 6],
        },
    )
