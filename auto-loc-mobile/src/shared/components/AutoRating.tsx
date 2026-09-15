import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Star } from 'lucide-react-native';
import { theme } from '../../core/theme';

export interface AutoRatingProps {
  rating: number;
  totalReviews?: number;
  size?: 'sm' | 'md' | 'lg';
  showCount?: boolean;
}

export const AutoRating: React.FC<AutoRatingProps> = ({
  rating,
  totalReviews,
  size = 'md',
  showCount = true,
}) => {
  const iconSize = size === 'sm' ? 14 : size === 'md' ? 16 : 20;

  return (
    <View style={styles.container}>
      <Star size={iconSize} color={theme.colors.amber[500]} fill={theme.colors.amber[500]} />
      <Text style={[styles.ratingText, styles[`text_${size}`]]}>
        {Number(rating || 0).toFixed(1)}
      </Text>
      {showCount && totalReviews !== undefined && (
        <Text style={[styles.countText, styles[`countText_${size}`]]}>
          ({totalReviews})
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing[1],
  },
  ratingText: {
    fontFamily: theme.typography.fontFamily.bold,
    color: theme.colors.text.primary,
  },
  countText: {
    fontFamily: theme.typography.fontFamily.regular,
    color: theme.colors.text.secondary,
  },

  text_sm: {
    fontSize: theme.typography.fontSize.xs,
  },
  text_md: {
    fontSize: theme.typography.fontSize.sm,
  },
  text_lg: {
    fontSize: theme.typography.fontSize.base,
  },

  countText_sm: {
    fontSize: 11,
  },
  countText_md: {
    fontSize: theme.typography.fontSize.xs,
  },
  countText_lg: {
    fontSize: theme.typography.fontSize.sm,
  },
});
