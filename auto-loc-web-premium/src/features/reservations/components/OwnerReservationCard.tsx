'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Car,
  User,
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  XCircle,
  ShieldCheck,
  ArrowUpRight,
} from 'lucide-react';
import { OwnerReservationItem, ReservationStatut } from '../../../core/api/reservationsApi';

export interface OwnerReservationCardProps {
  reservation: OwnerReservationItem;
  onActionClick?: (reservation: OwnerReservationItem) => void;
}

const formatDate = (isoString?: string) => {
  if (!isoString) return '';
  try {
    const d = new Date(isoString);
    return d.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return isoString;
  }
};

// Palette alignée sur l'identité AutoLoc : vert forêt / champagne / émeraude
const getStatusBadge = (statut: ReservationStatut) => {
  switch (statut) {
    case 'EN_ATTENTE_PAIEMENT':
    case 'INITIEE':
      return {
        label: 'En attente',
        bg: 'bg-amber-50 text-amber-800 border-amber-200/80',
        dot: 'bg-amber-500',
        icon: Clock,
        live: false,
        accent: 'before:bg-amber-400',
      };
    case 'CONFIRMEE':
    case 'PAYEE':
      return {
        label: 'Confirmée',
        bg: 'bg-blue-50 text-blue-800 border-blue-200/80',
        dot: 'bg-blue-500',
        icon: CheckCircle2,
        live: false,
        accent: 'before:bg-blue-400',
      };
    case 'EN_COURS':
      return {
        label: 'En cours',
        bg: 'bg-[#0A3D2E]/[0.06] text-[#0A3D2E] border-[#0A3D2E]/15',
        dot: 'bg-[#059669]',
        icon: Car,
        live: true,
        accent: 'before:bg-[#059669]',
      };
    case 'TERMINEE':
      return {
        label: 'Terminée',
        bg: 'bg-slate-100/80 text-slate-600 border-slate-200/80',
        dot: 'bg-slate-400',
        icon: ShieldCheck,
        live: false,
        accent: 'before:bg-slate-300',
      };
    case 'LITIGE':
      return {
        label: 'En litige',
        bg: 'bg-orange-50 text-orange-800 border-orange-200/80',
        dot: 'bg-orange-500',
        icon: AlertCircle,
        live: false,
        accent: 'before:bg-orange-400',
      };
    case 'ANNULEE':
    case 'EXPIREE':
    default:
      return {
        label: 'Annulée',
        bg: 'bg-rose-50 text-rose-700 border-rose-200/80',
        dot: 'bg-rose-400',
        icon: XCircle,
        live: false,
        accent: 'before:bg-rose-300',
      };
  }
};

