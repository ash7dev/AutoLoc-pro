import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
  TextInput,
  Dimensions,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Smartphone, CheckCircle2, ChevronLeft, RefreshCw, ArrowRight, ShieldCheck } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { theme } from '../../../core/theme';
import { AutoButton } from '../../../shared/components';
import { useAuthStore } from '../stores/useAuthStore';

const { width: screenWidth } = Dimensions.get('window');

interface OtpScreenProps {
  telephone: string;
  onNavigateBack: () => void;
  onSuccess: () => void;
}

export const OtpScreen: React.FC<OtpScreenProps> = ({
  telephone,
  onNavigateBack,
  onSuccess,
}) => {
  const insets = useSafeAreaInsets();
  const [code, setCode] = useState('');
  const [countdown, setCountdown] = useState(60);
  const [isResending, setIsResending] = useState(false);

  const { verifyPhoneOtp, sendPhoneOtp, isLoading, error, clearError } = useAuthStore();

  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setInterval(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [countdown]);

  const handleVerify = async () => {
    if (!code.trim() || code.length !== 6) {
      Alert.alert('Code incomplet', 'Veuillez saisir le code à 6 chiffres reçu par SMS ou WhatsApp.');
      return;
    }

    try {
      await verifyPhoneOtp(telephone, code);
      onSuccess();
    } catch (e) {
      // Handled in store error
    }
  };

  const handleResend = async () => {
    try {
      setIsResending(true);
      const expiresIn = await sendPhoneOtp(telephone);
      setCountdown(expiresIn || 60);
      Alert.alert('Code envoyé', 'Un nouveau code de vérification vous a été réexpédié par SMS/WhatsApp.');
    } catch (e: any) {
      Alert.alert('Erreur', e.message || 'Impossible de renvoyer le code.');
    } finally {
      setIsResending(false);
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
            onPress={onNavigateBack}
            activeOpacity={0.8}
          >
            <ChevronLeft size={20} color="#FFFFFF" strokeWidth={2.5} />
          </TouchableOpacity>
          <Text style={styles.topNavTitle}>Vérification du numéro</Text>
          <View style={styles.headerSpacer} />
        </View>

        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.flexOne}
        >
          <View style={styles.scrollContent}>
            {/* STACK CARDS SUPERPOSÉES */}
            <View style={styles.cardStackWrapper}>
              <View style={styles.backAccentCard} />

              <View style={styles.frontGlassCard}>
                {/* Header Card : Icon & Titres */}
                <View style={styles.cardHeaderBox}>
                  <View style={styles.iconCircle}>
                    <Smartphone size={28} color="#059669" />
                  </View>

                  <View style={styles.badgeKycGlass}>
                    <ShieldCheck size={12} color="#059669" />
                    <Text style={styles.badgeKycText}>AUTHENTIFICATION SMS / WHATSAPP</Text>
                  </View>

                  <Text style={styles.mainTitle}>Vérification OTP</Text>
                  <Text style={styles.subtitle}>
                    Saisissez le code à 6 chiffres envoyé au{'\n'}
                    <Text style={styles.phoneHighlight}>{telephone || '+221 77 000 00 00'}</Text>
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

                {/* Box de Saisie OTP Tabular Nums */}
                <View style={styles.otpInputBox}>
                  <TextInput
                    style={styles.otpTextInput}
                    value={code}
                    onChangeText={(val) => {
                      clearError();
                      const cleaned = val.replace(/[^0-9]/g, '');
                      if (cleaned.length <= 6) {
                        setCode(cleaned);
                      }
                    }}
                    keyboardType="number-pad"
                    maxLength={6}
                    placeholder="000000"
                    placeholderTextColor="#D1D5DB"
                    autoFocus
                  />
                </View>

                {/* Submit Button Action */}
                <AutoButton
                  title="Valider et continuer"
                  variant="dark"
                  rightIcon={
                    <View style={styles.emeraldArrowCircle}>
                      <ArrowRight size={13} color="#4ADE80" />
                    </View>
                  }
                  loading={isLoading}
                  onPress={handleVerify}
                  size="md"
                  style={styles.submitBtn}
                />
              </View>
            </View>

            {/* Resend Capsule */}
            <View style={styles.footerGlassCapsule}>
              {countdown > 0 ? (
                <Text style={styles.timerText}>
                  Renvoyer un nouveau code dans <Text style={styles.timerBold}>{countdown}s</Text>
                </Text>
              ) : (
                <TouchableOpacity
                  style={styles.resendBtn}
                  onPress={handleResend}
                  disabled={isResending}
                  activeOpacity={0.7}
                >
                  <RefreshCw size={14} color="#4ADE80" />
                  <Text style={styles.resendBtnText}>
                    {isResending ? 'Envoi en cours...' : 'Renvoyer le code par SMS / WhatsApp'}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
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
  topNavTitle: {
    fontFamily: theme.typography.fontFamily.semiBold,
    fontSize: 14,
    color: '#FFFFFF',
  },
  headerSpacer: {
    width: 38,
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
  iconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing[3],
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
  phoneHighlight: {
    fontFamily: theme.typography.fontFamily.bold,
    color: '#059669',
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
  otpInputBox: {
    width: '100%',
    backgroundColor: '#F9FAFB',
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    borderRadius: theme.radius.xl,
    paddingVertical: 12,
    alignItems: 'center',
    marginBottom: theme.spacing[4],
  },
  otpTextInput: {
    fontFamily: theme.typography.fontFamily.extraBold,
    fontVariant: ['tabular-nums'],
    fontSize: 30,
    letterSpacing: 8,
    color: '#041912',
    textAlign: 'center',
    width: '100%',
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
  timerText: {
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.80)',
  },
  timerBold: {
    fontFamily: theme.typography.fontFamily.bold,
    color: '#4ADE80',
  },
  resendBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  resendBtnText: {
    fontFamily: theme.typography.fontFamily.semiBold,
    fontSize: 12,
    color: '#4ADE80',
    textDecorationLine: 'underline',
  },
});
