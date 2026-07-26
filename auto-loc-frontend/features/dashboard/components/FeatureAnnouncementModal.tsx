'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import {
  Sparkles, X, ArrowRight, CheckCircle2, Zap, Smartphone, Image as ImageIcon
} from 'lucide-react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const LOCAL_STORAGE_KEY = 'autoloc_seen_story_share_feature_v1';

/* ── Custom Brand SVG Icons ── */

function WhatsAppIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12.012 2c-5.506 0-9.989 4.478-9.99 9.984 0 1.763.459 3.486 1.332 5.006l-1.417 5.176 5.297-1.389c1.468.801 3.129 1.223 4.774 1.224h.004c5.505 0 9.988-4.478 9.989-9.985 0-2.668-1.038-5.176-2.925-7.062a9.924 9.924 0 0 0-7.064-2.954zm.004 18.33h-.003c-1.493 0-2.959-.401-4.238-1.159l-.304-.18-3.149.825.84-3.068-.198-.315c-.833-1.325-1.273-2.862-1.273-4.442.001-4.604 3.748-8.349 8.353-8.349 2.23 0 4.327.869 5.904 2.447 1.576 1.578 2.444 3.676 2.443 5.906 0 4.605-3.748 8.353-8.344 8.353z" />
    </svg>
  );
}

function InstagramIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
    </svg>
  );
}

function SnapchatIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12.035 1.5c-4.148 0-6.94 2.871-6.94 6.793 0 1.344.42 2.68 1.096 3.633.24.336.27.464.12.784-.16.326-.49.886-1.12 1.636-.36.425-.6.671-.97.77-.38.101-.84-.047-1.45-.443-.19-.125-.37-.206-.52-.206-.27 0-.46.223-.46.541 0 .61.7 1.357 1.83 1.957.94.498 1.94.57 2.45.57.29 0 .5-.05.71-.16.31-.16.48-.15.7.07.45.449.97 1.428 2.05 2.058 1.06.621 1.95.82 2.51.82.55 0 1.45-.199 2.51-.82 1.08-.63 1.6-1.609 2.05-2.058.22-.22.39-.23.7-.07.21.11.42.16.71.16.51 0 1.51-.072 2.45-.57 1.13-.6 1.83-1.347 1.83-1.957 0-.318-.19-.541-.46-.541-.15 0-.33.081-.52.206-.61.396-1.07.544-1.45.443-.37-.099-.61-.345-.97-.77-.63-.75-1.01-1.31-1.12-1.636-.15-.32-.12-.448.12-.784.67-.953 1.09-2.289 1.09-3.633 0-3.922-2.79-6.793-6.94-6.793z" />
    </svg>
  );
}

