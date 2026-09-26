'use client';

import React, { useState } from 'react';
import { ShieldCheck, Phone, Check, Lock, Loader2, Sparkles } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { BookingPaymentModeSelector, PaymentMode } from './BookingPaymentModeSelector';
import { BookingPaymentGatewaySelector, PaymentGateway } from './BookingPaymentGatewaySelector';

interface BookingCheckoutStep2Props {
  grandTotal: number;
  userPhone?: string;
  onSubmitPayment: (params: {
    paymentMode: PaymentMode;
    paymentGateway: PaymentGateway;
    phoneNumber: string;
  }) => void;
  isProcessing?: boolean;
}

export function BookingCheckoutStep2({
  grandTotal,
  userPhone = '',
  onSubmitPayment,
  isProcessing = false,
}: BookingCheckoutStep2Props) {
  const [paymentMode, setPaymentMode] = useState<PaymentMode>('DEPOSIT_30');
  const [paymentGateway, setPaymentGateway] = useState<PaymentGateway>('WAVE');
  const [phoneNumber, setPhoneNumber] = useState(userPhone);
  const [hasConsented, setHasConsented] = useState(false);

  const numGrandTotal = Number(grandTotal) || 0;
  const deposit30 = Math.round(numGrandTotal * 0.3);
  const toPayAmount = paymentMode === 'DEPOSIT_30' ? deposit30 : numGrandTotal;

  const getGatewayName = () => {
    switch (paymentGateway) {
      case 'WAVE':
        return 'Wave';
      case 'ORANGE_MONEY':
        return 'Orange Money';
      default:
        return 'Mobile Money';
    }
  };

  const handlePayPress = (e: React.FormEvent) => {
    e.preventDefault();
    if (!hasConsented || !phoneNumber.trim() || isProcessing) return;
    onSubmitPayment({
      paymentMode,
      paymentGateway,
      phoneNumber,
    });
  };

  return (
    <form onSubmit={handlePayPress} className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
        
        {/* Colonne Gauche (col-span-7 sur Desktop) : Modalités & Gateway */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* 1. Sélection de la Modalité d'Acompte (30% vs 100%) */}
          <BookingPaymentModeSelector
            mode={paymentMode}
            onSelectMode={setPaymentMode}
            depositAmount={deposit30}
            fullAmount={numGrandTotal}
          />

          {/* 2. Sélection du Fournisseur Mobile Money (Wave vs Orange Money) */}
          <BookingPaymentGatewaySelector
            selectedGateway={paymentGateway}
            onSelectGateway={setPaymentGateway}
          />

        </div>

        {/* Colonne Droite (col-span-5 sur Desktop) : Numéro Tel, CGU & Validation */}
        <div className="lg:col-span-5 space-y-6">

          {/* 3. Numéro de Téléphone Mobile Money */}
          <div className="bg-white border border-slate-200/90 rounded-3xl p-5 sm:p-6 space-y-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-xl bg-brand-dark border border-emerald-500/30 text-emerald-400 flex items-center justify-center shrink-0 shadow-xs">
                <Phone className="w-3.5 h-3.5 text-emerald-400" />
              </div>
              <div>
                <h4 
                  className="text-base font-fraunces font-normal text-brand-dark tracking-tight"
                >
                  Numéro de téléphone
                </h4>
                <p className="text-xs text-slate-500">Pour valider le push Mobile Money</p>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center rounded-2xl border border-slate-300 bg-slate-50/50 overflow-hidden focus-within:ring-2 focus-within:ring-brand-main focus-within:border-transparent">
                <div className="flex items-center gap-1.5 px-3.5 py-3 bg-slate-100 border-r border-slate-200 text-xs font-bold text-slate-900 shrink-0">
                  <span>🇸🇳</span>
                  <span>+221</span>
                </div>
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="77 000 00 00"
                  required
                  className="w-full px-3.5 py-3 text-sm font-bold text-slate-900 bg-transparent focus:outline-none"
                />
              </div>
              <p className="text-[11px] text-slate-500">
                Le compte {getGatewayName()} associé à ce numéro recevra la demande de confirmation instantanée.
              </p>
            </div>
          </div>

          {/* 4. Carte Récapitulative du Règlement */}
          <div className="bg-brand-main border border-brand-main/80 rounded-3xl p-6 text-champagne space-y-4 shadow-xl">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-champagne" />
              <h4 
                className="text-sm font-fraunces font-normal text-champagne tracking-tight"
              >
                Montant à régler en ligne
              </h4>
            </div>

            <div className="flex items-baseline justify-between pt-1 border-t border-champagne/20">
              <span className="text-xs text-champagne/80 uppercase tracking-wider font-semibold">
                {paymentMode === 'DEPOSIT_30' ? 'Acompte 30%' : 'Totalité 100%'}
              </span>
              <span className="text-3xl font-display font-extrabold text-champagne tabular-nums">
                {formatCurrency(toPayAmount)}
                <span className="ml-1 text-sm font-sans font-normal text-champagne/80">FCFA</span>
              </span>
            </div>

            {paymentMode === 'DEPOSIT_30' && (
              <p className="text-xs text-champagne/75">
                Le solde de {formatCurrency(numGrandTotal - deposit30)} FCFA sera réglé directement au propriétaire lors de la remise du véhicule.
              </p>
            )}
          </div>

          {/* 5. Case à Cocher Consentement CGU */}
          <label className={`flex items-start gap-3 p-4 rounded-2xl border cursor-pointer transition-all ${
            hasConsented
              ? 'border-emerald-600 bg-emerald-50/50'
              : 'border-slate-200 bg-slate-50/50 hover:border-slate-300'
          }`}>
            <input
              type="checkbox"
              checked={hasConsented}
              onChange={(e) => setHasConsented(e.target.checked)}
              className="mt-0.5 w-4 h-4 rounded accent-[#0A3D2E] cursor-pointer"
            />
            <span className="text-xs text-slate-600 leading-relaxed">
              J'accepte les{' '}
              <a href="#" className="font-bold text-emerald-700 underline" onClick={(e) => e.stopPropagation()}>
                Conditions Générales d'Utilisation
              </a>{' '}
              d'AutoLoc ainsi que les conditions du contrat de location du propriétaire.
            </span>
          </label>

          {/* Badge Sécurité SSL */}
          <div className="flex items-center justify-center gap-2 text-xs text-slate-500 py-1">
            <Lock className="w-3.5 h-3.5 text-slate-400" />
            <span>Paiement 100% sécurisé et encadré par AutoLoc Sénégal</span>
          </div>

          {/* Bouton de Paiement CTA */}
          <button
            type="submit"
            disabled={!hasConsented || !phoneNumber.trim() || isProcessing}
            className="w-full py-4 px-6 rounded-full bg-brand-main hover:bg-forest-700 active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed text-champagne font-bold text-base flex items-center justify-center gap-2 cursor-pointer transition-all shadow-md"
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-5 h-5 text-champagne animate-spin" />
                <span>Validation en cours...</span>
              </>
            ) : (
              <>
                <ShieldCheck className="w-5 h-5 text-champagne" />
                <span>
                  Payer {formatCurrency(toPayAmount)} FCFA avec {getGatewayName()}
                </span>
              </>
            )}
          </button>

        </div>

      </div>
    </form>
  );
}
