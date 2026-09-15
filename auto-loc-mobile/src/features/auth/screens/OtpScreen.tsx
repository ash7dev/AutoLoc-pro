import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  Alert,
  TextInput,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Smartphone, CheckCircle2, ArrowLeft, RefreshCw } from 'lucide-react-native';
import { theme } from '../../../core/theme';
import { AutoButton } from '../../../shared/components';
import { useAuthStore } from '../stores/useAuthStore';

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
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />

      {/* Top Nav Back button */}
      <View style={styles.topNav}>
        <TouchableOpacity style={styles.backBtn} onPress={onNavigateBack} activeOpacity={0.7}>
          <ArrowLeft size={20} color={theme.colors.text.primary} />
          <Text style={styles.backBtnText}>Modifier le numéro</Text>
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.flexContainer}
      >
        <View style={styles.content}>
          {/* Badge Icon */}
          <View style={styles.iconCircle}>
            <Smartphone size={32} color={theme.colors.brand.main} />
          </View>

          <Text style={styles.overline}>VÉRIFICATION SMS / WHATSAPP</Text>
          <Text style={styles.title}>Vérification du numéro</Text>
          <Text style={styles.subtitle}>
            Saisissez le code à 6 chiffres envoyé au{'\n'}
            <Text style={styles.phoneHighlight}>{telephone || '+221 77 ...'}</Text>
          </Text>

          {/* Bannière Erreur */}
          {error ? (
            <View style={styles.errorBanner}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          {/* Input Code OTP 6 chiffres (tabular-nums) */}
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
              placeholderTextColor={theme.colors.text.tertiary}
              autoFocus
            />
          </View>

          {/* Submit Button Action Émeraude */}
          <AutoButton
            title="Valider et continuer"
            variant="action"
            rightIcon={<CheckCircle2 size={18} color="#FFFFFF" />}
            loading={isLoading}
            onPress={handleVerify}
            size="lg"
            style={styles.submitBtn}
          />

          {/* Resend Section */}
          <View style={styles.resendContainer}>
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
                <RefreshCw size={16} color={theme.colors.brand.main} />
                <Text style={styles.resendBtnText}>
                  {isResending ? 'Envoi en cours...' : 'Renvoyer le code OTP'}
                </Text>
              </TouchableOpacity>
            )}
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
  flexContainer: {
    flex: 1,
  },
  topNav: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing[5],
    paddingTop: theme.spacing[3],
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  backBtnText: {
    fontFamily: theme.typography.fontFamily.semiBold,
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.primary,
  },
  content: {
    flex: 1,
    paddingHorizontal: theme.spacing[5],
    alignItems: 'center',
    paddingTop: theme.spacing[6],
  },
  iconCircle: {
    width: 68,
    height: 68,
    borderRadius: theme.radius.full,
    backgroundColor: theme.colors.brand.subtle,
    borderWidth: 1,
    borderColor: theme.colors.brand.border,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing[3],
  },
  overline: {
    ...theme.typography.textStyles.overline,
    color: theme.colors.brand.main,
    marginBottom: 4,
  },
  title: {
    fontFamily: theme.typography.fontFamily.displaySemiBold, // Fraunces_600SemiBold (Plafond 600)
    fontSize: theme.typography.fontSize['3xl'],
    lineHeight: theme.typography.lineHeight['3xl'],
    color: theme.primitives.forest[800],
    marginBottom: theme.spacing[2],
    textAlign: 'center',
  },
  subtitle: {
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
    textAlign: 'center',
    marginBottom: theme.spacing[6],
  },
  phoneHighlight: {
    fontFamily: theme.typography.fontFamily.bold,
    color: theme.colors.brand.main,
  },
  errorBanner: {
    width: '100%',
    backgroundColor: theme.colors.status.errorBg,
    borderColor: theme.colors.status.errorBorder,
    borderWidth: 1,
    borderRadius: theme.radius.md,
    padding: theme.spacing[3],
    marginBottom: theme.spacing[4],
  },
  errorText: {
    fontFamily: theme.typography.fontFamily.medium,
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.status.error,
    textAlign: 'center',
  },
  otpInputBox: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: theme.colors.brand.main,
    borderRadius: theme.radius.card, // 20px
    paddingVertical: theme.spacing[3],
    alignItems: 'center',
    marginBottom: theme.spacing[6],
    ...theme.elevation.card,
  },
  otpTextInput: {
    fontFamily: theme.typography.fontFamily.extraBold, // Inter ExtraBold
    fontVariant: ['tabular-nums'],
    fontSize: 32,
    letterSpacing: 10,
    color: theme.colors.text.primary,
    textAlign: 'center',
    width: '100%',
  },
  submitBtn: {
    width: '100%',
    marginBottom: theme.spacing[6],
  },
  resendContainer: {
    alignItems: 'center',
  },
  timerText: {
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.tertiary,
  },
  timerBold: {
    fontFamily: theme.typography.fontFamily.bold,
    color: theme.colors.text.primary,
  },
  resendBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: theme.spacing[2],
  },
  resendBtnText: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.brand.main,
  },
});
