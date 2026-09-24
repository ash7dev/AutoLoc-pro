"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  ShieldCheck,
  Phone,
  Mail,
  MapPin,
  Lock,
  CheckCircle2,
} from "lucide-react";

export const Footer: React.FC = () => {
  const pathname = usePathname();
  if (pathname?.startsWith('/dashboard') || pathname?.startsWith('/admin')) {
    return null;
  }
  return (
    <footer className="bg-[#041912] border-t border-[#F1DFB6]/15 pt-8 pb-24 lg:pt-12 lg:pb-16 px-3 sm:px-6 lg:px-8 font-sans text-slate-200">
      <div className="max-w-7xl mx-auto">
        {/* Main Footer Container (Vert Forêt Deep Luxury) */}
        <div className="rounded-2xl sm:rounded-[36px] bg-[#0A3D2E]/90 border border-[#F1DFB6]/15 p-4 sm:p-8 lg:p-12 shadow-2xl shadow-black/40 text-slate-200 backdrop-blur-md">
          
          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-10 lg:gap-12 mb-6 sm:mb-10">
            
            {/* Brand & Identity Column (5 Cols) */}
            <div className="lg:col-span-5 space-y-4 sm:space-y-6">
              {/* Logo & Tagline */}
              <div className="flex flex-col gap-2">
                <Link href="/" className="inline-block group">
                  <div className="relative h-9 w-36 sm:h-11 sm:w-44 transition-transform group-hover:scale-105">
                    <Image
                      src="/logo.png"
                      alt="AutoLoc Sénégal"
                      fill
                      sizes="176px"
                      className="object-contain object-left"
                      priority
                    />
                  </div>
                </Link>

                <h3 className="font-fraunces text-base sm:text-xl font-normal leading-snug text-[#F1DFB6]">
                  La mobilité d'exception <span className="italic text-emerald-400 font-normal">au Sénégal</span>.
                </h3>
              </div>

              <p className="hidden sm:block text-xs sm:text-sm text-slate-300/80 leading-relaxed max-w-md">
                Plateforme n°1 de location de voitures et véhicules d'exception au Sénégal (Dakar, Thiès, Saly, AIBD). Réservation sécurisée avec assurance et livraison.
              </p>

              {/* Guarantees List */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px] sm:text-xs text-slate-200 font-medium">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>Assurance tous risques 24/7</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>Vérification KYC (CNI &amp; Permis)</span>
                </div>
                <div className="flex items-center gap-2">
                  <Lock className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>Paiements Mobile Money sécurisés</span>
                </div>
              </div>

              {/* Contact Info Pill */}
              <div className="p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-[#041912]/70 border border-[#F1DFB6]/15 space-y-1.5 text-xs">
                <p className="font-bold text-[#F1DFB6] uppercase tracking-wider text-[9px] sm:text-[10px]">Support &amp; Assistance Client</p>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-slate-300 text-[11px] sm:text-xs">
                  <div className="flex items-center gap-2">
                    <Phone className="w-3 h-3 text-emerald-400 shrink-0" />
                    <a href="tel:+221786637705" className="hover:text-[#F1DFB6] transition-colors font-medium">
                      +221 78 663 77 05
                    </a>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="w-3 h-3 text-emerald-400 shrink-0" />
                    <a href="mailto:support@autoloc.sn" className="hover:text-[#F1DFB6] transition-colors">
                      support@autoloc.sn
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Navigation Grid (7 Cols) */}
            <div className="lg:col-span-7 grid grid-cols-2 sm:grid-cols-3 gap-5 sm:gap-10 pt-1">
              
              {/* Column 1: EXPLORER */}
              <div className="space-y-2.5 sm:space-y-4">
                <h4 className="font-fraunces text-sm sm:text-base font-normal text-[#F1DFB6] tracking-wide">
                  Explorer
                </h4>
                <ul className="space-y-2 sm:space-y-3 text-xs sm:text-sm text-slate-300/90 font-medium">
                  <li>
                    <Link href="/vehicles" className="hover:text-[#F1DFB6] transition-colors">
                      Location à Dakar
                    </Link>
                  </li>
                  <li>
                    <Link href="/vehicles?type=SUV" className="hover:text-[#F1DFB6] transition-colors">
                      SUV &amp; 4x4 Tout-terrain
                    </Link>
                  </li>
                  <li>
                    <Link href="/vehicles?zone=AIBD" className="hover:text-[#F1DFB6] transition-colors">
                      Livraison Aéroport AIBD
                    </Link>
                  </li>
                  <li>
                    <Link href="/reservations" className="hover:text-[#F1DFB6] transition-colors">
                      Mes Réservations
                    </Link>
                  </li>
                </ul>
              </div>

              {/* Column 2: ESPACE HÔTE */}
              <div className="space-y-2.5 sm:space-y-4">
                <h4 className="font-fraunces text-sm sm:text-base font-normal text-[#F1DFB6] tracking-wide">
                  Espace Hôte
                </h4>
                <ul className="space-y-2 sm:space-y-3 text-xs sm:text-sm text-slate-300/90 font-medium">
                  <li>
                    <Link href="/dashboard" className="hover:text-[#F1DFB6] transition-colors text-[#F1DFB6] font-semibold">
                      Mon Espace Hôte
                    </Link>
                  </li>
                  <li>
                    <Link href="/dashboard/vehicles/new" className="hover:text-[#F1DFB6] transition-colors">
                      Publier une annonce
                    </Link>
                  </li>
                  <li>
                    <Link href="/dashboard/vehicles" className="hover:text-[#F1DFB6] transition-colors">
                      Gérer ma flotte
                    </Link>
                  </li>
                  <li>
                    <Link href="/dashboard/wallet" className="hover:text-[#F1DFB6] transition-colors">
                      Revenus &amp; Portefeuille
                    </Link>
                  </li>
                </ul>
              </div>

              {/* Column 3: ASSISTANCE & LÉGAL */}
              <div className="col-span-2 sm:col-span-1 space-y-2.5 sm:space-y-4">
                <h4 className="font-fraunces text-sm sm:text-base font-normal text-[#F1DFB6] tracking-wide">
                  Assistance &amp; Légal
                </h4>
                <ul className="space-y-2 sm:space-y-3 text-xs sm:text-sm text-slate-300/90 font-medium flex sm:flex-col flex-wrap gap-x-4 gap-y-2">
                  <li>
                    <Link href="/help" className="hover:text-[#F1DFB6] transition-colors">
                      Centre d'aide &amp; FAQ
                    </Link>
                  </li>
                  <li>
                    <Link href="/contact" className="hover:text-[#F1DFB6] transition-colors">
                      Service Client
                    </Link>
                  </li>
                  <li>
                    <Link href="/cgu" className="hover:text-[#F1DFB6] transition-colors">
                      Conditions (CGU)
                    </Link>
                  </li>
                  <li>
                    <Link href="/privacy" className="hover:text-[#F1DFB6] transition-colors">
                      Confidentialité
                    </Link>
                  </li>
                </ul>
              </div>

            </div>

          </div>

          {/* Payment Badges Bar */}
          <div className="py-3 px-4 sm:py-4 sm:px-6 rounded-xl sm:rounded-2xl bg-[#041912]/80 border border-[#F1DFB6]/15 flex flex-row items-center justify-between gap-3 mb-5 sm:mb-8">
            <div className="flex items-center gap-2.5 text-[11px] sm:text-xs">
              <Lock className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <div>
                <span className="font-bold text-white block sm:inline">Paiements 100% sécurisés</span>
                <span className="hidden sm:inline text-slate-400 text-[11px] ml-2">Mobile Money (Wave, Orange Money)</span>
              </div>
            </div>

            {/* Accepted Payment Logos */}
            <div className="flex items-center gap-2 shrink-0">
              <div className="flex items-center gap-1.5 bg-[#0A3D2E] border border-[#F1DFB6]/20 px-2.5 py-1 rounded-lg sm:rounded-xl shadow-2xs">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/wave.png" alt="Wave Sénégal" title="Wave Sénégal" className="w-4 h-4 rounded-full object-cover shrink-0" />
                <span className="text-[11px] sm:text-xs font-bold text-[#F1DFB6]">Wave</span>
              </div>
              <div className="flex items-center gap-1.5 bg-[#0A3D2E] border border-[#F1DFB6]/20 px-2.5 py-1 rounded-lg sm:rounded-xl shadow-2xs">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/orange_money.jpg" alt="Orange Money" title="Orange Money" className="w-4 h-4 rounded-full object-cover shrink-0" />
                <span className="text-[11px] sm:text-xs font-bold text-[#F1DFB6]">Orange</span>
              </div>
            </div>
          </div>

          {/* Bottom Divider & Copyright */}
          <div className="border-t border-[#F1DFB6]/15 pt-4 sm:pt-6 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] sm:text-xs text-slate-400 font-medium text-center sm:text-left">
            <p suppressHydrationWarning>© {new Date().getFullYear()} AutoLoc. Tous droits réservés.</p>
            <p className="flex items-center gap-1.5 text-slate-300">
              <span>Mobilité d'exception au Sénégal</span>
              <span className="text-emerald-400">🇸🇳</span>
            </p>
          </div>

        </div>
      </div>
    </footer>
  );
};
