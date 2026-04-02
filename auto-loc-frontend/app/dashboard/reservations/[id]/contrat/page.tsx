import Image from 'next/image';
import { cookies } from 'next/headers';
import { redirect, notFound } from 'next/navigation';
import { ApiError } from '@/lib/nestjs/api-client';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { fetchReservationById } from '@/lib/nestjs/reservations';
import { CheckCircle2, Clock, AlertTriangle } from 'lucide-react';
import { ContractClient } from './contract-client';

/* ════════════════════════════════════════════════════════════════
   HELPERS
════════════════════════════════════════════════════════════════ */
function fmtDate(d: string | Date, opts?: Intl.DateTimeFormatOptions) {
    return new Date(d).toLocaleDateString('fr-FR', opts ?? {
        day: '2-digit', month: 'long', year: 'numeric',
    });
}

// Helper pour vérifier si on peut imprimer (moins de 24h avant le début ou déjà commencé)
function canPrintContract(dateDebut: string | Date): boolean {
    const debut = new Date(dateDebut);
    const now = new Date();
    const diffMs = debut.getTime() - now.getTime();
    const diffHours = diffMs / (1000 * 60 * 60);
    
    // On autorise si on est à moins de 24h du début (diffHours <= 24)
    // ou si la location a déjà commencé (diffHours <= 0)
    return diffHours <= 24;
}

type ContractStatus = 'EN_COURS' | 'ACTIF' | 'ANNULE';

function getContractStatus(s: string): ContractStatus {
    if (['CONFIRMEE', 'EN_COURS', 'TERMINEE'].includes(s)) return 'ACTIF';
    if (s === 'ANNULEE') return 'ANNULE';
    return 'EN_COURS';
}

const STATUS_META: Record<ContractStatus, {
    label: string; text: string; bg: string; border: string; dot: string;
}> = {
    EN_COURS: { label: 'En cours', text: 'text-amber-700', bg: 'bg-amber-50', border: 'border-amber-200', dot: 'bg-amber-400 animate-pulse' },
    ACTIF:    { label: 'Contrat actif', text: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-200', dot: 'bg-emerald-500' },
    ANNULE:   { label: 'Contrat annulé', text: 'text-red-700', bg: 'bg-red-50', border: 'border-red-200', dot: 'bg-red-500' },
};

/* ════════════════════════════════════════════════════════════════
   PAGE (Server Component)
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

    const contractStatus = getContractStatus(r.statut);
    const meta = STATUS_META[contractStatus];

    const nbJours = r.nbJours ?? Math.max(1, Math.round((new Date(r.dateFin).getTime() - new Date(r.dateDebut).getTime()) / 86_400_000));
    const totalLocataire  = Number(r.prixTotal) || 0;
    const commissionAmount = Number(r.commission) || 0;
    const totalBase       = totalLocataire - commissionAmount;
    const prixParJour     = Number(r.prixParJour) || 0;
    const netProprietaire = Number(r.montantProprietaire) || 0;

    const contractRef  = r.id.slice(0, 8).toUpperCase();
    const contractDate = fmtDate(r.creeLe);
    const isOwner     = searchParams?.from === 'owner';
    const backHref    = isOwner ? `/dashboard/owner/reservations/${r.id}` : `/dashboard/reservations/${r.id}`;
    
    // On vérifie la restriction de 24h
    const canPrint    = canPrintContract(r.dateDebut);
    
    // Les infos de contact ne sont visibles que 24h avant (correspondant à canPrint) 
    // et si le contrat n'est pas bloqué en attente de confirmation
    const showPhone   = canPrint && contractStatus !== 'EN_COURS';

    return (
        <ContractClient 
            reservation={r} 
            isOwner={isOwner}
            backHref={backHref}
            contractStatus={contractStatus}
            meta={meta}
            nbJours={nbJours}
            totalLocataire={totalLocataire}
            commissionAmount={commissionAmount}
            totalBase={totalBase}
            prixParJour={prixParJour}
            netProprietaire={netProprietaire}
            showPhone={showPhone}
            contractRef={contractRef}
            contractDate={contractDate}
            canPrint={canPrint}
        />
    );
}
