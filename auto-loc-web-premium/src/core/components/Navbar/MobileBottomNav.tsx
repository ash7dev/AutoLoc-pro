'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Home, Compass, CalendarCheck, CircleUserRound } from 'lucide-react';
import { clsx } from 'clsx';
import { useUserStore } from '../../store/useUserStore';
import { IntentEngine } from '../../auth/intentEngine';

/*
 * Dock vert forêt :
 *  - fond            #0A3D2E
 *  - icônes / actif  #F1DFB6 (champagne)
 */

export const MobileBottomNav: React.FC = () => {
  const router = useRouter();
  const pathname = usePathname();
  const isAuthenticated = useUserStore((s) => s.isAuthenticated);
  const profileHref = '/profile';

  // Masquer la navigation basse sur les pages détails (ex: /vehicles/[id] et /reservations/[id])
  const isDetailPage =
    (pathname?.startsWith('/vehicles/') && pathname !== '/vehicles') ||
    (pathname?.startsWith('/reservations/') && pathname !== '/reservations');
  if (isDetailPage) {
    return null;
  }

  const handleReservationsClick = (e: React.MouseEvent) => {
    if (!isAuthenticated) {
      const allowed = IntentEngine.guardAction('VIEW_BOOKINGS', {
        redirectToUrl: '/reservations',
        reasonMessage: 'Veuillez vous connecter pour consulter vos réservations.',
      });
      if (!allowed) {
        e.preventDefault();
        router.push('/login');
      }
    }
  };

  const handleProfileClick = (e: React.MouseEvent) => {
    if (!isAuthenticated) {
      const allowed = IntentEngine.guardAction('VIEW_PROFILE', {
        redirectToUrl: profileHref,
        reasonMessage: 'Veuillez vous connecter pour accéder à votre espace profil.',
      });
      if (!allowed) {
        e.preventDefault();
        router.push('/login');
      }
    }
  };

  const items = [
    { label: 'Accueil', href: '/', icon: Home },
    { label: 'Explorer', href: '/vehicles', icon: Compass },
    {
      label: 'Réservations',
      href: '/reservations',
      icon: CalendarCheck,
      onClick: handleReservationsClick,
    },
    {
      label: 'Profil',
      href: profileHref,
      icon: CircleUserRound,
      onClick: handleProfileClick,
    },
  ];

  return (
    <nav
      aria-label="Navigation principale"
      className="fixed inset-x-4 bottom-[calc(1rem+env(safe-area-inset-bottom))] z-50 lg:hidden"
    >
      <div className="mx-auto flex max-w-[340px] items-center justify-between rounded-full border border-[#F1DFB6]/10 bg-[#0A3D2E] p-2 shadow-[0_14px_34px_-12px_rgba(10,61,46,0.55)]">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive =
            item.label === 'Profil'
              ? pathname === '/profile'
              : pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));

          return (
            <Link
              key={item.label}
              href={item.href}
              onClick={item.onClick}
              aria-label={item.label}
              aria-current={isActive ? 'page' : undefined}
              className={clsx(
                'flex h-12 w-12 items-center justify-center rounded-full transition-colors duration-200',
                'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#F1DFB6]',
                isActive
                  ? 'bg-[#F1DFB6] text-[#0A3D2E]'
                  : 'text-[#F1DFB6]/60 hover:text-[#F1DFB6] active:bg-[#F1DFB6]/10'
              )}
            >
              <Icon className="h-[22px] w-[22px]" strokeWidth={isActive ? 2.1 : 1.75} />
            </Link>
          );
        })}
      </div>
    </nav>
  );
};