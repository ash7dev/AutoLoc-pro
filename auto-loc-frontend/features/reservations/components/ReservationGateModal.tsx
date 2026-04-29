"use client";

import React, { useEffect, useState } from "react";
import {
  Check, Clock, AlertCircle, Circle,
  Phone, ShieldCheck, CreditCard, X, ArrowRight, CalendarDays, User
} from "lucide-react";
import { PhoneVerifyGate } from "@/features/vehicles/add/PhoneVerifyGate";
import { KycGate } from "@/features/vehicles/add/KycGate";
import { PermisGate } from "@/features/reservations/components/PermisGate";
import type { ProfileResponse } from "@/lib/nestjs/auth";
import { ModalShell } from "@/features/shared/ModalShell";
import { apiFetch } from "@/lib/nestjs/api-client";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";
import { DateInput } from "@/features/shared/DateInput";

/* ── Types ───────────────────────────────────────────────── */
type Gate = "phone" | "kyc" | "permis" | "age" | "age_phone" | "create_profile" | "ready";
type StepStatus = "done" | "pending" | "rejected" | "required";

interface Step {
  key: "phone" | "kyc" | "permis" | "age";
  label: string;
  description: string;
  duration?: string;
  status: StepStatus;
  icon: React.ElementType;
}

/* ── Helpers ─────────────────────────────────────────────── */
function resolveGate(profile: ProfileResponse, ageMinimum?: number, userAge?: number): Gate {
  // Profil métier absent ou identité de base incomplète.
  // La date de naissance est gérée plus bas par les gates d'âge dédiées.
  const isProfileIncomplete = !profile.hasUtilisateur || !profile.prenom || !profile.nom;
  
  if (isProfileIncomplete) return "create_profile";

  const phoneMissing = !profile.phoneVerified || !profile.phone;

  // Vérification âge si requis
  if (ageMinimum && ageMinimum > 0) {
    const ageDateMissing = !profile.dateNaissance;
    const ageInsuffisant = !ageDateMissing && userAge !== undefined && userAge < ageMinimum;

    if (ageDateMissing) {
      // Âge inconnu : combiner avec tél si aussi manquant
      if (phoneMissing) return "age_phone"; // date + tél dans un seul formulaire
      return "age"; // date uniquement
    }

    if (ageInsuffisant) return "age"; // bloquant — affiché comme AgeInsufficientBlock
  }

  // Téléphone → flux OTP
  if (phoneMissing) return "phone";

  // KYC
  const kyc = profile.kycStatus;
  if (!kyc || kyc === "NON_VERIFIE" || kyc === "REJETE") return "kyc";

  // Permis
  if (!profile.hasPermis) return "permis";

  return "ready";
}

