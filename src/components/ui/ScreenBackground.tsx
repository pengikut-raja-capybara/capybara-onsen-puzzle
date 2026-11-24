import React, { useEffect } from 'react';
import { Image, Pressable, StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Circle, Ellipse, G, Path, Rect } from 'react-native-svg';
import { CHAPTER_PALETTES } from '../../theme';
import { triggerHaptic } from '../../utils/sound';
import { AmbientParticles } from './AmbientParticles';

const WASHI_TEXTURE: number = require('../../../assets/textures/washi-grain.png');

interface ScreenBackgroundProps {
  chapterId?: number;
  reduceMotion?: boolean;
  hapticsEnabled?: boolean;
  variant?: 'default' | 'board';
  children: React.ReactNode;
}

interface InteractiveOrnamentProps {
  chapterId: number;
  side: 'leftTop' | 'rightTop' | 'leftMid' | 'rightBottom';
  reduceMotion: boolean;
  hapticsEnabled: boolean;
  variant: 'default' | 'board';
}

const InteractiveOrnament: React.FC<InteractiveOrnamentProps> = ({
  chapterId,
  side,
  reduceMotion,
  hapticsEnabled,
  variant,
}) => {
  const floatY = useSharedValue(0);
  const swayDeg = useSharedValue(0);
  const tapScale = useSharedValue(1);
  const tapSpin = useSharedValue(0);

  useEffect(() => {
    if (reduceMotion) {
      floatY.value = 0;
      swayDeg.value = 0;
      return;
    }
    const durY =
      side === 'leftTop'
        ? 2600
        : side === 'rightTop'
        ? 3100
        : side === 'leftMid'
        ? 2900
        : 3400;
    const ampY = side === 'leftTop' || side === 'rightBottom' ? -10 : 10;

    floatY.value = withRepeat(
      withSequence(
        withTiming(ampY, { duration: durY, easing: Easing.inOut(Easing.ease) }),
        withTiming(0, { duration: durY, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );

    swayDeg.value = withRepeat(
      withSequence(
        withTiming(-6, {
          duration: durY * 0.9,
          easing: Easing.inOut(Easing.ease),
        }),
        withTiming(6, {
          duration: durY * 0.9,
          easing: Easing.inOut(Easing.ease),
        })
      ),
      -1,
      true
    );
  }, [reduceMotion, side, floatY, swayDeg]);

  const handlePress = () => {
    triggerHaptic('light', hapticsEnabled);
    tapScale.value = withSequence(
      withSpring(1.32, { damping: 6, stiffness: 260 }),
      withSpring(1, { damping: 10, stiffness: 180 })
    );
    tapSpin.value = withSequence(
      withTiming(side.startsWith('left') ? 22 : -22, { duration: 110 }),
      withTiming(side.startsWith('left') ? -16 : 16, { duration: 110 }),
      withSpring(0, { damping: 8 })
    );
  };

  const animStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: floatY.value },
      { scale: tapScale.value },
      { rotate: `${swayDeg.value + tapSpin.value}deg` },
    ],
  }));

  const posStyle =
    variant === 'board'
      ? boardVariantStyles[side]
      : styles[side];

  return (
    <Animated.View
      style={[
        posStyle,
        variant === 'board' && styles.boardOrnamentOpacity,
        animStyle,
      ]}
    >
      <Pressable onPress={handlePress}>
        {renderChapterOrnamentSvg(chapterId, side)}
      </Pressable>
    </Animated.View>
  );
};

