import React, { useEffect, useRef } from 'react';
import { StyleSheet, Text, View, useWindowDimensions } from 'react-native';
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
import { FONTS, PALETTE } from '../theme';
import { Language, UI_TEXT } from '../i18n/translations';
import { CapybaraSvg } from '../components/svg/CapybaraSvg';

interface SplashScreenProps {
  language?: Language;
  onFinish: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({
  language = 'id',
  onFinish,
}) => {
  const t = UI_TEXT[language];
  const { width } = useWindowDimensions();
  const onFinishRef = useRef(onFinish);
  onFinishRef.current = onFinish;

  const walkX = useSharedValue(-80);
  const bobY = useSharedValue(0);
  const waddleTilt = useSharedValue(0);
  const progressWidth = useSharedValue(0);

  useEffect(() => {
    const travelDist = Math.min(width * 0.54, 200);

    walkX.value = withTiming(travelDist * 0.45, {
      duration: 2100,
      easing: Easing.inOut(Easing.quad),
    });

    bobY.value = withRepeat(
      withSequence(
        withTiming(-7, { duration: 200, easing: Easing.inOut(Easing.ease) }),
        withTiming(0, { duration: 200, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );

    waddleTilt.value = withRepeat(
      withSequence(
        withTiming(-5, { duration: 200, easing: Easing.inOut(Easing.ease) }),
        withTiming(5, { duration: 200, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );

    progressWidth.value = withTiming(1, {
      duration: 2100,
      easing: Easing.out(Easing.cubic),
    });

    const timer = setTimeout(() => {
      onFinishRef.current();
    }, 2250);

    return () => clearTimeout(timer);
  }, [width, walkX, bobY, waddleTilt, progressWidth]);

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
    <Animated.View exiting={FadeOut.duration(300)} style={styles.root}>
      <LinearGradient
        colors={['#FDF6E9', '#F7E7CE']}
        style={styles.gradient}
      >
        {/* Title */}
        <View style={styles.header}>
          <Text style={styles.kicker}>CAPYBARA ONSEN</Text>
          <Text style={styles.title}>Capybara Onsen:{"\n"}Puzzle</Text>
        </View>

        {/* Walking Capybara (same mascot as Home Screen) */}
        <View style={styles.stageArea}>
          <View style={styles.walkTrack}>
            <Animated.View style={[styles.capyContainer, walkerStyle]}>
              <CapybaraSvg size={112} hasYuzuOnHead happy />
            </Animated.View>
            <View style={styles.groundLine} />
          </View>
        </View>

        {/* Cozy Progress Bar */}
        <View style={styles.footer}>
          <View style={styles.progressTrack}>
            <Animated.View style={[styles.progressFill, barFillStyle]} />
          </View>
          <Text style={styles.loadingText}>{t.splashLoading}</Text>
        </View>
      </LinearGradient>
    </Animated.View>
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
    gap: 10,
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
});
