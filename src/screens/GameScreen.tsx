import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeIn, ZoomIn } from 'react-native-reanimated';
import { CHAPTERS, getLevelById, getNextLevel } from '../data/chapters';
import {
  calculateStars,
  createInitialState,
  solveLevelBFS,
  stepMove,
} from '../engine/solver';
import { Direction, GameState } from '../engine/types';
import { PlayerProgress } from '../storage/progress';
import { CHAPTER_PALETTES, FONTS, PALETTE, RADIUS, SHADOWS } from '../theme';
import { playSfx, triggerHaptic } from '../utils/sound';
import { PuzzleBoard } from '../components/PuzzleBoard';
import { CapybaraSvg } from '../components/svg/CapybaraSvg';
import {
  ArrowIcon,
  CloseIcon,
  HintIcon,
  HomeIcon,
  RestartIcon,
  UndoIcon,
} from '../components/svg/Icons';
import { OnsenSvg, StarSvg, YuzuSvg } from '../components/svg/TileSvg';
import { CozyButton } from '../components/ui/CozyButton';
import { ScreenBackground } from '../components/ui/ScreenBackground';

interface GameScreenProps {
  levelId: string;
  progress: PlayerProgress;
  onWinLevel: (levelId: string, stars: number, moves: number) => void;
  onSelectLevel: (levelId: string) => void;
  onBack: () => void;
  onGoHome: () => void;
}

