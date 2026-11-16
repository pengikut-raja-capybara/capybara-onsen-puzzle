import { Direction, GameState, LevelConfig, MoveResult, Position, TileType } from './types';

export const posKey = (p: Position): string => `${p.r},${p.c}`;

export const samePos = (a: Position, b: Position): boolean => a.r === b.r && a.c === b.c;

const DIR_DELTA: Record<Direction, Position> = {
  up: { r: -1, c: 0 },
  down: { r: 1, c: 0 },
  left: { r: 0, c: -1 },
  right: { r: 0, c: 1 },
};

const STREAM_DIR: Partial<Record<TileType, Direction>> = {
  stream_up: 'up',
  stream_down: 'down',
  stream_left: 'left',
  stream_right: 'right',
};

export function createInitialState(level: LevelConfig): GameState {
  const logs = level.tiles
    .filter((t) => t.type === 'log')
    .map((t) => ({ r: t.r, c: t.c }));

  return {
    capybara: { ...level.start },
    logs,
    collectedYuzus: [],
    gateOpen: false,
    moves: 0,
    won: false,
  };
}

function getStaticTileAt(level: LevelConfig, r: number, c: number): TileType | null {
  for (const t of level.tiles) {
    if (t.type !== 'log' && t.r === r && t.c === c) {
      return t.type;
    }
  }
  return null;
}

function findLogIndexAt(logs: Position[], r: number, c: number): number {
  return logs.findIndex((l) => l.r === r && l.c === c);
}

function isInBounds(level: LevelConfig, r: number, c: number): boolean {
  return r >= 0 && r < level.gridSize.rows && c >= 0 && c < level.gridSize.cols;
}

function isBlockingTile(tile: TileType | null, gateOpen: boolean): boolean {
  if (tile === 'rock') return true;
  if (tile === 'gate' && !gateOpen) return true;
  return false;
}

export function stepMove(level: LevelConfig, state: GameState, initialDir: Direction): MoveResult {
  if (state.won) {
    return {
      nextState: state,
      moved: false,
      hitObstacle: false,
      pushedLog: false,
      collectedYuzu: false,
      openedGate: false,
      path: [],
    };
  }

  let curR = state.capybara.r;
  let curC = state.capybara.c;
  let dir = initialDir;
  const logs = state.logs.map((l) => ({ ...l }));
  const collectedSet = new Set(state.collectedYuzus);
  let gateOpen = state.gateOpen;

  let moved = false;
  let hitObstacle = false;
  let pushedLog = false;
  let collectedYuzu = false;
  let openedGate = false;
  const path: Position[] = [];

  const visitedStepStates = new Set<string>();
  visitedStepStates.add(`${curR},${curC},${dir}`);

  for (let steps = 0; steps < 100; steps++) {
    const delta = DIR_DELTA[dir];
    const nr = curR + delta.r;
    const nc = curC + delta.c;

    if (!isInBounds(level, nr, nc)) {
      hitObstacle = true;
      break;
    }

    const staticTile = getStaticTileAt(level, nr, nc);
    if (isBlockingTile(staticTile, gateOpen)) {
      hitObstacle = true;
      break;
    }

    const logIdx = findLogIndexAt(logs, nr, nc);
    if (logIdx !== -1) {
      // Try to push the log 1 cell forward
      const pushR = nr + delta.r;
      const pushC = nc + delta.c;
      const pushTile = isInBounds(level, pushR, pushC) ? getStaticTileAt(level, pushR, pushC) : null;
      const canPush =
        isInBounds(level, pushR, pushC) &&
        !isBlockingTile(pushTile, gateOpen) &&
        findLogIndexAt(logs, pushR, pushC) === -1 &&
        !samePos({ r: pushR, c: pushC }, level.goal) &&
        pushTile !== 'button';

      if (canPush) {
        logs[logIdx] = { r: pushR, c: pushC };
        curR = nr;
        curC = nc;
        moved = true;
        pushedLog = true;
        path.push({ r: curR, c: curC });
        // Capybara stops after pushing a log
        const yKey = posKey({ r: curR, c: curC });
        if (level.yuzus.some((y) => y.r === curR && y.c === curC) && !collectedSet.has(yKey)) {
          collectedSet.add(yKey);
          collectedYuzu = true;
        }
        break;
      } else {
        hitObstacle = true;
        break;
      }
    }

    // Advance capybara
    curR = nr;
    curC = nc;
    moved = true;
    path.push({ r: curR, c: curC });

    // Collect Yuzu if present
    const yKey = posKey({ r: curR, c: curC });
    if (level.yuzus.some((y) => y.r === curR && y.c === curC) && !collectedSet.has(yKey)) {
      collectedSet.add(yKey);
      collectedYuzu = true;
    }

    // Check Goal (Onsen)
    if (curR === level.goal.r && curC === level.goal.c) {
      return {
        nextState: {
          capybara: { r: curR, c: curC },
          logs,
          collectedYuzus: Array.from(collectedSet),
          gateOpen,
          moves: state.moves + 1,
          won: true,
        },
        moved: true,
        hitObstacle: false,
        pushedLog,
        collectedYuzu,
        openedGate,
        path,
      };
    }

    // Check Button
    if (staticTile === 'button' && !gateOpen) {
      gateOpen = true;
      openedGate = true;
    }

    // Check Mud (stops capybara)
    if (staticTile === 'mud') {
      break;
    }

    // Check Stream (redirects capybara)
    if (staticTile && STREAM_DIR[staticTile]) {
      dir = STREAM_DIR[staticTile]!;
      const stepKey = `${curR},${curC},${dir}`;
      if (visitedStepStates.has(stepKey)) {
        // Prevent infinite stream loop
        break;
      }
      visitedStepStates.add(stepKey);
    }
  }

  if (!moved) {
    return {
      nextState: state,
      moved: false,
      hitObstacle,
      pushedLog: false,
      collectedYuzu: false,
      openedGate: false,
      path: [],
    };
  }

  return {
    nextState: {
      capybara: { r: curR, c: curC },
      logs,
      collectedYuzus: Array.from(collectedSet),
      gateOpen,
      moves: state.moves + 1,
      won: false,
    },
    moved: true,
    hitObstacle,
    pushedLog,
    collectedYuzu,
    openedGate,
    path,
  };
}

