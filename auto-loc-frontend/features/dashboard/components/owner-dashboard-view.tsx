"use client";

import { RevenueChart } from "@/features/dashboard/components/revenue-chart";
import { RecentReservations } from "@/features/dashboard/components/recent-reservations";
import { AttendanceCalendar } from "@/features/dashboard/components/attendance-calendar";
import { OwnerQuickActions } from "@/features/dashboard/components/owner-quick-actions";
import { OwnerTodoCard } from "@/features/dashboard/components/owner-todo-card";
import { WalletSnapshot } from "@/features/dashboard/components/wallet-snapshot";
import { OwnerHeader } from "@/features/dashboard/components/owner-header";
import { OverviewStats } from "@/features/dashboard/components/overview-stats";
import { MobileQuickActions } from "@/features/dashboard/components/mobile-quick-actions";
import { FleetPerformance } from "@/features/dashboard/components/fleet-performance";
import { ReservationStatsVisualizer } from "@/features/reservations/components/ReservationStatsVisualizer";
import { ProfileCompletionBanner } from "@/features/dashboard/components/profile-completion-banner";
import { useState, useMemo } from "react";
import type { Reservation, OwnerStats } from "@/lib/nestjs/reservations";
import type { Vehicle } from "@/lib/nestjs/vehicles";
import type { WalletData } from "@/lib/nestjs/wallet";
import type { UserProfile } from "@/lib/nestjs/auth";

// ── Types ──────────────────────────────────────────────────────────────────────

interface OwnerDashboardViewProps {
    reservations?: Reservation[];
    vehicles?: Vehicle[];
    wallet: WalletData | null;
    penalties?: { totalDette: number; count: number } | null;
    stats?: OwnerStats | null;
    profile?: UserProfile | null;
}

// ── Helpers ────────────────────────────────────────────────────────────────────

