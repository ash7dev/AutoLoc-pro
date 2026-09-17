import React from 'react';
import { StyleSheet, Text, View, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ShieldCheck, CheckCircle2, Sparkles, Lock, ArrowRight } from 'lucide-react-native';
import { theme } from '../../../core/theme';

const { width: screenWidth } = Dimensions.get('window');

export const MobileMoneyGuaranteeHeroCard: React.FC = () => {
  return (
    <View style={styles.outerWrapper}>
      {/* Back Accent Glow Layer */}
      <View style={styles.backAccentCard} />

      {/* Main Container Layer */}
      <View style={styles.cardContainer}>
        {/* Background Gradient */}
        <LinearGradient
          colors={['#062017', '#04150F', '#020B08']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />

        {/* Aura Glow Effect */}
        <View style={styles.auraGlow} />

        {/* Header Row: Badge Sécurité */}
        <View style={styles.headerRow}>
          <View style={styles.secureBadge}>
            <ShieldCheck size={12} color="#4ADE80" />
            <Text style={styles.secureBadgeText}>PAIEMENT 100% SÉCURISÉ</Text>
          </View>
        </View>

        {/* Title & Headline */}
        <Text style={styles.mainTitle}>
          Acompte garanti de 30% <Text style={styles.highlightTitle}>à la réservation</Text>
        </Text>
        <Text style={styles.subtitle}>
          Bloquez vos dates immédiatement. Réglez les 70% restants sur place lors de la remise des clés.
        </Text>

        {/* Segmented Payment Progress Bar */}
        <View style={styles.splitProgressContainer}>
          {/* Segment 30% Acompte Online */}
          <View style={styles.segmentOnline}>
            <LinearGradient
              colors={['#059669', '#10B981']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.gradientFill}
            >
              <Lock size={11} color="#FFFFFF" />
              <Text style={styles.segmentOnlineText}>30% Acompte</Text>
            </LinearGradient>
          </View>

          {/* Segment 70% Solde sur place */}
          <View style={styles.segmentOnsite}>
            <Text style={styles.segmentOnsiteText}>70% Solde à la remise des clés</Text>
          </View>
        </View>

        {/* Micro Features Row */}
        <View style={styles.featuresRow}>
          <View style={styles.featureItem}>
            <CheckCircle2 size={13} color="#4ADE80" />
            <Text style={styles.featureText}>Contrat & Reçu Instantanés</Text>
          </View>
          <View style={styles.featureDivider} />
          <View style={styles.featureItem}>
            <Sparkles size={13} color="#4ADE80" />
            <Text style={styles.featureText}>Annulation Flexible</Text>
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
    marginVertical: 10,
  },
  backAccentCard: {
    position: 'absolute',
    top: -5,
    left: 8,
    right: 8,
    bottom: -5,
    borderRadius: 28,
    backgroundColor: 'rgba(16, 185, 129, 0.20)',
    borderWidth: 1.5,
    borderColor: 'rgba(74, 222, 128, 0.35)',
  },
  cardContainer: {
    position: 'relative',
    borderRadius: 24,
    padding: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 18,
    elevation: 8,
  },
  auraGlow: {
    position: 'absolute',
    top: -40,
    right: -40,
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: 'rgba(16, 185, 129, 0.20)',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
    flexWrap: 'wrap',
    gap: 6,
  },
  secureBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(74, 222, 128, 0.30)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: theme.radius.full,
    gap: 5,
  },
  secureBadgeText: {
    fontFamily: theme.typography.fontFamily.medium,
    fontSize: 9,
    letterSpacing: 0.8,
    color: '#4ADE80',
  },
  mainTitle: {
    fontFamily: theme.typography.fontFamily.displaySemiBold,
    fontSize: 18,
    lineHeight: 24,
    color: '#FFFFFF',
    marginBottom: 4,
  },
  highlightTitle: {
    color: '#4ADE80',
  },
  subtitle: {
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: 11.5,
    lineHeight: 16,
    color: 'rgba(255, 255, 255, 0.75)',
    marginBottom: 14,
  },
  splitProgressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.14)',
    overflow: 'hidden',
    marginBottom: 12,
  },
  segmentOnline: {
    width: '40%',
    height: '100%',
  },
  gradientFill: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
    gap: 4,
  },
  segmentOnlineText: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: 10,
    color: '#FFFFFF',
  },
  segmentOnsite: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  segmentOnsiteText: {
    fontFamily: theme.typography.fontFamily.medium,
    fontSize: 9.5,
    color: 'rgba(255, 255, 255, 0.70)',
  },
  featuresRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 4,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  featureText: {
    fontFamily: theme.typography.fontFamily.medium,
    fontSize: 10.5,
    color: 'rgba(255, 255, 255, 0.90)',
  },
  featureDivider: {
    width: 1,
    height: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.20)',
  },
});
