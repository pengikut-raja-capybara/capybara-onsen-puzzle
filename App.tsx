import { useCallback, useEffect, useRef, useState } from 'react';
import { AppState, Appearance, BackHandler, StyleSheet, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeIn } from 'react-native-reanimated';
import {
  useFonts,
  Fredoka_400Regular,
  Fredoka_500Medium,
  Fredoka_600SemiBold,
  Fredoka_700Bold,
} from '@expo-google-fonts/fredoka';
import {
  ALL_LEVELS,
  CHAPTERS,
  getLevelById,
  isChapterUnlocked,
} from './src/data/chapters';
import {
  DECORATIONS,
  HATS,
  STAMPS,
  isDecorationUnlocked,
  isHatUnlocked,
} from './src/data/wardrobeAndStamps';
import {
  generateProceduralLevelAsync,
  generateZenLevelAsync,
  getTodayDateKey,
} from './src/engine/generator';
import { DecorationId, LevelConfig } from './src/engine/types';
import { UI_TEXT, getChapterText } from './src/i18n/translations';
import {
  APP_VERSION,
  DEFAULT_PROGRESS,
  PlayerProgress,
  getTotalStars,
  loadProgress,
  resetProgress,
  saveProgress,
} from './src/storage/progress';
import { preloadSfx, setAmbienceState, setBgmState } from './src/utils/sound';
import { PALETTE } from './src/theme';
import { HomeScreen } from './src/screens/HomeScreen';
import { ChapterSelectScreen } from './src/screens/ChapterSelectScreen';
import { WardrobeScreen } from './src/screens/WardrobeScreen';
import { AchievementsScreen } from './src/screens/AchievementsScreen';
import { DailyHubScreen } from './src/screens/DailyHubScreen';
import { GameScreen, RecentUnlocks } from './src/screens/GameScreen';
import { SplashScreen } from './src/screens/SplashScreen';
import { CreditsScreen } from './src/screens/CreditsScreen';

type Screen =
  | { name: 'home' }
  | { name: 'chapters' }
  | { name: 'wardrobe' }
  | { name: 'achievements' }
  | { name: 'credits' }
  | { name: 'dailyHub' }
  | { name: 'game'; levelId: string }
  | { name: 'daily'; customLevel: LevelConfig; isTodayDaily: boolean }
  | { name: 'zen'; customLevel: LevelConfig };

function computeNewlyUnlockedRewards(
  prev: PlayerProgress,
  next: PlayerProgress
): RecentUnlocks | null {
  const prevStars = getTotalStars(prev);
  const nextStars = getTotalStars(next);
  const lang = next.language;

  const hats = HATS.filter(
    (h) =>
      !isHatUnlocked(h, prevStars, prev.devUnlockAll) &&
      isHatUnlocked(h, nextStars, next.devUnlockAll)
  ).map((h) => h.name[lang]);

  const decorations = DECORATIONS.filter(
    (d) =>
      !isDecorationUnlocked(d, prevStars, prev.devUnlockAll) &&
      isDecorationUnlocked(d, nextStars, next.devUnlockAll)
  ).map((d) => d.name[lang]);

  const stamps = STAMPS.filter(
    (s) =>
      !(prev.devUnlockAll || s.checkUnlocked(prev)) &&
      (next.devUnlockAll || s.checkUnlocked(next))
  ).map((s) => s.title[lang]);

  const chapters = CHAPTERS.filter(
    (c) =>
      c.id > 1 &&
      !isChapterUnlocked(c.id, prev.starsByLevel, prevStars, prev.devUnlockAll) &&
      isChapterUnlocked(c.id, next.starsByLevel, nextStars, next.devUnlockAll)
  ).map((c) => getChapterText(c.id, c.title, c.subtitle, lang).title);

  if (
    hats.length === 0 &&
    decorations.length === 0 &&
    stamps.length === 0 &&
    chapters.length === 0
  ) {
    return null;
  }
  return { hats, decorations, stamps, chapters };
}

