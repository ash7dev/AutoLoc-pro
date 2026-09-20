'use client';

import React, { useEffect, useId, useMemo, useState } from 'react';
import Image from 'next/image';
import {
  Calendar,
  ChevronRight,
  Home,
  MapPin,
  Navigation,
  Plane,
  ShieldCheck,
  Truck,
  type LucideIcon,
} from 'lucide-react';
import { formatCurrency, getTenantPricePerDay } from '@/lib/utils';
import { TarifProgressif } from '../types/vehicle.types';

export type TypeLivraison = 'AUCUNE' | 'DAKAR' | 'AIBD';

export interface BookNowParams {
  startDate?: string;
  endDate?: string;
  horsDakar: boolean;
  includeDelivery: boolean;
  typeLivraison?: TypeLivraison;
  adresseLivraison?: string;
  totalAmount: number;
  daysCount: number;
}

interface VehicleBookingSidebarProps {
  vehicleId: string;
  baseOwnerPrice: number;
  autoriseHorsDakar?: boolean;
  supplementHorsDakarParJour?: number | null;
  proposeLivraisonDakar?: boolean;
  fraisLivraisonDakar?: number | null;
  proposeLivraisonAibd?: boolean;
  fraisLivraisonAibd?: number | null;
  /** Ancien champ, conservé pour compatibilité : équivaut à fraisLivraisonDakar */
  fraisLivraison?: number | null;
  tarifsProgressifs?: TarifProgressif[];
  joursMinimum?: number;
  startDate?: string;
  endDate?: string;
  onSelectDatesClick?: () => void;
  onBookNow?: (params: BookNowParams) => void;
}

/* -------------------------------------------------------------------------- */
/* Helpers                                                                    */
/* -------------------------------------------------------------------------- */

const MS_PER_DAY = 1000 * 60 * 60 * 24;

const shortDateFormatter = new Intl.DateTimeFormat('fr-FR', {
  day: 'numeric',
  month: 'short',
});
const longDateFormatter = new Intl.DateTimeFormat('fr-FR', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
});

const formatShortDate = (value: string, withYear = false) =>
  (withYear ? longDateFormatter : shortDateFormatter).format(new Date(value));

/** Convertit une valeur potentiellement nulle / NaN en nombre sûr. */
const toNumber = (value: number | string | null | undefined): number => {
  const n = Number(value ?? 0);
  return Number.isFinite(n) ? n : 0;
};

/** 0 tant que les deux dates ne sont pas choisies, sinon minimum 1 jour. */
const countDays = (startDate?: string, endDate?: string): number => {
  if (!startDate || !endDate) return 0;
  const diff = Math.ceil(
    (new Date(endDate).getTime() - new Date(startDate).getTime()) / MS_PER_DAY,
  );
  if (!Number.isFinite(diff)) return 0;
  return diff > 0 ? diff : 1;
};

const feeLabel = (fee: number) => (fee > 0 ? `+${formatCurrency(fee)} F` : 'Gratuite');

const plural = (n: number, word: string) => `${n} ${word}${n > 1 ? 's' : ''}`;

/* -------------------------------------------------------------------------- */
/* Sous-composants                                                            */
/* -------------------------------------------------------------------------- */

interface OptionRowProps {
  type: 'radio' | 'checkbox';
  name?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  icon: LucideIcon;
  title: string;
  hint: string;
  price: string;
  isFree?: boolean;
}

function OptionRow({
  type,
  name,
  checked,
  onChange,
  icon: Icon,
  title,
  hint,
  price,
  isFree = false,
}: OptionRowProps) {
  return (
    <label
      className={`flex cursor-pointer items-center justify-between gap-3 rounded-2xl border px-3.5 py-3 transition-colors has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-[#041912] has-[:focus-visible]:ring-offset-2 ${checked
          ? 'border-[#041912] bg-[#041912]/[0.04] ring-1 ring-[#041912]'
          : 'border-slate-200 hover:border-slate-300'
        }`}
    >
      <div className="flex min-w-0 items-center gap-3">
        <input
          type={type}
          name={name}
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="h-4 w-4 shrink-0 cursor-pointer accent-[#041912]"
        />
        <Icon
          className="h-[18px] w-[18px] shrink-0 text-[#041912]/70"
          strokeWidth={1.5}
          aria-hidden="true"
        />
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-slate-900">{title}</p>
          <p className="truncate text-xs text-slate-500">{hint}</p>
        </div>
      </div>
      <span
        className={`shrink-0 text-xs font-semibold tabular-nums ${isFree ? 'text-emerald-700' : 'text-slate-900'
          }`}
      >
        {price}
      </span>
    </label>
  );
}

