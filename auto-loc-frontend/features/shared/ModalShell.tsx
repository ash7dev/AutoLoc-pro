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
      className="fixed inset-0 z-[200] flex items-center justify-center bg-black/40 backdrop-blur-[2px] px-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className={cn(
          "flex w-full flex-col overflow-hidden bg-white",
          "border border-slate-200/60",
          "rounded-2xl shadow-[0_24px_64px_rgba(0,0,0,0.22)]",
          "animate-in zoom-in-95 duration-250",
          "max-w-md max-h-[calc(100dvh-3rem)]",
        )}
        onClick={(e) => e.stopPropagation()}
      >

        {/* Header */}
        <div className="flex-shrink-0 flex items-start justify-between border-b border-slate-100 bg-white px-5 pt-4 pb-4 sm:px-6 sm:pt-5 sm:pb-4">
          <div className="min-w-0 pr-4">
            {tag && (
              <p className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-400 mb-0.5">
                {tag}
              </p>
            )}
            <h2 className="text-[17px] font-black tracking-tight text-slate-900 leading-tight">
              {title}
            </h2>
            <p className="text-[12.5px] text-slate-500 mt-0.5 leading-snug">
              {subtitle}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex-shrink-0 flex h-8 w-8 items-center justify-center rounded-full border border-slate-100 text-slate-400 hover:text-slate-700 hover:bg-slate-50 transition-colors"
            aria-label="Fermer"
          >
            <X className="h-3.5 w-3.5" strokeWidth={2.5} />
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
