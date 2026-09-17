import React, { useState, useRef, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  ScrollView,
  Platform,
} from 'react-native';
import { PhoneCall, ShieldCheck, ArrowRight, Edit2, CheckCircle2, RefreshCw, MessageSquare } from 'lucide-react-native';
import { useAppStore } from '../../../../core/store/useAppStore';
import { apiClient } from '../../../../core/api/apiClient';
import { theme } from '../../../../core/theme';

interface GateStepPhoneOtpProps {
  onSuccess: () => void;
}

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

  useEffect(() => {
    if (step === 'OTP_INPUT') {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [step]);

  const handleSendOtp = async (channel: 'whatsapp' | 'sms' | 'auto' = 'auto') => {
    if (!phone || phone.trim().length < 8) {
      Alert.alert('Numéro invalide', 'Veuillez entrer un numéro de téléphone valide (ex: +221771234567).');
      return;
    }

    setLoading(true);
    try {
      if (phone !== user?.telephone) {
        await apiClient.post('/auth/phone/update', { telephone: phone.trim() });
      }

      await apiClient.post('/auth/phone/send-otp', { channel });
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
      const msg = error.response?.data?.message || 'Erreur lors de l\'envoi du code OTP.';
      Alert.alert('Erreur', typeof msg === 'string' ? msg : 'Échec de l\'envoi.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (codeToVerify?: string) => {
    const code = codeToVerify || otpCode;
    if (!code || code.trim().length < OTP_LENGTH) {
      Alert.alert('Code incomplet', `Veuillez saisir les ${OTP_LENGTH} chiffres du code SMS.`);
      return;
    }

    setLoading(true);
    try {
      await apiClient.post('/auth/phone/verify-otp', { code: code.trim() });

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

  const handleOtpChange = (text: string) => {
    const cleaned = text.replace(/[^0-9]/g, '').slice(0, OTP_LENGTH);
    setOtpCode(cleaned);

    if (cleaned.length === OTP_LENGTH) {
      handleVerifyOtp(cleaned);
    }
  };

  return (
    <ScrollView
      contentContainerStyle={styles.scrollContent}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.cardStackWrapper}>
        <View style={styles.backAccentCard} />

        <View style={styles.frontGlassCard}>
          <View style={styles.cardHeaderBox}>
            <View style={styles.iconCircle}>
              <PhoneCall size={30} color="#059669" />
            </View>

            <View style={styles.badgeKycGlass}>
              <ShieldCheck size={12} color="#059669" />
              <Text style={styles.badgeKycText}>AUTHENTIFICATION MOBILE</Text>
            </View>

            <Text style={styles.mainTitle}>
              {step === 'PHONE_INPUT' ? 'Numéro de Téléphone' : 'Vérification OTP'}
            </Text>
            <Text style={styles.subtitle}>
              {step === 'PHONE_INPUT'
                ? 'Un code de confirmation sécurisé vous sera envoyé par SMS / WhatsApp.'
                : `Code à ${OTP_LENGTH} chiffres envoyé par SMS au `}
              {step === 'OTP_INPUT' && (
                <Text style={styles.phoneHighlight}>{phone}</Text>
              )}
            </Text>
          </View>

          {step === 'PHONE_INPUT' ? (
            <View style={styles.formStack}>
              <View style={styles.fieldGroup}>
                <Text style={styles.label}>Numéro mobile Sénégal</Text>
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

              <TouchableOpacity
                style={[styles.submitBtn, loading && styles.btnDisabled]}
                onPress={() => handleSendOtp('auto')}
                disabled={loading}
                activeOpacity={0.85}
              >
                {loading ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <>
                    <Text style={styles.submitBtnText}>Recevoir le code d'accès</Text>
                    <View style={styles.emeraldArrowCircle}>
                      <ArrowRight size={13} color="#4ADE80" strokeWidth={2.5} />
                    </View>
                  </>
                )}
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.formStack}>
              <View style={styles.editPhoneRow}>
                <Text style={styles.label}>Code à 6 chiffres</Text>
                <TouchableOpacity
                  style={styles.editPhoneButton}
                  onPress={() => setStep('PHONE_INPUT')}
                  activeOpacity={0.7}
                >
                  <Edit2 size={12} color="#059669" />
                  <Text style={styles.editPhoneText}>Modifier le numéro</Text>
                </TouchableOpacity>
              </View>

              <TextInput
                ref={inputRef}
                style={styles.hiddenInput}
                value={otpCode}
                onChangeText={handleOtpChange}
                keyboardType="number-pad"
                maxLength={OTP_LENGTH}
                autoFocus
                textContentType="oneTimeCode"
                autoComplete={Platform.OS === 'android' ? 'sms-otp' : 'one-time-code'}
              />

              <TouchableOpacity
                style={styles.otpBoxesContainer}
                onPress={() => inputRef.current?.focus()}
                activeOpacity={0.9}
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
              </TouchableOpacity>

              <View style={styles.resendRow}>
                {resendCountdown > 0 ? (
                  <View style={styles.resendColumn}>
                    <Text style={styles.timerText}>
                      Renvoyer un nouveau code dans <Text style={styles.timerBold}>{resendCountdown}s</Text>
                    </Text>
                    <TouchableOpacity
                      style={styles.directSmsBtn}
                      onPress={() => handleSendOtp('sms')}
                      disabled={loading}
                      activeOpacity={0.7}
                    >
                      <MessageSquare size={13} color="#059669" />
                      <Text style={styles.directSmsText}>
                        Pas de WhatsApp ? Recevoir par SMS
                      </Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  <View style={styles.resendOptionsRow}>
                    <TouchableOpacity
                      style={styles.resendBtn}
                      onPress={() => handleSendOtp('auto')}
                      disabled={loading}
                      activeOpacity={0.7}
                    >
                      <RefreshCw size={13} color="#059669" />
                      <Text style={styles.resendBtnText}>Renvoyer (WhatsApp)</Text>
                    </TouchableOpacity>
                    <Text style={styles.dividerDot}>•</Text>
                    <TouchableOpacity
                      style={styles.resendBtn}
                      onPress={() => handleSendOtp('sms')}
                      disabled={loading}
                      activeOpacity={0.7}
                    >
                      <MessageSquare size={13} color="#059669" />
                      <Text style={styles.resendBtnText}>Recevoir par SMS</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>

              <TouchableOpacity
                style={[
                  styles.submitBtn,
                  (loading || otpCode.length < OTP_LENGTH) && styles.btnDisabled,
                ]}
                onPress={() => handleVerifyOtp()}
                disabled={loading || otpCode.length < OTP_LENGTH}
                activeOpacity={0.85}
              >
                {loading ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <>
                    <Text style={styles.submitBtnText}>Valider et continuer</Text>
                    <View style={styles.emeraldArrowCircle}>
                      <CheckCircle2 size={13} color="#4ADE80" strokeWidth={2.5} />
                    </View>
                  </>
                )}
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollContent: {
    paddingHorizontal: theme.spacing[4],
    paddingBottom: theme.spacing[4],
    flexGrow: 1,
    justifyContent: 'center',
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
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing[2],
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
    fontSize: 22,
    lineHeight: 28,
    color: '#041912',
    textAlign: 'center',
  },
  subtitle: {
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: 12.5,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 4,
    lineHeight: 18,
  },
  phoneHighlight: {
    fontFamily: theme.typography.fontFamily.bold,
    color: '#059669',
  },
  formStack: {
    gap: theme.spacing[3],
  },
  fieldGroup: {
    gap: 6,
  },
  label: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: 12.5,
    color: '#041912',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    borderRadius: 14,
    paddingHorizontal: 14,
    height: 50,
  },
  countryFlag: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: 14,
    color: '#041912',
  },
  separator: {
    width: 1,
    height: 18,
    backgroundColor: '#E5E7EB',
    marginHorizontal: 10,
  },
  input: {
    flex: 1,
    fontFamily: theme.typography.fontFamily.medium,
    fontSize: 15,
    color: '#041912',
  },
  editPhoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  editPhoneButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  editPhoneText: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: 12,
    color: '#059669',
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
    marginVertical: theme.spacing[2],
  },
  otpBox: {
    width: 44,
    height: 52,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    backgroundColor: '#F9FAFB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  otpBoxFocused: {
    borderColor: '#059669',
    backgroundColor: '#ECFDF5',
    borderWidth: 2,
  },
  otpBoxFilled: {
    borderColor: '#059669',
    backgroundColor: '#FFFFFF',
  },
  otpDigitText: {
    fontFamily: theme.typography.fontFamily.extraBold,
    fontVariant: ['tabular-nums'],
    fontSize: 22,
    color: '#041912',
  },
  resendRow: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 4,
  },
  resendColumn: {
    alignItems: 'center',
    gap: 6,
  },
  directSmsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingTop: 2,
  },
  directSmsText: {
    fontFamily: theme.typography.fontFamily.semiBold,
    fontSize: 12,
    color: '#059669',
    textDecorationLine: 'underline',
  },
  resendOptionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  dividerDot: {
    color: '#94A3B8',
    fontSize: 12,
  },
  timerText: {
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: 12,
    color: '#64748B',
  },
  timerBold: {
    fontFamily: theme.typography.fontFamily.bold,
    color: '#059669',
  },
  resendBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  resendBtnText: {
    fontFamily: theme.typography.fontFamily.semiBold,
    fontSize: 12,
    color: '#059669',
    textDecorationLine: 'underline',
  },
  submitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 50,
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
  btnDisabled: {
    opacity: 0.65,
  },
  submitBtnText: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: 14.5,
    color: '#FFFFFF',
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
    marginLeft: 8,
  },
});

