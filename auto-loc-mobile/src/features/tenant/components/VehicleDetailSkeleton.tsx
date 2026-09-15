import React, { useEffect, useRef } from 'react';
import {
  StyleSheet,
  View,
  Animated,
  ScrollView,
  Dimensions,
  Platform,
} from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const COLORS = {
  bg: '#F8FBF4',
  surface: '#FFFFFF',
  skeletonBase: '#E4EBDB',
  skeletonHighlight: '#F1F6EA',
  border: '#E4EBDB',
};

export const VehicleDetailSkeleton: React.FC = () => {
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
      {/* Header Flottant Skeleton */}
      <View style={styles.floatingHeader}>
        <Animated.View style={[styles.headerCircleBtn, { opacity: pulseAnim }]} />
        <View style={styles.headerRightActions}>
          <Animated.View style={[styles.headerCircleBtn, { opacity: pulseAnim }]} />
          <Animated.View style={[styles.headerCircleBtn, { opacity: pulseAnim }]} />
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* 1. Hero Image Gallery Skeleton */}
        <Animated.View style={[styles.heroGalleryBox, { opacity: pulseAnim }]}>
          <View style={styles.carouselPaginationDots}>
            <View style={[styles.dotPill, styles.dotActive]} />
            <View style={styles.dotPill} />
            <View style={styles.dotPill} />
          </View>
        </Animated.View>

        {/* 2. Sheet Overlay Card Skeleton */}
        <View style={styles.sheetOverlayContainer}>
          <View style={styles.dragHandleBox}>
            <View style={styles.dragHandlePill} />
          </View>

          {/* Badges Row */}
          <View style={styles.badgesRow}>
            <Animated.View style={[styles.badgeSkeleton, { width: 90, opacity: pulseAnim }]} />
            <Animated.View style={[styles.badgeSkeleton, { width: 110, opacity: pulseAnim }]} />
          </View>

          {/* Title & Year */}
          <Animated.View style={[styles.titleLine, { opacity: pulseAnim }]} />

          {/* Location & Rating Row */}
          <View style={styles.metaRow}>
            <Animated.View style={[styles.locationLine, { opacity: pulseAnim }]} />
            <Animated.View style={[styles.ratingBoxSkeleton, { opacity: pulseAnim }]} />
          </View>

          {/* Quick Specs Pills */}
          <View style={styles.quickSpecsRow}>
            {[80, 75, 90, 70].map((w, i) => (
              <Animated.View key={i} style={[styles.specPillSkeleton, { width: w, opacity: pulseAnim }]} />
            ))}
          </View>
        </View>

        {/* 3. Spécifications Techniques Scroll Skeleton */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeaderRow}>
            <Animated.View style={[styles.sectionIconBadge, { opacity: pulseAnim }]} />
            <Animated.View style={[styles.sectionTitleLine, { width: 180, opacity: pulseAnim }]} />
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalScroll}>
            {[1, 2, 3, 4, 5].map((_, idx) => (
              <Animated.View key={idx} style={[styles.specCardSkeleton, { opacity: pulseAnim }]}>
                <View style={styles.specCardIconCircle} />
                <View style={styles.specCardLabelLine} />
                <View style={styles.specCardValueLine} />
              </Animated.View>
            ))}
          </ScrollView>
        </View>

        {/* 4. Équipements Grid Skeleton */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeaderRow}>
            <Animated.View style={[styles.sectionIconBadge, { opacity: pulseAnim }]} />
            <Animated.View style={[styles.sectionTitleLine, { width: 160, opacity: pulseAnim }]} />
          </View>

          <View style={styles.equipmentGridWrap}>
            {[130, 110, 150, 120, 140, 100].map((w, idx) => (
              <Animated.View key={idx} style={[styles.equipmentChipSkeleton, { width: w, opacity: pulseAnim }]} />
            ))}
          </View>
        </View>

        {/* 5. Carte Propriétaire Hôte Skeleton */}
        <View style={styles.sectionPadding}>
          <Animated.View style={[styles.ownerCardSkeleton, { opacity: pulseAnim }]}>
            <View style={styles.ownerTopRow}>
              <View style={styles.avatarCircleSkeleton} />
              <View style={styles.ownerTextLines}>
                <View style={styles.ownerNameLine} />
                <View style={styles.ownerSubtitleLine} />
              </View>
            </View>
            <View style={styles.ownerButtonSkeleton} />
          </Animated.View>
        </View>

        {/* 6. Conditions Card Skeleton */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeaderRow}>
            <Animated.View style={[styles.sectionIconBadge, { opacity: pulseAnim }]} />
            <Animated.View style={[styles.sectionTitleLine, { width: 170, opacity: pulseAnim }]} />
          </View>

          <Animated.View style={[styles.conditionsCardSkeleton, { opacity: pulseAnim }]}>
            {[1, 2, 3, 4].map((_, i) => (
              <View key={i} style={styles.conditionRowSkeleton}>
                <View style={styles.conditionIconCircle} />
                <View style={styles.conditionTextGroup}>
                  <View style={styles.conditionTitleLine} />
                  <View style={styles.conditionSubLine} />
                </View>
              </View>
            ))}
          </Animated.View>
        </View>

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* 7. Sticky Booking Bar Bottom Skeleton */}
      <View style={styles.stickyBarSkeleton}>
        <View style={styles.stickyPriceGroup}>
          <Animated.View style={[styles.stickyLabelLine, { opacity: pulseAnim }]} />
          <Animated.View style={[styles.stickyPriceLine, { opacity: pulseAnim }]} />
        </View>

        <Animated.View style={[styles.stickyButtonSkeleton, { opacity: pulseAnim }]} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  rootContainer: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  floatingHeader: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 48 : 24,
    left: 20,
    right: 20,
    zIndex: 50,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerCircleBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.surface,
  },
  headerRightActions: {
    flexDirection: 'row',
    gap: 10,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  heroGalleryBox: {
    width: SCREEN_WIDTH,
    height: 290,
    backgroundColor: COLORS.skeletonBase,
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingBottom: 36,
  },
  carouselPaginationDots: {
    flexDirection: 'row',
    gap: 6,
  },
  dotPill: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
  },
  dotActive: {
    width: 18,
    backgroundColor: '#FFFFFF',
  },
  sheetOverlayContainer: {
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    marginTop: -26,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 20,
    borderTopWidth: 1,
    borderColor: COLORS.border,
  },
  dragHandleBox: {
    alignItems: 'center',
    paddingVertical: 6,
    marginBottom: 12,
  },
  dragHandlePill: {
    width: 42,
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.skeletonBase,
  },
  badgesRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 14,
  },
  badgeSkeleton: {
    height: 24,
    borderRadius: 10,
    backgroundColor: COLORS.skeletonBase,
  },
  titleLine: {
    width: '70%',
    height: 26,
    borderRadius: 8,
    backgroundColor: COLORS.skeletonBase,
    marginBottom: 12,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  locationLine: {
    width: '50%',
    height: 16,
    borderRadius: 6,
    backgroundColor: COLORS.skeletonBase,
  },
  ratingBoxSkeleton: {
    width: 70,
    height: 24,
    borderRadius: 10,
    backgroundColor: COLORS.skeletonBase,
  },
  quickSpecsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  specPillSkeleton: {
    height: 30,
    borderRadius: 12,
    backgroundColor: COLORS.skeletonBase,
  },
  sectionContainer: {
    marginTop: 22,
    paddingHorizontal: 20,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 14,
  },
  sectionIconBadge: {
    width: 30,
    height: 30,
    borderRadius: 9,
    backgroundColor: COLORS.skeletonBase,
  },
  sectionTitleLine: {
    height: 18,
    borderRadius: 6,
    backgroundColor: COLORS.skeletonBase,
  },
  horizontalScroll: {
    gap: 12,
    paddingRight: 20,
  },
  specCardSkeleton: {
    width: 115,
    height: 110,
    borderRadius: 18,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  specCardIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: COLORS.skeletonBase,
  },
  specCardLabelLine: {
    width: 60,
    height: 10,
    borderRadius: 4,
    backgroundColor: COLORS.skeletonBase,
  },
  specCardValueLine: {
    width: 80,
    height: 13,
    borderRadius: 5,
    backgroundColor: COLORS.skeletonBase,
  },
  equipmentGridWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  equipmentChipSkeleton: {
    height: 42,
    borderRadius: 16,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  sectionPadding: {
    paddingHorizontal: 20,
    marginTop: 22,
  },
  ownerCardSkeleton: {
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 14,
  },
  ownerTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  avatarCircleSkeleton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: COLORS.skeletonBase,
  },
  ownerTextLines: {
    flex: 1,
    gap: 8,
  },
  ownerNameLine: {
    width: '60%',
    height: 16,
    borderRadius: 6,
    backgroundColor: COLORS.skeletonBase,
  },
  ownerSubtitleLine: {
    width: '40%',
    height: 12,
    borderRadius: 4,
    backgroundColor: COLORS.skeletonBase,
  },
  ownerButtonSkeleton: {
    width: '100%',
    height: 40,
    borderRadius: 12,
    backgroundColor: COLORS.skeletonBase,
  },
  conditionsCardSkeleton: {
    backgroundColor: COLORS.surface,
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 14,
  },
  conditionRowSkeleton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  conditionIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: COLORS.skeletonBase,
  },
  conditionTextGroup: {
    flex: 1,
    gap: 6,
  },
  conditionTitleLine: {
    width: '45%',
    height: 14,
    borderRadius: 5,
    backgroundColor: COLORS.skeletonBase,
  },
  conditionSubLine: {
    width: '80%',
    height: 12,
    borderRadius: 4,
    backgroundColor: COLORS.skeletonBase,
  },
  stickyBarSkeleton: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: Platform.OS === 'ios' ? 34 : 20,
    borderTopWidth: 1,
    borderColor: COLORS.border,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  stickyPriceGroup: {
    gap: 6,
  },
  stickyLabelLine: {
    width: 70,
    height: 10,
    borderRadius: 4,
    backgroundColor: COLORS.skeletonBase,
  },
  stickyPriceLine: {
    width: 120,
    height: 22,
    borderRadius: 6,
    backgroundColor: COLORS.skeletonBase,
  },
  stickyButtonSkeleton: {
    width: 130,
    height: 48,
    borderRadius: 14,
    backgroundColor: COLORS.skeletonBase,
  },
});
