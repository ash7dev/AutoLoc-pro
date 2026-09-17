import React, { useEffect, useRef } from 'react';
import { StyleSheet, View, Animated } from 'react-native';

export const OwnerHomeSkeleton: React.FC = () => {
  const pulseAnim = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 0.9,
          duration: 750,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0.4,
          duration: 750,
          useNativeDriver: true,
        }),
      ])
    );
    pulse.start();

    return () => pulse.stop();
  }, [pulseAnim]);

  return (
    <View style={styles.container}>
      {/* 1. Quick Actions 2x2 Grid Skeleton */}
      <View style={styles.quickActionsGrid}>
        {[1, 2, 3, 4].map((_, idx) => (
          <Animated.View
            key={idx}
            style={[styles.quickActionCardSkeleton, { opacity: pulseAnim }]}
          >
            <View style={styles.quickActionIconPlaceholder} />
            <View style={styles.quickActionTextPlaceholder} />
          </Animated.View>
        ))}
      </View>

      {/* 2. Performance Widget Skeleton */}
      <Animated.View style={[styles.cardWidgetSkeleton, { opacity: pulseAnim }]}>
        <View style={styles.widgetHeaderRow}>
          <View style={styles.titleLineLong} />
          <View style={styles.badgeLine} />
        </View>
        <View style={styles.kpiRow}>
          <View style={styles.kpiBoxSkeleton}>
            <View style={styles.kpiValueLine} />
            <View style={styles.kpiLabelLine} />
          </View>
          <View style={styles.kpiBoxSkeleton}>
            <View style={styles.kpiValueLine} />
            <View style={styles.kpiLabelLine} />
          </View>
        </View>
      </Animated.View>

      {/* 3. Daily Schedule Widget Skeleton */}
      <Animated.View style={[styles.cardWidgetSkeleton, { opacity: pulseAnim }]}>
        <View style={styles.widgetHeaderRow}>
          <View style={styles.titleLineMedium} />
          <View style={styles.linkLine} />
        </View>
        {[1, 2].map((_, idx) => (
          <View key={idx} style={styles.scheduleItemSkeleton}>
            <View style={styles.scheduleTimeBox} />
            <View style={styles.scheduleContentBox}>
              <View style={styles.scheduleTitleLine} />
              <View style={styles.scheduleSubLine} />
            </View>
          </View>
        ))}
      </Animated.View>

      {/* 4. Pending Requests Widget Skeleton */}
      <Animated.View style={[styles.cardWidgetSkeleton, { opacity: pulseAnim }]}>
        <View style={styles.widgetHeaderRow}>
          <View style={styles.titleLineLong} />
          <View style={styles.countBadgeSkeleton} />
        </View>
        <View style={styles.pendingCardSkeleton}>
          <View style={styles.pendingHeaderRow}>
            <View style={styles.pendingAvatar} />
            <View style={styles.pendingTextCol}>
              <View style={styles.pendingNameLine} />
              <View style={styles.pendingVehicleLine} />
            </View>
          </View>
          <View style={styles.pendingActionBtnsRow}>
            <View style={styles.pendingBtnSkeleton} />
            <View style={styles.pendingBtnSkeletonPrimary} />
          </View>
        </View>
      </Animated.View>

      {/* 5. Fleet Preview Widget Skeleton */}
      <Animated.View style={[styles.cardWidgetSkeleton, { opacity: pulseAnim }]}>
        <View style={styles.widgetHeaderRow}>
          <View style={styles.titleLineMedium} />
          <View style={styles.linkLine} />
        </View>
        {[1, 2].map((_, idx) => (
          <View key={idx} style={styles.fleetRowSkeleton}>
            <View style={styles.fleetImageSkeleton} />
            <View style={styles.fleetInfoCol}>
              <View style={styles.fleetTitleLine} />
              <View style={styles.fleetSubLine} />
              <View style={styles.fleetPriceLine} />
            </View>
          </View>
        ))}
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 18,
  },
  // Quick Actions Grid
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  quickActionCardSkeleton: {
    width: '48.5%',
    height: 72,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 1,
  },
  quickActionIconPlaceholder: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
  },
  quickActionTextPlaceholder: {
    width: '55%',
    height: 12,
    borderRadius: 4,
    backgroundColor: '#E2E8F0',
  },

  // Generic Card Widget Skeleton
  cardWidgetSkeleton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 14,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 1,
  },
  widgetHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  titleLineLong: {
    width: 150,
    height: 16,
    borderRadius: 5,
    backgroundColor: '#CBD5E1',
  },
  titleLineMedium: {
    width: 120,
    height: 16,
    borderRadius: 5,
    backgroundColor: '#CBD5E1',
  },
  badgeLine: {
    width: 60,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#ECFDF5',
  },
  linkLine: {
    width: 70,
    height: 12,
    borderRadius: 4,
    backgroundColor: '#E2E8F0',
  },
  countBadgeSkeleton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#FEF3C7',
  },

  // KPI Row
  kpiRow: {
    flexDirection: 'row',
    gap: 10,
  },
  kpiBoxSkeleton: {
    flex: 1,
    height: 68,
    borderRadius: 16,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 12,
    justifyContent: 'center',
    gap: 6,
  },
  kpiValueLine: {
    width: '60%',
    height: 18,
    borderRadius: 4,
    backgroundColor: '#A7F3D0',
  },
  kpiLabelLine: {
    width: '75%',
    height: 11,
    borderRadius: 3,
    backgroundColor: '#E2E8F0',
  },

  // Schedule Widget Item
  scheduleItemSkeleton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    padding: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 12,
  },
  scheduleTimeBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#E2E8F0',
  },
  scheduleContentBox: {
    flex: 1,
    gap: 6,
  },
  scheduleTitleLine: {
    width: '65%',
    height: 14,
    borderRadius: 4,
    backgroundColor: '#CBD5E1',
  },
  scheduleSubLine: {
    width: '40%',
    height: 11,
    borderRadius: 3,
    backgroundColor: '#E2E8F0',
  },

  // Pending Request Card
  pendingCardSkeleton: {
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 12,
  },
  pendingHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  pendingAvatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#CBD5E1',
  },
  pendingTextCol: {
    flex: 1,
    gap: 5,
  },
  pendingNameLine: {
    width: '50%',
    height: 14,
    borderRadius: 4,
    backgroundColor: '#CBD5E1',
  },
  pendingVehicleLine: {
    width: '70%',
    height: 11,
    borderRadius: 3,
    backgroundColor: '#E2E8F0',
  },
  pendingActionBtnsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  pendingBtnSkeleton: {
    flex: 1,
    height: 34,
    borderRadius: 10,
    backgroundColor: '#E2E8F0',
  },
  pendingBtnSkeletonPrimary: {
    flex: 1,
    height: 34,
    borderRadius: 10,
    backgroundColor: '#041912',
  },

  // Fleet Preview Row
  fleetRowSkeleton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    padding: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 12,
  },
  fleetImageSkeleton: {
    width: 72,
    height: 52,
    borderRadius: 10,
    backgroundColor: '#E2E8F0',
  },
  fleetInfoCol: {
    flex: 1,
    gap: 5,
  },
  fleetTitleLine: {
    width: '60%',
    height: 14,
    borderRadius: 4,
    backgroundColor: '#CBD5E1',
  },
  fleetSubLine: {
    width: '35%',
    height: 10,
    borderRadius: 3,
    backgroundColor: '#E2E8F0',
  },
  fleetPriceLine: {
    width: '40%',
    height: 12,
    borderRadius: 4,
    backgroundColor: '#A7F3D0',
  },
});
