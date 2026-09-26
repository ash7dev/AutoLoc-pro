'use client';

import React from 'react';
import { Shield, Car, Scale, Gavel, Lock } from 'lucide-react';

const GUARANTEES = [
  { icon: Shield, label: 'Locataire protégé' },
  { icon: Car, label: 'Véhicule assuré obligatoire' },
  { icon: Scale, label: 'Médiation incluse' },
  { icon: Gavel, label: 'Droit sénégalais applicable' },
  { icon: Lock, label: 'Données RGPD-conformes' },
];

export const CguGuaranteesBar: React.FC = () => {
  return (
    <section className="rounded-2xl border border-brand-main/10 bg-brand-main/[0.03] p-4 sm:p-5">
      <div className="flex flex-wrap gap-2.5">
        {GUARANTEES.map(({ icon: Icon, label }) => (
          <span
            key={label}
            className="inline-flex items-center gap-1.5 rounded-full bg-white border border-brand-main/10 px-3.5 py-2 shadow-xs"
          >
            <Icon className="h-3.5 w-3.5 text-brand-main" strokeWidth={2} />
            <span className="text-[11.5px] font-semibold text-brand-dark">{label}</span>
          </span>
        ))}
      </div>
    </section>
  );
};
