import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Image,
  SafeAreaView,
  Alert,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { User, Mail, Lock, ArrowRight, ChevronLeft, Eye, EyeOff } from 'lucide-react-native';
import { theme } from '../../../core/theme';
import { AutoInput, PhoneField, AutoButton } from '../../../shared/components';
import { useAuthStore } from '../stores/useAuthStore';

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
      ? { text: 'Faible', color: theme.colors.status.error }
      : strength <= 50
      ? { text: 'Moyen', color: theme.colors.amber[500] }
      : strength <= 75
      ? { text: 'Bon', color: '#0284C7' }
      : { text: 'Excellent', color: theme.colors.brand.main };

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
  const [prenom, setPrenom] = useState('');
  const [nom, setNom] = useState('');
  const [email, setEmail] = useState('');
  const [telephone, setTelephone] = useState('+221770000000');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const { registerProfile, isLoading, error, clearError } = useAuthStore();

  const handleRegister = async () => {
    if (!prenom.trim() || !nom.trim() || !email.trim() || !telephone.trim()) {
      Alert.alert('Champs requis', 'Veuillez remplir tous les champs obligatoires.');
      return;
    }

    try {
      await registerProfile({ prenom, nom, email, telephone });
      onNavigateToOtp(telephone);
    } catch (e) {
      // Géré par la store error
    }
  };

  const handleGoogleSignup = () => {
    Alert.alert('Inscription Google', 'Ouverture du module Google OAuth...');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <View style={styles.contentWrapper}>
          {/* En-tête : Nav Back + Logo Centré */}
          <View style={styles.topHeaderContainer}>
            <TouchableOpacity
              style={styles.backCircleBtn}
              onPress={onNavigateToLogin}
              activeOpacity={0.8}
            >
              <ChevronLeft size={20} color={theme.colors.text.primary} strokeWidth={2.5} />
            </TouchableOpacity>

            <View style={styles.logoCenterBox}>
              <Image
                source={require('../../../../assets/logo.png')}
                style={styles.logoImage}
                resizeMode="contain"
              />
            </View>

            <View style={styles.headerRightSpacer} />
          </View>

          {/* Titre & Sous-titre */}
          <View style={styles.headerSection}>
            <Text style={styles.eyebrowTag}>INSCRIPTION GRATUITE</Text>
            <Text style={styles.mainTitle}>Créez votre compte</Text>
            <Text style={styles.subtitle}>Rejoignez AutoLoc en moins d'une minute</Text>
          </View>

          {/* Bannière d'erreur */}
          {error ? (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>{error}</Text>
              <TouchableOpacity onPress={clearError}>
                <Text style={styles.errorClose}>×</Text>
              </TouchableOpacity>
            </View>
          ) : null}

          {/* Formulaire */}
          <View style={styles.formSection}>
            <View style={styles.nameRow}>
              <View style={styles.halfCol}>
                <AutoInput
                  label="Prénom"
                  placeholder="Oumar"
                  value={prenom}
                  onChangeText={(t) => { clearError(); setPrenom(t); }}
                  leftIcon={<User size={16} color={theme.colors.text.tertiary} />}
                  wrapperStyle={styles.compactInputWrapper}
                  containerStyle={styles.compactInputContainer}
                />
              </View>
              <View style={styles.halfCol}>
                <AutoInput
                  label="Nom"
                  placeholder="Sy"
                  value={nom}
                  onChangeText={(t) => { clearError(); setNom(t); }}
                  wrapperStyle={styles.compactInputWrapper}
                  containerStyle={styles.compactInputContainer}
                />
              </View>
            </View>

            {/* Téléphone */}
            <PhoneField
              label="Numéro de Téléphone"
              value={telephone}
              onChangeText={(t) => { clearError(); setTelephone(t); }}
              containerStyle={styles.compactPhoneContainer}
            />

            {/* Email */}
            <AutoInput
              label="Adresse email"
              placeholder="vous@autoloc.sn"
              value={email}
              onChangeText={(t) => { clearError(); setEmail(t); }}
              leftIcon={<Mail size={16} color="#38BDF8" />}
              autoCapitalize="none"
              keyboardType="email-address"
              wrapperStyle={styles.compactInputWrapper}
              containerStyle={styles.compactInputContainer}
            />

            {/* Mot de passe */}
            <View style={styles.passwordFieldBox}>
              <AutoInput
                label="Mot de passe"
                placeholder="••••••••"
                value={password}
                onChangeText={(t) => { clearError(); setPassword(t); }}
                leftIcon={<Lock size={16} color="#A78BFA" />}
                isPassword={!showPassword}
                wrapperStyle={styles.compactPasswordWrapper}
                containerStyle={styles.compactInputContainer}
                rightIcon={
                  <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                    {showPassword ? (
                      <EyeOff size={16} color={theme.colors.text.tertiary} />
                    ) : (
                      <Eye size={16} color={theme.colors.text.tertiary} />
                    )}
                  </TouchableOpacity>
                }
              />
              <PasswordStrengthBar password={password} />
            </View>
          </View>

          {/* Section Boutons et Footer */}
          <View style={styles.bottomStack}>
            {/* AutoButton Action Émeraude */}
            <AutoButton
              title="Créer mon compte"
              variant="action"
              rightIcon={<ArrowRight size={18} color="#FFFFFF" />}
              loading={isLoading}
              onPress={handleRegister}
              size="lg"
              style={styles.submitBtn}
            />

            {/* Séparateur */}
            <View style={styles.dividerRow}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>Ou continuer avec</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* Bouton Google */}
            <AutoButton
              title="Continuer avec Google"
              variant="google"
              onPress={handleGoogleSignup}
              size="lg"
            />

            {/* Lien Connexion */}
            <View style={styles.footerRow}>
              <Text style={styles.footerQuestion}>Déjà un compte ? </Text>
              <TouchableOpacity onPress={onNavigateToLogin} activeOpacity={0.7}>
                <Text style={styles.loginLink}>Se connecter</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.surface.page,
  },
  container: {
    flex: 1,
  },
  contentWrapper: {
    flex: 1,
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing[5],
    paddingTop: theme.spacing[1],
    paddingBottom: theme.spacing[4],
  },
  topHeaderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  backCircleBtn: {
    width: 38,
    height: 38,
    borderRadius: theme.radius.full,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: theme.colors.border.light,
    justifyContent: 'center',
    alignItems: 'center',
    ...theme.elevation.card,
  },
  logoCenterBox: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoImage: {
    width: 140,
    height: 44,
  },
  headerRightSpacer: {
    width: 38,
  },
  headerSection: {
    alignItems: 'center',
    marginBottom: 6,
  },
  eyebrowTag: {
    ...theme.typography.textStyles.overline,
    color: theme.colors.text.tertiary,
    marginBottom: 2,
  },
  mainTitle: {
    fontFamily: theme.typography.fontFamily.displaySemiBold, // Fraunces_600SemiBold (Plafond 600)
    fontSize: theme.typography.fontSize['3xl'],
    lineHeight: theme.typography.lineHeight['3xl'],
    color: theme.primitives.forest[800],
    textAlign: 'center',
  },
  subtitle: {
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.text.secondary,
    marginTop: 2,
    textAlign: 'center',
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: theme.colors.status.errorBg,
    borderWidth: 1,
    borderColor: theme.colors.status.errorBorder,
    borderRadius: theme.radius.md,
    paddingHorizontal: theme.spacing[3],
    paddingVertical: 6,
    marginBottom: 6,
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
  formSection: {
    gap: 0,
  },
  nameRow: {
    flexDirection: 'row',
    gap: theme.spacing[2],
  },
  halfCol: {
    flex: 1,
  },
  compactInputWrapper: {
    marginBottom: 6,
  },
  compactInputContainer: {
    minHeight: 46,
    paddingHorizontal: theme.spacing[3],
  },
  compactPhoneContainer: {
    marginBottom: 6,
  },
  compactPasswordWrapper: {
    marginBottom: 2,
  },
  passwordFieldBox: {
    marginBottom: 4,
  },
  strengthContainer: {
    marginTop: 2,
  },
  strengthHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  strengthTitle: {
    fontFamily: theme.typography.fontFamily.medium,
    fontSize: 9,
    color: theme.colors.text.tertiary,
  },
  strengthText: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: 9,
  },
  strengthTrack: {
    height: 3,
    backgroundColor: theme.colors.border.light,
    borderRadius: 1.5,
    overflow: 'hidden',
  },
  strengthFill: {
    height: '100%',
    borderRadius: 1.5,
  },
  bottomStack: {
    marginTop: 4,
    gap: theme.spacing[2],
  },
  submitBtn: {
    width: '100%',
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 4,
    gap: theme.spacing[2],
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: theme.colors.border.light,
  },
  dividerText: {
    fontFamily: theme.typography.fontFamily.medium,
    fontSize: 10,
    color: theme.colors.text.tertiary,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 4,
  },
  footerQuestion: {
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.text.secondary,
  },
  loginLink: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.brand.main,
    textDecorationLine: 'underline',
  },
});
