import React from 'react';
import { Platform, StyleSheet, View, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { AutoSkeleton } from '../../../shared/components/AutoSkeleton';

export const OwnerVehicleSkeleton: React.FC = () => {
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.container}>
      {/* Hero Header Glass Skeleton */}
      <LinearGradient
        colors={['#072A20', '#041912', '#020F0B']}
        locations={[0, 0.6, 1]}
        style={[styles.heroHeader, { paddingTop: Math.max(insets.top + 16, 44) }]}
      >
        {/* Top bar profile skeleton */}
        <View style={styles.topBar}>
          <View style={styles.profileRow}>
            <AutoSkeleton
              width={44}
              height={44}
              borderRadius={22}
              style={styles.darkSkeleton}
            />
            <View style={styles.greetingBox}>
              <AutoSkeleton
                width={120}
                height={15}
                borderRadius={6}
                style={styles.darkSkeleton}
              />
              <AutoSkeleton
                width={95}
                height={11}
                borderRadius={4}
                style={styles.darkSkeleton}
              />
            </View>
          </View>

          <AutoSkeleton
            width={105}
            height={28}
            borderRadius={20}
            style={styles.darkSkeleton}
          />
        </View>

        {/* Main hero body skeleton */}
        <View style={styles.mainHeroBody}>
          <View style={styles.sectionBadgeRow}>
            <AutoSkeleton
              width={145}
              height={22}
              borderRadius={11}
              style={styles.darkSkeleton}
            />
          </View>

          {/* Nombre Total de Véhicules Chiffre Skeleton */}
          <View style={styles.fleetCountRow}>
            <AutoSkeleton
              width={160}
              height={34}
              borderRadius={10}
              style={styles.emeraldSkeleton}
            />
          </View>
        </View>

        {/* Glass Summary Bar Skeleton (Dispo, Loués, Note) */}
        <View style={styles.glassSummaryBar}>
          <View style={styles.glassStatItem}>
            <AutoSkeleton width={6} height={6} borderRadius={3} style={styles.emeraldSkeleton} />
            <AutoSkeleton width={55} height={12} borderRadius={4} style={styles.darkSkeleton} />
          </View>

          <View style={styles.glassDivider} />

          <View style={styles.glassStatItem}>
            <AutoSkeleton width={6} height={6} borderRadius={3} style={styles.blueSkeleton} />
            <AutoSkeleton width={50} height={12} borderRadius={4} style={styles.darkSkeleton} />
          </View>

          <View style={styles.glassDivider} />

          <View style={styles.glassStatItem}>
            <AutoSkeleton width={11} height={11} borderRadius={2} style={styles.goldSkeleton} />
            <AutoSkeleton width={45} height={12} borderRadius={4} style={styles.darkSkeleton} />
          </View>
        </View>

        {/* CTA Button Skeleton (Publier un nouveau véhicule) */}
        <AutoSkeleton
          width="100%"
          height={48}
          borderRadius={14}
          style={styles.emeraldSkeleton}
        />
      </LinearGradient>

      {/* Body Content Skeleton */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.bodyContent}
      >
        {/* 1. Barre de Recherche Skeleton */}
        <View style={styles.searchBoxSkeleton}>
          <AutoSkeleton width={18} height={18} borderRadius={9} />
          <AutoSkeleton width="65%" height={14} borderRadius={4} />
        </View>

        {/* 2. Rangee de Filtres Horizontale Skeleton */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterRowSkeleton}
        >
          {[75, 105, 95, 110, 90].map((width, idx) => (
            <View key={idx} style={[styles.filterPillSkeleton, { width }]}>
              <AutoSkeleton width="60%" height={11} borderRadius={3} />
              <AutoSkeleton width={18} height={18} borderRadius={9} />
            </View>
          ))}
        </ScrollView>

        {/* 3. Cartes de Véhicules Skeleton */}
        {[1, 2].map((_, idx) => (
          <View key={idx} style={styles.cardSkeleton}>
            {/* Image Placeholder */}
            <View style={styles.imageContainerSkeleton}>
              <AutoSkeleton width={90} height={24} borderRadius={20} style={styles.absoluteStatusBadge} />
              <AutoSkeleton width={32} height={32} borderRadius={16} style={styles.absoluteFloatingMenu} />
              <AutoSkeleton width={75} height={22} borderRadius={8} style={styles.absolutePlateBadge} />
            </View>

            {/* Contenu de la Carte */}
            <View style={styles.contentSkeleton}>
              {/* Titre, Ville/Année et Note */}
              <View style={styles.headerRowSkeleton}>
                <View style={styles.titleBoxSkeleton}>
                  <AutoSkeleton width="70%" height={18} borderRadius={6} />
                  <AutoSkeleton width="45%" height={12} borderRadius={4} />
                </View>
                <AutoSkeleton width={44} height={22} borderRadius={10} style={styles.yellowBadge} />
              </View>

              {/* Specs Chips */}
              <View style={styles.specsRowSkeleton}>
                <AutoSkeleton width={75} height={26} borderRadius={13} />
                <AutoSkeleton width={75} height={26} borderRadius={13} />
                <AutoSkeleton width={75} height={26} borderRadius={13} />
              </View>

              {/* Footer: Prix & Bouton Gérer */}
              <View style={styles.footerRowSkeleton}>
                <AutoSkeleton width={100} height={20} borderRadius={6} style={styles.priceSkeleton} />
                <AutoSkeleton width={85} height={34} borderRadius={14} />
              </View>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  heroHeader: {
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    paddingHorizontal: 18,
    paddingBottom: 22,
    gap: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#041912',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.25,
        shadowRadius: 18,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  greetingBox: {
    gap: 6,
  },
  mainHeroBody: {
    gap: 4,
  },
  sectionBadgeRow: {
    flexDirection: 'row',
  },
  fleetCountRow: {
    marginTop: 4,
  },
  glassSummaryBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  glassStatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  glassDivider: {
    width: 1,
    height: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
  },
  darkSkeleton: {
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
  },
  emeraldSkeleton: {
    backgroundColor: 'rgba(52, 211, 153, 0.25)',
  },
  blueSkeleton: {
    backgroundColor: 'rgba(96, 165, 250, 0.25)',
  },
  goldSkeleton: {
    backgroundColor: 'rgba(245, 158, 11, 0.25)',
  },
  bodyContent: {
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
  // Card Skeleton
  cardSkeleton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 16,
  },
  imageContainerSkeleton: {
    width: '100%',
    height: 185,
    backgroundColor: '#E2E8F0',
    position: 'relative',
  },
  absoluteStatusBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
  },
  absoluteFloatingMenu: {
    position: 'absolute',
    top: 12,
    right: 12,
  },
  absolutePlateBadge: {
    position: 'absolute',
    bottom: 12,
    right: 12,
  },
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
  yellowBadge: {
    backgroundColor: '#FEF3C7',
  },
  specsRowSkeleton: {
    flexDirection: 'row',
    gap: 8,
  },
  footerRowSkeleton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  priceSkeleton: {
    backgroundColor: '#A7F3D0',
  },
});



