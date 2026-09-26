'use client';

import React, { useMemo } from 'react';
import {
  Clock,
  CheckCircle2,
  CreditCard,
  LogIn,
  LogOut,
  XCircle,
  AlertTriangle,
  FileCheck2,
  ShieldCheck,
  User,
  Sparkles,
} from 'lucide-react';
import { TenantReservationDetailData, ReservationEvent } from '../../hooks/useTenantReservationDetail';

interface TenantBookingTimelineCardProps {
  booking: TenantReservationDetailData;
}

interface TimelineItem {
  id: string;
  titre: string;
  description?: string;
  date: string;
  auteur?: string;
  type: 'CREATED' | 'PAYMENT' | 'CONFIRMED' | 'CHECKIN' | 'CHECKOUT' | 'CANCELLED' | 'DISPUTE' | 'COMPLETED' | 'GENERIC';
}

const formatDate = (dStr?: string) => {
  if (!dStr) return '—';
  try {
    const d = new Date(dStr);
    return d.toLocaleDateString('fr-FR', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return dStr;
  }
};

export const TenantBookingTimelineCard: React.FC<TenantBookingTimelineCardProps> = ({ booking }) => {
  /**
   * Construction de la timeline complète enrichie
   */
  const timelineItems = useMemo<TimelineItem[]>(() => {
    const items: TimelineItem[] = [];

    // 1. Événement Création
    if (booking.creeLe) {
      items.push({
        id: 'evt-created',
        titre: 'Réservation créée',
        description: `Demande effectuée pour le véhicule ${booking.vehicule?.marque || ''} ${booking.vehicule?.modele || ''}.`,
        date: booking.creeLe,
        type: 'CREATED',
        auteur: 'Locataire',
      });
    }

    // 2. Événement Paiement
    if (['PAYEE', 'CONFIRMEE', 'EN_COURS', 'TERMINEE'].includes(booking.statut)) {
      items.push({
        id: 'evt-payment',
        titre: booking.modePaiement === 'ACOMPTE_SOLDE_CHECKIN' ? 'Acompte (30%) confirmé' : 'Paiement (100%) confirmé',
        description: `Règlement sécurisé traité par ${booking.paiement?.fournisseur || 'Mobile Money'}.`,
        date: booking.creeLe || booking.dateDebut,
        type: 'PAYMENT',
        auteur: 'AutoLoc Séquestre',
      });
    }

    // 3. Événement Validation Propriétaire
    if (['CONFIRMEE', 'EN_COURS', 'TERMINEE'].includes(booking.statut)) {
      items.push({
        id: 'evt-confirmed',
        titre: 'Réservation validée par l’hôte',
        description: `L’hôte ${booking.proprietaire?.prenom || ''} a accepté la réservation et bloqué le véhicule.`,
        date: booking.creeLe || booking.dateDebut,
        type: 'CONFIRMED',
        auteur: 'Hôte',
      });
    }

    // 4. Check-in
    if (booking.checkinLocataireLe || booking.checkinProprietaireLe || ['EN_COURS', 'TERMINEE'].includes(booking.statut)) {
      items.push({
        id: 'evt-checkin',
        titre: 'Check-in & Prise en charge effectués',
        description: 'État des lieux de départ validé et clés remises.',
        date: booking.checkinLocataireLe || booking.checkinProprietaireLe || booking.dateDebut,
        type: 'CHECKIN',
        auteur: 'Locataire & Hôte',
      });
    }

    // 5. Litige (si présent)
    if (booking.litige) {
      items.push({
        id: 'evt-dispute',
        titre: 'Signalement de litige ouvert',
        description: booking.litige.description || booking.litige.motif || 'Un dossier d’arbitrage a été ouvert.',
        date: booking.litige.creeLe || new Date().toISOString(),
        type: 'DISPUTE',
        auteur: 'Support AutoLoc',
      });
    }

    // 6. Check-out / Fin de location
    if (booking.statut === 'TERMINEE') {
      items.push({
        id: 'evt-checkout',
        titre: 'Check-out & Restitution finalisés',
        description: 'Véhicule restitué à l’hôte. Location officiellement achevée.',
        date: booking.dateFin,
        type: 'CHECKOUT',
        auteur: 'Locataire & Hôte',
      });
    }

    // 7. Annulation (si annulée)
    if (booking.statut === 'ANNULEE') {
      items.push({
        id: 'evt-cancelled',
        titre: 'Réservation annulée',
        description: booking.raisonAnnulation || 'La réservation a été annulée selon les conditions appliquées.',
        date: new Date().toISOString(),
        type: 'CANCELLED',
        auteur: 'Locataire / Hôte',
      });
    }

    // Fusion avec booking.historique du backend si disponible
    if (Array.isArray(booking.historique) && booking.historique.length > 0) {
      booking.historique.forEach((hEvt) => {
        if (!hEvt) return;
        const rawTitle = hEvt.titre || (hEvt as any).label || (hEvt as any).nom || 'Événement';
        const titleText = String(rawTitle);
        const lowerTitle = titleText.toLowerCase();

        if (!items.some((i) => (i.titre || '').toLowerCase() === lowerTitle)) {
          items.push({
            id: hEvt.id || `h-${Math.random().toString(36).substring(2, 9)}`,
            titre: titleText,
            description: hEvt.description,
            date: hEvt.date || (hEvt as any).creeLe || booking.creeLe || new Date().toISOString(),
            type: 'GENERIC',
            auteur: hEvt.auteur,
          });
        }
      });
    }

    // Trier par date croissante
    return items.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [booking]);

  const getItemIcon = (type: TimelineItem['type']) => {
    switch (type) {
      case 'CREATED':
        return <Clock className="w-4 h-4 text-emerald-800" />;
      case 'PAYMENT':
        return <CreditCard className="w-4 h-4 text-emerald-400" />;
      case 'CONFIRMED':
        return <CheckCircle2 className="w-4 h-4 text-emerald-600" />;
      case 'CHECKIN':
        return <LogIn className="w-4 h-4 text-blue-600" />;
      case 'CHECKOUT':
        return <LogOut className="w-4 h-4 text-indigo-600" />;
      case 'DISPUTE':
        return <AlertTriangle className="w-4 h-4 text-rose-600" />;
      case 'CANCELLED':
        return <XCircle className="w-4 h-4 text-rose-600" />;
      default:
        return <ShieldCheck className="w-4 h-4 text-emerald-600" />;
    }
  };

  const getItemBadgeStyle = (type: TimelineItem['type']) => {
    switch (type) {
      case 'PAYMENT':
        return 'bg-brand-dark border-[#4ADE80]/40 text-emerald-400';
      case 'DISPUTE':
      case 'CANCELLED':
        return 'bg-rose-50 border-rose-200 text-rose-700';
      case 'CHECKIN':
        return 'bg-blue-50 border-blue-200 text-blue-800';
      case 'CHECKOUT':
        return 'bg-indigo-50 border-indigo-200 text-indigo-800';
      default:
        return 'bg-emerald-50 border-emerald-200 text-emerald-800';
    }
  };

  return (
    <div className="rounded-3xl border border-slate-200/90 bg-white p-5 sm:p-6 shadow-sm space-y-5 text-brand-dark">
      {/* En-tête */}
      <div className="flex items-center justify-between gap-4 flex-wrap pb-3 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-50 border border-emerald-100 text-brand-main flex items-center justify-center shrink-0 shadow-xs">
            <Clock className="w-5 h-5 text-brand-main" />
          </div>
          <div>
            <h3
              className="font-fraunces text-xl text-brand-dark font-normal tracking-tight"
            >
              Historique & Suivi d’activité
            </h3>
            <p className="text-xs text-slate-500 font-medium">
              Fil chronologique certifié des étapes de votre réservation
            </p>
          </div>
        </div>

        <span className="px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-700 font-extrabold text-xs">
          {timelineItems.length} événement{timelineItems.length > 1 ? 's' : ''}
        </span>
      </div>

      {/* Liste Chronologique d'Événements */}
      <div className="relative pl-6 sm:pl-8 space-y-6">
        {/* Ligne verticale de connexion */}
        <div className="absolute left-2.5 sm:left-3.5 top-3 bottom-3 w-0.5 bg-slate-200" />

        {timelineItems.map((item, idx) => (
          <div key={item.id || idx} className="relative flex items-start gap-4 group">
            {/* Noeud Icône sur la ligne */}
            <div
              className={`absolute -left-6 sm:-left-8 top-0.5 w-6 h-6 rounded-full flex items-center justify-center border shadow-xs transition-transform group-hover:scale-110 ${getItemBadgeStyle(
                item.type
              )}`}
            >
              {getItemIcon(item.type)}
            </div>

            {/* Contenu de l'événement */}
            <div className="flex-1 space-y-1 bg-slate-50/70 hover:bg-slate-50 rounded-2xl p-3.5 border border-slate-200/70 transition-colors">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <p
                  className="font-fraunces text-base font-normal text-brand-dark tracking-tight leading-snug"
                >
                  {item.titre}
                </p>
                <span className="font-sans text-[11px] font-bold text-slate-400 bg-white px-2 py-0.5 rounded-md border border-slate-200/80">
                  {formatDate(item.date)}
                </span>
              </div>

              {item.description && (
                <p className="font-sans text-xs text-slate-600 font-medium leading-relaxed">
                  {item.description}
                </p>
              )}

              {item.auteur && (
                <div className="pt-1 flex items-center gap-1.5 text-[10.5px] font-extrabold text-slate-400 uppercase tracking-wider">
                  <User className="w-3 h-3 text-slate-400" />
                  <span>Auteur : {item.auteur}</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
