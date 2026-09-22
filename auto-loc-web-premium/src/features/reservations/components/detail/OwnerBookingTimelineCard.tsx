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
  ShieldCheck,
  User,
  UserCheck,
} from 'lucide-react';
import { OwnerReservationItem } from '@/src/core/api/reservationsApi';

export interface OwnerBookingTimelineCardProps {
  reservation: OwnerReservationItem;
}

interface TimelineItem {
  id: string;
  titre: string;
  description?: string;
  date: string;
  auteur?: string;
  type: 'CREATED' | 'PAYMENT' | 'CONFIRMED' | 'CHECKIN' | 'CHECKOUT' | 'CANCELLED' | 'DISPUTE' | 'GENERIC';
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

export const OwnerBookingTimelineCard: React.FC<OwnerBookingTimelineCardProps> = ({
  reservation,
}) => {
  const statut = (reservation.statut?.toUpperCase() ?? '');

  const timelineItems = useMemo<TimelineItem[]>(() => {
    const items: TimelineItem[] = [];

    // 1. Événement Création
    if (reservation.creeLe) {
      items.push({
        id: 'evt-created',
        titre: 'Réservation effectuée',
        description: `Réservation initiée par ${reservation.locataire?.prenom || 'le locataire'} ${reservation.locataire?.nom || ''}.`,
        date: reservation.creeLe,
        type: 'CREATED',
        auteur: 'Locataire',
      });
    }

    // 2. Événement Paiement
    if (['PAYEE', 'CONFIRMEE', 'EN_COURS', 'TERMINEE'].includes(statut)) {
      items.push({
        id: 'evt-payment',
        titre:
          reservation.modePaiement === 'ACOMPTE_SOLDE_CHECKIN'
            ? 'Acompte perçu en ligne'
            : 'Paiement intégral perçu',
        description: 'Fonds sécurisés et consignés sous séquestre AutoLoc.',
        date: reservation.creeLe || reservation.dateDebut,
        type: 'PAYMENT',
        auteur: 'AutoLoc Escrow',
      });
    }

    // 3. Événement Confirmation Propriétaire
    if (reservation.confirmeeLe || ['CONFIRMEE', 'EN_COURS', 'TERMINEE'].includes(statut)) {
      items.push({
        id: 'evt-confirmed',
        titre: 'Réservation confirmée par vos soins',
        description: 'Disponibilité du véhicule et rendez-vous validés par l’hôte.',
        date: reservation.confirmeeLe || reservation.creeLe || reservation.dateDebut,
        type: 'CONFIRMED',
        auteur: 'Hôte (Vous)',
      });
    }

    // 4. Check-in
    if (
      reservation.checkinProprietaireLe ||
      reservation.checkInLe ||
      ['EN_COURS', 'TERMINEE'].includes(statut)
    ) {
      items.push({
        id: 'evt-checkin',
        titre: 'Check-in & Départ validés',
        description: 'État des lieux de départ enregistré, véhicule remis au locataire.',
        date:
          reservation.checkinProprietaireLe ||
          reservation.checkInLe ||
          reservation.dateDebut,
        type: 'CHECKIN',
        auteur: 'Hôte',
      });
    }

    // 5. Litige / Signalement
    if (statut === 'LITIGE' || reservation.litige) {
      items.push({
        id: 'evt-dispute',
        titre: 'Dossier de litige ouvert',
        description: 'Dossier en cours d’examen prioritaire par l’équipe d’arbitrage AutoLoc.',
        date:
          reservation.checkinProprietaireLe ||
          reservation.confirmeeLe ||
          reservation.dateDebut ||
          reservation.creeLe,
        type: 'DISPUTE',
        auteur: 'Hôte / Support AutoLoc',
      });
    }

    // 6. Check-out / Fin de location
    if (reservation.checkOutLe || statut === 'TERMINEE') {
      items.push({
        id: 'evt-checkout',
        titre: 'Check-out & Restitution finalisés',
        description: 'Location clôturée avec succès. Fonds transférés sur votre solde.',
        date: reservation.checkOutLe || reservation.dateFin,
        type: 'CHECKOUT',
        auteur: 'Hôte & Locataire',
      });
    }

    // 7. Annulation
    if (statut === 'ANNULEE' || statut === 'EXPIREE') {
      items.push({
        id: 'evt-cancelled',
        titre: 'Réservation annulée / expirée',
        description:
          reservation.raisonAnnulation ||
          'La réservation a été clôturée sans prise en charge.',
        date: reservation.annuleeLe || reservation.creeLe || reservation.dateDebut,
        type: 'CANCELLED',
        auteur: 'Hôte / Locataire',
      });
    }

    // Fusion avec reservation.historique du backend
    if (Array.isArray(reservation.historique) && reservation.historique.length > 0) {
      reservation.historique.forEach((hEvt) => {
        if (!hEvt || !hEvt.modifieLe) return;
        const rawTitle = `Passage au statut ${hEvt.nouveauStatut}`;
        if (!items.some((i) => i.date === hEvt.modifieLe)) {
          items.push({
            id: hEvt.id || `h-${Math.random().toString(36).substring(2, 9)}`,
            titre: rawTitle,
            description: `Statut précédent : ${hEvt.ancienStatut || 'Non défini'}`,
            date: hEvt.modifieLe,
            type: 'GENERIC',
            auteur: hEvt.modifiePar || 'Système',
          });
        }
      });
    }

    return items.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [reservation, statut]);

  const getItemIcon = (type: TimelineItem['type']) => {
    switch (type) {
      case 'CREATED':
        return <Clock className="w-4 h-4 text-[#0A3D2E]" />;
      case 'PAYMENT':
        return <CreditCard className="w-4 h-4 text-emerald-600" />;
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
        return 'bg-emerald-50 border-emerald-200 text-emerald-800';
      case 'DISPUTE':
      case 'CANCELLED':
        return 'bg-rose-50 border-rose-200 text-rose-700';
      case 'CHECKIN':
        return 'bg-blue-50 border-blue-200 text-blue-800';
      case 'CHECKOUT':
        return 'bg-indigo-50 border-indigo-200 text-indigo-800';
      default:
        return 'bg-slate-100 border-slate-200 text-slate-700';
    }
  };

  return (
    <div className="rounded-3xl border border-slate-200/90 bg-white p-5 sm:p-6 shadow-sm space-y-5 text-[#041912]">
      {/* ── En-tête de la carte ─────────────────────────────────────────── */}
      <div className="flex items-center justify-between gap-4 flex-wrap pb-3 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#0A3D2E] text-[#F1DFB6] flex items-center justify-center shrink-0 shadow-xs">
            <Clock className="w-5 h-5 text-[#F1DFB6]" />
          </div>
          <div>
            <h3 className="font-fraunces text-xl text-[#041912] font-normal tracking-tight">
              Historique & Suivi d’activité
            </h3>
            <p className="text-xs text-slate-500 font-medium">
              Fil chronologique certifié des étapes de la réservation
            </p>
          </div>
        </div>

        <span className="px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-700 font-extrabold text-xs">
          {timelineItems.length} étape{timelineItems.length > 1 ? 's' : ''}
        </span>
      </div>

      {/* ── Liste Chronologique ─────────────────────────────────────────── */}
      <div className="relative pl-6 sm:pl-8 space-y-5">
        {/* Ligne verticale de connexion */}
        <div className="absolute left-2.5 sm:left-3.5 top-3 bottom-3 w-0.5 bg-slate-200" />

        {timelineItems.map((item, idx) => (
          <div key={item.id || idx} className="relative flex items-start gap-4 group">
            {/* Icône sur la ligne */}
            <div
              className={`absolute -left-6 sm:-left-8 top-0.5 w-6 h-6 rounded-full flex items-center justify-center border shadow-2xs transition-transform group-hover:scale-110 ${getItemBadgeStyle(
                item.type
              )}`}
            >
              {getItemIcon(item.type)}
            </div>

            {/* Contenu de l'événement */}
            <div className="flex-1 space-y-1 bg-slate-50/80 hover:bg-slate-50 rounded-2xl p-3.5 border border-slate-200/80 transition-colors">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <p className="font-fraunces text-base font-normal text-[#041912] tracking-tight leading-snug">
                  {item.titre}
                </p>
                <span className="font-sans text-[11px] font-bold text-slate-500 bg-white px-2 py-0.5 rounded-md border border-slate-200/80">
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

// Export alternatif pour compatibilité
export { OwnerBookingTimelineCard as HistoryCard, OwnerBookingTimelineCard as BookingHistoryCard };
