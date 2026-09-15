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
  SafeAreaView,
  Alert,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Mail, Lock, ArrowRight, ShieldCheck, Eye, EyeOff, X } from 'lucide-react-native';
import { theme } from '../../../core/theme';
import { AutoInput, PhoneField, AutoButton } from '../../../shared/components';
import { useAuthStore } from '../stores/useAuthStore';

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
  const [authMethod, setAuthMethod] = useState<'PHONE' | 'EMAIL'>('PHONE');
  const [telephone, setTelephone] = useState('+221770000000');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const { sendPhoneOtp, isLoading, error, clearError } = useAuthStore();

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

  const handleGoogleAuth = () => {
    Alert.alert('Connexion Google', 'Module Google OAuth initialisé...');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />

      {/* Top Navigation : Bouton Retour / Fermer pour accéder à l'accueil */}
      <View style={styles.topNavRow}>
        <TouchableOpacity
          style={styles.closeCircleBtn}
          onPress={onClose}
          activeOpacity={0.8}
        >
          <X size={18} color={theme.colors.text.primary} strokeWidth={2.5} />
        </TouchableOpacity>

        <TouchableOpacity onPress={onClose} activeOpacity={0.7} style={styles.skipBtn}>
          <Text style={styles.skipText}>Ignorer & Explorer</Text>
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.flexContainer}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header avec Logo & Badge KYC */}
          <View style={styles.headerBox}>
            <View style={styles.logoRow}>
              <Image
                source={require('../../../../assets/logo.png')}
                style={styles.logoImage}
                resizeMode="contain"
              />
            </View>

            <View style={styles.badgeKyc}>
              <ShieldCheck size={12} color={theme.colors.brand.main} />
              <Text style={styles.badgeKycText}>AUTHENTIFICATION SÉCURISÉE</Text>
            </View>

            <Text style={styles.mainTitle}>Connexion</Text>
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

          {/* Selector Methode (Telephone vs Email) */}
          <View style={styles.tabContainer}>
            <TouchableOpacity
              style={[styles.tabBtn, authMethod === 'PHONE' && styles.tabBtnActive]}
              onPress={() => { clearError(); setAuthMethod('PHONE'); }}
              activeOpacity={0.8}
            >
              <Text style={[styles.tabText, authMethod === 'PHONE' && styles.tabTextActive]}>
                Téléphone (SMS)
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.tabBtn, authMethod === 'EMAIL' && styles.tabBtnActive]}
              onPress={() => { clearError(); setAuthMethod('EMAIL'); }}
              activeOpacity={0.8}
            >
              <Text style={[styles.tabText, authMethod === 'EMAIL' && styles.tabTextActive]}>
                Email / Mot de passe
              </Text>
            </TouchableOpacity>
          </View>

          {/* Formulaire Dynamique */}
          {authMethod === 'PHONE' ? (
            <View style={styles.formStack}>
              <PhoneField
                label="Numéro de Téléphone"
                value={telephone}
                onChangeText={(t) => { clearError(); setTelephone(t); }}
              />

              <AutoButton
                title="Recevoir mon code SMS / WhatsApp"
                variant="action"
                rightIcon={<ArrowRight size={18} color="#FFFFFF" />}
                loading={isLoading}
                onPress={handlePhoneSubmit}
                size="lg"
                style={styles.submitBtn}
              />
            </View>
          ) : (
            <View style={styles.formStack}>
              <AutoInput
                label="Adresse Email"
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
                variant="action"
                rightIcon={<ArrowRight size={18} color="#FFFFFF" />}
                loading={isLoading}
                onPress={handleEmailSubmit}
                size="lg"
                style={styles.submitBtn}
              />
            </View>
          )}

          {/* Divider */}
          <View style={styles.dividerRow}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>Ou continuer avec</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Google Auth Button */}
          <AutoButton
            title="Continuer avec Google"
            variant="google"
            onPress={handleGoogleAuth}
            size="lg"
            style={styles.googleBtn}
          />

          {/* Inscription footer */}
          <View style={styles.footerRow}>
            <Text style={styles.footerQuestion}>Pas encore de compte ? </Text>
            <TouchableOpacity onPress={onNavigateToRegister} activeOpacity={0.7}>
              <Text style={styles.registerLink}>S'inscrire gratuitement</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.surface.page,
  },
  topNavRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing[5],
    paddingTop: theme.spacing[2],
    paddingBottom: theme.spacing[1],
  },
  closeCircleBtn: {
    width: 36,
    height: 36,
    borderRadius: theme.radius.full,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E4EBDB',
    justifyContent: 'center',
    alignItems: 'center',
    ...theme.elevation.sm,
  },
  skipBtn: {
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  skipText: {
    fontFamily: theme.typography.fontFamily.semiBold,
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.brand.main,
  },
  flexContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: theme.spacing[5],
    paddingVertical: theme.spacing[3],
    justifyContent: 'center',
    flexGrow: 1,
  },
  headerBox: {
    alignItems: 'center',
    marginBottom: theme.spacing[4],
  },
  logoRow: {
    marginBottom: theme.spacing[2],
  },
  logoImage: {
    width: 160,
    height: 50,
  },
  badgeKyc: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.brand.subtle,
    borderWidth: 1,
    borderColor: theme.colors.brand.border,
    paddingHorizontal: theme.spacing[3],
    paddingVertical: 4,
    borderRadius: theme.radius.full,
    gap: 6,
    marginBottom: theme.spacing[3],
  },
  badgeKycText: {
    ...theme.typography.textStyles.overline,
    fontSize: 9,
    color: theme.colors.brand.main,
  },
  mainTitle: {
    fontFamily: theme.typography.fontFamily.displaySemiBold,
    fontSize: theme.typography.fontSize['3xl'],
    lineHeight: theme.typography.lineHeight['3xl'],
    color: theme.primitives.forest[800],
    textAlign: 'center',
  },
  subtitle: {
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: theme.typography.fontSize.sm,
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
    borderRadius: theme.radius.md,
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
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: theme.colors.border.light,
    borderRadius: theme.radius.full,
    padding: 3,
    marginBottom: theme.spacing[4],
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 9,
    alignItems: 'center',
    borderRadius: theme.radius.full,
  },
  tabBtnActive: {
    backgroundColor: '#FFFFFF',
    ...theme.elevation.sm,
  },
  tabText: {
    fontFamily: theme.typography.fontFamily.medium,
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.text.secondary,
  },
  tabTextActive: {
    fontFamily: theme.typography.fontFamily.bold,
    color: theme.colors.text.primary,
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
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.brand.main,
  },
  submitBtn: {
    marginTop: theme.spacing[2],
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
    backgroundColor: theme.colors.border.light,
  },
  dividerText: {
    fontFamily: theme.typography.fontFamily.medium,
    fontSize: 11,
    color: theme.colors.text.tertiary,
  },
  googleBtn: {
    marginBottom: theme.spacing[4],
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerQuestion: {
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
  },
  registerLink: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.brand.main,
    textDecorationLine: 'underline',
  },
});
