"use client";

import React, { useState, useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { LogoLoader } from "@/components/ui/logo-loader";
import { OverviewStats } from "@/features/dashboard/components/overview-stats";
import { MobileRevenueCard } from "@/features/dashboard/components/mobile-revenue-card";
import { RevenueChart } from "@/features/dashboard/components/revenue-chart";
import { RecentReservations } from "@/features/dashboard/components/recent-reservations";
import { AttendanceCalendar } from "@/features/dashboard/components/attendance-calendar";
import { OwnerTodoCard } from "@/features/dashboard/components/owner-todo-card";
import type { ReservationItem } from "@/features/dashboard/components/recent-reservations";

function OwnerHeaderSkeleton({
  title,
  subtitle,
}: {
  title: string;
  subtitle: string;
}) {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-black border border-white/[0.06] px-4 py-4 sm:px-8 sm:py-6">
      {/* Ambient glows placeholders */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-20 -left-10 h-64 w-64 rounded-full bg-emerald-500/10 blur-3xl animate-pulse" />
        <div className="absolute -top-10 right-20 h-48 w-48 rounded-full bg-blue-500/8 blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-0 h-32 w-96 rounded-full bg-emerald-400/5 blur-2xl animate-pulse" />
      </div>

      <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-6">
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/25 bg-emerald-500/10 px-3 py-0.5">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="h-3 w-32 rounded-md bg-white/10 animate-pulse" />
            </span>
          </div>
          <h1 className="font-display text-xl sm:text-3xl font-bold tracking-tight text-white">
            <span className="block h-7 sm:h-8 w-60 sm:w-80 rounded-md bg-white/10 animate-pulse" />
            {/* Keep the text for screen readers */}
            <span className="sr-only">{title}</span>
          </h1>
          <p className="font-body text-sm text-white/40 tracking-normal">
            <span className="block h-4 w-[280px] rounded-md bg-white/10 animate-pulse" />
            <span className="sr-only">{subtitle}</span>
          </p>
        </div>

        <div className="flex items-center gap-3 sm:gap-4 shrink-0 flex-wrap">
          <div className="hidden md:block h-8 w-px bg-white/10" />
          {/* Notification bell placeholder */}
          <div className="h-9 w-9 rounded-xl border border-white/[0.08] bg-white/[0.04] animate-pulse" />
          {/* CTA button placeholder */}
          <div className="h-9 w-44 rounded-xl bg-white/[0.06] border border-white/[0.08] animate-pulse" />
        </div>
      </div>
    </div>
  );
}

function WalletSnapshotSkeleton({ hideCta = false }: { hideCta?: boolean }) {
  return (
    <div className="relative overflow-hidden rounded-lg bg-foreground p-4 sm:p-6 shadow-lg h-full flex flex-col">
      <div className="absolute top-0 left-6 right-6 h-px bg-white/10" />

      <div className="flex items-center justify-between mb-5">
        <p className="text-xs font-semibold uppercase tracking-widest text-white/40">
          <Skeleton className="h-3 w-28 bg-white/10 animate-pulse" />
        </p>
        {!hideCta && <Skeleton className="h-4 w-28 bg-white/10 animate-pulse rounded-md" />}
      </div>

      <div className="mb-5">
        <p className="text-xs text-white/30 font-medium mb-1.5">
          <Skeleton className="h-3 w-44 bg-white/10 animate-pulse" />
        </p>
        <p className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
          <Skeleton className="h-9 w-40 sm:w-48 bg-white/10 animate-pulse rounded-md" />
        </p>
        <div className="mt-2 flex items-center gap-1.5">
          <Skeleton className="h-3 w-3 rounded-full bg-emerald-400/20 animate-pulse" />
          <Skeleton className="h-3 w-56 bg-white/10 animate-pulse" />
        </div>
      </div>

      <div className="border border-white/10 mb-5" />

      <div className="grid grid-cols-2 gap-3 flex-1">
        <div className="space-y-1">
          <div className="flex items-center gap-1.5">
            <Skeleton className="h-3 w-3 rounded-full bg-white/10 animate-pulse" />
            <Skeleton className="h-3 w-24 bg-white/10 animate-pulse" />
          </div>
          <Skeleton className="h-6 w-24 bg-white/10 animate-pulse rounded-md" />
          <Skeleton className="h-3 w-44 bg-white/10 animate-pulse" />
        </div>
        <div className="space-y-1">
          <div className="flex items-center gap-1.5">
            <Skeleton className="h-3 w-3 rounded-full bg-white/10 animate-pulse" />
            <Skeleton className="h-3 w-24 bg-white/10 animate-pulse" />
          </div>
          <Skeleton className="h-6 w-24 bg-white/10 animate-pulse rounded-md" />
          <Skeleton className="h-3 w-44 bg-white/10 animate-pulse" />
        </div>
      </div>
    </div>
  );
}

function QuickActionsDesktopSkeleton() {
  return (
    <div className="rounded-lg border border-[hsl(var(--border))] bg-card shadow-sm flex flex-col h-full">
      <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-b border-[hsl(var(--border))]">
        <Skeleton className="h-5 w-44 bg-white/10 animate-pulse" />
        <div className="h-6 w-16 rounded-lg bg-white/10 animate-pulse" />
      </div>

      <div className="p-3 sm:p-4 grid grid-cols-1 gap-3 flex-1 content-start">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="rounded-xl border border-[hsl(var(--border))] bg-muted/20 p-4 animate-pulse"
          >
            <div className="flex items-center justify-between pointer-events-none">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/10 border border-white/10" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-48 bg-white/10 animate-pulse rounded-md" />
                  <Skeleton className="h-3 w-56 bg-white/10 animate-pulse rounded-md" />
                </div>
              </div>
              <div className="h-4 w-4 rounded bg-white/10" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function QuickActionsMobileSkeleton() {
  return (
    <div className="lg:hidden grid grid-cols-2 gap-3">
      {Array.from({ length: 4 }).map((_, i) => (
        <div
          key={i}
          className="flex flex-col items-center justify-center p-4 rounded-2xl bg-white border border-slate-100 animate-pulse"
        >
          <div className="w-12 h-12 rounded-xl bg-slate-100 border border-slate-100 mb-2" />
          <div className="h-4 w-24 rounded-md bg-slate-100 mb-1" />
          <div className="h-3 w-36 rounded-md bg-slate-100" />
        </div>
      ))}
    </div>
  );
}

export default function OwnerDashboardLoading() {
  const [showLogo, setShowLogo] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setShowLogo(false), 800);
    return () => clearTimeout(timer);
  }, []);

  if (showLogo) {
    return <LogoLoader />;
  }

  const reservations: ReservationItem[] = [];

  return (
    <div className="flex flex-col gap-4 p-3 sm:gap-6 sm:p-6 animate-in fade-in duration-500">
      <OwnerHeaderSkeleton
        title="Tableau de bord"
        subtitle="Vue d'ensemble"
      />

      {/* Stats row */}
      <OverviewStats data={null} />

      {/* Mobile layout */}
      <div className="lg:hidden space-y-4">
        <div className="grid grid-cols-1 gap-3">
          <MobileRevenueCard
            period="Ce mois"
            total="—"
            change="—"
            loading
          />
          <WalletSnapshotSkeleton />
        </div>

        <QuickActionsMobileSkeleton />

        <RecentReservations mode="pipeline" reservations={reservations} loading />
        <AttendanceCalendar loading />
      </div>

      {/* Desktop layout */}
      <div className="hidden lg:flex lg:flex-col lg:gap-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          <div className="lg:col-span-1">
            <RevenueChart
              data={[]}
              total="—"
              change="—"
              loading
              selectedMonth="current"
            />
          </div>
          <div className="lg:col-span-1">
            <WalletSnapshotSkeleton />
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 sm:gap-6">
          <div className="xl:col-span-2">
            <OwnerTodoCard items={[]} loading />
          </div>
          <div className="xl:col-span-1">
            <QuickActionsDesktopSkeleton />
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 sm:gap-6">
          <div className="xl:col-span-2">
            <RecentReservations mode="pipeline" reservations={reservations} loading />
          </div>
          <div className="flex flex-col gap-4 sm:gap-6">
            <AttendanceCalendar loading />
          </div>
        </div>
      </div>
    </div>
  );
}

