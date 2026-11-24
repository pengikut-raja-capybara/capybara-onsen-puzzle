import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  Easing,
  SharedValue,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { CHAPTER_PALETTES, FONTS, PALETTE, SHADOWS } from '../theme';
import {
  Direction,
  GameState,
  HatId,
  LevelConfig,
  MoveResult,
  Position,
} from '../engine/types';
import { posKey, stepMove } from '../engine/solver';
import { BoardDioramaCorners } from './svg/BoardDioramaSvg';
import { CapybaraSvg, CapyExpression } from './svg/CapybaraSvg';
import { TerrainTileBg } from './svg/TerrainTileBg';
import {
  ButtonSvg,
  GateSvg,
  IceSvg,
  LogSvg,
  MudSvg,
  OnsenSvg,
  PortalSvg,
  RockSvg,
  StreamSvg,
  YuzuSvg,
} from './svg/TileSvg';

interface PuzzleBoardProps {
  level: LevelConfig;
  gameState: GameState;
  lastPath?: Position[];
  lastMoveResult?: MoveResult | null;
  moveNonce?: number;
  hintDir: Direction | null;
  bumpNonce: number;
  yuzuPopNonce?: number;
  equippedHat?: HatId;
  reduceMotion?: boolean;
  maxSize?: number;
  onSwipe: (dir: Direction) => void;
  onDragDirectionChange?: (dir: Direction | null) => void;
}

const STREAM_DIR_MAP: Record<string, Direction> = {
  stream_up: 'up',
  stream_down: 'down',
  stream_left: 'left',
  stream_right: 'right',
};

const STEP_MS = 55;
const PORTAL_JUMP_MS = 15;
const BURST_ANGLES = [0, 60, 120, 180, 240, 300];
const BURST_COLORS: Record<'win' | 'ice' | 'log', string[]> = {
  win: ['#56CFE1', '#F59E0B', '#E8998D', '#8BF6E5', '#FDE68A', '#56CFE1'],
  ice: ['#BAE6FD', '#FFFFFF', '#7DD3FC', '#E0F2FE', '#BAE6FD', '#FFFFFF'],
  log: ['#D6B58D', '#EFE4D2', '#C99E76', '#E5D3BD', '#D6B58D', '#EFE4D2'],
};

interface BurstDotProps {
  angleDeg: number;
  color: string;
  size: number;
  distance: number;
  progress: SharedValue<number>;
}

const BurstDot: React.FC<BurstDotProps> = ({
  angleDeg,
  color,
  size,
  distance,
  progress,
}) => {
  const rad = (angleDeg * Math.PI) / 180;
  const dirX = Math.cos(rad);
  const dirY = Math.sin(rad);

  const animStyle = useAnimatedStyle(() => {
    const p = progress.value;
    const opacity = p <= 0 || p >= 1 ? 0 : Math.sin(p * Math.PI);
    const scale = 0.6 + 0.55 * (1 - p);
    return {
      opacity,
      transform: [
        { translateX: dirX * distance * p },
        { translateY: dirY * distance * p },
        { scale },
      ],
    };
  });

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.burstDot,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: color,
        },
        animStyle,
      ]}
    />
  );
};

export function computeStepArrivalTimes(path: Position[], prev: Position): number[] {
  if (path.length === 0) return [];
  if (path.length === 1) {
    const dist = Math.abs(path[0].r - prev.r) + Math.abs(path[0].c - prev.c);
    return [Math.min(220, 75 + dist * 34)];
  }
  const times: number[] = [];
  let acc = 0;
  let cur = prev;
  for (let i = 0; i < path.length; i++) {
    const pt = path[i];
    const manhattan = Math.abs(pt.r - cur.r) + Math.abs(pt.c - cur.c);
    acc += manhattan > 1 ? PORTAL_JUMP_MS : STEP_MS;
    times.push(acc);
    cur = pt;
  }
  return times;
}

