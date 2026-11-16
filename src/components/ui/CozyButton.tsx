import React from 'react';
import { Pressable, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { FONTS, PALETTE, RADIUS, SHADOWS } from '../../theme';

interface CozyButtonProps {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'soft';
  accentColor?: string;
  leftIcon?: React.ReactNode;
  style?: ViewStyle;
  disabled?: boolean;
}

export const CozyButton: React.FC<CozyButtonProps> = ({
  label,
  onPress,
  variant = 'primary',
  accentColor = PALETTE.terracotta,
  leftIcon,
  style,
  disabled = false,
}) => {
  const isPrimary = variant === 'primary';
  const isSoft = variant === 'soft';

  return (
    <Pressable
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.base,
        isPrimary && [
          styles.primary,
          { backgroundColor: accentColor },
          SHADOWS.button,
        ],
        variant === 'secondary' && styles.secondary,
        isSoft && styles.soft,
        pressed && !disabled && styles.pressed,
        disabled && styles.disabled,
        style,
      ]}
    >
      {leftIcon && <View style={styles.iconWrap}>{leftIcon}</View>}
      <Text
        style={[
          styles.label,
          isPrimary ? styles.labelPrimary : styles.labelSecondary,
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  base: {
    minHeight: 50,
    borderRadius: RADIUS.lg,
    paddingHorizontal: 20,
    paddingVertical: 13,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  primary: {
    backgroundColor: PALETTE.terracotta,
  },
  secondary: {
    backgroundColor: PALETTE.creamLight,
    borderWidth: 2,
    borderColor: PALETTE.borderWarm,
  },
  soft: {
    backgroundColor: PALETTE.creamDark,
  },
  pressed: {
    transform: [{ scale: 0.97 }],
    opacity: 0.92,
  },
  disabled: {
    opacity: 0.45,
  },
  iconWrap: {
    marginRight: 8,
  },
  label: {
    fontFamily: FONTS.semiBold,
    fontSize: 16,
  },
  labelPrimary: {
    color: PALETTE.white,
  },
  labelSecondary: {
    color: PALETTE.espresso,
  },
});