function resolveSteps(profile: ProfileResponse, ageMinimum?: number, userAge?: number): Step[] {
  const phoneOk = profile.hasUtilisateur && profile.phoneVerified && !!profile.phone;
  const profileOk = profile.hasUtilisateur && !!profile.prenom && !!profile.nom;
  const kyc = profile.kycStatus;
  const kycStatus: StepStatus =
    kyc === "VERIFIE" ? "done"
      : kyc === "EN_ATTENTE" ? "pending"
        : kyc === "REJETE" ? "rejected"
          : "required";
  const permisOk = profile.hasPermis;
  
  // Vérification statut âge (uniquement si requis)
  let ageStatus: StepStatus = "done";
  if (ageMinimum && ageMinimum > 0) {
    if (!profile.dateNaissance) {
      ageStatus = "required";
    } else if (userAge && userAge < ageMinimum) {
      ageStatus = "rejected";
    }
  }

  // Construction des étapes selon le contexte
  const steps: Step[] = [];

  // Étape âge (uniquement si requis)
  if (ageMinimum && ageMinimum > 0) {
    steps.push({
      key: "age" as const,
      label: "Âge minimum vérifié",
      description: !profile.dateNaissance 
        ? "Veuillez renseigner votre date de naissance"
        : userAge && userAge < ageMinimum
          ? `Âge minimum requis : ${ageMinimum} ans`
          : "Âge vérifié avec succès",
      duration: "~30 sec",
      status: ageStatus,
      icon: CalendarDays,
    });
  }

  // Étapes téléphone/profil (toujours affiché si profil incomplet)
  if (!profileOk || !phoneOk) {
    steps.push({
      key: "phone",
      label: profileOk ? "Téléphone vérifié" : "Profil & Téléphone",
      description: profileOk
        ? "Confirmez votre numéro de téléphone"
        : "Prénom, nom, date de naissance et numéro de téléphone",
      duration: profileOk ? "~1 min" : "~2 min",
      status: (profileOk && phoneOk) ? "done" : "required",
      icon: Phone,
    });
  }

  // Étapes KYC (uniquement si âge OK ou non requis)
  if (!ageMinimum || ageMinimum <= 0 || (profile.dateNaissance && (!userAge || userAge >= ageMinimum))) {
    steps.push({
      key: "kyc",
      label: "Vérification d'identité",
      description: "Pièce d'identité nationale ou passeport",
      duration: "~2 min",
      status: kycStatus,
      icon: ShieldCheck,
    });
  }

  // Étapes permis (uniquement si âge OK ou non requis)
  if (!ageMinimum || ageMinimum <= 0 || (profile.dateNaissance && (!userAge || userAge >= ageMinimum))) {
    steps.push({
      key: "permis",
      label: "Permis de conduire",
      description: "Photo recto-verso de votre permis en cours de validité",
      duration: "~1 min",
      status: permisOk ? "done" : "required",
      icon: CreditCard,
    });
  }

  return steps;
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
      className="fixed inset-0 z-[200] flex items-center justify-center bg-black/40 backdrop-blur-[2px] px-4 animate-in fade-in duration-200"
      onClick={onCancel}
    >
      <div
        className="w-full sm:max-w-md flex flex-col overflow-hidden rounded-2xl border border-slate-200/60 bg-white shadow-[0_24px_64px_rgba(0,0,0,0.22)] animate-in zoom-in-95 duration-250"
        onClick={e => e.stopPropagation()}
      >

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

/* ── Age Insufficient — Scénario 3 ──────────────────────── */
function AgeInsufficientBlock({ ageMinimum, userAge, onClose }: {
  ageMinimum: number;
  userAge: number;
  onClose: () => void;
}) {
  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-red-200 bg-red-50 p-4">
        <div className="flex items-start gap-3">
          <div className="w-7 h-7 rounded-lg bg-red-100 flex items-center justify-center flex-shrink-0 mt-0.5">
            <AlertCircle className="w-3.5 h-3.5 text-red-600" strokeWidth={2} />
          </div>
          <div>
            <p className="text-[12.5px] font-bold text-red-800">Âge minimum requis</p>
            <p className="text-[11.5px] text-red-700 mt-0.5 leading-relaxed">
              Ce véhicule nécessite <strong>{ageMinimum} ans minimum</strong>.
              Vous avez actuellement <strong>{userAge} ans</strong>.
            </p>
          </div>
        </div>
      </div>
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
        <div className="flex items-start gap-3">
          <div className="w-7 h-7 rounded-lg bg-amber-100 flex items-center justify-center flex-shrink-0 mt-0.5">
            <CalendarDays className="w-3.5 h-3.5 text-amber-600" strokeWidth={2} />
          </div>
          <div>
            <p className="text-[12.5px] font-bold text-amber-800">Suggestion</p>
            <p className="text-[11.5px] text-amber-700 mt-0.5 leading-relaxed">
              Découvrez nos véhicules disponibles pour les conducteurs de {userAge} ans.
            </p>
          </div>
        </div>
      </div>
      <button
        onClick={onClose}
        className="w-full flex items-center justify-center gap-2 rounded-xl bg-slate-900 hover:bg-slate-800
          text-white text-[13.5px] font-bold py-3 px-5 transition-all duration-200"
      >
        Retour à la recherche
        <ArrowRight className="w-4 h-4" strokeWidth={2.5} />
      </button>
    </div>
  );
}

