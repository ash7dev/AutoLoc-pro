'use client';

import React from 'react';
import {
  UserRound,
  ShieldCheck,
  Phone,
  MessageCircle,
  LockKeyhole,
  Clock3,
  CheckCircle2,
  ExternalLink,
} from 'lucide-react';

export interface HostInfo {
  id?: string;
  prenom?: string;
  nom?: string;
  telephone?: string;
  email?: string;
  avatarUrl?: string;
}

interface TenantOwnerContactCardProps {
  statut: string;
  dateDebut: string;
  host?: HostInfo;
  vehiculeName?: string;
}

/**
 * Règle de confidentialité AutoLoc :
 * Les coordonnées directes (téléphone, WhatsApp) de l'hôte sont débloquées :
 * 1. Pendant la location (EN_COURS) ou en cas de litige (LITIGE).
 * 2. 24 heures avant le début de la location si la réservation est CONFIRMEE.
 */
export const canRevealHostContact = (statut: string, dateDebut?: string | Date): boolean => {
  if (!statut) return false;
  const statusUpper = statut.toUpperCase();

  if (statusUpper === 'ANNULEE' || statusUpper === 'TERMINEE') return false;
  if (statusUpper === 'EN_COURS' || statusUpper === 'LITIGE') return true;

  if (statusUpper === 'CONFIRMEE' && dateDebut) {
    const startDate = new Date(dateDebut).getTime();
    const now = Date.now();
    const hoursUntilStart = (startDate - now) / (1000 * 60 * 60);
    return hoursUntilStart <= 24;
  }

  return false;
};

export const TenantOwnerContactCard: React.FC<TenantOwnerContactCardProps> = ({
  statut,
  dateDebut,
  host,
  vehiculeName = 'le véhicule',
}) => {
  const isRevealed = canRevealHostContact(statut, dateDebut);
  const fullName = `${host?.prenom || 'Votre'} ${host?.nom || 'hôte'}`.trim();
  const phone = host?.telephone || '';
  const cleanPhone = phone.replace(/[^0-9+]/g, '');

  const waMessage = encodeURIComponent(
    `Bonjour ${host?.prenom || ''}, je vous contacte au sujet de notre réservation AutoLoc pour ${vehiculeName}.`
  );
  const whatsappUrl = cleanPhone ? `https://wa.me/${cleanPhone}?text=${waMessage}` : '#';

  return (
    <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-5 sm:p-6 space-y-4">
      {/* 1. Header Row */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center shrink-0">
            {host?.avatarUrl ? (
              <img
                src={host.avatarUrl}
                alt={fullName}
                className="w-full h-full rounded-2xl object-cover"
              />
            ) : (
              <UserRound className="w-5 h-5 text-brand-main" />
            )}
          </div>

          <div>
            <span className="block text-[10px] font-extrabold uppercase tracking-widest text-brand-main">
              Votre Hôte AutoLoc
            </span>
            <h3 className="font-fraunces text-xl text-brand-dark font-normal tracking-tight">{fullName}</h3>
          </div>
        </div>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-brand-main text-xs font-bold shrink-0">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>Hôte Vérifié</span>
        </div>
      </div>

      {/* 2. State Content */}
      {isRevealed && phone ? (
        <div className="rounded-2xl bg-emerald-50/60 border border-emerald-200/80 p-4 space-y-3">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-brand-main text-champagne flex items-center justify-center shrink-0">
                <Phone className="w-4 h-4" />
              </div>
              <div>
                <span className="block text-[11px] text-slate-500 font-medium">
                  Téléphone direct
                </span>
                <a
                  href={`tel:${cleanPhone}`}
                  className="font-fraunces text-lg text-brand-dark hover:underline font-normal tracking-tight"
                >
                  {phone}
                </a>
              </div>
            </div>

            <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[11px]">
              Disponible
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
            <a
              href={`tel:${cleanPhone}`}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-full bg-brand-main text-champagne font-bold text-xs hover:bg-forest-700 transition-colors cursor-pointer shadow-xs"
            >
              <Phone className="w-3.5 h-3.5" />
              <span>Appeler l’hôte</span>
            </a>

            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-full bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-700 transition-colors cursor-pointer shadow-xs"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span>WhatsApp</span>
            </a>
          </div>
        </div>
      ) : (
        <div className="rounded-2xl bg-slate-50 border border-slate-200/90 p-4 flex items-start gap-3">
          <div className="w-8 h-8 rounded-xl bg-slate-200/80 text-slate-600 flex items-center justify-center shrink-0 mt-0.5">
            <LockKeyhole className="w-4 h-4" />
          </div>
          <div className="space-y-1">
            <h4 className="font-fraunces text-base text-brand-dark font-normal">Coordonnées protégées par AutoLoc</h4>
            <p className="text-xs text-slate-500 leading-relaxed font-medium">
              {statut === 'CONFIRMEE'
                ? 'Les coordonnées de votre hôte seront débloquées 24 h avant la prise en charge du véhicule.'
                : statut === 'ANNULEE' || statut === 'TERMINEE'
                ? 'La réservation étant clôturée, les coordonnées directes ne sont plus actives.'
                : 'Les coordonnées directes seront transmises une fois la réservation confirmée.'}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
