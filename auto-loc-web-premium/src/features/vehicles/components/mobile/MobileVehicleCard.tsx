"use client";

import React, { useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Vehicle } from "../../types/vehicle.types";
import { getTenantPricePerDay } from "@/lib/utils";
import {
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
  Cog,
  Fuel,
  MapPin,
  ShieldCheck,
  Sparkles,
  Star,
  Users,
} from "lucide-react";

interface MobileVehicleCardProps {
  vehicle: Vehicle;
  priorityImage?: boolean;
  layout?: "horizontal" | "vertical";
}

const FALLBACK_PHOTO =
  "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?q=80&w=800&auto=format&fit=crop";

const formatPrice = (price: number) => new Intl.NumberFormat("fr-FR").format(price);

/* -------------------------------------------------------------------------- */
/*  Carrousel photo : swipe tactile + précédent/suivant (desktop)             */
/* -------------------------------------------------------------------------- */

function usePhotoCarousel(count: number) {
  const [index, setIndex] = useState(0);
  const touchStart = useRef<{ x: number; y: number } | null>(null);
  const swiped = useRef(false);

  const current = index < count ? index : 0;

  const go = (direction: 1 | -1) =>
    setIndex((prev) => (prev + direction + count) % count);

  const onTouchStart = (e: React.TouchEvent) => {
    const t = e.touches[0];
    touchStart.current = { x: t.clientX, y: t.clientY };
    swiped.current = false;
  };

  const onTouchEnd = (e: React.TouchEvent) => {
    if (!touchStart.current || count < 2) return;
    const t = e.changedTouches[0];
    const dx = t.clientX - touchStart.current.x;
    const dy = t.clientY - touchStart.current.y;
    touchStart.current = null;
    if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy) * 1.5) {
      swiped.current = true;
      go(dx < 0 ? 1 : -1);
    }
  };

  // Un swipe ne doit jamais ouvrir la fiche véhicule
  const guardClick = (e: React.MouseEvent) => {
    if (swiped.current) {
      e.preventDefault();
      e.stopPropagation();
      swiped.current = false;
    }
  };

  const step = (direction: 1 | -1) => (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    go(direction);
  };

  return {
    current,
    touch: { onTouchStart, onTouchEnd },
    guardClick,
    next: step(1),
    prev: step(-1),
  };
}

/* -------------------------------------------------------------------------- */
/*  Petits blocs partagés                                                     */
/* -------------------------------------------------------------------------- */

const VehicleBadge: React.FC<{ featured?: boolean; compact?: boolean }> = ({
  featured,
  compact,
}) => {
  const size = compact ? "px-1.5 py-0.5 text-[10px] gap-1" : "px-2.5 py-1 text-[11px] gap-1.5";
  const icon = compact ? "h-2.5 w-2.5" : "h-3 w-3";

  if (featured) {
    return (
      <span
        className={`inline-flex items-center rounded-full bg-champagne font-semibold text-brand-main shadow-sm ${size}`}
      >
        <Sparkles className={icon} aria-hidden />
        Premium
      </span>
    );
  }
  return (
    <span
      className={`inline-flex items-center rounded-full bg-brand-main/85 font-medium text-champagne backdrop-blur-sm ${size}`}
    >
      <ShieldCheck className={icon} aria-hidden />
      Vérifié
    </span>
  );
};

const PhotoIndicator: React.FC<{ count: number; index: number }> = ({ count, index }) => {
  if (count < 2) return null;

  if (count > 5) {
    return (
      <span className="rounded-full bg-black/45 px-2 py-0.5 text-[10px] font-medium tabular-nums text-white backdrop-blur-sm">
        {index + 1}/{count}
      </span>
    );
  }

  return (
    <span className="flex items-center gap-1" aria-hidden>
      {Array.from({ length: count }).map((_, i) => (
        <span
          key={i}
          className={`h-1.5 rounded-full transition-all duration-200 motion-reduce:transition-none ${i === index ? "w-4 bg-champagne" : "w-1.5 bg-white/60"
            }`}
        />
      ))}
    </span>
  );
};

const Rating: React.FC<{ note: number; total: number }> = ({ note, total }) => (
  <span className="inline-flex shrink-0 items-center gap-1 text-xs font-semibold text-slate-800">
    <Star className="h-3.5 w-3.5 fill-[#C9A24B] text-[#C9A24B]" aria-hidden />
    {note.toFixed(1)}
    <span className="font-normal text-slate-400">({total})</span>
  </span>
);

