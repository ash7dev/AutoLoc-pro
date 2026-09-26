'use client';

import React from 'react';
import { Gauge, Fuel, Users, ShieldCheck, CalendarCheck } from 'lucide-react';
import { FuelType, TransmissionType } from '../types/vehicle.types';

interface VehicleMainSpecsCardProps {
  transmission?: TransmissionType;
  carburant?: FuelType;
  nombrePlaces?: number;
  ageMinimum?: number;
  joursMinimum?: number;
}

export function VehicleMainSpecsCard({
  transmission,
  carburant,
  nombrePlaces = 5,
  ageMinimum = 18,
  joursMinimum = 1,
}: VehicleMainSpecsCardProps) {
  // Groupe 1 : ce que le véhicule est
  const vehicleSpecs = [
    {
      id: 'transmission',
      label: 'Boîte de vitesse',
      value: transmission === 'AUTOMATIQUE' ? 'Automatique' : 'Manuelle',
      icon: Gauge,
    },
    {
      id: 'carburant',
      label: 'Énergie',
      value: carburant
        ? carburant.charAt(0) + carburant.slice(1).toLowerCase()
        : 'Essence',
      icon: Fuel,
    },
    {
      id: 'places',
      label: 'Capacité',
      value: `${nombrePlaces} place${nombrePlaces > 1 ? 's' : ''}`,
      icon: Users,
    },
  ];

  // Groupe 2 : ce que le locataire doit remplir
  const conditions = [
    {
      id: 'age',
      value: `${ageMinimum} ans minimum`,
      icon: ShieldCheck,
    },
    {
      id: 'duree',
      value: `${joursMinimum} jour${joursMinimum > 1 ? 's' : ''} minimum`,
      icon: CalendarCheck,
    },
  ];

  return (
    <section
      aria-label="Caractéristiques clés"
      className="bg-white border border-slate-200/80 rounded-[28px] overflow-hidden shadow-sm"
    >
      <h3 className="px-5 sm:px-6 pt-5 sm:pt-6 pb-4 text-lg text-brand-dark font-fraunces font-normal">
        Caractéristiques clés
      </h3>

      {/* Fiche du véhicule : colonnes séparées par des filets */}
      <div className="grid grid-cols-1 sm:grid-cols-3 border-t border-slate-200/80 divide-y sm:divide-y-0 sm:divide-x divide-slate-200/80">
        {vehicleSpecs.map((spec) => {
          const Icon = spec.icon;
          return (
            <div
              key={spec.id}
              className="flex items-center gap-4 sm:flex-col sm:items-start sm:gap-4 px-5 sm:px-6 py-4 sm:py-5"
            >
              <Icon
                className="w-6 h-6 shrink-0 text-brand-main"
                strokeWidth={1.5}
                aria-hidden="true"
              />
              <div>
                <p className="text-xl leading-tight text-brand-main font-display">
                  {spec.value}
                </p>
                <p className="mt-0.5 text-sm text-slate-500">{spec.label}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Conditions de location : bandeau champagne, distinct de la fiche */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-2.5 sm:gap-8 px-5 sm:px-6 py-4 bg-champagne/35 border-t border-champagne">
        <p className="text-sm font-semibold text-brand-main">
          Conditions de location
        </p>
        <ul className="flex flex-col sm:flex-row gap-2 sm:gap-6">
          {conditions.map((item) => {
            const Icon = item.icon;
            return (
              <li
                key={item.id}
                className="flex items-center gap-2 text-sm text-slate-700"
              >
                <Icon
                  className="w-4 h-4 shrink-0 text-brand-main"
                  strokeWidth={1.75}
                  aria-hidden="true"
                />
                {item.value}
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}