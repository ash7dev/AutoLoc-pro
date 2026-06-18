import React from "react";
import { cn } from "@/lib/utils";

/* ── Shared premium input classes ─────────────────────────────────── */

export const INPUT_CLASS =
  "w-full h-11 rounded-xl border border-slate-200 bg-white px-4 text-base lg:text-[13px] font-medium text-slate-900 placeholder-slate-300 outline-none transition-all duration-200 focus:border-emerald-400 focus:ring-[3px] focus:ring-emerald-400/15 disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-slate-50";

export const SELECT_CLASS =
  "w-full h-11 rounded-xl border border-slate-200 bg-white px-3.5 text-base lg:text-[13px] font-medium text-slate-900 outline-none appearance-none cursor-pointer transition-all duration-200 focus:border-emerald-400 focus:ring-[3px] focus:ring-emerald-400/15 disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-slate-50";

export const LABEL_CLASS = "text-[14px] sm:text-[13px] font-bold text-slate-700 uppercase tracking-[0.04em]";

/* ═══════════════════════════════════════════════════════════════════
   Shared UI primitives
═══════════════════════════════════════════════════════════════════ */

export function SectionCard({
  icon: Icon,
  title,
  subtitle,
  badge,
  children,
  className,
}: {
  icon: React.ElementType;
  title: string;
  subtitle: string;
  badge?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("rounded-2xl border border-slate-100 bg-white overflow-hidden", className)}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 sm:px-5 py-3.5 sm:py-4 border-b border-slate-100 bg-gradient-to-r from-slate-50/80 to-white">
        <div className="flex items-center gap-3">
          <span className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-slate-900 flex items-center justify-center shadow-sm">
            <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-400" strokeWidth={2} />
          </span>
          <div>
            <p className="text-[15px] sm:text-[14px] font-bold text-slate-900 tracking-tight">{title}</p>
            <p className="text-[13px] sm:text-[12px] font-medium text-slate-400 mt-0.5">{subtitle}</p>
          </div>
        </div>
        {badge && <div>{badge}</div>}
      </div>
      {/* Body */}
      <div className="p-4 sm:p-5">
        {children}
      </div>
    </div>
  );
}

export function FormField({
  label,
  required,
  error,
  icon: Icon,
  children,
  className,
}: {
  label: string;
  required?: boolean;
  error?: string;
  icon?: React.ElementType;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center gap-1.5">
        {Icon && <Icon className="w-3 h-3 text-slate-400" strokeWidth={2} />}
        <label className={LABEL_CLASS}>
          {label}
          {required && <span className="text-emerald-500 ml-0.5">*</span>}
        </label>
      </div>
      {children}
      {error && (
        <p className="text-[11px] font-semibold text-red-500 flex items-center gap-1">
          <span className="w-3 h-3 rounded-full bg-red-100 flex items-center justify-center text-[8px]">!</span>
          {error}
        </p>
      )}
    </div>
  );
}
