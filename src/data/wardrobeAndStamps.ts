import { DecorationId, HatId } from '../engine/types';
import { Language } from '../i18n/translations';
import { PlayerProgress, getTotalStars } from '../storage/progress';
import { ALL_LEVELS } from './chapters';

export interface HatItem {
  id: HatId;
  starsRequired: number;
  name: Record<Language, string>;
  desc: Record<Language, string>;
}

export const HATS: HatItem[] = [
  {
    id: 'yuzu',
    starsRequired: 0,
    name: { id: 'Jeruk Yuzu', en: 'Yuzu Orange' },
    desc: { id: 'Aksesori klasik favorit Capybara', en: 'Classic favorite Onsen citrus' },
  },
  {
    id: 'towel',
    starsRequired: 15,
    name: { id: 'Handuk Onsen', en: 'Onsen Towel' },
    desc: { id: 'Handuk hangat lipat khas pemandian', en: 'Cozy folded bathhouse towel' },
  },
  {
    id: 'sakura',
    starsRequired: 35,
    name: { id: 'Bunga Sakura', en: 'Sakura Blossom' },
    desc: { id: 'Mahkota kelopak bunga musim semi', en: 'Pink spring cherry blossom crown' },
  },
  {
    id: 'bamboo_hat',
    starsRequired: 60,
    name: { id: 'Caping Bambu', en: 'Bamboo Hat' },
    desc: { id: 'Topi anyaman peneduh perjalanan', en: 'Woven bamboo traveler hat' },
  },
  {
    id: 'crown',
    starsRequired: 100,
    name: { id: 'Mahkota Raja', en: 'Royal Crown' },
    desc: { id: 'Mahkota emas Pengikut Raja Capybara', en: 'Golden crown of the Capybara King' },
  },
  {
    id: 'none',
    starsRequired: 0,
    name: { id: 'Tanpa Aksesori', en: 'No Accessory' },
    desc: { id: 'Tampilan alami tanpa aksesori kepala', en: 'Natural look without head accessory' },
  },
];

export function isHatUnlocked(
  hat: HatItem,
  totalStars: number,
  devUnlockAll: boolean
): boolean {
  if (devUnlockAll) return true;
  return totalStars >= hat.starsRequired;
}

export interface DecorationItem {
  id: DecorationId;
  starsRequired: number;
  name: Record<Language, string>;
  desc: Record<Language, string>;
}

export const DECORATIONS: DecorationItem[] = [
  {
    id: 'rubber_duck',
    starsRequired: 3,
    name: { id: 'Bebek Karet', en: 'Rubber Duckling' },
    desc: {
      id: 'Bebek kuning lucu yang mengapung di kolam',
      en: 'Cheerful yellow ducky floating in the pool',
    },
  },
  {
    id: 'bamboo_fountain',
    starsRequired: 10,
    name: { id: 'Pancuran Bambu', en: 'Bamboo Spout' },
    desc: {
      id: 'Shishi-odoshi bambu mengalirkan air hangat',
      en: 'Traditional bamboo spout pouring warm spring water',
    },
  },
  {
    id: 'floating_yuzus',
    starsRequired: 20,
    name: { id: 'Kolam Yuzu', en: 'Floating Yuzus' },
    desc: {
      id: 'Trio jeruk Yuzu harum mengambang di air',
      en: 'Fragrant trio of Yuzu oranges bobbing in water',
    },
  },
  {
    id: 'sakura_branch',
    starsRequired: 35,
    name: { id: 'Ranting Sakura', en: 'Sakura Branch' },
    desc: {
      id: 'Kelopak sakura lembut menaungi kolam',
      en: 'Gentle pink cherry blossom branch overhead',
    },
  },
  {
    id: 'paper_lantern',
    starsRequired: 55,
    name: { id: 'Lentera Hangat', en: 'Warm Lantern' },
    desc: {
      id: 'Lentera kertas menyinari senja di onsen',
      en: 'Cozy paper lantern glowing beside the pool',
    },
  },
  {
    id: 'baby_capy',
    starsRequired: 80,
    name: { id: 'Anak Capybara', en: 'Baby Capybara' },
    desc: {
      id: 'Teman kecil yang ikut berendam dengan tenang',
      en: 'Tiny capybara buddy soaking calmly nearby',
    },
  },
];

export function isDecorationUnlocked(
  item: DecorationItem,
  totalStars: number,
  devUnlockAll: boolean
): boolean {
  if (devUnlockAll) return true;
  return totalStars >= item.starsRequired;
}

export interface StampItem {
  id: string;
  title: Record<Language, string>;
  desc: Record<Language, string>;
  badgeColor: string;
  checkUnlocked: (progress: PlayerProgress) => boolean;
}

