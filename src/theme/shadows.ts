import { Platform, ViewStyle } from 'react-native';

export const SHADOWS: Record<'soft' | 'card' | 'button', ViewStyle> = {
  soft: Platform.select({
    web: { boxShadow: '0px 3px 8px rgba(74, 52, 35, 0.08)' },
    default: {
      shadowColor: '#4A3423',
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.08,
      shadowRadius: 8,
      elevation: 3,
    },
  }) as ViewStyle,
  card: Platform.select({
    web: { boxShadow: '0px 8px 18px rgba(74, 52, 35, 0.14)' },
    default: {
      shadowColor: '#4A3423',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.14,
      shadowRadius: 16,
      elevation: 6,
    },
  }) as ViewStyle,
  button: Platform.select({
    web: { boxShadow: '0px 4px 10px rgba(181, 83, 53, 0.28)' },
    default: {
      shadowColor: '#B55335',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.25,
      shadowRadius: 8,
      elevation: 4,
    },
  }) as ViewStyle,
};
