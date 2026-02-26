"use client";

import { useState } from "react";
import Link from "next/link";
import { AlertTriangle, CalendarCheck, CarFront, ChevronRight, MessageSquareWarning, Plus, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
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
        <div className="rounded-lg border border-[hsl(var(--border))] bg-card shadow-sm flex flex-col h-full">
            <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-b border-[hsl(var(--border))]">
                <h2 className="text-xl font-bold">Actions rapides</h2>
            </div>

            <div className="p-3 sm:p-4 grid grid-cols-1 gap-3 flex-1 content-start">

                {/* 1. Confirmer réservations */}
                <Link
                    href="/dashboard/owner/reservations"
                    className="group flex flex-col justify-center rounded-xl border border-[hsl(var(--border))] bg-muted/20 p-4 hover:border-emerald-400 hover:bg-emerald-50 transition-all duration-200"
                >
                    <div className="flex items-center justify-between pointer-events-none">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600">
                                <CalendarCheck className="h-5 w-5" />
                            </div>
                            <div>
                                <p className="font-semibold text-sm group-hover:text-emerald-700 transition-colors">
                                    Confirmer réservations
                                </p>
                                <p className="text-xs text-muted-foreground mt-0.5">
                                    Accepter les demandes payées
                                </p>
                            </div>
                        </div>
                        {pendingConfirmations > 0 && (
                            <Badge variant="destructive" className="shrink-0">{pendingConfirmations}</Badge>
                        )}
                        {pendingConfirmations === 0 && (
                            <ChevronRight className="h-4 w-4 text-muted-foreground opacity-50 group-hover:text-emerald-500 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                        )}
                    </div>
                </Link>

                {/* 2. Déclarer un litige */}
                <button
                    onClick={() => setDisputeOpen(true)}
                    className="group flex flex-col justify-center text-left rounded-xl border border-[hsl(var(--border))] bg-muted/20 p-4 hover:border-orange-400 hover:bg-orange-50 transition-all duration-200"
                >
                    <div className="flex items-center justify-between pointer-events-none">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-100 text-orange-600">
                                <MessageSquareWarning className="h-5 w-5" />
                            </div>
                            <div>
                                <p className="font-semibold text-sm group-hover:text-orange-700 transition-colors">
                                    Déclarer un litige
                                </p>
                                <p className="text-xs text-muted-foreground mt-0.5">
                                    Signaler un problème sur une location
                                </p>
                            </div>
                        </div>
                        <ChevronRight className="h-4 w-4 text-muted-foreground opacity-50 group-hover:text-orange-500 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                    </div>
                </button>

                {/* 3. Ajouter un véhicule */}
                <Link
                    href="/dashboard/owner/vehicles/new"
                    className="group flex flex-col justify-center rounded-xl border border-[hsl(var(--border))] bg-muted/20 p-4 hover:border-blue-400 hover:bg-blue-50 transition-all duration-200"
                >
                    <div className="flex items-center justify-between pointer-events-none">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
                                <Plus className="h-5 w-5" />
                            </div>
                            <div>
                                <p className="font-semibold text-sm group-hover:text-blue-700 transition-colors">
                                    Ajouter un véhicule
                                </p>
                                <p className="text-xs text-muted-foreground mt-0.5">
                                    Mettre un nouveau véhicule en ligne
                                </p>
                            </div>
                        </div>
                        <ChevronRight className="h-4 w-4 text-muted-foreground opacity-50 group-hover:text-blue-500 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                    </div>
                </Link>

                {/* 4. Retirer des fonds */}
                <Link
                    href="/dashboard/owner/wallet"
                    className="group flex flex-col justify-center rounded-xl border border-[hsl(var(--border))] bg-muted/20 p-4 hover:border-purple-400 hover:bg-purple-50 transition-all duration-200"
                >
                    <div className="flex items-center justify-between pointer-events-none">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100 text-purple-600">
                                <Wallet className="h-5 w-5" />
                            </div>
                            <div>
                                <p className="font-semibold text-sm group-hover:text-purple-700 transition-colors">
                                    Retirer des fonds
                                </p>
                                <p className="text-xs text-muted-foreground mt-0.5">
                                    Accéder au portefeuille
                                </p>
                            </div>
                        </div>
                        <ChevronRight className="h-4 w-4 text-muted-foreground opacity-50 group-hover:text-purple-500 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                    </div>
                </Link>
            </div>

            {/* ── Modal Déclarer un Litige ── */}
            <Dialog open={disputeOpen} onOpenChange={setDisputeOpen}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <AlertTriangle className="h-5 w-5 text-orange-500" />
                            Déclarer un litige
                        </DialogTitle>
                        <DialogDescription>
                            Signalez un incident lié à une location. Notre équipe interviendra pour résoudre la situation avec le locataire.
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleDisputeSubmit} className="space-y-4 py-4">
                        {/* Reservation */}
                        <div className="space-y-2">
                            <Label htmlFor="reservation">Réservation concernée <span className="text-destructive">*</span></Label>
                            {eligibleForDispute.length === 0 ? (
                                <div className="p-3 text-sm rounded border bg-muted/50 text-muted-foreground text-center">
                                    Aucune réservation éligible à un litige (En cours ou terminée récemment).
                                </div>
                            ) : (
                                <Select value={selectedResId} onValueChange={setSelectedResId} required>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Sélectionnez la réservation" />
                                    </SelectTrigger>
                                    <SelectContent>
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
                                <SelectTrigger>
                                    <SelectValue placeholder="Sélectionnez le type de litige" />
                                </SelectTrigger>
                                <SelectContent>
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
                                disabled={eligibleForDispute.length === 0}
                            />
                        </div>

                        <DialogFooter className="pt-4">
                            <Button type="button" variant="ghost" onClick={() => setDisputeOpen(false)}>
                                Annuler
                            </Button>
                            <Button
                                type="submit"
                                disabled={isSubmitting || eligibleForDispute.length === 0 || !selectedResId || !disputeReason}
                                className="bg-orange-600 hover:bg-orange-700 text-white"
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
