import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const LEVELS_DIR = path.join(__dirname, '..', 'src', 'data', 'levels');
fs.mkdirSync(LEVELS_DIR, { recursive: true });

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
        finalDir: dir,
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
    finalDir: dir,
  };
}

function serializeBoardOnly(s) {
  return `${s.capybara.r},${s.capybara.c}|${s.gateOpen ? 1 : 0}|${s.logs.map((l) => `${l.r},${l.c}`).join(';')}|${[...s.brokenIce].sort().join(';')}`;
}

function serializeFull(s) {
  return `${serializeBoardOnly(s)}|${[...s.collectedYuzus].sort().join(';')}`;
}

// Analyzes both solvability and how many distinct non-cycling winning paths exist
function analyzeLevelPaths(level, maxStates = 8000) {
  const start = createInitialState(level);
  const dirs = ['up', 'down', 'left', 'right'];
  const bestDepthByState = new Map([[serializeFull(start), 0]]);
  const queue = [
    {
      state: start,
      path: [],
      visitedBoardPos: new Set([`${start.capybara.r},${start.capybara.c}`]),
    },
  ];
  let head = 0;
  let minMoves = null;
  let allYuzusMoves = null;
  let distinctWinPaths = 0;
  let optimalWinPaths = 0;
  const entryDirs = new Set();
  const winningFirstDirs = new Set();

  while (head < queue.length && bestDepthByState.size < maxStates) {
    const cur = queue[head++];
    if (minMoves !== null && cur.path.length > minMoves + 2) continue;

    for (const d of dirs) {
      const res = stepMove(level, cur.state, d);
      if (!res.moved) continue;
      const nextPath = [...cur.path, d];

      if (res.nextState.won) {
        if (minMoves === null) minMoves = nextPath.length;
        if (nextPath.length <= minMoves + 2) {
          distinctWinPaths++;
          entryDirs.add(res.finalDir || d);
          winningFirstDirs.add(nextPath[0]);
        }
        if (nextPath.length === minMoves) {
          optimalWinPaths++;
        }
        if (
          allYuzusMoves === null &&
          res.nextState.collectedYuzus.length >= level.yuzus.length
        ) {
          allYuzusMoves = nextPath.length;
        }
        continue;
      }

      const posStr = `${res.nextState.capybara.r},${res.nextState.capybara.c}`;
      // Don't count silly back-and-forth loops as distinct paths
      if (cur.visitedBoardPos.has(posStr) && !res.nextState.gateOpen) continue;

      const key = serializeFull(res.nextState);
      const prevDepth = bestDepthByState.get(key);
      // Allow multiple paths to reach the same state at the same or +1 depth
      if (prevDepth === undefined || (nextPath.length <= prevDepth + 1 && queue.length < maxStates)) {
        if (prevDepth === undefined) {
          bestDepthByState.set(key, nextPath.length);
        }
        const nextVisitedPos = new Set(cur.visitedBoardPos);
        nextVisitedPos.add(posStr);
        queue.push({
          state: res.nextState,
          path: nextPath,
          visitedBoardPos: nextVisitedPos,
        });
      }
    }
  }

  return {
    solvable: minMoves !== null,
    minMoves: minMoves ?? -1,
    allYuzusMoves,
    distinctWinPaths,
    optimalWinPaths,
    entryDirsCount: entryDirs.size,
    winningFirstDirsCount: winningFirstDirs.size,
  };
}

let seed = 918273;
function rand() {
  seed = (seed * 1664525 + 1013904223) % 4294967296;
  return seed / 4294967296;
}
function randInt(min, max) {
  return Math.floor(rand() * (max - min + 1)) + min;
}
function pick(arr) {
  return arr[Math.floor(rand() * arr.length)];
}

