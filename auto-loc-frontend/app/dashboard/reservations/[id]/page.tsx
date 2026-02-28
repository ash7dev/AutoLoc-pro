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
    CheckCircle2, LogIn, LogOut, User,
    Download, Hash, MapPin,
} from 'lucide-react';

/* ────────────────────────────────────────────────────────────── */
function fmtDate(d: string | Date) {
    return new Date(d).toLocaleDateString('fr-FR', {
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

const STATUS_META: Record<string, { label: string; color: string; bg: string }> = {
    INITIEE: { label: 'Initiée', color: 'text-slate-400', bg: 'bg-slate-400/10 border-slate-400/20' },
    EN_ATTENTE_PAIEMENT: { label: 'En attente paiement', color: 'text-amber-400', bg: 'bg-amber-400/10 border-amber-400/20' },
    PAYEE: { label: 'Payée', color: 'text-blue-400', bg: 'bg-blue-400/10 border-blue-400/20' },
    CONFIRMEE: { label: 'Confirmée', color: 'text-emerald-400', bg: 'bg-emerald-400/10 border-emerald-400/20' },
    EN_COURS: { label: 'En cours', color: 'text-emerald-300', bg: 'bg-emerald-300/10 border-emerald-300/20' },
    TERMINEE: { label: 'Terminée', color: 'text-slate-300', bg: 'bg-slate-300/10 border-slate-300/20' },
    ANNULEE: { label: 'Annulée', color: 'text-red-400', bg: 'bg-red-400/10 border-red-400/20' },
    LITIGE: { label: 'Litige', color: 'text-orange-400', bg: 'bg-orange-400/10 border-orange-400/20' },
};

function DarkCard({ title, icon: Icon, children }: {
    title: string; icon: React.ElementType; children: React.ReactNode;
}) {
    return (
        <div className="rounded-xl border border-white/[0.06] bg-white/[0.02]">
            <div className="flex items-center gap-2 px-5 py-3.5 border-b border-white/[0.06]">
                <Icon className="w-4 h-4 text-white/30" strokeWidth={1.8} />
                <h3 className="text-[13px] font-bold text-white/70">{title}</h3>
            </div>
            <div className="px-5 py-4">{children}</div>
        </div>
    );
}

function InfoRow({ label, value, icon: Icon }: { label: string; value: string; icon?: React.ElementType }) {
    return (
        <div className="flex items-center justify-between py-2.5 border-b border-white/[0.04] last:border-0">
            <span className="flex items-center gap-2 text-xs text-white/40">
                {Icon && <Icon className="w-3.5 h-3.5" strokeWidth={1.8} />}
                {label}
            </span>
            <span className="text-xs font-semibold text-white/70">{value}</span>
        </div>
    );
}

/* ════════════════════════════════════════════════════════════════ */

interface PageProps {
    params: { id: string };
}

export default async function TenantReservationDetailPage({ params }: PageProps) {
    const nestToken = cookies().get('nest_access')?.value ?? null;
    let token: string | null = nestToken;
    if (!token) {
        const supabase = createSupabaseServerClient();
        const { data } = await supabase.auth.getSession();
        token = data.session?.access_token ?? null;
    }
    if (!token) redirect('/login');

    let reservation;
    try {
        reservation = await fetchReservationById(token, params.id);
    } catch (err) {
        if (err instanceof ApiError && err.status === 404) notFound();
        if (err instanceof ApiError && err.status === 401) redirect('/login?expired=1');
        throw err;
    }

    const st = STATUS_META[reservation.statut] ?? STATUS_META.INITIEE;
    const v = reservation.vehicule;
    const mainPhoto = v?.photos?.find((p) => p.estPrincipale)?.url ?? v?.photos?.[0]?.url ?? null;

    // Determine if check-in is actionable for tenant
    const canCheckin = reservation.statut === 'CONFIRMEE';
    const canCheckout = reservation.statut === 'EN_COURS';

    return (
        <div className="flex flex-col gap-6 p-4 md:p-6 max-w-4xl mx-auto">
            {/* Back */}
            <Link
                href="/dashboard/reservations"
                className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-white/40 hover:text-white/70 transition-colors self-start"
            >
                <ArrowLeft className="w-4 h-4" strokeWidth={2.5} />
                Mes réservations
            </Link>

            {/* Hero card */}
            <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] overflow-hidden">
                <div className="flex flex-col sm:flex-row">
                    {/* Vehicle photo */}
                    <div className="relative w-full sm:w-[280px] h-[180px] sm:h-auto shrink-0 bg-black/40">
                        {mainPhoto ? (
                            <Image src={mainPhoto} alt={`${v?.marque ?? ''} ${v?.modele ?? ''}`} fill className="object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center">
                                <Car className="w-10 h-10 text-white/10" />
                            </div>
                        )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 p-5 space-y-3">
                        <div className="flex items-start justify-between gap-3">
                            <div>
                                <h1 className="text-lg font-black text-white">
                                    {v?.marque ?? '—'} {v?.modele ?? ''}
                                </h1>
                                <p className="text-xs text-white/40 mt-0.5">
                                    {v?.ville && <><MapPin className="w-3 h-3 inline mr-1" />{v.ville}</>}
                                    {v?.annee && ` · ${v.annee}`}
                                </p>
                            </div>
                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold border shrink-0 ${st.bg} ${st.color}`}>
                                {st.label}
                            </span>
                        </div>

                        <div className="text-2xl font-black text-emerald-400">
                            {fmtMoney(reservation.prixTotal)} <span className="text-sm font-normal text-white/30">FCFA</span>
                        </div>

                        <p className="text-[10px] text-white/30 font-mono">
                            Réf: {reservation.id.slice(0, 8).toUpperCase()}
                        </p>
                    </div>
                </div>
            </div>

            {/* Actions — check-in / check-out / dispute */}
            <ReservationActions reservationId={reservation.id} statut={reservation.statut} role="LOCATAIRE" />

            {/* Info grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Dates */}
                <DarkCard title="Dates" icon={Calendar}>
                    <InfoRow label="Début" value={fmtDate(reservation.dateDebut)} icon={LogIn} />
                    <InfoRow label="Fin" value={fmtDate(reservation.dateFin)} icon={LogOut} />
                    <InfoRow label="Durée" value={`${reservation.nbJours} jour${reservation.nbJours > 1 ? 's' : ''}`} icon={Clock} />
                    {reservation.confirmeeLe && (
                        <InfoRow label="Confirmée le" value={fmtDateTime(reservation.confirmeeLe)} icon={CheckCircle2} />
                    )}
                    {reservation.checkInLe && (
                        <InfoRow label="Check-in le" value={fmtDateTime(reservation.checkInLe)} icon={LogIn} />
                    )}
                    {reservation.checkOutLe && (
                        <InfoRow label="Check-out le" value={fmtDateTime(reservation.checkOutLe)} icon={LogOut} />
                    )}
                </DarkCard>

                {/* Financier */}
                <DarkCard title="Détail financier" icon={Banknote}>
                    <InfoRow label="Prix / jour" value={`${fmtMoney(reservation.prixParJour)} FCFA`} />
                    <InfoRow label="Total" value={`${fmtMoney(reservation.prixTotal)} FCFA`} />
                    <InfoRow label="Commission" value={`${fmtMoney(reservation.commission)} FCFA`} />
                    {reservation.paiement && (
                        <InfoRow label="Paiement" value={`${reservation.paiement.fournisseur} — ${reservation.paiement.statut}`} />
                    )}
                </DarkCard>
            </div>

            {/* Contract download */}
            {reservation.contratUrl && (
                <a
                    href={`/api/nest/reservations/${reservation.id}/contrat`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 self-start px-5 py-3 rounded-xl bg-white/5 border border-white/10 text-sm font-semibold text-white/70 hover:text-white hover:border-white/20 transition-all"
                >
                    <Download className="w-4 h-4" />
                    Télécharger le contrat
                </a>
            )}
        </div>
    );
}
