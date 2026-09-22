'use client';

import { useState } from 'react';
import useSWR from 'swr';
import { walletApi } from '../../../core/api/walletApi';
import type {
  WalletData,
  OwnerPenaltiesResponse,
  SavedAccountsResponse,
  PaginatedTransactionsResponse,
} from '../../../core/api/walletApi';

export interface WalletFilterState {
  tab: 'ALL' | 'GAINS' | 'RETRAITS' | 'PENALITES';
  searchQuery: string;
  page: number;
}

export function useOwnerWalletView() {
  const [filters, setFilters] = useState<WalletFilterState>({
    tab: 'ALL',
    searchQuery: '',
    page: 1,
  });

  // 1. GET /wallet/me
  const {
    data: wallet,
    error: errorWallet,
    isLoading: isLoadingWallet,
    mutate: mutateWallet,
  } = useSWR<WalletData>('wallet-me', () => walletApi.getWallet());

  // 2. GET /wallet/penalites
  const {
    data: penalties,
    error: errorPenalties,
    isLoading: isLoadingPenalties,
    mutate: mutatePenalties,
  } = useSWR<OwnerPenaltiesResponse>('wallet-penalties', () => walletApi.getPenalties());

  // 3. GET /wallet/accounts
  const {
    data: accounts,
    isLoading: isLoadingAccounts,
    mutate: mutateAccounts,
  } = useSWR<SavedAccountsResponse>('wallet-accounts', () => walletApi.getSavedAccounts());

  // Convert tab filter to type/sens params for API if applicable
  const apiType = filters.tab === 'GAINS' ? 'CREDIT_LOCATION' : filters.tab === 'PENALITES' ? 'PENALITE_DEBIT' : undefined;
  const apiSens = filters.tab === 'RETRAITS' ? 'DEBIT' : undefined;

  // 4. GET /wallet/transactions
  const {
    data: transactionsData,
    error: errorTransactions,
    isLoading: isLoadingTransactions,
    mutate: mutateTransactions,
  } = useSWR<PaginatedTransactionsResponse>(
    ['wallet-transactions', filters.page, apiType, apiSens],
    () =>
      walletApi.getTransactions({
        page: filters.page,
        limit: 20,
        type: apiType,
        sens: apiSens,
      })
  );

  const refreshAll = async () => {
    await Promise.all([
      mutateWallet(),
      mutatePenalties(),
      mutateAccounts(),
      mutateTransactions(),
    ]);
  };

  return {
    wallet,
    penalties,
    accounts,
    transactionsData,

    isLoadingWallet,
    isLoadingPenalties,
    isLoadingAccounts,
    isLoadingTransactions,

    errorWallet,
    errorPenalties,
    errorTransactions,

    filters,
    setFilters,
    refreshAll,
  };
}