function generateLevel({
  id,
  chapter,
  stageNumber,
  title,
  hintText,
  rows,
  cols,
  minMovesReq,
  maxMovesReq,
  rockCount,
  mudCount,
  logCount,
  streamCount,
  iceCount = 0,
  hasPortal = false,
  hasGate = false,
  yuzuCount,
  multiPath, // true = banyak jalan (>= 4 paths), false = hard/tight (1-2 optimal paths)
}) {
  const effectiveMudCount = multiPath ? Math.max(mudCount, 3) : mudCount;
  const effectiveRockCount = multiPath ? Math.max(2, rockCount - 1) : rockCount;

  for (let attempt = 0; attempt < 3500; attempt++) {
    const occupied = new Set();
    const start = { r: randInt(0, rows - 1), c: randInt(0, cols - 1) };
    occupied.add(posKey(start));

    let goal;
    do {
      goal = { r: randInt(0, rows - 1), c: randInt(0, cols - 1) };
    } while (
      occupied.has(posKey(goal)) ||
      Math.abs(goal.r - start.r) + Math.abs(goal.c - start.c) < 2
    );
    occupied.add(posKey(goal));

    const tiles = [];
    const placeRandom = (type, count, innerOnly = false) => {
      const minR = innerOnly ? 1 : 0;
      const maxR = innerOnly ? rows - 2 : rows - 1;
      const minC = innerOnly ? 1 : 0;
      const maxC = innerOnly ? cols - 2 : cols - 1;
      for (let i = 0; i < count; i++) {
        for (let t = 0; t < 40; t++) {
          const p = { r: randInt(minR, maxR), c: randInt(minC, maxC) };
          if (!occupied.has(posKey(p))) {
            occupied.add(posKey(p));
            tiles.push({ r: p.r, c: p.c, type });
            break;
          }
        }
      }
    };

    placeRandom('rock', effectiveRockCount);
    placeRandom('mud', effectiveMudCount);
    placeRandom('log', logCount);
    placeRandom('ice', iceCount);

    const streamTypes = ['stream_up', 'stream_down', 'stream_left', 'stream_right'];
    for (let i = 0; i < streamCount; i++) {
      placeRandom(pick(streamTypes), 1, true);
    }

    if (hasPortal) {
      const before = tiles.length;
      placeRandom('portal', 2, true);
      if (tiles.length - before < 2) continue;
    }

    if (hasGate) {
      placeRandom('button', 1);
      placeRandom('gate', multiPath ? 1 : 2);
    }

    const yuzus = [];
    for (let i = 0; i < yuzuCount; i++) {
      for (let t = 0; t < 40; t++) {
        const p = { r: randInt(0, rows - 1), c: randInt(0, cols - 1) };
        if (!occupied.has(posKey(p))) {
          occupied.add(posKey(p));
          yuzus.push(p);
          break;
        }
      }
    }

    const level = {
      id,
      chapter,
      stageNumber,
      title,
      ...(hintText ? { hintText } : {}),
      gridSize: { rows, cols },
      parMoves: 1,
      start,
      goal,
      yuzus,
      tiles,
    };

    const res = analyzeLevelPaths(level, 6000);
    if (!res.solvable) continue;
    if (res.minMoves < minMovesReq || res.minMoves > maxMovesReq) continue;
    if (yuzuCount > 0 && res.allYuzusMoves === null) continue;

    if (multiPath) {
      // Must have MANY distinct paths to solve (>= 4 distinct routes & >= 2 initial directions or entry directions)
      if (
        res.distinctWinPaths >= 4 &&
        (res.entryDirsCount >= 2 || res.winningFirstDirsCount >= 2)
      ) {
        level.parMoves = res.allYuzusMoves ?? res.minMoves;
        return level;
      }
    } else {
      // Hard / last N stages: tight puzzle (only 1 optimal path)
      if (res.optimalWinPaths === 1 && res.distinctWinPaths <= 3) {
        level.parMoves = res.allYuzusMoves ?? res.minMoves;
        return level;
      }
    }
  }
  throw new Error(`Failed to generate level ${id} (multiPath=${multiPath})`);
}

