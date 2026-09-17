import React, { useEffect, useRef } from 'react';
import {
  StyleSheet,
  View,
  Animated,
  ScrollView,
} from 'react-native';

export const OwnerVehicleSkeleton: React.FC = () => {
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
    <View style={styles.wrapper}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.container}
      >
        {/* 1. Barre de Recherche Skeleton */}
        <Animated.View style={[styles.searchBoxSkeleton, { opacity: pulseAnim }]}>
          <View style={styles.searchIconPlaceholder} />
          <View style={styles.searchLinePlaceholder} />
        </Animated.View>

        {/* 2. Rangee de Filtres Horizontale Skeleton */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterRowSkeleton}
        >
          {[75, 105, 95, 110, 90].map((width, idx) => (
            <Animated.View
              key={idx}
              style={[styles.filterPillSkeleton, { width, opacity: pulseAnim }]}
            >
              <View style={styles.filterTextPlaceholder} />
              <View style={styles.filterBadgePlaceholder} />
            </Animated.View>
          ))}
        </ScrollView>

        {/* 3. Cartes de Véhicules Skeleton */}
        {[1, 2].map((_, idx) => (
          <Animated.View key={idx} style={[styles.cardSkeleton, { opacity: pulseAnim }]}>
            {/* Image Placeholder */}
            <View style={styles.imageContainerSkeleton}>
              <View style={styles.statusBadgeSkeleton} />
              <View style={styles.floatingMenuSkeleton} />
              <View style={styles.plateBadgeSkeleton} />
            </View>

            {/* Contenu de la Carte */}
            <View style={styles.contentSkeleton}>
              {/* Titre, Ville/Année et Note */}
              <View style={styles.headerRowSkeleton}>
                <View style={styles.titleBoxSkeleton}>
                  <View style={styles.titleLineSkeleton} />
                  <View style={styles.subTitleLineSkeleton} />
                </View>
                <View style={styles.ratingBadgeSkeleton} />
              </View>

              {/* Specs Chips */}
              <View style={styles.specsRowSkeleton}>
                <View style={styles.specChipSkeleton} />
                <View style={styles.specChipSkeleton} />
                <View style={styles.specChipSkeleton} />
              </View>

              {/* Footer: Prix & Bouton Gérer */}
              <View style={styles.footerRowSkeleton}>
                <View style={styles.priceBoxSkeleton} />
                <View style={styles.manageBtnSkeleton} />
              </View>
            </View>
          </Animated.View>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  container: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 110,
  },
  // Search Bar Skeleton
  searchBoxSkeleton: {
    height: 48,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    gap: 10,
    marginBottom: 12,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 4,
    elevation: 1,
  },
  searchIconPlaceholder: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#CBD5E1',
  },
  searchLinePlaceholder: {
    width: '65%',
    height: 14,
    borderRadius: 4,
    backgroundColor: '#E2E8F0',
  },

  // Filter Pills Skeleton
  filterRowSkeleton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingBottom: 16,
  },
  filterPillSkeleton: {
    height: 36,
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
  },
  filterTextPlaceholder: {
    flex: 1,
    height: 11,
    borderRadius: 3,
    backgroundColor: '#E2E8F0',
    marginRight: 6,
  },
  filterBadgePlaceholder: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#F1F5F9',
  },

  // Card Skeleton
  cardSkeleton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 16,
    shadowColor: '#041912',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },

  // Image Container Skeleton
  imageContainerSkeleton: {
    width: '100%',
    height: 185,
    backgroundColor: '#E2E8F0',
    position: 'relative',
  },
  statusBadgeSkeleton: {
    position: 'absolute',
    top: 12,
    left: 12,
    width: 90,
    height: 24,
    borderRadius: 20,
    backgroundColor: '#CBD5E1',
  },
  floatingMenuSkeleton: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#CBD5E1',
  },
  plateBadgeSkeleton: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    width: 75,
    height: 22,
    borderRadius: 8,
    backgroundColor: '#CBD5E1',
  },

  // Content Skeleton
  contentSkeleton: {
    padding: 16,
    gap: 12,
  },
  headerRowSkeleton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  titleBoxSkeleton: {
    flex: 1,
    gap: 6,
    marginRight: 8,
  },
  titleLineSkeleton: {
    width: '70%',
    height: 18,
    borderRadius: 6,
    backgroundColor: '#CBD5E1',
  },
  subTitleLineSkeleton: {
    width: '45%',
    height: 12,
    borderRadius: 4,
    backgroundColor: '#E2E8F0',
  },
  ratingBadgeSkeleton: {
    width: 44,
    height: 22,
    borderRadius: 10,
    backgroundColor: '#FEF3C7',
  },

  // Specs Row Skeleton
  specsRowSkeleton: {
    flexDirection: 'row',
    gap: 8,
  },
  specChipSkeleton: {
    width: 75,
    height: 26,
    borderRadius: 999,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },

  // Footer Row Skeleton
  footerRowSkeleton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  priceBoxSkeleton: {
    width: 100,
    height: 20,
    borderRadius: 6,
    backgroundColor: '#A7F3D0',
  },
  manageBtnSkeleton: {
    width: 85,
    height: 34,
    borderRadius: 14,
    backgroundColor: '#CBD5E1',
  },
});


