'use client';

import React, { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  Clock, CreditCard, CheckCircle2,
  ArrowRight, Loader2, Shield, Info, Truck, MapPin, AlertTriangle, UserCheck, CalendarDays,
  Wallet, Banknote, Sparkles, ShieldCheck, Lock, ChevronRight
} from 'lucide-react';
import { cn, getCommissionRate, getTenantPricePerDay, roundToNearest100 } from '@/lib/utils';
import { fetchVehiclePricing, type PricingResponse } from '@/lib/nestjs/vehicles';
import { useCurrency } from '@/providers/currency-provider';
import { apiFetch, ApiError } from '@/lib/nestjs/api-client';
import type { ProfileResponse } from '@/lib/nestjs/auth';
import { useProfileStore } from '@/features/auth/stores/profile.store';
import { ReservationCalendar } from '@/features/vehicles/components/ReservationCalendar';
import { ReservationGateModal } from "@/features/reservations/components/ReservationGateModal";
import { AgeRestrictionModal } from "@/features/reservations/components/AgeRestrictionModal";
import { PremiumPriceTag } from '@/components/ui/PremiumPriceTag';

function calculateAge(dateStr: string): number {
  const birth = new Date(dateStr);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return age;
}

interface Props {
  vehicleId: string;
  prixParJour: number;
  joursMinimum: number;
  ageMinimum?: number;
  fraisLivraison?: number | null;
  autoriseHorsDakar?: boolean;
  supplementHorsDakarParJour?: number | null;
  blockedRanges?: any[];
}