// ============================================================================
// CHAPTER 1: Kolam Onsen Hangat (Stages 1-10 Multi-Path, Stages 11-15 Hard)
// ============================================================================
const chapter1 = [
  {
    id: 'ch1_01',
    chapter: 1,
    stageNumber: 1,
    title: 'Langkah Pertama',
    hintText: 'Geser (swipe) ke kanan lalu ke bawah untuk mengambil Yuzu dan menuju Onsen!',
    gridSize: { rows: 5, cols: 5 },
    parMoves: 2,
    start: { r: 0, c: 0 },
    goal: { r: 4, c: 4 },
    yuzus: [{ r: 0, c: 4 }],
    tiles: [],
  },
  {
    id: 'ch1_02',
    chapter: 1,
    stageNumber: 2,
    title: 'Batu Penghalang',
    hintText: 'Batu menghentikan luncuranmu. Manfaatkan batu untuk berbelok ke Onsen!',
    gridSize: { rows: 5, cols: 5 },
    parMoves: 4,
    start: { r: 4, c: 0 },
    goal: { r: 2, c: 4 },
    yuzus: [{ r: 0, c: 2 }],
    tiles: [
      { r: 0, c: 3, type: 'rock' },
      { r: 3, c: 2, type: 'rock' },
      { r: 3, c: 4, type: 'rock' },
    ],
  },
  {
    id: 'ch1_03',
    chapter: 1,
    stageNumber: 3,
    title: 'Lumpur Hangat',
    hintText: 'Petak lumpur membuat Capybara berhenti tepat di atasnya.',
    gridSize: { rows: 5, cols: 5 },
    parMoves: 3,
    start: { r: 0, c: 0 },
    goal: { r: 4, c: 2 },
    yuzus: [{ r: 2, c: 2 }],
    tiles: [
      { r: 0, c: 2, type: 'mud' },
      { r: 2, c: 0, type: 'mud' },
      { r: 2, c: 2, type: 'mud' },
      { r: 3, c: 4, type: 'rock' },
    ],
  },
];

const ch1Titles = [
  'Kabut Pagi', 'Air Hangat', 'Batu Sungai', 'Jeruk Pertama',
  'Sudut Tenang', 'Tepian Kolam', 'Sore Santai', 'Jejak Lumpur',
  'Mata Air', 'Uap Hangat', 'Istirahat Siang', 'Senja di Onsen',
];
for (let i = 4; i <= 15; i++) {
  const isHardLast5 = i >= 11; // Stages 11-15 are the last 5
  chapter1.push(
    generateLevel({
      id: `ch1_${String(i).padStart(2, '0')}`,
      chapter: 1,
      stageNumber: i,
      title: ch1Titles[i - 4],
      rows: isHardLast5 ? 6 : 5,
      cols: isHardLast5 ? 6 : 5,
      minMovesReq: isHardLast5 ? 4 : 2,
      maxMovesReq: isHardLast5 ? 7 : 5,
      rockCount: isHardLast5 ? 6 : 3,
      mudCount: isHardLast5 ? 1 : 3,
      logCount: 0,
      streamCount: 0,
      hasGate: false,
      yuzuCount: isHardLast5 ? 2 : 1,
      multiPath: !isHardLast5,
    })
  );
}

// ============================================================================
// CHAPTER 2: Kebun Jeruk Yuzu (Stages 1-10 Multi-Path, Stages 11-15 Hard)
// ============================================================================
const chapter2 = [
  {
    id: 'ch2_01',
    chapter: 2,
    stageNumber: 16,
    title: 'Dorong Kayu',
    hintText: 'Capybara bisa mendorong batang kayu 1 petak ke depan!',
    gridSize: { rows: 5, cols: 5 },
    parMoves: 2,
    start: { r: 2, c: 0 },
    goal: { r: 0, c: 2 },
    yuzus: [{ r: 2, c: 2 }],
    tiles: [
      { r: 2, c: 2, type: 'log' },
      { r: 4, c: 2, type: 'mud' },
      { r: 0, c: 0, type: 'mud' },
    ],
  },
];

const ch2Titles = [
  'Kebun Citrus', 'Kayu Apung', 'Panen Yuzu', 'Pohon Rindang',
  'Aroma Segar', 'Jembatan Kayu', 'Rumput Hijau', 'Taman Rahasia',
  'Jeruk Kembar', 'Dorongan Halus', 'Teduh Siang', 'Batas Kebun',
  'Pesta Yuzu', 'Jalan Berliku',
];
for (let i = 2; i <= 15; i++) {
  const isHardLast5 = i >= 11; // Stages 11-15 of Ch.2 are the last 5
  chapter2.push(
    generateLevel({
      id: `ch2_${String(i).padStart(2, '0')}`,
      chapter: 2,
      stageNumber: 15 + i,
      title: ch2Titles[i - 2],
      rows: isHardLast5 ? 6 : 5,
      cols: isHardLast5 ? 6 : 5,
      minMovesReq: isHardLast5 ? 5 : 3,
      maxMovesReq: isHardLast5 ? 8 : 5,
      rockCount: isHardLast5 ? 6 : 3,
      mudCount: isHardLast5 ? 1 : 3,
      logCount: 2,
      streamCount: 0,
      hasGate: false,
      yuzuCount: isHardLast5 ? 2 : 1,
      multiPath: !isHardLast5,
    })
  );
}

