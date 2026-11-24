import React, { useEffect } from 'react';
import { StyleSheet, View, useWindowDimensions } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

interface AmbientParticlesProps {
  chapterId: number;
  reduceMotion: boolean;
  variant?: 'default' | 'board';
}

interface ParticleSpec {
  id: number;
  xRatio: number;
  delayMs: number;
  durationMs: number;
  size: number;
  swayAmp: number;
}

const PARTICLE_SPECS: ParticleSpec[] = [
  { id: 0, xRatio: 0.1, delayMs: 0, durationMs: 6800, size: 11, swayAmp: 12 },
  { id: 1, xRatio: 0.24, delayMs: 1200, durationMs: 7400, size: 8, swayAmp: -14 },
  { id: 2, xRatio: 0.39, delayMs: 500, durationMs: 6200, size: 10, swayAmp: 10 },
  { id: 3, xRatio: 0.55, delayMs: 2100, durationMs: 7800, size: 12, swayAmp: -11 },
  { id: 4, xRatio: 0.68, delayMs: 850, durationMs: 6500, size: 9, swayAmp: 15 },
  { id: 5, xRatio: 0.82, delayMs: 1700, durationMs: 7100, size: 11, swayAmp: -13 },
  { id: 6, xRatio: 0.91, delayMs: 2600, durationMs: 6900, size: 8, swayAmp: 9 },
];

interface SingleParticleProps {
  spec: ParticleSpec;
  chapterId: number;
  screenW: number;
  screenH: number;
  maxOpacity: number;
}

const SingleParticle: React.FC<SingleParticleProps> = ({
  spec,
  chapterId,
  screenW,
  screenH,
  maxOpacity,
}) => {
  const progress = useSharedValue(0);
  const sway = useSharedValue(0);

  const isRising = chapterId === 1;
  const isFirefly = chapterId === 5;

  useEffect(() => {
    progress.value = 0;
    sway.value = -1;

    progress.value = withDelay(
      spec.delayMs,
      withRepeat(
        withTiming(1, {
          duration: spec.durationMs,
          easing: Easing.linear,
        }),
        -1,
        false
      )
    );

    sway.value = withDelay(
      spec.delayMs,
      withRepeat(
        withSequence(
          withTiming(1, {
            duration: Math.round(spec.durationMs * 0.5),
            easing: Easing.inOut(Easing.ease),
          }),
          withTiming(-1, {
            duration: Math.round(spec.durationMs * 0.5),
            easing: Easing.inOut(Easing.ease),
          })
        ),
        -1,
        true
      )
    );
  }, [spec.delayMs, spec.durationMs, progress, sway]);

  const baseX = spec.xRatio * screenW;
  const startY = isRising ? screenH * 0.85 : isFirefly ? screenH * (0.2 + (spec.id % 4) * 0.16) : -24;
  const endY = isRising ? screenH * 0.08 : isFirefly ? startY - 36 : screenH + 24;

  const animStyle = useAnimatedStyle(() => {
    const p = progress.value;
    const translateY = startY + (endY - startY) * p;
    const translateX = baseX + sway.value * spec.swayAmp;

    // Smooth fade-in then fade-out envelope
    const fadeIn = Math.min(1, p / 0.18);
    const fadeOut = Math.min(1, (1 - p) / 0.22);
    const twinkle = isFirefly ? 0.65 + 0.35 * Math.sin(p * Math.PI * 4) : 1;
    const opacity = Math.max(0, Math.min(1, Math.min(fadeIn, fadeOut))) * maxOpacity * twinkle;

    const rotateDeg =
      chapterId === 2 || chapterId === 3 ? sway.value * 24 : 0;

    return {
      opacity,
      transform: [
        { translateX },
        { translateY },
        { rotate: `${rotateDeg}deg` },
      ],
    };
  });

  if (chapterId === 1) {
    // Rising soft cream onsen steam puffs
    return (
      <Animated.View
        style={[
          styles.particle,
          {
            width: spec.size * 1.4,
            height: spec.size * 1.4,
            borderRadius: spec.size * 0.7,
            backgroundColor: '#FFFBF2',
          },
          animStyle,
        ]}
      />
    );
  }

  if (chapterId === 2) {
    // Golden sun-motes & tiny sage-green leaves
    const isYuzuMote = spec.id % 2 === 0;
    return (
      <Animated.View
        style={[
          styles.particle,
          isYuzuMote
            ? {
                width: spec.size * 0.9,
                height: spec.size * 0.9,
                borderRadius: spec.size * 0.45,
                backgroundColor: '#F59E0B',
              }
            : {
                width: spec.size * 1.15,
                height: spec.size * 0.7,
                borderTopLeftRadius: spec.size,
                borderBottomRightRadius: spec.size,
                backgroundColor: '#6B9080',
              },
          animStyle,
        ]}
      />
    );
  }

  if (chapterId === 3) {
    // Slender drifting bamboo leaves
    return (
      <Animated.View
        style={[
          styles.particle,
          {
            width: spec.size * 1.4,
            height: spec.size * 0.55,
            borderTopLeftRadius: spec.size,
            borderBottomRightRadius: spec.size,
            backgroundColor: spec.id % 2 === 0 ? '#84CC16' : '#65A30D',
          },
          animStyle,
        ]}
      />
    );
  }

  if (chapterId === 4) {
    // Soft crisp snowflakes
    return (
      <Animated.View
        style={[
          styles.particle,
          {
            width: spec.size * 0.85,
            height: spec.size * 0.85,
            borderRadius: spec.size * 0.425,
            backgroundColor: spec.id % 2 === 0 ? '#FFFFFF' : '#BAE6FD',
            borderWidth: 1,
            borderColor: 'rgba(91, 130, 181, 0.3)',
          },
          animStyle,
        ]}
      />
    );
  }

  // Chapter 5: Glowing warm fireflies
  return (
    <Animated.View
      style={[
        styles.fireflyWrap,
        {
          width: spec.size * 1.8,
          height: spec.size * 1.8,
          borderRadius: spec.size * 0.9,
          backgroundColor: 'rgba(245, 158, 11, 0.28)',
        },
        animStyle,
      ]}
    >
      <View
        style={{
          width: spec.size * 0.72,
          height: spec.size * 0.72,
          borderRadius: spec.size * 0.36,
          backgroundColor: '#FDE68A',
        }}
      />
    </Animated.View>
  );
};

export const AmbientParticles: React.FC<AmbientParticlesProps> = ({
  chapterId,
  reduceMotion,
  variant = 'default',
}) => {
  const { width, height } = useWindowDimensions();

  if (reduceMotion) {
    return null;
  }

  const maxOpacity = variant === 'board' ? 0.36 : 0.62;

  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      {PARTICLE_SPECS.map((spec) => (
        <SingleParticle
          key={`${chapterId}-${spec.id}`}
          spec={spec}
          chapterId={chapterId}
          screenW={width}
          screenH={height}
          maxOpacity={maxOpacity}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  particle: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
  fireflyWrap: {
    position: 'absolute',
    top: 0,
    left: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
