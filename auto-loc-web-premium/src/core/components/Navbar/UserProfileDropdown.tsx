'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import {
  LayoutDashboard,
  Calendar,
  LogOut,
  ChevronDown,
  ShieldCheck,
  Clock,
  AlertCircle,
} from 'lucide-react';
import { useUserStore } from '../../store/useUserStore';
import { UserProfile } from '../../../types/user';

/*
 * Palette : vert forêt #0A3D2E, champagne #F1DFB6
 */

interface UserProfileDropdownProps {
  user: UserProfile;
}

const Avatar: React.FC<{ user: UserProfile; size: 'sm' | 'md' }> = ({ user, size }) => {
  const initials =
    ((user.prenom?.[0] || '') + (user.nom?.[0] || '')).toUpperCase() || 'U';

  return (
    <div
      className={`flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#0A3D2E] font-semibold text-[#F1DFB6] ${size === 'sm' ? 'h-8 w-8 text-xs' : 'h-11 w-11 text-sm'
        }`}
    >
      {user.avatarUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={user.avatarUrl}
          alt={`${user.prenom} ${user.nom}`}
          className="h-full w-full object-cover"
        />
      ) : (
        <span>{initials}</span>
      )}
    </div>
  );
};

const menuItemClass =
  'group flex w-full items-center gap-3 rounded-xl px-2 py-2 text-left text-[13px] font-medium transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-[#0A3D2E]';

export const UserProfileDropdown: React.FC<UserProfileDropdownProps> = ({ user }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const logout = useUserStore((s) => s.logout);
  const switchRole = useUserStore((s) => s.switchRole);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsOpen(false);
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const renderKycBadge = () => {
    switch (user.statutKyc) {
      case 'VERIFIE':
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#0A3D2E]/[0.08] px-2.5 py-0.5 text-[11px] font-semibold text-[#0A3D2E]">
            <ShieldCheck className="h-3.5 w-3.5" />
            Vérifié
          </span>
        );
      case 'EN_ATTENTE':
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-0.5 text-[11px] font-semibold text-amber-700">
            <Clock className="h-3.5 w-3.5" />
            En attente
          </span>
        );
      case 'REJETE':
      case 'NON_VERIFIE':
      default:
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-50 px-2.5 py-0.5 text-[11px] font-semibold text-rose-700">
            <AlertCircle className="h-3.5 w-3.5" />
            Non vérifié
          </span>
        );
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Déclencheur : pilule avec avatar rond */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Menu du compte"
        aria-expanded={isOpen}
        aria-haspopup="true"
        className={`
          flex h-10 items-center gap-2 rounded-full border pl-1 pr-3
          transition-colors duration-200
          focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0A3D2E]
          ${isOpen
            ? 'border-[#0A3D2E]/40 bg-[#0A3D2E]/[0.04]'
            : 'border-slate-900/10 bg-white hover:border-[#0A3D2E]/40'}
        `}
      >
        <Avatar user={user} size="sm" />
        <span className="hidden max-w-[100px] truncate text-[13px] font-semibold text-slate-800 md:inline-block">
          {user.prenom || 'Mon compte'}
        </span>
        <ChevronDown
          className={`h-3.5 w-3.5 text-slate-500 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''
            }`}
        />
      </button>

      {/* Menu */}
      {isOpen && (
        <div className="absolute right-0 z-50 mt-3 w-72 rounded-3xl border border-slate-900/10 bg-white p-2 shadow-[0_20px_50px_-16px_rgba(15,23,42,0.3)] animate-in fade-in slide-in-from-top-2 duration-200">
          {/* En-tête profil */}
          <div className="mb-1 flex items-center gap-3 border-b border-slate-100 px-2 pb-3 pt-2">
            <Avatar user={user} size="md" />
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-slate-900">
                {user.prenom} {user.nom}
              </p>
              <p className="mb-1.5 truncate text-xs text-slate-500">{user.email}</p>
              {renderKycBadge()}
            </div>
          </div>

          {/* Navigation */}
          <div className="space-y-0.5">
            {user.role === 'PROPRIETAIRE' || (user.vehiculesCount && user.vehiculesCount > 0) ? (
              <Link
                href="/dashboard"
                onClick={() => setIsOpen(false)}
                className={`${menuItemClass} text-slate-700 hover:bg-slate-900/[0.04] hover:text-slate-900`}
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#0A3D2E]/[0.07] text-[#0A3D2E]">
                  <LayoutDashboard className="h-4 w-4" />
                </span>
                <span className="font-semibold">Mon Espace Hôte</span>
              </Link>
            ) : (
              <Link
                href="/dashboard"
                onClick={() => {
                  setIsOpen(false);
                  switchRole('PROPRIETAIRE');
                }}
                className={`${menuItemClass} text-slate-700 hover:bg-slate-900/[0.04] hover:text-slate-900`}
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-100 text-emerald-800">
                  <LayoutDashboard className="h-4 w-4 text-emerald-700" />
                </span>
                <div className="flex flex-col">
                  <span className="font-bold text-slate-900">Devenir Hôte</span>
                  <span className="text-[11px] text-slate-500 font-normal">Rentabiliser ma voiture</span>
                </div>
              </Link>
            )}

            <Link
              href="/reservations"
              onClick={() => setIsOpen(false)}
              className={`${menuItemClass} text-slate-700 hover:bg-slate-900/[0.04] hover:text-slate-900`}
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#0A3D2E]/[0.07] text-[#0A3D2E]">
                <Calendar className="h-4 w-4" />
              </span>
              <span>Mes réservations</span>
            </Link>

            <div className="mx-2 my-1.5 border-t border-slate-100" />

            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                logout();
              }}
              className={`${menuItemClass} text-rose-600 hover:bg-rose-50`}
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-rose-50 text-rose-600 transition-colors group-hover:bg-rose-100">
                <LogOut className="h-4 w-4" />
              </span>
              <span>Se déconnecter</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};