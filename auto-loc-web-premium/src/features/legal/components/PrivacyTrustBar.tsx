'use client';

import React from 'react';
import { Lock, Shield, Eye, Users, Trash2 } from 'lucide-react';

const TRUST_ITEMS = [
  { icon: Lock, label: 'Données chiffrées' },
  { icon: Shield, label: 'Conforme RGPD' },
  { icon: Eye, label: 'Aucune revente' },
  { icon: Users, label: 'Droits garantis' },
  { icon: Trash2, label: 'Effacement sur demande' },
];

export const PrivacyTrustBar: React.FC = () => {
  return (
    <section className="rounded-2xl border border-brand-main/10 bg-brand-main/[0.03] p-4 sm:p-5">
      <div className="flex flex-wrap gap-2.5">
        {TRUST_ITEMS.map(({ icon: Icon, label }) => (
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
