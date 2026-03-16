'use client';

import { useEffect, useState } from 'react';

/**
 * Returns whether the logged-in user has at least one vehicle.
 * null  = still loading
 * true  = at least one vehicle exists → show "Espace hôte"
 * false = no vehicles             → show "Devenir hôte"
 */
export function useHasVehicles(loggedIn: boolean): boolean | null {
    const [hasVehicles, setHasVehicles] = useState<boolean | null>(null);

    useEffect(() => {
        if (!loggedIn) {
            setHasVehicles(null);
            return;
        }

        let cancelled = false;

        fetch('/api/nest/vehicles/me', { credentials: 'include' })
            .then((res) => {
                if (!res.ok) return null;
                return res.json() as Promise<unknown[]>;
            })
            .then((data) => {
                if (cancelled) return;
                setHasVehicles(Array.isArray(data) && data.length > 0);
            })
            .catch(() => {
                if (!cancelled) setHasVehicles(false);
            });

        return () => { cancelled = true; };
    }, [loggedIn]);

    return hasVehicles;
}
