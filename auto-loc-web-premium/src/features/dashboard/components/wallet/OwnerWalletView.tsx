'use client';

import React, { useState } from 'react';
import { OwnerWalletHeader } from '../OwnerWalletHeader';
import { useOwnerWalletView } from '../../hooks/useOwnerWalletView';
import { WalletHeroBanner } from './WalletHeroBanner';
import { WalletTransactionLedger } from './WalletTransactionLedger';
import { WebWithdrawalModal } from './WebWithdrawalModal';
import { WebTransactionReceiptModal } from './WebTransactionReceiptModal';
import type { WalletTransactionItem } from '../../../../core/api/walletApi';

export const OwnerWalletView: React.FC = () => {
  const {
    wallet,
    accounts,
    transactionsData,
    isLoadingWallet,
    isLoadingTransactions,
    filters,
    setFilters,
    refreshAll,
  } = useOwnerWalletView();

  const [isWithdrawalOpen, setIsWithdrawalOpen] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<'WAVE' | 'ORANGE_MONEY'>('WAVE');
  const [selectedTransaction, setSelectedTransaction] = useState<WalletTransactionItem | null>(null);

  const handleOpenWithdrawal = (provider?: 'WAVE' | 'ORANGE_MONEY') => {
    setSelectedProvider(provider || 'WAVE');
    setIsWithdrawalOpen(true);
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Header */}
      <OwnerWalletHeader onRefresh={refreshAll} isLoading={isLoadingWallet} />

      {/* Hero Banner */}
      <WalletHeroBanner
        wallet={wallet}
        accounts={accounts}
        isLoading={isLoadingWallet}
        onOpenWithdrawal={handleOpenWithdrawal}
      />

      {/* Transaction Ledger */}
      <WalletTransactionLedger
        transactions={
          transactionsData?.transactions && transactionsData.transactions.length > 0
            ? transactionsData.transactions
            : wallet?.transactions || []
        }
        total={
          transactionsData?.total && transactionsData.total > 0
            ? transactionsData.total
            : wallet?.transactions?.length || 0
        }
        page={transactionsData?.page || filters.page}
        totalPages={transactionsData?.totalPages || 1}
        filters={filters}
        onFilterChange={setFilters}
        onSelectTransaction={setSelectedTransaction}
        isLoading={isLoadingTransactions && isLoadingWallet}
      />

      {/* Withdrawal Modal */}
      <WebWithdrawalModal
        isOpen={isWithdrawalOpen}
        initialProvider={selectedProvider}
        walletData={wallet}
        savedAccounts={accounts}
        onClose={() => setIsWithdrawalOpen(false)}
        onSuccess={refreshAll}
      />

      {/* Transaction Receipt Modal */}
      <WebTransactionReceiptModal
        transaction={selectedTransaction}
        onClose={() => setSelectedTransaction(null)}
      />
    </div>
  );
};
