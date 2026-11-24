import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const LEVELS_DIR = path.join(__dirname, '..', 'src', 'data', 'levels');

const DIR_DELTA = {
  up: { r: -1, c: 0 },
  down: { r: 1, c: 0 },
  left: { r: 0, c: -1 },
  right: { r: 0, c: 1 },
};

const STREAM_DIR = {
  stream_up: 'up',
  stream_down: 'down',
  stream_left: 'left',
  stream_right: 'right',
};

const posKey = (p) => `${p.r},${p.c}`;
const samePos = (a, b) => a.r === b.r && a.c === b.c;

function createInitialState(level) {
  return {
    capybara: { ...level.start },
    logs: level.tiles.filter((t) => t.type === 'log').map((t) => ({ r: t.r, c: t.c })),
    collectedYuzus: [],
    brokenIce: [],
    gateOpen: false,
    moves: 0,
    won: false,
  };
}

function getStaticTileAt(level, r, c) {
  for (const t of level.tiles) {
    if (t.type !== 'log' && t.r === r && t.c === c) return t.type;
  }
  return null;
}

function findOtherPortal(level, r, c) {
  const portals = level.tiles.filter((t) => t.type === 'portal');
  if (portals.length < 2) return null;
  const other = portals.find((p) => p.r !== r || p.c !== c);
  return other ? { r: other.r, c: other.c } : null;
}

function isInBounds(level, r, c) {
  return r >= 0 && r < level.gridSize.rows && c >= 0 && c < level.gridSize.cols;
}

function isBlockingTile(tile, gateOpen, isBrokenIce) {
  if (tile === 'rock') return true;
  if (tile === 'gate' && !gateOpen) return true;
  if (tile === 'ice' && isBrokenIce) return true;
  return false;
}

function stepMove(level, state, initialDir) {
  if (state.won) return { nextState: state, moved: false };
  let curR = state.capybara.r;
  let curC = state.capybara.c;
  let dir = initialDir;
  const logs = state.logs.map((l) => ({ ...l }));
  const collectedSet = new Set(state.collectedYuzus);
  const brokenIceSet = new Set(state.brokenIce);
  let gateOpen = state.gateOpen;
  let moved = false;

  const visited = new Set([`${curR},${curC},${dir}`]);

  for (let steps = 0; steps < 100; steps++) {
    const delta = DIR_DELTA[dir];
    const nr = curR + delta.r;
    const nc = curC + delta.c;

    if (!isInBounds(level, nr, nc)) break;
    const staticTile = getStaticTileAt(level, nr, nc);
    const nKey = `${nr},${nc}`;
    if (isBlockingTile(staticTile, gateOpen, brokenIceSet.has(nKey))) break;

    const logIdx = logs.findIndex((l) => l.r === nr && l.c === nc);
    if (logIdx !== -1) {
      const pushR = nr + delta.r;
      const pushC = nc + delta.c;
      const pushKey = `${pushR},${pushC}`;
      const pushTile = isInBounds(level, pushR, pushC) ? getStaticTileAt(level, pushR, pushC) : null;
      const canPush =
        isInBounds(level, pushR, pushC) &&
        !isBlockingTile(pushTile, gateOpen, brokenIceSet.has(pushKey)) &&
        logs.findIndex((l) => l.r === pushR && l.c === pushC) === -1 &&
        !samePos({ r: pushR, c: pushC }, level.goal) &&
        pushTile !== 'button' &&
        pushTile !== 'portal' &&
        pushTile !== 'ice';

      if (canPush) {
        logs[logIdx] = { r: pushR, c: pushC };
        curR = nr;
        curC = nc;
        moved = true;
        if (staticTile === 'ice') brokenIceSet.add(nKey);
        const yKey = posKey({ r: curR, c: curC });
        if (level.yuzus.some((y) => y.r === curR && y.c === curC)) collectedSet.add(yKey);
        break;
      } else {
        break;
      }
    }

    curR = nr;
    curC = nc;
    moved = true;

    if (staticTile === 'ice') brokenIceSet.add(nKey);

    const yKey = posKey({ r: curR, c: curC });
    if (level.yuzus.some((y) => y.r === curR && y.c === curC)) collectedSet.add(yKey);

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
      };
    }

    if (staticTile === 'button') gateOpen = true;
    if (staticTile === 'mud') break;

    if (staticTile === 'portal') {
      const target = findOtherPortal(level, curR, curC);
      if (target && logs.findIndex((l) => l.r === target.r && l.c === target.c) === -1) {
        curR = target.r;
        curC = target.c;
        const tKey = posKey({ r: curR, c: curC });
        if (level.yuzus.some((y) => y.r === curR && y.c === curC)) collectedSet.add(tKey);
        const pk = `${curR},${curC},${dir}`;
        if (visited.has(pk)) break;
        visited.add(pk);
      }
    }

    if (staticTile && STREAM_DIR[staticTile]) {
      dir = STREAM_DIR[staticTile];
      const sk = `${curR},${curC},${dir}`;
      if (visited.has(sk)) break;
      visited.add(sk);
    }
  }

  if (!moved) return { nextState: state, moved: false };
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
  };
}

function serialize(s) {
  return `${s.capybara.r},${s.capybara.c}|${s.gateOpen ? 1 : 0}|${s.logs.map((l) => `${l.r},${l.c}`).join(';')}|${[...s.collectedYuzus].sort().join(';')}|${[...s.brokenIce].sort().join(';')}`;
}

function solveBFS(level, maxStates = 15000) {
  const start = createInitialState(level);
  const dirs = ['up', 'down', 'left', 'right'];
  const visited = new Set([serialize(start)]);
  const queue = [{ state: start, moves: 0 }];
  let head = 0;
  let firstWin = null;

  while (head < queue.length && visited.size < maxStates) {
    const cur = queue[head++];
    for (const d of dirs) {
      const res = stepMove(level, cur.state, d);
      if (!res.moved) continue;
      const nextMoves = cur.moves + 1;
      if (res.nextState.won) {
        if (firstWin === null) firstWin = nextMoves;
        if (res.nextState.collectedYuzus.length >= level.yuzus.length) {
          return { solvable: true, minMoves: firstWin, allYuzusMoves: nextMoves };
        }
        continue;
      }
      const key = serialize(res.nextState);
      if (!visited.has(key)) {
        visited.add(key);
        queue.push({ state: res.nextState, moves: nextMoves });
      }
    }
  }
  if (firstWin !== null) return { solvable: true, minMoves: firstWin, allYuzusMoves: null };
  return { solvable: false, minMoves: -1, allYuzusMoves: null };
}

const files = fs.readdirSync(LEVELS_DIR).filter((f) => f.endsWith('.json')).sort();
let total = 0;
let errors = 0;

for (const file of files) {
  const levels = JSON.parse(fs.readFileSync(path.join(LEVELS_DIR, file), 'utf-8'));
  for (const lv of levels) {
    total++;
    const res = solveBFS(lv);
    if (!res.solvable) {
      console.error(`❌ [${file}] ${lv.id} (${lv.title}) is NOT solvable!`);
      errors++;
    } else if (lv.yuzus.length > 0 && res.allYuzusMoves === null) {
      console.error(`⚠️ [${file}] ${lv.id} (${lv.title}) cannot collect all Yuzus!`);
      errors++;
    }
  }
}

if (errors > 0) {
  console.error(`Validation failed with ${errors} error(s) out of ${total} stages.`);
  process.exit(1);
}
console.log(`✅ All ${total} stages across ${files.length} chapter file(s) are valid and solvable!`);
