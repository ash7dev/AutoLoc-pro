import React from "react";
import { cn } from "@/lib/utils";
import { Check, Sparkles, ShieldCheck, MapPin, Star } from "lucide-react";

/* ── Shared premium input classes ─────────────────────────────────── */

export const INPUT_CLASS =
  "w-full h-12 rounded-xl border-2 border-slate-200/90 bg-white px-4 text-[15px] font-bold text-slate-900 placeholder-slate-300 outline-none transition-all duration-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-slate-50 shadow-sm";

export const SELECT_CLASS =
  "w-full h-12 rounded-xl border-2 border-slate-200/90 bg-white px-4 text-[15px] font-bold text-slate-900 outline-none appearance-none cursor-pointer transition-all duration-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-slate-50 shadow-sm";

export const LABEL_CLASS = "text-[11px] sm:text-[10px] font-black text-slate-400 uppercase tracking-[0.14em]";

/* ═══════════════════════════════════════════════════════════════════
   Shared UI primitives
═══════════════════════════════════════════════════════════════════ */

export function SectionCard({
  icon: Icon,
  title,
  subtitle,
  badge,
  children,
  className,
}: {
  icon: React.ElementType;
  title: string;
  subtitle: string;
  badge?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("rounded-2xl border border-slate-200/80 bg-white overflow-hidden shadow-sm shadow-slate-100/60 transition-all duration-300 hover:shadow-md hover:border-slate-300/80", className)}>
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-gradient-to-br from-slate-50/90 via-white to-slate-50/40">
        <div className="flex items-center gap-3.5">
          <span className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center shadow-md shadow-slate-900/15 ring-1 ring-white/20 shrink-0">
            <Icon className="w-4.5 h-4.5 text-emerald-400" strokeWidth={2} />
          </span>
          <div>
            <p className="text-[15px] font-black text-slate-900 tracking-tight">{title}</p>
            <p className="text-[12.5px] font-medium text-slate-500 mt-0.5 leading-tight">{subtitle}</p>
          </div>
        </div>
        {badge && <div>{badge}</div>}
      </div>
      {/* Body */}
      <div className="p-5 sm:p-6 space-y-5">
        {children}
      </div>
    </div>
  );
}

export function FormField({
  label,
  required,
  error,
  icon: Icon,
  children,
  className,
}: {
  label: string;
  required?: boolean;
  error?: string;
  icon?: React.ElementType;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {Icon && <Icon className="w-3.5 h-3.5 text-slate-400" strokeWidth={2} />}
          <label className={LABEL_CLASS}>
            {label}
            {required && <span className="text-emerald-500 ml-1 font-bold">*</span>}
          </label>
        </div>
      </div>
      {children}
      {error && (
        <p className="text-[12px] font-bold text-red-600 flex items-center gap-2 bg-red-50/80 border border-red-200/80 rounded-lg px-3 py-1.5 animate-in fade-in slide-in-from-top-1">
          <span className="w-4 h-4 rounded-full bg-red-500 flex items-center justify-center text-white text-[10px] font-black shrink-0">!</span>
          {error}
        </p>
      )}
    </div>
  );
}

/* ── Interactive Option Card (Selection Buttons / Radios) ────────── */

