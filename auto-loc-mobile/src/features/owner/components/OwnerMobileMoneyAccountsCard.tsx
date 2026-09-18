import React from 'react';
import {
  Image,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Smartphone, Zap } from 'lucide-react-native';
import { theme } from '../../../core/theme';
import { formatCurrency } from '../../../core/utils/currency';
import { CurrencyCode } from '../../../shared/components/CurrencyPickerModal';
import { OwnerWalletData } from '../api/ownerApi';

const waveLogo = require('../../../../assets/images/payment/wave.png');
const orangeMoneyLogo = require('../../../../assets/images/payment/orange_money.jpg');

export type PayoutMethod = 'WAVE' | 'ORANGE_MONEY';

interface OwnerMobileMoneyAccountsCardProps {
  walletData: OwnerWalletData | null;
  selectedCurrency: CurrencyCode;
  onRequestPayoutPress?: (method: PayoutMethod) => void;
}

export const OwnerMobileMoneyAccountsCard: React.FC<OwnerMobileMoneyAccountsCardProps> = ({
  walletData,
  selectedCurrency,
  onRequestPayoutPress,
}) => {
  const soldeWave = walletData?.balance?.soldeWave ?? 0;
  const soldeOrangeMoney = walletData?.balance?.soldeOrangeMoney ?? 0;

  return (
    <View style={styles.cardContainer}>
      {/* Header de section */}
      <View style={styles.headerRow}>
        <View style={styles.titleIconBadge}>
          <Smartphone size={14} color="#34D399" strokeWidth={2.25} />
        </View>
        <Text style={styles.sectionTitle}>Comptes de Retrait Mobile Money</Text>
      </View>

      {/* Liste des canaux Mobile Money */}
      <View style={styles.accountsList}>
        {/* Account 1: Wave */}
        <TouchableOpacity
          style={styles.accountCard}
          onPress={() => onRequestPayoutPress?.('WAVE')}
          activeOpacity={0.8}
        >
          <View style={styles.logoWrapper}>
            <Image source={waveLogo} style={styles.logoImage} resizeMode="contain" />
          </View>

          <View style={styles.accountInfo}>
            <View style={styles.accountTitleRow}>
              <Text style={styles.accountTitle}>Wave Sénégal</Text>
              <View style={styles.activePill}>
                <Text style={styles.activePillText}>Actif</Text>
              </View>
            </View>
            <Text style={styles.accountSub}>Retrait automatique à 0% de frais</Text>
          </View>

          <View style={styles.amountBox}>
            <Text style={styles.amountValue}>
              {formatCurrency(soldeWave, selectedCurrency)}
            </Text>
            <Text style={styles.amountLabel}>Cumulé</Text>
          </View>
        </TouchableOpacity>

        {/* Account 2: Orange Money */}
        <TouchableOpacity
          style={styles.accountCard}
          onPress={() => onRequestPayoutPress?.('ORANGE_MONEY')}
          activeOpacity={0.8}
        >
          <View style={styles.logoWrapper}>
            <Image source={orangeMoneyLogo} style={styles.logoImage} resizeMode="contain" />
          </View>

          <View style={styles.accountInfo}>
            <View style={styles.accountTitleRow}>
              <Text style={styles.accountTitle}>Orange Money</Text>
              <View style={styles.activePill}>
                <Text style={styles.activePillText}>Actif</Text>
              </View>
            </View>
            <Text style={styles.accountSub}>Virement sécurisé via code OTP</Text>
          </View>

          <View style={styles.amountBox}>
            <Text style={styles.amountValue}>
              {formatCurrency(soldeOrangeMoney, selectedCurrency)}
            </Text>
            <Text style={styles.amountLabel}>Cumulé</Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* Punchy Pro Dark Glass Notice */}
      {soldeWave > 0 && soldeOrangeMoney === 0 && (
        <View style={styles.punchNoticePill}>
          <Zap size={14} color="#34D399" />
          <Text style={styles.punchNoticeText}>
            <Text style={styles.punchBold}>Seul votre compte Wave Sénégal</Text> dispose actuellement de fonds crédités.
          </Text>
        </View>
      )}

      {soldeOrangeMoney > 0 && soldeWave === 0 && (
        <View style={[styles.punchNoticePill, styles.punchNoticePillOrange]}>
          <Zap size={14} color="#F59E0B" />
          <Text style={styles.punchNoticeTextOrange}>
            <Text style={styles.punchBoldOrange}>Seul votre compte Orange Money</Text> dispose actuellement de fonds crédités.
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 16,
    gap: 14,
    ...Platform.select({
      ios: {
        shadowColor: '#041912',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.04,
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
    borderColor: 'rgba(52, 211, 153, 0.35)',
  },
  sectionTitle: {
    fontFamily: theme.typography.fontFamily.displaySemiBold,
    fontSize: 15,
    color: '#041912',
    letterSpacing: -0.3,
  },
  accountsList: {
    gap: 10,
  },
  accountCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 12,
  },
  logoWrapper: {
    width: 42,
    height: 34,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    overflow: 'hidden',
    padding: 2,
  },
  logoImage: {
    width: '100%',
    height: '100%',
  },
  accountInfo: {
    flex: 1,
    gap: 2,
  },
  accountTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  accountTitle: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: 13.5,
    color: '#0F172A',
  },
  activePill: {
    backgroundColor: 'rgba(52, 211, 153, 0.15)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  activePillText: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: 9.5,
    color: '#059669',
  },
  accountSub: {
    fontFamily: theme.typography.fontFamily.medium,
    fontSize: 11,
    color: '#64748B',
  },
  amountBox: {
    alignItems: 'flex-end',
    gap: 1,
  },
  amountValue: {
    fontFamily: theme.typography.fontFamily.displayBold,
    fontSize: 13.5,
    color: '#041912',
    fontVariant: ['tabular-nums'],
  },
  amountLabel: {
    fontFamily: theme.typography.fontFamily.medium,
    fontSize: 9.5,
    color: '#94A3B8',
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
});

