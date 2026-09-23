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
    <footer className="bg-white border-t border-slate-200/80 pt-10 pb-28 lg:pb-16 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-7xl mx-auto">
        {/* Main Footer Container (Blanc / Light Luxury) */}
        <div className="bg-white border border-slate-200/80 rounded-3xl sm:rounded-[36px] p-6 sm:p-10 lg:p-12 shadow-xl shadow-slate-200/50 text-slate-700">
          
          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 mb-12">
            
            {/* Brand & Identity Column (5 Cols) */}
            <div className="lg:col-span-4 space-y-6">
              {/* Logo */}
              <Link href="/" className="inline-block group">
                <div className="relative h-11 w-44 transition-transform group-hover:scale-105">
                  <Image
                    src="/logo.png"
                    alt="AutoLoc"
                    fill
                    sizes="176px"
                    className="object-contain object-left"
                    priority
                  />
                </div>
              </Link>

              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                N°1 de la location de voiture entre particuliers au Sénégal. Véhicules de prestige &amp; du quotidien vérifiés, assurance tous risques et paiements mobile money instantanés.
              </p>

              {/* Guarantees List */}
              <div className="space-y-2 pt-1 text-xs text-slate-700 font-medium">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Assurance tous risques incluse</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Locataires vérifiés par CNI &amp; Permis (KYC)</span>
                </div>
                <div className="flex items-center gap-2">
                  <Lock className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Paiements Mobile Money 100% sécurisés</span>
                </div>
              </div>

              {/* Contact Info Pill */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2 text-xs">
                <p className="font-bold text-[#0A3D2E] uppercase tracking-wider text-[10px]">Support &amp; Assistance Client</p>
                <div className="flex items-center gap-2 text-slate-600">
                  <Phone className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>+221 77 000 00 00 • 7j/7 (8h - 22h)</span>
                </div>
                <div className="flex items-center gap-2 text-slate-600">
                  <Mail className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>support@autoloc.sn</span>
                </div>
                <div className="flex items-center gap-2 text-slate-600">
                  <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Dakar, Sénégal</span>
                </div>
              </div>
            </div>

            {/* Navigation Grid (8 Cols) */}
            <div className="lg:col-span-8 grid grid-cols-2 sm:grid-cols-3 gap-8 sm:gap-10">
              
              {/* Column 1: NOS SERVICES */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold text-[#0A3D2E] uppercase tracking-widest">
                  Nos Services
                </h4>
                <ul className="space-y-3 text-xs sm:text-sm text-slate-600 font-medium">
                  <li>
                    <Link href="/vehicles" className="hover:text-[#0A3D2E] transition-colors flex items-center gap-1.5">
                      <span>Location à Dakar</span>
                    </Link>
                  </li>
                  <li>
                    <Link href="/vehicles?type=SUV" className="hover:text-[#0A3D2E] transition-colors">
                      SUV &amp; 4x4 Tout-terrain
                    </Link>
                  </li>
                  <li>
                    <Link href="/vehicles?zone=AIBD" className="hover:text-[#0A3D2E] transition-colors">
                      Livraison Aéroport AIBD
                    </Link>
                  </li>
                  <li>
                    <Link href="/vehicles?duration=long" className="hover:text-[#0A3D2E] transition-colors">
                      Locations Longue Durée
                    </Link>
                  </li>
                  <li>
                    <Link href="/how-it-works" className="hover:text-[#0A3D2E] transition-colors">
                      Comment ça marche
                    </Link>
                  </li>
                </ul>
              </div>

              {/* Column 2: ESPACE CLIENT */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold text-[#0A3D2E] uppercase tracking-widest">
                  Espace Client
                </h4>
                <ul className="space-y-3 text-xs sm:text-sm text-slate-600 font-medium">
                  <li>
                    <Link href="/login" className="hover:text-[#0A3D2E] transition-colors">
                      Se connecter
                    </Link>
                  </li>
                  <li>
                    <Link href="/register" className="hover:text-[#0A3D2E] transition-colors">
                      Créer un compte
                    </Link>
                  </li>
                  <li>
                    <Link href="/account/reservations" className="hover:text-[#0A3D2E] transition-colors">
                      Mes Réservations
                    </Link>
                  </li>
                  <li>
                    <Link href="/help" className="hover:text-[#0A3D2E] transition-colors">
                      Centre d'aide &amp; FAQ
                    </Link>
                  </li>
                  <li>
                    <Link href="/contact" className="hover:text-[#0A3D2E] transition-colors">
                      Nous contacter
                    </Link>
                  </li>
                </ul>
              </div>

              {/* Column 3: PROPRIÉTAIRES & LÉGAL */}
              <div className="col-span-2 sm:col-span-1 space-y-4">
                <h4 className="text-xs font-bold text-[#0A3D2E] uppercase tracking-widest">
                  Propriétaires &amp; Légal
                </h4>
                <ul className="space-y-3 text-xs sm:text-sm text-slate-600 font-medium">
                  <li>
                    <Link href="/host" className="hover:text-[#0A3D2E] transition-colors font-bold text-slate-900">
                      Devenir Hôte AutoLoc
                    </Link>
                  </li>
                  <li>
                    <Link href="/insurance" className="hover:text-[#0A3D2E] transition-colors">
                      Assurance &amp; Couverture
                    </Link>
                  </li>
                  <li>
                    <Link href="/privacy" className="hover:text-[#0A3D2E] transition-colors">
                      Politique de confidentialité
                    </Link>
                  </li>
                  <li>
                    <Link href="/terms" className="hover:text-[#0A3D2E] transition-colors">
                      Conditions Générales (CGU)
                    </Link>
                  </li>
                  <li>
                    <Link href="/legal" className="hover:text-[#0A3D2E] transition-colors">
                      Mentions Légales
                    </Link>
                  </li>
                </ul>
              </div>

            </div>

          </div>

          {/* Payment Badges Dedicated Bar */}
          <div className="py-5 px-6 rounded-2xl bg-slate-50 border border-slate-200/80 flex flex-col md:flex-row items-center justify-between gap-4 mb-8">
            <div className="flex items-center gap-3 text-xs">
              <Lock className="w-4 h-4 text-emerald-600 shrink-0" />
              <div>
                <span className="font-bold text-slate-900 block sm:inline">Paiements 100% sécurisés &amp; cryptés</span>
                <span className="text-slate-500 text-[11px] sm:ml-2">Acompte instantané par Mobile Money ou carte bancaire</span>
              </div>
            </div>

            {/* Accepted Payment Logos */}
            <div className="flex items-center gap-3 shrink-0">
              <div className="flex items-center gap-2 bg-white border border-slate-200 px-3 py-1.5 rounded-xl shadow-2xs">
                <img src="/wave.png" alt="Wave Senegal" title="Wave Senegal" className="w-5 h-5 rounded-full object-cover shrink-0" />
                <span className="text-xs font-bold text-slate-800">Wave</span>
              </div>
              <div className="flex items-center gap-2 bg-white border border-slate-200 px-3 py-1.5 rounded-xl shadow-2xs">
                <img src="/orange_money.jpg" alt="Orange Money" title="Orange Money" className="w-5 h-5 rounded-full object-cover shrink-0" />
                <span className="text-xs font-bold text-slate-800">Orange Money</span>
              </div>
            </div>
          </div>

          {/* Bottom Divider & Copyright */}
          <div className="border-t border-slate-200/80 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 font-medium text-center sm:text-left">
            <p>© {new Date().getFullYear()} AutoLoc. Tous droits réservés.</p>
            <p className="flex items-center gap-1">
              <span>Conçu pour la mobilité de prestige au Sénégal</span>
              <span className="text-emerald-600">🇸🇳</span>
            </p>
          </div>

        </div>
      </div>
    </footer>
  );
};
