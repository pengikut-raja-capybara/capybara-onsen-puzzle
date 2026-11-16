import React from 'react';
import Svg, { Circle, Ellipse, Path, Rect, G } from 'react-native-svg';
import { Direction } from '../../engine/types';

export const OnsenSvg: React.FC<{ size?: number }> = ({ size = 48 }) => (
  <Svg width={size} height={size} viewBox="0 0 100 100">
    {/* Wooden tub rim */}
    <Rect x="8" y="18" width="84" height="72" rx="22" fill="#9C6644" />
    <Rect x="14" y="24" width="72" height="60" rx="18" fill="#B08968" />
    {/* Warm turquoise water */}
    <Rect x="19" y="29" width="62" height="50" rx="14" fill="#56CFE1" />
    <Ellipse cx="50" cy="54" rx="22" ry="12" fill="#80FFDB" opacity={0.35} />
    {/* Steam wisps */}
    <Path
      d="M 34 22 Q 30 14 35 7 M 50 20 Q 55 12 50 4 M 66 22 Q 62 14 67 7"
      stroke="#FFFFFF"
      strokeWidth="3.5"
      strokeLinecap="round"
      fill="none"
      opacity={0.85}
    />
  </Svg>
);

export const YuzuSvg: React.FC<{ size?: number }> = ({ size = 36 }) => (
  <Svg width={size} height={size} viewBox="0 0 100 100">
    <Ellipse cx="50" cy="82" rx="20" ry="5" fill="rgba(0,0,0,0.12)" />
    <Circle cx="50" cy="54" r="26" fill="#F59E0B" />
    <Circle cx="42" cy="44" r="6" fill="#FDE68A" opacity={0.65} />
    <Path d="M 50 28 L 50 20" stroke="#78350F" strokeWidth="4" strokeLinecap="round" />
    <Path d="M 50 24 Q 68 12 72 26 Q 58 32 50 24 Z" fill="#65A30D" />
  </Svg>
);

export const RockSvg: React.FC<{ size?: number }> = ({ size = 48 }) => (
  <Svg width={size} height={size} viewBox="0 0 100 100">
    <Ellipse cx="50" cy="83" rx="33" ry="7" fill="rgba(0,0,0,0.15)" />
    <Path
      d="M 16 74 Q 14 40 34 28 Q 52 18 72 30 Q 86 42 84 74 Q 50 82 16 74 Z"
      fill="#7D8597"
    />
    <Path
      d="M 24 66 Q 24 44 38 35 Q 50 27 64 34 Q 44 40 32 66 Z"
      fill="#979DAC"
      opacity={0.7}
    />
  </Svg>
);

export const MudSvg: React.FC<{ size?: number }> = ({ size = 48 }) => (
  <Svg width={size} height={size} viewBox="0 0 100 100">
    <Ellipse cx="50" cy="52" rx="38" ry="30" fill="#8D6E63" opacity={0.85} />
    <Ellipse cx="44" cy="48" rx="24" ry="16" fill="#795548" opacity={0.7} />
    <Circle cx="30" cy="64" r="4" fill="#6D4C41" />
    <Circle cx="72" cy="42" r="5" fill="#6D4C41" />
  </Svg>
);

export const LogSvg: React.FC<{ size?: number }> = ({ size = 48 }) => (
  <Svg width={size} height={size} viewBox="0 0 100 100">
    <Ellipse cx="50" cy="82" rx="34" ry="7" fill="rgba(0,0,0,0.16)" />
    <Rect x="14" y="28" width="72" height="46" rx="14" fill="#8B5A2B" />
    <Rect x="18" y="32" width="64" height="14" rx="7" fill="#A06B3B" />
    {/* Wood grain & rings */}
    <Circle cx="74" cy="51" r="14" fill="#DEB887" />
    <Circle cx="74" cy="51" r="8" fill="none" stroke="#A06B3B" strokeWidth="2.5" />
    <Circle cx="74" cy="51" r="3" fill="#8B5A2B" />
    <Path
      d="M 24 55 L 48 55 M 28 64 L 54 64"
      stroke="#6B4226"
      strokeWidth="3"
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
      <Rect x="10" y="10" width="80" height="80" rx="14" fill="#90E0EF" opacity={0.55} />
      <G transform={`rotate(${rotation} 50 50)`}>
        <Path
          d="M 32 65 L 50 45 L 68 65"
          stroke="#0077B6"
          strokeWidth="7"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
        <Path
          d="M 36 44 L 50 28 L 64 44"
          stroke="#0096C7"
          strokeWidth="6"
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
    <Circle cx="50" cy="54" r="32" fill="#A8A29E" />
    <Circle
      cx="50"
      cy={pressed ? 54 : 48}
      r="22"
      fill={pressed ? '#84CC16' : '#EF4444'}
    />
    <Circle
      cx="44"
      cy={pressed ? 48 : 42}
      r="6"
      fill="#FFFFFF"
      opacity={0.4}
    />
  </Svg>
);

export const GateSvg: React.FC<{ open: boolean; size?: number }> = ({ open, size = 48 }) => (
  <Svg width={size} height={size} viewBox="0 0 100 100">
    {open ? (
      <G opacity={0.3}>
        <Rect x="12" y="16" width="12" height="68" rx="4" fill="#65A30D" />
        <Rect x="76" y="16" width="12" height="68" rx="4" fill="#65A30D" />
      </G>
    ) : (
      <G>
        <Rect x="12" y="34" width="76" height="10" rx="4" fill="#4D7C0F" />
        <Rect x="12" y="56" width="76" height="10" rx="4" fill="#4D7C0F" />
        <Rect x="22" y="16" width="14" height="68" rx="5" fill="#65A30D" />
        <Rect x="43" y="16" width="14" height="68" rx="5" fill="#84CC16" />
        <Rect x="64" y="16" width="14" height="68" rx="5" fill="#65A30D" />
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
      stroke={filled ? '#D97706' : '#C8BCA8'}
      strokeWidth="1.5"
      strokeLinejoin="round"
    />
  </Svg>
);
