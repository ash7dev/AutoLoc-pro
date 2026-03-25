import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

function OwnerHeaderSkeleton({
  title,
  subtitle,
}: {
  title: string;
  subtitle: string;
}) {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-black border border-white/[0.06] px-4 py-4 sm:px-8 sm:py-6">
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
              <span className="h-3 w-28 rounded-md bg-white/10 animate-pulse" />
            </span>
          </div>

          <h1 className="font-display text-xl sm:text-3xl font-bold tracking-tight text-white">
            <span className="block h-7 sm:h-8 w-56 sm:w-72 rounded-md bg-white/10 animate-pulse" />
            <span className="sr-only">{title}</span>
          </h1>

          <p className="font-body text-sm text-white/40 tracking-normal">
            <span className="block h-4 w-[320px] rounded-md bg-white/10 animate-pulse" />
            <span className="sr-only">{subtitle}</span>
          </p>
        </div>

        <div className="flex items-center gap-3 sm:gap-4 shrink-0 flex-wrap">
          <div className="hidden md:block h-8 w-px bg-white/10" />
          <div className="h-9 w-9 rounded-xl border border-white/[0.08] bg-white/[0.04] animate-pulse" />
          <div className="h-9 w-40 rounded-xl bg-emerald-500/20 border border-emerald-500/20 animate-pulse" />
        </div>
      </div>
    </div>
  );
}

function WalletSnapshotSkeleton({ hideCta = true }: { hideCta?: boolean }) {
  return (
    <div className="relative overflow-hidden rounded-lg bg-foreground p-4 sm:p-6 shadow-lg h-full flex flex-col">
      <div className="absolute top-0 left-6 right-6 h-px bg-white/10" />

      <div className="flex items-center justify-between mb-5">
        <p className="text-xs font-semibold uppercase tracking-widest text-white/40">
          <Skeleton className="h-3 w-28 bg-white/10 animate-pulse rounded-md" />
        </p>
        {!hideCta && (
          <Skeleton className="h-4 w-28 bg-white/10 animate-pulse rounded-md" />
        )}
      </div>

      <div className="mb-5">
        <p className="text-xs text-white/30 font-medium mb-1.5">
          <Skeleton className="h-3 w-44 bg-white/10 animate-pulse rounded-md" />
        </p>
        <p className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
          <Skeleton className="h-10 w-48 sm:w-56 bg-white/10 animate-pulse rounded-md" />
        </p>
        <div className="mt-2 flex items-center gap-1.5">
          <Skeleton className="h-3 w-3 rounded-full bg-emerald-400/20 animate-pulse" />
          <Skeleton className="h-3 w-56 bg-white/10 animate-pulse rounded-md" />
        </div>
      </div>

      <div className="border border-white/10 mb-5" />

      <div className="grid grid-cols-2 gap-3 flex-1">
        {Array.from({ length: 2 }).map((_, i) => (
          <div className="space-y-1" key={i}>
            <div className="flex items-center gap-1.5">
              <Skeleton className="h-3 w-3 rounded-full bg-white/10 animate-pulse" />
              <Skeleton className="h-3 w-24 bg-white/10 animate-pulse rounded-md" />
            </div>
            <Skeleton className="h-6 w-24 bg-white/10 animate-pulse rounded-md" />
            <Skeleton className="h-3 w-44 bg-white/10 animate-pulse rounded-md" />
          </div>
        ))}
      </div>
    </div>
  );
}

function WithdrawalFormSkeleton() {
  return (
    <div className="rounded-2xl bg-white border border-slate-200/80 shadow-sm overflow-hidden">
      <div className="flex items-center gap-2.5 px-5 py-3.5 border-b border-slate-100 bg-slate-50/40">
        <div className="w-7 h-7 rounded-lg flex items-center justify-center bg-emerald-50 text-emerald-600">
          <Skeleton className="h-3.5 w-3.5 rounded-md bg-emerald-200 animate-pulse" />
        </div>
        <Skeleton className="h-3 w-28 rounded-md bg-slate-100 animate-pulse" />
      </div>

      <div className="px-5 py-4 space-y-4">
        <div className="flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-emerald-50 border border-emerald-100">
          <Skeleton className="h-3 w-44 rounded-md bg-emerald-200 animate-pulse" />
          <Skeleton className="h-4 w-36 rounded-md bg-emerald-200 animate-pulse" />
        </div>

        <div>
          <Skeleton className="h-3 w-44 rounded-md bg-slate-100 animate-pulse mb-2" />
          <div className="grid grid-cols-4 gap-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton
                key={i}
                className="h-10 rounded-xl bg-slate-100 animate-pulse"
              />
            ))}
          </div>
        </div>

        <div>
          <Skeleton className="h-3 w-56 rounded-md bg-slate-100 animate-pulse mb-2" />
          <div className="relative">
            <Skeleton className="h-12 w-full rounded-xl bg-slate-100 animate-pulse" />
            <Skeleton className="absolute right-3.5 top-1/2 -translate-y-1/2 h-3 w-10 rounded-md bg-slate-100 animate-pulse" />
          </div>
        </div>

        <Skeleton className="w-full h-11 rounded-xl bg-emerald-500/20 animate-pulse" />
      </div>
    </div>
  );
}

function TransactionsPanelSkeleton() {
  return (
    <div className="rounded-xl border border-[hsl(var(--border))] bg-card">
      <div className="flex items-center justify-between px-5 py-4 border-b border-[hsl(var(--border))]">
        <Skeleton className="h-4 w-48 bg-slate-100 animate-pulse rounded-md" />
        <Skeleton className="h-3 w-24 bg-slate-100 animate-pulse rounded-md" />
      </div>

      <div className="divide-y divide-[hsl(var(--border))]">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3 px-5 py-3.5">
            <Skeleton className="w-8 h-8 rounded-lg bg-slate-100 animate-pulse" />
            <div className="flex-1 min-w-0 space-y-2">
              <Skeleton className="h-3 w-3/5 rounded-md bg-slate-100 animate-pulse" />
              <Skeleton className="h-3 w-2/5 rounded-md bg-slate-100 animate-pulse" />
            </div>
            <div className="text-right shrink-0 space-y-2">
              <Skeleton className="h-3 w-20 rounded-md bg-slate-100 animate-pulse" />
              <Skeleton className="h-3 w-28 rounded-md bg-slate-100 animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function OwnerWalletLoading() {
  return (
    <div className="flex flex-col gap-6 p-6">
      <OwnerHeaderSkeleton
        title="Portefeuille"
        subtitle="Solde, transactions et retraits"
      />

      <div className="space-y-6">
        <WalletSnapshotSkeleton hideCta />
        <WithdrawalFormSkeleton />
        <TransactionsPanelSkeleton />
      </div>
    </div>
  );
}

