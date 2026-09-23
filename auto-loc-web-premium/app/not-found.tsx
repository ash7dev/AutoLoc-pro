import React from 'react';
import Link from 'next/link';
import { Metadata } from 'next';
import { Wrench, Home, Car, PhoneCall, ShieldAlert } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Page en Maintenance — AutoLoc',
  description: 'Cette page est actuellement en cours de maintenance sur AutoLoc.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function NotFound() {
  return (
    <div className="min-h-[85vh] bg-[#F8FAF4] flex items-center justify-center px-4 py-16 sm:py-24">
      <div className="max-w-xl w-full text-center space-y-8 animate-in fade-in zoom-in-95 duration-300">
        
        {/* Animated Maintenance Icon Card */}
        <div className="relative inline-flex items-center justify-center w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-white border border-slate-200/90 shadow-xl shadow-slate-200/60 mx-auto">
          <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500/20 via-teal-500/20 to-emerald-500/20 rounded-[28px] blur-md -z-10 animate-pulse" />
          <Wrench className="w-10 h-10 sm:w-12 sm:h-12 text-[#0A3D2E] stroke-[1.8]" />
        </div>

        {/* Title & Description Container */}
        <div className="space-y-4 bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 shadow-sm">
          {/* Badge Maintenance */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200/80 text-[#0A3D2E] text-xs font-bold uppercase tracking-wider">
            <ShieldAlert className="w-4 h-4 text-emerald-600" />
            <span>Page en Maintenance</span>
          </div>

          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-normal text-[#041912] font-display tracking-tight pt-1">
            Page temporairement indisponible
          </h1>

          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-md mx-auto">
            Cette section est actuellement en cours de mise à jour ou de maintenance programmée afin de vous offrir une meilleure expérience de location.
          </p>

          {/* Action Buttons */}
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full bg-[#0A3D2E] hover:bg-[#0F4F3B] text-[#F1DFB6] font-bold text-xs tracking-wider shadow-md shadow-[#0A3D2E]/20 transition-all active:scale-[0.98]"
            >
              <Home className="w-4 h-4 text-[#F1DFB6]" />
              <span>Retour à l'accueil</span>
            </Link>

            <Link
              href="/vehicles"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 font-bold text-xs tracking-wider shadow-xs transition-all active:scale-[0.98]"
            >
              <Car className="w-4 h-4 text-emerald-600" />
              <span>Voir les véhicules</span>
            </Link>
          </div>
        </div>

        {/* Assistance / Support Footer */}
        <div className="inline-flex items-center justify-center gap-2 text-xs text-slate-500 font-medium">
          <PhoneCall className="w-3.5 h-3.5 text-emerald-600" />
          <span>Une question ? Contactez notre support 7j/7 au</span>
          <a
            href="tel:+221786637705"
            className="font-bold text-[#0A3D2E] hover:underline"
          >
            +221 78 663 77 05
          </a>
        </div>

      </div>
    </div>
  );
}