export default function App() {
  const [fontsLoaded] = useFonts({
    Fredoka_400Regular,
    Fredoka_500Medium,
    Fredoka_600SemiBold,
    Fredoka_700Bold,
  });

  const [screen, setScreen] = useState<Screen>({ name: 'home' });
  const [selectedChapterId, setSelectedChapterId] = useState<number>(1);
  const [progress, setProgress] = useState<PlayerProgress>(DEFAULT_PROGRESS);
  const [progressLoaded, setProgressLoaded] = useState(false);
  const [splashDone, setSplashDone] = useState(false);
  const [randomCounter, setRandomCounter] = useState(1);
  const [zenCounter, setZenCounter] = useState(1);
  const [recentUnlocks, setRecentUnlocks] = useState<RecentUnlocks | null>(null);

  const progressRef = useRef<PlayerProgress>(progress);
  progressRef.current = progress;
  const isGeneratingRef = useRef<boolean>(false);

  useEffect(() => {
    Appearance.setColorScheme?.('light');
    preloadSfx();
    loadProgress().then((p) => {
      progressRef.current = p;
      setProgress(p);
      const nextLevel =
        ALL_LEVELS.find((lv) => !p.starsByLevel[lv.id]) ?? ALL_LEVELS[0];
      setSelectedChapterId(nextLevel.chapter);
      setProgressLoaded(true);
    });
  }, []);

  const activeChapterId =
    screen.name === 'game'
      ? getLevelById(screen.levelId)?.chapter ?? selectedChapterId
      : screen.name === 'daily' || screen.name === 'zen'
      ? screen.customLevel.chapter
      : screen.name === 'chapters'
      ? selectedChapterId
      : 1;

  useEffect(() => {
    if (!progressLoaded) return;
    setBgmState(progress.musicEnabled, activeChapterId);
    setAmbienceState(progress.ambienceEnabled, activeChapterId);
    const sub = AppState.addEventListener('change', (nextState) => {
      if (nextState === 'active') {
        setBgmState(progress.musicEnabled, activeChapterId);
        setAmbienceState(progress.ambienceEnabled, activeChapterId);
      } else {
        setBgmState(false, activeChapterId);
        setAmbienceState(false, activeChapterId);
      }
    });
    return () => sub.remove();
  }, [
    progressLoaded,
    progress.musicEnabled,
    progress.ambienceEnabled,
    activeChapterId,
  ]);

  const navigateToGameLevel = useCallback((levelId: string) => {
    const lv = getLevelById(levelId);
    if (lv) {
      setSelectedChapterId(lv.chapter);
    }
    setRecentUnlocks(null);
    setScreen({ name: 'game', levelId });
  }, []);

  const navigateBackFromGame = useCallback((levelId: string) => {
    const lv = getLevelById(levelId);
    if (lv) {
      setSelectedChapterId(lv.chapter);
    }
    setRecentUnlocks(null);
    setScreen({ name: 'chapters' });
  }, []);

  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      if (!splashDone) return true;
      if (screen.name === 'home') {
        return false;
      }
      if (screen.name === 'game') {
        navigateBackFromGame(screen.levelId);
        return true;
      }
      if (screen.name === 'daily' || screen.name === 'zen') {
        setRecentUnlocks(null);
        setScreen({ name: 'dailyHub' });
        return true;
      }
      setRecentUnlocks(null);
      setScreen({ name: 'home' });
      return true;
    });
    return () => sub.remove();
  }, [splashDone, screen, navigateBackFromGame]);

  const updateProgress = useCallback((next: PlayerProgress) => {
    progressRef.current = next;
    setProgress(next);
    saveProgress(next);
  }, []);

  const handleToggleDecoration = useCallback((decorId: DecorationId) => {
    const prev = progressRef.current;
    const exists = prev.equippedDecorations.includes(decorId);
    const nextDecorations = exists
      ? prev.equippedDecorations.filter((id) => id !== decorId)
      : [...prev.equippedDecorations, decorId];
    const next: PlayerProgress = {
      ...prev,
      equippedDecorations: nextDecorations,
    };
    progressRef.current = next;
    setProgress(next);
    saveProgress(next);
  }, []);

  const handleWinLevel = useCallback(
    (levelId: string, stars: number, moves: number) => {
      const prev = progressRef.current;
      const prevStars = prev.starsByLevel[levelId] ?? 0;
      const prevBest = prev.bestMovesByLevel[levelId];
      const next: PlayerProgress = {
        ...prev,
        starsByLevel: {
          ...prev.starsByLevel,
          [levelId]: Math.max(prevStars, stars),
        },
        bestMovesByLevel: {
          ...prev.bestMovesByLevel,
          [levelId]: prevBest ? Math.min(prevBest, moves) : moves,
        },
      };
      progressRef.current = next;
      setProgress(next);
      saveProgress(next);
      setRecentUnlocks(computeNewlyUnlockedRewards(prev, next));
    },
    []
  );

  const handleWinDailyLevel = useCallback((isTodayDaily: boolean) => {
    if (!isTodayDaily) {
      setRecentUnlocks(null);
      return;
    }
    const todayKey = getTodayDateKey();
    const prev = progressRef.current;
    if (prev.dailyCompletedDates.includes(todayKey)) {
      setRecentUnlocks(null);
      return;
    }
    const next: PlayerProgress = {
      ...prev,
      dailyCompletedDates: [...prev.dailyCompletedDates, todayKey],
    };
    progressRef.current = next;
    setProgress(next);
    saveProgress(next);
    setRecentUnlocks(computeNewlyUnlockedRewards(prev, next));
  }, []);

  const handleWinZenLevel = useCallback(() => {
    const prev = progressRef.current;
    const next: PlayerProgress = {
      ...prev,
      zenCompletedCount: prev.zenCompletedCount + 1,
    };
    progressRef.current = next;
    setProgress(next);
    saveProgress(next);
    setRecentUnlocks(computeNewlyUnlockedRewards(prev, next));
  }, []);

  const openDailyChallenge = useCallback(async () => {
    if (isGeneratingRef.current) return;
    isGeneratingRef.current = true;
    try {
      const todayKey = getTodayDateKey();
      const t = UI_TEXT[progressRef.current.language];
      const lv = await generateProceduralLevelAsync(`daily_${todayKey}`, {
        id: `daily_${todayKey}`,
        title: t.dailyStageTitle(todayKey),
        stageNumber: 1,
      });
      setRecentUnlocks(null);
      setScreen({ name: 'daily', customLevel: lv, isTodayDaily: true });
    } finally {
      isGeneratingRef.current = false;
    }
  }, []);

  const openNextRandomChallenge = useCallback(async () => {
    if (isGeneratingRef.current) return;
    isGeneratingRef.current = true;
    try {
      const nextNum = randomCounter + 1;
      setRandomCounter(nextNum);
      const t = UI_TEXT[progressRef.current.language];
      const lv = await generateProceduralLevelAsync(
        `rnd_${Date.now()}_${nextNum}`,
        {
          id: `random_${nextNum}`,
          title: t.randomStageTitle(nextNum),
          stageNumber: nextNum,
        }
      );
      setRecentUnlocks(null);
      setScreen({ name: 'daily', customLevel: lv, isTodayDaily: false });
    } finally {
      isGeneratingRef.current = false;
    }
  }, [randomCounter]);

  const openZenChallenge = useCallback(async () => {
    if (isGeneratingRef.current) return;
    isGeneratingRef.current = true;
    try {
      const nextNum = zenCounter;
      setZenCounter(nextNum + 1);
      const t = UI_TEXT[progressRef.current.language];
      const lv = await generateZenLevelAsync(
        `zen_${Date.now()}_${nextNum}`,
        {
          id: `zen_${nextNum}`,
          title: t.zenStageTitle(nextNum),
          stageNumber: nextNum,
        }
      );
      setRecentUnlocks(null);
      setScreen({ name: 'zen', customLevel: lv });
    } finally {
      isGeneratingRef.current = false;
    }
  }, [zenCounter]);

  if (!fontsLoaded) {
    return <View style={styles.loadingBg} />;
  }

  if (!splashDone) {
    return (
      <GestureHandlerRootView style={styles.root}>
        <SafeAreaProvider>
          <SafeAreaView style={styles.safeArea}>
            <StatusBar style="dark" />
            <SplashScreen
              language={progress.language}
              equippedHat={progress.equippedHat}
              reduceMotion={progress.reduceMotion}
              onFinish={() => setSplashDone(true)}
            />
          </SafeAreaView>
        </SafeAreaProvider>
      </GestureHandlerRootView>
    );
  }

  const screenKey =
    screen.name === 'game'
      ? `game-${screen.levelId}`
      : screen.name === 'daily'
      ? `daily-${screen.customLevel.id}`
      : screen.name === 'zen'
      ? `zen-${screen.customLevel.id}`
      : screen.name;

  return (
    <GestureHandlerRootView style={styles.root}>
      <SafeAreaProvider>
        <SafeAreaView style={styles.safeArea}>
          <StatusBar style="dark" />
          <Animated.View
            key={screenKey}
            entering={progress.reduceMotion ? undefined : FadeIn.duration(180)}
            style={styles.root}
          >
            {screen.name === 'home' && (
              <HomeScreen
                progress={progress}
                onPlayContinue={navigateToGameLevel}
                onOpenChapters={() => {
                  setRecentUnlocks(null);
                  setScreen({ name: 'chapters' });
                }}
                onOpenWardrobe={() => {
                  setRecentUnlocks(null);
                  setScreen({ name: 'wardrobe' });
                }}
                onOpenAchievements={() => {
                  setRecentUnlocks(null);
                  setScreen({ name: 'achievements' });
                }}
                onOpenDailyHub={() => {
                  setRecentUnlocks(null);
                  setScreen({ name: 'dailyHub' });
                }}
                onOpenCredits={() => {
                  setRecentUnlocks(null);
                  setScreen({ name: 'credits' });
                }}
                onDismissWhatsNew={() =>
                  updateProgress({ ...progress, lastSeenVersion: APP_VERSION })
                }
                onChangeLanguage={(language) =>
                  updateProgress({ ...progress, language })
                }
                onToggleMusic={(musicEnabled) =>
                  updateProgress({ ...progress, musicEnabled })
                }
                onToggleAmbience={(ambienceEnabled) =>
                  updateProgress({ ...progress, ambienceEnabled })
                }
                onToggleAllAudio={() => {
                  const anyAudioOn =
                    progress.musicEnabled || progress.ambienceEnabled;
                  updateProgress({
                    ...progress,
                    musicEnabled: !anyAudioOn,
                    ambienceEnabled: !anyAudioOn,
                  });
                }}
                onToggleSound={(soundEnabled) =>
                  updateProgress({ ...progress, soundEnabled })
                }
                onToggleHaptics={(hapticsEnabled) =>
                  updateProgress({ ...progress, hapticsEnabled })
                }
                onToggleReduceMotion={(reduceMotion) =>
                  updateProgress({ ...progress, reduceMotion })
                }
                onToggleShowDpad={(showDpad) =>
                  updateProgress({ ...progress, showDpad })
                }
                onToggleDevUnlockAll={(devUnlockAll) =>
                  updateProgress({ ...progress, devUnlockAll })
                }
                onResetProgress={async () => {
                  const fresh = await resetProgress();
                  progressRef.current = fresh;
                  setProgress(fresh);
                  setSelectedChapterId(1);
                }}
              />
            )}

            {screen.name === 'chapters' && (
              <ChapterSelectScreen
                progress={progress}
                selectedChapterId={selectedChapterId}
                onSelectChapter={setSelectedChapterId}
                onSelectLevel={navigateToGameLevel}
                onBack={() => setScreen({ name: 'home' })}
              />
            )}

            {screen.name === 'wardrobe' && (
              <WardrobeScreen
                progress={progress}
                onSelectHat={(equippedHat) =>
                  updateProgress({ ...progress, equippedHat })
                }
                onToggleDecoration={handleToggleDecoration}
                onBack={() => setScreen({ name: 'home' })}
              />
            )}

            {screen.name === 'achievements' && (
              <AchievementsScreen
                progress={progress}
                onBack={() => setScreen({ name: 'home' })}
              />
            )}

            {screen.name === 'dailyHub' && (
              <DailyHubScreen
                progress={progress}
                onPlayDaily={openDailyChallenge}
                onPlayZen={openZenChallenge}
                onBack={() => setScreen({ name: 'home' })}
              />
            )}

            {screen.name === 'credits' && (
              <CreditsScreen
                language={progress.language}
                reduceMotion={progress.reduceMotion}
                hapticsEnabled={progress.hapticsEnabled}
                onBack={() => setScreen({ name: 'home' })}
              />
            )}

            {screen.name === 'game' && (
              <GameScreen
                levelId={screen.levelId}
                progress={progress}
                recentUnlocks={recentUnlocks}
                onWinLevel={handleWinLevel}
                onSelectLevel={navigateToGameLevel}
                onToggleDpad={(showDpad) =>
                  updateProgress({ ...progress, showDpad })
                }
                onBack={() => navigateBackFromGame(screen.levelId)}
                onGoHome={() => {
                  setRecentUnlocks(null);
                  setScreen({ name: 'home' });
                }}
              />
            )}

            {screen.name === 'daily' && (
              <GameScreen
                levelId={screen.customLevel.id}
                customLevel={screen.customLevel}
                mode="daily"
                progress={progress}
                recentUnlocks={recentUnlocks}
                onWinLevel={() => handleWinDailyLevel(screen.isTodayDaily)}
                onSelectLevel={navigateToGameLevel}
                onToggleDpad={(showDpad) =>
                  updateProgress({ ...progress, showDpad })
                }
                onNextRandomLevel={openNextRandomChallenge}
                onBack={() => {
                  setRecentUnlocks(null);
                  setScreen({ name: 'dailyHub' });
                }}
                onGoHome={() => {
                  setRecentUnlocks(null);
                  setScreen({ name: 'home' });
                }}
              />
            )}

            {screen.name === 'zen' && (
              <GameScreen
                levelId={screen.customLevel.id}
                customLevel={screen.customLevel}
                mode="zen"
                zenCompletedCount={progress.zenCompletedCount}
                progress={progress}
                recentUnlocks={recentUnlocks}
                onWinLevel={handleWinZenLevel}
                onSelectLevel={navigateToGameLevel}
                onToggleDpad={(showDpad) =>
                  updateProgress({ ...progress, showDpad })
                }
                onNextRandomLevel={openZenChallenge}
                onBack={() => {
                  setRecentUnlocks(null);
                  setScreen({ name: 'dailyHub' });
                }}
                onGoHome={() => {
                  setRecentUnlocks(null);
                  setScreen({ name: 'home' });
                }}
              />
            )}
          </Animated.View>
        </SafeAreaView>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  loadingBg: {
    flex: 1,
    backgroundColor: PALETTE.cream,
  },
  safeArea: {
    flex: 1,
    backgroundColor: PALETTE.cream,
  },
});
