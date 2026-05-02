export interface GameState {
  points: number;
  generatorCount: number;
}

export interface GameActions {
  tick: (deltaSeconds: number) => void;
  buyGenerator: () => void;
}
