"use client";

import Link from "next/link";
import Image from "next/image";
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
        <div className="space-y-5 sm:space-y-6">
            {/* ── Wallet Snapshot ───────────────────────────────────────────── */}
            <WalletSnapshot data={snapshotData} hideCta />

            {/* ── Soldes par fournisseur ────────────────────────────────────── */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-sm min-h-[100px] sm:min-h-0">
                    <div className="flex items-center gap-3.5 mb-2">
                        <div className="w-12 h-12 sm:w-11 sm:h-11 rounded-xl bg-blue-50 flex items-center justify-center overflow-hidden relative ring-1 ring-blue-100 shadow-sm">
                            <Image
                                src="/wavelogo.jpeg"
                                alt="Wave"
                                width={48}
                                height={48}
                                className="object-contain"
                            />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-[11px] sm:text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400 mb-1">Solde Wave</p>
                            <p className="text-[20px] sm:text-[18px] font-black text-slate-900 tabular-nums tracking-tight">{data.balance.soldeWave} FCFA</p>
                        </div>
                    </div>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-sm min-h-[100px] sm:min-h-0">
                    <div className="flex items-center gap-3.5 mb-2">
                        <div className="w-12 h-12 sm:w-11 sm:h-11 rounded-xl bg-orange-50 flex items-center justify-center overflow-hidden relative ring-1 ring-orange-100 shadow-sm">
                            <Image
                                src="/orangeMoneylogo.jpg"
                                alt="Orange Money"
                                width={48}
                                height={48}
                                className="object-contain"
                            />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-[11px] sm:text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400 mb-1">Solde Orange Money</p>
                            <p className="text-[20px] sm:text-[18px] font-black text-slate-900 tabular-nums tracking-tight">{data.balance.soldeOrangeMoney} FCFA</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Withdrawal Form ───────────────────────────────────────────── */}
            <WithdrawalForm
                soldeDisponible={data.balance.soldeDisponible}
                soldeWave={data.balance.soldeWave}
                soldeOrangeMoney={data.balance.soldeOrangeMoney}
            />

            {/* ── Transactions ─────────────────────────────────────────────── */}
            <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
                <div className="flex items-center justify-between px-5 sm:px-6 py-4 sm:py-5 border-b border-slate-100">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-slate-900 flex items-center justify-center">
                            <Wallet className="w-4 h-4 text-emerald-400" strokeWidth={2} />
                        </div>
                        <h3 className="text-[15px] sm:text-[14px] font-black text-slate-900 tracking-tight">Transactions récentes</h3>
                    </div>
                    <span className="text-[11px] sm:text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">
                        {data.transactions.length} transaction{data.transactions.length !== 1 ? "s" : ""}
                    </span>
                </div>

                {data.transactions.length === 0 ? (
                    <div className="flex flex-col items-center gap-3 py-14 sm:py-12">
                        <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center shadow-sm">
                            <Wallet className="w-5 h-5 text-slate-300" strokeWidth={1.5} />
                        </div>
                        <div className="text-center">
                            <p className="text-[14px] sm:text-[13px] font-bold text-slate-500">Aucune transaction</p>
                            <p className="text-[12px] text-slate-400 mt-1">Vos revenus apparaîtront ici après vos premières locations.</p>
                        </div>
                    </div>
                ) : (
                    <div className="divide-y divide-slate-100">
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
        <div className="flex items-center gap-3.5 sm:gap-3 px-5 sm:px-6 py-4 sm:py-3.5 hover:bg-slate-50/60 transition-colors">
            {/* Icon */}
            <div className={cn(
                "flex items-center justify-center w-10 h-10 sm:w-9 sm:h-9 rounded-xl shrink-0 ring-1 shadow-sm",
                isCredit ? "bg-emerald-50 ring-emerald-100" : "bg-red-50 ring-red-100",
            )}>
                {isCredit ? (
                    <ArrowDownRight className="w-4.5 h-4.5 sm:w-4 sm:h-4 text-emerald-600" strokeWidth={2} />
                ) : (
                    <ArrowUpRight className="w-4.5 h-4.5 sm:w-4 sm:h-4 text-red-600" strokeWidth={2} />
                )}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
                <p className="text-[14px] sm:text-[13px] font-bold text-slate-900 truncate tracking-tight">{TX_LABELS[tx.type] ?? tx.type}</p>
                <p className="text-[12px] sm:text-[11px] text-slate-400 font-medium mt-0.5">{date}</p>
            </div>

            {/* Amount */}
            <div className="text-right shrink-0">
                <p className={cn("text-[15px] sm:text-[14px] font-black tabular-nums tracking-tight", isCredit ? "text-emerald-600" : "text-red-600")}>
                    {isCredit ? "+" : "-"}{tx.montant} FCFA
                </p>
                <p className="text-[11px] sm:text-[10px] text-slate-400 font-medium mt-0.5">Solde : {tx.soldeApres}</p>
            </div>
        </div>
    );

    return tx.reservationId ? (
        <Link href={`/dashboard/reservations/${tx.reservationId}`} className="block">
            {inner}
        </Link>
    ) : inner;
}
