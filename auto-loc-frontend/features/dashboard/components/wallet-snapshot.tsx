"use client";

import Link from "next/link";
import { ArrowRight, Banknote, Clock3, Hourglass, AlertTriangle } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";

export interface WalletSnapshotData {
  available: string;
  pending: string;
  processing: string;
  totalPenalties?: number; // Montant total des pénalités en FCFA
  penaltiesCount?: number; // Nombre de pénalités
}

export function WalletSnapshot({
  title = "Portefeuille",
  data = { available: "—", pending: "—", processing: "—" },
  href = "/dashboard/owner/wallet",
  loading = false,
  ctaLabel = "Gérer le wallet",
  hideCta = false,
}: {
  title?: string;
  data?: WalletSnapshotData;
  href?: string;
  loading?: boolean;
  ctaLabel?: string;
  hideCta?: boolean;
}) {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-black p-4 sm:p-6 shadow-xl h-full flex flex-col">
      {/* Subtle top highlight */}
      <div className="absolute top-0 left-6 right-6 h-px bg-white/10" />

      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <p className="text-xs font-semibold uppercase tracking-widest text-white/40">
          {title}
        </p>
        {!hideCta && (
          <Link
            href={href}
            className="inline-flex items-center gap-1 text-sm font-medium text-emerald-400 hover:text-emerald-300 transition-colors duration-200"
          >
            {ctaLabel}
            <ArrowRight className="h-3 w-3" />
          </Link>
        )}
      </div>

      {/* Main balance */}
      <div className="mb-5">
        <p className="text-xs text-white/30 font-medium mb-1.5">Solde total</p>
        <p className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
          {loading ? (
            <span className="inline-flex align-middle">
              <Skeleton className="h-9 w-44 sm:w-52 bg-white/10 animate-pulse rounded-md" />
            </span>
          ) : (
            data.available
          )}
        </p>
        {!loading && data.totalPenalties && data.totalPenalties > 0 ? (
          <div className="mt-2 flex items-center gap-1.5">
            <AlertTriangle className="h-3 w-3 text-yellow-400" />
            <span className="text-xs font-medium text-yellow-400">
              {data.totalPenalties.toLocaleString("fr-FR")} FCFA de pénalités en attente
            </span>
          </div>
        ) : (
          <div className="mt-2 flex items-center gap-1.5">
            <Banknote className="h-3 w-3 text-emerald-400" />
            <span className="text-xs font-medium text-emerald-400">Retirable immédiatement</span>
          </div>
        )}
      </div>

      <Separator className="bg-white/10 mb-5" />

      {/* Alerte Pénalités - Visible uniquement si pénalités > 0 */}
      {!loading && data.totalPenalties && data.totalPenalties > 0 && (
        <Link
          href={href}
          className="mb-4 flex items-start gap-2.5 p-3 bg-red-500/10 border border-red-500/20 rounded-xl hover:bg-red-500/15 transition-colors group"
        >
          <div className="w-7 h-7 rounded-lg bg-red-500/20 border border-red-500/30 flex items-center justify-center flex-shrink-0 mt-0.5">
            <AlertTriangle className="w-3.5 h-3.5 text-red-400" strokeWidth={2.5} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[12px] font-bold text-red-400 leading-tight">
              {data.penaltiesCount} pénalité{data.penaltiesCount! > 1 ? "s" : ""} en attente
            </p>
            <p className="text-[15px] font-black text-red-300 mt-0.5 tabular-nums">
              {data.totalPenalties.toLocaleString("fr-FR")} FCFA
            </p>
            <p className="text-[10px] text-red-400/70 mt-1">
              Sera déduit de votre prochain paiement
            </p>
          </div>
          <ArrowRight className="w-4 h-4 text-red-400/50 group-hover:text-red-400 group-hover:translate-x-0.5 transition-all mt-1 flex-shrink-0" strokeWidth={2} />
        </Link>
      )}

      {/* Sub balances */}
      <div className="grid grid-cols-2 gap-3 mb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-1.5">
            <Hourglass className="h-3 w-3 text-white/50" />
            <p className="text-sm text-white/60 font-medium">En attente</p>
          </div>
          <p className="text-base font-bold text-white">
            {loading ? (
              <Skeleton className="h-6 w-28 bg-white/10 animate-pulse rounded-md" />
            ) : (
              data.pending
            )}
          </p>
          <p className="text-xs text-white/40">Séquestre / check-in</p>
        </div>

        <div className="space-y-1">
          <div className="flex items-center gap-1.5">
            <Clock3 className="h-3 w-3 text-white/50" />
            <p className="text-sm text-white/60 font-medium">En traitement</p>
          </div>
          <p className="text-base font-bold text-white">
            {loading ? (
              <Skeleton className="h-6 w-28 bg-white/10 animate-pulse rounded-md" />
            ) : (
              data.processing
            )}
          </p>
          <p className="text-xs text-white/40">Retraits en cours</p>
        </div>
      </div>

      {/* Conditional Withdrawal Button */}
      {!loading && data.available !== "0 FCFA" && data.available !== "— FCFA" && (
        <div className="mt-auto pt-2">
          <Link
            href="/dashboard/owner/wallet"
            className="flex items-center justify-center gap-2 w-full py-3 px-4 bg-emerald-500 hover:bg-emerald-400 text-black rounded-xl text-[13px] font-black transition-all shadow-[0_0_20px_rgba(52,211,153,0.15)] hover:shadow-[0_0_25px_rgba(52,211,153,0.3)] active:scale-[0.98]"
          >
            <Banknote className="h-4 w-4" />
            Retirer mes fonds
          </Link>
        </div>
      )}
    </div>
  );
}