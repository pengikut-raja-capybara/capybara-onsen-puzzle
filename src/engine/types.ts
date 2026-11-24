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
  | 'gate'
  | 'ice'
  | 'portal';

export type HatId = 'none' | 'yuzu' | 'towel' | 'sakura' | 'bamboo_hat' | 'crown';

export type DecorationId =
  | 'rubber_duck'
  | 'bamboo_fountain'
  | 'floating_yuzus'
  | 'sakura_branch'
  | 'paper_lantern'
  | 'baby_capy';

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
  brokenIce: string[]; // "r,c" keys of cracked/melted ice tiles
  gateOpen: boolean;
  moves: number;
  won: boolean;
}

export interface MoveResult {
  nextState: GameState;
  moved: boolean;
  hitObstacle: boolean;
  pushedLog: boolean;
  pushedLogMove?: { from: Position; to: Position };
  collectedYuzu: boolean;
  collectedYuzuSteps?: Array<{ key: string; stepIndex: number }>;
  openedGate: boolean;
  openedGateStep?: number | null;
  crackedIce: boolean;
  crackedIceSteps?: Array<{ key: string; stepIndex: number }>;
  teleported: boolean;
  stoppedByMud?: boolean;
  path: Position[];
}
