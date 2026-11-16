export type Direction = 'up' | 'down' | 'left' | 'right';

export interface Position {
  r: number;
  c: number;
}

export type TileType =
  | 'rock'
  | 'mud'
  | 'log'
  | 'stream_up'
  | 'stream_down'
  | 'stream_left'
  | 'stream_right'
  | 'button'
  | 'gate';

export interface TilePlacement {
  r: number;
  c: number;
  type: TileType;
}

export interface LevelConfig {
  id: string;
  chapter: number;
  stageNumber: number;
  title: string;
  hintText?: string;
  gridSize: {
    rows: number;
    cols: number;
  };
  parMoves: number;
  start: Position;
  goal: Position;
  yuzus: Position[];
  tiles: TilePlacement[];
}

export interface ChapterMeta {
  id: number;
  title: string;
  subtitle: string;
  themeColor: string;
  accentColor: string;
  boardBg: string;
  cellBg: string;
  unlockStarsRequired: number;
}

export interface GameState {
  capybara: Position;
  logs: Position[];
  collectedYuzus: string[]; // "r,c" keys
  gateOpen: boolean;
  moves: number;
  won: boolean;
}

export interface MoveResult {
  nextState: GameState;
  moved: boolean;
  hitObstacle: boolean;
  pushedLog: boolean;
  collectedYuzu: boolean;
  openedGate: boolean;
  path: Position[];
}
