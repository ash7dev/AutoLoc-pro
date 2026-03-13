import Image from 'next/image';
import { cookies } from 'next/headers';
import { redirect, notFound } from 'next/navigation';
import Link from 'next/link';
import { ApiError } from '@/lib/nestjs/api-client';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { fetchReservationById } from '@/lib/nestjs/reservations';
import {
    ArrowLeft,
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
    searchParams?: { from?: string };
}

export default async function ContractPage({ params, searchParams }: PageProps) {
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
    const isOwner = searchParams?.from === 'owner';
    const backHref = isOwner ? `/dashboard/owner/reservations/${r.id}` : `/dashboard/reservations/${r.id}`;

    return (
        <div className="min-h-screen bg-slate-50/80 print:bg-white print:min-h-0">
            <div className="max-w-4xl mx-auto px-4 py-8 lg:px-8 lg:py-10 space-y-6 print:py-0 print:px-0 print:space-y-0">

                {/* ── Back ─────────────────────────────────────── */}
                <Link
                    href={backHref}
                    className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-slate-400 hover:text-slate-700 transition-colors group print:hidden"
                >
                    <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" strokeWidth={2.5} />
                    Retour à la réservation
                </Link>

                {/* ── Contract Document ─────────────────────────── */}
                <div className="rounded-2xl bg-white border border-slate-200/80 shadow-sm overflow-hidden print:border-0 print:shadow-none print:rounded-none">

                    {/* ── Header ─────────────────────────────────── */}
                    <div className="px-6 lg:px-8 pt-8 pb-6 border-b border-slate-100">
                        {/* Emerald top accent bar */}
                        <div className="absolute left-0 top-0 w-1 h-full bg-emerald-500 rounded-l-2xl hidden" />

                        <div className="flex items-start justify-between gap-4">
                            <div>
                                {/* Logo */}
                                <div className="flex items-center gap-3 mb-5">
                                    <Image
                                        src="/logoAutoLoc.jpg"
                                        alt="AutoLoc"
                                        width={120}
                                        height={36}
                                        className="h-9 w-auto object-contain"
                                        priority
                                    />
                                </div>

                                <h1 className="text-[18px] lg:text-[20px] font-black text-slate-900 tracking-tight">
                                    Contrat de location de véhicule
                                </h1>
                                <div className="flex flex-wrap items-center gap-x-5 gap-y-1 mt-2">
                                    <p className="text-[12px] text-slate-400 font-medium">
                                        Référence : <span className="font-bold text-slate-600">{contractRef}</span>
                                    </p>
                                    <p className="text-[12px] text-slate-400 font-medium">
                                        Établi le : <span className="font-bold text-slate-600">{contractDate}</span>
                                    </p>
                                </div>
                            </div>

                            <div className="flex flex-col items-end gap-3 shrink-0">
                                {/* Status badge */}
                                <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-[11px] font-bold ${meta.bg} ${meta.border} ${meta.text}`}>
                                    <span className={`w-1.5 h-1.5 rounded-full ${meta.dot}`} />
                                    {meta.label}
                                </span>

                                <div className="print:hidden">
                                    <PrintButton reservationId={r.id} variant="small" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ── Parties ──────────────────────────────────── */}
                    <div className="px-6 lg:px-8 py-5 bg-slate-50/60 border-b border-slate-100 print:bg-white">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            {/* Locataire */}
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-widest text-emerald-600 mb-2">
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
                                <p className="text-[10px] font-black uppercase tracking-widest text-emerald-600 mb-2">
                                    Propriétaire
                                </p>
                                <p className="text-[13px] font-bold text-slate-800">
                                    Propriétaire véhicule
                                </p>
                                <p className="text-[12px] text-slate-500 mt-0.5">
                                    Réf. : {r.proprietaireId?.slice(0, 8).toUpperCase() ?? '—'}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* ── Status banners ───────────────────────────── */}
                    {contractStatus === 'EN_COURS' && (
                        <div className="mx-6 lg:mx-8 mt-5 px-4 py-3 rounded-xl bg-amber-50 border border-amber-200 flex items-start gap-3">
                            <Clock className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" strokeWidth={2} />
                            <div>
                                <p className="text-[12px] font-bold text-amber-700">Contrat en cours de validation</p>
                                <p className="text-[11px] text-amber-600/80 mt-0.5 leading-relaxed">
                                    En attente de la confirmation du propriétaire. Les numéros de téléphone seront visibles après confirmation.
                                </p>
                            </div>
                        </div>
                    )}
                    {contractStatus === 'ANNULE' && (
                        <div className="mx-6 lg:mx-8 mt-5 px-4 py-3 rounded-xl bg-red-50 border border-red-200 flex items-start gap-3">
                            <AlertTriangle className="w-4 h-4 text-red-500 mt-0.5 shrink-0" strokeWidth={2} />
                            <div>
                                <p className="text-[12px] font-bold text-red-700">Contrat résilié</p>
                                <p className="text-[11px] text-red-600/80 mt-0.5 leading-relaxed">
                                    {r.raisonAnnulation
                                        ? r.raisonAnnulation
                                        : 'Cette réservation a été annulée. Le contrat n\'est plus en vigueur.'}
                                    {r.annuleeLe && (
                                        <span className="ml-1 font-medium">
                                            — le {fmtDate(r.annuleeLe, { day: 'numeric', month: 'long', year: 'numeric' })}.
                                        </span>
                                    )}
                                </p>
                            </div>
                        </div>
                    )}

                    {/* ── Location table ────────────────────────────── */}
                    <div className="px-6 lg:px-8 pt-6 pb-2">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="bg-emerald-700 text-white print:bg-emerald-100 print:text-emerald-800">
                                        <th className="px-4 py-2.5 text-[11px] font-bold uppercase tracking-widest rounded-tl-lg">Location</th>
                                        <th className="px-4 py-2.5 text-[11px] font-bold uppercase tracking-widest">Véhicule</th>
                                        <th className="px-4 py-2.5 text-[11px] font-bold uppercase tracking-widest text-right">Prix / jour</th>
                                        <th className="px-4 py-2.5 text-[11px] font-bold uppercase tracking-widest text-center">Jours</th>
                                        <th className="px-4 py-2.5 text-[11px] font-bold uppercase tracking-widest text-right rounded-tr-lg">Sous-total</th>
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

                    {/* ── Service table ─────────────────────────────── */}
                    <div className="px-6 lg:px-8 py-2">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="bg-emerald-700 text-white print:bg-emerald-100 print:text-emerald-800">
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
                                            15 %
                                        </td>
                                        <td className="px-4 py-3 text-[12px] font-bold text-slate-700 text-right tabular-nums">
                                            {fmtMoney(commissionAmount)} FCFA
                                        </td>
                                    </tr>

                                    <tr className="bg-emerald-50 border-t-2 border-emerald-200">
                                        <td colSpan={4} className="px-4 py-3 text-right text-[12px] font-black uppercase tracking-widest text-emerald-700">
                                            Total réglé par le locataire
                                        </td>
                                        <td className="px-4 py-3 text-[16px] font-black text-emerald-700 text-right tabular-nums">
                                            {fmtMoney(totalLocataire)} FCFA
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* ── Revenu propriétaire ───────────────────────── */}
                    <div className="px-6 lg:px-8 py-3">
                        <div className="flex items-center justify-between px-4 py-3.5 rounded-xl bg-emerald-50 border border-emerald-200">
                            <span className="text-[12px] font-bold text-emerald-700">
                                Revenu net versé au propriétaire
                            </span>
                            <span className="text-[16px] font-black text-emerald-700 tabular-nums">
                                {fmtMoney(netProprietaire)} FCFA
                            </span>
                        </div>
                    </div>

                    {/* ── Politique d'annulation ────────────────────── */}
                    <div className="px-6 lg:px-8 py-5 border-t border-slate-100">
                        <h3 className="text-[11px] font-black uppercase tracking-widest text-emerald-600 mb-4">
                            Politique d&apos;annulation
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                                <p className="text-[11px] font-black text-slate-700 mb-3 uppercase tracking-wide">
                                    Annulation par le locataire
                                </p>
                                <div className="space-y-2.5 text-[11px] text-slate-600 leading-relaxed">
                                    <p>
                                        <span className="font-semibold text-slate-700">Plus de 5 jours avant le début :</span>{' '}
                                        le locataire est remboursé intégralement du montant versé, déduction faite des frais de service AutoLoc.
                                    </p>
                                    <p>
                                        <span className="font-semibold text-slate-700">Entre 2 et 5 jours avant le début :</span>{' '}
                                        le remboursement s&apos;élève à 75 % du montant total réglé. Les 25 % restants sont retenus à titre d&apos;indemnisation.
                                    </p>
                                    <p>
                                        <span className="font-semibold text-slate-700">Moins de 24 heures avant le début :</span>{' '}
                                        aucun remboursement ne peut être accordé. Le montant intégral est acquis.
                                    </p>
                                </div>
                            </div>
                            <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                                <p className="text-[11px] font-black text-slate-700 mb-3 uppercase tracking-wide">
                                    Annulation par le propriétaire
                                </p>
                                <div className="space-y-2.5 text-[11px] text-slate-600 leading-relaxed">
                                    <p>
                                        <span className="font-semibold text-slate-700">Plus de 7 jours avant le début :</span>{' '}
                                        le locataire est remboursé intégralement, sans pénalité pour le propriétaire.
                                    </p>
                                    <p>
                                        <span className="font-semibold text-slate-700">Entre 3 et 7 jours avant le début :</span>{' '}
                                        en plus du remboursement intégral du locataire, une pénalité de 20 % est appliquée au propriétaire.
                                    </p>
                                    <p>
                                        <span className="font-semibold text-slate-700">Moins de 3 jours avant le début :</span>{' '}
                                        le locataire est remboursé et une pénalité de 40 % est mise à la charge du propriétaire.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ── Conditions générales ──────────────────────── */}
                    <div className="px-6 lg:px-8 py-5 border-t border-slate-100">
                        <h3 className="text-[11px] font-black uppercase tracking-widest text-emerald-600 mb-3">
                            Conditions générales
                        </h3>
                        <ol className="space-y-1.5 text-[11px] text-slate-500 leading-relaxed list-decimal list-inside">
                            <li>Le locataire s&apos;engage à utiliser le véhicule en bon père de famille et à le restituer dans l&apos;état initial.</li>
                            <li>Le véhicule doit être restitué à la date et au lieu convenus. Tout retard sera facturé au prix journalier majoré de 50 %.</li>
                            <li>Le locataire est responsable de toute infraction au code de la route commise pendant la durée de la location.</li>
                            <li>En cas de panne ou d&apos;accident, le locataire doit immédiatement prévenir le propriétaire et la plateforme AutoLoc.</li>
                            <li>Le propriétaire garantit que le véhicule est en bon état, assuré et dispose d&apos;une visite technique valide.</li>
                            <li>Tout litige sera soumis à la médiation de la plateforme AutoLoc avant toute action judiciaire.</li>
                            <li>Le présent contrat est régi par le droit en vigueur au Sénégal.</li>
                        </ol>
                    </div>

                    {/* ── Signatures placeholder ────────────────────── */}
                    <div className="px-6 lg:px-8 py-5 border-t border-slate-100">
                        <h3 className="text-[11px] font-black uppercase tracking-widest text-emerald-600 mb-4">
                            Signatures
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {[
                                { role: 'LE LOCATAIRE', name: `${r.locataire.prenom} ${r.locataire.nom}` },
                                { role: 'LE PROPRIÉTAIRE', name: 'Propriétaire véhicule' },
                            ].map(({ role, name }) => (
                                <div key={role} className="rounded-xl border border-slate-200 overflow-hidden">
                                    {/* Accent bar */}
                                    <div className="h-1 bg-emerald-500 w-full" />
                                    <div className="p-4">
                                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">{role}</p>
                                        <p className="text-[13px] font-bold text-slate-800 mb-1">{name}</p>
                                        <p className="text-[10px] text-slate-400 mb-4">Lu et approuvé — Bon pour accord</p>
                                        <div className="flex gap-3">
                                            <div className="flex-1 border border-dashed border-slate-300 rounded-lg bg-slate-50 h-12 flex items-end p-2">
                                                <span className="text-[10px] text-slate-400">Signature</span>
                                            </div>
                                            <div className="w-28 border border-dashed border-slate-300 rounded-lg bg-slate-50 h-12 flex items-end p-2">
                                                <span className="text-[10px] text-slate-400">Date</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* ── Footer ────────────────────────────────────── */}
                    <div className="px-6 lg:px-8 py-4 bg-slate-50 border-t border-slate-100 text-center print:bg-white">
                        <p className="text-[10px] text-slate-400">
                            AutoLoc — Plateforme de location de véhicules entre particuliers au Sénégal · Réf. {contractRef} · {contractDate}
                        </p>
                    </div>
                </div>

                {/* ── Bottom actions ────────────────────────────── */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 print:hidden">
                    <PrintButton reservationId={r.id} variant="large" />
                    <Link
                        href={backHref}
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
