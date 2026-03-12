import { cookies } from 'next/headers';
import { redirect, notFound } from 'next/navigation';
import Link from 'next/link';
import { ApiError } from '@/lib/nestjs/api-client';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { fetchReservationById } from '@/lib/nestjs/reservations';
import {
    ArrowLeft, FileText,
    CheckCircle2, Clock, AlertTriangle,
} from 'lucide-react';
import { PrintButton } from './print-button';

/* ════════════════════════════════════════════════════════════════
   HELPERS
════════════════════════════════════════════════════════════════ */
function fmtDate(d: string | Date, opts?: Intl.DateTimeFormatOptions) {
    return new Date(d).toLocaleDateString('fr-FR', opts ?? {
        day: '2-digit', month: 'long', year: 'numeric',
    });
}

function fmtMoney(n: number | string) {
    return Number(n).toLocaleString('fr-FR');
}

/* ── Contract status derived from reservation status ───────── */
type ContractStatus = 'EN_COURS' | 'ACTIF' | 'ANNULE';

function getContractStatus(reservationStatut: string): ContractStatus {
    switch (reservationStatut) {
        case 'INITIEE':
        case 'EN_ATTENTE_PAIEMENT':
        case 'PAYEE':
            return 'EN_COURS';
        case 'CONFIRMEE':
        case 'EN_COURS':
        case 'TERMINEE':
            return 'ACTIF';
        case 'ANNULEE':
            return 'ANNULE';
        default:
            return 'ACTIF';
    }
}

const CONTRACT_STATUS_META: Record<ContractStatus, {
    label: string;
    text: string;
    bg: string;
    border: string;
    dot: string;
    icon: typeof CheckCircle2;
}> = {
    EN_COURS: {
        label: 'En cours',
        text: 'text-amber-700',
        bg: 'bg-amber-50',
        border: 'border-amber-200',
        dot: 'bg-amber-400 animate-pulse',
        icon: Clock,
    },
    ACTIF: {
        label: 'Contrat actif',
        text: 'text-emerald-700',
        bg: 'bg-emerald-50',
        border: 'border-emerald-200',
        dot: 'bg-emerald-500',
        icon: CheckCircle2,
    },
    ANNULE: {
        label: 'Contrat annulé',
        text: 'text-red-700',
        bg: 'bg-red-50',
        border: 'border-red-200',
        dot: 'bg-red-500',
        icon: AlertTriangle,
    },
};

/* ════════════════════════════════════════════════════════════════
   PAGE (Server Component)
════════════════════════════════════════════════════════════════ */
interface PageProps {
    params: { id: string };
}

