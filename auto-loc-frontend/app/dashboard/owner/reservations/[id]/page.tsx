import { cookies } from "next/headers";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { ApiError } from "@/lib/nestjs/api-client";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { fetchReservation } from "@/lib/nestjs/reservations";
import { OwnerHeader } from "@/features/dashboard/components/owner-header";
import { ReservationStatusBadge } from "@/features/reservations/components/reservation-status";
import { ReservationActions } from "@/features/reservations/components/reservation-actions";
import {
    ArrowLeft,
    Calendar,
    User,
    Car,
    FileText,
    Banknote,
    Clock,
    CheckCircle2,
    XCircle,
    LogIn,
    LogOut,
} from "lucide-react";

export default async function ReservationDetailPage({
    params,
}: {
    params: { id: string };
}) {
    const nestToken = cookies().get("nest_access")?.value ?? null;
    let token: string | null = nestToken;
    if (!token) {
        const supabase = createSupabaseServerClient();
        const { data } = await supabase.auth.getSession();
        token = data.session?.access_token ?? null;
    }
    if (!token) redirect("/login");

    let reservation;
    try {
        reservation = await fetchReservation(token, params.id);
    } catch (err) {
        if (err instanceof ApiError && err.status === 401) redirect("/login?expired=1");
        if (err instanceof ApiError && err.status === 404) notFound();
        throw err;
    }

    const r = reservation;
    const dateDebut = new Date(r.dateDebut).toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
    const dateFin = new Date(r.dateFin).toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
    const creeLe = new Date(r.creeLe).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" });

    // ── Timeline events ─────────────────────────────────────────────
    const timeline = [
        { label: "Créée", date: r.creeLe, icon: Clock, done: true },
        r.confirmeeLe && { label: "Confirmée", date: r.confirmeeLe, icon: CheckCircle2, done: true },
        r.checkInLe && { label: "Check-in", date: r.checkInLe, icon: LogIn, done: true },
        r.checkOutLe && { label: "Check-out", date: r.checkOutLe, icon: LogOut, done: true },
        r.annuleeLe && { label: "Annulée", date: r.annuleeLe, icon: XCircle, done: true },
    ].filter(Boolean) as { label: string; date: string; icon: React.ElementType; done: boolean }[];

    return (
        <div className="flex flex-col gap-6 p-6 max-w-4xl">
            {/* ── Back link ────────────────────────────────────────────────── */}
            <Link
                href="/dashboard/owner/reservations"
                className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors w-fit"
            >
                <ArrowLeft className="w-4 h-4" />
                Retour aux réservations
            </Link>

            {/* ── Header ───────────────────────────────────────────────────── */}
            <div className="flex items-start justify-between gap-4 flex-wrap">
                <div>
                    <h1 className="text-2xl font-bold">
                        {r.vehicule.marque} {r.vehicule.modele}
                    </h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        Réservation #{r.id.slice(0, 8)} · Créée le {creeLe}
                    </p>
                </div>
                <ReservationStatusBadge status={r.statut} size="md" />
            </div>

            {/* ── Actions ──────────────────────────────────────────────────── */}
            <ReservationActions reservationId={r.id} statut={r.statut} />

            {/* ── Info Cards Grid ──────────────────────────────────────────── */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                {/* Dates */}
                <InfoCard icon={Calendar} title="Dates">
                    <div className="space-y-1">
                        <p className="text-sm"><span className="text-muted-foreground">Début :</span> {dateDebut}</p>
                        <p className="text-sm"><span className="text-muted-foreground">Fin :</span> {dateFin}</p>
                        <p className="text-sm"><span className="text-muted-foreground">Durée :</span> {r.nbJours} jour{r.nbJours > 1 ? "s" : ""}</p>
                    </div>
                </InfoCard>

                {/* Locataire */}
                <InfoCard icon={User} title="Locataire">
                    <div className="space-y-1">
                        <p className="text-sm font-medium">{r.locataire.prenom} {r.locataire.nom}</p>
                        {r.locataire.telephone && (
                            <p className="text-sm text-muted-foreground">{r.locataire.telephone}</p>
                        )}
                        {r.locataire.noteLocataire !== undefined && (
                            <p className="text-sm text-muted-foreground">
                                Note : ⭐ {Number(r.locataire.noteLocataire).toFixed(1)}/5
                            </p>
                        )}
                    </div>
                </InfoCard>

                {/* Véhicule */}
                <InfoCard icon={Car} title="Véhicule">
                    <div className="space-y-1">
                        <p className="text-sm font-medium">{r.vehicule.marque} {r.vehicule.modele}</p>
                        {r.vehicule.immatriculation && (
                            <p className="text-sm text-muted-foreground">{r.vehicule.immatriculation}</p>
                        )}
                    </div>
                </InfoCard>

                {/* Financier */}
                <InfoCard icon={Banknote} title="Montants">
                    <div className="space-y-1">
                        <p className="text-sm">
                            <span className="text-muted-foreground">Total :</span>{" "}
                            <span className="font-semibold">{r.prixTotal} FCFA</span>
                        </p>
                        <p className="text-sm">
                            <span className="text-muted-foreground">Votre part :</span>{" "}
                            <span className="font-semibold text-emerald-600">{r.montantProprietaire} FCFA</span>
                        </p>
                        <p className="text-sm">
                            <span className="text-muted-foreground">Commission :</span> {r.commission} FCFA
                        </p>
                        <p className="text-sm">
                            <span className="text-muted-foreground">Prix/jour :</span> {r.prixParJour} FCFA
                        </p>
                    </div>
                </InfoCard>
            </div>

            {/* ── Contract ─────────────────────────────────────────────────── */}
            {r.contratUrl && (
                <div className="rounded-xl border border-[hsl(var(--border))] bg-card p-5">
                    <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-blue-50">
                            <FileText className="w-5 h-5 text-blue-600" />
                        </div>
                        <div className="flex-1">
                            <p className="text-sm font-medium">Contrat de location</p>
                            <p className="text-xs text-muted-foreground">PDF généré automatiquement</p>
                        </div>
                        <a
                            href={r.contratUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
                        >
                            Télécharger ↗
                        </a>
                    </div>
                </div>
            )}

            {/* ── Timeline ─────────────────────────────────────────────────── */}
            <div className="rounded-xl border border-[hsl(var(--border))] bg-card p-5">
                <h3 className="text-sm font-semibold mb-4">Chronologie</h3>
                <div className="space-y-0">
                    {timeline.map((event, i) => (
                        <div key={event.label} className="flex gap-3">
                            {/* Line + Dot */}
                            <div className="flex flex-col items-center">
                                <div className="flex items-center justify-center w-7 h-7 rounded-full bg-emerald-50 border-2 border-emerald-200">
                                    <event.icon className="w-3.5 h-3.5 text-emerald-600" />
                                </div>
                                {i < timeline.length - 1 && (
                                    <div className="w-0.5 h-8 bg-emerald-100" />
                                )}
                            </div>
                            {/* Content */}
                            <div className="pb-6">
                                <p className="text-sm font-medium">{event.label}</p>
                                <p className="text-xs text-muted-foreground">
                                    {new Date(event.date).toLocaleDateString("fr-FR", {
                                        day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit",
                                    })}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

// ── Info Card ────────────────────────────────────────────────────────────────

function InfoCard({
    icon: Icon,
    title,
    children,
}: {
    icon: React.ElementType;
    title: string;
    children: React.ReactNode;
}) {
    return (
        <div className="rounded-xl border border-[hsl(var(--border))] bg-card p-5">
            <div className="flex items-center gap-2 mb-3">
                <Icon className="w-4 h-4 text-muted-foreground" />
                <h3 className="text-sm font-semibold">{title}</h3>
            </div>
            {children}
        </div>
    );
}
