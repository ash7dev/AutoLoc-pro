"use client";

import React, { useEffect, useState } from "react";
import {
  Check, Clock, AlertCircle, Circle,
  Phone, ShieldCheck, CreditCard, X, ArrowRight,
} from "lucide-react";
import { PhoneVerifyGate } from "@/features/vehicles/add/PhoneVerifyGate";
import { KycGate } from "@/features/vehicles/add/KycGate";
import { PermisGate } from "@/features/reservations/components/PermisGate";
import type { ProfileResponse } from "@/lib/nestjs/auth";
import { ModalShell } from "@/features/shared/ModalShell";
import { apiFetch } from "@/lib/nestjs/api-client";
import { cn } from "@/lib/utils";

/* ── Types ───────────────────────────────────────────────── */
type Gate = "phone" | "kyc" | "permis" | "ready";
type StepStatus = "done" | "pending" | "rejected" | "required";

interface Step {
  key: "phone" | "kyc" | "permis";
  label: string;
  description: string;
  duration?: string;
  status: StepStatus;
  icon: React.ElementType;
}

/* ── Helpers ─────────────────────────────────────────────── */
function resolveGate(profile: ProfileResponse): Gate {
  if (!profile.hasUtilisateur) return "phone";
  if (!profile.phoneVerified || !profile.phone) return "phone";
  const kyc = profile.kycStatus;
  if (!kyc || kyc === "NON_VERIFIE" || kyc === "REJETE") return "kyc";
  if (!profile.hasPermis) return "permis";
  return "ready";
}

function resolveSteps(profile: ProfileResponse): Step[] {
  const phoneOk = profile.hasUtilisateur && profile.phoneVerified && !!profile.phone;
  const kyc = profile.kycStatus;
  const kycStatus: StepStatus =
    kyc === "VERIFIE" ? "done"
      : kyc === "EN_ATTENTE" ? "pending"
        : kyc === "REJETE" ? "rejected"
          : "required";
  const permisOk = profile.hasPermis;

  return [
    {
      key: "phone",
      label: "Téléphone vérifié",
      description: profile.hasUtilisateur
        ? "Confirmez votre numéro de téléphone"
        : "Prénom, nom, date de naissance et numéro de téléphone",
      duration: profile.hasUtilisateur ? "~1 min" : "~2 min",
      status: phoneOk ? "done" : "required",
      icon: Phone,
    },
    {
      key: "kyc",
      label: "Vérification d'identité",
      description: "Pièce d'identité nationale ou passeport",
      duration: "~2 min",
      status: kycStatus,
      icon: ShieldCheck,
    },
    {
      key: "permis",
      label: "Permis de conduire",
      description: "Photo recto-verso de votre permis en cours de validité",
      duration: "~1 min",
      status: permisOk ? "done" : "required",
      icon: CreditCard,
    },
  ];
}

/* ── Status config ───────────────────────────────────────── */
const STATUS: Record<StepStatus, {
  indicator: React.ElementType;
  indicatorCls: string;
  stepBg: string;
  badge: string;
  badgeCls: string;
}> = {
  done: {
    indicator: Check,
    indicatorCls: "bg-emerald-500 text-white",
    stepBg: "bg-white",
    badge: "Complété",
    badgeCls: "bg-emerald-50 text-emerald-700 border-emerald-100",
  },
  pending: {
    indicator: Clock,
    indicatorCls: "bg-amber-100 text-amber-600",
    stepBg: "bg-white",
    badge: "En vérification",
    badgeCls: "bg-amber-50 text-amber-700 border-amber-100",
  },
  rejected: {
    indicator: AlertCircle,
    indicatorCls: "bg-red-100 text-red-600",
    stepBg: "bg-white",
    badge: "Rejeté",
    badgeCls: "bg-red-50 text-red-700 border-red-100",
  },
  required: {
    indicator: Circle,
    indicatorCls: "bg-slate-100 text-slate-300",
    stepBg: "bg-white",
    badge: "Requis",
    badgeCls: "bg-slate-50 text-slate-500 border-slate-200",
  },
};

