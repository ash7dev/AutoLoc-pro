"use client";

import Link from "next/link";
import { ArrowRight, Banknote, Clock3, Hourglass } from "lucide-react";
import { Separator } from "@/components/ui/separator";

export interface WalletSnapshotData {
  available: string;
  pending: string;
  processing: string;
}

export function WalletSnapshot({
  title = "Portefeuille",
  data = { available: "—", pending: "—", processing: "—" },
  href = "/dashboard/owner/wallet",
  loading = false,
  ctaLabel = "Gérer le wallet",
}: {
  title?: string;
  data?: WalletSnapshotData;
  href?: string;
  loading?: boolean;
  ctaLabel?: string;
}) {
  return (
    <div className="relative overflow-hidden rounded-lg bg-foreground p-6 shadow-lg h-full flex flex-col">
      {/* Subtle top highlight */}
      <div className="absolute top-0 left-6 right-6 h-px bg-white/10" />

      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <p className="text-xs font-semibold uppercase tracking-widest text-white/40">
          {title}
        </p>
        <Link
          href={href}
          className="inline-flex items-center gap-1 text-sm font-medium text-emerald-400 hover:text-emerald-300 transition-colors duration-200"
        >
          {ctaLabel}
          <ArrowRight className="h-3 w-3" />
        </Link>
      </div>

      {/* Main balance */}
      <div className="mb-5">
        <p className="text-xs text-white/30 font-medium mb-1.5">Solde disponible</p>
        <p className="text-3xl font-bold tracking-tight text-white">
          {loading ? "—" : data.available}
        </p>
        <div className="mt-2 flex items-center gap-1.5">
          <Banknote className="h-3 w-3 text-emerald-400" />
          <span className="text-xs font-medium text-emerald-400">Retirable immédiatement</span>
        </div>
      </div>

      <Separator className="bg-white/10 mb-5" />

      {/* Sub balances */}
      <div className="grid grid-cols-2 gap-3 flex-1">
        <div className="space-y-1">
          <div className="flex items-center gap-1.5">
            <Hourglass className="h-3 w-3 text-white/50" />
            <p className="text-sm text-white/60 font-medium">En attente</p>
          </div>
          <p className="text-base font-bold text-white">
            {loading ? "—" : data.pending}
          </p>
          <p className="text-xs text-white/40">Séquestre / check-in</p>
        </div>

        <div className="space-y-1">
          <div className="flex items-center gap-1.5">
            <Clock3 className="h-3 w-3 text-white/50" />
            <p className="text-sm text-white/60 font-medium">En traitement</p>
          </div>
          <p className="text-base font-bold text-white">
            {loading ? "—" : data.processing}
          </p>
          <p className="text-xs text-white/40">Retraits en cours</p>
        </div>
      </div>
    </div>
  );
}