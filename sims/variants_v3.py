"""
Версия 3: финальная настройка под 30 минут.

Корректировки от v2:
- A2 (32 мин) → A3: чуть быстрее (XP/баррель 0.15 → 0.16)
- B2 (36 мин) → B3: ощутимо быстрее (XP/баррель 0.10 → 0.13)
- C2 (25 мин) → C3: медленнее (XP/баррель 0.12 → 0.10)
"""
from simulator import Config


def variant_A3_tempo():
    """ТЕМПОВЫЙ: маленькие станции, постоянная ротация. Цель: 30 мин."""
    return Config(
        starting_currency=300,
        station_price=200,
        station_capacity=2_000,
        station_max_production_rate=8,
        station_energy_consumption=10,
        station_sell_percent=0.6,
        oil_sell_price=2.0,
        contract_energy=10,
        contract_duration=60,
        contract_base_cost=60,
        contract_cost_per_station=20,
        max_station_slots=4,
        max_contract_slots=1,
        experience_per_barrel=0.16,
        autosell_interval=20,
        autosell_percent=0.10,
        research_costs={
            1: 80, 2: 150, 3: 300, 4: 500,
            5: 800, 6: 1200, 7: 1700, 8: 2300,
        },
        research_requires={
            1: [], 2: [], 3: [1], 4: [2], 5: [3], 6: [3], 7: [4], 8: [5, 6],
        },
    )


def variant_B3_depth():
    """ГЛУБИННЫЙ: дорогие станции, акцент на энергии и контрактах. Цель: 30 мин."""
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
        experience_per_barrel=0.13,
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


def variant_C3_refined():
    """ПЕРЕСМОТРЕННЫЙ: близко к текущему, минимум изменений. Цель: 30 мин."""
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
        experience_per_barrel=0.10,
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
