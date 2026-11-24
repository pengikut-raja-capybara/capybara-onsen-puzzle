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

export const CrownIcon: React.FC<IconProps> = ({ size = 20, color = '#D97757' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M4 18L3 8L8.5 12.5L12 6L15.5 12.5L21 8L20 18H4Z"
      stroke={color}
      strokeWidth={2.2}
      strokeLinecap="round"
      strokeLinejoin="round"
      fill={color}
      fillOpacity={0.15}
    />
  </Svg>
);

export const CalendarIcon: React.FC<IconProps> = ({ size = 20, color = '#4A3423' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Rect
      x="3.5"
      y="5"
      width="17"
      height="15.5"
      rx="3"
      stroke={color}
      strokeWidth={2.2}
    />
    <Path
      d="M8 3V6.5M16 3V6.5M3.5 9.5H20.5"
      stroke={color}
      strokeWidth={2.2}
      strokeLinecap="round"
    />
    <Circle cx="12" cy="15" r="2" fill={color} />
  </Svg>
);

export const TrophyIcon: React.FC<IconProps> = ({ size = 20, color = '#D97757' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M7 4H17V9C17 11.76 14.76 14 12 14C9.24 14 7 11.76 7 9V4Z"
      stroke={color}
      strokeWidth={2.2}
      strokeLinejoin="round"
      fill={color}
      fillOpacity={0.14}
    />
    <Path
      d="M7 6H4.5C3.95 6 3.5 6.45 3.5 7V8C3.5 9.66 4.84 11 6.5 11H7M17 6H19.5C20.05 6 20.5 6.45 20.5 7V8C20.5 9.66 19.16 11 17.5 11H17M12 14V18M8.5 20H15.5"
      stroke={color}
      strokeWidth={2.2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export const ShirtIcon: React.FC<IconProps> = ({ size = 20, color = '#D97757' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M8.5 4L4 7.5L6.2 11L8.5 9.5V19.5C8.5 20.05 8.95 20.5 9.5 20.5H14.5C15.05 20.5 15.5 20.05 15.5 19.5V9.5L17.8 11L20 7.5L15.5 4C14.7 5.3 13.45 6 12 6C10.55 6 9.3 5.3 8.5 4Z"
      stroke={color}
      strokeWidth={2.2}
      strokeLinecap="round"
      strokeLinejoin="round"
      fill={color}
      fillOpacity={0.15}
    />
  </Svg>
);

export const DpadIcon: React.FC<IconProps> = ({ size = 20, color = '#4A3423' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M9.5 3.5H14.5V9.5H20.5V14.5H14.5V20.5H9.5V14.5H3.5V9.5H9.5V3.5Z"
      stroke={color}
      strokeWidth={2.1}
      strokeLinejoin="round"
      fill={color}
      fillOpacity={0.12}
    />
  </Svg>
);

export const VolumeOnIcon: React.FC<IconProps> = ({ size = 20, color = '#D97757' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M11 5L6 9H3V15H6L11 19V5Z"
      stroke={color}
      strokeWidth={2.2}
      strokeLinecap="round"
      strokeLinejoin="round"
      fill={color}
      fillOpacity={0.14}
    />
    <Path
      d="M15.5 8.5C16.5 9.6 17 10.8 17 12C17 13.2 16.5 14.4 15.5 15.5M18.5 6C20.2 7.8 21 9.8 21 12C21 14.2 20.2 16.2 18.5 18"
      stroke={color}
      strokeWidth={2.1}
      strokeLinecap="round"
    />
  </Svg>
);

export const VolumeOffIcon: React.FC<IconProps> = ({ size = 20, color = '#9C8270' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M11 5L6 9H3V15H6L11 19V5Z"
      stroke={color}
      strokeWidth={2.2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M16 9L21 15M21 9L16 15"
      stroke={color}
      strokeWidth={2.2}
      strokeLinecap="round"
    />
  </Svg>
);

export const StampIcon: React.FC<IconProps & { stampId: string }> = ({
  stampId,
  size = 24,
  color = '#FFFFFF',
}) => {
  switch (stampId) {
    case 'first_bath':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Rect x="4" y="11" width="16" height="8" rx="4" stroke={color} strokeWidth={2} />
          <Path
            d="M8.5 8Q7.5 6 8.5 4M12 7.5Q13 5.5 12 3.5M15.5 8Q14.5 6 15.5 4"
            stroke={color}
            strokeWidth={1.8}
            strokeLinecap="round"
          />
          <Path d="M7 15Q12 13 17 15" stroke={color} strokeWidth={1.6} strokeLinecap="round" />
        </Svg>
      );
    case 'daily_soaker':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Rect x="4" y="5" width="16" height="15" rx="3" stroke={color} strokeWidth={2} />
          <Path d="M8 3.5V6.5M16 3.5V6.5M4 9.5H20" stroke={color} strokeWidth={2} strokeLinecap="round" />
          <Circle cx="12" cy="14.5" r="2.8" fill={color} />
        </Svg>
      );
    case 'yuzu_collector':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Circle cx="12" cy="13.5" r="6.5" stroke={color} strokeWidth={2} fill={color} fillOpacity={0.2} />
          <Path d="M12 7V4.5" stroke={color} strokeWidth={2} strokeLinecap="round" />
          <Path d="M12 5.5Q16 3 17 6.5Q14 8 12 5.5Z" fill={color} />
        </Svg>
      );
    case 'onsen_traveler':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Path
            d="M4 9Q8 6 12 9T20 9M4 14Q8 11 12 14T20 14M4 19Q8 16 12 19T20 19"
            stroke={color}
            strokeWidth={2.2}
            strokeLinecap="round"
          />
        </Svg>
      );
    case 'snow_master':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Path
            d="M12 3V21M4.2 7.5L19.8 16.5M19.8 7.5L4.2 16.5"
            stroke={color}
            strokeWidth={2}
            strokeLinecap="round"
          />
          <Circle cx="12" cy="12" r="2.4" fill={color} />
        </Svg>
      );
    case 'zen_soul':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Path
            d="M12 4.5C9.5 8 9 11.5 12 14.5C15 11.5 14.5 8 12 4.5Z"
            stroke={color}
            strokeWidth={1.9}
            fill={color}
            fillOpacity={0.22}
          />
          <Path
            d="M12 14.5C8.5 13 6 10.5 5 8C4.5 11.5 7 15 12 15.5C17 15 19.5 11.5 19 8C18 10.5 15.5 13 12 14.5Z"
            stroke={color}
            strokeWidth={1.9}
            strokeLinejoin="round"
          />
          <Path d="M6 19Q12 17 18 19" stroke={color} strokeWidth={1.8} strokeLinecap="round" />
        </Svg>
      );
    case 'sanctuary_decorator':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Path d="M12 3V6" stroke={color} strokeWidth={2} strokeLinecap="round" />
          <Rect
            x="7"
            y="6.5"
            width="10"
            height="11.5"
            rx="4.5"
            stroke={color}
            strokeWidth={2}
            fill={color}
            fillOpacity={0.2}
          />
          <Path d="M9.5 12H14.5M12 18V21" stroke={color} strokeWidth={1.8} strokeLinecap="round" />
        </Svg>
      );
    case 'endless_daily':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          {/* Radiant morning sun + infinity loop */}
          <Circle cx="12" cy="9" r="3.4" stroke={color} strokeWidth={2} fill={color} fillOpacity={0.22} />
          <Path
            d="M12 2.8V4.2M6.2 5.2L7.3 6.3M17.8 5.2L16.7 6.3M4.5 9.5H6M18 9.5H19.5"
            stroke={color}
            strokeWidth={1.8}
            strokeLinecap="round"
          />
          <Path
            d="M7.5 18.2C5.8 18.2 5 16.9 5.5 15.6C6 14.3 7.8 14.3 9.5 15.8L14.5 18.2C16.2 19.3 18 18.5 18.5 17.2C19 15.9 18.2 14.6 16.5 14.6C14.8 14.6 13 15.8 11.5 17L9.5 18C8.8 18.2 8.1 18.2 7.5 18.2Z"
            stroke={color}
            strokeWidth={1.9}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </Svg>
      );
    case 'endless_zen':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          {/* Enso zen brush circle + calm leaf sprout */}
          <Path
            d="M17.2 6.8C15.2 4.6 11.8 4 9 5.3C5.8 6.8 4.4 10.6 5.8 14C7.2 17.4 11 19 14.5 17.7C17.2 16.7 19 14.2 19 11.4"
            stroke={color}
            strokeWidth={2.3}
            strokeLinecap="round"
          />
          <Path
            d="M12 14.5C9.8 13.5 9.5 10.5 12 8.5C14.5 10.5 14.2 13.5 12 14.5Z"
            stroke={color}
            strokeWidth={1.8}
            fill={color}
            fillOpacity={0.25}
          />
        </Svg>
      );
    case 'endless_total':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          {/* Sparkling diamond medal + rising waves */}
          <Path
            d="M12 3.5L17.5 9.5L12 15.5L6.5 9.5L12 3.5Z"
            stroke={color}
            strokeWidth={2}
            strokeLinejoin="round"
            fill={color}
            fillOpacity={0.22}
          />
          <Path
            d="M5 18.5Q8.5 16.5 12 18.5T19 18.5"
            stroke={color}
            strokeWidth={2}
            strokeLinecap="round"
          />
          <Circle cx="12" cy="9.5" r="1.5" fill={color} />
        </Svg>
      );
    case 'capy_royalty':
    default:
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Path
            d="M4 17L3 8L8.5 12L12 5.5L15.5 12L21 8L20 17H4Z"
            stroke={color}
            strokeWidth={2}
            strokeLinejoin="round"
            fill={color}
            fillOpacity={0.25}
          />
        </Svg>
      );
  }
};

export const ZenLotusIcon: React.FC<IconProps> = ({ size = 20, color = '#FFFFFF' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M12 4C9.5 7.8 9 11.5 12 14.5C15 11.5 14.5 7.8 12 4Z"
      stroke={color}
      strokeWidth={2}
      fill={color}
      fillOpacity={0.2}
    />
    <Path
      d="M12 14.5C8 13 5.5 10.5 4.5 7.5C4 11.5 6.8 15.5 12 16C17.2 15.5 20 11.5 19.5 7.5C18.5 10.5 16 13 12 14.5Z"
      stroke={color}
      strokeWidth={2}
      strokeLinejoin="round"
    />
    <Path d="M5.5 19.5Q12 17.5 18.5 19.5" stroke={color} strokeWidth={2} strokeLinecap="round" />
  </Svg>
);
