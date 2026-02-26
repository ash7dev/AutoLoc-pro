"use client";

import { Banknote, ArrowUpRight, ArrowDownRight, Clock, TrendingUp, Wallet } from "lucide-react";
import { cn } from "@/lib/utils";
import type { WalletData, WalletTransaction } from "@/lib/nestjs/wallet";

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

    return (
        <div className="space-y-6">
            {/* ── Balance Cards ────────────────────────────────────────────── */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <BalanceCard
                    title="Disponible"
                    amount={data.balance.soldeDisponible}
                    icon={Banknote}
                    variant="primary"
                />
                <BalanceCard
                    title="En attente"
                    amount={data.balance.enAttente}
                    icon={Clock}
                    variant="warning"
                />
                <BalanceCard
                    title="Total gagné"
                    amount={data.balance.totalGagne}
                    icon={TrendingUp}
                    variant="success"
                />
            </div>

            {/* ── Transactions ─────────────────────────────────────────────── */}
            <div className="rounded-xl border border-[hsl(var(--border))] bg-card">
                <div className="flex items-center justify-between px-5 py-4 border-b border-[hsl(var(--border))]">
                    <h3 className="text-sm font-semibold">Transactions récentes</h3>
                    <span className="text-xs text-muted-foreground">
                        {data.transactions.length} transaction{data.transactions.length !== 1 ? "s" : ""}
                    </span>
                </div>

                {data.transactions.length === 0 ? (
                    <div className="p-8 text-center">
                        <p className="text-sm text-muted-foreground">Aucune transaction pour le moment</p>
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

// ── Balance Card ────────────────────────────────────────────────────────────────

function BalanceCard({
    title,
    amount,
    icon: Icon,
    variant,
}: {
    title: string;
    amount: string;
    icon: React.ElementType;
    variant: "primary" | "warning" | "success";
}) {
    const colors = {
        primary: "bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-200",
        warning: "bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200",
        success: "bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200",
    };
    const iconColors = {
        primary: "text-emerald-600 bg-emerald-100",
        warning: "text-amber-600 bg-amber-100",
        success: "text-blue-600 bg-blue-100",
    };

    return (
        <div className={cn("rounded-xl border p-5", colors[variant])}>
            <div className="flex items-center gap-3 mb-3">
                <div className={cn("flex items-center justify-center w-9 h-9 rounded-lg", iconColors[variant])}>
                    <Icon className="w-4 h-4" />
                </div>
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{title}</span>
            </div>
            <p className="text-2xl font-bold tracking-tight">{amount} <span className="text-sm font-normal text-muted-foreground">FCFA</span></p>
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

    return (
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
}
