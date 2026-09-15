import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, ViewProps, ViewStyle } from 'react-native';
import { theme } from '../../core/theme';

export interface AutoSkeletonProps extends ViewProps {
  width?: number | `${number}%` | 'auto';
  height?: number;
  borderRadius?: number;
}

export const AutoSkeleton: React.FC<AutoSkeletonProps> = ({
  width = '100%',
  height = 20,
  borderRadius = theme.radius.md,
  style,
  ...props
}) => {
  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 0.8,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.3,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, [opacity]);

  return (
    <Animated.View
      style={[
        styles.skeleton,
        {
          width,
          height,
          borderRadius,
          opacity,
        },
        style as ViewStyle,
      ]}
      {...props}
    />
  );
};

const styles = StyleSheet.create({
  skeleton: {
    backgroundColor: '#E2E8F0',
  },
});
