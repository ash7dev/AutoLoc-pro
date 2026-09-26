'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { DesktopNav } from './DesktopNav';
import { MobileBottomNav } from './MobileBottomNav';
import { MobileDetailHeader } from './MobileDetailHeader';
import { UserProfileDropdown } from './UserProfileDropdown';
import { useUserStore } from '../../store/useUserStore';
import { initCrossTabSync } from '../../auth/crossTabSync';
import { kycRevalidator } from '../../auth/kycRevalidator';
import { LoginModal } from '../../../features/auth/components/LoginModal';

export const Navbar: React.FC = () => {
  const pathname = usePathname();
  const [isMounted, setIsMounted] = useState(false);
  const isAuthenticated = useUserStore((s) => s.isAuthenticated);
  const user = useUserStore((s) => s.user);
  const setUser = useUserStore((s) => s.setUser);
  const logout = useUserStore((s) => s.logout);
  const guestAuthModalVisible = useUserStore((s) => s.guestAuthModalVisible);
  const closeGuestModal = useUserStore((s) => s.closeGuestModal);

  useEffect(() => {
    setIsMounted(true);

    const cleanupSync = initCrossTabSync((event) => {
      if (event.type === 'USER_UPDATED') {
        setUser(event.payload);
      } else if (event.type === 'LOGOUT') {
        logout();
      }
    });

    kycRevalidator.startKycWatcher();

    return () => {
      cleanupSync();
      kycRevalidator.stopKycWatcher();
    };
  }, [setUser, logout]);

  // Si on est sur les routes /login, /register, tout l'espace owner /dashboard, /admin ou /hosts, masquer la Navbar et la modale d'invité
  if (
    pathname === '/login' ||
    pathname === '/register' ||
    pathname?.startsWith('/dashboard') ||
    pathname?.startsWith('/admin') ||
    pathname?.startsWith('/hosts')
  ) {
    return null;
  }

  if (!isMounted) {
    return (
      <>
        {/* Desktop skeleton : même hauteur que l'espaceur */}
        <div className="hidden h-[88px] lg:block" />
        {/* Mobile skeleton : même capsule que le header final */}
        <div className="sticky top-0 z-40 w-full px-4 pt-[calc(0.75rem+env(safe-area-inset-top))] lg:hidden">
          <div className="flex h-14 items-center justify-between rounded-full border border-slate-900/10 bg-white/70 pl-5 pr-2">
            <div className="h-8 w-28 animate-pulse rounded-full bg-slate-100" />
            <div className="h-9 w-28 animate-pulse rounded-full bg-slate-100" />
          </div>
        </div>
      </>
    );
  }

  const isDetailPage =
    (pathname?.startsWith('/vehicles/') && pathname !== '/vehicles') ||
    (pathname?.startsWith('/reservations/') && pathname !== '/reservations');

  const isReservationsMainPage = pathname === '/reservations';
  const isProfileMainPage = pathname === '/profile';

  return (
    <>
      {/* 1. Header Desktop (>= 1024px) */}
      <div className="hidden lg:block">
        <DesktopNav />
      </div>

      {/* 2. Header Mobile (< 1024px) */}
      {isDetailPage ? (
        <MobileDetailHeader />
      ) : isReservationsMainPage || isProfileMainPage ? null : (
        <header className="pointer-events-none fixed inset-x-0 top-[calc(0.75rem+env(safe-area-inset-top))] z-40 w-full px-4 lg:hidden">
          <div className="pointer-events-auto flex h-14 items-center justify-between rounded-full border border-slate-900/10 bg-white/90 pl-5 pr-2 shadow-[0_10px_30px_-12px_rgba(15,23,42,0.25)] backdrop-blur-xl">
            {/* Logo */}
            <Link
              href="/"
              className="relative h-8 w-28 shrink-0 rounded-sm focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-main"
            >
              <Image
                src="/logo.png"
                alt="AutoLoc"
                fill
                priority
                sizes="112px"
                className="object-contain object-left"
              />
            </Link>

            {/* Action */}
            {isAuthenticated && user ? (
              <div className="pr-1">
                <UserProfileDropdown user={user} />
              </div>
            ) : (
              <Link
                href="/login"
                className="rounded-full bg-brand-main px-4 py-2 text-xs font-semibold text-champagne transition-colors hover:bg-forest-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-main"
              >
                Se connecter
              </Link>
            )}
          </div>
        </header>
      )}

      {/* 3. Navigation flottante basse pour mobile (< 1024px) */}
      <MobileBottomNav />

      {/* 4. Modale globale d'authentification pour les invités */}
      <LoginModal isOpen={guestAuthModalVisible} onClose={closeGuestModal} />
    </>
  );
};