export const GameScreen: React.FC<GameScreenProps> = ({
  levelId,
  progress,
  onWinLevel,
  onSelectLevel,
  onBack,
  onGoHome,
}) => {
  const level = useMemo(() => getLevelById(levelId)!, [levelId]);
  const chapter = useMemo(
    () => CHAPTERS.find((c) => c.id === level.chapter) ?? CHAPTERS[0],
    [level.chapter]
  );
  const palette = CHAPTER_PALETTES[level.chapter] ?? CHAPTER_PALETTES[1];
  const nextLevel = useMemo(() => getNextLevel(levelId), [levelId]);

  const [gameState, setGameState] = useState<GameState>(() =>
    createInitialState(level)
  );
  const [history, setHistory] = useState<GameState[]>([]);
  const [hintDir, setHintDir] = useState<Direction | null>(null);
  const [winStars, setWinStars] = useState<number>(0);
  const [bumpNonce, setBumpNonce] = useState<number>(0);
  const [yuzuPopNonce, setYuzuPopNonce] = useState<number>(0);
  const [showTutorial, setShowTutorial] = useState<boolean>(
    Boolean(level.hintText)
  );
  const [boardArea, setBoardArea] = useState<{ w: number; h: number } | null>(
    null
  );

  useEffect(() => {
    setGameState(createInitialState(level));
    setHistory([]);
    setHintDir(null);
    setWinStars(0);
    setBumpNonce(0);
    setYuzuPopNonce(0);
    setShowTutorial(Boolean(level.hintText));
  }, [level]);

  const handleMove = useCallback(
    (dir: Direction) => {
      if (gameState.won) return;

      const res = stepMove(level, gameState, dir);
      if (!res.moved) {
        setBumpNonce((n) => n + 1);
        playSfx('bump', progress.soundEnabled);
        triggerHaptic('light', progress.hapticsEnabled);
        return;
      }

      setHintDir(null);
      setHistory((prev) => [...prev, gameState]);
      setGameState(res.nextState);

      if (res.nextState.won) {
        const stars = calculateStars(level, res.nextState);
        setWinStars(stars);
        playSfx('win', progress.soundEnabled);
        triggerHaptic('success', progress.hapticsEnabled);
        onWinLevel(level.id, stars, res.nextState.moves);
      } else if (res.collectedYuzu) {
        setYuzuPopNonce((n) => n + 1);
        playSfx('yuzu', progress.soundEnabled);
        triggerHaptic('medium', progress.hapticsEnabled);
      } else if (res.openedGate) {
        playSfx('button', progress.soundEnabled);
        triggerHaptic('medium', progress.hapticsEnabled);
      } else {
        playSfx('slide', progress.soundEnabled);
        triggerHaptic('light', progress.hapticsEnabled);
      }
    },
    [gameState, level, progress.soundEnabled, progress.hapticsEnabled, onWinLevel]
  );

  const handleUndo = () => {
    if (history.length === 0 || gameState.won) return;
    const prev = history[history.length - 1];
    setHistory((h) => h.slice(0, -1));
    setGameState(prev);
    setHintDir(null);
    triggerHaptic('light', progress.hapticsEnabled);
  };

  const handleRestart = () => {
    setGameState(createInitialState(level));
    setHistory([]);
    setHintDir(null);
    setWinStars(0);
    triggerHaptic('light', progress.hapticsEnabled);
  };

  const handleHint = () => {
    if (gameState.won) return;
    const solution = solveLevelBFS(level, gameState, 8000);
    if (solution.solvable && solution.directions.length > 0) {
      setHintDir(solution.directions[0]);
      triggerHaptic('light', progress.hapticsEnabled);
    }
  };

  return (
    <ScreenBackground
      chapterId={level.chapter}
      reduceMotion={progress.reduceMotion}
    >
      <View style={styles.container}>
        {/* Clean Top Header: Stage Title & Status */}
        <View style={styles.topHeader}>
          <View style={styles.stageTitleBox}>
            <Text style={[styles.stageKicker, { color: palette.primary }]}>
              STAGE {level.stageNumber}
            </Text>
            <Text style={styles.stageTitle} numberOfLines={1}>
              {level.title}
            </Text>
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
                Langkah {gameState.moves}
                <Text style={styles.parText}>/{level.parMoves}</Text>
              </Text>
            </View>
          </View>
        </View>

        {/* Board + Optional Dismissible Tutorial */}
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
              hintDir={hintDir}
              bumpNonce={bumpNonce}
              yuzuPopNonce={yuzuPopNonce}
              reduceMotion={progress.reduceMotion}
              maxSize={Math.min(
                boardArea.w,
                boardArea.h - (showTutorial && level.hintText ? 62 : 8)
              )}
              onSwipe={handleMove}
            />
          )}
          {showTutorial && level.hintText && (
            <Animated.View
              entering={progress.reduceMotion ? undefined : FadeIn.duration(220)}
              style={[styles.tutorialBubble, SHADOWS.soft]}
            >
              <Text style={styles.tutorialText}>{level.hintText}</Text>
              <Pressable
                onPress={() => setShowTutorial(false)}
                hitSlop={10}
                style={styles.tutorialClose}
              >
                <CloseIcon size={16} color={PALETTE.espressoSoft} />
              </Pressable>
            </Animated.View>
          )}
        </View>

        {/* Bottom Controls: Circular Action Icons (Home, Restart, Undo, Hint) + Full-Width D-Pad */}
        <View style={styles.controlsArea}>
          <View style={styles.actionRow}>
            <Pressable
              onPress={onGoHome}
              accessibilityLabel="Menu Utama"
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
              accessibilityLabel="Ulangi"
              style={({ pressed }) => [
                styles.circleActionBtn,
                SHADOWS.soft,
                pressed && styles.pressed,
              ]}
            >
              <RestartIcon size={20} color={palette.primary} />
            </Pressable>

            <Pressable
              onPress={handleUndo}
              disabled={history.length === 0}
              accessibilityLabel="Undo"
              style={({ pressed }) => [
                styles.circleActionBtn,
                SHADOWS.soft,
                history.length === 0 && styles.disabledBtn,
                pressed && history.length > 0 && styles.pressed,
              ]}
            >
              <UndoIcon size={20} color={palette.primary} />
            </Pressable>

            <Pressable
              onPress={handleHint}
              accessibilityLabel="Hint"
              style={({ pressed }) => [
                styles.circleActionBtn,
                styles.hintBtn,
                SHADOWS.soft,
                pressed && styles.pressed,
              ]}
            >
              <HintIcon size={20} color={PALETTE.yuzuDark} />
            </Pressable>
          </View>

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
                <ArrowIcon direction="down" size={26} color={palette.primary} />
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
              <ArrowIcon direction="right" size={28} color={palette.primary} />
            </Pressable>
          </View>
        </View>

        {/* Win Modal */}
        <Modal
          visible={gameState.won}
          transparent
          animationType="fade"
          onRequestClose={onBack}
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
                ONSEN TERCAPAI!
              </Text>
              <Text style={styles.winTitle}>{level.title}</Text>

              <View style={styles.winMascot}>
                <OnsenSvg size={116} />
                <View style={styles.winCapy}>
                  <CapybaraSvg
                    size={86}
                    hasYuzuOnHead={gameState.collectedYuzus.length > 0}
                    happy
                  />
                </View>
              </View>

              <View style={styles.winStarsRow}>
                {[1, 2, 3].map((s) => (
                  <StarSvg key={s} filled={winStars >= s} size={38} />
                ))}
              </View>

              <Text style={styles.winStats}>
                {gameState.moves} langkah • Target {level.parMoves}
              </Text>

              <View style={styles.winButtons}>
                <CozyButton
                  label="Ulangi"
                  variant="soft"
                  onPress={handleRestart}
                  style={{ flex: 1 }}
                />
                {nextLevel ? (
                  <CozyButton
                    label="Lanjut"
                    accentColor={chapter.themeColor}
                    onPress={() => onSelectLevel(nextLevel.id)}
                    style={{ flex: 1.6 }}
                  />
                ) : (
                  <CozyButton
                    label="Selesai"
                    accentColor={chapter.themeColor}
                    onPress={onBack}
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
  topHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
    gap: 8,
  },
  stageTitleBox: {
    flex: 1,
  },
  stageKicker: {
    fontFamily: FONTS.bold,
    fontSize: 11,
    letterSpacing: 1.2,
  },
  stageTitle: {
    fontFamily: FONTS.bold,
    fontSize: 20,
    color: PALETTE.espresso,
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
    marginVertical: 8,
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
  controlsArea: {
    width: '100%',
    gap: 12,
    padding: 12,
    borderRadius: RADIUS.xl,
    backgroundColor: 'rgba(255, 251, 242, 0.72)',
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
  dpadRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    gap: 10,
  },
  dpadSideBtn: {
    flex: 1,
    height: 56,
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
    height: 56,
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
    maxWidth: 350,
    backgroundColor: PALETTE.creamLight,
    borderRadius: 28,
    padding: 24,
    alignItems: 'center',
    gap: 12,
  },
  winKicker: {
    fontFamily: FONTS.bold,
    fontSize: 12,
    letterSpacing: 1.5,
  },
  winTitle: {
    fontFamily: FONTS.bold,
    fontSize: 24,
    color: PALETTE.espresso,
    textAlign: 'center',
  },
  winMascot: {
    width: 124,
    height: 114,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 2,
  },
  winCapy: {
    position: 'absolute',
    top: 2,
  },
  winStarsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  winStats: {
    fontFamily: FONTS.medium,
    fontSize: 14,
    color: PALETTE.espressoSoft,
  },
  winButtons: {
    flexDirection: 'row',
    gap: 10,
    width: '100%',
    marginTop: 6,
  },
});
