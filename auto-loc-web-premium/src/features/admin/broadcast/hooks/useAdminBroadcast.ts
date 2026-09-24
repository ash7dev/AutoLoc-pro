'use client';

import { useState, useCallback } from 'react';
import useSWR from 'swr';
import { adminBroadcastApi } from '../../../../core/api/adminBroadcastApi';
import type {
  AdminAudienceStats,
  BroadcastHistoryItem,
  SendBroadcastDto,
  TargetAudience,
  BroadcastChannel,
} from '../../../../core/api/adminBroadcastApi';

export function useAdminBroadcast() {
  const [isSending, setIsSending] = useState(false);
  const [sendSuccessMessage, setSendSuccessMessage] = useState<string | null>(null);

  // 1. Audience Stats SWR
  const {
    data: stats,
    error: statsError,
    mutate: mutateStats,
    isValidating: isValidatingStats,
  } = useSWR<AdminAudienceStats>('admin-broadcast-audience-stats', () =>
    adminBroadcastApi.getAudienceStats()
  );

  // 2. Broadcast History SWR
  const {
    data: history,
    error: historyError,
    mutate: mutateHistory,
    isValidating: isValidatingHistory,
  } = useSWR<BroadcastHistoryItem[]>('admin-broadcast-history', () =>
    adminBroadcastApi.getHistory()
  );

  // 3. Send Broadcast
  const sendBroadcast = useCallback(
    async (dto: SendBroadcastDto) => {
      if (!dto.title.trim() || !dto.message.trim()) {
        alert('Veuillez saisir un titre et un message de notification.');
        return false;
      }
      if (dto.channels.length === 0) {
        alert('Veuillez sélectionner au moins un canal de diffusion.');
        return false;
      }

      setIsSending(true);
      setSendSuccessMessage(null);
      try {
        const res = await adminBroadcastApi.sendBroadcast(dto);
        if (res.success) {
          setSendSuccessMessage(
            `🚀 Broadcast "${dto.title}" envoyé à ${res.totalRecipients} destinataires !`
          );
          await Promise.all([mutateStats(), mutateHistory()]);
          setTimeout(() => setSendSuccessMessage(null), 5000);
          return true;
        }
        return false;
      } catch (err: any) {
        alert(err?.message || "Erreur lors de l'envoi de la diffusion broadcast");
        return false;
      } finally {
        setIsSending(false);
      }
    },
    [mutateStats, mutateHistory]
  );

  return {
    stats,
    history: history || [],
    isLoadingStats: !stats && !statsError,
    isLoadingHistory: !history && !historyError,
    isRefreshing: isValidatingStats || isValidatingHistory,
    isSending,
    sendSuccessMessage,
    sendBroadcast,
    refresh: () => {
      mutateStats();
      mutateHistory();
    },
  };
}
