import React from "react";
import { cn } from "@/lib/utils";

/* ── Shared premium input classes ─────────────────────────────────── */

export const INPUT_CLASS =
  "w-full h-12 rounded-xl border border-slate-200 bg-white px-4 text-[16px] font-medium text-slate-900 placeholder-slate-400 outline-none transition-all duration-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-slate-50";

export const SELECT_CLASS =
  "w-full h-12 rounded-xl border border-slate-200 bg-white px-3.5 text-[16px] font-medium text-slate-900 outline-none appearance-none cursor-pointer transition-all duration-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-slate-50";

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
    <div className={cn("rounded-2xl border border-slate-200/80 bg-white overflow-hidden shadow-sm shadow-slate-100/50", className)}>
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-gradient-to-br from-slate-50 via-white to-slate-50/50">
        <div className="flex items-center gap-3.5">
          <span className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center shadow-md shadow-slate-900/20 ring-1 ring-white/10">
            <Icon className="w-4.5 h-4.5 text-emerald-400" strokeWidth={2} />
          </span>
          <div>
            <p className="text-[15px] font-black text-slate-900 tracking-tight">{title}</p>
            <p className="text-[13px] font-medium text-slate-500 mt-0.5 leading-tight">{subtitle}</p>
          </div>
        </div>
        {badge && <div>{badge}</div>}
      </div>
      {/* Body */}
      <div className="p-5 sm:p-6">
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
    <div className={cn("space-y-2.5", className)}>
      <div className="flex items-center gap-2">
        {Icon && <Icon className="w-3.5 h-3.5 text-slate-400" strokeWidth={2} />}
        <label className={LABEL_CLASS}>
          {label}
          {required && <span className="text-emerald-500 ml-1">*</span>}
        </label>
      </div>
      {children}
      {error && (
        <p className="text-[12px] font-bold text-red-600 flex items-center gap-2 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
          <span className="w-4 h-4 rounded-full bg-red-500 flex items-center justify-center text-white text-[10px] font-black flex-shrink-0">!</span>
          {error}
        </p>
      )}
    </div>
  );
}
