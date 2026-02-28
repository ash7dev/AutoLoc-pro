import { cookies } from 'next/headers';
import { redirect, notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { ApiError } from '@/lib/nestjs/api-client';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { fetchReservationById } from '@/lib/nestjs/reservations';
import { ReservationActions } from '@/features/reservations/components/reservation-actions';
import {
    ArrowLeft, Calendar, Car, Banknote, Clock,
    CheckCircle2, LogIn, LogOut, XCircle,
    Download, Hash, MapPin, FileText,
    TrendingUp, AlertTriangle,
} from 'lucide-react';

/* ════════════════════════════════════════════════════════════════
   HELPERS
════════════════════════════════════════════════════════════════ */
function fmtDate(d: string | Date, opts?: Intl.DateTimeFormatOptions) {
    return new Date(d).toLocaleDateString('fr-FR', opts ?? {
        weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
    });
}

function fmtDateTime(d: string | Date) {
    return new Date(d).toLocaleDateString('fr-FR', {
        day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit',
    });
}

function fmtMoney(n: number | string) {
    return Number(n).toLocaleString('fr-FR');
}

/* ── Status config ────────────────────────────────────────────── */
const STATUS_META: Record<string, { label: string; color: string; dot: string; bg: string }> = {
    INITIEE: { label: 'Initiée', color: 'text-slate-400', dot: 'bg-slate-400', bg: 'bg-slate-400/10 border-slate-400/20' },
    EN_ATTENTE_PAIEMENT: { label: 'En attente paiement', color: 'text-amber-400', dot: 'bg-amber-400', bg: 'bg-amber-400/10 border-amber-400/20' },
    PAYEE: { label: 'Payée', color: 'text-blue-400', dot: 'bg-blue-400', bg: 'bg-blue-400/10 border-blue-400/20' },
    CONFIRMEE: { label: 'Confirmée', color: 'text-emerald-400', dot: 'bg-emerald-400', bg: 'bg-emerald-400/10 border-emerald-400/20' },
    EN_COURS: { label: 'En cours', color: 'text-emerald-300', dot: 'bg-emerald-300', bg: 'bg-emerald-300/10 border-emerald-300/20' },
    TERMINEE: { label: 'Terminée', color: 'text-slate-300', dot: 'bg-slate-300', bg: 'bg-slate-300/10 border-slate-300/20' },
    ANNULEE: { label: 'Annulée', color: 'text-red-400', dot: 'bg-red-400', bg: 'bg-red-400/10 border-red-400/20' },
    LITIGE: { label: 'Litige', color: 'text-orange-400', dot: 'bg-orange-400', bg: 'bg-orange-400/10 border-orange-400/20' },
};

/* ── Sub-components ─────────────────────────────────────────── */
function StatusBadge({ statut }: { statut: string }) {
    const m = STATUS_META[statut] ?? STATUS_META.INITIEE;
    return (
        <div className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border text-[12px] font-bold ${m.bg} ${m.color}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${m.dot} ${statut === 'EN_COURS' ? 'animate-pulse' : ''}`} />
            {m.label}
        </div>
    );
}

function DarkCard({ icon: Icon, title, children, className }: {
    icon: React.ElementType; title: string; children: React.ReactNode; className?: string;
}) {
    return (
        <div className={`rounded-2xl bg-slate-900 border border-white/8 p-5 ${className ?? ''}`}>
            <div className="flex items-center gap-2.5 mb-4">
                <div className="w-7 h-7 rounded-lg bg-white/6 border border-white/8 flex items-center justify-center">
                    <Icon className="w-3.5 h-3.5 text-slate-400" strokeWidth={1.75} />
                </div>
                <h3 className="text-[12px] font-black uppercase tracking-widest text-slate-400">{title}</h3>
            </div>
            {children}
        </div>
    );
}

function InfoRow({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
    return (
        <div className="flex items-center justify-between py-2.5 border-b border-white/6 last:border-0">
            <span className="text-[12px] text-slate-500 font-medium">{label}</span>
            <span className={`text-[13px] font-bold tabular-nums ${highlight ? 'text-emerald-400' : 'text-white'}`}>{value}</span>
        </div>
    );
}

/* ════════════════════════════════════════════════════════════════
   PAGE
════════════════════════════════════════════════════════════════ */
interface PageProps {
    params: { id: string };
}

export default async function TenantReservationDetailPage({ params }: PageProps) {
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

    const st = STATUS_META[r.statut] ?? STATUS_META.INITIEE;
    const v = r.vehicule;
    const mainPhoto = v?.photos?.find((p) => p.estPrincipale)?.url ?? v?.photos?.[0]?.url ?? null;

    /* ── Timeline ── */
    const timeline = [
        { label: 'Réservation créée', date: r.creeLe, icon: Clock, color: 'emerald' },
        r.confirmeeLe && { label: 'Confirmée par le propriétaire', date: r.confirmeeLe, icon: CheckCircle2, color: 'emerald' },
        (r.checkInLe ?? legacy.checkinLe) && { label: 'Check-in effectué', date: (r.checkInLe ?? legacy.checkinLe)!, icon: LogIn, color: 'blue' },
        (r.checkOutLe ?? legacy.checkoutLe) && { label: 'Check-out effectué', date: (r.checkOutLe ?? legacy.checkoutLe)!, icon: LogOut, color: 'blue' },
        (r.annuleeLe ?? legacy.annuleLe) && { label: 'Annulée', date: (r.annuleeLe ?? legacy.annuleLe)!, icon: XCircle, color: 'red' },
    ].filter(Boolean) as { label: string; date: string; icon: React.ElementType; color: string }[];

    /* ── Duration (fallback) ── */
    const nbJours = r.nbJours != null
        ? r.nbJours
        : Math.max(1, Math.round((new Date(r.dateFin).getTime() - new Date(r.dateDebut).getTime()) / 86_400_000));

    /* ── Financial ── */
    const totalLocataire = Number(r.prixTotal ?? legacy.totalLocataire ?? 0) || 0;
    const commissionAmount = Number(r.commission ?? legacy.montantCommission ?? 0) || 0;

    return (
        <div className="min-h-screen bg-slate-950 text-white">
            <div className="max-w-5xl mx-auto px-4 py-8 lg:px-8 lg:py-10 space-y-8">

                {/* ── Back ──────────────────────────────────────────── */}
                <Link
                    href="/dashboard/reservations"
                    className="inline-flex items-center gap-2 text-[13px] font-semibold text-slate-400 hover:text-white transition-colors group"
                >
                    <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" strokeWidth={2.5} />
                    Mes réservations
                </Link>

                {/* ── Hero header ───────────────────────────────────── */}
                <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800 border border-white/8 p-6 lg:p-8">
                    {/* Ambient glow */}
                    <div
                        className="absolute top-0 right-0 w-64 h-64 rounded-full opacity-10 blur-3xl pointer-events-none"
                        style={{ background: 'radial-gradient(circle, #34d399, transparent 70%)' }}
                    />

                    <div className="relative z-10 flex flex-col sm:flex-row sm:items-start gap-5 justify-between">
                        <div className="flex gap-4 items-start">
                            {/* Vehicle thumbnail */}
                            <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden bg-black/40 shrink-0 border border-white/10">
                                {mainPhoto ? (
                                    <Image src={mainPhoto} alt={`${v?.marque ?? ''} ${v?.modele ?? ''}`} fill className="object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center">
                                        <Car className="w-8 h-8 text-white/10" />
                                    </div>
                                )}
                            </div>
                            <div className="space-y-2">
                                {/* Vehicle name */}
                                <h1 className="text-[22px] lg:text-[28px] font-black tracking-tight leading-none">
                                    {v?.marque ?? '—'}{' '}
                                    <span className="text-emerald-400">{v?.modele ?? ''}</span>
                                </h1>

                                {/* Metadata row */}
                                <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5">
                                    <span className="flex items-center gap-1.5 text-[12px] font-medium text-slate-400">
                                        <Hash className="w-3 h-3" strokeWidth={2} />
                                        {r.id.slice(0, 8).toUpperCase()}
                                    </span>
                                    {v?.ville && (
                                        <span className="flex items-center gap-1.5 text-[12px] font-medium text-slate-400">
                                            <MapPin className="w-3 h-3" strokeWidth={2} />
                                            {v.ville}
                                        </span>
                                    )}
                                    <span className="flex items-center gap-1.5 text-[12px] font-medium text-slate-400">
                                        <Clock className="w-3 h-3" strokeWidth={1.75} />
                                        Créée le {fmtDate(r.creeLe, { day: 'numeric', month: 'long', year: 'numeric' })}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col items-start sm:items-end gap-3">
                            <StatusBadge statut={r.statut} />
                            {/* Total amount highlight */}
                            <div className="text-right">
                                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-0.5">
                                    Montant total
                                </p>
                                <p className="text-[28px] font-black text-emerald-400 tabular-nums leading-none">
                                    {fmtMoney(totalLocataire)}
                                    <span className="text-[13px] font-semibold text-emerald-400/60 ml-1">FCFA</span>
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Duration bar */}
                    <div className="relative z-10 mt-6 pt-5 border-t border-white/6 flex flex-wrap gap-6">
                        {[
                            { label: 'Début', value: fmtDate(r.dateDebut, { day: 'numeric', month: 'short', year: 'numeric' }) },
                            { label: 'Fin', value: fmtDate(r.dateFin, { day: 'numeric', month: 'short', year: 'numeric' }) },
                            { label: 'Durée', value: `${nbJours} jour${nbJours > 1 ? 's' : ''}` },
                        ].map(item => (
                            <div key={item.label}>
                                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-0.5">{item.label}</p>
                                <p className="text-[14px] font-bold text-white">{item.value}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* ── Actions — check-in / check-out / dispute ──── */}
                <ReservationActions reservationId={r.id} statut={r.statut} role="LOCATAIRE" />

                {/* ── Two-column layout ────────────────────────── */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                    {/* Dates & check-in/out */}
                    <DarkCard icon={Calendar} title="Dates & suivi">
                        <InfoRow label="Date début" value={fmtDate(r.dateDebut, { day: 'numeric', month: 'long', year: 'numeric' })} />
                        <InfoRow label="Date fin" value={fmtDate(r.dateFin, { day: 'numeric', month: 'long', year: 'numeric' })} />
                        <InfoRow label="Durée" value={`${nbJours} jour${nbJours > 1 ? 's' : ''}`} />
                        {r.confirmeeLe && <InfoRow label="Confirmée le" value={fmtDateTime(r.confirmeeLe)} />}
                        {(r.checkInLe ?? legacy.checkinLe) && <InfoRow label="Check-in le" value={fmtDateTime((r.checkInLe ?? legacy.checkinLe)!)} />}
                        {(r.checkOutLe ?? legacy.checkoutLe) && <InfoRow label="Check-out le" value={fmtDateTime((r.checkOutLe ?? legacy.checkoutLe)!)} />}
                    </DarkCard>

                    {/* Financial */}
                    <DarkCard icon={Banknote} title="Détail financier">
                        <InfoRow label="Prix / jour" value={`${fmtMoney(r.prixParJour)} FCFA`} />
                        <InfoRow label="Durée" value={`× ${nbJours} jour${nbJours > 1 ? 's' : ''}`} />
                        <InfoRow label="Total" value={`${fmtMoney(totalLocataire)} FCFA`} highlight />
                        {commissionAmount > 0 && (
                            <InfoRow label="Dont commission" value={`${fmtMoney(commissionAmount)} FCFA`} />
                        )}
                        {r.paiement && (
                            <InfoRow label="Paiement" value={`${r.paiement.fournisseur} — ${r.paiement.statut}`} />
                        )}
                    </DarkCard>
                </div>

                {/* ── Contract ──────────────────────────────────── */}
                {r.contratUrl && (
                    <DarkCard icon={FileText} title="Contrat de location">
                        <div className="flex items-center justify-between">
                            <div className="space-y-1">
                                <p className="text-[13px] font-semibold text-white">Contrat de location</p>
                                <p className="text-[11px] text-slate-500">
                                    Document PDF généré automatiquement. Vous pouvez le consulter ou le télécharger.
                                </p>
                            </div>
                            <a
                                href={`/api/nest/reservations/${r.id}/contrat`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-500/15 border border-blue-500/20 text-[12px] font-bold text-blue-400 hover:bg-blue-500/25 transition-colors shrink-0"
                            >
                                <Download className="w-3.5 h-3.5" strokeWidth={2.5} />
                                Télécharger
                            </a>
                        </div>
                    </DarkCard>
                )}

                {/* ── Timeline ──────────────────────────────────── */}
                <DarkCard icon={Clock} title="Chronologie">
                    <div className="space-y-0 mt-1">
                        {timeline.map((event, i) => {
                            const colorMap: Record<string, string> = {
                                emerald: 'bg-emerald-400/15 border-emerald-400/30 text-emerald-400',
                                blue: 'bg-blue-400/15 border-blue-400/30 text-blue-400',
                                red: 'bg-red-400/15 border-red-400/30 text-red-400',
                            };
                            const lineMap: Record<string, string> = {
                                emerald: 'bg-emerald-400/20',
                                blue: 'bg-blue-400/20',
                                red: 'bg-red-400/20',
                            };
                            const isLast = i === timeline.length - 1;
                            return (
                                <div key={event.label} className="flex gap-4">
                                    {/* Dot + line */}
                                    <div className="flex flex-col items-center flex-shrink-0">
                                        <div className={`w-8 h-8 rounded-full border flex items-center justify-center ${colorMap[event.color]}`}>
                                            <event.icon className="w-3.5 h-3.5" strokeWidth={2} />
                                        </div>
                                        {!isLast && (
                                            <div className={`w-px flex-1 min-h-[28px] my-1 ${lineMap[event.color]}`} />
                                        )}
                                    </div>
                                    {/* Text */}
                                    <div className={`${isLast ? 'pb-0' : 'pb-5'} pt-1`}>
                                        <p className="text-[13px] font-bold text-white leading-none">{event.label}</p>
                                        <p className="text-[11.5px] text-slate-500 mt-1">{fmtDateTime(event.date)}</p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </DarkCard>

                {/* ── Warning if cancelled ──────────────────────── */}
                {r.statut === 'ANNULEE' && (
                    <div className="rounded-2xl bg-red-500/10 border border-red-500/20 px-5 py-4 flex items-start gap-3">
                        <AlertTriangle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" strokeWidth={2} />
                        <div>
                            <p className="text-[13px] font-bold text-red-400">Réservation annulée</p>
                            <p className="text-[12px] text-red-300/60 mt-0.5">
                                Cette réservation a été annulée. Contactez le support si vous avez des questions.
                            </p>
                        </div>
                    </div>
                )}

                {r.statut === 'LITIGE' && (
                    <div className="rounded-2xl bg-orange-500/10 border border-orange-500/20 px-5 py-4 flex items-start gap-3">
                        <AlertTriangle className="w-5 h-5 text-orange-400 shrink-0 mt-0.5" strokeWidth={2} />
                        <div>
                            <p className="text-[13px] font-bold text-orange-400">Litige en cours</p>
                            <p className="text-[12px] text-orange-300/60 mt-0.5">
                                Un litige a été déclaré. Notre équipe examine votre dossier.
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
