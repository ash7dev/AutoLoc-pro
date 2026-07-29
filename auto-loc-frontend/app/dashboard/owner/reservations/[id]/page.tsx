import { cookies } from "next/headers";
import { redirect, notFound } from "next/navigation";
import { unstable_cache } from "next/cache";
import Link from "next/link";
import Image from "next/image";
import { ApiError } from "@/lib/nestjs/api-client";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { fetchReservation } from "@/lib/nestjs/reservations";
import { ReservationActions } from "@/features/reservations/components/reservation-actions";
import { TenantDocsViewer } from "@/features/reservations/components/tenant-docs-viewer";
import { PhotosEtatLieu } from "@/features/reservations/components/photos-etat-lieu";
import { PhoneDisplay } from "@/features/reservations/components/phone-display";
import { TenantReviewForm } from "@/features/reviews/components/tenant-review-form";
import { ExistingReviewDisplay } from "@/features/reviews/components/existing-review-display";
import { CACHE_DURATIONS, CACHE_TAGS, getCacheKey, getOwnerCacheTags } from "@/lib/cache-config";
import {
    ArrowLeft, Car, FileText, Banknote, Clock, CheckCircle2,
    XCircle, LogIn, LogOut, Hash, AlertTriangle, ShieldCheck,
    ShieldAlert, ShieldX, Lock, Star, MapPin, TrendingUp,
    Receipt, Percent, CalendarDays, ArrowRight, User, CreditCard,
    BadgeCheck, Wallet, Info, Truck,
} from "lucide-react";
import { ContratActions } from "../../../reservations/[id]/contrat-actions";
import { cn } from "@/lib/utils";

/* ════════════════════════════════════════════════════════════════
   HELPERS
════════════════════════════════════════════════════════════════ */
function fmtDate(d: string | Date, opts?: Intl.DateTimeFormatOptions) {
    return new Date(d).toLocaleDateString("fr-FR", opts ?? {
        weekday: "long", day: "numeric", month: "long", year: "numeric",
    });
}
function fmtShort(d: string | Date) {
    return new Date(d).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" });
}
function fmtDateTime(d: string | Date) {
    return new Date(d).toLocaleDateString("fr-FR", {
        day: "numeric", month: "long", year: "numeric",
        hour: "2-digit", minute: "2-digit",
    });
}
function fmtMoney(n: number | string) {
    return Number(n).toLocaleString("fr-FR");
}
function safeText(value: unknown, fallback = "—") {
    return typeof value === "string" && value.trim() ? value.trim() : fallback;
}
function safeDateValue(value: unknown): string | Date | null {
    if (typeof value === "string" || value instanceof Date) {
        const date = new Date(value);
        if (!isNaN(date.getTime())) return value;
    }
    return null;
}

// Helper pour vérifier si on peut imprimer (moins de 24h avant le début ou déjà commencé)
function canPrintContract(dateDebut: string | Date): boolean {
    const debut = new Date(dateDebut);
    const now = new Date();
    const diffMs = debut.getTime() - now.getTime();
    const diffHours = diffMs / (1000 * 60 * 60);
    return diffHours <= 24;
}

// Helper pour vérifier si la date de fin est dépassée
function isReservationExpired(dateFin: string | Date): boolean {
    return new Date() > new Date(dateFin);
}

/* ── Status config ────────────────────────────────────────────── */
const STATUS: Record<string, { label: string; text: string; bg: string; border: string; dot: string; pulse?: boolean }> = {
    INITIEE:              { label: "Initiée",            text: "text-slate-500",   bg: "bg-slate-50",   border: "border-slate-200", dot: "bg-slate-400" },
    EN_ATTENTE_PAIEMENT:  { label: "En attente paiement", text: "text-amber-700",  bg: "bg-amber-50",   border: "border-amber-200", dot: "bg-amber-400" },
    PAYEE:                { label: "À confirmer",         text: "text-blue-700",   bg: "bg-blue-50",    border: "border-blue-200",  dot: "bg-blue-500" },
    CONFIRMEE:            { label: "Confirmée",           text: "text-emerald-700",bg: "bg-emerald-50", border: "border-emerald-200",dot: "bg-emerald-500" },
    EN_COURS:             { label: "En cours",            text: "text-emerald-700",bg: "bg-emerald-50", border: "border-emerald-200",dot: "bg-emerald-500", pulse: true },
    TERMINEE:             { label: "Terminée",            text: "text-slate-500",  bg: "bg-slate-50",   border: "border-slate-200", dot: "bg-slate-400" },
    ANNULEE:              { label: "Annulée",             text: "text-red-700",    bg: "bg-red-50",     border: "border-red-200",   dot: "bg-red-500" },
    LITIGE:               { label: "Litige ouvert",       text: "text-orange-700", bg: "bg-orange-50",  border: "border-orange-200",dot: "bg-orange-500" },
};

/* ════════════════════════════════════════════════════════════════
   CACHED FETCH
════════════════════════════════════════════════════════════════ */
function getCachedReservation(token: string, id: string) {
    return unstable_cache(
        () => fetchReservation(token, id),
        getCacheKey("owner-reservation-detail", token, id),
        {
            revalidate: CACHE_DURATIONS.critical,
            tags: [
                `reservation-${id}`,
                ...getOwnerCacheTags(CACHE_TAGS.owner_reservations, token),
            ],
        },
    )();
}

