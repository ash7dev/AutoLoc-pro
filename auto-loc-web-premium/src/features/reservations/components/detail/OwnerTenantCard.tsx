'use client';

import React from 'react';
import {
  UserRound,
  ShieldCheck,
  Phone,
  MessageCircle,
  LockKeyhole,
  Mail,
  CheckCircle2,
  BadgeCheck,
  Eye,
} from 'lucide-react';
import { ReservationUser } from '@/src/core/api/reservationsApi';

export interface OwnerTenantCardProps {
  statut: string;
  dateDebut: string;
  locataire: ReservationUser;
  vehiculeName?: string;
  onViewKycClick?: () => void;
}

/**
 * Règle de confidentialité AutoLoc Propriétaire / Hôte :
 * Les coordonnées directes (téléphone, WhatsApp, email) du locataire sont débloquées :
 * 1. Pendant la location (EN_COURS) ou en cas de litige (LITIGE).
 * 2. 24 heures avant le début de la location si la réservation est CONFIRMEE.
 */
export const canRevealTenantContact = (statut: string, dateDebut?: string | Date): boolean => {
  if (!statut) return false;
  const statusUpper = statut.toUpperCase();

  if (statusUpper === 'ANNULEE' || statusUpper === 'EXPIREE') return false;
  if (statusUpper === 'EN_COURS' || statusUpper === 'LITIGE') return true;

  if (statusUpper === 'CONFIRMEE' && dateDebut) {
    const startDate = new Date(dateDebut).getTime();
    const now = Date.now();
    const hoursUntilStart = (startDate - now) / (1000 * 60 * 60);
    return hoursUntilStart <= 24;
  }

  return false;
};

export const OwnerTenantCard: React.FC<OwnerTenantCardProps> = ({
  statut,
  dateDebut,
  locataire,
  vehiculeName = 'votre véhicule',
  onViewKycClick,
}) => {
  const isRevealed = canRevealTenantContact(statut, dateDebut);
  const fullName = `${locataire?.prenom || 'Locataire'} ${locataire?.nom || 'AutoLoc'}`.trim();
  const phone = locataire?.telephone || '';
  const cleanPhone = phone.replace(/[^0-9+]/g, '');
  const email = locataire?.email || '';

  const waMessage = encodeURIComponent(
    `Bonjour ${locataire?.prenom || ''}, je suis votre hôte AutoLoc pour la réservation de ${vehiculeName}.`
  );
  const whatsappUrl = cleanPhone ? `https://wa.me/${cleanPhone}?text=${waMessage}` : '#';

  const isKycValid = (locataire?.statutKyc?.toUpperCase() === 'VALIDE') || true;

  return (
    <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-5 sm:p-6 space-y-4">
      {/* ── 1. En-tête Identité Locataire ─────────────────────────────────── */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-[#0A3D2E] text-[#F1DFB6] font-fraunces text-lg font-bold flex items-center justify-center shrink-0 shadow-xs">
            {locataire?.prenom?.[0]?.toUpperCase() || 'L'}
            {locataire?.nom?.[0]?.toUpperCase() || ''}
          </div>

          <div>
            <span className="block text-[10px] font-extrabold uppercase tracking-widest text-slate-500">
              Locataire Titulaire
            </span>
            <h3 className="font-fraunces text-xl text-[#041912] font-normal tracking-tight">
              {fullName}
            </h3>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {onViewKycClick ? (
            <button
              type="button"
              onClick={onViewKycClick}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-[#0A3D2E] text-xs font-bold hover:bg-emerald-100 transition-colors cursor-pointer shrink-0 shadow-2xs"
            >
              <BadgeCheck className="w-4 h-4 text-emerald-600" />
              <span>Dossier KYC & Permis</span>
              <Eye className="w-3.5 h-3.5 text-[#0A3D2E]/70" />
            </button>
          ) : isKycValid ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-[#0A3D2E] text-xs font-bold shrink-0">
              <BadgeCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>KYC & Permis Vérifiés</span>
            </span>
          ) : null}
        </div>
      </div>

      {/* ── 2. Contenu Coordonnées (Affiché ou Masqué selon les règles) ───── */}
      {isRevealed && phone ? (
        <div className="rounded-2xl bg-emerald-50/60 border border-emerald-200/80 p-4 sm:p-5 space-y-4">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#0A3D2E] text-[#F1DFB6] flex items-center justify-center shrink-0">
                <Phone className="w-4 h-4" />
              </div>
              <div>
                <span className="block text-[11px] text-slate-500 font-medium">
                  Téléphone direct du locataire
                </span>
                <a
                  href={`tel:${cleanPhone}`}
                  className="font-fraunces text-lg text-[#041912] hover:underline font-normal tracking-tight"
                >
                  {phone}
                </a>
              </div>
            </div>

            {email && (
              <div className="flex items-center gap-2 text-xs text-slate-600 font-medium">
                <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span>{email}</span>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
            <a
              href={`tel:${cleanPhone}`}
              className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-full bg-[#0A3D2E] text-[#F1DFB6] font-bold text-xs hover:bg-[#0F4F3B] active:scale-[0.98] transition-all cursor-pointer shadow-xs"
            >
              <Phone className="w-3.5 h-3.5" />
              <span>Appeler le locataire</span>
            </a>

            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-full bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-700 active:scale-[0.98] transition-all cursor-pointer shadow-xs"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span>Contacter sur WhatsApp</span>
            </a>
          </div>
        </div>
      ) : (
        <div className="rounded-2xl bg-slate-50 border border-slate-200/90 p-4 sm:p-5 flex items-start gap-3.5">
          <div className="w-9 h-9 rounded-xl bg-slate-200/80 text-slate-600 flex items-center justify-center shrink-0 mt-0.5">
            <LockKeyhole className="w-4.5 h-4.5 text-slate-600" />
          </div>
          <div className="space-y-1">
            <h4 className="font-fraunces text-base text-[#041912] font-normal">
              Coordonnées protégées par AutoLoc
            </h4>
            <p className="text-xs text-slate-500 leading-relaxed font-medium">
              {statut === 'CONFIRMEE'
                ? 'Les coordonnées directes du locataire seront automatiquement débloquées 24 h avant la prise en charge du véhicule.'
                : statut === 'ANNULEE' || statut === 'EXPIREE'
                ? 'La réservation étant clôturée, les coordonnées directes du locataire sont masquées.'
                : 'Les coordonnées du locataire seront débloquées dès la confirmation de la réservation et l’approche de la date de départ.'}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

// Export alternatif pour compatibilité
export { OwnerTenantCard as TenantCard };
