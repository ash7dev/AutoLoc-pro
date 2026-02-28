"use client";

import { useState, useCallback, useEffect } from "react";
import dynamic from "next/dynamic";
import { CallBackProps, STATUS, Step as JoyrideStep } from "react-joyride";
import { ProfileResponse } from "@/lib/nestjs/auth";
import { useRouter } from "next/navigation";
import { ModalShell } from "@/features/shared/ModalShell";
import { PhoneVerifyGate } from "./PhoneVerifyGate";
import { KycGate } from "./KycGate";
import { WizardProgress } from "./WizardProgress";
import { StepVehicleInfo } from "./steps/StepVehicleInfo";
import { StepPricing } from "./steps/StepPricing";
import { StepConditions } from "./steps/StepConditions";
import { StepPhotos } from "./steps/StepPhotos";
import { StepDocuments } from "./steps/StepDocuments";
import { StepReview } from "./steps/StepReview";

// Lazy-load pour éviter les erreurs SSR
const StepWizard = dynamic(() => import("react-step-wizard"), { ssr: false });
const Joyride = dynamic(() => import("react-joyride"), { ssr: false });

type Gate = "phone" | "kyc" | "wizard";

function resolveGate(profile: ProfileResponse): Gate {
  if (!profile.phoneVerified) return "phone";
  const kyc = profile.kycStatus;
  if (kyc === "EN_ATTENTE" || kyc === "VERIFIE") return "wizard";
  return "kyc";
}

const JOYRIDE_STEPS: JoyrideStep[] = [
  {
    target: "[data-tour='wizard-progress']",
    content: "Suivez votre progression en 5 étapes. Vous pouvez revenir en arrière à tout moment.",
    disableBeacon: true,
    placement: "bottom",
  },
  {
    target: "[data-tour='step-form']",
    content: "Remplissez les informations de votre véhicule. Les champs marqués * sont obligatoires.",
    placement: "top",
  },
];

export function AddVehicleFlow({ profile }: { profile: ProfileResponse }) {
  const router = useRouter();
  const [kycStatus, setKycStatus] = useState(profile.kycStatus);
  const [phoneVerified, setPhoneVerified] = useState(Boolean(profile.phoneVerified && profile.phone));
  const [currentStep, setCurrentStep] = useState(1);
  const [runTour, setRunTour] = useState(false);
  const [wizardReady, setWizardReady] = useState(false);

  const handleWizardInstance = useCallback(() => {
    // react-step-wizard expects a function; we don't need the instance for now.
  }, []);

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

  useEffect(() => {
    setWizardReady(true);
  }, []);

  const handleJoyrideCallback = (data: CallBackProps) => {
    if (data.status === STATUS.FINISHED || data.status === STATUS.SKIPPED) {
      localStorage.setItem("vehicle_wizard_tour_seen", "1");
      setRunTour(false);
    }
  };

  const onPhoneVerified = useCallback(() => {
    setPhoneVerified(true);
  }, []);

  const onKycSubmitted = useCallback(() => {
    setKycStatus("EN_ATTENTE");
  }, []);

  // ── Gate : vérification téléphone ──────────────────────────────────────────
  if (effectiveGate === "phone") {
    return (
      <ModalShell
        title="Activez votre compte propriétaire"
        subtitle="Ajoutez votre numéro pour sécuriser vos futures locations."
        contentClassName="px-6 pt-6 pb-6"
        tag="Auto Loc · Propriétaire"
        onClose={() => router.push("/dashboard/owner/vehicles")}
      >
        <PhoneVerifyGate profile={profile} onVerified={onPhoneVerified} />
      </ModalShell>
    );
  }

  // ── Gate : KYC ─────────────────────────────────────────────────────────────
  if (effectiveGate === "kyc") {
    return (
      <ModalShell
        title="Vérifiez votre identité"
        subtitle="Une étape rapide pour publier votre annonce en toute confiance."
        contentClassName="px-6 pt-6 pb-6"
        tag="Auto Loc · Propriétaire"
        onClose={() => router.push("/dashboard/owner/vehicles")}
      >
        <KycGate
          kycStatus={kycStatus}
          onProceed={onKycSubmitted}
          onSubmitted={onKycSubmitted}
        />
      </ModalShell>
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

      <ModalShell
        title="Créez votre annonce"
        subtitle="Renseignez les infos clés, vos photos et publiez en quelques minutes."
        contentClassName="px-6 pt-6 pb-3"
        tag="Auto Loc · Propriétaire"
        onClose={() => router.push("/dashboard/owner/vehicles")}
      >
        <div className="flex flex-col gap-6">
          <div data-tour="wizard-progress">
            <WizardProgress currentStep={currentStep} />
          </div>

          <div
            data-tour="step-form"
            className="rounded-xl border border-[hsl(var(--border))] bg-card shadow-sm p-6 w-full"
          >
            {wizardReady && (
              <StepWizard
                instance={handleWizardInstance}
                onStepChange={({ activeStep }: { activeStep: number }) => setCurrentStep(activeStep)}
                isHashEnabled={false}
                transitions={{ enterRight: "", enterLeft: "", exitRight: "", exitLeft: "" }}
                className="w-full"
              >
                <StepVehicleInfo />
                <StepPricing />
                <StepConditions />
                <StepPhotos />
                <StepDocuments />
                <StepReview />
              </StepWizard>
            )}
          </div>
        </div>
      </ModalShell>
    </>
  );
}
