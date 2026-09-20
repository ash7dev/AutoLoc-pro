import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Image,
  Alert,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Mail, Lock, ArrowRight, ShieldCheck, Eye, EyeOff, X, Sparkles } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { theme } from '../../../core/theme';
import { AutoInput, PhoneField, AutoButton } from '../../../shared/components';
import { useAuthStore } from '../stores/useAuthStore';
import { nativeGoogleAuthService } from '../services/nativeGoogleAuthService';

const { width: screenWidth } = Dimensions.get('window');

interface LoginScreenProps {
  onNavigateToRegister: () => void;
  onNavigateToOtp: (phone: string) => void;
  onLoginSuccess: () => void;
  onClose?: () => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({
  onNavigateToRegister,
  onNavigateToOtp,
  onLoginSuccess,
  onClose,
}) => {
  const insets = useSafeAreaInsets();
  const [authMethod, setAuthMethod] = useState<'PHONE' | 'EMAIL'>('PHONE');
  const [telephone, setTelephone] = useState('+221770000000');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const { sendPhoneOtp, loginWithGoogleOrSupabase, isLoading, error, clearError } = useAuthStore();

  const handlePhoneSubmit = async () => {
    if (!telephone.trim() || telephone.length < 9) {
      Alert.alert('Numéro invalide', 'Veuillez saisir un numéro de téléphone valide au Sénégal.');
      return;
    }

    try {
      await sendPhoneOtp(telephone);
      onNavigateToOtp(telephone);
    } catch (e) {
      // Géré par le store error
    }
  };

  const handleEmailSubmit = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Champs requis', 'Veuillez renseigner votre email et mot de passe.');
      return;
    }

