'use client';

import React from 'react';
import { ShieldCheck, Fuel, MapPin, AlertCircle, CheckCircle2 } from 'lucide-react';

interface VehicleConditionsCardProps {
  assurance?: string | null;
  carburantCondition?: string | null;
  zoneConduite?: string | null;
  reglesSpecifiques?: string | null;
}

const DEFAULT_ASSURANCE = 'Assurance tous risques incluse avec assistance 24/7';
const DEFAULT_CARBURANT =
  "Restituer le véhicule avec le même niveau de carburant qu'au départ";
const DEFAULT_ZONE = 'Sénégal uniquement';

export function VehicleConditionsCard({
  assurance = DEFAULT_ASSURANCE,
  carburantCondition = DEFAULT_CARBURANT,
  zoneConduite = DEFAULT_ZONE,
  reglesSpecifiques,
}: VehicleConditionsCardProps) {
  const conditions = [
    {
      id: 'assurance',
      title: 'Assurance et protection',
      desc: assurance || DEFAULT_ASSURANCE,
      icon: ShieldCheck,
      included: true,
    },
    {
      id: 'carburant',
      title: 'Carburant',
      desc: carburantCondition || DEFAULT_CARBURANT,
      icon: Fuel,
      included: false,
    },
    {
      id: 'zone',
      title: 'Zone de conduite',
      desc: zoneConduite || DEFAULT_ZONE,
      icon: MapPin,
      included: false,
    },
  ];

  return (
    <section
      aria-label="Conditions et garanties"
      className="bg-white border border-slate-200/80 rounded-[28px] overflow-hidden shadow-sm"
    >
      <h3 className="px-5 sm:px-6 pt-5 sm:pt-6 pb-4 text-lg text-brand-dark font-fraunces font-normal">
        Conditions et garanties
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-3 border-t border-slate-200/80 divide-y md:divide-y-0 md:divide-x divide-slate-200/80">
        {conditions.map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.id} className="flex flex-col gap-4 px-5 sm:px-6 py-5">
              <div className="flex items-start justify-between gap-3">
                <Icon
                  className="w-6 h-6 shrink-0 text-brand-main"
                  strokeWidth={1.5}
                  aria-hidden="true"
                />
                {item.included && (
                  <span className="inline-flex items-center gap-1.5 text-sm font-medium text-brand-main">
                    <CheckCircle2 className="w-4 h-4" aria-hidden="true" />
                    Inclus
                  </span>
                )}
              </div>

              <div>
                <h4 className="text-base font-semibold text-slate-900">{item.title}</h4>
                <p className="mt-1 text-sm leading-relaxed text-slate-600">{item.desc}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Règles de l'hôte : bandeau distinct, car elles s'ajoutent aux conditions standard */}
      {reglesSpecifiques && (
        <div className="flex items-start gap-3 px-5 sm:px-6 py-4 bg-amber-50/70 border-t border-amber-200/70">
          <AlertCircle
            className="w-5 h-5 mt-0.5 shrink-0 text-amber-700"
            strokeWidth={1.5}
            aria-hidden="true"
          />
          <div>
            <p className="text-sm font-semibold text-amber-900">
              Règles particulières de l'hôte
            </p>
            <p className="mt-0.5 text-sm leading-relaxed text-amber-800">
              {reglesSpecifiques}
            </p>
          </div>
        </div>
      )}
    </section>
  );
}