/* ════════════════════════════════════════════════════════════════
   PAGE
════════════════════════════════════════════════════════════════ */
export default async function ReservationDetailPage({ params }: { params: { id: string } }) {
    /* ── Auth ── */
    const nestToken = cookies().get("nest_access")?.value ?? null;
    let token: string | null = nestToken;
    if (!token) {
        const supabase = createSupabaseServerClient();
        const { data } = await supabase.auth.getSession();
        token = data.session?.access_token ?? null;
    }
    if (!token) redirect("/login");

    /* ── Fetch ── */
    let reservation;
    try {
        reservation = await getCachedReservation(token, params.id);
    } catch (err) {
        console.error("[ReservationDetailPage] API error:", err);
        if (err instanceof ApiError && err.status === 401) redirect("/login?expired=1");
        if (err instanceof ApiError && (err.status === 404 || err.status === 403)) notFound();
        notFound();
    }

    const r = reservation;

    /* ── Computed ── */
    const dateDebut = safeDateValue(r.dateDebut);
    const dateFin = safeDateValue(r.dateFin);
    const locataire = r.locataire ?? {};
    const vehicule = r.vehicule ?? {};
    const locatairePrenom = safeText(locataire.prenom, "Locataire");
    const locataireNom = safeText(locataire.nom, "");
    const fullName = `${locatairePrenom} ${locataireNom}`.trim();
    const initials = `${locatairePrenom[0] ?? "L"}${locataireNom[0] ?? ""}`.toUpperCase();
    const vehicleMarque = safeText(vehicule.marque, "Véhicule");
    const vehicleModele = safeText(vehicule.modele, "inconnu");
    const vehicleName = `${vehicleMarque} ${vehicleModele}`;

    const nbJours = r.nbJours != null
        ? r.nbJours
        : dateDebut && dateFin
            ? Math.max(1, Math.round((new Date(dateFin).getTime() - new Date(dateDebut).getTime()) / 86_400_000))
            : 1;

    const totalLocataire  = Number(r.prixTotal) || 0;
    const commissionAmt   = Number(r.commission) || 0;
    const netAmt          = Number(r.montantProprietaire) || 0;
    const isAcompte       = r.modePaiement === 'ACOMPTE_SOLDE_CHECKIN';
    const montantPayeEnLigne = isAcompte
        ? (Number(r.montantPayeEnLigne) || Math.round(totalLocataire * 0.3))
        : totalLocataire;
    const montantSoldeCheckin = isAcompte
        ? (Number(r.montantSoldeCheckin) || Math.round(totalLocataire * 0.7))
        : 0;
    const versementWallet = isAcompte
        ? Math.max(0, montantPayeEnLigne - commissionAmt)
        : netAmt;
    // Taux contractuel fixe selon la politique tarifaire AutoLoc
    const COMMISSION_RATE = 15;
    const NET_RATE        = 100 - COMMISSION_RATE; // 85
    const commPct = COMMISSION_RATE;
    const netPct  = NET_RATE;

    /* ── Vehicle photo ── */
    const photos = Array.isArray((vehicule as { photos?: unknown }).photos)
        ? (vehicule as { photos: { url?: string; estPrincipale?: boolean }[] }).photos
        : [];
    const photoUrl = photos[0]?.url ?? null;

    /* ── Payment provider ── */
    const paiement = r.paiement as { statut?: string; fournisseur?: string } | undefined;
    const providerLogo = paiement?.fournisseur === "WAVE" ? "/wavelogo.jpeg"
        : paiement?.fournisseur === "ORANGE_MONEY" ? "/orangeMoneylogo.jpg"
        : null;
    const providerLabel = paiement?.fournisseur === "WAVE" ? "Wave"
        : paiement?.fournisseur === "ORANGE_MONEY" ? "Orange Money"
        : paiement?.fournisseur === "INTOUCH" ? "InTouch"
        : paiement?.fournisseur ?? "—";

    /* ── Timeline ── */
    const timeline = [
        { label: "Réservation créée",  date: r.creeLe,                                     icon: Clock,         color: "emerald" },
        r.confirmeeLe && { label: "Confirmée",           date: r.confirmeeLe,              icon: CheckCircle2,  color: "emerald" },
        r.checkInLe && { label: "Check-in effectué", date: r.checkInLe, icon: LogIn, color: "emerald" },
        r.checkOutLe && { label: "Check-out effectué", date: r.checkOutLe, icon: LogOut, color: "emerald" },
        r.annuleeLe && { label: "Annulée", date: r.annuleeLe, icon: XCircle, color: "red" },
    ].filter(Boolean) as { label: string; date: string; icon: React.ElementType; color: string }[];

    const st = STATUS[r.statut] ?? STATUS.INITIEE;

    return (
        <div className="min-h-screen bg-slate-50/60 pb-24 lg:pb-0">
            <div className="max-w-5xl mx-auto px-4 py-6 lg:px-8 lg:py-10 space-y-5">

                {/* ── Back ─────────────────────────────────────── */}
                <Link
                    href="/dashboard/owner/reservations"
                    className="inline-flex items-center gap-1.5 text-[12.5px] font-semibold text-slate-400 hover:text-slate-800 transition-colors group"
                >
                    <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" strokeWidth={2.5} />
                    Retour aux réservations
                </Link>

                {/* ══════════════════════════════════════════════════
                    HERO — dark premium (matches owner-header)
                ══════════════════════════════════════════════════ */}
                <div className="relative overflow-hidden rounded-2xl bg-black border border-white/[0.06] shadow-xl">
                    {/* Ambient glows */}
                    <div className="pointer-events-none absolute inset-0">
                        <div className="absolute -top-20 -left-10 h-64 w-64 rounded-full bg-emerald-500/10 blur-3xl" />
                        <div className="absolute -top-10 right-20 h-48 w-48 rounded-full bg-blue-500/8 blur-3xl" />
                        <div className="absolute bottom-0 right-0 h-32 w-96 rounded-full bg-emerald-400/5 blur-2xl" />
                    </div>
                    {/* Subtle grid */}
                    <div className="pointer-events-none absolute inset-0 opacity-[0.015]"
                        style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.5) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.5) 1px,transparent 1px)", backgroundSize: "40px 40px" }}
                    />

                    {/* Vehicle photo strip (right side, faded) */}
                    {photoUrl && (
                        <div className="pointer-events-none absolute inset-y-0 right-0 w-1/3 md:w-2/5 hidden sm:block">
                            <Image
                                src={photoUrl}
                                alt={vehicleName}
                                fill
                                className="object-cover opacity-10"
                                sizes="40vw"
                            />
                            <div className="absolute inset-0 bg-gradient-to-r from-black via-black/60 to-transparent" />
                        </div>
                    )}

                    <div className="relative p-6 lg:p-8">
                        {/* Top row: badges */}
                        <div className="flex items-center gap-2 flex-wrap mb-4">
                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-[11px] font-bold ${st.bg} ${st.border} ${st.text}`}>
                                <span className={`w-1.5 h-1.5 rounded-full ${st.dot} ${st.pulse ? "animate-pulse" : ""}`} />
                                {st.label}
                            </span>
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-[10.5px] font-mono text-white/30">
                                <Hash className="w-3 h-3" strokeWidth={2} />
                                {r.id.slice(0, 8).toUpperCase()}
                            </span>
                        </div>

                        {/* Title + net revenue */}
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-5">
                            <div>
                                <h1 className="text-2xl lg:text-[2rem] font-black text-white tracking-tight leading-tight">
                                    {vehicleMarque}{" "}
                                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-emerald-300">
                                        {vehicleModele}
                                    </span>
                                </h1>
                                <p className="text-[12px] text-white/25 mt-1.5 flex items-center gap-1.5">
                                    <Clock className="w-3 h-3" strokeWidth={2} />
                                    Créée le {fmtDate(r.creeLe, { day: "numeric", month: "long", year: "numeric" })}
                                </p>
                            </div>

                            {/* Net revenue pill */}
                            <div className="flex-shrink-0 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 px-5 py-4">
                                <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-emerald-400/60">Votre revenu net total</p>
                                <p className="text-[2rem] font-black text-emerald-400 tabular-nums leading-none mt-1">
                                    {fmtMoney(netAmt)} <span className="text-[14px]">FCFA</span>
                                </p>
                                {isAcompte ? (
                                    <div className="mt-2.5 pt-2 border-t border-emerald-500/20 space-y-1 text-[11px] font-semibold">
                                        <div className="flex items-center justify-between gap-4">
                                            <span className="text-emerald-300/70">En espèces au check-in (70%) :</span>
                                            <span className="font-bold text-white tabular-nums">{fmtMoney(montantSoldeCheckin)} FCFA</span>
                                        </div>
                                        <div className="flex items-center justify-between gap-4 text-[10px]">
                                            <span className="text-emerald-400/50">Sur votre Wallet AutoLoc :</span>
                                            <span className="font-bold text-emerald-400/80 tabular-nums">{fmtMoney(versementWallet)} FCFA</span>
                                        </div>
                                    </div>
                                ) : (
                                    <p className="text-[11px] text-emerald-400/50 font-semibold mt-1">
                                        Versé sur votre Wallet · {nbJours} jour{nbJours > 1 ? 's' : ''}
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Dates strip */}
                        <div className="mt-6 pt-5 border-t border-white/[0.06] flex flex-wrap gap-4 sm:gap-8">
                            {[
                                { icon: LogIn,       label: "Prise en charge", value: dateDebut ? fmtDateTime(dateDebut) : "Date à confirmer" },
                                { icon: LogOut,      label: "Restitution",     value: dateFin ? fmtDateTime(dateFin) : "Date à confirmer" },
                                { icon: CalendarDays,label: "Durée",           value: `${nbJours} jour${nbJours > 1 ? "s" : ""}` },
                            ].map(item => (
                                <div key={item.label} className="flex items-center gap-2.5">
                                    <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                                        <item.icon className="w-3.5 h-3.5 text-emerald-400/80" strokeWidth={1.75} />
                                    </div>
                                    <div>
                                        <p className="text-[9.5px] font-bold uppercase tracking-[0.14em] text-white/25">{item.label}</p>
                                        <p className="text-[13px] font-bold text-white/75">{item.value}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* ── Banner d'encaissement du solde pour acompte ── */}
                {isAcompte && ['PAYEE', 'CONFIRMEE'].includes(r.statut) && (
                    <div className="flex items-start gap-3.5 rounded-2xl border border-amber-200 bg-amber-50/80 px-5 py-4 shadow-sm">
                        <div className="w-9 h-9 rounded-xl bg-amber-100 border border-amber-200 flex items-center justify-center flex-shrink-0 mt-0.5">
                            <Banknote className="w-5 h-5 text-amber-700" strokeWidth={2} />
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                                <p className="text-[13.5px] font-black text-amber-900">Rappel encaissement solde à la remise</p>
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-md bg-amber-100 border border-amber-300/60 text-[11px] font-bold text-amber-800">
                                    {fmtMoney(montantSoldeCheckin)} FCFA à percevoir
                                </span>
                            </div>
                            <p className="text-[12px] text-amber-800 mt-1 leading-relaxed font-medium">
                                Le locataire a versé un acompte de {fmtMoney(montantPayeEnLigne)} FCFA en ligne. Vous devez percevoir le solde de <strong>{fmtMoney(montantSoldeCheckin)} FCFA</strong> directement en mains propres / espèces lors du check-in au moment de la remise des clés.
                            </p>
                        </div>
                    </div>
                )}

                {/* ══════════════════════════════════════════════════
                    ACTIONS
                ══════════════════════════════════════════════════ */}
                <ReservationActions
                    reservationId={r.id}
                    statut={r.statut}
                    dateDebut={dateDebut ? String(dateDebut) : undefined}
                    dateFin={dateFin ? String(dateFin) : undefined}
                    locataireKycStatus={locataire?.statutKyc || locataire?.kycStatus}
                    checkinProprietaireLe={r.checkinProprietaireLe ?? undefined}
                    checkinLocataireLe={r.checkinLocataireLe ?? undefined}
                    tacitCheckinDeadlineLe={r.tacitCheckinDeadlineLe}
                    totalLocataire={totalLocataire}
                    totalBase={netAmt}
                    isOwner={true}
                    showExpiredAlert={dateFin ? isReservationExpired(dateFin) : false}
                />

                {/* ══════════════════════════════════════════════════
                    REVIEW — Propriétaire note le locataire
                ══════════════════════════════════════════════════ */}
                {(r.statut === 'TERMINEE' || (dateFin && isReservationExpired(dateFin) && ['EN_COURS', 'CONFIRMEE'].includes(r.statut))) && (
                    <>
                        {Array.isArray((r as any).avis) && (r as any).avis.length > 0 ? (
                            <ExistingReviewDisplay
                                review={(r as any).avis[0]}
                                title="Avis sur le locataire"
                                subtitle={`Vous avez noté ${fullName}`}
                            />
                        ) : (
                            <TenantReviewForm
                                reservationId={r.id}
                                tenantName={fullName}
                            />
                        )}
                    </>
                )}

                {/* ══════════════════════════════════════════════════
                    CONTRAT
                ══════════════════════════════════════════════════ */}
                {["PAYEE", "CONFIRMEE", "EN_COURS", "TERMINEE", "ANNULEE"].includes(r.statut) && (
                    <div className="flex items-center gap-4 rounded-2xl bg-white border border-slate-200/80 shadow-sm px-5 py-4">
                        <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center flex-shrink-0">
                            <FileText className="w-5 h-5 text-emerald-500" strokeWidth={1.75} />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-[13.5px] font-black text-slate-800">Contrat de location</p>
                            <p className="text-[11.5px] text-slate-400 mt-0.5">Généré automatiquement · Signé numériquement</p>
                        </div>
                        <ContratActions
                            reservationId={r.id}
                            canPrint={dateDebut ? canPrintContract(dateDebut) : false}
                            dateDebut={dateDebut ? String(dateDebut) : ""}
                            from="owner"
                            showPdf={false}
                        />
                    </div>
                )}

                {/* ══════════════════════════════════════════════════
                    MAIN GRID
                ══════════════════════════════════════════════════ */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

                    {/* ── Locataire ─────────────────────────────── */}
                    <Card icon={User} title="Locataire" accent="emerald">
                        <div className="space-y-3.5">

                            {/* Avatar + name */}
                            <div className="flex items-center gap-3.5">
                                <div className="relative flex-shrink-0">
                                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-100 to-emerald-200 border border-emerald-200 flex items-center justify-center shadow-sm">
                                        <span className="text-[15px] font-black text-emerald-700">{initials}</span>
                                    </div>
                                    {/* KYC dot */}
                                    <div className={`absolute -bottom-1 -right-1 w-4.5 h-4.5 w-[18px] h-[18px] rounded-full border-2 border-white flex items-center justify-center ${locataire.kycStatus === "VERIFIE" ? "bg-emerald-500" : "bg-amber-400"}`}>
                                        {locataire.kycStatus === "VERIFIE"
                                            ? <CheckCircle2 className="w-2.5 h-2.5 text-white" strokeWidth={3} />
                                            : <AlertTriangle className="w-2 h-2 text-white" strokeWidth={3} />
                                        }
                                    </div>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-[15px] font-black text-slate-900">{fullName}</p>
                                    <div className="mt-1.5 flex items-center gap-2 flex-wrap">
                                        <KycBadge status={locataire.kycStatus} />
                                        <TenantDocsViewer reservationId={r.id} compact />
                                    </div>
                                </div>
                            </div>

                            {/* Privacy note before 24h */}
                            <PhoneDisplay
                                telephone={locataire.telephone}
                                dateDebut={dateDebut || new Date()}
                                statut={r.statut}
                                className="mt-2"
                                showLabel={false}
                                name={locatairePrenom}
                                reservationId={r.id}
                            />

                            {/* Note locataire - toujours affichée */}
                            <InfoRow icon={Star} label="Note locataire" iconCls="bg-amber-50 border-amber-200" iconColor="text-amber-500">
                                <div className="flex items-center gap-2">
                                    <span className="text-[14px] font-black text-slate-800 tabular-nums">
                                        {locataire.noteLocataire != null
                                            ? Number(locataire.noteLocataire).toFixed(1)
                                            : "0.0"}
                                        <span className="text-[11px] font-semibold text-slate-400 ml-1">/ 5</span>
                                    </span>
                                    {(locataire as any).totalAvis != null && (locataire as any).totalAvis > 0 && (
                                        <span className="text-[10px] font-semibold text-slate-400">
                                            ({(locataire as any).totalAvis} avis)
                                        </span>
                                    )}
                                    {(locataire.noteLocataire == null || (locataire as any).totalAvis === 0 || (locataire as any).totalAvis == null) && (
                                        <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-slate-100 border border-slate-200 text-[10px] font-bold text-slate-500">
                                            Nouveau
                                        </span>
                                    )}
                                </div>
                            </InfoRow>

                        </div>
                    </Card>

                    {/* ── Véhicule ──────────────────────────────── */}
                    <Card icon={Car} title="Véhicule" accent="emerald">
                        <div className="space-y-3.5">

                            {/* Photo thumbnail */}
                            {photoUrl && (
                                <div className="w-full h-32 rounded-xl overflow-hidden border border-slate-200 bg-slate-100">
                                    <Image src={photoUrl} alt={vehicleName}
                                        width={400} height={200}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                            )}

                            <div>
                                <p className="text-[17px] font-black text-slate-900 tracking-tight">
                                    {vehicleMarque}{" "}
                                    <span className="text-emerald-500">{vehicleModele}</span>
                                </p>
                                <div className="flex items-center gap-2 mt-1 flex-wrap">
                                    {vehicule.annee && <span className="text-[11px] font-semibold text-slate-400">{vehicule.annee}</span>}
                                    {vehicule.type  && <span className="text-[11px] font-semibold text-slate-400">· {vehicule.type}</span>}
                                </div>
                            </div>

                            {vehicule.immatriculation && (
                                <InfoRow icon={Hash} label="Immatriculation">
                                    <span className="font-mono font-bold tracking-wider text-slate-800">{vehicule.immatriculation}</span>
                                </InfoRow>
                            )}

                            {vehicule.ville && (
                                <InfoRow icon={MapPin} label={r.adresseLivraison ? "Lieu de départ" : "Adresse de récupération"}>
                                    <span className="capitalize text-slate-800">{vehicule.ville}</span>
                                </InfoRow>
                            )}

                            {r.adresseLivraison && (
                                <div className="flex items-start gap-3 px-3.5 py-2.5 rounded-xl bg-emerald-50 border border-emerald-100">
                                    <div className="w-7 h-7 rounded-lg bg-white border border-emerald-200 flex items-center justify-center flex-shrink-0 mt-0.5">
                                        <MapPin className="w-3.5 h-3.5 text-emerald-500" strokeWidth={2} />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-600">Livraison demandée</p>
                                        <p className="text-[12.5px] font-semibold text-slate-700 mt-0.5">{r.adresseLivraison}</p>
                                        {r.fraisLivraison && (
                                            <p className="text-[11px] font-bold text-emerald-600 mt-1">+{fmtMoney(r.fraisLivraison)} FCFA</p>
                                        )}
                                        <a 
                                            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(r.adresseLivraison)}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center gap-1.5 text-[10.5px] font-bold text-emerald-600 hover:text-emerald-700 mt-2 transition-colors"
                                        >
                                            <MapPin className="w-3 h-3" strokeWidth={2.5} />
                                            Ouvrir dans Maps
                                        </a>
                                    </div>
                                </div>
                            )}
                        </div>
                    </Card>

                    {/* ── Paiement ──────────────────────────────── */}
                    <Card icon={CreditCard} title="Paiement" accent="emerald">
                        <div className="space-y-3.5">

                            {/* Mode de paiement */}
                            <div className="flex items-center gap-3.5 px-3.5 py-3 rounded-xl bg-slate-50 border border-slate-200">
                                <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center flex-shrink-0">
                                    <Wallet className="w-4.5 h-4.5 text-emerald-600" strokeWidth={2} />
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Mode de paiement</p>
                                    <p className="text-[13.5px] font-black text-slate-800">
                                        {isAcompte ? 'Acompte 30% + Solde à la remise' : 'Paiement 100% en ligne'}
                                    </p>
                                </div>
                            </div>

                            {/* Provider */}
                            <div className="flex items-center gap-3.5 px-3.5 py-3 rounded-xl bg-slate-50 border border-slate-200">
                                {providerLogo ? (
                                    <Image
                                        src={providerLogo}
                                        alt={providerLabel}
                                        width={36} height={36}
                                        className="w-9 h-9 rounded-xl object-contain border border-slate-200 bg-white p-0.5"
                                    />
                                ) : (
                                    <div className="w-9 h-9 rounded-xl bg-slate-200 border border-slate-300 flex items-center justify-center">
                                        <CreditCard className="w-4 h-4 text-slate-500" strokeWidth={2} />
                                    </div>
                                )}
                                <div>
                                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Moyen de paiement en ligne</p>
                                    <p className="text-[14px] font-black text-slate-800">{providerLabel}</p>
                                </div>
                            </div>

                            {/* Payment status */}
                            {paiement?.statut && (
                                <div className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl bg-emerald-50 border border-emerald-100">
                                    <div className="w-7 h-7 rounded-lg bg-emerald-100 border border-emerald-200 flex items-center justify-center flex-shrink-0">
                                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" strokeWidth={2.5} />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Statut du paiement en ligne</p>
                                        <p className="text-[13px] font-bold text-emerald-700">
                                            {paiement.statut === "CONFIRME" || paiement.statut === "COMPLETE"
                                                ? isAcompte ? "Acompte (30%) payé en ligne" : "Paiement (100%) confirmé"
                                                : paiement.statut === "EN_ATTENTE" ? "En attente"
                                                : paiement.statut}
                                        </p>
                                    </div>
                                </div>
                            )}

                            {/* Amounts summary */}
                            <div className="rounded-xl border border-slate-200 bg-slate-50 overflow-hidden divide-y divide-slate-100">
                                <div className="flex items-center justify-between px-3.5 py-2.5">
                                    <span className="text-[12px] text-slate-500 font-medium">Prix total réservation</span>
                                    <span className="text-[13.5px] font-bold text-slate-800 tabular-nums">{fmtMoney(totalLocataire)} FCFA</span>
                                </div>
                                {isAcompte ? (
                                    <>
                                        <div className="flex items-center justify-between px-3.5 py-2.5 bg-emerald-50/70">
                                            <span className="text-[12px] font-bold text-emerald-900 flex items-center gap-1.5">
                                                <CreditCard className="w-3.5 h-3.5 text-emerald-600" />
                                                Acompte reçu en ligne (30%)
                                            </span>
                                            <span className="text-[13.5px] font-black text-emerald-700 tabular-nums">{fmtMoney(montantPayeEnLigne)} FCFA</span>
                                        </div>
                                        <div className="flex items-center justify-between px-3.5 py-2.5 bg-amber-50/70">
                                            <span className="text-[12px] font-bold text-amber-900 flex items-center gap-1.5">
                                                <Banknote className="w-3.5 h-3.5 text-amber-600" />
                                                Solde à percevoir au check-in (70%)
                                            </span>
                                            <span className="text-[13.5px] font-black text-amber-800 tabular-nums">{fmtMoney(montantSoldeCheckin)} FCFA</span>
                                        </div>
                                    </>
                                ) : (
                                    <div className="flex items-center justify-between px-3.5 py-2.5 bg-emerald-50/70">
                                        <span className="text-[12px] font-bold text-emerald-900">Total payé en ligne</span>
                                        <span className="text-[13.5px] font-black text-emerald-700 tabular-nums">{fmtMoney(totalLocataire)} FCFA</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </Card>

                    {/* ── Financier — full width ─────────────────── */}
                    <Card icon={Banknote} title="Détail financier" accent="emerald" className="lg:col-span-2">
                        <div className="space-y-5">

                            {/* 4 cells */}
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                <FinCell icon={Receipt}     label="Total location"     value={fmtMoney(totalLocataire)} accent={false} />
                                <FinCell icon={TrendingUp}  label="Votre revenu net"   value={fmtMoney(netAmt)}         accent={true}  />
                                <FinCell icon={Percent}     label="Commission AutoLoc" value={fmtMoney(commissionAmt)} accent={false} sub={`${commPct}%`} />
                                <FinCell icon={CalendarDays} label="Prix / jour"       value={fmtMoney(r.prixParJour)} accent={false} />
                            </div>

                            {/* Repartition de l'encaissement si acompte */}
                            {isAcompte ? (
                                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 space-y-3">
                                    <p className="text-[12px] font-black uppercase tracking-wider text-slate-700 flex items-center gap-2">
                                        <Banknote className="w-4 h-4 text-emerald-600" />
                                        Ventilation des encaissements
                                    </p>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        <div className="rounded-xl bg-emerald-50/80 border border-emerald-200 p-3.5">
                                            <p className="text-[10.5px] font-bold text-emerald-800 uppercase tracking-wide">1. Crédité sur votre Wallet AutoLoc</p>
                                            <p className="text-[18px] font-black text-emerald-700 tabular-nums mt-0.5">{fmtMoney(versementWallet)} FCFA</p>
                                            <p className="text-[11px] text-emerald-700/80 font-medium mt-1">
                                                Acompte en ligne ({fmtMoney(montantPayeEnLigne)}) - Commission ({fmtMoney(commissionAmt)})
                                            </p>
                                        </div>
                                        <div className="rounded-xl bg-amber-50/80 border border-amber-200 p-3.5">
                                            <p className="text-[10.5px] font-bold text-amber-900 uppercase tracking-wide">2. Perçu en mains propres (Espèces)</p>
                                            <p className="text-[18px] font-black text-amber-800 tabular-nums mt-0.5">{fmtMoney(montantSoldeCheckin)} FCFA</p>
                                            <p className="text-[11px] text-amber-800/80 font-medium mt-1">
                                                Solde de 70% à réclamer au locataire lors du check-in
                                            </p>
                                        </div>
                                    </div>
                                    <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-[12.5px]">
                                        <span className="font-bold text-slate-700">Total net perçu (Wallet + Espèces)</span>
                                        <span className="font-black text-emerald-600 text-[15px] tabular-nums">{fmtMoney(netAmt)} FCFA</span>
                                    </div>
                                </div>
                            ) : (
                                /* Split bar standard pour 100% en ligne */
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between text-[10.5px] font-bold text-slate-500">
                                        <span className="flex items-center gap-1.5">
                                            <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
                                            Votre part (Wallet) — {netPct}%
                                        </span>
                                        <span className="flex items-center gap-1.5">
                                            Commission — {commPct}%
                                            <span className="w-2 h-2 rounded-full bg-slate-300 inline-block" />
                                        </span>
                                    </div>
                                    <div className="h-2.5 rounded-full bg-slate-100 overflow-hidden flex">
                                        <div className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-l-full transition-all duration-700" style={{ width: `${netPct}%` }} />
                                        <div className="h-full bg-slate-200 flex-1 rounded-r-full" />
                                    </div>
                                    <p className="text-[11px] text-slate-400 font-medium">
                                        Revenu Net crédité sur le Wallet {" "}
                                        <span className="font-black text-emerald-600">{fmtMoney(netAmt)} FCFA</span>.
                                    </p>
                                </div>
                            )}

                            {/* Service fee notice */}
                            <div className="px-3.5 py-3 bg-blue-50/60 border border-blue-100 rounded-xl">
                                <div className="flex items-start gap-2.5">
                                    <div className="w-5 h-5 rounded-lg bg-blue-100 border border-blue-200 flex items-center justify-center flex-shrink-0 mt-0.5">
                                        <Info className="w-2.5 h-2.5 text-blue-600" strokeWidth={2.5} />
                                    </div>
                                    <div>
                                        <p className="text-[11px] font-medium text-blue-700 leading-relaxed">
                                            Autoloc prélève des frais de service de 15% pour garantir le bon fonctionnement de la plateforme et la sécurité, incluant les frais de TVA.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Card>
                </div>

                {/* ══════════════════════════════════════════════════
                    PHOTOS ÉTAT DES LIEUX
                ══════════════════════════════════════════════════ */}
                {r.photosEtatLieu && r.photosEtatLieu.length > 0 && (
                    <PhotosEtatLieu photos={r.photosEtatLieu} />
                )}

                {/* ══════════════════════════════════════════════════
                    TIMELINE
                ══════════════════════════════════════════════════ */}
                <Card icon={Clock} title="Chronologie" accent="emerald">
                    <div>
                        {timeline.map((ev, i) => {
                            const isLast = i === timeline.length - 1;
                            const col: Record<string, { icon: string; line: string }> = {
                                slate:   { icon: "bg-emerald-50 border-emerald-200 text-emerald-600", line: "bg-emerald-200" },
                                emerald: { icon: "bg-emerald-50 border-emerald-200 text-emerald-600", line: "bg-emerald-200" },
                                blue:    { icon: "bg-emerald-50 border-emerald-200 text-emerald-600", line: "bg-emerald-200" },
                                red:     { icon: "bg-red-50 border-red-200 text-red-500",             line: "bg-red-200"    },
                            };
                            const c = col[ev.color] ?? col.slate;
                            return (
                                <div key={ev.label} className="flex gap-4">
                                    <div className="flex flex-col items-center flex-shrink-0">
                                        <div className={`w-8 h-8 rounded-full border flex items-center justify-center ${c.icon}`}>
                                            <ev.icon className="w-3.5 h-3.5" strokeWidth={2} />
                                        </div>
                                        {!isLast && <div className={`w-px flex-1 min-h-[24px] my-1 ${c.line}`} />}
                                    </div>
                                    <div className={`${isLast ? "pb-0" : "pb-4"} pt-1`}>
                                        <p className="text-[13px] font-bold text-slate-800 leading-none">{ev.label}</p>
                                        <p className="text-[11px] text-slate-400 mt-1">{fmtDateTime(ev.date)}</p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </Card>

                {/* ══════════════════════════════════════════════════
                    ALERTS
                ══════════════════════════════════════════════════ */}
                {r.statut === "ANNULEE" && (
                    <Alert icon={XCircle} bg="bg-red-50" border="border-red-200" iconBg="bg-red-100 border-red-200" iconColor="text-red-500"
                        title="Réservation annulée" text="Cette réservation a été annulée. Contactez le support si vous avez des questions." />
                )}
                {r.statut === "LITIGE" && (
                    <Alert icon={AlertTriangle} bg="bg-orange-50" border="border-orange-200" iconBg="bg-orange-100 border-orange-200" iconColor="text-orange-500"
                        title="Litige en cours" text="Un litige a été déclaré sur cette réservation. Notre équipe examine votre dossier." />
                )}

            </div>
        </div>
    );
}

/* ════════════════════════════════════════════════════════════════
   SUB-COMPONENTS
════════════════════════════════════════════════════════════════ */
function Card({ icon: Icon, title, children, className, accent = "slate" }: {
    icon: React.ElementType; title: string; children: React.ReactNode;
    className?: string; accent?: "slate" | "emerald" | "blue";
}) {
    const iconCls = { slate: "bg-slate-100 text-slate-500", emerald: "bg-emerald-50 text-emerald-600", blue: "bg-blue-50 text-blue-500" }[accent];
    return (
        <div className={`rounded-2xl bg-white border border-slate-200/80 shadow-sm overflow-hidden ${className ?? ""}`}>
            <div className="flex items-center gap-2.5 px-5 py-3.5 border-b border-slate-100 bg-slate-50/40">
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${iconCls}`}>
                    <Icon className="w-3.5 h-3.5" strokeWidth={1.75} />
                </div>
                <h3 className="text-[10.5px] font-black uppercase tracking-[0.14em] text-slate-400">{title}</h3>
            </div>
            <div className="px-5 py-4">{children}</div>
        </div>
    );
}