export const OwnerReservationCard: React.FC<OwnerReservationCardProps> = ({ reservation }) => {
  const { vehicule, locataire, statut, dateDebut, dateFin, nbJours, netProprietaire, id } = reservation;
  const badge = getStatusBadge(statut);
  const StatusIcon = badge.icon;
  const netAmount = Number(netProprietaire || 0);

  const vehiclePhoto =
    vehicule?.photoUrl ||
    vehicule?.photos?.[0]?.url ||
    'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=400&q=80';

  const tenantName = locataire?.prenom ? `${locataire.prenom} ${locataire.nom}` : 'Locataire AutoLoc';

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className={`group relative isolate overflow-hidden rounded-2xl border border-slate-200/70 bg-white
        shadow-[0_1px_2px_rgba(4,25,18,0.04)] transition-all duration-300
        hover:-translate-y-0.5 hover:border-[#0A3D2E]/20 hover:shadow-[0_12px_32px_-12px_rgba(4,25,18,0.18)]
        sm:rounded-[28px]
        before:absolute before:inset-y-0 before:left-0 before:w-[3px] before:content-[''] ${badge.accent}`}
    >
      {/* ── VUE MOBILE ────────────────────────────────────────────────── */}
      <div className="flex items-center gap-3 p-3.5 pl-4 sm:hidden">
        <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-2xl border border-slate-200/70 bg-slate-100 shadow-inner">
          <img
            src={vehiclePhoto}
            alt={vehicule?.marque || 'Véhicule'}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        </div>

        <div className="min-w-0 flex-1 space-y-1.5">
          <div className="flex items-center justify-between gap-2">
            <h3 className="truncate font-fraunces text-[15px] font-normal leading-none text-[#041912]">
              {vehicule?.marque || 'Véhicule'} {vehicule?.modele || ''}
            </h3>
            <span className="shrink-0 text-[10px] font-medium tabular-nums text-slate-400">
              #{id.slice(0, 6)}
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
            <User className="h-3 w-3 shrink-0 text-slate-400" />
            <span className="truncate font-medium text-slate-700">{tenantName}</span>
            <span className="text-slate-300">•</span>
            <span className="shrink-0 whitespace-nowrap">{nbJours} j.</span>
          </div>

          <div className="flex items-center justify-between gap-2 pt-0.5">
            <div
              className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-bold ${badge.bg}`}
            >
              {badge.live && (
                <span className="relative flex h-1.5 w-1.5">
                  <span className={`absolute inline-flex h-full w-full animate-ping rounded-full opacity-60 ${badge.dot}`} />
                  <span className={`relative inline-flex h-1.5 w-1.5 rounded-full ${badge.dot}`} />
                </span>
              )}
              <StatusIcon className="h-3 w-3" />
              <span>{badge.label}</span>
            </div>

            <span className="font-fraunces text-sm font-normal tabular-nums text-[#059669]">
              {netAmount.toLocaleString('fr-FR')} FCFA
            </span>
          </div>
        </div>
      </div>

      <div className="px-3.5 pb-3.5 pl-4 sm:hidden">
        <Link
          href={`/dashboard/reservations/${id}`}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-[#4ADE80]/30 bg-gradient-to-r from-[#041912] via-[#0A3D2E] to-[#041912] py-2.5 px-4 text-xs font-bold tracking-wide text-[#F1DFB6] shadow-xs transition-all duration-200 hover:border-[#4ADE80]/50 active:scale-[0.98] active:opacity-95"
        >
          <span>Gérer la réservation</span>
          <ArrowUpRight className="h-3.5 w-3.5 text-[#4ADE80] transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </Link>
      </div>

      {/* ── VUE DESKTOP ───────────────────────────────────────────────── */}
      <div className="hidden flex-col justify-between p-6 pl-7 sm:flex">
        {/* Statut + référence */}
        <div className="flex items-center justify-between gap-2">
          <div
            className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-bold ${badge.bg}`}
          >
            {badge.live && (
              <span className="relative flex h-1.5 w-1.5">
                <span className={`absolute inline-flex h-full w-full animate-ping rounded-full opacity-60 ${badge.dot}`} />
                <span className={`relative inline-flex h-1.5 w-1.5 rounded-full ${badge.dot}`} />
              </span>
            )}
            <StatusIcon className="h-3.5 w-3.5" />
            <span>{badge.label}</span>
          </div>

          <span className="font-mono text-[11px] font-medium tracking-wider text-slate-400">
            Réf. #{id.slice(0, 8)}
          </span>
        </div>

        {/* Véhicule */}
        <div className="mt-4 flex items-start gap-4">
          <div className="relative h-[72px] w-[72px] shrink-0 overflow-hidden rounded-2xl border border-slate-200/70 bg-slate-100 shadow-inner">
            <img
              src={vehiclePhoto}
              alt={vehicule?.marque || 'Véhicule'}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          </div>

          <div className="min-w-0 flex-1 space-y-1.5 pt-0.5">
            <h3 className="truncate font-fraunces text-xl font-normal leading-tight text-[#041912]">
              {vehicule?.marque || 'Véhicule'} {vehicule?.modele || ''}
            </h3>

            {vehicule?.immatriculation && (
              <span className="inline-block rounded-md border border-slate-200/70 bg-slate-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-slate-500">
                {vehicule.immatriculation}
              </span>
            )}
          </div>
        </div>

        {/* Locataire + dates */}
        <div className="mt-5 grid grid-cols-2 gap-2.5 rounded-2xl border border-slate-200/60 bg-slate-50/60 p-3.5 text-xs text-slate-700">
          <div className="flex min-w-0 items-center gap-2.5">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-slate-200/80 bg-white text-[#0A3D2E] shadow-xs">
              <User className="h-3.5 w-3.5" />
            </div>
            <div className="min-w-0">
              <span className="block text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                Locataire
              </span>
              <span className="block truncate font-semibold text-slate-900">{tenantName}</span>
            </div>
          </div>

          <div className="flex min-w-0 items-center gap-2.5">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-slate-200/80 bg-white text-[#0A3D2E] shadow-xs">
              <Calendar className="h-3.5 w-3.5" />
            </div>
            <div className="min-w-0">
              <span className="block text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                Durée ({nbJours} j.)
              </span>
              <span className="block truncate font-medium text-slate-800">
                {formatDate(dateDebut)} → {formatDate(dateFin)}
              </span>
            </div>
          </div>
        </div>

        {/* Revenu + action */}
        <div className="mt-5 flex items-center justify-between gap-3 border-t border-slate-100 pt-4">
          <div>
            <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Revenu net hôte
            </span>
            <span className="font-fraunces text-2xl font-normal tabular-nums text-[#059669]">
              {netAmount.toLocaleString('fr-FR')} FCFA
            </span>
          </div>

          <Link
            href={`/dashboard/reservations/${id}`}
            className="inline-flex items-center gap-1.5 rounded-2xl border border-[#4ADE80]/25 bg-[#041912] px-4 py-2.5 text-xs font-bold text-[#F1DFB6] transition-colors hover:bg-[#0A3D2E] hover:text-[#4ADE80]"
          >
            <span>Gérer</span>
            <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </Link>
        </div>
      </div>
    </motion.div>
  );
};