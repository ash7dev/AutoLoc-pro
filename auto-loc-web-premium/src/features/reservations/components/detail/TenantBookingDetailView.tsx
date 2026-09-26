'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Calendar,
  MapPin,
  Phone,
  ShieldCheck,
  FileText,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Car,
  XCircle,
  ExternalLink,
  Sparkles,
  ChevronRight,
  Download,
  AlertCircle,
  RefreshCw,
  Share2,
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { API_URL } from '@/lib/config';
import { useTenantReservationDetail, TenantReservationDetailData } from '../../hooks/useTenantReservationDetail';
import { TenantReservationHeroHeader } from './TenantReservationHeroHeader';
import { TenantBookingLifecyclePanel } from './TenantBookingLifecyclePanel';
import { TenantOwnerContactCard } from './TenantOwnerContactCard';
import { TenantContractCard } from './TenantContractCard';
import { TenantFinancialDetailsCard } from './TenantFinancialDetailsCard';
import { TenantInspectionPhotosCard } from './TenantInspectionPhotosCard';
import { TenantVehicleSpecsCard } from './TenantVehicleSpecsCard';
import { TenantReviewSectionCard } from './TenantReviewSectionCard';
import { TenantBookingTimelineCard } from './TenantBookingTimelineCard';
import { TenantCheckinConsentModal } from './TenantCheckinConsentModal';
import { TenantRefusalEvidenceModal } from './TenantRefusalEvidenceModal';
import { TenantCancellationPreviewModal } from './TenantCancellationPreviewModal';

interface TenantBookingDetailViewProps {
  reservationId: string;
}

const FALLBACK_CAR = 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=1000&q=80';

const STATUS_CONFIG: Record<string, { label: string; bg: string; text: string; border: string; desc: string }> = {
  EN_ATTENTE_PAIEMENT: {
    label: 'Paiement en attente',
    bg: 'bg-amber-500/10',
    text: 'text-amber-400',
    border: 'border-amber-500/30',
    desc: 'Votre réservation sera traitée dès confirmation du paiement.',
  },
  PAYEE: {
    label: 'Paiement confirmé',
    bg: 'bg-blue-500/10',
    text: 'text-blue-400',
    border: 'border-blue-500/30',
    desc: 'Le paiement est reçu. L’hôte doit valider la disponibilité.',
  },
  CONFIRMEE: {
    label: 'Réservation confirmée',
    bg: 'bg-emerald-500/10',
    text: 'text-emerald-400',
    border: 'border-emerald-500/30',
    desc: 'Votre réservation est validée. Préparez votre remise de clés avec l’hôte.',
  },
  EN_COURS: {
    label: 'Location en cours',
    bg: 'bg-emerald-500/20',
    text: 'text-emerald-300',
    border: 'border-emerald-400/40',
    desc: 'Votre véhicule est actuellement en cours d’utilisation. Bon trajet !',
  },
  TERMINEE: {
    label: 'Location terminée',
    bg: 'bg-slate-500/10',
    text: 'text-slate-300',
    border: 'border-slate-500/30',
    desc: 'Location achevée avec succès. Merci d’avoir voyagé avec AutoLoc.',
  },
  ANNULEE: {
    label: 'Réservation annulée',
    bg: 'bg-rose-500/10',
    text: 'text-rose-400',
    border: 'border-rose-500/30',
    desc: 'Cette réservation a été annulée.',
  },
  LITIGE: {
    label: 'Litige en cours',
    bg: 'bg-rose-500/20',
    text: 'text-rose-300',
    border: 'border-rose-400/40',
    desc: 'Un litige a été ouvert. L’équipe AutoLoc étudie votre dossier.',
  },
};

