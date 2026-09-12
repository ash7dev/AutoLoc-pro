'use client';

/* ═══════════════════════════════════════════════════════════════════
   VehicleOwnerCard & MobileReservationBar
   Verified owner panel + 2026 Mobile Luxury Sticky Bar & Bottom Sheet
═══════════════════════════════════════════════════════════════════ */

import React, { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  ShieldCheck, Star, ChevronDown, CreditCard, ArrowRight,
  Check, MapPin, Truck, Wallet, Banknote, Sparkles, X, Clock,
  CalendarDays, UserCheck, AlertTriangle, Shield, Loader2, Lock, CheckCircle2, Compass
} from 'lucide-react';
import { cn, getCommissionRate, getTenantPricePerDay, roundToNearest100 } from '@/lib/utils';
import type { Vehicle, PricingResponse } from '@/lib/nestjs/vehicles';
import { fetchVehiclePricing } from '@/lib/nestjs/vehicles';
import { useCurrency } from '@/providers/currency-provider';
import { apiFetch, ApiError } from '@/lib/nestjs/api-client';
import type { ProfileResponse } from '@/lib/nestjs/auth';
import { useProfileStore } from '@/features/auth/stores/profile.store';
import { ReservationCalendar } from '@/features/vehicles/components/ReservationCalendar';
import { ReservationGateModal } from '@/features/reservations/components/ReservationGateModal';
import { AgeRestrictionModal } from '@/features/reservations/components/AgeRestrictionModal';
import { PremiumPriceTag } from '@/components/ui/PremiumPriceTag';

interface OwnerCardProps { vehicle: Vehicle }