function InfoRow({ icon: Icon, label, children, iconCls = "bg-emerald-50 border-emerald-100", iconColor = "text-emerald-500" }: {
    icon: React.ElementType; label: string; children: React.ReactNode;
    iconCls?: string; iconColor?: string;
}) {
    return (
        <div className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200">
            <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${iconCls}`}>
                <Icon className={`w-3.5 h-3.5 ${iconColor}`} strokeWidth={2} />
            </div>
            <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{label}</p>
                <div className="text-[13.5px] font-bold">{children}</div>
            </div>
        </div>
    );
}

function FinCell({ icon: Icon, label, value, accent, sub }: {
    icon: React.ElementType; label: string; value: string; accent: boolean; sub?: string;
}) {
    return (
        <div className={`rounded-2xl p-4 border space-y-2.5 ${accent ? "bg-gradient-to-br from-emerald-50 to-emerald-50/30 border-emerald-200" : "bg-slate-50 border-slate-200"}`}>
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${accent ? "bg-emerald-100 border border-emerald-200" : "bg-white border border-slate-200"}`}>
                <Icon className={`w-4 h-4 ${accent ? "text-emerald-600" : "text-slate-500"}`} strokeWidth={1.75} />
            </div>
            <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{label}</p>
                <p className={`text-[17px] font-black tabular-nums leading-tight mt-0.5 ${accent ? "text-emerald-600" : "text-slate-800"}`}>{value}</p>
                <p className={`text-[10px] font-semibold mt-0.5 ${accent ? "text-emerald-400" : "text-slate-400"}`}>{sub ?? "FCFA"}</p>
            </div>
        </div>
    );
}