export const STAMPS: StampItem[] = [
  {
    id: 'first_bath',
    title: { id: 'Berendam Pertama', en: 'First Soak' },
    desc: { id: 'Selesaikan stage pertamamu', en: 'Clear your very first stage' },
    badgeColor: '#D97757',
    checkUnlocked: (p) => Object.keys(p.starsByLevel).length >= 1,
  },
  {
    id: 'daily_soaker',
    title: { id: 'Tamu Harian', en: 'Daily Guest' },
    desc: { id: 'Selesaikan 1 Puzzle Harian', en: 'Complete 1 Daily Puzzle challenge' },
    badgeColor: '#F59E0B',
    checkUnlocked: (p) => p.dailyCompletedDates.length >= 1,
  },
  {
    id: 'zen_soul',
    title: { id: 'Jiwa Santai', en: 'Zen Soul' },
    desc: {
      id: 'Selesaikan 5 puzzle di Mode Zen',
      en: 'Complete 5 puzzles in Zen Mode',
    },
    badgeColor: '#6B9080',
    checkUnlocked: (p) => p.zenCompletedCount >= 5,
  },
  {
    id: 'sanctuary_decorator',
    title: { id: 'Penghias Onsen', en: 'Onsen Decorator' },
    desc: {
      id: 'Pasang minimal 3 dekorasi kolam sekaligus',
      en: 'Place at least 3 pool decorations at once',
    },
    badgeColor: '#E07A5F',
    checkUnlocked: (p) => p.equippedDecorations.length >= 3,
  },
  {
    id: 'yuzu_collector',
    title: { id: 'Kolektor Yuzu', en: 'Yuzu Collector' },
    desc: { id: 'Kumpulkan minimal 30 Bintang', en: 'Collect at least 30 Stars' },
    badgeColor: '#6B9080',
    checkUnlocked: (p) => getTotalStars(p) >= 30,
  },
  {
    id: 'onsen_traveler',
    title: { id: 'Penjelajah Sungai', en: 'River Explorer' },
    desc: { id: 'Selesaikan 30 Stage berbeda', en: 'Clear 30 different stages' },
    badgeColor: '#4A7C9B',
    checkUnlocked: (p) =>
      ALL_LEVELS.filter((l) => (p.starsByLevel[l.id] ?? 0) > 0).length >= 30,
  },
  {
    id: 'snow_master',
    title: { id: 'Penakluk Salju', en: 'Snow Peak Master' },
    desc: { id: 'Selesaikan semua stage Chapter 4', en: 'Clear all stages in Chapter 4' },
    badgeColor: '#5B82B5',
    checkUnlocked: (p) =>
      ALL_LEVELS.filter((l) => l.chapter === 4).every(
        (l) => (p.starsByLevel[l.id] ?? 0) > 0
      ),
  },
  {
    id: 'capy_royalty',
    title: { id: 'Raja Capybara', en: 'Capybara Royalty' },
    desc: {
      id: 'Selesaikan seluruh 75 Stage atau raih 150 Bintang',
      en: 'Clear all 75 Stages or earn 150 Stars',
    },
    badgeColor: '#8E5B88',
    checkUnlocked: (p) =>
      getTotalStars(p) >= 150 ||
      ALL_LEVELS.every((l) => (p.starsByLevel[l.id] ?? 0) > 0),
  },
];

export interface EndlessTrack {
  id: 'endless_daily' | 'endless_zen' | 'endless_total';
  stampIconId: string;
  badgeColor: string;
  title: Record<Language, string>;
  unit: Record<Language, string>;
  baseTargets: number[];
  stepAfterMax: number;
  getValue: (progress: PlayerProgress) => number;
}

export const ENDLESS_TRACKS: EndlessTrack[] = [
  {
    id: 'endless_daily',
    stampIconId: 'endless_daily',
    badgeColor: '#F59E0B',
    title: { id: 'Tamu Setia Harian', en: 'Devoted Daily Guest' },
    unit: { id: 'hari bermain', en: 'days played' },
    baseTargets: [1, 3, 7, 14, 30, 50, 100, 150, 200, 365, 500, 1000],
    stepAfterMax: 250,
    getValue: (p) => p.dailyCompletedDates.length,
  },
  {
    id: 'endless_zen',
    stampIconId: 'endless_zen',
    badgeColor: '#52796F',
    title: { id: 'Jiwa Zen Abadi', en: 'Infinite Zen Spirit' },
    unit: { id: 'puzzle zen', en: 'zen puzzles' },
    baseTargets: [3, 10, 25, 50, 100, 250, 500, 1000],
    stepAfterMax: 500,
    getValue: (p) => p.zenCompletedCount,
  },
  {
    id: 'endless_total',
    stampIconId: 'endless_total',
    badgeColor: '#D97757',
    title: { id: 'Legenda Onsen', en: 'Onsen Legend' },
    unit: { id: 'kali berendam', en: 'total soaks' },
    baseTargets: [10, 25, 50, 100, 250, 500, 1000, 2500, 5000],
    stepAfterMax: 2500,
    getValue: (p) =>
      Object.keys(p.starsByLevel).length +
      p.dailyCompletedDates.length +
      p.zenCompletedCount,
  },
];

export interface EndlessTrackState {
  current: number;
  tier: number;
  prevTarget: number;
  nextTarget: number;
  ratio: number;
}

export function getEndlessTrackState(
  track: EndlessTrack,
  progress: PlayerProgress
): EndlessTrackState {
  const current = track.getValue(progress);
  const { baseTargets, stepAfterMax } = track;

  let prevTarget = 0;
  let tier = 0;

  for (const target of baseTargets) {
    if (current >= target) {
      tier += 1;
      prevTarget = target;
    } else {
      const span = Math.max(1, target - prevTarget);
      return {
        current,
        tier,
        prevTarget,
        nextTarget: target,
        ratio: Math.min(1, Math.max(0, (current - prevTarget) / span)),
      };
    }
  }

  // Beyond the base list, continue endlessly in fixed increments
  const lastBase = baseTargets[baseTargets.length - 1];
  const extraTiers = Math.floor((current - lastBase) / stepAfterMax);
  tier = baseTargets.length + extraTiers;
  prevTarget = lastBase + extraTiers * stepAfterMax;
  const nextTarget = prevTarget + stepAfterMax;

  return {
    current,
    tier,
    prevTarget,
    nextTarget,
    ratio: Math.min(1, Math.max(0, (current - prevTarget) / stepAfterMax)),
  };
}
