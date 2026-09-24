"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ShieldCheck,
  Award,
  Star,
  Clock,
  Car,
  CheckCircle2,
  Calendar,
  MessageSquare,
  Sparkles,
  ArrowLeft,
  Share2,
} from "lucide-react";
import { PremiumVehicleCard } from "@/src/features/vehicles/components/PremiumVehicleCard";
import { Vehicle } from "@/src/features/vehicles/types/vehicle.types";

interface PublicHostResponse {
  host: {
    id: string;
    userId: string;
    prenom: string;
    nomCompletAffiche: string;
    avatarUrl: string | null;
    statutKyc: string;
    noteProprietaire: number;
    totalAvis: number;
    totalLocations: number;
    isSuperhost: boolean;
    membreDepuis: string;
    tauxReponse: number;
    tempsReponse: string;
    annoncesCount: number;
  };
  vehicles: Vehicle[];
  reviews: Array<{
    id: string;
    note: number;
    commentaire: string;
    creeLe: string;
    auteurNom: string;
    auteurAvatar: string | null;
    vehiculeConcerne: string;
  }>;
}

export default function HostPublicProfilePage({
  params,
}: {
  params: { id: string };
}) {
  const [data, setData] = useState<PublicHostResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<string>("ALL");

  useEffect(() => {
    async function loadHostData() {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch(`/api/hosts/${params.id}`);
        if (!res.ok) {
          throw new Error("Impossible de charger le profil de cet hôte.");
        }
        const json = await res.json();
        setData(json);
      } catch (err: any) {
        console.error("Erreur chargement hôte:", err);
        setError(err?.message || "Erreur de connexion");
      } finally {
        setLoading(false);
      }
    }
    if (params.id) {
      loadHostData();
    }
  }, [params.id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-900 pb-24">
        {/* Nav Header Skeleton Light */}
        <div className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/90 backdrop-blur-md px-4 py-4 sm:px-8">
          <div className="mx-auto flex max-w-7xl items-center justify-between">
            <div className="h-9 w-9 animate-pulse rounded-full bg-slate-200" />
            <div className="h-5 w-44 animate-pulse rounded-lg bg-slate-200" />
            <div className="h-9 w-9 animate-pulse rounded-full bg-slate-200" />
          </div>
        </div>

        <main className="mx-auto max-w-7xl px-4 pt-8 sm:px-8 space-y-10">
          {/* Hero Profile Card Skeleton Light */}
          <div className="rounded-[32px] border border-slate-200/80 bg-white p-6 sm:p-10 shadow-sm animate-pulse">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-6">
                <div className="h-22 w-22 rounded-full bg-slate-200 shrink-0" />
                <div className="space-y-3">
                  <div className="h-8 w-52 rounded-xl bg-slate-200" />
                  <div className="flex gap-2">
                    <div className="h-6 w-28 rounded-full bg-slate-200" />
                    <div className="h-6 w-32 rounded-full bg-slate-200" />
                  </div>
                </div>
              </div>
              <div className="h-20 w-full sm:w-80 rounded-2xl bg-slate-100" />
            </div>
            <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-slate-100 pt-6">
              <div className="h-16 rounded-xl bg-slate-100" />
              <div className="h-16 rounded-xl bg-slate-100" />
            </div>
          </div>

          {/* Listings Grid Skeleton Light */}
          <div className="space-y-6">
            <div className="h-8 w-64 animate-pulse rounded-lg bg-slate-200" />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-96 rounded-[28px] bg-white animate-pulse border border-slate-200 p-2 shadow-xs">
                  <div className="h-48 w-full rounded-[22px] bg-slate-200" />
                  <div className="p-4 space-y-4">
                    <div className="h-6 w-3/4 rounded-lg bg-slate-200" />
                    <div className="h-4 w-1/3 rounded-lg bg-slate-200" />
                    <div className="h-12 w-full rounded-xl bg-slate-200" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col items-center justify-center p-6 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-rose-100 text-rose-600">
          <Car className="h-8 w-8" />
        </div>
        <h1 className="mt-4 text-2xl font-serif font-bold text-slate-900">Hôte introuvable</h1>
        <p className="mt-2 text-sm text-slate-600 max-w-md">
          {error || "Ce profil n'est pas disponible ou l'hôte a retiré ses véhicules."}
        </p>
        <Link
          href="/vehicles"
          className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#0A3D2E] px-5 py-2.5 text-sm font-semibold text-[#F1DFB6] transition-transform hover:scale-105 shadow-md"
        >
          <ArrowLeft className="h-4 w-4" />
          Explorer les véhicules
        </Link>
      </div>
    );
  }

  const { host, vehicles, reviews } = data;
  const isSuperhost = host.isSuperhost;
  const memberYear = host.membreDepuis ? new Date(host.membreDepuis).getFullYear() : 2024;

  const vehicleTypes = Array.from(new Set(vehicles.map((v) => v.type).filter(Boolean)));
  const filteredVehicles =
    filterType === "ALL"
      ? vehicles
      : vehicles.filter((v) => v.type?.toUpperCase() === filterType.toUpperCase());

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-24">
      {/* ─── Top Navigation Bar Light ─── */}
      <div className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/90 backdrop-blur-md px-4 py-4 sm:px-8 shadow-xs">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <Link
            href="/vehicles"
            className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors"
            title="Retour"
            aria-label="Retour"
          >
            <ArrowLeft className="h-5 w-5 text-slate-700" />
          </Link>

          <span className="font-fraunces text-base font-normal text-[#041912]">
            Profil Hôte Partenaire
          </span>

          <button
            onClick={() => {
              if (navigator.share) {
                navigator.share({
                  title: `Profil ${host.nomCompletAffiche} sur AutoLoc`,
                  url: window.location.href,
                });
              } else if (navigator.clipboard) {
                navigator.clipboard.writeText(window.location.href);
                alert("Lien du profil copié !");
              }
            }}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors"
            title="Partager"
          >
            <Share2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      <main className="mx-auto max-w-7xl px-4 pt-8 sm:px-8 space-y-10">
        {/* ─── HERO HOST PROFILE CARD (WHITE PREMIUM BACKGROUND) ─── */}
        <section className="relative overflow-hidden rounded-[32px] border border-slate-200/80 bg-white p-6 sm:p-10 shadow-sm">
          <div className="flex flex-col gap-8 sm:flex-row sm:items-center sm:justify-between">
            {/* Host Identity */}
            <div className="flex items-center gap-6">
              <div className="relative">
                <Image
                  src={
                    host.avatarUrl && host.avatarUrl.trim() !== ""
                      ? host.avatarUrl
                      : `https://ui-avatars.com/api/?name=${encodeURIComponent(host.prenom)}&background=0A3D2E&color=F1DFB6&bold=true&size=256`
                  }
                  alt={host.nomCompletAffiche}
                  width={88}
                  height={88}
                  className="h-22 w-22 rounded-full border-4 border-emerald-500 object-cover shadow-md"
                  unoptimized
                />
                {isSuperhost && (
                  <span className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full bg-amber-500 text-white shadow-md">
                    <Award className="h-4 w-4" />
                  </span>
                )}
              </div>

              <div>
                <div className="flex items-center gap-2.5">
                  <h1 className="font-fraunces text-2xl font-normal text-[#041912] sm:text-3xl">
                    {host.nomCompletAffiche}
                  </h1>
                  <CheckCircle2 className="h-6 w-6 text-emerald-600" />
                </div>

                <div className="mt-2.5 flex flex-wrap items-center gap-2">
                  {isSuperhost ? (
                    <span className="flex items-center gap-1.5 rounded-full border border-amber-300 bg-amber-50 px-3 py-1 text-xs font-bold text-amber-800">
                      <Award className="h-3.5 w-3.5" />
                      SUPERHOST
                    </span>
                  ) : (
                    <span className="flex items-center gap-1.5 rounded-full border border-emerald-300 bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-800">
                      <ShieldCheck className="h-3.5 w-3.5" />
                      HÔTE VÉRIFIÉ
                    </span>
                  )}
                  <span className="flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                    <Calendar className="h-3.5 w-3.5 text-slate-500" />
                    Membre depuis {memberYear}
                  </span>
                </div>
              </div>
            </div>

            {/* Metrics Bar Light */}
            <div className="grid grid-cols-3 divide-x divide-slate-200 rounded-2xl border border-slate-200/80 bg-slate-50 p-4 sm:p-5 text-center shadow-xs">
              <div className="px-3">
                <div className="flex items-center justify-center gap-1 text-lg font-bold text-slate-900 sm:text-xl">
                  <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                  <span>{host.noteProprietaire > 0 ? host.noteProprietaire.toFixed(1) : "5.0"}</span>
                </div>
                <p className="mt-1 text-xs text-slate-500">{host.totalAvis} avis</p>
              </div>

              <div className="px-3">
                <p className="text-lg font-bold text-slate-900 sm:text-xl">{host.totalLocations}</p>
                <p className="mt-1 text-xs text-slate-500">locations</p>
              </div>

              <div className="px-3">
                <div className="flex items-center justify-center gap-1 text-lg font-bold text-emerald-600 sm:text-xl">
                  <Clock className="h-4 w-4" />
                  <span>{host.tauxReponse}%</span>
                </div>
                <p className="mt-1 text-xs text-slate-500">réponse {host.tempsReponse}</p>
              </div>
            </div>
          </div>

          {/* Guarantees Box Light */}
          <div className="mt-8 grid grid-cols-1 gap-4 border-t border-slate-100 pt-6 sm:grid-cols-2">
            <div className="flex items-start gap-3.5 rounded-2xl bg-slate-50 p-4 border border-slate-200/80">
              <ShieldCheck className="h-5 w-5 shrink-0 text-emerald-600 mt-0.5" />
              <div>
                <h4 className="text-sm font-semibold text-slate-900">Identité & Permis Contrôlés</h4>
                <p className="mt-0.5 text-xs text-slate-600 leading-relaxed">
                  Pièce d'identité officielle et permis de conduire vérifiés par la sécurité AutoLoc.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3.5 rounded-2xl bg-slate-50 p-4 border border-slate-200/80">
              <Sparkles className="h-5 w-5 shrink-0 text-emerald-600 mt-0.5" />
              <div>
                <h4 className="text-sm font-semibold text-slate-900">Contrat Digital & Assurance</h4>
                <p className="mt-0.5 text-xs text-slate-600 leading-relaxed">
                  État des lieux digital photo horodaté et contrat de location 100% sécurisé.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ─── HOST VEHICLE LISTINGS SECTION ─── */}
        <section className="space-y-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-800">
                <Car className="h-5 w-5" />
              </div>
              <div>
                <h2 className="font-fraunces text-2xl font-normal text-[#041912]">
                  Flotte & Annonces de {host.prenom}
                </h2>
                <p className="text-xs text-slate-500">
                  {vehicles.length} véhicules vérifiés disponibles à la location
                </p>
              </div>
            </div>

            {/* Filter pills Light */}
            {vehicleTypes.length > 1 && (
              <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0">
                <button
                  onClick={() => setFilterType("ALL")}
                  className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-colors ${
                    filterType === "ALL"
                      ? "bg-[#0A3D2E] text-[#F1DFB6]"
                      : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-100"
                  }`}
                >
                  Tous ({vehicles.length})
                </button>
                {vehicleTypes.map((t) => {
                  const cnt = vehicles.filter((v) => v.type === t).length;
                  return (
                    <button
                      key={t}
                      onClick={() => setFilterType(t)}
                      className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-colors ${
                        filterType === t
                          ? "bg-[#0A3D2E] text-[#F1DFB6]"
                          : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-100"
                      }`}
                    >
                      {t} ({cnt})
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Cards Grid */}
          {filteredVehicles.length > 0 ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filteredVehicles.map((veh) => (
                <PremiumVehicleCard key={veh.id} vehicle={veh} />
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center shadow-xs">
              <Car className="mx-auto h-8 w-8 text-slate-400" />
              <p className="mt-2 text-sm text-slate-600">
                Aucun véhicule disponible dans cette catégorie.
              </p>
            </div>
          )}
        </section>

        {/* ─── TENANT REVIEWS SECTION LIGHT ─── */}
        <section className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 text-amber-800">
              <MessageSquare className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-fraunces text-2xl font-normal text-[#041912]">
                Avis laissés par les locataires
              </h2>
              <p className="text-xs text-slate-500">
                {reviews.length} témoignages vérifiés
              </p>
            </div>
          </div>

          {reviews.length > 0 ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {reviews.map((rev) => (
                <div
                  key={rev.id}
                  className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {rev.auteurAvatar ? (
                        <Image
                          src={rev.auteurAvatar}
                          alt={rev.auteurNom}
                          width={36}
                          height={36}
                          className="h-9 w-9 rounded-full object-cover border border-slate-200"
                          unoptimized
                        />
                      ) : (
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-200 text-xs font-bold text-slate-700">
                          {(rev.auteurNom[0] || "L").toUpperCase()}
                        </div>
                      )}
                      <div>
                        <h4 className="text-sm font-semibold text-slate-900">
                          {rev.auteurNom}
                        </h4>
                        <p className="text-[11px] text-slate-500">
                          Véhicule : {rev.vehiculeConcerne}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 rounded-md bg-amber-50 px-2 py-1 text-xs font-bold text-amber-700 border border-amber-200">
                      <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                      <span>{rev.note.toFixed(1)}</span>
                    </div>
                  </div>

                  <p className="mt-3 text-xs leading-relaxed text-slate-700">
                    "{rev.commentaire}"
                  </p>

                  <span className="mt-3 block text-[10px] text-slate-400">
                    Publié le{" "}
                    {new Date(rev.creeLe).toLocaleDateString("fr-FR", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center shadow-xs">
              <Star className="mx-auto h-6 w-6 text-slate-400" />
              <p className="mt-2 text-sm text-slate-600">
                Cet hôte n'a pas encore de commentaires écrits.
              </p>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
