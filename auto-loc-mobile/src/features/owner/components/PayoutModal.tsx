import React, { useState, useEffect } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  ArrowRight,
  Check,
  ShieldCheck,
  Smartphone,
  Wallet,
  X,
  Zap,
} from 'lucide-react-native';
import { theme } from '../../../core/theme';
import { formatCurrency } from '../../../core/utils/currency';
import { useAppStore } from '../../../core/store/useAppStore';
import { ownerApi } from '../api/ownerApi';

const waveLogo = require('../../../../assets/images/payment/wave.png');
const orangeMoneyLogo = require('../../../../assets/images/payment/orange_money.jpg');

const { width: screenWidth } = Dimensions.get('window');
const MIN_PAYOUT_AMOUNT = 1000; // Minimum 1 000 FCFA pour le virement

export type PayoutMethod = 'WAVE' | 'ORANGE_MONEY';

interface PayoutModalProps {
  visible: boolean;
  soldeDisponible: number;
  soldeWave?: number;
  soldeOrangeMoney?: number;
  initialMethod?: PayoutMethod;
  onClose: () => void;
  onPayoutSuccess: (montant: number, method: string) => void;
}

export const PayoutModal: React.FC<PayoutModalProps> = ({
  visible,
  soldeDisponible,
  soldeWave = 0,
  soldeOrangeMoney = 0,
  initialMethod = 'WAVE',
  onClose,
  onPayoutSuccess,
}) => {
  const insets = useSafeAreaInsets();
  const selectedCurrency = useAppStore((state) => state.selectedCurrency);
  const user = useAppStore((state) => state.user);

  const [montant, setMontant] = useState('');
  const [selectedMethod, setSelectedMethod] = useState<PayoutMethod>(initialMethod);
  const [phone, setPhone] = useState(user?.telephone || '+221 77 000 00 00');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (visible) {
      setMontant('');
      let defaultMethod = initialMethod || 'WAVE';
      if (soldeWave > 0 && soldeOrangeMoney === 0) {
        defaultMethod = 'WAVE';
      } else if (soldeOrangeMoney > 0 && soldeWave === 0) {
        defaultMethod = 'ORANGE_MONEY';
      }
      setSelectedMethod(defaultMethod);
      setPhone(user?.telephone || '+221 77 000 00 00');
      setLoading(false);
    }
  }, [visible, user, initialMethod, soldeWave, soldeOrangeMoney]);

  const ALL_PAYOUT_METHODS: {
    id: PayoutMethod;
    title: string;
    sub: string;
    logo: any;
  }[] = [
    {
      id: 'WAVE',
      title: 'Wave Sénégal',
      sub: 'Transfert instantané sans frais (0%)',
      logo: waveLogo,
    },
    {
      id: 'ORANGE_MONEY',
      title: 'Orange Money',
      sub: 'Virement sécurisé via code OTP OM',
      logo: orangeMoneyLogo,
    },
  ];

  // Filtrer dynamiquement selon l'argent disponible sur les comptes
  const availableMethods = ALL_PAYOUT_METHODS.filter((m) => {
    if (soldeWave > 0 && soldeOrangeMoney === 0) {
      return m.id === 'WAVE';
    }
    if (soldeOrangeMoney > 0 && soldeWave === 0) {
      return m.id === 'ORANGE_MONEY';
    }
    return true;
  });

  const effectiveSolde =
    selectedMethod === 'WAVE' && soldeWave > 0
      ? soldeWave
      : selectedMethod === 'ORANGE_MONEY' && soldeOrangeMoney > 0
      ? soldeOrangeMoney
      : soldeDisponible;

  const handleMaxAmount = () => {
    setMontant(effectiveSolde.toString());
  };

  const handlePreSubmitPayout = () => {
    const amountNum = parseFloat(montant);
    const channelName = selectedMethod === 'WAVE' ? 'Wave Sénégal' : 'Orange Money';

    // 🔒 Verrou 1: Validation numérique du montant
    if (isNaN(amountNum) || amountNum <= 0) {
      Alert.alert(
        '⚠️ Montant invalide',
        `Veuillez saisir un montant valide supérieur à ${formatCurrency(MIN_PAYOUT_AMOUNT, selectedCurrency)}.`
      );
      return;
    }

    // 🔒 Verrou 2: Montant minimum de retrait
    if (amountNum < MIN_PAYOUT_AMOUNT) {
      Alert.alert(
        '⚠️ Montant minimum requis',
        `Le montant minimum pour effectuer un versement instantané est de ${formatCurrency(MIN_PAYOUT_AMOUNT, selectedCurrency)}.`
      );
      return;
    }

    // 🔒 Verrou 3: Solde crédité disponible sur le canal sélectionné
    if (effectiveSolde <= 0) {
      Alert.alert(
        '⛔ Solde indisponible',
        `Vous ne disposez d'aucun solde disponible au retrait sur votre compte ${channelName}.`
      );
      return;
    }

    // 🔒 Verrou 4: Dépassement du solde disponible
    if (amountNum > effectiveSolde) {
      Alert.alert(
        '⛔ Solde insuffisant',
        `Le montant demandé (${formatCurrency(amountNum, selectedCurrency)}) dépasse le solde disponible sur ${channelName} (${formatCurrency(effectiveSolde, selectedCurrency)}).`
      );
      return;
    }

    // 🔒 Verrou 5: Validation du format du numéro sénégalais (+221)
    const cleanPhone = phone.replace(/[\s\-\(\)]/g, '');
    const phoneRegex = /^(\+?221)?(7[05678]\d{7})$/;

    if (!phoneRegex.test(cleanPhone)) {
      Alert.alert(
        '📱 Numéro de téléphone invalide',
        'Veuillez saisir un numéro Mobile Money sénégalais valide (ex: +221 77 123 45 67 ou 78 123 45 67).'
      );
      return;
    }

    // 🔒 Verrou 6: Alerte de Confirmation avec Récapitulatif Final
    Alert.alert(
      '🔒 Confirmation du virement',
      `Êtes-vous sûr de vouloir transférer ${formatCurrency(amountNum, selectedCurrency)} vers votre compte ${channelName} (${cleanPhone}) ?\n\nCette opération est immédiate et irréversible.`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Confirmer le virement',
          style: 'default',
          onPress: () => executePayoutRequest(amountNum, cleanPhone, channelName),
        },
      ]
    );
  };

  const executePayoutRequest = async (amountNum: number, targetPhone: string, channelName: string) => {
    setLoading(true);

    try {
      await ownerApi.requestPayout({
        montant: amountNum,
        methode: selectedMethod,
        numeroDestinataire: targetPhone,
      });

      onPayoutSuccess(amountNum, selectedMethod);

      Alert.alert(
        'Virement Effectué ! 🚀',
        `Votre versement de ${formatCurrency(amountNum, selectedCurrency)} vers ${channelName} (${targetPhone}) a été envoyé avec succès.`
      );
      onClose();
    } catch (error: any) {
      const serverMsg = error?.response?.data?.message || 'Une erreur est survenue lors de la validation du virement.';
      Alert.alert(
        'Échec du virement ❌',
        typeof serverMsg === 'string' ? serverMsg : 'Veuillez réessayez ultérieurement.'
      );
    } finally {
      setLoading(false);
    }
  };

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        {/* 1. Fond Dark Obsidian Emerald & Aura Lumineuse */}
        <View style={StyleSheet.absoluteFill}>
          <LinearGradient
            colors={['#062017', '#04150F', '#020B08']}
            style={StyleSheet.absoluteFill}
          />
          <View style={styles.ambientAura} pointerEvents="none" />
        </View>

        {/* 2. Navigation Header Sombre */}
        <View
          style={[
            styles.safeHeader,
            { paddingTop: Math.max(insets.top, 16) + 4 },
          ]}
        >
          <View style={styles.headerRow}>
            <View style={styles.securityPill}>
              <ShieldCheck size={13} color="#34D399" />
              <Text style={styles.securityPillText}>VIREMENT SÉCURISÉ SSL</Text>
            </View>

            <TouchableOpacity
              style={styles.closeBtn}
              onPress={onClose}
              activeOpacity={0.8}
            >
              <X size={18} color="#FFFFFF" strokeWidth={2.5} />
            </TouchableOpacity>
          </View>
        </View>

        {/* 3. Formulaire dans une carte blanche "frontGlassCard" */}
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.flexOne}
        >
          <ScrollView
            contentContainerStyle={[
              styles.scrollContent,
              { paddingBottom: Math.max(insets.bottom + 20, 36) },
            ]}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.frontGlassCard}>
              {/* Card Header Box */}
              <View style={styles.cardHeaderBox}>
                <View style={styles.iconCircle}>
                  <Zap size={26} color="#059669" strokeWidth={2.2} />
                </View>
                <Text style={styles.mainTitle}>Demande de Virement</Text>
                <Text style={styles.subtitle}>
                  Transférez vos gains immédiatement vers votre compte Mobile Money.
                </Text>
              </View>

              {/* Banner Solde Disponible */}
              <View style={styles.balanceBanner}>
                <View style={styles.balanceLeft}>
                  <Wallet size={16} color="#059669" />
                  <Text style={styles.balanceLabel}>Solde disponible au retrait :</Text>
                </View>
                <Text style={styles.balanceAmount}>
                  {formatCurrency(effectiveSolde, selectedCurrency)}
                </Text>
              </View>

              {/* Punchy Pro Notice quand seul Wave ou seul OM a des fonds */}
              {soldeWave > 0 && soldeOrangeMoney === 0 && (
                <View style={styles.punchNoticePill}>
                  <Zap size={14} color="#34D399" />
                  <Text style={styles.punchNoticeText}>
                    <Text style={styles.punchBold}>Seul votre compte Wave Sénégal</Text> dispose actuellement de fonds disponibles ({formatCurrency(soldeWave, selectedCurrency)}).
                  </Text>
                </View>
              )}

              {soldeOrangeMoney > 0 && soldeWave === 0 && (
                <View style={[styles.punchNoticePill, styles.punchNoticePillOrange]}>
                  <Zap size={14} color="#F59E0B" />
                  <Text style={styles.punchNoticeTextOrange}>
                    <Text style={styles.punchBoldOrange}>Seul votre compte Orange Money</Text> dispose actuellement de fonds disponibles ({formatCurrency(soldeOrangeMoney, selectedCurrency)}).
                  </Text>
                </View>
              )}

              {/* Saisie du Montant */}
              <View style={styles.fieldBlock}>
                <View style={styles.fieldHeaderRow}>
                  <Text style={styles.fieldLabel}>Montant à retirer (FCFA)</Text>
                  <TouchableOpacity
                    onPress={handleMaxAmount}
                    style={styles.maxChip}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.maxChipText}>Retirer tout (MAX)</Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.amountInputContainer}>
                  <TextInput
                    style={styles.amountInput}
                    placeholder="0"
                    placeholderTextColor="#94A3B8"
                    keyboardType="numeric"
                    value={montant}
                    onChangeText={setMontant}
                  />
                  <Text style={styles.currencySuffix}>FCFA</Text>
                </View>
              </View>

              {/* Sélecteur de Moyen de Paiement */}
              <View style={styles.fieldBlock}>
                <Text style={styles.fieldLabel}>Canal de réception</Text>
                <View style={styles.methodList}>
                  {availableMethods.map((method) => {
                    const isSelected = selectedMethod === method.id;

                    return (
                      <TouchableOpacity
                        key={method.id}
                        style={[
                          styles.methodCard,
                          isSelected && styles.methodCardSelected,
                        ]}
                        onPress={() => setSelectedMethod(method.id)}
                        activeOpacity={0.85}
                      >
                        <View
                          style={[
                            styles.radioDot,
                            isSelected && styles.radioDotSelected,
                          ]}
                        >
                          {isSelected && <Check size={11} color="#FFFFFF" strokeWidth={3} />}
                        </View>

                        <View style={styles.logoWrapper}>
                          <Image
                            source={method.logo}
                            style={styles.logoImage}
                            resizeMode="contain"
                          />
                        </View>

                        <View style={styles.methodInfo}>
                          <Text style={styles.methodTitle}>{method.title}</Text>
                          <Text style={styles.methodSub}>{method.sub}</Text>
                        </View>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>

              {/* Numéro Mobile Money */}
              <View style={styles.fieldBlock}>
                <Text style={styles.fieldLabel}>Numéro Mobile Money de réception</Text>
                <View style={styles.phoneInputContainer}>
                  <View style={styles.phoneIconBox}>
                    <Smartphone size={16} color="#059669" />
                  </View>
                  <TextInput
                    style={styles.phoneInput}
                    placeholder="+221 77 000 00 00"
                    placeholderTextColor="#94A3B8"
                    keyboardType="phone-pad"
                    value={phone}
                    onChangeText={setPhone}
                  />
                </View>
              </View>

              {/* Notice informative */}
              <View style={styles.infoNotice}>
                <Zap size={14} color="#059669" />
                <Text style={styles.infoNoticeText}>
                  Les virement Wave & Orange Money sont traités instantanément H24.
                </Text>
              </View>

              {/* Bouton de Confirmation Sombre Hôte */}
              <TouchableOpacity
                style={[styles.submitBtn, loading && styles.btnDisabled]}
                onPress={handlePreSubmitPayout}
                disabled={loading}
                activeOpacity={0.85}
              >
                {loading ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <>
                    <Text style={styles.submitBtnText}>Confirmer le virement instantané</Text>
                    <View style={styles.emeraldArrowCircle}>
                      <ArrowRight size={13} color="#4ADE80" strokeWidth={2.5} />
                    </View>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#04150F',
  },
  ambientAura: {
    position: 'absolute',
    top: -80,
    alignSelf: 'center',
    width: screenWidth * 0.95,
    height: screenWidth * 0.95,
    borderRadius: (screenWidth * 0.95) / 2,
    backgroundColor: 'rgba(52, 211, 153, 0.16)',
  },
  flexOne: {
    flex: 1,
  },
  safeHeader: {
    paddingHorizontal: 18,
    paddingBottom: 10,
    zIndex: 10,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  securityPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(52, 211, 153, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(52, 211, 153, 0.25)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
  },
  securityPillText: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: 10,
    color: '#34D399',
    letterSpacing: 0.6,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.10)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  frontGlassCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.80)',
    borderRadius: 28,
    padding: theme.spacing[5],
    gap: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 14 },
        shadowOpacity: 0.22,
        shadowRadius: 24,
      },
      android: {
        elevation: 10,
      },
    }),
  },
  cardHeaderBox: {
    alignItems: 'center',
    marginBottom: 4,
  },
  iconCircle: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  mainTitle: {
    fontFamily: theme.typography.fontFamily.displaySemiBold,
    fontSize: 21,
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
  balanceBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  balanceLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  balanceLabel: {
    fontFamily: theme.typography.fontFamily.medium,
    fontSize: 12,
    color: '#475569',
  },
  balanceAmount: {
    fontFamily: theme.typography.fontFamily.displayBold,
    fontSize: 14.5,
    color: '#059669',
    fontVariant: ['tabular-nums'],
  },
  punchNoticePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#041912',
    borderWidth: 1,
    borderColor: 'rgba(52, 211, 153, 0.35)',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  punchNoticePillOrange: {
    backgroundColor: '#1E1B18',
    borderColor: 'rgba(245, 158, 11, 0.35)',
  },
  punchNoticeText: {
    flex: 1,
    fontFamily: theme.typography.fontFamily.medium,
    fontSize: 11.5,
    color: '#A7F3D0',
    lineHeight: 16,
  },
  punchNoticeTextOrange: {
    flex: 1,
    fontFamily: theme.typography.fontFamily.medium,
    fontSize: 11.5,
    color: '#FDE68A',
    lineHeight: 16,
  },
  punchBold: {
    fontFamily: theme.typography.fontFamily.bold,
    color: '#34D399',
  },
  punchBoldOrange: {
    fontFamily: theme.typography.fontFamily.bold,
    color: '#F59E0B',
  },
  fieldBlock: {
    gap: 6,
  },
  fieldHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  fieldLabel: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: 13,
    color: '#0F172A',
  },
  maxChip: {
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  maxChipText: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: 10.5,
    color: '#059669',
  },
  amountInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 54,
  },
  amountInput: {
    flex: 1,
    fontFamily: theme.typography.fontFamily.displayBold,
    fontSize: 22,
    color: '#041912',
    fontVariant: ['tabular-nums'],
  },
  currencySuffix: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: 14,
    color: '#64748B',
    marginLeft: 8,
  },
  methodList: {
    gap: 10,
  },
  methodCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 12,
  },
  methodCardSelected: {
    backgroundColor: '#ECFDF5',
    borderColor: '#059669',
  },
  radioDot: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  radioDotSelected: {
    backgroundColor: '#059669',
    borderColor: '#059669',
  },
  logoWrapper: {
    width: 44,
    height: 34,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    overflow: 'hidden',
    padding: 3,
  },
  logoImage: {
    width: '100%',
    height: '100%',
  },
  methodInfo: {
    flex: 1,
    gap: 2,
  },
  methodTitle: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: 14,
    color: '#0F172A',
  },
  methodSub: {
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: 11,
    color: '#64748B',
  },
  phoneInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 16,
    paddingHorizontal: 14,
    height: 50,
    gap: 10,
  },
  phoneIconBox: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: '#ECFDF5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  phoneInput: {
    flex: 1,
    fontFamily: theme.typography.fontFamily.medium,
    fontSize: 14.5,
    color: '#0F172A',
  },
  infoNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#ECFDF5',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  infoNoticeText: {
    flex: 1,
    fontFamily: theme.typography.fontFamily.medium,
    fontSize: 11.5,
    color: '#047857',
    lineHeight: 16,
  },
  submitBtn: {
    height: 52,
    borderRadius: 18,
    backgroundColor: '#041912',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    marginTop: 4,
    ...Platform.select({
      ios: {
        shadowColor: '#041912',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.25,
        shadowRadius: 10,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  btnDisabled: {
    opacity: 0.7,
  },
  submitBtnText: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: 14.5,
    color: '#FFFFFF',
  },
  emeraldArrowCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(16, 185, 129, 0.20)',
    borderWidth: 1,
    borderColor: 'rgba(74, 222, 128, 0.35)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
