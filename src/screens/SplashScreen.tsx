import React, { useCallback, useEffect, useRef } from 'react';
import { Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  Easing,
  FadeOut,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Circle, Ellipse, Path, Rect } from 'react-native-svg';
import { HatId } from '../engine/types';
import { FONTS, PALETTE } from '../theme';
import { Language, UI_TEXT } from '../i18n/translations';
import { CapybaraSvg } from '../components/svg/CapybaraSvg';
import { AmbientParticles } from '../components/ui/AmbientParticles';

const OUTLINE = '#4A3423';

interface SplashScreenProps {
  language?: Language;
  equippedHat?: HatId;
  reduceMotion?: boolean;
  onFinish: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({
  language = 'id',
  equippedHat = 'yuzu',
  reduceMotion = false,
  onFinish,
}) => {
  const t = UI_TEXT[language];
  const { width } = useWindowDimensions();
  const activeHat: HatId = equippedHat === 'none' ? 'yuzu' : equippedHat;
  const onFinishRef = useRef(onFinish);
  onFinishRef.current = onFinish;
  const finishedRef = useRef(false);

  const walkX = useSharedValue(reduceMotion ? 0 : -60);
  const bobY = useSharedValue(0);
  const waddleTilt = useSharedValue(0);
  const progressWidth = useSharedValue(reduceMotion ? 1 : 0);

  const finishOnce = useCallback(() => {
    if (finishedRef.current) return;
    finishedRef.current = true;
    onFinishRef.current();
  }, []);

  useEffect(() => {
    const durationMs = reduceMotion ? 400 : 1100;
    const animMs = reduceMotion ? 250 : 950;

    if (!reduceMotion) {
      const travelDist = Math.min(width * 0.45, 160);

      walkX.value = withTiming(travelDist * 0.35, {
        duration: animMs,
        easing: Easing.inOut(Easing.quad),
      });

      bobY.value = withRepeat(
        withSequence(
          withTiming(-6, { duration: 180, easing: Easing.inOut(Easing.ease) }),
          withTiming(0, { duration: 180, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        true
      );

      waddleTilt.value = withRepeat(
        withSequence(
          withTiming(-5, { duration: 180, easing: Easing.inOut(Easing.ease) }),
          withTiming(5, { duration: 180, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        true
      );

      progressWidth.value = withTiming(1, {
        duration: animMs,
        easing: Easing.out(Easing.cubic),
      });
    } else {
      walkX.value = 0;
      progressWidth.value = 1;
    }

    const timer = setTimeout(finishOnce, durationMs);
    return () => clearTimeout(timer);
  }, [width, reduceMotion, walkX, bobY, waddleTilt, progressWidth, finishOnce]);

  const walkerStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: walkX.value },
      { translateY: bobY.value },
      { rotate: `${waddleTilt.value}deg` },
    ],
  }));

  const barFillStyle = useAnimatedStyle(() => ({
    width: `${progressWidth.value * 100}%`,
  }));

  return (
    <Pressable style={styles.root} onPress={finishOnce}>
      <Animated.View
        exiting={reduceMotion ? undefined : FadeOut.duration(220)}
        style={styles.root}
      >
        <LinearGradient
          colors={['#FDF6E9', '#F7E7CE']}
          style={styles.gradient}
        >
          {/* Floating warm particles (steam, yuzu, petals) */}
          <AmbientParticles chapterId={1} reduceMotion={reduceMotion} />

          {/* Top-left sakura bough */}
          <View pointerEvents="none" style={styles.topLeftDecor}>
            <Svg width={116} height={74} viewBox="0 0 116 74">
              <Path d="M -4 18 Q 42 28 96 14" stroke="#6D4527" strokeWidth="4.5" strokeLinecap="round" fill="none" />
              <Circle cx="24" cy="21" r="7.5" fill="#F9A8D4" stroke={OUTLINE} strokeWidth="1.5" />
              <Circle cx="24" cy="21" r="2.4" fill="#FBBF24" />
              <Circle cx="54" cy="20" r="6.8" fill="#FBCFE8" stroke={OUTLINE} strokeWidth="1.5" />
              <Circle cx="54" cy="20" r="2.2" fill="#FBBF24" />
              <Circle cx="82" cy="15" r="5.5" fill="#F472B6" stroke={OUTLINE} strokeWidth="1.5" />
              <Ellipse cx="36" cy="48" rx="3.2" ry="2" fill="#F9A8D4" opacity={0.85} />
              <Ellipse cx="72" cy="42" rx="2.8" ry="1.8" fill="#F472B6" opacity={0.85} />
            </Svg>
          </View>

          {/* Top-right hanging paper lantern */}
          <View pointerEvents="none" style={styles.topRightDecor}>
            <Svg width={56} height={76} viewBox="0 0 56 76">
              <Circle cx="28" cy="44" r="22" fill="#F59E0B" opacity={0.18} />
              <Path d="M 28 0 V 22" stroke={OUTLINE} strokeWidth="2.2" />
              <Rect x="17" y="22" width="22" height="28" rx="9" fill="#E05A47" stroke={OUTLINE} strokeWidth="2" />
              <Ellipse cx="28" cy="36" rx="7" ry="9.5" fill="#FDE68A" opacity={0.88} />
              <Rect x="21" y="20" width="14" height="4" rx="1.4" fill={OUTLINE} />
              <Rect x="21" y="48" width="14" height="4" rx="1.4" fill={OUTLINE} />
              <Path d="M 28 52 V 60" stroke="#E05A47" strokeWidth="2.4" strokeLinecap="round" />
            </Svg>
          </View>

          {/* Title */}
          <View style={styles.header}>
            <Text style={styles.kicker}>{t.homeKicker}</Text>
            <Text style={styles.title}>Capybara Onsen:{"\n"}Puzzle</Text>
          </View>

          {/* Walking Capybara in Lively Onsen Garden */}
          <View style={styles.stageArea}>
            <View style={styles.walkTrack}>
              {/* Scenic Onsen Garden Backdrop */}
              <View pointerEvents="none" style={styles.scenicBg}>
                <Svg width={300} height={126} viewBox="0 0 300 126">
                  {/* Soft distant hills */}
                  <Path d="M 0 116 Q 75 72 155 110 Q 230 74 300 114 V 126 H 0 Z" fill="#EAD8BF" opacity={0.65} />
                  {/* Cozy wooden Onsen gate silhouette */}
                  <Rect x="206" y="42" width="7" height="76" rx="3" fill="#B58050" stroke={OUTLINE} strokeWidth="1.6" />
                  <Rect x="266" y="42" width="7" height="76" rx="3" fill="#B58050" stroke={OUTLINE} strokeWidth="1.6" />
                  <Rect x="196" y="36" width="88" height="8" rx="4" fill="#8F5F38" stroke={OUTLINE} strokeWidth="1.6" />
                  <Rect x="202" y="52" width="76" height="5" rx="2.5" fill="#A67449" stroke={OUTLINE} strokeWidth="1.4" />
                  {/* Hanging noren cloth */}
                  <Rect x="220" y="57" width="18" height="18" rx="3" fill="#4A7C9B" stroke={OUTLINE} strokeWidth="1.4" />
                  <Rect x="241" y="57" width="18" height="18" rx="3" fill="#D97757" stroke={OUTLINE} strokeWidth="1.4" />
                  {/* Mossy stone & bamboo sprout on left */}
                  <Ellipse cx="28" cy="114" rx="18" ry="10" fill="#858D9D" stroke={OUTLINE} strokeWidth="1.8" />
                  <Path d="M 16 110 Q 28 103 40 110" stroke="#6B9080" strokeWidth="3.5" strokeLinecap="round" fill="none" />
                  {/* Grass tufts */}
                  <Path d="M 56 118 L 59 108 L 63 117 L 67 109 L 70 118" stroke="#6B9080" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                  <Path d="M 176 118 L 179 110 L 183 118" stroke="#6B9080" strokeWidth="2" strokeLinecap="round" fill="none" />
                  {/* Waiting mini Yuzu & rubber duckling */}
                  <Circle cx="242" cy="112" r="8" fill="#F59E0B" stroke={OUTLINE} strokeWidth="1.6" />
                  <Path d="M 242 104 Q 248 100 250 105 Q 245 107 242 104 Z" fill="#65A30D" stroke={OUTLINE} strokeWidth="1.2" />
                  <Ellipse cx="282" cy="115" rx="12" ry="7" fill="#C9A882" opacity={0.7} />
                </Svg>
              </View>

              <Animated.View style={[styles.capyContainer, walkerStyle]}>
                <CapybaraSvg
                  size={112}
                  hat={activeHat}
                  happy
                  animatedIdle={!reduceMotion}
                />
              </Animated.View>
              <View style={styles.groundLine} />
            </View>
          </View>

          {/* Cozy Progress Bar + Tap Skip */}
          <View style={styles.footer}>
            <View style={styles.progressTrack}>
              <Animated.View style={[styles.progressFill, barFillStyle]} />
            </View>
            <Text style={styles.loadingText}>{t.splashLoading}</Text>
            <Text style={styles.tapSkipText}>{t.splashTapSkip}</Text>
          </View>
        </LinearGradient>
      </Animated.View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  gradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 64,
    paddingHorizontal: 32,
  },
  header: {
    alignItems: 'center',
    marginTop: 20,
  },
  kicker: {
    fontFamily: FONTS.bold,
    fontSize: 12,
    letterSpacing: 2.5,
    color: PALETTE.terracotta,
    marginBottom: 6,
  },
  title: {
    fontFamily: FONTS.bold,
    fontSize: 34,
    lineHeight: 40,
    color: PALETTE.espresso,
    textAlign: 'center',
  },
  stageArea: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  walkTrack: {
    width: '100%',
    maxWidth: 300,
    height: 126,
    justifyContent: 'flex-end',
    alignItems: 'center',
    position: 'relative',
  },
  topLeftDecor: {
    position: 'absolute',
    top: 8,
    left: 0,
  },
  topRightDecor: {
    position: 'absolute',
    top: 0,
    right: 14,
  },
  scenicBg: {
    position: 'absolute',
    bottom: 2,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  capyContainer: {
    marginBottom: -10,
  },
  groundLine: {
    width: '100%',
    height: 6,
    borderRadius: 3,
    backgroundColor: '#E5D3BD',
  },
  footer: {
    width: '100%',
    maxWidth: 240,
    alignItems: 'center',
    gap: 8,
  },
  progressTrack: {
    width: '100%',
    height: 8,
    borderRadius: 4,
    backgroundColor: '#EADBC8',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
    backgroundColor: PALETTE.terracotta,
  },
  loadingText: {
    fontFamily: FONTS.medium,
    fontSize: 13,
    color: PALETTE.espressoSoft,
  },
  tapSkipText: {
    fontFamily: FONTS.regular,
    fontSize: 11.5,
    color: PALETTE.espressoMuted,
  },
});
