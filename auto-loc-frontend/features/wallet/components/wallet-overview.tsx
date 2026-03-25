"use client";

import Link from "next/link";
import { ArrowUpRight, ArrowDownRight, Wallet } from "lucide-react";
import { cn } from "@/lib/utils";
import type { WalletData, WalletTransaction } from "@/lib/nestjs/wallet";
import { WalletSnapshot } from "@/features/dashboard/components/wallet-snapshot";
import { WithdrawalForm } from "./withdrawal-form";

// ── Component ──────────────────────────────────────────────────────────────────

interface WalletOverviewProps {
    data: WalletData | null;
}

export function WalletOverview({ data }: WalletOverviewProps) {
    if (!data) {
        return (
            <div className="rounded-xl border border-dashed border-[hsl(var(--border))] bg-card p-12 text-center">
                <Wallet className="w-10 h-10 mx-auto text-muted-foreground mb-3" />
                <p className="text-sm font-medium mb-1">Portefeuille non disponible</p>
                <p className="text-xs text-muted-foreground">
                    Votre portefeuille sera activé après votre première location.
                </p>
            </div>
        );
    }

    const snapshotData = {
        available: data.balance.soldeDisponible,
        pending: data.balance.enAttente,
        processing: "—",
    };

    return (
        <div className="space-y-6">
            {/* ── Wallet Snapshot ───────────────────────────────────────────── */}
            <WalletSnapshot data={snapshotData} hideCta />

            {/* ── Withdrawal Form ───────────────────────────────────────────── */}
            <WithdrawalForm soldeDisponible={data.balance.soldeDisponible} />

            {/* ── Transactions ─────────────────────────────────────────────── */}
            <div className="rounded-xl border border-[hsl(var(--border))] bg-card">
                <div className="flex items-center justify-between px-5 py-4 border-b border-[hsl(var(--border))]">
                    <h3 className="text-sm font-semibold">Transactions récentes</h3>
                    <span className="text-xs text-muted-foreground">
                        {data.transactions.length} transaction{data.transactions.length !== 1 ? "s" : ""}
                    </span>
                </div>

                {data.transactions.length === 0 ? (
                    <div className="flex flex-col items-center gap-3 py-12">
                        <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center">
                            <Wallet className="w-4.5 h-4.5 text-slate-300" strokeWidth={1.5} />
                        </div>
                        <div className="text-center">
                            <p className="text-[13px] font-semibold text-slate-500">Aucune transaction</p>
                            <p className="text-[12px] text-slate-400 mt-0.5">Vos revenus apparaîtront ici après vos premières locations.</p>
                        </div>
                    </div>
                ) : (
                    <div className="divide-y divide-[hsl(var(--border))]">
                        {data.transactions.map((tx) => (
                            <TransactionRow key={tx.id} transaction={tx} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

// ── Transaction Row ─────────────────────────────────────────────────────────────

const TX_LABELS: Record<string, string> = {
    CREDIT_LOCATION: "Revenu location",
    DEBIT_PENALITE: "Pénalité",
    DEBIT_RETRAIT: "Retrait",
};

function TransactionRow({ transaction: tx }: { transaction: WalletTransaction }) {
    const isCredit = tx.sens === "CREDIT";
    const date = new Date(tx.creeLe).toLocaleDateString("fr-FR", {
        day: "numeric",
        month: "short",
        year: "numeric",
    });

    const inner = (
        <div className="flex items-center gap-3 px-5 py-3.5 hover:bg-muted/30 transition-colors">
            {/* Icon */}
            <div className={cn(
                "flex items-center justify-center w-8 h-8 rounded-lg shrink-0",
                isCredit ? "bg-emerald-50" : "bg-red-50",
            )}>
                {isCredit ? (
                    <ArrowDownRight className="w-4 h-4 text-emerald-600" />
                ) : (
                    <ArrowUpRight className="w-4 h-4 text-red-600" />
                )}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{TX_LABELS[tx.type] ?? tx.type}</p>
                <p className="text-xs text-muted-foreground">{date}</p>
            </div>

            {/* Amount */}
            <div className="text-right shrink-0">
                <p className={cn("text-sm font-semibold", isCredit ? "text-emerald-600" : "text-red-600")}>
                    {isCredit ? "+" : "-"}{tx.montant} FCFA
                </p>
                <p className="text-xs text-muted-foreground">Solde : {tx.soldeApres}</p>
            </div>
        </div>
    );

    return tx.reservationId ? (
        <Link href={`/dashboard/reservations/${tx.reservationId}`} className="block">
            {inner}
        </Link>
    ) : inner;
}
