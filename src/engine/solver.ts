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
    brokenIce: [],
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

function findOtherPortal(level: LevelConfig, r: number, c: number): Position | null {
  const portals = level.tiles.filter((t) => t.type === 'portal');
  if (portals.length < 2) return null;
  const other = portals.find((p) => p.r !== r || p.c !== c);
  return other ? { r: other.r, c: other.c } : null;
}

function findLogIndexAt(logs: Position[], r: number, c: number): number {
  return logs.findIndex((l) => l.r === r && l.c === c);
}

function isInBounds(level: LevelConfig, r: number, c: number): boolean {
  return r >= 0 && r < level.gridSize.rows && c >= 0 && c < level.gridSize.cols;
}

function isBlockingTile(
  tile: TileType | null,
  gateOpen: boolean,
  isBrokenIce: boolean
): boolean {
  if (tile === 'rock') return true;
  if (tile === 'gate' && !gateOpen) return true;
  if (tile === 'ice' && isBrokenIce) return true;
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
      collectedYuzuSteps: [],
      openedGate: false,
      openedGateStep: null,
      crackedIce: false,
      crackedIceSteps: [],
      teleported: false,
      stoppedByMud: false,
      path: [],
    };
  }

  let curR = state.capybara.r;
  let curC = state.capybara.c;
  let dir = initialDir;
  const logs = state.logs.map((l) => ({ ...l }));
  const collectedSet = new Set(state.collectedYuzus);
  const brokenIceSet = new Set(state.brokenIce);
  let gateOpen = state.gateOpen;

  let moved = false;
  let hitObstacle = false;
  let pushedLog = false;
  let pushedLogMove: { from: Position; to: Position } | undefined;
  let collectedYuzu = false;
  const collectedYuzuSteps: Array<{ key: string; stepIndex: number }> = [];
  let openedGate = false;
  let openedGateStep: number | null = null;
  let crackedIce = false;
  const crackedIceSteps: Array<{ key: string; stepIndex: number }> = [];
  let teleported = false;
  let stoppedByMud = false;
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
    const nKey = `${nr},${nc}`;
    if (isBlockingTile(staticTile, gateOpen, brokenIceSet.has(nKey))) {
      hitObstacle = true;
      break;
    }

    const logIdx = findLogIndexAt(logs, nr, nc);
    if (logIdx !== -1) {
      // Try to push the log 1 cell forward
      const pushR = nr + delta.r;
      const pushC = nc + delta.c;
      const pushKey = `${pushR},${pushC}`;
      const pushTile = isInBounds(level, pushR, pushC)
        ? getStaticTileAt(level, pushR, pushC)
        : null;
      const canPush =
        isInBounds(level, pushR, pushC) &&
        !isBlockingTile(pushTile, gateOpen, brokenIceSet.has(pushKey)) &&
        findLogIndexAt(logs, pushR, pushC) === -1 &&
        !samePos({ r: pushR, c: pushC }, level.goal) &&
        pushTile !== 'button' &&
        pushTile !== 'portal' &&
        pushTile !== 'ice';

      if (canPush) {
        logs[logIdx] = { r: pushR, c: pushC };
        pushedLogMove = { from: { r: nr, c: nc }, to: { r: pushR, c: pushC } };
        curR = nr;
        curC = nc;
        moved = true;
        pushedLog = true;
        path.push({ r: curR, c: curC });
        const stepIdx = path.length - 1;
        if (staticTile === 'ice' && !brokenIceSet.has(nKey)) {
          brokenIceSet.add(nKey);
          crackedIce = true;
          crackedIceSteps.push({ key: nKey, stepIndex: stepIdx });
        }
        const yKey = posKey({ r: curR, c: curC });
        if (level.yuzus.some((y) => y.r === curR && y.c === curC) && !collectedSet.has(yKey)) {
          collectedSet.add(yKey);
          collectedYuzu = true;
          collectedYuzuSteps.push({ key: yKey, stepIndex: stepIdx });
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
    const stepIdx = path.length - 1;

    // Crack thin ice once stepped on
    if (staticTile === 'ice' && !brokenIceSet.has(nKey)) {
      brokenIceSet.add(nKey);
      crackedIce = true;
      crackedIceSteps.push({ key: nKey, stepIndex: stepIdx });
    }

    // Collect Yuzu if present
    const yKey = posKey({ r: curR, c: curC });
    if (level.yuzus.some((y) => y.r === curR && y.c === curC) && !collectedSet.has(yKey)) {
      collectedSet.add(yKey);
      collectedYuzu = true;
      collectedYuzuSteps.push({ key: yKey, stepIndex: stepIdx });
    }

    // Check Goal (Onsen)
    if (curR === level.goal.r && curC === level.goal.c) {
      return {
        nextState: {
          capybara: { r: curR, c: curC },
          logs,
          collectedYuzus: Array.from(collectedSet),
          brokenIce: Array.from(brokenIceSet),
          gateOpen,
          moves: state.moves + 1,
          won: true,
        },
        moved: true,
        hitObstacle: false,
        pushedLog,
        pushedLogMove,
        collectedYuzu,
        collectedYuzuSteps,
        openedGate,
        openedGateStep,
        crackedIce,
        crackedIceSteps,
        teleported,
        stoppedByMud: false,
        path,
      };
    }

    // Check Button
    if (staticTile === 'button' && !gateOpen) {
      gateOpen = true;
      openedGate = true;
      openedGateStep = stepIdx;
    }

    // Check Mud (stops capybara)
    if (staticTile === 'mud') {
      stoppedByMud = true;
      break;
    }

    // Check Portal (teleports capybara to paired portal and continues sliding)
    if (staticTile === 'portal') {
      const target = findOtherPortal(level, curR, curC);
      if (target && findLogIndexAt(logs, target.r, target.c) === -1) {
        curR = target.r;
        curC = target.c;
        teleported = true;
        path.push({ r: curR, c: curC });
        const portalStepIdx = path.length - 1;
        const tKey = posKey({ r: curR, c: curC });
        if (level.yuzus.some((y) => y.r === curR && y.c === curC) && !collectedSet.has(tKey)) {
          collectedSet.add(tKey);
          collectedYuzu = true;
          collectedYuzuSteps.push({ key: tKey, stepIndex: portalStepIdx });
        }
        const portalStepKey = `${curR},${curC},${dir}`;
        if (visitedStepStates.has(portalStepKey)) {
          break;
        }
        visitedStepStates.add(portalStepKey);
      }
    }

    // Check Stream (redirects capybara)
    if (staticTile && STREAM_DIR[staticTile]) {
      dir = STREAM_DIR[staticTile]!;
      const stepKey = `${curR},${curC},${dir}`;
      if (visitedStepStates.has(stepKey)) {
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
      collectedYuzuSteps: [],
      openedGate: false,
      openedGateStep: null,
      crackedIce: false,
      crackedIceSteps: [],
      teleported: false,
      stoppedByMud: false,
      path: [],
    };
  }

  return {
    nextState: {
      capybara: { r: curR, c: curC },
      logs,
      collectedYuzus: Array.from(collectedSet),
      brokenIce: Array.from(brokenIceSet),
      gateOpen,
      moves: state.moves + 1,
      won: false,
    },
    moved: true,
    hitObstacle,
    pushedLog,
    pushedLogMove,
    collectedYuzu,
    collectedYuzuSteps,
    openedGate,
    openedGateStep,
    crackedIce,
    crackedIceSteps,
    teleported,
    stoppedByMud,
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
  const iceStr = [...s.brokenIce].sort().join(';');
  return `${s.capybara.r},${s.capybara.c}|${s.gateOpen ? 1 : 0}|${logsStr}|${yuzuStr}|${iceStr}`;
}

export interface BfsSolution {
  solvable: boolean;
  minMoves: number;
  directions: Direction[];
  allYuzusMoves: number | null;
  allYuzusDirections: Direction[] | null;
}

export function solveLevelBFS(
  level: LevelConfig,
  initialState?: GameState,
  maxStates = 15000
): BfsSolution {
  const start = initialState ?? createInitialState(level);
  if (start.won) {
    return {
      solvable: true,
      minMoves: 0,
      directions: [],
      allYuzusMoves: 0,
      allYuzusDirections: start.collectedYuzus.length >= level.yuzus.length ? [] : null,
    };
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
            directions: nextPath,
            allYuzusMoves,
            allYuzusDirections: nextPath,
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
      allYuzusDirections: null,
    };
  }

  return {
    solvable: false,
    minMoves: -1,
    directions: [],
    allYuzusMoves: null,
    allYuzusDirections: null,
  };
}