function KycBadge({ status }: { status?: string }) {
    if (status === "VERIFIE") return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-[11px] font-bold text-emerald-700">
            <ShieldCheck className="w-3 h-3" strokeWidth={2.5} />Identité vérifiée
        </span>
    );
    if (status === "EN_ATTENTE") return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 border border-amber-200 text-[11px] font-bold text-amber-700">
            <ShieldAlert className="w-3 h-3" strokeWidth={2.5} />KYC en attente
        </span>
    );
    if (status === "REJETE") return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-50 border border-red-200 text-[11px] font-bold text-red-700">
            <ShieldX className="w-3 h-3" strokeWidth={2.5} />KYC rejeté
        </span>
    );
    return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 border border-slate-200 text-[11px] font-bold text-slate-500">
            <ShieldAlert className="w-3 h-3" strokeWidth={2.5} />KYC non soumis
        </span>
    );
}

function Alert({ icon: Icon, bg, border, iconBg, iconColor, title, text }: {
    icon: React.ElementType; bg: string; border: string;
    iconBg: string; iconColor: string; title: string; text: string;
}) {
    return (
        <div className={`flex items-start gap-3 rounded-2xl ${bg} ${border} border px-5 py-4`}>
            <div className={`w-9 h-9 rounded-xl ${iconBg} border flex items-center justify-center flex-shrink-0`}>
                <Icon className={`w-4 h-4 ${iconColor}`} strokeWidth={2} />
            </div>
            <div>
                <p className="text-[13px] font-black text-slate-800">{title}</p>
                <p className="text-[12px] text-slate-500 mt-0.5">{text}</p>
            </div>
        </div>
    );
}
