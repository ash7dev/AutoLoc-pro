"use client";

import { useState, useCallback, useEffect } from "react";
import dynamic from "next/dynamic";
import { CallBackProps, STATUS, Step as JoyrideStep } from "react-joyride";
import { ProfileResponse } from "@/lib/nestjs/auth";
import { useRouter } from "next/navigation";
import {
  ArrowLeft, Sparkles, Phone, ShieldCheck,
  Check, Clock, AlertCircle, Circle, ArrowRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { PhoneVerifyGate } from "./PhoneVerifyGate";
import { KycGate } from "./KycGate";
import { WizardProgress } from "./WizardProgress";
import { StepVehicleInfo } from "./steps/StepVehicleInfo";
import { StepPricing } from "./steps/StepPricing";
import { StepConditions } from "./steps/StepConditions";
import { StepPhotos } from "./steps/StepPhotos";
import { StepDocuments } from "./steps/StepDocuments";
import { StepReview } from "./steps/StepReview";

const Joyride = dynamic(() => import("react-joyride"), { ssr: false });

type Gate = "phone" | "kyc" | "wizard";
type StepStatus = "done" | "pending" | "rejected" | "required";

/* ── Pre-gate step config ──────────────────────────────────────────────── */

const STEP_STATUS_CFG: Record<StepStatus, {
  indicator: React.ElementType;
  indicatorCls: string;
  badge: string;
  badgeCls: string;
}> = {
  done: {
    indicator: Check,
    indicatorCls: "bg-emerald-500 text-white",
    badge: "Complété",
    badgeCls: "bg-emerald-50 text-emerald-700 border-emerald-100",
  },
  pending: {
    indicator: Clock,
    indicatorCls: "bg-amber-100 text-amber-600",
    badge: "En vérification",
    badgeCls: "bg-amber-50 text-amber-700 border-amber-100",
  },
  rejected: {
    indicator: AlertCircle,
    indicatorCls: "bg-red-100 text-red-600",
    badge: "Rejeté",
    badgeCls: "bg-red-50 text-red-700 border-red-100",
  },
  required: {
    indicator: Circle,
    indicatorCls: "bg-slate-100 text-slate-300",
    badge: "Requis",
    badgeCls: "bg-slate-50 text-slate-500 border-slate-200",
  },
};

interface PreGateStep {
  label: string;
  description: string;
  duration?: string;
  status: StepStatus;
  icon: React.ElementType;
}

function StepRow({ step, index }: { step: PreGateStep; index: number }) {
  const cfg = STEP_STATUS_CFG[step.status];
  const Indicator = cfg.indicator;
  const StepIcon = step.icon;
  const isDone = step.status === "done";

  return (
    <div className={cn(
      "flex items-start gap-4 px-4 py-4 sm:px-5 rounded-2xl border transition-all",
      isDone ? "border-emerald-100 bg-emerald-50/40" : "border-slate-100 bg-white",
    )}>
      <div className="relative flex-shrink-0 mt-0.5">
        <div className={cn(
          "w-10 h-10 rounded-xl flex items-center justify-center",
          isDone ? "bg-emerald-100" : "bg-slate-100",
        )}>
          <StepIcon className={cn(
            "w-4.5 h-4.5",
            isDone ? "text-emerald-600" : "text-slate-400",
          )} strokeWidth={1.75} />
        </div>
        <div className={cn(
          "absolute -bottom-1 -right-1 w-4.5 h-4.5 rounded-full border-2 border-white flex items-center justify-center",
          cfg.indicatorCls,
        )}>
          <Indicator className="w-2.5 h-2.5" strokeWidth={2.5} />
        </div>
      </div>

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

      <span className="flex-shrink-0 text-[11px] font-black text-slate-200 tabular-nums mt-1">
        {String(index + 1).padStart(2, "0")}
      </span>
    </div>
  );
}

function PreGateOverview({
  phoneVerified,
  hasUtilisateur,
  kycStatus,
  onContinue,
  onCancel,
}: {
  phoneVerified: boolean;
  hasUtilisateur: boolean;
  kycStatus: string | null | undefined;
  onContinue: () => void;
  onCancel: () => void;
}) {
  const resolvedKycStatus: StepStatus =
    kycStatus === "VERIFIE" ? "done"
      : kycStatus === "EN_ATTENTE" ? "pending"
        : kycStatus === "REJETE" ? "rejected"
          : "required";

  const steps: PreGateStep[] = [
    {
      label: "Téléphone vérifié",
      description: hasUtilisateur
        ? "Confirmez votre numéro de téléphone"
        : "Prénom, nom, date de naissance et numéro de téléphone",
      duration: hasUtilisateur ? "~1 min" : "~2 min",
      status: phoneVerified ? "done" : "required",
      icon: Phone,
    },
    {
      label: "Vérification d'identité",
      description: "Pièce d'identité nationale ou passeport en cours de validité",
      duration: "~2 min",
      status: resolvedKycStatus,
      icon: ShieldCheck,
    },
  ];

  const pending = steps.filter(s => s.status !== "done");
  const totalMin = pending.reduce((acc, s) => {
    const m = parseInt(s.duration?.replace(/\D/g, "") ?? "0");
    return acc + m;
  }, 0);

  return (
    <div className="max-w-lg mx-auto">
      {/* Header card */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="bg-slate-900 px-6 py-5">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-400/60 mb-1">
            AutoLoc · Propriétaire
          </p>
          <h2 className="text-[17px] font-black text-white tracking-tight">
            Avant de publier votre annonce
          </h2>
          <p className="text-[12.5px] text-slate-400 mt-1 leading-snug">
            {pending.length === 0
              ? "Votre profil est complet. Vous pouvez continuer."
              : `${pending.length} étape${pending.length > 1 ? "s" : ""} requise${pending.length > 1 ? "s" : ""} · environ ${totalMin} min`
            }
          </p>
        </div>

        {/* Steps */}
        <div className="p-4 sm:p-5 space-y-2.5">
          {steps.map((step, i) => (
            <StepRow key={step.label} step={step} index={i} />
          ))}
        </div>

        {/* Info note */}
        <div className="mx-4 sm:mx-5 mb-4 px-4 py-3 rounded-xl bg-slate-50 border border-slate-100">
          <p className="text-[11.5px] text-slate-500 leading-relaxed">
            Ces étapes garantissent la confiance entre propriétaires et locataires.
            Vos données restent strictement confidentielles.
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-col-reverse sm:flex-row gap-2.5 px-4 sm:px-5 pb-5">
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

const JOYRIDE_STEPS: JoyrideStep[] = [
  {
    target: "[data-tour='wizard-progress']",
    content: "Suivez votre progression en 6 étapes. Vous pouvez revenir en arrière à tout moment.",
    disableBeacon: true,
    placement: "bottom",
  },
  {
    target: "[data-tour='step-form']",
    content: "Remplissez les informations de votre véhicule. Les champs marqués * sont obligatoires.",
    placement: "top",
  },
];

const STEP_TITLES = [
  "Informations du véhicule",
  "Tarification & livraison",
  "Conditions de location",
  "Photos du véhicule",
  "Documents obligatoires",
  "Vérification & envoi",
];

export function AddVehicleFlow({ profile }: { profile: ProfileResponse }) {
  const router = useRouter();
  const [kycStatus, setKycStatus] = useState(profile.kycStatus);
  const [phoneVerified, setPhoneVerified] = useState(Boolean(profile.phoneVerified && profile.phone));
  const [currentStep, setCurrentStep] = useState(1);
  const [runTour, setRunTour] = useState(false);
  const [preGateDismissed, setPreGateDismissed] = useState(false);

  const effectiveGate: Gate = !phoneVerified
    ? "phone"
    : (kycStatus === "EN_ATTENTE" || kycStatus === "VERIFIE")
      ? "wizard"
      : "kyc";

  useEffect(() => {
    setKycStatus(profile.kycStatus);
    setPhoneVerified(Boolean(profile.phoneVerified && profile.phone));
  }, [profile]);

  useEffect(() => {
    if (effectiveGate === "wizard") {
      const seen = localStorage.getItem("vehicle_wizard_tour_seen");
      if (!seen) setRunTour(true);
    }
  }, [effectiveGate]);

  const handleJoyrideCallback = (data: CallBackProps) => {
    if (data.status === STATUS.FINISHED || data.status === STATUS.SKIPPED) {
      localStorage.setItem("vehicle_wizard_tour_seen", "1");
      setRunTour(false);
    }
  };

  const goNext = useCallback(() => {
    setCurrentStep((s) => Math.min(s + 1, 6));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const goBack = useCallback(() => {
    setCurrentStep((s) => Math.max(s - 1, 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const goToStep = useCallback((step: number) => {
    if (step >= 1 && step <= 6) {
      setCurrentStep(step);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, []);

  const onPhoneVerified = useCallback(() => setPhoneVerified(true), []);
  const onKycSubmitted = useCallback(() => setKycStatus("EN_ATTENTE"), []);

  // ── Pre-gate overview ──────────────────────────────────────────────────────
  if (effectiveGate !== "wizard" && !preGateDismissed) {
    return (
      <PageShell onBack={() => router.push("/dashboard/owner/vehicles")}>
        <PreGateOverview
          phoneVerified={phoneVerified}
          hasUtilisateur={Boolean(profile.hasUtilisateur)}
          kycStatus={kycStatus}
          onContinue={() => setPreGateDismissed(true)}
          onCancel={() => router.push("/dashboard/owner/vehicles")}
        />
      </PageShell>
    );
  }

  // ── Gate : vérification téléphone ──────────────────────────────────────────
  if (effectiveGate === "phone") {
    return (
      <PageShell onBack={() => router.push("/dashboard/owner/vehicles")}>
        <div className="max-w-xl mx-auto">
          <GateCard
            title="Vérifiez votre téléphone"
            subtitle="Ajoutez votre numéro pour sécuriser vos futures locations."
          >
            <PhoneVerifyGate profile={profile} onVerified={onPhoneVerified} />
          </GateCard>
        </div>
      </PageShell>
    );
  }

  // ── Gate : KYC ─────────────────────────────────────────────────────────────
  if (effectiveGate === "kyc") {
    return (
      <PageShell onBack={() => router.push("/dashboard/owner/vehicles")}>
        <div className="max-w-xl mx-auto">
          <GateCard
            title="Vérifiez votre identité"
            subtitle="Une étape rapide pour publier votre annonce en toute confiance."
          >
            <KycGate
              kycStatus={kycStatus}
              onProceed={onKycSubmitted}
              onSubmitted={onKycSubmitted}
            />
          </GateCard>
        </div>
      </PageShell>
    );
  }

  // ── Wizard principal ───────────────────────────────────────────────────────
  return (
    <>
      <Joyride
        steps={JOYRIDE_STEPS}
        run={runTour}
        continuous
        showSkipButton
        showProgress
        callback={handleJoyrideCallback}
        styles={{ options: { primaryColor: "#000000", zIndex: 1000 } }}
        locale={{
          back: "Retour",
          close: "Fermer",
          last: "Terminer",
          next: "Suivant",
          skip: "Passer",
        }}
      />

      <PageShell onBack={() => router.push("/dashboard/owner/vehicles")}>
        <div className="max-w-4xl mx-auto space-y-6 sm:space-y-8">

          {/* ── Stepper ─────────────────────────────────────────── */}
          <div data-tour="wizard-progress" className="px-2 sm:px-0">
            <WizardProgress currentStep={currentStep} onStepClick={goToStep} />
          </div>

          {/* ── Step title ──────────────────────────────────────── */}
          <div className="text-center space-y-1">
            <p className="text-[11px] font-black uppercase tracking-[0.2em] text-emerald-500">
              Étape {currentStep} sur {STEP_TITLES.length}
            </p>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              {STEP_TITLES[currentStep - 1]}
            </h2>
          </div>

          {/* ── Step content card ────────────────────────────────── */}
          <div
            data-tour="step-form"
            className="rounded-2xl border border-slate-200 bg-white shadow-sm
              hover:shadow-md transition-shadow duration-300
              p-5 sm:p-8 max-w-3xl mx-auto"
          >
            {currentStep === 1 && <StepVehicleInfo onNext={goNext} />}
            {currentStep === 2 && <StepPricing onNext={goNext} onBack={goBack} />}
            {currentStep === 3 && <StepConditions onNext={goNext} onBack={goBack} />}
            {currentStep === 4 && <StepPhotos onNext={goNext} onBack={goBack} />}
            {currentStep === 5 && <StepDocuments onNext={goNext} onBack={goBack} />}
            {currentStep === 6 && <StepReview onBack={goBack} />}
          </div>
        </div>
      </PageShell>
    </>
  );
}

/* ── Page Shell (full-page layout) ──────────────────────────────────── */

function PageShell({
  onBack,
  children,
}: {
  onBack: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50/50">
      {/* Sticky header */}
      <header className="sticky top-0 z-30 backdrop-blur-xl bg-white/80 border-b border-slate-100">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between">
          <button
            type="button"
            onClick={onBack}
            className="flex items-center gap-2 text-[13px] font-semibold text-slate-500 hover:text-slate-900 transition-colors group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" strokeWidth={2.5} />
            <span className="hidden sm:inline">Retour aux véhicules</span>
            <span className="sm:hidden">Retour</span>
          </button>

          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-slate-900 to-slate-700 flex items-center justify-center shadow-md">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" strokeWidth={2.5} />
            </div>
            <div className="hidden sm:block">
              <p className="text-[13px] font-black text-slate-900 leading-none">Créer une annonce</p>
              <p className="text-[10px] font-medium text-slate-400 mt-0.5">AutoLoc · Propriétaire</p>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="px-4 sm:px-6 py-6 sm:py-10">
        {children}
      </main>
    </div>
  );
}

/* ── Gate Card ───────────────────────────────────────────────────────── */

function GateCard({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
      {/* Dark header */}
      <div className="bg-slate-900 px-6 py-5">
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-400/60 mb-1">
          AutoLoc · Propriétaire
        </p>
        <h2 className="text-lg font-bold text-white">{title}</h2>
        <p className="text-sm text-slate-400 mt-1">{subtitle}</p>
      </div>
      <div className="p-6">
        {children}
      </div>
    </div>
  );
}
