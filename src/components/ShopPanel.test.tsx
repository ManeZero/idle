import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it } from "vitest";
import {
  CONTRACT_BASE_COST,
  CONTRACT_COST_PER_STATION,
  STATION_CAPACITY,
  STATION_ENERGY_CONSUMPTION,
  STATION_PRICE,
} from "@/constants/game";
import { useGameStore } from "@/stores/gameStore";
import type { EnergyContract, OilStation } from "@/types/game";
import { formatNumber } from "@/utils/formatNumber";
import { ShopPanel } from "./ShopPanel";

const stationLabel = new RegExp(`Купить — ${formatNumber(STATION_PRICE, 0)}`);
const contractCostLabel = (n: number) => new RegExp(`Купить — ${formatNumber(n, 0)}`);
const upgradeContractLabel = (n: number) => new RegExp(`Обновить — ${formatNumber(n, 0)}`);

const makeStation = (id: number, overrides: Partial<OilStation> = {}): OilStation => ({
  id,
  oilRemaining: STATION_CAPACITY,
  capacity: STATION_CAPACITY,
  energyConsumption: STATION_ENERGY_CONSUMPTION,
  enabled: true,
  purchasePrice: STATION_PRICE,
  ...overrides,
});

const makeContract = (id: number): EnergyContract => ({
  id,
  energyProvided: 10,
  timeRemaining: 100,
});

const reset = (overrides = {}) => {
  localStorage.clear();
  useGameStore.setState({
    currency: 0,
    oil: 0,
    stations: [],
    contracts: [],
    nextId: 1,
    paused: false,
    experience: 0,
    completedResearch: [],
    autosellTimer: 0,
    ...overrides,
  });
};

beforeEach(() => reset());

describe("ShopPanel", () => {
  it("station buy button disabled when not enough currency", () => {
    reset({ currency: STATION_PRICE - 1 });
    render(<ShopPanel />);
    expect(screen.getByText(stationLabel)).toBeDisabled();
  });

  it("station buy button enabled when enough currency", () => {
    reset({ currency: STATION_PRICE });
    render(<ShopPanel />);
    expect(screen.getByText(stationLabel)).toBeEnabled();
  });

  it("buying station deducts STATION_PRICE", async () => {
    reset({ currency: STATION_PRICE * 2 });
    render(<ShopPanel />);
    await userEvent.click(screen.getByText(stationLabel));
    expect(useGameStore.getState().stations).toHaveLength(1);
    expect(useGameStore.getState().currency).toBe(STATION_PRICE);
  });

  it("station buy button disabled when slot limit reached", () => {
    const stations = [1, 2, 3, 4, 5].map((id) => makeStation(id));
    reset({ currency: STATION_PRICE * 2, stations });
    render(<ShopPanel />);
    expect(screen.getByText(stationLabel)).toBeDisabled();
  });

  it("contract buy button disabled when no enabled stations", () => {
    reset({ currency: 10_000 });
    render(<ShopPanel />);
    expect(screen.getByText(contractCostLabel(CONTRACT_BASE_COST))).toBeDisabled();
  });

  it("contract cost scales with enabled stations", () => {
    const stations = [makeStation(1), makeStation(2), makeStation(3)];
    reset({ currency: 10_000, stations });
    render(<ShopPanel />);
    const expected = CONTRACT_BASE_COST + 2 * CONTRACT_COST_PER_STATION;
    expect(screen.getByText(contractCostLabel(expected))).toBeInTheDocument();
  });

  it("buying contract creates contract with matching energy", async () => {
    reset({ currency: 10_000, stations: [makeStation(1)] });
    render(<ShopPanel />);
    await userEvent.click(screen.getByText(contractCostLabel(CONTRACT_BASE_COST)));
    expect(useGameStore.getState().contracts[0]?.energyProvided).toBe(10);
    expect(useGameStore.getState().currency).toBe(10_000 - CONTRACT_BASE_COST);
  });

  it("contract button shows 'Активен' when contract covers all enabled stations", () => {
    reset({ currency: 10_000, stations: [makeStation(1)], contracts: [makeContract(1)] });
    render(<ShopPanel />);
    expect(screen.getByText("Активен")).toBeDisabled();
  });

  it("contract button shows 'Обновить' when contract is insufficient", () => {
    const contract = makeContract(1);
    const stations = [makeStation(1), makeStation(2)];
    reset({ currency: 10_000, stations, contracts: [contract] });
    render(<ShopPanel />);
    const expected = CONTRACT_BASE_COST + CONTRACT_COST_PER_STATION;
    expect(screen.getByText(upgradeContractLabel(expected))).toBeEnabled();
  });
});
