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
} from "lucide-react";
import { cn } from "@/lib/utils";

interface LifecycleModalProps {
  open: boolean;
  onClose: () => void;
  role: "TENANT" | "OWNER";
}

export function LifecycleModal({ open, onClose, role: initialRole }: LifecycleModalProps) {
  const [activeTab, setActiveTab] = useState<"TENANT" | "OWNER">(initialRole);

  if (!open) return null;

  const tenantSteps = [
    {
      number: "1",
      title: "Paiement & Signature (24h max)",
      badge: "Paiement séquestré",
      badgeColor: "bg-blue-50 text-blue-700 border-blue-100",
      description: "Votre paiement est débité et conservé en toute sécurité par AutoLoc. Le propriétaire dispose de 24 heures pour confirmer. S'il refuse ou dépasse ce délai, vous êtes remboursé à 100%.",
      icon: CreditCard,
      iconColor: "text-blue-500 bg-blue-50 border-blue-100",
    },
    {
      number: "2",
      title: "Accès aux Coordonnées (H-24)",
      badge: "Sécurité",
      badgeColor: "bg-slate-50 text-slate-600 border-slate-200",
      description: "Par mesure de confidentialité et de sécurité, le numéro de téléphone du propriétaire ainsi que l'adresse exacte de récupération du véhicule sont débloqués sur l'application 24 heures avant le début de la location.",
      icon: Clock,
      iconColor: "text-slate-500 bg-slate-50 border-slate-100",
    },
    {
      number: "3",
      title: "Prise en charge & Auto-Checkin (4h max)",
      badge: "Double Validation",
      badgeColor: "bg-emerald-50 text-emerald-700 border-emerald-100",
      description: "Le propriétaire fait l'état des lieux de départ. Vous devez obligatoirement valider le départ sur votre application pour démarrer. Si vous n'agissez pas dans les 4 heures suivant son check-in, le système appliquera une validation tacite automatique.",
      icon: Camera,
      iconColor: "text-emerald-500 bg-emerald-50 border-emerald-100",
    },
    {
      number: "4",
      title: "Trajet & Signalement de non-conformité",
      badge: "Protection Locataire",
      badgeColor: "bg-orange-50 text-orange-700 border-orange-100",
      description: "Pendant le trajet, vous êtes couvert. Si le véhicule présente un défaut de conformité majeur au moment du départ, vous pouvez refuser la prise en charge ou ouvrir un litige sur l'application pour suspendre les fonds.",
      icon: AlertTriangle,
      iconColor: "text-orange-500 bg-orange-50 border-orange-100",
    },
    {
      number: "5",
      title: "Règles d'annulation (Locataire)",
      badge: "Politique Modérée",
      badgeColor: "bg-red-50 text-red-700 border-red-100",
      description: "Avant confirmation : remboursé à 100% hors commission de 15% (>5j), 75% (2 à 5j), 0% (<24h). Après confirmation propriétaire : 100% hors commission (>3j), 75% (1 à 3j), 0% (<24h).",
      icon: Ban,
      iconColor: "text-red-500 bg-red-50 border-red-100",
    },
  ];

  const ownerSteps = [
    {
      number: "1",
      title: "Délai de confirmation (24h max)",
      badge: "Action requise",
      badgeColor: "bg-amber-50 text-amber-700 border-amber-100",
      description: "Dès que le locataire paie, vous disposez de 24 heures pour valider la demande et signer le contrat numérique. Si le délai expire sans action, la réservation s'annule automatiquement et le locataire est remboursé.",
      icon: ShieldCheck,
      iconColor: "text-amber-500 bg-amber-50 border-amber-100",
    },
    {
      number: "2",
      title: "Fenêtre de check-in (Dès la veille)",
      badge: "J-1",
      badgeColor: "bg-slate-50 text-slate-600 border-slate-200",
      description: "Le check-in de départ est débloqué la veille du trajet (J-1). Vous devez obligatoirement effectuer l'état des lieux et téléverser au moins 1 photo des 4 côtés du véhicule pour pouvoir finaliser le départ.",
      icon: Camera,
      iconColor: "text-slate-500 bg-slate-50 border-slate-100",
    },
    {
      number: "3",
      title: "Double validation & Auto-checkin (4h)",
      badge: "Paiement garanti",
      badgeColor: "bg-emerald-50 text-emerald-700 border-emerald-100",
      description: "Une fois que vous validez le check-in, le locataire a 4 heures pour confirmer. S'il n'agit pas, le système applique un check-in tacite automatique pour éviter de bloquer la location et sécuriser le versement.",
      icon: Handshake,
      iconColor: "text-emerald-500 bg-emerald-50 border-emerald-100",
    },
    {
      number: "4",
      title: "Non-présentation (No-Show)",
      badge: "Annulation auto",
      badgeColor: "bg-red-50 text-red-700 border-red-100",
      description: "Si à la date convenue aucun check-in n'est effectué par l'une des parties avant minuit, la réservation est automatiquement résiliée par le système pour non-présentation.",
      icon: Ban,
      iconColor: "text-red-500 bg-red-50 border-red-100",
    },
    {
      number: "5",
      title: "Pénalités d'annulation propriétaire",
      badge: "Grille stricte",
      badgeColor: "bg-red-50 text-red-700 border-red-100",
      description: "En cas d'annulation de votre part après confirmation, le locataire est intégralement remboursé. Une pénalité est retenue sur vos revenus futurs : 0% (>7j), 20% (3 à 7j), 40% (<3j). Annulation impossible le jour même.",
      icon: Scale,
      iconColor: "text-red-500 bg-red-50 border-red-100",
    },
  ];

  const currentSteps = activeTab === "TENANT" ? tenantSteps : ownerSteps;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 sm:p-6"
      role="dialog"
      aria-modal="true"
    >
      {/* Overlay backdrop */}
      <div
        className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Main panel */}
      <div className="relative w-full max-w-lg rounded-t-3xl sm:rounded-2xl bg-white border border-slate-200 shadow-2xl overflow-hidden animate-in slide-in-from-bottom-4 sm:zoom-in-95 duration-200 flex flex-col max-h-[85vh] sm:max-h-[80vh]">
        {/* Mobile handle */}
        <div className="flex justify-center pt-3 pb-1 sm:hidden">
          <div className="w-10 h-1 rounded-full bg-slate-200" />
        </div>

        {/* Header */}
        <div className="px-6 pt-4 pb-4 sm:pt-5 flex items-start justify-between border-b border-slate-100">
          <div className="space-y-1">
            <h2 className="text-[17px] font-black text-slate-900 leading-tight">
              Charte de Confiance & Règles de Séjour
            </h2>
            <p className="text-[11.5px] text-slate-400 font-medium leading-relaxed">
              AutoLoc applique un système hybride de double validation et de séquestre pour votre sécurité.
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center hover:scale-105 active:scale-95 transition-all flex-shrink-0 ml-3"
          >
            <X className="w-4 h-4 text-slate-500" strokeWidth={2.5} />
          </button>
        </div>

        {/* Role toggle tabs */}
        <div className="px-6 py-3.5 bg-slate-50/50 border-b border-slate-100 flex items-center justify-center">
          <div className="bg-slate-100 p-1 rounded-xl flex items-center w-full max-w-xs gap-1">
            <button
              onClick={() => setActiveTab("TENANT")}
              className={cn(
                "flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg text-[12px] font-bold transition-all",
                activeTab === "TENANT"
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-500 hover:text-slate-900"
              )}
            >
              <User className="w-3.5 h-3.5" />
              Locataire
            </button>
            <button
              onClick={() => setActiveTab("OWNER")}
              className={cn(
                "flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg text-[12px] font-bold transition-all",
                activeTab === "OWNER"
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-500 hover:text-slate-900"
              )}
            >
              <Home className="w-3.5 h-3.5" />
              Propriétaire
            </button>
          </div>
        </div>

        {/* Scrollable list */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6 scrollbar-thin">
          <div className="relative border-l border-slate-100 ml-4 pl-6 space-y-6">
            {currentSteps.map((step) => {
              const IconComponent = step.icon;
              return (
                <div key={step.number} className="relative group">
                  {/* Timeline point indicator */}
                  <div className="absolute -left-[37px] top-1 flex items-center justify-center">
                    <div className="w-[22px] h-[22px] rounded-full bg-white border border-slate-200 flex items-center justify-center text-[10.5px] font-extrabold text-slate-700 shadow-sm group-hover:border-slate-400 group-hover:text-slate-900 transition-colors">
                      {step.number}
                    </div>
                  </div>

                  <div className="space-y-2">
                    {/* Title + Badge row */}
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-[13.5px] font-black text-slate-800 tracking-tight leading-tight">
                        {step.title}
                      </h3>
                      <span
                        className={cn(
                          "inline-flex items-center px-2 py-0.5 rounded-full border text-[9.5px] font-bold tracking-tight",
                          step.badgeColor
                        )}
                      >
                        {step.badge}
                      </span>
                    </div>

                    {/* Step Card details */}
                    <div className="flex items-start gap-3.5 rounded-2xl border border-slate-100 bg-slate-50/40 p-3.5 group-hover:bg-slate-50 transition-all duration-200 shadow-sm">
                      <div
                        className={cn(
                          "w-9 h-9 rounded-xl border flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-105 duration-200",
                          step.iconColor
                        )}
                      >
                        <IconComponent className="w-4 h-4" strokeWidth={2} />
                      </div>
                      <p className="text-[12px] text-slate-600 font-medium leading-relaxed">
                        {step.description}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* CTA Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center gap-3">
          <button
            onClick={onClose}
            className="w-full py-3 rounded-xl bg-slate-900 text-white text-[13px] font-black hover:bg-slate-800 transition-colors shadow-sm active:scale-[0.98]"
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
