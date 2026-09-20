"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ShieldCheck,
  Phone,
  Mail,
  MapPin,
  Lock,
  CheckCircle2,
} from "lucide-react";

export const Footer: React.FC = () => {
  return (
    <footer className="bg-[#F8FAF4] pt-8 pb-24 lg:pb-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-7xl mx-auto">
        {/* Main Footer Container */}
        <div className="bg-[#041912] border border-[#0A3D2E]/80 rounded-3xl sm:rounded-[36px] p-6 sm:p-10 lg:p-12 shadow-2xl text-slate-300">
          
          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 mb-12">
            
            {/* Brand & Identity Column (5 Cols) */}
            <div className="lg:col-span-4 space-y-6">
              {/* Logo */}
              <Link href="/" className="inline-block group">
                <div className="relative h-11 w-44 transition-transform group-hover:scale-105">
                  <Image
                    src="/logo.png"
                    alt="AutoLoc Premium"
                    fill
                    sizes="176px"
                    className="object-contain object-left brightness-0 invert"
                    priority
                  />
                </div>
              </Link>

              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                N°1 de la location de voiture entre particuliers au Sénégal. Véhicules de prestige &amp; du quotidien vérifiés, assurance tous risques et paiements mobile money instantanés.
              </p>

              {/* Guarantees List */}
              <div className="space-y-2 pt-1 text-xs text-slate-300 font-medium">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Assurance tous risques incluse</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Locataires vérifiés par CNI &amp; Permis (KYC)</span>
                </div>
                <div className="flex items-center gap-2">
                  <Lock className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Paiements Mobile Money 100% sécurisés</span>
                </div>
              </div>

              {/* Contact Info Pill */}
              <div className="p-4 rounded-2xl bg-[#0A3D2E]/60 border border-emerald-500/20 space-y-2 text-xs">
                <p className="font-bold text-[#F1DFB6] uppercase tracking-wider text-[10px]">Support &amp; Assistance Client</p>
                <div className="flex items-center gap-2 text-slate-300">
                  <Phone className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>+221 77 000 00 00 • 7j/7 (8h - 22h)</span>
                </div>
                <div className="flex items-center gap-2 text-slate-300">
                  <Mail className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>support@autoloc.sn</span>
                </div>
                <div className="flex items-center gap-2 text-slate-300">
                  <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>Dakar, Sénégal</span>
                </div>
              </div>
            </div>

            {/* Navigation Grid (8 Cols) */}
            <div className="lg:col-span-8 grid grid-cols-2 sm:grid-cols-3 gap-8 sm:gap-10">
              
              {/* Column 1: NOS SERVICES */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold text-[#F1DFB6] uppercase tracking-widest">
                  Nos Services
                </h4>
                <ul className="space-y-3 text-xs sm:text-sm text-slate-400 font-medium">
                  <li>
                    <Link href="/vehicles" className="hover:text-emerald-400 transition-colors flex items-center gap-1.5">
                      <span>Location à Dakar</span>
                    </Link>
                  </li>
                  <li>
                    <Link href="/vehicles?type=SUV" className="hover:text-emerald-400 transition-colors">
                      SUV &amp; 4x4 Tout-terrain
                    </Link>
                  </li>
                  <li>
                    <Link href="/vehicles?zone=AIBD" className="hover:text-emerald-400 transition-colors">
                      Livraison Aéroport AIBD
                    </Link>
                  </li>
                  <li>
                    <Link href="/vehicles?duration=long" className="hover:text-emerald-400 transition-colors">
                      Locations Longue Durée
                    </Link>
                  </li>
                  <li>
                    <Link href="/how-it-works" className="hover:text-emerald-400 transition-colors">
                      Comment ça marche
                    </Link>
                  </li>
                </ul>
              </div>

              {/* Column 2: ESPACE CLIENT */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold text-[#F1DFB6] uppercase tracking-widest">
                  Espace Client
                </h4>
                <ul className="space-y-3 text-xs sm:text-sm text-slate-400 font-medium">
                  <li>
                    <Link href="/login" className="hover:text-emerald-400 transition-colors">
                      Se connecter
                    </Link>
                  </li>
                  <li>
                    <Link href="/register" className="hover:text-emerald-400 transition-colors">
                      Créer un compte
                    </Link>
                  </li>
                  <li>
                    <Link href="/account/reservations" className="hover:text-emerald-400 transition-colors">
                      Mes Réservations
                    </Link>
                  </li>
                  <li>
                    <Link href="/help" className="hover:text-emerald-400 transition-colors">
                      Centre d'aide &amp; FAQ
                    </Link>
                  </li>
                  <li>
                    <Link href="/contact" className="hover:text-emerald-400 transition-colors">
                      Nous contacter
                    </Link>
                  </li>
                </ul>
              </div>

              {/* Column 3: PROPRIÉTAIRES & LÉGAL */}
              <div className="col-span-2 sm:col-span-1 space-y-4">
                <h4 className="text-xs font-bold text-[#F1DFB6] uppercase tracking-widest">
                  Propriétaires &amp; Légal
                </h4>
                <ul className="space-y-3 text-xs sm:text-sm text-slate-400 font-medium">
                  <li>
                    <Link href="/host" className="hover:text-emerald-400 transition-colors font-bold text-slate-200">
                      Devenir Hôte AutoLoc
                    </Link>
                  </li>
                  <li>
                    <Link href="/insurance" className="hover:text-emerald-400 transition-colors">
                      Assurance &amp; Couverture
                    </Link>
                  </li>
                  <li>
                    <Link href="/privacy" className="hover:text-emerald-400 transition-colors">
                      Politique de confidentialité
                    </Link>
                  </li>
                  <li>
                    <Link href="/terms" className="hover:text-emerald-400 transition-colors">
                      Conditions Générales (CGU)
                    </Link>
                  </li>
                  <li>
                    <Link href="/legal" className="hover:text-emerald-400 transition-colors">
                      Mentions Légales
                    </Link>
                  </li>
                </ul>
              </div>

            </div>

          </div>

          {/* Payment Badges Dedicated Bar */}
          <div className="py-5 px-6 rounded-2xl bg-[#0A3D2E]/70 border border-emerald-500/20 flex flex-col md:flex-row items-center justify-between gap-4 mb-8">
            <div className="flex items-center gap-3 text-xs">
              <Lock className="w-4 h-4 text-emerald-400 shrink-0" />
              <div>
                <span className="font-bold text-white block sm:inline">Paiements 100% sécurisés &amp; cryptés</span>
                <span className="text-slate-400 text-[11px] sm:ml-2">Acompte instantané par Mobile Money ou carte bancaire</span>
              </div>
            </div>

            {/* Accepted Payment Logos */}
            <div className="flex items-center gap-3 shrink-0">
              <div className="flex items-center gap-2 bg-[#041912] border border-emerald-500/30 px-3 py-1.5 rounded-xl">
                <img src="/wave.png" alt="Wave Senegal" title="Wave Senegal" className="w-5 h-5 rounded-full object-cover shrink-0" />
                <span className="text-xs font-bold text-white">Wave</span>
              </div>
              <div className="flex items-center gap-2 bg-[#041912] border border-emerald-500/30 px-3 py-1.5 rounded-xl">
                <img src="/orange_money.jpg" alt="Orange Money" title="Orange Money" className="w-5 h-5 rounded-full object-cover shrink-0" />
                <span className="text-xs font-bold text-white">Orange Money</span>
              </div>
            </div>
          </div>

          {/* Bottom Divider & Copyright */}
          <div className="border-t border-[#0A3D2E] pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400 font-medium text-center sm:text-left">
            <p>© {new Date().getFullYear()} AutoLoc Premium. Tous droits réservés.</p>
            <p className="flex items-center gap-1">
              <span>Conçu pour la mobilité de prestige au Sénégal</span>
              <span className="text-emerald-400">🇸🇳</span>
            </p>
          </div>

        </div>
      </div>
    </footer>
  );
};
