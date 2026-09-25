'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { UserProfileDropdown } from './UserProfileDropdown';
import { useUserStore } from '../../store/useUserStore';
import { IntentEngine } from '../../auth/intentEngine';
import { useHostGate } from '../../../features/owner/hooks/useHostGate';
import { ReservationGateModal } from '../../../features/reservations/components/ReservationGateModal';

const NavItem: React.FC<{ href: string; children: React.ReactNode }> = ({ href, children }) => {
  const pathname = usePathname();
  const active = href === '/' ? pathname === '/' : pathname.startsWith(href);

  return (
    <Link
      href={href}
      aria-current={active ? 'page' : undefined}
      className={`
        rounded-full px-4 py-2 text-sm font-medium
        transition-colors duration-200
        focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0A3D2E]
        ${active
          ? 'bg-slate-900/[0.06] text-slate-900'
          : 'text-slate-600 hover:bg-slate-900/[0.04] hover:text-slate-900'}
      `}
    >
      {children}
    </Link>
  );
};

export const DesktopNav: React.FC = () => {
  const router = useRouter();
  const pathname = usePathname();
  const isAuthenticated = useUserStore((s) => s.isAuthenticated);
  const user = useUserStore((s) => s.user);
  const [scrolled, setScrolled] = useState(false);
  const [ownerGateOpen, setOwnerGateOpen] = useState(false);

  const { canProceed, missingSteps, userAge } = useHostGate();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleCreateListingClick = (e: React.MouseEvent) => {
    e.preventDefault();

    if (!isAuthenticated) {
      const isAllowed = IntentEngine.guardAction('ADD_VEHICLE', {
        redirectToUrl: '/dashboard/vehicles/new',
        reasonMessage: 'Veuillez vous connecter pour créer une annonce sur AutoLoc.',
      });
      if (!isAllowed) {
        router.push('/login');
      }
      return;
    }

    if (missingSteps.length > 0 && !canProceed) {
      setOwnerGateOpen(true);
    } else {
      router.push('/dashboard/vehicles/new');
    }
  };

  const handleOwnerGateAllCompleted = () => {
    setOwnerGateOpen(false);
    router.push('/dashboard/vehicles/new');
  };

  return (
    <>
      <header className="pointer-events-none fixed inset-x-0 top-[calc(0.75rem+env(safe-area-inset-top))] sm:top-3 z-50 flex justify-center px-3 sm:px-6">

        <div
          className={`
            pointer-events-auto flex w-full max-w-6xl items-center justify-between gap-6
            rounded-full border py-2.5 pl-6 pr-2.5
            transition-all duration-300
            ${scrolled
              ? 'border-slate-900/15 bg-white/95 shadow-xl shadow-slate-950/10 backdrop-blur-xl'
              : 'border-slate-200/80 bg-white/90 shadow-lg shadow-slate-950/5 backdrop-blur-xl'}
          `}
        >
          {/* Logo */}
          <Link
            href="/"
            className="relative h-9 w-32 shrink-0 rounded-sm focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#0A3D2E]"
          >
            <Image
              src="/logo.png"
              alt="AutoLoc"
              fill
              priority
              sizes="128px"
              className="object-contain object-left"
            />
          </Link>

          {/* Navigation */}
          <nav aria-label="Navigation principale" className="flex items-center gap-1">
            <NavItem href="/">Accueil</NavItem>
            <NavItem href="/vehicles">Explorer</NavItem>
            {isAuthenticated && <NavItem href="/reservations">Réservations</NavItem>}
            <NavItem href="/contact">Contact</NavItem>
          </nav>

          {/* Actions */}
          <div className="flex shrink-0 items-center gap-3">
            <Link
              href="/dashboard/vehicles/new"
              onClick={handleCreateListingClick}
              className="rounded-full bg-[#0A3D2E] px-5 py-2.5 text-sm font-semibold text-[#F1DFB6] transition-all hover:bg-[#0F4F3B] hover:shadow-lg hover:shadow-[#0A3D2E]/20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0A3D2E]"
            >
              Créer une annonce
            </Link>

            {isAuthenticated && user ? (
              <div className="pr-1">
                <UserProfileDropdown user={user} />
              </div>
            ) : (
              <Link
                href={
                  pathname && pathname !== '/' && !pathname.startsWith('/login') && !pathname.startsWith('/register')
                    ? `/login?next=${encodeURIComponent(pathname)}`
                    : '/login'
                }
                className="rounded-full border border-slate-900/15 bg-[#FFFFFF] px-5 py-2.5 text-sm font-semibold text-slate-900 transition-colors hover:border-[#0A3D2E]/50 hover:bg-[#0A3D2E]/[0.04] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0A3D2E]"
              >
                Se connecter
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Modale Host / Owner Gate */}
      <ReservationGateModal
        visible={ownerGateOpen}
        mode="OWNER"
        missingSteps={missingSteps}
        userAge={userAge}
        onClose={() => setOwnerGateOpen(false)}
        onAllCompleted={handleOwnerGateAllCompleted}
      />
    </>
  );
};