/* ── Step row ────────────────────────────────────────────── */
function StepRow({ step, index }: { step: Step; index: number }) {
  const cfg = STATUS[step.status];
  const Indicator = cfg.indicator;
  const StepIcon = step.icon;
  const isDone = step.status === "done";

  return (
    <div className={cn(
      "flex items-start gap-4 px-4 py-4 sm:px-5 sm:py-4 rounded-2xl border transition-all",
      isDone ? "border-emerald-100 bg-emerald-50/40" : "border-slate-100 bg-white",
    )}>
      {/* Left: step number + icon stack */}
      <div className="relative flex-shrink-0 mt-0.5">
        {/* Step icon */}
        <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-emerald-100">
          <StepIcon className="w-4.5 h-4.5 text-emerald-600" strokeWidth={1.75} />
        </div>
        {/* Status indicator — small badge bottom-right */}
        <div className={cn(
          "absolute -bottom-1 -right-1 w-4.5 h-4.5 rounded-full border-2 border-white flex items-center justify-center",
          cfg.indicatorCls,
        )}>
          <Indicator className="w-2.5 h-2.5" strokeWidth={2.5} />
        </div>
      </div>

      {/* Center: label + description */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className={cn(
            "text-[13.5px] font-bold tracking-tight",
            isDone ? "text-slate-700" : "text-slate-900",
          )}>
            {step.label}
          </span>
          <span className={cn(
            "inline-flex items-center px-2 py-0.5 rounded-full text-[10.5px] font-semibold border",
            cfg.badgeCls,
          )}>
            {cfg.badge}
          </span>
        </div>
        <p className="text-[12px] text-slate-400 mt-0.5 leading-relaxed">
          {step.description}
          {!isDone && step.duration && (
            <span className="ml-1.5 text-slate-300">· {step.duration}</span>
          )}
        </p>
      </div>

      {/* Step number — right */}
      <span className="flex-shrink-0 text-[11px] font-black text-slate-200 tabular-nums mt-1">
        {String(index + 1).padStart(2, "0")}
      </span>
    </div>
  );
}

/* ── Pre-gate overview modal ─────────────────────────────── */
function PreGateOverlay({
  steps,
  onContinue,
  onCancel,
}: {
  steps: Step[];
  onContinue: () => void;
  onCancel: () => void;
}) {
  const pending = steps.filter(s => s.status !== "done");
  const totalMin = pending.reduce((acc, s) => {
    const m = parseInt(s.duration?.replace(/\D/g, "") ?? "0");
    return acc + m;
  }, 0);

  return (
    <div
      className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-[2px] px-0 sm:px-4 animate-in fade-in duration-200"
      onClick={onCancel}
    >
      <div
        className="w-full sm:max-w-md flex flex-col overflow-hidden rounded-t-3xl sm:rounded-2xl border border-slate-200/60 bg-white shadow-[0_-8px_40px_rgba(0,0,0,0.18)] sm:shadow-[0_24px_64px_rgba(0,0,0,0.22)] animate-in slide-in-from-bottom-4 sm:zoom-in-95 duration-250"
        onClick={e => e.stopPropagation()}
      >
        {/* Drag handle — mobile only */}
        <div className="sm:hidden flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-slate-200" />
        </div>

        {/* Header */}
        <div className="flex items-start justify-between px-5 pt-4 pb-3 sm:px-6 sm:pt-5">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">
              Auto Loc · Locataire
            </p>
            <h2 className="text-[17px] font-black text-slate-900 tracking-tight mt-0.5">
              Avant de réserver
            </h2>
            <p className="text-[12.5px] text-slate-500 mt-0.5 leading-snug">
              {pending.length === 0
                ? "Votre profil est complet. Vous pouvez continuer."
                : `${pending.length} étape${pending.length > 1 ? "s" : ""} requise${pending.length > 1 ? "s" : ""} · environ ${totalMin} min`
              }
            </p>
          </div>
          <button
            type="button"
            onClick={onCancel}
            className="flex-shrink-0 ml-4 w-8 h-8 flex items-center justify-center rounded-full border border-slate-100 text-slate-400 hover:text-slate-700 hover:bg-slate-50 transition-colors"
            aria-label="Fermer"
          >
            <X className="w-3.5 h-3.5" strokeWidth={2.5} />
          </button>
        </div>

        {/* Divider */}
        <div className="mx-5 sm:mx-6 h-px bg-slate-100" />

        {/* Steps */}
        <div className="px-4 py-4 sm:px-5 space-y-2.5">
          {steps.map((step, i) => (
            <StepRow key={step.key} step={step} index={i} />
          ))}
        </div>

        {/* Info note */}
        <div className="mx-4 sm:mx-5 mb-4 px-4 py-3 rounded-xl bg-slate-50 border border-slate-100">
          <p className="text-[11.5px] text-slate-500 leading-relaxed">
            Ces informations sont nécessaires pour garantir la sécurité de chaque location.
            Vos données restent strictement confidentielles.
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-col-reverse sm:flex-row gap-2.5 px-4 pb-5 sm:px-5 sm:pb-5 pt-1">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 px-5 py-3 rounded-xl border border-slate-200 text-[13.5px] font-semibold text-slate-500 hover:text-slate-800 hover:bg-slate-50 hover:border-slate-300 transition-all"
          >
            Annuler
          </button>
          <button
            type="button"
            onClick={onContinue}
            className="flex-1 flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-slate-900 hover:bg-emerald-500 text-white text-[13.5px] font-bold shadow-sm hover:shadow-md hover:shadow-emerald-500/20 hover:-translate-y-px active:translate-y-0 transition-all duration-200"
          >
            Continuer
            <ArrowRight className="w-4 h-4" strokeWidth={2.5} />
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Main export ─────────────────────────────────────────── */
export function ReservationGateModal({
  open,
  onOpenChange,
  profile,
  onProceed,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  profile: ProfileResponse | null;
  onProceed: () => void;
}) {
  const [currentProfile, setCurrentProfile] = useState<ProfileResponse | null>(profile);
  const [refreshing, setRefreshing] = useState(false);
  const [preGateDismissed, setPreGateDismissed] = useState(false);

  useEffect(() => {
    if (open) {
      setCurrentProfile(profile);
      setPreGateDismissed(false);
    }
  }, [open, profile]);

  const refreshProfile = async () => {
    if (refreshing) return;
    setRefreshing(true);
    try {
      const p = await apiFetch<ProfileResponse>("/auth/me");
      setCurrentProfile(p);
    } catch {
      // ignore
    } finally {
      setRefreshing(false);
    }
  };

  if (!open || !currentProfile) return null;

  const gate = resolveGate(currentProfile);

  if (gate === "ready") {
    onProceed();
    onOpenChange(false);
    return null;
  }

  // Show pre-gate overview first
  if (!preGateDismissed) {
    return (
      <PreGateOverlay
        steps={resolveSteps(currentProfile)}
        onContinue={() => setPreGateDismissed(true)}
        onCancel={() => onOpenChange(false)}
      />
    );
  }

  // Then show the actual gate
  return (
    <ModalShell
      title={
        gate === "phone" ? "Vérifiez votre téléphone" :
          gate === "kyc" ? "Vérifiez votre identité" :
            "Permis de conduire requis"
      }
      subtitle={
        gate === "phone" ? "Étape requise pour sécuriser votre réservation." :
          gate === "kyc" ? "Soumettez vos documents pour continuer — la validation se fait en parallèle." :
            "Une photo de votre permis est nécessaire."
      }
      tag="Auto Loc · Locataire"
      onClose={() => onOpenChange(false)}
      contentClassName="px-6 pt-6 pb-6"
    >
      {gate === "phone" && (
        <PhoneVerifyGate
          profile={currentProfile}
          onVerified={refreshProfile}
        />
      )}
      {gate === "kyc" && (
        <KycGate
          kycStatus={currentProfile.kycStatus}
          onProceed={() => onOpenChange(false)}
          onSubmitted={refreshProfile}
          pendingMode="continue"
        />
      )}
      {gate === "permis" && (
        <PermisGate
          onProceed={() => onOpenChange(false)}
          onSubmitted={refreshProfile}
        />
      )}
    </ModalShell>
  );
}
