import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  FadeIn,
  ZoomIn,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { CHAPTERS, getLevelById, getNextLevel } from '../data/chapters';
import {
  calculateStars,
  createInitialState,
  solveLevelBFS,
  stepMove,
} from '../engine/solver';
import {
  Direction,
  GameState,
  LevelConfig,
  MoveResult,
  Position,
} from '../engine/types';
import {
  UI_TEXT,
  getLevelHint,
  getLevelTitle,
} from '../i18n/translations';
import { PlayerProgress } from '../storage/progress';
import { CHAPTER_PALETTES, FONTS, PALETTE, RADIUS, SHADOWS } from '../theme';
import { playSfx, triggerHaptic } from '../utils/sound';
import { PuzzleBoard, computeStepArrivalTimes } from '../components/PuzzleBoard';
import { CapybaraSvg } from '../components/svg/CapybaraSvg';
import {
  ArrowIcon,
  BackIcon,
  CloseIcon,
  DpadIcon,
  HintIcon,
  HomeIcon,
  RestartIcon,
  UndoIcon,
} from '../components/svg/Icons';
import { OnsenSvg, StarSvg, YuzuSvg } from '../components/svg/TileSvg';
import { CozyButton } from '../components/ui/CozyButton';
import { ScreenBackground } from '../components/ui/ScreenBackground';

export interface RecentUnlocks {
  hats: string[];
  decorations: string[];
  stamps: string[];
  chapters: string[];
}

interface GameScreenProps {
  levelId: string;
  customLevel?: LevelConfig;
  mode?: 'campaign' | 'daily' | 'zen';
  zenCompletedCount?: number;
  progress: PlayerProgress;
  recentUnlocks?: RecentUnlocks | null;
  onWinLevel: (levelId: string, stars: number, moves: number) => void;
  onSelectLevel: (levelId: string) => void;
  onToggleDpad: (show: boolean) => void;
  onNextRandomLevel?: () => void;
  onBack: () => void;
  onGoHome: () => void;
}

