import React from 'react';
import Svg, { Circle, Ellipse, Path, Rect, G } from 'react-native-svg';
import { Direction } from '../../engine/types';

const OUTLINE = '#4A3423';
const OUTLINE_SOFT = '#5C4033';

export const OnsenSvg: React.FC<{ size?: number }> = ({ size = 48 }) => (
  <Svg width={size} height={size} viewBox="0 0 100 100">
    {/* Soft base shadow */}
    <Ellipse cx="50" cy="87" rx="38" ry="6" fill="rgba(74, 52, 35, 0.14)" />
    {/* Wooden hinoki tub rim */}
    <Rect
      x="8"
      y="18"
      width="84"
      height="70"
      rx="22"
      fill="#A67449"
      stroke={OUTLINE}
      strokeWidth="2.6"
    />
    {/* Corner hinoki plank joints */}
    <Path
      d="M 24 19 L 28 25 M 76 19 L 72 25 M 24 87 L 28 81 M 76 87 L 72 81"
      stroke={OUTLINE_SOFT}
      strokeWidth="2"
      strokeLinecap="round"
      opacity={0.55}
    />
    <Rect
      x="14"
      y="24"
      width="72"
      height="58"
      rx="18"
      fill="#C49468"
      stroke={OUTLINE_SOFT}
      strokeWidth="1.8"
    />
    {/* Warm turquoise-jade water with soft glow & ripples */}
    <Rect
      x="19"
      y="29"
      width="62"
      height="48"
      rx="14"
      fill="#4CC9D8"
      stroke="#318E9B"
      strokeWidth="1.6"
    />
    <Ellipse cx="50" cy="53" rx="24" ry="15" fill="#8BF6E5" opacity={0.38} />
    <Path
      d="M 32 48 Q 50 43 68 48 M 36 59 Q 50 63 64 59"
      stroke="#FFFBF2"
      strokeWidth="2"
      strokeLinecap="round"
      fill="none"
      opacity={0.55}
    />
    {/* Delicate cream-white steam wisps */}
    <Path
      d="M 34 22 Q 30 14 35 7 M 50 20 Q 55 12 50 4 M 66 22 Q 62 14 67 7"
      stroke="#FFFBF2"
      strokeWidth="3.2"
      strokeLinecap="round"
      fill="none"
      opacity={0.9}
    />
  </Svg>
);

export const YuzuSvg: React.FC<{ size?: number }> = ({ size = 36 }) => (
  <Svg width={size} height={size} viewBox="0 0 100 100">
    <Ellipse cx="50" cy="82" rx="20" ry="5" fill="rgba(74, 52, 35, 0.14)" />
    <Circle
      cx="50"
      cy="54"
      r="25"
      fill="#F59E0B"
      stroke={OUTLINE}
      strokeWidth="2.6"
    />
    <Circle cx="41" cy="43" r="6" fill="#FDE68A" opacity={0.75} />
    <Path
      d="M 50 29 L 50 21"
      stroke={OUTLINE}
      strokeWidth="3.5"
      strokeLinecap="round"
    />
    <Path
      d="M 50 24 Q 68 12 72 26 Q 58 32 50 24 Z"
      fill="#65A30D"
      stroke={OUTLINE}
      strokeWidth="2.2"
      strokeLinejoin="round"
    />
  </Svg>
);

