'use client';

import { useEffect, useState, useCallback } from 'react';

export interface OwnerNotificationsCount {
    pendingConfirmations: number;
    pendingLitiges: number;
    total: number;
}

const POLL_INTERVAL_MS = 30_000;

export function useOwnerNotifications(): OwnerNotificationsCount | null {
    const [counts, setCounts] = useState<OwnerNotificationsCount | null>(null);

    const fetchCounts = useCallback(async () => {
        try {
            const res = await fetch('/api/nest/reservations/owner/notifications', {
                credentials: 'include',
            });
            if (!res.ok) return;
            const data: OwnerNotificationsCount = await res.json();
            setCounts(data);
        } catch {
            // silently ignore — badge is best-effort
        }
    }, []);

    useEffect(() => {
        fetchCounts();
        const id = setInterval(fetchCounts, POLL_INTERVAL_MS);
        return () => clearInterval(id);
    }, [fetchCounts]);

    return counts;
}
