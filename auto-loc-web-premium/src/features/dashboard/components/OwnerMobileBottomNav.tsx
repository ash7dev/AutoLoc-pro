'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Car, CalendarCheck, Wallet } from 'lucide-react';
import { clsx } from 'clsx';

interface OwnerMobileBottomNavProps {
  /** Nombre de demandes de réservation en attente de réponse (badge sur « Réservations »). */
  pendingReservationsCount?: number;
}

export const OwnerMobileBottomNav: React.FC<OwnerMobileBottomNavProps> = ({
  pendingReservationsCount = 0,
}) => {
  const pathname = usePathname() ?? '';

  // Libellés et navigation mobile
  const items = [
    { label: "Aujourd'hui", href: '/dashboard', icon: LayoutDashboard, badge: 0 },
    {
      label: 'Réservations',
      href: '/dashboard/reservations',
      icon: CalendarCheck,
      badge: pendingReservationsCount,
    },
    { label: 'Véhicules', href: '/dashboard/vehicles', icon: Car, badge: 0 },
    { label: 'Revenus', href: '/dashboard/wallet', icon: Wallet, badge: 0 },
  ];

  return (
    <nav
      aria-label="Navigation propriétaire mobile"
      className="fixed inset-x-3 bottom-[calc(1rem+env(safe-area-inset-bottom))] z-50 md:hidden"
    >
      <div className="mx-auto flex max-w-[420px] items-center rounded-full border border-[#F1DFB6]/15 bg-[#0A3D2E] p-1.5 shadow-[0_14px_34px_-12px_rgba(10,61,46,0.55)]">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive =
            item.href === '/dashboard'
              ? pathname === '/dashboard'
              : pathname.startsWith(item.href);
          const hasBadge = item.badge > 0;

          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive ? 'page' : undefined}
              aria-label={hasBadge ? `${item.label}, ${item.badge} en attente` : undefined}
              className={clsx(
                'flex min-w-0 flex-1 flex-col items-center justify-center gap-1 rounded-full px-1 py-1.5 text-[10px] font-medium transition-colors duration-200',
                'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#F1DFB6]',
                isActive
                  ? 'bg-[#F1DFB6] text-[#0A3D2E] font-bold shadow-md'
                  : 'text-[#F1DFB6]/70 hover:text-[#F1DFB6] active:bg-[#F1DFB6]/10'
              )}
            >
              <span className="relative">
                <Icon
                  className="h-5 w-5"
                  strokeWidth={isActive ? 2.2 : 1.8}
                  aria-hidden="true"
                />
                {hasBadge && (
                  <span
                    aria-hidden="true"
                    className={clsx(
                      'absolute -right-2.5 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[9px] font-bold leading-none',
                      isActive
                        ? 'bg-[#0A3D2E] text-[#F1DFB6]'
                        : 'bg-[#F1DFB6] text-[#0A3D2E]'
                    )}
                  >
                    {item.badge > 99 ? '99+' : item.badge}
                  </span>
                )}
              </span>
              <span className="leading-none">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};