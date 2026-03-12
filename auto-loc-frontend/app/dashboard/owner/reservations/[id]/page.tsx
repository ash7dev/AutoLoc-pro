import { cookies } from "next/headers";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ApiError } from "@/lib/nestjs/api-client";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { fetchReservation } from "@/lib/nestjs/reservations";
import { ReservationActions } from "@/features/reservations/components/reservation-actions";
import { TenantDocsViewer } from "@/features/reservations/components/tenant-docs-viewer";
import {
    ArrowLeft, Car, FileText, Banknote, Clock, CheckCircle2,
    XCircle, LogIn, LogOut, Hash, AlertTriangle, ShieldCheck,
    ShieldAlert, ShieldX, Phone, Lock, Star, MapPin, TrendingUp,
    Receipt, Percent, CalendarDays, ArrowRight, User, CreditCard,
    BadgeCheck, Wallet,
} from "lucide-react";

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
        reservation = await fetchReservation(token, params.id);
    } catch (err) {
        if (err instanceof ApiError && err.status === 401) redirect("/login?expired=1");
        if (err instanceof ApiError && err.status === 404) notFound();
        throw err;
    }

    const r = reservation;
    const leg = r as typeof r & {
        totalLocataire?: string; montantCommission?: string; netProprietaire?: string;
        tauxCommission?: string; checkinLe?: string; checkoutLe?: string; annuleLe?: string;
    };

    /* ── Computed ── */
    const nbJours = r.nbJours != null
        ? r.nbJours
        : Math.max(1, Math.round((new Date(r.dateFin).getTime() - new Date(r.dateDebut).getTime()) / 86_400_000));

    const totalLocataire  = Number(r.prixTotal             ?? leg.totalLocataire    ?? 0) || 0;
    const commissionAmt   = Number(r.commission            ?? leg.montantCommission  ?? 0) || 0;
    const netAmt          = Number(r.montantProprietaire   ?? leg.netProprietaire    ?? 0) || 0;
    const commPct = totalLocataire > 0 ? Math.round((commissionAmt / totalLocataire) * 100) : 0;
    const netPct  = totalLocataire > 0 ? Math.round((netAmt / totalLocataire) * 100) : 0;

    /* ── Privacy: sensitive info hidden before confirmation ── */
    const revealed = ["CONFIRMEE", "EN_COURS", "TERMINEE", "LITIGE"].includes(r.statut);
    const initials  = `${r.locataire.prenom[0]}${r.locataire.nom[0]}`.toUpperCase();
    const fullName  = revealed
        ? `${r.locataire.prenom} ${r.locataire.nom}`
        : `${r.locataire.prenom} ${r.locataire.nom[0]}.`;

    /* ── Vehicle photo ── */
    const photos = (r.vehicule as typeof r.vehicule & { photos?: { url: string; estPrincipale?: boolean }[] }).photos ?? [];
    const photoUrl = photos[0]?.url ?? null;

    /* ── Payment provider ── */
    const paiement = r.paiement as { statut?: string; fournisseur?: string } | undefined;
    const providerLogo = paiement?.fournisseur === "WAVE" ? "/wavelogo.jpeg"
        : paiement?.fournisseur === "ORANGE_MONEY" ? "/orangeMoneylogo.jpg"
        : null;
    const providerLabel = paiement?.fournisseur === "WAVE" ? "Wave"
        : paiement?.fournisseur === "ORANGE_MONEY" ? "Orange Money"
        : paiement?.fournisseur ?? "—";

    /* ── Timeline ── */
    const timeline = [
        { label: "Réservation créée",  date: r.creeLe,                                     icon: Clock,         color: "emerald" },
        r.confirmeeLe && { label: "Confirmée",           date: r.confirmeeLe,              icon: CheckCircle2,  color: "emerald" },
        (r.checkInLe ?? leg.checkinLe) && { label: "Check-in effectué", date: (r.checkInLe ?? leg.checkinLe)!, icon: LogIn, color: "emerald" },
        (r.checkOutLe ?? leg.checkoutLe) && { label: "Check-out effectué", date: (r.checkOutLe ?? leg.checkoutLe)!, icon: LogOut, color: "emerald" },
        (r.annuleeLe ?? leg.annuleLe) && { label: "Annulée", date: (r.annuleeLe ?? leg.annuleLe)!, icon: XCircle, color: "red" },
    ].filter(Boolean) as { label: string; date: string; icon: React.ElementType; color: string }[];

    const st = STATUS[r.statut] ?? STATUS.INITIEE;

    return (
        <div className="min-h-screen bg-slate-50/60">
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
                                alt={`${r.vehicule.marque} ${r.vehicule.modele}`}
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
                                    {r.vehicule.marque}{" "}
                                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-emerald-300">
                                        {r.vehicule.modele}
                                    </span>
                                </h1>
                                <p className="text-[12px] text-white/25 mt-1.5 flex items-center gap-1.5">
                                    <Clock className="w-3 h-3" strokeWidth={2} />
                                    Créée le {fmtDate(r.creeLe, { day: "numeric", month: "long", year: "numeric" })}
                                </p>
                            </div>

                            {/* Net revenue pill */}
                            <div className="flex-shrink-0 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 px-5 py-4">
                                <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-emerald-400/60">Votre revenu net</p>
                                <p className="text-[2rem] font-black text-emerald-400 tabular-nums leading-none mt-1">
                                    {fmtMoney(netAmt)}
                                </p>
                                <p className="text-[11px] text-emerald-400/50 font-semibold mt-1">FCFA · {netPct}% du total</p>
                            </div>
                        </div>

                        {/* Dates strip */}
                        <div className="mt-6 pt-5 border-t border-white/[0.06] flex flex-wrap gap-4 sm:gap-8">
                            {[
                                { icon: LogIn,       label: "Prise en charge", value: fmtShort(r.dateDebut) },
                                { icon: LogOut,      label: "Restitution",     value: fmtShort(r.dateFin) },
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

                {/* ══════════════════════════════════════════════════
                    ACTIONS
                ══════════════════════════════════════════════════ */}
                <ReservationActions
                    reservationId={r.id}
                    statut={r.statut}
                    locataireKycStatus={r.locataire.kycStatus}
                />

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
                        <Link
                            href={`/dashboard/reservations/${r.id}/contrat`}
                            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-[12px] font-bold text-white transition-all hover:-translate-y-0.5 active:translate-y-0 shadow-sm flex-shrink-0"
                        >
                            <FileText className="w-3.5 h-3.5" strokeWidth={2.5} />
                            Voir
                            <ArrowRight className="w-3 h-3" strokeWidth={2.5} />
                        </Link>
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
                                    <div className={`absolute -bottom-1 -right-1 w-4.5 h-4.5 w-[18px] h-[18px] rounded-full border-2 border-white flex items-center justify-center ${r.locataire.kycStatus === "VERIFIE" ? "bg-emerald-500" : "bg-amber-400"}`}>
                                        {r.locataire.kycStatus === "VERIFIE"
                                            ? <CheckCircle2 className="w-2.5 h-2.5 text-white" strokeWidth={3} />
                                            : <AlertTriangle className="w-2 h-2 text-white" strokeWidth={3} />
                                        }
                                    </div>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-[15px] font-black text-slate-900">{fullName}</p>
                                    <div className="mt-1.5 flex items-center gap-2 flex-wrap">
                                        <KycBadge status={r.locataire.kycStatus} />
                                        <TenantDocsViewer reservationId={r.id} compact />
                                    </div>
                                </div>
                            </div>

                            {/* Phone — masked before confirmation */}
                            <div className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl border transition-all ${revealed ? "bg-slate-50 border-slate-200" : "bg-slate-50/40 border-dashed border-slate-200/70"}`}>
                                <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 transition-all ${revealed ? "bg-emerald-50 border border-emerald-200" : "bg-slate-100"}`}>
                                    {revealed
                                        ? <Phone className="w-3.5 h-3.5 text-emerald-500" strokeWidth={2} />
                                        : <Lock className="w-3.5 h-3.5 text-slate-400" strokeWidth={2} />
                                    }
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Téléphone</p>
                                    {revealed && r.locataire.telephone
                                        ? <p className="text-[13.5px] font-bold text-slate-800">{r.locataire.telephone}</p>
                                        : <p className="text-[12px] font-semibold text-slate-400 italic">
                                            {revealed ? "Non renseigné" : "Disponible après confirmation"}
                                          </p>
                                    }
                                </div>
                            </div>

                            {/* Note */}
                            {r.locataire.noteLocataire != null && (
                                <InfoRow icon={Star} label="Note locataire" iconCls="bg-amber-50 border-amber-200" iconColor="text-amber-500">
                                    <span className="text-[14px] font-black text-slate-800 tabular-nums">
                                        {Number(r.locataire.noteLocataire).toFixed(1)}
                                        <span className="text-[11px] font-semibold text-slate-400 ml-1">/ 5</span>
                                    </span>
                                </InfoRow>
                            )}

                            {/* Privacy note before confirmation */}
                            {!revealed && (
                                <div className="flex items-start gap-2.5 px-3.5 py-2.5 rounded-xl bg-emerald-50/60 border border-emerald-100">
                                    <BadgeCheck className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" strokeWidth={2} />
                                    <p className="text-[11px] text-emerald-700/70 font-medium leading-relaxed">
                                        Les coordonnées complètes du locataire seront accessibles une fois la réservation confirmée.
                                    </p>
                                </div>
                            )}

                        </div>
                    </Card>

                    {/* ── Véhicule ──────────────────────────────── */}
                    <Card icon={Car} title="Véhicule" accent="emerald">
                        <div className="space-y-3.5">

                            {/* Photo thumbnail */}
                            {photoUrl && (
                                <div className="w-full h-32 rounded-xl overflow-hidden border border-slate-200 bg-slate-100">
                                    <Image src={photoUrl} alt={`${r.vehicule.marque} ${r.vehicule.modele}`}
                                        width={400} height={200}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                            )}

                            <div>
                                <p className="text-[17px] font-black text-slate-900 tracking-tight">
                                    {r.vehicule.marque}{" "}
                                    <span className="text-emerald-500">{r.vehicule.modele}</span>
                                </p>
                                <div className="flex items-center gap-2 mt-1 flex-wrap">
                                    {r.vehicule.annee && <span className="text-[11px] font-semibold text-slate-400">{r.vehicule.annee}</span>}
                                    {r.vehicule.type  && <span className="text-[11px] font-semibold text-slate-400">· {r.vehicule.type}</span>}
                                </div>
                            </div>

                            {r.vehicule.immatriculation && (
                                <InfoRow icon={Hash} label="Immatriculation">
                                    <span className="font-mono font-bold tracking-wider text-slate-800">{r.vehicule.immatriculation}</span>
                                </InfoRow>
                            )}

                            {(r.vehicule.ville || (r.vehicule as typeof r.vehicule & { adresse?: string }).adresse) && (
                                <InfoRow icon={MapPin} label="Localisation">
                                    <span className="capitalize text-slate-800">
                                        {(r.vehicule as typeof r.vehicule & { adresse?: string }).adresse ?? r.vehicule.ville}
                                    </span>
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
                                    </div>
                                </div>
                            )}
                        </div>
                    </Card>

                    {/* ── Paiement ──────────────────────────────── */}
                    <Card icon={CreditCard} title="Paiement" accent="emerald">
                        <div className="space-y-3.5">

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
                                        <Wallet className="w-4 h-4 text-slate-500" strokeWidth={2} />
                                    </div>
                                )}
                                <div>
                                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Moyen de paiement</p>
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
                                        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Statut</p>
                                        <p className="text-[13px] font-bold text-emerald-700">
                                            {paiement.statut === "CONFIRME" || paiement.statut === "COMPLETE" ? "Paiement confirmé"
                                                : paiement.statut === "EN_ATTENTE" ? "En attente"
                                                : paiement.statut}
                                        </p>
                                    </div>
                                </div>
                            )}

                            {/* Amount */}
                            <InfoRow icon={Receipt} label="Montant total reçu">
                                <span className="text-[14px] font-black text-slate-800 tabular-nums">
                                    {fmtMoney(totalLocataire)}
                                    <span className="text-[11px] font-semibold text-slate-400 ml-1">FCFA</span>
                                </span>
                            </InfoRow>
                        </div>
                    </Card>

                    {/* ── Financier — full width ─────────────────── */}
                    <Card icon={Banknote} title="Détail financier" accent="emerald" className="lg:col-span-2">
                        <div className="space-y-5">

                            {/* 4 cells */}
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                <FinCell icon={Receipt}   label="Total locataire"   value={fmtMoney(totalLocataire)} accent={false} />
                                <FinCell icon={TrendingUp} label="Votre revenu net"  value={fmtMoney(netAmt)}         accent={true}  />
                                <FinCell icon={Percent}   label="Commission AutoLoc" value={fmtMoney(commissionAmt)} accent={false} sub={`${commPct}%`} />
                                <FinCell icon={CalendarDays} label="Prix / jour"     value={fmtMoney(r.prixParJour)} accent={false} />
                            </div>

                            {/* Split bar */}
                            <div className="space-y-2">
                                <div className="flex items-center justify-between text-[10.5px] font-bold text-slate-500">
                                    <span className="flex items-center gap-1.5">
                                        <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
                                        Votre part — {netPct}%
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
                                    Sur {fmtMoney(totalLocataire)} FCFA payés, vous recevrez{" "}
                                    <span className="font-black text-emerald-600">{fmtMoney(netAmt)} FCFA</span>.
                                </p>
                            </div>
                        </div>
                    </Card>
                </div>

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
