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
    AlertTriangle,
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

/* ── Status config (light theme) ─────────────────────────────── */
const STATUS_META: Record<string, { label: string; text: string; bg: string; dot: string }> = {
    INITIEE: { label: 'Initiée', text: 'text-slate-600', bg: 'bg-slate-100 border-slate-200', dot: 'bg-slate-400' },
    EN_ATTENTE_PAIEMENT: { label: 'En attente paiement', text: 'text-amber-700', bg: 'bg-amber-50 border-amber-200', dot: 'bg-amber-400' },
    PAYEE: { label: 'Payée', text: 'text-blue-700', bg: 'bg-blue-50 border-blue-200', dot: 'bg-blue-400' },
    CONFIRMEE: { label: 'Confirmée', text: 'text-emerald-700', bg: 'bg-emerald-50 border-emerald-200', dot: 'bg-emerald-500' },
    EN_COURS: { label: 'En cours', text: 'text-emerald-700', bg: 'bg-emerald-50 border-emerald-200', dot: 'bg-emerald-500' },
    TERMINEE: { label: 'Terminée', text: 'text-slate-600', bg: 'bg-slate-100 border-slate-200', dot: 'bg-slate-400' },
    ANNULEE: { label: 'Annulée', text: 'text-red-700', bg: 'bg-red-50 border-red-200', dot: 'bg-red-500' },
    LITIGE: { label: 'Litige', text: 'text-orange-700', bg: 'bg-orange-50 border-orange-200', dot: 'bg-orange-500' },
};

