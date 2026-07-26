import { cookies } from 'next/headers';
import { redirect, notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { ApiError } from '@/lib/nestjs/api-client';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { fetchVehicle } from '@/lib/nestjs/vehicles';
import { fetchVehicleReservations } from '@/lib/nestjs/reservations';
import { AvailabilityCalendar } from '@/features/vehicles/components/availability-calendar';
import { EditVehicleButton } from '@/features/vehicles/owner/EditVehicleButton';
import { DeleteVehicleButton } from '@/features/vehicles/owner/DeleteVehicleButton';
import { ShareVehicleButton } from '@/features/vehicles/owner/ShareVehicleButton';
import { VehicleRevenueChart } from '@/features/vehicles/owner/VehicleRevenueChart';
import { DocumentViewButton } from '@/features/vehicles/owner/DocumentViewButton';
import { ReservationStatusBadge } from '@/features/reservations/components/reservation-status';
import { VehiclePhotoGallery } from '@/features/vehicles/owner/VehiclePhotoGallery';
import { cn } from '@/lib/utils';
import {
  ArrowLeft, Car, Fuel, Settings2, Users, Star,
  Calendar, MapPin, Hash, Shield, TrendingUp,
  ExternalLink, ImageIcon, CalendarDays, FileText,
  MapPinned, ShieldCheck, UserCheck, ChevronRight,
  Eye, Banknote, Globe, Truck, CheckCircle2, XCircle,
  Package, Layers, Clock,
} from 'lucide-react';

/* ════════════════════════════════════════════════════════════════
   HELPERS
════════════════════════════════════════════════════════════════ */
function fmtMoney(n: number | string) {
  return Number(n).toLocaleString('fr-FR');
}

const VEHICLE_STATUS: Record<string, { label: string; cls: string; dot: string }> = {
  BROUILLON: { label: 'Brouillon', cls: 'bg-slate-100 border-slate-200 text-slate-600', dot: 'bg-slate-400' },
  EN_ATTENTE_VALIDATION: { label: 'En attente', cls: 'bg-amber-50 border-amber-200 text-amber-700', dot: 'bg-amber-400 animate-pulse' },
  VERIFIE: { label: 'Vérifié', cls: 'bg-emerald-50 border-emerald-200 text-emerald-700', dot: 'bg-emerald-500' },
  SUSPENDU: { label: 'Suspendu', cls: 'bg-red-50 border-red-200 text-red-600', dot: 'bg-red-400' },
  ARCHIVE: { label: 'Archivé', cls: 'bg-slate-100 border-slate-200 text-slate-400', dot: 'bg-slate-300' },
};

const FUEL_LABEL: Record<string, string> = {
  ESSENCE: 'Essence', DIESEL: 'Diesel', HYBRIDE: 'Hybride', ELECTRIQUE: 'Électrique',
};
const TRANS_LABEL: Record<string, string> = {
  AUTOMATIQUE: 'Automatique', MANUELLE: 'Manuelle',
};

/* ════════════════════════════════════════════════════════════════
   SUB-COMPONENTS
════════════════════════════════════════════════════════════════ */

/* ── Status badge ─────────────────────────────────────────────── */
function VehicleStatusBadge({ statut }: { statut: string }) {
  const s = VEHICLE_STATUS[statut] ?? VEHICLE_STATUS.BROUILLON;
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-[11px] font-bold ${s.cls}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
      {s.label}
    </span>
  );
}

/* ── Spec pill ────────────────────────────────────────────────── */
function SpecPill({ icon: Icon, label }: { icon: React.ElementType; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-xl bg-slate-100 border border-slate-100 px-3 py-1.5 text-[12px] font-semibold text-slate-600">
      <Icon className="w-3.5 h-3.5 text-slate-400" strokeWidth={1.75} />
      {label}
    </span>
  );
}