// ============================================================================
// CHAPTER 3: Sungai Bambu Tenang (Stages 1-5 Multi-Path, Stages 6-15 Hard)
// ============================================================================
const chapter3 = [
  {
    id: 'ch3_01',
    chapter: 3,
    stageNumber: 31,
    title: 'Ikuti Arus',
    hintText: 'Petak arus air akan membelokkan luncuran Capybara secara otomatis!',
    gridSize: { rows: 5, cols: 5 },
    parMoves: 2,
    start: { r: 0, c: 0 },
    goal: { r: 4, c: 4 },
    yuzus: [{ r: 4, c: 2 }],
    tiles: [
      { r: 0, c: 2, type: 'stream_down' },
      { r: 2, c: 2, type: 'mud' },
      { r: 2, c: 0, type: 'mud' },
      { r: 2, c: 4, type: 'mud' },
      { r: 4, c: 2, type: 'stream_right' },
    ],
  },
  {
    id: 'ch3_02',
    chapter: 3,
    stageNumber: 32,
    title: 'Gerbang Bambu',
    hintText: 'Injak tombol batu untuk membuka semua gerbang bambu!',
    gridSize: { rows: 5, cols: 5 },
    parMoves: 3,
    start: { r: 4, c: 0 },
    goal: { r: 0, c: 4 },
    yuzus: [{ r: 0, c: 0 }],
    tiles: [
      { r: 0, c: 0, type: 'button' },
      { r: 4, c: 2, type: 'mud' },
      { r: 2, c: 2, type: 'mud' },
      { r: 0, c: 2, type: 'mud' },
      { r: 0, c: 3, type: 'gate' },
    ],
  },
];

const ch3Titles = [
  'Aliran Tenang', 'Bambu Hijau', 'Belokan Sungai', 'Kunci Batu',
  'Rakit Santai', 'Desir Air', 'Gerbang Utara', 'Pusaran Kecil',
  'Hutan Bambu', 'Muara Hangat', 'Jalur Rahasia', 'Harmoni Alam',
  'Puncak Kedamaian',
];
for (let i = 3; i <= 15; i++) {
  const isHardLast10 = i >= 6; // Stages 6-15 of Ch.3 are the last 10
  chapter3.push(
    generateLevel({
      id: `ch3_${String(i).padStart(2, '0')}`,
      chapter: 3,
      stageNumber: 30 + i,
      title: ch3Titles[i - 3],
      rows: isHardLast10 ? 6 : 5,
      cols: isHardLast10 ? 6 : 5,
      minMovesReq: isHardLast10 ? 5 : 3,
      maxMovesReq: isHardLast10 ? 8 : 5,
      rockCount: isHardLast10 ? 6 : 3,
      mudCount: isHardLast10 ? 1 : 3,
      logCount: isHardLast10 && i >= 10 ? 1 : 0,
      streamCount: 2,
      hasGate: i % 2 === 0 || i >= 11,
      yuzuCount: isHardLast10 ? 2 : 1,
      multiPath: !isHardLast10,
    })
  );
}

// ============================================================================
// CHAPTER 4: Puncak Salju Onsen (Stages 1-5 Multi-Path, Stages 6-15 Hard)
// ============================================================================
const chapter4 = [
  {
    id: 'ch4_01',
    chapter: 4,
    stageNumber: 46,
    title: 'Es Tipis',
    hintText: 'Petak es tipis akan retak dan mencair setelah dilewati sekali!',
    gridSize: { rows: 5, cols: 5 },
    parMoves: 2,
    start: { r: 0, c: 0 },
    goal: { r: 0, c: 2 },
    yuzus: [{ r: 4, c: 2 }],
    tiles: [
      { r: 2, c: 0, type: 'ice' },
      { r: 2, c: 2, type: 'mud' },
      { r: 0, c: 4, type: 'mud' },
      { r: 4, c: 3, type: 'rock' },
    ],
  },
];

