import React from 'react';
import { View, StyleSheet, ViewProps, ViewStyle } from 'react-native';
import { theme } from '../../core/theme';

export interface AutoCardProps extends ViewProps {
  variant?: 'elevated' | 'outlined' | 'flat';
}

export const AutoCard: React.FC<AutoCardProps> = ({
  variant = 'elevated',
  children,
  style,
  ...props
}) => {
  return (
    <View style={[styles.base, styles[variant], style as ViewStyle]} {...props}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  base: {
    backgroundColor: theme.colors.surface.card,
    borderRadius: theme.radius.xl,
    padding: theme.spacing[4],
  },
  elevated: {
    borderWidth: 1,
    borderColor: theme.colors.border.light,
    ...theme.elevation.card,
  },
  outlined: {
    borderWidth: 1.5,
    borderColor: theme.colors.border.default,
  },
  flat: {
    backgroundColor: theme.colors.surface.subtle,
  },
});
