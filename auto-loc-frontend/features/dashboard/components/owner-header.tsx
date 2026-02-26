"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Plus, Bell, Car, Clock, CheckCircle2, FileText } from "lucide-react";

export function OwnerHeader({
  title,
  subtitle,
  showFleetStats = false,
  fleetStats,
}: {
  title: string;
  subtitle: string;
  showFleetStats?: boolean;
  fleetStats?: {
    total: number;
    pending: number;
    active: number;
    drafts: number;
  };
}) {
  const router = useRouter();
  const [time, setTime] = useState("");

  useEffect(() => {
    const update = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }));
    };
    update();
    const interval = setInterval(update, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative overflow-hidden rounded-2xl bg-black border border-white/[0.06] px-4 py-4 sm:px-8 sm:py-6">
      {/* Ambient glows */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-20 -left-10 h-64 w-64 rounded-full bg-emerald-500/10 blur-3xl" />
        <div className="absolute -top-10 right-20 h-48 w-48 rounded-full bg-blue-500/8 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-32 w-96 rounded-full bg-emerald-400/5 blur-2xl" />
      </div>

      {/* Subtle grid overlay */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.015]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-6">
        {/* Left */}
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/25 bg-emerald-500/10 px-3 py-0.5 text-xs font-medium text-emerald-400 tracking-wide">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Activité normale
            </span>
            <span className="text-xs text-white/30 tabular-nums">{time}</span>
          </div>

          <h1 className="font-display text-xl sm:text-3xl font-bold tracking-tight text-white">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-emerald-300">
              {title}
            </span>
          </h1>

          <p className="font-body text-sm text-white/40 tracking-normal">{subtitle}</p>
        </div>

        {/* Right */}
        <div className="flex items-center gap-3 sm:gap-4 shrink-0 flex-wrap">
          {/* Stat cards */}
          {showFleetStats && (
            <div className="hidden lg:flex flex-wrap items-center gap-2">
              <div className="group flex items-center gap-4 rounded-2xl border border-white/15 bg-white/10 px-5 py-3 shadow-[0_10px_30px_rgba(0,0,0,0.25)] backdrop-blur-sm transition-all hover:translate-y-[-2px] hover:bg-white/15">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-400/15">
                  <Car className="h-4.5 w-4.5 text-emerald-300" />
                </div>
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-widest text-white/60">Total véhicules</p>
                  <p className="text-lg font-black text-white leading-none">{fleetStats?.total ?? 0}</p>
                </div>
              </div>

              <div className="group flex items-center gap-4 rounded-2xl border border-white/15 bg-white/10 px-5 py-3 shadow-[0_10px_30px_rgba(0,0,0,0.25)] backdrop-blur-sm transition-all hover:translate-y-[-2px] hover:bg-white/15">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-400/15">
                  <Clock className="h-4.5 w-4.5 text-amber-300" />
                </div>
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-widest text-white/60">En attente</p>
                  <p className="text-lg font-black text-white leading-none">{fleetStats?.pending ?? 0}</p>
                </div>
              </div>

              <div className="group flex items-center gap-4 rounded-2xl border border-white/15 bg-white/10 px-5 py-3 shadow-[0_10px_30px_rgba(0,0,0,0.25)] backdrop-blur-sm transition-all hover:translate-y-[-2px] hover:bg-white/15">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-400/15">
                  <CheckCircle2 className="h-4.5 w-4.5 text-emerald-300" />
                </div>
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-widest text-white/60">Actifs</p>
                  <p className="text-lg font-black text-white leading-none">{fleetStats?.active ?? 0}</p>
                </div>
              </div>

              {fleetStats && fleetStats.drafts > 0 && (
                <div className="group flex items-center gap-4 rounded-2xl border border-white/15 bg-white/10 px-5 py-3 shadow-[0_10px_30px_rgba(0,0,0,0.25)] backdrop-blur-sm transition-all hover:translate-y-[-2px] hover:bg-white/15">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-400/15">
                    <FileText className="h-4.5 w-4.5 text-blue-300" />
                  </div>
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-widest text-white/60">En préparation</p>
                    <p className="text-lg font-black text-white leading-none">{fleetStats.drafts}</p>
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="hidden md:block h-8 w-px bg-white/10" />

          {/* Notification bell */}
          <button className="relative flex h-9 w-9 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.04] text-white/50 hover:text-white hover:bg-white/[0.08] transition-all">
            <Bell className="h-4 w-4" />
            <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-emerald-400 ring-1 ring-black" />
          </button>

          {/* CTA */}
          <Button
            onClick={() => router.push("/dashboard/owner/vehicles/new")}
            className="gap-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-semibold text-sm px-3 sm:px-4 h-9 transition-all shadow-[0_0_20px_rgba(52,211,153,0.25)] hover:shadow-[0_0_28px_rgba(52,211,153,0.4)]"
          >
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Ajouter un véhicule</span>
            <span className="sm:hidden">Ajouter</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
