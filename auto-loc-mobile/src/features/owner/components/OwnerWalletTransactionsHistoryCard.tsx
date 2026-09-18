import React, { useState } from 'react';
import {
  Image,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  ArrowDownRight,
  ArrowUpRight,
  Clock,
  History,
  AlertCircle,
  FileText,
} from 'lucide-react-native';
import { theme } from '../../../core/theme';
import { formatCurrency } from '../../../core/utils/currency';
import { CurrencyCode } from '../../../shared/components/CurrencyPickerModal';
import { OwnerWalletTransaction } from '../api/ownerApi';

const waveLogo = require('../../../../assets/images/payment/wave.png');
const orangeMoneyLogo = require('../../../../assets/images/payment/orange_money.jpg');

interface OwnerWalletTransactionsHistoryCardProps {
  transactions: OwnerWalletTransaction[];
  selectedCurrency: CurrencyCode;
}

type FilterTab = 'ALL' | 'CREDIT' | 'DEBIT';

export const OwnerWalletTransactionsHistoryCard: React.FC<OwnerWalletTransactionsHistoryCardProps> = ({
  transactions,
  selectedCurrency,
}) => {
  const [activeTab, setActiveTab] = useState<FilterTab>('ALL');

  const filteredTransactions = transactions.filter((tx) => {
    const isDebit =
      tx.sens === 'DEBIT' ||
      tx.type === 'DEBIT_RETRAIT' ||
      tx.type === 'DEBIT_PENALITE' ||
      (tx.type && String(tx.type).includes('RETRAIT')) ||
      (tx.type && String(tx.type).includes('DEBIT')) ||
      tx.montant < 0;
    const isCredit = !isDebit;

    if (activeTab === 'CREDIT') return isCredit;
    if (activeTab === 'DEBIT') return isDebit;
    return true;
  });

  return (
    <View style={styles.cardContainer}>
      {/* Header avec Titre & Filtres Rapides */}
      <View style={styles.headerBlock}>
        <View style={styles.titleRow}>
          <View style={styles.titleIconBadge}>
            <History size={15} color="#34D399" strokeWidth={2.25} />
          </View>
          <Text style={styles.sectionTitle}>Historique des Mouvements</Text>
        </View>

        {/* Onglets de Filtrage */}
        <View style={styles.filterTabsRow}>
          <TouchableOpacity
            style={[styles.tabBtn, activeTab === 'ALL' && styles.tabBtnActive]}
            onPress={() => setActiveTab('ALL')}
            activeOpacity={0.8}
          >
            <Text style={[styles.tabText, activeTab === 'ALL' && styles.tabTextActive]}>
              Tous ({transactions.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabBtn, activeTab === 'CREDIT' && styles.tabBtnActive]}
            onPress={() => setActiveTab('CREDIT')}
            activeOpacity={0.8}
          >
            <Text style={[styles.tabText, activeTab === 'CREDIT' && styles.tabTextActive]}>
              Gains
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabBtn, activeTab === 'DEBIT' && styles.tabBtnActive]}
            onPress={() => setActiveTab('DEBIT')}
            activeOpacity={0.8}
          >
            <Text style={[styles.tabText, activeTab === 'DEBIT' && styles.tabTextActive]}>
              Retraits
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Liste des Transactions */}
      {filteredTransactions.length > 0 ? (
        <View style={styles.txList}>
          {filteredTransactions.map((tx) => {
            const isDebit =
              tx.sens === 'DEBIT' ||
              tx.type === 'DEBIT_RETRAIT' ||
              tx.type === 'DEBIT_PENALITE' ||
              (tx.type && String(tx.type).includes('RETRAIT')) ||
              (tx.type && String(tx.type).includes('DEBIT')) ||
              tx.montant < 0;
            const isCredit = !isDebit;
            const isPenalite = tx.type === 'DEBIT_PENALITE';
            const isWave = tx.fournisseur === 'WAVE' || tx.type === 'RETRAIT_WAVE';
            const isOrange = tx.fournisseur === 'ORANGE_MONEY' || tx.type === 'RETRAIT_ORANGE';

            const isValide = !tx.statut || tx.statut === 'VALIDE';

            const displayAmount = Math.abs(tx.montant);
            const displayTitle =
              tx.titre && !tx.titre.includes('Débit / Retrait') && !tx.titre.includes('Débit / R')
                ? tx.titre
                : isDebit
                ? isWave
                  ? 'Retrait Wave'
                  : isOrange
                  ? 'Retrait Orange Money'
                  : 'Demande de retrait'
                : 'Gains de location';

            return (
              <View key={tx.id} style={styles.txRow}>
                {/* Icône de statut */}
                <View
                  style={[
                    styles.txIconBox,
                    isPenalite
                      ? styles.iconBoxAmber
                      : isCredit
                      ? styles.iconBoxGreen
                      : styles.iconBoxRed,
                  ]}
                >
                  {isPenalite ? (
                    <AlertCircle size={16} color="#D97706" />
                  ) : isCredit ? (
                    <ArrowUpRight size={17} color="#059669" strokeWidth={2.5} />
                  ) : (
                    <ArrowDownRight size={17} color="#DC2626" strokeWidth={2.5} />
                  )}
                </View>

                {/* Info Principale */}
                <View style={styles.txCenterInfo}>
                  <View style={styles.txTitleRow}>
                    <Text style={styles.txTitle} numberOfLines={1}>
                      {displayTitle}
                    </Text>

                    {/* Badge fournisseur si disponible */}
                    {isWave && (
                      <View style={styles.providerBadge}>
                        <Image source={waveLogo} style={styles.providerLogo} resizeMode="contain" />
                        <Text style={styles.providerText}>Wave</Text>
                      </View>
                    )}

                    {isOrange && (
                      <View style={styles.providerBadge}>
                        <Image source={orangeMoneyLogo} style={styles.providerLogo} resizeMode="contain" />
                        <Text style={styles.providerText}>OM</Text>
                      </View>
                    )}
                  </View>

                  <Text style={styles.txSubtitle} numberOfLines={1}>
                    {tx.date || 'Récemment'} • Ref: {tx.reference || `TX-${tx.id.substring(0, 6)}`}
                  </Text>
                </View>

                {/* Montant & Statut */}
                <View style={styles.txRightInfo}>
                  <Text
                    style={[
                      styles.txAmount,
                      isCredit ? styles.amountCredit : styles.amountDebit,
                    ]}
                  >
                    {isCredit ? '+' : '-'}
                    {formatCurrency(displayAmount, selectedCurrency)}
                  </Text>

                  <View
                    style={[
                      styles.statusPill,
                      isValide ? styles.statusValide : styles.statusEnCours,
                    ]}
                  >
                    <Text
                      style={[
                        styles.statusText,
                        isValide ? styles.statusTextValide : styles.statusTextEnCours,
                      ]}
                    >
                      {isValide ? 'Effectué' : 'En cours'}
                    </Text>
                  </View>
                </View>
              </View>
            );
          })}
        </View>
      ) : (
        <View style={styles.emptyStateBox}>
          <Clock size={28} color="#94A3B8" />
          <Text style={styles.emptyTitle}>Aucun mouvement enregistré</Text>
          <Text style={styles.emptySub}>
            Vos gains de location et demandes de retrait s’afficheront ici en temps réel.
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
  headerBlock: {
    gap: 12,
  },
  titleRow: {
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
  filterTabsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 3,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 6,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 9,
  },
  tabBtnActive: {
    backgroundColor: '#FFFFFF',
    ...Platform.select({
      ios: {
        shadowColor: '#0F172A',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.08,
        shadowRadius: 3,
      },
      android: {
        elevation: 1,
      },
    }),
  },
  tabText: {
    fontFamily: theme.typography.fontFamily.medium,
    fontSize: 11.5,
    color: '#64748B',
  },
  tabTextActive: {
    fontFamily: theme.typography.fontFamily.bold,
    color: '#041912',
  },
  txList: {
    gap: 10,
  },
  txRow: {
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
  txIconBox: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconBoxGreen: {
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  iconBoxRed: {
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FCA5A5',
  },
  iconBoxAmber: {
    backgroundColor: '#FFFBEB',
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  txCenterInfo: {
    flex: 1,
    gap: 2,
  },
  txTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  txTitle: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: 13,
    color: '#0F172A',
    flexShrink: 1,
  },
  providerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 6,
  },
  providerLogo: {
    width: 12,
    height: 12,
  },
  providerText: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: 9,
    color: '#475569',
  },
  txSubtitle: {
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: 10.5,
    color: '#64748B',
  },
  txRightInfo: {
    alignItems: 'flex-end',
    gap: 3,
  },
  txAmount: {
    fontFamily: theme.typography.fontFamily.displayBold,
    fontSize: 13.5,
    fontVariant: ['tabular-nums'],
  },
  amountCredit: {
    color: '#059669',
  },
  amountDebit: {
    color: '#041912',
  },
  statusPill: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  statusValide: {
    backgroundColor: '#ECFDF5',
  },
  statusEnCours: {
    backgroundColor: '#FFFBEB',
  },
  statusText: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: 9.5,
  },
  statusTextValide: {
    color: '#059669',
  },
  statusTextEnCours: {
    color: '#D97706',
  },
  emptyStateBox: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 24,
    gap: 6,
  },
  emptyTitle: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: 14,
    color: '#1E293B',
  },
  emptySub: {
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: 11.5,
    color: '#64748B',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
});
