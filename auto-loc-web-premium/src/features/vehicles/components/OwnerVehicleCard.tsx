'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Car,
  Edit,
  Eye,
  CheckCircle2,
  Clock,
  FileEdit,
  Archive,
  Star,
  MapPin,
  Fuel,
  Gauge,
  Users,
  ShieldCheck,
} from 'lucide-react';
import { Vehicle } from '../types/vehicle.types';
import { formatCurrency } from '@/lib/utils';

export interface OwnerVehicleCardProps {
  vehicle: Vehicle;
  onRefresh?: () => void;
  className?: string;
}

const SERIF = 'var(--font-gloock), var(--font-fraunces), Georgia, serif';

export const OwnerVehicleCard: React.FC<OwnerVehicleCardProps> = ({
  vehicle,
  onRefresh,
  className = '',
}) => {
  const defaultImg =
    'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=800&q=80';
  const firstPhoto = vehicle.photos && vehicle.photos[0];
  const photoUrl =
    vehicle.photoUrl ||
    (typeof firstPhoto === 'string' ? firstPhoto : firstPhoto?.url) ||
    defaultImg;

  const isLocked = Boolean((vehicle as any).estVerrouille);
  const statusStr = (vehicle.statut || '').toUpperCase();

  let badgeInfo = {
    label: 'Actif',
    bg: 'bg-brand-main/85 text-champagne border-white/10',
    icon: CheckCircle2,
    dot: 'bg-emerald-400',
  };

  if (statusStr === 'EN_ATTENTE_VALIDATION') {
    badgeInfo = {
      label: 'En modération',
      bg: 'bg-amber-500/90 text-white border-amber-300/30',
      icon: Clock,
      dot: 'bg-white',
    };
  } else if (statusStr === 'BROUILLON') {
    badgeInfo = {
      label: 'Brouillon',
      bg: 'bg-slate-800/85 text-slate-100 border-white/10',
      icon: FileEdit,
      dot: 'bg-slate-300',
    };
  } else if (statusStr === 'ARCHIVE') {
    badgeInfo = {
      label: 'Archivé',
      bg: 'bg-rose-700/85 text-white border-rose-300/20',
      icon: Archive,
      dot: 'bg-rose-200',
    };
  }

  const BadgeIcon = badgeInfo.icon;
  const priceNet = Number(vehicle.prixParJour || 0);
  const formattedPrice = formatCurrency(priceNet);
  const totalLocations = vehicle.totalLocations || 0;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.97 }}
      whileHover={{ y: -3 }}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      className={`group relative overflow-hidden rounded-2xl border border-brand-dark/8 bg-white shadow-[0_1px_2px_rgba(4,25,18,0.04),0_12px_28px_-14px_rgba(4,25,18,0.18)] transition-shadow duration-300 hover:shadow-[0_1px_2px_rgba(4,25,18,0.06),0_20px_36px_-16px_rgba(4,25,18,0.26)] sm:rounded-[26px] ${className}`}
    >
      {/* 📱 MOBILE — vue liste */}
      <div className="flex sm:hidden flex-col p-3">
        <div className="flex items-start gap-3">
          <div className="relative h-[104px] w-[104px] shrink-0 overflow-hidden rounded-xl bg-brand-dark">
            <Image
              src={photoUrl}
              alt={`${vehicle.marque} ${vehicle.modele}`}
              fill
              className="object-cover"
              unoptimized
            />
            <div className="absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-black/55 to-transparent" />
            {isLocked && (
              <span className="absolute bottom-1.5 left-1.5 right-1.5 rounded-md bg-amber-500/95 px-1.5 py-0.5 text-center text-[9px] font-bold text-white">
                En cours de location
              </span>
            )}
          </div>

          <div className="flex flex-1 flex-col justify-between min-w-0 min-h-[104px]">
            <div>
              <div className="flex items-center gap-1.5">
                <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${badgeInfo.dot}`} />
                <span className="text-[10px] font-semibold text-slate-500">{badgeInfo.label}</span>
              </div>
              <h3
                className="mt-0.5 text-[17px] leading-tight text-brand-dark truncate"
                style={{ fontFamily: SERIF }}
              >
                {vehicle.marque} {vehicle.modele}
              </h3>
              <p className="mt-0.5 text-[11px] text-slate-500">
                {vehicle.annee} · {vehicle.type}
                {vehicle.immatriculation ? ` · ${vehicle.immatriculation}` : ''}
              </p>
            </div>

            <div className="flex items-baseline justify-between gap-2">
              <span className="text-[15px] font-semibold text-brand-main" style={{ fontFamily: SERIF }}>
                {formattedPrice}
                <span className="ml-1 text-[10px] font-sans font-normal text-slate-400">FCFA / jour</span>
              </span>
            </div>
          </div>
        </div>

        <div className="mt-3 grid grid-cols-2 gap-2 border-t border-slate-100 pt-2.5">
          <Link
            href={`/dashboard/vehicles/${vehicle.id}`}
            className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 py-2 text-xs font-semibold text-slate-700 active:bg-slate-50"
          >
            <Eye className="h-3.5 w-3.5 text-slate-400" />
            Fiche & réso
          </Link>
          <Link
            href={`/dashboard/vehicles/${vehicle.id}/edit`}
            className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-brand-dark py-2 text-xs font-semibold text-champagne active:bg-brand-main"
          >
            <Edit className="h-3.5 w-3.5 text-emerald-400" />
            Modifier
          </Link>
        </div>
      </div>

      {/* 💻 DESKTOP — vue carte */}
      <div className="hidden sm:flex sm:flex-col">
        {/* Photo */}
        <div className="relative h-48 w-full overflow-hidden bg-brand-dark">
          <Image
            src={photoUrl}
            alt={`${vehicle.marque} ${vehicle.modele}`}
            fill
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
            unoptimized
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#041912]/85 via-[#041912]/10 to-transparent" />

          <div className="pointer-events-none absolute left-4 right-4 top-4 flex items-start justify-between gap-2">
            <span
              className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold shadow-sm backdrop-blur-md ${badgeInfo.bg}`}
            >
              <BadgeIcon className="h-3 w-3" />
              {badgeInfo.label}
            </span>

            {isLocked ? (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-300/40 bg-amber-500/95 px-2.5 py-1 text-[11px] font-semibold text-white shadow-sm">
                <span className="h-1.5 w-1.5 rounded-full bg-white" />
                En cours
              </span>
            ) : (
              Number(vehicle.note || 0) > 0 && (
                <span className="inline-flex items-center gap-1 rounded-full border border-white/15 bg-black/35 px-2.5 py-1 text-[11px] font-semibold text-amber-300 backdrop-blur-md">
                  <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                  {Number(vehicle.note).toFixed(1)}
                  {vehicle.totalAvis ? (
                    <span className="text-white/55">({vehicle.totalAvis})</span>
                  ) : null}
                </span>
              )
            )}
          </div>

          <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between text-white">
            <span className="flex items-center gap-1.5 text-[13px] font-medium">
              <MapPin className="h-3.5 w-3.5 text-emerald-400" />
              {vehicle.ville || 'Dakar'}
            </span>
            {vehicle.immatriculation && (
              <span className="inline-flex items-center gap-1.5 rounded-md border border-white/15 bg-brand-dark/70 px-2 py-1 font-mono text-[11px] tracking-wider text-champagne/90 backdrop-blur-sm">
                <ShieldCheck className="h-3 w-3 text-emerald-400" />
                {vehicle.immatriculation}
              </span>
            )}
          </div>
        </div>

        {/* Contenu */}
        <div className="flex flex-1 flex-col px-5 pb-5 pt-4">
          <div className="flex items-start justify-between gap-4">
            <h3 className="text-[22px] leading-tight text-brand-dark" style={{ fontFamily: SERIF }}>
              {vehicle.marque} {vehicle.modele}
            </h3>
            <div className="shrink-0 text-right">
              <span className="block text-[20px] font-semibold leading-tight text-brand-main" style={{ fontFamily: SERIF }}>
                {formattedPrice}
              </span>
              <span className="text-[11px] text-slate-400">FCFA / jour</span>
            </div>
          </div>
          <p className="mt-1 text-[12.5px] text-slate-500">
            {vehicle.annee} · {vehicle.type}
          </p>

          {/* Caractéristiques — ligne fine, pas de bloc encadré */}
          <div className="mt-3.5 flex items-center gap-4 border-y border-slate-100 py-2.5 text-[12.5px] text-slate-600">
            <span className="flex items-center gap-1.5">
              <Gauge className="h-3.5 w-3.5 text-emerald-600" />
              {vehicle.transmission === 'AUTOMATIQUE' ? 'Automatique' : 'Manuelle'}
            </span>
            <span className="h-3 w-px bg-slate-200" />
            <span className="flex items-center gap-1.5">
              <Fuel className="h-3.5 w-3.5 text-emerald-600" />
              {vehicle.carburant || 'Essence'}
            </span>
            <span className="h-3 w-px bg-slate-200" />
            <span className="flex items-center gap-1.5">
              <Users className="h-3.5 w-3.5 text-emerald-600" />
              {vehicle.nombrePlaces || 5} places
            </span>
          </div>

          {/* Ligne de performance, intégrée plutôt qu'encadrée */}
          <div className="mt-3 flex items-center justify-between text-[12.5px]">
            <span className="flex items-center gap-1.5 text-slate-500">
              <Car className="h-3.5 w-3.5 text-slate-400" />
              {totalLocations} réservation{totalLocations > 1 ? 's' : ''} au total
            </span>
            <span className="flex items-center gap-1.5 font-medium text-brand-main">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              Ouvert à la réservation
            </span>
          </div>

          {/* Actions */}
          <div className="mt-4 grid grid-cols-2 gap-2.5">
            <Link
              href={`/dashboard/vehicles/${vehicle.id}`}
              className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 py-2.5 text-[13px] font-semibold text-slate-700 transition-colors hover:border-slate-300 hover:bg-slate-50"
            >
              <Eye className="h-3.5 w-3.5 text-slate-400" />
              Fiche & calendrier
            </Link>
            <Link
              href={`/dashboard/vehicles/${vehicle.id}/edit`}
              className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-brand-dark py-2.5 text-[13px] font-semibold text-champagne shadow-sm transition-colors hover:bg-brand-main"
            >
              <Edit className="h-3.5 w-3.5 text-emerald-400" />
              Modifier l'annonce
            </Link>
          </div>
        </div>
      </div>
    </motion.div>
  );
};