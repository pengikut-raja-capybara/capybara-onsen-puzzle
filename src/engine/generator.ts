import { posKey, solveLevelBFS } from './solver';
import { LevelConfig, Position, TilePlacement, TileType } from './types';

function createPrng(seedInput: number) {
  let seed = (seedInput >>> 0) || 123456789;
  const rand = () => {
    seed = (seed * 1664525 + 1013904223) % 4294967296;
    return seed / 4294967296;
  };
  const randInt = (min: number, max: number) =>
    Math.floor(rand() * (max - min + 1)) + min;
  const pick = <T,>(arr: T[]): T => arr[Math.floor(rand() * arr.length)];
  return { rand, randInt, pick };
}

export function getTodayDateKey(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function hashStringToSeed(str: string): number {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619) >>> 0;
  }
  return h || 421337;
}

export interface ProceduralLevelOptions {
  id?: string;
  title?: string;
  chapterTheme?: number;
  stageNumber?: number;
}

function createTilePlacer(
  rows: number,
  cols: number,
  occupied: Set<string>,
  tiles: TilePlacement[],
  randInt: (min: number, max: number) => number
) {
  return (type: TileType, count: number, innerOnly = false) => {
    const minR = innerOnly ? 1 : 0;
    const maxR = innerOnly ? rows - 2 : rows - 1;
    const minC = innerOnly ? 1 : 0;
    const maxC = innerOnly ? cols - 2 : cols - 1;
    for (let i = 0; i < count; i++) {
      for (let t = 0; t < 35; t++) {
        const p = { r: randInt(minR, maxR), c: randInt(minC, maxC) };
        if (!occupied.has(posKey(p))) {
          occupied.add(posKey(p));
          tiles.push({ r: p.r, c: p.c, type });
          break;
        }
      }
    }
  };
}

function tryGenerateProceduralAttempt(
  attempt: number,
  numericSeed: number,
  chapter: number,
  randInt: (min: number, max: number) => number,
  pick: <T>(arr: T[]) => T,
  options?: ProceduralLevelOptions
): LevelConfig | null {
  const rows = 6;
  const cols = 6;
  const occupied = new Set<string>();
  const start: Position = {
    r: randInt(0, rows - 1),
    c: randInt(0, cols - 1),
  };
  occupied.add(posKey(start));

  let goal: Position;
  do {
    goal = { r: randInt(0, rows - 1), c: randInt(0, cols - 1) };
  } while (
    occupied.has(posKey(goal)) ||
    Math.abs(goal.r - start.r) + Math.abs(goal.c - start.c) < 3
  );
  occupied.add(posKey(goal));

  const tiles: TilePlacement[] = [];
  const placeRandom = createTilePlacer(rows, cols, occupied, tiles, randInt);

  placeRandom('rock', randInt(4, 6));
  placeRandom('mud', randInt(1, 2));
  placeRandom('log', randInt(1, 2));
  placeRandom('ice', randInt(1, 2));

  const streamTypes: TileType[] = [
    'stream_up',
    'stream_down',
    'stream_left',
    'stream_right',
  ];
  placeRandom(pick(streamTypes), 1, true);

  if (attempt % 2 === 0) {
    const beforeCount = tiles.length;
    placeRandom('portal', 2, true);
    if (tiles.length - beforeCount === 1) {
      tiles.pop();
    }
  }

  const yuzus: Position[] = [];
  for (let i = 0; i < 2; i++) {
    for (let t = 0; t < 35; t++) {
      const p = { r: randInt(0, rows - 1), c: randInt(0, cols - 1) };
      if (!occupied.has(posKey(p))) {
        occupied.add(posKey(p));
        yuzus.push(p);
        break;
      }
    }
  }

  const level: LevelConfig = {
    id: options?.id ?? `daily_${numericSeed}`,
    chapter,
    stageNumber: options?.stageNumber ?? 1,
    title: options?.title ?? 'Tantangan Harian',
    gridSize: { rows, cols },
    parMoves: 4,
    start,
    goal,
    yuzus,
    tiles,
  };

  const res = solveLevelBFS(level, undefined, 2500);
  if (
    res.solvable &&
    res.minMoves >= 4 &&
    res.minMoves <= 8 &&
    res.allYuzusMoves !== null
  ) {
    level.parMoves = res.allYuzusMoves;
    return level;
  }

  return null;
}

function getFallbackProceduralLevel(
  numericSeed: number,
  chapter: number,
  options?: ProceduralLevelOptions
): LevelConfig {
  return {
    id: options?.id ?? `daily_${numericSeed}`,
    chapter,
    stageNumber: options?.stageNumber ?? 1,
    title: options?.title ?? 'Tantangan Harian',
    gridSize: { rows: 5, cols: 5 },
    parMoves: 3,
    start: { r: 0, c: 0 },
    goal: { r: 4, c: 4 },
    yuzus: [{ r: 0, c: 4 }, { r: 4, c: 0 }],
    tiles: [
      { r: 2, c: 2, type: 'ice' },
      { r: 1, c: 3, type: 'rock' },
    ],
  };
}

