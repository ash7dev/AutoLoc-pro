'use client';

import React, { useEffect, useId, useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import {
  ChevronDown,
  User,
  LogOut,
  ArrowLeftRight,
  Plus,
  MessageCircle,
} from 'lucide-react';
import { useUserStore } from '../../../core/store/useUserStore';
import { UserProfile } from '../../../types/user';
import { useHostGate } from '../../owner/hooks/useHostGate';
import { ReservationGateModal } from '../../reservations/components/ReservationGateModal';

import { OwnerMobileBottomNav } from './OwnerMobileBottomNav';

/**
 * Numéro WhatsApp du support au format international sans "+" (ex: 221770000000).
 * Si la variable n'est pas définie, le lien d'aide n'est pas affiché.
 */
const SUPPORT_WHATSAPP = process.env.NEXT_PUBLIC_SUPPORT_WHATSAPP;

const focusRing =
  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0A3D2E]';

const menuItem = `flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-xs font-semibold transition-colors disabled:cursor-wait disabled:opacity-60 ${focusRing}`;

const Avatar: React.FC<{ user: UserProfile | null }> = ({ user }) => {
  const initials = user
    ? ((user.prenom?.[0] || '') + (user.nom?.[0] || '')).toUpperCase() || 'P'
    : 'P';

  return (
    <div className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#0A3D2E] font-semibold text-[#F1DFB6] text-xs">
      {user?.avatarUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={user.avatarUrl}
          alt={user.prenom || 'Propriétaire'}
          className="h-full w-full object-cover"
        />
      ) : (
        <span>{initials}</span>
      )}
    </div>
  );
};

interface OwnerNavbarProps {
  /** Nombre de demandes de réservation en attente de réponse (badge sur « Réservations »). */
  pendingReservationsCount?: number;
}

type PendingAction = 'switch' | 'logout' | null;

