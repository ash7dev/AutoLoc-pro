'use client';

import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

export function WhatsAppBubble() {
  const phoneNumber = '221786637705';
  const message = "Bonjour AutoLoc, j'aimerais avoir des informations.";
  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
  const [expanded, setExpanded] = useState(true);

  // Auto-collapse après 4 secondes
  useEffect(() => {
    const t = setTimeout(() => setExpanded(false), 4000);
    return () => clearTimeout(t);
  }, []);

  return (
    <motion.a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      drag
      dragConstraints={{ left: -320, right: 0, top: -700, bottom: 0 }}
      dragElastic={0.08}
      whileDrag={{ scale: 1.08, cursor: 'grabbing' }}
      whileTap={{ scale: 0.93 }}
      layout
      transition={{ layout: { duration: 0.3, ease: [0.34, 1.56, 0.64, 1] } }}
      className={cn(
        // Position — au-dessus de la bottom nav mobile (≈108px), normal sur desktop
        'fixed right-4 z-[99999]',
        'bottom-[108px] lg:bottom-8 lg:right-8',
        // Layout
        'flex items-center justify-center gap-2.5 overflow-hidden',
        // Style
        'bg-gradient-to-br from-[#2FD97A] to-[#128C7E]',
        'border-2 border-white/25',
        'rounded-full cursor-grab select-none',
        'shadow-[0_4px_20px_rgba(37,211,102,0.45),0_2px_8px_rgba(0,0,0,0.15)]',
        'hover:shadow-[0_6px_28px_rgba(37,211,102,0.60),0_4px_12px_rgba(0,0,0,0.20)]',
        'transition-shadow duration-300',
        'group',
        expanded ? 'px-4 py-3.5' : 'w-14 h-14',
      )}
      style={{ touchAction: 'none' }}
      aria-label="Contacter le support sur WhatsApp"
    >
      {/* Anneau pulsant (plus discret) */}
      <span className="absolute inset-0 rounded-full bg-[#25D366] animate-ping opacity-[0.18] pointer-events-none" />

      {/* Icône WhatsApp */}
      <svg
        viewBox="0 0 24 24"
        className="w-6 h-6 flex-shrink-0 fill-white"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
      </svg>

      {/* Label pill (mobile) — disparaît après 4s */}
      <AnimatePresence>
        {expanded && (
          <motion.span
            initial={{ opacity: 0, maxWidth: 0 }}
            animate={{ opacity: 1, maxWidth: 160 }}
            exit={{ opacity: 0, maxWidth: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="text-[13px] font-bold text-white whitespace-nowrap overflow-hidden leading-none"
          >
            Besoin d&apos;aide ?
          </motion.span>
        )}
      </AnimatePresence>

      {/* Tooltip desktop */}
      <div className="absolute right-full mr-3 whitespace-nowrap rounded-xl bg-slate-900 px-3 py-2 text-[11.5px] font-semibold text-white opacity-0 transition-opacity duration-200 group-hover:opacity-100 pointer-events-none hidden lg:block shadow-xl">
        Discuter sur WhatsApp
        <div className="absolute -right-1.5 top-1/2 -translate-y-1/2 border-[7px] border-transparent border-l-slate-900" />
      </div>
    </motion.a>
  );
}