export function generateProceduralLevel(
  seedInput: number | string,
  options?: ProceduralLevelOptions
): LevelConfig {
  const numericSeed =
    typeof seedInput === 'string' ? hashStringToSeed(seedInput) : seedInput;
  const { randInt, pick } = createPrng(numericSeed);
  const chapter = options?.chapterTheme ?? ((numericSeed % 5) + 1);

  for (let attempt = 0; attempt < 250; attempt++) {
    const lv = tryGenerateProceduralAttempt(
      attempt,
      numericSeed,
      chapter,
      randInt,
      pick,
      options
    );
    if (lv) return lv;
  }

  return getFallbackProceduralLevel(numericSeed, chapter, options);
}

export async function generateProceduralLevelAsync(
  seedInput: number | string,
  options?: ProceduralLevelOptions
): Promise<LevelConfig> {
  const numericSeed =
    typeof seedInput === 'string' ? hashStringToSeed(seedInput) : seedInput;
  const { randInt, pick } = createPrng(numericSeed);
  const chapter = options?.chapterTheme ?? ((numericSeed % 5) + 1);

  for (let attempt = 0; attempt < 250; attempt++) {
    const lv = tryGenerateProceduralAttempt(
      attempt,
      numericSeed,
      chapter,
      randInt,
      pick,
      options
    );
    if (lv) return lv;

    if ((attempt + 1) % 12 === 0) {
      await new Promise<void>((resolve) => setTimeout(resolve, 0));
    }
  }

  return getFallbackProceduralLevel(numericSeed, chapter, options);
}

function tryGenerateZenAttempt(
  numericSeed: number,
  chapter: number,
  randInt: (min: number, max: number) => number,
  pick: <T>(arr: T[]) => T,
  options?: ProceduralLevelOptions
): LevelConfig | null {
  const rows = 5;
  const cols = 5;
  const occupied = new Set<string>();
  const start: Position = {
    r: randInt(0, rows - 1),
    c: randInt(0, cols - 1),
  };
  occupied.add(posKey(start));

  let goal: Position;
  do {
    goal = { r: randInt(0, rows - 1), c: randInt(0, cols - 1) };
  } while (
    occupied.has(posKey(goal)) ||
    Math.abs(goal.r - start.r) + Math.abs(goal.c - start.c) < 2
  );
  occupied.add(posKey(goal));

  const tiles: TilePlacement[] = [];
  const placeRandom = createTilePlacer(rows, cols, occupied, tiles, randInt);

  placeRandom('rock', randInt(3, 4));
  placeRandom('mud', randInt(2, 3));
  if (randInt(0, 1) === 1) {
    placeRandom('log', 1, true);
  }
  if (randInt(0, 1) === 1) {
    const streamTypes: TileType[] = [
      'stream_up',
      'stream_down',
      'stream_left',
      'stream_right',
    ];
    placeRandom(pick(streamTypes), 1, true);
  }

  const yuzus: Position[] = [];
  const yuzuTarget = randInt(1, 2);
  for (let i = 0; i < yuzuTarget; i++) {
    for (let t = 0; t < 35; t++) {
      const p = { r: randInt(0, rows - 1), c: randInt(0, cols - 1) };
      if (!occupied.has(posKey(p))) {
        occupied.add(posKey(p));
        yuzus.push(p);
        break;
      }
    }
  }

  const level: LevelConfig = {
    id: options?.id ?? `zen_${numericSeed}`,
    chapter,
    stageNumber: options?.stageNumber ?? 1,
    title: options?.title ?? 'Kolam Zen',
    gridSize: { rows, cols },
    parMoves: 4,
    start,
    goal,
    yuzus,
    tiles,
  };

  const res = solveLevelBFS(level, undefined, 1800);
  if (
    res.solvable &&
    res.minMoves >= 3 &&
    res.minMoves <= 5 &&
    res.allYuzusMoves !== null
  ) {
    level.parMoves = res.allYuzusMoves;
    return level;
  }
  return null;
}

export async function generateZenLevelAsync(
  seedInput: number | string,
  options?: ProceduralLevelOptions
): Promise<LevelConfig> {
  const numericSeed =
    typeof seedInput === 'string' ? hashStringToSeed(seedInput) : seedInput;
  const { randInt, pick } = createPrng(numericSeed);
  const chapter = options?.chapterTheme ?? ((numericSeed % 5) + 1);

  for (let attempt = 0; attempt < 220; attempt++) {
    const lv = tryGenerateZenAttempt(
      numericSeed,
      chapter,
      randInt,
      pick,
      options
    );
    if (lv) return lv;

    if ((attempt + 1) % 10 === 0) {
      await new Promise<void>((resolve) => setTimeout(resolve, 0));
    }
  }

  return {
    id: options?.id ?? `zen_${numericSeed}`,
    chapter,
    stageNumber: options?.stageNumber ?? 1,
    title: options?.title ?? 'Kolam Zen',
    gridSize: { rows: 5, cols: 5 },
    parMoves: 3,
    start: { r: 4, c: 0 },
    goal: { r: 0, c: 4 },
    yuzus: [{ r: 2, c: 2 }],
    tiles: [
      { r: 2, c: 0, type: 'mud' },
      { r: 2, c: 2, type: 'mud' },
      { r: 0, c: 2, type: 'rock' },
    ],
  };
}