export const PuzzleBoard: React.FC<PuzzleBoardProps> = ({
  level,
  gameState,
  lastPath = [],
  lastMoveResult = null,
  moveNonce = 0,
  hintDir,
  bumpNonce,
  equippedHat = 'yuzu',
  reduceMotion = false,
  maxSize,
  onSwipe,
  onDragDirectionChange,
}) => {
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();
  const palette = CHAPTER_PALETTES[level.chapter] ?? CHAPTER_PALETTES[1];

  const boardPadding = 10;
  const framePadding = 12;
  const maxBoardSize = Math.min(
    maxSize !== undefined ? maxSize - framePadding : screenHeight * 0.5,
    screenWidth - 28 - framePadding,
    460
  );
  const cols = level.gridSize.cols;
  const rows = level.gridSize.rows;
  const maxDim = Math.max(rows, cols);
  const cellSize = Math.floor((maxBoardSize - boardPadding * 2) / maxDim);
  const boardWidth = cellSize * cols + boardPadding * 2;
  const boardHeight = cellSize * rows + boardPadding * 2;

  const [expression, setExpression] = useState<CapyExpression>('normal');
  const [dragDir, setDragDir] = useState<Direction | null>(null);

  // Synchronized visual holdbacks during active slide
  const [pendingYuzuKeys, setPendingYuzuKeys] = useState<string[]>([]);
  const [pendingIceKeys, setPendingIceKeys] = useState<string[]>([]);
  const [pendingGateClosed, setPendingGateClosed] = useState(false);
  const [animatingLogToKey, setAnimatingLogToKey] = useState<string | null>(null);
  const [popPos, setPopPos] = useState<Position>(gameState.capybara);
  const [burstOrigin, setBurstOrigin] = useState<Position | null>(null);
  const [burstKind, setBurstKind] = useState<'win' | 'ice' | 'log'>('win');

  const prevLevelIdRef = useRef(level.id);
  const prevPosRef = useRef(gameState.capybara);
  const syncTimersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  const capyX = useSharedValue(gameState.capybara.c * cellSize);
  const capyY = useSharedValue(gameState.capybara.r * cellSize);
  const shakeX = useSharedValue(0);
  const scaleX = useSharedValue(1);
  const scaleY = useSharedValue(1);
  const idleBreathe = useSharedValue(1);
  const popOpacity = useSharedValue(0);
  const popTranslateY = useSharedValue(0);
  const trailOpacity = useSharedValue(0);
  const ambientPulse = useSharedValue(1);
  const portalSpin = useSharedValue(0);
  const logX = useSharedValue(0);
  const logY = useSharedValue(0);
  const winRippleScale = useSharedValue(0.4);
  const winRippleOpacity = useSharedValue(0);
  const burstProgress = useSharedValue(0);
  const dragDirSV = useSharedValue<'none' | Direction>('none');

  const clearSyncTimers = useCallback(() => {
    for (const timer of syncTimersRef.current) {
      clearTimeout(timer);
    }
    syncTimersRef.current = [];
  }, []);

  const triggerBurstAt = useCallback(
    (pos: Position, kind: 'win' | 'ice' | 'log') => {
      if (reduceMotion) return;
      setBurstOrigin(pos);
      setBurstKind(kind);
      burstProgress.value = 0;
      burstProgress.value = withTiming(1, {
        duration: kind === 'win' ? 650 : 420,
        easing: Easing.out(Easing.cubic),
      });
    },
    [reduceMotion, burstProgress]
  );

  const updateDragDir = useCallback(
    (next: Direction | null) => {
      setDragDir((prev) => {
        if (prev !== next) {
          onDragDirectionChange?.(next);
        }
        return next;
      });
      if (next) {
        setExpression((cur) => (cur === 'sleepy' ? 'normal' : cur));
      }
    },
    [onDragDirectionChange]
  );

  // 8-second cozy sleepy idle expression when player pauses to think
  useEffect(() => {
    if (
      reduceMotion ||
      gameState.won ||
      dragDir !== null ||
      hintDir !== null ||
      expression !== 'normal'
    ) {
      return;
    }
    const sleepyTimer = setTimeout(() => {
      setExpression('sleepy');
    }, 8000);
    return () => clearTimeout(sleepyTimer);
  }, [
    reduceMotion,
    gameState.won,
    dragDir,
    hintDir,
    expression,
    moveNonce,
    bumpNonce,
    level.id,
  ]);

  // Continuous idle breathing for Capybara + ambient board animations
  useEffect(() => {
    if (reduceMotion) {
      idleBreathe.value = 1;
      ambientPulse.value = 1;
      portalSpin.value = 0;
      return;
    }
    idleBreathe.value = withRepeat(
      withSequence(
        withTiming(1.045, { duration: 1100, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 1100, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );
    ambientPulse.value = withRepeat(
      withSequence(
        withTiming(1.07, { duration: 1300, easing: Easing.inOut(Easing.ease) }),
        withTiming(0.96, { duration: 1300, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );
    portalSpin.value = withRepeat(
      withTiming(360, { duration: 3600, easing: Easing.linear }),
      -1,
      false
    );
  }, [reduceMotion, idleBreathe, ambientPulse, portalSpin]);

  // Trigger floating +1 Yuzu pop at a specific board cell
  const triggerYuzuPopAt = useCallback(
    (pos: Position) => {
      setPopPos(pos);
      setExpression('excited');
      const exprT = setTimeout(() => {
        setExpression((cur) =>
          gameState.won ? 'happy' : cur === 'excited' ? 'normal' : cur
        );
      }, 650);
      syncTimersRef.current.push(exprT);

      if (!reduceMotion) {
        popOpacity.value = 1;
        popTranslateY.value = 0;
        popTranslateY.value = withTiming(-28, {
          duration: 540,
          easing: Easing.out(Easing.ease),
        });
        popOpacity.value = withSequence(
          withTiming(1, { duration: 160 }),
          withTiming(0, { duration: 380 })
        );
      }
    },
    [gameState.won, reduceMotion, popOpacity, popTranslateY]
  );

  // Cell-by-cell path animation & synchronized item/ice/gate/log reveals
  useEffect(() => {
    clearSyncTimers();

    if (prevLevelIdRef.current !== level.id) {
      prevLevelIdRef.current = level.id;
      prevPosRef.current = gameState.capybara;
      capyX.value = gameState.capybara.c * cellSize;
      capyY.value = gameState.capybara.r * cellSize;
      setPendingYuzuKeys([]);
      setPendingIceKeys([]);
      setPendingGateClosed(false);
      setAnimatingLogToKey(null);
      setBurstOrigin(null);
      setDragDir(null);
      dragDirSV.value = 'none';
      popOpacity.value = 0;
      burstProgress.value = 0;
      winRippleOpacity.value = 0;
      setExpression(gameState.won ? 'happy' : 'normal');
      return;
    }

    const prev = prevPosRef.current;
    const dist =
      Math.abs(gameState.capybara.r - prev.r) +
      Math.abs(gameState.capybara.c - prev.c);
    prevPosRef.current = gameState.capybara;

    if (!gameState.won) {
      winRippleOpacity.value = 0;
    }

    // Undo, Restart, or reduceMotion snap
    if (reduceMotion || !lastMoveResult || (dist === 0 && lastPath.length === 0)) {
      capyX.value = gameState.capybara.c * cellSize;
      capyY.value = gameState.capybara.r * cellSize;
      setPendingYuzuKeys([]);
      setPendingIceKeys([]);
      setPendingGateClosed(false);
      setAnimatingLogToKey(null);
      setBurstOrigin(null);
      if (reduceMotion || !lastMoveResult) {
        popOpacity.value = 0;
        burstProgress.value = 0;
      }
      if (gameState.won) setExpression('happy');
      else setExpression('normal');
      return;
    }

    const arrivalTimes = computeStepArrivalTimes(lastPath, prev);
    const totalDur =
      arrivalTimes.length > 0
        ? arrivalTimes[arrivalTimes.length - 1]
        : Math.min(220, 75 + dist * 34);

    // Synchronize Yuzu collection timing
    const yuzuSteps = lastMoveResult.collectedYuzuSteps ?? [];
    if (yuzuSteps.length > 0) {
      setPendingYuzuKeys(yuzuSteps.map((s) => s.key));
      for (const item of yuzuSteps) {
        const ms = arrivalTimes[item.stepIndex] ?? totalDur;
        const stepPos = lastPath[item.stepIndex] ?? gameState.capybara;
        const timer = setTimeout(() => {
          setPendingYuzuKeys((cur) => cur.filter((k) => k !== item.key));
          triggerYuzuPopAt(stepPos);
        }, ms);
        syncTimersRef.current.push(timer);
      }
    } else {
      setPendingYuzuKeys([]);
    }

    // Synchronize Thin Ice crack timing + ice crystal burst
    const iceSteps = lastMoveResult.crackedIceSteps ?? [];
    if (iceSteps.length > 0) {
      setPendingIceKeys(iceSteps.map((s) => s.key));
      for (const item of iceSteps) {
        const ms = (arrivalTimes[item.stepIndex] ?? totalDur) + 25;
        const stepPos = lastPath[item.stepIndex] ?? gameState.capybara;
        const timer = setTimeout(() => {
          setPendingIceKeys((cur) => cur.filter((k) => k !== item.key));
          triggerBurstAt(stepPos, 'ice');
        }, ms);
        syncTimersRef.current.push(timer);
      }
    } else {
      setPendingIceKeys([]);
    }

    // Synchronize Gate opening timing
    if (lastMoveResult.openedGate && lastMoveResult.openedGateStep != null) {
      setPendingGateClosed(true);
      const ms = arrivalTimes[lastMoveResult.openedGateStep] ?? totalDur;
      const timer = setTimeout(() => {
        setPendingGateClosed(false);
      }, ms);
      syncTimersRef.current.push(timer);
    } else {
      setPendingGateClosed(false);
    }

    // Smooth Log Push animation + wood puff burst
    if (lastMoveResult.pushedLogMove) {
      const { from, to } = lastMoveResult.pushedLogMove;
      const toKey = posKey(to);
      const contactDelay =
        lastPath.length > 1
          ? arrivalTimes[lastPath.length - 2] ?? Math.max(0, totalDur - STEP_MS)
          : 0;
      const pushDur = lastPath.length > 1 ? 115 : Math.max(115, totalDur);

      setAnimatingLogToKey(toKey);
      logX.value = from.c * cellSize;
      logY.value = from.r * cellSize;
      logX.value = withDelay(
        contactDelay,
        withTiming(to.c * cellSize, {
          duration: pushDur,
          easing: Easing.out(Easing.cubic),
        })
      );
      logY.value = withDelay(
        contactDelay,
        withTiming(to.r * cellSize, {
          duration: pushDur,
          easing: Easing.out(Easing.cubic),
        })
      );

      const puffTimer = setTimeout(() => {
        triggerBurstAt(to, 'log');
      }, contactDelay + Math.round(pushDur * 0.45));
      syncTimersRef.current.push(puffTimer);

      const logDoneTimer = setTimeout(() => {
        setAnimatingLogToKey(null);
      }, contactDelay + pushDur + 15);
      syncTimersRef.current.push(logDoneTimer);
    } else {
      setAnimatingLogToKey(null);
    }

    // Win Onsen water ripple ring + splash sparkle burst upon plopping in
    if (gameState.won) {
      const rippleDelay = Math.max(0, totalDur - 35);
      winRippleScale.value = 0.45;
      winRippleOpacity.value = 0;
      winRippleScale.value = withDelay(
        rippleDelay,
        withTiming(1.85, { duration: 640, easing: Easing.out(Easing.cubic) })
      );
      winRippleOpacity.value = withDelay(
        rippleDelay,
        withSequence(
          withTiming(0.85, { duration: 90 }),
          withTiming(0, { duration: 550, easing: Easing.out(Easing.quad) })
        )
      );
      const winBurstTimer = setTimeout(() => {
        triggerBurstAt(level.goal, 'win');
      }, rippleDelay);
      syncTimersRef.current.push(winBurstTimer);
    }

    // Fade trail along lastPath
    if (lastPath.length > 0) {
      trailOpacity.value = 0.65;
      trailOpacity.value = withTiming(0, { duration: 520 });
    }

    setExpression('sliding');
    const exprTimer = setTimeout(() => {
      setExpression((cur) =>
        gameState.won ? 'happy' : cur === 'sliding' ? 'normal' : cur
      );
    }, totalDur);
    syncTimersRef.current.push(exprTimer);

    if (lastPath.length > 1) {
      const xAnims = [];
      const yAnims = [];
      let cur = prev;

      for (let i = 0; i < lastPath.length; i++) {
        const pt = lastPath[i];
        const manhattan = Math.abs(pt.r - cur.r) + Math.abs(pt.c - cur.c);
        const dur = manhattan > 1 ? PORTAL_JUMP_MS : STEP_MS;
        const isLast = i === lastPath.length - 1;
        const easing = isLast ? Easing.out(Easing.quad) : Easing.linear;
        xAnims.push(withTiming(pt.c * cellSize, { duration: dur, easing }));
        yAnims.push(withTiming(pt.r * cellSize, { duration: dur, easing }));
        cur = pt;
      }

      capyX.value = withSequence(...xAnims);
      capyY.value = withSequence(...yAnims);

      scaleX.value = withSequence(
        withTiming(1.08, { duration: Math.min(120, totalDur * 0.5) }),
        withSpring(1, { damping: 8, stiffness: 200 })
      );
      scaleY.value = withSequence(
        withTiming(0.93, { duration: Math.min(120, totalDur * 0.5) }),
        withSpring(1, { damping: 8, stiffness: 200 })
      );
      return clearSyncTimers;
    }

    const horizontal =
      Math.abs(gameState.capybara.c - prev.c) >=
      Math.abs(gameState.capybara.r - prev.r);

    capyX.value = withTiming(gameState.capybara.c * cellSize, {
      duration: totalDur,
      easing: Easing.out(Easing.cubic),
    });
    capyY.value = withTiming(gameState.capybara.r * cellSize, {
      duration: totalDur,
      easing: Easing.out(Easing.cubic),
    });

    scaleX.value = withSequence(
      withTiming(horizontal ? 1.14 : 0.9, { duration: totalDur * 0.45 }),
      withSpring(1, { damping: 7, stiffness: 220 })
    );
    scaleY.value = withSequence(
      withTiming(horizontal ? 0.9 : 1.14, { duration: totalDur * 0.45 }),
      withSpring(1, { damping: 7, stiffness: 220 })
    );
    return clearSyncTimers;
  }, [
    level.id,
    level.goal,
    moveNonce,
    gameState.capybara,
    gameState.won,
    lastPath,
    lastMoveResult,
    cellSize,
    reduceMotion,
    capyX,
    capyY,
    scaleX,
    scaleY,
    trailOpacity,
    logX,
    logY,
    winRippleScale,
    winRippleOpacity,
    burstProgress,
    dragDirSV,
    clearSyncTimers,
    triggerYuzuPopAt,
    triggerBurstAt,
  ]);

  // Dizzy wince & head-shake when bumping into an obstacle
  useEffect(() => {
    if (bumpNonce === 0) return;
    setExpression('dizzy');
    const t = setTimeout(() => {
      setExpression((cur) => (cur === 'dizzy' ? 'normal' : cur));
    }, 560);

    if (!reduceMotion) {
      shakeX.value = withSequence(
        withTiming(-5, { duration: 45 }),
        withTiming(5, { duration: 45 }),
        withTiming(-4, { duration: 45 }),
        withTiming(3, { duration: 45 }),
        withTiming(0, { duration: 45 })
      );
      scaleX.value = withSequence(
        withTiming(1.1, { duration: 55 }),
        withSpring(1, { damping: 8 })
      );
    }
    return () => clearTimeout(t);
  }, [bumpNonce, reduceMotion, shakeX, scaleX]);

  const capyAnimatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: capyX.value + shakeX.value },
      { translateY: capyY.value },
      { scaleX: scaleX.value * idleBreathe.value },
      { scaleY: scaleY.value * idleBreathe.value },
    ],
  }));

  const logAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: logX.value }, { translateY: logY.value }],
  }));

  const popAnimatedStyle = useAnimatedStyle(() => ({
    opacity: popOpacity.value,
    transform: [{ translateY: popTranslateY.value }],
  }));

  const trailAnimatedStyle = useAnimatedStyle(() => ({
    opacity: trailOpacity.value,
  }));

  const pulseAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: ambientPulse.value }],
  }));

  const portalAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${portalSpin.value}deg` }],
  }));

  const winRippleStyle = useAnimatedStyle(() => ({
    opacity: winRippleOpacity.value,
    transform: [{ scale: winRippleScale.value }],
  }));

  const panGesture = useMemo(
    () =>
      Gesture.Pan()
        .minDistance(10)
        .onUpdate((e) => {
          const { translationX: dx, translationY: dy } = e;
          if (Math.abs(dx) < 14 && Math.abs(dy) < 14) {
            if (dragDirSV.value !== 'none') {
              dragDirSV.value = 'none';
              runOnJS(updateDragDir)(null);
            }
            return;
          }
          if (Math.abs(dx) >= 18 || Math.abs(dy) >= 18) {
            const nextDir: Direction =
              Math.abs(dx) > Math.abs(dy)
                ? dx > 0
                  ? 'right'
                  : 'left'
                : dy > 0
                ? 'down'
                : 'up';
            if (dragDirSV.value !== nextDir) {
              dragDirSV.value = nextDir;
              runOnJS(updateDragDir)(nextDir);
            }
          }
        })
        .onEnd((e) => {
          const { translationX: dx, translationY: dy } = e;
          if (dragDirSV.value !== 'none') {
            dragDirSV.value = 'none';
            runOnJS(updateDragDir)(null);
          }
          if (Math.abs(dx) < 18 && Math.abs(dy) < 18) return;
          if (Math.abs(dx) > Math.abs(dy)) {
            runOnJS(onSwipe)(dx > 0 ? 'right' : 'left');
          } else {
            runOnJS(onSwipe)(dy > 0 ? 'down' : 'up');
          }
        })
        .onFinalize(() => {
          if (dragDirSV.value !== 'none') {
            dragDirSV.value = 'none';
            runOnJS(updateDragDir)(null);
          }
        }),
    [onSwipe, dragDirSV, updateDragDir]
  );

  // Ghost trajectory preview for active drag or hint
  const activePreviewDir = dragDir ?? hintDir;
  const isHintPreview = !dragDir && Boolean(hintDir);

  const { previewSet, previewDestKey } = useMemo(() => {
    const set = new Set<string>();
    let destKey: string | null = null;
    if (activePreviewDir && !gameState.won) {
      const previewRes = stepMove(level, gameState, activePreviewDir);
      if (previewRes.moved && previewRes.path.length > 0) {
        for (const p of previewRes.path) {
          set.add(`${p.r},${p.c}`);
        }
        const last = previewRes.path[previewRes.path.length - 1];
        destKey = `${last.r},${last.c}`;
      }
    }
    return { previewSet: set, previewDestKey: destKey };
  }, [activePreviewDir, level, gameState]);

  const collectedSet = useMemo(
    () => new Set(gameState.collectedYuzus),
    [gameState.collectedYuzus]
  );
  const pendingYuzuSet = useMemo(
    () => new Set(pendingYuzuKeys),
    [pendingYuzuKeys]
  );
  const visualCollectedCount = Math.max(
    0,
    gameState.collectedYuzus.length - pendingYuzuKeys.length
  );

  const brokenIceSet = useMemo(
    () => new Set(gameState.brokenIce),
    [gameState.brokenIce]
  );
  const pendingIceSet = useMemo(
    () => new Set(pendingIceKeys),
    [pendingIceKeys]
  );

  const visualGateOpen = gameState.gateOpen && !pendingGateClosed;

  const trailSet = useMemo(() => {
    const set = new Set<string>();
    for (const p of lastPath) {
      set.add(`${p.r},${p.c}`);
    }
    return set;
  }, [lastPath]);

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
      const k = `${l.r},${l.c}`;
      if (k !== animatingLogToKey) {
        set.add(k);
      }
    }
    return set;
  }, [gameState.logs, animatingLogToKey]);

  const yuzuSet = useMemo(() => {
    const set = new Set<string>();
    for (const y of level.yuzus) {
      const k = posKey(y);
      if (!collectedSet.has(k) || pendingYuzuSet.has(k)) {
        set.add(k);
      }
    }
    return set;
  }, [level.yuzus, collectedSet, pendingYuzuSet]);

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
                const hasTrail = trailSet.has(key);
                const inPreview = previewSet.has(key);
                const isPreviewDest = previewDestKey === key;
                const isAlt = (r + c) % 2 === 1;
                const isBrokenIce =
                  brokenIceSet.has(key) && !pendingIceSet.has(key);

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
                    <TerrainTileBg
                      chapterId={level.chapter}
                      row={r}
                      col={c}
                      size={cellSize - 4}
                    />

                    {/* Fading Water / Step Trail */}
                    {hasTrail && (
                      <Animated.View
                        pointerEvents="none"
                        style={[
                          styles.trailDot,
                          {
                            width: cellSize * 0.24,
                            height: cellSize * 0.24,
                            borderRadius: cellSize * 0.12,
                            backgroundColor: palette.accent,
                          },
                          trailAnimatedStyle,
                        ]}
                      />
                    )}

                    {/* Ghost Trajectory Preview Dots & Destination Ring */}
                    {inPreview && !isPreviewDest && (
                      <View
                        pointerEvents="none"
                        style={[
                          styles.previewDot,
                          {
                            width: cellSize * 0.22,
                            height: cellSize * 0.22,
                            borderRadius: cellSize * 0.11,
                            backgroundColor: isHintPreview
                              ? PALETTE.yuzu
                              : palette.primary,
                            opacity: isHintPreview ? 0.8 : 0.45,
                          },
                        ]}
                      />
                    )}
                    {isPreviewDest && (
                      <View
                        pointerEvents="none"
                        style={[
                          styles.previewDestRing,
                          {
                            width: cellSize * 0.68,
                            height: cellSize * 0.68,
                            borderRadius: cellSize * 0.34,
                            borderColor: isHintPreview
                              ? PALETTE.yuzu
                              : palette.primary,
                            backgroundColor: isHintPreview
                              ? 'rgba(245, 158, 11, 0.18)'
                              : 'rgba(255, 251, 242, 0.45)',
                          },
                        ]}
                      />
                    )}

                    {isGoal && (
                      <>
                        <Animated.View style={pulseAnimatedStyle}>
                          <OnsenSvg size={cellSize * 0.85} />
                        </Animated.View>
                        {!reduceMotion && (
                          <Animated.View
                            pointerEvents="none"
                            style={[
                              styles.winRipple,
                              {
                                width: cellSize * 0.82,
                                height: cellSize * 0.82,
                                borderRadius: cellSize * 0.41,
                              },
                              winRippleStyle,
                            ]}
                          />
                        )}
                      </>
                    )}
                    {staticType === 'rock' && (
                      <RockSvg size={cellSize * 0.82} chapter={level.chapter} />
                    )}
                    {staticType === 'mud' && <MudSvg size={cellSize * 0.86} />}
                    {staticType === 'button' && (
                      <ButtonSvg
                        pressed={visualGateOpen}
                        size={cellSize * 0.78}
                      />
                    )}
                    {staticType === 'gate' && (
                      <GateSvg
                        open={visualGateOpen}
                        size={cellSize * 0.82}
                      />
                    )}
                    {staticType === 'ice' && (
                      <IceSvg
                        broken={isBrokenIce}
                        size={cellSize * 0.86}
                      />
                    )}
                    {staticType === 'portal' && (
                      <Animated.View style={portalAnimatedStyle}>
                        <PortalSvg size={cellSize * 0.84} />
                      </Animated.View>
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
                      <Animated.View
                        style={[styles.overlayCenter, pulseAnimatedStyle]}
                      >
                        <YuzuSvg size={cellSize * 0.62} />
                      </Animated.View>
                    )}
                  </View>
                );
              })}
            </View>
          ))}

          {/* Animated Sliding Log Layer */}
          {animatingLogToKey && (
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
                logAnimatedStyle,
              ]}
            >
              <LogSvg size={cellSize * 0.82} />
            </Animated.View>
          )}

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
              hat={
                equippedHat !== 'none'
                  ? equippedHat
                  : visualCollectedCount > 0
                  ? 'yuzu'
                  : 'none'
              }
              expression={gameState.won ? 'happy' : expression}
              animatedIdle={!reduceMotion}
              inWater={gameState.won}
            />
          </Animated.View>

          {/* Micro-Celebration Burst Particles */}
          {burstOrigin && !reduceMotion && (
            <View
              pointerEvents="none"
              style={[
                styles.burstCenter,
                {
                  top: boardPadding + burstOrigin.r * cellSize + cellSize / 2,
                  left: boardPadding + burstOrigin.c * cellSize + cellSize / 2,
                },
              ]}
            >
              {BURST_ANGLES.map((angle, i) => (
                <BurstDot
                  key={angle}
                  angleDeg={angle}
                  color={BURST_COLORS[burstKind][i]}
                  size={burstKind === 'win' ? 9 : 7}
                  distance={cellSize * (burstKind === 'win' ? 0.65 : 0.48)}
                  progress={burstProgress}
                />
              ))}
            </View>
          )}

          {/* Floating +1 Yuzu Pop at Collected Cell */}
          <Animated.View
            pointerEvents="none"
            style={[
              styles.yuzuPopWrap,
              {
                top: boardPadding + popPos.r * cellSize - 6,
                left: boardPadding + popPos.c * cellSize,
                width: cellSize,
              },
              popAnimatedStyle,
            ]}
          >
            <View style={styles.yuzuPop}>
              <Text style={styles.yuzuPopText}>+1 Yuzu</Text>
            </View>
          </Animated.View>
        </View>

        <BoardDioramaCorners chapter={level.chapter} />
      </View>
    </GestureDetector>
  );
};

const styles = StyleSheet.create({
  woodenFrame: {
    padding: 6,
    borderRadius: 26,
    borderWidth: 2,
    borderColor: 'rgba(74, 52, 35, 0.25)',
    position: 'relative',
  },
  board: {
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: 'rgba(74, 52, 35, 0.14)',
    position: 'relative',
  },
  burstCenter: {
    position: 'absolute',
    width: 0,
    height: 0,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9,
  },
  burstDot: {
    position: 'absolute',
  },
  row: {
    flexDirection: 'row',
  },
  cell: {
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(74, 52, 35, 0.06)',
  },
  trailDot: {
    position: 'absolute',
  },
  previewDot: {
    position: 'absolute',
    zIndex: 2,
  },
  previewDestRing: {
    position: 'absolute',
    borderWidth: 2.5,
    borderStyle: 'dashed',
    zIndex: 2,
  },
  winRipple: {
    position: 'absolute',
    borderWidth: 3,
    borderColor: '#56CFE1',
    backgroundColor: 'rgba(139, 246, 229, 0.28)',
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
  yuzuPopWrap: {
    position: 'absolute',
    alignItems: 'center',
    zIndex: 10,
  },
  yuzuPop: {
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
});
