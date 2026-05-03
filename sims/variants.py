"""
Три варианта баланса игры под цель ~30 мин.

Принципы:
- Total XP под все исследования = "общая нефть, которую игрок продаст за 30 мин"
- Цены исследований — геометрический рост (без скачков типа 900->1500)
- Станции должны истощаться за разумное время (5-8 мин при работе)
- Цикл "купи-добудь-продай станцию" должен быть выгоден
"""
from dataclasses import dataclass


# --- ВАРИАНТ A: ТЕМПОВЫЙ -----------------------------------------------------
# Маленькие дешёвые станции, быстрое истощение, цикл "купи-добудь-продай" — основа.
# Игрок постоянно занят: каждые ~30-60с покупает или продаёт станцию.
def variant_A_tempo():
    from simulator import Config
    return Config(
        starting_currency=300,
        station_price=200,
        station_capacity=2_000,           # было 10000 — в 5 раз меньше
        station_max_production_rate=8,    # быстрая стартовая добыча
        station_energy_consumption=10,
        station_sell_percent=0.7,         # выгоднее продавать
        oil_sell_price=2.0,               # дороже нефть, чтоб циклы были выгодны
        contract_energy=10,
        contract_duration=60,             # короче — больше решений
        contract_base_cost=60,
        contract_cost_per_station=20,
        max_station_slots=4,              # меньше слотов — фокус на ротации
        max_contract_slots=1,
        experience_per_barrel=0.3,        # больше XP за баррель
        autosell_interval=20,
        autosell_percent=0.10,
        research_costs={
            1: 80, 2: 150, 3: 280, 4: 450,
            5: 700, 6: 1000, 7: 1400, 8: 1900,
        },
        research_requires={
            1: [], 2: [], 3: [1], 4: [2], 5: [3], 6: [3], 7: [4], 8: [5, 6],
        },
    )


# --- ВАРИАНТ B: ГЛУБИННЫЙ ----------------------------------------------------
# Меньше станций, дольше живут, главное узкое место — энергия/контракты.
# Игрок сосредоточен на менеджменте контрактов и таймингах.
def variant_B_depth():
    from simulator import Config
    return Config(
        starting_currency=600,
        station_price=400,
        station_capacity=5_000,           # средняя ёмкость
        station_max_production_rate=12,
        station_energy_consumption=15,    # больше энергии нужно
        station_sell_percent=0.5,
        oil_sell_price=1.5,
        contract_energy=15,
        contract_duration=90,
        contract_base_cost=90,
        contract_cost_per_station=35,     # каждая новая станция значительно дороже
        max_station_slots=4,
        max_contract_slots=1,
        experience_per_barrel=0.2,
        autosell_interval=25,
        autosell_percent=0.10,
        research_costs={
            1: 100, 2: 180, 3: 320, 4: 500,
            5: 750, 6: 1100, 7: 1500, 8: 2000,
        },
        research_requires={
            1: [], 2: [], 3: [1], 4: [2], 5: [3], 6: [3], 7: [4], 8: [5, 6],
        },
    )


# --- ВАРИАНТ C: ТЕКУЩИЙ-ПЕРЕСМОТРЕННЫЙ ---------------------------------------
# Сохраняет структуру текущего, но устраняет долгое ожидание в финале.
# Главное: исследования стоят пропорционально, станции истощаются быстрее.
def variant_C_refined():
    from simulator import Config
    return Config(
        starting_currency=500,
        station_price=300,
        station_capacity=3_000,           # было 10000 — в 3.3 раза меньше
        station_max_production_rate=10,   # как было
        station_energy_consumption=10,    # как было
        station_sell_percent=0.6,
        oil_sell_price=1.5,
        contract_energy=10,
        contract_duration=80,
        contract_base_cost=80,
        contract_cost_per_station=30,
        max_station_slots=5,
        max_contract_slots=1,
        experience_per_barrel=0.25,       # больше XP за баррель — быстрее исследования
        autosell_interval=25,
        autosell_percent=0.10,
        research_costs={
            1: 90, 2: 130, 3: 250, 4: 400,
            5: 600, 6: 850, 7: 1200, 8: 1700,  # сглаженные стоимости
        },
        research_requires={
            1: [], 2: [], 3: [1], 4: [2], 5: [3], 6: [3], 7: [4], 8: [5, 6],
        },
    )
