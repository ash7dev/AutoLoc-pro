import React, { useState, useRef, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  Pressable,
  Alert,
  ActivityIndicator,
  ScrollView,
  Platform,
} from 'react-native';
import { PhoneCall, ShieldCheck, ArrowRight, Edit2, CheckCircle2 } from 'lucide-react-native';
import { useAppStore } from '../../../../core/store/useAppStore';
import { apiClient } from '../../../../core/api/apiClient';
import { theme } from '../../../../core/theme';

interface GateStepPhoneOtpProps {
  onSuccess: () => void;
}

const COLORS = {
  bg: '#FFFFFF',
  accent: '#16A34A',
  accentLight: '#F0FDF4',
  ink: '#041912',
  inkMuted: '#64748B',
  border: '#E2E8F0',
  surface: '#F8FAFC',
};

const OTP_LENGTH = 6;

export const GateStepPhoneOtp: React.FC<GateStepPhoneOtpProps> = ({ onSuccess }) => {
  const user = useAppStore((state) => state.user);
  const updateUserProfile = useAppStore((state) => state.updateUserProfile);

  const [phone, setPhone] = useState(user?.telephone || '+221');
  const [otpCode, setOtpCode] = useState('');
  const [step, setStep] = useState<'PHONE_INPUT' | 'OTP_INPUT'>('PHONE_INPUT');
  const [loading, setLoading] = useState(false);
  const [resendCountdown, setResendCountdown] = useState(0);

  const inputRef = useRef<TextInput>(null);

  // Focus automatique de l'input caché lorsque le step OTP s'ouvre
  useEffect(() => {
    if (step === 'OTP_INPUT') {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [step]);

  // Envoi du code OTP par SMS
  const handleSendOtp = async () => {
    if (!phone || phone.trim().length < 8) {
      Alert.alert('Numéro invalide', 'Veuillez entrer un numéro de téléphone valide (ex: +221771234567).');
      return;
    }

    setLoading(true);
    try {
      if (phone !== user?.telephone) {
        await apiClient.post('/auth/phone/update', { telephone: phone.trim() });
      }

      await apiClient.post('/auth/phone/send-otp');
      setStep('OTP_INPUT');
      setOtpCode('');
      setResendCountdown(60);

      const interval = setInterval(() => {
        setResendCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (error: any) {
      const msg = error.response?.data?.message || 'Erreur lors de l\'envoi du code OTP par SMS.';
      Alert.alert('Erreur', typeof msg === 'string' ? msg : 'Échec de l\'envoi.');
    } finally {
      setLoading(false);
    }
  };

  // Validation du code OTP
  const handleVerifyOtp = async (codeToVerify?: string) => {
    const code = codeToVerify || otpCode;
    if (!code || code.trim().length < OTP_LENGTH) {
      Alert.alert('Code incomplet', `Veuillez saisir les ${OTP_LENGTH} chiffres du code SMS.`);
      return;
    }

    setLoading(true);
    try {
      await apiClient.post('/auth/phone/verify-otp', { code: code.trim() });

      // Mettre à jour le profil local instantanément
      await updateUserProfile({
        telephone: phone.trim(),
        phoneVerified: true,
      });

      onSuccess();
    } catch (error: any) {
      const msg = error.response?.data?.message || 'Code OTP incorrect ou expiré.';
      Alert.alert('Code erroné', typeof msg === 'string' ? msg : 'Veuillez réessayez.');
    } finally {
      setLoading(false);
    }
  };

  // Gestion de la saisie OTP et Auto-Submit sur le 6ème chiffre
  const handleOtpChange = (text: string) => {
    const cleaned = text.replace(/[^0-9]/g, '').slice(0, OTP_LENGTH);
    setOtpCode(cleaned);

    if (cleaned.length === OTP_LENGTH) {
      handleVerifyOtp(cleaned);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <View style={styles.iconCircle}>
          <PhoneCall size={32} color={COLORS.accent} />
        </View>

        <Text style={styles.title}>
          {step === 'PHONE_INPUT' ? 'Numéro de Téléphone' : 'Code de Confirmation SMS'}
        </Text>

        <Text style={styles.subtitle}>
          {step === 'PHONE_INPUT'
            ? 'Entrez votre numéro de téléphone pour recevoir le code de sécurité par SMS.'
            : `Un code à ${OTP_LENGTH} chiffres a été envoyé par SMS au `}
          {step === 'OTP_INPUT' && (
            <Text style={{ fontWeight: '800', color: COLORS.ink }}>{phone}</Text>
          )}
        </Text>

        {step === 'PHONE_INPUT' ? (
          /* Saisie du numéro de téléphone */
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Numéro mobile</Text>
            <View style={styles.inputWrapper}>
              <Text style={styles.countryFlag}>🇸🇳 +221</Text>
              <View style={styles.separator} />
              <TextInput
                style={styles.input}
                placeholder="77 000 00 00"
                placeholderTextColor="#94A3B8"
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
              />
            </View>
          </View>
        ) : (
          /* Saisie OTP Ultra-Premium à 6 Cases Séparées */
          <View style={styles.fieldGroup}>
            {/* Ligne de modification du numéro */}
            <View style={styles.editPhoneRow}>
              <Text style={styles.label}>Code de sécurité</Text>
              <Pressable 
                style={styles.editPhoneButton} 
                onPress={() => setStep('PHONE_INPUT')}
              >
                <Edit2 size={13} color={COLORS.accent} />
                <Text style={styles.editPhoneText}>Modifier le numéro</Text>
              </Pressable>
            </View>

            {/* Input caché d'auto-fill SMS */}
            <TextInput
              ref={inputRef}
              style={styles.hiddenInput}
              value={otpCode}
              onChangeText={handleOtpChange}
              keyboardType="number-pad"
              maxLength={OTP_LENGTH}
              textContentType="oneTimeCode"
              autoComplete={Platform.OS === 'android' ? 'sms-otp' : 'one-time-code'}
            />

            {/* 6 Cases UI Distinctes */}
            <Pressable 
              style={styles.otpBoxesContainer} 
              onPress={() => inputRef.current?.focus()}
            >
              {Array.from({ length: OTP_LENGTH }).map((_, index) => {
                const digit = otpCode[index] || '';
                const isFocused = otpCode.length === index;
                const isFilled = digit.length > 0;

                return (
                  <View
                    key={index}
                    style={[
                      styles.otpBox,
                      isFocused && styles.otpBoxFocused,
                      isFilled && styles.otpBoxFilled,
                    ]}
                  >
                    <Text style={styles.otpDigitText}>{digit}</Text>
                  </View>
                );
              })}
            </Pressable>

            {/* Rangée de Renvoi avec Compte à rebours */}
            <View style={styles.resendRow}>
              <Text style={styles.resendText}>Vous n'avez pas reçu le code ?</Text>
              <Pressable
                disabled={resendCountdown > 0 || loading}
                onPress={handleSendOtp}
              >
                <Text style={[styles.resendLink, resendCountdown > 0 && { color: COLORS.inkMuted }]}>
                  {resendCountdown > 0 ? `Renvoyer (${resendCountdown}s)` : 'Renvoyer par SMS'}
                </Text>
              </Pressable>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Barre d'Action Inférieure */}
      <View style={styles.footer}>
        {step === 'PHONE_INPUT' ? (
          <Pressable
            style={[styles.submitButton, loading && { opacity: 0.7 }]}
            onPress={handleSendOtp}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <>
                <Text style={styles.submitButtonText}>Envoyer le code SMS</Text>
                <ArrowRight size={18} color="#FFFFFF" strokeWidth={2.5} />
              </>
            )}
          </Pressable>
        ) : (
          <Pressable
            style={[
              styles.submitButton,
              (loading || otpCode.length < OTP_LENGTH) && { opacity: 0.7 },
            ]}
            onPress={() => handleVerifyOtp()}
            disabled={loading || otpCode.length < OTP_LENGTH}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <>
                <Text style={styles.submitButtonText}>Valider et continuer</Text>
                <CheckCircle2 size={18} color="#FFFFFF" strokeWidth={2.5} />
              </>
            )}
          </Pressable>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 24,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: COLORS.accentLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    alignSelf: 'center',
  },
  title: {
    fontFamily: theme.typography.fontFamily.displaySemiBold,
    fontSize: 22,
    color: theme.primitives.forest[800],
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: 13.5,
    color: COLORS.inkMuted,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  fieldGroup: {
    marginBottom: 18,
  },
  label: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: 13,
    color: COLORS.ink,
    marginBottom: 6,
  },
  editPhoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  editPhoneButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  editPhoneText: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: 12.5,
    color: COLORS.accent,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 14,
    paddingHorizontal: 14,
    height: 52,
  },
  countryFlag: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: 14,
    color: COLORS.ink,
  },
  separator: {
    width: 1,
    height: 20,
    backgroundColor: COLORS.border,
    marginHorizontal: 10,
  },
  input: {
    flex: 1,
    fontFamily: theme.typography.fontFamily.medium,
    fontSize: 15,
    color: COLORS.ink,
  },
  hiddenInput: {
    position: 'absolute',
    width: 1,
    height: 1,
    opacity: 0,
  },
  otpBoxesContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 14,
  },
  otpBox: {
    width: 48,
    height: 56,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  otpBoxFocused: {
    borderColor: COLORS.accent,
    backgroundColor: COLORS.accentLight,
    borderWidth: 2,
  },
  otpBoxFilled: {
    borderColor: COLORS.accent,
    backgroundColor: '#FFFFFF',
  },
  otpDigitText: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: 22,
    color: COLORS.ink,
  },
  resendRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 14,
  },
  resendText: {
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: 12.5,
    color: COLORS.inkMuted,
  },
  resendLink: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: 13,
    color: COLORS.accent,
  },
  footer: {
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 24,
    borderTopWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.bg,
  },
  submitButton: {
    backgroundColor: COLORS.accent,
    height: 52,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  submitButtonText: {
    fontFamily: theme.typography.fontFamily.bold,
    color: '#FFFFFF',
    fontSize: 15.5,
  },
});
