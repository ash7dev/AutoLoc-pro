'use client';

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  Clock, CreditCard, CheckCircle2,
  ArrowRight, Loader2, Shield, Info, Truck, MapPin,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { fetchVehiclePricing, type PricingResponse } from '@/lib/nestjs/vehicles';
import { useCurrency } from '@/providers/currency-provider';
import { apiFetch, ApiError } from '@/lib/nestjs/api-client';
import type { ProfileResponse } from '@/lib/nestjs/auth';
import { ReservationCalendar } from '@/features/vehicles/components/ReservationCalendar';
import { ReservationGateModal } from '@/features/reservations/components/ReservationGateModal';

interface Props {
  vehicleId: string;
  prixParJour: number;
  joursMinimum: number;
  fraisLivraison?: number | null;
}

export function ReservationSidebar({ vehicleId, prixParJour, joursMinimum, fraisLivraison }: Props): React.ReactElement {
  const router = useRouter();
  const { formatPrice } = useCurrency();
  const [dateDebut, setDateDebut] = useState('');
  const [dateFin, setDateFin] = useState('');
  const [pricing, setPricing] = useState<PricingResponse | null>(null);
  const [loadingPricing, setLoadingPricing] = useState(false);
  const [contractAccepted, setContractAccepted] = useState(false);
  const [gateOpen, setGateOpen] = useState(false);
  const [gateProfile, setGateProfile] = useState<ProfileResponse | null>(null);
  const [gateLoading, setGateLoading] = useState(false);
  const [wantsDelivery, setWantsDelivery] = useState(false);
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [calendarOpen, setCalendarOpen] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  const deliveryAvailable = fraisLivraison != null && fraisLivraison > 0;
  const deliveryFee = wantsDelivery && deliveryAvailable ? fraisLivraison : 0;

  // Comptage calendaire inclusif : arrivée + départ = jours facturés.
  // Ex: 27 fév → 2 mars = 4 jours (27, 28, 1, 2) et non 3 (différence brute).
  const nbJours =
    dateDebut && dateFin
      ? Math.max(1, Math.round(
        (new Date(dateFin).getTime() - new Date(dateDebut).getTime()) / 86_400_000,
      ) + 1)
      : 0;

  const datesValid = nbJours >= joursMinimum;

  const fetchPricingData = useCallback(async (days: number) => {
    if (days < 1) return;
    setLoadingPricing(true);
    try {
      const result = await fetchVehiclePricing(vehicleId, days);
      setPricing(result);
    } catch {
      setPricing({
        nbJours: days,
        prixParJour,
        totalBase: prixParJour * days,
        tauxCommission: 0.15,
        montantCommission: Math.round(prixParJour * days * 0.15),
        totalLocataire: Math.round(prixParJour * days * 1.15),
        netProprietaire: prixParJour * days,
      });
    } finally {
      setLoadingPricing(false);
    }
  }, [vehicleId, prixParJour]);

  useEffect(() => {
    clearTimeout(debounceRef.current);
    if (nbJours >= 1) {
      debounceRef.current = setTimeout(() => fetchPricingData(nbJours), 300);
    } else {
      setPricing(null);
    }
    return () => clearTimeout(debounceRef.current);
  }, [nbJours, fetchPricingData]);

  const canReserve = datesValid && contractAccepted && pricing && !loadingPricing
    && (!wantsDelivery || deliveryAddress.trim().length > 0);

  async function handleReserve() {
    if (!canReserve || gateLoading) return;
    setGateLoading(true);
    try {
      const profile = await apiFetch<ProfileResponse>('/auth/me');
      const needsPhone = !profile.phoneVerified || !profile.phone;
      const needsKyc = profile.kycStatus !== 'VERIFIE';

      if (needsPhone || needsKyc) {
        setGateProfile(profile);
        setGateOpen(true);
        return;
      }

      const params = new URLSearchParams({ dateDebut, dateFin, nbJours: String(nbJours) });
      if (wantsDelivery && deliveryAddress.trim()) {
        params.set('livraison', '1');
        params.set('adresseLivraison', deliveryAddress.trim());
      }
      router.push(`/vehicle/${vehicleId}/payment?${params.toString()}`);
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        const redirect = encodeURIComponent(`${window.location.pathname}${window.location.search}`);
        router.push(`/login?redirect=${redirect}`);
        return;
      }
      // fallback: allow navigation if gate fails
      const params = new URLSearchParams({ dateDebut, dateFin, nbJours: String(nbJours) });
      if (wantsDelivery && deliveryAddress.trim()) {
        params.set('livraison', '1');
        params.set('adresseLivraison', deliveryAddress.trim());
      }
      router.push(`/vehicle/${vehicleId}/payment?${params.toString()}`);
    } finally {
      setGateLoading(false);
    }
  }

  return (
    <div className="sticky top-[76px] space-y-3">
      <ReservationGateModal
        open={gateOpen}
        onOpenChange={setGateOpen}
        profile={gateProfile}
        onProceed={() => {
          const params = new URLSearchParams({ dateDebut, dateFin, nbJours: String(nbJours) });
          if (wantsDelivery && deliveryAddress.trim()) {
            params.set('livraison', '1');
            params.set('adresseLivraison', deliveryAddress.trim());
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
              {formatPrice(pricing ? Math.round(pricing.totalLocataire / pricing.nbJours) : Math.round(prixParJour * 1.15))}
            </span>
            <span className="text-[13px] font-semibold text-slate-600">/ jour</span>
          </div>
          {joursMinimum > 1 && (
            <p className="text-[12px] font-semibold text-slate-600 mt-1.5">
              Durée minimum : {joursMinimum} jour{joursMinimum > 1 ? 's' : ''}
            </p>
          )}
        </div>

        <div className="p-5 space-y-4">

          {/* ── Calendar toggle ── */}
          {!calendarOpen ? (
            <button
              type="button"
              onClick={() => setCalendarOpen(true)}
              className="w-full flex items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-200 hover:border-emerald-300 bg-slate-50 hover:bg-emerald-50/50 px-4 py-4 text-[13px] font-bold text-slate-600 hover:text-emerald-700 transition-all duration-200"
            >
              <Clock className="w-4 h-4" strokeWidth={2} />
              {dateDebut && dateFin ? `${dateDebut} → ${dateFin}` : 'Choisir les dates'}
            </button>
          ) : (
            <ReservationCalendar
              vehicleId={vehicleId}
              joursMinimum={joursMinimum}
              dateDebut={dateDebut}
              dateFin={dateFin}
              onDateDebutChange={setDateDebut}
              onDateFinChange={setDateFin}
            />
          )}

          {/* Duration indicator */}
          {nbJours > 0 && (
            <div className={cn(
              'flex items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-[12.5px] font-semibold',
              datesValid
                ? 'bg-slate-50 text-slate-600'
                : 'bg-amber-50 border border-amber-100 text-amber-700',
            )}>
              <Clock className={cn('w-3.5 h-3.5 flex-shrink-0', datesValid ? 'text-slate-400' : 'text-amber-500')} strokeWidth={2} />
              {datesValid
                ? `${nbJours} jour${nbJours > 1 ? 's' : ''} de location`
                : `Minimum ${joursMinimum} jour${joursMinimum > 1 ? 's' : ''} requis`
              }
            </div>
          )}

          {/* Price breakdown — commission masquée, prix tout compris */}
          {pricing && datesValid && (
            <div className="space-y-2 rounded-xl bg-slate-50 p-4">
              <div className="flex justify-between items-center text-[13px]">
                <span className="text-slate-500 font-medium">
                  {formatPrice(Math.round(pricing.totalLocataire / nbJours))} × {nbJours}j
                </span>
                <span className="font-semibold text-slate-700 tabular-nums">
                  {formatPrice(pricing.totalLocataire)}
                </span>
              </div>
              {deliveryFee > 0 && (
                <div className="flex justify-between items-center text-[13px]">
                  <span className="text-slate-500 font-medium flex items-center gap-1">
                    <Truck className="w-3 h-3" strokeWidth={2} />
                    Livraison
                  </span>
                  <span className="font-semibold text-slate-700 tabular-nums">
                    {formatPrice(deliveryFee)}
                  </span>
                </div>
              )}
              <div className="pt-2 border-t border-slate-200 flex justify-between items-center">
                <span className="text-[14px] font-bold text-slate-900">Total</span>
                <span className="text-[18px] font-black text-emerald-600 tabular-nums">
                  {formatPrice(pricing.totalLocataire + deliveryFee)}
                </span>
              </div>
              {loadingPricing && (
                <div className="flex justify-center pt-1">
                  <Loader2 className="w-4 h-4 animate-spin text-emerald-400" />
                </div>
              )}
            </div>
          )}

          {/* Delivery toggle */}
          {deliveryAvailable && (
            <div className="rounded-xl border border-slate-200 p-3.5 space-y-2.5">
              <label className="flex items-start gap-3 cursor-pointer group">
                <button
                  type="button"
                  onClick={() => setWantsDelivery(!wantsDelivery)}
                  className={cn(
                    'mt-0.5 w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-all duration-200',
                    wantsDelivery
                      ? 'bg-emerald-500 border-emerald-500'
                      : 'border-slate-300 group-hover:border-slate-400 bg-white',
                  )}
                >
                  {wantsDelivery && <CheckCircle2 className="w-3.5 h-3.5 text-white" strokeWidth={3} />}
                </button>
                <div>
                  <span className="text-[12.5px] font-semibold text-slate-700 flex items-center gap-1.5">
                    <Truck className="w-3.5 h-3.5 text-emerald-500" strokeWidth={2} />
                    Se faire livrer le véhicule
                  </span>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    + {formatPrice(fraisLivraison)} de frais de livraison
                  </p>
                </div>
              </label>
              {wantsDelivery && (
                <div className="space-y-1.5 pl-8">
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" strokeWidth={2} />
                    <input
                      type="text"
                      value={deliveryAddress}
                      onChange={(e) => setDeliveryAddress(e.target.value)}
                      placeholder="Votre adresse de livraison…"
                      className="w-full h-9 rounded-lg border border-slate-200 bg-white pl-9 pr-3
                        text-[12.5px] font-medium text-slate-800 placeholder-slate-400
                        focus:border-emerald-400/50 focus:outline-none focus:ring-1 focus:ring-emerald-400/20 transition-all"
                    />
                  </div>
                  {wantsDelivery && !deliveryAddress.trim() && (
                    <p className="text-[10.5px] text-amber-600 font-medium">Adresse requise pour la livraison</p>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Contract checkbox */}
          <label className="flex items-start gap-3 cursor-pointer group">
            <button
              type="button"
              onClick={() => setContractAccepted(!contractAccepted)}
              className={cn(
                'mt-0.5 w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-all duration-200',
                contractAccepted
                  ? 'bg-emerald-500 border-emerald-500'
                  : 'border-slate-300 group-hover:border-slate-400 bg-white',
              )}
            >
              {contractAccepted && <CheckCircle2 className="w-3.5 h-3.5 text-white" strokeWidth={3} />}
            </button>
            <span className="text-[12px] leading-relaxed font-medium text-slate-500 group-hover:text-slate-700 transition-colors">
              J&apos;accepte les{' '}
              <a href="#" className="text-emerald-600 underline decoration-dotted underline-offset-2 hover:text-emerald-700">
                conditions de location
              </a>{' '}
              et le{' '}
              <a href="#" className="text-emerald-600 underline decoration-dotted underline-offset-2 hover:text-emerald-700">
                contrat de réservation
              </a>.
            </span>
          </label>

          {/* CTA */}
          <button
            type="button"
            disabled={!canReserve}
            onClick={handleReserve}
            className={cn(
              'w-full flex items-center justify-center gap-2.5 rounded-xl px-5 py-4',
              'text-[14px] font-bold tracking-tight transition-all duration-200',
              canReserve
                ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/25 hover:bg-emerald-600 hover:shadow-xl hover:shadow-emerald-500/35 hover:-translate-y-0.5 active:translate-y-0 active:shadow-md'
                : 'bg-slate-100 text-slate-400 cursor-not-allowed',
            )}
          >
            {loadingPricing
              ? <Loader2 className="w-4 h-4 animate-spin" />
              : <CreditCard className="w-4 h-4" strokeWidth={2} />
            }
            Réserver maintenant
            {!loadingPricing && <ArrowRight className="w-4 h-4" strokeWidth={2.5} />}
          </button>

          {/* Trust note */}
          <p className="flex items-center justify-center gap-1.5 text-[11.5px] text-slate-400 font-medium text-center">
            <Shield className="w-3 h-3 text-slate-300" strokeWidth={2} />
            Aucun débit avant confirmation du propriétaire
          </p>
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
