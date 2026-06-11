"use client";

import { useState } from "react";
import {
  X,
  User,
  Home,
  ShieldCheck,
  Clock,
  Ban,
  CreditCard,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  Camera,
  Scale,
  Handshake,
  Sparkles,
  Lock,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface LifecycleModalProps {
  open: boolean;
  onClose: () => void;
  role: "TENANT" | "OWNER";
}

/* ─── Shared step type ─────────────────────────────────────── */
interface Step {
  number: string;
  title: string;
  badge: string;
  badgeColor: string;
  description: string;
  icon: React.ElementType;
  iconGradient: string;
  accentColor: string;
}

export function LifecycleModal({ open, onClose, role: initialRole }: LifecycleModalProps) {
  const [activeTab, setActiveTab] = useState<"TENANT" | "OWNER">(initialRole);

  if (!open) return null;

  const tenantSteps: Step[] = [
    {
      number: "1",
      title: "Paiement & Signature",
      badge: "Séquestre sécurisé",
      badgeColor: "bg-blue-500/10 text-blue-600 ring-1 ring-blue-500/20",
      description: "Votre paiement est débité et conservé en toute sécurité par AutoLoc. Le propriétaire dispose de 24h pour confirmer. S'il refuse ou dépasse ce délai, vous êtes remboursé à 100%.",
      icon: CreditCard,
      iconGradient: "from-blue-500 to-indigo-500",
      accentColor: "blue",
    },
    {
      number: "2",
      title: "Accès aux Coordonnées",
      badge: "H-24",
      badgeColor: "bg-slate-500/10 text-slate-600 ring-1 ring-slate-500/20",
      description: "Par mesure de confidentialité, le numéro de téléphone du propriétaire et l'adresse de récupération sont débloqués 24 heures avant le début de la location.",
      icon: Lock,
      iconGradient: "from-slate-500 to-slate-600",
      accentColor: "slate",
    },
    {
      number: "3",
      title: "Prise en charge & Auto-Checkin",
      badge: "Double validation",
      badgeColor: "bg-emerald-500/10 text-emerald-600 ring-1 ring-emerald-500/20",
      description: "Le propriétaire fait l'état des lieux de départ. Vous devez valider le départ sur votre application. Sans action dans les 4h suivant son check-in, une validation tacite automatique s'applique.",
      icon: Camera,
      iconGradient: "from-emerald-500 to-teal-500",
      accentColor: "emerald",
    },
    {
      number: "4",
      title: "Trajet & Signalement",
      badge: "Protection locataire",
      badgeColor: "bg-amber-500/10 text-amber-600 ring-1 ring-amber-500/20",
      description: "Pendant le trajet, vous êtes couvert. Si le véhicule présente un défaut majeur, vous pouvez refuser la prise en charge ou ouvrir un litige pour suspendre les fonds.",
      icon: AlertTriangle,
      iconGradient: "from-amber-500 to-orange-500",
      accentColor: "amber",
    },
    {
      number: "5",
      title: "Règles d'annulation",
      badge: "Politique modérée",
      badgeColor: "bg-red-500/10 text-red-600 ring-1 ring-red-500/20",
      description: "Avant confirmation : 100% hors commission (>5j), 75% (2-5j), 0% (<24h). Après confirmation propriétaire : 100% hors commission (>3j), 75% (1-3j), 0% (<24h).",
      icon: Ban,
      iconGradient: "from-red-500 to-rose-500",
      accentColor: "red",
    },
  ];

  const ownerSteps: Step[] = [
    {
      number: "1",
      title: "Délai de confirmation",
      badge: "Action requise",
      badgeColor: "bg-amber-500/10 text-amber-600 ring-1 ring-amber-500/20",
      description: "Dès que le locataire paie, vous disposez de 24h pour valider et signer le contrat numérique. Si le délai expire, la réservation s'annule et le locataire est remboursé.",
      icon: ShieldCheck,
      iconGradient: "from-amber-500 to-orange-500",
      accentColor: "amber",
    },
    {
      number: "2",
      title: "Fenêtre de check-in",
      badge: "J-1",
      badgeColor: "bg-slate-500/10 text-slate-600 ring-1 ring-slate-500/20",
      description: "Le check-in de départ est débloqué la veille du trajet. Vous devez effectuer l'état des lieux et téléverser au moins 1 photo des 4 côtés du véhicule.",
      icon: Camera,
      iconGradient: "from-slate-500 to-slate-600",
      accentColor: "slate",
    },
    {
      number: "3",
      title: "Double validation & Auto-checkin",
      badge: "Paiement garanti",
      badgeColor: "bg-emerald-500/10 text-emerald-600 ring-1 ring-emerald-500/20",
      description: "Après votre check-in, le locataire a 4h pour confirmer. Sans action, le système applique un check-in tacite automatique pour sécuriser le versement.",
      icon: Handshake,
      iconGradient: "from-emerald-500 to-teal-500",
      accentColor: "emerald",
    },
    {
      number: "4",
      title: "Non-présentation (No-Show)",
      badge: "Annulation auto",
      badgeColor: "bg-red-500/10 text-red-600 ring-1 ring-red-500/20",
      description: "Si à la date convenue aucun check-in n'est effectué avant minuit, la réservation est automatiquement résiliée par le système pour non-présentation.",
      icon: Ban,
      iconGradient: "from-red-500 to-rose-500",
      accentColor: "red",
    },
    {
      number: "5",
      title: "Pénalités d'annulation",
      badge: "Grille stricte",
      badgeColor: "bg-red-500/10 text-red-600 ring-1 ring-red-500/20",
      description: "Annulation après confirmation : locataire remboursé intégralement. Pénalité retenue : 0% (>7j), 20% (3-7j), 40% (<3j). Annulation impossible le jour même.",
      icon: Scale,
      iconGradient: "from-red-500 to-rose-500",
      accentColor: "red",
    },
  ];

  const currentSteps = activeTab === "TENANT" ? tenantSteps : ownerSteps;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-6"
      role="dialog"
      aria-modal="true"
    >
      {/* Overlay backdrop */}
      <div
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-md transition-opacity animate-fade-in"
        onClick={onClose}
      />

      {/* Main panel */}
      <div className="relative w-full sm:max-w-lg rounded-t-[28px] sm:rounded-[20px] bg-white overflow-hidden animate-in slide-in-from-bottom-4 sm:zoom-in-95 duration-300 flex flex-col max-h-[92vh] sm:max-h-[85vh] shadow-[0_25px_60px_-12px_rgba(0,0,0,0.35)]">
        
        {/* Mobile handle */}
        <div className="flex justify-center pt-2.5 pb-0 sm:hidden">
          <div className="w-9 h-[3px] rounded-full bg-slate-300/60" />
        </div>

        {/* ──── Gradient Header ──── */}
        <div className="relative px-6 pt-5 pb-5 sm:pt-6 sm:pb-6 bg-gradient-to-br from-slate-50 via-white to-blue-50/40 overflow-hidden">
          {/* Subtle decorative circles */}
          <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full bg-gradient-to-br from-blue-100/40 to-indigo-100/30 blur-2xl pointer-events-none" />
          <div className="absolute -bottom-8 -left-8 w-24 h-24 rounded-full bg-gradient-to-br from-emerald-100/30 to-teal-100/20 blur-2xl pointer-events-none" />

          <div className="relative flex items-start justify-between gap-3">
            <div className="space-y-2.5">
              {/* Icon badge */}
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gradient-to-r from-slate-900 to-slate-700 text-white text-[10px] font-bold tracking-wide uppercase">
                <Sparkles className="w-3 h-3" />
                Charte de confiance
              </div>
              <h2 className="text-[18px] sm:text-[20px] font-black text-slate-900 leading-[1.2] tracking-tight">
                Règles & Sécurité
              </h2>
              <p className="text-[12px] text-slate-500 font-medium leading-relaxed max-w-[300px]">
                Système hybride de double validation et séquestre pour protéger chaque partie.
              </p>
            </div>

            <button
              onClick={onClose}
              className="w-9 h-9 rounded-full bg-white/80 backdrop-blur-sm border border-slate-200/60 hover:bg-slate-100 flex items-center justify-center hover:scale-110 active:scale-95 transition-all duration-200 shadow-sm flex-shrink-0"
            >
              <X className="w-4 h-4 text-slate-500" strokeWidth={2.5} />
            </button>
          </div>
        </div>

        {/* ──── Role Toggle ──── */}
        <div className="px-6 py-3 bg-white border-b border-slate-100/80 flex items-center justify-center">
          <div className="bg-slate-100/80 p-[3px] rounded-[14px] flex items-center w-full max-w-[280px] gap-[3px]">
            <button
              onClick={() => setActiveTab("TENANT")}
              className={cn(
                "flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-[11px] text-[12px] font-bold transition-all duration-200",
                activeTab === "TENANT"
                  ? "bg-white text-slate-900 shadow-[0_1px_3px_rgba(0,0,0,0.08),0_2px_8px_rgba(0,0,0,0.04)] scale-[1.02]"
                  : "text-slate-400 hover:text-slate-600"
              )}
            >
              <User className="w-3.5 h-3.5" />
              Locataire
            </button>
            <button
              onClick={() => setActiveTab("OWNER")}
              className={cn(
                "flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-[11px] text-[12px] font-bold transition-all duration-200",
                activeTab === "OWNER"
                  ? "bg-white text-slate-900 shadow-[0_1px_3px_rgba(0,0,0,0.08),0_2px_8px_rgba(0,0,0,0.04)] scale-[1.02]"
                  : "text-slate-400 hover:text-slate-600"
              )}
            >
              <Home className="w-3.5 h-3.5" />
              Propriétaire
            </button>
          </div>
        </div>

        {/* ──── Scrollable Timeline ──── */}
        <div className="flex-1 overflow-y-auto px-6 py-5 scrollbar-thin">
          <div className="space-y-0">
            {currentSteps.map((step, index) => {
              const IconComponent = step.icon;
              const isLast = index === currentSteps.length - 1;
              return (
                <div
                  key={step.number}
                  className="relative flex gap-4 group"
                  style={{ animationDelay: `${index * 60}ms` }}
                >
                  {/* ── Timeline column ── */}
                  <div className="flex flex-col items-center flex-shrink-0 pt-1">
                    {/* Gradient dot */}
                    <div className={cn(
                      "relative w-8 h-8 rounded-full flex items-center justify-center z-10",
                      "bg-gradient-to-br shadow-md transition-transform duration-200 group-hover:scale-110",
                      step.iconGradient
                    )}>
                      <IconComponent className="w-3.5 h-3.5 text-white" strokeWidth={2.5} />
                    </div>
                    {/* Connector line */}
                    {!isLast && (
                      <div className="w-px flex-1 my-1.5 bg-gradient-to-b from-slate-200 via-slate-200/60 to-slate-200/20" />
                    )}
                  </div>

                  {/* ── Content card ── */}
                  <div className={cn(
                    "flex-1 rounded-2xl border p-4 mb-4 transition-all duration-200",
                    "bg-white hover:bg-slate-50/50",
                    "border-slate-100 hover:border-slate-200",
                    "shadow-[0_1px_3px_rgba(0,0,0,0.02)] hover:shadow-[0_4px_12px_rgba(0,0,0,0.05)]",
                    "group-hover:-translate-y-0.5"
                  )}>
                    {/* Title + Badge */}
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <h3 className="text-[13px] font-extrabold text-slate-800 tracking-tight leading-tight">
                        {step.title}
                      </h3>
                      <span
                        className={cn(
                          "inline-flex items-center px-2 py-0.5 rounded-full text-[9.5px] font-bold tracking-tight",
                          step.badgeColor
                        )}
                      >
                        {step.badge}
                      </span>
                    </div>

                    {/* Description */}
                    <p className="text-[11.5px] text-slate-500 font-medium leading-[1.65]">
                      {step.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ──── CTA Footer ──── */}
        <div className="px-6 py-4 bg-gradient-to-t from-slate-50 to-white border-t border-slate-100/80">
          <button
            onClick={onClose}
            className={cn(
              "w-full py-3.5 rounded-2xl text-[13px] font-black transition-all duration-200",
              "bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white",
              "hover:shadow-lg hover:shadow-slate-900/20 hover:-translate-y-0.5",
              "active:scale-[0.98] active:shadow-sm"
            )}
          >
            J&apos;ai compris
          </button>
        </div>

        {/* iOS bottom safe area padding */}
        <div className="sm:hidden h-safe-area-inset-bottom bg-slate-50" />
      </div>
    </div>
  );
}
