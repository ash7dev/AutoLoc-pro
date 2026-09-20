"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { ShieldCheck } from "lucide-react";

export const Footer: React.FC = () => {
  return (
    <footer className="bg-[#F8FAF4] pt-8 pb-24 lg:pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto bg-[#F4F0E6] border border-[#0A3D2E]/10 rounded-3xl sm:rounded-[36px] p-6 sm:p-10 lg:p-12 shadow-sm text-slate-700">
        
        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 mb-10 sm:mb-12">
          
          {/* Brand Left Column */}
          <div className="lg:col-span-5 flex flex-col justify-between">
            <div>
              {/* Logo */}
              <Link href="/" className="inline-block mb-4 group">
                <div className="relative h-10 w-36 sm:h-11 sm:w-40 transition-transform group-hover:scale-105">
                  <Image
                    src="/logo.png"
                    alt="AutoLoc"
                    fill
                    sizes="160px"
                    className="object-contain object-left"
                    priority
                  />
                </div>
              </Link>

              {/* Description */}
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-sm mb-6">
                N°1 de la location de voiture entre particuliers au Sénégal. Véhicules vérifiés, assurance tous risques incluse et paiement instantané sécurisé.
              </p>

              {/* Guarantee Pill */}
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/80 border border-[#0A3D2E]/10 text-[#0A3D2E] text-xs font-semibold shadow-2xs">
                <ShieldCheck className="w-4 h-4 text-emerald-700" />
                <span>Réservations 100% Sécurisées & Assurées</span>
              </div>
            </div>
          </div>

          {/* Links Navigation Right Columns */}
          <div className="lg:col-span-7 grid grid-cols-2 sm:grid-cols-3 gap-8">
            
            {/* Column 1: PRODUIT / SERVICES */}
            <div>
              <h3 className="text-xs font-bold text-[#0A3D2E] uppercase tracking-wider mb-4">
                Services
              </h3>
              <ul className="space-y-2.5 text-xs sm:text-sm text-slate-600 font-medium">
                <li>
                  <Link href="/how-it-works" className="hover:text-[#0A3D2E] transition-colors">
                    Comment ça marche
                  </Link>
                </li>
                <li>
                  <Link href="/vehicles" className="hover:text-[#0A3D2E] transition-colors">
                    Louer à Dakar
                  </Link>
                </li>
                <li>
                  <Link href="/vehicles?zone=AIBD" className="hover:text-[#0A3D2E] transition-colors">
                    Livraison AIBD
                  </Link>
                </li>
                <li>
                  <Link href="/host" className="hover:text-[#0A3D2E] transition-colors">
                    Proposer mon véhicule
                  </Link>
                </li>
              </ul>
            </div>

            {/* Column 2: VOTRE ESPACE */}
            <div>
              <h3 className="text-xs font-bold text-[#0A3D2E] uppercase tracking-wider mb-4">
                Votre Espace
              </h3>
              <ul className="space-y-2.5 text-xs sm:text-sm text-slate-600 font-medium">
                <li>
                  <Link href="/register" className="hover:text-[#0A3D2E] transition-colors">
                    Créer un compte
                  </Link>
                </li>
                <li>
                  <Link href="/login" className="hover:text-[#0A3D2E] transition-colors">
                    Connexion
                  </Link>
                </li>
                <li>
                  <Link href="/account/reservations" className="hover:text-[#0A3D2E] transition-colors">
                    Suivre une réservation
                  </Link>
                </li>
                <li>
                  <Link href="/help" className="hover:text-[#0A3D2E] transition-colors">
                    Centre d'aide & FAQ
                  </Link>
                </li>
                <li>
                  <Link href="/forgot-password" className="hover:text-[#0A3D2E] transition-colors">
                    Mot de passe oublié
                  </Link>
                </li>
              </ul>
            </div>

            {/* Column 3: LÉGAL */}
            <div className="col-span-2 sm:col-span-1">
              <h3 className="text-xs font-bold text-[#0A3D2E] uppercase tracking-wider mb-4">
                Légal
              </h3>
              <ul className="space-y-2.5 text-xs sm:text-sm text-slate-600 font-medium">
                <li>
                  <Link href="/privacy" className="hover:text-[#0A3D2E] transition-colors">
                    Confidentialité
                  </Link>
                </li>
                <li>
                  <Link href="/terms" className="hover:text-[#0A3D2E] transition-colors">
                    Conditions d'utilisation
                  </Link>
                </li>
                <li>
                  <Link href="/insurance" className="hover:text-[#0A3D2E] transition-colors">
                    Assurance & Couverture
                  </Link>
                </li>
                <li>
                  <Link href="/legal" className="hover:text-[#0A3D2E] transition-colors">
                    Mentions légales
                  </Link>
                </li>
              </ul>
            </div>

          </div>
        </div>

        {/* Bottom Divider & Credits */}
        <div className="border-t border-[#0A3D2E]/10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 font-medium">
          <p>© {new Date().getFullYear()} AutoLoc. Tous droits réservés.</p>
          <p>Fait pour la mobilité moderne au Sénégal</p>
        </div>

      </div>
    </footer>
  );
};
