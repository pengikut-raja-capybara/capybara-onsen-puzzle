import React from 'react';
import Svg, { Circle, Ellipse, G, Path } from 'react-native-svg';

interface TerrainTileBgProps {
  chapterId: number;
  row: number;
  col: number;
  size: number;
}

/**
 * Subtle, deterministic biome terrain details rendered inside board cells
 * (soil & pebbles, garden grass, river marsh, snowdrifts, moonlit stone)
 * while keeping high contrast for puzzle pieces and trajectory hints.
 */
export const TerrainTileBg: React.FC<TerrainTileBgProps> = React.memo(
  ({ chapterId, row, col, size }) => {
    const variant = (row * 7 + col * 13 + row * col) % 4;
    const biome = Math.min(5, Math.max(1, chapterId));

    return (
      <Svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        pointerEvents="none"
        style={{ position: 'absolute', top: 0, left: 0 }}
      >
        {/* Chapter 1: Warm Soil & River Pebbles */}
        {biome === 1 && (
          <G opacity={0.62}>
            {variant === 0 && (
              <>
                <Ellipse cx="21" cy="79" rx="8.5" ry="5.5" fill="#C9A882" />
                <Ellipse cx="34" cy="84" rx="5" ry="3.4" fill="#B69068" />
                <Circle cx="78" cy="22" r="2.6" fill="#C9A882" />
                <Circle cx="85" cy="30" r="1.8" fill="#B69068" />
              </>
            )}
            {variant === 1 && (
              <>
                <Path
                  d="M 14 26 Q 28 19 42 27"
                  stroke="#C9A882"
                  strokeWidth="2.6"
                  strokeLinecap="round"
                  fill="none"
                />
                <Ellipse cx="78" cy="78" rx="7.5" ry="4.8" fill="#B69068" />
                <Circle cx="20" cy="76" r="2.2" fill="#C9A882" />
              </>
            )}
            {variant === 2 && (
              <>
                <Circle cx="18" cy="22" r="2.5" fill="#B69068" />
                <Circle cx="26" cy="28" r="1.8" fill="#C9A882" />
                <Circle cx="82" cy="78" r="2.6" fill="#B69068" />
                <Circle cx="72" cy="84" r="2" fill="#C9A882" />
                <Ellipse cx="79" cy="21" rx="6" ry="3.8" fill="#D5B692" />
              </>
            )}
            {variant === 3 && (
              <>
                <Ellipse cx="23" cy="77" rx="7" ry="4.5" fill="#C9A882" />
                <Path
                  d="M 74 26 L 78 18 L 82 26 M 78 26 L 85 20"
                  stroke="#84A98C"
                  strokeWidth="2.4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  fill="none"
                />
              </>
            )}
          </G>
        )}

        {/* Chapter 2: Lush Garden Grass */}
        {biome === 2 && (
          <G opacity={0.68}>
            {variant === 0 && (
              <>
                <Path
                  d="M 15 85 L 18 72 L 22 84 L 26 73 L 29 85"
                  stroke="#74A57F"
                  strokeWidth="2.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  fill="none"
                />
                <Circle cx="80" cy="22" r="3" fill="#84B88F" />
                <Circle cx="74" cy="25" r="2.4" fill="#84B88F" />
              </>
            )}
            {variant === 1 && (
              <>
                <Path
                  d="M 16 28 L 19 17 L 24 27 M 23 27 L 28 19"
                  stroke="#74A57F"
                  strokeWidth="2.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  fill="none"
                />
                <Circle cx="80" cy="78" r="3.2" fill="#FDE68A" />
                <Circle cx="80" cy="78" r="1.3" fill="#F59E0B" />
                <Circle cx="73" cy="83" r="2.2" fill="#74A57F" />
              </>
            )}
            {variant === 2 && (
              <>
                <Path
                  d="M 71 84 L 75 72 L 79 84 M 78 84 L 83 74"
                  stroke="#6B9E78"
                  strokeWidth="2.6"
                  strokeLinecap="round"
                  fill="none"
                />
                <Circle cx="20" cy="22" r="2.4" fill="#84B88F" />
                <Circle cx="27" cy="28" r="1.9" fill="#A3B18A" />
              </>
            )}
            {variant === 3 && (
              <>
                <Ellipse cx="23" cy="80" rx="8.5" ry="4" fill="#B5D3B3" />
                <Path
                  d="M 18 80 L 21 71 M 24 80 L 27 72"
                  stroke="#6B9E78"
                  strokeWidth="2.4"
                  strokeLinecap="round"
                />
                <Circle cx="78" cy="20" r="2.6" fill="#74A57F" />
                <Circle cx="83" cy="22" r="2.4" fill="#84B88F" />
                <Circle cx="80" cy="26" r="2.4" fill="#74A57F" />
              </>
            )}
          </G>
        )}

        {/* Chapter 3: Calm River Marsh & Mossy Pebbles */}
        {biome === 3 && (
          <G opacity={0.68}>
            {variant === 0 && (
              <>
                <Path
                  d="M 14 78 Q 27 73 40 78 M 18 84 Q 28 80 38 84"
                  stroke="#6BB6C9"
                  strokeWidth="2.4"
                  strokeLinecap="round"
                  fill="none"
                />
                <Ellipse cx="79" cy="23" rx="6.5" ry="4.2" fill="#88B2A6" />
              </>
            )}
            {variant === 1 && (
              <>
                <Path
                  d="M 22 22 m -8 0 a 8 6.5 0 1 0 16 0 a 8 6.5 0 1 0 -16 0"
                  fill="#78B69E"
                />
                <Path
                  d="M 66 80 Q 77 75 88 80"
                  stroke="#6BB6C9"
                  strokeWidth="2.4"
                  strokeLinecap="round"
                  fill="none"
                />
              </>
            )}
            {variant === 2 && (
              <>
                <Path
                  d="M 75 86 Q 73 76 76 68 M 82 86 Q 85 77 83 70"
                  stroke="#6BA38F"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  fill="none"
                />
                <Circle cx="20" cy="22" r="2.5" fill="#6BB6C9" />
                <Circle cx="27" cy="27" r="1.8" fill="#88B2A6" />
              </>
            )}
            {variant === 3 && (
              <>
                <Ellipse cx="21" cy="79" rx="7.5" ry="4.8" fill="#88B2A6" />
                <Ellipse cx="32" cy="83" rx="4.6" ry="3" fill="#6D9B8E" />
                <Path
                  d="M 68 23 Q 78 18 88 23"
                  stroke="#6BB6C9"
                  strokeWidth="2.3"
                  strokeLinecap="round"
                  fill="none"
                />
              </>
            )}
          </G>
        )}

        {/* Chapter 4: Snowy Peak & Frost */}
        {biome === 4 && (
          <G opacity={0.85}>
            {variant === 0 && (
              <>
                <Path
                  d="M 10 83 Q 27 70 46 83"
                  stroke="#FFFFFF"
                  strokeWidth="4.2"
                  strokeLinecap="round"
                  fill="none"
                />
                <Path
                  d="M 80 17 V 27 M 75 22 H 85"
                  stroke="#93C5FD"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                />
              </>
            )}
            {variant === 1 && (
              <>
                <Path
                  d="M 20 17 V 27 M 15 22 H 25 M 16.5 18.5 L 23.5 25.5 M 23.5 18.5 L 16.5 25.5"
                  stroke="#7DD3FC"
                  strokeWidth="1.9"
                  strokeLinecap="round"
                />
                <Path
                  d="M 62 82 Q 76 72 90 82"
                  stroke="#FFFFFF"
                  strokeWidth="3.8"
                  strokeLinecap="round"
                  fill="none"
                />
              </>
            )}
            {variant === 2 && (
              <>
                <Path
                  d="M 12 24 Q 26 15 40 24"
                  stroke="#FFFFFF"
                  strokeWidth="3.8"
                  strokeLinecap="round"
                  fill="none"
                />
                <Ellipse cx="78" cy="79" rx="6.5" ry="4" fill="#B8CCE0" />
              </>
            )}
            {variant === 3 && (
              <>
                <Circle cx="18" cy="77" r="3.2" fill="#FFFFFF" />
                <Circle cx="27" cy="83" r="2.2" fill="#BAE6FD" />
                <Circle cx="82" cy="22" r="3" fill="#FFFFFF" />
                <Circle cx="75" cy="28" r="2" fill="#BAE6FD" />
              </>
            )}
          </G>
        )}

        {/* Chapter 5: Moonlit Stone & Sakura Petals */}
        {biome === 5 && (
          <G opacity={0.68}>
            {variant === 0 && (
              <>
                <Ellipse cx="21" cy="79" rx="7.5" ry="4.5" fill="#B89EC2" />
                <Ellipse cx="32" cy="83" rx="4.5" ry="2.8" fill="#A688B2" />
                <Ellipse cx="80" cy="22" rx="4.2" ry="2.5" fill="#F4A9C8" />
              </>
            )}
            {variant === 1 && (
              <>
                <Circle cx="20" cy="22" r="2.8" fill="#FCD34D" />
                <Path
                  d="M 66 80 Q 77 75 88 80"
                  stroke="#B89EC2"
                  strokeWidth="2.4"
                  strokeLinecap="round"
                  fill="none"
                />
              </>
            )}
            {variant === 2 && (
              <>
                <Ellipse cx="20" cy="78" rx="4.2" ry="2.5" fill="#F4A9C8" />
                <Ellipse cx="79" cy="22" rx="3.8" ry="2.3" fill="#F9A8D4" />
                <Ellipse cx="78" cy="79" rx="6.2" ry="3.8" fill="#B89EC2" />
              </>
            )}
            {variant === 3 && (
              <>
                <Path
                  d="M 14 24 Q 28 18 42 24"
                  stroke="#B89EC2"
                  strokeWidth="2.4"
                  strokeLinecap="round"
                  fill="none"
                />
                <Circle cx="80" cy="79" r="2.6" fill="#FCD34D" />
                <Ellipse cx="72" cy="83" rx="3.8" ry="2.2" fill="#F4A9C8" />
              </>
            )}
          </G>
        )}
      </Svg>
    );
  }
);
