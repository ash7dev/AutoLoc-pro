import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Platform,
} from 'react-native';
import { Check, Phone, ShieldCheck, Lock } from 'lucide-react-native';
import { theme } from '../../../../core/theme';
import { formatDirectPrice } from '../../../../core/utils/currency';
import { BookingPaymentModeSelector, PaymentMode } from './BookingPaymentModeSelector';
import { BookingPaymentGatewaySelector, PaymentGateway } from './BookingPaymentGatewaySelector';
import { AutoButton } from '../../../../shared/components/AutoButton';

interface BookingCheckoutStep2Props {
  grandTotal: number;
  userPhone?: string;
  selectedCurrency?: string;
  onSubmitPayment: (params: {
    paymentMode: PaymentMode;
    paymentGateway: PaymentGateway;
    phoneNumber: string;
  }) => void;
  isProcessing?: boolean;
}

export const BookingCheckoutStep2: React.FC<BookingCheckoutStep2Props> = ({
  grandTotal,
  userPhone = '',
  selectedCurrency = 'XOF',
  onSubmitPayment,
  isProcessing = false,
}) => {
  const [paymentMode, setPaymentMode] = useState<PaymentMode>('DEPOSIT_30');
  const [paymentGateway, setPaymentGateway] = useState<PaymentGateway>('WAVE');
  const [phoneNumber, setPhoneNumber] = useState(userPhone);
  const [hasConsented, setHasConsented] = useState(false);

  const numGrandTotal = Number(grandTotal) || 0;
  const deposit30 = Math.round(numGrandTotal * 0.3);
  const toPayAmount = paymentMode === 'DEPOSIT_30' ? deposit30 : numGrandTotal;

  const fmtCurrency = (val: number) => formatDirectPrice(val, selectedCurrency as any);

  const getGatewayName = () => {
    switch (paymentGateway) {
      case 'WAVE':
        return 'Wave';
      case 'ORANGE_MONEY':
        return 'Orange Money';
      default:
        return 'Paiement';
    }
  };

  const handlePayPress = () => {
    if (!hasConsented) return;
    onSubmitPayment({
      paymentMode,
      paymentGateway,
      phoneNumber,
    });
  };

  return (
    <View style={styles.rootContainer}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* 1. Sélection de la Modalité (Acompte 30% vs Totalité 100%) */}
        <BookingPaymentModeSelector
          mode={paymentMode}
          onSelectMode={setPaymentMode}
          depositAmount={deposit30}
          fullAmount={grandTotal}
          selectedCurrency={selectedCurrency}
        />

        {/* 2. Sélection du Moyen de Paiement (Wave, OM) */}
        <BookingPaymentGatewaySelector
          selectedGateway={paymentGateway}
          onSelectGateway={setPaymentGateway}
        />

        {/* 3. Saisie du Numéro de Téléphone pour Mobile Money */}
        <View style={styles.cardContainer}>
          <View style={styles.headerRow}>
            <View style={styles.titleIconBadge}>
              <Phone size={14} color="#4ADE80" strokeWidth={2.25} />
            </View>
            <Text style={styles.sectionTitle}>Numéro de téléphone</Text>
          </View>

          <View style={styles.inputWrap}>
            <View style={styles.countryPrefix}>
              <Text style={styles.flagText}>🇸🇳</Text>
              <Text style={styles.prefixText}>+221</Text>
            </View>
            <TextInput
              style={styles.textInput}
              value={phoneNumber}
              onChangeText={setPhoneNumber}
              placeholder="77 000 00 00"
              keyboardType="phone-pad"
              placeholderTextColor="#94A3B8"
            />
          </View>
          <Text style={styles.fieldHint}>
            Le compte {getGatewayName()} associé à ce numéro recevra la demande de confirmation.
          </Text>
        </View>

        {/* 4. Consentement aux CGU & Contrat de Location */}
        <TouchableOpacity
          style={[styles.consentCard, hasConsented && styles.consentCardActive]}
          onPress={() => setHasConsented(!hasConsented)}
          activeOpacity={0.8}
        >
          <View style={[styles.checkbox, hasConsented && styles.checkboxActive]}>
            {hasConsented && <Check size={12} color="#FFFFFF" strokeWidth={3} />}
          </View>
          <Text style={styles.consentText}>
            J'accepte les <Text style={styles.consentLink}>Conditions Générales d'Utilisation</Text> d'AutoLoc ainsi que le contrat de location du propriétaire.
          </Text>
        </TouchableOpacity>

        {/* Badge de Sécurité 256-bit */}
        <View style={styles.securityBadge}>
          <Lock size={13} color="#64748B" />
          <Text style={styles.securityText}>
            Paiement 100% sécurisé et encadré par AutoLoc Sénégal.
          </Text>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Barre Fixe Inférieure Bouton de Paiement CTA Dark Obsidian */}
      <SafeAreaView style={styles.footerSafeArea}>
        <View style={styles.footerRow}>
          <AutoButton
            title={`Payer ${fmtCurrency(toPayAmount)} avec ${getGatewayName()}`}
            variant="dark"
            leftIcon={
              <View style={styles.btnIconCircle}>
                <ShieldCheck size={14} color="#041912" strokeWidth={2.5} />
              </View>
            }
            onPress={handlePayPress}
            disabled={!hasConsented || !phoneNumber.trim()}
            loading={isProcessing}
            size="lg"
            style={styles.ctaButton}
          />
        </View>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  rootContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF', // Page principale en fond blanc pur (#FFFFFF)
  },
  scrollContent: {
    padding: theme.spacing[4],
    gap: theme.spacing[4],
  },
  cardContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    borderWidth: 1,
    borderColor: '#E4EBDB',
    padding: 16,
    gap: 14,
    ...Platform.select({
      ios: {
        shadowColor: '#041912',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  titleIconBadge: {
    width: 28,
    height: 28,
    borderRadius: 9,
    backgroundColor: '#041912',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(74, 222, 128, 0.35)',
  },
  sectionTitle: {
    fontFamily: theme.typography.fontFamily.displaySemiBold,
    fontSize: 15.5,
    color: '#041912',
    letterSpacing: -0.3,
  },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 14,
    overflow: 'hidden',
  },
  countryPrefix: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 12,
    paddingVertical: 12,
    gap: 6,
    borderRightWidth: 1,
    borderRightColor: '#E2E8F0',
  },
  flagText: {
    fontSize: 14,
  },
  prefixText: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: 14,
    color: '#041912',
  },
  textInput: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: 15,
    color: '#041912',
  },
  fieldHint: {
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: 11.5,
    color: '#64748B',
  },
  consentCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 18,
    padding: 14,
    gap: 12,
  },
  consentCardActive: {
    backgroundColor: '#ECFDF5',
    borderColor: '#059669',
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: '#94A3B8',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    marginTop: 2,
  },
  checkboxActive: {
    backgroundColor: '#059669',
    borderColor: '#059669',
  },
  consentText: {
    flex: 1,
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: 12,
    color: '#475569',
    lineHeight: 18,
  },
  consentLink: {
    fontFamily: theme.typography.fontFamily.bold,
    color: '#059669',
    textDecorationLine: 'underline',
  },
  securityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 4,
  },
  securityText: {
    fontFamily: theme.typography.fontFamily.medium,
    fontSize: 11.5,
    color: '#64748B',
  },
  footerSafeArea: {
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E4EBDB',
  },
  footerRow: {
    paddingHorizontal: theme.spacing[4],
    paddingVertical: theme.spacing[3],
  },
  ctaButton: {
    width: '100%',
  },
  btnIconCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#4ADE80',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