function SummaryLine({
  label,
  value,
  small = false,
}: {
  label: string;
  value: string;
  small?: boolean;
}) {
  return (
    <div className={`flex justify-between gap-4 ${small ? 'text-xs' : ''}`}>
      <dt>{label}</dt>
      <dd className="font-medium tabular-nums text-[#F1DFB6]">{value}</dd>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Composant principal                                                        */
/* -------------------------------------------------------------------------- */

export function VehicleBookingSidebar({
  vehicleId,
  baseOwnerPrice,
  autoriseHorsDakar = false,
  supplementHorsDakarParJour = 0,
  proposeLivraisonDakar = false,
  fraisLivraisonDakar,
  proposeLivraisonAibd = false,
  fraisLivraisonAibd,
  fraisLivraison,
  tarifsProgressifs = [],
  joursMinimum = 1,
  startDate,
  endDate,
  onSelectDatesClick,
  onBookNow,
}: VehicleBookingSidebarProps) {
  const deliveryGroupName = useId();
  const [horsDakar, setHorsDakar] = useState(false);
  const [typeLivraison, setTypeLivraison] = useState<TypeLivraison>('AUCUNE');
  const [adresseLivraison, setAdresseLivraison] = useState('');

  // Évite de garder des options d'un véhicule à l'autre (navigation client-side)
  useEffect(() => {
    setHorsDakar(false);
    setTypeLivraison('AUCUNE');
    setAdresseLivraison('');
  }, [vehicleId]);

  /* ------------------------------ Durée ---------------------------------- */

  const daysCount = useMemo(() => countDays(startDate, endDate), [startDate, endDate]);
  const hasDates = daysCount > 0;
  const belowMinimum = hasDates && daysCount < joursMinimum;

  /* ------------------------------ Tarifs --------------------------------- */

  // Tarif propriétaire effectif selon la grille dégressive
  const effectiveOwnerPricePerDay = useMemo(() => {
    if (tarifsProgressifs.length === 0) return baseOwnerPrice;

    // Tant qu'aucune date n'est choisie, on affiche le tarif de 1 jour
    const days = Math.max(daysCount, 1);
    const matchingTier = tarifsProgressifs.find((tier) => {
      const min = Number(tier.joursMin);
      const max = tier.joursMax ? Number(tier.joursMax) : Infinity;
      return days >= min && days <= max;
    });
    return matchingTier ? Number(matchingTier.prix) : baseOwnerPrice;
  }, [baseOwnerPrice, tarifsProgressifs, daysCount]);

  // Tarif locataire par jour (commission AutoLoc incluse)
  const tenantPricePerDay = getTenantPricePerDay(effectiveOwnerPricePerDay);
  const baseTenantPricePerDay = getTenantPricePerDay(baseOwnerPrice);

  const discountPercent =
    baseTenantPricePerDay > 0
      ? Math.round(((baseTenantPricePerDay - tenantPricePerDay) / baseTenantPricePerDay) * 100)
      : 0;

  /* ------------------------------ Options -------------------------------- */

  const dakarFee = toNumber(fraisLivraisonDakar ?? fraisLivraison);
  const aibdFee = toNumber(fraisLivraisonAibd);
  const horsDakarSupplement = toNumber(supplementHorsDakarParJour);

  const canDeliverDakar =
    proposeLivraisonDakar || (fraisLivraison !== undefined && fraisLivraison !== null);
  const canDeliverAibd = proposeLivraisonAibd;
  const hasDeliveryOptions = canDeliverDakar || canDeliverAibd;
  const hasOptions = autoriseHorsDakar || hasDeliveryOptions;

  /* ------------------------------ Totaux --------------------------------- */

  const baseTotal = tenantPricePerDay * daysCount;
  const horsDakarTotal = horsDakar && autoriseHorsDakar ? horsDakarSupplement * daysCount : 0;
  const deliveryTotal =
    typeLivraison === 'DAKAR' ? dakarFee : typeLivraison === 'AIBD' ? aibdFee : 0;
  const totalAmount = baseTotal + horsDakarTotal + deliveryTotal;

  /* ------------------------------ Actions -------------------------------- */

  const ctaLabel = !hasDates
    ? 'Choisir les dates'
    : belowMinimum
      ? 'Modifier les dates'
      : 'Réserver ce véhicule';

  const handleCtaClick = () => {
    // Pas de dates valides : on ouvre le sélecteur plutôt que de réserver dans le vide
    if (!hasDates || belowMinimum) {
      onSelectDatesClick?.();
      return;
    }
    onBookNow?.({
      startDate,
      endDate,
      horsDakar: horsDakar && autoriseHorsDakar,
      includeDelivery: typeLivraison !== 'AUCUNE',
      typeLivraison,
      adresseLivraison,
      totalAmount,
      daysCount,
    });
  };

  /* ------------------------------ Rendu ---------------------------------- */

  return (
    <aside
      aria-label="Réservation"
      className="sticky top-28 overflow-hidden rounded-[28px] border border-slate-200/80 bg-white shadow-xl shadow-slate-200/50"
    >
      {/* Tarif journalier */}
      <div className="flex items-end justify-between gap-4 px-6 pb-5 pt-6">
        <div>
          {discountPercent > 0 && (
            <p className="mb-1 text-sm tabular-nums text-slate-400 line-through">
              {formatCurrency(baseTenantPricePerDay)}
            </p>
          )}
          <p className="flex items-baseline gap-2">
            <span className="font-display text-4xl leading-none tabular-nums text-[#041912]">
              {formatCurrency(tenantPricePerDay)}
            </span>
            <span className="text-sm text-slate-500">FCFA / jour</span>
          </p>
        </div>

        {discountPercent > 0 && (
          <span className="shrink-0 rounded-full bg-[#F1DFB6]/60 px-3 py-1 text-xs font-semibold text-[#041912]">
            −{discountPercent}&nbsp;% longue durée
          </span>
        )}
      </div>

      <div className="space-y-5 px-6 pb-6">
        {/* Sélecteur de dates */}
        <div className="space-y-2">
          <button
            type="button"
            onClick={onSelectDatesClick}
            className="flex w-full cursor-pointer items-center justify-between gap-3 rounded-2xl border border-slate-200 px-4 py-3.5 text-left transition-colors hover:border-[#041912]/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#041912] focus-visible:ring-offset-2"
          >
            <div className="flex min-w-0 items-center gap-3">
              <Calendar
                className="h-5 w-5 shrink-0 text-[#041912]"
                strokeWidth={1.5}
                aria-hidden="true"
              />
              <div className="min-w-0">
                {startDate && endDate ? (
                  <p className="text-sm font-semibold text-slate-900">
                    {formatShortDate(startDate)} – {formatShortDate(endDate, true)}
                  </p>
                ) : startDate ? (
                  <p className="text-sm font-semibold text-slate-900">
                    Dès le {formatShortDate(startDate, true)}, choisir la fin
                  </p>
                ) : (
                  <p className="text-sm font-semibold text-slate-900">Choisir les dates</p>
                )}
                <p className="text-xs text-slate-500">
                  {hasDates ? plural(daysCount, 'jour') : `Minimum ${plural(joursMinimum, 'jour')}`}
                </p>
              </div>
            </div>
            <ChevronRight className="h-4 w-4 shrink-0 text-slate-400" aria-hidden="true" />
          </button>

          {belowMinimum && (
            <p role="alert" className="px-1 text-xs text-amber-700">
              Ce véhicule se loue {plural(joursMinimum, 'jour')} minimum. Ajoutez{' '}
              {plural(joursMinimum - daysCount, 'jour')} à votre période.
            </p>
          )}
        </div>

        {/* Options complémentaires */}
        {hasOptions && (
          <div className="space-y-5">
            {hasDeliveryOptions && (
              <fieldset className="space-y-2">
                <legend className="mb-2 text-sm font-semibold text-slate-900">
                  Remise du véhicule
                </legend>

                <OptionRow
                  type="radio"
                  name={deliveryGroupName}
                  checked={typeLivraison === 'AUCUNE'}
                  onChange={() => setTypeLivraison('AUCUNE')}
                  icon={Home}
                  title="Retrait chez l'hôte"
                  hint="Chez le propriétaire"
                  price="Gratuit"
                  isFree
                />

                {canDeliverDakar && (
                  <OptionRow
                    type="radio"
                    name={deliveryGroupName}
                    checked={typeLivraison === 'DAKAR'}
                    onChange={() => setTypeLivraison('DAKAR')}
                    icon={Truck}
                    title="Livraison à Dakar"
                    hint="À domicile ou à l'hôtel"
                    price={feeLabel(dakarFee)}
                    isFree={dakarFee <= 0}
                  />
                )}

                {canDeliverAibd && (
                  <OptionRow
                    type="radio"
                    name={deliveryGroupName}
                    checked={typeLivraison === 'AIBD'}
                    onChange={() => setTypeLivraison('AIBD')}
                    icon={Plane}
                    title="Livraison à l'AIBD"
                    hint="À l'aéroport"
                    price={feeLabel(aibdFee)}
                    isFree={aibdFee <= 0}
                  />
                )}

                {/* Champ Saisie Adresse / Repère précis quand Livraison sélectionnée */}
                {typeLivraison !== 'AUCUNE' && (
                  <div className="mt-2.5 p-3 rounded-2xl border border-emerald-200 bg-emerald-50/40 space-y-1.5 animate-in fade-in duration-200">
                    <label className="flex items-center gap-1.5 text-xs font-semibold text-[#041912]">
                      <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>
                        {typeLivraison === 'AIBD'
                          ? "Vol / Heure d'arrivée à l'AIBD *"
                          : "Adresse exacte de livraison à Dakar *"}
                      </span>
                    </label>
                    <input
                      type="text"
                      value={adresseLivraison}
                      onChange={(e) => setAdresseLivraison(e.target.value)}
                      placeholder={
                        typeLivraison === 'AIBD'
                          ? 'Ex: Vol HC301, Arrivée à 14h30...'
                          : 'Ex: Les Almadies, Villa 12, près de la banque...'
                      }
                      className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#041912] focus:border-transparent transition-all"
                    />
                  </div>
                )}
              </fieldset>
            )}

            {autoriseHorsDakar && (
              <OptionRow
                type="checkbox"
                checked={horsDakar}
                onChange={setHorsDakar}
                icon={Navigation}
                title="Trajets hors Dakar"
                hint="Déplacements en région"
                price={horsDakarSupplement > 0 ? `+${formatCurrency(horsDakarSupplement)} F/j` : 'Inclus'}
                isFree={horsDakarSupplement <= 0}
              />
            )}
          </div>
        )}
      </div>

      {/* Décompte, total et réservation */}
      <div className="space-y-5 bg-[#041912] px-6 py-6 text-[#F1DFB6]">
        {hasDates && (
          <dl className="space-y-2 text-sm text-[#F1DFB6]/75">
            <SummaryLine
              label={`${formatCurrency(tenantPricePerDay)} FCFA × ${plural(daysCount, 'jour')}`}
              value={`${formatCurrency(baseTotal)} FCFA`}
            />
            {horsDakarTotal > 0 && (
              <SummaryLine
                small
                label={`Trajets hors Dakar (${daysCount} j)`}
                value={`+${formatCurrency(horsDakarTotal)} FCFA`}
              />
            )}
            {deliveryTotal > 0 && (
              <SummaryLine
                small
                label={`Livraison (${typeLivraison === 'AIBD' ? 'AIBD' : 'Dakar'})`}
                value={`+${formatCurrency(deliveryTotal)} FCFA`}
              />
            )}
          </dl>
        )}

        <div
          aria-live="polite"
          className="flex items-baseline justify-between gap-4 border-t border-[#F1DFB6]/15 pt-4"
        >
          <span className="text-sm text-[#F1DFB6]/75">Total estimé</span>
          {hasDates ? (
            <span className="font-display text-3xl leading-none tabular-nums text-[#F1DFB6]">
              {formatCurrency(totalAmount)}
              <span className="ml-1.5 font-sans text-sm text-[#F1DFB6]/60">FCFA</span>
            </span>
          ) : (
            <span className="text-sm text-[#F1DFB6]/60">Choisissez vos dates</span>
          )}
        </div>

        <button
          type="button"
          onClick={handleCtaClick}
          className="w-full cursor-pointer rounded-full bg-[#F1DFB6] px-6 py-4 text-base font-bold text-[#041912] shadow-md shadow-black/20 transition-all hover:bg-[#F7E9C9] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F1DFB6] focus-visible:ring-offset-2 focus-visible:ring-offset-[#041912] active:scale-[0.99]"
        >
          {ctaLabel}
        </button>

        <ul className="space-y-3 text-xs text-[#F1DFB6]/80">
          <li className="space-y-2">
            <div className="flex items-start gap-2.5">
              <ShieldCheck
                className="mt-0.5 h-4 w-4 shrink-0 text-[#F1DFB6]"
                strokeWidth={1.5}
                aria-hidden="true"
              />
              <span>Paiement sécurisé instantané</span>
            </div>
            <div className="flex items-center gap-2 pl-[26px]">
              <span className="flex items-center gap-1.5 rounded-lg border border-[#F1DFB6]/15 bg-white/10 px-2.5 py-1">
                <Image
                  src="/wave.png"
                  alt=""
                  width={16}
                  height={16}
                  className="h-4 w-4 shrink-0 rounded-full object-cover"
                />
                <span className="text-[11px] font-bold text-[#F1DFB6]">Wave</span>
              </span>
              <span className="flex items-center gap-1.5 rounded-lg border border-[#F1DFB6]/15 bg-white/10 px-2.5 py-1">
                <Image
                  src="/orange_money.jpg"
                  alt=""
                  width={16}
                  height={16}
                  className="h-4 w-4 shrink-0 rounded-full object-cover"
                />
                <span className="text-[11px] font-bold text-[#F1DFB6]">Orange Money</span>
              </span>
            </div>
          </li>
          <li className="flex items-start gap-2.5">
            <ShieldCheck
              className="mt-0.5 h-4 w-4 shrink-0 text-[#F1DFB6]"
              strokeWidth={1.5}
              aria-hidden="true"
            />
            <span>Assurance tous risques incluse</span>
          </li>
        </ul>
      </div>
    </aside>
  );
}