"use client";

import React, { useEffect, useState } from "react";
import { PhoneVerifyGate } from "@/features/vehicles/add/PhoneVerifyGate";
import { KycGate } from "@/features/vehicles/add/KycGate";
import { PermisGate } from "@/features/reservations/components/PermisGate";
import type { ProfileResponse } from "@/lib/nestjs/auth";
import { ModalShell } from "@/features/shared/ModalShell";
import { apiFetch } from "@/lib/nestjs/api-client";

type Gate = "phone" | "kyc" | "permis" | "ready";

function resolveGate(profile: ProfileResponse): Gate {
  if (!profile.hasUtilisateur) return "phone";
  if (!profile.phoneVerified || !profile.phone) return "phone";
  const kyc = profile.kycStatus;
  if (kyc !== "VERIFIE") return "kyc";
  if (!profile.hasPermis) return "permis";
  return "ready";
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
  const [currentProfile, setCurrentProfile] = useState<ProfileResponse | null>(profile);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (open) setCurrentProfile(profile);
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

  return (
    <ModalShell
      title={
        gate === "phone" ? "Vérifiez votre téléphone" :
          gate === "kyc" ? "Vérifiez votre identité" :
            "Permis de conduire requis"
      }
      subtitle={
        gate === "phone" ? "Étape requise pour sécuriser votre réservation." :
          gate === "kyc" ? "Votre KYC doit être validé pour réserver." :
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
          pendingMode="block"
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