/* ── KPI card ─────────────────────────────────────────────────── */
function KpiCard({
  label, value, sub, icon: Icon, accent = false,
}: {
  label: string; value: string | number; sub?: string;
  icon: React.ElementType; accent?: boolean;
}) {
  return (
    <div className={cn(
      "rounded-2xl border p-4 sm:p-5 flex flex-col gap-3 shadow-sm transition-all hover:shadow-md",
      accent
        ? "bg-gradient-to-br from-emerald-50 to-emerald-50/50 border-emerald-200 hover:border-emerald-300"
        : "bg-white border-slate-200 hover:border-slate-300"
    )}>
      <div className={cn(
        "w-10 h-10 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center shadow-sm",
        accent
          ? "bg-gradient-to-br from-emerald-500 to-emerald-600 shadow-emerald-500/20"
          : "bg-gradient-to-br from-slate-800 to-slate-900 shadow-slate-900/20"
      )}>
        <Icon className={cn(
          "w-5 h-5 sm:w-5.5 sm:h-5.5",
          accent ? "text-white" : "text-emerald-400"
        )} strokeWidth={2} />
      </div>
      <div className="flex-1">
        <p className={cn(
          "text-[28px] sm:text-[32px] font-black tabular-nums tracking-tight leading-none",
          accent ? "text-emerald-700" : "text-slate-900"
        )}>{value}</p>
        {sub && <p className="text-[12px] text-slate-500 font-semibold mt-1.5">{sub}</p>}
      </div>
      <p className="text-[10px] sm:text-[9px] font-black uppercase tracking-[0.16em] text-slate-400 leading-tight">{label}</p>
    </div>
  );
}

/* ── Section card ─────────────────────────────────────────────── */
function SectionCard({
  title, icon: Icon, action, children, className,
}: {
  title: string; icon: React.ElementType;
  action?: React.ReactNode; children: React.ReactNode; className?: string;
}) {
  return (
    <div className={cn(
      "rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-md shadow-slate-100/60",
      className
    )}>
      <div className="flex items-center justify-between px-4 sm:px-5 py-3.5 sm:py-4 border-b border-slate-100 bg-gradient-to-r from-slate-50/50 to-white">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center shadow-md shadow-slate-900/20">
            <Icon className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-emerald-400" strokeWidth={2} />
          </div>
          <h3 className="text-[14px] sm:text-[15px] font-black text-slate-900 tracking-tight">{title}</h3>
        </div>
        {action}
      </div>
      <div className="p-4 sm:p-5">{children}</div>
    </div>
  );
}

