"use client";

import React, { useEffect } from "react";
import { PhoneVerifyGate } from "@/features/vehicles/add/PhoneVerifyGate";
import { KycGate } from "@/features/vehicles/add/KycGate";
import type { ProfileResponse } from "@/lib/nestjs/auth";
import { ModalShell } from "@/features/shared/ModalShell";

type Gate = "phone" | "kyc" | "ready";

function resolveGate(profile: ProfileResponse): Gate {
  if (!profile.phoneVerified || !profile.phone) return "phone";
  const kyc = profile.kycStatus;
  if (kyc === "VERIFIE") return "ready";
  return "kyc";
}

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
  if (!open || !profile) return null;

  const gate = resolveGate(profile);

  if (gate === "ready") {
    onProceed();
    onOpenChange(false);
    return null;
  }

  return (
    <ModalShell
      title={gate === "phone" ? "Vérifiez votre téléphone" : "Vérifiez votre identité"}
      subtitle={gate === "phone"
        ? "Étape requise pour sécuriser votre réservation."
        : "Votre KYC doit être validé pour réserver."}
      tag="Auto Loc · Locataire"
      onClose={() => onOpenChange(false)}
      contentClassName="px-6 pt-6 pb-6"
    >
      {gate === "phone" && (
        <PhoneVerifyGate
          profile={profile}
          onVerified={() => onOpenChange(false)}
        />
      )}

      {gate === "kyc" && (
        <KycGate
          kycStatus={profile.kycStatus}
          onProceed={() => onOpenChange(false)}
          onSubmitted={() => onOpenChange(false)}
          pendingMode="block"
        />
      )}
    </ModalShell>
  );
}
