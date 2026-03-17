"use client";

import React, { useEffect } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

export function ModalShell({
  title,
  subtitle,
  tag,
  onClose,
  contentClassName,
  children,
}: {
  title: string;
  subtitle: string;
  tag?: string;
  onClose: () => void;
  contentClassName?: string;
  children: React.ReactNode;
}) {
  useEffect(() => {
    const originalBody = document.body.style.overflow;
    const originalHtml = document.documentElement.style.overflow;
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = originalBody;
      document.documentElement.style.overflow = originalHtml;
    };
  }, []);

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-[2px] sm:px-4 sm:py-6 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className={cn(
          "flex w-full flex-col overflow-hidden bg-[var(--bg-page)]",
          "border border-white/10",
          // Mobile : bottom sheet
          "max-h-[92dvh] rounded-t-3xl shadow-[0_-8px_40px_rgba(0,0,0,0.25)]",
          "animate-in slide-in-from-bottom duration-300",
          // Desktop : dialog centré
          "sm:max-w-xl sm:rounded-2xl sm:max-h-[calc(100dvh-3rem)] sm:shadow-[0_24px_64px_rgba(0,0,0,0.35)]",
          "sm:animate-in sm:zoom-in-95 sm:slide-in-from-bottom-0",
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drag handle — mobile uniquement */}
        <div className="sm:hidden flex justify-center pt-3 pb-1 flex-shrink-0">
          <div className="w-10 h-1 rounded-full bg-white/20" />
        </div>

        {/* Header */}
        <div className="flex-shrink-0 flex items-start justify-between border-b border-white/10 bg-foreground px-5 pt-4 pb-4 sm:px-6 sm:pt-5 sm:pb-4">
          <div className="min-w-0">
            {tag && (
              <p className="text-[10px] font-black uppercase tracking-[0.16em] text-white/40 mb-0.5">
                {tag}
              </p>
            )}
            <h2 className="text-[16px] sm:text-lg font-semibold text-emerald-400 leading-tight">
              {title}
            </h2>
            <p className="text-[12px] sm:text-sm text-emerald-300/80 mt-0.5 leading-snug">
              {subtitle}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex-shrink-0 ml-4 flex h-8 w-8 items-center justify-center rounded-full border border-white/15 text-white/50 hover:text-white hover:bg-white/10 transition-colors"
            aria-label="Fermer"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Scrollable content */}
        <div
          className={cn(
            "min-h-0 flex-1 overflow-y-auto overscroll-contain",
            contentClassName ?? "px-5 pt-5 pb-8 sm:px-6 sm:pt-6 sm:pb-6",
          )}
        >
          {children}
        </div>
      </div>
    </div>
  );
}
