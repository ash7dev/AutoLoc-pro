'use client';

import React from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ArrowLeft, Share2, AlertCircle, RefreshCw } from 'lucide-react';
import { OwnerMobileDetailHeader } from '@/src/features/reservations/components/detail/OwnerMobileDetailHeader';
import { OwnerReservationHeroHeader } from '@/src/features/reservations/components/detail/OwnerReservationHeroHeader';
import { OwnerBookingLifecyclePanel } from '@/src/features/reservations/components/detail/OwnerBookingLifecyclePanel';
import { OwnerTenantCard } from '@/src/features/reservations/components/detail/OwnerTenantCard';
import { OwnerVehicleDetailsCard } from '@/src/features/reservations/components/detail/OwnerVehicleDetailsCard';
import { OwnerFinancialDetailsCard } from '@/src/features/reservations/components/detail/OwnerFinancialDetailsCard';
import { OwnerContractCard } from '@/src/features/reservations/components/detail/OwnerContractCard';
import { TenantInspectionPhotosCard } from '@/src/features/reservations/components/detail/TenantInspectionPhotosCard';
import { OwnerBookingTimelineCard } from '@/src/features/reservations/components/detail/OwnerBookingTimelineCard';
import { OwnerConfirmReservationModal } from '@/src/features/reservations/components/detail/OwnerConfirmReservationModal';
import { OwnerCheckinModal } from '@/src/features/reservations/components/detail/OwnerCheckinModal';
import { OwnerCheckoutModal } from '@/src/features/reservations/components/detail/OwnerCheckoutModal';
import { OwnerSignalNoshowModal } from '@/src/features/reservations/components/detail/OwnerSignalNoshowModal';
import { OwnerCancellationPreviewModal } from '@/src/features/reservations/components/detail/OwnerCancellationPreviewModal';
import { OwnerCreateDisputeModal } from '@/src/features/reservations/components/detail/OwnerCreateDisputeModal';
import { OwnerTenantKycModal } from '@/src/features/reservations/components/detail/OwnerTenantKycModal';
import { useOwnerReservationDetail } from '@/src/features/reservations/hooks/useOwnerReservationDetail';
import { CreateDisputePayload } from '@/src/core/api/reservationsApi';

