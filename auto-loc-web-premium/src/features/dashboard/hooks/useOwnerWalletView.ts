'use client';

import { useState, useCallback, useEffect } from 'react';
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

const WALLET_SWR_OPTIONS = {
  dedupingInterval: 2 * 60 * 1000, // 2 minutes de fraîcheur
  revalidateIfStale: false, // Empêche le re-fetch automatique au remontage du composant
  revalidateOnFocus: false,
  keepPreviousData: true,
};

export function useOwnerWalletView() {
  const [lastRefreshedAt, setLastRefreshedAt] = useState<Date | null>(null);

  useEffect(() => {
    setLastRefreshedAt(new Date());
  }, []);

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
    isValidating: isValidatingWallet,
    mutate: mutateWallet,
  } = useSWR<WalletData>('wallet-me', () => walletApi.getWallet(), WALLET_SWR_OPTIONS);

  // 2. GET /wallet/penalites
  const {
    data: penalties,
    error: errorPenalties,
    isLoading: isLoadingPenalties,
    isValidating: isValidatingPenalties,
    mutate: mutatePenalties,
  } = useSWR<OwnerPenaltiesResponse>('wallet-penalties', () => walletApi.getPenalties(), WALLET_SWR_OPTIONS);

  // 3. GET /wallet/accounts
  const {
    data: accounts,
    isLoading: isLoadingAccounts,
    isValidating: isValidatingAccounts,
    mutate: mutateAccounts,
  } = useSWR<SavedAccountsResponse>('wallet-accounts', () => walletApi.getSavedAccounts(), WALLET_SWR_OPTIONS);

  // Convert tab filter to type/sens params for API if applicable
  const apiType = filters.tab === 'GAINS' ? 'CREDIT_LOCATION' : filters.tab === 'PENALITES' ? 'PENALITE_DEBIT' : undefined;
  const apiSens = filters.tab === 'RETRAITS' ? 'DEBIT' : undefined;

  // 4. GET /wallet/transactions
  const {
    data: transactionsData,
    error: errorTransactions,
    isLoading: isLoadingTransactions,
    isValidating: isValidatingTransactions,
    mutate: mutateTransactions,
  } = useSWR<PaginatedTransactionsResponse>(
    ['wallet-transactions', filters.page, apiType, apiSens],
    () =>
      walletApi.getTransactions({
        page: filters.page,
        limit: 20,
        type: apiType,
        sens: apiSens,
      }),
    WALLET_SWR_OPTIONS
  );

  const isRefreshing = isValidatingWallet || isValidatingPenalties || isValidatingAccounts || isValidatingTransactions;

  const refreshAll = useCallback(async () => {
    setLastRefreshedAt(new Date());
    await Promise.all([
      mutateWallet(),
      mutatePenalties(),
      mutateAccounts(),
      mutateTransactions(),
    ]);
  }, [mutateWallet, mutatePenalties, mutateAccounts, mutateTransactions]);

  return {
    wallet,
    penalties,
    accounts,
    transactionsData,

    isLoadingWallet: isLoadingWallet && !wallet,
    isLoadingPenalties,
    isLoadingAccounts,
    isLoadingTransactions,
    isRefreshing,
    lastRefreshedAt,

    errorWallet,
    errorPenalties,
    errorTransactions,

    filters,
    setFilters,
    refreshAll,
  };
}
