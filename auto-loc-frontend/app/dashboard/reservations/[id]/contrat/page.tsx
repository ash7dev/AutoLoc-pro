import Image from 'next/image';
import { cookies } from 'next/headers';
import { redirect, notFound } from 'next/navigation';
import Link from 'next/link';
import { ApiError } from '@/lib/nestjs/api-client';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { fetchReservationById } from '@/lib/nestjs/reservations';
import { ArrowLeft, CheckCircle2, Clock, AlertTriangle } from 'lucide-react';
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

type ContractStatus = 'EN_COURS' | 'ACTIF' | 'ANNULE';

function getContractStatus(s: string): ContractStatus {
    if (['CONFIRMEE', 'EN_COURS', 'TERMINEE'].includes(s)) return 'ACTIF';
    if (s === 'ANNULEE') return 'ANNULE';
    return 'EN_COURS';
}

const STATUS_META: Record<ContractStatus, {
    label: string; text: string; bg: string; border: string; dot: string; icon: typeof CheckCircle2;
}> = {
    EN_COURS: { label: 'En cours', text: 'text-amber-700', bg: 'bg-amber-50', border: 'border-amber-200', dot: 'bg-amber-400 animate-pulse', icon: Clock },
    ACTIF:    { label: 'Contrat actif', text: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-200', dot: 'bg-emerald-500', icon: CheckCircle2 },
    ANNULE:   { label: 'Contrat annulé', text: 'text-red-700', bg: 'bg-red-50', border: 'border-red-200', dot: 'bg-red-500', icon: AlertTriangle },
};

/* ════════════════════════════════════════════════════════════════
   PAGE
════════════════════════════════════════════════════════════════ */
interface PageProps {
    params: { id: string };
    searchParams?: { from?: string };
}

export default async function ContractPage({ params, searchParams }: PageProps) {
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

    const r = reservation;
    const legacy = r as typeof r & { totalLocataire?: string; montantCommission?: string; netProprietaire?: string };

    const contractStatus = getContractStatus(r.statut);
    const meta = STATUS_META[contractStatus];

    const nbJours = r.nbJours ?? Math.max(1, Math.round((new Date(r.dateFin).getTime() - new Date(r.dateDebut).getTime()) / 86_400_000));
    const totalLocataire  = Number(r.prixTotal ?? legacy.totalLocataire ?? 0) || 0;
    const commissionAmount = Number(r.commission ?? legacy.montantCommission ?? 0) || 0;
    const totalBase       = totalLocataire - commissionAmount;
    const prixParJour     = Number(r.prixParJour) || 0;
    const netProprietaire = Number(r.montantProprietaire ?? legacy.netProprietaire ?? 0) || 0;

    const showPhone   = contractStatus !== 'EN_COURS';
    const contractRef  = r.id.slice(0, 8).toUpperCase();
    const contractDate = fmtDate(r.creeLe);
    const isOwner     = searchParams?.from === 'owner';
    const backHref    = isOwner ? `/dashboard/owner/reservations/${r.id}` : `/dashboard/reservations/${r.id}`;

    return (
        <div className="min-h-screen bg-slate-50/80 print:bg-white">
            <div className="max-w-3xl mx-auto px-3 sm:px-4 py-6 sm:py-8 lg:px-6 lg:py-10 space-y-4 sm:space-y-6 print:py-0 print:px-0 print:space-y-0">

                {/* Back */}
                <Link
                    href={backHref}
                    className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-slate-400 hover:text-slate-700 transition-colors group print:hidden"
                >
                    <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" strokeWidth={2.5} />
                    Retour à la réservation
                </Link>

                {/* ── Document card ─────────────────────────────── */}
                <div className="rounded-2xl bg-white border border-slate-200/80 shadow-sm overflow-hidden print:border-0 print:shadow-none print:rounded-none">

                    {/* ── Header ─────────────────────────────────── */}
                    <div className="px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8 pb-5 border-b border-slate-100">
                        {/* Top row: logo + status */}
                        <div className="flex items-center justify-between gap-3 mb-4 sm:mb-5">
                            <Image
                                src="/logoAutoLoc.jpg"
                                alt="AutoLoc"
                                width={110}
                                height={34}
                                className="h-8 sm:h-9 w-auto object-contain"
                                priority
                            />
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-full border text-[10px] sm:text-[11px] font-bold shrink-0 ${meta.bg} ${meta.border} ${meta.text}`}>
                                <span className={`w-1.5 h-1.5 rounded-full ${meta.dot}`} />
                                {meta.label}
                            </span>
                        </div>

                        {/* Title + meta */}
                        <h1 className="text-[16px] sm:text-[18px] lg:text-[20px] font-black text-slate-900 tracking-tight leading-snug">
                            Contrat de location de véhicule
                        </h1>
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-0.5 mt-1.5">
                            <p className="text-[11px] sm:text-[12px] text-slate-400 font-medium">
                                Réf. <span className="font-bold text-slate-600">{contractRef}</span>
                            </p>
                            <p className="text-[11px] sm:text-[12px] text-slate-400 font-medium">
                                Établi le <span className="font-bold text-slate-600">{contractDate}</span>
                            </p>
                        </div>

                        {/* Print button — small, below title on mobile */}
                        <div className="mt-3 print:hidden">
                            <PrintButton reservationId={r.id} variant="small" />
                        </div>
                    </div>

                    {/* ── Parties ──────────────────────────────────── */}
                    <div className="px-4 sm:px-6 lg:px-8 py-4 sm:py-5 bg-slate-50/60 border-b border-slate-100 print:bg-white">
                        <div className="grid grid-cols-2 gap-4 sm:gap-6">
                            <div>
                                <p className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-emerald-600 mb-1.5">
                                    Locataire
                                </p>
                                <p className="text-[12px] sm:text-[13px] font-bold text-slate-800 leading-snug">
                                    {r.locataire.prenom} {r.locataire.nom}
                                </p>
                                {showPhone && r.locataire.telephone && (
                                    <p className="text-[11px] sm:text-[12px] text-slate-500 mt-0.5">
                                        {r.locataire.telephone}
                                    </p>
                                )}
                            </div>
                            <div className="text-right">
                                <p className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-emerald-600 mb-1.5">
                                    Propriétaire
                                </p>
                                <p className="text-[12px] sm:text-[13px] font-bold text-slate-800 leading-snug">
                                    Propriétaire véhicule
                                </p>
                                <p className="text-[11px] sm:text-[12px] text-slate-500 mt-0.5">
                                    Réf. {r.proprietaireId?.slice(0, 8).toUpperCase() ?? '—'}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* ── Status banners ───────────────────────────── */}
                    {contractStatus === 'EN_COURS' && (
                        <div className="mx-4 sm:mx-6 lg:mx-8 mt-4 sm:mt-5 px-3 sm:px-4 py-3 rounded-xl bg-amber-50 border border-amber-200 flex items-start gap-2.5 sm:gap-3">
                            <Clock className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" strokeWidth={2} />
                            <div>
                                <p className="text-[11px] sm:text-[12px] font-bold text-amber-700">Contrat en cours de validation</p>
                                <p className="text-[10px] sm:text-[11px] text-amber-600/80 mt-0.5 leading-relaxed">
                                    En attente de la confirmation du propriétaire. Les contacts seront visibles après confirmation.
                                </p>
                            </div>
                        </div>
                    )}
                    {contractStatus === 'ANNULE' && (
                        <div className="mx-4 sm:mx-6 lg:mx-8 mt-4 sm:mt-5 px-3 sm:px-4 py-3 rounded-xl bg-red-50 border border-red-200 flex items-start gap-2.5 sm:gap-3">
                            <AlertTriangle className="w-4 h-4 text-red-500 mt-0.5 shrink-0" strokeWidth={2} />
                            <div>
                                <p className="text-[11px] sm:text-[12px] font-bold text-red-700">Contrat résilié</p>
                                <p className="text-[10px] sm:text-[11px] text-red-600/80 mt-0.5 leading-relaxed">
                                    {r.raisonAnnulation ?? 'Cette réservation a été annulée. Le contrat n\'est plus en vigueur.'}
                                    {r.annuleeLe && (
                                        <span className="ml-1 font-medium">
                                            — le {fmtDate(r.annuleeLe, { day: 'numeric', month: 'long', year: 'numeric' })}.
                                        </span>
                                    )}
                                </p>
                            </div>
                        </div>
                    )}

                    {/* ══════════════════════════════════════════════
                        LOCATION — carte mobile / tableau desktop
                    ══════════════════════════════════════════════ */}
                    <div className="px-4 sm:px-6 lg:px-8 pt-5 pb-2">

                        {/* Label section */}
                        <p className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-emerald-600 mb-3">
                            Détail de la location
                        </p>

                        {/* ── Mobile card (< sm) ── */}
                        <div className="sm:hidden rounded-xl border border-slate-200 overflow-hidden">
                            <div className="bg-emerald-700 px-4 py-2">
                                <p className="text-[11px] font-bold text-white uppercase tracking-wide">Location véhicule</p>
                            </div>
                            <div className="p-4 space-y-3">
                                <div>
                                    <p className="text-[11px] font-black text-slate-800">
                                        {r.vehicule.marque} {r.vehicule.modele}
                                    </p>
                                    {r.vehicule.immatriculation && (
                                        <p className="text-[10px] font-mono text-slate-400 mt-0.5">{r.vehicule.immatriculation}</p>
                                    )}
                                    <p className="text-[10px] text-slate-500 mt-1">
                                        du {fmtDate(r.dateDebut, { day: 'numeric', month: 'short' })} au {fmtDate(r.dateFin, { day: 'numeric', month: 'short', year: 'numeric' })}
                                    </p>
                                </div>
                                <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-100">
                                    <div>
                                        <p className="text-[9px] text-slate-400 uppercase tracking-wide font-semibold">Prix / jour</p>
                                        <p className="text-[11px] font-bold text-slate-700 mt-0.5 tabular-nums">{fmtMoney(prixParJour)}</p>
                                    </div>
                                    <div className="text-center">
                                        <p className="text-[9px] text-slate-400 uppercase tracking-wide font-semibold">Jours</p>
                                        <p className="text-[11px] font-bold text-slate-700 mt-0.5 tabular-nums">{nbJours}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[9px] text-slate-400 uppercase tracking-wide font-semibold">Sous-total</p>
                                        <p className="text-[11px] font-bold text-slate-700 mt-0.5 tabular-nums">{fmtMoney(totalBase)}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* ── Desktop table (sm+) ── */}
                        <div className="hidden sm:block overflow-x-auto">
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
                                                <span className="block text-[11px] font-mono text-slate-400 mt-0.5">{r.vehicule.immatriculation}</span>
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
                                        <td colSpan={4} className="px-4 py-2.5 text-right text-[11px] font-bold uppercase tracking-widest text-slate-400">Sous-total</td>
                                        <td className="px-4 py-2.5 text-[12px] font-bold text-slate-700 text-right tabular-nums">{fmtMoney(totalBase)} FCFA</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* ══════════════════════════════════════════════
                        FRAIS DE SERVICE — carte mobile / tableau desktop
                    ══════════════════════════════════════════════ */}
                    <div className="px-4 sm:px-6 lg:px-8 py-2">

                        {/* ── Mobile card ── */}
                        <div className="sm:hidden rounded-xl border border-slate-200 overflow-hidden">
                            <div className="bg-emerald-700 px-4 py-2">
                                <p className="text-[11px] font-bold text-white uppercase tracking-wide">Frais de service</p>
                            </div>
                            <div className="divide-y divide-slate-100">
                                <div className="flex items-center justify-between px-4 py-3">
                                    <span className="text-[11px] text-slate-600">Commission AutoLoc</span>
                                    <span className="text-[11px] font-bold text-slate-700 tabular-nums">15 % — {fmtMoney(commissionAmount)} FCFA</span>
                                </div>
                                <div className="flex items-center justify-between px-4 py-3 bg-emerald-50">
                                    <span className="text-[12px] font-black text-emerald-700">Total locataire</span>
                                    <span className="text-[15px] font-black text-emerald-700 tabular-nums">{fmtMoney(totalLocataire)} FCFA</span>
                                </div>
                            </div>
                        </div>

                        {/* ── Desktop table ── */}
                        <div className="hidden sm:block overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="bg-emerald-700 text-white print:bg-emerald-100 print:text-emerald-800">
                                        <th className="px-4 py-2.5 text-[11px] font-bold uppercase tracking-widest rounded-tl-lg" colSpan={3}>Frais de service</th>
                                        <th className="px-4 py-2.5 text-[11px] font-bold uppercase tracking-widest text-center">Taux</th>
                                        <th className="px-4 py-2.5 text-[11px] font-bold uppercase tracking-widest text-right rounded-tr-lg">Montant</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr className="border-b border-slate-100">
                                        <td colSpan={3} className="px-4 py-3 text-[12px] text-slate-600 font-medium">Commission plateforme AutoLoc</td>
                                        <td className="px-4 py-3 text-[12px] font-bold text-slate-700 text-center">15 %</td>
                                        <td className="px-4 py-3 text-[12px] font-bold text-slate-700 text-right tabular-nums">{fmtMoney(commissionAmount)} FCFA</td>
                                    </tr>
                                    <tr className="bg-emerald-50 border-t-2 border-emerald-200">
                                        <td colSpan={4} className="px-4 py-3 text-right text-[12px] font-black uppercase tracking-widest text-emerald-700">Total réglé par le locataire</td>
                                        <td className="px-4 py-3 text-[16px] font-black text-emerald-700 text-right tabular-nums">{fmtMoney(totalLocataire)} FCFA</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* ── Revenu propriétaire ───────────────────────── */}
                    <div className="px-4 sm:px-6 lg:px-8 py-3">
                        <div className="flex items-center justify-between px-4 py-3 sm:py-3.5 rounded-xl bg-emerald-50 border border-emerald-200">
                            <span className="text-[11px] sm:text-[12px] font-bold text-emerald-700">
                                Revenu net propriétaire
                            </span>
                            <span className="text-[15px] sm:text-[16px] font-black text-emerald-700 tabular-nums">
                                {fmtMoney(netProprietaire)} FCFA
                            </span>
                        </div>
                    </div>

                    {/* ── Politique d'annulation ────────────────────── */}
                    <div className="px-4 sm:px-6 lg:px-8 py-5 border-t border-slate-100">
                        <h3 className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-emerald-600 mb-3 sm:mb-4">
                            Politique d&apos;annulation
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                            {[
                                {
                                    title: 'Annulation par le locataire',
                                    items: [
                                        { bold: 'Plus de 5 jours avant :', text: 'remboursement intégral, déduction faite des frais de service AutoLoc.' },
                                        { bold: 'Entre 2 et 5 jours :', text: 'remboursement à 75 % du montant total. Les 25 % restants sont retenus à titre d\'indemnisation.' },
                                        { bold: 'Moins de 24 heures :', text: 'aucun remboursement accordé. Le montant intégral est acquis.' },
                                    ],
                                },
                                {
                                    title: 'Annulation par le propriétaire',
                                    items: [
                                        { bold: 'Plus de 7 jours avant :', text: 'remboursement intégral du locataire, sans pénalité.' },
                                        { bold: 'Entre 3 et 7 jours :', text: 'remboursement intégral du locataire + pénalité de 20 % à la charge du propriétaire.' },
                                        { bold: 'Moins de 3 jours :', text: 'remboursement intégral du locataire + pénalité de 40 % à la charge du propriétaire.' },
                                    ],
                                },
                            ].map((block) => (
                                <div key={block.title} className="bg-slate-50 rounded-xl p-3.5 sm:p-4 border border-slate-100">
                                    <p className="text-[10px] sm:text-[11px] font-black text-slate-700 mb-2.5 uppercase tracking-wide">
                                        {block.title}
                                    </p>
                                    <div className="space-y-2">
                                        {block.items.map((item) => (
                                            <p key={item.bold} className="text-[10px] sm:text-[11px] text-slate-600 leading-relaxed">
                                                <span className="font-semibold text-slate-700">{item.bold}</span>{' '}
                                                {item.text}
                                            </p>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* ── Conditions générales ──────────────────────── */}
                    <div className="px-4 sm:px-6 lg:px-8 py-5 border-t border-slate-100">
                        <div className="flex items-center justify-between mb-3 sm:mb-4">
                            <h3 className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-emerald-600">
                                Conditions générales
                            </h3>
                            <Link
                                href="/cgu"
                                target="_blank"
                                className="text-[9px] sm:text-[10px] font-semibold text-emerald-600 hover:text-emerald-700 underline decoration-dotted transition-colors print:hidden"
                            >
                                Voir les CGU complètes →
                            </Link>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {/* Art. 3 — Obligations du propriétaire */}
                            <div className="rounded-xl bg-slate-50 border border-slate-100 p-3 sm:p-4">
                                <p className="text-[9px] sm:text-[10px] font-black uppercase tracking-wide text-slate-500 mb-2">
                                    Art. 3 — Obligations du propriétaire
                                </p>
                                <ul className="space-y-1.5 text-[10px] sm:text-[11px] text-slate-600 leading-relaxed">
                                    <li className="flex gap-1.5"><span className="text-emerald-500 mt-0.5 flex-shrink-0">•</span>Mettre à disposition le véhicule en parfait état, propre et avec le niveau de carburant convenu.</li>
                                    <li className="flex gap-1.5"><span className="text-emerald-500 mt-0.5 flex-shrink-0">•</span>Garantir une assurance valide incluant la location à des tiers.</li>
                                    <li className="flex gap-1.5"><span className="text-emerald-500 mt-0.5 flex-shrink-0">•</span>Fournir tous les documents nécessaires à la circulation (carte grise, attestation d&apos;assurance).</li>
                                </ul>
                            </div>

                            {/* Art. 4 — Obligations du locataire */}
                            <div className="rounded-xl bg-slate-50 border border-slate-100 p-3 sm:p-4">
                                <p className="text-[9px] sm:text-[10px] font-black uppercase tracking-wide text-slate-500 mb-2">
                                    Art. 4 — Obligations du locataire
                                </p>
                                <ul className="space-y-1.5 text-[10px] sm:text-[11px] text-slate-600 leading-relaxed">
                                    <li className="flex gap-1.5"><span className="text-emerald-500 mt-0.5 flex-shrink-0">•</span>Utiliser le véhicule en bon père de famille dans le respect du Code de la route.</li>
                                    <li className="flex gap-1.5"><span className="text-emerald-500 mt-0.5 flex-shrink-0">•</span>Restituer le véhicule à la date et heure convenues, dans l&apos;état initial. Tout retard majoré de 50 %.</li>
                                    <li className="flex gap-1.5"><span className="text-emerald-500 mt-0.5 flex-shrink-0">•</span>Signaler immédiatement tout accident ou dommage. Ne pas sous-louer le véhicule.</li>
                                </ul>
                            </div>

                            {/* Art. 8 — État des lieux */}
                            <div className="rounded-xl bg-slate-50 border border-slate-100 p-3 sm:p-4">
                                <p className="text-[9px] sm:text-[10px] font-black uppercase tracking-wide text-slate-500 mb-2">
                                    Art. 8 — État des lieux
                                </p>
                                <p className="text-[10px] sm:text-[11px] text-slate-600 leading-relaxed">
                                    Un état des lieux contradictoire est établi au début et à la fin de la location, accompagné de photos et vidéos. Il fait foi en cas de litige sur l&apos;état du véhicule.
                                </p>
                            </div>

                            {/* Art. 9 — Accidents et dommages */}
                            <div className="rounded-xl bg-slate-50 border border-slate-100 p-3 sm:p-4">
                                <p className="text-[9px] sm:text-[10px] font-black uppercase tracking-wide text-slate-500 mb-2">
                                    Art. 9 — Accidents et dommages
                                </p>
                                <p className="text-[10px] sm:text-[11px] text-slate-600 leading-relaxed">
                                    En cas d&apos;accident, de vol ou de dommages, le locataire informe immédiatement propriétaire et AutoLoc. Le locataire est responsable des dommages sous réserve des franchises applicables. Tout litige est soumis à la médiation AutoLoc, régi par le droit sénégalais.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* ── Signatures ────────────────────────────────── */}
                    <div className="px-4 sm:px-6 lg:px-8 py-5 border-t border-slate-100">
                        <h3 className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-emerald-600 mb-3 sm:mb-4">
                            Signatures
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                            {[
                                { role: 'LE LOCATAIRE', name: `${r.locataire.prenom} ${r.locataire.nom}` },
                                { role: 'LE PROPRIÉTAIRE', name: 'Propriétaire véhicule' },
                            ].map(({ role, name }) => (
                                <div key={role} className="rounded-xl border border-slate-200 overflow-hidden">
                                    <div className="h-1 bg-emerald-500 w-full" />
                                    <div className="p-3.5 sm:p-4">
                                        <p className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-slate-400 mb-0.5">{role}</p>
                                        <p className="text-[12px] sm:text-[13px] font-bold text-slate-800">{name}</p>
                                        <p className="text-[9px] sm:text-[10px] text-slate-400 mt-0.5 mb-3">Lu et approuvé — Bon pour accord</p>
                                        <div className="flex gap-2.5 sm:gap-3">
                                            <div className="flex-1 border border-dashed border-slate-300 rounded-lg bg-slate-50 h-10 sm:h-12 flex items-end p-2">
                                                <span className="text-[9px] sm:text-[10px] text-slate-400">Signature</span>
                                            </div>
                                            <div className="w-24 sm:w-28 border border-dashed border-slate-300 rounded-lg bg-slate-50 h-10 sm:h-12 flex items-end p-2">
                                                <span className="text-[9px] sm:text-[10px] text-slate-400">Date</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* ── Footer ────────────────────────────────────── */}
                    <div className="px-4 sm:px-6 lg:px-8 py-4 bg-slate-50 border-t border-slate-100 text-center print:bg-white">
                        <p className="text-[9px] sm:text-[10px] text-slate-400">
                            AutoLoc — Plateforme de location de véhicules entre particuliers au Sénégal
                            {' · '} Réf. {contractRef} {' · '} {contractDate}
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
