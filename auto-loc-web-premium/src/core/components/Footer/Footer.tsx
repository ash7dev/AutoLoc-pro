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
    <footer className="bg-[#041912] border-t border-[#F1DFB6]/15 pt-12 pb-28 lg:pb-16 px-4 sm:px-6 lg:px-8 font-sans text-slate-200">
      <div className="max-w-7xl mx-auto">
        {/* Main Footer Container (Vert Forêt Deep Luxury) */}
        <div className="rounded-3xl sm:rounded-[36px] bg-[#0A3D2E]/90 border border-[#F1DFB6]/15 p-6 sm:p-10 lg:p-12 shadow-2xl shadow-black/40 text-slate-200 backdrop-blur-md">
          
          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 mb-10">
            
            {/* Brand & Identity Column (5 Cols) */}
            <div className="lg:col-span-5 space-y-6">
              {/* Logo */}
              <Link href="/" className="inline-block group">
                <div className="relative h-11 w-44 transition-transform group-hover:scale-105">
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

              <h3 className="font-fraunces text-xl font-normal leading-snug text-[#F1DFB6]">
                La mobilité d'exception <span className="italic text-emerald-400 font-normal">au Sénégal</span>.
              </h3>

              <p className="text-xs sm:text-sm text-slate-300/80 leading-relaxed max-w-md">
                Plateforme n°1 de location de voitures et véhicules d'exception au Sénégal (Dakar, Thiès, Saly, AIBD). Réservation sécurisée avec assurance et livraison.
              </p>

              {/* Guarantees List */}
              <div className="space-y-2.5 pt-1 text-xs text-slate-200 font-medium">
                <div className="flex items-center gap-2.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Assurance tous risques &amp; assistance 24/7</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Vérification stricte de l'identité &amp; permis (KYC)</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Lock className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Paiements Mobile Money 100% sécurisés</span>
                </div>
              </div>

              {/* Contact Info Pill */}
              <div className="p-4 rounded-2xl bg-[#041912]/70 border border-[#F1DFB6]/15 space-y-2 text-xs">
                <p className="font-bold text-[#F1DFB6] uppercase tracking-wider text-[10px]">Support &amp; Assistance Client</p>
                <div className="flex items-center gap-2.5 text-slate-300">
                  <Phone className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <a href="tel:+221786637705" className="hover:text-[#F1DFB6] transition-colors font-medium">
                    +221 78 663 77 05 • 7j/7 (8h - 22h)
                  </a>
                </div>
                <div className="flex items-center gap-2.5 text-slate-300">
                  <Mail className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <a href="mailto:support@autoloc.sn" className="hover:text-[#F1DFB6] transition-colors">
                    support@autoloc.sn
                  </a>
                </div>
                <div className="flex items-center gap-2.5 text-slate-300">
                  <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>Dakar, Sénégal</span>
                </div>
              </div>
            </div>

            {/* Navigation Grid (7 Cols) */}
            <div className="lg:col-span-7 grid grid-cols-2 sm:grid-cols-3 gap-8 sm:gap-10 pt-2">
              
              {/* Column 1: EXPLORER */}
              <div className="space-y-4">
                <h4 className="font-fraunces text-base font-normal text-[#F1DFB6] tracking-wide">
                  Explorer
                </h4>
                <ul className="space-y-3 text-xs sm:text-sm text-slate-300/90 font-medium">
                  <li>
                    <Link href="/vehicles" className="hover:text-[#F1DFB6] transition-colors flex items-center gap-1.5">
                      <span>Location à Dakar</span>
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
              <div className="space-y-4">
                <h4 className="font-fraunces text-base font-normal text-[#F1DFB6] tracking-wide">
                  Espace Hôte
                </h4>
                <ul className="space-y-3 text-xs sm:text-sm text-slate-300/90 font-medium">
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
              <div className="col-span-2 sm:col-span-1 space-y-4">
                <h4 className="font-fraunces text-base font-normal text-[#F1DFB6] tracking-wide">
                  Assistance &amp; Légal
                </h4>
                <ul className="space-y-3 text-xs sm:text-sm text-slate-300/90 font-medium">
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
                      Conditions Générales (CGU)
                    </Link>
                  </li>
                  <li>
                    <Link href="/privacy" className="hover:text-[#F1DFB6] transition-colors">
                      Politique de confidentialité
                    </Link>
                  </li>
                </ul>
              </div>

            </div>

          </div>

          {/* Payment Badges Bar */}
          <div className="py-4 px-6 rounded-2xl bg-[#041912]/80 border border-[#F1DFB6]/15 flex flex-col md:flex-row items-center justify-between gap-4 mb-8">
            <div className="flex items-center gap-3 text-xs">
              <Lock className="w-4 h-4 text-emerald-400 shrink-0" />
              <div>
                <span className="font-bold text-white block sm:inline">Paiements 100% sécurisés &amp; cryptés</span>
                <span className="text-slate-400 text-[11px] sm:ml-2">Acompte instantané par Mobile Money (Wave, Orange Money)</span>
              </div>
            </div>

            {/* Accepted Payment Logos */}
            <div className="flex items-center gap-3 shrink-0">
              <div className="flex items-center gap-2 bg-[#0A3D2E] border border-[#F1DFB6]/20 px-3 py-1.5 rounded-xl shadow-2xs">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/wave.png" alt="Wave Sénégal" title="Wave Sénégal" className="w-5 h-5 rounded-full object-cover shrink-0" />
                <span className="text-xs font-bold text-[#F1DFB6]">Wave</span>
              </div>
              <div className="flex items-center gap-2 bg-[#0A3D2E] border border-[#F1DFB6]/20 px-3 py-1.5 rounded-xl shadow-2xs">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/orange_money.jpg" alt="Orange Money" title="Orange Money" className="w-5 h-5 rounded-full object-cover shrink-0" />
                <span className="text-xs font-bold text-[#F1DFB6]">Orange Money</span>
              </div>
            </div>
          </div>

          {/* Bottom Divider & Copyright */}
          <div className="border-t border-[#F1DFB6]/15 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400 font-medium text-center sm:text-left">
            <p suppressHydrationWarning>© {new Date().getFullYear()} AutoLoc. Tous droits réservés.</p>
            <p className="flex items-center gap-1.5 text-slate-300">
              <span>Conçu pour la mobilité d'exception au Sénégal</span>
              <span className="text-emerald-400">🇸🇳</span>
            </p>
          </div>

        </div>
      </div>
    </footer>
  );
};
