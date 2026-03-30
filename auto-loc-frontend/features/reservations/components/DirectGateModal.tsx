"use client";

import React, { useState, useEffect } from "react";
import {
  Check, Clock, AlertCircle, Circle,
  Phone, ShieldCheck, CreditCard, X, ArrowRight, CalendarDays, User,
} from "lucide-react";
import { apiFetch } from "@/lib/nestjs/api-client";
import { cn } from "@/lib/utils";
import { ModalShell } from "@/features/shared/ModalShell";
import type { ProfileResponse } from "@/lib/nestjs/auth";

/* ── Types ───────────────────────────────────────────────── */
type GateState = 
  | { type: 'ready' }
  | { type: 'age_insufficient'; ageMinimum: number; userAge: number }
  | { type: 'missing'; missing: ('profile' | 'phone' | 'age' | 'kyc' | 'permis')[] };

interface Step {
  key: 'profile' | 'phone' | 'age' | 'kyc' | 'permis';
  label: string;
  description: string;
  duration?: string;
  status: 'done' | 'pending' | 'rejected' | 'required';
  icon: React.ElementType;
}

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  profile: ProfileResponse | null;
  ageMinimum?: number;
  onProceed: () => void;
}

/* ── Helpers ─────────────────────────────────────────────── */
function calculateAge(dateStr: string): number {
  const birth = new Date(dateStr);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return age;
}

function resolveDirectGate(profile: ProfileResponse, ageMinimum?: number): GateState {
  const missing: ('profile' | 'phone' | 'age' | 'kyc' | 'permis')[] = [];
  
  // 1. Profil de base
  if (!profile.hasUtilisateur) {
    missing.push('profile');
  }
  
  // 2. Téléphone
  if (!profile.phoneVerified || !profile.phone) {
    missing.push('phone');
  }
  
  // 3. Âge (si requis)
  if (ageMinimum && ageMinimum > 0) {
    if (!profile.dateNaissance) {
      missing.push('age');
    } else {
      const userAge = calculateAge(profile.dateNaissance);
      if (userAge < ageMinimum) {
        return { type: 'age_insufficient', ageMinimum, userAge };
      }
    }
  }
  
  // 4. KYC
  const kyc = profile.kycStatus;
  if (!kyc || kyc === "NON_VERIFIE" || kyc === "REJETE") {
    missing.push('kyc');
  }
  
  // 5. Permis
  if (!profile.hasPermis) {
    missing.push('permis');
  }
  
  if (missing.length === 0) {
    return { type: 'ready' };
  }
  
  return { type: 'missing', missing };
}

