import React, { useEffect, useRef } from 'react';
import {
  StyleSheet,
  View,
  Animated,
  ScrollView,
  Platform,
} from 'react-native';

export const HostProfileSkeleton: React.FC = () => {
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
    <View style={styles.rootContainer}>
      {/* Header Bar Skeleton */}
      <View style={styles.headerBar}>
        <Animated.View style={[styles.headerIconBtn, { opacity: pulseAnim }]} />
        <Animated.View style={[styles.headerTitleLine, { opacity: pulseAnim }]} />
        <Animated.View style={[styles.headerIconBtn, { opacity: pulseAnim }]} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* 1. Hero Card Dark Skeleton */}
        <View style={styles.heroCard}>
          <View style={styles.avatarRow}>
            <Animated.View style={[styles.avatarCircle, { opacity: pulseAnim }]} />
            <View style={styles.hostIdentityLines}>
              <Animated.View style={[styles.nameLine, { opacity: pulseAnim }]} />
              <View style={styles.badgePillRow}>
                <Animated.View style={[styles.pillSkeleton, { width: 90, opacity: pulseAnim }]} />
                <Animated.View style={[styles.pillSkeleton, { width: 100, opacity: pulseAnim }]} />
              </View>
            </View>
          </View>

          {/* Stats Box Grid */}
          <View style={styles.statsGrid}>
            <Animated.View style={[styles.statBoxSkeleton, { opacity: pulseAnim }]} />
            <View style={styles.statDivider} />
            <Animated.View style={[styles.statBoxSkeleton, { opacity: pulseAnim }]} />
            <View style={styles.statDivider} />
            <Animated.View style={[styles.statBoxSkeleton, { opacity: pulseAnim }]} />
          </View>
        </View>

        {/* 2. Guarantees Card Skeleton */}
        <View style={styles.guaranteesCard}>
          {[1, 2].map((i) => (
            <View key={`guarantee-${i}`} style={styles.guaranteeRow}>
              <Animated.View style={[styles.iconCircle, { opacity: pulseAnim }]} />
              <View style={styles.guaranteeTextCol}>
                <Animated.View style={[styles.titleLineShort, { opacity: pulseAnim }]} />
                <Animated.View style={[styles.subLineLong, { opacity: pulseAnim }]} />
              </View>
            </View>
          ))}
        </View>

        {/* 3. Section Annonces / Vehicles Skeleton */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <Animated.View style={[styles.sectionTitleLine, { opacity: pulseAnim }]} />
            <Animated.View style={[styles.countBadgeSkeleton, { opacity: pulseAnim }]} />
          </View>

          <View style={styles.filterScroll}>
            {[70, 90, 80].map((w, i) => (
              <Animated.View key={`flt-${i}`} style={[styles.filterPillSkeleton, { width: w, opacity: pulseAnim }]} />
            ))}
          </View>

          {/* Cards Véhicules Skeletons */}
          <View style={styles.vehiclesList}>
            {[1, 2].map((i) => (
              <View key={`veh-skel-${i}`} style={styles.vehicleCardSkeleton}>
                <Animated.View style={[styles.vehicleImageSkeleton, { opacity: pulseAnim }]} />
                <View style={styles.vehicleContentBody}>
                  <Animated.View style={[styles.titleLineShort, { width: '65%', opacity: pulseAnim }]} />
                  <Animated.View style={[styles.subLineLong, { width: '40%', opacity: pulseAnim }]} />
                  <View style={styles.specsRowSkeleton}>
                    {[60, 65, 55].map((w, j) => (
                      <Animated.View key={j} style={[styles.specChipSkeleton, { width: w, opacity: pulseAnim }]} />
                    ))}
                  </View>
                  <Animated.View style={[styles.priceBlockSkeleton, { opacity: pulseAnim }]} />
                </View>
              </View>
            ))}
          </View>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  rootContainer: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  headerBar: {
    backgroundColor: '#041912',
    paddingTop: Platform.OS === 'ios' ? 56 : 40,
    paddingBottom: 16,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerIconBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
  },
  headerTitleLine: {
    width: 140,
    height: 18,
    borderRadius: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  scrollContent: {
    paddingBottom: 24,
  },
  heroCard: {
    backgroundColor: '#041912',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 24,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
  avatarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  avatarCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
  },
  hostIdentityLines: {
    flex: 1,
    gap: 8,
  },
  nameLine: {
    width: '60%',
    height: 22,
    borderRadius: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  badgePillRow: {
    flexDirection: 'row',
    gap: 6,
  },
  pillSkeleton: {
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
  },
  statsGrid: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderRadius: 18,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginTop: 20,
  },
  statBoxSkeleton: {
    width: 70,
    height: 28,
    borderRadius: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
  },
  statDivider: {
    width: 1,
    height: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
  },
  guaranteesCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 20,
    padding: 16,
    gap: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  guaranteeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#E2E8F0',
  },
  guaranteeTextCol: {
    flex: 1,
    gap: 6,
  },
  titleLineShort: {
    width: '50%',
    height: 14,
    borderRadius: 5,
    backgroundColor: '#E2E8F0',
  },
  subLineLong: {
    width: '85%',
    height: 12,
    borderRadius: 4,
    backgroundColor: '#F1F5F9',
  },
  sectionContainer: {
    marginTop: 24,
    paddingHorizontal: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  sectionTitleLine: {
    width: 160,
    height: 20,
    borderRadius: 6,
    backgroundColor: '#CBD5E1',
  },
  countBadgeSkeleton: {
    width: 36,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#E2E8F0',
  },
  filterScroll: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 14,
  },
  filterPillSkeleton: {
    height: 32,
    borderRadius: 16,
    backgroundColor: '#E2E8F0',
  },
  vehiclesList: {
    gap: 16,
  },
  vehicleCardSkeleton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: '#E4EBDB',
  },
  vehicleImageSkeleton: {
    width: '100%',
    height: 190,
    backgroundColor: '#CBD5E1',
  },
  vehicleContentBody: {
    padding: 18,
    gap: 8,
  },
  specsRowSkeleton: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 4,
  },
  specChipSkeleton: {
    height: 24,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
  },
  priceBlockSkeleton: {
    width: '100%',
    height: 52,
    borderRadius: 16,
    backgroundColor: '#041912',
    marginTop: 6,
  },
});