/* ── Sub-components ─────────────────────────────────────────── */
function StatusBadge({ statut }: { statut: string }) {
    const m = STATUS_META[statut] ?? STATUS_META.INITIEE;
    return (
        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-[11px] font-bold ${m.bg} ${m.text}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${m.dot} ${statut === 'EN_COURS' ? 'animate-pulse' : ''}`} />
            {m.label}
        </span>
    );
}

function Card({ icon: Icon, title, children, className }: {
    icon: React.ElementType; title: string; children: React.ReactNode; className?: string;
}) {
    return (
        <div className={`rounded-2xl bg-white border border-slate-200/80 shadow-sm ${className ?? ''}`}>
            <div className="flex items-center gap-2.5 px-5 py-3.5 border-b border-slate-100">
                <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center">
                    <Icon className="w-3.5 h-3.5 text-slate-500" strokeWidth={1.75} />
                </div>
                <h3 className="text-[11px] font-black uppercase tracking-widest text-slate-400">{title}</h3>
            </div>
            <div className="px-5 py-4">{children}</div>
        </div>
    );
}

function InfoRow({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
    return (
        <div className="flex items-center justify-between py-2.5 border-b border-slate-100 last:border-0">
            <span className="text-[12px] text-slate-400 font-medium">{label}</span>
            <span className={`text-[13px] font-bold tabular-nums ${highlight ? 'text-emerald-600' : 'text-slate-800'}`}>{value}</span>
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

    const v = r.vehicule;
    const mainPhoto = v?.photos?.find((p) => p.estPrincipale)?.url ?? v?.photos?.[0]?.url ?? null;

    /* ── Timeline ── */
    const timeline = [
        { label: 'Réservation créée', date: r.creeLe, icon: Clock, color: 'slate' },
        r.confirmeeLe && { label: 'Confirmée par le propriétaire', date: r.confirmeeLe, icon: CheckCircle2, color: 'emerald' },
        (r.checkInLe ?? legacy.checkinLe) && { label: 'Check-in effectué', date: (r.checkInLe ?? legacy.checkinLe)!, icon: LogIn, color: 'blue' },
        (r.checkOutLe ?? legacy.checkoutLe) && { label: 'Check-out effectué', date: (r.checkOutLe ?? legacy.checkoutLe)!, icon: LogOut, color: 'blue' },
        (r.annuleeLe ?? legacy.annuleLe) && { label: 'Annulée', date: (r.annuleeLe ?? legacy.annuleLe)!, icon: XCircle, color: 'red' },
    ].filter(Boolean) as { label: string; date: string; icon: React.ElementType; color: string }[];

    /* ── Duration ── */
    const nbJours = r.nbJours != null
        ? r.nbJours
        : Math.max(1, Math.round((new Date(r.dateFin).getTime() - new Date(r.dateDebut).getTime()) / 86_400_000));

    /* ── Financial ── */
    const totalLocataire = Number(r.prixTotal ?? legacy.totalLocataire ?? 0) || 0;
    const commissionAmount = Number(r.commission ?? legacy.montantCommission ?? 0) || 0;

    return (
        <div className="min-h-screen bg-slate-50/80">
            <div className="max-w-5xl mx-auto px-4 py-8 lg:px-8 lg:py-10 space-y-6">

                {/* ── Back ──────────────────────────────────────────── */}
                <Link
                    href="/dashboard/reservations"
                    className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-slate-400 hover:text-slate-700 transition-colors group"
                >
                    <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" strokeWidth={2.5} />
                    Mes réservations
                </Link>

                {/* ── Hero header ───────────────────────────────────── */}
                <div className="rounded-2xl bg-white border border-slate-200/80 shadow-sm overflow-hidden">
                    <div className="p-6 lg:p-8">
                        <div className="flex flex-col sm:flex-row sm:items-start gap-5 justify-between">
                            <div className="flex gap-4 items-start">
                                {/* Vehicle thumbnail */}
                                <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden bg-slate-100 shrink-0 border border-slate-200">
                                    {mainPhoto ? (
                                        <Image src={mainPhoto} alt={`${v?.marque ?? ''} ${v?.modele ?? ''}`} fill className="object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center">
                                            <Car className="w-8 h-8 text-slate-300" />
                                        </div>
                                    )}
                                </div>
                                <div className="space-y-1.5">
                                    <h1 className="text-xl lg:text-2xl font-black text-slate-900 tracking-tight leading-tight">
                                        {v?.marque ?? '—'} {v?.modele ?? ''}
                                    </h1>
                                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                                        <span className="flex items-center gap-1 text-[11px] font-medium text-slate-400">
                                            <Hash className="w-3 h-3" strokeWidth={2} />
                                            {r.id.slice(0, 8).toUpperCase()}
                                        </span>
                                        {v?.ville && (
                                            <span className="flex items-center gap-1 text-[11px] font-medium text-slate-400">
                                                <MapPin className="w-3 h-3" strokeWidth={2} />
                                                {v.ville}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-col items-start sm:items-end gap-2">
                                <StatusBadge statut={r.statut} />
                                <div className="text-right">
                                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Montant total</p>
                                    <p className="text-2xl font-black text-emerald-600 tabular-nums leading-tight">
                                        {fmtMoney(totalLocataire)}
                                        <span className="text-xs font-semibold text-emerald-600/50 ml-1">FCFA</span>
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Duration bar */}
                    <div className="px-6 lg:px-8 py-4 bg-slate-50 border-t border-slate-100 flex flex-wrap gap-8">
                        {[
                            { label: 'Début', value: fmtDate(r.dateDebut, { day: 'numeric', month: 'short', year: 'numeric' }), icon: LogIn },
                            { label: 'Fin', value: fmtDate(r.dateFin, { day: 'numeric', month: 'short', year: 'numeric' }), icon: LogOut },
                            { label: 'Durée', value: `${nbJours} jour${nbJours > 1 ? 's' : ''}`, icon: Calendar },
                        ].map(item => (
                            <div key={item.label} className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center">
                                    <item.icon className="w-3.5 h-3.5 text-slate-400" strokeWidth={1.75} />
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{item.label}</p>
                                    <p className="text-[13px] font-bold text-slate-700">{item.value}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* ── Actions — check-in / check-out / dispute ──── */}
                <ReservationActions reservationId={r.id} statut={r.statut} role="LOCATAIRE" />

                {/* ── Two-column layout ────────────────────────── */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

                    {/* Dates & suivi */}
                    <Card icon={Calendar} title="Dates & suivi">
                        <InfoRow label="Date début" value={fmtDate(r.dateDebut, { day: 'numeric', month: 'long', year: 'numeric' })} />
                        <InfoRow label="Date fin" value={fmtDate(r.dateFin, { day: 'numeric', month: 'long', year: 'numeric' })} />
                        <InfoRow label="Durée" value={`${nbJours} jour${nbJours > 1 ? 's' : ''}`} />
                        {r.confirmeeLe && <InfoRow label="Confirmée le" value={fmtDateTime(r.confirmeeLe)} />}
                        {(r.checkInLe ?? legacy.checkinLe) && <InfoRow label="Check-in" value={fmtDateTime((r.checkInLe ?? legacy.checkinLe)!)} />}
                        {(r.checkOutLe ?? legacy.checkoutLe) && <InfoRow label="Check-out" value={fmtDateTime((r.checkOutLe ?? legacy.checkoutLe)!)} />}
                    </Card>

                    {/* Financial */}
                    <Card icon={Banknote} title="Détail financier">
                        <InfoRow label="Prix / jour" value={`${fmtMoney(r.prixParJour)} FCFA`} />
                        <InfoRow label="Durée" value={`× ${nbJours} jour${nbJours > 1 ? 's' : ''}`} />
                        <InfoRow label="Total" value={`${fmtMoney(totalLocataire)} FCFA`} highlight />
                        {commissionAmount > 0 && (
                            <InfoRow label="Dont commission" value={`${fmtMoney(commissionAmount)} FCFA`} />
                        )}
                        {r.paiement && (
                            <InfoRow label="Paiement" value={`${r.paiement.fournisseur} — ${r.paiement.statut}`} />
                        )}
                    </Card>
                </div>

                {/* ── Contract ──────────────────────────────────── */}
                {r.contratUrl && (
                    <div className="rounded-2xl bg-white border border-slate-200/80 shadow-sm px-5 py-4 flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0">
                            <FileText className="w-5 h-5 text-blue-500" strokeWidth={1.75} />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-[13px] font-bold text-slate-800">Contrat de location</p>
                            <p className="text-[11px] text-slate-400 mt-0.5">PDF · Généré automatiquement</p>
                        </div>
                        <a
                            href={`/api/nest/reservations/${r.id}/contrat`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-50 border border-blue-200 text-[12px] font-bold text-blue-600 hover:bg-blue-100 transition-colors shrink-0"
                        >
                            <Download className="w-3.5 h-3.5" strokeWidth={2.5} />
                            Télécharger
                        </a>
                    </div>
                )}

                {/* ── Timeline ──────────────────────────────────── */}
                <Card icon={Clock} title="Chronologie">
                    <div className="space-y-0">
                        {timeline.map((event, i) => {
                            const colorMap: Record<string, string> = {
                                slate: 'bg-slate-100 border-slate-200 text-slate-500',
                                emerald: 'bg-emerald-50 border-emerald-200 text-emerald-600',
                                blue: 'bg-blue-50 border-blue-200 text-blue-600',
                                red: 'bg-red-50 border-red-200 text-red-500',
                            };
                            const lineMap: Record<string, string> = {
                                slate: 'bg-slate-200',
                                emerald: 'bg-emerald-200',
                                blue: 'bg-blue-200',
                                red: 'bg-red-200',
                            };
                            const isLast = i === timeline.length - 1;
                            return (
                                <div key={event.label} className="flex gap-4">
                                    <div className="flex flex-col items-center shrink-0">
                                        <div className={`w-8 h-8 rounded-full border flex items-center justify-center ${colorMap[event.color]}`}>
                                            <event.icon className="w-3.5 h-3.5" strokeWidth={2} />
                                        </div>
                                        {!isLast && (
                                            <div className={`w-px flex-1 min-h-[24px] my-1 ${lineMap[event.color]}`} />
                                        )}
                                    </div>
                                    <div className={`${isLast ? 'pb-0' : 'pb-4'} pt-1`}>
                                        <p className="text-[13px] font-bold text-slate-800 leading-none">{event.label}</p>
                                        <p className="text-[11px] text-slate-400 mt-1">{fmtDateTime(event.date)}</p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </Card>

                {/* ── Status alerts ─────────────────────────────── */}
                {r.statut === 'ANNULEE' && (
                    <div className="rounded-2xl bg-red-50 border border-red-200 px-5 py-4 flex items-start gap-3">
                        <AlertTriangle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" strokeWidth={2} />
                        <div>
                            <p className="text-[13px] font-bold text-red-700">Réservation annulée</p>
                            <p className="text-[12px] text-red-500/80 mt-0.5">
                                Cette réservation a été annulée. Contactez le support si vous avez des questions.
                            </p>
                        </div>
                    </div>
                )}
                {r.statut === 'LITIGE' && (
                    <div className="rounded-2xl bg-orange-50 border border-orange-200 px-5 py-4 flex items-start gap-3">
                        <AlertTriangle className="w-5 h-5 text-orange-500 shrink-0 mt-0.5" strokeWidth={2} />
                        <div>
                            <p className="text-[13px] font-bold text-orange-700">Litige en cours</p>
                            <p className="text-[12px] text-orange-500/80 mt-0.5">
                                Un litige a été déclaré. Notre équipe examine votre dossier.
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
