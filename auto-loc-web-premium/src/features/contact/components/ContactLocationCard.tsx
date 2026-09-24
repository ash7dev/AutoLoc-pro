'use client';

import React from 'react';
import { MapPin, Clock, Navigation } from 'lucide-react';

export const ContactLocationCard: React.FC = () => {
  return (
    <section className="rounded-3xl border border-[#041912]/8 bg-white p-6 sm:p-8 shadow-xs">
      <div className="flex items-start gap-3 mb-5">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#0A3D2E]/8 text-[#0A3D2E]">
          <MapPin className="h-5 w-5" />
        </div>
        <div>
          <h2 className="font-fraunces text-xl font-normal text-[#041912]">
            Notre siège à Dakar
          </h2>
          <p className="mt-0.5 text-[13px] text-slate-500">
            Basés au cœur du Sénégal, nous servons tout le pays.
          </p>
        </div>
      </div>

      {/* Google Maps iframe */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 shadow-xs">
        <iframe
          title="AutoLoc - Dakar, Sénégal"
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d123542.45678!2d-17.4676861!3d14.7167257!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0xec172f5b3c5bb71%3A0xb17c17d92d5be8f0!2sDakar%2C%20S%C3%A9n%C3%A9gal!5e0!3m2!1sfr!2sfr!4v1700000000000!5m2!1sfr!2sfr"
          width="100%"
          height="220"
          style={{ border: 0 }}
          allowFullScreen
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          className="w-full"
        />
      </div>

      {/* Address & Hours */}
      <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="flex items-start gap-3 rounded-xl bg-slate-50 p-4">
          <Navigation className="h-4 w-4 shrink-0 text-[#0A3D2E] mt-0.5" />
          <div>
            <p className="text-[12px] font-bold text-[#0A3D2E] uppercase tracking-wide">Adresse</p>
            <p className="mt-0.5 text-[13px] text-slate-700 font-medium">
              Dakar, Sénégal
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3 rounded-xl bg-slate-50 p-4">
          <Clock className="h-4 w-4 shrink-0 text-[#0A3D2E] mt-0.5" />
          <div>
            <p className="text-[12px] font-bold text-[#0A3D2E] uppercase tracking-wide">Horaires d'assistance</p>
            <p className="mt-0.5 text-[13px] text-slate-700 font-medium">
              7j/7 — de 8h00 à 22h00 (GMT)
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
