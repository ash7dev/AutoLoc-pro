"use client";

import { RevenueChart } from "@/features/dashboard/components/revenue-chart";
import { RecentReservations } from "@/features/dashboard/components/recent-reservations";
import { AttendanceCalendar } from "@/features/dashboard/components/attendance-calendar";
import { OwnerQuickActions } from "@/features/dashboard/components/owner-quick-actions";
import { OwnerTodoCard } from "@/features/dashboard/components/owner-todo-card";
import { WalletSnapshot } from "@/features/dashboard/components/wallet-snapshot";
import { OwnerHeader } from "@/features/dashboard/components/owner-header";
import { OverviewStats } from "@/features/dashboard/components/overview-stats";
import { useState, useMemo } from "react";
import type { Reservation } from "@/lib/nestjs/reservations";
import type { Vehicle } from "@/lib/nestjs/vehicles";
import type { WalletData } from "@/lib/nestjs/wallet";

// ── Types ──────────────────────────────────────────────────────────────────────

interface OwnerDashboardViewProps {
    reservations?: Reservation[];
    vehicles?: Vehicle[];
    wallet: WalletData | null;
}

// ── Helpers ────────────────────────────────────────────────────────────────────

function buildTodoItems(reservations: Reservation[] = [], vehicles: Vehicle[] = []) {
    const items: Array<{
        id: number;
        title: string;
        description: string;
        priority: "urgent" | "normal";
        href: string;
        meta?: string;
    }> = [];

    // Paid reservations waiting for confirmation
    const payees = reservations.filter((r) => r.statut === "PAYEE");
    if (payees.length > 0) {
        items.push({
            id: 1,
            title: `${payees.length} réservation${payees.length > 1 ? "s" : ""} à confirmer`,
            description: "Réservations payées en attente de votre confirmation.",
            priority: "urgent",
            href: "/dashboard/owner/reservations",
            meta: "Action requise",
        });
    }

    // Confirmed reservations (check-in incoming)
    const confirmees = reservations.filter((r) => r.statut === "CONFIRMEE");
    if (confirmees.length > 0) {
        items.push({
            id: 2,
            title: `${confirmees.length} check-in${confirmees.length > 1 ? "s" : ""} à effectuer`,
            description: "Le paiement est déclenché après validation du check-in.",
            priority: "urgent",
            href: "/dashboard/owner/reservations",
            meta: "À venir",
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
        items.push({
            id: 4,
            title: `${enCours.length} location${enCours.length > 1 ? "s" : ""} en cours`,
            description: "N'oubliez pas le check-out à la fin.",
            priority: "normal",
            href: "/dashboard/owner/reservations",
        });
    }

    return items;
}

function buildRecentReservations(reservations: Reservation[] = []) {
    const statusPriority: Record<string, number> = {
        PAYEE: 0, CONFIRMEE: 1, EN_COURS: 2, TERMINEE: 3, ANNULEE: 4, EXPIREE: 5, INITIEE: 6, EN_ATTENTE_PAIEMENT: 7,
    };

    return reservations
        .sort((a, b) => (statusPriority[a.statut] ?? 99) - (statusPriority[b.statut] ?? 99))
        .slice(0, 5)
        .map((r) => ({
            id: r.id,
            vehicle: `${r.vehicule.marque} ${r.vehicule.modele}`,
            amount: `${r.montantProprietaire} FCFA`,
            status: r.statut as any,
            meta: r.statut === "PAYEE"
                ? "Confirmation requise"
                : r.statut === "CONFIRMEE"
                    ? "Check-in à venir"
                    : r.statut === "EN_COURS"
                        ? `Fin prévue le ${new Date(r.dateFin).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}`
                        : undefined,
            href: `/dashboard/owner/reservations/${r.id}`,
        }));
}

// ── Component ──────────────────────────────────────────────────────────────────

export function OwnerDashboardView({
    reservations = [],
    vehicles = [],
    wallet,
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

            const isReserved = reservations.some(r => {
                if (!["PAYEE", "CONFIRMEE", "EN_COURS", "TERMINEE"].includes(r.statut)) return false;
                const start = r.dateDebut.split("T")[0];
                const end = r.dateFin.split("T")[0];
                return dateStr >= start && dateStr <= end;
            });

            return { day, status: isReserved ? ("reserved" as const) : null };
        });
    }, [calendarDate, reservations]);

    // ── Prepare Revenue Data ──
    const revenueData = useMemo(() => {
        const revDate = new Date();
        if (revenuePeriod === "last") revDate.setMonth(revDate.getMonth() - 1);
        if (revenuePeriod === "2months") revDate.setMonth(revDate.getMonth() - 2);

        const year = revDate.getFullYear();
        const month = revDate.getMonth();
        const daysInMonth = new Date(year, month + 1, 0).getDate();

        const dailyRevenue = new Array(daysInMonth + 1).fill(0);
        let totalRev = 0;

        reservations.forEach(r => {
            if (!["TERMINEE", "EN_COURS", "CONFIRMEE", "PAYEE"].includes(r.statut)) return;
            const start = new Date(r.dateDebut);
            if (start.getMonth() === month && start.getFullYear() === year) {
                const amount = parseFloat(r.montantProprietaire || "0");
                dailyRevenue[start.getDate()] += amount;
                totalRev += amount;
            }
        });

        // Generate data points every 5 days or all days? Let's do roughly 6 points
        const points: Array<{ day: string; value: number; highlight?: boolean }> = [];
        const formatter = new Intl.DateTimeFormat("fr-FR", { day: "2-digit", month: "short" });

        // Let's create a point every ~5 days to prevent chart clutter
        const steps = [1, 5, 10, 15, 20, 25, daysInMonth];
        for (const day of steps) {
            if (day > daysInMonth) continue;
            const d = new Date(year, month, day);
            points.push({
                day: formatter.format(d),
                value: dailyRevenue[day] || 0
            });
        }

        const maxVal = Math.max(1, ...points.map(p => p.value));
        if (maxVal > 1) {
            const maxPoint = points.find(p => p.value === maxVal);
            if (maxPoint) maxPoint.highlight = true;
        }

        return { points, totalRev };
    }, [revenuePeriod, reservations]);

    // Wallet data
    const walletSnapshot = wallet
        ? { available: `${wallet.balance.soldeDisponible} FCFA`, pending: `${wallet.balance.enAttente} FCFA`, processing: "0 FCFA" }
        : { available: "— FCFA", pending: "— FCFA", processing: "— FCFA" };

    // Stats
    const totalRevenue = reservations
        .filter((r) => ["TERMINEE", "EN_COURS"].includes(r.statut))
        .reduce((sum, r) => sum + parseFloat(r.montantProprietaire || "0"), 0);
    const activeReservations = reservations.filter((r) => ["PAYEE", "CONFIRMEE", "EN_COURS"].includes(r.statut)).length;

    return (
        <div className="flex flex-col gap-6 p-6">
            <OwnerHeader
                title="Tableau de bord"
                subtitle={`Vue d'ensemble — ${vehicles.length} véhicule${vehicles.length !== 1 ? "s" : ""} · ${activeReservations} réservation${activeReservations !== 1 ? "s" : ""} active${activeReservations !== 1 ? "s" : ""}`}
            />

            {/* Row 2 — Revenue + Wallet */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="lg:col-span-1">
                    <RevenueChart
                        data={revenueData.points}
                        total={revenueData.totalRev.toLocaleString("fr-FR")}
                        change="0%" // Could be calculated comparing to previous month
                        selectedMonth={revenuePeriod}
                        onMonthChange={setRevenuePeriod}
                    />
                </div>
                <div className="lg:col-span-1">
                    <WalletSnapshot data={walletSnapshot} />
                </div>
            </div>

            {/* Row 3 — Todo + Actions */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
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

            {/* Row 4 — Reservations + Calendar */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                <div className="xl:col-span-2">
                    <RecentReservations
                        mode="pipeline"
                        reservations={recentReservations}
                    />
                </div>
                <div className="flex flex-col gap-6">
                    <AttendanceCalendar
                        month={currentMonth}
                        days={calendarDays}
                        onPrev={handlePrevMonth}
                        onNext={handleNextMonth}
                    />
                </div>
            </div>
        </div>
    );
}