    try {
      onLoginSuccess();
    } catch (e) {
      // Handled
    }
  };

  const handleGoogleAuth = async () => {
    try {
      setGoogleLoading(true);
      const token = await nativeGoogleAuthService.signInWithGoogle();
      if (token) {
        await loginWithGoogleOrSupabase(token);
        onLoginSuccess();
      }
    } catch (err: any) {
      console.warn('[LoginScreen] Échec authentification Google:', err);
      Alert.alert('Connexion Google', err?.message || 'Erreur lors de la connexion Google.');
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" animated />

      {/* 1. Fond Sombre Émeraude & Aura Lumineuse */}
      <View style={StyleSheet.absoluteFill}>
        <LinearGradient
          colors={['#062017', '#04150F', '#020B08']}
          style={StyleSheet.absoluteFill}
        />
        {/* Glow Radial en haut */}
        <View style={styles.auraGlow} />
      </View>

      {/* 2. Content Alignement Safe Area */}
      <View
        style={[
          styles.safeWrapper,
          {
            paddingTop: Math.max(insets.top, 20) + 8,
            paddingBottom: Math.max(insets.bottom, 16) + 8,
          },
        ]}
      >
        {/* Top Header Row Glass Navigation */}
        <View style={styles.topHeaderRow}>
          <TouchableOpacity
            style={styles.glassCloseBtn}
            onPress={onClose}
            activeOpacity={0.8}
          >
            <X size={18} color="#FFFFFF" strokeWidth={2.5} />
          </TouchableOpacity>

          <TouchableOpacity onPress={onClose} activeOpacity={0.75} style={styles.skipGlassPill}>
            <Sparkles size={12} color="#4ADE80" />
            <Text style={styles.skipGlassText}>Ignorer & Explorer</Text>
          </TouchableOpacity>
        </View>

        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.flexOne}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* STACK CARDS SUPERPOSÉES (Layered Glass Architecture) */}
            <View style={styles.cardStackWrapper}>
              {/* Card d'arrière-plan en décalé (Back Layer Accent) */}
              <View style={styles.backAccentCard} />

              {/* Card Principale Translucide (Front Floating Glass Sheet) */}
              <View style={styles.frontGlassCard}>
                {/* Header Card : Logo & Titre */}
                <View style={styles.cardHeaderBox}>
                  <View style={styles.logoContainer}>
                    <Image
                      source={require('../../../../assets/logo.png')}
                      style={styles.logoImage}
                      resizeMode="contain"
                    />
                  </View>

                  <View style={styles.badgeKycGlass}>
                    <ShieldCheck size={12} color="#059669" />
                    <Text style={styles.badgeKycText}>ESPACE CLIENT SÉCURISÉ</Text>
                  </View>

                  <Text style={styles.mainTitle}>Bon retour</Text>
                  <Text style={styles.subtitle}>
                    Accédez à vos réservations et votre garage mobile
                  </Text>
                </View>

                {/* Bannière Erreur */}
                {error ? (
                  <View style={styles.errorBanner}>
                    <Text style={styles.errorText}>{error}</Text>
                    <TouchableOpacity onPress={clearError}>
                      <Text style={styles.errorClose}>×</Text>
                    </TouchableOpacity>
                  </View>
                ) : null}

                {/* Switcher Méthode de Connexion (Segmented Pill) */}
                <View style={styles.segmentedTrack}>
                  <TouchableOpacity
                    style={[styles.segmentedBtn, authMethod === 'PHONE' && styles.segmentedBtnActive]}
                    onPress={() => { clearError(); setAuthMethod('PHONE'); }}
                    activeOpacity={0.8}
                  >
                    <Text style={[styles.segmentedText, authMethod === 'PHONE' && styles.segmentedTextActive]}>
                      SMS / WhatsApp
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.segmentedBtn, authMethod === 'EMAIL' && styles.segmentedBtnActive]}
                    onPress={() => { clearError(); setAuthMethod('EMAIL'); }}
                    activeOpacity={0.8}
                  >
                    <Text style={[styles.segmentedText, authMethod === 'EMAIL' && styles.segmentedTextActive]}>
                      Email & Pass
                    </Text>
                  </TouchableOpacity>
                </View>

                {/* Formulaire Dynamique */}
                {authMethod === 'PHONE' ? (
                  <View style={styles.formStack}>
                    <PhoneField
                      label="Numéro de téléphone"
                      value={telephone}
                      onChangeText={(t) => { clearError(); setTelephone(t); }}
                    />

                    <AutoButton
                      title="Recevoir mon code d'accès"
                      variant="dark"
                      rightIcon={
                        <View style={styles.emeraldArrowCircle}>
                          <ArrowRight size={13} color="#4ADE80" />
                        </View>
                      }
                      loading={isLoading}
                      onPress={handlePhoneSubmit}
                      size="md"
                      style={styles.submitBtn}
                    />
                  </View>
                ) : (
                  <View style={styles.formStack}>
                    <AutoInput
                      label="Adresse email"
                      placeholder="vous@autoloc.sn"
                      value={email}
                      onChangeText={(t) => { clearError(); setEmail(t); }}
                      leftIcon={<Mail size={18} color={theme.colors.text.tertiary} />}
                      autoCapitalize="none"
                      keyboardType="email-address"
                    />

                    <AutoInput
                      label="Mot de passe"
                      placeholder="••••••••"
                      value={password}
                      onChangeText={(t) => { clearError(); setPassword(t); }}
                      leftIcon={<Lock size={18} color={theme.colors.text.tertiary} />}
                      isPassword={!showPassword}
                      rightIcon={
                        <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                          {showPassword ? (
                            <EyeOff size={18} color={theme.colors.text.tertiary} />
                          ) : (
                            <Eye size={18} color={theme.colors.text.tertiary} />
                          )}
                        </TouchableOpacity>
                      }
                    />

                    <TouchableOpacity style={styles.forgotPassBtn}>
                      <Text style={styles.forgotPassText}>Mot de passe oublié ?</Text>
                    </TouchableOpacity>

                    <AutoButton
                      title="Se connecter"
                      variant="dark"
                      rightIcon={
                        <View style={styles.emeraldArrowCircle}>
                          <ArrowRight size={13} color="#4ADE80" />
                        </View>
                      }
                      loading={isLoading}
                      onPress={handleEmailSubmit}
                      size="md"
                      style={styles.submitBtn}
                    />
                  </View>
                )}

                {/* Divider Glass */}
                <View style={styles.dividerRow}>
                  <View style={styles.dividerLine} />
                  <Text style={styles.dividerText}>OU CONTINUER AVEC</Text>
                  <View style={styles.dividerLine} />
                </View>

                {/* Google Auth Button Glass */}
                <TouchableOpacity
                  style={[styles.googleGlassBtn, googleLoading && { opacity: 0.6 }]}
                  onPress={handleGoogleAuth}
                  disabled={googleLoading}
                  activeOpacity={0.8}
                >
                  {googleLoading ? (
                    <ActivityIndicator color="#A7F3D0" size="small" />
                  ) : (
                    <>
                      <Image
                        source={{ uri: 'https://cdn-icons-png.flaticon.com/512/300/300221.png' }}
                        style={styles.googleIcon}
                        resizeMode="contain"
                      />
                      <Text style={styles.googleGlassText}>Continuer avec Google</Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>
            </View>

            {/* Inscription Footer Capsule */}
            <TouchableOpacity
              onPress={onNavigateToRegister}
              style={styles.footerGlassCapsule}
              activeOpacity={0.8}
            >
              <Text style={styles.footerQuestion}>
                Pas encore de compte ? <Text style={styles.registerLink}>S'inscrire gratuitement</Text>
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#04150F',
  },
  auraGlow: {
    position: 'absolute',
    top: -60,
    alignSelf: 'center',
    width: screenWidth * 0.9,
    height: screenWidth * 0.9,
    borderRadius: (screenWidth * 0.9) / 2,
    backgroundColor: 'rgba(16, 185, 129, 0.16)',
  },
  safeWrapper: {
    flex: 1,
  },
  flexOne: {
    flex: 1,
  },
  topHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing[5],
    marginBottom: theme.spacing[2],
  },
  glassCloseBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255, 255, 255, 0.10)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.20)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  skipGlassPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.10)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.18)',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: theme.radius.full,
  },
  skipGlassText: {
    fontFamily: theme.typography.fontFamily.semiBold,
    fontSize: 11,
    color: '#FFFFFF',
  },
  scrollContent: {
    paddingHorizontal: theme.spacing[4],
    paddingBottom: theme.spacing[4],
    justifyContent: 'center',
    flexGrow: 1,
  },
  cardStackWrapper: {
    position: 'relative',
    marginVertical: theme.spacing[2],
  },
  backAccentCard: {
    position: 'absolute',
    top: -6,
    left: 8,
    right: 8,
    bottom: -6,
    borderRadius: 32,
    backgroundColor: 'rgba(16, 185, 129, 0.20)',
    borderWidth: 1.5,
    borderColor: 'rgba(74, 222, 128, 0.35)',
  },
  frontGlassCard: {
    backgroundColor: '#FFFFFF', // Carte Principale Blanc Pur
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.80)',
    borderRadius: 28,
    padding: theme.spacing[5],
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.22,
    shadowRadius: 24,
    elevation: 10,
  },
  cardHeaderBox: {
    alignItems: 'center',
    marginBottom: theme.spacing[4],
  },
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing[2],
  },
  logoImage: {
    width: 170,
    height: 52,
  },
  badgeKycGlass: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: theme.radius.full,
    gap: 6,
    marginBottom: theme.spacing[2],
  },
  badgeKycText: {
    fontFamily: theme.typography.fontFamily.medium,
    fontSize: 9,
    letterSpacing: 0.8,
    color: '#059669',
  },
  mainTitle: {
    fontFamily: theme.typography.fontFamily.displaySemiBold,
    fontSize: 28,
    lineHeight: 34,
    color: '#041912',
    textAlign: 'center',
  },
  subtitle: {
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.text.secondary,
    textAlign: 'center',
    marginTop: 4,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: theme.colors.status.errorBg,
    borderColor: theme.colors.status.errorBorder,
    borderWidth: 1,
    borderRadius: theme.radius.lg,
    padding: theme.spacing[3],
    marginBottom: theme.spacing[3],
  },
  errorText: {
    fontFamily: theme.typography.fontFamily.medium,
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.status.error,
    flex: 1,
  },
  errorClose: {
    fontSize: 16,
    color: theme.colors.status.error,
    paddingLeft: 8,
  },
  segmentedTrack: {
    flexDirection: 'row',
    backgroundColor: '#F3F4F6',
    borderRadius: theme.radius.full,
    padding: 4,
    marginBottom: theme.spacing[4],
  },
  segmentedBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: theme.radius.full,
  },
  segmentedBtnActive: {
    backgroundColor: '#041912', // Pilule Active Forêt Sombre
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  segmentedText: {
    fontFamily: theme.typography.fontFamily.medium,
    fontSize: 12,
    color: '#6B7280',
  },
  segmentedTextActive: {
    fontFamily: theme.typography.fontFamily.bold,
    color: '#FFFFFF',
  },
  formStack: {
    gap: theme.spacing[3],
  },
  forgotPassBtn: {
    alignSelf: 'flex-end',
    marginTop: -4,
  },
  forgotPassText: {
    fontFamily: theme.typography.fontFamily.medium,
    fontSize: 12,
    color: '#059669',
  },
  submitBtn: {
    minHeight: 50,
    borderRadius: 25,
    backgroundColor: '#041912',
    borderWidth: 1,
    borderColor: 'rgba(4, 25, 18, 0.90)',
    shadowColor: '#041912',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 6,
    marginTop: theme.spacing[2],
  },
  emeraldArrowCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: 'rgba(16, 185, 129, 0.22)',
    borderWidth: 1,
    borderColor: 'rgba(74, 222, 128, 0.35)',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 6,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: theme.spacing[4],
    gap: theme.spacing[2],
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E5E7EB',
  },
  dividerText: {
    fontFamily: theme.typography.fontFamily.medium,
    fontSize: 10,
    letterSpacing: 0.8,
    color: '#9CA3AF',
  },
  googleGlassBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    gap: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  googleIcon: {
    width: 18,
    height: 18,
  },
  googleGlassText: {
    fontFamily: theme.typography.fontFamily.semiBold,
    fontSize: 13,
    color: '#1F2937',
  },
  footerGlassCapsule: {
    marginTop: theme.spacing[4],
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: theme.radius.full,
    backgroundColor: 'rgba(255, 255, 255, 0.10)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  footerQuestion: {
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.80)',
  },
  registerLink: {
    fontFamily: theme.typography.fontFamily.semiBold,
    fontSize: 12,
    color: '#4ADE80',
    textDecorationLine: 'underline',
  },
});

