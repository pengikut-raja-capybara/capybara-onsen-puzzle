import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import Animated, {
  Easing,
  FadeIn,
  FadeOut,
  SharedValue,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Circle, Ellipse, G, Path, Rect } from 'react-native-svg';
import { DecorationId, HatId } from '../../engine/types';
import { Language, UI_TEXT } from '../../i18n/translations';
import { FONTS, PALETTE, RADIUS, SHADOWS } from '../../theme';
import { playSfx, triggerHaptic } from '../../utils/sound';
import { CapybaraSvg, CapyExpression } from '../svg/CapybaraSvg';
import { HeartIcon } from '../svg/Icons';

const OUTLINE = '#4A3423';
const OUTLINE_SOFT = '#5C4033';

const SAKURA_ANGLES = [0, 72, 144, 216, 288].map((deg) => (deg * Math.PI) / 180);

const SakuraFlower: React.FC<{
  cx: number;
  cy: number;
  r: number;
  fill: string;
  centerFill?: string;
}> = ({ cx, cy, r, fill, centerFill = '#FBBF24' }) => (
  <G>
    {SAKURA_ANGLES.map((rad, idx) => (
      <Circle
        key={idx}
        cx={cx + Math.cos(rad) * r * 0.46}
        cy={cy + Math.sin(rad) * r * 0.46}
        r={r * 0.48}
        fill={fill}
        stroke={OUTLINE}
        strokeWidth="1.15"
      />
    ))}
    {/* Soft inner petal fill to hide internal stroke seams */}
    <Circle cx={cx} cy={cy} r={r * 0.56} fill={fill} />
    <Circle cx={cx} cy={cy} r={r * 0.27} fill={centerFill} />
  </G>
);

