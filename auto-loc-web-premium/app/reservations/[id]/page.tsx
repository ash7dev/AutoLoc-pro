'use client';

import React, { useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useUserStore } from '@/src/core/store/useUserStore';
import { TenantUnauthenticatedState } from '@/src/features/reservations/components/TenantUnauthenticatedState';
import { TenantBookingDetailView } from '@/src/features/reservations/components/detail/TenantBookingDetailView';

export default function ReservationDetailPage() {
  const params = useParams();
  const id = typeof params?.id === 'string' ? params.id : '';
  const isAuthenticated = useUserStore((s) => s.isAuthenticated);
  const isInitialized = useUserStore((s) => s.isInitialized);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      if ('scrollRestoration' in window.history) {
        window.history.scrollRestoration = 'manual';
      }
      window.scrollTo(0, 0);
    }
  }, []);

  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-[#F8FAF4] text-[#0F172A] pt-[calc(5.25rem+env(safe-area-inset-top))] sm:pt-20 lg:pt-32 pb-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="h-10 w-48 bg-slate-200/80 animate-pulse rounded-xl" />
          <div className="h-64 bg-white border border-slate-200/80 rounded-3xl animate-pulse p-6 space-y-4">
            <div className="h-6 w-1/3 bg-slate-200/80 rounded-lg" />
            <div className="h-4 w-2/3 bg-slate-200/80 rounded-lg" />
            <div className="h-24 bg-slate-100 rounded-2xl" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAF4] text-[#0F172A] pt-[calc(5.25rem+env(safe-area-inset-top))] sm:pt-20 lg:pt-32 pb-24 px-4 sm:px-6 lg:px-8">
      {!isAuthenticated ? (
        <div className="max-w-xl mx-auto pt-6">
          <TenantUnauthenticatedState />
        </div>
      ) : (
        <TenantBookingDetailView reservationId={id} />
      )}
    </div>
  );
}
