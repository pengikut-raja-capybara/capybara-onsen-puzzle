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

function isInBounds(level, r, c) {
  return r >= 0 && r < level.gridSize.rows && c >= 0 && c < level.gridSize.cols;
}

function isBlockingTile(tile, gateOpen) {
  if (tile === 'rock') return true;
  if (tile === 'gate' && !gateOpen) return true;
  return false;
}

function stepMove(level, state, initialDir) {
  if (state.won) return { nextState: state, moved: false };
  let curR = state.capybara.r;
  let curC = state.capybara.c;
  let dir = initialDir;
  const logs = state.logs.map((l) => ({ ...l }));
  const collectedSet = new Set(state.collectedYuzus);
  let gateOpen = state.gateOpen;
  let moved = false;

  const visited = new Set([`${curR},${curC},${dir}`]);

  for (let steps = 0; steps < 100; steps++) {
    const delta = DIR_DELTA[dir];
    const nr = curR + delta.r;
    const nc = curC + delta.c;

    if (!isInBounds(level, nr, nc)) break;

    const staticTile = getStaticTileAt(level, nr, nc);
    if (isBlockingTile(staticTile, gateOpen)) break;

    const logIdx = logs.findIndex((l) => l.r === nr && l.c === nc);
    if (logIdx !== -1) {
      const pushR = nr + delta.r;
      const pushC = nc + delta.c;
      const pushTile = isInBounds(level, pushR, pushC) ? getStaticTileAt(level, pushR, pushC) : null;
      const canPush =
        isInBounds(level, pushR, pushC) &&
        !isBlockingTile(pushTile, gateOpen) &&
        logs.findIndex((l) => l.r === pushR && l.c === pushC) === -1 &&
        !samePos({ r: pushR, c: pushC }, level.goal) &&
        pushTile !== 'button';

      if (canPush) {
        logs[logIdx] = { r: pushR, c: pushC };
        curR = nr;
        curC = nc;
        moved = true;
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

    const yKey = posKey({ r: curR, c: curC });
    if (level.yuzus.some((y) => y.r === curR && y.c === curC)) collectedSet.add(yKey);

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
      };
    }

    if (staticTile === 'button') gateOpen = true;
    if (staticTile === 'mud') break;
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
      gateOpen,
      moves: state.moves + 1,
      won: false,
    },
    moved: true,
  };
}

function serialize(s) {
  return `${s.capybara.r},${s.capybara.c}|${s.gateOpen ? 1 : 0}|${s.logs.map((l) => `${l.r},${l.c}`).join(';')}|${[...s.collectedYuzus].sort().join(';')}`;
}

function solveBFS(level, maxStates = 12000) {
  const start = createInitialState(level);
  const dirs = ['up', 'down', 'left', 'right'];
  const visited = new Set([serialize(start)]);
  const queue = [{ state: start, path: [], visitedCells: [] }];
  let head = 0;
  let firstWin = null;
  let allYuzusWin = null;

  while (head < queue.length && visited.size < maxStates) {
    const cur = queue[head++];
    for (const d of dirs) {
      const res = stepMove(level, cur.state, d);
      if (!res.moved) continue;
      const nextPath = [...cur.path, d];
      if (res.nextState.won) {
        if (!firstWin) firstWin = nextPath.length;
        if (allYuzusWin === null && res.nextState.collectedYuzus.length >= level.yuzus.length) {
          allYuzusWin = nextPath.length;
          return { solvable: true, minMoves: firstWin, allYuzusMoves: allYuzusWin };
        }
        continue;
      }
      const key = serialize(res.nextState);
      if (!visited.has(key)) {
        visited.add(key);
        queue.push({ state: res.nextState, path: nextPath });
      }
    }
  }
  if (firstWin !== null) return { solvable: true, minMoves: firstWin, allYuzusMoves: allYuzusWin };
  return { solvable: false, minMoves: -1, allYuzusMoves: null };
}