const ch4Titles = [
  'Salju Pertama', 'Danau Beku', 'Jejak Dingin', 'Kristal Es',
  'Angin Utara', 'Kolam Beruap', 'Lembah Putih', 'Batu Bersalju',
  'Cermin Beku', 'Retakan Halus', 'Embun Beku', 'Cahaya Puncak',
  'Sumber Hangat', 'Puncak Abadi',
];
for (let i = 2; i <= 15; i++) {
  const isHardLast10 = i >= 6; // Stages 6-15 of Ch.4 are the last 10
  chapter4.push(
    generateLevel({
      id: `ch4_${String(i).padStart(2, '0')}`,
      chapter: 4,
      stageNumber: 45 + i,
      title: ch4Titles[i - 2],
      rows: isHardLast10 ? 6 : 5,
      cols: isHardLast10 ? 6 : 5,
      minMovesReq: isHardLast10 ? 5 : 3,
      maxMovesReq: isHardLast10 ? 8 : 5,
      rockCount: isHardLast10 ? 6 : 3,
      mudCount: isHardLast10 ? 1 : 3,
      logCount: isHardLast10 && i >= 9 ? 1 : 0,
      streamCount: isHardLast10 && i >= 11 ? 1 : 0,
      iceCount: isHardLast10 ? 3 : 2,
      hasPortal: false,
      hasGate: i >= 12,
      yuzuCount: isHardLast10 ? 2 : 1,
      multiPath: !isHardLast10,
    })
  );
}

// ============================================================================
// CHAPTER 5: Malam Lentera (All 15 Stages = 15 Terakhir Hard!)
// ============================================================================
const chapter5 = [
  {
    id: 'ch5_01',
    chapter: 5,
    stageNumber: 61,
    title: 'Pusaran Air Panas',
    hintText: 'Masuk ke pusaran air untuk berpindah ke pusaran pasangannya!',
    gridSize: { rows: 6, cols: 6 },
    parMoves: 4,
    start: { r: 0, c: 0 },
    goal: { r: 5, c: 5 },
    yuzus: [{ r: 2, c: 5 }],
    tiles: [
      { r: 0, c: 3, type: 'portal' },
      { r: 2, c: 2, type: 'portal' },
      { r: 0, c: 4, type: 'rock' },
      { r: 4, c: 5, type: 'mud' },
      { r: 5, c: 2, type: 'rock' },
    ],
  },
];

const ch5Titles = [
  'Lentera Senja', 'Cahaya Air', 'Portal Kembar', 'Festival Malam',
  'Kunang-Kunang', 'Bayangan Bulan', 'Jembatan Lentera', 'Pusaran Bintang',
  'Taman Malam', 'Aliran Cahaya', 'Gerbang Festival', 'Melodi Malam',
  'Harmoni Onsen', 'Raja Capybara',
];
for (let i = 2; i <= 15; i++) {
  chapter5.push(
    generateLevel({
      id: `ch5_${String(i).padStart(2, '0')}`,
      chapter: 5,
      stageNumber: 60 + i,
      title: ch5Titles[i - 2],
      rows: i <= 6 ? 6 : 7,
      cols: i <= 6 ? 6 : 7,
      minMovesReq: 5,
      maxMovesReq: 9,
      rockCount: 6,
      mudCount: 1,
      logCount: i % 2 === 0 ? 1 : 0,
      streamCount: 1,
      iceCount: i >= 5 ? 2 : 1,
      hasPortal: true,
      hasGate: i >= 8 && i % 2 === 1,
      yuzuCount: i >= 10 ? 3 : 2,
      multiPath: false, // All 15 stages in Ch.5 are tight/challenging!
    })
  );
}

for (const lv of [...chapter1, ...chapter2, ...chapter3, ...chapter4, ...chapter5]) {
  const res = analyzeLevelPaths(lv, 10000);
  if (!res.solvable) {
    throw new Error(`Level ${lv.id} is NOT solvable!`);
  }
  lv.parMoves = res.allYuzusMoves ?? res.minMoves;
}

fs.writeFileSync(path.join(LEVELS_DIR, 'chapter1_onsen.json'), JSON.stringify(chapter1, null, 2));
fs.writeFileSync(path.join(LEVELS_DIR, 'chapter2_yuzu.json'), JSON.stringify(chapter2, null, 2));
fs.writeFileSync(path.join(LEVELS_DIR, 'chapter3_river.json'), JSON.stringify(chapter3, null, 2));
fs.writeFileSync(path.join(LEVELS_DIR, 'chapter4_snow.json'), JSON.stringify(chapter4, null, 2));
fs.writeFileSync(path.join(LEVELS_DIR, 'chapter5_festival.json'), JSON.stringify(chapter5, null, 2));

console.log('Successfully generated & verified all 75 stages with progressive multi-path -> hard difficulty curve!');