export function calculateStars(level: LevelConfig, state: GameState): number {
  if (!state.won) return 0;
  let stars = 1;
  const allYuzus = state.collectedYuzus.length >= level.yuzus.length;
  const withinPar = state.moves <= level.parMoves;

  if (level.yuzus.length === 0) {
    if (withinPar) return 3;
    if (state.moves <= level.parMoves + 2) return 2;
    return 1;
  }

  if (withinPar) stars += 1;
  if (allYuzus) stars += 1;
  return stars;
}

function serializeState(s: GameState): string {
  const logsStr = s.logs.map((l) => `${l.r},${l.c}`).join(';');
  const yuzuStr = [...s.collectedYuzus].sort().join(';');
  return `${s.capybara.r},${s.capybara.c}|${s.gateOpen ? 1 : 0}|${logsStr}|${yuzuStr}`;
}

export interface BfsSolution {
  solvable: boolean;
  minMoves: number;
  directions: Direction[];
  allYuzusMoves: number | null;
}

export function solveLevelBFS(
  level: LevelConfig,
  initialState?: GameState,
  maxStates = 15000
): BfsSolution {
  const start = initialState ?? createInitialState(level);
  if (start.won) {
    return { solvable: true, minMoves: 0, directions: [], allYuzusMoves: 0 };
  }

  const dirs: Direction[] = ['up', 'down', 'left', 'right'];
  const visited = new Set<string>();
  visited.add(serializeState(start));

  const queue: Array<{ state: GameState; path: Direction[] }> = [{ state: start, path: [] }];
  let head = 0;

  let firstWin: { moves: number; path: Direction[] } | null = null;
  let allYuzusMoves: number | null = null;

  while (head < queue.length && visited.size < maxStates) {
    const current = queue[head++];

    for (const d of dirs) {
      const res = stepMove(level, current.state, d);
      if (!res.moved) continue;

      const nextPath = [...current.path, d];
      if (res.nextState.won) {
        if (!firstWin) {
          firstWin = { moves: nextPath.length, path: nextPath };
        }
        if (
          allYuzusMoves === null &&
          res.nextState.collectedYuzus.length >= level.yuzus.length
        ) {
          allYuzusMoves = nextPath.length;
          return {
            solvable: true,
            minMoves: firstWin.moves,
            directions: firstWin.path,
            allYuzusMoves,
          };
        }
        continue;
      }

      const key = serializeState(res.nextState);
      if (!visited.has(key)) {
        visited.add(key);
        queue.push({ state: res.nextState, path: nextPath });
      }
    }
  }

  if (firstWin) {
    return {
      solvable: true,
      minMoves: firstWin.moves,
      directions: firstWin.path,
      allYuzusMoves,
    };
  }

  return {
    solvable: false,
    minMoves: -1,
    directions: [],
    allYuzusMoves: null,
  };
}
