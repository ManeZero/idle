export interface OilStation {
  id: number;
  oilRemaining: number;
  capacity: number;
  energyConsumption: number;
  enabled: boolean;
  purchasePrice: number;
}

export interface EnergyContract {
  id: number;
  energyProvided: number;
  timeRemaining: number;
}

export interface GameState {
  currency: number;
  oil: number;
  stations: OilStation[];
  contracts: EnergyContract[];
  nextId: number;
  paused: boolean;
  experience: number;
  completedResearch: number[];
  autosellTimer: number;
}

export interface GameActions {
  tick: (deltaSeconds: number) => void;
  buyOilStation: () => void;
  sellOilStation: (id: number) => void;
  toggleOilStation: (id: number) => void;
  buyContract: () => void;
  sellOil: (fraction: number) => void;
  togglePause: () => void;
  buyResearch: (id: number) => void;
}
