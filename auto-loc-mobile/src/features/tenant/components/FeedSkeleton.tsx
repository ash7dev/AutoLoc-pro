import React, { useEffect, useRef } from 'react';
import { StyleSheet, View, Animated, ScrollView } from 'react-native';

export const FeedSkeleton: React.FC = () => {
  const fadeAnim = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(fadeAnim, {
          toValue: 0.8,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0.3,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    );
    pulse.start();

    return () => pulse.stop();
  }, [fadeAnim]);

  const renderSkeletonCard = (index: number) => (
    <Animated.View
      key={index}
      style={[styles.skeletonCard, { opacity: fadeAnim }]}
    >
      <View style={styles.topBadgePlaceholder} />
      <View style={styles.bottomContentPlaceholder}>
        <View style={styles.titleLinePlaceholder} />
        <View style={styles.subtitleLinePlaceholder} />
        <View style={styles.pillsRowPlaceholder}>
          <View style={styles.pillPlaceholder} />
          <View style={styles.pillPlaceholder} />
        </View>
        <View style={styles.priceLinePlaceholder} />
      </View>
    </Animated.View>
  );

  return (
    <View style={styles.sectionContainer}>
      {/* Section 1 Skeleton */}
      <View style={styles.sectionHeaderPlaceholder}>
        <Animated.View style={[styles.iconPlaceholder, { opacity: fadeAnim }]} />
        <Animated.View style={[styles.headerTextPlaceholder, { opacity: fadeAnim }]} />
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalRow}>
        {[1, 2, 3].map((_, i) => renderSkeletonCard(i))}
      </ScrollView>

      {/* Section 2 Skeleton */}
      <View style={[styles.sectionHeaderPlaceholder, { marginTop: 24 }]}>
        <Animated.View style={[styles.iconPlaceholder, { opacity: fadeAnim }]} />
        <Animated.View style={[styles.headerTextPlaceholder, { opacity: fadeAnim }]} />
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalRow}>
        {[1, 2, 3].map((_, i) => renderSkeletonCard(i + 10))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  sectionContainer: {
    marginVertical: 14,
  },
  sectionHeaderPlaceholder: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  iconPlaceholder: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: '#E2E8F0',
    marginRight: 10,
  },
  headerTextPlaceholder: {
    width: 140,
    height: 20,
    borderRadius: 6,
    backgroundColor: '#E2E8F0',
  },
  horizontalRow: {
    paddingLeft: 16,
    marginBottom: 16,
  },
  skeletonCard: {
    width: 285,
    height: 370,
    borderRadius: 22,
    backgroundColor: '#CBD5E1',
    marginRight: 16,
    padding: 16,
    justifyContent: 'space-between',
  },
  topBadgePlaceholder: {
    width: 80,
    height: 22,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
  },
  bottomContentPlaceholder: {
    gap: 8,
  },
  titleLinePlaceholder: {
    width: '75%',
    height: 18,
    borderRadius: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
  },
  subtitleLinePlaceholder: {
    width: '50%',
    height: 14,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
  },
  pillsRowPlaceholder: {
    flexDirection: 'row',
    gap: 8,
    marginVertical: 4,
  },
  pillPlaceholder: {
    width: 60,
    height: 18,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  priceLinePlaceholder: {
    width: '60%',
    height: 20,
    borderRadius: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
  },
});
