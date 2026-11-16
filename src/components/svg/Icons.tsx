import React from 'react';
import Svg, { Circle, Path, Rect } from 'react-native-svg';

interface IconProps {
  size?: number;
  color?: string;
}

export const BackIcon: React.FC<IconProps> = ({ size = 20, color = '#4A3423' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M15 18L9 12L15 6"
      stroke={color}
      strokeWidth={2.6}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export const SettingsIcon: React.FC<IconProps> = ({ size = 22, color = '#4A3423' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="12" r="3.2" stroke={color} strokeWidth={2.2} />
    <Path
      d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9c.26.6.85 1 1.51 1H21a2 2 0 1 1 0 4h-.09c-.66 0-1.25.4-1.51 1z"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export const LockIcon: React.FC<IconProps> = ({ size = 18, color = '#7A5C48' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Rect
      x="5"
      y="11"
      width="14"
      height="10"
      rx="3"
      stroke={color}
      strokeWidth={2.2}
      fill={color}
      fillOpacity={0.14}
    />
    <Path
      d="M8 11V7.5C8 5.29 9.79 3.5 12 3.5C14.21 3.5 16 5.29 16 7.5V11"
      stroke={color}
      strokeWidth={2.2}
      strokeLinecap="round"
    />
    <Circle cx="12" cy="16" r="1.4" fill={color} />
  </Svg>
);

export const UndoIcon: React.FC<IconProps> = ({ size = 22, color = '#4A3423' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M9 14L4 9L9 4"
      stroke={color}
      strokeWidth={2.4}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M4 9H14.5C17.54 9 20 11.46 20 14.5C20 17.54 17.54 20 14.5 20H11"
      stroke={color}
      strokeWidth={2.4}
      strokeLinecap="round"
    />
  </Svg>
);

export const RestartIcon: React.FC<IconProps> = ({ size = 22, color = '#4A3423' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M3 12A9 9 0 1 0 6 5.3L3 8"
      stroke={color}
      strokeWidth={2.4}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M3 3V8H8"
      stroke={color}
      strokeWidth={2.4}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export const HintIcon: React.FC<IconProps> = ({ size = 22, color = '#92400E' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M9 18H15M10 21H14M12 3C8.69 3 6 5.69 6 9C6 11.22 7.21 13.15 9 14.19V15.5C9 15.78 9.22 16 9.5 16H14.5C14.78 16 15 15.78 15 15.5V14.19C16.79 13.15 18 11.22 18 9C18 5.69 15.31 3 12 3Z"
      stroke={color}
      strokeWidth={2.2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export const ArrowIcon: React.FC<
  IconProps & { direction: 'up' | 'down' | 'left' | 'right' }
> = ({ size = 18, color = '#4A3423', direction }) => {
  const d =
    direction === 'up'
      ? 'M6 15L12 9L18 15'
      : direction === 'down'
      ? 'M6 9L12 15L18 9'
      : direction === 'left'
      ? 'M15 6L9 12L15 18'
      : 'M9 6L15 12L9 18';
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d={d}
        stroke={color}
        strokeWidth={2.8}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
};

export const CloseIcon: React.FC<IconProps> = ({ size = 18, color = '#7A5C48' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M6 6L18 18M18 6L6 18"
      stroke={color}
      strokeWidth={2.5}
      strokeLinecap="round"
    />
  </Svg>
);

export const PlayIcon: React.FC<IconProps> = ({ size = 20, color = '#FFFFFF' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M7 5.5C7 4.65 7.95 4.15 8.65 4.62L18.65 11.12C19.28 11.53 19.28 12.47 18.65 12.88L8.65 19.38C7.95 19.85 7 19.35 7 18.5V5.5Z"
      fill={color}
    />
  </Svg>
);

export const HomeIcon: React.FC<IconProps> = ({ size = 20, color = '#4A3423' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M3 10.5L12 3L21 10.5V19.5C21 20.33 20.33 21 19.5 21H15V14.5H9V21H4.5C3.67 21 3 20.33 3 19.5V10.5Z"
      stroke={color}
      strokeWidth={2.2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export const InfoIcon: React.FC<IconProps> = ({ size = 22, color = '#4A3423' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="12" r="9" stroke={color} strokeWidth={2.2} />
    <Path
      d="M12 11V16"
      stroke={color}
      strokeWidth={2.4}
      strokeLinecap="round"
    />
    <Circle cx="12" cy="7.8" r="1.3" fill={color} />
  </Svg>
);

export const HeartIcon: React.FC<IconProps> = ({ size = 18, color = '#D97757' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M12 20.5C12 20.5 3.5 15 3.5 8.8C3.5 5.9 5.8 3.8 8.5 3.8C10.2 3.8 11.4 4.7 12 5.7C12.6 4.7 13.8 3.8 15.5 3.8C18.2 3.8 20.5 5.9 20.5 8.8C20.5 15 12 20.5 12 20.5Z"
      fill={color}
    />
  </Svg>
);
