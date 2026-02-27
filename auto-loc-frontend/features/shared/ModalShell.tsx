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
      className="fixed inset-0 z-40 flex items-center justify-center bg-black/30 px-4 py-6 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="flex max-h-[calc(100dvh-3rem)] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-[hsl(var(--border))] bg-[var(--bg-page)] shadow-[0_24px_64px_rgba(0,0,0,0.3)] animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-white/10 bg-foreground px-6 py-4">
          <div>
            {tag && <p className="text-xs uppercase tracking-widest text-white/40">{tag}</p>}
            <h2 className="text-lg font-semibold text-emerald-400">{title}</h2>
            <p className="text-sm text-emerald-300/90">{subtitle}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-white/15 text-emerald-300 hover:text-emerald-200 hover:bg-white/10 transition-colors"
            aria-label="Fermer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Scrollable content */}
        <div
          className={cn(
            "min-h-0 flex-1 overflow-y-auto overscroll-contain",
            contentClassName ?? "px-6 pt-6 pb-6",
          )}
        >
          {children}
        </div>
      </div>
    </div>
  );
}
