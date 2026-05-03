export const TICK_INTERVAL_MS = 100;
export const STORAGE_KEY = "idle-game";

export const STARTING_CURRENCY = 500;

export const STATION_PRICE = 300;
export const STATION_CAPACITY = 3_000;
export const STATION_MAX_PRODUCTION_RATE = 10;

// Лимит ёмкости центрального резервуара (накопленная нефть, ждущая продажи).
// Если резервуар полон — добытая нефть пропадает (станции качают, но впустую).
export const OIL_TANK_CAPACITY = 10_000;
export const STATION_ENERGY_CONSUMPTION = 10;
export const STATION_SELL_PERCENT = 0.6;

export const OIL_SELL_PRICE = 1.5;

export const CONTRACT_ENERGY = 10;
export const CONTRACT_DURATION = 80;
export const CONTRACT_BASE_COST = 80;
export const CONTRACT_COST_PER_STATION = 30;

export const MAX_STATION_SLOTS = 5;
export const MAX_CONTRACT_SLOTS = 1;

export const EXPERIENCE_PER_BARREL = 0.1;
export const AUTOSELL_INTERVAL_SECONDS = 25;
export const AUTOSELL_PERCENT = 0.1;
