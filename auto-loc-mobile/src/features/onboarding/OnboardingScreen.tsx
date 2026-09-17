import React from 'react';
import { StyleSheet, Text, View, Image, TouchableOpacity, Dimensions } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { ShieldCheck, ArrowRight, Sparkles } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { theme } from '../../core/theme';
import { useAppStore } from '../../core/store/useAppStore';
import { AutoButton } from '../../shared/components';

const { width: screenWidth } = Dimensions.get('window');

interface OnboardingScreenProps {
  onNavigateToTenantHome: () => void;
  onNavigateToLogin: () => void;
}

export const OnboardingScreen: React.FC<OnboardingScreenProps> = ({
  onNavigateToTenantHome,
  onNavigateToLogin,
}) => {
  const insets = useSafeAreaInsets();
  const markOnboardingSeen = useAppStore((state) => state.markOnboardingSeen);
  const enterGuestMode = useAppStore((state) => state.enterGuestMode);

  const handleStartExplorer = async () => {
    await markOnboardingSeen();
    enterGuestMode();
    onNavigateToTenantHome();
  };

  const handleLoginPress = async () => {
    await markOnboardingSeen();
    onNavigateToLogin();
  };

  return (
    <View style={styles.container}>
      {/* Light status bar icons for high visibility on dark hero image */}
      <StatusBar style="light" animated />

      {/* 1. Ultra-Immersive Full-Bleed Background Image */}
      <Image
        source={require('../../../assets/banner.jpg')}
        style={styles.backgroundImage}
        resizeMode="cover"
      />

      {/* 2. Multi-Stage Luxury Dark Gradient Overlay */}
      <LinearGradient
        colors={[
          'rgba(0, 0, 0, 0.30)',
          'rgba(4, 25, 18, 0.45)',
          'rgba(4, 25, 18, 0.85)',
          '#041912',
        ]}
        locations={[0, 0.45, 0.78, 1]}
        style={StyleSheet.absoluteFill}
      />

      {/* 3. Main Content Container aligned with Safe Area */}
      <View
        style={[
          styles.safeContent,
          {
            paddingTop: Math.max(insets.top, 20) + 12,
            paddingBottom: Math.max(insets.bottom, 20) + 12,
          },
        ]}
      >
        {/* Top Bar : Logo AutoLoc (Footer Logo) & Glassmorphism Security Badge */}
        <View style={styles.topSection}>
          <View style={styles.logoContainer}>
            <Image
              source={require('../../../assets/footerlogo.jpg')}
              style={styles.largeLogo}
              resizeMode="contain"
            />
          </View>

          <View style={styles.glassBadgeContainer}>
            <ShieldCheck size={13} color="#4ADE80" />
            <Text style={styles.badgeText}>KYC & PAIEMENT 100% SÉCURISÉ</Text>
          </View>
        </View>

        {/* Bottom Section : Tag, Headline, Subtitle & Modern CTA */}
        <View style={styles.bottomSection}>
          {/* Glassmorphic VIP Mobility Pill Tag */}
          <View style={styles.vipTag}>
            <Sparkles size={12} color="#4ADE80" />
            <Text style={styles.vipTagText}>AUTOLOC MOBILITY SÉNÉGAL</Text>
          </View>

          <Text style={styles.mainTitle}>
            Louez la voiture{'\n'}idéale à Dakar.
          </Text>

          <Text style={styles.subtitle}>
            Réservation instantanée via Mobile Money. Véhicules d'exception vérifiés avec ou sans chauffeur.
          </Text>

          {/* Refined Luxury Pure White CTA Button with Dark Circle Arrow */}
          <AutoButton
            title="Découvrir les véhicules"
            variant="luxury"
            rightIcon={
              <View style={styles.arrowIconCircle}>
                <ArrowRight size={13} color="#FFFFFF" />
              </View>
            }
            onPress={handleStartExplorer}
            size="md"
            style={styles.refinedLuxuryCta}
          />

          {/* Subtle Micro Login Link */}
          <TouchableOpacity
            onPress={handleLoginPress}
            style={styles.discreetLoginRow}
            activeOpacity={0.7}
          >
            <Text style={styles.discreetLoginText}>
              Vous avez déjà un compte ? <Text style={styles.discreetLoginLink}>Se connecter</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#041912',
  },
  backgroundImage: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: '-25%',
    width: '150%',
    height: '100%',
  },
  safeContent: {
    flex: 1,
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing[5],
  },
  topSection: {
    alignItems: 'center',
    gap: theme.spacing[3],
  },
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    // Glow subtle shadow for logo contrast
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  largeLogo: {
    width: Math.min(screenWidth * 0.58, 240),
    height: 64,
  },
  glassBadgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.20)',
    paddingHorizontal: theme.spacing[3],
    paddingVertical: 6,
    borderRadius: theme.radius.full,
    gap: 6,
  },
  badgeText: {
    fontFamily: theme.typography.fontFamily.medium,
    fontSize: 10,
    letterSpacing: 0.8,
    color: '#FFFFFF',
  },
  bottomSection: {
    gap: theme.spacing[2],
  },
  vipTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(16, 185, 129, 0.20)',
    paddingHorizontal: theme.spacing[3],
    paddingVertical: 6,
    borderRadius: theme.radius.full,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: 'rgba(74, 222, 128, 0.35)',
    marginBottom: theme.spacing[2],
  },
  vipTagText: {
    fontFamily: theme.typography.fontFamily.semiBold,
    fontSize: 10,
    letterSpacing: 0.8,
    color: '#4ADE80',
  },
  mainTitle: {
    fontFamily: theme.typography.fontFamily.displaySemiBold,
    fontSize: 34,
    lineHeight: 40,
    letterSpacing: -0.5,
    color: '#FFFFFF',
    textShadowColor: 'rgba(0, 0, 0, 0.4)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 6,
  },
  subtitle: {
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: theme.typography.fontSize.sm,
    lineHeight: 22,
    color: 'rgba(255, 255, 255, 0.82)',
    marginBottom: theme.spacing[4],
  },
  refinedLuxuryCta: {
    minHeight: 50,
    borderRadius: 25,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.90)',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 10,
    elevation: 6,
    paddingHorizontal: 20,
  },
  arrowIconCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#041912',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 4,
  },
  discreetLoginRow: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: theme.spacing[3],
    paddingVertical: 4,
  },
  discreetLoginText: {
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.55)',
  },
  discreetLoginLink: {
    fontFamily: theme.typography.fontFamily.medium,
    fontSize: 12,
    color: '#4ADE80',
    textDecorationLine: 'underline',
  },
});

