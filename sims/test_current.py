"""Прогон с текущими константами (как сейчас в коде игры)."""
from simulator import Config
from strategy import StrategyParams
from run_sim import run

cfg = Config()  # дефолты = текущие константы из constants/game.ts
params = StrategyParams()

print("=" * 70)
print("ТЕКУЩИЙ БАЛАНС (без изменений)")
print("=" * 70)
print(f"Старт: ${cfg.starting_currency} | Станция: ${cfg.station_price} "
      f"({cfg.station_capacity} баррелей, {cfg.station_max_production_rate}/с)")
print(f"Контракт базовый: ${cfg.contract_base_cost} на {cfg.contract_duration}с")
print(f"Цена нефти: ${cfg.oil_sell_price} | XP/баррель: {cfg.experience_per_barrel}")
print(f"Слотов: {cfg.max_station_slots} (+1 от research)")
print()

result = run(cfg, params, max_seconds=120 * 60)  # 2 часа максимум
print(result.summary())
if result.bottleneck:
    print(f"Боттлнек: {result.bottleneck}")

print("\n--- Динамика (каждые 60 сек) ---")
print(f"{'t,мин':>6} {'$':>8} {'нефть':>7} {'XP':>6} {'ст':>3} {'к':>3} {'иссл':>5}")
for h in result.history:
    if int(h["t"]) % 60 == 0:
        print(f"{h['t']/60:>6.1f} {h['currency']:>8.0f} {h['oil']:>7.0f} "
              f"{h['xp']:>6.0f} {h['stations']:>3} {h['contracts']:>3} "
              f"{h['research_done']:>5}")