function renderChapterOrnamentSvg(
  chapterId: number,
  side: 'leftTop' | 'rightTop' | 'leftMid' | 'rightBottom'
) {
  // Chapter 1: Floating Yuzu & Onsen Steam Bubbles
  if (chapterId === 1) {
    if (side === 'leftTop' || side === 'rightBottom') {
      return (
        <Svg width={64} height={64} viewBox="0 0 80 80">
          <Ellipse cx="40" cy="54" rx="26" ry="10" fill="#56CFE1" opacity={0.28} />
          <Circle cx="40" cy="40" r="16" fill="#F59E0B" opacity={0.85} />
          <Circle cx="35" cy="35" r="4" fill="#FDE68A" opacity={0.8} />
          <Path d="M 40 24 Q 50 16 54 24 Q 46 28 40 24 Z" fill="#65A30D" />
        </Svg>
      );
    }
    return (
      <Svg width={72} height={84} viewBox="0 0 80 90">
        <Path
          d="M 28 72 Q 18 52 32 36 T 36 12"
          stroke="#D97757"
          strokeWidth="4.5"
          strokeLinecap="round"
          fill="none"
          opacity={0.32}
        />
        <Path
          d="M 52 78 Q 42 58 56 42 T 60 18"
          stroke="#F3B664"
          strokeWidth="4"
          strokeLinecap="round"
          fill="none"
          opacity={0.38}
        />
        <Circle cx="24" cy="48" r="5" fill="#F3B664" opacity={0.4} />
        <Circle cx="58" cy="30" r="4" fill="#D97757" opacity={0.35} />
      </Svg>
    );
  }

  // Chapter 2: Yuzu Grove Leaves & Hanging Citrus
  if (chapterId === 2) {
    return (
      <Svg width={70} height={70} viewBox="0 0 80 80">
        <Path
          d="M 16 44 Q 34 18 62 26 Q 46 52 16 44 Z"
          fill="#6B9080"
          opacity={0.42}
        />
        <Path
          d="M 20 42 Q 38 32 58 27"
          stroke="#4A6B5D"
          strokeWidth="2"
          fill="none"
          opacity={0.45}
        />
        <Circle cx="52" cy="48" r="12" fill="#F4A261" opacity={0.78} />
        <Circle cx="49" cy="44" r="3" fill="#FDE68A" opacity={0.7} />
      </Svg>
    );
  }

  // Chapter 3: Bamboo Stalks & Cozy Little Duckling / Ripples
  if (chapterId === 3) {
    if (side === 'leftMid' || side === 'rightTop') {
      // Cute floating yellow Onsen duckling on water ripple
      return (
        <Svg width={66} height={66} viewBox="0 0 80 80">
          <Ellipse cx="40" cy="58" rx="26" ry="9" fill="#56CFE1" opacity={0.35} />
          <Ellipse cx="42" cy="48" rx="15" ry="11" fill="#FACC15" opacity={0.9} />
          <Circle cx="32" cy="35" r="9" fill="#FACC15" opacity={0.95} />
          <Path d="M 21 35 L 25 32 L 25 38 Z" fill="#F97316" />
          <Circle cx="30" cy="33" r="1.8" fill="#1E293B" />
        </Svg>
      );
    }
    return (
      <Svg width={64} height={84} viewBox="0 0 70 90">
        <Rect x="28" y="10" width="10" height="70" rx="4" fill="#65A30D" opacity={0.38} />
        <Path d="M 26 34 H 40 M 26 58 H 40" stroke="#365314" strokeWidth="2.5" opacity={0.4} />
        <Path d="M 38 32 Q 56 22 60 32 Q 48 38 38 32 Z" fill="#84CC16" opacity={0.5} />
        <Path d="M 28 54 Q 10 44 8 54 Q 18 60 28 54 Z" fill="#84CC16" opacity={0.5} />
      </Svg>
    );
  }

  // Chapter 4: Sparkling Snowflakes & Ice Crystals
  if (chapterId === 4) {
    return (
      <Svg width={68} height={68} viewBox="0 0 80 80">
        <G stroke="#5B82B5" strokeWidth="3" strokeLinecap="round" opacity={0.45}>
          <Path d="M 40 14 V 66 M 14 40 H 66 M 22 22 L 58 58 M 58 22 L 22 58" />
        </G>
        <Circle cx="40" cy="40" r="6" fill="#90E0EF" opacity={0.7} />
        <Circle cx="40" cy="14" r="3.5" fill="#5B82B5" opacity={0.5} />
        <Circle cx="40" cy="66" r="3.5" fill="#5B82B5" opacity={0.5} />
        <Circle cx="14" cy="40" r="3.5" fill="#5B82B5" opacity={0.5} />
        <Circle cx="66" cy="40" r="3.5" fill="#5B82B5" opacity={0.5} />
      </Svg>
    );
  }

  // Chapter 5: Glowing Festival Paper Lanterns & Fireflies
  return (
    <Svg width={68} height={82} viewBox="0 0 80 90">
      <Circle cx="40" cy="48" r="26" fill="#F59E0B" opacity={0.18} />
      <Path d="M 40 8 V 24" stroke="#6D4527" strokeWidth="2.5" />
      <Rect x="24" y="24" width="32" height="40" rx="14" fill="#EF4444" opacity={0.82} />
      <Ellipse cx="40" cy="44" rx="10" ry="14" fill="#FDE047" opacity={0.75} />
      <Rect x="31" y="21" width="18" height="5" rx="2" fill="#4A3423" />
      <Rect x="31" y="62" width="18" height="5" rx="2" fill="#4A3423" />
      <Path d="M 36 67 V 78 M 40 67 V 80 M 44 67 V 78" stroke="#F59E0B" strokeWidth="2" />
    </Svg>
  );
}