export default function OwnerReservationDetailPage() {
  const params = useParams();
  const id = (params?.id as string) || '';
  const [copiedLink, setCopiedLink] = React.useState(false);
  const [showConfirmModal, setShowConfirmModal] = React.useState(false);
  const [showCheckinModal, setShowCheckinModal] = React.useState(false);
  const [showCheckoutModal, setShowCheckoutModal] = React.useState(false);
  const [showNoshowModal, setShowNoshowModal] = React.useState(false);
  const [showCancelModal, setShowCancelModal] = React.useState(false);
  const [showDisputeModal, setShowDisputeModal] = React.useState(false);
  const [showKycModal, setShowKycModal] = React.useState(false);

  const {
    reservation,
    isLoading,
    isError,
    errorMessage,
    isSubmitting,
    refetch,
    confirmReservation,
    checkinReservation,
    checkoutReservation,
    cancelReservation,
    signalNoshow,
    createDispute,
  } = useOwnerReservationDetail(id);

  const handleShare = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  const handleConfirmModalSubmit = async (heureDebut: string) => {
    const success = await confirmReservation(heureDebut);
    if (success) {
      setShowConfirmModal(false);
    }
  };

  const handleCheckinModalSubmit = async (soldeRecu: boolean) => {
    const success = await checkinReservation(soldeRecu);
    if (success) {
      setShowCheckinModal(false);
    }
  };

  const handleCheckoutModalSubmit = async () => {
    const success = await checkoutReservation();
    if (success) {
      setShowCheckoutModal(false);
    }
  };

  const handleNoshowModalSubmit = async (commentaire?: string) => {
    const success = await signalNoshow(commentaire);
    if (success) {
      setShowNoshowModal(false);
    }
  };

  const handleCancelModalSubmit = async (reason: string): Promise<boolean> => {
    const success = await cancelReservation(reason);
    if (success) {
      setShowCancelModal(false);
      return true;
    }
    return false;
  };

  const handleDisputeModalSubmit = async (payload: CreateDisputePayload): Promise<boolean> => {
    const success = await createDispute(payload);
    if (success) {
      setShowDisputeModal(false);
      return true;
    }
    return false;
  };

  const vehicleTitle = reservation?.vehicule
    ? `${reservation.vehicule.marque} ${reservation.vehicule.modele}`
    : 'Détails Réservation';

  return (
    <div className="min-h-screen pb-24 sm:pb-16">
      {/* ── En-tête mobile spécifique ────────────────────────────────────────── */}
      <OwnerMobileDetailHeader
        reservationId={id}
        vehicleTitle={vehicleTitle}
        statut={reservation?.statut}
        tenantPhone={reservation?.locataire?.telephone}
      />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-16 sm:pt-8 space-y-6">
        {/* Navigation Top Bar Desktop (Masqué sur mobile < 640px) */}
        <div className="hidden sm:flex items-center justify-between gap-4 flex-wrap">
          <Link
            href="/dashboard/reservations"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-slate-200/90 text-slate-700 font-bold text-xs hover:bg-slate-50 transition-colors shadow-2xs"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-slate-500" />
            <span>Mes réservations hôte</span>
          </Link>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleShare}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-white border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-50 transition-colors cursor-pointer"
            >
              <Share2 className="w-3.5 h-3.5 text-slate-500" />
              <span>{copiedLink ? 'Lien copié !' : 'Partager'}</span>
            </button>
            <span className="px-3 py-1.5 rounded-full bg-slate-100 text-slate-600 font-mono text-xs font-bold border border-slate-200/80">
              RÉF. #{id.slice(0, 8).toUpperCase()}
            </span>
          </div>
        </div>

        {/* ── État Chargement / Skeleton ────────────────────────────────────── */}
        {isLoading && (
          <div className="space-y-6">
            <div className="h-64 w-full bg-slate-200/80 rounded-3xl animate-pulse" />
            <div className="h-48 w-full bg-slate-200/80 rounded-3xl animate-pulse" />
          </div>
        )}

        {/* ── État Erreur ────────────────────────────────────────────────────── */}
        {!isLoading && (isError || !reservation) && (
          <div className="max-w-xl mx-auto py-16 text-center space-y-6">
            <div className="w-16 h-16 rounded-3xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center mx-auto shadow-sm">
              <AlertCircle className="w-8 h-8" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-light text-[#041912]">
                Réservation introuvable
              </h2>
              <p className="text-sm text-slate-500">
                {errorMessage || 'Impossible d’accéder aux détails de cette réservation hôte.'}
              </p>
            </div>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={refetch}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#0A3D2E] text-[#F1DFB6] font-bold text-xs hover:bg-[#0F4F3B] transition-all cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Réessayer</span>
              </button>
            </div>
          </div>
        )}

        {/* ── En-tête Héro Sombre Luxe Propriétaire ───────────────────────────── */}
        {!isLoading && reservation && (
          <>
            <OwnerReservationHeroHeader
              id={reservation.id}
              statut={reservation.statut}
              creeLe={reservation.creeLe}
              vehicule={reservation.vehicule}
              locataire={reservation.locataire}
              dateDebut={reservation.dateDebut}
              dateFin={reservation.dateFin}
              nbJours={reservation.nbJours}
              netProprietaire={reservation.netProprietaire || reservation.montantProprietaire}
              adresseLivraison={reservation.adresseLivraison || undefined}
            />

            {/* ── Composant de Suivi du Lifecycle Propriétaire & Actions ────── */}
            <OwnerBookingLifecyclePanel
              reservation={reservation}
              isSubmitting={isSubmitting}
              onConfirmReservationClick={() => setShowConfirmModal(true)}
              onCheckinClick={() => setShowCheckinModal(true)}
              onCheckoutClick={() => setShowCheckoutModal(true)}
              onCancelClick={() => setShowCancelModal(true)}
              onSignalNoshowClick={() => setShowNoshowModal(true)}
              onOpenDisputeClick={() => setShowDisputeModal(true)}
              onRefetch={refetch}
            />

            {/* ── Carte Information & Coordonnées du Locataire (avec règles de confidentialité) ── */}
            <OwnerTenantCard
              statut={reservation.statut}
              dateDebut={reservation.dateDebut}
              locataire={reservation.locataire}
              vehiculeName={reservation.vehicule ? `${reservation.vehicule.marque} ${reservation.vehicule.modele}` : undefined}
              onViewKycClick={() => setShowKycModal(true)}
            />

            {/* ── Contrat de Location Officiel ────────────────────────────────── */}
            <OwnerContractCard
              reservationId={reservation.id}
              statut={reservation.statut}
              dateDebut={reservation.dateDebut}
            />

            {/* ── Détails Financiers & Paiement ───────────────────────────────── */}
            <OwnerFinancialDetailsCard reservation={reservation} />

            {/* ── Photos de l'État des Lieux (Check-in & Check-out) ────────── */}
            <TenantInspectionPhotosCard photos={reservation.photosEtatLieu} />

            {/* ── Fiche Technique & Localisation du Véhicule ─────────────────── */}
            {reservation.vehicule && (
              <OwnerVehicleDetailsCard
                vehicule={reservation.vehicule}
                adresseLivraison={reservation.adresseLivraison}
                statut={reservation.statut}
              />
            )}

            {/* ── Historique & Suivi d'Activité ────────────────────────────── */}
            <OwnerBookingTimelineCard reservation={reservation} />

            {/* ── Modale de Choix de l'Heure de Début & Confirmation ────────── */}
            <OwnerConfirmReservationModal
              reservation={reservation}
              isOpen={showConfirmModal}
              isSubmitting={isSubmitting}
              onClose={() => setShowConfirmModal(false)}
              onConfirm={handleConfirmModalSubmit}
            />

            {/* ── Modale de Check-in (Remise des Clés & Upload Photos) ───────── */}
            <OwnerCheckinModal
              reservation={reservation}
              isOpen={showCheckinModal}
              isSubmitting={isSubmitting}
              onClose={() => setShowCheckinModal(false)}
              onConfirm={handleCheckinModalSubmit}
              onRefetch={refetch}
            />

            {/* ── Modale de Check-out (Restitution & Upload Photos) ──────────── */}
            <OwnerCheckoutModal
              reservation={reservation}
              isOpen={showCheckoutModal}
              isSubmitting={isSubmitting}
              onClose={() => setShowCheckoutModal(false)}
              onConfirm={handleCheckoutModalSubmit}
              onRefetch={refetch}
            />

            {/* ── Modale de Signalement No-Show ──────────────────────────────── */}
            <OwnerSignalNoshowModal
              reservation={reservation}
              isOpen={showNoshowModal}
              isSubmitting={isSubmitting}
              onClose={() => setShowNoshowModal(false)}
              onSubmit={handleNoshowModalSubmit}
            />

            {/* ── Modale de Prévisualisation d'Annulation / Refus ───────────── */}
            <OwnerCancellationPreviewModal
              reservation={reservation}
              isOpen={showCancelModal}
              isSubmitting={isSubmitting}
              onClose={() => setShowCancelModal(false)}
              onConfirm={handleCancelModalSubmit}
            />

            {/* ── Modale de Création / Déclaration de Litige ────────────────── */}
            <OwnerCreateDisputeModal
              reservation={reservation}
              isOpen={showDisputeModal}
              isSubmitting={isSubmitting}
              onClose={() => setShowDisputeModal(false)}
              onSubmit={handleDisputeModalSubmit}
            />

            {/* ── Modale de Consultation du Dossier KYC & Permis du Locataire ── */}
            <OwnerTenantKycModal
              reservation={reservation}
              isOpen={showKycModal}
              onClose={() => setShowKycModal(false)}
            />
          </>
        )}
      </div>
    </div>
  );
}

