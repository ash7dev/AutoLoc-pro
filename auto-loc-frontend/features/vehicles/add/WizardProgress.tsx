"use client";

import { Car, CircleDollarSign, FileText, Camera, ClipboardCheck, Check } from "lucide-react";
import { cn } from "@/lib/utils";

const STEPS = [
  { label: "Véhicule",     icon: Car },
  { label: "Prix",         icon: CircleDollarSign },
  { label: "Conditions",   icon: FileText },
  { label: "Photos",       icon: Camera },
  { label: "Confirmation", icon: ClipboardCheck },
];

export function WizardProgress({
  currentStep,
}: {
  currentStep: number;
}) {
  return (
    <div className="rounded-xl border border-[hsl(var(--border))] bg-card p-5 shadow-sm">
      <div className="flex items-center justify-between gap-1">
        {STEPS.map((step, i) => {
          const num = i + 1;
          const done   = num < currentStep;
          const active = num === currentStep;
          const Icon   = step.icon;

          return (
            <div key={i} className="flex flex-1 items-center">
              {/* Dot + label */}
              <div className="flex flex-col items-center gap-2 min-w-0">
                <div
                  className={cn(
                    "flex h-10 w-10 items-center justify-center rounded-full text-sm font-semibold transition-colors",
                    done   && "bg-emerald-500 text-white",
                    active && "bg-black text-white ring-2 ring-black ring-offset-2",
                    !done && !active && "bg-muted text-muted-foreground",
                  )}
                >
                  {done ? <Check className="h-5 w-5" /> : <Icon className="h-5 w-5" />}
                </div>
                <span
                  className={cn(
                    "text-[12px] font-semibold hidden sm:block truncate",
                    active && "text-foreground",
                    !active && "text-muted-foreground",
                  )}
                >
                  {step.label}
                </span>
              </div>

              {/* Connector (sauf dernier) */}
              {i < STEPS.length - 1 && (
                <div
                  className={cn(
                    "mx-1 h-px flex-1 transition-colors",
                    done ? "bg-emerald-500" : "bg-border",
                  )}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
