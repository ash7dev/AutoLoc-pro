"use client";

import {
  Car, CircleDollarSign, FileText, Camera, FileCheck2, ClipboardCheck, Check,
} from "lucide-react";
import { cn } from "@/lib/utils";

const STEPS = [
  { label: "Véhicule", shortLabel: "1. Info", icon: Car, desc: "Détails & type" },
  { label: "Tarification", shortLabel: "2. Prix", icon: CircleDollarSign, desc: "Prix & livraison" },
  { label: "Conditions", shortLabel: "3. Règles", icon: FileText, desc: "Assurance & règles" },
  { label: "Photos", shortLabel: "4. Photos", icon: Camera, desc: "Galerie studio" },
  { label: "Documents", shortLabel: "5. Docs", icon: FileCheck2, desc: "Carte grise & assurance" },
  { label: "Confirmation", shortLabel: "6. Publication", icon: ClipboardCheck, desc: "Aperçu & envoi" },
];

export function WizardProgress({
  currentStep,
  onStepClick,
}: {
  currentStep: number;
  onStepClick?: (step: number) => void;
}) {
  const percent = Math.round(((currentStep - 1) / (STEPS.length - 1)) * 100);

  return (
    <div className="w-full">

      {/* ── Desktop timeline (MD+) ─────────────────────────────── */}
      <div className="hidden md:block">
        <div className="flex items-start justify-between relative px-2">
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
                  className={cn(
                    "flex flex-col items-center gap-2 relative z-10 min-w-0 w-full group select-none",
                    clickable && "cursor-pointer"
                  )}
                  onClick={() => clickable && onStepClick(num)}
                >
                  {/* Circle */}
                  <div
                    className={cn(
                      "relative flex h-12 w-12 items-center justify-center rounded-2xl text-sm font-black transition-all duration-300 transform",
                      done && "bg-emerald-500 text-white shadow-lg shadow-emerald-500/25 group-hover:scale-105",
                      active && "bg-slate-900 text-white ring-4 ring-emerald-400/40 ring-offset-2 ring-offset-white shadow-xl shadow-slate-900/30 scale-105",
                      future && "bg-slate-100/90 text-slate-400 border border-slate-200/80",
                    )}
                  >
                    {done ? (
                      <Check className="h-5 w-5 stroke-[3]" />
                    ) : (
                      <Icon className={cn("h-5 w-5", active ? "text-emerald-400 stroke-[2.5]" : "stroke-[2]")} />
                    )}

                    {/* Active pulse ring */}
                    {active && (
                      <span className="absolute inset-0 rounded-2xl ring-2 ring-emerald-400/40 animate-ping opacity-75" />
                    )}
                  </div>

                  {/* Label + description */}
                  <div className="text-center space-y-0.5 max-w-[120px]">
                    <p className={cn(
                      "text-[12px] font-black tracking-tight leading-none transition-colors",
                      done && "text-emerald-600 group-hover:text-emerald-700",
                      active && "text-slate-900",
                      future && "text-slate-400",
                    )}>
                      {step.label}
                    </p>
                    <p className={cn(
                      "text-[10px] font-medium leading-tight transition-colors line-clamp-1",
                      active ? "text-slate-600 font-bold" : "text-slate-400",
                    )}>
                      {step.desc}
                    </p>
                  </div>
                </div>

                {/* Connector bar */}
                {i < STEPS.length - 1 && (
                  <div className="absolute top-[24px] left-[55%] right-[-45%] h-[3px] rounded-full bg-slate-200/60 overflow-hidden z-0">
                    <div
                      className={cn(
                        "h-full rounded-full transition-all duration-700 ease-out",
                        done
                          ? "w-full bg-gradient-to-r from-emerald-500 to-emerald-400"
                          : active
                            ? "w-1/2 bg-gradient-to-r from-emerald-500/80 to-emerald-400/30"
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

      {/* ── Mobile timeline (Below MD) ────────────────────────── */}
      <div className="md:hidden space-y-3">
        {/* Progress bar + percentage */}
        <div className="flex items-center justify-between gap-3 px-1">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-slate-900 text-emerald-400 text-[11px] font-black flex items-center justify-center">
              {currentStep}
            </span>
            <span className="text-[13px] font-black text-slate-900">
              {STEPS[currentStep - 1].label}
            </span>
          </div>
          <span className="text-[11px] font-black text-emerald-600 bg-emerald-50 border border-emerald-200/60 px-2.5 py-0.5 rounded-full">
            {percent}% completé
          </span>
        </div>

        <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-emerald-500 via-emerald-400 to-teal-400 transition-all duration-500 ease-out"
            style={{ width: `${percent}%` }}
          />
        </div>

        {/* Scrollable pill buttons */}
        <div className="flex gap-2 overflow-x-auto scrollbar-none snap-x snap-mandatory py-1 px-1 -mx-1">
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
                  "flex-shrink-0 snap-center flex items-center gap-2 px-3.5 py-2 rounded-xl text-[12px] font-extrabold border transition-all duration-200 whitespace-nowrap active:scale-95",
                  done && "bg-emerald-50/80 border-emerald-200/80 text-emerald-800 shadow-sm",
                  active && "bg-slate-900 border-slate-900 text-white shadow-md shadow-slate-900/20 ring-2 ring-emerald-400/40",
                  !done && !active && "bg-slate-50 border-slate-200/70 text-slate-400 opacity-60",
                )}
              >
                {done ? (
                  <Check className="w-3.5 h-3.5 text-emerald-500 stroke-[3]" />
                ) : (
                  <Icon className={cn("w-3.5 h-3.5", active ? "text-emerald-400" : "")} strokeWidth={2} />
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
