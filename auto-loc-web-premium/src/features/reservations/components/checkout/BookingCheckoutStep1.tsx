'use client';

import React, { useEffect, useId, useMemo, useState } from 'react';
import {
  AlertTriangle,
  ArrowRight,
  Calendar,
  ChevronDown,
  Home,
  MapPin,
  Navigation,
  Plane,
  ShieldCheck,
  Star,
  Truck,
  type LucideIcon,
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { fetchApi } from '@/lib/config';
import { AutoCalendar } from '@/src/shared/components/AutoCalendar';
import { BookingPriceBreakdownCard } from './BookingPriceBreakdownCard';

type TypeLivraison = 'AUCUNE' | 'DAKAR' | 'AIBD';
type BlockedRange = { from: string; to: string; type?: string };

interface BookingCheckoutStep1Props {
  vehicle: {
    id: string;
    marque: string;
    modele: string;
    annee?: number;
    type?: string;
    ville?: string;
    photoUrl?: string;
    photos?: Array<string | { url: string }>;
    prixParJour: number;
    tenantPricePerDay: number;
    joursMinimum?: number;
    proposeLivraisonDakar?: boolean;
    fraisLivraisonDakar?: number | null;
    proposeLivraisonAibd?: boolean;
    fraisLivraisonAibd?: number | null;
    fraisLivraison?: number | null;
    autoriseHorsDakar?: boolean;
    supplementHorsDakarParJour?: number | null;
    transmission?: string;
    carburant?: string;
    nombrePlaces?: number;
    note?: number;
  };
  startDate?: string;
  endDate?: string;
  onDatesChange: (start: string, end?: string) => void;
  typeLivraison: TypeLivraison;
  onSelectTypeLivraison: (type: TypeLivraison) => void;
  adresseLivraison: string;
  onAdresseLivraisonChange: (val: string) => void;
  isHorsDakarSelected: boolean;
  onToggleHorsDakar: (val: boolean) => void;
  onNext: () => void;
}

/* -------------------------------------------------------------------------- */
/* Helpers                                                                    */
/* -------------------------------------------------------------------------- */

const MS_PER_DAY = 1000 * 60 * 60 * 24;
const PLACEHOLDER_PHOTO = '/placeholder-car.jpg';

const CARD_CLASS =
  'rounded-3xl border border-slate-200/90 bg-white p-5 shadow-sm sm:p-6';

/** "2026-09-20T00:00:00Z" -> "2026-09-20" */
const toDateOnly = (value: string) => value.split('T')[0];

/** Date locale à minuit (évite les décalages de fuseau d'un `new Date('YYYY-MM-DD')`). */
const parseIsoDate = (value: string): Date => {
  const [y, m, d] = toDateOnly(value).split('-').map(Number);
  return new Date(y, m - 1, d);
};

/** Date -> valeur pour <input type="date">, en heure locale. */
const toInputValue = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(
    date.getDate(),
  ).padStart(2, '0')}`;

const addDays = (date: Date, days: number) => {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
};

const toNumber = (value: number | string | null | undefined): number => {
  const n = Number(value ?? 0);
  return Number.isFinite(n) ? n : 0;
};

const plural = (n: number, word: string) => `${n} ${word}${n > 1 ? 's' : ''}`;

const feeLabel = (fee: number) => (fee > 0 ? `+${formatCurrency(fee)} FCFA` : 'Gratuite');

/* -------------------------------------------------------------------------- */
/* Sous-composant : ligne d'option (radio ou case à cocher)                   */
/* -------------------------------------------------------------------------- */

interface OptionRowProps {
  type: 'radio' | 'checkbox';
  name?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  icon: LucideIcon;
  title: string;
  hint?: string;
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
      className={`flex cursor-pointer items-center justify-between gap-3 rounded-2xl border px-4 py-3.5 transition-colors has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-[#0A3D2E] has-[:focus-visible]:ring-offset-2 ${checked
          ? 'border-[#0A3D2E] bg-[#0A3D2E]/[0.04] ring-1 ring-[#0A3D2E]'
          : 'border-slate-200 hover:border-slate-300'
        }`}
    >
      <div className="flex min-w-0 items-center gap-3">
        <input
          type={type}
          name={name}
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="h-4 w-4 shrink-0 cursor-pointer accent-[#0A3D2E]"
        />
        <Icon
          className="h-[18px] w-[18px] shrink-0 text-[#0A3D2E]/70"
          strokeWidth={1.5}
          aria-hidden="true"
        />
        <div className="min-w-0">
          <p className="text-sm font-semibold text-slate-900">{title}</p>
          {hint && <p className="text-xs leading-snug text-slate-500">{hint}</p>}
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

/* -------------------------------------------------------------------------- */
/* Composant principal                                                        */
/* -------------------------------------------------------------------------- */

export function BookingCheckoutStep1({
  vehicle,
  startDate,
  endDate,
  onDatesChange,
  typeLivraison,
  onSelectTypeLivraison,
  adresseLivraison,
  onAdresseLivraisonChange,
  isHorsDakarSelected,
  onToggleHorsDakar,
  onNext,
}: BookingCheckoutStep1Props) {
  const deliveryGroupName = useId();
  const ctaHintId = useId();

  const [blockedRanges, setBlockedRanges] = useState<BlockedRange[]>([]);
  const [isLoadingBlocked, setIsLoadingBlocked] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);

  const joursMinimum = vehicle.joursMinimum && vehicle.joursMinimum > 0 ? vehicle.joursMinimum : 1;

  /* ------------------------------ Photo ---------------------------------- */

  const photoPrincipal = useMemo(() => {
    if (Array.isArray(vehicle.photos) && vehicle.photos.length > 0) {
      const p = vehicle.photos[0];
      return typeof p === 'string' ? p : p.url;
    }
    return vehicle.photoUrl || PLACEHOLDER_PHOTO;
  }, [vehicle.photos, vehicle.photoUrl]);

  /* ------------------------ Dates bloquées (API) -------------------------- */

  useEffect(() => {
    if (!vehicle.id) return;

    // `cancelled` évite qu'une réponse tardive d'un ancien véhicule écrase l'état
    let cancelled = false;
    setIsLoadingBlocked(true);
    setBlockedRanges([]);

    fetchApi<{ blockedRanges: BlockedRange[] }>(`/vehicles/${vehicle.id}/blocked-dates`)
      .then((res) => {
        if (!cancelled && res?.blockedRanges) setBlockedRanges(res.blockedRanges);
      })
      .catch((err) => {
        if (!cancelled) console.warn('Erreur chargement dates bloquées:', err);
      })
      .finally(() => {
        if (!cancelled) setIsLoadingBlocked(false);
      });

    return () => {
      cancelled = true;
    };
  }, [vehicle.id]);

  /* ------------------------------ Dates ---------------------------------- */

  const todayValue = useMemo(() => toInputValue(new Date()), []);
  const startValue = startDate ? toDateOnly(startDate) : '';
  const endValue = endDate ? toDateOnly(endDate) : '';

  // La fin ne peut pas être avant le début + durée minimale
  const minEndValue = startValue
    ? toInputValue(addDays(parseIsoDate(startValue), joursMinimum > 1 ? joursMinimum : 0))
    : todayValue;

  const isInverted = Boolean(startValue && endValue && endValue < startValue);

  // 0 tant que la période n'est pas complète et valide
  const nbJours = useMemo(() => {
    if (!startValue || !endValue || isInverted) return 0;
    const diff = Math.round(
      (parseIsoDate(endValue).getTime() - parseIsoDate(startValue).getTime()) / MS_PER_DAY,
    );
    return Math.max(diff, 1);
  }, [startValue, endValue, isInverted]);

  const hasDates = nbJours > 0;
  const belowMinimum = hasDates && nbJours < joursMinimum;

  const isDatesBlocked = useMemo(() => {
    if (!startValue || blockedRanges.length === 0) return false;

    const start = parseIsoDate(startValue);
    const end = endValue && !isInverted ? parseIsoDate(endValue) : start;

    return blockedRanges.some((range) => {
      if (!range.from || !range.to) return false;
      return start <= parseIsoDate(range.to) && end >= parseIsoDate(range.from);
    });
  }, [startValue, endValue, isInverted, blockedRanges]);

  const handleStartChange = (value: string) => {
    // Si le nouveau début dépasse la fin déjà choisie, on vide la fin
    const keepEnd = value && endValue && endValue < value ? undefined : endDate;
    onDatesChange(value, keepEnd);
  };

  const handleEndChange = (value: string) => {
    onDatesChange(startDate || '', value || undefined);
  };

  /* ------------------------------ Options -------------------------------- */

  const dakarFee = toNumber(vehicle.fraisLivraisonDakar ?? vehicle.fraisLivraison);
  const aibdFee = toNumber(vehicle.fraisLivraisonAibd);
  const horsDakarSupplement = toNumber(vehicle.supplementHorsDakarParJour);

  const canDeliverDakar =
    Boolean(vehicle.proposeLivraisonDakar) ||
    (vehicle.fraisLivraison !== undefined && vehicle.fraisLivraison !== null);
  const canDeliverAibd = Boolean(vehicle.proposeLivraisonAibd);
  const autoriseHorsDakar = Boolean(vehicle.autoriseHorsDakar);
  const hasDeliveryOptions = canDeliverDakar || canDeliverAibd;
  const hasOptions = hasDeliveryOptions || autoriseHorsDakar;

  // Si une option sélectionnée n'existe pas pour ce véhicule, on la désélectionne
  useEffect(() => {
    if (
      (typeLivraison === 'DAKAR' && !canDeliverDakar) ||
      (typeLivraison === 'AIBD' && !canDeliverAibd)
    ) {
      onSelectTypeLivraison('AUCUNE');
    }
    if (isHorsDakarSelected && !autoriseHorsDakar) {
      onToggleHorsDakar(false);
    }
  }, [
    typeLivraison,
    canDeliverDakar,
    canDeliverAibd,
    isHorsDakarSelected,
    autoriseHorsDakar,
    onSelectTypeLivraison,
    onToggleHorsDakar,
  ]);

  const needsAddress = typeLivraison !== 'AUCUNE';
  const addressMissing = needsAddress && adresseLivraison.trim() === '';

  /* ------------------------ État du bouton principal ---------------------- */

  let blockingReason: string | null = null;
  if (!startValue || !endValue) blockingReason = 'Choisissez vos dates pour continuer.';
  else if (isInverted) blockingReason = 'La date de fin doit être après la date de début.';
  else if (isDatesBlocked) blockingReason = 'Modifiez vos dates pour continuer.';
  else if (belowMinimum)
    blockingReason = `Durée minimale : ${plural(joursMinimum, 'jour')}.`;
  else if (isLoadingBlocked) blockingReason = 'Vérification de la disponibilité…';
  else if (addressMissing)
    blockingReason =
      typeLivraison === 'AIBD'
        ? 'Indiquez votre vol et votre heure d’arrivée.'
        : 'Indiquez l’adresse de livraison.';

  /* ------------------------------ Rendu ---------------------------------- */

  const hasRating = typeof vehicle.note === 'number' && vehicle.note > 0;
  const specs = [
    vehicle.transmission,
    vehicle.carburant,
    vehicle.nombrePlaces ? `${vehicle.nombrePlaces} places` : undefined,
  ].filter(Boolean) as string[];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-12 lg:gap-8">
        {/* Colonne gauche : véhicule, dates, garantie */}
        <div className="space-y-6 lg:col-span-7">
          {/* 1. Synthèse du véhicule */}
          <section
            aria-label="Véhicule sélectionné"
            className={`${CARD_CLASS} flex flex-col items-start gap-5 sm:flex-row`}
          >
            <div className="relative h-36 w-full shrink-0 overflow-hidden rounded-2xl border border-slate-100 bg-slate-100 sm:w-44">
              <img
                src={photoPrincipal}
                alt={`${vehicle.marque} ${vehicle.modele}`}
                decoding="async"
                className="h-full w-full object-cover"
                onError={(e) => {
                  const img = e.currentTarget;
                  if (!img.src.endsWith(PLACEHOLDER_PHOTO)) img.src = PLACEHOLDER_PHOTO;
                }}
              />
              {vehicle.type && (
                <span className="absolute left-2 top-2 rounded-full bg-[#0A3D2E] px-2.5 py-0.5 text-xs font-semibold text-[#F1DFB6]">
                  {vehicle.type}
                </span>
              )}
            </div>

            <div className="min-w-0 flex-1 space-y-2">
              {(hasRating || vehicle.ville) && (
                <div className="flex items-center gap-3 text-xs font-medium text-slate-600">
                  {hasRating && (
                    <span className="flex items-center gap-1 font-bold text-slate-800">
                      <Star
                        className="h-3.5 w-3.5 fill-amber-400 text-amber-400"
                        aria-hidden="true"
                      />
                      {Number(vehicle.note).toFixed(1)}
                    </span>
                  )}
                  {vehicle.ville && (
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5 text-emerald-700" aria-hidden="true" />
                      {vehicle.ville}
                    </span>
                  )}
                </div>
              )}

              <h3 className="font-display text-xl leading-tight text-slate-900 sm:text-2xl">
                {vehicle.marque} {vehicle.modele}
                {vehicle.annee ? (
                  <span className="ml-2 text-lg text-slate-400">({vehicle.annee})</span>
                ) : null}
              </h3>

              {specs.length > 0 && (
                <ul className="flex flex-wrap items-center gap-2 pt-1 text-xs font-medium text-slate-700">
                  {specs.map((spec) => (
                    <li key={spec} className="rounded-lg bg-slate-100 px-2.5 py-1">
                      {spec}
                    </li>
                  ))}
                </ul>
              )}

              <p className="flex items-baseline gap-1.5 pt-2">
                <span className="font-display text-2xl tabular-nums text-[#0A3D2E]">
                  {formatCurrency(vehicle.tenantPricePerDay)}
                </span>
                <span className="text-xs font-medium text-slate-500">FCFA / jour</span>
              </p>
            </div>
          </section>

          {/* 2. Dates de location */}
          <section aria-labelledby="dates-title" className={`${CARD_CLASS} space-y-4`}>
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <Calendar
                  className="mt-1 h-5 w-5 shrink-0 text-[#0A3D2E]"
                  strokeWidth={1.5}
                  aria-hidden="true"
                />
                <div>
                  <h3 id="dates-title" className="font-display text-lg text-[#041912]">
                    Dates de location
                  </h3>
                  <p className="text-xs text-slate-500">
                    Durée minimale : {plural(joursMinimum, 'jour')}
                  </p>
                </div>
              </div>

              {hasDates && (
                <span className="shrink-0 whitespace-nowrap rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-800">
                  {plural(nbJours, 'jour')}
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => setShowCalendar((prev) => !prev)}
                className="flex items-center gap-3 text-left rounded-2xl border border-slate-200 bg-slate-50/50 p-3.5 transition-all hover:border-[#041912] cursor-pointer"
              >
                <div className="w-8 h-8 rounded-xl bg-[#041912] border border-emerald-500/30 text-emerald-400 flex items-center justify-center shrink-0">
                  <Calendar className="w-4 h-4 text-emerald-400" />
                </div>
                <div className="min-w-0 flex-1">
                  <span className="block text-xs font-medium text-slate-500">Prise en main</span>
                  <span className="block truncate text-sm font-semibold text-slate-900">
                    {startValue ? (
                      new Date(`${startValue}T00:00:00`).toLocaleDateString('fr-FR', {
                        weekday: 'short',
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })
                    ) : (
                      'Choisir la date'
                    )}
                  </span>
                </div>
                <ChevronDown
                  className={`w-4 h-4 text-slate-400 shrink-0 transition-transform duration-200 ${
                    showCalendar ? 'rotate-180 text-[#041912]' : ''
                  }`}
                />
              </button>

              <button
                type="button"
                onClick={() => setShowCalendar((prev) => !prev)}
                className="flex items-center gap-3 text-left rounded-2xl border border-slate-200 bg-slate-50/50 p-3.5 transition-all hover:border-[#041912] cursor-pointer"
              >
                <div className="w-8 h-8 rounded-xl bg-[#041912] border border-emerald-500/30 text-emerald-400 flex items-center justify-center shrink-0">
                  <Calendar className="w-4 h-4 text-emerald-400" />
                </div>
                <div className="min-w-0 flex-1">
                  <span className="block text-xs font-medium text-slate-500">Restitution</span>
                  <span className="block truncate text-sm font-semibold text-slate-900">
                    {endValue ? (
                      new Date(`${endValue}T00:00:00`).toLocaleDateString('fr-FR', {
                        weekday: 'short',
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })
                    ) : (
                      'Choisir la date'
                    )}
                  </span>
                </div>
                <ChevronDown
                  className={`w-4 h-4 text-slate-400 shrink-0 transition-transform duration-200 ${
                    showCalendar ? 'rotate-180 text-[#041912]' : ''
                  }`}
                />
              </button>
            </div>

            {/* Calendrier interactif avec dates bloquées / réservées */}
            {showCalendar && (
              <div id="checkout-custom-calendar" className="pt-2 animate-in fade-in duration-200">
                <AutoCalendar
                  vehicleId={vehicle.id}
                  blockedRanges={blockedRanges}
                  startDate={startValue}
                  endDate={endValue}
                  onSelectDates={(start, end) => {
                    onDatesChange(start, end);
                  }}
                />
              </div>
            )}

            {isDatesBlocked && (
              <div
                role="alert"
                className="flex items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-4"
              >
                <AlertTriangle
                  className="mt-0.5 h-5 w-5 shrink-0 text-rose-600"
                  aria-hidden="true"
                />
                <div className="space-y-1 text-xs">
                  <p className="text-sm font-bold text-rose-900">Période non disponible</p>
                  <p className="text-rose-700">
                    Ce véhicule est déjà réservé à ces dates. Choisissez une autre période.
                  </p>
                </div>
              </div>
            )}

            {belowMinimum && !isDatesBlocked && (
              <p role="alert" className="text-xs text-amber-700">
                Ce véhicule se loue {plural(joursMinimum, 'jour')} minimum. Ajoutez{' '}
                {plural(joursMinimum - nbJours, 'jour')} à votre période.
              </p>
            )}

            {isInverted && (
              <p role="alert" className="text-xs text-rose-700">
                La date de fin doit être après la date de début.
              </p>
            )}

            {isLoadingBlocked && startValue && (
              <p role="status" className="text-xs text-slate-500">
                Vérification de la disponibilité…
              </p>
            )}
          </section>

          {/* 3. Annulation et garantie */}
          <section className="flex items-start gap-4 rounded-3xl border border-slate-200/80 bg-slate-50 p-5 text-slate-700">
            <ShieldCheck
              className="mt-0.5 h-5 w-5 shrink-0 text-emerald-800"
              strokeWidth={1.5}
              aria-hidden="true"
            />
            <div className="space-y-1 text-xs">
              <h3 className="text-sm font-bold text-slate-900">
                Annulation gratuite et garantie AutoLoc
              </h3>
              <p className="leading-relaxed text-slate-600">
                Annulation sans frais jusqu’à 48 h avant le début de la location. Notre équipe
                support, basée à Dakar, vous accompagne à chaque étape.
              </p>
            </div>
          </section>
        </div>

        {/* Colonne droite : options, prix, action */}
        <div className="space-y-6 lg:col-span-5">
          {/* 4. Options */}
          {hasOptions && (
            <section aria-labelledby="options-title" className={`${CARD_CLASS} space-y-5`}>
              <h3 id="options-title" className="font-display text-lg text-[#041912]">
                Options
              </h3>

              {hasDeliveryOptions && (
                <fieldset className="space-y-2">
                  <legend className="mb-2 text-sm font-semibold text-slate-900">
                    Remise du véhicule
                  </legend>

                  <OptionRow
                    type="radio"
                    name={deliveryGroupName}
                    checked={typeLivraison === 'AUCUNE'}
                    onChange={() => onSelectTypeLivraison('AUCUNE')}
                    icon={Home}
                    title="Retrait chez l’hôte"
                    hint="Vous récupérez les clés sur place"
                    price="Gratuit"
                    isFree
                  />

                  {canDeliverDakar && (
                    <OptionRow
                      type="radio"
                      name={deliveryGroupName}
                      checked={typeLivraison === 'DAKAR'}
                      onChange={() => onSelectTypeLivraison('DAKAR')}
                      icon={Truck}
                      title="Livraison à Dakar"
                      hint="À votre adresse ou à l’hôtel"
                      price={feeLabel(dakarFee)}
                      isFree={dakarFee <= 0}
                    />
                  )}

                  {canDeliverAibd && (
                    <OptionRow
                      type="radio"
                      name={deliveryGroupName}
                      checked={typeLivraison === 'AIBD'}
                      onChange={() => onSelectTypeLivraison('AIBD')}
                      icon={Plane}
                      title="Livraison à l’aéroport AIBD"
                      hint="Remise des clés à votre arrivée"
                      price={feeLabel(aibdFee)}
                      isFree={aibdFee <= 0}
                    />
                  )}

                  {needsAddress && (
                    <label className="block pt-2">
                      <span className="mb-1 block text-xs font-medium text-slate-700">
                        {typeLivraison === 'AIBD'
                          ? 'Vol et heure d’arrivée'
                          : 'Adresse ou repère de livraison'}
                      </span>
                      <input
                        type="text"
                        value={adresseLivraison}
                        onChange={(e) => onAdresseLivraisonChange(e.target.value)}
                        required
                        aria-required="true"
                        autoComplete={typeLivraison === 'DAKAR' ? 'street-address' : 'off'}
                        placeholder={
                          typeLivraison === 'AIBD'
                            ? 'Ex : numéro de vol et heure d’arrivée'
                            : 'Ex : Mermoz Pyrotechnie, près de la banque'
                        }
                        className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-base focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0A3D2E] sm:text-sm"
                      />
                    </label>
                  )}
                </fieldset>
              )}

              {autoriseHorsDakar && (
                <OptionRow
                  type="checkbox"
                  checked={isHorsDakarSelected}
                  onChange={onToggleHorsDakar}
                  icon={Navigation}
                  title="Trajets hors Dakar"
                  hint="Autorisé partout au Sénégal : Thiès, Saint-Louis, Saly, Casamance…"
                  price={
                    horsDakarSupplement > 0
                      ? `+${formatCurrency(horsDakarSupplement)} FCFA/j`
                      : 'Inclus'
                  }
                  isFree={horsDakarSupplement <= 0}
                />
              )}
            </section>
          )}

          {/* 5. Décomposition du prix */}
          {hasDates ? (
            <BookingPriceBreakdownCard
              tenantPricePerDay={vehicle.tenantPricePerDay}
              nbJours={nbJours}
              typeLivraison={typeLivraison}
              fraisLivraisonDakar={vehicle.fraisLivraisonDakar}
              fraisLivraisonAibd={vehicle.fraisLivraisonAibd}
              fraisLivraison={vehicle.fraisLivraison}
              isHorsDakarSelected={isHorsDakarSelected}
              supplementHorsDakarParJour={vehicle.supplementHorsDakarParJour}
            />
          ) : (
            <div className="rounded-3xl border border-dashed border-slate-300 bg-white/60 p-5 text-sm text-slate-500">
              Le détail du prix s’affiche dès que vous choisissez vos dates.
            </div>
          )}

          {/* 6. Action */}
          <div className="space-y-2">
            <button
              type="button"
              onClick={onNext}
              disabled={blockingReason !== null}
              aria-describedby={blockingReason ? ctaHintId : undefined}
              className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-full bg-[#0A3D2E] px-6 py-4 text-base font-bold text-[#F1DFB6] shadow-md transition-all hover:bg-[#0F4F3B] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0A3D2E] focus-visible:ring-offset-2 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50 disabled:active:scale-100"
            >
              <span>{isDatesBlocked ? 'Dates indisponibles' : 'Continuer vers le paiement'}</span>
              <ArrowRight className="h-5 w-5" aria-hidden="true" />
            </button>

            {blockingReason && (
              <p id={ctaHintId} aria-live="polite" className="text-center text-xs text-slate-500">
                {blockingReason}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}