export function VehicleOwnerCard({ vehicle }: OwnerCardProps): React.ReactElement {
  return (
    <section className="space-y-4">
      <div className="flex items-center gap-3">
        <h2 className="text-[18px] font-black tracking-tight text-slate-900 font-brand">Le propriétaire</h2>
        <div className="flex-1 h-px bg-slate-100" />
      </div>

      <div className="flex items-start gap-4 p-5 rounded-3xl bg-slate-50/80 border border-slate-200/80 backdrop-blur-sm shadow-sm">
        {/* Avatar */}
        <div className="flex-shrink-0 w-14 h-14 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center shadow-md border border-slate-700/50 text-emerald-400">
          <span className="text-[20px] font-black">
            {(vehicle.proprietaire?.prenom?.[0] ?? 'P').toUpperCase()}
          </span>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-[16px] font-extrabold text-slate-900 font-brand">
              {[vehicle.proprietaire?.prenom, vehicle.proprietaire?.nom].filter(Boolean).join(' ') || 'Propriétaire'}
            </p>
            <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 border border-emerald-200/60 text-[10.5px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
              <ShieldCheck className="w-3 h-3 text-emerald-600" strokeWidth={2.5} />
              Vérifié KYC
            </span>
          </div>
          <div className="flex items-center gap-3 mt-1.5">
            <span className="flex items-center gap-1 text-[12.5px] text-slate-800 font-extrabold">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" strokeWidth={0} />
              {vehicle.note != null ? Number(vehicle.note).toFixed(1) : '—'}
              <span className="text-slate-500 font-medium">({vehicle.totalAvis ?? 0} avis)</span>
            </span>
            <span className="text-slate-300">·</span>
            <span className="text-[12.5px] text-slate-700 font-bold">
              {vehicle.totalLocations ?? 0} locations effectuées
            </span>
          </div>
          <p className="mt-2.5 text-[13px] text-slate-600 leading-relaxed font-medium line-clamp-2">
            Ce véhicule a été rigoureusement inspecté et validé par l&apos;équipe AutoLoc. Propriétaire certifié avec pièces d&apos;identité et permis contrôlés.
          </p>
        </div>
      </div>
    </section>
  );
}


/* ═══════════════════════════════════════════════════════════════════
   MobileReservationBar (2026 Luxury Redesign)
   Sticky bottom CTA on mobile — opens a sheet with full reservation form
═══════════════════════════════════════════════════════════════════ */

interface MobileBarProps {
  vehicleId: string;
  prixParJour: number;
  joursMinimum: number;
  ageMinimum?: number;
  fraisLivraison?: number | null;
  autoriseHorsDakar?: boolean;
  supplementHorsDakarParJour?: number | null;
  blockedRanges?: any[];
}

export function MobileReservationBar({
  vehicleId,
  prixParJour,
  joursMinimum,
  ageMinimum,
  fraisLivraison,
  autoriseHorsDakar,
  supplementHorsDakarParJour,
  blockedRanges
}: MobileBarProps): React.ReactElement {
  const [sheetOpen, setSheetOpen] = useState(false);
  const basePrice = Number(prixParJour);
  const dynamicPrice = getTenantPricePerDay(basePrice);

  return (
    <>
      {/* ── Mobile Sticky Bottom Bar ─────────────────────────────────────────── */}
      <div className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-slate-950/95 backdrop-blur-2xl border-t border-white/10 px-5 py-3.5 pb-safe flex items-center justify-between gap-4 shadow-[0_-8px_30px_rgba(0,0,0,0.3)]">
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5">
            <PremiumPriceTag
              price={Math.round(dynamicPrice)}
              size="md"
              variant="dark"
              period="/j"
              hidePrefix={true}
            />
          </div>
          {joursMinimum > 1 && (
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">
              Min. {joursMinimum} jours
            </span>
          )}
        </div>

        <button
          type="button"
          onClick={() => setSheetOpen(true)}
          className="group relative flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 text-white text-[15px] font-extrabold px-6 py-3.5 rounded-2xl transition-all duration-200 active:scale-95 shadow-lg shadow-emerald-500/25 border border-emerald-400/30 overflow-hidden"
        >
          <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 pointer-events-none" />
          <Sparkles className="w-4 h-4 text-white animate-pulse" />
          <span>Réserver</span>
          <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" strokeWidth={2.5} />
        </button>
      </div>

      {/* ── Mobile Bottom Sheet Drawer ─────────────────────────────────────── */}
      {sheetOpen && (
        <>
          {/* Backdrop with blur */}
          <div
            className="lg:hidden fixed inset-0 z-[70] bg-slate-950/70 backdrop-blur-md animate-in fade-in duration-200"
            onClick={() => setSheetOpen(false)}
          />
          {/* Bottom Sheet Container */}
          <div className="lg:hidden fixed bottom-0 inset-x-0 z-[70] bg-white rounded-t-[32px] shadow-2xl flex flex-col max-h-[92dvh] animate-in slide-in-from-bottom duration-300 border-t border-slate-200/80">
            {/* Drag Handle */}
            <div className="flex justify-center pt-3 pb-1 flex-shrink-0 cursor-pointer" onClick={() => setSheetOpen(false)}>
              <div className="w-12 h-1.5 rounded-full bg-slate-300/80 hover:bg-slate-400 transition-colors" />
            </div>

            {/* Header */}
            <div className="relative flex-shrink-0 px-6 py-4 border-b border-slate-100 bg-white flex items-center justify-between">
              <div>
                <h3 className="text-[19px] font-black text-slate-900 font-brand tracking-tight">Réserver ce véhicule</h3>
                <p className="text-[12px] text-slate-500 font-medium mt-0.5 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" strokeWidth={2.5} />
                  Paiement 100% sécurisé • Confirmation rapide
                </p>
              </div>

              <button
                type="button"
                onClick={() => setSheetOpen(false)}
                className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 transition-colors active:scale-95"
              >
                <X className="w-5 h-5" strokeWidth={2.5} />
              </button>
            </div>

            {/* Form Scrollable Body */}
            <SheetReservationForm
              vehicleId={vehicleId}
              prixParJour={prixParJour}
              joursMinimum={joursMinimum}
              ageMinimum={ageMinimum}
              fraisLivraison={fraisLivraison}
              autoriseHorsDakar={autoriseHorsDakar}
              supplementHorsDakarParJour={supplementHorsDakarParJour}
              blockedRanges={blockedRanges}
              onClose={() => setSheetOpen(false)}
            />
          </div>
        </>
      )}
    </>
  );
}

function calcAge(dateStr: string): number {
  const birth = new Date(dateStr);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return age;
}

interface SheetFormProps extends MobileBarProps {
  onClose: () => void;
}

function SheetReservationForm({
  vehicleId,
  prixParJour,
  joursMinimum,
  ageMinimum,
  fraisLivraison,
  autoriseHorsDakar,
  supplementHorsDakarParJour,
  blockedRanges,
  onClose
}: SheetFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { formatPrice } = useCurrency();
  const [dateDebut, setDateDebut] = useState(searchParams.get('dateDebut') ?? '');
  const [dateFin, setDateFin] = useState(searchParams.get('dateFin') ?? '');
  const [pricing, setPricing] = useState<PricingResponse | null>(null);
  const [loadingPricing, setLoadingPricing] = useState(false);
  const [pricingError, setPricingError] = useState(false);
  const [contractAccepted, setContractAccepted] = useState(false);
  const [gateOpen, setGateOpen] = useState(false);
  const [gateProfile, setGateProfile] = useState<ProfileResponse | null>(null);
  const [gateLoading, setGateLoading] = useState(false);
  const [inlineError, setInlineError] = useState<React.ReactNode | null>(null);
  const [ageBlockOpen, setAgeBlockOpen] = useState(false);
  const [ageBlockData, setAgeBlockData] = useState<{ userAge: number } | null>(null);
  const [horsDakar, setHorsDakar] = useState(false);
  const [wantsDelivery, setWantsDelivery] = useState(false);
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [modePaiement, setModePaiement] = useState<'TOTAL_EN_LIGNE' | 'ACOMPTE_SOLDE_CHECKIN'>('TOTAL_EN_LIGNE');
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  const deliveryAvailable = fraisLivraison != null && fraisLivraison > 0;
  const deliveryFee = wantsDelivery && deliveryAvailable ? fraisLivraison : 0;

  const nbJours = useMemo(() => {
    if (!dateDebut || !dateFin) return 0;
    const debut = new Date(dateDebut);
    const fin = new Date(dateFin);
    if (debut > fin) return 0;
    const diffMs = fin.getTime() - debut.getTime();
    return Math.max(1, Math.round(diffMs / 86_400_000));
  }, [dateDebut, dateFin]);

  const datesValid = nbJours >= joursMinimum;
  const canReserve = datesValid && contractAccepted && pricing && !loadingPricing
    && (!wantsDelivery || deliveryAddress.trim().length > 0);

  const fetchPricingData = useCallback(async (days: number) => {
    if (days < 1) return;
    const supp = horsDakar && autoriseHorsDakar ? (supplementHorsDakarParJour ?? 0) : 0;
    const baseDaily = prixParJour + supp;
    const totalBase = baseDaily * days;
    const rate = getCommissionRate(baseDaily);
    const montantCommission = roundToNearest100(totalBase * rate);
    const estimatedPricing = {
      nbJours: days,
      autoriseHorsDakar,
      supplementHorsDakar: supp,
      prixParJour,
      totalBase,
      tauxCommission: rate,
      montantCommission,
      totalLocataire: totalBase + montantCommission,
      netProprietaire: totalBase,
    };

    setPricing(estimatedPricing);
    setLoadingPricing(true);
    setPricingError(false);

    try {
      const result = await fetchVehiclePricing(vehicleId, days, horsDakar);
      setPricing(result);
      setPricingError(false);
    } catch {
      setPricingError(true);
    } finally {
      setLoadingPricing(false);
    }
  }, [vehicleId, prixParJour, horsDakar, autoriseHorsDakar, supplementHorsDakarParJour]);

  useEffect(() => {
    clearTimeout(debounceRef.current);
    if (nbJours >= 1) {
      debounceRef.current = setTimeout(() => fetchPricingData(nbJours), 150);
    } else {
      setPricing(null);
      setPricingError(false);
    }
    return () => clearTimeout(debounceRef.current);
  }, [nbJours, horsDakar, fetchPricingData]);

  function buildParams() {
    const params = new URLSearchParams({ dateDebut, dateFin, nbJours: String(nbJours) });
    if (wantsDelivery && deliveryAddress.trim()) {
      params.set('livraison', '1');
      params.set('adresseLivraison', deliveryAddress.trim());
    }
    if (horsDakar) {
      params.set('horsDakar', '1');
    }
    if (modePaiement !== 'TOTAL_EN_LIGNE') {
      params.set('modePaiement', modePaiement);
    }
    return params;
  }

  async function handleReserve() {
    if (!canReserve || gateLoading) return;
    setInlineError(null);
    setGateLoading(true);
    try {
      const profile = useProfileStore.getState().profile ?? await apiFetch<ProfileResponse>('/auth/me');

      if (ageMinimum && ageMinimum > 0 && profile.dateNaissance) {
        const birth = new Date(profile.dateNaissance);
        const today = new Date();
        let age = today.getFullYear() - birth.getFullYear();
        const m = today.getMonth() - birth.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
        if (age < ageMinimum) {
          setAgeBlockData({ userAge: age });
          setAgeBlockOpen(true);
          return;
        }
      }

      setGateProfile(profile);
      setGateOpen(true);
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        const queryParams = buildParams().toString();
        const nextPath = `${window.location.pathname}${queryParams ? '?' + queryParams : ''}`;
        const next = encodeURIComponent(nextPath);
        router.push(`/login?next=${next}`);
        return;
      }
      setInlineError(
        err instanceof Error
          ? err.message
          : 'Impossible de vérifier votre profil pour le moment. Réessayez.',
      );
    } finally {
      setGateLoading(false);
    }
  }

  const currentDailyPrice = pricing ? Math.round(pricing.totalLocataire / pricing.nbJours) : getTenantPricePerDay(prixParJour);

  return (
    <>
      {/* ── Age Restriction Block ── */}
      {ageBlockData && (
        <AgeRestrictionModal
          open={ageBlockOpen}
          onClose={() => setAgeBlockOpen(false)}
          ageMinimum={ageMinimum!}
          userAge={ageBlockData.userAge}
        />
      )}

      {/* ── Profile completion Gate ── */}
      <ReservationGateModal
        open={gateOpen}
        onOpenChange={setGateOpen}
        profile={gateProfile}
        ageMinimum={ageMinimum}
        userAge={gateProfile?.dateNaissance ? calcAge(gateProfile.dateNaissance) : undefined}
        onProceed={() => {
          const params = buildParams();
          router.push(`/vehicle/${vehicleId}/payment?${params.toString()}`);
        }}
      />

      {/* Scrollable Form Content */}
      <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain px-6 pt-4 pb-6 space-y-5">
        {/* Section: Dates */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-[12px] font-extrabold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <CalendarDays className="w-3.5 h-3.5 text-emerald-600" />
              Dates de séjour
            </label>
            {nbJours > 0 && datesValid && (
              <span className="text-[12px] font-extrabold text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-100">
                {nbJours} nuit{nbJours > 1 ? 's' : ''}
              </span>
            )}
          </div>

          <ReservationCalendar
            vehicleId={vehicleId}
            joursMinimum={joursMinimum}
            dateDebut={dateDebut}
            dateFin={dateFin}
            onDateDebutChange={setDateDebut}
            onDateFinChange={setDateFin}
            initialBlockedRanges={blockedRanges}
          />
        </div>

        {/* Duration Indicator */}
        {nbJours > 0 && datesValid && (
          <div className="flex items-center gap-2.5 rounded-2xl px-4 py-3 bg-emerald-50/80 border border-emerald-100 text-[13px] font-semibold text-emerald-900 shadow-sm">
            {loadingPricing ? (
              <>
                <Loader2 className="w-4 h-4 flex-shrink-0 text-emerald-600 animate-spin" strokeWidth={2.5} />
                Calcul en cours pour {nbJours} jour{nbJours > 1 ? 's' : ''}…
              </>
            ) : (
              <>
                <Clock className="w-4 h-4 flex-shrink-0 text-emerald-600" strokeWidth={2.5} />
                <span>Durée sélectionnée : <strong className="font-extrabold text-emerald-950">{nbJours} jour{nbJours > 1 ? 's' : ''}</strong></span>
              </>
            )}
          </div>
        )}

        {/* Insufficient duration alert */}
        {nbJours > 0 && !datesValid && (
          <div className="rounded-2xl border border-amber-200/90 bg-amber-50/90 p-4 shadow-sm">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl bg-amber-100 flex items-center justify-center flex-shrink-0 mt-0.5 shadow-sm">
                <CalendarDays className="w-4 h-4 text-amber-700" strokeWidth={2.5} />
              </div>
              <div>
                <p className="text-[13px] font-extrabold text-amber-900">Durée minimale non atteinte</p>
                <p className="text-[12px] text-amber-800 mt-0.5 leading-relaxed font-medium">
                  Le propriétaire demande au moins <strong>{joursMinimum} jour{joursMinimum > 1 ? 's' : ''}</strong> de réservation.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ── Delivery Option ── */}
        {deliveryAvailable && (
          <div
            onClick={() => setWantsDelivery(!wantsDelivery)}
            className={cn(
              "relative rounded-2xl border-2 p-4 cursor-pointer transition-all duration-300 overflow-hidden select-none",
              wantsDelivery
                ? "bg-gradient-to-br from-emerald-500/10 via-teal-500/5 to-emerald-500/15 border-emerald-500 shadow-lg shadow-emerald-500/10 ring-1 ring-emerald-500/30"
                : "bg-slate-50/70 border-slate-200/90 hover:border-slate-300 hover:bg-slate-100/80 shadow-xs"
            )}
          >
            <div className="flex items-start gap-3.5">
              {/* Icon Badge */}
              <div className={cn(
                "w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-300 shadow-sm",
                wantsDelivery
                  ? "bg-gradient-to-br from-emerald-600 to-teal-700 text-white shadow-emerald-600/30 scale-105"
                  : "bg-emerald-100/80 text-emerald-700 border border-emerald-200/60"
              )}>
                <Truck className="w-5 h-5" strokeWidth={2.2} />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <div className="flex items-center gap-2">
                    <h4 className={cn(
                      "text-[14.5px] font-extrabold font-brand tracking-tight transition-colors",
                      wantsDelivery ? "text-emerald-950" : "text-slate-900"
                    )}>
                      Livraison à domicile
                    </h4>
                    {wantsDelivery && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-emerald-700 bg-emerald-100/90 px-2 py-0.5 rounded-full border border-emerald-200/80">
                        <Sparkles className="w-2.5 h-2.5 text-emerald-600" />
                        Inclus
                      </span>
                    )}
                  </div>
                  <span className={cn(
                    "text-[13px] font-black tabular-nums px-2.5 py-1 rounded-xl transition-all shadow-xs border whitespace-nowrap shrink-0",
                    wantsDelivery
                      ? "bg-slate-950 text-emerald-300 border-slate-800"
                      : "bg-white text-emerald-700 border-slate-200"
                  )}>
                    + {formatPrice(fraisLivraison)}
                  </span>
                </div>

                <p className="text-[12.5px] text-slate-500 font-medium leading-relaxed">
                  Le véhicule vous sera livré direct à l&apos;adresse de votre choix (hôtel, domicile...)
                </p>
              </div>

              {/* Check Radio Pill */}
              <div className={cn(
                "w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all duration-300 mt-0.5",
                wantsDelivery
                  ? "bg-emerald-600 border-emerald-600 text-white scale-110 shadow-sm"
                  : "border-slate-300 bg-white"
              )}>
                {wantsDelivery && <CheckCircle2 className="w-4 h-4 text-white" strokeWidth={3} />}
              </div>
            </div>

            {/* Address Input Dropdown when selected */}
            {wantsDelivery && (
              <div
                onClick={(e) => e.stopPropagation()}
                className="mt-3.5 pt-3.5 border-t border-emerald-200/60 space-y-2 animate-in slide-in-from-top-2 duration-300"
              >
                <label className="block text-[11.5px] font-extrabold uppercase tracking-wider text-emerald-900 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-emerald-600" strokeWidth={2.5} />
                  Adresse précise de livraison
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={deliveryAddress}
                    onChange={(e) => setDeliveryAddress(e.target.value)}
                    placeholder="Ex: Villa 42, Les Almadies / Aéroport DSS..."
                    className="w-full h-11 rounded-xl border-2 border-emerald-300/80 bg-white pl-4 pr-4
                      text-[13px] font-semibold text-slate-900 placeholder-slate-400
                      focus:border-emerald-600 focus:outline-none focus:ring-4 focus:ring-emerald-500/15 transition-all shadow-xs"
                  />
                </div>
                {!deliveryAddress.trim() && (
                  <div className="flex items-center gap-1.5 text-amber-700 bg-amber-50/80 border border-amber-200/70 px-3 py-1.5 rounded-lg">
                    <div className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
                    <p className="text-[11.5px] font-bold">Veuillez renseigner votre adresse pour continuer</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ── Hors Dakar Option ── */}
        {autoriseHorsDakar && supplementHorsDakarParJour != null && (
          <div
            onClick={() => setHorsDakar(!horsDakar)}
            className={cn(
              "relative rounded-2xl border-2 p-4 cursor-pointer transition-all duration-300 overflow-hidden select-none",
              horsDakar
                ? "bg-gradient-to-br from-indigo-500/10 via-blue-500/5 to-indigo-500/15 border-indigo-500 shadow-lg shadow-indigo-500/10 ring-1 ring-indigo-500/30"
                : "bg-slate-50/70 border-slate-200/90 hover:border-slate-300 hover:bg-slate-100/80 shadow-xs"
            )}
          >
            <div className="flex items-start gap-3.5">
              {/* Icon Badge */}
              <div className={cn(
                "w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-300 shadow-sm",
                horsDakar
                  ? "bg-gradient-to-br from-indigo-600 to-blue-700 text-white shadow-indigo-600/30 scale-105"
                  : "bg-indigo-100/80 text-indigo-700 border border-indigo-200/60"
              )}>
                <Compass className="w-5 h-5" strokeWidth={2.2} />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <div className="flex items-center gap-2">
                    <h4 className={cn(
                      "text-[14.5px] font-extrabold font-brand tracking-tight transition-colors",
                      horsDakar ? "text-indigo-950" : "text-slate-900"
                    )}>
                      Voyage Hors Dakar
                    </h4>
                    {horsDakar && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-indigo-700 bg-indigo-100/90 px-2 py-0.5 rounded-full border border-indigo-200/80">
                        <Sparkles className="w-2.5 h-2.5 text-indigo-600" />
                        Activé
                      </span>
                    )}
                  </div>
                  <span className={cn(
                    "text-[13px] font-black tabular-nums px-2.5 py-1 rounded-xl transition-all shadow-xs border whitespace-nowrap shrink-0",
                    horsDakar
                      ? "bg-slate-950 text-indigo-300 border-slate-800"
                      : "bg-white text-indigo-700 border-slate-200"
                  )}>
                    + {formatPrice(supplementHorsDakarParJour)}<span className="text-[11px] font-semibold text-slate-400">/j</span>
                  </span>
                </div>

                <p className="text-[12.5px] text-slate-500 font-medium leading-relaxed">
                  Liberté totale pour explorer Saint-Louis, Saly, Casamance et tout le Sénégal
                </p>
              </div>

              {/* Check Radio Pill */}
              <div className={cn(
                "w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all duration-300 mt-0.5",
                horsDakar
                  ? "bg-indigo-600 border-indigo-600 text-white scale-110 shadow-sm"
                  : "border-slate-300 bg-white"
              )}>
                {horsDakar && <CheckCircle2 className="w-4 h-4 text-white" strokeWidth={3} />}
              </div>
            </div>
          </div>
        )}

        {/* ── Mode de Paiement Toggle ── */}
        {pricing && datesValid && (
          <div className="space-y-2.5 pt-1">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-emerald-100 flex items-center justify-center">
                <Wallet className="w-3.5 h-3.5 text-emerald-700" strokeWidth={2.5} />
              </div>
              <h4 className="text-[12px] font-extrabold text-slate-700 uppercase tracking-wider">Mode de règlement</h4>
            </div>

            <div className="grid grid-cols-1 gap-2.5">
              {/* 100% en ligne */}
              <button
                type="button"
                onClick={() => setModePaiement('TOTAL_EN_LIGNE')}
                className={cn(
                  'w-full text-left rounded-2xl border-2 p-3.5 transition-all duration-300 relative overflow-hidden',
                  modePaiement === 'TOTAL_EN_LIGNE'
                    ? 'bg-gradient-to-r from-emerald-50/80 to-teal-50/50 border-emerald-400 shadow-md shadow-emerald-500/10'
                    : 'bg-white border-slate-200/90 hover:border-slate-300',
                )}
              >
                <div className="flex items-start gap-3">
                  <div className={cn(
                    'mt-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all duration-200',
                    modePaiement === 'TOTAL_EN_LIGNE'
                      ? 'bg-emerald-600 border-emerald-600'
                      : 'border-slate-300',
                  )}>
                    {modePaiement === 'TOTAL_EN_LIGNE' && <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <CreditCard className={cn(
                        'w-4 h-4 transition-colors',
                        modePaiement === 'TOTAL_EN_LIGNE' ? 'text-emerald-700' : 'text-slate-400'
                      )} strokeWidth={2.5} />
                      <span className={cn(
                        'text-[13.5px] font-extrabold transition-colors',
                        modePaiement === 'TOTAL_EN_LIGNE' ? 'text-emerald-950' : 'text-slate-800'
                      )}>
                        Payer 100% en ligne
                      </span>
                    </div>
                    <p className="text-[11.5px] text-slate-500 font-medium">
                      Confirmation immédiate. Règlement intégral sécurisé.
                    </p>
                  </div>
                </div>
              </button>

              {/* Accompte 30% */}
              <button
                type="button"
                onClick={() => setModePaiement('ACOMPTE_SOLDE_CHECKIN')}
                className={cn(
                  'w-full text-left rounded-2xl border-2 p-3.5 transition-all duration-300 relative overflow-hidden',
                  modePaiement === 'ACOMPTE_SOLDE_CHECKIN'
                    ? 'bg-gradient-to-r from-emerald-50/80 to-teal-50/50 border-emerald-400 shadow-md shadow-emerald-500/10'
                    : 'bg-white border-slate-200/90 hover:border-slate-300',
                )}
              >
                <div className="flex items-start gap-3">
                  <div className={cn(
                    'mt-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all duration-200',
                    modePaiement === 'ACOMPTE_SOLDE_CHECKIN'
                      ? 'bg-emerald-600 border-emerald-600'
                      : 'border-slate-300',
                  )}>
                    {modePaiement === 'ACOMPTE_SOLDE_CHECKIN' && <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <Banknote className={cn(
                        'w-4 h-4 transition-colors',
                        modePaiement === 'ACOMPTE_SOLDE_CHECKIN' ? 'text-emerald-700' : 'text-slate-400'
                      )} strokeWidth={2.5} />
                      <span className={cn(
                        'text-[13.5px] font-extrabold transition-colors',
                        modePaiement === 'ACOMPTE_SOLDE_CHECKIN' ? 'text-emerald-950' : 'text-slate-800'
                      )}>
                        Acompte 30% + Solde à la remise
                      </span>
                    </div>
                    <p className="text-[11.5px] text-slate-500 font-medium">
                      Réservez avec 30% maintenant, payez le reste le jour J.
                    </p>
                    {modePaiement === 'ACOMPTE_SOLDE_CHECKIN' && pricing && (
                      <div className="mt-2.5 flex flex-wrap gap-2 text-[11px] font-extrabold animate-in fade-in duration-300">
                        <span className="text-emerald-800 bg-emerald-100/90 border border-emerald-200 px-2.5 py-1 rounded-lg">
                          Aujourd&apos;hui : {formatPrice(Math.round((pricing.totalLocataire + deliveryFee) * 0.3))}
                        </span>
                        <span className="text-slate-700 bg-slate-100 border border-slate-200 px-2.5 py-1 rounded-lg">
                          Au check-in : {formatPrice(Math.round((pricing.totalLocataire + deliveryFee) * 0.7))}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </button>
            </div>
          </div>
        )}

        {/* ── Summary Card (Dark Glass) ── */}
        {pricing && datesValid && (() => {
          const suppTotal = (pricing.supplementHorsDakar != null && pricing.supplementHorsDakar > 0)
            ? pricing.supplementHorsDakar * nbJours
            : 0;
          const baseLocationTotal = pricing.totalLocataire - suppTotal;
          const baseDailyTenant = Math.round(baseLocationTotal / nbJours);
          const grandTotal = pricing.totalLocataire + deliveryFee;

          return (
            <div className="relative rounded-3xl overflow-hidden p-5 space-y-3.5 shadow-xl shadow-slate-950/20 border border-slate-800/80">
              <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 backdrop-blur-2xl" />
              <div className="absolute top-0 right-0 w-36 h-36 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

              <div className="relative space-y-3">
                <div className="flex items-center gap-2 pb-2 border-b border-white/10">
                  <div className="w-7 h-7 rounded-lg bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center">
                    <CreditCard className="w-3.5 h-3.5 text-emerald-400" strokeWidth={2.5} />
                  </div>
                  <h4 className="text-[12px] font-black text-white/90 uppercase tracking-widest">Détail du montant</h4>
                </div>

                <div className="space-y-2 text-[13px]">
                  <div className="flex justify-between items-center text-slate-300">
                    <span className="font-medium">
                      Location ({formatPrice(baseDailyTenant)} × {nbJours}j)
                    </span>
                    <span className="font-bold text-white tabular-nums">
                      {formatPrice(baseLocationTotal)}
                    </span>
                  </div>

                  {deliveryFee > 0 && (
                    <div className="flex justify-between items-center text-slate-300">
                      <span className="font-medium flex items-center gap-1.5">
                        <Truck className="w-3.5 h-3.5 text-emerald-400" strokeWidth={2.5} />
                        Frais de livraison
                      </span>
                      <span className="font-bold text-white tabular-nums">
                        {formatPrice(deliveryFee)}
                      </span>
                    </div>
                  )}

                  {suppTotal > 0 && (
                    <div className="flex justify-between items-center text-slate-300">
                      <span className="font-medium flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-blue-400" strokeWidth={2.5} />
                        Supplément Hors Dakar
                      </span>
                      <span className="font-bold text-white tabular-nums">
                        {formatPrice(suppTotal)}
                      </span>
                    </div>
                  )}
                </div>

                <div className="pt-3 border-t border-white/15 flex justify-between items-end">
                  <div>
                    <span className="text-[13px] font-black text-white block">Montant Total TTC</span>
                    <span className="text-[11px] text-slate-400 font-medium">Inclus taxes et services</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[22px] font-black text-emerald-400 tabular-nums tracking-tight block leading-none">
                      {formatPrice(grandTotal)}
                    </span>
                  </div>
                </div>

                {modePaiement === 'ACOMPTE_SOLDE_CHECKIN' && (
                  <div className="pt-2.5 mt-0.5 border-t border-white/10 space-y-1.5 animate-in fade-in duration-300">
                    <div className="flex justify-between items-center text-[12.5px]">
                      <span className="text-emerald-300 font-extrabold flex items-center gap-1.5">
                        <CreditCard className="w-3.5 h-3.5 text-emerald-400" strokeWidth={2.5} />
                        À payer aujourd&apos;hui (30%)
                      </span>
                      <span className="font-black text-emerald-300 tabular-nums">
                        {formatPrice(Math.round(grandTotal * 0.3))}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-[12.5px]">
                      <span className="text-slate-400 font-semibold flex items-center gap-1.5">
                        <Banknote className="w-3.5 h-3.5 text-slate-400" strokeWidth={2.5} />
                        Au check-in (70%)
                      </span>
                      <span className="font-semibold text-slate-400 tabular-nums">
                        {formatPrice(Math.round(grandTotal * 0.7))}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })()}
      </div>

      {/* Sticky Bottom Action Bar in Drawer */}
      <div className="flex-shrink-0 border-t border-slate-200 bg-white px-6 pt-4 pb-8 space-y-3">
        {inlineError && (
          <div className="rounded-2xl border-2 border-red-200 bg-red-50 p-3.5">
            <p className="text-[12px] font-bold text-red-900">{inlineError}</p>
          </div>
        )}

        <label className="flex items-start gap-3 cursor-pointer group select-none">
          <button
            type="button"
            onClick={() => setContractAccepted(!contractAccepted)}
            className={cn(
              'mt-0.5 w-5 h-5 rounded-lg border-2 flex items-center justify-center flex-shrink-0 transition-all duration-200 shadow-xs',
              contractAccepted
                ? 'bg-emerald-600 border-emerald-600 scale-105'
                : 'border-slate-300 group-hover:border-emerald-500 bg-white',
            )}
          >
            {contractAccepted && <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />}
          </button>
          <span className="text-[12px] leading-relaxed font-medium text-slate-600">
            J&apos;accepte les{' '}
            <a href="#" className="text-emerald-700 font-bold underline decoration-emerald-500/40">
              conditions générales
            </a>{' '}
            et le{' '}
            <a href="#" className="text-emerald-700 font-bold underline decoration-emerald-500/40">
              contrat de location
            </a>
          </span>
        </label>

        <button
          type="button"
          disabled={!canReserve}
          onClick={handleReserve}
          className={cn(
            'group relative w-full flex items-center justify-center gap-3 rounded-2xl px-6 py-4 border',
            'text-[16px] font-extrabold tracking-tight transition-all duration-300 overflow-hidden select-none',
            canReserve
              ? 'bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 text-white border-emerald-500/50 shadow-xl shadow-emerald-600/30 active:scale-[0.99]'
              : 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed shadow-none',
          )}
        >
          {canReserve && (
            <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 pointer-events-none" />
          )}

          {loadingPricing ? (
            <Loader2 className="w-5 h-5 animate-spin relative z-10 text-white" strokeWidth={2.5} />
          ) : (
            <Lock className="w-5 h-5 relative z-10 text-white/90" strokeWidth={2.5} />
          )}

          <span className="relative z-10 font-black tracking-wide">
            {modePaiement === 'ACOMPTE_SOLDE_CHECKIN' && pricing
              ? `Payer l'acompte · ${formatPrice(Math.round((pricing.totalLocataire + deliveryFee) * 0.3))}`
              : 'Confirmer et réserver'
            }
          </span>

          {!loadingPricing && (
            <ArrowRight className="w-5 h-5 relative z-10 text-white/90" strokeWidth={2.5} />
          )}
        </button>

        <div className="flex items-center justify-center gap-2 pt-0.5">
          <Image src="/wavelogo.jpeg" alt="Wave" width={20} height={20} className="rounded-full object-cover" />
          <Image src="/orangeMoneylogo.jpg" alt="Orange Money" width={20} height={20} className="rounded-full object-cover" />
          <span className="text-[11px] text-slate-400 font-semibold ml-1">Paiement 100% protégé</span>
        </div>
      </div>
    </>
  );
}
