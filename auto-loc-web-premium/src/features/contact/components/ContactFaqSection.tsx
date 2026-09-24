'use client';

import React, { useState } from 'react';
import { ChevronDown, ChevronUp, HelpCircle } from 'lucide-react';

const FAQ_ITEMS = [
  {
    question: "Comment réserver un véhicule sur AutoLoc ?",
    answer:
      "Recherchez un véhicule disponible dans notre catalogue, sélectionnez vos dates de location, puis confirmez votre réservation en payant l\u2019acompte par Wave ou Orange Money. Vous recevrez une confirmation instantanée par e-mail et SMS.",
  },
  {
    question: "Quels documents sont nécessaires pour louer ?",
    answer:
      "Pour réserver, vous devez fournir une pièce d\u2019identité valide (CNI ou passeport) et un permis de conduire en cours de validité. Ces documents sont vérifiés lors du processus KYC (Know Your Customer) pour la sécurité de tous.",
  },
  {
    question: "L\u2019assurance est-elle incluse dans le prix ?",
    answer:
      "Oui, tous les véhicules sur AutoLoc bénéficient d\u2019une assurance tous risques incluse dans le tarif affiché. Aucun frais caché ni supplément d\u2019assurance à prévoir.",
  },
  {
    question: "Quels sont les modes de paiement acceptés ?",
    answer:
      "Nous acceptons les paiements par Wave et Orange Money pour un règlement instantané et 100% sécurisé. Le paiement par carte bancaire est également disponible pour les paiements internationaux.",
  },
  {
    question: "Puis-je annuler une réservation ?",
    answer:
      "Oui, les annulations sont possibles selon les conditions du propriétaire. Une annulation gratuite est généralement proposée jusqu\u2019à 48h avant la prise en charge. Au-delà, des frais peuvent s\u2019appliquer selon la politique du véhicule.",
  },
  {
    question: "Comment devenir propriétaire hôte sur AutoLoc ?",
    answer:
      "Créez un compte AutoLoc, basculez en mode propriétaire depuis votre profil, puis ajoutez votre véhicule avec les photos et documents requis (carte grise, assurance, contrôle technique). Notre équipe validera votre annonce sous 24h.",
  },
];

export const ContactFaqSection: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="rounded-3xl border border-[#041912]/8 bg-white p-6 sm:p-8 shadow-xs">
      <div className="mb-6 flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#0A3D2E]/8 text-[#0A3D2E]">
          <HelpCircle className="h-5 w-5" />
        </div>
        <div>
          <h2 className="font-fraunces text-2xl font-normal text-[#041912] sm:text-3xl">
            Questions fréquentes
          </h2>
          <p className="mt-1 text-sm text-slate-500 font-medium">
            Les réponses aux questions les plus courantes de nos membres.
          </p>
        </div>
      </div>

      <div className="divide-y divide-slate-100">
        {FAQ_ITEMS.map((item, index) => {
          const isOpen = openIndex === index;
          return (
            <div key={index} className="py-4 first:pt-0 last:pb-0">
              <button
                type="button"
                onClick={() => toggle(index)}
                className="flex w-full items-center justify-between gap-4 text-left cursor-pointer group"
              >
                <h3 className="text-[14px] font-semibold text-[#041912] group-hover:text-[#0A3D2E] transition-colors">
                  {item.question}
                </h3>
                <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg transition-colors ${isOpen ? 'bg-[#0A3D2E] text-[#F1DFB6]' : 'bg-slate-100 text-slate-500'}`}>
                  {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </div>
              </button>
              {isOpen && (
                <p className="mt-2.5 text-[13px] leading-relaxed text-slate-500 pr-10 animate-in fade-in slide-in-from-top-1 duration-200">
                  {item.answer}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
};