export const RockSvg: React.FC<{ size?: number; chapter?: number }> = ({
  size = 48,
  chapter = 1,
}) => (
  <Svg width={size} height={size} viewBox="0 0 100 100">
    <Ellipse cx="50" cy="83" rx="33" ry="6.5" fill="rgba(74, 52, 35, 0.16)" />
    <Path
      d="M 16 74 Q 14 40 34 28 Q 52 18 72 30 Q 86 42 84 74 Q 50 82 16 74 Z"
      fill={chapter === 5 ? '#6B7280' : '#858D9D'}
      stroke={OUTLINE}
      strokeWidth="2.6"
      strokeLinejoin="round"
    />
    <Path
      d="M 24 66 Q 24 44 38 35 Q 50 27 64 34 Q 44 40 32 66 Z"
      fill={chapter === 5 ? '#9CA3AF' : '#A5ABB9'}
      opacity={0.75}
    />
    {/* Chapter-adaptive decorative topper */}
    {chapter <= 3 && (
      <Path
        d="M 26 37 Q 36 24 52 25 Q 60 26 65 32 Q 52 36 42 35 Q 32 39 26 37 Z"
        fill="#6B9080"
        stroke={OUTLINE}
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
    )}
    {chapter === 4 && (
      <Path
        d="M 23 41 Q 33 23 52 23 Q 68 24 76 39 Q 64 44 54 38 Q 42 45 23 41 Z"
        fill="#F5FAFE"
        stroke="#5B82B5"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
    )}
    {chapter === 5 && (
      <Path
        d="M 28 36 Q 48 24 68 34"
        stroke="#FDE68A"
        strokeWidth="3"
        strokeLinecap="round"
        fill="none"
        opacity={0.65}
      />
    )}
  </Svg>
);

export const MudSvg: React.FC<{ size?: number }> = ({ size = 48 }) => (
  <Svg width={size} height={size} viewBox="0 0 100 100">
    <Ellipse
      cx="50"
      cy="52"
      rx="38"
      ry="29"
      fill="#8D6E63"
      stroke={OUTLINE_SOFT}
      strokeWidth="2.2"
    />
    <Ellipse cx="45" cy="49" rx="25" ry="17" fill="#795548" opacity={0.8} />
    <Path
      d="M 32 45 Q 42 39 54 43"
      stroke="#BCAAA4"
      strokeWidth="2.4"
      strokeLinecap="round"
      fill="none"
      opacity={0.55}
    />
    <Circle
      cx="29"
      cy="63"
      r="4.2"
      fill="#6D4C41"
      stroke={OUTLINE_SOFT}
      strokeWidth="1.4"
    />
    <Circle
      cx="71"
      cy="43"
      r="4.8"
      fill="#6D4C41"
      stroke={OUTLINE_SOFT}
      strokeWidth="1.4"
    />
  </Svg>
);

export const LogSvg: React.FC<{ size?: number }> = ({ size = 48 }) => (
  <Svg width={size} height={size} viewBox="0 0 100 100">
    <Ellipse cx="50" cy="82" rx="34" ry="6.5" fill="rgba(74, 52, 35, 0.16)" />
    <Rect
      x="14"
      y="28"
      width="72"
      height="46"
      rx="14"
      fill="#8B5A2B"
      stroke={OUTLINE}
      strokeWidth="2.6"
    />
    <Rect x="18" y="32" width="54" height="12" rx="6" fill="#A6713E" />
    {/* Wood grain & rings */}
    <Circle
      cx="73"
      cy="51"
      r="14.5"
      fill="#EAD2AC"
      stroke={OUTLINE}
      strokeWidth="2.2"
    />
    <Circle cx="73" cy="51" r="8.5" fill="none" stroke="#A06B3B" strokeWidth="2.2" />
    <Circle cx="73" cy="51" r="3" fill="#8B5A2B" />
    <Path
      d="M 24 54 L 48 54 M 28 63 L 52 63"
      stroke="#5C3A1E"
      strokeWidth="2.8"
      strokeLinecap="round"
    />
  </Svg>
);

