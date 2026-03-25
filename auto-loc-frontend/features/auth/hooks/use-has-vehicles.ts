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
            .then(async (res) => {
                if (!res.ok) return;
                const data = await res.json() as unknown[];
                if (cancelled) return;
                setHasVehicles(Array.isArray(data) && data.length > 0);
            })
            .catch(() => { /* réseau indisponible : on garde null (loading) */ });

        return () => { cancelled = true; };
    }, [loggedIn]);

    return hasVehicles;
}
