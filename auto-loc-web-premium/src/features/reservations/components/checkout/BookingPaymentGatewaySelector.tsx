'use client';

import React from 'react';
import { Smartphone, Check } from 'lucide-react';

export type PaymentGateway = 'WAVE' | 'ORANGE_MONEY';

interface BookingPaymentGatewaySelectorProps {
  selectedGateway: PaymentGateway;
  onSelectGateway: (g: PaymentGateway) => void;
}

export function BookingPaymentGatewaySelector({
  selectedGateway,
  onSelectGateway,
}: BookingPaymentGatewaySelectorProps) {
  const GATEWAYS: { id: PaymentGateway; label: string; sub: string; logo: string }[] = [
    {
      id: 'WAVE',
      label: 'Wave Sénégal',
      sub: 'Paiement sans frais via l’application Wave',
      logo: '/wave.png',
    },
    {
      id: 'ORANGE_MONEY',
      label: 'Orange Money',
      sub: 'Paiement sécurisé via code OTP / OM',
      logo: '/orange_money.jpg',
    },
  ];

  return (
    <div className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-6 space-y-4 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-xl bg-[#0A3D2E] text-[#F1DFB6] flex items-center justify-center shrink-0 shadow-xs">
          <Smartphone className="w-4 h-4" />
        </div>
        <div>
          <h3 className="text-base font-display font-bold text-slate-900">
            Moyen de paiement
          </h3>
          <p className="text-xs text-slate-500">Sélectionnez votre portefeuille Mobile Money</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3">
        {GATEWAYS.map((g) => {
          const isSelected = selectedGateway === g.id;
          return (
            <button
              key={g.id}
              type="button"
              onClick={() => onSelectGateway(g.id)}
              className={`w-full text-left p-4 rounded-2xl border flex items-center gap-3.5 transition-all cursor-pointer ${
                isSelected
                  ? 'border-emerald-600 bg-emerald-50/50 shadow-sm ring-1 ring-emerald-600'
                  : 'border-slate-200 bg-slate-50/50 hover:border-slate-300'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                  isSelected ? 'border-emerald-600 bg-emerald-600' : 'border-slate-300 bg-white'
                }`}
              >
                {isSelected && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
              </div>

              <div className="w-12 h-10 rounded-xl bg-white border border-slate-200 p-1 flex items-center justify-center overflow-hidden shrink-0 shadow-xs">
                <img
                  src={g.logo}
                  alt={g.label}
                  className="w-full h-full object-cover rounded-lg"
                />
              </div>

              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold text-slate-900">{g.label}</p>
                <p className="text-xs text-slate-500">{g.sub}</p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