export const ScreenBackground: React.FC<ScreenBackgroundProps> = ({
  chapterId = 1,
  reduceMotion = false,
  hapticsEnabled = true,
  variant = 'default',
  children,
}) => {
  const palette = CHAPTER_PALETTES[chapterId] ?? CHAPTER_PALETTES[1];

  return (
    <LinearGradient
      colors={[palette.bgTop, palette.bgBottom]}
      style={styles.container}
    >
      {/* Tactile Japanese Washi Paper Grain Overlay */}
      <Image
        source={WASHI_TEXTURE}
        resizeMode="repeat"
        pointerEvents="none"
        style={[StyleSheet.absoluteFill, styles.washiOverlay]}
      />

      {/* Living Chapter-Adaptive Ambient Particles */}
      <AmbientParticles
        chapterId={chapterId}
        reduceMotion={reduceMotion}
        variant={variant}
      />

      {/* Background Ornaments Layer (ALWAYS behind UI content) */}
      <View pointerEvents="box-none" style={StyleSheet.absoluteFill}>
        <InteractiveOrnament
          chapterId={chapterId}
          side="leftTop"
          reduceMotion={reduceMotion}
          hapticsEnabled={hapticsEnabled}
          variant={variant}
        />
        <InteractiveOrnament
          chapterId={chapterId}
          side="rightTop"
          reduceMotion={reduceMotion}
          hapticsEnabled={hapticsEnabled}
          variant={variant}
        />
        <InteractiveOrnament
          chapterId={chapterId}
          side="leftMid"
          reduceMotion={reduceMotion}
          hapticsEnabled={hapticsEnabled}
          variant={variant}
        />
        <InteractiveOrnament
          chapterId={chapterId}
          side="rightBottom"
          reduceMotion={reduceMotion}
          hapticsEnabled={hapticsEnabled}
          variant={variant}
        />
      </View>

      {/* Foreground UI Content */}
      {children}
    </LinearGradient>
  );
};

const boardVariantStyles = StyleSheet.create({
  leftTop: {
    position: 'absolute',
    top: 10,
    left: -18,
  },
  rightTop: {
    position: 'absolute',
    top: 10,
    right: -18,
  },
  leftMid: {
    position: 'absolute',
    bottom: 12,
    left: -18,
  },
  rightBottom: {
    position: 'absolute',
    bottom: 12,
    right: -18,
  },
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  washiOverlay: {
    width: '100%',
    height: '100%',
    opacity: 0.24,
  },
  boardOrnamentOpacity: {
    opacity: 0.42,
  },
  leftTop: {
    position: 'absolute',
    top: 72,
    left: -6,
  },
  rightTop: {
    position: 'absolute',
    top: 84,
    right: -6,
  },
  leftMid: {
    position: 'absolute',
    bottom: 190,
    left: -8,
  },
  rightBottom: {
    position: 'absolute',
    bottom: 180,
    right: -6,
  },
});