/* ── Condition item ───────────────────────────────────────────── */
function ConditionItem({
  icon: Icon, iconBg, iconColor, label, sub,
}: {
  icon: React.ElementType; iconBg: string; iconColor: string;
  label: string; sub: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3.5 shadow-sm hover:shadow-md hover:border-slate-300 transition-all">
      <div className={cn(
        "w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 border shadow-sm",
        iconBg
      )}>
        <Icon className={cn("w-4.5 h-4.5", iconColor)} strokeWidth={2} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-black text-slate-900 truncate">{label}</p>
        <p className="text-[12px] text-slate-500 font-medium mt-0.5">{sub}</p>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════
   PAGE
════════════════════════════════════════════════════════════════ */
interface PageProps { params: { id: string } }

export default async function OwnerVehicleDetailPage({ params }: PageProps) {

  /* ── Auth ── */
  const nestToken = cookies().get('nest_access')?.value ?? null;
  let token: string | null = nestToken;
  if (!token) {
    const supabase = createSupabaseServerClient();
    const { data } = await supabase.auth.getSession();
    token = data.session?.access_token ?? null;
  }
  if (!token) redirect('/login');

  /* ── Fetch ── */
  let vehicle: any;
  try {
    vehicle = await fetchVehicle(params.id, token);
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) notFound();
    if (err instanceof ApiError && err.status === 401) redirect('/login?expired=1');
    throw err;
  }

  let reservations: any[] = [];
  try {
    const res = await fetchVehicleReservations(token, params.id);
    reservations = res.data ?? [];
    console.log(`[Vehicle ${params.id}] Fetched ${reservations.length} reservations`);
  } catch (err) {
    console.error(`[Vehicle ${params.id}] Failed to fetch reservations:`, err);
    reservations = [];
  }

  /* ── Derived ── */
  const photos = vehicle.photos ?? [];
  const heroPhoto = photos.find((p: any) => p.estPrincipale) ?? photos[0];
  const otherPhotos = photos.filter((p: any) => p.id !== heroPhoto?.id).slice(0, 4);
  const isActive = vehicle.statut === 'VERIFIE';

  const hasConditions = vehicle.reglesSpecifiques || vehicle.zoneConduite ||
    vehicle.assurance || vehicle.carburantCondition || (vehicle.joursMinimum > 1) || (vehicle.ageMinimum > 18);

  // Locations actives et terminées (exclure ANNULEE, INITIEE, EN_ATTENTE_PAIEMENT)
  const locationsValides = reservations.filter((r: any) =>
    ['PAYEE', 'CONFIRMEE', 'EN_COURS', 'TERMINEE'].includes(r.statut)
  );

  // Revenus générés (uniquement locations terminées)
  const revenusGeneres = reservations
    .filter((r: any) => r.statut === 'TERMINEE')
    .reduce((sum: number, r: any) => sum + Number(r.montantProprietaire ?? 0), 0);

  // Equipements
  const equipements: string[] = (vehicle.equipements ?? []).map((e: any) =>
    typeof e === 'string' ? e : e.equipement?.nom ?? '',
  ).filter(Boolean);

  // Tarifs progressifs
  const tarifs: { joursMin: number; joursMax: number | null; prix: number }[] =
    vehicle.tarifsProgressifs ?? [];

  const hasTarification = tarifs.length > 0 || vehicle.fraisLivraison || vehicle.autoriseHorsDakar;

  return (
    <div className="min-h-screen bg-slate-50/40">
      <div className="max-w-6xl mx-auto px-4 py-6 lg:px-8 lg:py-8 space-y-6">

        {/* ── Top bar ─────────────────────────────────────────── */}
        <div className="flex items-center justify-between gap-3">
          <Link
            href="/dashboard/owner/vehicles"
            className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-slate-500 hover:text-slate-900 transition-colors group shrink-0"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" strokeWidth={2.5} />
            <span className="hidden xs:inline">Mes véhicules</span>
          </Link>
          <div className="flex items-center gap-1.5">
            {isActive && (
              <Link
                href={`/vehicles/${vehicle.id}`}
                target="_blank"
                title="Voir l'annonce publique"
                className="w-9 h-9 sm:w-auto sm:px-3.5 rounded-xl border border-slate-200 bg-white inline-flex items-center justify-center gap-1.5 text-[12px] font-semibold text-slate-500 hover:text-slate-900 hover:border-slate-300 hover:bg-slate-50 transition-all"
              >
                <ExternalLink className="w-3.5 h-3.5 flex-shrink-0" strokeWidth={2} />
                <span className="hidden sm:inline">Voir</span>
              </Link>
            )}
            <ShareVehicleButton vehicle={vehicle} />
            <DeleteVehicleButton vehicleId={vehicle.id} statut={vehicle.statut} />
            <EditVehicleButton vehicle={vehicle} />
          </div>
        </div>

        {/* ── Hero card ───────────────────────────────────────── */}
        <div className="rounded-2xl border border-slate-100 bg-white overflow-hidden shadow-sm shadow-slate-100/80">
          <div className="lg:grid lg:grid-cols-[480px_1fr]">

            {/* Photo panel - Galerie swipeable */}
            <VehiclePhotoGallery photos={photos} marque={vehicle.marque} modele={vehicle.modele} />

            {/* Info panel */}
            <div className="flex flex-col justify-between gap-5 p-6 lg:p-8">

              {/* Name + status */}
              <div className="space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h1 className="text-[28px] font-black tracking-tight text-slate-900 leading-none">
                      {vehicle.marque}{' '}
                      <span className="text-emerald-500">{vehicle.modele}</span>
                    </h1>
                    <p className="text-[13px] text-slate-400 font-medium mt-1.5">
                      {vehicle.annee} · {vehicle.type}
                    </p>
                  </div>
                  <VehicleStatusBadge statut={vehicle.statut} />
                </div>

                {/* Specs réorganisées */}
                <div className="space-y-3">
                  {/* Localisation */}
                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-slate-400 flex-shrink-0" strokeWidth={1.75} />
                      <span className="text-[13px] font-bold text-slate-800">{vehicle.ville}</span>
                    </div>
                    {vehicle.adresse && vehicle.adresse !== vehicle.ville && (
                      <div className="flex items-center gap-2 ml-6">
                        <MapPinned className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" strokeWidth={1.75} />
                        <span className="text-[12px] font-medium text-slate-500">{vehicle.adresse}</span>
                      </div>
                    )}
                  </div>

                  {/* Caractéristiques principales */}
                  <div className="grid grid-cols-2 gap-2">
                    {vehicle.carburant && (
                      <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-50 border border-slate-100">
                        <Fuel className="w-4 h-4 text-slate-400 flex-shrink-0" strokeWidth={1.75} />
                        <span className="text-[12.5px] font-semibold text-slate-700">{FUEL_LABEL[vehicle.carburant] ?? vehicle.carburant}</span>
                      </div>
                    )}
                    {vehicle.transmission && (
                      <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-50 border border-slate-100">
                        <Settings2 className="w-4 h-4 text-slate-400 flex-shrink-0" strokeWidth={1.75} />
                        <span className="text-[12.5px] font-semibold text-slate-700">{TRANS_LABEL[vehicle.transmission] ?? vehicle.transmission}</span>
                      </div>
                    )}
                    {vehicle.nombrePlaces && (
                      <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-50 border border-slate-100">
                        <Users className="w-4 h-4 text-slate-400 flex-shrink-0" strokeWidth={1.75} />
                        <span className="text-[12.5px] font-semibold text-slate-700">{vehicle.nombrePlaces} places</span>
                      </div>
                    )}
                    {vehicle.immatriculation && (
                      <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-50 border border-slate-100">
                        <Hash className="w-4 h-4 text-slate-400 flex-shrink-0" strokeWidth={1.75} />
                        <span className="text-[12.5px] font-semibold text-slate-700">{vehicle.immatriculation}</span>
                      </div>
                    )}
                  </div>

                  {/* Date d'ajout */}
                  <div className="flex items-center gap-2 text-[11px] text-slate-400 font-medium pt-1">
                    <Clock className="w-3.5 h-3.5" strokeWidth={1.75} />
                    Ajouté le {new Date(vehicle.creeLe).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </div>
                </div>
              </div>

              {/* Price block */}
              <div className="rounded-2xl bg-gradient-to-br from-emerald-50 to-emerald-50/50 border-2 border-emerald-200 p-4 sm:p-5 flex items-center justify-between gap-4 shadow-sm">
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] font-black uppercase tracking-[0.16em] text-emerald-700/60 mb-1">
                    Tarif de base
                  </p>
                  <div className="flex items-baseline gap-2 flex-wrap">
                    <p className="text-[32px] sm:text-[36px] font-black text-emerald-600 tabular-nums leading-none tracking-tight">
                      {fmtMoney(vehicle.prixParJour)}
                    </p>
                    <span className="text-[14px] sm:text-[15px] font-bold text-emerald-700/60">FCFA / jour</span>
                  </div>
                </div>
                {(vehicle.tarifsProgressifs?.length > 0) && (
                  <div className="text-right flex-shrink-0">
                    <div className="inline-flex flex-col items-end gap-1 px-3 py-2 rounded-xl bg-emerald-100/50 border border-emerald-300/50">
                      <p className="text-[10px] font-black uppercase tracking-[0.14em] text-emerald-700">
                        {vehicle.tarifsProgressifs.length} palier{vehicle.tarifsProgressifs.length > 1 ? 's' : ''}
                      </p>
                      <p className="text-[11px] font-bold text-emerald-600">Dégressif actif</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ── KPI row ─────────────────────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <KpiCard
            label="Locations totales"
            value={locationsValides.length}
            sub={locationsValides.length > 0 ? `${reservations.filter(r => r.statut === 'TERMINEE').length} terminée${reservations.filter(r => r.statut === 'TERMINEE').length > 1 ? 's' : ''}` : undefined}
            icon={TrendingUp}
            accent
          />
          <KpiCard
            label="Revenus générés"
            value={revenusGeneres > 0 ? `${fmtMoney(revenusGeneres)} FCFA` : '—'}
            sub={revenusGeneres > 0 ? 'net propriétaire' : 'Aucune location terminée'}
            icon={Banknote}
            accent
          />
          <KpiCard
            label="Note moyenne"
            value={`${Number(vehicle.note ?? 0).toFixed(1)}`}
            sub="sur 5"
            icon={Star}
          />
          <KpiCard
            label="Avis reçus"
            value={vehicle.totalAvis ?? 0}
            icon={Eye}
          />
        </div>

        {/* ── Revenue Chart ─────────────────────────────────────────── */}
        <VehicleRevenueChart reservations={reservations} />

        {/* ── Two-col: calendar + reservations ────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

          {/* Calendar */}
          <SectionCard title="Disponibilités" icon={Calendar}>
            <AvailabilityCalendar
              vehicleId={vehicle.id}
              reservations={reservations.map((r: any) => ({
                dateDebut: r.dateDebut,
                dateFin: r.dateFin,
                statut: r.statut,
              }))}
            />
          </SectionCard>

          {/* Reservations */}
          <SectionCard
            title={`Réservations (${reservations.length})`}
            icon={CalendarDays}
            action={
              reservations.length > 0 ? (
                <Link
                  href={`/dashboard/owner/vehicles/${params.id}/reservations`}
                  className="inline-flex items-center gap-1 text-[12px] font-bold text-emerald-600 hover:text-emerald-700 transition-colors"
                >
                  Tout voir
                  <ChevronRight className="w-3.5 h-3.5" strokeWidth={2.5} />
                </Link>
              ) : undefined
            }
          >
            {reservations.length === 0 ? (
              <div className="flex flex-col items-center gap-3 py-10">
                <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center">
                  <CalendarDays className="w-5 h-5 text-slate-300" strokeWidth={1.5} />
                </div>
                <p className="text-[13px] font-semibold text-slate-400">Aucune réservation</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100 -mx-5">
                {reservations.slice(0, 8).map((r: any) => (
                  <Link
                    key={r.id}
                    href={`/dashboard/owner/reservations/${r.id}`}
                    className="flex items-center justify-between py-3 px-5 hover:bg-slate-50 transition-colors group"
                  >
                    <div className="min-w-0">
                      <p className="text-[13px] font-bold text-slate-800 truncate">
                        {r.locataire?.prenom} {r.locataire?.nom}
                      </p>
                      <p className="text-[11px] text-slate-400 mt-0.5 font-medium">
                        {new Date(r.dateDebut).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                        {' → '}
                        {new Date(r.dateFin).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <ReservationStatusBadge status={r.statut} size="sm" />
                      <ChevronRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-slate-500 group-hover:translate-x-0.5 transition-all" strokeWidth={2.5} />
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </SectionCard>
        </div>

        {/* ── Équipements ─────────────────────────────────────── */}
        {equipements.length > 0 && (
          <SectionCard title="Équipements inclus" icon={Package}>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5">
              {equipements.map((eq) => (
                <div
                  key={eq}
                  className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-emerald-50 border border-emerald-100 hover:bg-emerald-100 hover:border-emerald-200 transition-colors"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" strokeWidth={2} />
                  <span className="text-[12.5px] font-semibold text-emerald-700 truncate">
                    {eq}
                  </span>
                </div>
              ))}
            </div>
          </SectionCard>
        )}

        {/* ── Tarification ────────────────────────────────────── */}
        {hasTarification && (
          <SectionCard title="Tarification" icon={Layers}>
            <div className="flex flex-col gap-3">
              {tarifs.length > 0 && (
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-400 mb-2">Tarifs dégressifs</p>
                  <div className="flex flex-col divide-y divide-slate-100 rounded-xl border border-slate-100 overflow-hidden">
                    {tarifs.map((t, i) => (
                      <div key={i} className="flex items-center justify-between px-4 py-3 bg-white">
                        <p className="text-[13px] font-semibold text-slate-700">
                          {t.joursMax
                            ? `${t.joursMin} – ${t.joursMax} jours`
                            : `${t.joursMin} jours et plus`}
                        </p>
                        <p className="text-[14px] font-black text-emerald-600 tabular-nums">
                          {fmtMoney(t.prix)} <span className="text-[11px] font-semibold text-slate-400">FCFA/j</span>
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {vehicle.fraisLivraison ? (
                  <ConditionItem
                    icon={Truck}
                    iconBg="bg-indigo-50 border-indigo-100"
                    iconColor="text-indigo-600"
                    label={`${fmtMoney(vehicle.fraisLivraison)} FCFA`}
                    sub="Frais de livraison"
                  />
                ) : null}
                {vehicle.autoriseHorsDakar && (
                  <ConditionItem
                    icon={Globe}
                    iconBg="bg-teal-50 border-teal-100"
                    iconColor="text-teal-600"
                    label={vehicle.supplementHorsDakarParJour
                      ? `+${fmtMoney(vehicle.supplementHorsDakarParJour)} FCFA/j`
                      : 'Inclus'}
                    sub="Supplément hors Dakar"
                  />
                )}
              </div>
            </div>
          </SectionCard>
        )}

        {/* ── Documents ───────────────────────────────────────── */}
        <SectionCard title="Documents" icon={FileText}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className={`flex items-center gap-3 rounded-xl border px-4 py-3 ${vehicle.carteGriseUrl ? 'bg-emerald-50 border-emerald-100' : 'bg-slate-50 border-slate-100'}`}>
              {vehicle.carteGriseUrl
                ? <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0" strokeWidth={2} />
                : <XCircle className="w-5 h-5 text-slate-300 flex-shrink-0" strokeWidth={1.75} />}
              <div>
                <p className="text-[12.5px] font-bold text-slate-800">Carte grise</p>
                <p className={`text-[11px] mt-0.5 ${vehicle.carteGriseUrl ? 'text-emerald-600 font-semibold' : 'text-slate-400'}`}>
                  {vehicle.carteGriseUrl ? 'Document uploadé' : 'Non fourni'}
                </p>
              </div>
              {vehicle.carteGriseUrl && (
                <DocumentViewButton vehicleId={vehicle.id} docType="carte-grise" />
              )}
            </div>
            <div className={`flex items-center gap-3 rounded-xl border px-4 py-3 ${vehicle.assuranceDocUrl ? 'bg-emerald-50 border-emerald-100' : 'bg-slate-50 border-slate-100'}`}>
              {vehicle.assuranceDocUrl
                ? <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0" strokeWidth={2} />
                : <XCircle className="w-5 h-5 text-slate-300 flex-shrink-0" strokeWidth={1.75} />}
              <div>
                <p className="text-[12.5px] font-bold text-slate-800">Assurance</p>
                <p className={`text-[11px] mt-0.5 ${vehicle.assuranceDocUrl ? 'text-emerald-600 font-semibold' : 'text-slate-400'}`}>
                  {vehicle.assuranceDocUrl ? 'Document uploadé' : 'Non fourni'}
                </p>
              </div>
              {vehicle.assuranceDocUrl && (
                <DocumentViewButton vehicleId={vehicle.id} docType="assurance" />
              )}
            </div>
          </div>
        </SectionCard>

        {/* ── Conditions ──────────────────────────────────────── */}
        {hasConditions && (
          <SectionCard title="Conditions de location" icon={Shield}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {vehicle.joursMinimum > 1 && (
                <ConditionItem
                  icon={CalendarDays}
                  iconBg="bg-blue-50 border-blue-100"
                  iconColor="text-blue-600"
                  label={`${vehicle.joursMinimum} jours minimum`}
                  sub="Durée minimale de location"
                />
              )}
              {vehicle.ageMinimum > 18 && (
                <ConditionItem
                  icon={UserCheck}
                  iconBg="bg-violet-50 border-violet-100"
                  iconColor="text-violet-600"
                  label={`${vehicle.ageMinimum} ans minimum`}
                  sub="Âge requis du conducteur"
                />
              )}
              {vehicle.zoneConduite && (
                <ConditionItem
                  icon={MapPinned}
                  iconBg="bg-emerald-50 border-emerald-100"
                  iconColor="text-emerald-600"
                  label={vehicle.zoneConduite}
                  sub="Zone de conduite autorisée"
                />
              )}
              {vehicle.assurance && (
                <ConditionItem
                  icon={ShieldCheck}
                  iconBg="bg-amber-50 border-amber-100"
                  iconColor="text-amber-600"
                  label={vehicle.assurance}
                  sub="Type d'assurance incluse"
                />
              )}
              {vehicle.carburantCondition && (
                <ConditionItem
                  icon={Fuel}
                  iconBg="bg-indigo-50 border-indigo-100"
                  iconColor="text-indigo-600"
                  label={vehicle.carburantCondition}
                  sub="Politique carburant"
                />
              )}
              {vehicle.reglesSpecifiques && (
                <div className="sm:col-span-2 flex items-start gap-3 rounded-xl border border-slate-100 bg-slate-50/60 px-4 py-3">
                  <div className="w-8 h-8 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <FileText className="w-4 h-4 text-slate-500" strokeWidth={1.75} />
                  </div>
                  <div>
                    <p className="text-[12.5px] font-bold text-slate-800">Règles spécifiques</p>
                    <p className="text-[12px] text-slate-500 mt-1 leading-relaxed">{vehicle.reglesSpecifiques}</p>
                  </div>
                </div>
              )}
            </div>
          </SectionCard>
        )}

      </div>
    </div>
  );
}