'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ShieldCheck, Star } from 'lucide-react';
import { Proprietaire } from '../types/vehicle.types';

interface VehicleOwnerCardProps {
  proprietaire?: Proprietaire;
  /** Lien vers la page profil du propriétaire (prioritaire sur onViewProfile) */
  profileHref?: string;
  /** Callback si le profil s'ouvre autrement que par un lien (modale, drawer...) */
  onViewProfile?: () => void;
}

const ACTION_CLASS =
  'w-full sm:w-auto inline-flex items-center justify-center px-5 py-2.5 rounded-full border border-brand-main text-brand-main font-semibold text-sm cursor-pointer transition-colors hover:bg-brand-main hover:text-champagne focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-main focus-visible:ring-offset-2';

export function VehicleOwnerCard({
  proprietaire,
  profileHref,
  onViewProfile,
}: VehicleOwnerCardProps) {
  if (!proprietaire) return null;

  const fullName =
    [proprietaire.prenom, proprietaire.nom].filter(Boolean).join(' ').trim() ||
    'Hôte partenaire';

  const initials =
    `${proprietaire.prenom?.[0] || 'A'}${proprietaire.nom?.[0] || 'L'}`.toUpperCase();

  // On n'affiche une note que si elle existe réellement
  const note = Number(proprietaire.noteProprietaire);
  const totalAvis = Number(proprietaire.totalAvis) || 0;
  const hasRating = note > 0 && totalAvis > 0;

  const canViewProfile = Boolean(profileHref || onViewProfile);

  return (
    <section
      aria-label="Votre hôte"
      className="bg-white border border-slate-200/80 rounded-[28px] overflow-hidden shadow-sm"
    >
      <h3 className="px-5 sm:px-6 pt-5 sm:pt-6 pb-4 text-lg text-brand-dark font-fraunces font-normal">
        Votre hôte
      </h3>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5 px-5 sm:px-6 py-5 border-t border-slate-200/80">
        {/* Identité de l'hôte */}
        <div className="flex items-center gap-4 min-w-0">
          {proprietaire.avatarUrl ? (
            <Image
              src={proprietaire.avatarUrl}
              alt={fullName}
              width={56}
              height={56}
              className="w-14 h-14 shrink-0 rounded-full object-cover ring-2 ring-champagne"
            />
          ) : (
            <div
              aria-hidden="true"
              className="w-14 h-14 shrink-0 rounded-full bg-brand-main text-champagne font-display text-lg flex items-center justify-center ring-2 ring-champagne"
            >
              {initials}
            </div>
          )}

          <div className="min-w-0">
            <h4 className="text-base font-semibold text-slate-900 truncate">{fullName}</h4>

            <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
              <span className="inline-flex items-center gap-1.5 font-medium text-brand-main">
                <ShieldCheck className="w-4 h-4" strokeWidth={1.75} aria-hidden="true" />
                Hôte vérifié
              </span>

              {hasRating ? (
                <span className="inline-flex items-center gap-1.5 text-slate-500">
                  <Star
                    className="w-4 h-4 fill-[#0A3D2E] text-brand-main"
                    aria-hidden="true"
                  />
                  <span className="font-semibold text-slate-900">
                    {note.toFixed(1).replace('.', ',')}
                  </span>
                  ({totalAvis} avis)
                </span>
              ) : (
                <span className="text-slate-500">Pas encore d'avis</span>
              )}
            </div>
          </div>
        </div>

        {/* Voir le profil */}
        {canViewProfile &&
          (profileHref ? (
            <Link href={profileHref} className={ACTION_CLASS}>
              Voir le profil
            </Link>
          ) : (
            <button type="button" onClick={onViewProfile} className={ACTION_CLASS}>
              Voir le profil
            </button>
          ))}
      </div>
    </section>
  );
}