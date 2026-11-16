import React, { useEffect, useMemo, useRef } from 'react';
import { StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  Easing,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { CHAPTER_PALETTES, FONTS, PALETTE, SHADOWS } from '../theme';
import { Direction, GameState, LevelConfig } from '../engine/types';
import { posKey } from '../engine/solver';
import { CapybaraSvg } from './svg/CapybaraSvg';
import { ArrowIcon } from './svg/Icons';
import {
  ButtonSvg,
  GateSvg,
  LogSvg,
  MudSvg,
  OnsenSvg,
  RockSvg,
  StreamSvg,
  YuzuSvg,
} from './svg/TileSvg';

interface PuzzleBoardProps {
  level: LevelConfig;
  gameState: GameState;
  hintDir: Direction | null;
  bumpNonce: number;
  yuzuPopNonce: number;
  reduceMotion?: boolean;
  maxSize?: number;
  onSwipe: (dir: Direction) => void;
}

const STREAM_DIR_MAP: Record<string, Direction> = {
  stream_up: 'up',
  stream_down: 'down',
  stream_left: 'left',
  stream_right: 'right',
};

export const PuzzleBoard: React.FC<PuzzleBoardProps> = ({
  level,
  gameState,
  hintDir,
  bumpNonce,
  yuzuPopNonce,
  reduceMotion = false,
  maxSize,
  onSwipe,
}) => {
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();
  const palette = CHAPTER_PALETTES[level.chapter] ?? CHAPTER_PALETTES[1];

  const boardPadding = 10;
  const framePadding = 12; // wooden frame (6px each side)
  const maxBoardSize = Math.min(
    maxSize !== undefined
      ? maxSize - framePadding
      : screenHeight * 0.5,
    screenWidth - 28 - framePadding,
    460
  );
  const cols = level.gridSize.cols;
  const rows = level.gridSize.rows;
  const maxDim = Math.max(rows, cols);
  const cellSize = Math.floor((maxBoardSize - boardPadding * 2) / maxDim);
  const boardWidth = cellSize * cols + boardPadding * 2;
  const boardHeight = cellSize * rows + boardPadding * 2;

  const prevPosRef = useRef(gameState.capybara);
  const capyX = useSharedValue(gameState.capybara.c * cellSize);
  const capyY = useSharedValue(gameState.capybara.r * cellSize);
  const scaleX = useSharedValue(1);
  const scaleY = useSharedValue(1);
  const popOpacity = useSharedValue(0);
  const popTranslateY = useSharedValue(0);

  // Proportional slide animation + squash/stretch
  useEffect(() => {
    const prev = prevPosRef.current;
    const dist =
      Math.abs(gameState.capybara.r - prev.r) +
      Math.abs(gameState.capybara.c - prev.c);
    prevPosRef.current = gameState.capybara;

    if (reduceMotion || dist === 0) {
      capyX.value = gameState.capybara.c * cellSize;
      capyY.value = gameState.capybara.r * cellSize;
      return;
    }

    const duration = Math.min(260, 75 + dist * 34);
    const horizontal =
      Math.abs(gameState.capybara.c - prev.c) >=
      Math.abs(gameState.capybara.r - prev.r);

    capyX.value = withTiming(gameState.capybara.c * cellSize, {
      duration,
      easing: Easing.out(Easing.cubic),
    });
    capyY.value = withTiming(gameState.capybara.r * cellSize, {
      duration,
      easing: Easing.out(Easing.cubic),
    });

    scaleX.value = withSequence(
      withTiming(horizontal ? 1.12 : 0.92, { duration: duration * 0.45 }),
      withTiming(horizontal ? 0.93 : 1.07, { duration: 75 }),
      withTiming(1, { duration: 90 })
    );
    scaleY.value = withSequence(
      withTiming(horizontal ? 0.92 : 1.12, { duration: duration * 0.45 }),
      withTiming(horizontal ? 1.07 : 0.93, { duration: 75 }),
      withTiming(1, { duration: 90 })
    );
  }, [gameState.capybara, cellSize, reduceMotion, capyX, capyY, scaleX, scaleY]);

  // Bump wobble when hitting an obstacle immediately
  useEffect(() => {
    if (bumpNonce === 0 || reduceMotion) return;
    scaleX.value = withSequence(
      withTiming(1.08, { duration: 55 }),
      withTiming(0.95, { duration: 55 }),
      withTiming(1, { duration: 60 })
    );
  }, [bumpNonce, reduceMotion, scaleX]);

  // +1 Yuzu floating pop
  useEffect(() => {
    if (yuzuPopNonce === 0 || reduceMotion) return;
    popOpacity.value = 1;
    popTranslateY.value = 0;
    popTranslateY.value = withTiming(-26, {
      duration: 520,
      easing: Easing.out(Easing.ease),
    });
    popOpacity.value = withSequence(
      withTiming(1, { duration: 150 }),
      withTiming(0, { duration: 370 })
    );
  }, [yuzuPopNonce, reduceMotion, popOpacity, popTranslateY]);

  const capyAnimatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: capyX.value },
      { translateY: capyY.value },
      { scaleX: scaleX.value },
      { scaleY: scaleY.value },
    ],
  }));

  const popAnimatedStyle = useAnimatedStyle(() => ({
    opacity: popOpacity.value,
    transform: [{ translateY: popTranslateY.value }],
  }));

  const panGesture = useMemo(
    () =>
      Gesture.Pan()
        .minDistance(18)
        .onEnd((e) => {
          const { translationX: dx, translationY: dy } = e;
          if (Math.abs(dx) < 16 && Math.abs(dy) < 16) return;
          if (Math.abs(dx) > Math.abs(dy)) {
            runOnJS(onSwipe)(dx > 0 ? 'right' : 'left');
          } else {
            runOnJS(onSwipe)(dy > 0 ? 'down' : 'up');
          }
        }),
    [onSwipe]
  );

  const collectedSet = useMemo(
    () => new Set(gameState.collectedYuzus),
    [gameState.collectedYuzus]
  );

  const staticTileMap = useMemo(() => {
    const map = new Map<string, string>();
    for (const t of level.tiles) {
      if (t.type !== 'log') {
        map.set(`${t.r},${t.c}`, t.type);
      }
    }
    return map;
  }, [level.tiles]);

  const logSet = useMemo(() => {
    const set = new Set<string>();
    for (const l of gameState.logs) {
      set.add(`${l.r},${l.c}`);
    }
    return set;
  }, [gameState.logs]);

  const yuzuSet = useMemo(() => {
    const set = new Set<string>();
    for (const y of level.yuzus) {
      const k = posKey(y);
      if (!collectedSet.has(k)) {
        set.add(k);
      }
    }
    return set;
  }, [level.yuzus, collectedSet]);

  return (
    <GestureDetector gesture={panGesture}>
      <View
        style={[
          styles.woodenFrame,
          { backgroundColor: palette.boardFrame },
          SHADOWS.card,
        ]}
      >
        <View
          style={[
            styles.board,
            {
              width: boardWidth,
              height: boardHeight,
              padding: boardPadding,
              backgroundColor: palette.boardBg,
            },
          ]}
        >
          {/* Grid cells with subtle checkerboard */}
          {Array.from({ length: rows }).map((_, r) => (
            <View key={`row-${r}`} style={styles.row}>
              {Array.from({ length: cols }).map((__, c) => {
                const key = `${r},${c}`;
                const staticType = staticTileMap.get(key);
                const isGoal = level.goal.r === r && level.goal.c === c;
                const hasLog = logSet.has(key);
                const hasYuzu = yuzuSet.has(key);
                const isAlt = (r + c) % 2 === 1;

                return (
                  <View
                    key={key}
                    style={[
                      styles.cell,
                      {
                        width: cellSize - 4,
                        height: cellSize - 4,
                        margin: 2,
                        backgroundColor: isAlt
                          ? palette.cellAltBg
                          : palette.cellBg,
                      },
                    ]}
                  >
                    {isGoal && <OnsenSvg size={cellSize * 0.85} />}
                    {staticType === 'rock' && (
                      <RockSvg size={cellSize * 0.82} />
                    )}
                    {staticType === 'mud' && <MudSvg size={cellSize * 0.86} />}
                    {staticType === 'button' && (
                      <ButtonSvg
                        pressed={gameState.gateOpen}
                        size={cellSize * 0.78}
                      />
                    )}
                    {staticType === 'gate' && (
                      <GateSvg
                        open={gameState.gateOpen}
                        size={cellSize * 0.82}
                      />
                    )}
                    {staticType && STREAM_DIR_MAP[staticType] && (
                      <StreamSvg
                        direction={STREAM_DIR_MAP[staticType]}
                        size={cellSize * 0.86}
                      />
                    )}
                    {hasLog && (
                      <View style={styles.overlayCenter}>
                        <LogSvg size={cellSize * 0.82} />
                      </View>
                    )}
                    {hasYuzu && (
                      <View style={styles.overlayCenter}>
                        <YuzuSvg size={cellSize * 0.62} />
                      </View>
                    )}
                  </View>
                );
              })}
            </View>
          ))}

          {/* Animated Capybara Layer */}
          <Animated.View
            pointerEvents="none"
            style={[
              styles.capyLayer,
              {
                top: boardPadding,
                left: boardPadding,
                width: cellSize,
                height: cellSize,
              },
              capyAnimatedStyle,
            ]}
          >
            <CapybaraSvg
              size={cellSize * 0.88}
              hasYuzuOnHead={gameState.collectedYuzus.length > 0}
              happy={gameState.won}
            />

            {/* +1 Yuzu Pop */}
            <Animated.View style={[styles.yuzuPop, popAnimatedStyle]}>
              <Text style={styles.yuzuPopText}>+1 Yuzu</Text>
            </Animated.View>

            {/* Hint Arrow */}
            {hintDir && !gameState.won && (
              <View style={[styles.hintBadge, getHintBadgeOffset(hintDir)]}>
                <ArrowIcon
                  direction={hintDir}
                  size={16}
                  color={PALETTE.white}
                />
              </View>
            )}
          </Animated.View>
        </View>
      </View>
    </GestureDetector>
  );
};

function getHintBadgeOffset(dir: Direction) {
  switch (dir) {
    case 'up':
      return { top: -14, alignSelf: 'center' as const };
    case 'down':
      return { bottom: -14, alignSelf: 'center' as const };
    case 'left':
      return { left: -14, top: '32%' as const };
    case 'right':
      return { right: -14, top: '32%' as const };
  }
}

const styles = StyleSheet.create({
  woodenFrame: {
    padding: 6,
    borderRadius: 26,
  },
  board: {
    borderRadius: 20,
    position: 'relative',
  },
  row: {
    flexDirection: 'row',
  },
  cell: {
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  overlayCenter: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  capyLayer: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  yuzuPop: {
    position: 'absolute',
    top: -12,
    backgroundColor: PALETTE.yuzu,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 10,
  },
  yuzuPopText: {
    fontFamily: FONTS.bold,
    fontSize: 11,
    color: PALETTE.white,
  },
  hintBadge: {
    position: 'absolute',
    backgroundColor: PALETTE.yuzu,
    borderRadius: 14,
    padding: 4,
    elevation: 4,
  },
});
