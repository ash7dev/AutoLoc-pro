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
import {
  ArrowLeft,
  Car,
  Fuel,
  Settings2,
  Users,
  Star,
  Calendar,
  MapPin,
  Hash,
  Shield,
  Clock,
  TrendingUp,
  Eye,
  ExternalLink,
  ImageIcon,
  CalendarDays,
  FileText,
  MapPinned,
  ShieldCheck,
  UserCheck,
} from 'lucide-react';

/* ════════════════════════════════════════════════════════════════
   HELPERS
════════════════════════════════════════════════════════════════ */
function fmtMoney(n: number | string) {
  return Number(n).toLocaleString('fr-FR');
}

const STATUS_MAP: Record<string, { label: string; bg: string; text: string; dot: string }> = {
  BROUILLON: { label: 'Brouillon', bg: 'bg-slate-100', text: 'text-slate-600', dot: 'bg-slate-400' },
  EN_ATTENTE_VALIDATION: { label: 'En attente', bg: 'bg-amber-50', text: 'text-amber-700', dot: 'bg-amber-400' },
  VERIFIE: { label: 'Vérifié', bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-400' },
  SUSPENDU: { label: 'Suspendu', bg: 'bg-red-50', text: 'text-red-700', dot: 'bg-red-400' },
  ARCHIVE: { label: 'Archivé', bg: 'bg-slate-100', text: 'text-slate-500', dot: 'bg-slate-300' },
};

const RES_STATUS: Record<string, { label: string; bg: string; text: string }> = {
  EN_ATTENTE: { label: 'En attente', bg: 'bg-amber-50', text: 'text-amber-700' },
  PAYEE: { label: 'Payée', bg: 'bg-blue-50', text: 'text-blue-700' },
  CONFIRMEE: { label: 'Confirmée', bg: 'bg-emerald-50', text: 'text-emerald-700' },
  EN_COURS: { label: 'En cours', bg: 'bg-violet-50', text: 'text-violet-700' },
  TERMINEE: { label: 'Terminée', bg: 'bg-slate-100', text: 'text-slate-600' },
  ANNULEE: { label: 'Annulée', bg: 'bg-red-50', text: 'text-red-600' },
};

const FUEL_LABEL: Record<string, string> = {
  ESSENCE: 'Essence', DIESEL: 'Diesel', HYBRIDE: 'Hybride', ELECTRIQUE: 'Électrique',
};
const TRANS_LABEL: Record<string, string> = {
  AUTOMATIQUE: 'Automatique', MANUELLE: 'Manuelle',
};

/* ── Section wrapper ─────────────────────────────────────────── */
function Section({ title, icon: Icon, action, children, className }: {
  title: string;
  icon: React.ElementType;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`rounded-2xl border border-border/50 bg-card overflow-hidden ${className ?? ''}`}>
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-border/40">
        <div className="flex items-center gap-2.5">
          <span className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center">
            <Icon className="w-4 h-4 text-emerald-600" strokeWidth={1.75} />
          </span>
          <h3 className="text-[14px] font-bold text-foreground tracking-tight">{title}</h3>
        </div>
        {action}
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

/* ── Stat card ────────────────────────────────────────────────── */
function StatCard({ label, value, icon: Icon, accent }: {
  label: string;
  value: string | number;
  icon: React.ElementType;
  accent?: boolean;
}) {
  return (
    <div className="rounded-2xl border border-border/50 bg-card p-5 text-center">
      <span className={`w-10 h-10 rounded-xl inline-flex items-center justify-center mb-2.5 ${accent ? 'bg-emerald-50' : 'bg-muted/50'
        }`}>
        <Icon className={`w-5 h-5 ${accent ? 'text-emerald-600' : 'text-muted-foreground/60'}`} strokeWidth={1.5} />
      </span>
      <p className="text-2xl font-black text-foreground tabular-nums tracking-tight">{value}</p>
      <p className="text-[11px] text-muted-foreground/60 uppercase tracking-widest font-semibold mt-1">{label}</p>
    </div>
  );
}

/* ── QuickSpec pill ────────────────────────────────────────────── */
function QuickSpec({ icon: Icon, label }: { icon: React.ElementType; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-lg bg-muted/40 px-3 py-1.5 text-[12px] font-medium text-muted-foreground">
      <Icon className="w-3.5 h-3.5 text-muted-foreground/50" strokeWidth={1.5} />
      {label}
    </span>
  );
}

/* ════════════════════════════════════════════════════════════════
   PAGE
════════════════════════════════════════════════════════════════ */
interface PageProps {
  params: { id: string };
}

export default async function OwnerVehicleDetailPage({ params }: PageProps) {
  const nestToken = cookies().get('nest_access')?.value ?? null;
  let token: string | null = nestToken;
  if (!token) {
    const supabase = createSupabaseServerClient();
    const { data } = await supabase.auth.getSession();
    token = data.session?.access_token ?? null;
  }
  if (!token) redirect('/login');

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
  } catch {
    // Non-blocking
  }

  const st = STATUS_MAP[vehicle.statut] ?? STATUS_MAP.BROUILLON;
  const photos = vehicle.photos ?? [];
  const heroPhoto = photos.find((p: any) => p.estPrincipale) ?? photos[0];
  const otherPhotos = photos.filter((p: any) => p.id !== heroPhoto?.id).slice(0, 3);
  const isActive = vehicle.statut === 'VERIFIE';

  return (
    <div className="flex flex-col gap-6 p-4 md:p-8 max-w-6xl mx-auto">

      {/* ── Breadcrumb + actions ── */}
      <div className="flex items-center justify-between">
        <Link
          href="/dashboard/owner/vehicles"
          className="inline-flex items-center gap-1.5 text-[13px] font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" strokeWidth={2} />
          Mes véhicules
        </Link>
        <div className="flex items-center gap-2">
          {isActive && (
            <Link
              href={`/vehicles/${vehicle.id}`}
              target="_blank"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border/50 text-xs font-medium text-muted-foreground hover:text-foreground hover:border-border transition-all"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              Voir l&apos;annonce
            </Link>
          )}
          <EditVehicleButton vehicle={vehicle} />
        </div>
      </div>

      {/* ── Hero ── */}
      <div className="rounded-2xl border border-border/50 bg-card overflow-hidden">
        <div className="lg:flex">
          {/* Main photo */}
          <div className="relative w-full lg:w-[480px] h-[280px] lg:h-[320px] shrink-0 bg-gradient-to-br from-muted/40 to-muted/20">
            {heroPhoto ? (
              <Image
                src={heroPhoto.url}
                alt={`${vehicle.marque} ${vehicle.modele}`}
                fill
                className="object-cover"
                priority
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center gap-2">
                <Car className="w-12 h-12 text-muted-foreground/15" strokeWidth={1} />
                <p className="text-[11px] text-muted-foreground/30 font-medium">Pas de photo</p>
              </div>
            )}
            {/* Photo count badge */}
            {photos.length > 0 && (
              <span className="absolute bottom-3 left-3 inline-flex items-center gap-1.5 rounded-lg bg-black/60 backdrop-blur-sm px-2.5 py-1 text-[11px] font-semibold text-white">
                <ImageIcon className="w-3 h-3" strokeWidth={2} />
                {photos.length} photo{photos.length > 1 ? 's' : ''}
              </span>
            )}
          </div>

          {/* Info panel */}
          <div className="flex-1 p-6 lg:p-7 flex flex-col justify-between gap-5">
            {/* Top: name + status */}
            <div>
              <div className="flex items-start justify-between gap-3 mb-3">
                <div>
                  <h1 className="text-2xl font-extrabold text-foreground tracking-tight leading-tight">
                    {vehicle.marque} {vehicle.modele}
                  </h1>
                  <p className="text-[13px] text-muted-foreground/70 font-medium mt-1">
                    {vehicle.annee} · {vehicle.type}
                  </p>
                </div>
                <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold ${st.bg} ${st.text}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${st.dot}`} />
                  {st.label}
                </span>
              </div>

              {/* Quick specs */}
              <div className="flex flex-wrap gap-2">
                <QuickSpec icon={MapPin} label={vehicle.ville} />
                {vehicle.carburant && (
                  <QuickSpec icon={Fuel} label={FUEL_LABEL[vehicle.carburant] ?? vehicle.carburant} />
                )}
                {vehicle.transmission && (
                  <QuickSpec icon={Settings2} label={TRANS_LABEL[vehicle.transmission] ?? vehicle.transmission} />
                )}
                {vehicle.nombrePlaces && (
                  <QuickSpec icon={Users} label={`${vehicle.nombrePlaces} places`} />
                )}
                <QuickSpec icon={Hash} label={vehicle.immatriculation} />
              </div>
            </div>

            {/* Bottom: price */}
            <div className="pt-4 border-t border-border/40">
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black text-foreground tabular-nums tracking-tight">
                  {fmtMoney(vehicle.prixParJour)}
                </span>
                <span className="text-sm text-muted-foreground font-medium">FCFA / jour</span>
              </div>
            </div>
          </div>
        </div>

        {/* Thumbnail row — only when there are extra photos */}
        {otherPhotos.length > 0 && (
          <div className="border-t border-border/40 p-3 flex gap-2 overflow-x-auto">
            {otherPhotos.map((photo: any) => (
              <div key={photo.id} className="relative w-24 h-16 rounded-xl overflow-hidden shrink-0 bg-muted/20">
                <Image src={photo.url} alt="Photo véhicule" fill className="object-cover" />
                {photo.estPrincipale && (
                  <span className="absolute top-1 left-1 px-1 py-0.5 rounded bg-emerald-500 text-[7px] font-bold text-white uppercase">
                    ★
                  </span>
                )}
              </div>
            ))}
            {photos.length > 4 && (
              <div className="w-24 h-16 rounded-xl bg-muted/30 flex items-center justify-center shrink-0">
                <span className="text-xs font-bold text-muted-foreground/50">+{photos.length - 4}</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Stats row ── */}
      <div className="grid grid-cols-3 gap-4">
        <StatCard label="Locations" value={vehicle.totalLocations ?? 0} icon={TrendingUp} accent />
        <StatCard label="Note" value={`${Number(vehicle.note ?? 0).toFixed(1)}/5`} icon={Star} />
        <StatCard label="Avis" value={vehicle.totalAvis ?? 0} icon={Eye} />
      </div>

      {/* ── Two-column layout ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Availability Calendar */}
        <Section title="Calendrier de disponibilité" icon={Calendar}>
          <AvailabilityCalendar
            vehicleId={vehicle.id}
            reservations={reservations.map((r: any) => ({
              dateDebut: r.dateDebut,
              dateFin: r.dateFin,
              statut: r.statut,
            }))}
          />
        </Section>

        {/* Reservations */}
        <Section
          title={`Réservations (${reservations.length})`}
          icon={CalendarDays}
          action={
            reservations.length > 0 ? (
              <Link
                href={`/dashboard/owner/vehicles/${params.id}/reservations`}
                className="text-[12px] font-semibold text-emerald-600 hover:text-emerald-700 transition-colors"
              >
                Tout voir →
              </Link>
            ) : undefined
          }
        >
          {reservations.length === 0 ? (
            <div className="text-center py-8">
              <CalendarDays className="w-8 h-8 mx-auto text-muted-foreground/20 mb-2" strokeWidth={1.25} />
              <p className="text-sm text-muted-foreground/50 font-medium">Aucune réservation</p>
            </div>
          ) : (
            <div className="divide-y divide-border/40 -mx-5">
              {reservations.slice(0, 8).map((r: any) => {
                const rs = RES_STATUS[r.statut] ?? { label: r.statut, bg: 'bg-slate-100', text: 'text-slate-600' };
                return (
                  <Link
                    key={r.id}
                    href={`/dashboard/owner/reservations/${r.id}`}
                    className="flex items-center justify-between py-3 px-5 hover:bg-accent/30 transition-colors"
                  >
                    <div className="min-w-0">
                      <p className="text-[13px] font-semibold text-foreground truncate">
                        {r.locataire?.prenom ?? ''} {r.locataire?.nom ?? ''}
                      </p>
                      <p className="text-[11px] text-muted-foreground/60 mt-0.5">
                        {new Date(r.dateDebut).toLocaleDateString('fr-FR')} — {new Date(r.dateFin).toLocaleDateString('fr-FR')}
                      </p>
                    </div>
                    <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${rs.bg} ${rs.text}`}>
                      {rs.label}
                    </span>
                  </Link>
                );
              })}
            </div>
          )}
        </Section>
      </div>

      {/* ── Rules & conditions ── */}
      {(vehicle.reglesSpecifiques || vehicle.zoneConduite || vehicle.assurance ||
        (vehicle.joursMinimum && vehicle.joursMinimum > 1) || (vehicle.ageMinimum && vehicle.ageMinimum > 18)) && (
          <Section title="Conditions de location" icon={Shield}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {vehicle.joursMinimum > 1 && (
                <div className="flex items-center gap-3 rounded-xl border border-border/30 bg-muted/20 px-4 py-3">
                  <span className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
                    <CalendarDays className="w-4 h-4 text-blue-600" strokeWidth={1.75} />
                  </span>
                  <div>
                    <p className="text-[12px] font-semibold text-foreground">Minimum {vehicle.joursMinimum} jours</p>
                    <p className="text-[11px] text-muted-foreground/50">Durée minimale</p>
                  </div>
                </div>
              )}
              {vehicle.ageMinimum > 18 && (
                <div className="flex items-center gap-3 rounded-xl border border-border/30 bg-muted/20 px-4 py-3">
                  <span className="w-8 h-8 rounded-lg bg-violet-50 flex items-center justify-center shrink-0">
                    <UserCheck className="w-4 h-4 text-violet-600" strokeWidth={1.75} />
                  </span>
                  <div>
                    <p className="text-[12px] font-semibold text-foreground">{vehicle.ageMinimum} ans minimum</p>
                    <p className="text-[11px] text-muted-foreground/50">Âge requis</p>
                  </div>
                </div>
              )}
              {vehicle.zoneConduite && (
                <div className="flex items-center gap-3 rounded-xl border border-border/30 bg-muted/20 px-4 py-3">
                  <span className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center shrink-0">
                    <MapPinned className="w-4 h-4 text-emerald-600" strokeWidth={1.75} />
                  </span>
                  <div>
                    <p className="text-[12px] font-semibold text-foreground">{vehicle.zoneConduite}</p>
                    <p className="text-[11px] text-muted-foreground/50">Zone de conduite</p>
                  </div>
                </div>
              )}
              {vehicle.assurance && (
                <div className="flex items-center gap-3 rounded-xl border border-border/30 bg-muted/20 px-4 py-3">
                  <span className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center shrink-0">
                    <ShieldCheck className="w-4 h-4 text-amber-600" strokeWidth={1.75} />
                  </span>
                  <div>
                    <p className="text-[12px] font-semibold text-foreground">{vehicle.assurance}</p>
                    <p className="text-[11px] text-muted-foreground/50">Assurance</p>
                  </div>
                </div>
              )}
              {vehicle.reglesSpecifiques && (
                <div className="flex items-start gap-3 rounded-xl border border-border/30 bg-muted/20 px-4 py-3 sm:col-span-2">
                  <span className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center shrink-0 mt-0.5">
                    <FileText className="w-4 h-4 text-slate-600" strokeWidth={1.75} />
                  </span>
                  <div>
                    <p className="text-[12px] font-semibold text-foreground">Règles spécifiques</p>
                    <p className="text-[12px] text-muted-foreground/70 mt-0.5 leading-relaxed">{vehicle.reglesSpecifiques}</p>
                  </div>
                </div>
              )}
            </div>
          </Section>
        )}
    </div>
  );
}