export const StreamSvg: React.FC<{ direction: Direction; size?: number }> = ({
  direction,
  size = 48,
}) => {
  const rotation =
    direction === 'up' ? 0 : direction === 'right' ? 90 : direction === 'down' ? 180 : 270;
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      <Rect
        x="10"
        y="10"
        width="80"
        height="80"
        rx="16"
        fill="#BAE6FD"
        stroke="#7DD3FC"
        strokeWidth="2"
        opacity={0.78}
      />
      <G transform={`rotate(${rotation} 50 50)`}>
        {/* Soft side water ripples */}
        <Path
          d="M 24 74 Q 20 55 24 32 M 76 74 Q 80 55 76 32"
          stroke="#FFFBF2"
          strokeWidth="2.4"
          strokeLinecap="round"
          fill="none"
          opacity={0.75}
        />
        {/* Flowing double-wave directional indicator */}
        <Path
          d="M 33 67 Q 42 56 50 51 Q 58 56 67 67"
          stroke="#0369A1"
          strokeWidth="5.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
        <Path
          d="M 35 45 Q 43 34 50 28 Q 57 34 65 45"
          stroke="#0284C7"
          strokeWidth="5.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
      </G>
    </Svg>
  );
};

export const ButtonSvg: React.FC<{ pressed: boolean; size?: number }> = ({
  pressed,
  size = 48,
}) => (
  <Svg width={size} height={size} viewBox="0 0 100 100">
    {/* Carved Onsen stepping stone pad */}
    <Ellipse cx="50" cy="83" rx="33" ry="6" fill="rgba(74, 52, 35, 0.14)" />
    <Circle
      cx="50"
      cy="52"
      r="33"
      fill="#C9B7A2"
      stroke={OUTLINE}
      strokeWidth="2.4"
    />
    <Circle
      cx="50"
      cy={pressed ? 52 : 47}
      r="22"
      fill={pressed ? '#52B788' : '#F4A261'}
      stroke={OUTLINE}
      strokeWidth="2.2"
    />
    {/* Engraved leaf / zen ring seal */}
    <Circle
      cx="50"
      cy={pressed ? 52 : 47}
      r="13"
      fill="none"
      stroke="#FFFBF2"
      strokeWidth="2"
      opacity={0.65}
    />
    <Path
      d={
        pressed
          ? 'M 43 52 Q 50 44 57 52 Q 50 60 43 52 Z'
          : 'M 43 47 Q 50 39 57 47 Q 50 55 43 47 Z'
      }
      fill="#FFFBF2"
      opacity={0.78}
    />
  </Svg>
);

export const GateSvg: React.FC<{ open: boolean; size?: number }> = ({ open, size = 48 }) => (
  <Svg width={size} height={size} viewBox="0 0 100 100">
    {open ? (
      <G opacity={0.38}>
        <Rect
          x="10"
          y="16"
          width="13"
          height="68"
          rx="5"
          fill="#65A30D"
          stroke={OUTLINE}
          strokeWidth="2"
        />
        <Rect
          x="77"
          y="16"
          width="13"
          height="68"
          rx="5"
          fill="#65A30D"
          stroke={OUTLINE}
          strokeWidth="2"
        />
      </G>
    ) : (
      <G>
        {/* Horizontal bamboo rails */}
        <Rect
          x="12"
          y="33"
          width="76"
          height="10"
          rx="4"
          fill="#4D7C0F"
          stroke={OUTLINE}
          strokeWidth="2"
        />
        <Rect
          x="12"
          y="57"
          width="76"
          height="10"
          rx="4"
          fill="#4D7C0F"
          stroke={OUTLINE}
          strokeWidth="2"
        />
        {/* Vertical bamboo posts */}
        <Rect
          x="20"
          y="16"
          width="14"
          height="68"
          rx="5"
          fill="#65A30D"
          stroke={OUTLINE}
          strokeWidth="2.2"
        />
        <Rect
          x="43"
          y="16"
          width="14"
          height="68"
          rx="5"
          fill="#84CC16"
          stroke={OUTLINE}
          strokeWidth="2.2"
        />
        <Rect
          x="66"
          y="16"
          width="14"
          height="68"
          rx="5"
          fill="#65A30D"
          stroke={OUTLINE}
          strokeWidth="2.2"
        />
        {/* Twine knot detailing */}
        <Path
          d="M 22 36 L 32 41 M 22 41 L 32 36 M 68 36 L 78 41 M 68 41 L 78 36 M 45 59 L 55 64 M 45 64 L 55 59"
          stroke="#EAD2AC"
          strokeWidth="2.2"
          strokeLinecap="round"
        />
      </G>
    )}
  </Svg>
);

