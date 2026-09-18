import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { CircleDollarSign, ShieldCheck } from 'lucide-react-native';
import { formatCurrency } from '@autoloc/shared';
import { theme } from '../../../../core/theme';

export interface OwnerBookingFinancialCardProps {
  totalTenant: number;
  commission: number;
  balanceToCollect?: number;
  netOwner: number;
}

export const OwnerBookingFinancialCard: React.FC<OwnerBookingFinancialCardProps> = ({
  totalTenant,
  commission,
  balanceToCollect = 0,
  netOwner,
}) => {
  return (
    <View style={[styles.section, styles.sectionDark]}>
      <View style={styles.sectionHeader}>
        <View style={[styles.sectionIcon, styles.sectionIconDark]}>
          <CircleDollarSign size={17} color="#A7F3D0" />
        </View>
        <Text style={[styles.sectionTitle, styles.sectionTitleDark]}>
          Détails financiers & versement
        </Text>
      </View>

      <View style={styles.moneyLine}>
        <Text style={styles.moneyLabel}>Total réglé par le locataire</Text>
        <Text style={styles.moneyValue}>{formatCurrency(totalTenant)}</Text>
      </View>

      <View style={styles.moneyLine}>
        <Text style={styles.moneyLabel}>Commission AutoLoc déduite</Text>
        <Text style={styles.moneyValue}>-{formatCurrency(commission)}</Text>
      </View>

      {balanceToCollect > 0 ? (
        <View style={styles.moneyLine}>
          <Text style={styles.moneyLabel}>Solde espèces à percevoir au check-in</Text>
          <Text style={styles.moneyValue}>{formatCurrency(balanceToCollect)}</Text>
        </View>
      ) : null}

      <View style={styles.moneyDivider} />

      <View style={styles.moneyLine}>
        <Text style={[styles.moneyLabel, styles.moneyLabelProminent]}>Gain net propriétaire</Text>
        <Text style={[styles.moneyValue, styles.moneyValueProminent]}>{formatCurrency(netOwner)}</Text>
      </View>

      <View style={styles.guarantee}>
        <ShieldCheck size={16} color="#A7F3D0" />
        <Text style={styles.guaranteeText}>
          Vos revenus sont sécurisés et crédités automatiquement sur votre Wallet AutoLoc.
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  section: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 18,
    padding: 16,
    gap: 14,
  },
  sectionDark: {
    backgroundColor: '#072A20',
    borderColor: '#072A20',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
  },
  sectionIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: '#ECFDF5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionIconDark: {
    backgroundColor: 'rgba(255,255,255,.1)',
  },
  sectionTitle: {
    color: '#072A20',
    fontFamily: theme.typography.fontFamily.displaySemiBold,
    fontSize: 16,
  },
  sectionTitleDark: {
    color: '#FFFFFF',
  },
  moneyLine: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  moneyLabel: {
    flex: 1,
    color: '#A7F3D0',
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: 13,
  },
  moneyLabelProminent: {
    color: '#FFFFFF',
    fontFamily: theme.typography.fontFamily.bold,
  },
  moneyValue: {
    color: '#FFFFFF',
    fontFamily: theme.typography.fontFamily.semiBold,
    fontSize: 13,
  },
  moneyValueProminent: {
    fontSize: 18,
    fontFamily: theme.typography.fontFamily.displaySemiBold,
  },
  moneyDivider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,.16)',
  },
  guarantee: {
    flexDirection: 'row',
    gap: 9,
    alignItems: 'flex-start',
    padding: 11,
    backgroundColor: 'rgba(255,255,255,.06)',
    borderRadius: 12,
  },
  guaranteeText: {
    flex: 1,
    color: '#D1FAE5',
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: 12,
    lineHeight: 17,
  },
});
