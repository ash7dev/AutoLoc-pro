import { cookies } from 'next/headers';
import { redirect, notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { ApiError } from '@/lib/nestjs/api-client';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { fetchReservationById } from '@/lib/nestjs/reservations';
import { ReservationActions } from '@/features/reservations/components/reservation-actions';
import {
    ArrowLeft, Car, Banknote, Clock, CheckCircle2,
    XCircle, LogIn, LogOut, Hash, AlertTriangle,
    CalendarDays, ArrowRight, CreditCard, MapPin,
    Truck, FileText, Wallet, Receipt, Star,
} from 'lucide-react';

/* ════════════════════════════════════════════════════════════════
   HELPERS
════════════════════════════════════════════════════════════════ */
function fmtDate(d: string | Date, opts?: Intl.DateTimeFormatOptions) {
    return new Date(d).toLocaleDateString('fr-FR', opts ?? {
        weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
    });
}
function fmtShort(d: string | Date) {
    return new Date(d).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' });
}
function fmtDateTime(d: string | Date) {
    return new Date(d).toLocaleDateString('fr-FR', {
        day: 'numeric', month: 'long', year: 'numeric',
        hour: '2-digit', minute: '2-digit',
    });
}
function fmtMoney(n: number | string) {
    return Number(n).toLocaleString('fr-FR');
}

/* ── Status config ────────────────────────────────────────────── */
const STATUS: Record<string, { label: string; text: string; bg: string; border: string; dot: string; pulse?: boolean }> = {
    INITIEE:             { label: 'Initiée',             text: 'text-slate-500',    bg: 'bg-slate-50',    border: 'border-slate-200',  dot: 'bg-slate-400' },
    EN_ATTENTE_PAIEMENT: { label: 'En attente paiement', text: 'text-amber-700',   bg: 'bg-amber-50',    border: 'border-amber-200',  dot: 'bg-amber-400' },
    PAYEE:               { label: 'Paiement confirmé',   text: 'text-blue-700',    bg: 'bg-blue-50',     border: 'border-blue-200',   dot: 'bg-blue-500' },
    CONFIRMEE:           { label: 'Confirmée',           text: 'text-emerald-700', bg: 'bg-emerald-50',  border: 'border-emerald-200',dot: 'bg-emerald-500' },
    EN_COURS:            { label: 'En cours',            text: 'text-emerald-700', bg: 'bg-emerald-50',  border: 'border-emerald-200',dot: 'bg-emerald-500', pulse: true },
    TERMINEE:            { label: 'Terminée',            text: 'text-slate-500',   bg: 'bg-slate-50',    border: 'border-slate-200',  dot: 'bg-slate-400' },
    ANNULEE:             { label: 'Annulée',             text: 'text-red-700',     bg: 'bg-red-50',      border: 'border-red-200',    dot: 'bg-red-500' },
    LITIGE:              { label: 'Litige ouvert',       text: 'text-orange-700',  bg: 'bg-orange-50',   border: 'border-orange-200', dot: 'bg-orange-500' },
};

/* ════════════════════════════════════════════════════════════════
   PAGE
════════════════════════════════════════════════════════════════ */
export default async function TenantReservationDetailPage({ params }: { params: { id: string } }) {
    /* ── Auth ── */
    const nestToken = cookies().get('nest_access')?.value ?? null;
    let token: string | null = nestToken;
    if (!token) {
        const supabase = createSupabaseServerClient();
        const { data } = await supabase.auth.getSession();
        token = data.session?.access_token ?? null;
    }
    if (!token) redirect('/login');

    /* ── Fetch ── */
    let reservation;
    try {
        reservation = await fetchReservationById(token, params.id);
    } catch (err) {
        if (err instanceof ApiError && err.status === 404) notFound();
        if (err instanceof ApiError && err.status === 401) redirect('/login?expired=1');
        throw err;
    }

    const r = reservation;
    const legacy = r as typeof r & {
        totalLocataire?: string;
        montantCommission?: string;
        checkinLe?: string;
        checkoutLe?: string;
        annuleLe?: string;
    };

    /* ── Computed ── */
    const nbJours = r.nbJours != null
        ? r.nbJours
        : Math.max(1, Math.round((new Date(r.dateFin).getTime() - new Date(r.dateDebut).getTime()) / 86_400_000));

    const totalPaye = Number(r.prixTotal ?? legacy.totalLocataire ?? 0) || 0;

    /* ── Vehicle photo ── */
    const v = r.vehicule;
    const photos = (v as typeof v & { photos?: { url: string; estPrincipale?: boolean }[] }).photos ?? [];
    const photoUrl = photos.find(p => p.estPrincipale)?.url ?? photos[0]?.url ?? null;

    /* ── Payment provider ── */
    const paiement = r.paiement as { statut?: string; fournisseur?: string } | undefined;
    const providerLogo = paiement?.fournisseur === 'WAVE' ? '/wavelogo.jpeg'
        : paiement?.fournisseur === 'ORANGE_MONEY' ? '/orangeMoneylogo.jpg'
        : null;
    const providerLabel = paiement?.fournisseur === 'WAVE' ? 'Wave'
        : paiement?.fournisseur === 'ORANGE_MONEY' ? 'Orange Money'
        : paiement?.fournisseur ?? '—';

    /* ── Timeline ── */
    const timeline = [
        { label: 'Réservation créée',           date: r.creeLe,                                          icon: Clock,        color: 'emerald' },
        r.confirmeeLe && { label: 'Confirmée par le propriétaire', date: r.confirmeeLe,                  icon: CheckCircle2, color: 'emerald' },
        (r.checkInLe ?? legacy.checkinLe) && { label: 'Check-in effectué',  date: (r.checkInLe ?? legacy.checkinLe)!,   icon: LogIn,  color: 'emerald' },
        (r.checkOutLe ?? legacy.checkoutLe) && { label: 'Check-out effectué', date: (r.checkOutLe ?? legacy.checkoutLe)!, icon: LogOut, color: 'emerald' },
        (r.annuleeLe ?? legacy.annuleLe) && { label: 'Annulée',              date: (r.annuleeLe ?? legacy.annuleLe)!,    icon: XCircle, color: 'red' },
    ].filter(Boolean) as { label: string; date: string; icon: React.ElementType; color: string }[];

    const st = STATUS[r.statut] ?? STATUS.INITIEE;

    return (
        <div className="min-h-screen bg-slate-50/60">
            <div className="max-w-5xl mx-auto px-4 py-6 lg:px-8 lg:py-10 space-y-5">

                {/* ── Back ─────────────────────────────────────── */}
                <Link
                    href="/dashboard/reservations"
                    className="inline-flex items-center gap-1.5 text-[12.5px] font-semibold text-slate-400 hover:text-slate-800 transition-colors group"
                >
                    <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" strokeWidth={2.5} />
                    Mes réservations
                </Link>

                {/* ══════════════════════════════════════════════════
                    HERO — dark premium
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
                        style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.5) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.5) 1px,transparent 1px)', backgroundSize: '40px 40px' }}
                    />

                    {/* Vehicle photo strip */}
                    {photoUrl && (
                        <div className="pointer-events-none absolute inset-y-0 right-0 w-1/3 md:w-2/5 hidden sm:block">
                            <Image
                                src={photoUrl}
                                alt={`${v?.marque ?? ''} ${v?.modele ?? ''}`}
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
                                <span className={`w-1.5 h-1.5 rounded-full ${st.dot} ${st.pulse ? 'animate-pulse' : ''}`} />
                                {st.label}
                            </span>
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-[10.5px] font-mono text-white/30">
                                <Hash className="w-3 h-3" strokeWidth={2} />
                                {r.id.slice(0, 8).toUpperCase()}
                            </span>
                        </div>

                        {/* Title + total paid */}
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-5">
                            <div>
                                <h1 className="text-2xl lg:text-[2rem] font-black text-white tracking-tight leading-tight">
                                    {v?.marque}{' '}
                                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-emerald-300">
                                        {v?.modele}
                                    </span>
                                </h1>
                                <p className="text-[12px] text-white/25 mt-1.5 flex items-center gap-1.5">
                                    <Clock className="w-3 h-3" strokeWidth={2} />
                                    Créée le {fmtDate(r.creeLe, { day: 'numeric', month: 'long', year: 'numeric' })}
                                </p>
                            </div>

                            {/* Total paid pill */}
                            <div className="flex-shrink-0 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 px-5 py-4">
                                <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-emerald-400/60">Montant payé</p>
                                <p className="text-[2rem] font-black text-emerald-400 tabular-nums leading-none mt-1">
                                    {fmtMoney(totalPaye)}
                                </p>
                                <p className="text-[11px] text-emerald-400/50 font-semibold mt-1">
                                    FCFA · {nbJours} jour{nbJours > 1 ? 's' : ''}
                                </p>
                            </div>
                        </div>

                        {/* Dates strip */}
                        <div className="mt-6 pt-5 border-t border-white/[0.06] flex flex-wrap gap-4 sm:gap-8">
                            {[
                                { icon: LogIn,        label: 'Prise en charge', value: fmtShort(r.dateDebut) },
                                { icon: LogOut,       label: 'Restitution',     value: fmtShort(r.dateFin) },
                                { icon: CalendarDays, label: 'Durée',           value: `${nbJours} jour${nbJours > 1 ? 's' : ''}` },
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
                <ReservationActions reservationId={r.id} statut={r.statut} />

                {/* ══════════════════════════════════════════════════
                    CONTRAT
                ══════════════════════════════════════════════════ */}
                {['PAYEE', 'CONFIRMEE', 'EN_COURS', 'TERMINEE', 'ANNULEE'].includes(r.statut) && (
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
                            <Receipt className="w-3.5 h-3.5" strokeWidth={2.5} />
                            Voir
                            <ArrowRight className="w-3 h-3" strokeWidth={2.5} />
                        </Link>
                    </div>
                )}

                {/* ══════════════════════════════════════════════════
                    MAIN GRID
                ══════════════════════════════════════════════════ */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

                    {/* ── Véhicule ──────────────────────────────── */}
                    <Card icon={Car} title="Véhicule" accent="emerald">
                        <div className="space-y-3.5">

                            {/* Photo */}
                            {photoUrl && (
                                <div className="w-full h-36 rounded-xl overflow-hidden border border-slate-200 bg-slate-100">
                                    <Image
                                        src={photoUrl}
                                        alt={`${v?.marque ?? ''} ${v?.modele ?? ''}`}
                                        width={400} height={200}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                            )}
                            {!photoUrl && (
                                <div className="w-full h-24 rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 flex items-center justify-center">
                                    <Car className="w-8 h-8 text-slate-300" strokeWidth={1.5} />
                                </div>
                            )}

                            <div>
                                <p className="text-[17px] font-black text-slate-900 tracking-tight">
                                    {v?.marque}{' '}
                                    <span className="text-emerald-500">{v?.modele}</span>
                                </p>
                                <div className="flex items-center gap-2 mt-1 flex-wrap">
                                    {(v as typeof v & { annee?: number })?.annee && (
                                        <span className="text-[11px] font-semibold text-slate-400">
                                            {(v as typeof v & { annee?: number }).annee}
                                        </span>
                                    )}
                                    {v?.type && <span className="text-[11px] font-semibold text-slate-400">· {v.type}</span>}
                                </div>
                            </div>

                            {v?.immatriculation && (
                                <InfoRow icon={Hash} label="Immatriculation">
                                    <span className="font-mono font-bold tracking-wider text-slate-800">{v.immatriculation}</span>
                                </InfoRow>
                            )}

                            {v?.ville && (
                                <InfoRow icon={MapPin} label="Localisation">
                                    <span className="capitalize text-slate-800">{v.ville}</span>
                                </InfoRow>
                            )}

                            {/* Note véhicule */}
                            {(v as typeof v & { noteVehicule?: number })?.noteVehicule != null && (
                                <InfoRow icon={Star} label="Note véhicule" iconCls="bg-amber-50 border-amber-200" iconColor="text-amber-500">
                                    <span className="text-[14px] font-black text-slate-800 tabular-nums">
                                        {Number((v as typeof v & { noteVehicule?: number }).noteVehicule).toFixed(1)}
                                        <span className="text-[11px] font-semibold text-slate-400 ml-1">/ 5</span>
                                    </span>
                                </InfoRow>
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
                                            {paiement.statut === 'CONFIRME' || paiement.statut === 'COMPLETE'
                                                ? 'Paiement confirmé'
                                                : paiement.statut === 'EN_ATTENTE' ? 'En attente'
                                                : paiement.statut}
                                        </p>
                                    </div>
                                </div>
                            )}

                            {/* Breakdown */}
                            <div className="rounded-xl border border-slate-200 bg-slate-50 overflow-hidden divide-y divide-slate-100">
                                <div className="flex items-center justify-between px-3.5 py-2.5">
                                    <span className="text-[12px] text-slate-500 font-medium">Prix / jour</span>
                                    <span className="text-[13px] font-bold text-slate-800 tabular-nums">
                                        {fmtMoney(r.prixParJour)} FCFA
                                    </span>
                                </div>
                                <div className="flex items-center justify-between px-3.5 py-2.5">
                                    <span className="text-[12px] text-slate-500 font-medium">Durée</span>
                                    <span className="text-[13px] font-bold text-slate-800 tabular-nums">
                                        × {nbJours} jour{nbJours > 1 ? 's' : ''}
                                    </span>
                                </div>
                                {r.adresseLivraison && r.fraisLivraison && (
                                    <div className="flex items-center justify-between px-3.5 py-2.5">
                                        <span className="text-[12px] text-slate-500 font-medium">Frais livraison</span>
                                        <span className="text-[13px] font-bold text-slate-800 tabular-nums">
                                            +{fmtMoney(r.fraisLivraison)} FCFA
                                        </span>
                                    </div>
                                )}
                                <div className="flex items-center justify-between px-3.5 py-3 bg-white">
                                    <span className="text-[12px] font-black uppercase tracking-[0.08em] text-slate-700">Total payé</span>
                                    <span className="text-[15px] font-black text-emerald-600 tabular-nums">
                                        {fmtMoney(totalPaye)} FCFA
                                    </span>
                                </div>
                            </div>
                        </div>
                    </Card>

                    {/* ── Livraison (si applicable) ──────────────── */}
                    {r.adresseLivraison && (
                        <Card icon={Truck} title="Livraison" accent="emerald" className="lg:col-span-2">
                            <div className="flex items-start gap-3.5">
                                <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center flex-shrink-0">
                                    <MapPin className="w-5 h-5 text-emerald-500" strokeWidth={1.75} />
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Adresse de livraison</p>
                                    <p className="text-[14px] font-black text-slate-800 mt-0.5">{r.adresseLivraison}</p>
                                    {r.fraisLivraison && (
                                        <p className="text-[12px] font-semibold text-emerald-600 mt-1">
                                            +{fmtMoney(r.fraisLivraison)} FCFA inclus dans le total
                                        </p>
                                    )}
                                </div>
                            </div>
                        </Card>
                    )}
                </div>

                {/* ══════════════════════════════════════════════════
                    TIMELINE
                ══════════════════════════════════════════════════ */}
                <Card icon={Clock} title="Chronologie" accent="emerald">
                    <div>
                        {timeline.map((ev, i) => {
                            const isLast = i === timeline.length - 1;
                            const col: Record<string, { icon: string; line: string }> = {
                                emerald: { icon: 'bg-emerald-50 border-emerald-200 text-emerald-600', line: 'bg-emerald-200' },
                                red:     { icon: 'bg-red-50 border-red-200 text-red-500',             line: 'bg-red-200'    },
                            };
                            const c = col[ev.color] ?? col.emerald;
                            return (
                                <div key={ev.label} className="flex gap-4">
                                    <div className="flex flex-col items-center flex-shrink-0">
                                        <div className={`w-8 h-8 rounded-full border flex items-center justify-center ${c.icon}`}>
                                            <ev.icon className="w-3.5 h-3.5" strokeWidth={2} />
                                        </div>
                                        {!isLast && <div className={`w-px flex-1 min-h-[24px] my-1 ${c.line}`} />}
                                    </div>
                                    <div className={`${isLast ? 'pb-0' : 'pb-4'} pt-1`}>
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
                {r.statut === 'ANNULEE' && (
                    <Alert icon={XCircle} bg="bg-red-50" border="border-red-200" iconBg="bg-red-100 border-red-200" iconColor="text-red-500"
                        title="Réservation annulée"
                        text="Cette réservation a été annulée. Contactez le support si vous avez des questions." />
                )}
                {r.statut === 'LITIGE' && (
                    <Alert icon={AlertTriangle} bg="bg-orange-50" border="border-orange-200" iconBg="bg-orange-100 border-orange-200" iconColor="text-orange-500"
                        title="Litige en cours"
                        text="Un litige a été déclaré sur cette réservation. Notre équipe examine votre dossier." />
                )}

                {/* Waiting for owner confirmation */}
                {r.statut === 'PAYEE' && (
                    <Alert icon={Clock} bg="bg-blue-50" border="border-blue-200" iconBg="bg-blue-100 border-blue-200" iconColor="text-blue-500"
                        title="En attente de confirmation"
                        text="Votre paiement a été reçu. Le propriétaire doit confirmer votre réservation avant que vous puissiez effectuer le check-in." />
                )}

            </div>
        </div>
    );
}

/* ════════════════════════════════════════════════════════════════
   SUB-COMPONENTS
════════════════════════════════════════════════════════════════ */
function Card({ icon: Icon, title, children, className, accent = 'emerald' }: {
    icon: React.ElementType; title: string; children: React.ReactNode;
    className?: string; accent?: 'emerald' | 'slate';
}) {
    const iconCls = accent === 'emerald' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-500';
    return (
        <div className={`rounded-2xl bg-white border border-slate-200/80 shadow-sm overflow-hidden ${className ?? ''}`}>
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

function InfoRow({ icon: Icon, label, children, iconCls = 'bg-emerald-50 border-emerald-100', iconColor = 'text-emerald-500' }: {
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
