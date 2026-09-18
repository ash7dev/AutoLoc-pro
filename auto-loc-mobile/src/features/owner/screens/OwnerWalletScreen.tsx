import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  RefreshControl,
  StatusBar,
} from 'react-native';
import { useAppStore } from '../../../core/store/useAppStore';
import { PayoutModal } from '../components/PayoutModal';
import { OwnerWalletGlassHeroHeader } from '../components/OwnerWalletGlassHeroHeader';
import { OwnerMobileMoneyAccountsCard } from '../components/OwnerMobileMoneyAccountsCard';
import { OwnerWalletTransactionsHistoryCard } from '../components/OwnerWalletTransactionsHistoryCard';
import { OwnerWalletSkeleton } from '../components/OwnerWalletSkeleton';
import { ownerApi, OwnerWalletData } from '../api/ownerApi';

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

  const [walletData, setWalletData] = useState<OwnerWalletData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [payoutModalVisible, setPayoutModalVisible] = useState(false);
  const [selectedPayoutMethod, setSelectedPayoutMethod] = useState<'WAVE' | 'ORANGE_MONEY'>('WAVE');

  const handleOpenPayout = (method: 'WAVE' | 'ORANGE_MONEY' = 'WAVE') => {
    setSelectedPayoutMethod(method);
    setPayoutModalVisible(true);
  };

  const loadWallet = async () => {
    try {
      const data = await ownerApi.getOwnerWallet();
      setWalletData(data);
    } catch {
      // Handled
    } finally {
      setLoading(false);
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
    });
  };

  if (loading && !walletData) {
    return <OwnerWalletSkeleton />;
  }

  return (
    <View style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#041912" />

      {/* Hero Glass Header VIP Portefeuille */}
      <OwnerWalletGlassHeroHeader
        user={user}
        walletData={walletData}
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
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              loadWallet();
            }}
            tintColor="#34D399"
          />
        }
      >
        {/* Carte Dédiée : Comptes de Retrait Mobile Money (Wave & Orange Money) */}
        <OwnerMobileMoneyAccountsCard
          walletData={walletData}
          selectedCurrency={selectedCurrency}
          onRequestPayoutPress={(method) => handleOpenPayout(method)}
        />

        {/* Historique des Mouvements & Transactions */}
        <OwnerWalletTransactionsHistoryCard
          transactions={walletData?.transactions || []}
          selectedCurrency={selectedCurrency}
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