const Spec: React.FC<{ icon: React.ReactNode; children: React.ReactNode }> = ({
  icon,
  children,
}) => (
  <span className="inline-flex items-center gap-1.5 whitespace-nowrap">
    <span className="text-brand-main/55">{icon}</span>
    {children}
  </span>
);

const ArrowButton: React.FC<{ size?: "sm" | "md" }> = ({ size = "md" }) => (
  <span
    aria-hidden
    className={`flex shrink-0 items-center justify-center rounded-full bg-brand-main text-champagne transition-colors duration-200 group-hover:bg-forest-700 motion-reduce:transition-none ${size === "sm" ? "h-8 w-8" : "h-10 w-10"
      }`}
  >
    <ArrowUpRight className={size === "sm" ? "h-4 w-4" : "h-5 w-5"} />
  </span>
);

/* -------------------------------------------------------------------------- */
/*  Carte                                                                     */
/* -------------------------------------------------------------------------- */

export const MobileVehicleCard: React.FC<MobileVehicleCardProps> = ({
  vehicle,
  priorityImage = false,
  layout = "horizontal",
}) => {
  const photosList: string[] = useMemo(() => {
    if (vehicle.photos && vehicle.photos.length > 0) {
      return vehicle.photos.map((p) => (typeof p === "string" ? p : p.url));
    }
    if (vehicle.photoUrl) return [vehicle.photoUrl];
    return [FALLBACK_PHOTO];
  }, [vehicle.photos, vehicle.photoUrl]);

  const carousel = usePhotoCarousel(photosList.length);

  const title = `${vehicle.marque} ${vehicle.modele}`;
  const href = `/vehicles/${vehicle.id}`;
  const note = Number(vehicle.note || 0);
  const totalAvis = Number(vehicle.totalAvis || 0);
  const hasRating = note > 0 && totalAvis > 0;
  const isAuto = vehicle.transmission === "AUTOMATIQUE";
  const fuel = String(vehicle.carburant || "Essence").toLowerCase();
  const seats = vehicle.nombrePlaces || 5;

  const tenantPrice = getTenantPricePerDay(vehicle.prixParJour);

  const shell = `group relative w-full bg-white shadow-[0_1px_2px_rgba(10,61,46,0.06),0_12px_28px_-16px_rgba(10,61,46,0.28)] ring-1 ${vehicle.isFeatured ? "ring-[#E4CB8E]" : "ring-slate-900/[0.06]"
    }`;

  const focus =
    "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-main";

  /* ------------------------------------------------------------------------ */
  /*  HORIZONTAL : vignette à gauche, infos à droite                          */
  /* ------------------------------------------------------------------------ */
  if (layout === "horizontal") {
    return (
      <Link
        href={href}
        onClickCapture={carousel.guardClick}
        className={`${shell} flex flex-row items-stretch gap-3 overflow-hidden rounded-[20px] p-2 transition-transform duration-200 active:scale-[0.99] motion-reduce:transition-none motion-reduce:active:scale-100 ${focus}`}
      >
        {/* Vignette */}
        <div
          {...carousel.touch}
          className="relative min-h-[8.75rem] w-32 shrink-0 touch-pan-y self-stretch overflow-hidden rounded-xl bg-slate-950 sm:w-36"
        >
          <Image
            src={photosList[carousel.current]}
            alt={title}
            fill
            priority={priorityImage}
            className="object-cover"
            sizes="(max-width: 640px) 128px, 144px"
          />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/15" />

          <div className="absolute left-1.5 top-1.5">
            <VehicleBadge featured={vehicle.isFeatured} compact />
          </div>
          <div className="absolute inset-x-0 bottom-1.5 flex justify-center">
            <PhotoIndicator count={photosList.length} index={carousel.current} />
          </div>
        </div>

        {/* Infos */}
        <div className="flex min-w-0 flex-1 flex-col justify-between py-0.5 pr-1">
          <div>
            <h3 className="truncate font-serif text-base font-normal leading-snug text-slate-900">
              {title}
            </h3>

            <div className="mt-0.5 flex items-center gap-2 text-[11px] text-slate-500">
              <span className="flex min-w-0 items-center gap-1">
                <MapPin className="h-3 w-3 shrink-0 text-brand-main/60" aria-hidden />
                <span className="truncate">{vehicle.ville || "Dakar"}</span>
                <span className="h-3 w-px shrink-0 bg-slate-200" aria-hidden />
                <span className="shrink-0">{vehicle.annee}</span>
              </span>
            </div>

            <div className="mt-2.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-slate-600">
              <Spec icon={<Cog className="h-3 w-3" aria-hidden />}>{isAuto ? "Auto" : "Manuelle"}</Spec>
              <Spec icon={<Fuel className="h-3 w-3" aria-hidden />}>
                <span className="capitalize">{fuel}</span>
              </Spec>
              <Spec icon={<Users className="h-3 w-3" aria-hidden />}>{seats} pl.</Spec>
            </div>
          </div>

          <div className="mt-2.5 flex items-center justify-between border-t border-slate-100 pt-2">
            <p className="flex items-baseline gap-1">
              <span className="font-serif text-lg font-normal tabular-nums text-brand-main">
                {formatPrice(tenantPrice)}
              </span>
              <span className="text-[10px] text-slate-500">FCFA/jour</span>
            </p>
            <ArrowButton size="sm" />
          </div>
        </div>
      </Link>
    );
  }

  /* ------------------------------------------------------------------------ */
  /*  VERTICAL : photo en tête, infos dessous                                 */
  /* ------------------------------------------------------------------------ */
  return (
    <article
      className={`${shell} overflow-hidden rounded-3xl p-2 transition-transform duration-200 active:scale-[0.99] motion-reduce:transition-none motion-reduce:active:scale-100`}
    >
      {/* Galerie : la photo est cliquable, les contrôles restent au-dessus */}
      <div
        {...carousel.touch}
        onClickCapture={carousel.guardClick}
        className="relative aspect-[4/3] w-full touch-pan-y overflow-hidden rounded-2xl bg-slate-950"
      >
        <Image
          src={photosList[carousel.current]}
          alt={title}
          fill
          priority={priorityImage}
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 50vw"
        />

        <Link href={href} aria-hidden tabIndex={-1} className="absolute inset-0 z-[1]" />

        <div className="pointer-events-none absolute inset-0 z-[2] bg-gradient-to-t from-black/45 via-transparent to-black/20" />

        <div className="pointer-events-none absolute left-3 top-3 z-[3]">
          <VehicleBadge featured={vehicle.isFeatured} />
        </div>

        <div className="pointer-events-none absolute inset-x-0 bottom-3 z-[3] flex justify-center">
          <PhotoIndicator count={photosList.length} index={carousel.current} />
        </div>

        {photosList.length > 1 && (
          <>
            <button
              type="button"
              onClick={carousel.prev}
              aria-label="Photo précédente"
              className="absolute left-2 top-1/2 z-[4] hidden h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-black/35 text-white opacity-0 backdrop-blur-sm transition-opacity focus-visible:opacity-100 group-hover:opacity-100 motion-reduce:transition-none [@media(hover:hover)]:flex"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={carousel.next}
              aria-label="Photo suivante"
              className="absolute right-2 top-1/2 z-[4] hidden h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-black/35 text-white opacity-0 backdrop-blur-sm transition-opacity focus-visible:opacity-100 group-hover:opacity-100 motion-reduce:transition-none [@media(hover:hover)]:flex"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </>
        )}
      </div>

      {/* Détails */}
      <Link href={href} className={`block rounded-2xl px-2 pb-1.5 pt-3.5 ${focus}`}>
        <div className="flex items-start justify-between gap-3">
          <h3 className="line-clamp-1 font-serif text-xl font-normal leading-tight text-slate-900">
            {title}
          </h3>
        </div>

        <div className="mt-1 flex items-center gap-2 text-xs text-slate-500">
          <MapPin className="h-3.5 w-3.5 shrink-0 text-brand-main/60" aria-hidden />
          <span>{vehicle.ville || "Dakar"}</span>
          <span className="h-3 w-px bg-slate-200" aria-hidden />
          <span>{vehicle.annee}</span>
        </div>

        <div className="mt-3.5 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-slate-600">
          <Spec icon={<Cog className="h-3.5 w-3.5" aria-hidden />}>
            {isAuto ? "Automatique" : "Manuelle"}
          </Spec>
          <Spec icon={<Fuel className="h-3.5 w-3.5" aria-hidden />}>
            <span className="capitalize">{fuel}</span>
          </Spec>
          <Spec icon={<Users className="h-3.5 w-3.5" aria-hidden />}>{seats} places</Spec>
        </div>

        <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3.5">
          <p className="flex items-baseline gap-1.5">
            <span className="font-serif text-2xl font-normal tabular-nums text-brand-main">
              {formatPrice(tenantPrice)}
            </span>
            <span className="text-xs text-slate-500">FCFA / jour</span>
          </p>
          <ArrowButton />
        </div>
      </Link>
    </article>
  );
};