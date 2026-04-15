"use client";

import { useState } from "react";
import Link from "next/link";
import { AlertTriangle, CalendarCheck, CarFront, ChevronRight, MessageSquareWarning, Plus, Wallet, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import type { Reservation } from "@/lib/nestjs/reservations";

// ── Types & Constants ─────────────────────────────────────────────

const DISPUTE_REASONS = [
    { value: "damage", label: "Dommage / Casse véhicule" },
    { value: "cleaning", label: "État de propreté inacceptable" },
    { value: "fuel", label: "Niveau de carburant manquant" },
    { value: "mileage", label: "Dépassement kilométrique non réglé" },
    { value: "late", label: "Retard de restitution" },
    { value: "other", label: "Autre motif" },
];

interface QuickActionsProps {
    reservations: Reservation[];
}

// ── Action Item ────────────────────────────────────────────────────

function ActionItem({
    href,
    onClick,
    icon: Icon,
    iconBg,
    iconColor,
    label,
    description,
    hoverAccent,
    badge,
    children,
}: {
    href?: string;
    onClick?: () => void;
    icon: React.ElementType;
    iconBg: string;
    iconColor: string;
    label: string;
    description: string;
    hoverAccent: string;
    badge?: React.ReactNode;
    children?: React.ReactNode;
}) {
    const content = (
        <div className={cn(
            "group flex items-center gap-3.5 rounded-xl p-3.5 transition-all duration-200 cursor-pointer",
            "bg-white/60 backdrop-blur-sm border border-slate-100/80",
            "hover:shadow-md hover:-translate-y-[1px]",
            hoverAccent,
        )}>
            <div className={cn(
                "flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center shadow-sm border",
                iconBg,
            )}>
                <Icon className={cn("w-4.5 h-4.5", iconColor)} strokeWidth={1.75} />
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-[13px] font-bold text-slate-800 group-hover:text-slate-900 transition-colors">
                    {label}
                </p>
                <p className="text-[11px] font-medium text-slate-500 mt-0.5">
                    {description}
                </p>
            </div>
            {badge}
            {!badge && (
                <ChevronRight className="h-4 w-4 text-slate-300 opacity-50 group-hover:opacity-100 group-hover:translate-x-1 transition-all" strokeWidth={2} />
            )}
        </div>
    );

    if (href) return <Link href={href} className="block">{content}</Link>;
    if (onClick) return <button type="button" onClick={onClick} className="block w-full text-left">{content}</button>;
    return content;
}

// ── Component ───────────────────────────────────────────────────

export function OwnerQuickActions({ reservations }: QuickActionsProps) {
    const [disputeOpen, setDisputeOpen] = useState(false);
    const [selectedResId, setSelectedResId] = useState("");
    const [disputeReason, setDisputeReason] = useState("");
    const [disputeDetails, setDisputeDetails] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Filter reservations eligible for disputes (in progress, finished, etc.)
    const eligibleForDispute = reservations.filter((r) =>
        ["EN_COURS", "TERMINEE", "CONFIRMEE"].includes(r.statut)
    );

    // How many reservations waiting for confirmation?
    const pendingConfirmations = reservations.filter((r) => r.statut === "PAYEE").length;

    const handleDisputeSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedResId || !disputeReason) {
            toast.error("Veuillez sélectionner une réservation et un motif.");
            return;
        }

        setIsSubmitting(true);
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 800));
        setIsSubmitting(false);
        setDisputeOpen(false);

        toast.success("Litige déclaré avec succès.", {
            description: "Notre équipe vous contactera dans les plus brefs délais.",
        });

        // Reset form
        setSelectedResId("");
        setDisputeReason("");
        setDisputeDetails("");
    };

    return (
        <div className={cn(
            "relative overflow-hidden rounded-2xl flex flex-col h-full",
            "border border-l-[3px] border-white/70 border-l-slate-800",
            "bg-white/70 backdrop-blur-xl",
            "shadow-sm",
        )}>
            {/* Decorative orb */}
            <div className="absolute -top-8 -right-8 w-24 h-24 rounded-full bg-gradient-to-br from-slate-400 to-slate-600 opacity-[0.04] pointer-events-none blur-3xl" />

            <div className="relative z-10 flex items-center justify-between px-5 py-4 border-b border-slate-100/80">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-slate-100 to-slate-200 border border-slate-200 flex items-center justify-center shadow-sm">
                        <Zap className="w-4 h-4 text-slate-700" strokeWidth={1.75} />
                    </div>
                    <h2 className="text-[15px] font-black tracking-tight text-slate-800">Actions rapides</h2>
                </div>
            </div>

            <div className="relative z-10 p-3 sm:p-4 grid grid-cols-1 gap-2.5 flex-1 content-start">

                {/* 1. Confirmer réservations */}
                <ActionItem
                    href="/dashboard/owner/reservations"
                    icon={CalendarCheck}
                    iconBg="bg-gradient-to-br from-emerald-100 to-teal-100 border-emerald-200"
                    iconColor="text-emerald-600"
                    label="Confirmer réservations"
                    description="Accepter les demandes payées"
                    hoverAccent="hover:border-emerald-200 hover:bg-emerald-50/50"
                    badge={pendingConfirmations > 0 ? (
                        <span className="shrink-0 inline-flex items-center justify-center min-w-[22px] h-[22px] px-1.5 rounded-lg bg-gradient-to-br from-red-500 to-rose-500 text-[10px] font-black text-white shadow-md shadow-red-500/20">
                            {pendingConfirmations}
                        </span>
                    ) : undefined}
                />

                {/* 2. Déclarer un litige */}
                <ActionItem
                    onClick={() => setDisputeOpen(true)}
                    icon={MessageSquareWarning}
                    iconBg="bg-gradient-to-br from-red-100 to-rose-100 border-red-200"
                    iconColor="text-red-600"
                    label="Déclarer un litige"
                    description="Signaler un problème sur une location"
                    hoverAccent="hover:border-red-200 hover:bg-red-50/50"
                />

                {/* 3. Ajouter un véhicule */}
                <ActionItem
                    href="/dashboard/owner/vehicles/new"
                    icon={Plus}
                    iconBg="bg-slate-900 border-slate-900"
                    iconColor="text-white"
                    label="Ajouter un véhicule"
                    description="Mettre un nouveau véhicule en ligne"
                    hoverAccent="hover:border-slate-300 hover:bg-slate-50/50"
                />

                {/* 4. Retirer des fonds */}
                <ActionItem
                    href="/dashboard/owner/wallet"
                    icon={Wallet}
                    iconBg="bg-gradient-to-br from-amber-100 to-orange-100 border-amber-200"
                    iconColor="text-amber-700"
                    label="Retirer des fonds"
                    description="Accéder au portefeuille"
                    hoverAccent="hover:border-amber-200 hover:bg-amber-50/50"
                />
            </div>

            {/* ── Modal Déclarer un Litige ── */}
            <Dialog open={disputeOpen} onOpenChange={setDisputeOpen}>
                <DialogContent className="max-w-md rounded-2xl border border-slate-100 shadow-2xl">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-[16px] font-black">
                            <AlertTriangle className="h-5 w-5 text-orange-500" />
                            Déclarer un litige
                        </DialogTitle>
                        <DialogDescription className="text-[13px] text-slate-500">
                            Signalez un incident lié à une location. Notre équipe interviendra pour résoudre la situation avec le locataire.
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleDisputeSubmit} className="space-y-4 py-4">
                        {/* Reservation */}
                        <div className="space-y-2">
                            <Label htmlFor="reservation">Réservation concernée <span className="text-destructive">*</span></Label>
                            {eligibleForDispute.length === 0 ? (
                                <div className="p-3 text-sm rounded-xl border bg-slate-50 text-slate-500 text-center">
                                    Aucune réservation éligible à un litige (En cours ou terminée récemment).
                                </div>
                            ) : (
                                <Select value={selectedResId} onValueChange={setSelectedResId} required>
                                    <SelectTrigger className="rounded-xl">
                                        <SelectValue placeholder="Sélectionnez la réservation" />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-xl">
                                        {eligibleForDispute.map((r) => (
                                            <SelectItem key={r.id} value={r.id}>
                                                {r.vehicule.marque} {r.vehicule.modele} — Loc : {r.locataire.prenom} {r.locataire.nom}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            )}
                        </div>

                        {/* Motif */}
                        <div className="space-y-2">
                            <Label htmlFor="reason">Motif du litige <span className="text-destructive">*</span></Label>
                            <Select value={disputeReason} onValueChange={setDisputeReason} required disabled={eligibleForDispute.length === 0}>
                                <SelectTrigger className="rounded-xl">
                                    <SelectValue placeholder="Sélectionnez le type de litige" />
                                </SelectTrigger>
                                <SelectContent className="rounded-xl">
                                    {DISPUTE_REASONS.map((reason) => (
                                        <SelectItem key={reason.value} value={reason.value}>
                                            {reason.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Details */}
                        <div className="space-y-2">
                            <Label htmlFor="details">Détails <span className="text-muted-foreground font-normal">(optionnel)</span></Label>
                            <Textarea
                                id="details"
                                placeholder="Précisez la nature des dégâts, le retard exact, etc."
                                value={disputeDetails}
                                onChange={(e) => setDisputeDetails(e.target.value)}
                                rows={3}
                                className="rounded-xl"
                                disabled={eligibleForDispute.length === 0}
                            />
                        </div>

                        <DialogFooter className="pt-4">
                            <Button type="button" variant="ghost" onClick={() => setDisputeOpen(false)} className="rounded-xl">
                                Annuler
                            </Button>
                            <Button
                                type="submit"
                                disabled={isSubmitting || eligibleForDispute.length === 0 || !selectedResId || !disputeReason}
                                className="rounded-xl bg-orange-600 hover:bg-orange-700 text-white shadow-lg shadow-orange-600/20"
                            >
                                {isSubmitting ? "Envoi..." : "Déclarer"}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}
