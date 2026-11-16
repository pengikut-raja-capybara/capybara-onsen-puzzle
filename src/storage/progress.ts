import AsyncStorage from '@react-native-async-storage/async-storage';
import { Language, getDefaultLanguage } from '../i18n/translations';

const STORAGE_KEY = '@capybara_onsen_progress_v1';

export interface PlayerProgress {
  starsByLevel: Record<string, number>; // levelId -> 1..3
  bestMovesByLevel: Record<string, number>;
  language: Language;
  musicEnabled: boolean;
  soundEnabled: boolean;
  hapticsEnabled: boolean;
  reduceMotion: boolean;
}

export const DEFAULT_PROGRESS: PlayerProgress = {
  starsByLevel: {},
  bestMovesByLevel: {},
  language: getDefaultLanguage(),
  musicEnabled: true,
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
      language:
        parsed.language === 'en' || parsed.language === 'id'
          ? parsed.language
          : getDefaultLanguage(),
      musicEnabled: parsed.musicEnabled ?? true,
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
