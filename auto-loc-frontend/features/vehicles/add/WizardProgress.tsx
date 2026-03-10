"use client";

import {
  Car, CircleDollarSign, FileText, Camera, FileCheck2, ClipboardCheck, Check,
} from "lucide-react";
import { cn } from "@/lib/utils";

const STEPS = [
  { label: "Véhicule", shortLabel: "Info", icon: Car, desc: "Détails de base" },
  { label: "Tarification", shortLabel: "Prix", icon: CircleDollarSign, desc: "Prix & livraison" },
  { label: "Conditions", shortLabel: "Règles", icon: FileText, desc: "Règles de location" },
  { label: "Photos", shortLabel: "Photos", icon: Camera, desc: "Galerie véhicule" },
  { label: "Documents", shortLabel: "Docs", icon: FileCheck2, desc: "Carte grise & assurance" },
  { label: "Confirmation", shortLabel: "Envoi", icon: ClipboardCheck, desc: "Vérification finale" },
];

export function WizardProgress({
  currentStep,
  onStepClick,
}: {
  currentStep: number;
  onStepClick?: (step: number) => void;
}) {
  return (
    <div className="w-full">

      {/* ── Desktop timeline ──────────────────────────────────── */}
      <div className="hidden md:block">
        <div className="flex items-start justify-between relative">
          {STEPS.map((step, i) => {
            const num = i + 1;
            const done = num < currentStep;
            const active = num === currentStep;
            const future = num > currentStep;
            const Icon = step.icon;
            const clickable = done && onStepClick;

            return (
              <div key={i} className="flex flex-1 items-start relative">
                {/* Step circle + label */}
                <div
                  className={cn("flex flex-col items-center gap-2 relative z-10 min-w-0 w-full", clickable && "cursor-pointer")}
                  onClick={() => clickable && onStepClick(num)}
                >
                  {/* Circle */}
                  <div
                    className={cn(
                      "relative flex h-11 w-11 items-center justify-center rounded-2xl text-sm font-bold transition-all duration-500",
                      done && "bg-emerald-500 text-white shadow-lg shadow-emerald-500/25",
                      active && "bg-slate-900 text-white ring-[3px] ring-emerald-400/50 ring-offset-2 ring-offset-white shadow-xl shadow-slate-900/30",
                      future && "bg-slate-100 text-slate-400 border border-slate-200",
                    )}
                  >
                    {done ? (
                      <Check className="h-4.5 w-4.5" strokeWidth={3} />
                    ) : (
                      <Icon className="h-4.5 w-4.5" strokeWidth={active ? 2.5 : 2} />
                    )}

                    {/* Pulse ring for active */}
                    {active && (
                      <span className="absolute inset-0 rounded-2xl ring-2 ring-emerald-400/30 animate-ping" />
                    )}
                  </div>

                  {/* Label + description */}
                  <div className="text-center space-y-0.5">
                    <p className={cn(
                      "text-[12px] font-bold tracking-tight leading-none transition-colors",
                      done && "text-emerald-600",
                      active && "text-slate-900",
                      future && "text-slate-400",
                    )}>
                      {step.label}
                    </p>
                    <p className={cn(
                      "text-[10px] font-medium leading-none transition-colors",
                      active ? "text-slate-500" : "text-slate-300",
                    )}>
                      {step.desc}
                    </p>
                  </div>
                </div>

                {/* Connector bar */}
                {i < STEPS.length - 1 && (
                  <div className="absolute top-[22px] left-[55%] right-[-45%] h-[3px] rounded-full bg-slate-100 overflow-hidden z-0">
                    <div
                      className={cn(
                        "h-full rounded-full transition-all duration-700 ease-out",
                        done
                          ? "w-full bg-gradient-to-r from-emerald-500 to-emerald-400"
                          : active
                            ? "w-1/2 bg-gradient-to-r from-emerald-500/60 to-emerald-400/20"
                            : "w-0",
                      )}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Mobile timeline ───────────────────────────────────── */}
      <div className="md:hidden">
        {/* Progress bar */}
        <div className="flex items-center gap-2 mb-3">
          <span className="text-[11px] font-black text-slate-900 tabular-nums">
            {currentStep}/{STEPS.length}
          </span>
          <div className="flex-1 h-1.5 rounded-full bg-slate-100 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-emerald-400 transition-all duration-500 ease-out"
              style={{ width: `${((currentStep - 1) / (STEPS.length - 1)) * 100}%` }}
            />
          </div>
        </div>

        {/* Scrollable dots */}
        <div className="flex gap-1 overflow-x-auto scrollbar-none snap-x snap-mandatory pb-1">
          {STEPS.map((step, i) => {
            const num = i + 1;
            const done = num < currentStep;
            const active = num === currentStep;
            const Icon = step.icon;

            return (
              <button
                key={i}
                type="button"
                onClick={() => done && onStepClick?.(num)}
                disabled={!done}
                className={cn(
                  "flex-shrink-0 snap-center flex items-center gap-1.5 px-3 py-2 rounded-xl text-[11px] font-bold border transition-all",
                  done && "bg-emerald-50 border-emerald-200 text-emerald-700",
                  active && "bg-slate-900 border-slate-900 text-white shadow-md shadow-slate-900/20",
                  !done && !active && "bg-slate-50 border-slate-100 text-slate-400",
                )}
              >
                {done ? (
                  <Check className="w-3 h-3 text-emerald-500" strokeWidth={3} />
                ) : (
                  <Icon className="w-3 h-3" strokeWidth={2} />
                )}
                {step.shortLabel}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
