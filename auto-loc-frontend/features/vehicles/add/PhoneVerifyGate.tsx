"use client";

import { useState, useEffect, useRef } from "react";
import { CheckCircle2, Loader2, ArrowRight } from "lucide-react";
import { DateInput } from "@/features/shared/DateInput";
import { ApiError } from "@/lib/nestjs/api-client";
import { useAuthFetch } from "@/features/auth/hooks/use-auth-fetch";
import type { ProfileResponse } from "@/lib/nestjs/auth";
import { cn } from "@/lib/utils";
import { PhoneField } from "@/components/ui/phone-field";

type Stage = "intro" | "otp" | "success";

/* ─────────────────────────────────────────────────────────────────────────────
   FIELD WRAPPER
───────────────────────────────────────────────────────────────────────────── */
function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-[11px] font-black uppercase tracking-[0.14em] text-slate-500">
        {label}
        {required && <span className="text-red-400 ml-1">*</span>}
      </label>
      {children}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   MAIN COMPONENT
───────────────────────────────────────────────────────────────────────────── */
export function PhoneVerifyGate({
  profile,
  onVerified,
  initialStage = "intro",
}: {
  profile: ProfileResponse;
  onVerified: () => void;
  initialStage?: Stage;
}) {
  const [stage, setStage] = useState<Stage>(initialStage);
  const [phone, setPhone] = useState(profile.phone ?? "");
  const [prenom, setPrenom] = useState("");
  const [nom, setNom] = useState("");
  const [dateNaissance, setDateNaissance] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { authFetch } = useAuthFetch();

  useEffect(() => {
    setPhone(profile.phone ?? "");
    setPrenom(profile.prenom ?? "");
    setNom(profile.nom ?? "");
    setDateNaissance(profile.dateNaissance ?? "");
  }, [profile.phone, profile.prenom, profile.nom, profile.dateNaissance]);

  const needsProfile = !profile.hasUtilisateur;
  const canSubmit = phone.trim().length > 0
    && (!needsProfile || (prenom.trim() && nom.trim() && dateNaissance));

  const [otpValues, setOtpValues] = useState<string[]>(Array(6).fill(''));
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleOtpInputChange = (index: number, value: string) => {
    if (value.length > 1) {
      const digits = value.replace(/\D/g, '').slice(0, 6);
      if (digits.length >= 2) {
        const newValues = Array(6).fill('');
        for (let i = 0; i < digits.length && i < 6; i++) {
          newValues[i] = digits[i];
        }
        setOtpValues(newValues);
        const nextFocus = Math.min(digits.length, 5);
        inputRefs.current[nextFocus]?.focus();
        if (digits.length === 6) handleVerifyOtp(digits);
        return;
      }
    }
    if (!/^\d*$/.test(value)) return;
    const newOtpValues = [...otpValues];
    newOtpValues[index] = value.slice(-1);
    setOtpValues(newOtpValues);
    setError(null);
    if (value && index < 5) inputRefs.current[index + 1]?.focus();
    const code = newOtpValues.join('');
    if (code.length === 6 && !newOtpValues.some(v => v === '')) handleVerifyOtp(code);
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpValues[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (!pasted) return;
    const newValues = Array(6).fill('');
    for (let i = 0; i < pasted.length && i < 6; i++) {
      newValues[i] = pasted[i];
    }
    setOtpValues(newValues);
    const nextFocus = Math.min(pasted.length, 5);
    inputRefs.current[nextFocus]?.focus();
    if (pasted.length === 6) handleVerifyOtp(pasted);
  };

  const handleConfirm = async () => {
    const normalized = phone.replace(/\s/g, '');
    if (!normalized || normalized.length < 8) {
      setError("Saisissez un numéro de téléphone valide.");
      return;
    }
    if (needsProfile && (!prenom.trim() || !nom.trim() || !dateNaissance)) {
      setError("Tous les champs obligatoires doivent être remplis.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      if (needsProfile) {
        await authFetch("/auth/complete-profile", {
          method: "POST",
          body: { prenom: prenom.trim(), nom: nom.trim(), telephone: normalized, dateNaissance },
        });
        await authFetch("/auth/phone/send-otp", { method: "POST" });
      } else {
        await authFetch("/auth/phone/update", {
          method: "POST",
          body: { telephone: normalized },
        });
      }
      setStage("otp");
    } catch (err) {
      setError(
        err instanceof ApiError 
          ? (err.message || "Impossible d’envoyer le code de vérification.")
          : "Connexion impossible. Réessayez dans un instant."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (codeToVerify: string) => {
    if (codeToVerify.length !== 6) {
      setError("Le code doit contenir 6 chiffres.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await authFetch("/auth/phone/verify-otp", {
        method: "POST",
        body: { code: codeToVerify },
      });
      setStage("success");
      setTimeout(onVerified, 1200);
    } catch (err) {
      setError(
        err instanceof ApiError 
          ? (err.message || "Le code saisi est incorrect ou expiré.") 
          : "Connexion impossible. Réessayez dans un instant."
      );
      setOtpValues(Array(6).fill(''));
      inputRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  /* ── Success ── */
  if (stage === "success") {
    return (
      <div className="flex flex-col items-center gap-4 py-14 text-center">
        <div className="w-16 h-16 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center">
          <CheckCircle2 className="w-8 h-8 text-emerald-500" strokeWidth={1.75} />
        </div>
        <div>
          <p className="text-[15px] font-black text-slate-900">Téléphone vérifié</p>
          <p className="text-[12.5px] text-slate-400 mt-1">Redirection en cours…</p>
        </div>
      </div>
    );
  }

  /* ── OTP Stage ── */
  if (stage === "otp") {
    const isFilled = !otpValues.some(v => v === '');
    return (
      <div className="space-y-4">
        <div className="text-center mb-6">
          <p className="text-[13.5px] font-medium text-slate-700">
            Un code à 6 chiffres a été envoyé par WhatsApp (ou SMS) au :
          </p>
          <p className="text-[15px] font-black text-slate-900 mt-1">
            {phone}
          </p>
        </div>

        <Field label="Code de vérification" required>
          <div className="flex justify-between gap-2 sm:gap-3">
            {otpValues.map((value, index) => (
              <input
                key={index}
                ref={(el) => { inputRefs.current[index] = el; }}
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={1}
                value={value}
                onChange={(e) => handleOtpInputChange(index, e.target.value)}
                onKeyDown={(e) => handleOtpKeyDown(index, e)}
                onPaste={handleOtpPaste}
                className={cn(
                  "w-full h-12 text-center text-xl font-black rounded-xl border-2 transition-all outline-none",
                  value
                    ? "border-emerald-500 bg-emerald-50/30 text-emerald-700 shadow-[0_0_15px_rgba(16,185,129,0.1)]"
                    : "border-slate-100 bg-slate-50 text-slate-900 focus:border-slate-300 focus:bg-white",
                  error && "border-red-200 bg-red-50 text-red-600"
                )}
                autoFocus={index === 0}
              />
            ))}
          </div>
        </Field>

        {error && (
          <div className="px-4 py-2.5 rounded-xl bg-red-50 border border-red-100 mt-4">
            <p className="text-[12px] font-semibold text-red-600">{error}</p>
          </div>
        )}

        <button
          type="button"
          onClick={() => handleVerifyOtp(otpValues.join(''))}
          disabled={loading || !isFilled}
          className={cn(
            "w-full flex items-center justify-center gap-2 h-12 rounded-xl text-[13.5px] font-bold transition-all duration-200 mt-6",
            isFilled && !loading
              ? "bg-slate-900 hover:bg-emerald-500 text-white shadow-sm hover:shadow-md hover:shadow-emerald-500/20"
              : "bg-slate-100 text-slate-400 cursor-not-allowed",
          )}
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Vérifier le code"}
        </button>

        <button
          type="button"
          onClick={() => { setStage("intro"); setOtpValues(Array(6).fill('')); setError(null); }}
          className="w-full text-[12.5px] font-semibold text-slate-500 hover:text-slate-800 transition-colors py-2"
        >
          Modifier le numéro
        </button>
      </div>
    );
  }

  /* ── Form (Intro) ── */
  return (
    <div className="space-y-4">

      {/* Nom / Prénom — uniquement si profil non créé */}
      {needsProfile && (
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Prénom" required>
            <input
              type="text"
              value={prenom}
              onChange={e => { setPrenom(e.target.value); setError(null); }}
              placeholder="Moussa"
              className={cn(
                "w-full h-12 rounded-xl border bg-white px-4 text-[13.5px] text-slate-800 outline-none transition-all",
                "placeholder:text-slate-400",
                "focus:ring-4 focus:ring-emerald-400/5 focus:border-emerald-400",
                (error && !prenom.trim()) ? "border-red-300" : "border-slate-200 hover:border-slate-300"
              )}
            />
          </Field>
          <Field label="Nom" required>
            <input
              type="text"
              value={nom}
              onChange={e => { setNom(e.target.value); setError(null); }}
              placeholder="Diallo"
              className={cn(
                "w-full h-12 rounded-xl border bg-white px-4 text-[13.5px] text-slate-800 outline-none transition-all",
                "placeholder:text-slate-400",
                "focus:ring-4 focus:ring-emerald-400/5 focus:border-emerald-400",
                (error && !nom.trim()) ? "border-red-300" : "border-slate-200 hover:border-slate-300"
              )}
            />
          </Field>
        </div>
      )}

      {/* Date de naissance */}
      {needsProfile && (
        <DateInput 
          label="Date de naissance"
          required
          value={dateNaissance}
          onChange={v => { setDateNaissance(v); setError(null); }}
          error={!!error && !dateNaissance}
        />
      )}

      {/* Téléphone */}
      <Field label="Numéro de téléphone" required>
        <PhoneField
          value={phone}
          onChange={v => { setPhone(v); setError(null); }}
          disabled={loading}
          error={Boolean(error)}
        />
      </Field>

      {/* Error */}
      {error && (
        <div className="px-4 py-2.5 rounded-xl bg-red-50 border border-red-100">
          <p className="text-[12px] font-semibold text-red-600">{error}</p>
        </div>
      )}

      {/* CTA */}
      <button
        type="button"
        onClick={handleConfirm}
        disabled={loading || !canSubmit}
        className={cn(
          "w-full flex items-center justify-center gap-2 h-12 rounded-xl text-[13.5px] font-bold transition-all duration-200",
          canSubmit && !loading
            ? "bg-slate-900 hover:bg-emerald-500 text-white shadow-sm hover:shadow-md hover:shadow-emerald-500/20 hover:-translate-y-px active:translate-y-0"
            : "bg-slate-100 text-slate-400 cursor-not-allowed",
        )}
      >
        {loading
          ? <Loader2 className="w-4 h-4 animate-spin" />
          : <ArrowRight className="w-4 h-4" strokeWidth={2.5} />
        }
        Continuer
      </button>
    </div>
  );
}
