import { useQuery } from '@tanstack/react-query';
import { ownerApi, OwnerWalletData } from '../api/ownerApi';

export const OWNER_WALLET_QUERY_KEY = ['owner', 'wallet'] as const;

export const useOwnerWallet = () => {
  return useQuery<OwnerWalletData>({
    queryKey: OWNER_WALLET_QUERY_KEY,
    queryFn: async () => {
      return await ownerApi.getOwnerWallet();
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 15 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });
};
