import React, { useRef, useCallback } from 'react';
import {
  Pressable,
  Text,
  ActivityIndicator,
  StyleSheet,
  ViewStyle,
  TextStyle,
  Animated,
  PressableProps,
  View,
  Image,
} from 'react-native';
import { theme } from '../../core/theme';

// ─────────────────────────────────────────────
// Types — Boutons Klef / AutoLoc (Pilule Universelle 9999px Matte Premium)
// ─────────────────────────────────────────────

export interface AutoButtonProps extends Omit<PressableProps, 'style'> {
  title: string;
  variant?: 'action' | 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'dark' | 'google' | 'luxury';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  style?: ViewStyle;
  noAnimation?: boolean;
}

export const AutoButton: React.FC<AutoButtonProps> = ({
  title,
  variant = 'action',
  size = 'md',
  loading = false,
  disabled = false,
  leftIcon,
  rightIcon,
  style,
  noAnimation = false,
  ...props
}) => {
  const isDisabled = disabled || loading;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = useCallback(() => {
    if (noAnimation || isDisabled) return;
    Animated.spring(scaleAnim, {
      toValue: 0.96,
      friction: theme.motion.spring.button.friction,
      tension: theme.motion.spring.button.tension,
      useNativeDriver: true,
    }).start();
  }, [noAnimation, isDisabled]);

  const handlePressOut = useCallback(() => {
    if (noAnimation || isDisabled) return;
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: theme.motion.spring.button.friction,
      tension: theme.motion.spring.button.tension,
      useNativeDriver: true,
    }).start();
  }, [noAnimation, isDisabled]);

  const sizeStyles = SIZE_STYLES[size];
  const variantStyles = VARIANT_STYLES[variant] || VARIANT_STYLES.action;
  const textVariantStyles = TEXT_VARIANT_STYLES[variant] || TEXT_VARIANT_STYLES.action;
  const textSizeStyle = TEXT_SIZE_STYLES[size];

  const containerStyles: (ViewStyle | undefined)[] = [
    styles.base,
    { borderRadius: theme.buttonRadius[size] }, // Pilule universelle 9999px
    sizeStyles,
    variantStyles,
    isDisabled ? styles.disabled : undefined,
    style,
  ];

  const textStyleArr: TextStyle[] = [
    styles.textBase,
    textSizeStyle,
    textVariantStyles,
    isDisabled ? styles.textDisabled : {},
  ];

  const spinnerColor =
    variant === 'action' || variant === 'primary' || variant === 'dark'
      ? '#FFFFFF'
      : theme.colors.brand.main;

  // Icone par défaut si variant Google
  const effectiveLeftIcon =
    leftIcon ||
    (variant === 'google' ? (
      <Image
        source={{ uri: 'https://cdn-icons-png.flaticon.com/512/300/300221.png' }}
        style={styles.googleIcon}
        resizeMode="contain"
      />
    ) : null);

  const innerContent = loading ? (
    <ActivityIndicator size="small" color={spinnerColor} />
  ) : (
    <>
      {effectiveLeftIcon && <View style={styles.iconWrapper}>{effectiveLeftIcon}</View>}
      <Text style={textStyleArr} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.8}>
        {title}
      </Text>
      {rightIcon && <View style={styles.iconWrapper}>{rightIcon}</View>}
    </>
  );

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <Pressable
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={isDisabled}
        style={containerStyles as any}
        {...props}
      >
        {innerContent}
      </Pressable>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },

  disabled: {
    backgroundColor: theme.colors.surface.disabled,
    borderColor: theme.colors.border.disabled,
    shadowOpacity: 0,
    elevation: 0,
  },

  textBase: {
    textAlign: 'center',
  },

  textDisabled: {
    color: theme.colors.text.disabled,
  },

  iconWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },

  googleIcon: {
    width: 20,
    height: 20,
  },
});

const SIZE_STYLES: Record<string, ViewStyle> = {
  sm: {
    paddingVertical: 9,
    paddingHorizontal: 16,
    minHeight: 40,
  },
  md: {
    paddingVertical: 12,
    paddingHorizontal: 22,
    minHeight: 48,
  },
  lg: {
    paddingVertical: 15,
    paddingHorizontal: 26,
    minHeight: 54,
  },
};

const VARIANT_STYLES: Record<string, ViewStyle> = {
  action: {
    backgroundColor: theme.primitives.emerald[600], // Solide Émeraude Klef (#16A34A)
    borderWidth: 1,
    borderColor: 'rgba(22, 163, 74, 0.30)',
    ...theme.elevation.brandGlowSm,
  },
  primary: {
    backgroundColor: theme.primitives.forest[500], // Solide Forest (#14654C)
    ...theme.elevation.base,
  },
  secondary: {
    backgroundColor: theme.colors.brand.subtle,
    borderWidth: 1,
    borderColor: theme.colors.brand.border,
  },
  ghost: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E4EBDB',
    ...theme.elevation.sm,
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: theme.colors.border.default,
  },
  dark: {
    backgroundColor: theme.primitives.forest[800], // Solide Forest Night (#041912)
    borderWidth: 1,
    borderColor: 'rgba(74, 222, 128, 0.20)',
    ...theme.elevation.base,
  },
  google: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E4EBDB',
    ...theme.elevation.sm,
  },
  luxury: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.90)',
    shadowColor: '#FFFFFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 8,
  },
  danger: {
    backgroundColor: theme.colors.status.error,
    ...theme.elevation.sm,
  },
};

const TEXT_VARIANT_STYLES: Record<string, TextStyle> = {
  action: {
    color: '#FFFFFF',
    fontFamily: theme.typography.fontFamily.extraBold,
  },
  primary: {
    color: '#FFFFFF',
    fontFamily: theme.typography.fontFamily.bold,
  },
  secondary: {
    color: theme.primitives.forest[800],
    fontFamily: theme.typography.fontFamily.bold,
  },
  ghost: {
    color: theme.primitives.neutral[800],
    fontFamily: theme.typography.fontFamily.semiBold,
  },
  outline: {
    color: theme.colors.text.primary,
    fontFamily: theme.typography.fontFamily.semiBold,
  },
  dark: {
    color: '#FFFFFF',
    fontFamily: theme.typography.fontFamily.extraBold,
  },
  google: {
    color: theme.primitives.neutral[800],
    fontFamily: theme.typography.fontFamily.bold,
  },
  luxury: {
    color: '#041912',
    fontFamily: theme.typography.fontFamily.extraBold,
  },
  danger: {
    color: '#FFFFFF',
    fontFamily: theme.typography.fontFamily.bold,
  },
};

const TEXT_SIZE_STYLES: Record<string, TextStyle> = {
  sm: {
    ...theme.typography.textStyles.buttonSm,
  },
  md: {
    ...theme.typography.textStyles.button,
  },
  lg: {
    ...theme.typography.textStyles.buttonLg,
  },
};
