'use client';

import React, { useState } from 'react';
import { CheckCircle2, Radio } from 'lucide-react';
import { useAdminBroadcast } from '@/src/features/admin/broadcast/hooks/useAdminBroadcast';
import { AdminBroadcastHeaderBar } from '@/src/features/admin/broadcast/components/AdminBroadcastHeaderBar';
import { AdminBroadcastComposerCard } from '@/src/features/admin/broadcast/components/AdminBroadcastComposerCard';
import { AdminBroadcastLivePreview } from '@/src/features/admin/broadcast/components/AdminBroadcastLivePreview';
import { AdminBroadcastHistoryTable } from '@/src/features/admin/broadcast/components/AdminBroadcastHistoryTable';
import type { TargetAudience, BroadcastChannel } from '@/src/core/api/adminBroadcastApi';

export default function AdminBroadcastPage() {
  const {
    stats,
    history,
    isLoadingStats,
    isLoadingHistory,
    isRefreshing,
    isSending,
    sendSuccessMessage,
    sendBroadcast,
    refresh,
  } = useAdminBroadcast();

  // State for live preview simulation
  const [livePayload, setLivePayload] = useState<{
    title: string;
    message: string;
    targetAudience: TargetAudience;
    channels: BroadcastChannel[];
    url: string;
    imageUrl: string;
  }>({
    title: '🌟 Offre Spéciale AutoLoc Dakar',
    message:
      'Profitez de 15% de réduction sur la réservation de SUV et Berlines d’exception ce week-end à Dakar !',
    targetAudience: 'TOUS',
    channels: ['PUSH_MOBILE', 'EMAIL'],
    url: '/dashboard',
    imageUrl: '',
  });

  return (
    <div className="space-y-6 pb-20 max-w-[1600px] mx-auto">
      {/* Toast Banner Notification on Send */}
      {sendSuccessMessage && (
        <div className="bg-[#0A3D2E] text-white p-4 rounded-2xl shadow-2xl flex items-center justify-between border border-emerald-500 animate-bounce">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-emerald-500/30 text-emerald-300">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">Broadcast Envoyé avec Succès !</h4>
              <p className="text-xs text-emerald-200">{sendSuccessMessage}</p>
            </div>
          </div>
          <button
            onClick={() => {}}
            className="text-xs text-emerald-300 hover:text-white px-3 py-1 rounded-lg bg-white/10"
          >
            Fermer
          </button>
        </div>
      )}

      {/* Header Bar avec Cartes KPI & Portée */}
      <AdminBroadcastHeaderBar
        stats={stats}
        isLoading={isLoadingStats}
        isRefreshing={isRefreshing}
        onRefresh={refresh}
      />

      {/* Main Studio Composer & Live Simulator Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column (2 Cols): Composer Form */}
        <div className="lg:col-span-2">
          <AdminBroadcastComposerCard
            stats={stats}
            isSending={isSending}
            onSend={sendBroadcast}
            onPayloadChange={setLivePayload}
          />
        </div>

        {/* Right Column (1 Col): Real-time Live Preview Simulator */}
        <div className="lg:col-span-1">
          <AdminBroadcastLivePreview payload={livePayload} />
        </div>
      </div>

      {/* Campaign History Table */}
      <AdminBroadcastHistoryTable history={history} isLoading={isLoadingHistory} />
    </div>
  );
}
