import { cookies } from 'next/headers';
import { redirect, notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { ApiError } from '@/lib/nestjs/api-client';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { fetchVehicle } from '@/lib/nestjs/vehicles';
import { fetchVehicleReservations } from '@/lib/nestjs/reservations';
import { AvailabilityCalendar } from '@/features/vehicles/components/availability-calendar';
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
  Edit,
} from 'lucide-react';

/* ════════════════════════════════════════════════════════════════
   HELPERS
════════════════════════════════════════════════════════════════ */
function fmtMoney(n: number | string) {
  return Number(n).toLocaleString('fr-FR');
}

const STATUS_LABEL: Record<string, { label: string; class: string }> = {
  BROUILLON: { label: 'Brouillon', class: 'bg-slate-500/10 text-slate-400 border-slate-500/20' },
  EN_ATTENTE_VALIDATION: { label: 'En attente', class: 'bg-amber-500/10 text-amber-400 border-amber-500/20' },
  VERIFIE: { label: 'Vérifié', class: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
  SUSPENDU: { label: 'Suspendu', class: 'bg-red-500/10 text-red-400 border-red-500/20' },
  ARCHIVE: { label: 'Archivé', class: 'bg-slate-500/10 text-slate-300 border-slate-500/20' },
};

const FUEL_LABEL: Record<string, string> = {
  ESSENCE: 'Essence', DIESEL: 'Diesel', HYBRIDE: 'Hybride', ELECTRIQUE: 'Électrique',
};

const TRANS_LABEL: Record<string, string> = {
  AUTOMATIQUE: 'Automatique', MANUELLE: 'Manuelle',
};

/* ────────────────────────────────────────────────────────────── */
function DarkCard({ title, icon: Icon, children, className }: {
  title: string; icon: React.ElementType; children: React.ReactNode; className?: string;
}) {
  return (
    <div className={`rounded-xl border border-white/[0.06] bg-white/[0.02] ${className ?? ''}`}>
      <div className="flex items-center gap-2 px-5 py-3.5 border-b border-white/[0.06]">
        <Icon className="w-4 h-4 text-white/30" strokeWidth={1.8} />
        <h3 className="text-[13px] font-bold text-white/70 tracking-wide">{title}</h3>
      </div>
      <div className="px-5 py-4">{children}</div>
    </div>
  );
}

function Stat({ label, value, icon: Icon }: { label: string; value: string | number; icon: React.ElementType }) {
  return (
    <div className="text-center">
      <Icon className="w-4 h-4 mx-auto text-emerald-400/60 mb-1" strokeWidth={1.8} />
      <p className="text-lg font-black text-white">{value}</p>
      <p className="text-[10px] text-white/30 uppercase tracking-widest font-bold mt-0.5">{label}</p>
    </div>
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

  let vehicle;
  try {
    vehicle = await fetchVehicle(params.id, token);
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) notFound();
    if (err instanceof ApiError && err.status === 401) redirect('/login?expired=1');
    throw err;
  }

  // Fetch reservations for this vehicle
  let reservations: any[] = [];
  try {
    const res = await fetchVehicleReservations(token, params.id);
    reservations = res.data ?? [];
  } catch {
    // Non-blocking
  }

  const st = STATUS_LABEL[vehicle.statut] ?? STATUS_LABEL.BROUILLON;
  const mainPhoto = vehicle.photos?.find(p => p.estPrincipale) ?? vehicle.photos?.[0];

  return (
    <div className="flex flex-col gap-6 p-4 md:p-6">
      {/* Back + Header */}
      <div className="flex items-center justify-between">
        <Link
          href="/dashboard/owner/vehicles"
          className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-white/40 hover:text-white/70 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" strokeWidth={2.5} />
          Mes véhicules
        </Link>
        <Link
          href={`/dashboard/owner/vehicles/${params.id}/edit`}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs font-semibold text-white/60 hover:text-white hover:border-white/20 transition-all"
        >
          <Edit className="w-3.5 h-3.5" />
          Modifier
        </Link>
      </div>

      {/* Hero */}
      <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] overflow-hidden">
        <div className="md:flex">
          {/* Photo */}
          <div className="relative w-full md:w-[360px] h-[220px] md:h-auto shrink-0 bg-black/40">
            {mainPhoto ? (
              <Image
                src={mainPhoto.url}
                alt={`${vehicle.marque} ${vehicle.modele}`}
                fill
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Car className="w-12 h-12 text-white/10" />
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex-1 p-5 md:p-6 space-y-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h1 className="text-xl font-black text-white">
                  {vehicle.marque} {vehicle.modele}
                </h1>
                <p className="text-sm text-white/40 mt-0.5">{vehicle.annee} • {vehicle.type}</p>
              </div>
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold border ${st.class}`}>
                {st.label}
              </span>
            </div>

            <div className="flex flex-wrap gap-x-6 gap-y-2 text-xs text-white/50">
              <span className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-white/30" /> {vehicle.ville}
              </span>
              {vehicle.carburant && (
                <span className="flex items-center gap-1.5">
                  <Fuel className="w-3.5 h-3.5 text-white/30" /> {FUEL_LABEL[vehicle.carburant] ?? vehicle.carburant}
                </span>
              )}
              {vehicle.transmission && (
                <span className="flex items-center gap-1.5">
                  <Settings2 className="w-3.5 h-3.5 text-white/30" /> {TRANS_LABEL[vehicle.transmission] ?? vehicle.transmission}
                </span>
              )}
              {vehicle.nombrePlaces && (
                <span className="flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-white/30" /> {vehicle.nombrePlaces} places
                </span>
              )}
              <span className="flex items-center gap-1.5">
                <Hash className="w-3.5 h-3.5 text-white/30" /> {vehicle.immatriculation}
              </span>
            </div>

            <div className="pt-2 border-t border-white/[0.06]">
              <p className="text-2xl font-black text-emerald-400">
                {fmtMoney(vehicle.prixParJour)} <span className="text-sm font-normal text-white/30">FCFA / jour</span>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
          <Stat label="Locations" value={vehicle.totalLocations} icon={TrendingUp} />
        </div>
        <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
          <Stat label="Note" value={`${Number(vehicle.note).toFixed(1)}/5`} icon={Star} />
        </div>
        <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
          <Stat label="Avis" value={vehicle.totalAvis} icon={Eye} />
        </div>
      </div>

      {/* Two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Availability Calendar */}
        <DarkCard title="Calendrier de disponibilité" icon={Calendar}>
          <AvailabilityCalendar
            vehicleId={vehicle.id}
            reservations={reservations.map((r: any) => ({
              dateDebut: r.dateDebut,
              dateFin: r.dateFin,
              statut: r.statut,
            }))}
          />
        </DarkCard>

        {/* Photos gallery */}
        <DarkCard title="Photos" icon={Car}>
          {vehicle.photos?.length > 0 ? (
            <div className="grid grid-cols-3 gap-2">
              {vehicle.photos.map((photo) => (
                <div key={photo.id} className="relative aspect-[4/3] rounded-lg overflow-hidden bg-black/40">
                  <Image
                    src={photo.url}
                    alt="Photo véhicule"
                    fill
                    className="object-cover"
                  />
                  {photo.estPrincipale && (
                    <span className="absolute top-1 left-1 px-1.5 py-0.5 rounded bg-emerald-400 text-[8px] font-black text-black uppercase">
                      Principale
                    </span>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-white/30 text-center py-6">Aucune photo</p>
          )}
        </DarkCard>
      </div>

      {/* Reservations */}
      <DarkCard title={`Réservations (${reservations.length})`} icon={Clock}>
        {reservations.length === 0 ? (
          <p className="text-xs text-white/30 text-center py-6">Aucune réservation</p>
        ) : (
          <div className="divide-y divide-white/[0.06]">
            {reservations.slice(0, 10).map((r: any) => (
              <Link
                key={r.id}
                href={`/dashboard/owner/reservations/${r.id}`}
                className="flex items-center justify-between py-3 hover:bg-white/[0.02] -mx-5 px-5 transition-colors"
              >
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-white/70 truncate">
                    {r.locataire?.prenom ?? ''} {r.locataire?.nom ?? ''}
                  </p>
                  <p className="text-[10px] text-white/30 mt-0.5">
                    {new Date(r.dateDebut).toLocaleDateString('fr-FR')} — {new Date(r.dateFin).toLocaleDateString('fr-FR')}
                  </p>
                </div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${STATUS_LABEL[r.statut]?.class ?? 'bg-white/5 text-white/30 border-white/10'}`}>
                  {STATUS_LABEL[r.statut]?.label ?? r.statut}
                </span>
              </Link>
            ))}
          </div>
        )}
      </DarkCard>

      {/* Rules */}
      {(vehicle.reglesSpecifiques || vehicle.zoneConduite || vehicle.assurance) && (
        <DarkCard title="Règles & conditions" icon={Shield}>
          <div className="space-y-2 text-xs text-white/50">
            {vehicle.joursMinimum > 1 && (
              <p>📅 Minimum <span className="font-bold text-white/70">{vehicle.joursMinimum} jours</span></p>
            )}
            {vehicle.ageMinimum > 18 && (
              <p>🎂 Âge minimum <span className="font-bold text-white/70">{vehicle.ageMinimum} ans</span></p>
            )}
            {vehicle.zoneConduite && <p>🗺️ Zone : {vehicle.zoneConduite}</p>}
            {vehicle.assurance && <p>🛡️ Assurance : {vehicle.assurance}</p>}
            {vehicle.reglesSpecifiques && <p>📝 {vehicle.reglesSpecifiques}</p>}
          </div>
        </DarkCard>
      )}
    </div>
  );
}