function resolveSteps(profile: ProfileResponse, missing: string[], ageMinimum?: number): Step[] {
  const phoneOk = profile.hasUtilisateur && profile.phoneVerified && !!profile.phone;
  const kyc = profile.kycStatus;
  const kycStatus: 'done' | 'pending' | 'rejected' | 'required' =
    kyc === "VERIFIE" ? "done"
      : kyc === "EN_ATTENTE" ? "pending"
        : kyc === "REJETE" ? "rejected"
          : "required";
  const permisOk = profile.hasPermis;
  
  // Vérification statut âge (uniquement si requis)
  let ageStatus: 'done' | 'pending' | 'rejected' | 'required' = "done";
  if (ageMinimum && ageMinimum > 0) {
    if (!profile.dateNaissance) {
      ageStatus = "required";
    } else {
      const userAge = calculateAge(profile.dateNaissance);
      if (userAge < ageMinimum) {
        ageStatus = "rejected";
      }
    }
  }

  // Construction des étapes
  const steps: Step[] = [];

  // Étape profil (uniquement si manquant)
  if (missing.includes('profile')) {
    steps.push({
      key: "profile",
      label: "Profil complété",
      description: "Prénom, nom, date de naissance et numéro de téléphone",
      duration: "~2 min",
      status: "required",
      icon: CalendarDays,
    });
  }

  // Étape âge (uniquement si requis et manquant)
  if (ageMinimum && ageMinimum > 0 && missing.includes('age')) {
    steps.push({
      key: "age",
      label: "Âge minimum vérifié",
      description: "Veuillez renseigner votre date de naissance",
      duration: "~30 sec",
      status: ageStatus,
      icon: CalendarDays,
    });
  }

  // Étape téléphone (uniquement si manquant)
  if (missing.includes('phone')) {
    steps.push({
      key: "phone",
      label: "Téléphone vérifié",
      description: profile.hasUtilisateur
        ? "Confirmez votre numéro de téléphone"
        : "Prénom, nom, date de naissance et numéro de téléphone",
      duration: profile.hasUtilisateur ? "~1 min" : "~2 min",
      status: phoneOk ? "done" : "required",
      icon: Phone,
    });
  }

  // Étapes KYC et permis (uniquement si âge OK ou non requis)
  if (!ageMinimum || ageMinimum <= 0 || (profile.dateNaissance && calculateAge(profile.dateNaissance) >= ageMinimum)) {
    if (missing.includes('kyc')) {
      steps.push({
        key: "kyc",
        label: "Vérification d'identité",
        description: "Pièce d'identité nationale ou passeport",
        duration: "~2 min",
        status: kycStatus,
        icon: ShieldCheck,
      });
    }

    if (missing.includes('permis')) {
      steps.push({
        key: "permis",
        label: "Permis de conduire",
        description: "Photo recto-verso de votre permis en cours de validité",
        duration: "~1 min",
        status: permisOk ? "done" : "required",
        icon: CreditCard,
      });
    }
  }

  return steps;
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
      className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-[2px] px-0 sm:px-4 animate-in fade-in duration-200"
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

/* ── Status config ───────────────────────────────────────── */
const STATUS: Record<'done' | 'pending' | 'rejected' | 'required', {
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

// Message Âge Insuffisant
function AgeInsufficientMessage({ ageMinimum, userAge }: { ageMinimum: number; userAge: number }) {
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
    </div>
  );
}

// Formulaire Profil Complet
function CompleteProfileForm({ 
  missing, 
  profile, 
  onComplete 
}: { 
  missing: string[]; 
  profile: ProfileResponse; 
  onComplete: () => void;
}) {
  const [formData, setFormData] = useState({
    prenom: '',
    nom: '',
    dateNaissance: profile.dateNaissance || '',
    phone: profile.phone || '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [kycFile, setKycFile] = useState<File | null>(null);
  const [permisFile, setPermisFile] = useState<File | null>(null);
  
  const [dragKyc, setDragKyc] = useState(false);
  const [dragPermis, setDragPermis] = useState(false);

  // Drag & drop handlers
  const onDragOverKyc = (e: React.DragEvent) => { e.preventDefault(); setDragKyc(true); };
  const onDragLeaveKyc = (e: React.DragEvent) => { e.preventDefault(); setDragKyc(false); };
  const onDropKyc = (e: React.DragEvent) => {
    e.preventDefault();
    setDragKyc(false);
    if (e.dataTransfer.files?.[0]) setKycFile(e.dataTransfer.files[0]);
  };

  const onDragOverPermis = (e: React.DragEvent) => { e.preventDefault(); setDragPermis(true); };
  const onDragLeavePermis = (e: React.DragEvent) => { e.preventDefault(); setDragPermis(false); };
  const onDropPermis = (e: React.DragEvent) => {
    e.preventDefault();
    setDragPermis(false);
    if (e.dataTransfer.files?.[0]) setPermisFile(e.dataTransfer.files[0]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (missing.includes('kyc') && !kycFile) {
      setError("Veuillez fournir votre pièce d'identité.");
      return;
    }
    if (missing.includes('permis') && !permisFile) {
      setError("Veuillez fournir votre permis de conduire.");
      return;
    }

    setLoading(true);
    setError('');

    try {
      // 1. Mise à jour profil
      if (missing.includes('profile')) {
        await apiFetch('/auth/complete-profile', {
          method: 'POST',
          body: {
            prenom: formData.prenom,
            nom: formData.nom,
            telephone: formData.phone,
            dateNaissance: formData.dateNaissance ? formData.dateNaissance : undefined,
          }
        });
      } else {
        if (missing.includes('age') || missing.includes('profile')) { // safe check
          await apiFetch('/users/me/profile', {
            method: 'PATCH',
            body: {
              dateNaissance: formData.dateNaissance,
              ...(missing.includes('profile') ? { prenom: formData.prenom, nom: formData.nom } : {})
            }
          });
        }
        if (missing.includes('phone')) {
          await apiFetch('/auth/phone/update', {
            method: 'POST',
            body: {
              telephone: formData.phone,
            }
          });
        }
      }

      // 2. Upload KYC
      if (missing.includes('kyc') && kycFile) {
        const formDataKyc = new FormData();
        formDataKyc.append('documentFront', kycFile);
        formDataKyc.append('documentBack', kycFile); // API requires both, using same file for now
        await apiFetch('/auth/kyc/submit', { method: 'POST', body: formDataKyc });
      }

      // 3. Upload Permis
      if (missing.includes('permis') && permisFile) {
        const formDataPermis = new FormData();
        formDataPermis.append('file', permisFile);
        await apiFetch('/auth/permis/upload', { method: 'POST', body: formDataPermis });
      }

      onComplete();
    } catch (err) {
      setError('Erreur lors de la mise à jour. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  const maxDate = new Date();
  maxDate.setFullYear(maxDate.getFullYear() - 18);

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Profil de base */}
      {(missing.includes('profile') || missing.includes('age') || missing.includes('phone')) && (
        <div className="space-y-3">
          <h3 className="text-[13px] font-bold text-slate-900 flex items-center gap-2">
            <User className="w-4 h-4 text-emerald-500" strokeWidth={2} />
            Informations personnelles
          </h3>
          
          {missing.includes('profile') && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[12px] font-semibold text-slate-700 mb-1.5">
                    Prénom *
                  </label>
                  <input
                    type="text"
                    value={formData.prenom}
                    onChange={(e) => setFormData(prev => ({ ...prev, prenom: e.target.value }))}
                    className="w-full h-10 rounded-lg border border-slate-200 bg-white px-3
                      text-[12.5px] font-medium text-slate-800 placeholder-slate-400
                      focus:border-emerald-400/50 focus:outline-none focus:ring-1 focus:ring-emerald-400/20 transition-all"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[12px] font-semibold text-slate-700 mb-1.5">
                    Nom *
                  </label>
                  <input
                    type="text"
                    value={formData.nom}
                    onChange={(e) => setFormData(prev => ({ ...prev, nom: e.target.value }))}
                    className="w-full h-10 rounded-lg border border-slate-200 bg-white px-3
                      text-[12.5px] font-medium text-slate-800 placeholder-slate-400
                      focus:border-emerald-400/50 focus:outline-none focus:ring-1 focus:ring-emerald-400/20 transition-all"
                    required
                  />
                </div>
              </div>
            </>
          )}

          {missing.includes('age') && (
            <div>
              <label className="block text-[12px] font-semibold text-slate-700 mb-1.5">
                Date de naissance *
              </label>
              <input
                type="date"
                value={formData.dateNaissance}
                onChange={(e) => setFormData(prev => ({ ...prev, dateNaissance: e.target.value }))}
                max={maxDate.toISOString().split('T')[0]}
                className="w-full h-10 rounded-lg border border-slate-200 bg-white px-3
                  text-[12.5px] font-medium text-slate-800 placeholder-slate-400
                  focus:border-emerald-400/50 focus:outline-none focus:ring-1 focus:ring-emerald-400/20 transition-all"
                required
              />
            </div>
          )}

          {missing.includes('phone') && (
            <div>
              <label className="block text-[12px] font-semibold text-slate-700 mb-1.5">
                Numéro de téléphone *
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                placeholder="+221 77 123 45 67"
                className="w-full h-10 rounded-lg border border-slate-200 bg-white px-3
                  text-[12.5px] font-medium text-slate-800 placeholder-slate-400
                  focus:border-emerald-400/50 focus:outline-none focus:ring-1 focus:ring-emerald-400/20 transition-all"
                required
              />
            </div>
          )}
        </div>
      )}

      {/* KYC */}
      {missing.includes('kyc') && (
        <div className="space-y-2">
          <h3 className="text-[13px] font-bold text-slate-900 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-500" strokeWidth={2} />
            Vérification d'identité
          </h3>
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <label className="block text-[12px] font-semibold text-slate-700 mb-2">
              Pièce d'identité (CNI ou passeport) *
            </label>
            <div className="flex items-center gap-3">
              <input
                type="file"
                accept="image/*,.pdf"
                onChange={(e) => setKycFile(e.target.files?.[0] || null)}
                className="hidden"
                id="kyc-file"
                capture="environment" // Hint to mobile devices to use rear camera if available, though it still allows photo library. But actually `accept="image/*"` is enough. Let's just use it to be safe. actually standard `accept="image/*"` opens the bottom sheet with "Take Photo / Choose Library". Let's stick with that.
              />
              <label
                htmlFor="kyc-file"
                onDragOver={onDragOverKyc}
                onDragLeave={onDragLeaveKyc}
                onDrop={onDropKyc}
                className={cn(
                  "flex-1 flex flex-col items-center justify-center gap-2 px-4 py-5 rounded-xl border-2 border-dashed cursor-pointer transition-all group",
                  dragKyc 
                    ? "border-emerald-500 bg-emerald-50/60 shadow-inner shadow-emerald-100" 
                    : "border-slate-300 bg-white hover:border-emerald-400/50 hover:bg-emerald-50/20 hover:shadow-sm"
                )}
              >
                <div className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center mb-1 transition-colors",
                  dragKyc ? "bg-emerald-100" : "bg-slate-100 group-hover:bg-emerald-100"
                )}>
                  <CreditCard className={cn(
                    "w-4.5 h-4.5",
                    dragKyc ? "text-emerald-600" : "text-slate-400 group-hover:text-emerald-500"
                  )} strokeWidth={2} />
                </div>
                <div className="text-center">
                  <span className={cn(
                    "block text-[12.5px] font-semibold leading-snug",
                    kycFile || dragKyc ? "text-emerald-700" : "text-slate-700 group-hover:text-emerald-700"
                  )}>
                    {kycFile ? kycFile.name : (dragKyc ? 'Relâchez le fichier...' : 'Glissez-déposez ou cliquez')}
                  </span>
                  {!kycFile && !dragKyc && (
                    <span className="block text-[11px] text-slate-400 mt-1">
                      (Photo galerie, appareil photo ou PDF)
                    </span>
                  )}
                </div>
              </label>
            </div>
          </div>
        </div>
      )}

      {/* Permis */}
      {missing.includes('permis') && (
        <div className="space-y-2">
          <h3 className="text-[13px] font-bold text-slate-900 flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-emerald-500" strokeWidth={2} />
            Permis de conduire
          </h3>
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <label className="block text-[12px] font-semibold text-slate-700 mb-2">
              Permis en cours de validité *
            </label>
            <div className="flex items-center gap-3">
              <input
                type="file"
                accept="image/*,.pdf"
                onChange={(e) => setPermisFile(e.target.files?.[0] || null)}
                className="hidden"
                id="permis-file"
              />
              <label
                htmlFor="permis-file"
                onDragOver={onDragOverPermis}
                onDragLeave={onDragLeavePermis}
                onDrop={onDropPermis}
                className={cn(
                  "flex-1 flex flex-col items-center justify-center gap-2 px-4 py-5 rounded-xl border-2 border-dashed cursor-pointer transition-all group",
                  dragPermis 
                    ? "border-emerald-500 bg-emerald-50/60 shadow-inner shadow-emerald-100" 
                    : "border-slate-300 bg-white hover:border-emerald-400/50 hover:bg-emerald-50/20 hover:shadow-sm"
                )}
              >
                <div className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center mb-1 transition-colors",
                  dragPermis ? "bg-emerald-100" : "bg-slate-100 group-hover:bg-emerald-100"
                )}>
                  <CreditCard className={cn(
                    "w-4.5 h-4.5",
                    dragPermis ? "text-emerald-600" : "text-slate-400 group-hover:text-emerald-500"
                  )} strokeWidth={2} />
                </div>
                <div className="text-center">
                  <span className={cn(
                    "block text-[12.5px] font-semibold leading-snug",
                    permisFile || dragPermis ? "text-emerald-700" : "text-slate-700 group-hover:text-emerald-700"
                  )}>
                    {permisFile ? permisFile.name : (dragPermis ? 'Relâchez le fichier...' : 'Glissez-déposez ou cliquez')}
                  </span>
                  {!permisFile && !dragPermis && (
                    <span className="block text-[11px] text-slate-400 mt-1">
                      (Photo galerie, appareil photo ou PDF)
                    </span>
                  )}
                </div>
              </label>
            </div>
          </div>
        </div>
      )}

      {/* Erreur */}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3">
          <p className="text-[11.5px] font-medium text-red-700">{error}</p>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3 pt-2">
        <button
          type="button"
          onClick={() => window.history.back()}
          className="flex-1 px-5 py-3 rounded-xl border border-slate-200 text-[13.5px] 
            font-semibold text-slate-500 hover:text-slate-800 hover:bg-slate-50 
            hover:border-slate-300 transition-all"
        >
          Annuler
        </button>
        <button
          type="submit"
          disabled={loading}
          className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-emerald-600 
            hover:bg-emerald-700 disabled:bg-slate-200 disabled:text-slate-400 
            text-white text-[13.5px] font-bold py-3 px-5 transition-all duration-200"
        >
          {loading ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Finalisation...
            </>
          ) : (
            <>
              Finaliser mon profil
              <ArrowRight className="w-4 h-4" strokeWidth={2.5} />
            </>
          )}
        </button>
      </div>
    </form>
  );
}

