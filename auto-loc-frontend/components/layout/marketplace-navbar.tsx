'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Car } from 'lucide-react';
import { supabase } from '../../lib/supabase/client';
import { useNestToken } from '../../features/auth/hooks/use-nest-token';
import { UserMenu } from './user-menu';

export function MarketplaceNavbar() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const { activeRole } = useNestToken();

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setLoggedIn(Boolean(data.session?.access_token));
      setHydrated(true);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setLoggedIn(Boolean(session?.access_token));
    });

    return () => subscription.unsubscribe();
  }, []);

  /* Rien à afficher si l'utilisateur n'est pas connecté ou si c'est un propriétaire */
  if (hydrated && (!loggedIn || activeRole === 'PROPRIETAIRE')) return null;

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-gray-900 rounded-lg flex items-center justify-center">
            <Car className="w-4 h-4 text-emerald-400" />
          </div>
          <span className="autoloc-hero text-xl text-gray-900">
            Auto<em>Loc</em>
          </span>
        </Link>

        {/* Skeleton pendant l'hydratation */}
        {!hydrated && (
          <div className="w-48 h-8 bg-gray-100 rounded-lg animate-pulse" />
        )}

        {/* Menu utilisateur — affiché uniquement si connecté */}
        {hydrated && loggedIn && (
          <UserMenu isOwner={activeRole === 'PROPRIETAIRE'} />
        )}

      </div>
    </header>
  );
}
