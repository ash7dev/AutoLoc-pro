import React, { useState, useRef } from 'react';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  TextInputProps,
  TouchableOpacity,
  Pressable,
} from 'react-native';
import { Eye, EyeOff } from 'lucide-react-native';
import { theme } from '../../core/theme';

import { StyleProp, ViewStyle } from 'react-native';

export interface AutoInputProps extends TextInputProps {
  label?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  isPassword?: boolean;
  containerStyle?: StyleProp<ViewStyle>;
  wrapperStyle?: StyleProp<ViewStyle>;
}

export const AutoInput: React.FC<AutoInputProps> = ({
  label,
  error,
  leftIcon,
  rightIcon,
  isPassword = false,
  containerStyle,
  wrapperStyle,
  style,
  secureTextEntry,
  ...props
}) => {
  const inputRef = useRef<TextInput>(null);
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const containerBorderColor = error
    ? theme.colors.status.error
    : isFocused
    ? theme.colors.border.focus
    : theme.colors.border.default;

  const isSecure =
    secureTextEntry !== undefined
      ? secureTextEntry
      : isPassword && !showPassword;

  return (
    <View style={[styles.wrapper, wrapperStyle]}>
      {label && (
        <Text style={styles.label} onPress={() => inputRef.current?.focus()}>
          {label}
        </Text>
      )}
      <Pressable
        onPress={() => inputRef.current?.focus()}
        style={[
          styles.inputContainer,
          { borderColor: containerBorderColor },
          isFocused ? styles.focusedShadow : {},
          containerStyle,
        ]}
      >
        {leftIcon && (
          <View style={styles.leftIconContainer} pointerEvents="none">
            {leftIcon}
          </View>
        )}
        <TextInput
          ref={inputRef}
          placeholderTextColor={theme.colors.text.tertiary}
          secureTextEntry={isSecure}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          style={[styles.input, style]}
          {...props}
        />
        {rightIcon ? (
          <View style={styles.rightIconContainer}>{rightIcon}</View>
        ) : isPassword ? (
          <TouchableOpacity
            style={styles.rightIconContainer}
            onPress={() => setShowPassword((prev) => !prev)}
            activeOpacity={0.7}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            {showPassword ? (
              <EyeOff size={20} color={theme.colors.text.secondary} />
            ) : (
              <Eye size={20} color={theme.colors.text.secondary} />
            )}
          </TouchableOpacity>
        ) : null}
      </Pressable>
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: theme.spacing[4],
    width: '100%',
  },
  label: {
    fontFamily: theme.typography.fontFamily.semiBold,
    fontSize: 13,
    lineHeight: 18,
    letterSpacing: -0.1,
    color: '#041912',
    marginBottom: 6,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface.canvas,
    borderWidth: 1.5,
    borderRadius: theme.radius.lg,
    paddingHorizontal: theme.spacing[4],
    minHeight: 52,
  },
  focusedShadow: {
    backgroundColor: theme.colors.surface.page,
    ...theme.elevation.sm,
  },
  leftIconContainer: {
    marginRight: theme.spacing[3],
  },
  rightIconContainer: {
    padding: theme.spacing[1],
  },
  input: {
    flex: 1,
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.text.primary,
    paddingVertical: theme.spacing[3],
  },
  errorText: {
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.status.error,
    marginTop: theme.spacing[1],
  },
});