export default async function ContractPage({ params }: PageProps) {
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
        netProprietaire?: string;
        totalBase?: string;
    };

    /* ── Derived values ── */
    const contractStatus = getContractStatus(r.statut);
    const meta = CONTRACT_STATUS_META[contractStatus];

    const nbJours = r.nbJours != null
        ? r.nbJours
        : Math.max(1, Math.round((new Date(r.dateFin).getTime() - new Date(r.dateDebut).getTime()) / 86_400_000));

    const totalLocataire = Number(r.prixTotal ?? legacy.totalLocataire ?? 0) || 0;
    const commissionAmount = Number(r.commission ?? legacy.montantCommission ?? 0) || 0;
    const totalBase = totalLocataire - commissionAmount;
    const prixParJour = Number(r.prixParJour) || 0;
    const netProprietaire = Number(r.montantProprietaire ?? legacy.netProprietaire ?? 0) || 0;

    const showPhone = contractStatus !== 'EN_COURS';
    const contractDate = fmtDate(r.creeLe);
    const contractRef = r.id.slice(0, 8).toUpperCase();

    return (
        <div className="min-h-screen bg-slate-50/80 print:bg-white print:min-h-0">
            <div className="max-w-4xl mx-auto px-4 py-8 lg:px-8 lg:py-10 space-y-6 print:py-0 print:px-0 print:space-y-0">

                {/* ── Back (hidden in print) ────────────────────── */}
                <Link
                    href={`/dashboard/reservations/${r.id}`}
                    className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-slate-400 hover:text-slate-700 transition-colors group print:hidden"
                >
                    <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" strokeWidth={2.5} />
                    Retour à la réservation
                </Link>

                {/* ── Contract Document ─────────────────────────── */}
                <div className="rounded-2xl bg-white border border-slate-200/80 shadow-sm overflow-hidden print:border-0 print:shadow-none print:rounded-none">

                    {/* ── Header (OVH style) ─────────────────────── */}
                    <div className="px-6 lg:px-8 pt-8 pb-6 border-b border-slate-100">
                        <div className="flex items-start justify-between gap-4">
                            <div>
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center">
                                        <span className="text-white font-black text-[14px]">AL</span>
                                    </div>
                                    <span className="text-[20px] font-black text-blue-700 tracking-tight">AutoLoc</span>
                                </div>
                                <h1 className="text-[18px] lg:text-[20px] font-black text-slate-900 tracking-tight">
                                    Contrat de location
                                </h1>
                                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2">
                                    <p className="text-[12px] text-slate-400 font-medium">
                                        Numéro : <span className="font-bold text-slate-600">{contractRef}</span>
                                    </p>
                                    <p className="text-[12px] text-slate-400 font-medium">
                                        Date : <span className="font-bold text-slate-600">{contractDate}</span>
                                    </p>
                                </div>
                            </div>

                            <div className="flex flex-col items-end gap-3 shrink-0">
                                {/* Status badge */}
                                <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-[11px] font-bold ${meta.bg} ${meta.border} ${meta.text}`}>
                                    <span className={`w-1.5 h-1.5 rounded-full ${meta.dot}`} />
                                    {meta.label}
                                </span>

                                {/* Print button — PDF if available, otherwise window.print() */}
                                <div className="print:hidden">
                                    <PrintButton contratUrl={r.contratUrl} variant="small" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ── Contact info (TOP, like user requested) ── */}
                    <div className="px-6 lg:px-8 py-5 bg-slate-50/60 border-b border-slate-100 print:bg-white">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            {/* Locataire */}
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-widest text-blue-600 mb-2">
                                    Locataire
                                </p>
                                <p className="text-[13px] font-bold text-slate-800">
                                    {r.locataire.prenom} {r.locataire.nom}
                                </p>
                                {showPhone && r.locataire.telephone && (
                                    <p className="text-[12px] text-slate-500 mt-0.5">
                                        Tél : {r.locataire.telephone}
                                    </p>
                                )}
                            </div>

                            {/* Propriétaire */}
                            <div className="sm:text-right">
                                <p className="text-[10px] font-black uppercase tracking-widest text-blue-600 mb-2">
                                    Propriétaire
                                </p>
                                <p className="text-[13px] font-bold text-slate-800">
                                    Propriétaire véhicule
                                </p>
                                <p className="text-[12px] text-slate-500 mt-0.5">
                                    Réf. propriétaire : {r.proprietaireId?.slice(0, 8).toUpperCase() ?? '—'}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* ── Status banner (EN_COURS / ANNULE) ─────── */}
                    {contractStatus === 'EN_COURS' && (
                        <div className="mx-6 lg:mx-8 mt-5 px-4 py-3 rounded-xl bg-amber-50 border border-amber-200 flex items-start gap-3">
                            <Clock className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" strokeWidth={2} />
                            <div>
                                <p className="text-[12px] font-bold text-amber-700">Contrat en cours de validation</p>
                                <p className="text-[11px] text-amber-600/70 mt-0.5">
                                    En attente de la confirmation du propriétaire. Les numéros de téléphone seront visibles après confirmation.
                                </p>
                            </div>
                        </div>
                    )}
                    {contractStatus === 'ANNULE' && (
                        <div className="mx-6 lg:mx-8 mt-5 px-4 py-3 rounded-xl bg-red-50 border border-red-200 flex items-start gap-3">
                            <AlertTriangle className="w-4 h-4 text-red-500 mt-0.5 shrink-0" strokeWidth={2} />
                            <div>
                                <p className="text-[12px] font-bold text-red-700">Contrat annulé</p>
                                <p className="text-[11px] text-red-600/70 mt-0.5">
                                    Cette réservation a été annulée. Le contrat n'est plus valide.
                                </p>
                            </div>
                        </div>
                    )}

                    {/* ── LOCATION table ────────────────────────────── */}
                    <div className="px-6 lg:px-8 pt-6 pb-2">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="bg-blue-700 text-white print:bg-blue-100 print:text-blue-800">
                                        <th className="px-4 py-2.5 text-[11px] font-bold uppercase tracking-widest rounded-tl-lg">Location</th>
                                        <th className="px-4 py-2.5 text-[11px] font-bold uppercase tracking-widest">Véhicule</th>
                                        <th className="px-4 py-2.5 text-[11px] font-bold uppercase tracking-widest text-right">Prix unitaire</th>
                                        <th className="px-4 py-2.5 text-[11px] font-bold uppercase tracking-widest text-center">Quantité</th>
                                        <th className="px-4 py-2.5 text-[11px] font-bold uppercase tracking-widest text-right rounded-tr-lg">Prix HT</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr className="border-b border-slate-100">
                                        <td className="px-4 py-3 text-[12px] text-slate-600 font-medium">
                                            Location véhicule
                                            <span className="block text-[11px] text-slate-400 mt-0.5">
                                                du {fmtDate(r.dateDebut, { day: 'numeric', month: 'short', year: 'numeric' })} au {fmtDate(r.dateFin, { day: 'numeric', month: 'short', year: 'numeric' })}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-[12px] font-bold text-slate-700">
                                            {r.vehicule.marque} {r.vehicule.modele}
                                            {r.vehicule.immatriculation && (
                                                <span className="block text-[11px] font-mono text-slate-400 mt-0.5">
                                                    {r.vehicule.immatriculation}
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-4 py-3 text-[12px] font-bold text-slate-700 text-right tabular-nums">
                                            {fmtMoney(prixParJour)} FCFA
                                        </td>
                                        <td className="px-4 py-3 text-[12px] font-bold text-slate-700 text-center tabular-nums">
                                            {nbJours}
                                        </td>
                                        <td className="px-4 py-3 text-[12px] font-bold text-slate-700 text-right tabular-nums">
                                            {fmtMoney(totalBase)} FCFA
                                        </td>
                                    </tr>

                                    <tr className="bg-slate-50/60">
                                        <td colSpan={4} className="px-4 py-2.5 text-right text-[11px] font-bold uppercase tracking-widest text-slate-400">
                                            Sous-total
                                        </td>
                                        <td className="px-4 py-2.5 text-[12px] font-bold text-slate-700 text-right tabular-nums">
                                            {fmtMoney(totalBase)} FCFA
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* ── SERVICE table ─────────────────────────────── */}
                    <div className="px-6 lg:px-8 py-2">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="bg-blue-700 text-white print:bg-blue-100 print:text-blue-800">
                                        <th className="px-4 py-2.5 text-[11px] font-bold uppercase tracking-widest rounded-tl-lg" colSpan={3}>
                                            Frais de service
                                        </th>
                                        <th className="px-4 py-2.5 text-[11px] font-bold uppercase tracking-widest text-center">Taux</th>
                                        <th className="px-4 py-2.5 text-[11px] font-bold uppercase tracking-widest text-right rounded-tr-lg">Montant</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr className="border-b border-slate-100">
                                        <td colSpan={3} className="px-4 py-3 text-[12px] text-slate-600 font-medium">
                                            Commission plateforme AutoLoc
                                        </td>
                                        <td className="px-4 py-3 text-[12px] font-bold text-slate-700 text-center">
                                            15%
                                        </td>
                                        <td className="px-4 py-3 text-[12px] font-bold text-slate-700 text-right tabular-nums">
                                            {fmtMoney(commissionAmount)} FCFA
                                        </td>
                                    </tr>

                                    <tr className="bg-blue-50 border-t-2 border-blue-200">
                                        <td colSpan={4} className="px-4 py-3 text-right text-[12px] font-black uppercase tracking-widest text-blue-700">
                                            Total TTC
                                        </td>
                                        <td className="px-4 py-3 text-[14px] font-black text-blue-700 text-right tabular-nums">
                                            {fmtMoney(totalLocataire)} FCFA
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* ── Revenue propriétaire info ─────────────────── */}
                    <div className="px-6 lg:px-8 py-3">
                        <div className="flex items-center justify-between px-4 py-3 rounded-xl bg-emerald-50 border border-emerald-200">
                            <span className="text-[12px] font-bold text-emerald-700">
                                Revenu versé au propriétaire
                            </span>
                            <span className="text-[14px] font-black text-emerald-700 tabular-nums">
                                {fmtMoney(netProprietaire)} FCFA
                            </span>
                        </div>
                    </div>

                    {/* ── Conditions ────────────────────────────────── */}
                    <div className="px-6 lg:px-8 py-5 border-t border-slate-100">
                        <h3 className="text-[11px] font-black uppercase tracking-widest text-blue-600 mb-3">
                            Politique d&apos;annulation
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <p className="text-[11px] font-bold text-slate-700 mb-1.5">Par le locataire :</p>
                                <ul className="space-y-1 text-[11px] text-slate-500 leading-relaxed">
                                    <li>• Plus de 5 jours avant : remboursement 100%</li>
                                    <li>• 2 à 5 jours : remboursement 75%</li>
                                    <li>• Moins de 24h : aucun remboursement</li>
                                </ul>
                            </div>
                            <div>
                                <p className="text-[11px] font-bold text-slate-700 mb-1.5">Par le propriétaire :</p>
                                <ul className="space-y-1 text-[11px] text-slate-500 leading-relaxed">
                                    <li>• Plus de 7 jours : remboursement intégral</li>
                                    <li>• 3–7 jours : remboursement + pénalité 20%</li>
                                    <li>• Moins de 3 jours : remboursement + pénalité 40%</li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    {/* ── Conditions générales ──────────────────────── */}
                    <div className="px-6 lg:px-8 py-5 border-t border-slate-100">
                        <h3 className="text-[11px] font-black uppercase tracking-widest text-blue-600 mb-3">
                            Conditions générales
                        </h3>
                        <ol className="space-y-1.5 text-[11px] text-slate-500 leading-relaxed list-decimal list-inside">
                            <li>Le locataire s&apos;engage à utiliser le véhicule en bon père de famille et à le restituer dans l&apos;état initial.</li>
                            <li>Le véhicule doit être restitué à la date et au lieu convenus. Tout retard sera facturé au prix journalier majoré de 50%.</li>
                            <li>Le locataire est responsable de toute infraction au code de la route commise pendant la durée de location.</li>
                            <li>En cas de panne ou d&apos;accident, le locataire doit immédiatement prévenir le propriétaire et la plateforme AutoLoc.</li>
                            <li>Le propriétaire garantit que le véhicule est en bon état, assuré et dispose d&apos;une visite technique valide.</li>
                            <li>Tout litige sera soumis à la médiation de la plateforme AutoLoc avant toute action judiciaire.</li>
                            <li>Le présent contrat est régi par le droit en vigueur au Sénégal.</li>
                        </ol>
                    </div>

                    {/* ── Footer ────────────────────────────────────── */}
                    <div className="px-6 lg:px-8 py-4 bg-slate-50 border-t border-slate-100 text-center print:bg-white">
                        <p className="text-[10px] text-slate-400">
                            AutoLoc — Plateforme de location de véhicules au Sénégal. Ce contrat est généré automatiquement et fait office de preuve de la réservation.
                        </p>
                    </div>
                </div>

                {/* ── Bottom actions (hidden in print) ──────────── */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 print:hidden">
                    <PrintButton contratUrl={r.contratUrl} variant="large" />
                    <Link
                        href={`/dashboard/reservations/${r.id}`}
                        className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl border border-slate-200 bg-white text-[13px] font-semibold text-slate-700 hover:bg-slate-50 transition-all"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Détails de la réservation
                    </Link>
                </div>

            </div>
        </div>
    );
}
