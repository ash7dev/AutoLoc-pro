'use client';

import React, { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  Clock, CreditCard, CheckCircle2,
  ArrowRight, Loader2, Shield, Info, Truck, MapPin, AlertTriangle, UserCheck, CalendarDays,
  Wallet, Banknote,
} from 'lucide-react';
import { cn, getCommissionRate, getTenantPricePerDay } from '@/lib/utils';
import { fetchVehiclePricing, type PricingResponse } from '@/lib/nestjs/vehicles';
import { useCurrency } from '@/providers/currency-provider';
import { apiFetch, ApiError } from '@/lib/nestjs/api-client';
import type { ProfileResponse } from '@/lib/nestjs/auth';
import { useProfileStore } from '@/features/auth/stores/profile.store';
import { ReservationCalendar } from '@/features/vehicles/components/ReservationCalendar';
import { ReservationGateModal } from "@/features/reservations/components/ReservationGateModal";
import { AgeRestrictionModal } from "@/features/reservations/components/AgeRestrictionModal";

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

    // Validation : dateDebut ne peut pas être après dateFin
    if (debut > fin) {
      console.warn('⚠️ Date de début après date de fin', { dateDebut, dateFin });
      return 0;
    }

    // Calcul identique au backend (Math.round)
    // 4 juillet 00:00 → 5 juillet 00:00 = 1 jour
    const diffMs = fin.getTime() - debut.getTime();
    const diffDays = Math.max(1, Math.round(diffMs / 86_400_000));

    return diffDays;
  }, [dateDebut, dateFin]);

  const datesValid = nbJours >= joursMinimum;

  const fetchPricingData = useCallback(async (days: number) => {
    if (days < 1) return;

    // ── Optimisation Mobile : Afficher un prix estimé IMMÉDIATEMENT ──
    // Évite le "blanc" pendant le fetch réseau
    const supp = horsDakar && autoriseHorsDakar ? (supplementHorsDakarParJour ?? 0) : 0;
    const rate = getCommissionRate(prixParJour + supp);
    const estimatedPricing = {
      nbJours: days,
      autoriseHorsDakar,
      supplementHorsDakar: supp,
      prixParJour,
      totalBase: (prixParJour + supp) * days,
      tauxCommission: rate,
      montantCommission: Math.round((prixParJour + supp) * days * rate),
      totalLocataire: Math.round((prixParJour + supp) * days * (1 + rate)),
      netProprietaire: (prixParJour + supp) * days,
    };

    // Afficher immédiatement l'estimation
    setPricing(estimatedPricing);
    setLoadingPricing(true);
    setPricingError(false);

    try {
      // Fetch le vrai prix en arrière-plan (peut avoir tarifs progressifs)
      const result = await fetchVehiclePricing(vehicleId, days, horsDakar);
      setPricing(result);
      setPricingError(false); // Prix réel récupéré
    } catch {
      // Fallback : garder l'estimation, mais signaler que c'est une estimation
      setPricingError(true);
      // On garde déjà estimatedPricing qui a été set plus haut
    } finally {
      setLoadingPricing(false);
    }
  }, [vehicleId, prixParJour, horsDakar, autoriseHorsDakar, supplementHorsDakarParJour]);

  useEffect(() => {
    clearTimeout(debounceRef.current);
    if (nbJours >= 1) {
      // Debounce réduit à 150ms pour une meilleure réactivité
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

      // ── Age Block (independent from Gate) ──────────────────────────────
      // Only fires when: user is logged in + birth date is known + age < minimum.
      // This is NOT a completable step — it's a hard restriction.
      if (ageMinimum && ageMinimum > 0 && profile.dateNaissance) {
        const birth = new Date(profile.dateNaissance);
        const today = new Date();
        let age = today.getFullYear() - birth.getFullYear();
        const m = today.getMonth() - birth.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
        if (age < ageMinimum) {
          setAgeBlockData({ userAge: age });
          setAgeBlockOpen(true);
          return; // Stop here — do NOT open the Gate
        }
      }

      // ── Gate (profile completion) ───────────────────────────────────────
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

  return (
    <div className="sticky top-[76px] space-y-3">
      {/* ── Age Restriction Block (hard stop — independent of Gate) ── */}
      {ageBlockData && (
        <AgeRestrictionModal
          open={ageBlockOpen}
          onClose={() => setAgeBlockOpen(false)}
          ageMinimum={ageMinimum!}
          userAge={ageBlockData.userAge}
        />
      )}

      {/* ── Profile completion Gate ───────────────────────────────── */}
      <ReservationGateModal
        open={gateOpen}
        onOpenChange={setGateOpen}
        profile={gateProfile}
        ageMinimum={ageMinimum}
        userAge={gateProfile?.dateNaissance ? calculateAge(gateProfile.dateNaissance) : undefined}
        onProceed={() => {
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
          router.push(`/vehicle/${vehicleId}/payment?${params.toString()}`);
        }}
      />

      {/* ── Main card ─────────────────────────────────────────── */}
      <div className="rounded-2xl border border-slate-100 bg-white shadow-xl shadow-slate-200/50 overflow-hidden">

        {/* Price header */}
        <div className="px-5 pt-5 pb-4 border-b border-slate-50">
          <div className="flex items-baseline gap-2">
            <span className="text-[30px] font-black text-slate-900 tabular-nums leading-none">
              {formatPrice(pricing ? Math.round(pricing.totalLocataire / pricing.nbJours) : getTenantPricePerDay(prixParJour))}
            </span>
            <span className="text-[13px] font-semibold text-slate-600">/ jour</span>
          </div>

          {/* Conditions de location — toujours visibles */}
          {(joursMinimum > 1 || (ageMinimum && ageMinimum > 0) || autoriseHorsDakar === false) && (
            <div className="flex flex-wrap gap-2 mt-3">
              {joursMinimum > 1 && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 text-[11.5px] font-semibold text-slate-600">
                  <CalendarDays className="w-3 h-3 text-slate-400" strokeWidth={2} />
                  Min. {joursMinimum} jour{joursMinimum > 1 ? 's' : ''}
                </span>
              )}
              {ageMinimum && ageMinimum > 0 && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-50 border border-amber-100 text-[11.5px] font-semibold text-amber-700">
                  <UserCheck className="w-3 h-3 text-amber-500" strokeWidth={2} />
                  {ageMinimum} ans minimum
                </span>
              )}
              {autoriseHorsDakar === false && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 text-[11.5px] font-semibold text-slate-600">
                  <MapPin className="w-3 h-3 text-slate-400" strokeWidth={2} />
                  Région de Dakar uniquement
                </span>
              )}
            </div>
          )}
        </div>

        <div className="p-5 space-y-4">

          {/* ── Calendar ── */}
          <ReservationCalendar
            vehicleId={vehicleId}
            joursMinimum={joursMinimum}
            dateDebut={dateDebut}
            dateFin={dateFin}
            onDateDebutChange={setDateDebut}
            onDateFinChange={setDateFin}
            initialBlockedRanges={blockedRanges}
          />

          {/* Duration indicator */}
          {nbJours > 0 && datesValid && (
            <div className="flex items-center gap-2.5 rounded-xl px-3.5 py-2.5 bg-slate-50 text-[12.5px] font-semibold text-slate-600">
              {loadingPricing ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 flex-shrink-0 text-emerald-500 animate-spin" strokeWidth={2} />
                  Calcul du prix pour {nbJours} jour{nbJours > 1 ? 's' : ''}…
                </>
              ) : (
                <>
                  <Clock className="w-3.5 h-3.5 flex-shrink-0 text-slate-400" strokeWidth={2} />
                  {nbJours} jour{nbJours > 1 ? 's' : ''} de location
                </>
              )}
            </div>
          )}

          {/* Durée insuffisante — message professionnel */}
          {nbJours > 0 && !datesValid && (
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-3.5">
              <div className="flex items-start gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-amber-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <CalendarDays className="w-3.5 h-3.5 text-amber-600" strokeWidth={2} />
                </div>
                <div>
                  <p className="text-[12.5px] font-bold text-amber-800">Durée insuffisante</p>
                  <p className="text-[11.5px] text-amber-700 mt-0.5 leading-relaxed">
                    Ce véhicule se loue pour un minimum de <strong>{joursMinimum} jour{joursMinimum > 1 ? 's' : ''}</strong>.
                    Vous avez sélectionné {nbJours} jour{nbJours > 1 ? 's' : ''}.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* ── Options — Delivery toggle ── */}
          {deliveryAvailable && (
            <div className={cn(
              "relative rounded-2xl border-2 p-4 space-y-3 transition-all duration-300",
              wantsDelivery
                ? "bg-emerald-50/50 border-emerald-200 shadow-sm shadow-emerald-500/10"
                : "bg-white border-slate-200 hover:border-slate-300"
            )}>
              <label className="flex items-start gap-3.5 cursor-pointer group">
                <button
                  type="button"
                  onClick={() => setWantsDelivery(!wantsDelivery)}
                  className={cn(
                    'mt-0.5 w-6 h-6 rounded-lg border-2 flex items-center justify-center flex-shrink-0 transition-all duration-200 shadow-sm',
                    wantsDelivery
                      ? 'bg-emerald-500 border-emerald-500 scale-110'
                      : 'border-slate-300 group-hover:border-emerald-400 bg-white',
                  )}
                >
                  {wantsDelivery && <CheckCircle2 className="w-4 h-4 text-white" strokeWidth={3} />}
                </button>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <Truck className={cn(
                        "w-4 h-4 transition-colors",
                        wantsDelivery ? "text-emerald-600" : "text-slate-500"
                      )} strokeWidth={2} />
                      <span className={cn(
                        "text-[13.5px] font-bold transition-colors",
                        wantsDelivery ? "text-emerald-900" : "text-slate-700"
                      )}>
                        Livraison à domicile
                      </span>
                    </div>
                    <span className="text-[15px] font-black tabular-nums text-emerald-600">
                      + {formatPrice(fraisLivraison)}
                    </span>
                  </div>
                  <p className="text-[11.5px] text-slate-500 font-medium">
                    Le véhicule vous sera livré à l'adresse de votre choix
                  </p>
                </div>
              </label>
              {wantsDelivery && (
                <div className="space-y-2 pl-9 animate-in slide-in-from-top-2 duration-300">
                  <div className="relative">
                    <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-500" strokeWidth={2} />
                    <input
                      type="text"
                      value={deliveryAddress}
                      onChange={(e) => setDeliveryAddress(e.target.value)}
                      placeholder="Entrez votre adresse complète…"
                      className="w-full h-11 rounded-xl border-2 border-emerald-200 bg-white pl-11 pr-4
                        text-[13px] font-semibold text-slate-800 placeholder-slate-400
                        focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-400/20 transition-all"
                    />
                  </div>
                  {wantsDelivery && !deliveryAddress.trim() && (
                    <div className="flex items-center gap-1.5 text-amber-600">
                      <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                      <p className="text-[11px] font-bold">Adresse requise pour continuer</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* ── Options — Hors Dakar toggle ── */}
          {autoriseHorsDakar && supplementHorsDakarParJour != null && (
            <div className={cn(
              "relative rounded-2xl border-2 p-4 transition-all duration-300",
              horsDakar
                ? "bg-blue-50/50 border-blue-200 shadow-sm shadow-blue-500/10"
                : "bg-white border-slate-200 hover:border-slate-300"
            )}>
              <label className="flex items-start gap-3.5 cursor-pointer group">
                <button
                  type="button"
                  onClick={() => setHorsDakar(!horsDakar)}
                  className={cn(
                    'mt-0.5 w-6 h-6 rounded-lg border-2 flex items-center justify-center flex-shrink-0 transition-all duration-200 shadow-sm',
                    horsDakar
                      ? 'bg-blue-500 border-blue-500 scale-110'
                      : 'border-slate-300 group-hover:border-blue-400 bg-white',
                  )}
                >
                  {horsDakar && <CheckCircle2 className="w-4 h-4 text-white" strokeWidth={3} />}
                </button>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <MapPin className={cn(
                        "w-4 h-4 transition-colors",
                        horsDakar ? "text-blue-600" : "text-slate-500"
                      )} strokeWidth={2} />
                      <span className={cn(
                        "text-[13.5px] font-bold transition-colors",
                        horsDakar ? "text-blue-900" : "text-slate-700"
                      )}>
                        Voyage Hors Dakar
                      </span>
                    </div>
                    <span className="text-[15px] font-black tabular-nums text-emerald-600">
                      + {formatPrice(supplementHorsDakarParJour)}<span className="text-[11px] font-semibold text-slate-400"> /jour</span>
                    </span>
                  </div>
                  <p className="text-[11.5px] text-slate-500 font-medium">
                    Partez explorer les régions du Sénégal
                  </p>
                </div>
              </label>
            </div>
          )}

          {/* ── Mode de paiement — toggle cards ── */}
          {pricing && datesValid && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 mb-1">
              <div className="w-6 h-6 rounded-lg bg-slate-100 flex items-center justify-center">
                  <Wallet className="w-3.5 h-3.5 text-slate-600" strokeWidth={2} />
                </div>
                <h4 className="text-[12.5px] font-black text-slate-700 uppercase tracking-wide">Mode de paiement</h4>
              </div>

              {/* Option: Paiement Total */}
              <button
                type="button"
                onClick={() => setModePaiement('TOTAL_EN_LIGNE')}
                className={cn(
                  'w-full text-left rounded-2xl border-2 p-3.5 transition-all duration-300',
                  modePaiement === 'TOTAL_EN_LIGNE'
                    ? 'bg-emerald-50/60 border-emerald-300 shadow-sm shadow-emerald-500/10'
                    : 'bg-white border-slate-200 hover:border-slate-300',
                )}
              >
                <div className="flex items-start gap-3">
                  <div className={cn(
                    'mt-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all duration-200',
                    modePaiement === 'TOTAL_EN_LIGNE'
                      ? 'bg-emerald-500 border-emerald-500'
                      : 'border-slate-300',
                  )}>
                    {modePaiement === 'TOTAL_EN_LIGNE' && <CheckCircle2 className="w-3 h-3 text-white" strokeWidth={3} />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <CreditCard className={cn(
                        'w-3.5 h-3.5 transition-colors',
                        modePaiement === 'TOTAL_EN_LIGNE' ? 'text-emerald-600' : 'text-slate-400'
                      )} strokeWidth={2} />
                      <span className={cn(
                        'text-[13px] font-bold transition-colors',
                        modePaiement === 'TOTAL_EN_LIGNE' ? 'text-emerald-900' : 'text-slate-700'
                      )}>
                        Payer 100% en ligne
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 font-medium leading-relaxed">
                      Payez la totalité maintenant. Réservation confirmée instantanément.
                    </p>
                  </div>
                </div>
              </button>

              {/* Option: Accompte 30% */}
              <button
                type="button"
                onClick={() => setModePaiement('ACOMPTE_SOLDE_CHECKIN')}
                className={cn(
                  'w-full text-left rounded-2xl border-2 p-3.5 transition-all duration-300',
                  modePaiement === 'ACOMPTE_SOLDE_CHECKIN'
                    ? 'bg-emerald-50/60 border-emerald-300 shadow-sm shadow-emerald-500/10'
                    : 'bg-white border-slate-200 hover:border-slate-300',
                )}
              >
                <div className="flex items-start gap-3">
                  <div className={cn(
                    'mt-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all duration-200',
                    modePaiement === 'ACOMPTE_SOLDE_CHECKIN'
                      ? 'bg-emerald-500 border-emerald-500'
                      : 'border-slate-300',
                  )}>
                    {modePaiement === 'ACOMPTE_SOLDE_CHECKIN' && <CheckCircle2 className="w-3 h-3 text-white" strokeWidth={3} />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <Banknote className={cn(
                        'w-3.5 h-3.5 transition-colors',
                        modePaiement === 'ACOMPTE_SOLDE_CHECKIN' ? 'text-emerald-600' : 'text-slate-400'
                      )} strokeWidth={2} />
                      <span className={cn(
                        'text-[13px] font-bold transition-colors',
                        modePaiement === 'ACOMPTE_SOLDE_CHECKIN' ? 'text-emerald-900' : 'text-slate-700'
                      )}>
                        Accompte 30% + Solde à la remise
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 font-medium leading-relaxed">
                      Payez 30% maintenant, le reste au propriétaire lors de la remise des clés.
                    </p>
                    {modePaiement === 'ACOMPTE_SOLDE_CHECKIN' && pricing && (
                      <div className="mt-2 flex items-center gap-3 text-[11px] font-bold animate-in fade-in duration-300">
                        <span className="text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md">
                          En ligne : {formatPrice(Math.round((pricing.totalLocataire + deliveryFee) * 0.3))}
                        </span>
                        <span className="text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md">
                          À la remise : {formatPrice(Math.round((pricing.totalLocataire + deliveryFee) * 0.7))}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </button>
            </div>
          )}

          {/* ── Résumé de la réservation — dark glass+blur — AFTER options ── */}
          {pricing && datesValid && (
            <div className="relative rounded-2xl overflow-hidden p-5 space-y-3 shadow-xl">
              {/* Dark glass background */}
              <div className="absolute inset-0 bg-gradient-to-br from-slate-900/95 via-slate-800/95 to-slate-900/95 backdrop-blur-xl" />
              {/* Decorative glows */}
              <div className="absolute top-0 right-0 w-40 h-40 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

              <div className="relative space-y-2.5">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-7 h-7 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                    <CreditCard className="w-3.5 h-3.5 text-emerald-400" strokeWidth={2} />
                  </div>
                  <h4 className="text-[13px] font-black text-white/90 uppercase tracking-wide">Résumé de la réservation</h4>
                </div>

                <div className="flex justify-between items-center text-[13px]">
                  <span className="text-slate-300 font-medium">
                    {formatPrice(Math.round(pricing.totalLocataire / nbJours))} × {nbJours}j
                  </span>
                  <span className="font-semibold text-white tabular-nums">
                    {formatPrice(pricing.totalLocataire)}
                  </span>
                </div>
                {deliveryFee > 0 && (
                  <div className="flex justify-between items-center text-[13px]">
                    <span className="text-slate-300 font-medium flex items-center gap-1.5">
                      <Truck className="w-3.5 h-3.5 text-emerald-400" strokeWidth={2} />
                      Livraison
                    </span>
                    <span className="font-semibold text-white tabular-nums">
                      {formatPrice(deliveryFee)}
                    </span>
                  </div>
                )}
                {pricing.supplementHorsDakar != null && pricing.supplementHorsDakar > 0 && (
                  <div className="flex justify-between items-center text-[13px]">
                    <span className="text-slate-300 font-medium flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-blue-400" strokeWidth={2} />
                      Supplément Hors Dakar
                    </span>
                    <span className="font-semibold text-white tabular-nums">
                      {formatPrice(pricing.supplementHorsDakar * nbJours)}
                    </span>
                  </div>
                )}
                <div className="pt-2.5 mt-1 border-t border-white/15 flex justify-between items-center">
                  <span className="text-[14px] font-black text-white">Total</span>
                  <span className="text-[20px] font-black text-emerald-400 tabular-nums">
                    {formatPrice(pricing.totalLocataire + deliveryFee)}
                  </span>
                </div>

                {/* ── Breakdown accompte if deposit mode ── */}
                {modePaiement === 'ACOMPTE_SOLDE_CHECKIN' && (
                  <div className="pt-2.5 mt-0.5 border-t border-white/10 space-y-1.5 animate-in fade-in slide-in-from-top-2 duration-300">
                    <div className="flex justify-between items-center text-[12.5px]">
                      <span className="text-emerald-300 font-semibold flex items-center gap-1.5">
                        <CreditCard className="w-3 h-3" strokeWidth={2} />
                        À payer maintenant (30%)
                      </span>
                      <span className="font-black text-emerald-300 tabular-nums">
                        {formatPrice(Math.round((pricing.totalLocataire + deliveryFee) * 0.3))}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-[12.5px]">
                      <span className="text-slate-400 font-semibold flex items-center gap-1.5">
                        <Banknote className="w-3 h-3" strokeWidth={2} />
                        Solde à la remise (70%)
                      </span>
                      <span className="font-semibold text-slate-400 tabular-nums">
                        {formatPrice(Math.round((pricing.totalLocataire + deliveryFee) * 0.7))}
                      </span>
                    </div>
                  </div>
                )}

                {loadingPricing && (
                  <div className="flex justify-center pt-1">
                    <Loader2 className="w-4 h-4 animate-spin text-emerald-400" />
                  </div>
                )}
                {pricingError && !loadingPricing && (
                  <div className="flex items-center gap-2 pt-2 border-t border-white/10">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" strokeWidth={2} />
                    <p className="text-[11px] font-medium text-amber-300">
                      Prix estimé — le montant exact sera confirmé à l&apos;étape suivante.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Contract checkbox - Premium */}
          <label className="flex items-start gap-3.5 cursor-pointer group">
            <button
              type="button"
              onClick={() => setContractAccepted(!contractAccepted)}
              className={cn(
                'mt-0.5 w-6 h-6 rounded-lg border-2 flex items-center justify-center flex-shrink-0 transition-all duration-200 shadow-sm',
                contractAccepted
                  ? 'bg-emerald-500 border-emerald-500 scale-105'
                  : 'border-slate-300 group-hover:border-emerald-400 bg-white',
              )}
            >
              {contractAccepted && <CheckCircle2 className="w-4 h-4 text-white" strokeWidth={3} />}
            </button>
            <span className="text-[12.5px] leading-relaxed font-medium text-slate-600 group-hover:text-slate-900 transition-colors">
              J&apos;accepte les{' '}
              <a href="#" className="text-emerald-600 font-bold underline decoration-emerald-600/30 decoration-2 underline-offset-2 hover:text-emerald-700">
                conditions générales
              </a>{' '}
              et le{' '}
              <a href="#" className="text-emerald-600 font-bold underline decoration-emerald-600/30 decoration-2 underline-offset-2 hover:text-emerald-700">
                contrat de location
              </a>
            </span>
          </label>

          {/* Erreur inline âge / profil - Premium */}
          {inlineError && (
            <div className="rounded-2xl border-2 border-red-200 bg-gradient-to-br from-red-50 to-red-50/50 p-4 animate-in slide-in-from-top-2 duration-300">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-red-100 flex items-center justify-center flex-shrink-0 shadow-sm">
                  <AlertTriangle className="w-4.5 h-4.5 text-red-600" strokeWidth={2.5} />
                </div>
                <div className="flex-1">
                  <p className="text-[13px] font-black text-red-900">Impossible de continuer</p>
                  <p className="text-[12px] text-red-700 mt-1 leading-relaxed font-medium">{inlineError}</p>
                </div>
              </div>
            </div>
          )}

          {/* CTA - Premium emerald button */}
          <button
            type="button"
            disabled={!canReserve}
            onClick={handleReserve}
            className={cn(
              'group relative w-full flex items-center justify-center gap-3 rounded-2xl px-5 py-[18px]',
              'text-[16px] font-black tracking-tight transition-all duration-300 overflow-hidden',
              canReserve
                ? 'bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-emerald-400 shadow-xl shadow-slate-900/40 hover:shadow-2xl hover:shadow-slate-900/50 hover:-translate-y-0.5 active:translate-y-0 active:shadow-lg active:scale-[0.98]'
                : 'bg-slate-200 text-slate-400 cursor-not-allowed',
            )}
          >
            {/* Shine effect */}
            {canReserve && (
              <>
                <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 pointer-events-none" />
                <span className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent pointer-events-none" />
              </>
            )}
            {loadingPricing
              ? <Loader2 className="w-5 h-5 animate-spin relative z-10" strokeWidth={2.5} />
              : <CreditCard className="w-5 h-5 relative z-10" strokeWidth={2.5} />
            }
            <span className="relative z-10">
              {modePaiement === 'ACOMPTE_SOLDE_CHECKIN' && pricing
                ? `Payer l'accompte ${formatPrice(Math.round((pricing.totalLocataire + deliveryFee) * 0.3))}`
                : 'Confirmer et réserver'
              }
            </span>
            {!loadingPricing && (
              <ArrowRight className={cn(
                "w-5 h-5 relative z-10 transition-transform",
                canReserve && "group-hover:translate-x-1"
              )} strokeWidth={2.5} />
            )}
          </button>

          {/* Trust note */}
          <div className="flex flex-col items-center gap-2">
            <div className="flex items-center gap-1.5">
              <Image src="/wavelogo.jpeg" alt="Wave" width={24} height={24} className="rounded-full object-cover" />
              <Image src="/orangeMoneylogo.jpg" alt="Orange Money" width={24} height={24} className="rounded-full object-cover" />
            </div>
            <p className="flex items-center justify-center gap-1.5 text-[11.5px] text-slate-400 font-medium text-center">
              <Shield className="w-3 h-3 text-slate-300" strokeWidth={2} />
              Aucun débit avant confirmation du propriétaire
            </p>
          </div>
        </div>
      </div>

      {/* ── Trust badges ──────────────────────────────────────── */}
      <div className="rounded-2xl border border-slate-100 bg-white p-4">
        <div className="space-y-2.5">
          {[
            { icon: Shield, text: 'Paiement 100% sécurisé et protégé' },
            { icon: Info, text: 'Annulation gratuite sous 24h' },
            { icon: CheckCircle2, text: 'Assistance disponible 7j/7' },
          ].map(({ icon: Icon, text }) => (
            <div key={text} className="flex items-center gap-2.5">
              <span className="w-7 h-7 rounded-lg bg-emerald-50 flex items-center justify-center flex-shrink-0">
                <Icon className="w-3.5 h-3.5 text-emerald-500" strokeWidth={2} />
              </span>
              <span className="text-[12.5px] font-medium text-slate-500">{text}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