/* ── CreateProfileGate — identité uniquement, pas d'OTP ici ─ */
function CreateProfileGate({ profile, onComplete }: { profile: ProfileResponse, onComplete: (otpSent?: boolean) => void }) {
  const [form, setForm] = useState({
    prenom: profile.prenom || '',
    nom: profile.nom || '',
    dateNaissance: profile.dateNaissance?.split('T')[0] || '',
    phone: profile.phone || '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.prenom.trim() || !form.nom.trim() || !form.phone.trim() || !form.dateNaissance) {
      setError('Veuillez remplir tous les champs obligatoires.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await apiFetch('/auth/complete-profile', {
        method: 'POST',
        body: {
          prenom: form.prenom.trim(),
          nom: form.nom.trim(),
          telephone: form.phone.trim(),
          dateNaissance: form.dateNaissance || undefined,
        },
      });
      // Envoi OTP immédiat en arrière-plan — ne bloque pas l'UI
      // PhoneVerifyGate s'ouvrira directement sur les cases de code
      let otpSent = false;
      try {
        await apiFetch('/auth/phone/send-otp', { method: 'POST' });
        otpSent = true;
      } catch {
        // Si échec (ex: cooldown), PhoneVerifyGate gère le renvoi
      }
      onComplete(otpSent);
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la création du profil.');
    } finally {
      setLoading(false);
    }
  };

  const field = (label: string, icon: React.ElementType, inputProps: React.InputHTMLAttributes<HTMLInputElement>) => (
    <div className="space-y-1.5">
      <label className="block text-[12px] font-bold text-slate-700 ml-1">{label}</label>
      <div className="relative group">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors">
          {React.createElement(icon, { size: 16 })}
        </div>
        <input
          {...inputProps}
          className="w-full h-11 rounded-xl border border-slate-200 bg-white pl-11 pr-4
            text-[13px] font-medium text-slate-800 placeholder-slate-300
            focus:border-emerald-400 focus:outline-none focus:ring-4 focus:ring-emerald-400/5 transition-all"
        />
      </div>
    </div>
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        {field('Prénom *', User, {
          type: 'text', required: true, value: form.prenom,
          placeholder: 'Ex: Amadou',
          autoFocus: true,
          onChange: e => setForm(p => ({ ...p, prenom: e.target.value })),
        })}
        {field('Nom *', User, {
          type: 'text', required: true, value: form.nom,
          placeholder: 'Ex: Diop',
          onChange: e => setForm(p => ({ ...p, nom: e.target.value })),
        })}
      </div>

      <DateInput
        label="Date de naissance *"
        required
        value={form.dateNaissance}
        onChange={v => setForm(p => ({ ...p, dateNaissance: v }))}
        error={!!error && !form.dateNaissance}
      />

      {field('Téléphone *', Phone, {
        type: 'tel', required: true, value: form.phone,
        placeholder: '+221 77 000 00 00',
        onChange: e => setForm(p => ({ ...p, phone: e.target.value })),
      })}

      {error && (
        <div className="rounded-xl border border-red-100 bg-red-50/50 p-3">
          <p className="text-[11.5px] font-medium text-red-600">{error}</p>
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className={cn(
          "w-full flex items-center justify-center gap-2 h-12 rounded-xl text-[14px] font-bold transition-all duration-200 mt-1",
          !loading
            ? "bg-slate-900 hover:bg-emerald-500 text-white shadow-sm hover:shadow-md hover:shadow-emerald-500/20"
            : "bg-slate-100 text-slate-400 cursor-not-allowed"
        )}
      >
        {loading
          ? <><Loader2 className="w-4 h-4 animate-spin" />Création…</>
          : <>Créer mon profil <ArrowRight className="w-4 h-4" strokeWidth={2.5} /></>}
      </button>
    </form>
  );
}

/* ── AgePhoneGate — date + téléphone en un seul formulaire ─── */
function AgePhoneGate({ ageMinimum, onComplete }: { ageMinimum: number; onComplete: () => void }) {
  const [dateNaissance, setDateNaissance] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation âge côté client
    const birthDate = new Date(dateNaissance);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--;
    if (age < ageMinimum) {
      setError(`Âge minimum requis : ${ageMinimum} ans. Vous avez ${age} ans.`);
      return;
    }

    setLoading(true);
    setError('');
    try {
      await apiFetch('/users/me/profile', {
        method: 'PATCH',
        body: { dateNaissance: birthDate.toISOString().split('T')[0] },
      });
      await apiFetch('/auth/phone/update', {
        method: 'POST',
        body: { telephone: phone },
      });
      onComplete();
    } catch {
      setError('Erreur lors de la mise à jour. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <DateInput 
        label="Date de naissance *"
        required
        value={dateNaissance}
        onChange={v => { setDateNaissance(v); setError(''); }}
        error={!!error}
      />

      <div className="space-y-1.5">
        <label className="block text-[12px] font-bold text-slate-700 ml-1">
          Numéro de téléphone *
        </label>
        <input
          type="tel"
          value={phone}
          onChange={e => setPhone(e.target.value)}
          placeholder="+221 77 000 00 00"
          required
          className="w-full h-11 rounded-xl border border-slate-200 bg-white px-4
            text-[13px] font-medium text-slate-800 placeholder-slate-300
            focus:border-emerald-400 focus:outline-none focus:ring-4 focus:ring-emerald-400/5 transition-all"
        />
      </div>

      {error && (
        <div className="rounded-xl border border-red-100 bg-red-50/50 p-3">
          <p className="text-[11.5px] font-medium text-red-600">{error}</p>
        </div>
      )}

      <button
        type="submit"
        disabled={loading || !dateNaissance || !phone}
        className={cn(
          "w-full flex items-center justify-center gap-2 h-12 rounded-xl text-[14px] font-bold transition-all duration-200 mt-2",
          (!loading && dateNaissance && phone)
            ? "bg-slate-900 hover:bg-emerald-500 text-white shadow-sm hover:shadow-md hover:shadow-emerald-500/20"
            : "bg-slate-100 text-slate-400 cursor-not-allowed"
        )}
      >
        {loading
          ? <><Loader2 className="w-4 h-4 animate-spin" />Enregistrement…</>
          : <>Confirmer<ArrowRight className="w-4 h-4" strokeWidth={2.5} /></>}
      </button>
    </form>
  );
}

/* ── AgeGate — date de naissance uniquement (Scénario 4) ─── */
function AgeGate({ onProceed, ageMinimum }: { onProceed: () => void; ageMinimum: number; }) {
  const [dateNaissance, setDateNaissance] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const birthDate = new Date(dateNaissance);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--;
    if (age < ageMinimum) {
      setError(`Âge minimum requis : ${ageMinimum} ans. Vous avez ${age} ans.`);
      return;
    }
    setLoading(true);
    try {
      await apiFetch('/users/me/profile', {
        method: 'PATCH',
        body: { dateNaissance: birthDate.toISOString().split('T')[0] },
      });
      onProceed();
    } catch {
      setError('Erreur lors de la mise à jour. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <DateInput 
        label="Date de naissance *"
        required
        value={dateNaissance}
        onChange={v => { setDateNaissance(v); setError(''); }}
        error={!!error}
      />

      {error && (
        <div className="rounded-xl border border-red-100 bg-red-50/50 p-3">
          <p className="text-[11.5px] font-medium text-red-600">{error}</p>
        </div>
      )}

      <button
        type="submit"
        disabled={loading || !dateNaissance}
        className={cn(
          "w-full flex items-center justify-center gap-2 h-12 rounded-xl text-[14px] font-bold transition-all duration-200 mt-2",
          (!loading && dateNaissance)
            ? "bg-slate-900 hover:bg-emerald-500 text-white shadow-sm hover:shadow-md hover:shadow-emerald-500/20"
            : "bg-slate-100 text-slate-400 cursor-not-allowed"
        )}
      >
        {loading
          ? <><Loader2 className="w-4 h-4 animate-spin" />Vérification…</>
          : <>Confirmer mon âge<ArrowRight className="w-4 h-4" strokeWidth={2.5} /></>}
      </button>
    </form>
  );
}

/* ── Main export ─────────────────────────────────────────── */
export function ReservationGateModal({
  open,
  onOpenChange,
  profile,
  onProceed,
  ageMinimum,
  userAge,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  profile: ProfileResponse | null;
  onProceed: () => void;
  ageMinimum?: number;
  userAge?: number;
}) {
  const [currentProfile, setCurrentProfile] = useState<ProfileResponse | null>(profile);
  const [refreshing, setRefreshing] = useState(false);
  const [preGateDismissed, setPreGateDismissed] = useState(false);
  const [phoneOtpPreSent, setPhoneOtpPreSent] = useState(false);

  useEffect(() => {
    if (open) {
      setCurrentProfile(profile);
      setPreGateDismissed(false);
      setPhoneOtpPreSent(false);
    }
  }, [open, profile]);

  const refreshProfile = async (otpSent?: boolean) => {
    if (refreshing) return;
    setRefreshing(true);
    if (otpSent) setPhoneOtpPreSent(true);
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

  const gate = resolveGate(currentProfile, ageMinimum, userAge);

  // Scénario 5 : Profil parfait → pas de modal, redirection immédiate
  if (gate === "ready") {
    onProceed();
    onOpenChange(false);
    return null;
  }

  // Scénario 3 : Âge insuffisant (profil complet, âge connu mais trop jeune)
  if (gate === "age" && currentProfile.dateNaissance && userAge !== undefined && ageMinimum && userAge < ageMinimum) {
    return (
      <ModalShell
        title="Âge minimum requis"
        subtitle={`Ce véhicule nécessite ${ageMinimum} ans minimum.`}
        tag="Auto Loc · Locataire"
        onClose={() => onOpenChange(false)}
        contentClassName="px-6 pt-6 pb-6"
      >
        <AgeInsufficientBlock
          ageMinimum={ageMinimum}
          userAge={userAge}
          onClose={() => onOpenChange(false)}
        />
      </ModalShell>
    );
  }

  // Scénarios 1, 2, 4 : Vue d'ensemble d'abord (PreGate)
  if (!preGateDismissed) {
    return (
      <PreGateOverlay
        steps={resolveSteps(currentProfile, ageMinimum, userAge)}
        onContinue={() => setPreGateDismissed(true)}
        onCancel={() => onOpenChange(false)}
      />
    );
  }

  // Formulaire de la gate active (stepper)
  return (
    <ModalShell
      title={
        gate === "create_profile" ? "Créez votre profil" :
        gate === "age_phone" ? "Informations requises" :
        gate === "age" ? "Vérification de l'age" :
        gate === "phone" ? "Vérifiez votre téléphone" :
        gate === "kyc" ? "Vérifiez votre identité" :
        gate === "permis" ? "Permis de conduire requis" :
        "Complétez votre profil"
      }
      subtitle={
        gate === "create_profile" ? "Prénom, nom, date de naissance et téléphone." :
        gate === "age_phone" ? `Ce véhicule nécessite ${ageMinimum} ans minimum — renseignez votre date de naissance et votre numéro.` :
        gate === "age" ? `Ce véhicule nécessite un âge minimum de ${ageMinimum} ans.` :
        gate === "phone" ? "Étape requise pour sécuriser votre réservation." :
        gate === "kyc" ? "Soumettez vos documents pour continuer — la validation se fait en parallèle." :
        gate === "permis" ? "Une photo de votre permis est nécessaire." :
        "Finalisez votre profil pour continuer."
      }
      tag="Auto Loc · Locataire"
      onClose={() => onOpenChange(false)}
      contentClassName="px-6 pt-6 pb-6"
    >
      {refreshing ? (
        <div className="flex flex-col items-center justify-center py-12 space-y-4">
          <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
          <p className="text-[13px] font-medium text-slate-500">Mise à jour du profil...</p>
        </div>
      ) : (
        <>
          {/* Pas d'utilisateur : formulaire complet (prénom + nom + date + tél) */}
          {gate === "create_profile" && (
            <CreateProfileGate profile={currentProfile} onComplete={refreshProfile} />
          )}

          {/* Âge + téléphone manquants : date + tél dans un seul formulaire */}
          {gate === "age_phone" && (
            <AgePhoneGate
              ageMinimum={ageMinimum || 18}
              onComplete={refreshProfile}
            />
          )}

          {/* Scénario 4 : Âge manquant uniquement → 1 seul input */}
          {gate === "age" && (
            <AgeGate
              onProceed={refreshProfile}
              ageMinimum={ageMinimum || 18}
            />
          )}

          {/* Téléphone seul manquant → flux OTP premium */}
          {gate === "phone" && (
            <PhoneVerifyGate
              profile={currentProfile}
              onVerified={refreshProfile}
              initialStage={phoneOtpPreSent ? "otp" : "intro"}
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
        </>
      )}
    </ModalShell>
  );
}
