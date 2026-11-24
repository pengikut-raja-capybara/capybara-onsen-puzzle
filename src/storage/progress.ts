import AsyncStorage from '@react-native-async-storage/async-storage';
import { DecorationId, HatId } from '../engine/types';
import { Language, getDefaultLanguage } from '../i18n/translations';

export const APP_VERSION = '1.1.0';
const STORAGE_KEY = '@capybara_onsen_progress_v1';

export interface PlayerProgress {
  starsByLevel: Record<string, number>; // levelId -> 1..3
  bestMovesByLevel: Record<string, number>;
  equippedHat: HatId;
  equippedDecorations: DecorationId[];
  dailyCompletedDates: string[]; // "YYYY-MM-DD"
  zenCompletedCount: number;
  lastSeenVersion: string;
  devUnlockAll: boolean;
  showDpad: boolean;
  language: Language;
  musicEnabled: boolean;
  ambienceEnabled: boolean;
  soundEnabled: boolean;
  hapticsEnabled: boolean;
  reduceMotion: boolean;
}

export const DEFAULT_PROGRESS: PlayerProgress = {
  starsByLevel: {},
  bestMovesByLevel: {},
  equippedHat: 'yuzu',
  equippedDecorations: [],
  dailyCompletedDates: [],
  zenCompletedCount: 0,
  lastSeenVersion: '',
  devUnlockAll: false,
  showDpad: false,
  language: getDefaultLanguage(),
  musicEnabled: true,
  ambienceEnabled: true,
  soundEnabled: true,
  hapticsEnabled: true,
  reduceMotion: false,
};

export async function loadProgress(): Promise<PlayerProgress> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULT_PROGRESS };
    const parsed = JSON.parse(raw) as Partial<PlayerProgress>;
    return {
      starsByLevel: parsed.starsByLevel ?? {},
      bestMovesByLevel: parsed.bestMovesByLevel ?? {},
      equippedHat: parsed.equippedHat ?? 'yuzu',
      equippedDecorations: Array.isArray(parsed.equippedDecorations)
        ? parsed.equippedDecorations
        : [],
      dailyCompletedDates: Array.isArray(parsed.dailyCompletedDates)
        ? parsed.dailyCompletedDates
        : [],
      zenCompletedCount:
        typeof parsed.zenCompletedCount === 'number'
          ? parsed.zenCompletedCount
          : 0,
      lastSeenVersion:
        typeof parsed.lastSeenVersion === 'string'
          ? parsed.lastSeenVersion
          : '',
      devUnlockAll: __DEV__ ? (parsed.devUnlockAll ?? false) : false,
      showDpad: parsed.showDpad ?? false,
      language:
        parsed.language === 'en' || parsed.language === 'id'
          ? parsed.language
          : getDefaultLanguage(),
      musicEnabled: parsed.musicEnabled ?? true,
      ambienceEnabled: parsed.ambienceEnabled ?? true,
      soundEnabled: parsed.soundEnabled ?? true,
      hapticsEnabled: parsed.hapticsEnabled ?? true,
      reduceMotion: parsed.reduceMotion ?? false,
    };
  } catch {
    return { ...DEFAULT_PROGRESS };
  }
}

export async function saveProgress(progress: PlayerProgress): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  } catch {
    // Ignore storage errors silently in offline mode
  }
}

export async function resetProgress(): Promise<PlayerProgress> {
  const fresh = { ...DEFAULT_PROGRESS };
  await saveProgress(fresh);
  return fresh;
}

export function getTotalStars(progress: PlayerProgress): number {
  return Object.values(progress.starsByLevel).reduce((sum, s) => sum + s, 0);
}