// Seeded PRNG so level generation is 100% deterministic
let seed = 421337;
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
  hasGate,
  yuzuCount,
}) {
  for (let attempt = 0; attempt < 1500; attempt++) {
    const occupied = new Set();
    const start = { r: randInt(0, rows - 1), c: randInt(0, cols - 1) };
    occupied.add(posKey(start));

    let goal;
    do {
      goal = { r: randInt(0, rows - 1), c: randInt(0, cols - 1) };
    } while (occupied.has(posKey(goal)) || Math.abs(goal.r - start.r) + Math.abs(goal.c - start.c) < 3);
    occupied.add(posKey(goal));

    const tiles = [];
    const placeRandom = (type, count) => {
      for (let i = 0; i < count; i++) {
        for (let t = 0; t < 40; t++) {
          const p = { r: randInt(0, rows - 1), c: randInt(0, cols - 1) };
          if (!occupied.has(posKey(p))) {
            occupied.add(posKey(p));
            tiles.push({ r: p.r, c: p.c, type });
            break;
          }
        }
      }
    };

    placeRandom('rock', rockCount);
    placeRandom('mud', mudCount);
    placeRandom('log', logCount);

    const streamTypes = ['stream_up', 'stream_down', 'stream_left', 'stream_right'];
    for (let i = 0; i < streamCount; i++) {
      // Avoid placing streams pointing directly out of bounds on edge
      for (let t = 0; t < 40; t++) {
        const p = { r: randInt(1, rows - 2), c: randInt(1, cols - 2) };
        if (!occupied.has(posKey(p))) {
          occupied.add(posKey(p));
          tiles.push({ r: p.r, c: p.c, type: pick(streamTypes) });
          break;
        }
      }
    }

    if (hasGate) {
      placeRandom('button', 1);
      // Place 1-2 gates near goal or mid-board
      placeRandom('gate', 2);
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

    const res = solveBFS(level, 6000);
    if (
      res.solvable &&
      res.minMoves >= minMovesReq &&
      res.minMoves <= maxMovesReq &&
      (yuzuCount === 0 || res.allYuzusMoves !== null)
    ) {
      level.parMoves = res.allYuzusMoves ?? res.minMoves;
      return level;
    }
  }
  throw new Error(`Failed to generate level ${id}`);
}

// Handcrafted Tutorial Stages + Generated Stages
const chapter1 = [
  {
    id: 'ch1_01',
    chapter: 1,
    stageNumber: 1,
    title: 'Langkah Pertama',
    hintText: 'Geser (swipe) ke kanan, lalu ke bawah menuju kolam Onsen!',
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
    hintText: 'Batu menghentikan luncuranmu. Manfaatkan batu untuk berbelok!',
    gridSize: { rows: 5, cols: 5 },
    parMoves: 3,
    start: { r: 4, c: 0 },
    goal: { r: 2, c: 4 },
    yuzus: [{ r: 0, c: 2 }],
    tiles: [
      { r: 0, c: 3, type: 'rock' },
      { r: 2, c: 1, type: 'rock' },
      { r: 3, c: 2, type: 'rock' },
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
  chapter1.push(
    generateLevel({
      id: `ch1_${String(i).padStart(2, '0')}`,
      chapter: 1,
      stageNumber: i,
      title: ch1Titles[i - 4],
      rows: i <= 8 ? 5 : 6,
      cols: i <= 8 ? 5 : 6,
      minMovesReq: i <= 7 ? 3 : 4,
      maxMovesReq: i <= 7 ? 5 : 7,
      rockCount: i <= 8 ? 4 : 6,
      mudCount: i <= 6 ? 1 : 2,
      logCount: 0,
      streamCount: 0,
      hasGate: false,
      yuzuCount: i <= 9 ? 1 : 2,
    })
  );
}

// Chapter 2: Kebun Jeruk Yuzu (Introduces Movable Logs!)
const chapter2 = [
  {
    id: 'ch2_01',
    chapter: 2,
    stageNumber: 16,
    title: 'Dorong Kayu',
    hintText: 'Capybara bisa mendorong batang kayu 1 petak ke depan!',
    gridSize: { rows: 5, cols: 5 },
    parMoves: 3,
    start: { r: 2, c: 0 },
    goal: { r: 0, c: 2 },
    yuzus: [{ r: 2, c: 2 }],
    tiles: [
      { r: 2, c: 2, type: 'log' },
      { r: 1, c: 4, type: 'rock' },
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
  chapter2.push(
    generateLevel({
      id: `ch2_${String(i).padStart(2, '0')}`,
      chapter: 2,
      stageNumber: 15 + i,
      title: ch2Titles[i - 2],
      rows: i <= 6 ? 5 : 6,
      cols: i <= 6 ? 5 : 6,
      minMovesReq: i <= 6 ? 4 : 5,
      maxMovesReq: i <= 6 ? 6 : 8,
      rockCount: i <= 6 ? 4 : 6,
      mudCount: 2,
      logCount: i <= 8 ? 2 : 3,
      streamCount: 0,
      hasGate: false,
      yuzuCount: 2,
    })
  );
}

// Chapter 3: Sungai Bambu Tenang (Introduces Streams & Bamboo Gates!)
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
    parMoves: 4,
    start: { r: 4, c: 0 },
    goal: { r: 0, c: 4 },
    yuzus: [{ r: 0, c: 0 }],
    tiles: [
      { r: 0, c: 0, type: 'button' },
      { r: 0, c: 3, type: 'gate' },
      { r: 1, c: 4, type: 'rock' },
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
  chapter3.push(
    generateLevel({
      id: `ch3_${String(i).padStart(2, '0')}`,
      chapter: 3,
      stageNumber: 30 + i,
      title: ch3Titles[i - 3],
      rows: i <= 7 ? 6 : 7,
      cols: i <= 7 ? 6 : 7,
      minMovesReq: i <= 7 ? 4 : 5,
      maxMovesReq: i <= 7 ? 7 : 9,
      rockCount: i <= 7 ? 5 : 7,
      mudCount: 2,
      logCount: i >= 8 ? 1 : 0,
      streamCount: 2,
      hasGate: i % 2 === 0 || i >= 10,
      yuzuCount: i >= 10 ? 3 : 2,
    })
  );
}

// Verify all tutorials too
for (const lv of [...chapter1, ...chapter2, ...chapter3]) {
  const res = solveBFS(lv, 12000);
  if (!res.solvable) {
    throw new Error(`Level ${lv.id} is NOT solvable!`);
  }
  lv.parMoves = res.allYuzusMoves ?? res.minMoves;
}

fs.writeFileSync(path.join(LEVELS_DIR, 'chapter1_onsen.json'), JSON.stringify(chapter1, null, 2));
fs.writeFileSync(path.join(LEVELS_DIR, 'chapter2_yuzu.json'), JSON.stringify(chapter2, null, 2));
fs.writeFileSync(path.join(LEVELS_DIR, 'chapter3_river.json'), JSON.stringify(chapter3, null, 2));

console.log(`Generated & verified ${chapter1.length + chapter2.length + chapter3.length} stages across 3 chapters!`);
