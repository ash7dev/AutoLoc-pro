'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import {
  CalendarDays,
  Settings,
  LogOut,
  ChevronDown,
  User,
  Loader2,
  Car,
} from 'lucide-react';
import { useSignOut } from '../../features/auth/hooks/use-signout';
import { apiFetch, ApiError } from '../../lib/nestjs/api-client';
import type { ProfileResponse } from '../../lib/nestjs/auth';

interface UserMenuProps {
  isOwner: boolean;
}

export function UserMenu({ isOwner }: UserMenuProps) {
  const [open, setOpen] = useState(false);
  const [hasVehicles, setHasVehicles] = useState<boolean | null>(null);
  const ref = useRef<HTMLDivElement>(null);
  const { signOut, loading: signingOut } = useSignOut();

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  useEffect(() => {
    let active = true;
    const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

    async function loadProfile() {
      for (let i = 0; i < 3; i += 1) {
        try {
          const profile = await apiFetch<ProfileResponse>('/auth/me');
          if (!active) return;
          setHasVehicles(Boolean(profile.hasVehicles));
          return;
        } catch (err) {
          if (err instanceof ApiError && err.status === 401) {
            await wait(200);
            continue;
          }
          break;
        }
      }
      if (active) setHasVehicles(false);
    }

    void loadProfile();
    return () => { active = false; };
  }, []);

  return (
    <div className="flex items-center gap-3">

      {/* CTA contextuel */}
      {(!isOwner && hasVehicles === null) ? (
        <button
          type="button"
          disabled
          className="autoloc-body text-sm font-semibold bg-gray-900 text-white px-4 py-2 rounded-xl flex items-center gap-2 opacity-80"
        >
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
          Chargement...
        </button>
      ) : (isOwner || hasVehicles) ? (
        <Link
          href="/dashboard/owner"
          className="autoloc-body text-sm font-semibold bg-gray-900 text-white px-4 py-2 rounded-xl hover:bg-gray-700 transition-all duration-150 flex items-center gap-1.5"
        >
          <Car className="w-3.5 h-3.5 text-emerald-400" />
          Espace hôte
        </Link>
      ) : (
        <Link
          href="/become-owner"
          className="autoloc-body text-sm font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-4 py-2 rounded-xl transition-all duration-150"
        >
          Devenir hôte
        </Link>
      )}

      {/* Avatar + dropdown */}
      <div className="relative" ref={ref}>
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className="flex items-center gap-1.5 p-1.5 rounded-xl hover:bg-gray-100 transition-all duration-150"
          aria-label="Menu utilisateur"
        >
          <div className="w-8 h-8 rounded-lg bg-gray-900 flex items-center justify-center">
            <User className="w-4 h-4 text-gray-100" />
          </div>
          <ChevronDown
            className={`w-3.5 h-3.5 text-gray-400 transition-transform duration-150 ${open ? 'rotate-180' : ''}`}
          />
        </button>

        {open && (
          <div className="absolute right-0 top-full mt-2 w-52 bg-white border border-gray-100 rounded-2xl shadow-lg overflow-hidden py-1.5">

            <Link
              href="/reservations"
              onClick={() => setOpen(false)}
              className="autoloc-body flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-all duration-150"
            >
              <CalendarDays className="w-4 h-4 text-gray-400 flex-shrink-0" />
              Mes réservations
            </Link>

            <Link
              href="/dashboard/settings"
              onClick={() => setOpen(false)}
              className="autoloc-body flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-all duration-150"
            >
              <Settings className="w-4 h-4 text-gray-400 flex-shrink-0" />
              Paramètres
            </Link>

            <div className="my-1 border-t border-gray-100" />

            <button
              type="button"
              onClick={() => { setOpen(false); signOut(); }}
              disabled={signingOut}
              className="autoloc-body w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-all duration-150 disabled:opacity-50"
            >
              {signingOut
                ? <Loader2 className="w-4 h-4 animate-spin flex-shrink-0" />
                : <LogOut className="w-4 h-4 flex-shrink-0" />
              }
              Déconnexion
            </button>

          </div>
        )}
      </div>
    </div>
  );
}
