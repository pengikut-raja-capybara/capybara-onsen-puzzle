import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Circle, Ellipse, Path } from 'react-native-svg';
import { CHAPTER_PALETTES } from '../../theme';

interface ScreenBackgroundProps {
  chapterId?: number;
  reduceMotion?: boolean;
  children: React.ReactNode;
}

export const ScreenBackground: React.FC<ScreenBackgroundProps> = ({
  chapterId = 1,
  reduceMotion = false,
  children,
}) => {
  const palette = CHAPTER_PALETTES[chapterId] ?? CHAPTER_PALETTES[1];

  const drift1 = useSharedValue(0);
  const drift2 = useSharedValue(0);

  useEffect(() => {
    if (reduceMotion) {
      drift1.value = 0;
      drift2.value = 0;
      return;
    }
    drift1.value = withRepeat(
      withSequence(
        withTiming(-12, { duration: 3400, easing: Easing.inOut(Easing.ease) }),
        withTiming(0, { duration: 3400, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );
    drift2.value = withRepeat(
      withSequence(
        withTiming(10, { duration: 4200, easing: Easing.inOut(Easing.ease) }),
        withTiming(0, { duration: 4200, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );
  }, [reduceMotion, drift1, drift2]);

  const anim1 = useAnimatedStyle(() => ({
    transform: [{ translateY: drift1.value }],
  }));

  const anim2 = useAnimatedStyle(() => ({
    transform: [{ translateY: drift2.value }],
  }));

  return (
    <LinearGradient
      colors={[palette.bgTop, palette.bgBottom]}
      style={styles.container}
    >
      {/* Subtle Ambient Decorative Layer */}
      <View pointerEvents="none" style={StyleSheet.absoluteFill}>
        <Animated.View style={[styles.decorTopRight, anim1]}>
          {chapterId === 1 && (
            <Svg width={130} height={130} viewBox="0 0 120 120">
              <Path
                d="M35 90 Q25 65 40 45 T45 15"
                stroke="#E6C9A8"
                strokeWidth="6"
                strokeLinecap="round"
                fill="none"
                opacity={0.45}
              />
              <Path
                d="M70 95 Q60 70 75 50 T80 20"
                stroke="#E6C9A8"
                strokeWidth="5"
                strokeLinecap="round"
                fill="none"
                opacity={0.35}
              />
            </Svg>
          )}
          {chapterId === 2 && (
            <Svg width={120} height={120} viewBox="0 0 120 120">
              <Path
                d="M80 20 Q40 25 30 65 Q70 60 80 20 Z"
                fill="#84A98C"
                opacity={0.22}
              />
              <Circle cx="88" cy="78" r="14" fill="#F4A261" opacity={0.22} />
            </Svg>
          )}
          {chapterId === 3 && (
            <Svg width={120} height={120} viewBox="0 0 120 120">
              <Ellipse
                cx="70"
                cy="55"
                rx="38"
                ry="16"
                stroke="#76B5C5"
                strokeWidth="3"
                fill="none"
                opacity={0.28}
              />
              <Ellipse
                cx="70"
                cy="55"
                rx="22"
                ry="9"
                stroke="#76B5C5"
                strokeWidth="2.5"
                fill="none"
                opacity={0.22}
              />
            </Svg>
          )}
        </Animated.View>

        <Animated.View style={[styles.decorBottomLeft, anim2]}>
          <Svg width={140} height={140} viewBox="0 0 140 140">
            <Circle
              cx="50"
              cy="90"
              r="42"
              fill={palette.accent}
              opacity={0.1}
            />
            <Circle
              cx="95"
              cy="108"
              r="22"
              fill={palette.primary}
              opacity={0.08}
            />
          </Svg>
        </Animated.View>
      </View>

      {children}
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  decorTopRight: {
    position: 'absolute',
    top: 24,
    right: -12,
  },
  decorBottomLeft: {
    position: 'absolute',
    bottom: 12,
    left: -18,
  },
});