export function OptionCard({
  selected,
  onClick,
  title,
  subtitle,
  icon: Icon,
  badge,
  children,
  className,
}: {
  selected: boolean;
  onClick: () => void;
  title: string;
  subtitle?: string;
  icon?: React.ElementType;
  badge?: string;
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      onClick={onClick}
      className={cn(
        "relative group flex flex-col justify-between p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 select-none",
        selected
          ? "border-emerald-500 bg-emerald-50/40 shadow-md shadow-emerald-500/10 ring-2 ring-emerald-500/20"
          : "border-slate-200/80 bg-white hover:border-slate-300 hover:bg-slate-50/60 shadow-sm",
        className
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          {Icon && (
            <div className={cn(
              "w-9 h-9 rounded-lg flex items-center justify-center transition-colors shrink-0",
              selected ? "bg-emerald-500 text-white shadow-sm" : "bg-slate-100 text-slate-500 group-hover:bg-slate-200/80"
            )}>
              <Icon className="w-4.5 h-4.5" strokeWidth={2} />
            </div>
          )}
          <div>
            <div className="flex items-center gap-2">
              <p className={cn("text-[14px] font-black tracking-tight", selected ? "text-emerald-950" : "text-slate-900")}>
                {title}
              </p>
              {badge && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-emerald-100 text-emerald-800">
                  {badge}
                </span>
              )}
            </div>
            {subtitle && (
              <p className={cn("text-[12px] font-medium leading-snug mt-0.5", selected ? "text-emerald-700/80" : "text-slate-500")}>
                {subtitle}
              </p>
            )}
          </div>
        </div>

        <div className={cn(
          "w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all mt-0.5",
          selected ? "border-emerald-500 bg-emerald-500 text-white" : "border-slate-300 bg-white group-hover:border-slate-400"
        )}>
          {selected && <Check className="w-3 h-3 stroke-[3]" />}
        </div>
      </div>

      {children && <div className="mt-3">{children}</div>}
    </div>
  );
}

/* ── Live Net Earning Calculator Simulator Box ────────────────────── */

export function EarningSimulator({ dailyPrice }: { dailyPrice: number }) {
  const days = 7;
  const gross = dailyPrice * days;
  const commissionRate = 0.15; // 15% commission
  const netEarnings = Math.round(gross * (1 - commissionRate));

  return (
    <div className="rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white p-5 shadow-xl shadow-slate-900/20 border border-slate-700/50">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-emerald-400" strokeWidth={2} />
          </div>
          <p className="text-[12px] font-black uppercase tracking-wider text-emerald-400">
            Estimation de revenus
          </p>
        </div>
        <span className="text-[10px] font-bold bg-white/10 px-2.5 py-1 rounded-full text-slate-300">
          Basé sur 7 jours
        </span>
      </div>

      <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-700/60">
        <div>
          <p className="text-[11px] font-medium text-slate-400">Revenu brut (7j)</p>
          <p className="text-[16px] font-bold text-slate-200 mt-0.5">
            {new Intl.NumberFormat("fr-FR").format(gross)} FCFA
          </p>
        </div>
        <div className="border-l border-slate-700/60 pl-4">
          <p className="text-[11px] font-medium text-emerald-400">Votre gain net estimé</p>
          <p className="text-[20px] font-black text-emerald-400 tracking-tight mt-0.5">
            ~{new Intl.NumberFormat("fr-FR").format(netEarnings)} <span className="text-[13px] font-bold">FCFA</span>
          </p>
        </div>
      </div>
      <p className="text-[10px] text-slate-400 mt-3 font-medium">
        💡 Les hôtes avec des prix ajustés enregistrent en moyenne 3.2x plus de réservations par mois.
      </p>
    </div>
  );
}

/* ── Live Listing Card Mockup (Catalog Preview) ───────────────────── */

export function LiveListingCardMockup({
  marque,
  modele,
  annee,
  prixParJour,
  ville,
  photoUrl,
  types,
}: {
  marque?: string;
  modele?: string;
  annee?: number;
  prixParJour?: number;
  ville?: string;
  photoUrl?: string | null;
  types?: string[];
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-lg shadow-slate-200/50 group max-w-sm mx-auto transition-transform duration-300 hover:scale-[1.01]">
      <div className="relative aspect-[16/10] bg-slate-900 overflow-hidden">
        {photoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={photoUrl} alt="Aperçu véhicule" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-slate-500 bg-gradient-to-br from-slate-800 to-slate-900 p-4 text-center">
            <span className="text-3xl mb-1">🚗</span>
            <p className="text-[11px] font-medium text-slate-400">Ajoutez une photo principale</p>
          </div>
        )}
        <div className="absolute top-3 left-3 bg-slate-900/80 backdrop-blur-md text-white text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider flex items-center gap-1 border border-white/10">
          <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
          5.0 (Nouveau)
        </div>
        {types && types[0] && (
          <div className="absolute top-3 right-3 bg-emerald-500 text-white text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider shadow-md">
            {types[0]}
          </div>
        )}
      </div>

      <div className="p-4 space-y-2">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h4 className="text-[15px] font-black text-slate-900 leading-snug">
              {marque || "Marque"} {modele || "Modèle"} {annee ? `(${annee})` : ""}
            </h4>
            <p className="text-[12px] text-slate-500 font-medium flex items-center gap-1 mt-0.5">
              <MapPin className="w-3 h-3 text-emerald-500" />
              {ville || "Dakar, Sénégal"}
            </p>
          </div>
        </div>

        <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-1">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span className="text-[11px] font-bold text-emerald-700">Vérifié AutoLoc</span>
          </div>
          <div>
            <span className="text-[18px] font-black text-slate-900">
              {prixParJour ? new Intl.NumberFormat("fr-FR").format(prixParJour) : "—"}
            </span>
            <span className="text-[11px] font-bold text-slate-400 uppercase ml-1">FCFA / j</span>
          </div>
        </div>
      </div>
    </div>
  );
}