export const StarSvg: React.FC<{ filled: boolean; size?: number }> = ({
  filled,
  size = 24,
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path
      d="M12 2L14.9 8.6L22 9.3L16.6 14L18.2 21L12 17.3L5.8 21L7.4 14L2 9.3L9.1 8.6L12 2Z"
      fill={filled ? '#F59E0B' : '#E5DDD0'}
      stroke={filled ? '#B45309' : '#C8BCA8'}
      strokeWidth="1.6"
      strokeLinejoin="round"
    />
  </Svg>
);

export const IceSvg: React.FC<{ broken: boolean; size?: number }> = ({
  broken,
  size = 48,
}) => (
  <Svg width={size} height={size} viewBox="0 0 100 100">
    {broken ? (
      <G>
        {/* Melted deep mountain spring hole */}
        <Rect
          x="10"
          y="10"
          width="80"
          height="80"
          rx="16"
          fill="#2563EB"
          stroke={OUTLINE_SOFT}
          strokeWidth="2"
          opacity={0.85}
        />
        <Ellipse cx="50" cy="52" rx="26" ry="20" fill="#1E3A8A" />
        {/* Floating frosted ice shards */}
        <Path
          d="M 18 24 L 34 18 L 26 34 Z"
          fill="#E0F2FE"
          stroke="#5B82B5"
          strokeWidth="1.4"
          strokeLinejoin="round"
        />
        <Path
          d="M 76 22 L 82 36 L 68 30 Z"
          fill="#BAE6FD"
          stroke="#5B82B5"
          strokeWidth="1.4"
          strokeLinejoin="round"
        />
        <Path
          d="M 24 76 L 38 72 L 30 84 Z"
          fill="#F0F9FF"
          stroke="#5B82B5"
          strokeWidth="1.4"
          strokeLinejoin="round"
        />
      </G>
    ) : (
      <G>
        {/* Frosted pale-blue ice block */}
        <Rect
          x="10"
          y="10"
          width="80"
          height="80"
          rx="16"
          fill="#CBEAFB"
          stroke="#5B82B5"
          strokeWidth="2.6"
        />
        <Path
          d="M 24 30 L 44 48 L 36 66 M 44 48 L 68 36 M 56 62 L 74 74"
          stroke="#FFFFFF"
          strokeWidth="3.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
      </G>
    )}
  </Svg>
);

export const PortalSvg: React.FC<{ size?: number }> = ({ size = 48 }) => (
  <Svg width={size} height={size} viewBox="0 0 100 100">
    {/* Lantern Spirit Whirlpool */}
    <Circle cx="50" cy="50" r="37" fill="#1E4E68" opacity={0.25} />
    <Circle
      cx="50"
      cy="50"
      r="29"
      fill="#2A6F97"
      stroke={OUTLINE}
      strokeWidth="2"
      opacity={0.78}
    />
    <Circle cx="50" cy="50" r="19" fill="#38A3A5" />
    <Path
      d="M 50 23 A 25 25 0 0 1 75 48 M 50 77 A 25 25 0 0 1 25 52"
      stroke="#FBBF24"
      strokeWidth="4.2"
      strokeLinecap="round"
      fill="none"
    />
    {/* Warm glowing firefly specks */}
    <Circle cx="32" cy="30" r="2.8" fill="#FDE68A" />
    <Circle cx="68" cy="70" r="2.8" fill="#FDE68A" />
    <Circle cx="50" cy="50" r="8.5" fill="#FEF3C7" />
  </Svg>
);
