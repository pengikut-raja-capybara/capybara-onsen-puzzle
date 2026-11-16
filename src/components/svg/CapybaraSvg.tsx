import React from 'react';
import Svg, { Circle, Ellipse, Path, G } from 'react-native-svg';

interface CapybaraSvgProps {
  size?: number;
  hasYuzuOnHead?: boolean;
  happy?: boolean;
}

export const CapybaraSvg: React.FC<CapybaraSvgProps> = ({
  size = 48,
  hasYuzuOnHead = false,
  happy = false,
}) => {
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      {/* Drop shadow */}
      <Ellipse cx="50" cy="86" rx="30" ry="7" fill="rgba(74, 52, 35, 0.18)" />

      {/* Body */}
      <Ellipse cx="50" cy="60" rx="32" ry="26" fill="#A67449" />
      <Ellipse cx="50" cy="64" rx="25" ry="18" fill="#B9885D" />

      {/* Ears */}
      <Circle cx="27" cy="30" r="8" fill="#8C5D38" />
      <Circle cx="27" cy="30" r="4" fill="#6D4527" />
      <Circle cx="73" cy="30" r="8" fill="#8C5D38" />
      <Circle cx="73" cy="30" r="4" fill="#6D4527" />

      {/* Head */}
      <Ellipse cx="50" cy="44" rx="28" ry="22" fill="#A67449" />

      {/* Snout */}
      <Ellipse cx="50" cy="50" rx="16" ry="11" fill="#8C5D38" />
      {/* Nostrils */}
      <Circle cx="44" cy="47" r="2.2" fill="#3D2616" />
      <Circle cx="56" cy="47" r="2.2" fill="#3D2616" />
      {/* Nose line & mouth */}
      <Path
        d="M 50 49 L 50 54 M 45 55 Q 50 58 55 55"
        stroke="#3D2616"
        strokeWidth="2.2"
        strokeLinecap="round"
        fill="none"
      />

      {/* Eyes */}
      {happy ? (
        <G>
          <Path
            d="M 31 39 Q 35 34 39 39"
            stroke="#2B1A0E"
            strokeWidth="3"
            strokeLinecap="round"
            fill="none"
          />
          <Path
            d="M 61 39 Q 65 34 69 39"
            stroke="#2B1A0E"
            strokeWidth="3"
            strokeLinecap="round"
            fill="none"
          />
        </G>
      ) : (
        <G>
          <Ellipse cx="35" cy="38" rx="3.4" ry="2.6" fill="#2B1A0E" />
          <Circle cx="36" cy="37" r="1" fill="#FFFFFF" />
          <Ellipse cx="65" cy="38" rx="3.4" ry="2.6" fill="#2B1A0E" />
          <Circle cx="66" cy="37" r="1" fill="#FFFFFF" />
        </G>
      )}

      {/* Rosy cheeks */}
      <Ellipse cx="28" cy="45" rx="4.5" ry="2.5" fill="#E8998D" opacity={0.65} />
      <Ellipse cx="72" cy="45" rx="4.5" ry="2.5" fill="#E8998D" opacity={0.65} />

      {/* Little paws */}
      <Ellipse cx="33" cy="80" rx="7" ry="4.5" fill="#7D512F" />
      <Ellipse cx="67" cy="80" rx="7" ry="4.5" fill="#7D512F" />

      {/* Optional Yuzu on head */}
      {hasYuzuOnHead && (
        <G>
          <Circle cx="50" cy="18" r="10" fill="#F59E0B" />
          <Circle cx="47" cy="15" r="2.5" fill="#FCD34D" opacity={0.7} />
          <Path d="M 50 8 Q 57 3 60 9 Q 54 12 50 8 Z" fill="#4D7C0F" />
        </G>
      )}
    </Svg>
  );
};