const formatDate = (dateStr?: string) => {
  if (!dateStr) return '—';
  try {
    return new Date(dateStr).toLocaleDateString('fr-FR', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return dateStr;
  }
};

export function TenantBookingDetailView({ reservationId }: TenantBookingDetailViewProps) {
  const {
    booking,
    isLoading,
    isError,
    errorMessage,
    isSubmitting,
    refetch,
    confirmCheckin,
    refuseCheckin,
    cancelReservation,
  } = useTenantReservationDetail(reservationId);

  /* États des Modales */
  const [showCheckinModal, setShowCheckinModal] = useState(false);
  const [showRefusalModal, setShowRefusalModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);

  const [refusalReason, setRefusalReason] = useState('');
  const [refusalComment, setRefusalComment] = useState('');
  const [cancelReason, setCancelReason] = useState('');
  const [copiedLink, setCopiedLink] = useState(false);

  // Forcer le défilement tout en haut lors du rechargement / fin du chargement des données
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      if ('scrollRestoration' in window.history) {
        window.history.scrollRestoration = 'manual';
      }
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' as ScrollBehavior });
    }
  }, [isLoading]);

  /* Traitement des boutons d'actions */
  const handleConfirmCheckin = async () => {
    const success = await confirmCheckin();
    if (success) setShowCheckinModal(false);
  };

  const handleRefuseCheckin = async () => {
    if (!refusalReason.trim()) {
      alert('Veuillez préciser le motif du refus.');
      return;
    }
    const success = await refuseCheckin(refusalReason.trim(), refusalComment.trim());
    if (success) setShowRefusalModal(false);
  };

  const handleCancelReservation = async () => {
    if (!cancelReason.trim()) {
      alert('Veuillez préciser le motif d’annulation.');
      return;
    }
    const success = await cancelReservation(cancelReason.trim());
    if (success) setShowCancelModal(false);
  };

  const handleShare = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  /* 1. État chargement Skeleton */
  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        <div className="h-8 w-48 bg-slate-200 rounded-full animate-pulse" />
        <div className="h-64 w-full bg-slate-200 rounded-3xl animate-pulse" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="h-48 bg-slate-200 rounded-3xl animate-pulse" />
            <div className="h-48 bg-slate-200 rounded-3xl animate-pulse" />
          </div>
          <div className="h-80 bg-slate-200 rounded-3xl animate-pulse" />
        </div>
      </div>
    );
  }

  /* 2. État d'erreur */
  if (isError || !booking) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center space-y-6">
        <div className="w-16 h-16 rounded-3xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center mx-auto shadow-sm">
          <AlertCircle className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h2
            className="text-2xl font-light text-brand-dark"
            style={{ fontFamily: 'var(--font-cormorant), Georgia, serif' }}
          >
            Réservation introuvable
          </h2>
          <p className="text-sm text-slate-500">
            {errorMessage || 'Impossible d’accéder aux détails de cette réservation pour le moment.'}
          </p>
        </div>
        <div className="flex items-center justify-center gap-3 pt-2">
          <button
            type="button"
            onClick={refetch}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-brand-main text-champagne font-bold text-xs hover:bg-forest-700 transition-all cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Réessayer</span>
          </button>
          <Link
            href="/reservations"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-50 transition-all cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Retour aux réservations</span>
          </Link>
        </div>
      </div>
    );
  }

  /* Extract variables */
  const statusInfo = STATUS_CONFIG[booking.statut?.toUpperCase() ?? ''] ?? STATUS_CONFIG.EN_ATTENTE_PAIEMENT;
  const photoUrl = typeof booking.vehicule?.photos?.[0] === 'string'
    ? booking.vehicule.photos[0]
    : (booking.vehicule?.photos?.[0] as any)?.url || booking.vehicule?.photoUrl || FALLBACK_CAR;

  const total = Number(booking.prixTotal ?? 0);
  const paid = Number(booking.montantPayeEnLigne ?? booking.paiement?.montant ?? 0);
  const balance = Number(booking.montantSoldeCheckin ?? 0);

  const isCancellable = ['EN_ATTENTE_PAIEMENT', 'PAYEE', 'CONFIRMEE'].includes(booking.statut);
  const canCheckin = booking.statut === 'CONFIRMEE' && Boolean(booking.checkinProprietaireLe) && !booking.checkinLocataireLe;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-6 pb-28 sm:py-10 space-y-6">
      {/* Navigation Top Bar (Masqué sur mobile, géré par le MobileDetailHeader) */}
      <div className="hidden sm:flex items-center justify-between gap-4 flex-wrap">
        <Link
          href="/reservations"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-slate-200/90 text-slate-700 font-bold text-xs hover:bg-slate-50 transition-colors shadow-2xs"
        >
          <ArrowLeft className="w-3.5 h-3.5 text-slate-500" />
          <span>Mes réservations</span>
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
            RÉF. #{booking.id.slice(0, 8).toUpperCase()}
          </span>
        </div>
      </div>

      {/* Hero Header Sombre Ultra-Luxe (avec Photo, Année, Type, Badges & Lieu) */}
      <TenantReservationHeroHeader
        id={booking.id}
        statut={booking.statut}
        creeLe={booking.creeLe}
        vehicule={booking.vehicule}
        dateDebut={booking.dateDebut}
        dateFin={booking.dateFin}
        nbJours={booking.nbJours}
        adresseLivraison={booking.adresseLivraison}
        typeLivraison={booking.typeLivraison}
        horsDakar={booking.horsDakar}
      />

      {/* Main Grid Content */}
      <div className="space-y-6">
        {/* Carte Avis & Évaluation du Véhicule (Placé avant le Lifecycle Panel) */}
        <TenantReviewSectionCard
          reservationId={booking.id}
          bookingStatus={booking.statut}
          existingReview={booking.avis ? { note: booking.avis.note, commentaire: booking.avis.commentaire } : undefined}
          onReviewSubmitted={refetch}
        />

        {/* Composant de suivi de cycle de vie de la réservation tenant */}
        <TenantBookingLifecyclePanel
          booking={booking}
          isSubmitting={isSubmitting}
          onConfirmCheckinClick={() => setShowCheckinModal(true)}
          onRefuseCheckinClick={() => setShowRefusalModal(true)}
          onCancelClick={() => setShowCancelModal(true)}
          onRefetch={refetch}
        />

        {/* Carte Coordonnées Hôte (avec règle de confidentialité 24h & statut) */}
        <TenantOwnerContactCard
          statut={booking.statut}
          dateDebut={booking.dateDebut}
          host={booking.proprietaire}
          vehiculeName={`${booking.vehicule?.marque || ''} ${booking.vehicule?.modele || ''}`.trim()}
        />

        {/* Carte Fiche Technique du Véhicule & Raccourcis Itinéraire Maps / Waze */}
        <TenantVehicleSpecsCard booking={booking} />

        {/* Carte Contrat de location officiel (Consultation PDF & Téléchargement sécurisé avec règle 24h) */}
        <TenantContractCard
          reservationId={booking.id}
          statut={booking.statut}
          dateDebut={booking.dateDebut}
        />

        {/* Carte Détails Financiers (Récapitulatif des frais & module Acompte/Solde Dark Obsidian) */}
        <TenantFinancialDetailsCard booking={booking} />

        {/* Carte Photos d'État des Lieux (Galerie d'inspection HD & Lightbox) */}
        <TenantInspectionPhotosCard photos={booking.photosEtatLieu} />

        {/* Section Litige le cas échéant */}
        {booking.litige && (
          <div className="rounded-3xl border border-rose-200 bg-rose-50/70 p-5 space-y-3">
            <div className="flex items-center gap-2 text-rose-800 font-bold text-sm">
              <AlertTriangle className="w-4 h-4 text-rose-600" />
              <span>Suivi du litige en cours</span>
            </div>
            <p className="text-xs text-rose-700 leading-relaxed font-medium">
              {booking.litige.description || booking.litige.commentaire || booking.litige.motif || 'Votre signalement a été transmis au support d’arbitrage.'}
            </p>
          </div>
        )}

        {/* Carte Historique & Fil d'Actualité Horodaté (Au tout bas de la page) */}
        <TenantBookingTimelineCard booking={booking} />
      </div>

      {/* Modale Validation Check-in avec Preview & Consentement */}
      <TenantCheckinConsentModal
        booking={booking}
        isOpen={showCheckinModal}
        isSubmitting={isSubmitting}
        onClose={() => setShowCheckinModal(false)}
        onConfirm={handleConfirmCheckin}
      />

      {/* Modale Refus / Litige avec Preuve Photo & Motif */}
      <TenantRefusalEvidenceModal
        booking={booking}
        isOpen={showRefusalModal}
        isSubmitting={isSubmitting}
        onClose={() => setShowRefusalModal(false)}
        onSubmit={(motif, comment) => refuseCheckin(motif, comment)}
      />

      {/* Modale Annulation avec Estimation de Remboursement & Puces de motif */}
      <TenantCancellationPreviewModal
        booking={booking}
        isOpen={showCancelModal}
        isSubmitting={isSubmitting}
        onClose={() => setShowCancelModal(false)}
        onConfirm={(raison) => cancelReservation(raison)}
      />
    </div>
  );
}
