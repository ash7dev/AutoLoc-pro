"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Archive, CalendarDays, Car, ExternalLink, MapPin,
  Pencil, Star, Users, X, Shield, Clock, Gauge,
  ChevronRight, ChevronLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Vehicle } from "@/lib/nestjs/vehicles";
import { StatusChip, TYPE_LABELS, formatPrice, mainPhoto } from "./vehicle-helpers";

// ── Tiny helpers ───────────────────────────────────────────────────────────────

function Label({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[10px] font-bold uppercase tracking-widest text-black/30 mb-1">
      {children}
    </p>
  );
}

function InfoCard({ label, value, icon: Icon, accent }: {
  label: string;
  value: React.ReactNode;
  icon?: React.ElementType;
  accent?: boolean;
}) {
  return (
    <div className={`flex flex-col gap-1 rounded-xl px-3.5 py-3 border transition-all duration-200
      ${accent
        ? "border-emerald-400/25 bg-emerald-400/5"
        : "border-slate-100 bg-slate-50/80"}`
    }>
      <Label>{label}</Label>
      <div className="flex items-center gap-1.5">
        {Icon && (
          <Icon
            className={`h-3.5 w-3.5 shrink-0 ${accent ? "text-emerald-400" : "text-black/30"}`}
            strokeWidth={1.5}
          />
        )}
        <p className={`font-bold leading-snug tracking-tight
          ${accent ? "text-[14.5px] text-black" : "text-[13.5px] text-black"}`}>
          {value}
        </p>
      </div>
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────

export function VehicleDetailModal({
  vehicle,
  onClose,
  onEdit,
  onArchive,
}: {
  vehicle: Vehicle | null;
  onClose: () => void;
  onEdit: (v: Vehicle) => void;
  onArchive: (v: Vehicle) => void;
}) {
  const [activePhotoIdx, setActivePhotoIdx] = useState(0);

  useEffect(() => {
    if (!vehicle) return;
    const mainIdx = vehicle.photos.findIndex((p) => p.estPrincipale);
    setActivePhotoIdx(mainIdx >= 0 ? mainIdx : 0);
  }, [vehicle]);

  useEffect(() => {
    if (!vehicle) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
      document.documentElement.style.overflow = "";
    };
  }, [vehicle]);

  if (!vehicle) return null;

  const photos = vehicle.photos;
  const activePhoto = photos[activePhotoIdx]?.url ?? null;
  const hasMultiple = photos.length > 1;
  const reservations = vehicle._count?.reservations ?? vehicle.totalLocations;
  const isActive = vehicle.statut === "VERIFIE";
  const tiers = vehicle.tarifsProgressifs ?? [];

  function prevPhoto() {
    setActivePhotoIdx((i) => (i === 0 ? photos.length - 1 : i - 1));
  }
  function nextPhoto() {
    setActivePhotoIdx((i) => (i === photos.length - 1 ? 0 : i + 1));
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4 py-6
        bg-black/30 backdrop-blur-sm
        animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="flex max-h-[calc(100dvh-3rem)] w-full max-w-3xl flex-col
          overflow-hidden rounded-2xl border border-slate-200/80
          bg-white shadow-2xl shadow-slate-400/20
          animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >

        {/* ── Header ── */}
        <div className="relative flex items-center justify-between shrink-0 overflow-hidden bg-black px-6 py-5">
          {/* Emerald glow blob */}
          <div className="absolute -top-10 -left-10 h-32 w-32 rounded-full bg-emerald-400/20 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-6 right-20 h-20 w-20 rounded-full bg-emerald-400/10 blur-2xl pointer-events-none" />

          <div className="relative z-10">
            <p className="text-[10px] font-bold uppercase tracking-widest text-white/30 mb-1.5">
              AutoLoc · Fiche véhicule
            </p>
            <h2 className="text-xl font-bold tracking-tight text-white leading-tight">
              {vehicle.marque}{" "}
              <span className="text-emerald-400">{vehicle.modele}</span>
            </h2>
            <p className="text-[12px] font-medium text-white/40 mt-0.5 tracking-wide">
              {vehicle.annee} · {vehicle.immatriculation}
            </p>
          </div>

          <div className="relative z-10 flex items-center gap-3">
            <StatusChip statut={vehicle.statut} />
            <button
              type="button"
              onClick={onClose}
              className="flex h-9 w-9 items-center justify-center rounded-xl
                border border-white/10 text-white/40
                hover:text-white hover:bg-white/10 hover:border-white/20
                transition-all duration-150"
              aria-label="Fermer"
            >
              <X className="h-4 w-4" strokeWidth={2} />
            </button>
          </div>
        </div>

        {/* ── Body ── */}
        <div className="min-h-0 flex-1 overflow-y-auto p-5 bg-slate-50/50">
          <div className="grid grid-cols-1 lg:grid-cols-[1.15fr_0.85fr] gap-4">

            {/* ── Left: Photo viewer + gallery ── */}
            <div className="flex flex-col gap-3">

              {/* Main photo */}
              <div className={`relative overflow-hidden rounded-2xl border bg-white
                ${isActive ? "border-emerald-400/30" : "border-slate-200"}`}>

                {/* Active top bar */}
                {isActive && (
                  <div className="absolute top-0 inset-x-0 h-[2.5px] z-10 bg-gradient-to-r from-emerald-400 via-emerald-300 to-emerald-400" />
                )}

                {/* Photo area */}
                <div className="relative aspect-[16/9] bg-slate-100">
                  {activePhoto ? (
                    <Image
                      key={activePhoto}
                      src={activePhoto}
                      alt={`${vehicle.marque} ${vehicle.modele}`}
                      fill
                      className="object-cover transition-opacity duration-300"
                      sizes="(max-width: 1024px) 100vw, 55vw"
                    />
                  ) : (
                    <div className="flex h-full flex-col items-center justify-center gap-3">
                      <div className={`flex h-14 w-14 items-center justify-center rounded-2xl
                        ${isActive ? "bg-emerald-400/10" : "bg-slate-100"}`}>
                        <Car className={`h-6 w-6 ${isActive ? "text-emerald-400/60" : "text-slate-300"}`} strokeWidth={1.5} />
                      </div>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                        Aucune photo
                      </p>
                    </div>
                  )}

                  {/* Arrows */}
                  {hasMultiple && (
                    <>
                      <button
                        type="button"
                        onClick={prevPhoto}
                        className="absolute left-2.5 top-1/2 -translate-y-1/2 z-10
                          flex h-8 w-8 items-center justify-center rounded-xl
                          bg-black/50 backdrop-blur-sm text-white/80
                          hover:bg-black/70 hover:text-white
                          transition-all duration-150"
                        aria-label="Photo précédente"
                      >
                        <ChevronLeft className="h-4 w-4" strokeWidth={2.5} />
                      </button>
                      <button
                        type="button"
                        onClick={nextPhoto}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 z-10
                          flex h-8 w-8 items-center justify-center rounded-xl
                          bg-black/50 backdrop-blur-sm text-white/80
                          hover:bg-black/70 hover:text-white
                          transition-all duration-150"
                        aria-label="Photo suivante"
                      >
                        <ChevronRight className="h-4 w-4" strokeWidth={2.5} />
                      </button>

                      {/* Counter */}
                      <div className="absolute bottom-2.5 right-3 z-10
                        rounded-full bg-black/50 backdrop-blur-sm
                        px-2.5 py-1 text-[11px] font-bold text-white/90">
                        {activePhotoIdx + 1} / {photos.length}
                      </div>
                    </>
                  )}
                </div>

                {/* Stats + price bar */}
                <div className="flex items-center justify-between px-4 py-3.5 border-t border-slate-100">
                  <div className="flex items-center gap-3 text-[12px] text-black/50">
                    {vehicle.note > 0 && (
                      <span className="flex items-center gap-1 font-bold text-black">
                        <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" strokeWidth={0} />
                        {Number(vehicle.note).toFixed(1)}
                      </span>
                    )}
                    <span className="flex items-center gap-1.5 font-semibold">
                      <CalendarDays className="h-3.5 w-3.5" strokeWidth={1.5} />
                      {reservations} réservation{reservations !== 1 ? "s" : ""}
                    </span>
                    {vehicle.nombrePlaces && (
                      <span className="flex items-center gap-1.5 font-semibold">
                        <Users className="h-3.5 w-3.5" strokeWidth={1.5} />
                        {vehicle.nombrePlaces} places
                      </span>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-black tracking-tight tabular-nums leading-none text-emerald-500">
                      {formatPrice(vehicle.prixParJour)}
                    </p>
                    <p className="text-[10px] font-bold text-black/30 uppercase tracking-widest mt-0.5">
                      FCFA / jour
                    </p>
                  </div>
                </div>
              </div>

              {/* Thumbnail strip */}
              {hasMultiple && (
                <div className="flex gap-2 overflow-x-auto pb-0.5">
                  {photos.map((p, i) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setActivePhotoIdx(i)}
                      className={`relative h-16 w-24 shrink-0 overflow-hidden rounded-xl border
                        transition-all duration-150
                        ${i === activePhotoIdx
                          ? "border-black ring-2 ring-black/10 opacity-100"
                          : "border-slate-200 opacity-50 hover:opacity-75"
                        }`}
                      aria-label={`Voir photo ${i + 1}`}
                    >
                      <Image
                        src={p.url}
                        alt={`photo ${i + 1}`}
                        fill
                        className="object-cover"
                        sizes="96px"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* ── Right: Details ── */}
            <div className="flex flex-col gap-3">

              {/* Localisation */}
              <div className="rounded-xl border border-slate-100 bg-white px-4 py-3.5">
                <Label>Localisation</Label>
                <div className="flex items-start gap-2 mt-1">
                  <MapPin className="h-4 w-4 shrink-0 mt-0.5 text-emerald-400" strokeWidth={2} />
                  <div>
                    <p className="text-[14.5px] font-bold text-black tracking-tight">{vehicle.ville}</p>
                    {vehicle.adresse && (
                      <p className="text-[11.5px] text-black/40 font-medium mt-0.5 leading-snug">
                        {vehicle.adresse}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Specs grid */}
              <div className="grid grid-cols-2 gap-2">
                <InfoCard label="Type"         value={TYPE_LABELS[vehicle.type] ?? vehicle.type} />
                <InfoCard label="Carburant"    value={vehicle.carburant ?? "—"}                  icon={Gauge} />
                <InfoCard label="Transmission" value={vehicle.transmission ?? "—"} />
                <InfoCard label="Places"       value={vehicle.nombrePlaces ?? "—"}               icon={Users} />
                <InfoCard label="Âge minimum"  value={`${vehicle.ageMinimum ?? 18} ans`}         icon={Shield} />
                <InfoCard label="Durée min."   value={`${vehicle.joursMinimum} jour(s)`}         icon={Clock} />
              </div>

              {/* Zone + assurance — accent */}
              {(vehicle.zoneConduite || vehicle.assurance) && (
                <div className="flex flex-col gap-2">
                  {vehicle.zoneConduite && (
                    <InfoCard label="Zone de conduite" value={vehicle.zoneConduite} icon={MapPin}  accent />
                  )}
                  {vehicle.assurance && (
                    <InfoCard label="Assurance"        value={vehicle.assurance}    icon={Shield} accent />
                  )}
                </div>
              )}

              {/* Règles spécifiques */}
              {vehicle.reglesSpecifiques && (
                <div className="rounded-xl border border-slate-100 bg-white px-3.5 py-3">
                  <Label>Règles spécifiques</Label>
                  <p className="text-[12.5px] text-black/50 leading-relaxed mt-1">
                    {vehicle.reglesSpecifiques}
                  </p>
                </div>
              )}

              {/* Tarification progressive */}
              {tiers.length > 0 && (
                <div className="rounded-xl border border-slate-100 bg-white overflow-hidden">
                  {/* Header */}
                  <div className="flex items-center gap-2 px-3.5 py-2.5 border-b border-slate-100 bg-black">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-400">
                      Tarification progressive
                    </p>
                  </div>

                  {/* Column labels */}
                  <div className="grid grid-cols-3 px-3.5 py-2
                    text-[10px] font-bold uppercase tracking-widest text-black/30
                    border-b border-slate-100 bg-slate-50">
                    <span>À partir</span>
                    <span>Jusqu'à</span>
                    <span>Prix / j</span>
                  </div>

                  {/* Rows */}
                  {tiers.map((t, i) => (
                    <div
                      key={t.id}
                      className={`grid grid-cols-3 items-center px-3.5 py-3
                        border-t border-slate-50
                        ${i % 2 === 0 ? "bg-white" : "bg-slate-50/60"}`}
                    >
                      <span className="text-[13.5px] font-bold text-black">{t.joursMin} j</span>
                      <span className="text-[13.5px] font-bold text-black">{t.joursMax ?? "∞"}</span>
                      <span className="text-[14.5px] font-black tabular-nums text-emerald-500">
                        {formatPrice(Number(t.prix))}
                        <span className="text-[10px] font-bold ml-1 text-emerald-400/70 tracking-wide">
                          FCFA
                        </span>
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── Footer / Actions ── */}
        <div className="shrink-0 border-t border-slate-100 bg-white px-5 py-4">
          <div className="flex items-center gap-2.5 flex-wrap">

            {/* Modifier — black pill */}
            <button
              type="button"
              onClick={() => onEdit(vehicle)}
              className="inline-flex items-center gap-2 h-10 rounded-xl bg-black text-white
                px-4 text-[13px] font-semibold tracking-tight
                hover:bg-black/80 shadow-md shadow-black/15
                hover:shadow-lg hover:shadow-black/20 hover:-translate-y-px active:translate-y-0
                transition-all duration-200"
            >
              <Pencil className="h-3.5 w-3.5" strokeWidth={2} />
              Modifier
            </button>

            {/* Réservations — outlined */}
            <Link
              href={`/dashboard/owner/vehicles/${vehicle.id}/reservations`}
              className="inline-flex items-center gap-2 h-10 rounded-xl
                border border-slate-200 bg-white px-4 text-[13px] font-semibold text-black tracking-tight
                hover:bg-slate-50 hover:border-slate-300 transition-all duration-150"
              onClick={(e) => e.stopPropagation()}
            >
              <CalendarDays className="h-3.5 w-3.5" strokeWidth={1.5} />
              Réservations
              <ChevronRight className="h-3.5 w-3.5 text-black/30" strokeWidth={2} />
            </Link>

            {/* Voir l'annonce — emerald */}
            {isActive && (
              <Link
                href={`/vehicles/${vehicle.id}`}
                target="_blank"
                className="inline-flex items-center gap-2 h-10 rounded-xl px-4 text-[13px] font-semibold
                  border border-emerald-400/30 text-emerald-600 bg-emerald-400/8
                  hover:bg-emerald-400/14 hover:border-emerald-400/50
                  transition-all duration-150 tracking-tight"
                onClick={(e) => e.stopPropagation()}
              >
                <ExternalLink className="h-3.5 w-3.5" strokeWidth={2} />
                Voir l&apos;annonce
              </Link>
            )}

            <div className="flex-1" />

            {/* Archiver — danger ghost */}
            {vehicle.statut !== "ARCHIVE" && (
              <button
                type="button"
                onClick={() => onArchive(vehicle)}
                className="inline-flex items-center gap-2 h-10 rounded-xl px-4
                  text-[13px] font-semibold text-black/40 tracking-tight
                  hover:text-red-500 hover:bg-red-50
                  transition-all duration-150"
              >
                <Archive className="h-3.5 w-3.5" strokeWidth={1.5} />
                Archiver
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}