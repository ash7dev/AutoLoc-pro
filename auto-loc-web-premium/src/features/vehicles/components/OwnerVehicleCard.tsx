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
  Lock,
  Fuel,
  Gauge,
  Users,
  Calendar,
  Sparkles,
  ArrowUpRight,
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
    label: 'Actif & En ligne',
    bg: 'bg-emerald-500/90 text-white border-emerald-400/40',
    icon: CheckCircle2,
    dotColor: 'bg-[#4ADE80]',
  };

  if (statusStr === 'EN_ATTENTE_VALIDATION') {
    badgeInfo = {
      label: 'En attente modération',
      bg: 'bg-amber-500/90 text-white border-amber-400/40',
      icon: Clock,
      dotColor: 'bg-amber-300',
    };
  } else if (statusStr === 'BROUILLON') {
    badgeInfo = {
      label: 'Brouillon',
      bg: 'bg-slate-700/90 text-slate-100 border-slate-600/40',
      icon: FileEdit,
      dotColor: 'bg-slate-400',
    };
  } else if (statusStr === 'ARCHIVE') {
    badgeInfo = {
      label: 'Archivé',
      bg: 'bg-rose-600/90 text-white border-rose-400/40',
      icon: Archive,
      dotColor: 'bg-rose-300',
    };
  }

  const BadgeIcon = badgeInfo.icon;
  const priceNet = Number(vehicle.prixParJour || 0);
  const formattedPrice = formatCurrency(priceNet);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className={`group relative flex flex-col overflow-hidden rounded-[28px] border border-slate-200/90 bg-white shadow-[0_4px_20px_-4px_rgba(4,25,18,0.06)] transition-all duration-300 hover:border-slate-300 hover:shadow-[0_20px_40px_-15px_rgba(4,25,18,0.18)] ${className}`}
    >
      {/* ── Photo Banner & Overlays ─────────────────────────────────── */}
      <div className="relative h-52 w-full overflow-hidden bg-[#041912]">
        <Image
          src={photoUrl}
          alt={`${vehicle.marque} ${vehicle.modele}`}
          fill
          className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
          unoptimized
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#041912]/90 via-[#041912]/20 to-black/30" />

        {/* Top Floating Badges */}
        <div className="pointer-events-none absolute left-3.5 right-3.5 top-3.5 z-10 flex items-center justify-between gap-2">
          {/* Status Badge */}
          <span
            className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[11px] font-bold shadow-md backdrop-blur-md ${badgeInfo.bg}`}
          >
            <span className={`h-1.5 w-1.5 rounded-full ${badgeInfo.dotColor}`} />
            <BadgeIcon className="h-3.5 w-3.5" />
            <span>{badgeInfo.label}</span>
          </span>

          {/* Active Rental Badge if locked */}
          {isLocked ? (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-300/60 bg-amber-500/95 px-3 py-1 text-[11px] font-bold text-white shadow-md backdrop-blur-md">
              <span className="h-2 w-2 rounded-full bg-white animate-ping" />
              <span>Loué (En cours)</span>
            </span>
          ) : (
            Number(vehicle.note || 0) > 0 && (
              <span className="inline-flex items-center gap-1 rounded-full border border-white/20 bg-slate-950/70 px-2.5 py-1 text-[11px] font-bold text-amber-300 backdrop-blur-md">
                <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                <span>{Number(vehicle.note).toFixed(1)}</span>
                {vehicle.totalAvis ? (
                  <span className="text-white/60">({vehicle.totalAvis})</span>
                ) : null}
              </span>
            )
          )}
        </div>

        {/* Bottom Banner Info: Immatriculation & Ville */}
        <div className="absolute bottom-3.5 left-4 right-4 z-10 flex items-center justify-between text-white">
          <span className="flex items-center gap-1.5 text-xs font-semibold text-slate-100">
            <MapPin className="h-3.5 w-3.5 text-[#4ADE80]" />
            <span>{vehicle.ville || 'Dakar'}</span>
          </span>

          {vehicle.immatriculation && (
            <span className="inline-flex items-center gap-1 rounded-lg border border-emerald-500/30 bg-[#041912]/90 px-2.5 py-1 font-mono text-[11px] font-bold tracking-wider text-[#4ADE80] shadow-xs backdrop-blur-xs">
              <ShieldCheck className="h-3 w-3" />
              <span>{vehicle.immatriculation}</span>
            </span>
          )}
        </div>
      </div>

      {/* ── Content Section ────────────────────────────────────────── */}
      <div className="flex flex-1 flex-col p-5">
        {/* Title & Type */}
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3
              className="text-xl font-normal leading-tight text-[#041912]"
              style={{ fontFamily: SERIF }}
            >
              {vehicle.marque} {vehicle.modele}
            </h3>
            <p className="mt-1 text-xs font-medium text-slate-500">
              Année {vehicle.annee} · Catégorie <span className="font-semibold text-slate-700">{vehicle.type}</span>
            </p>
          </div>

          <div className="shrink-0 rounded-2xl bg-emerald-50 px-3 py-1.5 text-right border border-emerald-100">
            <span className="block text-[10px] font-semibold uppercase tracking-wide text-emerald-800">
              Tarif / jour
            </span>
            <span className="font-fraunces text-lg font-bold text-[#0A3D2E]">
              {formattedPrice} <span className="text-xs font-sans text-slate-600">FCFA</span>
            </span>
          </div>
        </div>

        {/* Technical Features Grid */}
        <div className="mt-4 grid grid-cols-3 divide-x divide-slate-100 rounded-2xl bg-slate-50/80 border border-slate-100 py-2.5 text-center text-xs text-slate-600">
          <div className="flex items-center justify-center gap-1.5">
            <Gauge className="h-3.5 w-3.5 text-[#059669]" />
            <span className="font-medium">
              {vehicle.transmission === 'AUTOMATIQUE' ? 'Auto' : 'Manuel'}
            </span>
          </div>
          <div className="flex items-center justify-center gap-1.5">
            <Fuel className="h-3.5 w-3.5 text-[#059669]" />
            <span className="font-medium">{vehicle.carburant || 'Essence'}</span>
          </div>
          <div className="flex items-center justify-center gap-1.5">
            <Users className="h-3.5 w-3.5 text-[#059669]" />
            <span className="font-medium">{vehicle.nombrePlaces || 5} places</span>
          </div>
        </div>

        {/* Performance KPI Row */}
        <div className="mt-4 flex items-center justify-between rounded-2xl border border-slate-100 bg-white p-3 text-xs">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
              <Car className="h-4 w-4" />
            </div>
            <div>
              <span className="block text-[10px] font-semibold uppercase text-slate-400">
                Total Locations
              </span>
              <span className="font-bold text-slate-900">
                {vehicle.totalLocations || 0} réservation{vehicle.totalLocations && vehicle.totalLocations > 1 ? 's' : ''}
              </span>
            </div>
          </div>

          <div className="text-right">
            <span className="block text-[10px] font-semibold uppercase text-slate-400">
              Disponibilité
            </span>
            <span className="inline-flex items-center gap-1 font-bold text-emerald-700">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              Ouvert à la résa
            </span>
          </div>
        </div>

        {/* Action Buttons Bar */}
        <div className="mt-5 grid grid-cols-2 gap-2.5 pt-3 border-t border-slate-100">
          <Link
            href={`/dashboard/vehicles/${vehicle.id}`}
            className="inline-flex items-center justify-center gap-1.5 rounded-2xl border border-slate-200/90 bg-slate-50 px-3.5 py-2.5 text-xs font-bold text-slate-700 transition-all hover:border-slate-300 hover:bg-slate-100 active:scale-[0.98]"
          >
            <Eye className="h-3.5 w-3.5 text-slate-500" />
            <span>Fiche & Calendrier</span>
          </Link>

          <Link
            href={`/dashboard/vehicles/${vehicle.id}/edit`}
            className="inline-flex items-center justify-center gap-1.5 rounded-2xl bg-[#041912] px-3.5 py-2.5 text-xs font-bold text-[#F1DFB6] shadow-sm transition-all hover:bg-[#0A3D2E] active:scale-[0.98]"
          >
            <Edit className="h-3.5 w-3.5 text-[#4ADE80]" />
            <span>Modifier l’annonce</span>
          </Link>
        </div>
      </div>
    </motion.div>
  );
};
