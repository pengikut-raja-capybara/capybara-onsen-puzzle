import React from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Circle, Ellipse, Path } from 'react-native-svg';

const OUTLINE = 'rgba(74, 52, 35, 0.55)';

export const BoardDioramaCorners: React.FC<{ chapter: number }> = ({
  chapter,
}) => {
  if (chapter === 1) {
    // Subtle Hinoki wood joinery & delicate steam curls tucked cleanly inside corners
    return (
      <View pointerEvents="none" style={StyleSheet.absoluteFill}>
        <View style={styles.topLeft}>
          <Svg width={28} height={28} viewBox="0 0 28 28">
            <Path
              d="M 5 18 Q 5 5 18 5"
              stroke="rgba(255, 251, 242, 0.55)"
              strokeWidth="2.2"
              strokeLinecap="round"
              fill="none"
            />
            <Circle cx="10" cy="10" r="1.6" fill="rgba(74, 52, 35, 0.28)" />
          </Svg>
        </View>
        <View style={styles.topRight}>
          <Svg width={32} height={28} viewBox="0 0 32 28">
            <Path
              d="M 10 5 Q 24 5 26 18"
              stroke="rgba(255, 251, 242, 0.55)"
              strokeWidth="2.2"
              strokeLinecap="round"
              fill="none"
            />
            <Circle cx="21" cy="10" r="1.6" fill="rgba(74, 52, 35, 0.28)" />
          </Svg>
        </View>
        <View style={styles.bottomLeft}>
          <Svg width={28} height={28} viewBox="0 0 28 28">
            <Path
              d="M 5 10 Q 5 23 18 23"
              stroke="rgba(74, 52, 35, 0.22)"
              strokeWidth="2"
              strokeLinecap="round"
              fill="none"
            />
          </Svg>
        </View>
        <View style={styles.bottomRight}>
          <Svg width={28} height={28} viewBox="0 0 28 28">
            <Path
              d="M 10 23 Q 23 23 23 10"
              stroke="rgba(74, 52, 35, 0.22)"
              strokeWidth="2"
              strokeLinecap="round"
              fill="none"
            />
          </Svg>
        </View>
      </View>
    );
  }

  if (chapter === 2) {
    // Neat citrus-leaf inlay & tiny blossom tucked inside the frame rim
    return (
      <View pointerEvents="none" style={StyleSheet.absoluteFill}>
        <View style={styles.topLeft}>
          <Svg width={32} height={28} viewBox="0 0 32 28">
            <Path
              d="M 5 16 Q 9 6 20 7 Q 15 16 5 16 Z"
              fill="#6B9080"
              stroke={OUTLINE}
              strokeWidth="1.3"
              strokeLinejoin="round"
            />
            <Path
              d="M 14 7 Q 21 3 26 8 Q 20 12 14 7 Z"
              fill="#84A98C"
              stroke={OUTLINE}
              strokeWidth="1.2"
              strokeLinejoin="round"
            />
          </Svg>
        </View>
        <View style={styles.bottomRight}>
          <Svg width={28} height={28} viewBox="0 0 28 28">
            <Circle cx="16" cy="17" r="2.2" fill="#FFFBF2" opacity={0.85} />
            <Circle cx="20" cy="14" r="2.2" fill="#FFFBF2" opacity={0.85} />
            <Circle cx="20" cy="19" r="2.2" fill="#FFFBF2" opacity={0.85} />
            <Circle cx="18.6" cy="16.8" r="1.7" fill="#F59E0B" />
          </Svg>
        </View>
      </View>
    );
  }

  if (chapter === 3) {
    // Sleek bamboo leaf pair hugging the top-left inner frame curve
    return (
      <View pointerEvents="none" style={StyleSheet.absoluteFill}>
        <View style={styles.topLeft}>
          <Svg width={34} height={28} viewBox="0 0 34 28">
            <Path
              d="M 6 18 Q 8 7 19 6 Q 15 15 6 18 Z"
              fill="#65A30D"
              stroke={OUTLINE}
              strokeWidth="1.3"
              strokeLinejoin="round"
            />
            <Path
              d="M 8 19 Q 18 14 27 16 Q 18 22 8 19 Z"
              fill="#84CC16"
              stroke={OUTLINE}
              strokeWidth="1.3"
              strokeLinejoin="round"
            />
          </Svg>
        </View>
        <View style={styles.bottomRight}>
          <Svg width={28} height={28} viewBox="0 0 28 28">
            <Path
              d="M 22 10 Q 20 20 10 22 Q 14 14 22 10 Z"
              fill="#84CC16"
              stroke={OUTLINE}
              strokeWidth="1.2"
              strokeLinejoin="round"
              opacity={0.85}
            />
          </Svg>
        </View>
      </View>
    );
  }

  if (chapter === 4) {
    // Flush frost sheen & subtle snowflake sparkles following the corner curves
    return (
      <View pointerEvents="none" style={StyleSheet.absoluteFill}>
        <View style={styles.topLeft}>
          <Svg width={34} height={28} viewBox="0 0 34 28">
            <Path
              d="M 5 18 Q 5 5 22 5"
              stroke="rgba(255, 255, 255, 0.85)"
              strokeWidth="3.2"
              strokeLinecap="round"
              fill="none"
            />
            <Path
              d="M 11 9 V 15 M 8 12 H 14"
              stroke="rgba(255, 255, 255, 0.9)"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </Svg>
        </View>
        <View style={styles.topRight}>
          <Svg width={34} height={28} viewBox="0 0 34 28">
            <Path
              d="M 12 5 Q 29 5 29 18"
              stroke="rgba(255, 255, 255, 0.85)"
              strokeWidth="3.2"
              strokeLinecap="round"
              fill="none"
            />
            <Circle cx="22" cy="11" r="1.6" fill="rgba(255, 255, 255, 0.9)" />
          </Svg>
        </View>
      </View>
    );
  }

  // Chapter 5: Subtle warm firefly glow & fallen sakura petal inside the rim
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <View style={styles.topRight}>
        <Svg width={30} height={28} viewBox="0 0 30 28">
          <Circle cx="19" cy="10" r="5" fill="#F59E0B" opacity={0.28} />
          <Circle cx="19" cy="10" r="2.2" fill="#FDE68A" />
          <Circle cx="12" cy="7" r="1.4" fill="#FDE68A" opacity={0.85} />
        </Svg>
      </View>
      <View style={styles.bottomLeft}>
        <Svg width={28} height={28} viewBox="0 0 28 28">
          <Ellipse cx="11" cy="18" rx="3.4" ry="2" fill="#F9A8D4" opacity={0.9} />
          <Circle cx="18" cy="21" r="1.5" fill="#FDE68A" opacity={0.85} />
        </Svg>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  topLeft: {
    position: 'absolute',
    top: 1,
    left: 2,
  },
  topRight: {
    position: 'absolute',
    top: 1,
    right: 2,
  },
  bottomLeft: {
    position: 'absolute',
    bottom: 1,
    left: 2,
  },
  bottomRight: {
    position: 'absolute',
    bottom: 1,
    right: 2,
  },
});