export function ReservationSidebar({ vehicleId, prixParJour, joursMinimum, ageMinimum, fraisLivraison, autoriseHorsDakar, supplementHorsDakarParJour, blockedRanges }: Props): React.ReactElement {
  const router = useRouter();
  const { formatPrice } = useCurrency();
  const params = useSearchParams();
  const [dateDebut, setDateDebut] = useState(params.get('dateDebut') ?? '');
  const [dateFin, setDateFin] = useState(params.get('dateFin') ?? '');
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

    if (debut > fin) {
      console.warn('⚠️ Date de début après date de fin', { dateDebut, dateFin });
      return 0;
    }

    const diffMs = fin.getTime() - debut.getTime();
    const diffDays = Math.max(1, Math.round(diffMs / 86_400_000));

    return diffDays;
  }, [dateDebut, dateFin]);

  const datesValid = nbJours >= joursMinimum;

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

  const canReserve = datesValid && contractAccepted && pricing && !loadingPricing
    && (!wantsDelivery || deliveryAddress.trim().length > 0);

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
    <div className="sticky top-[88px] space-y-4">
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
        userAge={gateProfile?.dateNaissance ? calculateAge(gateProfile.dateNaissance) : undefined}
        onProceed={() => {
          const params = buildParams();
          router.push(`/vehicle/${vehicleId}/payment?${params.toString()}`);
        }}
      />

      {/* ── Main Luxury Card ─────────────────────────────────────────── */}
      <div className="rounded-3xl border border-slate-200/80 bg-white shadow-2xl shadow-slate-900/10 overflow-hidden backdrop-blur-xl transition-all duration-300">

        {/* Hero Price Header */}
        <div className="relative p-6 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white overflow-hidden border-b border-slate-800">
          {/* Subtle Ambient Glow */}
          <div className="absolute top-0 right-0 w-36 h-36 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-28 h-28 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />

          <div className="relative flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 border border-white/15 text-[11px] font-bold text-emerald-300 backdrop-blur-md uppercase tracking-wider">
                <Sparkles className="w-3 h-3 text-emerald-400" />
                Tarif garanti
              </span>
              <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                Réservation sécurisée
              </span>
            </div>

            <div className="mt-1">
              <PremiumPriceTag
                price={currentDailyPrice}
                size="hero"
                variant="dark"
                hidePrefix={true}
                period="/ jour"
              />
            </div>

            {/* Conditions Tag Pills */}
            {(joursMinimum > 1 || (ageMinimum && ageMinimum > 0) || autoriseHorsDakar === false) && (
              <div className="flex flex-wrap gap-2 mt-2 pt-3 border-t border-white/10">
                {joursMinimum > 1 && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/10 text-[11.5px] font-semibold text-slate-200 backdrop-blur-sm">
                    <CalendarDays className="w-3.5 h-3.5 text-emerald-400" strokeWidth={2} />
                    Min. {joursMinimum} jour{joursMinimum > 1 ? 's' : ''}
                  </span>
                )}
                {ageMinimum && ageMinimum > 0 && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-500/15 border border-amber-400/20 text-[11.5px] font-semibold text-amber-300 backdrop-blur-sm">
                    <UserCheck className="w-3.5 h-3.5 text-amber-400" strokeWidth={2} />
                    {ageMinimum} ans minimum
                  </span>
                )}
                {autoriseHorsDakar === false && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/10 text-[11.5px] font-semibold text-slate-200 backdrop-blur-sm">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" strokeWidth={2} />
                    Dakar uniquement
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="p-6 space-y-5">

          {/* ── Dates Selector ── */}
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
            <div className="flex items-center gap-2.5 rounded-2xl px-4 py-3 bg-gradient-to-r from-emerald-50/80 to-teal-50/50 border border-emerald-100 text-[13px] font-semibold text-emerald-900 shadow-sm">
              {loadingPricing ? (
                <>
                  <Loader2 className="w-4 h-4 flex-shrink-0 text-emerald-600 animate-spin" strokeWidth={2.5} />
                  Calcul personnalisé pour {nbJours} jour{nbJours > 1 ? 's' : ''}…
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
            <div className="rounded-2xl border border-amber-200/90 bg-gradient-to-br from-amber-50/90 to-amber-100/50 p-4 shadow-sm">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-amber-100 flex items-center justify-center flex-shrink-0 mt-0.5 shadow-sm">
                  <CalendarDays className="w-4 h-4 text-amber-700" strokeWidth={2.5} />
                </div>
                <div>
                  <p className="text-[13px] font-extrabold text-amber-900">Durée minimale non atteinte</p>
                  <p className="text-[12px] text-amber-800 mt-0.5 leading-relaxed font-medium">
                    Le propriétaire demande au moins <strong>{joursMinimum} jour{joursMinimum > 1 ? 's' : ''}</strong> de réservation.
                    (Sélection actuelle : {nbJours} jour{nbJours > 1 ? 's' : ''}).
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* ── Delivery Option ── */}
          {deliveryAvailable && (
            <div className={cn(
              "relative rounded-2xl border-2 p-4 space-y-3 transition-all duration-300",
              wantsDelivery
                ? "bg-emerald-50/60 border-emerald-300 shadow-md shadow-emerald-500/5"
                : "bg-slate-50/60 border-slate-200/90 hover:border-slate-300 hover:bg-white"
            )}>
              <label className="flex items-start gap-3.5 cursor-pointer group select-none">
                <button
                  type="button"
                  onClick={() => setWantsDelivery(!wantsDelivery)}
                  className={cn(
                    'mt-0.5 w-5 h-5 rounded-lg border-2 flex items-center justify-center flex-shrink-0 transition-all duration-200 shadow-sm',
                    wantsDelivery
                      ? 'bg-emerald-600 border-emerald-600 scale-105'
                      : 'border-slate-300 group-hover:border-emerald-500 bg-white',
                  )}
                >
                  {wantsDelivery && <CheckCircle2 className="w-3.5 h-3.5 text-white" strokeWidth={3} />}
                </button>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-0.5">
                    <div className="flex items-center gap-2">
                      <Truck className={cn(
                        "w-4 h-4 transition-colors",
                        wantsDelivery ? "text-emerald-700" : "text-slate-500"
                      )} strokeWidth={2.5} />
                      <span className={cn(
                        "text-[14px] font-bold transition-colors",
                        wantsDelivery ? "text-emerald-950 font-extrabold" : "text-slate-800"
                      )}>
                        Livraison à domicile
                      </span>
                    </div>
                    <span className="text-[14px] font-black tabular-nums text-emerald-600 bg-white px-2 py-0.5 rounded-lg border border-emerald-100 shadow-xs">
                      + {formatPrice(fraisLivraison)}
                    </span>
                  </div>
                  <p className="text-[12px] text-slate-500 font-medium">
                    Le véhicule vous sera livré à l&apos;adresse de votre choix
                  </p>
                </div>
              </label>

              {wantsDelivery && (
                <div className="space-y-2 pl-8 pt-1 animate-in slide-in-from-top-2 duration-300">
                  <div className="relative">
                    <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-600" strokeWidth={2.5} />
                    <input
                      type="text"
                      value={deliveryAddress}
                      onChange={(e) => setDeliveryAddress(e.target.value)}
                      placeholder="Adresse exacte de livraison (ex: Les Almadies, Dakar)"
                      className="w-full h-11 rounded-xl border-2 border-emerald-200 bg-white pl-10 pr-4
                        text-[13px] font-semibold text-slate-900 placeholder-slate-400
                        focus:border-emerald-500 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 transition-all shadow-xs"
                    />
                  </div>
                  {!deliveryAddress.trim() && (
                    <div className="flex items-center gap-1.5 text-amber-600">
                      <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                      <p className="text-[11.5px] font-bold">Veuillez indiquer l&apos;adresse pour valider</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* ── Hors Dakar Option ── */}
          {autoriseHorsDakar && supplementHorsDakarParJour != null && (
            <div className={cn(
              "relative rounded-2xl border-2 p-4 transition-all duration-300",
              horsDakar
                ? "bg-blue-50/60 border-blue-300 shadow-md shadow-blue-500/5"
                : "bg-slate-50/60 border-slate-200/90 hover:border-slate-300 hover:bg-white"
            )}>
              <label className="flex items-start gap-3.5 cursor-pointer group select-none">
                <button
                  type="button"
                  onClick={() => setHorsDakar(!horsDakar)}
                  className={cn(
                    'mt-0.5 w-5 h-5 rounded-lg border-2 flex items-center justify-center flex-shrink-0 transition-all duration-200 shadow-sm',
                    horsDakar
                      ? 'bg-blue-600 border-blue-600 scale-105'
                      : 'border-slate-300 group-hover:border-blue-500 bg-white',
                  )}
                >
                  {horsDakar && <CheckCircle2 className="w-3.5 h-3.5 text-white" strokeWidth={3} />}
                </button>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-0.5">
                    <div className="flex items-center gap-2">
                      <MapPin className={cn(
                        "w-4 h-4 transition-colors",
                        horsDakar ? "text-blue-700" : "text-slate-500"
                      )} strokeWidth={2.5} />
                      <span className={cn(
                        "text-[14px] font-bold transition-colors",
                        horsDakar ? "text-blue-950 font-extrabold" : "text-slate-800"
                      )}>
                        Voyage Hors Dakar
                      </span>
                    </div>
                    <span className="text-[14px] font-black tabular-nums text-blue-600 bg-white px-2 py-0.5 rounded-lg border border-blue-100 shadow-xs">
                      + {formatPrice(supplementHorsDakarParJour)}<span className="text-[11px] font-semibold text-slate-400">/j</span>
                    </span>
                  </div>
                  <p className="text-[12px] text-slate-500 font-medium">
                    Partez explorer les régions du Sénégal en toute tranquillité
                  </p>
                </div>
              </label>
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
                      {modePaiement === 'TOTAL_EN_LIGNE' && <CheckCircle2 className="w-3.5 h-3.5 text-white" strokeWidth={3} />}
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
                      {modePaiement === 'ACOMPTE_SOLDE_CHECKIN' && <CheckCircle2 className="w-3.5 h-3.5 text-white" strokeWidth={3} />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-0.5">
                        <div className="flex items-center gap-2">
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

          {/* ── Summary Card (Dark Glass Masterpiece) ── */}
          {pricing && datesValid && (() => {
            const suppTotal = (pricing.supplementHorsDakar != null && pricing.supplementHorsDakar > 0)
              ? pricing.supplementHorsDakar * nbJours
              : 0;
            const baseLocationTotal = pricing.totalLocataire - suppTotal;
            const baseDailyTenant = Math.round(baseLocationTotal / nbJours);
            const grandTotal = pricing.totalLocataire + deliveryFee;

            return (
              <div className="relative rounded-3xl overflow-hidden p-5 space-y-3.5 shadow-2xl shadow-slate-950/20 border border-slate-800/80">
                {/* Background Glass Layer */}
                <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 backdrop-blur-2xl" />
                <div className="absolute top-0 right-0 w-44 h-44 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-36 h-36 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

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
                      <span className="text-[24px] font-black text-emerald-400 tabular-nums tracking-tight block leading-none">
                        {formatPrice(grandTotal)}
                      </span>
                    </div>
                  </div>

                  {/* Deposit Payment Sub-Breakdown */}
                  {modePaiement === 'ACOMPTE_SOLDE_CHECKIN' && (
                    <div className="pt-3 border-t border-white/10 space-y-2 animate-in fade-in duration-300">
                      <div className="flex justify-between items-center text-[12.5px]">
                        <span className="text-emerald-300 font-extrabold flex items-center gap-1.5">
                          <CreditCard className="w-3.5 h-3.5 text-emerald-400" strokeWidth={2.5} />
                          Débit aujourd&apos;hui (30%)
                        </span>
                        <span className="font-black text-emerald-300 tabular-nums text-[14px]">
                          {formatPrice(Math.round(grandTotal * 0.3))}
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-[12.5px]">
                        <span className="text-slate-400 font-semibold flex items-center gap-1.5">
                          <Banknote className="w-3.5 h-3.5 text-slate-400" strokeWidth={2.5} />
                          Reste à régler au check-in (70%)
                        </span>
                        <span className="font-semibold text-slate-400 tabular-nums">
                          {formatPrice(Math.round(grandTotal * 0.7))}
                        </span>
                      </div>
                    </div>
                  )}

                  {pricingError && !loadingPricing && (
                    <div className="flex items-center gap-2 pt-2 border-t border-white/10">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" strokeWidth={2.5} />
                      <p className="text-[11px] font-medium text-amber-300">
                        Prix estimé — confirmation exacte au paiement.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            );
          })()}

          {/* Contract Checkbox */}
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
              {contractAccepted && <CheckCircle2 className="w-3.5 h-3.5 text-white" strokeWidth={3} />}
            </button>
            <span className="text-[12.5px] leading-relaxed font-medium text-slate-600 group-hover:text-slate-900 transition-colors">
              J&apos;accepte les{' '}
              <a href="#" className="text-emerald-700 font-bold underline decoration-emerald-500/40 underline-offset-2 hover:text-emerald-800">
                conditions générales
              </a>{' '}
              et le{' '}
              <a href="#" className="text-emerald-700 font-bold underline decoration-emerald-500/40 underline-offset-2 hover:text-emerald-800">
                contrat de location
              </a>
            </span>
          </label>

          {/* Inline Error Notice */}
          {inlineError && (
            <div className="rounded-2xl border-2 border-red-200 bg-gradient-to-br from-red-50 to-red-100/50 p-4 animate-in slide-in-from-top-2 duration-300">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-red-100 flex items-center justify-center flex-shrink-0 shadow-xs">
                  <AlertTriangle className="w-4.5 h-4.5 text-red-700" strokeWidth={2.5} />
                </div>
                <div className="flex-1">
                  <p className="text-[13px] font-extrabold text-red-950">Action requise</p>
                  <p className="text-[12px] text-red-800 mt-0.5 leading-relaxed font-medium">{inlineError}</p>
                </div>
              </div>
            </div>
          )}

          {/* ── Main High-Converting CTA ── */}
          <button
            type="button"
            disabled={!canReserve}
            onClick={handleReserve}
            className={cn(
              'group relative w-full flex items-center justify-center gap-3 rounded-2xl px-6 py-4 border',
              'text-[16px] font-extrabold tracking-tight transition-all duration-300 overflow-hidden select-none',
              canReserve
                ? 'bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 text-white border-emerald-500/50 shadow-xl shadow-emerald-600/30 hover:shadow-2xl hover:shadow-emerald-600/45 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.99]'
                : 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed shadow-none',
            )}
          >
            {/* Double Light Reflections */}
            {canReserve && (
              <>
                <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/25 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 pointer-events-none" />
                <span className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent pointer-events-none" />
              </>
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
              <ArrowRight className={cn(
                "w-5 h-5 relative z-10 transition-transform text-white/90",
                canReserve && "group-hover:translate-x-1"
              )} strokeWidth={2.5} />
            )}
          </button>

          {/* Payment guarantees */}
          <div className="flex flex-col items-center gap-2.5 pt-1">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Paiement via</span>
              <div className="flex items-center gap-2">
                <div className="rounded-full overflow-hidden border border-slate-200 shadow-xs">
                  <Image src="/wavelogo.jpeg" alt="Wave" width={22} height={22} className="object-cover" />
                </div>
                <div className="rounded-full overflow-hidden border border-slate-200 shadow-xs">
                  <Image src="/orangeMoneylogo.jpg" alt="Orange Money" width={22} height={22} className="object-cover" />
                </div>
              </div>
            </div>

            <p className="flex items-center justify-center gap-1.5 text-[11.5px] text-slate-500 font-semibold text-center">
              <Shield className="w-3.5 h-3.5 text-emerald-600" strokeWidth={2.5} />
              Aucun débit avant confirmation par le propriétaire
            </p>
          </div>
        </div>
      </div>

      {/* ── Trust Badges Block ──────────────────────────────────────── */}
      <div className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-lg shadow-slate-900/5">
        <div className="space-y-3">
          {[
            { icon: Shield, title: 'Paiement 100% sécurisé', subtitle: 'Transactions chiffrées & garanties' },
            { icon: Info, title: 'Annulation flexible', subtitle: 'Remboursement sous 24h avant départ' },
            { icon: CheckCircle2, title: 'Assistance AutoLoc 7j/7', subtitle: 'Support téléphonique local dédié' },
          ].map(({ icon: Icon, title, subtitle }) => (
            <div key={title} className="flex items-start gap-3">
              <span className="w-8 h-8 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Icon className="w-4 h-4 text-emerald-600" strokeWidth={2.5} />
              </span>
              <div>
                <p className="text-[13px] font-extrabold text-slate-900">{title}</p>
                <p className="text-[11.5px] font-medium text-slate-500">{subtitle}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
