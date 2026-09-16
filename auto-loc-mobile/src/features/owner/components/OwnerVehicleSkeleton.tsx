import React, { useEffect, useRef } from 'react';
import {
  StyleSheet,
  View,
  Animated,
  ScrollView,
} from 'react-native';

export const OwnerVehicleSkeleton: React.FC = () => {
  const pulseAnim = useRef(new Animated.Value(0.35)).current;

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 0.85,
          duration: 750,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0.35,
          duration: 750,
          useNativeDriver: true,
        }),
      ])
    );
    pulse.start();

    return () => pulse.stop();
  }, [pulseAnim]);

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.container}>
      {/* 1. Header Summary Widget Skeleton */}
      <Animated.View style={[styles.headerWidgetSkeleton, { opacity: pulseAnim }]}>
        <View style={styles.topRowSkeleton}>
          <View style={styles.titleLineSkeleton} />
          <View style={styles.buttonSkeleton} />
        </View>
        <View style={styles.metricsBoxSkeleton} />
        <View style={styles.barSkeleton} />
      </Animated.View>

      {/* 2. Search & Filter Row Skeleton */}
      <View style={styles.searchRowSkeleton}>
        <Animated.View style={[styles.searchBoxSkeleton, { opacity: pulseAnim }]} />
        <Animated.View style={[styles.addBtnSkeleton, { opacity: pulseAnim }]} />
      </View>

      {/* 3. Vehicle Cards Skeletons */}
      {[1, 2, 3].map((_, idx) => (
        <Animated.View key={idx} style={[styles.cardSkeleton, { opacity: pulseAnim }]}>
          <View style={styles.imageSkeleton} />
          <View style={styles.contentSkeleton}>
            <View style={styles.lineLong} />
            <View style={styles.lineShort} />
            <View style={styles.chipsRowSkeleton}>
              <View style={styles.chipSkeleton} />
              <View style={styles.chipSkeleton} />
              <View style={styles.chipSkeleton} />
            </View>
          </View>
        </Animated.View>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 100,
  },
  headerWidgetSkeleton: {
    height: 180,
    backgroundColor: '#051B14',
    borderRadius: 22,
    padding: 18,
    marginBottom: 16,
    justifyContent: 'space-between',
  },
  topRowSkeleton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  titleLineSkeleton: {
    width: 140,
    height: 20,
    borderRadius: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
  },
  buttonSkeleton: {
    width: 80,
    height: 32,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  metricsBoxSkeleton: {
    height: 50,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  barSkeleton: {
    height: 36,
    borderRadius: 10,
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
  },
  searchRowSkeleton: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 14,
  },
  searchBoxSkeleton: {
    flex: 1,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#E2E8F0',
  },
  addBtnSkeleton: {
    width: 90,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#CBD5E1',
  },
  cardSkeleton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 16,
  },
  imageSkeleton: {
    width: '100%',
    height: 150,
    backgroundColor: '#E2E8F0',
  },
  contentSkeleton: {
    padding: 16,
    gap: 10,
  },
  lineLong: {
    width: '70%',
    height: 18,
    borderRadius: 6,
    backgroundColor: '#E2E8F0',
  },
  lineShort: {
    width: '40%',
    height: 12,
    borderRadius: 4,
    backgroundColor: '#E2E8F0',
  },
  chipsRowSkeleton: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 6,
  },
  chipSkeleton: {
    width: 70,
    height: 24,
    borderRadius: 8,
    backgroundColor: '#E2E8F0',
  },
});
