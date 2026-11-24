import React, { useEffect, useId, useState } from 'react';
import Svg, {
  Circle,
  ClipPath,
  Defs,
  Ellipse,
  G,
  Path,
  Rect,
} from 'react-native-svg';
import { HatId } from '../../engine/types';

export type CapyExpression =
  | 'normal'
  | 'sliding'
  | 'dizzy'
  | 'excited'
  | 'happy'
  | 'sleepy';

interface CapybaraSvgProps {
  size?: number;
  hasYuzuOnHead?: boolean;
  hat?: HatId;
  happy?: boolean;
  expression?: CapyExpression;
  animatedIdle?: boolean;
  inWater?: boolean;
}

const OUTLINE = '#4A3423';

export const CapybaraSvg: React.FC<CapybaraSvgProps> = ({
  size = 48,
  hasYuzuOnHead = false,
  hat,
  happy = false,
  expression,
  animatedIdle = true,
  inWater = false,
}) => {
  const rawId = useId();
  const waterClipId = `capyWater_${rawId.replace(/[^a-zA-Z0-9_-]/g, '')}`;
  const activeHat: HatId = hat ?? (hasYuzuOnHead ? 'yuzu' : 'none');
  const mode: CapyExpression = expression ?? (happy ? 'happy' : 'normal');

  // Periodic calm eye blink & ear twitch when in normal/happy idle state
  const [blinking, setBlinking] = useState(false);
  const [earTwitch, setEarTwitch] = useState(false);

  useEffect(() => {
    if (!animatedIdle) return;
    let blinkTimeout: ReturnType<typeof setTimeout>;
    const interval = setInterval(() => {
      setBlinking(true);
      setEarTwitch((prev) => !prev);
      blinkTimeout = setTimeout(() => setBlinking(false), 150);
    }, 3500);
    return () => {
      clearInterval(interval);
      clearTimeout(blinkTimeout);
    };
  }, [animatedIdle]);

  const leftEarY = earTwitch ? 30.5 : 32;
  const rightEarY = earTwitch ? 33 : 32;

  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      {inWater && (
        <Defs>
          <ClipPath id={waterClipId}>
            <Path d="M 0 0 H 100 V 74 Q 50 84 0 74 Z" />
          </ClipPath>
        </Defs>
      )}

      {/* Ground drop shadow or soft underwater immersion halo */}
      {!inWater ? (
        <Ellipse cx="50" cy="87" rx="31" ry="6.5" fill="rgba(74, 52, 35, 0.16)" />
      ) : (
        <G>
          <Ellipse cx="50" cy="76" rx="40" ry="10.5" fill="#8BF6E5" opacity={0.42} />
          <Ellipse cx="50" cy="77" rx="31" ry="8" fill="#2A7B88" opacity={0.24} />
        </G>
      )}

      {/* Plump zen-loaf body */}
      <G clipPath={inWater ? `url(#${waterClipId})` : undefined}>
        <Ellipse
          cx="50"
          cy="63"
          rx="34"
          ry="23"
          fill="#A67449"
          stroke={OUTLINE}
          strokeWidth="2.6"
        />
        {/* Warm cream/tan belly highlight */}
        <Ellipse cx="50" cy="67" rx="25" ry="15.5" fill="#C49468" />
      </G>

      {/* Small side-set rounded capybara ears */}
      <G transform={`rotate(-18 23 ${leftEarY})`}>
        <Ellipse
          cx="23"
          cy={leftEarY}
          rx="6.5"
          ry="5.2"
          fill="#8C5D38"
          stroke={OUTLINE}
          strokeWidth="2.4"
        />
        <Ellipse cx="23.5" cy={leftEarY + 0.5} rx="3.2" ry="2.4" fill="#6D4527" />
      </G>
      <G transform={`rotate(18 77 ${rightEarY})`}>
        <Ellipse
          cx="77"
          cy={rightEarY}
          rx="6.5"
          ry="5.2"
          fill="#8C5D38"
          stroke={OUTLINE}
          strokeWidth="2.4"
        />
        <Ellipse cx="76.5" cy={rightEarY + 0.5} rx="3.2" ry="2.4" fill="#6D4527" />
      </G>

      {/* Rounded-loaf head */}
      <Ellipse
        cx="50"
        cy="44"
        rx="28"
        ry="20.5"
        fill="#AC7A4F"
        stroke={OUTLINE}
        strokeWidth="2.6"
      />
      {/* Gentle brow highlight */}
      <Ellipse cx="50" cy="34" rx="18" ry="8" fill="#BA895E" opacity={0.55} />

      {/* Chunky squarish-rounded capybara snout */}
      <Rect
        x="32"
        y="40"
        width="36"
        height="22"
        rx="11"
        fill="#8E5F3B"
        stroke={OUTLINE}
        strokeWidth="2.2"
      />
      <Ellipse cx="50" cy="45" rx="12" ry="4.5" fill="#9D6D47" opacity={0.7} />

      {/* Nostrils */}
      <Ellipse cx="43.5" cy="47.5" rx="2.3" ry="1.8" fill="#3D2616" />
      <Ellipse cx="56.5" cy="47.5" rx="2.3" ry="1.8" fill="#3D2616" />

      {/* Mouth based on expression */}
      {mode === 'excited' || mode === 'happy' ? (
        <G>
          <Path
            d="M 50 49.5 L 50 53.5"
            stroke="#3D2616"
            strokeWidth="2.2"
            strokeLinecap="round"
          />
          <Path
            d="M 44 53.5 Q 50 61 56 53.5 Z"
            fill="#E07A5F"
            stroke="#3D2616"
            strokeWidth="1.8"
            strokeLinejoin="round"
          />
        </G>
      ) : mode === 'dizzy' ? (
        <Path
          d="M 44 56 Q 47 53 50 56 Q 53 59 56 56"
          stroke="#3D2616"
          strokeWidth="2.2"
          strokeLinecap="round"
          fill="none"
        />
      ) : mode === 'sleepy' ? (
        <G>
          <Path
            d="M 46 55 Q 50 57.5 54 55"
            stroke="#3D2616"
            strokeWidth="2"
            strokeLinecap="round"
            fill="none"
          />
          {/* Cute translucent sleep bubble */}
          <Circle
            cx="61"
            cy="54"
            r="4.5"
            fill="#E0F2FE"
            stroke={OUTLINE}
            strokeWidth="1.4"
            opacity={0.85}
          />
        </G>
      ) : (
        <Path
          d="M 50 49.5 L 50 54.5 M 44.5 55 Q 50 58 55.5 55"
          stroke="#3D2616"
          strokeWidth="2.2"
          strokeLinecap="round"
          fill="none"
        />
      )}

      {/* Eyes based on expression & blink */}
      {mode === 'sleepy' ? (
        <G>
          <Path
            d="M 30 37.5 Q 34.5 41 39 37.5"
            stroke="#2B1A0E"
            strokeWidth="2.6"
            strokeLinecap="round"
            fill="none"
          />
          <Path
            d="M 61 37.5 Q 65.5 41 70 37.5"
            stroke="#2B1A0E"
            strokeWidth="2.6"
            strokeLinecap="round"
            fill="none"
          />
          {/* Tiny floating Zzz */}
          <Path
            d="M 75 21 H 81 L 75 26.5 H 81"
            stroke={OUTLINE}
            strokeWidth="1.9"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
            opacity={0.78}
          />
        </G>
      ) : mode === 'happy' || (blinking && mode === 'normal') ? (
        <G>
          <Path
            d="M 30 38.5 Q 34.5 33.5 39 38.5"
            stroke="#2B1A0E"
            strokeWidth="2.8"
            strokeLinecap="round"
            fill="none"
          />
          <Path
            d="M 61 38.5 Q 65.5 33.5 70 38.5"
            stroke="#2B1A0E"
            strokeWidth="2.8"
            strokeLinecap="round"
            fill="none"
          />
        </G>
      ) : mode === 'dizzy' ? (
        <G>
          <Path
            d="M 30.5 34.5 L 37.5 37.5 L 30.5 40.5"
            stroke="#2B1A0E"
            strokeWidth="2.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
          <Path
            d="M 69.5 34.5 L 62.5 37.5 L 69.5 40.5"
            stroke="#2B1A0E"
            strokeWidth="2.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
          {/* Sweat drop */}
          <Path
            d="M 79 24 Q 83 30 79 33 Q 75 30 79 24 Z"
            fill="#7DD3FC"
            stroke={OUTLINE}
            strokeWidth="1.5"
          />
        </G>
      ) : mode === 'excited' ? (
        <G>
          <Circle cx="34.5" cy="37.5" r="4.2" fill="#2B1A0E" />
          <Circle cx="33.3" cy="36.1" r="1.6" fill="#FFFFFF" />
          <Circle cx="36" cy="38.8" r="1" fill="#FDE047" />
          <Circle cx="65.5" cy="37.5" r="4.2" fill="#2B1A0E" />
          <Circle cx="64.3" cy="36.1" r="1.6" fill="#FFFFFF" />
          <Circle cx="67" cy="38.8" r="1" fill="#FDE047" />
        </G>
      ) : mode === 'sliding' ? (
        <G>
          {/* Focused cute eyes + tiny motion cheek lines */}
          <Ellipse cx="34.5" cy="37.5" rx="3.8" ry="2.2" fill="#2B1A0E" />
          <Circle cx="35.8" cy="36.9" r="1" fill="#FFFFFF" />
          <Ellipse cx="65.5" cy="37.5" rx="3.8" ry="2.2" fill="#2B1A0E" />
          <Circle cx="66.8" cy="36.9" r="1" fill="#FFFFFF" />
          <Path
            d="M 22 44 H 26 M 74 44 H 78"
            stroke={OUTLINE}
            strokeWidth="1.8"
            strokeLinecap="round"
            opacity={0.55}
          />
        </G>
      ) : (
        <G>
          {/* Serene half-relaxed chill capybara eyes */}
          <Ellipse cx="34.5" cy="38" rx="3.4" ry="2.1" fill="#2B1A0E" />
          <Path
            d="M 30 36.2 Q 34.5 34.4 39 36.2"
            stroke="#2B1A0E"
            strokeWidth="2.1"
            strokeLinecap="round"
            fill="none"
          />
          <Circle cx="35.6" cy="37.6" r="0.9" fill="#FFFFFF" />
          <Ellipse cx="65.5" cy="38" rx="3.4" ry="2.1" fill="#2B1A0E" />
          <Path
            d="M 61 36.2 Q 65.5 34.4 70 36.2"
            stroke="#2B1A0E"
            strokeWidth="2.1"
            strokeLinecap="round"
            fill="none"
          />
          <Circle cx="66.6" cy="37.6" r="0.9" fill="#FFFFFF" />
        </G>
      )}

      {/* Rosy cheeks */}
      <Ellipse
        cx="27.5"
        cy="46"
        rx={mode === 'excited' || mode === 'happy' ? 5.2 : 4.5}
        ry={mode === 'excited' || mode === 'happy' ? 3 : 2.5}
        fill="#E8998D"
        opacity={mode === 'excited' || mode === 'happy' ? 0.85 : 0.65}
      />
      <Ellipse
        cx="72.5"
        cy="46"
        rx={mode === 'excited' || mode === 'happy' ? 5.2 : 4.5}
        ry={mode === 'excited' || mode === 'happy' ? 3 : 2.5}
        fill="#E8998D"
        opacity={mode === 'excited' || mode === 'happy' ? 0.85 : 0.65}
      />

      {/* Little tucked paws (hidden when soaking in water) */}
      {!inWater ? (
        <G>
          <Ellipse
            cx="32"
            cy="80"
            rx="7.2"
            ry="4.5"
            fill="#825532"
            stroke={OUTLINE}
            strokeWidth="2.2"
          />
          <Ellipse
            cx="68"
            cy="80"
            rx="7.2"
            ry="4.5"
            fill="#825532"
            stroke={OUTLINE}
            strokeWidth="2.2"
          />
        </G>
      ) : (
        <G>
          <Path
            d="M 15 74.5 Q 50 84.5 85 74.5"
            stroke="#8BF6E5"
            strokeWidth="4.4"
            strokeLinecap="round"
            fill="none"
            opacity={0.82}
          />
          <Path
            d="M 19 75.2 Q 50 83.8 81 75.2"
            stroke="#FFFBF2"
            strokeWidth="2.1"
            strokeLinecap="round"
            fill="none"
            opacity={0.92}
          />
          <Path
            d="M 27 83.5 Q 50 88.5 73 83.5"
            stroke="#FFFBF2"
            strokeWidth="1.5"
            strokeLinecap="round"
            fill="none"
            opacity={0.58}
          />
        </G>
      )}

      {/* Hat / Head Accessory with unified sepia outline */}
      {activeHat === 'yuzu' && (
        <G>
          <Circle
            cx="50"
            cy="18"
            r="10"
            fill="#F59E0B"
            stroke={OUTLINE}
            strokeWidth="2.2"
          />
          <Circle cx="46.5" cy="14.5" r="2.6" fill="#FDE68A" opacity={0.75} />
          <Path
            d="M 50 8 Q 58 2.5 61 9 Q 54 12 50 8 Z"
            fill="#65A30D"
            stroke={OUTLINE}
            strokeWidth="1.8"
            strokeLinejoin="round"
          />
        </G>
      )}

      {activeHat === 'towel' && (
        <G>
          <Rect
            x="30"
            y="15"
            width="40"
            height="12"
            rx="5"
            fill="#FFFBF2"
            stroke={OUTLINE}
            strokeWidth="2.2"
          />
          <Rect
            x="34"
            y="11"
            width="32"
            height="7"
            rx="3.5"
            fill="#FFFFFF"
            stroke={OUTLINE}
            strokeWidth="2"
          />
          <Path
            d="M 37 21 L 63 21"
            stroke="#56CFE1"
            strokeWidth="2.2"
            strokeLinecap="round"
          />
        </G>
      )}

      {activeHat === 'sakura' && (
        <G>
          <Circle
            cx="43"
            cy="16"
            r="6"
            fill="#F472B6"
            stroke={OUTLINE}
            strokeWidth="1.8"
          />
          <Circle
            cx="57"
            cy="16"
            r="6"
            fill="#F472B6"
            stroke={OUTLINE}
            strokeWidth="1.8"
          />
          <Circle
            cx="50"
            cy="11"
            r="6"
            fill="#FB7185"
            stroke={OUTLINE}
            strokeWidth="1.8"
          />
          <Circle
            cx="45"
            cy="22"
            r="5.5"
            fill="#F9A8D4"
            stroke={OUTLINE}
            strokeWidth="1.8"
          />
          <Circle
            cx="55"
            cy="22"
            r="5.5"
            fill="#F9A8D4"
            stroke={OUTLINE}
            strokeWidth="1.8"
          />
          <Circle
            cx="50"
            cy="17"
            r="4.2"
            fill="#FBBF24"
            stroke={OUTLINE}
            strokeWidth="1.6"
          />
        </G>
      )}

      {activeHat === 'bamboo_hat' && (
        <G>
          <Path
            d="M 18 25 L 50 7 L 82 25 Q 50 30 18 25 Z"
            fill="#EAB308"
            stroke={OUTLINE}
            strokeWidth="2.4"
            strokeLinejoin="round"
          />
          <Path
            d="M 50 8 L 36 25 M 50 8 L 50 26 M 50 8 L 64 25"
            stroke="#A16207"
            strokeWidth="1.6"
            strokeLinecap="round"
          />
        </G>
      )}

      {activeHat === 'crown' && (
        <G>
          <Path
            d="M 32 24 L 30 10 L 42 17 L 50 7 L 58 17 L 70 10 L 68 24 Z"
            fill="#FACC15"
            stroke={OUTLINE}
            strokeWidth="2.2"
            strokeLinejoin="round"
          />
          <Circle cx="50" cy="18" r="2.6" fill="#E05A47" />
          <Circle cx="39" cy="19" r="2" fill="#4A7C9B" />
          <Circle cx="61" cy="19" r="2" fill="#65A30D" />
        </G>
      )}
    </Svg>
  );
};
