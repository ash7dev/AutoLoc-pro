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
import { PremiumVehicleCard } from "@/features/vehicles/components/PremiumVehicleCard";
import { Vehicle } from "@/features/vehicles/types/vehicle.types";

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
      <div className="min-h-screen bg-[#062A20] text-[#FBF6E9] flex flex-col items-center justify-center p-6">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-[#F1DFB6] border-t-transparent" />
        <p className="mt-4 text-sm font-medium text-[#F1DFB6]">
          Chargement du profil hôte AutoLoc...
        </p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-[#062A20] text-[#FBF6E9] flex flex-col items-center justify-center p-6 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-500/10 text-red-400">
          <Car className="h-8 w-8" />
        </div>
        <h1 className="mt-4 text-2xl font-serif font-bold">Hôte introuvable</h1>
        <p className="mt-2 text-sm text-[#F1DFB6]/70 max-w-md">
          {error || "Ce profil n'est pas disponible ou l'hôte a retiré ses véhicules."}
        </p>
        <Link
          href="/vehicles"
          className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#F1DFB6] px-5 py-2.5 text-sm font-semibold text-[#0A3D2E] transition-transform hover:scale-105"
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
    <div className="min-h-screen bg-[#04150F] text-[#FBF6E9] pb-24">
      {/* ─── Top Navigation Bar ─── */}
      <div className="sticky top-0 z-30 border-b border-[#F1DFB6]/10 bg-[#0A3D2E]/90 backdrop-blur-md px-4 py-4 sm:px-8">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <Link
            href="/vehicles"
            className="flex items-center gap-2 text-xs font-semibold text-[#F1DFB6] hover:text-white transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Retour au catalogue</span>
          </Link>

          <span className="font-serif text-base font-medium text-[#FBF6E9]">
            Profil Hôte Partenaire
          </span>

          <button
            onClick={() => {
              if (navigator.share) {
                navigator.share({
                  title: `Profil ${host.nomCompletAffiche} sur AutoLoc`,
                  url: window.location.href,
                });
              }
            }}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-[#F1DFB6]/10 text-[#F1DFB6] hover:bg-[#F1DFB6]/20 transition-colors"
            title="Partager"
          >
            <Share2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      <main className="mx-auto max-w-7xl px-4 pt-8 sm:px-8">
        {/* ─── HERO HOST PROFILE CARD ─── */}
        <section className="relative overflow-hidden rounded-[32px] border border-[#F1DFB6]/20 bg-gradient-to-b from-[#0A3D2E] to-[#062A20] p-6 sm:p-10 shadow-2xl">
          <div className="flex flex-col gap-8 sm:flex-row sm:items-center sm:justify-between">
            {/* Host Identity */}
            <div className="flex items-center gap-6">
              <div className="relative">
                {host.avatarUrl ? (
                  <Image
                    src={host.avatarUrl}
                    alt={host.nomCompletAffiche}
                    width={88}
                    height={88}
                    className="h-22 w-22 rounded-full border-4 border-[#10B981] object-cover shadow-lg"
                    unoptimized
                  />
                ) : (
                  <div className="flex h-22 w-22 items-center justify-center rounded-full border-4 border-[#10B981] bg-[#063B2B] text-3xl font-bold text-[#4ADE80]">
                    {(host.prenom[0] || "H").toUpperCase()}
                  </div>
                )}
                {isSuperhost && (
                  <span className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full bg-[#F59E0B] text-white shadow-md">
                    <Award className="h-4 w-4" />
                  </span>
                )}
              </div>

              <div>
                <div className="flex items-center gap-2.5">
                  <h1 className="font-serif text-2xl font-bold text-[#FBF6E9] sm:text-3xl">
                    {host.nomCompletAffiche}
                  </h1>
                  <CheckCircle2 className="h-6 w-6 text-[#10B981]" />
                </div>

                <div className="mt-2.5 flex flex-wrap items-center gap-2">
                  {isSuperhost ? (
                    <span className="flex items-center gap-1.5 rounded-full border border-[#F5C451]/40 bg-[#F5C451]/15 px-3 py-1 text-xs font-bold text-[#F5C451]">
                      <Award className="h-3.5 w-3.5" />
                      SUPERHOST
                    </span>
                  ) : (
                    <span className="flex items-center gap-1.5 rounded-full border border-[#10B981]/40 bg-[#10B981]/15 px-3 py-1 text-xs font-bold text-[#4ADE80]">
                      <ShieldCheck className="h-3.5 w-3.5" />
                      HÔTE VÉRIFIÉ
                    </span>
                  )}
                  <span className="flex items-center gap-1.5 rounded-full bg-white/5 px-3 py-1 text-xs font-medium text-[#F1DFB6]/80">
                    <Calendar className="h-3.5 w-3.5" />
                    Membre depuis {memberYear}
                  </span>
                </div>
              </div>
            </div>

            {/* Metrics Bar */}
            <div className="grid grid-cols-3 divide-x divide-[#F1DFB6]/15 rounded-2xl border border-[#F1DFB6]/15 bg-white/5 p-4 sm:p-5 text-center shadow-inner">
              <div className="px-3">
                <div className="flex items-center justify-center gap-1 text-lg font-bold text-white sm:text-xl">
                  <Star className="h-4 w-4 fill-[#F59E0B] text-[#F59E0B]" />
                  <span>{host.noteProprietaire > 0 ? host.noteProprietaire.toFixed(1) : "5.0"}</span>
                </div>
                <p className="mt-1 text-xs text-[#F1DFB6]/70">{host.totalAvis} avis</p>
              </div>

              <div className="px-3">
                <p className="text-lg font-bold text-white sm:text-xl">{host.totalLocations}</p>
                <p className="mt-1 text-xs text-[#F1DFB6]/70">locations</p>
              </div>

              <div className="px-3">
                <div className="flex items-center justify-center gap-1 text-lg font-bold text-[#4ADE80] sm:text-xl">
                  <Clock className="h-4 w-4" />
                  <span>{host.tauxReponse}%</span>
                </div>
                <p className="mt-1 text-xs text-[#F1DFB6]/70">réponse {host.tempsReponse}</p>
              </div>
            </div>
          </div>

          {/* Guarantees Box */}
          <div className="mt-8 grid grid-cols-1 gap-4 border-t border-[#F1DFB6]/15 pt-6 sm:grid-cols-2">
            <div className="flex items-start gap-3 rounded-xl bg-white/5 p-4 border border-[#F1DFB6]/10">
              <ShieldCheck className="h-5 w-5 shrink-0 text-[#10B981]" />
              <div>
                <h4 className="text-sm font-semibold text-[#FBF6E9]">Identité & Permis Contrôlés</h4>
                <p className="mt-0.5 text-xs text-[#F1DFB6]/70">
                  Pièce d'identité officielle et historique de conduite vérifiés par AutoLoc Security.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 rounded-xl bg-white/5 p-4 border border-[#F1DFB6]/10">
              <Sparkles className="h-5 w-5 shrink-0 text-[#10B981]" />
              <div>
                <h4 className="text-sm font-semibold text-[#FBF6E9]">Contrat Digital & Assurance</h4>
                <p className="mt-0.5 text-xs text-[#F1DFB6]/70">
                  État des lieux digital horodaté et contrat de location 100% sécurisé.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ─── HOST VEHICLE LISTINGS SECTION ─── */}
        <section className="mt-12">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#10B981]/15 text-[#10B981]">
                <Car className="h-5 w-5" />
              </div>
              <div>
                <h2 className="font-serif text-2xl font-bold text-[#FBF6E9]">
                  Flotte & Annonces de {host.prenom}
                </h2>
                <p className="text-xs text-[#F1DFB6]/70">
                  {vehicles.length} véhicules vérifiés disponibles à la location
                </p>
              </div>
            </div>

            {/* Filter pills */}
            {vehicleTypes.length > 1 && (
              <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0">
                <button
                  onClick={() => setFilterType("ALL")}
                  className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-colors ${
                    filterType === "ALL"
                      ? "bg-[#F1DFB6] text-[#0A3D2E]"
                      : "bg-white/5 text-[#F1DFB6] hover:bg-white/10"
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
                          ? "bg-[#F1DFB6] text-[#0A3D2E]"
                          : "bg-white/5 text-[#F1DFB6] hover:bg-white/10"
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
            <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filteredVehicles.map((veh) => (
                <PremiumVehicleCard key={veh.id} vehicle={veh} />
              ))}
            </div>
          ) : (
            <div className="mt-8 rounded-2xl border border-dashed border-[#F1DFB6]/20 bg-white/5 p-12 text-center">
              <Car className="mx-auto h-8 w-8 text-[#F1DFB6]/40" />
              <p className="mt-2 text-sm text-[#F1DFB6]/70">
                Aucun véhicule disponible dans cette catégorie.
              </p>
            </div>
          )}
        </section>

        {/* ─── TENANT REVIEWS SECTION ─── */}
        <section className="mt-16">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#F59E0B]/15 text-[#F59E0B]">
              <MessageSquare className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-serif text-2xl font-bold text-[#FBF6E9]">
                Avis laissés par les locataires
              </h2>
              <p className="text-xs text-[#F1DFB6]/70">
                {reviews.length} témoignages vérifiés
              </p>
            </div>
          </div>

          {reviews.length > 0 ? (
            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
              {reviews.map((rev) => (
                <div
                  key={rev.id}
                  className="rounded-2xl border border-[#F1DFB6]/15 bg-[#0A3D2E]/50 p-5 shadow-sm backdrop-blur-sm"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {rev.auteurAvatar ? (
                        <Image
                          src={rev.auteurAvatar}
                          alt={rev.auteurNom}
                          width={36}
                          height={36}
                          className="h-9 w-9 rounded-full object-cover"
                          unoptimized
                        />
                      ) : (
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-xs font-bold text-white">
                          {(rev.auteurNom[0] || "L").toUpperCase()}
                        </div>
                      )}
                      <div>
                        <h4 className="text-sm font-semibold text-[#FBF6E9]">
                          {rev.auteurNom}
                        </h4>
                        <p className="text-[11px] text-[#F1DFB6]/60">
                          Véhicule : {rev.vehiculeConcerne}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 rounded-md bg-[#F59E0B]/15 px-2 py-1 text-xs font-bold text-[#F59E0B]">
                      <Star className="h-3 w-3 fill-[#F59E0B]" />
                      <span>{rev.note.toFixed(1)}</span>
                    </div>
                  </div>

                  <p className="mt-3 text-xs leading-relaxed text-[#FBF6E9]/85">
                    "{rev.commentaire}"
                  </p>

                  <span className="mt-3 block text-[10px] text-[#F1DFB6]/50">
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
            <div className="mt-6 rounded-2xl border border-dashed border-[#F1DFB6]/20 bg-white/5 p-8 text-center">
              <Star className="mx-auto h-6 w-6 text-[#F1DFB6]/40" />
              <p className="mt-2 text-sm text-[#F1DFB6]/70">
                Cet hôte n'a pas encore de commentaires écrits.
              </p>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
