export interface GameState {
  points: number;
  generatorCount: number;
  autoBuyUnlocked: boolean;
  autoBuyEnabled: boolean;
}

export interface GameActions {
  tick: (deltaSeconds: number) => void;
  buyGenerator: () => void;
  buyAutoBuy: () => void;
  toggleAutoBuy: () => void;
}
