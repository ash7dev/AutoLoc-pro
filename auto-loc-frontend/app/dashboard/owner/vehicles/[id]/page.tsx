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
import { ReservationStatusBadge } from '@/features/reservations/components/reservation-status';
import {
  ArrowLeft, Car, Fuel, Settings2, Users, Star,
  Calendar, MapPin, Hash, Shield, TrendingUp,
  ExternalLink, ImageIcon, CalendarDays, FileText,
  MapPinned, ShieldCheck, UserCheck, ChevronRight,
  Eye, Banknote,
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
    <div className={`rounded-2xl border p-5 flex flex-col gap-3 ${accent
        ? 'bg-emerald-50 border-emerald-100'
        : 'bg-white border-slate-100'
      }`}>
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${accent ? 'bg-emerald-100' : 'bg-slate-100'
        }`}>
        <Icon className={`w-4.5 h-4.5 ${accent ? 'text-emerald-600' : 'text-slate-400'}`} strokeWidth={1.75} />
      </div>
      <div>
        <p className={`text-[26px] font-black tabular-nums tracking-tight leading-none ${accent ? 'text-emerald-700' : 'text-slate-900'
          }`}>{value}</p>
        {sub && <p className="text-[11px] text-slate-400 font-medium mt-0.5">{sub}</p>}
      </div>
      <p className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-400">{label}</p>
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
    <div className={`rounded-2xl border border-slate-100 bg-white overflow-hidden shadow-sm shadow-slate-100/50 ${className ?? ''}`}>
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center">
            <Icon className="w-3.5 h-3.5 text-emerald-600" strokeWidth={1.75} />
          </div>
          <h3 className="text-[13px] font-black text-slate-800 tracking-tight">{title}</h3>
        </div>
        {action}
      </div>
      <div className="p-5">{children}</div>
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
    <div className="flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50/60 px-4 py-3">
      <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 border ${iconBg}`}>
        <Icon className={`w-4 h-4 ${iconColor}`} strokeWidth={1.75} />
      </div>
      <div>
        <p className="text-[12.5px] font-bold text-slate-800">{label}</p>
        <p className="text-[11px] text-slate-400 mt-0.5">{sub}</p>
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
  } catch { /* non-blocking */ }

  /* ── Derived ── */
  const photos = vehicle.photos ?? [];
  const heroPhoto = photos.find((p: any) => p.estPrincipale) ?? photos[0];
  const otherPhotos = photos.filter((p: any) => p.id !== heroPhoto?.id).slice(0, 4);
  const isActive = vehicle.statut === 'VERIFIE';

  const hasConditions = vehicle.reglesSpecifiques || vehicle.zoneConduite ||
    vehicle.assurance || (vehicle.joursMinimum > 1) || (vehicle.ageMinimum > 18);

  return (
    <div className="min-h-screen bg-slate-50/40">
      <div className="max-w-6xl mx-auto px-4 py-6 lg:px-8 lg:py-8 space-y-6">

        {/* ── Top bar ─────────────────────────────────────────── */}
        <div className="flex items-center justify-between">
          <Link
            href="/dashboard/owner/vehicles"
            className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-slate-500 hover:text-slate-900 transition-colors group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" strokeWidth={2.5} />
            Mes véhicules
          </Link>
          <div className="flex items-center gap-2">
            {isActive && (
              <Link
                href={`/vehicles/${vehicle.id}`}
                target="_blank"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 text-[12px] font-semibold text-slate-500 hover:text-slate-900 hover:border-slate-300 hover:bg-white transition-all"
              >
                <ExternalLink className="w-3.5 h-3.5" strokeWidth={2} />
                Voir l&apos;annonce
              </Link>
            )}
            <EditVehicleButton vehicle={vehicle} />
          </div>
        </div>

        {/* ── Hero card ───────────────────────────────────────── */}
        <div className="rounded-2xl border border-slate-100 bg-white overflow-hidden shadow-sm shadow-slate-100/80">
          <div className="lg:grid lg:grid-cols-[480px_1fr]">

            {/* Photo panel */}
            <div className="relative h-[260px] lg:h-full bg-slate-100 overflow-hidden">
              {heroPhoto ? (
                <Image
                  src={heroPhoto.url}
                  alt={`${vehicle.marque} ${vehicle.modele}`}
                  fill priority
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center gap-2">
                  <Car className="w-12 h-12 text-slate-300" strokeWidth={1} />
                  <p className="text-[11px] text-slate-400 font-medium">Aucune photo</p>
                </div>
              )}
              {photos.length > 0 && (
                <span className="absolute bottom-3 left-3 inline-flex items-center gap-1.5 rounded-xl bg-black/60 backdrop-blur-sm px-2.5 py-1.5 text-[11px] font-bold text-white">
                  <ImageIcon className="w-3 h-3" strokeWidth={2} />
                  {photos.length} photo{photos.length > 1 ? 's' : ''}
                </span>
              )}
            </div>

            {/* Info panel */}
            <div className="flex flex-col justify-between gap-5 p-6 lg:p-8">

              {/* Name + status */}
              <div className="space-y-3">
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

                {/* Specs */}
                <div className="flex flex-wrap gap-2">
                  <SpecPill icon={MapPin} label={vehicle.ville} />
                  {vehicle.carburant && (
                    <SpecPill icon={Fuel} label={FUEL_LABEL[vehicle.carburant] ?? vehicle.carburant} />
                  )}
                  {vehicle.transmission && (
                    <SpecPill icon={Settings2} label={TRANS_LABEL[vehicle.transmission] ?? vehicle.transmission} />
                  )}
                  {vehicle.nombrePlaces && (
                    <SpecPill icon={Users} label={`${vehicle.nombrePlaces} places`} />
                  )}
                  {vehicle.immatriculation && (
                    <SpecPill icon={Hash} label={vehicle.immatriculation} />
                  )}
                </div>
              </div>

              {/* Price block */}
              <div className="rounded-2xl bg-slate-50 border border-slate-100 p-4 flex items-center justify-between gap-4">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-400 mb-0.5">
                    Tarif de base
                  </p>
                  <p className="text-[32px] font-black text-emerald-600 tabular-nums leading-none tracking-tight">
                    {fmtMoney(vehicle.prixParJour)}
                    <span className="text-[14px] font-semibold text-slate-400 ml-1.5">FCFA / jour</span>
                  </p>
                </div>
                {(vehicle.tarifsProgressifs?.length > 0) && (
                  <div className="text-right">
                    <p className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-400 mb-1">
                      {vehicle.tarifsProgressifs.length} palier{vehicle.tarifsProgressifs.length > 1 ? 's' : ''}
                    </p>
                    <p className="text-[11px] font-semibold text-emerald-600">Tarif dégressif actif</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Thumbnail strip */}
          {otherPhotos.length > 0 && (
            <div className="border-t border-slate-100 px-4 py-3 flex gap-2 overflow-x-auto bg-slate-50/50">
              {otherPhotos.map((photo: any) => (
                <div key={photo.id} className="relative w-20 h-14 rounded-xl overflow-hidden flex-shrink-0 bg-slate-100 border border-slate-100">
                  <Image src={photo.url} alt="Photo véhicule" fill className="object-cover" />
                </div>
              ))}
              {photos.length > 5 && (
                <div className="w-20 h-14 rounded-xl bg-slate-100 border border-slate-100 flex items-center justify-center flex-shrink-0">
                  <span className="text-[11px] font-bold text-slate-400">+{photos.length - 5}</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* ── KPI row ─────────────────────────────────────────── */}
        <div className="grid grid-cols-3 gap-4">
          <KpiCard
            label="Locations totales"
            value={vehicle.totalLocations ?? 0}
            icon={TrendingUp}
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