import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  SafeAreaView,
  Alert,
} from 'react-native';
import { Wallet, ArrowDownRight, ArrowUpRight, ShieldCheck, Clock, CheckCircle2 } from 'lucide-react-native';
import { theme } from '../../../core/theme';
import { formatCurrency } from '../../../core/utils/currency';
import { useAppStore } from '../../../core/store/useAppStore';
import { OwnerHeader } from '../../../shared/components';
import { PayoutModal } from '../components/PayoutModal';
import { OwnerRevenueChartWidget } from '../components/OwnerRevenueChartWidget';
import { ownerApi, OwnerWalletData } from '../api/ownerApi';

interface OwnerWalletScreenProps {
  onSwitchToTenant?: () => void;
  onProfilePress?: () => void;
}

export const OwnerWalletScreen: React.FC<OwnerWalletScreenProps> = ({
  onSwitchToTenant,
  onProfilePress,
}) => {
  const selectedCurrency = useAppStore((state) => state.selectedCurrency);

  const [walletData, setWalletData] = useState<OwnerWalletData | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [payoutModalVisible, setPayoutModalVisible] = useState(false);

  const loadWallet = async () => {
    try {
      const data = await ownerApi.getOwnerWallet();
      setWalletData(data);
    } catch {
      // Handled via mock
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadWallet();
  }, []);

  const handlePayoutSuccess = (montant: number) => {
    if (!walletData) return;
    setWalletData({
      ...walletData,
      soldeDisponible: walletData.soldeDisponible - montant,
      transactions: [
        {
          id: `tx-new-${Date.now()}`,
          titre: 'Demande de virement mobile',
          description: 'Retrait en cours de transfert',
          montant: -montant,
          type: 'RETRAIT_WAVE',
          statut: 'EN_COURS',
          date: 'À l’instant',
          reference: `WDR-${Math.floor(100000 + Math.random() * 900000)}`,
        },
        ...walletData.transactions,
      ],
    });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <OwnerHeader
        variant="MANAGEMENT"
        title="Wallet & Finances"
        subtitle="Solde disponible & historique de vos gains"
        onProfilePress={onProfilePress}
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              loadWallet();
            }}
            tintColor={theme.colors.brand.main}
          />
        }
      >
        {/* Card Solde Principal */}
        <View style={styles.walletHeroCard}>
          <View style={styles.heroTop}>
            <View style={styles.walletBadge}>
              <Wallet size={16} color="#34D399" />
              <Text style={styles.walletBadgeText}>Compte AutoLoc Pay</Text>
            </View>

            <Text style={styles.nextPayoutText}>
              Prochain versement : {walletData?.prochainVersementDate || 'Vendredi'}
            </Text>
          </View>

          <View style={styles.balanceGroup}>
            <Text style={styles.balanceLabel}>Solde disponible</Text>
            <Text style={styles.balanceValue}>
              {formatCurrency(walletData?.soldeDisponible || 580500, selectedCurrency)}
            </Text>
          </View>

          <View style={styles.pendingRow}>
            <View style={styles.pendingItem}>
              <Text style={styles.pendingLabel}>En attente de versement</Text>
              <Text style={styles.pendingValue}>
                {formatCurrency(walletData?.enAttenteVersement || 198000, selectedCurrency)}
              </Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.pendingItem}>
              <Text style={styles.pendingLabel}>Cumul total gagné</Text>
              <Text style={styles.pendingValue}>
                {formatCurrency(walletData?.cumulHistorique || 3575000, selectedCurrency)}
              </Text>
            </View>
          </View>

          {/* CTA Demander un virement */}
          <TouchableOpacity
            style={styles.payoutCtaBtn}
            onPress={() => setPayoutModalVisible(true)}
            activeOpacity={0.85}
          >
            <ArrowDownRight size={18} color="#051B14" />
            <Text style={styles.payoutCtaText}>Demander un virement (Wave / Mobile / Banque)</Text>
          </TouchableOpacity>
        </View>

        {/* 📊 Diagramme interactif d'évolution des revenus */}
        <OwnerRevenueChartWidget
          selectedCurrency={selectedCurrency}
        />

        {/* Section Bilan Financier */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Répartition des revenus</Text>
        </View>

        <View style={styles.breakdownCard}>
          <View style={styles.breakdownRow}>
            <Text style={styles.breakdownLabel}>Revenus bruts des locations</Text>
            <Text style={styles.breakdownValue}>
              {formatCurrency((walletData?.revenusMoisActuel || 875000) * 1.1, selectedCurrency)}
            </Text>
          </View>

          <View style={styles.breakdownRow}>
            <Text style={styles.breakdownLabel}>Frais de service AutoLoc (10%)</Text>
            <Text style={styles.breakdownValueRed}>
              -{formatCurrency((walletData?.revenusMoisActuel || 875000) * 0.1, selectedCurrency)}
            </Text>
          </View>

          <View style={styles.breakdownDivider} />

          <View style={styles.breakdownRow}>
            <Text style={styles.breakdownNetLabel}>Net perçu ce mois-ci</Text>
            <Text style={styles.breakdownNetValue}>
              {formatCurrency(walletData?.revenusMoisActuel || 875000, selectedCurrency)}
            </Text>
          </View>
        </View>

        {/* Section Historique des Transactions */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Historique des Transactions</Text>
        </View>

        <View style={styles.transactionsList}>
          {walletData?.transactions.map((tx) => {
            const isPositive = tx.montant > 0;

            return (
              <View key={tx.id} style={styles.txItem}>
                <View style={[styles.txIconCircle, { backgroundColor: isPositive ? '#ECFDF5' : '#FEF2F2' }]}>
                  {isPositive ? (
                    <ArrowUpRight size={18} color="#047857" />
                  ) : (
                    <ArrowDownRight size={18} color="#DC2626" />
                  )}
                </View>

                <View style={styles.txInfo}>
                  <Text style={styles.txTitle}>{tx.titre}</Text>
                  <Text style={styles.txDesc}>{tx.description}</Text>
                  <Text style={styles.txDate}>{tx.date} • Réf: {tx.reference}</Text>
                </View>

                <View style={styles.txRight}>
                  <Text style={[styles.txAmount, { color: isPositive ? '#047857' : '#1F2937' }]}>
                    {isPositive ? '+' : ''}
                    {formatCurrency(tx.montant, selectedCurrency)}
                  </Text>
                  <View style={[styles.txStatusBadge, { backgroundColor: tx.statut === 'VALIDE' ? '#ECFDF5' : '#FEF3C7' }]}>
                    <Text style={[styles.txStatusText, { color: tx.statut === 'VALIDE' ? '#047857' : '#D97706' }]}>
                      {tx.statut === 'VALIDE' ? 'Effectué' : 'En cours'}
                    </Text>
                  </View>
                </View>
              </View>
            );
          })}
        </View>
      </ScrollView>

      <PayoutModal
        visible={payoutModalVisible}
        soldeDisponible={walletData?.soldeDisponible || 0}
        onClose={() => setPayoutModalVisible(false)}
        onPayoutSuccess={handlePayoutSuccess}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.surface.page,
  },
  scrollContent: {
    padding: theme.spacing[4],
    paddingBottom: 110,
    gap: 18,
  },
  walletHeroCard: {
    backgroundColor: '#051B14',
    borderRadius: 24,
    padding: 20,
    gap: 16,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 4,
  },
  heroTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  walletBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(52, 211, 153, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    gap: 6,
  },
  walletBadgeText: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: 11,
    color: '#34D399',
  },
  nextPayoutText: {
    fontFamily: theme.typography.fontFamily.medium,
    fontSize: 11,
    color: '#9CA3AF',
  },
  balanceGroup: {
    gap: 4,
  },
  balanceLabel: {
    fontFamily: theme.typography.fontFamily.medium,
    fontSize: 13,
    color: '#A7F3D0',
  },
  balanceValue: {
    fontFamily: theme.typography.fontFamily.displayBold,
    fontSize: 30,
    color: '#FFFFFF',
    letterSpacing: -0.5,
  },
  pendingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    padding: 14,
    borderRadius: 16,
  },
  pendingItem: {
    flex: 1,
    gap: 2,
  },
  pendingLabel: {
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: 11,
    color: '#9CA3AF',
  },
  pendingValue: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: 14,
    color: '#FFFFFF',
  },
  divider: {
    width: 1,
    height: 28,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    marginHorizontal: 12,
  },
  payoutCtaBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#34D399',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 16,
    gap: 8,
  },
  payoutCtaText: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: 13,
    color: '#051B14',
  },
  sectionHeader: {
    marginTop: 4,
  },
  sectionTitle: {
    fontFamily: theme.typography.fontFamily.displaySemiBold,
    fontSize: 17,
    color: '#041912',
  },
  breakdownCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    gap: 10,
  },
  breakdownRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  breakdownLabel: {
    fontFamily: theme.typography.fontFamily.medium,
    fontSize: 13,
    color: '#4B5563',
  },
  breakdownValue: {
    fontFamily: theme.typography.fontFamily.semiBold,
    fontSize: 13,
    color: '#1F2937',
  },
  breakdownValueRed: {
    fontFamily: theme.typography.fontFamily.semiBold,
    fontSize: 13,
    color: '#DC2626',
  },
  breakdownDivider: {
    height: 1,
    backgroundColor: '#F3F4F6',
    marginVertical: 2,
  },
  breakdownNetLabel: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: 14,
    color: '#041912',
  },
  breakdownNetValue: {
    fontFamily: theme.typography.fontFamily.displayBold,
    fontSize: 17,
    color: '#047857',
  },
  transactionsList: {
    gap: 10,
  },
  txItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    gap: 12,
  },
  txIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  txInfo: {
    flex: 1,
    gap: 2,
  },
  txTitle: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: 13,
    color: '#1F2937',
  },
  txDesc: {
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: 11,
    color: '#6B7280',
  },
  txDate: {
    fontFamily: theme.typography.fontFamily.medium,
    fontSize: 10.5,
    color: '#9CA3AF',
  },
  txRight: {
    alignItems: 'flex-end',
    gap: 4,
  },
  txAmount: {
    fontFamily: theme.typography.fontFamily.displayBold,
    fontSize: 14,
  },
  txStatusBadge: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 8,
  },
  txStatusText: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: 10,
  },
});
