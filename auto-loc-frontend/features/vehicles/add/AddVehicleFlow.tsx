"use client";

import { useState, useCallback, useEffect } from "react";
import dynamic from "next/dynamic";
import { CallBackProps, STATUS, Step as JoyrideStep } from "react-joyride";
import { ProfileResponse } from "@/lib/nestjs/auth";
import { useRouter } from "next/navigation";
import { ArrowLeft, Sparkles } from "lucide-react";
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

  // ── Gate : vérification téléphone ──────────────────────────────────────────
  if (effectiveGate === "phone") {
    return (
      <PageShell onBack={() => router.push("/dashboard/owner/vehicles")}>
        <div className="max-w-xl mx-auto">
          <GateCard
            title="Activez votre compte propriétaire"
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
