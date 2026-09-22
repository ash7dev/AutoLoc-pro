import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  RefreshControl,
  StatusBar,
} from 'react-native';
import { useQueryClient } from '@tanstack/react-query';
import { useAppStore } from '../../../core/store/useAppStore';
import { PayoutModal } from '../components/PayoutModal';
import { TransactionReceiptModal } from '../components/TransactionReceiptModal';
import { OwnerWalletGlassHeroHeader } from '../components/OwnerWalletGlassHeroHeader';
import { OwnerMobileMoneyAccountsCard } from '../components/OwnerMobileMoneyAccountsCard';
import { OwnerWalletTransactionsHistoryCard } from '../components/OwnerWalletTransactionsHistoryCard';
import { OwnerWalletSkeleton } from '../components/OwnerWalletSkeleton';
import { OwnerWalletData, OwnerWalletTransaction } from '../api/ownerApi';
import { useOwnerWallet, OWNER_WALLET_QUERY_KEY } from '../hooks/useOwnerWallet';

interface OwnerWalletScreenProps {
  onSwitchToTenant?: () => void;
  onProfilePress?: () => void;
}

export const OwnerWalletScreen: React.FC<OwnerWalletScreenProps> = ({
  onSwitchToTenant,
  onProfilePress,
}) => {
  const user = useAppStore((state) => state.user);
  const selectedCurrency = useAppStore((state) => state.selectedCurrency);
  const queryClient = useQueryClient();

  const { data: walletData, isLoading, refetch, isRefetching } = useOwnerWallet();

  const [payoutModalVisible, setPayoutModalVisible] = useState(false);
  const [selectedPayoutMethod, setSelectedPayoutMethod] = useState<'WAVE' | 'ORANGE_MONEY'>('WAVE');
  const [selectedTransaction, setSelectedTransaction] = useState<OwnerWalletTransaction | null>(null);

  const handleOpenPayout = (method: 'WAVE' | 'ORANGE_MONEY' = 'WAVE') => {
    setSelectedPayoutMethod(method);
    setPayoutModalVisible(true);
  };

  const handlePayoutSuccess = (montant: number) => {
    if (!walletData) return;
    const updated: OwnerWalletData = {
      ...walletData,
      soldeDisponible: walletData.soldeDisponible - montant,
      balance: {
        ...walletData.balance,
        soldeDisponible: walletData.balance.soldeDisponible - montant,
        soldeRetirable: Math.max(0, walletData.balance.soldeRetirable - montant),
      },
      transactions: [
        {
          id: `tx-new-${Date.now()}`,
          sens: 'DEBIT',
          soldeApres: walletData.soldeDisponible - montant,
          creeLe: new Date().toISOString(),
          titre: 'Demande de virement mobile',
          description: 'Retrait en cours de transfert',
          montant: -montant,
          type: 'DEBIT_RETRAIT',
          statut: 'EN_COURS',
          date: 'À l’instant',
          reference: `WDR-${Math.floor(100000 + Math.random() * 900000)}`,
        },
        ...walletData.transactions,
      ],
    };
    queryClient.setQueryData(OWNER_WALLET_QUERY_KEY, updated);
  };

  if (isLoading && !walletData) {
    return <OwnerWalletSkeleton />;
  }

  return (
    <View style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#041912" />

      {/* Hero Glass Header VIP Portefeuille */}
      <OwnerWalletGlassHeroHeader
        user={user}
        walletData={walletData || null}
        selectedCurrency={selectedCurrency}
        onProfilePress={onProfilePress}
        onSwitchToTenant={onSwitchToTenant}
        onRequestPayoutPress={() => handleOpenPayout('WAVE')}
      />

      <ScrollView
        style={styles.scrollContainer}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={() => refetch()}
            tintColor="#34D399"
          />
        }
      >
        {/* Carte Dédiée : Comptes de Retrait Mobile Money (Wave & Orange Money) */}
        <OwnerMobileMoneyAccountsCard
          walletData={walletData || null}
          selectedCurrency={selectedCurrency}
          onRequestPayoutPress={(method) => handleOpenPayout(method)}
        />

        {/* Historique des Mouvements & Transactions */}
        <OwnerWalletTransactionsHistoryCard
          transactions={walletData?.transactions || []}
          selectedCurrency={selectedCurrency}
          onSelectTransaction={(tx) => setSelectedTransaction(tx)}
        />
      </ScrollView>

      <PayoutModal
        visible={payoutModalVisible}
        soldeDisponible={walletData?.soldeDisponible || 0}
        soldeWave={walletData?.balance?.soldeWave || 0}
        soldeOrangeMoney={walletData?.balance?.soldeOrangeMoney || 0}
        initialMethod={selectedPayoutMethod}
        onClose={() => setPayoutModalVisible(false)}
        onPayoutSuccess={handlePayoutSuccess}
      />

      <TransactionReceiptModal
        visible={selectedTransaction !== null}
        transaction={selectedTransaction}
        selectedCurrency={selectedCurrency}
        onClose={() => setSelectedTransaction(null)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#041912',
  },
  scrollContainer: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 110,
    gap: 16,
  },
});

