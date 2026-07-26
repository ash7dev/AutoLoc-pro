"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Plus, Bell, Car, Clock, CheckCircle2, FileText, ArrowUpRight, ShieldAlert, CalendarCheck, Sparkles } from "lucide-react";
import { useOwnerNotifications } from "../hooks/use-owner-notifications";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useAuthFetch } from "@/features/auth/hooks/use-auth-fetch";
import type { Vehicle } from "@/lib/nestjs/vehicles";
import { VehicleSelectorModal } from "@/features/vehicles/owner/VehicleSelectorModal";
import { ShareStoryModal } from "@/features/vehicles/owner/ShareStoryModal";

/* ── Notification Bell ───────────────────────────────────────────────── */
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

/* ── Notification Bell ───────────────────────────────────────────────── */
function NotificationBell() {
  const counts = useOwnerNotifications();
  const total = counts?.total ?? 0;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className="relative flex h-9 w-9 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.04] text-white/50 hover:text-white hover:bg-white/[0.08] transition-all outline-none"
        >
          <Bell className="h-4 w-4" />
          {total > 0 && (
            <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-emerald-400 ring-1 ring-black animate-pulse" />
          )}
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent 
        align="end" 
        sideOffset={12}
        className="w-80 p-0 rounded-2xl border border-white/10 bg-[#0a0a0a]/95 backdrop-blur-xl shadow-2xl shadow-black/50 overflow-hidden animate-in fade-in zoom-in-95 duration-150"
      >
        {/* Header */}
        <div className="px-4 py-3 border-b border-white/[0.06]">
          <p className="text-xs font-semibold text-white/60 uppercase tracking-widest">Notifications</p>
        </div>

        {total === 0 ? (
          <div className="px-6 py-12 text-center">
            <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 rounded-full bg-emerald-500/10">
              <CheckCircle2 className="h-6 w-6 text-emerald-400" />
            </div>
            <p className="text-sm font-medium text-white/60 mb-1">Tout est à jour</p>
            <p className="text-xs text-white/30">Aucune action requise</p>
          </div>
        ) : (
          <div className="max-h-[340px] overflow-y-auto divide-y divide-white/[0.05]">
            {counts?.pendingConfirmationsIds.map((id) => (
              <Link
                key={id}
                href={`/dashboard/owner/reservations/${id}`}
                className="flex items-center gap-3 px-4 py-3.5 hover:bg-white/[0.04] transition-colors"
              >
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10">
                  <CalendarCheck className="h-4 w-4 text-emerald-500" />
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-white leading-tight">
                    Réservation à confirmer
                  </p>
                  <p className="text-xs text-white/40 mt-0.5">Paiement reçu — action requise</p>
                </div>
                <ArrowUpRight className="h-3.5 w-3.5 text-white/30 shrink-0" />
              </Link>
            ))}
            {counts?.pendingLitigesIds.map((id) => (
              <Link
                key={id}
                href={`/dashboard/owner/reservations/${id}`}
                className="flex items-center gap-3 px-4 py-3.5 hover:bg-white/[0.04] transition-colors"
              >
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-red-400/15">
                  <ShieldAlert className="h-4 w-4 text-red-400" />
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-white leading-tight">
                    Litige en cours
                  </p>
                  <p className="text-xs text-white/40 mt-0.5">Intervention requise</p>
                </div>
                <ArrowUpRight className="h-3.5 w-3.5 text-white/30 shrink-0" />
              </Link>
            ))}
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function OwnerHeader({
  title,
  subtitle,
  showFleetStats = false,
  fleetStats,
  ctaLabel,
  ctaShortLabel,
  ctaHref,
  ctaVariant,
  showShareStoryBtn = false,
  vehicles = [],
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
  ctaLabel?: string;
  ctaShortLabel?: string;
  ctaHref?: string;
  ctaVariant?: 'withdraw';
  showShareStoryBtn?: boolean;
  vehicles?: Vehicle[];
}) {
  const router = useRouter();
  const { authFetch } = useAuthFetch();
  const [time, setTime] = useState("");
  const [fetchedVehicles, setFetchedVehicles] = useState<Vehicle[]>(vehicles);
  const [selectorOpen, setSelectorOpen] = useState(false);
  const [storyModalOpen, setStoryModalOpen] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);

  useEffect(() => {
    const update = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }));
    };
    update();
    const interval = setInterval(update, 60000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    setFetchedVehicles(vehicles);
  }, [vehicles]);

  const handleShareStoryClick = async () => {
    let currentList = fetchedVehicles;
    if (!currentList || currentList.length === 0) {
      try {
        const res = await authFetch<{ data: Vehicle[] }>('/vehicles/me?limit=50');
        currentList = res?.data ?? [];
        setFetchedVehicles(currentList);
      } catch (err) {
        currentList = [];
      }
    }

    const sharable = currentList.filter(v => v.statut === 'VERIFIE' || v.statut === 'EN_ATTENTE_VALIDATION');

    if (sharable.length === 0) {
      toast.error("Aucun véhicule disponible à partager", {
        description: "Publiez votre premier véhicule pour commencer à le partager en Story.",
        action: {
          label: "Ajouter un véhicule",
          onClick: () => router.push("/dashboard/owner/vehicles/new"),
        },
      });
      return;
    }

    if (sharable.length === 1) {
      setSelectedVehicle(sharable[0]);
      setStoryModalOpen(true);
    } else {
      setSelectorOpen(true);
    }
  };

  return (
    <div className="relative rounded-2xl bg-[#0a0a0a] border border-white/[0.06] px-4 py-4 sm:px-8 sm:py-6 overflow-hidden">
      {/* Background decoration layer */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-2xl">
        {/* Animated mesh gradient — slow breathing effect */}
        <div 
          className="absolute -top-20 -left-10 h-64 w-64 rounded-full bg-emerald-500/10 blur-3xl"
          style={{ animation: 'meshFloat 8s ease-in-out infinite' }}
        />
        <div 
          className="absolute -top-10 right-20 h-48 w-48 rounded-full bg-emerald-500/5 blur-3xl"
          style={{ animation: 'meshFloat 10s ease-in-out infinite reverse' }}
        />
        <div 
          className="absolute bottom-0 right-0 h-32 w-96 rounded-full bg-emerald-400/5 blur-2xl"
          style={{ animation: 'meshFloat 12s ease-in-out infinite' }}
        />
        <div 
          className="absolute top-1/2 left-1/3 h-40 w-40 rounded-full bg-teal-500/5 blur-3xl"
          style={{ animation: 'meshFloat 14s ease-in-out infinite reverse' }}
        />

        {/* Subtle grid overlay */}
        <div
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />

        {/* Top highlight line */}
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-emerald-500/20 to-transparent" />
      </div>

      {/* Keyframes for mesh animation */}
      <style jsx>{`
        @keyframes meshFloat {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(8px, -6px) scale(1.05); }
          66% { transform: translate(-4px, 4px) scale(0.97); }
        }
      `}</style>

      <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-6">
        {/* Left */}
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/25 bg-emerald-500/10 px-3 py-0.5 text-[10px] font-bold text-emerald-400 uppercase tracking-widest">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Live · Mis à jour à {time}
            </span>
          </div>

          <h1 className="font-display text-2xl sm:text-4xl font-black tracking-tighter text-white">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-emerald-300">
              {title}
            </span>
          </h1>

          <p className="font-body text-[13px] sm:text-[14px] text-white/30 tracking-tight leading-relaxed">{subtitle}</p>
        </div>

        {/* Right */}
        <div className="flex items-center gap-3 sm:gap-4 shrink-0 flex-wrap">
          {/* Stat cards */}
          {showFleetStats && (
            <div className="hidden lg:flex flex-wrap items-center gap-2">
              <div className="group flex items-center gap-4 rounded-2xl border border-white/10 bg-white/5 px-5 py-3 shadow-xl backdrop-blur-sm transition-all hover:translate-y-[-2px] hover:bg-white/10">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10">
                  <Car className="h-4.5 w-4.5 text-emerald-400" />
                </div>
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-widest text-white/60">Total véhicules</p>
                  <p className="text-lg font-black text-white leading-none">{fleetStats?.total ?? 0}</p>
                </div>
              </div>

              <div className="group flex items-center gap-4 rounded-2xl border border-white/10 bg-white/5 px-5 py-3 shadow-xl backdrop-blur-sm transition-all hover:translate-y-[-2px] hover:bg-white/10">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10">
                  <Clock className="h-4.5 w-4.5 text-emerald-400" />
                </div>
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-widest text-white/60">En attente</p>
                  <p className="text-lg font-black text-white leading-none">{fleetStats?.pending ?? 0}</p>
                </div>
              </div>

              <div className="group flex items-center gap-4 rounded-2xl border border-white/10 bg-white/5 px-5 py-3 shadow-xl backdrop-blur-sm transition-all hover:translate-y-[-2px] hover:bg-white/10">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10">
                  <CheckCircle2 className="h-4.5 w-4.5 text-emerald-400" />
                </div>
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-widest text-white/60">Actifs</p>
                  <p className="text-lg font-black text-white leading-none">{fleetStats?.active ?? 0}</p>
                </div>
              </div>

              {fleetStats && fleetStats.drafts > 0 && (
                <div className="group flex items-center gap-4 rounded-2xl border border-white/10 bg-white/5 px-5 py-3 shadow-xl backdrop-blur-sm transition-all hover:translate-y-[-2px] hover:bg-white/10">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10">
                    <FileText className="h-4.5 w-4.5 text-white/40" />
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
          <NotificationBell />

          {/* Story & Share Header Button */}
          {showShareStoryBtn && (
            <button
              onClick={handleShareStoryClick}
              title="Partager en Story WhatsApp / Insta"
              className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 font-bold text-xs px-3 sm:px-4 h-9 transition-all shadow-sm active:scale-95"
            >
              <Sparkles className="h-3.5 w-3.5 text-emerald-400 animate-pulse" strokeWidth={2.5} />
              <span className="hidden sm:inline">Story & Partage</span>
              <span className="sm:hidden">Story</span>
            </button>
          )}

          {/* CTA */}
          {ctaHref ? (
            ctaHref.startsWith('#') ? (
              <button
                onClick={() => {
                  const target = document.querySelector(ctaHref);
                  if (target) {
                    target.scrollIntoView({ behavior: 'smooth', block: 'center' });
                  }
                }}
                className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-semibold text-sm px-3 sm:px-4 h-9 transition-all shadow-[0_0_20px_rgba(52,211,153,0.25)] hover:shadow-[0_0_28px_rgba(52,211,153,0.4)]"
              >
                {ctaVariant === 'withdraw' ? <ArrowUpRight className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                <span className="hidden sm:inline">{ctaLabel ?? "Ajouter un véhicule"}</span>
                <span className="sm:hidden">{ctaShortLabel ?? ctaLabel ?? "Ajouter"}</span>
              </button>
            ) : (
              <Link
                href={ctaHref}
                className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-semibold text-sm px-3 sm:px-4 h-9 transition-all shadow-[0_0_20px_rgba(52,211,153,0.25)] hover:shadow-[0_0_28px_rgba(52,211,153,0.4)]"
              >
                {ctaVariant === 'withdraw' ? <ArrowUpRight className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                <span className="hidden sm:inline">{ctaLabel ?? "Ajouter un véhicule"}</span>
                <span className="sm:hidden">{ctaShortLabel ?? ctaLabel ?? "Ajouter"}</span>
              </Link>
            )
          ) : (
            <Button
              onClick={() => router.push("/dashboard/owner/vehicles/new")}
              className="gap-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-semibold text-sm px-3 sm:px-4 h-9 transition-all shadow-[0_0_20px_rgba(52,211,153,0.25)] hover:shadow-[0_0_28px_rgba(52,211,153,0.4)]"
            >
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">Ajouter un véhicule</span>
              <span className="sm:hidden">Ajouter</span>
            </Button>
          )}
        </div>
      </div>

      {/* Modals for Header Story Sharing */}
      <VehicleSelectorModal
        vehicles={fetchedVehicles}
        open={selectorOpen}
        onClose={() => setSelectorOpen(false)}
        onSelectVehicle={(v) => {
          setSelectedVehicle(v);
          setStoryModalOpen(true);
        }}
      />

      <ShareStoryModal
        vehicle={selectedVehicle}
        open={storyModalOpen}
        onClose={() => {
          setStoryModalOpen(false);
          setSelectedVehicle(null);
        }}
      />
    </div>
  );
}
