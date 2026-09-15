import React from 'react';
import { StyleSheet, Text, View, Image, TouchableOpacity, SafeAreaView } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { ShieldCheck, ArrowRight, Sparkles } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { theme } from '../../core/theme';
import { useAppStore } from '../../core/store/useAppStore';
import { AutoButton } from '../../shared/components';

interface OnboardingScreenProps {
  onNavigateToTenantHome: () => void;
  onNavigateToLogin: () => void;
}

export const OnboardingScreen: React.FC<OnboardingScreenProps> = ({
  onNavigateToTenantHome,
  onNavigateToLogin,
}) => {
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
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />

      {/* En-tête : Logo AutoLoc & Badge KYC */}
      <View style={styles.topSection}>
        <View style={styles.logoContainer}>
          <Image
            source={require('../../../assets/logo.png')}
            style={styles.largeLogo}
            resizeMode="contain"
          />
        </View>

        <View style={styles.badgeContainer}>
          <ShieldCheck size={13} color={theme.colors.brand.main} />
          <Text style={styles.badgeText}>KYC & PAIEMENT 100% SÉCURISÉ</Text>
        </View>
      </View>

      {/* Carte Visuelle Héros Premium */}
      <View style={styles.illustrationSection}>
        <Image
          source={{
            uri: 'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&w=1000&q=80',
          }}
          style={styles.heroCardImage}
          resizeMode="cover"
        />
        <LinearGradient
          colors={['transparent', 'rgba(4, 25, 18, 0.85)']}
          style={styles.imageOverlay}
        >
          <View style={styles.vipTag}>
            <Sparkles size={12} color={theme.primitives.emerald[300]} />
            <Text style={styles.vipTagText}>AUTOLOC • SÉNÉGAL</Text>
          </View>
        </LinearGradient>
      </View>

      {/* Content Box Inférieure */}
      <View style={styles.contentBox}>
        <Text style={styles.heroTagline}>AUTOLOC MOBILITY SÉNÉGAL</Text>

        <Text style={styles.mainTitle}>
          Louez la voiture{'\n'}idéale à Dakar.
        </Text>

        <Text style={styles.subtitle}>
          Réservation instantanée via Mobile Money. Véhicules d'exception vérifiés avec ou sans chauffeur.
        </Text>

        {/* CTA Principal AutoButton Action Émeraude */}
        <AutoButton
          title="Découvrir les véhicules"
          variant="action"
          rightIcon={<ArrowRight size={18} color="#FFFFFF" />}
          onPress={handleStartExplorer}
          size="lg"
          style={styles.ctaButton}
        />

        {/* Lien de connexion */}
        <View style={styles.loginRow}>
          <Text style={styles.loginQuestion}>Vous avez déjà un compte ? </Text>
          <TouchableOpacity onPress={handleLoginPress} activeOpacity={0.7}>
            <Text style={styles.loginLink}>Se connecter</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.surface.page,
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing[5],
    paddingVertical: theme.spacing[4],
  },
  topSection: {
    alignItems: 'center',
    marginTop: theme.spacing[2],
    gap: theme.spacing[3],
  },
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  largeLogo: {
    width: 200,
    height: 64,
  },
  badgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.brand.subtle,
    borderWidth: 1,
    borderColor: theme.colors.brand.border,
    paddingHorizontal: theme.spacing[3],
    paddingVertical: 5,
    borderRadius: theme.radius.full,
    gap: 6,
  },
  badgeText: {
    ...theme.typography.textStyles.overline,
    fontSize: 9,
    color: theme.colors.brand.main,
  },
  illustrationSection: {
    height: 220,
    borderRadius: theme.radius.card, // 20px
    overflow: 'hidden',
    marginVertical: theme.spacing[3],
    borderWidth: 1,
    borderColor: theme.colors.border.light,
    ...theme.elevation.card,
    position: 'relative',
  },
  heroCardImage: {
    width: '100%',
    height: '100%',
  },
  imageOverlay: {
    ...StyleSheet.absoluteFill,
    justifyContent: 'flex-end',
    padding: theme.spacing[4],
  },
  vipTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(4, 25, 18, 0.85)',
    paddingHorizontal: theme.spacing[3],
    paddingVertical: 5,
    borderRadius: theme.radius.full,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: 'rgba(134, 239, 172, 0.25)',
  },
  vipTagText: {
    ...theme.typography.textStyles.overline,
    fontSize: 9,
    color: theme.primitives.emerald[300],
  },
  contentBox: {
    marginBottom: theme.spacing[4],
  },
  heroTagline: {
    ...theme.typography.textStyles.overline,
    color: theme.colors.brand.main,
    marginBottom: theme.spacing[1],
  },
  mainTitle: {
    fontFamily: theme.typography.fontFamily.displaySemiBold, // Fraunces_600SemiBold (Plafond 600)
    fontSize: theme.typography.fontSize['4xl'],
    lineHeight: theme.typography.lineHeight['4xl'],
    letterSpacing: -0.015,
    color: theme.primitives.forest[800], // #041912
    marginBottom: theme.spacing[2],
  },
  subtitle: {
    fontFamily: theme.typography.fontFamily.regular, // Inter_400Regular
    fontSize: theme.typography.fontSize.sm,
    lineHeight: theme.typography.lineHeight.sm,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing[5],
  },
  ctaButton: {
    marginBottom: theme.spacing[4],
  },
  loginRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginQuestion: {
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.tertiary,
  },
  loginLink: {
    fontFamily: theme.typography.fontFamily.semiBold,
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.brand.main,
    textDecorationLine: 'underline',
  },
});
