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

      {/* 2. Multi-Stage Luxury Dark & Forest Emerald Gradient Overlay */}
      <LinearGradient
        colors={[
          'rgba(4, 25, 18, 0.35)',
          'rgba(4, 25, 18, 0.65)',
          'rgba(4, 25, 18, 0.92)',
          theme.colors.brand.dark,
        ]}
        locations={[0, 0.45, 0.80, 1]}
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

          {/* Glassmorphism Security Badge with Champagne Touch */}
          <View style={styles.glassBadgeContainer}>
            <ShieldCheck size={13} color={theme.colors.gold[200]} />
            <Text style={styles.badgeText}>KYC & PAIEMENT 100% SÉCURISÉ</Text>
          </View>
        </View>

        {/* Bottom Section : VIP Champagne Tag, Headline, Subtitle & Luxury CTA */}
        <View style={styles.bottomSection}>
          {/* Glassmorphic VIP Mobility Pill Tag */}
          <View style={styles.vipTag}>
            <Sparkles size={12} color={theme.colors.gold[200]} />
            <Text style={styles.vipTagText}>AUTOLOC MOBILITY SÉNÉGAL</Text>
          </View>

          {/* Headline Display using Fraunces Display with Champagne Accent */}
          <Text style={styles.mainTitle}>
            Louez la voiture{'\n'}
            <Text style={styles.titleHighlight}>idéale</Text> à Dakar.
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

          {/* Subtle Micro Login Link with Champagne Accent */}
          <TouchableOpacity
            onPress={handleLoginPress}
            style={styles.discreetLoginRow}
            activeOpacity={0.7}
          >
            <Text style={styles.discreetLoginText}>
              Vous avez déjà un compte ?{' '}
              <Text style={styles.discreetLoginLink}>Se connecter</Text>
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
    backgroundColor: theme.colors.brand.dark,
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
  },
  largeLogo: {
    width: Math.min(screenWidth * 0.58, 240),
    height: 64,
  },
  glassBadgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.10)',
    borderWidth: 1,
    borderColor: 'rgba(241, 223, 182, 0.30)',
    paddingHorizontal: theme.spacing[3],
    paddingVertical: 6,
    borderRadius: theme.radius.full,
    gap: 6,
  },
  badgeText: {
    fontFamily: theme.typography.fontFamily.medium,
    fontSize: 10,
    letterSpacing: 0.8,
    color: theme.colors.gold[50],
  },
  bottomSection: {
    gap: theme.spacing[2],
  },
  vipTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(241, 223, 182, 0.15)',
    paddingHorizontal: theme.spacing[3],
    paddingVertical: 6,
    borderRadius: theme.radius.full,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: 'rgba(241, 223, 182, 0.45)',
    marginBottom: theme.spacing[2],
  },
  vipTagText: {
    fontFamily: theme.typography.fontFamily.semiBold,
    fontSize: 10,
    letterSpacing: 1.2,
    color: theme.colors.gold[200],
  },
  mainTitle: {
    fontFamily: theme.typography.fontFamily.displaySemiBold,
    fontSize: 34,
    lineHeight: 42,
    letterSpacing: -0.5,
    color: '#FFFFFF',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },
  titleHighlight: {
    color: theme.colors.gold[200],
    fontFamily: theme.typography.fontFamily.displayBold,
  },
  subtitle: {
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: theme.typography.fontSize.sm,
    lineHeight: 22,
    color: 'rgba(255, 255, 255, 0.85)',
    marginBottom: theme.spacing[4],
  },
  refinedLuxuryCta: {
    minHeight: 52,
    borderRadius: 26,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.95)',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.22,
    shadowRadius: 12,
    elevation: 8,
    paddingHorizontal: 20,
  },
  arrowIconCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: theme.colors.brand.dark,
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
    color: 'rgba(255, 255, 255, 0.65)',
  },
  discreetLoginLink: {
    fontFamily: theme.typography.fontFamily.semiBold,
    fontSize: 12,
    color: theme.colors.gold[200],
    textDecorationLine: 'underline',
  },
});