export const OwnerNavbar: React.FC<OwnerNavbarProps> = ({
  pendingReservationsCount = 0,
}) => {
  const pathname = usePathname() ?? '';
  const router = useRouter();

  const [isOpen, setIsOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<PendingAction>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelId = useId();

  const user = useUserStore((s) => s.user);
  const isAuthenticated = useUserStore((s) => s.isAuthenticated);
  const switchRole = useUserStore((s) => s.switchRole);
  const logout = useUserStore((s) => s.logout);

  const { canProceed, missingSteps, userAge } = useHostGate();
  const [isGateOpen, setIsGateOpen] = useState(false);

  const handleAddVehicleClick = (e: React.MouseEvent) => {
    e.preventDefault();

    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    if (!canProceed && missingSteps.length > 0) {
      setIsGateOpen(true);
    } else {
      router.push('/dashboard/vehicles/new');
    }
  };

  // Ferme le menu à chaque changement de page
  useEffect(() => {
    setIsOpen(false);
    setActionError(null);
  }, [pathname]);

  // Écouteurs globaux uniquement quand le menu est ouvert
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
        triggerRef.current?.focus();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const toggleMenu = () => {
    setIsOpen((open) => !open);
    setActionError(null);
  };

  const handleSwitchToRenter = async () => {
    if (pendingAction) return;
    setActionError(null);
    setPendingAction('switch');
    try {
      await switchRole('LOCATAIRE');
      setIsOpen(false);
      router.push('/');
    } catch {
      setActionError('Impossible de passer en mode locataire. Réessayez.');
    } finally {
      setPendingAction(null);
    }
  };

  const handleLogout = async () => {
    if (pendingAction) return;
    setActionError(null);
    setPendingAction('logout');
    try {
      await logout();
      setIsOpen(false);
      router.push('/');
    } catch {
      setActionError('La déconnexion a échoué. Réessayez.');
    } finally {
      setPendingAction(null);
    }
  };

  const navItems = [
    { label: "Aujourd'hui", href: '/dashboard', badge: 0 },
    { label: 'Réservations', href: '/dashboard/reservations', badge: pendingReservationsCount },
    { label: 'Véhicules', href: '/dashboard/vehicles', badge: 0 },
    { label: 'Revenus', href: '/dashboard/wallet', badge: 0 },
  ];

  const isReservationDetailPage = /^\/dashboard\/reservations\/[^/]+/.test(pathname);
  const isVehicleDetailPage = /^\/dashboard\/vehicles\/[^/]+/.test(pathname);
  const isReservationsPage = pathname.startsWith('/dashboard/reservations');
  const isVehiclesPage = pathname.startsWith('/dashboard/vehicles');
  const hideHeaderOnMobile = isReservationsPage || isVehiclesPage;
  const hideBottomNavOnMobile = isReservationDetailPage || isVehicleDetailPage;

  return (
    <>
      <header className="sticky top-2 sm:top-3 z-40 w-full px-2.5 sm:px-6 lg:px-8 pointer-events-none">
        <div className="pointer-events-auto mx-auto flex h-14 sm:h-16 max-w-7xl items-center justify-between rounded-full border border-slate-900/10 bg-white px-3 sm:px-4 shadow-lg shadow-slate-950/5 lg:px-8">
          {/* Logo à gauche */}
          <Link
            href="/dashboard"
            className={`relative h-9 w-28 shrink-0 rounded-sm lg:w-32 ${focusRing} focus-visible:outline-offset-4`}
          >
            <Image
              src="/logo.png"
              alt="AutoLoc Premium"
              fill
              priority
              sizes="128px"
              className="object-contain object-left"
            />
          </Link>

          {/* Navigation centrale Desktop (Onglets) */}
          <nav
            aria-label="Navigation espace propriétaire"
            className="hidden md:flex items-center gap-1"
          >
            {navItems.map((item) => {
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
                  className={`
                    inline-flex items-center rounded-full px-3 py-2 text-sm font-medium transition-colors duration-200 lg:px-4
                    ${focusRing}
                    ${isActive
                      ? 'bg-[#0A3D2E] text-[#F1DFB6] font-semibold shadow-sm'
                      : 'text-slate-600 hover:bg-slate-900/[0.05] hover:text-slate-900'}
                  `}
                >
                  {item.label}
                  {hasBadge && (
                    <span
                      aria-hidden="true"
                      className={`ml-2 inline-flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[11px] font-bold ${isActive
                          ? 'bg-[#F1DFB6] text-[#0A3D2E]'
                          : 'bg-[#0A3D2E] text-[#F1DFB6]'
                        }`}
                    >
                      {item.badge > 99 ? '99+' : item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Actions à droite */}
          <div className="flex items-center gap-3">
            {/* CTA principal : ajouter un véhicule
                <sm : « Ajouter » · sm→md : libellé complet · md→lg : icône seule · lg+ : libellé complet */}
            <Link
              href="/dashboard/vehicles/new"
              onClick={handleAddVehicleClick}
              aria-label="Ajouter un véhicule"
              className={`inline-flex items-center justify-center gap-1.5 rounded-full bg-[#F1DFB6] px-3.5 py-2 text-xs font-semibold text-[#0A3D2E] ring-1 ring-inset ring-[#0A3D2E]/15 transition-colors hover:bg-[#EBD49A] sm:px-5 sm:py-2.5 sm:text-sm md:p-2.5 lg:px-5 lg:py-2.5 ${focusRing}`}
            >
              <Plus className="h-4 w-4" aria-hidden="true" />
              <span className="sm:hidden">Ajouter</span>
              <span className="hidden sm:inline md:hidden lg:inline">Ajouter un véhicule</span>
            </Link>

            {/* Icône Profil & Dropdown */}
            <div className="relative" ref={containerRef}>
              <button
                ref={triggerRef}
                type="button"
                onClick={toggleMenu}
                aria-label="Menu du compte propriétaire"
                aria-expanded={isOpen}
                aria-controls={panelId}
                className={`
                  flex h-10 items-center gap-2 rounded-full border pl-1 pr-3 transition-colors duration-200
                  ${focusRing}
                  ${isOpen
                    ? 'border-[#0A3D2E]/40 bg-[#0A3D2E]/[0.05]'
                    : 'border-slate-900/10 bg-white hover:border-[#0A3D2E]/40'}
                `}
              >
                <Avatar user={user} />
                <span className="hidden max-w-[100px] truncate text-xs font-semibold text-slate-800 lg:inline-block">
                  {user?.prenom || 'Mon Compte'}
                </span>
                <ChevronDown
                  aria-hidden="true"
                  className={`h-3.5 w-3.5 text-slate-500 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''
                    }`}
                />
              </button>

              {/* Menu Dropdown */}
              {isOpen && (
                <div
                  id={panelId}
                  className="absolute right-0 z-50 mt-2 w-64 rounded-2xl border border-slate-900/10 bg-white p-2 shadow-xl animate-in fade-in slide-in-from-top-2 duration-150 motion-reduce:animate-none"
                >
                  {/* En-tête profil rapide */}
                  {user && (
                    <div className="mb-2 border-b border-slate-100 px-3 py-2">
                      <p className="truncate text-sm font-semibold text-slate-900">
                        {user.prenom} {user.nom}
                      </p>
                      <p className="truncate text-xs text-slate-500">{user.email}</p>
                    </div>
                  )}

                  <div className="space-y-1">
                    {/* Basculer en mode locataire */}
                    <button
                      type="button"
                      onClick={handleSwitchToRenter}
                      disabled={pendingAction !== null}
                      className={`${menuItem} text-slate-700 hover:bg-slate-100 hover:text-slate-900`}
                    >
                      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#0A3D2E]/10 text-[#0A3D2E]">
                        <ArrowLeftRight className="h-4 w-4" aria-hidden="true" />
                      </span>
                      <span>
                        {pendingAction === 'switch'
                          ? 'Changement en cours…'
                          : 'Basculer en mode locataire'}
                      </span>
                    </button>

                    {/* Profil */}
                    <Link
                      href="/dashboard/profile"
                      onClick={() => setIsOpen(false)}
                      className={`${menuItem} text-slate-700 hover:bg-slate-100 hover:text-slate-900`}
                    >
                      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-600">
                        <User className="h-4 w-4" aria-hidden="true" />
                      </span>
                      <span>Profil</span>
                    </Link>

                    {/* Aide WhatsApp (affiché si le numéro est configuré) */}
                    {SUPPORT_WHATSAPP && (
                      <a
                        href={`https://wa.me/${SUPPORT_WHATSAPP}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => setIsOpen(false)}
                        className={`${menuItem} text-slate-700 hover:bg-slate-100 hover:text-slate-900`}
                      >
                        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-600">
                          <MessageCircle className="h-4 w-4" aria-hidden="true" />
                        </span>
                        <span>Aide sur WhatsApp</span>
                      </a>
                    )}

                    <div className="my-1 border-t border-slate-100" />

                    {/* Se déconnecter */}
                    <button
                      type="button"
                      onClick={handleLogout}
                      disabled={pendingAction !== null}
                      className={`${menuItem} text-rose-600 hover:bg-rose-50 focus-visible:outline-rose-600`}
                    >
                      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-rose-100 text-rose-600">
                        <LogOut className="h-4 w-4" aria-hidden="true" />
                      </span>
                      <span>
                        {pendingAction === 'logout' ? 'Déconnexion…' : 'Se déconnecter'}
                      </span>
                    </button>

                    {actionError && (
                      <p role="alert" className="px-3 pt-1 pb-2 text-xs font-medium text-rose-600">
                        {actionError}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Modale Host Gate (Profil, SMS OTP, KYC, Permis) */}
        <ReservationGateModal
          visible={isGateOpen}
          mode="OWNER"
          missingSteps={missingSteps}
          userAge={userAge}
          onClose={() => setIsGateOpen(false)}
          onAllCompleted={() => {
            setIsGateOpen(false);
            router.push('/dashboard/vehicles/new');
          }}
        />
      </header>

      {/* Navigation Basse Mobile (Dock flottant vert forêt pour mobile, masqué sur la fiche détail réservation/véhicule) */}
      {!hideBottomNavOnMobile && <OwnerMobileBottomNav />}
    </>
  );
};