'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { BookingCheckoutHeader } from './BookingCheckoutHeader';
import { BookingCheckoutStep1 } from './BookingCheckoutStep1';
import { BookingCheckoutStep2 } from './BookingCheckoutStep2';
import { PaymentMode } from './BookingPaymentModeSelector';
import { PaymentGateway } from './BookingPaymentGatewaySelector';
import { fetchApi } from '@/lib/config';
import { useUserStore } from '@/src/core/store/useUserStore';
import { CheckCircle2, Sparkles, X, ExternalLink, ArrowRight } from 'lucide-react';

export interface BookingCheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
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
  initialStartDate?: string;
  initialEndDate?: string;
  initialHorsDakar?: boolean;
  initialIncludeDelivery?: boolean;
  initialTypeLivraison?: 'AUCUNE' | 'DAKAR' | 'AIBD';
  initialAdresseLivraison?: string;
  onBookingSuccess?: (reservationId: string) => void;
}

export function BookingCheckoutModal({
  isOpen,
  onClose,
  vehicle,
  initialStartDate,
  initialEndDate,
  initialHorsDakar = false,
  initialIncludeDelivery = false,
  initialTypeLivraison,
  initialAdresseLivraison,
  onBookingSuccess,
}: BookingCheckoutModalProps) {
  const router = useRouter();
  const user = useUserStore((state) => state.user);

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [step, setStep] = useState<1 | 2>(1);
  const [startDate, setStartDate] = useState<string | undefined>(initialStartDate);
  const [endDate, setEndDate] = useState<string | undefined>(initialEndDate);
  const [typeLivraison, setTypeLivraison] = useState<'AUCUNE' | 'DAKAR' | 'AIBD'>(
    initialTypeLivraison || (initialIncludeDelivery ? 'DAKAR' : 'AUCUNE')
  );
  const [adresseLivraison, setAdresseLivraison] = useState(initialAdresseLivraison || '');
  const [isHorsDakarSelected, setIsHorsDakarSelected] = useState<boolean>(initialHorsDakar);
  const [isProcessing, setIsProcessing] = useState(false);
  const [successData, setSuccessData] = useState<{ reservationId: string; paymentUrl?: string | null } | null>(null);

  // Initialisation à l'ouverture de la modale
  useEffect(() => {
    if (isOpen) {
      setStep(1);
      setIsProcessing(false);
      setSuccessData(null);

      let startStr = initialStartDate;
      let endStr = initialEndDate;
      const minDays = vehicle.joursMinimum || 1;

      if (!startStr) {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        startStr = tomorrow.toISOString().split('T')[0];
      }

      if (!endStr && startStr) {
        const s = new Date(`${startStr}T00:00:00`);
        s.setDate(s.getDate() + minDays);
        endStr = s.toISOString().split('T')[0];
      }

      setStartDate(startStr);
      setEndDate(endStr);
      setIsHorsDakarSelected(initialHorsDakar);
      setTypeLivraison(initialTypeLivraison || (initialIncludeDelivery ? 'DAKAR' : 'AUCUNE'));
      if (initialAdresseLivraison !== undefined) {
        setAdresseLivraison(initialAdresseLivraison);
      }
    }
  }, [isOpen, initialStartDate, initialEndDate, initialHorsDakar, initialIncludeDelivery, initialTypeLivraison, initialAdresseLivraison, vehicle.joursMinimum]);

  // Remise à zéro du scroll au changement d'étape ou à l'ouverture
  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = 0;
    }
  }, [step, isOpen]);

  // Calcul du nombre de jours
  const nbJours = useMemo(() => {
    if (!startDate || !endDate) return vehicle.joursMinimum || 1;
    const s = new Date(`${startDate}T00:00:00`).getTime();
    const e = new Date(`${endDate}T00:00:00`).getTime();
    const diff = Math.ceil((e - s) / (1000 * 3600 * 24));
    return diff > 0 ? diff : vehicle.joursMinimum || 1;
  }, [startDate, endDate, vehicle.joursMinimum]);

  // Calcul du grand total
  const numTenantPrice = Number(vehicle.tenantPricePerDay) || 0;
  const numSupplementHorsDakar = Number(vehicle.supplementHorsDakarParJour) || 0;

  let deliveryTotal = 0;
  if (typeLivraison === 'DAKAR') {
    deliveryTotal = Number(vehicle.fraisLivraisonDakar ?? vehicle.fraisLivraison ?? 0);
  } else if (typeLivraison === 'AIBD') {
    deliveryTotal = Number(vehicle.fraisLivraisonAibd ?? 0);
  }

  const baseTotal = numTenantPrice * nbJours;
  const horsDakarTotal = isHorsDakarSelected ? numSupplementHorsDakar * nbJours : 0;
  const grandTotal = baseTotal + deliveryTotal + horsDakarTotal;

  if (!isOpen) return null;

  const handleHeaderBack = () => {
    if (step === 2) {
      setStep(1);
    } else {
      onClose();
    }
  };

  const handleDatesChange = (start: string, end?: string) => {
    setStartDate(start);
    const minDays = vehicle.joursMinimum || 1;
    if (start && (!end || end <= start)) {
      const s = new Date(`${start}T00:00:00`);
      s.setDate(s.getDate() + minDays);
      setEndDate(s.toISOString().split('T')[0]);
    } else {
      setEndDate(end);
    }
  };

  const handleSubmitPayment = async (params: {
    paymentMode: PaymentMode;
    paymentGateway: PaymentGateway;
    phoneNumber: string;
  }) => {
    if (!startDate || !endDate) {
      alert('Veuillez sélectionner des dates de réservation valides.');
      return;
    }

    setIsProcessing(true);

    try {
      const phoneClean = params.phoneNumber.replace(/\s+/g, '').replace(/-/g, '');
      const modePaiementStr = params.paymentMode === 'DEPOSIT_30' ? 'ACOMPTE_SOLDE_CHECKIN' : 'TOTAL_EN_LIGNE';

      const payload = {
        vehiculeId: vehicle.id,
        dateDebut: startDate,
        dateFin: endDate,
        fournisseur: params.paymentGateway,
        idempotencyKey: `idemp-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        targetPayment: params.paymentGateway,
        payerPhone: phoneClean,
        modePaiement: modePaiementStr,
        typeLivraison,
        ...(typeLivraison !== 'AUCUNE' ? { adresseLivraison: adresseLivraison.trim() || (typeLivraison === 'AIBD' ? 'Aéroport AIBD' : 'Livraison Dakar') } : {}),
        ...(isHorsDakarSelected ? { horsDakar: true } : {}),
      };

      const response = await fetchApi<{ reservationId: string; paymentUrl?: string | null }>('/reservations', {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      const { reservationId, paymentUrl } = response;
      setIsProcessing(false);

      setSuccessData({ reservationId, paymentUrl });
      if (onBookingSuccess) {
        onBookingSuccess(reservationId);
      }

      if (paymentUrl) {
        // Redirection vers le paiement Mobile Money si URL disponible
        window.location.href = paymentUrl;
      }
    } catch (err: any) {
      setIsProcessing(false);
      const msg = err?.message || 'Impossible d’initier la réservation pour le moment. Veuillez réessayer.';
      alert(`Erreur de réservation : ${msg}`);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 lg:p-6 animate-in fade-in duration-200">

      <div className="relative w-full max-w-5xl bg-slate-50 border border-slate-200 rounded-[28px] sm:rounded-[36px] shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">

        {/* En-tête de la modale */}
        <BookingCheckoutHeader
          step={step}
          title={step === 1 ? 'Récapitulatif de votre réservation' : 'Modalités et paiement Mobile Money'}
          onBack={handleHeaderBack}
          onClose={onClose}
        />

        {/* Écran de Succès si la réservation est créée */}
        {successData ? (
          <div className="p-8 sm:p-12 text-center space-y-6 my-auto">
            <div className="w-16 h-16 rounded-full bg-emerald-100 border-2 border-emerald-500 text-emerald-700 flex items-center justify-center mx-auto shadow-md">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div className="space-y-2 max-w-md mx-auto">
              <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold uppercase tracking-wider">
                Réservation Initiée
              </span>
              <h3 className="text-2xl sm:text-3xl font-display font-bold text-slate-900">
                Demande transmise avec succès !
              </h3>
              <p className="text-sm text-slate-600">
                Votre réservation <strong className="text-slate-900">#{successData.reservationId}</strong> pour {vehicle.marque} {vehicle.modele} est enregistrée.
              </p>
            </div>

            {successData.paymentUrl ? (
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 max-w-md mx-auto text-xs space-y-2">
                <p className="font-semibold">Redirection vers la passerelle de paiement en cours...</p>
                <a
                  href={successData.paymentUrl}
                  className="inline-flex items-center gap-1.5 font-bold text-emerald-900 underline hover:text-emerald-950"
                >
                  <span>Cliquer ici si la redirection ne s'effectue pas automatiquement</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            ) : (
              <div className="p-4 rounded-2xl bg-slate-100 border border-slate-200 text-slate-700 max-w-md mx-auto text-xs">
                Une notification de paiement Mobile Money a été envoyée sur votre téléphone. Veuillez la valider pour finaliser le blocage du véhicule.
              </div>
            )}

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  onClose();
                  router.push(`/reservations/${successData.reservationId}`);
                }}
                className="w-full sm:w-auto py-3.5 px-8 rounded-full bg-[#0A3D2E] text-[#F1DFB6] font-bold text-xs sm:text-sm hover:bg-[#0F4F3B] cursor-pointer transition-all shadow-md flex items-center justify-center gap-2"
              >
                <span>Consulter ma réservation</span>
                <ArrowRight className="w-4 h-4 text-[#F1DFB6]" />
              </button>
            </div>
          </div>
        ) : (
          /* Corps de la modale scrollable */
          <div ref={scrollContainerRef} className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
            {step === 1 && (
              <BookingCheckoutStep1
                vehicle={vehicle}
                startDate={startDate}
                endDate={endDate}
                onDatesChange={handleDatesChange}
                typeLivraison={typeLivraison}
                onSelectTypeLivraison={setTypeLivraison}
                adresseLivraison={adresseLivraison}
                onAdresseLivraisonChange={setAdresseLivraison}
                isHorsDakarSelected={isHorsDakarSelected}
                onToggleHorsDakar={setIsHorsDakarSelected}
                onNext={() => setStep(2)}
              />
            )}

            {step === 2 && (
              <BookingCheckoutStep2
                grandTotal={grandTotal}
                userPhone={user?.telephone || ''}
                onSubmitPayment={handleSubmitPayment}
                isProcessing={isProcessing}
              />
            )}
          </div>
        )}

      </div>

    </div>
  );
}