export const DecorationThumbnail: React.FC<{ id: DecorationId; size?: number }> = ({
  id,
  size = 44,
}) => {
  switch (id) {
    case 'rubber_duck':
      return (
        <Svg width={size} height={size} viewBox="0 0 60 60">
          <Ellipse cx="30" cy="46" rx="19" ry="6" fill="#56CFE1" opacity={0.4} />
          <Path d="M 16 46 Q 30 50 44 46" stroke="#FFFBF2" strokeWidth="1.8" strokeLinecap="round" fill="none" opacity={0.85} />
          <Ellipse cx="32" cy="36" rx="14" ry="10" fill="#FACC15" stroke={OUTLINE} strokeWidth="2.2" />
          <Path d="M 28 34 Q 37 33 39 39 Q 32 42 28 34 Z" fill="#EAB308" stroke={OUTLINE} strokeWidth="1.5" strokeLinejoin="round" />
          <Circle cx="23" cy="24" r="8.5" fill="#FACC15" stroke={OUTLINE} strokeWidth="2.2" />
          <Path d="M 11 24 L 16 21 L 16 27 Z" fill="#F97316" stroke={OUTLINE} strokeWidth="1.6" strokeLinejoin="round" />
          <Circle cx="21" cy="22" r="1.7" fill="#2B1A0E" />
          <Circle cx="20.4" cy="21.3" r="0.7" fill="#FFFFFF" />
        </Svg>
      );
    case 'bamboo_fountain':
      return (
        <Svg width={size} height={size} viewBox="0 0 60 60">
          <Rect x="32" y="16" width="9" height="32" rx="3" fill="#65A30D" stroke={OUTLINE} strokeWidth="2" />
          <Path d="M 32.5 26 H 40.5 M 32.5 37 H 40.5" stroke="#3F6212" strokeWidth="1.8" />
          <Path d="M 12 24 L 38 14 L 41 21 L 15 31 Z" fill="#84CC16" stroke={OUTLINE} strokeWidth="2" strokeLinejoin="round" />
          <Path d="M 24 19 L 26.8 25.8" stroke="#4D7C0F" strokeWidth="1.7" />
          <Path d="M 31.8 16 L 40.8 21.2 M 31.8 21.8 L 40.4 16.5" stroke="#6D4527" strokeWidth="2.2" strokeLinecap="round" />
          <Path d="M 13 29 Q 12 39 14 46" stroke="#56CFE1" strokeWidth="3.2" strokeLinecap="round" fill="none" />
          <Ellipse cx="15" cy="48" rx="9" ry="3.5" fill="#8BF6E5" opacity={0.7} />
        </Svg>
      );
    case 'floating_yuzus':
      return (
        <Svg width={size} height={size} viewBox="0 0 60 60">
          <Ellipse cx="30" cy="42" rx="22" ry="8" fill="#56CFE1" opacity={0.42} />
          <Circle cx="20" cy="35" r="8.5" fill="#F59E0B" stroke={OUTLINE} strokeWidth="2" />
          <Circle cx="39" cy="37" r="7.5" fill="#F59E0B" stroke={OUTLINE} strokeWidth="2" />
          <Circle cx="30" cy="27" r="9" fill="#FBBF24" stroke={OUTLINE} strokeWidth="2" />
          <Path d="M 30 18 Q 36 13 39 18 Q 34 21 30 18 Z" fill="#65A30D" stroke={OUTLINE} strokeWidth="1.4" />
        </Svg>
      );
    case 'sakura_branch':
      return (
        <Svg width={size} height={size} viewBox="0 0 60 60">
          <Path d="M 8 20 Q 28 24 50 16" stroke="#6D4527" strokeWidth="4.2" strokeLinecap="round" fill="none" />
          <Path d="M 13 18 Q 10 10 19 12 Q 18 17 13 18 Z" fill="#84CC16" stroke={OUTLINE} strokeWidth="1.2" />
          <Path d="M 42 15 Q 48 8 53 13 Q 48 17 42 15 Z" fill="#65A30D" stroke={OUTLINE} strokeWidth="1.2" />
          <SakuraFlower cx={22} cy={21} r={8} fill="#F9A8D4" />
          <SakuraFlower cx={39} cy={18} r={7.2} fill="#F472B6" centerFill="#FDE68A" />
          <Ellipse cx="16" cy="39" rx="3.2" ry="2" fill="#F9A8D4" />
          <Ellipse cx="42" cy="42" rx="3" ry="1.8" fill="#F472B6" />
        </Svg>
      );
    case 'paper_lantern':
      return (
        <Svg width={size} height={size} viewBox="0 0 60 60">
          <Circle cx="30" cy="32" r="20" fill="#F59E0B" opacity={0.2} />
          <Path d="M 30 6 V 15" stroke={OUTLINE} strokeWidth="2.2" />
          <Rect x="18" y="15" width="24" height="28" rx="10" fill="#E05A47" stroke={OUTLINE} strokeWidth="2.2" />
          <Ellipse cx="30" cy="29" rx="7.5" ry="10" fill="#FDE68A" opacity={0.85} />
          <Rect x="22" y="13" width="16" height="4" rx="1.5" fill={OUTLINE} />
          <Rect x="22" y="41" width="16" height="4" rx="1.5" fill={OUTLINE} />
        </Svg>
      );
    case 'baby_capy':
      return (
        <Svg width={size} height={size} viewBox="0 0 60 60">
          <CapybaraSvg size={60} hat="none" happy animatedIdle={false} />
        </Svg>
      );
  }
};

interface FloatingHeartProps {
  progress: SharedValue<number>;
  offsetX: number;
  targetY: number;
}

const FloatingHeart: React.FC<FloatingHeartProps> = ({
  progress,
  offsetX,
  targetY,
}) => {
  const animStyle = useAnimatedStyle(() => {
    const p = progress.value;
    const opacity = p <= 0 || p >= 1 ? 0 : Math.sin(p * Math.PI);
    const scale = 0.65 + 0.45 * Math.sin(p * Math.PI);
    return {
      opacity,
      transform: [
        { translateX: offsetX * p },
        { translateY: targetY * p },
        { scale },
      ],
    };
  });

  return (
    <Animated.View pointerEvents="none" style={[styles.heartItem, animStyle]}>
      <HeartIcon size={16} color="#E05A47" />
    </Animated.View>
  );
};