export function FeatureAnnouncementModal() {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (typeof window === 'undefined') return;

    try {
      const hasSeen = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (!hasSeen) {
        const timer = setTimeout(() => {
          setOpen(true);
        }, 700);
        return () => clearTimeout(timer);
      }
    } catch (e) {
      console.warn('localStorage read error:', e);
    }
  }, []);

  const handleClose = () => {
    setOpen(false);
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, 'true');
    } catch (e) {
      console.warn('localStorage write error:', e);
    }
  };

  const handleTryNow = () => {
    handleClose();
    if (!pathname.startsWith('/dashboard/owner/vehicles')) {
      router.push('/dashboard/owner/vehicles');
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) handleClose(); }}>
      <DialogContent className="max-w-lg w-[95vw] rounded-[2.5rem] p-0 border border-emerald-500/40 bg-[#070c14] text-white shadow-[0_0_60px_rgba(16,185,129,0.25)] overflow-hidden">
        
        {/* ── Top Hero Card ────────────────────────────────────── */}
        <div className="relative overflow-hidden bg-gradient-to-br from-slate-950 via-[#06241a] to-[#02100b] p-7 flex flex-col justify-between border-b border-emerald-500/20">
          
          {/* Glowing Orbs */}
          <div className="absolute -top-16 -right-16 w-56 h-56 rounded-full bg-emerald-400/20 blur-3xl pointer-events-none animate-pulse" />
          <div className="absolute -bottom-16 -left-16 w-48 h-48 rounded-full bg-teal-400/15 blur-3xl pointer-events-none" />

          {/* Close button */}
          <button
            onClick={handleClose}
            className="absolute top-5 right-5 z-20 w-9 h-9 rounded-full bg-black/50 hover:bg-black/80 border border-white/10 backdrop-blur-xl flex items-center justify-center text-slate-400 hover:text-white transition-all active:scale-90"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Header Badge */}
          <div className="flex items-center gap-2 mb-4">
            <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/15 border border-emerald-400/40 backdrop-blur-md shadow-lg shadow-emerald-500/10">
              <Sparkles className="w-4 h-4 text-emerald-400 animate-spin" style={{ animationDuration: '8s' }} />
              <span className="text-[11px] font-black uppercase tracking-widest text-emerald-300">
                Nouveauté Exclusive
              </span>
            </span>
          </div>

          {/* Title */}
          <div className="space-y-2">
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight leading-tight">
              Boostez vos réservations avec les <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-400">Stories Social Media</span> 🚀
            </h2>
            <p className="text-xs text-slate-300 font-medium leading-relaxed max-w-md">
              Générez en 1 clic des visuels HD pré-formatés 9:16 pour publier directement sur vos réseaux favoris.
            </p>
          </div>

          {/* Social Platform Badges */}
          <div className="flex items-center gap-3 mt-5 pt-4 border-t border-white/10">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/20 border border-emerald-400/30 text-emerald-400 text-xs font-bold shadow-sm">
              <WhatsAppIcon className="w-4 h-4" />
              WhatsApp
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-pink-400/30 text-pink-300 text-xs font-bold shadow-sm">
              <InstagramIcon className="w-4 h-4" />
              Instagram
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-400/20 border border-amber-400/30 text-amber-300 text-xs font-bold shadow-sm">
              <SnapchatIcon className="w-4 h-4" />
              Snapchat
            </div>
          </div>
        </div>

        {/* ── Modal Body & Feature Cards ───────────────────────── */}
        <div className="p-6 space-y-5 bg-[#070c14]">

          {/* Feature Highlights Grid */}
          <div className="grid grid-cols-1 gap-3">
            
            {/* Card 1: WhatsApp Direct */}
            <div className="group flex items-start gap-4 p-4 rounded-2xl bg-white/[0.03] border border-white/10 hover:border-emerald-500/40 hover:bg-white/[0.05] transition-all duration-300 shadow-sm">
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center shrink-0 text-emerald-400 group-hover:scale-110 transition-transform">
                <WhatsAppIcon className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-black text-white tracking-wide">Statuts & Messages WhatsApp</h4>
                  <span className="text-[9px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md">Instant</span>
                </div>
                <p className="text-[11.5px] text-slate-400 font-medium leading-normal mt-1">
                  Envoyez votre annonce directement à vos contacts avec un texte accrocheur pré-rempli et le lien officiel AutoLoc.
                </p>
              </div>
            </div>

            {/* Card 2: Story Canvas 9:16 */}
            <div className="group flex items-start gap-4 p-4 rounded-2xl bg-white/[0.03] border border-white/10 hover:border-emerald-500/40 hover:bg-white/[0.05] transition-all duration-300 shadow-sm">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-pink-500/20 to-purple-500/20 border border-pink-400/30 flex items-center justify-center shrink-0 text-pink-400 group-hover:scale-110 transition-transform">
                <Smartphone className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-black text-white tracking-wide">Générateur d&apos;Image Story 9:16 HD</h4>
                  <span className="text-[9px] font-bold text-purple-300 bg-purple-500/10 px-2 py-0.5 rounded-md">Format 1080×1920</span>
                </div>
                <p className="text-[11.5px] text-slate-400 font-medium leading-normal mt-1">
                  Créez des visuels de qualité professionnelle avec la photo de votre voiture, votre tarif en FCFA, et le badge certifié.
                </p>
              </div>
            </div>

            {/* Card 3: Punchlines */}
            <div className="group flex items-start gap-4 p-4 rounded-2xl bg-white/[0.03] border border-white/10 hover:border-emerald-500/40 hover:bg-white/[0.05] transition-all duration-300 shadow-sm">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-400/30 flex items-center justify-center shrink-0 text-amber-400 group-hover:scale-110 transition-transform">
                <Zap className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-black text-white tracking-wide">Catalogue de Punchlines Marketing</h4>
                  <span className="text-[9px] font-bold text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded-md">Au choix</span>
                </div>
                <p className="text-[11.5px] text-slate-400 font-medium leading-normal mt-1">
                  Sélectionnez la phrase d&apos;accroche la plus percutante ou rédigez votre propre message personnalisé.
                </p>
              </div>
            </div>

          </div>

          {/* ── Action Buttons ──────────────────────────────────── */}
          <div className="space-y-2.5 pt-2">
            <Button
              onClick={handleTryNow}
              className="w-full h-13 rounded-2xl bg-gradient-to-r from-emerald-400 via-teal-400 to-emerald-500 hover:from-emerald-300 hover:to-teal-300 text-slate-950 font-black text-xs gap-2 shadow-[0_0_30px_rgba(16,185,129,0.4)] transition-all hover:scale-[1.01] active:scale-[0.99]"
            >
              Découvrir sur ma flotte de véhicules
              <ArrowRight className="w-4 h-4 stroke-[3]" />
            </Button>
            
            <button
              onClick={handleClose}
              className="w-full py-2.5 text-center text-slate-400 hover:text-white text-xs font-semibold transition-colors"
            >
              Compris, fermer l&apos;annonce
            </button>
          </div>

        </div>

      </DialogContent>
    </Dialog>
  );
}