export const GameScreen: React.FC<GameScreenProps> = ({
  levelId,
  customLevel,
  mode = 'campaign',
  zenCompletedCount = 0,
  progress,
  recentUnlocks,
  onWinLevel,
  onSelectLevel,
  onToggleDpad,
  onNextRandomLevel,
  onBack,
  onGoHome,
}) => {
  const isZen = mode === 'zen';
  const level = useMemo(
    () => customLevel ?? getLevelById(levelId)!,
    [customLevel, levelId]
  );
  const chapter = useMemo(
    () => CHAPTERS.find((c) => c.id === level.chapter) ?? CHAPTERS[0],
    [level.chapter]
  );
  const palette = CHAPTER_PALETTES[level.chapter] ?? CHAPTER_PALETTES[1];
  const nextLevel = useMemo(() => getNextLevel(levelId), [levelId]);
  const t = UI_TEXT[progress.language];
  const localizedTitle = getLevelTitle(
    level.id,
    level.title,
    progress.language
  );
  const localizedHint = getLevelHint(
    level.id,
    level.hintText,
    progress.language
  );

  const [gameState, setGameState] = useState<GameState>(() =>
    createInitialState(level)
  );
  const [lastPath, setLastPath] = useState<Position[]>([]);
  const [lastMoveResult, setLastMoveResult] = useState<MoveResult | null>(null);
  const [moveNonce, setMoveNonce] = useState<number>(0);
  const [showWinModal, setShowWinModal] = useState<boolean>(false);
  const [history, setHistory] = useState<GameState[]>([]);
  const [hintDir, setHintDir] = useState<Direction | null>(null);
  const [winStars, setWinStars] = useState<number>(0);
  const [bumpNonce, setBumpNonce] = useState<number>(0);
  const [isSoftlocked, setIsSoftlocked] = useState<boolean>(false);
  const [winMascotExcited, setWinMascotExcited] = useState<boolean>(false);
  const [showTutorial, setShowTutorial] = useState<boolean>(
    Boolean(level.hintText)
  );
  const [boardArea, setBoardArea] = useState<{ w: number; h: number } | null>(
    null
  );

  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const isAnimatingRef = useRef<boolean>(false);
  const winCapyScale = useSharedValue(1);
  const winCapyRotate = useSharedValue(0);

  const winCapyStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: winCapyScale.value },
      { rotate: `${winCapyRotate.value}deg` },
    ],
  }));

  const clearAllTimers = useCallback(() => {
    for (const timer of timersRef.current) {
      clearTimeout(timer);
    }
    timersRef.current = [];
  }, []);

  const scheduleTimer = useCallback((fn: () => void, ms: number) => {
    const timer = setTimeout(fn, ms);
    timersRef.current.push(timer);
  }, []);

  useEffect(() => {
    clearAllTimers();
    isAnimatingRef.current = false;
    setGameState(createInitialState(level));
    setLastPath([]);
    setLastMoveResult(null);
    setMoveNonce(0);
    setShowWinModal(false);
    setHistory([]);
    setHintDir(null);
    setWinStars(0);
    setBumpNonce(0);
    setIsSoftlocked(false);
    setWinMascotExcited(false);
    setShowTutorial(Boolean(level.hintText));

    return clearAllTimers;
  }, [level, clearAllTimers]);

  const handleMove = useCallback(
    (dir: Direction) => {
      if (gameState.won || isAnimatingRef.current) return;

      const res = stepMove(level, gameState, dir);
      if (!res.moved) {
        setBumpNonce((n) => n + 1);
        playSfx('bump', progress.soundEnabled);
        triggerHaptic('bump', progress.hapticsEnabled);
        return;
      }

      clearAllTimers();
      setHintDir(null);
      setIsSoftlocked(false);
      setHistory((prev) => [...prev, gameState]);
      setLastPath(res.path);
      setLastMoveResult(res);
      setMoveNonce((n) => n + 1);
      setGameState(res.nextState);

      const arrivalTimes = computeStepArrivalTimes(res.path, gameState.capybara);
      const totalDur = progress.reduceMotion
        ? 0
        : arrivalTimes[arrivalTimes.length - 1] ?? 180;

      if (!progress.reduceMotion && totalDur > 0 && !res.nextState.won) {
        isAnimatingRef.current = true;
        scheduleTimer(() => {
          isAnimatingRef.current = false;
        }, totalDur);
      }

      // Slide start sound & haptic
      if (res.pushedLog) {
        playSfx('log', progress.soundEnabled);
        triggerHaptic('medium', progress.hapticsEnabled);
      } else if (res.teleported) {
        playSfx('portal', progress.soundEnabled);
        triggerHaptic('light', progress.hapticsEnabled);
      } else {
        playSfx('slide', progress.soundEnabled);
        triggerHaptic('light', progress.hapticsEnabled);
      }

      // Synchronized per-mechanic arrival SFX & haptics
      for (const item of res.collectedYuzuSteps ?? []) {
        const ms = progress.reduceMotion
          ? 0
          : arrivalTimes[item.stepIndex] ?? totalDur;
        scheduleTimer(() => {
          playSfx('yuzu', progress.soundEnabled);
          triggerHaptic('medium', progress.hapticsEnabled);
        }, ms);
      }

      if (res.openedGate && res.openedGateStep != null) {
        const ms = progress.reduceMotion
          ? 0
          : arrivalTimes[res.openedGateStep] ?? totalDur;
        scheduleTimer(() => {
          playSfx('button', progress.soundEnabled);
          triggerHaptic('medium', progress.hapticsEnabled);
        }, ms);
      }

      for (const item of res.crackedIceSteps ?? []) {
        const ms = progress.reduceMotion
          ? 0
          : arrivalTimes[item.stepIndex] ?? totalDur;
        scheduleTimer(() => {
          playSfx('ice', progress.soundEnabled);
          triggerHaptic('light', progress.hapticsEnabled);
        }, ms);
      }

      if (res.stoppedByMud && !res.nextState.won) {
        scheduleTimer(() => {
          playSfx('mud', progress.soundEnabled);
        }, totalDur);
      }

      if (res.nextState.won) {
        const stars = calculateStars(level, res.nextState);
        setWinStars(stars);
        onWinLevel(level.id, stars, res.nextState.moves);

        const animDelay = progress.reduceMotion
          ? 60
          : Math.min(880, Math.max(220, totalDur + 140));
        scheduleTimer(() => {
          playSfx('win', progress.soundEnabled);
          triggerHaptic('success', progress.hapticsEnabled);
          setShowWinModal(true);
        }, animDelay);
      } else if (res.pushedLog || res.crackedIce) {
        // Gentle non-blocking softlock check after log push or ice crack
        const nextSnapshot = res.nextState;
        scheduleTimer(() => {
          const check = solveLevelBFS(level, nextSnapshot, 3000);
          if (!check.solvable) {
            setIsSoftlocked(true);
          }
        }, totalDur + 40);
      }
    },
    [
      gameState,
      level,
      progress.soundEnabled,
      progress.hapticsEnabled,
      progress.reduceMotion,
      onWinLevel,
      clearAllTimers,
      scheduleTimer,
    ]
  );

  const handleUndo = () => {
    if (history.length === 0 || gameState.won) return;
    clearAllTimers();
    isAnimatingRef.current = false;
    const prev = history[history.length - 1];
    setHistory((h) => h.slice(0, -1));
    setLastPath([]);
    setLastMoveResult(null);
    setGameState(prev);
    setHintDir(null);
    setIsSoftlocked(false);
    playSfx('undo', progress.soundEnabled);
    triggerHaptic('light', progress.hapticsEnabled);
  };

  const handleRestart = () => {
    clearAllTimers();
    isAnimatingRef.current = false;
    setGameState(createInitialState(level));
    setLastPath([]);
    setLastMoveResult(null);
    setShowWinModal(false);
    setHistory([]);
    setHintDir(null);
    setWinStars(0);
    setIsSoftlocked(false);
    playSfx('tap', progress.soundEnabled);
    triggerHaptic('light', progress.hapticsEnabled);
  };

  const handleHint = () => {
    if (gameState.won || isAnimatingRef.current) return;
    const solution = solveLevelBFS(level, gameState, 8000);
    if (solution.solvable && solution.directions.length > 0) {
      setHintDir(solution.directions[0]);
      setIsSoftlocked(false);
      playSfx('hint', progress.soundEnabled);
      triggerHaptic('light', progress.hapticsEnabled);
    } else {
      setHintDir(null);
      setIsSoftlocked(true);
      playSfx('bump', progress.soundEnabled);
      triggerHaptic('bump', progress.hapticsEnabled);
    }
  };

  const handleBackNav = () => {
    clearAllTimers();
    isAnimatingRef.current = false;
    playSfx('tap', progress.soundEnabled);
    triggerHaptic('light', progress.hapticsEnabled);
    onBack();
  };

  const handleHomeNav = () => {
    clearAllTimers();
    isAnimatingRef.current = false;
    playSfx('tap', progress.soundEnabled);
    triggerHaptic('light', progress.hapticsEnabled);
    onGoHome();
  };

  const handleToggleDpadPress = () => {
    playSfx('tap', progress.soundEnabled);
    triggerHaptic('light', progress.hapticsEnabled);
    onToggleDpad(!progress.showDpad);
  };

  const handleTapWinMascot = () => {
    playSfx('yuzu', progress.soundEnabled);
    triggerHaptic('light', progress.hapticsEnabled);
    setWinMascotExcited(true);
    scheduleTimer(() => setWinMascotExcited(false), 750);

    if (!progress.reduceMotion) {
      winCapyScale.value = withSequence(
        withSpring(1.16, { damping: 6, stiffness: 260 }),
        withSpring(1, { damping: 9, stiffness: 180 })
      );
      winCapyRotate.value = withSequence(
        withTiming(-7, { duration: 90 }),
        withTiming(7, { duration: 90 }),
        withSpring(0, { damping: 8 })
      );
    }
  };

  const hasInfoBubble = isSoftlocked || (showTutorial && Boolean(localizedHint));
  const showSwipeTip =
    !progress.showDpad &&
    level.id === 'ch1_01' &&
    gameState.moves === 0 &&
    !isSoftlocked;

  const allYuzusCollected =
    gameState.collectedYuzus.length >= level.yuzus.length;
  const withinPar = gameState.moves <= level.parMoves;
  const hasAnyUnlocks = Boolean(
    recentUnlocks &&
      (recentUnlocks.hats.length > 0 ||
        recentUnlocks.decorations.length > 0 ||
        recentUnlocks.stamps.length > 0 ||
        recentUnlocks.chapters.length > 0)
  );

  return (
    <ScreenBackground
      chapterId={level.chapter}
      reduceMotion={progress.reduceMotion}
      hapticsEnabled={progress.hapticsEnabled}
      variant="board"
    >
      <View pointerEvents="box-none" style={styles.container}>
        {/* Clean 2-Row Top Header */}
        <View style={styles.headerWrap}>
          <View style={styles.topNavRow}>
            <View style={styles.topLeftGroup}>
              <Pressable
                onPress={handleBackNav}
                accessibilityLabel={t.backBtnLabel}
                style={({ pressed }) => [
                  styles.backBtn,
                  SHADOWS.soft,
                  pressed && styles.pressed,
                ]}
              >
                <BackIcon size={20} color={PALETTE.espresso} />
              </Pressable>

              <View
                style={[
                  styles.kickerPill,
                  { backgroundColor: palette.boardBg, borderColor: palette.boardFrame },
                ]}
              >
                <Text style={[styles.stageKicker, { color: palette.primary }]}>
                  {isZen
                    ? t.zenKicker
                    : customLevel
                    ? t.dailyKicker
                    : t.stageKicker(level.stageNumber)}
                </Text>
              </View>
            </View>

            <View style={styles.pillsRow}>
              {level.yuzus.length > 0 && (
                <View style={[styles.yuzuBadge, SHADOWS.soft]}>
                  <YuzuSvg size={16} />
                  <Text style={styles.yuzuText}>
                    {gameState.collectedYuzus.length}/{level.yuzus.length}
                  </Text>
                </View>
              )}

              <View style={[styles.movesPill, SHADOWS.soft]}>
                <Text style={styles.movesValue}>
                  {t.movesLabel}{' '}
                  <Text
                    style={
                      !isZen && gameState.moves > level.parMoves
                        ? styles.overParText
                        : undefined
                    }
                  >
                    {gameState.moves}
                  </Text>
                  {!isZen && (
                    <Text style={styles.parText}>/{level.parMoves}</Text>
                  )}
                </Text>
              </View>
            </View>
          </View>

          <Text
            style={styles.stageTitle}
            numberOfLines={1}
            adjustsFontSizeToFit
            minimumFontScale={0.8}
          >
            {localizedTitle}
          </Text>
        </View>

        {/* Board + Softlock Whisper / Dismissible Tutorial */}
        <View
          style={styles.boardSection}
          onLayout={(e) =>
            setBoardArea({
              w: e.nativeEvent.layout.width,
              h: e.nativeEvent.layout.height,
            })
          }
        >
          {boardArea && (
            <PuzzleBoard
              level={level}
              gameState={gameState}
              lastPath={lastPath}
              lastMoveResult={lastMoveResult}
              moveNonce={moveNonce}
              hintDir={hintDir}
              bumpNonce={bumpNonce}
              equippedHat={progress.equippedHat}
              reduceMotion={progress.reduceMotion}
              maxSize={Math.min(
                boardArea.w,
                boardArea.h - (hasInfoBubble ? 64 : 8)
              )}
              onSwipe={handleMove}
            />
          )}

          {isSoftlocked ? (
            <Animated.View
              entering={progress.reduceMotion ? undefined : FadeIn.duration(200)}
              style={[styles.softlockBubble, SHADOWS.soft]}
            >
              <Text style={styles.softlockText}>{t.softlockHint}</Text>
            </Animated.View>
          ) : (
            showTutorial &&
            localizedHint && (
              <Animated.View
                entering={
                  progress.reduceMotion ? undefined : FadeIn.duration(220)
                }
                style={[styles.tutorialBubble, SHADOWS.soft]}
              >
                <Text style={styles.tutorialText}>{localizedHint}</Text>
                <Pressable
                  onPress={() => setShowTutorial(false)}
                  hitSlop={10}
                  style={styles.tutorialClose}
                >
                  <CloseIcon size={16} color={PALETTE.espressoSoft} />
                </Pressable>
              </Animated.View>
            )
          )}
        </View>

        {/* Bottom Controls: Action Bar + Optional Collapsible D-Pad */}
        <View style={styles.controlsArea}>
          <View style={styles.actionRow}>
            <Pressable
              onPress={handleHomeNav}
              accessibilityLabel={t.homeBtnLabel}
              style={({ pressed }) => [
                styles.circleActionBtn,
                SHADOWS.soft,
                pressed && styles.pressed,
              ]}
            >
              <HomeIcon size={20} color={palette.primary} />
            </Pressable>

            <Pressable
              onPress={handleRestart}
              accessibilityLabel={t.replayBtn}
              style={({ pressed }) => [
                styles.circleActionBtn,
                SHADOWS.soft,
                isSoftlocked && styles.softlockHighlightBtn,
                pressed && styles.pressed,
              ]}
            >
              <RestartIcon size={20} color={palette.primary} />
            </Pressable>

            <Pressable
              onPress={handleUndo}
              disabled={history.length === 0}
              accessibilityLabel={t.undoBtnLabel}
              style={({ pressed }) => [
                styles.circleActionBtn,
                SHADOWS.soft,
                isSoftlocked &&
                  history.length > 0 &&
                  styles.softlockHighlightBtn,
                history.length === 0 && styles.disabledBtn,
                pressed && history.length > 0 && styles.pressed,
              ]}
            >
              <UndoIcon size={20} color={palette.primary} />
            </Pressable>

            <Pressable
              onPress={handleHint}
              accessibilityLabel={t.hintBtnLabel}
              style={({ pressed }) => [
                styles.circleActionBtn,
                styles.hintBtn,
                SHADOWS.soft,
                pressed && styles.pressed,
              ]}
            >
              <HintIcon size={20} color={PALETTE.yuzuDark} />
            </Pressable>

            <Pressable
              onPress={handleToggleDpadPress}
              accessibilityLabel={t.dpadToggleLabel}
              style={({ pressed }) => [
                styles.circleActionBtn,
                SHADOWS.soft,
                progress.showDpad && {
                  backgroundColor: palette.primary,
                  borderColor: palette.primary,
                },
                pressed && styles.pressed,
              ]}
            >
              <DpadIcon
                size={20}
                color={progress.showDpad ? PALETTE.white : palette.primary}
              />
            </Pressable>
          </View>

          {showSwipeTip && (
            <Text style={styles.swipeTipText}>{t.swipeTipText}</Text>
          )}

          {progress.showDpad && (
            <View style={styles.dpadRow}>
              <Pressable
                style={({ pressed }) => [
                  styles.dpadSideBtn,
                  { borderColor: palette.boardFrame },
                  SHADOWS.soft,
                  pressed && styles.pressed,
                ]}
                onPress={() => handleMove('left')}
              >
                <ArrowIcon direction="left" size={28} color={palette.primary} />
              </Pressable>

              <View style={styles.dpadCenterCol}>
                <Pressable
                  style={({ pressed }) => [
                    styles.dpadVertBtn,
                    { borderColor: palette.boardFrame },
                    SHADOWS.soft,
                    pressed && styles.pressed,
                  ]}
                  onPress={() => handleMove('up')}
                >
                  <ArrowIcon direction="up" size={26} color={palette.primary} />
                </Pressable>
                <Pressable
                  style={({ pressed }) => [
                    styles.dpadVertBtn,
                    { borderColor: palette.boardFrame },
                    SHADOWS.soft,
                    pressed && styles.pressed,
                  ]}
                  onPress={() => handleMove('down')}
                >
                  <ArrowIcon
                    direction="down"
                    size={26}
                    color={palette.primary}
                  />
                </Pressable>
              </View>

              <Pressable
                style={({ pressed }) => [
                  styles.dpadSideBtn,
                  { borderColor: palette.boardFrame },
                  SHADOWS.soft,
                  pressed && styles.pressed,
                ]}
                onPress={() => handleMove('right')}
              >
                <ArrowIcon
                  direction="right"
                  size={28}
                  color={palette.primary}
                />
              </Pressable>
            </View>
          )}
        </View>

        {/* Win Modal */}
        <Modal
          visible={showWinModal}
          transparent
          animationType="fade"
          onRequestClose={handleBackNav}
        >
          <View style={styles.modalBackdrop}>
            <Animated.View
              entering={
                progress.reduceMotion
                  ? undefined
                  : ZoomIn.springify().damping(15)
              }
              style={[styles.winCard, SHADOWS.card]}
            >
              <Text style={[styles.winKicker, { color: palette.primary }]}>
                {isZen ? t.zenWinKicker : t.winKicker}
              </Text>
              <Text style={styles.winTitle}>{localizedTitle}</Text>

              <Pressable onPress={handleTapWinMascot}>
                <Animated.View style={[styles.winMascot, winCapyStyle]}>
                  <OnsenSvg size={112} />
                  <View style={styles.winCapy}>
                    <CapybaraSvg
                      size={84}
                      hat={
                        progress.equippedHat !== 'none'
                          ? progress.equippedHat
                          : gameState.collectedYuzus.length > 0
                          ? 'yuzu'
                          : 'none'
                      }
                      expression={winMascotExcited ? 'excited' : 'happy'}
                      animatedIdle={!progress.reduceMotion}
                      inWater
                    />
                  </View>
                </Animated.View>
              </Pressable>

              {isZen ? (
                <View style={styles.zenWinBox}>
                  <Text style={styles.zenWinText}>
                    {t.zenWinSubtitle(zenCompletedCount)}
                  </Text>
                </View>
              ) : (
                <>
                  <View style={styles.winStarsRow}>
                    {[1, 2, 3].map((s) => (
                      <Animated.View
                        key={s}
                        entering={
                          progress.reduceMotion
                            ? undefined
                            : ZoomIn.delay(s * 110).springify().damping(12)
                        }
                      >
                        <StarSvg filled={winStars >= s} size={38} />
                      </Animated.View>
                    ))}
                  </View>

                  {/* 3-Star Checklist */}
                  <View style={styles.winChecklist}>
                    <View style={styles.checkRow}>
                      <Text style={styles.checkMarkDone}>✓</Text>
                      <Text style={styles.checkTextDone}>
                        {t.winCheckOnsen}
                      </Text>
                    </View>
                    {level.yuzus.length > 0 && (
                      <View style={styles.checkRow}>
                        <Text
                          style={
                            allYuzusCollected
                              ? styles.checkMarkDone
                              : styles.checkMarkMiss
                          }
                        >
                          {allYuzusCollected ? '✓' : '○'}
                        </Text>
                        <Text
                          style={
                            allYuzusCollected
                              ? styles.checkTextDone
                              : styles.checkTextMiss
                          }
                        >
                          {t.winCheckYuzu(
                            gameState.collectedYuzus.length,
                            level.yuzus.length
                          )}
                        </Text>
                      </View>
                    )}
                    <View style={styles.checkRow}>
                      <Text
                        style={
                          withinPar
                            ? styles.checkMarkDone
                            : styles.checkMarkMiss
                        }
                      >
                        {withinPar ? '✓' : '○'}
                      </Text>
                      <Text
                        style={
                          withinPar
                            ? styles.checkTextDone
                            : styles.checkTextMiss
                        }
                      >
                        {t.winCheckPar(gameState.moves, level.parMoves)}
                      </Text>
                    </View>
                  </View>
                </>
              )}

              {/* Newly Unlocked Rewards Banner */}
              {hasAnyUnlocks && recentUnlocks && (
                <View style={styles.unlockBanner}>
                  <Text style={styles.unlockBannerTitle}>
                    {t.unlockedRewardBanner}
                  </Text>
                  {recentUnlocks.chapters.map((name, i) => (
                    <Text key={`ch-${i}`} style={styles.unlockBannerItem}>
                      • {t.unlockedChapterPrefix} {name}
                    </Text>
                  ))}
                  {recentUnlocks.hats.map((name, i) => (
                    <Text key={`hat-${i}`} style={styles.unlockBannerItem}>
                      • {t.unlockedHatPrefix} {name}
                    </Text>
                  ))}
                  {recentUnlocks.decorations.map((name, i) => (
                    <Text key={`dec-${i}`} style={styles.unlockBannerItem}>
                      • {t.unlockedDecorPrefix} {name}
                    </Text>
                  ))}
                  {recentUnlocks.stamps.map((name, i) => (
                    <Text key={`st-${i}`} style={styles.unlockBannerItem}>
                      • {t.unlockedStampPrefix} {name}
                    </Text>
                  ))}
                </View>
              )}

              <View style={styles.winButtons}>
                <CozyButton
                  label={t.replayBtn}
                  variant="soft"
                  onPress={handleRestart}
                  style={{ flex: 1 }}
                />
                {onNextRandomLevel ? (
                  <CozyButton
                    label={isZen ? t.nextZenBtn : t.nextRandomBtn}
                    accentColor={isZen ? PALETTE.sage : chapter.themeColor}
                    onPress={() => {
                      clearAllTimers();
                      isAnimatingRef.current = false;
                      onNextRandomLevel();
                    }}
                    style={{ flex: 1.6 }}
                  />
                ) : nextLevel ? (
                  <CozyButton
                    label={t.nextBtn}
                    accentColor={chapter.themeColor}
                    onPress={() => {
                      clearAllTimers();
                      isAnimatingRef.current = false;
                      onSelectLevel(nextLevel.id);
                    }}
                    style={{ flex: 1.6 }}
                  />
                ) : (
                  <CozyButton
                    label={t.finishBtn}
                    accentColor={chapter.themeColor}
                    onPress={handleBackNav}
                    style={{ flex: 1.6 }}
                  />
                )}
              </View>
            </Animated.View>
          </View>
        </Modal>
      </View>
    </ScreenBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 14,
    paddingTop: 10,
    paddingBottom: 14,
    justifyContent: 'space-between',
  },
  headerWrap: {
    gap: 6,
    paddingHorizontal: 4,
  },
  topNavRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  topLeftGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: RADIUS.pill,
    backgroundColor: PALETTE.creamLight,
    borderWidth: 1.5,
    borderColor: PALETTE.borderWarm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  kickerPill: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: RADIUS.pill,
    borderWidth: 1.5,
  },
  stageKicker: {
    fontFamily: FONTS.bold,
    fontSize: 11,
    letterSpacing: 1.1,
  },
  stageTitle: {
    fontFamily: FONTS.bold,
    fontSize: 22,
    color: PALETTE.espresso,
    paddingHorizontal: 2,
  },
  pillsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  yuzuBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: PALETTE.yuzuLight,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: RADIUS.pill,
    borderWidth: 1,
    borderColor: '#FCD34D',
    gap: 4,
  },
  yuzuText: {
    fontFamily: FONTS.bold,
    fontSize: 12.5,
    color: PALETTE.yuzuDark,
  },
  movesPill: {
    backgroundColor: PALETTE.creamLight,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: RADIUS.pill,
    borderWidth: 1.5,
    borderColor: PALETTE.borderWarm,
    alignItems: 'center',
  },
  movesValue: {
    fontFamily: FONTS.bold,
    fontSize: 12.5,
    color: PALETTE.espresso,
  },
  overParText: {
    color: '#B45309',
  },
  parText: {
    fontFamily: FONTS.medium,
    fontSize: 12,
    color: PALETTE.espressoMuted,
  },
  boardSection: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    marginVertical: 6,
  },
  tutorialBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: PALETTE.creamLight,
    paddingVertical: 7,
    paddingLeft: 12,
    paddingRight: 8,
    borderRadius: RADIUS.md,
    borderWidth: 1.5,
    borderColor: PALETTE.borderWarm,
    maxWidth: 340,
    gap: 8,
  },
  tutorialText: {
    flex: 1,
    fontFamily: FONTS.medium,
    fontSize: 12,
    color: PALETTE.espresso,
    lineHeight: 16,
  },
  tutorialClose: {
    padding: 4,
  },
  softlockBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FDE8E4',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: RADIUS.md,
    borderWidth: 1.5,
    borderColor: PALETTE.terracotta,
    maxWidth: 340,
  },
  softlockText: {
    fontFamily: FONTS.semiBold,
    fontSize: 12.5,
    color: '#7B241C',
    textAlign: 'center',
  },
  controlsArea: {
    width: '100%',
    gap: 10,
    padding: 12,
    borderRadius: RADIUS.xl,
    backgroundColor: 'rgba(255, 251, 242, 0.78)',
    borderWidth: 1.5,
    borderColor: PALETTE.borderWarm,
  },
  actionRow: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-evenly',
    alignItems: 'center',
  },
  circleActionBtn: {
    width: 46,
    height: 46,
    borderRadius: RADIUS.pill,
    backgroundColor: PALETTE.creamLight,
    borderWidth: 1.5,
    borderColor: PALETTE.borderWarm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  softlockHighlightBtn: {
    borderColor: PALETTE.terracotta,
    borderWidth: 2.2,
    backgroundColor: '#FDE8E4',
  },
  hintBtn: {
    backgroundColor: PALETTE.yuzuLight,
    borderColor: '#FCD34D',
  },
  disabledBtn: {
    opacity: 0.4,
  },
  pressed: {
    transform: [{ scale: 0.95 }],
  },
  swipeTipText: {
    fontFamily: FONTS.medium,
    fontSize: 12,
    color: PALETTE.espressoSoft,
    textAlign: 'center',
  },
  dpadRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    gap: 10,
  },
  dpadSideBtn: {
    flex: 1,
    height: 54,
    backgroundColor: PALETTE.creamLight,
    borderRadius: RADIUS.md,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dpadCenterCol: {
    flex: 1,
    gap: 8,
  },
  dpadVertBtn: {
    height: 54,
    backgroundColor: PALETTE.creamLight,
    borderRadius: RADIUS.md,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: PALETTE.overlay,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  winCard: {
    width: '100%',
    maxWidth: 356,
    backgroundColor: PALETTE.creamLight,
    borderRadius: 28,
    padding: 22,
    alignItems: 'center',
    gap: 10,
  },
  winKicker: {
    fontFamily: FONTS.bold,
    fontSize: 12,
    letterSpacing: 1.5,
  },
  winTitle: {
    fontFamily: FONTS.bold,
    fontSize: 23,
    color: PALETTE.espresso,
    textAlign: 'center',
  },
  winMascot: {
    width: 118,
    height: 108,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 2,
  },
  winCapy: {
    position: 'absolute',
    top: 4,
  },
  winStarsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  winChecklist: {
    width: '100%',
    backgroundColor: PALETTE.cream,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: PALETTE.borderWarm,
    paddingHorizontal: 14,
    paddingVertical: 10,
    gap: 5,
  },
  zenWinBox: {
    width: '100%',
    backgroundColor: '#F1F8F3',
    borderRadius: RADIUS.md,
    borderWidth: 1.5,
    borderColor: '#CBE0D3',
    paddingHorizontal: 14,
    paddingVertical: 12,
    alignItems: 'center',
  },
  zenWinText: {
    fontFamily: FONTS.semiBold,
    fontSize: 13.5,
    color: '#3F6254',
    textAlign: 'center',
    lineHeight: 19,
  },
  checkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  checkMarkDone: {
    fontFamily: FONTS.bold,
    fontSize: 14,
    color: '#15803D',
    width: 16,
    textAlign: 'center',
  },
  checkTextDone: {
    fontFamily: FONTS.semiBold,
    fontSize: 13,
    color: PALETTE.espresso,
  },
  checkMarkMiss: {
    fontFamily: FONTS.bold,
    fontSize: 14,
    color: PALETTE.espressoMuted,
    width: 16,
    textAlign: 'center',
  },
  checkTextMiss: {
    fontFamily: FONTS.medium,
    fontSize: 13,
    color: PALETTE.espressoSoft,
  },
  unlockBanner: {
    width: '100%',
    backgroundColor: PALETTE.yuzuLight,
    borderRadius: RADIUS.md,
    borderWidth: 1.5,
    borderColor: '#FCD34D',
    paddingHorizontal: 12,
    paddingVertical: 9,
    gap: 3,
  },
  unlockBannerTitle: {
    fontFamily: FONTS.bold,
    fontSize: 12.5,
    color: PALETTE.yuzuDark,
  },
  unlockBannerItem: {
    fontFamily: FONTS.semiBold,
    fontSize: 12.5,
    color: PALETTE.espresso,
  },
  winButtons: {
    flexDirection: 'row',
    gap: 10,
    width: '100%',
    marginTop: 4,
  },
});