const SanctuaryPoolSvg: React.FC<{ width: number; height: number }> = ({
  width,
  height,
}) => (
  <Svg width={width} height={height} viewBox="0 0 320 152">
    {/* Soft ground shadow */}
    <Ellipse cx="160" cy="142" rx="148" ry="8.5" fill="rgba(74, 52, 35, 0.16)" />
    {/* 3D outer Hinoki cedar wall */}
    <Rect
      x="8"
      y="30"
      width="304"
      height="110"
      rx="44"
      fill="#8F5F38"
      stroke={OUTLINE}
      strokeWidth="2.8"
    />
    {/* Front outer vertical wooden stave lines */}
    <Path
      d="M 68 127 V 139 M 114 127 V 139 M 160 127 V 139 M 206 127 V 139 M 252 127 V 139"
      stroke="#6B4324"
      strokeWidth="1.8"
      strokeLinecap="round"
      opacity={0.45}
    />
    {/* Top wooden Hinoki rim deck */}
    <Rect
      x="8"
      y="18"
      width="304"
      height="110"
      rx="44"
      fill="#B58050"
      stroke={OUTLINE}
      strokeWidth="2.8"
    />
    {/* Corner & center rim plank seams */}
    <Path
      d="M 44 19 L 49 27 M 276 19 L 271 27 M 44 127 L 49 119 M 276 127 L 271 119 M 160 19 L 160 26 M 160 119 L 160 127"
      stroke={OUTLINE_SOFT}
      strokeWidth="2"
      strokeLinecap="round"
      opacity={0.5}
    />
    {/* Inner rim bevel */}
    <Rect
      x="18"
      y="26"
      width="284"
      height="94"
      rx="36"
      fill="#CFA173"
      stroke={OUTLINE_SOFT}
      strokeWidth="1.8"
    />
    {/* Wide warm turquoise-jade water basin */}
    <Rect
      x="25"
      y="33"
      width="270"
      height="80"
      rx="30"
      fill="#4CC9D8"
      stroke="#318E9B"
      strokeWidth="1.8"
    />
    {/* Soft aqua center glow */}
    <Ellipse cx="160" cy="73" rx="112" ry="27" fill="#8BF6E5" opacity={0.36} />
    {/* Gentle cream-white water ripples */}
    <Path
      d="M 58 63 Q 84 58 110 63 M 210 63 Q 236 58 262 63 M 122 96 Q 160 101 198 96"
      stroke="#FFFBF2"
      strokeWidth="2"
      strokeLinecap="round"
      fill="none"
      opacity={0.55}
    />
    {/* Three rising cream-white steam wisps above the water */}
    <Path
      d="M 94 26 Q 89 16 95 6 M 160 22 Q 166 13 160 4 M 226 26 Q 221 16 227 6"
      stroke="#FFFBF2"
      strokeWidth="3"
      strokeLinecap="round"
      fill="none"
      opacity={0.85}
    />
  </Svg>
);

interface OnsenSanctuaryProps {
  equippedHat: HatId;
  equippedDecorations: DecorationId[];
  language: Language;
  soundEnabled: boolean;
  hapticsEnabled: boolean;
  reduceMotion: boolean;
  interactive?: boolean;
  compact?: boolean;
}

