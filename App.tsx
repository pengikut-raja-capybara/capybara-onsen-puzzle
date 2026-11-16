import { useCallback, useEffect, useState } from 'react';
import { AppState, Appearance, StyleSheet, View } from 'react-native';
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
  DEFAULT_PROGRESS,
  PlayerProgress,
  loadProgress,
  resetProgress,
  saveProgress,
} from './src/storage/progress';
import { preloadSfx, setBgmPlaying } from './src/utils/sound';
import { PALETTE } from './src/theme';
import { HomeScreen } from './src/screens/HomeScreen';
import { ChapterSelectScreen } from './src/screens/ChapterSelectScreen';
import { GameScreen } from './src/screens/GameScreen';
import { SplashScreen } from './src/screens/SplashScreen';
import { CreditsScreen } from './src/screens/CreditsScreen';

type Screen =
  | { name: 'home' }
  | { name: 'chapters' }
  | { name: 'credits' }
  | { name: 'game'; levelId: string };

export default function App() {
  const [fontsLoaded] = useFonts({
    Fredoka_400Regular,
    Fredoka_500Medium,
    Fredoka_600SemiBold,
    Fredoka_700Bold,
  });

  const [screen, setScreen] = useState<Screen>({ name: 'home' });
  const [progress, setProgress] = useState<PlayerProgress>(DEFAULT_PROGRESS);
  const [progressLoaded, setProgressLoaded] = useState(false);
  const [splashDone, setSplashDone] = useState(false);

  useEffect(() => {
    Appearance.setColorScheme?.('light');
    preloadSfx();
    loadProgress().then((p) => {
      setProgress(p);
      setProgressLoaded(true);
    });
  }, []);

  useEffect(() => {
    if (!progressLoaded) return;
    setBgmPlaying(progress.musicEnabled);
    const sub = AppState.addEventListener('change', (nextState) => {
      if (nextState === 'active') {
        setBgmPlaying(progress.musicEnabled);
      } else {
        setBgmPlaying(false);
      }
    });
    return () => sub.remove();
  }, [progressLoaded, progress.musicEnabled]);

  const updateProgress = useCallback((next: PlayerProgress) => {
    setProgress(next);
    saveProgress(next);
  }, []);

  const handleWinLevel = useCallback(
    (levelId: string, stars: number, moves: number) => {
      setProgress((prev) => {
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
        saveProgress(next);
        return next;
      });
    },
    []
  );

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
              onFinish={() => setSplashDone(true)}
            />
          </SafeAreaView>
        </SafeAreaProvider>
      </GestureHandlerRootView>
    );
  }

  const screenKey =
    screen.name === 'game' ? `game-${screen.levelId}` : screen.name;

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
                onPlayContinue={(levelId) =>
                  setScreen({ name: 'game', levelId })
                }
                onOpenChapters={() => setScreen({ name: 'chapters' })}
                onOpenCredits={() => setScreen({ name: 'credits' })}
                onChangeLanguage={(language) =>
                  updateProgress({ ...progress, language })
                }
                onToggleMusic={(musicEnabled) =>
                  updateProgress({ ...progress, musicEnabled })
                }
                onToggleSound={(soundEnabled) =>
                  updateProgress({ ...progress, soundEnabled })
                }
                onToggleHaptics={(hapticsEnabled) =>
                  updateProgress({ ...progress, hapticsEnabled })
                }
                onToggleReduceMotion={(reduceMotion) =>
                  updateProgress({ ...progress, reduceMotion })
                }
                onResetProgress={async () => {
                  const fresh = await resetProgress();
                  setProgress(fresh);
                }}
              />
            )}

            {screen.name === 'chapters' && (
              <ChapterSelectScreen
                progress={progress}
                onSelectLevel={(levelId) =>
                  setScreen({ name: 'game', levelId })
                }
                onBack={() => setScreen({ name: 'home' })}
              />
            )}

            {screen.name === 'credits' && (
              <CreditsScreen
                language={progress.language}
                reduceMotion={progress.reduceMotion}
                onBack={() => setScreen({ name: 'home' })}
              />
            )}

            {screen.name === 'game' && (
              <GameScreen
                levelId={screen.levelId}
                progress={progress}
                onWinLevel={handleWinLevel}
                onSelectLevel={(levelId) =>
                  setScreen({ name: 'game', levelId })
                }
                onBack={() => setScreen({ name: 'chapters' })}
                onGoHome={() => setScreen({ name: 'home' })}
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
