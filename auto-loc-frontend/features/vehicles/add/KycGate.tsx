"use client";

import { useState, useEffect } from "react";
import { Clock, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { KycSubmitForm } from "@/features/kyc/KycSubmitForm";

type KycStatus = "NON_VERIFIE" | "EN_ATTENTE" | "VERIFIE" | "REJETE" | undefined;

export function KycGate({
  kycStatus: initialStatus,
  onProceed,
  onSubmitted,
  pendingMode = "continue",
}: {
  kycStatus: KycStatus;
  onProceed: () => void;
  onSubmitted?: () => void;
  pendingMode?: "continue" | "block";
}) {
  const [status, setStatus] = useState<KycStatus>(initialStatus);

  useEffect(() => {
    setStatus(initialStatus);
  }, [initialStatus]);

  // ── VERIFIE → skip ─────────────────────────────────────────────────────────
  if (status === "VERIFIE") { 
    onProceed(); 
    return null; 
  }

  // ── EN_ATTENTE ─────────────────────────────────────────────────────────────
  if (status === "EN_ATTENTE") {
    return (
      <div className="flex flex-col items-center gap-8 py-12 max-w-lg mx-auto text-center">
        {/* Icon */}
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-amber-200 bg-amber-50">
          <Clock className="h-7 w-7 text-amber-500" />
        </div>

        {/* Status chip */}
        <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-300 bg-amber-50 px-3 py-1 text-[12px] font-semibold text-amber-600">
          <Clock className="h-3 w-3" />
          Vérification en cours
        </span>

        <div className="space-y-2">
          <h2 className="text-[22px] font-black tracking-tight text-slate-900">
            Documents envoyés !
          </h2>
          <p className="text-[13px] text-slate-400 leading-relaxed max-w-sm mx-auto">
            Vos documents sont en cours d'examen. Vous pouvez déjà renseigner les infos de votre véhicule.
          </p>
        </div>

        {pendingMode === "continue" ? (
          <div className="flex flex-col items-center gap-3 w-full max-w-xs">
            <button
              type="button"
              onClick={onProceed}
              className="w-full flex items-center justify-center gap-2 h-12 rounded-xl bg-slate-900 px-5 text-[13.5px] font-bold text-white shadow-sm hover:shadow-md hover:shadow-emerald-500/20 hover:-translate-y-px active:translate-y-0 transition-all"
            >
              Continuer vers le formulaire
              <ArrowRight className="h-4 w-4" />
            </button>
            <p className="text-[11px] text-slate-400">
              L'annonce ne sera visible qu'après validation KYC.
            </p>
          </div>
        ) : (
          <p className="text-[12px] text-slate-400">
            Vous pourrez réserver dès que la vérification sera validée.
          </p>
        )}
      </div>
    );
  }

  // ── NON_VERIFIE / REJETE → Render Unified KycSubmitForm with selfie step ──
  return (
    <div className="py-2">
      <KycSubmitForm 
        initialStatus={status} 
        onSubmitted={(profile) => {
          setStatus("EN_ATTENTE");
          onSubmitted?.();
        }}
      />
    </div>
  );
}
