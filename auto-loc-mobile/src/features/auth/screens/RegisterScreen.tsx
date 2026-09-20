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
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { User, Mail, Lock, ArrowRight, ChevronLeft, ShieldCheck, Sparkles } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { theme } from '../../../core/theme';
import { AutoInput, PhoneField, AutoButton } from '../../../shared/components';
import { useAuthStore } from '../stores/useAuthStore';
import { nativeGoogleAuthService } from '../services/nativeGoogleAuthService';

const { width: screenWidth } = Dimensions.get('window');

interface RegisterScreenProps {
  onNavigateToLogin: () => void;
  onNavigateToOtp: (phone: string) => void;
  onClose?: () => void;
}

function getPasswordStrength(password: string): number {
  if (!password) return 0;
  let score = 0;
  if (password.length >= 8) score += 25;
  if (/[a-z]/.test(password)) score += 25;
  if (/[A-Z]/.test(password)) score += 25;
  if (/[0-9!@#$%^&*()_+\-=\[\]{};':"\\|,.<>/?]/.test(password)) score += 25;
  return score;
}

const PasswordStrengthBar: React.FC<{ password: string }> = ({ password }) => {
  const strength = getPasswordStrength(password);
  if (!password) return null;

  const label =
    strength <= 25
      ? { text: 'Faible', color: '#EF4444' }
      : strength <= 50
      ? { text: 'Moyen', color: '#F59E0B' }
      : strength <= 75
      ? { text: 'Bon', color: '#0284C7' }
      : { text: 'Excellent', color: '#10B981' };

  return (
    <View style={styles.strengthContainer}>
      <View style={styles.strengthHeader}>
        <Text style={styles.strengthTitle}>Force du mot de passe</Text>
        <Text style={[styles.strengthText, { color: label.color }]}>{label.text}</Text>
      </View>
      <View style={styles.strengthTrack}>
        <View style={[styles.strengthFill, { width: `${strength}%`, backgroundColor: label.color }]} />
      </View>
    </View>
  );
};

export const RegisterScreen: React.FC<RegisterScreenProps> = ({
  onNavigateToLogin,
  onNavigateToOtp,
  onClose,
}) => {
  const insets = useSafeAreaInsets();
  const [prenom, setPrenom] = useState('');
  const [nom, setNom] = useState('');
  const [email, setEmail] = useState('');
  const [telephone, setTelephone] = useState('+221770000000');
  const [password, setPassword] = useState('');
  const [googleLoading, setGoogleLoading] = useState(false);

  const { registerProfile, loginWithGoogleOrSupabase, isLoading, error, clearError } = useAuthStore();

  const handleRegister = async () => {
    if (!prenom.trim() || !nom.trim() || !email.trim() || !telephone.trim()) {
      Alert.alert('Champs requis', 'Veuillez remplir tous les champs obligatoires.');
      return;
    }

    try {
      await registerProfile({ prenom, nom, email, telephone });
      onNavigateToOtp(telephone);
    } catch (e) {
      // Handled
    }
  };

  const handleGoogleSignup = async () => {
    try {
      setGoogleLoading(true);
      const token = await nativeGoogleAuthService.signInWithGoogle();
      if (token) {
        await loginWithGoogleOrSupabase(token);
        if (onClose) onClose();
      }
    } catch (err: any) {
      console.warn('[RegisterScreen] Échec inscription Google:', err);
      Alert.alert('Inscription Google', err?.message || 'Erreur lors de l’inscription Google.');
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
        {/* Top Header Navigation */}
        <View style={styles.topHeaderRow}>
          <TouchableOpacity
            style={styles.glassBackBtn}
            onPress={onNavigateToLogin}
            activeOpacity={0.8}
          >
            <ChevronLeft size={20} color="#FFFFFF" strokeWidth={2.5} />
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
            {/* STACK CARDS SUPERPOSÉES */}
            <View style={styles.cardStackWrapper}>
              <View style={styles.backAccentCard} pointerEvents="none" />

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
                      <Text style={styles.badgeKycText}>INSCRIPTION GRATUITE EN 1 MIN</Text>
                    </View>

                    <Text style={styles.mainTitle}>Créer un compte</Text>
                    <Text style={styles.subtitle}>
                      Rejoignez la plateforme leader de location au Sénégal
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

                  {/* Formulaire Grid */}
                  <View style={styles.formStack}>
                    <View style={styles.nameRow}>
                      <View style={styles.halfCol}>
                        <AutoInput
                          label="Prénom"
                          placeholder="Oumar"
                          value={prenom}
                          onChangeText={(t) => { if (error) clearError(); setPrenom(t); }}
                          leftIcon={<User size={16} color={theme.colors.text.tertiary} />}
                          autoCorrect={false}
                          textContentType="givenName"
                        />
                      </View>
                      <View style={styles.halfCol}>
                        <AutoInput
                          label="Nom"
                          placeholder="Sy"
                          value={nom}
                          onChangeText={(t) => { if (error) clearError(); setNom(t); }}
                          autoCorrect={false}
                          textContentType="familyName"
                        />
                      </View>
                    </View>

                    <PhoneField
                      label="Numéro de téléphone"
                      value={telephone}
                      onChangeText={(t) => { if (error) clearError(); setTelephone(t); }}
                    />

                    <AutoInput
                      label="Adresse email"
                      placeholder="vous@autoloc.sn"
                      value={email}
                      onChangeText={(t) => { if (error) clearError(); setEmail(t); }}
                      leftIcon={<Mail size={16} color={theme.colors.text.tertiary} />}
                      autoCapitalize="none"
                      autoCorrect={false}
                      keyboardType="email-address"
                      textContentType="emailAddress"
                      autoComplete="email"
                    />

                    <View style={styles.passwordBox}>
                      <AutoInput
                        label="Mot de passe"
                        placeholder="••••••••"
                        value={password}
                        onChangeText={(t) => { if (error) clearError(); setPassword(t); }}
                        leftIcon={<Lock size={16} color={theme.colors.text.tertiary} />}
                        isPassword
                        autoCapitalize="none"
                        autoCorrect={false}
                        textContentType="newPassword"
                        autoComplete="password-new"
                      />
                      <PasswordStrengthBar password={password} />
                    </View>

                  <AutoButton
                    title="Créer mon compte"
                    variant="dark"
                    rightIcon={
                      <View style={styles.emeraldArrowCircle}>
                        <ArrowRight size={13} color="#4ADE80" />
                      </View>
                    }
                    loading={isLoading}
                    onPress={handleRegister}
                    size="md"
                    style={styles.submitBtn}
                  />
                </View>

                {/* Divider Glass */}
                <View style={styles.dividerRow}>
                  <View style={styles.dividerLine} />
                  <Text style={styles.dividerText}>OU CONTINUER AVEC</Text>
                  <View style={styles.dividerLine} />
                </View>

                {/* Google Auth Button */}
                <TouchableOpacity
                  style={[styles.googleGlassBtn, googleLoading && { opacity: 0.6 }]}
                  onPress={handleGoogleSignup}
                  disabled={googleLoading}
                  activeOpacity={0.8}
                >
                  {googleLoading ? (
                    <ActivityIndicator color="#041912" size="small" />
                  ) : (
                    <>
                      <Image
                        source={{ uri: 'https://cdn-icons-png.flaticon.com/512/300/300221.png' }}
                        style={styles.googleIcon}
                        resizeMode="contain"
                      />
                      <Text style={styles.googleGlassText}>S'inscrire avec Google</Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>
            </View>

            {/* Footer Capsule */}
            <TouchableOpacity
              onPress={onNavigateToLogin}
              style={styles.footerGlassCapsule}
              activeOpacity={0.8}
            >
              <Text style={styles.footerQuestion}>
                Vous avez déjà un compte ? <Text style={styles.loginLink}>Se connecter</Text>
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
  glassBackBtn: {
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
    backgroundColor: '#FFFFFF',
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
    marginBottom: theme.spacing[3],
  },
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing[2],
  },
  logoImage: {
    width: 160,
    height: 48,
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
    fontSize: 26,
    lineHeight: 32,
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
  formStack: {
    gap: 0,
  },
  nameRow: {
    flexDirection: 'row',
    gap: theme.spacing[2],
  },
  halfCol: {
    flex: 1,
  },
  passwordBox: {
    marginBottom: theme.spacing[2],
  },
  strengthContainer: {
    marginTop: -8,
    marginBottom: theme.spacing[2],
  },
  strengthHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  strengthTitle: {
    fontFamily: theme.typography.fontFamily.medium,
    fontSize: 10,
    color: theme.colors.text.tertiary,
  },
  strengthText: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: 10,
  },
  strengthTrack: {
    height: 4,
    backgroundColor: '#F3F4F6',
    borderRadius: 2,
    overflow: 'hidden',
  },
  strengthFill: {
    height: '100%',
    borderRadius: 2,
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
  loginLink: {
    fontFamily: theme.typography.fontFamily.semiBold,
    fontSize: 12,
    color: '#4ADE80',
    textDecorationLine: 'underline',
  },
});