function fmtDate(iso: string | null | undefined) {
    if (!iso) return "—";
    const d = new Date(iso);
    if (isNaN(d.getTime())) return "—";
    return d.toLocaleDateString("fr-FR", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
}

function buildTodoItems(reservations: Reservation[] = [], vehicles: Vehicle[] = []) {
    const items: Array<{
        id: number;
        title: string;
        description: string;
        priority: "urgent" | "normal";
        href: string;
        meta?: string;
        date?: string;
    }> = [];

    // Paid reservations waiting for confirmation
    const payees = reservations.filter((r) => r.statut === "PAYEE");
    if (payees.length > 0) {
        const earliest = payees.reduce((a, b) => a.dateDebut < b.dateDebut ? a : b);
        items.push({
            id: 1,
            title: `${payees.length} réservation${payees.length > 1 ? "s" : ""} à confirmer`,
            description: "Réservations payées en attente de votre confirmation.",
            priority: "urgent",
            href: "/dashboard/owner/reservations",
            meta: "Action requise",
            date: `Début le ${fmtDate(earliest.dateDebut)}`,
        });
    }

    // Confirmed reservations (check-in incoming for the owner)
    const pendingOwnerCheckins = reservations.filter((r) => r.statut === "CONFIRMEE" && !r.checkinProprietaireLe);
    if (pendingOwnerCheckins.length > 0) {
        const earliest = pendingOwnerCheckins.reduce((a, b) => a.dateDebut < b.dateDebut ? a : b);
        items.push({
            id: 2,
            title: `${pendingOwnerCheckins.length} check-in${pendingOwnerCheckins.length > 1 ? "s" : ""} à effectuer`,
            description: "Le paiement est déclenché après validation de l'état des lieux.",
            priority: "urgent",
            href: "/dashboard/owner/reservations",
            meta: "À effectuer",
            date: `Prévu le ${fmtDate(earliest.dateDebut)}`,
        });
    }

    // Confirmed reservations (waiting for tenant tactile validation)
    const pendingTenantCheckins = reservations.filter((r) => r.statut === "CONFIRMEE" && r.checkinProprietaireLe && !r.checkinLocataireLe);
    if (pendingTenantCheckins.length > 0) {
        const earliest = pendingTenantCheckins.reduce((a, b) => a.dateDebut < b.dateDebut ? a : b);
        items.push({
            id: 21,
            title: `${pendingTenantCheckins.length} validation${pendingTenantCheckins.length > 1 ? "s" : ""} locataire en attente`,
            description: "La location démarrera automatiquement au bout de la date limite.",
            priority: "normal",
            href: "/dashboard/owner/reservations",
            meta: "Attente",
            date: `Fait le ${fmtDate(earliest.checkinProprietaireLe!)}`,
        });
    }

    // Pending vehicles
    const pendingVehicles = vehicles.filter(
        (v) => (v.statut === "EN_ATTENTE_VALIDATION" || v.statut === "BROUILLON"),
    );
    if (pendingVehicles.length > 0) {
        items.push({
            id: 3,
            title: `${pendingVehicles.length} véhicule${pendingVehicles.length > 1 ? "s" : ""} en attente`,
            description: "Un véhicule non validé n'apparaît pas dans le catalogue.",
            priority: "normal",
            href: "/dashboard/owner/vehicles",
        });
    }

    // In-progress reservations
    const enCours = reservations.filter((r) => r.statut === "EN_COURS");
    if (enCours.length > 0) {
        const earliest = enCours.reduce((a, b) => a.dateFin < b.dateFin ? a : b);
        items.push({
            id: 4,
            title: `${enCours.length} location${enCours.length > 1 ? "s" : ""} en cours`,
            description: "N'oubliez pas le check-out à la fin.",
            priority: "normal",
            href: "/dashboard/owner/reservations",
            date: `Fin le ${fmtDate(earliest.dateFin)}`,
        });
    }

    return items;
}

const EXCLUDED_STATUSES = ['INITIEE', 'EN_ATTENTE_PAIEMENT'];

function buildRecentReservations(reservations: Reservation[] = []) {
    return [...reservations]
        .filter((r) => !EXCLUDED_STATUSES.includes(r.statut))
        .sort((a, b) => {
            const dateA = a.creeLe ? new Date(a.creeLe).getTime() : 0;
            const dateB = b.creeLe ? new Date(b.creeLe).getTime() : 0;
            return dateB - dateA;
        })
        .slice(0, 5)
        .map((r) => {
            const dateFinParsed = new Date(r.dateFin);
            const dateFinStr = isNaN(dateFinParsed.getTime()) 
                ? "—" 
                : dateFinParsed.toLocaleDateString("fr-FR", { day: "numeric", month: "short" });

            return {
                id: r.id,
                vehicle: r.vehicule ? `${r.vehicule.marque} ${r.vehicule.modele}` : "Véhicule inconnu",
                vehiclePhoto: r.vehicule 
                    ? (r.vehicule.photoUrl || r.vehicule.photos?.find(p => p.estPrincipale)?.url || r.vehicule.photos?.[0]?.url) 
                    : undefined,
                tenantName: r.locataire ? `${r.locataire.prenom} ${r.locataire.nom}` : "Locataire inconnu",
                tenantPhone: r.locataire?.telephone,
                duration: `${r.nbJours} j.`,
                dateRange: `${fmtDate(r.dateDebut)} — ${fmtDate(r.dateFin)}`,
                amount: `${r.montantProprietaire} FCFA`,
                status: r.statut as any,
                meta: r.statut === "PAYEE"
                    ? "Confirmation requise"
                    : r.statut === "CONFIRMEE"
                        ? "Check-in à venir"
                        : r.statut === "EN_COURS"
                            ? `Fin prévue le ${dateFinStr}`
                            : undefined,
                href: `/dashboard/owner/reservations/${r.id}`,
            };
        });
}

// ── Component ──────────────────────────────────────────────────────────────────

export function OwnerDashboardView({
    reservations = [],
    vehicles = [],
    wallet,
    penalties,
    stats,
    profile,
}: OwnerDashboardViewProps) {
    const [calendarDate, setCalendarDate] = useState(() => new Date());
    const [revenuePeriod, setRevenuePeriod] = useState("current"); // "current", "last", "2months"

    const currentMonth = calendarDate.toLocaleDateString("fr-FR", { month: "long", year: "numeric" })
        .replace(/^./, (c) => c.toUpperCase());

    const handlePrevMonth = () => {
        setCalendarDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
    };
    const handleNextMonth = () => {
        setCalendarDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
    };

    const todoItems = buildTodoItems(reservations, vehicles);
    const recentReservations = buildRecentReservations(reservations);

    // ── Prepare Calendar Data ──
    const calendarDays = useMemo(() => {
        const year = calendarDate.getFullYear();
        const month = calendarDate.getMonth();
        const daysInMonth = new Date(year, month + 1, 0).getDate();

        return Array.from({ length: daysInMonth }, (_, i) => {
            const day = i + 1;
            // Get YYYY-MM-DD for current day
            const dateStr = new Date(year, month, day, 12).toISOString().split("T")[0];

            let isReserved = false;
            let hasCheckIn = false;
            let hasCheckOut = false;
            const reservedVehicles: string[] = [];

            reservations.forEach(r => {
                if (!["PAYEE", "CONFIRMEE", "EN_COURS", "TERMINEE"].includes(r.statut)) return;
                const start = r.dateDebut.split("T")[0];
                const end = r.dateFin.split("T")[0];

                if (dateStr >= start && dateStr <= end) {
                    isReserved = true;
                    const vName = `${r.vehicule.marque} ${r.vehicule.modele}`;
                    if (!reservedVehicles.includes(vName)) reservedVehicles.push(vName);
                }
                if (start === dateStr) hasCheckIn = true;
                if (end === dateStr) hasCheckOut = true;
            });

            return { 
                day, 
                dateStr, 
                status: isReserved ? ("reserved" as const) : null,
                hasCheckIn,
                hasCheckOut,
                reservedVehicles
            };
        });
    }, [calendarDate, reservations]);

    // ── Prepare Revenue Data ──
    const { revenueData, selectedYear, selectedMonth } = useMemo(() => {
        const revDate = new Date();
        // Fixe le jour à 1 pour éviter le "date drift" (ex: 31 mars -> fév = bug)
        revDate.setDate(1); 
        
        if (revenuePeriod === "last") revDate.setMonth(revDate.getMonth() - 1);
        if (revenuePeriod === "2months") revDate.setMonth(revDate.getMonth() - 2);

        const year = revDate.getFullYear();
        const month = revDate.getMonth();
        const daysInMonth = new Date(year, month + 1, 0).getDate();

        // Accumulate revenue per day (indexed 1..daysInMonth)
        const dailyRevenue = new Array(daysInMonth + 1).fill(0);
        let totalRev = 0;

        reservations.forEach(r => {
            if (!["TERMINEE", "EN_COURS", "CONFIRMEE", "PAYEE"].includes(r.statut)) return;
            
            // On parse la date et on compare mois/année
            const start = new Date(r.dateDebut);
            if (start.getMonth() === month && start.getFullYear() === year) {
                const amount = parseFloat(r.montantProprietaire || "0");
                dailyRevenue[start.getDate()] += amount;
                totalRev += amount;
            }
        });

        // Build cumulative sums so the chart shows a rising curve
        const cumulative = new Array(daysInMonth + 1).fill(0);
        for (let d = 1; d <= daysInMonth; d++) {
            cumulative[d] = cumulative[d - 1] + dailyRevenue[d];
        }

        // --- Calcule le revenu du mois PRECEDENT pour le % d'évolution ---
        const prevDate = new Date(revDate);
        prevDate.setMonth(prevDate.getMonth() - 1);
        const pMonth = prevDate.getMonth();
        const pYear = prevDate.getFullYear();
        let prevTotalRev = 0;

        reservations.forEach(r => {
            if (!["TERMINEE", "EN_COURS", "CONFIRMEE", "PAYEE"].includes(r.statut)) return;
            const start = new Date(r.dateDebut);
            if (start.getMonth() === pMonth && start.getFullYear() === pYear) {
                prevTotalRev += parseFloat(r.montantProprietaire || "0");
            }
        });

        const evolution = prevTotalRev > 0 
            ? ((totalRev - prevTotalRev) / prevTotalRev) * 100 
            : totalRev > 0 ? 100 : 0;

        const formatter = new Intl.DateTimeFormat("fr-FR", { day: "2-digit", month: "short" });
        const steps = [1, 5, 10, 15, 20, 25, daysInMonth];
        const points: Array<{ day: string; value: number; highlight?: boolean }> = [];

        for (const day of steps) {
            if (day > daysInMonth) continue;
            points.push({
                day: formatter.format(new Date(year, month, day)),
                value: cumulative[day],
            });
        }

        // Highlight the last point (final total)
        if (points.length > 0 && totalRev > 0) {
            points[points.length - 1].highlight = true;
        }

        return { 
            revenueData: { points, totalRev, evolution }, 
            selectedYear: year, 
            selectedMonth: month 
        };
    }, [revenuePeriod, reservations]);

    // Wallet data
    const walletSnapshot = wallet
        ? {
            available: `${wallet.balance.soldeDisponible} FCFA`,
            pending: `${wallet.balance.enAttente} FCFA`,
            processing: "0 FCFA",
            totalPenalties: penalties?.totalDette || 0,
            penaltiesCount: penalties?.count || 0
          }
        : {
            available: "— FCFA",
            pending: "— FCFA",
            processing: "— FCFA",
            totalPenalties: 0,
            penaltiesCount: 0
          };

    // Stats
    const totalRevenue = reservations
        .filter((r) => ["TERMINEE", "EN_COURS"].includes(r.statut))
        .reduce((sum, r) => sum + parseFloat(r.montantProprietaire || "0"), 0);
    const activeReservations = reservations.filter((r) => ["PAYEE", "CONFIRMEE", "EN_COURS"].includes(r.statut)).length;

    // Calculate urgent reservations for mobile
    const urgentReservations = reservations.filter((r) => ["PAYEE", "CONFIRMEE"].includes(r.statut));

    return (
        <div className="flex flex-col gap-4 p-3 sm:gap-6 sm:p-6">
            <OwnerHeader
                title="Tableau de bord"
                subtitle={`Vue d'ensemble — ${vehicles.length} véhicule${vehicles.length !== 1 ? "s" : ""} · ${activeReservations} réservation${activeReservations !== 1 ? "s" : ""} active${activeReservations !== 1 ? "s" : ""}`}
                showShareStoryBtn={true}
                vehicles={vehicles}
            />

            {/* Profile Completion Banner */}
            {profile && <ProfileCompletionBanner profile={profile} vehiclesCount={vehicles.length} />}

            {/* Stats row — visible on all breakpoints */}
            <OverviewStats data={stats} />

            {/* Mobile Layout */}
            <div className="lg:hidden space-y-4">
                {/* Revenue + Wallet Cards */}
                <div className="grid grid-cols-1 gap-3">
                    <RevenueChart
                        data={revenueData.points}
                        total={revenueData.totalRev.toLocaleString("fr-FR")}
                        change={`${revenueData.evolution >= 0 ? "+" : ""}${Math.round(revenueData.evolution)}%`}
                        selectedMonth={revenuePeriod}
                        onMonthChange={setRevenuePeriod}
                    />
                    <WalletSnapshot
                        data={walletSnapshot}
                        loading={!wallet}
                        ctaLabel="Gérer le wallet"
                    />
                </div>

                {/* Todo List - Just before Fleet Performance */}
                <OwnerTodoCard
                    items={todoItems.length > 0 ? todoItems : [
                        { id: 0, title: "Rien à signaler", description: "Tout est en ordre !", priority: "normal" as const, href: "/dashboard/owner" },
                    ]}
                    allHref="/dashboard/owner/reservations"
                />

                {/* Fleet Performance - Mobile */}
                <FleetPerformance 
                    vehicles={vehicles} 
                    reservations={reservations} 
                    year={selectedYear}
                    month={selectedMonth}
                />

                {/* Reservation Stats - Mobile */}
                <ReservationStatsVisualizer 
                    reservations={reservations} 
                />

                {/* Quick Actions */}
                <MobileQuickActions 
                    reservations={reservations}
                    urgentCount={urgentReservations.length}
                />

                {/* Recent Reservations - Compact */}
                <RecentReservations
                    mode="pipeline"
                    reservations={recentReservations.slice(0, 3)}
                />

                {/* Mini Calendar */}
                <AttendanceCalendar
                    month={currentMonth}
                    days={calendarDays}
                    reservations={reservations}
                    onPrev={handlePrevMonth}
                    onNext={handleNextMonth}
                />
            </div>

            {/* Desktop Layout */}
            <div className="hidden lg:flex lg:flex-col lg:gap-6">
                {/* Row 2 — Revenue + Wallet */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                    <div className="lg:col-span-1">
                        <RevenueChart
                            data={revenueData.points}
                            total={revenueData.totalRev.toLocaleString("fr-FR")}
                            change={`${revenueData.evolution >= 0 ? "+" : ""}${Math.round(revenueData.evolution)}%`}
                            selectedMonth={revenuePeriod}
                            onMonthChange={setRevenuePeriod}
                        />
                    </div>
                    <div className="lg:col-span-1">
                        <WalletSnapshot data={walletSnapshot} loading={!wallet} />
                    </div>
                </div>

                {/* Row 3 — Todo + Actions */}
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 sm:gap-6">
                    <div className="xl:col-span-2">
                        <OwnerTodoCard
                            items={todoItems.length > 0 ? todoItems : [
                                { id: 0, title: "Rien à signaler", description: "Tout est en ordre !", priority: "normal" as const, href: "/dashboard/owner" },
                            ]}
                                allHref="/dashboard/owner/reservations"
                        />
                    </div>
                    <div className="xl:col-span-1">
                        <OwnerQuickActions reservations={reservations} />
                    </div>
                </div>

                {/* Row 4 — Pipeline + Analytics */}
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 sm:gap-6 items-stretch">
                    <div className="xl:col-span-2 h-full">
                        <RecentReservations
                            mode="pipeline"
                            reservations={recentReservations}
                            className="h-full"
                        />
                    </div>
                    <div className="xl:col-span-1 flex flex-col gap-4 sm:gap-6">
                        <ReservationStatsVisualizer 
                            reservations={reservations}
                            className="flex-1"
                        />
                        <FleetPerformance 
                            vehicles={vehicles} 
                            reservations={reservations}
                            year={selectedYear}
                            month={selectedMonth}
                            className="flex-1"
                        />
                    </div>
                </div>

                {/* Row 5 — Calendar */}
                <div className="grid grid-cols-1 gap-4 sm:gap-6">
                    <AttendanceCalendar
                        month={currentMonth}
                        days={calendarDays}
                        reservations={reservations}
                        onPrev={handlePrevMonth}
                        onNext={handleNextMonth}
                    />
                </div>
            </div>
        </div>
    );
}
