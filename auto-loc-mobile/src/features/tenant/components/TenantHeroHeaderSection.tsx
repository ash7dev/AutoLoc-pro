import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Search, SlidersHorizontal, ShieldCheck, Lock } from 'lucide-react-native';
import { theme } from '../../../core/theme';

const { width: screenWidth } = Dimensions.get('window');

export interface TenantHeroHeaderSectionProps {
  onSearchPress: () => void;
  selectedZone?: string;
  selectedType?: string;
  selectedDatesSummary?: string;
}

export const TenantHeroHeaderSection: React.FC<TenantHeroHeaderSectionProps> = ({
  onSearchPress,
  selectedZone,
  selectedType,
  selectedDatesSummary,
}) => {
  const displayTitle = selectedZone ? selectedZone : 'Où & quand louer ?';
  const displaySubtitle = [
    selectedType ? selectedType : null,
    selectedDatesSummary ? selectedDatesSummary : 'Destination · Dates · Catégories',
  ]
    .filter(Boolean)
    .join(' · ');

  return (
    <View style={styles.outerWrapper}>
      {/* Back Accent Glow Sheet */}
      <View style={styles.backAccentSheet} />

      {/* Main Unified Container */}
      <View style={styles.mainContainer}>
        {/* Background Gradient */}
        <LinearGradient
          colors={['#062017', '#04150F', '#020B08']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />

        {/* Aura Glow Radial Orb */}
        <View style={styles.auraGlow} />

        {/* 1. BARRE DE RECHERCHE FLOTTANTE */}
        <TouchableOpacity
          style={styles.searchTriggerBar}
          onPress={onSearchPress}
          activeOpacity={0.88}
        >
          {/* Badge Icône Recherche Émeraude */}
          <View style={styles.searchIconBadge}>
            <Search size={18} color="#059669" />
          </View>

          {/* Contenu Texte Central */}
          <View style={styles.searchTextContainer}>
            <Text style={styles.searchTitle} numberOfLines={1}>
              {displayTitle}
            </Text>
            <Text style={styles.searchSubtitle} numberOfLines={1}>
              {displaySubtitle}
            </Text>
          </View>

          {/* Badge Bouton Filtre Dark Forest */}
          <View style={styles.filterBadge}>
            <SlidersHorizontal size={14} color="#4ADE80" />
          </View>
        </TouchableOpacity>

        {/* 2. MICRO-BADGE GARANTIE ACOMPTE 30% ULTRA-COMPACT (1 LIGNE NEO-GLASS) */}
        <View style={styles.compactGuaranteeRow}>
          <View style={styles.secureBadgePill}>
            <ShieldCheck size={12} color="#4ADE80" />
            <Text style={styles.guaranteeBoldText}>Acompte 30% garanti</Text>
            <Text style={styles.bulletDot}>·</Text>
            <Text style={styles.guaranteeLightText}>Solde 70% sur place</Text>
            <View style={styles.lockBadge}>
              <Lock size={9} color="#4ADE80" />
            </View>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  outerWrapper: {
    position: 'relative',
    marginHorizontal: 16,
    marginTop: 4,
    marginBottom: 10,
  },
  backAccentSheet: {
    position: 'absolute',
    top: -5,
    left: 8,
    right: 8,
    bottom: -5,
    borderRadius: 28,
    backgroundColor: 'rgba(16, 185, 129, 0.22)',
    borderWidth: 1.5,
    borderColor: 'rgba(74, 222, 128, 0.35)',
  },
  mainContainer: {
    position: 'relative',
    borderRadius: 24,
    padding: 10,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.18)',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 18,
    elevation: 8,
  },
  auraGlow: {
    position: 'absolute',
    top: -40,
    right: -30,
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: 'rgba(16, 185, 129, 0.22)',
  },
  /* 1. BARRE DE RECHERCHE FLOTTANTE */
  searchTriggerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 9,
    gap: 10,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 3,
  },
  searchIconBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchTextContainer: {
    flex: 1,
    gap: 1,
  },
  searchTitle: {
    fontFamily: theme.typography.fontFamily.displaySemiBold,
    fontSize: 13.5,
    color: '#041912',
  },
  searchSubtitle: {
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: 11,
    color: '#6B7280',
  },
  filterBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#041912',
    justifyContent: 'center',
    alignItems: 'center',
  },
  /* 2. MICRO-BADGE COMPACT 1 LIGNE */
  compactGuaranteeRow: {
    marginTop: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secureBadgePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.14)',
    borderWidth: 1,
    borderColor: 'rgba(74, 222, 128, 0.28)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: theme.radius.full,
    gap: 5,
  },
  guaranteeBoldText: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: 10.5,
    color: '#4ADE80',
  },
  bulletDot: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: 10.5,
    color: 'rgba(255, 255, 255, 0.40)',
  },
  guaranteeLightText: {
    fontFamily: theme.typography.fontFamily.medium,
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.85)',
  },
  lockBadge: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: 'rgba(16, 185, 129, 0.25)',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 1,
  },
});