export const OnsenSanctuary: React.FC<OnsenSanctuaryProps> = ({
  equippedHat,
  equippedDecorations,
  language,
  soundEnabled,
  hapticsEnabled,
  reduceMotion,
  interactive = false,
  compact = false,
}) => {
  const { width: winWidth, height: winHeight } = useWindowDimensions();
  const s = compact
    ? 0.5
    : Math.min(
        1.08,
        (winWidth - 28) / 320,
        winHeight < 720 ? 0.84 : winHeight < 790 ? 0.94 : winHeight >= 860 ? 1.08 : 1.02
      );
  const decorSet = new Set(equippedDecorations);
  const quotes = UI_TEXT[language].cozyQuotes;

  const [mascotExpr, setMascotExpr] = useState<CapyExpression>('happy');
  const [quoteText, setQuoteText] = useState<string | null>(null);
  const quoteIndexRef = useRef(0);
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  const bobY = useSharedValue(0);
  const decorBobY = useSharedValue(0);
  const mascotScale = useSharedValue(1);
  const mascotRotate = useSharedValue(0);
  const duckScale = useSharedValue(1);
  const babyScale = useSharedValue(1);
  const heart1 = useSharedValue(0);
  const heart2 = useSharedValue(0);
  const heart3 = useSharedValue(0);

  const clearTimers = useCallback(() => {
    for (const t of timersRef.current) {
      clearTimeout(t);
    }
    timersRef.current = [];
  }, []);

  useEffect(() => {
    return clearTimers;
  }, [clearTimers]);

  useEffect(() => {
    if (reduceMotion) {
      bobY.value = 0;
      decorBobY.value = 0;
      return;
    }
    bobY.value = withRepeat(
      withSequence(
        withTiming(-6 * s, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
        withTiming(0, { duration: 1500, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );
    decorBobY.value = withRepeat(
      withSequence(
        withTiming(-4 * s, { duration: 1200, easing: Easing.inOut(Easing.ease) }),
        withTiming(2 * s, { duration: 1200, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );
  }, [reduceMotion, s, bobY, decorBobY]);

  const handleTapMascot = () => {
    if (!interactive) return;
    clearTimers();
    playSfx('yuzu', soundEnabled);
    triggerHaptic('light', hapticsEnabled);

    setMascotExpr('excited');
    const exprTimer = setTimeout(() => setMascotExpr('happy'), 900);
    timersRef.current.push(exprTimer);

    const nextQuote = quotes[quoteIndexRef.current % quotes.length];
    quoteIndexRef.current += 1;
    setQuoteText(nextQuote);
    const quoteTimer = setTimeout(() => setQuoteText(null), 2600);
    timersRef.current.push(quoteTimer);

    if (!reduceMotion) {
      mascotScale.value = withSequence(
        withSpring(1.16, { damping: 6, stiffness: 260 }),
        withSpring(1, { damping: 9, stiffness: 180 })
      );
      mascotRotate.value = withSequence(
        withTiming(-8, { duration: 90 }),
        withTiming(8, { duration: 90 }),
        withSpring(0, { damping: 8 })
      );

      heart1.value = 0;
      heart2.value = 0;
      heart3.value = 0;
      heart1.value = withTiming(1, { duration: 950, easing: Easing.out(Easing.quad) });
      heart2.value = withDelay(110, withTiming(1, { duration: 1000, easing: Easing.out(Easing.quad) }));
      heart3.value = withDelay(220, withTiming(1, { duration: 1050, easing: Easing.out(Easing.quad) }));
    }
  };

  const handleTapDuck = () => {
    if (!interactive) return;
    playSfx('tap', soundEnabled);
    triggerHaptic('light', hapticsEnabled);
    if (!reduceMotion) {
      duckScale.value = withSequence(
        withSpring(1.25, { damping: 6, stiffness: 260 }),
        withSpring(1, { damping: 10 })
      );
    }
  };

  const handleTapBaby = () => {
    if (!interactive) return;
    playSfx('tap', soundEnabled);
    triggerHaptic('light', hapticsEnabled);
    if (!reduceMotion) {
      babyScale.value = withSequence(
        withSpring(1.22, { damping: 6, stiffness: 260 }),
        withSpring(1, { damping: 10 })
      );
    }
  };

  const capyFloatStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: bobY.value },
      { scale: mascotScale.value },
      { rotate: `${mascotRotate.value}deg` },
    ],
  }));

  const decorBobStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: decorBobY.value }],
  }));

  const duckAnimStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: decorBobY.value }, { scale: duckScale.value }],
  }));

  const babyAnimStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: bobY.value * 0.85 }, { scale: babyScale.value }],
  }));

  return (
    <View
      style={[
        styles.root,
        {
          width: 320 * s,
          height: 200 * s,
        },
      ]}
    >
      {/* Cozy Whisper Bubble when petted */}
      {interactive && quoteText && (
        <Animated.View
          entering={reduceMotion ? undefined : FadeIn.duration(180)}
          exiting={reduceMotion ? undefined : FadeOut.duration(220)}
          pointerEvents="none"
          style={[styles.quoteBubble, { top: -4 * s }, SHADOWS.soft]}
        >
          <Text style={styles.quoteText}>{quoteText}</Text>
        </Animated.View>
      )}

      {/* Main Panoramic Wooden Hinoki Onsen Pool */}
      <View style={[styles.onsenBase, { bottom: 0 }]}>
        <SanctuaryPoolSvg width={320 * s} height={152 * s} />
      </View>

      {/* Bamboo Water Spout: post tucked behind rim, spout & water in front */}
      {decorSet.has('bamboo_fountain') && (
        <>
          <View
            pointerEvents="none"
            style={[
              styles.bambooPostWrap,
              { top: 34 * s, right: 56 * s },
            ]}
          >
            <Svg width={56 * s} height={60 * s} viewBox="0 0 56 60">
              <Rect x="34" y="14" width="9" height="44" rx="3" fill="#65A30D" stroke={OUTLINE} strokeWidth="2" />
              <Path d="M 36.8 17 V 54" stroke="#A3E635" strokeWidth="1.6" strokeLinecap="round" opacity={0.45} />
              <Path d="M 34.5 25 H 42.5 M 34.5 35 H 42.5" stroke="#3F6212" strokeWidth="1.8" />
            </Svg>
          </View>
          <View
            pointerEvents="none"
            style={[
              styles.bambooWrap,
              { top: 34 * s, right: 56 * s },
            ]}
          >
            <Svg width={56 * s} height={62 * s} viewBox="0 0 56 62">
              <Path d="M 10 22 L 40 10 L 43 17 L 13 29 Z" fill="#84CC16" stroke={OUTLINE} strokeWidth="2" strokeLinejoin="round" />
              <Path d="M 24 16.5 L 26.8 23.2" stroke="#4D7C0F" strokeWidth="1.8" />
              <Path d="M 33.5 14 L 43 19.5 M 33.5 20 L 42.5 14.5" stroke="#6D4527" strokeWidth="2.4" strokeLinecap="round" />
              <Path d="M 11 27 Q 10 40 12 54" stroke="#56CFE1" strokeWidth="3.4" strokeLinecap="round" fill="none" />
              <Path d="M 11.2 28 Q 10.5 40 12 52" stroke="#FFFBF2" strokeWidth="1.2" strokeLinecap="round" fill="none" opacity={0.75} />
              <Ellipse cx="12" cy="56" rx="10" ry="3.6" fill="#8BF6E5" opacity={0.5} />
              <Ellipse cx="12" cy="56" rx="6.5" ry="2.3" fill="none" stroke="#FFFBF2" strokeWidth="1.3" opacity={0.88} />
            </Svg>
          </View>
        </>
      )}

      {/* Sakura Branch rising from behind back-left Hinoki rim */}
      {decorSet.has('sakura_branch') && (
        <View
          pointerEvents="none"
          style={[
            styles.sakuraWrap,
            { top: 0, left: 0 },
          ]}
        >
          <Svg width={122 * s} height={96 * s} viewBox="0 0 122 96">
            {/* Main curving sakura trunk & bough (double-stroked) */}
            <Path d="M 20 92 Q 14 54 24 32 Q 36 16 108 18" stroke={OUTLINE} strokeWidth="9.5" strokeLinecap="round" fill="none" />
            <Path d="M 20 92 Q 14 54 24 32 Q 36 16 108 18" stroke="#7A4F2C" strokeWidth="5.8" strokeLinecap="round" fill="none" />
            {/* Secondary twig */}
            <Path d="M 44 22 Q 62 30 74 36" stroke={OUTLINE} strokeWidth="4.8" strokeLinecap="round" fill="none" />
            <Path d="M 44 22 Q 62 30 74 36" stroke="#7A4F2C" strokeWidth="2.6" strokeLinecap="round" fill="none" />
            {/* Fresh green leaves */}
            <Path d="M 35 17 Q 29 7 40 9 Q 41 15 35 17 Z" fill="#84CC16" stroke={OUTLINE} strokeWidth="1.3" />
            <Path d="M 76 16 Q 82 6 91 11 Q 85 16 76 16 Z" fill="#65A30D" stroke={OUTLINE} strokeWidth="1.3" />
            <Path d="M 55 30 Q 61 39 51 39 Q 50 33 55 30 Z" fill="#84CC16" stroke={OUTLINE} strokeWidth="1.3" />
            {/* Five-petal sakura blossoms */}
            <SakuraFlower cx={26} cy={30} r={9.5} fill="#F9A8D4" />
            <SakuraFlower cx={52} cy={20} r={10.5} fill="#FBCFE8" />
            <SakuraFlower cx={82} cy={19} r={9} fill="#F9A8D4" />
            <SakuraFlower cx={102} cy={18} r={7} fill="#F472B6" centerFill="#FDE68A" />
            <SakuraFlower cx={68} cy={34} r={7.5} fill="#FBCFE8" centerFill="#FDE68A" />
            {/* Drifting petals */}
            <Ellipse cx="42" cy="52" rx="3.4" ry="2.1" fill="#F9A8D4" />
            <Ellipse cx="86" cy="48" rx="3.1" ry="1.9" fill="#F472B6" />
          </Svg>
        </View>
      )}

      {/* Standing Paper Lantern Post rising from behind back-right Hinoki rim */}
      {decorSet.has('paper_lantern') && (
        <View
          pointerEvents="none"
          style={[
            styles.lanternWrap,
            { top: 2 * s, right: 6 * s },
          ]}
        >
          <Svg width={60 * s} height={94 * s} viewBox="0 0 60 94">
            <Rect x="39.5" y="14" width="5" height="72" rx="2.2" fill="#7A4F2C" stroke={OUTLINE} strokeWidth="1.8" />
            <Path d="M 39.5 25 L 30 16" stroke={OUTLINE} strokeWidth="4" strokeLinecap="round" />
            <Path d="M 39.5 25 L 30 16" stroke="#8C5D38" strokeWidth="1.8" strokeLinecap="round" />
            <Rect x="16" y="12.5" width="29" height="4.6" rx="2.2" fill="#8C5D38" stroke={OUTLINE} strokeWidth="1.8" />
            <Circle cx="23" cy="39" r="19" fill="#F59E0B" opacity={0.2} />
            <Path d="M 23 17 V 24" stroke={OUTLINE} strokeWidth="1.8" />
            <Path d="M 23 53 V 59" stroke="#E05A47" strokeWidth="2.4" strokeLinecap="round" />
            <Rect x="12" y="25" width="22" height="27" rx="9" fill="#E05A47" stroke={OUTLINE} strokeWidth="2" />
            <Path d="M 13.5 33 H 32.5 M 13.5 39 H 32.5 M 13.5 45 H 32.5" stroke="#B83B2A" strokeWidth="1" opacity={0.45} />
            <Ellipse cx="23" cy="38.5" rx="6.5" ry="9" fill="#FDE68A" opacity={0.88} />
            <Rect x="16" y="23" width="14" height="3.8" rx="1.4" fill={OUTLINE} />
            <Rect x="16" y="50" width="14" height="3.8" rx="1.4" fill={OUTLINE} />
          </Svg>
        </View>
      )}

      {/* Main Capybara Mascot soaking in center water */}
      <Pressable
        disabled={!interactive}
        onPress={handleTapMascot}
        style={[styles.capyHitbox, { top: 26 * s }]}
      >
        <Animated.View style={capyFloatStyle}>
          <CapybaraSvg
            size={112 * s}
            hat={equippedHat}
            expression={interactive ? mascotExpr : 'happy'}
            animatedIdle={!reduceMotion}
            inWater
          />
        </Animated.View>
      </Pressable>

      {/* Floating Hearts Layer */}
      {interactive && !reduceMotion && (
        <View pointerEvents="none" style={[styles.heartsAnchor, { top: 36 * s }]}>
          <FloatingHeart progress={heart1} offsetX={-28 * s} targetY={-56 * s} />
          <FloatingHeart progress={heart2} offsetX={6 * s} targetY={-68 * s} />
          <FloatingHeart progress={heart3} offsetX={30 * s} targetY={-52 * s} />
        </View>
      )}

      {/* Baby Capybara Friend soaking inside right water */}
      {decorSet.has('baby_capy') && (
        <Pressable
          disabled={!interactive}
          onPress={handleTapBaby}
          style={[styles.babyWrap, { bottom: 48 * s, right: 36 * s }]}
        >
          <Animated.View style={babyAnimStyle}>
            <CapybaraSvg
              size={60 * s}
              hat="none"
              happy
              animatedIdle={false}
              inWater
            />
          </Animated.View>
        </Pressable>
      )}

      {/* Rubber Duckling bobbing inside left water */}
      {decorSet.has('rubber_duck') && (
        <Pressable
          disabled={!interactive}
          onPress={handleTapDuck}
          style={[styles.duckWrap, { bottom: 48 * s, left: 40 * s }]}
        >
          <Animated.View style={duckAnimStyle}>
            <DecorationThumbnail id="rubber_duck" size={52 * s} />
          </Animated.View>
        </Pressable>
      )}

      {/* Floating Yuzus Trio bobbing inside front-center water */}
      {decorSet.has('floating_yuzus') && (
        <Animated.View
          pointerEvents="none"
          style={[
            styles.yuzusWrap,
            { bottom: 40 * s },
            decorBobStyle,
          ]}
        >
          <Svg width={108 * s} height={32 * s} viewBox="0 0 108 32">
            <Ellipse cx="20" cy="23" rx="10" ry="3.2" fill="#8BF6E5" opacity={0.55} />
            <Ellipse cx="54" cy="25" rx="10" ry="3.2" fill="#8BF6E5" opacity={0.55} />
            <Ellipse cx="88" cy="22" rx="10" ry="3.2" fill="#8BF6E5" opacity={0.55} />
            <Path d="M 13 24 Q 20 26.5 27 24" stroke="#FFFBF2" strokeWidth="1.2" strokeLinecap="round" fill="none" opacity={0.7} />
            <Path d="M 47 26 Q 54 28.5 61 26" stroke="#FFFBF2" strokeWidth="1.2" strokeLinecap="round" fill="none" opacity={0.7} />
            <Path d="M 81 23 Q 88 25.5 95 23" stroke="#FFFBF2" strokeWidth="1.2" strokeLinecap="round" fill="none" opacity={0.7} />
            <Circle cx="20" cy="16" r="8" fill="#F59E0B" stroke={OUTLINE} strokeWidth="1.8" />
            <Circle cx="17.5" cy="13" r="2" fill="#FEF3C7" opacity={0.85} />
            <Path d="M 20 8 Q 14 4 12 9 Q 17 11 20 8 Z" fill="#65A30D" stroke={OUTLINE} strokeWidth="1.3" />
            <Circle cx="54" cy="18" r="7.8" fill="#FBBF24" stroke={OUTLINE} strokeWidth="1.8" />
            <Circle cx="51.5" cy="15" r="2" fill="#FEF3C7" opacity={0.85} />
            <Circle cx="88" cy="15" r="8.2" fill="#F59E0B" stroke={OUTLINE} strokeWidth="1.8" />
            <Circle cx="85.5" cy="12" r="2" fill="#FEF3C7" opacity={0.85} />
            <Path d="M 88 6 Q 94 2 96 7 Q 91 9 88 6 Z" fill="#65A30D" stroke={OUTLINE} strokeWidth="1.3" />
          </Svg>
        </Animated.View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  quoteBubble: {
    position: 'absolute',
    zIndex: 20,
    backgroundColor: PALETTE.creamLight,
    borderRadius: RADIUS.pill,
    borderWidth: 1.5,
    borderColor: PALETTE.borderWarm,
    paddingHorizontal: 14,
    paddingVertical: 6,
    maxWidth: 260,
  },
  quoteText: {
    fontFamily: FONTS.semiBold,
    fontSize: 12,
    color: PALETTE.espresso,
    textAlign: 'center',
  },
  sakuraWrap: {
    position: 'absolute',
    zIndex: 0,
  },
  lanternWrap: {
    position: 'absolute',
    zIndex: 0,
  },
  bambooPostWrap: {
    position: 'absolute',
    zIndex: 0,
  },
  bambooWrap: {
    position: 'absolute',
    zIndex: 2,
  },
  onsenBase: {
    position: 'absolute',
    zIndex: 1,
  },
  capyHitbox: {
    position: 'absolute',
    zIndex: 4,
  },
  heartsAnchor: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 15,
  },
  heartItem: {
    position: 'absolute',
  },
  babyWrap: {
    position: 'absolute',
    zIndex: 5,
  },
  duckWrap: {
    position: 'absolute',
    zIndex: 6,
  },
  yuzusWrap: {
    position: 'absolute',
    zIndex: 7,
  },
});
