"use client";

import Link from "next/link";
import Image from "next/image";
import {
    ArrowRight, Truck, CalendarRange, User2, Clock,
    Banknote, Zap, Shield, AlertTriangle, CheckCircle2,
    XCircle, Timer, Car, Hourglass,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { Reservation } from "@/lib/nestjs/reservations";

/* ═══════════════════════════════════════════════════════════════
   STATUS VISUAL CONFIG
═══════════════════════════════════════════════════════════════ */
const STATUS_STYLES: Record<string, {
    label: string;
    icon: React.ElementType;
    accent: string;       // left border + icon bg gradient
    accentBorder: string;
    badgeBg: string;
    badgeText: string;
    badgeDot: string;
    pulse?: boolean;
    glow?: string;
}> = {
    PAYEE: {
        label: "À valider",
        icon: Zap,
        accent: "from-amber-500 to-orange-500",
        accentBorder: "border-l-amber-500",
        badgeBg: "bg-gradient-to-r from-amber-500 to-orange-500",
        badgeText: "text-white",
        badgeDot: "bg-white",
        pulse: true,
        glow: "shadow-amber-500/10",
    },
    CONFIRMEE: {
        label: "Confirmée",
        icon: CheckCircle2,
        accent: "from-emerald-500 to-teal-500",
        accentBorder: "border-l-emerald-500",
        badgeBg: "bg-emerald-50",
        badgeText: "text-emerald-700",
        badgeDot: "bg-emerald-500",
        glow: "shadow-emerald-500/5",
    },
    EN_COURS: {
        label: "En cours",
        icon: Timer,
        accent: "from-blue-500 to-indigo-500",
        accentBorder: "border-l-blue-500",
        badgeBg: "bg-blue-50",
        badgeText: "text-blue-700",
        badgeDot: "bg-blue-500",
        pulse: true,
        glow: "shadow-blue-500/5",
    },
    TERMINEE: {
        label: "Terminée",
        icon: CheckCircle2,
        accent: "from-slate-300 to-slate-400",
        accentBorder: "border-l-slate-300",
        badgeBg: "bg-slate-100",
        badgeText: "text-slate-500",
        badgeDot: "bg-slate-400",
    },
    ANNULEE: {
        label: "Annulée",
        icon: XCircle,
        accent: "from-red-400 to-rose-500",
        accentBorder: "border-l-red-400",
        badgeBg: "bg-red-50",
        badgeText: "text-red-600",
        badgeDot: "bg-red-400",
    },
    LITIGE: {
        label: "Litige",
        icon: AlertTriangle,
        accent: "from-orange-400 to-amber-500",
        accentBorder: "border-l-orange-400",
        badgeBg: "bg-orange-50",
        badgeText: "text-orange-700",
        badgeDot: "bg-orange-400",
        pulse: true,
        glow: "shadow-orange-500/5",
    },
    INITIEE: {
        label: "Initiée",
        icon: Hourglass,
        accent: "from-sky-300 to-blue-400",
        accentBorder: "border-l-sky-300",
        badgeBg: "bg-sky-50",
        badgeText: "text-sky-700",
        badgeDot: "bg-sky-400",
    },
    EN_ATTENTE_PAIEMENT: {
        label: "Attente paiement",
        icon: Hourglass,
        accent: "from-blue-300 to-blue-400",
        accentBorder: "border-l-blue-300",
        badgeBg: "bg-blue-50",
        badgeText: "text-blue-700",
        badgeDot: "bg-blue-300",
        pulse: true,
    },
    EXPIREE: {
        label: "Expirée",
        icon: XCircle,
        accent: "from-slate-300 to-slate-400",
        accentBorder: "border-l-slate-200",
        badgeBg: "bg-slate-100",
        badgeText: "text-slate-400",
        badgeDot: "bg-slate-300",
    },
};

const DEFAULT_STATUS = {
    label: "—",
    icon: Clock,
    accent: "from-slate-300 to-slate-400",
    accentBorder: "border-l-slate-300",
    badgeBg: "bg-slate-100",
    badgeText: "text-slate-500",
    badgeDot: "bg-slate-400",
};

/* ═══════════════════════════════════════════════════════════════
   CARD COMPONENT
═══════════════════════════════════════════════════════════════ */
export function OwnerReservationCard({
    reservation: r,
    className,
}: {
    reservation: Reservation;
    className?: string;
}) {
    const revenue = Number(r.montantProprietaire) || 0;
    const st = STATUS_STYLES[r.statut] ?? DEFAULT_STATUS;
    const StatusIcon = st.icon;
    const isUrgent = r.statut === "PAYEE";
    const isDimmed = r.statut === "ANNULEE" || r.statut === "TERMINEE";
    const hasDelivery = !!r.adresseLivraison;

    const parseDate = (dStr: string) => {
        const d = new Date(dStr);
        return isNaN(d.getTime()) ? "—" : d.toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
    };
    const dateDebut = parseDate(r.dateDebut);
    const dateFin = parseDate(r.dateFin);

    const initials = r.locataire 
        ? `${r.locataire.prenom?.[0] ?? ""}${r.locataire.nom?.[0] ?? ""}`.toUpperCase() 
        : "—";

    /* Vehicle photo */
    const photos = r.vehicule 
        ? ((r.vehicule as any).photos ?? []) 
        : [];
    const photoUrl = photos.find((p: any) => p.estPrincipale)?.url ?? photos[0]?.url ?? null;
    const detailHref = `/dashboard/owner/reservations/${r.id}`;

    return (
        <Link
            href={detailHref}
            prefetch={false}
            className={cn(
                "group relative flex flex-col rounded-2xl overflow-hidden cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2",
                "border border-white/60 border-l-[3px]",
                st.accentBorder,
                /* Glass */
                "bg-white/70 backdrop-blur-xl",
                "shadow-sm",
                st.glow,
                /* Hover */
                "hover:shadow-xl hover:shadow-slate-200/50 hover:-translate-y-[3px] hover:border-white/80",
                "transition-all duration-300 ease-out",
                isDimmed && "opacity-70 hover:opacity-100",
                className,
            )}
        >
            {/* ── Urgent ribbon ─────────────────────────── */}
            {isUrgent && (
                <div className="absolute top-0 right-0 z-10">
                    <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[9px] font-black uppercase tracking-[0.12em] px-3 py-1 rounded-bl-xl shadow-lg shadow-amber-500/20">
                        Action requise
                    </div>
                </div>
            )}

            {/* ── Vehicle photo strip (top) ────────────── */}
            {photoUrl && (
                <div className="relative w-full h-28 overflow-hidden bg-slate-100">
                    <Image
                        src={photoUrl}
                        alt={r.vehicule ? `${r.vehicule.marque} ${r.vehicule.modele}` : "Véhicule"}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 33vw"
                        className={cn(
                            "object-cover transition-transform duration-500 group-hover:scale-105",
                            isDimmed && "grayscale-[40%]",
                        )}
                    />
                    {/* Overlay gradient */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />

                    {/* Vehicle name on photo */}
                    <div className="absolute bottom-2.5 left-3.5 right-3.5 flex items-end justify-between gap-2">
                        <div>
                            <p className="text-[15px] font-black text-white leading-tight drop-shadow-md">
                                {r.vehicule ? r.vehicule.marque : "Véhicule"}{" "}
                                <span className="text-emerald-300">{r.vehicule ? r.vehicule.modele : "inconnu"}</span>
                            </p>
                            {r.vehicule?.immatriculation && (
                                <p className="text-[9.5px] font-mono text-white/50 mt-0.5 tracking-wider">
                                    {r.vehicule.immatriculation}
                                </p>
                            )}
                        </div>
                        {/* Duration pill on photo */}
                        <span className="flex-shrink-0 text-[10px] font-black text-white/90 tabular-nums bg-black/30 backdrop-blur-md px-2 py-0.5 rounded-full border border-white/10">
                            {r.nbJours}j
                        </span>
                    </div>
                </div>
            )}

            {/* ── No photo fallback header ──────────────── */}
            {!photoUrl && (
                <div className="px-4 pt-4 pb-2">
                    <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0 flex-1">
                            <p className="text-[14.5px] font-black text-slate-900 truncate leading-tight tracking-[-0.01em]">
                                {r.vehicule ? r.vehicule.marque : "Véhicule"}{" "}
                                <span className="text-emerald-500">{r.vehicule ? r.vehicule.modele : "inconnu"}</span>
                            </p>
                            {r.vehicule?.immatriculation && (
                                <p className="text-[10px] font-mono text-slate-400 mt-0.5 tracking-wider">
                                    {r.vehicule.immatriculation}
                                </p>
                            )}
                        </div>
                        <span className="flex-shrink-0 text-[10px] font-black text-slate-500 tabular-nums bg-slate-50 border border-slate-100 px-2 py-0.5 rounded-full">
                            {r.nbJours}j
                        </span>
                    </div>
                </div>
            )}

            {/* ── Body ──────────────────────────────────── */}
            <div className="px-4 py-3 flex-1 space-y-2.5">
                {/* Status badge */}
                <div className="flex items-center justify-between gap-2">
                    <span className={cn(
                        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10.5px] font-bold border border-transparent",
                        st.badgeBg, st.badgeText,
                    )}>
                        <span className={cn(
                            "w-1.5 h-1.5 rounded-full flex-shrink-0",
                            st.badgeDot,
                            st.pulse && "animate-pulse",
                        )} />
                        {st.label}
                    </span>

                    {/* Dates */}
                    <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-400">
                        <CalendarRange className="w-3 h-3 flex-shrink-0" strokeWidth={2} />
                        {dateDebut}
                        <span className="text-slate-300">→</span>
                        {dateFin}
                    </span>
                </div>

                {/* Tenant row */}
                <div className="flex items-center gap-2.5 px-2.5 py-2 rounded-xl bg-slate-50/80 border border-slate-100/80">
                    <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-emerald-100 to-emerald-200 border border-emerald-200/50 flex items-center justify-center flex-shrink-0 shadow-sm">
                        <span className="text-[9px] font-black text-emerald-700 leading-none">{initials}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-[12px] font-bold text-slate-700 truncate leading-tight">
                            {r.locataire ? `${r.locataire.prenom} ${r.locataire.nom}` : "Locataire inconnu"}
                        </p>
                    </div>
                </div>

                {/* Delivery */}
                {hasDelivery && (
                    <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-emerald-50/60 border border-emerald-100/60">
                        <Truck className="w-3 h-3 text-emerald-500 flex-shrink-0" strokeWidth={2} />
                        <span className="text-[10.5px] text-emerald-600 font-medium truncate">{r.adresseLivraison}</span>
                    </div>
                )}
            </div>

            {/* ── Footer — Revenue ──────────────────────── */}
            <div className="flex items-center justify-between gap-3 px-4 py-3 border-t border-slate-100/80 bg-gradient-to-r from-slate-50/50 to-transparent mt-auto">
                <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center flex-shrink-0">
                        <Banknote className="w-3.5 h-3.5 text-emerald-600" strokeWidth={1.75} />
                    </div>
                    <div>
                        <p className="text-[8.5px] font-bold uppercase tracking-[0.12em] text-slate-400">
                            Revenu net
                        </p>
                        <p className={cn(
                            "text-[17px] font-black tabular-nums leading-none mt-0.5",
                            isDimmed ? "text-slate-400" : "text-emerald-600",
                        )}>
                            {revenue.toLocaleString("fr-FR")}
                            <span className="text-[9px] font-semibold text-emerald-400/60 ml-0.5">FCFA</span>
                        </p>
                    </div>
                </div>

                <div className={cn(
                    "w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-300",
                    "bg-white border border-slate-200",
                    "group-hover:bg-gradient-to-br group-hover:from-emerald-500 group-hover:to-teal-500 group-hover:border-emerald-500 group-hover:shadow-lg group-hover:shadow-emerald-500/20",
                )}>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-white group-hover:translate-x-0.5 transition-all duration-300" strokeWidth={2.5} />
                </div>
            </div>
        </Link>
    );
}
