import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Sparkles, ShieldCheck, Zap, ChevronRight, Car } from 'lucide-react-native';

import { theme } from '../../../core/theme';

export interface HostMonetizeBannerCardProps {
  onPressStart: () => void;
}

export const HostMonetizeBannerCard: React.FC<HostMonetizeBannerCardProps> = ({
  onPressStart,
}) => {
  return (
    <View style={styles.outerContainer}>
      <LinearGradient
        colors={['#062017', '#04150F', '#020B08']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.cardGradient}
      >
        {/* Aura de lueur émeraude ambiante en arrière-plan */}
        <View style={styles.auraGlow} pointerEvents="none" />

        {/* Décoration filigrane arrière-plan */}
        <View style={styles.watermarkContainer} pointerEvents="none">
          <Car size={160} color="rgba(16, 185, 129, 0.05)" />
        </View>

        {/* Header Badge Luxe */}
        <View style={styles.badgeRow}>
          <View style={styles.tagPill}>
            <Sparkles size={11} color="#4ADE80" />
            <Text style={styles.tagPillText}>DEVENEZ HÔTE · AUTOLOC DAKAR</Text>
          </View>
        </View>

        {/* Titre & Accroche Principale */}
        <View style={styles.textBody}>
          <Text style={styles.titleText}>
            Votre voiture dort ?{'\n'}
            <Text style={styles.titleHighlight}>Faites-la bosser !</Text>
          </Text>
          <Text style={styles.subtitleText}>
            Louez votre véhicule en toute sécurité à des conducteurs vérifiés.
          </Text>
        </View>

        {/* Checklist des Avantages Majeurs (Concise, sans Emojis) */}
        <View style={styles.benefitsList}>
          <View style={styles.benefitItem}>
            <View style={styles.benefitIconBox}>
              <ShieldCheck size={14} color="#34D399" />
            </View>
            <Text style={styles.benefitText}>Assurance All-Risk & Locataires vérifiés KYC</Text>
          </View>

          <View style={styles.benefitItem}>
            <View style={styles.benefitIconBox}>
              <Zap size={14} color="#34D399" />
            </View>
            <Text style={styles.benefitText}>Paiements automatiques Wave & Orange Money</Text>
          </View>
        </View>

        {/* Bouton d'Action CTA Luxe */}
        <TouchableOpacity
          style={styles.ctaButton}
          onPress={onPressStart}
          activeOpacity={0.88}
        >
          <Text style={styles.ctaButtonText}>Publier mon véhicule</Text>
          <View style={styles.emeraldArrowCircle}>
            <ChevronRight size={15} color="#041912" strokeWidth={2.5} />
          </View>
        </TouchableOpacity>

      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  outerContainer: {
    marginHorizontal: theme.spacing[4],
    marginVertical: theme.spacing[4],
    borderRadius: 28,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: 'rgba(52, 211, 153, 0.25)',
    ...Platform.select({
      ios: {
        shadowColor: '#041912',
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.25,
        shadowRadius: 24,
      },
      android: {
        elevation: 10,
      },
    }),
  },
  cardGradient: {
    padding: theme.spacing[5],
    gap: 16,
    position: 'relative',
  },
  auraGlow: {
    position: 'absolute',
    top: -40,
    right: -40,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(16, 185, 129, 0.16)',
  },
  watermarkContainer: {
    position: 'absolute',
    bottom: -20,
    right: -20,
    opacity: 0.8,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  tagPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(4, 25, 18, 0.70)',
    borderWidth: 1,
    borderColor: 'rgba(74, 222, 128, 0.35)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: theme.radius.full,
  },
  tagPillText: {
    fontFamily: theme.typography.fontFamily.medium,
    fontSize: 9.5,
    letterSpacing: 0.6,
    color: '#4ADE80',
  },

  textBody: {
    gap: 6,
  },
  titleText: {
    fontFamily: theme.typography.fontFamily.displaySemiBold,
    fontSize: 24,
    lineHeight: 30,
    color: '#F8FBF4',
    letterSpacing: -0.4,
  },
  titleHighlight: {
    color: '#4ADE80',
  },
  subtitleText: {
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: 12.5,
    lineHeight: 18,
    color: 'rgba(248, 251, 244, 0.75)',
  },
  benefitsList: {
    gap: 10,
    marginVertical: 4,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  benefitIconBox: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: 'rgba(52, 211, 153, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(52, 211, 153, 0.30)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  benefitText: {
    fontFamily: theme.typography.fontFamily.medium,
    fontSize: 12,
    color: '#E2E8F0',
    flex: 1,
  },
  ctaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 50,
    borderRadius: 25,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.90)',
    gap: 10,
    marginTop: 6,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.20,
    shadowRadius: 12,
    elevation: 6,
  },
  ctaButtonText: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: 15,
    color: '#041912',
    letterSpacing: -0.2,
  },
  emeraldArrowCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
