import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { theme } from '../../core/theme';

export interface AutoChipProps {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  icon?: React.ReactNode;
  size?: 'sm' | 'md';
}

export const AutoChip: React.FC<AutoChipProps> = ({
  label,
  selected = false,
  onPress,
  icon,
  size = 'md',
}) => {
  const isClickable = !!onPress;

  const containerStyle: ViewStyle[] = [
    styles.base,
    styles[`size_${size}`],
    selected ? styles.selectedContainer : styles.unselectedContainer,
  ];

  const textStyle: TextStyle[] = [
    styles.textBase,
    styles[`textSize_${size}`],
    selected ? styles.selectedText : styles.unselectedText,
  ];

  return (
    <TouchableOpacity
      activeOpacity={isClickable ? 0.7 : 1}
      onPress={onPress}
      disabled={!isClickable}
      style={containerStyle}
    >
      {icon}
      <Text style={textStyle}>{label}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: theme.radius.full,
    gap: theme.spacing[1],
    alignSelf: 'flex-start',
  },
  size_sm: {
    paddingHorizontal: theme.spacing[3],
    paddingVertical: theme.spacing[1],
  },
  size_md: {
    paddingHorizontal: theme.spacing[4],
    paddingVertical: theme.spacing[2],
  },
  unselectedContainer: {
    backgroundColor: theme.colors.surface.subtle,
    borderWidth: 1,
    borderColor: theme.colors.border.default,
  },
  selectedContainer: {
    backgroundColor: theme.colors.brand.subtle,
    borderWidth: 1.5,
    borderColor: theme.colors.brand.main,
  },
  textBase: {
    fontFamily: theme.typography.fontFamily.medium,
  },
  textSize_sm: {
    fontSize: theme.typography.fontSize.xs,
  },
  textSize_md: {
    fontSize: theme.typography.fontSize.sm,
  },
  unselectedText: {
    color: theme.colors.text.secondary,
  },
  selectedText: {
    color: theme.colors.brand.text,
    fontFamily: theme.typography.fontFamily.semiBold,
  },
});
