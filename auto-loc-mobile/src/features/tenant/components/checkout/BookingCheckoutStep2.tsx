import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
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
            <Phone size={16} color={theme.colors.brand.main} />
            <Text style={styles.sectionLabelText}>NUMÉRO DE DÉBIT MOBILE MONEY</Text>
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
              placeholderTextColor="#7D8975"
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
            {hasConsented && <Check size={12} color="#FFFFFF" />}
          </View>
          <Text style={styles.consentText}>
            J'accepte les <Text style={styles.consentLink}>Conditions Générales d'Utilisation</Text> d'AutoLoc ainsi que le contrat de location du propriétaire.
          </Text>
        </TouchableOpacity>

        {/* Badge de Sécurité 256-bit */}
        <View style={styles.securityBadge}>
          <Lock size={14} color="#5F6B59" />
          <Text style={styles.securityText}>
            Paiement 100% sécurisé et encadré par AutoLoc Sénégal.
          </Text>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Barre Fixe Inférieure Bouton de Paiement CTA */}
      <SafeAreaView style={styles.footerSafeArea}>
        <View style={styles.footerRow}>
          <AutoButton
            title={`Payer ${fmtCurrency(toPayAmount)} avec ${getGatewayName()}`}
            variant="action"
            leftIcon={<ShieldCheck size={18} color="#FFFFFF" />}
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
    borderRadius: theme.radius.card,
    borderWidth: 1,
    borderColor: '#E4EBDB',
    padding: theme.spacing[4],
    gap: theme.spacing[3],
    ...theme.elevation.sm,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  sectionLabelText: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: 11,
    color: '#7D8975',
    letterSpacing: 0.6,
  },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FBF4',
    borderWidth: 1,
    borderColor: '#E4EBDB',
    borderRadius: theme.radius.md,
    overflow: 'hidden',
  },
  countryPrefix: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E4EBDB',
    paddingHorizontal: 12,
    paddingVertical: 12,
    gap: 6,
  },
  flagText: {
    fontSize: 14,
  },
  prefixText: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: 13,
    color: theme.primitives.forest[800],
  },
  textInput: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: 15,
    color: theme.primitives.forest[800],
  },
  fieldHint: {
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: 11,
    color: '#5F6B59',
  },
  consentCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#F8FBF4',
    borderWidth: 1,
    borderColor: '#E4EBDB',
    borderRadius: theme.radius.md,
    padding: theme.spacing[4],
    gap: theme.spacing[3],
  },
  consentCardActive: {
    backgroundColor: '#F1F8EE',
    borderColor: theme.colors.brand.main,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: '#9EAD96',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    marginTop: 2,
  },
  checkboxActive: {
    backgroundColor: theme.colors.brand.main,
    borderColor: theme.colors.brand.main,
  },
  consentText: {
    flex: 1,
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: 12,
    color: theme.primitives.forest[800],
    lineHeight: 18,
  },
  consentLink: {
    fontFamily: theme.typography.fontFamily.bold,
    color: theme.colors.brand.main,
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
    fontSize: 11,
    color: '#5F6B59',
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
});
