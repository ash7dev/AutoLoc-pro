'use client';

import React from 'react';
import Link from 'next/link';
import {
  CalendarX,
  Car,
  Compass,
  CheckCheck,
  XCircle,
  AlertTriangle,
  ArrowRight,
  Sparkles,
  RotateCcw,
} from 'lucide-react';
import { ReservationStatusFilter } from './TenantReservationStatusPills';

interface TenantEmptyReservationsStateProps {
  activeStatus: ReservationStatusFilter;
  onResetFilter?: () => void;
}

export function TenantEmptyReservationsState({
  activeStatus,
  onResetFilter,
}: TenantEmptyReservationsStateProps) {
  // Déterminer le contenu visuel et texte selon le statut
  const getEmptyStateConfig = () => {
    switch (activeStatus) {
      case 'EN_COURS':
        return {
          icon: Car,
          badgeText: 'AUCUN TRAJET ACTIF',
          title: 'Aucune location en cours',
          description:
            'Vous n’avez pas de véhicule en cours de conduite pour le moment. Vos trajets actifs et vos codes de restitution s’afficheront ici.',
        };
      case 'CONFIRMEE':
        return {
          icon: Compass,
          badgeText: 'À VENIR',
          title: 'Aucune réservation à venir',
          description:
            'Toutes vos prochaines réservations validées s’afficheront ici avec le code de remise de clés et l’adresse exacte du rendez-vous.',
        };
      case 'TERMINEE':
        return {
          icon: CheckCheck,
          badgeText: 'HISTORIQUE',
          title: 'Aucun historique de location',
          description:
            'Vos locations achevées, reçus de paiement et contrats archivés apparaîtront ici dès que vous aurez effectué vos premiers trajets.',
        };
      case 'ANNULEE':
        return {
          icon: XCircle,
          badgeText: 'ANNULATIONS',
          title: 'Aucune réservation annulée',
          description:
            'Vous n’avez aucune annulation enregistrée. Vos demandes annulées et justificatifs de remboursement s’afficheront ici.',
        };
      case 'LITIGE':
        return {
          icon: AlertTriangle,
          badgeText: 'TÉMOIN DE SÉCURITÉ',
          title: 'Tout est en ordre !',
          description:
            'Aucun signalement ni litige actif sur vos réservations. Notre équipe support reste à votre entière disposition.',
        };
      case 'ALL':
      default:
        return {
          icon: CalendarX,
          badgeText: 'PREMIER TRAJET',
          title: 'Aucune réservation pour le moment',
          description:
            'Prêt à prendre la route ? Explorez notre sélection de véhicules vérifiés à Dakar et dans les régions du Sénégal et réservez en quelques clics.',
        };
    }
  };

  const config = getEmptyStateConfig();
  const Icon = config.icon;

  return (
    <div className="relative overflow-hidden rounded-[32px] sm:rounded-[40px] border border-slate-200/90 bg-white p-8 sm:p-12 lg:p-14 text-center shadow-md shadow-slate-950/5">
      {/* Halo lumineux en arrière-plan */}
      <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-emerald-500/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-16 -left-16 h-64 w-64 rounded-full bg-teal-500/10 blur-3xl" />

      <div className="relative z-10 max-w-lg mx-auto space-y-6">
        {/* Badge Visuel de l'Icône */}
        <div className="relative inline-flex items-center justify-center">
          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-[#0A3D2E]/[0.06] border border-[#0A3D2E]/15 text-[#0A3D2E] flex items-center justify-center shadow-inner">
            <Icon className="w-10 h-10 sm:w-12 sm:h-12 text-[#0A3D2E]" strokeWidth={1.5} />
          </div>
          <span className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500 text-white shadow-xs">
            <Sparkles className="w-3.5 h-3.5" />
          </span>
        </div>

        {/* Textes & Typographie */}
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-[11px] font-bold uppercase tracking-wider">
            {config.badgeText}
          </div>

          <h3
            className="text-2xl sm:text-4xl font-light tracking-tight text-[#041912]"
            style={{ fontFamily: 'var(--font-cormorant), Georgia, serif' }}
          >
            {config.title}
          </h3>

          <p className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed max-w-md mx-auto">
            {config.description}
          </p>
        </div>

        {/* Boutons d'Action */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-3">
          <Link
            href="/vehicles"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-full bg-[#0A3D2E] text-[#F1DFB6] font-bold text-xs sm:text-sm shadow-md shadow-[#0A3D2E]/15 hover:bg-[#0F4F3B] transition-all cursor-pointer active:scale-95"
          >
            <span>Explorer les véhicules</span>
            <ArrowRight className="w-4 h-4 text-[#F1DFB6]" />
          </Link>

          {activeStatus !== 'ALL' && onResetFilter && (
            <button
              type="button"
              onClick={onResetFilter}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-full bg-white border border-slate-200/90 text-slate-700 font-bold text-xs sm:text-sm hover:bg-slate-50 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
              <span>Voir toutes les réservations</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
