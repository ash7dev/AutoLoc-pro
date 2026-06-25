"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  XCircle,
  User,
  Car,
  Calendar,
  DollarSign,
  AlertTriangle,
  CheckCircle2,
  Clock,
  TrendingDown,
  Filter,
  ChevronRight,
  Ban,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { AdminCancellation } from "@/lib/nestjs/admin";

interface AdminCancellationsListProps {
  accessToken: string;
  initialData: {
    data: AdminCancellation[];
    total: number;
    totalPenalties: number;
    totalRefunds: number;
    page: number;
    limit: number;
  };
}

export function AdminCancellationsList({
  accessToken,
  initialData,
}: AdminCancellationsListProps) {
  const router = useRouter();
  const [filterBy, setFilterBy] = useState<string>("ALL");
  const [data, setData] = useState(initialData.data);

  const filters = [
    { key: "ALL", label: "Toutes", count: initialData.total },
    {
      key: "PROPRIETAIRE",
      label: "Propriétaires",
      count: initialData.data.filter((c) => c.annuleePar === "PROPRIETAIRE")
        .length,
    },
    {
      key: "LOCATAIRE",
      label: "Locataires",
      count: initialData.data.filter((c) => c.annuleePar === "LOCATAIRE")
        .length,
    },
    {
      key: "SYSTEM",
      label: "Auto (système)",
      count: initialData.data.filter((c) => c.annuleePar === "SYSTEM").length,
    },
    {
      key: "ADMIN",
      label: "Admin (forcé)",
      count: initialData.data.filter((c) => c.annuleePar === "ADMIN").length,
    },
  ];

  const filtered =
    filterBy === "ALL"
      ? data
      : data.filter((c) => c.annuleePar === filterBy);

  const fmtDate = (d: string) =>
    new Date(d).toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });

  const fmtDateTime = (d: string) =>
    new Date(d).toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });

  const fmtMoney = (n: number | string) => Number(n).toLocaleString("fr-FR");

  const getAnnuleeParBadge = (annuleePar: string) => {
    switch (annuleePar) {
      case "PROPRIETAIRE":
        return {
          label: "Propriétaire",
          color: "bg-orange-50 text-orange-700 border-orange-200",
        };
      case "LOCATAIRE":
        return {
          label: "Locataire",
          color: "bg-blue-50 text-blue-700 border-blue-200",
        };
      case "SYSTEM":
        return {
          label: "Auto (no-show)",
          color: "bg-purple-50 text-purple-700 border-purple-200",
        };
      case "ADMIN":
        return {
          label: "Admin (forcé)",
          color: "bg-red-50 text-red-700 border-red-200",
        };
      default:
        return {
          label: annuleePar,
          color: "bg-slate-50 text-slate-700 border-slate-200",
        };
    }
  };

  const getPaymentStatusBadge = (statut: string) => {
    switch (statut) {
      case "REMBOURSE":
        return {
          label: "Remboursé",
          icon: CheckCircle2,
          color: "text-emerald-600 bg-emerald-50 border-emerald-200",
        };
      case "EN_ATTENTE_REMBOURSEMENT":
        return {
          label: "En attente",
          icon: Clock,
          color: "text-amber-600 bg-amber-50 border-amber-200",
        };
      case "CONFIRME":
        return {
          label: "À rembourser",
          icon: AlertTriangle,
          color: "text-red-600 bg-red-50 border-red-200",
        };
      default:
        return {
          label: statut,
          icon: Ban,
          color: "text-slate-600 bg-slate-50 border-slate-200",
        };
    }
  };

  return (
    <div className="space-y-5">
      {/* Filters */}
      <div className="flex items-center gap-2 flex-wrap">
        <div className="flex items-center gap-2 text-slate-400 mr-2">
          <Filter className="w-3.5 h-3.5" strokeWidth={2.5} />
          <span className="text-[11px] font-bold uppercase tracking-wider">
            Filtrer par
          </span>
        </div>
        {filters.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilterBy(f.key)}
            className={cn(
              "px-3.5 py-1.5 rounded-xl text-[12px] font-bold border transition-all",
              filterBy === f.key
                ? "bg-black text-white border-black shadow-sm"
                : "bg-white text-slate-500 border-slate-200 hover:border-slate-300 hover:text-slate-800"
            )}
          >
            {f.label}
            <span className="ml-1.5 opacity-50">({f.count})</span>
          </button>
        ))}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-red-50 to-orange-50 border border-red-100 rounded-2xl p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-red-100 border border-red-200 flex items-center justify-center">
              <TrendingDown className="w-4 h-4 text-red-600" strokeWidth={2} />
            </div>
            <p className="text-[11px] font-black uppercase tracking-wider text-red-400">
              Pénalités appliquées
            </p>
          </div>
          <p className="text-[28px] font-black text-red-600 tabular-nums">
            {initialData.totalPenalties}
          </p>
          <p className="text-[12px] text-red-500 font-medium mt-1">
            {fmtMoney(
              initialData.data.reduce(
                (sum, c) => sum + (Number(c.penalite) || 0),
                0
              )
            )}{" "}
            FCFA total
          </p>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-100 rounded-2xl p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 border border-blue-200 flex items-center justify-center">
              <DollarSign className="w-4 h-4 text-blue-600" strokeWidth={2} />
            </div>
            <p className="text-[11px] font-black uppercase tracking-wider text-blue-400">
              Remboursements
            </p>
          </div>
          <p className="text-[28px] font-black text-blue-600 tabular-nums">
            {initialData.data.filter((c) => c.paiement?.rembourseLe).length}
          </p>
          <p className="text-[12px] text-blue-500 font-medium mt-1">
            {fmtMoney(
              initialData.data.reduce(
                (sum, c) =>
                  sum + (Number(c.paiement?.montantRembourse) || 0),
                0
              )
            )}{" "}
            FCFA remboursés
          </p>
        </div>

        <div className="bg-gradient-to-br from-amber-50 to-yellow-50 border border-amber-100 rounded-2xl p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 border border-amber-200 flex items-center justify-center">
              <Clock className="w-4 h-4 text-amber-600" strokeWidth={2} />
            </div>
            <p className="text-[11px] font-black uppercase tracking-wider text-amber-400">
              En attente InTouch
            </p>
          </div>
          <p className="text-[28px] font-black text-amber-600 tabular-nums">
            {
              initialData.data.filter(
                (c) => c.paiement?.statut === "CONFIRME" && !c.paiement.rembourseLe
              ).length
            }
          </p>
          <p className="text-[12px] text-amber-500 font-medium mt-1">
            Remboursements à traiter
          </p>
        </div>
      </div>

      {/* Liste */}
      {filtered.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center">
          <XCircle className="w-12 h-12 text-slate-300 mx-auto mb-3" strokeWidth={1.5} />
          <p className="text-[14px] font-bold text-slate-500">
            Aucune annulation trouvée
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((cancellation) => {
            const annuleeBadge = getAnnuleeParBadge(cancellation.annuleePar);
            const paymentBadge = getPaymentStatusBadge(
              cancellation.paiement?.statut || "N/A"
            );
            const PaymentIcon = paymentBadge.icon;
            const hasPenalty = cancellation.penalite && Number(cancellation.penalite) > 0;

            return (
              <div
                key={cancellation.id}
                onClick={() =>
                  router.push(
                    `/dashboard/admin/reservations/${cancellation.id}`
                  )
                }
                className="group bg-white border border-slate-200 rounded-2xl p-5 hover:border-slate-300 hover:shadow-md transition-all cursor-pointer"
              >
                {/* Header row */}
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-red-50 border border-red-100 flex items-center justify-center flex-shrink-0">
                      <XCircle
                        className="w-4 h-4 text-red-500"
                        strokeWidth={2}
                      />
                    </div>
                    <div>
                      <p className="text-[13px] font-black text-slate-800">
                        {cancellation.vehicule.marque}{" "}
                        <span className="text-emerald-600">
                          {cancellation.vehicule.modele}
                        </span>
                      </p>
                      <p className="text-[11px] text-slate-400 font-medium mt-0.5">
                        {cancellation.vehicule.immatriculation} •{" "}
                        {cancellation.vehicule.ville}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className={cn(
                        "px-2.5 py-1 rounded-lg text-[10px] font-bold border",
                        annuleeBadge.color
                      )}
                    >
                      {annuleeBadge.label}
                    </span>
                    <ChevronRight
                      className="w-4 h-4 text-slate-300 group-hover:text-slate-500 group-hover:translate-x-0.5 transition-all"
                      strokeWidth={2.5}
                    />
                  </div>
                </div>

                {/* Info grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
                  {/* Locataire */}
                  <div className="flex items-center gap-2.5 px-3 py-2 bg-slate-50 rounded-xl border border-slate-100">
                    <User
                      className="w-3.5 h-3.5 text-slate-400"
                      strokeWidth={2}
                    />
                    <div className="min-w-0">
                      <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">
                        Locataire
                      </p>
                      <p className="text-[12px] font-bold text-slate-800 truncate">
                        {cancellation.locataire.prenom}{" "}
                        {cancellation.locataire.nom}
                      </p>
                    </div>
                  </div>

                  {/* Propriétaire */}
                  <div className="flex items-center gap-2.5 px-3 py-2 bg-slate-50 rounded-xl border border-slate-100">
                    <Car
                      className="w-3.5 h-3.5 text-slate-400"
                      strokeWidth={2}
                    />
                    <div className="min-w-0">
                      <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">
                        Propriétaire
                      </p>
                      <p className="text-[12px] font-bold text-slate-800 truncate">
                        {cancellation.proprietaire.prenom}{" "}
                        {cancellation.proprietaire.nom}
                      </p>
                    </div>
                  </div>

                  {/* Date annulation */}
                  <div className="flex items-center gap-2.5 px-3 py-2 bg-slate-50 rounded-xl border border-slate-100">
                    <Calendar
                      className="w-3.5 h-3.5 text-slate-400"
                      strokeWidth={2}
                    />
                    <div className="min-w-0">
                      <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">
                        Annulée le
                      </p>
                      <p className="text-[12px] font-bold text-slate-800">
                        {fmtDateTime(cancellation.annuleeLe)}
                      </p>
                    </div>
                  </div>

                  {/* Paiement */}
                  <div
                    className={cn(
                      "flex items-center gap-2.5 px-3 py-2 rounded-xl border",
                      paymentBadge.color
                    )}
                  >
                    <PaymentIcon className="w-3.5 h-3.5" strokeWidth={2} />
                    <div className="min-w-0">
                      <p className="text-[9px] font-bold uppercase tracking-wider opacity-60">
                        Paiement
                      </p>
                      <p className="text-[12px] font-bold">
                        {paymentBadge.label}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Financial row */}
                <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                  <div className="flex items-center gap-6">
                    {/* Montant locataire */}
                    <div>
                      <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400 mb-0.5">
                        Montant total
                      </p>
                      <p className="text-[14px] font-black text-slate-800 tabular-nums">
                        {fmtMoney(cancellation.totalLocataire)} F
                      </p>
                    </div>

                    {/* Remboursement */}
                    {cancellation.paiement?.montantRembourse && (
                      <div>
                        <p className="text-[9px] font-bold uppercase tracking-wider text-blue-400 mb-0.5">
                          Remboursé
                        </p>
                        <p className="text-[14px] font-black text-blue-600 tabular-nums">
                          {fmtMoney(cancellation.paiement.montantRembourse)} F
                        </p>
                      </div>
                    )}

                    {/* Pénalité */}
                    {hasPenalty && (
                      <div>
                        <p className="text-[9px] font-bold uppercase tracking-wider text-red-400 mb-0.5">
                          Pénalité
                        </p>
                        <p className="text-[14px] font-black text-red-600 tabular-nums">
                          {fmtMoney(cancellation.penalite!)} F
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Raison */}
                  {cancellation.raisonAnnulation && (
                    <div className="max-w-md">
                      <p className="text-[10px] font-bold text-slate-400 mb-0.5">
                        Raison :
                      </p>
                      <p className="text-[11px] text-slate-600 italic line-clamp-2">
                        "{cancellation.raisonAnnulation}"
                      </p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
