import { ChapterMeta, LevelConfig } from '../engine/types';
import chapter1Levels from './levels/chapter1_onsen.json';
import chapter2Levels from './levels/chapter2_yuzu.json';
import chapter3Levels from './levels/chapter3_river.json';

export const CHAPTERS: ChapterMeta[] = [
  {
    id: 1,
    title: 'Kolam Onsen Hangat',
    subtitle: 'Batu, Lumpur & Jeruk Yuzu',
    themeColor: '#D97757',
    accentColor: '#F3B664',
    boardBg: '#EEDCC5',
    cellBg: '#F9F0E3',
    unlockStarsRequired: 0,
  },
  {
    id: 2,
    title: 'Kebun Jeruk Yuzu',
    subtitle: 'Dorong Kayu & Taman Teduh',
    themeColor: '#6B9080',
    accentColor: '#F4A261',
    boardBg: '#D8E2DC',
    cellBg: '#F2F6F3',
    unlockStarsRequired: 12,
  },
  {
    id: 3,
    title: 'Sungai Bambu Tenang',
    subtitle: 'Arus Air & Gerbang Bambu',
    themeColor: '#4A7C9B',
    accentColor: '#76B5C5',
    boardBg: '#D3E3EC',
    cellBg: '#EFF6FA',
    unlockStarsRequired: 28,
  },
];

export const ALL_LEVELS: LevelConfig[] = [
  ...(chapter1Levels as LevelConfig[]),
  ...(chapter2Levels as LevelConfig[]),
  ...(chapter3Levels as LevelConfig[]),
];

export function getLevelsForChapter(chapterId: number): LevelConfig[] {
  return ALL_LEVELS.filter((l) => l.chapter === chapterId);
}

export function getLevelById(id: string): LevelConfig | undefined {
  return ALL_LEVELS.find((l) => l.id === id);
}

export function getNextLevel(currentId: string): LevelConfig | undefined {
  const idx = ALL_LEVELS.findIndex((l) => l.id === currentId);
  if (idx === -1 || idx + 1 >= ALL_LEVELS.length) return undefined;
  return ALL_LEVELS[idx + 1];
}