export function DirectGateModal({ open, onOpenChange, profile, ageMinimum, onProceed }: Props) {
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

  const gateState = resolveDirectGate(currentProfile, ageMinimum);

  // Cas 1 : Profil complet
  if (gateState.type === 'ready') {
    onProceed();
    onOpenChange(false);
    return null;
  }

  // Cas 2 : Âge insuffisant
  if (gateState.type === 'age_insufficient') {
    return (
      <ModalShell
        title="Âge minimum requis"
        subtitle={`Ce véhicule nécessite ${gateState.ageMinimum} ans minimum.`}
        tag="Auto Loc · Locataire"
        onClose={() => onOpenChange(false)}
        contentClassName="px-6 pt-6 pb-6"
      >
        <AgeInsufficientMessage 
          ageMinimum={gateState.ageMinimum}
          userAge={gateState.userAge}
        />
        <div className="flex gap-3 mt-6">
          <button
            onClick={() => onOpenChange(false)}
            className="flex-1 px-5 py-3 rounded-xl border border-slate-200 text-[13.5px] 
              font-semibold text-slate-500 hover:text-slate-800 hover:bg-slate-50 
              hover:border-slate-300 transition-all"
          >
            Fermer
          </button>
          <button
            onClick={() => onOpenChange(false)}
            className="flex-1 px-5 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 
              text-white text-[13.5px] font-bold transition-all"
          >
            Continuer
          </button>
        </div>
      </ModalShell>
    );
  }

  // Cas 3 : Éléments manquants - Show pre-gate overview first
  if (!preGateDismissed) {
    return (
      <PreGateOverlay
        steps={resolveSteps(currentProfile, gateState.missing, ageMinimum)}
        onContinue={() => setPreGateDismissed(true)}
        onCancel={() => onOpenChange(false)}
      />
    );
  }

  // Cas 4 : Formulaire complet
  return (
    <ModalShell
      title="Finalisez votre profil"
      subtitle={
        gateState.missing.length === 1 
          ? "Une dernière étape avant de réserver"
          : `${gateState.missing.length} étapes requises pour réserver`
      }
      tag="Auto Loc · Locataire"
      onClose={() => onOpenChange(false)}
      contentClassName="px-6 pt-6 pb-6"
    >
      <CompleteProfileForm 
        missing={gateState.missing}
        profile={currentProfile}
        onComplete={() => {
          onOpenChange(false);
          onProceed();
        }}
      />
    </ModalShell>
  );
}
